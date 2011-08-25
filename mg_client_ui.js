function addWindow(id,w) {
	var div = $("<div></div>").attr("id",id).append("<ul>").appendTo("body").css("width","550px")
	.css("right","100px").css("top",window_top_offset() + "px").css("position","absolute")
	div.tabs({ panelTemplate : "<pre></pre>" }).draggable().resizable();
	
	for (name in w) {
		var tab=w[name];
		div.tabs("add","#"+name,tab["title"]);

		if (w[name]["trigger"]) {
			var fun = w[name]["fun"] || function(text) {setTabText(name,text)};
			addTrigger(name,grab_single(w[name]["trigger"], fun));
		}
		if (w[name]["start"]) {
			var end = w[name]["end"] ? w[name]["end"] : /^\S*>\s*$/;
			var fun = w[name]["fun"] || function(text) {setTabText(name,text)};
			addTrigger(name,collect(w[name]["start"],end, fun));
		}
	}
	add_close_button(div)
	var menue = $("<a>").appendTo($("#nav_sub_start"))
	menue.click(function() { $('#'+id).toggle(); return false; }).text(id).attr("href","#");
}

function setTabText(id, text, append) {
	if (text==null) return;
	var tab = $("#"+id)
	if (append) {
		appendTo(id,text);
	} else {
		tab.empty().append(text); 
	}
	tab.parent().tabs("select","#"+id);
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
	if (dontSubmit == null || dontSubmit==true) {
		$('#form').submit();
	}
}

function scrollBottom(name) {
   var box = $("#"+name);
   box.prop("scrollTop", box.prop("scrollHeight") - box.height() );	
}
function showText(text) {
	var lines=text.split(/\r\n/);
	lines.forEach(function(line) {
	    var result = enrich(line);
	    if (result!=null) {
		  $('#out').append(result+"\n");
		}
	});
	scrollBottom("mgbox");
}

function sendInput() {
   var input=$('#input')
   var value=input.val() + "\n";
	 showText(value);
	 addToHistory(value);
     server.send(value);
	 input.focus();
     input.select();
}
const KEYBOARD_LEFT = 37;
const KEYBOARD_RIGHT = 39;
const KEYBOARD_UP = 38;
const KEYBOARD_DOWN = 40;
const KEYBOARD_PAGE_UP = 33;
const KEYBOARD_PAGE_DOWN = 34;
const KEYBOARD_HOME = 36;

function handle_keys(e) {
	var box=$("#mgbox");
	switch (e.keyCode) {
	  case KEYBOARD_DOWN : 
		input(history_next(),false);
		break;
	  case KEYBOARD_UP : 
		input(history_prev(),false);
		break;
	  case KEYBOARD_PAGE_UP : 
		box.prop("scrollTop", box.prop("scrollTop") - box.height() );
		break;
	  case KEYBOARD_PAGE_DOWN : 
		box.prop("scrollTop", box.prop("scrollTop") +  box.height() );
		break;
	}
}

function add_button(label, action) {
	$("#toolbar").prepend("<button id=\"b_"+label+"\">"+label+"</button>");
	$("#b_"+label).button({options: { label: label }}).click(function() { input(action); });
}

function window_top_offset() {
 	return $("#nav_sub_start").children().size() * 85;
}

function addBox(id,title,autoOpen) {
	var box=$('<pre>');
	box.appendTo("body").attr("id",id).css("overflow-x","hidden").css("overflow-y", "auto")
	.dialog({ title: title, position : ["right",window_top_offset()], width : 500, height : 200, autoOpen: autoOpen==null ? false : autoOpen });

	var menue = $("<a>").appendTo($("#nav_sub_start"))
	menue.click(function() { $('#'+id).dialog('open'); return false; }).text(title).attr("href","#");
	return box;
}