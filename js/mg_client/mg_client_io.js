	function connect(receive) {
		var url = "ws://"+HOST+":"+PORT+"/"; // todo socket.io
		var ws;
		if ("MozWebSocket" in window) {
			ws = new MozWebSocket(url);
		} else if ("WebSocket" in window) {
			ws = new WebSocket(url);
		}
		console.log("ws "+ws+" url "+url+" "+typeof(MozWebSocket));
		ws.onmessage = function(e) { 
//			console.log(e.data.toString());
			receive(e.data.toString());
		};
		ws.onclose = function() { 
			ws.send("connect"); 
		};
		ws.onopen = function() {};
		return ws;
	}
