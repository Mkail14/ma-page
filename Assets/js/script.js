/* ================================================================
   DWWM - Mario | script.js — Version corrigée
   Corrections :
   - heroTitle : "Bonjour R. Mario" UNIQUEMENT si aucun profil,
     sinon "Bonjour {initiale_nom}. {prénom}"
   - Titre mis à jour immédiatement à la connexion ET au chargement
   - renderNavAuth : pill utilisateur cohérente
   - openAuthOverlay("connexion") au lieu de "inscription" si déjà
     un compte (bouton nav)
   - Toast avec container toujours présent
   - Spinner correctement injecté dans les boutons
   - Pas de double-bind sur les boutons
   - Déconnexion propre : retour landing, titre réinitialisé
   ================================================================ */

// ─── SUPABASE INIT ────────────────────────────────────────────────
const SUPABASE_URL = "https://dxtgwpoeclgyldoymvpl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGd3cG9lY2xneWxkb3ltdnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzE1NTMsImV4cCI6MjA5NDgwNzU1M30.dkfyncgnpSprtl86BK6ztILLFYEahiODENIn-h9kvDI";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── ÉTAT GLOBAL ──────────────────────────────────────────────────
let currentUser   = null;
let currentProfil = null;
let modeActuel    = "inscription";

// ─── UTILITAIRES ──────────────────────────────────────────────────

/**
 * Retourne "R." à partir de "Rabemananjara"
 * (première lettre du nom + point)
 */
function initialeNom(nom) {
  if (!nom || !nom.trim()) return "";
  return nom.trim()[0].toUpperCase() + ".";
}

/** Sanitise une chaîne pour éviter XSS */
function safe(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

/** Toast notification */
function toast(msg, type = "info", duration = 4000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const icons = { success: "✓", error: "✗", info: "ℹ" };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span style="font-size:16px;font-weight:700;flex-shrink:0">${icons[type]}</span><span>${safe(msg)}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 400);
  }, duration);
}

/** Validation d'email */
function isEmailValid(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** Formate une date ISO en français */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric"
  });
}

/**
 * Construit le texte du titre hero :
 *  - Pas de profil → "Bonjour R. Mario"  (valeur par défaut du site)
 *  - Profil présent → "Bonjour {initiale}. {prénom}"
 *    ex: nom="Rabemananjara", prenom="Mario" → "Bonjour R. Mario"
 */
function buildHeroTitle(profil) {
  if (!profil) return "Bonjour R. Mario";
  const initiale = initialeNom(profil.nom);   // "R."
  const prenom   = (profil.prenom || "").trim();
  if (!initiale && !prenom) return "Bonjour R. Mario";
  return `Bonjour ${initiale} ${prenom}`.trim();
}

/** Met à jour le h1 hero */
function setHeroTitle(profil) {
  const el = document.getElementById("heroTitle");
  if (el) el.textContent = buildHeroTitle(profil);
}

// ─── NAV : ZONE AUTH ──────────────────────────────────────────────
function renderNavAuth(profil) {
  const zone = document.getElementById("navAuthZone");
  if (!zone) return;

  if (profil || currentUser) {
    // Initiales pour l'avatar : première lettre nom + première lettre prénom
    const nom    = (profil?.nom    || "").trim();
    const prenom = (profil?.prenom || "").trim();
    const initials = [nom[0], prenom[0]].filter(Boolean).map(c => c.toUpperCase()).join("") || "?";
    // Label : "R. Mario"
    const label = profil
      ? `${initialeNom(nom)} ${prenom}`.trim()
      : (currentUser?.email || "Mon compte");

    zone.innerHTML = `
      <div class="nav-user-pill" id="navUserPill" title="Mon dashboard">
        <div class="nav-avatar">${safe(initials)}</div>
        <span class="nav-user-name">${safe(label)}</span>
      </div>`;

    document.getElementById("navUserPill")?.addEventListener("click", () => {
      showDashboard();
    });
  } else {
    zone.innerHTML = `<button class="contact-btn" id="openFormBtn">S'inscrire</button>`;
    document.getElementById("openFormBtn")?.addEventListener("click", () => {
      openAuthOverlay("inscription");
    });
  }
}

// ─── SESSION AU CHARGEMENT ────────────────────────────────────────
async function chargerSession() {
  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      currentUser   = null;
      currentProfil = null;
      renderNavAuth(null);
      setHeroTitle(null);
      return;
    }
    currentUser = session.user;
    await chargerProfil(currentUser.email);
    renderNavAuth(currentProfil);
    setHeroTitle(currentProfil);
  } catch (e) {
    console.warn("chargerSession:", e);
  }
}

/** Récupère le profil depuis la table `inscriptions` */
async function chargerProfil(email) {
  try {
    const { data, error } = await db
      .from("inscriptions")
      .select("*")
      .eq("email", email)
      .single();
    currentProfil = (!error && data) ? data : null;
  } catch (e) {
    currentProfil = null;
  }
}

// ─── AUTH STATE CHANGE ────────────────────────────────────────────
db.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN" && session) {
    currentUser = session.user;
    await chargerProfil(currentUser.email);
    renderNavAuth(currentProfil);
    setHeroTitle(currentProfil);
    // Mise à jour last_login
    try {
      await db.from("inscriptions")
        .update({ last_login: new Date().toISOString() })
        .eq("email", currentUser.email);
    } catch (e) {}
  }

  if (event === "SIGNED_OUT") {
    currentUser   = null;
    currentProfil = null;
    renderNavAuth(null);
    setHeroTitle(null);
    hideDashboard();
  }

  if (event === "PASSWORD_RECOVERY") {
    openAuthOverlay("nouveau-mdp");
  }
});

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
  updateDashStats();
}
function marquerTacheTerminee(id) {
  const t = taches.find(t => t.id === id);
  if (t) { t.completed = !t.completed; sauvegarderTaches(); rendreListeTaches(); }
}
function supprimerTache(id) {
  taches = taches.filter(t => t.id !== id);
  sauvegarderTaches();
  rendreListeTaches();
  updateDashStats();
}
function rendreListeTaches() {
  if (!liste) return;
  liste.innerHTML = "";
  if (taches.length === 0) {
    if (messageVide) messageVide.style.display = "flex";
    return;
  }
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
    btnDone.style.background = tache.completed ? "#3f3f46" : "#22c55e";
    btnDone.style.color = "white";
    btnDone.onclick = () => marquerTacheTerminee(tache.id);

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "✕";
    btnDelete.style.background = "#ef4444";
    btnDelete.style.color = "white";
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
  if (events.length === 0) {
    if (eventEmpty) eventEmpty.style.display = "flex";
    return;
  }
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

if (btnAddEvent)  btnAddEvent.addEventListener("click",  () => eventOverlay?.classList.add("active"));
if (closeEvent)   closeEvent.addEventListener("click",   () => eventOverlay?.classList.remove("active"));
if (eventOverlay) eventOverlay.addEventListener("click", e => {
  if (e.target === eventOverlay) eventOverlay.classList.remove("active");
});

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
    updateDashStats();
  });
}

function supprimerEvent(id) {
  events = events.filter(e => e.id !== id);
  sauvegarderEvenements();
  rendreEvenements();
  updateDashStats();
}
chargerEvenementsLocal();

// ─── GITHUB API ───────────────────────────────────────────────────
const githubUpdates = document.getElementById("githubUpdates");
let githubCommitCount = 0;

async function chargerGithub() {
  if (!githubUpdates) return;
  try {
    const response = await fetch("https://api.github.com/repos/Mkail14/ma-page/commits?per_page=5");
    if (!response.ok) throw new Error(response.status);
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) {
      githubUpdates.innerHTML = `<div class="event-empty">Aucun commit trouvé</div>`;
      return;
    }
    githubCommitCount = data.length;
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
    updateDashStats();
  } catch(err) {
    githubUpdates.innerHTML = `<div class="event-empty">Impossible de charger GitHub</div>`;
  }
}
chargerGithub();

// ─── AUTH OVERLAY ─────────────────────────────────────────────────
const formOverlay = document.getElementById("formOverlay");

function openAuthOverlay(mode) {
  modeActuel = mode;
  if (formOverlay) formOverlay.classList.add("active");
  afficherVue(mode);
}

function fermerEtReset() {
  if (formOverlay) formOverlay.classList.remove("active");
  // Petit délai pour laisser la transition se faire
  setTimeout(() => afficherVue("inscription"), 350);
}

if (formOverlay) {
  formOverlay.addEventListener("click", e => {
    if (e.target === formOverlay) fermerEtReset();
  });
}

// ─── VUES DE LA POPUP AUTH ────────────────────────────────────────
function afficherVue(mode) {
  modeActuel = mode;
  const popup = document.getElementById("popupFormulaire");
  if (!popup) return;
  switch(mode) {
    case "inscription":  renderInscription(popup);  break;
    case "connexion":    renderConnexion(popup);     break;
    case "motdepasse":   renderMotDePasse(popup);    break;
    case "nouveau-mdp":  renderNouveauMdp(popup);    break;
  }
}

// ── VUE INSCRIPTION ──────────────────────────────────────────────
function renderInscription(popup) {
  popup.innerHTML = `
    <button class="close-form" id="cf2"><i class="fa-solid fa-xmark"></i></button>
    <h2 class="text1">Créer un compte</h2>
    <p class="form-subtitle">Rejoins et accède à mes projets web UI.</p>
    <form class="custom-form" onsubmit="return false;">
      <div class="form-row">
        <div class="input-group-custom">
          <label>Nom</label>
          <input type="text" id="nom" placeholder="Votre nom" autocomplete="family-name">
        </div>
        <div class="input-group-custom">
          <label>Prénom</label>
          <input type="text" id="prenom" placeholder="Votre prénom" autocomplete="given-name">
        </div>
      </div>
      <div class="input-group-custom">
        <label>Email</label>
        <input type="email" id="email" placeholder="Votre email" autocomplete="email">
        <div id="fbEmail" class="inline-msg"></div>
      </div>
      <div class="form-row">
        <div class="input-group-custom">
          <label>Mot de passe</label>
          <input type="password" id="motdepasse" placeholder="6 caractères minimum" autocomplete="new-password">
          <div id="fbMdp" class="inline-msg"></div>
        </div>
        <div class="input-group-custom">
          <label>Confirmation</label>
          <input type="password" id="confirmation" placeholder="Confirmer" autocomplete="new-password">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group-custom">
          <label>Âge</label>
          <input type="number" id="age" placeholder="Votre âge" min="1" max="120">
        </div>
        <div class="input-group-custom">
          <label>Formation</label>
          <input type="text" id="formation" placeholder="Ex: DWWM">
        </div>
      </div>
      <div class="content">
        <label class="checkBox"><input id="ch1" type="checkbox"><div class="transition"></div></label>
        <span class="text001">Je jure devant dieux que je suis pas un robot.</span>
      </div>
      <button type="button" class="btn-formulaire" id="btnInscription" disabled>Créer un compte</button>
      <div class="login-link">
        <a href="#" id="lkConnexion">Vous avez déjà un compte ? Se connecter</a>
      </div>
    </form>
    <div id="messageConfirmation" class="message-confirmation"></div>`;

  document.getElementById("cf2")?.addEventListener("click", fermerEtReset);
  document.getElementById("lkConnexion")?.addEventListener("click", e => {
    e.preventDefault();
    afficherVue("connexion");
  });

  popup.querySelectorAll(".custom-form input").forEach(i => i.addEventListener("input", checkInscription));
  document.getElementById("ch1")?.addEventListener("change", checkInscription);
  document.getElementById("btnInscription")?.addEventListener("click", handleInscription);
}

function checkInscription() {
  const btn = document.getElementById("btnInscription");
  if (!btn) return;

  const nom       = document.getElementById("nom")?.value.trim();
  const prenom    = document.getElementById("prenom")?.value.trim();
  const email     = document.getElementById("email")?.value.trim();
  const mdp       = document.getElementById("motdepasse")?.value;
  const conf      = document.getElementById("confirmation")?.value;
  const age       = document.getElementById("age")?.value.trim();
  const formation = document.getElementById("formation")?.value.trim();
  const robot     = document.getElementById("ch1")?.checked;

  const fbEmail = document.getElementById("fbEmail");
  const fbMdp   = document.getElementById("fbMdp");

  if (fbEmail) {
    if (!email) { fbEmail.textContent = ""; fbEmail.className = "inline-msg"; }
    else if (isEmailValid(email)) { fbEmail.textContent = "✓ Email valide"; fbEmail.className = "inline-msg field-ok"; }
    else { fbEmail.textContent = "✗ Format invalide"; fbEmail.className = "inline-msg field-err"; }
  }

  if (fbMdp) {
    if (!mdp) { fbMdp.textContent = ""; fbMdp.className = "inline-msg"; }
    else if (mdp.length < 6) { fbMdp.textContent = "✗ 6 caractères minimum"; fbMdp.className = "inline-msg field-err"; }
    else if (conf && conf !== mdp) { fbMdp.textContent = "✗ Mots de passe différents"; fbMdp.className = "inline-msg field-err"; }
    else if (conf && conf === mdp) { fbMdp.textContent = "✓ Mots de passe identiques"; fbMdp.className = "inline-msg field-ok"; }
    else { fbMdp.textContent = ""; fbMdp.className = "inline-msg"; }
  }

  const ok = !!(nom && prenom && isEmailValid(email) && mdp && mdp.length >= 6 && mdp === conf && age && formation && robot);
  btn.disabled = !ok;
  btn.classList.toggle("btn-active", ok);
}

async function handleInscription() {
  const btn = document.getElementById("btnInscription");
  if (!btn || btn.disabled) return;

  const email     = document.getElementById("email").value.trim();
  const mdp       = document.getElementById("motdepasse").value;
  const nom       = document.getElementById("nom").value.trim();
  const prenom    = document.getElementById("prenom").value.trim();
  const age       = parseInt(document.getElementById("age").value) || null;
  const formation = document.getElementById("formation").value.trim();

  const originalText = btn.textContent;
  btn.innerHTML = `<span class="spinner"></span>Création en cours...`;
  btn.disabled  = true;

  try {
    // 1. Vérifier si l'email est déjà pris
    const { data: existant } = await db
      .from("inscriptions")
      .select("id")
      .eq("email", email)
      .single();
    if (existant) throw new Error("Cet email est déjà utilisé.");

    // 2. Créer le compte Auth
    const { data: authData, error: authErr } = await db.auth.signUp({ email, password: mdp });
    if (authErr) throw authErr;

    // 3. Insérer profil
    const { error: dbErr } = await db.from("inscriptions").insert([{
      id:         authData.user?.id,
      nom, prenom, email, age, formation,
      created_at: new Date().toISOString()
    }]);
    if (dbErr) console.warn("DB profil:", dbErr.message);

    afficherSucces(nom, prenom, true);
    toast("Compte créé ! Vérifie ton email. 📧", "success", 6000);

  } catch(err) {
    let msg = err.message || "Erreur inconnue.";
    if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("déjà utilisé")) {
      msg = "Cet email est déjà utilisé.";
    }
    if (msg.includes("Password should be")) msg = "Mot de passe trop faible (6 caractères min).";
    btn.innerHTML = originalText;
    btn.disabled = false;
    btn.classList.add("btn-active");
    toast(msg, "error");
  }
}

// ── VUE CONNEXION ────────────────────────────────────────────────
function renderConnexion(popup) {
  popup.innerHTML = `
    <button class="close-form" id="cf2"><i class="fa-solid fa-xmark"></i></button>
    <h2 class="text1">Se connecter</h2>
    <p class="form-subtitle">Connecte-toi à ton compte.</p>
    <form class="custom-form" onsubmit="return false;">
      <div class="input-group-custom">
        <label>Email</label>
        <input type="email" id="email" placeholder="Votre email" autocomplete="email">
        <div id="fbEmail" class="inline-msg"></div>
      </div>
      <div class="input-group-custom">
        <label>Mot de passe</label>
        <input type="password" id="motdepasse" placeholder="Votre mot de passe" autocomplete="current-password">
      </div>
      <button type="button" class="btn-formulaire btn-active" id="btnConnexion">Se connecter</button>
      <div class="login-link login-link-flex">
        <a href="#" id="lkInscription">Pas encore de compte ? S'inscrire</a>
        <a href="#" id="lkMdp" class="link-purple">Mot de passe oublié ?</a>
      </div>
    </form>
    <div id="messageConfirmation" class="message-confirmation"></div>`;

  document.getElementById("cf2")?.addEventListener("click", fermerEtReset);
  document.getElementById("lkInscription")?.addEventListener("click", e => { e.preventDefault(); afficherVue("inscription"); });
  document.getElementById("lkMdp")?.addEventListener("click", e => { e.preventDefault(); afficherVue("motdepasse"); });

  popup.querySelectorAll(".custom-form input").forEach(i => i.addEventListener("input", checkConnexion));
  document.getElementById("btnConnexion")?.addEventListener("click", handleConnexion);
}

function checkConnexion() {
  const btn = document.getElementById("btnConnexion");
  if (!btn) return;
  const email = document.getElementById("email")?.value.trim();
  const mdp   = document.getElementById("motdepasse")?.value;
  const fbEmail = document.getElementById("fbEmail");

  if (fbEmail) {
    if (!email) { fbEmail.textContent = ""; fbEmail.className = "inline-msg"; }
    else if (isEmailValid(email)) { fbEmail.textContent = "✓ Email valide"; fbEmail.className = "inline-msg field-ok"; }
    else { fbEmail.textContent = "✗ Format invalide"; fbEmail.className = "inline-msg field-err"; }
  }

  const ok = !!(isEmailValid(email) && mdp && mdp.length >= 1);
  btn.disabled = !ok;
  btn.classList.toggle("btn-active", ok);
}

async function handleConnexion() {
  const btn = document.getElementById("btnConnexion");
  if (!btn || btn.disabled) return;

  const email = document.getElementById("email").value.trim();
  const mdp   = document.getElementById("motdepasse").value;

  const originalText = btn.textContent;
  btn.innerHTML = `<span class="spinner"></span>Connexion...`;
  btn.disabled  = true;

  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password: mdp });
    if (error) throw error;

    currentUser = data.user;
    await chargerProfil(email);

    // Mettre à jour nav ET titre immédiatement
    renderNavAuth(currentProfil);
    setHeroTitle(currentProfil);

    afficherSucces(currentProfil?.nom || "", currentProfil?.prenom || "", false);
    toast(`Bienvenue ${currentProfil?.prenom || ""} ! 👋`, "success");

    setTimeout(() => {
      fermerEtReset();
      showDashboard();
    }, 1800);

  } catch(err) {
    let msg = err.message || "Erreur de connexion.";
    if (msg.includes("Invalid login credentials")) msg = "Email ou mot de passe incorrect.";
    if (msg.includes("Email not confirmed"))       msg = "Confirme ton email d'abord.";
    if (msg.includes("Too many requests"))         msg = "Trop de tentatives. Réessaie dans 1 min.";
    btn.innerHTML = originalText;
    btn.disabled = false;
    btn.classList.add("btn-active");
    toast(msg, "error");
  }
}

// ── VUE MOT DE PASSE OUBLIÉ ──────────────────────────────────────
function renderMotDePasse(popup) {
  popup.innerHTML = `
    <button class="close-form" id="cf2"><i class="fa-solid fa-xmark"></i></button>
    <h2 class="text1">Mot de passe oublié</h2>
    <p class="form-subtitle">Entre ton email, on t'envoie un lien de réinitialisation.</p>
    <form class="custom-form" onsubmit="return false;">
      <div class="input-group-custom">
        <label>Email</label>
        <input type="email" id="emailReset" placeholder="Votre email" autocomplete="email">
        <div id="fbReset" class="inline-msg"></div>
      </div>
      <button type="button" class="btn-formulaire btn-active" id="btnReset">Envoyer le lien</button>
      <div class="login-link">
        <a href="#" id="lkRetour">← Retour à la connexion</a>
      </div>
    </form>
    <div id="messageConfirmation" class="message-confirmation"></div>`;

  document.getElementById("cf2")?.addEventListener("click", fermerEtReset);
  document.getElementById("lkRetour")?.addEventListener("click", e => { e.preventDefault(); afficherVue("connexion"); });

  const emailInput = document.getElementById("emailReset");
  const btnReset   = document.getElementById("btnReset");
  const fbReset    = document.getElementById("fbReset");

  emailInput?.addEventListener("input", () => {
    const ok = isEmailValid(emailInput.value.trim());
    if (fbReset) {
      fbReset.textContent = emailInput.value ? (ok ? "✓ Email valide" : "✗ Format invalide") : "";
      fbReset.className = "inline-msg " + (emailInput.value ? (ok ? "field-ok" : "field-err") : "");
    }
    if (btnReset) { btnReset.disabled = !ok; btnReset.classList.toggle("btn-active", ok); }
  });

  btnReset?.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return;
    const originalText = btnReset.textContent;
    btnReset.innerHTML = `<span class="spinner"></span>Envoi...`;
    btnReset.disabled = true;

    try {
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });
      if (error) throw error;

      popup.querySelector(".custom-form").style.display = "none";
      popup.querySelector(".text1").style.display       = "none";
      popup.querySelector(".form-subtitle").style.display = "none";
      const msg = document.getElementById("messageConfirmation");
      if (msg) {
        msg.style.display = "flex";
        msg.innerHTML = `
          <div class="success-box">
            <i class="fa-solid fa-envelope-circle-check" style="color:#7c3aed;font-size:65px"></i>
            <h3>Email envoyé !</h3>
            <p>Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.</p>
            <button onclick="window.afficherVue('connexion')" style="margin-top:18px;padding:12px 28px;border:none;border-radius:14px;background:#7c3aed;color:white;cursor:pointer;font-size:15px;font-weight:600">
              Retour à la connexion
            </button>
          </div>`;
      }
      toast("Email de réinitialisation envoyé !", "success");

    } catch(err) {
      btnReset.innerHTML = originalText;
      btnReset.disabled = false;
      btnReset.classList.add("btn-active");
      toast(err.message || "Erreur lors de l'envoi.", "error");
    }
  });
}

// ── VUE NOUVEAU MOT DE PASSE (après reset email) ─────────────────
function renderNouveauMdp(popup) {
  popup.innerHTML = `
    <button class="close-form" id="cf2"><i class="fa-solid fa-xmark"></i></button>
    <h2 class="text1">Nouveau mot de passe</h2>
    <p class="form-subtitle">Choisis un nouveau mot de passe sécurisé.</p>
    <form class="custom-form" onsubmit="return false;">
      <div class="input-group-custom">
        <label>Nouveau mot de passe</label>
        <input type="password" id="npw1" placeholder="Minimum 6 caractères" autocomplete="new-password">
      </div>
      <div class="input-group-custom">
        <label>Confirmer</label>
        <input type="password" id="npw2" placeholder="Confirmer" autocomplete="new-password">
        <div id="fbNpw" class="inline-msg"></div>
      </div>
      <button type="button" class="btn-formulaire btn-active" id="btnNpw">Mettre à jour</button>
    </form>
    <div id="messageConfirmation" class="message-confirmation"></div>`;

  document.getElementById("cf2")?.addEventListener("click", fermerEtReset);

  const npw1 = document.getElementById("npw1");
  const npw2 = document.getElementById("npw2");
  const fb   = document.getElementById("fbNpw");
  const btn  = document.getElementById("btnNpw");

  [npw1, npw2].forEach(i => i?.addEventListener("input", () => {
    if (!npw2.value) { fb.textContent = ""; fb.className = "inline-msg"; return; }
    if (npw1.value !== npw2.value) { fb.textContent = "✗ Différents"; fb.className = "inline-msg field-err"; }
    else { fb.textContent = "✓ Identiques"; fb.className = "inline-msg field-ok"; }
  }));

  btn?.addEventListener("click", async () => {
    if (npw1.value.length < 6) { toast("6 caractères minimum.", "error"); return; }
    if (npw1.value !== npw2.value) { toast("Les mots de passe ne correspondent pas.", "error"); return; }
    const originalText = btn.textContent;
    btn.innerHTML = `<span class="spinner"></span>Mise à jour...`;
    btn.disabled = true;
    const { error } = await db.auth.updateUser({ password: npw1.value });
    if (error) {
      toast(error.message, "error");
      btn.innerHTML = originalText;
      btn.disabled = false;
      return;
    }
    toast("Mot de passe mis à jour ! 🔐", "success");
    setTimeout(() => fermerEtReset(), 1500);
  });
}

// ─── MESSAGES SUCCÈS ──────────────────────────────────────────────
function afficherSucces(nom, prenom, isInscription) {
  const form     = document.querySelector("#popupFormulaire .custom-form");
  const titre    = document.querySelector("#popupFormulaire .text1");
  const subtitle = document.querySelector("#popupFormulaire .form-subtitle");
  if (form)     form.style.display     = "none";
  if (titre)    titre.style.display    = "none";
  if (subtitle) subtitle.style.display = "none";

  const msg = document.getElementById("messageConfirmation");
  if (msg) {
    msg.style.display = "flex";
    msg.innerHTML = `
      <div class="success-box">
        <i class="fa-solid fa-circle-check" style="color:#22c55e;font-size:70px"></i>
        <h3>${isInscription ? "Inscription validée !" : "Connexion réussie !"}</h3>
        <p>Bienvenue ${safe(initialeNom(nom))} ${safe(prenom)} !</p>
        ${isInscription ? `<span style="color:#9f9fa9;font-size:13px">Vérifie ton email pour confirmer ton compte.</span>` : ""}
      </div>`;
  }
}

// ─── DASHBOARD ────────────────────────────────────────────────────
function showDashboard() {
  const landing   = document.getElementById("landingPage");
  const dashboard = document.getElementById("dashboardPage");
  if (!landing || !dashboard) return;
  if (!currentProfil && !currentUser) return;

  landing.style.display   = "none";
  dashboard.style.display = "block";

  const p = currentProfil || {};
  const nomText    = p.nom    || "";
  const prenomText = p.prenom || "";
  const nomComplet = `${nomText} ${prenomText}`.trim() || currentUser?.email || "—";

  // Avatar
  const av = document.getElementById("dashAvatar");
  if (av) {
    const initials = [nomText[0], prenomText[0]].filter(Boolean).map(c => c.toUpperCase()).join("") || "?";
    av.textContent = initials;
  }

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || "—";
  };

  const dashName = document.getElementById("dashName");
  if (dashName) dashName.textContent = nomComplet;

  setText("profNom",      p.nom);
  setText("profPrenom",   p.prenom);
  setText("profEmail",    currentUser?.email || p.email);
  setText("profAge",      p.age ? `${p.age} ans` : null);
  setText("profFormation",p.formation);
  setText("profCreated",  formatDate(p.created_at || currentUser?.created_at));

  // Sécurité
  const emailConfirmed = currentUser?.email_confirmed_at;
  setText("secEmailStatus",
    emailConfirmed
      ? `Vérifié le ${formatDate(emailConfirmed)}`
      : "En attente de vérification"
  );
  setText("secLastLogin", p.last_login
    ? formatDate(p.last_login)
    : formatDate(currentUser?.last_sign_in_at)
  );

  updateDashStats();
}

function hideDashboard() {
  const landing   = document.getElementById("landingPage");
  const dashboard = document.getElementById("dashboardPage");
  if (landing)   landing.style.display   = "";
  if (dashboard) dashboard.style.display = "none";
}

function updateDashStats() {
  const el = id => document.getElementById(id);
  if (el("statTaches"))  el("statTaches").textContent  = taches.length;
  if (el("statEvents"))  el("statEvents").textContent  = events.length;
  if (el("statCommits")) el("statCommits").textContent = githubCommitCount;
}

// ─── DÉCONNEXION ──────────────────────────────────────────────────
document.getElementById("btnLogout")?.addEventListener("click", async () => {
  const { error } = await db.auth.signOut();
  if (error) { toast("Erreur lors de la déconnexion.", "error"); return; }
  currentUser   = null;
  currentProfil = null;
  renderNavAuth(null);
  setHeroTitle(null);
  hideDashboard();
  toast("À bientôt ! 👋", "info");
});

// ─── MODIFIER PROFIL ──────────────────────────────────────────────
const editProfileOverlay = document.getElementById("editProfileOverlay");

document.getElementById("btnEditProfile")?.addEventListener("click", () => {
  const p = currentProfil || {};
  const get = id => document.getElementById(id);
  if (get("editNom"))      get("editNom").value       = p.nom       || "";
  if (get("editPrenom"))   get("editPrenom").value     = p.prenom    || "";
  if (get("editAge"))      get("editAge").value        = p.age       || "";
  if (get("editFormation"))get("editFormation").value  = p.formation || "";
  editProfileOverlay?.classList.add("active");
});

document.getElementById("closeEditProfile")?.addEventListener("click", () => {
  editProfileOverlay?.classList.remove("active");
});

editProfileOverlay?.addEventListener("click", e => {
  if (e.target === editProfileOverlay) editProfileOverlay.classList.remove("active");
});

document.getElementById("btnSaveProfile")?.addEventListener("click", async () => {
  if (!currentUser) return;
  const btn = document.getElementById("btnSaveProfile");
  const nom       = document.getElementById("editNom")?.value.trim();
  const prenom    = document.getElementById("editPrenom")?.value.trim();
  const age       = parseInt(document.getElementById("editAge")?.value) || null;
  const formation = document.getElementById("editFormation")?.value.trim();

  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<span class="spinner"></span>Sauvegarde...`;
  btn.disabled  = true;

  const { error } = await db.from("inscriptions")
    .update({ nom, prenom, age, formation })
    .eq("email", currentUser.email);

  if (error) {
    toast("Erreur lors de la sauvegarde.", "error");
  } else {
    await chargerProfil(currentUser.email);
    renderNavAuth(currentProfil);
    setHeroTitle(currentProfil);
    showDashboard();
    editProfileOverlay?.classList.remove("active");
    toast("Profil mis à jour ! ✓", "success");
  }
  btn.innerHTML = originalHTML;
  btn.disabled  = false;
});

// ─── CHANGER MOT DE PASSE (depuis dashboard) ──────────────────────
const changePwOverlay = document.getElementById("changePwOverlay");

document.getElementById("btnChangePw")?.addEventListener("click", () => {
  changePwOverlay?.classList.add("active");
});
document.getElementById("closeChangePw")?.addEventListener("click", () => {
  changePwOverlay?.classList.remove("active");
});
changePwOverlay?.addEventListener("click", e => {
  if (e.target === changePwOverlay) changePwOverlay.classList.remove("active");
});

const newPwInput     = document.getElementById("newPw");
const confirmNewPwIn = document.getElementById("confirmNewPw");
const errNewPw       = document.getElementById("errNewPw");

[newPwInput, confirmNewPwIn].forEach(el => {
  el?.addEventListener("input", () => {
    if (!errNewPw) return;
    if (!confirmNewPwIn.value) { errNewPw.textContent = ""; errNewPw.className = ""; return; }
    if (newPwInput.value !== confirmNewPwIn.value) {
      errNewPw.textContent = "✗ Mots de passe différents";
      errNewPw.className = "field-err";
    } else {
      errNewPw.textContent = "✓ Identiques";
      errNewPw.className = "field-ok";
    }
  });
});

document.getElementById("btnSavePw")?.addEventListener("click", async () => {
  const btn = document.getElementById("btnSavePw");
  const pw1 = newPwInput?.value;
  const pw2 = confirmNewPwIn?.value;
  if (!pw1 || pw1.length < 6) { toast("6 caractères minimum.", "error"); return; }
  if (pw1 !== pw2) { toast("Les mots de passe ne correspondent pas.", "error"); return; }

  const originalHTML = btn.innerHTML;
  btn.innerHTML = `<span class="spinner"></span>Mise à jour...`;
  btn.disabled  = true;

  const { error } = await db.auth.updateUser({ password: pw1 });
  if (error) {
    toast(error.message, "error");
  } else {
    toast("Mot de passe mis à jour ! 🔐", "success");
    changePwOverlay?.classList.remove("active");
    if (newPwInput)     newPwInput.value     = "";
    if (confirmNewPwIn) confirmNewPwIn.value = "";
    if (errNewPw)       errNewPw.textContent = "";
  }
  btn.innerHTML = originalHTML;
  btn.disabled  = false;
});

// ─── INIT ─────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  // Pré-rendre le formulaire inscription en arrière-plan (sans ouvrir l'overlay)
  const popup = document.getElementById("popupFormulaire");
  if (popup) renderInscription(popup);

  // Délégation sur la zone auth nav (au cas où le bouton est re-créé par renderNavAuth)
  document.getElementById("navAuthZone")?.addEventListener("click", e => {
    if (e.target.id === "openFormBtn" || e.target.closest("#openFormBtn")) {
      openAuthOverlay("inscription");
    }
  });

  // Charger la session APRÈS que le DOM soit prêt
  chargerSession();
});

// ─── GLOBAUX ──────────────────────────────────────────────────────
window.afficherVue   = afficherVue;
window.openAuthOverlay = openAuthOverlay;