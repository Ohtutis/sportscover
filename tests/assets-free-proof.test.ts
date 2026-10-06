// /free-proof v4 (owner review 2026-10-06): sport first, one sport on the whole page. The per-sport art is declared
// in lib/assets.ts as `free-proof.<slug>.card.<CODE> | .poster | .banner | .blanket`, produced by
// scripts/site-assets.ts into public/images/free-proof/<slug>/ and resolved server-side by lib/intake/sport-art.ts
// `freeProofArtMap()` into one compact map the form receives as a prop. Everything here is read from the map, the
// manifest, the denylist and the files on disk (the sources are git-ignored and live only on the owner's Mac).
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { FP_PHOTO_NUMBERS, SITE_ASSETS, assetOrNull } from "../lib/assets";
import { MIX_PHOTOS, PHOTO_SHOTS, PHOTO_SHOT_NUMBER } from "../components/intake/visuals";
import { sports, isNumberless } from "../lib/catalog/sports";
import { FREE_PROOF_FINISH_CODES, freeProofArtMap, freeProofKey, type FreeProofFinishCode } from "../lib/intake/sport-art";

const ROOT = path.resolve(__dirname, "..");
const KiB = 1024;
const LIVE = ["basketball", "football", "baseball", "softball", "soccer", "ice-hockey", "volleyball", "wrestling", "cheerleading"];
const SIX: FreeProofFinishCode[] = ["SN", "CA", "FS", "HE", "SS", "PR"];
const FINISH_NAME: Record<FreeProofFinishCode, string> = {
  SN: "Stadium Night",
  CA: "Chrome All-Star",
  FS: "Fire & Smoke",
  HE: "Heritage",
  SS: "Signature Spotlight",
  PR: "Prism Rush",
  SR: "Senior Night",
};
/** The only gaps on purpose: no Signature Spotlight wrestling front was ever exported. */
const MISSING_CARDS: Record<string, FreeProofFinishCode[]> = { wrestling: ["SS"] };
const ALT_WORD: Record<string, string> = { "ice-hockey": "ice hockey", "track-field": "track & field", "other-sport": "skateboarding" };
const BUDGET = { card: 60 * KiB, poster: 80 * KiB, banner: 80 * KiB, blanket: 80 * KiB, photo: 40 * KiB, identity: 40 * KiB, kit: 40 * KiB } as const;
/** The phone photos keep the 1792 x 2400 source's own ratio (336 x 450), a hair off 3 : 4 — never stretched; the plates keep theirs. */
const RATIO = { card: 5 / 7, poster: 3 / 4, banner: 1 / 2, blanket: 5 / 6, photo: 1792 / 2400, identity: 2400 / 1792, kit: 1 } as const;
/** The roster athlete each sport's phone photos come from — the one on its card (pickleball: the 16-year-old, CLAUDE.md). */
const PHOTO_ATHLETE: Record<string, string> = { pickleball: "pickleball-youth" };
const FORBIDDEN_SOURCE = [/^card-flip\/assets\//, /^print-sources\/output\//, /^exports\//, /^marketing\/cards\//, /^orders\//];

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "public/images/.manifest.json"), "utf8")) as {
  entries: Record<string, { source: string; sourceSha256: string; sha256: string; width: number; height: number; keys: string[]; quality?: number }>;
  keys: Record<string, { out: string; status: string }>;
};
const denied = new Set(
  (JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/denylist.json"), "utf8")) as { entries: { sha256: string }[] }).entries.map((e) => e.sha256),
);
const file = (out: string) => path.join(ROOT, "public", out.replace(/^\//, ""));
const fpKeys = Object.keys(SITE_ASSETS).filter((k) => k.startsWith("free-proof."));
type Item = keyof typeof BUDGET;
const itemOf = (key: string): Item => (key.split(".")[2] === "card" ? "card" : (key.split(".")[2] as Item));

describe("assets — /free-proof per-sport art (v4)", () => {
  it("every key follows the contract: free-proof.<catalog slug>.(card.<CODE>|poster|banner|blanket|photo.<1|4|2>|identity|kit)", () => {
    expect(fpKeys.length).toBeGreaterThan(100);
    const slugs = new Set(sports.map((s) => s.slug));
    for (const k of fpKeys) {
      const m = /^free-proof\.([a-z-]+)\.(card\.(SN|CA|FS|HE|SS|PR|SR)|poster|banner|blanket|photo\.(1|4|2)|identity|kit)$/.exec(k);
      expect(m, k).not.toBeNull();
      expect(slugs.has(m![1]), `${k}: not a catalog sport`).toBe(true);
    }
  });

  it("the nine live sports are complete: six finishes (wrestling five), Senior Night where a set exists, poster, banner, blanket", () => {
    for (const slug of LIVE) {
      const s = sports.find((x) => x.slug === slug)!;
      for (const code of SIX) {
        const want = !(MISSING_CARDS[slug] ?? []).includes(code);
        expect(SITE_ASSETS[freeProofKey(slug, `card.${code}`)]?.status === "verified", `${slug} ${code}`).toBe(want);
      }
      expect(SITE_ASSETS[freeProofKey(slug, "card.SR")]?.status === "verified", `${slug} SR`).toBe(Boolean(s.seniorNightListingId));
      expect(SITE_ASSETS[freeProofKey(slug, "poster")]?.status, `${slug} poster`).toBe("verified");
      expect(SITE_ASSETS[freeProofKey(slug, "banner")]?.status, `${slug} banner`).toBe("verified");
      expect(SITE_ASSETS[freeProofKey(slug, "blanket")]?.status, `${slug} blanket`).toBe("verified");
    }
  });

  it("banner and blanket exist exactly for the sports with a banner listing; Senior Night only where a set exists", () => {
    for (const s of sports) {
      const banner = Boolean(s.bannerListingId);
      expect(Boolean(SITE_ASSETS[freeProofKey(s.slug, "banner")]), `${s.slug} banner`).toBe(banner);
      expect(Boolean(SITE_ASSETS[freeProofKey(s.slug, "blanket")]), `${s.slug} blanket`).toBe(banner);
      if (SITE_ASSETS[freeProofKey(s.slug, "card.SR")]) expect(s.seniorNightListingId, `${s.slug} SR without a set`).toBeTruthy();
    }
  });

  it("every file exists as WebP at its declared size, keeps its kind's ratio and stays in budget", async () => {
    for (const k of fpKeys) {
      const a = SITE_ASSETS[k];
      const item = itemOf(k);
      expect(a.out.startsWith(`/images/free-proof/${k.split(".")[1]}/`), `${k} → ${a.out}`).toBe(true);
      const f = file(a.out);
      expect(fs.existsSync(f), a.out).toBe(true);
      const meta = await sharp(f).metadata();
      expect(meta.format, a.out).toBe("webp");
      expect(`${meta.width}x${meta.height}`, a.out).toBe(`${a.width}x${a.height}`);
      expect(Math.abs(a.width / a.height - RATIO[item]), `${k} ratio`).toBeLessThan(0.002);
      expect(fs.statSync(f).size, `${a.out} is over the ${item} budget`).toBeLessThanOrEqual(BUDGET[item]);
      if (item === "card") {
        expect(a.kind, k).toBe("card");
        expect(a.width, k).toBe(600);
        expect(a.crop, `${k}: a crop would skip the corner audit`).toBeUndefined();
      }
    }
  });

  it("card faces are square-cut: opaque corners, no light corner with a mask step (the DESIGN §6.2 audit, re-run on the WebP)", async () => {
    const lab = (r: number, g: number, b: number) => {
      const lin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      const [R, G, B] = [lin(r), lin(g), lin(b)];
      const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
      const X = f((R * 0.4124564 + G * 0.3575761 + B * 0.1804375) / 0.95047);
      const Y = f(R * 0.2126729 + G * 0.7151522 + B * 0.072175);
      const Z = f((R * 0.0193339 + G * 0.119192 + B * 0.9503041) / 1.08883);
      return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
    };
    const dE = (p: number[], q: number[]) => {
      const a = lab(p[0], p[1], p[2]);
      const b = lab(q[0], q[1], q[2]);
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    };
    for (const k of fpKeys.filter((x) => itemOf(x) === "card")) {
      const { data, info } = await sharp(file(SITE_ASSETS[k].out)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const px = (x: number, y: number) => {
        const i = (y * info.width + x) * 4;
        return [data[i], data[i + 1], data[i + 2], data[i + 3]];
      };
      const w = info.width;
      const h = info.height;
      for (const [x, y, ix, iy] of [
        [2, 2, 18, 18],
        [w - 3, 2, w - 19, 18],
        [2, h - 3, 18, h - 19],
        [w - 3, h - 3, w - 19, h - 19],
      ]) {
        const c = px(x, y);
        expect(c[3], `${k} corner (${x},${y}) is transparent`).toBe(255);
        const light = Math.min(dE(c, [255, 255, 255]), dE(c, [0xf4, 0xf3, 0xef])) < 8;
        if (light) expect(dE(c, px(ix, iy)), `${k} corner (${x},${y}) steps like a rounded mask`).toBeLessThanOrEqual(20);
      }
    }
  });

  it("sources come from the listing exports (the phone photos from the roster athlete), never a retired root, and are the documented files", () => {
    for (const k of fpKeys) {
      const a = SITE_ASSETS[k];
      const [, slug, item, code] = k.split(".");
      const src = a.source ?? "";
      for (const re of FORBIDDEN_SOURCE) expect(re.test(src), `${k}: ${src}`).toBe(false);
      if (item === "card" && code === "SR") {
        expect(src, k).toBe(SITE_ASSETS[`sn.sport.${slug}.front`].source);
      } else if (item === "card") {
        expect(src, k).toMatch(new RegExp(`^etsy/listing-images/01-${slug}-card/src/[A-Z]{2}-${code}-(front|card-FRONT)\\.png$`));
      } else if (item === "poster") {
        expect(src, k).toMatch(new RegExp(`^etsy/listing-images/02-${slug}-poster/src/[A-Z]{2}-(SN|CA|FS|HE|SS|PR)-poster(-v2)?\\.png$`));
      } else if (item === "banner") {
        expect(src, k).toBe(`etsy/listing-images/03-${slug}-banner/src/master-HE.png`);
      } else if (item === "photo") {
        // the roster athlete's own generated "before" photos — never a customer's (orders/ and the Order folders)
        expect(src, k).toBe(`art-pipeline/out/athletes/${PHOTO_ATHLETE[slug] ?? slug}/before/photo${code}.png`);
        expect(src, k).not.toMatch(/order/i);
      } else if (item === "identity" || item === "kit") {
        // the same roster athlete's identity plate (three views) and kit plate — the references the shots were checked against
        expect(src, k).toBe(`art-pipeline/out/athletes/${PHOTO_ATHLETE[slug] ?? slug}/_${item}.png`);
        expect(src, k).not.toMatch(/order/i);
      } else {
        // the flat render only: every draped / armchair / room composite stretches or folds the art
        expect(src, k).toMatch(new RegExp(`^etsy/listing-images/05-${slug}-blanket/src/flat56-(SN|CA|FS|HE|SS|PR)\\.png$`));
      }
    }
  });

  it("the manifest records every file with its key, source and hash, and nothing came from a denylisted source", () => {
    for (const k of fpKeys) {
      const a = SITE_ASSETS[k];
      const e = manifest.entries[a.out];
      expect(e, a.out).toBeDefined();
      expect(e.keys, a.out).toContain(k);
      expect(e.source, a.out).toBe(a.source);
      expect(e.quality, a.out).toBe(a.quality);
      expect(denied.has(e.sourceSha256), `${a.out} was converted from a denylisted source`).toBe(false);
      const sha = crypto.createHash("sha256").update(fs.readFileSync(file(a.out))).digest("hex");
      expect(sha, `${a.out} changed since the manifest was written`).toBe(e.sha256);
      expect(denied.has(sha), `${a.out} hash-matches the denylist`).toBe(false);
      expect(manifest.keys[k], k).toEqual({ out: a.out, status: "verified" });
    }
  });

  it("alts follow the house pattern: the sport, the finish, a fictional athlete; the blanket says it is a mockup; a photo says it is generated", () => {
    for (const k of fpKeys) {
      const a = SITE_ASSETS[k];
      const [, slug, item, code] = k.split(".");
      const word = ALT_WORD[slug] ?? slug;
      expect(a.fictional, k).toBe(true);
      expect(assetOrNull(k)?.fictional, k).toBe(true);
      expect(a.alt, k).not.toMatch(/\$\d|\bnumber\b|\byouth\b/i);
      if (item === "photo") {
        expect(a.alt, k).toContain(`Phone photo of a fictional ${word} athlete`);
        expect(a.alt, k).toMatch(/; photo generated$/);
        continue;
      }
      if (item === "identity" || item === "kit") {
        expect(a.kind, k).toBe("plate");
        expect(a.alt, k).toContain(item === "identity" ? `Three views of a fictional ${word} athlete` : `The ${word} kit laid flat`);
        expect(a.alt, k).toMatch(/built from their photos|rebuilt from the photos/);
        expect(a.alt, k).toMatch(/; generated$/);
        // Honest: built and checked, never a copy promised.
        expect(a.alt, k).not.toMatch(/perfect|exact copy|identical/i);
        continue;
      }
      expect(a.alt, k).toContain(`Custom ${word} `);
      expect(a.alt, k).toMatch(/example artwork, fictional athlete/);
      if (item === "card") expect(a.alt, k).toContain(`${FINISH_NAME[code as FreeProofFinishCode]} finish`);
      if (item === "banner") expect(a.alt, k).toContain("Heritage finish");
      if (item === "blanket") expect(a.alt, k).toMatch(/\bmockup\b.*not a photo of a finished blanket/);
    }
  });

  it("each file is used by its own sport only (no file shared across sports or with another page's key)", () => {
    const owner = new Map<string, string>();
    for (const a of Object.values(SITE_ASSETS)) {
      if (!a.out.startsWith("/images/free-proof/")) continue;
      expect(a.key.startsWith("free-proof."), `${a.key} points into /images/free-proof/`).toBe(true);
      const slug = a.key.split(".")[1];
      const prev = owner.get(a.out);
      expect(prev === undefined || prev === slug, `${a.out} shared by ${prev} and ${slug}`).toBe(true);
      owner.set(a.out, slug);
    }
  });
});

describe("lib/intake/sport-art.ts — freeProofArtMap()", () => {
  const map = freeProofArtMap();

  it("covers every sport with audited art and the nine live sports completely", () => {
    for (const slug of LIVE) {
      const e = map[slug];
      expect(e, slug).toBeDefined();
      const want = SIX.filter((c) => !(MISSING_CARDS[slug] ?? []).includes(c));
      for (const c of want) expect(e.cards[c], `${slug} ${c}`).toBeDefined();
      expect(e.poster && e.banner && e.blanket, slug).toBeTruthy();
    }
    for (const [slug, e] of Object.entries(map)) {
      expect(sports.some((s) => s.slug === slug), slug).toBe(true);
      expect(Object.keys(e.cards).every((c) => (FREE_PROOF_FINISH_CODES as readonly string[]).includes(c)), slug).toBe(true);
    }
  });

  it("mirrors the asset keys exactly: same src, size and alt; nothing invented, nothing from another sport", () => {
    let n = 0;
    for (const [slug, e] of Object.entries(map)) {
      const items: Array<[string, { src: string; w: number; h: number; alt: string }]> = [
        ...Object.entries(e.cards).map(([c, img]) => [freeProofKey(slug, `card.${c as FreeProofFinishCode}`), img!] as [string, typeof img & object]),
        ...(["poster", "banner", "blanket"] as const).filter((i) => e[i]).map((i) => [freeProofKey(slug, i), e[i]!] as [string, NonNullable<(typeof e)[typeof i]>]),
        ...(e.photos ?? []).map((img, i) => [freeProofKey(slug, `photo.${FP_PHOTO_NUMBERS[i]}`), img] as [string, typeof img]),
        ...(["identity", "kit"] as const).filter((i) => e[i]).map((i) => [freeProofKey(slug, i), e[i]!] as [string, NonNullable<(typeof e)[typeof i]>]),
      ];
      for (const [key, img] of items) {
        const a = SITE_ASSETS[key];
        expect(a?.status, key).toBe("verified");
        expect(img.src, key).toBe(a.out);
        expect([img.w, img.h], key).toEqual([a.width, a.height]);
        expect(img.alt, key).toBe(a.alt);
        expect(img.src.startsWith(`/images/free-proof/${slug}/`), `${key} → ${img.src}`).toBe(true);
        n++;
      }
      for (const i of ["poster", "banner", "blanket"] as const) {
        const img = e[i];
        if (img) expect(img.alt, `${slug} ${i}`).toContain(`${FINISH_NAME[img.finish!]} finish`);
      }
    }
    expect(n).toBe(fpKeys.length);
  });

  it("numberless sports carry no number in any alt the form will print", () => {
    for (const s of sports.filter(isNumberless)) {
      const e = map[s.slug];
      if (!e) continue;
      for (const img of [...Object.values(e.cards), e.poster, e.banner, e.blanket, ...(e.photos ?? [])]) if (img) expect(img.alt).not.toMatch(/#\d|\bnumber\b/i);
    }
  });

  it("every sport has its athlete's three phone photos, in the hero's fan order (everyday, smile, in uniform on top)", () => {
    expect(FP_PHOTO_NUMBERS).toEqual([1, 4, 2]);
    for (const s of sports) {
      const photos = map[s.slug]?.photos;
      expect(photos?.length, s.slug).toBe(3);
      photos!.forEach((img, i) => expect(img.src, s.slug).toMatch(new RegExp(`-phone-photo-${FP_PHOTO_NUMBERS[i]}\\.webp$`)));
    }
  });

  it("the client's shot names map to the asset numbers in the map's own order (everyday 1, smile 4, kit 2)", () => {
    expect(PHOTO_SHOTS.map((shot) => PHOTO_SHOT_NUMBER[shot])).toEqual([...FP_PHOTO_NUMBERS]);
    for (const { slug, shot } of MIX_PHOTOS) expect(map[slug]?.photos?.[PHOTO_SHOTS.indexOf(shot)]?.src, `${slug} ${shot}`).toMatch(new RegExp(`-phone-photo-${PHOTO_SHOT_NUMBER[shot]}\\.webp$`));
  });

  it("every sport has its athlete's identity plate and kit plate (how-it-works card 03)", () => {
    for (const s of sports) {
      expect(map[s.slug]?.identity?.src, s.slug).toMatch(/-identity-three-views\.webp$/);
      expect(map[s.slug]?.kit?.src, s.slug).toMatch(/-kit-plate\.webp$/);
    }
  });

  it("stays compact enough to ship as one prop (under 56 KB of JSON before compression; v5 added the 51 phone photos, v6 the 34 plates)", () => {
    expect(JSON.stringify(map).length).toBeLessThan(56 * KiB);
  });

  it("is server-only: no client component value-imports it (type imports are erased)", () => {
    const src = fs.readFileSync(path.join(ROOT, "lib/intake/sport-art.ts"), "utf8");
    expect(src).not.toMatch(/^\s*["']use client["']/m);
    const walk = (dir: string, out: string[] = []): string[] => {
      if (!fs.existsSync(dir)) return out;
      for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, d.name);
        if (d.isDirectory()) walk(p, out);
        else if (/\.tsx?$/.test(d.name)) out.push(p);
      }
      return out;
    };
    const offenders = ["app", "components", "lib"]
      .flatMap((r) => walk(path.join(ROOT, r)))
      .filter((f) => {
        const t = fs.readFileSync(f, "utf8");
        // `import type { FreeProofArtMap }` is erased at build time and is fine; a value import ships lib/assets.ts
        return /^\s*["']use client["']/m.test(t) && /import\s+(?!type\s)[^;]*?from\s+["'][^"']*intake\/sport-art["']/.test(t);
      })
      .map((f) => path.relative(ROOT, f));
    expect(offenders).toEqual([]);
  });

  it("the provenance is written down in ASSETS-RENDERS", () => {
    const doc = fs.readFileSync(path.join(ROOT, "docs/f1/ASSETS-RENDERS.md"), "utf8");
    const at = doc.indexOf("## Free-proof per-sport art (2026-10-06)");
    expect(at, 'docs/f1/ASSETS-RENDERS.md lost its "Free-proof per-sport art (2026-10-06)" section').toBeGreaterThan(-1);
    const next = doc.indexOf("\n## ", at + 1);
    const section = next === -1 ? doc.slice(at) : doc.slice(at, next);
    for (const s of sports) expect(section, s.slug).toContain(s.slug);
    expect(section).toMatch(/flat56/);
    expect(section).toMatch(/wrestling[\s\S]*Signature Spotlight/);
  });
});
