###
kkwer
Aramus, Arson, Artalon, Bambulko, Cruelday, Derin, Dotz, Gloinson,
Jimdigriz, Khazadem, Khidar, Lysania, Marcus, Mesirii, Nevada, Randell,
Raspel, Tolot, Wolowizard.
> 
kwer
     Liste der Mitspieler vom Sam, 24. Sep 2011, 02:36:31 (19 Teilnehmer)     

Artalon........i.s Aramus.........J.s Khazadem.......J.s Randell........J.s
Wolowizard.....J.s Tolot............s Cruelday.......iws Arson..........j.s
Lysania........J.Z Raspel.........I.S Khidar...........S Nevada.........J.S
Derin..........i.S Mesirii........I.Z Dotz...........I.S Jimdigriz......J.m
Marcus.........J.m Bambulko.......j.M Gloinson.........H

>
###
online = {}
makeOnlineTab = (onlineTab) ->
    onlineTab.append($("""
        <button onClick="send('kwer')">Aktualisieren</button>
        <table cellpadding="0" cellspacing="0" border="0" class="display" id="online_table"></table>
    """))
    $('#online_table').dataTable( { 
      bJQueryUI: true, 
      sDom: '<"table_top"f<"table_toolbar">>rt<"table_bottom"ipl><"clear">',
      aoColumns: [ { sTitle: "Name", sWidth : "20em", fnRender: (obj) ->
                        name = obj.aData[ obj.iDataColumn ]
                        "<span onClick='chatTab(\""+name+"\")'>"+name+"</span>"
                 },
                 { sTitle: "Stufe", sWidth : "2em" }, 
                 { sTitle: "Idle", sWidth : "2em" }, 
                 { sTitle: "Abwesend", sWidth : "2em" } ] } 
      )
    $('#chat_online .table_toolbar').prepend($('#chat_online button').button())
    
makeChatWindow = () ->
  chat = addWindow("Chat")
  chat.tabs({ panelTemplate : "<div></div>" });
  chat.tabs('add','#chat_online','Anwesende',0)
  makeOnlineTab($('#chat_online'))
  showTab("chat_online")
  chat.hide()

window.closeChatTab = (name) ->
  id = name.toLowerCase()
  tabId = '#chat_tab_'+id
  $('#Chat').tabs('remove',tabId)

window.chatTab = (name) ->
  id = name.toLowerCase()
  tabId = '#chat_tab_'+id
  tab = $(tabId)
  if !tab.length
    $('#Chat').tabs('add',tabId, name, 1) 
    tab = $(tabId)
    tab.append("""<pre id="chat_#{id}" style='overflow-y:auto;height:80%;width:80%;padding:5px;border:1px solid black;max-height:10em;'></pre>""")
    tab.append("""<form onSubmit="var i=this.elements[0]; send('teile #{id} mit '+i.value);i.focus();i.select();return false;">
                  <input size="80" id="chat_input_#{id}" type='text'/>
                  <button>Senden</button>
                  </form>""")
    tab.children('form').children('button').button()
    $('#Chat ul li a[href=#chat_tab_'+id+']').parent().append($("""<button onClick='closeChatTab("#{id}");return false;'>X</button>""").button())

  $('#chat_'+id).text(online[id].text.join("\n")) if online[id].text
  showTab("chat_tab_"+id)
   
window.showOnline = () ->
  rows = ([data.name, data.level||"?", data.idle||"", data.away ||""] for name, data of online)
  table = $('#online_table').dataTable()
  table.fnClearTable()
  table.fnAddData(rows)
  showTab("chat_online")

  
add_chat_triggers = (player) ->
    addTrigger "teile_mit", 
               (line) -> 
                 if match = line.match(/(?:Du teilst (.+)|(.+) teilt Dir) mit: (.+)/)
                   prefix = if match[1] then "->" else "<-"
                   other = match[1] || match[2]
                   text = match[3]
                   id = other.toLowerCase()
                   online[id]={ name : text : [] } if !online[id]
                   online[id].text = [] if (!online[id].text)
                   online[id].text.push(prefix+" "+text)
                   chatTab(other)
                 line
    addTrigger "chat_kkwer", 
               collect({start:/kkwer/, 
               fun : (text,lines) ->
                  for line in lines
                    if match = line.match(/[,.]$/)
                      names = line.split /[,.]\s*/
                      for name in names
                        online[name.toLowerCase()]={name:name}
                  console.log(online)
               })
    addTrigger "chat_kwer", 
               collect({start:/\ +Liste\ der\ Mitspieler\ vom\ .+/, 
               fun : (text,lines) ->
                  re = /^(\w+)\.+([.iIjJ])([.w])(.)/
                  for line in lines
                    if line.match(re)
                      entries = line.split /\ /
                      for entry in entries
                        if match = entry.match(re)
                          name = match[1]
                          online[name.toLowerCase()]={name:name, idle:match[2], away : match[3], level : match[4]}
                  console.log(online)
                  showOnline()
               })
    makeChatWindow()
    player

addHook "connect", "add_chat_triggers", add_chat_triggers
