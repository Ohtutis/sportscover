// The free photo check under the step-4 thumbnails (owner, 2026-10-06: "could a checker say whether the photo
// is good or not — but not if it starts using AI credits"). Pure browser JavaScript on the parent's own device:
// no network, no model, no dependency. Each accepted photo is decoded with createImageBitmap, drawn at most
// CHECK_EDGE px on its long edge and measured — its pixel size, its sharpness (the variance of a 3×3 Laplacian
// on the grey image, box-averaged 2 × 2 first so the browser's own resampler cannot swing it), its brightness,
// a screenshot heuristic and an 8×8 average hash for "the same shot twice".
//
// The verdict is advice printed under the thumbnail. It never blocks the submit, never changes the request
// the server receives, and never shows a score.
//
// What it cannot tell: whether there is a face at all, whether both eyes show, which way the head is turned,
// whether the athlete is the closest person, whether the kit is in the picture. Those stay with the owner's
// same-day check (`npm run art:intake`), which is why "Looks sharp" is the strongest thing this file says.
//
// Everything above the browser runner is a pure function of pixel buffers, unit-tested in node
// (tests/intake-photos.test.ts) on synthetic images and calibrated on the repo's own examples.

/** The long edge the photo is measured at. Sharpness is scale-dependent: the thresholds below assume it. */
export const CHECK_EDGE = 1024;

/**
 * Calibrated 2026-10-06 on the repo's audited examples, each measured the way the browser does (long edge
 * ≤ CHECK_EDGE, then halved): the twelve `hero.story.*.before.*` phone photos (good, sharpness 231–2263)
 * against the twenty listing `bad-*.png` takes (whole-frame blur 3–44). docs/f1/ASSETS-RENDERS.md
 * "Free-proof example gallery and the photo check (2026-10-06)" has every measured value.
 */
export const CHECK_LIMITS = {
  /** Long edge in pixels below which the photo is "very small". */
  tinyEdge: 600,
  /** Long edge in pixels below which the photo is "small" — a phone camera's original is 3000 px or more. */
  smallEdge: 1000,
  /**
   * Laplacian variance (grey levels², on the grey image halved from ≤ CHECK_EDGE px) below which the photo
   * "looks blurry". Set low on purpose: a false "blurry" on a good photo costs more trust than a missed soft one.
   */
  blurry: 60,
  /** Mean luminance (0–255) below which the photo is dark. */
  dark: 60,
  /** Mean luminance (0–255) above which the photo is washed out. */
  bright: 230,
  /** Two photos of the same pixel size whose 64-bit average hashes differ in at most this many bits are the same shot. */
  sameShotBits: 4,
} as const;

/** Wall-clock budget for decoding one photo; a file that takes longer is left to the owner's check. */
export const DECODE_TIMEOUT_MS = 8000;

export type PhotoVerdict = "good" | "check" | "unchecked";

/** The fixed reasons; the words live in lib/intake/copy.ts `INTAKE_COPY.photoCheck.reasons`. */
export const PHOTO_CHECK_REASONS = ["sharp", "blurry", "tiny", "small", "dark", "bright", "screenshot", "duplicate", "heic", "unreadable"] as const;
export type PhotoCheckReason = (typeof PHOTO_CHECK_REASONS)[number];

/** What one photo measured (the original pixel size, then the three readings taken at ≤ CHECK_EDGE). */
export interface PhotoMeasure {
  width: number;
  height: number;
  /** Variance of the 3×3 Laplacian of the grey image. */
  sharpness: number;
  /** Mean grey level, 0–255. */
  luminance: number;
  /** 8×8 average hash, 16 hex characters. */
  hash: string;
}

export type PhotoReading = { kind: "measured"; measure: PhotoMeasure } | { kind: "unchecked"; reason: "heic" | "unreadable" };

/** A verdict and at most two reasons, most useful first. */
export interface PhotoCheck {
  verdict: PhotoVerdict;
  reasons: PhotoCheckReason[];
}

/** The two facts of a File the heuristics read (a plain object in tests). */
export interface FileFacts {
  name: string;
  type: string;
}

// --- pixels -----------------------------------------------------------------------------------------

/** RGBA bytes → grey levels (Rec. 601 luma, 0–255). Alpha is ignored: a phone photo has none. */
export function toGray(rgba: ArrayLike<number>, width: number, height: number): Float32Array {
  const n = width * height;
  const gray = new Float32Array(n);
  for (let i = 0, j = 0; i < n; i += 1, j += 4) gray[i] = 0.299 * rgba[j] + 0.587 * rgba[j + 1] + 0.114 * rgba[j + 2];
  return gray;
}

/**
 * The grey image box-averaged 2 × 2 (a trailing odd row or column is dropped). Measuring after this step makes
 * the sharpness reading nearly independent of how the browser scaled the photo down: bilinear, Mitchell and
 * Lanczos decodes of the same photo land within ~1.6× of each other here, against 2–17× before it.
 */
export function halve(gray: ArrayLike<number>, width: number, height: number): { gray: Float32Array; width: number; height: number } {
  const w = Math.floor(width / 2);
  const h = Math.floor(height / 2);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    const top = 2 * y * width;
    for (let x = 0; x < w; x += 1) {
      const i = top + 2 * x;
      out[y * w + x] = (gray[i] + gray[i + 1] + gray[i + width] + gray[i + width + 1]) / 4;
    }
  }
  return { gray: out, width: w, height: h };
}

/** Mean grey level, 0–255. */
export function meanLuminance(gray: ArrayLike<number>): number {
  if (!gray.length) return 0;
  let sum = 0;
  for (let i = 0; i < gray.length; i += 1) sum += gray[i];
  return sum / gray.length;
}

/**
 * Sharpness: the variance of the 4-neighbour Laplacian (0 1 0 / 1 −4 1 / 0 1 0) over the interior pixels.
 * Fine detail — hair, eyelashes, fabric — makes it large; motion blur and a missed focus make it small.
 */
export function laplacianVariance(gray: ArrayLike<number>, width: number, height: number): number {
  if (width < 3 || height < 3) return 0;
  let sum = 0;
  let squares = 0;
  for (let y = 1; y < height - 1; y += 1) {
    const row = y * width;
    for (let x = 1; x < width - 1; x += 1) {
      const i = row + x;
      const l = gray[i - 1] + gray[i + 1] + gray[i - width] + gray[i + width] - 4 * gray[i];
      sum += l;
      squares += l * l;
    }
  }
  const n = (width - 2) * (height - 2);
  const mean = sum / n;
  return squares / n - mean * mean;
}

/**
 * The 8×8 average hash: the image cut into an 8 × 8 grid of blocks, one bit per block — set when the block is
 * brighter than the mean of the 64 blocks. Returned as 16 hex characters, row by row.
 */
export function averageHash(gray: ArrayLike<number>, width: number, height: number): string {
  const blocks = new Float64Array(64);
  const counts = new Float64Array(64);
  for (let y = 0; y < height; y += 1) {
    const by = Math.min(7, Math.floor((y * 8) / height));
    for (let x = 0; x < width; x += 1) {
      const b = by * 8 + Math.min(7, Math.floor((x * 8) / width));
      blocks[b] += gray[y * width + x];
      counts[b] += 1;
    }
  }
  let mean = 0;
  for (let b = 0; b < 64; b += 1) {
    blocks[b] = counts[b] ? blocks[b] / counts[b] : 0;
    mean += blocks[b] / 64;
  }
  let hex = "";
  for (let nibble = 0; nibble < 16; nibble += 1) {
    let v = 0;
    for (let k = 0; k < 4; k += 1) v = (v << 1) | (blocks[nibble * 4 + k] > mean ? 1 : 0);
    hex += v.toString(16);
  }
  return hex;
}

/** How many of the 64 bits differ between two hashes (64 when either is malformed). */
export function hashDistance(a: string, b: string): number {
  if (a.length !== 16 || b.length !== 16) return 64;
  let bits = 0;
  for (let i = 0; i < 16; i += 1) {
    let v = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    if (Number.isNaN(v)) return 64;
    while (v) {
      bits += v & 1;
      v >>= 1;
    }
  }
  return bits;
}

/** The size a photo is measured at: never upscaled, the long edge at most `edge`. */
export function fitWithin(width: number, height: number, edge = CHECK_EDGE): { width: number; height: number } {
  const long = Math.max(width, height);
  if (long <= edge) return { width, height };
  const k = edge / long;
  return { width: Math.max(1, Math.round(width * k)), height: Math.max(1, Math.round(height * k)) };
}

/**
 * The readings of one decoded photo, from its RGBA bytes at the decode size (long edge ≤ CHECK_EDGE) and its
 * original pixel size. Sharpness, brightness and the hash are all read on the halved grey image.
 */
export function measurePixels(rgba: ArrayLike<number>, width: number, height: number, original: { width: number; height: number }): PhotoMeasure {
  const half = halve(toGray(rgba, width, height), width, height);
  return {
    width: original.width,
    height: original.height,
    sharpness: laplacianVariance(half.gray, half.width, half.height),
    luminance: meanLuminance(half.gray),
    hash: averageHash(half.gray, half.width, half.height),
  };
}

// --- file heuristics --------------------------------------------------------------------------------

/** HEIC / HEIF — most browsers outside Safari cannot decode them. */
export const isHeicFile = (f: FileFacts): boolean => /\.(heic|heif)$/i.test(f.name) || /hei[cf]/i.test(f.type);

/** Phone and tablet screen shapes, portrait (width : height), for the PNG test. */
const SCREEN_ASPECTS = [9 / 19.5, 9 / 16, 3 / 4, 9 / 20, 9 / 18, 9 / 21] as const;

/** Exact screen sizes in pixels (portrait) of common phones and tablets — a camera never writes these. */
const SCREEN_SIZES: readonly (readonly [number, number])[] = [
  [640, 1136], [750, 1334], [1242, 2208], [1125, 2436], [828, 1792], [1242, 2688], [1080, 2340], [1170, 2532],
  [1284, 2778], [1179, 2556], [1290, 2796], [1206, 2622], [1320, 2868],
  [720, 1280], [720, 1600], [1080, 1920], [1080, 2160], [1080, 2280], [1080, 2400], [1080, 2412], [1080, 2424],
  [1440, 2560], [1440, 2960], [1440, 3040], [1440, 3088], [1440, 3120], [1440, 3200], [1344, 2992], [1280, 2856],
  [1536, 2048], [1620, 2160], [1640, 2360], [1668, 2224], [1668, 2388], [2048, 2732], [1488, 2266],
];

/**
 * A screenshot rather than the original photo: a PNG in a phone-screen shape (9 : 19.5, 9 : 16, 3 : 4 … within
 * 1 %), or any file at an exact phone or tablet screen size. Either orientation.
 */
export function looksLikeScreenshot(f: FileFacts, width: number, height: number): boolean {
  if (!width || !height) return false;
  const w = Math.min(width, height);
  const h = Math.max(width, height);
  if (SCREEN_SIZES.some(([sw, sh]) => sw === w && sh === h)) return true;
  const png = /\.png$/i.test(f.name) || /png/i.test(f.type);
  return png && SCREEN_ASPECTS.some((a) => Math.abs(w / h - a) / a <= 0.01);
}

// --- verdicts ---------------------------------------------------------------------------------------

export interface CheckItem {
  id: string;
  file: FileFacts;
  /** null while the photo is still being read. */
  reading: PhotoReading | null;
}

/**
 * Every photo's verdict, in list order (null = still being read), reasons ranked: the same shot, blurry, a
 * screenshot or a small file, dark or washed out. A photo is "the same shot" when an EARLIER
 * photo has its pixel size and an average hash within CHECK_LIMITS.sameShotBits — so the first of a burst stays
 * clean and only the repeats are flagged; removing the first clears the next one automatically.
 */
export function judgePhotos(items: readonly CheckItem[]): (PhotoCheck | null)[] {
  const seen: PhotoMeasure[] = [];
  return items.map(({ file, reading }) => {
    if (!reading) return null;
    if (reading.kind === "unchecked") return { verdict: "unchecked", reasons: [reading.reason] };
    const m = reading.measure;
    const reasons: PhotoCheckReason[] = [];
    if (seen.some((s) => s.width === m.width && s.height === m.height && hashDistance(s.hash, m.hash) <= CHECK_LIMITS.sameShotBits)) reasons.push("duplicate");
    seen.push(m);
    // Most useful first: a blurred photo has to be replaced, while "send the original" fixes size, not blur.
    if (m.sharpness < CHECK_LIMITS.blurry) reasons.push("blurry");
    const long = Math.max(m.width, m.height);
    if (looksLikeScreenshot(file, m.width, m.height)) reasons.push("screenshot");
    else if (long < CHECK_LIMITS.tinyEdge) reasons.push("tiny");
    else if (long < CHECK_LIMITS.smallEdge) reasons.push("small");
    if (m.luminance < CHECK_LIMITS.dark) reasons.push("dark");
    else if (m.luminance > CHECK_LIMITS.bright) reasons.push("bright");
    return reasons.length ? { verdict: "check", reasons: reasons.slice(0, 2) } : { verdict: "good", reasons: ["sharp"] };
  });
}

export type CheckSummary =
  | { kind: "none" }
  | { kind: "checking" }
  | { kind: "done"; good: number; checked: number; flagged: number; unchecked: number };

/** The line under the counter: nothing yet, still reading, or how many of the readable photos look good. */
export function summarizeChecks(checks: readonly (PhotoCheck | null)[]): CheckSummary {
  if (!checks.length) return { kind: "none" };
  if (checks.some((c) => c === null)) return { kind: "checking" };
  const done = checks as PhotoCheck[];
  const good = done.filter((c) => c.verdict === "good").length;
  const flagged = done.filter((c) => c.verdict === "check").length;
  return { kind: "done", good, checked: good + flagged, flagged, unchecked: done.length - good - flagged };
}

// --- the browser runner -----------------------------------------------------------------------------

type Bitmap = { width: number; height: number; close(): void };
type Canvas2D = {
  drawImage(image: Bitmap, dx: number, dy: number, dw: number, dh: number): void;
  getImageData(sx: number, sy: number, sw: number, sh: number): { data: Uint8ClampedArray };
  imageSmoothingEnabled: boolean;
  imageSmoothingQuality: "low" | "medium" | "high";
};

function canvas2d(width: number, height: number): Canvas2D | null {
  if (typeof OffscreenCanvas !== "undefined") {
    const c = new OffscreenCanvas(width, height).getContext("2d", { willReadFrequently: true });
    if (c) return c as unknown as Canvas2D;
  }
  if (typeof document === "undefined") return null;
  const el = document.createElement("canvas");
  el.width = width;
  el.height = height;
  return el.getContext("2d", { willReadFrequently: true }) as unknown as Canvas2D | null;
}

/** Resolves on the next idle slice — at the latest after `timeout` ms, or a frame later where requestIdleCallback is missing (Safari). */
export function idle(timeout = 100): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === "function") requestIdleCallback(() => resolve(), { timeout });
    else setTimeout(resolve, 16);
  });
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/**
 * Reads one photo on this device. The decode runs off the main thread (createImageBitmap); the browser scales
 * it to the measuring size where it can, and the remaining main-thread work — one draw, one pixel read, three
 * passes over ≤ 1 MP — happens in an idle slice. HEIC that the browser cannot decode, or any file it cannot
 * read, comes back "unchecked": the owner looks at it instead.
 */
async function readPhoto(file: Blob & FileFacts): Promise<PhotoReading> {
  const heic = isHeicFile(file);
  if (typeof createImageBitmap !== "function") return { kind: "unchecked", reason: heic ? "heic" : "unreadable" };
  let full: ImageBitmap | null = null;
  let small: ImageBitmap | null = null;
  try {
    full = await withTimeout(createImageBitmap(file), DECODE_TIMEOUT_MS);
    const original = { width: full.width, height: full.height };
    const size = fitWithin(original.width, original.height);
    if (size.width !== original.width) {
      try {
        small = await createImageBitmap(full, { resizeWidth: size.width, resizeHeight: size.height, resizeQuality: "high" });
      } catch {
        small = null; // older engines without resize options: the canvas scales it below
      }
    }
    await idle();
    const ctx = canvas2d(size.width, size.height);
    if (!ctx) return { kind: "unchecked", reason: "unreadable" };
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(small ?? full, 0, 0, size.width, size.height);
    const { data } = ctx.getImageData(0, 0, size.width, size.height);
    return { kind: "measured", measure: measurePixels(data, size.width, size.height, original) };
  } catch {
    return { kind: "unchecked", reason: heic ? "heic" : "unreadable" };
  } finally {
    small?.close();
    full?.close();
  }
}

/**
 * A one-at-a-time queue: ten photos dropped together are read one after another, each measured in its own idle
 * slice, so the page never stalls. `cancel` forgets a photo that was removed; `dispose` stops everything.
 */
export function createPhotoQueue(onReading: (id: string, reading: PhotoReading) => void) {
  const waiting: { id: string; file: Blob & FileFacts }[] = [];
  const cancelled = new Set<string>();
  let running = false;
  let disposed = false;

  async function pump() {
    if (running) return;
    running = true;
    while (!disposed && waiting.length) {
      const next = waiting.shift()!;
      if (cancelled.has(next.id)) continue;
      const reading = await readPhoto(next.file); // waits for an idle slice itself, after the off-thread decode
      if (!disposed && !cancelled.has(next.id)) onReading(next.id, reading);
    }
    running = false;
  }

  return {
    add(id: string, file: Blob & FileFacts) {
      if (disposed) return;
      cancelled.delete(id);
      waiting.push({ id, file });
      void pump();
    },
    cancel(id: string) {
      cancelled.add(id);
    },
    dispose() {
      disposed = true;
      waiting.length = 0;
    },
  };
}
