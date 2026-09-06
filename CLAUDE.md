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
**`docs/SITE-BUILD-SPEC-2026-09.md`** — the WEBSITE BUILD SPEC (2026-09-06, current direction): the site
sells directly via Stripe at Etsy buyer price +10%, rebuilt from scratch; 28 recorded decisions, brand
system, sitemap, every page section by section, checkout / order / team-link / card-page flows, honest
social proof, pricing table, SEO, data model, CLIs, phases F0–F4 and the owner-decision list. **Read it
before touching `app/`, `lib/registry/` or `lib/catalog/`.** `docs/SITE-MASTER-PLAN-2026-09.md` is the
underlying audit and rules canon (Etsy off-platform rules, legal scope, ads gate) — still valid where the
spec's §14 does not override it.

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
- **Pack size is 18 cards** — 4 holographic chase + 14 standard, one fixed recipe (decided
  2026-08-25, `docs/ETSY-LISTINGS.md`; supersedes the 10-card note of 2026-08-19, which came from
  the ≤7 mm wrapper limit — 18 × 0.32 mm = 5.8 mm still fits). **18 is the TOTAL, not 18 + 4**:
  writing "18 cards + 4 FOIL" promises 22 and is an item-not-as-described case the first time a
  buyer counts them. ⚠️ Count-bearing ART still says 10: the TGC pack face reads "10 COLLECTIBLE
  CARDS" and the certificate says 10 — both must go count-neutral before any pack ships.
  The site copy
  and the registry example serial were propagated to 18 on 2026-09-05 (`app/site-client.tsx`,
  `app/site-config.ts`, `lib/registry/cards.ts`); the FAQ now also says square-cut corners.
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
  - **The card-in-hand shot: the plate decides OCCLUSION, not SHAPE** (README §50–51, 2026-09-01).
    The photograph is generated holding a blank matte-black plate, but that plate is a GENERATED
    object — the model rounds its corners however firmly the prompt says square, and its edge
    wanders. So `card = rect − hand`, never `card = plate`: ask where the HAND is (open the gap
    with a kernel no finger is thinner than) and everything else inside the fitted rectangle is
    card. Taking the plate as the silhouette shipped rounded corners on a square-cut card and
    clipped the finish's keyline. Audits: `bleed` (card ink where the photo had none — must be 0),
    `frame` (share of the keyline ring drawn), `stand-off` (px the edge sits off the plate).
    **Before erasing an artefact, check the source photograph actually has it** — two rounds went
    into removing marks the compositor itself was drawing.
  - **Hands are asked for, not repaired**: every pose prompt requires five separated fingers and
    a hand doing something real. Customer's standing instruction, 2026-08-22.
  - **THE ROSTER IS COMPLETE (2026-08-22): 15 of 17 sports are 8/8 approved with gates green**
    — basketball, baseball, softball, ice-hockey, volleyball, lacrosse, wrestling, cheerleading,
    gymnastics, track-field, swimming, tennis, golf, pickleball and **skateboarding** (the
    `other-sport` slot, converted from a generic placeholder this session — slug and code stay
    `other-sport`/`OTH` because the site and the card IDs use them). Still open: **football 6/8**
    (two frames generated and audited but never signed off) and **soccer + the five
    `soccer-age-*` slugs at 7/8** (they pre-date the 8-frame pack and have no `_kit-back`).
    **All 22 athletes now have all four cutouts.** State and the command sequence:
    `docs/ATHLETE-ROSTER-HANDOFF.md` §16–§18.
    - 2026-09-02: **soccer `_kit-back.png` now exists** (generated for the Etsy listing's slide 15,
      €0.29) — clean green shirt, white 10, no maker marks. **Not yet `art:approve`d**, so soccer
      still counts as 7/8 approved. ⚠️ `--dry` did NOT stop the run; it generated.
  - **Maker marks: MATCHING decides, not the mark** (owner's rule, 2026-09-02, and it overrides
    the older reading of README §40). **We copy the kit exactly as it is — "if it's Nike, it's
    Nike". The logo is part of the sports kit**, on the plates, in the poses and on the card.
    What is forbidden is an **INVENTED brand that does not exist**, or a real brand that is the
    WRONG one — soccer's `_kit-grade.json` FAIL is right for that reason (Joma drawn on a kit
    the athlete photographs in Puma), not because a logo is present. The prompts' blanket
    no-marks sentence stays useful where NO kit photo was supplied — with nothing to copy, the
    model invents — but it must never be used to strip a mark the customer's own kit carries.
  - **Pickleball has TWO athletes on purpose** (2026-08-22): `pickleball-youth` (Nadia Rahimi,
    16) is what the coverage row shows, because every other athlete there is 13–18 and one
    58-year-old broke the row; `pickleball` (Ray Solberg, 58) is KEPT, approved, for the older
    end. They share a club and crest. `poses.ts` pickleball therefore uses NEUTRAL pronouns and
    names no shoe colour — a pose set is keyed by SPORT, never by athlete.
  - **The back of a shirt is PLAIN unless the sport numbers it** (`hasBackNumber` in `kits.ts`,
    README §41). The default is FALSE — a missing number is a gap someone fixes, an invented one
    is a mark printed on a garment the athlete does not own. The chest crest is a separate
    problem and is NOT covered by that flag: four back frames in a row printed it between the
    shoulder blades. Run `npm run art:diff` on every back frame.
  - **Brand marks are the most common defect in the roster.** "No sponsor marks" never stopped a
    swoosh — a wordless-mark ban has to be its own sentence naming the devices, and it now is, in
    both the snapshot and the pose prompt. Still look at every kit frame at 4x before writing a
    spec (README §40).
- **Physical fulfillment: `docs/SUPPLIERS.md` IS THE CANON** (2026-09-01, visi kanalai
  patikrinti gyvai): kortelės — Bay Photo ROES „Design Your Own" (~$12–14/setas iki durų,
  white-label dropship, Color Correction OFF visada); plakatai — Printful 18×24/24×36;
  banneriai — WHCC ROES „Image Only" (3×2 €26; $25 min perlipa pats); sealed foil pakelis —
  QPMN (tik jis, savininko sprendimas). PhotoDay kortelėms NETINKA (tik jų temos). Prieš
  įjungiant fizinius tiers — Etsy Production Partners deklaracija (sąrašas SUPPLIERS.md).
- **Etsy listings + SEO: `etsy/SEO/README.md` IS THE START POINT.** One folder holds the whole
  know-how; `etsy/SEO/LISTING-COPY-PACK.md` is the working doc (per-product title, 13 tags,
  description, publish order A–F). Decided and not to be re-litigated: descriptions use plain
  CAPS section lines (**no `━` dividers**) + the 4 mandatory closing blocks; **Senior Night
  listings carry ONE style (SR), no art-style dropdown**, evergreen sport listings keep the 6;
  publish **2–4 new listings/day** (the 30-day freeze applies only to editing live title/tags).
  ⚠️ `etsy/listings/*.json` drafts still hold the OLD divider format — copy from the pack.
- **Etsy listing images** have their own canon: **`etsy/LISTING-IMAGE-CANON.md`**
  (2026-08-27) — Etsy UI safe zones, the hero recipe (one big before photo + arrow; the tile
  is optimised for the CLICK, judged at 300 px), what image 02 must prove per listing, the
  **sport-surface background system** (`art-pipeline/gen-hero-bg.ts`) and the **true-scale
  rule** (one px-per-inch for every object; the person is the ruler). Listing Figma file is
  **`JcQvsgIRiOQtuZcP3Q8dc9`**, not the finish file.
- **New-style content method (2026-09-05): `marketing/CONTENT-METHOD-2026-09.md`** — how all 38
  listing videos were built (two-video model, beat library, tokens, tools, gates, publishing) and how
  the same system is reused for reels and pins. Read it before producing any video or social frame.
- **External traffic: `marketing/README.md` IS THE START POINT.** Etsy Search is at 0 visits,
  so the first buyers come from outside. `npm run mkt:day` renders 5 Pinterest pins
  (1000x1500) from assets already in the repo + `captions.md` + a bulk-create CSV; the queue
  is deterministic from `start_date`, so a re-run never re-posts different art under a live
  caption. **Publishing stays human** — Pinterest and Reddit both punish automated posting
  from young accounts. Reddit starts at week 3 and only as an ANSWER (templates +
  the mandatory per-sub rules check: `marketing/templates/REDDIT-POSTS.md`). Captions may
  never promise a jersey number for a numberless sport (`numbered` in `engine.py`).
- **Etsy SEO evidence**: **`etsy/SEO/ETSY-SEO-FINDINGS.md`** (2026-08-27) — indexing state,
  the keyword map (searches/results/conversion), price medians vs our prices, and the
  decisions taken. Rule: matched intent beats volume; always research with `&ship_to=US`.
  **`etsy/SEO/ETSY-SEO-MASTER-PLAN.md`** (2026-08-28) is the plan on top of it: per-listing
  titles/tags, keyword ownership map, wave calendar. **`etsy/SEO/NICHE-REPORT-2026-08.md`** = full ~55-term atlas with curves:
  three engines — senior night (Oct+Jan), Christmas (Nov, 2.5x), spring baseball (Mar).
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
