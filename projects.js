// =====================================================================
//  YOUR PROJECTS. Edit this file to change text, order and covers.
// =====================================================================
//
//  Each project is one { ... } block. The fields:
//
//    id           Short name used in the link (project.html?p=ID).
//                 Lowercase, no spaces. Must be different for every project.
//    client       Client name. Shown on the home grid and project page.
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
//    crop         Which part of each photo shows in the tall 4:5 home tiles
//                 (the cover and the hover slideshow). Project pages always
//                 show the whole photo. Easiest way: open crop.html, drag
//                 the photos, and paste the line it gives you here.
//                 By hand: { "photo name": "LEFT% TOP%" }, e.g.
//                   crop: { "cover": "30% 50%", "2": "100% 50%" },
//                 0% = left/top edge, 50% = center, 100% = right/bottom edge.
//                 Photos not listed stay centered. {} = all centered.
//    order        Position on the home page: 1 = first. Lower comes first.
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
    role: "[your role]",
    year: "[year]",
    description: "[short description of the project goes here.]",
    folder: "vuze-magazine",
    cover: "cover",
    crop: {},
    order: 1,
  },
  {
    id: "ditch-2026-fw-campaign",
    client: "ditch",
    title: "2026 FW Campaign",
    role: "[your role]",
    year: "[year]",
    description: "[short description of the project goes here.]",
    folder: "ditch/2026-fw-campaign",
    cover: "cover",
    crop: {},
    order: 2,
  },
  {
    id: "ditch-ruin",
    client: "ditch",
    title: "ruin",
    role: "[your role]",
    year: "[year]",
    description: "[short description of the project goes here.]",
    folder: "ditch/ruin",
    cover: "cover",
    crop: {},
    order: 3,
  },
  {
    id: "sukiibaby",
    client: "sukiibaby",
    title: "",
    role: "[your role]",
    year: "[year]",
    description: "[short description of the project goes here.]",
    folder: "sukiibaby",
    cover: "cover",
    crop: {},
    order: 4,
  },
];
