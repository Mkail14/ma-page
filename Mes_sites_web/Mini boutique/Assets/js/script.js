/* =============================================
   ÉTAT GLOBAL
============================================= */
let allProducts      = [];
let filteredProducts = [];
let cart             = [];
let activeCategory   = '';
let currentSort      = '';
let modalProduct     = null;
let modalQty         = 1;

/* =============================================
   VUES
============================================= */
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

/* =============================================
   TOAST
============================================= */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* =============================================
   BURGER MENU  ← CORRIGÉ
============================================= */
const menuBtn     = document.getElementById('menuBtn');
const menuPanel   = document.getElementById('menuPanel');
const menuOverlay = document.getElementById('menuOverlay');

function openMenu() {
  menuBtn.classList.add('active');
  menuPanel.classList.add('active');
  menuOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menuBtn.classList.remove('active');
  menuPanel.classList.remove('active');
  menuOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

menuBtn.addEventListener('click', () => {
  if (menuPanel.classList.contains('active')) closeMenu();
  else openMenu();
});

menuOverlay.addEventListener('click', closeMenu);

/* =============================================
   CHARGEMENT PRODUITS
============================================= */
const btnLoad     = document.getElementById('btnLoad');
const searchInput = document.getElementById('searchInput');
const sortSelect  = document.getElementById('sortSelect');
const filtersBar  = document.getElementById('filtersBar');

btnLoad.addEventListener('click', async () => {
  btnLoad.disabled = true;
  btnLoad.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement…';

  try {
    const res   = await fetch('https://fakestoreapi.com/products');
    allProducts  = await res.json();

    document.getElementById('heroTotal').textContent = allProducts.length;
    document.getElementById('heroCats').textContent  = new Set(allProducts.map(p => p.category)).size;

    buildCategoryFilters();
    applyFilters();

    btnLoad.innerHTML = '<i class="fas fa-sync"></i> Recharger';
    btnLoad.disabled  = false;
  } catch(e) {
    btnLoad.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erreur';
    btnLoad.disabled  = false;
  }
});

function buildCategoryFilters() {
  const cats = [...new Set(allProducts.map(p => p.category))].sort();

  filtersBar.querySelectorAll('.filter-chip').forEach((c, i) => {
    if (i > 0) c.remove();
  });

  cats.forEach(cat => {
    const btn       = document.createElement('button');
    btn.className   = 'filter-chip';
    btn.dataset.cat = cat;
    btn.textContent = capitalize(cat);
    filtersBar.insertBefore(btn, sortSelect);
    btn.addEventListener('click', () => setCategory(cat));
  });

  filtersBar.querySelector('[data-cat=""]').addEventListener('click', () => setCategory(''));
}

function setCategory(cat) {
  activeCategory = cat;
  filtersBar.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.cat === cat);
  });
  applyFilters();
}

searchInput.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', () => { currentSort = sortSelect.value; applyFilters(); });

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim();

  filteredProducts = allProducts.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory;
    const matchQ   = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  if (currentSort === 'price-asc')  filteredProducts.sort((a,b) => a.price - b.price);
  if (currentSort === 'price-desc') filteredProducts.sort((a,b) => b.price - a.price);
  if (currentSort === 'rating')     filteredProducts.sort((a,b) => b.rating.rate - a.rating.rate);
  if (currentSort === 'name')       filteredProducts.sort((a,b) => a.title.localeCompare(b.title));

  renderProducts();
}

/* =============================================
   AFFICHAGE PRODUITS
============================================= */
const productsGrid = document.getElementById('productsGrid');
const countDisplay = document.getElementById('countDisplay');

function getBadge(p) {
  if (p.rating.rate >= 4.5) return `<div class="p-card-badge badge-hot">Top</div>`;
  if (p.price < 20)          return `<div class="p-card-badge badge-sale">Promo</div>`;
  if (p.id % 3 === 0)        return `<div class="p-card-badge badge-new">Nouveau</div>`;
  return '';
}

function stars(rate) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += `<i class="fas fa-star" style="color:${i <= Math.round(rate) ? '#fbbf24' : '#2d2f3a'}"></i>`;
  }
  return s;
}

function renderProducts() {
  countDisplay.textContent = filteredProducts.length;

  if (!filteredProducts.length) {
    productsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>Aucun produit trouvé.</p>
      </div>`;
    return;
  }

  productsGrid.innerHTML = filteredProducts.map(p => `
    <div class="p-card" data-id="${p.id}">
      <div class="p-card-img">
        ${getBadge(p)}
        <img src="${p.image}" alt="${esc(p.title)}" loading="lazy"/>
        <div class="p-card-quick">
          <button class="pq-add" data-id="${p.id}"><i class="fas fa-shopping-bag"></i> Ajouter</button>
          <button class="pq-view" data-id="${p.id}">Voir</button>
        </div>
      </div>
      <div class="p-card-body">
        <div class="p-card-cat">${esc(p.category)}</div>
        <div class="p-card-name">${esc(p.title)}</div>
        <div class="p-card-footer">
          <div class="p-card-price">${p.price.toFixed(2)} €</div>
          <div class="p-card-stars">${stars(p.rating.rate)}</div>
        </div>
      </div>
    </div>
  `).join('');

  productsGrid.querySelectorAll('.pq-add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = allProducts.find(x => x.id == btn.dataset.id);
      if (p) { addToCart(p, 1); showToast(`"${p.title.slice(0,28)}…" ajouté !`); }
    });
  });

  productsGrid.querySelectorAll('.p-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.pq-add')) return;
      const p = allProducts.find(x => x.id == card.dataset.id);
      if (p) openModal(p);
    });
  });
}

/* =============================================
   MODAL DETAIL
============================================= */
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose    = document.getElementById('modalClose');
const modalQtyMinus = document.getElementById('modalQtyMinus');
const modalQtyPlus  = document.getElementById('modalQtyPlus');
const modalQtyVal   = document.getElementById('modalQtyVal');
const modalAddCart  = document.getElementById('modalAddCart');

function openModal(p) {
  modalProduct = p;
  modalQty     = 1;
  modalQtyVal.textContent = 1;

  document.getElementById('modalImg').src           = p.image;
  document.getElementById('modalCat').textContent   = p.category;
  document.getElementById('modalName').textContent  = p.title;
  document.getElementById('modalDesc').textContent  = p.description;
  document.getElementById('modalPrice').textContent = p.price.toFixed(2) + ' €';
  document.getElementById('modalStars').innerHTML   =
    stars(p.rating.rate) + `<span>(${p.rating.count} avis)</span>`;

  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalBackdrop.classList.remove('open');
  document.body.style.overflow = '';
  modalProduct = null;
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });

modalQtyMinus.addEventListener('click', () => {
  if (modalQty > 1) { modalQty--; modalQtyVal.textContent = modalQty; }
});
modalQtyPlus.addEventListener('click', () => {
  modalQty++;
  modalQtyVal.textContent = modalQty;
});

modalAddCart.addEventListener('click', () => {
  if (modalProduct) {
    addToCart(modalProduct, modalQty);
    showToast(`${modalQty}× "${modalProduct.title.slice(0,22)}…" ajouté !`);
    closeModal();
  }
});

/* =============================================
   PANIER
============================================= */
const cartBtn        = document.getElementById('cartBtn');
const cartBadge      = document.getElementById('cartBadge');
const cartSidebar    = document.getElementById('cartSidebar');
const cartOverlay    = document.getElementById('cartOverlay');
const cartClose      = document.getElementById('cartClose');
const cartItemsEl    = document.getElementById('cartItems');
const cartEmptyEl    = document.getElementById('cartEmpty');
const cartSubtotal   = document.getElementById('cartSubtotal');
const cartTotalEl    = document.getElementById('cartTotal');
const btnCheckout    = document.getElementById('btnCheckout');
const cartTitleCount = document.getElementById('cartTitleCount');

function openCart()  {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function addToCart(p, qty = 1) {
  const existing = cart.find(c => c.id === p.id);
  if (existing) existing.qty += qty;
  else cart.push({ ...p, qty });
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else renderCart();
}

function getTotal() {
  return cart.reduce((acc, c) => acc + c.price * c.qty, 0);
}

function getTotalQty() {
  return cart.reduce((acc, c) => acc + c.qty, 0);
}

function fmtPrice(n) {
  return n.toFixed(2).replace('.', ',') + ' €';
}

function renderCart() {
  const total    = getTotal();
  const totalQty = getTotalQty();

  cartBadge.textContent = totalQty;
  cartBadge.classList.toggle('visible', totalQty > 0);
  cartTitleCount.textContent = totalQty ? `(${totalQty})` : '';

  cartSubtotal.textContent = fmtPrice(total);
  cartTotalEl.textContent  = fmtPrice(total);
  btnCheckout.disabled     = cart.length === 0;

  if (!cart.length) {
    cartItemsEl.innerHTML = '';
    cartItemsEl.appendChild(cartEmptyEl);
    return;
  }

  cartEmptyEl.remove();

  cartItemsEl.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${c.image}" alt=""/>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${esc(c.title)}</div>
        <div class="cart-item-price">${(c.price * c.qty).toFixed(2)} €</div>
        <div class="cart-item-controls">
          <button class="ci-btn" onclick="changeQty(${c.id}, -1)"><i class="fas fa-minus"></i></button>
          <span class="ci-qty">${c.qty}</span>
          <button class="ci-btn" onclick="changeQty(${c.id}, 1)"><i class="fas fa-plus"></i></button>
          <button class="ci-btn del" onclick="removeFromCart(${c.id})" style="margin-left:6px"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

renderCart();

/* =============================================
   CHECKOUT → PAIEMENT
============================================= */
btnCheckout.addEventListener('click', () => {
  closeCart();
  renderPaymentSummary();
  showView('viewPaiement');
});

function renderPaymentSummary() {
  const total    = getTotal();
  const tva      = total * 0.2;
  const totalTTC = total + tva;
  const qty      = getTotalQty();

  document.getElementById('summaryCount').textContent    = `(${qty} article${qty > 1 ? 's' : ''})`;
  document.getElementById('summarySubtotal').textContent = fmtPrice(total);
  document.getElementById('summaryTVA').textContent      = fmtPrice(tva);
  document.getElementById('summaryTotal').textContent    = fmtPrice(totalTTC);
  document.getElementById('payAmount').textContent       = fmtPrice(totalTTC);

  document.getElementById('orderItems').innerHTML = cart.map(c => `
    <div class="oi-item">
      <div class="oi-img"><img src="${c.image}" alt=""/></div>
      <div>
        <div class="oi-name">${esc(c.title.slice(0,45))}${c.title.length > 45 ? '…' : ''}</div>
        <div class="oi-qty">×${c.qty}</div>
      </div>
      <div class="oi-price">${(c.price * c.qty).toFixed(2)} €</div>
    </div>
  `).join('');
}

/* =============================================
   MÉTHODES DE PAIEMENT
============================================= */
document.querySelectorAll('.pm-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.pm-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

/* FORMAT CARTE */
document.getElementById('cardNumber').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '').slice(0, 16);
  this.value = v.replace(/(.{4})/g, '$1 ').trim();
});
document.getElementById('cardExpiry').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2);
  this.value = v;
});
document.getElementById('cardCVV').addEventListener('input', function() {
  this.value = this.value.replace(/\D/g, '').slice(0, 3);
});

/* =============================================
   BOUTON PAYER
============================================= */
const btnPay = document.getElementById('btnPay');
btnPay.addEventListener('click', () => {
  btnPay.disabled = true;
  btnPay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement en cours…';

  setTimeout(() => {
    const orderId = 'CMD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    document.getElementById('confirmOrderId').textContent = 'N° ' + orderId;

    cart = [];
    renderCart();
    showView('viewConfirmation');
  }, 2000);
});

/* =============================================
   BOUTONS RETOUR
============================================= */
document.getElementById('btnBackShop').addEventListener('click', () => showView('viewBoutique'));
document.getElementById('btnConfirmBack').addEventListener('click', () => {
  btnPay.disabled = false;
  btnPay.innerHTML = '<i class="fas fa-lock"></i> Confirmer et payer <span id="payAmount"></span>';
  showView('viewBoutique');
});

/* =============================================
   LOGO → accueil
============================================= */
document.querySelector('.nav-logo').addEventListener('click', () => showView('viewBoutique'));

/* =============================================
   UTILITAIRES
============================================= */
function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}