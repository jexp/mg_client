var hooks = { send : { script : hookScript, multi_commands : multiCommands } }

function multiCommands(input) {
	if (input.match(/;;/)) {
		var commands = input.split(/;;/);
		console.log("commands")
		for (i=0;i<commands.length;i++) {
			server.send(commands[i]+"\n");
		}
		return null;
	}
	return input;
}
function addHook(type, name, hook) {
	if (!hooks[type]) {
		hooks[type]={};
	}
	hooks[type][name.toLowerCase()]=hook;
}

function removeHook(type, name) {
	if (!hooks[type]) return;
	hooks[type][name.toLowerCase()]=null;
}

// todo rather a separate alias list?
function addExpandHook(name, match, expand) {
	addHook("send",name, function(input) {
		if (input.match(match)) return expand; // todo parameter substitution
	})
}

function hookScript(input) {
	var match = input.match(/^\/(\w+)\s*/)
	console.log(match)
	if (match) {
		if (hasScript(match[1])) {
			input = input.substring(1);
			args = input.split(/\s+/);
			console.log("hookScript apply "+args)
			return runScript.apply(this,args)
		}
		return null; // scripts not sent to server
	}
	return input;
}

function runHooks(type, data) {
	var h=hooks[type];
	if (!h) return data;
	for (name in h) {
		if (h[name]) {
//			console.log("running hook "+name+" with "+data+" result: "+data);
			data = h[name](data)
			if (data==null) return null; // todo handle fallthrough etc
		}
	}
	return data;
}
