var triggers = {};	
	
// { id , trigger, prio, fallthrough, count, cond }	
function addTrigger(id, trigger) {
	trigger.name = id;
    triggers[id] = trigger;
}
function addTriggers(id, actions) {
	addTrigger(id, function(result) {
		for (var i=0;i<actions.length;i++) {
			result = actions[i](result);
			if (result.stop) break;
		}
		return result;
	});
}

// todo besseres handling, trigger auf uspruengliche zeile und delta's verwalten (aenderungen an zeile)
// verwaltung von prios, fall-thru und farb/style infos in separatem kanal halten
function runTriggers(result) {
	if (result.line==undefined) {
        console.log("UNDEF line");
        console.log(JSON.stringify(result));
    }
//	console.log("triggering: #"+line+"#"+line.charCodeAt(0)+".."+line.charCodeAt(line.length-1));
	for (name in triggers) {
		var trigger=triggers[name];
        try {
            result = trigger(result);
        } catch (e) {
            console.log("exception line trigger "+name+" "+e);
            console.log(JSON.stringify(result));
        }
//		console.log("triggering: #"+line+"# with "+name);
        if (result.line==undefined) {
            console.log("UNDEF line trigger "+name);
            console.log(JSON.stringify(result));
        }
        if (result.stop) break;
	}
	return result;
}

function trigger_update(trigger) {
	return function(result) {
	    var match=result.line.match(trigger.trigger);
	    if (match) {
		  match.shift(); // remove first match
		  trigger.action.apply(this,match);
	    }
	    return applyTriggerFlags(trigger,result);
	}
}

function applyTriggerFlags(trigger,result) {
    if (trigger.gag) result.gag=true;
    if (trigger.stop) result.stop = true;
    return result;
}

PROMPT = /^\S*>\s*$/
function collect(trigger) { // todo objekt, mit start/end ausschluss, gag
	var collected = null;
	trigger.end = trigger.end || PROMPT;
	return function(result) {
        var line=result.line;
        var matched=false;
		if (line.match(trigger.start)) {
			collected = [];
            matched=true;
			if (trigger.addStart) {
				collected.push(line);
			}
		} else if (line.match(trigger.end)) {
            matched=true;
				if (trigger.addEnd) {
					collected.push(line);
				}
				if (collected && collected.length > 0) {
//					console.log("collect "+trigger.fun.toString()+" "+collected);
					trigger.action(collected.join("\n"),collected);
				}
				collected = null;
		} else if (collected) {
            matched=true;
			collected.push(line);
		}
        if (matched) {
            return applyTriggerFlags(trigger,result);
        } else {
            return result;
        }
	}
}

function grab_single(trigger) { // todo highlight whole line
	return function(result) {
		if (result.line==undefined) {
            console.log(JSON.stringify(trigger));
            console.log(JSON.stringify(result));
        }
        if (result.line.match(trigger.trigger)) {
			trigger.action(result.line + "\n");
            applyTriggerFlags(trigger,result);
		}
		return result;
	}
}

function run(action,line, match,trigger) {
	var type = typeof(action)
	if (type == "string" ) return eval(action);
	if (type == "function" ) {
		var fullmatch = match.shift() ;
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
function stripReplaceArguments(passedArgs) {
    var args=Array.prototype.slice.call(passedArgs);
    if (args.length==3) return [args[0]];
    return args.slice(1,-2);
}
// todo styles and actions an result
function replaceWithSpan(result,trigger) {
    var line = result.line;
    result.history.push(line);
    line = line.replace(trigger.trigger, function () {
        matches = stripReplaceArguments(arguments);
        for (var i=0;i<matches.length;i++) {
            var span = $("<span>");
            var text = matches[i];
            if (trigger.style) { span.css(trigger.style); }
            if (trigger.click) { span.click(trigger.click(text)); }
            if (trigger.dblclick) { span.dblclick(trigger.dblclick(text));}
            span.text(text);
        }
        return span.wrap("<div>").parent().html();
    });
    result.line = line;
    return result;
}

function highlight(trigger) {
	return function(result) {
        var line = result.line;
		var match=line.match(trigger.trigger);
		if (!match) return result;
		if (trigger.action) {  run(trigger.action, line, match, trigger); }
        result = applyTriggerFlags(trigger,result);
		if (!(trigger.style || trigger.click || trigger.dblclick)) return result;
        result = replaceWithSpan(result, trigger);
        return result;
	}
}
