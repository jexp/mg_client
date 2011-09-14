net = require 'net'
Telnet = {}
Telnet.connect = (host,port,onData, onClose = (error) -> ) ->
  telnet = net.createConnection port, host
  telnet.on "close", -> console.log "server closed"
  telnet.on "end",  -> 
    telnet.end()
    console.log "server closed"
    onClose(null)
  telnet.on "data", (data) -> 
    onData data.toString()
  telnet.on "error", (e) -> 
    console.log "Error" + e
    telnet.end()
    onClose(e)
  telnet.send = (data) -> telnet.write data
  telnet

ws = require('socket.io').listen(8002)

ws.set('log level', 1)
ws.set('timeout', 3600000)
ws.sockets.on('connection', (conn) ->
  console.log("connection established")
  	
  console.log("remote address"+conn.remoteAddress)
  input = ""
  conn.on "message", (msg) -> 
#    console.log msg
    return if msg.match /^telnet\|.+/ 
    if msg.match /.*\n/
      telnet.send input + msg
      input = ""
    else
      input += msg

  conn.on('disconnect', (x) -> 
    console.log("disconnect "+x)
    telnet.end()
  )
  conn.on('error', (e) -> 
    console.log("error "+e)
    telnet.end()
  )
  telnet = Telnet.connect("localhost",4711,
    (data) -> 
      console.log("## "+data.substr(data.length-30))
      if data
        conn.send(data, (response) -> console.log("response "+response) if response)
    (error) -> 
      conn.send error if error
  )
)
