"""
Preview the site on this computer the way GitHub Pages serves it, so clean
addresses like /gallery or /projects/ditch/ruin work.

    python tools/serve.py          then open http://localhost:8123

/gallery serves gallery.html, a folder serves its index.html, and any address
with no file falls back to 404.html (which still opens the site).
"""

import http.server
import os
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        parts = urllib.parse.urlsplit(self.path)
        rel = urllib.parse.unquote(parts.path).lstrip("/")
        full = os.path.join(ROOT, rel)
        if rel and not os.path.exists(full) and os.path.isfile(full.rstrip("/\\") + ".html"):
            self.path = "/" + rel.rstrip("/") + ".html" + ("?" + parts.query if parts.query else "")
        elif os.path.isdir(full) and not os.path.isfile(os.path.join(full, "index.html")) and os.path.isfile(full.rstrip("/\\") + ".html"):
            self.path = "/" + rel.rstrip("/") + ".html"
        elif not os.path.exists(full):
            self.send_response(404)
            body = open(os.path.join(ROOT, "404.html"), "rb").read()
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            import io
            return io.BytesIO(body)
        return super().send_head()


if __name__ == "__main__":
    print("serving on http://localhost:%d" % PORT)
    http.server.ThreadingHTTPServer(("", PORT), Handler).serve_forever()
