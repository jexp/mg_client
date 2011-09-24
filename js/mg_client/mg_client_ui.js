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
	$("#"+name).css("max-height",300) // css("overflow-y","auto").css("overflow-x","auto")
}
function addWindow(id,w) {
	var div = $("<div></div>").attr("id",id).append("<ul>").appendTo("body").css("width","580px")
	.css("right","100px").css("top",window_top_offset() + "px").css("position","absolute")
	div.tabs({ panelTemplate : "<pre style='overflow-x:hidden;overflow-y:auto;'></pre>" });
	
	for (name in w) {
		var tab=w[name];
        addTab(id, name, tab)
	}
	makeTabWindow(div);
	var menue = $("<a>").appendTo($("#nav_mud"))
	menue.click(function() { $('#'+id).toggle(); return false; }).text(id).attr("href","#");
	return div
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
function makeTabWindow(d) {
	d.resizable().draggable({handle:'ul', scroll:false });
	add_close_button(d);
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
	for (var i=0;i<lines.length;i++) {
		var line = lines[i].replace(/\r+/,"");
	    var result = enrich(line);
	    if (result!=null) {
		  $('#out').append(result+"\n");
		}
	};
	scrollBottom("mgbox");
}

var password = false

function handleWord(fun) {
	return function(e) {
		var element = jQuery.elementFromPoint(e.clientX,e.clientY);
		if (!element || element.nodeName != "SPAN") return;
		element = $(element);
		var param = element.text();
		console.log(element);
		console.log(param);
		if (!param) return;
		fun(e, param);
	}
}


function showPopup(pos, param, actions) {
	popup = $('#popup')
	if (!popup.length) {
	  popup = $("<div id='popup'/>").attr("id","popup").css({"background-color":"lightgray","border":"1px solid black"}).appendTo($('body')); //.dialog({autoOpen:false});
	  popup.mouseleave(function() { popup.hide(); });
	  popup.mouseup(function() { popup.hide(); });
	}
	// popup.dialog("options","title",title);
	popup.empty();
	for (var i=0;i<actions.length;i++) {
	  var a=actions[i]
	  add_button({label : a.label, action: (a.action||"").replace("#",param), fun : a.fun, separator: a.separator },"popup");	
	}
	// popup.dialog("options", "position", pos).dialog("open")
	popup.css({position:"absolute",left:pos[0],top:pos[1]});
	popup.show();
	// move mouse inside popup
}

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
		console.log("send: "+str);
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

function handleButton(button) {
	if (button.fun) { 
		button.fun.call(this); 
	} else { 
		send(button.action||button.label); 
	}
}

function add_button(button, target) {
	if (!target) target = "toolbar";
	if (button.separator == "newline") {
		$("#"+target).append("<br/>")
	} else {
		var b=$('<button>').appendTo($("#"+target));
		b.css({"min-width":50}).text(button.label); // .attr("id","b_"+button.label)
		b.button().click(function() {handleButton(button)});
	}
}

function window_top_offset() {
 	return $("#nav_mud").children().size() * 85;
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

function addBox(id,title,autoOpen,menu) {
	var box=$('<pre>');
	box.appendTo("body").attr("id",id).css("overflow-x","hidden").css("overflow-y", "auto")
	.dialog({ title: title, position : ["right",window_top_offset()], width : 500, height : 200, autoOpen: autoOpen==null ? false : autoOpen });

	var menue = $("<a>").appendTo($("#" + ( menu ||"nav_mud")))
	menue.click(function() { toggleDialog(id); return false; }).text(title).attr("href","#");
	return box;
}

function toggleDialog(id) {
	var d =$('#'+id)
	d.dialog(d.is(":visible") ? 'close' : 'open'); 
}
