// Builds the home grid and project pages from projects.js + images/manifest.js.
// You shouldn't need to edit this file. Text and order live in projects.js.

(function () {
  "use strict";

  var PROJECTS = (window.PROJECTS || []).slice().sort(function (a, b) {
    return (a.order || 0) - (b.order || 0);
  });
  var MANIFEST = window.IMAGE_MANIFEST || {};
  var SLIDE_MS = 1000; // time per photo in the hover slideshow

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

  // Clients with 2+ projects show "client — title"; others just the client.
  var projectCount = {};
  PROJECTS.forEach(function (p) {
    projectCount[p.client] = (projectCount[p.client] || 0) + 1;
  });

  function displayName(p) {
    return projectCount[p.client] > 1 && p.title ? p.client + " — " + p.title : p.client;
  }

  // ---------- home page ----------

  function buildGrid(grid) {
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    PROJECTS.forEach(function (p, i) {
      var images = imagesOf(p);
      if (!images.length) return;

      var card = el("a", { class: "card", href: "project.html?p=" + encodeURIComponent(p.id) });
      var media = el("div", { class: "card-media" });
      media.appendChild(
        el("img", {
          src: src(p, p.cover, "small"),
          alt: displayName(p),
          loading: i < 3 ? "eager" : "lazy",
          decoding: "async",
        })
      );
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

  function buildProject(root) {
    var id = new URLSearchParams(window.location.search).get("p");
    var p = PROJECTS.filter(function (x) { return x.id === id; })[0];

    if (!p) {
      root.appendChild(el("p", null, "project not found."));
      root.appendChild(el("a", { class: "back", href: "index.html#projects" }, "← all projects"));
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
    if (p.description) head.appendChild(el("p", { class: "project-desc" }, p.description));
    root.appendChild(head);

    var photos = el("div", { class: "photos" });
    imagesOf(p).forEach(function (img, i) {
      var node = el("img", {
        src: src(p, img.name, "large"),
        alt: i === 0 ? displayName(p) : "",
        width: img.w,
        height: img.h,
        loading: i < 2 ? "eager" : "lazy",
        decoding: "async",
      });
      // full width, but tall photos never taller than the screen; reserves space while loading
      node.style.aspectRatio = img.w + " / " + img.h;
      node.style.width = "min(100%, calc(90vh * " + (img.w / img.h).toFixed(4) + "))";
      photos.appendChild(node);
    });
    root.appendChild(photos);

    root.appendChild(el("a", { class: "back", href: "index.html#projects" }, "← all projects"));
  }

  // ---------- start ----------

  var grid = document.getElementById("projects");
  if (grid) buildGrid(grid);

  var project = document.getElementById("project");
  if (project) buildProject(project);
})();
