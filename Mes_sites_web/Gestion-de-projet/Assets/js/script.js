const heroTitle =document.querySelector("#heroTitle");
const heroText =document.querySelector("#heroText");
const inventaireSection =document.querySelector("#inventaireSection");
const clientsSection =document.querySelector("#clientsSection");
const navInventaire =document.querySelector("#navInventaire");
const navClients =document.querySelector("#navClients");

const menuInventaire =document.querySelector("#menuInventaire");
const menuClients =document.querySelector("#menuClients");
const menuAccueil =document.querySelector("#menuAccueil");
const productsContainer =document.querySelector("#productsContainer");
const clientsContainer =document.querySelector("#clientsContainer");
const btnCharger =document.querySelector("#btnCharger");

const rechercheProduit =document.querySelector("#rechercheProduit");
const rechercheClient =document.querySelector("#rechercheClient");
const filterCategorie =document.querySelector("#filterCategorie");
const filterVille =document.querySelector("#filterVille");

const toggleProductsView =document.querySelector("#toggleProductsView");
const toggleClientsView =document.querySelector("#toggleClientsView");
const menuBtn =document.querySelector("#menuBtn");
const menuPanel =document.querySelector("#menuPanel");
const menuOverlay =document.querySelector("#menuOverlay");

/* =========================
   STATE
========================= */

let allProducts = [];
let displayedProducts = [];

let clients = [];

let productView = "card";
let clientView = "card";

/* =========================
   MENU
========================= */

menuBtn.addEventListener("click", () => {

  menuBtn.classList.toggle("active");

  menuPanel.classList.toggle("active");

  menuOverlay.classList.toggle("active");

});

menuOverlay.addEventListener("click", closeMenu);

function closeMenu(){

  menuBtn.classList.remove("active");

  menuPanel.classList.remove("active");

  menuOverlay.classList.remove("active");

}

/* =========================
   NAVIGATION
========================= */

function resetSections(){

  inventaireSection.classList.remove("active");

  clientsSection.classList.remove("active");

}

function showAccueil(){

  resetSections();

  heroTitle.textContent =
    "Dashboard Gestion";

  heroText.textContent =
    "Gérez produits et clients dans une seule interface moderne.";

  closeMenu();

}

function showInventaire(){

  resetSections();

  inventaireSection.classList.add("active");

  heroTitle.textContent =
    "Votre Inventaire";

  heroText.textContent =
    "Gérez vos produits, catégories et votre stock.";

  closeMenu();

}

function showClients(){

  resetSections();

  clientsSection.classList.add("active");

  heroTitle.textContent =
    "Vos Clients";

  heroText.textContent =
    "Retrouvez vos clients et leurs informations.";

  closeMenu();

}

navInventaire.addEventListener("click", showInventaire);
navClients.addEventListener("click", showClients);

menuInventaire.addEventListener("click", showInventaire);
menuClients.addEventListener("click", showClients);

menuAccueil.addEventListener("click", showAccueil);

/* =========================
   PRODUITS
========================= */

async function chargerProduits(){

  try{

    btnCharger.innerHTML =
    `
    <i class="fas fa-spinner fa-spin"></i>
    Chargement...
    `;

    const response =
      await fetch(
        "https://fakestoreapi.com/products"
      );

    const data =
      await response.json();

    allProducts = data;

    melangerProduits();

    remplirCategories();

    btnCharger.innerHTML =
    `
    <i class="fas fa-check"></i>
    Produits chargés
    `;

  }

  catch(err){

    productsContainer.innerHTML =
    `
    <p class="text-danger">
      Impossible de charger les produits
    </p>
    `;

  }

}

/* RANDOM PRODUCTS */

function melangerProduits(){

  const shuffled =
    [...allProducts].sort(() => Math.random() - 0.5);

  displayedProducts =
    shuffled.slice(0,8);

  afficherProduits(displayedProducts);

}

/* DISPLAY PRODUCTS */

function afficherProduits(liste){

  if(productView === "card"){

    productsContainer.className =
      "products-grid mt-4";

  }

  else{

    productsContainer.className =
      "table-responsive mt-4";

  }

  if(productView === "card"){

    productsContainer.innerHTML = "";

    liste.forEach(p => {

      productsContainer.innerHTML += `
      
      <div class="product-card">

        <img src="${p.image}">

        <div class="product-category">
          ${p.category}
        </div>

        <div class="product-name">
          ${p.title.slice(0,45)}
        </div>

        <div class="product-price">
          ${p.price}$
        </div>

        <div class="product-description">
          ${p.description.slice(0,90)}...
        </div>

      </div>
      
      `;

    });

  }

  else{

    productsContainer.innerHTML =
    `
    <table class="table table-dark table-hover">

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

            <img
              src="${p.image}"
              width="60"
              height="60"
              style="
              object-fit:contain;
              background:white;
              padding:5px;
              border-radius:10px
              "
            >

          </td>

          <td>${p.title}</td>

          <td>${p.price}$</td>

          <td>${p.category}</td>

        </tr>
        
        `).join("")}

      </tbody>

    </table>
    `;

  }

}

/* =========================
   CLIENTS
========================= */

async function chargerClients(){

  const response =
    await fetch(
      "https://jsonplaceholder.typicode.com/users"
    );

  clients =
    await response.json();

  afficherClients(clients);

  remplirVilles();

}

chargerClients();

function afficherClients(liste){

  if(clientView === "card"){

    clientsContainer.className =
      "products-grid mt-4";

  }

  else{

    clientsContainer.className =
      "table-responsive mt-4";

  }

  if(clientView === "card"){

    clientsContainer.innerHTML = "";

    liste.forEach(c => {

      clientsContainer.innerHTML += `
      
      <div class="client-card">

        <div class="client-avatar">
          ${c.name[0]}
        </div>

        <div class="client-name">
          ${c.name}
        </div>

        <div class="client-detail">
          <i class="fas fa-envelope"></i>
          ${c.email}
        </div>

        <div class="client-detail">
          <i class="fas fa-phone"></i>
          ${c.phone}
        </div>

        <div class="client-detail">
          <i class="fas fa-city"></i>
          ${c.address.city}
        </div>

      </div>
      
      `;

    });

  }

  else{

    clientsContainer.innerHTML =
    `
    <table class="table table-dark table-hover">

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

          <td>${c.name}</td>

          <td>${c.email}</td>

          <td>${c.phone}</td>

          <td>${c.address.city}</td>

        </tr>
        
        `).join("")}

      </tbody>

    </table>
    `;

  }

}

/* =========================
   CATEGORI
========================= */

function remplirCategories(){

  const categories =
    [...new Set(allProducts.map(p => p.category))];

  filterCategorie.innerHTML =
  `
  <option value="">
    Toutes catégories
  </option>
  `;

  categories.forEach(cat => {

    filterCategorie.innerHTML += `
    
    <option value="${cat}">
      ${cat}
    </option>
    
    `;

  });

}

filterCategorie.addEventListener("change", () => {

  const value =
    filterCategorie.value;

  if(!value){

    afficherProduits(allProducts);

    return;

  }

  const filtered =
    allProducts.filter(p =>
      p.category === value
    );

  afficherProduits(filtered);

});

/* =========================
VILLES
========================= */

function remplirVilles(){

  const villes =
    [...new Set(
      clients.map(c => c.address.city)
    )];

  villes.forEach(v => {

    filterVille.innerHTML += `
    
    <option value="${v}">
      ${v}
    </option>
    
    `;

  });

}

filterVille.addEventListener("change", () => {

  const value =
    filterVille.value;

  if(!value){

    afficherClients(clients);

    return;

  }

  const filtered =
    clients.filter(c =>
      c.address.city === value
    );

  afficherClients(filtered);

});

/* =========================
RECHERCHE
========================= */

rechercheProduit.addEventListener("input", () => {

  const value =
    rechercheProduit.value.toLowerCase();

  const filtered =
    allProducts.filter(p =>
      p.title.toLowerCase().includes(value)
    );

  afficherProduits(filtered);

});

rechercheClient.addEventListener("input", () => {

  const value =
    rechercheClient.value.toLowerCase();

  const filtered =
    clients.filter(c =>
      c.name.toLowerCase().includes(value)
    );

  afficherClients(filtered);

});

/* =========================
   TOGGLE
========================= */

toggleProductsView.addEventListener("click", () => {

  productView =
    productView === "card"
    ? "list"
    : "card";

  toggleProductsView.innerHTML =
    productView === "card"

    ? `
      <i class="fas fa-table"></i>
      Liste
      `

    : `
      <i class="fas fa-th-large"></i>
      Cards
      `;

  afficherProduits(allProducts);

});

toggleClientsView.addEventListener("click", () => {

  clientView =
    clientView === "card"
    ? "list"
    : "card";

  toggleClientsView.innerHTML =
    clientView === "card"

    ? `
      <i class="fas fa-table"></i>
      Liste
      `

    : `
      <i class="fas fa-th-large"></i>
      Cards
      `;

  afficherClients(clients);

});

/* =========================
   BUTTON
========================= */

btnCharger.addEventListener("click", () => {

  chargerProduits();

});