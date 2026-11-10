// Builds the home gallery, the projects grid and project pages
// from projects.js + images/manifest.js.
// You shouldn't need to edit this file. Text and order live in projects.js.

(function () {
  "use strict";

  var PROJECTS = (window.PROJECTS || []).slice().sort(function (a, b) {
    return (a.order || 0) - (b.order || 0);
  });
  var MANIFEST = window.IMAGE_MANIFEST || {};
  var SLIDE_MS = 2250; // time per photo in the hover slideshow (2250 = 2.25 seconds)

  // ---------- helpers ----------

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    for (var k in attrs || {}) node.setAttribute(k, attrs[k]);
    if (text != null) node.textContent = text;
    return node;
  }

  function imagesOf(project) {
    var list = MANIFEST[project.folder];
    if (!list) console.warn('projects.js: no photos found for folder "' + project.folder + '"');
    return list || [];
  }

  function src(project, name, size) {
    return "images/" + project.folder + "/" + name + "-" + size + ".webp";
  }

  // Which part of a photo shows in the 4:5 home tiles (projects.js "crop"). Default: center.
  function cropOf(project, name) {
    return (project.crop && project.crop[name]) || "50% 50%";
  }

  // Clients with 2+ projects show "client — title"; others just the client.
  var projectCount = {};
  PROJECTS.forEach(function (p) {
    projectCount[p.client] = (projectCount[p.client] || 0) + 1;
  });

  function displayName(p) {
    return projectCount[p.client] > 1 && p.title ? p.client + " — " + p.title : p.client;
  }

  // ---------- home page: gallery ----------

  // The photos on the home page, in order. Uses the GALLERY list in projects.js
  // ("project-id/photo-name"). Without that list: every photo, mixed by project.
  function galleryPhotos() {
    if (window.GALLERY && window.GALLERY.length) {
      var byId = {};
      PROJECTS.forEach(function (p) { byId[p.id] = p; });
      return window.GALLERY.map(function (ref) {
        var cut = ref.lastIndexOf("/");
        var p = byId[ref.slice(0, cut)];
        var name = ref.slice(cut + 1);
        var img = p && imagesOf(p).filter(function (x) { return x.name === name; })[0];
        if (!img) console.warn('projects.js GALLERY: can\'t find "' + ref + '"');
        return img ? { project: p, img: img } : null;
      }).filter(Boolean);
    }
    var lists = PROJECTS.map(function (p) {
      return imagesOf(p).map(function (img) { return { project: p, img: img }; });
    });
    var mixed = [];
    for (var round = 0; lists.some(function (l) { return l.length > round; }); round++) {
      lists.forEach(function (l) { if (l[round]) mixed.push(l[round]); });
    }
    return mixed;
  }

  // srcset so the browser picks the small or large copy depending on screen size
  function srcset(p, img) {
    // small copies are 800px on the shorter side (see tools/optimize-images.py)
    var shorter = Math.min(img.w, img.h);
    var smallW = shorter > 800 ? Math.round((img.w * 800) / shorter) : img.w;
    return src(p, img.name, "small") + " " + smallW + "w, " + src(p, img.name, "large") + " " + img.w + "w";
  }

  function buildGallery(gallery) {
    var box = buildLightbox();
    var items = [];
    galleryPhotos().forEach(function (item, i) {
      var p = item.project, img = item.img;
      var link = el("a", { class: "gallery-item", href: "project.html?p=" + encodeURIComponent(p.id) });
      var node = el("img", {
        src: src(p, img.name, "small"),
        srcset: srcset(p, img),
        sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
        width: img.w,
        height: img.h,
        alt: "",
        loading: i < 6 ? "eager" : "lazy",
        decoding: "async",
      });
      link.appendChild(node);
      link.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" work
        e.preventDefault();
        box.open(p, img, node.currentSrc || node.src);
      });
      items.push({ link: link, ratio: img.h / img.w });
    });

    // Masonry that fills across, row by row: each photo goes into the currently
    // shortest column, so the first photos in the list are the ones at the top.
    var columnCount = 0;
    function layout() {
      var count = window.matchMedia("(max-width: 640px)").matches ? 1
        : window.matchMedia("(max-width: 1024px)").matches ? 2 : 3;
      if (count === columnCount) return;
      columnCount = count;
      gallery.textContent = "";
      var cols = [], heights = [];
      for (var c = 0; c < count; c++) {
        cols.push(gallery.appendChild(el("div", { class: "gallery-col" })));
        heights.push(0);
      }
      items.forEach(function (item) {
        var shortest = heights.indexOf(Math.min.apply(null, heights));
        cols[shortest].appendChild(item.link);
        heights[shortest] += item.ratio + 0.05; // + a bit for the gap
      });
    }
    layout();
    window.addEventListener("resize", layout);
  }

  // Focused full view of one photo + "view more from this campaign".
  function buildLightbox() {
    var root = el("div", { class: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": "photo" });
    var close = el("button", { class: "lightbox-close", type: "button" }, "close");
    var figure = el("div", { class: "lightbox-photo" });
    var photo = el("img", { alt: "" });
    figure.appendChild(photo);
    // campaign name (plain text) above the link; only the link reacts to hover
    var caption = el("div", { class: "lightbox-caption" });
    var name = el("p", { class: "lightbox-name" });
    var more = el("a", { class: "lightbox-more" }, "view more from this campaign →");
    caption.appendChild(name);
    caption.appendChild(more);
    root.appendChild(close);
    root.appendChild(figure);
    root.appendChild(caption);
    document.body.appendChild(root);

    var lastFocus = null;
    var isOpen = false;

    function open(p, img, previewSrc) {
      lastFocus = document.activeElement;
      // show the already-loaded small copy instantly, then swap in the large one
      photo.src = previewSrc;
      photo.width = img.w;
      photo.height = img.h;
      var large = new Image();
      large.onload = function () { if (isOpen) photo.src = large.src; };
      large.src = src(p, img.name, "large");
      more.href = "project.html?p=" + encodeURIComponent(p.id);
      name.textContent = displayName(p);
      root.classList.add("is-open");
      document.documentElement.classList.add("no-scroll");
      isOpen = true;
      history.pushState({ lightbox: true }, ""); // phone "back" closes the photo
      close.focus();
    }

    function hide(fromHistory) {
      if (!isOpen) return;
      isOpen = false;
      root.classList.remove("is-open");
      document.documentElement.classList.remove("no-scroll");
      if (!fromHistory && history.state && history.state.lightbox) history.back();
      if (lastFocus) lastFocus.focus();
    }

    close.addEventListener("click", function () { hide(false); });
    root.addEventListener("click", function (e) {
      if (e.target === root || e.target === figure) hide(false); // click outside the photo
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") hide(false);
    });
    window.addEventListener("popstate", function () { hide(true); });

    return { open: open };
  }

  // ---------- projects page: grid ----------

  function buildGrid(grid) {
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    PROJECTS.forEach(function (p, i) {
      var images = imagesOf(p);
      if (!images.length) return;

      var card = el("a", { class: "card", href: "project.html?p=" + encodeURIComponent(p.id) });
      var media = el("div", { class: "card-media" });
      var cover = el("img", {
        src: src(p, p.cover, "small"),
        alt: displayName(p),
        loading: i < 3 ? "eager" : "lazy",
        decoding: "async",
      });
      cover.style.objectPosition = cropOf(p, p.cover);
      media.appendChild(cover);
      card.appendChild(media);
      card.appendChild(el("p", null, displayName(p)));
      grid.appendChild(card);

      if (canHover) setUpHover(card, media, p, images, reduceMotion);
    });
  }

  // Hover slideshow: crossfades through the project's other photos.
  function setUpHover(card, media, p, images, reduceMotion) {
    var names = images
      .map(function (img) { return img.name; })
      .filter(function (name) { return name !== p.cover; });
    if (!names.length) return;

    var previews = null;
    var timer = null;
    var current = -1;

    // Preview photos are only downloaded when the card is near the screen or hovered.
    function loadPreviews() {
      if (previews) return;
      previews = names.map(function (name) {
        var img = el("img", { src: src(p, name, "small"), alt: "", class: "preview", decoding: "async" });
        img.setAttribute("aria-hidden", "true");
        img.style.objectPosition = cropOf(p, name);
        media.appendChild(img);
        return img;
      });
    }

    function show(index) {
      previews.forEach(function (img, i) {
        img.classList.toggle("is-on", i === index);
      });
      current = index;
    }

    function next() {
      // skip photos that haven't finished downloading yet
      for (var step = 1; step <= previews.length; step++) {
        var i = (current + step) % previews.length;
        if (previews[i].complete && previews[i].naturalWidth) return show(i);
      }
    }

    function start() {
      loadPreviews();
      current = -1;
      next();
      if (!reduceMotion.matches) timer = window.setInterval(next, SLIDE_MS);
    }

    function stop() {
      window.clearInterval(timer);
      timer = null;
      if (previews) show(-1); // fade back to the cover
    }

    card.addEventListener("mouseenter", start);
    card.addEventListener("mouseleave", stop);
    card.addEventListener("focus", start);
    card.addEventListener("blur", stop);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            loadPreviews();
            io.disconnect();
          }
        },
        { rootMargin: "300px" }
      );
      io.observe(card);
    }
  }

  // ---------- project page ----------

  // Text with @handles turned into instagram links.
  function withHandles(node, text) {
    String(text).split(/(@[A-Za-z0-9_](?:[A-Za-z0-9_.]*[A-Za-z0-9_])?)/).forEach(function (part, i) {
      if (i % 2) {
        node.appendChild(el("a", {
          href: "https://instagram.com/" + part.slice(1),
          target: "_blank",
          rel: "noopener",
        }, part));
      } else if (part) {
        node.appendChild(document.createTextNode(part));
      }
    });
    return node;
  }

  // Photos arranged in rows from projects.js "layout" (see the notes there).
  function buildPhotos(p) {
    var byName = {};
    imagesOf(p).forEach(function (img) { byName[img.name] = img; });
    var used = {};
    var rows = [];

    (p.layout || []).forEach(function (row) {
      var cells = row.map(function (cell) {
        var names = (Array.isArray(cell) ? cell : [cell]).filter(function (n) {
          if (!byName[n]) console.warn('projects.js layout: no photo "' + n + '" in ' + p.id);
          return byName[n] && !used[n];
        });
        names.forEach(function (n) { used[n] = true; });
        if (!names.length) return null;
        return Array.isArray(cell) ? names : names[0];
      }).filter(function (c) { return c !== null; });
      if (cells.length) rows.push(cells);
    });
    // anything not in the layout goes at the end, one per row
    imagesOf(p).forEach(function (img) { if (!used[img.name]) rows.push([img.name]); });

    var count = 0;
    function photo(name) {
      var img = byName[name];
      var node = el("img", {
        src: src(p, name, "large"),
        alt: count === 0 ? displayName(p) : "",
        width: img.w,
        height: img.h,
        loading: count < 2 ? "eager" : "lazy",
        decoding: "async",
      });
      node.style.aspectRatio = img.w + " / " + img.h; // reserves space while loading
      count++;
      return node;
    }
    function ratio(name) { return byName[name].w / byName[name].h; }

    var photos = el("div", { class: "photos" });
    rows.forEach(function (cells) {
      // a single photo on its own row
      if (cells.length === 1 && !Array.isArray(cells[0])) {
        var single = photo(cells[0]);
        single.className = "photo-single";
        var r = ratio(cells[0]);
        // tall photos are kept no taller than the screen
        if (r < 1) single.style.width = "min(100%, calc(90vh * " + r.toFixed(4) + "))";
        photos.appendChild(single);
        return;
      }
      // Photos side by side. Widths follow each photo's shape so heights match exactly,
      // and stacks get exactly the height of their neighbours with no cropping:
      // every cell grows by its shape ratio, plus a fixed head start for the gaps
      // inside the tallest stack in the row (flex-basis, in multiples of the gap).
      var row = el("div", { class: "photo-row" });
      var maxGaps = 0;
      cells.forEach(function (cell) { if (Array.isArray(cell)) maxGaps = Math.max(maxGaps, cell.length - 1); });
      cells.forEach(function (cell) {
        var grow, gaps;
        if (Array.isArray(cell)) {
          var stack = el("div", { class: "photo-stack" });
          var inner = el("div", { class: "photo-stack-inner" });
          var tall = 0;
          cell.forEach(function (n) {
            var node = photo(n);
            node.style.flexGrow = (1 / ratio(n)).toFixed(4); // heights in proportion to shape
            inner.appendChild(node);
            tall += 1 / ratio(n);
          });
          grow = 1 / tall;
          gaps = grow * (maxGaps - (cell.length - 1));
          stack.appendChild(inner);
          row.appendChild(stack);
          var target = stack;
        } else {
          target = photo(cell);
          grow = ratio(cell);
          gaps = grow * maxGaps;
          row.appendChild(target);
        }
        target.style.flexGrow = grow.toFixed(4);
        target.style.flexBasis = "calc(var(--photo-gap) * " + gaps.toFixed(4) + ")";
      });
      photos.appendChild(row);
    });
    return photos;
  }

  function buildProject(root) {
    var id = new URLSearchParams(window.location.search).get("p");
    var p = PROJECTS.filter(function (x) { return x.id === id; })[0];

    if (!p) {
      root.appendChild(el("p", null, "project not found."));
      root.appendChild(el("a", { class: "back", href: "projects.html" }, "← all projects"));
      return;
    }

    document.title = displayName(p) + " — joshymedia";

    var head = el("header", { class: "project-head" });
    head.appendChild(el("h1", null, p.client));
    if (projectCount[p.client] > 1 && p.title) head.appendChild(el("h2", null, p.title));

    var meta = el("dl", { class: "project-meta" });
    meta.appendChild(el("dt", null, "role"));
    meta.appendChild(el("dd", null, p.role));
    meta.appendChild(el("dt", null, "year"));
    meta.appendChild(el("dd", null, p.year));
    head.appendChild(meta);
    if (p.description) head.appendChild(withHandles(el("p", { class: "project-desc" }), p.description));
    root.appendChild(head);

    root.appendChild(buildPhotos(p));

    root.appendChild(el("a", { class: "back", href: "projects.html" }, "← all projects"));
  }

  // ---------- start ----------

  var gallery = document.getElementById("gallery");
  if (gallery) buildGallery(gallery);

  var grid = document.getElementById("projects");
  if (grid) buildGrid(grid);

  var project = document.getElementById("project");
  if (project) buildProject(project);
})();
