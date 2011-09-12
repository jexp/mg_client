// todo heartbeat functions with register

/*
Mesirii ist anwesend,
und zwar von: Daemonendimension (ueber Berlin).
Eingeloggt seit: Mit,  7. Sep 2011, 00:31:21
Voller Name: Chaosmacher Mesirii hat eine Elfentraube im Ruecken
Rasse: Zwerg,  Gilde: Chaos,  Geschlecht: maennlich
Alter: 4a 49d 00:59:26,   Spielerlevel: 113 (Seher),   Gildenlevel: 11
Datum des ersten Login: Mit,  9. Nov 1994, 16:22:47
Homepage: www.rana-elisabeth.de, http://mesirii.de, mud@mesirii.de
ICQ: 213864527
Verheiratet mit: Mekare
Mesirii ist Zweitspieler.
Bisher bereits 348 mal gestorben
Avatar-URI: http://www.mesirii.de/mesirii_avatar.jpg
Projekt: git clone https://github.com/jexp/TinyMacros.git

*/
var Player = {
	name : "Unbekannt",
	lp : 100,
	max_lp : 100,
	kp : 100,
	max_kp : 100,
	vorsicht : 0,
	flucht : null,
	poison : 0,
	xp : 0,
	ap : 0,
	max_ap : 0,
	size : 0,
	weight : 0,
	sec : "maennlich",
	level : 0,
	max_level : 0,
	align : "neutral",
	guild_level : 0,
	subguild : null,

	intellect : 0,
	strength : 0,
	dexterity : 0,
	constitution : 0,
    intellect_mod : 0,
    strength_mod : 0,
    dexterity_mod : 0,
    constitution_mod : 0,
	deaths : 0,
	death_marks : 0,
	age : null,
	guild : null,
	race : null,
	avatar : "img/drache.gif",
	full_name : "Unbekannt",
	from : null,
	via : null,
	logged_in_since: null,
	first_login : null,
	married_to : null,
	project : null,
	second : false
}

function updatePoints(suffix, val, max) {
	$("#p_max_"+suffix).text(max);
	$("#p_"+suffix).text(val);
	var value = 100.0*parseInt(val)/parseInt(max);
	$("#p_bar_"+suffix).progressbar({ value: value});

	var bar=$("#p_bar_"+suffix+" > .ui-progressbar-value")
	bar.removeClass("bg_red bg_yellow bg_green");
	if (value > 75) { bar.addClass("bg_green") }
	if (value <= 75 && value >= 30) { bar.addClass("bg_yellow") }
	if (value < 30) { bar.addClass("bg_red") }
}

function playerBox(id) {
	var box=$("#status_"+id);
	if (box.length) {
		return box;
	}
	
   	var html = "<div id='status_"+id+"' style='width:200'> \
		<div style='float:left'> \
			<img id='avatar_"+id+"' src='img/drache.gif' width='64'/> \
		</div> \
		<div style='margin-left:40%'> \
		<div id='p_bar_lp_"+id+"' style='height:1.5em;margin:3px;'><span style='position: absolute; width: 50%; text-align: center;'>LP: <span id='p_lp_"+id+"'>58</span>/<span id='p_max_lp_"+id+"'>58</span></span></div> \
		<div id='p_bar_kp_"+id+"' style='height:1.5em;margin:3px;'><span style='position: absolute; width: 50%; text-align: center;'>KP: <span id='p_kp_"+id+"'>58</span>/<span id='p_max_kp_"+id+"'>58</span></span></div> \
		<div id='data_'"+id+"'> \
		<div>V: <span id='p_vorsicht_"+id+"'></span> FR: <span id='p_flucht_"+id+"'></span> Gift: <span id='p_poison_"+id+"'></span> </div> \
		</div></div> \
		<div style='clear:both'></div> \
	</div>"
	box = $(html).dialog();
	return box;
}

function connectPlayer(name) {
	Player.name = name; 
	var id=name.toLowerCase();
	runScript("connect",id);
	playerBox(id).dialog({ position : [850,80], width : 300 });
	loadData("player_"+id, function(data) {
		console.log("player "+name +" typ "+typeof(data) + " content "+data);
		if (data) {
			try {
				Player = JSON.parse(data);
				runScript(Player.race)
				runScript(Player.guild)
				runScript(Player.subguild)
				runScript(id)
				showPlayer(Player)
			} catch(e) {
				console.log(e)
			}
		}
	})
	add_player_triggers();
//	add_mpa_triggers(name)
	runHooks("connect",Player);
}

function showPlayer(player) {
	player = player || Player;
	var id = "_"+player.name.toLowerCase();
	updatePoints("kp"+id,player.kp,player.max_kp)
	updatePoints("lp"+id,player.lp,player.max_lp)
	if ($("#avatar"+id).attr("src") != player.avatar) {
		$("#avatar"+id).attr("src",player.avatar);
	}
	$("#p_vorsicht"+id).text(player.vorsicht)
	$("#p_flucht"+id).text(player.flucht)
	$('#status'+id).dialog("option", "title", player.name );
	$("#p_poison"+id).text(player.poison)
	if (player.lead) {
		$("#status"+id).addClass("teamlead");
	} else {
		$("#status"+id).removeClass("teamlead");
	}
}

// todo updated/shown timestamp
function showTeam() {
	var teamInfo = $('#team');
	for (var i=0;i<team.length;i++) {
		var member=team[i];
		var id = member.name.toLowerCase()
		var box = playerBox(id);
		box.dialog("option","position",[850+(200*member.column),120*member.row]).dialog("option","width",180).dialog("option","minHeight",100).dialog("option","height",120);
		var player=lookup_player(id);
		showPlayer(jQuery.extend({},player, member));
	}
}
var grab_battle = grab_single(/(^  [^' ].+|.+ faellt tot zu Boden.$)/, function(text) { appendTo("p_fight",text); })
var grab_source = grab_single(/.*/, function(text) { appendTo("source",text); })

function add_player_connect_triggers() {
	addTrigger("connect_gast",
	trigger_update(/^Du bist jetzt (.+?) /,function(name) { 
		connectPlayer(name);
	}));
	addTrigger("connect_player",
	trigger_update(/^Schoen, dass Du wieder da bist, (.+?)!/,function(name) { 
		connectPlayer(name)
	}));
}

var players = {};

function property_update(trigger,props) {
	var properties = Array.prototype.slice.call(arguments);
	return function(player, line) {
		var match;
	  	if (match=line.match(trigger)) {
	  		for (var i=1;i<match.length && i<properties.length; i++) {
				var value=match[i];
				if (value) {
	  				var prop = properties[i];
	  				player[prop]=value;
				}
	  		}
	  	}};
}

function lookup_player(name) {
	name = name.toLowerCase();
	if (name == Player.name) {
		return Player;
	} 
	if (!players[name]) {
		players[name] = { name : name};
	} 
	return players[name];
}

var team = []

function add_player_triggers() {
	console.log("add_player_triggers")

	addTrigger("teddy",
	trigger_update(/^Du hast jetzt (\d+) Lebenspunkte und (\d+) Konzentrationspunkte.$/,function(lp,kp) { 
		Player.lp = lp;
		Player.kp = kp;
	}));

	addTrigger("avatar_neu",
	trigger_update(/^Aktuelle Avatar-URI: (.+)$/,function(uri) { 
		Player.avatar = uri;
	}));
	/*
	und zwar von: Daemonendimension (ueber Berlin).
	Eingeloggt seit: Son, 11. Sep 2011, 10:23:45
	Voller Name: Chaosmacher Mesirii hat eine Elfentraube im Ruecken
	Rasse: Zwerg,  Gilde: Chaos,  Geschlecht: maennlich
	Alter: 4a 52d 16:52:34,   Spielerlevel: 113 (Seher),   Gildenlevel: 11
	Datum des ersten Login: Mit,  9. Nov 1994, 16:22:47
	Homepage: www.rana-elisabeth.de, http://mesirii.de, mud@mesirii.de
	ICQ: 213864527
	Verheiratet mit: Mekare
	Mesirii ist Zweitspieler.
	Bisher bereits 348 mal gestorben
	Projekt: git clone https://github.com/jexp/TinyMacros.git
	*/
	var finger_checks = [
		 property_update(/und zwar von: (.+)(?: \(ueber (.+)\))?\./,'from','via')
		,property_update(/Eingeloggt seit: (.+)/,'logged_in_since')
		,property_update(/Voller Name: (.+)/,'full_name')
		,property_update(/Rasse: (.+),  Gilde: (.+),  Geschlecht: (.+)/,'race','guild','gender')
		,property_update(/(?:Alter: .+, +)?Spielerlevel: (\d+)(?: \((Seher|Magier)\))?, +Gildenlevel: (\d+)/,'level','hlp','guild_level')
		,property_update(/Datum des ersten Login: (.+)/, 'first_login')
		,property_update(/Verheiratet mit: (.+)/,'married_to')
		,property_update(/.+ ist Zweitspieler\./,'second')
		,property_update(/Bisher bereits (\d+) mal gestorben/,'deaths')
		,property_update(/Projekt: (.+)/,'project')
		,property_update(/Avatar-URI: (.+)/,'avatar')
	];
	
	addTrigger("finger",
	   collect({addStart:true, start:/^.+ ist anwesend,$/, fun:function(text,lines) {
		var player,match;
		if (match = text.match(/^(.+) ist anwesend,\n/)) {
		   var name = match[1];
		   player = lookup_player(name)
		}
		for (var i=0;i<finger_checks.length;i++) {
			for (var j=0;j<lines.length;j++) {
				finger_checks[i](player, lines[j]);
			}
		}
		console.log("finger: "+player.name+" av"+player.avatar);
	}}));

/*
- Gast5 der hoffnungsvolle Anfaenger. --------------------------------
Rasse ............ Mensch             Abenteuer ........ 0 
Geschlecht ....... maennlich          Groesse .......... 164 cm
Stufe ............ 1   (6)            Gewicht .......... 74 kg
Gilde ............ Abenteurer         Gildenstufe ...... 1
Erfahrung ........ 0 Punkte           Charakter ........ neutral

Ausdauer .........  1 (+1)            Geschicklichkeit .  1 (+3)
Kraft ............  1 (+1)            Intelligenz ......  1 (+1)

Gesundheit ....... 58                 Gift ............. gesund
Konzentration .... 58                 Vorsicht ......... 20
Todesfolgen....... kein Malus         
Du kennst Dich im MorgenGrauen so gut wie gar nicht aus. 
Alter:	1 Stunde 10 Minuten 36 Sekunden.
*/
	var info_checks = [
	property_update(/Rasse ............ (.+)             Abenteuer ........ (\d+)(?: \((\d+)\))?/,'race','ap','max_ap')
	,property_update(/Geschlecht ....... (.+)          Groesse .......... (\d+) cm/,'gender','size')
	,property_update(/Stufe ............ (\d+)(?: +\((\d+)\)) +Gewicht .......... (\d+) kg/,'level','max_level','weight')
	,property_update(/Gilde ............ (.+)         Gildenstufe ...... (\d+)(?: \((\d+)\))?/,'guild','guild_level','max_guild_level')
	,property_update(/Erfahrung ........ (\d+) Punkte           Charakter ........ (.+)/,'xp','align')
	,property_update(/Ausdauer ......... +(\d+)(?: \(([+-]\d+)\)) +Geschicklichkeit .  (\d+)(?: \(([+-]\d+)\))/,'constitution','constitution_mod','dexterity','dexterity_mod')
	,property_update(/Kraft ............ +(\d+)(?: \(([+-]\d+)\)) +Intelligenz ......  (\d+)(?: \(([+-]\d+)\))/,'strength','strength','intellect','intellect_mod')
	,property_update(/Gesundheit ....... (\d+)(?: +\((\d+)\))? +Gift ............. (gesund|leicht|gefaehrlich)/,'lp','max_lp','poison')
	,property_update(/Konzentration .... (\d+)(?: +\((\d+)\))? +Vorsicht ......... (\d+|mutig)/,'kp','max_kp','vorsicht')
	,property_update(/Todesfolgen....... (\d|kein Malus)/,'death_marks')
	,property_update(/Du kennst Dich im MorgenGrauen (.+)/,'fp')
	
	];

	addTrigger("info",
	   collect({start:/- .+ -{3,}$/, end: /----------------------------------------------------------------------/, fun : function(text,lines) {
		var player = Player;
		for (var i=0;i<info_checks.length;i++) {
			for (var j=0;j<lines.length;j++) {
				info_checks[i](player, lines[j]);
			}
		}
		console.log("info: "+player.name+" avatar: "+player.avatar);
	}}));

	/*
	  Name        Gilde           LV GLV  LP (MLP)  KP (MKP) Vors. GR AR TR FR A V
	* Mesirii     Chaos          113  11 226 (226) 169 (202)     0  1  1  1 -- - -
	  Nurchak                     12   0  41 ( 41) 161 (161)     0  1  1  1 -- - -
	Dotz: 200 LP 

	Dotz: 152 KP 

	Tolot: 29 KP 

	Tolot: 30 KP 

	Dotz: 203 LP / 154 KP 

	Dotz: 10 LP / 151 KP, Tolot: 28 KP 
	*/
	
	

	addTriggers("teaminfo",[
	   function(line) {
		  if (team && team.length && line.match(/^[A-Z].+ (KP|LP) *$/)) {
			 var infos=line.split(", ");
			 for (var i=0;i<infos.length;i++) {
				var match=infos[i].match(/^(\w+): (\d+) (LP|KP)(?: \/ (\d+) KP)? *$/);
				var id=match[1].toLowerCase();
				for (var j=0;j<team.length;j++) {
					if (team[j].id == id) {
						if (match[3]=="LP") team[j].lp=match[2];
						else team[j].kp=match[2];
						if (match[4]) team[j].kp=match[4];
					}
				}
			}
			showTeam();
			return null;
		  }
		  return line;
	   },
	   collect({start:/  Name        Gilde           LV GLV  LP \(MLP\)  KP \(MKP\) Vors. GR AR TR FR A V/, 
				fun: function(text,lines) {
			team = [];
			var cols = [0,0,0,0,0];
			for (var j=0;j<lines.length;j++) {
 // todo escape sequences, strip_escapes - 0x1B\[\d+m
				var line = strip_esc_colors(lines[j]);
				var match=line.match(/(\*| ) (\w+) +(\w+) +(\d+) +(\d+) +(\d+) +\( *(\d+)\) +(\d+) +\( *(\d+)\) +(\d+) +(\d+) +(\d+) +(--|\d+) +(--|\d+) +(-|\d+) +(-|\d+)/);
				if (match) {
				var member = { lead : match[1]!=" ", name: match[2], id: match[2].toLowerCase(), guild:match[3], level: match[4], guild_level:match[5],
								lp : match[6], max_lp : match[7],kp : match[8], max_kp : match[9],vorsicht:match[10],
								intended_row : match[11], current_row : match[12], real_row : match[13], flight_row: match[14], attack: match[15], follow: match[16]
							};
				var row=member.current_row-1;
				member.row=row;
				member.column = cols[row];
				cols[row] += 1;
				team.push(member);
				} else {
					console.log("Error matching team member "+line);
				}
				showTeam();
//				player = lookup_player(member.name);
}
	}})]);

    addTriggers("gift",[
		highlight({trigger:/Du hast eine leichte Vergiftung./, style: {color:"yellow"}, action : function() { Player.poison = 1 }}),
		highlight({trigger:/Du hast eine schwere Vergiftung./, style: {color:"red"},  action : { poison : 2 }}),
		highlight({trigger:/Du hast eine gefaehrliche Vergiftung./, style: {color:"red", "font-weight" :"bold"}, action : "Player.poison = 3 "})
	]);

	addTriggers("kurzinfo",[
		highlight({ trigger: /Konzentration: 0 \|.+\| +(\d+) \((\d+)\)$/, action : function(args) { 
			Player.kp = args.groups[0]; Player.max_kp = args.groups[1]; 
		}})
	]);
	
	addTriggers("vorsicht",[
  	trigger_update(/^Vorsicht: (.+). Fluchtrichtung: (.+)$/,function(vorsicht,flucht) { 
  		Player.vorsicht = vorsicht;
  		Player.flucht = flucht;
  	}),
  	trigger_update(/^Vorsicht-Modus \((.+)\)$/,function(vorsicht) { 
  		Player.vorsicht = vorsicht;
  	}),
  	trigger_update(/^Prinz Eisenherz-Modus.$/,function() { 
  		Player.vorsicht = 0;
  	})	
 	]);

//	addTrigger("kurzinfo_kp",
//	trigger_update(/Konzentration: 0 \|.+\| +(\d+) \((\d+)\)$/,function(val,max) { Player.kp = max; Player.max_kp = max; }));
	addTrigger("kurzinfo_lp",
	trigger_update(/Gesundheit:    0 \|.+\| +(\d+) \((\d+)\)$/,function(val,max) { Player.lp = val; Player.max_lp = max; }));
	addTrigger("kurzinfo_kp_max",
	trigger_update(/Konzentration: 0 \|.+\| +(\d+)$/,function(max) { Player.kp = max; Player.max_kp = max; }));
	addTrigger("kurzinfo_lp_max",
	trigger_update(/Gesundheit:    0 \|.+\| +(\d+)$/,function(max) { Player.lp = max; Player.max_lp = max; }));
}

var playerBackup = null;
function createPlayerBackup() {
	playerBackup = clone(Player);
}

function showPlayerIfChanged() {
	if (objectEquals(Player,playerBackup)) return;
	showPlayer(Player);
	storeData("player_"+Player.name.toLowerCase(),JSON.stringify(Player))
}