"""Static contract checks; no third-party packages or network needed."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class SiteTests(unittest.TestCase):
    def setUp(self):
        self.html = (ROOT / 'index.html').read_text()
        self.page = Page()
        self.page.feed(self.html)

    def test_public_identity_and_honest_demo(self):
        self.assertIn(('html', {'lang': 'de'}), self.page.tags)
        self.assertRegex(self.html, r'<h1\b[^>]*>Walter')
        for phrase in ['Cryptowski.OS', 'Hermes Agent', 'Nous Research', 'Lokale Demo', 'kein Live-Zugang']:
            self.assertIn(phrase, self.html)
        self.assertNotIn('noindex', self.html)

    def test_assets_are_local_and_links_allowlisted(self):
        allowed = {'https://github.com/bitcryptowski-btc/bit-terminal', 'https://hermes-agent.nousresearch.com/docs'}
        for tag, attrs in self.page.tags:
            for key in ['src', 'href']:
                value = attrs.get(key, '')
                if not value or value.startswith('#'):
                    continue
                if value.startswith('https://'):
                    self.assertIn(value, allowed)
                    self.assertEqual(tag, 'a')
                else:
                    self.assertFalse(value.startswith('/'), value)
                    self.assertTrue((ROOT / value).is_file(), value)
        for asset in ['index.html', 'css/style.css', 'js/app.js']:
            source = (ROOT / asset).read_text()
            self.assertNotRegex(source, r'/home/|\b(?:\d{1,3}\.){3}\d{1,3}\b|mailto:|twitter.com|instagram.com')
        self.assertNotIn('@import', (ROOT / 'css/style.css').read_text())

    def test_accessible_terminal_contract(self):
        tags = self.page.tags
        self.assertTrue(any(t == 'label' and a.get('for') == 'command-input' for t, a in tags))
        self.assertTrue(any(a.get('role') == 'log' and a.get('aria-live') == 'polite' for _, a in tags))
        self.assertTrue(any(t == 'noscript' for t, _ in tags))
        commands = {a['data-command'] for _, a in tags if 'data-command' in a}
        self.assertTrue({'help', 'about', 'principles', 'work', 'clear'} <= commands)
        css = (ROOT / 'css/style.css').read_text()
        self.assertIn(':focus-visible', css)
        self.assertIn('prefers-reduced-motion', css)
        self.assertRegex(css, r'min-height:\s*44px')
        self.assertRegex(css, r'min-width:\s*44px')
        js = (ROOT / 'js/app.js').read_text()
        self.assertNotRegex(js, r'\beval\s*\(|innerHTML|document\.write|fetch\s*\(|localStorage')


if __name__ == '__main__':
    unittest.main()
