// ================= SUPABASE IMPORT =================
import { supabase } from "../../supabase.js";

// ================= MENU =================
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");
const menuOverlay = document.getElementById("menuOverlay");

menuBtn.addEventListener("click", () => {

    menuBtn.classList.toggle("active");
    menuPanel.classList.toggle("active");
    menuOverlay.classList.toggle("active");

});


// Fermer quand on clique dans le vide
menuOverlay.addEventListener("click", () => {

    menuBtn.classList.remove("active");
    menuPanel.classList.remove("active");
    menuOverlay.classList.remove("active");

});

// ================= TODO LIST =================
const inputTache = document.getElementById("inputTache");
const btnAjouter = document.getElementById("btnAjouter");
const liste = document.getElementById("listeTaches");
const messageVide = document.getElementById("messageVide");

let taches = [];

async function chargerTaches() {
    try {
        const { data, error } = await supabase
            .from("taches")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erreur chargement tâches:", error);
            return;
        }

        taches = data || [];
        rendreListeTaches();
    } catch (err) {
        console.error("Erreur:", err);
    }
}

async function ajouterTache() {
    const texte = inputTache.value.trim();
    if (!texte) return;

    try {
        const { data, error } = await supabase
            .from("taches")
            .insert([{ description: texte, completed: false }])
            .select();

        if (error) {
            console.error("Erreur ajout tâche:", error);
            return;
        }

        taches.push(data[0]);
        rendreListeTaches();
        inputTache.value = "";
    } catch (err) {
        console.error("Erreur:", err);
    }
}

async function marquerTacheTerminee(id) {
    try {
        const tache = taches.find(t => t.id === id);
        if (!tache) return;

        const { error } = await supabase
            .from("taches")
            .update({ completed: !tache.completed })
            .eq("id", id);

        if (error) {
            console.error("Erreur mise à jour tâche:", error);
            return;
        }

        tache.completed = !tache.completed;
        rendreListeTaches();
    } catch (err) {
        console.error("Erreur:", err);
    }
}

async function supprimerTache(id) {
    try {
        const { error } = await supabase
            .from("taches")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Erreur suppression tâche:", error);
            return;
        }

        taches = taches.filter(t => t.id !== id);
        rendreListeTaches();
    } catch (err) {
        console.error("Erreur:", err);
    }
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
chargerTaches();


// ================= FORM OPEN/CLOSE =================
const openFormBtn = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const formOverlay = document.getElementById("formOverlay");

openFormBtn.onclick = () => formOverlay.classList.add("active");
closeFormBtn.onclick = () => formOverlay.classList.remove("active");


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

btnInscription.disabled = true;


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

checkbox.addEventListener("change", checkForm);


// ================= SUBMIT =================
btnInscription.addEventListener("click", () => {

    if (btnInscription.disabled) return;

    document.querySelector(".custom-form").style.display = "none";
    document.querySelector(".text1").style.display = "none";
    document.querySelector(".form-subtitle").style.display = "none";

    message.style.display = "block";
    message.innerHTML = `
        <div class="success-box">
            <h3>Inscription validée</h3>
            <p>Bienvenue ${nom.value} ${prenom.value}</p>
        </div>
    `;
});



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

async function chargerEvenements() {
    try {
        const { data, error } = await supabase
            .from("evenements")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erreur chargement événements:", error);
            return;
        }

        events = data || [];
        rendreEvenements();
    } catch (err) {
        console.error("Erreur:", err);
    }
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
btnAddEvent.addEventListener("click",()=>{

    eventOverlay.classList.add("active");

});


// FERMER POPUP
closeEvent.addEventListener("click",()=>{

    eventOverlay.classList.remove("active");

});


// AJOUT EVENT
saveEvent.addEventListener("click", async ()=>{

    const nom = eventName.value.trim();
    const date = eventDate.value;

    if(!nom || !date) return;

    try {
        const { data, error } = await supabase
            .from("evenements")
            .insert([{ nom, date }])
            .select();

        if (error) {
            console.error("Erreur ajout événement:", error);
            return;
        }

        events.push(data[0]);
        rendreEvenements();

        eventName.value = "";
        eventDate.value = "";

        eventOverlay.classList.remove("active");
    } catch (err) {
        console.error("Erreur:", err);
    }

});


async function supprimerEvent(id){

    try {
        const { error } = await supabase
            .from("evenements")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Erreur suppression événement:", error);
            return;
        }

        events = events.filter(e => e.id !== id);
        rendreEvenements();
    } catch (err) {
        console.error("Erreur:", err);
    }

}

// Charger les événements au démarrage
chargerEvenements();
rendreEvenements();