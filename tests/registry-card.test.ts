// Card art for /c — the asset half of the registry-card row (CONTRACTS §4.10–4.11, GAPS #4/#8/#9).
// Every generated face under public/cards/<id>/ must have passed the corner audit and the QR decode
// recorded in its manifest, and the back must still decode live to the card URL.
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import jsQR from "jsqr";
import { cards, cardUrl, getCard, visibilityOf } from "../lib/registry/cards";
import { ART_PENDING, ART_REQUIRED, cardArtDir, cardArtExists, cardArtFor, cardArtPaths, isArtPending } from "../lib/registry/art";
import { DEMO_ART_SOURCES, isForbiddenSource, isOrderSource } from "../lib/registry/art-sources";

const ROOT = process.cwd();
const CARDS_DIR = path.join(ROOT, "public", "cards");
const FLIP_MAX_BYTES = 1_000_000;

const generatedIds = fs.existsSync(CARDS_DIR)
  ? fs
      .readdirSync(CARDS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== "qr")
      .map((d) => d.name)
  : [];

const sha256 = (file: string) => createHash("sha256").update(fs.readFileSync(file)).digest("hex");

interface Manifest {
  cardId: string;
  sourceKind: "demo" | "order";
  sources: { front: { path: string; sha256: string }; back: { path: string; sha256: string }; mp4: { path: string | null } | null };
  outputs: {
    front: { path: string; width: number; height: number; sha256: string };
    back: { path: string; width: number; height: number; sha256: string };
    flipMp4: { path: string; bytes: number } | null;
    poster: string | null;
  };
  cornerAudit: { front: { pass: boolean }; back: { pass: boolean }; pass: boolean };
  qr: { expected: string; decoded: string | null; pass: boolean; patched: boolean };
}

const readManifest = (id: string): Manifest => JSON.parse(fs.readFileSync(path.join(cardArtDir(id), "manifest.json"), "utf8")) as Manifest;

// GAPS #8 (five Figma/regeneration exports) + the two back-less ids added by the integrator (ticket F1-ART-05).
const GAPS_8 = ["GDE-CA-SFB-2026-03", "GDE-SN-SFB-2026-03", "GDE-FS-WRS-2026-01", "GDE-HE-WRS-2026-01", "GDE-SN-BKB-2026-23", "GDE-HE-FTB-2026-54", "GDE-SS-CHR-2026-01"];

describe("ART_PENDING (GAPS #8)", () => {
  it("is exactly the pending ids", () => {
    expect([...ART_PENDING.map((p) => p.cardId)].sort()).toEqual([...GAPS_8].sort());
    expect(new Set(ART_PENDING.map((p) => p.cardId)).size).toBe(ART_PENDING.length);
  });
  it("every entry is a public fictional record with a ticket and a reason", () => {
    for (const p of ART_PENDING) {
      const c = getCard(p.cardId);
      expect(c, p.cardId).toBeDefined();
      expect(c?.isFictional, `${p.cardId} fictional`).toBe(true);
      expect(visibilityOf(c!), `${p.cardId} visibility`).not.toBe("deleted");
      expect(["F1-ART-01", "F1-ART-02", "F1-ART-05"]).toContain(p.ticket);
      expect(p.reason.trim().length).toBeGreaterThan(20);
    }
  });
  it("partitions the public fictional records with ART_REQUIRED", () => {
    const all = cards.filter((c) => c.isFictional && visibilityOf(c) !== "deleted").map((c) => c.cardId).sort();
    const union = [...ART_REQUIRED, ...ART_PENDING.map((p) => p.cardId)].sort();
    expect(union).toEqual(all);
    expect(ART_REQUIRED.filter((id) => isArtPending(id))).toEqual([]);
    expect(new Set(ART_REQUIRED).size).toBe(ART_REQUIRED.length);
  });
  it("no pending id has generated art (a landed export must leave the list)", () => {
    for (const p of ART_PENDING) {
      expect(fs.existsSync(cardArtDir(p.cardId)), `${p.cardId} has public/cards/<id>/`).toBe(false);
      expect(cardArtFor(p.cardId)).toBeNull();
    }
  });
});

describe("ART_REQUIRED art exists", () => {
  for (const id of ART_REQUIRED) {
    it(`${id} has front.webp and back.webp`, () => {
      const exists = cardArtExists(id);
      expect(exists.front, `${id} front.webp`).toBe(true);
      expect(exists.back, `${id} back.webp`).toBe(true);
      expect(cardArtFor(id)).toMatchObject({ front: cardArtPaths(id).front, back: cardArtPaths(id).back });
    });
  }
});

describe("cardArtFor", () => {
  it("is null for unknown ids", () => {
    expect(cardArtFor("GDE-XX-XXX-2099-00")).toBeNull();
  });
  it("names the flip only when flip.mp4 exists, with the front as poster", () => {
    for (const id of generatedIds) {
      const art = cardArtFor(id);
      if (!art) continue;
      const hasFlip = fs.existsSync(path.join(cardArtDir(id), "flip.mp4"));
      expect(Boolean(art.flipMp4), `${id} flipMp4`).toBe(hasFlip);
      if (hasFlip) expect(art.poster).toBe(art.front);
      expect(art.flipGif, `${id} no GIFs in F1 (GAPS #6)`).toBeUndefined();
    }
  });
  it("paths never leave /cards/<id>/", () => {
    const p = cardArtPaths("GDE-SN-BKB-2026-12");
    expect(p.front).toBe("/cards/GDE-SN-BKB-2026-12/front.webp");
    expect(p.back).toBe("/cards/GDE-SN-BKB-2026-12/back.webp");
    expect(p.flipMp4).toBe("/cards/GDE-SN-BKB-2026-12/flip.mp4");
  });
});

describe("generated public/cards/<id>/", () => {
  it("scans the generated set", () => {
    expect(generatedIds.length).toBeGreaterThan(0);
  });
  for (const id of generatedIds) {
    describe(id, () => {
      const card = getCard(id);
      it("belongs to a registry record that is not pending", () => {
        expect(card, "registry record").toBeDefined();
        expect(isArtPending(id)).toBe(false);
        expect(visibilityOf(card!)).not.toBe("deleted");
      });
      it("manifest passed the corner audit and the QR decode", () => {
        const m = readManifest(id);
        expect(m.cardId).toBe(id);
        expect(m.cornerAudit.pass).toBe(true);
        expect(m.cornerAudit.front.pass).toBe(true);
        expect(m.cornerAudit.back.pass).toBe(true);
        expect(m.qr.pass).toBe(true);
        expect(m.qr.patched).toBe(true);
        expect(m.qr.expected).toBe(cardUrl(id));
        expect(m.qr.decoded).toBe(cardUrl(id));
        expect(m.outputs.front.path).toBe(cardArtPaths(id).front);
        expect(m.outputs.back.path).toBe(cardArtPaths(id).back);
      });
      it("faces are 5:7, never upscaled past 900×1260, and match the manifest hashes", () => {
        const m = readManifest(id);
        for (const face of ["front", "back"] as const) {
          const file = path.join(cardArtDir(id), `${face}.webp`);
          expect(fs.existsSync(file), file).toBe(true);
          const out = m.outputs[face];
          expect(out.width).toBeLessThanOrEqual(900);
          expect(Math.abs(out.width / out.height / (5 / 7) - 1)).toBeLessThanOrEqual(0.01);
          expect(sha256(file), `${face}.webp hash`).toBe(out.sha256);
        }
        expect(m.outputs.front.width).toBe(m.outputs.back.width);
      });
      it("back.webp decodes live to the card URL", async () => {
        const { data, info } = await sharp(path.join(cardArtDir(id), "back.webp")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        const qr = jsQR(new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), info.width, info.height);
        expect(qr?.data).toBe(cardUrl(id));
      });
      it("flip.mp4, when present, is ≤ 1 MB and recorded", () => {
        const m = readManifest(id);
        const file = path.join(cardArtDir(id), "flip.mp4");
        if (!fs.existsSync(file)) {
          expect(m.outputs.flipMp4).toBeNull();
          return;
        }
        const bytes = fs.statSync(file).size;
        expect(bytes).toBeLessThanOrEqual(FLIP_MAX_BYTES);
        expect(m.outputs.flipMp4?.bytes).toBe(bytes);
        expect(m.outputs.poster).toBe(cardArtPaths(id).front);
        expect(fs.existsSync(path.join(cardArtDir(id), "flip.gif")), "no GIFs (GAPS #6)").toBe(false);
      });
      it("a real customer's manifest withholds the order paths", () => {
        const m = readManifest(id);
        const text = fs.readFileSync(path.join(cardArtDir(id), "manifest.json"), "utf8");
        if (m.sourceKind === "order") {
          expect(card?.isFictional).toBeFalsy();
          expect(text).not.toMatch(/orders\//);
          expect(text).not.toMatch(/\b\d{10}\b/);
        } else {
          expect(card?.isFictional).toBe(true);
        }
      });
    });
  }
});

describe("art sources (lib/registry/art-sources.ts)", () => {
  it("every registry record has an entry and every entry has a record", () => {
    const ids = cards.map((c) => c.cardId).sort();
    expect(Object.keys(DEMO_ART_SOURCES).sort()).toEqual(ids);
  });
  it("never points at a forbidden (Nia-era / pre-square-corner) path", () => {
    for (const [id, src] of Object.entries(DEMO_ART_SOURCES)) {
      for (const p of [src.front, src.back, src.mp4]) {
        if (p) expect(isForbiddenSource(p), `${id}: ${p}`).toBe(false);
      }
    }
  });
  it("order sources belong to real customers only, and every orders/ path is marked order", () => {
    for (const [id, src] of Object.entries(DEMO_ART_SOURCES)) {
      const card = getCard(id)!;
      if (src.sourceKind === "order") expect(card.isFictional, `${id} order source on a fictional record`).toBeFalsy();
      for (const p of [src.front, src.back, src.mp4]) {
        if (p && isOrderSource(p)) expect(src.sourceKind, `${id}: ${p} must be sourceKind order`).toBe("order");
      }
    }
  });
  it("pending tickets are pre-declared on exactly the ART_PENDING ids", () => {
    const declared = Object.entries(DEMO_ART_SOURCES)
      .filter(([, s]) => s.pending)
      .map(([id]) => id)
      .sort();
    expect(declared).toEqual([...ART_PENDING.map((p) => p.cardId)].sort());
    for (const p of ART_PENDING) expect(DEMO_ART_SOURCES[p.cardId].pending).toBe(p.ticket);
  });
});

describe("no public/cards path is typed outside lib/registry", () => {
  const roots = ["app", "components", "lib"].map((r) => path.join(ROOT, r));
  const files: string[] = [];
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name) && !p.includes(`${path.sep}lib${path.sep}registry${path.sep}`)) files.push(p);
    }
  };
  roots.forEach(walk);
  it("scans a non-empty set of files", () => expect(files.length).toBeGreaterThan(0));
  it("only lib/registry/art.ts knows where the faces live (the shared QR dir public/cards/qr/ is allowed)", () => {
    const offenders = files.filter((f) => {
      const text = fs.readFileSync(f, "utf8");
      return /public[\\/]cards(?![\\/]qr[\\/])/.test(text) || /(["'`(]|\s)\/cards\/(?!qr\/)/.test(text);
    });
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
  });
});
