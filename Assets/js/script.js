// =============================================
// SUPABASE CONFIG
// =============================================
const SUPABASE_URL = "https://dxtgwpoeclgyldoymvpl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGd3cG9lY2xneWxkb3ltdnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzE1NTMsImV4cCI6MjA5NDgwNzU1M30.dkfyncgnpSprtl86BK6ztILLFYEahiODENIn-h9kvDI";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================================
// MENU
// =============================================
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");
const menuOverlay = document.getElementById("menuOverlay");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    menuPanel.classList.toggle("open");
    menuOverlay.classList.toggle("active");
  });
}
if (menuOverlay) {
  menuOverlay.addEventListener("click", () => {
    menuPanel.classList.remove("open");
    menuOverlay.classList.remove("active");
  });
}

// =============================================
// POPUP INSCRIPTION / CONNEXION
// =============================================
const openFormBtn = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const formOverlay = document.getElementById("formOverlay");

if (openFormBtn) openFormBtn.addEventListener("click", () => formOverlay.classList.add("active"));
if (closeFormBtn) closeFormBtn.addEventListener("click", () => formOverlay.classList.remove("active"));

// Basculer entre inscription et connexion
const loginLink = document.querySelector(".login-link a");
let modeConnexion = false;

if (loginLink) {
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    modeConnexion = !modeConnexion;
    basculerMode();
  });
}

function basculerMode() {
  const titre = document.querySelector(".text1");
  const subtitle = document.querySelector(".form-subtitle");
  const btnInscription = document.getElementById("btnInscription");
  const loginLink = document.querySelector(".login-link a");
  const champSupp = document.querySelectorAll(".form-row, .input-group-custom:not(:nth-child(3)), .content");

  // Champs uniquement inscription
  const champsInscriptionOnly = document.querySelectorAll(
    "#nom, #prenom, #age, #formation, #confirmation, #robotCheck"
  );
  const rowsToHide = document.querySelectorAll(".form-row");
  const checkboxRow = document.querySelector(".content");

  if (modeConnexion) {
    titre.textContent = "Se connecter";
    subtitle.textContent = "Connecte-toi à ton compte.";
    btnInscription.textContent = "Se connecter";
    loginLink.textContent = "Pas encore de compte ? S'inscrire";
    rowsToHide.forEach(r => r.style.display = "none");
    if (checkboxRow) checkboxRow.style.display = "none";
    document.getElementById("confirmation").closest(".input-group-custom").style.display = "none";
  } else {
    titre.textContent = "Créer un compte";
    subtitle.textContent = "Rejoins et accède à mes projets web UI.";
    btnInscription.textContent = "Créer un compte";
    loginLink.textContent = "Vous avez déjà un compte ?";
    rowsToHide.forEach(r => r.style.display = "");
    if (checkboxRow) checkboxRow.style.display = "";
  }
  viderFormulaire();
}

function viderFormulaire() {
  ["nom", "prenom", "email", "motdepasse", "confirmation", "age", "formation"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const ch1 = document.getElementById("ch1");
  if (ch1) ch1.checked = false;
  document.getElementById("btnInscription").disabled = true;
  const msg = document.getElementById("messageConfirmation");
  if (msg) { msg.textContent = ""; msg.className = "message-confirmation"; }
}

// =============================================
// VALIDATION EMAIL
// =============================================
function verifierEmail() {
  const email = document.getElementById("email").value;
  const erreur = document.getElementById("erreurEmail");
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    erreur.textContent = "Email invalide";
    erreur.style.color = "red";
    erreur.style.fontSize = "0.8rem";
  } else {
    erreur.textContent = "";
  }
  verifierFormulaire();
}
window.verifierEmail = verifierEmail;

// =============================================
// VALIDATION MOT DE PASSE
// =============================================
function verifierMdp() {
  const mdp = document.getElementById("motdepasse").value;
  const conf = document.getElementById("confirmation").value;
  const erreur = document.getElementById("erreurMdp");
  if (modeConnexion) { verifierFormulaire(); return; }
  if (mdp.length < 6) {
    erreur.textContent = "Minimum 6 caractères";
    erreur.style.color = "red";
    erreur.style.fontSize = "0.8rem";
  } else if (conf && mdp !== conf) {
    erreur.textContent = "Les mots de passe ne correspondent pas";
    erreur.style.color = "red";
    erreur.style.fontSize = "0.8rem";
  } else {
    erreur.textContent = "";
  }
  verifierFormulaire();
}
window.verifierMdp = verifierMdp;

// =============================================
// ACTIVATION BOUTON
// =============================================
function verifierFormulaire() {
  const btn = document.getElementById("btnInscription");
  const email = document.getElementById("email").value;
  const mdp = document.getElementById("motdepasse").value;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (modeConnexion) {
    btn.disabled = !(regex.test(email) && mdp.length >= 6);
    return;
  }

  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const conf = document.getElementById("confirmation").value;
  const ch1 = document.getElementById("ch1");
  const robotCheck = ch1 ? ch1.checked : false;

  btn.disabled = !(
    nom && prenom &&
    regex.test(email) &&
    mdp.length >= 6 &&
    mdp === conf &&
    robotCheck
  );
}

// Activer vérification sur tous les champs
["nom", "prenom", "age", "formation"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", verifierFormulaire);
});
const ch1 = document.getElementById("ch1");
if (ch1) ch1.addEventListener("change", verifierFormulaire);

// =============================================
// INSCRIPTION / CONNEXION SUPABASE
// =============================================
const btnInscription = document.getElementById("btnInscription");
if (btnInscription) {
  btnInscription.addEventListener("click", async () => {
    if (modeConnexion) {
      await connecterUtilisateur();
    } else {
      await inscrireUtilisateur();
    }
  });
}

async function inscrireUtilisateur() {
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const email = document.getElementById("email").value.trim();
  const mdp = document.getElementById("motdepasse").value;
  const age = parseInt(document.getElementById("age").value) || null;
  const formation = document.getElementById("formation").value.trim();
  const msg = document.getElementById("messageConfirmation");
  const btn = document.getElementById("btnInscription");

  btn.disabled = true;
  btn.textContent = "Création en cours...";

  try {
    // 1. Créer le compte auth Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: mdp,
    });

    if (authError) throw authError;

    // 2. Insérer dans la table inscriptions
    const { error: dbError } = await supabase.from("inscriptions").insert([
      { nom, prenom, email, age, formation }
    ]);

    if (dbError) throw dbError;

    msg.textContent = "✅ Compte créé avec succès ! Vérifie ton email pour confirmer ton inscription.";
    msg.style.color = "#4ade80";
    msg.style.fontWeight = "600";
    msg.style.marginTop = "1rem";
    viderFormulaire();
    btn.textContent = "Créer un compte";
  } catch (err) {
    msg.textContent = "❌ Erreur : " + (err.message || "Une erreur est survenue");
    msg.style.color = "#f87171";
    msg.style.fontWeight = "600";
    msg.style.marginTop = "1rem";
    btn.disabled = false;
    btn.textContent = "Créer un compte";
  }
}

async function connecterUtilisateur() {
  const email = document.getElementById("email").value.trim();
  const mdp = document.getElementById("motdepasse").value;
  const msg = document.getElementById("messageConfirmation");
  const btn = document.getElementById("btnInscription");

  btn.disabled = true;
  btn.textContent = "Connexion en cours...";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: mdp });
    if (error) throw error;

    msg.textContent = "✅ Connecté avec succès ! Bienvenue " + (data.user?.email || "") + " 👋";
    msg.style.color = "#4ade80";
    msg.style.fontWeight = "600";
    msg.style.marginTop = "1rem";

    // Mettre à jour le bouton nav
    const navBtn = document.getElementById("openFormBtn");
    if (navBtn) navBtn.textContent = "Mon compte ✓";

    setTimeout(() => formOverlay.classList.remove("active"), 2000);
    btn.textContent = "Se connecter";
  } catch (err) {
    msg.textContent = "❌ " + (err.message === "Invalid login credentials"
      ? "Email ou mot de passe incorrect"
      : err.message || "Erreur de connexion");
    msg.style.color = "#f87171";
    msg.style.fontWeight = "600";
    msg.style.marginTop = "1rem";
    btn.disabled = false;
    btn.textContent = "Se connecter";
  }
}

// =============================================
// TODO LIST
// =============================================
const inputTache = document.getElementById("inputTache");
const btnAjouter = document.getElementById("btnAjouter");
const listeTaches = document.getElementById("listeTaches");
const messageVide = document.getElementById("messageVide");

let taches = JSON.parse(localStorage.getItem("taches")) || [];

function sauvegarder() {
  localStorage.setItem("taches", JSON.stringify(taches));
}

function afficherTaches() {
  listeTaches.innerHTML = "";
  messageVide.style.display = taches.length === 0 ? "block" : "none";
  taches.forEach((tache, index) => {
    const li = document.createElement("li");
    li.className = tache.fait ? "fait" : "";
    li.innerHTML = `
      <span onclick="toggleTache(${index})">${tache.texte}</span>
      <button onclick="supprimerTache(${index})"><i class="fa-solid fa-trash"></i></button>
    `;
    listeTaches.appendChild(li);
  });
}

window.toggleTache = function(index) {
  taches[index].fait = !taches[index].fait;
  sauvegarder();
  afficherTaches();
};

window.supprimerTache = function(index) {
  taches.splice(index, 1);
  sauvegarder();
  afficherTaches();
};

if (btnAjouter) {
  btnAjouter.addEventListener("click", () => {
    const texte = inputTache.value.trim();
    if (!texte) return;
    taches.push({ texte, fait: false });
    sauvegarder();
    afficherTaches();
    inputTache.value = "";
  });
}

if (inputTache) {
  inputTache.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnAjouter.click();
  });
}

afficherTaches();

// =============================================
// CALENDRIER / ÉVÉNEMENTS
// =============================================
const btnAddEvent = document.getElementById("btnAddEvent");
const closeEvent = document.getElementById("closeEvent");
const saveEvent = document.getElementById("saveEvent");
const eventOverlay = document.getElementById("eventOverlay");
const eventList = document.getElementById("eventList");
const eventEmpty = document.getElementById("eventEmpty");

let events = JSON.parse(localStorage.getItem("events")) || [];

function sauvegarderEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

function afficherEvents() {
  eventList.innerHTML = "";
  eventEmpty.style.display = events.length === 0 ? "block" : "none";
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  events.forEach((ev, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${ev.nom} — <small>${ev.date}</small></span>
      <button onclick="supprimerEvent(${i})"><i class="fa-solid fa-xmark"></i></button>
    `;
    eventList.appendChild(li);
  });
}

window.supprimerEvent = function(i) {
  events.splice(i, 1);
  sauvegarderEvents();
  afficherEvents();
};

if (btnAddEvent) btnAddEvent.addEventListener("click", () => eventOverlay.classList.add("active"));
if (closeEvent) closeEvent.addEventListener("click", () => eventOverlay.classList.remove("active"));
if (saveEvent) {
  saveEvent.addEventListener("click", () => {
    const nom = document.getElementById("eventName").value.trim();
    const date = document.getElementById("eventDate").value;
    if (!nom || !date) return;
    events.push({ nom, date });
    sauvegarderEvents();
    afficherEvents();
    document.getElementById("eventName").value = "";
    document.getElementById("eventDate").value = "";
    eventOverlay.classList.remove("active");
  });
}

afficherEvents();

// =============================================
// GITHUB ACTIVITY
// =============================================
async function chargerGithub() {
  const container = document.getElementById("githubUpdates");
  try {
    const res = await fetch("https://api.github.com/repos/Mkail14/ma-page/commits?per_page=4");
    const commits = await res.json();
    if (!Array.isArray(commits)) throw new Error("Erreur API");
    container.innerHTML = commits.map(c => `
      <div class="update-item">
        <div class="update-dot"></div>
        <div>
          <strong>${c.commit.message}</strong>
          <p>${new Date(c.commit.author.date).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>
    `).join("");
  } catch {
    container.innerHTML = `<div class="update-item"><div class="update-dot"></div><div><strong>Impossible de charger</strong><p>Vérifie ta connexion</p></div></div>`;
  }
}

chargerGithub();