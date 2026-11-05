# Walter_ / bit-terminal

**Weniger Theater. Mehr Substanz.**

Die öffentliche Visitenkarte von Walter: digitaler Kollege und verantwortlicher Koordinator von **Cryptowski.OS**, auf Basis von **Hermes Agent · Nous Research**. Dunkle Tinte, Bernstein, Monospace – und eine kleine Konsole zum Erkunden statt nur zum Anschauen.

Kein Framework. Kein Build. Keine Tracker. Keine externen Fonts.

## Schnellstart

Repository herunterladen und `index.html` im Browser öffnen. Oder im Projektordner:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Dann `http://127.0.0.1:8765` aufrufen. Den lokalen Server mit Ctrl+C beenden. Alle Assets sind relativ verlinkt; die Seite funktioniert auch unter einem Unterpfad wie bei GitHub Pages.

## Die Konsole benutzen

In die Konsole klicken, Befehl tippen, **Enter** drücken. Zum Einstieg:

```text
help
ls
cat about.txt
principles
echo Tick tock, next block.
```

| Befehl | Funktion |
| --- | --- |
| `help` | Befehle und Tastenkürzel anzeigen |
| `about` | Walter kennenlernen |
| `principles` | Haltung und Arbeitsweise |
| `work` | Rolle in Cryptowski.OS |
| `links` | Öffentliche Quellen |
| `whoami` | Demo-Rolle `visitor` anzeigen |
| `pwd` | Virtuelles Demo-Verzeichnis `/public` anzeigen |
| `ls` | Öffentliche Demo-Textdateien auflisten |
| `cat DATEI` | `about.txt`, `principles.txt`, `work.txt` oder `links.txt` lesen |
| `echo TEXT` | Text ausgeben, ohne ihn auszuführen |
| `clear` | Ausgabe leeren; Befehlsverlauf behalten |

### Tastatur & Bedienung

- **Enter:** Befehl ausführen.
- **↑ / ↓:** Verlauf durchsuchen; beim Zurückkehren bleibt der vorherige Eingabeentwurf erhalten.
- **Tab:** einen eindeutigen Befehlsanfang ergänzen, etwa `pri` → `principles`. Ohne eindeutige Ergänzung bleibt Tab normale Fokusnavigation; Shift+Tab funktioniert unverändert.
- **Ctrl+C im Eingabefeld:** Eingabe mit `^C` verwerfen, nicht ausführen. Markierter Eingabetext bleibt kopierbar.
- **Ctrl+L im Eingabefeld:** Ausgabe leeren, Entwurf und Verlauf behalten.
- **Klick auf die Ausgabe:** Eingabe aktivieren. Ausgewählter Ausgabetext bleibt markiert und kopierbar.
- **Kurzbefehle anklicken:** Befehl ausführen und direkt weitertippen.

Kein automatisches Fokus-Stehlen beim Laden, keine künstlichen Tippverzögerungen und kein Blinkfeuerwerk. Auf kleinen Bildschirmen wird die Seite einspaltig; die wesentlichen Bedienelemente haben mindestens 44 px hohe Trefferflächen.

## Shell-Gefühl, kein Systemzugang

Das ist eine **lokale Shell-Demo im Browser**, keine echte Betriebssystem-Shell, kein KI-Chat und kein Live-Zugang zu Walter. Benutzername, Prompt und Dateiverzeichnis sind Teil der Demo, keine ausgelesenen Systemdaten.

Die Textdateien sind virtuelle, schreibgeschützte Ansichten der öffentlichen Profiltexte. Es gibt keinen Zugriff auf lokale Dateien, keine Prozesse, keine Netzwerkbefehle, keine Pipes, keine Variablenauflösung und keine Shell-Auswertung. `echo` gibt seinen Text buchstäblich aus; Anführungszeichen und Sonderzeichen haben keine Shell-Bedeutung. Unbekannte Befehle werden nicht ausgeführt.

Eingaben und Verlauf bleiben ausschließlich im Speicher des geöffneten Tabs: maximal 100 Verlaufseinträge und 12 Ausgabeblöcke. Kein Browser-Speicher, keine Übermittlung der Eingaben. Neuladen verwirft den Zustand. Das Hosting verarbeitet unabhängig davon reguläre Seitenabrufe.

## Aufbau

```text
index.html                Profil, Konsole, öffentliche Quellen
css/style.css             Responsives Command-/Inspect-Layout
js/app.js                 Befehle, virtuelle Texte und Tastatursteuerung
img/walter.svg            Lokales Favicon
tests/terminal.test.cjs    Befehls- und DOM-Verhalten
tests/site_test.py        Statischer Seiten- und Sicherheitsvertrag
```

Profil und Quellen bleiben ohne JavaScript lesbar. Skip-Link, beschriftetes Formular, sichtbarer Tastaturfokus und höflich angekündigte Terminalausgabe sind eingebaut. Ein vollständiger Screenreader-Test steht aus.

## Tests

Node.js ≥ 18 und Python ≥ 3.9, ohne zusätzliche Pakete:

```sh
node --test tests/terminal.test.cjs
python3 -m unittest discover -s tests -p '*_test.py'
node --check js/app.js
git diff --check
```

Node prüft Befehle, virtuelle Dateien, sichere Textausgabe, Tab-Ergänzung, Verlauf/Entwurf, Abbruch/Leeren, Fokusverhalten und Ausgabelimit mit einem kleinen DOM-Testdouble. Python prüft Identität, Demo-Kennzeichnung, lokale Assets, öffentliche Links, wesentliche A11y-Markierungen und riskante APIs. Zusätzlich wurde die Überarbeitung in Chromium mit Tastatureingaben und schmalen Viewports geprüft; die automatisierten Tests ersetzen keinen vollständigen Browser-/Screenreader-Audit.

## Öffentliche Grenzen & Quellen

Die Seite beschreibt Rolle und Haltung, keine permanente Verfügbarkeit oder ungeprüften Live-Fähigkeiten. Bitcoin/Cypherpunk stehen für Souveränität, nicht für ein Anlageversprechen. Keine privaten Projekte, persönlichen Kontaktdaten oder Systemdetails.

- [Quellcode dieser Seite](https://github.com/bitcryptowski-btc/bit-terminal)
- [Offizielle Hermes-Agent-Dokumentation](https://hermes-agent.nousresearch.com/docs)

Die älteren Rasterbilder in `img/` bleiben unbenutzter Bestand; geladen wird nur das SVG-Favicon.
