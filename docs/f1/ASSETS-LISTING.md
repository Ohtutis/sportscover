# F1 · ASSET MANIFEST A — listing-image sets + per-card art

Written 2026-09-06 on branch `site/f1`, read-only audit of the repo. Companion to
`docs/SITE-BUILD-SPEC-2026-09.md` (§2.4 image rules, §4.1/4.2/4.3/4.7/4.9/4.13 sections, §6 honest
social proof, §8 forbidden strings, §11 F1). Every path below is repo-relative to
`/Users/a/Documents/sportscover/`. Dimensions were measured with `sips`; hashes with `md5 -q`;
corner alpha with PIL on pixel (1,1). Twelve images were viewed to verify what they show — those
rows say **viewed**; everything else is inferred from filename, `etsy/LISTING-STATE.md` and
`etsy/listing-images/02-basketball-poster/README.md` and says **inferred**.
Patched 2026-09-06 (same day): §5 real-customer rows reconciled with `docs/f1/CONTRACTS.md` §5.6 — see §5.4.

Verdict vocabulary used in every table:

| Verdict | Meaning |
|---|---|
| **USE** | May go to `public/` after the standard sharp pass; carries `FictionalLabel` when an athlete is in frame |
| **CROP** | Only a sub-region may be used (the rest carries Etsy chrome, a page counter, a count, a price or forbidden wording) — the crop box is stated |
| **F3** | Not needed in F1; earmarked for `/styles/[finish]` or `/sports/[sport]` (F3) |
| **NO** | Do not publish — reason given (count-bearing, "Verified", Etsy price/flow, stale finish, Nia Brooks, swoosh, real customer outside their own `/c` page (§5.4), duplicate, stale pre-square-corner export) |
| **VERIFY** | Usable in principle, but one named property must be checked visually before the sharp pass (the check is stated) |

---

## 0. Rules this manifest enforces

1. **Product = real art.** After-images are always a card or poster, never a pose render (§2.4).
2. **Every fictional athlete carries `<FictionalLabel>`** ("Example — fictional athlete · photo and artwork generated") in or directly under the frame (`components/FictionalLabel.tsx`). This includes the generated "before" photos.
3. **Never publish:** `public/images/sport-examples/*` (17 old sprites — dropped finishes, swoosh); any Nia Brooks export (`print-sources/output/**`, `card-flip/assets/{ca,fs,he,pr,ss}`, `card-flip/out/GDE_{CA,FS,HE,PR,SS}_*`, `exports/**`, `card-flip/assets/card-front.png|card-back.png`); **count-bearing pack or certificate art** (anything that prints "10 COLLECTIBLE CARDS", "limited run of 10 cards", "A single edition of ten", "25 cards", any card count); SN/CA wallpapers without safe zones; real customer material (`GDE-SS-TEN-2026-12`, `GDE-SN-BKB-2026-51`: `orders/4164205493/**`, `card-flip/assets/order03-sn`, `card-flip/out/GDE_SN_Order03_*`) **anywhere except each customer's own unlisted `/c` page** — that single exception is governed by §5.4 (the CONTRACTS §5.6 rule: `public/cards/<cardId>/` only, produced only with `--allow-orders`, never under `public/images/**`, never referenced from any other page).
4. **Pack is 18 cards total** (4 holographic chase, 14 standard). Never "18 + 4", never "10 cards"/"22 cards". Site copy about the pack comes from `lib/catalog`, never from art.
5. **Cards are square-cut.** Any card face exported before the square-corner round (`etsy/LISTING-STATE.md` "Stačių kampų ratas UŽBAIGTAS", 2026-09-02) is suspect. The corner-alpha audit in §5.3 lists which files are proven square (opaque corner) and which are rounded (transparent corner).
6. **Numberless sports** (cheerleading, gymnastics, swimming, tennis, golf) never get a jersey number in alt text, captions or filenames. Never "youth".
7. **"Registered", never "Verified"** on anything that depicts the registry (§4.13 D9). Two slides carry "VERIFIED ORIGINAL" / "Registered. Verified online." and are **NO**.
8. **Site prices come from `lib/catalog/prices.ts`** (+10 % over Etsy). Any slide that shows an Etsy package name with a price, or the Etsy ordering flow ("digital download", "how to order"), is **NO** on the site.
9. Alt text pattern (§8): "Custom football trading card front — Fire & Smoke finish — example artwork, fictional athlete". Filenames descriptive, kebab-case, sport + product + finish.

---

## 1. Where the sources live

Three tiers. All are **gitignored** except where stated — the asset-pipeline agent must run on the owner's Mac (iCloud Drive copy), not from a clean clone.

| Tier | Path | What | Tracked | Notes |
|---|---|---|---|---|
| **A · live slide exports** | `Exportai Etsy/<listing>/` (25 folders, 3 + 20 + 21 + 20×22 files) | The exact 20 slides uploaded to each live Etsy listing, JPG, **4000×4000** (basketball card, cheer card/poster, volleyball card/poster, football poster, basketball poster, complete sets, all SN sets) or **2000×2000** (baseball card/poster, football card, soccer card/poster). Folder mtimes 2026-08-26 → 2026-09-05. | no (`.gitignore:104`) | **Primary source for slides.** Filenames are the slide titles, e.g. `card baseball/04 · Front + back, numbered, registered.jpg`. Folder names are the owner's ("valley poster" = volleyball poster, "SN werstling" = wrestling). Four listings (softball card/poster, wrestling card/poster) are NOT here — their slides are only in tier B. |
| **B · per-set build folders** | `etsy/listing-images/<NN-sport-type>/` (21 sets) | The build-time PNG slides (2000×2000, a few 2048) plus `src/` layers. Several sets are **stale** (pre-V3, pre-square-corner) or **partial** (only `src/`). | no (`.gitignore:83`) | **Primary source for `src/` layers** (card faces, posters, pack panels, certificates, proofs, wallpapers, scene composites). Slides here are secondary to tier A. |
| **C · pipeline outputs** | `card-flip/assets/<x>/` (1500×2100 2× faces) + `card-flip/out/` (mp4/gif); `marketing/cards/<sport>-front\|back.png` (900×1260, 15 sports); `art-pipeline/out/etsy-shots/**` (scenes, packages, SN sets, softball/wrestling scenes); `art-pipeline/out/athletes/<slug>/` (before photos, `_kit.png`, `_identity.png`); `print-sources/output/<finish>/` (816×1110 masters, **Nia Brooks**) | | `card-flip/out` is tracked (25 files); `art-pipeline/out/etsy-shots` tracked (353 files, PNG excluded by `.gitignore:69` except where force-added); `marketing/cards` untracked (`.gitignore:89`); `print-sources/output` tracked (27). |

Already in `public/` from F0 (2026-09-06): `public/images/cards/<slug>.webp` ×15 (600×840, made from `marketing/cards/*-front.png` — **rounded-corner sources, see §2.6**), `public/images/finishes/{SN,CA,FS,HE,SS,PR,SR}.webp` ×7 (600×840), `public/images/hero-*.webp`, `public/images/photo-guide.webp` (1536×1024), `public/images/transformation.webp`, `public/og.webp`, `public/brand/{shield,wordmark}.svg|png`, `public/cards/qr/<cardId>.png` ×23.

---

## 2. Global verdicts (evidence-backed)

### 2.1 Count-bearing certificates — **NO**, hash denylist

Every non-Senior-Night certificate on disk prints the sentence "…produced as a **limited run of 10 cards**." Verified by viewing `04-complete-set/src/marcus-sn-certificate.png` (downscaled) and `01-football-card/17-everything-you-get.png` (the Tui FS certificate in the slide). The others share the template (same era, same Figma component) and are denylisted on that basis.

| md5 | file |
|---|---|
| `07966b73b1b06f8191a387249275654b` | `etsy/listing-images/04-complete-set/src/marcus-sn-certificate.png` (2550×3300) — **viewed: "limited run of 10 cards"** |
| `4f36fe386ab7b8c53ee8dacb0ff30068` | `etsy/listing-images/01-football-card/src/FB-FS-certificate.png` — viewed inside slide 17 |
| `4dd10bc2deb2201d8e9a3c4a8ddcdd97` | `etsy/listing-images/01-football-card/src/FB-certificate.png` |
| `9c1f71f5d0a50bbf06b151af37579bab` | `etsy/listing-images/01-cheerleading-card/src/CH-certificate.png` |
| `bea95cb367a3bb792c0a2157806fc570` | `etsy/listing-images/04-complete-set/src/football-certificate.png` |
| `954db69e7806069a5124dcb5c55b9561` | `etsy/listing-images/04-complete-set/src/cheer-certificate.png` |
| `6fbd0d8ef32ef5bd589863e2cf3fd4d9` | `etsy/listing-images/04-complete-set/src/baseball-certificate.png` |
| `292e24770f26a6d12f956fbe0ed130f4` | `etsy/listing-images/04-complete-set/src/soccer-certificate.png` |
| `788bc0111c00d4cf7b0c0d162b974506` | `etsy/listing-images/04-complete-set/src/volleyball-certificate.png` |
| `041e88c09ac48d58a13e4b1cbdfaecb9` `2db432776c76a2b01c50e67f3f57f0d5` `aa15b614adb8e82a5c4c584d2d965151` `193213a7d34a6540f61c01ac6e2bf4a8` `dbe63db753dd038f46173766effad3c5` `74408461965fd76813aadd54cbc42317` | `print-sources/output/{chrome-allstar,fire-and-smoke,heritage,prism-rush,signature-spotlight,stadium-night}/GDE-*-certificate-2550x3300-300dpi.png` (Nia Brooks era; `docs/GAME-DAY-EDITION.md:757` records the "25 cards" → "10" edit) |

**Senior Night certificates are count-neutral** ("…produced as a single numbered Senior Night edition for this athlete.") — verified by viewing `03-senior-night/src/bsb-sr-cert.png`. Allowlist: `cd57593e…` bsb, `825e1bd0…` chr, `a9490ec9…` ftb (1005×1300), `951c75ae…` sfb, `e2d4ddd6…` soc, `a29c4ad1…` vlb, `f445e4ea…` wrs, `85097fa1…` `sr-certificate.png` (basketball SR). Each was fixed in Figma on 2026-09-04/05 (`etsy/LISTING-STATE.md:2037`, `:2345`); the five not viewed (chr, ftb, soc, vlb, sr-certificate) are **VERIFY** (read the fine print once) before publishing.

### 2.2 Count-bearing pack art — **NO**, hash denylist

`etsy/LISTING-STATE.md:2516` and `:2604`: the foil-pack package tile "still reads 10 COLLECTIBLE CARDS" in the softball and wrestling card listings; `:1275`: the basketball listing's tile was pixel-patched to "18" (still count-bearing by the rule, and 18 on art is not the count-neutral panel the owner decided on).

| md5 | files |
|---|---|
| `1f4085d2527810a5d228d130fdbf8f45` | `01-basketball-card/src/pkg-04-foil-pack.png` = `art-pipeline/out/etsy-shots/packages/tile-pack.png` (1400×1400) |
| `3848491c34b812f75b1afac01b5b5f5d` | `01-soccer-card/src/pkg-04-foil-pack.png` = `01-softball-card/src/pkg-04-foil-pack.png` |
| `84ba0e3ca2d5c6c7c14861e6ea078770` | `01-football-card/src/pkg-04-foil-pack.png` = `01-wrestling-card/src/pkg-04-foil-pack.png` |
| `354654c49163e00f95e3b68299e5bbe0` `0ecf518198e588980872ed52d4f454f8` `ba87e63091c6a405ca0b1f00422da153` | `01-baseball-card`, `01-cheerleading-card`, `01-volleyball-card` `/src/pkg-04-foil-pack.png` |
| `522aea35…` `1ee14998…` `9d02ea59…` `8280187a…` `a0526ee0…` `1113e958…` | `print-sources/output/*/GDE-*-booster-pack-FLAT-2032x1560-300dpi.png` (CLAUDE.md: pack face says "10 COLLECTIBLE CARDS") |
| `504dbc3e5fcd54325bda8fa099a92059` | `print-sources/output/tgc/GDE-SN-poker-booster-pack-975x1350-TGC.png` |
| `8f7e36f527e4587e12dea0eb1813b402` `c1f8aa87c641b28bacf8f6550b5527ff` `e6a69fa8dd8aea0a8210a838404310b8` `90f8ac5cdef1656ee00eb8d16460806e` | `art-pipeline/out/etsy-shots/packages/pack-front-panel.png`, `packages/_softball/panel.png`, `packages/_wrestling/panel.png`, `packages/_softball/pack.png` — **VERIFY**: the evergreen (non-SR) panels were never recorded as fixed; treat as count-bearing until read |

**Count-neutral pack panels (SR only, "SEALED COLLECTOR PACK" / "A single numbered edition."):** `03-senior-night/src/{bsb,chr,soc,vlb}-sr-pack-front-panel.png` (409×780), `{sfb,wrs}-sr-pack-front-panel.png` (827×1560 — **byte-identical to each other**, md5 `b7fbfd402a1456bb0da87a68a4dfde1a`: one of the two is the wrong sport's panel, VERIFY which), `art-pipeline/out/etsy-shots/senior-night/src/pack-front-panel.png` (818×1560, football SN master, `LISTING-STATE.md:2037`), `*-sr-pack-flat.png` (1016×780). The football/basketball SR packs were flagged "check too" at `:2146` — VERIFY before use.

### 2.3 "Verified" wording — **NO**

* `etsy/listing-images/01-softball-card/05-everything-you-get.png` and `01-wrestling-card/05-everything-you-get.png` (and tier A `card */03 · Everything you get + registered.jpg` for basketball, baseball, cheer, football, soccer, volleyball — same V3 slide): the phone mock of the registry page shows a green **"✓ VERIFIED ORIGINAL"** chip (viewed on softball). Also contains the count-bearing certificate. Only the card front/back inside may be cropped.
* `Exportai Etsy/Digital complete all sports/18 · Registered. Verified online..jpg` and its build copy `etsy/listing-images/04-complete-set/17-registered.png`: title wording.
* `Exportai Etsy/Digital card/16 · Registered forever.jpg`: "forever" contradicts the ≥5-year promise (§4.11).

### 2.4 Etsy price / flow slides — **NO** on the site

Every `02 · Choose your package` (card V3), `06 · Choose your package` (poster V3, set V3), `SN-06-PACKAGE`, `11 · How to order — digital or printed`, `SN-11-HOW-TO-ORDER`, `20 · Seventeen sports` / `SN-20-CROSS-SELL` / `20 · SPORTS CROSS-SELL` (Etsy shop CTA), `18 · Digital delivery`, `20 · DIGITAL FILES ONLY — NOTHING SHIPS.` Site tiers are named from Etsy variants but priced from `prices.ts`; a baked Etsy price or a "digital download" flow on the site is a §8 conflict.

### 2.5 Nia Brooks / rounded / swoosh — **NO**

`print-sources/output/stadium-night/GDE-SN-card-FRONT-816x1110-300dpi.png` — **viewed**: Nia Brooks #23, Northside Wolves, visible swoosh on the jersey, rounded corners. All `print-sources/output/**` card faces, posters and packs come from the master finish file that "still holds its Nia Brooks placeholder" (`etsy/LISTING-STATE.md:12`), as do `card-flip/assets/{ca,fs,he,pr,ss}/` (2026-08-19/20, transparent corners = rounded) and `card-flip/out/GDE_{CA,FS,HE,PR,SS}_CardFlip_*` (`LISTING-STATE.md` "The other five finishes' flip videos still show Nia"). `card-flip/assets/card-front.png|card-back.png` (2026-08-19, loose) are the same era — NO. `exports/**` (`GDE-SN-sticker-name-number.png`, `GDE-SN-badge-number.png`, `shared-cutouts/*`) are documented stale Nia exports — NO.

### 2.6 Rounded-corner exports — **VERIFY / re-export**

`marketing/cards/*-front|back.png` (900×1260, all dated 2026-08-29, RGB on white) pre-date the square-corner round. **Viewed** `softball-front.png` and `wrestling-front.png`: both Stadium Night, both with rounded corners and a rounded red keyline. `public/images/cards/<slug>.webp` (F0) were made from these and therefore show rounded corners on a site that says "square-cut". Debt: re-export the 15 sport fronts (+2 for pickleball/skateboarding) from the sport files after the square-corner pass, then rebuild `public/images/cards/`. Until then the 17-sport row (§4.1(7)) should crop 12 px inside the keyline or wait.

Corner-alpha audit summary (full list §5.3): every `etsy/listing-images/*/src/*-card-FRONT|BACK.png` and `*-front.png` dated 2026-09-01 or later has an opaque corner (square). Files dated 2026-08-25/27/28 have an opaque corner too (they were exported over the dark card background rather than transparent), so **opaque ≠ proven square** for pre-09-01 files — those are VERIFY (zoom the corner). Transparent corners occur only on the Nia-era flip assets.

### 2.7 Stale build slides vs live exports

`etsy/listing-images/{01-basketball-card,01-baseball-card,01-football-card,01-cheerleading-card,02-basketball-poster,02-football-poster,02-cheerleading-poster,03-senior-night,03b-*,03c-*,04-complete-set}/*.png|jpg` are dated 2026-08-25 → 09-02 — before the V3 rebuilds (card rows 09-02/03, poster rows 09-04, set 09-03, SN 09-04/05) and before the square-corner pass. They are **not what is live** (`04-complete-set/19-everything-counted.png` says "27 FILES" — viewed; the live V3 and the spec say 28). Use tier A for slides; keep tier B for `src/` only. `01-baseball-card/*.jpg` is the old 13-slide wave-2 layout — NO as slides.

### 2.8 Wallpapers

Spec §2.4: SN/CA wallpapers without safe zones — NO. On disk: `02-softball-poster/src/SN-wallpaper-{desktop,home,lock}.png` (SN, exported 09-05 from the softball sport file — VERIFY safe zones, the sport files were duplicated from the etalon after the 08-20 safe-zone pass only if the etalon had been fixed; CLAUDE.md still lists SN/CA as carrying the defect). HE (`02-football-poster/src/HE-wallpaper-*`, `02-wrestling-poster/src/HE-wallpaper-*`) and SS (`02-cheerleading-poster/src/SS-wallpaper-*`) are the post-safe-zone finishes — USE. SR `*-sr-wall-{desktop,phone}.png` and `art-pipeline/out/etsy-shots/senior-night*/src/wall-*-fit.png` were built 09-04/05 with the SR recipe — VERIFY once.

---

## 3. Slide inventory per set

### 3.0 The three slide grammars and their site mapping

The 22 live listings use three layouts. Mapping is by slide TYPE; the per-set tables below list every file and only add deviations. Spec references: H = `/` §4.1(n); FAM = §4.2(n); SN = §4.3(n); HIW = §4.7(n); PG = §4.9; CP = §4.13.

**Grammar V3-CARD** (`Exportai Etsy/{Card basketball, card baseball, card cheer, card football, card soccer, card volley}`; `etsy/listing-images/{01-softball-card,01-wrestling-card}`):

| # | Title | Shows | Site use | Verdict |
|---|---|---|---|---|
| 01 | HERO — the card, up front | Big "before" phone photo + orange arrow → lead-finish card, sport-surface background, headline | H1 reference only (site hero is composed from layers so the copy stays HTML) | CROP (card + before photo, drop headline/counter) |
| 02 | Choose your package | 4 Etsy tiers with prices | — | NO (§2.4) |
| 03 | Everything you get + registered | front, back, certificate, phone mock | — | NO (§2.1 cert + §2.3 "VERIFIED ORIGINAL") — crop front+back only |
| 04 | Front + back, numbered, registered | Lead card front + back, orange QR ring, callouts 1–4, spec chips (2.5×3.5 · both sides · UV · square-cut) | FAM(3) "Front + back, registered", H5 QR-ring crop | CROP — headline says "NUMBERED" (S10 wants "carries its registered card ID"; wrong for cheer). Crop the two cards; prefer `src/` faces + site-drawn ring |
| 05 | The kid on the card | Athlete holding their own printed card (blank-plate composite) | H1 alt, FAM(1), H10 example editions | USE (+FictionalLabel) |
| 06 | One athlete, six finishes | Six fronts SN/CA/FS/HE/SS/PR in a row | H6, FAM(4) | USE; prefer `src/<SP>-<XX>-front.png` for the site's own strip |
| 07–09 | Style pair SN+CA / FS+HE / SS+PR | Two fronts per pair with finish labels | `/styles/[finish]` | F3 |
| 10 | Every field is yours | Card with leader lines to every editable field | FAM(2) spec sheet / checkout preview | USE (VERIFY leader-line copy: "COLOR", no "number" line for cheer) |
| 11 | How to order — digital or printed | Etsy flow | — | NO |
| 12 | What photos to send | 4 good examples + guidance | PG, H9 | USE |
| 13 | We get the likeness right first | Before photo ↔ reference plate | HIW(2) REFERENCE PLATE, H2 "Will it look like my kid?" | USE |
| 14 | One athlete, consistent in every shot | 4 shots side by side, measured | HIW(2) THE SHOTS / VERIFICATION | USE (no scores in site copy) |
| 15 | Their uniform, their number | Kit plate front + back | HIW(2) KIT BUILD | USE (cheer: title differs; VERIFY back plate is the right sport — softball/wrestling were fixed 09-05 `LISTING-STATE.md:2577`) |
| 16 | Your club's crest | Crest applied unchanged on card/kit | HIW(2), PG crest line, D22 | USE |
| 17 | You approve it before it's final | Watermarked proof with bracket frame | H4 proof band, HIW(5), `/guarantee` | USE |
| 18 | One every season | Same athlete, multiple seasons | H12 / `/registry` "one edition per season" | VERIFY copy, then USE |
| 19 | Made for the moment | Occasions (birthday, senior night, end of season…) | H12 | VERIFY (no "instant", no holiday dates), then USE |
| 20 | Seventeen sports | Sport grid + Etsy shop CTA | H7 only as a crop of the grid | NO as-is; CROP grid |

**Grammar V3-POSTER** (`Exportai Etsy/{basketball poster, baseball poster, Cheer poster, football poster, soccer poster, valley poster}`; `etsy/listing-images/{02-softball-poster,02-wrestling-poster}`): 01 HERO — the poster, up front (poster on a bare wall, athlete looking at it) → FAM(1) posters hero, USE (crop counter) · 02 Their season, their wall (room scene, lead finish) → H3 Posters tile / FAM(1), USE · 03 Three sizes, to scale (18×24 / 24×36 / 30×40 against a person) → FAM(3) to-scale sheet, **VERIFY**: shows 30×40 which the site hides until D18 — crop to two sizes or regenerate · 04 One athlete, six finishes (six posters) → FAM(4), USE · 05 Everything you get + the print (poster + social + wallpapers strip) → FAM(2) digital inventory, VERIFY wallpapers safe zones (SN/CA strips) · 06 Choose your package → NO · 07–09 pairs (poster + room per finish) → F3 · 10–20 as V3-CARD.

**Grammar SN** (`Exportai Etsy/SN {FULL, Football, baseball, cheer, soccer, softball, volley, werstling}`):

| # | SN FULL | per-sport SN | Site use | Verdict |
|---|---|---|---|---|
| 01 | HERO | HERO | SN(1) hero | USE (gold inside media; crop counter) |
| 02 | WHAT-YOU-GET | WHAT-YOU-GET (poster, cards, cert, pack panel) | SN(3) | VERIFY cert/pack are the count-neutral SR versions, then USE |
| 03 | EMOTION | EMOTION (gift / celebration scene) | SN(1) alt, H12 | USE (+FictionalLabel) |
| 04 | WHERE-IT-LIVES | WHERE-IT-LIVES (social + screens) | SN(3), CP downloads preview | VERIFY safe zones, then USE |
| 05 | SPORTS (9 SR fronts) | TEAM (team-order scene) | SN(4) nine sports / SN(5) `/teams` | USE |
| 06 | PACKAGE | PACKAGE | — | NO |
| 07 | PAIR-FTB-BKB | FRONT-BACK-QUOTE (SR back: class year, FR·SO·JR·SR, quote) | SN(3) | USE |
| 08 | PAIR-VBL-SOC | ONE-OF-ONE (cert + 1/1 pill) | SN(1) pill, SN(3) | VERIFY cert text, then USE |
| 09 | CHR-QUOTE | REGISTRY (QR → page) | H5, `/registry` | VERIFY no "Verified", then USE |
| 10 | PERSONALIZATION | PERSONALIZATION | SN(3), checkout preview | USE |
| 11 | HOW-TO-ORDER | HOW-TO-ORDER | — | NO |
| 12 | PHOTO-GUIDE | PHOTO-GUIDE | PG | USE |
| 13 | LIKENESS | LIKENESS | HIW(2) | USE |
| 14 | PHOTO-TO-FINAL | PHOTO-TO-FINAL (before → poster/card) | H1 transformation, H8 | USE |
| 15 | UNIFORM | UNIFORM (kit plates) | HIW(2) KIT | USE (softball/wrestling plates fixed 09-05) |
| 16 | CREST-POLICY | CREST-POLICY | HIW(2), `/about` D22 | VERIFY copy = D22 logo sentence |
| 17 | APPROVAL | APPROVAL (proof) | H4, `/guarantee` | USE |
| 18 | SENIORS | SENIORS (whole class) | SN(5) | USE |
| 19 | EVERYTHING-COUNTED (28 files + 1 page) | same | SN(3), FAM(3) set timeline | USE (28 matches spec; cert is SR) |
| 20 | SEVENTEEN-SPORTS | CROSS-SELL | — | NO |

### 3.1 `etsy/listing-images/01-basketball-card/` — Marcus Ellison #12, Cedar Ridge Bears, lead Stadium Night

Only 6 slide files on disk (partial). Live 20 = `Exportai Etsy/Card basketball/` (V3-CARD grammar, 09-02, 4000 px). Old 20 = `Exportai Etsy/Digital card/` (08-26; **NO** as a set: pre-square, pre-V3; slide 16 "Registered forever").

| File | Dims / date | Shows | Site use | Verdict |
|---|---|---|---|---|
| `01-hero.png`, `01-hero.jpg` | 2000², 08-27 | Old hero (card up front, court bg) | — | NO (superseded by V3 hero; stale corners) |
| `01-hero-v3.png` | 2000², 08-27 | Hero take 3 | — | NO (same) |
| `02-card-in-hand.png` / `.jpg` | 1024², 08-27 | Early card-in-hand composite | — | NO (superseded by `src/s03-athlete-holds-card.png`) |
| `02-front-back-registered.png` | 2000², 08-27 | SN front + back with QR ring, callouts | H5 QR-ring reference | NO as image (pre-square export); rebuild from `src/BK-SN-card-FRONT|BACK.png` (09-01) |

### 3.2 `etsy/listing-images/01-basketball-card-style2/` — `01-hero.jpg` (2000², alternate hero) — NO (rejected take, kept for record).

### 3.3 `etsy/listing-images/01-baseball-card/` — Casey Whitlock #7, Harlow Creek Larks, lead Heritage

13 JPG slides of the OLD wave-2 layout (`01-hero.jpg` … `13-likeness-first.jpg`, 2000², 08-28/09-02). Live 20 = `Exportai Etsy/card baseball/` (2000², 09-02, V3-CARD). Verdict for all 13 on-disk slides: **NO as slides** (stale layout; `04-front-back-numbered.jpg` and `06-six-finishes.jpg` duplicate V3 04/06). Keep `src/`.

### 3.4 `etsy/listing-images/01-cheerleading-card/` — Amara Boyd (numberless), Vale Prep Vanguard, lead Prism Rush

20 PNG slides (2000², 08-27; pre-V3 grammar: `01-hero`, `02-front-back-registered`, `02-transformation`, `03-kid-on-the-card`, `04-likeness`, `05-kit`, `06-four-shots`, `07-every-year`, `08-six-finishes`, `09/10/11-pair-*`, `12-photos`, `13-crest`, `14-every-field`, `15-proof`, `16-registered`, `17-everything-you-get`, `18-digital-delivery`, `19-occasions`, `20-sports-cross-sell`). Live 20 = `Exportai Etsy/card cheer/` (4000², 09-02, V3-CARD). Verdict: all 20 on-disk slides **NO** (stale, pre-square); `17-everything-you-get.png` additionally count-bearing (cert); `16-registered.png` VERIFY wording. Use `Exportai Etsy/card cheer/` per §3.0 — with the numberless rule: slide 15 must not say "their number", slide 04 headline must not say "numbered"; CROP both.

### 3.5 `etsy/listing-images/01-football-card/` — Tui Fa'agata #54, Millbrook Bison, lead Fire & Smoke

Same 20 pre-V3 PNGs as cheer (08-27). `17-everything-you-get.png` **viewed**: FS front, back, certificate ("limited run of 10 cards"), flip strip → **NO** (count-bearing; crop front/back only). All others: NO as slides (stale; superseded by `Exportai Etsy/card football/`, 2000², 09-02). Keep `src/` (richest process-layer set, §4).

### 3.6 `etsy/listing-images/01-soccer-card/` (Mateo Herrera #10, Sunfield Kestrels, lead Chrome All-Star) and `01-volleyball-card/` (Jaslene Ocampo #5, Fox Hollow Anchors, lead Signature Spotlight) — `src/` only; live slides in `Exportai Etsy/card soccer/` (2000², 09-02) and `Exportai Etsy/card volley/` (4000², 09-03), V3-CARD grammar per §3.0.

### 3.7 `etsy/listing-images/01-softball-card/` — Brooke Danner #3, Bell Hollow Wrens, lead Chrome All-Star (2000², 09-05; these ARE the live slides — not in tier A)

| File | Shows | Site use | Verdict |
|---|---|---|---|
| `01-hero.png` | Before photo + arrow → CA card | H1 reference | CROP |
| `02-front-back.png` | **viewed**: CA front + back, orange QR ring, callouts 1–4, "FRONT + BACK. NUMBERED. REGISTERED.", spec chips | FAM(3), H5 | CROP (callouts sit on the art; better: export faces from Figma, see §5) |
| `03-kid-on-card.png` | Brooke holding the CA card | H10, FAM(1) | USE |
| `04-six-finishes.png` | Six softball fronts | H6, FAM(4) | USE |
| `05-everything-you-get.png` | **viewed**: front, back, certificate, phone mock "✓ VERIFIED ORIGINAL", "4 DOWNLOADS + …" | — | NO (§2.1, §2.3) |
| `06-choose-your-package.png` | 4 tiers incl. foil-pack tile "10 COLLECTIBLE CARDS" | — | NO (§2.2, §2.4) |
| `07-pair-sn-ca.png`, `08-pair-fs-he.png`, `09-pair-ss-pr.png` | pairs | `/styles` | F3 |
| `10-every-field.png` | leader lines | FAM(2) | USE (VERIFY) |
| `11-how-to-order.png` | Etsy flow | — | NO |
| `12-photos.png` | good photo examples | PG | USE |
| `13-likeness.png` | before ↔ plate | HIW(2) | USE |
| `14-consistent.png` | four shots | HIW(2) | USE |
| `15-kit.png` | kit plates (fixed to softball 09-05) | HIW(2) | USE |
| `16-crest.png` | crest | HIW(2), PG | USE |
| `17-proof.png` | watermarked proof | H4 | USE |
| `18-every-season.png` | seasons | H12 | VERIFY |
| `19-occasions.png` | occasions | H12 | VERIFY |
| `20-sports-cross-sell.png` | grid + Etsy CTA | H7 crop | NO as-is |

### 3.8 `etsy/listing-images/01-wrestling-card/` — Dawson Pryor #1 (126 lb), Foundry Hill Forge, lead Fire & Smoke (2000², 09-05, live)

Identical file list and verdicts to §3.7 (`02-front-back.png` shows the FS front/back; `05` carries the same VERIFIED mock + cert; `06` the same "10 COLLECTIBLE CARDS" tile — `LISTING-STATE.md:2516`). Wrestling has a plain back (`hasBackNumber:false`) — alt text may say "#1" (numbered sport) but never "number on the back".

### 3.9 `etsy/listing-images/02-basketball-poster/` — Marcus, lead Stadium Night (2048², 08-25/27)

| File | Shows | Site use | Verdict |
|---|---|---|---|
| `01-hero.png`, `01-hero-v3.png` | poster ~70 % height on bare wall, athlete in profile (gen `p01-hero-v8`) | FAM(1) posters hero | VERIFY corners of the warped poster (08-27) then USE; live V3 hero = `Exportai Etsy/basketball poster/01 …` |
| `02-print-ready.png`, `02-two-sizes-to-scale.png` | print facts / 18×24 vs 24×36 against ruler person | FAM(3) to-scale | USE (`02-two-sizes-to-scale` shows only the two sizes the site sells — preferred over V3 slide 03) |
| `03-room.png` | three frames, his in the middle (gen `p03-room-v6`) | H3 Posters tile alt | USE |
| `room-SN.png` … `room-PR.png` (2048²) | one generated room per finish with the real poster warped in | H3 Posters tile (`room-SN.png` named in spec), `/styles/[finish]` hero | USE (+FictionalLabel) |
| `16-social-phone.png`, `16-social-post-flat.png`, `16-wallpaper-desktop.png` | generic feed chrome around 1080×1350 post; 3840×2160 desktop wallpaper on a monitor | FAM(2) digital inventory, CP downloads | VERIFY (SN wallpaper safe zones), then USE |
| `17-social-grid.png`, `17-social-story.png`, `17-wallpapers-strip.png` (1503×520) | the social files / wallpaper strip | FAM(2) | VERIFY (SN) |
| `README.md`, `_alternates/*` | earlier takes; `_alternates/p03-room-v2.png` contains real NBA players in real kit | — | NO (`p03-room-v2` NEVER; others kept for record) |

### 3.10 `etsy/listing-images/02-football-poster/` (Tui, lead Heritage) and `02-cheerleading-poster/` (Amara, lead Signature Spotlight) — 23 PNGs each (08-27; pre-V3 grammar `01-hero`, `01-hero-v3`, `02-transformation`, `02-two-sizes-to-scale`, `03-kid-and-poster`, `04-likeness`, `05-kit`, `06-four-shots`, `07-every-year`, `08-six-finishes`, `09–11 pairs`, `12-photos`, `13-crest`, `14-every-field`, `15-proof`, `16-social-screens`, `17-everything-you-get`, `18-digital-delivery`, `19-occasions`, `20-sports-cross-sell`). Live = `Exportai Etsy/football poster/`, `Cheer poster/` (4000², 09-04). Verdict: on-disk slides NO (stale); `02-two-sizes-to-scale.png` and `03-kid-and-poster.png` are the exceptions — USE after a corner check (posters have no corner issue; the card inset in 03 does). `src/` is rich (§4).

### 3.11 `02-baseball-poster/`, `02-soccer-poster/`, `02-volleyball-poster/` — `src/` only (per-finish posters 2592×3456 / 1296×1728, `int-<XX>.jpg` + `mockroom-<XX>.jpg` 1024² generated rooms, `room-18x24|24x36|30x40.jpg`, `05-their-wall.jpg`). Live slides: `Exportai Etsy/{baseball poster, soccer poster, valley poster}/` (V3-POSTER).

### 3.12 `02-softball-poster/` (Brooke, lead Stadium Night) and `02-wrestling-poster/` (Dawson, lead Heritage) — 20 PNGs each, 2000², 09-05, **live** (not in tier A). V3-POSTER grammar; per-file verdicts as §3.0: `01-hero` USE (crop counter) · `02-their-wall` USE · `03-three-sizes` VERIFY (30×40) · `04-six-finishes` USE · `05-everything-you-get` VERIFY (softball = SN wallpapers → safe zones) · `06-choose-your-package` NO · `07–09` F3 · `10` USE · `11` NO · `12–17` USE · `18–19` VERIFY · `20` NO.

### 3.13 `etsy/listing-images/03-senior-night/` — SN set (Tui SR hero + Marcus SR demo), 21 PNGs, 2000², 08-27 (pre-V3, pre-square)

Live = `Exportai Etsy/SN FULL/` (4000², 09-05). On-disk verdicts: `01-hero.png` (named in spec §4.3(1)) — **VERIFY** it matches the live `SN FULL/SN-01-HERO.jpg`; if not, prefer the live file. `19-everything-counted.png` **viewed**: poster 2 · cards 2 · certificate 1 · social 9 · wallpapers 7 · flip 1 · bonus 5 = "28 FILES + 1 LIVE REGISTRY PAGE", Marcus SR art, no pack → USE for SN(3) (VERIFY cert fine print — SR template, expected neutral). Others (`02-every-senior-every-sport`, `03-card-in-hand-poster-on-wall`, `04-seventeen-sports`, `05-transformation`, `06-likeness`, `07-kit-front-back`, `08-four-shots-measured`, `09-six-finishes`, `10–12 pairs`, `13-what-photos`, `14-club-crest`, `15-every-field`, `16-you-see-it-first`, `17-social-screens`, `18-registered`, `20-how-to-order`): map as SN grammar, but **prefer tier A** (post-square, post-audit); `18-registered.png` VERIFY wording; `20` NO; `09–12` conflict with "no finish picker on SN surfaces" (§4.3) — NO on `/senior-night`, F3 only.

### 3.14 `03b-senior-night-card/` and `03c-senior-night-poster/` — 20 PNGs each (2000², 08-28), no `src/` (share `03-senior-night/src/`). These listings were folded into the SN set row; the files duplicate §3.13 with `02-one-card-every-sport` / `02-one-poster-every-sport` and `18-print-it-your-way` (03c). Verdict: NO (duplicate/stale); nothing unique for F1.

### 3.15 `etsy/listing-images/04-complete-set/` — 20 PNGs (2000², 08-25, the ORIGINAL digital set) + `v3/` + `_alternates/`

| File | Shows | Site use | Verdict |
|---|---|---|---|
| `01-hero.png` | Tui (FS) + Amara (PR) with poster, cards, certificate sliver | H1 "after" composite reference | NO as-is (08-25 corners; cert sliver); rebuild from `src/` — live V3 hero = `Exportai Etsy/Full complete all sports/01 …` and `v3/hero-plate-tunnel.jpg` (2000², 09-03, blank-plate tunnel scene for compositing) |
| `02-four-sports-four-styles.png` | 4 sports × 4 finishes grid | H7/H6 | NO (stale) |
| `03-card-in-hand-poster-on-wall.png` | Nolan Reid (hockey) + Sofia Marchetti (gymnastics) — athletes NOT in the registry | — | NO for F1 (non-registry athletes; keep for F3 `/sports`) |
| `04–07, 12, 13, 15` | shared process slides | HIW, PG | NO (stale duplicates of tier A) |
| `08–11, 14` | finishes / fields | F3 | NO (stale) |
| `16-social-screens.png` | poster listing's social slide | FAM(2) | NO (stale) |
| `17-registered.png` | "Registered. Verified online." | — | NO (§2.3) |
| `18-only-here.png` | sticker + badge + 4 cutouts, "NOT IN THE CARD LISTING…" pill | FAM(2) set inventory | CROP (pill is Etsy-listing talk) |
| `19-everything-counted.png` | **viewed**: Marcus SN poster/cards/cert/wallpapers/social/sticker/badge, "27 FILES + 1 LIVE REGISTRY PAGE" | — | NO (27 ≠ 28; cert count-bearing) — use `SN FULL/SN-19` or `Full complete all sports/19` (VERIFY count = 28 and cert) |
| `20-digital-delivery.png` | delivery | — | NO |
| `v3/hero-plate-tunnel.jpg` (2000²) | blank-plate tunnel hero scene | H1 composite base | USE (composite the real set onto the plate) |
| `v3/tile-printed.jpg` (1400², 09-03) | **viewed**: Marcus SN poster flat + fanned 12 cards + tube on wood, no pack, no cert | H3 Complete Set `TierCard` (spec names `tile-printed.jpg`), FAM tiers | USE |
| `v3/tile-deluxe.jpg`, `v3/tile-ultimate.jpg` (1400²) | 24-card / + sealed pack tiles | FAM tiers | VERIFY (ultimate carries the pack — must be the count-neutral panel; `LISTING-STATE.md:2145` says it was regenerated with it) |
| `_alternates/01-hero-v1…v4-*.png` | rejected hero takes | — | NO |

### 3.16 `Exportai Etsy/` (tier A) — set-level verdicts

| Folder | Listing | Grammar | Notes |
|---|---|---|---|
| `Card basketball/` (4000², 09-02) | 4562666649 | V3-CARD | primary basketball card slides |
| `card baseball/` (2000², 09-02) · `card cheer/` (4000², 09-02) · `card football/` (2000², 09-02) · `card soccer/` (2000², 09-02) · `card volley/` (4000², 09-03) | 4567592965 · 4564284709 · 4563878038 · 4567599879 · 4567597109 | V3-CARD | cheer: numberless — CROP 04/15 headlines |
| `basketball poster/` · `baseball poster/` · `Cheer poster/` · `football poster/` · `soccer poster/` · `valley poster/` (09-04; 2000² for baseball/soccer, 4000² others) | 4562700100 · 4568369175 · 4564287163 · 4564301710 · 4568359117 · 4568365063 | V3-POSTER | `03 · Three sizes` VERIFY (30×40) |
| `Full complete all sports/` (4000², 09-04) | complete set (physical V3) | V3-SET: 01 hero · 02 what you get (poster, cards, cert — **VERIFY cert**) · 03 card in hand / poster on wall · 04 social & screens · 05 six sports six finishes · 06 package NO · 07–09 F3 · 10–17 as V3-CARD · 18 made for the moment · 19 everything counted (VERIFY 28 + cert) · 20 NO | primary set slides |
| `Digital complete all sports/` (4000², 08-26) | old digital set | pre-V3 | NO (stale; 18 "Verified online"; 20 "NOTHING SHIPS") |
| `Digital card/`, `Digital poster basketball/` (4000², 08-26) | old basketball listings | pre-V3 | NO (stale; `16 · Registered forever`) |
| `SN FULL/` (4000², 09-05) | 4564565764 SN set | SN | primary `/senior-night` slides |
| `SN Football/` `SN baseball/` `SN cheer/` `SN soccer/` `SN softball/` `SN volley/` `SN werstling/` (4000², 09-05) | per-sport SN sets (`lib/catalog/sports.ts` `seniorNightListingId`) | SN | primary `/senior-night/[sport]` slides for 7 of the 9 (basketball + lacrosse have no SN listing; lacrosse is never an SN sport — §8) |
| `Cover/` (3200×800) | Etsy shop cover | — | NO on site (Etsy branding) |

---

## 4. `src/` layer inventory (one measured file per type)

| Set | Card faces (750×1050 unless noted) | Other layers |
|---|---|---|
| `01-basketball-card/src/` | `BK-SN-card-FRONT.png` = `BK-SN-front.png` (md5 `fb83d5fb…`, 09-01), `BK-SN-card-BACK.png` (09-01); `BK-{CA,FS,HE,PR,SS}-front.png` (09-01, six-finish row) | `pkg-01-digital.png`, `pkg-02-12-cards.png`, `pkg-03-24-cards.png` (1400², package tiles — USE), `pkg-04-foil-pack.png` (NO §2.2), `s03-athlete-holds-card.png` (2048², card-in-hand composite — USE) |
| `01-baseball-card/src/` | `BB-HE-card-FRONT.png` = `BB-HE-front.png` (09-01), `BB-HE-card-BACK.png` (09-01); `BB-{CA,FS,PR,SN,SS}-front.png` (09-01) | `pkg-0[1-4]`, `s03-athlete-holds-card.png` + `.mask.png` (2048²) |
| `01-cheerleading-card/src/` | `CH-PR-card-FRONT.png` = `CH-PR-front.png` (09-01), `CH-PR-card-BACK.png` (09-01); `CH-{CA,FS,HE,SN,SS}-card-FRONT|BACK.png` (08-27, VERIFY corners); `CH-{CA,FS,HE,SN,SS}-front.png` (09-01) | `CH-PR-poster.png` (1556×2074), `CH-certificate.png` (NO), `pkg-0[1-4]`, `s02-before-a|b.png` (before photos), `s03-athlete-holds-card.png`+mask, `s04-photo-1..4.png` (820²), `s05-inkit.png`, `s05-kit-front|back.png` (1670×2106 kit plates), `s06-panel-1..4.png` (818×1740 four shots), `s12-good-0..3.png` (760×778 photo-guide good examples), `s13-crest.png` (1640×1480), `s17-flip-strip.png` (1840×520) |
| `01-football-card/src/` | `FB-FS-card-FRONT.png` = `FB-FS-front.png` (09-01), `FB-FS-card-BACK.png` (09-01); `FB-HE-front.png` (09-01) vs `FB-HE-card-FRONT.png` (08-27, different file); `FB-HE-card-BACK.png` **1500×2100** (08-27); `FB-SN-card-BACK.png`, `FB-SS-card-BACK.png` 1500×2100 (08-27); `FB-{CA,PR,SN,SS}-card-FRONT|BACK.png` (08-27); `FB-{CA,PR,SN,SS}-front.png` (09-01) | `FB-FS-poster.png` 1944×2592 + `-1600` (1600×2133), `FB-SN-poster.png` + `FB-SN-poster-2000.png` (1500×2000), `FB-FS-certificate.png`/`FB-certificate.png` (NO), `pkg-0[1-4]`, `s02-before-a|b.png` (970×1282), `s02-crest.png` (378²), `s03-athlete-holds-card.png` (2048²), `s04-photo-1..4.png` (820²), `s05-inkit.png` (610×742), `s05-kit-front|back.png` (1670×2106), `s06-panel-1..4.png` + `s06-pose-1..4.png` (818×1740), **`s06-reject.png` (818×1740 — the rejected take for HIW(3))**, `s12-good-0..3.png`, `s13-crest.png`, `s17-flip-strip.png` + `-FS` (1840×520) |
| `01-soccer-card/src/` | `SC-CA-card-FRONT.png` = `SC-CA-front.png` (09-01), `SC-CA-card-BACK.png` (09-01); `SC-{FS,HE,PR,SN,SS}-front.png` (09-01) | `pkg-0[1-4]`, `s03-athlete-holds-card.png` |
| `01-volleyball-card/src/` | `VB-SS-card-FRONT.png` = `VB-SS-front.png` (09-01), `VB-SS-card-BACK.png` (09-01); `VB-{CA,FS,HE,PR,SN}-front.png` (09-01) | `pkg-0[1-4]`, `s03-athlete-holds-card.png`+mask |
| `01-softball-card/src/`, `01-wrestling-card/src/` | **none** (only `pkg-0[1-4]`) — the CA/SN softball and FS/HE wrestling faces exist only in Figma and inside the 2000² slides | `pkg-01..03` USE, `pkg-04` NO |
| `02-basketball-poster/src/` | — | `BK-SN-poster.png`, `05-their-wall.jpg`, `pkg-01-digital.png` |
| `02-baseball-poster/src/` (same shape: soccer, volleyball) | — | `BB-{SN,CA,FS,HE,SS,PR}-poster.png` (2592×3456; SC-/VB- 1296×1728, `SC-FS-poster-v2.png`), `int-<XX>.jpg` + `mockroom-<XX>.jpg` (1024² generated rooms), `room-18x24|24x36|30x40.jpg` (1024²), `05-their-wall.jpg` |
| `02-football-poster/src/` | — | `FB-<XX>-poster.png` 1944×2592 + `-1600` ×6, `HE-social-grid.png` (1080×1350), `HE-social-story.png` (1080×1920), `HE-wallpaper-desktop.png` (2160×1215), `HE-wallpaper-home|lock.png` (739×1600), `16-social-post-flat.png` (1290×2796), `mock-01-hero.png`, `mock-03-room.png` (2000²), `mock-16-monitor|phone.png` (2048²), `mock-room-<XX>.png` ×6 (2048²), `ruler-person.png` (333×1608 — the scale ruler), `s17-wallpapers-strip.png` (1864×636), `room-*.jpg`, `pkg-01-digital.png` |
| `02-cheerleading-poster/src/` | — | same shape with `CH-<XX>-poster.png`, `SS-social-*`, `SS-wallpaper-*` (USE), `mock-room-*` |
| `02-softball-poster/src/`, `02-wrestling-poster/src/` | — | `SF-<XX>-poster.png` (1296×1728) / `WR-<XX>-poster.png` (1050×1400), `SN-*` (softball, VERIFY safe zones) / `HE-*` (wrestling, USE) social + wallpapers, `mock-room-<XX>.png` ×6, `room-*.jpg`, `pkg-01-digital.png` |
| `03-senior-night/src/` (114 files) | per sport `<sp>-sr-front|back.png` (750×1050) for bsb, chr, ftb, sfb, soc, vlb (typo folder-name, 09-04) + `vbl-sr-*` (09-05 re-pull, RGB), wrs; `<sp>-sr-flip-front|back.png` (same 750×1050, byte-identical to non-flip for wrs/sfb); `sr-card-front|back.png` = **Marcus SR basketball** (viewed); `ftb-fs-front|back.png`, `chr-ss-front|back.png` (08-27 evergreen copies) | per sport: `-badge.png` (1600²), `-cert.png` (1275×1650; ftb 1005×1300), `-pack-flat.png` (1016×780), `-pack-front-panel.png` (409×780; sfb/wrs 827×1560), `-poster.png` (1296×1728), `-proof.png` (1400×1092 watermarked), `-social-grid1.png` (864×1080), `-sticker.png` (2600×1280), `-wall-desktop.png` (1920×1080), `-wall-phone.png` (645×1398); `sr-certificate.png`, `sr-poster.png`, `sr-qr.png` (600²), `sr-wall-*`; `ftb-before-a|b.png` (970×1282), `ftb-sr-loupe.png` (756×1008), `ftb-sr-quote-crop.png` (1479×921) |
| `04-complete-set/src/` (131 files) | `marcus-sn-card-front|back.png` (08-25, older than the 09-01 BK- exports — use BK-), `football-card-front.png` = `s03b/tui-card.png` (08-25), `football-card-{CA,FS,HE,PR,SS}.png`, `football-card-back.png` (08-25), `cheer-card-front-PR.png` **1500×2100** (08-27), `cheer-card-back-PR.png`, `cheer-card-{CA,FS,HE,SS}.png`, `baseball-card-front.png` 1500×2100 (08-27, finish?), `baseball-card-{CA,FS,HE,PR}.png` + `baseball-card-back-HE.png` (09-03), `soccer-card-{CA,FS,HE,PR,SN}.png` + `-back-CA` (09-03), `volleyball-card-{CA,FS,PR,SN,SS}.png` + `-back-SS` (09-03), `gymnastics-card-front(-SN).png`, `hockey-card-front.png`, `s03/*` (track/hockey/soccer/volley faces + posters, 08-25), `s03b/casey-ca-front.png` | `marcus-sn-certificate.png` (NO), `marcus-sn-poster.png` (1296×1728), `marcus-sn-poster-2to3.png` (600×900), `*-certificate.png` ×5 (NO), `*-poster*.png`, `football-badge.png` (804×814), `football-sticker.png` (1314×640), `badge-correct.png` (1608×1628), `sticker-correct.png` (2628×1280), `cutout-{hero,pose2,pose3,trio}-correct.png` (2732×4096 Marcus cutouts, corrected), `cluster/<xx>-{badge,profile,sticker,story1}.png` ×5 finishes (800²…), `fb-{grid1,profile,social-post,story1}.png`, `fb-wallpaper-desktop.png` (3840×2160, HE), `football-room1|2.png`, `cheer-room.png`, `hero-bg-2048.png`, `hero-bg-four-athletes.png` (1024²), `user-laptop-raw.png`, `video/f_*.png` + `flip-still.png` (1080×1350 flip frames), `s03b/*` (base/composed/grids — build scaffolding, NO) |

Card-face byte-duplicates across sets (md5-proven, use the canonical path on the left): `01-<sport>-card/src/<SP>-<XX>-front.png` ≡ `04-complete-set/src/<sport>-card-<XX>.png` for baseball CA/FS/PR, soccer FS/HE/PR/SN, volleyball CA/FS/PR/SN; `03-senior-night/src/<sp>-sr-front|back.png` ≡ `art-pipeline/out/etsy-shots/senior-night-<sport>/src/card-front|back.png` (bsb, chr, soc, sfb, wrs, vlb) and `ftb-sr-*` ≡ `etsy-shots/senior-night/src/card-*`; `chr-ss-front.png` ≡ `04-complete-set/src/cheer-card-SS.png`.

Process artefacts for `/how-it-works` (§4.7) and `/photo-guide` (§4.9), fictional roster only: `art-pipeline/out/athletes/<slug>/before/photo1..4.png` (1792×2400; slugs basketball=Marcus, football=Tui, baseball=Casey, softball=Brooke, soccer=Mateo, volleyball=Jaslene, wrestling=Dawson, cheerleading=Amara), `_kit.png` / `_kit-back.png` (2048²), `_identity.png` / `_identity-back.png` (2400×1792); `art-pipeline/out/etsy-shots/<sport>/reject-take.png` (1696×2528, the real near-miss — one per sport), `athlete-holds-card.png` / `card-in-hand.png` (2048², football + cheer), `bad-{blurred,face-covered,group,too-far}.png` (2048², PG bad examples), `art-pipeline/out/etsy-shots/12a-send-front.png` … `12d-send-full.png` and `12x-bad-*.png` (1024², PG generic examples), `11-bad-photos.png`. `art-pipeline/out/etsy-shots/senior-night*/` scenes: `gift-<sport>-composited.png`, `team-order-staged-composited.png`, `celebration-composited.png`, `card-in-case-composited.png`, `poster-on-wall-composited.png`, `phone-in-hand-composited.png` (2048², SN(1)/(3)/(5)), `tile-set-{printed,deluxe,ultimate}.png` (1400²). `art-pipeline/out/etsy-shots/packages/`: `hero05-{baseball,cheerleading,soccer,volleyball}.png` (1024² framed-print bedroom plates, spec-named for H1), `int-<XX>.png`, `room-18x24|24x36|30x40.png`, `life*-<sport>.png`, `pkg-*` tiles, `_<sport>/{digital,twelve,two4,pack,panel,phone-page,phone-wall}.png` (basketball folder has no pack/panel; softball/wrestling `pack.png`/`panel.png` are NO per §2.2). `art-pipeline/out/etsy-shots/p-room-<XX>.png` (1024², six finish rooms, Marcus SN poster).

---

## 5. PER-CARD ART MAP — `/c/[cardId]` (23 registry records, `lib/registry/cards.ts`)

Rules applied: front and back must depict **that athlete in that finish**; prefer the newest post-square-corner export (≥ 2026-09-01) at the largest size; the `/c` flip MP4 fallback must sit on the arena background (dark) — the `*LIGHT` renders are light-background product-page renders (`etsy/video/render_card_promo_v3.py:10`) and need a dark re-render for `/c` (`STYLE=<X> FLIP_ASSETS=assets/<x> FLIP_BG=8,12,18,255 card-flip/render.sh`). Confidence: **H** = file viewed or byte-identical to a viewed/documented file; **M** = naming + `LISTING-STATE.md` provenance, not viewed; **L** = inferred.

| cardId | Athlete · finish | FRONT (best) | BACK (best) | 2× source (1500×2100) | Flip mp4 / gif | Conf. | Notes |
|---|---|---|---|---|---|---|---|
| `GDE-SN-BKB-2026-23` | Nia Brooks · Stadium Night | — | — | — | — | H | **NEEDS GENERATION.** Only art on disk is Nia-era (`print-sources/output/stadium-night/*`, `tgc/*`, `card-flip/assets/card-*.png`, `exports/stadium-night/*`) — rounded corners + swoosh, viewed. Spec F1: "Nia Brooks regeneruota su auditu". Alternative for the owner: set `visibility:"private"` until regenerated (the QR must still resolve). |
| `GDE-SN-BKB-2026-12` | Marcus Ellison · Stadium Night | `etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png` (750×1050, 09-01) | `…/01-basketball-card/src/BK-SN-card-BACK.png` (750×1050, 09-01) | `card-flip/assets/marcus-sn/card-front|back.png` (08-26 — pre-square; VERIFY corners before preferring it) | `card-flip/out/GDE_SN_CardFlip_1080x1350.mp4` + `_540.gif` (08-26, Marcus, dark) — VERIFY corners; `GDE_SNLIGHT_*` light | H | Demo card for H5 `EditionPanel`. Older copies: `04-complete-set/src/marcus-sn-card-front|back.png` (08-25). |
| `GDE-SS-TEN-2026-12` | **Real customer** (Etsy order `4164205493`, registered 2026-09-04; adult, tennis — no "#" in the meta line, spec §4.13 (1)) · Signature Spotlight | `orders/4164205493/exports/01-print/GDE-SS-TEN-2026-12_card-FRONT_816x1110_300dpi.png` (816×1110 **with bleed** — crop 36 px/side to 744×1038, CONTRACTS §4.11; prefer the 2× trim file) | `…/01-print/GDE-SS-TEN-2026-12_card-BACK_816x1110_300dpi.png` (816×1110, bleed) | `orders/4164205493/exports/_flip-src/card-front.png` + `card-back.png` (1500×2100, RGBA, 09-05 — **all four corners opaque card ink, square-cut; measured**) | `…/exports/05-video/GDE-SS-TEN-2026-12_card-flip_1080x1350.mp4` (1.7 MB, 09-05) — **VERIFY bg**: first frame measures (55,80,98) slate, not arena `#080C12` → re-render `FLIP_BG=8,12,18,255` from `_flip-src/` or ship the CSS flip with no MP4 fallback · `_card-flip_540.gif` (540×675, 3.2 MB, link only) · `_1080x1920.mp4` not used on `/c` | H (measured) | **USE — own unlisted page only, `--allow-orders` (§5.4).** Sources are gitignored (`.gitignore:92`); the gated manifest in §5.4 is the only job list that may name them. Wallpapers `03-wallpapers/*` (7 files, SS = safe zones by construction) → F2 signed bucket, **not** `public/` (§5.4 rule 4). Never `images/products/**`, never the sitemap, no `FictionalLabel`. |
| `GDE-SN-BKB-2026-51` | **Real customer** (Order 03, registered 2026-08-26; adult — class year hidden; Figma `iLHCW0lDPPYW5BNpriGL8r`) · Stadium Night | — (no 1× file on disk; the 2× is the source) | — | `card-flip/assets/order03-sn/card-front.png` + `card-back.png` (1500×2100, RGBA, 08-26 — **pre-square: (1,1) and (12,12) are white on both faces, ink only from (30,30); FAILS the §6.2 corner audit; measured**) | `card-flip/out/GDE_SN_Order03_CardFlip_1080x1350.mp4` (1.5 MB, 08-26, arena-dark (4,9,22) — but rendered from the rounded faces) · `_1080x1920.mp4` · `_540.gif` (3.3 MB) — **both MP4s are tracked in git** (§7 Q13) | H (measured) | **USE — own unlisted page only, `--allow-orders` (§5.4) — blocked until a square-cut re-export**: card FRONT/BACK @2× (1500×2100) from `iLHCW0lDPPYW5BNpriGL8r` (square-corner round of 2026-09-02 post-dates this export), then re-render the flip (`STYLE=SN FLIP_ASSETS=assets/order03-sn FLIP_BG=8,12,18,255 card-flip/render.sh`). Until then the page renders **without the flip section** (`cardArtFor` → null, CONTRACTS §4.10) — never a rounded face, never a placeholder plate. No wallpapers in F1 (SN safe-zone pass pending, §2.8, and no bucket yet). |
| `GDE-SR-BKB-2026-12` | Marcus Ellison · Senior Night | `etsy/listing-images/03-senior-night/src/sr-card-front.png` (750×1050, 09-04) — **viewed** | `…/03-senior-night/src/sr-card-back.png` (750×1050, 09-04) | none | **none** — no `basketball-sr` flip assets; render from a 2× Figma export of the basketball SR page | H | |
| `GDE-SR-FTB-2026-54` | Tui Fa'agata · Senior Night | `…/03-senior-night/src/ftb-sr-front.png` (750×1050, 09-04) ≡ `art-pipeline/out/etsy-shots/senior-night/src/card-front.png` | `…/03-senior-night/src/ftb-sr-back.png` (09-04) ≡ `…/senior-night/src/card-back.png` | `card-flip/assets/football-sr/card-front|back.png` (09-05, RGB) | `card-flip/out/GDE_FTBSR_CardFlip_1080x1350.mp4` + `_540.gif` (09-05, dark) | M | `ftb-sr-cert.png` is 1005×1300 (smaller than siblings) — irrelevant for `/c`. |
| `GDE-SR-VBL-2026-05` | Jaslene Ocampo · Senior Night | `…/03-senior-night/src/vbl-sr-front.png` (750×1050, **09-05**, RGB) — the later re-pull; `vlb-sr-front.png` (09-04) is the earlier one | `…/03-senior-night/src/vbl-sr-back.png` (09-05) | `card-flip/assets/volleyball-sr/*` (09-05) | `GDE_VBSR_CardFlip_1080x1350.mp4` + gif (09-05) | M | Two spellings on disk (`vlb-` set of 14, `vbl-` set of 3). Diff front/back once; keep `vbl-` (newer) if they differ. |
| `GDE-SR-SOC-2026-10` | Mateo Herrera · Senior Night | `…/03-senior-night/src/soc-sr-front.png` (09-04) ≡ `etsy-shots/senior-night-soccer/src/card-front.png` | `…/soc-sr-back.png` (09-04) | `card-flip/assets/soccer-sr/*` (09-05, RGB) | `GDE_SOCSR_CardFlip_1080x1350.mp4` + gif | M | |
| `GDE-SR-BSB-2026-07` | Casey Whitlock · Senior Night | `…/03-senior-night/src/bsb-sr-front.png` (09-04) ≡ `etsy-shots/senior-night-baseball/src/card-front.png` | `…/bsb-sr-back.png` (09-04) | `card-flip/assets/baseball-sr/*` (09-05, RGB) | `GDE_BSBSR_CardFlip_1080x1350.mp4` + gif | M | `bsb-sr-cert.png` viewed (count-neutral) — same build. |
| `GDE-CA-SFB-2026-03` | Brooke Danner · Chrome All-Star | — | — | — | — | H | **NEEDS EXPORT (Figma), not generation.** No CA softball face file on disk; depicted only inside `01-softball-card/02-front-back.png` (callouts over the art, viewed) and `05-everything-you-get.png`. Export `card FRONT/BACK` @1× and @2× from the softball sport file. |
| `GDE-SN-SFB-2026-03` | Brooke Danner · Stadium Night | `marketing/cards/softball-front.png` (900×1260, 08-29) — **viewed: rounded corners** | `marketing/cards/softball-back.png` (900×1260, 08-29) | — | — | H | **NEEDS RE-EXPORT (square-cut)** — ticket F1-ART-01 (§5.1); `ART_PENDING` until then. The 12 px keyline crop is **not** used on `/c` (not the exact card); it remains an option for the 17-sport row only (§7 Q4). No flip. |
| `GDE-FS-WRS-2026-01` | Dawson Pryor · Fire & Smoke | — | — | — | — | H | **NEEDS EXPORT (Figma).** `marketing/cards/wrestling-front.png` is Stadium Night (viewed), not FS. Depicted only in `01-wrestling-card/02-front-back.png` (callouts). |
| `GDE-HE-WRS-2026-01` | Dawson Pryor · Heritage | — | — | — | — | H | **NEEDS EXPORT (Figma).** No HE wrestling face on disk (poster `02-wrestling-poster/src/WR-HE-poster.png` exists — not a card). |
| `GDE-SR-SFB-2026-03` | Brooke Danner · Senior Night | `…/03-senior-night/src/sfb-sr-front.png` (09-05) ≡ `sfb-sr-flip-front.png` ≡ `etsy-shots/senior-night-softball/src/card-front.png` | `…/sfb-sr-back.png` (09-05) | `card-flip/assets/softball-sr/*` (09-05) | `GDE_SFBSR_CardFlip_1080x1350.mp4` + gif (09-05) | M | |
| `GDE-SR-WRS-2026-01` | Dawson Pryor · Senior Night | `…/03-senior-night/src/wrs-sr-front.png` (09-05) ≡ `wrs-sr-flip-front.png` ≡ `etsy-shots/senior-night-wrestling/src/card-front.png` | `…/wrs-sr-back.png` (09-05) | `card-flip/assets/wrestling-sr/*` (09-05) | `GDE_WRSSR_CardFlip_1080x1350.mp4` + gif (09-05) | M | Plain back (no number) — alt text must not claim one. |
| `GDE-SR-CHR-2026-01` | Amara Boyd · Senior Night | `…/03-senior-night/src/chr-sr-front.png` (09-04) ≡ `etsy-shots/senior-night-cheerleading/src/card-front.png` | `…/chr-sr-back.png` (09-04) | `card-flip/assets/cheer-sr/*` (09-05, RGB) | `GDE_CHRSR_CardFlip_1080x1350.mp4` + gif (09-05) | M | Numberless: "01" is an edition number; no "#". |
| `GDE-FS-FTB-2026-54` | Tui Fa'agata · Fire & Smoke | `etsy/listing-images/01-football-card/src/FB-FS-card-FRONT.png` (750×1050, 09-01) ≡ `FB-FS-front.png` | `…/01-football-card/src/FB-FS-card-BACK.png` (750×1050, 09-01) | `card-flip/assets/football-fs/*` (08-27, VERIFY corners) | `GDE_FTBLIGHT_CardFlip_1080x1350.mp4` (08-27, **light bg**, pre-square) — re-render dark for `/c` | H (viewed in slide 17) | Older copies: `03-senior-night/src/ftb-fs-front|back.png`, `04-complete-set/src/football-card-FS.png`, `football-card-front.png` (08-25). |
| `GDE-HE-FTB-2026-54` | Tui Fa'agata · Heritage | `…/01-football-card/src/FB-HE-front.png` (750×1050, 09-01) | `…/01-football-card/src/FB-HE-card-BACK.png` (**1500×2100**, 08-27 — VERIFY corners; only HE back on disk) | back only | **none** (`GDE_HE_*` = Nia) — render from `FB-HE-front` @2× + `FB-HE-card-BACK` | M | `FB-HE-card-FRONT.png` (08-27) differs from the 09-01 file — use the 09-01 one. |
| `GDE-PR-CHR-2026-01` | Amara Boyd · Prism Rush | `…/01-cheerleading-card/src/CH-PR-card-FRONT.png` (750×1050, 09-01) ≡ `CH-PR-front.png` | `…/01-cheerleading-card/src/CH-PR-card-BACK.png` (750×1050, 09-01) | `card-flip/assets/cheer-pr/*` (08-28, VERIFY) or `04-complete-set/src/cheer-card-front-PR.png` (1500×2100, 08-27, front only) | `GDE_CHRLIGHT_CardFlip_1080x1350.mp4` (08-28, light, pre-square) — re-render dark | M | Numberless. |
| `GDE-SS-CHR-2026-01` | Amara Boyd · Signature Spotlight | `…/01-cheerleading-card/src/CH-SS-front.png` (750×1050, 09-01) | `…/01-cheerleading-card/src/CH-SS-card-BACK.png` (750×1050, **08-27** — VERIFY corners; only SS back on disk) | — | **none** (`GDE_SS_*` = Nia) — needs render | M | `03-senior-night/src/chr-ss-front|back.png` (08-27) are the same era. |
| `GDE-HE-BSB-2026-07` | Casey Whitlock · Heritage | `…/01-baseball-card/src/BB-HE-card-FRONT.png` (750×1050, 09-01) ≡ `BB-HE-front.png` | `…/01-baseball-card/src/BB-HE-card-BACK.png` (750×1050, 09-01) | `card-flip/assets/baseball-he/*` (09-03) | `GDE_BSBLIGHT_CardFlip_1080x1350.mp4` (09-03, light) — re-render dark | M | |
| `GDE-CA-SOC-2026-10` | Mateo Herrera · Chrome All-Star | `…/01-soccer-card/src/SC-CA-card-FRONT.png` (750×1050, 09-01) ≡ `SC-CA-front.png` | `…/01-soccer-card/src/SC-CA-card-BACK.png` (750×1050, 09-01) | `card-flip/assets/soccer-ca/*` (09-03) | `GDE_SOCLIGHT_CardFlip_1080x1350.mp4` (09-03, light) — re-render dark | M | `04-complete-set/src/soccer-card-back-CA.png` (09-03) is a second back export. |
| `GDE-SS-VBL-2026-05` | Jaslene Ocampo · Signature Spotlight | `…/01-volleyball-card/src/VB-SS-card-FRONT.png` (750×1050, 09-01) ≡ `VB-SS-front.png` | `…/01-volleyball-card/src/VB-SS-card-BACK.png` (750×1050, 09-01) | `card-flip/assets/volleyball-ss/*` (09-03) | `GDE_VBLIGHT_CardFlip_1080x1350.mp4` (09-03, light) — re-render dark | M | `04-complete-set/src/volleyball-card-back-SS.png` (09-03) second back. |

### 5.1 Needs generation / export / render — explicit list

**Five public `demo-etsy` records cannot render art from anything on disk.** None of them may go `private` by default: the four softball / wrestling IDs are printed (with their QR codes) on the live Etsy listing images (`etsy/LISTING-STATE.md:2519`), Nia's ID is on the Nia-era print masters and the earliest slides, and the F1 exit criterion is "scan any card → the exact card, flip, stats, edition, date" (spec §11 F1). Until the files exist all five ship as **`ART_PENDING`** (CONTRACTS §4.10, the list is the same five entries): `/c` renders the identity header, edition panel, stats, share, CTA and footer normally and, in place of the flip hero, the COPY §2.15 (2b) pending block — "This edition's card art is being prepared — the registration below is live." Nobody in Wave 0–1 has Figma, so the registry-card builder cannot close these; the **owner / Figma agent closes ticket F1-ART-01 before Wave 2**, and the integrator runs `cards:assets`.

| cardId | State on disk (verified) | What unblocks it | Ticket |
|---|---|---|---|
| `GDE-CA-SFB-2026-03` | no CA softball face; depicted only under the callouts of `01-softball-card/02-front-back.png` | Figma export — softball file, Chrome All-Star page | F1-ART-01 |
| `GDE-SN-SFB-2026-03` | only `marketing/cards/softball-front\|back.png` (900×1260, 08-29, pre-square-corner, viewed) | Figma **re-export** — softball file, Stadium Night page. The 12 px keyline crop is **not** acceptable on `/c` (the digital twin must be the exact card); the crop stays an option for the 17-sport row only (§7 Q4) | F1-ART-01 |
| `GDE-FS-WRS-2026-01` | no FS wrestling face (`marketing/cards/wrestling-front.png` is Stadium Night, viewed) | Figma export — wrestling file, Fire & Smoke page | F1-ART-01 |
| `GDE-HE-WRS-2026-01` | no HE wrestling face (only the poster `02-wrestling-poster/src/WR-HE-poster.png`) | Figma export — wrestling file, Heritage page | F1-ART-01 |
| `GDE-SN-BKB-2026-23` | only Nia-era art (pre-square-corner, swoosh; §2.5, §5.2) — denylisted | art-pipeline regeneration with audit (spec §11 F1) **or** the owner sets the record `private`; the QR must resolve either way | F1-ART-02 |

**Ticket F1-ART-01 — Figma export of four card faces (owner / Figma agent; due before Wave 2; ~30 min).**
Source files (`docs/FIGMA-FILES.md`): softball **`OlFb7Clx6QqWIum6xdaG3p`**, wrestling **`fbQprOeTHrnzDGnUi1PzWH`**. The hero `card FRONT` / `card BACK` frames are 750×1050 native (the print card is `rescale(744/750)` of them — `docs/FINISH-COMPLETION-PLAYBOOK.md`). Node IDs are identical across sport files but **each finish is its own page**: `await figma.setCurrentPageAsync(page)` first — a `null` node means wrong page, not missing node — and let the page's pinned `Style` mode (`VariableCollectionId:141:3`) render the finish strings; never type them as literals.

| Export | File | Page | FRONT node | BACK node | 1× (750×1050) → | 2× (1500×2100) → |
|---|---|---|---|---|---|---|
| CA softball | softball | Chrome All-Star | `190:136` | `102:85` | `etsy/listing-images/01-softball-card/src/SF-CA-card-FRONT.png`, `SF-CA-card-BACK.png` | `card-flip/assets/softball-ca/card-front.png`, `card-back.png` |
| SN softball | softball | Stadium Night (`0:1`) | `40:2` | `49:2` | `…/01-softball-card/src/SF-SN-card-FRONT.png`, `SF-SN-card-BACK.png` | `card-flip/assets/softball-sn/card-front.png`, `card-back.png` |
| FS wrestling | wrestling | Fire & Smoke | `190:204` | `166:71` | `…/01-wrestling-card/src/WR-FS-card-FRONT.png`, `WR-FS-card-BACK.png` | `card-flip/assets/wrestling-fs/card-front.png`, `card-back.png` |
| HE wrestling | wrestling | Heritage | `190:291` | `166:180` | `…/01-wrestling-card/src/WR-HE-card-FRONT.png`, `WR-HE-card-BACK.png` | `card-flip/assets/wrestling-he/card-front.png`, `card-back.png` |

Recipe: `download_assets` PNG at scale 1 and scale 2 on each node (or `get_screenshot` at native size and at 2×); `sips` must report exactly 750×1050 / 1500×2100 — never resample. **Before** exporting, check on each BACK frame that the card-ID text equals the registry ID and the QR layer is the registry QR (`public/cards/qr/<cardId>.png`; the live slide `02-front-back.png` was built from the same frame, so a mismatch there is a mismatch on Etsy) and that `CLASS OF` reads **2029** (Brooke) / **2027** (Dawson) — `etsy/LISTING-STATE.md:2588` records the earlier mismatch. Acceptance per file: exact dimensions; four opaque corner pixels (the §5.3 rule — square-cut in both directions); FRONT depicts the record's athlete in that finish; BACK prints the ID; no "10"/count text anywhere; `npm run cards:assets -- --id <cardId>` exits 0. Close-out, in one commit: append the eight rows of §6.3(b) to §6.3, add the four `DEMO_ART_SOURCES` entries (CONTRACTS §4.10 pre-declares them), **delete the four IDs from `ART_PENDING`** (the test "a pending ID has no `public/cards/<id>/front.webp`" fails otherwise), commit the generated `public/cards/<id>/*`, and optionally render the dark flips — `STYLE=SFBCA FLIP_ASSETS=assets/softball-ca FLIP_BG=8,12,18,255 card-flip/render.sh`, likewise `SFBSN`, `WRSFS`, `WRSHE` (naming follows `GDE_SFBSR_*`). If the ticket is still open when Wave 2 starts, the integrator ships the pending state and records the four IDs in `docs/f1/INTEGRATION-NOTES.md` as an F1-exit exception for the owner to sign.

**Ticket F1-ART-02 — `GDE-SN-BKB-2026-23` (Nia Brooks, Stadium Night; owner decision, §7 #2).** Either regenerate through the art pipeline with the full audit (crest → identity plate → poses → cutout → judge, `art-pipeline/README.md`), rebuild the SN card from the audited cutout with the per-order page workflow (`docs/GAME-DAY-EDITION.md`) and export FRONT/BACK exactly as in F1-ART-01 (`card-flip/assets/basketball-sn-nia/`, `etsy/listing-images/01-basketball-card/src/BK-SN-nia-card-FRONT|BACK.png`), or set `visibility: "private"` on the record (COPY §2.15 (8) neutral body — no name, no art; the QR still resolves). Until decided the record is `ART_PENDING` and public.

* **Flip renders missing (dark bg):** `GDE-SR-BKB-2026-12`, `GDE-HE-FTB-2026-54`, `GDE-SS-CHR-2026-01`, `GDE-SN-SFB-2026-03`, `GDE-CA-SFB-2026-03`, `GDE-FS-WRS-2026-01`, `GDE-HE-WRS-2026-01`. Light-only renders to re-render dark: FTB FS, CHR PR, BSB HE, SOC CA, VBL SS. Flip is optional on `/c` (CSS-3D flip is primary; MP4 is the fallback) — none of these block the page.
* **Real customers (own unlisted page only, `--allow-orders`, §5.4):** `GDE-SS-TEN-2026-12` — sources ready (2× faces square, measured); only the flip MP4 background is VERIFY. `GDE-SN-BKB-2026-51` — **needs a square-cut re-export** (card FRONT/BACK @2× from Figma `iLHCW0lDPPYW5BNpriGL8r`) + a dark flip re-render; the 08-26 faces fail the corner audit. Neither is in `ART_REQUIRED` (tests never demand customer art); both are excluded from §6.3.

### 5.2 `print-sources/output/<finish>/` verdict

All 816×1110 masters depict **Nia Brooks #23, Northside Wolves** (a registry athlete, but the record is the one flagged for regeneration) with rounded corners and a swoosh; they do not depict any other registry athlete. **Not mapped.** The `tgc/` 825×1125 pair is the same art.

### 5.3 Corner-alpha audit (proof of square-cut where it matters)

Opaque corner + dated ≥ 09-01 (square by construction, post-round): every `*-front.png` / `*-card-FRONT|BACK.png` for BK, BB, CH-PR, FB-FS, FB-HE-front, SC-CA, VB-SS (09-01); all `*-sr-*` faces (09-04/05); `card-flip/assets/{baseball-he,soccer-ca,volleyball-ss}` (09-03) and `{football-sr,soccer-sr,baseball-sr,cheer-sr,softball-sr,wrestling-sr,volleyball-sr}` (09-05). Opaque corner but dated 08-25…08-28 (VERIFY by zooming): `FB-{CA,HE,PR,SN,SS}-card-FRONT|BACK.png`, `CH-{CA,FS,HE,SN,SS}-card-*`, `CH-SS-card-BACK.png`, `card-flip/assets/{marcus-sn,football-fs,cheer-pr}`, `04-complete-set/src/*` (08-25/27/28), `03-senior-night/src/{ftb-fs,chr-ss}-*`. Transparent corner (rounded, Nia era, NO): `card-flip/assets/{fs,he,pr,ss}/*`. No alpha, white ground, rounded (viewed): `marketing/cards/*`. Rounded on white ground, RGBA (measured, four corners white): `card-flip/assets/order03-sn/*` (08-26). Square, opaque ink at all four corners (measured): `orders/4164205493/exports/_flip-src/*` and `…/01-print/*_card-{FRONT,BACK}_816x1110_300dpi.png` (09-05).

### 5.4 Real customers — which rule wins (reconciled with CONTRACTS §5.6, 2026-09-06)

**The conflict.** The first cut of this manifest said "map nothing; neutral placeholder art only (finish plate, no name)" for `GDE-SS-TEN-2026-12` and `GDE-SN-BKB-2026-51`. `docs/f1/CONTRACTS.md` §5.6 Notes says: art *may* come from `card-flip/assets/order03-sn/` and `orders/4164205493/**` **only for their own unlisted pages** and only with `--allow-orders` — never anywhere else on the site. The spec settles it: §4.13 (2) — the flip hero is the **exact** `public/cards/<cardId>/front.webp` + `back.webp`, generated once by `card:new`/`order:publish` from `orders/<id>/exports` or demo exports; §4.13 (5) — real customers get wallpapers from the order exports; §4.13 (8) — `unlisted` is a **full page** (noindex, not in the sitemap, OG without a name), while `private` is the state that renders the neutral "This card is registered with Game Day Edition" **without name or art**; §11 F1 exit criterion — "scanning any card → the exact card, flip, stats, edition, date; real customers unlisted + noindex". The card page is the product the customer paid for — the QR on the printed card back resolves to it, and `orders/4164205493/exports/README.txt` line 3 tells the customer so.

**Decision: the CONTRACTS rule wins.** The "placeholder plate" reading is withdrawn — it described `visibility: "private"`, which neither record has (`lib/registry/cards.ts:194`, `:212` — both `unlisted`, `channel: "etsy"`). Rules, in the order a builder meets them:

1. **Source gate.** `scripts/card-assets.ts` reads `orders/**` and `card-flip/assets/order03-sn/` **only with `--allow-orders`** (CONTRACTS §4.11). The general `scripts/assets-f1.ts` manifest in §6.3 **excludes** both records; their jobs live only in the gated manifest below, run by the `registry-card` builder on the owner's Mac (both sources are gitignored — `.gitignore:92 orders/`, `.gitignore:58 card-flip/assets/`). The denylist, 5:7, corner and MP4/GIF assertions of §6.2 / CONTRACTS §4.11 apply unchanged; `manifest.json` records `sourceSha256`.
2. **Destination = `public/cards/<cardId>/` only**, same file names and sizes as the fictional rows (§6.1). The path is exactly as secret as the card ID — which is what the printed QR carries and what the page URL already exposes; nothing on the site links to it. It is **never** mirrored or symlinked into `public/images/**` (no `images/products/trading-card-front-*`, no `images/sports/*`, no six-finishes tile), never a marketing page, pin, listing image, reel or `ASSETS-RENDERS` beat (the "real customer" **NO** of §0 rule 3 stays in force everywhere else). Note the ID scheme is enumerable (jersey number + sport + finish + season, spec §10), so "unguessable" holds only as far as the ID does — §7 Q15.
3. **Page rules that follow from `unlisted`** (CONTRACTS §5.6 / §6.2, COPY §2.15): `noindex, nofollow` + the explicit `X-Robots-Tag` rule; not in `app/sitemap.ts`; title/OG/description carry **no first or last name** (`tests/registry.test.ts`); OG image = front on arena, no name overlay; no `FictionalLabel`; no `ImageObject`/`VideoObject` JSON-LD (public `/c` only); no prices, no coupons, no link to the edition's owner; adult records show no "#" and no class year.
4. **Wallpapers are F2, not F1.** Spec §4.13 (5) and §10 storage put customer wallpapers in a **signed** bucket (`cards/<cardId>/wallpapers/*`, R2 — F2) and only once the order is `delivered`. **Nothing from `03-wallpapers/` goes under `public/`**; the DOWNLOADS block on both pages is omitted until F2. `GDE-SN-BKB-2026-51`'s SN wallpapers would in any case need the safe-zone pass first (§2.8).
5. **Consent scope.** Showing a customer *their own* card on the unlisted, noindex page they scanned is fulfilment, not publication — the spec's default for real customers (§4.13 (8)). Written consent (`consentPublicAt` + `consentSource`) is required only to go `public`; `marketingUseConsentAt` to appear anywhere else (COPY §1: "Real customers' editions never appear without written consent"). Neither record has either field → both stay unlisted, art on the page, nowhere else. **Owner confirmation is still required before the gated manifest runs** — that both customers' pages carry their art (§7 Q12).
6. **Git hygiene.** `card-flip/out/GDE_SN_Order03_CardFlip_1080x1350.mp4` and `_1080x1920.mp4` are the only customer files **tracked** in the repo (`git ls-files`); everything else customer-related is ignored. Flagged to the owner (§7 Q13); this manifest moves no files.

**Gated manifest — `docs/f1/assets-listing.orders.manifest.json`** (run only via `npm run cards:assets -- --allow-orders`; `kind` per §6.2; paths exact):

```json
[
  {"src":"orders/4164205493/exports/_flip-src/card-front.png","dst":"public/cards/GDE-SS-TEN-2026-12/front.webp","kind":"card","note":"real customer; unlisted page only; square-cut measured 09-05"},
  {"src":"orders/4164205493/exports/_flip-src/card-back.png","dst":"public/cards/GDE-SS-TEN-2026-12/back.webp","kind":"card","note":"real customer; unlisted page only"},
  {"src":"orders/4164205493/exports/05-video/GDE-SS-TEN-2026-12_card-flip_1080x1350.mp4","dst":"public/cards/GDE-SS-TEN-2026-12/flip-1080x1350.mp4","kind":"copy","note":"VERIFY background is arena-dark first (measured slate 55,80,98) — else re-render FLIP_BG=8,12,18,255 from _flip-src/ or omit"},
  {"src":"orders/4164205493/exports/05-video/GDE-SS-TEN-2026-12_card-flip_540.gif","dst":"public/cards/GDE-SS-TEN-2026-12/flip-540.gif","kind":"copy","note":"3.2 MB ≤ 4 MB; download link only"},

  {"src":"card-flip/assets/order03-sn/card-front.png","dst":"public/cards/GDE-SN-BKB-2026-51/front.webp","kind":"card","note":"BLOCKED until square-cut re-export from Figma iLHCW0lDPPYW5BNpriGL8r — current 08-26 file has white rounded corners and fails the corner audit"},
  {"src":"card-flip/assets/order03-sn/card-back.png","dst":"public/cards/GDE-SN-BKB-2026-51/back.webp","kind":"card","note":"BLOCKED — same"},
  {"src":"card-flip/out/GDE_SN_Order03_CardFlip_1080x1350.mp4","dst":"public/cards/GDE-SN-BKB-2026-51/flip-1080x1350.mp4","kind":"copy","note":"BLOCKED — re-render after the re-export (STYLE=SN FLIP_ASSETS=assets/order03-sn FLIP_BG=8,12,18,255)"},
  {"src":"card-flip/out/GDE_SN_Order03_CardFlip_540.gif","dst":"public/cards/GDE-SN-BKB-2026-51/flip-540.gif","kind":"copy","note":"BLOCKED — same; 3.3 MB"}
]
```

Cross-references: `docs/f1/ASSETS-RENDERS.md` §… rows for `GDE_SN_Order03_*` say "private `/c` page only" — read "private" there as *the customer's own unlisted page*; the registry state named `private` renders no art at all. CONTRACTS §9.1 lists `order03-sn/ → GDE-SN-BKB-2026-51 (real, unlisted only)` among the "square corners verified on two samples" set — the two samples were not this pair; the measurement above stands.

---

## 6. `public/` target layout, conversion settings, copy list

### 6.1 Layout

```
public/
  cards/<cardId>/front.webp            card face, 750×1050 native or 1080×1512 when a 2× source exists — never upscaled
  cards/<cardId>/back.webp
  cards/<cardId>/front@2x.webp         only when a 1500×2100 source exists (1500×2100 → served for retina flip)
  cards/<cardId>/flip-1080x1350.mp4    copied, dark-background render only
  cards/<cardId>/flip-540.gif          copied
  cards/qr/<cardId>.png                (exists)
  cards/GDE-SS-TEN-2026-12/ · cards/GDE-SN-BKB-2026-51/   real customers — written ONLY by the gated manifest in §5.4 (--allow-orders); never mirrored into images/**; no wallpapers here (F2 bucket)
  images/home/hero-before-<sport>.webp|avif          the "before" phone photo (art-pipeline/out/athletes/<slug>/before/photoN.png), LCP candidate
  images/home/hero-set-<sport>-<finish>.webp|avif    the after composite (built by the design agent from card+poster+tile layers; not a slide)
  images/products/trading-card-front-<sport>-<finish>.webp        (= cards/<id>/front.webp, but SEO-named; symlink or duplicate)
  images/products/trading-card-back-registered-<sport>-<finish>.webp
  images/products/trading-card-in-hand-<sport>.webp
  images/products/trading-card-four-shots-<sport>.webp
  images/products/six-finishes-one-athlete-<sport>.webp
  images/products/package-digital-card-files.webp · package-12-printed-cards.webp · package-24-printed-cards.webp
  images/products/poster-room-<finish>.webp                      room-<XX>.png (Marcus SN poster in six rooms)
  images/products/poster-on-wall-<sport>-<finish>.webp
  images/products/poster-two-sizes-to-scale.webp
  images/products/complete-set-printed.webp · complete-set-deluxe.webp · complete-set-ultimate.webp (ultimate only after §2.2 VERIFY)
  images/products/complete-set-everything-counted.webp
  images/senior-night/hero.webp|avif · hero-<sport>.webp
  images/senior-night/card-front-<sport>.webp (9 tiles; basketball + 7 SN sports + one more when built)
  images/senior-night/card-back-class-year-<sport>.webp
  images/senior-night/certificate-<sport>.webp · pack-panel-<sport>.webp · sticker-badge-<sport>.webp
  images/senior-night/gift-<sport>.webp · team-order.webp · whole-class.webp
  images/how-it-works/photo-check-rejected-group.webp · kit-plate-front-<sport>.webp · kit-plate-back-<sport>.webp · reference-plate-<sport>.webp · four-shots-<sport>.webp · rejected-take-<sport>.webp · approved-take-<sport>.webp · watermarked-proof-<sport>.webp
  images/photo-guide/good-front.webp · good-left.webp · good-right.webp · good-full-body.webp · bad-blurred.webp · bad-covered.webp · bad-distant.webp · bad-group.webp · crest-separate-file.webp
  images/sports/<slug>-card-front.webp   (replaces images/cards/<slug>.webp once square-cut re-exports exist)
  images/finishes/<CODE>.webp            (exists) + images/finishes/label-<CODE>.svg (pre-exported finish-name labels — Figma, out of this manifest's scope)
```

### 6.2 sharp settings (one script, one manifest)

* Input never upscaled: `resize({ width|height, fit:"inside", withoutEnlargement:true })`.
* Slides / scenes / rooms: long edge **1600** px, `webp({ quality: 82, effort: 5 })`. Hero LCP images additionally `avif({ quality: 55, effort: 4 })`.
* Card faces: **1080×1512** from 1500×2100 sources, otherwise 750×1050 as-is; `webp({ quality: 88, effort: 6, smartSubsample: true })` (text and QR on the back need the extra quality); keep aspect exactly 5:7; no rounding, no padding.
* Posters: long edge 1200 (product pages) — the 2:3 / 3:4 aspect is kept; rooms 1600.
* Everything: `.rotate()` (EXIF), `.withMetadata({})` stripped, sRGB, flatten transparent card faces onto `#080C12` (arena) only when the target is `/c`; keep alpha for cutouts.
* Filenames lower-case kebab; the manifest JSON is the only place paths are typed. Run the hash denylist from §2.1/§2.2 against every source before conversion (`md5 -q`), fail loudly on a hit.
* Post-conversion audit (`scripts/assets-audit.ts`): dimensions, aspect, denylist, "every `public/cards/<id>/` has front+back for every fictional record not in §5.1", corner check on card faces (pixel (1,1) must be card ink, not transparent/white). Real-customer dirs (§5.4) get the same checks but are never *required* (absence is not a failure); additionally, **no file under `public/images/**` may hash-match any file under `public/cards/GDE-SS-TEN-2026-12/` or `public/cards/GDE-SN-BKB-2026-51/`** — that is how "never referenced elsewhere" is made mechanical.

Script skeleton the asset-pipeline agent can run verbatim (`scripts/assets-f1.ts`, run with `npx tsx scripts/assets-f1.ts docs/f1/assets-listing.manifest.json`):

```ts
import sharp from "sharp"; import fs from "node:fs"; import path from "node:path"; import { createHash } from "node:crypto";
type Job = { src: string; dst: string; kind: "slide"|"card"|"poster"|"copy"; avif?: boolean; maxEdge?: number };
const DENY = new Set(fs.readFileSync("docs/f1/assets-denylist.md5", "utf8").split(/\s+/).filter(Boolean));
const jobs: Job[] = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
for (const j of jobs) {
  const md5 = createHash("md5").update(fs.readFileSync(j.src)).digest("hex");
  if (DENY.has(md5)) throw new Error(`denylisted source: ${j.src}`);
  fs.mkdirSync(path.dirname(j.dst), { recursive: true });
  if (j.kind === "copy") { fs.copyFileSync(j.src, j.dst); continue; }
  const edge = j.maxEdge ?? (j.kind === "card" ? 1512 : j.kind === "poster" ? 1200 : 1600);
  let img = sharp(j.src).rotate();
  img = j.kind === "card" ? img.resize({ height: edge, fit: "inside", withoutEnlargement: true })
                          : img.resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true });
  await img.clone().webp({ quality: j.kind === "card" ? 88 : 82, effort: 5, smartSubsample: true }).toFile(j.dst);
  if (j.avif) await img.clone().avif({ quality: 55, effort: 4 }).toFile(j.dst.replace(/\.webp$/, ".avif"));
}
```

### 6.3 Copy / convert list (F1 scope; `kind` per §6.2). Paths with spaces are exact. **Excludes the two real-customer records** — their jobs are only in the gated manifest in §5.4 (`--allow-orders`), never here.

```json
[
  {"src":"etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png","dst":"public/cards/GDE-SN-BKB-2026-12/front.webp","kind":"card"},
  {"src":"etsy/listing-images/01-basketball-card/src/BK-SN-card-BACK.png","dst":"public/cards/GDE-SN-BKB-2026-12/back.webp","kind":"card"},
  {"src":"card-flip/out/GDE_SN_CardFlip_1080x1350.mp4","dst":"public/cards/GDE-SN-BKB-2026-12/flip-1080x1350.mp4","kind":"copy"},
  {"src":"card-flip/out/GDE_SN_CardFlip_540.gif","dst":"public/cards/GDE-SN-BKB-2026-12/flip-540.gif","kind":"copy"},
  {"src":"etsy/listing-images/03-senior-night/src/sr-card-front.png","dst":"public/cards/GDE-SR-BKB-2026-12/front.webp","kind":"card"},
  {"src":"etsy/listing-images/03-senior-night/src/sr-card-back.png","dst":"public/cards/GDE-SR-BKB-2026-12/back.webp","kind":"card"},
  {"src":"card-flip/assets/football-sr/card-front.png","dst":"public/cards/GDE-SR-FTB-2026-54/front.webp","kind":"card"},
  {"src":"card-flip/assets/football-sr/card-back.png","dst":"public/cards/GDE-SR-FTB-2026-54/back.webp","kind":"card"},
  {"src":"card-flip/out/GDE_FTBSR_CardFlip_1080x1350.mp4","dst":"public/cards/GDE-SR-FTB-2026-54/flip-1080x1350.mp4","kind":"copy"},
  {"src":"card-flip/out/GDE_FTBSR_CardFlip_540.gif","dst":"public/cards/GDE-SR-FTB-2026-54/flip-540.gif","kind":"copy"},
  {"src":"card-flip/assets/volleyball-sr/card-front.png","dst":"public/cards/GDE-SR-VBL-2026-05/front.webp","kind":"card"},
  {"src":"card-flip/assets/volleyball-sr/card-back.png","dst":"public/cards/GDE-SR-VBL-2026-05/back.webp","kind":"card"},
  {"src":"card-flip/out/GDE_VBSR_CardFlip_1080x1350.mp4","dst":"public/cards/GDE-SR-VBL-2026-05/flip-1080x1350.mp4","kind":"copy"},
  {"src":"card-flip/out/GDE_VBSR_CardFlip_540.gif","dst":"public/cards/GDE-SR-VBL-2026-05/flip-540.gif","kind":"copy"},
  {"src":"card-flip/assets/soccer-sr/card-front.png","dst":"public/cards/GDE-SR-SOC-2026-10/front.webp","kind":"card"},
  {"src":"card-flip/assets/soccer-sr/card-back.png","dst":"public/cards/GDE-SR-SOC-2026-10/back.webp","kind":"card"},
  {"src":"card-flip/out/GDE_SOCSR_CardFlip_1080x1350.mp4","dst":"public/cards/GDE-SR-SOC-2026-10/flip-1080x1350.mp4","kind":"copy"},
  {"src":"card-flip/out/GDE_SOCSR_CardFlip_540.gif","dst":"public/cards/GDE-SR-SOC-2026-10/flip-540.gif","kind":"copy"},
  {"src":"card-flip/assets/baseball-sr/card-front.png","dst":"public/cards/GDE-SR-BSB-2026-07/front.webp","kind":"card"},
  {"src":"card-flip/assets/baseball-sr/card-back.png","dst":"public/cards/GDE-SR-BSB-2026-07/back.webp","kind":"card"},
  {"src":"card-flip/out/GDE_BSBSR_CardFlip_1080x1350.mp4","dst":"public/cards/GDE-SR-BSB-2026-07/flip-1080x1350.mp4","kind":"copy"},
  {"src":"card-flip/out/GDE_BSBSR_CardFlip_540.gif","dst":"public/cards/GDE-SR-BSB-2026-07/flip-540.gif","kind":"copy"},
  {"src":"card-flip/assets/softball-sr/card-front.png","dst":"public/cards/GDE-SR-SFB-2026-03/front.webp","kind":"card"},
  {"src":"card-flip/assets/softball-sr/card-back.png","dst":"public/cards/GDE-SR-SFB-2026-03/back.webp","kind":"card"},
  {"src":"card-flip/out/GDE_SFBSR_CardFlip_1080x1350.mp4","dst":"public/cards/GDE-SR-SFB-2026-03/flip-1080x1350.mp4","kind":"copy"},
  {"src":"card-flip/out/GDE_SFBSR_CardFlip_540.gif","dst":"public/cards/GDE-SR-SFB-2026-03/flip-540.gif","kind":"copy"},
  {"src":"card-flip/assets/wrestling-sr/card-front.png","dst":"public/cards/GDE-SR-WRS-2026-01/front.webp","kind":"card"},
  {"src":"card-flip/assets/wrestling-sr/card-back.png","dst":"public/cards/GDE-SR-WRS-2026-01/back.webp","kind":"card"},
  {"src":"card-flip/out/GDE_WRSSR_CardFlip_1080x1350.mp4","dst":"public/cards/GDE-SR-WRS-2026-01/flip-1080x1350.mp4","kind":"copy"},
  {"src":"card-flip/out/GDE_WRSSR_CardFlip_540.gif","dst":"public/cards/GDE-SR-WRS-2026-01/flip-540.gif","kind":"copy"},
  {"src":"card-flip/assets/cheer-sr/card-front.png","dst":"public/cards/GDE-SR-CHR-2026-01/front.webp","kind":"card"},
  {"src":"card-flip/assets/cheer-sr/card-back.png","dst":"public/cards/GDE-SR-CHR-2026-01/back.webp","kind":"card"},
  {"src":"card-flip/out/GDE_CHRSR_CardFlip_1080x1350.mp4","dst":"public/cards/GDE-SR-CHR-2026-01/flip-1080x1350.mp4","kind":"copy"},
  {"src":"card-flip/out/GDE_CHRSR_CardFlip_540.gif","dst":"public/cards/GDE-SR-CHR-2026-01/flip-540.gif","kind":"copy"},
  {"src":"etsy/listing-images/01-football-card/src/FB-FS-card-FRONT.png","dst":"public/cards/GDE-FS-FTB-2026-54/front.webp","kind":"card"},
  {"src":"etsy/listing-images/01-football-card/src/FB-FS-card-BACK.png","dst":"public/cards/GDE-FS-FTB-2026-54/back.webp","kind":"card"},
  {"src":"etsy/listing-images/01-football-card/src/FB-HE-front.png","dst":"public/cards/GDE-HE-FTB-2026-54/front.webp","kind":"card"},
  {"src":"etsy/listing-images/01-football-card/src/FB-HE-card-BACK.png","dst":"public/cards/GDE-HE-FTB-2026-54/back.webp","kind":"card"},
  {"src":"etsy/listing-images/01-cheerleading-card/src/CH-PR-card-FRONT.png","dst":"public/cards/GDE-PR-CHR-2026-01/front.webp","kind":"card"},
  {"src":"etsy/listing-images/01-cheerleading-card/src/CH-PR-card-BACK.png","dst":"public/cards/GDE-PR-CHR-2026-01/back.webp","kind":"card"},
  {"src":"etsy/listing-images/01-cheerleading-card/src/CH-SS-front.png","dst":"public/cards/GDE-SS-CHR-2026-01/front.webp","kind":"card"},
  {"src":"etsy/listing-images/01-cheerleading-card/src/CH-SS-card-BACK.png","dst":"public/cards/GDE-SS-CHR-2026-01/back.webp","kind":"card"},
  {"src":"card-flip/assets/baseball-he/card-front.png","dst":"public/cards/GDE-HE-BSB-2026-07/front.webp","kind":"card"},
  {"src":"card-flip/assets/baseball-he/card-back.png","dst":"public/cards/GDE-HE-BSB-2026-07/back.webp","kind":"card"},
  {"src":"card-flip/assets/soccer-ca/card-front.png","dst":"public/cards/GDE-CA-SOC-2026-10/front.webp","kind":"card"},
  {"src":"card-flip/assets/soccer-ca/card-back.png","dst":"public/cards/GDE-CA-SOC-2026-10/back.webp","kind":"card"},
  {"src":"card-flip/assets/volleyball-ss/card-front.png","dst":"public/cards/GDE-SS-VBL-2026-05/front.webp","kind":"card"},
  {"src":"card-flip/assets/volleyball-ss/card-back.png","dst":"public/cards/GDE-SS-VBL-2026-05/back.webp","kind":"card"},

  {"src":"art-pipeline/out/athletes/basketball/before/photo1.png","dst":"public/images/home/hero-before-basketball.webp","kind":"slide","avif":true,"maxEdge":1400},
  {"src":"etsy/listing-images/04-complete-set/v3/hero-plate-tunnel.jpg","dst":"public/images/home/hero-plate-tunnel.webp","kind":"slide","avif":true},
  {"src":"etsy/listing-images/04-complete-set/v3/tile-printed.jpg","dst":"public/images/products/complete-set-printed.webp","kind":"slide"},
  {"src":"etsy/listing-images/04-complete-set/v3/tile-deluxe.jpg","dst":"public/images/products/complete-set-deluxe.webp","kind":"slide"},
  {"src":"etsy/listing-images/02-basketball-poster/room-SN.png","dst":"public/images/products/poster-room-stadium-night.webp","kind":"slide"},
  {"src":"etsy/listing-images/02-basketball-poster/room-CA.png","dst":"public/images/products/poster-room-chrome-all-star.webp","kind":"slide"},
  {"src":"etsy/listing-images/02-basketball-poster/room-FS.png","dst":"public/images/products/poster-room-fire-and-smoke.webp","kind":"slide"},
  {"src":"etsy/listing-images/02-basketball-poster/room-HE.png","dst":"public/images/products/poster-room-heritage.webp","kind":"slide"},
  {"src":"etsy/listing-images/02-basketball-poster/room-SS.png","dst":"public/images/products/poster-room-signature-spotlight.webp","kind":"slide"},
  {"src":"etsy/listing-images/02-basketball-poster/room-PR.png","dst":"public/images/products/poster-room-prism-rush.webp","kind":"slide"},
  {"src":"etsy/listing-images/02-basketball-poster/02-two-sizes-to-scale.png","dst":"public/images/products/poster-two-sizes-to-scale.webp","kind":"slide"},
  {"src":"etsy/listing-images/02-basketball-poster/03-room.png","dst":"public/images/products/poster-on-wall-basketball-stadium-night.webp","kind":"slide"},
  {"src":"etsy/listing-images/01-basketball-card/src/s03-athlete-holds-card.png","dst":"public/images/products/trading-card-in-hand-basketball.webp","kind":"slide"},
  {"src":"etsy/listing-images/01-football-card/src/s03-athlete-holds-card.png","dst":"public/images/products/trading-card-in-hand-football.webp","kind":"slide"},
  {"src":"etsy/listing-images/01-cheerleading-card/src/s03-athlete-holds-card.png","dst":"public/images/products/trading-card-in-hand-cheerleading.webp","kind":"slide"},
  {"src":"etsy/listing-images/01-baseball-card/src/s03-athlete-holds-card.png","dst":"public/images/products/trading-card-in-hand-baseball.webp","kind":"slide"},
  {"src":"etsy/listing-images/01-basketball-card/src/pkg-01-digital.png","dst":"public/images/products/package-digital-card-files.webp","kind":"slide","maxEdge":1200},
  {"src":"etsy/listing-images/01-basketball-card/src/pkg-02-12-cards.png","dst":"public/images/products/package-12-printed-cards.webp","kind":"slide","maxEdge":1200},
  {"src":"etsy/listing-images/01-basketball-card/src/pkg-03-24-cards.png","dst":"public/images/products/package-24-printed-cards.webp","kind":"slide","maxEdge":1200},
  {"src":"etsy/listing-images/01-basketball-card/src/BK-SN-front.png","dst":"public/images/products/six-finishes/basketball-stadium-night.webp","kind":"card"},
  {"src":"etsy/listing-images/01-basketball-card/src/BK-CA-front.png","dst":"public/images/products/six-finishes/basketball-chrome-all-star.webp","kind":"card"},
  {"src":"etsy/listing-images/01-basketball-card/src/BK-FS-front.png","dst":"public/images/products/six-finishes/basketball-fire-and-smoke.webp","kind":"card"},
  {"src":"etsy/listing-images/01-basketball-card/src/BK-HE-front.png","dst":"public/images/products/six-finishes/basketball-heritage.webp","kind":"card"},
  {"src":"etsy/listing-images/01-basketball-card/src/BK-SS-front.png","dst":"public/images/products/six-finishes/basketball-signature-spotlight.webp","kind":"card"},
  {"src":"etsy/listing-images/01-basketball-card/src/BK-PR-front.png","dst":"public/images/products/six-finishes/basketball-prism-rush.webp","kind":"card"},
  {"src":"etsy/listing-images/03-senior-night/src/sr-card-front.png","dst":"public/images/products/six-finishes/basketball-senior-night.webp","kind":"card"},
  {"src":"etsy/listing-images/01-football-card/src/FB-{SN,CA,FS,HE,SS,PR}-front.png","dst":"public/images/products/six-finishes/football-<finish>.webp","kind":"card","note":"expand the brace: six jobs"},

  {"src":"Exportai Etsy/SN FULL/SN-01-HERO.jpg","dst":"public/images/senior-night/hero.webp","kind":"slide","avif":true},
  {"src":"Exportai Etsy/SN FULL/SN-03-EMOTION.jpg","dst":"public/images/senior-night/emotion.webp","kind":"slide"},
  {"src":"Exportai Etsy/SN FULL/SN-05-SPORTS.jpg","dst":"public/images/senior-night/nine-sports.webp","kind":"slide"},
  {"src":"Exportai Etsy/SN FULL/SN-18-SENIORS.jpg","dst":"public/images/senior-night/whole-class.webp","kind":"slide"},
  {"src":"Exportai Etsy/SN FULL/SN-19-EVERYTHING-COUNTED.jpg","dst":"public/images/senior-night/everything-counted.webp","kind":"slide"},
  {"src":"etsy/listing-images/03-senior-night/src/ftb-sr-back.png","dst":"public/images/senior-night/card-back-class-year-football.webp","kind":"card"},
  {"src":"etsy/listing-images/03-senior-night/src/bsb-sr-cert.png","dst":"public/images/senior-night/certificate-baseball.webp","kind":"slide","maxEdge":1200},
  {"src":"etsy/listing-images/03-senior-night/src/bsb-sr-pack-front-panel.png","dst":"public/images/senior-night/pack-panel-baseball.webp","kind":"slide","maxEdge":780},
  {"src":"etsy/listing-images/03-senior-night/src/bsb-sr-sticker.png","dst":"public/images/senior-night/sticker-baseball.webp","kind":"slide","maxEdge":1300},
  {"src":"etsy/listing-images/03-senior-night/src/bsb-sr-badge.png","dst":"public/images/senior-night/badge-baseball.webp","kind":"slide","maxEdge":800},
  {"src":"etsy/listing-images/03-senior-night/src/{sr-card,ftb-sr,vbl-sr,soc-sr,bsb-sr,sfb-sr,wrs-sr,chr-sr}-front.png","dst":"public/images/senior-night/card-front-{basketball,football,volleyball,soccer,baseball,softball,wrestling,cheerleading}.webp","kind":"card","note":"eight jobs (sr-card-front = basketball); the ninth SN sport tile is built when its SR art exists"},
  {"src":"art-pipeline/out/etsy-shots/senior-night/gift-football-composited.png","dst":"public/images/senior-night/gift-football.webp","kind":"slide"},
  {"src":"art-pipeline/out/etsy-shots/senior-night/team-order-staged-composited.png","dst":"public/images/senior-night/team-order.webp","kind":"slide"},
  {"src":"art-pipeline/out/etsy-shots/senior-night-{softball,wrestling,baseball,cheerleading,soccer,volleyball}/gift-<sport>-composited.png","dst":"public/images/senior-night/gift-<sport>.webp","kind":"slide","note":"six jobs"},

  {"src":"etsy/listing-images/01-football-card/src/s05-kit-front.png","dst":"public/images/how-it-works/kit-plate-front-football.webp","kind":"slide","maxEdge":1400},
  {"src":"etsy/listing-images/01-football-card/src/s05-kit-back.png","dst":"public/images/how-it-works/kit-plate-back-football.webp","kind":"slide","maxEdge":1400},
  {"src":"art-pipeline/out/athletes/football/_identity.png","dst":"public/images/how-it-works/reference-plate-football.webp","kind":"slide"},
  {"src":"etsy/listing-images/01-football-card/src/s06-pose-1.png","dst":"public/images/how-it-works/shot-1-football.webp","kind":"slide","maxEdge":1200},
  {"src":"etsy/listing-images/01-football-card/src/s06-pose-2.png","dst":"public/images/how-it-works/shot-2-football.webp","kind":"slide","maxEdge":1200},
  {"src":"etsy/listing-images/01-football-card/src/s06-pose-3.png","dst":"public/images/how-it-works/shot-3-football.webp","kind":"slide","maxEdge":1200},
  {"src":"etsy/listing-images/01-football-card/src/s06-pose-4.png","dst":"public/images/how-it-works/shot-4-football.webp","kind":"slide","maxEdge":1200},
  {"src":"etsy/listing-images/01-football-card/src/s06-reject.png","dst":"public/images/how-it-works/rejected-take-football.webp","kind":"slide","maxEdge":1200},
  {"src":"art-pipeline/out/etsy-shots/football/reject-take.png","dst":"public/images/how-it-works/rejected-take-football-full.webp","kind":"slide"},
  {"src":"etsy/listing-images/03-senior-night/src/bsb-sr-proof.png","dst":"public/images/how-it-works/watermarked-proof-baseball.webp","kind":"slide"},
  {"src":"etsy/listing-images/03-senior-night/src/ftb-sr-proof.png","dst":"public/images/how-it-works/watermarked-proof-football.webp","kind":"slide"},
  {"src":"etsy/listing-images/01-football-card/src/s13-crest.png","dst":"public/images/how-it-works/crest-applied-unchanged-football.webp","kind":"slide"},
  {"src":"art-pipeline/out/etsy-shots/football/bad-group.png","dst":"public/images/how-it-works/photo-check-rejected-group.webp","kind":"slide"},

  {"src":"etsy/listing-images/01-football-card/src/s12-good-0.png","dst":"public/images/photo-guide/good-front.webp","kind":"slide","maxEdge":800},
  {"src":"etsy/listing-images/01-football-card/src/s12-good-1.png","dst":"public/images/photo-guide/good-left.webp","kind":"slide","maxEdge":800},
  {"src":"etsy/listing-images/01-football-card/src/s12-good-2.png","dst":"public/images/photo-guide/good-right.webp","kind":"slide","maxEdge":800},
  {"src":"etsy/listing-images/01-football-card/src/s12-good-3.png","dst":"public/images/photo-guide/good-full-body.webp","kind":"slide","maxEdge":800},
  {"src":"art-pipeline/out/etsy-shots/football/bad-blurred.png","dst":"public/images/photo-guide/bad-blurred.webp","kind":"slide","maxEdge":1000},
  {"src":"art-pipeline/out/etsy-shots/football/bad-face-covered.png","dst":"public/images/photo-guide/bad-covered.webp","kind":"slide","maxEdge":1000},
  {"src":"art-pipeline/out/etsy-shots/football/bad-too-far.png","dst":"public/images/photo-guide/bad-distant.webp","kind":"slide","maxEdge":1000},
  {"src":"art-pipeline/out/etsy-shots/football/bad-group.png","dst":"public/images/photo-guide/bad-group.webp","kind":"slide","maxEdge":1000},
  {"src":"etsy/listing-images/01-football-card/src/s02-crest.png","dst":"public/images/photo-guide/crest-separate-file.webp","kind":"slide","maxEdge":378},

  {"src":"Exportai Etsy/Card basketball/05 · The kid on the card.jpg","dst":"public/images/products/slides/trading-card-kid-on-the-card-basketball.webp","kind":"slide"},
  {"src":"Exportai Etsy/Card basketball/06 · One athlete, six finishes.jpg","dst":"public/images/products/slides/six-finishes-one-athlete-basketball.webp","kind":"slide"},
  {"src":"Exportai Etsy/Card basketball/14 · One athlete, consistent in every shot.jpg","dst":"public/images/products/slides/four-shots-consistent-basketball.webp","kind":"slide"},
  {"src":"Exportai Etsy/Card basketball/17 · You approve it before it's final.jpg","dst":"public/images/products/slides/proof-before-print-basketball.webp","kind":"slide"},
  {"src":"Exportai Etsy/basketball poster/01 · HERO — the poster, up front.jpg","dst":"public/images/products/slides/poster-hero-basketball.webp","kind":"slide","avif":true},
  {"src":"Exportai Etsy/basketball poster/02 · Their season, their wall.jpg","dst":"public/images/products/slides/poster-their-wall-basketball.webp","kind":"slide"},
  {"src":"Exportai Etsy/basketball poster/04 · One athlete, six finishes.jpg","dst":"public/images/products/slides/poster-six-finishes-basketball.webp","kind":"slide"},
  {"src":"Exportai Etsy/Full complete all sports/03 · The card in hand. The poster on the wall..jpg","dst":"public/images/products/slides/complete-set-card-and-poster.webp","kind":"slide"},
  {"src":"Exportai Etsy/Full complete all sports/05 · Six sports. Six finishes..jpg","dst":"public/images/products/slides/complete-set-six-sports-six-finishes.webp","kind":"slide"}
]
```

**§6.3(b) — rows held back until ticket F1-ART-01 closes (§5.1).** Append them to the list above in the same commit as the exports; not before — `cards:assets` exits non-zero on a row whose source is missing, and a pending ID must have no `public/cards/<id>/` output while it is in `ART_PENDING`.

```json
[
  {"src":"card-flip/assets/softball-ca/card-front.png","dst":"public/cards/GDE-CA-SFB-2026-03/front.webp","kind":"card"},
  {"src":"card-flip/assets/softball-ca/card-back.png","dst":"public/cards/GDE-CA-SFB-2026-03/back.webp","kind":"card"},
  {"src":"card-flip/assets/softball-sn/card-front.png","dst":"public/cards/GDE-SN-SFB-2026-03/front.webp","kind":"card"},
  {"src":"card-flip/assets/softball-sn/card-back.png","dst":"public/cards/GDE-SN-SFB-2026-03/back.webp","kind":"card"},
  {"src":"card-flip/assets/wrestling-fs/card-front.png","dst":"public/cards/GDE-FS-WRS-2026-01/front.webp","kind":"card"},
  {"src":"card-flip/assets/wrestling-fs/card-back.png","dst":"public/cards/GDE-FS-WRS-2026-01/back.webp","kind":"card"},
  {"src":"card-flip/assets/wrestling-he/card-front.png","dst":"public/cards/GDE-HE-WRS-2026-01/front.webp","kind":"card"},
  {"src":"card-flip/assets/wrestling-he/card-back.png","dst":"public/cards/GDE-HE-WRS-2026-01/back.webp","kind":"card"}
]
```

Flip rows for these four follow the SR pattern (`card-flip/out/GDE_<SFBCA|SFBSN|WRSFS|WRSHE>_CardFlip_1080x1350.mp4` → `public/cards/<id>/flip-1080x1350.mp4`, `kind:"copy"`) only if the dark renders are made. `GDE-SN-BKB-2026-23` gets rows only after F1-ART-02 is decided.

Slides taken from tier A carry a baked "NN / 20" counter bottom-right and the GDE wordmark bottom-left; the design agent decides per section whether to crop the bottom ~8 % (`extract` before resize) or accept it. Entries marked VERIFY in §3 (`SN-02`, `SN-04`, `SN-08`, `SN-09`, `SN-16`, `19 · Everything you get — counted`, poster `03 · Three sizes`, `05 · Everything you get + the print`, `v3/tile-ultimate.jpg`) are deliberately **not** in the list until their check is done.

Denylist file to write next to the manifest (`docs/f1/assets-denylist.md5`): all hashes from §2.1 and §2.2, one per line.

---

## 7. Open questions and blockers

**Blockers (F1 cannot meet its exit criterion — "scan any card → the exact card, flip" — without them. The build is not blocked: the five IDs ship as `ART_PENDING` with the COPY §2.15 (2b) pending block until the files land, so every printed QR resolves from day one.)**
1. **Ticket F1-ART-01 — owner / Figma agent, due before Wave 2.** Four public demo cards have no card-face file on disk: `GDE-CA-SFB-2026-03`, `GDE-FS-WRS-2026-01`, `GDE-HE-WRS-2026-01` (Figma export from the softball / wrestling sport files, 1× + 2×) and `GDE-SN-SFB-2026-03` (square-cut re-export; the 12 px keyline crop is not an exact card and is not used on `/c`). Their QR codes are printed on the live softball / wrestling listing images (`etsy/LISTING-STATE.md:2519`). File keys, page/node IDs, target paths, the BACK-frame ID/QR/CLASS-OF check, acceptance and the close-out steps (delete from `ART_PENDING`, append §6.3(b), `cards:assets`, commit `public/cards/<id>/*`) are in §5.1. No Wave 0–1 builder has Figma; if the ticket is still open at Wave 2 the integrator ships the pending state and lists the four IDs in `docs/f1/INTEGRATION-NOTES.md` as an F1-exit exception for the owner to sign.
2. **Ticket F1-ART-02 — owner decision.** `GDE-SN-BKB-2026-23` (Nia Brooks) has only denylisted Nia-era art (pre-square-corner, swoosh) — regenerate with audit (spec §11 F1 says "Nia Brooks regenerated with audit") and export as in §5.1, or set the record `private` (COPY §2.15 (8) neutral body, not the pending block). The QR must resolve either way. Until decided it stays public and `ART_PENDING`.
3. All slide and layer sources are gitignored and live on the owner's iCloud Mac (`Exportai Etsy/`, `etsy/listing-images/`, `marketing/cards/`, `card-flip/assets/`); the conversion must run there, and the resulting `public/` files must be committed (they are the only copy CI will see).

**Open questions for the owner / design agent**
4. Should `public/images/cards/<slug>.webp` (F0, rounded-corner sources) stay live until the 17 square-cut sport fronts are re-exported, or be cropped inside the keyline now?
5. `sfb-sr-pack-front-panel.png` and `wrs-sr-pack-front-panel.png` are byte-identical — which sport's panel is it, and is the other one missing?
6. The five SR certificates not viewed (chr, ftb, soc, vlb, sr-certificate) and the football/basketball SR packs: confirm count-neutral fine print once before publishing.
7. The `03 · Three sizes, to scale` poster slide shows 30×40, which the site hides (D18): crop to two sizes, regenerate, or reuse `02-basketball-poster/02-two-sizes-to-scale.png` for all sports?
8. Do the `*LIGHT` flips get re-rendered dark for `/c` in F1 (cheap, `render.sh` with `FLIP_BG=8,12,18,255` from the existing 2× assets), or is the CSS flip enough with no MP4 fallback for those seven cards?
9. Volleyball SR: keep `vbl-sr-*` (09-05) or `vlb-sr-*` (09-04)? A pixel diff settles it.
10. SN wallpapers from the softball sport file (`02-softball-poster/src/SN-wallpaper-*`): safe zones present or not? Determines whether any SN wallpaper may appear in FAM(2)/`/c` previews.
11. Finish-name SVG labels (`public/images/finishes/label-<CODE>.svg`) and the brand SVGs are Figma exports outside this manifest — assign to the Figma agent.
12. **Real customers (§5.4) — owner confirmation required** that both `GDE-SS-TEN-2026-12` and `GDE-SN-BKB-2026-51` pages carry the customer's own art (front, back, flip) on their unlisted pages, per CONTRACTS §5.6 and spec §4.13 / F1 exit criterion. Also: the Order 03 square-cut re-export (card FRONT/BACK @2× from Figma `iLHCW0lDPPYW5BNpriGL8r`) is owner/Figma-agent work — until it lands, that page ships without the flip section, which is the CONTRACTS fallback, not a placeholder plate.
13. `card-flip/out/GDE_SN_Order03_CardFlip_1080x1350.mp4` and `_1080x1920.mp4` are tracked in git while every other customer file is ignored (`.gitignore:92`, `:58`). Owner to decide `git rm --cached` + an ignore rule (history would still hold them) — outside this manifest's scope.
14. Unlisted OG image = "front on arena, no name" (CONTRACTS §5.6, COPY §2.15) — but the card front itself prints the athlete's name and likeness. Acceptable for a link the customer shares themselves; if the owner wants unlisted previews name-free in every sense, the OG for real customers should be shield-only (as for `private`). Decide before `opengraph-image.tsx` is built.
15. "Unguessable path" (spec §4.13 (5)) is only as strong as the card ID: `public/cards/<cardId>/` and `/c/<cardId>` share the ID, and the ID scheme is enumerable (jersey number + sport + finish + season). Fine for F1 (noindex, no links, 2 records); if the owner wants real secrecy, CONTRACTS would have to add a per-record random asset segment — not a manifest decision.
16. `public/cards/<id>/` file names and sizes differ between CONTRACTS §4.10–4.11 (`front.webp`/`back.webp` at 900×1260, `flip.mp4`, `manifest.json`) and §6.1 here (750×1050 / 1080×1512, `front@2x.webp`, `flip-1080x1350.mp4`, `flip-540.gif`). The integrator settles one set; the real-customer rows (§5.4) follow whatever the fictional rows use.
