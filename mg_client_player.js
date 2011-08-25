var status = {
	lp : 0,
	max_lp : 100,
	kp : 0,
	max_kp : 100
}

function update(suffix, val, max) {
	if (max==null) { max = status["max_"+suffix]; }
	if (val==null) { val = status[suffix]; }
	$("#p_max_"+suffix).text(max);
	$("#p_"+suffix).text(val);
	var value = 100.0*parseInt(val)/parseInt(max);
	$("#p_bar_"+suffix).progressbar({ value: value});

	var bar=$("#p_bar_"+suffix+" > .ui-progressbar-value")
	bar.removeClass("bg_red bg_yellow bg_green");
	if (value > 75) { bar.addClass("bg_green") }
	if (value <= 75 && value >= 30) { bar.addClass("bg_yellow") }
	if (value < 30) { bar.addClass("bg_red") }

	status["max_"+suffix] = max;
	status[suffix] = val; 
}

var grab_battle = grab_single(/(^  [^' ].+|.+ faellt tot zu Boden.$)/, function(text) { appendTo("p_fight",text); })
var grab_source = grab_single(/.*/, function(text) { appendTo("source",text); })

/*
  Name        Gilde           LV GLV  LP (MLP)  KP (MKP) Vors. GR AR TR FR A V
* Mesirii     Chaos          113  11 226 (226) 169 (202)     0  1  1  1 -- - -
  Nurchak                     12   0  41 ( 41) 161 (161)     0  1  1  1 -- - -
*/

function player_triggers(line) {
	trigger_update(/^Du bist jetzt (.+?) /,function(name) { $('#status').dialog("option", "title", name ); })(line);
	trigger_update(/^Schoen, dass Du wieder da bist, (.+?)!/,function(name) { $('#status').dialog("option", "title", name ); })(line);

	trigger_update(/^Du hast jetzt (\d+) Lebenspunkte und (\d+) Konzentrationspunkte.$/,function(lp,kp) { 
		update("lp",lp,null); 
		update("kp",kp,null); 
	})(line);

	trigger_update(/^Vorsicht: (.+). Fluchtrichtung: (.+)$/,function(vorsicht,flucht) { 
		$("#p_vorsicht").text(vorsicht);
		$("#p_flucht").text(flucht);
	})(line);

	trigger_update(/^Vorsicht-Modus \((.+)\)$/,function(vorsicht) { 
		$("#p_vorsicht").text(vorsicht);
	})(line);
	trigger_update(/^Prinz Eisenherz-Modus.$/,function() { 
		$("#p_vorsicht").text(0);
	})(line);
	
	trigger_update(/Konzentration: 0 \|.+\| +(\d+) \((\d+)\)$/,function(val,max) { update("kp",val,max); })(line);
	trigger_update(/Gesundheit:    0 \|.+\| +(\d+) \((\d+)\)$/,function(val,max) { update("lp",val,max); })(line);
	trigger_update(/Konzentration: 0 \|.+\| +(\d+)$/,function(max) { update("kp",max,max); })(line);
	trigger_update(/Gesundheit:    0 \|.+\| +(\d+)$/,function(max) { update("lp",max,max); })(line);
	return line;
}