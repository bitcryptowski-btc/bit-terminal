'use strict';

const COMMANDS = {
  help: [
    'help        Befehle anzeigen',
    'about       Wer ist Walter?',
    'principles  Haltung & Arbeitsweise',
    'work        Wofür Walter steht',
    'links       Öffentliche Quellen',
    'clear       Terminalausgabe leeren',
    'whoami      Deine Rolle in dieser Demo',
    'pwd / ls    Öffentlichen Demo-Ordner erkunden',
    'cat DATEI   Öffentliche Textdatei lesen, z. B. cat about.txt',
    'echo TEXT   Text unverändert ausgeben',
    'Enter führt aus · ↑ / ↓ Verlauf · Tab vervollständigt eindeutige Befehle.',
    'Ctrl+C verwirft die Eingabe · Ctrl+L leert die Ausgabe (im Eingabefeld).',
    'Lokale Shell-Demo, keine System-Shell und keine KI-Anfrage.'
  ],
  principles: [
    '01 / Belege vor Behauptungen. Unklar bleibt unklar, bis es geprüft ist.',
    '02 / Verantwortung vor Aktionismus. Auftrag klären, Grenzen beachten, Ergebnis prüfen.',
    '03 / Souveränität vor Bequemlichkeit. Bitcoin, offene Werkzeuge und Privatsphäre als Kompass.',
    '04 / Klartext vor Theater. Ein guter Plan ersetzt keinen bestandenen Test.'
  ],
  work: [
    'Cryptowski.OS / Digital zusammenarbeiten, Verantwortung klar zuordnen.',
    'Walters Rolle: Aufgaben strukturieren, Arbeit koordinieren und Ergebnisse nachvollziehbar machen.',
    'Diese öffentliche Seite zeigt Haltung und Rolle – keine privaten Projekte, Systemzugänge oder Live-Funktionen.',
    'Das Terminal hier beantwortet ausschließlich vordefinierte Befehle im Browser.'
  ],
  links: [
    'Quellcode dieser Seite: https://github.com/bitcryptowski-btc/bit-terminal',
    'Hermes Agent: https://hermes-agent.nousresearch.com/docs',
    'Beide Quellen sind auch unterhalb des Terminals anklickbar.'
  ],
  about: [
    'Walter. Digitaler Kollege und verantwortlicher Koordinator von Cryptowski.OS.',
    'Basis: Hermes Agent von Nous Research. Haltung: präzise, ruhig, Bitcoin & Cypherpunk.',
    'Diese Seite ist eine statische Visitenkarte – kein Live-Zugang zu Walter oder seinen Systemen.'
  ]
};

function resolveCommand(raw) {
  const command = raw.trim().toLowerCase();
  if (!command) return null;
  if (command === 'clear') return { command, clear: true, lines: [] };
  if (command === 'whoami') return { command, lines: ['visitor'] };
  if (command === 'pwd') return { command, lines: ['/public'] };
  if (command === 'ls') return { command, lines: ['about.txt  principles.txt  work.txt  links.txt'] };
  const [verb, ...args] = raw.trim().split(/\s+/);
  if (verb.toLowerCase() === 'echo') {
    return { command, lines: [raw.trim().replace(/^echo\s*/i, '')] };
  }
  if (verb.toLowerCase() === 'cat') {
    const file = (args[0] || '').replace(/^\.\//, '');
    const name = file.replace(/\.txt$/, '');
    const readable = ['about', 'principles', 'work', 'links'];
    const lines = args.length === 1 && file === `${name}.txt` && readable.includes(name)
      ? [...COMMANDS[name]]
      : ['Datei nicht gefunden. ls zeigt die öffentlichen Demo-Dateien.'];
    return { command, lines };
  }
  const lines = Object.hasOwn(COMMANDS, command)
    ? [...COMMANDS[command]]
    : [`Unbekannter Befehl: ${raw.trim()}`, 'Mit help findest du die verfügbaren Befehle.'];
  return { command, lines };
}

function mountTerminal(doc) {
  const form = doc.getElementById('command-form');
  const input = doc.getElementById('command-input');
  const output = doc.getElementById('terminal-screen');
  const history = [];
  let cursor = 0;
  let draft = '';

  function appendEntry(raw, lines) {
    const entry = doc.createElement('div');
    entry.className = 'terminal-entry';
    const echo = doc.createElement('p');
    echo.className = 'prompt-echo';
    echo.textContent = `visitor@walter:/public ❯ ${raw}`;
    entry.append(echo);
    for (const line of lines) {
      const paragraph = doc.createElement('p');
      paragraph.textContent = line;
      entry.append(paragraph);
    }
    output.append(entry);
    while (output.children.length > 12) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  }

  function clearOutput() {
    const notice = doc.createElement('p');
    notice.className = 'muted';
    notice.textContent = 'Ausgabe geleert. Mit help geht es weiter.';
    output.replaceChildren(notice);
  }

  function run(raw) {
    const result = resolveCommand(raw);
    if (!result) return;
    history.push(raw.trim());
    if (history.length > 100) history.shift();
    cursor = history.length;
    draft = '';
    input.value = '';

    if (result.clear) {
      clearOutput();
    } else {
      appendEntry(raw.trim(), result.lines);
    }
    // Scroll only the log, never the whole document or the visitor's focus.
    output.scrollTop = output.scrollHeight;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (event.isComposing) return;
    run(input.value);
  });
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        clearOutput();
        return;
      }
      if (event.key.toLowerCase() === 'c' && input.selectionStart === input.selectionEnd) {
        event.preventDefault();
        appendEntry(`${input.value} ^C`, []);
        input.value = '';
        cursor = history.length;
        draft = '';
        return;
      }
    }
    if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey) {
      const prefix = input.value.trim().toLowerCase();
      const matches = [...Object.keys(COMMANDS), 'clear', 'whoami', 'pwd', 'ls', 'cat', 'echo'].filter(command => command.startsWith(prefix));
      if (prefix && matches.length === 1 && matches[0] !== prefix) {
        event.preventDefault();
        input.value = matches[0];
      }
      return;
    }
    if (!['ArrowUp', 'ArrowDown'].includes(event.key) || !history.length) return;
    event.preventDefault();
    if (cursor === history.length) draft = input.value;
    cursor = Math.max(0, Math.min(history.length, cursor + (event.key === 'ArrowUp' ? -1 : 1)));
    input.value = cursor === history.length ? draft : history[cursor];
  });
  for (const button of doc.querySelectorAll('[data-command]')) {
    button.addEventListener('click', () => {
      run(button.dataset.command);
      input.focus({ preventScroll: true });
    });
  }
  output.addEventListener('click', () => {
    if (!doc.defaultView?.getSelection()?.toString()) input.focus({ preventScroll: true });
  });
  doc.getElementById('terminal-controls').hidden = false;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { resolveCommand, mountTerminal };
}
if (typeof document !== 'undefined') mountTerminal(document);
