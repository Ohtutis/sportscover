# CLAUDE.md

**Project: Game Day Edition** (gamedayedition.com) — AI-generated personalized sports
posters + collectible trading cards per order for youth athletes. 17 sports, 5 art
finishes. Repo = marketing site (Next.js 16 App Router, TS, Tailwind 4, Drizzle) +
card registry + the print/art pipeline. Brand was renamed Cover Moment → Game Day Edition.

## 👉 Read first
**`docs/GAME-DAY-EDITION.md`** — the full status/handoff doc: Figma node IDs, variables,
print templates, the pack, the per-order workflow and the TODO list. **Start there.**
`print-sources/MANIFEST.md` explains which art files are in git and how to regenerate
the ones that aren't.

## Where things stand
- **2 of 5 finishes are production-complete**: **Stadium Night** and **Chrome All-Star**.
  Both have poster, print cards, booster pack, certificate, social, wallpapers, digital
  bonus assets and a rendered flip video. Remaining: Fire & Smoke, Neon Future, Vintage Card.
- **Pack size is 10 cards, not 25** (decided 2026-08-19 — the wrapper physically fits
  ≤7 mm of stock; 25 cards is 8 mm and will not seal). ⚠️ The **site copy still says 25**
  (`app/site-client.tsx:80` and `:537`), as do the Figma certificate and
  `lib/registry/cards.ts` (`serial: "01/25"`). Not yet propagated.
- **Supplier: qpmarketnetwork.com.** Their downloadable PDF template is wrong — it shows
  2 fold lines; the real uploader shows **4** (fin-seal) plus a much tighter safe area.
  Exact geometry is in the handoff doc. Always proof against the uploader, not the PDF.

## Fast facts
- **Design** lives in **Figma** (write-capable MCP). File key **`KzdEYF1UD9EnsczY8Kpyxi`**.
  Always load the `figma-use` skill before `use_figma`.
- **One page per finish**, each organised into the same five sections:
  `01 · HERO & TEMPLATES`, `02 · PRINT READY`, `03 · SOCIAL`, `04 · WALLPAPERS`,
  `05 · DIGITAL BONUS`. Nothing sits loose at page level — keep the frame-name prefixes.
- **Two variable collections.** `Athlete` (file-global, one mode) = athlete data.
  **`Style`** (`VariableCollectionId:141:3`, **one mode per finish**, pages pinned via
  `page.setExplicitVariableModeForCollection`) = styleName/styleCode/cardId/etc.
  Style strings MUST live in `Style` — putting them in `Athlete` made the Chrome All-Star
  page render "STADIUM NIGHT" and would have gone to print wrong.
- **AI art (cutouts + backgrounds) is external** (ComfyUI / Midjourney / Nano Banana);
  Figma/MCP cannot generate it. Cutouts must be transparent PNGs.
- **Card registry** in-repo: `lib/registry/cards.ts` (source of truth), `npm run qr:gen`
  → `public/cards/qr/`, placeholder page `app/c/[cardId]/page.tsx`. Card ID =
  `GDE-<style>-<sport>-<season>-<number>`.

## Commands
- `npm run dev` — Next dev server (port 3000)
- `npm run qr:gen` — regenerate card QR codes from the registry
- `npm run build` / `npm run lint`
- `card-flip/render.sh` — render the card-flip video. Style-parameterised:
  `STYLE=CA FLIP_ASSETS=assets/ca FLIP_BG=8,12,18,255 ./render.sh`

## Print specs (supplier templates, 300 DPI)
- **Card**: upload **816×1110** (2.72×3.70" incl. bleed); trim 744×1038; safe 684×981.
- **Pack**: upload **2032×1560** (6.77×5.19" incl. bleed); cut inset 35.4 px;
  folds at x = 212 / 605 / 1423 / 1815; safe box x 165–1876, y 157–1404.
- Poster print needs 4× upscale of source art (18×24"@300 = 5400×7200).

## Conventions
- Card/poster typography: **Anton** (display) + **Barlow Condensed** (meta) — not Inter.
- Accents follow **team colors** (`team/primary`, `team/secondary`). The GDE mark is always
  **silver foil**, never orange and never a team colour.
- `brand/accent` #FF6B2B belongs on the **website and outer box only** — not on artwork,
  and no longer on the pack (its accent bar is bound to `team/primary`).
- Each finish differentiates by **material**, not layout: Stadium Night = soft silver foil +
  arena atmosphere; Chrome All-Star = high-contrast chrome, no arena spill/haze/bokeh, fog ~50%.
- Posters = art (minimal text); stats/grad-year live on the **card**.
