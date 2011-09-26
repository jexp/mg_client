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

>
 lies artikel 1
> lies artikel 1 in allgemeines

Danke (Mirimadel,  6. Sep 2011, 20:22:35):

Die Veraenderung beim Hoerrohr ist grossartig und spitzenmaessig.
Vielen Dank Zesstra und einen grossen blumenstrauss fuer Dich zum Dank.

>

###
mpa = {}
akt_rubrik = null

showRubriken = ->
  rows = ([rubrik.id, name, rubrik.count, rubrik.latest] for name, rubrik of mpa)
  table = $('#mpa_rubriken').dataTable()
  table.fnClearTable()
  table.fnAddData(rows)
  console.log "table heihgt "+table.height()
  $('#tab-mpa-rubriken').height(table.height())
  showTab("tab-mpa-rubriken")

showRubrik = (name) ->
  $('#mpa_rubrik_tab_name').text(name)
  rows = ([artikel.id, artikel.title, artikel.autor, artikel.replies, artikel.date ] for artikel in mpa[name].artikel)
  table = $('#mpa_rubrik').dataTable()
  table.fnClearTable()
  table.fnAddData(rows)
  $('#tab-mpa-rubrik').height(table.height())
  showTab("tab-mpa-rubrik")

window.liesArtikel = (rubrik,artikel) ->
  send("rubrik "+rubrik) if akt_rubrik != rubrik
  send("lies artikel "+artikel)

window.showArtikel = (artikel) ->
  console.log(artikel)
  $('#mpa_artikel_'+name).text(wert) for name, wert of artikel
  $('#mpa_artikel_tab_name').text(artikel.titel)
  $('#mpa_artikel_reply').attr("onClick", "writeArticle(\""+artikel.rubrik+"\","+artikel.id+")")
  showTab("tab-mpa-artikel")

window.writeArticle = (rubrik,id = 0) ->
    rubriken = if rubrik then [rubrik] else (name for name of mpa)
    rubriken = ("""<option value="#{name}">#{name}</option>""" for name in rubriken).join("\n")
    $("""<div id="mpa_edit_article">
    Rubrik: <select id="mpa_edit_article_rubrik">#{rubriken}</select> 
    <input type="submit" value="Veröffentlichen" onclick="submitArticle($('#mpa_edit_article_rubrik').val(),#{id})"/><br/>
    <input id="mpa_edit_article_title" size="78" placeholder="Titel"/>
    <textarea id="mpa_edit_article_text" cols="78" rows="15" wrap="soft"></textarea>
    </div>""")
    .dialog( {title: "Artikel verfassen, Rubrik: "+rubrik, width : 450, height : 300})
    $('#mpa_edit_article_title').hide() if (id) 
	
window.submitArticle = (rubrik,id) ->
    send("rubrik "+rubrik)
    if !id
      send("schreibe "+$('#mpa_edit_article_title').val()) 
    else
      if id > 0  
        send("antworte auf artikel "+id) 
      else
        send("antworte") 

    send($('#mpa_edit_article_text').val())
    send(".")
    $('#mpa_edit_article').dialog("close").dialog("destroy")
    
add_mpa_triggers = 
  (player) -> 
    addTrigger "rubrik_wechsel", 
               (result) -> 
                 if match = result.line.match(/Ok, Du hast die Rubrik (.+) mit \d+ Artikeln? aufgeschlagen. /)
                   akt_rubrik = match[1]
#                  send("inhalt "+akt_rubrik)
                   return true
                 false
    addTrigger "mpa_rubriken", 
               collect({gag: true, start:/Es gibt zur Zeit \d+ Rubriken./,
               addStart:true,
               action : (text,lines) ->
                  for line in lines
                    if match = line.match(/[> ]([*x -]) +(\d+)\. (.+?) +: +(- leer -|(\d+) Artikel \( ?(\d+\. \w{3} \d{2})\))/)
                      name = match[3];
                      mpa[name] = { title : name } if !mpa[name]
                      mpa[name].id = match[2];
                      mpa[name].count = if match[4] == "- leer -" then 0 else parseInt(match[5]) 
                      mpa[name].latest = if match[6] then match[6] else ""
                      mpa[name].ignore = match[1] != " "
                  console.log(mpa)
                  showRubriken()
               })
    addTrigger "mpa_rubrik", 
               collect({gag: true, start:/Inhalt der Rubrik (.+):/,
               addStart:true,
               action : (text,lines) ->
                  match = lines[0].match(/Inhalt der Rubrik (.+):/) 
                  name = match[1]
                  mpa[name] = { title: name } if !mpa[name]
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
               action : (text,lines) ->
                  match = lines[0].match(/(.+?) +\((\w+), +(\d+\. \w{3} \d{4}), (\d{1,2}:\d{2}:\d{2})\)/) 
                  artikel = { titel : match[1], autor: match[2], date:match[3], time:match[4], text : text, rubrik: akt_rubrik }
                  console.log(artikel)
                  showArtikel(artikel)
               })
#    send("rubriken")
    player

addHook "connect", "add_mpa_triggers", add_mpa_triggers

console.log "loaded mpa.coffee"