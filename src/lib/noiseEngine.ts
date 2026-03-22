// ── Noise Generation Engine ──
// Pure TypeScript logic for value noise generation, SDF calculations, and rendering

export interface Corners {
  tl: number;
  tr: number;
  bl: number;
  br: number;
}

export interface SidesToggles {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface RenderParams {
  width: number;
  height: number;
  border: number;
  grainSize: number;
  amount: number;
  fade: number;
  bgColor: string;
  bgMode: 'color' | 'image';
  corners: Corners;
  sidesNoise: SidesToggles;
  sidesRadius: SidesToggles;
  uploadedImage: HTMLImageElement | null;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/**
 * Value noise generation using hash-based interpolation
 */
function valueNoise(w: number, h: number, blockSize: number): Float32Array {
  const out = new Float32Array(w * h);
  const bs = Math.max(1, blockSize);

  function h01(bx: number, by: number): number {
    let v = (bx * 1619 + by * 31337) | 0;
    v = Math.imul(v ^ (v >>> 8), 0x45d9f3b);
    v = Math.imul(v ^ (v >>> 8), 0x45d9f3b);
    v = v ^ (v >>> 8);
    return (v & 0x7fffffff) / 0x7fffffff;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const bx = (x / bs) | 0;
      const by = (y / bs) | 0;
      const tx = x / bs - bx;
      const ty = y / bs - by;
      const sx = tx * tx * (3 - 2 * tx);
      const sy = ty * ty * (3 - 2 * ty);
      out[y * w + x] =
        h01(bx, by) * (1 - sx) * (1 - sy) +
        h01(bx + 1, by) * sx * (1 - sy) +
        h01(bx, by + 1) * (1 - sx) * sy +
        h01(bx + 1, by + 1) * sx * sy;
    }
  }
  return out;
}

/**
 * SDF for a rect where each corner can have its own radius.
 * Uses per-corner radius and per-side radius flag.
 */
function sdfPerCorner(
  px: number,
  py: number,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  corners: Corners,
  sidesR: SidesToggles
): number {
  const rx = px - cx;
  const ry = py - cy;
  let cr: number;

  if (rx <= 0 && ry <= 0) {
    cr = sidesR.top && sidesR.left ? corners.tl : 0;
  } else if (rx > 0 && ry <= 0) {
    cr = sidesR.top && sidesR.right ? corners.tr : 0;
  } else if (rx <= 0 && ry > 0) {
    cr = sidesR.bottom && sidesR.left ? corners.bl : 0;
  } else {
    cr = sidesR.bottom && sidesR.right ? corners.br : 0;
  }

  const qx = Math.abs(rx) - (hw - cr);
  const qy = Math.abs(ry) - (hh - cr);
  return (
    cr -
    (Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) +
      Math.min(Math.max(qx, qy), 0))
  );
}

/**
 * Core render function — produces an offscreen canvas with the noise border applied.
 */
export function render(params: RenderParams): HTMLCanvasElement {
  const { width: tw, height: th, border, grainSize, amount, fade, bgColor, bgMode, corners, sidesNoise, sidesRadius, uploadedImage } = params;

  const off = document.createElement('canvas');
  off.width = tw;
  off.height = th;
  const octx = off.getContext('2d')!;

  // Draw base
  if (bgMode === 'image' && uploadedImage) {
    octx.drawImage(uploadedImage, 0, 0, tw, th);
  } else {
    octx.fillStyle = bgColor;
    octx.fillRect(0, 0, tw, th);
  }
  const bgData = octx.getImageData(0, 0, tw, th);

  const img = octx.createImageData(tw, th);
  const d = img.data;
  const noise = valueNoise(tw, th, Math.max(1, grainSize));
  const cx = tw / 2;
  const cy = th / 2;
  const hw = tw / 2;
  const hh = th / 2;

  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const i = (y * tw + x) * 4;
      const dist = sdfPerCorner(x + 0.5, y + 0.5, cx, cy, hw, hh, corners, sidesRadius);

      if (dist <= 0) {
        d[i + 3] = 0;
        continue;
      }

      const br = bgData.data[i];
      const bg2 = bgData.data[i + 1];
      const bb = bgData.data[i + 2];

      if (dist > border) {
        d[i] = br;
        d[i + 1] = bg2;
        d[i + 2] = bb;
        d[i + 3] = 255;
        continue;
      }

      // Which active noise sides are close?
      const px2 = x + 0.5;
      const py2 = y + 0.5;
      let minD = Infinity;
      if (sidesNoise.top && py2 <= border) minD = Math.min(minD, py2);
      if (sidesNoise.bottom && th - py2 <= border) minD = Math.min(minD, th - py2);
      if (sidesNoise.left && px2 <= border) minD = Math.min(minD, px2);
      if (sidesNoise.right && tw - px2 <= border) minD = Math.min(minD, tw - px2);

      if (minD === Infinity) {
        d[i] = br;
        d[i + 1] = bg2;
        d[i + 2] = bb;
        d[i + 3] = 255;
        continue;
      }

      const t = 1.0 - minD / border;
      const strength = Math.pow(t, fade);
      const cutoff = amount * strength;
      const n = noise[y * tw + x];

      if (n < cutoff) {
        d[i] = 0;
        d[i + 1] = 0;
        d[i + 2] = 0;
        d[i + 3] = 0;
      } else {
        d[i] = br;
        d[i + 1] = bg2;
        d[i + 2] = bb;
        d[i + 3] = 255;
      }
    }
  }
  octx.putImageData(img, 0, 0);
  return off;
}

/**
 * Export the canvas as a PNG blob
 */
export function exportPNG(params: RenderParams): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const off = render(params);
    off.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      'image/png'
    );
  });
}
