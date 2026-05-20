// ================= SUPABASE INIT =================
const SUPABASE_URL = "https://dxtgwpoeclgyldoymvpl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGd3cG9lY2xneWxkb3ltdnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzE1NTMsImV4cCI6MjA5NDgwNzU1M30.dkfyncgnpSprtl86BK6ztILLFYEahiODENIn-h9kvDI";
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= MENU =================
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");
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
const inputTache = document.getElementById("inputTache");
const btnAjouter = document.getElementById("btnAjouter");
const liste = document.getElementById("listeTaches");
const messageVide = document.getElementById("messageVide");

let taches = [];

function chargerTachesLocal() {
    try {
        const saved = localStorage.getItem("taches");
        taches = saved ? JSON.parse(saved) : [];
        rendreListeTaches();
    } catch (err) {
        console.error("Erreur chargement tâches:", err);
        taches = [];
        rendreListeTaches();
    }
}

function sauvegarderTaches() {
    try {
        localStorage.setItem("taches", JSON.stringify(taches));
    } catch (err) {
        console.error("Erreur sauvegarde tâches:", err);
    }
}

function ajouterTache() {
    const texte = inputTache.value.trim();
    if (!texte) return;

    const nouvelleTache = {
        id: Date.now(),
        description: texte,
        completed: false,
        created_at: new Date().toISOString()
    };

    taches.unshift(nouvelleTache);
    sauvegarderTaches();
    rendreListeTaches();
    inputTache.value = "";
}

function marquerTacheTerminee(id) {
    const tache = taches.find(t => t.id === id);
    if (tache) {
        tache.completed = !tache.completed;
        sauvegarderTaches();
        rendreListeTaches();
    }
}

function supprimerTache(id) {
    taches = taches.filter(t => t.id !== id);
    sauvegarderTaches();
    rendreListeTaches();
}

function rendreListeTaches() {
    liste.innerHTML = "";

    if (taches.length === 0) {
        messageVide.style.display = "flex";
        return;
    }

    messageVide.style.display = "none";

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

if (btnAjouter) {
    btnAjouter.addEventListener("click", ajouterTache);
}

if (inputTache) {
    inputTache.addEventListener("keydown", (e) => {
        if (e.key === "Enter") ajouterTache();
    });
}

chargerTachesLocal();


// ================= FORM OPEN/CLOSE =================
const openFormBtn = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const formOverlay = document.getElementById("formOverlay");

if (openFormBtn) openFormBtn.onclick = () => formOverlay?.classList.add("active");
if (closeFormBtn) closeFormBtn.onclick = () => formOverlay?.classList.remove("active");

// Fermer en cliquant sur l'overlay
if (formOverlay) {
    formOverlay.addEventListener("click", (e) => {
        if (e.target === formOverlay) formOverlay.classList.remove("active");
    });
}

// ================= FORM ELEMENTS =================
const btnInscription = document.getElementById("btnInscription");

const nomInput      = document.getElementById("nom");
const prenomInput   = document.getElementById("prenom");
const emailInput    = document.getElementById("email");
const ageInput      = document.getElementById("age");
const formationInput= document.getElementById("formation");

const mdp     = document.getElementById("motdepasse");
const confirm = document.getElementById("confirmation");

const checkbox = document.getElementById("robotCheck");

const errEmail = document.getElementById("erreurEmail");
const errMdp   = document.getElementById("erreurMdp");

const message = document.getElementById("messageConfirmation");

if (btnInscription) {
    btnInscription.disabled = true;
}


// ================= EMAIL =================
function verifierEmail() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailInput || !emailInput.value) {
        if (errEmail) errEmail.textContent = "";
        return false;
    }

    if (!regex.test(emailInput.value)) {
        if (errEmail) {
            errEmail.textContent = "Email invalide";
            errEmail.style.color = "#ff4d4d";
        }
        return false;
    }

    if (errEmail) {
        errEmail.textContent = "Email valide ✓";
        errEmail.style.color = "#22c55e";
    }
    return true;
}


// ================= PASSWORD =================
function verifierMdp() {
    if (!mdp || !confirm) return false;

    const a = mdp.value;
    const b = confirm.value;

    if (!a || !b) {
        if (errMdp) errMdp.textContent = "";
        return false;
    }

    if (a.length < 6) {
        if (errMdp) {
            errMdp.textContent = "6 caractères minimum";
            errMdp.style.color = "#ff4d4d";
        }
        return false;
    }

    if (a !== b) {
        if (errMdp) {
            errMdp.textContent = "Mots de passe différents";
            errMdp.style.color = "#ff4d4d";
        }
        return false;
    }

    if (errMdp) {
        errMdp.textContent = "Mots de passe valides ✓";
        errMdp.style.color = "#22c55e";
    }
    return true;
}


// ================= FORM CHECK =================
function checkForm() {
    if (!nomInput || !prenomInput || !emailInput || !ageInput || !formationInput || !mdp || !confirm || !checkbox || !btnInscription) return;

    const allFilled =
        nomInput.value.trim() &&
        prenomInput.value.trim() &&
        emailInput.value.trim() &&
        ageInput.value.trim() &&
        formationInput.value.trim() &&
        mdp.value &&
        confirm.value;

    const ok =
        allFilled &&
        verifierEmail() &&
        verifierMdp() &&
        checkbox.checked;

    btnInscription.disabled = !ok;

    if (ok) {
        btnInscription.classList.add("btn-active");
    } else {
        btnInscription.classList.remove("btn-active");
    }
}


// ================= EVENTS =================
document.querySelectorAll(".custom-form input").forEach(i => {
    i.addEventListener("input", checkForm);
});

if (checkbox) {
    checkbox.addEventListener("change", checkForm);
}


// ================= SUBMIT avec Supabase =================
if (btnInscription) {
    btnInscription.addEventListener("click", async () => {
        if (btnInscription.disabled) return;

        btnInscription.textContent = "Enregistrement...";
        btnInscription.disabled = true;

        // Sauvegarde dans Supabase
        const { error } = await db.from("inscriptions").insert([{
            nom: nomInput.value.trim(),
            prenom: prenomInput.value.trim(),
            email: emailInput.value.trim(),
            age: parseInt(ageInput.value) || null,
            formation: formationInput.value.trim()
        }]);

        const form    = document.querySelector(".custom-form");
        const text1   = document.querySelector(".text1");
        const subtitle= document.querySelector(".form-subtitle");

        if (form) form.style.display = "none";
        if (text1) text1.style.display = "none";
        if (subtitle) subtitle.style.display = "none";

        if (message) {
            message.style.display = "flex";
            if (error) {
                message.innerHTML = `
                    <div class="success-box">
                        <i class="fa-solid fa-circle-check" style="color:#7c3aed;font-size:70px;margin-bottom:18px"></i>
                        <h3>Inscription validée</h3>
                        <p>Bienvenue ${nomInput.value} ${prenomInput.value} !</p>
                        <span style="color:#9f9fa9;font-size:13px">(sauvegarde locale uniquement)</span>
                    </div>
                `;
            } else {
                message.innerHTML = `
                    <div class="success-box">
                        <i class="fa-solid fa-circle-check" style="color:#22c55e;font-size:70px;margin-bottom:18px"></i>
                        <h3>Inscription validée !</h3>
                        <p>Bienvenue ${nomInput.value} ${prenomInput.value} !</p>
                        <span style="color:#9f9fa9;font-size:13px">Compte créé avec succès</span>
                    </div>
                `;
            }
        }
    });
}


// ================= GITHUB API =================
const githubUpdates = document.getElementById("githubUpdates");

// Repo GitHub réel
const USERNAME = "Mkail14";
const REPO = "ma-page";

async function chargerGithub() {
    if (!githubUpdates) return;

    try {
        const response = await fetch(
            `https://api.github.com/repos/${USERNAME}/${REPO}/commits`
        );

        if (!response.ok) throw new Error("Réponse non OK: " + response.status);

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
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
                    <strong>${commit.commit.message}</strong>
                    <p>
                        ${commit.commit.author.name}
                        •
                        ${new Date(commit.commit.author.date).toLocaleDateString("fr-FR")}
                    </p>
                </div>
            `;

            githubUpdates.appendChild(item);
        });

    } catch (err) {
        console.error("GitHub error:", err);
        githubUpdates.innerHTML = `
            <div class="event-empty">
                Impossible de charger GitHub
            </div>
        `;
    }
}

chargerGithub();


// ================= CALENDAR =================
const btnAddEvent = document.getElementById("btnAddEvent");
const eventList   = document.getElementById("eventList");
const eventEmpty  = document.getElementById("eventEmpty");

let events = [];

function chargerEvenementsLocal() {
    try {
        const saved = localStorage.getItem("evenements");
        events = saved ? JSON.parse(saved) : [];
        rendreEvenements();
    } catch (err) {
        console.error("Erreur chargement événements:", err);
        events = [];
        rendreEvenements();
    }
}

function sauvegarderEvenements() {
    try {
        localStorage.setItem("evenements", JSON.stringify(events));
    } catch (err) {
        console.error("Erreur sauvegarde événements:", err);
    }
}

function rendreEvenements() {
    if (!eventList) return;
    eventList.innerHTML = "";

    if (events.length === 0) {
        if (eventEmpty) eventEmpty.style.display = "flex";
        return;
    }

    if (eventEmpty) eventEmpty.style.display = "none";

    events.forEach((event) => {
        const li = document.createElement("li");
        li.classList.add("event-item");

        li.innerHTML = `
            <div>
                <strong>${event.nom}</strong>
                <div class="event-date">${event.date}</div>
            </div>
            <button class="btn-delete-event">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        li.querySelector(".btn-delete-event").onclick = () => supprimerEvent(event.id);
        eventList.appendChild(li);
    });
}

const eventOverlay = document.getElementById("eventOverlay");
const closeEvent   = document.getElementById("closeEvent");
const eventName    = document.getElementById("eventName");
const eventDate    = document.getElementById("eventDate");
const saveEvent    = document.getElementById("saveEvent");

// OUVRIR POPUP
if (btnAddEvent) {
    btnAddEvent.addEventListener("click", () => {
        if (eventOverlay) eventOverlay.classList.add("active");
    });
}

// FERMER POPUP
if (closeEvent) {
    closeEvent.addEventListener("click", () => {
        if (eventOverlay) eventOverlay.classList.remove("active");
    });
}

// Fermer en cliquant dehors
if (eventOverlay) {
    eventOverlay.addEventListener("click", (e) => {
        if (e.target === eventOverlay) eventOverlay.classList.remove("active");
    });
}

// AJOUT EVENT
if (saveEvent) {
    saveEvent.addEventListener("click", () => {
        const nom  = eventName ? eventName.value.trim() : "";
        const date = eventDate ? eventDate.value : "";

        if (!nom || !date) return;

        const nouvelEvenement = {
            id: Date.now(),
            nom,
            date,
            created_at: new Date().toISOString()
        };

        events.unshift(nouvelEvenement);
        sauvegarderEvenements();
        rendreEvenements();

        if (eventName) eventName.value = "";
        if (eventDate) eventDate.value = "";
        if (eventOverlay) eventOverlay.classList.remove("active");
    });
}

function supprimerEvent(id) {
    events = events.filter(e => e.id !== id);
    sauvegarderEvenements();
    rendreEvenements();
}

chargerEvenementsLocal();

// ================= EXPOSE GLOBAL FUNCTIONS =================
window.verifierEmail = verifierEmail;
window.verifierMdp   = verifierMdp;
