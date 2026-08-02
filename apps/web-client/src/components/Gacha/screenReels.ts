import * as THREE from 'three';
import {
  applySpinEase,
  GACHA_SPIN_TARGET_INDEX,
  type GachaSpinEase,
  type GachaSpinSync,
} from './gachaSpinSync';

const FALLBACK_ITEMS = [
  '/images/items/Diamond_JE3_BE3.png',
  '/images/items/Emerald_JE3_BE3.png',
  '/images/items/Netherite_Ingot_JE1_BE2.png',
];

type ReelState = {
  pos: number;
};

export type ScreenReelsController = {
  texture: THREE.CanvasTexture;
  update: (dt: number) => void;
  playSpin: (config: GachaSpinSync) => void;
  setStrips: (strips: [string[], string[], string[]], options?: { resetPosition?: boolean }) => void;
  dispose: () => void;
  ready: Promise<void>;
};

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function createScreenReels(accent = '#5eead4'): ScreenReelsController {
  const W = 384;
  const H = 384;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  const cell = 88;
  const gap = 14;
  const pitch = cell + gap;
  const colsX = [0, 1, 2].map((i) => Math.floor((W - (cell * 3 + gap * 2)) / 2) + i * pitch);
  const viewTop = Math.floor((H - (cell * 3 + gap * 2)) / 2);
  const viewH = cell * 3 + gap * 2;
  const targetPos = GACHA_SPIN_TARGET_INDEX * pitch;

  const imageCache = new Map<string, HTMLImageElement | null>();
  const fallbackImages: HTMLImageElement[] = [];
  let strips: [string[], string[], string[]] = [
    [...FALLBACK_ITEMS],
    [...FALLBACK_ITEMS],
    [...FALLBACK_ITEMS],
  ];

  const reels: ReelState[] = [{ pos: 0 }, { pos: 0 }, { pos: 0 }];

  let spinning = false;
  let spinElapsed = 0;
  let spinDurations: [number, number, number] = [4, 5, 6];
  let spinEase: GachaSpinEase = 'power4.inOut';

  const cacheImage = async (url: string) => {
    if (imageCache.has(url)) return;
    const img = await loadImage(url);
    imageCache.set(url, img);
  };

  const preloadStrips = async (next: [string[], string[], string[]]) => {
    const urls = new Set<string>();
    for (const col of next) {
      for (const url of col) urls.add(url);
    }
    await Promise.all([...urls].map(cacheImage));
  };

  const ready = Promise.all(FALLBACK_ITEMS.map(loadImage)).then((imgs) => {
    for (const img of imgs) {
      if (img) {
        fallbackImages.push(img);
        imageCache.set(FALLBACK_ITEMS[fallbackImages.length - 1], img);
      }
    }
    draw();
    texture.needsUpdate = true;
  });

  function stripIcon(reel: number, slot: number): HTMLImageElement | null {
    const col = strips[reel];
    if (!col?.length) {
      if (!fallbackImages.length) return null;
      return fallbackImages[Math.abs(slot) % fallbackImages.length];
    }
    const url = col[((slot % col.length) + col.length) % col.length];
    return imageCache.get(url) ?? fallbackImages[0] ?? null;
  }

  function draw() {
    ctx.fillStyle = '#04060a';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#0b1018';
    ctx.fillRect(20, 20, W - 40, H - 40);

    ctx.save();
    ctx.beginPath();
    ctx.rect(colsX[0] - 10, viewTop - 8, cell * 3 + gap * 2 + 20, viewH + 16);
    ctx.clip();

    for (let c = 0; c < 3; c++) {
      const x = colsX[c];
      ctx.fillStyle = '#060910';
      ctx.fillRect(x - 4, viewTop - 4, cell + 8, viewH + 8);

      const base = reels[c].pos;
      const first = Math.floor(base / pitch) - 1;
      for (let k = 0; k < 6; k++) {
        const slot = first + k;
        const y = viewTop + (slot * pitch - base);
        const img = stripIcon(c, slot);
        if (!img) continue;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, x + 8, y + 8, cell - 16, cell - 16);
      }

      const fade = ctx.createLinearGradient(0, viewTop, 0, viewTop + viewH);
      fade.addColorStop(0, 'rgba(4,6,10,0.92)');
      fade.addColorStop(0.22, 'rgba(4,6,10,0)');
      fade.addColorStop(0.78, 'rgba(4,6,10,0)');
      fade.addColorStop(1, 'rgba(4,6,10,0.92)');
      ctx.fillStyle = fade;
      ctx.fillRect(x - 4, viewTop - 4, cell + 8, viewH + 8);
    }
    ctx.restore();

    const payY = viewTop + pitch + cell / 2;
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(colsX[0] - 16, payY - 1.5, cell * 3 + gap * 2 + 32, 3);
    ctx.fillRect(colsX[0] - 18, payY - 16, 7, 32);
    ctx.fillRect(colsX[2] + cell + 11, payY - 16, 7, 32);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(180,200,220,0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, W - 44, H - 44);
  }

  function setStrips(next: [string[], string[], string[]], options?: { resetPosition?: boolean }) {
    strips = next;
    if (options?.resetPosition) {
      for (let i = 0; i < 3; i++) {
        reels[i].pos = 0;
      }
    }
    void preloadStrips(next).then(() => {
      draw();
      texture.needsUpdate = true;
    });
  }

  function playSpin(config: GachaSpinSync) {
    strips = config.strips;
    spinDurations = [...config.durations];
    spinEase = config.ease;
    spinElapsed = 0;
    spinning = true;

    for (let i = 0; i < 3; i++) {
      reels[i].pos = 0;
    }

    void preloadStrips(config.strips).then(() => {
      draw();
      texture.needsUpdate = true;
    });
  }

  function update(dt: number) {
    if (spinning) {
      spinElapsed += dt;
      let done = 0;

      for (let i = 0; i < 3; i++) {
        const duration = spinDurations[i];
        const t = duration > 0 ? Math.min(1, spinElapsed / duration) : 1;
        reels[i].pos = applySpinEase(spinEase, t) * targetPos;
        if (t >= 1) done += 1;
      }

      if (done === 3) {
        spinning = false;
        for (let i = 0; i < 3; i++) {
          reels[i].pos = targetPos;
        }
      }
    }

    draw();
    texture.needsUpdate = true;
  }

  return {
    texture,
    update,
    playSpin,
    setStrips,
    ready,
    dispose: () => texture.dispose(),
  };
}

export function bindScreenReels(
  root: THREE.Object3D,
  controller: ScreenReelsController,
  accent = '#5eead4'
) {
  const screen = root.getObjectByName('screen') || root.getObjectByName('screen_l');
  if (!screen) return false;

  controller.texture.flipY = false;
  controller.texture.needsUpdate = true;

  screen.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
      mat.map = controller.texture;
      mat.emissiveMap = controller.texture;
      mat.emissive = new THREE.Color(accent);
      mat.emissiveIntensity = 0.3;
      mat.metalness = 0;
      mat.roughness = 0.85;
      mat.needsUpdate = true;
    }
  });
  return true;
}
