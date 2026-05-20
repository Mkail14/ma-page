// ================= SUPABASE INIT =================
const SUPABASE_URL = "https://dxtgwpoeclgyldoymvpl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGd3cG9lY2xneWxkb3ltdnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzE1NTMsImV4cCI6MjA5NDgwNzU1M30.dkfyncgnpSprtl86BK6ztILLFYEahiODENIn-h9kvDI";

let db = null;

function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return true;
    }
    return false;
}
initSupabase();

// ================= MENU =================
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

// ================= TODO LIST =================
const inputTache  = document.getElementById("inputTache");
const btnAjouter  = document.getElementById("btnAjouter");
const liste       = document.getElementById("listeTaches");
const messageVide = document.getElementById("messageVide");
let taches = [];

function chargerTachesLocal() {
    try { taches = JSON.parse(localStorage.getItem("taches") || "[]"); }
    catch(e) { taches = []; }
    rendreListeTaches();
}

function sauvegarderTaches() {
    try { localStorage.setItem("taches", JSON.stringify(taches)); } catch(e) {}
}

function ajouterTache() {
    const texte = inputTache ? inputTache.value.trim() : "";
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
        btnDone.textContent = "OK";
        btnDone.onclick = () => marquerTacheTerminee(tache.id);
        const btnDelete = document.createElement("button");
        btnDelete.textContent = "Supprimer";
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

// ================= FORM OVERLAY OPEN/CLOSE =================
const formOverlay  = document.getElementById("formOverlay");
const openFormBtn  = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");

if (openFormBtn)  openFormBtn.addEventListener("click",  () => formOverlay.classList.add("active"));
if (closeFormBtn) closeFormBtn.addEventListener("click", () => fermerPopup());
if (formOverlay)  formOverlay.addEventListener("click",  e => { if (e.target === formOverlay) fermerPopup(); });

function fermerPopup() {
    formOverlay.classList.remove("active");
}

function resetForm() {
    const form     = document.querySelector(".custom-form");
    const text1    = document.querySelector(".text1");
    const subtitle = document.querySelector(".form-subtitle");
    const msg      = document.getElementById("messageConfirmation");
    const loginLnk = document.querySelector(".login-link");

    if (form)     { form.style.display = ""; form.reset(); }
    if (text1)    { text1.style.display = ""; text1.textContent = modeConnexion ? "Se connecter" : "Créer un compte"; }
    if (subtitle) { subtitle.style.display = ""; }
    if (msg)      { msg.style.display = "none"; msg.innerHTML = ""; }
    if (loginLnk) loginLnk.style.display = "";
    if (btnInscription) {
        btnInscription.disabled = true;
        btnInscription.classList.remove("btn-active");
        btnInscription.textContent = modeConnexion ? "Se connecter" : "Créer un compte";
    }
}

// ================= MODE CONNEXION / INSCRIPTION =================
let modeConnexion = false;
const loginLink   = document.querySelector(".login-link a");

// Champs visibles seulement en mode inscription
const champsInscription = ["nom", "prenom", "age", "formation", "confirmation"];

function appliquerMode() {
    const text1     = document.querySelector(".text1");
    const subtitle  = document.querySelector(".form-subtitle");
    const formRows  = document.querySelectorAll(".form-row");
    const robotRow  = document.querySelector(".content");

    if (modeConnexion) {
        if (text1)    text1.textContent    = "Se connecter";
        if (subtitle) subtitle.textContent = "Connecte-toi à ton compte.";
        if (loginLink) loginLink.textContent = "Pas encore de compte ? S'inscrire";
        if (btnInscription) btnInscription.textContent = "Se connecter";
        // Cacher les champs inutiles en mode connexion
        formRows.forEach(r => r.style.display = "none");
        if (robotRow) robotRow.style.display = "none";
    } else {
        if (text1)    text1.textContent    = "Créer un compte";
        if (subtitle) subtitle.textContent = "Rejoins et accède à mes projets web UI.";
        if (loginLink) loginLink.textContent = "Vous avez déjà un compte ?";
        if (btnInscription) btnInscription.textContent = "Créer un compte";
        formRows.forEach(r => r.style.display = "");
        if (robotRow) robotRow.style.display = "";
    }

    // Vider les champs et recalculer
    document.querySelectorAll(".custom-form input").forEach(i => i.value = "");
    const ch1 = document.getElementById("ch1");
    if (ch1) ch1.checked = false;
    checkForm();
}

if (loginLink) {
    loginLink.addEventListener("click", e => {
        e.preventDefault();
        modeConnexion = !modeConnexion;
        appliquerMode();
    });
}

// ================= FORM ELEMENTS =================
const btnInscription = document.getElementById("btnInscription");
const nomInput       = document.getElementById("nom");
const prenomInput    = document.getElementById("prenom");
const emailInput     = document.getElementById("email");
const ageInput       = document.getElementById("age");
const formationInput = document.getElementById("formation");
const mdp            = document.getElementById("motdepasse");
const confirmMdp     = document.getElementById("confirmation");
const checkbox       = document.getElementById("ch1");
const errEmail       = document.getElementById("erreurEmail");
const errMdp         = document.getElementById("erreurMdp");

if (btnInscription) btnInscription.disabled = true;

// ================= VALIDATION EMAIL =================
function verifierEmail() {
    if (!emailInput || !emailInput.value) { if (errEmail) errEmail.textContent = ""; checkForm(); return false; }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    if (errEmail) {
        errEmail.textContent = ok ? "Email valide ✓" : "Email invalide";
        errEmail.style.color = ok ? "#22c55e" : "#ff4d4d";
    }
    checkForm();
    return ok;
}

// ================= VALIDATION MOT DE PASSE =================
function verifierMdp() {
    if (!mdp) { checkForm(); return false; }
    const a = mdp.value;

    // En mode connexion, pas de confirmation
    if (modeConnexion) {
        if (errMdp) errMdp.textContent = "";
        checkForm();
        return a.length >= 6;
    }

    if (!confirmMdp) { checkForm(); return false; }
    const b = confirmMdp.value;

    if (!a) { if (errMdp) errMdp.textContent = ""; checkForm(); return false; }
    if (a.length < 6) {
        if (errMdp) { errMdp.textContent = "6 caractères minimum"; errMdp.style.color = "#ff4d4d"; }
        checkForm(); return false;
    }
    if (b && a !== b) {
        if (errMdp) { errMdp.textContent = "Mots de passe différents"; errMdp.style.color = "#ff4d4d"; }
        checkForm(); return false;
    }
    if (a === b && b.length > 0) {
        if (errMdp) { errMdp.textContent = "Mots de passe valides ✓"; errMdp.style.color = "#22c55e"; }
    } else {
        if (errMdp) errMdp.textContent = "";
    }
    checkForm();
    return a === b && a.length >= 6;
}

// ================= ACTIVATION BOUTON =================
function checkForm() {
    if (!btnInscription) return;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput?.value || "");
    const mdpVal  = mdp?.value || "";

    let ok = false;

    if (modeConnexion) {
        ok = emailOk && mdpVal.length >= 6;
    } else {
        const nomOk      = nomInput?.value.trim().length > 0;
        const prenomOk   = prenomInput?.value.trim().length > 0;
        const ageOk      = ageInput?.value.trim().length > 0;
        const formOk     = formationInput?.value.trim().length > 0;
        const confOk     = confirmMdp?.value === mdpVal && mdpVal.length >= 6;
        const robotOk    = checkbox?.checked || false;
        ok = nomOk && prenomOk && emailOk && ageOk && formOk && confOk && robotOk;
    }

    btnInscription.disabled = !ok;
    btnInscription.classList.toggle("btn-active", ok);
}

document.querySelectorAll(".custom-form input").forEach(i => i.addEventListener("input", checkForm));
if (checkbox) checkbox.addEventListener("change", checkForm);

// ================= SOUMISSION =================
if (btnInscription) {
    btnInscription.addEventListener("click", async () => {
        if (btnInscription.disabled) return;
        if (!db) initSupabase();
        if (!db) { afficherErreur("Connexion impossible, réessaie."); return; }

        if (modeConnexion) {
            await seConnecter();
        } else {
            await sInscrire();
        }
    });
}

// ================= INSCRIPTION =================
async function sInscrire() {
    btnInscription.textContent = "Création en cours...";
    btnInscription.disabled    = true;

    const email    = emailInput.value.trim();
    const password = mdp.value;
    const nom      = nomInput.value.trim();
    const prenom   = prenomInput.value.trim();
    const age      = parseInt(ageInput.value) || null;
    const formation = formationInput.value.trim();

    try {
        // 1. Créer le compte Auth Supabase
        const { data: authData, error: authError } = await db.auth.signUp({ email, password });
        if (authError) throw authError;

        // 2. Insérer dans la table inscriptions
        const { error: dbError } = await db.from("inscriptions").insert([{ nom, prenom, email, age, formation }]);
        if (dbError) console.warn("DB insert warn:", dbError.message); // non bloquant

        afficherSucces(nom, prenom, true);

    } catch(err) {
        let msg = err.message || "Une erreur est survenue.";
        if (msg.includes("already registered") || msg.includes("already been registered")) {
            msg = "Cet email est déjà utilisé.";
        }
        afficherErreur(msg);
        btnInscription.textContent = "Créer un compte";
        btnInscription.disabled    = false;
    }
}

// ================= CONNEXION =================
async function seConnecter() {
    btnInscription.textContent = "Connexion en cours...";
    btnInscription.disabled    = true;

    const email    = emailInput.value.trim();
    const password = mdp.value;

    try {
        const { data, error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Récupérer le prénom depuis la table inscriptions
        const { data: profil } = await db.from("inscriptions").select("nom, prenom").eq("email", email).single();
        const nom    = profil?.nom    || "";
        const prenom = profil?.prenom || "";

        afficherSucces(nom, prenom, false);

        // Mettre à jour le bouton nav
        const navBtn = document.getElementById("openFormBtn");
        if (navBtn) navBtn.textContent = "Mon compte ✓";

    } catch(err) {
        let msg = err.message || "Erreur de connexion.";
        if (msg.includes("Invalid login credentials")) msg = "Email ou mot de passe incorrect.";
        if (msg.includes("Email not confirmed"))       msg = "Confirme ton email avant de te connecter.";
        afficherErreur(msg);
        btnInscription.textContent = "Se connecter";
        btnInscription.disabled    = false;
    }
}

// ================= UI FEEDBACK =================
function afficherSucces(nom, prenom, isInscription) {
    const form     = document.querySelector(".custom-form");
    const text1    = document.querySelector(".text1");
    const subtitle = document.querySelector(".form-subtitle");
    const loginLnk = document.querySelector(".login-link");
    const msg      = document.getElementById("messageConfirmation");

    if (form)     form.style.display     = "none";
    if (text1)    text1.style.display    = "none";
    if (subtitle) subtitle.style.display = "none";
    if (loginLnk) loginLnk.style.display = "none";

    if (msg) {
        msg.style.display = "flex";
        msg.innerHTML = `
            <div class="success-box">
                <i class="fa-solid fa-circle-check" style="color:#22c55e;font-size:70px;margin-bottom:18px"></i>
                <h3>${isInscription ? "Inscription validée !" : "Connexion réussie !"}</h3>
                <p>Bienvenue ${nom} ${prenom} !</p>
                <span style="color:#9f9fa9;font-size:13px">
                    ${isInscription ? "Vérifie ton email pour confirmer ton compte." : "Contenu débloqué ✓"}
                </span>
            </div>`;
    }

    // Fermer automatiquement après 3s si connexion
    if (!isInscription) {
        setTimeout(() => {
            fermerPopup();
            resetForm();
            modeConnexion = false;
            appliquerMode();
        }, 2500);
    }
}

function afficherErreur(msg) {
    const msgEl = document.getElementById("messageConfirmation");
    if (!msgEl) return;
    msgEl.style.display = "flex";
    msgEl.innerHTML = `
        <div class="success-box">
            <i class="fa-solid fa-circle-xmark" style="color:#ef4444;font-size:60px;margin-bottom:14px"></i>
            <h3 style="color:#ef4444">Erreur</h3>
            <p>${msg}</p>
            <button onclick="resetForm()" style="margin-top:14px;padding:10px 22px;border:none;border-radius:12px;background:#7c3aed;color:white;cursor:pointer;font-size:14px">Réessayer</button>
        </div>`;
}

// ================= GITHUB API =================
const githubUpdates = document.getElementById("githubUpdates");

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
        githubUpdates.innerHTML = "";
        data.slice(0, 5).forEach(commit => {
            const item = document.createElement("div");
            item.classList.add("update-item");
            item.innerHTML = `
                <div class="update-dot"></div>
                <div>
                    <strong>${commit.commit.message.split('\n')[0]}</strong>
                    <p>${commit.commit.author.name} • ${new Date(commit.commit.author.date).toLocaleDateString("fr-FR")}</p>
                </div>`;
            githubUpdates.appendChild(item);
        });
    } catch(err) {
        githubUpdates.innerHTML = `<div class="event-empty">Impossible de charger GitHub</div>`;
    }
}
chargerGithub();

// ================= CALENDAR =================
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
    try { events = JSON.parse(localStorage.getItem("evenements") || "[]"); }
    catch(e) { events = []; }
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
        li.innerHTML = `
            <div>
                <strong>${event.nom}</strong>
                <div class="event-date">${event.date}</div>
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
        if (!nom || !date) return;
        events.unshift({ id: Date.now(), nom, date });
        sauvegarderEvenements();
        rendreEvenements();
        if (eventName) eventName.value = "";
        if (eventDate) eventDate.value = "";
        eventOverlay.classList.remove("active");
    });
}

function supprimerEvent(id) {
    events = events.filter(e => e.id !== id);
    sauvegarderEvenements();
    rendreEvenements();
}

chargerEvenementsLocal();

// ================= EXPOSE GLOBAL =================
window.verifierEmail = verifierEmail;
window.verifierMdp   = verifierMdp;
window.resetForm     = resetForm;