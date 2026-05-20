// ================= SUPABASE INIT =================
const SUPABASE_URL = "https://dxtgwpoeclgyldoymvpl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGd3cG9lY2xneWxkb3ltdnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzE1NTMsImV4cCI6MjA5NDgwNzU1M30.dkfyncgnpSprtl86BK6ztILLFYEahiODENIn-h9kvDI";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= HELPERS =================
// "RABEMANANJARA" → "R"
function initialeNom(nom) {
    return nom ? nom.trim()[0].toUpperCase() : "";
}

// Met à jour le h1 de la page
function setBonjour(nom, prenom) {
    const h1 = document.querySelector(".hero-side h1");
    if (!h1) return;
    if (nom && prenom) {
        h1.textContent = `Bonjour ${initialeNom(nom)}.${prenom.trim()}`;
    } else {
        h1.textContent = "Bonjour R. Mario";
    }
}

// ================= SESSION AU CHARGEMENT =================
// Si l'utilisateur est déjà connecté, on met à jour l'UI directement
async function chargerSession() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) return;

    const email = session.user.email;
    const { data: profil } = await db
        .from("inscriptions")
        .select("nom, prenom")
        .eq("email", email)
        .single();

    if (profil) {
        setBonjour(profil.nom, profil.prenom);
        const navBtn = document.getElementById("openFormBtn");
        if (navBtn) navBtn.textContent = "Mon compte ✓";
    }
}
chargerSession();

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

// ================= POPUP FORM OPEN/CLOSE =================
const formOverlay  = document.getElementById("formOverlay");
const openFormBtn  = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");

if (openFormBtn)  openFormBtn.addEventListener("click",  () => formOverlay.classList.add("active"));
if (closeFormBtn) closeFormBtn.addEventListener("click", () => fermerEtReset());
if (formOverlay)  formOverlay.addEventListener("click",  e => { if (e.target === formOverlay) fermerEtReset(); });

function fermerEtReset() {
    formOverlay.classList.remove("active");
    setTimeout(() => {
        modeActuel = "inscription";
        afficherVue("inscription");
    }, 300);
}

// ================= VUES : inscription | connexion | motdepasse | succes | erreur =================
// modeActuel pilote ce qui est affiché dans la popup
let modeActuel = "inscription"; // "inscription" | "connexion" | "motdepasse"

// On va construire la popup dynamiquement selon le mode
function afficherVue(mode) {
    modeActuel = mode;

    const popup  = document.querySelector(".popup-formulaire");
    if (!popup) return;

    // Réinitialiser le contenu de la popup selon le mode
    switch(mode) {
        case "inscription": renderInscription(popup); break;
        case "connexion":   renderConnexion(popup);   break;
        case "motdepasse":  renderMotDePasse(popup);  break;
    }
}

// ─────────────────────────────────────────────
// VUE INSCRIPTION
// ─────────────────────────────────────────────
function renderInscription(popup) {
    popup.innerHTML = `
        <button class="close-form" id="closeFormBtn2"><i class="fa-solid fa-xmark"></i></button>
        <h2 class="text1">Créer un compte</h2>
        <p class="form-subtitle">Rejoins et accède à mes projets web UI.</p>

        <form class="custom-form" onsubmit="return false;">
            <div class="form-row">
                <div class="input-group-custom">
                    <label>Nom</label>
                    <input type="text" id="nom" placeholder="Votre nom">
                </div>
                <div class="input-group-custom">
                    <label>Prénom</label>
                    <input type="text" id="prenom" placeholder="Votre prénom">
                </div>
            </div>

            <div class="input-group-custom">
                <label>Email</label>
                <input type="email" id="email" placeholder="Votre email">
                <div id="erreurEmail" style="font-size:12px;margin-top:2px"></div>
            </div>

            <div class="form-row">
                <div class="input-group-custom">
                    <label>Mot de passe</label>
                    <input type="password" id="motdepasse" placeholder="Mot de passe (6 car. min)">
                    <div id="erreurMdp" style="font-size:12px;margin-top:2px"></div>
                </div>
                <div class="input-group-custom">
                    <label>Confirmation</label>
                    <input type="password" id="confirmation" placeholder="Confirmer">
                </div>
            </div>

            <div class="form-row">
                <div class="input-group-custom">
                    <label>Âge</label>
                    <input type="number" id="age" placeholder="Votre âge">
                </div>
                <div class="input-group-custom">
                    <label>Formation</label>
                    <input type="text" id="formation" placeholder="Votre formation">
                </div>
            </div>

            <div class="content">
                <label class="checkBox" id="robotCheck">
                    <input id="ch1" type="checkbox">
                    <div class="transition"></div>
                </label>
                <span class="text001">Je jure devant dieux que je suis pas un robot.</span>
            </div>

            <button type="button" class="btn-formulaire" id="btnInscription" disabled>
                Créer un compte
            </button>

            <div class="login-link">
                <a href="#" id="linkVersConnexion">Vous avez déjà un compte ?</a>
            </div>
        </form>
        <div id="messageConfirmation" class="message-confirmation"></div>
    `;

    // Fermer
    document.getElementById("closeFormBtn2").addEventListener("click", fermerEtReset);

    // Lien → connexion
    document.getElementById("linkVersConnexion").addEventListener("click", e => {
        e.preventDefault();
        afficherVue("connexion");
    });

    // Validation live
    const inputs = popup.querySelectorAll(".custom-form input");
    inputs.forEach(i => i.addEventListener("input", checkInscription));
    document.getElementById("ch1").addEventListener("change", checkInscription);
}

function checkInscription() {
    const btn  = document.getElementById("btnInscription");
    if (!btn) return;

    const nom      = document.getElementById("nom")?.value.trim();
    const prenom   = document.getElementById("prenom")?.value.trim();
    const email    = document.getElementById("email")?.value.trim();
    const mdp      = document.getElementById("motdepasse")?.value;
    const conf     = document.getElementById("confirmation")?.value;
    const age      = document.getElementById("age")?.value.trim();
    const formation= document.getElementById("formation")?.value.trim();
    const robot    = document.getElementById("ch1")?.checked;

    const errEmail = document.getElementById("erreurEmail");
    const errMdp   = document.getElementById("erreurMdp");

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (errEmail) { errEmail.textContent = email ? (emailOk ? "Email valide ✓" : "Email invalide") : ""; errEmail.style.color = emailOk ? "#22c55e" : "#ff4d4d"; }

    const mdpOk = mdp && mdp.length >= 6;
    const confOk = mdp === conf && mdpOk;
    if (errMdp) {
        if (!mdp)             errMdp.textContent = "";
        else if (!mdpOk)    { errMdp.textContent = "6 caractères minimum"; errMdp.style.color = "#ff4d4d"; }
        else if (conf && !confOk){ errMdp.textContent = "Mots de passe différents"; errMdp.style.color = "#ff4d4d"; }
        else if (confOk)    { errMdp.textContent = "Mots de passe valides ✓"; errMdp.style.color = "#22c55e"; }
        else                  errMdp.textContent = "";
    }

    const ok = nom && prenom && emailOk && mdpOk && confOk && age && formation && robot;
    btn.disabled = !ok;
    btn.classList.toggle("btn-active", !!ok);

    // Brancher le submit seulement une fois
    if (!btn._bound) {
        btn._bound = true;
        btn.addEventListener("click", async () => {
            if (btn.disabled) return;
            btn.textContent = "Création en cours...";
            btn.disabled = true;

            try {
                // 1. Auth
                const { data: authData, error: authErr } = await db.auth.signUp({
                    email: document.getElementById("email").value.trim(),
                    password: document.getElementById("motdepasse").value
                });
                if (authErr) throw authErr;

                // 2. Table inscriptions
                const { error: dbErr } = await db.from("inscriptions").insert([{
                    nom:       document.getElementById("nom").value.trim(),
                    prenom:    document.getElementById("prenom").value.trim(),
                    email:     document.getElementById("email").value.trim(),
                    age:       parseInt(document.getElementById("age").value) || null,
                    formation: document.getElementById("formation").value.trim()
                }]);
                if (dbErr) console.warn("DB:", dbErr.message);

                // Succès
                afficherSucces(
                    document.getElementById("nom").value.trim(),
                    document.getElementById("prenom").value.trim(),
                    true
                );

            } catch(err) {
                let msg = err.message || "Erreur inconnue.";
                if (msg.includes("already")) msg = "Cet email est déjà utilisé.";
                btn.textContent = "Créer un compte";
                btn.disabled = false;
                btn.classList.remove("btn-active");
                afficherMsg(msg, "err");
            }
        });
    }
}

// ─────────────────────────────────────────────
// VUE CONNEXION
// ─────────────────────────────────────────────
function renderConnexion(popup) {
    popup.innerHTML = `
        <button class="close-form" id="closeFormBtn2"><i class="fa-solid fa-xmark"></i></button>
        <h2 class="text1">Se connecter</h2>
        <p class="form-subtitle">Connecte-toi à ton compte.</p>

        <form class="custom-form" onsubmit="return false;">
            <div class="input-group-custom">
                <label>Email</label>
                <input type="email" id="email" placeholder="Votre email">
                <div id="erreurEmail" style="font-size:12px;margin-top:2px"></div>
            </div>

            <div class="input-group-custom">
                <label>Mot de passe</label>
                <input type="password" id="motdepasse" placeholder="Votre mot de passe">
            </div>

            <button type="button" class="btn-formulaire" id="btnConnexion" disabled>
                Se connecter
            </button>

            <div class="login-link" style="display:flex;flex-direction:column;gap:8px;align-items:center">
                <a href="#" id="linkVersInscription">Pas encore de compte ? S'inscrire</a>
                <a href="#" id="linkMotDePasse" style="color:#7c3aed;font-size:13px">Mot de passe oublié ?</a>
            </div>
        </form>
        <div id="messageConfirmation" class="message-confirmation"></div>
    `;

    document.getElementById("closeFormBtn2").addEventListener("click", fermerEtReset);
    document.getElementById("linkVersInscription").addEventListener("click", e => { e.preventDefault(); afficherVue("inscription"); });
    document.getElementById("linkMotDePasse").addEventListener("click", e => { e.preventDefault(); afficherVue("motdepasse"); });

    const inputs = popup.querySelectorAll(".custom-form input");
    inputs.forEach(i => i.addEventListener("input", checkConnexion));

    const btn = document.getElementById("btnConnexion");
    btn.addEventListener("click", async () => {
        if (btn.disabled) return;
        btn.textContent = "Connexion en cours...";
        btn.disabled = true;

        try {
            const email = document.getElementById("email").value.trim();
            const mdp   = document.getElementById("motdepasse").value;

            const { data, error } = await db.auth.signInWithPassword({ email, password: mdp });
            if (error) throw error;

            // Récupérer nom/prénom
            const { data: profil } = await db
                .from("inscriptions")
                .select("nom, prenom")
                .eq("email", email)
                .single();

            const nom    = profil?.nom    || "";
            const prenom = profil?.prenom || "";

            // Mettre à jour le h1
            setBonjour(nom, prenom);

            afficherSucces(nom, prenom, false);

            const navBtn = document.getElementById("openFormBtn");
            if (navBtn) navBtn.textContent = "Mon compte ✓";

            setTimeout(() => fermerEtReset(), 2500);

        } catch(err) {
            let msg = err.message || "Erreur de connexion.";
            if (msg.includes("Invalid login credentials")) msg = "Email ou mot de passe incorrect.";
            if (msg.includes("Email not confirmed"))       msg = "Confirme ton email avant de te connecter.";
            btn.textContent = "Se connecter";
            btn.disabled = false;
            afficherMsg(msg, "err");
        }
    });
}

function checkConnexion() {
    const btn   = document.getElementById("btnConnexion");
    if (!btn) return;
    const email = document.getElementById("email")?.value.trim();
    const mdp   = document.getElementById("motdepasse")?.value;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const errEmail = document.getElementById("erreurEmail");
    if (errEmail) { errEmail.textContent = email ? (emailOk ? "Email valide ✓" : "Email invalide") : ""; errEmail.style.color = emailOk ? "#22c55e" : "#ff4d4d"; }
    const ok = emailOk && mdp && mdp.length >= 6;
    btn.disabled = !ok;
    btn.classList.toggle("btn-active", !!ok);
}

// ─────────────────────────────────────────────
// VUE MOT DE PASSE OUBLIÉ
// ─────────────────────────────────────────────
function renderMotDePasse(popup) {
    popup.innerHTML = `
        <button class="close-form" id="closeFormBtn2"><i class="fa-solid fa-xmark"></i></button>
        <h2 class="text1">Mot de passe oublié</h2>
        <p class="form-subtitle">Entre ton email, on t'envoie un lien pour réinitialiser ton mot de passe.</p>

        <form class="custom-form" onsubmit="return false;">
            <div class="input-group-custom">
                <label>Email</label>
                <input type="email" id="emailReset" placeholder="Votre email">
                <div id="erreurEmailReset" style="font-size:12px;margin-top:2px"></div>
            </div>

            <button type="button" class="btn-formulaire btn-active" id="btnReset">
                Envoyer le lien
            </button>

            <div class="login-link">
                <a href="#" id="linkRetourConnexion">← Retour à la connexion</a>
            </div>
        </form>
        <div id="messageConfirmation" class="message-confirmation"></div>
    `;

    document.getElementById("closeFormBtn2").addEventListener("click", fermerEtReset);
    document.getElementById("linkRetourConnexion").addEventListener("click", e => { e.preventDefault(); afficherVue("connexion"); });

    const emailInput = document.getElementById("emailReset");
    const btnReset   = document.getElementById("btnReset");
    const errEmail   = document.getElementById("erreurEmailReset");

    emailInput.addEventListener("input", () => {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
        if (errEmail) { errEmail.textContent = emailInput.value ? (ok ? "Email valide ✓" : "Email invalide") : ""; errEmail.style.color = ok ? "#22c55e" : "#ff4d4d"; }
        btnReset.disabled = !ok;
        btnReset.classList.toggle("btn-active", ok);
    });

    btnReset.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        if (!email) return;
        btnReset.textContent = "Envoi en cours...";
        btnReset.disabled = true;

        try {
            const { error } = await db.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });
            if (error) throw error;

            // Succès
            const msgEl = document.getElementById("messageConfirmation");
            document.querySelector(".custom-form").style.display = "none";
            document.querySelector(".text1").style.display = "none";
            document.querySelector(".form-subtitle").style.display = "none";
            msgEl.style.display = "flex";
            msgEl.innerHTML = `
                <div class="success-box">
                    <i class="fa-solid fa-envelope-circle-check" style="color:#7c3aed;font-size:65px;margin-bottom:18px"></i>
                    <h3>Email envoyé !</h3>
                    <p>Vérifie ta boîte mail et clique sur le lien pour réinitialiser ton mot de passe.</p>
                    <button onclick="afficherVue('connexion')" style="margin-top:18px;padding:12px 28px;border:none;border-radius:14px;background:#7c3aed;color:white;cursor:pointer;font-size:15px;font-weight:600">
                        Retour à la connexion
                    </button>
                </div>`;
        } catch(err) {
            btnReset.textContent = "Envoyer le lien";
            btnReset.disabled = false;
            afficherMsg(err.message || "Erreur lors de l'envoi.", "err");
        }
    });
}

// ─────────────────────────────────────────────
// MESSAGES SUCCÈS / ERREUR
// ─────────────────────────────────────────────
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
                <p>Bienvenue ${initialeNom(nom)}.${prenom} !</p>
                <span style="color:#9f9fa9;font-size:13px">
                    ${isInscription ? "Vérifie ton email pour confirmer ton compte." : ""}
                </span>
            </div>`;
    }
}

function afficherMsg(texte, type) {
    const msg = document.getElementById("messageConfirmation");
    if (!msg) return;
    msg.style.display  = "block";
    msg.style.color    = type === "err" ? "#ef4444" : "#22c55e";
    msg.style.fontSize = "14px";
    msg.style.marginTop = "12px";
    msg.style.textAlign = "center";
    msg.textContent = texte;
}

// ================= INIT POPUP =================
// Initialiser la vue inscription au chargement
window.addEventListener("DOMContentLoaded", () => {
    afficherVue("inscription");
});

// Exposer pour le bouton "Retour" dans renderMotDePasse
window.afficherVue = afficherVue;

// ================= GITHUB API =================
const githubUpdates = document.getElementById("githubUpdates");

async function chargerGithub() {
    if (!githubUpdates) return;
    try {
        const response = await fetch("https://api.github.com/repos/Mkail14/ma-page/commits?per_page=5");
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();
        if (!Array.isArray(data) || !data.length) { githubUpdates.innerHTML = `<div class="event-empty">Aucun commit trouvé</div>`; return; }
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
window.verifierEmail = () => {};
window.verifierMdp   = () => {};