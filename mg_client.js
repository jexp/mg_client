var triggers = {};	
	
function addTrigger(id,trigger) {
	triggers[id] = trigger;
}

// todo besseres handling, trigger auf uspruengliche zeile und delta's verwalten (aenderungen an zeile)
// verwaltung von prios, fall-thru und farb/style infos in separatem kanal halten
function runTriggers(line) { 
	for (name in triggers) {
		line = triggers[name](line);
	}
	return line;
}
function trigger_update(regexp, fun) {
	return function(line) {
	    var match=line.match(regexp);
	    if (match!=null) {
		  match.shift(); // remove first match
		  return fun.apply(this,match);
	    }
	    return line;
	}
}

function collect(start,end, fun) { // todo objekt, mit start/end ausschluss, gag
	var collected = null;
	return function(line) {
		if (line.match(start)) {
			collected = "";
		} 
		if (collected != null) {
			collected += line + "\n";
		}
		if (line.match(end)) {
			if (collected != null && collected.length > 0) {
				fun(collected);
			}
			collected = null;
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

var scripts = {}

function addScript(name, script) {
	scripts[name] = script;
	storeData(name, "(function() { return "+script+ "; })");
}

function removeScript(name) {
	scripts[name] = null;
	removeData(name);
}

function editScript(name) {
	getScript(name, function(script) {
		console.log("edit-script "+script);
		edit_name = name;
		$("#script_editor").text(script.toString()).dialog("open");
	});
}

function scriptDialog(id,content) {
	var select = $("#script_dialog select")
	$("#script_dialog input[type=text]").val(edit_name)
	$("#script_dialog input[type=submit]").val(id == "edit" ? "Edit" : "Save")
	select.empty()
	getIndex(function(index) {
		$.each(index, function(idx,value) {   
	       var option = $('<option>', { value : value }).appendTo(select).text(value); 
		   if (value == edit_name) { option.attr("selected","selected") }
		})});
	if (id != "edit") {
		edit_content = content;
	} else {
		edit_content = null;
	}
	console.log("saveCallback "+edit_name+" content: "+edit_content)
	$("#script_dialog").show().dialog();
}

function getScript(name, fun) {
	if (!scripts[name]) {
		loadData(name, function(data) {
			console.log("get-script "+data);
			if (data==null) {
				fun(function() {});
				return;
			}
			try {
				scripts[name]=eval(data)();
				fun(scripts[name]);
			} catch(e) {
				console.log("Error loading stored script "+name+" "+data);
				scripts[name]=function() {}
				fun(scripts[name]);
			}
		})
	} else {
		fun(scripts[name]);
	}
}
function runScript() { // name, params = Array ?
	var args = Array.prototype.slice.call(arguments);
	var name = args.shift();
	getScript(name, function(script) {
		try {
			script.apply(this,args);
		} catch(e) {
			console.log("Error running stored script "+name+" "+data)
		}
	})
}

function highlight(trigger) {
	return function(line) {
		return line.replace(trigger.trigger, function (text) {
			var span = $("<span>");
			if (trigger.style!=null) { span.css(trigger.style); }
			if (trigger.click!=null) { span.click(trigger.click(text)); }
			if (trigger.dblclick!=null) { span.dblclick(trigger.dblclick(text));}
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
   return new_name ? new_name : selected_name ? selected_name : null
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