# DESIGN DIRECTION B — "ARENA BROADCAST"
gamedayedition.com · F1 visual brief · 2026-09-06

Companion to `docs/SITE-BUILD-SPEC-2026-09.md` §2 (fixed brand system) and `docs/f1/COPY.md` (the
copy this brief is designed around — strings referenced as C1…C20 and by section number are
those). Where this brief and the spec disagree, the spec wins; where this brief and COPY.md
disagree on a string, COPY.md wins. Everything else here is a decision a builder can implement
without asking.

---

## 0. READ FIRST — asset defects found while planning (fix before any section is built)

These were measured on 2026-09-06 with `sips` and a PIL pixel probe. None is a design opinion;
each will ship a visible defect if ignored.

| # | Defect | Fix |
|---|---|---|
| P1 | `public/brand/shield.svg` and `wordmark.svg` are raw Figma exports: each carries a `<rect fill="#E5E5E5">` canvas and a white `rx=24` plate behind the mark. Rendered as-is on stock you see a white box. `public/brand/shield.png` (512×555) has an opaque white background too. | Delete both `<rect>`s from each SVG, keep only the mark path, set the path `fill="currentColor"`. Ship the marks as an inline React component (`<Shield tone="navy|silver" />`, `<Wordmark tone="navy|white" />`) so the silver gradient (§2.1 `--silver`, 20°) can be a `<linearGradient>` inside the same SVG. Keep `wordmark-navy.png`/`wordmark-white.png` (they are transparent) only as OG fallbacks. Regenerate `shield.png` with alpha for `favicon`/app icons. |
| P2 | `marketing/cards/*-front|back.png` (900×1260) and `public/images/cards/*.webp` (600×840) have **white rounded corners baked in** (pixel (0,0)…(8,8) = pure white, dark by (20,20)). They are the pre-2026-09-01 rounded exports. At `border-radius: 0` on stock they show four pale notches; on arena, four white notches. | Re-export the 15 sport fronts square-cut from the sport template files (`docs/…` recipe in memory `gde-sport-template-files`) at 750×1050 → `public/images/site/cards/<slug>-front.webp`. **Stop-gap for the first build only:** render them inside `overflow-hidden aspect-[5/7]` with `scale-[1.05]` (crops ~22 px per side at 900 w, clears the 20 px white quarter-circles) and log the debt. The listing `src` faces (`etsy/listing-images/*/src/*-front.png`, 750×1050) are already square with opaque dark corners — prefer them wherever a sport has one. |
| P3 | Every certificate export (`FB-FS-certificate.png`, `bsb-sr-cert.png`, `print-sources/output/*/GDE-*-certificate-*.png`) prints "limited run of 10 cards". Count-bearing → banned (spec §2.4, CLAUDE.md). | Never ship a certificate image until a count-neutral export exists. Where copy calls for "certificate" in a composite, the slot renders the badge/sticker die-cut instead (`*-badge.png`, `*-sticker.png`) plus the text row. Add the certificate hashes to the `scripts/site-assets.ts` denylist (see §8.4). |
| P4 | Two slides carry banned words in baked headline art: `01-*-card/02-front-back-registered.png` ("FRONT + BACK. **NUMBERED**. REGISTERED.") and `03-senior-night/01-hero.png` (pill "**NUMBERED** + REGISTERED"). | Never show these two slides whole. Compose those sections from `src/` layers in the DOM (§6.1 `ProductComposite`). The QR "orange ring" is drawn in CSS over `BK-SN-card-BACK.png` (§6.3), not cropped from the slide. |
| P5 | Finish-name SVG labels (`public/brand/finish-labels/<CODE>.svg`) do not exist yet; the spec forbids loading per-finish fonts on marketing pages. | Export the 7 labels from the finish file (Figma `KzdEYF1UD9EnsczY8Kpyxi`, each finish's lockup text as outlines) → 7 SVGs, `currentColor`. **F1 fallback until exported:** Space Grotesk 700 uppercase text. Never a `next/font` load of Russo One/Orbitron/… outside `/c` and `/styles`. |
| P6 | The 7th finish tile ("Senior Night edition", same athlete) needs the basketball athlete in SR. Candidate: `etsy/listing-images/04-complete-set/src/marcus-sn-card-front.png` (Marcus Ellison, gold). | Measure it (`sips`), verify square corners with the PIL probe in §8.4, and confirm it is the same athlete as `BK-*-front.png`. Otherwise fall back to `03-senior-night/src/bsb-sr-front.png` and drop "same athlete" from the tile caption only (the H2 stays). |
| P7 | Home §10 and `/how-it-works` §3 need the **real** ice-hockey rejection (kit changed between shots, README §20). `art-pipeline/out/athletes/ice-hockey/_versions/` holds kit/identity versions; the rejected action frame must be located from `_qa-report.json` / `_revisions.json`. | Builder: `ls art-pipeline/out/athletes/ice-hockey/_versions | grep action`; the frame shown must be the one the caption describes. If it cannot be located, use the audited football pair (`01-football-card/src/s06-reject.png` 818×1740 + `s06-pose-1.png`) **and change the caption to the true reason for that rejection** — a caption that describes a different frame is the one thing this section may not do. |
| P8 | `--muted #6E7278` on `--stock #F4F3EF` measures ≈ 4.3:1 — under AA for text < 18.66 px bold. | Keep the token (spec-fixed) for ≥ 18 px text and for icons; add a derived token `--muted-text: #565B61` (≈ 5.6:1) for 12–16 px text on stock. On arena, muted text is `--arena-muted: #9AA4B2` (≈ 7:1 on `#14191F`). |

---

## 1. THESIS

Game night has a grammar — the lower-third slate, the score bug, the floodlit tunnel, the
replay — and Game Day Edition borrows that grammar to present a serious product: every section
opens like a broadcast slate (index, label, headline in Anton), the product sits on a dark
"field" that the light stock page cuts into like a control-room feed, and the cards themselves
are the only things allowed to move. The energy comes from scale and contrast — display type
that fills the measure, card faces at true 5:7 laid over the seams between sections, three
dark bands that hit like cutaways — while the discipline comes from a fixed rhythm (stock ·
stock · stock · arena · stock · arena · stock · stock · navy · stock · stock · arena · navy), one
accent used only on chrome, and one motion, the 5-second flip. It reads as a card maker with a
studio and a registry, not a template shop, because the page shows the artefacts of a process
(the proof in bracket corners, the rejected take, the edition panel) with the same graphic
authority a broadcast gives a stat.

**What makes it NOT generic (per the frontend-design skill):**
- No hero-with-gradient-blob, no floating glassmorphism, no purple. The atmosphere is one
  floodlight (a single radial highlight at the top edge of each arena band) plus a 4 % SVG grain,
  used on exactly three bands and `/c` — never on stock.
- The signature device is the **broadcast slate**: every section opens with a Barlow index
  (`04 / 13`), a Space Grotesk eyebrow, an Anton headline that ends with a full stop, and a bold
  subhead at ~2:1 to the headline. The same slate appears on every page, so the site feels like
  one graphics package rather than a stack of templates. It is also literally the listing
  slides' `02 / 20` corner index moved on-site — the Etsy buyer arrives and recognises the system.
- **Overhangs**: three times on the home page a product image is laid across a band boundary
  (composite → §2, proof → §4's top edge, occasion cards → the footer). Every card that crosses a
  seam is square-cut and casts a real shadow — the page behaves like a table with cards on it.
- **Bracket corners** (orange, the one accent) mark artefacts of the audit — proof, plate, verdict
  — and nothing else. They are the "you are looking at evidence" mark, borrowed from the listing
  videos.
- Typography does the talking: Anton at 4.5 rem uppercase with a full stop is a claim, not a
  slogan. No italics except the founder's note. No gradient text, ever.

---

## 2. LAYOUT SYSTEM

### 2.1 Containers
| Name | Class | Width | Use |
|---|---|---|---|
| `wrap` | `mx-auto w-full max-w-[75rem] px-5 sm:px-6 lg:px-8` | 1200 + gutters | all text sections |
| `wrap-wide` | `mx-auto w-full max-w-[85rem] px-5 sm:px-6 lg:px-8` | 1360 | image stages, 17-sport grid, finish strip, footer |
| `wrap-prose` | `mx-auto w-full max-w-[42rem] px-5 sm:px-6` | 672 | legal, FAQ answers, photo-guide checklist, `/contact` |
| `wrap-card` | `mx-auto w-full max-w-[30rem] px-4 lg:max-w-[64rem] lg:px-8` | 480 → 1024 | `/c` (mobile-first single column, 2-col at lg) |
| bleed | `w-screen relative left-1/2 -translate-x-1/2` | 100vw | arena/navy bands only (the band bleeds, its content stays in `wrap`) |

Full-bleed images never exceed `wrap-wide`; a band bleeds, an image does not (except the hero
stage's right edge on ≥ lg, §5.1).

### 2.2 Grid
- Base 4 columns, `md` 6, `lg` 12: `grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-x-4 md:gap-x-6 lg:gap-x-8`.
- Standard splits: text/media `lg:col-span-5` / `lg:col-span-7` (media always the 7), three-up
  `lg:col-span-4` ×3, four-up `md:col-span-3 lg:col-span-3`, edition demo `lg:col-span-6`/`6`.
- Nothing is centred except the closing CTA (§5.1-12), 404/410 pages and the SR gift note.
  Left-aligned slates are the broadcast look; centring is the template-shop look.

### 2.3 Spacing scale (Tailwind steps only)
`1 2 3 4 6 8 12 16 20 24 32` (4 … 128 px). Rules:
- Section padding: `py-16 md:py-24 lg:py-32` (64/96/128). Tight sections (TrustLine-only closers,
  the sports-without-numbers note): `py-12 md:py-16`.
- Slate → content gap: `mt-10 md:mt-12`. Inside a component: `gap-3` (labels), `gap-4` (rows),
  `gap-6` (cards), `gap-8` (columns).
- Overhang: `-mt-12 md:-mt-20 relative z-10` on the overhanging element; the band it lands on
  adds the same amount to its top padding (`pt-28 md:pt-40`).
- Never an arbitrary pixel value outside the type scale and the two shadows.

### 2.4 Bands and rhythm
Three surfaces, fixed classes:

```
.band-stock { background: var(--color-stock); color: var(--color-ink); }
.band-arena { background: var(--color-arena); color: #fff; }        /* + .floodlight + .grain */
.band-navy  { background: var(--color-navy);  color: #fff; }
```

- `.floodlight` (arena only): `background-image: radial-gradient(60% 45% at 50% 0%, rgba(255,255,255,.10), transparent 70%)` layered over the arena colour. One per band, top edge, never animated.
- `.grain` (arena and navy only): a 4 % opacity `feTurbulence` SVG data-URI, `background-size: 240px`, `mix-blend-mode: soft-light`. Stock never gets grain — the stock is the paper.
- Home rhythm (13 sections → surfaces): **S S S A S A S S N S S A N**. Product template
  (§5.2): **S S S A S S S** then navy footer. Trust pages: stock throughout with one arena band
  where the spec names dark media (`/how-it-works` §3 rejected pair; `/guarantee` none;
  `/about` §2 essays on navy). `/c` is arena end to end.
- Adjacent stock sections are separated by `border-t border-hairline` on the second one; band
  changes need no line. Never two arena bands in a row.

### 2.5 How a section opens — the slate
```html
<header class="slate grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
  <div class="max-w-[46rem]">
    <p class="eyebrow">Registered, not printed</p>          <!-- Space Grotesk 500 · 12/1 · uppercase · tracking .14em · navy (white/80 on dark) -->
    <h2 class="h2">REGISTERED, NOT JUST PRINTED.</h2>         <!-- Anton, uppercase, full stop -->
    <p class="sub">Every card carries its registered card ID on the back…</p>   <!-- Space Grotesk 700 1.375rem -->
  </div>
  <span class="slate-index" aria-hidden="true">05 / 13</span>   <!-- Barlow 600 · 13px · tracking .12em · muted -->
</header>
```
- Eyebrow: never a claim, never a number, never Barlow. It names the section in ≤ 4 words (list in
  §5). Before it, a `w-5 h-0.5 bg-ink` bar (`before:` pseudo) — ink, not orange.
- The index is decorative (`aria-hidden`), only on `/` (of 13) and the product template (of 7).
- H1 pages (hero) use the same slate with `h1.display`; pills sit between eyebrow and H1
  (`flex flex-wrap gap-2 mb-4`).
- Mobile: single column; the index moves under the subhead as a right-aligned 11 px line.

### 2.6 Mobile-first behaviour of every pattern
| Pattern | ≤ 639 px | md 768 | lg 1024+ |
|---|---|---|---|
| Slate | stacked, index under subhead | same | index right, baseline-aligned |
| Text + media | text first, media below, media full width | same | 5 / 7 columns, media right (left for §4, §5 — alternate) |
| Card row (finishes) | horizontal snap strip, tiles 64vw | tiles 240 px | strip until xl; `xl:grid-cols-7` |
| 17-sport grid | 3 cols | 6 cols | 9 cols (2 rows: 9 + 8) |
| TierCard row | stacked | 2 cols | 4 cols (3 when a tier is hidden: `lg:grid-cols-3`) |
| FourFears | stacked | 2 × 2 | 4 across |
| Tables (spec sheet, shipping) | `overflow-x-auto` wrapper, first column sticky | full | full |
| EditionPanel demo | full width below the card back | same | right column |
| Header | 56 px, burger → navy sheet | same | 64 px, full nav |
| Footer | 1 col, columns as accordions closed? **No** — 1 col, all open, true-numbers strip becomes a 2-col grid | 3 cols | 4 cols + strip row |
| Overhang | `-mt-8` | `-mt-12` | `-mt-20` |
| Flip | 5:7 at `min(78vw, 360px)` | 400 px | 440 px |

---

## 3. TYPE IN USE

Fonts via `next/font/google` in `app/fonts.ts`:
```ts
import { Anton, Space_Grotesk, Barlow } from "next/font/google";
export const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-anton" });
export const grotesk = Space_Grotesk({ weight: ["400","500","700"], subsets: ["latin"], display: "swap", variable: "--font-grotesk" });
export const barlow = Barlow({ weight: "600", subsets: ["latin"], display: "swap", preload: false, variable: "--font-barlow" });
```
Per-finish pairs live in `app/c/[cardId]/fonts.ts` only, every one `preload: false` (a declared
`@font-face` costs nothing until a glyph uses it, so only the rendered card's pair downloads).

Tailwind 4 `@theme` type tokens (`app/globals.css`):
```css
@theme {
  --font-display: var(--font-anton), Impact, "Arial Narrow Bold", sans-serif;
  --font-sans: var(--font-grotesk), ui-sans-serif, system-ui, sans-serif;
  --font-label: var(--font-barlow), var(--font-sans);

  --text-display-3: 4.5rem;   --text-display-3--line-height: .94; --text-display-3--letter-spacing: .005em;
  --text-display-2: 3.5rem;   --text-display-2--line-height: .96; --text-display-2--letter-spacing: .005em;
  --text-display-1: 2.75rem;  --text-display-1--line-height: 1;   --text-display-1--letter-spacing: .01em;
  --text-h2-3: 2.75rem;       --text-h2-3--line-height: 1;
  --text-h2-2: 2.25rem;       --text-h2-2--line-height: 1.02;
  --text-h2-1: 2rem;          --text-h2-1--line-height: 1.05;
  --text-h3: 1.5rem;          --text-h3--line-height: 1.1;
  --text-sub: 1.375rem;       --text-sub--line-height: 1.3;
  --text-body: 1.0625rem;     --text-body--line-height: 1.55;
  --text-small: .875rem;      --text-small--line-height: 1.5;
  --text-label: .75rem;       --text-label--line-height: 1;
}
```

Recipes (copy these class strings; the `@utility` names are defined once in globals):

| Role | Classes | Notes |
|---|---|---|
| `display` (H1) | `font-display uppercase text-display-1 md:text-display-2 lg:text-display-3 text-balance max-w-[16ch]` | ≤ 2 lines at lg, ≤ 4 at 390 px. Ends with a full stop (copy). Colour inherits (ink / white). |
| `h2` | `font-display uppercase text-h2-1 md:text-h2-2 lg:text-h2-3 text-balance max-w-[22ch]` | full stop; never letter-spaced beyond the token |
| `h3` | `font-display uppercase text-h3 max-w-[28ch]` | TierCard names, FourFears questions (keep the `?`), essay heads. **Not** for form labels. |
| `sub` | `font-sans font-bold text-sub max-w-[36ch] text-balance mt-3` | ~2:1 under the H1/H2; on arena `text-white/90` |
| `body` | `font-sans text-body max-w-[62ch]` | 17 px / 1.55; `font-medium` only for the one-sentence process line and TierCard "what's in the box" heads |
| `small` | `font-sans text-small text-muted-text` | captions, TrustLine, help text; on arena `text-arena-muted` |
| `eyebrow` | `font-sans font-medium text-label uppercase tracking-[.14em] text-navy flex items-center gap-2 before:block before:h-0.5 before:w-5 before:bg-current` | on dark: `text-white/80` |
| `label` (form labels, table heads, ID/time lines) | `font-label font-semibold text-label uppercase tracking-[.12em]` | Barlow only here, in chips, in the slate index and in EditionPanel row labels |
| `id` (card IDs, dates) | `font-label font-semibold text-[15px] tracking-[.04em] tabular-nums` | `GDE-SN-BKB-2026-12`, `Aug 27, 2026` |
| `founder` | `font-sans italic text-[1.125rem] leading-[1.6] max-w-[52ch]` | the only italic on the site |
| `quote-sr` | supporting font of SR (Oswald) italic — `/c` SR pages only | |

Letter-spacing: Anton is never tracked wider than `.01em` (it falls apart); Space Grotesk labels
`.12–.14em`; Barlow labels `.12em`; body `0`. Line length: body ≤ 62ch, subhead ≤ 36ch, H2 ≤ 22ch,
H1 ≤ 16ch. Numbers in prices, stats and IDs: `tabular-nums`.

---

## 4. COMPONENT RECIPES

All components live in `components/ui/`. Corner rule: **12 px for UI panels; 0 px for anything
that holds or depicts a card, poster, proof, plate or pack** (image stages, BracketFrame, flip,
FictionalLabel-on-art, the sport and finish tiles). Hover/focus transitions: `transition-[background-color,border-color,color,box-shadow,transform] duration-[180ms] ease-out`.

Colour tokens (`@theme`, exact §2.1 values, plus the two a11y derivatives from P8):
```css
@theme {
  --color-stock: #F4F3EF; --color-hairline: #E8E7E2; --color-ink: #14191F; --color-muted: #6E7278;
  --color-muted-text: #565B61;                     /* derived: small text on stock */
  --color-accent: #FF6B2B; --color-navy: #172C50;
  --color-arena: #080C12; --color-arena-surface: #14191F; --color-arena-hairline: rgb(255 255 255 / .08);
  --color-arena-muted: #9AA4B2;                    /* derived: small text on arena */
  --color-pass: #4EAF90; --color-fail: #D8554B; --color-gold: #C9A227;
  --color-surface: #FFFFFF;                        /* cards on stock */
  --shadow-card-stock: 0 12px 28px -8px rgb(20 25 31 / .35);
  --shadow-card-arena: 0 24px 48px -12px rgb(0 0 0 / .7);
  --radius-ui: 12px;
}
:root { --silver: linear-gradient(20deg, #FFFFFF 0%, #C7D0DC 50%, #FFFFFF 100%); }
```

### 4.1 Buttons
| Variant | Classes | Where |
|---|---|---|
| `btn-primary` | `inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-accent px-6 font-sans text-[15px] font-bold text-ink hover:bg-[#F0602A] active:translate-y-px` | one per CTA group. Label ends with ` →` only for Etsy links (`Order on Etsy →`). |
| `btn-secondary` | `inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-ink bg-transparent px-6 font-sans text-[15px] font-bold text-ink hover:bg-ink/[.06]` | `Look up a card`, `See how it's made` |
| `btn-secondary` on dark | `… border-white/55 text-white hover:bg-white/[.08]` | arena/navy bands |
| `btn-etsy` | `btn-secondary` + a 16 px Etsy "E" glyph? **No** — no third-party marks in chrome. Plain `btn-secondary` with the fixed label `Also on Etsy →`. Never orange, never with a price. | product tiers, `/c` |
| `btn-text` | `inline-flex items-center gap-1.5 font-sans font-bold text-[15px] text-ink underline-offset-4 hover:underline` + 16 px arrow icon | in-section links ("Read the full promise") |
| Sizes | `h-12` default; `h-11 px-5 text-[14px]` in TierCard; full width on mobile: `w-full sm:w-auto` | |
| Icon | 1.5 px stroke SVG, 18 px, `currentColor`; the arrow is `→` typed, not an icon, except the hero's before→after arrow (§6.4) | |

### 4.2 Focus ring (global)
```css
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; box-shadow: 0 0 0 1px var(--color-ink); border-radius: 4px; }
.band-arena :focus-visible, .band-navy :focus-visible { box-shadow: 0 0 0 1px #fff; }
```
The 1 px ink/white ring gives ≥ 3:1 against the surface (orange alone is 2.6:1 on stock); the
orange ring outside is the brand.

### 4.3 Pill
`inline-flex h-7 items-center rounded-full px-3 font-display uppercase text-[13px] tracking-[.06em] leading-none`
- filled: `bg-accent text-ink` — the primary claim on a page (`FROM YOUR PHOTOS`, `YOU SEE IT FIRST`, `FEATURED`).
- outline: `border border-ink text-ink` on stock; `border-white/55 text-white` on arena/navy (the spec's "outline silver").
- The SR pill `SENIOR EDITION · 1 OF 1` is **outline** on page chrome; gold exists only inside media.
- Never two filled pills in one group.

### 4.4 DeliveryChips
Input is the verbatim `CHIPS.*` string; split on ` · ` for layout only, never re-typed.
`ul.flex.flex-wrap.gap-2` → `li`: `inline-flex h-7 items-center rounded-md border border-hairline bg-surface/70 px-2.5 font-label font-semibold text-[12px] uppercase tracking-[.06em] text-ink` (on dark: `border-white/15 bg-white/[.06] text-white`). A 1.5 px clock icon before the first chip only. One `DeliveryChips` per page (§5 marks where).

### 4.5 TrustLine
`p.font-sans.text-small.text-muted-text.max-w-[62ch]` with segments joined by `<span aria-hidden> · </span>`; a 14 px 1.5 px-stroke tick before each segment (`inline-flex items-center gap-1.5`). On dark: `text-white/70`, ticks `text-white/50`. Fourth segment only via `trust.ts` flag. Always the last element in a CTA group, `mt-4`.

### 4.6 TierCard
```
article.flex.flex-col.rounded-[12px].border.border-hairline.bg-surface.overflow-hidden
 ├ figure.aspect-square.bg-arena (0 radius, overflow-hidden) — the tier image; `FEATURED` pill absolute top-3 left-3
 ├ div.p-6.flex.flex-col.gap-4
 │  ├ h3.h3  (tier name, ≤ 20 chars)
 │  ├ Price: div.flex.items-baseline.gap-2
 │  │    span.font-display.text-[2rem].leading-none.tabular-nums  {price}
 │  │    s.font-sans.text-small.text-muted-text.tabular-nums      {compareAt}   ← only while isSaleActive()
 │  │  + p.text-[12px].text-muted-text "Sale price until {saleEnds}"            ← same condition
 │  ├ ul "What's in the box": text-small, 1.5 px check icon per line, `space-y-1.5`
 │  ├ dl: dt.label "Ships from" / dd.text-small
 │  ├ DeliveryChips (this tier's single chip)
 │  └ div.mt-auto.grid.gap-2: btn-primary (full width) + btn-secondary "Also on Etsy →" (F2) / F1: btn-primary only
```
Hover: `hover:border-ink/30 hover:shadow-[var(--shadow-card-stock)]`. The whole card is not a link (two CTAs inside). Price is never in JSX literal form — tokens from `prices.ts`.

### 4.7 EditionPanel (dark)
```
section.rounded-[12px].bg-arena-surface.border.border-arena-hairline.p-5.md:p-6.text-white
 ├ div.h-0.5.w-full.-mt-5.mb-5.rounded-t-[12px] style="background: var(--silver)"   ← the silver rule
 ├ header.flex.items-center.justify-between: Pill outline (REGISTERED EDITION | SENIOR EDITION · 1 OF 1) · Shield silver 20 px
 ├ dl.grid.grid-cols-[auto_1fr].gap-x-6.gap-y-3
 │    dt.label.text-arena-muted  EDITION ID / FINISH / SPORT / SEASON / REGISTERED / CERTIFICATE (/ EDITION)
 │    dd.font-sans.font-medium.text-[15px]  — EDITION ID dd uses `.id` + a 32 px icon button "Copy ID" (toast "Copied")
 ├ p.text-small.text-arena-muted.mt-4  (the "One registered edition…" sentence)
 ├ p.text-[12px].text-arena-muted      (C15)
 └ footer.flex.justify-between.text-[12px].text-arena-muted: "Last updated {date}" · link "What is a registered edition?"
```
Demo instances add a top line `p.label.text-arena-muted "Example edition · Fictional athlete"`.
"Registered" state (checkout/order only): panel mounts with `translate-y-2 opacity-0` → `translate-y-0 opacity-100` over 240 ms ease-out; static everywhere else.

### 4.8 BracketFrame
```css
.bracket { position: relative; padding: 10px; }
.bracket::before, .bracket::after, .bracket > .b2::before, .bracket > .b2::after {
  content: ""; position: absolute; width: 18px; height: 18px; border: 2px solid var(--color-accent); }
.bracket::before      { top: 0; left: 0;  border-right: 0; border-bottom: 0; }
.bracket::after       { top: 0; right: 0; border-left: 0;  border-bottom: 0; }
.bracket > .b2::before{ bottom: 0; left: 0;  border-right: 0; border-top: 0; }
.bracket > .b2::after { bottom: 0; right: 0; border-left: 0;  border-top: 0; }
```
Markup: `<div class="bracket"><span class="b2 contents"></span><img …/></div>`. Contents 0 radius. Used only around audit artefacts: proof, plate, verdict, verification sheet, the promise paragraph on `/guarantee`. Never around a CTA, a TierCard or a photo of a person.

### 4.9 FictionalLabel (not disableable)
- On art (default): `absolute bottom-2 left-2 z-10 max-w-[calc(100%-1rem)] bg-ink/85 px-2 py-1 font-sans text-[11px] leading-[1.3] text-white/90` — square, no radius (it sits on a card frame).
- Under art (`placement="below"`): `mt-2 block font-sans text-[12px] text-muted-text`.
- One label per frame; on a row of tiles of the same athlete, once at row end (`placement="row"` = the "below" style, right-aligned).
- The component throws in dev if rendered with an empty string; there is no prop to hide it.

### 4.10 FourFears
- Long: `ul.grid.gap-4.md:grid-cols-2.lg:grid-cols-4` → `li > a.group.flex.h-full.flex-col.gap-4.rounded-[12px].border.border-hairline.bg-surface.p-6.hover:border-ink/30.hover:shadow-[var(--shadow-card-stock)]`; icon 28 px 1.5 px stroke navy (likeness = face-in-frame, photos = shield, wrong = rotate-ccw, real card = card outline); `h3.h3` question; `p.text-small`; footer `span.btn-text` with the arrow that moves 2 px on `group-hover`.
- Short strip: `div.flex.flex-wrap.items-center.gap-x-4.gap-y-1.text-small` with `strong "Still deciding?"` then four `a.underline-offset-4.hover:underline` fragments separated by ` · `. Sits directly above every product CTA pair (`mb-6`).

### 4.11 GateRow (`/how-it-works` only)
`ol.grid.grid-cols-2.sm:grid-cols-3.lg:grid-cols-6.gap-px.bg-hairline.rounded-[12px].overflow-hidden.border.border-hairline` → `li.bg-surface.p-4.flex.flex-col.gap-2`: `span.label` (PHOTO CHECK · KIT · PLATE · SHOTS · VERIFICATION · FINISH), a `StatusChip` (§4.14), and a 1.5 px stroke icon. Each `li` is an anchor to the accordion item below (`href="#gate-N"`). Sticky at `lg` under the header (`lg:sticky lg:top-16 z-20`) while the accordion is in view.

### 4.12 FounderNote
`aside.grid.gap-6.md:grid-cols-[auto_1fr].border-l-2.border-navy.pl-6` → optional `img.aspect-[4/5].w-24.rounded-[12px].object-cover` (real photo only; absent → no element) · `blockquote.founder` · `footer.font-sans.font-bold` "John Birch" + `span.text-small.text-muted-text` "Game Day Edition{ · city}". Never a stock avatar, never initials in a circle.

### 4.13 Plate
`div.bg-stock.text-ink.p-5.md:p-6` (or `.bg-arena.text-white`) — square, used when text must sit on imagery (hero composite caption, room-shot caption). Max width 32 rem.

### 4.14 StatChip and StatusChip
- StatChip (`/c`, edition demos): `div.rounded-[12px].border.border-arena-hairline.bg-arena-surface.px-4.py-3.text-center.min-w-[5.5rem]` → `span.block.font-[var(--finish-display)].text-[2rem].leading-none.text-white.tabular-nums` + `span.label.text-arena-muted.mt-1`. On marketing pages the display font is Anton.
- StatusChip (PASS/FAIL): `span.inline-flex.h-6.items-center.gap-1.5.rounded-full.px-2.font-label.font-semibold.text-[11px].uppercase.tracking-[.12em]` + a 6 px solid dot. Pass: `bg-pass/15 text-[#1F6F58]`, dot `bg-pass`. Fail: `bg-fail/15 text-[#A83C34]`, dot `bg-fail`. On arena: `bg-pass/20 text-pass` / `bg-fail/20 text-[#E8756B]`.

### 4.15 CardFlip frame
```
div.flip-scene  { perspective: 1200px; aspect-ratio: 5 / 7; width: min(78vw, 360px) | md:400px | lg:440px }
button.flip-card { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; border-radius: 0;
                   filter: drop-shadow(var(--shadow-card-arena)) }  /* stock: --shadow-card-stock */
  img.face.front / img.face.back { position:absolute; inset:0; backface-visibility:hidden; border-radius:0; object-fit:cover }
  .back { transform: rotateY(180deg) }
.flip-card.play { animation: gde-flip 5s cubic-bezier(.4,0,.2,1) both }
@keyframes gde-flip {                                   /* ported 1:1 from card-flip/web/flip.html */
  0%,30% { transform: rotateY(0) scale(1) }  36% { transform: rotateY(38deg) scale(1.03) }
  44% { transform: rotateY(90deg) scale(1.04) } 52% { transform: rotateY(142deg) scale(1.03) }
  58%,100% { transform: rotateY(180deg) scale(1) } }
```
Caption under the frame: `span.label.text-arena-muted` "Tap to flip" / "Tap to flip back". Behaviour in §7.1.

### 4.16 SiteHeader
- `header.sticky.top-0.z-40.h-14.lg:h-16.bg-stock/90.backdrop-blur-md.border-b.border-hairline` (`border-b` only after 8 px scroll — set via a tiny scroll listener toggling `data-scrolled`; without JS the border is always on).
- Left: `Shield tone="navy"` 28 px + `Wordmark tone="navy"` 116 × 40 (hidden < 380 px width; shield alone).
- Centre (lg): nav `ul.flex.gap-6` → `a.font-sans.font-medium.text-[14px].text-ink/80.hover:text-ink` with `aria-current="page"` → `text-ink` + `border-b-2 border-ink pb-0.5`.
- Right: `btn-secondary h-10 px-4 text-[14px]` "Look up a card" (hidden < lg) + `btn-primary h-10 px-4 text-[14px]` "Order on Etsy →" (F1).
- Mobile: burger (`aria-expanded`, `aria-controls`) opens a `dialog` full-screen **navy sheet** (`.band-navy .grain`): links in `font-display uppercase text-[2rem] text-white leading-[1.1]` stacked with `gap-4`, the five extra links (Photo guide · Registry · FAQ · Contact · Etsy shop) in `text-small text-white/80` below a `border-t border-white/15`, then the CTA pair full width. Focus trapped, `Escape` closes, body scroll locked. This is the one place the "slate" goes big.
- On `/c` the header is arena: `bg-arena/85`, shield silver, wordmark white, and no CTA buttons (the channel CTA row on the page is the only CTA).
- Skip link: `sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 btn-primary h-10`.

### 4.17 SiteFooter (navy band, imprint)
```
footer.band-navy.grain.text-white
 ├ wrap-wide.py-16.lg:py-20.grid.gap-10.lg:grid-cols-12
 │   ├ brand col (lg:col-span-4): Shield silver 40 px + Wordmark white 140 px; C4 in text-small text-white/80 max-w-[40ch]
 │   ├ Shop / Trust / Legal (lg:col-span-2 each): h4.label.text-white/70 + ul.space-y-2 a.text-small.text-white.hover:underline
 │   └ (lg:col-span-2) Social row: 6 icon links 24 px 1.5 px stroke, `aria-label`, only handles in SOCIAL_URLS
 ├ True-numbers strip: div.border-y.border-white/15 → ul.grid.grid-cols-2.md:grid-cols-3.lg:grid-cols-5.divide-x.divide-white/15
 │     li > a.block.px-4.py-5: span.font-display.text-[1.75rem].leading-none  ("17" / "7" / "2.5 × 3.5" / "COA" / "ID") + span.block.text-[12px].text-white/75.mt-1 (the linked label)
 │     ← this is the score bug: numbers in Anton, labels small; each links to its proof page (COPY §1.2)
 ├ Imprint: p.text-small.text-white/80.max-w-[70ch] ({imprint} or the fallback line) — legal IDs (company code, VAT) in `.id`
 └ bottom line: text-[12px] text-white/60 "© 2026 Game Day Edition · Designed in Lithuania · Printed by professional labs in the US"
```

### 4.18 Section dividers
None as rules; band changes divide. Between adjacent stock sections: `border-t border-hairline`. Inside the footer: `border-white/15`. The only decorative line on the site is the 2 px silver rule on EditionPanel and the 2 px navy left rule on FounderNote.

### 4.19 Hover (180 ms)
Links: underline appears. Cards (Tier, FourFears, sport/finish tiles): border darkens + card shadow; **no lift/translate** except the primary button's 1 px press. Images: none (no zoom on hover — a card does not zoom, it flips). Arrow icons: `translate-x-0.5`.

---

## 5. SECTION-BY-SECTION

Conventions: "asset →" gives the source file and the derived file `scripts/site-assets.ts`
writes to `public/images/site/…` (see §8.4); sizes are the derived file's longest edge; every
`next/image` gets explicit `width/height` or `fill` + `sizes`. Eyebrows are proposed here and
are not claims. Alt text per COPY §0.5.

### 5.1 `/` — brand home (13 sections; S S S A S A S S N S S A N)

**1 · Hero — stock.** Eyebrow "Custom cards and posters". Index `01 / 13`.
- Desktop (lg) layout: `grid lg:grid-cols-12 gap-8 items-center`, text `lg:col-span-5`, stage `lg:col-span-7`. Order in the text column: pills (`FROM YOUR PHOTOS` filled · `REGISTERED EDITION` outline) → H1 `display` → `sub` → price line (`font-sans font-bold text-body` "from {from:digital} digital · {price:GDE-ANY-SET-PRINT} printed set") → DeliveryChips `{chips:standard}` → CTA pair (`btn-primary` "Order on Etsy →", `btn-secondary` "Look up a card") → TrustLine.
- Stage (`ProductComposite variant="hero"`, §6.1): a **before → after** device on an arena plate that extends to the right viewport edge at lg (`lg:mr-[calc(50%-50vw)]`, `bg-arena floodlight grain`, 0 radius, `py-10 lg:py-14 pl-8 lg:pl-12`). Inside, `grid grid-cols-[minmax(0,.9fr)_auto_minmax(0,1.6fr)] items-center gap-4 lg:gap-6`:
  - before: `01-football-card/src/s02-before-b.png` (970×1224 — verify it is the sideline shot the alt describes; else `s02-before-a.png` 970×1282 and change the alt to "at the kitchen table") → `hero-before.webp` 640 w, in a `aspect-[4/5] rounded-[12px] overflow-hidden` box (a photo, not a card), FictionalLabel on art.
  - arrow: the orange broadcast arrow (§6.4), 64 px wide at lg, rotated 90° on mobile.
  - after: layered `relative aspect-[4/3]`: poster `FB-FS-poster.png` (1944×2592 → 640 w) at `left-0 top-0 w-[58%] aspect-[3/4]` behind; card front `FB-FS-card-FRONT.png` (750×1050 → 480 w) at `right-[22%] bottom-0 w-[38%] aspect-[5/7] rotate-[-4deg]`; card back `FB-FS-card-BACK.png` at `right-0 bottom-[8%] w-[34%] rotate-[3deg] z-[-1]`; the badge `football-badge.png` (from `04-complete-set/src`, verify count-neutral) at `left-[52%] top-[6%] w-[16%]`. Shadows `--shadow-card-arena`. Caption Plate (bottom-left, stock plate): `label` "Fire & Smoke · football" + FictionalLabel below-style. No certificate (P3).
- **Overhang #1:** the stage's bottom edge extends `pb-20 lg:pb-28` and §2's grid starts at `-mt-12 lg:-mt-20` so the four cards sit over the arena plate's foot — the composite "bleeds" into the fears row.
- **390 px fold** (Safari, ~ 750 px visible): header 56 → pills 28 → H1 at 2.75 rem, 4 lines (~ 176 px) → sub 2 lines → stage (`aspect-[13/8]`, ≈ 240 px: before 38 % · arrow down 24 px · after with poster + front card only; the back card and badge are `hidden sm:block`) → price line → primary CTA full width. Chips, secondary CTA and TrustLine fall just under the fold; that is accepted — the transformation, the price and the primary CTA are in view.
- **LCP** = the poster image (largest painted element at every breakpoint): `priority`, `fetchPriority="high"`, `sizes="(min-width:1024px) 380px, 55vw"`, AVIF ≤ 90 KB at 640 w. The card front also `priority` (≤ 40 KB). Nothing else above the fold is preloaded. No video, no sport tabs.

**2 · Four fears — stock (no border; it overhangs).** Eyebrow "Four questions". `02 / 13`. Slate then FourFears long. The four cards are white on stock; the top row lands on the arena foot from §1, so give them `shadow-[var(--shadow-card-stock)]` by default here only.

**3 · Three product families — stock, `border-t`.** Eyebrow "Three editions". `03 / 13`. `grid gap-6 md:grid-cols-3`, TierCards with these images (1:1 stages, arena bg):
- Trading Cards → `ProductComposite variant="pair"` of `01-basketball-card/src/BK-SN-card-FRONT.png` + `BK-SN-card-BACK.png` (front at left 8 %, back offset right 30 %, each `w-[46%]` at 5:7, back behind); FictionalLabel on art.
- Posters → `02-basketball-poster/room-SN.png` (2048² → `room-sn.webp` 1000 w, `object-cover object-[50%_40%]`).
- Complete Set → `04-complete-set/v3/tile-printed.jpg` (1400² → 1000 w). Contains a card fan and a tube — verify no count text in the tile (it shows none in the contact sheet).
- Under the row, once: `p.text-small.font-medium` "Free printed Certificate of Authenticity in every shipped package." with a 1.5 px certificate icon.

**4 · Proof before print — ARENA (floodlight + grain).** Eyebrow "You see it first". `04 / 13`. Pill `YOU SEE IT FIRST` filled. `grid lg:grid-cols-12`: media `lg:col-span-7` LEFT, text `lg:col-span-5` right.
- Media: `03-senior-night/src/bsb-sr-proof.png` (1400×1092 → `proof-bsb-sr.webp` 1200 w) inside `BracketFrame`, 0 radius, `--shadow-card-arena`. **Overhang #2:** the frame starts at `-mt-28 lg:-mt-40` so its top third sits on the stock of §3 (the band adds `pt-8` only; the overhang does the rest). Caption under: `text-small text-arena-muted` "A watermarked proof, exactly as you receive it — Senior Night edition, baseball." + FictionalLabel below.
- Text: `h4.label.text-white/70` "Our promise" → C1 in `text-body text-white/90 max-w-[48ch]` → links row: `btn-secondary` (dark) "Read the full promise", `btn-text` (white) "See how it's made".
- Background: the arena colour plus, at 18 % opacity and `blur-[28px] saturate-[.8]`, `art-pipeline/out/etsy-shots/hero-bg-gym-night.png` (1024² → 1200 w, positioned `object-[50%_30%]`) — the one sport-surface photo on the home page. Decorative, `aria-hidden`, `loading="lazy"`.

**5 · Registered, not just printed — stock.** Eyebrow "The registry". `05 / 13`. `grid lg:grid-cols-12 items-center`: card back `lg:col-span-5` with the CSS QR ring (§6.3), arrow (§6.4, 40 px) `lg:col-span-1`, EditionPanel demo (`GDE-SN-BKB-2026-12`, label "Example edition · Fictional athlete") `lg:col-span-6`. Under the panel: inline lookup form — `label.label` "Card ID", `input.h-12.rounded-[12px].border.border-hairline.bg-surface.px-4.font-label.font-semibold.tracking-[.06em].uppercase.placeholder:normal-case.placeholder:font-sans` placeholder `GDE-SN-BKB-2026-12`, help `text-[12px] text-muted-text`, `btn-primary` "Find this edition"; miss string renders inline `role="alert"` in `text-small text-[#A83C34]`. Link `btn-text` "What is a registered edition?". Body paragraph (C8 sentence set) sits in the slate's `sub` position — this section's subhead IS the body copy, in `font-bold`.

**6 · Six finishes — ARENA.** Eyebrow "Material, not layout". `06 / 13`. Slate (white). Strip: `ul.flex.gap-4.overflow-x-auto.snap-x.snap-mandatory.scroll-px-5.pb-4.-mx-5.px-5.xl:grid.xl:grid-cols-7.xl:overflow-visible.xl:mx-0.xl:px-0` → 7 `li.snap-start.w-[64vw].sm:w-[240px].xl:w-auto.shrink-0`: `a.block.group` → `figure.aspect-[5/7].bg-arena-surface` with the card face (0 radius, `--shadow-card-arena`, `group-hover:ring-1 ring-white/25`) → finish label SVG (P5; `h-4 text-white mt-3`) → `p.text-[13px].text-arena-muted` material line from `styles.ts`. Sources: `01-basketball-card/src/BK-{SN,CA,FS,HE,SS,PR}-front.png` → `finish-<code>.webp` 480 w. 7th tile: P6 asset, label SVG `SR`, material line from `styles.ts` SR, the tile's border `ring-1 ring-gold/60` (gold inside the media rule: the ring is the media frame, not chrome — keep it 1 px). FictionalLabel once, row-end. Tile link F1 `/trading-cards#finishes`.

**7 · Seventeen sports — stock.** Eyebrow "Every sport, their crest". `07 / 13`. Grid per §2.6 (`grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4 lg:grid-cols-9`). Tile: `a.group.block` → `figure.aspect-[5/7].bg-arena-surface.overflow-hidden` with the sport front (P2 sources; pickleball + skateboarding = text tiles: `bg-navy text-white flex items-end p-3 font-display uppercase text-[1.25rem]` with the sport name) → `p.font-sans.font-bold.text-[14px].mt-2` sport → `p.text-[12px].text-muted-text` "plain back" / "name + crest" per `sports.ts` (`numbered=false` → "name + crest"; `numbered && !hasBackNumber` → "plain back"; else nothing). Alt per §0.5, no number for the five. C9 is the subhead (long; allow `max-w-[60ch]`).

**8 · How it's made — stock, `border-t`.** Eyebrow "Made by a person". `08 / 13`. Slate H2 → the one-sentence process line in `text-body font-medium max-w-[62ch]` → C2 in `text-body` → three thumbnails `grid gap-4 sm:grid-cols-3` each `BracketFrame` around a `aspect-[4/5] bg-arena-surface` image + `p.text-small.font-medium` caption + FictionalLabel below:
  1. Photo check verdict — **render the verdict, not a photo**: a small `Plate` (arena) typeset from `art-pipeline/out/athletes/ice-hockey/before/_intake.json` in `.label` rows ("PHOTO CHECK · OK · 4 usable · 0 rejected") — the artefact "as the parent reads it". No scores (`similarityToOthers` must not appear).
  2. Reference plate — `art-pipeline/out/athletes/football/_identity.png` (2400×1792 → 900 w, `object-contain` on arena-surface).
  3. Watermarked proof — reuse `proof-bsb-sr.webp` at 600 w.
  CTA `btn-secondary` "See the full process".

**9 · Your athlete's photos — NAVY (grain).** Eyebrow "Privacy". `09 / 13`. Single column `max-w-[46rem]`: slate (white) → C3 in `text-sub font-bold` (this section's subhead is the canon block) → the "4–10 photos and nothing else" sentence in `text-body text-white/90` → TrustLine (dark) → links row (`btn-text` white ×2). Shield silver 40 px top-right of the slate at lg (decorative). No image. The navy is the shield's colour; the privacy section is the only place the page goes navy before the footer — that is the point.

**10 · Proof wall — stock.** Eyebrow "Day one". `10 / 13`. `grid gap-8 lg:grid-cols-12`:
- Left `lg:col-span-5` "Example editions": `h4.label` → `grid grid-cols-4 gap-2` of 8 sport fronts (P2 sources: basketball, football, baseball, softball, soccer, volleyball, cheerleading, wrestling; 5:7, 0 radius, `--shadow-card-stock`) → C18 in `text-small text-muted-text` → `btn-text` "All seventeen sports".
- Centre `lg:col-span-4` the rejected pair (P7): `grid grid-cols-2 gap-3`, each a `BracketFrame` around a 5:7 frame with a StatusChip top-left (`FAIL` / `PASS`) and the caption below (`p.font-sans.font-bold.text-small` "REJECTED — the kit changed between shots." / "APPROVED — same athlete, same kit in every shot." then the explanation `text-small`). FictionalLabel below the pair. Link "See all six gates".
- Right `lg:col-span-3` "We are new": `aside.border-l-2.border-navy.pl-5` → `h4.label` → C16 `text-body` → `btn-text` "Read the promise".
- Reviews: **not rendered** (no placeholder, no empty column: the grid is 5/4/3 and complete).

**11 · Founder note — stock, `border-t`.** Eyebrow "From the designer". `11 / 13`. FounderNote (§4.12) with the two paragraphs, signature, then the "Designed in Lithuania · …" line as `text-small text-muted-text`, `btn-text` "About the studio".

**12 · Occasions + closing CTA — ARENA (floodlight).** Eyebrow "Occasions". `12 / 13`. Slate centred (the one centred slate): H2 "ONE ATHLETE. ONE EDITION." → three cards `grid gap-4 md:grid-cols-3`: `article.rounded-[12px].bg-arena-surface.border.border-arena-hairline.p-6.flex.flex-col.gap-3` with `h3.h3` (the card head, e.g. "ONE LAST HOME GAME."), `p.text-small.text-white/85`, for Senior Night a `figure.aspect-[5/7].w-24` of `03-senior-night/src/ftb-sr-front.png` with a 1 px `ring-gold/60` (gold inside media), DeliveryChips `{chips:seniorNight}` (**this is the page's second chip** — the spec allows the SN chip on the SN card only because it is that product's promise; keep it inside the card and do not repeat `{chips:standard}` here), `btn-text` (white). Christmas card only Oct 20 → Jan 5 (server date); otherwise 2 cards `md:grid-cols-2`. Then the closing CTA pair centred (`btn-primary` + `btn-secondary` dark) → `{chips:standard}` → TrustLine (dark). **Overhang #3:** the three cards' row is `mb-[-3rem] lg:mb-[-5rem] relative z-10` and the footer adds `pt-24 lg:pt-32`, so the occasion cards sit across the arena→navy seam.

**13 · Footer — NAVY** per §4.17.

Home asset weight budget: first viewport ≤ 250 KB images; whole page ≤ 1.1 MB images at 1440 w, ≤ 600 KB at 390 w (all below-fold images `loading="lazy"`, `sizes` tight).

### 5.2 Product family template — `/trading-cards` · `/posters` · `/complete-set` (S S S A S S S + navy)

**1 · Hero + tiers — stock.** Eyebrow = family ("Trading cards" / "Posters" / "Complete set"). `01 / 07`. Same hero grid as home §1 (text 5 / media 7), pills per COPY.
- Media by family: cards → `ProductComposite variant="pair-large"` (`BK-SN-card-FRONT` + `BK-SN-card-BACK`, each `w-[46%]`, back offset `translate-y-6`) **plus the CardFlip below the pair at md+** (`lg:absolute lg:right-0 lg:bottom-[-4rem]`? — no: keep it simple, the flip is section 3's media; the hero shows the static pair, 0 radius, `--shadow-card-stock`). Posters → `room-sn.webp` in `aspect-[4/3] rounded-[12px]` (a room photo, 12 px allowed) with the to-scale sheet below on mobile. Set → `ProductComposite variant="hero"` with the basketball set layers (`04-complete-set/src/marcus-*`? — no, those are SR; use `BK-SN-poster.png` from `02-basketball-poster/src` + `BK-SN-card-FRONT/BACK` + `badge-correct.png`), count-neutral only.
- Sport picker (cards, set): `label.label` "Their sport" + `select.h-12.rounded-[12px].border.border-hairline.bg-surface.px-4.font-sans.text-body` (native select; 17 options; `?sport=` prefill); the numberless note appears under it in `text-small text-muted-text` with a 1.5 px info icon. Posters: only `hasPosterArt` sports.
- Anchor line (cards): `p.font-sans.font-bold.text-body` "Twelve printed cards for {price} — {perCard}." · chips · C11.
- Tiers: `grid gap-6 md:grid-cols-2 lg:grid-cols-4` (or `lg:grid-cols-3` when a tier is hidden) of TierCards; tier images: cards → `01-basketball-card/src/pkg-01-digital.png` / `pkg-02-12-cards.png` / `pkg-03-24-cards.png` / `pkg-04-foil-pack.png` (verify each is count-neutral: the 12/24 tiles show fanned cards — OK; the foil pack tile shows the pack face which reads "10 COLLECTIBLE CARDS" — **hidden with the tier**); posters → `art-pipeline/out/etsy-shots/packages/tile-digital.png` / `room-18x24.png` / `room-24x36.png` / `room-30x40.png`; set → `04-complete-set/v3/tile-{printed,deluxe,ultimate}.jpg` + `tile-digital.png`. All 1:1, 1000 w.
- Line under the row per COPY (certificate line; posters: the "No certificate ships with a poster alone" line instead).
- LCP: the hero's front card (cards/set) or the room shot (posters), `priority`.
- 390 px fold: pills → H1 (3–4 lines) → sub → media (pair at `aspect-[4/3]`) → picker → primary CTA of the FEATURED tier repeated as a sticky bottom bar? **No sticky bars** (they hide content, 2.4.11). The tiers start under the fold; that is fine on a product page.

**2 · Spec sheet — stock, `border-t`.** `02 / 07`, `id="spec"`. `table.w-full.text-small` in an `overflow-x-auto` wrapper: `th.label.text-left.py-3.pr-6.text-muted-text.align-top.w-[10rem]` / `td.py-3.border-t.border-hairline`. No zebra; hairlines only. Rows from `tiers.ts`. A 2 px navy rule above the table head. Right column at lg: a `BracketFrame` around a 5:7 front at true scale note "2.5 × 3.5 in" (Barlow dimension callouts on two sides, 1 px ink lines) — a small "technical drawing" of the card; posters: the same for 18 × 24.

**3 · Front + back, registered / To scale / Everything counted — ARENA.** `03 / 07`.
- Cards: media `04-complete-set/07-four-shots.png` (2000² → 1400 w; check it carries no banned word — its headline reads "4 UNIQUE SHOTS" on the 01-basketball slide 06; use whichever slide has the four-shot callouts and a clean headline) LEFT, `CardFlip` (§4.15, `BK-SN-card-FRONT`/`BACK`, MP4 fallback `card-flip/out/GDE_SN_CardFlip_1080x1350.mp4`) CENTRE, EditionPanel demo + QR ring RIGHT at lg (`lg:grid-cols-[1.2fr_auto_1fr]`); stacked on mobile in the order flip → panel → four-shots. Body copy (C8 set) as the slate subhead.
- Posters: media `02-basketball-poster/02-two-sizes-to-scale.png` (2000² → 1400 w) in a stock Plate-bordered frame on the arena band, plus the body line.
- Set: `04-complete-set/19-everything-counted.png` (1400 w) LEFT; a vertical timeline RIGHT (`ol.relative.border-l.border-white/20.pl-6.space-y-6`, markers 10 px `bg-accent`? **No** — markers are white; accent is chrome only for the listed uses. Markers `bg-white`, labels `.label.text-white/70`, values `text-body`) then C10 and the "three tracked packages" line; EditionPanel demo under.

**4 · One athlete, six finishes — stock, `id="finishes"`.** `04 / 07`. `04-complete-set/08-six-finishes.png` (headline "ONE ATHLETE. SIX FINISHES." — allowed) at 1400 w on the left, or (preferred, crisper) the same 6-tile grid as home §6 in a `grid grid-cols-3 lg:grid-cols-6` on stock (cards cast `--shadow-card-stock`). Posters page: `10-pair-*.png` row (3 pairs, `grid md:grid-cols-3`). FictionalLabel once. SR line with `btn-text`.

**5 · Sports without numbers — stock, `border-t`, `id="sports"`.** `05 / 07`. Slate (H2 "NO NUMBER? NO PROBLEM." / posters "THEIR NAME ON THE WALL."), C9 body, media: cheerleading front + back pair (`01-cheerleading-card/src/CH-SN-card-FRONT.png` + `CH-SN-card-BACK.png`, square sources — not `marketing/cards/cheerleading-*`), the checkout note in `text-small`, then the 17-sport grid from home §7 (same component).

**6 · Still deciding? — stock, `py-12`.** `06 / 07`. FourFears short strip in a `rounded-[12px] border border-hairline bg-surface px-6 py-5`.

**7 · Blocks + FAQ + CTA — stock, `border-t`.** `07 / 07`. Four canon blocks as `grid gap-8 md:grid-cols-2`: each `h4.label` + `p.text-body`. FAQ: `details.group.border-t.border-hairline` → `summary.flex.justify-between.py-5.font-sans.font-bold.text-body.cursor-pointer` with a 1.5 px chevron rotating 180° → `div.pb-5.text-body.text-ink/85`. All `details` are closed by default but the content is in the DOM (no JS needed). Closing CTA pair + `{chips:standard}` + TrustLine.

### 5.3 `/senior-night` (stock; gold only inside media)
1. **Hero** — as the product hero; pill `SENIOR EDITION · 1 OF 1` outline; chip `{chips:seniorNight}` (the page's only chip); media `ProductComposite variant="hero-sr"` from `03-senior-night/src/ftb-sr-poster.png` + `ftb-sr-front.png` + `ftb-sr-back.png` + `ftb-sr-badge.png` on an arena plate whose floodlight is warmed 6 % toward gold (`rgba(201,162,39,.12)` in the radial) — the only gold light on the site, inside the media plate. Never the 01-hero slide (P4).
2. **Order-by calculator** — stock, `border-t`. `form.grid.gap-4.md:grid-cols-[1fr_auto]` (date input `h-12 rounded-[12px]`, `btn-primary` "Check what's in time"); results as three rows in a `rounded-[12px] border border-hairline bg-surface divide-y divide-hairline`: `.label` tier · sentence · StatusChip (PASS "in time" / FAIL "after the night"). The honest fallback renders as a navy Plate with the gift-note button (`btn-secondary`). The **printable gift note** is a `dialog` (and `@media print` page): A5, stock paper, gold 1 px rule, shield silver (prints as navy — set `print-color-adjust: exact` for the rule only), H1 `display-1` "THIS IS YOUR SENIOR EDITION.", body `text-body`, sign-off line. C17 under the calculator in `text-small`.
3. **What makes it a senior edition** — ARENA band. `grid gap-6 md:grid-cols-2 lg:grid-cols-4`: card back `bsb-sr-back.png` (class year, career line, quote — callouts §6.5), `bsb-sr-badge.png`, `bsb-sr-sticker.png`, and the fourth slot = the pack panel **only if a count-neutral panel exists** (today's `*-pack-front-panel.png` files carry "10" → render the poster `bsb-sr-poster.png` instead). No certificate (P3). Gold appears only in the art.
4. **Nine sports** — stock. `grid grid-cols-3 md:grid-cols-9 gap-3` of SR fronts (`03-senior-night/src/{ftb,vlb,chr,sfb,wrs,bsb}-sr-front.png` + soccer/basketball/ice-hockey from the `card-flip/out/GDE_*SR_*` first frames where no src exists — extract with ffmpeg at t=0.2 s, 1080×1350 → crop the card region); tile labels in `font-bold text-[14px]`. Never dance/track/band/lacrosse.
5. **The whole senior class** — navy Plate inside stock, `max-w-[46rem]`, CTA `btn-secondary` (dark).
6. **Trust stack** — stock: four canon blocks + C17 + SN FAQ (4) + CTA pair + chip + TrustLine.

### 5.4 `/how-it-works` (stock; one arena band)
1. **Hero** — stock, no media: slate H1 "MADE BY A PERSON. AI IS IN THE TOOLBOX." with C2 as the `sub`-position paragraph in `text-body font-medium` (not bold — it is a paragraph). Right column at lg: the GateRow (§4.11) as the visual — the six gates ARE the hero image.
2. **Six gates** — stock. GateRow sticky at lg; below it an accordion of six `details` (`id="gate-N"`, `open` on the first; `#likeness` on gate 3). Each item: `grid lg:grid-cols-12` → text `lg:col-span-5` (`.label` gate name + StatusChip PASS, `h3.h3` title, body, side note in `text-small text-muted-text border-l-2 border-hairline pl-4`) and artefact `lg:col-span-7` in a `BracketFrame` on an `bg-arena-surface` stage: 1 the intake verdict Plate (as home §8.1) · 2 `art-pipeline/out/athletes/football/_kit.png` (2048² → 1200 w) · 3 `football/_identity.png` (three views) · 4 four frames `grid grid-cols-4 gap-2` from `01-football-card/src/s06-pose-{1..4}.png` (measure; 5:7 or `object-contain`) · 5 the `art:diff` sheet — generate one with `npm run art:diff -- --athlete football` and use its output (frame beside plate) · 6 `proof-bsb-sr.webp`. Captions per COPY; FictionalLabel below each stage.
3. **One that didn't ship** — ARENA. The rejected pair (P7) at `md:max-w-[52rem]`, as home §10 centre but larger (each frame `aspect-[5/7]` at up to 360 px), StatusChips, the closing sentence in `text-body text-white/90`.
4. **The effort sentence** — stock, `py-12`: one `h2`-sized Anton line "ABOUT FIFTY FRAMES ARE GENERATED FOR ONE ATHLETE. FOUR SHIP." centred? **Left**, at `text-h2-2 lg:text-h2-3`, `max-w-[20ch]`. Nothing else in the section.
5. **What you approve, and when** — stock, `border-t`: horizontal stepper at lg (`ol.grid.grid-cols-10.gap-px.bg-hairline` with `.label` states, the two "your approval" states carrying an outline pill `YOU`), vertical on mobile (the `ol.border-l` timeline from §5.2-3). C20, the revision sentence, C10, the reminder line in `text-small`.
6. **Who prints it** — stock: three rows `dl.divide-y.divide-hairline` (`dt.font-bold` partner name · `dd.text-small`), the labs sentence, C4.
7. **FAQ (6) + CTA** — as §5.2-7.

### 5.5 `/guarantee` (stock)
1. Slate H1 "OUR PROMISE, IN WRITING." + sub. C1 in a `BracketFrame` on a stock Plate at `text-sub font-bold max-w-[48ch]` — the one time the brackets frame text, because the promise is the artefact. Then H2 "WHAT THAT MEANS, EXACTLY." with four `h4.font-bold` + `p.text-body` items in `grid md:grid-cols-2 gap-8`.
2. Shipping table — `overflow-x-auto`, first column sticky (`sticky left-0 bg-stock`), cells tagged "(per lab)" in `text-muted-text`. C11/C12/C10 below.
3. Where a refund happens — `p.text-sub font-bold`.
4. Refund ladder (`id="refunds"`) — two-column `dl` styled as the spec-sheet table.
5. We are new — FounderNote layout with the long block, signature, `btn-text` "About the studio", CTA pair + TrustLine.
No media on this page except the brackets; the authority is the typesetting.

### 5.6 `/photo-guide` (stock; print stylesheet)
- Slate H1 + pills (`4–10 PHOTOS` filled, `ORIGINALS, NOT SCREENSHOTS` outline) + C5 `text-body font-medium`.
- Checklist: `ol.grid.gap-4.md:grid-cols-2.lg:grid-cols-3` → `li.rounded-[12px].border.border-hairline.bg-surface.p-5`: a `.label` number `01`–`09` (Barlow, tabular), `h3.h3` at `text-[1.25rem]`, `p.text-small`. Same component as the F2 upload page (`components/PhotoChecklist.tsx`).
- "What we never ask for" — navy Plate, one line.
- Good / not yet — `public/images/photo-guide.webp` (1536×1024 → 1400 w) whole, in a `BracketFrame`; PASS/FAIL StatusChips as an overlaid legend row above the image (`grid grid-cols-3` of chips + captions aligned to the panels).
- Closing line `text-sub font-bold`, buttons: `btn-secondary` "Print this checklist" (`window.print`), `btn-text` "See how photos become a card", CTA pair + TrustLine.
- `@media print`: hide header/footer/media/buttons, checklist as one column, 11 pt, page title + `gamedayedition.com/photo-guide`.

### 5.7 `/about` (stock; one navy band)
1. Slate H1 "WHO IS ASKING FOR YOUR ATHLETE'S PHOTOS." → founder card (`grid md:grid-cols-[auto_1fr] gap-6`: photo `w-32 aspect-[4/5] rounded-[12px]` or nothing; name `font-bold text-sub`, role, email as `btn-text`) → the story in `wrap-prose` with the bold lead-ins as `strong` and `h4.font-bold` where COPY bolds a phrase → FounderNote (the italic note).
2. Two essays — NAVY band (`grain`): `grid md:grid-cols-2 gap-10`, each `h2` (white, `text-h2-1 lg:text-h2-2`) + `p.text-body.text-white/90.max-w-[52ch]`; the second essay ends with `btn-text` (white) → `/how-it-works`. Shield silver 48 px centred above the grid at lg.
3. Independence — stock: C4, C6, the crest sentence.
4. Studio and partners — `dl` rows as `/how-it-works` §6; "Designed in Lithuania — printed by professional labs in the US" as the H2.
5. Imprint — `Plate` (stock, `border border-hairline`), legal IDs in `.id`.
6. True numbers — the footer's score-bug strip reused as a section (`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6`, Anton numbers in ink, labels linked). CTA pair + TrustLine.

### 5.8 `/registry` (stock)
1. Lookup — the page is the form: slate H1 "LOOK UP A CARD." + sub, then a `rounded-[12px] border border-hairline bg-surface p-6 md:p-8 max-w-[40rem]` panel: `label.label` "Card ID", the masked input (§5.1-5 style, `text-[1.25rem]`), help, `btn-primary` "Find this edition". Miss/private/rate-limit strings render in `role="status"` under the input. Demo line as `text-small` with the ID as a link. Right column at lg: `BK-SN-card-BACK.png` with the QR ring, 5:7 at 280 px, FictionalLabel — "this is where the ID is".
2. What a registered edition is — `wrap-prose`, six `h4.font-bold` + `p.text-body`; the ID anatomy as a diagram: `GDE`·`SN`·`BKB`·`2026`·`12` in five `Plate`-style boxes (`.id` at `text-[1.25rem]`), each with a `.label` under it (STYLE · SPORT · SEASON · NUMBER / E##), joined by `text-muted-text` hyphens — pure HTML, no image.

### 5.9 `/faq` (stock)
`wrap-prose` + a sticky (lg) left rail of the 8 group names (`.label`, `aria-current`), groups as `h2` at `text-h2-1`, questions as `details` (§5.2-7). FAQPage schema here only. No media. CTA pair at the end.

### 5.10 `/contact` (stock)
`wrap-prose`: slate H1 "TALK TO A PERSON." + sub with the email as `btn-text` (`mailto:`), then a `dl.divide-y.divide-hairline` of the seven topics (`dt.font-bold.pt-5` · `dd.text-body.pb-5`), imprint Plate. No form.

### 5.11 `/c/[cardId]` — the QR digital twin (ARENA, mobile-first)
Page shell: `main.band-arena.floodlight.grain.min-h-dvh` with `wrap-card`; at lg `grid lg:grid-cols-[minmax(0,26rem)_1fr] gap-10 items-start`. The header is the arena variant (§4.16). Team colour: `--team-primary`/`--team-secondary` set as CSS vars on `main` from the record; contrast-checked at build (`lib/color.ts`, WCAG 4.85:1 against `#080C12`) — if it fails, the name stays white and the colour appears only as a 4 px bar.

1. **Identity header** (spans both columns at lg): `div.flex.items-start.justify-between` → `Shield tone="silver"` 28 px + Pill outline (REGISTERED EDITION | SENIOR EDITION · 1 OF 1) → `h1` in the finish display font (`--finish-display` var set per record; `uppercase`, `text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] leading-[.95]`, colour `var(--team-primary, #fff)` if the check passed, else white) → meta line in the finish supporting font, `uppercase tracking-[.12em] text-[13px] text-arena-muted` (`#12 · GUARD · CEDAR RIDGE BEARS · 2026`; no `#`/number per `showsJerseyNumber`) → a `h-1 w-16 mt-3` bar in `var(--team-primary)` (always shown; it is the colour's guaranteed home). Demo: FictionalLabel below-style (`text-arena-muted`).
2. **Flip hero** (left column): CardFlip (§4.15) with `public/cards/<cardId>/front.webp` + `back.webp` (750×1050 sources; served 480/640/880 w), poster frame = front, `--shadow-card-arena`, a `radial-gradient` "table spot" under the card (`absolute inset-x-8 -bottom-6 h-10 rounded-[50%] bg-black/60 blur-xl`) so the card sits on something. MP4 fallback from `card-flip/out/GDE_<CODE>_CardFlip_1080x1350.mp4` (`<video playsInline muted controls preload="none" poster>`), shown only when the CSS flip cannot run (no `preserve-3d` support) or as the download.
3. **Edition panel** (right column top): §4.7, the silver rule, Copy ID.
4. **Stats and highlight**: `h2.label.text-arena-muted` "SEASON STATS" (SR: "CAREER HIGHS") → `div.grid.grid-cols-3.gap-2` of StatChips (finish display font for values); omitted when `stats[]` is empty. Highlight `p.text-body.text-white/90`; `CLASS OF {classOf}` as `.label`. SR: the FR·SO·JR·SR line in `.id`, the quote in Oswald italic `text-[1.125rem] text-white/85 border-l-2 border-gold/60 pl-4` (gold inside SR media — a quote rule is the edition's own gold, acceptable; if in doubt use `border-white/30`).
5. **Downloads and share**: `h2.label` "DOWNLOADS" → `ul.grid.grid-cols-2.gap-2` of `a.btn-secondary` (dark, `h-11 text-[14px]`, 1.5 px download icon, `aria-label` per COPY) → note `text-[12px] text-arena-muted` → share row: `btn-secondary` "Copy link" + `btn-secondary` "Share" (hidden when `navigator.share` is absent). Toasts: `role="status"`, arena-surface pill bottom-centre, 2 s.
6. **About this finish**: `p.text-small.text-arena-muted` two lines (`{material}` · `Type: {display} + {supporting}`), `btn-text` (white).
7. **CTA row by channel** (D26): `demo-etsy` → one `btn-secondary` (dark) "Get yours on Etsy →" — deliberately *not* primary: the card page is the athlete's, not a shop; `site/etsy/demo-site` → `btn-primary` "Order another edition" + `btn-secondary` "Also on Etsy →". No prices, ever.
8. **Privacy and control footer** (spans columns): `div.border-t.border-white/15.pt-6.text-[13px].text-arena-muted.space-y-2` — the visibility sentence, "Report this card" `btn-text` (white/80), the manage line, demo caption. Then the site footer in its navy band (the only band change on `/c`).
- `private`: header with shield + the one sentence + `btn-secondary` "Look up a card". `deleted` (410) and unknown (404): §5.12.
- Above the fold at 390 px: header 56 → identity header (~ 150) → the flip at 300 × 420 → "Tap to flip" — the panel starts at ≈ 640 px. LCP = `front.webp` at 640 w (`priority`); the back image `loading="eager"` but not preloaded (it must exist before the autoplay at 30 %). JS budget: the flip controller ≤ 3 KB; the page ships no client component beyond it and the copy/share buttons.

### 5.12 404 / 410 / error / `/c` unknown
Stock (`/c` variants: arena), `wrap-prose`, centred: shield navy/silver 48 px → H1 `display-1` → body `text-body` → for `/c` unknown the inline lookup field + `btn-primary` "Find this edition" → links row. No illustration.

---

## 6. IMAGERY PLAN

### 6.1 `ProductComposite` — the DOM composite that replaces baked-text slides
One client-free server component with variants `hero` (poster + front + back + badge), `hero-sr`, `pair`, `pair-large`. Each layer is its own `next/image` (absolute-positioned inside a `relative aspect-[4/3]` box; percentages given in §5.1). Rules: card layers are `aspect-[5/7]`, 0 radius, `--shadow-card-*`; rotation ≤ ±4°; the poster is 3:4 and never rotated; layers never cover a face; the FictionalLabel is on the largest card layer. Because the layers are real product PNGs, every composite is count-neutral by construction (P3/P4) and the LCP image is a single ≤ 90 KB file.

### 6.2 Cropping the 2000 × 2000 listing slides
Show a slide whole only when its baked headline is allowed (allow-list: `04-complete-set/08-six-finishes.png`, `19-everything-counted.png`, `04-transformation.png`, `02-basketball-poster/02-two-sizes-to-scale.png`, `01-*-card/06-four-shots*.png` after a read, `03-senior-night/16-you-see-it-first.png` after a read). Layout boxes for whole slides: `aspect-square` up to 640 px on mobile, `lg:aspect-[4/3]` with `object-cover object-[50%_45%]` (the slides keep their content inside a central ~ 84 % safe square, so a 4:3 crop loses only chrome). Never crop a slide to isolate a card face — use the `src/` face instead; never crop text-bearing regions half-way. Derived sizes: 800 / 1200 / 1600 w (AVIF), never the 2000 px original.

### 6.3 Card faces
- True ratio: every face box is `aspect-[5/7]` (2.5 : 3.5); the sources are 750 × 1050 (`src/`), 816 × 1110 with bleed (`print-sources/output/`, crop 36 px per side to 744 × 1038 first), 900 × 1260 (`marketing/cards/`, P2).
- Corners: `rounded-none` on the image, its `figure`, its `a`, its `BracketFrame`, its flip faces — an ESLint rule (`no-restricted-syntax` on `rounded-*` inside `*Card*`/`Flip`/`Composite` files) enforces it. The two-way audit (memory `gde-square-corners`): the PIL probe in §8.4 must return a dark opaque pixel at (0,0) for every face shipped.
- Shadows: `--shadow-card-stock` on stock, `--shadow-card-arena` on arena, plus `ring-1 ring-white/10` on arena for edge definition. No glow, no reflection, no bevel.
- Sizes served: 240 w (grid tiles), 480 w (strips, composite cards), 640 w (flip), 880 w (flip at lg 2×). `sizes` strings per placement; AVIF with WebP fallback via `next/image` `formats`.
- The QR ring (home §5, product §3, `/registry`): `div.absolute.rounded-full.border-[3px].border-accent` at the QR's measured position over `BK-SN-card-BACK.png`. Measure once with `python3 -c "from PIL import Image;import numpy as n;im=n.array(Image.open('etsy/listing-images/01-basketball-card/src/BK-SN-card-BACK.png').convert('L'));h,w=im.shape;r=im[int(h*.72):,:int(w*.45)];ys,xs=n.where(r>200);print(xs.min(),ys.min()+int(h*.72),xs.max(),ys.max()+int(h*.72))"` and convert to percentages; expected ≈ left 7 %, top 81 %, size 13 % of the card. The ring is a `border` (chrome), diameter = QR size × 1.6, `aria-hidden`.

### 6.4 The before → after device
- Before = a phone photo in a `rounded-[12px]` 4:5 box (a photo, so 12 px is right; it is the one rounded image on the page and the contrast with the square cards is the point). FictionalLabel on art. Alt per §0.5.
- Arrow = one inline SVG, `viewBox 0 0 64 24`, an 8 px-stroke line with a chevron head, `stroke="var(--color-accent)"`, `stroke-linecap="square"`; horizontal at md+, `rotate-90` and 24 px wide on mobile. Never animated. Only in the hero and home §5 (card back → panel, 40 px).
- After = the composite (§6.1). The after is always product (cards/poster), never a pose render (memory `gde-after-must-be-product`).

### 6.5 Callouts on a card back (SR §3, product §3)
Numbered callouts are drawn in HTML over the face: `ol` of `li.absolute` with a 22 px `rounded-full bg-accent text-ink font-label font-semibold text-[12px]` badge (chrome: pill fill) at measured percentages and a 1 px ink/white leader line (`::before`, 24 px). Every badge has a matching list item below the image (`ol` visible at all sizes; badges hidden `< sm`). Rule from memory `gde-callout-must-land`: as many badges as lines, measured on a grid, not by eye — the builder measures with the PIL probe.

### 6.6 The 17-sport grid
9 / 6 / 3 columns (§2.6). Tiles are 5:7 fronts (P2 sources) at 240 w; the two text tiles for pickleball/skateboarding are navy plates with the sport name in Anton (not a placeholder card). Labels: sport `font-bold text-[14px]`, truth line `text-[12px] text-muted-text`. On `/trading-cards` the grid also carries a hidden-until-focus "Order this sport" link per tile (`sr-only focus:not-sr-only`).

### 6.7 Room shots and set tiles
`room-SN.png` (2048²) and `tile-printed.jpg` (1400²) are photographs of objects → 12 px radius allowed on their box; inside them the poster/cards are art, untouched. `object-position` for `room-SN`: `50% 40%` so the framed poster stays in a 4:3 crop.

### 6.8 Backgrounds
Stock is flat `#F4F3EF`, no texture. Arena bands: floodlight + grain; home §4 adds the blurred gym photo at 18 %. `/c` adds nothing beyond the floodlight and the table spot. The navy footer: grain only. That is the whole atmosphere budget.

---

## 7. MOTION & INTERACTION

### 7.1 The single flip
- Port of `card-flip/web/flip.html`: 5.0 s, `cubic-bezier(.4,0,.2,1)`, keyframes in §4.15, `perspective: 1200px`, 0 radius.
- Autoplay once: an `IntersectionObserver` (threshold .6) adds `.play` when the scene is ≥ 60 % visible **and** the scene is below the fold (never in a hero); `animationend` sets `data-face="back"` and the caption to "Tap to flip back". Click / Enter / Space toggles with a 900 ms `rotateY` transition (not the 5 s hero move — a replay is quick). The button is `aria-pressed` and has the COPY `aria-label`s.
- Without JS: the front face renders as a plain image, the caption is hidden, and a `btn-text` "Watch the flip (MP4)" links to the video.
- `prefers-reduced-motion: reduce`: no animation, no observer; a two-button segmented control **Front / Back** (`btn-secondary h-10`, `aria-pressed`) swaps the images.
- MP4 fallback: `<video>` only when `@supports not (transform-style: preserve-3d)`; `preload="none"`, `poster` = front.

### 7.2 Reveal-on-scroll — none
No opacity-0 reveals, no staggered entrances. Content is visible without JS and on first paint. The "page load moment" is typographic (the H1 at 4.5 rem) and the three overhangs, not an animation.

### 7.3 Hover and press
180 ms ease-out on colour/border/shadow (§4.19). Buttons press 1 px. Nothing scales, nothing parallaxes, nothing loops. The header's `data-scrolled` hairline is the only scroll-linked change.

### 7.4 Edition panel "Registered" slide-in
240 ms `translate-y-2 → 0`, opacity, on mount, in checkout/order contexts only; suppressed under reduced motion.

### 7.5 Interaction details
- Toasts (`Copied`, `Link copied`): `role="status"`, 2 s, no motion beyond a 180 ms fade.
- `details` accordions: native; chevron rotates 180° in 180 ms.
- Mobile menu: `dialog.showModal()`, 200 ms fade only; body scroll locked; focus returns to the burger.
- The finish strip: native scroll-snap, `scrollbar-width: thin`, a right-edge `mask-image` fade of 32 px as the scroll hint (not an arrow button).

---

## 8. RISKS, TRADE-OFFS, A11Y AND PERF

### 8.1 Risks of this direction
- **Dark bands eat contrast budget.** Three arena bands + navy mean a lot of white-on-dark text; muted text must use `--arena-muted` (≥ 7:1), never `--muted`. Small text on arena is capped at 13 px and `text-white/70` minimum.
- **Overhangs are fragile.** Negative margins across bands break if a band's padding changes; encode them as two paired utilities (`overhang-down` on the element, `overhang-land` on the band) and test at 320 / 390 / 768 / 1024 / 1440.
- **Anton at 4.5 rem is loud.** It works because everything else is quiet — if a builder adds coloured eyebrows, gradient text or a second display face, the broadcast becomes a poster. Enforce: accent only in the five chrome uses; no `text-accent` anywhere; Barlow never in an eyebrow.
- **The "slate index" can read as pagination.** It is `aria-hidden`, 13 px, muted; if user testing shows confusion, drop the index and keep the eyebrow — nothing else depends on it.
- **Card faces from mixed export eras.** P2 is the single biggest visual risk: one white-cornered tile in the 17-grid breaks the "square-cut" claim. The PIL probe is in CI (§8.4).
- **Fewer atmospheric flourishes than a "premium" template.** Deliberate: the product art is the atmosphere. If the page feels flat, the fix is larger product imagery, not more effects.
- **Etsy-first F1 leaves the primary CTA leaving the site.** Design-wise the primary button is still orange; the outline "Look up a card" keeps a strong on-site action beside it.

### 8.2 Accessibility
- Contrast: ink on stock 15:1; ink on accent 5.9:1; `--muted-text` on stock 5.6:1; `--arena-muted` on arena-surface 7:1; white on navy 12:1; PASS/FAIL chip text per §4.14 (≥ 4.5:1 tinted). Never white text on accent. Team colours on `/c` gated at 4.85:1 or demoted to the 4 px bar.
- Focus: §4.2 double ring, visible on every interactive element including tiles and the flip button; no `outline: none` anywhere.
- Semantics: one `h1` per page; sections are `section` with `aria-labelledby` the H2; tables have `th scope`; the QR ring, arrows, slate indices and floodlights are `aria-hidden`; the flip button has `aria-pressed` + label; toasts `role="status"`; the mobile menu is a `dialog`.
- Reduced motion honoured for the flip, the panel slide-in, the header hairline (instant).
- Touch targets ≥ 44 px (buttons 48, tiles ≥ 88, chips are not interactive).
- Zoom: layouts hold at 200 % (rem-based type; `max-w` in `ch`/`rem`); tables scroll horizontally rather than shrinking.
- Print: `/photo-guide` and the SR gift note have print stylesheets; card faces print with `print-color-adjust: exact`.

### 8.3 Performance
- Fonts: Anton 400 + Space Grotesk 400/500/700 (preloaded, ~ 90 KB total woff2), Barlow 600 (`preload: false`, ≤ 20 KB). Per-finish pairs only in `/c/[cardId]/fonts.ts`, all `preload: false`, `display: swap`, `adjustFontFallback` on — only the rendered card's pair downloads (≤ 2 files, ≤ 60 KB).
- LCP: home = hero poster ≤ 90 KB AVIF at 640 w, `priority`; product = hero card front ≤ 40 KB; `/c` = `front.webp` ≤ 60 KB. Target LCP < 1.8 s on a mid phone; CLS 0 (every image has dimensions; fonts `swap` with metric fallbacks; no late-mounting bars).
- Images: all derived at build by `scripts/site-assets.ts` (sharp) into `public/images/site/` at 240 / 480 / 640 / 880 / 1200 / 1600 w AVIF + WebP; never a 2000 px original; `next/image` with tight `sizes`; everything below the fold `loading="lazy"`.
- JS: marketing pages ship zero client components except the header's `data-scrolled` listener, the mobile menu, the flip and the accordions' chevrons (CSS-only). `/c` < 300 KB JS total per the spec — realistically ≈ 90 KB with Next 16 runtime.
- CSS: Tailwind 4 tree-shaken; the grain SVG data-URI is ≈ 600 bytes; no CSS-in-JS.

### 8.4 Build prerequisites and CI checks (from §0)
1. `scripts/site-assets.ts`: reads a manifest (`content/site-assets.json`: source path, id, crops, sizes), writes derivatives, and **refuses** any source whose sha256 is in `content/site-assets.denylist.json` (all certificate exports, all pack faces/panels with "10", `02-front-back-registered.png`, `03-senior-night/01-hero.png`, the Nia Brooks exports, `public/images/sport-examples/*`). It also runs the **corner probe** on every asset tagged `card`: `(0,0)`, `(w-1,0)`, `(0,h-1)`, `(w-1,h-1)` must be opaque and not white (`min(r,g,b) < 120`) — fails the build otherwise (P2).
2. Brand SVG cleanup (P1) and the inline `<Shield>`/`<Wordmark>` components with `tone` prop.
3. Finish label SVGs (P5) or the documented text fallback.
4. `lib/color.ts` contrast helper for `/c` team colours, unit-tested with the demo records.
5. ESLint: no `rounded-*` in card/flip/composite files; no `text-accent`/`bg-accent` outside `Pill`, `btn-primary`, the arrow, `BracketFrame`, callout badges and the focus ring; no `$` literals outside `prices.ts` (already specified by COPY §0.2).
6. Visual regression: Playwright screenshots at 390 / 768 / 1440 for `/`, `/trading-cards`, `/senior-night`, `/c/GDE-SN-BKB-2026-12`, light only (marketing pages have no dark theme; `/c` is always arena).

---

## APPENDIX A — asset manifest (measured 2026-09-06)

| Use | Source (repo path) | Size | Derived id / notes |
|---|---|---|---|
| Home hero before | `etsy/listing-images/01-football-card/src/s02-before-b.png` (or `-a`) | 970×1224 (970×1282) | `hero-before` 480/640 w; verify scene vs alt |
| Home hero poster (LCP) | `etsy/listing-images/01-football-card/src/FB-FS-poster.png` | 1944×2592 | `hero-poster` 480/640/880 w |
| Home hero card front/back | `…/src/FB-FS-card-FRONT.png`, `FB-FS-card-BACK.png` | 750×1050 | `hero-card-front/back` 480 w |
| Badge (count-neutral) | `etsy/listing-images/04-complete-set/src/football-badge.png` | measure | verify no count text |
| Cards tier / pair / flip / QR ring | `etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png`, `BK-SN-card-BACK.png` | 750×1050 | square, opaque corners ✔ |
| Six finishes | `…/01-basketball-card/src/BK-{SN,CA,FS,HE,SS,PR}-front.png` | 750×1050 | `finish-<code>` 480 w |
| SR tile (same athlete) | `etsy/listing-images/04-complete-set/src/marcus-sn-card-front.png` (P6) | measure | fallback `03-senior-night/src/bsb-sr-front.png` 750×1050 |
| Posters tier / room | `etsy/listing-images/02-basketball-poster/room-SN.png` | 2048×2048 | `room-sn` 800/1000/1400 w |
| Set tier | `etsy/listing-images/04-complete-set/v3/tile-printed.jpg` (+ `tile-deluxe`, `tile-ultimate`) | 1400×1400 | 1000 w |
| Proof | `etsy/listing-images/03-senior-night/src/bsb-sr-proof.png` | 1400×1092 | `proof-bsb-sr` 600/1200 w |
| Arena backdrop (home §4) | `art-pipeline/out/etsy-shots/hero-bg-gym-night.png` | 1024×1024 | 1200 w, 18 %, blurred |
| Kit plate | `art-pipeline/out/athletes/football/_kit.png` | 2048×2048 | 1200 w |
| Reference plate | `art-pipeline/out/athletes/football/_identity.png` | 2400×1792 | 900/1200 w |
| Intake verdict | `art-pipeline/out/athletes/ice-hockey/before/_intake.json` | — | typeset as a Plate, no scores |
| Rejected pair | ice-hockey `_versions` (P7) / `01-football-card/src/s06-reject.png` 818×1740 + `s06-pose-1.png` | — | caption must match the frame |
| 17 sports | `public/images/site/cards/<slug>-front.webp` after P2 re-export; interim `marketing/cards/*-front.png` 900×1260 with `scale-[1.05]` | — | 240/480 w |
| Cheer pair | `etsy/listing-images/01-cheerleading-card/src/CH-SN-card-FRONT.png`, `CH-SN-card-BACK.png` | measure (expect 750×1050) | no number in alt |
| Whole slides (allow-list) | `04-complete-set/08-six-finishes.png`, `19-everything-counted.png`, `04-transformation.png`; `02-basketball-poster/02-two-sizes-to-scale.png` | 2000×2000 | 800/1200/1600 w |
| SR hero layers | `03-senior-night/src/ftb-sr-poster.png`, `ftb-sr-front.png`, `ftb-sr-back.png`, `ftb-sr-badge.png` | measure | composite, never the SR 01-hero slide |
| SR nine sports | `03-senior-night/src/{ftb,vlb,chr,sfb,wrs,bsb}-sr-front.png` + first frames of `card-flip/out/GDE_{SOC,BSB…}SR_CardFlip_1080x1350.mp4` | 750×1050 / 1080×1350 | |
| Photo guide | `public/images/photo-guide.webp` | 1536×1024 | 1400 w |
| Flip MP4s | `card-flip/out/GDE_<CODE>_CardFlip_1080x1350.mp4` | 1080×1350, 5 s | `preload="none"` |
| Brand | `public/brand/shield.svg` (307×333), `wordmark.svg` (604×206) after P1 | — | inline components |
| **Never** | any certificate export; `*-pack-front-panel.png`, `*-pack-flat.png`, `pkg-04-foil-pack.png` (count "10"); `02-front-back-registered.png`, `03-senior-night/01-hero.png` whole; `public/images/sport-examples/*`; Nia Brooks exports; real customer photos | | denylist |

## APPENDIX B — `app/globals.css` skeleton (Tailwind 4)
```css
@import "tailwindcss";
@theme { /* §3 type tokens + §4 colour/shadow/radius tokens verbatim */ }
:root { --silver: linear-gradient(20deg,#FFFFFF 0%,#C7D0DC 50%,#FFFFFF 100%); }
html { background: var(--color-stock); color: var(--color-ink); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
body { margin: 0; }
img, video { display: block; max-width: 100%; }
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; box-shadow: 0 0 0 1px var(--color-ink); border-radius: 4px; }
.band-arena :focus-visible, .band-navy :focus-visible { box-shadow: 0 0 0 1px #fff; }
@utility band-stock { background: var(--color-stock); color: var(--color-ink); }
@utility band-arena { background: var(--color-arena); color: #fff; }
@utility band-navy  { background: var(--color-navy); color: #fff; }
@utility floodlight { background-image: radial-gradient(60% 45% at 50% 0%, rgb(255 255 255 / .10), transparent 70%); }
@utility grain { position: relative; }
.grain::after { content:""; position:absolute; inset:0; pointer-events:none; opacity:.04; mix-blend-mode:soft-light;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); }
@utility display { font-family: var(--font-display); text-transform: uppercase; }
@utility eyebrow { font-family: var(--font-sans); font-weight: 500; font-size: var(--text-label); line-height: 1; text-transform: uppercase; letter-spacing: .14em; color: var(--color-navy); display: flex; align-items: center; gap: .5rem; }
.eyebrow::before { content: ""; display: block; height: 2px; width: 1.25rem; background: currentColor; }
@utility label { font-family: var(--font-label); font-weight: 600; font-size: var(--text-label); line-height: 1; text-transform: uppercase; letter-spacing: .12em; }
@utility id { font-family: var(--font-label); font-weight: 600; font-size: 15px; letter-spacing: .04em; font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation: none !important; transition-duration: 0ms !important; } }
```

*End of DIRECTION-B.md.*
