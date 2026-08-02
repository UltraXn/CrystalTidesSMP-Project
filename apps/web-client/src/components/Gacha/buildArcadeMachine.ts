import * as THREE from 'three';

export type GachaCabinetTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'emerald'
  | 'diamond'
  | 'iridium'
  | 'ultra';

interface CabinetPalette {
  body: string;
  bodyDark: string;
  trim: string;
  accent: string;
  accentGlow: string;
  panel: string;
  screen: string;
  button: string;
  coinUrl: string;
}

/** Palettes sampled from KilluCoin pixel art. */
const PALETTES: Record<GachaCabinetTier, CabinetPalette> = {
  bronze: {
    body: '#5c3418',
    bodyDark: '#2a160a',
    trim: '#a86a32',
    accent: '#cd7f32',
    accentGlow: '#e8a45a',
    panel: '#3d2414',
    screen: '#120a05',
    button: '#d4a574',
    coinUrl: '/images/killucoins/coin_cobre.png',
  },
  silver: {
    body: '#6b7585',
    bodyDark: '#2c333d',
    trim: '#c8d0dc',
    accent: '#a8b4c4',
    accentGlow: '#e8eef6',
    panel: '#3a424e',
    screen: '#0a0c10',
    button: '#dfe6f0',
    coinUrl: '/images/killucoins/coin_plata.png',
  },
  gold: {
    body: '#8a6410',
    bodyDark: '#3a2806',
    trim: '#ffd700',
    accent: '#f0c14a',
    accentGlow: '#fff1b0',
    panel: '#5a4010',
    screen: '#120e04',
    button: '#ffe08a',
    coinUrl: '/images/killucoins/coin_oro.png',
  },
  emerald: {
    body: '#145c38',
    bodyDark: '#062418',
    trim: '#3dd68c',
    accent: '#50c878',
    accentGlow: '#9af5c0',
    panel: '#0e3a26',
    screen: '#04140c',
    button: '#7eebb0',
    coinUrl: '/images/killucoins/coin_esmeralda.png',
  },
  diamond: {
    body: '#0a5a68',
    bodyDark: '#042430',
    trim: '#5ef0ff',
    accent: '#00d4e8',
    accentGlow: '#b8fbff',
    panel: '#0a3844',
    screen: '#021018',
    button: '#7ef6ff',
    coinUrl: '/images/killucoins/coin_diamante.png',
  },
  iridium: {
    body: '#4a1a5c',
    bodyDark: '#1a0824',
    trim: '#e879f9',
    accent: '#c026d3',
    accentGlow: '#f5d0fe',
    panel: '#2e1040',
    screen: '#0e0614',
    button: '#f0abfc',
    coinUrl: '/images/killucoins/coin_iridium.png',
  },
  ultra: {
    body: '#1e1b4b',
    bodyDark: '#0b0a1f',
    trim: '#818cf8',
    accent: '#6366f1',
    accentGlow: '#c7d2fe',
    panel: '#2e2a5a',
    screen: '#07061a',
    button: '#a5b4fc',
    coinUrl: '/images/killucoins/ultra_gen.webp',
  },
};

const mat = (
  color: string,
  opts: Partial<THREE.MeshStandardMaterialParameters> = {}
) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.22,
    flatShading: true,
    ...opts,
  });

const box = (
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  name?: string
) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  if (name) mesh.name = name;
  return mesh;
};

function metalBand(palette: CabinetPalette, vertical = false): THREE.MeshStandardMaterial {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const g = vertical
    ? ctx.createLinearGradient(0, 0, 0, 64)
    : ctx.createLinearGradient(0, 0, 64, 0);
  g.addColorStop(0, palette.accentGlow);
  g.addColorStop(0.35, palette.accent);
  g.addColorStop(0.7, palette.trim);
  g.addColorStop(1, palette.bodyDark);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return mat('#ffffff', { map, metalness: 0.45, roughness: 0.35 });
}

function addCoinBadge(root: THREE.Group, palette: CabinetPalette, x: number, y: number, z: number, size = 0.55) {
  const loader = new THREE.TextureLoader();
  const placeholder = mat(palette.accent, {
    emissive: palette.accent,
    emissiveIntensity: 0.25,
  });
  const badge = box(size, size, 0.08, placeholder, x, y, z, 'coin-badge');
  root.add(badge);
  loader.load(
    palette.coinUrl,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      const m = mat('#ffffff', {
        map: tex,
        transparent: true,
        metalness: 0.1,
        roughness: 0.55,
      });
      badge.material = m;
    },
    undefined,
    () => {
      /* keep placeholder */
    }
  );
}

function addShadow(root: THREE.Group, radius = 1.4) {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 24),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);
}

function addControls(
  root: THREE.Group,
  palette: CabinetPalette,
  y: number,
  z: number,
  opts: { joyX?: number; wide?: boolean } = {}
) {
  const joyX = opts.joyX ?? -0.55;
  const btnMat = mat(palette.button, {
    emissive: palette.accent,
    emissiveIntensity: 0.35,
  });
  const stickMat = mat(palette.trim, { metalness: 0.5, roughness: 0.4 });
  root.add(box(0.28, 0.08, 0.28, stickMat, joyX, y, z));
  root.add(box(0.08, 0.32, 0.08, stickMat, joyX, y + 0.2, z, 'joystick-stick'));
  root.add(box(0.16, 0.16, 0.16, btnMat, joyX, y + 0.38, z, 'joystick-ball'));
  root.add(box(0.18, 0.1, 0.18, btnMat, 0.25, y + 0.02, z - 0.05, 'btn-0'));
  root.add(box(0.18, 0.1, 0.18, btnMat, 0.5, y + 0.02, z - 0.05, 'btn-1'));
  if (opts.wide) {
    root.add(box(0.18, 0.1, 0.18, btnMat, 0.375, y + 0.02, z + 0.2, 'btn-2'));
  }
}

/** Classic upright wall-arcade (bronze). */
function buildBronze(p: CabinetPalette): THREE.Group {
  const root = new THREE.Group();
  const body = mat(p.body);
  const dark = mat(p.bodyDark);
  const trim = metalBand(p);
  const panel = mat(p.panel);
  const screen = mat(p.screen, { emissive: p.accent, emissiveIntensity: 0.2 });
  const frame = mat(p.accent, { emissive: p.accent, emissiveIntensity: 0.4 });

  root.add(box(2.2, 0.2, 1.5, dark, 0, 0.1, 0));
  root.add(box(2.0, 1.6, 1.35, body, 0, 1.0, 0));
  root.add(box(2.05, 0.18, 1.4, trim, 0, 1.85, 0, 'rainbow-belt'));
  root.add(box(0.55, 0.45, 0.08, panel, 0, 0.9, 0.7));
  root.add(box(0.18, 0.08, 0.05, frame, 0, 1.0, 0.76, 'coin-slot'));

  const deck = box(2.1, 0.14, 1.0, panel, 0, 2.15, 0.55);
  deck.rotation.x = -0.35;
  root.add(deck);
  addControls(root, p, 2.35, 0.85);

  root.add(box(2.0, 1.7, 1.15, body, 0, 3.15, -0.05));
  root.add(box(1.55, 1.2, 0.1, frame, 0, 3.2, 0.52));
  root.add(box(1.35, 1.0, 0.06, screen, 0, 3.2, 0.58, 'screen'));
  root.add(box(0.06, 0.9, 0.06, frame, -0.45, 3.2, 0.62, 'reel-div-l'));
  root.add(box(0.06, 0.9, 0.06, frame, 0.45, 3.2, 0.62, 'reel-div-r'));

  root.add(box(2.15, 0.55, 0.7, dark, 0, 4.15, 0.1));
  root.add(box(1.9, 0.35, 0.1, panel, 0, 4.18, 0.45, 'marquee'));
  root.add(box(1.7, 0.08, 0.08, trim, 0, 3.95, 0.48, 'marquee-underline'));
  addCoinBadge(root, p, 0, 4.18, 0.52, 0.5);
  addShadow(root);
  root.position.set(0, -2.15, 0);
  return root;
}

/** Slim steel upright (silver). */
function buildSilver(p: CabinetPalette): THREE.Group {
  const root = new THREE.Group();
  const body = mat(p.body, { metalness: 0.55, roughness: 0.4 });
  const dark = mat(p.bodyDark, { metalness: 0.6, roughness: 0.35 });
  const trim = metalBand(p, true);
  const panel = mat(p.panel, { metalness: 0.5, roughness: 0.4 });
  const screen = mat(p.screen, { emissive: p.accent, emissiveIntensity: 0.25 });
  const frame = mat(p.accentGlow, { emissive: p.accent, emissiveIntensity: 0.35, metalness: 0.7 });

  root.add(box(1.7, 0.18, 1.3, dark, 0, 0.09, 0));
  root.add(box(1.55, 2.0, 1.15, body, 0, 1.15, 0));
  root.add(box(0.08, 1.8, 0.08, trim, -0.82, 1.2, 0.5, 'led-left'));
  root.add(box(0.08, 1.8, 0.08, trim, 0.82, 1.2, 0.5, 'led-right'));
  root.add(box(0.4, 0.35, 0.06, panel, 0, 0.75, 0.6));

  const deck = box(1.65, 0.12, 0.85, panel, 0, 2.25, 0.5);
  deck.rotation.x = -0.28;
  root.add(deck);
  addControls(root, p, 2.42, 0.75);

  root.add(box(1.55, 1.55, 1.0, body, 0, 3.2, -0.05));
  root.add(box(1.25, 1.1, 0.08, frame, 0, 3.25, 0.48));
  root.add(box(1.1, 0.95, 0.05, screen, 0, 3.25, 0.54, 'screen'));

  root.add(box(1.7, 0.4, 0.55, dark, 0, 4.15, 0.05));
  root.add(box(1.45, 0.22, 0.08, panel, 0, 4.15, 0.35, 'marquee'));
  addCoinBadge(root, p, 0, 4.15, 0.42, 0.42);
  addShadow(root, 1.15);
  root.position.set(0, -2.15, 0);
  return root;
}

/** Wide cocktail / Pac-Man style (gold). */
function buildGold(p: CabinetPalette): THREE.Group {
  const root = new THREE.Group();
  const body = mat(p.body);
  const dark = mat(p.bodyDark);
  const trim = metalBand(p);
  const panel = mat(p.panel);
  const screen = mat(p.screen, { emissive: p.accent, emissiveIntensity: 0.22 });
  const frame = mat(p.trim, { emissive: p.accent, emissiveIntensity: 0.45 });

  // Wider stubby body
  root.add(box(2.8, 0.22, 1.7, dark, 0, 0.11, 0));
  root.add(box(2.6, 1.35, 1.5, body, 0, 0.9, 0));
  root.add(box(2.7, 0.16, 1.55, trim, 0, 1.6, 0, 'rainbow-belt'));
  root.add(box(0.7, 0.5, 0.08, panel, 0, 0.85, 0.78));

  // Big control shelf
  root.add(box(2.7, 0.18, 1.2, panel, 0, 1.85, 0.55));
  addControls(root, p, 2.05, 0.9, { joyX: -0.85, wide: true });
  root.add(box(0.18, 0.1, 0.18, mat(p.button, { emissive: p.accent, emissiveIntensity: 0.3 }), 0.75, 2.05, 0.9, 'btn-3'));

  // Screen housing sits further back
  root.add(box(2.4, 1.9, 1.0, body, 0, 3.0, -0.35));
  root.add(box(2.0, 1.35, 0.1, frame, 0, 3.05, 0.2));
  root.add(box(1.75, 1.15, 0.06, screen, 0, 3.05, 0.28, 'screen'));
  root.add(box(0.06, 1.0, 0.05, frame, -0.58, 3.05, 0.32));
  root.add(box(0.06, 1.0, 0.05, frame, 0.58, 3.05, 0.32));

  // Big marquee
  root.add(box(2.7, 0.65, 0.8, dark, 0, 4.15, -0.15));
  root.add(box(2.4, 0.4, 0.1, panel, 0, 4.2, 0.28, 'marquee'));
  root.add(box(2.2, 0.1, 0.08, trim, 0, 3.92, 0.3, 'marquee-underline'));
  addCoinBadge(root, p, 0, 4.2, 0.38, 0.62);
  addShadow(root, 1.6);
  root.position.set(0, -2.15, 0);
  return root;
}

/** Tall punch / strength style (emerald). */
function buildEmerald(p: CabinetPalette): THREE.Group {
  const root = new THREE.Group();
  const body = mat(p.body);
  const dark = mat(p.bodyDark);
  const trim = metalBand(p, true);
  const panel = mat(p.panel);
  const screen = mat(p.screen, { emissive: p.accent, emissiveIntensity: 0.28 });
  const frame = mat(p.accent, { emissive: p.accentGlow, emissiveIntensity: 0.5 });

  root.add(box(1.9, 0.2, 1.4, dark, 0, 0.1, 0));
  root.add(box(1.7, 2.4, 1.2, body, 0, 1.35, 0));
  root.add(box(0.12, 2.2, 0.12, trim, -0.95, 1.4, 0.45, 'led-left'));
  root.add(box(0.12, 2.2, 0.12, trim, 0.95, 1.4, 0.45, 'led-right'));
  // Hazard stripes strip
  root.add(box(1.75, 0.2, 1.25, trim, 0, 2.0, 0, 'rainbow-belt'));

  const deck = box(1.8, 0.14, 0.9, panel, 0, 2.65, 0.5);
  deck.rotation.x = -0.4;
  root.add(deck);
  addControls(root, p, 2.85, 0.8);

  root.add(box(1.7, 1.5, 1.05, body, 0, 3.6, -0.05));
  root.add(box(1.35, 1.05, 0.1, frame, 0, 3.65, 0.5));
  root.add(box(1.15, 0.88, 0.06, screen, 0, 3.65, 0.58, 'screen'));

  // Tall pointed marquee
  root.add(box(1.9, 0.7, 0.6, dark, 0, 4.55, 0.05));
  root.add(box(1.2, 0.35, 0.35, trim, 0, 5.05, 0.05));
  root.add(box(1.55, 0.35, 0.1, panel, 0, 4.55, 0.38, 'marquee'));
  addCoinBadge(root, p, 0, 4.55, 0.48, 0.48);
  addShadow(root, 1.2);
  root.position.set(0, -2.35, 0);
  return root;
}

/** Angled racing / deluxe cab (diamond). */
function buildDiamond(p: CabinetPalette): THREE.Group {
  const root = new THREE.Group();
  const body = mat(p.body, { metalness: 0.35 });
  const dark = mat(p.bodyDark);
  const trim = metalBand(p);
  const panel = mat(p.panel);
  const screen = mat(p.screen, { emissive: p.accent, emissiveIntensity: 0.35 });
  const frame = mat(p.trim, { emissive: p.accent, emissiveIntensity: 0.55 });

  root.add(box(2.3, 0.2, 1.8, dark, 0, 0.1, 0.1));
  root.add(box(2.1, 1.2, 1.6, body, 0, 0.8, 0.05));
  // Side wings
  root.add(box(0.35, 0.9, 1.2, trim, -1.25, 0.9, 0.1));
  root.add(box(0.35, 0.9, 1.2, trim, 1.25, 0.9, 0.1));

  // Deep seated control bay
  root.add(box(2.2, 0.5, 1.5, panel, 0, 1.65, 0.35));
  const wheel = box(0.7, 0.12, 0.7, mat(p.trim, { metalness: 0.6 }), 0, 2.0, 0.85);
  wheel.rotation.x = -0.5;
  root.add(wheel);
  addControls(root, p, 2.05, 0.55, { joyX: -0.7, wide: true });

  // Forward-leaning screen pod
  const pod = box(2.0, 1.6, 0.9, body, 0, 3.0, -0.2);
  pod.rotation.x = -0.18;
  root.add(pod);
  root.add(box(1.6, 1.15, 0.1, frame, 0, 3.05, 0.35));
  root.add(box(1.4, 0.98, 0.06, screen, 0, 3.05, 0.42, 'screen'));

  root.add(box(2.15, 0.5, 0.7, dark, 0, 4.05, -0.15));
  root.add(box(1.85, 0.28, 0.1, panel, 0, 4.08, 0.25, 'marquee'));
  root.add(box(1.7, 0.08, 0.08, trim, 0, 3.88, 0.28, 'marquee-underline'));
  addCoinBadge(root, p, 0, 4.08, 0.35, 0.5);
  addShadow(root, 1.45);
  root.position.set(0, -2.15, 0);
  return root;
}

/** Neon cyber cab (iridium). */
function buildIridium(p: CabinetPalette): THREE.Group {
  const root = new THREE.Group();
  const body = mat(p.body);
  const dark = mat(p.bodyDark);
  const trim = metalBand(p);
  const panel = mat(p.panel);
  const screen = mat(p.screen, { emissive: p.accent, emissiveIntensity: 0.4 });
  const neon = mat(p.trim, { emissive: p.accentGlow, emissiveIntensity: 0.7, metalness: 0.2 });

  root.add(box(2.0, 0.18, 1.4, dark, 0, 0.09, 0));
  root.add(box(1.85, 1.5, 1.25, body, 0, 0.95, 0));
  // Neon outline rings
  root.add(box(1.95, 0.1, 1.35, neon, 0, 0.35, 0));
  root.add(box(1.95, 0.1, 1.35, neon, 0, 1.55, 0, 'rainbow-belt'));
  root.add(box(0.1, 1.3, 0.1, neon, -0.98, 0.95, 0.55, 'led-left'));
  root.add(box(0.1, 1.3, 0.1, neon, 0.98, 0.95, 0.55, 'led-right'));

  const deck = box(1.95, 0.14, 1.0, panel, 0, 1.9, 0.55);
  deck.rotation.x = -0.45;
  root.add(deck);
  addControls(root, p, 2.15, 0.9, { wide: true });

  root.add(box(1.85, 1.8, 1.05, body, 0, 3.05, -0.1));
  root.add(box(1.5, 1.3, 0.12, neon, 0, 3.1, 0.45));
  root.add(box(1.3, 1.1, 0.06, screen, 0, 3.1, 0.55, 'screen'));
  // Diagonal neon slash
  const slash = box(0.1, 1.4, 0.08, neon, 0.55, 3.1, 0.6);
  slash.rotation.z = 0.35;
  root.add(slash);

  root.add(box(2.05, 0.55, 0.65, dark, 0, 4.2, 0.05));
  root.add(box(1.75, 0.32, 0.1, panel, 0, 4.22, 0.4, 'marquee'));
  root.add(box(1.6, 0.08, 0.08, trim, 0, 3.98, 0.42, 'marquee-underline'));
  addCoinBadge(root, p, 0, 4.22, 0.5, 0.52);
  addShadow(root, 1.25);
  root.position.set(0, -2.2, 0);
  return root;
}

/** Event mega-cab with stepped silhouette (ultra). */
function buildUltra(p: CabinetPalette): THREE.Group {
  const root = new THREE.Group();
  const body = mat(p.body);
  const dark = mat(p.bodyDark);
  const trim = metalBand(p);
  const panel = mat(p.panel);
  const screen = mat(p.screen, { emissive: p.accent, emissiveIntensity: 0.35 });
  const frame = mat(p.trim, { emissive: p.accentGlow, emissiveIntensity: 0.55 });

  // Stepped base
  root.add(box(2.6, 0.2, 1.7, dark, 0, 0.1, 0));
  root.add(box(2.3, 0.7, 1.5, body, 0, 0.55, 0));
  root.add(box(2.0, 0.9, 1.35, body, 0, 1.35, 0));
  root.add(box(2.35, 0.14, 1.55, trim, 0, 0.95, 0, 'rainbow-belt'));

  const deck = box(2.2, 0.16, 1.1, panel, 0, 2.0, 0.55);
  deck.rotation.x = -0.32;
  root.add(deck);
  addControls(root, p, 2.2, 0.9, { joyX: -0.75, wide: true });
  root.add(box(0.18, 0.1, 0.18, mat(p.button, { emissive: p.accent, emissiveIntensity: 0.4 }), 0.75, 2.2, 0.9));

  // Twin screen look
  root.add(box(2.1, 1.75, 1.1, body, 0, 3.15, -0.05));
  root.add(box(0.85, 1.15, 0.1, frame, -0.5, 3.2, 0.52));
  root.add(box(0.85, 1.15, 0.1, frame, 0.5, 3.2, 0.52));
  root.add(box(0.72, 1.0, 0.06, screen, -0.5, 3.2, 0.58, 'screen'));
  root.add(box(0.72, 1.0, 0.06, screen, 0.5, 3.2, 0.58));

  root.add(box(2.4, 0.7, 0.75, dark, 0, 4.25, 0.05));
  root.add(box(2.1, 0.4, 0.12, panel, 0, 4.3, 0.42, 'marquee'));
  root.add(box(1.9, 0.1, 0.1, trim, 0, 4.0, 0.45, 'marquee-underline'));
  addCoinBadge(root, p, 0, 4.3, 0.52, 0.58);
  addShadow(root, 1.55);
  root.position.set(0, -2.25, 0);
  return root;
}

const BUILDERS: Record<GachaCabinetTier, (p: CabinetPalette) => THREE.Group> = {
  bronze: buildBronze,
  silver: buildSilver,
  gold: buildGold,
  emerald: buildEmerald,
  diamond: buildDiamond,
  iridium: buildIridium,
  ultra: buildUltra,
};

export function buildArcadeMachine(tierId: string = 'bronze'): THREE.Group {
  const key = (tierId in PALETTES ? tierId : 'bronze') as GachaCabinetTier;
  const palette = PALETTES[key];
  const root = BUILDERS[key](palette);
  root.name = `arcade-${key}`;
  root.userData.tierId = key;
  root.userData.palette = palette;
  return root;
}

export function disposeArcadeMachine(root: THREE.Group) {
  const disposedMats = new Set<THREE.Material>();
  const disposedTex = new Set<THREE.Texture>();
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const m of materials) {
      if (disposedMats.has(m)) continue;
      disposedMats.add(m);
      if (m instanceof THREE.MeshStandardMaterial) {
        if (m.map && !disposedTex.has(m.map)) {
          disposedTex.add(m.map);
          m.map.dispose();
        }
        if (m.emissiveMap && !disposedTex.has(m.emissiveMap)) {
          disposedTex.add(m.emissiveMap);
          m.emissiveMap.dispose();
        }
      }
      m.dispose();
    }
  });
}
