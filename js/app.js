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
  // Ausgabe und Prompt scrollen gemeinsam in einem Fenster wie ein echtes Terminal.
  const scroller = doc.getElementById('terminal-body') || output;
  const history = [];
  let cursor = 0;
  let draft = '';

  // Tipp-Animation wie im Original: Text läuft Zeichen für Zeichen ein, vorne ein paar
  // flackernde Matrix-Zeichen und ein Block-Cursor. Ohne Browser-Animation (Tests) oder
  // bei "Bewegung reduzieren" erscheint der Text sofort. Jede Taste springt ans Ende.
  const view = doc.defaultView;
  const animate = Boolean(view && typeof view.requestAnimationFrame === 'function'
    && !view.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const GLYPHS = '01<>/\\|{}[]*+=#$%&@~^'; // nur ASCII: läuft in jeder Monospace-Schrift
  let typing = null;

  function finishTyping() {
    if (typing) typing.finish();
  }

  function typeOut(elements) {
    if (!animate) return;
    finishTyping();
    const texts = [];
    for (const element of elements) {
      const walker = doc.createTreeWalker(element, view.NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.nodeValue.trim()) continue;
        texts.push([node, node.nodeValue]);
        node.nodeValue = '';
      }
    }
    if (!texts.length) return;
    const total = texts.reduce((sum, [, text]) => sum + text.length, 0);
    const perSecond = Math.max(140, total / 1.6); // Original-Tempo, lange Ausgaben höchstens ~1,6 s
    const head = doc.createElement('span');
    head.className = 'typing-head';
    head.setAttribute('aria-hidden', 'true');
    let index = 0;
    let pos = 0;
    let last = 0;
    output.setAttribute('aria-busy', 'true');
    form.classList.add('typing');

    function done() {
      for (const [node, text] of texts) node.nodeValue = text;
      head.remove();
      output.setAttribute('aria-busy', 'false');
      form.classList.remove('typing');
      typing = null;
      scroller.scrollTop = scroller.scrollHeight;
    }

    function frame(now) {
      if (typing !== state) return;
      let budget = last ? Math.max(1, Math.round((now - last) * perSecond / 1000)) : 1;
      last = now;
      while (budget > 0 && index < texts.length) {
        const [node, text] = texts[index];
        const take = Math.min(budget, text.length - pos);
        pos += take;
        budget -= take;
        node.nodeValue = text.slice(0, pos);
        if (pos >= text.length) { index += 1; pos = 0; }
      }
      if (index >= texts.length) { done(); return; }
      const [node, text] = texts[index];
      let noise = '';
      for (let k = 0; k < Math.min(3, text.length - pos); k++) noise += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      head.textContent = noise;
      node.after(head);
      scroller.scrollTop = scroller.scrollHeight;
      view.requestAnimationFrame(frame);
    }

    const state = { finish: done };
    typing = state;
    view.requestAnimationFrame(frame);
  }

  function appendEntry(raw, lines) {
    const entry = doc.createElement('div');
    entry.className = 'terminal-entry';
    const echo = doc.createElement('p');
    echo.className = 'prompt-echo';
    echo.textContent = raw; // Prompt kommt per CSS davor
    entry.append(echo);
    for (const line of lines) {
      const paragraph = doc.createElement('p');
      paragraph.textContent = line;
      entry.append(paragraph);
    }
    output.append(entry);
    while (output.children.length > 12) output.firstElementChild.remove();
    scroller.scrollTop = scroller.scrollHeight;
    typeOut([...entry.children].slice(1)); // die eingegebene Zeile steht sofort, die Antwort tippt
  }

  function clearOutput() {
    const notice = doc.createElement('p');
    notice.className = 'muted';
    notice.textContent = 'Ausgabe geleert. Mit help geht es weiter.';
    finishTyping();
    output.replaceChildren(notice);
    typeOut([notice]);
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
    scroller.scrollTop = scroller.scrollHeight;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (event.isComposing) return;
    run(input.value);
  });
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    finishTyping();
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
  scroller.addEventListener('click', event => {
    if (event?.target?.closest?.('button')) return;
    if (!doc.defaultView?.getSelection()?.toString()) input.focus({ preventScroll: true });
  });
  form.hidden = false;
  typeOut([...output.children]); // Begrüßung tippt beim Laden, wie im Original
}

// Easter Egg aus dem Original: Verlässt man den Tab, ruft der Titel nach dem Dude.
// Ruhiger als früher (ca. 1 s statt 100 ms); bei "Bewegung reduzieren" ohne Blinken.
function mountTitleEgg(doc) {
  const view = doc.defaultView;
  if (!view || typeof view.setInterval !== 'function') return;
  const original = doc.title;
  const call = '💩🤖 Äh, Dude?';
  const calm = view.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let timer = null;
  doc.addEventListener('visibilitychange', () => {
    view.clearInterval(timer);
    timer = null;
    if (!doc.hidden) { doc.title = original; return; }
    doc.title = call;
    if (!calm) timer = view.setInterval(() => { doc.title = doc.title === call ? original : call; }, 1000);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { resolveCommand, mountTerminal, mountTitleEgg };
}
if (typeof document !== 'undefined') {
  mountTerminal(document);
  mountTitleEgg(document);
}
