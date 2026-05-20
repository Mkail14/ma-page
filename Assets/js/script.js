// ================= STORAGE MODE =================
// Utilise localStorage pour sauvegarder les données localement
// Peut être remplacé par Supabase plus tard

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

// Charger les tâches du localStorage
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

// Sauvegarder les tâches dans localStorage
function sauvegarderTaches() {
    try {
        localStorage.setItem("taches", JSON.stringify(taches));
    } catch (err) {
        console.error("Erreur sauvegarde tâches:", err);
    }
}

async function chargerTaches() {
    chargerTachesLocal();
}

async function ajouterTache() {
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

async function marquerTacheTerminee(id) {
    const tache = taches.find(t => t.id === id);
    if (tache) {
        tache.completed = !tache.completed;
        sauvegarderTaches();
        rendreListeTaches();
    }
}

async function supprimerTache(id) {
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

btnAjouter.addEventListener("click", ajouterTache);

// Charger les tâches au démarrage
chargerTachesLocal();


// ================= FORM OPEN/CLOSE =================
const openFormBtn = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const formOverlay = document.getElementById("formOverlay");

if (openFormBtn) openFormBtn.onclick = () => formOverlay?.classList.add("active");
if (closeFormBtn) closeFormBtn.onclick = () => formOverlay?.classList.remove("active");


// ================= FORM ELEMENTS =================
const btnInscription = document.getElementById("btnInscription");

const nom = document.getElementById("nom");
const prenom = document.getElementById("prenom");
const email = document.getElementById("email");
const age = document.getElementById("age");
const formation = document.getElementById("formation");

const mdp = document.getElementById("motdepasse");
const confirm = document.getElementById("confirmation");

const checkbox = document.getElementById("robotCheck");

const errEmail = document.getElementById("erreurEmail");
const errMdp = document.getElementById("erreurMdp");

const message = document.getElementById("messageConfirmation");

if (btnInscription) {
    btnInscription.disabled = true;
}


// ================= EMAIL =================
function verifierEmail() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.value) {
        errEmail.textContent = "";
        return false;
    }

    if (!regex.test(email.value)) {
        errEmail.textContent = "Email invalide";
        errEmail.style.color = "#ff4d4d";
        return false;
    }

    errEmail.textContent = "Email valide";
    errEmail.style.color = "#22c55e";
    return true;
}


// ================= PASSWORD =================
function verifierMdp() {

    const a = mdp.value;
    const b = confirm.value;

    if (!a || !b) {
        errMdp.textContent = "";
        return false;
    }

    if (a.length < 6) {
        errMdp.textContent = "6 caractères minimum";
        errMdp.style.color = "#ff4d4d";
        return false;
    }

    if (a !== b) {
        errMdp.textContent = "Mots de passe différents";
        errMdp.style.color = "#ff4d4d";
        return false;
    }

    errMdp.textContent = "Mots de passe valides";
    errMdp.style.color = "#22c55e";
    return true;
}


// ================= FORM CHECK =================
function checkForm() {
    if (!nom || !prenom || !email || !age || !formation || !mdp || !confirm || !checkbox || !btnInscription) return;

    const allFilled =
        nom.value &&
        prenom.value &&
        email.value &&
        age.value &&
        formation.value &&
        mdp.value &&
        confirm.value;

    const ok =
        allFilled &&
        verifierEmail() &&
        verifierMdp() &&
        checkbox.checked;

    btnInscription.disabled = !ok;

    // 🔥 BOUTON LUMINEUX
    if (ok) {
        btnInscription.classList.add("btn-active");
    } else {
        btnInscription.classList.remove("btn-active");
    }
}


// ================= EVENTS =================
document.querySelectorAll("input").forEach(i => {
    i.addEventListener("input", checkForm);
});

if (checkbox) {
    checkbox.addEventListener("change", checkForm);
}


// ================= SUBMIT =================
if (btnInscription) {
    btnInscription.addEventListener("click", () => {
        if (btnInscription.disabled) return;

        const form = document.querySelector(".custom-form");
        const text1 = document.querySelector(".text1");
        const subtitle = document.querySelector(".form-subtitle");

        if (form) form.style.display = "none";
        if (text1) text1.style.display = "none";
        if (subtitle) subtitle.style.display = "none";

        if (message) {
            message.style.display = "block";
            message.innerHTML = `
                <div class="success-box">
                    <h3>Inscription validée</h3>
                    <p>Bienvenue ${nom.value} ${prenom.value}</p>
                </div>
            `;
        }
    });
}



// ================= GITHUB API =================

const githubUpdates = document.getElementById("githubUpdates");

// ⚠️ CHANGE ICI
const USERNAME = "TON_USERNAME_GITHUB";
const REPO = "TON_REPO";

async function chargerGithub() {

    try{

        const response = await fetch(
            `https://api.github.com/repos/${USERNAME}/${REPO}/commits`
        );

        const data = await response.json();

        githubUpdates.innerHTML = "";

        data.slice(0,5).forEach(commit => {

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

    }catch(err){

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
const eventList = document.getElementById("eventList");
const eventEmpty = document.getElementById("eventEmpty");

let events = [];

// Charger les événements du localStorage
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

// Sauvegarder les événements dans localStorage
function sauvegarderEvenements() {
    try {
        localStorage.setItem("evenements", JSON.stringify(events));
    } catch (err) {
        console.error("Erreur sauvegarde événements:", err);
    }
}

async function chargerEvenements() {
    chargerEvenementsLocal();
}

function rendreEvenements(){

    eventList.innerHTML = "";

    if(events.length === 0){

        eventEmpty.style.display = "flex";
        return;
    }

    eventEmpty.style.display = "none";

    events.forEach((event)=>{

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
const closeEvent = document.getElementById("closeEvent");

const eventName = document.getElementById("eventName");
const eventDate = document.getElementById("eventDate");

const saveEvent = document.getElementById("saveEvent");


// OUVRIR POPUP
if (btnAddEvent) {
    btnAddEvent.addEventListener("click",()=>{
        if (eventOverlay) eventOverlay.classList.add("active");
    });
}

// FERMER POPUP
if (closeEvent) {
    closeEvent.addEventListener("click",()=>{
        if (eventOverlay) eventOverlay.classList.remove("active");
    });
}


// AJOUT EVENT
if (saveEvent) {
    saveEvent.addEventListener("click", ()=>{

        const nom = eventName.value.trim();
        const date = eventDate.value;

        if(!nom || !date) return;

        const nouvelEvenement = {
            id: Date.now(),
            nom,
            date,
            created_at: new Date().toISOString()
        };

        events.unshift(nouvelEvenement);
        sauvegarderEvenements();
        rendreEvenements();

        eventName.value = "";
        eventDate.value = "";

        if (eventOverlay) eventOverlay.classList.remove("active");

    });
}


async function supprimerEvent(id){

    events = events.filter(e => e.id !== id);
    sauvegarderEvenements();
    rendreEvenements();

}

// Charger les événements au démarrage
chargerEvenementsLocal();

// ================= EXPOSE GLOBAL FUNCTIONS =================
// Nécessaire pour les oninput/onclick inline du HTML quand le script est en module
window.verifierEmail = verifierEmail;
window.verifierMdp = verifierMdp;