# F1 BUILD CONTRACTS — gamedayedition.com (2026-09-06)

Technical contracts for the parallel F1 build (`docs/SITE-BUILD-SPEC-2026-09.md` §11 F1). Companion to
`docs/f1/COPY.md` (every string) — this file is the code side: tokens, fonts, component APIs, lib
signatures, file ownership, metadata rules, budgets and the definition of done. Builders paste copy from
COPY.md and build against the interfaces here. **Names and signatures in this file are frozen.** If you
need to change one, do not edit the shared file — append a dated note under your builder name in
`docs/f1/INTEGRATION-NOTES.md` (append-only, create if missing) and carry on with a local workaround.

Repo facts this contract is built on (verified 2026-09-06, branch `site/f1`): Next 16.2.6, React 19.2,
Tailwind 4.2.1 via `@tailwindcss/postcss` (`app/globals.css` starts with `@import "tailwindcss"` and has **no**
`@theme` block yet — the current file is the Inter/Oswald, blue/purple Cover-Moment-era sheet and is replaced
wholesale in Wave 0), Vitest 3 (`tests/**/*.test.ts`, node env), ESLint 9 flat config, `sharp` + `tsx` +
`qrcode` installed, `ffmpeg`/`ffprobe` at `/opt/homebrew/bin`. Existing components: `components/BrandMark.tsx`,
`components/FictionalLabel.tsx`, `components/JsonLd.tsx`. Existing lib: `lib/site.ts`, `lib/blocks.ts`,
`lib/catalog/{prices,tiers,delivery,sports,styles,listings}.ts`, `lib/registry/cards.ts`. Existing tests:
`tests/{forbidden-strings,prices,registry}.test.ts` (60 passing). `next.config.ts` has security headers only
(no redirects/rewrites/CSP). The `next/font/google` catalogue (`font-data.json`) contains every family we need.

---

## 0. HOW THE TREE IS SHARED

### 0.1 Waves
| Wave | Who | What | Gate |
|---|---|---|---|
| **0** (sequential, first) | `design-system+shell` | tokens, fonts, every shared component, every shared lib file, route groups + layouts, dead-code removal, the test harness | `tsc` + `vitest` + `next build` green; then Wave 1 starts |
| **1** (parallel, same working tree) | `home` · `families` · `senior-night` · `trust-pages` · `registry-card` · `legal` · `seo-assets` | pages, per-route OG images, page tests, assets | each builder's DoD (§8) |
| **2** | integrator | `npm run cards:assets && npm run site:assets`, one `next build`, Lighthouse on `/`, `/c/GDE-SN-BKB-2026-12`, `/trading-cards`, `/senior-night`; commit | F1 exit criteria (spec §11) |

If only six Wave-1 agents are available, `legal` runs inside `trust-pages` (sequentially, after its own
pages) — the two never share a file. Nothing else may be merged.

**Owner / Figma-agent ticket that runs beside Wave 1 and must close before Wave 2: F1-ART-01** — Figma export
of four demo card faces (`GDE-CA-SFB-2026-03`, `GDE-SN-SFB-2026-03`, `GDE-FS-WRS-2026-01`, `GDE-HE-WRS-2026-01`;
recipe, node IDs and target paths in `docs/f1/ASSETS-LISTING.md` §5.1). No builder has Figma; until it lands
those IDs (plus Nia's, ticket F1-ART-02) ship as `ART_PENDING` (§4.10) and `/c` shows the COPY §2.15 (2b)
pending block. Wave 2 cannot sign the F1 exit criterion ("scan any card → the exact card, flip") while the
ticket is open — it then records the IDs in `docs/f1/INTEGRATION-NOTES.md` as an exception for the owner.

### 0.2 Rules of the tree (all builders)
1. **You touch only the files in your row of the ownership map (§5).** Everything else is read-only. A
   shared file you need changed → note in `docs/f1/INTEGRATION-NOTES.md`, do not edit.
2. **No `git` commands that change state** (no `add`, `commit`, `checkout`, `stash`, `mv`). The integrator
   commits. Read-only `git status`/`git diff` are fine.
3. **Never run `next dev` or `next start`.** Run `next build` at most once at the end, with your own
   `NEXT_DIST_DIR` (§8) so parallel builds do not clobber each other's `.next`.
4. **`npx tsc --noEmit --incremental false`** — the `--incremental false` matters: parallel `tsc` runs share
   `tsconfig.tsbuildinfo` otherwise.
5. **Copy comes from `docs/f1/COPY.md`**, byte-identical; CANON sentences come from `lib/copy/canon.ts` and
   `content/blocks/*.md` (never retyped). A `$<digits>` literal in JSX outside `lib/catalog/prices.ts` fails
   `tests/forbidden-strings.test.ts`, as does every string in COPY.md §0.4.
6. **Every fictional athlete image has `<FictionalLabel />` in the frame or directly under it.** No image
   from `public/images/sport-examples/*`, no Nia Brooks export (see §9.1 for the exact files), no
   count-bearing pack face or certificate, no SN/CA wallpaper, no real customer photo.
7. **Never a jersey number** — in copy, alt text or example data — for cheerleading, gymnastics, swimming,
   tennis, golf. Never "youth". Card corners are square everywhere (radius 0 on anything depicting a card).
8. **iCloud Drive**: never `Read` a large binary. `sips -g pixelWidth -g pixelHeight <file>` to measure,
   `find <dir> -maxdepth 2` to list, a ≤360 px thumbnail (`python3` + PIL, or `sips -Z 360` for PNG/JPG —
   `sips` cannot read WebP) into your scratchpad when you must look. `sleep` is blocked.
9. Components are **synchronous** React components (no `async` component in `components/`), so
   `renderToStaticMarkup` works in Vitest. Pages may be async.
10. `lib/fonts/*` is imported **only** by `app/layout.tsx` (site pair) and `app/(registry)/c/[cardId]/**`
    (finish pairs). Nothing under `components/` or `tests/` imports `next/font`.

---

## 1. DESIGN SYSTEM (Tailwind 4, `app/globals.css`)

**Decision:** page layout and component styling use **Tailwind utility classes in JSX**; `app/globals.css`
holds only tokens, base styles, three utilities and the flip keyframes. Nobody but `design-system` edits it,
so no Wave-1 builder ever touches CSS. Shared visual language lives in React components under
`components/` (one per §2.6 name), not in CSS classes.

### 1.1 `app/globals.css` — the exact file (replace the current one entirely)
```css
@import "tailwindcss";

/* Tokens — spec §2.1 colours, §2.2 type, §2.5 motion, §2.6 radius. Owned by design-system. */
@theme {
  /* Wipe Tailwind's default palette so text-blue-500 / bg-gray-100 cannot drift in. */
  --color-*: initial;
  --color-stock: #F4F3EF;
  --color-hairline: #E8E7E2;
  --color-ink: #14191F;
  --color-muted: #6E7278;
  --color-accent: #FF6B2B;
  --color-navy: #172C50;
  --color-arena: #080C12;
  --color-arena-surface: #14191F;
  --color-arena-hairline: rgb(255 255 255 / 0.08);
  --color-arena-muted: #AEB6C2;   /* secondary text on arena (9.6:1); not in §2.1, added for AA */
  --color-silver: #C7D0DC;        /* mid stop of the silver gradient; flat rules/labels on arena */
  --color-pass: #4EAF90;
  --color-fail: #D8554B;
  --color-gold: #C9A227;          /* Senior Night media only */
  --color-white: #FFFFFF;
  --color-black: #000000;

  --radius-*: initial;
  --radius-ui: 12px;              /* panels, buttons, inputs */
  --radius-card: 0px;             /* anything depicting a card */
  --radius-pill: 999px;

  --ease-flip: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-hover: 180ms;
  --duration-panel: 240ms;
  --duration-flip: 5000ms;

  /* Type scale (rem). Fluid between the §2.2 stops: display 4.5/3.5/2.75, h2 2.75/2.25/2. */
  --text-display: clamp(2.75rem, 1.5rem + 4vw, 4.5rem);
  --text-display--line-height: 0.95;
  --text-h2: clamp(2rem, 1.4rem + 2vw, 2.75rem);
  --text-h2--line-height: 0.98;
  --text-h3: 1.5rem;
  --text-h3--line-height: 1.05;
  --text-sub: 1.375rem;
  --text-sub--line-height: 1.25;
  --text-body: 1.0625rem;
  --text-body--line-height: 1.55;
  --text-small: 0.875rem;
  --text-small--line-height: 1.45;
  --text-label: 0.75rem;
  --text-label--line-height: 1.2;
  --text-pill: 0.8125rem;
  --text-pill--line-height: 1;

  --spacing-stack: 38px;          /* the fixed gap subhead → pills (D12) */
  --container-site: 75rem;

  /* The signature flip (port of card-flip/web/flip.html — same keyframes, same curve, radius 0). */
  --animate-card-flip: card-flip var(--duration-flip) var(--ease-flip) both;
  --animate-card-flip-back: card-flip-back var(--duration-flip) var(--ease-flip) both;
  @keyframes card-flip {
    0%, 30%   { transform: rotateY(0deg) scale(1); }
    36%       { transform: rotateY(38deg) scale(1.03); }
    44%       { transform: rotateY(90deg) scale(1.04); }
    52%       { transform: rotateY(142deg) scale(1.03); }
    58%, 100% { transform: rotateY(180deg) scale(1); }
  }
  @keyframes card-flip-back {
    0%, 30%   { transform: rotateY(180deg) scale(1); }
    36%       { transform: rotateY(142deg) scale(1.03); }
    44%       { transform: rotateY(90deg) scale(1.04); }
    52%       { transform: rotateY(38deg) scale(1.03); }
    58%, 100% { transform: rotateY(0deg) scale(1); }
  }
}

/* Font families reference the next/font variables set on <html> (site pair) and on the /c wrapper
   (finish pair). `inline` so the utilities resolve the var at use time, not at build time. */
@theme inline {
  --font-display: var(--font-anton), Impact, "Arial Narrow", sans-serif;
  --font-body: var(--font-space-grotesk), "Helvetica Neue", Arial, sans-serif;
  --font-label: var(--font-barlow), "Arial Narrow", Arial, sans-serif;
  --font-finish-display: var(--ff-display, var(--font-anton)), sans-serif;
  --font-finish-supporting: var(--ff-supporting, var(--font-barlow)), sans-serif;
}

/* `arena:` variant — style the dark surface without a second class list. */
@custom-variant arena (&:where([data-surface="arena"], [data-surface="arena"] *));

@layer base {
  html { color-scheme: light; background: var(--color-stock); -webkit-text-size-adjust: 100%; }
  body {
    margin: 0; background: var(--color-stock); color: var(--color-ink);
    font-family: var(--font-body); font-size: var(--text-body); line-height: var(--text-body--line-height);
    -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
  }
  h1, h2, h3 { margin: 0; font-family: var(--font-display); font-weight: 400; text-transform: uppercase; text-wrap: balance; }
  h1 { font-size: var(--text-display); line-height: var(--text-display--line-height); }
  h2 { font-size: var(--text-h2); line-height: var(--text-h2--line-height); }
  h3 { font-size: var(--text-h3); line-height: var(--text-h3--line-height); }
  p { margin: 0; }
  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; color: inherit; }
  button { background: none; border: 0; padding: 0; cursor: pointer; }
  img, video, svg { display: block; max-width: 100%; height: auto; }
  ::selection { background: var(--color-accent); color: var(--color-ink); }
  :focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; border-radius: 4px; }
  [data-surface="arena"] { background: var(--color-arena); color: var(--color-white); color-scheme: dark; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  }
}

/* The only shared utilities. Everything else is Tailwind in JSX. */
@utility bg-silver { background-image: linear-gradient(20deg, #FFFFFF 0%, #C7D0DC 50%, #FFFFFF 100%); }
@utility text-silver {
  background-image: linear-gradient(20deg, #FFFFFF 0%, #C7D0DC 50%, #FFFFFF 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
@utility container-site { width: 100%; max-width: var(--container-site); margin-inline: auto; padding-inline: 1.25rem; }
```

Generated utilities the builders use (Tailwind 4 derives them from the tokens): `bg-stock text-ink
text-muted bg-accent bg-navy bg-arena bg-arena-surface border-hairline border-arena-hairline text-arena-muted
text-silver bg-silver text-pass text-fail text-gold` · `rounded-ui rounded-card rounded-pill` · `font-display
font-body font-label font-finish-display font-finish-supporting` · `text-display text-h2 text-h3 text-sub
text-body text-small text-label text-pill` · `duration-hover duration-panel ease-flip` ·
`animate-card-flip animate-card-flip-back` · `perspective-[1200px] transform-3d backface-hidden rotate-y-180` ·
`arena:text-white arena:border-arena-hairline` · `container-site` · `mt-stack` (= 38 px).

### 1.2 Contrast table (computed; every pair a builder may use)
| Pair | Ratio | Use |
|---|---|---|
| ink #14191F on stock #F4F3EF | 15.9:1 | body, headings |
| muted #6E7278 on stock | **4.36:1** | ≥ 18.66 px / 14 px bold only (AA large). Body-size muted text uses `text-ink/80` (≈ 9:1) instead |
| ink on accent #FF6B2B | 6.2:1 | primary button text (**never white on accent — 2.8:1**) |
| accent on stock (as text) | 2.6:1 | **forbidden as text**; accent is fill, ring, arrow, brackets only |
| navy #172C50 on stock | 12.5:1 | wordmark on stock, shield plate |
| white on navy | 13.9:1 | footer text |
| white on arena #080C12 | 19.6:1 | /c headings, body |
| arena-muted #AEB6C2 on arena | 9.6:1 | /c labels, secondary |
| silver #C7D0DC on arena | 12.6:1 | edition-panel rules, labels |
| gold #C9A227 on arena | 8.1:1 | SR media only |
| pass #4EAF90 on arena / ink on pass | 7.3:1 / 6.6:1 | PASS chip (fill + ink text) |
| fail #D8554B on arena / white on fail / ink on fail | 5.0:1 / 4.0:1 / 4.5:1 | FAIL chip = **fail fill + ink text**, never white text |
| accent on arena | 6.9:1 | focus ring on /c, QR ring |
| `team/primary` on arena | computed per record | `contrastRatio() >= 4.85` → colour text; else white text + 4 px colour rule (`lib/color.ts`) |

### 1.3 Radius rule
`rounded-ui` (12 px) for panels, buttons, inputs, tier cards, stat chips, plates. `rounded-card` (0) for **any
element whose shape is a card**: CardFlip faces, card `<Image>` tiles, BracketFrame, EditionPanel when it
sits on a card composite, the QR ring's inner box. `tests/design-system.test.ts` greps `components/CardFlip.tsx`
and `components/BracketFrame.tsx` for `rounded-(?!card|none)` and `border-radius` and fails on any hit.

---

## 2. FONTS (`next/font/google`)

### 2.1 Site pair — `lib/fonts/site.ts` (Wave 0, design-system)
```ts
import { Anton, Barlow, Space_Grotesk } from "next/font/google";

// Anton has one weight. Space Grotesk is a variable font (300–700 in one file) — omit `weight`.
// Barlow SemiBold only (form labels, table heads, ID/time lines) plus 500 for chips.
export const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-anton" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-space-grotesk" });
export const barlow = Barlow({ weight: ["500", "600"], subsets: ["latin"], display: "swap", variable: "--font-barlow" });

/** Put on <html>. Every marketing route gets exactly these three families and nothing else. */
export const siteFontClass = `${anton.variable} ${spaceGrotesk.variable} ${barlow.variable}`;
```
`app/layout.tsx`: `<html lang="en" className={siteFontClass}>`. Inter and Oswald are removed.

### 2.2 Finish pairs — `lib/fonts/finishes.ts` (Wave 0; imported only by `app/(registry)/c/[cardId]/**`)
`next/font` forbids conditional or computed loader calls, so all seven pairs are declared at module scope
with literal options. Every declaration sets the **same two CSS variables** (`--ff-display`,
`--ff-supporting`) — only one pair's className is applied per page, so the wrapper element resolves the
finish's family and the `font-finish-display` / `font-finish-supporting` utilities work unchanged for every
finish. Anton/Barlow/Space Grotesk are declared a second time here under the finish variable names — the
underlying woff2 is content-hashed by next/font, so the browser fetches the same URL it already has.

```ts
import {
  Anton, Archivo, Archivo_Narrow, Barlow, Chakra_Petch, Graduate, Khand, Orbitron, Oswald,
  Passion_One, Playfair_Display, Russo_One, Saira_Condensed, Space_Grotesk,
} from "next/font/google";
import type { StyleCode } from "../catalog/styles";

// preload:false on EVERY finish font: next/font then emits only the @font-face CSS (~5 KB for all
// 14 faces) and the browser downloads just the two files the rendered finish actually uses.
// With preload:true all 14 files would be <link rel=preload>ed on every /c page (~500 KB+).
const D = { subsets: ["latin"] as const, display: "swap" as const, preload: false, variable: "--ff-display" as const };
const S = { subsets: ["latin"] as const, display: "swap" as const, preload: false, variable: "--ff-supporting" as const };

const snDisplay = Anton({ ...D, weight: "400" });
const snSupporting = Barlow({ ...S, weight: ["500", "600"] });
const caDisplay = Russo_One({ ...D, weight: "400" });
const caSupporting = Saira_Condensed({ ...S, weight: ["500", "600", "700"] });
const fsDisplay = Passion_One({ ...D, weight: ["400", "700"] });
const fsSupporting = Khand({ ...S, weight: ["500", "600"] });
const heDisplay = Graduate({ ...D, weight: "400" });
const heSupporting = Archivo_Narrow({ ...S });                                // variable
const ssDisplay = Space_Grotesk({ ...D });                                    // variable
const ssSupporting = Archivo({ ...S });                                       // variable
const prDisplay = Orbitron({ ...D });                                         // variable
const prSupporting = Chakra_Petch({ ...S, weight: ["500", "700"] });
const srDisplay = Playfair_Display({ ...D, style: ["normal", "italic"] });   // variable; italic for the senior quote
const srSupporting = Oswald({ ...S });                                        // variable; Oswald has NO italic

export interface FinishFonts { className: string; display: string; supporting: string }

export const FINISH_FONTS: Record<StyleCode, FinishFonts> = {
  SN: { className: `${snDisplay.variable} ${snSupporting.variable}`, display: "Anton", supporting: "Barlow" },
  CA: { className: `${caDisplay.variable} ${caSupporting.variable}`, display: "Russo One", supporting: "Saira Condensed" },
  FS: { className: `${fsDisplay.variable} ${fsSupporting.variable}`, display: "Passion One", supporting: "Khand" },
  HE: { className: `${heDisplay.variable} ${heSupporting.variable}`, display: "Graduate", supporting: "Archivo Narrow" },
  SS: { className: `${ssDisplay.variable} ${ssSupporting.variable}`, display: "Space Grotesk", supporting: "Archivo" },
  PR: { className: `${prDisplay.variable} ${prSupporting.variable}`, display: "Orbitron", supporting: "Chakra Petch" },
  SR: { className: `${srDisplay.variable} ${srSupporting.variable}`, display: "Playfair Display", supporting: "Oswald" },
};

export const finishFontClass = (code: StyleCode): string => FINISH_FONTS[code].className;
```
`app/(registry)/c/[cardId]/page.tsx` wraps its content in
`<div data-surface="arena" className={finishFontClass(style.code)}>` and uses `font-finish-display` for
the athlete name / ghost number / stat values and `font-finish-supporting` for labels and the ID line.

**Bundle consequence.** Fonts are CSS + woff2, not JS, so the `/c` JS budget (< 300 KB) is untouched.
Per `/c` page: ~5 KB of @font-face CSS (all 14 faces, shipped in the route's CSS chunk) + the two files of
the rendered finish (≈ 40–120 KB, `display: swap`). **Acceptable.** What would *not* be acceptable is
`preload: true` (14 preloads ≈ 0.5–0.8 MB above the fold, breaking the < 1 MB above-the-fold budget and the
"one pair per route" rule) — `tests/design-system.test.ts` asserts every call in `finishes.ts` contains
`preload: false` (it checks the `D`/`S` spreads) and that `lib/fonts/finishes` is imported only under `app/(registry)/c/`.
Trade-off accepted: the finish name renders in the fallback face for one frame on first visit (swap), which
is why `adjustFontFallback` stays on (default) and the name has a reserved line box.

The SR senior quote is set in **Playfair Display italic** (Oswald has no italic; a synthesised oblique on a
condensed grotesk looks broken) — this overrides COPY.md §2.15 (4) "finish's supporting italic".

### 2.3 OG images — `lib/og.ts` (Wave 0)
`opengraph-image.tsx` files run through `next/og` `ImageResponse`, which cannot use `next/font`. Contract:
`loadGoogleFont(family: "Anton" | "Space Grotesk", weight: 400 | 700, text?: string): Promise<ArrayBuffer>`
fetches the CSS from `fonts.googleapis.com` and the woff/ttf it points to at build time (Vercel build has
network), memoised per process. `OgFrame({ tone: "stock" | "arena", children })` renders the 1200×630
shell (shield top-left, wordmark bottom-right, hairline). Every route's OG image uses these two helpers.

---

## 3. COMPONENT CONTRACTS (`components/`)

All files are `components/<Name>.tsx`, flat, PascalCase, default-less named exports. Server components
unless marked **client**. Every component accepts `className?: string` (merged last). Icons: inline SVG,
1.5 px stroke, `aria-hidden`, from `components/icons.tsx` — no emoji, no icon font.

| Component | Props (TypeScript) | Variants / behaviour | A11y |
|---|---|---|---|
| `Pill` | `{ tone?: "accent" \| "outline" \| "outline-silver" \| "gold"; as?: "span" \| "li"; children }` | Anton, uppercase, `rounded-pill`, `text-pill`, `h-8 px-3`; `accent` = fill + ink text (primary claim), `outline` = ink outline (secondary), `outline-silver` = arena, `gold` = SR media only | plain text; no role |
| `DeliveryChips` | `{ kind: "standard" \| "seniorNight"; tone?: "stock" \| "arena" }` | Splits `CHIPS[kind]` on ` · ` into `Pill tone="outline"`s; **one per page** | `<p aria-label="Delivery times">` |
| `TrustLine` | `{ tone?: "stock" \| "arena" }` | Renders `trustLineSegments()` (C14; 4th segment only when `vertexNoTrainingVerified`) separated by ` · `; `text-small`, `font-label` | `<p>` |
| `TierCard` | `{ tier: Tier; now: Date; box: string[]; shipsFrom: string; chip: string; cta: CtaPairProps; id?: string; sportCode?: string }` | Etsy variant name as `h3`; `priceDisplay(tier, now)` → current in `font-display text-h3`, `compareAt` in `<s>` + line "Sale price until {saleEnds}" only while present; `featured` → `Pill accent "FEATURED"`; list "what's in the box"; "Ships from" line; chip; `CtaPair`; `id=tier-<sku>` | `<article aria-labelledby>`; `<s aria-label="Regular price">` |
| `FamilyCard` | `{ family: Family; from: number; truths: [string, string, string]; image: ImageSpec; href: string; cta: string }` | Home §3 / the three-family row; "from {formatUsd(from)}" | `<article>`; whole card is one link (`<a>` wraps title + cta text) |
| `EditionPanel` | `{ card: CardRecord; tone: "arena" \| "stock"; demoLabel?: string; copyButton?: boolean; lastUpdated?: boolean; registryHref?: string }` | Rows exactly per COPY §2.15 (3): EDITION ID · FINISH · SPORT · SEASON · REGISTERED (`registeredAtOf`) · CERTIFICATE · EDITION (SR only); sentence + C15 line; silver rule; `duration-panel` slide-in on mount (arena only, CSS `@starting-style`, no JS); `copyButton` mounts the `CopyIdButton` island | `<section aria-label="Edition details">`; `<dl>`; never the word "Verified" (test) |
| `StatChip` | `{ value: string; label: string; tone?: "arena" \| "stock" }` | value in `font-finish-display` (on /c) / `font-display` elsewhere; label `font-label text-label uppercase` | `<div role="group" aria-label="{label} {value}">` |
| `Plate` | `{ tone: "stock" \| "arena"; children; padding?: "sm" \| "md" }` | Solid plate for text over photos (`bg-stock`/`bg-arena`, `rounded-ui`) | none |
| `BracketFrame` | `{ children; label?: string; tone?: "stock" \| "arena" }` | Four accent corner brackets (4 absolutely positioned `<span aria-hidden>`s, 2 px stroke, 28 px legs); `rounded-card`; optional `font-label` label bottom-left | `<figure>` when `label` (label → `<figcaption>`) |
| `FictionalLabel` | `{ tone?: "stock" \| "arena"; className? }` | **exists — keep text**; restyle: `font-label text-label uppercase`, outline pill; not disableable | `<span>` |
| `CapacityNote` | `{ now: Date; tone? }` | `nextAvailableStart(now)` (§4.4); with `WEEKLY_CAP === null` it renders the chip-derived line "Next available start: {start} · files by {filesBy} · prints ship by {printsShipBy}"; **rendered only on the three family pages** (spec §4.2) — everywhere else it is not mounted | `<p>` |
| `FourFears` | `{ variant: "long" \| "short" }` | Strings fixed inside the component (COPY §1.3); long = 4 `<a>` cards with icons, short = "Still deciding?" strip of 4 links | cards are links (`<a>` wraps the card); `aria-label` on the strip |
| `GateRow` | `{ gates: Gate[] }` where `Gate = { id: string; label: string; status: "pass" \| "fail" \| "note" \| "none"; body: ReactNode; artefact: { src: string; alt: string; caption: string; width: number; height: number }; sideNote?: string }` | `/how-it-works` only; `<details name="gates">` accordion (native exclusive open where supported); PASS/FAIL/NOTE chips (`bg-pass`/`bg-fail` + ink text); artefact inside `BracketFrame` + `FictionalLabel` | `<summary>` is the toggle; chips carry visible text |
| `FounderNote` | `{ variant: "home" \| "about" \| "signature"; city?: string }` | Space Grotesk italic body, signature "John Birch"; photo `public/brand/founder.jpg` **only if** `founderPhotoExists()`; never generated | `<blockquote>` + `<cite>`; `alt="John Birch, designer and founder of Game Day Edition"` |
| `ConsentRow` | `{ id: string; name: string; label: string; required?: boolean; defaultChecked?: boolean }` | One sentence = one checkbox; `min-h-6`; F1 has no forms — built for F2 | `<label htmlFor>`; no `aria-describedby` chains |
| `CardFlip` **client** | `{ front: ImageSpec; back: ImageSpec; mp4?: string; maxWidth?: number (default 360); autoplay?: boolean (default true); priority?: boolean; labels?: { flip: string; flipBack: string } }` where `ImageSpec = { src: string; alt: string; width: number; height: number }` | See §3.1 | see §3.1 |
| `CopyIdButton` **client** | `{ value: string; label?: string }` | `navigator.clipboard.writeText`, toast "Copied" 1.5 s | `<button aria-label="Copy card ID">`; toast in `aria-live="polite"` |
| `ShareRow` **client** | `{ url: string; text: string }` | "Copy link" (toast "Link copied") + "Share" (`navigator.share` when present, else hidden) | buttons ≥ 24 px |
| `BrandMark` | `{ href?: string; tone?: "stock" \| "arena"; size?: "sm" \| "md" }` | **exists — rebuild**: shield = `components/brand/Shield.tsx` (inline SVG from `public/brand/shield.svg` paths **with the two Figma artboard `<rect>`s removed**; `tone="stock"` flat navy fill, `tone="arena"` silver gradient `<linearGradient>` 20°); wordmark = `components/brand/Wordmark.tsx` (paths from `public/brand/wordmark.svg`, artboard rects removed, `fill="currentColor"`, `text-navy` on stock, `text-white` on arena). The GDE mark is never text | `<a aria-label="Game Day Edition — home">`; SVGs `aria-hidden` |
| `JsonLd` | `{ data: object }` | **exists — keep** | — |
| `Breadcrumbs` | `{ trail: { name: string; href: string }[] }` | Visible `<nav>` + always emits `breadcrumbList(trail)` JSON-LD (spec §8: BreadcrumbList everywhere except `/`) | `<nav aria-label="Breadcrumb"><ol>`; last item `aria-current="page"` |
| `SiteHeader` | `{ tone?: "stock" }` | Nav from `lib/nav.ts`; right side = `CtaPair` header variant (`ctaFor("header")`); `MobileMenu` island | skip link "Skip to content" → `#main`; `<header>`; `MobileMenu`: `aria-expanded`, `aria-controls`, Esc closes, focus moves to first link |
| `MobileMenu` **client** | `{ links: NavLink[] }` | disclosure, no dependencies | above |
| `SiteFooter` | `{}` | Columns per COPY §1.2; imprint block iff `imprintComplete()` else the fallback line (never "TEMPLATE"); `TRUE_COUNT_LINKS` strip; C4 line; social row from `SOCIAL_LINKS`; bottom line | `<footer>`; social links `aria-label="Game Day Edition on {platform}"` |
| `FaqList` | `{ items: FaqItem[]; jsonLd?: boolean; id?: string; headingLevel?: 2 \| 3 }` | `<details>/<summary>` list; **`jsonLd` emits `faqPage(items)` for exactly the items rendered** — at most one `jsonLd` FaqList per page (test greps page files) | `<summary>` native button; question as heading inside summary |
| `SectionHeading` | `{ as: "h1" \| "h2"; title: string; subhead?: string; pills?: ReactNode; align?: "left" \| "center"; id?: string }` | title must end with "." (dev `console.warn` otherwise); subhead `text-sub font-bold`; pills after a `mt-stack` gap | one `h1` per page |
| `CtaPair` | `{ primary: CtaLink; secondary?: CtaLink; size?: "md" \| "lg"; tone?: "stock" \| "arena" }` where `CtaLink = { label: string; href: string; kind?: "primary" \| "outline" \| "etsy" }` | primary = `bg-accent text-ink font-display uppercase rounded-ui h-12 px-6`; outline = `border border-ink`; `kind: "etsy"` delegates to `EtsyButton`. Pages get their pair from `ctaFor()` (§4.9) so the F1→F2 switch is one flag | `<a>` elements; ≥ 48 px tall |
| `EtsyButton` | `{ sku: string; label?: string (default "Also on Etsy →"); tone? }` | Outline only, `href=/go/etsy/<sku>`; **the file must not contain `bg-accent`** (test) | `<a>` |
| `OrderByCalculator` **client** | `{ todayEt: IsoDate; cta: { href: string; label: string }; giftNoteId: string }` | `<form>` with `<input type="date" min={todayEt}>` → `seniorNightPlan(night, todayEt)` (pure, §4.4) → three result rows (COPY §2.5 (2)) in `<output aria-live="polite">`; fallback branch shows the "Gift the digital first" button which un-hides `#giftNoteId` and calls `window.print()`; deep-link CTA appends `&occasion=<date>` (F1: Etsy link unchanged) | label/`htmlFor`; results announced; button ≥ 48 px |
| `NotFoundBody` **client** | `{}` | reads `usePathname()`; `/c/…` → COPY §2.13 card variant + inline lookup form; else generic | — |
| `LookupForm` | `{ inline?: boolean; miss?: string }` | Plain `<form method="post" action="/registry/lookup">` (works without JS); renders the miss string from `?miss=` | `<label>Card ID</label>`; `inputMode="text"`, `autoCapitalize="characters"`, `pattern="[A-Za-z0-9-]{8,24}"` |
| `ProofRejectedPair` | `{ fail: ImageSpec; pass: ImageSpec }` | Home §10 / how-it-works §3 pair with FAIL/PASS chips and the fixed captions | `<figure>` ×2 |

### 3.1 `CardFlip` — the signature motion (client island)
Port of `card-flip/web/flip.html`: `perspective: 1200px`; card `transform-3d`, `aspect-[5/7]`; faces
`absolute inset-0 backface-hidden rounded-card` (the source's `4.5% / 3.2%` radius is **dropped — radius 0**);
back face `rotate-y-180`; keyframes and curve = the `@theme` tokens above (0–30 % front, 36 % 38°, 44 % 90°,
52 % 142°, 58–100 % back; `cubic-bezier(0.4,0,0.2,1)`; 5.0 s).

State machine: `side: "front" | "back"`, `phase: "idle" | "playing"`.
- Initial render (server): front face visible, no animation class → the poster frame **is** the front image
  (LCP-safe, CLS 0 via `aspect-[5/7]` and explicit `width/height`).
- `autoplay` (default true): an `IntersectionObserver` (threshold 0.5, once) starts `animate-card-flip`
  when the element enters the viewport **below the fold**; pages that place the flip in the hero pass
  `autoplay={false}` (spec §2.5: autoplay only below fold, once).
- `animationend` → `side = back`, animation class removed, static `rotate-y-180` applied (no snap).
- Tap/click/Enter/Space on the wrapping `<button>` → if `side === "front"` play `animate-card-flip`, else
  `animate-card-flip-back` (the mirrored keyframes); ignored while `phase === "playing"`.
- `prefers-reduced-motion: reduce` (checked via `matchMedia`, and the CSS media query kills the animation
  anyway): no autoplay; the button becomes a two-state switch that toggles `rotate-y-180` with
  `transition-none`; a visible "Front / Back" segmented control is rendered under the card.
- `mp4` fallback: rendered as `<noscript><video muted playsInline controls preload="none" poster={front.src}><source src={mp4} type="video/mp4" /></video></noscript>` and exposed to the page as the download / `VideoObject` source. No `<video>` is ever above the fold (test).
- Images: `<Image src width height sizes="(min-width: 768px) 360px, 80vw" priority={priority} />`; back face `loading="lazy"` unless `priority`.
- A11y: `<button type="button" aria-pressed={side === "back"} aria-label={side === "front" ? "Flip the card to show the back" : "Flip the card to show the front"}>`; visible label "Tap to flip" / "Tap to flip back"; `aria-live="polite"` region announces "Showing the back" / "Showing the front"; both images carry real alt text (COPY §2.15 (2)).
- Size: ≤ 4 KB gzipped JS; no dependencies. It is the only client island on `/c` besides `CopyIdButton` and `ShareRow`.

---

## 4. LIB CONTRACTS (signatures are frozen)

### 4.1 `lib/seo/jsonld.ts` (Wave 0)
```ts
import type { Family, Tier } from "../catalog/prices";
export type JsonLdObject = Record<string, unknown>;

export function organization(): JsonLdObject;      // Organization: name, url, logo `${SITE_URL}/brand/shield.png`, email,
                                                    // founder Person (name; image iff founderPhotoExists()), address (PostalAddress,
                                                    // addressCountry "LT") iff imprintComplete(), sameAs [ETSY_SHOP_URL, ...SOCIAL_URLS]
export function website(): JsonLdObject;           // WebSite: name, url, publisher → Organization @id. No SearchAction.
export function person(): JsonLdObject;            // founder Person for /about (name, jobTitle "Designer and founder", worksFor)
export function breadcrumbList(trail: { name: string; href: string }[]): JsonLdObject;
export function faqPage(items: { q: string; a: string }[]): JsonLdObject;
export function article(a: { title: string; description: string; path: string; datePublished: string; dateModified: string; image?: string }): JsonLdObject; // author Person, publisher Organization
export function productFamily(p: {
  family: Family; path: string; name: string; description: string; images: string[]; tiers: Tier[]; now?: Date;
}): JsonLdObject;
// Product { name, description, image[], brand { Brand: BRAND }, category "Custom sports trading cards" | "Custom sports posters" | "Custom sports poster and trading card set",
//   offers: AggregateOffer { priceCurrency "USD", lowPrice, highPrice, offerCount, offers: Offer[] } }
// Each Offer: url `${SITE_URL}${path}#tier-${sku}`, name tier.name, price sitePrice(tier, now), priceCurrency "USD",
//   availability "https://schema.org/InStock", itemCondition NewCondition,
//   priceValidUntil: ONLY while isSaleActive(now) → isoDatePlusDays(SALE_EXPIRES_AT, 1); omitted after the sale (a past date is invalid),
//   shippingDetails (physical tiers only): OfferShippingDetails { shippingRate { value 0, currency USD }, shippingDestination { addressCountry "US" },
//     deliveryTime { handlingTime { minValue 5, maxValue 7, unitCode "DAY" } } },
//   hasMerchantReturnPolicy: { applicableCountry "US", returnPolicyCategory "https://schema.org/MerchantReturnNotPermitted",
//     merchantReturnLink `${SITE_URL}/guarantee` }  ← honest: no change-of-mind returns; defects are reprinted/refunded without a return (§9.2 open)
// NEVER aggregateRating / review (test asserts absence).
export function imageObject(i: { url: string; width: number; height: number; caption: string; path: string }): JsonLdObject;   // public /c only
export function videoObject(v: { name: string; description: string; thumbnailUrl: string; contentUrl: string; uploadDate: string; path: string }): JsonLdObject; // duration "PT5S"; public /c only
export function isoDatePlusDays(iso: string, days: number): string; // "2026-09-24T23:59:59-04:00" + 1 → "2026-09-25"
```
Tests (`tests/design-system.test.ts`): every builder returns `@context`/`@type`; Offer prices equal
`sitePrice`; `priceValidUntil` present during the sale and absent after; no `$` strings; JSON round-trips;
`JSON.stringify` output contains no `<` (JsonLd escapes anyway).

### 4.2 `lib/seo/intents.ts` (Wave 1, seo-assets)
```ts
export interface Intent { keyword: string; path: string; phase: "F1" | "F2" | "F3"; note?: string }
export const intents: Intent[];            // the §8 table verbatim: brand → "/", "custom trading cards" → "/trading-cards", … "<sport> senior night" → "/senior-night/[sport]" (F2), …
export const NEVER_TARGET: string[];       // "<sport> cards", "personalized card", "senior banner", "dance senior night", "track senior night", "band senior night", "lacrosse senior night"
export function pathForIntent(keyword: string): string | undefined;
export function intentsFor(path: string): Intent[];
```
Test (`tests/seo.test.ts`): keywords unique case-insensitively; every `path` is in the sitemap table
(`lib/seo/titles.ts` keys, with `[sport]`/`[finish]` patterns allowed); every F1 path has a `page.tsx` on disk;
no keyword equals or contains a `NEVER_TARGET` entry; each path owns ≥ 1 keyword.

### 4.3 `lib/seo/titles.ts` + `lib/seo/meta.ts` (Wave 0)
```ts
// titles.ts — the one table every page reads; the seo test checks lengths here, not in page files.
export interface PageMeta { path: string; title: string; description: string; phase: "F1" | "F2" | "F3"; priority: number; changeFrequency: "weekly" | "monthly" | "yearly"; noindex?: boolean }
export const PAGES: Record<string, PageMeta>;      // keyed by path; titles per §8 templates, ≤ 60 chars incl. " | Game Day Edition"; descriptions ≤ 155
export const TITLE_SUFFIX = " | Game Day Edition";

// meta.ts
export function pageMeta(path: string, extra?: { images?: string[]; type?: "website" | "article" }): Metadata;
// → { title: PAGES[path].title (without suffix; the root template appends it), description,
//     alternates: { canonical: path }, openGraph: { url: path, title, description, type, images? },
//     robots: noindex ? { index: false, follow: false } : undefined }
export function cardMeta(card: CardRecord): Metadata;   // §6.2 titles; absolute title (contains the brand already)
```

### 4.4 `lib/capacity.ts` (Wave 0; pure, no I/O)
```ts
export type IsoDate = string;                       // "YYYY-MM-DD", a calendar date in US Eastern
export const ET = "America/New_York";
export const WEEKLY_CAP: number | null = null;      // D5: off. `capacity:set` (F2) flips it; nothing in F1 reads a roster.
export const US_TRANSIT_BUSINESS_DAYS = 5;          // assumption until a shipment is tracked (§9.2)
export const LAB_HOLIDAYS: IsoDate[];               // 2026–2027: New Year's Day, Memorial Day, Independence Day (observed), Labor Day, Thanksgiving + Friday, Dec 24–25
export const SR_LEAD = { filesDaysBefore: 7, printedSetDaysBefore: 14, sealedPackDaysBefore: [21, 28] as const }; // calendar days, from CHIPS.seniorNight

export function toEtDate(now: Date): IsoDate;                        // Intl.DateTimeFormat en-CA, timeZone ET
export function isBusinessDay(d: IsoDate): boolean;                  // Mon–Fri and not in LAB_HOLIDAYS
export function nextBusinessDay(d: IsoDate): IsoDate;                // d itself if it is one
export function addBusinessDays(d: IsoDate, n: number): IsoDate;     // day 0 = nextBusinessDay(d); n ≥ 0
export function subtractBusinessDays(d: IsoDate, n: number): IsoDate;
export function addCalendarDays(d: IsoDate, n: number): IsoDate;
export function businessDaysBetween(from: IsoDate, to: IsoDate): number; // count in (from, to]
export function committedDates(kind: "digital" | "prints" | "pack", orderedAt: Date): { earliest: IsoDate; latest: IsoDate };
// digital +1/+2 business days · prints ship +5/+7 business days · pack +3/+4 calendar weeks (LEAD_TIMES)
export function orderByFor(target: IsoDate, leadBusinessDays: number): IsoDate;   // latest d with addBusinessDays(d, lead) <= target
export function orderByForCalendar(target: IsoDate, leadDays: number): IsoDate;   // target − leadDays
export interface PlanRow { key: "files" | "printedSet" | "sealedPack"; fits: boolean; orderBy: IsoDate; arrivesBy: IsoDate }
export interface SeniorNightPlan { night: IsoDate; today: IsoDate; rows: PlanRow[]; anythingPrintedFits: boolean; bestTier: "GDE-ANY-SNSET-PRINT" | "GDE-ANY-SNSET-DIG" }
export function seniorNightPlan(night: IsoDate, todayEt: IsoDate): SeniorNightPlan;   // SR_LEAD; fits = orderBy >= today
export function christmasDates(now: Date): { year: number; printedBy: IsoDate; digitalBy: IsoDate };
// target = Dec 24 of the current window's year; printedBy = orderByFor(dec24, 7 + US_TRANSIT_BUSINESS_DAYS); digitalBy = orderByFor(dec24, 2)
export function nextAvailableStart(now: Date): { start: IsoDate; filesBy: IsoDate; printsShipBy: IsoDate };
// WEEKLY_CAP null → start = nextBusinessDay(today), filesBy = +2, printsShipBy = +7. (Roster-aware version lands in F2.)
export function formatEt(d: IsoDate, style: "weekday-short" | "medium" | "long"): string; // "Mon Sep 14" | "Sep 14, 2026" | "September 14, 2026"
```
Tests: weekend/holiday skipping; `addBusinessDays("2026-09-04", 2) === "2026-09-09"` (Labor Day 09-07 skipped);
`SR_LEAD` numbers are present in `CHIPS.seniorNight` (parse "1 WEEK", "2 WEEKS", "3–4 WKS"); `seniorNightPlan`
fallback when the night is tomorrow; `christmasDates` year roll-over on Jan 3; every function is deterministic
for a fixed `now`.

### 4.5 `lib/catalog/seasons.ts` (Wave 0)
```ts
export type OccasionId = "senior-night" | "christmas" | "end-of-season";
export interface Occasion { id: OccasionId; name: string; href: string; hrefF1: string; chips: "standard" | "seniorNight"; window?: { start: { m: number; d: number }; end: { m: number; d: number } } }
export const occasions: Occasion[];   // senior-night (always, /senior-night), christmas (Oct 20 → Jan 5, /christmas-gift; F1 href → /complete-set), end-of-season (always, /teams; F1 → mailto)
export function inWindow(o: Occasion, d: IsoDate): boolean;       // wraps the year end
export function isChristmasWindow(now: Date): boolean;
export function activeOccasions(now: Date): Occasion[];            // order: senior-night, christmas (if in window), end-of-season
```
Any page that renders `activeOccasions`, prices or capacity dates exports `revalidate = 3600` (ISR) so the
date/sale switches happen without a deploy (the home page already does).

### 4.6 `lib/catalog/shipping.ts` (Wave 0)
```ts
export interface ShippingRow { key: "digital" | "cards" | "posters" | "pack" | "ultimate"; package: string; shipsFrom: string; carrier: string; timing: string; tracking: string; perLab: boolean; hiddenUntilPackEnabled?: boolean; customsNote?: string }
export const shippingRows: ShippingRow[];             // COPY §2.7 (2) verbatim; pack row hidden while !getTier("GDE-ANY-CARD-PACK")!.enabled
export function visibleShippingRows(): ShippingRow[];
export function shipsFromFor(sku: string): string;   // "Delivered on your order page — PNG at 300 dpi, by design" | "Professional photo print lab, Santa Cruz CA · tracked (per lab)" | …
export const PARTNERS: { key: "cards" | "posters" | "pack"; name: string; makes: string }[]; // C19
```

### 4.7 `lib/catalog/trust.ts` (Wave 0)
```ts
export const vertexNoTrainingVerified = false as const;   // flips only after the Vertex data-use check (§12 #15)
export const aiTrainingClaim = false as const;            // alias the spec names; both must be true to render the 4th segment
export const TRUST_SEGMENTS = ["Never posted without your OK", "Deleted after delivery, on a schedule you can see", "Parent/guardian consent required"] as const;
export function trustLineSegments(): string[];            // prepends "Never used for AI training" iff both flags true
```

### 4.8 `lib/catalog/faq.ts` (Wave 0; the home builder deletes `app/site-config.ts` once every `faqItems` entry exists here)
```ts
export type FaqGroup = "products" | "photos" | "numberless" | "timing" | "process" | "privacy" | "refunds" | "etsy" | "teams" | "registry";
export interface FaqItem { id: string; q: string; a: string; group: FaqGroup; f1Only?: boolean; requiresPack?: boolean }
export const faq: FaqItem[];                                   // COPY §2.11, 35 items, ids "faq-01" … "faq-35"; tokens resolved at module scope (SUPPORT_EMAIL, CHIPS, block(), LEAD_TIMES)
export const FAQ_SUBSETS: Record<"trading-cards" | "posters" | "complete-set" | "senior-night" | "how-it-works", string[]>; // ids in render order
export function faqAll(): FaqItem[];                           // filters requiresPack while the pack tier is disabled; keeps f1Only while !SITE_SELLS_DIRECT
export function faqSubset(key: keyof typeof FAQ_SUBSETS): FaqItem[];
```
`faq.ts` calls `block()` (fs) — server-only by construction; never import it from a client component.

### 4.9 `lib/cta.ts`, `lib/nav.ts`, `lib/copy/canon.ts`, `lib/color.ts`, `lib/alt.ts`, `lib/assets.ts`, `lib/reviews.ts` (Wave 0)
```ts
// lib/site.ts additions (Wave 0): 
export const SITE_SELLS_DIRECT = false;                        // F2 flips to true → every CtaPair switches
export const OWNER_CITY = process.env.NEXT_PUBLIC_OWNER_CITY || "";
export const SOCIAL_LINKS: { platform: "Etsy" | "Instagram" | "TikTok" | "YouTube" | "Facebook" | "Pinterest"; url: string }[]; // Etsy always (ETSY_SHOP_URL); others from env
export function founderPhotoExists(): boolean;                 // fs.existsSync(public/brand/founder.jpg)

// lib/cta.ts
export type CtaContext = "header" | "home" | "cards" | "posters" | "set" | "senior-night" | "card-page";
export function ctaFor(ctx: CtaContext, o?: { sku?: string; sport?: string; style?: string; channel?: Channel }): CtaPairProps;
// F1: primary { label: "Order on Etsy →", href: `/go/etsy/${sku ?? "GDE-ANY-SET"}` }, secondary { label: "Look up a card", href: "/registry" };
// senior-night: sku GDE-ANY-SNSET (or GDE-<CODE>-SNSET when the sport's listing is live); card-page + channel demo-etsy: single "Get yours on Etsy →" and NO secondary;
// F2 (SITE_SELLS_DIRECT): primary → /order/new?…, secondary → kind "etsy" (EtsyButton). Every Etsy href goes through /go/etsy — a literal "etsy.com" outside lib/catalog/listings.ts and lib/site.ts fails tests/design-system.test.ts.

// lib/nav.ts
export interface NavLink { label: string; href: string }
export const HEADER_LINKS: NavLink[]; export const MOBILE_EXTRA_LINKS: NavLink[]; export const FOOTER_COLUMNS: { title: "Shop" | "Trust" | "Legal"; links: NavLink[] }[];  // COPY §1.1–1.2

// lib/copy/canon.ts — C7–C20 as named constants (C1–C6 stay in content/blocks via block())
export const CANON = { packLine, registeredIdLine, numberlessLine, deliveryClocks, fictionalLabel, trustLine, aiActLine, weAreNewShort, seniorDateLine, galleryCaption, proofChecklist, partners } as const;

// lib/color.ts
export function contrastRatio(hexA: string, hexB: string): number;
export function teamAccent(hex: string | undefined): { color: string; mode: "text" | "rule" }; // ≥ 4.85 on #080C12 → text; else { color: hex, mode: "rule" } (white text + 4 px rule)

// lib/alt.ts — COPY §0.5 patterns; throws in dev if a numberless sport gets a number
export function altCardFront(sport: Sport, finish: Style, fictional?: boolean): string; altCardBack(...); altPoster(...); altRoom(...); altBefore(sport: Sport): string; altProof(...); altCertificate(): string;

// lib/assets.ts — the site image map (public paths + intrinsic sizes + alt + provenance); executed by scripts/site-assets.ts
export interface SiteAsset { key: string; out: string /* /images/... */; src: string /* repo-relative source */; width: number; height: number; alt: string; fictional: boolean; status: "verified" | "locate" }
export const SITE_ASSETS: Record<string, SiteAsset>;   // keys listed in §5.9
export function asset(key: string): ImageSpec;         // { src: out, alt, width, height }; throws on unknown key

// lib/reviews.ts
export interface Review { displayName: string; sport: string; tier: string; text: string; source: "site" | "etsy"; consentAt: string; consentToPublish: boolean; isFriendsAndFamily?: boolean; date: string }
export function publishedReviews(): Review[];          // content/reviews/*.json with consentToPublish; [] when the dir is absent → the block is not rendered
```

### 4.10 `lib/registry/art.ts` (Wave 0 paths; Wave 1 registry-card adds sources + existence)
```ts
export interface CardArt { front: string; back: string; flipMp4?: string; flipGif?: string; poster?: string }
export const CARD_ART_SIZE = { width: 900, height: 1260 } as const;          // 5:7, 2× a 450 px render
export function cardArtPaths(cardId: string): Required<Pick<CardArt, "front" | "back">> & CardArt;
// → { front: `/cards/${id}/front.webp`, back: `/cards/${id}/back.webp`, flipMp4: `/cards/${id}/flip.mp4`, flipGif: `/cards/${id}/flip.gif` }
export function cardArtExists(cardId: string): { front: boolean; back: boolean; flipMp4: boolean; flipGif: boolean }; // fs.existsSync under public/ (server only)
export function cardArtFor(cardId: string): CardArt | null;                  // null when front or back is missing → /c renders without the flip section
export const ART_REQUIRED: string[];                                         // every public + fictional + non-deleted record whose id is NOT in ART_PENDING → front and back must exist (tests fail otherwise)
export type ArtTicket = "F1-ART-01" | "F1-ART-02";
export interface ArtPending { cardId: string; reason: string; ticket: ArtTicket }
export const ART_PENDING: readonly ArtPending[] = [                          // the exact five, verbatim (Wave 0 writes them; only a landed export may remove one)
  { cardId: "GDE-CA-SFB-2026-03", ticket: "F1-ART-01", reason: "No Chrome All-Star softball card face on disk; Figma export from the softball sport file (ASSETS-LISTING 5.1)." },
  { cardId: "GDE-SN-SFB-2026-03", ticket: "F1-ART-01", reason: "Only a pre-square-corner Stadium Night export exists (marketing/cards, 2026-08-29); square-cut re-export from the softball sport file." },
  { cardId: "GDE-FS-WRS-2026-01", ticket: "F1-ART-01", reason: "No Fire & Smoke wrestling card face on disk (marketing/cards/wrestling-front.png is Stadium Night); Figma export from the wrestling sport file." },
  { cardId: "GDE-HE-WRS-2026-01", ticket: "F1-ART-01", reason: "No Heritage wrestling card face on disk (only the Heritage poster exists); Figma export from the wrestling sport file." },
  { cardId: "GDE-SN-BKB-2026-23", ticket: "F1-ART-02", reason: "Only Nia-era art exists (pre-square-corner, swoosh) and it is denylisted; regenerate with audit (spec 11 F1) or the owner privatises the record." },
];
export const isArtPending = (cardId: string): boolean => ART_PENDING.some((p) => p.cardId === cardId);
```
**`ART_PENDING` semantics (binding for Wave 0, registry-card and the integrator).**
- The five entries above are the complete list as of 2026-09-06; the four F1-ART-01 IDs and Nia's ID are public `demo-etsy`
  records whose QR codes are printed (`docs/f1/ASSETS-LISTING.md` §5.1, §7 #1–2). They stay **public** — never flipped to
  `private`/`unlisted` by a builder — because the F1 exit criterion is "scan any card → the exact card" and a printed QR that
  lands on a neutral page is a worse outcome than one that lands on a live registration without art.
- `reason` strings live in `lib/`, which `tests/forbidden-strings.test.ts` scans: write "pre-square-corner", never the banned
  corner phrase; never "Verified"; never a card count.
- **The page never reads `ART_PENDING`.** `/c` decides on `cardArtFor(id)`: `null` (pending id, or any record whose files are
  missing) → the COPY §2.15 (2b) pending block replaces the flip hero, the **DOWNLOADS** heading and its rows are omitted, the OG
  image puts the shield where the front would be (§5.6), JSON-LD omits `image` and emits no `VideoObject`; identity header (with C13 for demo records),
  edition panel, stats, share, about-this-finish, CTA row and footer render unchanged — "the registration below is live" must be
  literally true.
- `scripts/card-assets.ts` (§4.11): the default run skips pending IDs and prints `PENDING <ticket> <cardId>`; `--audit` lists them
  the same way; `--id <pending id>` with a present source converts anyway and prints "remove <cardId> from ART_PENDING".
- `lib/registry/art-sources.ts` pre-declares the four F1-ART-01 entries with the target paths from ASSETS-LISTING §5.1
  (`card-flip/assets/{softball-ca,softball-sn,wrestling-fs,wrestling-he}/card-{front,back}.png`, `pending: "F1-ART-01"`) so that
  closing the ticket is: drop the files in, delete four entries from `ART_PENDING`, run `cards:assets`, commit `public/cards/<id>/*`.
- Tests (`tests/registry.test.ts`, extended by registry-card): (1) every `ART_REQUIRED` id has `public/cards/<id>/front.webp` and
  `back.webp`; (2) every `ART_PENDING` id resolves via `getCard`, is `isFictional`, visibility ≠ `deleted`, `reason` non-empty;
  (3) **no `ART_PENDING` id has `public/cards/<id>/front.webp`** — a landed export must leave the list, pending can never hide art;
  (4) `ART_PENDING` ∩ `ART_REQUIRED` = ∅, no duplicate ids; (5) rendering `/c/<pending id>` contains the §2.15 (2b) sentence and
  no `<video>`, no "Tap to flip", no "DOWNLOADS"; (6) `ART_REQUIRED` + pending ids = all public fictional non-deleted ids.

`lib/registry/art-sources.ts` (registry-card): `DEMO_ART_SOURCES: Record<cardId, { front: string; back: string; flipMp4?: string; flipGif?: string; note?: string; pending?: ArtTicket }>` with repo-relative sources — starting table in §9.1, full per-card map in `docs/f1/ASSETS-LISTING.md` §5 / §6.3 (+ the held-back rows in §6.3(b)).

### 4.11 `scripts/card-assets.ts` (registry-card) — `npm run cards:assets -- [--id <cardId>] [--force] [--audit]`
`docs/f1/ASSETS-LISTING.md` §5 / §6.3 is the human manifest (source → destination, verdicts, held-back rows); the machine manifest lives in code (`lib/registry/art-sources.ts`), transcribed from it.
For each `cardId` in the manifest (or `--id`): read the source PNG with `sharp`; if it is a print file with
bleed (816×1110) crop 36 px per side to 744×1038; assert aspect 5:7 ± 1 %; resize to 900×1260 (`fit: "fill"`,
`kernel: "lanczos3"`); assert the four corner pixels are opaque and non-white-masked (square-cut audit, both
directions: no transparent corners, no rounded alpha); write `public/cards/<id>/front.webp` and `back.webp`
(quality 82, effort 5); copy the MP4 through `ffmpeg -i in -c copy -movflags +faststart` and assert
`ffprobe` reports h264 / yuv420p / ≤ 2.5 MB; copy the GIF only if ≤ 4 MB (download only, never inline);
write `public/cards/<id>/manifest.json` `{ cardId, front, back, flipMp4?, flipGif?, sourceSha256, generatedAt }`.
Skip when outputs exist unless `--force`. `--audit` only measures and prints a table. Exit non-zero on any
assertion. Never touches a card not in the manifest; never reads `orders/` without `--allow-orders`.

### 4.12 `scripts/site-assets.ts` (seo-assets) — `npm run site:assets -- [--key <k>] [--check]`
Executes `SITE_ASSETS`: `sharp` resize to the declared `width` (never upscale), WebP q80, writes `out`
under `public/images/…`, records `sha256(src)` in `public/images/.manifest.json`, and refuses any source
whose sha256 is in `scripts/denylist.json` (count-bearing art: every
`print-sources/output/*/GDE-*-booster-pack-FLAT-*.png`, `print-sources/output/tgc/*booster-pack*`,
`etsy/listing-images/03-senior-night/src/*-pack-*.png`, and every `print-sources/output/*/GDE-*-certificate-*.png`
— the six finish certificates print a card count; the SR certificates do not and are allowed). `--check`
verifies every `out` exists with the declared size and that no `public/images/**` hash is denylisted.
`tests/seo.test.ts` runs the same check against `.manifest.json`.

---

## 5. ROUTE / FILE OWNERSHIP MAP

Legend: **C** creates · **E** edits · **D** deletes · **R** read-only. Paths are repo-relative. A file not
listed for you is read-only for you.

### 5.1 Wave 0 — `design-system+shell` (sequential; may touch anything listed, nothing else)
| Action | Files |
|---|---|
| E | `app/globals.css` (replace with §1.1) · `app/layout.tsx` (site fonts from `lib/fonts/site.ts`; `metadataBase`; `<JsonLd>` organization + website; verification tags; no Inter/Oswald) · `next.config.ts` (**only** add `distDir: process.env.NEXT_DIST_DIR \|\| ".next"`) · `eslint.config.mjs` (add `".next-*/**"` to ignores) · `.gitignore` (add `.next-*/`) · `package.json` scripts: `"cards:assets": "tsx scripts/card-assets.ts"`, `"site:assets": "tsx scripts/site-assets.ts"`, `"typecheck": "tsc --noEmit --incremental false"` · `lib/site.ts` (§4.9 additions) · `lib/catalog/prices.ts` (add `perCardAnchor(now?: Date): number` = `ceilToHalf(sitePrice(P12)/12)`, `ceilToHalf`, `saleEndsLabel(): string` "Sep 24, 2026") · `lib/catalog/tiers.ts` (add `TRUE_COUNT_LINKS: { label: string; href: string }[]`, `boxContents(sku): string[]`) · `lib/catalog/sports.ts` (add `backLine(s): "their number" \| "their name, their club crest" \| "plain back"`, `NUMBERLESS_CODES`) · `lib/catalog/styles.ts` (add `slug`, `export type StyleCode = Style["code"]`) · `lib/registry/cards.ts` (**types + helpers only**: optional `registeredAt`, `updatedAt`, `ageBand?: "adult" \| "minor"`, `teamColors?`, `assets?`, `orderRef?`; `registeredAtOf(c)`, `updatedAtOf(c)`; no data edits) · `components/FictionalLabel.tsx` (restyle) · `components/BrandMark.tsx` (rebuild per §3) · `tests/forbidden-strings.test.ts` (add `\byouth\b`, `\bvintage\b`, `\$\d` scan of `scripts/`; keep `docs/` unscanned) |
| C | `lib/fonts/site.ts` · `lib/fonts/finishes.ts` · `lib/og.ts` · `lib/seo/jsonld.ts` · `lib/seo/titles.ts` · `lib/seo/meta.ts` · `lib/capacity.ts` · `lib/catalog/seasons.ts` · `lib/catalog/shipping.ts` · `lib/catalog/trust.ts` · `lib/catalog/faq.ts` · `lib/cta.ts` · `lib/nav.ts` · `lib/copy/canon.ts` · `lib/color.ts` · `lib/alt.ts` · `lib/assets.ts` · `lib/reviews.ts` · `lib/registry/art.ts` (paths + `ART_PENDING`; `cardArtExists` stub returning fs check) · `components/icons.tsx` · `components/brand/Shield.tsx` · `components/brand/Wordmark.tsx` · every component in §3 (`Pill DeliveryChips TrustLine TierCard FamilyCard EditionPanel StatChip Plate BracketFrame CapacityNote FourFears GateRow FounderNote ConsentRow CardFlip CopyIdButton ShareRow Breadcrumbs SiteHeader MobileMenu SiteFooter FaqList SectionHeading CtaPair EtsyButton OrderByCalculator NotFoundBody LookupForm ProofRejectedPair`) · `app/(marketing)/layout.tsx` (`<SiteHeader/>`, `<main id="main">`, `<SiteFooter/>`) · `app/(registry)/layout.tsx` (`data-surface="arena"`, slim header: `BrandMark tone="arena"` + `Pill outline-silver "REGISTERED EDITION"`, slim footer with Report/Manage lines slot) · `app/error.tsx` (COPY §2.13, client) · `app/not-found.tsx` (rewrite with `NotFoundBody`) · `public/favicon.svg` (replace the generic icon with the shield) · `public/icon.svg`, `app/manifest.ts` (name, shield icons, theme_color `#F4F3EF`) · `tests/design-system.test.ts` · `docs/f1/INTEGRATION-NOTES.md` (empty header) |
| Move (git-free `cp` + delete of the old path) | `app/page.tsx` → `app/(marketing)/page.tsx` (fix relative imports; old `site-client` stays in `app/` until the home builder deletes it) · `app/registry/**` → `app/(marketing)/registry/**` · `app/contact/page.tsx` → `app/(marketing)/contact/page.tsx` · `app/privacy/**`, `app/terms/page.tsx` → `app/(marketing)/…` · `app/c/[cardId]/page.tsx` → `app/(registry)/c/[cardId]/page.tsx` (unchanged content, imports fixed) |
| D | `app/api/submissions/**`, `app/api/_shared.ts` (dead order-form API — `grep -rn "api/submissions\|_shared" app lib components` must be empty first) · `public/images/sport-examples/**` (old sprites) · `public/images/{hero-basketball,hero-football,hero-softball,hero-identity-pack,hero-physical,team-order,transformation,styles-board,sports-board}.webp` (Cover-Moment-era; verify with `grep -rn` that only `app/site-client.tsx` references them — it is deleted in Wave 1) · `public/{file,globe,window}.svg` |
| R | everything else |
| Tests | owns `tests/forbidden-strings.test.ts`, `tests/prices.test.ts`, `tests/registry.test.ts`, `tests/design-system.test.ts` |

Wave 0 exit: `npm run typecheck && npx vitest run && NEXT_DIST_DIR=.next-wave0 npx next build` green; the old
home renders (unstyled is fine); `/c/GDE-SN-BKB-2026-12` renders inside the arena layout.

### 5.2 Wave 1 — `home`
| Action | Files |
|---|---|
| E | `app/(marketing)/page.tsx` (rewrite: 13 sections per COPY §2.1; `revalidate = 3600`; `pageMeta("/")`) |
| C | `app/(marketing)/opengraph-image.tsx` (home composite; this file is also the **default OG for every marketing route without its own**) · `app/(marketing)/_home/*.tsx` (section components private to home, server) · `tests/home.test.ts` |
| D | `app/site-client.tsx` · `app/site-config.ts` — **only after** confirming each of the 14 `faqItems` questions exists in `lib/catalog/faq.ts` (write the diff into INTEGRATION-NOTES if one is missing) |
| R | `lib/**`, `components/**` |
| Notes | Inline registry lookup posts to `/registry/lookup` (registry-card's route) — the form markup is `LookupForm inline`. `EditionPanel` demo uses `getCard("GDE-SN-BKB-2026-12")` (read). Occasion cards from `activeOccasions(new Date())`; Christmas dates from `christmasDates`. Reviews block: `publishedReviews().length === 0` → nothing. The rejected/approved pair, the three process thumbnails and the QR-ring crop come from `SITE_ASSETS` keys (§5.9); if a key is `status: "locate"` render the section with the text and no media and note it. |

### 5.3 Wave 1 — `families`
| Action | Files |
|---|---|
| C | `app/(marketing)/trading-cards/page.tsx` · `app/(marketing)/posters/page.tsx` · `app/(marketing)/complete-set/page.tsx` · `app/(marketing)/(families)/_shared/*.tsx` (spec sheet table, sport picker (server-rendered `<select>` + `?sport=` via `searchParams`; a client island only if needed), six-finishes row, numberless block) · one `opengraph-image.tsx` per family route · `tests/families.test.ts` |
| R | everything else (prices, tiers, delivery, shipping, faq subsets, jsonld, cta, assets, registry read for the demo panel) |
| Notes | `TierCard` ×4 (`tiersFor(family, true)` and render only `enabled`); `productFamily()` JSON-LD **once per page** with `offers.url` = the page; `FaqList jsonLd` with `faqSubset("<family>")`; `CapacityNote` under the tiers; `revalidate = 3600`. Card hero flip: `CardFlip` with `cardArtPaths("GDE-SN-BKB-2026-12")` and `autoplay={false}` (it is above the fold). Poster room shots: see §9.1 (the `packages/room-*.png` files are blank plates — do not use). |

### 5.4 Wave 1 — `senior-night`
| Action | Files |
|---|---|
| C | `app/(marketing)/senior-night/page.tsx` · `app/(marketing)/senior-night/opengraph-image.tsx` · `app/(marketing)/senior-night/_gift-note.tsx` (printable; `print:` variants) · `tests/senior-night.test.ts` |
| R | `lib/capacity.ts` (pure functions; test them from your test file with fixed dates), `components/OrderByCalculator.tsx`, everything else |
| Notes | Only `CHIPS.seniorNight` on this page; no finish picker; nine tiles per COPY §2.5 (4) — never dance/track/band/lacrosse; `FaqList jsonLd` with `faqSubset("senior-night")`; `revalidate = 3600`; `todayEt` passed from the server (`toEtDate(new Date())`) so the island hydrates deterministically. `/senior-night/[sport]` is **F2** — do not create it. |

### 5.5 Wave 1 — `trust-pages`
| Action | Files |
|---|---|
| C | `app/(marketing)/how-it-works/page.tsx` (+ `opengraph-image.tsx`) · `app/(marketing)/guarantee/page.tsx` (+ OG) · `app/(marketing)/photo-guide/page.tsx` (+ OG; print stylesheet via `print:` classes) · `app/(marketing)/about/page.tsx` (+ OG) · `app/(marketing)/faq/page.tsx` (`FaqList jsonLd` with `faqAll()`) · `tests/trust-pages.test.ts` |
| E | `app/(marketing)/contact/page.tsx` (rewrite to COPY §2.12 on the shared shell) |
| R | everything else (`GateRow`, `shippingRows`, `PARTNERS`, `article()`, `person()`, intake reason strings are copied from COPY, not imported from `art-pipeline/`) |
| Notes | `/how-it-works` and `/photo-guide` emit `article()`; `/about` emits `person()` (organization is already in the root layout — do not emit it twice). `/how-it-works` FAQ (6) and `/faq` (35) each emit their own FAQPage — that is allowed; **no page emits two**. Response-window sentence on `/contact` only if the owner commits (§12 #17) — default omitted. |

### 5.6 Wave 1 — `registry-card`
| Action | Files |
|---|---|
| E | `app/(registry)/c/[cardId]/page.tsx` (rebuild per spec §4.13 / COPY §2.15; `generateStaticParams` = `renderableCards()`; `dynamicParams = false`; `cardMeta()`; per-record finish pair; `CardFlip` when `cardArtFor(id)`; `EditionPanel copyButton lastUpdated`; stats; downloads; `ShareRow`; about-this-finish; `ctaFor("card-page", { channel })`; footer by visibility; `deleted` → `notFound()`) · `app/(marketing)/registry/page.tsx` (rewrite to COPY §2.10) · `lib/registry/cards.ts` (**data + logic**: `registeredAt`/`updatedAt`/`ageBand`/`teamColors` on records; `showsJerseyNumber(c)` = numbered sport && `ageBand !== "adult"`; `unlistedCardPaths(): string[]`, `privateCardPaths()`, `deletedCardPaths()`; rename the apex `SITE_URL` to `QR_ORIGIN` (keep the apex value — printed QR codes encode it) and update `scripts/gen-card-qr.ts`) · `lib/registry/art.ts` (implement `cardArtExists`, `ART_REQUIRED`; `ART_PENDING` stays the five §4.10 entries — remove one only when its export has landed) · `tests/registry.test.ts` (extend: art exists for `ART_REQUIRED`; unlisted title/OG/description contain no first/last name; private renders no name; `showsJerseyNumber` false for adults; corner audit results from `public/cards/*/manifest.json`) |
| C | `app/(registry)/c/[cardId]/opengraph-image.tsx` (public: front on arena + edition strip + name; unlisted: no name; private/deleted: shield only; `cardArtFor(id) === null` → the shield where the front would be, strip + name per visibility) · `app/(registry)/c/[cardId]/not-found.tsx` (COPY §2.13 card variant — used when `notFound()` is thrown for `deleted`; unknown IDs hit the root 404 whose `NotFoundBody` shows the same copy) · `app/(marketing)/registry/lookup/route.ts` (GET `?id=` and POST form-data; normalise `toUpperCase().replace(/\s+/g,"")`; `getCard` && visibility ≠ deleted → 303 `/c/<id>`; deleted → 303 `/c/<id>` (the 410 rewrite answers); miss → 303 `/registry?miss=1`; `Cache-Control: no-store`) · `app/api/gone/route.ts` (returns the COPY §2.13 410 HTML with `status: 410`, `X-Robots-Tag: noindex`, `Cache-Control: public, max-age=3600`) · `lib/registry/art-sources.ts` · `scripts/card-assets.ts` · `public/cards/<id>/{front,back}.webp, flip.mp4, manifest.json` (generated) · `tests/registry-card.test.ts` |
| R | everything else |
| Notes | `/c` JS budget < 300 KB First Load (Next 16 baseline ≈ 105 KB + three tiny islands). No prices, no coupons on `/c`. **Five public demo records have no allowed art and ship as `ART_PENDING` (§4.10, the verbatim list): `GDE-CA-SFB-2026-03`, `GDE-SN-SFB-2026-03`, `GDE-FS-WRS-2026-01`, `GDE-HE-WRS-2026-01` (ticket F1-ART-01 — Figma export by the owner / Figma agent before Wave 2, recipe in ASSETS-LISTING §5.1) and `GDE-SN-BKB-2026-23` (Nia Brooks, ticket F1-ART-02 — owner decision).** For these `cardArtFor(id)` is `null` and the page renders the COPY §2.15 (2b) pending block in place of the flip hero, omits DOWNLOADS, keeps everything else; do not touch their `visibility`, do not export from Figma yourself, do not crop `marketing/cards/softball-*.png` inside the keyline as a stand-in. Pre-declare their `DEMO_ART_SOURCES` entries with the §5.1 target paths so the ticket closes without a code change beyond deleting `ART_PENDING` entries. Real customers (`GDE-SS-TEN-2026-12`, `GDE-SN-BKB-2026-51`): art may come from `card-flip/assets/order03-sn/` and `orders/4164205493/**` **only for their own unlisted pages** and only with `--allow-orders` — never anywhere else on the site. |

### 5.7 Wave 1 — `legal`
| Action | Files |
|---|---|
| E | `app/(marketing)/privacy/page.tsx` · `app/(marketing)/privacy/biometric/page.tsx` · `app/(marketing)/terms/page.tsx` (bodies replaced by COPY §2.16; version line; `id="refunds"`, `id="registry"`, `id="subprocessors"` anchors; no TEMPLATE label anywhere) |
| C | `app/(marketing)/accessibility/page.tsx` (COPY §2.14) · `content/legal/CHANGELOG.md` (version table: `2026-09-F1 · effective <date> · summary`) · `tests/legal.test.ts` (no "TEMPLATE"; version line present on all four; anchors exist; imprint fallback text present when `imprintComplete()` is false; retention table numbers 30 / 12 / ≥ 5 present) |
| R | everything else |

### 5.8 Wave 1 — `seo-assets`
| Action | Files |
|---|---|
| E | `app/sitemap.ts` (pages from `PAGES` where `phase === "F1"` and not `noindex`, `priority`/`changeFrequency` from the table; public cards with `lastModified: updatedAtOf(c)`; **no** unlisted/private/deleted) · `app/robots.ts` (disallow `/api/ /go/ /etsy /order/ /t/ /lp/ /registry/lookup`) · `next.config.ts` (**owner from Wave 1 on**: `redirects()` — `/styles/senior-night → /senior-night` 308, `/sports/other-sport → /sports/skateboarding` 308, `/verify → /registry` 308, old Cover-Moment paths `/order`, `/order-form`, `/#order` → `/trading-cards` 308 (list any others found in `git log -p -- app | grep href`); `headers()` — existing security headers + `X-Robots-Tag: noindex, nofollow` for `/order/:path*`, `/t/:path*`, `/lp/:path*`, `/api/:path*`, `/go/:path*`, `/etsy`, `/registry/lookup` and **one explicit rule per path from `unlistedCardPaths()` and `privateCardPaths()`** (imported from `lib/registry/cards.ts` — `next.config.ts` is transpiled by Next's SWC config loader, relative TS imports work; fallback if the import ever fails at build: `scripts/write-robots-rules.ts` emits `lib/registry/robots-rules.json` and the config reads that); `rewrites()` — `beforeFiles`: one `{ source: "/c/<id>", destination: "/api/gone" }` per `deletedCardPaths()` (empty today; the mechanism ships with a fixture test)) |
| C | `lib/seo/intents.ts` · `scripts/site-assets.ts` · `scripts/denylist.json` · `public/images/**` outputs of `SITE_ASSETS` (+ `public/images/.manifest.json`) · `tests/seo.test.ts` (intents uniqueness; every `PAGES` title ≤ 60 with suffix and description ≤ 155; sitemap excludes every non-public card and every `noindex` page; `headers()` contains a rule for every unlisted/private card and none for public ones; `rewrites()` contains every deleted card; redirects resolve; `.manifest.json` hashes not in denylist; every `SITE_ASSETS.out` exists with declared dimensions when `status === "verified"`) |
| R | everything else |
| Notes | `next.config.ts` and `app/sitemap.ts` are yours from Wave 1 on — nobody else edits them. Asset provenance is your job: before converting any candidate, thumbnail it (≤ 360 px) and confirm it is not Nia Brooks (#23, Northside Wolves), not a pack face, not a certificate with a count; record `status: "verified"` in `lib/assets.ts` via INTEGRATION-NOTES (the file is design-system's — you propose, the integrator flips the status; until then pages render text-only for `locate` keys). |

### 5.9 `SITE_ASSETS` keys every page builder may rely on (defined in Wave 0; files produced by seo-assets)
`home.hero.before` · `home.hero.after` · `home.qr-ring` · `home.proof` · `home.process.intake` ·
`home.process.plate` · `home.process.proof` · `home.rejected.fail` · `home.rejected.pass` ·
`finish.<SN|CA|FS|HE|SS|PR>.front` (same fictional basketball athlete, `etsy/listing-images/01-basketball-card/src/BK-<XX>-front.png`) ·
`finish.SR.tile` · `sport.<slug>.front` (15 from `marketing/cards/<slug>-front.png` at 900×1260; `pickleball`/`other-sport` absent → text tile) ·
`cards.front-back` (`01-basketball-card/02-front-back-registered.png`, 2000²) · `cards.four-shots` · `cards.six-finishes` · `cards.cheer.front` / `cards.cheer.back` ·
`posters.room` · `posters.scale` · `posters.pairs.<sn-ca|fs-he|ss-pr>` · `set.hero` · `set.counted` · `set.tile.printed` (`04-complete-set/v3/tile-printed.jpg`) ·
`sn.hero` (`03-senior-night/01-hero.png`) · `sn.back` (`src/bsb-sr-back.png`) · `sn.cert` (`src/bsb-sr-cert.png` — **verified count-neutral 2026-09-06**) · `sn.badge` · `sn.sticker` · `sn.sport.<slug>.front` (from `card-flip/assets/<sport>-sr/card-front.png`) ·
`how.gate.<photo-check|kit|plate|shots|verification|finish>` · `photo-guide.panels` (`public/images/photo-guide.webp`, exists) · `about.founder` (`public/brand/founder.jpg`, real, absent today).

---

## 6. METADATA, ROBOTS, 410

### 6.1 Canonical and titles
- `metadataBase: new URL(SITE_URL)` stays in `app/layout.tsx` (`SITE_URL` = `https://www.gamedayedition.com` on Vercel). Every page sets `alternates: { canonical: "/path" }` **relative** — Next resolves it against `metadataBase` to the absolute `www` URL; `openGraph.url` the same way. Never hand-build absolute URLs in metadata.
- Root `title.template = "%s | Game Day Edition"`; pages pass the head phrase only (`PAGES[path].title`). `/c` pages use `title: { absolute }` because the string already ends in "Game Day Edition" (public) or "Registered Edition" (unlisted). Templates per §8: product `"<Head phrase> From Your Photos"`, occasion `"<Occasion> Gift: Custom Poster & Card Set"`, `/c` public `"<First> <Last> · <Team> · <Finish> — Registered Game Day Edition"`, unlisted `"<Finish> — Registered Edition"`. No "youth". One `<h1>` per page.
- `lib/seo/titles.ts` is the single table; `tests/seo.test.ts` enforces lengths there. Pages that invent a title outside the table fail the "every F1 page path is in `PAGES`" check.

### 6.2 `/c` visibility → robots
| Visibility | Renders | `<meta name="robots">` | Sitemap | OG | `X-Robots-Tag` |
|---|---|---|---|---|---|
| public | full page | none | yes (`lastModified = updatedAtOf`) | front on arena + edition strip + name | none |
| unlisted | full page | `noindex, nofollow` | no | no name, no highlight | `noindex, nofollow` via an explicit `headers()` rule for that exact path |
| private | neutral notice, no name/art | `noindex, nofollow` | no | shield only | same |
| deleted | 410 (`/api/gone` via rewrite) | — (body has none) | no | none | `noindex` on the 410 response |
| unknown ID | root 404 with the `/c` copy | 404 is not indexed | no | — | — |

**Why explicit header rules, not middleware.** Static pages cannot vary headers by data at request time;
`next.config.ts` `headers()` can only match paths. Because the registry is code, the list of unlisted/private
paths is known at build time, so we generate one exact-path rule per record (a few dozen rules; Vercel's
limit is ~1 024 routes). The trade-off: a visibility change needs a redeploy — which is already true for the
static registry. A `proxy.ts` (Next 16's name for middleware) is **not** introduced in F1; it arrives in F2
with `/order/*` where it is needed anyway, and can then take over these rules. Meta robots + sitemap
exclusion remain the primary signal; the header is belt-and-braces.

**410 for deleted cards.** A page component can only produce 404 (`notFound()`); `redirects()` refuses
non-3xx status codes (`allowedStatusCodes` = 301/302/303/307/308). So: `rewrites().beforeFiles` maps each
deleted card path to `app/api/gone/route.ts`, which returns the branded HTML with `status: 410`. The page
additionally calls `notFound()` for `deleted` records (defence in depth if a rewrite is missing).
`dynamicParams = false` keeps `/c` fully static — an unknown ID costs no function invocation; the root
`not-found.tsx` renders the `/c` copy by pathname.

---

## 7. PERFORMANCE AND ACCESSIBILITY BUDGETS — and how each builder proves them

| Budget | Rule | Proof (without running the site) |
|---|---|---|
| LCP < 2.5 s mobile on `/`, `/senior-night`, `/c`, families | The hero's one image gets `priority`; hero image ≤ 1 200 px wide, WebP; no `<video>` and no CardFlip autoplay above the fold; hero text is server HTML | `tests/<area>.test.ts`: the page/section files contain exactly one `priority` and no `<video` in hero components; `next build` route table shows `○ (Static)` for every F1 route |
| `/c` First Load JS < 300 KB, above-the-fold < 1 MB | Three islands only; finish fonts `preload: false`; front image 900×1260 WebP ≤ 180 KB | `next build` output line for `/c/[cardId]` (paste it into INTEGRATION-NOTES); `manifest.json` sizes |
| CLS < 0.1 | Every `<Image>` has `width`/`height` (or `fill` inside an `aspect-*` box); CardFlip reserves `aspect-[5/7]`; fonts `display: swap` with `adjustFontFallback` | `tests/design-system.test.ts` greps `components/` for `<Image` without `width=` and without `fill` |
| Images | `next/image` everywhere; `sizes` on every responsive image; descriptive file names from `SITE_ASSETS.out`; alt from `lib/alt.ts` or COPY §0.5; lazy below the fold (default) | grep: every `<Image` with `fill` or `w-full` has `sizes=` |
| Fonts | 3 site families on marketing routes; one finish pair on `/c` | `tests/design-system.test.ts` import-boundary check |
| Motion | only `duration-hover` (180 ms) / `duration-panel` (240 ms) transitions and the flip; global reduced-motion rule; no parallax, no scroll-jacking, no looping hero video | grep `components/` + `app/` for `animate-` other than `animate-card-flip*`, and for `IntersectionObserver` outside `CardFlip.tsx` |
| Focus | `:focus-visible` accent ring (base); never `outline-none` without a replacement ring | grep for `outline-none` / `focus:outline-0` in your files → must be 0 |
| Tap targets ≥ 24 px (buttons 48 px) | `CtaPair` `h-12`; footer/nav links `py-1.5` (≥ 24 px line box); `ShareRow`/`CopyIdButton` `min-h-6 min-w-6` | manual checklist in your DoD note |
| Contrast | only §1.2 pairs; muted text ≥ 18.66 px or 14 px bold; team colour via `teamAccent()` | `tests/design-system.test.ts` unit-tests `contrastRatio` on every §1.2 pair (≥ 4.5, ≥ 4.85 on arena) |
| Alt / SR | every image real alt; muted video text in DOM; `FictionalLabel` text in DOM; CardFlip button + live region | grep `alt=""` in your files → only decorative brand SVGs |
| Lighthouse SEO ≥ 95 | canonical, title/description lengths, one h1, JSON-LD valid, robots | `tests/seo.test.ts`; the integrator runs Lighthouse once |

---

## 8. DEFINITION OF DONE + VERIFICATION COMMANDS

Every builder, in this order, from `/Users/a/Documents/sportscover`:
```bash
npx tsc --noEmit --incremental false                     # ~20 s; must be clean
npx vitest run                                           # all suites, not just yours (shared tree)
npx eslint app components lib tests scripts               # 0 errors (warnings allowed only from pre-existing files)
NEXT_DIST_DIR=.next-<your-builder-name> npx next build   # ONCE, at the end; 1–2 min; needs NEXT_PUBLIC_SITE_URL unset or =https://www.gamedayedition.com
```
- `next build` writes to `.next-<name>` (git-ignored) so seven parallel builds never collide. **Do not run
  `next dev` or `next start`** — the integrator does; the Browser/preview tools are not for builders.
- If `next build` fails on another builder's half-finished file, note it in INTEGRATION-NOTES with the error
  line and stop — do not "fix" their file.
- Add to `docs/f1/INTEGRATION-NOTES.md` under your name: routes built, the `next build` size line(s) for
  your routes, assets you found/verified/still `locate`, open items.

Per-builder done means:
| Builder | Done when |
|---|---|
| design-system+shell | §1.1 CSS in place; all §3 components exist with the stated props and a smoke render test each (`renderToStaticMarkup`); all §4 Wave-0 libs with tests; route groups + layouts; old home and `/c` still build; `tests/design-system.test.ts` covers: token values present, font import boundary, CardFlip/BracketFrame radius-0, EtsyButton no accent, no `async` components, contrast pairs, `etsy.com` literal boundary, `perCardAnchor() === 4.5` today |
| home | 13 sections with COPY §2.1 strings; one `priority`; `EditionPanel` demo; occasions by date; reviews block absent; `site-client.tsx`/`site-config.ts` deleted; `tests/home.test.ts` (metadata from `PAGES["/"]`, section order, no `$` literal, FictionalLabel count ≥ images of athletes) |
| families | 3 pages; `TierCard` ×4 with hidden tiers hidden; Product JSON-LD once per page validated by `productFamily`; FAQ subset with schema; `CapacityNote`; `revalidate`; `tests/families.test.ts` |
| senior-night | page + calculator island + gift note; `tests/senior-night.test.ts` runs `seniorNightPlan` for: night in 3 days (files only), 10 days (files + nothing printed), 20 days (printed set fits, pack not), 40 days (all) |
| trust-pages | 6 pages; GateRow with 6 gates; shipping table from `shippingRows`; refund ladder; Article/Person/FAQ schema rules; `tests/trust-pages.test.ts` (each page emits ≤ 1 FAQPage; `faqSubset("how-it-works")` ids unique; partners = `PARTNERS`) |
| registry-card | `/c` rebuilt for all 4 visibilities; art generated for `ART_REQUIRED`; lookup route; 410 route; OG; `tests/registry-card.test.ts` + extended `tests/registry.test.ts` |
| legal | 4 pages, versioned, anchors, `tests/legal.test.ts` |
| seo-assets | sitemap/robots/headers/rewrites/redirects; intents; assets converted with provenance; `tests/seo.test.ts` |

Integrator (Wave 2): `npm run cards:assets && npm run site:assets --check`, `rm -rf .next-*`, `npm run check`,
`npx next build`, Lighthouse on the four core pages, then commit on `site/f1`.

---

## 9. DECISIONS TAKEN HERE, ASSET FINDINGS, OPEN QUESTIONS

### 9.1 Asset findings (verified 2026-09-06 with `sips`/PIL + ≤ 360 px thumbnails)
- **Nia Brooks (#23, Northside Wolves) — forbidden — is** `card-flip/assets/{ca,fs,he,pr,ss}/`, `card-flip/assets/card-front.png|card-back.png`, `card-flip/out/GDE_{SN,CA,FS,HE,PR,SS}_CardFlip_*` (finish-only names) and the registry record `GDE-SN-BKB-2026-23`. Verified visually on `ca/` and `fs/`; treat the rest of that set as Nia until a thumbnail says otherwise.
- **Usable demo art (square corners verified on two samples; all 1500×2100):** `card-flip/assets/marcus-sn/` → `GDE-SN-BKB-2026-12` · `football-fs/` → `GDE-FS-FTB-2026-54` · `baseball-he/` → `GDE-HE-BSB-2026-07` · `cheer-pr/` → `GDE-PR-CHR-2026-01` · `soccer-ca/` → `GDE-CA-SOC-2026-10` · `volleyball-ss/` → `GDE-SS-VBL-2026-05` · `football-sr/` → `GDE-SR-FTB-2026-54` · `baseball-sr/` → `GDE-SR-BSB-2026-07` · `cheer-sr/` → `GDE-SR-CHR-2026-01` · `soccer-sr/` → `GDE-SR-SOC-2026-10` · `volleyball-sr/` → `GDE-SR-VBL-2026-05` · `softball-sr/` → `GDE-SR-SFB-2026-03` · `wrestling-sr/` → `GDE-SR-WRS-2026-01` · `order03-sn/` → `GDE-SN-BKB-2026-51` (real, unlisted only). Listing-source cards (750×1050, square): `01-football-card/src/FB-HE-card-{FRONT,BACK}.png` → `GDE-HE-FTB-2026-54`; `01-cheerleading-card/src/CH-SS-card-{FRONT,BACK}.png` → `GDE-SS-CHR-2026-01`; `01-basketball-card/src/BK-SN-card-{FRONT,BACK}.png` = Marcus (alternative source for SN-BKB-12).
- **Still to locate** (registry-card): `GDE-SR-BKB-2026-12` (Marcus SR), `GDE-CA-SFB-2026-03`, `GDE-SN-SFB-2026-03`, `GDE-FS-WRS-2026-01`, `GDE-HE-WRS-2026-01` — `etsy/listing-images/01-{softball,wrestling}-card/src/` are empty; look in `art-pipeline/out/etsy-shots/{softball,wrestling}/` and the Figma sport files (`docs/FIGMA-FILES.md`). Flip MP4s per card: match by thumbnail (`ffmpeg -ss 1 -i <mp4> -frames:v 1 -vf scale=300:-1 t.png`), never by file name alone (`GDE_SNLIGHT_*` etc. are unlabelled).
- `art-pipeline/out/etsy-shots/packages/room-{18x24,24x36,30x40}.png` and `int-<FIN>.png` are **blank plates** (a black rectangle on a wall) — composite backgrounds, not room shots. Use the composited listing slides (`0N-<sport>-poster/03-*.png`, `04-complete-set/03-card-in-hand-poster-on-wall.png`, per-sport `etsy-shots/<sport>/p-room-lead.png`) after a thumbnail check.
- `etsy/listing-images/03-senior-night/src/bsb-sr-cert.png` is count-neutral ("a single numbered Senior Night edition") → allowed. Every `print-sources/output/*/GDE-*-certificate-*.png` and every pack face is denylisted (CLAUDE.md: they print "10").
- `public/brand/{shield,wordmark}.svg` are Figma exports **with the artboard**: a `#E5E5E5` rect + white rect behind the glyphs; the shield is flat navy `#172C50` (no silver). Design-system strips the rects and adds the silver gradient for arena; if the paths look wrong at 4×, re-export 65:3 / 63:3 from Figma without background. `public/favicon.svg` is a generic two-tone icon, not the shield → replaced in Wave 0.
- `public/images/finishes/*.webp` (600×840) provenance unknown (`sips` cannot read WebP; check with PIL) — do not use until verified not to be Nia. `public/images/cards/<slug>.webp` (15, 600×840) are the `marketing/cards` fronts and stay usable; `marketing/cards/` itself is git-ignored, so `public/images/` is the tracked copy.
- `orders/4164205493/` exists (a real Etsy order) — only `registry-card` with `--allow-orders`, only for that customer's unlisted page.

### 9.2 Decisions made by this contract (override where they conflict with COPY.md)
1. Tailwind utilities in JSX + shared React components; `globals.css` owned by design-system only; Tailwind's default palette wiped (`--color-*: initial`).
2. `CapacityNote` renders the chip-derived dates (cap off) **on the three family pages only** (COPY §1.3 says hidden; the spec §4.2 lists it on family pages; the build brief asks for chip-derived dates — this is the reconciliation).
3. SR senior quote in Playfair Display italic (Oswald has no italic).
4. `hasMerchantReturnPolicy.returnPolicyCategory = MerchantReturnNotPermitted` + link to `/guarantee` — honest for made-to-order goods where defects are reprinted/refunded without a return. Owner/lawyer may prefer `MerchantReturnFiniteReturnWindow` (30 days, free) if Merchant Center listings are ever wanted; one-line change in `jsonld.ts`.
5. `priceValidUntil` only while the sale runs (spec says "+1 day"; a past date after the sale would be invalid markup).
6. Unlisted/private `X-Robots-Tag` via explicit per-path `headers()` rules; 410 via `rewrites` → `/api/gone`; no `proxy.ts` in F1.
7. `/c` stays `dynamicParams = false`; unknown IDs get the `/c` copy from the root 404 via `NotFoundBody` (pathname sniff) — zero function invocations.
8. Flip MP4s (≤ 1.6 MB each, ~20 files ≈ 30 MB) are committed under `public/cards/` for F1; GIFs (3.4 MB) are not committed unless ≤ 4 MB and only linked. Revisit when R2 arrives (F2).
9. Route groups `(marketing)` and `(registry)` are introduced in Wave 0 by moving the existing files, so Wave-1 builders inherit the layouts.
10. `lib/seo/titles.ts` is the one metadata table; `tests/seo.test.ts` reads it instead of importing page files (page files import `next/image`, which is not Vitest-friendly).
11. Lab holiday calendar and `US_TRANSIT_BUSINESS_DAYS = 5` are assumptions, named as constants so the owner can change one number.
12. `registry` lookup is a plain POST route (`/registry/lookup`, 303) — works with JS off; no enumeration surface; Vercel WAF rate limit (owner) later.

### 9.3 Open questions (owner / integrator)
- **F1-ART-01** (owner / Figma agent, before Wave 2): export the four softball / wrestling card faces per ASSETS-LISTING §5.1; until then those pages show the pending block. **F1-ART-02** (owner decision): regenerate `GDE-SN-BKB-2026-23` art with audit (spec §11 F1 "Nia Brooks regenerated") and export it the same way, or set the record `private` (COPY §2.15 (8) neutral body; the QR still resolves) — until decided it is public and `ART_PENDING`.
- Imprint values (§12 #6) — footer/terms/about render the fallback line until `NEXT_PUBLIC_IMPRINT_*` are set; `organization()` omits `address` until then.
- `public/brand/founder.jpg` (D10) — absent → founder blocks render without a photo; `person()` without `image`.
- Canonical social handle + Facebook Page ID (§12 #21) — `SOCIAL_LINKS` comes from env; empty entries are omitted.
- Response-window sentence on `/contact` (§12 #17) — omitted by default.
- Return-policy category (9.2 #4) and the Christmas transit allowance (9.2 #11).
- Six vs seven Wave-1 agents (§0.1).
- Whether the Figma 65:3 / 63:3 SVGs should be re-exported without the artboard rather than cleaned by hand.
