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
const design1 = document.querySelector("#design1");

const totalProduits      = document.querySelector("#totalProduits");
const produitsAffiches   = document.querySelector("#produitsAffiches");
const totalCategories    = document.querySelector("#totalCategories");
const cardsSales = document.querySelector("#cardsSales");

const modalAjouter       = document.querySelector("#modalAjouterClient");
const btnAjouterClient   = document.querySelector("#btnAjouterClient");
const btnAnnuler         = document.querySelector("#btnAnnuler");
const btnConfirmerAjout  = document.querySelector("#btnConfirmerAjout");
const inputNom           = document.querySelector("#inputNom");
const inputEmail         = document.querySelector("#inputEmail");
const inputPhone         = document.querySelector("#inputPhone");
const inputVille         = document.querySelector("#inputVille");

/* ===========================
   STATE
=========================== */
let allProducts = [];
let clients     = [];
let productView = "card";
let clientView  = "card";

/* ===========================
   MENU HAMBURGER
=========================== */
menuBtn.addEventListener("click", () => {
  menuBtn.classList.toggle("active");
  menuPanel.classList.toggle("active");
  menuOverlay.classList.toggle("active");
});

menuOverlay.addEventListener("click", closeMenu);

function closeMenu() {
  menuBtn.classList.remove("active");
  menuPanel.classList.remove("active");
  menuOverlay.classList.remove("active");
}

/* ===========================
   NAVIGATION
=========================== */


function setActiveNavLink(linkEl) {
  document.querySelectorAll(".nav-link-custom").forEach(l => l.classList.remove("active-link"));
  if (linkEl) linkEl.classList.add("active-link");
}




function showAccueil() {
  inventaireSection.classList.remove("active");
  clientsSection.classList.remove("active");
  inventaireStats.classList.remove("visible");
  cardsSales.classList.remove("hidden");
  design1.classList.remove("hidden");
  heroTitle.textContent = "Dashboard Gestion";
  heroText.textContent  = "Gérez produits et clients dans une seule interface moderne.";
  setActiveNavLink(null);
  closeMenu();
}

function showInventaire() {
  inventaireSection.classList.add("active");
  clientsSection.classList.remove("active");
  inventaireStats.classList.add("visible");
  cardsSales.classList.add("hidden");
  design1.classList.add("hidden");
  heroTitle.textContent = "Votre Inventaire";
  heroText.textContent  = "Gérez vos produits, catégories et votre stock.";
  setActiveNavLink(navInventaire);
  updateStats();
  closeMenu();
}



function showClients() {
  clientsSection.classList.add("active");
  inventaireSection.classList.remove("active");
  inventaireStats.classList.remove("visible");
  cardsSales.classList.add("hidden");
  design1.classList.add("hidden");
  heroTitle.textContent = "Vos Clients";
  heroText.textContent  = "Retrouvez vos clients et leurs informations.";
  setActiveNavLink(navClients);
  closeMenu();
}




navInventaire.addEventListener("click",  e => { e.preventDefault(); showInventaire(); });
navClients.addEventListener("click",     e => { e.preventDefault(); showClients(); });
menuInventaire.addEventListener("click", e => { e.preventDefault(); showInventaire(); });
menuClients.addEventListener("click",    e => { e.preventDefault(); showClients(); });
menuAccueil.addEventListener("click",    e => { e.preventDefault(); showAccueil(); });

/* ===========================
   PRODUITS – CHARGEMENT API
=========================== */
async function chargerProduits() {
  try {
    btnCharger.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span class="btn-label">Chargement…</span>`;
    btnCharger.disabled = true;

    const res  = await fetch("https://fakestoreapi.com/products");
    const data = await res.json();
    allProducts = data;

    remplirCategories();
    afficherProduits(getFilteredProducts());

    btnCharger.innerHTML = `<i class="fas fa-check"></i><span class="btn-label">Chargé !</span>`;
    setTimeout(() => {
      btnCharger.innerHTML = `<i class="fas fa-sync"></i><span class="btn-label">Recharger</span>`;
      btnCharger.disabled = false;
    }, 2000);

  } catch (err) {
    productsContainer.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <i class="fas fa-exclamation-triangle" style="color:#ef4444"></i>
        Impossible de charger les produits. Vérifiez votre connexion.
      </div>`;
    btnCharger.innerHTML = `<i class="fas fa-download"></i><span class="btn-label">Charger les produits</span>`;
    btnCharger.disabled = false;
  }
}

btnCharger.addEventListener("click", chargerProduits);

/* ===========================
   PRODUITS – FILTRE COMBINÉ
   (recherche texte + catégorie,
    les deux filtres s'appliquent ensemble)
=========================== */
function getFilteredProducts() {
  const search = rechercheProduit.value.toLowerCase().trim();
  const cat    = filterCategorie.value;
  return allProducts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search);
    const matchCat    = !cat    || p.category === cat;
    return matchSearch && matchCat;
  });
}

rechercheProduit.addEventListener("input",  () => afficherProduits(getFilteredProducts()));
filterCategorie.addEventListener("change",  () => afficherProduits(getFilteredProducts()));

/* ===========================
   PRODUITS – AFFICHAGE
=========================== */
function afficherProduits(liste) {
  if (productView === "card") {
    productsContainer.className = "products-grid mt-4";

    if (!liste.length) {
      productsContainer.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <i class="fas fa-search"></i>Aucun produit trouvé.
        </div>`;
      updateStats(0);
      return;
    }

    productsContainer.innerHTML = liste.map(p => `
      <div class="product-card">
        <img src="${p.image}" alt="${escHtml(p.title)}" loading="lazy"/>
        <div class="product-category">${escHtml(p.category)}</div>
        <div class="product-name">${escHtml(p.title.slice(0, 55))}</div>
        <div class="product-price">${p.price} $</div>
        <div class="product-description">${escHtml(p.description.slice(0, 90))}…</div>
      </div>
    `).join("");

  } else {
    productsContainer.className = "table-responsive mt-4";

    if (!liste.length) {
      productsContainer.innerHTML = `
        <p class="text-center py-5" style="color:#666">Aucun produit trouvé.</p>`;
      updateStats(0);
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
              <td>${escHtml(p.title)}</td>
              <td><strong style="color:#a78bfa">${p.price} $</strong></td>
              <td>${escHtml(p.category)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
  }

  updateStats(liste.length);
}

/* ===========================
   CATÉGORIES – REMPLISSAGE SELECT
=========================== */
function remplirCategories() {
  const cats = [...new Set(allProducts.map(p => p.category))].sort();
  filterCategorie.innerHTML = `<option value="">Toutes catégories</option>`;
  cats.forEach(c => {
    filterCategorie.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

/* ===========================
   TOGGLE VUE PRODUITS
=========================== */
toggleProductsView.addEventListener("click", () => {
  productView = productView === "card" ? "list" : "card";
  toggleProductsView.innerHTML = productView === "card"
    ? `<i class="fas fa-table"></i><span class="btn-label">Liste</span>`
    : `<i class="fas fa-th-large"></i><span class="btn-label">Cards</span>`;
  afficherProduits(getFilteredProducts());
});

/* ===========================
   STATS (mise à jour)
   – appelé après chaque afficherProduits()
   – et à l'entrée dans la section Inventaire
=========================== */
function updateStats(displayed = null) {
  totalProduits.textContent    = allProducts.length;
  produitsAffiches.textContent = displayed !== null ? displayed : getFilteredProducts().length;
  totalCategories.textContent  = new Set(allProducts.map(p => p.category)).size;
}

/* ===========================
   CLIENTS – CHARGEMENT API
=========================== */
async function chargerClients() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    clients   = await res.json();
    remplirVilles();
    afficherClients(clients);
  } catch {
    clientsContainer.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <i class="fas fa-exclamation-triangle" style="color:#ef4444"></i>
        Impossible de charger les clients.
      </div>`;
  }
}

chargerClients();

/* ===========================
   CLIENTS – FILTRE COMBINÉ
   (recherche texte + ville,
    les deux filtres s'appliquent ensemble)
=========================== */
function getFilteredClients() {
  const search = rechercheClient.value.toLowerCase().trim();
  const ville  = filterVille.value;
  return clients.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search);
    const matchVille  = !ville  || c.address.city === ville;
    return matchSearch && matchVille;
  });
}

rechercheClient.addEventListener("input", () => afficherClients(getFilteredClients()));
filterVille.addEventListener("change",    () => afficherClients(getFilteredClients()));

/* ===========================
   CLIENTS – AFFICHAGE
=========================== */
function afficherClients(liste) {
  if (clientView === "card") {
    clientsContainer.className = "products-grid mt-4";

    if (!liste.length) {
      clientsContainer.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <i class="fas fa-user-slash"></i>Aucun client trouvé.
        </div>`;
      return;
    }

    clientsContainer.innerHTML = liste.map(c => `
      <div class="client-card">
        <div class="client-avatar">${c.name[0].toUpperCase()}</div>
        <div class="client-name">${escHtml(c.name)}</div>
        <div class="client-detail"><i class="fas fa-envelope"></i>${escHtml(c.email)}</div>
        <div class="client-detail"><i class="fas fa-phone"></i>${escHtml(c.phone)}</div>
        <div class="client-detail"><i class="fas fa-city"></i>${escHtml(c.address.city)}</div>
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
              <td><strong>${escHtml(c.name)}</strong></td>
              <td>${escHtml(c.email)}</td>
              <td>${escHtml(c.phone)}</td>
              <td>${escHtml(c.address.city)}</td>
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
  clientView = clientView === "card" ? "list" : "card";
  toggleClientsView.innerHTML = clientView === "card"
    ? `<i class="fas fa-table"></i><span class="btn-label">Liste</span>`
    : `<i class="fas fa-th-large"></i><span class="btn-label">Cards</span>`;
  afficherClients(getFilteredClients());
});

/* ===========================
   MODAL – AJOUTER CLIENT
=========================== */
btnAjouterClient.addEventListener("click", () => {
  modalAjouter.classList.add("active");
  inputNom.focus();
});

btnAnnuler.addEventListener("click", fermerModal);

// Fermer en cliquant sur l'overlay
modalAjouter.addEventListener("click", e => {
  if (e.target === modalAjouter) fermerModal();
});

// Fermer avec Echap
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && modalAjouter.classList.contains("active")) fermerModal();
});

function fermerModal() {
  modalAjouter.classList.remove("active");
  [inputNom, inputEmail, inputPhone, inputVille].forEach(i => i.value = "");
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

  const newClient = {
    id: Date.now(),
    name: nom,
    email: email || "—",
    phone: phone || "—",
    address: { city: ville || "—" }
  };

  clients.unshift(newClient);

  // Ajouter la ville au filtre si elle est nouvelle
  if (ville && ville !== "—") {
    const exists = [...filterVille.options].some(o => o.value === ville);
    if (!exists) {
      filterVille.innerHTML += `<option value="${ville}">${ville}</option>`;
    }
  }

  afficherClients(getFilteredClients());
  fermerModal();
});

/* ===========================
   UTILITAIRE – échapper HTML
   (sécurité : évite les injections XSS)
=========================== */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}



const notifBtn   = document.getElementById("notifBtn");
const notifPanel = document.getElementById("notifPanel");

notifBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  notifPanel.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (
    !notifBtn.contains(e.target) &&
    !notifPanel.contains(e.target)
  ) {
    notifPanel.classList.remove("active");
  }
});