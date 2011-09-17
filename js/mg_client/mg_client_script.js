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
//			console.log("get-script "+data);
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