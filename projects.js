// =====================================================================
//  YOUR PROJECTS. Edit this file to change text, order and covers.
// =====================================================================
//
//  Each project is one { ... } block. The fields:
//
//    id           Short name used in the link (project.html?p=ID).
//                 Lowercase, no spaces. Must be different for every project.
//    client       Client name. Shown on the projects page and project page.
//    title        Project name. Only shown when a client has 2+ projects
//                 (e.g. "ditch — ruin"). For one-project clients just the
//                 client name is shown, so title can stay "".
//    role         Your role, e.g. "creative direction, photography".
//    year         e.g. "2026".
//    description  One or two sentences about the project.
//    folder       Where the photos live inside images/. Don't change this
//                 unless you rename or add a folder (see README.md).
//    cover        Which photo is the cover: its file name without
//                 "-large.webp" / "-small.webp". e.g. "cover", "1", "3".
//    crop         Which part of each photo shows in the tall 4:5 projects-page tiles
//                 (the cover and the hover slideshow). Project pages always
//                 show the whole photo. Easiest way: open crop.html, drag
//                 the photos, and paste the line it gives you here.
//                 By hand: { "photo name": "LEFT% TOP%" }, e.g.
//                   crop: { "cover": "30% 50%", "2": "100% 50%" },
//                 0% = left/top edge, 50% = center, 100% = right/bottom edge.
//                 Photos not listed stay centered. {} = all centered.
//    layout       (optional) How photos are arranged on the project page.
//                 A list of rows, left to right:
//                   ["cover"]               one photo, full width
//                   ["4", "5"]              side by side, same height
//                   ["cover", ["1","2","3"]] a photo next to a stack of
//                                           photos; the stack's top and
//                                           bottom line up with the photo
//                 Photos not in the layout are added at the end, one per
//                 row. Leave it out to show every photo full width.
//                 On phones every photo is shown full width, one per row.
//    order        Position on the projects page (and how the home gallery
//                 mixes photos): 1 = first. Lower comes first.
//
//  Rules for editing:
//    - Keep the quotes "..." around text and the comma after each line.
//    - Text is shown in lowercase automatically, so type it normally.
//    - To use a quote mark inside text, write \" instead of ".
//    - Save the file, then refresh the browser to see the change.
//
// =====================================================================

window.PROJECTS = [
  {
    id: "vuze-magazine",
    client: "VUZE Magazine",
    title: "",
    role: "photographer",
    year: "2026",
    description: "Magazine cover for @thevuze starring @ezcodylee",
    folder: "vuze-magazine",
    cover: "cover",
    crop: { "cover": "50% 19%", "1": "48% 50%", "2": "48% 50%", "3": "40% 50%" },
    // portrait cover on the left, the 3 landscapes stacked beside it
    layout: [
      ["cover", ["1", "2", "3"]],
    ],
    order: 2,
  },
  {
    id: "ditch-2026-fw-campaign",
    client: "ditch",
    title: "2026 FW Campaign",
    role: "photographer",
    year: "2026",
    description: "2026 FW Campaign for @ditch shot in Yellowstone and Grand Teton",
    folder: "ditch/2026-fw-campaign",
    cover: "cover",
    crop: { "cover": "55% 50%", "1": "30% 50%", "2": "84% 50%" },
    order: 1,
  },
  {
    id: "ditch-ruin",
    client: "ditch",
    title: "ruin",
    role: "photographer",
    year: "2026",
    description: "[short description of the project goes here.]",
    folder: "ditch/ruin",
    cover: "cover",
    crop: { "1": "36% 50%", "2": "44% 50%", "3": "50% 100%", "4": "52% 50%", "5": "92% 50%" },
    // wide opener, the portrait (3) beside two stacked landscapes, a pair, then a wide closer
    layout: [
      ["cover"],
      ["3", ["1", "2"]],
      ["4", "5"],
      ["6"],
    ],
    order: 3,
  },
  {
    id: "sukiibaby",
    client: "sukiibaby",
    title: "",
    role: "photographer",
    year: "2026",
    description: "editorial portraits of @sukiibaby in @casablancabrand",
    folder: "sukiibaby",
    cover: "cover",
    crop: { "1": "80% 50%", "3": "65% 50%", "4": "74% 50%" },
    order: 4,
  },
];

// =====================================================================
//  HOME PAGE GALLERY: which photos show, and in what order.
// =====================================================================
//
//  One line per photo: "project id/photo name". The first lines are the
//  photos at the top of the page (they fill across, left to right).
//  - Reorder: move lines up or down.
//  - Hide a photo from the home page: delete its line (or put // in front).
//  - Add a photo: add a line, e.g. "sukiibaby/3",
//  Delete this whole list (or leave it empty) to show every photo, mixed.
//
// =====================================================================

window.GALLERY = [
  "ditch-2026-fw-campaign/6",
  "ditch-2026-fw-campaign/cover",
  "ditch-ruin/cover",
  "ditch-ruin/3",
  "ditch-ruin/6",
  "ditch-2026-fw-campaign/5",
  "ditch-2026-fw-campaign/1",
  "ditch-ruin/1",
  "ditch-ruin/4",
  "ditch-2026-fw-campaign/3",
  "ditch-2026-fw-campaign/4",
  "sukiibaby/2",
  "ditch-ruin/2",
  "vuze-magazine/cover",
  "ditch-2026-fw-campaign/2",
  "vuze-magazine/1",
  "sukiibaby/4",
  "sukiibaby/3",
  "ditch-ruin/5",
  "vuze-magazine/3",
  "vuze-magazine/2",
  "sukiibaby/cover",
  "sukiibaby/1",
];
