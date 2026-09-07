# DIRECTION A — "Premium collectible catalog"

Visual brief for the new gamedayedition.com (F1). Product-first. The card and the poster are the heroes at
their true proportion; museum-plate presentation; spec tables as design objects; generous stock whitespace;
precise hairlines; a registry that reads like a certificate archive. A serious manufacturer's catalogue, not
a marketplace.

Authority order: `docs/SITE-BUILD-SPEC-2026-09.md` §2 (tokens, type, marks, image rules, motion, component
language) is FIXED; `docs/f1/COPY.md` is the copy (paste, never improvise); this document decides how the
two are laid out. Where this brief found a conflict or a defect in the sources it says so in §10 and picks a
default — it never silently changes a rule.

Every path below is absolute-from-repo-root and was checked to exist on 2026-09-06 with its pixel size; the
audit each one still needs before it may enter `public/` is listed in §9.

---

## 0. Findings that change the build (read before writing a component)

1. **Listing slides carry baked headline text and rounded-corner card renders.** Slide
   `etsy/listing-images/01-basketball-card/02-front-back-registered.png` reads "FRONT + BACK. NUMBERED.
   REGISTERED." — `NUMBERED` is on the ban list (S10) — and both cards in it are drawn with rounded corners
   and a drop shadow. The same is true of `04-complete-set/01-hero.png` ("CUSTOM POSTER + TRADING CARD SET"
   + a "DIGITAL EDITION" badge) and `04-complete-set/08-six-finishes.png` (rounded tiles, baked labels).
   **Rule for this direction: no slide is ever shown whole. The site composes from the `src/` faces
   (750 × 1050 and 900 × 1260 — exactly 5:7 = 2.5 : 3.5) and crops a slide only for a media region that
   contains no text.** Corners are rendered by the site at radius 0; the shadow is CSS.
2. **`public/brand/shield.svg` and `wordmark.svg` are raw Figma exports with artifact geometry**: each has
   a full-canvas `<rect fill="#E5E5E5">` and an oversized white rounded rect before the mark path. Rendered
   as-is the "silver shield on navy" is a grey square. Strip both rects; keep the path (shield fill
   `#172C50`, viewBox 0 0 307 333 ≈ 0.92 : 1; wordmark fill `#1E2A4A`, viewBox 0 0 604 206 ≈ 2.93 : 1).
   The silver version is the same path with the §2.1 silver gradient as fill (see §4.16).
3. **`app/layout.tsx` still loads Inter + Oswald and `app/globals.css` holds the old blue/purple tokens.**
   Both are replaced wholesale (§2.0, §3.0). Nothing in the old CSS survives.
4. **`public/brand/founder.jpg` does not exist.** Per COPY §0.5 the founder note and the About founder card
   render with no image and no reserved slot. The layouts below are designed text-first so the absence is
   not a hole.
5. **`--muted` (#6E7278) on `--stock` (#F4F3EF) measures 4.37 : 1 — below WCAG AA for body-size text.**
   This brief uses `--muted` only for large text (≥ 24 px, or ≥ 18.66 px bold) and renders every small
   secondary line in `text-ink/70` (≈ #575A5D, 6.2 : 1). Owner may instead darken the token (§10).
6. **The accent focus ring alone fails non-text contrast on stock (2.56 : 1).** The ring recipe in §4.18
   pairs the 2 px accent outline with a 1 px ink inner stroke so the composite indicator passes 3 : 1.
7. **Count-bearing art is still in the asset tree.** `04-complete-set/v3/tile-printed.jpg` includes a pack
   whose face prints a card count; `04-complete-set/src/football-certificate.png` and the SR certificates
   must be checked for the "10" before use. The recipes below avoid the pack entirely and treat every
   certificate as "verify count-neutral first, else omit".
8. **The copy pack asks for `{chips:seniorNight}` inside the Senior Night occasion card on `/`, while §2.6
   allows one delivery claim per page and the hero already carries `{chips:standard}`.** Default here:
   the SN card on `/` renders no chip (the claim lives on `/senior-night`). Owner decision in §10.

---

## 1. Thesis

**This site is a manufacturer's catalogue for one product line: a registered edition of one athlete.**
Every page puts the object first — the card at its true 2.5 : 3.5 proportion, the poster at the poster's
ratio, each set on a matte plate with a specimen caption — and treats the words as the label beside the
object, not the other way round. **Trust is built the way a serious maker builds it: by showing the spec,
the proof, the rejected take and the registry ledger, in a ruled, numbered, hairline system that never
raises its voice.** The single indulgence is the card flip; everything else holds still.

### What makes it not generic
- **Plates, not cards-on-cards.** Products sit on a matte board (`--hairline` fill, 8 % inset) inside a
  ruled plate with a caption rail — the museum-object convention — instead of the SaaS "rounded tile with a
  soft shadow". Nothing floats, nothing tilts, nothing glows.
- **The ruled page.** Every section opens on a full-width hairline with the section index sitting on the
  rule (`02 / 13`). The index is set in tabular Space Grotesk, the rule is 1 px `--hairline`. It gives the
  long pages the pagination of a printed catalogue and makes the whitespace read as intentional.
- **The spec sheet is the hero of the product page**, styled as a definition ledger (Barlow row keys,
  Space Grotesk values, 1 px rules, no zebra) — the strongest "this is a real manufacturer" signal the spec
  names, promoted from an afterthought to a design object with its own plate.
- **The registry reads as an archive.** `EditionPanel` is a ledger with a silver top rule and a stamped
  REGISTERED date; the `/registry` page carries an "ID anatomy" diagram built in HTML — the card ID split
  into its four fields with hairline brackets — so the ID system itself becomes a piece of the design.
- **One scale per plate.** Wherever a card and a poster share a plate they are drawn at one px-per-inch
  (poster 18 × 24 is 7.2× the card's width) — the true-scale rule from the listing canon carried onto the
  site, so size is shown, never claimed.
- **Accent as instrument, not decoration.** Orange exists only where the spec allows it (primary button,
  focus ring, the before→after arrow, pill fill, bracket corners). On a page that is otherwise stock, ink,
  navy and hairline, the four bracket corners around a proof read as an auditor's mark, exactly as they do
  in the listing videos.
- **Two dark rooms only.** The proof band on `/` and the `/c` arena. The rest of the site is daylight
  stock; the darkness is reserved for the artwork so it reads as a gallery, not a "dark mode".

---

## 2. Layout system

### 2.0 Tokens (Tailwind 4 `@theme` in `app/globals.css` — replaces the old file entirely)
```css
@import "tailwindcss";

@theme {
  --color-stock: #F4F3EF;
  --color-hairline: #E8E7E2;
  --color-ink: #14191F;
  --color-muted: #6E7278;          /* large text only — see §0.5 */
  --color-accent: #FF6B2B;         /* chrome only */
  --color-navy: #172C50;
  --color-arena: #080C12;
  --color-arena-surface: #14191F;
  --color-arena-hairline: rgb(255 255 255 / 0.08);
  --color-pass: #4EAF90;
  --color-fail: #D8554B;
  --color-gold: #C9A227;           /* inside Senior Night media only */

  --font-display: var(--font-anton), Impact, "Arial Narrow Bold", sans-serif;
  --font-sans: var(--font-space-grotesk), Arial, Helvetica, sans-serif;
  --font-label: var(--font-barlow), Arial, Helvetica, sans-serif;

  --radius-ui: 12px;               /* panels, buttons, tier cards */
  --radius-card: 0px;              /* anything depicting a card or poster */

  --shadow-card-stock: 0 1px 0 rgb(20 25 31 / 0.06), 0 24px 40px -24px rgb(20 25 31 / 0.35);
  --shadow-card-arena: 0 32px 64px -28px rgb(0 0 0 / 0.9);

  --ease-out-180: cubic-bezier(0.2, 0, 0, 1);
  --ease-flip: cubic-bezier(0.4, 0, 0.2, 1);       /* card-flip/web/flip.html */

  --container-page: 75rem;         /* 1200 px — text and tiers */
  --container-gallery: 85rem;      /* 1360 px — plate galleries and the 17-sport grid */
  --measure: 62ch;
}

/* the silver: shield / wordmark / certificate seal / proof tiles ONLY */
:root { --silver: linear-gradient(20deg, #FFFFFF 0%, #C7D0DC 50%, #FFFFFF 100%); }
```
`next/font` in `app/layout.tsx`: `Anton({ weight: "400", variable: "--font-anton" })`,
`Space_Grotesk({ weight: ["400","500","700"], variable: "--font-space-grotesk" })`,
`Barlow({ weight: "600", variable: "--font-barlow" })`; all `subsets: ["latin"]`, `display: "swap"`,
`adjustFontFallback: true` (default). No other family loads outside `app/c/`.

### 2.1 Containers and gutters
| Name | Class | Use |
|---|---|---|
| Page | `mx-auto w-full max-w-(--container-page) px-5 sm:px-8 lg:px-12` | Text, tiers, tables, forms |
| Gallery | `mx-auto w-full max-w-(--container-gallery) px-5 sm:px-8 lg:px-12` | Six-finish row, 17-sport grid, proof wall, hero |
| Bleed | `w-full` (band) + inner Page/Gallery container | Proof band (arena), footer (navy), `/c` |
| Measure | `max-w-(--measure)` on every `<p>` | 62ch ≈ 640 px at 17 px |

Gutters never change inside a band; a band changes only the background.

### 2.2 Grid
- `lg:grid lg:grid-cols-12 lg:gap-x-8` (32 px). `md:grid-cols-6 md:gap-x-6`. Mobile: single column, `gap-y-6`.
- **Rail + body**: the default section body is `lg:col-span-10 lg:col-start-3`; the rail
  (`lg:col-span-2`) holds the section index and, where the copy supplies one, the pill. On mobile the rail
  collapses to one row above the H2 (index left, pill right).
- **Two-up media/text**: media `lg:col-span-6`, text `lg:col-span-5 lg:col-start-8` (one empty column as
  the gutter between object and label — deliberate).
- **Tier rows**: 3 tiers `lg:grid-cols-3`, 4 tiers `lg:grid-cols-4`, `md:grid-cols-2`, mobile 1-col.

### 2.3 Spacing scale (Tailwind steps used; nothing else)
`1 (4) · 2 (8) · 3 (12) · 4 (16) · 6 (24) · 8 (32) · 10 (40) · 12 (48) · 16 (64) · 24 (96) · 32 (128)`.
- Section padding: `py-16 md:py-24 lg:py-32`.
- Opener → body: `mt-8 lg:mt-12`. Eyebrow rail → H2: `mt-6`. H2 → subhead: `mt-4`. Subhead → body: `mt-6`.
- Plate padding: `p-4 md:p-6 lg:p-10`. Mat inset around a card: `p-[8%]`.
- Tier card padding: `p-6`. Table cell: `py-3 px-4`. Chip: `px-2.5 py-1`.
- Between stacked sections inside one page block: `space-y-16 lg:space-y-24`.

### 2.4 Section rhythm (band sequence)
Light pages are stock end to end; depth comes from mats and rules, not from alternating band colours.
The named dark bands are the only exceptions:
- `/`: 01 stock · 02 stock · 03 stock · **04 arena** (proof band, full bleed) · 05–12 stock · **13 navy** (footer).
- Product family: all stock; footer navy. The flip hero sits on a stock plate with an arena mat behind
  the card (the card's own dark art needs a dark mat to read as an object — the mat is a `bg-arena`
  rectangle, 8 % inset, inside a hairline plate; the page stays light).
- `/senior-night`: stock; gold appears only inside the SR media.
- `/how-it-works`, `/guarantee`, `/photo-guide`, `/about`, `/registry`, `/faq`, `/contact`: stock.
- `/c/[cardId]`: arena end to end, footer navy → arena-surface variant (see §5.11).

### 2.5 How a section opens
```
<section aria-labelledby="s-05">
  <div class="page-or-gallery container">
    <!-- rule + index -->
    <div class="flex items-center gap-4 border-t border-hairline pt-3">
      <span class="font-sans text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] text-ink/70">05 / 13</span>
      <!-- pill only when COPY.md supplies one -->
    </div>
    <h2 id="s-05" class="h2 mt-6">REGISTERED, NOT JUST PRINTED.</h2>
    <p class="subhead mt-4">…</p>
    <div class="mt-8 lg:mt-12">…body…</div>
  </div>
</section>
```
- The index numeral is the only "eyebrow". **No eyebrow words are invented** — COPY.md defines none, and
  Barlow may never be an eyebrow. Where the copy supplies a pill, the pill sits on the rule to the right of
  the index.
- H1 pages (`/`, product families, `/senior-night` …): the rule is omitted on the hero (the header's bottom
  hairline is the rule); pills sit above the H1 in a `flex flex-wrap gap-2`.
- The index counts the sections the copy pack lists for that page (`/` = 13, product = 7, how-it-works = 7).

### 2.6 Mobile-first behaviour of every pattern
- Rail collapses above the H2; index left, pill right (`flex justify-between`).
- Two-up media/text stacks media first (the object leads) except in §5.1-01 where the H1 leads.
- Tier rows become a single column; the `FEATURED` tier keeps its position (never re-ordered to first —
  the ladder order is the price order).
- Tables ≥ 4 columns become stacked records on `< md`: each row is a `dl` plate with `dt` Barlow labels
  (recipe in §4.9). 2-column ledgers (spec sheet, refund ladder) stay tables at all sizes with the key
  column at `w-[38%]`.
- Horizontal rows (six finishes, nine SN sports) are `snap-x snap-mandatory overflow-x-auto` on `< lg`
  with `scroll-padding-inline` equal to the gutter; ≥ lg they are grids.
- Plates never exceed the viewport: images are `w-full h-auto` inside aspect boxes.
- Sticky header stays sticky on mobile (64 px); the mobile menu is a full-height stock sheet.
- Tap targets ≥ 44 × 44 for buttons, ≥ 24 × 24 for inline controls (copy-ID, share).

---

## 3. Type in use

### 3.0 Scale (from §2.2, rem)
| Role | Family | Size (mobile / tablet / desktop) | Line-height | Tracking | Case | Max length |
|---|---|---|---|---|---|---|
| Display (H1) | Anton | 2.75 / 3.5 / 4.5 | 0.95 | 0.005em | UPPER + full stop | ≤ 2 lines, `max-w-[16ch]` |
| H2 | Anton | 2 / 2.25 / 2.75 | 1.0 | 0.005em | UPPER + full stop | ≤ 2 lines, `max-w-[20ch]` |
| H3 (block titles: OUR PROMISE, tier names) | Anton | 1.5 | 1.1 | 0.01em | UPPER, no stop unless the copy has one | 1 line |
| Subhead | Space Grotesk 700 | 1.375 | 1.3 | -0.005em | Sentence | `max-w-[44ch]` |
| Question / card title | Space Grotesk 700 | 1.125 | 1.35 | 0 | Sentence | — |
| Body | Space Grotesk 400 (500 for leads) | 1.0625 (17 px) | 1.55 | 0 | Sentence | `max-w-(--measure)` |
| Small | Space Grotesk 400 | 0.875 | 1.5 | 0 | Sentence | — |
| Caption (plate caption, FictionalLabel) | Space Grotesk 500 | 0.75 | 1.4 | 0.01em | Sentence | — |
| Label (form labels, table heads) | Barlow 600 | 0.6875 (11 px) | 1 | 0.12em | UPPER | — |
| ID / time line | Barlow 600 | 0.9375 | 1 | 0.06em | UPPER, `tabular-nums` | — |
| Pill text | Anton | 0.75 | 1 | 0.08em | UPPER, no stop | — |
| Price (current) | Space Grotesk 700 | 1.75 | 1 | -0.01em | — | `tabular-nums` |
| Price (struck) | Space Grotesk 500 | 1 | 1 | 0 | — | `line-through text-ink/70` |
| True-number numeral | Anton | 2.75 | 1 | 0 | — | — |

### 3.1 Class recipes (define once in `globals.css` as `@utility` or as component classes)
```css
@utility h1 { @apply font-display uppercase leading-[0.95] tracking-[0.005em] text-ink
             text-[2.75rem] md:text-[3.5rem] lg:text-[4.5rem] max-w-[16ch] text-balance; }
@utility h2 { @apply font-display uppercase leading-none tracking-[0.005em] text-ink
             text-[2rem] md:text-[2.25rem] lg:text-[2.75rem] max-w-[20ch] text-balance; }
@utility h3 { @apply font-display uppercase leading-[1.1] tracking-[0.01em] text-ink text-[1.5rem]; }
@utility subhead { @apply font-sans font-bold text-[1.375rem] leading-[1.3] tracking-[-0.005em] text-ink max-w-[44ch] text-pretty; }
@utility question { @apply font-sans font-bold text-[1.125rem] leading-[1.35] text-ink; }
@utility body { @apply font-sans text-[1.0625rem] leading-[1.55] text-ink max-w-(--measure) text-pretty; }
@utility lead { @apply body font-medium; }
@utility small { @apply font-sans text-[0.875rem] leading-[1.5] text-ink/70; }
@utility caption { @apply font-sans font-medium text-[0.75rem] leading-[1.4] tracking-[0.01em] text-ink/70; }
@utility label { @apply font-label uppercase text-[0.6875rem] leading-none tracking-[0.12em] text-ink/70; }
@utility idline { @apply font-label uppercase text-[0.9375rem] leading-none tracking-[0.06em] tabular-nums text-ink; }
@utility on-arena { @apply text-white; }         /* pair with label/ idline: text-white/60 for keys */
```
- Anton has no italic and no bold: never `font-bold` on display classes.
- Space Grotesk italic is used exactly once: `FounderNote` (`italic font-normal`).
- `text-balance` on headings, `text-pretty` on paragraphs; both are progressive enhancement.
- Numerals in prices, IDs, dates and stats are always `tabular-nums`.
- Full stops on H1/H2 are part of the copy string — never added or stripped in code.

---

## 4. Component recipes

All components are server components unless noted. Radius: `rounded-(--radius-ui)` (12 px) for UI panels;
`rounded-none` — and a `.card-face` class that hard-sets `border-radius: 0 !important` — for anything that
depicts a card or poster. Hover/focus transitions: `transition-[color,background-color,border-color,transform,opacity] duration-[180ms] ease-(--ease-out-180)`; define once as `@utility hover-180`.

### 4.1 Pill
```html
<span class="inline-flex h-7 items-center rounded-full px-3 font-display text-[0.75rem] uppercase tracking-[0.08em] leading-none
             [&.fill]:bg-accent [&.fill]:text-ink
             [&.outline]:border [&.outline]:border-ink [&.outline]:text-ink
             [&.silver]:border [&.silver]:border-white/40 [&.silver]:text-white">FROM YOUR PHOTOS</span>
```
Variants: `fill` (orange, the one primary claim on the page), `outline` (ink, secondary claims), `silver`
(on arena). Never two `fill` pills in one section. `FEATURED` is always `outline`.

### 4.2 DeliveryChips
One row, verbatim from `lib/catalog/delivery.ts`, segments split on ` · `:
```html
<ul class="flex flex-wrap gap-2" aria-label="Delivery">
  <li class="label rounded-full border border-hairline bg-stock px-2.5 py-1.5 text-ink">DIGITAL IN 1–2 DAYS</li>
  <li …>PRINTS SHIP IN 5–7</li>
</ul>
```
Barlow is allowed here (it is a time line). One `DeliveryChips` claim per page; repeating the same claim
(hero + closing CTA) is one claim. On arena: `border-white/20 bg-arena-surface text-white`.

### 4.3 TierCard
```html
<article class="relative flex flex-col rounded-(--radius-ui) border border-hairline bg-stock p-6 hover-180 hover:border-ink">
  <!-- FEATURED pill absolute top-4 right-4 (outline) -->
  <div class="mat aspect-[4/5]">…media (see §6)…</div>
  <h3 class="h3 mt-6">12 PRINTED CARDS</h3>
  <p class="mt-3 flex items-baseline gap-3">
    <span class="font-sans font-bold text-[1.75rem] leading-none tabular-nums tracking-[-0.01em]">$53.99</span>
    <s class="font-sans font-medium text-base tabular-nums text-ink/70">$76.99</s>   <!-- only while isSaleActive() -->
  </p>
  <p class="small mt-1">Sale price until Sep 24, 2026</p>                                <!-- only while isSaleActive() -->
  <dl class="mt-6 divide-y divide-hairline border-y border-hairline">
    <div class="py-3"><dt class="label">What's in the box</dt><dd class="body mt-2 text-[0.9375rem]">…one line per deliverable, `<ul class="list-none space-y-1">`…</dd></div>
    <div class="py-3"><dt class="label">Ships from</dt><dd class="small mt-2">Professional photo print lab, Santa Cruz CA · tracked (per lab)</dd></div>
  </dl>
  <div class="mt-4"><DeliveryChip segment="prints" /></div>
  <div class="mt-auto pt-6 flex flex-col gap-2"><Button primary>Order on Etsy →</Button></div>
</article>
```
- Price values only through `formatUsd(sitePrice(tier))` / `priceDisplay(tier)`; a `$` literal in JSX fails
  CI. The struck price is `<s>` with `aria-label="Regular price"` and the current price has
  `aria-label="Sale price"` while the sale runs.
- Tier name = the Etsy variant name from `prices.ts`, Anton H3, one line (≤ 20 chars).
- The "from {price}" family variant (home §5.1-03) uses the same shell with `Space Grotesk 700 1.25rem` for
  `from $32.99` and no struck price.
- Hover: border → ink only. No lift, no shadow (museum).

### 4.4 EditionPanel (dark; used on stock pages as a dark object, and on `/c`)
```html
<section class="rounded-(--radius-ui) bg-arena-surface p-6 text-white
                [background-image:var(--silver)] [background-size:100%_1px] [background-repeat:no-repeat] [background-position:top]">
  <div class="flex items-center justify-between">
    <Pill silver>REGISTERED EDITION</Pill>
    <span class="caption text-white/60">Example edition · Fictional athlete</span>   <!-- demo only -->
  </div>
  <dl class="mt-6 grid grid-cols-[minmax(6.5rem,auto)_1fr] gap-x-6 gap-y-3 border-t border-arena-hairline pt-4">
    <dt class="label text-white/60">Edition ID</dt><dd class="idline text-white flex items-center gap-2">GDE-SN-BKB-2026-12 <CopyIdButton/></dd>
    <dt class="label text-white/60">Finish</dt><dd class="font-sans font-medium">Stadium Night</dd>
    <dt class="label text-white/60">Sport</dt><dd class="font-sans font-medium">Basketball</dd>
    <dt class="label text-white/60">Season</dt><dd class="font-sans font-medium tabular-nums">2026</dd>
    <dt class="label text-white/60">Registered</dt><dd class="font-sans font-medium tabular-nums">Aug 27, 2026</dd>
    <dt class="label text-white/60">Certificate</dt><dd class="font-sans">Printed and included with every shipped package</dd>
  </dl>
  <p class="small mt-4 text-white/70">One registered edition per athlete, per finish, per season. …</p>
</section>
```
- The silver is a 1 px top rule (background-image trick keeps it a gradient, not a flat colour).
- `CopyIdButton` (client island, ≈ 400 B): 24 × 24 icon button, `aria-label="Copy card ID"`, toast
  "Copied" rendered in an `aria-live="polite"` region. Without JS the button is not rendered (the ID is
  plain selectable text).
- The "Registered" row slides in 240 ms (`translate-x-[-8px] opacity-0 → 0/1`) on `/c` only, via a CSS
  animation with `animation-fill-mode: both`; reduced motion → none.
- On stock pages the panel is the dark object on a light page — give it `shadow-(--shadow-card-stock)`.

### 4.5 TrustLine
```html
<p class="small mt-3 flex flex-wrap gap-x-3 gap-y-1 text-ink/70">
  <span>Never posted without your OK</span><span aria-hidden="true">·</span>
  <span>Deleted after delivery, on a schedule you can see</span><span aria-hidden="true">·</span>
  <span>Parent/guardian consent required</span>
</p>
```
Prepend "Never used for AI training" only when `trust.ts vertexNoTrainingVerified === true`. On arena:
`text-white/70`. Sits directly under every CTA pair and under every upload control.

### 4.6 BracketFrame
```html
<figure class="relative inline-block p-3">
  <span aria-hidden="true" class="bracket absolute inset-0"></span>
  <img class="card-face …" …>
  <figcaption class="caption mt-3">…</figcaption>
</figure>
```
```css
.bracket { --b: 22px; --w: 2px; }
.bracket::before, .bracket::after,
.bracket > i::before, .bracket > i::after {  /* render <i></i> inside the span for the other two corners */
  content: ""; position: absolute; width: var(--b); height: var(--b); border: 0 solid var(--color-accent);
}
.bracket::before { top: 0; left: 0; border-top-width: var(--w); border-left-width: var(--w); }
.bracket::after  { top: 0; right: 0; border-top-width: var(--w); border-right-width: var(--w); }
.bracket > i::before { bottom: 0; left: 0; border-bottom-width: var(--w); border-left-width: var(--w); }
.bracket > i::after  { bottom: 0; right: 0; border-bottom-width: var(--w); border-right-width: var(--w); }
```
Corners are accent on stock and on arena (the one accent use allowed on dark). Used only around process
artefacts and the promise text — never around a product for sale.

### 4.7 FictionalLabel (not disableable — no `hidden` prop exists)
- In-frame: `<span class="absolute bottom-2 left-2 rounded-[4px] bg-stock px-2 py-1 caption text-ink">Example — fictional athlete · photo and artwork generated</span>`; on arena media `bg-arena text-white`.
  Solid fill (a `Plate`), never translucent.
- Under-frame: `<p class="caption mt-2 border-t border-hairline pt-2">…</p>` spanning the media width.
- One label per frame, or one per group when the copy says "on the group" (six-finish row, four items).

### 4.8 FourFears (long) and the short strip
Long: `ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"`; each `li > a` is
`block h-full rounded-(--radius-ui) border border-hairline p-6 hover-180 hover:border-ink focus-visible:…`.
Inside: icon (`w-6 h-6 stroke-[1.5] stroke-ink fill-none`, inline SVG: eye / id-card / rotate-ccw /
card-with-qr), `h3`-level question in `question mt-4`, answer `body mt-2 text-[0.9375rem]`, link line
`small mt-4 font-medium text-ink inline-flex items-center gap-2` with an accent arrow
(`<svg class="w-4 h-4 stroke-accent stroke-[2]">`) that translates 2 px on hover.
Short strip ("Still deciding?"): one `p` in `small`, prefixed `<strong class="text-ink">Still deciding?</strong>`,
fragments as inline links separated by ` · `, placed inside the CTA block, directly above the TrustLine.

### 4.9 GateRow and the responsive table
GateRow (only `/how-it-works`): `ol class="flex flex-wrap gap-2 border-y border-hairline py-3"`; each item
`inline-flex items-center gap-2 font-display uppercase text-[0.875rem] tracking-[0.06em]` followed by a
status chip:
```html
<span class="chip chip-pass"><svg …check/></svg>PASS</span>
<span class="chip chip-fail"><svg …x/></svg>FAIL</span>
<span class="chip chip-note">NOTE</span>
```
```css
.chip { @apply inline-flex items-center gap-1 rounded-full border px-2 py-0.5 label text-ink; }
.chip-pass { border-color: var(--color-pass); background: color-mix(in srgb, var(--color-pass) 14%, transparent); }
.chip-fail { border-color: var(--color-fail); background: color-mix(in srgb, var(--color-fail) 14%, transparent); }
.chip-note { border-color: var(--color-hairline); }
```
Text is always ink (contrast); the colour is a border + 14 % tint + an SVG glyph — never the only carrier.

Responsive table (`ShippingTable`, partner rows, timeline states):
`table class="w-full border-collapse text-[0.9375rem] hidden md:table"` with `th class="label text-left py-3 border-b border-ink"`
and `td class="py-3 px-4 border-b border-hairline align-top"`; below `md` the same data renders as
`ul > li.rounded-(--radius-ui).border.border-hairline.p-4 > dl.grid.grid-cols-[7rem_1fr].gap-2` with `dt.label`.
Two-column ledgers (spec sheet, refund ladder, edition rows) use `dl` at every size (§4.14).

### 4.10 FounderNote
```html
<blockquote class="border-t border-hairline pt-6 max-w-[52ch]">
  <p class="font-sans italic text-[1.125rem] leading-[1.55] text-ink">…</p>
  <footer class="mt-4 font-sans font-bold text-ink">John Birch <span class="font-normal text-ink/70">· Game Day Edition</span></footer>
</blockquote>
```
No avatar slot. If `public/brand/founder.jpg` ever exists: 64 × 64, `rounded-full`, left of the footer line
— nothing else moves.

### 4.11 Plate (text over a photo)
`div class="rounded-(--radius-ui) bg-stock p-4 text-ink"` or `bg-arena text-white`, positioned absolutely
inside the media box; solid; never `backdrop-blur`, never `bg-*/80`.

### 4.12 StatChip (`/c` only)
```html
<div class="rounded-(--radius-ui) border border-arena-hairline bg-arena-surface px-4 py-3 text-center min-w-[5.5rem]">
  <div class="font-[family-name:var(--finish-display)] text-[1.75rem] leading-none tabular-nums text-white">18.4</div>
  <div class="label mt-1 text-white/60">PPG</div>
</div>
```
Row: `flex gap-3 flex-wrap`. Omitted entirely when `stats[]` is empty.

### 4.13 CardFlip frame (client island, ≈ 1.2 KB; MP4 fallback without JS)
```html
<div class="flip" data-flip style="--w: 300px">
  <div class="flip-scene" aria-live="polite">
    <div class="flip-card">
      <img class="flip-face card-face" src="…front.webp" alt="…" width="750" height="1050">
      <img class="flip-face flip-back card-face" src="…back.webp" alt="…" width="750" height="1050">
    </div>
  </div>
  <button type="button" class="flip-btn" aria-label="Flip the card to show the back">Tap to flip</button>
</div>
```
```css
.flip { width: min(var(--w), 100%); }
.flip-scene { perspective: 1200px; aspect-ratio: 5 / 7; }
.flip-card { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; box-shadow: var(--shadow-card-stock); }
.flip-face { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; backface-visibility: hidden; border-radius: 0 !important; }
.flip-back { transform: rotateY(180deg); }
.flip-card.play { animation: gde-flip 5s var(--ease-flip) both; }
.flip-card.play.skip-hold { animation-delay: -1.5s; }        /* user-initiated repeat: same curve, hold skipped */
.flip-card.static-back { transform: rotateY(180deg); }        /* reduced motion */
@keyframes gde-flip {                                          /* verbatim from card-flip/web/flip.html */
  0%, 30% { transform: rotateY(0deg) scale(1); }
  36%     { transform: rotateY(38deg) scale(1.03); }
  44%     { transform: rotateY(90deg) scale(1.04); }
  52%     { transform: rotateY(142deg) scale(1.03); }
  58%, 100% { transform: rotateY(180deg) scale(1); }
}
.flip-btn { @apply mt-3 inline-flex h-11 items-center rounded-full border border-ink px-4 font-display text-[0.75rem] uppercase tracking-[0.08em]; }
@media (prefers-reduced-motion: reduce) { .flip-card.play { animation: none; } }
```
- Autoplay: once, only when the component is below the fold at load and ≥ 60 % visible
  (`IntersectionObserver`, threshold 0.6, then disconnect). Above-fold instances never autoplay.
- Repeat on click / Enter / Space: toggle `play` (force reflow) with `skip-hold`; after a flip to the back
  the second activation runs the reverse (`animation-direction: reverse`). Label swaps to "Tap to flip back".
- Reduced motion: the button becomes a two-state segmented control **Front / Back** (`role="radiogroup"`),
  toggling `static-back`.
- No JS: render the MP4 (`card-flip/out/…_1080x1350.mp4` → `public/flip/<code>.mp4`) as
  `<video muted playsinline controls preload="none" poster=front>` inside `<noscript>`; the JS island
  replaces it. On arena the shadow token swaps to `--shadow-card-arena`.

### 4.14 Ledger (definition list used by the spec sheet, refund ladder, "what a registered edition is")
```html
<dl class="ledger">
  <div><dt>Size</dt><dd>2.5 × 3.5 in (63.5 × 89 mm)</dd></div>
  …
</dl>
```
```css
.ledger { @apply rounded-(--radius-ui) border border-hairline bg-stock; }
.ledger > div { @apply grid grid-cols-1 sm:grid-cols-[38%_1fr] gap-x-6 gap-y-1 px-4 py-3 sm:px-6 border-b border-hairline last:border-b-0; }
.ledger dt { @apply label pt-1; }
.ledger dd { @apply font-sans font-medium text-[0.9375rem] leading-[1.5] text-ink tabular-nums; }
```
No zebra striping, no icons in cells, no bold values. This is the "spec table as design object".

### 4.15 SiteHeader (server; menu is a client island ≈ 600 B)
- `header class="sticky top-0 z-40 h-16 border-b border-hairline bg-stock"` — solid, no blur.
- Left: link `aria-label="Game Day Edition — home"` with shield (navy, 28 px tall, `public/brand/shield.svg`
  cleaned) + wordmark (navy, 22 px tall ≈ 64 px wide) `gap-3`.
- Centre (`hidden lg:flex gap-6`): nav items `font-sans font-medium text-[0.9375rem] text-ink/70 hover:text-ink hover-180`, current page `text-ink underline underline-offset-[10px] decoration-1`.
- Right: `Button secondary sm` **Look up a card** + `Button primary sm` **Order on Etsy →** (F1). On
  `< lg` only the primary shows next to the menu button.
- Menu button (`< lg`): 44 × 44, 1.5 px stroke hamburger → opens a `dialog` sheet: full-height `bg-stock`,
  nav list in `h3`-scale Space Grotesk 700 1.25rem, then the extra links (Photo guide · Registry · FAQ ·
  Contact · Etsy shop) in body, then the CTA pair, then TrustLine. Focus trapped; Esc closes; body scroll
  locked.
- Skip link: `sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 …` "Skip to content".
- No announcement bar.

### 4.16 SiteFooter (navy band, every page)
- `footer class="bg-navy text-white"`; inner Page container `py-16 lg:py-24`.
- Top row: silver shield 48 px (SVG path with `fill="url(#silver)"` — define the gradient inline once) +
  white wordmark 20 px; right: the true-numbers strip.
- **True-numbers strip**: `ul class="mt-8 grid grid-cols-2 md:grid-cols-5 border-y border-white/15 divide-y md:divide-y-0 md:divide-x divide-white/15"`,
  each item a link `block px-4 py-4 font-sans font-bold text-[0.9375rem] hover:underline underline-offset-4`.
- Columns: `grid grid-cols-2 md:grid-cols-3 gap-8 mt-12` with `h3`-style headings in **label** class
  (`text-white/60`) — Shop / Trust / Legal; links `font-sans text-[0.9375rem] text-white/85 hover:text-white`.
- C4 full-width `small text-white/70 mt-12 max-w-none`.
- Social row: text links only (`Etsy · Instagram · TikTok · YouTube · Facebook · Pinterest`), no icons,
  from `SOCIAL_URLS`; `aria-label="Game Day Edition on {platform}"`.
- Imprint block or fallback: `small text-white/70 mt-8`, then bottom line `caption text-white/60 mt-4`.
- On `/c` the footer keeps the navy band (the only navy on the arena page) — it is the imprint surface.

### 4.17 Buttons
```css
.btn { @apply inline-flex h-12 items-center justify-center gap-2 rounded-(--radius-ui) px-6 font-sans font-bold text-[0.9375rem] leading-none whitespace-nowrap hover-180 focus-ring; }
.btn-primary { @apply bg-accent text-ink hover:brightness-[0.94] active:brightness-90; }
.btn-secondary { @apply border-[1.5px] border-ink text-ink hover:bg-ink/5; }
.btn-etsy { @apply btn-secondary; }              /* "Also on Etsy →" — never orange, never with a price */
.btn-sm { @apply h-10 px-4 text-[0.875rem]; }
.btn-arena-secondary { @apply border-[1.5px] border-white/40 text-white hover:bg-white/10; }
```
The arrow in "Order on Etsy →" / "Also on Etsy →" is the text glyph from the copy string, not an icon.
CTA pair layout: `flex flex-col sm:flex-row gap-3`; primary first; full-width on mobile.

### 4.18 Focus ring, hover, dividers
```css
@utility focus-ring { @apply outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
                      focus-visible:shadow-[0_0_0_1px_var(--color-ink)]; }
.on-arena .focus-ring { @apply focus-visible:shadow-none; }   /* accent on arena passes on its own (6.9:1) */
```
- Hover: 180 ms ease-out on colour, border, transform (≤ 2 px arrow shift), opacity. Nothing scales.
- Section divider: the opener rule (§2.5). Inside a section: `hr class="border-hairline"`. On arena:
  `border-arena-hairline`. Never a thicker or coloured rule except the silver 1 px on EditionPanel and the
  gold rule inside the SN gift note.

### 4.19 Mat and card-face
```css
.mat { @apply bg-hairline p-[8%] flex items-center justify-center; }        /* museum mat board */
.mat-arena { @apply bg-arena p-[8%] flex items-center justify-center; }
.card-face { border-radius: 0 !important; display: block; width: 100%; height: auto; }
.card-face-shadow { box-shadow: var(--shadow-card-stock); }   /* on stock/mat */
.mat-arena .card-face-shadow { box-shadow: var(--shadow-card-arena); }
```
The mat is inside a hairline plate (`rounded-(--radius-ui) border border-hairline overflow-hidden`); the
plate may be rounded, the card never is.

---

## 5. Section-by-section

Every media reference names the exact source file and its native size, the aspect box the site draws it
in, and the rendered width so the `next/image` `sizes` attribute can be written without guessing.
"Mobile" = 390 × 844 (iPhone 15/16 logical), header 64 px.

### 5.1 `/` — brand home (13 sections)

**01 · Hero** — LCP section. Gallery container, `lg:grid-cols-12 items-center`, `pt-10 lg:pt-16 pb-16 lg:pb-24`.
- Text column `lg:col-span-6`: pills (`FROM YOUR PHOTOS` fill · `REGISTERED EDITION` outline) → H1
  (Anton 4.5 rem, 2 lines: "THEIR SEASON DESERVES MORE / THAN A CAMERA ROLL.") → subhead → price line
  (`lead`: **from $32.99 digital · $84.99 printed set**, values via tokens, `tabular-nums`) → DeliveryChips
  → CTA pair (**Order on Etsy →** primary · **Look up a card** secondary) → TrustLine.
- Object column `lg:col-span-6`, the **before → after device** built in CSS, one px-per-inch:
  - BEFORE: `etsy/listing-images/03-senior-night/src/ftb-before-a.png` (970 × 1282, fictional football
    player, sideline) in a 3:4 box, rendered 168 px wide on desktop, inside a 6 px white "print border"
    (`ring-[6px] ring-white`) on the mat — a phone print pinned on a board, not tilted. In-frame
    FictionalLabel.
  - ARROW: inline SVG, `w-14 h-6 stroke-accent stroke-[2.5]`, straight shaft + open head, centred between.
    On mobile it rotates 90° and sits between the stacked frames.
  - AFTER cluster on a `mat` (4:5 box, ≈ 520 px wide desktop): poster `etsy/listing-images/04-complete-set/src/football-poster.png`
    (1296 × 1728, 3:4) at 360 px wide; card front `…/src/football-card-FS.png` (750 × 1050) at 100 px wide
    overlapping the poster's lower-left by 40 px; card back `…/src/football-card-back.png` at 100 px behind
    it offset 24 px right/down (scale: card 2.5 in → 100 px means poster 18 in → 720 px; at 360 px the poster
    is half scale — so the card must be 50 px wide, which is illegible. **Decision: the hero cluster is the
    one plate that breaks true scale**, and it says so in no words: the poster and the card are shown at
    presentation scale, and the true-scale plate lives in section 03 of `/complete-set`.) Certificate:
    `…/src/football-certificate.png` (2550 × 3300) at 120 px only if verified count-neutral; otherwise omit
    — the alt then drops "and certificate".
  - Verify the finish of the pair: the front's style line (bottom-left of the face) must read the finish
    the alt claims; if `football-card-front.png` is not Fire & Smoke use `football-card-FS.png` and confirm
    the back matches, else write the alt for the finish actually shown.
  - Poster is the LCP element: `priority`, `fetchPriority="high"`, `sizes="(min-width:1024px) 360px, 70vw"`,
    served AVIF ≈ 45 KB at 720 px. Card faces `loading="eager"` but not priority.
- **Above the fold on 390 px** (in order): header 64 · pills 28 · H1 (2.75 rem, 3 lines) 132 · subhead 58 ·
  compact device row: before 96 px wide + arrow + card front 112 px wide (height 157) · price line 26 ·
  chips 32 · primary CTA 48 · secondary CTA 48 · TrustLine 40 ≈ 830 px → the primary CTA lands at ≈ 640 px,
  both CTAs and the price are inside the first screen; the poster is not shown on mobile in the hero (the
  card front is the mobile LCP, `sizes="(max-width:1023px) 112px"`). No video, no sport tabs.
- Load motion: the object column runs one 240 ms fade + 4 px rise (`animation`, CSS only); nothing else.

**02 · Four fears** — Page container. Rule + `02 / 13`, H2, subhead, FourFears long (§4.8). 4 → 2 → 1 columns.
Cards equal height (`grid auto-rows-fr`).

**03 · Three product families** — Gallery container. Three `TierCard` (family variant):
- Trading Cards: 4:5 mat composed in CSS from `etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png`
  (front, 62 % of mat width) and `BK-SN-card-BACK.png` (back, same size, offset 30 % right and 12 % down,
  behind the front). Never the slide.
- Posters: `etsy/listing-images/02-basketball-poster/room-SN.png` (2048²) in a 4:5 box,
  `object-cover object-[50%_38%]` (keeps the framed poster and the lamp, drops floor).
- Complete Set: **not** `v3/tile-printed.jpg` (it carries a count-bearing pack face and a pack the Printed
  Set does not contain). Compose: `…/02-basketball-poster/src/BK-SN-poster.png` (1296 × 1728) at 70 % of
  mat width + the SN card front at 26 % overlapping bottom-right, on the mat. If `04-complete-set/src/`
  certificates verify count-neutral, add one at 22 % behind the card.
- Under the row, once: **Free printed Certificate of Authenticity in every shipped package.** in `lead`.
- Rendered tier image width ≈ 400 px desktop → `sizes="(min-width:1024px) 400px, (min-width:768px) 45vw, 90vw"`.

**04 · Proof before print** — **arena band**, full bleed, `py-16 lg:py-32`, `.on-arena`. Gallery container, two-up.
- Left `lg:col-span-7`: `BracketFrame` around `etsy/listing-images/03-senior-night/src/bsb-sr-proof.png`
  (1400 × 1092, ≈ 1.28 : 1 — the proof sheet with the tiled "GAME DAY EDITION" watermark and the footer
  strip "PROOF — NOT FINAL · FOR APPROVAL ONLY · GDE-SR-BSB-2026-07 · AUG 2026"), rendered 640 px wide,
  `card-face`. Caption + FictionalLabel (`text-white/70`).
- Right `lg:col-span-5`: pill `YOU SEE IT FIRST` (silver), H2 white, `h3` "OUR PROMISE" (white), C1 in
  `body text-white/90`, links as `btn-arena-secondary` (**Read the full promise**) + text link (**See how
  it's made**).
- Mobile: text first? No — the proof is the argument; media first, then text. Rule/index colours: `border-arena-hairline`, `text-white/60`.

**05 · Registered, not just printed** — Page container, two-up.
- Left `lg:col-span-5`: the **QR-ring crop** — `etsy/listing-images/01-basketball-card/src/BK-SN-card-BACK.png`
  (750 × 1050) inside a `mat-arena` box with `aspect-[4/3] overflow-hidden`, the image scaled 2.2× and
  positioned so the lower-left of the back (QR + ID + "GAME DAY EDITION · STADIUM NIGHT · FIRST EDITION ·
  2026") fills the box (`object-position: 12% 92%` — builder verifies at 2× against the face). The ring is
  drawn in CSS: `absolute w-[88px] h-[88px] rounded-full border-2 border-accent` centred on the QR — accent
  as the "arrow/ring" chrome, never baked into the image. FictionalLabel in-frame.
- Arrow (accent, as in 01) pointing right on desktop, down on mobile.
- Right `lg:col-span-6 lg:col-start-7`: H2, body (C8 sentence …), `EditionPanel` demo for
  `GDE-SN-BKB-2026-12` (data from `lib/registry/cards.ts`: Stadium Night · Basketball · 2026 · Aug 27, 2026),
  then the inline lookup: `form method="post" action="/registry"` — label **Card ID** (label class),
  input `h-14 rounded-(--radius-ui) border border-ink bg-stock px-4 idline text-[1rem] placeholder:text-ink/40`
  with `inputmode="text" autocapitalize="characters" spellcheck="false" pattern="GDE-[A-Z]{2}-[A-Z]{3}-\d{4}-[A-Z0-9]{1,3}"`,
  help text `small`, button primary **Find this edition**. Miss/private/rate-limit strings render inline
  above the field in `small text-ink` with a 1.5 px `border-l-2 border-fail pl-3` (or `border-hairline` for
  private). Link **What is a registered edition?**.

**06 · Six finishes, one athlete** — Gallery container; row of 7 tiles.
- `< lg`: `flex snap-x snap-mandatory overflow-x-auto gap-4 -mx-5 px-5 scroll-pl-5`, tile `w-[62vw] max-w-[260px] shrink-0 snap-start`.
  `≥ lg`: `grid grid-cols-7 gap-4`.
- Tile: hairline plate → `mat-arena` (the six faces are dark art; on the arena mat they read as objects)
  → card front 5:7 `card-face card-face-shadow` from `etsy/listing-images/01-basketball-card/src/BK-{SN,CA,FS,HE,SS,PR}-front.png`
  (750 × 1050; rendered ≈ 170 px desktop → serve 340 px) → under the mat: finish label as the pre-exported
  SVG (`public/finishes/labels/<code>.svg`, exported from the finish Figma file — **does not exist yet**;
  until it does, the name is set in Space Grotesk 700 0.9375 rem so the home page stays on two families),
  then the material line in `caption`.
- 7th tile: `etsy/listing-images/03-senior-night/src/bsb-sr-front.png` (750 × 1050; gold lives inside the
  art), label **Senior Night edition**, line "Gold senior edition — class year, four-year career line,
  senior quote." → `/senior-night`. It is a different athlete; the row's claim ("same athlete, same photos")
  is about the six, and the 7th tile's label makes it a separate edition.
- One FictionalLabel for the row, under it. Whole tile is the link.

**07 · Seventeen sports** — Gallery container. `grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6`
(17 tiles fill 3 rows of 6 with one gap — the gap is left empty at the end, not centred).
- Tile: hairline plate → `mat-arena` → card front 5:7 from `marketing/cards/<slug>-front.png` (900 × 1260;
  rendered ≈ 180 px → serve 360 px; 15 sports) or `public/images/cards/<slug>.webp` (600 × 840) after the
  type/hash audit → under: sport name `font-sans font-medium text-[0.9375rem]`, then for the marked sports a
  `caption`: "name + crest" or "plain back" exactly as the copy lists them.
- Pickleball and Skateboarding: no card art exists yet — the tile is the same plate with the sport name
  set in Anton 1.5 rem centred on the mat (stock mat, not arena) and no image. Never a substitute image.
- Alt per COPY §0.5; no number in alt for the five numberless sports.

**08 · How it's made — in plain words** — Page container. Rule + index, H2, the one sentence in `subhead`,
C2 in `body`, then three artefact thumbnails in `grid md:grid-cols-3 gap-6`, each a `BracketFrame` +
caption + FictionalLabel:
1. "Photo check — the verdict, as the parent reads it": **rendered as a live ledger**, not an image — the
   four rows from `/how-it-works` gate 1 (FAIL / FAIL / NOTE / PASS chips + the real `intake.ts` strings) in
   a `ledger` at `text-[0.8125rem]`. Honest (the strings are real) and crisp at any size.
2. "Reference plate — approved and locked before a single pose": `art-pipeline/out/athletes/ice-hockey/_identity.png`
   (three views on grey; ≈ 4:3), `card-face`, rendered 360 px.
3. "Watermarked proof — what you approve": `bsb-sr-proof.png` again at 360 px (same file as 04; cached).
CTA **See the full process** (secondary).

**09 · Your athlete's photos** — Page container, `lg:grid-cols-12`: text `lg:col-span-7` (H2, C3 `lead`,
the "4–10 photos and nothing else" sentence, TrustLine, the two links as text links with accent arrows);
right `lg:col-span-4 lg:col-start-9`: a small `ledger` with exactly the copy's words —
`dt` "We ask for" / `dd` "4–10 photos and nothing else." · `dt` "Never" / `dd` "No date of birth, no home
address, no school name." — no new words.

**10 · Proof wall** — Gallery container. `lg:grid-cols-12 gap-8`:
- Left `lg:col-span-5` **Example editions**: `h3` + `grid grid-cols-4 gap-3` of 8 card fronts
  (`marketing/cards/{basketball,football,baseball,softball,soccer,volleyball,cheerleading,wrestling}-front.png`,
  rendered ≈ 110 px → serve 220 px, `card-face`, in-frame FictionalLabel on the first only + C18 in `caption`
  under the grid). Link **All seventeen sports**.
- Centre `lg:col-span-4` **One rejected take, one approved**: two 5:7 frames side by side on one
  `mat-arena`, chips FAIL / PASS above each (chip recipe), titles in `question`, the reason in `small`.
  Sources: the ice-hockey rejected frame (README §20 — kit changed between shots) must be located in
  `art-pipeline/out/athletes/ice-hockey/_versions/` by its JSON note; the approved frame is
  `…/ice-hockey/hero.png` (1696 × 2528, 2:3 — crop to 5:7 with `object-cover object-top`). **If the
  rejected frame is not in the repo, this block renders text-only (chips + titles + reasons on the mat)
  until an audited export exists. Never a staged rejection.** FictionalLabel under the pair. Link
  **See all six gates**.
- Right `lg:col-span-3` **We are new**: `h3` + C16 in `body` + link **Read the promise**.
- Reviews: no block, no placeholder, no spacing reserved.
- Mobile: three stacked blocks, gallery first.

**11 · Founder note** — Page container, centred column `max-w-[52ch] mx-auto`: H2 centred, `FounderNote`
(two paragraphs), signature line **John Birch · Game Day Edition** (city omitted until supplied), the
three-segment line under it in `small` (` · ` separated, wraps to three lines on mobile), link **About the
studio**. No image (founder.jpg missing).

**12 · Occasions + closing CTA** — Gallery container.
- `grid md:grid-cols-3 gap-6` of occasion plates (`rounded-(--radius-ui) border border-hairline p-6`):
  - **Senior Night**: media strip at top — `mat-arena` 4:3 with `bsb-sr-front.png` at 48 % width (gold stays
    inside the art) — `h3` "ONE LAST HOME GAME." — line in `body` — **no DeliveryChips here** (§0.8) —
    link **Plan their senior edition** (secondary button).
  - **Christmas** (server-date gated Oct 20 → Jan 5): no media; `h3` "UNDER THE TREE, NOT ON A PHONE." —
    the order-by sentence with `{date:…}` — link **See Christmas timing** (F1 → `/complete-set`).
  - **End of season / team gift**: no media; `h3` — body — link **Email us about a team** (mailto).
- Closing: rule, H2 **ONE ATHLETE. ONE EDITION.** centred, CTA pair centred, `{chips:standard}` (same claim
  as the hero), TrustLine.

**13 · Footer** — §4.16.

### 5.2 Product family template (`/trading-cards` · `/posters` · `/complete-set`)

**1 · Hero + tiers** (Gallery container).
- Row A `lg:grid-cols-12 items-start`: text `lg:col-span-6` — pills (3, all outline; the first is `fill`
  on `/trading-cards`: `FRONT + BACK`), H1, subhead, **sport picker** (`select` styled: `h-12 rounded-(--radius-ui) border border-ink bg-stock px-4 font-sans font-medium`,
  label **Their sport** in label class; numberless note appears under it in `small` when applicable — a
  client island ≈ 500 B that rewrites the CTA hrefs and the note; without JS the default sport's links
  work), anchor line (`lead`, `/trading-cards` only), DeliveryChips, C11 in `small`.
  Object `lg:col-span-6`: **the flip hero**. `/trading-cards`: hairline plate → `mat-arena` → `CardFlip`
  at `--w: 340px` with `BK-SN-card-FRONT.png` / `BK-SN-card-BACK.png` (750 × 1050); to the right of the
  flip on `≥ md`, a second static `card-face` of the back at 55 % size so front and back are both visible
  without interaction (the flip is the delight, not the only way to see the back). Above the fold → never
  autoplays. FictionalLabel under the mat. `/posters`: `room-SN.png` in a 4:5 box (`object-[50%_38%]`)
  with the to-scale sheet below (section 3). `/complete-set`: the hero cluster from `/` §01 with the SN
  basketball set (`BK-SN-poster.png` + `BK-SN-card-FRONT/BACK.png`).
- Row B: `TierCard` × 4 (3 while the pack/XL/Ultimate rows are `enabled:false` — the grid is
  `lg:grid-cols-3` when three render, `lg:grid-cols-4` when four; never an empty slot). Tier media at 4:5:
  cards → the `_<sport>` package tiles are square (1400²) and pre-composed — use
  `art-pipeline/out/etsy-shots/packages/_football/{digital,twelve,two4}.png` only after a count/type audit;
  otherwise compose from faces as in `/` §03. Posters → `room-<FIN>.png` per tier
  (`etsy/listing-images/02-basketball-poster/room-{SN,CA,FS,HE,PR,SS}.png`, 2048²). Set → composed.
- Under the row: the certificate line (or on `/posters` the "No certificate ships with a poster alone" line
  instead) in `lead`.
- Above the fold on 390 px: pills, H1 (3 lines), subhead, the flip at 300 px wide (420 tall) — the card is
  visible in the first screen; picker, anchor line and the first tier follow.

**2 · Spec sheet** `id="spec"` — Page container; `lg:grid-cols-12`: rail `lg:col-span-3` holds rule + index,
H2 **THE SPEC SHEET.** and subhead **A table instead of adjectives.**; the `ledger` (§4.14) fills
`lg:col-span-9`. Rows verbatim from COPY §2.2/2.3/2.4 (`lib/catalog/tiers.ts`). The pack row is hidden
with the tier. This plate is the page's second hero: `text-[1rem]` values, `py-4` rows.

**3 · Front + back, registered / To scale / Everything counted** — Gallery container.
- `/trading-cards`: `lg:grid-cols-12` — left `lg:col-span-7`: the **four-shots plate**: the SN front at
  520 px on a `mat-arena` with four numbered callouts (CSS: 24 px circles `bg-stock text-ink font-sans
  font-bold text-[0.75rem]` with 1 px hairline leader lines to the four figures; positions measured on the
  flattened face, not by eye — memory: "callout must land"); right `lg:col-span-5`: H2, body, the QR-ring
  crop (as `/` §05, at 100 % column width), `EditionPanel` demo, link.
- `/posters`: **TO SCALE. THE PERSON IS THE RULER.** — plate with `etsy/listing-images/02-basketball-poster/02-two-sizes-to-scale.png`
  (2000²) cropped to the media region (the slide's baked headline must be outside the crop; if the headline
  overlaps the figure, rebuild the sheet in CSS: the 5 ft 9 in figure from `04-complete-set/src/cutout-trio-correct.png`
  — verify it is a fictional roster cutout — beside two `card-face` poster rectangles at 18 × 24 and
  24 × 36 in at one px-per-inch, figure = 69 in).
- `/complete-set`: **EVERYTHING COUNTED. DELIVERED IN STAGES.** — a horizontal timeline (`ol` of three
  stops on a hairline: `Files` · `Printed cards and poster` · `Sealed pack` (hidden with Ultimate)); each
  stop = 8 px ink dot on the rule + label (`label`) + text (`small`); vertical on mobile. Under it C10 and
  the "three tracked packages" line. Media: the file inventory is the `ledger` from section 2 — the
  `19-everything-counted.png` slide is **not** shown (baked text, orange pill with a count); instead the
  five folder rows sit beside the SN poster (`BK-SN-poster.png`, 3:4, 320 px) on a mat. `EditionPanel`
  demo → `/registry`.

**4 · One athlete, six finishes** `id="finishes"` — the same row component as `/` §06 (six tiles, no SR tile),
subhead, the SN line under it as `small` with a link. `/posters`: the poster faces per finish
(`etsy/listing-images/02-basketball-poster/room-<FIN>.png` cropped 3:4 to the framed poster, or the
`BK-<FIN>-poster.png` faces if exported) instead of card fronts.

**5 · Sports without numbers** `id="sports"` — Page container, two-up: left `lg:col-span-5`: cheerleading
front + back (`marketing/cards/cheerleading-front.png` + `-back.png`, 900 × 1260) side by side on a
`mat-arena`, 5:7 each at 46 % width; right: H2 **NO NUMBER? NO PROBLEM.**, C9 in `lead`, the checkout
note in `small`. Then the 17-sport grid (same component as `/` §07) with `id="sports"` on its H3.

**6 · Still deciding?** — the FourFears short strip inside the CTA block of section 7 (not a separate band).

**7 · Blocks + FAQ + CTA** — Page container. The four mandatory blocks as a `grid md:grid-cols-2 gap-x-12 gap-y-10`,
each `h3` (OUR PROMISE / HOW IT'S MADE / PHOTO PRIVACY / INDEPENDENT STUDIO) + `body`. Then FAQ: six
`details` elements (`group border-t border-hairline py-5 last:border-b`), `summary` in `question` with a
24 px plus/minus SVG rotating 45° (180 ms), answer `body pt-3`. FAQPage JSON-LD for these six only. Then
the closing CTA block: rule, CTA pair, short strip, DeliveryChips, TrustLine.

### 5.3 `/senior-night`
- **1 · Hero**: Gallery container, two-up. Text: pill `SENIOR EDITION · 1 OF 1` (fill — it is the one primary
  claim), H1 **ONE LAST HOME GAME.**, subhead, `{chips:seniorNight}` (the only delivery claim on this page),
  CTA pair (**Order on Etsy →** to `/go/etsy/GDE-ANY-SNSET` + **Look up a card**), TrustLine. Object:
  `etsy/listing-images/03-senior-night/01-hero.png` (2000²) **only if the media region crops clean of baked
  text**; otherwise compose on a `mat-arena`: `bsb-sr-poster.png` (poster face, verify size ≈ 3:4) at 62 %
  + `bsb-sr-front.png` (750 × 1050) at 24 % overlapping bottom-right + `bsb-sr-back.png` behind it. Gold is
  in the art; chrome stays orange/ink. FictionalLabel under the plate. Mobile: H1 first, then the object
  at full width, then chips/CTA (the first screen shows pill, H1, subhead and the top of the plate).
- **2 · Order-by calculator**: Page container; a plate `rounded-(--radius-ui) border border-hairline p-6 lg:p-10`:
  H2 **WHEN IS SENIOR NIGHT?**, label **Senior night date**, `input type="date"` (`h-14 idline text-[1rem]`),
  help `small`, button primary **Check what's in time**. Results as a `ledger` with three rows (Digital
  files / Printed set / Sealed pack) — each `dd` starts with a chip: `chip-pass` "IN TIME" is **not** in the
  copy, so the chip carries only the glyph (`aria-hidden`) and the sentence carries the meaning; the fallback
  paragraph in `lead` with the button **Gift the digital first — print the gift note**. Client island ≈ 2 KB
  (`lib/capacity.ts` is pure; it can also run on the server via a form POST — build both: `form method="get"`
  with `?date=` works without JS). C17 under the plate in `small`.
- **Printable gift note**: a `print:` only section (`hidden print:block`) — A5/letter, `border-t-2 border-gold`
  (the one gold rule, inside SN media), silver shield 40 px, heading **THIS IS YOUR SENIOR EDITION.** in
  Anton, body, sign-off line as a 1 px ink rule, small line. The `{First}` field is a text input beside the
  button on screen (label **Athlete's first name**, optional) — printed into the note.
- **3 · What makes it a senior edition**: Gallery container, `grid md:grid-cols-2 lg:grid-cols-4 gap-6`; each
  item: `mat-arena` 5:7 (back: `bsb-sr-back.png`; certificate: `bsb-sr-cert.png` only if count-neutral,
  else text only; badge: `bsb-sr-badge.png` 1600² on a 1:1 stock mat; sticker: `bsb-sr-sticker.png`
  2600 × 1280 on a 2:1 mat), `question` title, `small` text. Pack panel hidden. One FictionalLabel for the group.
- **4 · Nine sports**: Gallery container; `< lg` snap row, `≥ lg` `grid-cols-9`? No — nine tiles at 1360 px
  are 130 px each, too small for a face; use `lg:grid-cols-5` with the last row of four left-aligned. Tiles
  = SR front stills: the flip videos are the source (`card-flip/out/GDE_{FTB,VB,CHR,SOC,BSB,SFB,WRS}SR_CardFlip_1080x1350.mp4`)
  — extract frame 0 with ffmpeg into `public/sn/<slug>-front.webp` at 750 × 1050 (frame 0 is the front face on
  the arena background; crop to the card's rectangle, audit corners); basketball and ice hockey have no SR
  flip yet → text tile (Anton name on a stock mat) until exported. Tile → `/go/etsy/GDE-<CODE>-SNSET`
  where live, else the any-sport SN listing. Cheerleading tile caption "name + crest — no number".
- **5 · The whole senior class**: Page container, centred `max-w-[52ch]`, H2, body, CTA (mailto).
- **6 · Trust stack**: as product §7 (four blocks + C17) + SN FAQ (4) + CTA pair + `{chips:seniorNight}` + TrustLine.

### 5.4 `/how-it-works`
- **1 · Hero**: Page container; pills `SIX GATES` (fill) · `YOU SEE IT FIRST` (outline); H1; C2 as `lead`;
  the second paragraph `body`. No media in the hero — the gates are the media.
- **2 · Six gates** `id="gates"`: `GateRow` (§4.9) as the sticky sub-nav (`sticky top-16 bg-stock z-30 border-b border-hairline`),
  each name an anchor link to its gate. Then the gates as an `ol` with a vertical hairline spine
  (`relative before:absolute before:left-[1.25rem] lg:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-hairline`);
  each gate a `details open` (accordion that starts open — content never hidden without JS) with
  `summary`: gate index in Anton 2.75 rem (`01`…`06`) + name Anton 1.5 rem + the artefact name in `small`.
  Body `lg:grid-cols-12`: artefact `lg:col-span-6` in a `BracketFrame`, text `lg:col-span-5 lg:col-start-8`.
  Artefacts: 1 the verdict ledger (rows with chips, the real strings; footer line + link) · 2
  `art-pipeline/out/athletes/ice-hockey/_kit.png` (2048², front + back kit plate; audit maker marks — per
  the 2026-09-02 rule a real mark copied from the photo stays) · 3 `_identity.png` (the three views) ·
  4 four frames `hero.png`, `action2.png`, `action3.png`, `back.png` (1696 × 2528 each) as a 4-up strip
  `grid grid-cols-4 gap-2`, each 2:3 `card-face` · 5 **verification sheet composed in CSS**: `grid grid-cols-2`
  — `hero.png` | `_kit.png` with labels FRAME / PLATE (label class) under each and a 1 px hairline between —
  this is what `art:diff` draws; if the pipeline's own diff export is preferred run
  `npm run art:diff -- --athlete ice-hockey` and use its output · 6 `bsb-sr-proof.png`. C13 under each
  frame. Side note on gate 2 in a `Plate` (stock) with `small`.
- **3 · The rejected take**: H2, subhead, the pair from `/` §10 at full width (two 5:7 frames at 300 px each
  on a `mat-arena`), the sentence under in `lead`.
- **4 · The effort sentence**: a full-width ruled band (`border-y border-hairline py-12`) with the sentence
  in `h2` centred, `max-w-[28ch]`. Nothing else in the band.
- **5 · What you approve, and when**: the state timeline — `ol` horizontal on `≥ lg` (`flex` of 10 stops on a
  hairline; each stop a 10 px ink dot, state name in Anton 0.875 rem uppercase, the approval notes in
  `caption` under; the two "your approval" stops get an outline pill `YOUR APPROVAL` — new words? No: the
  copy has "*your approval, by email*" / "*your approval, on your order page*" — render those exact phrases
  in `caption italic`); vertical `< lg` with the spine. Under it C20 + the revision line + C10 + the reminder line.
- **6 · Printing partners**: three-row responsive table (§4.9): Partner (C19 verbatim) · What it prints; the
  labs line in `lead`; C4 in `body`.
- **7 · FAQ** (6) + CTA block as product §7.

### 5.5 `/guarantee`
- H1, subhead; C1 inside a `BracketFrame` around a stock `Plate` (`p-6 lg:p-10 lead max-w-[60ch]`) — the
  bracket corners around text: the audited promise. H2 **WHAT THAT MEANS, EXACTLY.** + four ruled rows
  (`divide-y divide-hairline`), each `question` lead phrase + `body`.
- Shipping table: `ShippingTable` (5 columns ≥ md; stacked records < md). Cells marked "(per lab)" keep the
  parenthetical inline in `text-ink/70`. Under: C11 · C12 · C10 in `small` stacked.
- **WHERE A REFUND HAPPENS.**: the one sentence in `lead`.
- **THE REFUND LADDER.** `id="refunds"`: `ledger` (2 columns) — the "stage" key column at 38 %.
- **We are new — long**: `FounderNote`-styled block (not italic — it is "we" voice; use `body` in a
  `border-t border-hairline pt-6`), signature **— John Birch**, link **About the studio**. CTA pair + TrustLine.

### 5.6 `/photo-guide`
- H1, subhead, pills `4–10 PHOTOS` (fill) · `ORIGINALS, NOT SCREENSHOTS` (outline), C5 as `lead`.
- **Checklist**: `ol` of nine `li` rows (`grid grid-cols-[2.5rem_1fr] gap-4 border-t border-hairline py-5 last:border-b`):
  the index in Anton 1.5 rem (`01`…`09`), the bold lead phrase in `question`, the explanation `body`. The
  intake mapping in parentheses is **not rendered** (builder note only). "What we never ask for" as a
  `ledger` with one row. The same `Checklist` component is reused on the F2 upload page.
- **GOOD, AND NOT YET.**: `public/images/photo-guide.webp` (1536 × 1024, six panels) at full Page width in a
  hairline plate, `card-face`; under it a `grid grid-cols-3 gap-2` of six captions aligned to the panels:
  top row three `chip-pass` + label, bottom row three `chip-fail` + label (the chips carry glyph + PASS/FAIL
  text; captions in `caption`). FictionalLabel under. If the panels' order in the image does not match the
  copy's order, the captions follow the image and the mismatch is reported — captions are never moved to
  make the copy fit.
- Closing line `lead`; buttons **Print this checklist** (secondary; `window.print()` — no-JS fallback:
  the browser's print works on the same page) · **See how photos become a card** (secondary) · CTA pair +
  TrustLine. Print stylesheet: `@media print { header, footer, .no-print, figure { display:none } .ledger, ol { break-inside: avoid } }`.

### 5.7 `/about`
- **1**: H1, subhead; founder card = a `ledger`-style plate with rows Name / Role / Contact (John Birch ·
  Designer and founder · hello@ …; city row omitted) — no photo. Story as `body` paragraphs with the bold
  leads in `font-medium`; `FounderNote` (italic, signed) after it.
- **2 · Two essays**: `grid lg:grid-cols-2 gap-x-12 gap-y-16`; each H2 + `body`; the second ends with a text
  link → `/how-it-works`.
- **3 · Independence**: H2, C4, C6, the crest sentence in `lead`.
- **4 · Studio and partners**: H2, lead sentence, the three C19 rows as a responsive table (pack row hidden),
  the labs sentence in `lead`.
- **5 · The legal entity**: H2 + imprint or fallback in `body`; the Lithuania line.
- **6 · The numbers that are true today**: `ul class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-y border-hairline divide-x divide-hairline"`
  (the pack item is hidden until D18 → five items); each `a` block `px-4 py-8`: the numeral in Anton 2.75 rem
  (`17`, `7`, `27`, `2026`, `2.5 × 3.5`) with the rest of the string in `small` under it — the numeral is
  extracted from the copy string, not invented ("Registry live since August 2026" → numeral `2026`, text
  "Registry live since August"). CTA pair + TrustLine.

### 5.8 `/registry`
- **1 · Lookup**: the page opens on the form. Page container, centred `max-w-[40rem]`: H1 **LOOK UP A CARD.**,
  subhead, the form (label **Card ID**, input `h-16 idline text-[1.125rem] tracking-[0.08em]` with the
  mask hint as `placeholder`, help `small`, button primary full-width on mobile). Errors inline as `/` §05.
  Demo line `small` with the ID as a link. No list of cards anywhere; no "recent" anything.
- **2 · What a registered edition is**: **the ID anatomy diagram** — HTML only:
  ```
  GDE - SN - BKB - 2026 - 12
        └style └sport └season  └number / E##
  ```
  Implemented as a `div class="flex justify-center gap-1 idline text-[1.5rem] md:text-[2rem]"` of five
  segments; under each segment a `border-t border-ink pt-2 caption` label (style · sport · season · number),
  with the dashes in `text-ink/40`. Then the finish-code legend as a `ledger` (SN Stadium Night … SR Senior
  Night) and the remaining paragraphs (**How to read the ID**, **One registered edition …**, **What the
  registry stores**, **The certificate**, **How long**, **Visibility**) as a `ledger` with the bold lead as
  `dt` and the sentence as `dd` — the archive rulebook.

### 5.9 `/faq`
Page container; H1 + subhead; a sticky-on-desktop group index on the left rail (`lg:col-span-3`, `sticky top-20`,
links in `small`); groups in `lg:col-span-9` each with an H2 and `details` rows (as product §7). FAQPage
JSON-LD here only. The F1-only and D18-gated questions render by flag.

### 5.10 `/contact`
Page container, centred `max-w-[44rem]`: H1 **TALK TO A PERSON.**, subhead with the email as a link
(`font-medium underline underline-offset-4`), primary button **Email hello@gamedayedition.com** (mailto), then
the topics as a `ledger` (`dt` Etsy orders / Lost your order link? / Card pages / Report a card page / Teams
and clubs / Photos / Press and partnerships; `dd` the sentences). Response-window sentence only if committed.
Imprint block or fallback. No form.

### 5.11 `/c/[cardId]` — the QR digital twin (arena; mobile-first; JS < 300 KB)
Route layout loads only the record's finish pair via `next/font` (all seven pairs declared at module scope
with `preload: false`; the wrapper gets `${display.variable} ${supporting.variable}` and sets
`--finish-display` / `--finish-supporting`). Page is `bg-arena text-white min-h-dvh .on-arena`; Page container.
1. **Identity header** (`pt-6`): row — silver shield 28 px left, pill `REGISTERED EDITION` (silver) right
   (SR: `SENIOR EDITION · 1 OF 1`). Name `font-[family-name:var(--finish-display)] uppercase text-[2.25rem] md:text-[3.5rem] leading-[0.95] mt-4 text-balance`;
   under it a 4 px bar 48 px wide in `team/primary` (or silver gradient when the record has no colours);
   meta line in the supporting font `text-[0.9375rem] tracking-[0.06em] uppercase text-white/80 mt-3`
   (`#12 · GUARD · CEDAR RIDGE BEARS · 2026`; no `#` for numberless sports and adults). Team colour on
   text only if contrast ≥ 4.85 : 1 on arena, else white text + the coloured bar. Demo: C13 in `caption text-white/60`.
2. **Flip hero** (`mt-6`): `CardFlip` at `--w: min(340px, 82vw)` centred, `mat-arena` omitted (the page is
   the mat), `--shadow-card-arena`; faces from `public/cards/<cardId>/front.webp|back.webp` (generated by
   `card:new` at 750 × 1050 from the exports; demo records from `etsy/listing-images/01-basketball-card/src/`).
   Sits partly above the fold on 390 px → **no autoplay**; "Tap to flip" pill under it. `loading="eager"`,
   the front is the LCP (`priority`), `sizes="(max-width:768px) 82vw, 340px"`.
3. **Edition panel** (`mt-8`): §4.4 with the rows in COPY §2.15 order, `Copy ID`, the sentence, C15 in
   `small text-white/70`, "Last updated" in `caption`, link. SR adds the EDITION row.
4. **Stats**: label **SEASON STATS** (SR: **CAREER HIGHS**) in label class; `StatChip` row (≤ 3); highlight
   line `body text-white/90`; **CLASS OF 2027** in the supporting font when allowed; SR rows in the
   supporting font, the quote in the supporting italic (Oswald has no italic → `font-style: italic` synthesised
   is forbidden; render the SR quote in Playfair Display italic instead — Playfair ships an italic).
5. **Downloads and share** (`mt-8`): label **DOWNLOADS**; `ul` of `btn-arena-secondary btn-sm` links (demo:
   front PNG · back PNG · flip GIF; real: the five wallpapers when `delivered`, note in `caption`). Share row:
   **Copy link** (island; toast) · **Share** (`navigator.share` when present, otherwise hidden).
6. **About this finish**: two lines in `small text-white/80` + link.
7. **CTA row by channel**: `demo-etsy` → one `btn-arena-secondary` **Get yours on Etsy →**; otherwise primary
   (orange with ink text — the one orange element on the arena page) + `btn-arena-secondary` **Also on Etsy →**.
   No prices, no coupons.
8. **Privacy and control footer** (`mt-12 border-t border-arena-hairline pt-6 small text-white/70`): the
   visibility sentence, **Report this card** (mailto link), the manage line, demo caption. Then the site
   footer (navy).
- Unknown ID → the branded 404 variant with the inline lookup on arena; `private` → the one neutral sentence
  + **Look up a card**; `deleted` → 410 copy. OG image: the front on arena with the edition strip (no name on
  unlisted). Reduced motion: the Front/Back switch. Total client JS: the flip island + copy/share islands ≈ 3 KB.

### 5.12 `not-found.tsx`, `error.tsx`
Stock page, centred `max-w-[40rem]`: H1, body, the inline lookup (404) or the **Try again** button (error),
links as secondary buttons. Nothing decorative.

---

## 6. Imagery plan

### 6.1 Listing slides (2000 × 2000) → layout
- **Never whole.** A slide enters the site only as a text-free crop, drawn into one of three aspect boxes:
  `aspect-[4/5]` (tier and occasion media), `aspect-[4/3]` (detail crops such as the QR ring), `aspect-square`
  (badges). Crop with `object-cover` + an explicit `object-position` measured against the slide at 2×; write
  the position into the component as a constant with the source file name beside it.
- Preferred over any crop: the `src/` faces. The slide crops that remain worthwhile: `02-front-back-registered`
  (none — the QR ring is drawn in CSS over the back face), `04-transformation` (none — the device is rebuilt
  from `ftb-before-*.png` + faces), `02-two-sizes-to-scale` (media region only, or rebuilt).
- `next/image` with `quality={80}`, AVIF first; every image has `width`/`height` from `sips` so nothing
  shifts; `sizes` written per rendered width (§5 gives each).

### 6.2 Card faces
- Sources: `etsy/listing-images/01-basketball-card/src/BK-*.png` and `04-complete-set/src/*-card-*.png`
  (750 × 1050), `marketing/cards/<sport>-front|back.png` (900 × 1260), `public/images/cards/*.webp` and
  `public/images/finishes/*.webp` (600 × 840). All are 5 : 7 = 2.5 : 3.5 exactly — the aspect box is always
  `aspect-[5/7]`, the image `object-contain` (never cover) so no edge of the card is ever cut.
- Radius 0, enforced by `.card-face { border-radius: 0 !important }` and by an audit of the PNG corners
  (the four corner pixels must be opaque; a transparent corner means the export baked a radius — reject).
- Shadow: `--shadow-card-stock` on stock/hairline mats, `--shadow-card-arena` on arena mats. One shadow per
  face; overlapping faces (front + back) each keep their own shadow; the back is behind and 6 % smaller.
- Rendered widths and served widths: hero 300–340 px (serve 750), tier/finish tiles 170–220 px (serve 440),
  sport grid 180 px (serve 360), thumbnails 96–120 px (serve 240). Never upscale a 600 px source past 300 px rendered.
- Faces always sit on a mat (hairline or arena); the mat is what makes the site's stock read as paper and
  the card as an object.

### 6.3 Posters and room shots
- Poster faces (`BK-SN-poster.png`, `football-poster.png`, 1296 × 1728) are 3 : 4 = 18 × 24; box `aspect-[3/4]`,
  `object-contain`, `card-face`, same shadow rules.
- Room shots (`room-<FIN>.png`, 2048²): `aspect-[4/5]` with `object-[50%_38%]`; on `/posters` hero the same;
  never a room shot as a thumbnail under 240 px (the poster inside becomes unreadable).

### 6.4 Before → after device
- BEFORE frame: 3 : 4 box, the phone photo `object-cover`, a 6 px white ring (a print), FictionalLabel
  in-frame at the bottom-left, on a hairline mat. Sources: `03-senior-night/src/ftb-before-a.png` (970 × 1282),
  `ftb-before-b.png` (970 × 1224). No tilt, no tape, no shadow — it is pinned flat.
- ARROW: inline SVG `viewBox="0 0 56 24"`, path `M2 12h46 M40 4l8 8-8 8`, `stroke-accent stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round`;
  `w-14 h-6` desktop, rotated 90° and `w-6 h-14` on mobile; `aria-hidden`.
- AFTER: the product cluster on a `mat`; poster + card faces per §5.1-01; the cluster never contains a pose
  render, a cutout or a pack face.
- Layout: `grid grid-cols-[auto_auto_1fr] items-center gap-4` desktop; `flex flex-col items-center gap-3` mobile.

### 6.5 The 17-sport grid
`grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6`; tile = hairline plate (`rounded-(--radius-ui) border border-hairline overflow-hidden`)
→ `mat-arena aspect-[5/7]`? No — the mat is `aspect-[4/5]` with the 5 : 7 face at 76 % width inside, so the
tile's plate is a consistent 4 : 5 and the card floats with equal margins. Name + numberless caption under.
Text-only tiles for pickleball and skateboarding on a stock mat. Order is the copy's order. Tile = link.

---

## 7. Motion and interaction

- **The single signature move is the flip** (§4.13). One autoplay per page at most, only below the fold,
  only once; every other flip is user-initiated. `/c` has no autoplay.
- **Reveal-on-scroll: none.** Nothing is hidden or offset waiting for JS. The only load animation is the
  hero object column's 240 ms fade/rise, written as a CSS `@keyframes` on the element (content is painted
  from frame 0 at 0 opacity for 240 ms — acceptable; it is not the LCP text).
- **Hover** (180 ms ease-out): borders hairline → ink; link arrows translate 2 px; buttons `brightness(0.94)`;
  plates never lift; images never zoom.
- **EditionPanel "Registered" row**: 240 ms slide-in on `/c` only.
- **Accordion (`details`)**: the plus glyph rotates 45° in 180 ms; content appears at once (no height animation).
- **Sticky**: header everywhere; `GateRow` on `/how-it-works`; the FAQ group index on desktop.
- **Reduced motion**: flip → Front/Back switch; hero rise → none; row slide-in → none; glyph rotation → none.
  `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`
  plus the explicit flip switch.
- No parallax, no scroll-jacking, no marquee, no autoplaying video anywhere, no cursor effects.

---

## 8. Risks, tradeoffs, a11y and performance

### Risks / tradeoffs of this direction
- **Cold at first glance.** A catalogue can read as distant to a parent. Mitigation is structural: the four
  fears sit second on the home page, the founder note is text-first and italic, and every CTA carries the
  short "Still deciding?" strip. If the owner wants more warmth, the lever is photography (a real founder
  photo, real "in the wild" shots when consented) — not softer type or rounded cards.
- **Whitespace costs scroll on mobile.** The home page is ≈ 9–10 screens on a 390 px phone. Section
  padding steps down to 64 px on mobile and the six-finish/nine-sport rows are horizontal to contain it.
- **Asset debt is real.** No slide can be used whole; the hero cluster, the set tile, the to-scale sheet and
  the six-finish labels all need composition or exports (§9). The direction is only as premium as the
  corner audit is strict.
- **Two fonts on a "distinctive" brief.** Anton + Space Grotesk are fixed by §2.2. The distinctiveness here
  comes from scale contrast (4.5 rem Anton against 11 px Barlow labels), the ruled page, and the plates —
  not from the faces themselves.
- **The 5 s flip on tap** would feel unresponsive; the `-1.5 s` delay keeps the same curve and skips the
  hold (§4.13). Owner may prefer the literal 5 s.

### Accessibility
- Contrast: ink on stock 15.9 : 1; `text-ink/70` on stock 6.2 : 1; white on navy 14 : 1; white/60 on arena
  7.2 : 1; ink on accent 5.8 : 1 (white on accent 2.85 : 1 — never); `--muted` reserved for large text (§0.5).
  Focus ring composite ≥ 3 : 1 (§4.18). Team colours on `/c` gated at 4.85 : 1 per §2.1.
- Every image has the §0.5 alt; decorative arrows/brackets/rules are `aria-hidden`.
- Headings: one H1; section H2s in order; block titles as H3. Landmarks: `header`, `main#content`,
  `footer`, `nav aria-label`.
- Forms: visible labels (Barlow), `autocomplete="off"` on the ID field, errors in an `aria-live="polite"`
  region and referenced by `aria-describedby`.
- Flip: keyboard-operable button, announced state, reduced-motion switch, `<noscript>` video.
- Tap targets ≥ 44 px for buttons; ≥ 24 px for inline icon buttons with 8 px spacing.
- `details/summary` for accordions; no custom ARIA where native works.
- Print: `/photo-guide` and the SN gift note have print styles; nothing else needs them.

### Performance
- **LCP**: `/` desktop = the hero poster (360 px rendered, 720 px served AVIF ≈ 45 KB, `priority`);
  `/` mobile = the hero card front (112 px rendered, 240 px served ≈ 12 KB); product pages = the flip's
  front face (340 px, 750 px served ≈ 60 KB); `/c` = the front face. One `<link rel="preload">` per page,
  emitted by `next/image priority`. Target LCP < 1.8 s on 4G.
- Fonts: Anton 400 (≈ 20 KB woff2), Space Grotesk 400/500/700 (≈ 3 × 22 KB), Barlow 600 (≈ 20 KB), all
  self-hosted by `next/font`, `display: swap` with metric-adjusted fallbacks (CLS ≈ 0). `/c` adds one
  finish pair (2 files) with no preload.
- Images: all through `next/image`; sources copied into `public/` at build by a script that (a) hashes,
  (b) checks aspect ratio matches the declared type (5 : 7 for cards, 3 : 4 posters), (c) checks opaque
  corners, (d) refuses any file from `public/images/sport-examples/` or any Nia Brooks export.
- Home page image weight budget ≈ 1.3 MB total across all sections (17 sport tiles ≈ 17 × 14 KB, six
  finishes ≈ 6 × 24 KB, eight examples ≈ 8 × 10 KB, hero ≈ 80 KB, proof ≈ 90 KB, room ≈ 70 KB); everything
  below the fold `loading="lazy"`.
- JS: server components throughout; islands: menu (0.6 KB), flip (1.2 KB), copy/share (0.4 KB), sport
  picker (0.5 KB), SN calculator (2 KB). `/c` < 300 KB is met with ≈ 90 KB of framework + 3 KB islands.
- CSS: Tailwind 4 with the `@theme` above; no runtime CSS-in-JS.

---

## 9. Asset manifest (verified 2026-09-06) and the audit each needs

| Use | File | Native px | Audit before `public/` |
|---|---|---|---|
| Hero before | `etsy/listing-images/03-senior-night/src/ftb-before-a.png` | 970 × 1282 | fictional roster ✓; corners; C13 in frame |
| Hero before (alt) | `etsy/listing-images/03-senior-night/src/ftb-before-b.png` | 970 × 1224 | same |
| Hero poster | `etsy/listing-images/04-complete-set/src/football-poster.png` | 1296 × 1728 | finish name for alt |
| Hero card front | `etsy/listing-images/04-complete-set/src/football-card-FS.png` (or `football-card-front.png`) | 750 × 1050 | finish matches alt; corners |
| Hero card back | `etsy/listing-images/04-complete-set/src/football-card-back.png` | 750 × 1050 | finish matches front; corners |
| Hero certificate (optional) | `etsy/listing-images/04-complete-set/src/football-certificate.png` | 2550 × 3300 | **count-neutral or omit** |
| Card family / flip / registry | `etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png`, `BK-SN-card-BACK.png` | 750 × 1050 | corners; QR resolves to `/c/GDE-SN-BKB-2026-12` |
| Six finishes | `etsy/listing-images/01-basketball-card/src/BK-{SN,CA,FS,HE,SS,PR}-front.png` | 750 × 1050 | corners; label SVGs to export |
| Senior tile / SN page | `etsy/listing-images/03-senior-night/src/bsb-sr-front.png`, `bsb-sr-back.png` | 750 × 1050 | corners |
| SN items | `bsb-sr-badge.png` 1600², `bsb-sr-sticker.png` 2600 × 1280, `bsb-sr-cert.png` (count check), `bsb-sr-poster.png` (measure) | — | count-neutral for cert |
| Proof | `etsy/listing-images/03-senior-night/src/bsb-sr-proof.png` | 1400 × 1092 | none (watermark is the point) |
| Room (posters) | `etsy/listing-images/02-basketball-poster/room-{SN,CA,FS,HE,PR,SS}.png` | 2048² | type = room shot |
| Poster face | `etsy/listing-images/02-basketball-poster/src/BK-SN-poster.png` | 1296 × 1728 | — |
| To-scale | `etsy/listing-images/02-basketball-poster/02-two-sizes-to-scale.png` | 2000² | text-free crop or rebuild |
| 17 sports | `marketing/cards/<slug>-front.png` (15) / `public/images/cards/*.webp` (600 × 840) | 900 × 1260 | hash + aspect + corners |
| Cheer pair | `marketing/cards/cheerleading-front.png`, `-back.png` | 900 × 1260 | alt without a number |
| Reference plate | `art-pipeline/out/athletes/ice-hockey/_identity.png` | ≈ 4 : 3 | fictional ✓ |
| Kit plate | `art-pipeline/out/athletes/ice-hockey/_kit.png` | 2048² | maker marks per 2026-09-02 rule |
| Four shots / verification | `art-pipeline/out/athletes/ice-hockey/{hero,action2,action3,back}.png` | 1696 × 2528 | judge audit on record |
| Rejected take | `art-pipeline/out/athletes/ice-hockey/_versions/…` (locate by JSON note) | — | **must be the real rejection, else text-only** |
| Photo guide | `public/images/photo-guide.webp` | 1536 × 1024 | panel order vs captions |
| Flip video fallback | `card-flip/out/GDE_<CODE>_CardFlip_1080x1350.mp4` (+ `_540.gif` 540 × 675) | — | copy to `public/flip/` |
| SN sport stills | frame 0 of `card-flip/out/GDE_{FTB,VB,CHR,SOC,BSB,SFB,WRS}SR_CardFlip_1080x1350.mp4` | crop to 5 : 7 | corners |
| Brand | `public/brand/shield.svg` (307 × 333), `wordmark.svg` (604 × 206) | — | **strip artifact rects**; silver variant via gradient fill |
| Do not use | `04-complete-set/v3/tile-printed.jpg` (pack count), any whole slide, `public/images/sport-examples/*`, Nia Brooks exports, SN/CA wallpapers without safe zones | | |

Missing and to be produced: `public/finishes/labels/<code>.svg` (7, from Figma), `public/brand/founder.jpg`
(owner), pickleball/skateboarding card fronts (pipeline), SN stills for basketball/ice hockey, a real
rejected-frame export (or the block stays text-only).

---

## 10. Decisions for the owner (defaults applied in this brief)

1. `--muted` fails AA on stock for small text (4.37 : 1). Default: small secondary text uses `text-ink/70`;
   `--muted` only for ≥ 24 px. Alternative: change the token to `#62666C` (5.2 : 1).
2. Senior Night chip on `/` §12 vs "one delivery claim per page". Default: no chip on the home SN card.
3. Tap-to-flip timing. Default: same 5 s curve with `animation-delay: -1.5s` (hold skipped). Alternative:
   the literal 5 s including the 1.5 s hold.
4. Hero cluster scale. Default: presentation scale in the `/` hero (the one plate that breaks one-px-per-inch);
   true scale on `/complete-set` §3 and `/posters` §3.
5. The `/` §03 Complete Set tile is composed from faces, not `tile-printed.jpg`. Confirm, or supply a
   count-neutral set tile without a pack.
6. Finish-name SVG labels: export from Figma now (home stays on two font families) or accept Space Grotesk
   700 for the names until F3.
7. Eyebrows: none invented; the section index numeral is the only eyebrow device. Confirm.
