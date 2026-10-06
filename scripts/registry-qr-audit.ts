// Registry QR audit — every QR printed on a listing image must resolve to a registry record.
//
//   npx tsx scripts/registry-qr-audit.ts <dir|file> [more …] [--cache <file.json>] [--json <file>]
//                                        [--md <file>] [--jobs <n>] [--ocr | --ocr-all] [--no-hydrate] [--quiet]
//
//   npx tsx scripts/registry-qr-audit.ts etsy/listing-images
//   npx tsx scripts/registry-qr-audit.ts etsy/listing-images "Exportai Etsy" --ocr --cache /tmp/qr.json
//
// Walks the given paths, decodes every QR in every PNG / JPG / WebP and prints, for every distinct
// card URL (https://gamedayedition.com/c/<id>, apex or www), whether the id resolves in
// lib/registry/cards.ts, and the files it was decoded from. Payloads that are not a card URL are
// listed separately. Exit code 1 when a decoded card id does not resolve (no record, or deleted).
//
// Decoding: jsqr returns ONE symbol per call and loses a small code in a busy slide (two card backs
// side by side confuse its finder-pattern search), so every image is read at several scales — the
// whole image (≤ 2000 px), four overlapping quadrants, then sliding windows of 900 and 450 px at
// half-window stride (any symbol up to half a window lies wholly inside one window) — and after
// each hit the symbol is painted out and the same view is decoded again until it comes back empty.
// Hits of the same payload at the same spot count once. Decoding runs in `--jobs` worker processes
// (default 4; 0 = in this process).
//
// `--ocr` (macOS only): reads the card id PRINTED beside every decoded symbol, and every id printed
// anywhere on an image that carries a QR, with the Vision framework (through `osascript`). The text
// id is what a buyer types into /registry/lookup, and it is not always what the QR says: a card back
// whose `#qr` layer was never rebound reads `GDE-HE-ICH-2026-17` in type and encodes another card.
// Printed ids are a CHECK-BY-EYE list, not a gate: OCR misreads small type (2028 for 2026, a dropped
// digit), so only an id decoded from a QR decides the exit code. `--ocr-all` reads every image, not
// only the ones carrying a QR (a slide whose codes are too small to decode still prints ids).
//
// iCloud: this repo lives in iCloud Drive and media is evicted. Each file is hydrated right before it
// is read — `cat <file> >/dev/null`, then `find <file> -flags +dataless` must print nothing — strictly
// one file at a time, in the same priority order the decoders follow (likely QR carriers, then exported
// slides, then sources, then mockups), and never more than a few files ahead of the decoders. A file
// that stays dataless after three attempts is reported as not scanned, never guessed. `--no-hydrate`
// skips evicted files instead of downloading them.
//
// `--cache` keeps per-file results keyed by path + size + mtime, so a re-run after a registry change
// reads no image again; `--json` writes the raw per-file results, `--md` the report.

import { execFile, execFileSync, spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import jsQR from "jsqr";
import { getCard, visibilityOf, type CardRecord } from "../lib/registry/cards";
import { isArtPending } from "../lib/registry/art";
import { sportByCode } from "../lib/catalog/sports";

// ---------------------------------------------------------------------------------------------
// Options

interface Options {
  roots: string[];
  cache?: string;
  json?: string;
  md?: string;
  jobs: number;
  ocr: boolean;
  ocrAll: boolean;
  hydrate: boolean;
  quiet: boolean;
  worker: boolean;
}

const USAGE =
  "usage: registry-qr-audit <dir|file> [...] [--cache <file.json>] [--json <file>] [--md <file>] [--jobs <n>] [--ocr | --ocr-all] [--no-hydrate] [--quiet]";

function parseArgs(argv: string[]): Options {
  const o: Options = { roots: [], jobs: Math.max(1, Math.min(4, os.cpus().length - 1)), ocr: false, ocrAll: false, hydrate: true, quiet: false, worker: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) throw new Error(`${a} needs a value`);
      i += 1;
      return v;
    };
    if (a === "--cache") o.cache = next();
    else if (a === "--json") o.json = next();
    else if (a === "--md") o.md = next();
    else if (a === "--jobs") o.jobs = Math.max(0, Number.parseInt(next(), 10) || 0);
    else if (a === "--ocr") o.ocr = true;
    else if (a === "--ocr-all") o.ocr = o.ocrAll = true;
    else if (a === "--no-hydrate") o.hydrate = false;
    else if (a === "--quiet") o.quiet = true;
    else if (a === "--worker") o.worker = true;
    else if (a === "--help" || a === "-h") {
      console.log(USAGE);
      process.exit(0);
    } else if (a.startsWith("--")) throw new Error(`unknown argument ${a}`);
    else o.roots.push(a);
  }
  if (!o.worker && !o.roots.length) throw new Error(`name at least one directory or image to scan\n${USAGE}`);
  if (o.ocr && process.platform !== "darwin") throw new Error("--ocr needs macOS (Vision through osascript)");
  return o;
}

// ---------------------------------------------------------------------------------------------
// Constants

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), "..");
const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;
/** The working copy is never larger than this: a QR on a 6000 px render is not a small QR. */
const WORK_MAX = 3000;
/** The whole-image and quadrant views are downscaled to this. */
const VIEW_MAX = 2000;
/** Sliding windows, in working-copy pixels, each at half-window stride. */
const WINDOWS = [900, 450] as const;
/** Symbols painted out and re-decoded per view before giving up on that view. */
const MAX_HITS_PER_VIEW = 16;
/** Hydration attempts per evicted file. */
const HYDRATE_ATTEMPTS = 3;
/** Hydrated files allowed to wait for a decoder. Downloads themselves stay one at a time. */
const DOWNLOAD_LEAD = 4;
const CACHE_VERSION = 3;
const CARD_URL = /^https?:\/\/(?:www\.)?gamedayedition\.com\/c\/([A-Za-z0-9-]+)\/?$/;
const CARD_ID = /^GDE-([A-Z]{2})-([A-Z]{3})-(\d{4})-(\d{1,2})(?:-\d+)?$/;
/** Finish code → finish name; kept local so the report reads plainly. */
const FINISH_NAMES: Record<string, string> = {
  SN: "Stadium Night",
  CA: "Chrome All-Star",
  FS: "Fire & Smoke",
  HE: "Heritage",
  SS: "Signature Spotlight",
  PR: "Prism Rush",
  SR: "Senior Night",
};

const abs = (p: string) => (path.isAbsolute(p) ? p : path.join(ROOT, p));
const rel = (p: string) => path.relative(ROOT, abs(p)).split(path.sep).join("/");

// ---------------------------------------------------------------------------------------------
// Files and iCloud hydration

function walk(p: string, out: string[]): void {
  let st: fs.Stats;
  try {
    st = fs.lstatSync(p);
  } catch {
    return;
  }
  if (st.isSymbolicLink()) return;
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p).sort()) {
      if (e === "node_modules" || e === ".git" || e.startsWith("._")) continue;
      walk(path.join(p, e), out);
    }
  } else if (st.isFile() && IMAGE_EXT.test(p) && !path.basename(p).startsWith("._")) {
    out.push(p);
  }
}

const CAN_HYDRATE = process.platform === "darwin";

/** Every dataless (evicted) file under a root, in one `find` call. Empty off macOS. */
function datalessUnder(root: string): Set<string> {
  if (!CAN_HYDRATE) return new Set();
  const out = execFileSync("find", [root, "-type", "f", "-flags", "+dataless", "-print0"], { maxBuffer: 256 * 1024 * 1024 });
  return new Set(out.toString("utf8").split("\0").filter(Boolean));
}

/** `find <file> -flags +dataless` prints the path only while the file is still evicted. */
function isDataless(file: string): boolean {
  if (!CAN_HYDRATE) return false;
  try {
    return execFileSync("find", [file, "-flags", "+dataless"], { encoding: "utf8" }).trim().length > 0;
  } catch {
    return true;
  }
}

/** `cat <file> >/dev/null` — the download trigger. Resolves when cat exits. */
function catToNull(file: string): Promise<void> {
  return new Promise((resolve) => {
    const p = spawn("cat", [file], { stdio: ["ignore", "ignore", "ignore"] });
    p.on("close", () => resolve());
    p.on("error", () => resolve());
  });
}

async function hydrate(file: string): Promise<boolean> {
  for (let attempt = 0; attempt < HYDRATE_ATTEMPTS; attempt += 1) {
    if (!isDataless(file)) return true;
    await catToNull(file);
  }
  return !isDataless(file);
}

// ---------------------------------------------------------------------------------------------
// Decoding

interface Raw {
  data: Buffer;
  width: number;
  height: number;
}

export interface QrHit {
  data: string;
  /** Top-left corner and side of the symbol's bounding box, in source-image pixels. */
  x: number;
  y: number;
  size: number;
  /** With --ocr: the card id(s) printed beside this symbol. */
  label?: string[];
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const clamped = (r: Raw) => new Uint8ClampedArray(r.data.buffer, r.data.byteOffset, r.data.length);

function cropRaw(src: Raw, x: number, y: number, w: number, h: number): Raw {
  const out = Buffer.alloc(w * h * 4);
  for (let row = 0; row < h; row += 1) {
    const start = ((y + row) * src.width + x) * 4;
    src.data.copy(out, row * w * 4, start, start + w * 4);
  }
  return { data: out, width: w, height: h };
}

async function downscale(r: Raw, max: number): Promise<{ raw: Raw; factor: number }> {
  const longest = Math.max(r.width, r.height);
  if (longest <= max) return { raw: r, factor: 1 };
  const { data, info } = await sharp(r.data, { raw: { width: r.width, height: r.height, channels: 4 } })
    .resize({ width: max, height: max, fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { raw: { data, width: info.width, height: info.height }, factor: r.width / info.width };
}

function paintWhite(r: Raw, rect: Rect): void {
  const x0 = Math.max(0, Math.floor(rect.x0)), x1 = Math.min(r.width, Math.ceil(rect.x1));
  const y0 = Math.max(0, Math.floor(rect.y0)), y1 = Math.min(r.height, Math.ceil(rect.y1));
  for (let y = y0; y < y1; y += 1) r.data.fill(255, (y * r.width + x0) * 4, (y * r.width + x1) * 4);
}

/**
 * Decode one view until it comes back empty, painting each symbol out. `toSrc` maps a view pixel to
 * source-image pixels. A hit whose centre falls inside an already painted box ends the view (the
 * paint missed and jsqr would return the same symbol forever). An EMPTY payload is painted out but
 * not kept: on textured art jsqr now and then "decodes" a zero-byte symbol that no camera would
 * read, and nothing GDE prints is empty. Returns how many of those were dropped.
 */
function decodeView(view: Raw, toSrc: (x: number, y: number) => [number, number], scale: number, inversion: "attemptBoth" | "dontInvert", hits: QrHit[]): number {
  const painted: Rect[] = [];
  let empty = 0;
  for (let k = 0; k < MAX_HITS_PER_VIEW; k += 1) {
    const q = jsQR(clamped(view), view.width, view.height, { inversionAttempts: inversion });
    if (!q) return empty;
    const l = q.location;
    const xs = [l.topLeftCorner.x, l.topRightCorner.x, l.bottomLeftCorner.x, l.bottomRightCorner.x];
    const ys = [l.topLeftCorner.y, l.topRightCorner.y, l.bottomLeftCorner.y, l.bottomRightCorner.y];
    const box = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    const cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
    if (painted.some((p) => cx >= p.x0 && cx <= p.x1 && cy >= p.y0 && cy <= p.y1)) return empty;
    const [sx, sy] = toSrc(box.x0, box.y0);
    if (q.data.trim()) hits.push({ data: q.data, x: Math.round(sx), y: Math.round(sy), size: Math.round(Math.max(box.x1 - box.x0, box.y1 - box.y0) * scale) });
    else empty += 1;
    const pad = Math.max(4, 0.2 * Math.max(box.x1 - box.x0, box.y1 - box.y0));
    const rect = { x0: box.x0 - pad, y0: box.y0 - pad, x1: box.x1 + pad, y1: box.y1 + pad };
    painted.push(rect);
    paintWhite(view, rect);
  }
  return empty;
}

/** Start positions so windows of `size` at half-size stride cover [0, total) and the last one touches the edge. */
function windowStarts(total: number, size: number): number[] {
  if (total <= size) return [0];
  const stride = Math.floor(size / 2);
  const starts: number[] = [];
  for (let s = 0; s + size < total; s += stride) starts.push(s);
  starts.push(total - size);
  return starts;
}

/** Same payload at (nearly) the same spot = one symbol. */
function dedupe(hits: QrHit[]): QrHit[] {
  const out: QrHit[] = [];
  for (const h of hits) {
    const twin = out.find((o) => {
      const tol = Math.max(o.size, h.size) * 0.5;
      return o.data === h.data && Math.abs(o.x + o.size / 2 - (h.x + h.size / 2)) <= tol && Math.abs(o.y + o.size / 2 - (h.y + h.size / 2)) <= tol;
    });
    if (!twin) out.push(h);
  }
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}

export async function decodeImage(file: string): Promise<{ width: number; height: number; qrs: QrHit[]; emptyDropped: number }> {
  const meta = await sharp(file, { failOn: "none" }).metadata();
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = (rotated ? meta.height : meta.width) ?? 0;
  const height = (rotated ? meta.width : meta.height) ?? 0;
  const { data, info } = await sharp(file, { failOn: "none", limitInputPixels: false })
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize({ width: WORK_MAX, height: WORK_MAX, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const work: Raw = { data, width: info.width, height: info.height };
  const k = width ? width / work.width : 1; // working px → source px
  const hits: QrHit[] = [];
  let emptyDropped = 0;

  // 1. Whole image, 2. four overlapping quadrants — both colour senses (a light-on-dark code exists).
  const regions: Rect[] = [
    { x0: 0, y0: 0, x1: 1, y1: 1 },
    { x0: 0, y0: 0, x1: 0.6, y1: 0.6 },
    { x0: 0.4, y0: 0, x1: 1, y1: 0.6 },
    { x0: 0, y0: 0.4, x1: 0.6, y1: 1 },
    { x0: 0.4, y0: 0.4, x1: 1, y1: 1 },
  ];
  for (const r of regions) {
    const ox = Math.floor(r.x0 * work.width), oy = Math.floor(r.y0 * work.height);
    const w = Math.max(1, Math.floor((r.x1 - r.x0) * work.width)), h = Math.max(1, Math.floor((r.y1 - r.y0) * work.height));
    const { raw, factor } = await downscale(cropRaw(work, ox, oy, w, h), VIEW_MAX);
    emptyDropped += decodeView(raw, (x, y) => [(ox + x * factor) * k, (oy + y * factor) * k], factor * k, "attemptBoth", hits);
  }

  // 3. Sliding windows at working resolution — a small code beside other codes only decodes alone.
  for (const size of WINDOWS) {
    if (size >= Math.max(work.width, work.height) * 0.6) continue; // the quadrants already were this view
    for (const y of windowStarts(work.height, size)) {
      for (const x of windowStarts(work.width, size)) {
        const w = Math.min(size, work.width - x), h = Math.min(size, work.height - y);
        emptyDropped += decodeView(cropRaw(work, x, y, w, h), (vx, vy) => [(x + vx) * k, (y + vy) * k], k, "dontInvert", hits);
      }
    }
  }
  return { width, height, qrs: dedupe(hits), emptyDropped };
}

// ---------------------------------------------------------------------------------------------
// Decode workers — the same script with --worker: one image path per stdin line, one JSON reply per
// stdout line. Hydration never happens in a worker.

interface DecodeReply {
  ok: boolean;
  width?: number;
  height?: number;
  qrs?: QrHit[];
  emptyDropped?: number;
  error?: string;
  ms: number;
}

async function decodeReply(file: string): Promise<DecodeReply> {
  const t0 = Date.now();
  try {
    return { ok: true, ...(await decodeImage(file)), ms: Date.now() - t0 };
  } catch (err) {
    return { ok: false, error: (err as Error).message, ms: Date.now() - t0 };
  }
}

async function workerMain(): Promise<void> {
  sharp.concurrency(1);
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  let chain = Promise.resolve();
  rl.on("line", (line) => {
    chain = chain.then(async () => {
      process.stdout.write(`${JSON.stringify(await decodeReply(JSON.parse(line) as string))}\n`);
    });
  });
  await new Promise<void>((resolve) => rl.on("close", () => resolve()));
  await chain;
}

interface Decoder {
  decode(file: string): Promise<DecodeReply>;
  stop(): void;
}

function inProcessDecoder(): Decoder {
  return { decode: decodeReply, stop: () => undefined };
}

/** A worker process; respawned on the next file if it dies (a crash is reported for that one file). */
function workerDecoder(): Decoder {
  let proc: ChildProcess | null = null;
  let pending: ((r: DecodeReply) => void) | null = null;
  const start = () => {
    const p = spawn(process.execPath, [...process.execArgv, SELF, "--worker"], { stdio: ["pipe", "pipe", "inherit"] });
    readline.createInterface({ input: p.stdout!, crlfDelay: Infinity }).on("line", (line) => {
      const resolve = pending;
      pending = null;
      resolve?.(JSON.parse(line) as DecodeReply);
    });
    p.on("exit", (code) => {
      proc = null;
      const resolve = pending;
      pending = null;
      resolve?.({ ok: false, error: `decode worker exited (${code ?? "signal"})`, ms: 0 });
    });
    proc = p;
    return p;
  };
  return {
    decode(file) {
      const p = proc ?? start();
      return new Promise<DecodeReply>((resolve) => {
        pending = resolve;
        p.stdin!.write(`${JSON.stringify(file)}\n`);
      });
    },
    stop() {
      proc?.stdin?.end();
    },
  };
}

// ---------------------------------------------------------------------------------------------
// OCR (macOS Vision through osascript/JXA) — the ids PRINTED on an image, beside its QR codes.

const OCR_JXA = `ObjC.import("Foundation");
ObjC.import("Vision");
function run(argv) {
  const out = [];
  for (const p of argv) {
    const req = $.VNRecognizeTextRequest.alloc.init;
    req.recognitionLevel = 0;
    req.usesLanguageCorrection = false;
    const handler = $.VNImageRequestHandler.alloc.initWithURLOptions($.NSURL.fileURLWithPath(p), $.NSDictionary.dictionary);
    if (!handler.performRequestsError($.NSArray.arrayWithObject(req), null)) { out.push(JSON.stringify({ file: p, lines: [] })); continue; }
    const lines = [];
    const results = req.results;
    for (let i = 0; i < results.count; i++) {
      const cands = results.objectAtIndex(i).topCandidates(3);
      for (let j = 0; j < cands.count; j++) lines.push(cands.objectAtIndex(j).string.js);
    }
    out.push(JSON.stringify({ file: p, lines: lines }));
  }
  return out.join("\\n");
}`;

/** Card ids in OCR text. Tolerates the usual misreads: dash variants, spaces, O/0 and I/1 swaps. */
export function idsInText(lines: string[]): string[] {
  const found = new Set<string>();
  const re = /G\s*[D0O]\s*E\s*[-–—−_.]\s*([A-Z0-9]{2})\s*[-–—−_.]\s*([A-Z0-9]{3})\s*[-–—−_.]\s*([0-9OIL]{4})\s*[-–—−_.]\s*([0-9OIL]{1,2})(?![0-9])/g;
  const letters = (s: string) => s.replace(/0/g, "O").replace(/1/g, "I");
  const digits = (s: string) => s.replace(/O/g, "0").replace(/[IL]/g, "1");
  for (const line of lines) {
    for (const m of line.toUpperCase().matchAll(re)) {
      const id = `GDE-${letters(m[1])}-${letters(m[2])}-${digits(m[3])}-${digits(m[4])}`;
      const p = CARD_ID.exec(id);
      if (p && FINISH_NAMES[p[1]] && sportByCode(p[2])) found.add(id);
    }
  }
  return [...found].sort();
}

function runOcr(script: string, files: string[]): Promise<Map<string, string[]>> {
  return new Promise((resolve) => {
    execFile("osascript", ["-l", "JavaScript", script, ...files], { maxBuffer: 64 * 1024 * 1024, timeout: 600_000 }, (err, stdout) => {
      const m = new Map<string, string[]>();
      if (!err) {
        for (const line of stdout.split("\n")) {
          if (!line.trim()) continue;
          try {
            const r = JSON.parse(line) as { file: string; lines: string[] };
            m.set(r.file, r.lines ?? []);
          } catch {
            // a malformed line is a file without text
          }
        }
      }
      resolve(m);
    });
  });
}

export interface OcrResult {
  /** Every card id printed anywhere on the image (Vision reads the whole image). */
  ids: string[];
}

/**
 * For every decoded image with at least one QR (every decoded image with `all`): OCR the whole image,
 * and an up-to-4× crop around each symbol (the id on a card back sits to its right; on a slide's
 * registry panel, beside it). Writes `label` on each QrHit and `ocr` on the result. Temporary crops
 * live in os.tmpdir() and are removed.
 */
async function ocrResults(results: FileResult[], jobs: number, all: boolean, log: (s: string) => void): Promise<void> {
  const todo = results.filter((r) => r.status === "decoded" && (all || r.qrs.length) && !r.ocr);
  if (!todo.length) return;
  // Vision reads the files again: anything iCloud evicted since the decode is hydrated first, one at a time.
  for (const r of todo) if (isDataless(abs(r.file)) && !(await hydrate(abs(r.file)))) log(`[qr-audit]   ! could not hydrate ${r.file} for OCR`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gde-qr-ocr-"));
  const script = path.join(dir, "ocr.js");
  fs.writeFileSync(script, OCR_JXA);
  try {
    const crops = new Map<string, { result: FileResult; qr?: QrHit }>();
    let n = 0;
    for (const r of todo) {
      crops.set(abs(r.file), { result: r });
      for (const q of r.qrs) {
        const W = r.width ?? 0, H = r.height ?? 0;
        const x0 = Math.max(0, Math.round(q.x - 0.5 * q.size)), y0 = Math.max(0, Math.round(q.y - 1.0 * q.size));
        const x1 = Math.min(W, Math.round(q.x + 8 * q.size)), y1 = Math.min(H, Math.round(q.y + 2.2 * q.size));
        if (x1 - x0 < 8 || y1 - y0 < 8) continue;
        n += 1;
        const out = path.join(dir, `${n}.png`);
        const scale = Math.min(4, Math.max(1, 300 / Math.max(1, q.size)));
        try {
          await sharp(abs(r.file), { failOn: "none", limitInputPixels: false })
            .rotate()
            .flatten({ background: "#ffffff" })
            .extract({ left: x0, top: y0, width: x1 - x0, height: y1 - y0 })
            .resize({ width: Math.round((x1 - x0) * scale), kernel: "lanczos3" })
            .png()
            .toFile(out);
          crops.set(out, { result: r, qr: q });
        } catch {
          // an unreadable crop leaves that symbol unlabelled
        }
      }
    }
    const files = [...crops.keys()];
    const batches: string[][] = [];
    for (let i = 0; i < files.length; i += 40) batches.push(files.slice(i, i + 40));
    log(`[qr-audit] OCR: ${todo.length} image(s), ${files.length - todo.length} symbol crop(s), ${batches.length} batch(es)`);
    const texts = new Map<string, string[]>();
    let next = 0;
    let done = 0;
    await Promise.all(
      Array.from({ length: Math.max(1, jobs) }, async () => {
        while (next < batches.length) {
          const b = batches[next];
          next += 1;
          for (const [k, v] of await runOcr(script, b)) texts.set(k, v);
          done += 1;
          log(`[qr-audit]   OCR batch ${done}/${batches.length}`);
        }
      }),
    );
    for (const r of todo) r.ocr = { ids: idsInText(texts.get(abs(r.file)) ?? []) };
    for (const [file, { qr }] of crops) if (qr) qr.label = idsInText(texts.get(file) ?? []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------------------------
// Audit

export interface FileResult {
  file: string;
  bytes: number;
  mtimeMs: number;
  status: "decoded" | "evicted" | "error";
  width?: number;
  height?: number;
  qrs: QrHit[];
  /** Zero-byte "symbols" jsqr found in textured art and the audit dropped (see decodeView). */
  emptyDropped?: number;
  /** With --ocr, on images that carry a QR. */
  ocr?: OcrResult;
  error?: string;
  ms?: number;
}

interface Cache {
  version: number;
  files: Record<string, FileResult>;
}

const cacheKey = (r: { file: string; bytes: number; mtimeMs: number }) => `${r.file}|${r.bytes}|${Math.round(r.mtimeMs)}`;

function loadCache(file: string | undefined): Cache {
  const empty = { version: CACHE_VERSION, files: {} };
  if (!file || !fs.existsSync(abs(file))) return empty;
  try {
    const c = JSON.parse(fs.readFileSync(abs(file), "utf8")) as Cache;
    return c.version === CACHE_VERSION && c.files ? c : empty;
  } catch {
    return empty;
  }
}

function saveCache(file: string | undefined, cache: Cache): void {
  if (!file) return;
  const tmp = `${abs(file)}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(cache));
  fs.renameSync(tmp, abs(file));
}

/**
 * Decode order, so a partial run already holds the evidence that matters: 0 = names of likely QR
 * carriers (backs, certificates, proofs, registry slides), 1 = every other exported listing slide,
 * 2 = other sources, 3 = mockup tiles, masters, rulers, quads, plates and slices (no QR seen in any).
 */
function priority(file: string): number {
  const r = rel(file);
  const name = path.basename(r).toLowerCase();
  if (/back|certificate|cert|proof|registered|style pair|pair-|everything|six-finishes/.test(name)) return 0;
  if (r.startsWith("Exportai Etsy/") || /^etsy\/listing-images\/[^/]+\/[^/]+$/.test(r)) return 1;
  if (/\/(_quads|plates|slices|rejects|video)\//.test(r) || /\/src\/(tile-|use-|master-|_ruler|s01-hero)/.test(r)) return 3;
  return 2;
}

async function scan(o: Options, log: (s: string) => void): Promise<{ results: FileResult[]; cache: Cache }> {
  const files: string[] = [];
  for (const r of o.roots) {
    if (!fs.existsSync(abs(r))) throw new Error(`no such path: ${r}`);
    walk(abs(r), files);
  }
  const unique = [...new Set(files)].sort();
  const dataless = new Set<string>();
  for (const r of o.roots) for (const f of datalessUnder(abs(r))) dataless.add(f);

  const cache = loadCache(o.cache);
  const results = new Map<string, FileResult>();
  const stats = new Map<string, { file: string; bytes: number; mtimeMs: number }>();
  const local: string[] = [];
  const evicted: string[] = [];
  for (const f of unique) {
    const st = fs.statSync(f);
    const base = { file: rel(f), bytes: st.size, mtimeMs: st.mtimeMs };
    stats.set(f, base);
    const hit = cache.files[cacheKey(base)];
    if (hit && hit.status === "decoded") results.set(f, hit);
    else if (dataless.has(f)) evicted.push(f);
    else local.push(f);
  }
  const byPriority = (a: string, b: string) => priority(a) - priority(b) || a.localeCompare(b);
  evicted.sort(byPriority);
  local.sort(byPriority);
  const total = unique.length;
  log(
    `[qr-audit] ${total} image(s): ${results.size} cached, ${local.length} on disk, ${evicted.length} evicted` +
      `${o.hydrate ? " (hydrated one at a time)" : " (skipped: --no-hydrate)"}; ${o.jobs || "in-process"} decoder(s)`,
  );

  // One queue in priority order. A decoder takes the first file that is on disk (local, or hydrated);
  // the single downloader walks the evicted files in the same order and waits while DOWNLOAD_LEAD
  // hydrated files are still queued, so a download is read soon after it lands.
  const queue: string[] = [...local, ...(o.hydrate ? evicted : [])].sort(byPriority);
  const hydrated = new Set<string>();
  let waitingHydrated = 0;
  let downloadsLeft = o.hydrate ? evicted.length : 0;
  let poke: (() => void) | null = null;
  let leadPoke: (() => void) | null = null;
  const wake = () => {
    const p = poke;
    poke = null;
    p?.();
  };

  if (!o.hydrate) {
    for (const f of evicted) results.set(f, { ...stats.get(f)!, status: "evicted", qrs: [], error: "evicted (--no-hydrate)" });
  } else {
    void (async () => {
      for (const f of evicted) {
        while (waitingHydrated >= DOWNLOAD_LEAD) await new Promise<void>((r) => (leadPoke = r));
        const t0 = Date.now();
        if (await hydrate(f)) {
          hydrated.add(f);
          waitingHydrated += 1;
          log(`[qr-audit]   hydrated ${rel(f)} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
        } else {
          queue.splice(queue.indexOf(f), 1);
          results.set(f, { ...stats.get(f)!, status: "evicted", qrs: [], error: `still dataless after ${HYDRATE_ATTEMPTS} hydration attempts` });
          log(`[qr-audit]   ! could not hydrate ${rel(f)}`);
        }
        downloadsLeft -= 1;
        wake();
      }
    })();
  }

  const decoders: Decoder[] = o.jobs > 0 ? Array.from({ length: o.jobs }, workerDecoder) : [inProcessDecoder()];
  const idle = [...decoders];
  let running = 0;
  let done = results.size;
  let lastSave = Date.now();

  const handle = async (d: Decoder, f: string) => {
    const base = stats.get(f)!;
    let r: FileResult;
    if (isDataless(f)) r = { ...base, status: "evicted", qrs: [], error: "evicted again before it could be read" };
    else {
      const reply = await d.decode(f);
      r = reply.ok
        ? { ...base, status: "decoded", width: reply.width, height: reply.height, qrs: reply.qrs ?? [], emptyDropped: reply.emptyDropped, ms: reply.ms }
        : { ...base, status: "error", qrs: [], error: reply.error, ms: reply.ms };
    }
    results.set(f, r);
    if (r.status === "decoded") cache.files[cacheKey(r)] = r;
    done += 1;
    const what = r.status === "decoded" ? (r.qrs.length ? r.qrs.map((q) => cardIdOf(q.data) ?? q.data).join(", ") : "no QR") : `${r.status}: ${r.error}`;
    log(`[qr-audit] ${done}/${total} ${((r.ms ?? 0) / 1000).toFixed(1)}s ${r.file} → ${what}`);
    if (Date.now() - lastSave > 30_000) {
      saveCache(o.cache, cache);
      lastSave = Date.now();
    }
  };

  const nextReady = (): string | undefined => {
    const i = queue.findIndex((f) => !dataless.has(f) || hydrated.has(f));
    return i < 0 ? undefined : queue.splice(i, 1)[0];
  };
  for (;;) {
    let f: string | undefined;
    while (idle.length && (f = nextReady()) !== undefined) {
      const d = idle.pop()!;
      if (hydrated.has(f)) {
        waitingHydrated -= 1;
        const lp = leadPoke;
        leadPoke = null;
        lp?.();
      }
      running += 1;
      void handle(d, f).then(() => {
        running -= 1;
        idle.push(d);
        wake();
      });
    }
    if (!queue.length && downloadsLeft <= 0 && running === 0) break;
    await new Promise<void>((r) => (poke = r));
  }
  for (const d of decoders) d.stop();
  saveCache(o.cache, cache);
  return { results: unique.map((f) => results.get(f)!).filter(Boolean), cache };
}

// ---------------------------------------------------------------------------------------------
// Report

export function cardIdOf(payload: string): string | undefined {
  return CARD_URL.exec(payload.trim())?.[1];
}

interface IdRow {
  id: string;
  record?: CardRecord;
  resolves: boolean;
  status: string;
  sport: string;
  finish: string;
  /** Images whose QR decodes to this id. */
  qrFiles: string[];
  /** Images that print this id as text (--ocr). */
  textFiles: string[];
  symbols: number;
}

function describe(id: string): Pick<IdRow, "record" | "resolves" | "status" | "sport" | "finish"> {
  const record = getCard(id);
  const resolves = Boolean(record) && visibilityOf(record!) !== "deleted";
  const m = CARD_ID.exec(id);
  const sport = m ? (sportByCode(m[2])?.name ?? m[2]) : "?";
  const finish = m ? (FINISH_NAMES[m[1]] ?? m[1]) : "?";
  const status = !record ? "NOT REGISTERED" : !resolves ? "deleted (410)" : `registered (${visibilityOf(record)}${isArtPending(id) ? ", art pending" : ""})`;
  return { record, resolves, status, sport, finish };
}

/** Ids printed on an image: whole-image OCR plus the upscaled crop beside each symbol (--ocr). */
function printedIds(r: FileResult): string[] {
  return [...new Set([...(r.ocr?.ids ?? []), ...r.qrs.flatMap((q) => q.label ?? [])])].sort();
}

function idRows(results: FileResult[]): IdRow[] {
  const byId = new Map<string, { qr: Set<string>; text: Set<string>; symbols: number }>();
  const entry = (id: string) => {
    const e = byId.get(id) ?? { qr: new Set<string>(), text: new Set<string>(), symbols: 0 };
    byId.set(id, e);
    return e;
  };
  for (const r of results) {
    for (const q of r.qrs) {
      const id = cardIdOf(q.data);
      if (!id) continue;
      const e = entry(id);
      e.qr.add(r.file);
      e.symbols += 1;
    }
    for (const id of printedIds(r)) entry(id).text.add(r.file);
  }
  return [...byId.entries()]
    .map(([id, e]) => ({ id, ...describe(id), qrFiles: [...e.qr].sort(), textFiles: [...e.text].sort(), symbols: e.symbols }))
    .sort((a, b) => Number(a.resolves) - Number(b.resolves) || a.sport.localeCompare(b.sport) || a.id.localeCompare(b.id));
}

function otherPayloads(results: FileResult[]): Map<string, string[]> {
  const m = new Map<string, Set<string>>();
  for (const r of results) for (const q of r.qrs) if (!cardIdOf(q.data)) m.set(q.data, (m.get(q.data) ?? new Set<string>()).add(r.file));
  return new Map([...m.entries()].sort().map(([k, v]) => [k, [...v].sort()]));
}

/** Symbols whose printed label (--ocr) names a different card than the QR encodes. */
function mismatches(results: FileResult[]): { file: string; qr: string; printed: string[] }[] {
  const out: { file: string; qr: string; printed: string[] }[] = [];
  for (const r of results) {
    for (const q of r.qrs) {
      const id = cardIdOf(q.data);
      if (!id || !q.label?.length || q.label.includes(id)) continue;
      out.push({ file: r.file, qr: id, printed: q.label });
    }
  }
  return out;
}

/** Folder → scanned / with QR / ids, so the report reads per listing section. */
function folderRows(results: FileResult[]) {
  const m = new Map<string, { images: number; decoded: number; withQr: number; ids: Map<string, number>; text: Set<string> }>();
  for (const r of results) {
    const folder = path.posix.dirname(r.file);
    const e = m.get(folder) ?? { images: 0, decoded: 0, withQr: 0, ids: new Map<string, number>(), text: new Set<string>() };
    e.images += 1;
    if (r.status === "decoded") e.decoded += 1;
    if (r.qrs.length) e.withQr += 1;
    for (const q of r.qrs) {
      const label = cardIdOf(q.data) ?? `other: ${q.data}`;
      e.ids.set(label, (e.ids.get(label) ?? 0) + 1);
    }
    for (const id of printedIds(r)) e.text.add(id);
    m.set(folder, e);
  }
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([folder, e]) => ({ folder, ...e }));
}

const md = (s: string) => s.replace(/\|/g, "\\|");

export function renderReport(results: FileResult[], roots: string[], ocr: boolean): string {
  const ocrRead = results.filter((r) => r.ocr).length;
  const rows = idRows(results);
  const bad = rows.filter((r) => !r.resolves && (r.qrFiles.length || ocr));
  const fatal = bad.filter((r) => r.qrFiles.length);
  const decoded = results.filter((r) => r.status === "decoded");
  const unread = results.filter((r) => r.status !== "decoded");
  const withQr = decoded.filter((r) => r.qrs.length);
  const symbols = decoded.reduce((n, r) => n + r.qrs.length, 0);
  const dropped = decoded.reduce((n, r) => n + (r.emptyDropped ?? 0), 0);
  const other = otherPayloads(results);
  const qrIds = rows.filter((r) => r.qrFiles.length);
  const L: string[] = [];
  L.push(`Scanned: ${roots.map((r) => `\`${r}\``).join(", ")} — ${results.length} image(s), ${decoded.length} decoded, ${unread.length} not read.`);
  L.push(
    `QR symbols found: ${symbols} in ${withQr.length} image(s); ${qrIds.length} distinct card id(s) in QR codes, ` +
      `${qrIds.filter((r) => !r.resolves).length} of them not resolving; ${other.size} other payload(s); ` +
      `${dropped} zero-byte false decode(s) in textured art dropped.`,
  );
  if (ocr) {
    const textIds = rows.filter((r) => r.textFiles.length);
    L.push(`Printed ids (Vision OCR of ${ocrRead} image(s), plus an upscaled crop beside every symbol): ${textIds.length} distinct, ${textIds.filter((r) => !r.resolves).length} of them not resolving.`);
  }
  L.push("");
  L.push(`### Card ids${ocr ? " (QR payloads and printed text)" : " decoded from the QR codes"}`);
  L.push("");
  L.push(`| Card id | Registry | Sport | Finish | QR symbols | Images (QR)${ocr ? " | Images (printed text)" : ""} |`);
  L.push(`|---|---|---|---|---:|---:|${ocr ? "---:|" : ""}`);
  for (const r of rows) {
    L.push(`| \`${r.id}\` | ${r.resolves ? "✓" : "✗"} ${r.status} | ${r.sport} | ${r.finish} | ${r.symbols} | ${r.qrFiles.length}${ocr ? ` | ${r.textFiles.length}` : ""} |`);
  }
  L.push("");
  L.push("### Not resolving, per sport, with the exact files");
  L.push("");
  if (ocr) {
    L.push(
      `${fatal.length} decoded from a QR (these fail the run); ${bad.length - fatal.length} seen only in print — check those by eye: ` +
        "OCR misreads small type (2028 for 2026, a dropped digit), and a printed id can be text left over from a cloned slide.",
    );
    L.push("");
  }
  if (!bad.length) L.push("None — every card id found resolves.");
  const bySport = new Map<string, IdRow[]>();
  for (const r of bad) bySport.set(r.sport, [...(bySport.get(r.sport) ?? []), r]);
  for (const [sport, list] of [...bySport.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    L.push(`**${sport}**`);
    L.push("");
    for (const r of list) {
      L.push(`- \`${r.id}\` (${r.finish}) — ${r.status}`);
      for (const f of r.qrFiles) L.push(`  - QR: \`${f}\``);
      for (const f of r.textFiles) L.push(`  - printed: \`${f}\``);
    }
    L.push("");
  }
  if (ocr) {
    const mm = mismatches(results);
    L.push("### QR encodes a different card than the id printed beside it");
    L.push("");
    if (!mm.length) L.push("None.");
    else {
      L.push("| Image | Printed beside the QR | QR encodes |");
      L.push("|---|---|---|");
      for (const x of mm) L.push(`| \`${md(x.file)}\` | ${x.printed.map((p) => `\`${p}\``).join(", ")} | \`${x.qr}\` |`);
    }
    L.push("");
  }
  L.push("### QR payloads that are not a card URL");
  L.push("");
  if (!other.size) L.push("None.");
  for (const [payload, files] of other) {
    L.push(`- \`${md(payload)}\` — ${files.length} image(s)`);
    for (const f of files) L.push(`  - \`${f}\``);
  }
  L.push("");
  L.push("### Every card id with the images it was found in");
  L.push("");
  for (const r of rows) {
    L.push(`<details><summary><code>${r.id}</code> — ${r.status} — QR in ${r.qrFiles.length} image(s)${ocr ? `, printed in ${r.textFiles.length}` : ""}</summary>`);
    L.push("");
    for (const f of r.qrFiles) L.push(`- QR: \`${f}\``);
    for (const f of r.textFiles) L.push(`- printed: \`${f}\``);
    L.push("");
    L.push("</details>");
    L.push("");
  }
  L.push("### Per folder");
  L.push("");
  L.push(`| Folder | Images | Decoded | With QR | QR payloads (symbols)${ocr ? " | Printed ids" : ""} |`);
  L.push(`|---|---:|---:|---:|---|${ocr ? "---|" : ""}`);
  for (const f of folderRows(results)) {
    const ids = [...f.ids.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, n]) => `\`${md(id)}\` ×${n}`).join(", ");
    const text = [...f.text].sort().map((id) => `\`${id}\``).join(", ");
    L.push(`| \`${md(f.folder)}\` | ${f.images} | ${f.decoded} | ${f.withQr} | ${ids || "—"}${ocr ? ` | ${text || "—"}` : ""} |`);
  }
  L.push("");
  L.push("### Images that could not be read");
  L.push("");
  if (!unread.length) L.push("None.");
  for (const r of unread) L.push(`- \`${r.file}\` — ${r.status}: ${r.error ?? ""}`);
  L.push("");
  return L.join("\n");
}

function printTable(results: FileResult[], ocr: boolean): void {
  const rows = idRows(results);
  const w = Math.max(8, ...rows.map((r) => r.id.length));
  console.log(`\n${"card id".padEnd(w)}  ${"registered?".padEnd(36)}  files`);
  for (const r of rows) {
    console.log(`${r.id.padEnd(w)}  ${`${r.resolves ? "yes" : "NO "} ${r.status}`.padEnd(36)}  QR in ${r.qrFiles.length} image(s)${ocr ? `, printed in ${r.textFiles.length}` : ""}`);
    for (const f of r.qrFiles) console.log(`${"".padEnd(w)}  ${"".padEnd(36)}  QR       ${f}`);
    for (const f of r.textFiles) console.log(`${"".padEnd(w)}  ${"".padEnd(36)}  printed  ${f}`);
  }
  const other = otherPayloads(results);
  if (other.size) {
    console.log("\nother QR payloads:");
    for (const [p, files] of other) console.log(`  ${p}  (${files.length} image(s))`);
  }
  if (ocr) {
    const mm = mismatches(results);
    if (mm.length) {
      console.log("\nQR encodes a different card than the id printed beside it:");
      for (const x of mm) console.log(`  ${x.file}: printed ${x.printed.join(", ")} → QR ${x.qr}`);
    }
  }
  const unread = results.filter((r) => r.status !== "decoded");
  const fatal = rows.filter((r) => !r.resolves && r.qrFiles.length);
  const printedOnly = rows.filter((r) => !r.resolves && !r.qrFiles.length && r.textFiles.length);
  console.log(
    `\n${results.length} image(s), ${results.length - unread.length} decoded, ${unread.length} not read; ${rows.length} card id(s); ` +
      `${fatal.length} QR id(s) not resolving${ocr ? `; ${printedOnly.length} printed-only id(s) not resolving (check by eye)` : ""}.`,
  );
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.worker) return workerMain();
  sharp.concurrency(1);
  const log = (s: string) => {
    if (!o.quiet) process.stderr.write(`${s}\n`);
  };
  const { results, cache } = await scan(o, log);
  if (o.ocr) {
    await ocrResults(results, o.jobs, o.ocrAll, log);
    for (const r of results) if (r.status === "decoded") cache.files[cacheKey(r)] = r;
    saveCache(o.cache, cache);
  }
  printTable(results, o.ocr);
  if (o.json) fs.writeFileSync(abs(o.json), JSON.stringify({ roots: o.roots, results }, null, 1));
  if (o.md) fs.writeFileSync(abs(o.md), renderReport(results, o.roots, o.ocr));
  const fatal = idRows(results).filter((r) => !r.resolves && r.qrFiles.length);
  process.exit(fatal.length ? 1 : 0);
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === SELF;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
