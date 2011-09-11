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
	if ($("#avatar").attr("src") != Player.avatar) {
		$("#avatar").attr("src",Player.avatar);
	}
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

function connectPlayer(name) {
	Player.name = name; 
	runScript("connect",name.toLowerCase());
	loadData("player_"+name.toLowerCase(), function(data) {
		console.log("player "+name +" typ "+typeof(data) + " content "+data);
		if (data) {
			try {
				Player = JSON.parse(data);
				runScript(Player.race)
				runScript(Player.guild)
				runScript(Player.subguild)
				runScript(Player.name)
			} catch(e) {
				console.log(e)
			}
		}
	})
	add_player_triggers();
}

function showPlayer() {
	storeData("player_"+Player.name.toLowerCase(),JSON.stringify(Player))
	updatePoints("kp",Player.kp,Player.max_kp)
	updatePoints("lp",Player.lp,Player.max_lp)
	$("#p_vorsicht").text(Player.vorsicht)
	$("#p_flucht").text(Player.flucht)
	$('#status').dialog("option", "title", Player.name );
	$("#p_poison").text(Player.poison)
}

var grab_battle = grab_single(/(^  [^' ].+|.+ faellt tot zu Boden.$)/, function(text) { appendTo("p_fight",text); })
var grab_source = grab_single(/.*/, function(text) { appendTo("source",text); })

/*
  Name        Gilde           LV GLV  LP (MLP)  KP (MKP) Vors. GR AR TR FR A V
* Mesirii     Chaos          113  11 226 (226) 169 (202)     0  1  1  1 -- - -
  Nurchak                     12   0  41 ( 41) 161 (161)     0  1  1  1 -- - -
*/

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
	  				console.log("Updating "+prop+" to "+value);
	  				player[prop]=value;
				}
	  		}
	  	}};
}

function lookup_player(name) {
	if (name == Player.name) {
		return Player;
	} 
	if (!players[name]) {
		players[name] = { name : name};
	} 
	return players[name];
}

function add_player_triggers() {
	console.log("add_player_triggers")

	addTrigger("teddy",
	trigger_update(/^Du hast jetzt (\d+) Lebenspunkte und (\d+) Konzentrationspunkte.$/,function(lp,kp) { 
		Player.lp = lp;
		Player.kp = kp;
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
		,property_update(/Projekt: (.)/,'project')
		,property_update(/Avatar-URI: (.+)/,'avatar')
	];
	
	addTrigger("finger",
	   collect(/^.+ ist anwesend,$/, /^\S*>\s*$/, function(text,lines) {
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
	}));

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
//	property_update(/Rasse ............ (.+)             Abenteuer ........ (\d+)(?: \((\d+)\))?/,'race','ap','max_ap')
	
	];

	addTrigger("info",
	   collect(/- .+ -{3,}$/, /----------------------------------------------------------------------/, function(text,lines) {
		var player = Player;
		for (var i=0;i<info_checks.length;i++) {
			for (var j=0;j<lines.length;j++) {
				info_checks[i](player, lines[j]);
			}
		}
		console.log("info: "+player.name+" av"+player.avatar);
	}));

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
	showPlayer();
}