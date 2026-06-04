document.addEventListener('DOMContentLoaded', function () {

    /* ====== MEGA PANELS ====== */
    const allPanels = document.querySelectorAll('.mega-panel');
    const navLinks  = document.querySelectorAll('.navbar-link[data-panel]');
    const menuBtn   = document.getElementById('menuBtn');
    const nav       = document.querySelector('.bottom-nav');
    let closeTimeout = null;

    function openPanel(panelId) {
      clearTimeout(closeTimeout);
      allPanels.forEach(p => p.classList.remove('open'));
      navLinks.forEach(l => l.classList.remove('active'));
      const target = document.getElementById(panelId);
      if (target) {
        target.classList.add('open');
        navLinks.forEach(l => { if (l.dataset.panel === panelId) l.classList.add('active'); });
      }
    }

    function closeAll() {
      clearTimeout(closeTimeout);
      allPanels.forEach(p => p.classList.remove('open'));
      navLinks.forEach(l => l.classList.remove('active'));
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }

    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        openPanel(link.dataset.panel);
      });
      link.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const panel = document.getElementById(link.dataset.panel);
          panel?.classList.contains('open') ? closeAll() : openPanel(link.dataset.panel);
        }
      });
    });

    nav.addEventListener('mouseleave', () => {
      closeTimeout = setTimeout(() => {
        if (!document.querySelector('.mega-panel:hover')) closeAll();
      }, 180);
    });

    allPanels.forEach(panel => {
      panel.addEventListener('mouseenter', () => clearTimeout(closeTimeout));
      panel.addEventListener('mouseleave', () => { closeTimeout = setTimeout(closeAll, 180); });
    });

    menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      const menuPanel = document.getElementById('panel-menu');
      if (menuPanel.classList.contains('open')) {
        closeAll();
      } else {
        allPanels.forEach(p => p.classList.remove('open'));
        navLinks.forEach(l => l.classList.remove('active'));
        menuPanel.classList.add('open');
        menuBtn.classList.add('open');
        menuBtn.setAttribute('aria-expanded', 'true');
      }
    });

    document.querySelectorAll('.panel-close').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); closeAll(); });
    });

    document.querySelectorAll('.mobile-link').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        openPanel(btn.dataset.panel);
      });
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.mega-panel') && !e.target.closest('.bottom-nav')) closeAll();
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

    /* ====== RECHERCHE ====== */
    const searchBtn   = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isActive = searchInput.classList.toggle('active');
      if (isActive) { searchInput.focus(); } else { searchInput.value = ''; searchInput.blur(); }
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.search-wrapper')) {
        searchInput.classList.remove('active');
        searchInput.value = '';
      }
    });

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') { searchInput.classList.remove('active'); searchInput.value = ''; searchBtn.focus(); }
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.open('https://www.mayotte.fr/recherche?q=' + encodeURIComponent(searchInput.value.trim()), '_blank');
      }
    });

    /* ====== ONGLETS À DÉCOUVRIR ====== */
    document.querySelectorAll('.decouvrir-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.decouvrir-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.decouvrir-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.dtab);
        if (target) target.classList.add('active');
      });
    });

  });

  /* ====== TOGGLE COMMUNIQUÉS (liste / grille) ====== */
document.querySelectorAll('#communiqueToggle .view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    document.querySelectorAll('#communiqueToggle .view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.communique-view').forEach(v => {
      v.classList.toggle('active', v.classList.contains('view-' + view));
    });
  });
});

/* ====== MINI CALENDRIER AGENDA ====== */
(function() {
  // Événements de l'agenda : { day, month (0-based), year, title, url }
  const agendaEvents = [
    { day: 31, month: 0, year: 2026, title: "Concertation réseau de transport", url: "https://www.mayotte.fr/ressources/communique/?file=1769879847&ext=pdf" },
    { day: 7,  month: 1, year: 2026, title: "Lancement Interreg VI Canal du Mozambique", url: "https://www.mayotte.fr/services-en-ligne/aides-et-subventions/appels-a-projets" },
    { day: 1,  month: 5, year: 2026, title: "AMI – Parc conteneurs du port de Longoni", url: "https://www.mayotte.fr/actualite/lire/914/un-appel-a-manifestation-dinterets-pour-exploiter-le-parc-conteneurs-de-longoni" },
    { day: 15, month: 5, year: 2026, title: "FATMA 2026 – Festival des Arts et Traditions", url: "https://www.mayotte.fr/actualite/lire/913/mayotte-celebre-ses-traditions-et-son-histoire-a-travers-le-fatma-2026" },
  ];

  const today = new Date();
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();

  const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

  function hasEvent(d, m, y) {
    return agendaEvents.some(e => e.day === d && e.month === m && e.year === y);
  }
  function eventsOn(d, m, y) {
    return agendaEvents.filter(e => e.day === d && e.month === m && e.year === y);
  }

  function renderCal() {
    document.getElementById('calMonthLabel').textContent = monthNames[viewMonth] + ' ' + viewYear;
    const grid = document.getElementById('calDays');
    grid.innerHTML = '';

    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=dim
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // Décalage lundi=0
    const offset = (firstDay === 0) ? 6 : firstDay - 1;

    for (let i = 0; i < offset; i++) {
      const s = document.createElement('span');
      s.className = 'cal-day empty';
      grid.appendChild(s);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const s = document.createElement('span');
      s.className = 'cal-day';
      s.textContent = d;
      if (d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()) {
        s.classList.add('today');
      }
      if (hasEvent(d, viewMonth, viewYear)) s.classList.add('has-event');
      grid.appendChild(s);
    }
  }

  function renderToday() {
    const list = document.getElementById('todayEventsList');
    const evts = eventsOn(today.getDate(), today.getMonth(), today.getFullYear());
    list.innerHTML = '';
    if (evts.length === 0) {
      list.innerHTML = '<div class="today-none">Aucun événement aujourd\'hui</div>';
    } else {
      evts.forEach(ev => {
        const a = document.createElement('a');
        a.href = ev.url; a.target = '_blank';
        a.className = 'today-event-item';
        a.innerHTML = '<div class="tei-tag">Agenda</div><div class="tei-title">' + ev.title + '</div>';
        list.appendChild(a);
      });
    }
  }

  document.getElementById('calPrev').addEventListener('click', () => {
    viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCal();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCal();
  });

  renderCal();
  renderToday();
})();

/* =============================================================
   WEB TV — Conseil Départemental de Mayotte
   Aucune API nécessaire. Les miniatures et iframes viennent
   directement de YouTube via l'ID de la vidéo.

   ➕ AJOUTER UNE VIDÉO : copiez-collez un bloc { } dans VIDEOS
      et mettez l'ID YouTube (les 11 caractères dans l'URL de la vidéo)
   ============================================================= */

const VIDEOS = [
  {
    id:    'WPnhD06aNig',
    title: 'Colloque du Conseil Départemental à l\'hémicycle Younoussa Bamana',
    date:  '15 décembre 2025',
  },
  {
    id:    '1ypL5Z090Ac',
    title: 'Le Conseil Départemental devient "Assemblée de Mayotte"',
    date:  '7 janvier 2026',
  },
  {
    id:    'idVRhcI9tmg',
    title: 'Zakweli : Madi Moussa Velou, vice-président en charge de la solidarité',
    date:  '4 février 2025',
  },
  {
    id:    'kE-NMfsHQWE',
    title: 'Zakweli : Ben Issa Ousseni, président du Conseil Départemental',
    date:  '30 novembre 2023',
  },
];

/* ── Lecture ────────────────────────────────────────────────── */

function playVideo(video, cardEl) {
  document.getElementById('vpIframe').src =
    `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;

  document.getElementById('vpTitle').textContent = video.title;
  document.getElementById('vpDate').innerHTML =
    `<i class="bi bi-calendar3"></i> ${video.date}`;

  document.querySelectorAll('.vp-card').forEach(c => c.classList.remove('active'));
  if (cardEl) cardEl.classList.add('active');

  if (window.innerWidth < 900) {
    document.querySelector('.vp-player-wrap')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ── Construction des cartes ────────────────────────────────── */

function buildCard(video, index) {
  const card = document.createElement('div');
  card.className = 'vp-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  card.innerHTML = `
    <div class="vp-thumb-wrap">
      <img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="" loading="lazy">
      <div class="vp-play-icon"><i class="bi bi-play-fill"></i></div>
    </div>
    <div class="vp-card-meta">
      ${index === 0 ? '<span class="vp-badge-new">Nouveau</span>' : ''}
      <div class="vp-card-date"><i class="bi bi-calendar3 me-1"></i>${video.date}</div>
      <div class="vp-card-title">${video.title}</div>
    </div>
  `;

  const launch = () => playVideo(video, card);
  card.addEventListener('click', launch);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); launch(); }
  });

  return card;
}

/* ── Init ───────────────────────────────────────────────────── */

(function init() {
  const listEl = document.getElementById('vpList');
  if (!listEl) return;

  VIDEOS.forEach((video, i) => listEl.appendChild(buildCard(video, i)));

  // Lance automatiquement la première (la plus récente)
  const firstCard = listEl.querySelector('.vp-card');
  if (firstCard) firstCard.click();
})();