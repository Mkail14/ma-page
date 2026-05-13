/* ═══════ STATE ═══════ */
let produits=[], clients=[];
let modeProduit=false, modeClient=false;
let idModifProduit=null, idModifClient=null;
let nextIdP=1, nextIdC=1;
let prodOuvert=false, clientOuvert=false;

/* ═══════ DOM ═══════ */
const tbody=document.querySelector('#tbody');
const formProduit=document.querySelector('#formProduit');
const nomI=document.querySelector('#nom');
const categorieI=document.querySelector('#categorie');
const prixI=document.querySelector('#prix');
const stockI=document.querySelector('#stock');
const messageEl=document.querySelector('#message');
const submitBtn=document.querySelector('#submitBtn');
const titreForm=document.querySelector('#titreForm');
const formIcon=document.querySelector('#formIcon');

const tbodyClients=document.querySelector('#tbodyClients');
const formClient=document.querySelector('#formClient');
const clientPrenom=document.querySelector('#clientPrenom');
const clientNom=document.querySelector('#clientNom');
const clientEmail=document.querySelector('#clientEmail');
const clientTel=document.querySelector('#clientTel');
const clientVille=document.querySelector('#clientVille');
const messageClient=document.querySelector('#messageClient');
const submitBtnClient=document.querySelector('#submitBtnClient');
const titreFormClient=document.querySelector('#titreFormClient');

const toolbarRow=document.querySelector('#toolbarRow');
const btnAjouter=document.querySelector('#btnAjouter');
const btnLabel=document.querySelector('#btnLabel');
const rechercheInput=document.querySelector('#recherche');
const formModal=document.querySelector('#formModal');
const formModalClient=document.querySelector('#formModalClient');
const modalBackdrop=document.querySelector('#modalBackdrop');
const countProduits=document.querySelector('#countProduits');
const countClients=document.querySelector('#countClients');
const toggleProduits=document.querySelector('#toggleProduits');
const toggleClients=document.querySelector('#toggleClients');
const wrapProduits=document.querySelector('#wrapProduits');
const wrapClients=document.querySelector('#wrapClients');
const chevronProduits=document.querySelector('#chevronProduits');
const chevronClients=document.querySelector('#chevronClients');
const filterBarProduits=document.querySelector('#filterBarProduits');
const filterBarClients=document.querySelector('#filterBarClients');
const filterCategorie=document.querySelector('#filterCategorie');
const filterStock=document.querySelector('#filterStock');
const filterVille=document.querySelector('#filterVille');
const filterAlpha=document.querySelector('#filterAlpha');
const menuBtn=document.querySelector('#menuBtn');
const menuPanel=document.querySelector('#menuPanel');

/* ═══════ STATS CARD CAROUSEL ═══════ */
let currentSlide=0;
const slides=[document.querySelector('#slide0'),document.querySelector('#slide1')];
const dots=[document.querySelector('#dot0'),document.querySelector('#dot1')];
const progressBar=document.querySelector('#statsProgressBar');

function goToSlide(idx){
  slides[currentSlide].classList.remove('active');
  slides[currentSlide].classList.add('exit');
  dots[currentSlide].classList.remove('active');
  setTimeout(()=>slides[currentSlide].classList.remove('exit'),600);

  currentSlide=idx;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');

  // Reset progress bar animation
  progressBar.style.animation='none';
  void progressBar.offsetWidth;
  progressBar.style.animation='progressFill 5s linear infinite';
}

function nextSlide(){goToSlide((currentSlide+1)%slides.length)}
setInterval(nextSlide,5000);

/* ═══════ STATS ═══════ */
function updateStats(){
  const np=produits.length, nc=clients.length;
  document.querySelector('#statNbProduits').textContent=np;
  document.querySelector('#statNbClients').textContent=nc;
  countProduits.textContent=np+' produit'+(np>1?'s':'');
  countClients.textContent=nc+' client'+(nc>1?'s':'');
}

/* ═══════ TOOLBAR ═══════ */
function updateToolbar(){
  if(prodOuvert){
    toolbarRow.style.display='flex';
    btnAjouter.className='glass-btn mode-produit';
    btnLabel.textContent='Ajouter un produit';
    rechercheInput.placeholder='Rechercher un produit…';
  } else if(clientOuvert){
    toolbarRow.style.display='flex';
    btnAjouter.className='glass-btn mode-client';
    btnLabel.textContent='Ajouter un client';
    rechercheInput.placeholder='Rechercher un client…';
  } else {
    toolbarRow.style.display='none';
  }
  rechercheInput.value='';
}

/* ═══════ MENU ═══════ */
menuBtn.addEventListener('click',()=>{menuBtn.classList.toggle('active');menuPanel.classList.toggle('active')});

/* ═══════ TOGGLE PRODUITS ═══════ */
toggleProduits.addEventListener('click',()=>{
  prodOuvert=!prodOuvert;
  wrapProduits.classList.toggle('open',prodOuvert);
  chevronProduits.classList.toggle('open',prodOuvert);
  filterBarProduits.classList.toggle('open',prodOuvert);
  if(prodOuvert&&clientOuvert){
    clientOuvert=false;
    wrapClients.classList.remove('open');
    chevronClients.classList.remove('open');
    filterBarClients.classList.remove('open');
  }
  updateToolbar();
});

/* ═══════ TOGGLE CLIENTS ═══════ */
toggleClients.addEventListener('click',()=>{
  clientOuvert=!clientOuvert;
  wrapClients.classList.toggle('open',clientOuvert);
  chevronClients.classList.toggle('open',clientOuvert);
  filterBarClients.classList.toggle('open',clientOuvert);
  if(clientOuvert&&prodOuvert){
    prodOuvert=false;
    wrapProduits.classList.remove('open');
    chevronProduits.classList.remove('open');
    filterBarProduits.classList.remove('open');
  }
  updateToolbar();
});

/* ═══════ BOUTON AJOUTER ═══════ */
btnAjouter.addEventListener('click',()=>{
  if(prodOuvert) ouvrirModalProduit();
  else if(clientOuvert) ouvrirModalClient();
});

/* ═══════ RECHERCHE ═══════ */
rechercheInput.addEventListener('input',()=>{
  const v=rechercheInput.value.toLowerCase().trim();
  if(prodOuvert) afficherProduits(getProduitsFiltrés(v));
  else if(clientOuvert) afficherClients(getClientsFiltrés(v));
});

/* ═══════ FILTRES PRODUITS ═══════ */
function getProduitsFiltrés(search=''){
  let l=[...produits];
  const s=rechercheInput&&prodOuvert?search||rechercheInput.value.toLowerCase().trim():'';
  const cat=filterCategorie.value;
  const stk=filterStock.value;
  if(s) l=l.filter(p=>p.nom.toLowerCase().includes(s)||p.categorie.toLowerCase().includes(s));
  if(cat) l=l.filter(p=>p.categorie===cat);
  if(stk==='faible') l=l.filter(p=>p.stock<10);
  if(stk==='ok') l=l.filter(p=>p.stock>=10);
  return l;
}
filterCategorie.addEventListener('change',()=>afficherProduits(getProduitsFiltrés()));
filterStock.addEventListener('change',()=>afficherProduits(getProduitsFiltrés()));
document.querySelector('#resetFilterProduits').addEventListener('click',()=>{
  filterCategorie.value='';filterStock.value='';rechercheInput.value='';
  afficherProduits();
});

/* ═══════ FILTRES CLIENTS ═══════ */
function getClientsFiltrés(search=''){
  let l=[...clients];
  const s=rechercheInput&&clientOuvert?search||rechercheInput.value.toLowerCase().trim():'';
  const ville=filterVille.value;
  const alpha=filterAlpha.value;
  if(s) l=l.filter(c=>c.prenom.toLowerCase().includes(s)||c.nom.toLowerCase().includes(s)||c.email.toLowerCase().includes(s)||c.ville.toLowerCase().includes(s));
  if(ville) l=l.filter(c=>c.ville===ville);
  if(alpha==='az') l.sort((a,b)=>a.nom.localeCompare(b.nom));
  if(alpha==='za') l.sort((a,b)=>b.nom.localeCompare(a.nom));
  return l;
}
filterVille.addEventListener('change',()=>afficherClients(getClientsFiltrés()));
filterAlpha.addEventListener('change',()=>afficherClients(getClientsFiltrés()));
document.querySelector('#resetFilterClients').addEventListener('click',()=>{
  filterVille.value='';filterAlpha.value='';rechercheInput.value='';
  afficherClients();
});

function updateVilleFilter(){
  const villes=[...new Set(clients.map(c=>c.ville).filter(Boolean))].sort();
  filterVille.innerHTML='<option value="">Toutes les villes</option>';
  villes.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;filterVille.appendChild(o)});
}

/* ═══════ AFFICHER PRODUITS ═══════ */
function afficherProduits(liste){
  const l=liste===undefined?produits:liste;
  updateStats();
  tbody.innerHTML='';
  if(!l.length){
    tbody.innerHTML=`<tr class="empty-row"><td colspan="6"><i class="fas fa-box-open"></i>Aucun produit trouvé</td></tr>`;
    return;
  }
  l.forEach(p=>{
    const tr=document.createElement('tr');
    if(p.stock<10)tr.classList.add('stock-faible');
    tr.innerHTML=`
      <td style="color:#555;font-size:13px">${p.id}</td>
      <td style="font-weight:500">${p.nom}</td>
      <td><span style="font-size:12px;padding:4px 10px;border-radius:50px;background:rgba(124,58,237,.12);color:#a78bfa;border:1px solid rgba(124,58,237,.2)">${p.categorie}</span></td>
      <td style="color:#a78bfa;font-weight:600">${Number(p.prix).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €</td>
      <td>${p.stock}${p.stock<10?' <span style="color:#ff6b6b;font-size:11px"> ⚠ faible</span>':''}</td>
      <td>
        <button class="btn-edit" onclick="modifierProduit(${p.id})"><i class="fas fa-pen"></i> Modifier</button>
        <button class="btn-del" onclick="supprimerProduit(${p.id})"><i class="fas fa-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);
  });
}

/* ═══════ AFFICHER CLIENTS ═══════ */
function afficherClients(liste){
  const l=liste===undefined?clients:liste;
  updateStats();updateVilleFilter();
  tbodyClients.innerHTML='';
  if(!l.length){
    tbodyClients.innerHTML=`<tr class="empty-row"><td colspan="7"><i class="fas fa-users"></i>Aucun client trouvé</td></tr>`;
    return;
  }
  l.forEach(c=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td style="color:#555;font-size:13px">${c.id}</td>
      <td>${c.prenom}</td>
      <td style="font-weight:500">${c.nom}</td>
      <td style="color:#7dd3fc">${c.email}</td>
      <td style="color:#aaa">${c.tel||'—'}</td>
      <td>${c.ville||'—'}</td>
      <td>
        <button class="btn-edit" onclick="modifierClient(${c.id})" style="background:rgba(14,165,233,.15);color:#7dd3fc;border-color:rgba(14,165,233,.25)"><i class="fas fa-pen"></i> Modifier</button>
        <button class="btn-del" onclick="supprimerClient(${c.id})"><i class="fas fa-trash"></i></button>
      </td>`;
    tbodyClients.appendChild(tr);
  });
}

/* ═══════ MODALS PRODUIT ═══════ */
function ouvrirModalProduit(){
  formModal.classList.add('active');
  modalBackdrop.classList.add('active');
  setTimeout(()=>nomI.focus(),350);
}
function fermerModalProduit(){
  formModal.classList.remove('active');
  modalBackdrop.classList.remove('active');
  formProduit.reset();
  messageEl.className='';messageEl.textContent='';
  modeProduit=false;idModifProduit=null;
  titreForm.textContent='Ajouter un produit';
  formIcon.innerHTML='<i class="fas fa-plus"></i>';
  submitBtn.innerHTML='<i class="fas fa-check"></i> Ajouter';
}
document.querySelector('#annuler').addEventListener('click',fermerModalProduit);
document.querySelector('#btnCloseModal').addEventListener('click',fermerModalProduit);

formProduit.addEventListener('submit',e=>{
  e.preventDefault();
  if(!nomI.value||!categorieI.value||prixI.value===''||stockI.value===''){
    messageEl.textContent='Veuillez remplir tous les champs.';messageEl.className='erreur';return;
  }
  if(modeProduit){
    const p=produits.find(x=>x.id===idModifProduit);
    p.nom=nomI.value;p.categorie=categorieI.value;p.prix=Number(prixI.value);p.stock=Number(stockI.value);
    messageEl.textContent='Produit modifié ✓';messageEl.className='succes';
  } else {
    produits.push({id:nextIdP++,nom:nomI.value,categorie:categorieI.value,prix:Number(prixI.value),stock:Number(stockI.value)});
    messageEl.textContent='Produit ajouté ✓';messageEl.className='succes';
    if(!prodOuvert){prodOuvert=true;wrapProduits.classList.add('open');chevronProduits.classList.add('open');filterBarProduits.classList.add('open')}
  }
  afficherProduits();setTimeout(fermerModalProduit,800);
});

function supprimerProduit(id){produits=produits.filter(p=>p.id!==id);afficherProduits(getProduitsFiltrés())}
function modifierProduit(id){
  const p=produits.find(x=>x.id===id);
  nomI.value=p.nom;categorieI.value=p.categorie;prixI.value=p.prix;stockI.value=p.stock;
  modeProduit=true;idModifProduit=id;
  titreForm.textContent='Modifier le produit';
  formIcon.innerHTML='<i class="fas fa-pen"></i>';
  submitBtn.innerHTML='<i class="fas fa-check"></i> Enregistrer';
  ouvrirModalProduit();
}

/* ═══════ MODALS CLIENT ═══════ */
function ouvrirModalClient(){
  formModalClient.classList.add('active');
  modalBackdrop.classList.add('active');
  setTimeout(()=>clientPrenom.focus(),350);
}
function fermerModalClient(){
  formModalClient.classList.remove('active');
  modalBackdrop.classList.remove('active');
  formClient.reset();
  messageClient.className='';messageClient.textContent='';
  modeClient=false;idModifClient=null;
  titreFormClient.textContent='Ajouter un client';
  submitBtnClient.innerHTML='<i class="fas fa-check"></i> Ajouter';
}
document.querySelector('#annulerClient').addEventListener('click',fermerModalClient);
document.querySelector('#btnCloseModalClient').addEventListener('click',fermerModalClient);
modalBackdrop.addEventListener('click',()=>{fermerModalProduit();fermerModalClient()});

formClient.addEventListener('submit',e=>{
  e.preventDefault();
  if(!clientPrenom.value||!clientNom.value||!clientEmail.value){
    messageClient.textContent='Prénom, nom et email sont obligatoires.';messageClient.className='erreur';return;
  }
  if(modeClient){
    const c=clients.find(x=>x.id===idModifClient);
    c.prenom=clientPrenom.value;c.nom=clientNom.value;
    c.email=clientEmail.value;c.tel=clientTel.value;c.ville=clientVille.value;
    messageClient.textContent='Client modifié ✓';messageClient.className='succes';
  } else {
    clients.push({id:nextIdC++,prenom:clientPrenom.value,nom:clientNom.value,email:clientEmail.value,tel:clientTel.value,ville:clientVille.value});
    messageClient.textContent='Client ajouté ✓';messageClient.className='succes';
    if(!clientOuvert){clientOuvert=true;wrapClients.classList.add('open');chevronClients.classList.add('open');filterBarClients.classList.add('open')}
  }
  afficherClients();setTimeout(fermerModalClient,800);
});

function supprimerClient(id){clients=clients.filter(c=>c.id!==id);afficherClients(getClientsFiltrés())}
function modifierClient(id){
  const c=clients.find(x=>x.id===id);
  clientPrenom.value=c.prenom;clientNom.value=c.nom;
  clientEmail.value=c.email;clientTel.value=c.tel;clientVille.value=c.ville;
  modeClient=true;idModifClient=id;
  titreFormClient.textContent='Modifier le client';
  submitBtnClient.innerHTML='<i class="fas fa-check"></i> Enregistrer';
  ouvrirModalClient();
}

/* ═══════ INIT ═══════ */
afficherProduits();
afficherClients();
updateToolbar();
