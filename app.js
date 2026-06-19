/* ============================================================
   SVGFlow — Wave Animation Engine + Controls
   ============================================================ */

'use strict';

// ── State ──────────────────────────────────────────────────
let phase        = 0;
let animFrameId  = null;
let isPremiumUser = false;  // Hook: set true after license validation

const state = {
  numWaves  : 2,
  speed     : 0.012,
  amplitude : 55,
  palette   : 'emerald',
};

// ── Gradient Palettes ──────────────────────────────────────
const PALETTES = {
  emerald: {
    name: 'Emerald Glass',
    gradients: [
      { id: 'grad0', stops: [{ pct: '0%', color: '#0fd4a8' }, { pct: '100%', color: '#00788a' }] },
      { id: 'grad1', stops: [{ pct: '0%', color: '#10b58f' }, { pct: '100%', color: '#004f62' }] },
      { id: 'grad2', stops: [{ pct: '0%', color: '#0ec99e' }, { pct: '100%', color: '#005f72' }] },
    ],
    bg: '#04111a',
    preview: ['#0fd4a8', '#0a9e82', '#00788a'],
  },
  electric: {
    name: 'Electric Silk',
    gradients: [
      { id: 'grad0', stops: [{ pct: '0%', color: '#a78bfa' }, { pct: '100%', color: '#6d28d9' }] },
      { id: 'grad1', stops: [{ pct: '0%', color: '#c4b5fd' }, { pct: '100%', color: '#5b21b6' }] },
      { id: 'grad2', stops: [{ pct: '0%', color: '#7c3aed' }, { pct: '100%', color: '#4c1d95' }] },
    ],
    bg: '#0d0516',
    preview: ['#a78bfa', '#8b5cf6', '#6d28d9'],
  },
  neon: {
    name: 'Deep Neon',
    gradients: [
      { id: 'grad0', stops: [{ pct: '0%', color: '#f472b6' }, { pct: '100%', color: '#db2777' }] },
      { id: 'grad1', stops: [{ pct: '0%', color: '#fb7185' }, { pct: '100%', color: '#be185d' }] },
      { id: 'grad2', stops: [{ pct: '0%', color: '#ec4899' }, { pct: '100%', color: '#9d174d' }] },
    ],
    bg: '#130710',
    preview: ['#f472b6', '#ec4899', '#db2777'],
  },
};

// Wave visual parameters per layer
const WAVE_CONFIG = [
  { freqMult: 1.0,  phaseOffset: 0,      baseHeightRatio: 0.62, opacityStart: 0.85, opacityEnd: 0.95 },
  { freqMult: 1.35, phaseOffset: 0.8,    baseHeightRatio: 0.68, opacityStart: 0.55, opacityEnd: 0.65 },
  { freqMult: 0.75, phaseOffset: -0.5,   baseHeightRatio: 0.56, opacityStart: 0.35, opacityEnd: 0.45 },
];

// ── DOM Refs ───────────────────────────────────────────────
const svgEl       = document.getElementById('wave-svg');
const bgRect      = document.getElementById('bg-rect');
const defsEl      = document.getElementById('wave-defs');
const canvasArea  = document.getElementById('canvas-area');

// Controls
const sliderSpeed  = document.getElementById('ctrl-speed');
const sliderAmp    = document.getElementById('ctrl-amplitude');
const valSpeed     = document.getElementById('val-speed');
const valAmp       = document.getElementById('val-amplitude');
const segBtns      = document.querySelectorAll('.seg-btn');
const paletteCards = document.querySelectorAll('.palette-card');

// Export
const btnCopy      = document.getElementById('btn-copy');
const btnPremium   = document.getElementById('btn-premium');

// Modal
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');
const modalCTA     = document.getElementById('modal-cta');

// Toast
const toastEl      = document.getElementById('toast');
const toastMsg     = document.getElementById('toast-msg');

// ── SVG Path Elements ──────────────────────────────────────
let pathEls = [];

function buildSVGStructure() {
  // Clear existing paths and defs content
  defsEl.innerHTML = '';
  pathEls.forEach(p => p.remove());
  pathEls = [];

  const palette = PALETTES[state.palette];

  // Define linearGradients
  palette.gradients.forEach((g, i) => {
    const lg = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    lg.setAttribute('id', g.id);
    lg.setAttribute('x1', '0%'); lg.setAttribute('y1', '0%');
    lg.setAttribute('x2', '0%'); lg.setAttribute('y2', '100%');
    g.stops.forEach(s => {
      const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop.setAttribute('offset', s.pct);
      stop.setAttribute('stop-color', s.color);
      lg.appendChild(stop);
    });
    defsEl.appendChild(lg);
  });

  // Create path elements (always 3, visibility toggled)
  for (let i = 0; i < 3; i++) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const cfg  = WAVE_CONFIG[i];
    path.setAttribute('fill', `url(#grad${i})`);
    path.setAttribute('fill-opacity', String(cfg.opacityStart));
    svgEl.appendChild(path);
    pathEls.push(path);
  }

  // Update background
  bgRect.setAttribute('fill', palette.bg);
  canvasArea.style.background = palette.bg;
}

function updateGradientVisibility() {
  pathEls.forEach((p, i) => {
    p.style.display = i < state.numWaves ? '' : 'none';
  });
}

// ── Animation Loop ─────────────────────────────────────────
const SVG_W = 1440;
const SVG_H = 900;

function animateFrame() {
  phase += state.speed;

  // dynamic frequency from amplitude (subtle coupling)
  const freq = 0.0035;

  pathEls.forEach((pathEl, i) => {
    if (i >= state.numWaves) return;

    const cfg = WAVE_CONFIG[i];
    const defaultHeight = cfg.baseHeightRatio * SVG_H;
    const waveFreq = freq * cfg.freqMult;
    const wavePhase = phase + cfg.phaseOffset;
    const waveAmp = state.amplitude;

    let d = `M 0 ${defaultHeight}`;
    for (let x = 0; x <= SVG_W; x += 40) {
      const y = defaultHeight + Math.sin((x * waveFreq) + wavePhase) * waveAmp;
      d += ` L ${x} ${y}`;
    }
    d += ` L ${SVG_W} ${SVG_H} L 0 ${SVG_H} Z`;

    pathEl.setAttribute('d', d);
  });

  animFrameId = requestAnimationFrame(animateFrame);
}

// ── Slider Helpers ─────────────────────────────────────────
function updateSliderTrack(input) {
  const min = parseFloat(input.min);
  const max = parseFloat(input.max);
  const val = parseFloat(input.value);
  const pct = ((val - min) / (max - min)) * 100;
  input.style.setProperty('--progress', `${pct}%`);
}

// ── Controls Wiring ────────────────────────────────────────
sliderSpeed.addEventListener('input', () => {
  state.speed = parseFloat(sliderSpeed.value);
  valSpeed.textContent = state.speed.toFixed(3);
  updateSliderTrack(sliderSpeed);
});

sliderAmp.addEventListener('input', () => {
  state.amplitude = parseFloat(sliderAmp.value);
  valAmp.textContent = Math.round(state.amplitude);
  updateSliderTrack(sliderAmp);
});

segBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.numWaves = parseInt(btn.dataset.val, 10);
    segBtns.forEach(b => b.classList.toggle('active', b === btn));
    updateGradientVisibility();
  });
});

paletteCards.forEach(card => {
  card.addEventListener('click', () => {
    state.palette = card.dataset.palette;
    paletteCards.forEach(c => c.classList.toggle('active', c === card));
    buildSVGStructure();
    updateGradientVisibility();
  });
});

// ── Copy Code ─────────────────────────────────────────────
function getStaticSVGCode() {
  // Clone the SVG element
  const clone = svgEl.cloneNode(true);

  // Remove any script-added inline styles that are unnecessary for static
  clone.removeAttribute('style');

  // Make it self-contained: inject current paths as frozen (static snapshot)
  // Paths are already up-to-date from the animation loop

  // Prettify a bit
  const serializer = new XMLSerializer();
  let raw = serializer.serializeToString(clone);

  // Clean namespace noise
  raw = raw.replace(/ xmlns:xlink="[^"]*"/g, '');
  raw = raw.replace(/ xmlns="[^"]*"/, ' xmlns="http://www.w3.org/2000/svg"');

  // Wrap in a comment block
  const output = `<!-- SVGFlow Static Export — svgflow.app -->\n${raw}`;
  return output;
}

btnCopy.addEventListener('click', async () => {
  try {
    const code = getStaticSVGCode();
    await navigator.clipboard.writeText(code);
    btnCopy.classList.add('copied');
    showToast('✅', 'SVG code copied to clipboard!');
    setTimeout(() => btnCopy.classList.remove('copied'), 300);
  } catch (err) {
    showToast('⚠️', 'Could not access clipboard.');
  }
});

// ── Premium Modal ──────────────────────────────────────────
btnPremium.addEventListener('click', () => openModal());
modalClose.addEventListener('click', () => closeModal());
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

modalCTA.addEventListener('click', () => {
  // ─── HOOK: Replace this function body with client-side licensing ───
  simulateCheckout();
});

function openModal() {
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function simulateCheckout() {
  // Placeholder — swap isPremiumUser = true here after real payment verification
  closeModal();
  showToast('🔒', 'Payment hook ready. Set isPremiumUser = true to unlock.');
}

// ── Toast ──────────────────────────────────────────────────
let toastTimer = null;

function showToast(icon, message) {
  document.getElementById('toast-icon').textContent = icon;
  toastMsg.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

// ── Init ───────────────────────────────────────────────────
function init() {
  // Set default slider values
  sliderSpeed.value = state.speed;
  sliderAmp.value   = state.amplitude;
  valSpeed.textContent = state.speed.toFixed(3);
  valAmp.textContent   = Math.round(state.amplitude);
  updateSliderTrack(sliderSpeed);
  updateSliderTrack(sliderAmp);

  // Activate default palette card
  paletteCards.forEach(c => {
    c.classList.toggle('active', c.dataset.palette === state.palette);
  });

  // Activate default wave segment button
  segBtns.forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.val) === state.numWaves);
  });

  // Build SVG
  buildSVGStructure();
  updateGradientVisibility();

  // Start animation
  animateFrame();
}

// Keyboard shortcut: Escape closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('DOMContentLoaded', init);
