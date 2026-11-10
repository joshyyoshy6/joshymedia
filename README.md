# joshymedia portfolio

Plain HTML, CSS and a little JavaScript. No frameworks, no build step.

## Preview

Double-click `index.html`. It opens in your browser and works straight from the folder.

## Files

| File / folder | What it is | Edit it? |
|---|---|---|
| `projects.js` | Every project's text, cover and order, plus the home gallery photo list (`GALLERY`, at the bottom) | **Yes**: this is where you change content |
| `index.html` | Home page: gallery of every photo, click one for the focused view | Rarely |
| `projects.html` | Projects page: grid of covers with the hover slideshow | Rarely |
| `contact.html` | Contact info and "about me" | Yes, for that text |
| `project.html` | One template used by every project page | Rarely |
| `style.css` | All the design | When changing the look |
| `site.js` | Builds the grid, hover slideshow and project pages | Rarely |
| `images/` | Web-optimized copies of your photos (made by the script) | No |
| `images/manifest.js` | Auto-generated list of photos | No |
| `assets/` | Your originals. Never touched by the site, not uploaded | No |
| `tools/optimize-images.py` | Makes the copies in `images/` | No |
| `tools/crop.html` | Drag photos to choose their 4:5 projects-page tile crop, then copy the line into `projects.js` | No (just open it) |

## Adding or changing photos

1. Put the originals in `assets/images/` (client folder, or client/project subfolder).
2. Run `python tools/optimize-images.py`.
3. For a **new project**, add a block for it in `projects.js` and set `folder` to the folder name the script printed
   (e.g. `ditch/new-campaign`).

## Undoing changes (git)

- See what changed: `git status`
- Throw away unsaved edits to one file: `git restore projects.js`
- Save a checkpoint: `git add . && git commit -m "what changed"`
- Put the site live on GitHub Pages: `git push`
