'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const context = { module: { exports: {} } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8'), context);
const api = context.module.exports;

class Element {
  constructor() { this.children = []; this.events = {}; this.value = ''; this.hidden = true; this.textContent = ''; this.scrollHeight = 100; }
  append(...nodes) { for (const n of nodes) { n.parent = this; this.children.push(n); } }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  remove() { this.parent.children.splice(this.parent.children.indexOf(this), 1); }
  get firstElementChild() { return this.children[0]; }
  addEventListener(name, fn) { this.events[name] = fn; }
  focus() { this.focused = true; }
  fire(name, extra = {}) { let prevented = false; this.events[name]({ preventDefault() { prevented = true; }, ...extra }); return prevented; }
}
function fixture() {
  const nodes = Object.fromEntries(['command-form', 'command-input', 'terminal-screen', 'terminal-controls'].map(id => [id, new Element()]));
  const buttons = ['help', 'about', 'principles', 'work', 'clear'].map(command => Object.assign(new Element(), { dataset: { command } }));
  const doc = { getElementById: id => nodes[id], createElement: () => new Element(), querySelectorAll: () => buttons };
  return { doc, nodes, buttons };
}

test('terminal submits safely, supports shortcuts, history/draft, bounded output and clear', () => {
  assert.equal(typeof api.mountTerminal, 'function');
  const { doc, nodes, buttons } = fixture();
  api.mountTerminal(doc);
  const input = nodes['command-input'];
  const output = nodes['terminal-screen'];
  const submit = value => { input.value = value; nodes['command-form'].fire('submit'); };
  assert.equal(nodes['terminal-controls'].hidden, false);
  assert.equal(input.focused, undefined, 'do not steal focus on page load');
  submit('about');
  assert.equal(output.children.length, 1);
  assert.equal(input.value, '');
  submit('<img src=x onerror=alert(1)>');
  const result = output.children.at(-1);
  assert.ok(result.children.some(p => p.textContent.includes('<img src=x onerror=alert(1)>')));
  input.value = 'my draft';
  assert.equal(input.fire('keydown', { key: 'ArrowUp' }), true);
  assert.equal(input.value, '<img src=x onerror=alert(1)>');
  input.fire('keydown', { key: 'ArrowUp' });
  assert.equal(input.value, 'about');
  input.fire('keydown', { key: 'ArrowDown' });
  input.fire('keydown', { key: 'ArrowDown' });
  assert.equal(input.value, 'my draft');
  assert.equal(input.fire('keydown', { key: 'ArrowLeft' }), false);
  assert.equal(input.fire('keydown', { key: 'ArrowUp', isComposing: true }), false);
  buttons[2].fire('click');
  assert.match(output.children.at(-1).children.map(p => p.textContent).join(' '), /Souveränität/);
  for (let i = 0; i < 30; i++) submit('help');
  assert.equal(output.children.length, 12);
  buttons[4].fire('click');
  assert.equal(output.children.length, 1);
  assert.match(output.children[0].textContent, /geleert/);
  submit('   ');
  assert.equal(output.children.length, 1);
  input.fire('keydown', { key: 'ArrowUp' });
  assert.equal(input.value, 'clear');
});

test('routes only documented commands, treats unknown input as plain text, and clears explicitly', () => {
  for (const command of ['help', 'about', 'principles', 'work', 'links']) {
    assert.ok(api.resolveCommand(command).lines.length > 0, command);
    assert.match(api.resolveCommand('help').lines.join(' '), new RegExp(command));
  }
  assert.equal(api.resolveCommand('clear').clear, true);
  assert.equal(api.resolveCommand('   '), null);
  const hostile = '<img src=x onerror=alert(1)>';
  assert.match(api.resolveCommand(hostile).lines.join(' '), /Unbekannter Befehl/);
  assert.ok(api.resolveCommand(hostile).lines.join(' ').includes(hostile));
  assert.match(api.resolveCommand('constructor').lines.join(' '), /Unbekannter Befehl/);
  assert.match(api.resolveCommand('about extra').lines.join(' '), /Unbekannter Befehl/);
});

test('Tab completes a command without executing or trapping normal Tab navigation', () => {
  const { doc, nodes } = fixture();
  api.mountTerminal(doc);
  const input = nodes['command-input'];
  input.value = 'pri';
  assert.equal(input.fire('keydown', { key: 'Tab' }), true);
  assert.equal(input.value, 'principles');
  assert.equal(nodes['terminal-screen'].children.length, 0);
  assert.equal(input.fire('keydown', { key: 'Tab' }), false);
  input.value = 'ab';
  assert.equal(input.fire('keydown', { key: 'Tab', shiftKey: true }), false);
  assert.equal(input.value, 'ab');
});

test('read-only shell commands inspect only public virtual files and echo literal text', () => {
  assert.equal(api.resolveCommand('whoami').lines[0], 'visitor');
  assert.equal(api.resolveCommand('pwd').lines[0], '/public');
  assert.match(api.resolveCommand('ls').lines.join(' '), /about.txt/);
  assert.match(api.resolveCommand('cat about.txt').lines.join(' '), /Walter/);
  assert.match(api.resolveCommand('cat ./principles.txt').lines.join(' '), /Souveränität/);
  assert.match(api.resolveCommand('cat ../../etc/passwd').lines.join(' '), /nicht gefunden/);
  assert.equal(api.resolveCommand('echo Tick TOCK; <script>').lines[0], 'Tick TOCK; <script>');
  assert.match(api.resolveCommand('help').lines.join(' '), /whoami/);
  assert.match(api.resolveCommand('help').lines.join(' '), /Tab/);
});

test('shell controls cancel drafts, clear output and return focus after shortcuts', () => {
  const { doc, nodes, buttons } = fixture();
  api.mountTerminal(doc);
  const input = nodes['command-input'];
  const output = nodes['terminal-screen'];
  input.value = 'unfinished';
  assert.equal(input.fire('keydown', { key: 'c', ctrlKey: true }), true);
  assert.equal(input.value, '');
  assert.match(output.children.at(-1).children[0].textContent, /unfinished.*\^C/);
  buttons[0].fire('click');
  assert.equal(input.focused, true);
  assert.equal(input.fire('keydown', { key: 'l', ctrlKey: true }), true);
  assert.match(output.children[0].textContent, /geleert/);
  input.fire('keydown', { key: 'ArrowUp' });
  assert.equal(input.value, 'help', 'Ctrl+L and cancelled input must not enter history');
});

test('clicking the terminal output activates input without breaking text selection', () => {
  const { doc, nodes } = fixture();
  let selected = '';
  doc.defaultView = { getSelection: () => ({ toString: () => selected }) };
  api.mountTerminal(doc);
  nodes['terminal-screen'].fire('click');
  assert.equal(nodes['command-input'].focused, true);
  nodes['command-input'].focused = false;
  selected = 'copy this';
  nodes['terminal-screen'].fire('click');
  assert.equal(nodes['command-input'].focused, false);
});

test('about identifies Walter without claiming a live connection', () => {
  assert.equal(typeof api.resolveCommand, 'function');
  const result = api.resolveCommand('  ABOUT  ');
  assert.equal(result.command, 'about');
  assert.match(result.lines.join(' '), /Walter/);
  assert.match(result.lines.join(' '), /Hermes Agent/);
  assert.match(result.lines.join(' '), /kein Live-Zugang/);
});
