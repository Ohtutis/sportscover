// Component half of the design-system tests (wave0-libs): a smoke render of every §3 component with
// renderToStaticMarkup (all synchronous — no async component in components/), plus the rules the
// shell test delegates here: EtsyButton never accent, CardFlip / BracketFrame / CardFace radius 0,
// the contrast pairs, TrueNumbers figures ⊂ labels, no next/font, no etsy/marketing/art-pipeline import.
//
// createElement with `children` in the props object: the components type `children` as required, so
// TypeScript rejects the positional form; in a .ts test this is the correct call, not a React smell.
/* eslint-disable react/no-children-prop */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formatUsd, getTier, sitePrice, SALE_EXPIRES_AT, siteBase, tiers } from "../lib/catalog/prices";
import { boxContents, TRUE_COUNT_LINKS } from "../lib/catalog/tiers";
import { chipSegment, CHIPS } from "../lib/catalog/delivery";
import { shipsFromFor } from "../lib/catalog/shipping";
import { faqSubset } from "../lib/catalog/faq";
import { photoChecklist } from "../lib/catalog/photo-checklist";
import { CANON, LOOKUP_STRINGS } from "../lib/copy/canon";
import { getCard } from "../lib/registry/cards";
import { ctaFor } from "../lib/cta";
import { trustLineSegments } from "../lib/catalog/trust";
import { contrastRatio } from "../lib/color";
import { Pill } from "../components/Pill";
import { DeliveryChips } from "../components/DeliveryChips";
import { TrustLine } from "../components/TrustLine";
import { TierCard } from "../components/TierCard";
import { FamilyCard } from "../components/FamilyCard";
import { EditionPanel, CERTIFICATE_LINE, SENIOR_EDITION_LINE } from "../components/EditionPanel";
import { StatChip } from "../components/StatChip";
import { Plate } from "../components/Plate";
import { Mat } from "../components/Mat";
import { BracketFrame } from "../components/BracketFrame";
import { CapacityNote } from "../components/CapacityNote";
import { FourFears, PRIVACY_ANSWER_WITHOUT_IMPRINT } from "../components/FourFears";
import { CardQrIcon, EyeIcon, IdCardIcon, RotateCcwIcon, icons } from "../components/icons";
import { GateRow, type Gate } from "../components/GateRow";
import { FounderNote } from "../components/FounderNote";
import { ConsentRow } from "../components/ConsentRow";
import { CardFlip, FLIP_ARIA, FLIP_LABELS } from "../components/CardFlip";
import { CopyIdButton } from "../components/CopyIdButton";
import { ShareRow } from "../components/ShareRow";
import { FaqList } from "../components/FaqList";
import { CtaPair } from "../components/CtaPair";
import { EtsyButton } from "../components/EtsyButton";
import { OrderByCalculator, CALC_STRINGS } from "../components/OrderByCalculator";
import { LookupForm, LOOKUP_BUTTON } from "../components/LookupForm";
import { ProofRejectedPair, REJECTED_TITLE, APPROVED_TITLE } from "../components/ProofRejectedPair";
import { CardFace } from "../components/CardFace";
import { QrRing, QR_RING_DEFAULT } from "../components/QrRing";
import { Ledger } from "../components/Ledger";
import { StatusChip } from "../components/StatusChip";
import { BeforeAfter } from "../components/BeforeAfter";
import { TrueNumbers } from "../components/TrueNumbers";
import { HANG_HEIGHT_IN, SHEET, ToScaleSheet, posterCentreIn } from "../components/ToScaleSheet";
import { PhotoChecklist } from "../components/PhotoChecklist";
import { FICTIONAL_LABEL_SHORT, FictionalLabel } from "../components/FictionalLabel";
import { ButtonLink } from "../components/ButtonLink";

const ROOT = process.cwd();
const read = (f: string) => fs.readFileSync(path.join(ROOT, f), "utf8");
/** React escapes apostrophes and quotes in text; the assertions compare COPY strings, so undo that. */
const unescape = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const render = (el: ReactElement) => unescape(renderToStaticMarkup(el));
const NOW_SALE = new Date(new Date(SALE_EXPIRES_AT).getTime() - 86_400_000);
const NOW_AFTER = new Date(new Date(SALE_EXPIRES_AT).getTime() + 86_400_000);
const IMG = { src: "/images/cards/basketball-trading-card-front-stadium-night.webp", alt: "Custom basketball trading card front — Stadium Night finish — example artwork, fictional athlete", width: 750, height: 1050, fictional: true };
const BACK = { ...IMG, src: "/images/cards/basketball-trading-card-back-registered-stadium-night.webp", alt: "Custom basketball trading card back with season stats, registered card ID and QR code — Stadium Night finish — example artwork, fictional athlete" };
const MARCUS = getCard("GDE-SN-BKB-2026-12")!;
const MARCUS_SR = getCard("GDE-SR-BKB-2026-12")!;

const LIBS_COMPONENTS = [
  "Pill", "DeliveryChips", "TrustLine", "TierCard", "FamilyCard", "EditionPanel", "StatChip", "Plate", "Mat", "BracketFrame",
  "CapacityNote", "FourFears", "GateRow", "FounderNote", "ConsentRow", "CardFlip", "CopyIdButton", "ShareRow", "FaqList", "CtaPair",
  "EtsyButton", "OrderByCalculator", "LookupForm", "ProofRejectedPair", "CardFace", "QrRing", "Ledger", "StatusChip", "BeforeAfter",
  "TrueNumbers", "ToScaleSheet", "PhotoChecklist", "FictionalLabel", "ButtonLink", "FlipSideSwitch",
].map((n) => `components/${n}.tsx`);

describe("component files (CONTRACTS §0.2, §1.3, DESIGN §10.4)", () => {
  it("every wave0-libs component exists", () => {
    for (const f of LIBS_COMPONENTS) expect(fs.existsSync(path.join(ROOT, f)), f).toBe(true);
  });
  it("no async component, no next/font, no etsy/marketing/art-pipeline import", () => {
    for (const f of LIBS_COMPONENTS) {
      const src = read(f);
      expect(src, f).not.toMatch(/export\s+async\s+function|async\s+function\s+[A-Z]/);
      expect(src, f).not.toMatch(/from\s+["']next\/font/);
      expect(src, f).not.toMatch(/from\s+["'][^"']*(etsy|marketing|art-pipeline)\//);
    }
  });
  it("anything depicting a card has radius 0 and no scale/mask", () => {
    for (const f of ["components/CardFlip.tsx", "components/BracketFrame.tsx", "components/CardFace.tsx"]) {
      const src = read(f);
      expect(src, f).not.toMatch(/rounded-(?!card|none)/);
      expect(src, f).not.toMatch(/border-radius/);
      expect(src, f).not.toMatch(/scale-\[/);
      expect(src, f).not.toMatch(/object-cover/);
    }
  });
  it("EtsyButton is outline only — the file never mentions bg-accent", () => {
    expect(read("components/EtsyButton.tsx")).not.toContain("bg-accent");
    expect(read("components/ButtonLink.tsx")).not.toContain("bg-accent");
  });
  it("accent appears only where DESIGN §10.4 allows it", () => {
    const allowed = new Set(["components/Pill.tsx", "components/CtaPair.tsx", "components/BeforeAfter.tsx", "components/BracketFrame.tsx", "components/QrRing.tsx", "components/FourFears.tsx", "components/FamilyCard.tsx"]);
    const offenders = LIBS_COMPONENTS.filter((f) => !allowed.has(f) && /bg-accent|text-accent|border-accent|stroke-accent/.test(read(f)));
    expect(offenders).toEqual([]);
  });
  it("accent colours only an icon (the arrow), never running text", () => {
    for (const f of LIBS_COMPONENTS) {
      for (const m of read(f).match(/<[a-zA-Z]+[^>]*text-accent[^>]*>/g) ?? []) expect(m, f).toMatch(/^<[A-Z]\w*Icon\b/);
    }
  });
  it("every <Image> has fill or width, and sizes when responsive", () => {
    for (const f of LIBS_COMPONENTS) {
      const src = read(f);
      for (const tag of src.match(/<Image[\s\S]*?\/>/g) ?? []) {
        expect(/\bfill\b|width=/.test(tag), `${f}: ${tag}`).toBe(true);
        if (/\bfill\b/.test(tag)) expect(tag, f).toContain("sizes=");
      }
    }
  });
});

describe("Pill / DeliveryChips / TrustLine / StatusChip / Plate / Mat / Ledger", () => {
  it("Pill renders the tone and the text", () => {
    const html = render(createElement(Pill, { tone: "accent", children: "FROM YOUR PHOTOS" }));
    expect(html).toContain("FROM YOUR PHOTOS");
    expect(html).toContain("bg-accent");
    expect(html).toContain("rounded-pill");
    expect(render(createElement(Pill, { tone: "gold", as: "li", children: "SENIOR EDITION · 1 OF 1" }))).toMatch(/^<li/);
  });
  it("DeliveryChips splits the chip and can render one segment", () => {
    const html = render(createElement(DeliveryChips, { kind: "standard" }));
    expect(html).toContain('aria-label="Delivery times"');
    expect(html.match(/<li/g)?.length).toBe(CHIPS.standard.split(" · ").length);
    for (const seg of CHIPS.standard.split(" · ")) expect(html).toContain(seg);
    const one = render(createElement(DeliveryChips, { kind: "standard", segment: "prints" }));
    expect(one.match(/<li/g)?.length).toBe(1);
    expect(one).toContain(chipSegment("prints"));
    expect(render(createElement(DeliveryChips, { kind: "seniorNight", tone: "arena" }))).toContain("SEALED PACK 3–4 WKS");
  });
  it("TrustLine renders the C14 segments and no AI-training claim while unverified", () => {
    const html = render(createElement(TrustLine, {}));
    for (const s of trustLineSegments()) expect(html).toContain(s);
    expect(html).not.toContain("AI training");
    expect(html).toContain(CANON.trustLine.split(" · ")[0]);
    // The middot travels with the segment before it, so a wrapped line never opens with "·".
    const segments = trustLineSegments();
    for (const [i, segment] of segments.entries()) {
      const expected = i < segments.length - 1 ? `<span>${segment}</span><span aria-hidden="true">·</span>` : `<span>${segment}</span></span>`;
      expect(unescape(html)).toContain(expected);
    }
    expect(html).not.toContain('<span aria-hidden="true">·</span><span>');
  });
  it("StatusChip carries visible text and is outline", () => {
    const html = render(createElement(StatusChip, { status: "fail" }));
    expect(html).toContain("FAIL");
    expect(html).toContain("border-fail");
    expect(html).not.toContain("bg-fail text");
    expect(render(createElement(StatusChip, { status: "pass" }))).toContain("PASS");
    expect(render(createElement(StatusChip, { status: "note" }, "NOTE"))).toContain("NOTE");
  });
  it("Plate, Mat and Ledger render", () => {
    expect(render(createElement(Plate, { tone: "arena", children: "text" }))).toContain("bg-arena");
    expect(render(createElement(Plate, { tone: "stock", padding: "sm", children: "text" }))).toContain("rounded-[4px]");
    const mat = render(createElement(Mat, { tone: "arena", aspect: "aspect-[4/5]", children: "x" }));
    expect(mat).toContain("bg-arena");
    expect(mat).toContain("rounded-ui");
    const ledger = render(createElement(Ledger, { rows: [{ key: "Size", value: "2.5 × 3.5 in (63.5 × 89 mm)" }, { key: "Corners", value: "Square-cut" }], size: "lg" }));
    expect(ledger).toMatch(/^<dl/);
    expect(ledger.match(/<dt/g)?.length).toBe(2);
    expect(ledger).toContain("Square-cut");
  });
});

describe("TierCard / FamilyCard / TrueNumbers", () => {
  const p12 = getTier("GDE-ANY-CARD-P12")!;
  const cta = ctaFor("cards", { sku: "GDE-BKB-CARD-P12" });
  it("TierCard shows the current price via priceDisplay and the sale line only while the sale runs", () => {
    const html = render(createElement(TierCard, { tier: p12, now: NOW_SALE, box: boxContents(p12.sku), shipsFrom: shipsFromFor(p12.sku), chip: chipSegment("prints"), cta }));
    expect(html).toContain(formatUsd(sitePrice(p12, NOW_SALE)));
    expect(html).toContain(formatUsd(siteBase(p12)));
    expect(html).toContain("Sale price until Sep 24, 2026");
    expect(html).toContain("FEATURED");
    expect(html).toContain('id="tier-GDE-ANY-CARD-P12"');
    expect(html).toContain("Every digital file above");
    expect(html).toContain("Free printed Certificate of Authenticity");
    expect(html).toContain("Professional photo print lab, Santa Cruz CA");
    expect(html).toContain(chipSegment("prints"));
    expect(html).toContain("/go/etsy/GDE-BKB-CARD-P12");
    const after = render(createElement(TierCard, { tier: p12, now: NOW_AFTER, box: [], shipsFrom: "", chip: chipSegment("prints"), cta }));
    expect(after).not.toContain("Sale price until");
    expect(after).not.toMatch(/<s[\s>]/);
    expect(after).toContain(formatUsd(siteBase(p12)));
  });
  it("TierCard pins the delivery chip and the CTA to the bottom as one block, and insets the pill", () => {
    const html = render(createElement(TierCard, { tier: p12, now: NOW_SALE, box: boxContents(p12.sku), shipsFrom: shipsFromFor(p12.sku), chip: chipSegment("prints"), cta }));
    // The chip used to sit under the box list, leaving 54 px of dead space above the CTA.
    expect(html).toMatch(/<div class="mt-auto pt-6"><ul aria-label="Delivery times"[^]*?<div class="flex flex-col gap-3 sm:flex-row mt-4">/);
    expect(html).toContain("absolute -top-3 left-6");
    expect(html).not.toContain("absolute -top-3 left-5");
  });
  it("every enabled tier renders without a hand-typed price", () => {
    for (const t of tiers.filter((x) => x.enabled)) {
      const html = render(createElement(TierCard, { tier: t, now: NOW_SALE, box: boxContents(t.sku), shipsFrom: shipsFromFor(t.sku), chip: chipSegment(t.physical ? "prints" : "digital"), cta }));
      expect(html).toContain(t.name);
    }
  });
  it("FamilyCard is one link with the from price", () => {
    const html = render(createElement(FamilyCard, { family: "cards", from: 32.99, truths: ["a", "b", "c"], image: IMG, href: "/trading-cards", cta: "See trading cards" }));
    expect(html).toContain('href="/trading-cards"');
    expect(html).toContain("from $32.99");
    expect(html).toContain("Trading Cards");
    expect(html).toContain(CANON.fictionalLabel);
    expect(html.match(/<a /g)?.length).toBe(1);
  });
  it("TrueNumbers: every figure is a case-insensitive substring of its label; five links", () => {
    for (const l of TRUE_COUNT_LINKS) expect(l.label.toLowerCase(), l.figure).toContain(l.figure.toLowerCase());
    const html = render(createElement(TrueNumbers, { tone: "arena" }));
    expect(html.match(/<a /g)?.length).toBe(TRUE_COUNT_LINKS.length);
    for (const l of TRUE_COUNT_LINKS) {
      expect(html).toContain(l.label);
      expect(html).toContain(`href="${l.href}"`);
    }
    expect(render(createElement(TrueNumbers, { tone: "stock" }))).toContain("text-muted-text");
  });
});

describe("EditionPanel / StatChip", () => {
  it("renders the COPY §2.15 rows for the demo card and never says Verified", () => {
    const html = render(createElement(EditionPanel, { card: MARCUS, tone: "stock", demoLabel: "Example edition · Fictional athlete", lastUpdated: true }));
    expect(html).toContain('aria-label="Edition details"');
    for (const row of ["EDITION ID", "FINISH", "SPORT", "SEASON", "REGISTERED", "CERTIFICATE"]) expect(html).toContain(row);
    expect(html).toContain("GDE-SN-BKB-2026-12");
    expect(html).toContain("Stadium Night");
    expect(html).toContain("Basketball");
    expect(html).toContain("Aug 27, 2026");
    expect(html).toContain(CERTIFICATE_LINE);
    expect(html).toContain(CANON.aiActLine);
    expect(html).toContain(CANON.packLine);
    expect(html).toContain("Last updated");
    expect(html).toContain("Example edition · Fictional athlete");
    expect(html).toContain("REGISTERED EDITION");
    expect(html).not.toMatch(/verified/i);
    expect(html).not.toContain("EDITION</dt>");
  });
  it("Senior Night adds the EDITION row and the gold pill; copyButton mounts the island", () => {
    const html = render(createElement(EditionPanel, { card: MARCUS_SR, tone: "arena", copyButton: true }));
    expect(html).toContain(SENIOR_EDITION_LINE);
    expect(html).toContain("border-gold");
    expect(html).toContain('aria-label="Copy ID');
    expect(html).toContain("starting:opacity-0");
  });
  it("StatChip is a labelled group", () => {
    const html = render(createElement(StatChip, { value: "18.4", label: "PPG" }));
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="PPG 18.4"');
  });
});

describe("BracketFrame / CardFace / QrRing / BeforeAfter / ProofRejectedPair / FictionalLabel", () => {
  it("BracketFrame draws four accent corners and a file-tab label as a figure", () => {
    const html = render(createElement(BracketFrame, { label: "KIT PLATE · FRONT", caption: "Kit plate", fictional: true, children: "art" }));
    expect(html).toMatch(/^<figure/);
    expect(html.match(/border-accent/g)?.length).toBe(4);
    expect(html).toContain("KIT PLATE · FRONT");
    expect(html).toContain("<figcaption");
    expect(html).toContain(CANON.fictionalLabel);
    expect(render(createElement(BracketFrame, { children: "art" }))).toMatch(/^<div/);
  });
  it("CardFace is a 5:7 object-contain box with C13 under it unless labelled", () => {
    const html = render(createElement(CardFace, IMG));
    expect(html).toContain("aspect-[5/7]");
    expect(html).toContain("object-contain");
    expect(html).toContain("rounded-none");
    expect(html).toContain(`alt="${IMG.alt}"`);
    expect(html).toContain(CANON.fictionalLabel);
    expect(render(createElement(CardFace, { ...IMG, labelled: true }))).not.toContain(CANON.fictionalLabel);
    expect(render(createElement(CardFace, { ...IMG, surface: "arena", fill: true }))).toContain("absolute inset-0");
  });
  it("QrRing is decorative accent chrome at the measured centre", () => {
    const html = render(createElement(QrRing, {}));
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("border-accent");
    expect(html).toContain(`left:${QR_RING_DEFAULT.center.x}%`);
    expect(html).toContain(`top:${QR_RING_DEFAULT.center.y}%`);
  });
  it("BeforeAfter: pinned before photo with an in-frame label, an accent arrow, the product after", () => {
    const html = render(createElement(BeforeAfter, { before: IMG, after: createElement("div", null, "after") }));
    expect(html).toContain("stroke-accent");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("ring-[6px]");
    expect(html).toContain(CANON.fictionalLabel);
    expect(html).toContain("after");
    expect(render(createElement(BeforeAfter, { after: createElement("div"), arrow: "down" }))).not.toContain("<img");
  });
  it("BeforeAfter gives the before box an explicit width wherever it sits in a grid track", () => {
    // A `w-full` box whose only child is an `Image fill` has no intrinsic width: in the `auto` track
    // it measured 0 x 0 and the buyer saw an arrow pointing at nothing.
    const auto = render(createElement(BeforeAfter, { before: IMG, after: createElement("div") }));
    expect(auto).toMatch(/class="relative shrink-0 w-full max-w-\[168px\] lg:w-\[168px\]"/);
    const right = render(createElement(BeforeAfter, { before: IMG, after: createElement("div"), arrow: "right" }));
    expect(right).toMatch(/class="relative shrink-0 w-\[168px\]"/);
    const down = render(createElement(BeforeAfter, { before: IMG, after: createElement("div"), arrow: "down" }));
    expect(down).toMatch(/class="relative shrink-0 w-full max-w-\[168px\]"/);
    // The small frame carries the compact C13, never the 47-character sentence over the photo.
    expect(auto).toContain(FICTIONAL_LABEL_SHORT);
    expect(auto).toContain(CANON.fictionalLabel);
    expect(auto).toContain("sr-only");
  });
  it("ProofRejectedPair carries the FAIL/PASS chips, the fixed captions and C13", () => {
    const html = render(createElement(ProofRejectedPair, { fail: IMG, pass: IMG }));
    expect(html).toContain("FAIL");
    expect(html).toContain("PASS");
    expect(html).toContain(REJECTED_TITLE);
    expect(html).toContain(APPROVED_TITLE);
    expect(html).toContain("aspect-[2/3]");
    expect(html).toContain(CANON.fictionalLabel);
  });
  it("FictionalLabel is C13, in frame or under", () => {
    expect(render(createElement(FictionalLabel, {}))).toContain(CANON.fictionalLabel);
    expect(render(createElement(FictionalLabel, { inFrame: true }))).toContain("absolute");
  });
  it("FictionalLabel compact shows one word and keeps the whole sentence for assistive tech", () => {
    const html = render(createElement(FictionalLabel, { inFrame: true, compact: true }));
    expect(FICTIONAL_LABEL_SHORT).toBe("Example");
    expect(CANON.fictionalLabel.startsWith(FICTIONAL_LABEL_SHORT)).toBe(true);
    expect(html).toContain(`<span aria-hidden="true">${FICTIONAL_LABEL_SHORT}</span>`);
    expect(html).toContain(`<span class="sr-only">${CANON.fictionalLabel}</span>`);
    expect(html).toContain("absolute");
  });
});

describe("FourFears / GateRow / FounderNote / ConsentRow / CapacityNote / PhotoChecklist / ToScaleSheet", () => {
  it("FourFears long = four links; the privacy card is imprint-gated", () => {
    const html = render(createElement(FourFears, { variant: "long" }));
    expect(html.match(/<a /g)?.length).toBe(4);
    for (const href of ["/how-it-works#likeness", "/about", "/guarantee", "/trading-cards#spec"]) expect(html).toContain(`href="${href}"`);
    expect(html).toContain("Will it look like my kid?");
    expect(html).toContain(PRIVACY_ANSWER_WITHOUT_IMPRINT);
    expect(html).not.toContain("legal entity");
    const short = render(createElement(FourFears, { variant: "short" }));
    expect(short).toContain("Still deciding?");
    expect(short.match(/<a /g)?.length).toBe(4);
  });
  it("FourFears draws the DESIGN §4.8 icon set — eye, id card, rotate-ccw, card with QR", () => {
    for (const [name, marker] of [
      ["likeness", EyeIcon],
      ["privacy", IdCardIcon],
      ["promise", RotateCcwIcon],
      ["card", CardQrIcon],
    ] as const) {
      expect(icons[name]).toBe(marker);
    }
    const html = render(createElement(FourFears, { variant: "long" }));
    for (const Icon of [EyeIcon, IdCardIcon, RotateCcwIcon, CardQrIcon]) {
      const body = render(createElement(Icon, { size: 24 })).replace(/^<svg[^>]*>|<\/svg>$/g, "");
      expect(html).toContain(body);
    }
    // No smiley, no padlock shackle, no shield outline — and the card icon keeps radius 0.
    expect(html).not.toContain("M9 10v.5M15 10v.5");
    expect(html).not.toContain('d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2.5"');
    expect(html).not.toMatch(/<rect[^>]*\srx=/);
  });
  it("GateRow renders one details per gate, all open and none exclusive, chips with text", () => {
    const gates: Gate[] = Array.from({ length: 6 }, (_, i) => ({
      id: `gate-${i + 1}`,
      label: `Gate ${i + 1}`,
      status: i === 0 ? "note" : "pass",
      body: createElement("p", null, "body"),
      artefact: { src: "/images/x.webp", alt: "artefact", caption: "caption", width: 1200, height: 900 },
      tab: "KIT PLATE · FRONT",
      sideNote: i === 1 ? "note" : undefined,
    }));
    const html = render(createElement(GateRow, { gates }));
    expect(html.match(/<details/g)?.length).toBe(6);
    // Exclusive disclosure hid 10 of the 11 process artefacts behind the one text-only gate.
    expect(html).not.toMatch(/<details[^>]*\sname=/);
    expect(html.match(/<details[^>]*\sopen/g)?.length).toBe(6);
    expect(html.match(/<img/g)?.length).toBe(6);
    expect(html).toContain('href="#gate-3"');
    expect(html).toContain("01 / 06");
    expect(html).toContain("KIT PLATE · FRONT");
    expect(html).toContain("NOTE");
  });
  it("FounderNote is signed and has no image while the photo is absent", () => {
    const html = render(createElement(FounderNote, { variant: "home" }));
    expect(html).toContain("John Birch");
    expect(html).toContain("<blockquote");
    expect(html).toContain("<cite");
    expect(html).toContain("italic");
    expect(html).not.toContain("<img");
    expect(render(createElement(FounderNote, { variant: "signature" }))).toContain("John Birch");
  });
  it("ConsentRow binds the label", () => {
    const html = render(createElement(ConsentRow, { id: "consent-likeness", name: "consent", label: "I consent.", required: true }));
    expect(html).toContain('for="consent-likeness"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("required");
  });
  it("CapacityNote renders the chip-derived dates for a fixed now", () => {
    const html = render(createElement(CapacityNote, { now: new Date("2026-09-05T15:00:00Z") }));
    expect(html).toContain("Next available start: Sep 8, 2026");
    expect(html).toContain("files by Sep 10, 2026");
    expect(html).toContain("prints ship by Sep 17, 2026");
  });
  it("PhotoChecklist renders the nine rows", () => {
    const html = render(createElement(PhotoChecklist, { items: photoChecklist, printable: true }));
    expect(html.match(/<li/g)?.length).toBe(9);
    expect(html).toContain("Face large and sharp.");
    expect(html).toContain("print:break-inside-avoid");
  });
  it("ToScaleSheet is an SVG drawn in inches", () => {
    const html = render(createElement(ToScaleSheet, {}));
    expect(html).toContain('viewBox="0 0 96 84"');
    expect(html).toContain('role="img"');
    expect(html).toContain("18 × 24 in poster");
    expect(html).toContain("24 × 36 in poster");
    expect(html).toContain("58 IN · HANG CENTER");
    expect(html).toContain("5 FT 9 IN");
    expect(html).not.toContain("<img");
  });
  it("both poster centres land on the 58 in hang line, and the label says so", () => {
    // The sheet used to hang both posters with their centres 22 in off the floor — knee height —
    // while printing "58 IN · HANG CENTER".
    expect(HANG_HEIGHT_IN).toBe(58);
    expect(SHEET.floorY - SHEET.hangY).toBe(HANG_HEIGHT_IN);
    expect(posterCentreIn(SHEET.poster1824)).toBe(HANG_HEIGHT_IN);
    expect(posterCentreIn(SHEET.poster2436)).toBe(HANG_HEIGHT_IN);
    const html = render(createElement(ToScaleSheet, {}));
    expect(html).toContain(`${HANG_HEIGHT_IN} IN · HANG CENTER`);
    // The label starts left of the figure and the figure's own box, so it never runs through it.
    expect(SHEET.figure.x - SHEET.figure.shoulderHalf).toBeGreaterThan(23);
    // A poster reads as a frame, not as an image that failed to load: pale ground, hairline mount.
    expect(html).toContain('fill-opacity="0.06"');
    expect(html).toContain('stroke="var(--color-hairline)"');
    expect(html).not.toContain('fill="#FFFFFF"');
  });
});

describe("CardFlip / CopyIdButton / ShareRow (client islands, server render)", () => {
  it("CardFlip server render is the front face, a real button, no animation class, MP4 in noscript", () => {
    const html = render(createElement(CardFlip, { front: IMG, back: BACK, mp4: "/cards/GDE-SN-BKB-2026-12/flip.mp4", priority: true, autoplay: false, videoLabel: "Card flip video, Marcus Ellison, Stadium Night finish" }));
    expect(html).toContain(`aria-label="${FLIP_ARIA.toBack}"`);
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain(FLIP_LABELS.flip);
    expect(html).toContain("aspect-[5/7]");
    expect(html).toContain("perspective-[1200px]");
    expect(html).toContain("backface-hidden");
    expect(html).toContain("rotate-y-180");
    expect(html).not.toContain("animate-card-flip");
    expect(html).toContain(`alt="${IMG.alt}"`);
    expect(html).toContain(`alt="${BACK.alt}"`);
    expect(html).toContain("<noscript>");
    expect(html).toContain('preload="none"');
    expect(html).toContain("muted");
    expect(html).toContain('poster="/images/cards/basketball-trading-card-front-stadium-night.webp"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("Front</button>");
    expect(render(createElement(CardFlip, { front: IMG, back: BACK }))).not.toContain("<video");
  });
  it("CardFlip ports the flip.html curve through the theme tokens (radius 0, 5 s, same keyframes)", () => {
    const css = read("app/globals.css");
    expect(css).toContain("--duration-flip: 5000ms");
    expect(css).toContain("--ease-flip: cubic-bezier(0.4, 0, 0.2, 1)");
    for (const stop of ["rotateY(38deg) scale(1.03)", "rotateY(90deg) scale(1.04)", "rotateY(142deg) scale(1.03)"]) expect(css).toContain(stop);
    const src = read("components/CardFlip.tsx");
    expect(src).toContain("animate-card-flip-back");
    expect(src).toContain("IntersectionObserver");
    expect(src).toContain("threshold: 0.5");
    expect(src).toContain("prefers-reduced-motion");
  });
  it("CopyIdButton and ShareRow have labelled controls and polite live regions", () => {
    const copy = render(createElement(CopyIdButton, { value: "GDE-SN-BKB-2026-12" }));
    expect(copy).toContain('aria-label="Copy ID');
    expect(copy).toContain('aria-live="polite"');
    const share = render(createElement(ShareRow, { url: "https://www.gamedayedition.com/c/GDE-SN-BKB-2026-12", text: "Marcus Ellison · Cedar Ridge Bears · Stadium Night — Registered Game Day Edition" }));
    expect(share).toContain("Copy link");
    expect(share).not.toContain(">Share<");
    expect(share).toContain('aria-live="polite"');
  });
});

describe("FaqList / CtaPair / EtsyButton / ButtonLink / LookupForm / OrderByCalculator", () => {
  it("FaqList renders details rows and FAQPage JSON-LD for exactly the rendered items", () => {
    const items = faqSubset("trading-cards");
    const html = render(createElement(FaqList, { items, jsonLd: true }));
    expect(html.match(/<details/g)?.length).toBe(items.length);
    expect(html).toContain('type="application/ld+json"');
    expect(html.match(/"@type":"Question"/g)?.length).toBe(items.length);
    expect(render(createElement(FaqList, { items }))).not.toContain("ld+json");
    expect(render(createElement(FaqList, { items, headingLevel: 2 }))).toContain("<h2");
  });
  it("CtaPair: accent primary, outline secondary, etsy kind delegates to EtsyButton (never accent)", () => {
    const html = render(createElement(CtaPair, ctaFor("home")));
    expect(html).toContain("bg-accent");
    expect(html).toContain('href="/go/etsy/GDE-ANY-SET"');
    expect(html).toContain('href="/registry"');
    expect(html).toContain("h-12");
    const f2 = render(createElement(CtaPair, ctaFor("home", undefined, { sellsDirect: true })));
    expect(f2).toContain("Also on Etsy →");
    const etsy = render(createElement(EtsyButton, { sku: "GDE-ANY-SET" }));
    expect(etsy).toContain('href="/go/etsy/GDE-ANY-SET"');
    expect(etsy).not.toContain("bg-accent");
    expect(etsy).toContain("Also on Etsy →");
    const arena = render(createElement(CtaPair, ctaFor("card-page", MARCUS)));
    expect(arena).toContain("Get yours on Etsy →");
    expect(arena).not.toContain("bg-accent");
    expect(arena.match(/<a /g)?.length).toBe(1);
  });
  it("ButtonLink uses a plain anchor for route handlers and mailto, a Link for pages", () => {
    expect(render(createElement(ButtonLink, { href: "/go/etsy/GDE-ANY-SET", children: "x" }))).toContain('href="/go/etsy/GDE-ANY-SET"');
    expect(render(createElement(ButtonLink, { href: "mailto:hello@gamedayedition.com", children: "x" }))).toContain('href="mailto:hello@gamedayedition.com"');
    expect(render(createElement(ButtonLink, { href: "/registry", variant: "outline-arena", size: "sm", children: "x" }))).toContain("h-10");
  });
  it("LookupForm is a plain POST that shows the miss string when asked", () => {
    const html = render(createElement(LookupForm, { inline: true }));
    expect(html).toContain('method="post"');
    expect(html).toContain('action="/registry/lookup"');
    expect(html).toContain('name="id"');
    expect(html).toContain('pattern="[A-Za-z0-9-]{8,24}"');
    expect(html).toContain('autoCapitalize="characters"');
    expect(html).toContain('placeholder="GDE-SN-BKB-2026-12"');
    expect(html).toContain(LOOKUP_BUTTON);
    expect(html).not.toContain('role="status"');
    const miss = render(createElement(LookupForm, { miss: "1" }));
    expect(miss).toContain('role="status"');
    expect(miss).toContain(LOOKUP_STRINGS.miss);
    expect(miss).toContain("FAIL");
    expect(render(createElement(LookupForm, { miss: "private" }))).toContain(LOOKUP_STRINGS.private);
    expect(render(createElement(LookupForm, { tone: "arena" }))).toContain("bg-arena");
  });
  it("OrderByCalculator renders the date form with min = todayEt and no results yet", () => {
    const html = render(createElement(OrderByCalculator, { todayEt: "2026-09-14", cta: { href: "/go/etsy/GDE-ANY-SNSET", label: "Order on Etsy →" }, giftNoteId: "gift-note" }));
    expect(html).toContain('type="date"');
    expect(html).toContain('min="2026-09-14"');
    expect(html).toContain(CALC_STRINGS.label);
    expect(html).toContain(CALC_STRINGS.help);
    expect(html).toContain(CALC_STRINGS.button);
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("Order by");
  });
});

describe("contrast pairs (CONTRACTS §1.2, DESIGN §8)", () => {
  const pairs: [string, string, number][] = [
    ["#14191F", "#F4F3EF", 15],
    ["#5F636A", "#F4F3EF", 5.3],
    ["#6E7278", "#F4F3EF", 4.3],
    ["#14191F", "#FF6B2B", 6],
    ["#172C50", "#F4F3EF", 12],
    ["#FFFFFF", "#172C50", 13],
    ["#FFFFFF", "#080C12", 19],
    ["#AEB6C2", "#080C12", 9],
    ["#C7D0DC", "#080C12", 12],
    ["#C9A227", "#080C12", 8],
    ["#4EAF90", "#080C12", 7],
    ["#14191F", "#4EAF90", 6.5],
    ["#D8554B", "#080C12", 4.9],
    ["#14191F", "#D8554B", 4.4],
    ["#FF6B2B", "#080C12", 6.8],
  ];
  for (const [a, b, min] of pairs) {
    it(`${a} on ${b} ≥ ${min}:1`, () => expect(contrastRatio(a, b)).toBeGreaterThanOrEqual(min));
  }
  it("white on accent fails and is never used; accent as text on stock fails", () => {
    expect(contrastRatio("#FFFFFF", "#FF6B2B")).toBeLessThan(4.5);
    expect(contrastRatio("#FF6B2B", "#F4F3EF")).toBeLessThan(4.5);
  });
});
