/* ======= tiny helpers ======= */
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));

/* Footer year */
(() => { const y=$("#year"); if(y) y.textContent = new Date().getFullYear(); })();

/* ======= Anon device id (saved locally) ======= */
function uid(){
  let id = localStorage.getItem("mega_uid");
  if(!id){
    id = (self.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + "-" + Date.now();
    localStorage.setItem("mega_uid", id);
  }
  return id;
}

/* ======= Config: Google Sheets endpoint ======= */
/**
 * After you deploy your Google Apps Script as a Web App,
 * paste the URL below. Keep the shared token in BOTH places.
 */
const SHEETS_ENDPOINT = "PASTE_YOUR_WEB_APP_URL_HERE"; // e.g. https://script.google.com/macros/s/AKfycb.../exec
const SHEETS_TOKEN    = "CHANGE_ME_SECRET";

/* ======= Password Gate (friendly only) ======= */
const MEGA_PASSWORD = "MEGA2025"; // change anytime

const gateForm = $("#gateForm");
const gatePassword = $("#gatePassword");
const coArea = $("#cocreateArea");

if (gateForm) {
  const unlocked = localStorage.getItem("mega_cocreate_unlocked")==="1";
  if (unlocked) {
    gateForm.classList.add("hidden");
    coArea.classList.remove("hidden");
  }
  gateForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const ok = (gatePassword.value || "").trim() === MEGA_PASSWORD;
    if (!ok) {
      gatePassword.value = "";
      gatePassword.placeholder = "Wrong password — try again";
      gatePassword.focus();
      return;
    }
    localStorage.setItem("mega_cocreate_unlocked","1");
    gateForm.classList.add("hidden");
    coArea.classList.remove("hidden");
    initPolls();
  });
}

/* ======= Polls data =======
   - All 10 polls are OPEN.
   - Some have image galleries (thumbnails -> click to view).
   - Replace images/wording any time.
================================ */
const POLL_DATA = [
  {
    id: 1,
    title: "Pick a working name for Character 1",
    desc: "Just for fun — we can always rename later.",
    options: ["Masu", "Astra", "Kip", "Lumen"],
    images: ["assets/img/characters/masu.png", "assets/img/creation/characters-teaser.png"]
  },
  {
    id: 2,
    title: "Face structure — general vibe",
    desc: "What silhouette fits the world best?",
    options: ["Round / Soft", "Sharp / Angular", "Long / Elegant", "Boxy / Chunky"],
    images: ["assets/img/creation/characters-teaser.png"]
  },
  {
    id: 3,
    title: "Accessories for the Trio",
    desc: "Starter pack — we’ll refine details later.",
    options: ["Satchel", "Goggles", "Compass", "Sketchbook"],
    images: []
  },
  {
    id: 4,
    title: "Wardrobe palette",
    desc: "Choose the base palette family.",
    options: ["Pastel cool", "Warm earth", "Primary bold", "Monochrome + accent"],
    images: []
  },
  {
    id: 5,
    title: "Room priority this week",
    desc: "Which scene should get polish?",
    options: ["Hidden Rooms Hallway", "Garden Spiral", "Under the Moat (expansion)", "Mega Maze (new)"],
    images: []
  },
  {
    id: 6,
    title: "Stop-motion route to explore",
    desc: "For Stage 2 planning.",
    options: ["3D-printed puppets", "Commissioned artist studio"],
    images: []
  },
  {
    id: 7,
    title: "Soundtrack direction",
    desc: "Pick the guiding sonic vibe.",
    options: ["Dreamy minimal", "Acoustic folk", "Electro ambient", "Orchestral light"],
    images: []
  },
  {
    id: 8,
    title: "Mascot creature",
    desc: "A recurring tiny friend.",
    options: ["Lantern moth", "Clockwork crab", "Floating koi", "Stone sparrow"],
    images: []
  },
  {
    id: 9,
    title: "UI interaction hint style",
    desc: "How should hotspots look?",
    options: ["Glow rings", "Floating arrows", "Footprints", "Subtle sparkles"],
    images: []
  },
  {
    id: 10,
    title: "Episode cadence",
    desc: "How often do we drop videos?",
    options: ["Weekly mini", "Biweekly", "Monthly polished", "Irregular but bigger"],
    images: []
  }
];

/* ======= Polls UI ======= */
function initPolls() {
  const grid = $("#pollsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  // make sure lightbox exists (for image viewing)
  ensureLightbox();

  POLL_DATA.forEach(p => {
    const votedKey = `mega_poll_${p.id}_vote`;
    const resultsKey = `mega_poll_${p.id}_results`;

    let results = JSON.parse(localStorage.getItem(resultsKey) || "[]");
    if (!Array.isArray(results) || results.length !== p.options.length) {
      results = Array.from({length: p.options.length},()=>0);
    }
    const votedIndex = parseInt(localStorage.getItem(votedKey) || "-1", 10);

    const el = document.createElement("article");
    el.className = "poll";
    el.innerHTML = `
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h4>${p.title}</h4>
          <span class="badge-open">Open</span>
        </div>
        ${p.desc ? `<p class="muted small" style="margin:6px 0 8px">${p.desc}</p>` : ""}
        ${renderThumbs(p.images)}
        <div class="choices"></div>
      </div>
    `;

    // thumbs click -> lightbox
    if (p.images?.length) {
      $$(".thumbs img", el).forEach((img, idx) => {
        img.addEventListener("click", () => openLightbox(p.images, idx));
      });
    }

    const choicesWrap = $(".choices", el);

    p.options.forEach((label, idx) => {
      const total = results.reduce((a,b)=>a+b,0) || 1;
      const percent = Math.round((results[idx] / total) * 100);

      const row = document.createElement("div");
      row.className = "choice";
      row.innerHTML = `
        <span>${label}</span>
        <button ${votedIndex>=0 ? "disabled" : ""}>Vote</button>
      `;

      const bar = document.createElement("div");
      bar.className = "bar";
      bar.innerHTML = `<div class="fill" style="width:${percent}%"></div>`;

      row.querySelector("button").addEventListener("click", ()=>{
        if (votedIndex >= 0) return; // already voted

        // locally store result
        results[idx] += 1;
        localStorage.setItem(resultsKey, JSON.stringify(results));
        localStorage.setItem(votedKey, String(idx));
        // submit to Google Sheets
        submitVote({
          poll_id: p.id,
          question: p.title,
          choice_index: idx,
          choice_label: label
        });
        initPolls(); // re-render to show bars
      });

      choicesWrap.appendChild(row);
      choicesWrap.appendChild(bar);
    });

    grid.appendChild(el);
  });
}

/* Create thumbs grid if images exist */
function renderThumbs(imgs){
  if (!imgs || !imgs.length) return "";
  const cells = imgs.map(src => `
    <img src="${src}" alt="reference" loading="lazy" />
  `).join("");
  return `<div class="thumbs">${cells}</div>`;
}

/* ======= Lightbox for thumbnails ======= */
let _lightbox;
function ensureLightbox(){
  if (_lightbox) return;
  _lightbox = document.createElement("div");
  _lightbox.className = "lightbox";
  _lightbox.innerHTML = `
    <button class="close" aria-label="Close">Close ✕</button>
    <img alt="Preview" />
  `;
  document.body.appendChild(_lightbox);
  _lightbox.addEventListener("click", (e)=>{
    if (e.target.classList.contains("close") || e.target === _lightbox) {
      _lightbox.classList.remove("open");
    }
  });
}
function openLightbox(images, idx=0){
  const img = _lightbox.querySelector("img");
  img.src = images[idx];
  _lightbox.classList.add("open");
}

/* ======= Submit vote to Google Sheets (Web App) ======= */
function submitVote({poll_id, question, choice_index, choice_label}){
  if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.includes("PASTE_YOUR_WEB_APP_URL_HERE")) {
    console.info("[Sheets] Endpoint not set. Vote stored locally only.");
    return;
  }
  const payload = {
    token: SHEETS_TOKEN,
    uid: uid(),
    poll_id, question, choice_index, choice_label,
    ua: navigator.userAgent,
    device: (navigator.platform || "")
  };

  // NOTE: use text/plain to avoid CORS preflight with Apps Script
  fetch(SHEETS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload),
    // mode: "cors" // default ok
  })
  .then(r => r.ok ? r.json().catch(()=>({ok:true})) : Promise.reject(r.status))
  .then(res => {
    console.info("[Sheets] Submitted", res);
  })
  .catch(err => {
    console.warn("[Sheets] Submit failed; vote kept locally.", err);
  });
}

/* Suggestions — local note only */
const saveBtn = $("#saveSuggest");
if (saveBtn) {
  saveBtn.addEventListener("click", ()=>{
    const ta = $("#suggestInput");
    const msg = $("#suggestSavedMsg");
    const txt = (ta.value || "").trim();
    if (!txt) { msg.textContent = "Please write something first."; return; }
    const notes = JSON.parse(localStorage.getItem("mega_suggestions") || "[]");
    notes.push({ text: txt, at: new Date().toISOString() });
    localStorage.setItem("mega_suggestions", JSON.stringify(notes));
    ta.value = "";
    msg.textContent = "Saved locally on this device ✔";
    setTimeout(()=> msg.textContent="", 2000);
  });
}

/* If polls are visible on load (already unlocked), render now */
if (coArea && !coArea.classList.contains("hidden")) {
  initPolls();
}
