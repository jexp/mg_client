var triggers = {};	
	
// { id , trigger, prio, fallthrough, count, cond }	
function addTrigger(id, trigger) {
	trigger.name = id;
    if (!trigger.fun) {
        throw "Trigger "+id+" misses function ";
    }
    triggers[id] = trigger;
}
function removeTrigger(id,prefix) {
    if (!prefix) {
        delete triggers[id];
    } else {
        id = id + "_";
        var len = id.length;
        for (p in triggers) {
            if (p.substr(0, len) == id) {
                delete triggers[id];
            }
        }
    }
}

function addTriggers(id, trigger, actions) { // todo ist ein trigger mit mehreren function -> addTriggers(id,trigger, actions)
    trigger.fun = function(result) {
		var hit=false;
        for (var i=0;i<actions.length;i++) {
			hit |= actions[i](result);
			if (hit && trigger.stop) break;
		}
		return hit;
	};
    addTrigger(id,trigger);
}

// todo besseres handling, trigger auf uspruengliche zeile und delta's verwalten (aenderungen an zeile)
// verwaltung von prios, fall-thru und farb/style infos in separatem kanal halten
function runTriggers(result) {
	if (result.line==undefined) {
        console.log("UNDEF line");
        console.log(JSON.stringify(result));
    }
//	console.log("triggering: #"+line+"#"+line.charCodeAt(0)+".."+line.charCodeAt(line.length-1));
	var hit=false;
    for (name in triggers) {
		var trigger=triggers[name];
        try {
            if (trigger.disabled) continue; // todo other conditions
            if (!trigger.fun(result)) continue;
            hit = true;
            if (trigger.count) {
                trigger.count -= 1;
                if (trigger.count == 0) {
                    delete triggers[name];
                }
            }
            if (trigger.gag) result.gag = true;
            if (trigger.stop) break;
        } catch (e) {
            console.log("exception line trigger "+name+" "+e);
            console.log(JSON.stringify(result));
            trigger.disabled=true;
        }
//		console.log("triggering: #"+line+"# with "+name);
        if (result.line==undefined) {
            console.log("UNDEF line trigger "+name);
            console.log(JSON.stringify(result));
        }
	}
	return hit;
}

function trigger_update(trigger) {
	trigger.fun = function(result) {
	    var match=result.line.match(trigger.trigger);
	    if (!match) return false;
		match.shift(); // remove first match
		trigger.action.apply(this,match);
        return true;
	};
    return trigger;
}

PROMPT = /^\S*>\s*$/
function collect(trigger) { // todo objekt, mit start/end ausschluss, gag
	var collected = null;
	trigger.end = trigger.end || PROMPT;
    trigger.fun = function(result) {
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
        return matched;
	};
    return trigger;
}

function grab_single(trigger) { // todo highlight whole line
	trigger.fun = function(result) {
		if (result.line==undefined) {
            console.log(JSON.stringify(trigger));
            console.log(JSON.stringify(result));
        }
        if (result.line.match(trigger.trigger)) {
			trigger.action(result.line + "\n");
            return true;
		}
		return false;
	};
    return trigger;
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
}
/*
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
 */

function highlight(trigger) {
	trigger.fun = function(result) {
        var line = result.line;
		var match=line.match(trigger.trigger);
		if (!match) return false;
		if (trigger.action) {  run(trigger.action, line, match, trigger); }
		if (trigger.style || trigger.click || trigger.dblclick) {
            replaceWithSpan(result, trigger);
        }
        return true;
	};
    return trigger;
}
