// joshymedia site: builds the gallery, folders, viewer and contact from projects.js
(function () {
  var MANIFEST = window.IMAGE_MANIFEST || {};
  var PROJECTS = (window.PROJECTS || []).slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  var byId = {};
  PROJECTS.forEach(function (p) { byId[p.id] = p; });

  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  // photos load from the top folder on the live site (addresses like /projects/ditch/ruin
  // would otherwise look for photos in the wrong place); plain relative when opened from disk
  var FILES = location.protocol === "file:" ? "" : "/";
  function src(p, name, size) { return FILES + "images/" + p.folder + "/" + name + "-" + size + ".webp"; }
  function photosOf(p) {
    return (MANIFEST[p.folder] || []).map(function (img) { return { p: p, img: img }; });
  }
  function short(p) { return p.title ? p.title : p.client; }
  function fileName(p, img) {
    var n = img.name === "cover" ? "00" : ("0" + img.name).slice(-2);
    return (p.id.replace(/-/g, "_") + "_" + n + ".webp").toUpperCase();
  }
  function withHandles(text) {
    var frag = document.createDocumentFragment();
    text.split(/(@[A-Za-z0-9_](?:[A-Za-z0-9_.]*[A-Za-z0-9_])?)/).forEach(function (part, i) {
      if (i % 2) {
        var a = el("a", null, part);
        a.href = "https://instagram.com/" + part.slice(1);
        a.target = "_blank"; a.rel = "noopener";
        frag.appendChild(a);
      } else frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }

  // every photo for the "gallery" folder, in projects.js GALLERY order
  var galleryList = (window.GALLERY || []).map(function (key) {
    var parts = key.split("/"), p = byId[parts[0]];
    if (!p) return null;
    var img = (MANIFEST[p.folder] || []).filter(function (i) { return i.name === parts[1]; })[0];
    return img ? { p: p, img: img } : null;
  }).filter(Boolean);
  var total = PROJECTS.reduce(function (n, p) { return n + photosOf(p).length; }, 0);

  // ---------- state ----------
  var state = { folder: "gallery", index: 0, mode: "grid" };
  var list = [];

  // ---------- addresses (URLs) ----------
  // On the live site every view has a clean address:
  //   /gallery                         /gallery?photo=5
  //   /projects                        /projects/ditch          (a client's folder)
  //   /projects/ditch/ruin             /projects/ditch/ruin?photo=3
  //   /projects/ditch/ruin?view=grid   /contact
  // A project's address comes from its "path" in projects.js, or is made from
  // its client (and title, when a client has 2+ projects).
  // Opened by double-clicking index.html, the same addresses go after a #.
  var LOCAL = location.protocol === "file:";
  function slug(t) {
    return String(t || "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  var perClient = {};
  PROJECTS.forEach(function (p) { perClient[p.client] = (perClient[p.client] || 0) + 1; });
  function pathOf(p) {
    if (p.path) return String(p.path).replace(/^\/+|\/+$/g, "");
    return perClient[p.client] > 1 && p.title ? slug(p.client) + "/" + slug(p.title) : slug(p.client);
  }
  function routeFor(folder, mode, index) {
    if (folder === "contact") return "contact";
    if (folder === "projects") return "projects";
    if (folder.indexOf("client:") === 0) return "projects/" + slug(folder.slice(7));
    if (folder === "gallery") return mode === "view" ? "gallery?photo=" + (index + 1) : "gallery";
    var p = byId[folder];
    if (!p) return "projects";
    return "projects/" + pathOf(p) + (mode === "grid" ? "?view=grid" : index > 0 ? "?photo=" + (index + 1) : "");
  }
  function hrefFor(route) { return LOCAL ? "#" + route : "/" + route; }
  function link(a, route) { a.href = hrefFor(route); a.dataset.route = route; return a; }

  function readQuery(q) {
    var out = {};
    (q || "").split("&").forEach(function (kv) { var s = kv.split("="); if (s[0]) out[s[0]] = decodeURIComponent(s[1] || ""); });
    return out;
  }
  // Links from the old version of the site (#p=id&i=2, #gallery&i=3, #client=ditch ...)
  function readOldHash(h) {
    var q = readQuery(h);
    if (q.p && byId[q.p]) return { folder: q.p, mode: q.grid != null ? "grid" : "view", index: Math.max(0, parseInt(q.i, 10) || 0) };
    if (q.client) return { folder: "client:" + q.client, mode: "folders", index: 0 };
    if ("projects" in q) return { folder: "projects", mode: "folders", index: 0 };
    if ("contact" in q) return { folder: "contact", mode: "contact", index: 0 };
    return { folder: "gallery", mode: q.i != null ? "view" : "grid", index: Math.max(0, parseInt(q.i, 10) || 0) };
  }
  function readRoute(route) {
    var parts = route.split("?"), path = parts[0], q = readQuery(parts[1]);
    path = path.replace(/^\/+|\/+$/g, "").replace(/\.html$/, "").replace(/(^|\/)index$/, "");
    var photo = Math.max(0, (parseInt(q.photo, 10) || 1) - 1);
    if (path === "projects") return { folder: "projects", mode: "folders", index: 0 };
    if (path === "contact") return { folder: "contact", mode: "contact", index: 0 };
    if (path === "project" && q.p && byId[q.p]) return { folder: q.p, mode: "view", index: 0, fix: true }; // old project.html?p=id
    if (path.indexOf("projects/") === 0) {
      var rest = path.slice(9);
      for (var i = 0; i < PROJECTS.length; i++) {
        if (pathOf(PROJECTS[i]) === rest) return { folder: PROJECTS[i].id, mode: q.view === "grid" ? "grid" : "view", index: photo };
      }
      var c = clientsList().filter(function (c) { return slug(c) === rest; })[0];
      if (c) return { folder: "client:" + c, mode: "folders", index: 0 };
      return { folder: "projects", mode: "folders", index: 0, fix: true };
    }
    if (path === "" || path === "gallery") return { folder: "gallery", mode: q.photo ? "view" : "grid", index: photo };
    return { folder: "gallery", mode: "grid", index: 0, fix: true }; // unknown address
  }
  function readLocation() {
    var h = location.hash.slice(1), r;
    var old = LOCAL ? /^(p=|client=)|&/.test(h) : !!h;
    if (old) { r = readOldHash(h); r.fix = true; }
    else r = readRoute(LOCAL ? decodeURIComponent(h) : decodeURIComponent(location.pathname) + location.search);
    state.folder = r.folder; state.mode = r.mode; state.index = r.index;
    // tidy the address bar (old links, "/contact.html", trailing slashes ...)
    var want = routeFor(r.folder, r.mode, r.index);
    if (r.fix || (!LOCAL && location.pathname !== "/" && "/" + want !== location.pathname + location.search)) go(want, true, true);
  }
  // go to an address; replace = don't add a Back-button step; quiet = don't redraw
  function go(route, replace, quiet) {
    if (LOCAL) {
      if (location.hash.slice(1) === route) { if (!quiet) render(); return; }
      if (replace) location.replace("#" + route); else location.hash = route;
      return; // hashchange redraws
    }
    history[replace ? "replaceState" : "pushState"](null, "", "/" + route);
    if (!quiet) render();
  }
  function setHash(folder, mode, index, replace) { go(routeFor(folder, mode, index), replace); }

  // ---------- sidebar ----------
  function treeLink(label, route, depth, opts) {
    var a = link(el("a"), route);
    a.style.setProperty("--depth", depth);
    a.appendChild(el("span", "twisty", opts.twisty || ""));
    a.appendChild(el("span", "folder"));
    a.appendChild(el("span", null, label));
    if (opts.count != null) a.appendChild(el("span", "count", opts.count));
    if (opts.key) a.dataset.key = opts.key;
    return a;
  }
  // A folder with children. Every folder is always shown open, so all
  // subfolders are visible; there's no way to collapse them.
  function treeFolder(parent, label, route, depth, opts) {
    var a = treeLink(label, route, depth, Object.assign({ twisty: "▾" }, opts));
    var kids = el("div", "kids");
    parent.appendChild(a);
    parent.appendChild(kids);
    return kids;
  }
  function clientsList() {
    var clients = [];
    PROJECTS.forEach(function (p) { if (clients.indexOf(p.client) < 0) clients.push(p.client); });
    return clients;
  }
  function projectsOf(client) { return PROJECTS.filter(function (p) { return p.client === client; }); }

  function buildSidebar() {
    var tree = $("tree");
    var root = treeFolder(tree, "joshymedia", "gallery", 0, {});
    root.appendChild(treeLink("gallery", "gallery", 1, { key: "gallery" }));
    var projects = treeFolder(root, "projects", "projects", 1, { key: "projects" });
    // clients with 2+ projects become a folder of their own
    clientsList().forEach(function (c) {
      var ps = projectsOf(c);
      if (ps.length > 1) {
        var sub = treeFolder(projects, c, routeFor("client:" + c), 2, { key: "client:" + c });
        ps.forEach(function (p) {
          sub.appendChild(treeLink(p.title, routeFor(p.id, "view", 0), 3, { key: p.id }));
        });
      } else {
        projects.appendChild(treeLink(c, routeFor(ps[0].id, "view", 0), 2, { key: ps[0].id }));
      }
    });
    root.appendChild(treeLink("contact", "contact", 1, { key: "contact" }));

    var coll = $("collection");
    PROJECTS.forEach(function (p) {
      var a = el("a", null, p.year + " — " + (p.title ? p.client + " " + p.title : p.client));
      link(a, routeFor(p.id, "view", 0));
      a.dataset.key = p.id;
      coll.appendChild(a);
    });
  }

  // ---------- rendering ----------
  function makeThumb(item, i, big) {
    var b = el("button", "thumb");
    var f = el("span", "frame");
    var im = el("img");
    im.loading = "lazy";
    im.width = item.img.w; im.height = item.img.h; // keeps the shape before it loads
    im.src = src(item.p, item.img.name, "small");
    im.alt = "";
    f.appendChild(im);
    b.appendChild(f);
    // previews show only the photo (no file names), on every screen size
    b.setAttribute("aria-label", item.p.title ? item.p.client + " — " + item.p.title : item.p.client);
    b.addEventListener("click", function () { setHash(state.folder, "view", i); });
    return b;
  }

  function render() {
    readLocation();
    document.body.classList.remove("drawer");

    list = state.folder === "gallery" ? galleryList : (byId[state.folder] ? photosOf(byId[state.folder]) : []);
    if (state.index >= list.length) state.index = 0;

    // sidebar highlight
    document.querySelectorAll("[data-key]").forEach(function (n) {
      n.classList.toggle("on", n.dataset.key === state.folder);
    });
    document.querySelectorAll("[data-nav]").forEach(function (n) {
      var k = n.dataset.nav;
      n.classList.toggle("on", k === state.folder || (k === "projects" && (state.mode === "folders" || !!byId[state.folder])));
    });
    document.querySelectorAll("#modes button").forEach(function (b) {
      b.classList.toggle("on", b.dataset.mode === state.mode);
    });

    var isFolders = state.mode === "folders";
    var isContact = state.mode === "contact" || isFolders; // both hide the photo views
    var isGrid = state.mode === "grid";
    $("foldersView").classList.toggle("hidden", !isFolders);
    $("modes").classList.toggle("hidden", isContact);
    $("viewerRow").classList.toggle("hidden", isGrid || isContact);
    $("infobar").classList.add("hidden"); // no file name under the photo
    $("sheet").classList.toggle("hidden", !isGrid);
    $("about").classList.toggle("hidden", state.mode !== "contact");
    $("strip").classList.toggle("hidden", isGrid || isContact);
    $("fullBtn").classList.toggle("hidden", isGrid || isContact);

    var p = byId[state.folder];
    var where = state.folder === "gallery" ? "gallery"
      : state.folder === "projects" ? "projects"
      : isFolders ? "projects \\ " + state.folder.slice(7)
      : isContact ? "contact"
      : "projects \\ " + (p.title ? p.client + " \\ " + p.title : p.client);
    $("path").textContent = "joshymedia \\ " + where;

    if (isFolders) { renderFolders(); return; }
    if (isContact) { document.title = "contact — joshymedia"; return; }


    if (isGrid) renderSheet(p); else renderViewer();
  }

  // Justified rows: fill each row until it is about TARGET px tall, then scale the
  // row so it fits the width exactly. Every photo shows whole, no empty frame space.
  function layoutSheet() {
    var grid = $("sheetGrid");
    if (state.mode !== "grid") return;
    grid.innerHTML = "";
    var W = grid.clientWidth;
    if (!W) return;
    var phone = W < 520;
    var target = phone ? 170 : W < 1000 ? 260 : 340;
    var gap = phone ? 8 : 14;
    var row = [], sum = 0;
    function flush(last) {
      var r = el("div", "sheet-row");
      var h = (W - gap * (row.length - 1)) / sum;
      row.forEach(function (o) {
        var t = makeThumb(o.item, o.i, true);
        if (last && h > target) t.style.flex = "0 0 " + o.ratio * target + "px";
        else t.style.flex = o.ratio + " 1 0";
        t.querySelector("img").style.aspectRatio = o.item.img.w + " / " + o.item.img.h;
        r.appendChild(t);
      });
      grid.appendChild(r);
      row = []; sum = 0;
    }
    list.forEach(function (item, i) {
      var ratio = item.img.w / item.img.h;
      row.push({ item: item, i: i, ratio: ratio });
      sum += ratio;
      if ((W - gap * (row.length - 1)) / sum <= target) flush(false);
    });
    if (row.length) flush(true);
  }

  function renderFolders() {
    var client = state.folder.indexOf("client:") === 0 ? state.folder.slice(7) : null;
    var ps = client ? projectsOf(client) : PROJECTS;
    var head = $("foldersHead");
    head.innerHTML = "";
    head.appendChild(el("h1", null, client || "projects"));
    head.appendChild(el("p", null, "open a folder to view the project."));
    var box = $("folders");
    box.innerHTML = "";
    ps.forEach(function (p) {
      var a = link(el("a", "fcard"), routeFor(p.id, "view", 0));
      var icon = el("span", "ficon");
      icon.appendChild(el("span", "back"));
      var im = el("img");
      im.src = src(p, p.cover || "cover", "small");
      im.alt = "";
      im.loading = "lazy";
      var paper = el("span", "paper");
      paper.appendChild(im);
      icon.appendChild(paper);
      icon.appendChild(el("span", "front"));
      a.appendChild(icon);
      a.appendChild(el("span", "fname", client ? p.title : (p.title ? p.client + " — " + p.title : p.client)));
      a.appendChild(el("span", "fmeta", p.year));
      box.appendChild(a);
    });
    document.title = (client || "projects") + " — joshymedia";
  }

  // project name, description and credits: above the grid, beside the large photo
  function fillDetails(box, p, tag) {
    box.innerHTML = "";
    box.appendChild(el(tag, "details-title", p.title ? p.client + " — " + p.title : p.client));
    var d = el("p", "project-desc");
    d.appendChild(withHandles(p.description || ""));
    box.appendChild(d);
    var dl = el("dl", "credits");
    [["client", p.client], ["role", p.role], ["year", p.year]].forEach(function (row) {
      if (!row[1]) return;
      dl.appendChild(el("dt", null, row[0]));
      dl.appendChild(el("dd", null, row[1]));
    });
    box.appendChild(dl);
  }
  function renderDetails(p) {
    var box = $("details");
    fillDetails(box, p, "h2");
    var a = el("a", "details-link", state.folder === "gallery" ? "open this project →" : "see all photos →");
    link(a, routeFor(p.id, state.folder === "gallery" ? "view" : "grid", 0));
    box.appendChild(a);
  }

  function renderSheet(p) {
    var head = $("sheetHead");
    head.innerHTML = "";
    head.classList.toggle("hidden", !p); // no heading on the gallery
    if (p) {
      fillDetails(head, p, "h1");
    }
    var grid = $("sheetGrid");
    grid.innerHTML = "";
    layoutSheet();
    document.title = (p ? short(p) : "gallery") + " — joshymedia";
  }

  var viewToken = 0;
  function renderViewer() {
    var item = list[state.index];
    if (!item) return;
    var img = $("photo");
    // Only one photo is ever on screen: the next photo is fully loaded and
    // decoded off-screen first, then swapped in all at once. If you press the
    // arrows quickly, only the newest photo gets shown.
    var token = ++viewToken;
    fitPhoto();
    var fromSide = enterFrom; // set by a swipe: slide the new photo in from that side
    enterFrom = 0;
    if (!fromSide) { img.style.transition = "none"; img.style.transform = ""; img.style.opacity = ""; }
    img.classList.add("loading");
    function swapIn(url, done) {
      var next = new Image();
      next.src = url;
      (next.decode ? next.decode() : Promise.resolve()).catch(function () {}).then(function () {
        if (token !== viewToken) return; // a newer photo was asked for
        img.src = url;
        img.width = item.img.w; img.height = item.img.h;
        if (done) done();
      });
    }
    swapIn(src(item.p, item.img.name, "small"), function () {
      if (fromSide) {
        img.style.transition = "none";
        img.style.transform = "translateX(" + fromSide * 60 + "px)";
        img.style.opacity = "0";
        void img.offsetWidth;
        img.style.transition = "transform 220ms ease, opacity 220ms ease";
        img.style.transform = "";
        img.style.opacity = "";
      }
      swapIn(src(item.p, item.img.name, "large"), function () { img.classList.remove("loading"); updateZoom(); });
    });

    // dots under the photo (none when there are too many photos to show as dots)
    var pager = $("pager");
    pager.innerHTML = "";
    if (list.length <= 12) {
      list.forEach(function (_, i) { pager.appendChild(el("i", i === state.index ? "on" : null)); });
    } else {
      // no photo count
    }

    img.dataset.w = item.img.w;

    $("file").textContent = fileName(item.p, item.img);
    renderDetails(item.p);

    var strip = $("strip");
    strip.innerHTML = "";
    list.forEach(function (it, i) {
      var t = makeThumb(it, i, false);
      if (i === state.index) t.classList.add("on");
      strip.appendChild(t);
    });
    var on = strip.querySelector(".on");
    if (on) strip.scrollLeft = on.offsetLeft - strip.clientWidth / 2 + on.clientWidth / 2;

    // preload neighbours
    [state.index + 1, state.index - 1].forEach(function (j) {
      var n = list[(j + list.length) % list.length];
      if (n) new Image().src = src(n.p, n.img.name, "large");
    });
    document.title = fileName(item.p, item.img) + " — joshymedia";
  }

  // Size the large photo so it always runs edge to edge left and right, with a
  // small even border above and below (the dots sit in the bottom border).
  // Wide screens: the photo area is exactly as wide as the photo and the
  // details panel takes the rest. Narrower screens: the photo is full width.
  var BORDER = 20;
  function fitPhoto() {
    var img = $("photo"), stage = $("stage"), row = $("viewerRow");
    var item = list[state.index];
    img.style.width = img.style.height = "";
    stage.style.flex = stage.style.height = stage.style.alignSelf = "";
    if (!item || state.mode !== "view" || document.fullscreenElement) return;
    var ratio = item.img.w / item.img.h;
    if (window.innerWidth >= 1200) {
      var h = Math.min(row.clientHeight - BORDER * 2, (row.clientWidth - 320) / ratio);
      img.style.width = Math.floor(h * ratio) + "px";
      img.style.height = Math.floor(h) + "px";
      stage.style.flex = "0 0 " + Math.floor(h * ratio) + "px";
      // the black frame hugs the photo: just the border above and below
      stage.style.height = Math.floor(h) + BORDER * 2 + "px";
      stage.style.alignSelf = "center";
    } else {
      var w = stage.clientWidth;
      var maxH = window.innerHeight * (window.innerWidth <= 760 ? 0.62 : 0.72);
      var hh = Math.min(w / ratio, maxH);
      img.style.width = Math.floor(hh * ratio) + "px";
      img.style.height = Math.floor(hh) + "px";
    }
  }
  function updateZoom() { fitPhoto(); }

  function step(d) {
    if (state.mode !== "view" || !list.length) return;
    setHash(state.folder, "view", (state.index + d + list.length) % list.length, true);
  }

  // ---------- events ----------
  $("prev").addEventListener("click", function () { step(-1); });
  $("next").addEventListener("click", function () { step(1); });
  $("photo").addEventListener("load", updateZoom);
  window.addEventListener("resize", updateZoom);
  document.addEventListener("fullscreenchange", updateZoom);
  var rz;
  window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(layoutSheet, 120); });
  $("modes").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var folder = state.folder === "contact" ? "gallery" : state.folder;
    setHash(folder, b.dataset.mode, state.index);
  });
  $("drawerBtn").addEventListener("click", function () { document.body.classList.toggle("drawer"); });
  $("fullBtn").addEventListener("click", function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if ($("stage").requestFullscreen) $("stage").requestFullscreen();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else if (state.mode === "folders") return;
    else if (e.key === "g" || (e.key === "Escape" && state.mode === "view")) setHash(state.folder === "contact" ? "gallery" : state.folder, "grid", state.index);
    else if (e.key === "v" && state.mode === "grid") setHash(state.folder, "view", state.index);
    else if (e.key === "f" && state.mode === "view") $("fullBtn").click();
  });
  // swipe on phones: the photo follows your finger, then slides to the next one
  var enterFrom = 0, sx = null, sy = 0, dx = 0, dragging = false;
  var stage = $("stage"), photo = $("photo");
  stage.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; dragging = false;
    photo.style.transition = "none";
  }, { passive: true });
  stage.addEventListener("touchmove", function (e) {
    if (sx == null) return;
    dx = e.touches[0].clientX - sx;
    var dy = e.touches[0].clientY - sy;
    if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) dragging = true;
    if (dragging) {
      photo.style.transform = "translateX(" + dx + "px)";
      photo.style.opacity = String(Math.max(0.3, 1 - Math.abs(dx) / 500));
    }
  }, { passive: true });
  stage.addEventListener("touchend", function () {
    if (sx == null) return;
    sx = null;
    photo.style.transition = "transform 180ms ease, opacity 180ms ease";
    if (dragging && Math.abs(dx) > 50 && list.length > 1) {
      var dir = dx < 0 ? 1 : -1;
      photo.style.transform = "translateX(" + (-dir * stage.clientWidth) + "px)";
      photo.style.opacity = "0";
      setTimeout(function () { enterFrom = dir; step(dir); }, 170);
    } else {
      photo.style.transform = "";
      photo.style.opacity = "";
    }
    dragging = false;
  });

  window.addEventListener("hashchange", render);
  window.addEventListener("popstate", render);
  // links inside the site switch views without reloading the page
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-route]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(a.dataset.route);
  });
  document.querySelectorAll("a[data-route]").forEach(function (a) { a.href = hrefFor(a.dataset.route); });

  // light / dark toggle (dark by default, choice remembered on this device)
  function themeLabel() {
    $("themeBtn").textContent = document.documentElement.dataset.theme === "light" ? "◐ dark" : "◑ light";
  }
  function toggleTheme() {
    var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("jm-theme", next); } catch (e) {}
    themeLabel();
  }
  $("themeBtn").addEventListener("click", toggleTheme);
  document.addEventListener("keydown", function (e) { if (e.key === "t") toggleTheme(); });
  themeLabel();

  buildSidebar();
  render();
})();
