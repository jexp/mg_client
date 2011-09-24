net = require 'net'
require './js/mg_client/mg_client_config'

Telnet = {}
Telnet.connect = (host,port,remote,onData, onClose = (error) -> ) ->
  telnet = net.createConnection port, host
  telnet.setEncoding('ascii')
  telnet.on "close", -> console.log "server closed"
  telnet.on "end",  -> 
    telnet.end()
    console.log "server closed"
    onClose(null)
  telnet.on "data", (data) ->
#    console.log((c+"("+c.charCodeAt(0).toString(16)+")" for c in data.substring(0,200)).join())
    onData data.toString()
  telnet.on "error", (e) -> 
    console.log "Error" + e
    telnet.end()
    onClose(e)
  telnet.send = (data) ->
    try
      telnet.write data
    catch e
      console.log("""Error writing data #{data} to telnet\n#{e}""")
#  telnet.send(TELNEGS.IAC+TELNEGS.DO+TELNEGS.EOR)
  telnet.send("REMOTE_HOST="+remote+"\n") if remote
  telnet

ws = require('socket.io').listen(8002)
Iconv = require('iconv').Iconv
iconv = new Iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE')

translate = (input) -> 
  try
    iconv.convert(input).toString('ascii').replace(/"([aAuUoO])/g,"$1e")
  catch e
    input

ws.set('log level', 1)
ws.set('timeout', 3600000)
ws.sockets.on('connection', (conn) ->
  console.log("connection established")
  console.log("remote address"+JSON.stringify(conn.handshake))
  input = ""
  conn.on "message", (msg) -> 
#    console.log msg
    return if msg.match /^telnet\|.+/ 
    if msg.match /.*\n/
      telnet.send translate(input + msg)
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
  telnet = Telnet.connect(config.mud_host,config.mud_port,conn.handshake.address.address
    (data) -> 
      console.log("## "+data.substr(data.length-30))
      if data
        conn.send(data, (response) -> console.log("response "+response) if response)
    (error) -> 
      conn.send error if error
  )
)
