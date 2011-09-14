var triggers = {};	
	
function addTrigger(id, trigger) {
	triggers[id] = trigger;
}
function addTriggers(id, actions) {
	addTrigger(id, function(line) {
		for (var i=0;i<actions.length;i++) {
			line = actions[i](line);
		}
		return line;
	});
}

// todo besseres handling, trigger auf uspruengliche zeile und delta's verwalten (aenderungen an zeile)
// verwaltung von prios, fall-thru und farb/style infos in separatem kanal halten
function runTriggers(line) { 
	if (!line) return line;
	for (name in triggers) {
		line = triggers[name](line);
		if (!line) return line;
	}
	return line;
}

function trigger_update(regexp, fun) {
	return function(line) {
	    var match=line.match(regexp);
	    if (match!=null) {
		  match.shift(); // remove first match
		  fun.apply(this,match);
	    }
	    return line;
	}
}

PROMPT = /^\S*>\s*$/
function collect(trigger) { // todo objekt, mit start/end ausschluss, gag
	var collected = null;
	trigger.end = trigger.end || PROMPT;
	return function(line) {
		if (line.match(trigger.start)) {
			collected = [];
			if (trigger.addStart) {
				collected.push(line);
			}
		} else if (line.match(trigger.end)) {
				if (trigger.addEnd) {
					collected.push(line);
				}
				if (collected && collected.length > 0) {
//					console.log("collect "+trigger.fun.toString()+" "+collected);
					trigger.fun(collected.join("\n"),collected);
				}
				collected = null;
		} else if (collected) {
			collected.push(line);
		}
		return line;
	}
}

function grab_single(regexp, fun) {
	return function(line) {
		if (line.match(regexp)) {
			fun(line + "\n");
		}
		return line;
	}
}
var hooks = { send : { script : hookScript, multi_commands : multiCommands } }

function multiCommands(input) {
	if (input.match(/;/)) {
		var commands = input.split(/;/);
		console.log("commands")
		for (i=0;i<commands.length;i++) {
			server.send(commands[i]+"\n");
		}
		return null;
	}
	return input;
}
function addHook(type, name, hook) {
	if (!hooks[type]) {
		hooks[type]={};
	}
	hooks[type][name.toLowerCase()]=hook;
}

function removeHook(type, name) {
	if (!hooks[type]) return;
	hooks[type][name.toLowerCase()]=null;
}

// todo rather a separate alias list?
function addExpandHook(name, match, expand) {
	addHook("send",name, function(input) {
		if (input.match(match)) return expand; // todo parameter substitution
	})
}

function hookScript(input) {
	var match = input.match(/^\/(\w+)\s*/)
	console.log(match)
	if (match) {
		if (hasScript(match[1])) {
			input = input.substring(1);
			args = input.split(/\s+/);
			console.log("hookScript apply "+args)
			return runScript.apply(this,args)
		}
		return null; // scripts not sent to server
	}
	return input;
}

function runHooks(type, data) {
	var h=hooks[type];
	if (!h) return data;
	for (name in h) {
		if (h[name]) {
			console.log("running hook "+name+" with "+data);
			data = h[name](data)
			if (!data) return null; // todo handle fallthrough etc
		}
	}
	return data;
}

var scripts = {}

function addScript(name, script) {
	if (!name) return;
	name = name.toLowerCase()
	scripts[name] = script;
	storeData(name, "(function() { return "+script+ "; })", true);
}

function loadScript(name) {
	if (!name) return;
	name = name.toLowerCase()
	getScript(name, function(name, script) { 
		if (script!=null) {
			console.log("loaded "+name)
		}
	})
}

function hasScript(name) {
	if (!name) return false;
	name = name.toLowerCase()
	return scripts[name] != null;
}

function loadAllScripts() {
	getIndex(function(index) {
		for (i=0;i<index.length;i++) {
			loadScript(index[i])
		}
	})
}

function removeScript(name) {
	if (!name) return;
	name = name.toLowerCase()
	scripts[name] = null;
	removeData(name);
}

function editScript(name) {
	name = name.toLowerCase()
	getScript(name, function(name, script) {
		console.log("edit-script "+name + " content "+script);
		edit_name = name;
		$("#script_editor").dialog("open");
		if (!script) {
			script = function() {}
		}
		editAreaLoader.setValue("script_editor", script.toString() )
	});
}

function scriptDialog(id,content) {
	var isSave = content != null
	var select = $("#script_dialog select")
	$("#script_dialog input[type=text]").val(isSave ? edit_name : null)
	$("#script_dialog input[type=submit]").val(isSave ? "Save" : "Edit" )
	select.empty()
	getIndex(function(index) {
		$.each(index, function(idx,value) {   
	       var option = $('<option>', { value : value }).appendTo(select).text(value); 
		   if (value == edit_name) { option.attr("selected","selected") }
		})});
	if (isSave) {
		edit_content = content;
	} else {
		edit_content = null;
	}
	console.log("saveCallback "+edit_name+" content: "+edit_content)
	$("#script_dialog").show().dialog();
}

function getScript(name, fun) {
	if (!name) return;
	name = name.toLowerCase()
	if (!scripts[name]) {
		loadData(name, function(data) {
			console.log("get-script "+data);
			if (data==null) {
				fun(name,null);
				return;
			}
			try {
				scripts[name]=eval(data)();
				fun(name, scripts[name]);
			} catch(e) {
				console.log("Error loading stored script "+name+" "+data);
				fun(name,null);
			}
		})
	} else {
		fun(name, scripts[name]);
	}
}
function runScript() { // name, params = Array ?
	var args = Array.prototype.slice.call(arguments);
	var name = args.shift();
	if (!name) return;
	name = name.toLowerCase()
	console.log("runScript "+name+" params "+args)
	getScript(name, function(name, script) {
		if (script==null) return;
		try {
			script.apply(this,args);
		} catch(e) {
			console.log("Error running stored script "+name+" "+script+"\n"+e)
		}
	})
}


function run(action,line, match,trigger) {
	var type = typeof(action)
	if (type == "string" ) return eval(action);
	if (type == "function" ) {
		var fullmatch = match.shift();
		return action.call(this, { match : fullmatch, line:line, trigger:trigger, groups : match });
	}
	if (type == "object" ) {
		for (p in action) {
			if (action.hasOwnProperty(p)) {
				Player[p]=action[p];
			}
		}
	}
}

function highlight(trigger) {
	return function(line) {
		var match=line.match(trigger.trigger);
		if (!match) return line;
		if (trigger.action) {  run(trigger.action, line, match, trigger); }
		if (!(trigger.style || trigger.click || trigger.dblclick)) return line;
		
		return line.replace(trigger.trigger, function (text) {
			var span = $("<span>");
			if (trigger.style) { span.css(trigger.style); }
			if (trigger.click) { span.click(trigger.click(text)); }
			if (trigger.dblclick) { span.dblclick(trigger.dblclick(text));}
			span.text(text);
			return span.wrap("<div>").parent().html();
		});
	}
}

var edit_name = null
var edit_content = null

function getSelectedScriptName() {
   var dialog = $("#script_dialog");
   var new_name = dialog.children("input").val()
   var selected_name = dialog.children("select").val()
   return new_name ? new_name.toLowerCase() : selected_name ? selected_name.toLowerCase() : null
}
function scriptDialogSubmit() {
   var selected_name = getSelectedScriptName();
   if (selected_name) {
	   var dialog = $("#script_dialog");
	   dialog.dialog("close");
	   console.log(" name "+selected_name+" content "+edit_content)
	   if (edit_content) {
//		$("#script_editor").dialog("close");
		addScript(selected_name,edit_content)
		edit_content = null
		edit_name = null
	  } else {
		editScript(selected_name)
	  }
   }
}