// ================= MENU =================
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");

menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    menuPanel.classList.toggle("active");
});


// TABLEAU PRODUITS
let produits = [];

// ELEMENTS DOM
const tbody = document.querySelector("#tbody");

const form = document.querySelector("#formProduit");

const nom = document.querySelector("#nom");
const categorie = document.querySelector("#categorie");
const prix = document.querySelector("#prix");
const stock = document.querySelector("#stock");

const message = document.querySelector("#message");

const btnAjouter = document.querySelector("#btnAjouter");

const formCol = document.querySelector("#formCol");
const tableCol = document.querySelector("#tableCol");

const annuler = document.querySelector("#annuler");

const titreForm = document.querySelector("#titreForm");
const submitBtn = document.querySelector("#submitBtn");

const recherche = document.querySelector("#recherche");

// MODE MODIFICATION
let modeModification = false;
let idModification = null;

// AFFICHER PRODUITS
function afficherProduits(liste = produits){

  tbody.innerHTML = "";

  // AUCUN PRODUIT
  if(liste.length === 0){

    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center p-4">
          Aucun produit ajouté
        </td>
      </tr>
    `;

    return;
  }

  liste.forEach((produit) => {

    const tr = document.createElement("tr");

    // STOCK FAIBLE
    if(produit.stock < 10){
      tr.classList.add("stock-faible");
    }

    tr.innerHTML = `
      <td>${produit.id}</td>

      <td>${produit.nom}</td>

      <td>${produit.categorie}</td>

      <td>${produit.prix} €</td>

      <td>${produit.stock}</td>

      <td>

        <button
          class="btn btn-warning btn-sm me-2"
          onclick="modifierProduit(${produit.id})"
        >
          Modifier
        </button>

        <button
          class="btn btn-danger btn-sm"
          onclick="supprimerProduit(${produit.id})"
        >
          Supprimer
        </button>

      </td>
    `;

    tbody.appendChild(tr);

  });

}

// OUVRIR FORMULAIRE
btnAjouter.addEventListener("click", () => {

  formCol.classList.remove("d-none");

  tableCol.classList.remove("col-lg-12");
  tableCol.classList.add("col-lg-8");

});

// FERMER FORMULAIRE
function fermerFormulaire(){

  form.reset();

  formCol.classList.add("d-none");

  tableCol.classList.remove("col-lg-8");
  tableCol.classList.add("col-lg-12");

  message.innerHTML = "";

  modeModification = false;
  idModification = null;

  titreForm.innerHTML = "Ajouter un produit";

  submitBtn.innerHTML = "Ajouter";

}

// ANNULER
annuler.addEventListener("click", () => {

  fermerFormulaire();

});

// AJOUT / MODIFICATION
form.addEventListener("submit", (e) => {

  e.preventDefault();

  // VALIDATION
  if(
    nom.value === "" ||
    categorie.value === "" ||
    prix.value === "" ||
    stock.value === ""
  ){

    message.innerHTML = "Veuillez remplir tous les champs";

    message.className = "erreur";

    return;
  }

  // MODIFIER
  if(modeModification){

    const produit = produits.find(p => p.id === idModification);

    produit.nom = nom.value;
    produit.categorie = categorie.value;
    produit.prix = Number(prix.value);
    produit.stock = Number(stock.value);

    message.innerHTML = "Produit modifié avec succès";

    message.className = "succes";

  }else{

    // AJOUTER
    const nouveauProduit = {

      id: produits.length + 1,

      nom: nom.value,

      categorie: categorie.value,

      prix: Number(prix.value),

      stock: Number(stock.value)

    };

    produits.push(nouveauProduit);

    message.innerHTML = "Produit ajouté avec succès";

    message.className = "succes";

  }

  afficherProduits();

  setTimeout(() => {

    fermerFormulaire();

  }, 1000);

});

// SUPPRIMER
function supprimerProduit(id){

  produits = produits.filter(
    produit => produit.id !== id
  );

  afficherProduits();

}

// MODIFIER
function modifierProduit(id){

  const produit = produits.find(
    p => p.id === id
  );

  // OUVRIR FORM
  formCol.classList.remove("d-none");

  tableCol.classList.remove("col-lg-12");
  tableCol.classList.add("col-lg-8");

  // REMPLIR CHAMPS
  nom.value = produit.nom;
  categorie.value = produit.categorie;
  prix.value = produit.prix;
  stock.value = produit.stock;

  modeModification = true;

  idModification = id;

  titreForm.innerHTML = "Modifier un produit";

  submitBtn.innerHTML = "Modifier";

}

// RECHERCHE DYNAMIQUE
recherche.addEventListener("keyup", () => {

  const valeur = recherche.value.toLowerCase();

  const resultat = produits.filter((produit) => {

    return (
      produit.nom.toLowerCase().includes(valeur)
    );

  });

  afficherProduits(resultat);

});

// INITIALISATION
afficherProduits();