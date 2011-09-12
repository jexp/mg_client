###
Es gibt zur Zeit 62 Rubriken.
(* oder x: enthaelt neue Artikel, x oder -: abbestellt, >: aktuelle Rubrik)

 x  1. allgemeines                            :   1 Artikel ( 6. Sep 11)
 *  2. anzeigen                               :         - leer -
>

> rubrik 1
Ok, Du hast die Rubrik allgemeines mit 1 Artikel aufgeschlagen. 

> inhalt [n|name]
Inhalt der Rubrik allgemeines:

Zur Zeit befindet sich ein Artikel in der Rubrik:

 1. Danke                                              3 (Mirimadel  )  6. Sep

> lies artikel 1
> lies artikel 1 in allgemeines
Danke (Mirimadel,  6. Sep 2011, 20:22:35):

Die Veraenderung beim Hoerrohr ist grossartig und spitzenmaessig.
Vielen Dank Zesstra und einen grossen blumenstrauss fuer Dich zum Dank.


###
mpa = {}
akt_rubrik = "allgemeines"

showRubriken = ->
  rows = ([rubrik.id, name, rubrik.count, rubrik.latest] for name, rubrik of mpa)
  table = $('#mpa_rubriken').dataTable()
  table.fnClearTable()
  table.fnAddData(rows)
  showTab("tab-mpa-rubriken")

showRubrik = (name) ->
  $('#mpa_rubrik_name').text(name)
  rows = ([artikel.id, artikel.title, artikel.autor, artikel.replies, artikel.date ] for artikel in mpa[name].artikel)
  table = $('#mpa_rubrik').dataTable()
  table.fnClearTable()
  table.fnAddData(rows)
  showTab("tab-mpa-rubrik")

window.liesArtikel = (rubrik,artikel) ->
  send("rubrik "+rubrik) if akt_rubrik != rubrik
  send("lies artikel "+artikel)

showArtikel = (artikel) ->
  console.log(artikel)
  $('#mpa_artikel_name').text(artikel.titel)
  setTabText("mpa_artikel",artikel.text,false)

add_mpa_triggers = 
  (player) -> 
    addTrigger "rubrik_wechsel", 
               (line) -> 
                 if match = line.match(/Ok, Du hast die Rubrik (.+) mit \d+ Artikeln? aufgeschlagen. /)
                   akt_rubrik = match[1]
#                  send("inhalt "+akt_rubrik)   
                 line
    addTrigger "mpa_rubriken", 
               collect({start:/Es gibt zur Zeit \d+ Rubriken./, 
               addStart:true,
               fun : (text,lines) ->
                  for line in lines
                    if match = line.match(/[> ]([*x -]) +(\d+)\. (.+) +: +(- leer -|(\d+) Artikel \( ?(\d+\. \w{3} \d{2})\))/)
                      name = match[3];
                      mpa[name] = { title : name, id : match[2] } if !mpa[name]
                      mpa[name].count = if match[4] == "- leer -" then 0 else parseInt(match[5]) 
                      mpa[name].latest = if match[6] then match[6] else ""
                      mpa[name].ignore = match[3] != " "
                  showRubriken()
               })
    addTrigger "mpa_rubrik", 
               collect({start:/Inhalt der Rubrik (.+):/, 
               addStart:true,
               fun : (text,lines) ->
                  match = lines[0].match(/Inhalt der Rubrik (.+):/) 
                  name = match[1]
                  mpa[name] = {} if !mpa[name]
                  mpa[name].artikel = []
                  for line in lines
                    if match = line.match(/\s*(\d+)\.[* ](.+?)  +(\d+) +\((\w+) *\) +(\d+\. \w{3})/)
                      artikel = { id: parseInt(match[1]), title: match[2], replies: parseInt(match[3]), autor: match[4], date : match[5]}
                      mpa[name].artikel.push(artikel)
                  console.log(mpa[name].artikel)
                  showRubrik(name)
               })
    addTrigger "mpa_artikel", 
               collect({start:/(.+?) +\((\w+), +(\d+\. \w{3} \d{4}), (\d{1,2}:\d{2}:\d{2})\):/, 
               addStart:true,
               fun : (text,lines) ->
                  match = lines[0].match(/(.+?) +\((\w+), +(\d+\. \w{3} \d{4}), (\d{1,2}:\d{2}:\d{2})\)/) 
                  artikel = { titel : match[1], autor: match[2], date:match[3], time:match[4], text : text}
                  console.log(artikel)
                  showArtikel(artikel)
               })
#    send("rubriken")
    return player

addHook "connect", "add_mpa_triggers", add_mpa_triggers

console.log "loaded mpa.coffee"