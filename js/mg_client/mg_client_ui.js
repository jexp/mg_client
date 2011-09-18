function addTab(id, name, tab) {
	$("#"+id).tabs("add","#"+name,tab["title"]);
	if (tab["trigger"]) {
		var fun = tab["fun"] || function(text) {setTabText(name,text)};
		addTrigger(name,grab_single(tab["trigger"], fun));
	}
	if (tab["start"]) {
		var end = tab["end"] ? tab["end"] : /^\S*>\s*$/;
		var fun = tab["fun"] || function(text) {setTabText(name,text)};
		addTrigger(name,collect({start:tab["start"],addStart:tab["addStart"],end:end, fun:fun}));
	}
	$("#"+name).css("overflow-y","auto").css("overflow-x","auto").css("max-height",300)
}
function addWindow(id,w) {
	var div = $("<div></div>").attr("id",id).append("<ul>").appendTo("body").css("width","550px")
	.css("right","100px").css("top",window_top_offset() + "px").css("position","absolute")
	div.tabs({ panelTemplate : "<pre></pre>" }).draggable({ scroll: false }).resizable();
	
	for (name in w) {
		var tab=w[name];
        addTab(id, name, tab)
	}
	add_close_button(div)
	var menue = $("<a>").appendTo($("#nav_sub_start"))
	menue.click(function() { $('#'+id).toggle(); return false; }).text(id).attr("href","#");
}

function showTab(id) {
	$("#"+id).parent().tabs("select","#"+id);
}

function setTabText(id, text, append) {
	if (text==null) return;
	var tab = $("#"+id)
	if (append) {
		appendTo(id,text);
	} else {
		tab.empty().append(text); 
	}
	showTab(id);
}

function appendTabText(id, text) {
	setTabText(id,text,true);
}

function appendTo(id, text) {
	if (text==null) return;
	var target = $("#"+id);
	target.append(text);
	target.prop("scrollTop", target.prop("scrollHeight") - target.height() );
}

function add_close_button(d) {
	var id="#"+d.attr("id") + "_close";
	d.tabs("add",id,"X");
	var tab=d.find("ul li a[href="+id+"]");
	tab.click(function() { d.toggle() });
	tab.parent().removeClass("ui-state-default ui-corner-top");
}

function input(text, dontSubmit) {
	$('#input').val(text);
	if (!dontSubmit) {
		sendInput();
	}
}

function beforeLine() {
   createPlayerBackup();	
}
function afterLine() {
   showPlayerIfChanged();
}
function scrollBottom(name) {
   var box = $("#"+name);
   box.prop("scrollTop", box.prop("scrollHeight") - box.height() );	
}

var lastLine = null;
function showText(text) {
	var lines=text.split(/\n/); // replace(/\r+/g,"")
	if (!lines.length) return;
	if (lastLine) {
		lines[0] = lastLine + lines[0];
		lastLine = null;
	}
	if (!lines[lines.length-1].match(/([\r>:?]\W*)$/)) {
        lastLine = lines.pop();
	}
//	console.log("lastLine: "+lastLine);
	lines.forEach(function(line) {
		line.replace(/\r+/,"");
	    var result = enrich(line);
	    if (result!=null) {
		  $('#out').append(result+"\n");
		}
	});
	scrollBottom("mgbox");
}

var password = false

function toggleInputPassword() {
	var input=$("#input");
	var pass=$("#password");
	input.hide().attr("id","password");
	pass.show().focus().attr("id","input");
	$('#form').prepend($('#input'))
	$('#hidden_form').prepend($('#password'))
	$('#input').focus().val("");
}

function handlePassword(line) {
	if (!password && line.match(/asswor/) || password) {
		toggleInputPassword();
		password = !password;
	}
	return password;
}

function send(str) {
	if (str!=null) {
		server.send(str + "\n");
	}
}

function sendInput() {
   var input=$('#input');
   var value=input.val();
   var toSend = value;
   if (!password) {
   	toSend = runHooks("send",value);
   	showText(value + "\n");
   	addToHistory(value);
   } else {
	 input.val("");
   }
   console.log("send: #"+value+"#"+toSend+"#")
   send(toSend);
   input.focus();
   input.val("");
}
KEYBOARD_LEFT = 37;
KEYBOARD_RIGHT = 39;
KEYBOARD_UP = 38;
KEYBOARD_DOWN = 40;
KEYBOARD_PAGE_UP = 33;
KEYBOARD_PAGE_DOWN = 34;
KEYBOARD_HOME = 36;

function handle_keys(e) {
	var box=$("#mgbox");
	switch (getKeyCode(e)) {
	  case KEYBOARD_DOWN : 
		input(history_next(),true);
		break;
	  case KEYBOARD_UP : 
		input(history_prev(),true);
		break;
	  case KEYBOARD_PAGE_UP : 
		box.prop("scrollTop", box.prop("scrollTop") - box.height() );
		break;
	  case KEYBOARD_PAGE_DOWN : 
		box.prop("scrollTop", box.prop("scrollTop") +  box.height() );
		break;
	}
}
function add_buttons(target,buttons) {
	for (var i=0;i<buttons.length;i++) {
		add_button(buttons[i],target);
	}
	return $('#'+target);
}

function add_button(button, target) {
	if (!target) target = "toolbar";
	if (button.separator == "newline") {
		$("#"+target).append("<br/>")
	} else {
		var b=$('<button>');
		b.attr("id","b_"+button.label).text(button.label).css({"min-width":50}).appendTo($("#"+target));
		b.button().click(function() { send(button.action||button.label); });
	}
}

function window_top_offset() {
 	return $("#nav_sub_start").children().size() * 85;
}

function getKeyCode(e) {
	if (window.event) return window.event.keyCode;
	if (e) return e.which;
	return undefined;
}

function submitEnter(field,e) {
	if (getKeyCode(e) == 13) {
		sendInput();
   		return false;
   	} else {
     	return true;
    }
}

function addBox(id,title,autoOpen) {
	var box=$('<pre>');
	box.appendTo("body").attr("id",id).css("overflow-x","hidden").css("overflow-y", "auto")
	.dialog({ title: title, position : ["right",window_top_offset()], width : 500, height : 200, autoOpen: autoOpen==null ? false : autoOpen });

	var menue = $("<a>").appendTo($("#nav_sub_start"))
	menue.click(function() { $('#'+id).dialog('open'); return false; }).text(title).attr("href","#");
	return box;
}

function addCompass() {
   add_buttons("compass",[{label:"nw"},{label:"n"},{label:"no"},{label:"ob"},{separator:"newline"},
                          {label:"w"},{label:"schau"},{label:"o"},{label:"u"},{separator:"newline"},
                          {label:"sw"},{label:"s"},{label:"so"},{label:"raus"}]);
}