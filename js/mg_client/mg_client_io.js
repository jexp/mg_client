	function connect(receive) {
		var url = "http://"+HOST+":"+PORT+"/"; // todo socket.io

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
