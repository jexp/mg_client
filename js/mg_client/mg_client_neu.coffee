window.loginGuest = ->
  $("#d_login").dialog("destroy")
  send("gast")
  send("m")

window.showNewPlayerDialog = ->
  $("#d_login").dialog("destroy")
  try
    html = """
      <div id="d_register">
         <ul></ul>
      </div>
    """
    tabs = $(html).tabs({ cache: true }).css({width:600,height:500, position:"absolute",top:"5%",left:"20%"}).appendTo($('body'))
    tabs.tabs("add","register_name.html","Logindaten")
    tabs.tabs("add","register_mud.html","Charakter")
    tabs.tabs("add","register_info.html","Informationen")
    makeTabWindow(tabs)
    addTrigger("register_login",highlight({count:1, trigger: /Genug der Regeln - wie moechtest Du in diesem Spiel heissen\?/,
    action : -> send(Player.name) if (Player.name) }))
    addTrigger("register_login_error",
                highlight(
                  { trigger: /(Der Name ist zu kurz|Es existiert bereits ein Charakter dieses Namens|Benutze bitte nur Buchstaben ohne Umlaute)/,
                  action : (data) ->
                    tabs.tabs("select",0)
                    $('#register_login_error').text(data.match)
                    $('#f_register_name input[name=login]').val(Player.name).select().focus()
                    Player.send = -> send(Player.name)
                  }
                ))
    addTrigger("register_password_error",
                highlight(
                  { trigger: /(Das Passwort waere zu einfach zu erraten. Nimm bitte ein anderes)/,
                  action : (data) ->
                    tabs.tabs("select",0)
                    $('#register_password_error').text(data.match)
                    $('#f_register_name input[type=password]').val("").focus()
                    Player.send = -> send(Player.password)
                  }
                ))
    addTrigger("register_password",
                highlight(
                  {trigger: /Waehle ein Passwort:/,
                  action : ->
                    $('#register_login_error').text("")
                    send(Player.password) if (Player.password)
                  }
                ))
    addTrigger("register_password2",highlight({trigger: /Passwort bitte nochmal eingeben:/,
    action : -> send(Player.password) if (Player.password) }))
    addTrigger("register_mudder",
                highlight(
                  { trigger: /Hast Du schon einmal in einem MUD gespielt/,
                  action : ->
                    f = -> if Player.mudder then send("ja") else send("nein")
                    if typeof(Player.mudder) == "undefined" then Player.send = f else f()
                  }
                ))
    addTrigger("register_race",highlight({trigger: /Was willst Du tun:/,
    action : -> send(Player.race) if (Player.race) }))
    addTrigger("register_email",highlight({trigger: /Gib bitte Deine EMail-Adresse an/,
    action : -> send(Player.email) if (Player.email) }))
    addTrigger("register_gender",highlight({trigger: /Bist Du maennlich oder weiblich:/,
    action : -> send(Player.gender) if (Player.gender) }))
    addTrigger("register_done",highlight({count:1, trigger: /Willkommen, mein( Herr|e Dame)!/,
    action : -> removeTrigger("register",true) }))
   catch e
    console.log e

window.registerName = ->
# todo checks
  try
    window.Player = {} unless window.Player
    unless Player.send
      Player.send = -> send("neu")
    Player.name = $('#f_register_name input[name=login]').val()
    Player.id = Player.name.toLowerCase()
    Player.password = $('#f_register_name input[name=password]').val()
    Player.password2 = $('#f_register_name input[name=password2]').val()
    Player.email = $('#f_register_name input[name=email]').val()

    console.log """login #{Player.name} password #{Player.password} == #{Player.password2} email #{Player.email}"""

    login_error = 'Der Name darf nur Buchstaben enthalten und mindestens 3 Zeichen.' unless Player.id.match(/[a-z]{3,}/)
    if (login_error)
      $('#register_login_error').text(login_error)
      $('#f_register_name input[name=login]').val(Player.name).select().focus()

    password_error = 'Passwort muss mindestens 6 Zeichen enthalten' unless Player.password.match(/.{6,}/) && Player.password2.match(/.{6,}/)
    password_error = 'Passworte stimmen nicht ueberein' unless Player.password == Player.password2
    if (password_error)
      $('#register_password_error').text(password_error)
      $('#f_register_name input[type=password]').val("").focus()

    return if login_error || password_error
    # todo email
    Player.send()
    $("#d_register").tabs("select",1)
  catch e
    console.log e


window.registerMud = ->
  try
    Player.mudder = $('#f_register_mud input[name=mudder]').val()
    Player.race = $('#f_register_mud select[name=race]').val()
    Player.gender = $('#f_register_mud select[name=gender]').val()
    console.log """#{Player.mudder} race #{Player.race} gender #{Player.gender}"""
    ###
    send(if Player.mudder then "ja" else "nein")
    send(Player.race)
    send(Player.gender)
    send(Player.email)
    ###
    Player.send()
    $("#d_register").tabs("select",2)
  catch e
    console.log e

window.registerInfo = ->
  delete Player.start
  delete Player.password
  delete Player.password2
  $('#d_register').tabs('destroy')

window.doLogin = (d) ->
  name = $(d).children("input[name=login]").val()
  password = $(d).children("input[name=password]").val()
  $("#d_login").dialog("destroy")
  send(name)
  send(password)

window.showLoginDialog = ->
  html = """
    <div id="d_login">
      <form onSubmit="doLogin(this);return false;">
         Login: <input type="text" name="login" required="required" placeholder="name" pattern="[A-Za-z]{3,}"/><br/>
         Passwort: <input type="password" name="password" required="required" pattern=".{6,}"/><br/>
         <button class="ui-button ui-button-text-only ui-widget ui-state-default ui-corner-all">
            <span class="ui-button-text">Anmelden</span>
         </button>
         <button onClick="loginGuest();return false;" class="ui-button ui-button-text-only ui-widget ui-state-default ui-corner-all">
            <span class="ui-button-text">Gastzugang</span>
         </button>
         <button onClick="showNewPlayerDialog();return false;" class="ui-button ui-button-text-only ui-widget ui-state-default ui-corner-all">
            <span class="ui-button-text">Neuspieler</span>
         </button>
      </form>
    </div>
  """
  $(html).appendTo($('body')).dialog()

window.logoutButton = (player) ->
  $('#b_login').attr("onclick",null).click( -> send("schlafe ein")).children("span").text(player.name+" abmelden")

window.loginButton = (player) ->
  $('#b_login').attr("onclick",null).click( -> showLoginDialog()).children("span").text("Anmelden")

#addHook "startup","login", loginButton
addHook "connect","logoutButton", logoutButton
addHook "disconnect","loginButton", loginButton

###
Denk Dir jetzt bitte einen Namen fuer Deinen neuen Charakter aus.

Der Name sollte mindestens drei und hoechstens elf Buchstaben lang sein
und keine Sonderzeichen enthalten. Es waere schoen, wenn der Name zu einem
Fantasy-MUD passen wuerde, aber das ist keine Bedingung.

Doch ueberlege Dir Deine Wahl gut - Dein Name ist das Erste, was andere
Spieler von Dir sehen und er beeinflusst ihre Meinung von Dir, noch bevor
Du das erste Wort gesagt hast.

Beachte bei Deiner Namenswahl: Wenn Du einen Namen waehlst, der zu
Verwechslungen mit Monstern oder Gegenstaenden im Spiel fuehrt, kannst
Du in Probleme und heikle Situationen gelangen. Wenn Du Dir nicht sicher
bist, dann logg Dich doch kurz als Gast ein und befrage einen anwesenden
Magier nach Deinem Namenswunsch.

Bedenke: Nachtraeglich kann Dein Name nicht mehr geaendert werden!

Damit alle Seiten den Spass an diesem Spiel behalten, behaelt sich diesem
MUD-Leitung vor, allzu provozierende, beleidigende oder anstoessige Namen
auch noch nachtraeglich zu loeschen und zu sperren.

Genug der Regeln - wie moechtest Du in diesem Spiel heissen?
blubb
Es existiert bereits ein Charakter dieses Namens.
Gib Dir einen anderen Namen:
lubb
Waehle ein Passwort:

Das Passwort muss wenigstens 6 Zeichen lang sein.
Bitte gib ein Passwort an:
testtest


Zur Erinnerung: Es ist  v e r b o t e n, andere Spieler anzugreifen!
Das gilt auch fuer Froesche, bei denen "Ein Frosch namens XXXXX" steht.

Passwort bitte nochmal eingeben:


Wenn Du ein absoluter Neuling in diesem Spiel bist moechten wir Dir mit
einigen Tips zu Beginn beiseite stehen.

Hast Du schon einmal in einem MUD gespielt?(ja,nein):
nein


Eine kleine Einfuehrung in das MorgenGrauen bekommst Du auch hier:

http://mg.mud.de/newweb/hilfe/tutorial/inhalt.shtml

Du musst Dich jetzt entscheiden, welcher Rasse Du in dieser Welt angehoeren
moechtest. Alle Rassen haben verschiedene Vor- und Nachteile, insgesamt aber
gleich gute Chancen. Auch das Startgebiet haengt von der ausgewaehlten Rasse
ab. Im Normalfall kann die Rasse nicht mehr gewechselt werden, nachdem sie
einmal ausgewaehlt wurde. Ueberlege Dir Deine Entscheidung also gut. Derzeit
stehen folgende Rassen zur Auswahl:
 1. Mensch                           |  2. Dunkelelf
 3. Zwerg                            |  4. Elf
 5. Feline                           |  6. Goblin
 7. Hobbit                           |

Durch Eingabe einer Ziffer waehlst Du die Rasse aus, durch Eingabe eines "?"
gefolgt von einer Ziffer erhaelst Du naehere Informationen ueber eine Rasse.
Ein "?" allein wiederholt diese Liste.

Als Neuling solltest Du Dich NICHT fuer die Dunkelelfen entscheiden. Diese
Rasse hat einige Probleme im Umgang mit den anderen Rassen und mit dem
Sonnenlicht.

Was willst Du tun:
2
Ok, Du bist jetzt ein Dunkelelf.

Eine gueltige EMail-Adresse erleichtert es erheblich, Dir ein neues Passwort
setzen zu lassen, falls Du einmal Dein Passwort vergisst.

Gib bitte Deine EMail-Adresse an:
test@mesirii.de
Geschlecht:
Bist Du maennlich oder weiblich:
m
Willkommen, mein Herr!
Du bist jetzt Lubb 0 (Stufe 1).
------------------------------------------------------------------------------
== Regeln ==
Die Regeln sind mit dem Befehl "hilfe regeln" abrufbar.
Eine Einfuehrung fuer Anfaenger liefert "hilfe einfuehrung".

== Cicerone ==
Es gibt einige nette Spieler, die bereit sind, Dich auf Deinen ersten
Schritten im MorgenGrauen zu begleiten.

Derzeit sind davon Verstexe, Zesstra und Mesirii eingeloggt. Du kannst
einen oder eine von Ihnen ansprechen, indem Du z.B. einfach
  'teile verstexe mit Hallo ich bin neu hier, kannst Du mir bitte helfen?'
eintippst. Nur keine Scheu, diese Spieler haben sich freiwillig dazu
bereiterklaert!

Du kannst Dir diese Spieler jederzeit mit 'kwer cicerones' anzeigen lassen.

== Tutorial ==
Dir wird auf einmal bewusst, dass Du mehr ueber das Spiel hier lernen kannst,
wenn Du ein Tutorial absolvierst. Falls Du das willst, gib einfach "tutorial"
ein. Dies funktioniert fuer Dich nur in diesem Raum. Willst Du diese Nachricht
nicht mehr bekommen, dann gib ein "ignoriere tutorial". Entschliesst Du Dich
dazu, sie als Erinnerung doch wieder zu erhalten, gib einfach nochmal
"ignoriere tutorial" ein.

== Anfaenger-Info ==
Herzlich Willkommen! Falls Du noch nicht weisst, wie Du
auf der Ebene Anfaenger mit anderen reden kannst,
folgender Tip: Probiere mal '-anf Hallo Morgengrauen'
(natuerlich ohne die ' mit einzugeben) aus.
###
