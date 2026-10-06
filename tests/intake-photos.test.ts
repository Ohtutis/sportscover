// Step 4 of /free-proof (owner, 2026-10-06): the example gallery that replaced the ✓ / ✕ pair and the
// must-have / leave-out checkboxes, and the free photo check — pure browser JS measured on the parent's own
// device (components/intake/photoCheck.ts). The checker's pure functions run here on synthetic pixel buffers,
// then on the repo's own example files, decoded with sharp exactly at the size the browser measures.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { SITE_ASSETS, asset, hasAsset } from "../lib/assets";
import { INTAKE_COPY } from "../lib/intake/copy";
import { CANON } from "../lib/copy/canon";
import {
  CHECK_EDGE,
  CHECK_LIMITS,
  PHOTO_CHECK_REASONS,
  averageHash,
  fitWithin,
  halve,
  hashDistance,
  isHeicFile,
  judgePhotos,
  laplacianVariance,
  looksLikeScreenshot,
  measurePixels,
  meanLuminance,
  summarizeChecks,
  toGray,
  type CheckItem,
  type PhotoCheck,
  type PhotoMeasure,
} from "../components/intake/photoCheck";
import { PHOTO_EXAMPLE_TILES, PhotoExampleGallery } from "../components/intake/PhotoExamples";
import { PhotoUploader } from "../components/intake/PhotoUploader";

const ROOT = path.resolve(__dirname, "..");
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const publicFile = (src: string) => path.join(ROOT, "public", src.replace(/^\//, ""));
const MAX_EXAMPLE_BYTES = 60 * 1024;

// --- synthetic images -------------------------------------------------------------------------------

/** An RGBA buffer from a grey-level function. */
function image(width: number, height: number, grey: (x: number, y: number) => number): Uint8ClampedArray {
  const px = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const v = Math.max(0, Math.min(255, Math.round(grey(x, y))));
      px[i] = px[i + 1] = px[i + 2] = v;
      px[i + 3] = 255;
    }
  }
  return px;
}

/** Hard-edged stripes over a gradient: the "sharp" photo. */
const sharpGrey = (x: number, y: number) => 60 + (x / 256) * 80 + (Math.floor(x / 6) % 2 ? 70 : 0) + (Math.floor(y / 9) % 2 ? 20 : 0);

/** The same picture with a 15-px box blur in x and y: the "blurred" photo. */
function blurred(width: number, height: number, r: number): (x: number, y: number) => number {
  const base = Float64Array.from({ length: width * height }, (_, i) => sharpGrey(i % width, Math.floor(i / width)));
  const tmp = new Float64Array(width * height);
  const out = new Float64Array(width * height);
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) {
      let s = 0;
      let n = 0;
      for (let k = -r; k <= r; k += 1) {
        if (x + k < 0 || x + k >= width) continue;
        s += base[y * width + x + k];
        n += 1;
      }
      tmp[y * width + x] = s / n;
    }
  for (let y = 0; y < height; y += 1)
    for (let x = 0; x < width; x += 1) {
      let s = 0;
      let n = 0;
      for (let k = -r; k <= r; k += 1) {
        if (y + k < 0 || y + k >= height) continue;
        s += tmp[(y + k) * width + x];
        n += 1;
      }
      out[y * width + x] = s / n;
    }
  return (x, y) => out[y * width + x];
}

const W = 256;
const H = 256;
const big = { width: 3024, height: 4032 };
const measured = (m: Partial<PhotoMeasure>, name = "IMG_0001.JPG", type = "image/jpeg", id = name): CheckItem => ({
  id,
  file: { name, type },
  reading: { kind: "measured", measure: { width: big.width, height: big.height, sharpness: 500, luminance: 130, hash: "0f0f0f0f0f0f0f0f", ...m } },
});

describe("photo check — pure functions on synthetic pixels", () => {
  it("sharp vs blurred: the Laplacian variance falls by an order of magnitude and crosses the blurry limit", () => {
    const sharpM = measurePixels(image(W, H, sharpGrey), W, H, big);
    const blurM = measurePixels(image(W, H, blurred(W, H, 15)), W, H, big);
    expect(sharpM.sharpness).toBeGreaterThan(CHECK_LIMITS.blurry * 3);
    expect(blurM.sharpness).toBeLessThan(CHECK_LIMITS.blurry);
    expect(blurM.sharpness * 10).toBeLessThan(sharpM.sharpness);
    const [s, b] = judgePhotos([
      { id: "s", file: { name: "a.jpg", type: "image/jpeg" }, reading: { kind: "measured", measure: sharpM } },
      { id: "b", file: { name: "b.jpg", type: "image/jpeg" }, reading: { kind: "measured", measure: blurM } },
    ]);
    expect(s).toEqual({ verdict: "good", reasons: ["sharp"] });
    expect(b?.verdict).toBe("check");
    expect(b?.reasons).toContain("blurry");
  });

  it("a flat image has no sharpness, and a constant gradient has none either (the Laplacian of a ramp is zero)", () => {
    const flat = toGray(image(64, 64, () => 128), 64, 64);
    expect(laplacianVariance(flat, 64, 64)).toBe(0);
    const ramp = toGray(image(64, 64, (x) => x * 3), 64, 64);
    expect(laplacianVariance(ramp, 64, 64)).toBeLessThan(1e-6);
    expect(laplacianVariance(flat, 2, 2)).toBe(0);
  });

  it("dark vs lit vs washed out: mean luminance against 60 and 230", () => {
    const lum = (v: number) => meanLuminance(toGray(image(32, 32, () => v), 32, 32));
    expect(lum(30)).toBeCloseTo(30, 0);
    expect(lum(140)).toBeCloseTo(140, 0);
    const [dark, lit, bright] = judgePhotos([
      measured({ luminance: lum(30) }, "d.jpg"),
      measured({ luminance: lum(140), hash: "f0f0f0f0f0f0f0f0" }, "l.jpg"),
      measured({ luminance: lum(245), hash: "ff00ff00ff00ff00" }, "b.jpg"),
    ]);
    expect(dark?.reasons).toEqual(["dark"]);
    expect(lit).toEqual({ verdict: "good", reasons: ["sharp"] });
    expect(bright?.reasons).toEqual(["bright"]);
    expect(CHECK_LIMITS.dark).toBe(60);
    expect(CHECK_LIMITS.bright).toBe(230);
  });

  it("small vs big: the original's long edge against 600 and 1000 — measured before any downscale", () => {
    const [tiny, small, ok] = judgePhotos([
      measured({ width: 480, height: 360 }, "t.jpg"),
      measured({ width: 960, height: 720, hash: "f0f0f0f0f0f0f0f0" }, "s.jpg"),
      measured({ width: 4032, height: 3024, hash: "ff00ff00ff00ff00" }, "o.jpg"),
    ]);
    expect(tiny?.reasons).toEqual(["tiny"]);
    expect(small?.reasons).toEqual(["small"]);
    expect(ok?.verdict).toBe("good");
    expect(fitWithin(4032, 3024)).toEqual({ width: CHECK_EDGE, height: 768 });
    expect(fitWithin(600, 800)).toEqual({ width: 600, height: 800 });
    const m = measurePixels(image(W, H, sharpGrey), W, H, { width: 4032, height: 3024 });
    expect([m.width, m.height]).toEqual([4032, 3024]);
  });

  it("duplicates: the same picture at the same size hashes the same; only the later copy is flagged", () => {
    const px = image(W, H, sharpGrey);
    const a = averageHash(halve(toGray(px, W, H), W, H).gray, W / 2, H / 2);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    const shifted = image(W, H, (x, y) => sharpGrey(Math.min(W - 1, x + 3), y) + 4);
    const b = measurePixels(shifted, W, H, big).hash;
    const other = measurePixels(image(W, H, (x, y) => (y < H / 2 ? 220 : 30) + (x > W / 2 ? 10 : 0)), W, H, big).hash;
    expect(hashDistance(a, measurePixels(px, W, H, big).hash)).toBe(0);
    expect(hashDistance(a, b)).toBeLessThanOrEqual(CHECK_LIMITS.sameShotBits);
    expect(hashDistance(a, other)).toBeGreaterThan(CHECK_LIMITS.sameShotBits);
    expect(hashDistance(a, "nope")).toBe(64);

    const first = measured({ hash: a }, "IMG_1.JPG");
    const burst = measured({ hash: b }, "IMG_2.JPG");
    const resized = measured({ hash: a, width: 1500, height: 2000 }, "IMG_3.JPG");
    const checks = judgePhotos([first, burst, resized]);
    expect(checks[0]).toEqual({ verdict: "good", reasons: ["sharp"] });
    expect(checks[1]?.reasons).toEqual(["duplicate"]);
    expect(checks[2]?.reasons).not.toContain("duplicate");
    // Remove the first: the burst frame is no longer a repeat of anything.
    expect(judgePhotos([burst, resized])[0]).toEqual({ verdict: "good", reasons: ["sharp"] });
  });

  it("screenshots: a PNG in a phone-screen shape within 1 %, or an exact phone screen size in any format", () => {
    const png = { name: "Screenshot 2026-10-06.PNG", type: "image/png" };
    const jpg = { name: "IMG_4410.JPG", type: "image/jpeg" };
    expect(looksLikeScreenshot(png, 1170, 2532)).toBe(true); // 9 : 19.5
    expect(looksLikeScreenshot(png, 1080, 1920)).toBe(true); // 9 : 16
    expect(looksLikeScreenshot(png, 2400, 1792)).toBe(true); // 3 : 4, landscape
    expect(looksLikeScreenshot(png, 2000, 3000)).toBe(false); // 2 : 3 is a camera shape, not a screen
    expect(looksLikeScreenshot(png, 2048, 2048)).toBe(false);
    expect(looksLikeScreenshot(jpg, 3024, 4032)).toBe(false); // a camera original
    expect(looksLikeScreenshot(jpg, 1179, 2556)).toBe(true); // an exact iPhone screen
    expect(looksLikeScreenshot(jpg, 0, 0)).toBe(false);
    const [shot] = judgePhotos([measured({ width: 1170, height: 2532 }, png.name, png.type)]);
    expect(shot?.reasons[0]).toBe("screenshot");
  });

  it("HEIC is left to the owner, never guessed; at most two reasons, most useful first", () => {
    expect(isHeicFile({ name: "IMG_0042.HEIC", type: "" })).toBe(true);
    expect(isHeicFile({ name: "photo", type: "image/heif" })).toBe(true);
    expect(isHeicFile({ name: "IMG_0042.JPG", type: "image/jpeg" })).toBe(false);
    const [heic, pending, many] = judgePhotos([
      { id: "h", file: { name: "IMG_0042.HEIC", type: "image/heic" }, reading: { kind: "unchecked", reason: "heic" } },
      { id: "p", file: { name: "IMG_0043.JPG", type: "image/jpeg" }, reading: null },
      measured({ width: 500, height: 400, sharpness: 5, luminance: 20 }, "worst.jpg"),
    ]);
    expect(heic).toEqual({ verdict: "unchecked", reasons: ["heic"] });
    expect(pending).toBeNull();
    expect(many).toEqual({ verdict: "check", reasons: ["blurry", "tiny"] });
  });

  it("the summary counts, never scores: 3 of 4 look good — one is worth replacing", () => {
    const good: PhotoCheck = { verdict: "good", reasons: ["sharp"] };
    const bad: PhotoCheck = { verdict: "check", reasons: ["blurry"] };
    const heic: PhotoCheck = { verdict: "unchecked", reasons: ["heic"] };
    expect(summarizeChecks([])).toEqual({ kind: "none" });
    expect(summarizeChecks([good, null])).toEqual({ kind: "checking" });
    const s = summarizeChecks([good, good, good, bad]);
    expect(s).toEqual({ kind: "done", good: 3, checked: 4, flagged: 1, unchecked: 0 });
    const line = INTAKE_COPY.photoCheck.summary;
    expect(line(3, 4, 1, 0)).toBe("3 of 4 look good — one is worth replacing.");
    expect(line(2, 5, 3, 0)).toBe("2 of 5 look good — three are worth replacing.");
    expect(line(4, 4, 0, 0)).toBe("All 4 look good.");
    expect(line(1, 1, 0, 0)).toBe("It looks good.");
    expect(line(2, 2, 0, 0)).toBe("Both look good.");
    expect(line(2, 2, 0, 1)).toBe("Both we could check look good.");
    expect(line(3, 3, 0, 1)).toBe("All 3 we could check look good.");
    expect(line(0, 0, 0, 2)).toBe("We check these on our side.");
    expect(summarizeChecks([good, heic])).toEqual({ kind: "done", good: 1, checked: 1, flagged: 0, unchecked: 1 });
  });
});

describe("photo check — calibrated on the repo's own examples", () => {
  /** Decoded and measured the way the browser does it: long edge ≤ CHECK_EDGE, then the pure functions. */
  async function measureFile(file: string): Promise<PhotoMeasure> {
    const meta = await sharp(file).metadata();
    const size = fitWithin(meta.width!, meta.height!);
    const { data } = await sharp(file).resize(size.width, size.height, { fit: "fill" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return measurePixels(data, size.width, size.height, { width: meta.width!, height: meta.height! });
  }

  it("the twelve hero phone photos read sharp, and the blurred example reads blurry", async () => {
    const home = path.join(ROOT, "public/images/home");
    const phone = fs.existsSync(home) ? fs.readdirSync(home).filter((f) => /^phone-photo-.*\.webp$/.test(f)) : [];
    expect(phone.length).toBeGreaterThanOrEqual(12);
    for (const f of phone) {
      const m = await measureFile(path.join(home, f));
      expect(m.sharpness, f).toBeGreaterThan(CHECK_LIMITS.blurry * 3);
      expect(m.luminance, f).toBeGreaterThan(CHECK_LIMITS.dark);
      expect(m.luminance, f).toBeLessThan(CHECK_LIMITS.bright);
    }
    const blurry = await measureFile(publicFile(asset("intake.example.blurred").src));
    expect(blurry.sharpness).toBeLessThan(CHECK_LIMITS.blurry);
  });
});

describe("photo check — copy and boundaries", () => {
  it("every reason has its words in lib/intake/copy.ts: short enough for two lines under a thumbnail, no numbers", () => {
    const reasons = INTAKE_COPY.photoCheck.reasons as Record<string, string>;
    expect(Object.keys(reasons).sort()).toEqual([...PHOTO_CHECK_REASONS].sort());
    for (const key of PHOTO_CHECK_REASONS) {
      expect(reasons[key], key).toBeTruthy();
      expect(reasons[key].length, key).toBeLessThanOrEqual(30);
      expect(reasons[key], key).not.toMatch(/\d|%|score/i);
    }
    expect(reasons.sharp).toBe("Looks sharp");
    expect(INTAKE_COPY.photoCheck.checking).toBeTruthy();
    expect(INTAKE_COPY.photoCheck.summaryChecking).toMatch(/this device/);
  });

  it("no network, no model, no dependency — and only the uploader imports the checker", () => {
    const src = read("components/intake/photoCheck.ts");
    expect(src).not.toMatch(/^\s*import\s/m);
    expect(src).not.toMatch(/\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|import\(/);
    const importers: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
        const rel = path.join(dir, e.name);
        if (e.isDirectory()) walk(rel);
        else if (/\.(ts|tsx)$/.test(e.name) && /from "\.\/photoCheck"|intake\/photoCheck"/.test(read(rel))) importers.push(rel);
      }
    };
    for (const dir of ["app", "components", "lib"]) walk(dir);
    expect(importers).toEqual(["components/intake/PhotoUploader.tsx"]);
  });
});

describe("example gallery — SEND THESE ×4, LEAVE THESE OUT ×3", () => {
  const html = renderToStaticMarkup(createElement(PhotoExampleGallery));
  const copy = INTAKE_COPY.photoExamples;

  it("renders four ✓ and three ✕ tiles, each with its caption, under their two row labels", () => {
    expect((html.match(/data-fp-example="send"/g) ?? []).length).toBe(4);
    expect((html.match(/data-fp-example="leave"/g) ?? []).length).toBe(3);
    expect(html.indexOf(copy.sendLabel)).toBeLessThan(html.indexOf(copy.leaveLabel));
    for (const tile of PHOTO_EXAMPLE_TILES) expect(html).toContain(`<span>${copy.captions[tile.slug]}</span></figcaption>`);
    expect(PHOTO_EXAMPLE_TILES.map((t) => copy.captions[t.slug])).toEqual([
      "Face sharp, both eyes",
      "Head turned left or right",
      "Full body",
      "In the team kit",
      "Blurry",
      "Face covered",
      "Group photo",
    ]);
    for (const caption of Object.values(copy.captions)) expect(caption.split(/\s+/).length, caption).toBeLessThanOrEqual(5);
  });

  it("one FictionalLabel for the whole gallery and one link to the full photo guide, in a new tab", () => {
    expect(html.split(CANON.fictionalLabel).length - 1).toBe(1);
    expect((html.match(/href="\/photo-guide"/g) ?? []).length).toBe(1);
    expect(html).toMatch(/<a (?=[^>]*target="_blank")(?=[^>]*rel="noreferrer")[^>]*href="\/photo-guide"/);
  });

  // v4 (owner review 2026-10-06, evening): the round ✕ badges in the top-left corner "look like close buttons —
  // you want to dismiss them". Now each tile is a photo with a full-width caption bar at its bottom, the glyph
  // inside the words, on a tint of the verdict colour, and a thin outline of the same colour. Nothing round,
  // nothing in a corner, nothing that reacts to the pointer.
  it("each tile is a labelled photo, not a control: a full-width verdict bar with the glyph inside the words, a thin verdict outline", () => {
    const figures = [...html.matchAll(/<figure data-fp-example="(send|leave)" class="([^"]*)">([\s\S]*?)<\/figure>/g)];
    expect(figures).toHaveLength(7);
    for (const [, kind, cls, inner] of figures) {
      expect(cls.split(" "), kind).toEqual(expect.arrayContaining(["flex", "h-full", "flex-col", "border", kind === "send" ? "border-pass" : "border-fail"]));
      const bar = /<figcaption class="([^"]*)">(<svg[\s\S]*?<\/svg>)<span>([^<]*)<\/span><\/figcaption>/.exec(inner);
      expect(bar, kind).not.toBeNull();
      expect(bar![1].split(" "), kind).toEqual(expect.arrayContaining(["flex", "flex-1", "border-t", kind === "send" ? "bg-pass/15" : "bg-fail/10"]));
      // The glyph sits INSIDE the bar, before the words: ✓ for send, ✕ for leave.
      expect(bar![2]).toContain(kind === "send" ? 'd="M5 12.5l4.5 4.5L19 7"' : 'd="M7 7l10 10M17 7L7 17"');
      expect(bar![2]).toContain('aria-hidden="true"');
      // Nothing round, nothing absolutely placed in a corner, nothing hoverable or focusable.
      expect(inner).not.toMatch(/rounded-full|absolute left-|absolute top-|hover:|cursor-pointer|tabindex|<button|<a /);
    }
    expect((html.match(/aspect-square/g) ?? []).length).toBe(7);
    expect(html).not.toMatch(/accent/);
    expect(read("components/intake/PhotoExamples.tsx")).not.toMatch(/accent|rounded-full/);
  });

  it("every example key is a verified, fictional, 1 : 1 file of at most 60 KB, and the gallery's copies equal lib/assets.ts", async () => {
    const manifest = JSON.parse(read("public/images/.manifest.json")) as { entries: Record<string, { keys: string[]; width: number; height: number }> };
    for (const tile of PHOTO_EXAMPLE_TILES) {
      expect(hasAsset(tile.key), tile.key).toBe(true);
      const a = asset(tile.key);
      expect(a.src, tile.key).toBe(tile.src);
      expect(a.alt, tile.key).toBe(tile.alt);
      expect(a.fictional, tile.key).toBe(true);
      expect(a.alt, tile.key).toMatch(/generated example/);
      expect(a.width, tile.key).toBe(a.height);
      const file = publicFile(a.src);
      expect(fs.existsSync(file), file).toBe(true);
      expect(fs.statSync(file).size, tile.key).toBeLessThanOrEqual(MAX_EXAMPLE_BYTES);
      const meta = await sharp(file).metadata();
      expect([meta.width, meta.height], tile.key).toEqual([a.width, a.height]);
      expect(manifest.entries[a.src]?.keys, tile.key).toContain(tile.key);
      expect(html.includes(encodeURIComponent(a.src)), tile.key).toBe(true);
    }
  });

  it("✓ tiles are crops of the audited hero phone photos; ✕ tiles are the judged slide-12 takes", () => {
    const heroSources = new Set(
      Object.values(SITE_ASSETS)
        .filter((a) => /^hero\.story\.\d\.before(\.\d)?$/.test(a.key))
        .map((a) => a.source),
    );
    for (const tile of PHOTO_EXAMPLE_TILES) {
      const source = SITE_ASSETS[tile.key].source ?? "";
      if (tile.send) expect(heroSources.has(source), `${tile.key} ← ${source}`).toBe(true);
      else {
        expect(source, tile.key).toMatch(/^art-pipeline\/out\/etsy-shots\/[a-z-]+\/bad-[a-z-]+\.png$/);
        // The judge files live in a git-ignored root: checked where they exist (the owner's Mac), skipped in CI.
        const judge = path.join(ROOT, source.replace(/\.png$/, ".judge.json"));
        if (fs.existsSync(judge)) {
          const verdicts = (JSON.parse(fs.readFileSync(judge, "utf8")) as { verdicts: { pass: boolean }[] }).verdicts;
          expect(verdicts.length, judge).toBeGreaterThan(0);
          expect(verdicts.every((v) => v.pass), judge).toBe(true);
        }
      }
    }
  });
});

describe("step 4 — the uploader with the gallery and the check", () => {
  const noop = () => {};
  const props = { crest: null, examples: { good: null, bad: null }, onAdd: noop, onRemove: noop, onPreviewFailed: noop, onCrest: noop, notes: [] };

  it("the drop zone is unchanged, the self-check checkboxes are gone, the gallery stands beside the zone from xl", () => {
    const html = renderToStaticMarkup(createElement(PhotoUploader, { ...props, photos: [] }));
    const zone = /<button id="fp-photos-choose" type="button" data-fp-dropzone=""[^>]*class="([^"]*)"/.exec(html);
    expect(zone?.[1]).toMatch(/min-h-\[23rem\]/);
    expect(zone?.[1]).toMatch(/md:min-h-\[29rem\]/);
    expect(html).not.toMatch(/type="checkbox"/);
    for (const line of [...INTAKE_COPY.photoMustHaves, ...INTAKE_COPY.photoAvoid]) expect(html).not.toContain(line);
    expect(html).toContain("data-fp-examples");
    expect(html).toMatch(/xl:grid-cols-\[minmax\(0,1fr\)_27rem\]/);
    expect(html).not.toContain("data-fp-check-summary");
  });

  it("each thumbnail reserves its check line from the start; the summary row exists as soon as a photo does", () => {
    const photos = ["IMG_1.JPG", "IMG_2.JPG", "IMG_3.HEIC"].map((name, i) => ({ id: `p${i}`, file: new File([new Uint8Array(8)], name, { type: "image/jpeg" }), url: null }));
    const html = renderToStaticMarkup(createElement(PhotoUploader, { ...props, photos }));
    const lines = html.match(/<p data-fp-check="pending" class="([^"]*)"/g) ?? [];
    expect(lines.length).toBe(3);
    for (const l of lines) expect(l).toContain("min-h-[2.5em]");
    expect(html).toContain(`>${INTAKE_COPY.photoCheck.checking}<`);
    expect(html).toMatch(/data-fp-check-summary="checking"[^>]*class="[^"]*min-h-6/);
    expect(html).toContain(INTAKE_COPY.photoCheck.summaryChecking);
    expect(html).not.toMatch(/accent/);
  });
});
