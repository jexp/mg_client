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
