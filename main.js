// --- State and Configuration ---
let phase = 0;
let waveCount = 3;
let speed = 0.02;
let amplitude = 150;
let frequency = 0.005;

// Color palettes for gradients
const palettes = {
  emerald: [
    { offset: "0%", color: "var(--color-emerald-500, #10b981)" },
    { offset: "100%", color: "var(--color-teal-800, #115e59)" }
  ],
  electric: [
    { offset: "0%", color: "var(--color-indigo-500, #6366f1)" },
    { offset: "100%", color: "var(--color-purple-800, #6b21a8)" }
  ],
  neon: [
    { offset: "0%", color: "var(--color-pink-500, #ec4899)" },
    { offset: "100%", color: "var(--color-rose-800, #9f1239)" }
  ]
};

let currentPalette = 'emerald';

// Predefined offsets for up to 3 layers to create depth
const layerConfig = [
  { phaseOffset: 0, heightOffset: 0, freqMult: 1, ampMult: 1, opacity: 1 },
  { phaseOffset: 2, heightOffset: 20, freqMult: 1.1, ampMult: 0.8, opacity: 0.6 },
  { phaseOffset: 4, heightOffset: 40, freqMult: 1.2, ampMult: 0.6, opacity: 0.3 }
];

// --- DOM Elements ---
const svgWrapper = document.getElementById('svgWrapper');
const waveCountInput = document.getElementById('waveCount');
const waveSpeedInput = document.getElementById('waveSpeed');
const waveAmpInput = document.getElementById('waveAmp');
const waveFreqInput = document.getElementById('waveFreq');

const wavesVal = document.getElementById('wavesVal');
const speedVal = document.getElementById('speedVal');
const ampVal = document.getElementById('ampVal');
const freqVal = document.getElementById('freqVal');

const paletteBtns = document.querySelectorAll('.palette-btn');

const copyBtn = document.getElementById('copyBtn');
const copyText = document.getElementById('copyText');
const premiumBtn = document.getElementById('premiumBtn');
const premiumModal = document.getElementById('premiumModal');
const closeModalBtn = document.getElementById('closeModalBtn');

// --- SVG Construction ---
let svgElement, defsElement, gradientElement, pathGroup;
let pathElements = [];

function initSVG() {
  svgWrapper.innerHTML = ''; // Clear existing
  
  // Create main SVG
  svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgElement.setAttribute("width", "100%");
  svgElement.setAttribute("height", "100%");
  // Using a fixed native coordinate space
  svgElement.setAttribute("viewBox", "0 0 1440 900");
  svgElement.setAttribute("preserveAspectRatio", "none");
  
  // Create defs and gradient
  defsElement = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  gradientElement = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  gradientElement.setAttribute("id", "waveGradient");
  gradientElement.setAttribute("x1", "0%");
  gradientElement.setAttribute("y1", "0%");
  gradientElement.setAttribute("x2", "100%");
  gradientElement.setAttribute("y2", "100%");
  
  defsElement.appendChild(gradientElement);
  svgElement.appendChild(defsElement);
  
  // Create group for paths
  pathGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgElement.appendChild(pathGroup);
  
  svgWrapper.appendChild(svgElement);
  
  updatePalette(currentPalette);
  createPaths();
}

function updatePalette(paletteKey) {
  currentPalette = paletteKey;
  gradientElement.innerHTML = '';
  const stops = palettes[paletteKey];
  stops.forEach(stopDef => {
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("offset", stopDef.offset);
    stop.setAttribute("stop-color", stopDef.color);
    gradientElement.appendChild(stop);
  });
}

function createPaths() {
  pathGroup.innerHTML = '';
  pathElements = [];
  // Render back-to-front
  for (let i = waveCount - 1; i >= 0; i--) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "url(#waveGradient)");
    path.setAttribute("opacity", layerConfig[i].opacity);
    pathGroup.appendChild(path);
    pathElements.unshift(path); // Keep index 0 as top layer
  }
}

// --- Animation Loop ---
function animate() {
  phase += speed;
  const defaultHeight = 450; // Middle of 900 height

  for (let i = 0; i < waveCount; i++) {
    const config = layerConfig[i];
    const pathFreq = frequency * config.freqMult;
    const pathAmp = amplitude * config.ampMult;
    const pathPhase = phase + config.phaseOffset;
    const pathBaseHeight = defaultHeight + config.heightOffset;
    
    let d = `M 0 900 L 0 ${pathBaseHeight}`;
    
    // Step by 40 units across 1440
    for (let x = 0; x <= 1440; x += 40) {
      let y = pathBaseHeight + Math.sin((x * pathFreq) + pathPhase) * pathAmp;
      d += ` L ${x} ${y}`;
    }
    
    // Close the path
    d += ` L 1440 900 Z`;
    
    if (pathElements[i]) {
      pathElements[i].setAttribute('d', d);
    }
  }
  
  requestAnimationFrame(animate);
}

// --- Event Listeners ---
waveCountInput.addEventListener('input', (e) => {
  waveCount = parseInt(e.target.value);
  wavesVal.textContent = waveCount;
  createPaths();
});

waveSpeedInput.addEventListener('input', (e) => {
  speed = parseFloat(e.target.value);
  speedVal.textContent = speed.toFixed(3) + 'x';
});

waveAmpInput.addEventListener('input', (e) => {
  amplitude = parseInt(e.target.value);
  ampVal.textContent = amplitude;
});

waveFreqInput.addEventListener('input', (e) => {
  frequency = parseFloat(e.target.value);
  freqVal.textContent = frequency.toFixed(3);
});

paletteBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Reset borders
    paletteBtns.forEach(b => {
      b.classList.remove('border-emerald-500', 'border-indigo-500', 'border-pink-500');
      b.classList.add('border-transparent');
      b.classList.replace('opacity-100', 'opacity-60');
    });
    
    // Highlight active
    const target = e.target.closest('.palette-btn');
    const palette = target.dataset.palette;
    
    let borderColor = 'border-emerald-500';
    if (palette === 'electric') borderColor = 'border-indigo-500';
    if (palette === 'neon') borderColor = 'border-pink-500';
    
    target.classList.remove('border-transparent', 'opacity-60');
    target.classList.add(borderColor, 'opacity-100');
    
    updatePalette(palette);
  });
});

copyBtn.addEventListener('click', async () => {
  if (!svgElement) return;
  
  // Clone to avoid modifying the live DOM
  const clone = svgElement.cloneNode(true);
  
  // Resolve CSS variable colors for standalone SVG if needed, but for simplicity we can inline the hex codes
  // Since CSS variables won't work perfectly if copied outside, let's swap them.
  const gradientStops = clone.querySelectorAll('stop');
  const stopsData = palettes[currentPalette];
  gradientStops.forEach((stop, i) => {
    // Extract default hex fallback from var(--name, #hex)
    const match = stopsData[i].color.match(/#(?:[0-9a-fA-F]{3}){1,2}/);
    if (match) {
      stop.setAttribute('stop-color', match[0]);
    }
  });

  const svgString = new XMLSerializer().serializeToString(clone);
  
  try {
    await navigator.clipboard.writeText(svgString);
    copyText.textContent = "Copied!";
    copyBtn.classList.add('bg-emerald-600', 'border-emerald-500', 'text-white');
    copyBtn.classList.remove('bg-slate-800');
    
    setTimeout(() => {
      copyText.textContent = "Copy Code Block (Free)";
      copyBtn.classList.remove('bg-emerald-600', 'border-emerald-500', 'text-white');
      copyBtn.classList.add('bg-slate-800');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
    copyText.textContent = "Copy Failed";
  }
});

// Premium Modal logic
premiumBtn.addEventListener('click', () => {
  premiumModal.classList.remove('hidden');
  // Small delay to allow display:block to apply before transition
  setTimeout(() => {
    premiumModal.classList.remove('opacity-0');
    document.getElementById('premiumModalContent').classList.remove('scale-95');
    document.getElementById('premiumModalContent').classList.add('scale-100');
  }, 10);
});

function closeModal() {
  premiumModal.classList.add('opacity-0');
  document.getElementById('premiumModalContent').classList.remove('scale-100');
  document.getElementById('premiumModalContent').classList.add('scale-95');
  
  setTimeout(() => {
    premiumModal.classList.add('hidden');
  }, 300); // match duration-300
}

closeModalBtn.addEventListener('click', closeModal);
premiumModal.addEventListener('click', (e) => {
  if (e.target === premiumModal) closeModal();
});

// --- Initialization ---
initSVG();
requestAnimationFrame(animate);
