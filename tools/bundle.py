#!/usr/bin/env python3
"""Self-contained builds of the prototype.

  python3 tools/bundle.py

Writes:
  dist/index.html, dist/screens/*.html   every page with its CSS and JS inlined.
                                         Pages still link to each other, so the dist folder works offline.
  dist/my-workspace-standalone.html      the workspace page alone, one file. Every other screen is embedded, so it
                                         navigates and opens new tabs without leaving the file or touching the network.
"""
import os, re, glob, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
HOSTED = 'https://igeza.github.io/my-workspace/'

import base64
def _b64(f): return base64.b64encode(open(os.path.join(ROOT, 'assets', f), 'rb').read()).decode()
FAVICON = ('<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,' + _b64('favicon.svg') + '">'
           '<link rel="icon" type="image/png" sizes="32x32" href="data:image/png;base64,' + _b64('favicon-32.png') + '">'
           '<link rel="apple-touch-icon" href="data:image/png;base64,' + _b64('apple-touch-icon.png') + '">')

def read(p): return open(p, encoding='utf-8').read()

def inline(path):
    base = os.path.dirname(path)
    s = read(path)
    def css(m):
        p = os.path.normpath(os.path.join(base, m.group(1).split('?')[0]))
        return '<style>\n' + read(p) + '\n</style>' if os.path.exists(p) else m.group(0)
    def js(m):
        p = os.path.normpath(os.path.join(base, m.group(1).split('?')[0]))
        return '<script>\n' + read(p).replace('</script', '<\\/script') + '\n</script>' if os.path.exists(p) else m.group(0)
    s = re.sub(r'<link rel="stylesheet" href="((?:\.\./)?assets/[^"]+)">', css, s)
    s = re.sub(r'<script src="((?:\.\./)?assets/[^"]+)"></script>', js, s)
    s = re.sub(r'<link rel="(?:icon|apple-touch-icon)"[^>]*>', '', s)
    s = s.replace('<head>', '<head>' + FAVICON, 1)
    return s

if os.path.exists(DIST): shutil.rmtree(DIST)
os.makedirs(os.path.join(DIST, 'screens'))
pages = [os.path.join(ROOT, 'index.html')] + sorted(glob.glob(os.path.join(ROOT, 'screens', '*.html')))
for p in pages:
    rel = os.path.relpath(p, ROOT)
    out = inline(p)
    open(os.path.join(DIST, rel), 'w', encoding='utf-8').write(out)
    print(rel, round(len(out) / 1024), 'KB')

# One-file workspace: every screen is embedded in the file, so nothing leaves it (no hosted links, no network).
import json
ROUTER = r"""
(function () {
  var NAMES = {'index': 1, 'issue': 1, 'prospect': 1, 'tasks': 1, 'tenants': 1};
  function parse(u) {
    var m = /(?:^|\/)(screens\/)?(index|issue|prospect|tasks|tenants)\.html(\?[^#]*)?/.exec(String(u || ''));
    return m ? {name: m[2], qs: m[3] || ''} : null;
  }
  window.__rmxDoc = function (name, qs, router) {
    var h = window.__RMX_PAGES[name];
    var pre = '<script>window.__QS=' + JSON.stringify(qs || '') + ';' + (router ? 'window.__rmxInstall&&window.__rmxInstall();' : '') + '<\/script>';
    return h.replace('<head>', '<head>' + pre);
  };
  function go(t) { document.open(); document.write(window.__rmxDoc(t.name, t.qs, true)); document.close(); window.scrollTo(0, 0); }
  function fresh(t) {
    var w = window.__rmxOpen('about:blank', '_blank');
    if (!w) return;
    w.__RMX_PAGES = window.__RMX_PAGES; w.__rmxInstall = window.__rmxInstall; w.__rmxDoc = window.__rmxDoc; w.__rmxOpen = window.__rmxOpen;
    w.document.open(); w.document.write(window.__rmxDoc(t.name, t.qs, true)); w.document.close();
  }
  window.__rmxOpen = window.__rmxOpen || window.open.bind(window);
  window.open = function (u) { var t = parse(u); if (t) { fresh(t); return null; } return window.__rmxOpen.apply(window, arguments); };
  window.__rmxInstall = function () {
    window.open = function (u) { var t = parse(u); if (t) { fresh(t); return null; } return window.__rmxOpen.apply(window, arguments); };
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var t = parse(a.getAttribute('href')); if (!t) return;
      e.preventDefault();
      if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) fresh(t); else go(t);
    }, true);
  };
  window.__rmxInstall();
})();
"""
pages_js = {}
for n in ['index', 'issue', 'prospect', 'tasks', 'tenants']:
    f = os.path.join(DIST, 'index.html' if n == 'index' else 'screens/%s.html' % n)
    h = read(f).replace('location.search', '(window.__QS||location.search)')
    pages_js[n] = h
s = pages_js['index']
s = s.replace("taskFrame.src = 'screens/tasks.html?open=' + encodeURIComponent(task) + '&embed=1';",
              "taskFrame.srcdoc = window.__rmxDoc('tasks', '?open=' + encodeURIComponent(task) + '&embed=1', false);")
s = s.replace("taskFrame.removeAttribute('src')", "taskFrame.removeAttribute('srcdoc')")
pages_js['index'] = s
# the data blob is escaped so it can sit inside a <script>
blob = json.dumps(pages_js).replace('</', '<\\/').replace('<!--', '<\\!--')
boot = '<script>window.__RMX_PAGES=' + blob + ';</script>\n<script>' + ROUTER + '</script>\n'
out = pages_js['index'].replace('<head>', '<head>' + boot, 1)
open(os.path.join(DIST, 'my-workspace-standalone.html'), 'w', encoding='utf-8').write(out)
print('my-workspace-standalone.html', round(len(out) / 1024), 'KB')
