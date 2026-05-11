// ================= MENU =================
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");

menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    menuPanel.classList.toggle("active");
});


// ================= TODO LIST =================
const inputTache = document.getElementById("inputTache");
const btnAjouter = document.getElementById("btnAjouter");
const liste = document.getElementById("listeTaches");
const messageVide = document.getElementById("messageVide");

function ajouterTache() {
    const texte = inputTache.value.trim();
    if (!texte) return;

    const li = document.createElement("li");
    li.classList.add("tache");

    const span = document.createElement("span");
    span.textContent = texte;

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const btnDone = document.createElement("button");
    btnDone.textContent = "OK";

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "Supprimer";

    btnDone.onclick = () => span.classList.toggle("termine");

    btnDelete.onclick = () => {
        li.remove();
        if (liste.children.length === 0) {
            messageVide.style.display = "flex";
        }
    };

    actions.appendChild(btnDone);
    actions.appendChild(btnDelete);

    li.appendChild(span);
    li.appendChild(actions);
    liste.appendChild(li);

    messageVide.style.display = "none";
    inputTache.value = "";
}

btnAjouter.addEventListener("click", ajouterTache);


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