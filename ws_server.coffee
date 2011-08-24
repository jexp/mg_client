net = require 'net'
connect = (host,port,onData, onClose = (error) -> ) ->
  telnet = net.createConnection port, host
  telnet.on "close", -> console.log "server closed"
  telnet.on "end",  -> 
    telnet.end()
    console.log "server closed"
    onClose(null)
  telnet.on "data", (data) -> 
    console.log data.toString()
    onData data.toString()
  telnet.on "error", (e) -> 
    console.log "Error" + e
    telnet.end()
    onClose(e)
  telnet.send = (data) -> telnet.write data
  telnet

ws = require "websocket-server"
server = ws.createServer()

server.on "connection", (conn) ->
  telnet = connect("localhost",4711,
    (data) -> conn.send data
    (error) -> 
      conn.send error if error
      conn.close()
  )
  input = ""
  conn.on "message", (msg) -> 
    console.log msg
    return if msg.match /^telnet\|.+/ 
    if msg.match /.*\n/
      telnet.send input + msg
      input = ""
    else
      input += msg
    

console.log "Started..."
server.listen 8000