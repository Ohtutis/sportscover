// Card art pipeline for /c/<cardId> (CONTRACTS §4.11, DESIGN §6.2–6.5, GAPS #4/#6/#8/#9).
//
//   npm run cards:assets -- [--id <cardId>] [--force] [--audit] [--allow-orders]
//                           [--front <png> --back <png> [--mp4 <mp4>]]   (source overrides, with --id)
//
// For every card in lib/registry/art-sources.ts (or the one named by --id):
//   1. refuse denylisted / Nia-era sources; read orders/** only with --allow-orders;
//   2. trim print bleed (816×1110 → 744×1038), assert 5:7 ± 1 %;
//   3. corner audit on the source, both directions (no transparent corner, no white ground with a
//      different pixel 16 px inward — the rounded-card signature);
//   4. resize to 900×1260 (never upscaled: a 750×1050 source stays 750×1050), flatten onto the
//      arena ground, and on the BACK locate the printed QR with jsqr, paste the registry QR
//      (public/cards/qr/<id>.png) over exactly that symbol, re-decode and assert it equals cardUrl(id);
//   5. optional flip render → 720 px H.264, ≤ 1 MB, faststart, dark ground and square corners checked;
//   6. write public/cards/<id>/{front,back}.webp (+ flip.mp4) and manifest.json.
// Pending ids (ART_PENDING) are reported, not built; `--id <pending id>` with sources present builds
// anyway and says so. `--audit` measures everything and writes nothing. Exit code 1 on any failure.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import jsQR from "jsqr";
import { cardUrl, getCard, type CardRecord } from "../lib/registry/cards";
import { ART_PENDING, CARD_ART_SIZE, artPendingFor, cardArtDir, cardQrFile } from "../lib/registry/art";
import { DEMO_ART_SOURCES, isForbiddenSource, isOrderSource, type ArtSource } from "../lib/registry/art-sources";
import { QR_MARGIN_MODULES, renderQrPng } from "./gen-card-qr";

// ---------------------------------------------------------------------------------------------
// Options

interface Options {
  id?: string;
  force: boolean;
  audit: boolean;
  allowOrders: boolean;
  front?: string;
  back?: string;
  mp4?: string;
}

function parseArgs(argv: string[]): Options {
  const o: Options = { force: false, audit: false, allowOrders: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith("--")) throw new Error(`${a} needs a value`);
      i += 1;
      return v;
    };
    if (a === "--id") o.id = next();
    else if (a === "--force") o.force = true;
    else if (a === "--audit") o.audit = true;
    else if (a === "--allow-orders") o.allowOrders = true;
    else if (a === "--front") o.front = next();
    else if (a === "--back") o.back = next();
    else if (a === "--mp4") o.mp4 = next();
    else if (a === "--help" || a === "-h") {
      console.log("usage: card-assets [--id <cardId>] [--force] [--audit] [--allow-orders] [--front <png> --back <png> [--mp4 <mp4>]]");
      process.exit(0);
    } else throw new Error(`unknown argument ${a}`);
  }
  if ((o.front || o.back || o.mp4) && !o.id) throw new Error("--front/--back/--mp4 need --id");
  if ((o.front && !o.back) || (o.back && !o.front)) throw new Error("--front and --back go together");
  return o;
}

// ---------------------------------------------------------------------------------------------
// Constants

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARENA = { r: 8, g: 12, b: 18 };
const WEBP = { quality: 88, effort: 6, smartSubsample: true } as const;
const BLEED = { width: 816, height: 1110, inset: 36 } as const;
const ASPECT = 5 / 7;
const ASPECT_TOLERANCE = 0.01;
const FLIP_WIDTH = 720;
const FLIP_MAX_BYTES = 1_000_000;
const FLIP_CRF_LADDER = [24, 26, 28, 30, 32, 34];
const DARK_GROUND_MAX = 48; // max channel value a flip render's ground may have (arena is 8/12/18)
const DENYLIST_FILE = path.join(ROOT, "scripts", "denylist.json");

const abs = (p: string) => (path.isAbsolute(p) ? p : path.join(ROOT, p));
const rel = (p: string) => path.relative(ROOT, abs(p)).split(path.sep).join("/");

// ---------------------------------------------------------------------------------------------
// Colour helpers (CIE76 ΔE in Lab — enough to tell "white ground" from "card ink")

type RGB = [number, number, number];
const WHITE: RGB = [255, 255, 255];
const STOCK: RGB = [0xf4, 0xf3, 0xef];

function toLab([r, g, b]: RGB): [number, number, number] {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = lin(r), G = lin(g), B = lin(b);
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const X = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047);
  const Y = f(R * 0.2126 + G * 0.7152 + B * 0.0722);
  const Z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
function deltaE(a: RGB, b: RGB): number {
  const la = toLab(a), lb = toLab(b);
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]);
}
const isWhiteish = (p: RGB) => Math.min(deltaE(p, WHITE), deltaE(p, STOCK)) <= 8;

// ---------------------------------------------------------------------------------------------
// Raw image helpers

interface Raw {
  data: Buffer;
  width: number;
  height: number;
}

async function toRaw(img: sharp.Sharp): Promise<Raw> {
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}
const fromRaw = (r: Raw) => sharp(r.data, { raw: { width: r.width, height: r.height, channels: 4 } });
const pixelAt = (r: Raw, x: number, y: number): [number, number, number, number] => {
  const i = (y * r.width + x) * 4;
  return [r.data[i], r.data[i + 1], r.data[i + 2], r.data[i + 3]];
};
const clampedArray = (r: Raw) => new Uint8ClampedArray(r.data.buffer, r.data.byteOffset, r.data.length);

// ---------------------------------------------------------------------------------------------
// Corner audit (DESIGN §6.2) — edge continuity in both directions

interface CornerResult {
  at: [number, number];
  alpha: number;
  rgb: RGB;
  whiteish: boolean;
  inwardDeltaE: number;
  fail: boolean;
  reason?: string;
}
export interface CornerAudit {
  pass: boolean;
  aspect: { ratio: number; pass: boolean };
  corners: CornerResult[];
}

export function cornerAudit(r: Raw): CornerAudit {
  const { width: w, height: h } = r;
  const probes: Array<[number, number, number, number]> = [
    [2, 2, 18, 18],
    [w - 3, 2, w - 19, 18],
    [2, h - 3, 18, h - 19],
    [w - 3, h - 3, w - 19, h - 19],
  ];
  const corners = probes.map(([x, y, ix, iy]) => {
    const p = pixelAt(r, x, y);
    const q = pixelAt(r, ix, iy);
    const rgb: RGB = [p[0], p[1], p[2]];
    const whiteish = isWhiteish(rgb);
    const inwardDeltaE = deltaE(rgb, [q[0], q[1], q[2]]);
    let reason: string | undefined;
    if (p[3] < 255) reason = `transparent corner (alpha ${p[3]})`;
    else if (whiteish && inwardDeltaE > 20) reason = `white ground at the corner, card ink ${inwardDeltaE.toFixed(0)} dE inward (pre-square-corner export)`;
    return { at: [x, y] as [number, number], alpha: p[3], rgb, whiteish, inwardDeltaE: Number(inwardDeltaE.toFixed(1)), fail: Boolean(reason), reason };
  });
  const ratio = w / h / ASPECT;
  const aspectPass = Math.abs(ratio - 1) <= ASPECT_TOLERANCE;
  return { pass: aspectPass && corners.every((c) => !c.fail), aspect: { ratio: Number(ratio.toFixed(4)), pass: aspectPass }, corners };
}

// ---------------------------------------------------------------------------------------------
// QR: locate on the back, patch with the registry code, re-decode

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface QrReport {
  expected: string;
  sourceDecoded: string | null;
  located: Box | null;
  version: number | null;
  modulePx: number | null;
  patched: boolean;
  method: "nearest" | "lanczos3" | null;
  decoded: string | null;
  pass: boolean;
}

function decodeQr(r: Raw) {
  return jsQR(clampedArray(r), r.width, r.height);
}

/** Bounding box of the symbol (finder-pattern corners), refined to the dark-pixel extent within one module. */
function locateSymbol(r: Raw, q: NonNullable<ReturnType<typeof decodeQr>>): { box: Box; version: number; modulePx: number } {
  const loc = q.location;
  const xs = [loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x];
  const ys = [loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomLeftCorner.y, loc.bottomRightCorner.y];
  const est: Box = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  const version = q.version;
  const dim = 17 + 4 * version;
  const modulePx = est.w / dim;
  // Refine: the exact extent of dark pixels inside the estimate grown by one module. The plate's
  // quiet zone is white, so the dark extent is the symbol itself.
  const grow = Math.ceil(modulePx);
  const x0 = Math.max(0, Math.floor(est.x) - grow), y0 = Math.max(0, Math.floor(est.y) - grow);
  const x1 = Math.min(r.width - 1, Math.ceil(est.x + est.w) + grow), y1 = Math.min(r.height - 1, Math.ceil(est.y + est.h) + grow);
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const p = pixelAt(r, x, y);
      const luma = 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
      if (luma < 128) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const refined: Box = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  const sane =
    maxX >= 0 &&
    Math.abs(refined.w - est.w) <= 1.5 * modulePx &&
    Math.abs(refined.h - est.h) <= 1.5 * modulePx &&
    Math.abs(refined.w - refined.h) <= 1.5 * modulePx;
  const box = sane ? refined : { x: Math.round(est.x), y: Math.round(est.y), w: Math.round(est.w), h: Math.round(est.h) };
  return { box, version, modulePx: Number((box.w / dim).toFixed(3)) };
}

async function registryQrSymbol(cardId: string): Promise<{ png: Buffer; symbol: Box; version: number }> {
  const file = cardQrFile(cardId);
  let png: Buffer;
  if (fs.existsSync(file)) png = fs.readFileSync(file);
  else {
    png = await renderQrPng(cardId);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, png);
  }
  const raw = await toRaw(sharp(png));
  const q = decodeQr(raw);
  if (!q) throw new Error(`registry QR ${rel(file)} does not decode`);
  if (q.data !== cardUrl(cardId)) throw new Error(`registry QR ${rel(file)} encodes ${q.data}, expected ${cardUrl(cardId)} — run npm run qr:gen`);
  const dim = 17 + 4 * q.version;
  const modulePx = raw.width / (dim + 2 * QR_MARGIN_MODULES);
  const margin = Math.round(QR_MARGIN_MODULES * modulePx);
  const size = raw.width - 2 * margin;
  return { png, symbol: { x: margin, y: margin, w: size, h: size }, version: q.version };
}

/** Paste the registry QR over the printed symbol; returns the patched raw image and the report. */
async function patchQr(cardId: string, back: Raw): Promise<{ raw: Raw; report: QrReport }> {
  const expected = cardUrl(cardId);
  const source = decodeQr(back);
  const report: QrReport = {
    expected,
    sourceDecoded: source?.data ?? null,
    located: null,
    version: null,
    modulePx: null,
    patched: false,
    method: null,
    decoded: null,
    pass: false,
  };
  if (!source) throw new Error("no QR code found on the back face");
  const { box, version, modulePx } = locateSymbol(back, source);
  report.located = box;
  report.version = version;
  report.modulePx = modulePx;
  const registry = await registryQrSymbol(cardId);
  if (registry.version !== version) {
    // A different symbol size would not cover the printed one exactly; still exact if we cover the
    // printed extent, because the registry symbol is scaled to the same box.
    console.warn(`  note: printed QR is version ${version}, registry QR is version ${registry.version} — scaled to the printed extent`);
  }
  const symbol = sharp(registry.png).extract({ left: registry.symbol.x, top: registry.symbol.y, width: registry.symbol.w, height: registry.symbol.h });
  for (const method of ["nearest", "lanczos3"] as const) {
    const patch = await symbol.clone().resize(box.w, box.h, { fit: "fill", kernel: method }).png().toBuffer();
    const patchedBuf = await fromRaw(back).composite([{ input: patch, left: box.x, top: box.y }]).ensureAlpha().raw().toBuffer();
    const patched: Raw = { data: patchedBuf, width: back.width, height: back.height };
    const check = decodeQr(patched);
    if (check && check.data === expected) {
      report.patched = true;
      report.method = method;
      report.decoded = check.data;
      report.pass = true;
      return { raw: patched, report };
    }
    report.decoded = check?.data ?? null;
  }
  throw new Error(`patched back does not decode to ${expected} (got ${report.decoded ?? "nothing"})`);
}

// ---------------------------------------------------------------------------------------------
// Denylist (scripts/denylist.json is owned by seo-assets; read leniently: any 64-hex string in it)

function loadDenylist(): Set<string> {
  if (!fs.existsSync(DENYLIST_FILE)) return new Set();
  const text = fs.readFileSync(DENYLIST_FILE, "utf8");
  return new Set((text.match(/\b[0-9a-f]{64}\b/gi) ?? []).map((h) => h.toLowerCase()));
}
const sha256File = (file: string) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const sha256Buf = (buf: Buffer) => createHash("sha256").update(buf).digest("hex");

// ---------------------------------------------------------------------------------------------
// Faces

interface FaceSource {
  path: string;
  sha256: string;
  width: number;
  height: number;
  bleedTrimmed: boolean;
}
interface LoadedFace {
  source: FaceSource;
  img: sharp.Sharp; // rotated + bleed-trimmed, native size
  raw: Raw;
  audit: CornerAudit;
}

async function loadFace(file: string): Promise<LoadedFace> {
  const meta = await sharp(file).metadata();
  let img = sharp(file).rotate();
  let bleedTrimmed = false;
  let width = meta.width ?? 0, height = meta.height ?? 0;
  if (width === BLEED.width && height === BLEED.height) {
    img = img.extract({ left: BLEED.inset, top: BLEED.inset, width: BLEED.width - 2 * BLEED.inset, height: BLEED.height - 2 * BLEED.inset });
    width -= 2 * BLEED.inset;
    height -= 2 * BLEED.inset;
    bleedTrimmed = true;
  }
  const raw = await toRaw(img.clone());
  const audit = cornerAudit(raw);
  return { source: { path: rel(file), sha256: sha256File(file), width, height, bleedTrimmed }, img, raw, audit };
}

function targetSize(front: LoadedFace, back: LoadedFace): { width: number; height: number } {
  const width = Math.min(CARD_ART_SIZE.width, front.source.width, back.source.width);
  return { width, height: Math.round((width * 7) / 5) };
}

async function renderFace(face: LoadedFace, size: { width: number; height: number }): Promise<Raw> {
  return toRaw(face.img.clone().resize(size.width, size.height, { fit: "fill", kernel: "lanczos3" }).flatten({ background: ARENA }));
}

// ---------------------------------------------------------------------------------------------
// Flip render

interface FlipReport {
  source: { path: string | null; sha256: string; codec: string; width: number; height: number; duration: number; bytes: number };
  ground: { rgb: RGB; dark: boolean };
  corners: { pass: boolean; reasons: string[] };
  output: { width: number; height: number; codec: string; pixFmt: string; bytes: number; crf: number } | null;
}

function ffprobe(file: string) {
  const json = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,width,height,pix_fmt,duration", "-show_entries", "format=size,duration", "-of", "json", file],
    { encoding: "utf8" },
  );
  const p = JSON.parse(json) as { streams: Array<{ codec_name: string; width: number; height: number; pix_fmt: string; duration?: string }>; format: { size: string; duration?: string } };
  const s = p.streams[0];
  if (!s) throw new Error(`no video stream in ${rel(file)}`);
  return { codec: s.codec_name, width: s.width, height: s.height, pixFmt: s.pix_fmt, duration: Number(s.duration ?? p.format.duration ?? 0), bytes: Number(p.format.size) };
}

async function firstFrame(file: string): Promise<Raw> {
  const png = execFileSync("ffmpeg", ["-v", "error", "-ss", "0.1", "-i", file, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], { maxBuffer: 64 * 1024 * 1024 });
  return toRaw(sharp(png));
}

/** The card in the first frame must sit on a dark ground and show four square corners. */
function auditFlipFrame(frame: Raw): { ground: FlipReport["ground"]; corners: FlipReport["corners"] } {
  const g = pixelAt(frame, 4, 4);
  const ground: RGB = [g[0], g[1], g[2]];
  const dark = Math.max(...ground) <= DARK_GROUND_MAX;
  // Card extent = pixels that differ clearly from the ground (the soft shadow stays under 30 dE on a dark ground).
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  for (let y = 0; y < frame.height; y += 2) {
    for (let x = 0; x < frame.width; x += 2) {
      const p = pixelAt(frame, x, y);
      if (deltaE([p[0], p[1], p[2]], ground) > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const reasons: string[] = [];
  if (maxX < 0) reasons.push("no card found in the first frame");
  else {
    const probes: Array<[string, number, number, number, number]> = [
      ["top-left", minX + 1, minY + 1, minX + 17, minY + 17],
      ["top-right", maxX - 1, minY + 1, maxX - 17, minY + 17],
      ["bottom-left", minX + 1, maxY - 1, minX + 17, maxY - 17],
      ["bottom-right", maxX - 1, maxY - 1, maxX - 17, maxY - 17],
    ];
    for (const [name, x, y, ix, iy] of probes) {
      const p = pixelAt(frame, x, y);
      const q = pixelAt(frame, ix, iy);
      const rgb: RGB = [p[0], p[1], p[2]];
      if (deltaE(rgb, ground) <= 8) reasons.push(`${name}: ground shows through the card corner (rounded face)`);
      else if (isWhiteish(rgb) && deltaE(rgb, [q[0], q[1], q[2]]) > 20) reasons.push(`${name}: white ground at the card corner (pre-square-corner face)`);
    }
  }
  return { ground: { rgb: ground, dark }, corners: { pass: reasons.length === 0, reasons } };
}

async function processFlip(file: string, dst: string | null, redact: boolean): Promise<FlipReport> {
  const probe = ffprobe(file);
  const frame = await firstFrame(file);
  const { ground, corners } = auditFlipFrame(frame);
  const report: FlipReport = {
    source: { path: redact ? null : rel(file), sha256: sha256File(file), codec: probe.codec, width: probe.width, height: probe.height, duration: probe.duration, bytes: probe.bytes },
    ground,
    corners,
    output: null,
  };
  if (!ground.dark) throw new Error(`flip render ground is ${ground.rgb.join(",")} — not the arena; re-render with FLIP_BG=8,12,18,255`);
  if (!corners.pass) throw new Error(`flip render corners: ${corners.reasons.join("; ")}`);
  if (!dst) return report;
  const tmp = `${dst}.tmp.mp4`;
  let done = false;
  for (const crf of FLIP_CRF_LADDER) {
    execFileSync("ffmpeg", [
      "-y", "-v", "error", "-i", file,
      "-vf", `scale=${FLIP_WIDTH}:-2:flags=lanczos`,
      "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p", "-profile:v", "high",
      "-movflags", "+faststart", "-an", "-map_metadata", "-1",
      tmp,
    ]);
    const out = ffprobe(tmp);
    if (out.bytes <= FLIP_MAX_BYTES) {
      if (out.codec !== "h264" || out.pixFmt !== "yuv420p" || out.width !== FLIP_WIDTH) throw new Error(`flip output is ${out.codec}/${out.pixFmt}/${out.width}px`);
      report.output = { width: out.width, height: out.height, codec: out.codec, pixFmt: out.pixFmt, bytes: out.bytes, crf };
      fs.renameSync(tmp, dst);
      done = true;
      break;
    }
  }
  if (!done) {
    fs.rmSync(tmp, { force: true });
    throw new Error(`flip render could not be brought under ${FLIP_MAX_BYTES} bytes`);
  }
  return report;
}

// ---------------------------------------------------------------------------------------------
// Manifest

interface Manifest {
  cardId: string;
  generatedAt: string;
  generator: string;
  sourceKind: ArtSource["sourceKind"];
  sources: { front: FaceSource; back: FaceSource; mp4: FlipReport["source"] | null };
  outputs: {
    front: { path: string; width: number; height: number; bytes: number; sha256: string };
    back: { path: string; width: number; height: number; bytes: number; sha256: string };
    flipMp4: { path: string; width: number; height: number; bytes: number } | null;
    poster: string | null;
  };
  cornerAudit: { front: CornerAudit; back: CornerAudit; pass: boolean };
  qr: QrReport;
  flip: FlipReport | null;
}

function readManifest(cardId: string): Manifest | null {
  const file = path.join(cardArtDir(cardId), "manifest.json");
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Manifest;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// One card

type Outcome =
  | { status: "ok"; detail: string; pendingLanded?: boolean }
  | { status: "skip"; detail: string }
  | { status: "pending"; detail: string }
  | { status: "gated"; detail: string }
  | { status: "missing"; detail: string }
  | { status: "fail"; detail: string };

async function processCard(card: CardRecord, src: ArtSource, o: Options, deny: Set<string>): Promise<Outcome> {
  const id = card.cardId;
  const explicit = o.id === id;
  const pending = artPendingFor(id);
  const gated = src.sourceKind === "order" || [src.front, src.back, src.mp4].some((p) => p && isOrderSource(p));
  if (gated && !o.allowOrders) return { status: "gated", detail: "real customer — sources read only with --allow-orders" };
  for (const p of [src.front, src.back, src.mp4]) {
    if (p && isForbiddenSource(rel(p))) return { status: "fail", detail: `forbidden source ${rel(p)} (Nia-era / pre-square-corner set)` };
  }
  const missing = [src.front, src.back, src.mp4].filter((p): p is string => Boolean(p) && !fs.existsSync(abs(p as string)));
  if (pending && !explicit) return { status: "pending", detail: `${pending.ticket} — ${pending.reason}` };
  if (missing.length) {
    const what = missing.map((p) => rel(p)).join(", ");
    return pending ? { status: "pending", detail: `${pending.ticket} — sources not on disk yet: ${what}` } : { status: "missing", detail: what };
  }
  for (const p of [src.front, src.back, src.mp4]) {
    if (p && deny.has(sha256File(abs(p)))) return { status: "fail", detail: `denylisted source ${rel(p)}` };
  }

  const dir = cardArtDir(id);
  const previous = readManifest(id);
  const outputsExist = ["front.webp", "back.webp"].every((f) => fs.existsSync(path.join(dir, f))) && (!src.mp4 || fs.existsSync(path.join(dir, "flip.mp4")));
  if (!o.force && !o.audit && previous && outputsExist) {
    const same =
      previous.sources.front.sha256 === sha256File(abs(src.front)) &&
      previous.sources.back.sha256 === sha256File(abs(src.back)) &&
      (previous.sources.mp4?.sha256 ?? null) === (src.mp4 ? sha256File(abs(src.mp4)) : null) &&
      previous.qr.expected === cardUrl(id);
    if (same) return { status: "skip", detail: "up to date (same sources; --force to rebuild)" };
  }

  const front = await loadFace(abs(src.front));
  const back = await loadFace(abs(src.back));
  const problems: string[] = [];
  for (const [name, face] of [["front", front], ["back", back]] as const) {
    if (!face.audit.aspect.pass) problems.push(`${name}: aspect ${face.source.width}×${face.source.height} is not 5:7`);
    for (const c of face.audit.corners) if (c.fail) problems.push(`${name} corner (${c.at.join(",")}): ${c.reason}`);
  }
  if (problems.length) return { status: "fail", detail: problems.join("; ") };

  const size = targetSize(front, back);
  const frontOut = await renderFace(front, size);
  const backPlain = await renderFace(back, size);
  const { raw: backOut, report: qr } = await patchQr(id, backPlain);
  const frontOutAudit = cornerAudit(frontOut);
  const backOutAudit = cornerAudit(backOut);
  if (!frontOutAudit.pass || !backOutAudit.pass) return { status: "fail", detail: "rendered face failed the corner audit" };

  // Encode, then verify the encoded back still decodes (WebP must not soften the modules away).
  const frontWebp = await fromRaw(frontOut).webp(WEBP).toBuffer();
  const backWebp = await fromRaw(backOut).webp(WEBP).toBuffer();
  const encodedCheck = decodeQr(await toRaw(sharp(backWebp)));
  if (!encodedCheck || encodedCheck.data !== qr.expected) return { status: "fail", detail: `encoded back.webp decodes to ${encodedCheck?.data ?? "nothing"}` };

  const redact = src.sourceKind === "order";
  const urlBase = `/cards/${id}`;
  let flip: FlipReport | null = null;
  const summary = `front ${size.width}×${size.height} (from ${front.source.width}×${front.source.height}${front.source.bleedTrimmed ? ", bleed trimmed" : ""}) · back ${size.width}×${size.height} · qr ${qr.sourceDecoded === qr.expected ? "re-stamped" : `patched (source encoded ${qr.sourceDecoded ?? "nothing"})`} at ${qr.located?.w}px/${qr.method} · flip ${src.mp4 ? "" : "none"}`;

  if (o.audit) {
    if (src.mp4) flip = await processFlip(abs(src.mp4), null, redact);
    return { status: "ok", detail: `${summary}${flip ? `ground ${flip.ground.rgb.join(",")} corners ok (would encode)` : ""} — audit only, nothing written`, pendingLanded: Boolean(pending) };
  }

  fs.mkdirSync(dir, { recursive: true });
  const frontFile = path.join(dir, "front.webp");
  const backFile = path.join(dir, "back.webp");
  fs.writeFileSync(frontFile, frontWebp);
  fs.writeFileSync(backFile, backWebp);
  const flipFile = path.join(dir, "flip.mp4");
  if (src.mp4) flip = await processFlip(abs(src.mp4), flipFile, redact);
  else fs.rmSync(flipFile, { force: true });

  const redactSource = (s: FaceSource): FaceSource => (redact ? { ...s, path: "(order export — gated, path withheld)" } : s);
  const manifest: Manifest = {
    cardId: id,
    generatedAt: new Date().toISOString(),
    generator: "scripts/card-assets.ts",
    sourceKind: src.sourceKind,
    sources: { front: redactSource(front.source), back: redactSource(back.source), mp4: flip?.source ?? null },
    outputs: {
      front: { path: `${urlBase}/front.webp`, width: size.width, height: size.height, bytes: frontWebp.length, sha256: sha256Buf(frontWebp) },
      back: { path: `${urlBase}/back.webp`, width: size.width, height: size.height, bytes: backWebp.length, sha256: sha256Buf(backWebp) },
      flipMp4: flip?.output ? { path: `${urlBase}/flip.mp4`, width: flip.output.width, height: flip.output.height, bytes: flip.output.bytes } : null,
      poster: flip?.output ? `${urlBase}/front.webp` : null,
    },
    cornerAudit: { front: front.audit, back: back.audit, pass: true },
    qr,
    flip,
  };
  fs.writeFileSync(path.join(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return { status: "ok", detail: `${summary}${flip?.output ? `${flip.output.width}×${flip.output.height} ${(flip.output.bytes / 1024).toFixed(0)} KB crf ${flip.output.crf}` : ""}`, pendingLanded: Boolean(pending) };
}

// ---------------------------------------------------------------------------------------------
// Main

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const deny = loadDenylist();
  const ids = o.id ? [o.id] : Object.keys(DEMO_ART_SOURCES);
  if (o.id && !getCard(o.id)) throw new Error(`${o.id} is not in the registry`);
  if (o.id && !DEMO_ART_SOURCES[o.id] && !o.front) throw new Error(`${o.id} has no entry in lib/registry/art-sources.ts (pass --front/--back to override)`);

  let failures = 0;
  const rows: string[] = [];
  for (const id of ids) {
    const card = getCard(id);
    if (!card) {
      failures += 1;
      rows.push(`FAIL     ${id}  not in the registry`);
      continue;
    }
    const mapped = DEMO_ART_SOURCES[id];
    const src: ArtSource = o.front && o.back
      ? { front: o.front, back: o.back, mp4: o.mp4, sourceKind: mapped?.sourceKind ?? (card.isFictional ? "demo" : "order"), pending: mapped?.pending }
      : mapped;
    let outcome: Outcome;
    try {
      outcome = await processCard(card, src, o, deny);
    } catch (err) {
      outcome = { status: "fail", detail: (err as Error).message };
    }
    const tag = { ok: "OK", skip: "SKIP", pending: "PENDING", gated: "GATED", missing: "MISSING", fail: "FAIL" }[outcome.status];
    rows.push(`${tag.padEnd(8)} ${id}  ${outcome.detail}`);
    if (outcome.status === "fail" || outcome.status === "missing") failures += 1;
    if (outcome.status === "ok" && outcome.pendingLanded) rows.push(`         ↳ remove ${id} from ART_PENDING (lib/registry/art.ts) — its art has landed`);
  }
  console.log(rows.join("\n"));
  const built = rows.filter((r) => r.startsWith("OK")).length;
  console.log(`\n${o.audit ? "audited" : "built"} ${built} · pending ${ART_PENDING.length} listed · failures ${failures}${deny.size ? ` · denylist ${deny.size} hashes` : " · no scripts/denylist.json yet"}`);
  if (failures) process.exitCode = 1;
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
