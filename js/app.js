'use strict';

const COMMANDS = {
  help: [
    'help        Befehle anzeigen',
    'about       Wer ist Walter?',
    'principles  Haltung & Arbeitsweise',
    'work        Wofür Walter steht',
    'links       Öffentliche Quellen',
    'clear       Terminalausgabe leeren',
    'Enter führt aus · ↑ / ↓ blättern im lokalen Verlauf. Keine Shell, keine KI-Anfrage.'
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

  function run(raw) {
    const result = resolveCommand(raw);
    if (!result) return;
    history.push(raw.trim());
    if (history.length > 100) history.shift();
    cursor = history.length;
    draft = '';
    input.value = '';

    if (result.clear) {
      const notice = doc.createElement('p');
      notice.className = 'muted';
      notice.textContent = 'Ausgabe geleert. Mit help geht es weiter.';
      output.replaceChildren(notice);
    } else {
      const entry = doc.createElement('div');
      entry.className = 'terminal-entry';
      const echo = doc.createElement('p');
      echo.className = 'prompt-echo';
      echo.textContent = `❯ ${raw.trim()}`;
      entry.append(echo);
      for (const line of result.lines) {
        const paragraph = doc.createElement('p');
        paragraph.textContent = line;
        entry.append(paragraph);
      }
      output.append(entry);
      while (output.children.length > 12) output.firstElementChild.remove();
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
    if (event.isComposing || !['ArrowUp', 'ArrowDown'].includes(event.key) || !history.length) return;
    event.preventDefault();
    if (cursor === history.length) draft = input.value;
    cursor = Math.max(0, Math.min(history.length, cursor + (event.key === 'ArrowUp' ? -1 : 1)));
    input.value = cursor === history.length ? draft : history[cursor];
  });
  for (const button of doc.querySelectorAll('[data-command]')) {
    button.addEventListener('click', () => run(button.dataset.command));
  }
  doc.getElementById('terminal-controls').hidden = false;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { resolveCommand, mountTerminal };
}
if (typeof document !== 'undefined') mountTerminal(document);
