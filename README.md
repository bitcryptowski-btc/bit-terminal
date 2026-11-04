# Walter / bit-terminal

Öffentliche Visitenkarte von Walter, digitalem Kollegen und verantwortlichem Koordinator von Cryptowski.OS. Basis: Hermes Agent von Nous Research.

## Betrieb

Statisches HTML/CSS/JavaScript, ohne Build, Bibliotheken, externe Fonts oder Tracker. `index.html` funktioniert direkt als Datei sowie unter einem Unterpfad (z. B. GitHub Pages).

Optional lokal ansehen:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Dann `http://127.0.0.1:8765` öffnen. Mit Ctrl+C beenden.

## Terminal

`help`, `about`, `principles`, `work`, `links`, `clear`. Enter führt aus; Pfeil hoch/runter navigiert durch den Verlauf und erhält den aktuellen Entwurf. Die sichtbaren Kurzbefehle sind auch per Tastatur bedienbar.

Das Terminal ist ausdrücklich eine lokale Demo mit festen Antworten, **keine Shell, kein KI-Chat und kein Live-Zugang**. Eingaben bleiben im Speicher dieses Tabs (max. 100 Verlaufseinträge, max. 12 Ausgabeblöcke); kein Browser-Speicher und keine Übermittlung. `clear` leert die Ausgabe, nicht den Verlauf. Ein Neuladen verwirft beides. Das Hosting verarbeitet unabhängig davon reguläre Seitenabrufe.

## Tests

Benötigt Node.js >= 18 und Python >= 3.9, keine Drittanbieterpakete:

```sh
node --test tests/terminal.test.cjs
python3 -m unittest discover -s tests -p '*_test.py'
node --check js/app.js
git diff --check
```

Node prüft Befehlsauflösung und die DOM-Anbindung mit einem kleinen DOM-Testdouble: Formular, Kurzbefehle, sichere Textausgabe, Verlauf/Entwurf, Ausgabelimit und Leeren. Python prüft Identität, Demo-Hinweis, lokale Assets, zulässige öffentliche Links, wesentliche A11y-Markierungen und riskante APIs/Alt-Kontaktdaten. Dies ersetzt keinen echten Browser- oder Screenreader-Test.

## Gestaltung & öffentliche Grenzen

Command / Inspect: dunkle Tinte, Bernstein, lokale Monospace-Schriften, fokussierte Profil-/Konsolenansicht; einspaltig auf kleinen Bildschirmen. Keine Blinkeffekte oder erzwungene Eingabefokussierung. Skip-Link, beschriftetes Formular, höflich angekündigte Terminalausgabe, sichtbarer Tastaturfokus und mindestens 44 px hohe Bedienelemente. Profil und Quellen bleiben ohne JavaScript lesbar.

Die Texte beschreiben Walters Rolle und Haltung, keine bewiesenen Live-Fähigkeiten oder permanente Verfügbarkeit. Bitcoin/Cypherpunk als Souveränitätsprinzip, nicht als Anlageversprechen. Nur dieses öffentliche Repository und die offizielle Hermes-Dokumentation werden verlinkt. Keine persönlichen Kontaktdaten, privaten Repositorys oder Systemdetails.

Die alten Rasterbilder in `img/` bleiben unbenutzt als Bestand erhalten; die Seite lädt ausschließlich das neue, textbasierte `img/walter.svg` als Favicon.
