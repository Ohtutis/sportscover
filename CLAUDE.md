# CLAUDE.md

**Project: Game Day Edition** (gamedayedition.com) — AI-generated personalized sports
posters + collectible trading cards per order for youth athletes. 17 sports, **6 art
finishes** (lineup finalized 2026-08-19: Stadium Night, Chrome All-Star, Fire & Smoke,
Heritage, Signature Spotlight, Prism Rush — Neon Future and Vintage Card were dropped). Repo = marketing site (Next.js 16 App Router, TS, Tailwind 4, Drizzle) +
card registry + the print/art pipeline. Brand was renamed Cover Moment → Game Day Edition.

## 👉 Read first
**`docs/GAME-DAY-EDITION.md`** — the full status/handoff doc: Figma node IDs, variables,
print templates, the pack, the per-order workflow and the TODO list. **Start there.**
`print-sources/MANIFEST.md` explains which art files are in git and how to regenerate
the ones that aren't. **`docs/FINISH-COMPLETION-PLAYBOOK.md`** is the step-by-step checklist for
taking a finish from "section 01 only" to production-complete (node IDs, recipes, the known
traps, safe zones, export naming) — use it for every remaining finish.

## Where things stand
- **ALL 6 finishes are production-complete (2026-08-20)**: Stadium Night, Chrome All-Star,
  Fire & Smoke, Heritage, Signature Spotlight, Prism Rush. Each has poster, print cards, pack,
  certificate, proof, socials, wallpapers (with safe zones), digital bonus and a flip video.
  Per-finish node IDs are in the handoff doc; the build recipe is
  `docs/FINISH-COMPLETION-PLAYBOOK.md`.
  Both have poster, print cards, booster pack, certificate, social, wallpapers, digital
  bonus assets and a rendered flip video. **Fire & Smoke, Heritage, Signature Spotlight and
  Prism Rush have section `01 · HERO & TEMPLATES` built** (2026-08-19; poster + card
  FRONT/BACK, own backgrounds + per-finish foil/glow materials). Heritage / Signature
  Spotlight / Prism Rush BACK cards use the finish background as backdrop until each gets
  its own from-behind AI shot; **Fire & Smoke already has one** (`#back_photo`).
- **Fire & Smoke is production-complete (2026-08-20)** — 3 of 6 finishes now: section
  `02 · PRINT READY` (`276:2`) + `03 · SOCIAL` (`287:2`) + `04 · WALLPAPERS` (`287:3`) +
  `05 · DIGITAL BONUS` (`294:2`) + watermarked proof `297:2`. Print files in
  `print-sources/output/fire-and-smoke/`, bonus PNGs in `exports/fire-and-smoke/bonus/`.
  flip videos in `card-flip/out/GDE_FS_*`. Recipes and the traps (foil-vs-plate luminance,
  Anton SC refit, per-finish sticker silhouette) are in the handoff doc ("Fire & Smoke —
  section 02 · PRINT READY BUILT" and its 03/04/05 subsection).
- **Bonus die-cuts are shape-per-finish** (2026-08-20): the sticker/badge silhouette is part of
  the finish identity — FS = ember banner + flame-crest disc vs CA's chamfer + hexagon. The
  **card border stays one geometry for all finishes** (print-safe) — that rule is unchanged.
- **Screen safe zones now exist (2026-08-20)** — wallpapers previously had none, so type sat
  in the macOS Dock / iOS home-indicator strips. Zones per device class + hidden
  `TEMPLATE_GUIDES` layers are documented in the handoff doc ("Screen safe zones"). Rule:
  **art may bleed, type and marks may not.** ⚠️ **Stadium Night and Chrome All-Star still
  carry the old defect** — propagate the same pass before shipping their wallpapers.
- **Typography is PER-FINISH (2026-08-19).** CA = Russo One + Saira Condensed;
  Fire & Smoke = Passion One + Khand; Heritage = Graduate + Archivo Narrow; Signature
  Spotlight = Space Grotesk + Archivo; Prism Rush = Orbitron + Chakra Petch. Full table in
  the handoff doc. SN keeps Anton + Barlow as ITS pair (user decision). SN + CA sections 02–05 were
  propagated from the canonical heroes on 2026-08-19 (fonts, new CA background
  `0956ffd5…`, rebuilt print frames) and the tracked print PNGs in
  `print-sources/output/` were regenerated.
- **SN + CA final pass DONE (2026-08-19).** Certificates gained an `auth_seal` foil stamp
  (the signature line was unsigned); card BACK had 3 defects on BOTH finishes — ghost number
  overflowing the frame, SN `#card_bg` offset 61 px, and near-invisible stat chips — fixed on
  the masters and on **6 replicas per finish** (print/proof/Grid 3/Story 3/CardFlip/MotionSpec).
  CA cert footer was off-canvas. All print PNGs + all 6 flip videos re-exported. Details and
  the ghost-placement rule (`38·k` inset, `k = hostWidth/750`) are in the handoff doc.
- **Pack size is 10 cards, not 25** (decided 2026-08-19 — the wrapper physically fits
  ≤7 mm of stock). Figma certificates now say 10 (fixed 2026-08-19). ⚠️ The **site copy
  still says 25** (`app/site-client.tsx:80` and `:537`), as does `lib/registry/cards.ts`
  (`serial: "01/25"`). Not yet propagated in the repo.
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
- **AI art is automated in-repo** — `art-pipeline/` (Gemini image via Vertex). Figma/MCP
  cannot generate art; never try. **Read `art-pipeline/README.md` before touching it** —
  endpoint gotchas, the data model, and every diagnosed failure mode.
  - **Backgrounds** (§1–9): the finish × sport matrix. `npm run art:bg` + `npm run art:qa`.
  - **Athletes** (§10–24, built 2026-08-20): crest → **identity plate** → 4 poses → BiRefNet
    cutout → two rubrics. `npm run art:athlete`, `art:cutout`, `art:qa:athlete`.
    The **identity plate is the anchor** — approve and lock it before generating poses, or
    the four poses are four different people. Piloted on ice hockey.
  - **The per-order path is the same code**: `art:intake` validates a customer's photos,
    then `art:athlete --stage identity --from-photos <dir>` builds the plate from them
    instead of from words. `art:identity` is the numeric ArcFace gate that makes "the same
    face" a measurement rather than a claim. Requires the local `.venv-matte` virtualenv
    (rembg + insightface, both CPU-pinned — CoreML hangs forever).
  - **Two rules that cost the most to rediscover**: the kit is a property of the SPORT
    (`kits.ts`), not the person; and never soften a pose to fit the frame — pull the camera
    back. Both are in README §20.
  - **Fixing one item NEVER means re-rolling the frame** (README §29, added 2026-08-21). A
    generation re-dices everything not carried by an image — re-rolling the football plate for
    its boots returned an NFL shield where the club crest was. `npm run art:fix -- --athlete
    <slug> --frame <f> --change "<one thing>"` hands the finished frame back with one change and
    nothing else moved; `art:approve --version N` restores any earlier take for free. Real
    league marks (NFL/FIFA/NCAA/Olympic…) are refused by name in every prompt and by a
    `no_league_mark` judge check, and `--stage kit` now grades the plate before the poses may
    inherit it.
  - **THE PHOTOGRAPH WINS, ALWAYS** (README §39, 2026-08-22). `_spec.json` is prose someone
    typed; the customer's photographs are the guidance. When `art:spec:verify` says a line is
    contradicted, the LINE is what changes. The spec only rules over what no photograph shows —
    and those lines must say "the DECISION is …" so a reading is never mistaken for a decision.
  - **Check a frame against its PLATE, mechanically** — `npm run art:diff -- --athlete <slug>`
    puts the frame beside `_kit.png` (or `_kit-back.png` for the back frame) in one picture.
    Every crest, number and mark on the frame must have a twin on the plate. An invented back
    number shipped on two athletes in a row while this rule existed only as a good intention
    (README §36). Ask *what may be seen at all from this angle* BEFORE asking whether it is on
    the right side.
  - **Kit items never live in the athlete record** (README §37): a competition bow written into
    `athletes.ts` `hair` put that bow in all four "before" photos, including at home. The test:
    could she wear it to school on a Tuesday? If not, it belongs in `kits.ts`.
  - **The calm from-behind pose is conditional** (README §38): a kit with a number across the
    shoulders gets a still, square back frame; a kit without one (wrestling, cheerleading,
    gymnastics) gets the sport's own celebration instead.
  - **Hands are asked for, not repaired**: every pose prompt requires five separated fingers and
    a hand doing something real. Customer's standing instruction, 2026-08-22.
  - **Athlete state: 8/8 approved on basketball, baseball, softball, ice-hockey, volleyball,
    lacrosse, wrestling, cheerleading, gymnastics; football 6/8; soccer 7/8 (pre-8-frame).**
    Next athlete and the exact command sequence: `docs/ATHLETE-ROSTER-HANDOFF.md` §15–§16.
- **Card registry** in-repo: `lib/registry/cards.ts` (source of truth), `npm run qr:gen`
  → `public/cards/qr/`, placeholder page `app/c/[cardId]/page.tsx`. Card ID =
  `GDE-<style>-<sport>-<season>-<number>`.

## Commands
- `npm run dev` — Next dev server (port 3000)
- `npm run art:athlete -- --athlete <slug> --stage crest|snapshots|identity|poses`
- `npm run art:cutout -- --athlete <slug>` / `art:identity` / `art:intake -- --photos <dir>`
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
- Card/poster typography is **per-finish** (display + supporting pair each; never Inter,
  Anton + Barlow retired). See the pair table in `docs/GAME-DAY-EDITION.md`.
- Accents follow **team colors** (`team/primary`, `team/secondary`). The GDE mark is always
  **silver foil**, never orange and never a team colour — and **never the finish's foil either**
  (enforced 2026-08-20 across all six finishes: shield, wordmark, certificate seal and proof
  watermark tiles all stay silver; the finish speaks through lockup, ghost type, border, glyph
  and atmosphere).
- `brand/accent` #FF6B2B belongs on the **website and outer box only** — not on artwork,
  and no longer on the pack (its accent bar is bound to `team/primary`).
- Each finish differentiates by **material**, not layout: Stadium Night = soft silver foil +
  arena atmosphere; Chrome All-Star = high-contrast chrome, no arena spill/haze/bokeh, fog ~50%.
- Posters = art (minimal text); stats/grad-year live on the **card**.
