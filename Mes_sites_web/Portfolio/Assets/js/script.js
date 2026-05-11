// ===== CURSEUR CUSTOM =====
document.addEventListener("mousemove", (e) => {
  const cursor = document.querySelector(".cursor");
  if (!cursor) return;

  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

// ===== SLIDER MAP (SECURISE) =====
const slides = document.querySelectorAll(".map_slider img");
let index = 0;

function changeSlide() {
  slides.forEach((s) => s.classList.remove("active"));

  index++;
  if (index >= slides.length) index = 0;

  if (slides[index]) {
    slides[index].classList.add("active");
  }
}

const map = document.querySelector(".map_box");

if (map && slides.length > 0) {
  let interval;

  map.addEventListener("mouseenter", () => {
    interval = setInterval(changeSlide, 2000);
  });

  map.addEventListener("mouseleave", () => {
    clearInterval(interval);
  });
}

document.addEventListener("mousemove", (e) => {
  document.body.style.setProperty("--x", e.clientX + "px");
  document.body.style.setProperty("--y", e.clientY + "px");
});

// ===== GRILLE INTERACTIVE =====
const bgEffect = document.querySelector(".bg-effect");

function initBackgroundEffect() {
  if (!bgEffect) return;

  const baseSquareSize = 48;
  const activeOpacity = 110; // /255
  const fadePerFrame = 8;
  const neighborChance = 0.5;
  const burstRadius = 4;
  const burstCount = 20;
  const hiddenOffset = -1200;
  const spotlightSize = 400;
  const spotlightHalf = spotlightSize / 2;
  const mobileBreakpoint = 768;

  bgEffect.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.className = "bg-canvas";
  bgEffect.appendChild(canvas);

  const spotlight = document.createElement("div");
  spotlight.className = "bg-spotlight";
  spotlight.style.width = spotlightSize + "px";
  spotlight.style.height = spotlightSize + "px";
  spotlight.style.transform = `translate(${hiddenOffset}px, ${hiddenOffset}px)`;
  bgEffect.appendChild(spotlight);

  const state = {
    neighbors: [],
    currentRow: -2,
    currentCol: -2,
    mouseX: -1000,
    mouseY: -1000,
    dirtyCells: [],
    animId: 0,
    isInViewport: true,
    isDocumentVisible: !document.hidden
  };

  const gridCache = {
    canvas: null,
    signature: ""
  };

  let spotlightRaf = 0;
  let pointerInside = false;
  let pointerClientX = 0;
  let pointerClientY = 0;

  function canAnimate() {
    return state.isInViewport && state.isDocumentVisible;
  }

  function getGridColor() {
    // Cyan/vert-bleu comme ton design actuel.
    return { r: 0, g: 255, b: 204 };
  }

  function updateSpotlightGradient() {
    spotlight.style.background =
      "radial-gradient(circle at center, rgba(0,255,204,0.16) 0%, rgba(46,173,255,0.10) 32%, transparent 70%)";
  }

  function scheduleSpotlight() {
    if (spotlightRaf) return;
    spotlightRaf = requestAnimationFrame(() => {
      spotlightRaf = 0;
      if (!pointerInside) {
        spotlight.style.transform = `translate(${hiddenOffset}px, ${hiddenOffset}px)`;
        return;
      }
      const rect = bgEffect.getBoundingClientRect();
      const x = pointerClientX - rect.left;
      const y = pointerClientY - rect.top;
      spotlight.style.transform = `translate(${x - spotlightHalf}px, ${y - spotlightHalf}px)`;
    });
  }

  function stopAnimation() {
    if (!state.animId) return;
    cancelAnimationFrame(state.animId);
    state.animId = 0;
  }

  function computeGridInfo() {
    const width = canvas.width;
    const height = canvas.height;
    const cell = baseSquareSize;
    const numCols = Math.ceil(width / cell);
    const numRows = Math.ceil(height / cell);
    return { width, height, cell, numCols, numRows };
  }

  function getCachedGrid(width, height, cell, numCols, numRows) {
    const { r, g, b } = getGridColor();
    const signature = `${width}:${height}:${cell}:${r}:${g}:${b}`;
    if (gridCache.signature === signature && gridCache.canvas) return gridCache.canvas;

    if (!gridCache.canvas) gridCache.canvas = document.createElement("canvas");
    const cache = gridCache.canvas;
    cache.width = width;
    cache.height = height;

    const ctx = cache.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${r},${g},${b},0.08)`;
    ctx.beginPath();

    for (let c = 0; c <= numCols; c++) {
      const x = c * cell;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, numRows * cell);
    }
    for (let rIndex = 0; rIndex <= numRows; rIndex++) {
      const y = rIndex * cell;
      ctx.moveTo(0, y);
      ctx.lineTo(numCols * cell, y);
    }
    ctx.stroke();

    gridCache.signature = signature;
    return cache;
  }

  function generateNeighbors(row, col, numRows, numCols) {
    const out = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (r < 0 || r >= numRows || c < 0 || c >= numCols) continue;
        if (Math.random() < neighborChance) {
          out.push({ row: r, col: c, opacity: 255 });
        }
      }
    }
    return out;
  }

  function resizeCanvasIfNeeded() {
    const rect = bgEffect.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (canvas.width === width && canvas.height === height) return;

    canvas.width = width;
    canvas.height = height;
    gridCache.signature = "";
    state.dirtyCells = [];
    redrawBaseGrid();
  }

  function redrawBaseGrid() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height, cell, numCols, numRows } = computeGridInfo();
    if (width <= 0 || height <= 0) return;

    const cached = getCachedGrid(width, height, cell, numCols, numRows);
    if (!cached) return;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(cached, 0, 0);
    state.dirtyCells = [];
  }

  function renderFrame() {
    state.animId = 0;
    if (!canAnimate()) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, cell, numCols, numRows } = computeGridInfo();
    const cached = getCachedGrid(width, height, cell, numCols, numRows);
    if (!cached) return;

    for (const dirty of state.dirtyCells) {
      const x = dirty.col * cell - 1;
      const y = dirty.row * cell - 1;
      const w = cell + 2;
      const h = cell + 2;
      ctx.clearRect(x, y, w, h);
      ctx.drawImage(cached, x, y, w, h, x, y, w, h);
    }
    state.dirtyCells = [];

    const { r, g, b } = getGridColor();
    const { mouseX, mouseY } = state;

    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
      const col = Math.max(0, Math.min(numCols - 1, Math.floor(mouseX / cell)));
      const row = Math.max(0, Math.min(numRows - 1, Math.floor(mouseY / cell)));

      if (row !== state.currentRow || col !== state.currentCol) {
        state.currentRow = row;
        state.currentCol = col;
        state.neighbors.push(...generateNeighbors(row, col, numRows, numCols));
      }

      ctx.strokeStyle = `rgba(${r},${g},${b},${(activeOpacity / 255).toFixed(3)})`;
      ctx.strokeRect(col * cell, row * cell, cell, cell);
      state.dirtyCells.push({ row, col });
    }

    for (const n of state.neighbors) {
      n.opacity = Math.max(0, n.opacity - fadePerFrame);
      if (n.opacity <= 0) continue;
      ctx.strokeStyle = `rgba(${r},${g},${b},${(n.opacity / 255).toFixed(3)})`;
      ctx.strokeRect(n.col * cell, n.row * cell, cell, cell);
      state.dirtyCells.push({ row: n.row, col: n.col });
    }

    state.neighbors = state.neighbors.filter((n) => n.opacity > 0);
    if (state.neighbors.length > 0) {
      state.animId = requestAnimationFrame(renderFrame);
    }
  }

  function ensureAnimation() {
    if (state.animId || !canAnimate()) return;
    state.animId = requestAnimationFrame(renderFrame);
  }

  function refreshAndRender() {
    stopAnimation();
    if (!canAnimate()) return;
    resizeCanvasIfNeeded();
    renderFrame();
  }

  function onPointerMove(e) {
    const rect = bgEffect.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      if (pointerInside) onPointerLeave();
      return;
    }

    state.mouseX = e.clientX - rect.left;
    state.mouseY = e.clientY - rect.top;
    pointerClientX = e.clientX;
    pointerClientY = e.clientY;
    pointerInside = true;
    scheduleSpotlight();
    ensureAnimation();
  }

  function onPointerLeave() {
    pointerInside = false;
    state.mouseX = -1000;
    state.mouseY = -1000;
    state.currentRow = -2;
    state.currentCol = -2;
    scheduleSpotlight();
    refreshAndRender();
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;

    const target = e.target;
    if (
      target &&
      target !== bgEffect &&
      target.closest(
        'a, button, input, textarea, select, label, canvas, summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="option"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"], [contenteditable="true"], [data-interactive]'
      )
    ) {
      return;
    }

    const rect = bgEffect.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

    const cell = baseSquareSize;
    const numCols = Math.ceil(rect.width / cell);
    const numRows = Math.ceil(rect.height / cell);
    const col = Math.max(0, Math.min(numCols - 1, Math.floor(x / cell)));
    const row = Math.max(0, Math.min(numRows - 1, Math.floor(y / cell)));

    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (burstRadius - 1) + 1;
      const rr = Math.round(row + radius * Math.sin(angle));
      const cc = Math.round(col + radius * Math.cos(angle));
      if (rr < 0 || rr >= numRows || cc < 0 || cc >= numCols) continue;
      state.neighbors.push({ row: rr, col: cc, opacity: 255 });
    }

    state.mouseX = x;
    state.mouseY = y;
    pointerClientX = e.clientX;
    pointerClientY = e.clientY;
    pointerInside = true;
    scheduleSpotlight();
    ensureAnimation();
  }

  function onVisibilityChange() {
    state.isDocumentVisible = !document.hidden;
    if (!state.isDocumentVisible) {
      stopAnimation();
      return;
    }
    refreshAndRender();
  }

  function onViewportChange(entries) {
    const first = entries[0];
    if (!first) return;
    state.isInViewport = first.isIntersecting;
    if (!state.isInViewport) {
      stopAnimation();
      return;
    }
    refreshAndRender();
  }

  function onWindowMove() {
    if (!pointerInside) return;
    scheduleSpotlight();
  }

  updateSpotlightGradient();
  resizeCanvasIfNeeded();
  redrawBaseGrid();

  // Mode degrade sur mobile: grille statique uniquement.
  if (window.innerWidth < mobileBreakpoint) {
    canvas.style.display = "none";
    spotlight.style.display = "none";
    return;
  }

  const intersectionObserver =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(onViewportChange, { threshold: 0.01 });

  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => {
          resizeCanvasIfNeeded();
          refreshAndRender();
        });

  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("scroll", onWindowMove, { passive: true });
  window.addEventListener("resize", onWindowMove);

  if (!resizeObserver) {
    window.addEventListener("resize", () => {
      resizeCanvasIfNeeded();
      refreshAndRender();
    });
  } else {
    resizeObserver.observe(bgEffect);
  }

  if (intersectionObserver) {
    intersectionObserver.observe(bgEffect);
  }

  refreshAndRender();
}

initBackgroundEffect();

