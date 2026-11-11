# joshymedia portfolio

Plain HTML, CSS and a little JavaScript. No frameworks, no build step.

## Preview

- **Like the live site (clean addresses):** run `python tools/serve.py`, then open http://localhost:8123
- **Quick look:** double-click `index.html`. Everything works; addresses just show after a `#`.

## Addresses

| Address | Shows |
|---|---|
| `joshymedia.com` or `/gallery` | the gallery |
| `/gallery?photo=5` | the 5th gallery photo, large |
| `/projects` | the project folders |
| `/projects/ditch` | ditch's folders (clients with 2+ projects get one) |
| `/projects/ditch/ruin` | a project (large photo + filmstrip) |
| `/projects/ditch/ruin?photo=3` | its 3rd photo |
| `/projects/ditch/ruin?view=grid` | all its photos in a grid |
| `/contact` | contact + about me |

A project's address comes from its `path` in `projects.js` (vuze is `thevuze`), or is made from
its client and title. Old links (`index.html#p=...`, `project.html?p=...`, `contact.html`) still work.

## Files

| File / folder | What it is | Edit it? |
|---|---|---|
| `projects.js` | Every project's text, cover, order and address, plus the gallery photo list (`GALLERY`, at the bottom) | **Yes**: this is where you change content |
| `index.html` | The page itself: menu, sidebar, contact / about me text | Yes, for the contact / about me text (search for "about me"), then run `python tools/build-pages.py` |
| `app.js`, `app.css` | How the site works and looks | When changing the design |
| `gallery.html`, `projects.html`, `contact.html`, `project.html`, `404.html`, `projects/` | Copies of `index.html`, one per address, made by `tools/build-pages.py` | **No**: edit `index.html`, then rerun the script |
| `style.css` | Styles for the crop tool | No |
| `images/` | Web-optimized copies of your photos (made by the script) | No |
| `images/manifest.js` | Auto-generated list of photos | No |
| `assets/` | Your originals. Never touched by the site, not uploaded | No |
| `tools/optimize-images.py` | Makes the copies in `images/` | No |
| `tools/build-pages.py` | Makes one page per address (run after adding a project or editing `index.html`) | No |
| `tools/serve.py` | Previews the site with clean addresses on your computer | No |
| `tools/crop.html` | Drag photos to choose a crop, then copy the line into `projects.js` | No (just open it) |

## Adding or changing photos

1. Put the originals in `assets/images/` (client folder, or client/project subfolder).
2. Run `python tools/optimize-images.py`.
3. For a **new project**, add a block for it in `projects.js` and set `folder` to the folder name the script printed
   (e.g. `ditch/new-campaign`).
4. Run `python tools/build-pages.py` so the new project gets its own address.

## Undoing changes (git)

- See what changed: `git status`
- Throw away unsaved edits to one file: `git restore projects.js`
- Save a checkpoint: `git add . && git commit -m "what changed"`
- Put the site live on GitHub Pages: `git push`
