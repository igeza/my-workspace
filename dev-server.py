#!/usr/bin/env python3
"""Static file server for previewing this prototype locally.

Python's stock `http.server` sends Last-Modified and nothing else: no
Cache-Control, no ETag. Browsers treat a response like that as heuristically
fresh, usually for a tenth of the time since the file was last modified, and
serve it from cache WITHOUT asking the server whether it changed. On a
prototype that is edited every few minutes, that means loading the page and
being shown the version from before the last round of changes, with no clue
that is what happened. It cost several rounds of "why does it look like the
old UI" before anyone suspected the cache rather than the code.

So this server says no-store on everything. A prototype is never worth
caching: it is read on localhost, every file is small, and being shown a stale
screen is the one failure mode that looks exactly like a bug in the work.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    directory = sys.argv[2] if len(sys.argv) > 2 else '.'
    handler = partial(NoCacheHandler, directory=directory)
    ThreadingHTTPServer(('', port), handler).serve_forever()
