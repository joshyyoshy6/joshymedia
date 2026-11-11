"""
Makes one page file for every web address on the site, so links like
joshymedia.com/gallery or joshymedia.com/projects/ditch/ruin open directly.

Every page is a copy of index.html (the site itself is app.js + app.css, so the
copies stay tiny). Run this after you:
  - add, remove or rename a project in projects.js (or change its "path")
  - edit index.html (e.g. the contact / about me text)

    python tools/build-pages.py

Never edit the generated files (gallery.html, projects/...): edit index.html.
"""

import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARK = "<!-- made by tools/build-pages.py from index.html: edit index.html instead -->"


def slug(text):
    text = text.lower().replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def read_projects():
    """Pull id / client / title / path out of projects.js (same rules as app.js)."""
    src = open(os.path.join(ROOT, "projects.js"), encoding="utf-8").read()
    src = src[src.index("window.PROJECTS"):src.index("window.GALLERY")]
    src = re.sub(r"//[^\n]*", "", src)  # drop comments
    starts = [m.start() for m in re.finditer(r'\bid:\s*"', src)] + [len(src)]
    projects = []
    for a, b in zip(starts, starts[1:]):
        block = src[a:b]

        def field(name):
            m = re.search(r"\b" + name + r':\s*"((?:[^"\\]|\\.)*)"', block)
            return m.group(1) if m else ""

        projects.append({"id": field("id"), "client": field("client"),
                         "title": field("title"), "path": field("path").strip("/")})
    return projects


def main():
    index = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    projects = read_projects()
    per_client = {}
    for p in projects:
        per_client[p["client"]] = per_client.get(p["client"], 0) + 1

    def path_of(p):
        if p["path"]:
            return p["path"]
        if per_client[p["client"]] > 1 and p["title"]:
            return slug(p["client"]) + "/" + slug(p["title"])
        return slug(p["client"])

    def name_of(p):
        return p["client"] + " — " + p["title"] if per_client[p["client"]] > 1 and p["title"] else p["client"]

    # address -> page title
    pages = {"gallery": "gallery", "projects": "projects", "contact": "contact",
             "project": "projects"}  # project = old project.html?p=ID links
    for client, n in per_client.items():
        if n > 1:
            pages["projects/" + slug(client)] = client
    for p in projects:
        pages["projects/" + path_of(p)] = name_of(p)

    # clear out pages made last time (inside projects/), then write fresh ones
    proj_dir = os.path.join(ROOT, "projects")
    if os.path.isdir(proj_dir):
        shutil.rmtree(proj_dir)

    written = []

    def write(rel, title):
        html = index.replace("<title>joshymedia</title>",
                             "<title>" + (title.lower() + " — joshymedia" if title else "joshymedia") + "</title>", 1)
        html = html.replace("<!DOCTYPE html>", "<!DOCTYPE html>\n" + MARK, 1)
        # pages live at addresses like /projects/ditch/ruin: load files from the top folder
        html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n  <base href="/">', 1)
        out = os.path.join(ROOT, rel.replace("/", os.sep))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(html)
        written.append(rel)

    for route, title in pages.items():
        write(route + ".html", title)
    # "/projects" and "/projects/ditch" are also folders: give them an index page too
    for route, title in pages.items():
        if os.path.isdir(os.path.join(ROOT, route.replace("/", os.sep))):
            write(route + "/index.html", title)
    write("404.html", "")  # any other address still opens the site

    print("wrote %d pages:" % len(written))
    for rel in sorted(written):
        print("  /" + rel)


if __name__ == "__main__":
    main()
