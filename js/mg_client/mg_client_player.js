var Player = {
	name : "Unbekannt",
	lp : 100,
	max_lp : 100,
	kp : 100,
	max_kp : 100,
	vorsicht : 0,
	flucht : null,
	poison : null,
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
	endurance : 0,
	deaths : 0,
	death_marks : 0,
	age : null,
	guild : null,
	race : null,
	avatar : "img/drache.gif"
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
function add_player_triggers() {
	console.log("add_player_triggers")

	addTrigger("teddy",
	trigger_update(/^Du hast jetzt (\d+) Lebenspunkte und (\d+) Konzentrationspunkte.$/,function(lp,kp) { 
		Player.lp = lp;
		Player.kp = kp;
	}));

	addTrigger("teddy_vorsicht",
	trigger_update(/^Vorsicht: (.+). Fluchtrichtung: (.+)$/,function(vorsicht,flucht) { 
		Player.vorsicht = vorsicht;
		Player.flucht = flucht;
	}));

	addTrigger("vorsicht",
	trigger_update(/^Vorsicht-Modus \((.+)\)$/,function(vorsicht) { 
		Player.vorsicht = vorsicht;
	}));
	addTrigger("vorsicht0",
	trigger_update(/^Prinz Eisenherz-Modus.$/,function() { 
		Player.vorsicht = 0;
	}));
	addTrigger("kurzinfo_kp",
	trigger_update(/Konzentration: 0 \|.+\| +(\d+) \((\d+)\)$/,function(val,max) { Player.kp = max; Player.max_kp = max; }));
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