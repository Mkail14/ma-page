/* ===========================
   SÉLECTEURS
=========================== */
const heroTitle          = document.querySelector("#heroTitle");
const heroText           = document.querySelector("#heroText");
const inventaireSection  = document.querySelector("#inventaireSection");
const clientsSection     = document.querySelector("#clientsSection");
const inventaireStats    = document.querySelector("#inventaireStats");

const navInventaire      = document.querySelector("#navInventaire");
const navClients         = document.querySelector("#navClients");
const menuInventaire     = document.querySelector("#menuInventaire");
const menuClients        = document.querySelector("#menuClients");
const menuAccueil        = document.querySelector("#menuAccueil");

const productsContainer  = document.querySelector("#productsContainer");
const clientsContainer   = document.querySelector("#clientsContainer");
const btnCharger         = document.querySelector("#btnCharger");

const rechercheProduit   = document.querySelector("#rechercheProduit");
const rechercheClient    = document.querySelector("#rechercheClient");
const filterCategorie    = document.querySelector("#filterCategorie");
const filterVille        = document.querySelector("#filterVille");

const toggleProductsView = document.querySelector("#toggleProductsView");
const toggleClientsView  = document.querySelector("#toggleClientsView");
const menuBtn            = document.querySelector("#menuBtn");
const menuPanel          = document.querySelector("#menuPanel");
const menuOverlay        = document.querySelector("#menuOverlay");
const design1            = document.querySelector("#design1");
const totalProduits      = document.querySelector("#totalProduits");
const produitsAffiches   = document.querySelector("#produitsAffiches");

const totalCategories    = document.querySelector("#totalCategories");
const cardsSales         = document.querySelector("#cardsSales");
const popup              = document.getElementById("popup");
const openPopup          = document.getElementById("openPopup");
const closePopup         = document.getElementById("closePopup");
const validate           = document.getElementById("validate");
const password           = document.getElementById("password");
const message            = document.getElementById("message");
const attemptsText       = document.getElementById("attempts");
const vraiCode           = "1404";

const blurCarte          = document.querySelector(".blur-card");
const cadenas            = document.querySelector(".cadennas");
const modalAjouter       = document.querySelector("#modalAjouterClient");
const btnAjouterClient   = document.querySelector("#btnAjouterClient");
const btnAnnuler         = document.querySelector("#btnAnnuler");
const btnConfirmerAjout  = document.querySelector("#btnConfirmerAjout");
const inputNom           = document.querySelector("#inputNom");
const inputEmail         = document.querySelector("#inputEmail");
const inputPhone         = document.querySelector("#inputPhone");
const inputVille         = document.querySelector("#inputVille");

/* ===========================
   ÉTAT GLOBAL
=========================== */
let tousLesProduits  = [];
let clients          = [];
let vueProduitsMode  = "carte";
let vueClientsMode   = "carte";
let clientsCharges   = false;
let minuteurCarte    = null;

/* ===========================
   MENU HAMBURGER
=========================== */
menuBtn.addEventListener("click", () => {
  menuBtn.classList.toggle("active");
  menuPanel.classList.toggle("active");
  menuOverlay.classList.toggle("active");
});

menuOverlay.addEventListener("click", fermerMenu);

function fermerMenu() {
  menuBtn.classList.remove("active");
  menuPanel.classList.remove("active");
  menuOverlay.classList.remove("active");
}

/* ===========================
   NAVIGATION
=========================== */
function definirLienActif(lienEl) {
  document.querySelectorAll(".nav-link-custom").forEach(l => l.classList.remove("active-link"));
  if (lienEl) lienEl.classList.add("active-link");
}

function afficherAccueil() {
  inventaireSection.classList.remove("active");
  clientsSection.classList.remove("active");
  inventaireStats.classList.remove("visible");
  popup.classList.remove("active");
  cardsSales.classList.remove("hidden");
  design1.classList.remove("hidden");
  heroTitle.textContent = "Dashboard Gestion";
  heroText.textContent  = "Gérez produits et clients dans une seule interface moderne.";
  definirLienActif(null);
  fermerMenu();
}

function afficherInventaire() {
  inventaireSection.classList.add("active");
  clientsSection.classList.remove("active");
  popup.classList.remove("active");
  inventaireStats.classList.add("visible");
  cardsSales.classList.add("hidden");
  design1.classList.add("hidden");
  heroTitle.textContent = "Votre Inventaire";
  heroText.textContent  = "Gérez vos produits, catégories et votre stock.";
  definirLienActif(navInventaire);
  mettreAJourStats();
  fermerMenu();
}

function afficherSectionClients() {
  clientsSection.classList.add("active");
  popup.classList.remove("active");
  inventaireSection.classList.remove("active");
  inventaireStats.classList.remove("visible");
  cardsSales.classList.add("hidden");
  design1.classList.add("hidden");
  heroTitle.textContent = "Vos Clients";
  heroText.textContent  = "Retrouvez vos clients et leurs informations.";
  definirLienActif(navClients);
  fermerMenu();

  if (!clientsCharges) {
    chargerClients();
  } else {
    afficherClients(obtenirClientsFiltres());
  }
}

navInventaire.addEventListener("click",  e => { e.preventDefault(); afficherInventaire(); });
navClients.addEventListener("click",     e => { e.preventDefault(); afficherSectionClients(); });
menuInventaire.addEventListener("click", e => { e.preventDefault(); afficherInventaire(); });
menuClients.addEventListener("click",    e => { e.preventDefault(); afficherSectionClients(); });
menuAccueil.addEventListener("click",    e => { e.preventDefault(); afficherAccueil(); });

/* ===========================
   UTILITAIRE – Mélanger un tableau
=========================== */
function melangerTableau(tableau) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/* ===========================
   PRODUITS – CHARGEMENT API
=========================== */
async function chargerProduits() {
  try {
    btnCharger.innerHTML  = `<i class="fas fa-spinner fa-spin btn-icon"></i><span class="btn-label">Chargement…</span>`;
    btnCharger.disabled   = true;

    const reponse = await fetch("https://fakestoreapi.com/products");
    const donnees = await reponse.json();

    tousLesProduits = melangerTableau(donnees);

    remplirCategories();
    afficherProduits(obtenirProduitsFiltres());

    btnCharger.innerHTML = `<i class="fas fa-check btn-icon"></i><span class="btn-label">Chargé !</span>`;
    setTimeout(() => {
      btnCharger.innerHTML = `<i class="fas fa-sync btn-icon"></i><span class="btn-label">Recharger</span>`;
      btnCharger.disabled  = false;
    }, 1500);

  } catch (erreur) {
    productsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle empty-icon" style="color:#ef4444;opacity:1"></i>
        Impossible de charger les produits. Vérifiez votre connexion.
      </div>`;
    btnCharger.innerHTML = `<i class="fas fa-download btn-icon"></i><span class="btn-label">Charger les produits</span>`;
    btnCharger.disabled  = false;
  }
}

btnCharger.addEventListener("click", chargerProduits);

/* ===========================
   PRODUITS – FILTRE COMBINÉ
=========================== */
function obtenirProduitsFiltres() {
  const recherche = rechercheProduit.value.toLowerCase().trim();
  const categorie = filterCategorie.value;
  return tousLesProduits.filter(p => {
    const correspondRecherche = !recherche || p.title.toLowerCase().includes(recherche);
    const correspondCategorie = !categorie  || p.category === categorie;
    return correspondRecherche && correspondCategorie;
  });
}

rechercheProduit.addEventListener("input",  () => afficherProduits(obtenirProduitsFiltres()));
filterCategorie.addEventListener("change",  () => afficherProduits(obtenirProduitsFiltres()));

/* ===========================
   PRODUITS – AFFICHAGE
=========================== */
function afficherProduits(liste) {
  if (vueProduitsMode === "carte") {
    productsContainer.className = "products-grid mt-4";

    if (!liste.length) {
      productsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search empty-icon"></i>Aucun produit trouvé.
        </div>`;
      mettreAJourStats(0);
      return;
    }

    productsContainer.innerHTML = liste.map(p => `
      <div class="product-card">
        <img src="${p.image}" alt="${echapperHtml(p.title)}" loading="xxx"/>
        <div class="product-category">${echapperHtml(p.category)}</div>
        <div class="product-name">${echapperHtml(p.title.slice(0, 55))}</div>
        <div class="product-price">${p.price} $</div>
        <div class="product-description">${echapperHtml(p.description.slice(0, 90))}…</div>
      </div>
    `).join("");

  } else {
    productsContainer.className = "table-responsive mt-4";

    if (!liste.length) {
      productsContainer.innerHTML = `<p class="text-center py-5" style="color:#666">Aucun produit trouvé.</p>`;
      mettreAJourStats(0);
      return;
    }

    productsContainer.innerHTML = `
      <table class="table table-dark table-hover align-middle">
        <thead>
          <tr>
            <th>Image</th>
            <th>Produit</th>
            <th>Prix</th>
            <th>Catégorie</th>
          </tr>
        </thead>
        <tbody>
          ${liste.map(p => `
            <tr>
              <td>
                <img src="${p.image}" width="55" height="55"
                  style="object-fit:contain;background:#fff;padding:5px;border-radius:10px"
                  loading="lazy" alt=""/>
              </td>
              <td>${echapperHtml(p.title)}</td>
              <td><strong style="color:#a78bfa">${p.price} $</strong></td>
              <td>${echapperHtml(p.category)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
  }

  mettreAJourStats(liste.length);
}

/* ===========================
   CATÉGORIES – REMPLISSAGE SELECT
=========================== */
function remplirCategories() {
  const categories = [...new Set(tousLesProduits.map(p => p.category))].sort();
  filterCategorie.innerHTML = `<option value="">Toutes catégories</option>`;
  categories.forEach(cat => {
    filterCategorie.innerHTML += `<option value="${cat}">${cat}</option>`;
  });
}

/* ===========================
   TOGGLE VUE PRODUITS
=========================== */
toggleProductsView.addEventListener("click", () => {
  vueProduitsMode = vueProduitsMode === "carte" ? "liste" : "carte";
  toggleProductsView.innerHTML = vueProduitsMode === "carte"
    ? `<i class="fas fa-table btn-icon"></i><span class="btn-label">Liste</span>`
    : `<i class="fas fa-th-large btn-icon"></i><span class="btn-label">Cartes</span>`;
  afficherProduits(obtenirProduitsFiltres());
});

/* ===========================
   STATS – mise à jour
=========================== */
function mettreAJourStats(affiches = null) {
  totalProduits.textContent    = tousLesProduits.length;
  produitsAffiches.textContent = affiches !== null ? affiches : obtenirProduitsFiltres().length;
  totalCategories.textContent  = new Set(tousLesProduits.map(p => p.category)).size;
}

/* ===========================
   CLIENTS – CHARGEMENT API
=========================== */
async function chargerClients() {
  clientsContainer.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-spinner fa-spin" style="font-size:36px;opacity:1;margin-bottom:14px;display:block;color:#0ea5e9"></i>
      Chargement des clients…
    </div>`;

  try {
    const reponse  = await fetch("https://jsonplaceholder.typicode.com/users");
    clients        = await reponse.json();
    clientsCharges = true;
    remplirVilles();
    afficherClients(obtenirClientsFiltres());
  } catch {
    clientsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle empty-icon" style="color:#ef4444;opacity:1"></i>
        Impossible de charger les clients.
      </div>`;
  }
}

/* ===========================
   CLIENTS – FILTRE COMBINÉ
=========================== */
function obtenirClientsFiltres() {
  const recherche = rechercheClient.value.toLowerCase().trim();
  const ville     = filterVille.value;
  return clients.filter(c => {
    const correspondRecherche = !recherche || c.name.toLowerCase().includes(recherche);
    const correspondVille     = !ville     || c.address.city === ville;
    return correspondRecherche && correspondVille;
  });
}

rechercheClient.addEventListener("input", () => afficherClients(obtenirClientsFiltres()));
filterVille.addEventListener("change",    () => afficherClients(obtenirClientsFiltres()));

/* ===========================
   CLIENTS – AFFICHAGE
   FIX: afficher le nom complet (c.name) et non juste le prénom
=========================== */
function afficherClients(liste) {
  if (vueClientsMode === "carte") {
    clientsContainer.className = "products-grid mt-4";

    if (!liste.length) {
      clientsContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-user-slash empty-icon"></i>Aucun client trouvé.
        </div>`;
      return;
    }

    clientsContainer.innerHTML = liste.map(c => `
      <div class="client-card">
        <div class="client-avatar">${c.name[0].toUpperCase()}</div>
        <div class="client-name">${echapperHtml(c.name)}</div>
        <div class="client-detail">
          <i class="fas fa-envelope client-icon"></i>${echapperHtml(c.email)}
        </div>
        <div class="client-detail">
          <i class="fas fa-phone client-icon"></i>${echapperHtml(c.phone)}
        </div>
        <div class="client-detail">
          <i class="fas fa-building client-icon"></i>${echapperHtml(c.address.city)}
        </div>
      </div>
    `).join("");

  } else {
    clientsContainer.className = "table-responsive mt-4";

    if (!liste.length) {
      clientsContainer.innerHTML = `<p class="text-center py-5" style="color:#666">Aucun client trouvé.</p>`;
      return;
    }

    clientsContainer.innerHTML = `
      <table class="table table-dark table-hover align-middle">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Ville</th>
          </tr>
        </thead>
        <tbody>
          ${liste.map(c => `
            <tr>
              <td><strong>${echapperHtml(c.name)}</strong></td>
              <td>${echapperHtml(c.email)}</td>
              <td>${echapperHtml(c.phone)}</td>
              <td>${echapperHtml(c.address.city)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
  }
}

/* ===========================
   VILLES – REMPLISSAGE SELECT
=========================== */
function remplirVilles() {
  const villes = [...new Set(clients.map(c => c.address.city))].sort();
  filterVille.innerHTML = `<option value="">Toutes les villes</option>`;
  villes.forEach(v => {
    filterVille.innerHTML += `<option value="${v}">${v}</option>`;
  });
}

/* ===========================
   TOGGLE VUE CLIENTS
=========================== */
toggleClientsView.addEventListener("click", () => {
  vueClientsMode = vueClientsMode === "carte" ? "liste" : "carte";
  toggleClientsView.innerHTML = vueClientsMode === "carte"
    ? `<i class="fas fa-table btn-icon"></i><span class="btn-label">Liste</span>`
    : `<i class="fas fa-th-large btn-icon"></i><span class="btn-label">Cartes</span>`;
  afficherClients(obtenirClientsFiltres());
});

/* ===========================
   MODAL – AJOUTER CLIENT
=========================== */
btnAjouterClient.addEventListener("click", () => {
  modalAjouter.classList.add("active");
  inputNom.focus();
});

btnAnnuler.addEventListener("click", fermerModal);

modalAjouter.addEventListener("click", e => {
  if (e.target === modalAjouter) fermerModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modalAjouter.classList.contains("active")) fermerModal();
});

function fermerModal() {
  modalAjouter.classList.remove("active");
  [inputNom, inputEmail, inputPhone, inputVille].forEach(champ => champ.value = "");
}

btnConfirmerAjout.addEventListener("click", () => {
  const nom   = inputNom.value.trim();
  const email = inputEmail.value.trim();
  const phone = inputPhone.value.trim();
  const ville = inputVille.value.trim();

  if (!nom) {
    inputNom.focus();
    inputNom.style.borderColor = "#ef4444";
    setTimeout(() => inputNom.style.borderColor = "", 1500);
    return;
  }

  const nouveauClient = {
    id:      Date.now(),
    name:    nom,
    email:   email || "—",
    phone:   phone || "—",
    address: { city: ville || "—" }
  };

  clients.unshift(nouveauClient);

  if (ville && ville !== "—") {
    const existe = [...filterVille.options].some(o => o.value === ville);
    if (!existe) {
      filterVille.innerHTML += `<option value="${ville}">${ville}</option>`;
    }
  }

  afficherClients(obtenirClientsFiltres());
  fermerModal();
});

/* ===========================
   UTILITAIRE – échapper HTML
=========================== */
function echapperHtml(chaine) {
  return String(chaine)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ===========================
   NOTIFICATIONS
=========================== */
const notifBtn   = document.getElementById("notifBtn");
const notifPanel = document.getElementById("notifPanel");

notifBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  notifPanel.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!notifBtn.contains(e.target) && !notifPanel.contains(e.target)) {
    notifPanel.classList.remove("active");
  }
});

/* ===========================
   MOT DE PASSE + CARTE BANCAIRE
=========================== */
let nbEssais  = 3;
let estBloque = false;

openPopup.onclick = () => {
  if (estBloque) return;
  popup.style.display = "flex";
  password.focus();
};

closePopup.onclick = () => {
  popup.style.display = "none";
  password.value      = "";
  message.innerHTML   = "";
};

validate.onclick = () => {
  if (estBloque) return;

  if (password.value === vraiCode) {
    message.innerHTML = `<i class="fas fa-check-circle" style="color:#34d399;margin-right:6px"></i> Accès autorisé`;
    message.className = "success";

    setTimeout(() => {
      popup.style.display = "none";
      password.value      = "";
      message.innerHTML   = "";

      blurCarte.style.opacity       = "0";
      blurCarte.style.pointerEvents = "none";
      cadenas.style.display         = "none";

      clearTimeout(minuteurCarte);
      minuteurCarte = setTimeout(() => {
        blurCarte.style.opacity       = "";
        blurCarte.style.pointerEvents = "";
        cadenas.style.display         = "";

        nbEssais               = 3;
        estBloque              = false;
        validate.disabled      = false;
        validate.style.opacity = "";
        attemptsText.innerHTML = "3 essais";
        openPopup.style.opacity = "";
        openPopup.style.cursor  = "";
      }, 60000);

    }, 1000);

  } else {
    nbEssais--;
    attemptsText.innerHTML = nbEssais + " essais";
    message.innerHTML      = "Code incorrect";
    message.className      = "error";
    password.value         = "";

    if (nbEssais <= 0) {
      estBloque               = true;
      message.innerHTML       = "Accès bloqué";
      message.className       = "error";
      validate.disabled       = true;
      validate.style.opacity  = ".5";
      openPopup.style.opacity = ".5";
      openPopup.style.cursor  = "not-allowed";
    }
  }
};

password.addEventListener("keydown", (e) => {
  if (e.key === "Enter") validate.onclick();
});