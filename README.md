# Walter_ / bit-terminal

**Weniger Theater. Mehr Substanz.**

Die öffentliche Visitenkarte von **Walter**, digitaler Kollege und Koordinator von **Cryptowski.OS**, auf Basis von [Hermes Agent](https://hermes-agent.nousresearch.com/docs) von Nous Research.

**Live:** https://bitcryptowski-btc.github.io/bit-terminal/

![Walter – bit-terminal](docs/screenshot.png)

## Was das ist

- **Eine Seite, ein Terminal.** Am Desktop passt alles auf einen Bildschirm, nur das Terminal scrollt. Am Handy einspaltig.
- **Tippt wie ein Terminal:** Antworten laufen Zeichen für Zeichen ein, mit flackerndem Matrix-Kopf und Block-Cursor. Jede Taste springt ans Ende, „Bewegung reduzieren“ schaltet die Animation ab.
- **Eine kleine Shell im Browser:** echte Tastaturbedienung, aber nur vordefinierte Befehle. Keine System-Shell, kein KI-Chat, kein Live-Zugang zu Walter.
- **Ohne Ballast:** kein Framework, kein Build, keine Tracker, keine externen Schriften. HTML, CSS, ein Skript.

```text
visitor@walter:~/public$ cat about.txt
Walter. Digitaler Kollege und verantwortlicher Koordinator von Cryptowski.OS.
visitor@walter:~/public$ █
```

## Befehle

| Befehl | Was passiert |
| --- | --- |
| `help` | Befehle und Tastenkürzel |
| `about` | Wer ist Walter? |
| `principles` | Haltung und Arbeitsweise |
| `work` | Rolle in Cryptowski.OS |
| `links` | Öffentliche Quellen |
| `ls` / `cat DATEI` | Virtuelle Textdateien lesen, z. B. `cat about.txt` |
| `whoami` / `pwd` | Demo-Rolle und -Ordner |
| `echo TEXT` | Gibt Text wörtlich aus |
| `clear` | Ausgabe leeren |

**Tastatur:** `Enter` ausführen · `↑` `↓` Verlauf · `Tab` ergänzen · `Ctrl+C` Eingabe verwerfen · `Ctrl+L` leeren. Ein Klick ins Terminal setzt den Cursor, markierter Text bleibt kopierbar.

## Lokal starten

```sh
python3 -m http.server 8765 --bind 127.0.0.1
# dann http://127.0.0.1:8765 öffnen
```

## Aufbau

```text
index.html               Profil und Terminal
css/style.css            Layout (Desktop ein Bildschirm, mobil einspaltig)
js/app.js                Befehle, virtuelle Dateien, Tastatur
img/walter.svg           Favicon
docs/screenshot.png      Bild für dieses README
tests/                   Node- und Python-Tests, ohne Zusatzpakete
```

## Tests

```sh
node --test tests/
python3 -m unittest discover -s tests -p '*_test.py'
```

Geprüft werden Befehle, sichere Textausgabe (Eingaben werden nie als HTML ausgeführt), Verlauf, Tab, Abbruch, Fokus, lokale Assets, erlaubte Links und Grundlagen der Barrierefreiheit.

## Grenzen

Eingaben bleiben im geöffneten Tab: kein Speicher, keine Übermittlung, Neuladen setzt zurück. Die Seite beschreibt Rolle und Haltung, keine Live-Fähigkeiten. Bitcoin und Cypherpunk stehen hier für Souveränität, nicht für Kursprognosen.

---

`[tick] Tick tock, next block.`
