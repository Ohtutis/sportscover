// scripts/site-assets.ts — executes lib/assets.ts into public/images/** (CONTRACTS §4.12, DESIGN §6.1–6.4, GAPS #3 #4 #6).
//
//   npm run site:assets                  convert every key whose source exists (outputs already current are skipped)
//   npm run site:assets -- --key <k>     only that key (and the keys sharing its output file)
//   npm run site:assets -- --force       re-encode even when the manifest says the output is current
//   npm run site:assets -- --check       verify only: every `verified` key's output exists at the declared size, every
//                                        back decodes to its card ID, and no file under public/images/** hashes to
//                                        scripts/denylist.json. Exit code 1 on any failure.
//
// Rules: never upscale; WebP q82 (q88 + smartSubsample for card faces); AVIF q55 beside `lcp` keys; sha256 denylist
// gate on every source; the DESIGN §6.2 corner audit on every `card` output (skipped for `crop` assets, GAPS #3); the
// DESIGN §6.4 QR patch — jsqr locates the printed QR, public/cards/qr/<cardId>.png is pasted over it — and a decode
// assert on the WRITTEN file. Only the paths named in lib/assets.ts are ever read; orders/** is never touched.

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import jsQR from "jsqr";
import { SITE_ASSETS, type SiteAsset } from "../lib/assets";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");
const MANIFEST_PATH = path.join(IMAGES_DIR, ".manifest.json");
const DENYLIST_PATH = path.join(ROOT, "scripts", "denylist.json");
const QR_DIR = path.join(PUBLIC_DIR, "cards", "qr");

const argv = process.argv.slice(2);
const has = (f: string) => argv.includes(f);
const opt = (f: string) => {
  const i = argv.indexOf(f);
  return i >= 0 ? argv[i + 1] : undefined;
};
const CHECK = has("--check");
const FORCE = has("--force");
const ONLY_KEY = opt("--key");

/* ---------- types ---------- */
interface DenyEntry {
  sha256: string;
  path: string;
  reason: string;
}
interface QrRecord {
  cardId: string;
  patched: boolean;
  printed: string;
  decodes: string;
}
interface ManifestEntry {
  out: string;
  source: string;
  sourceSha256: string;
  sha256: string;
  width: number;
  height: number;
  kind: SiteAsset["kind"];
  keys: string[];
  crop?: SiteAsset["crop"];
  qr?: QrRecord;
  avif?: string;
  generatedAt: string;
}
interface Manifest {
  version: 1;
  generatedAt: string;
  script: string;
  entries: Record<string, ManifestEntry>;
  keys: Record<string, { out: string; status: SiteAsset["status"] }>;
}
interface Raw {
  data: Buffer;
  info: { width: number; height: number; channels: number };
}

/* ---------- helpers ---------- */
const sha256 = (buf: Buffer) => createHash("sha256").update(buf).digest("hex");
const sha256File = (p: string) => sha256(fs.readFileSync(p));
const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join("/");
const now = () => new Date().toISOString();

function loadDenylist(): Map<string, DenyEntry> {
  const doc = JSON.parse(fs.readFileSync(DENYLIST_PATH, "utf8")) as { entries: DenyEntry[] };
  return new Map(doc.entries.map((e) => [e.sha256, e]));
}

function loadManifest(): Manifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    const m = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as Manifest;
    if (m && m.entries) return { ...m, keys: m.keys ?? {} };
  }
  return { version: 1, generatedAt: now(), script: "scripts/site-assets.ts", entries: {}, keys: {} };
}

function saveManifest(m: Manifest) {
  m.generatedAt = now();
  const sorted: Manifest = {
    version: 1,
    generatedAt: m.generatedAt,
    script: m.script,
    entries: Object.fromEntries(Object.entries(m.entries).sort(([a], [b]) => a.localeCompare(b))),
    keys: Object.fromEntries(Object.entries(m.keys).sort(([a], [b]) => a.localeCompare(b))),
  };
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + "\n");
}

async function toRaw(img: sharp.Sharp): Promise<Raw> {
  const { data, info } = await img.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, info: { width: info.width, height: info.height, channels: info.channels } };
}

const fromRaw = (raw: Raw) =>
  sharp(raw.data, { raw: { width: raw.info.width, height: raw.info.height, channels: 4 } });

function pixel(raw: Raw, x: number, y: number): [number, number, number, number] {
  const i = (y * raw.info.width + x) * 4;
  return [raw.data[i], raw.data[i + 1], raw.data[i + 2], raw.data[i + 3]];
}

function hasTransparency(raw: Raw): boolean {
  for (let i = 3; i < raw.data.length; i += 4) if (raw.data[i] < 255) return true;
  return false;
}

/* ---------- colour (sRGB → CIE Lab, ΔE76) ---------- */
function srgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const R = lin(r), G = lin(g), B = lin(b);
  const X = (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  const Z = (R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function deltaE(a: [number, number, number], b: [number, number, number]): number {
  const la = srgbToLab(...a), lb = srgbToLab(...b);
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]);
}
const WHITE: [number, number, number] = [255, 255, 255];
const STOCK: [number, number, number] = [0xf4, 0xf3, 0xef];

/* ---------- crop (lib/assets.ts AssetCrop) ---------- */
interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * "inset-5" is the GAPS #3 five-percent inset. `box:<l>,<t>,<w>,<h>` is an explicit box in fractions of the
 * source, used to trim baked marketing type (a headline, a price, a slide number) off a listing photograph
 * before it is ever encoded — the trim is declared in lib/assets.ts and recorded in the manifest.
 */
function cropBox(crop: SiteAsset["crop"], w: number, h: number): Box | null {
  if (!crop) return null;
  if (crop === "inset-5") {
    const l = Math.round(w * 0.05);
    const t = Math.round(h * 0.05);
    return { left: l, top: t, width: w - 2 * l, height: h - 2 * t };
  }
  const m = /^box:(\d*\.?\d+),(\d*\.?\d+),(\d*\.?\d+),(\d*\.?\d+)$/.exec(crop);
  if (!m) throw new Error(`unknown crop "${crop}"`);
  const [fl, ft, fw, fh] = m.slice(1, 5).map(Number);
  if (fw <= 0 || fh <= 0 || fl + fw > 1.0001 || ft + fh > 1.0001) throw new Error(`crop "${crop}" leaves the frame`);
  const left = Math.round(w * fl);
  const top = Math.round(h * ft);
  const box = { left, top, width: Math.min(Math.round(w * fw), w - left), height: Math.min(Math.round(h * fh), h - top) };
  if (box.width < 1 || box.height < 1) throw new Error(`crop "${crop}" is empty`);
  return box;
}

/**
 * DESIGN §6.2 — edge continuity in both directions. A corner fails when its alpha < 255, or when it sits within
 * ΔE 8 of white / stock AND the pixel 16 px diagonally inward differs from it by ΔE > 20 (the step a rounded
 * mask leaves). An honest light plate (Heritage) continues inward and passes.
 */
function cornerAudit(raw: Raw): string[] {
  const { width: w, height: h } = raw.info;
  const corners: Array<[string, number, number, number, number]> = [
    ["top-left", 2, 2, 18, 18],
    ["top-right", w - 3, 2, w - 19, 18],
    ["bottom-left", 2, h - 3, 18, h - 19],
    ["bottom-right", w - 3, h - 3, w - 19, h - 19],
  ];
  const failures: string[] = [];
  for (const [name, x, y, ix, iy] of corners) {
    const [r, g, b, a] = pixel(raw, x, y);
    if (a < 255) {
      failures.push(`${name}: alpha ${a} at (${x},${y})`);
      continue;
    }
    const px: [number, number, number] = [r, g, b];
    const light = Math.min(deltaE(px, WHITE), deltaE(px, STOCK)) < 8;
    if (!light) continue;
    const [ir, ig, ib] = pixel(raw, ix, iy);
    const step = deltaE(px, [ir, ig, ib]);
    if (step > 20) failures.push(`${name}: light corner rgb(${r},${g},${b}) with a ΔE ${step.toFixed(1)} step 16 px inward — a rounded mask`);
  }
  return failures;
}

/* ---------- QR (DESIGN §6.4) ---------- */
function decodeQr(raw: Raw) {
  const clamped = new Uint8ClampedArray(raw.data.buffer, raw.data.byteOffset, raw.data.byteLength);
  return jsQR(clamped, raw.info.width, raw.info.height, { inversionAttempts: "dontInvert" });
}

async function patchQr(raw: Raw, printed: NonNullable<ReturnType<typeof decodeQr>>, cardId: string): Promise<Raw> {
  const qrPath = path.join(QR_DIR, `${cardId}.png`);
  if (!fs.existsSync(qrPath)) throw new Error(`no registry QR for ${cardId} — run npm run qr:gen`);
  const L = printed.location;
  const xs = [L.topLeftCorner.x, L.topRightCorner.x, L.bottomLeftCorner.x, L.bottomRightCorner.x];
  const ys = [L.topLeftCorner.y, L.topRightCorner.y, L.bottomLeftCorner.y, L.bottomRightCorner.y];
  const modules = 17 + 4 * printed.version;
  const modulePx = ((Math.max(...xs) - Math.min(...xs)) / modules + (Math.max(...ys) - Math.min(...ys)) / modules) / 2;
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;

  const regRaw = await toRaw(sharp(qrPath));
  const reg = decodeQr(regRaw);
  if (!reg) throw new Error(`registry QR ${rel(qrPath)} does not decode`);
  if (!reg.data.endsWith(`/c/${cardId}`)) throw new Error(`registry QR ${rel(qrPath)} encodes ${reg.data}`);
  const regModules = 17 + 4 * reg.version;
  const rx = [reg.location.topLeftCorner.x, reg.location.topRightCorner.x, reg.location.bottomLeftCorner.x, reg.location.bottomRightCorner.x];
  const regModulePx = (Math.max(...rx) - Math.min(...rx)) / regModules;
  // keep one module of the registry file's own white margin so the pasted symbol carries its quiet zone
  const off = Math.max(0, Math.round(Math.min(...rx) - regModulePx));
  const innerPx = Math.min(regRaw.info.width - off, Math.round(regModulePx * (regModules + 2)));
  // the paste covers the printed symbol plus one printed module on every side
  const targetPx = Math.round(modulePx * (modules + 2));
  const overlay = await sharp(qrPath)
    .extract({ left: off, top: off, width: innerPx, height: innerPx })
    .resize(targetPx, targetPx, { kernel: "lanczos3" })
    .ensureAlpha()
    .png()
    .toBuffer();
  const left = Math.round(cx - targetPx / 2);
  const top = Math.round(cy - targetPx / 2);
  if (left < 0 || top < 0 || left + targetPx > raw.info.width || top + targetPx > raw.info.height) {
    throw new Error(`QR patch box (${left},${top},${targetPx}) leaves the image`);
  }
  const composed = await fromRaw(raw).composite([{ input: overlay, left, top }]).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: composed.data, info: { width: composed.info.width, height: composed.info.height, channels: 4 } };
}

/* ---------- grouping: several keys share one output ---------- */
interface Group {
  out: string;
  keys: string[];
  spec: SiteAsset;
}

function groups(): Group[] {
  const byOut = new Map<string, Group>();
  for (const a of Object.values(SITE_ASSETS)) {
    if (!a.out || !a.source) continue;
    const g = byOut.get(a.out);
    if (!g) {
      byOut.set(a.out, { out: a.out, keys: [a.key], spec: a });
      continue;
    }
    const same = ["source", "width", "height", "kind", "crop", "cardId"] as const;
    for (const f of same) {
      if (a[f] !== g.spec[f]) throw new Error(`keys ${g.keys[0]} and ${a.key} share ${a.out} but differ in ${f}`);
    }
    g.keys.push(a.key);
    if (a.lcp) g.spec = { ...g.spec, lcp: true };
  }
  return Array.from(byOut.values());
}

/* ---------- convert ---------- */
async function convert(g: Group, deny: Map<string, DenyEntry>, manifest: Manifest): Promise<"done" | "current" | "missing"> {
  const a = g.spec;
  const src = path.join(ROOT, a.source as string);
  if (!fs.existsSync(src)) {
    console.log(`  MISSING  ${g.keys.join(", ")} ← ${a.source}`);
    return "missing";
  }
  const sourceSha256 = sha256File(src);
  const hit = deny.get(sourceSha256);
  if (hit) throw new Error(`DENYLISTED source for ${g.keys.join(", ")}: ${a.source} (${hit.reason}; listed as ${hit.path})`);

  const outAbs = path.join(PUBLIC_DIR, a.out);
  const avifRel = a.lcp ? a.out.replace(/\.webp$/, ".avif") : undefined;
  const avifAbs = avifRel ? path.join(PUBLIC_DIR, avifRel) : undefined;
  const prev = manifest.entries[a.out];
  if (
    !FORCE &&
    prev &&
    prev.sourceSha256 === sourceSha256 &&
    prev.width === a.width &&
    prev.height === a.height &&
    fs.existsSync(outAbs) &&
    (!avifAbs || fs.existsSync(avifAbs)) &&
    prev.sha256 === sha256File(outAbs)
  ) {
    prev.keys = g.keys;
    console.log(`  current  ${a.out}`);
    return "current";
  }

  let img = sharp(src, { limitInputPixels: false }).rotate();
  const meta = await img.metadata();
  let w = meta.width ?? 0;
  let h = meta.height ?? 0;
  if (!w || !h) throw new Error(`cannot read ${a.source}`);
  const box = cropBox(a.crop, w, h);
  if (box) {
    img = img.extract(box);
    w = box.width;
    h = box.height;
  }
  if (a.width > w || a.height > h) throw new Error(`${a.out}: declared ${a.width}×${a.height} would upscale ${w}×${h} (${a.source})`);
  const expectH = Math.round((h * a.width) / w);
  if (Math.abs(expectH - a.height) > 1) throw new Error(`${a.out}: declared ${a.width}×${a.height} does not match the source aspect (${w}×${h} → ${a.width}×${expectH})`);
  if (a.kind === "card") {
    const ratio = w / h;
    if (Math.abs(ratio - 5 / 7) / (5 / 7) > 0.01) throw new Error(`${a.out}: card source ${w}×${h} is not 5 : 7 (${a.source})`);
  }

  let qr: QrRecord | undefined;
  if (a.cardId) {
    const raw = await toRaw(img);
    const printed = decodeQr(raw);
    if (!printed) throw new Error(`${a.out}: cannot locate the printed QR on ${a.source}`);
    const want = `/c/${a.cardId}`;
    if (printed.data.endsWith(want)) {
      qr = { cardId: a.cardId, patched: false, printed: printed.data, decodes: printed.data };
    } else {
      const patched = await patchQr(raw, printed, a.cardId);
      const check = decodeQr(patched);
      if (!check || !check.data.endsWith(want)) throw new Error(`${a.out}: QR patch did not decode to ${want} (${check?.data ?? "no decode"})`);
      img = fromRaw(patched);
      qr = { cardId: a.cardId, patched: true, printed: printed.data, decodes: check.data };
    }
  }

  img = img.resize({ width: a.width, height: a.height, fit: "fill", kernel: "lanczos3" });
  const outRaw = await toRaw(img);
  if (a.kind === "card" && !a.crop) {
    const failures = cornerAudit(outRaw);
    if (failures.length) throw new Error(`${a.out}: corner audit failed — ${failures.join("; ")}`);
  }

  let base = fromRaw(outRaw);
  if (!hasTransparency(outRaw)) base = base.removeAlpha();
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  const isCard = a.kind === "card";
  await base.clone().webp({ quality: isCard ? 88 : 82, effort: 5, smartSubsample: isCard }).toFile(outAbs);
  if (avifAbs) await base.clone().avif({ quality: 55, effort: 4 }).toFile(avifAbs);

  const written = await sharp(outAbs).metadata();
  if (written.width !== a.width || written.height !== a.height) throw new Error(`${a.out}: wrote ${written.width}×${written.height}, declared ${a.width}×${a.height}`);
  if (a.cardId) {
    const back = decodeQr(await toRaw(sharp(outAbs)));
    if (!back || !back.data.endsWith(`/c/${a.cardId}`)) throw new Error(`${a.out}: the written file does not decode to /c/${a.cardId} (${back?.data ?? "no decode"})`);
    if (qr) qr.decodes = back.data;
  }

  manifest.entries[a.out] = {
    out: a.out,
    source: a.source as string,
    sourceSha256,
    sha256: sha256File(outAbs),
    width: a.width,
    height: a.height,
    kind: a.kind,
    keys: g.keys,
    crop: a.crop,
    qr,
    avif: avifRel,
    generatedAt: now(),
  };
  const kb = Math.round(fs.statSync(outAbs).size / 1024);
  console.log(`  wrote    ${a.out}  ${a.width}×${a.height}  ${kb} KB${qr?.patched ? "  QR patched" : ""}${avifRel ? "  +avif" : ""}`);
  return "done";
}

/* ---------- check ---------- */
function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

async function check(deny: Map<string, DenyEntry>, manifest: Manifest): Promise<number> {
  let failures = 0;
  const fail = (m: string) => {
    failures++;
    console.log(`  FAIL  ${m}`);
  };
  const decoded = new Map<string, string>();
  for (const a of Object.values(SITE_ASSETS)) {
    if (a.status !== "verified") continue;
    if (!a.out) {
      fail(`${a.key}: verified without an output path`);
      continue;
    }
    const outAbs = path.join(PUBLIC_DIR, a.out);
    if (!fs.existsSync(outAbs)) {
      fail(`${a.key}: ${a.out} is missing`);
      continue;
    }
    const meta = await sharp(outAbs).metadata();
    if (meta.width !== a.width || meta.height !== a.height) fail(`${a.key}: ${a.out} is ${meta.width}×${meta.height}, declared ${a.width}×${a.height}`);
    const entry = manifest.entries[a.out];
    if (!entry) fail(`${a.key}: ${a.out} has no manifest entry`);
    else {
      if (entry.sha256 !== sha256File(outAbs)) fail(`${a.key}: ${a.out} differs from its manifest hash`);
      if (deny.has(entry.sourceSha256)) fail(`${a.key}: source ${entry.source} is denylisted`);
      if (!entry.keys.includes(a.key)) fail(`${a.key}: not listed on the manifest entry for ${a.out}`);
    }
    if (a.lcp) {
      const avifAbs = outAbs.replace(/\.webp$/, ".avif");
      if (!fs.existsSync(avifAbs)) fail(`${a.key}: AVIF sibling missing for ${a.out}`);
      else {
        const am = await sharp(avifAbs).metadata();
        if (am.width !== a.width || am.height !== a.height) fail(`${a.key}: AVIF is ${am.width}×${am.height}`);
      }
    }
    if (a.cardId) {
      let data = decoded.get(a.out);
      if (data === undefined) {
        const r = decodeQr(await toRaw(sharp(outAbs)));
        data = r?.data ?? "";
        decoded.set(a.out, data);
      }
      if (!data.endsWith(`/c/${a.cardId}`)) fail(`${a.key}: ${a.out} decodes to "${data || "nothing"}", expected /c/${a.cardId}`);
    }
  }
  let scanned = 0;
  for (const f of walk(IMAGES_DIR)) {
    if (path.basename(f) === ".manifest.json" || path.basename(f) === ".DS_Store") continue;
    scanned++;
    const hit = deny.get(sha256File(f));
    if (!hit) continue;
    if (hit.path === rel(f)) console.log(`  WARN  ${rel(f)} is a legacy file on the denylist — delete it (CONTRACTS §5.1 D), it is not a derivative`);
    else fail(`${rel(f)} hash-matches denylisted ${hit.path} (${hit.reason})`);
  }
  const verified = Object.values(SITE_ASSETS).filter((a) => a.status === "verified").length;
  const locate = Object.values(SITE_ASSETS).length - verified;
  console.log(`\n${verified} verified keys, ${locate} locate keys, ${scanned} files scanned under public/images, ${failures} failure(s)`);
  return failures;
}

/* ---------- main ---------- */
async function main() {
  const deny = loadDenylist();
  const manifest = loadManifest();
  if (CHECK) {
    const failures = await check(deny, manifest);
    process.exit(failures ? 1 : 0);
  }
  let gs = groups();
  if (ONLY_KEY) {
    if (!SITE_ASSETS[ONLY_KEY]) throw new Error(`unknown key ${ONLY_KEY}`);
    gs = gs.filter((g) => g.keys.includes(ONLY_KEY));
    if (!gs.length) throw new Error(`${ONLY_KEY} has no source or output to convert`);
  }
  console.log(`site-assets: ${gs.length} output file(s) from ${Object.keys(SITE_ASSETS).length} keys\n`);
  const tally = { done: 0, current: 0, missing: 0 };
  const missing: string[] = [];
  for (const g of gs) {
    const r = await convert(g, deny, manifest);
    tally[r]++;
    if (r === "missing") missing.push(...g.keys);
  }
  for (const a of Object.values(SITE_ASSETS)) manifest.keys[a.key] = { out: a.out, status: a.status };
  for (const g of gs) {
    if (manifest.entries[g.out]) manifest.entries[g.out].keys = g.keys;
  }
  saveManifest(manifest);
  console.log(`\nwrote ${tally.done}, current ${tally.current}, missing sources ${tally.missing} → ${rel(MANIFEST_PATH)}`);
  if (missing.length) console.log(`keys without a source on this machine: ${missing.join(", ")}`);
  const produced = Object.values(SITE_ASSETS).filter((a) => a.out && manifest.entries[a.out] && a.status !== "verified").map((a) => a.key);
  if (produced.length) console.log(`\noutputs exist for ${produced.length} key(s) still marked locate — review the thumbnails, then flip them in lib/assets.ts:\n  ${produced.join(", ")}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
