/* =========================================================
   Mega-Museum — main.js
   - All polls open
   - Optional thumbnails + lightbox
   - Sends votes to Google Sheets Web App
   ========================================================= */

const $  = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));

/* Footer year */
(() => { const y=$("#year"); if(y) y.textContent = new Date().getFullYear(); })();

/* ---------------------------------------------------------
   0) SETTINGS — EDIT THESE
   --------------------------------------------------------- */

/** Front-end only password (friendly gate) */
const MEGA_PASSWORD = "MEGA2025";

/** Google Apps Script Web App URL (set in Step 3 below) */
const SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID/exec";


/** Give this static site an anonymous device/session id */
function getSessionId(){
  let id = localStorage.getItem("mega_session_id");
  if (!id) {
    const rand = (crypto && crypto.randomUUID) ? crypto.randomUUID() :
                 ("mm-" + Date.now().toString(36) + Math.random().toString(36).slice(2,8));
    id = rand;
    localStorage.setItem("mega_session_id", id);
  }
  return id;
}

/* ---------------------------------------------------------
   1) POLL DATA — you can change text & add images
   - Put poll images in: assets/img/polls/...
   - Thumbnails are optional; if a file is missing it just hides.
   --------------------------------------------------------- */

const POLL_DATA = [
  {
    id: 1,
    title: "Pick MASU’s outfit vibe",
    options: ["Streetwear", "Explorer", "Formal", "Avant-garde"],
    thumbnails: [
      "assets/img/polls/masu/outfit-streetwear.jpg",
      "assets/img/polls/masu/outfit-explorer.jpg",
      "assets/img/polls/masu/outfit-formal.jpg",
      "assets/img/polls/masu/outfit-avant.jpg"
    ]
  },
  {
    id: 2,
    title: "Garden Spiral — mood lighting",
    options: ["Dawn mist", "Bright noon", "Golden hour", "Bioluminescent night"],
    thumbnails: [
      "assets/img/polls/garden/dawn.jpg",
      "assets/img/polls/garden/noon.jpg",
      "assets/img/polls/garden/golden.jpg",
      "assets/img/polls/garden/night.jpg"
    ]
  },
  {
    id: 3,
    title: "Hidden Rooms — door sound",
    options: ["Soft chime", "Mechanical latch", "Whispered chorus"]
  },
  {
    id: 4,
    title: "Under the Moat — ambience",
    options: ["Lantern creaks", "Submerged engines", "Deep whalesong"]
  },
  {
    id: 5,
    title: "Characters — name for the cat",
    options: ["MASU", "Pip", "Koto", "Lumen"]
  },
  {
    id: 6,
    title: "UI — hotspot style",
    options: ["Glow rings", "Floating orbs", "Footprints"]
  },
  {
    id: 7,
    title: "Soundtrack — main instrument",
    options: ["Celesta", "Clarinet", "Analog synth", "Nyckelharpa"]
  },
  {
    id: 8,
    title: "Museum map — navigation",
    options: ["Spiral up", "Hub and spokes", "Hidden shortcuts"]
  },
  {
    id: 9,
    title: "Poster colorway",
    options: ["Midnight blue", "Saffron pop", "Fog & teal"],
    thumbnails: [
      "assets/img/polls/poster/blue.jpg",
      "assets/img/polls/poster/saffron.jpg",
      "assets/img/polls/poster/teal.jpg"
    ]
  },
  {
    id: 10,
    title: "Stop-motion puppets — material",
    options: ["3D-printed shells", "Foam/latex", "Mixed media"]
  }
];

/* ---------------------------------------------------------
   2) GATE (friendly password)
   --------------------------------------------------------- */

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

/* ---------------------------------------------------------
   3) POLLS — build UI, handle votes, thumbnails + lightbox
   --------------------------------------------------------- */

function initPolls() {
  const grid = $("#pollsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  POLL_DATA.forEach(p => {
    const votedKey = `mega_poll_${p.id}_vote`;
    const resultsKey = `mega_poll_${p.id}_results`;

    // local (device) results to animate bars instantly
    let results = JSON.parse(localStorage.getItem(resultsKey) || "[]");
    if (!Array.isArray(results) || results.length !== p.options.length) {
      results = Array.from({length: p.options.length},()=>0);
    }
    const votedIndex = parseInt(localStorage.getItem(votedKey) || "-1", 10);

    const card = document.createElement("article");
    card.className = "poll";

    // header
    const head = document.createElement("div");
    head.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <h4>${p.title}</h4>
        <span class="badge-open">Open</span>
      </div>
    `;
    card.appendChild(head);

    // thumbnails (optional)
    if (Array.isArray(p.thumbnails) && p.thumbnails.length) {
      const thumbs = document.createElement("div");
      thumbs.className = "thumbs";
      p.thumbnails.forEach((src, idx) => {
        const img = document.createElement("img");
        img.className = "thumb-img";
        img.src = src;
        img.alt = `${p.title} — option ${idx+1}`;
        img.loading = "lazy";
        img.onerror = function(){ this.style.display="none"; };
        img.addEventListener("click", ()=> openLightbox(p.thumbnails, idx));
        thumbs.appendChild(img);
      });
      card.appendChild(thumbs);
    }

    // choices
    const choicesWrap = document.createElement("div");
    choicesWrap.className = "choices";

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
        if (votedIndex >= 0) return; // already voted on this poll

        // Update local UI
        results[idx] += 1;
        localStorage.setItem(resultsKey, JSON.stringify(results));
        localStorage.setItem(votedKey, String(idx));
        initPolls(); // re-render

        // Fire-and-forget: send to Google Sheets
        sendVoteToSheets({
          poll_id: p.id,
          poll_title: p.title,
          option_index: idx,
          option_label: label,
          session_id: getSessionId(),
          user_agent: navigator.userAgent || "",
          page: location.pathname,
          ts: new Date().toISOString()
        });
      });

      choicesWrap.appendChild(row);
      choicesWrap.appendChild(bar);
    });

    card.appendChild(choicesWrap);
    grid.appendChild(card);
  });
}

// Auto-render if already unlocked
if (coArea && !coArea.classList.contains("hidden")) {
  initPolls();
}

/* ---------------------------------------------------------
   4) Suggestions — local note only
   --------------------------------------------------------- */

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

/* ---------------------------------------------------------
   5) Lightbox (for poll thumbnails)
   --------------------------------------------------------- */

function ensureLightbox(){
  let lb = $("#lb");
  if (lb) return lb;

  lb = document.createElement("div");
  lb.id = "lb";
  lb.innerHTML = `
    <div class="lb-backdrop" data-close="1"></div>
    <div class="lb-panel" role="dialog" aria-modal="true">
      <button class="lb-close" title="Close" data-close="1">×</button>
      <img class="lb-img" alt="">
      <div class="lb-nav">
        <button class="lb-prev" title="Previous">‹</button>
        <button class="lb-next" title="Next">›</button>
      </div>
    </div>
  `;
  document.body.appendChild(lb);

  lb.addEventListener("click", (e)=>{
    if (e.target.dataset.close) lb.classList.remove("open");
  });

  document.addEventListener("keydown", (e)=>{
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lb.classList.remove("open");
    if (e.key === "ArrowLeft") lb.querySelector(".lb-prev").click();
    if (e.key === "ArrowRight") lb.querySelector(".lb-next").click();
  });

  return lb;
}

let lbState = { list: [], idx: 0 };

function openLightbox(list, startIdx=0){
  const lb = ensureLightbox();
  lbState.list = list || [];
  lbState.idx  = startIdx || 0;

  function show(){
    const img = lb.querySelector(".lb-img");
    img.src = lbState.list[lbState.idx];
    img.alt = `Preview ${lbState.idx+1} of ${lbState.list.length}`;
  }
  lb.querySelector(".lb-prev").onclick = ()=> { lbState.idx = (lbState.idx-1+lbState.list.length)%lbState.list.length; show(); };
  lb.querySelector(".lb-next").onclick = ()=> { lbState.idx = (lbState.idx+1)%lbState.list.length; show(); };
  show();
  lb.classList.add("open");
}

/* ---------------------------------------------------------
   6) Send vote to Google Sheets (fire-and-forget)
   --------------------------------------------------------- */
function sendVoteToSheets(payload){
  try {
    if (!SHEETS_WEBAPP_URL || SHEETS_WEBAPP_URL.includes("PASTE_DEPLOYMENT_ID")) return;
    fetch(SHEETS_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors",              // avoids CORS issues; we don't need the response
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // ignore network errors; UI already updated locally
    console.warn("Sheet send failed", err);
  }
}
