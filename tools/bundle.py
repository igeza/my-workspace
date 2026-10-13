#!/usr/bin/env python3
"""Self-contained builds of the prototype.

  python3 tools/bundle.py

Writes:
  dist/index.html, dist/screens/*.html   every page with its CSS and JS inlined.
                                         Pages still link to each other, so the dist folder works offline.
  dist/my-workspace-standalone.html      the workspace page alone, one file. Links to the other screens point at the
                                         hosted prototype, and Task Details opens in a new tab there.
"""
import os, re, glob, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
HOSTED = 'https://igeza.github.io/my-workspace/'

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
    return s

if os.path.exists(DIST): shutil.rmtree(DIST)
os.makedirs(os.path.join(DIST, 'screens'))
pages = [os.path.join(ROOT, 'index.html')] + sorted(glob.glob(os.path.join(ROOT, 'screens', '*.html')))
for p in pages:
    rel = os.path.relpath(p, ROOT)
    out = inline(p)
    open(os.path.join(DIST, rel), 'w', encoding='utf-8').write(out)
    print(rel, round(len(out) / 1024), 'KB')

# One-file workspace: other screens live on the hosted prototype.
s = read(os.path.join(DIST, 'index.html'))
s = s.replace("'screens/", "'" + HOSTED + "screens/").replace('"screens/', '"' + HOSTED + 'screens/')
# Task Details frames the Tasks screen; a single file has no sibling page to frame, so open it on the hosted copy.
s = s.replace("taskFrame.hidden = false;\n      taskFrame.src = '" + HOSTED + "screens/tasks.html?open=' + encodeURIComponent(task) + '&embed=1';",
              "window.open('" + HOSTED + "screens/tasks.html?open=' + encodeURIComponent(task), '_blank', 'noopener');")
s = re.sub(r'(href=")(screens/)', r'\1' + HOSTED + r'\2', s)
open(os.path.join(DIST, 'my-workspace-standalone.html'), 'w', encoding='utf-8').write(s)
print('my-workspace-standalone.html', round(len(s) / 1024), 'KB')
