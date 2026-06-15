// ================================================================
// DWWM - Mario | script.js
// ================================================================

// ─── UTILITAIRES ──────────────────────────────────────────────────
function safe(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

function toast(msg, type = "info", duration = 4000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const icons = { success: "✓", error: "✗", info: "ℹ" };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span style="font-size:16px;font-weight:700;flex-shrink:0">${icons[type]}</span><span>${safe(msg)}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, duration);
}

// ─── MENU BURGER ──────────────────────────────────────────────────
const menuBtn     = document.getElementById("menuBtn");
const menuPanel   = document.getElementById("menuPanel");
const menuOverlay = document.getElementById("menuOverlay");
if (menuBtn && menuPanel && menuOverlay) {
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    menuPanel.classList.toggle("active");
    menuOverlay.classList.toggle("active");
  });
  menuOverlay.addEventListener("click", () => {
    menuBtn.classList.remove("active");
    menuPanel.classList.remove("active");
    menuOverlay.classList.remove("active");
  });
}

// ─── TODO LIST ────────────────────────────────────────────────────
const inputTache  = document.getElementById("inputTache");
const btnAjouter  = document.getElementById("btnAjouter");
const liste       = document.getElementById("listeTaches");
const messageVide = document.getElementById("messageVide");
let taches = [];

function chargerTachesLocal() {
  try { taches = JSON.parse(localStorage.getItem("taches") || "[]"); } catch(e) { taches = []; }
  rendreListeTaches();
}
function sauvegarderTaches() {
  try { localStorage.setItem("taches", JSON.stringify(taches)); } catch(e) {}
}
function ajouterTache() {
  const texte = inputTache?.value.trim();
  if (!texte) return;
  taches.unshift({ id: Date.now(), description: texte, completed: false });
  sauvegarderTaches();
  rendreListeTaches();
  if (inputTache) inputTache.value = "";
}
function marquerTacheTerminee(id) {
  const t = taches.find(t => t.id === id);
  if (t) { t.completed = !t.completed; sauvegarderTaches(); rendreListeTaches(); }
}
function supprimerTache(id) {
  taches = taches.filter(t => t.id !== id);
  sauvegarderTaches();
  rendreListeTaches();
}
function rendreListeTaches() {
  if (!liste) return;
  liste.innerHTML = "";
  if (taches.length === 0) { if (messageVide) messageVide.style.display = "flex"; return; }
  if (messageVide) messageVide.style.display = "none";
  taches.forEach(tache => {
    const li = document.createElement("li");
    li.classList.add("tache");
    if (tache.completed) li.classList.add("termine");
    const span = document.createElement("span");
    span.textContent = tache.description;
    if (tache.completed) span.classList.add("termine");
    const actions = document.createElement("div");
    actions.classList.add("actions");
    const btnDone = document.createElement("button");
    btnDone.textContent = tache.completed ? "Annuler" : "OK";
    btnDone.style.cssText = `background:${tache.completed ? "#3f3f46" : "#22c55e"};color:white;`;
    btnDone.onclick = () => marquerTacheTerminee(tache.id);
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "✕";
    btnDelete.style.cssText = "background:#ef4444;color:white;";
    btnDelete.onclick = () => supprimerTache(tache.id);
    actions.appendChild(btnDone);
    actions.appendChild(btnDelete);
    li.appendChild(span);
    li.appendChild(actions);
    liste.appendChild(li);
  });
}
if (btnAjouter) btnAjouter.addEventListener("click", ajouterTache);
if (inputTache) inputTache.addEventListener("keydown", e => { if (e.key === "Enter") ajouterTache(); });
chargerTachesLocal();

// ─── CALENDRIER ───────────────────────────────────────────────────
const btnAddEvent  = document.getElementById("btnAddEvent");
const eventList    = document.getElementById("eventList");
const eventEmpty   = document.getElementById("eventEmpty");
const eventOverlay = document.getElementById("eventOverlay");
const closeEvent   = document.getElementById("closeEvent");
const eventNameEl  = document.getElementById("eventName");
const eventDateEl  = document.getElementById("eventDate");
const saveEventBtn = document.getElementById("saveEvent");
let events = [];

function chargerEvenementsLocal() {
  try { events = JSON.parse(localStorage.getItem("evenements") || "[]"); } catch(e) { events = []; }
  rendreEvenements();
}
function sauvegarderEvenements() {
  try { localStorage.setItem("evenements", JSON.stringify(events)); } catch(e) {}
}
function rendreEvenements() {
  if (!eventList) return;
  eventList.innerHTML = "";
  if (events.length === 0) { if (eventEmpty) eventEmpty.style.display = "flex"; return; }
  if (eventEmpty) eventEmpty.style.display = "none";
  events.forEach(event => {
    const li = document.createElement("li");
    li.classList.add("event-item");
    const dateFormatted = event.date
      ? new Date(event.date).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })
      : event.date;
    li.innerHTML = `
      <div>
        <strong>${safe(event.nom)}</strong>
        <div class="event-date">${safe(dateFormatted)}</div>
      </div>
      <button class="btn-delete-event" style="border:none;background:transparent;color:#ef4444;cursor:pointer;font-size:16px;padding:6px">
        <i class="fa-solid fa-trash"></i>
      </button>`;
    li.querySelector(".btn-delete-event").onclick = () => supprimerEvent(event.id);
    eventList.appendChild(li);
  });
}
if (btnAddEvent)  btnAddEvent.addEventListener("click", () => eventOverlay?.classList.add("active"));
if (closeEvent)   closeEvent.addEventListener("click",  () => eventOverlay?.classList.remove("active"));
if (eventOverlay) eventOverlay.addEventListener("click", e => { if (e.target === eventOverlay) eventOverlay.classList.remove("active"); });
if (saveEventBtn) {
  saveEventBtn.addEventListener("click", () => {
    const nom  = eventNameEl?.value.trim();
    const date = eventDateEl?.value;
    if (!nom || !date) { toast("Remplis le nom et la date.", "error"); return; }
    events.unshift({ id: Date.now(), nom, date });
    sauvegarderEvenements();
    rendreEvenements();
    if (eventNameEl) eventNameEl.value = "";
    if (eventDateEl) eventDateEl.value = "";
    eventOverlay?.classList.remove("active");
    toast("Événement ajouté !", "success");
  });
}
function supprimerEvent(id) {
  events = events.filter(e => e.id !== id);
  sauvegarderEvenements();
  rendreEvenements();
}
chargerEvenementsLocal();

// ─── GITHUB API ───────────────────────────────────────────────────
const githubUpdates = document.getElementById("githubUpdates");

async function chargerGithub() {
  if (!githubUpdates) return;
  try {
    const response = await fetch("https://api.github.com/repos/Mkail14/ma-page/commits?per_page=5");
    if (!response.ok) throw new Error(response.status);
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) {
      githubUpdates.innerHTML = `<div class="event-empty">Aucun commit trouvé</div>`; return;
    }
    githubUpdates.innerHTML = "";
    data.slice(0, 5).forEach(commit => {
      const item = document.createElement("div");
      item.classList.add("update-item");
      item.innerHTML = `
        <div class="update-dot"></div>
        <div>
          <strong>${safe(commit.commit.message.split('\n')[0])}</strong>
          <p>${safe(commit.commit.author.name)} · ${new Date(commit.commit.author.date).toLocaleDateString("fr-FR")}</p>
        </div>`;
      githubUpdates.appendChild(item);
    });
  } catch(err) {
    githubUpdates.innerHTML = `<div class="event-empty">Impossible de charger GitHub</div>`;
  }
}
chargerGithub();











const themeIcon = document.getElementById("themeIcon");
let darkMode = true;

document.getElementById("themeBtn").addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("light-mode");
  window.dispatchEvent(new CustomEvent("themeChange", { detail: { light: !darkMode } }));
  themeIcon.src = darkMode
    ? "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f319.svg"
    : "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2600.svg";
});

// ─── PAGE SWITCHING ─────────────────────────────────────────────────
const homeLink = document.getElementById("homeLink");
const scheduleLink = document.getElementById("scheduleLink");
const landingPage = document.getElementById("landingPage");
const schedulePage = document.getElementById("schedulePage");

function setActiveLink(pageId) {
  if (homeLink) homeLink.classList.toggle("active", pageId === "landingPage");
  if (scheduleLink) scheduleLink.classList.toggle("active", pageId === "schedulePage");
}

function showPage(pageId) {
  if (!landingPage || !schedulePage) return;
  const isHome = pageId === "landingPage";

  if (isHome) {
    landingPage.classList.add("current");
    landingPage.classList.remove("prev", "next");
    schedulePage.classList.add("next");
    schedulePage.classList.remove("current", "prev");
  } else {
    schedulePage.classList.add("current");
    schedulePage.classList.remove("prev", "next");
    landingPage.classList.add("prev");
    landingPage.classList.remove("current", "next");
  }

  setActiveLink(pageId);
}

if (homeLink) {
  homeLink.addEventListener("click", () => {
    showPage("landingPage");
  });
}
if (scheduleLink) {
  scheduleLink.addEventListener("click", () => {
    showPage("schedulePage");
  });
}

showPage("landingPage");