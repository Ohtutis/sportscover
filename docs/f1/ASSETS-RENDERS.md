# F1 ASSET MANIFEST B — renders, packages, brand, flip (2026-09-06)

Companion to `docs/f1/COPY.md`. Scope: `marketing/cards/`, `art-pipeline/out/etsy-shots/packages/`
(+ the room shots that actually live elsewhere), `print-sources/output/`, `card-flip/`, brand files,
the current `public/images/*`, and the founder photo. Every dimension below was measured with
`sips`; every "depicts" claim comes from a contact sheet viewed this session (12 views total);
every QR claim comes from `cv2.QRCodeDetector` run on the file. Nothing here was regenerated.

Rules this manifest enforces (spec §2.4, §8, task brief): product = real art, never a pose render;
every fictional athlete carries `<FictionalLabel>` ("Example — fictional athlete · photo and artwork
generated"); never Nia Brooks exports, never count-bearing pack/certificate art, never SN/CA
wallpapers without safe zones, never real customers; pack = 18 cards (4 holographic chase, 14
standard); cards are square-cut; no jersey number for cheerleading, gymnastics, swimming, tennis,
golf; never "youth".

---

## 0. Read this first — the four findings that change the plan

### 0.1 Which sources exist in git and which live only on the owner's Mac
Builders in a fresh worktree or CI will NOT have the ignored roots. The copy step (§8) therefore runs
on the owner's machine and the derived WebP/MP4 go into `public/` and get committed.

| Root | Git | Note |
|---|---|---|
| `marketing/cards/` | **ignored** (`.gitignore` `/marketing/cards/`) | 30 PNG, 900×1260 |
| `art-pipeline/out/**` (png/jpg/webp/mp4) | **ignored** | all etsy-shots renders |
| `etsy/listing-images/` | **ignored** | room-<FIN>.png live HERE, not in packages/ |
| `card-flip/assets/` | **ignored** | the 1500×2100 front/back pairs (the CardFlip inputs) |
| `card-flip/out/*.gif` | **ignored** | GIFs are internal preview only |
| `card-flip/out/*.mp4` | tracked (25) + 2 untracked new (`GDE_SFBSR_*`, `GDE_WRSSR_*`) | |
| `print-sources/output/**` cards/pack/cert | tracked (27) | posters ignored (`**/*poster-*.png`) |
| `exports/brand/`, `exports/*/bonus/` | tracked | `exports/shared-cutouts/` ignored (and Nia) |
| `print-sources/brand/GDE-auth-signature.png` | tracked | 997×331 RGBA white strokes |
| `etsy/video/trial/gde-wordmark.png`, `gde-shield-4x.png` | **not tracked** | |
| `public/**` | tracked (83 files) | incl. `public/cards/qr/` (23 QR PNG from the registry) |

### 0.2 Every card master in `print-sources/output/` depicts Nia Brooks
SN/CA/FS/HE/PR/SS card FRONT+BACK, all six certificates and all flip assets in `card-flip/assets/{ca,fs,he,pr,ss}` are **Nia Brooks #23 · Northside Wolves** (`GDE-SN-BKB-2026-23`). The brief says never use Nia exports, so **the print masters are reference-only for F1**. The site's card art comes from `marketing/cards/` (15 sports, Stadium Night, Marcus Ellison and the roster) and `card-flip/assets/{marcus-sn,*-sr,soccer-ca,football-fs,cheer-pr,baseball-he,volleyball-ss}` (2× pairs). Spec §11 F1 already schedules "Nia Brooks regenerated with audit" — until that lands, nothing Nia ships.

### 0.3 Every evergreen pack face and certificate is count-bearing — DO NOT USE (hash denylist in §3.3)
Confirmed by eye on the SN pack FLAT and the SN certificate at full crop: the pack face prints
"10 COLLECTIBLE CARDS · FIRST EDITION · 2026"; the certificate's closing line reads "…produced as a
limited run of 10 cards." The same template made every finish's pack/cert, every `_<sport>/pack.png`
and `panel.png`, `pkg-pack-real.png`, `tile-pack.png`, `out-pack*.png`, `pack-front-panel.png`, and
every `etsy/listing-images/04-complete-set/src/*-certificate.png`. **Only the Senior Night
certificates are count-neutral** (`bsb-sr-cert.png` reads "…produced as a single numbered Senior Night
edition for this athlete" — verified; chr/ftb/soc/sfb/vlb/wrs SR certs use the same template, verify
one before use). Consequence for §4.1 s1 hero and §4.2 set hero: **no pack in any composite until a
count-neutral pack face exists** (CLAUDE.md already lists the Figma pack-face fix as an owner TODO).

### 0.4 The QR bitmap on the evergreen card backs is stale — it opens Nia's page
Decoded with OpenCV on every back this manifest touches:

| Back file(s) | Printed ID text (read) | QR decodes to |
|---|---|---|
| `marketing/cards/*-back.png` (all 15) | e.g. `GDE-SN-BKB-2026-12`, `GDE-SN-CHR-2026-01` | `https://gamedayedition.com/c/GDE-SN-BKB-2026-23` (Nia) |
| `card-flip/assets/{marcus-sn,soccer-ca,football-fs,cheer-pr,baseball-he,volleyball-ss,football-sr}/card-back.png` | own ID (e.g. `GDE-CA-SOC-2026-10`, `GDE-SR-FTB-2026-54`) | Nia's URL |
| `etsy/listing-images/04-complete-set/src/{marcus-sn-card-back,soccer-card-back-CA,cheer-card-back-PR,baseball-card-back-HE,volleyball-card-back-SS,football-card-back}.png`, `01-basketball-card/src/BK-SN-card-BACK.png`, `03-senior-night/src/ftb-sr-back.png` | own ID | Nia's URL |
| `card-flip/assets/{baseball-sr,cheer-sr,soccer-sr,softball-sr,volleyball-sr,wrestling-sr}/card-back.png`, `03-senior-night/src/{bsb,vlb,sfb,wrs}-sr-back.png` | own ID | **own ID** (correct) |
| `03-senior-night/src/{chr,soc}-sr-back.png` | own ID | no decode at crop (probably correct; re-check) |

So the Marcus back that §4.1 s5 wants to show ("orange ring around the QR → EditionPanel for
`GDE-SN-BKB-2026-12`") would, if a visitor scanned it, open Nia's page. It does not 404 (Nia's row is
public), but it is the wrong athlete. Options in §9. Second half of the same finding: the printed IDs on
12 of the 15 `marketing/cards` backs (every SN sport except BKB-12, SFB-03 and CHR — CHR-01 exists
only as SR/PR/SS, not SN) **have no registry row** — `GDE-SN-CHR-2026-01`, `GDE-SN-BSB-2026-07`, … do
not resolve. The registry builder must add them (`card:new`, `channel: demo`, `isFictional: true`)
before any back is shown, or the 17-sport section shows fronts only.

---

## 1. `marketing/cards/<sport>-front|back.png` — the 17-sport tiles (§4.1 s7, §4.1 s10, `/sports` later)

30 files, all **900×1260** (2.5×3.5 in at 360 dpi, square-cut, no rounded corners), ~1.0–1.5 MB PNG,
dated 2026-08-29, all **Stadium Night** finish, all fictional roster athletes. Fronts carry name lockup
+ role line + finish label; backs carry season stats (3 chips), profile, highlight line, athlete
signature, printed card ID line, QR (stale, §0.4), silver GDE shield.

| Sport (slug · code) | Athlete on the card | Role line on front | `numbered` / `hasBackNumber` (`lib/catalog/sports.ts`) | Back ghost glyph (checked) | Printed back ID (verified / inferred) |
|---|---|---|---|---|---|
| baseball · BSB | Casey Whitlock · Harlow Creek Larks | `#7 · OUTFIELD` | true / true | number | `GDE-SN-BSB-2026-07` (inferred; SR row `GDE-SR-BSB-2026-07` exists) |
| basketball · BKB | Marcus Ellison · Cedar Ridge Bears | `#12 · GUARD` | true / true | 12 | `GDE-SN-BKB-2026-12` ✔ verified, **registered** |
| cheerleading · CHR | Amara Boyd · Vale Prep Vanguard | `FLYER` (no number ✔) | false / false | none ✔ | `GDE-SN-CHR-2026-01` ✔ verified, **not registered** |
| football · FTB | Tui Fa'agata · Millbrook Bison | `#54 · OFF. LINE` | true / true | number | `GDE-SN-FTB-2026-54` (inferred) |
| golf · GLF | Hana Park · Pinewick Osprey | `VARSITY` (no number ✔) | false / false | none ✔ | `GDE-SN-GLF-2026-01` (inferred; numberless sports print the edition number `01`, `lib/registry/cards.ts:474`) |
| gymnastics · GYM | Sofia Marchetti · Willow Bend Swifts | `ALL-AROUND` (no number ✔) | false / false | none ✔ | inferred |
| ice-hockey · ICH | Nolan Reid · Northgate Anvils | `#17 · CENTER` | true / true | number | inferred |
| lacrosse · LAX | Reese Callahan · Ash Grove Foxes | `#22 · MIDFIELD` | true / true | number | inferred |
| soccer · SOC | Mateo Herrera · Sunfield Kestrels | `#10 · MIDFIELD` | true / true | number | `GDE-SN-SOC-2026-10` (inferred) |
| softball · SFB | Brooke Danner · Bell Hollow Wrens | `#3 · PITCHER` | true / true | number | `GDE-SN-SFB-2026-03` — **registered** |
| swimming · SWM | Nora Lindqvist · Bayline Marlins | `FREESTYLE` (no number ✔) | false / false | none ✔ | inferred |
| tennis · TEN | Arun Devarajan · Highfield Herons | `SINGLES` (no number ✔) | false / false | none ✔ | inferred |
| track-field · TRK | Imani Whitfield · Redstone Flyers | `#8 · SPRINTS` | true / **false** (plain shirt back; ghost 8 on the card back is fine) | 8 | inferred |
| volleyball · VBL | Jaslene Ocampo · Fox Hollow Anchors | `#5 · OUTSIDE` | true / true | number | `GDE-SN-VBL-2026-05` (inferred) |
| wrestling · WRS | Dawson Pryor · Foundry Hill Forge | `#1 · 126 LB` | true / false | 1 | `GDE-SN-WRS-2026-01` (inferred) |

Compliance: the five numberless sports carry **no number and no ghost number** — checked on a crop of
all five backs (only track-field shows a ghost, and track is `numbered: true`). Alt text must follow
the same rule (`"Custom cheerleading trading card front — Stadium Night finish — example artwork,
fictional athlete"`, never "#").

**Missing sports:** `pickleball` (PKB, Nadia Rahimi 16 / Ray Solberg 58 in the roster) and
`other-sport` (OTH, slug shown as "Skateboarding"). Spec §4.1 s7: "regenerated with audit" — out of
scope for F1. **F1 ships two text tiles** in the same 900×1260 box: navy plate (`--navy`), silver
shield at 40 px, sport name in Anton 2.75 rem uppercase with a period, Barlow SemiBold second line
`PLAIN BACK · NAME AND CLUB CREST` (both sports are `hasBackNumber: false`), no fake art, no
placeholder card frame, no "coming soon". Tile link = whatever COPY.md §4.1 s7 assigns to non-live
sports. When the two cards are generated they must pass the judge audit (S18) and get a registry row
before they replace the text tiles.

Current derived copies: `public/images/cards/<slug>.webp` (600×840, 15 files) are these fronts at
0.667× — too small for a 2× retina tile wider than 300 CSS px and named without finish. Replace per
§8 (900×1260 native, descriptive names) and update `app/page.tsx:45` which builds
`/images/cards/${s.slug}.webp`.

---

## 2. `art-pipeline/out/etsy-shots/packages/` — package tiles, composites, stages (181 files, all ignored)

Legend — **USE**: real product art, ship after judge/hash audit + `FictionalLabel`; **STAGE**: a blank
matte-black plate waiting for art (never publish as-is — the "poster" is an empty black rectangle);
**DNU**: do not use (count-bearing, third-party, or not product).

### 2.1 Top level

| File | px | Depicts (viewed) | Verdict | Where it fits |
|---|---|---|---|---|
| `hero05-{baseball,cheerleading,soccer,volleyball}.png` (+.json) | 1024² | Bedroom, **empty black framed rectangle** on the wall, the fictional athlete (matching sport) sitting low right on a phone / glove / book. Prompt in the `.json` says so explicitly. | STAGE | Not a hero composite. Spec §4.1 s1 names it as a hero option — it is only the stage; the art must be printed in (as `lifeart-*` did) or built in code. Prefer the layer composite (§8.1). |
| `int-{SN,CA,FS,HE,PR,SS}.png` | 1024² | Empty interiors per finish mood (SN navy bedroom, FS brick gym…) with a blank black rectangle. No people. | STAGE | `/styles` (F3) after compositing. |
| `life-{baseball,basketball,cheerleading,football,soccer,volleyball}.png` | 1024² | Candid athlete at home in everyday clothes + blank unframed black rectangle. | STAGE | — |
| `life2-{baseball,cheerleading,soccer,volleyball}.png` | 1024² | Same idea, framed with white mat, athlete low and opposite. | STAGE | — |
| **`lifeart-{baseball,cheerleading,soccer,volleyball}.png`** | 1024² | `life2` with the **real SN poster printed in** (soccer: MATEO HERRERA poster; cheer: AMARA BOYD poster). Athlete + product in one frame. | **USE** (small) | Posters family "in a room" secondary tile; `/senior-night` mood; only ≤ 560 CSS px because 1024 source. `FictionalLabel` mandatory (person in frame). Needs the judge audit (was generated for Etsy; check the `.judge.json` does not exist for these — none found → run `art:qa` style audit before publish). |
| **`pkg-12-real.png`** | 1024² | Fan of 12 Marcus Ellison SN cards + one back, oak table. | USE (small) | 12 Printed Cards tier image if `mix-12` is not preferred. |
| **`pkg-24-real.png`** | 1024² | 24 cards scattered + front/back pair. | USE (small) | 24 Printed Cards tier. |
| **`pkg-digital-real.png`** | 1024² | Laptop showing Marcus front+back, phone with the front, desk. | USE (small) | Digital tier (cards). |
| `pkg-pack-real.png` | 1024² | Hand holding the SN pack — face prints "10 COLLECTIBLE CARDS". | **DNU** | denylist |
| `pkg-12.png`, `pkg-24.png`, `pkg-digital.png`, `pkg-pack.png`, `pkg-digital-poster.png`, `pkg-table.png`, `pkg-tube.png`, `pkg-tube-rolled.png`, `room-18x24.png`, `room-24x36.png`, `room-30x40.png` | 1024² | Blank plates: black cards fanned, black pack, empty black poster sheet in a kraft tube, monitor with a black page, desk/bed rooms with an empty black poster. | STAGE | `pkg-tube*` + `room-*` are the stages for the Posters "to-scale sheet" and the tube shot (§4.2 s1/s3) — art must be composited in first. |
| **`mix-12.png`** = `tile-12.png` (identical bytes) | 1400² | 12-card fan of Marcus SN + standing front/back pair, oak. | **USE** | **12 Printed Cards `TierCard`** and the home "Trading Cards" family card (front+back). |
| **`mix-24.png`** = `tile-24.png` | 1400² | 24-card version. | USE | 24 Printed Cards tier. |
| **`tile-digital.png`** | 1400² | Laptop + phone with Marcus front/back on a desk. | USE | Digital Card Files tier. |
| `tile-pack.png` (= `01-basketball-card/src/pkg-04-foil-pack.png`) | 1400² | Hand with SN pack, "10 COLLECTIBLE CARDS". | **DNU** | denylist |
| `out-12.png` | 1024² | Large front+back pair on dark. | USE (small) | `/trading-cards` spec-sheet thumbnail. |
| `out-24.png`, `out-digital.png` | 1024² | Older takes of the 24/digital tiles. | skip | superseded by `mix-24`/`tile-digital` |
| `out-pack.png`, `out-pack-raw.png`, `out-pack-scene.png` | 1500² / 2048² | Pack in hand, count-bearing face. | **DNU** | denylist |
| `pack-front-panel.png` | 818×1490 | SN pack front panel art, "10 COLLECTIBLE CARDS". | **DNU** | denylist |
| **`hero-bg-set.png`** | 1024² | Dark stadium tunnel, sport unreadable, no text. | USE | Dark "artwork band" background (§4.1 s4) behind the proof, CSS-blurred; also `/c` fallback backdrop. |
| `ruler-cheer.png` | 1024² | Amara from behind on grey — the true-scale ruler. | internal | never on the site |
| `rejects/*` (12) | — | earlier takes | DNU | — |
| `supplier/qpmn-*.png` (4) | 1000²/1500² | QPMN's own blank-product photos (white cards, silver pack, template). | **DNU** | third-party imagery; also shows a rounded-corner template — contradicts square-cut |

### 2.2 Room shots per finish — they are NOT in `packages/`
Spec §4.1 s3 / §4.6 cite `room-SN.png` / `p-room-<FIN>.png` under `packages/`. Actual locations:

| File | px | Depicts | Verdict |
|---|---|---|---|
| **`etsy/listing-images/02-basketball-poster/room-{SN,CA,FS,HE,SS,PR}.png`** | 2048² | Marcus Ellison poster in that finish, in a finish-matched room: SN warm bedroom w/ desk lamp + basketball; CA bright living room; FS brick gym with dumbbells; HE library armchair; SS white room + fiddle-leaf; PR neon gaming desk. Art printed in, no people. | **USE** — Posters family card (`room-SN`), `/posters` hero, `/styles/[finish]` (F3). 2048 → 1600² WebP is plenty. `FictionalLabel` (the poster shows a fictional athlete's name). |
| `etsy/listing-images/02-basketball-poster/03-room.png` | 2048² | Marcus seated under three framed SN posters (listing slide 03). | USE (Posters family, "card in hand / poster on wall" slot) — person in frame → label |
| `art-pipeline/out/etsy-shots/p-room-{SN,CA,FS,HE,SS,PR,PR2}.png` | 1024² | The blank-plate stages of the six above (empty black frames). | STAGE |
| `art-pipeline/out/etsy-shots/{baseball,cheerleading,football,soccer,softball,volleyball,wrestling}/p-room-lead.png` (+`.judge.json` pass) | 2048² | Dark bedroom, sport props on the floor, **empty** frame. | STAGE for per-sport poster listings; `/sports/[sport]` (F3) after compositing |
| `art-pipeline/out/etsy-shots/cheer-room-blank.png` | 2048² | Cheer bedroom with empty frame. | STAGE |

### 2.3 Per-sport package tiles `_<sport>/` (8 sports: baseball, basketball, cheerleading, football, soccer, softball, volleyball, wrestling)

| File | px | Depicts (soccer viewed; others same template) | Verdict → use |
|---|---|---|---|
| `d1.png`, `d2.png`, `digital.png` | 1024² | Monitor (+phone) with that sport's **poster** (soccer: Mateo Herrera, green kit); `d2` = laptop with card front+back. | USE (small) → Digital Poster Files tier / `/sports` digital tile |
| `twelve.png`, `two4.png` | 1400² | 12 / 24-card fan + front/back pair in the sport's **second finish** (soccer = Chrome All-Star; wrestling = Fire & Smoke; cheer = Prism Rush; …). | USE → per-sport 12/24 tiles (F3 `/sports/[sport]`); on F1 pages the basketball `mix-12/24` are enough |
| `pack.png`, `panel.png` | 2048² / 818×1490 | Pack in hand / pack front panel, finish-coloured, **"10 COLLECTIBLE CARDS"**. | **DNU** (denylist; soccer=softball and football=wrestling share bytes) |
| `phone-page.png` | 840×1736 | Phone-sized mock of the card page (card on dark). | USE only as a decorative mock; the real `/c` is the product — prefer a live component |
| `phone-wall.png` | 1290×2585 (baseball/football/soccer/volleyball) · 739×1480 (cheer/softball/wrestling) · 645×1292 (basketball) | Phone wallpaper art per sport. | **hold** — safe-zone status not verifiable here (the SN/CA wallpaper defect note); not needed in F1 |
| `_basketball/page1.png`, `page2.png` | 1000×1427 | Marcus SN poster art, two crops. | USE (small) → Posters family "art" thumb; better source is `04-complete-set/src/marcus-sn-poster.png` 1296×1728 |
| `_basketball` has no `pack/twelve/two4/panel` | — | basketball's tiles are the top-level `mix-*`/`tile-*` | — |

### 2.4 `art-pipeline/out/etsy-shots/senior-night-<sport>/` (6 sports) — composited SN scenes
`card-in-case-composited`, `card-on-desk-composited`, `desk-monitor-composited`, `gift-<sport>-composited`,
`phone-in-hand-composited`, `poster-on-wall-composited`, `team-order-staged-composited` (all 2048²),
`set-{printed,deluxe,ultimate}-real.png` + `tile-set-*.png`, `sr-digital.png`. Each has a `.spec.json`
naming the exact source art warped in (`src/card-front.png` + quad). These are the `/senior-night`
and `/complete-set` candidates (Manifest A covers the listing slides built from them). Two cautions:
`set-ultimate*` contains a pack — memory says the set tiles were made count-neutral, **verify the pack
face at 4× before publishing**; `team-order-staged-composited` is the `/teams` (F2) composite, not F1.

---

## 3. `print-sources/output/<finish>/` — masters (7 dirs, 39 files)

### 3.1 Inventory

| Finish dir | FRONT / BACK 816×1110 | Certificate 2550×3300 | Pack FLAT 2032×1560 | Posters |
|---|---|---|---|---|
| `stadium-night` | Nia Brooks #23 (tracked) | Nia, "limited run of 10 cards" | "10 COLLECTIBLE CARDS" | `GDE-SN-poster-TRIM-5400x7200` 34 MB, `-BLEED-5475x7275` 35 MB, `GDE-SN-BKB-poster-2to3-7200x10800` 64 MB (all ignored) |
| `chrome-allstar` | Nia | Nia, 10 | 10 | TRIM 35 MB, BLEED 36 MB, 2to3 67 MB |
| `fire-and-smoke` | Nia | Nia, 10 | 10 | PRINT 5475×7275 34 MB, 2to3 63 MB |
| `heritage` | Nia | Nia, 10 | 10 | PRINT 36 MB |
| `prism-rush` | Nia | Nia, 10 | 10 | PRINT 34 MB |
| `signature-spotlight` | Nia | Nia, 10 | 10 | PRINT 35 MB |
| `tgc` | `GDE-SN-BKB-card-FRONT/BACK-825x1125-TGC.png` = **Marcus Ellison** in the retired TGC geometry | — | `GDE-SN-poker-booster-pack-975x1350-TGC.png` "10 COLLECTIBLE CARDS" | — |

Athlete check (viewed SN FRONT/BACK, CA FRONT/BACK, FS/HE/PR/SS FRONT): all read "NIA BROOKS · #23 ·
POINT GUARD · NORTHSIDE WOLVES", ID `GDE-SN-BKB-2026-23` (SN) / `GDE-CA-BKB-2026-23` (CA) etc. The
posters (not viewed, 30 MB+) are the same Nia hero by provenance (MANIFEST.md: exports from the SN/CA/FS
hero pages built around `photo_main.png` = Nia).

### 3.2 Verdicts
- Card FRONT/BACK ×6: **reference only** (Nia). The `/c` demo and every marketing card use §1 and §4.3
  sources instead. When the F1 "Nia regenerated with audit" task lands, re-export these from Figma and
  route them through §8 like any other card.
- Certificates ×6: **DNU** — Nia + count-bearing. The site's certificate artefact (§4.3 s3, `/about`,
  `/how-it-works`) = `etsy/listing-images/03-senior-night/src/bsb-sr-cert.png` (1275×1650, Casey
  Whitlock, count-neutral, verified) — Manifest A owns the copy; listed here so no builder reaches for
  the print master. Note the SR line says "single numbered Senior Night edition" — S10 forbids
  "numbered" in site COPY, not in a photographed artefact; flag to owner (§9).
- Pack FLAT ×6 + TGC pack: **DNU** (denylist §3.3). Not even as a "pack panel" crop.
- Posters: too large to serve, and Nia. **Derivatives only, later**: when a Marcus (or SR) poster
  master exists at 5400×7200, produce `1800×2400` (q82 WebP, ~350 KB) for `/posters` and `900×1200`
  for tiles — never the master, never in `public/`. Command (sharp, from a print master):
  `npx tsx -e "import sharp from 'sharp'; sharp('<master>.png').resize({width:1800}).webp({quality:82}).toFile('public/images/posters/<sport>-poster-<finish>-18x24.webp')"`.
  For F1 the poster art sources are `etsy/listing-images/04-complete-set/src/marcus-sn-poster.png`
  (1296×1728) and `03-senior-night/src/<code>-sr-poster.png` (1296×1728) — Manifest A.
- `tgc/` FRONT/BACK (Marcus): retired geometry (825×1125 TGC template). Superseded by
  `marketing/cards/basketball-*.png`; do not ship.

### 3.3 Count-bearing hash denylist (sha256, first 16 hex) — feed `tests/asset-denylist.test.ts` (spec §8 "count-bearing pakelio menas (hash denylist)")
```
b5fc69ba707a0b53  print-sources/output/chrome-allstar/GDE-CA-booster-pack-FLAT-2032x1560-300dpi.png
0cba9c93521c5427  print-sources/output/fire-and-smoke/GDE-FS-booster-pack-FLAT-2032x1560-300dpi.png
5b0ca1bed1ee5a84  print-sources/output/heritage/GDE-HE-booster-pack-FLAT-2032x1560-300dpi.png
89d3ddf57e67ace7  print-sources/output/prism-rush/GDE-PR-booster-pack-FLAT-2032x1560-300dpi.png
260735dc4baf88b4  print-sources/output/signature-spotlight/GDE-SS-booster-pack-FLAT-2032x1560-300dpi.png
e4de3d626a3d07e6  print-sources/output/stadium-night/GDE-SN-booster-pack-FLAT-2032x1560-300dpi.png
0c4e83f7cd714e22  print-sources/output/tgc/GDE-SN-poker-booster-pack-975x1350-TGC.png
8032a4375cfa301f  print-sources/output/chrome-allstar/GDE-CA-certificate-2550x3300-300dpi.png
27ad3012ee4f99ae  print-sources/output/fire-and-smoke/GDE-FS-certificate-2550x3300-300dpi.png
3c60af9946d32727  print-sources/output/heritage/GDE-HE-certificate-2550x3300-300dpi.png
e98a0f71de9d75bd  print-sources/output/prism-rush/GDE-PR-certificate-2550x3300-300dpi.png
708ed9f306ec6b71  print-sources/output/signature-spotlight/GDE-SS-certificate-2550x3300-300dpi.png
f14de7843a49b99b  print-sources/output/stadium-night/GDE-SN-certificate-2550x3300-300dpi.png
cac407d6bbb47377  art-pipeline/out/etsy-shots/packages/pack-front-panel.png
0ef726d9b03476b2  art-pipeline/out/etsy-shots/packages/pkg-pack-real.png
925969c34ee2e22a  art-pipeline/out/etsy-shots/packages/tile-pack.png  (= etsy/listing-images/01-basketball-card/src/pkg-04-foil-pack.png)
ed9d1f4f69f70674  art-pipeline/out/etsy-shots/packages/out-pack.png
9fea7ee333c434e4  art-pipeline/out/etsy-shots/packages/out-pack-raw.png
322695ac1e88e842  art-pipeline/out/etsy-shots/packages/out-pack-scene.png
921f37c4c3d8f400  art-pipeline/out/etsy-shots/packages/_baseball/pack.png
3ca1d11d210c4d34  art-pipeline/out/etsy-shots/packages/_cheerleading/pack.png
264125125a88b081  art-pipeline/out/etsy-shots/packages/_football/pack.png  (= _wrestling/pack.png)
f2a1615f90f2ee55  art-pipeline/out/etsy-shots/packages/_soccer/pack.png  (= _softball/pack.png)
fa8c64174fe77710  art-pipeline/out/etsy-shots/packages/_volleyball/pack.png
ecbfeb0bfa5606a7  art-pipeline/out/etsy-shots/packages/_baseball/panel.png
e3a2c0020192822a  art-pipeline/out/etsy-shots/packages/_cheerleading/panel.png
b7fa27b9035cd276  art-pipeline/out/etsy-shots/packages/_football/panel.png  (= _wrestling/panel.png)
747d14d8bf066656  art-pipeline/out/etsy-shots/packages/_soccer/panel.png  (= _softball/panel.png)
44f37f218e03713d  art-pipeline/out/etsy-shots/packages/_volleyball/panel.png
507ea44b66777429  etsy/listing-images/04-complete-set/src/baseball-certificate.png
9a122fe823055320  etsy/listing-images/04-complete-set/src/cheer-certificate.png
657bdae1aa3b2303  etsy/listing-images/04-complete-set/src/football-certificate.png
83d3da878471b29c  etsy/listing-images/04-complete-set/src/marcus-sn-certificate.png
0a98efec123c9ebf  etsy/listing-images/04-complete-set/src/soccer-certificate.png
6d1c5469e324756d  etsy/listing-images/04-complete-set/src/volleyball-certificate.png
```
The test should hash every file under `public/images/**` and fail on any match; also fail on any
`public/` filename containing `pack` until a count-neutral pack face is added to an allowlist. Not
hashed but also DNU by content: `03-senior-night/src/*-sr-pack-flat.png` and `*-sr-pack-front-panel.png`
(not viewed — the SR pack face may or may not carry a count; verify one at 4× before deciding).

---

## 4. `card-flip/out/` — 27 MP4 + 20 GIF

All MP4: H.264 yuv420p, 30 fps, **5.000 s, 150 frames**, `-crf 18`, faststart; 1080×1350 (4:5) or
1080×1920 (9:16). GIF: 540×675, 20 fps, 100 frames, 128 colours, 3–4.5 MB (internal preview, ignored
by git). Frame 0 = front face, still; the turn runs 30 %→58 % (1.5 s→2.9 s); frames from ~3.0 s show
the back. Naming: `GDE_<CODE>_CardFlip_<W>x<H>.mp4` where `<CODE>` = finish code (dark navy bg), or
`<SPORT>SR` (Senior Night card, **light stock bg**), or `<SPORT>LIGHT` (the sport's second-finish card
rendered on the **light bg** — "LIGHT" is the background, not a finish; see
`etsy/video/render_card_promo_v3.py:10`). Source pairs in `card-flip/assets/<dir>/card-{front,back}.png`
(1500×2100 each, ignored by git).

| MP4 (1080×1350 unless noted) | Assets dir | Athlete · finish · **cardId** | Registry row | Bg | Ship? |
|---|---|---|---|---|---|
| `GDE_SN_CardFlip_1080x1350` (+`_1080x1920`) | `marcus-sn` | Marcus Ellison · Stadium Night · `GDE-SN-BKB-2026-12` | public demo ✔ | navy | **YES** — the `/c` demo card, home §4.1 s5 |
| `GDE_SNLIGHT_CardFlip_1080x1350` | `marcus-sn` | same card | ✔ | stock | yes — for light pages (`/trading-cards` hero) |
| `GDE_BSBSR_…` | `baseball-sr` | Casey Whitlock · SR · `GDE-SR-BSB-2026-07` | ✔ QR correct | stock | **YES** |
| `GDE_CHRSR_…` | `cheer-sr` | Amara Boyd · SR · `GDE-SR-CHR-2026-01` | ✔ QR correct | stock | **YES** |
| `GDE_FTBSR_…` | `football-sr` | Tui Fa'agata · SR · `GDE-SR-FTB-2026-54` | ✔ but **QR stale** (Nia) | stock | after back re-export |
| `GDE_SOCSR_…` | `soccer-sr` | Mateo Herrera · SR · `GDE-SR-SOC-2026-10` | ✔ QR correct | stock | **YES** |
| `GDE_SFBSR_…` (untracked, 09-05) | `softball-sr` | Brooke Danner · SR · `GDE-SR-SFB-2026-03` | ✔ QR correct | stock | **YES** (commit it) |
| `GDE_VBSR_…` | `volleyball-sr` | Jaslene Ocampo · SR · `GDE-SR-VBL-2026-05` | ✔ QR correct | stock | **YES** |
| `GDE_WRSSR_…` (untracked, 09-05) | `wrestling-sr` | Dawson Pryor · SR · `GDE-SR-WRS-2026-01` | ✔ QR correct | stock | **YES** (commit it) |
| `GDE_BSBLIGHT_…` | `baseball-he` | Casey Whitlock · Heritage · `GDE-HE-BSB-2026-07` | ✔ QR stale | stock | after back re-export |
| `GDE_CHRLIGHT_…` | `cheer-pr` | Amara Boyd · Prism Rush · `GDE-PR-CHR-2026-01` | ✔ QR stale | stock | after back re-export |
| `GDE_FTBLIGHT_…` | `football-fs` | Tui Fa'agata · Fire & Smoke · `GDE-FS-FTB-2026-54` | ✔ QR stale | stock | after back re-export |
| `GDE_SOCLIGHT_…` | `soccer-ca` | Mateo Herrera · Chrome All-Star · `GDE-CA-SOC-2026-10` | ✔ QR stale | stock | after back re-export |
| `GDE_VBLIGHT_…` | `volleyball-ss` | Jaslene Ocampo · Signature Spotlight · `GDE-SS-VBL-2026-05` | ✔ QR stale | stock | after back re-export |
| `GDE_CA/FS/HE/PR/SS_CardFlip_1080x1350` (+`_1080x1920`) | `ca/fs/he/pr/ss` | **Nia Brooks** in each finish | Nia only registered as SN | navy | **NO** — Nia; `/styles` (F3) needs Marcus BK-<FIN> backs at 2× (only fronts exist, 750×1050) → Figma export + re-render |
| `GDE_SN_Order03_CardFlip_*` (3) | `order03-sn` | Žilvinas Rubliauskas · real customer · `GDE-SN-BKB-2026-51` (unlisted) | real | navy | **NEVER** on marketing pages; only the private `/c` page may reference it, and only if the owner wants the flip there |
| `*_1080x1920.mp4` (6) | — | 9:16 story cuts | — | — | not needed by the site |

"QR stale" = the back frame shows a QR that opens Nia's page (§0.4). The cardId/ID text is right, so
these six are one Figma back re-export + `render.sh` away from shippable.

### 4.1 Recommendations for the `CardFlip` component
- The component's primary path is CSS 3D (port of `card-flip/web/flip.html`: 5 s
  `cubic-bezier(0.4,0,0.2,1)`, keyframes 0–30 % hold, 36 % 38°, 44 % 90°, 52 % 142°, 58–100 % 180°;
  scale 1→1.04→1). **`flip.html` still has `border-radius: 4.5% / 3.2%` (line 27) — the port uses
  radius 0** (spec §2.5). Inputs = the front/back WebP pairs from `card-flip/assets/<dir>/` (§8.3),
  not the MP4.
- Ship MP4 only as the **fallback and the `VideoObject`** on public `/c` pages: `GDE_SN` (demo) and the
  five SR flips with correct QRs today; the six stale-QR ones after re-export. Re-encode for the web
  (source is `-crf 18`, 1.2–2.2 MB — over the `/c` above-the-fold budget of 1 MB):
  ```
  ffmpeg -y -i card-flip/out/GDE_SN_CardFlip_1080x1350.mp4 -an -vf "scale=720:-2" \
    -c:v libx264 -profile:v high -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart \
    public/video/flip/GDE-SN-BKB-2026-12-flip-720.mp4
  ffmpeg -y -i card-flip/out/GDE_SN_CardFlip_1080x1350.mp4 -an -vf "scale=720:-2" \
    -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 public/video/flip/GDE-SN-BKB-2026-12-flip-720.webm
  ```
  (`libvpx-vp9` and `libx264` are both present in the local ffmpeg.) Load with `preload="none"`,
  `poster=` the frame below, `playsInline muted`, autoplay once only below the fold.
- Poster frame (front face, frame 0) and the "back" still (for the reduced-motion toggle when the
  PNG pair is not available):
  ```
  ffmpeg -y -ss 0   -i in.mp4 -frames:v 1 -vf "scale=720:-2" front.png
  ffmpeg -y -ss 4.5 -i in.mp4 -frames:v 1 -vf "scale=720:-2" back.png
  ```
  then sharp → WebP q82. Prefer the PNG pair over extracted frames wherever the pair exists.
- For the stock-background pages, the `*LIGHT`/`*SR` renders (beige bg) match; for `/c` (arena) the
  navy renders match. SR cards only exist on beige today → re-render with
  `STYLE=BSBSR FLIP_ASSETS=assets/baseball-sr FLIP_BG=8,12,18,255 ./render.sh` for `/c` when the
  builder wants a colour-matched fallback (optional; the CSS flip needs no bg video at all).
- GIFs: never ship (3–4.5 MB, ignored by git).

---

## 5. Brand files

| File | px | What it is (viewed) | Verdict |
|---|---|---|---|
| `public/brand/shield.png` | 512×555 | navy shield, transparent bg | keep as raster fallback (BrandMark renders it at 36 px → fine) |
| `public/brand/wordmark-navy.png` / `-white.png` | 328×117 | wordmark, transparent | **1× only** — `BrandMark` displays 168×60, so retina gets 1.95× → acceptable, but the SVG below is the fix; identical to `etsy/video/trial/gde-wordmark.png` |
| **`public/brand/shield.svg`** (untracked, 2026-09-06 19:45) | 307×333 | Figma export: group `Brand — Game Day Edition`, path fill `#172C50`, **plus two background rects** (`<rect width=307 height=333 fill="#E5E5E5"/>` and a white `rx=24` 1500×1150 rect) | **clean before use**: delete both `<rect>`s, set the path `fill="currentColor"`, keep `viewBox="0 0 307 333"`, drop width/height, add `role="img"` + `<title>Game Day Edition</title>`; 0 `<text>` elements ✔ (outlined) |
| **`public/brand/wordmark.svg`** (untracked) | 604×206 | same export pattern; fill `#1E2A4A` (**not** `--navy #172C50` — Figma's wordmark colour differs) + two bg rects | same cleanup; `currentColor` makes the navy/white/silver variants CSS-driven (`color: var(--navy)` on stock, white on arena, silver via `background: var(--silver)` + `mask-image: url(wordmark.svg)` for the footer shield) |
| `public/favicon.svg` | 24×24 | **generic four-tile blue placeholder** from the Cover Moment MVP commit (`ccc0f4f`) — not "CM" letters, but not the GDE mark either | **replace** — see 5.1 |
| `public/og.webp` | 1200×630 | shield + wordmark on stock | valid default OG |
| `exports/brand/GDE-etsy-shop-icon-1000x1000.png` | 1000² | white shield on navy square | app-icon source (`app/icon.png` 512, `app/apple-icon.png` 180) |
| `etsy/video/trial/gde-shield-4x.png` | 1228×1332 | navy shield, transparent | PNG @2x fallback source for the shield if the SVG is rejected |
| `print-sources/brand/GDE-auth-signature.png` | 997×331 | John Birch signature, white strokes, transparent | `FounderNote` signature (invert to ink on stock via CSS `filter: invert(1)` or export a navy variant) — real signature, allowed |
| `exports/*/bonus/GDE-<FIN>-{badge-number,sticker-name-number}.png` | 1608×1628 / 2628×1280 | Nia-era number badge/sticker die-cuts | not F1; Nia |

### 5.1 Favicon / icons plan
Next.js app-router file conventions: `app/icon.svg` (the cleaned shield, navy on transparent),
`app/icon.png` (512², from the Etsy icon: white shield on navy, so it survives dark tabs),
`app/apple-icon.png` (180², same), and keep `public/favicon.svg` pointing at the shield for the
explicit `icons:` entry in `app/layout.tsx:21`. `manifest.webmanifest` with the 192/512 PNGs. Delete
the four-tile placeholder.

### 5.2 Fallback plan and the optional Figma step
Order of preference for the design-system builder: (1) the two untracked SVGs after cleanup — they
are already the Figma exports the spec asks for (group name matches the brand frame; confirm with the
owner who exported them and commit them); (2) if their provenance cannot be confirmed, re-export from
Figma file `KzdEYF1UD9EnsczY8Kpyxi` nodes **65:3** (shield) and **63:3** (wordmark) with
`download_assets` + `curl` (memory: yields SVG/PNG; load the `figma-use` skill first); (3) PNG @2x
fallback: `gde-shield-4x.png` → `public/brand/shield@2x.png` 256×278 and the existing wordmark PNGs
rendered at ≤164 CSS px. The GDE mark is always a file, never font text (`components/BrandMark.tsx`
already does this).

---

## 6. Current `public/images/*` — keep or retire under §2.4

| File | px | What it shows (viewed) | Verdict | Why |
|---|---|---|---|---|
| `hero-basketball.webp`, `hero-football.webp`, `hero-softball.webp` | 760×1140 | single athlete **pose renders** (old sprites, #23/#11/#44) in a stadium — no card, no poster | **RETIRE** | pose render instead of product; old finishes; used by `app/site-client.tsx:29–31` |
| `transformation.webp` | 1774×887 | phone photo → pose render (the "after" is not a card) | **RETIRE** | after must be card/poster |
| `photo-guide.webp` | 1536×1024 | 2×4 grid of example phone photos (portrait, game, blurred, group…) | **KEEP** | spec §4.9 names it; add `FictionalLabel`; the newer per-shot set `art-pipeline/out/etsy-shots/{12a-send-front,12b-send-left,12c-send-right,12d-send-full,12x-bad-*}.png` (judged) is the better F1 source — Manifest A |
| `sports-board.webp` | 1536×1024 | 2×4 sprite of old finishes incl. a Vintage-style frame | **RETIRE** | dropped finishes |
| `styles-board.webp` | 1536×1024 | 2×3 sprite incl. Vintage frame + neon | **RETIRE** | dropped finishes |
| `team-order.webp` | 1536×1024 | banquet table with six old-style posters | **RETIRE** | old finishes; `/teams` is F2 and gets the `team-order-staged-composited` scene; used by `site-client.tsx:259` |
| `hero-identity-pack.webp` | 1570×1001 | framed poster + fanned **rounded-corner** cards + phone, old finish | **RETIRE** | rounded corners, old sprites; used by `site-client.tsx:164` |
| `hero-physical.webp` | 1586×992 | kid holding a phone + old card/poster | **RETIRE** | old sprites |
| `sport-examples/*.webp` (17, 1254² / 1536×1024) | — | 2×3 sprites of old finishes per sport (Vintage + neon tiles visible) | **RETIRE** (delete the folder) | spec Appendix B names them |
| `cards/<slug>.webp` (15) | 600×840 | `marketing/cards` fronts at 0.667× | replace by §8.2 (larger, descriptive names) | valid art, wrong size/name |
| `finishes/{SN,CA,FS,HE,SS,PR}.webp` | 600×840 | Marcus Ellison BK-<FIN> fronts (from `01-basketball-card/src/BK-*-front.png` 750×1050) | **KEEP art**, re-derive at 750×1050 with descriptive names | §4.1 s6 "same athlete, six finishes" |
| `finishes/SR.webp` | 600×840 | Casey Whitlock baseball SR front | keep art, re-derive from `card-flip/assets/baseball-sr/card-front.png` (1500×2100) | 7th tile "Senior Night edition" |
| `og.webp` | 1200×630 | shield + wordmark on stock | keep | |
| `public/cards/qr/*.png` (23) | — | registry QR codes (`npm run qr:gen`) | keep | regenerate after the registry rows in §0.4 are added |

Retirement = delete the files and every reference in `app/site-client.tsx` (the F1 rebuild replaces
that file anyway); the forbidden-strings test does not scan binaries, so an image-name grep
(`sport-examples|hero-identity-pack|styles-board|sports-board|team-order|transformation|hero-(basketball|football|softball)`)
should be added to the asset test so they cannot return.

---

## 7. Founder photo
`public/brand/founder.jpg` **does not exist** (no `*founder*` anywhere in the repo). F0 handoff item 5
asks the owner to download the Etsy profile photo (square, ≥ 600 px). Until it lands, `FounderNote`
(§4.1 s11, `/about`, `/guarantee` signature) renders **name-only**: `OWNER_NAME` from `lib/site.ts`
("John Birch") + the real signature PNG (`print-sources/brand/GDE-auth-signature.png`, inverted to ink)
+ city once D10 is answered — **never a generated face, never a stock portrait, no avatar
placeholder**. When the JPEG arrives: `public/brand/founder.jpg` → sharp → `founder-640.webp` q82
(and 320 for the small note), `alt="John Birch, founder of Game Day Edition"`.

---

## 8. Copy / convert list (source → `public/` target)

Pipeline: one script, `scripts/assets-f1.ts` (tsx + `sharp` 0.34.5, already a devDependency), driven
by a manifest array `{src, dst, width, height?, fit}`; WebP `{quality: 82, effort: 5}`; strip
metadata; write the sha256 of each source next to the output list so the hash audit (§3.3) and the
"type audit" (aspect ratio must match the declared use — a 1024² file must not be declared as a card)
run in the same pass. Run on the owner's Mac (the sources are ignored in git), commit the outputs.
`next/image` with `sizes` handles the responsive variants and AVIF negotiation — ship **one WebP per
asset at the largest size it is displayed at 2×**, not a size ladder. Filenames follow §8 SEO:
`<subject>-<product>-<face>-<finish-slug>.webp`.

Every image below that contains a person or a fictional name renders inside a wrapper that mounts
`<FictionalLabel>` — the component is not optional and not a caption the page may omit.

### 8.1 Hero and family composites (§4.1 s1, s3; §4.2 hero)
| Target | Built from | Size | Notes |
|---|---|---|---|
| `public/images/home/hero-before-photo-<sport>.webp` | Manifest A (roster "before" photo) | 900×1200 | not in this manifest's sources |
| `public/images/home/hero-after-composite.webp` | **code composite** (sharp `composite()`): `etsy/listing-images/04-complete-set/src/marcus-sn-poster.png` (1296×1728) + `card-flip/assets/marcus-sn/card-front.png` + `card-back.png` (1500×2100, QR stale — crop the QR off or wait for re-export) on `--stock`; **no pack** (§0.3) | 1600×1600 | the `hero05-*.png` stages are not usable as-is; `04-complete-set/01-hero.png` (2000²) is the Etsy hero and contains the pack — check before reuse |
| `public/images/families/trading-cards-front-back.webp` | `art-pipeline/out/etsy-shots/packages/mix-12.png` | 1200² | Trading Cards family card |
| `public/images/families/poster-in-room-stadium-night.webp` | `etsy/listing-images/02-basketball-poster/room-SN.png` | 1600² | Posters family card (`room-SN.png` in spec) |
| `public/images/families/complete-set-printed.webp` | spec's `tile-printed.jpg` = `art-pipeline/out/etsy-shots/senior-night-<sport>/tile-set-printed.png` (SR) or a code composite of poster + `mix-12` (no pack) | 1200² | verify no pack face with a count |
| `public/images/bands/stadium-tunnel-dark.webp` | `packages/hero-bg-set.png` | 1024² | §4.1 s4 dark band bg, CSS blur |

### 8.2 Cards — the 17-sport grid, proof wall, six finishes (§4.1 s6, s7, s10; §4.2 s2–s4)
| Target | Source | Size |
|---|---|---|
| `public/images/cards/<slug>-trading-card-front-stadium-night.webp` ×15 | `marketing/cards/<slug>-front.png` | 900×1260 |
| `public/images/cards/<slug>-trading-card-back-stadium-night.webp` ×15 | `marketing/cards/<slug>-back.png` | 900×1260 — **hold** until the QR is re-exported and the 12 missing registry rows exist (§0.4); until then the grid shows fronts only |
| `public/images/cards/pickleball-text-tile.svg`, `skateboarding-text-tile.svg` | authored (§1) | 900×1260 box |
| `public/images/finishes/basketball-trading-card-front-<finish-slug>.webp` ×6 | `etsy/listing-images/01-basketball-card/src/BK-{SN,CA,FS,HE,SS,PR}-front.png` | 750×1050 (Manifest A source; listed for the section's completeness) |
| `public/images/finishes/baseball-trading-card-front-senior-night.webp` | `card-flip/assets/baseball-sr/card-front.png` | 1000×1400 |
| `public/images/cards/soccer-trading-card-front-chrome-all-star.webp` (+ football/fire-and-smoke, cheerleading/prism-rush, baseball/heritage, volleyball/signature-spotlight) | `card-flip/assets/{soccer-ca,football-fs,cheer-pr,baseball-he,volleyball-ss}/card-front.png` | 1000×1400 — §4.2 s5 cheer example (`cheerleading … prism-rush`) and `/sports` "two finishes per sport" |
| `public/images/cards/wrestling-12-printed-cards-fire-and-smoke.webp` | `packages/_wrestling/twelve.png` | 1200² (optional) |

### 8.3 Editions — `/c/[cardId]` art and the CardFlip pairs (§4.13, §2.5)
Keyed by cardId so `/c` never guesses: `public/images/editions/<cardId>-front.webp` and `-back.webp`
at 1000×1400 (2× of a 500-px card column; the 1500×2100 assets are lanczos upscales of 750×1050
originals, so 1000 wide loses nothing). Plus `public/video/flip/<cardId>-flip-720.{mp4,webm}` and
`-poster.webp` per §4.1.

| cardId | front/back source | flip MP4 | Ready now? |
|---|---|---|---|
| `GDE-SN-BKB-2026-12` | `card-flip/assets/marcus-sn/` | `GDE_SN_CardFlip_1080x1350.mp4` | front yes; back QR stale |
| `GDE-SR-BSB-2026-07` | `card-flip/assets/baseball-sr/` | `GDE_BSBSR_…` | **yes** |
| `GDE-SR-CHR-2026-01` | `cheer-sr/` | `GDE_CHRSR_…` | **yes** |
| `GDE-SR-SOC-2026-10` | `soccer-sr/` | `GDE_SOCSR_…` | **yes** |
| `GDE-SR-SFB-2026-03` | `softball-sr/` | `GDE_SFBSR_…` | **yes** (mp4 untracked → commit) |
| `GDE-SR-VBL-2026-05` | `volleyball-sr/` | `GDE_VBSR_…` | **yes** |
| `GDE-SR-WRS-2026-01` | `wrestling-sr/` | `GDE_WRSSR_…` | **yes** (commit) |
| `GDE-SR-FTB-2026-54` | `football-sr/` | `GDE_FTBSR_…` | back QR stale |
| `GDE-HE-BSB-2026-07`, `GDE-CA-SOC-2026-10`, `GDE-FS-FTB-2026-54`, `GDE-PR-CHR-2026-01`, `GDE-SS-VBL-2026-05` | `baseball-he/ soccer-ca/ football-fs/ cheer-pr/ volleyball-ss/` | `*LIGHT` | back QR stale |
| `GDE-SN-SFB-2026-03`, `GDE-CA-SFB-2026-03`, `GDE-FS-WRS-2026-01`, `GDE-HE-WRS-2026-01`, `GDE-SR-BKB-2026-12`, `GDE-SS-CHR-2026-01`, `GDE-HE-FTB-2026-54` | no 2× pair found in `card-flip/assets/`; look in `etsy/listing-images/03-senior-night/src/`, `04-complete-set/src/` (750×1050) — Manifest A | none | front only |
| `GDE-SN-BKB-2026-23` (Nia) | — | — | **never** |
| `GDE-SS-TEN-2026-12`, `GDE-SN-BKB-2026-51` (real customers, unlisted) | `orders/` (ignored) / `order03-sn/` | Order03 only | private pages only; no marketing use |

### 8.4 Package tiers (`TierCard` imagery, §4.2 s1)
| Tier (SKU) | Target | Source | Size |
|---|---|---|---|
| Digital Card Files (`GDE-ANY-CARD-DIG`) | `public/images/tiers/digital-card-files-laptop-phone.webp` | `packages/tile-digital.png` | 1200² |
| 12 Printed Cards (`-P12`) | `tiers/12-printed-cards-fan.webp` | `packages/mix-12.png` | 1200² |
| 24 Printed Cards (`-P24`) | `tiers/24-printed-cards-fan.webp` | `packages/mix-24.png` | 1200² |
| Sealed Foil Pack (`-PACK`, hidden until D18) | **none** | every candidate is count-bearing | — |
| Digital Poster Files | `tiers/digital-poster-files-monitor.webp` | `packages/_basketball/d1.png` or `_soccer/digital.png` | 1024² (small) |
| 18×24 / 24×36 | `tiers/poster-18x24-room.webp`, `poster-24x36-room.webp` | `etsy/listing-images/02-basketball-poster/room-SN.png` (one shot; size comes from the to-scale sheet, not two rooms) | 1600² |
| Set tiers (Printed / Deluxe / Ultimate) | `tiers/complete-set-{printed,deluxe,ultimate}.webp` | `senior-night-<sport>/tile-set-*.png` after the 4× pack-face check; Ultimate without a verified count-neutral pack shows Deluxe imagery + text | 1200² |

### 8.5 Rooms and life shots (§4.2 Posters s1/s3, `/senior-night` mood, `/styles` F3)
`etsy/listing-images/02-basketball-poster/room-{CA,FS,HE,SS,PR}.png` → `public/images/rooms/poster-in-room-<finish-slug>.webp` 1600²;
`packages/lifeart-{soccer,cheerleading,baseball,volleyball}.png` → `rooms/poster-at-home-<sport>-<athlete>.webp` 1024² (display ≤ 560 px, `FictionalLabel`).

### 8.6 Brand
`public/brand/shield.svg`, `wordmark.svg` (cleaned, `currentColor`) · `app/icon.svg` · `app/icon.png` 512 + `app/apple-icon.png` 180 from `exports/brand/GDE-etsy-shop-icon-1000x1000.png` · `public/brand/shield@2x.png` 256×278 from `gde-shield-4x.png` · `public/brand/signature-ink.png` from `GDE-auth-signature.png` (recoloured `--ink`).

---

## 9. Open questions and blockers

**Blockers (must be resolved before the affected section ships)**
1. **Stale QR on every evergreen card back** (§0.4). Fix = re-export the backs from Figma with the
   per-card QR (`public/cards/qr/<cardId>.png` is the source the templates should bind to), then
   re-render the 6 affected flips (`render.sh`). Until then: §4.1 s5 uses an **SR back whose QR is
   verified** (e.g. `GDE-SR-BSB-2026-07`, `card-flip/assets/baseball-sr/card-back.png`) for the
   orange-ring demo, and the EditionPanel demo id changes accordingly — or the back is shown with
   the QR region cropped out (poor: the section is about the QR).
2. **12 unregistered printed IDs** on the SN sport backs (`GDE-SN-CHR-2026-01`, `-BSB-2026-07`, …).
   Registry builder: add rows (`card:new`, fictional, demo) from the printed text, regenerate
   `public/cards/qr/`, then the grid may show backs. Numberless sports print the edition number
   (`-01`, `cards.ts:474`) while the `buildCardId` doc comment (`cards.ts:100`) still describes an
   `E##` counter — align the comment with the printed convention so `card:new` does not mint `E01`.
3. **No count-neutral pack face anywhere** → hero/set composites ship without a pack; Sealed Pack
   tier has no image (hidden anyway); Ultimate set tile needs the 4× check.
4. **All `print-sources/output` card masters are Nia** → nothing from that folder ships in F1.
5. **Founder photo absent** → name-only signature.
6. The ignored source roots must be copied on the owner's machine; CI cannot regenerate `public/`.

**Open questions for the owner / other manifests**
- Who exported `public/brand/{shield,wordmark}.svg` today, and from which nodes? (If 65:3/63:3, commit
  after cleanup; the wordmark fill `#1E2A4A` vs token `--navy #172C50` — which navy wins?)
- SR certificate wording "single numbered Senior Night edition" — S10 forbids "numbered" in copy; is the
  photographed certificate exempt, or does the Figma cert get "registered"?
- Do the `_<sport>/phone-wall.png` wallpapers (post-08-20 sport files) carry the safe-zone
  `TEMPLATE_GUIDES` pass? Not needed in F1; needed before `/order/[token]/files` previews (F2).
- `hero05-*.png` are stages, not composites — does the spec's §4.1 s1 wording ("or `hero05-<sport>.png`")
  get corrected, or does someone run the `lifeart`-style print-in pass on them?
- `chr-sr-back.png` / `soc-sr-back.png` QR did not decode at the crop used — re-run the decoder on the
  full image (the `card-flip/assets/{cheer-sr,soccer-sr}` copies decoded correctly, so this is likely a
  detector miss, not a defect).
- Pickleball/skateboarding cards: text tiles for F1 confirmed? (Alternative is hiding two of the
  "17 sports", which breaks the true-count claim.)

**Provenance of the "viewed" claims** — contact sheets built from downscaled thumbnails in the session
scratchpad (`sheets/A-packages.jpg` … `L-back-id-lines.jpg`), plus `cv2.QRCodeDetector` output; no
source file was opened at full size except the 816×1110 SN pack-face crop and the certificate crop
used to confirm the "10".
