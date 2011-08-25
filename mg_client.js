var triggers = {};	
	
function addTrigger(id,trigger) {
	triggers[id] = trigger;
}

// todo besseres handling, trigger auf uspruengliche zeile und delta's verwalten (aenderungen an zeile)
// verwaltung von prios, fall-thru und farb/style infos in separatem kanal halten
function runTriggers(line) { 
	for (name in triggers) {
		line = triggers[name](line);
	}
	return line;
}
function trigger_update(regexp, fun) {
	return function(line) {
	    var match=line.match(regexp);
	    if (match!=null) {
		  match.shift(); // remove first match
		  return fun.apply(this,match);
	    }
	    return line;
	}
}

function collect(start,end, fun) { // todo objekt, mit start/end ausschluss, gag
	var collected = null;
	return function(line) {
		if (line.match(start)) {
			collected = "";
		} 
		if (collected != null) {
			collected += line + "\n";
		}
		if (line.match(end)) {
			if (collected != null && collected.length > 0) {
				fun(collected);
			}
			collected = null;
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

function highlight(trigger) {
	return function(line) {
		return line.replace(trigger.trigger, function (text) {
			var span = $("<span>");
			if (trigger.style!=null) { span.css(trigger.style); }
			if (trigger.click!=null) { span.click(trigger.click(text)); }
			if (trigger.dblclick!=null) { span.dblclick(trigger.dblclick(text));}
			span.text(text);
			return span.wrap("<div>").parent().html();
		});
	}
}
