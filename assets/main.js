/* ======= Small helpers ======= */
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));

/* Footer year */
(function(){ const y=$("#year"); if(y) y.textContent = new Date().getFullYear(); })();

/* ======= Password Gate + Polls ======= */
/**
 * Friendly, front-end-only password.
 * Change here when you want a new shared code.
 */
const MEGA_PASSWORD = "MEGA2025";

const gateForm = $("#gateForm");
const gatePassword = $("#gatePassword");
const coArea = $("#cocreateArea");

if (gateForm) {
  // Auto-open if previously unlocked this device
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

/* ======= Polls ======= */
const POLL_COUNT = 10;
// Poll 1 open now; others locked/coming later.
const OPEN_POLLS = [1]; // e.g., make [1,2] later

// Define Poll 1 question + choices; others get placeholders
const POLL_DATA = [
  {
    id: 1,
    title: "Which room should we focus on next?",
    options: [
      "Hidden Rooms Hallway",
      "Garden Spiral",
      "Under the Moat — expansion",
      "Mega Maze (new)",
      "Floating Forest Village (new)"
    ]
  },
  // The rest are stubs; you can rename freely
  ...Array.from({length: POLL_COUNT-1}, (_,i)=>({
    id: i+2, title: `Poll ${i+2} — Coming Soon`, options: ["A","B","C"]
  }))
];

// Build polls UI
function initPolls() {
  const grid = $("#pollsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  POLL_DATA.forEach(p => {
    const isOpen = OPEN_POLLS.includes(p.id);
    const votedKey = `mega_poll_${p.id}_vote`;
    const resultsKey = `mega_poll_${p.id}_results`;

    // load results from localStorage (device-only demo)
    let results = JSON.parse(localStorage.getItem(resultsKey) || "[]");
    if (!Array.isArray(results) || results.length !== p.options.length) {
      results = Array.from({length: p.options.length},()=>0);
    }

    const votedIndex = parseInt(localStorage.getItem(votedKey) || "-1", 10);

    const el = document.createElement("article");
    el.className = "poll";
    el.innerHTML = `
      <div class="${isOpen ? "" : "locked"}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h4>${p.title}</h4>
          ${isOpen ? `<span class="badge-open">Open</span>` : `<span class="badge">Locked</span>`}
        </div>
        <div class="choices"></div>
      </div>
    `;

    const choicesWrap = $(".choices", el);

    p.options.forEach((label, idx) => {
      const total = results.reduce((a,b)=>a+b,0) || 1;
      const percent = Math.round((results[idx] / total) * 100);

      const row = document.createElement("div");
      row.className = "choice";
      row.innerHTML = `
        <span>${label}</span>
        <button ${(!isOpen || votedIndex>=0) ? "disabled" : ""}>Vote</button>
      `;

      const bar = document.createElement("div");
      bar.className = "bar";
      bar.innerHTML = `<div class="fill" style="width:${percent}%"></div>`;

      row.querySelector("button").addEventListener("click", ()=>{
        if (!isOpen) return;
        if (votedIndex >= 0) return;

        // add one vote locally
        results[idx] += 1;
        localStorage.setItem(resultsKey, JSON.stringify(results));
        localStorage.setItem(votedKey, String(idx));
        initPolls(); // re-render to show bars
      });

      choicesWrap.appendChild(row);
      choicesWrap.appendChild(bar);
    });

    grid.appendChild(el);
  });
}

// If already unlocked on load, render polls immediately
if (coArea && !coArea.classList.contains("hidden")) {
  initPolls();
}

/* Suggestions — local note only (nice placeholder) */
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
