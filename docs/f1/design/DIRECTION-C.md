# DIRECTION C — "Trust-first studio"

Visual brief for the F1 rebuild of gamedayedition.com. Written 2026-09-06 against
`docs/SITE-BUILD-SPEC-2026-09.md` §2 / §4 / §6 and `docs/f1/COPY.md`. Everything in §2 of the
spec is a fixed constraint here; this document decides how those constraints are *used*.
Copy is never restated — every string on a page is the COPY.md string (C1–C20 canon IDs are
referenced by ID). Prices, chips, counts and dates come from `lib/catalog/*` tokens, never typed.

---

## 1. Thesis

**The site is the studio's case file, opened for a parent.** Every claim on the page sits next
to the thing that proves it — the photo-check verdict as the parent reads it, the kit plate, the
reference plate, the frame beside its plate, the watermarked proof — laid flat on warm paper and
pinned with the same orange corner brackets the listing videos use to say "this was checked".
The founder is present as a person who signs things, not a brand voice; the rhythm is calm,
text-first, one idea per band, and every band is legible at a glance at 390 px because a parent
decides on a phone between two games.

**What makes it not generic.** (1) Its layout language is an *evidence sheet*, not a SaaS
landing page: hairline crosshair rules, Barlow record lines (`GDE-SN-BKB-2026-12 · REGISTERED
AUG 27, 2026`), PASS/FAIL outline chips, artefacts with brackets and captions — a form parents
have never seen a poster shop use. (2) Dark objects on light paper: the only dark surfaces on a
stock page are the things that are actually dark in life — the card, the proof, the
EditionPanel — so the product carries the drama and the chrome stays quiet. (3) Before→after is
the one recurring device, always drawn the same way (flat, straight, orange arrow, `after` is
always a real card or poster), so the whole site reads as one argument: *your photo became
this, and here is every step in between*. (4) The Etsy slides already speak this dialect
(stock, ghost shield, brackets, `06 / 20` counters) — the site inherits it instead of inventing a
second brand. Nothing here is a purple gradient, a floating glass card, a testimonial carousel
or a hero video; there are no reviews at all until a real one exists (spec §6, D8).

---

## 2. Layout system

### 2.1 Tokens (`app/globals.css`, Tailwind 4 `@theme`)

```css
@import "tailwindcss";

@theme {
  /* §2.1 palette — fixed */
  --color-stock: #F4F3EF;
  --color-hairline: #E8E7E2;
  --color-ink: #14191F;
  --color-muted: #6E7278;        /* 4.36:1 on stock — large/bold text, rules, icons only */
  --color-muted-text: #5F636A;   /* 5.4:1 on stock — any muted text under 24 px (a11y addition) */
  --color-accent: #FF6B2B;       /* chrome only: primary buttons, focus ring, arrow, pill fill, brackets, QR ring */
  --color-navy: #172C50;
  --color-arena: #080C12;
  --color-arena-surface: #14191F;
  --color-arena-hairline: rgb(255 255 255 / 0.08);
  --color-arena-muted: rgb(255 255 255 / 0.64);
  --color-pass: #4EAF90;
  --color-fail: #D8554B;
  --color-gold: #C9A227;         /* Senior Night media only */
  --color-paper: #FFFFFF;        /* "sheet" panels laid on stock */

  --font-display: var(--font-anton), Impact, "Arial Narrow Bold", sans-serif;
  --font-sans: var(--font-space-grotesk), system-ui, sans-serif;
  --font-label: var(--font-barlow), var(--font-sans);

  --container-page: 75rem;   /* 1200 px */
  --container-wide: 80rem;   /* 1280 px, media-only bands */
  --container-read: 36rem;   /* 576 px ≈ 65ch at 17 px Space Grotesk */

  --radius-ui: 12px;         /* UI panels, buttons, inputs */
  --radius-card: 0px;        /* anything depicting a card: NEVER overridden */

  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-flip: cubic-bezier(0.4, 0, 0.2, 1);   /* card-flip/web/flip.html */
  --duration-hover: 180ms;
  --duration-panel: 240ms;
  --duration-flip: 5000ms;

  --shadow-card-stock: 0 1px 0 rgb(20 25 31 / .06), 0 18px 40px -16px rgb(20 25 31 / .38);
  --shadow-card-arena: 0 30px 80px rgb(0 0 0 / .65);
  --shadow-sheet: 0 1px 0 rgb(20 25 31 / .04), 0 10px 30px -18px rgb(20 25 31 / .25);
  --silver: linear-gradient(20deg, #FFFFFF 0%, #C7D0DC 50%, #FFFFFF 100%);
}
```

Fonts (`lib/fonts.ts`, `next/font/google`): `Anton({ weight: "400" })` → `--font-anton`;
`Space_Grotesk({ weight: ["400","500","700"] })` → `--font-space-grotesk`;
`Barlow({ weight: "600" })` → `--font-barlow`. All `display: "swap"`, `subsets: ["latin"]`,
`preload: true`, `adjustFontFallback: true`. The seven finish pairs live in
`lib/fonts/finishes.ts` with `preload: false` and are applied only by `/c/[cardId]` (§5.14).

### 2.2 Containers and grid

| Name | Class | Use |
|---|---|---|
| Page | `mx-auto w-full max-w-page px-5 sm:px-8 lg:px-10` | every section's content box |
| Wide | `mx-auto w-full max-w-wide px-0 sm:px-6` | snap rows, 17-sport grid, room shots |
| Read | `max-w-read` | body copy, essays, FAQ answers, checklist rows |
| Grid | `grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:gap-x-8` | every two-column band |
| Evidence split | text `lg:col-span-5`, artefact `lg:col-span-7` | the default asymmetric split; artefact side alternates band by band (`lg:order-first` on even bands) |
| Even split | `lg:col-span-6` ×2 | before→after pairs only |
| Tile rows | `grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4` | TierCards, FourFears, occasions |

Gutters: `gap-x-6 lg:gap-x-8`; vertical `gap-y-8 lg:gap-y-10`. Nothing sits closer than 24 px to
anything unrelated; related things (label→value, caption→image) sit at 8–12 px.

### 2.3 Spacing scale (Tailwind steps)

`2 (8) · 3 (12) · 4 (16) · 6 (24) · 8 (32) · 10 (40) · 12 (48) · 16 (64) · 20 (80) · 24 (96) · 28 (112)`.
Nothing else. Section padding **`py-16 md:py-20 lg:py-28`**; hero **`pt-8 pb-14 md:pt-14 md:pb-20 lg:pt-20 lg:pb-28`**;
a "sheet" (white panel) inside a section: `p-5 sm:p-8 lg:p-10`.

### 2.4 Section rhythm and bands

Bands are all stock unless the spec names a dark one. Contrast comes from *objects*, not from
alternating band colours. Where the page needs a visual pause, a **sheet** (`bg-paper border
border-hairline rounded-[var(--radius-ui)] shadow-[var(--shadow-sheet)]`) is laid on the stock
like a page on a desk — never a grey band.

| Band | Background | Where |
|---|---|---|
| stock | `bg-stock text-ink` | default |
| sheet-on-stock | stock section containing one `bg-paper` panel | evidence sections (home §8, §10; how-it-works gates; guarantee tables) |
| arena | `bg-arena text-white` | home §4 proof band; `/c` entire page; proof/flip scenes |
| navy | `bg-navy text-white` | footer only |

Home sequence: stock ×3 → **arena** → stock ×8 (three of them with sheets) → **navy** footer.
Two dark bands in the whole scroll — the proof and the imprint — which is exactly what you want a
parent to remember.

**Dividers.** Between sections on stock: a full-bleed 1 px `hairline` rule with a 24 px × 1 px
ink tick at the page container's left edge (the listing crosshair, lightly). Implemented once as
`<SectionRule/>`: `relative h-px w-full bg-hairline before:absolute before:left-[max(1.25rem,calc((100%-75rem)/2+2.5rem))] before:top-0 before:h-px before:w-6 before:bg-ink`. No rule before an arena band (the colour change is the rule) and none directly after the hero.

**Ghost shield.** Once per page, behind the hero: `public/brand/shield.svg` at 1400 px, navy at
4 % opacity, anchored `right-[-12%] top-[-8%]`, `pointer-events-none select-none`, hidden under
`sm`. The footer repeats it silver at 6 % on navy. Nowhere else.

### 2.5 How a section opens

```
[eyebrow]  SPACE GROTESK 500 · 0.8125rem · uppercase · tracking .16em · muted-text · 20×2 px ink rule before it
[H2]       ANTON UPPERCASE WITH A FULL STOP.  (≤2 lines, max-w-[20ch])
[subhead]  Space Grotesk 700 · 1.125 / 1.25 / 1.375rem · max-w-[38ch]   (optional; only when COPY.md gives one)
[content]  mt-10 lg:mt-14
```

Eyebrow is optional and never Barlow (spec §2.2). It is used where a section needs a
"where am I" word: `STEP ONE` on the gates, `EXAMPLE EDITION` on demos, `OUR PROMISE` on the
promise. Headings are left-aligned everywhere; centred headings only on `/registry`, `/contact`
and the 404 (single-purpose pages).

### 2.6 Mobile-first behaviour of every pattern

| Pattern | < 640 | ≥ 640 | ≥ 1024 |
|---|---|---|---|
| Evidence split | single column: label → artefact → text | same | 5/7 grid, artefact side alternates |
| Before→after pair | stacked, arrow rotates to point down (56 px tall row) | side by side, arrow horizontal | same, arrow 96 px |
| Tile row (TierCards) | stacked, full width | 2 cols | 3–4 cols |
| Snap row (finishes) | horizontal `snap-x snap-mandatory overflow-x-auto` with 72 vw tiles, `scroll-px-5` | 40 vw tiles | static 7-up grid, no scroll |
| 17-sport grid | 3 cols | 4 cols | 6 cols (17 = 6+6+5; last row left-aligned) |
| Tables (spec sheet, shipping) | rows become label/value stacks (`grid-cols-[7rem_1fr]`) inside a horizontally scrolling wrapper only if wider than 100 % | table | table |
| GateRow rail | horizontal scroll, sticky under the header | same | full width, sticky |
| Sticky header | 56 px, logo + primary CTA + menu | 64 px | 64 px, full nav |
| EditionPanel | full width, rows stack | 2-col rows | fixed 420 px column |
| Card flip | `min(88vw, 420px)` wide | 420 px | 460 px |

---

## 3. Type in use

Recipes are Tailwind class strings. `font-display` = Anton, `font-sans` = Space Grotesk,
`font-label` = Barlow SemiBold. Line lengths are enforced with `max-w-[Nch]`, never with grid alone.

| Role | Classes | Notes |
|---|---|---|
| **display (H1)** | `font-display uppercase text-[2.75rem] leading-[0.96] tracking-[0.005em] md:text-[3.5rem] lg:text-[4.5rem] lg:leading-[0.94] max-w-[15ch] text-balance` | Anton is already condensed: never add negative tracking. Ends with a period. ≤2 lines from 640 px; on a 390 px phone the home H1 wraps to 3 — accepted (§8). |
| **h2** | `font-display uppercase text-[2rem] leading-[1.02] md:text-[2.25rem] lg:text-[2.75rem] max-w-[20ch] text-balance` | ends with a period, ≤2 lines |
| **h3** | `font-display uppercase text-[1.5rem] leading-[1.05] tracking-[0.01em]` | gate names, tier names, occasion titles, panel titles; no period rule |
| **subhead** | `font-sans font-bold text-[1.125rem] leading-[1.3] md:text-[1.25rem] lg:text-[1.375rem] max-w-[38ch] text-pretty` | ~2:1 to the H1 on desktop |
| **question** (FourFears, FAQ) | `font-sans font-bold text-[1.125rem] leading-[1.3] lg:text-[1.25rem]` | sentence case, question mark kept |
| **body** | `font-sans text-[1.0625rem] leading-[1.55] text-ink max-w-read` | 17 px; 500 weight for the one bold sentence a section is allowed |
| **lede** | body + `text-[1.125rem] lg:text-[1.1875rem] leading-[1.5]` | first paragraph after an H1 only |
| **small** | `font-sans text-[0.875rem] leading-[1.5] text-muted-text` | captions under media, notes, "ships from" |
| **label** | `font-label uppercase text-[0.75rem] leading-none tracking-[0.14em] text-muted-text` | form labels, table headers, EditionPanel row labels |
| **record** | `font-label text-[0.8125rem] leading-[1.4] tracking-[0.06em] tabular-nums text-ink` | IDs, dates, `05 / 20` counters, verdict rows |
| **eyebrow** | `font-sans font-medium uppercase text-[0.8125rem] tracking-[0.16em] text-muted-text before:mr-3 before:inline-block before:h-0.5 before:w-5 before:bg-ink before:align-middle` | never Barlow |
| **pill text** | `font-display uppercase text-[0.8125rem] leading-none tracking-[0.06em]` | inside `Pill` only |
| **price** | `font-sans font-bold text-[1.75rem] leading-none tabular-nums` | compareAt: `text-[1rem] font-medium text-muted-text line-through decoration-1` placed *before* the current price |
| **founder note** | `font-sans italic text-[1.125rem] leading-[1.55] lg:text-[1.25rem] max-w-[48ch]` | signature in `font-label` record style, not italic |
| **arena body** | body + `text-white/88` (`text-[rgb(255_255_255/.88)]`) | on `/c` and the proof band |
| **arena label** | label + `text-arena-muted` | |

Letter-spacing rules: Anton 0–0.01em; Space Grotesk 0 (uppercase eyebrow +0.16em);
Barlow uppercase +0.14em, Barlow mixed/record +0.06em. Underlines on links:
`underline underline-offset-4 decoration-1 hover:decoration-2` (thickness animates, colour does
not). Links in body are ink, never accent (accent is not a text colour — 2.56:1 on stock).

---

## 4. Component recipes

All UI radii use `rounded-[var(--radius-ui)]`. Anything that *is* a card image uses `rounded-none`
and is wrapped in `<CardFace>` which forbids radius by construction. Hover and focus transitions:
`transition-[background-color,border-color,color,box-shadow,transform,text-decoration-thickness] duration-[var(--duration-hover)] ease-[var(--ease-out)]`
— abbreviated below as `tr-hover`.

### 4.1 Buttons

```
base      : inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-ui)] px-5 font-sans font-bold text-[1rem] leading-none whitespace-nowrap tr-hover select-none
primary   : bg-accent text-ink hover:bg-[#F25F22] active:translate-y-px
secondary : border border-ink bg-transparent text-ink hover:bg-ink hover:text-stock
etsy      : border border-ink/40 bg-transparent text-ink hover:border-ink  — label always "Also on Etsy →" (F1 primary is "Order on Etsy →" in the primary style; the outline Etsy button exists from F2)
ghost     : h-10 px-3 text-ink underline-offset-4 hover:underline  — in-page links that behave like buttons ("Print this checklist")
on arena  : primary unchanged (ink on orange 6.2:1); secondary → border-white/70 text-white hover:bg-white hover:text-arena
sizes     : sm = h-10 px-4 text-[0.9375rem]; full = w-full sm:w-auto
```

Arrow glyph `→` is typed in the label (COPY.md), not an icon. Icons, when used (FourFears,
header menu), are inline SVG `stroke="currentColor" stroke-width="1.5" fill="none"`, 20×20.

**Focus ring (all interactive elements, both themes):**
```css
:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px;
                 box-shadow: 0 0 0 6px var(--color-ink); border-radius: inherit; }
.bg-arena :focus-visible, .on-arena :focus-visible { box-shadow: 0 0 0 6px #FFFFFF; }
```
Accent alone is 2.56:1 on stock (fails 1.4.11); the 1 px ink/white halo outside it makes the
indicator visible on every background while the ring stays orange. `:focus:not(:focus-visible)`
gets no ring.

### 4.2 Pill

```
<Pill tone="accent|outline|silver">TEXT</Pill>
base    : inline-flex h-7 items-center rounded-full px-3 pill-text
accent  : bg-accent text-ink
outline : border border-ink text-ink
silver  : border border-white/40 text-white     (arena only)
gold    : border border-gold text-gold           (SENIOR EDITION · 1 OF 1 inside SR media/panels only)
```
Rows of pills: `flex flex-wrap gap-2`. A page shows at most three.

### 4.3 DeliveryChips

One per page (spec §2.6). Renders `CHIPS.standard` or `CHIPS.seniorNight` verbatim; segments are
split on ` · ` for wrapping only, never re-worded.
```
wrapper : flex flex-wrap items-center gap-x-3 gap-y-1
segment : record-style text (font-label 0.8125rem tracking .06em uppercase) text-ink
          before each segment except the first: a 4×4 px ink dot (`before:mr-3 before:inline-block before:size-1 before:rounded-full before:bg-ink`)
```
Never a clock icon, never a coloured chip — it is a line of record, not a badge.

### 4.4 TrustLine

Under every CTA pair and upload control. C14 segments, same `·` dot separator as DeliveryChips
but in `small` style (`text-[0.875rem] text-muted-text`), `mt-3`, `max-w-[60ch]`. When
`vertexNoTrainingVerified` is true the fourth segment is *prepended* (lib decides, component only
renders the array).

### 4.5 BracketFrame — the audit motif

Four orange corner brackets around a process artefact. It is the only decorative use of accent.
```tsx
<BracketFrame as="figure" size="md|lg" caption="…" label="KIT PLATE · FRONT">
  {children /* the artefact: <Image> or an HTML verdict card */}
</BracketFrame>
```
```
outer   : relative p-3 sm:p-4   (the bracket gutter)
corner  : absolute size-5 sm:size-6 border-accent  (four spans; top-left = border-t-[3px] border-l-[3px], etc.)
          each corner: `transition-transform duration-[var(--duration-hover)]`; on `group-hover` the four corners translate 2 px outward (evidence "pinned tighter") — no scale, no colour change
label   : absolute -top-3 left-6 bg-stock px-2 record-style uppercase text-ink   (sits on the top rule like a file tab; on arena bg-arena text-white)
caption : <figcaption> small style, mt-3, first line is the caption, FictionalLabel on its own line when the artefact shows a person
```
Brackets never wrap a product card or a poster (those get `CardFace` shadows); they wrap
*process* artefacts: verdict card, kit plate, reference plate, four shots, diff sheet, proof.
The proof is the one object that is both product and artefact — it gets the brackets, not the
card shadow.

### 4.6 CardFace

Every card image on the site goes through this component; it is the one place `rounded-none`
and the true ratio live.
```
wrapper : relative aspect-[5/7] w-full overflow-hidden rounded-none bg-arena-surface
          shadow-[var(--shadow-card-stock)]  (on arena: shadow-[var(--shadow-card-arena)])
image   : <Image fill sizes=… className="object-contain" />   (object-contain, never cover — a card is never cropped)
outline : after:absolute after:inset-0 after:ring-1 after:ring-inset after:ring-white/10 after:pointer-events-none  (arena only; on stock no ring)
```
Props: `src`, `alt` (§0.5 pattern), `priority?`, `fictional?` (renders `<FictionalLabel/>`
directly under unless the parent already labels the group — `labelled` prop suppresses it and
the parent must render C13 once). Corner audit is a build gate (§6.2), not CSS.

### 4.7 FictionalLabel

C13, not disableable. `inline-flex items-center gap-2 font-label text-[0.75rem] tracking-[0.06em] text-muted-text` with a 12×12 px outline "person" glyph (1.5 px stroke) before the text. Inside a frame: absolute `bottom-2 left-2` on a `Plate` (`bg-stock/95 px-2 py-1 rounded-[6px]`); under a frame: `mt-2`. On arena: `text-arena-muted`, plate `bg-arena/90`. It is rendered by `CardFace`, `BracketFrame`, `BeforeAfter` and gallery components automatically when `fictional` is set; pages never have to remember it.

### 4.8 Plate

Solid plate for text over an image (spec §2.6). `bg-stock/95 text-ink` on stock imagery, `bg-arena/92 text-white` on dark imagery; `rounded-[var(--radius-ui)] p-4 md:p-5`; **no backdrop-blur** — a blur is a glass effect, a plate is paper. Used for the FictionalLabel-in-frame, the poster tier's "18 × 24 shown" tag, and the room-shot captions.

### 4.9 TierCard

```
card     : group flex h-full flex-col rounded-[var(--radius-ui)] border border-hairline bg-paper p-5 lg:p-6 tr-hover hover:border-ink
featured : ring-1 ring-ink border-ink  + <Pill tone="accent">FEATURED</Pill> absolutely at -top-3 left-5
media    : (family cards on home only) aspect-[4/5] overflow-hidden rounded-[8px] bg-stock mb-5  — a card front+back pair renders as two <CardFace> in a 2-col grid instead of a cropped picture
name     : h3 (Anton 1.5rem) — the Etsy variant name ≤20 chars, verbatim
price    : mt-2 flex items-baseline gap-2 → [compareAt struck (only when priceDisplay().compareAt)] [current, price style]
sale line: small, "Sale price until {saleEnds}" — rendered only with compareAt
truths   : mt-4 list; each row `grid grid-cols-[1rem_1fr] gap-2 text-[0.9375rem] leading-[1.45]` with a 16×16 1.5 px check glyph (ink, not green — green is reserved for PASS chips)
ships    : mt-4 label "SHIPS FROM" + record line (C19 name · "tracked (per lab)")
chip     : mt-3 DeliveryChip segment for the tier ({chip:digital}/{chip:prints}/{chip:pack})
cta      : mt-auto pt-6 → primary full-width; F2 adds the Etsy outline under it (`mt-2`)
```
Card padding never shrinks below 20 px on mobile; the four tier cards stack with `gap-4`.

### 4.10 EditionPanel (always dark, on every background)

The verification surface from the spec. Arena panel even on stock pages — it is the same object
a parent sees on `/c`, so it must look identical everywhere.
```
panel   : relative rounded-[var(--radius-ui)] bg-arena-surface text-white p-5 lg:p-6 max-w-[420px]
          before:absolute before:inset-x-5 before:top-0 before:h-px before:[background:var(--silver)]   (the silver rule)
head    : flex items-center justify-between → <Pill tone="silver">REGISTERED EDITION</Pill> (SR: gold pill) + silver shield 24 px (shield.svg via CSS mask + silver gradient, §6.4)
rows    : mt-5 grid gap-y-3 → each row `grid grid-cols-[6.5rem_1fr] items-baseline gap-x-4`
label   : arena label, font = var(--font-supporting, var(--font-barlow))   ← on /c the route sets --font-supporting to the finish's supporting font; elsewhere Barlow
value   : record style but 0.9375rem text-white; EDITION ID value in `font-mono-like` tabular record + "Copy ID" ghost button (arena) at the row end
sentence: mt-5 arena body 0.9375rem (the one-edition sentence), then C15 in small/arena-muted
foot    : mt-4 flex justify-between small/arena-muted → "Last updated {updatedAt}" · link "What is a registered edition?"
demo    : eyebrow-style line above the panel on stock pages: "Example edition · Fictional athlete" (record style, muted-text)
```
"Registered" state slide-in (spec §2.5): when the panel mounts as a *result* (registry lookup,
checkout preview) it animates `opacity 0→1, translateY(8px→0)` over 240 ms `ease-out` once; as
static content it does not animate. `prefers-reduced-motion`: no transform, opacity only.

### 4.11 StatChip

```
chip  : flex flex-col items-center justify-center rounded-[var(--radius-ui)] border border-arena-hairline bg-white/[.04] px-4 py-3 min-w-[5.5rem]
value : font-[var(--font-display-finish,var(--font-display))] text-[1.75rem] leading-none text-white tabular-nums   (finish display font on /c; Anton elsewhere)
label : mt-1 arena label
row   : flex gap-3 flex-wrap; omitted entirely when stats[] is empty — never a "—"
```
Team colour on the value only when `contrast(team.primary, arena) ≥ 4.85`; otherwise white and
a 3 px `team.primary` bar under the chip row (`h-[3px] w-12 mt-4`).

### 4.12 Status chips (PASS / FAIL / NOTE)

Filled `#D8554B` with ink text is 4.48:1 — below AA for 12 px text — so status chips are
**outline** chips: `inline-flex h-6 items-center gap-1.5 rounded-full border-[1.5px] px-2 font-label text-[0.6875rem] tracking-[0.12em] uppercase text-ink` with a 6 px filled dot in the status colour: `border-pass` / `border-fail` / `border-muted` (NOTE). On arena: `text-white`. Never filled, never with an icon.

### 4.13 GateRow (only `/how-it-works`)

A six-stop rail that is also the in-page nav.
```
rail  : sticky top-14 lg:top-16 z-30 -mx-5 sm:mx-0 bg-stock/95 border-y border-hairline overflow-x-auto snap-x
list  : flex min-w-max sm:min-w-0 sm:grid sm:grid-cols-6
stop  : snap-start flex flex-col gap-1.5 px-5 py-3 border-r border-hairline last:border-r-0 text-left  (an <a href="#gate-n">)
        line 1: record "0N / 06"   line 2: h3 at 1rem (Anton) "PHOTO CHECK"   line 3: status chip (PASS, or FAIL on the gate that "can say no" — all six render PASS/FAIL pairs as tiny legend, the active gate's chip is PASS)
active: `aria-current="location"` → border-b-2 border-ink (set by a 40-line IntersectionObserver; without JS all stops are plain links)
```
Each gate below the rail is a `<details open id="gate-n">` block; `<summary>` carries the same
three lines at full size. All six ship `open`; a tiny client enhancement collapses 2–6 on
< 1024 px after hydration. No-JS: everything visible.

### 4.14 FourFears

Long form (home §2): four `<a>` cards, whole card is the link.
```
card : group flex flex-col gap-3 rounded-[var(--radius-ui)] border border-hairline bg-paper p-5 lg:p-6 tr-hover hover:border-ink focus-visible:…
icon : 24×24 inline SVG 1.5 px, ink (eye / shield-with-person / undo-arrow / card-with-corner)
q    : question style
a    : body at 0.9375rem, text-ink
link : mt-auto pt-2 small text-ink underline-offset-4 group-hover:underline → the link text from §1.3 + " →"
grid : grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
```
Short strip ("Still deciding?"): a single `bg-paper border border-hairline rounded-[var(--radius-ui)] px-5 py-4` row: label **Still deciding?** (font-sans bold 0.9375rem) followed by the four fragments as inline links with `·` dots, `text-[0.9375rem]`, wrapping freely; `mt-6` under every product CTA pair.

### 4.15 FounderNote

```
block : grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-6 lg:gap-8 items-start
photo : (only if public/brand/founder.jpg exists) aspect-square w-28 rounded-[var(--radius-ui)] overflow-hidden object-cover grayscale-0  — a real photo, no treatment
note  : founder-note style (italic), paragraphs `space-y-4`
sign  : mt-5 record style: "John Birch" (text-ink) · "Game Day Edition" · {city when supplied} on one line with `·` dots; NOT a handwriting font, NOT an image signature
under : small/muted-text: "Designed in Lithuania · Printed by professional labs in the US · Independent — …" (COPY §2.1 11)
```
Without the photo the grid collapses to one column and the note keeps `max-w-[48ch]`.

### 4.16 CardFlip frame

The one signature motion (spec §2.5). Port of `card-flip/web/flip.html`, radius 0.
```
scene   : [perspective:1200px] mx-auto w-[min(88vw,420px)] lg:w-[460px]
card    : relative aspect-[5/7] [transform-style:preserve-3d] cursor-pointer rounded-none
faces   : absolute inset-0 [backface-visibility:hidden] rounded-none shadow-[var(--shadow-card-arena)]  (on stock: shadow-card-stock) ; back = rotateY(180deg)
keyframes flip { 0%,30% {transform:rotateY(0) scale(1)} 36% {rotateY(38deg) scale(1.03)} 44% {rotateY(90deg) scale(1.04)} 52% {rotateY(142deg) scale(1.03)} 58%,100% {rotateY(180deg) scale(1)} }
run     : .is-playing → animation: flip var(--duration-flip) var(--ease-flip) both
control : a real <button> overlaying the card (aria-label from COPY §2.15 2), plus a visible text button "Tap to flip" under the card (ghost style); Enter/Space/click replay; after the first run the label becomes "Tap to flip back"
autoplay: IntersectionObserver ≥ 0.6 visible, once per page, only when the scene's top is below the initial viewport (never above the fold); back image must have `decode()`d first
reduced : @media (prefers-reduced-motion: reduce) → no animation; a two-button segmented control Front / Back (`role="group"`) swaps the visible face with opacity 0/1
fallback: <noscript> renders front and back side by side; when `CSS.supports("transform-style","preserve-3d")` is false the client swaps in <video muted playsInline poster={front}> with the MP4 from card-flip/out/
```
Both faces load as `<Image>` with `object-contain`; front `priority` on `/c`, back
`loading="eager" fetchPriority="low"`.

### 4.17 SiteHeader

Sticky, solid, quiet — no blur, no shadow, no shrink-on-scroll.
```
header : sticky top-0 z-40 h-14 lg:h-16 bg-stock border-b border-hairline
inner  : Page container, flex items-center gap-6 h-full
logo   : shield.svg 28 px (navy, as-is) + wordmark.svg height 14 px (navy) — files, never text; <a aria-label="Game Day Edition — home">
nav    : hidden lg:flex gap-6 → items font-sans font-medium text-[0.9375rem] text-ink underline-offset-[6px] hover:underline aria-current:underline aria-current:decoration-2
right  : ml-auto flex items-center gap-2 → secondary sm "Look up a card" (hidden below lg) + primary sm "Order on Etsy →" (F1) / "Start an order" (F2)
menu   : lg:hidden h-10 w-10 grid place-items-center border border-hairline rounded-[8px]  (two 1.5 px lines icon; aria-expanded)
sheet  : fixed inset-0 top-14 z-50 bg-stock overflow-y-auto p-5 → primary nav as a list in Anton uppercase text-[1.75rem] leading-[1.15] with hairline rules between rows; then the secondary links (Photo guide · Registry · FAQ · Contact · Etsy shop) in body style; then the CTA pair full-width; then TrustLine. Closes on route change and Escape; body scroll locked while open.
skip   : "Skip to content" — sr-only, visible on focus as a primary sm button at top-4 left-4
```

### 4.18 SiteFooter (navy)

```
footer : bg-navy text-white relative overflow-hidden  (ghost silver shield 6 % at right-[-10%] bottom-[-20%], 900 px)
top    : Page container py-16 lg:py-20 grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]
brand  : shield.svg 48 px rendered silver (mask + gradient) + wordmark white 18 px; under it the imprint block (small, text-white/80, `whitespace-pre-line`) — the full block when imprintComplete(), else the fallback line
columns: label "SHOP" / "TRUST" / "LEGAL" (font-label, text-white/60) + links body 0.9375rem text-white/88 hover:underline
numbers: full-width row `mt-12 border-t border-white/10 pt-8 flex flex-wrap gap-x-8 gap-y-2` — TRUE_COUNTS each as a link, record style text-white
C4     : mt-6 small text-white/72 max-w-[80ch]
social : mt-8 flex gap-4 → 20 px monochrome SVG marks with aria-labels
bottom : mt-8 border-t border-white/10 pt-6 small text-white/60 — the © line
```
Never a newsletter field, never a badge row.

### 4.19 Inputs (registry lookup, date input)

`h-12 w-full rounded-[var(--radius-ui)] border border-ink/40 bg-paper px-4 font-label text-[1rem] tracking-[0.08em] uppercase text-ink placeholder:text-muted placeholder:normal-case focus:border-ink` (label above in `label` style; help under in `small`). The card-ID field forces uppercase and inserts hyphens as you type (mask `GDE-XX-XXX-YYYY-NN`); the miss/private/rate-limit strings render in a `role="status"` line under the field with a FAIL/NOTE chip.

### 4.20 Hover, in one rule

180 ms ease-out on colour, border, underline thickness and 2 px translate only. No scale on
cards, no shadow bloom, no image zoom. The only moving things on hover are bracket corners (2 px
outward) and the underline weight. Product images do not react to hover — they are prints.

---

## 5. Section-by-section design

Conventions used below: **Asset** = source file in the repo → the derived file under
`public/images/…` produced by the asset script (§6.1); **Box** = aspect box + object position;
**390** = what is above the fold on a 390 × 844 phone (Safari, ~740 px visible);
**LCP** = the element that must be the largest contentful paint and gets `priority`.

### 5.1 `/` — home

**1) Hero** — stock, ghost shield behind.
Layout (≥1024): grid 12 → copy `col-span-5`, media `col-span-7`. Media is one `BeforeAfter`
composition: left a 3:4 **before** photo (`etsy/listing-images/03-senior-night/src/ftb-before-a.png`, 970×1282 → `home/hero-before.{avif,webp}` at 480/720/960/1280 w) with a 1 px ink border and a record caption "PHONE PHOTO · ORIGINAL" + FictionalLabel on a Plate inside the frame; centre the **arrow** (inline SVG, accent, 2.5 px stroke, round caps, 96 px long, `aria-hidden`); right the **after** cluster built in the browser, not baked: `ftb-fs-poster.png` (900×1200) in an `aspect-[3/4]` box at 62 % of the cluster width with `shadow-card-stock`, `ftb-fs-front.png` as `CardFace` at 40 % width overlapping the poster's lower-left by 18 %, `ftb-fs-back.png` as `CardFace` at 34 % width behind and left of the front (`-translate-x-[55%] translate-y-[8%] z-0`). All three flat and straight — no rotation, no perspective. The certificate layer is added only if a count-neutral `football-certificate` passes the hash denylist; otherwise three objects (COPY alt text already lists it — drop "and certificate" from the alt when the layer is absent). C13 once under the cluster.
Copy column order: H1 → subhead → pills row (`FROM YOUR PHOTOS` accent · `REGISTERED EDITION` outline) → price line (`body font-medium`) → CTA pair (primary "Order on Etsy →" / secondary "Look up a card") → DeliveryChips → TrustLine. Page-load stagger on the five copy blocks only (CSS animation, opacity 0→1 + 6 px rise, 320 ms, delays 0/60/120/180/240 ms; disabled under reduced motion; images never animated).
**390**: header 56 → H1 (3 lines, 44 px) → compact media row: before (3:4) and card front (5:7) side by side at 44 vw each with the arrow between (56 px wide, horizontal); the poster and back are `hidden sm:block` → subhead (1.125 rem) → pills → price line → primary CTA full width with "Look up a card →" as a ghost link beside it (`flex gap-3`; the secondary *button* appears from sm) → DeliveryChips → TrustLine (may sit at the fold line; acceptable). **LCP**: the before photo (`priority`, `sizes="(max-width:640px) 44vw, (max-width:1024px) 46vw, 420px"`). No video, no tabs.

**2) Four fears** — stock. H2 + subhead, then `FourFears` long grid (§4.14). Static.
Mobile: cards stack; each card is ≥ 96 px tall so four fit in 1.5 screens.

**3) Three families** — stock. H2 + subhead; three `TierCard`s in `grid sm:grid-cols-3 gap-4 lg:gap-6`, each with media:
- Trading Cards: two `CardFace`s (`etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png` and `…BK-SN-card-BACK.png`, 750×1050) side by side in `grid-cols-2 gap-2 p-3 bg-stock`;
- Posters: `etsy/listing-images/02-basketball-poster/room-SN.png` (2048²) → `home/family-posters.{avif,webp}` cropped to 4:5 `{left:420, top:120, width:1180, height:1475}` (the framed poster centred, lamp warmth kept), `object-cover`;
- Complete Set: `etsy/listing-images/04-complete-set/v3/tile-printed.jpg` (1400²) in `aspect-[4/5]` `object-cover object-[50%_60%]`.
Price line "from {from:family}", three truths, CTA. Under the row, once, the certificate sentence in body-medium. FictionalLabel on the cards media and the set tile (C13 once under the row).

**4) Proof before print** — **arena band** (`bg-arena text-white py-16 lg:py-28`). Grid 12: proof `col-span-7`, promise `col-span-5`. Left: `BracketFrame size="lg"` (brackets accent, label "PROOF — NOT FINAL" in record style on an arena plate) around `etsy/listing-images/03-senior-night/src/bsb-sr-proof.png` (1400×1092 → `home/proof-sr-baseball.{avif,webp}` 800/1200/1600 w, `aspect-[1400/1092] object-contain`); caption + C13. Right: eyebrow "OUR PROMISE", pill `YOU SEE IT FIRST` (accent — the only orange fill on the band besides the brackets), H2 **NOTHING PRINTS UNTIL YOU SAY SO.**, C1 in arena body 1.125 rem, two links (ghost, white). Mobile: promise text first, proof under it (a parent reads the promise before scrolling to the evidence). Image is `loading="lazy"`.

**5) Registered, not just printed** — stock. Even split 6/6. Left: `CardFace` of `BK-SN-card-BACK.png` at `max-w-[360px]` with an SVG overlay `<circle>` in accent (stroke 3, r = 9 % of card width) centred on the QR (the QR sits at 4–19 % x, 82–96 % y of this back — measure on the derived file, store in the manifest); the slide `02-front-back-registered.png` is **not** cropped for this (its baked headline says "NUMBERED", banned by S10). Arrow (accent, points right; down on mobile). Right: `EditionPanel` for `GDE-SN-BKB-2026-12` with the "Example edition · Fictional athlete" line above, then the inline lookup form (§4.19) under it, then the link. H2 + body sit above the pair, `max-w-read`.

**6) Six finishes, one athlete** — stock, Wide container. H2 + subhead. Snap row of 7 tiles: `BK-SN-front.png, BK-CA-front.png, BK-FS-front.png, BK-HE-front.png, BK-SS-front.png, BK-PR-front.png` from `etsy/listing-images/01-basketball-card/src/` (750×1050) as `CardFace`s; tile = `snap-start w-[72vw] sm:w-[40vw] lg:w-auto` with the finish name as the pre-exported SVG label (`public/images/finish-labels/{SN,CA,FS,HE,SS,PR}.svg`, height 18 px, `fill: currentColor` ink — exported from Figma `KzdEYF1UD9EnsczY8Kpyxi` per finish hero lockup; **build dependency**, until exported render the name in Space Grotesk bold and log a TODO) and the material line in `small`. 7th tile: `etsy/listing-images/03-senior-night/src/bsb-sr-front.png` in a `border border-gold` tile with `<Pill tone="gold">SENIOR NIGHT EDITION</Pill>` and the gold line — gold stays inside this tile. C13 once under the row. Tile links per COPY. Desktop: `lg:grid lg:grid-cols-7 gap-4`, no scrolling; the row's scroll on mobile has `scroll-px-5` and no arrows (native swipe).

**7) Seventeen sports** — stock, Wide. H2 + subhead (C9 inside). Grid §2.6: 15 tiles with `CardFace` from `marketing/cards/<slug>-front.png` (900×1260 → `sports/<slug>-front.{avif,webp}` at 300/450/600 w), name in `font-sans font-medium text-[0.9375rem]`, note in `small` ("plain back" / "name + crest"); **pickleball** and **skateboarding** are text tiles: same size, `border border-hairline bg-paper`, sport name in h3, note, no placeholder art. C13 once under the grid. Alt per §0.5 (no numbers for the five numberless sports).

**8) How it's made, in plain words** — stock with a **sheet**. Inside the sheet: H2, the one sentence in body-medium 1.125 rem, then C2 in body. Under it a 3-up of `BracketFrame size="md"`:
- "Photo check — the verdict, as the parent reads it": an **HTML verdict card**, not an image — `bg-stock border border-hairline rounded-[8px] p-4` with four record rows (two FAIL, one NOTE, one PASS from COPY §2.6 gate 1, chips per §4.12) — real intake reasons, legible, no screenshot;
- "Reference plate — approved and locked before a single pose": `art-pipeline/out/approved/basketball/_identity.png` (2400×1792 → `process/plate-basketball.{avif,webp}` 600/900/1200 w, `aspect-[4/3] object-cover`);
- "Watermarked proof — what you approve": the same proof file as §4 at 600/900 w.
C13 under the two image frames. CTA ghost link "See the full process →".

**9) Your athlete's photos** — stock, `max-w-read` text column only, no image: H2, C3 in body, the "4–10 photos and nothing else" sentence in body-medium, TrustLine, two links. The absence of imagery is the point of this band; give it `py-20 lg:py-28` and a `SectionRule` before and after.

**10) Proof wall** — stock with a **sheet**, three columns `lg:grid-cols-[1.2fr_1fr_0.8fr] gap-8`.
- Left "Example editions": label + 8 `CardFace`s in `grid-cols-4 gap-2` (basketball, football, baseball, softball, soccer, volleyball, cheerleading, wrestling from `marketing/cards/`), C18 in small under, link.
- Centre "One rejected take, one approved": a `BeforeAfter`-shaped pair *without* the arrow — two `BracketFrame size="md"` side by side (`grid-cols-2 gap-3`), left chip FAIL + "REJECTED — the kit changed between shots." (h3 at 1rem) + the sentence, right chip PASS + "APPROVED — same athlete, same kit in every shot.". Sources: rejected = the ice-hockey take whose kit differs (`art-pipeline/out/athletes/ice-hockey/_versions/<pose>-<n>.png`), approved = `art-pipeline/out/athletes/ice-hockey/<pose>.png` (1696×2528 class, `aspect-[2/3] object-cover object-top`). **If the rejected take is not on disk, render only the approved frame with the reason text — never a staged rejection.** C13 under the pair, link to `#gates`.
- Right "We are new": h3 + C16 in body + link. On mobile the order is centre → left → right.
Reviews: nothing rendered — no placeholder, no heading.

**11) Founder note** — stock. H2 + `FounderNote` (§4.15) + "About the studio →". `public/brand/founder.jpg` absent → one-column note. The band is short and quiet: `py-16`.

**12) Occasions + closing CTA** — stock. Three cards in `sm:grid-cols-3 gap-4`, each `bg-paper border border-hairline rounded-[var(--radius-ui)] overflow-hidden`: media `aspect-[4/3]` top, then padding with h3 (the occasion H-line from COPY, Anton uppercase with period), body, chip/date line, ghost link.
- Senior Night media: `etsy/listing-images/03-senior-night/src/bsb-sr-poster.png` (1296×1728) `object-cover object-top` with a `<Pill tone="gold">SENIOR EDITION · 1 OF 1</Pill>` on an arena Plate inside — gold inside the media only;
- Christmas (server date window only): `etsy/listing-images/04-complete-set/v3/tile-printed.jpg` `object-cover`;
- Team: `art-pipeline/out/etsy-shots/packages/mix-12.png` (1400²) `object-cover object-center`.
Under the cards: H2 **ONE ATHLETE. ONE EDITION.** left-aligned in the read column, then the CTA pair, `<DeliveryChips/>`, TrustLine. The chip here is the same `CHIPS.standard` component instance as the hero's — one wording per page is the rule, and repeating the identical string beside the closing CTA is one claim, not two.

**13) Footer** — §4.18.

### 5.2 Product family template — `/trading-cards` · `/posters` · `/complete-set`

Sections 1–7 per spec §4.2, all stock.

**1) Hero + tiers.** Grid 12: copy `col-span-5` (H1, subhead, pills, sport picker, anchor line, chips + C11, CTA pair, TrustLine) and media `col-span-7`.
- Cards media: the two sources `BK-SN-card-FRONT.png` / `BK-SN-card-BACK.png` as `CardFace`s in `grid-cols-2 gap-4` at ≥ sm; under them the `CardFlip` (§4.16) fed by the same two files, autoplaying once when scrolled into view (never above the fold — on desktop the flip sits *below* the static pair, on mobile the static pair is hidden and the flip is the media, but with autoplay disabled and "Tap to flip" as the affordance, because on a phone it is above the fold). C13 under.
- Posters media: `room-SN.png` full square in `aspect-square object-cover` with a Plate caption "18 × 24 shown · framed"; under it the **to-scale sheet**: a `bg-paper` panel drawing an 18 × 24 and a 24 × 36 rectangle beside a 5′9″ figure silhouette at one px-per-inch (the rule from `etsy/LISTING-IMAGE-CANON.md`: the person is the ruler; 58″ hang centre). Pure SVG, ink lines, no photo.
- Set media: `etsy/listing-images/04-complete-set/19-everything-counted.png` pre-cropped to drop the baked headline (`{left:0, top:440, width:2000, height:1560}` → `aspect-[2000/1560] object-contain`) *or*, preferred, a browser-composed cluster of `football-poster.png` + `CardFace`s + certificate (count-neutral only) like the home hero. C13.
- Sport picker: `<select>` styled as §4.19 with a label "Their sport"; changes both CTA hrefs (SKU via `skuFor`) and the numberless note line under it (`small`, appears only for the five sports).
- TierCards ×4 (Sealed Foil Pack hidden by `enabled:false`) in `mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4`; `FEATURED` on the 12-card tier (prices via `priceDisplay`). Certificate sentence once under the row.
- **390**: H1 (2 lines) → pills → media (flip, static until tapped) → subhead → sport picker → anchor line → primary CTA → chips → TrustLine. **LCP**: the card front.

**2) Spec sheet** (`id="spec"`) — a **sheet**: H2 + subhead, then a two-column definition table `grid grid-cols-[8rem_1fr] sm:grid-cols-[11rem_1fr]` with hairline rows, labels in `label` style, values in body 0.9375 rem. No icons. Rows from `lib/catalog/tiers.ts`; the pack row is gated.

**3) Front + back, registered** — grid 12: `col-span-7` the four-shots artefact — `etsy/listing-images/04-complete-set/07-four-shots.png` pre-cropped `top:440` in a `BracketFrame` (label "FOUR SHOTS · ONE CARD"), *or* for cards specifically the front `CardFace` with four numbered callouts drawn in SVG (accent 20 px discs with ink numerals, positions stored in the manifest) — prefer the callout version, it is the product not a slide; `col-span-5`: body text, the QR-ring back (as home §5 at `max-w-[220px]`) and the `EditionPanel` demo. Posters: the to-scale sheet lives here instead. Set: the staged-delivery timeline — three record rows with dates from tokens.

**4) One athlete, six finishes** (`id="finishes"`) — the same 7-tile snap row as home §6 (component reuse); SR line under it.

**5) Sports without numbers** (`id="sports"`) — cards page only: H2, C9 in body, `CardFace` pair `marketing/cards/cheerleading-front.png` + `cheerleading-back.png` (`grid-cols-2 max-w-[520px]`), note line; then the 17-sport grid (reuse home §7).

**6) Still deciding?** — FourFears short strip.

**7) Mandatory blocks + FAQ + CTA** — four canon blocks as a `sm:grid-cols-2 gap-8` of read-width columns with h3 headings; FAQ as `<details>` list (`border-t border-hairline` rows, summary in question style with a 1.5 px chevron that rotates 180° in 180 ms); CTA pair + chips + TrustLine.

### 5.3 `/senior-night`

Stock page; gold only inside media and in the gold Pill.
1) **Hero** — grid 12, copy `col-span-5`, media `col-span-7`: a browser-composed cluster (as home hero, but SR) from `etsy/listing-images/03-senior-night/src/ftb-sr-poster.png` (measure; 3:4 class) + `ftb-sr-front.png` + `ftb-sr-back.png` as `CardFace`s; the gold in the art supplies the mood — the chrome stays ink/orange. If the composed cluster is not ready, `03-senior-night/01-hero.png` pre-cropped `top:440` in `aspect-[2000/1560]`. Pill `SENIOR EDITION · 1 OF 1` appears twice with two tones: `tone="outline"` (ink) in the copy column, and `tone="gold"` on an arena Plate inside the media cluster — gold is a media-only tone, so it never reaches the chrome. `{chips:seniorNight}` is this page's only chip. **390**: H1 (2 lines) → media (poster + card front pair, 44 vw each) → subhead → pill → CTA → chips → TrustLine. **LCP**: the SR poster.
2) **Order-by calculator** — a **sheet** `max-w-[640px]`: label + date input + primary button in a `sm:flex gap-3` row; results as three record rows with status chips (PASS "Files by …" / FAIL "…after the night"); the honest fallback paragraph in body-medium with the "Gift the digital first" secondary button; the printable gift note is a hidden `#gift-note` section with a print stylesheet (`@media print` shows only it: A5, gold 1 px top rule, silver shield 40 px, Anton heading, body, sign-off line). C17 under.
3) **What makes it a senior edition** — four items in `sm:grid-cols-2 gap-6`, each `BracketFrame size="md"` with `bsb-sr-back.png` (`CardFace`), `bsb-sr-cert.png` (**only if count-neutral**; else text only), `bsb-sr-badge.png` (1600², `aspect-square object-contain p-6`) + `bsb-sr-sticker.png` (2600×1280, `aspect-[2/1] object-contain`) together in one frame; pack panel hidden. C13 on the group.
4) **Nine sports** — 9 tiles in `grid grid-cols-3 gap-3 sm:gap-5 max-w-[900px]` (three rows of three at every width — calm beats a nine-across strip). Tiles = SR front stills from `card-flip/out/GDE_*SR_*` (extract frame 0 with ffmpeg at 1080×1350 → crop to the card → `sr/<sport>-front.webp`) or the `src/<xxx>-sr-front.png` files where they exist (ftb, bsb, sfb, soc, vlb, wrs, chr) — use the src files; hockey and basketball fall back to text tiles until their SR fronts are exported. Note line + link.
5) **Whole senior class** — read column, H2 + body + CTA.
6) **Trust stack** — as template §7 with the SN FAQ; C17; CTA pair + SN chips + TrustLine.

### 5.4 `/how-it-works`

Stock. Article schema. This is the page the direction is named for; every gate is an evidence sheet.
1) **Hero** — read column: H1, pills (`SIX GATES` outline · `YOU SEE IT FIRST` accent), C2 as lede, second paragraph. No image — the artefacts start 200 px later. **390**: H1 (2 lines), pills, lede — text only, deliberate. **LCP**: the H1 text (fine — Anton is preloaded).
2) **GateRow** (§4.13) sticky, then six gate sheets, each `<details open>` inside a `bg-paper` sheet with a `SectionRule` between. Gate layout (≥ lg): 5/7 grid, artefact side alternating (1 right, 2 left, 3 right…); mobile: summary → artefact → body → caption. Artefacts, all in `BracketFrame size="lg"`:
   1. PHOTO CHECK — the HTML verdict card (home §8), full-height, with the photo numbers as record text, plus the footer line and the photo-guide link.
   2. KIT BUILD — `art-pipeline/out/approved/basketball/_kit.png` and `_kit-back.png` (2048²) side by side `grid-cols-2 gap-3`, each `aspect-square object-contain bg-white`; labels "KIT PLATE · FRONT" / "KIT PLATE · BACK"; the side note (README §29) as a `small` paragraph with a NOTE chip.
   3. REFERENCE PLATE (`id="likeness"`) — `_identity.png` (2400×1792) `aspect-[2400/1792] object-contain`; under it `_identity-back.png` at half width. Label "REFERENCE PLATE · THREE VIEWS".
   4. THE SHOTS — `hero.png, action2.png, action3.png, back.png` from `art-pipeline/out/approved/basketball/` (1696×2528) in `grid-cols-4 gap-2`, each `aspect-[2/3] object-cover object-top`; labels 1–4 as record text.
   5. VERIFICATION — `art-pipeline/out/athletes/wrestling/_diff/hero-vs-_kit.png` (2363×1400) `aspect-[2363/1400] object-contain`; label "FRAME BESIDE ITS PLATE". No numbers anywhere in the frame's caption.
   6. FINISH — the SR baseball proof (home §4 file); label "PROOF — NOT FINAL".
   C13 on every gate with a person.
3) **The rejected take** — the pair from home §10 at full width (`max-w-[820px]`), the sentence under.
4) **Effort sentence** — one Anton line, h2 size, `max-w-[26ch]`, centred in the page, `py-16`, rules above and below. Nothing else in the band.
5) **What you approve, and when** — a vertical timeline: `grid grid-cols-[1.5rem_1fr]` rows, a 1 px ink line in the first column with 8 px ink dots (approval steps get a 12 px accent-ringed dot), state names in h3 at 1 rem, notes in small; C20, the revision line, C10, the reminder line as body under it.
6) **Who prints it** — three record rows (`grid-cols-[1fr_auto]` name / what) + the lab sentence + C4.
7) **FAQ** + CTA pair + chips + TrustLine.

### 5.5 `/guarantee`

Stock. 1) H1 + subhead in the read column; C1 inside a `BracketFrame size="lg"` **as text** (Anton? no — body at 1.125 rem, `bg-paper p-6 lg:p-8`; label "OUR PROMISE"); then H2 and the four "exactly" items as `grid sm:grid-cols-2 gap-6` with h3-at-1rem titles. 2) **Shipping table** in a sheet, `<table>` with `label` headers; "per lab" cells carry a NOTE chip; C11 · C12 · C10 under. 3) **Where a refund happens** — read column, body-medium. 4) **Refund ladder** (`id="refunds"`) — a two-column definition table like the spec sheet. 5) **We are new** — the long block as a `FounderNote`-styled letter (italic, signed) inside a sheet; link; CTA pair + TrustLine. No imagery on this page except the founder photo if present.

### 5.6 `/photo-guide`

Stock, print stylesheet. H1, subhead, pills, C5 lede. **Checklist**: nine rows in a sheet, each `grid grid-cols-[2.5rem_1fr] gap-4 py-5 border-t border-hairline`: record "01"…"09", h3-at-1rem title, body explanation, and the intake reason in `small` prefixed by a NOTE chip. **Never asked for** line as body-medium. **Good / not yet**: `public/images/photo-guide.webp` (1536×1024) shown whole `aspect-[3/2] object-contain` in a `BracketFrame`, with the six panel labels rendered as HTML chips under the image in a `grid-cols-3` (PASS ×3 top row, FAIL ×3 bottom row), so the verdict text is real text, not baked. Slides 12/13 (`04-complete-set/12-photos.png`, `13-crest.png`) may follow, pre-cropped `top:440`, C13. Closing line body-medium; buttons: ghost "Print this checklist" (`window.print()`, hidden without JS), secondary, CTA pair + TrustLine. `@media print`: hide header/footer/media/buttons, keep H1, the nine rows, the never-asked line and the closing line; page margins 16 mm.

### 5.7 `/about`

Stock. 1) H1 + subhead; founder card = `FounderNote` layout with the story paragraphs in **body** (not italic) and the first-person note in italic after them, signed. 2) Two essays as `sm:grid-cols-2 gap-10` read columns with H2 each. 3) Independence: H2, C4, C6, the crest sentence — read column. 4) Studio + partners: H2, sentence, the three C19 rows (as how-it-works §6), lab sentence. 5) Imprint: H2, imprint block in a sheet with `label` rows (Legal name / Company code / VAT / Address / Responsible person / Email) or the fallback line. 6) True numbers: H2 + a `grid grid-cols-2 sm:grid-cols-3 gap-4` of link tiles, each `bg-paper border border-hairline p-5` with the figure in Anton 2 rem and the descriptor in small — the "numbers that are true today" are the only large numerals on the site. CTA pair + TrustLine.

### 5.8 `/registry`

Stock, centred single column `max-w-[640px]`. 1) H1 **LOOK UP A CARD.** centred, subhead, the form (§4.19) in a sheet: label, masked input, help, primary "Find this edition" full width on mobile / inline on sm; status line; the demo line under as small with the demo ID as a link. 2) H2 + the six explanatory items as `grid sm:grid-cols-2 gap-6` with h3-at-1rem titles and body — "How to read the ID" gets a record-style diagram: `GDE - SN - BKB - 2026 - 12` in 1.25 rem Barlow with `label` captions under each segment (style · sport · season · number/E##). No card list, no imagery besides one `CardFace` of `BK-SN-card-BACK.png` at 180 px with the QR ring beside the form on ≥ sm.

### 5.9 `/faq`

Stock, read column `max-w-[720px]`. H1, then groups (Products · Photos · Sports without numbers · Timing · AI · Privacy · Refunds · Etsy vs here · Teams · Registry) as H2 + `<details>` rows (as template §7). FAQPage schema here only. A right-hand sticky group index on ≥ lg (`text-[0.9375rem]` links, `aria-current`). No imagery.

### 5.10 `/contact`

Stock, read column. H1 **TALK TO A PERSON.**, subhead with the mailto as a primary button ("Email hello@…" → `mailto:`), response window only if committed. Then the topic rows (Etsy orders · Lost your order link? · Card pages · Report a card page · Teams and clubs · Photos · Press) as a definition list: `grid sm:grid-cols-[12rem_1fr] gap-x-8 gap-y-6 border-t border-hairline pt-6` with h3-at-1rem terms and body descriptions. Imprint block or fallback at the end in a sheet. No form.

### 5.11 `/c/[cardId]` — the QR digital twin (arena)

The only page with per-finish type. `min-h-dvh bg-arena text-white` on `<main>`; the site header
is replaced by a slim arena bar (silver shield 24 px + wordmark white 12 px + "Look up a card"
ghost) — parents arrive from a QR, not from the nav. Content column `max-w-[560px] mx-auto px-5
pb-16`; on ≥ lg a 2-column `lg:max-w-page lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12`
(flip left, panel right, header spanning).

1) **Identity header** — `pt-6`: pill `REGISTERED EDITION` (silver outline; SR: gold), name in the finish display font `text-[2.5rem] leading-[0.95] uppercase lg:text-[3.5rem]` (Playfair for SR is mixed case — respect each pair's case as on the card: `lib/catalog/styles.ts` gets a `displayCase` field), meta line in the finish supporting font `text-[0.9375rem] tracking-[0.08em] uppercase text-arena-muted`, a 3 px `team.primary` bar (40 px) under it; demo → FictionalLabel (arena variant). Team colour on the name only when ≥ 4.85:1; else white name + the bar.
2) **Flip hero** — `CardFlip` (§4.16) with `public/cards/<cardId>/front.webp` / `back.webp` (900×1260 WebP generated once by `card:new` / `order:publish` via sharp from the trimmed exports — never the 816×1110 bleed files), `mt-6`, autoplay once (it is below the header, above the fold on desktop only — autoplay stays on because the spec allows it below the *header*; on a 390 px phone the scene top is at ~230 px: autoplay only if the scene's top ≥ 60 % of the viewport height at load, else wait for the tap), "Tap to flip" ghost button centred under. MP4 fallback per cardId (`public/cards/<cardId>/flip.mp4` copied from `card-flip/out/`).
3) **EditionPanel** (§4.10) with the finish's supporting font for labels (`--font-supporting`), Copy ID, C15, last updated, registry link.
4) **Stats and highlight** — arena label "SEASON STATS" (SR "CAREER HIGHS"), `StatChip` row, highlight in arena body 1.0625 rem, `CLASS OF {classOf}` as record text where allowed; SR rows (senior season, FR·SO·JR·SR line) in the supporting font, quote in the supporting italic 1.125 rem.
5) **Downloads and share** — arena label "DOWNLOADS"; a list of ghost buttons (arena secondary style, `h-11`, full width on mobile, `grid sm:grid-cols-2 gap-2`) with a 1.5 px download glyph; wallpapers only when `delivered` and their safe-zone pass is recorded; demo shows front/back/GIF. Share row: "Copy link" secondary sm + "Share" secondary sm (hidden when `navigator.share` is absent). Toasts: `role="status"` line, 240 ms fade.
6) **About this finish** — two lines in arena body with the material and the pair (`Type: Anton + Barlow`), link. SR → senior-night link.
7) **CTA row by channel** — `demo-etsy`: single arena secondary "Get yours on Etsy →"; other channels: primary "Order another edition" + Etsy outline. No prices anywhere.
8) **Privacy footer** — `mt-12 border-t border-arena-hairline pt-6` small/arena-muted lines per state; "Report this card" as a ghost link; the manage sentence; demo adds the C18 short form. Then a minimal arena footer: shield silver 32 px, C4 in small, legal links row. No navy band on `/c` — the page stays arena edge to edge.
**390**: arena bar 48 → pill → name (2 lines max) → meta → flip scene (343 × 480) begins at ~y 230 and its lower third crosses the fold — the tap affordance is visible. **LCP**: front face (`priority`). JS on the page: flip + copy/share only, < 12 KB.
States: `private` → the neutral sentence in the read column with only the registry link; `deleted` → 410 copy; unknown → the `/c` 404 variant with the inline lookup. OG image route draws the front on arena with the edition strip (silver rule, record text) — no name on unlisted.

### 5.12 `not-found.tsx`, `error.tsx`

Stock, centred read column, H1 per COPY §2.13, body, inline lookup on the `/c` variant, two ghost links. No illustration.

---

## 6. Imagery plan

### 6.1 The asset script (single source of truth)

`scripts/site-assets.ts` (sharp) reads `content/assets/manifest.json` — one entry per placement:
`{ id, src, crop?: {left,top,width,height}, out: "public/images/<page>/<id>", widths: [...], formats: ["avif","webp"], fictional: true|false, cardFace: true|false, countBearing: false }` —
and (1) refuses any `src` whose hash is on the count-bearing denylist (`content/assets/denylist.json`: the TGC pack face, the "10 cards" certificate), (2) refuses paths under `public/images/sport-examples/` and any file whose name contains `nia`, (3) runs the **corner audit** on every `cardFace` (alpha or luminance at (2,2), (w-3,2), (2,h-3), (w-3,h-3) must be opaque and within the card's own edge colour — a transparent or stock-coloured corner means a rounded export → fail, re-export from Figma, never mask in CSS), (4) writes the derived sizes. `next/image` then serves them with explicit `sizes`. Nothing from `etsy/`, `marketing/` or `art-pipeline/out/` is imported at runtime — only `public/images/**` derived by the script (iCloud eviction risk, `gde-icloud-eviction`).

### 6.2 Cropping the 2000 × 2000 listing squares

The slides carry a baked headline in the top ~22 % and a wordmark + `NN / 20` counter in the bottom ~8 %. Rules:
- **Never** show a slide with its baked headline under a site H2 — it says the same thing twice in two type systems. Pre-crop to `{left:0, top:440, width:2000, height:1560}` (the 2000 × 1560 "product band") unless the manifest specifies a tighter product rectangle.
- Site placements use these boxes: `aspect-[2000/1560]` (`object-contain`, whole band), `aspect-[4/3]` (`object-cover object-[50%_60%]`, product cluster) or `aspect-square` only for room shots and the `mix-12` tile that have no text.
- Slide 02 (`FRONT + BACK. NUMBERED.`) is never cropped for the site — its headline uses a banned word and its cards pre-date the square-cut rule; the `src/` card files replace it.
- Slides whose *content* is text (`19-everything-counted`, `20-how-to-order`) are not used; their information is HTML on the site (spec sheet, timeline).
- Room shots (`02-basketball-poster/room-<FIN>.png` 2048², `04-complete-set/src/football-room1.png`) have no text: use whole in `aspect-square` or the 4:5 crop in §5.1-3.

### 6.3 Card faces

True ratio **2.5 : 3.5 = 5 : 7** — every card image lives in `CardFace` (`aspect-[5/7]`, `object-contain`, `rounded-none`). Sources: `marketing/cards/<sport>-front|back.png` (900×1260 — exact 5:7), `etsy/listing-images/01-basketball-card/src/BK-*-front.png` / `BK-SN-card-*.png` (750×1050 — exact 5:7), `03-senior-night/src/*-sr-front|back.png` (750×1050). Derived widths 300/450/600/900. Shadows: stock `--shadow-card-stock` (a print lying on paper: tight 1 px contact line + a soft, low, one-directional drop), arena `--shadow-card-arena`. Never a glow, never a border-radius, never `object-cover`, never a hover scale. A card is never shown smaller than 96 px wide (the 17-grid on mobile hits 105 px).

### 6.4 The marks

`public/brand/shield.svg` (307×333) and `wordmark.svg` (604×206) are navy files. On stock they render as-is (`<Image>` or inline `<svg>` with `fill: var(--color-navy)`). On arena/navy the shield must be **silver**: render a `<span class="shield-silver" aria-hidden>` with `mask: url(/brand/shield.svg) center / contain no-repeat; background: var(--silver)` (plus `-webkit-mask`), and keep an `<img>` with the alt for assistive tech (`sr-only`). The wordmark on dark = white (`fill: #fff`). The shield is never orange, never a team colour, never the finish foil.

### 6.5 The before→after device

`<BeforeAfter before={…} after={…} arrow="right|down" />`, used identically everywhere:
- **before**: a phone photo in `aspect-[3/4] object-cover`, 1 px `border-ink/30`, `rounded-[6px]` (a photo print has a tiny radius; a card does not), a Plate in the lower-left with FictionalLabel, record caption "PHONE PHOTO · ORIGINAL" above the frame.
- **arrow**: inline SVG 96 × 24 (mobile 24 × 56, rotated), accent, stroke 2.5, round caps, a plain shaft and open head (no fill, no gradient), `aria-hidden`.
- **after**: a `CardFace` or a poster box (`aspect-[3/4]` for 18×24 art, `shadow-card-stock`), never a pose render (`gde-after-must-be-product`).
- Grid: `grid grid-cols-[1fr_auto_1fr] items-center gap-4 lg:gap-8`; on mobile `grid-cols-1 justify-items-center` with the arrow row 56 px tall.
Placements: home hero, home §5 (back → EditionPanel, the same arrow), product hero (mobile pair), photo-guide (no arrow; PASS/FAIL rows instead), how-it-works gate 3 (four before photos → plate, arrow down).

### 6.6 The 17-sport grid

`grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 lg:gap-5`; tile = `CardFace` + name + note; the two text tiles keep the same `aspect-[5/7]` box so the rows align. Order as COPY §2.1-7. The grid is a truth table, not a carousel — no scrolling, no "see more".

---

## 7. Motion and interaction

- **One signature motion**: the 5.0 s card flip (§4.16). It runs at most once per page on scroll-in, below the fold, and again only on user action. It is never on the home page (the home has no flip; the flip belongs to product pages and `/c`).
- **No reveal-on-scroll.** Content is never at opacity 0 waiting for JS or an observer. The only entrance animation is the hero copy stagger (CSS-only, 320 ms, five blocks, starts at load, images excluded); with `prefers-reduced-motion: reduce` it is removed by a media query, not by JS.
- **EditionPanel result slide-in** 240 ms (§4.10), only when the panel is the result of an action.
- **Hover/focus** 180 ms ease-out on colour, border, underline thickness, 2 px translate (§4.20).
- **Details/accordions**: chevron rotates 180 ms; content appears without height animation (no layout thrash on phones).
- **Toasts** (copy ID/link): 240 ms opacity, auto-dismiss 2.4 s, `role="status"`.
- **Reduced motion**: flip → Front/Back switch; stagger off; slide-in → opacity only; chevron → no rotation; everything else is already static.
- **No**: parallax, scroll-jacking, smooth-scroll on the root (keep `scroll-behavior: auto`; in-page anchors get `scroll-margin-top: 5rem` for the sticky header), autoplaying video above the fold, hover zoom, marquee, counters counting up, cursor effects.

---

## 8. Risks, tradeoffs, accessibility and performance

**Risks / tradeoffs**
- *Evidence can read cold.* A verdict card with FAIL chips, plates of a teenager's face, a diff sheet — this is honest and unusual, and a few parents will find it clinical. Mitigations built in: warm stock, the founder letter on `/`, `/about` and `/guarantee`, C13 on every artefact, and the explanatory sentence before each gate. Do not "soften" by removing artefacts; soften with words.
- *Reference plates show faces.* They are fictional roster athletes, labelled; still, keep plates on `/how-it-works` and home §8 only — never in the hero, never in OG images.
- *The home H1 is 3 lines on a 390 px phone* at the spec's 2.75 rem (Anton ≈ 19 uppercase characters per line at 44 px). Options: accept 3 lines under 400 px (recommended — the copy is fixed and the line breaks fall on phrase boundaries: THEIR SEASON / DESERVES MORE / THAN A CAMERA ROLL.) or `text-[2.5rem]` under 400 px, which still yields 3 lines. Accept.
- *Two dark bands only* means the page relies on typographic rhythm; if a builder pads sections unevenly the page goes flat. Use the scale in §2.3 exactly.
- *Missing exports are build dependencies, not blockers*: finish-label SVGs (§5.1-6), `founder.jpg`, hockey/basketball SR fronts, the rejected ice-hockey take, count-neutral certificate. Every one has a specified fallback that is honest (text tile, no image, approved-only frame, three-object cluster).
- *`muted` fails AA on stock* (4.36:1). The direction adds `--muted-text` (#5F636A, 5.4:1) for text under 24 px and reserves `#6E7278` for large text, rules and icons. `pass`/`fail` fills are below 4.5:1 with either ink or white text → outline chips (§4.12). Accent is never text.
- *Slide crops vs composed clusters*: composing in the browser (hero, senior hero, set hero) gives crisp 0-radius cards at any DPR and one less 2000² asset, but three images instead of one; LCP is still one element (the before photo / poster) with `priority`, the rest `fetchPriority="low"`. If Lighthouse shows the cluster images competing, bake the after-cluster with sharp into a single 1600 × 1200 WebP in the asset script (the manifest supports `compose: [...]` for exactly this).

**Accessibility**
- WCAG 2.2 AA: text ≥ 4.5:1 on stock (ink 15.9:1, muted-text 5.4:1), ≥ 4.85:1 on arena for team colours (fallback rule), non-text 3:1 (focus halo, chip borders 1.5 px in status colours *plus* ink text so colour is never the only signal — the chip text says PASS/FAIL).
- Focus ring on everything interactive (§4.1); tap targets ≥ 44 px on mobile (buttons 48, nav rows 56, tiles whole-card links); `:focus-visible` only.
- Every image has the §0.5 alt; decorative arrows/brackets/ghost shield `aria-hidden`; card text is repeated in the EditionPanel on `/c` (the accessibility statement promises this).
- Flip: real button, `aria-label` switches, `aria-live="polite"` announces "Showing the back"; reduced motion → segmented control.
- `<details>` accordions are keyboard-native; GateRow links are anchors with `scroll-margin-top`.
- Forms: visible labels, `autocomplete="off"` on the card-ID field, `inputmode="text"`, `aria-describedby` for help and status; the status line is `role="status"`.
- Language `en-US`; `prefers-color-scheme` is ignored on purpose (stock pages are light, `/c` is arena, by design — document in `/accessibility`).

**Performance**
- LCP budget ≤ 2.0 s on 4G: home LCP = the before photo at ≤ 45 KB AVIF for the 480 w candidate; product LCP = card front 450 w ≤ 40 KB; `/c` LCP = front 900 w ≤ 90 KB (it is the product; accept). `priority` on exactly one image per page; everything else lazy or `fetchPriority="low"`.
- `sizes` strings are mandatory on every `<Image>`; derived widths per placement (cards 300/450/600/900, hero before 480/720/960/1280, band artefacts 600/900/1200/1600, room 640/960/1280/2048).
- Fonts: 4 files on stock pages (Anton 400, Space Grotesk 400/500/700 — variable if available, Barlow 600) ≈ 110–130 KB woff2, `preload`, `display: swap` with `adjustFontFallback` so the Anton fallback (Impact / Arial Narrow Bold) does not reflow the H1 badly. `/c` adds exactly one pair (`preload: false`, loaded on use by `@font-face`).
- No animation library. Client components: header menu, flip, copy/share, registry mask, calculator, GateRow observer, details-collapse enhancement — each ≤ 3 KB. `/c` total JS < 300 KB is met with margin (target < 120 KB).
- `next/image` with AVIF then WebP; `content/assets/manifest.json` is the only import path for repo art; CI fails the build on any `etsy/`, `marketing/`, `art-pipeline/` path in `app/` or `components/`, on any `$` literal outside `prices.ts`, on any `rounded-*` class touching `CardFace`, and on any derived card face failing the corner audit.

---

## Appendix — asset manifest seed (paths → placements)

| id | src | crop / note | placements |
|---|---|---|---|
| hero-before | `etsy/listing-images/03-senior-night/src/ftb-before-a.png` 970×1282 | whole, 3:4 | home hero (LCP) |
| hero-poster-fs | `etsy/listing-images/03-senior-night/src/ftb-fs-poster.png` 900×1200 | whole | home hero cluster |
| hero-card-fs-front/back | `…/ftb-fs-front.png`, `…/ftb-fs-back.png` 750×1050 | cardFace | home hero cluster |
| bk-sn-front/back | `etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png`, `…BACK.png` 750×1050 | cardFace | home §3, §5, product hero + flip, registry |
| bk-finish-* | `…/BK-{SN,CA,FS,HE,SS,PR}-front.png` 750×1050 | cardFace | finishes row (home §6, product §4) |
| sr-front-bsb | `etsy/listing-images/03-senior-night/src/bsb-sr-front.png` 750×1050 | cardFace | finishes row tile 7 |
| sr-poster-bsb | `…/bsb-sr-poster.png` 1296×1728 | whole | home §12 senior card |
| proof-sr-bsb | `…/bsb-sr-proof.png` 1400×1092 | whole | home §4, §8; how-it-works gate 6 |
| sr-back/cert/badge/sticker | `…/bsb-sr-back.png` 750×1050 · `bsb-sr-cert.png` 1275×1650 (count-neutral only) · `bsb-sr-badge.png` 1600² · `bsb-sr-sticker.png` 2600×1280 | cardFace for back | senior-night §3 |
| sr-hero-ftb | `…/ftb-sr-poster.png`, `ftb-sr-front.png`, `ftb-sr-back.png` | cluster | senior-night hero |
| sr-fronts | `…/{ftb,bsb,sfb,soc,vlb,wrs,chr}-sr-front.png` | cardFace | senior-night §4 |
| family-posters | `etsy/listing-images/02-basketball-poster/room-SN.png` 2048² | `{420,120,1180,1475}` 4:5; also whole 1:1 | home §3; posters hero |
| set-tile | `etsy/listing-images/04-complete-set/v3/tile-printed.jpg` 1400² | whole | home §3, §12 |
| set-band | `etsy/listing-images/04-complete-set/19-everything-counted.png` 2000² | `{0,440,2000,1560}` | complete-set hero fallback |
| four-shots | `etsy/listing-images/04-complete-set/07-four-shots.png` 2000² | `{0,440,2000,1560}` | product §3 fallback |
| photos / crest | `…/12-photos.png`, `…/13-crest.png` 2000² | `{0,440,2000,1560}` | photo-guide |
| sport-front-* | `marketing/cards/<slug>-front.png` 900×1260 (15) | cardFace | home §7, §10; product §5 |
| cheer-back | `marketing/cards/cheerleading-back.png` | cardFace | product §5 |
| plate-bkb | `art-pipeline/out/approved/basketball/_identity.png` 2400×1792, `_identity-back.png` | whole | home §8; gate 3 |
| kit-bkb | `art-pipeline/out/approved/basketball/_kit.png`, `_kit-back.png` 2048² | whole | gate 2 |
| shots-bkb | `art-pipeline/out/approved/basketball/{hero,action2,action3,back}.png` 1696×2528 | 2:3 top-anchored | gate 4 |
| diff-wrs | `art-pipeline/out/athletes/wrestling/_diff/hero-vs-_kit.png` 2363×1400 | whole | gate 5 |
| reject-ich | `art-pipeline/out/athletes/ice-hockey/_versions/<pose>-<n>.png` (if present) vs `…/ice-hockey/<pose>.png` | 2:3 | home §10, how-it-works §3 |
| mix-12 | `art-pipeline/out/etsy-shots/packages/mix-12.png` 1400² | whole | home §12 team card |
| photo-guide | `public/images/photo-guide.webp` 1536×1024 | whole | photo-guide |
| flip-mp4 | `card-flip/out/GDE_SN_CardFlip_1080x1350.mp4` (+ per-card) | copy to `public/cards/<id>/flip.mp4` | product flip fallback, `/c` |
| brand | `public/brand/shield.svg`, `wordmark.svg` | as-is; silver via mask on dark | header, footer, `/c`, EditionPanel |
