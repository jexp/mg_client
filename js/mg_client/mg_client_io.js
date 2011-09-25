	function connect(receive) {
		var url = "http://"+config.proxy_host+":"+config.proxy_port +"/";

		var socket = io.connect(url);
		  socket.on('connect', function () {
			console.log("Connected to "+url)
		    socket.on('message', function (msg) {
		      receive(msg)
		    });
			socket.on('disconnect', function(x) { console.log("disconnect "+x); });
			socket.on('reconnect', function(x) { console.log("reconnect "+x); })
		  });
		return socket;
	}

var	IAC = {
//		IAC : "\uFF",
		SB : "\uFFFA",
	    SE : "\uFFF0",
		WILL : "\uFFFB",
		WONT : "\uFFFC",
		DO : "\uFFFD",
		DONT : "\uFFFE",
		TELOPT_EOR : "\x19",
		EOR : "\xEF"
	}

function char2hex(d) { 
	if (!d) return undefined;
	var result="";
	for (var i=0;i<d.length;i++) {
		result+=d.charCodeAt(i).toString(16);
	}
	return result;
}
var TELNET_RE = new RegExp("(?:(["+IAC.WILL+IAC.WONT+IAC.DO+IAC.DONT+"]+)("+".)|"+IAC.SB+"+(.)(.+?)"+IAC.SE+"+)","g")
function extractIAC(result) {
	if (!result.line.match(TELNET_RE)) return result;
	result.history.push(result.line);
	result.telnegs=[];
	var match, found, line=result.line;
	while (match = TELNET_RE.exec(line)) {
		result.telnegs.push({op:char2hex(match[1] || match[3]), value: char2hex(match[2] || match[4]), sidebuffer : !!match[3]});
//		console.log(char2hex(match[0]));
		console.log("OP: "+char2hex(match[1])+" VALUE: "+char2hex(match[2])+" SB OP: "+char2hex(match[3])+" VALUE: "+match[4]);
	}
	result.line=line.replace(TELNET_RE,"");
	return result;
}