# DESIGN.md — the F1 visual system for gamedayedition.com

**Winning direction: A — "Premium collectible catalog"** (judged 23 / 30), with the eighteen grafts from
B ("Arena Broadcast") and C ("Trust-first studio") folded in and every contradiction between them resolved
below. This is the one document six parallel builders design against; it is written so that a page built by
`home` and a page built by `trust-pages` look like the same site.

**Authority order.** `docs/SITE-BUILD-SPEC-2026-09.md` §2 is fixed (tokens, type, marks, image rules, motion,
component language). `docs/f1/COPY.md` is the copy — paste, never improvise. `docs/f1/CONTRACTS.md` owns file
names, component names, props and the wave/ownership map; this document uses its vocabulary and lists the
**deltas** it asks the Wave-0 `design-system` builder to apply (§10). Where this document and a source brief
disagree, this document wins; where it and the spec disagree, the spec wins.

Every path is repo-relative and was measured on 2026-09-06 (`sips` + a PIL corner probe; three ≤ 360 px
contact sheets were viewed). Nothing under `etsy/`, `marketing/` or `art-pipeline/` is imported at runtime —
the asset script copies audited derivatives into `public/images/**` (§6.1).

---

## 0. Findings that change the build (read before writing a component)

1. **The real rejected take exists and is located.** `art-pipeline/out/athletes/ice-hockey/_versions/action2-1.png`
   (1696 × 2528, generated 2026-08-20 08:51Z with refs = identity + crest only, *before* `_kit.png` existed)
   wears a solid navy jersey with a red hem and a hawk crest; the approved `art-pipeline/out/athletes/ice-hockey/action2.png`
   (same size, same pose brief, generated with `_kit.png`) wears the kit-plate jersey — red shoulders and
   sleeves, keystone crest. That is README §20's "the kit changed between poses", and COPY §2.1-10's caption
   ("Solid navy with a red hem in one frame, red shoulders and sleeves in the next") describes exactly this
   pair. **Use it.** The football stand-in proposed by graft 12 (`01-football-card/src/s06-reject.png`) may
   never be captioned "rejected": memory `gde-rejected-take-must-be-real` records its ArcFace score as 0.546,
   above the 0.36 gate — it passes. A caption must describe the frame shown; the ice-hockey pair is the only
   pair on disk that is a true rejection.
2. **The corner audit must test edge continuity, not darkness.** `marketing/cards/*-front|back.png` (900 × 1260)
   and `public/images/cards/*.webp` (600 × 840) carry baked white rounded corners *and a rounded red keyline*
   (pixel (2,2) = pure white, dark by (20,20)); so do `card-flip/assets/marcus-sn/card-front|back.png`,
   `04-complete-set/src/football-card-{FS,front,back}.png`, `04-complete-set/src/marcus-sn-card-front.png`,
   `01-cheerleading-card/src/CH-SN-card-FRONT.png` and `03-senior-night/src/ftb-fs-front.png`. A plain
   "corner must be dark" probe, however, fails honest Heritage faces (`01-baseball-card/src/BB-HE-front.png`
   top corners luminance 131 / 215 — the finish's cream plate, square by construction). **Rule (§6.2):** a card
   face fails when a corner pixel is within ΔE 8 of `#FFFFFF` or `#F4F3EF` (stock) *and* the pixel 16 px
   diagonally inward differs from it by ΔE > 20 (the step a rounded mask leaves), or when any corner has
   alpha < 255. Verified square today: every `01-basketball-card/src/BK-*-front.png` and `BK-SN-card-{FRONT,BACK}.png`,
   `01-football-card/src/FB-FS-card-{FRONT,BACK}.png`, every `03-senior-night/src/*-sr-front|back.png`,
   `03-senior-night/src/sr-card-{front,back}.png`, the 2026-09-01 `*-front.png` exports for BB/SC/VB/CH, every
   `card-flip/assets/*-sr/card-front.png`, all poster faces. **No `scale-[1.05]` crop, ever** — it clips the
   finish keyline (memory `gde-square-corners`, `gde-card-in-hand-composite`), and it cannot fix a rounded
   keyline anyway. Sports without a square front render the text tile (§5.1-07) until the 15 fronts are
   re-exported square-cut at 750 × 1050 from the sport template files (seo-assets task, §6.3).
3. **A Marcus Ellison Senior Night front exists**: `etsy/listing-images/03-senior-night/src/sr-card-front.png`
   (750 × 1050, square, gold SR, Cedar Ridge Bears #12). The seventh finish tile is therefore the **same
   athlete** as the six — the row's claim holds without a caption exception.
4. **The Stadium Night basketball back's QR is stale.** `01-basketball-card/src/BK-SN-card-BACK.png` prints
   `GDE-SN-BKB-2026-12` but its QR decodes to Nia Brooks's page (`…/c/GDE-SN-BKB-2026-23`,
   `docs/f1/ASSETS-RENDERS.md` §0.4). The QR-ring section is *about* scanning. Fix (§6.4): `scripts/card-assets.ts`
   decodes every back it writes; on a mismatch it composites the registry QR (`public/cards/qr/<id>.png`,
   `npm run qr:gen`) over the measured QR square before writing `public/cards/<id>/back.webp`, and the test
   decodes the output. The measured square on this back: **x 6.4–24.8 %, y 75.0–94.8 % of the card, centre
   (15.6 %, 84.9 %)** — the ring (§4.14) is drawn from that constant.
5. **`--muted` (#6E7278) on stock is 4.36 : 1** — below AA for small text. A derived solid token
   `--color-muted-text: #5F636A` (5.4 : 1) replaces every `text-ink/70` and `text-ink/80` opacity trick so
   small secondary text measures the same on every surface. On arena the existing `--color-arena-muted`
   `#AEB6C2` (9.6 : 1, CONTRACTS §1.2) stays — B's `#9AA4B2` is not adopted.
6. **No count-neutral evergreen certificate exists** (every `print-sources/output/*/GDE-*-certificate-*.png`
   and `04-complete-set/src/*-certificate.png` prints "10"). Only the SR certificates are count-neutral
   (`03-senior-night/src/bsb-sr-cert.png` 1275 × 1650, `sr-certificate.png` 1275 × 1650 — both carry the
   phrase "a single numbered Senior Night edition"; S10 bans "numbered" in *copy*, the photographed
   artefact is allowed on `/senior-night` §3 only and is flagged to the owner). Every other composite ships
   **without a certificate layer**; alt text drops "and certificate" where the layer is absent.
7. **Status chips are outline chips.** `#D8554B` fill with ink text is 4.48 : 1 at chip size. Recipe §4.10.
8. **One delivery claim per page**: the home Senior Night occasion card renders **no chip**; `{chips:seniorNight}`
   lives on `/senior-night` only. The closing CTA repeats the hero's `{chips:standard}` — one wording, one claim.
9. **`02-basketball-poster/02-two-sizes-to-scale.png` cannot be cropped text-free** (its headline sits on the
   figure). The to-scale sheet is pure SVG (§4.15).
10. **`public/brand/founder.jpg` is absent** → the founder note and the About founder card render text-first
    with no reserved slot (CONTRACTS `founderPhotoExists()`).
11. **Nine Senior Night sports, eight real fronts**: `03-senior-night/src/{ftb,vlb,chr,soc,bsb,sfb,wrs}-sr-front.png`
    + `sr-card-front.png` (basketball, Marcus). Ice hockey has no SR front → text tile. No ffmpeg frame
    extraction is needed for soccer/volleyball/wrestling (graft 18 assumed it; the src files exist and pass).
12. **`art-pipeline/out/approved/basketball/`** holds the signed-off Marcus set (`_kit`, `_kit-back` 2048²;
    `_identity`, `_identity-back` 2400 × 1792; `hero`, `action2`, `action3`, `back` 1696 × 2528). The only real
    `art:diff` export is `art-pipeline/out/athletes/wrestling/_diff/hero-vs-_kit.png` (2363 × 1400). Home
    sections 03, 05, 06, 07(basketball tile), 08, 10 and the `/c` demo are therefore **one athlete** (Marcus);
    the hero is Tui Fa'agata (football, Fire & Smoke — COPY §2.1-1 fixes the sport and finish); the rejected
    pair is the ice-hockey pilot (COPY §2.1-10 names it).
13. **`public/brand/shield.svg` / `wordmark.svg` carry Figma artboard rects** — CONTRACTS §3 `BrandMark`
    strips them and adds the silver gradient for arena. Nothing here changes that.

---

## 1. Thesis

**A manufacturer's catalogue for one product line: a registered edition of one athlete.** The object leads —
the card at its true 2.5 : 3.5, the poster at 3 : 4, each on a matte plate with a specimen caption — and the
words are the label beside the object. Trust is built the way a serious maker builds it: the spec sheet as a
ledger, the proof in bracket corners, the rejected take beside the approved one, the registry as an archive.
The page is ruled and numbered like a printed catalogue; nothing floats, tilts or glows; the single indulgence
is the card flip. From B it takes the **score bug** (Anton numerals carrying the true numbers), the **price as
the loudest number** on a tier card, and a hero that reaches the price, the clock and the button before the
first thumb-scroll ends. From C it takes the **evidence-sheet register** — file-tab labels on the bracket
frames, record-style Barlow lines, PASS/FAIL outline chips — and the structural guarantees (`CardFace`,
the manifest, the import ban) that make the honesty rules impossible to forget.

**What makes it not generic**
- **Plates, not cards-on-cards.** Products sit on a mat (`bg-hairline` or `bg-arena`, 8 % inset) inside a
  ruled plate with a caption rail. No SaaS tile, no soft glow, no glassmorphism, no hero video.
- **The ruled page.** Every section opens on a full-width hairline with its index on the rule (`05 / 13`,
  tabular Space Grotesk). No invented eyebrow words — COPY defines none, and Barlow is never an eyebrow.
- **Labelled exhibits.** Every process artefact wears four accent brackets and a file-tab label on the top rule
  (`KIT PLATE · FRONT`, `PROOF — NOT FINAL`) — the audit mark from the listing videos, in the catalogue's own
  register, with no new colour and no new type family.
- **The spec sheet is the second hero** of every product page: a definition ledger with Barlow keys and
  Space Grotesk values, larger than the copy around it.
- **The score bug.** Footer and `/about` carry the true numbers as Anton numerals over small linked labels —
  the one place Anton carries data rather than a headline.
- **One scale per plate.** Where a card and a poster share a plate they are drawn at one px-per-inch; the
  `/posters` sheet is an SVG drawn in inches. The home hero is the one plate that breaks true scale, and says so
  in no words (§5.1-01).
- **Accent as instrument.** Orange exists only on chrome: primary button, focus ring, the before → after arrow,
  pill fill, bracket corners, the QR ring. On a page that is otherwise stock, ink, navy and hairline it reads as
  an auditor's mark.
- **Two dark rooms.** The proof band on `/` and the `/c` arena (plus the navy imprint footer). Everything else is
  daylight stock; there is no floodlight, no grain, no blurred gym behind anything — the art is the atmosphere.

---

## 2. Layout system

### 2.0 Tokens
`app/globals.css` is CONTRACTS §1.1 verbatim plus the deltas in §10.1: `--color-muted-text: #5F636A`,
`--container-gallery: 85rem` (+ `container-gallery` utility), `--shadow-card-stock`, `--shadow-card-arena`,
`--text-price: 2rem`, `--animate-card-flip-quick` (900 ms). Fonts: `lib/fonts/site.ts` (Anton 400, Space
Grotesk variable, Barlow 500/600 with `preload: false`); finish pairs only in `lib/fonts/finishes.ts`, all
`preload: false`, applied by `app/(registry)/c/[cardId]/**`.

```css
/* §10.1 additions to the CONTRACTS @theme */
--color-muted-text: #5F636A;           /* 5.4:1 on stock — every secondary line under 24 px */
--container-gallery: 85rem;            /* 1360 px — plate galleries, six-finish row, 17-sport grid, hero */
--shadow-card-stock: 0 1px 0 rgb(20 25 31 / .06), 0 24px 40px -24px rgb(20 25 31 / .35);
--shadow-card-arena: 0 32px 64px -28px rgb(0 0 0 / .9);
--text-price: 2rem; --text-price--line-height: 1;
--animate-card-flip-quick: card-flip-quick 900ms var(--ease-flip) both;   /* user-initiated replays */
```

### 2.1 Containers
| Name | Class | Use |
|---|---|---|
| Page | `container-site` (75 rem, `px-5 sm:px-8 lg:px-12`) | text, tiers, ledgers, forms, FAQ |
| Gallery | `container-gallery` (85 rem, same padding) | hero, six-finish row, 17-sport grid, proof wall, product hero |
| Read | `max-w-[62ch]` on every `<p>` | body measure (≈ 640 px at 17 px) |
| Band | `w-full` wrapper that changes only `background`; inner Page/Gallery container | proof band (arena), footer (navy), `/c` |

Gutters never change inside a band; a band changes only its background.

### 2.2 Grid
`lg:grid lg:grid-cols-12 lg:gap-x-8`, `md:grid-cols-6 md:gap-x-6`, mobile single column `gap-y-6`.
- **Rail + body**: body `lg:col-span-10 lg:col-start-3`; the rail (`lg:col-span-2`) holds the section index
  and, when COPY supplies one, the pill. Mobile: the rail collapses to one row above the H2.
- **Two-up media/text**: media `lg:col-span-6`, text `lg:col-span-5 lg:col-start-8` — one empty column
  between object and label, deliberately.
- **Evidence split** (how-it-works gates): text `lg:col-span-5`, artefact `lg:col-span-7`, artefact side
  alternating gate by gate (`lg:order-first` on even gates).
- **Tier rows**: `lg:grid-cols-3` when three tiers render, `lg:grid-cols-4` when four; `md:grid-cols-2`;
  mobile 1-col. Never an empty slot; never re-ordered — the ladder order is the price order.

### 2.3 Spacing (Tailwind steps only)
`1 2 3 4 6 8 10 12 16 24 32` (4 … 128 px).
- Section padding `py-16 md:py-24 lg:py-32`; the FourFears section under the hero `pt-6 lg:pt-10` (§5.1-02).
- Opener → body `mt-8 lg:mt-12`; rule → H2 `mt-6`; H2 → subhead `mt-4`; subhead → pills `mt-stack` (38 px, D12).
- Plate padding `p-4 md:p-6 lg:p-10`; mat inset `p-[8%]`; tier card `p-6`; ledger row `py-3 px-4 sm:px-6`;
  chip `px-2.5 py-1`.

### 2.4 Bands
Light pages are stock end to end; depth comes from mats and rules, never from alternating band colours.
- `/`: 01–03 stock · **04 arena** (full bleed) · 05–12 stock · **13 navy** footer.
- Product families, `/senior-night`, every trust page, `/registry`, `/faq`, `/contact`, legal: stock; navy footer.
- `/c/[cardId]`: arena end to end (`data-surface="arena"`), navy footer (the imprint surface on every page).
- Inside a stock page the only dark objects are the things that are dark in life: a card, the proof, the
  `EditionPanel`, an arena mat under dark art.

### 2.5 How a section opens
```html
<section aria-labelledby="s-05" class="py-16 md:py-24 lg:py-32">
  <div class="container-site">
    <div class="flex items-center justify-between gap-4 border-t border-hairline pt-3">
      <span aria-hidden="true" class="font-body text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] text-muted-text">05 / 13</span>
      <Pill tone="outline">…only when COPY supplies one…</Pill>
    </div>
    <SectionHeading as="h2" id="s-05" index="05 / 13" title="REGISTERED, NOT JUST PRINTED." subhead="…" />
    <div class="mt-8 lg:mt-12">…</div>
  </div>
</section>
```
`SectionHeading` gains an `index?: string` prop (§10.2) and renders the rule + index row itself. The index is
shown only on pages whose copy numbers the sections (`/` = 13, product = 7, `/senior-night` = 6,
`/how-it-works` = 7); other pages use the rule without an index. H1 pages omit the rule on the hero (the
header's bottom hairline is the rule). The order under an H1/H2 is fixed by D12: **title → subhead → pills**.

### 2.6 Mobile-first behaviour of every pattern
| Pattern | < 640 | ≥ 768 | ≥ 1024 |
|---|---|---|---|
| Rail + body | index left, pill right, one row above the H2 | same | rail column |
| Two-up | object first (except the hero: H1 first) | same | 6 / 5 split |
| Six-finish / nine-SN rows | `snap-x snap-mandatory overflow-x-auto`, tile `w-[62vw] max-w-[260px]`, `scroll-pl-5` | tiles 240 px | grid, no scroll |
| 17-sport grid | 3 cols, `gap-3` | 4 cols | 6 cols (6 + 6 + 5, last row left-aligned) |
| Tier row | 1 col, `gap-4` | 2 cols | 3 / 4 cols |
| FourFears long | 1 col, compact card (§4.8) | 2 × 2 | 4 across |
| Ledger (2-col) | stays a `dl`; key row above value | `sm:grid-cols-[38%_1fr]` | same |
| Tables ≥ 4 cols | stacked records (`ul > li > dl`) | table | table |
| Header | 56 px, shield + wordmark, primary CTA, menu | 64 px | 64 px, full nav |
| CardFlip | `min(82vw, 340px)` | 360 px | 360 px (`maxWidth` 360) |
| `/c` | single column `max-w-[35rem]` | same | `lg:grid-cols-[minmax(0,1fr)_26rem] gap-12` |

Tap targets ≥ 44 × 44 for buttons and tiles, ≥ 24 × 24 for inline controls (copy-ID, share).

---

## 3. Type in use

All families via CONTRACTS tokens: `font-display` (Anton), `font-body` (Space Grotesk), `font-label` (Barlow).

| Role | Classes | Rules |
|---|---|---|
| Display (H1) | `font-display uppercase text-display max-w-[16ch] text-balance` (fluid 2.75 → 4.5 rem, lh .95) | UPPER + full stop from the copy string; ≤ 2 lines from 640 px; 3 lines at 390 px accepted |
| H2 | `font-display uppercase text-h2 max-w-[20ch] text-balance` (2 → 2.75 rem) | UPPER + full stop |
| H3 (block titles, tier names, gate names, FourFears questions) | `font-display uppercase text-h3` (1.5 rem; `text-[1.25rem]` on mobile FourFears) | no stop unless the copy has one; the `?` stays |
| Subhead | `font-body font-bold text-[1.125rem] md:text-sub max-w-[44ch] text-pretty` | ~2 : 1 under the heading |
| Body | `font-body text-body max-w-[62ch] text-pretty` (17 / 1.55) | `font-medium` only for the one lead sentence a section is allowed |
| Small | `font-body text-small text-muted-text` | captions, TrustLine, help, "ships from"; arena: `text-arena-muted` |
| Caption (plate caption, C13) | `font-body font-medium text-[0.75rem] leading-[1.4] tracking-[0.01em] text-muted-text` | |
| Label (form labels, table heads, ledger keys, chip text) | `font-label font-semibold text-label uppercase tracking-[0.12em] text-muted-text` | Barlow only here, in the ID line and in DeliveryChips |
| ID / time line (record) | `font-label font-semibold text-[0.9375rem] tracking-[0.06em] uppercase tabular-nums text-ink` | `GDE-SN-BKB-2026-12`, `REGISTERED AUG 27, 2026`, `05 / 20` |
| Pill text | `font-display uppercase text-pill tracking-[0.06em]` | inside `Pill` only |
| Price (current) | `font-display text-price tabular-nums` (Anton 2 rem) | the loudest number on a TierCard |
| Price (struck) | `font-body font-medium text-base tabular-nums line-through text-muted-text` | `<s aria-label="Regular price">`, only while `isSaleActive()` |
| Score-bug numeral | `font-display text-[2rem] md:text-[2.75rem] leading-none tabular-nums` | footer + `/about` §6 only |
| Founder note | `font-body italic text-[1.125rem] leading-[1.55] max-w-[52ch]` | the only italic on the site |
| Finish display (`/c` only) | `font-finish-display` / `font-finish-supporting` | one pair per route; SR quote in Playfair Display italic (Oswald has no italic) |

Anton is never tracked beyond 0.01em and never `font-bold`. Numerals in prices, IDs, dates, stats and indices
are `tabular-nums`. `text-balance` on headings, `text-pretty` on paragraphs. Links in body are ink, underlined
on hover (`underline-offset-4 decoration-1`); accent is never a text colour (2.6 : 1).

---

## 4. Component recipes

Component names, props and files are CONTRACTS §3; recipes below are the visual contract. Everything is a
server component unless marked **client**. Icons: `components/icons.tsx`, 1.5 px stroke, `aria-hidden`.
Hover/focus: `transition-[color,background-color,border-color,transform,opacity,text-decoration-thickness] duration-hover ease-out`.
Radius: `rounded-ui` (12 px) for panels, buttons, inputs, tier cards, plates; `rounded-card` (0) for anything
that depicts a card, poster, proof or plate.

### 4.1 Pill
`inline-flex h-8 items-center rounded-pill px-3 font-display uppercase text-pill tracking-[0.06em] leading-none`.
`accent` = `bg-accent text-ink` (the one primary claim on a page); `outline` = `border border-ink text-ink`;
`outline-silver` = `border border-white/40 text-white` (arena); `gold` = `border border-gold text-gold` — SR
media and the `/c` SR header only. Never two `accent` pills in one section; `FEATURED` is `accent` on a tier
card (CONTRACTS) and is the only accent pill in a tier row.

### 4.2 DeliveryChips
One per page. `CHIPS[kind]` split on ` · ` for wrapping only:
`ul.flex.flex-wrap.gap-2` → `li.inline-flex.h-8.items-center.rounded-pill.border.border-hairline.bg-stock.px-3.font-label.font-semibold.text-label.uppercase.tracking-[0.12em].text-ink`
(arena: `border-white/20 bg-arena-surface text-white`). No icon, no colour — a line of record, not a badge.
Repeating the identical string beside the closing CTA is one claim.

### 4.3 TrustLine
`p.mt-3.flex.flex-wrap.gap-x-3.gap-y-1.font-body.text-small.text-muted-text.max-w-[62ch]` with `<span aria-hidden>·</span>`
separators; the fourth segment only when `vertexNoTrainingVerified`. Arena: `text-arena-muted`. Directly under
every CTA pair and every upload control — always the last element of a CTA block.

### 4.4 CardFace (new — every card image goes through it)
```tsx
<CardFace src alt width height surface="stock|arena" fictional labelled priority sizes className />
```
- Wrapper `relative aspect-[5/7] w-full overflow-hidden rounded-none` + `shadow-[var(--shadow-card-stock)]`
  (`surface="arena"` → `--shadow-card-arena` and `after:absolute after:inset-0 after:ring-1 after:ring-inset after:ring-white/10`).
- `<Image fill sizes className="object-contain" />` — **never `object-cover`**, a card is never cropped.
- `fictional` renders `<FictionalLabel>` directly under the face (`mt-2`); `labelled` suppresses it for a
  group whose parent renders C13 once. No prop hides the label otherwise.
- The corner audit is a build gate (§6.2), never CSS.

### 4.5 Mat and plate
`Mat` = `flex items-center justify-center p-[8%] bg-hairline` (`tone="arena"` → `bg-arena`), always inside a
plate `rounded-ui border border-hairline overflow-hidden`. The plate may be rounded; the card never is. Dark
art (all six finish fronts, SR fronts, backs) sits on an arena mat; light objects (before photo, badge, sticker,
the to-scale sheet) on the stock mat. `Plate` (CONTRACTS) is the solid text plate over imagery — `bg-stock`
or `bg-arena`, `rounded-ui p-4`, never `backdrop-blur`, never `bg-*/80`.

### 4.6 BracketFrame — the labelled exhibit
```html
<figure class="group relative p-3 sm:p-4 rounded-none">
  <span aria-hidden class="absolute left-0 top-0 size-7 border-l-2 border-t-2 border-accent"></span> <!-- ×4 corners, 28 px legs, 2 px -->
  <span class="absolute -top-2.5 left-6 bg-stock px-2 font-label font-semibold text-label uppercase tracking-[0.12em] text-ink">KIT PLATE · FRONT</span>
  …artefact (an <Image> at its native ratio, or an HTML verdict card)…
  <figcaption class="mt-3 font-body font-medium text-[0.75rem] text-muted-text">…caption…</figcaption>
</figure>
```
The **file-tab label** sits on the top bracket rule on a stock plate (arena: `bg-arena text-white`) —
`label` moves from CONTRACTS' bottom-left to the top rule (§10.2). Corners are accent on stock and on arena
(the one accent use allowed on dark) and **do not move on hover** (C's 2 px nudge is not adopted — nothing
moves in this catalogue). Brackets wrap *process* artefacts only — verdict card, kit plate, reference plate,
four shots, verification sheet, proof, and the promise paragraph on `/guarantee` — never a product for sale,
a TierCard or a photo of a person outside the process story.

### 4.7 EditionPanel (always dark, on every surface)
`section.relative.rounded-ui.bg-arena-surface.text-white.p-5.lg:p-6` with a 1 px silver top rule
(`before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-silver`); on stock pages it is the dark
object on the page and gets `shadow-[var(--shadow-card-stock)]`. Header: `Pill outline-silver` (SR: `gold`)
left, silver shield 20 px right. Rows: `dl.mt-5.grid.grid-cols-[6.5rem_1fr].gap-x-6.gap-y-3` — `dt` label
class in `text-arena-muted` (on `/c`: `font-finish-supporting`), `dd` `font-body font-medium text-[0.9375rem]`;
the EDITION ID `dd` in the record style + `CopyIdButton`. Sentence, C15, "Last updated", registry link per
COPY §2.15. Demo instances carry `Example edition · Fictional athlete` in the record style above the panel.
Mount animation: 240 ms `@starting-style` opacity + 8 px rise on arena only (CONTRACTS).

### 4.8 FourFears
Long: `ul.grid.gap-3.md:gap-4.md:grid-cols-2.lg:grid-cols-4.auto-rows-fr` → `li > a.group.flex.h-full.flex-col.rounded-ui.border.border-hairline.bg-stock.p-4.lg:p-6.hover:border-ink`.
Inside: `div.flex.gap-3.items-start` → icon 24 px (eye / id-card / rotate-ccw / card-with-qr) + the question in
**Anton h3** (`text-[1.25rem] lg:text-h3`, uppercase, `?` kept); answer `font-body text-small lg:text-[0.9375rem] text-ink mt-2`;
link line `mt-auto pt-3 text-small font-medium text-ink inline-flex items-center gap-2` with the 16 px accent
arrow that translates 2 px on `group-hover`. Whole card is the link. No shadow, no lift.
Short strip ("Still deciding?"): `p.text-small.text-muted-text` with `<strong class="text-ink">Still deciding?</strong>`
and the four fragments as inline ink links separated by ` · `, inside every product CTA block, directly above the
TrustLine.

### 4.9 TierCard — a rate card, not a picture
```html
<article class="relative flex flex-col rounded-ui border border-hairline bg-stock p-6 hover:border-ink" aria-labelledby="tier-…">
  <!-- FEATURED: Pill accent absolute -top-3 left-5 + ring-1 ring-ink -->
  <h3 class="font-display uppercase text-h3">12 PRINTED CARDS</h3>
  <p class="mt-3 flex items-baseline gap-3">
    <span class="font-display text-price tabular-nums" aria-label="Sale price">$53.99</span>
    <s class="font-body font-medium text-base tabular-nums text-muted-text" aria-label="Regular price">$76.99</s>
  </p>
  <p class="mt-1 text-small text-muted-text">Sale price until Sep 24, 2026</p>
  <dl class="mt-6 divide-y divide-hairline border-y border-hairline">
    <div class="py-3"><dt class="label">What's in the box</dt><dd class="mt-2"><ul class="space-y-1 text-[0.9375rem]">…</ul></dd></div>
    <div class="py-3"><dt class="label">Ships from</dt><dd class="mt-2 text-small">Professional photo print lab, Santa Cruz CA · tracked (per lab)</dd></div>
  </dl>
  <div class="mt-4"><DeliveryChips kind="standard" segment="prints" /></div>
  <div class="mt-auto pt-6"><CtaPair …/></div>
</article>
```
- **No media.** The hero above the row already shows the product at its true proportion, and no count-neutral
  package tile exists for the pack/Ultimate rows; a tier is a line on a rate card. (`FamilyCard` on `/` §03 is
  the component that carries media.)
- Price only via `priceDisplay(tier, now)`; a `$` literal fails CI. The price is Anton 2 rem — the loudest
  number on the card — with the struck compareAt beside it and the sale line under it (graft 3).
- Hover: border → ink only.

### 4.10 StatusChip (PASS / FAIL / NOTE) — outline
`span.inline-flex.h-6.items-center.gap-1.5.rounded-pill.border-[1.5px].px-2.font-label.font-semibold.text-[0.6875rem].uppercase.tracking-[0.12em].text-ink`
+ a 6 px dot `size-1.5 rounded-full`. `pass`: `border-pass`, dot `bg-pass`; `fail`: `border-fail`, dot `bg-fail`;
`note`: `border-muted`, dot `bg-muted`. Arena: `text-white`, same borders. Never filled, never an icon; the
text carries the meaning. `GateRow` uses it (§10.2 replaces CONTRACTS' filled chips).

### 4.11 Ledger — the spec sheet as a design object
```css
.ledger { @apply rounded-ui border border-hairline bg-stock; }
.ledger > div { @apply grid grid-cols-1 sm:grid-cols-[38%_1fr] gap-x-6 gap-y-1 px-4 py-3 sm:px-6 border-b border-hairline last:border-b-0; }
.ledger dt { @apply font-label font-semibold text-label uppercase tracking-[0.12em] text-muted-text pt-1; }
.ledger dd { @apply font-body font-medium text-[0.9375rem] leading-[1.5] text-ink tabular-nums; }
```
Rendered as a `Ledger` component (`rows: { key, value }[]`, `size?: "md" | "lg"` — `lg` = `text-[1rem] py-4`).
No zebra, no icons in cells, no bold values. Used by: spec sheets, refund ladder, "what a registered edition is",
the verdict card, the photo-privacy plate, contact topics, imprint.

### 4.12 GateRow (`/how-it-works` only)
`ol.sticky.top-14.lg:top-16.z-30.bg-stock.border-y.border-hairline.-mx-5.sm:mx-0.overflow-x-auto.snap-x` →
`li > a.snap-start.flex.flex-col.gap-1.5.px-5.py-3.border-r.border-hairline.last:border-r-0` with the record
`0N / 06`, the gate name in Anton 1 rem and a `StatusChip`. `aria-current="location"` → `border-b-2 border-ink`
(a ≤ 40-line observer; plain anchors without JS). Each gate below is `<details open name="gates">`.

### 4.13 CardFlip (client) — the signature motion
CONTRACTS §3.1 verbatim (port of `card-flip/web/flip.html`, radius 0, 5.0 s, `--ease-flip`, `IntersectionObserver`
threshold 0.5 once, below the fold only) with one behavioural refinement (§10.2): **the 5 s signature curve runs
exactly once per scene** — on scroll-in where autoplay is allowed, or on the first tap where it is not (`/c`,
any hero) — and **every later toggle is a 900 ms `rotateY` transition** (`animate-card-flip-quick`, same curve,
no hold), so a replay feels responsive. Reduced motion: no autoplay, the button becomes a **Front / Back**
segmented control (`role="group"`, `aria-pressed`). No JS: `<noscript>` MP4 with `preload="none"` and
`poster` = front. The faces are `CardFace`s; the front is the LCP on `/c` (`priority`), the back
`loading="eager" fetchPriority="low"`. A static back beside the flip at ≥ md wherever the flip is the only
place the back is seen (product §3) — the QR and registered ID must be visible without interaction.

### 4.14 QrRing
`span.absolute.rounded-full.border-2.border-accent.pointer-events-none aria-hidden` over a `CardFace` of a card
back; centre and diameter from the manifest constant measured on the source (`BK-SN-card-BACK.png`: centre
`15.6% 84.9%`, diameter 30 % of the card width — 1.6 × the QR block). The ring is chrome drawn by the site,
never baked into the image; the back it rings must decode to the ID shown beside it (§6.4).

### 4.15 ToScaleSheet (`/posters` §3) — pure SVG, one unit = one inch
`<svg viewBox="0 0 96 84" role="img" aria-label="To-scale sheet: 18 × 24 and 24 × 36 in posters beside a 5 ft 9 in figure">`
on a stock mat, `w-full h-auto`, ink lines 0.25 units, `vector-effect="non-scaling-stroke"`:
- Floor line at y = 80 (`stroke-hairline` 0.5 units wide, full width) and a dashed **58 in hang line** at y = 22
  (`stroke-dasharray 1 1`, `stroke-ink/40`) with the Barlow label `58 IN · HANG CENTER` in a `<text>` at 2.4 units.
- **Figure** (x 6–24): an outlined standing silhouette 69 units tall (head top y = 11, feet y = 80), drawn as one
  ink path (head circle r 3, shoulders 16 wide, straight torso, legs to the floor), fill `none`, with the label
  `5 FT 9 IN` under the floor line. No photo, no cutout.
- **18 × 24** rectangle at x 32–50, y 46–70 (centre y 58); **24 × 36** at x 58–82, y 40–76 (centre y 58). Each
  rectangle `fill="var(--color-arena)"`, `stroke-ink`, and inside it the size in Anton (`<text>` 3 units,
  `fill="#FFF"`) at the centre; a `<title>` per rect.
- Dimension ticks (Barlow, 2 units) on the outer sides of each rectangle: `18 IN` / `24 IN` and `24 IN` / `36 IN`.
The sheet honours the one-px-per-inch thesis exactly and replaces the `02-two-sizes-to-scale.png` slide (finding 9).

### 4.16 BeforeAfter (the one recurring device)
`div.grid.grid-cols-[auto_auto_1fr].items-center.gap-4.lg:gap-6` (mobile: `flex flex-col items-center gap-3`).
- **before**: a phone photo in a 3 : 4 box, `object-cover`, a 6 px white ring (`ring-[6px] ring-white`) on the
  stock mat — a print pinned flat, no tilt, no tape; in-frame `FictionalLabel` on a stock `Plate` bottom-left.
- **arrow**: inline SVG `viewBox="0 0 56 24"`, path `M2 12h46 M40 4l8 8-8 8`, `stroke-accent stroke-[2.5] fill-none stroke-linecap-round stroke-linejoin-round`,
  `w-14 h-6`, rotated 90° (`w-6 h-14`) on mobile, `aria-hidden`. Never animated.
- **after**: always product — `CardFace`s and/or a poster box (`aspect-[3/4]`, `rounded-none`, card shadow);
  never a pose render, never a pack face.
Placements: `/` hero, `/` §05 (back → EditionPanel, arrow only), `/complete-set` hero, `/senior-night` hero
(no before), `/how-it-works` gate 3 (four before photos → plate, arrow down).

### 4.17 TrueNumbers — the score bug
`ul.grid.grid-cols-2.md:grid-cols-5.border-y.border-white/15.divide-y.md:divide-y-0.md:divide-x.divide-white/15`
(stock variant: `border-hairline divide-hairline`); each `li > a.block.px-4.py-5.hover:underline.underline-offset-4`:
the **figure** in Anton `text-[2rem] md:text-[2.75rem] leading-none tabular-nums` and the **full TRUE_COUNTS
string** under it in `text-small text-white/80` (stock: `text-muted-text`). `TRUE_COUNT_LINKS` entries become
`{ figure, label, href }` where `figure` is a case-insensitive substring of `label` (test) — footer figures
`17` · `7` · `2.5 × 3.5` · `FREE` · `ID`; `/about` §6 figures `17` · `7` · `27` · `2026` · `2.5 × 3.5`
(COPY §2.4 forbids "28 files" — graft 10's `28` is corrected to `27`, the label keeps "and one live page").
Each figure links to its proof page. Used by `SiteFooter` and `/about` §6 only.

### 4.18 Buttons, CtaPair, EtsyButton
`btn`: `inline-flex h-12 items-center justify-center gap-2 rounded-ui px-6 font-display uppercase text-[0.9375rem] tracking-[0.04em] leading-none whitespace-nowrap`
(CONTRACTS: primary is Anton). `primary` = `bg-accent text-ink hover:brightness-[0.94] active:brightness-90`;
`outline` = `border-[1.5px] border-ink text-ink hover:bg-ink/5`; `etsy` = outline, label `Also on Etsy →`,
never orange, never with a price; arena outline = `border-white/40 text-white hover:bg-white/10`; `sm` = `h-10 px-4 text-[0.875rem]`.
The arrow in `Order on Etsy →` is the copy glyph, not an icon. Pair layout `flex flex-col sm:flex-row gap-3`,
primary first, full width on mobile, `TrustLine` under.

### 4.19 Focus ring, hover, dividers
`:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; box-shadow: 0 0 0 1px var(--color-ink); border-radius: 4px; }`
— the 1 px ink halo takes the composite indicator past 3 : 1 on stock (accent alone is 2.6 : 1);
`[data-surface="arena"] :focus-visible { box-shadow: 0 0 0 1px #fff; }`. Hover: 180 ms on colour, border,
underline thickness, ≤ 2 px arrow translate; nothing scales, plates never lift, images never zoom. Dividers:
the section rule; inside a section `hr.border-hairline`; arena `border-arena-hairline`; the only coloured
rules are the 1 px silver on `EditionPanel` and the 1 px gold inside the SN gift note.

### 4.20 SiteHeader, MobileMenu, SiteFooter
- Header: `sticky top-0 z-40 h-14 lg:h-16 border-b border-hairline bg-stock` — solid, no blur, no shrink.
  Left `BrandMark` (shield navy 28 px + wordmark navy ≈ 64 × 22); centre nav `hidden lg:flex gap-6`
  (`font-body font-medium text-[0.9375rem] text-ink/80`, current `text-ink underline underline-offset-[10px]`);
  right `CtaPair` header variant (`Look up a card` outline sm, `Order on Etsy →` primary sm; below lg only the
  primary). Menu button 44 × 44 opens a full-height **stock** sheet: nav in Anton uppercase 1.75 rem with hairline
  rules, the five extra links in body, the CTA pair, TrustLine; focus trapped, Esc closes.
  **`tone="arena"`** (`/c`): `bg-arena border-arena-hairline`, shield silver, wordmark white, `Pill outline-silver`
  `REGISTERED EDITION` at right, **no shop CTAs** — the channel CTA row on the page is the only CTA.
- Footer (every page, `/c` included): `bg-navy text-white`, Page container `py-16 lg:py-24`. Row 1: silver shield
  48 px + white wordmark 20 px; the **TrueNumbers** strip `mt-8`; columns Shop / Trust / Legal (`label`
  headings `text-white/60`, links `text-[0.9375rem] text-white/85`); C4 full-width `text-small text-white/70`;
  social row as text links from `SOCIAL_LINKS`; imprint or fallback; bottom line in caption size. No ghost
  shield, no grain, no newsletter field, no badge row.

### 4.21 Inputs and the lookup form
`input`: `h-14 w-full rounded-ui border border-ink/40 bg-stock px-4 font-label font-semibold text-[1rem] tracking-[0.08em] uppercase text-ink placeholder:normal-case placeholder:font-body placeholder:text-muted-text focus:border-ink`;
label above in `label`; help under in `small`. `LookupForm` is a plain POST to `/registry/lookup`; the miss /
private / rate-limit strings render in a `role="status"` line under the field with a `StatusChip` (`fail`
for miss, `note` for private/rate-limit). `OrderByCalculator` uses the same input recipe for the date.

### 4.22 FictionalLabel, FounderNote, StatChip, CapacityNote
- `FictionalLabel`: C13, not disableable. In-frame: `Plate` (`bg-stock`, `rounded-[4px] px-2 py-1`) bottom-left;
  under-frame: `caption mt-2 border-t border-hairline pt-2` spanning the media. One per frame or one per group
  where COPY says so. `CardFace`, `BracketFrame` and `BeforeAfter` render it from `fictional`.
- `FounderNote`: `blockquote.border-t.border-hairline.pt-6.max-w-[52ch]` in the italic recipe; `cite` line
  `font-body font-bold` **John Birch** `· Game Day Edition{ · city}` (not italic); photo only when
  `founderPhotoExists()` (64 × 64 `rounded-full` left of the cite line — nothing else moves).
- `StatChip` (`/c`): `rounded-ui border border-arena-hairline bg-arena-surface px-4 py-3 text-center min-w-[5.5rem]`;
  value `font-finish-display text-[1.75rem] leading-none tabular-nums text-white`, label `label text-arena-muted mt-1`.
  Omitted entirely when `stats[]` is empty — never a dash.
- `CapacityNote`: `text-small text-muted-text` under the tier row on the three family pages only.

---

## 5. Section-by-section

Every media reference names the source, its native size, the box it is drawn in and the rendered width, so
`sizes` can be written without guessing. "390" = iPhone 15/16 logical width, Safari ≈ 740 px visible.

### 5.1 `/` — brand home (13 sections; 01–03 stock · 04 arena · 05–12 stock · 13 navy)

**01 · Hero** (Gallery container, `lg:grid-cols-12 items-center`, `pt-8 lg:pt-16 pb-12 lg:pb-24`; no rule).
- Text `lg:col-span-6`, in this order: H1 → subhead → pills (`FROM YOUR PHOTOS` accent · `REGISTERED EDITION`
  outline, `mt-stack`) → **price line** (`font-body font-medium text-body tabular-nums`: `from {from:digital}
  digital · {price:GDE-ANY-SET-PRINT} printed set`) → **DeliveryChips** `standard` → **CtaPair** (`Order on
  Etsy →` primary · `Look up a card` outline) → TrustLine. The clock is read before the tap (graft 1).
- Object `lg:col-span-6`: `BeforeAfter`. **before** = `etsy/listing-images/01-football-card/src/s02-before-b.png`
  (970 × 1224, sideline sled push at dusk — matches the COPY alt) in a 3 : 4 box, 168 px wide on desktop.
  **after** = a stock `Mat` in a 4 : 5 box (≈ 520 px wide desktop): poster `01-football-card/src/FB-FS-poster.png`
  (1944 × 2592, 3 : 4) at 68 % of the mat width, top-left; card front `FB-FS-card-FRONT.png` (750 × 1050) as a
  `CardFace` at 34 % overlapping the poster's lower-right by 30 %; card back `FB-FS-card-BACK.png` at 30 %
  behind and 6 % lower-left of the front. Presentation scale (the one plate that breaks one-px-per-inch);
  true scale lives on `/complete-set` §3 and `/posters` §3. No certificate, no badge (finding 6). C13 once under
  the mat (the before photo carries its own in-frame). Alt per COPY §2.1-1 minus "and certificate".
- **LCP**: the poster, `priority`, `fetchPriority="high"`, `sizes="(max-width:639px) 1px, (min-width:1024px) 420px, 60vw"`
  — the poster is `hidden sm:block`, so the mobile preload resolves to the smallest candidate (~10 KB) and the
  card front (`loading="eager"`, `sizes="(max-width:639px) 100px, 180px"`) is the mobile LCP.
- **Above the fold at 390** (header 56): H1 3 lines ≈ 125 → subhead 2 lines 47 → pills 32 → compact device row
  (before 96 px wide + arrow + card front 100 px; poster and back `hidden sm:block`) 150 → price 26 → chips 32 →
  **primary CTA at ≈ 572–620 px** → secondary 628–676 → TrustLine to ≈ 728. Price, clock and both buttons sit
  inside the first screen. No video, no sport tabs.
- Load motion: the object column runs one 240 ms fade + 4 px rise (CSS keyframes); nothing else.

**02 · Four fears** (Page container, `pt-6 lg:pt-10 pb-16 lg:pb-24`, **no rule** — the row starts tight under
the hero, graft 5). Index `02 / 13` on a rule-less row, H2, subhead, `FourFears long` with Anton questions
(§4.8). At 390 the H2 lands at ≈ 790 px and the second card's bottom at ≈ 1 250 px — inside 1.5 screens.

**03 · Three product families** (Gallery container). Three `FamilyCard`s (`lg:grid-cols-3 gap-6`), media in a
4 : 5 arena mat:
- Trading Cards: `01-basketball-card/src/BK-SN-card-FRONT.png` (62 % of mat width) + `BK-SN-card-BACK.png`
  (same size, 30 % right / 12 % down, behind) — two `CardFace`s, never the slide.
- Posters: `02-basketball-poster/room-SN.png` (2048², a real room shot) `object-cover object-[50%_38%]`.
- Complete Set: composed from faces — `02-basketball-poster/src/BK-SN-poster.png` (1296 × 1728) at 70 % of the
  mat width + `BK-SN-card-FRONT.png` at 26 % overlapping bottom-right + `BK-SN-card-BACK.png` behind it. **Not**
  `04-complete-set/v3/tile-printed.jpg` (it carries a count-bearing pack face); no certificate layer (finding 6).
- `from {from:family}` in `font-body font-bold text-[1.25rem]`, the three truths, the CTA; under the row, once,
  **Free printed Certificate of Authenticity in every shipped package.** in `font-body font-medium`. C13 once.
- Rendered ≈ 400 px → `sizes="(min-width:1024px) 400px, (min-width:768px) 45vw, 90vw"`.

**04 · Proof before print** — **arena band**, full bleed, `py-16 lg:py-32`, `data-surface="arena"`, Gallery container.
- Left `lg:col-span-7`: `BracketFrame tone="arena" label="PROOF — NOT FINAL"` around
  `etsy/listing-images/03-senior-night/src/bsb-sr-proof.png` (1400 × 1092 — the proof sheet with the tiled
  watermark and the footer strip), `aspect-[1400/1092] object-contain`, 640 px wide, `--shadow-card-arena`.
  Caption per COPY + C13 in `text-arena-muted`.
- Right `lg:col-span-5`: `Pill accent` `YOU SEE IT FIRST` (the one accent fill on the band besides the brackets),
  H2 white, `h3` **OUR PROMISE**, C1 in `text-body text-white/90`, `Read the full promise` (arena outline) +
  `See how it's made` (text link, white). Mobile: media first — the proof is the argument.

**05 · Registered, not just printed** (Page container, two-up).
- Left `lg:col-span-5`: `CardFace` of `BK-SN-card-BACK.png` (**QR-patched derivative**, §6.4) at `max-w-[360px]`
  on an arena mat, `QrRing` at the measured constant; the ring is the accent "arrow" of this section. C13 in-frame.
- `BeforeAfter` arrow (right on desktop, down on mobile).
- Right `lg:col-span-6 lg:col-start-7`: H2, body (COPY), `EditionPanel` demo for `GDE-SN-BKB-2026-12`
  (`getCard`, `demoLabel`), then `LookupForm inline` (label **Card ID**, `placeholder="GDE-SN-BKB-2026-12"`,
  `pattern="[A-Za-z0-9-]{8,24}"`, `autocapitalize="characters"`), link **What is a registered edition?**.

**06 · Six finishes, one athlete** (Gallery container; 7 tiles; snap row < lg, `lg:grid-cols-7 gap-4`).
Tile = hairline plate → arena mat → `CardFace` (`labelled`) of `01-basketball-card/src/BK-{SN,CA,FS,HE,SS,PR}-front.png`
(750 × 1050; rendered ≈ 170 px → serve 440) → finish name as the pre-exported SVG label
`public/images/finishes/label-<CODE>.svg` (`h-4 fill-current text-ink`; **until exported**: Space Grotesk 700
`text-[0.9375rem]` — the home page stays on two families) → material line from `styles.ts` in `caption`.
Seventh tile: `03-senior-night/src/sr-card-front.png` (Marcus in Senior Night gold — the same athlete),
`border border-gold` on the plate, `Pill gold` **SENIOR NIGHT EDITION** on an arena `Plate` inside the mat (gold
stays inside the media), label **Senior Night edition**, the SR material line → `/senior-night`. C13 once under
the row. Whole tile is the link (`/trading-cards#finishes` in F1).

**07 · Seventeen sports** (Gallery container; `grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 lg:gap-6`;
COPY order; 6 + 6 + 5, last row left-aligned). Tile = hairline plate → arena mat `aspect-[4/5]` → `CardFace`
at 76 % width (`labelled`) → sport name `font-body font-medium text-[0.9375rem]` → `caption` "plain back" /
"name + crest" from `backLine()`. **Sources (square only, §6.3)**: basketball `BK-SN-front.png` · football
`01-football-card/src/FB-FS-front.png` · baseball `01-baseball-card/src/BB-HE-front.png` · soccer
`01-soccer-card/src/SC-CA-front.png` · volleyball `01-volleyball-card/src/VB-SS-front.png` · cheerleading
`01-cheerleading-card/src/CH-PR-front.png` · softball `03-senior-night/src/sfb-sr-front.png` · wrestling
`03-senior-night/src/wrs-sr-front.png` (an SR front is a real card of that sport; the tile names no finish).
**Text tiles** (same plate, navy mat, silver shield 40 px, sport name in Anton 1.5 rem uppercase with a full
stop, the back line in Barlow) for ice hockey, lacrosse, gymnastics, track & field, swimming, tennis, golf,
pickleball and skateboarding until the square re-export lands (§6.3) — never a rounded export, never a cropped
one, never a placeholder card frame. C13 once under the grid. Alt per COPY §0.5, no number for the five.

**08 · How it's made — in plain words** (Page container). Rule + index, H2, the one sentence in
`font-body font-medium text-[1.125rem]`, C2 in body, then three `BracketFrame`s `grid md:grid-cols-3 gap-6`:
1. `label="PHOTO CHECK · VERDICT"`: the **HTML verdict card** — a `Ledger` at `text-[0.8125rem]` with the four
   rows from COPY §2.6 gate 1 (FAIL · FAIL · NOTE · PASS chips + the sentences), typeset from COPY strings, never
   from `_intake.json` (it carries similarity scores).
2. `label="REFERENCE PLATE · THREE VIEWS"`: `art-pipeline/out/approved/basketball/_identity.png` (2400 × 1792,
   three views of Marcus on grey), `aspect-[2400/1792] object-contain`, 360 px.
3. `label="PROOF — NOT FINAL"`: `bsb-sr-proof.png` again at 360 px (cached from §04).
Captions per COPY; C13 under 2 and 3. CTA **See the full process** (outline).

**09 · Your athlete's photos** (Page container, `lg:grid-cols-12`). Text `lg:col-span-7`: H2, C3 in
`font-medium`, the "4–10 photos and nothing else" sentence, TrustLine, the two links with accent arrows. Right
`lg:col-span-4 lg:col-start-9`: a two-row `Ledger` in the copy's own words — `We ask for` / `4–10 photos and
nothing else.` · `Never` / `No date of birth, no home address, no school name.` No image.

**10 · Proof wall** (Gallery container, `lg:grid-cols-12 gap-8`).
- Left `lg:col-span-5` **Example editions** (`h3`): `grid grid-cols-4 gap-3` of eight `CardFace`s (`labelled`) —
  basketball, football, baseball, softball, soccer, volleyball, cheerleading, wrestling from the §07 sources
  (≈ 110 px → serve 240); C18 in `caption` under the grid; link **All seventeen sports**.
- Centre `lg:col-span-4` **One rejected take, one approved** (`ProofRejectedPair`): two `BracketFrame`s side by
  side on one arena mat, each around a 2 : 3 frame (`aspect-[2/3] object-contain` — a verification artefact is
  never cropped): FAIL = `art-pipeline/out/athletes/ice-hockey/_versions/action2-1.png`, PASS =
  `art-pipeline/out/athletes/ice-hockey/action2.png` (both 1696 × 2528). `StatusChip` above each, the fixed
  captions from COPY §2.1-10 in Anton 1 rem + `small`. C13 under the pair. Link **See all six gates**.
- Right `lg:col-span-3` **We are new**: `h3` + C16 + link **Read the promise**.
- Reviews: no block, no placeholder, no reserved space (`publishedReviews().length === 0`). Mobile order:
  gallery → pair → we-are-new.

**11 · Founder note** (Page container, centred `max-w-[52ch]`): H2 centred, `FounderNote variant="home"`
(two paragraphs, signature, no image), the three-segment line in `small`, link **About the studio**.

**12 · Occasions + closing CTA** (Gallery container). `grid md:grid-cols-3 gap-6` of occasion plates
(`rounded-ui border border-hairline p-6`):
- **Senior Night**: arena mat 4 : 3 with `03-senior-night/src/bsb-sr-front.png` at 48 % (gold inside the art),
  `h3` **ONE LAST HOME GAME.**, the line, **no DeliveryChips** (finding 8), **Plan their senior edition** (outline).
- **Christmas** (server date Oct 20 → Jan 5; otherwise the grid is `md:grid-cols-2`): no media; `h3`, the
  order-by sentence with `{date:…}`, **See Christmas timing**.
- **End of season / team gift**: no media; `h3`, body, **Email us about a team**.
Closing: rule, H2 **ONE ATHLETE. ONE EDITION.** centred (the one centred H2 on the page), `CtaPair` centred,
`DeliveryChips standard` (the same instance wording as the hero), TrustLine.

**13 · Footer** — §4.20 with the score bug.

### 5.2 Product family template (`/trading-cards` · `/posters` · `/complete-set`; 7 sections, all stock)

**1 · Hero + tiers** (Gallery container).
- Row A `lg:grid-cols-12 items-start`: text `lg:col-span-6` — H1, subhead, pills (`mt-stack`; the first is
  `accent` on `/trading-cards`: `FRONT + BACK`), **anchor line** (`/trading-cards`: `font-body font-bold text-body`
  `Twelve printed cards for {price:GDE-ANY-CARD-P12} — {perCard}.`), `DeliveryChips standard` + C11 in `small`
  (+ C12 on `/complete-set`), `CtaPair`, TrustLine. Object `lg:col-span-6`, a hairline plate with an arena mat:
  - `/trading-cards`: **a compact static pair** — `BK-SN-card-FRONT.png` and `BK-SN-card-BACK.png` as two
    `CardFace`s side by side at 44 % each in an `aspect-[16/10]` box (≈ 220 px tall at 390). No flip in the hero
    (graft 2): the flip lives in §3 where it may autoplay once. C13 under the mat.
  - `/posters`: `02-basketball-poster/room-SN.png` in `aspect-[4/3] object-cover object-[50%_40%]` (keeps the
    framed poster and the lamp); a stock `Plate` caption `18 × 24 SHOWN · FRAMED` in the record style. C13.
  - `/complete-set`: the home hero cluster with the SN basketball set (`BK-SN-poster.png` + `BK-SN-card-FRONT/BACK.png`)
    in an `aspect-[16/10]` box; no certificate layer.
  - **390**: H1 (3 lines) → subhead → pills → object ≈ 220 px → anchor line → chips → **primary CTA ends at ≈ 680 px**
    → TrustLine; the sport picker and the first tier follow under the fold.
- Row B (`mt-12`): the **sport picker** left-aligned above the tiers — label **Their sport** + a native
  `<select>` (`h-12 rounded-ui border border-ink/40 bg-stock px-4 font-body font-medium`; `?sport=` prefill,
  server-rendered; a ≤ 500 B island rewrites every CTA href on the page and shows the numberless note in
  `small` under it for the five sports; `/posters` lists only `hasPosterArt` sports) → `TierCard` × 4 (3 while
  the pack / XL / Ultimate rows are `enabled:false`) → under the row: the certificate line (`/posters`: the
  "No certificate ships with a poster alone" line instead) in `font-body font-medium` → `CapacityNote`.
- LCP: `/trading-cards` and `/complete-set` = the front face (`priority`, `sizes="(min-width:1024px) 300px, 44vw"`);
  `/posters` = the room shot.

**2 · Spec sheet** `id="spec"` (Page container, `lg:grid-cols-12`): rail `lg:col-span-3` with rule + index, H2
**THE SPEC SHEET.** and subhead **A table instead of adjectives.**; the `Ledger size="lg"` fills `lg:col-span-9`,
rows verbatim from `lib/catalog/tiers.ts` (the pack row hidden with its tier). This plate is the page's second
hero — larger values, `py-4` rows, no other object in the section.

**3 · Front + back, registered / To scale / Everything counted** (Gallery container).
- `/trading-cards` — **FRONT + BACK. REGISTERED.** `lg:grid-cols-12`: left `lg:col-span-7` a hairline plate
  with an arena mat holding the **CardFlip** (`maxWidth 360`, autoplay once at ≥ 50 % visibility — it is below
  the fold; MP4 fallback `card-flip/out/GDE_SN_CardFlip_1080x1350.mp4` re-encoded per §6.5) and, at ≥ md, the
  **static back** beside it at 55 % size so the QR and ID are seen without interaction; four numbered callouts
  over the static front (`ol` of 22 px `rounded-full bg-accent text-ink font-label text-[0.75rem]` discs at
  manifest-measured positions with 1 px hairline leaders; as many discs as list items; discs hidden < sm).
  Right `lg:col-span-5`: body (COPY), the `QrRing` back at column width, `EditionPanel` demo, link.
- `/posters` — **TO SCALE. THE PERSON IS THE RULER.**: the `ToScaleSheet` SVG (§4.15) on a stock mat at
  Page width, body under it.
- `/complete-set` — **EVERYTHING COUNTED. DELIVERED IN STAGES.**: a horizontal timeline (`ol` of three stops on
  a hairline — `Files` · `Printed cards and poster` · `Sealed pack` (hidden with Ultimate); 8 px ink dots, `label`
  names, `small` text; vertical < lg), C10, the "three tracked packages" line; beside it the five-folder `Ledger`
  from section 2 next to `BK-SN-poster.png` (3 : 4, 320 px) on a mat; `EditionPanel` demo → `/registry`. The
  `19-everything-counted.png` slide is not shown.

**4 · One athlete, six finishes** `id="finishes"`: the `/` §06 row component (six tiles, no SR tile), subhead,
the SN line in `small` with a link. `/posters`: the same six tiles with the poster faces where exported
(`etsy/listing-images/0N-<sport>-poster/src/<XX>-<FIN>-poster.png`, 3 : 4 boxes); a finish without a poster
face renders the card front — never a room shot under 240 px.

**5 · Sports without numbers** `id="sports"` (`/trading-cards`, `/complete-set`): two-up — left `lg:col-span-5`
`01-cheerleading-card/src/CH-PR-front.png` + `CH-PR-card-BACK.png` (750 × 1050, square) side by side at 46 %
on an arena mat (**not** `marketing/cards/cheerleading-*`); right H2 **NO NUMBER? NO PROBLEM.**, C9 in
`font-medium`, the checkout note in `small`. Then the 17-sport grid (the `/` §07 component). `/posters`:
**THEIR NAME ON THE WALL.** with the poster copy and no cheer pair.

**6 · Still deciding?** — the short strip inside section 7's CTA block, not a band of its own.

**7 · Blocks + FAQ + CTA** (Page container): the four canon blocks `grid md:grid-cols-2 gap-x-12 gap-y-10`,
each `h3` + body; `FaqList jsonLd` with the six `faqSubset` items (`details` rows `border-t border-hairline py-5`,
`summary` in Space Grotesk 700 1.125 rem with a 24 px plus glyph rotating 45° in 180 ms); closing rule,
`CtaPair`, short strip, `DeliveryChips standard`, TrustLine.

### 5.3 `/senior-night` (6 sections, stock; gold only inside media and in the gold pill)
1. **Hero**: text — H1 **ONE LAST HOME GAME.**, subhead, `Pill accent` **SENIOR EDITION · 1 OF 1** (the page's
   one primary claim), `DeliveryChips seniorNight` (the page's only chip), `CtaPair` (`Order on Etsy →` →
   `/go/etsy/GDE-ANY-SNSET` · `Look up a card`), TrustLine. Object: a composed cluster on an arena mat —
   `03-senior-night/src/ftb-sr-poster.png` (1296 × 1728) at 62 % + `ftb-sr-front.png` (750 × 1050) at 24 %
   overlapping bottom-right + `ftb-sr-back.png` behind; a `Pill gold` on an arena `Plate` inside the mat. Never
   the `01-hero.png` slide (it bakes "NUMBERED"). C13 under. **390**: H1 (2 lines) → subhead → pill → object
   (poster + front, back hidden) → chips → CTA → TrustLine. LCP = the SR poster.
2. **Order-by calculator**: a plate `rounded-ui border border-hairline p-6 lg:p-10 max-w-[40rem]`: H2 **WHEN IS
   SENIOR NIGHT?**, label **Senior night date**, `input type="date"` (§4.21), help, primary **Check what's in
   time**; results as a three-row `Ledger` inside `<output aria-live="polite">`, each `dd` starting with a
   `StatusChip` (`pass` / `fail`) then the COPY sentence; the honest fallback in `font-medium` with the outline
   button **Gift the digital first — print the gift note**; C17 under the plate. Printable gift note
   (`_gift-note.tsx`, `hidden print:block`): A5/letter, `border-t border-gold` (1 px), silver shield 40 px,
   Anton heading, body, sign-off rule, small line; `{First}` from an optional text input beside the button.
3. **What makes it a senior edition** (`grid md:grid-cols-2 lg:grid-cols-4 gap-6`), each item a `BracketFrame`:
   `label="THE BACK"` → `CardFace` `bsb-sr-back.png` · `label="THE CERTIFICATE"` → `bsb-sr-cert.png` (1275 × 1650,
   count-neutral; the "numbered" wording is flagged to the owner, finding 6) · `label="BADGE AND STICKER"` →
   `bsb-sr-badge.png` (1600²) and `bsb-sr-sticker.png` (2600 × 1280) together on one stock mat · the pack panel
   hidden. Titles in `h3`, text in `small`; C13 once on the group.
4. **Nine sports** (Gallery container; `grid grid-cols-3 gap-3 sm:gap-5 max-w-[900px]` — three rows of three at
   every width): `CardFace`s of `03-senior-night/src/{ftb,vlb,chr,soc,bsb,sfb,wrs}-sr-front.png` +
   `sr-card-front.png` (basketball); ice hockey = the §07 text tile. Cheerleading caption "name + crest — no
   number". Tile → `/go/etsy/GDE-<CODE>-SNSET` where live, else the any-sport SN listing. The line + link under.
5. **The whole senior class**: Page container centred `max-w-[52ch]`, H2, body, CTA (mailto).
6. **Trust stack**: four blocks + C17 + `FaqList jsonLd` (`faqSubset("senior-night")`, 4) + `CtaPair` +
   `DeliveryChips seniorNight` + TrustLine.

### 5.4 `/how-it-works` (7 sections, stock)
1. **Hero** (Page container): H1, subhead? — none in COPY; C2 as the lead (`font-medium`), the second paragraph
   in body, pills `SIX GATES` (accent) · `YOU SEE IT FIRST` (outline) after `mt-stack`. No media — the gates are
   the media. LCP = text.
2. **Six gates** `id="gates"`: `GateRow` sticky (§4.12), then six `<details open name="gates" id="gate-N">` on
   a vertical hairline spine, each `summary` = index in Anton 2.75 rem + name in Anton 1.5 rem + the artefact
   name in `small`; body = evidence split (§2.2), artefact side alternating, every artefact in a `BracketFrame`
   with its file-tab label, C13 on every gate that shows a person:
   1. `PHOTO CHECK · VERDICT` — the HTML verdict card (`Ledger`, four rows with chips, the footer line, the
      photo-guide link).
   2. `KIT PLATE · FRONT` / `KIT PLATE · BACK` — `art-pipeline/out/approved/basketball/_kit.png` and `_kit-back.png`
      (2048²) side by side `grid-cols-2 gap-3`, `aspect-square object-contain`; the README §29 side note in a
      stock `Plate` with a `note` chip.
   3. `REFERENCE PLATE · THREE VIEWS` `id="likeness"` — `_identity.png` (2400 × 1792) with `_identity-back.png`
      at half width under it.
   4. `THE SHOTS · 1–4` — `hero.png`, `action2.png`, `action3.png`, `back.png` (1696 × 2528) in `grid grid-cols-4 gap-2`,
      each `aspect-[2/3] object-contain`, record labels 1–4.
   5. `FRAME BESIDE ITS PLATE` — `art-pipeline/out/athletes/wrestling/_diff/hero-vs-_kit.png` (2363 × 1400,
      the real `art:diff` sheet), `aspect-[2363/1400] object-contain`; no numbers in the caption. (The only diff
      export on disk is wrestling; if `npm run art:diff -- --athlete basketball` lands before F1 exit, swap the
      source, keep the caption.)
   6. `PROOF — NOT FINAL` — `bsb-sr-proof.png`.
3. **The rejected take** — H2, subhead, the `/` §10 pair at full width (two 2 : 3 frames up to 360 px each on
   one arena mat), the sentence under in `font-medium`.
4. **The effort sentence** — a ruled band (`border-y border-hairline py-12`) with the Anton line at `text-h2`,
   left-aligned, `max-w-[26ch]`. Nothing else in the band.
5. **What you approve, and when** — the ten-state timeline: `ol` horizontal at ≥ lg (stops on a hairline, 10 px
   ink dots, the two approval stops with a 12 px accent-ringed dot, state names in Anton 0.875 rem, the
   approval phrases in `caption italic`), vertical with the spine < lg. Under it C20, the revision line, C10,
   the reminder line.
6. **Who prints it** — three `Ledger` rows (C19 name / what it prints), the labs sentence, C4.
7. **FAQ (6)** + CTA block as product §7.

### 5.5 `/guarantee` (stock)
H1, subhead; C1 inside a `BracketFrame label="OUR PROMISE"` on a stock plate (`p-6 lg:p-10 text-[1.125rem] max-w-[60ch]`)
— the one time the brackets frame text. H2 **WHAT THAT MEANS, EXACTLY.** + four ruled rows (`divide-y divide-hairline`,
`h3` at 1 rem + body). **Shipping table**: `ShippingTable` (5 columns ≥ md, stacked records < md; "(per lab)"
in `text-muted-text`) + C11 · C12 · C10 in `small`. **WHERE A REFUND HAPPENS.** sentence in `font-medium`.
**THE REFUND LADDER.** `id="refunds"` as a `Ledger` (stage key at 38 %). **We are new — long** in
`border-t border-hairline pt-6` body (not italic — "we" voice), signature **— John Birch**, link, `CtaPair` +
TrustLine. No imagery beyond the brackets — the authority is the typesetting.

### 5.6 `/photo-guide` (stock; print stylesheet)
H1, subhead, pills `4–10 PHOTOS` (accent) · `ORIGINALS, NOT SCREENSHOTS` (outline), C5 lead. **Checklist**: `ol`
of nine rows `grid grid-cols-[2.5rem_1fr] gap-4 border-t border-hairline py-5 last:border-b` — index in Anton
1.5 rem, title in Space Grotesk 700, explanation in body; the intake mapping is not rendered. **What we never
ask for** as a one-row `Ledger`. **GOOD, AND NOT YET.**: `public/images/photo-guide.webp` (1536 × 1024) whole in a
`BracketFrame label="PHOTO CHECK · EXAMPLES"`, `aspect-[3/2] object-contain`; under it `grid grid-cols-3 gap-2`
of six captions with `StatusChip`s (PASS × 3 top, FAIL × 3 bottom) aligned to the panels — captions follow the
image's order, never moved to fit the copy. C13 under. Closing line, **Print this checklist** (outline,
`window.print()`), **See how photos become a card**, `CtaPair` + TrustLine. `@media print`: header, footer,
media and buttons hidden; H1, the nine rows, the never-asked line and the closing line kept; 16 mm margins.

### 5.7 `/about` (stock)
1. H1, subhead; founder card = a `Ledger` (Name / Role / Contact; the city row omitted until supplied), no photo;
   the story in body with the bold leads in `font-medium`; `FounderNote variant="about"` after it.
2. **Two essays** `grid lg:grid-cols-2 gap-x-12 gap-y-16`, each H2 + body; the second ends with a link.
3. **Independence**: H2, C4, C6, the crest sentence in `font-medium`.
4. **Studio and partners**: H2, lead, the three C19 `Ledger` rows, the labs sentence.
5. **The legal entity**: H2 + imprint `Ledger` (or the fallback line), the Lithuania line.
6. **The numbers that are true today**: `TrueNumbers tone="stock"` (§4.17) — `17` · `7` · `27` · `2026` · `2.5 × 3.5`,
   each linked to its proof page; the pack item hidden until D18. `CtaPair` + TrustLine.

### 5.8 `/registry` (stock, centred `max-w-[40rem]`)
1. H1 **LOOK UP A CARD.**, subhead, `LookupForm` (input `h-16 text-[1.125rem]`, mask hint as placeholder, help,
   primary **Find this edition** full width on mobile), status line, the demo line. At ≥ sm a `CardFace` of the
   QR-patched `BK-SN-card-BACK.png` with the `QrRing` at 200 px sits beside the form — "this is where the ID is".
   No list of cards, no "recent".
2. **What a registered edition is**: the **ID anatomy** in HTML — `div.flex.justify-center.gap-1` of five segments
   in the record style at `text-[1.5rem] md:text-[2rem]`, dashes in `text-muted`, each segment with a
   `border-t border-ink pt-2 caption` label (style · sport · season · number / E##); the finish-code legend
   and the six explanatory items as `Ledger`s (bold lead as `dt`, sentence as `dd`).

### 5.9 `/faq`, `/contact`, legal, `/accessibility`
- `/faq`: Page container; H1 + subhead; a sticky desktop group index in the left rail (`lg:col-span-3 sticky top-20`,
  `small` links, `aria-current`); groups in `lg:col-span-9`, each H2 + `FaqList` (`jsonLd` on this page only).
- `/contact`: centred `max-w-[44rem]`; H1 **TALK TO A PERSON.**, subhead with the mailto link, primary **Email
  hello@gamedayedition.com**, the topics as a `Ledger`, imprint or fallback. No form.
- Legal pages (`/privacy`, `/privacy/biometric`, `/terms`, `/accessibility`): read column `max-w-[42rem]`; H1;
  the version line in the record style under the H1; H2 per section; retention and subprocessor tables as
  `Ledger`s (`id="subprocessors"`, `id="refunds"`, `id="registry"` anchors with `scroll-margin-top: 5rem`).
- `not-found.tsx` / `error.tsx` / 410: centred `max-w-[40rem]`, shield 48 px (navy; silver on the `/c` variant),
  H1, body, the inline lookup on the `/c` variant, links as outline buttons. Nothing decorative.

### 5.10 `/c/[cardId]` — the QR digital twin (arena, mobile-first, JS < 300 KB)
Route layout: `data-surface="arena"`, `SiteHeader tone="arena"` (§4.20 — silver shield, white wordmark,
`REGISTERED EDITION` pill, **no shop CTAs**), the record's finish pair only (`preload: false`), `SiteFooter`
(navy) at the end — the imprint is on every page. Content `container-site max-w-[35rem] lg:max-w-(--container-site)`;
≥ lg `grid lg:grid-cols-[minmax(0,1fr)_26rem] gap-12 items-start` (flip left, panel right, header spanning).
1. **Identity header** (`pt-6`): name in `font-finish-display uppercase text-[2.25rem] md:text-[3.5rem] leading-[0.95] text-balance`
   (Playfair for SR keeps the card's case — `styles.ts` `displayCase`); a 4 px × 48 px bar in `team/primary`
   (silver gradient when the record has none); meta line in `font-finish-supporting uppercase tracking-[0.06em] text-[0.9375rem] text-arena-muted`
   (no `#` for numberless sports and adults, `showsJerseyNumber`); team colour on the name only when
   `teamAccent()` returns `mode: "text"`. Demo: C13 in `caption text-arena-muted`.
2. **Flip hero** (`mt-6`): `CardFlip` at `min(82vw, 340px)` centred, `autoplay={false}` (it sits above the
   fold at 390 — the first tap runs the signature curve, later taps 900 ms), faces `public/cards/<id>/front|back.webp`
   (900 × 1260, generated by `cards:assets` from the audited source — for `GDE-SN-BKB-2026-12` that source is
   `01-basketball-card/src/BK-SN-card-{FRONT,BACK}.png`, **not** `card-flip/assets/marcus-sn/` (white rounded
   corners); the back is QR-patched §6.4), `--shadow-card-arena`, "Tap to flip" under. Front = LCP (`priority`,
   `sizes="(max-width:768px) 82vw, 340px"`). **390**: arena bar 56 → pill + shield 32 → name 2 lines ≈ 86 →
   meta 20 → bar → flip 320 × 448 from ≈ 262 px → "Tap to flip" at ≈ 714. No `<video>` above the fold.
3. **EditionPanel** (`mt-8`): §4.7 with `copyButton`, `lastUpdated`, C15, the registry link; SR adds the EDITION row.
4. **Stats**: label **SEASON STATS** (SR **CAREER HIGHS**); `StatChip` row (≤ 3, omitted when empty); highlight
   in `text-body text-white/90`; **CLASS OF 2027** in the supporting font when allowed; SR rows in the supporting
   font; the SR quote in Playfair Display italic `text-[1.125rem] border-l-2 border-gold/60 pl-4`.
5. **Downloads and share** (`mt-8`): label **DOWNLOADS**; arena outline `sm` buttons in `grid sm:grid-cols-2 gap-2`
   (demo: front PNG · back PNG · flip GIF; real: the five wallpapers when `delivered`, the safe-zone note in
   `caption`); `ShareRow` (**Copy link** · **Share** when `navigator.share` exists). Toasts `role="status"`, 240 ms fade.
6. **About this finish**: two `small text-white/80` lines + link (`/trading-cards#finishes` in F1; SR → `/senior-night`).
7. **CTA row by channel**: `demo-etsy` → one arena outline **Get yours on Etsy →**; otherwise primary **Order on
   Etsy →** (the one orange element on the arena page) + arena outline **Also on Etsy →**. No prices, no coupons.
8. **Privacy and control footer** (`mt-12 border-t border-arena-hairline pt-6 small text-arena-muted`): the
   visibility sentence, **Report this card** (mailto), the manage sentence, the demo caption. Then `SiteFooter`.
States: `private` → shield + the one sentence + **Look up a card**; unknown → the `/c` 404 variant with the
inline lookup (arena); `deleted` → 410 copy. OG: the front on arena + the edition strip (silver rule, record
text), no name on unlisted. Reduced motion: the Front / Back switch. Client JS: flip + copy/share only.

---

## 6. Imagery plan

### 6.1 The manifest is the only door
`lib/assets.ts` `SITE_ASSETS` (keys in CONTRACTS §5.9, amended in §10.3) is executed by `scripts/site-assets.ts`
(sharp) into `public/images/**`; `/c` faces by `scripts/card-assets.ts` into `public/cards/<id>/`. Both refuse
any source whose sha256 is in `scripts/denylist.json` (every pack face and panel, every evergreen certificate,
`01-*-card/02-front-back-registered.png`, `03-senior-night/01-hero.png`, every Nia Brooks export, `public/images/sport-examples/*`),
record `sha256(src)` in `public/images/.manifest.json`, and never upscale. **CI fails on any import of `etsy/`,
`marketing/` or `art-pipeline/` from `app/` or `components/`** (iCloud eviction guard). Derived widths: card faces
300 / 450 / 600 / 900 (WebP q88, `smartSubsample`); hero before 480 / 720 / 960; posters 640 / 900 / 1200;
artefacts and rooms 600 / 900 / 1200 / 1600 (WebP q82; hero LCP also AVIF q55). Every `<Image>` carries `sizes`.

### 6.2 The corner audit (edge continuity, both directions)
For every asset tagged `card`: at (2,2), (w−3,2), (2,h−3), (w−3,h−3) — **fail** if alpha < 255, or if the pixel
is within ΔE 8 of `#FFFFFF` / `#F4F3EF` *and* the pixel 16 px diagonally inward differs from it by ΔE > 20.
Also assert aspect 5 : 7 ± 1 % (cards) or 3 : 4 ± 1 % (18 × 24 posters). A failure is a build failure — never
a CSS mask, never a crop. `tests/design-system.test.ts` greps `components/CardFace.tsx`, `CardFlip.tsx`,
`BracketFrame.tsx` and `*Composite*.tsx` for `rounded-(?!card|none)` / `border-radius` and for `scale-[`.

### 6.3 Card faces — sources and the re-export task
- Six finishes (Marcus): `etsy/listing-images/01-basketball-card/src/BK-{SN,CA,FS,HE,SS,PR}-front.png` (750 × 1050)
  → `finish.<CODE>.front`; seventh `03-senior-night/src/sr-card-front.png` → `finish.SR.tile`.
- Demo pair everywhere: `BK-SN-card-FRONT.png` + `BK-SN-card-BACK.png` (QR-patched) → `cards.demo.front|back`.
- 17-sport grid (`sport.<slug>.front`): the eight square sources in §5.1-07; the nine others are `status: "locate"`
  → text tile. **Wave-1 seo-assets task**: export the 15 sport fronts square-cut at 750 × 1050 from the sport
  template files in Figma (memory `gde-sport-template-files`, `gde-all-sport-files-built` — 23/23 files exist;
  `download_assets` per `gde-figma-asset-transfer`), run the audit, flip each key to `verified`. Target: before
  F1 exit; the text tile is the honest interim. `marketing/cards/*` and `public/images/cards/*.webp` are
  retired (rounded keyline); `public/images/finishes/*.webp` pass the corner probe but are provenance-unknown
  and unused.
- Senior Night: `03-senior-night/src/{ftb,vlb,chr,soc,bsb,sfb,wrs}-sr-front|back.png`, `bsb-sr-cert.png`,
  `bsb-sr-badge.png`, `bsb-sr-sticker.png`, `ftb-sr-poster.png` (1296 × 1728).
- Hero: `01-football-card/src/s02-before-b.png` (970 × 1224), `FB-FS-poster.png` (1944 × 2592), `FB-FS-card-FRONT|BACK.png`.
- Every face renders in `CardFace` at a rendered width never above 50 % of the served width; a face is never
  shown narrower than 96 px.

### 6.4 The QR patch and the decode test
`scripts/card-assets.ts` and the `home.qr-ring` / `cards.demo.back` entries: decode the QR (`jsqr` on sharp raw
pixels); if it does not resolve to `/c/<cardId>`, composite `public/cards/qr/<cardId>.png` (from `npm run qr:gen`)
over the measured QR square (`BK-SN-card-BACK.png`: x 48–186, y 787–995 px on 750 × 1050, quiet zone included),
then decode the output and assert. `tests/registry-card.test.ts` decodes every `public/cards/*/back.webp`.
The permanent fix — re-exporting the backs from Figma bound to `public/cards/qr/<id>.png` — is the owner's; the
patch is exact, deterministic and count-neutral in the meantime. The printed ID text on the back is untouched.

### 6.5 Flip video fallback
`card-flip/out/GDE_SN_CardFlip_1080x1350.mp4` → `public/cards/GDE-SN-BKB-2026-12/flip.mp4` re-encoded to 720 w
(`libx264 -crf 24 -movflags +faststart`, ≤ 1 MB), `preload="none"`, `poster` = the front; GIFs are download links
only. Per-card MP4s are matched by thumbnail, never by file name (`GDE_SNLIGHT_*` etc. are unlabelled).

### 6.6 Slides are never shown whole
A 2000² listing slide enters the site only as a text-free crop into `aspect-[4/5]`, `aspect-[4/3]` or
`aspect-square`, with an `object-position` measured at 2× and written into the manifest beside the source name.
In F1 no slide crop survives: the QR ring is drawn in CSS, the before → after device is rebuilt from faces, the
to-scale sheet is SVG, the four-shot callouts are HTML over the face, "everything counted" is the ledger.

### 6.7 Process artefacts (fictional roster only, audited)
`art-pipeline/out/approved/basketball/{_kit,_kit-back,_identity,_identity-back,hero,action2,action3,back}.png`;
`art-pipeline/out/athletes/wrestling/_diff/hero-vs-_kit.png`; `art-pipeline/out/athletes/ice-hockey/_versions/action2-1.png`
+ `…/ice-hockey/action2.png`; `03-senior-night/src/bsb-sr-proof.png`; `public/images/photo-guide.webp`. Never a
frame from `_intake.json`, never a real customer, never `orders/` (registry-card only, `--allow-orders`, unlisted
pages only).

### 6.8 Brand
`BrandMark` per CONTRACTS §3 (artboard rects stripped; navy on stock, silver gradient on arena; wordmark
`currentColor`). The shield is never orange, never a team colour, never the finish foil. Favicon and app icons
from the shield.

---

## 7. Motion and interaction
- **The single signature move is the flip** (§4.13): one 5 s run per scene, then 900 ms toggles; autoplay only
  below the fold, once, never in a hero, never on `/c`.
- **Reveal-on-scroll: none.** Nothing waits at opacity 0 for JS. The only load animation is the home hero object
  column's 240 ms fade + 4 px rise (CSS).
- **Hover** (180 ms): hairline → ink borders, 2 px arrow shifts, `brightness(0.94)` on the primary button,
  underline thickness on links. Nothing scales, lifts or zooms; bracket corners do not move.
- **EditionPanel** mount: 240 ms `@starting-style` on arena only.
- **Accordions**: native `details`; the plus glyph rotates 45° in 180 ms; content appears at once.
- **Sticky**: header everywhere; `GateRow`; the `/faq` group index at ≥ lg. No sticky bottom bars.
- **Reduced motion**: flip → Front / Back switch; hero rise, panel slide and glyph rotation → none (global rule
  in CONTRACTS §1.1).
- No parallax, scroll-jacking, marquee, counters, cursor effects, floodlights, grain or looping video.

---

## 8. Accessibility and performance

**Contrast** (every pair a builder may use): ink on stock 15.9 : 1 · `muted-text` on stock 5.4 : 1 · `muted`
only ≥ 24 px (or ≥ 18.66 px bold) · ink on accent 6.2 : 1 (never white on accent) · white on navy 13.9 : 1 ·
white on arena 19.6 : 1 · `arena-muted` on arena 9.6 : 1 · silver on arena 12.6 : 1 · gold on arena 8.1 : 1 (SR media
only) · status chips = ink text + 1.5 px status border + dot (colour never the only carrier) · focus composite
≥ 3 : 1 (§4.19) · team colours on `/c` gated at 4.85 : 1 by `teamAccent()`.
**Semantics**: one H1 per page; sections `aria-labelledby`; block titles as H3; `header` / `main#main` /
`footer` / `nav aria-label`; decorative arrows, brackets, rules, indices and rings `aria-hidden`; every image
has the COPY §0.5 alt (`lib/alt.ts`); forms with visible Barlow labels, `aria-describedby` help, `role="status"`
lines; `details/summary` for accordions; the flip is a real button with `aria-pressed` and a live region; tap
targets ≥ 44 px (buttons 48); layouts hold at 200 % zoom (rem type, `ch` measures, tables scroll).
**Performance**: LCP < 2.0 s on 4G — one `priority` image per page (home poster ≤ 90 KB AVIF at 900 w, product
front ≤ 40 KB at 450 w, `/c` front ≤ 180 KB at 900 w); CLS 0 (every image sized, `aspect-*` boxes, `display: swap`
with `adjustFontFallback`); fonts = Anton + Space Grotesk variable (preloaded) + Barlow 600 (`preload: false`),
`/c` adds one finish pair on use; images through `next/image` with tight `sizes`, everything below the fold
lazy; home image weight ≈ 1.2 MB desktop / ≤ 600 KB at 390; JS: server components throughout, islands =
menu 0.6 KB, flip ≤ 4 KB, copy/share 0.4 KB, sport picker 0.5 KB, SN calculator 2 KB, GateRow observer ≤ 1 KB;
`/c` First Load < 300 KB; no CSS-in-JS; no animation library.

---

## 9. Contradictions resolved (each in one line)
1. **Hero order**: A/B pills-above-H1 vs COPY/CONTRACTS D12 → title → subhead → pills → price → chips → CTA → TrustLine (graft 1 inside D12).
2. **Product hero media**: A flip / C static-until-tapped / B pair → compact static pair in `aspect-[16/10]`; the flip moves to §3 with one autoplay and a static back beside it.
3. **Tier price**: CONTRACTS `text-h3` vs graft 3 → Anton 2 rem (`--text-price`), struck compareAt beside, sale line under.
4. **TierCard media**: A 4:5 mat / B 1:1 stage / C faces → none; tiers are a rate card, families carry media.
5. **Complete Set tile**: `tile-printed.jpg` (COPY, B, C) vs A → composed from faces, no certificate layer.
6. **Home SN occasion chip**: COPY `{chips:seniorNight}` vs one-claim rule → no chip on `/`.
7. **FourFears**: A ruled section / B overhang → tight under the hero, no rule, no negative margin, Anton questions.
8. **True numbers**: A plain strip / C record row / B score bug → score bug in footer and `/about`; graft 10's `28` → `27` (COPY §2.4).
9. **Corner audit**: A opacity / B luminance / stop-gap crop → edge-continuity rule; **no `scale-[1.05]`** (graft 7 overrules graft 13 — it clips the keyline and cannot fix a rounded keyline); text tiles until re-export.
10. **`.card-face` utility vs `CardFace` component** → component; ESLint radius/accent rules; CI import ban.
11. **BracketFrame label**: CONTRACTS bottom-left / C file tab → file tab on the top rule; corners static.
12. **To-scale sheet**: A crop-or-rebuild / B whole slide / C SVG → SVG in inches.
13. **Rejected pair**: A text-only fallback / B football stand-in / C approved-only → the real ice-hockey pair (`_versions/action2-1.png` vs `action2.png`); football `s06-reject` passes the gate and is never labelled rejected.
14. **Hero trio**: A `04-complete-set/src/football-*` (rounded) / C `ftb-fs-*` (rounded) → B's `01-football-card/src/FB-FS-*` (square) + `s02-before-b.png`.
15. **Process gates**: A/B ice-hockey or football / C basketball → `approved/basketball` (Marcus) + the wrestling diff sheet; verdict from COPY strings.
16. **Muted text**: A `text-ink/70` / B `#565B61` / C `#5F636A` / CONTRACTS `text-ink/80` → `--color-muted-text #5F636A`; arena keeps CONTRACTS `#AEB6C2`.
17. **Status chips**: CONTRACTS/A filled → outline + dot + ink text.
18. **SN sport tiles**: graft 18 frame extraction → unnecessary; all eight src fronts exist and pass; ice hockey text tile.
19. **Flip replay**: A −1.5 s hold-skip / B 900 ms / CONTRACTS mirrored 5 s → 5 s once per scene, then 900 ms.
20. **`/c` chrome**: C arena mini-footer / A navy footer / B arena header → arena header without CTAs + navy imprint footer.
21. **Seventh finish tile**: B's P6 (`marcus-sn-card-front.png`, rounded) / A `bsb-sr-front.png` (different athlete) → `03-senior-night/src/sr-card-front.png` (Marcus SR, square) — "same athlete" holds.
22. **Atmosphere**: B floodlight/grain/blurred gym, C ghost shield → none; flat stock, flat arena.
23. **Header**: B blur + navy sheet / A solid + stock sheet → solid stock header, stock sheet.
24. **Section opener**: B/C eyebrows / A index → rule + index only; no eyebrow words exist.
25. **Demo card art source**: CONTRACTS `card-flip/assets/marcus-sn/` → `01-basketball-card/src/BK-SN-card-*` (square), QR-patched.

---

## 10. Contract deltas for Wave 0 (`design-system+shell`) — apply before Wave 1 starts

**10.1 `app/globals.css`**: add `--color-muted-text`, `--container-gallery` (+ `container-gallery` utility),
`--shadow-card-stock`, `--shadow-card-arena`, `--text-price`, `--animate-card-flip-quick` + `@keyframes card-flip-quick`
(0 % `rotateY(var(--from))` → 100 % `rotateY(var(--to))`, `scale` untouched). `:focus-visible` gains
`box-shadow: 0 0 0 1px var(--color-ink)` (`#fff` under `[data-surface="arena"]`). CONTRACTS §1.2 row "muted" now
reads: body-size muted text uses `text-muted-text`. `lib/fonts/site.ts`: Barlow `preload: false`.

**10.2 Components** (all in `components/`, props merged into CONTRACTS §3): new `CardFace`, `Mat`, `Ledger`,
`StatusChip`, `QrRing`, `ToScaleSheet`, `BeforeAfter`, `TrueNumbers`; `SectionHeading` + `index?: string`;
`BracketFrame.label` renders on the top rule; `GateRow` and `ProofRejectedPair` use `StatusChip`; `TierCard`
price `font-display text-price`, no media; `CardFlip` gains the once-then-900 ms rule and a `staticBackBeside?`
slot; `SiteHeader tone?: "stock" | "arena"` (arena = no CTAs); `SiteFooter` uses `TrueNumbers`;
`TRUE_COUNT_LINKS` entries become `{ figure, label, href }` (test: `figure` ⊂ `label`, case-insensitive);
`FourFears` questions in Anton; `app/(registry)/layout.tsx` renders `SiteHeader tone="arena"` + `SiteFooter`.

**10.3 `SITE_ASSETS` keys**: replace `home.hero.after` with `home.hero.poster | .front | .back`; `home.hero.before`
= `01-football-card/src/s02-before-b.png`; `home.rejected.fail | .pass` = the ice-hockey pair (`verified`);
`home.process.plate` = `approved/basketball/_identity.png`; `finish.SR.tile` = `03-senior-night/src/sr-card-front.png`;
`sport.<slug>.front` per §5.1-07 (eight `verified`, nine `locate`); remove `cards.front-back`, `cards.six-finishes`,
`set.tile.printed`, `set.counted`, `sn.hero`, `posters.scale`, `cards.four-shots`; add `sn.hero.poster | .front | .back`,
`cards.cheer.front | .back` = `01-cheerleading-card/src/CH-PR-front.png` / `CH-PR-card-BACK.png`,
`how.gate.kit-back`, `how.gate.plate-back`, `how.gate.shots.1–4`, `how.gate.verification` = the wrestling diff.
`DEMO_ART_SOURCES["GDE-SN-BKB-2026-12"]` = `01-basketball-card/src/BK-SN-card-{FRONT,BACK}.png`.

**10.4 Tests / scripts**: corner audit per §6.2 in both asset scripts; QR decode assert (§6.4); ESLint
`no-restricted-syntax`: `rounded-*` (other than `rounded-card`/`rounded-none`) and `scale-[` in `CardFace`,
`CardFlip`, `BracketFrame`, `*Composite*`; `bg-accent` / `text-accent` / `border-accent` only in `Pill`,
`CtaPair` (primary), `BeforeAfter` (arrow), `BracketFrame`, `QrRing`, the callout discs and `globals.css`;
`tests/design-system.test.ts` also fails on any `etsy/|marketing/|art-pipeline/` string in `app/**` or
`components/**` imports, and on `TrueNumbers` figures that are not substrings of their labels.

---

## 11. Builder checklist (tick every line before your DoD note)
1. Every string is pasted from `docs/f1/COPY.md`; CANON via `lib/copy/canon.ts` / `block()`; no `$` literal; nothing from §0.4.
2. Section opener = rule + index (+ pill only if COPY gives one); title → subhead → `mt-stack` → pills; H1/H2 end with a full stop.
3. Accent appears only as primary button, focus ring, arrow, pill fill, bracket corners, QR ring, callout discs — never text, never on art.
4. Every card image is a `CardFace` (`aspect-[5/7]`, `object-contain`, `rounded-none`); every poster box is `rounded-none`; plates may be `rounded-ui`.
5. Every fictional athlete has C13 in frame or directly under (`fictional` prop) — once per group only where COPY says "once".
6. No image imported from `etsy/`, `marketing/`, `art-pipeline/`; only `asset(key)` from `SITE_ASSETS`; `locate` keys render the text fallback.
7. Corner audit passed for every `card` asset you added; no `scale-[…]`, no CSS mask, no crop of a card.
8. No count-bearing art: no pack face, no evergreen certificate, no `tile-printed.jpg`, no whole listing slide.
9. One `DeliveryChips` wording per page (home SN card has none); `TrustLine` is the last element of every CTA block.
10. Exactly one `priority` image per page; no `<video>` and no flip autoplay above the fold; every `<Image>` has `sizes` and dimensions.
11. Small secondary text is `text-muted-text` (stock) / `text-arena-muted` (arena) — never `text-ink/70`, never `text-muted` under 24 px.
12. Status chips are outline `StatusChip`s with visible PASS/FAIL/NOTE text; tier prices via `priceDisplay()` in `text-price`.
13. Process artefacts sit in `BracketFrame` with a file-tab label; products never do.
14. The rejected pair is the ice-hockey `_versions/action2-1.png` vs `action2.png`; captions describe the frames shown.
15. Any back shown with a `QrRing` or in a flip decodes to the ID beside it (QR-patched derivative).
16. Numberless sports: no number in copy, alt, example data or tile caption; adults: no `#` on `/c`.
17. Fonts: the three site families only; a finish pair only inside `app/(registry)/c/**`; finish names on marketing pages as SVG labels or the Space Grotesk fallback.
18. Motion: flip once per scene then 900 ms; 180 ms hovers; nothing else animates; reduced-motion path verified.
19. Focus ring visible on every interactive element; tap targets ≥ 44 px; one H1; `aria-hidden` on decoration.
20. `npx tsc --noEmit --incremental false && npx vitest run && npx eslint …` green; `NEXT_DIST_DIR=.next-<you> npx next build` once; note assets verified / still `locate` in `docs/f1/INTEGRATION-NOTES.md`.
