var triggers = {};	
	
// { id , trigger, prio, fallthrough, count, cond }	
function addTrigger(id, trigger) {
	triggers[id] = trigger;
}
function addTriggers(id, actions) {
	addTrigger(id, function(line) {
		for (var i=0;i<actions.length;i++) {
			line = actions[i](line);
			if (!line) return line;
		}
		return line;
	});
}

// todo besseres handling, trigger auf uspruengliche zeile und delta's verwalten (aenderungen an zeile)
// verwaltung von prios, fall-thru und farb/style infos in separatem kanal halten
function runTriggers(line) { 
	if (!line) return line;
//	console.log("triggering: #"+line+"#"+line.charCodeAt(0)+".."+line.charCodeAt(line.length-1));
	for (name in triggers) {
		line = triggers[name](line);
//		console.log("triggering: #"+line+"# with "+name);
		if (!line) return line;
	}
	return line;
}

function trigger_update(regexp, fun) {
	return function(line) {
	    var match=line.match(regexp);
	    if (match!=null) {
		  match.shift(); // remove first match
		  fun.apply(this,match);
	    }
	    return line;
	}
}

PROMPT = /^\S*>\s*$/
function collect(trigger) { // todo objekt, mit start/end ausschluss, gag
	var collected = null;
	trigger.end = trigger.end || PROMPT;
	return function(line) {
		if (line.match(trigger.start)) {
			collected = [];
			if (trigger.addStart) {
				collected.push(line);
			}
		} else if (line.match(trigger.end)) {
				if (trigger.addEnd) {
					collected.push(line);
				}
				if (collected && collected.length > 0) {
//					console.log("collect "+trigger.fun.toString()+" "+collected);
					trigger.fun(collected.join("\n"),collected);
				}
				collected = null;
		} else if (collected) {
			collected.push(line);
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

function run(action,line, match,trigger) {
	var type = typeof(action)
	if (type == "string" ) return eval(action);
	if (type == "function" ) {
		var fullmatch = match.shift();
		return action.call(this, { match : fullmatch, line:line, trigger:trigger, groups : match });
	}
	if (type == "object" ) {
		for (p in action) {
			if (action.hasOwnProperty(p)) {
				Player[p]=action[p];
			}
		}
	}
}

function highlight(trigger) {
	return function(line) {
		var match=line.match(trigger.trigger);
		if (!match) return line;
		if (trigger.action) {  run(trigger.action, line, match, trigger); }
		if (!(trigger.style || trigger.click || trigger.dblclick)) return line;
		
		return line.replace(trigger.trigger, function (text) {
			var span = $("<span>");
			if (trigger.style) { span.css(trigger.style); }
			if (trigger.click) { span.click(trigger.click(text)); }
			if (trigger.dblclick) { span.dblclick(trigger.dblclick(text));}
			span.text(text);
			return span.wrap("<div>").parent().html();
		});
	}
}
