/*
loadScript('js/mg_client/mg_client_script.js');
loadScript('js/mg_client/mg_client_trigger.js');
loadScript('js/mg_client/mg_client_hooks.js');
*/

function actionsFor(param) {
	param = param.toLowerCase();
	if (online[param]) {
		return [{label:"reden", fun:function() { chatTab(param); }},
				{label:"rknuddel",action:"rknuddel #"},{separator:"newline"},
				{label:"finger", action:"finger -a #"},
				{label:"Anzeigen", fun: function() { showOtherPlayer(param); }}];
	} else {
		return [{label:"unt", action:"unt #"},{label:"nimm",action:"nimm #"},
		           {label:"trage", action:"trage #"},{separator:"newline"},
		           {label:"toete",action:"toete #"}];
	}
}

function addCompass() {
   add_buttons("compass",[{label:"nw"},{label:"n"},{label:"no"},{separator:"newline"},
                          {label:"w"},{label:"schau"},{label:"o"},{separator:"newline"},
                          {label:"sw"},{label:"s"},{label:"so"},{separator:"newline"},
                          {label:"ob"},{label:"u"},{label:"raus"}]);
}

function playerPopup(e, name) {
   var param=name.toLowerCase();
   if (!online[param]) return;
   showPopup([e.pageX - 50,e.pageY - 20 ],param,actionsFor(param));
}

// markup : { from : to : style: , click : dbclick : title }
function extractMarkup(line) {
	return { line : line, markup : [], original : line }
}
function enrich(line) {
    line = extractIAC(line);
	var result = extractMarkup(line);
	
	line = escapeHTML(line);

	if (handlePassword(line)) {
		return line;
	}

	beforeLine();

	grab_battle(line);

	line = runTriggers(line);
	
	line = color_escapes(line);

	line = line.replace(/\b(norden|nordosten|osten|suedosten|sueden|suedwesten|westen|nordwesten|oben|unten|raus)\b/g,"<span style='color:red'>$1</span>");

	line = line.replace(/([A-Z][a-z]{2,})/g,"<span>$1</span>");
	
	grab_source(line);
	
	afterLine();
	return line;
}


function startUp(){
//		try {
		loadAllScripts();
		addScript("skript",function(name,commands){ 
			commands = Array.prototype.slice.call(arguments);
			commands.shift();
			var script=commands.join(" ");
			addScript(name, "function() { "+script+" }");
		});
		
		add_player_connect_triggers(); // todo move to startup script
		
		$('#debug_trigger').dialog({title:"Debug Trigger", position: [850,600], width: 400, autoOpen : false});
		$('#input').keydown(handle_keys);

		addBox("p_fight","Kampf");
		addBox("source","Source",false,"nav_debug");

		add_buttons("toolbar",[{label:"info"},{label:"ausruestung"},{label:"inv"},
		                       {label:"Kurz", action:"kurz"},{label:"Lang", action:"lang"},{label:"nn"},
							   {label:"Anwesende",action:"kwer"},{label:"Abmelden",action:"schlafe ein"}]);

		addCompass();
		
		showPlayer();
		addWindow("Kommunikation", {
			teilemit : { title : "Mitteilungen", trigger : /^(Du teilst .+ mit|.+ teilt Dir mit|Du fluesterst .+ zu|.+ fluestert Dir zu):/ , 
			fun : function (text) { appendTabText("teilemit",text); } },
			ebenen :   { title : "Ebenen", trigger : /^\[[A-Z]\w+/, fun : function (text) { appendTabText("ebenen",text); }}
		})		
		addWindow("Spieler",
				{ p_info: { 
				title: "Info", start:/- .+ -{3,}$/, addStart:true, 
				end: /----------------------------------------------------------------------/ },
				  p_inventory : { title: "Inventory", start : /^(inv|inventory|i)\s*$/ },
				  p_ausruestung : { title: "Ausr&uuml;stung", start : /^(ar|ausruestung)\s*$/ ,
					fun : function(text) { setTabText("p_ausruestung",color_escapes(escapeHTML(text))) }
				 }
				});
		addWindow("Mud", {
			p_ort : { title: "Ort", 	start : /^(schaue?|l|look|norden|nordosten|osten|suedosten|sueden|suedwesten|westen|nordwesten|oben|unten|raus|n|nw|no|o|s|w|sw|so|ob|u)\s*$/},
			p_finger : { title: "Finger", start : /^.+ ist anwesend,$/ , addStart:true},
			p_kwer : { title : "Anwesende", start: /^     Liste der Mitspieler vom/, addStart:true },
			p_team : { title : "Team" , start: /^  Name        Gilde           LV GLV  LP (MLP)  KP (MKP) Vors. GR AR TR FR A V/ }});
		$('#docs').tabs().tabs("add","docs.html","Dokumentation").tabs("add","bugs.html","Bekannte Fehler").hide();
		makeTabWindow($('#docs'))
		$('#Mud').hide()
		$('#Spieler').hide()
		editAreaLoader.init({
			  id : "script_editor"
			, syntax: "js"		
			, start_highlight: false
			, allow_toggle : false
			, replace_tab_by_spaces : true
			, word_wrap : true
			, display: "onload"
			, toolbar : "new_document, load, save , | , search, go_to_line, |, undo, redo"
			, save_callback : "scriptDialog"
			, load_callback : "scriptDialog"

		});
		$("#script_editor").dialog({autoOpen : false ,width : $("#script_editor").width() });
			
		runScript("startup");
		runHooks("startup");
		
		$('#mpa_rubriken').dataTable( { bJQueryUI: true, // aaData: [["1","allgemeines"]],  
		sDom: '<"table_top"f<"table_toolbar">>rt<"table_bottom"ipl><"clear">',
		aoColumns: [ { sTitle: "Nr", sWidth : "3em" }, 
		             { sTitle: "Rubrik", sWidth : "20em", fnRender: function(obj) {
							var data = obj.aData[ obj.iDataColumn ];
							return "<span onClick='send(\"inhalt "+data+"\",true)'>"+data+"</span>";
						} },
					 { sTitle: "Anzahl", sWidth : "4em" }, 
					 { sTitle: "Letzte", sWidth : "10em" } ] } );
		$('#tab-mpa-rubriken .table_toolbar').prepend($('#tab-mpa-rubriken input[type=submit]').button())

		$('#mpa_rubrik').dataTable( { bJQueryUI: true, // aaData: [["1","allgemeines"]],  
		sDom: '<"table_top"f<"table_toolbar">>rt<"table_bottom"ipl><"clear">',
		aoColumns: [ { sTitle: "Nr", sWidth : "3em" }, 
		             { sTitle: "Titel", sWidth : "20em", fnRender: function(obj) {
						    var id = obj.aData[ 0 ];
							var data = obj.aData[ obj.iDataColumn ];
							var rubrik = $('#mpa_rubrik_tab_name').text();
							return "<span onClick='liesArtikel(\""+rubrik+"\","+id+")'>"+data+"</span>";
						} },
					 { sTitle: "Autor", sWidth : "10em" }, 
					 { sTitle: "Antworten", sWidth : "10em", fnRender: function(obj) {
						    var id = obj.aData[ 0 ];
							var data = obj.aData[ obj.iDataColumn ];
							var rubrik = $('#mpa_rubrik_tab_name').text();
							return data + "<input type=\"submit\" onClick='writeArticle(\""+rubrik+"\","+id+")' value='Antworten'/>";
					} },
					 { sTitle: "Datum", sWidth : "10em" }
					 ] } );
		$('#mpa').tabs(); // .dialog({ title: "MPA", width: 600});
		$('#tab-mpa-rubrik .table_toolbar').prepend($('#tab-mpa-rubrik input[type=submit]').button())
		makeTabWindow($('#mpa'));
		$('#mpa').hide();
//		addScript("startup", function(x) { alert("test "+x)});
//		editScript("startup");
		$('#input').focus();
		$('#b_submit').button();
		$('#docs').tabs().draggable().resizable();
		$('#menu').menu();
		$("#windows button").each(function() {
		    $(this).button({icons: { primary: $(this).attr("icon"),secondary: "ui-icon-triangle-1-s"}});
		  }).next().menu({
					select: function(event, ui) {
						$(this).hide();
					}}).popup();
		
		$('#mgbox').click( handleWord(
			function(e, param) {
			  if (param.match(/(norden|nordosten|osten|suedosten|sueden|suedwesten|westen|nordwesten|oben|unten|raus)/)) {
				send(param.toLowerCase());
				return;
			  }
			  if (!param.match(/^[A-Z]/)) return;
			  var param = param.toLowerCase();
   			  var actions=actionsFor(param);
   			  showPopup([e.pageX - 50,e.pageY - 20 ],param,actions);
   			}));
		$('#mgbox').dblclick( handleWord(
				function(e, param) {
				  if (!param.match(/^[A-Z]/)) return;
	   			  var actions=actionsFor(param);
	   			  handleButton(actions[0]);
	   	}));
//	} catch(e) {console.log(e);throw e;}
}