/* ================================================================
   DWWM - Mario | script.js
   Auth complet : inscription, connexion, déconnexion,
   mot de passe oublié, dashboard profil, modification profil,
   changement de mot de passe, sessions Supabase
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

/** Initiale du nom : "Dupont" → "D." */
function initialeNom(nom) {
  return nom ? nom.trim()[0].toUpperCase() + "." : "";
}

/** Sanitise un texte pour éviter XSS dans le DOM (injection HTML) */
function safe(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

/** Toast notification (type: 'success' | 'error' | 'info') */
function toast(msg, type = "info", duration = 4000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const icons = { success:"✓", error:"✗", info:"ℹ" };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span style="font-size:16px;font-weight:700">${icons[type]}</span>${safe(msg)}`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 350);
  }, duration);
}

/** Validation d'email */
function isEmailValid(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** Formate une date ISO en français */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });
}

// ─── NAV : ZONE AUTH ──────────────────────────────────────────────
function renderNavAuth(profil) {
  const zone = document.getElementById("navAuthZone");
  if (!zone) return;
  if (profil) {
    const initials = (initialeNom(profil.nom) + (profil.prenom ? profil.prenom[0].toUpperCase() : "")).replace(".","");
    zone.innerHTML = `
      <div class="nav-user-pill" id="navUserPill" title="Mon compte">
        <div class="nav-avatar">${safe(initials)}</div>
        <span class="nav-user-name">${safe(initialeNom(profil.nom))}${safe(profil.prenom || "")}</span>
      </div>`;
    document.getElementById("navUserPill")?.addEventListener("click", () => {
      showDashboard();
    });
  } else {
    zone.innerHTML = `<button class="contact-btn" id="openFormBtn">S'inscrire</button>`;
    document.getElementById("openFormBtn")?.addEventListener("click", () => openAuthOverlay("inscription"));
  }
}

/** Titre hero */
function setHeroTitle(profil) {
  const el = document.getElementById("heroTitle");
  if (!el) return;
  el.textContent = profil
    ? `Bonjour ${initialeNom(profil.nom)}${profil.prenom || ""}`
    : "Bonjour R. Mario";
}

// ─── SESSION AU CHARGEMENT ────────────────────────────────────────
async function chargerSession() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    currentUser   = null;
    currentProfil = null;
    renderNavAuth(null);
    return;
  }
  currentUser = session.user;
  await chargerProfil(currentUser.email);
  renderNavAuth(currentProfil);
  setHeroTitle(currentProfil);
}
chargerSession();

/** Récupère le profil depuis la table `inscriptions` */
async function chargerProfil(email) {
  const { data } = await db.from("inscriptions").select("*").eq("email", email).single();
  currentProfil = data || null;
}

// ─── AUTH STATE CHANGE (écoute Supabase) ─────────────────────────
db.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN" && session) {
    currentUser = session.user;
    await chargerProfil(currentUser.email);
    renderNavAuth(currentProfil);
    setHeroTitle(currentProfil);
    // Mise à jour last_login
    await db.from("inscriptions")
      .update({ last_login: new Date().toISOString() })
      .eq("email", currentUser.email);
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
  const texte = inputTache ? inputTache.value.trim() : "";
  if (!texte) return;
  taches.unshift({ id: Date.now(), description: texte, completed: false });
  sauvegarderTaches(); rendreListeTaches();
  if (inputTache) inputTache.value = "";
}
function marquerTacheTerminee(id) {
  const t = taches.find(t => t.id === id);
  if (t) { t.completed = !t.completed; sauvegarderTaches(); rendreListeTaches(); }
}
function supprimerTache(id) {
  taches = taches.filter(t => t.id !== id);
  sauvegarderTaches(); rendreListeTaches();
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
    const btnDone   = document.createElement("button");
    btnDone.textContent = tache.completed ? "Annuler" : "OK";
    btnDone.onclick = () => marquerTacheTerminee(tache.id);
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "✕";
    btnDelete.onclick = () => supprimerTache(tache.id);
    actions.appendChild(btnDone); actions.appendChild(btnDelete);
    li.appendChild(span); li.appendChild(actions);
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
const eventName    = document.getElementById("eventName");
const eventDate    = document.getElementById("eventDate");
const saveEvent    = document.getElementById("saveEvent");
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
      <button class="btn-delete-event" style="border:none;background:transparent;color:#ef4444;cursor:pointer;font-size:16px">
        <i class="fa-solid fa-trash"></i>
      </button>`;
    li.querySelector(".btn-delete-event").onclick = () => supprimerEvent(event.id);
    eventList.appendChild(li);
  });
}
if (btnAddEvent)  btnAddEvent.addEventListener("click",  () => eventOverlay.classList.add("active"));
if (closeEvent)   closeEvent.addEventListener("click",   () => eventOverlay.classList.remove("active"));
if (eventOverlay) eventOverlay.addEventListener("click", e => { if (e.target === eventOverlay) eventOverlay.classList.remove("active"); });
if (saveEvent) {
  saveEvent.addEventListener("click", () => {
    const nom  = eventName?.value.trim();
    const date = eventDate?.value;
    if (!nom || !date) { toast("Remplis le nom et la date.", "error"); return; }
    events.unshift({ id: Date.now(), nom, date });
    sauvegarderEvenements(); rendreEvenements();
    if (eventName) eventName.value = "";
    if (eventDate) eventDate.value = "";
    eventOverlay.classList.remove("active");
    toast("Événement ajouté !", "success");
    updateDashStats();
  });
}
function supprimerEvent(id) {
  events = events.filter(e => e.id !== id);
  sauvegarderEvenements(); rendreEvenements();
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
      githubUpdates.innerHTML = `<div class="event-empty">Aucun commit trouvé</div>`; return;
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
  formOverlay.classList.add("active");
  afficherVue(mode);
}

function fermerEtReset() {
  formOverlay.classList.remove("active");
  setTimeout(() => afficherVue("inscription"), 300);
}

formOverlay?.addEventListener("click", e => {
  if (e.target === formOverlay) fermerEtReset();
});

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

// ────────────────────────────────────────────
// VUE INSCRIPTION
// ────────────────────────────────────────────
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
        <a href="#" id="lkConnexion">Vous avez déjà un compte ?</a>
      </div>
    </form>
    <div id="messageConfirmation" class="message-confirmation"></div>`;

  document.getElementById("cf2")?.addEventListener("click", fermerEtReset);
  document.getElementById("lkConnexion")?.addEventListener("click", e => { e.preventDefault(); afficherVue("connexion"); });

  popup.querySelectorAll(".custom-form input").forEach(i => i.addEventListener("input", checkInscription));
  document.getElementById("ch1")?.addEventListener("change", checkInscription);
}

function checkInscription() {
  const btn  = document.getElementById("btnInscription");
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

  // Feedback email
  if (fbEmail) {
    if (!email) { fbEmail.textContent = ""; fbEmail.className = "inline-msg"; }
    else if (isEmailValid(email)) { fbEmail.textContent = "✓ Email valide"; fbEmail.className = "inline-msg field-ok"; }
    else { fbEmail.textContent = "✗ Format invalide"; fbEmail.className = "inline-msg field-err"; }
  }

  // Feedback mot de passe
  if (fbMdp) {
    if (!mdp) { fbMdp.textContent = ""; fbMdp.className = "inline-msg"; }
    else if (mdp.length < 6) { fbMdp.textContent = "✗ 6 caractères minimum"; fbMdp.className = "inline-msg field-err"; }
    else if (conf && conf !== mdp) { fbMdp.textContent = "✗ Mots de passe différents"; fbMdp.className = "inline-msg field-err"; }
    else if (conf === mdp) { fbMdp.textContent = "✓ Mots de passe identiques"; fbMdp.className = "inline-msg field-ok"; }
    else { fbMdp.textContent = ""; fbMdp.className = "inline-msg"; }
  }

  const ok = nom && prenom && isEmailValid(email) && mdp && mdp.length >= 6 && mdp === conf && age && formation && robot;
  btn.disabled = !ok;
  btn.classList.toggle("btn-active", !!ok);

  if (!btn._bound) {
    btn._bound = true;
    btn.addEventListener("click", handleInscription);
  }
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

  btn.innerHTML = `<span class="spinner"></span>Création en cours...`;
  btn.disabled  = true;

  try {
    // 1. Vérifier si email déjà pris dans la table inscriptions
    const { data: existant } = await db.from("inscriptions").select("id").eq("email", email).single();
    if (existant) throw new Error("Cet email est déjà utilisé.");

    // 2. Créer le compte Supabase Auth (mot de passe haché par Supabase/bcrypt)
    const { data: authData, error: authErr } = await db.auth.signUp({ email, password: mdp });
    if (authErr) throw authErr;

    // 3. Insérer profil dans la table inscriptions
    const { error: dbErr } = await db.from("inscriptions").insert([{
      id:        authData.user?.id,
      nom, prenom, email, age, formation,
      created_at: new Date().toISOString()
    }]);
    if (dbErr) console.warn("DB profil:", dbErr.message);

    // Succès
    afficherSucces(nom, prenom, true);
    toast("Compte créé ! Vérifie ton email.", "success", 6000);

  } catch(err) {
    let msg = err.message || "Erreur inconnue.";
    if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("déjà utilisé")) msg = "Cet email est déjà utilisé.";
    if (msg.includes("Password should be")) msg = "Mot de passe trop faible (6 caractères min).";
    btn.textContent = "Créer un compte"; btn.disabled = false; btn.classList.remove("btn-active");
    toast(msg, "error");
  }
}

// ────────────────────────────────────────────
// VUE CONNEXION
// ────────────────────────────────────────────
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

  const btn = document.getElementById("btnConnexion");
  popup.querySelectorAll(".custom-form input").forEach(i => i.addEventListener("input", checkConnexion));
  btn?.addEventListener("click", handleConnexion);
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
  const ok = isEmailValid(email) && mdp && mdp.length >= 1;
  btn.disabled = !ok;
  btn.classList.toggle("btn-active", !!ok);
}

async function handleConnexion() {
  const btn = document.getElementById("btnConnexion");
  if (!btn || btn.disabled) return;
  const email = document.getElementById("email").value.trim();
  const mdp   = document.getElementById("motdepasse").value;

  btn.innerHTML = `<span class="spinner"></span>Connexion...`;
  btn.disabled  = true;

  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password: mdp });
    if (error) throw error;

    currentUser = data.user;
    await chargerProfil(email);

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
    if (msg.includes("Email not confirmed")) msg = "Confirme ton email d'abord.";
    if (msg.includes("Too many requests"))   msg = "Trop de tentatives. Réessaie dans 1 min.";
    btn.textContent = "Se connecter"; btn.disabled = false; btn.classList.add("btn-active");
    toast(msg, "error");
  }
}

// ────────────────────────────────────────────
// VUE MOT DE PASSE OUBLIÉ
// ────────────────────────────────────────────
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
      fbReset.className = "inline-msg " + (ok ? "field-ok" : "field-err");
    }
    if (btnReset) { btnReset.disabled = !ok; btnReset.classList.toggle("btn-active", ok); }
  });

  btnReset?.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return;
    btnReset.innerHTML = `<span class="spinner"></span>Envoi...`;
    btnReset.disabled = true;

    try {
      const { error } = await db.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });
      if (error) throw error;

      // Affichage confirmation
      document.querySelector(".custom-form").style.display = "none";
      document.querySelector(".text1").style.display       = "none";
      document.querySelector(".form-subtitle").style.display = "none";
      const msg = document.getElementById("messageConfirmation");
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
      toast("Email de réinitialisation envoyé !", "success");

    } catch(err) {
      btnReset.textContent = "Envoyer le lien"; btnReset.disabled = false; btnReset.classList.add("btn-active");
      toast(err.message || "Erreur lors de l'envoi.", "error");
    }
  });
}

// ────────────────────────────────────────────
// VUE NOUVEAU MOT DE PASSE (après reset email)
// ────────────────────────────────────────────
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

  [npw1, npw2].forEach(i => i.addEventListener("input", () => {
    if (!npw2.value) { fb.textContent = ""; return; }
    if (npw1.value !== npw2.value) { fb.textContent = "✗ Différents"; fb.className = "inline-msg field-err"; }
    else { fb.textContent = "✓ Identiques"; fb.className = "inline-msg field-ok"; }
  }));

  btn.addEventListener("click", async () => {
    if (npw1.value.length < 6) { toast("6 caractères minimum.", "error"); return; }
    if (npw1.value !== npw2.value) { toast("Les mots de passe ne correspondent pas.", "error"); return; }
    btn.innerHTML = `<span class="spinner"></span>Mise à jour...`;
    btn.disabled = true;
    const { error } = await db.auth.updateUser({ password: npw1.value });
    if (error) { toast(error.message, "error"); btn.textContent = "Mettre à jour"; btn.disabled = false; return; }
    toast("Mot de passe mis à jour ! 🔐", "success");
    setTimeout(() => fermerEtReset(), 1500);
  });
}

// ─── MESSAGES SUCCÈS ──────────────────────────────────────────────
function afficherSucces(nom, prenom, isInscription) {
  document.querySelector(".custom-form")?.style && (document.querySelector(".custom-form").style.display = "none");
  document.querySelector(".text1")?.style && (document.querySelector(".text1").style.display = "none");
  document.querySelector(".form-subtitle")?.style && (document.querySelector(".form-subtitle").style.display = "none");
  const msg = document.getElementById("messageConfirmation");
  if (msg) {
    msg.style.display = "flex";
    msg.innerHTML = `
      <div class="success-box">
        <i class="fa-solid fa-circle-check" style="color:#22c55e;font-size:70px"></i>
        <h3>${isInscription ? "Inscription validée !" : "Connexion réussie !"}</h3>
        <p>Bienvenue ${safe(initialeNom(nom))}${safe(prenom)} !</p>
        ${isInscription ? `<span style="color:#9f9fa9;font-size:13px">Vérifie ton email pour confirmer ton compte.</span>` : ""}
      </div>`;
  }
}

// ─── DASHBOARD ────────────────────────────────────────────────────
function showDashboard() {
  if (!currentProfil && !currentUser) return;

  const landing   = document.getElementById("landingPage");
  const dashboard = document.getElementById("dashboardPage");
  if (!landing || !dashboard) return;

  landing.style.display   = "none";
  dashboard.style.display = "block";

  // Remplir les infos profil
  const p = currentProfil || {};
  const nomComplet = `${p.nom || ""} ${p.prenom || ""}`.trim() || currentUser?.email || "—";

  // Avatar dans le dashboard
  const av = document.getElementById("dashAvatar");
  if (av) {
    const initials = `${p.nom ? p.nom[0].toUpperCase() : ""}${p.prenom ? p.prenom[0].toUpperCase() : ""}` || "?";
    av.textContent = initials;
  }

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || "—"; };
  document.getElementById("dashName") && (document.getElementById("dashName").textContent = nomComplet);
  setText("profNom", p.nom);
  setText("profPrenom", p.prenom);
  setText("profEmail", currentUser?.email || p.email);
  setText("profAge", p.age ? `${p.age} ans` : null);
  setText("profFormation", p.formation);
  setText("profCreated", formatDate(p.created_at || currentUser?.created_at));

  // Sécurité
  const emailConfirmed = currentUser?.email_confirmed_at;
  setText("secEmailStatus", emailConfirmed ? `Vérifié le ${formatDate(emailConfirmed)}` : "En attente de vérification");
  setText("secLastLogin", p.last_login ? formatDate(p.last_login) : formatDate(currentUser?.last_sign_in_at));

  updateDashStats();
}

function hideDashboard() {
  const landing   = document.getElementById("landingPage");
  const dashboard = document.getElementById("dashboardPage");
  if (landing)   landing.style.display   = "";
  if (dashboard) dashboard.style.display = "none";
}

function updateDashStats() {
  const statTaches  = document.getElementById("statTaches");
  const statEvents  = document.getElementById("statEvents");
  const statCommits = document.getElementById("statCommits");
  if (statTaches)  statTaches.textContent  = taches.length;
  if (statEvents)  statEvents.textContent  = events.length;
  if (statCommits) statCommits.textContent = githubCommitCount;
}

// ─── DÉCONNEXION ──────────────────────────────────────────────────
document.getElementById("btnLogout")?.addEventListener("click", async () => {
  const { error } = await db.auth.signOut();
  if (error) { toast("Erreur lors de la déconnexion.", "error"); return; }
  toast("À bientôt ! 👋", "info");
  hideDashboard();
  currentUser   = null;
  currentProfil = null;
  renderNavAuth(null);
  setHeroTitle(null);
});

// ─── MODIFIER PROFIL ──────────────────────────────────────────────
const editProfileOverlay = document.getElementById("editProfileOverlay");
const closeEditProfile   = document.getElementById("closeEditProfile");
const btnEditProfile     = document.getElementById("btnEditProfile");
const btnSaveProfile     = document.getElementById("btnSaveProfile");

btnEditProfile?.addEventListener("click", () => {
  // Pré-remplir les champs
  const p = currentProfil || {};
  document.getElementById("editNom").value      = p.nom       || "";
  document.getElementById("editPrenom").value   = p.prenom    || "";
  document.getElementById("editAge").value      = p.age       || "";
  document.getElementById("editFormation").value= p.formation || "";
  editProfileOverlay.classList.add("active");
});

closeEditProfile?.addEventListener("click", () => editProfileOverlay.classList.remove("active"));
editProfileOverlay?.addEventListener("click", e => { if (e.target === editProfileOverlay) editProfileOverlay.classList.remove("active"); });

btnSaveProfile?.addEventListener("click", async () => {
  if (!currentUser) return;
  const nom       = document.getElementById("editNom").value.trim();
  const prenom    = document.getElementById("editPrenom").value.trim();
  const age       = parseInt(document.getElementById("editAge").value) || null;
  const formation = document.getElementById("editFormation").value.trim();

  btnSaveProfile.innerHTML = `<span class="spinner"></span>Sauvegarde...`;
  btnSaveProfile.disabled  = true;

  const { error } = await db.from("inscriptions")
    .update({ nom, prenom, age, formation })
    .eq("email", currentUser.email);

  if (error) { toast("Erreur lors de la sauvegarde.", "error"); }
  else {
    await chargerProfil(currentUser.email);
    renderNavAuth(currentProfil);
    setHeroTitle(currentProfil);
    showDashboard();
    editProfileOverlay.classList.remove("active");
    toast("Profil mis à jour ! ✓", "success");
  }
  btnSaveProfile.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Sauvegarder`;
  btnSaveProfile.disabled  = false;
});

// ─── CHANGER MOT DE PASSE (depuis dashboard) ──────────────────────
const changePwOverlay = document.getElementById("changePwOverlay");
const closeChangePw   = document.getElementById("closeChangePw");
const btnChangePw     = document.getElementById("btnChangePw");
const btnSavePw       = document.getElementById("btnSavePw");

btnChangePw?.addEventListener("click", () => changePwOverlay.classList.add("active"));
closeChangePw?.addEventListener("click", () => changePwOverlay.classList.remove("active"));
changePwOverlay?.addEventListener("click", e => { if (e.target === changePwOverlay) changePwOverlay.classList.remove("active"); });

const newPwInput      = document.getElementById("newPw");
const confirmNewPwIn  = document.getElementById("confirmNewPw");
const errNewPw        = document.getElementById("errNewPw");

[newPwInput, confirmNewPwIn].forEach(el => {
  el?.addEventListener("input", () => {
    if (!confirmNewPwIn.value) { errNewPw.textContent = ""; return; }
    if (newPwInput.value !== confirmNewPwIn.value) {
      errNewPw.textContent = "✗ Mots de passe différents"; errNewPw.className = "field-err";
    } else {
      errNewPw.textContent = "✓ Identiques"; errNewPw.className = "field-ok";
    }
  });
});

btnSavePw?.addEventListener("click", async () => {
  const pw1 = newPwInput.value;
  const pw2 = confirmNewPwIn.value;
  if (pw1.length < 6) { toast("6 caractères minimum.", "error"); return; }
  if (pw1 !== pw2)    { toast("Les mots de passe ne correspondent pas.", "error"); return; }

  btnSavePw.innerHTML = `<span class="spinner"></span>Mise à jour...`;
  btnSavePw.disabled  = true;

  const { error } = await db.auth.updateUser({ password: pw1 });
  if (error) { toast(error.message, "error"); }
  else {
    toast("Mot de passe mis à jour ! 🔐", "success");
    changePwOverlay.classList.remove("active");
    newPwInput.value = ""; confirmNewPwIn.value = ""; errNewPw.textContent = "";
  }
  btnSavePw.innerHTML = `<i class="fa-solid fa-key"></i> Mettre à jour`;
  btnSavePw.disabled  = false;
});

// ─── INIT AU CHARGEMENT ───────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  afficherVue("inscription");
  // Ouvrir l'overlay auth via le bouton nav (délégation — le bouton peut être re-créé)
  document.getElementById("navAuthZone")?.addEventListener("click", e => {
    if (e.target.id === "openFormBtn" || e.target.closest("#openFormBtn")) {
      openAuthOverlay("inscription");
    }
  });
});

// ─── EXPOSER LES GLOBAUX ──────────────────────────────────────────
window.afficherVue    = afficherVue;
window.verifierEmail  = () => {};
window.verifierMdp    = () => {};