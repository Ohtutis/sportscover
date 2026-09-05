# Listing videos — storyboards for every listing type (2026-09-05)

Two videos per listing, 15 s each, muted, looping. Together they have to do what the twenty
photos do — **why us, why buy, what is different** — but in the two slots a buyer actually
watches. This document is the storyboard for all five listing types; the existing renders in
`etsy/listing-videos/` are ignored on purpose (owner: "ignore videos what we have").

**19 live listings, 5 types, 10 storyboards:**

| Type | Listings (Etsy ids) | Story video | Close video |
|---|---|---|---|
| A · Complete Set (any sport) | 4562711454 | A1 | A2 |
| B · Sport CARD ×6 | BKB 4562666649 · FTB 4563878038 · CHR 4564284709 · BSB 4567592965 · VBL 4567597109 · SOC 4567599879 | B1 | B2 |
| C · Sport POSTER ×6 | BKB 4562700100 · FTB 4564301710 · CHR 4564287163 · SOC 4568359117 · VBL 4568365063 · BSB 4568369175 | C1 | C2 |
| D · Senior Night Set (any sport) | 4564565764 | D1 | D2 |
| E · Senior Night Set ×5 sport-locked | FTB 4568844304 · VBL 4568846696 · CHR 4568849272 · SOC 4568841851 · BSB 4568844985 | E1 | E2 |

Per-sport listings share one storyboard and swap only the sport-specific assets (§6).

---

## 0 · What the two videos are for (read this before any beat)

**Video 1 — STORY: "why it is theirs".** Problem → their real photos → the build → the product.
Full-bleed real media. Emotion. It answers the parent's first question: *how does my kid's phone
photo become that?* It is the only place a listing can show *motion* — the flip, the reveal.

**Video 2 — CLOSE: "why it is safe to buy, and which package".** Likeness proof with the real
gate numbers, the packages as real objects, the certificate, the approval + refund promise. It
answers the second question: *is this a template shop or a maker, and what exactly arrives?*

The two never repeat a beat. Story never shows a price matrix; Close never re-tells the
transformation. Together they cover the listing's four blocks (WHAT/VALUE · CHOICE · TRUST ·
EXPANSION) — the same order the 20 photos use.

**The difference we sell, in the order buyers feel it:**
1. Built from THEIR photos — not a template, not a filter, not a face drop.
2. Likeness is measured, not claimed (the gate numbers, the rejected take).
3. Front + back, numbered, registered (cards) · print-ready and printed, free certificate (all).
4. You approve it before it's final — or every cent back.
5. Six finishes, seventeen sports; Senior Night is its own one-night edition.

## 1 · Rules every storyboard obeys

- **15 s hard cap; build to 14.0–14.6 s** so the owner never has to cut in CapCut.
- **Etsy is muted and mid-scroll**: every beat reads with no sound; every text line ≥1.2 s;
  type ≥44 px at 1080; captions over media are white Anton with a soft drop shadow (never an
  outline, never a plate); information beats use the listing chrome (light stock, orange
  brackets, watermark, eyebrow + Anton headline, Space Grotesk/Barlow support, pills).
- **First frame = thumbnail.** Etsy shows frame 1 with a play button. Open on the hook over a
  real photo or on the product — never a fade from black. Last frame designed to loop into it.
- **Claims must be true for every package the video can be attached to.** Physical tiers are
  live on all 19 listings, so no "instant download", no "delivered in 1–2 days". Use the live
  slide-11 chips verbatim: `DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7` (card/poster/set) and
  `FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS · SEALED PACK 3–4 WKS` (Senior Night).
  No sale %, no dates, US spelling. (`YOUR PROOF IN 24 HOURS` only if the owner confirms it is
  operationally true on every order — it is not in the live descriptions.)
- **Real over generated, in this order:** owner-shot footage → real product photos → the
  audited composites already on the listing → procedural animation on real photos. **Veo only
  for scenes with no athlete** (stands, hands, a phone); Tui Fa'agata (18) is the only athlete
  who may pass through image-to-video — every other athlete is a minor (§6). Every generated
  or composited frame goes through the judge (`etsy/video/trial/audit-frame.ts`).
- **Products are always the real art** — the card front/back, the poster, the certificate,
  the pack panel — never an athlete render standing in for a product.
- **The brand mark is silver, the wordmark is a file** (`etsy/video/trial/gde-wordmark.png`).
  End card: navy stock, silver shield, wordmark, one tagline, 0.2 s fade for the loop seam.
- **Card video says CARD, poster video says POSTER, set video says SET.** A poster listing
  never shows trading cards as its product (it may show them only inside the set cross-sell).

## 2 · Shared beat library (built once, cast per sport)

| Beat | What it is | Source | Real? |
|---|---|---|---|
| HOOK | The problem line over their real game photo, slow push + handheld drift, freeze + shutter flash | `athletes/<slug>/before/photo2` (in kit) or owner clip | real photo / real footage |
| ROLL | Phone in hands scrolling a camera roll — their 4 photos + 2 scenery crops, ticks appear | `phone-gallery-still.png` + measured quad (the working method; the Veo screen was unusable) | real hands, real photos |
| PACKS | Ticked photos collapse into a stack → IDENTITY PACK → KIT PACK (`Packs` in `render_sport_card.py`) | `_identity.png`, `_kit.png` | real pipeline output |
| FLIP | The card turns front → back on light stock | `card-flip/render.sh` per sport/finish | real art |
| FAN | Five finishes fan out, lead finish centre and largest, `PICK THEIR FINISH.` | per-sport Figma pulls | real art |
| REVEAL | Poster scales up from 85 % with a shadow, eyebrow = finish name, `THE POSTER.` | poster art | real art |
| ROOM | The print hung in a real-looking room (framed, mat per listing) | `packages/hero05-<sport>.png` / `p-room-*` / SR `poster-on-wall` | audited composite |
| PAIRS | `WILL IT LOOK LIKE THEM?` — real photo → product, `FACE MATCH 0.xx` chip, own sport first | `before/photo4` + art + `_identity-gate.json` | real numbers |
| MEASURED | Five score chips incl. the real rejected take `0.287 · REBUILT` | gate JSONs | real numbers |
| PROOF | `PROOF` watermark tile → `APPROVED` stamp; `NOT RIGHT? WE REVISE IT — OR REFUND EVERY CENT` | proof export | real artefact |
| OBJECTS | The package as objects: screen (digital) · fan of 12 + tube · 24 spread + 24×36 · sealed foil pack | `packages/_<sport>/{digital,twelve,two4,pack}.png`, SR `set-{printed,deluxe,ultimate}-real.png` | audited composites → **replace with real unboxing footage when the first prints arrive** |
| COUNTED | `EVERYTHING YOU GET.` tiles, every file contained on a white plate, count pill | listing slide 19 elements | real art |
| END | Navy + silver shield + wordmark + tagline | `gde-shield-4x.png`, `gde-wordmark.png` | — |

---

## 3 · TYPE A — Complete Set (any sport)  ·  `GDE-etsy-04-set-*`

Hero listing. Range (four sports on the hero) + the whole menu. Football leads the objects
(continues the live hero), basketball carries the process.

### A1 · STORY — "THE WALL. THE CARDS. THE WHOLE SEASON."  (14.4 s)

| # | Time | We see | Text | Job |
|---|---|---|---|---|
| 1 | 0.0–2.4 | HOOK: real game photo, push + drift, freeze, white flash | `DON'T LET THEIR SEASON STAY ON YOUR PHONE.` | problem first |
| 2 | 2.4–4.4 | ROLL: phone in hands, their photos ticked | `SEND US 4–10 REAL PHOTOS.` | the ask is tiny |
| 3 | 4.4–7.0 | PACKS: photos fall into a stack → IDENTITY PACK → KIT PACK (chrome) | `REBUILT FROM SCRATCH.` | not a template |
| 4 | 7.0–9.6 | The set assembles on chrome: poster lands, card front + back slide in, certificate, phone with wallpaper | `ONE ATHLETE. ONE EDITION.` + pill `POSTER · CARDS · CERTIFICATE · 28 FILES` | what a set is |
| 5 | 9.6–11.8 | Real scene: the card in hand, the poster on the wall (live slide 03 scene, slow push) | `THE CARD IN HAND. THE POSTER ON THE WALL.` | emotion, product in life |
| 6 | 11.8–13.0 | Four sports plate (hero tunnel) — four athletes' posters cascade | `ANY SPORT. ANY AGE.` | range |
| 7 | 13.0–14.4 | END | `THE WALL. THE CARDS. THE WHOLE SEASON.` | brand |

### A2 · CLOSE — "WHICH SET IS YOURS?"  (14.4 s)

| # | Time | We see | Text | Job |
|---|---|---|---|---|
| 1 | 0.0–2.4 | PAIRS big: football photo → Heritage poster + card, `FACE MATCH 0.84` | `WILL IT LOOK LIKE THEM?` | the fear, answered with a number |
| 2 | 2.4–4.4 | PAIRS fast ×3: basketball · cheer · baseball (real scores) | eyebrow `THE ONE THING THAT MATTERS` | consistency across sports |
| 3 | 4.4–6.2 | MEASURED chips incl. the rejected take | `MEASURED, NOT CLAIMED.` | the rejected take is the proof |
| 4 | 6.2–9.4 | OBJECTS ×4, one per 0.8 s: screen → 12 cards + 18×24 tube → 24 cards + 24×36 → sealed foil pack | `FOUR WAYS TO OWN IT.` labels `DIGITAL · PRINTED · DELUXE · ULTIMATE` | the menu as things, no prices |
| 5 | 9.4–10.8 | Certificate tile slides under the objects | `FREE PRINTED CERTIFICATE WITH EVERY SHIPPED SET` | the free thing |
| 6 | 10.8–12.4 | PROOF → APPROVED | `YOU APPROVE IT BEFORE IT'S FINAL.` / `NOT RIGHT? WE REVISE IT — OR REFUND EVERY CENT` | risk = zero |
| 7 | 12.4–13.6 | Chip: `DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7` + `FREE US SHIPPING` | | timing, true for every tier |
| 8 | 13.6–14.4 | END | `28 FILES + 1 LIVE REGISTRY PAGE.` | count |

---

## 4 · TYPE B — Sport CARD (six listings)  ·  `GDE-etsy-NN-<code>-card-*`

Sport-locked: one athlete, that sport's lead finish, that sport's cast in the close.

### B1 · STORY — "THEIR PHOTOS. THEIR CARD."  (14.2 s)

| # | Time | We see | Text | Job |
|---|---|---|---|---|
| 1 | 0.0–2.4 | HOOK on their real game photo (or the owner's B1 clip where one exists) | `YOUR CAMERA ROLL IS FULL OF THESE.` | recognition |
| 2 | 2.4–4.4 | ROLL, ticks | `SEND US 4–10 REAL PHOTOS.` | the ask |
| 3 | 4.4–7.2 | PACKS → identity → kit | `REBUILT FROM SCRATCH.` | not a template |
| 4 | 7.2–9.8 | FLIP: the lead-finish card turns front → back (stats, QR) | `FRONT + BACK. NUMBERED. REGISTERED.` (caption lands as the back settles) | the card is two-sided and one of one |
| 5 | 9.8–11.6 | FAN: five finishes, lead centre | `PICK THEIR FINISH.` | choice |
| 6 | 11.6–12.8 | Real scene: the kid holding the card (live slide 05, slow push) | `THEIR FACE. THEIR NAME. THEIR CARD.` | emotion |
| 7 | 12.8–14.2 | END | `THEIR PHOTOS. THEIR CARD.` | brand |

### B2 · CLOSE — "FOUR WAYS TO OWN IT."  (14.0 s)

| # | Time | We see | Text | Job |
|---|---|---|---|---|
| 1 | 0.0–2.4 | PAIRS big: this sport's photo → card, real score | `WILL IT LOOK LIKE THEM?` | fear → number |
| 2 | 2.4–4.4 | PAIRS ×3 other sports the buyer recognises | | consistency |
| 3 | 4.4–6.0 | MEASURED + rejected take | `MEASURED, NOT CLAIMED.` | proof |
| 4 | 6.0–7.6 | PROOF → APPROVED | `YOU APPROVE IT BEFORE IT'S FINAL.` | risk |
| 5 | 7.6–10.8 | OBJECTS ×4: files on screen → 12 cards fanned → 24 cards (double deck) → sealed foil pack | `FOUR WAYS TO OWN IT.` labels `DIGITAL · 12 PRINTED · 24 PRINTED · SEALED FOIL PACK` | the menu |
| 6 | 10.8–12.0 | Certificate + registry phone (real QR page) | `FREE CERTIFICATE · LIVE REGISTRY PAGE` | provenance |
| 7 | 12.0–13.0 | Chip `DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7` | | timing |
| 8 | 13.0–14.0 | END | `THEIR PHOTOS. THEIR CARD.` | brand |

---

## 5 · TYPE C — Sport POSTER (six listings)  ·  `GDE-etsy-NN-<code>-poster-*`

The poster is art with minimal text; the video sells the WALL. Never shows a trading card.

### C1 · STORY — "THEIR SEASON. THEIR WALL."  (14.2 s)

| # | Time | We see | Text | Job |
|---|---|---|---|---|
| 1 | 0.0–2.4 | HOOK on their real game photo | `THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.` | premium version of the loss |
| 2 | 2.4–4.4 | ROLL, ticks | `SEND US 4–10 REAL PHOTOS.` | the ask |
| 3 | 4.4–7.0 | PACKS → identity → kit | `REBUILT FROM SCRATCH.` | not a template |
| 4 | 7.0–9.4 | REVEAL: the lead-finish poster scales up on chrome; three pose markers pulse ① ② ③ | eyebrow = finish · `THE POSTER.` · `3 SHOTS OF YOUR ATHLETE, ONE POSTER` | the work inside it |
| 5 | 9.4–11.8 | ROOM: the framed print in this sport's room (real-looking scene, slow push) — owner's poster-zoom clip where it exists | `THEIR SEASON. THEIR WALL.` | product in life |
| 6 | 11.8–12.8 | FAN of six posters (rooms per finish, 0.16 s cuts) | `SIX FINISHES.` | choice |
| 7 | 12.8–14.2 | END | `THEIR PHOTOS. THEIR POSTER.` | brand |

### C2 · CLOSE — "THREE SIZES, TO SCALE."  (14.2 s)

| # | Time | We see | Text | Job |
|---|---|---|---|---|
| 1 | 0.0–2.4 | PAIRS big: photo → poster, real score | `WILL IT LOOK LIKE THEM?` | fear → number |
| 2 | 2.4–4.0 | MEASURED + rejected take | `MEASURED, NOT CLAIMED.` | proof |
| 3 | 4.0–7.4 | SIZES: three rooms where the furniture is the ruler — desk / headboard / sofa — the print grows 18×24 → 24×36 → 30×40 at one px-per-inch | `THREE SIZES, TO SCALE.` pills `18×24 · 24×36 · 30×40 XL` | which size, honestly |
| 4 | 7.4–9.0 | The print rolled beside the tube, certificate under the corner (flat, never curled) | `ENHANCED MATTE 189 g/m² · ROLLED IN A TUBE` | print facts |
| 5 | 9.0–10.6 | Phone + monitor: wallpapers and a social post from the same artwork | `WALLPAPERS + SOCIAL, INCLUDED.` | the digital extras |
| 6 | 10.6–12.0 | PROOF → APPROVED | `YOU APPROVE IT BEFORE IT'S FINAL.` | risk |
| 7 | 12.0–13.0 | Chip `DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7 · FREE US SHIPPING` | | timing |
| 8 | 13.0–14.2 | END | `THEIR PHOTOS. THEIR POSTER.` | brand |

---

## 6 · TYPE D — Senior Night Set (any sport)  ·  `GDE-etsy-12-sn-set-*`

A different buyer and a different clock: the night has a date, the edition is one-of-one, the
card back is a career. Gold, not orange, inside the media; chrome stays the shop chrome.

### D1 · STORY — "ONE LAST HOME GAME."  (14.6 s)

| # | Time | We see | Text | Job |
|---|---|---|---|---|
| 1 | 0.0–2.6 | Real-looking scene: the senior with parents on the field, holding the framed poster (live slide 03, slow push, confetti drift) | `ONE LAST HOME GAME.` | the moment |
| 2 | 2.6–4.4 | ROLL: four years of photos ticked (FR → SR) | `FOUR YEARS ON A PHONE.` | the loss |
| 3 | 4.4–6.8 | PACKS → identity → kit | `BUILT AROUND THEIR REAL LOOK.` | not a template |
| 4 | 6.8–9.4 | SR poster reveal: gold light, `CLASS OF 2026` lockup pulses once | `THE SENIOR NIGHT EDITION.` | the product |
| 5 | 9.4–11.8 | SR FLIP: card front → back; the back holds — career line `FR · SO · JR · SR`, the senior quote in italic, `SENIOR EDITION · 1 OF 1` stamp | `THEIR CAREER ON THE BACK. THEIR WORDS.` | depth of personalisation |
| 6 | 11.8–13.2 | Four seniors, four sports, one gold edition (live slide 18 scene) | `ANY SPORT. ONE EDITION.` | range |
| 7 | 13.2–14.6 | END | `MAKE IT LAST LONGER.` | brand |

### D2 · CLOSE — "SENIOR NIGHT HAS A DATE."  (14.4 s)

| # | Time | We see | Text | Job |
|---|---|---|---|---|
| 1 | 0.0–2.2 | Calendar-style chip animates: `FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS · SEALED PACK 3–4 WKS` over the field scene | `SENIOR NIGHT HAS A DATE. WE WORK TO IT.` | urgency that is true |
| 2 | 2.2–5.4 | OBJECTS ×4 (SR): files on screen → printed set (12 cards + 18×24 + cert) → deluxe (24 + 24×36) → ultimate + sealed gold pack | `FOUR WAYS TO OWN IT.` | the menu |
| 3 | 5.4–7.0 | The card in a case + the numbered certificate + registry phone | `NUMBERED. REGISTERED. 1 OF 1.` | provenance |
| 4 | 7.0–9.0 | PAIRS: real photo → SR poster + card, score; then MEASURED | `WILL IT LOOK LIKE THEM?` → `MEASURED, NOT CLAIMED.` | fear → number |
| 5 | 9.0–10.6 | PROOF → APPROVED | `YOU APPROVE IT BEFORE IT'S FINAL — OR EVERY CENT BACK.` | risk |
| 6 | 10.6–12.4 | Team order: a row of sets, one per senior (live slide 05 scene) | `ONE SET PER SENIOR. SEND THE ROSTER.` | the bigger order |
| 7 | 12.4–13.4 | COUNTED pill | `28 FILES IN EVERY PACKAGE · PRINTED SETS SHIP FREE` | count |
| 8 | 13.4–14.4 | END | `ONE LAST HOME GAME. MAKE IT LAST LONGER.` | brand |

---

## 7 · TYPE E — Senior Night Set, sport-locked (five listings)  ·  `GDE-etsy-13-sn-<code>-*`

Same two storyboards as D with four swaps, nothing else:

| Swap | Any-sport (D) | Sport-locked (E) |
|---|---|---|
| Scene 1 / gift | football field handover (master) | that sport's own handover scene (`gift-<sport>-composited.png`) |
| SR art | football leads, others in the range beat | only that sport's SR poster / front / back / cert / pack panel |
| Career line on the back | football wording | the sport's own: kills/digs (VBL), stunts/titles (CHR), goals/assists (SOC), avg/HR/RBI (BSB) |
| Range beat (D1 #6) | four seniors, four sports | replaced by `ONE SET PER SENIOR` team beat, and D2 #6 becomes the cross-sell `EVERY FALL SPORT HAS ITS OWN SET` (only once those listings are live — they are) |

No sport picker, no "choose the sport" line anywhere in E.

---

## 8 · Per-sport cast — what each listing swaps in

| Sport | Athlete (age) | CARD lead | POSTER lead | SR art on disk | Owner footage | Veo i2v |
|---|---|---|---|---|---|---|
| Basketball | Marcus Ellison #12 (17) | Stadium Night | Stadium Night | ✅ basketball SR (finish file) | ✅ B1 game moment · B6 card in hand · poster zoom · poster wall | ✗ minor |
| Football | Tui Fa'agata #54 (18) | Fire & Smoke | Heritage | ✅ `ftb-sr-*` | Veo action clip (`tui-action-veo`) | ✅ adult |
| Cheerleading | Amara Boyd #0 (15) | Prism Rush | Signature Spotlight | ✅ `chr-sr-*` (14) | — | ✗ |
| Soccer | Mateo Herrera #10 (15) | Chrome All-Star | Fire & Smoke | ✅ `soc-sr-*` (14) | — | ✗ |
| Baseball | Casey Whitlock #7 (16) | Heritage | Chrome All-Star | ✅ `bsb-sr-*` (14) | — | ✗ |
| Volleyball | Jaslene Ocampo #5 (17) | Signature Spotlight | Prism Rush | ⛔ **none in `03-senior-night/src`** (SR page exists in the volleyball Figma file — pull it) | — | ✗ |

Close-video casts (own sport first, then the three a parent of that sport recognises) stay as
already decided in `render_sport_card.py` / `render_football.py` / `render_cheer.py`.

---

## 9 · What is real today, what is composited, what does not exist yet

| Asset | Status | Used by |
|---|---|---|
| Owner-shot clips (basketball): B1, B6, poster zoom, poster wall | ✅ real footage | B1 #1/#6, C1 #5 (basketball only) |
| Veo scenes with no athlete: stands, phone, faceless action; Tui action | ✅ generated, judged | HOOK alternatives |
| Athlete before photos, identity + kit plates, gate JSONs | ✅ real pipeline output, six sports | ROLL, PACKS, PAIRS, MEASURED |
| Card flips: SN (Marcus), FS (Tui), PR (Amara), CA (Mateo), HE (Casey), SS (Jaslene) | ✅ rendered on light stock | B1 #4 |
| **SR card flip** | ⛔ **not rendered for any sport** — `flip-front/back` sources exist for CHR/SOC/BSB, front/back for FTB; render `STYLE=SR…` before D1/E1 | D1 #5, E1 #5 |
| Package objects (digital screen, 12 fan, 24 spread, sealed pack) per sport | ✅ audited composites (`packages/_<sport>/`) | A2/B2 OBJECTS |
| SR set objects (`set-printed/deluxe/ultimate-real.png`), gift scenes, team order, card in case | ✅ audited composites per SR sport | D/E |
| Rooms with the framed print per sport (`hero05-*`), finish rooms (`p-room-*`) | ✅ audited composites | C1 ROOM, C1 FAN |
| Size rooms (desk / headboard / sofa at one px-per-inch) | ✅ exist for the poster row (`hang_poster.py`) | C2 SIZES |
| **Real printed product footage** (tube unboxing, cards fanned in hand, sealed pack, poster on a real wall) | ⛔ none — first physical orders not yet delivered | replaces OBJECTS/ROOM composites the day it exists |
| Registry page on a phone (real QR → `/c/<id>`) | ✅ composites with real QR | B2 #6, D2 #3 |

⚠️ Files under `art-pipeline/out/etsy-shots/` and `etsy/video/trial/` are iCloud-evicted right
now (every read timed out on 2026-09-05); a background `brctl download` was started. Before
rendering, mirror what a job needs into the scratchpad and verify by pixels, as before.

---

## 10 · Shooting list for the owner (real footage that lifts every video)

Each clip 3–5 s, phone is fine, natural speed, no text. Square or 4:5 framing, product large.

1. **Camera roll scroll** — thumb scrolling real game photos on a phone, then stopping (any sport).
2. **Tube unboxing** — the poster slid out of the tube and unrolled flat on a table, certificate visible (first printed order).
3. **Cards fanned in a hand** — twelve cards, front and one flipped to the back (first printed order).
4. **Sealed foil pack** — turned once in the light, then torn open (Ultimate / pack order).
5. **Poster on a real wall** — a person walks in, looks up (like the basketball poster-zoom clip), one per sport where possible.
6. **The handover** — a parent handing the framed print to the athlete, hands and print only (no face needed → also usable as a faceless beat for any sport).

Football (Tui, 18) may additionally get a Veo action clip per beat; nobody else may.

---

## 11 · Build order (after the owner approves these boards)

1. Shared library: `HOOK`, `ROLL`, `PACKS`, `PAIRS`, `MEASURED`, `PROOF`, `OBJECTS`, `COUNTED`, `END`
   already exist across `render_card_close.py`, `render_set_promo.py`, `render_sport_card.py`;
   add `SIZES` (poster rooms), `SR_FLIP`, `SR_OBJECTS`, `TEAM`, `DATE` chip.
2. Render the SR flips (4 sports) and pull the volleyball SR art (§8 gate).
3. A1/A2 → B1/B2 ×6 → C1/C2 ×6 → D1/D2 → E1/E2 ×5 = **38 videos**, one config file per type
   (`render_sport_card.py` is the pattern: a `SPORTS` entry per listing, beats shared).
4. Judge audit on every composite frame; pixel check on every export; ≤15 s on every file.
5. Attach in Shop Manager (manual): STORY first, CLOSE second, on every listing.

---

## 12 · BUILD LOG — one example per type, rendered 2026-09-05

Owner: "ne viska, po viena pvz kiekvieno video" → ten files in `etsy/listing-videos/`, named
**listing head title + " - Video 1"** (story) **/ " - Video 2"** (close), so each file says where it
goes in Shop Manager:

| Board | File | Length | Example |
|---|---|---|---|
| A1 | `Custom Sports Poster and Trading Card Set - Video 1.mp4` | 14.6 s | Complete Set, football leads |
| A2 | `Custom Sports Poster and Trading Card Set - Video 2.mp4` | 14.6 s | set objects = the live V3 basketball tiles (poster + cards + pack) |
| B1 | `Custom Football Card - Video 1.mp4` | 14.2 s | football card, Fire & Smoke |
| B2 | `Custom Football Card - Video 2.mp4` | 14.6 s | four package objects, certificate, timing chip |
| C1 | `Custom Football Poster - Video 1.mp4` | 13.9 s | football poster, Heritage; ROOM = the live slide-02 scene |
| C1-alt | `Custom Football Poster - Video 1 (alt Veo wall).mp4` | 13.9 s | same, ROOM = the Veo wall clip (see below) |
| C2 | `Custom Football Poster - Video 2.mp4` | 13.9 s | three size rooms, tube, wallpapers |
| D1 | `Senior Night Gift - Video 1.mp4` | 14.4 s | Senior Night any-sport, football; SR flip with the career back |
| D2 | `Senior Night Gift - Video 2.mp4` | 14.7 s | date pills, SR objects, card in case, team order |
| E1 | `Cheer Senior Night Gift - Video 1.mp4` | 14.4 s | Senior Night cheerleading, sport-locked |
| E2 | `Cheer Senior Night Gift - Video 2.mp4` | 14.7 s | ends on the fall-sports cross-sell |

Renderer: **`etsy/video/render_types.py`** (`<board>|all`); beats from the approved renderers plus
`beat_flat_gallery.py`, `beat_wall.py`, `person_mask.py`. Frame dirs and every scene are read
from the scratchpad mirror (`GDE_TRIAL`), never from the iCloud copies.

### The photo pick is a FLAT SCREEN now (owner, 2026-09-05)

"Plokščias ekranas, nuotraukos pasižymi pačios, be piršto." `FlatGallery`: a front-on generic
gallery UI, a 2×3 grid — the athlete's four real photos plus two scenery crops of those same
photos, the four get selected one after another (ring, check, count to 4), the button turns
orange `SEND TO GAME DAY EDITION`. Nothing generated, nothing in perspective, crisp at 400 px.
The scenery crops are chosen by a **rembg person mask** (`person_mask.py`, CPU-pinned), not by
a skin heuristic — the heuristic let half a face through twice; crops with >6 % person pixels
are out, near-duplicate crops are out.

### The Veo wall clip — generated, composited, and NOT passed by the judge

Two Veo 3.1 Lite takes (1080p, 8 s, **$0.64 each — $1.28, logged by hand; the Veo calls bypass
the spend ledger**). API facts learned: `negativePrompt` and `personGeneration` (any value)
are rejected by `veo-3.1-lite-generate-preview` today — "nobody in the room" has to be said in
the prompt. Take 1 (helmet, medals, lamp) is a good clip but pushes past the frame in its last
three seconds, so only frames 30–102 are usable; take 2 (minimal room) put the frame on the
bed and carries film-burn edges — unusable.

`beat_wall.py` finds the black plate per frame (the 3:4 dark-opening scorer + a temporal
prior), refines the corners by line-fitting the plate's edge pixels, warps the real print in,
masks it with the straight quad bounded by the plate. The judge (`audit-frame.ts`) went from
four defects to one, but never to PASS: the last verdicts name the mat's own inner edge, a
line above the frame corner (both Veo's) and a hand in the poster art (the product itself).
**Rule kept: no composite ships on "it'll pass."** C1 therefore uses the live slide-02 room
scene with a push; the Veo version is delivered as `C1-alt` for the owner's eye only. The
compositor is the reusable part — it will take the owner's own wall footage (blank frame,
phone camera) the same way.

### Corrections made on the way (all now in the renderers)

- Gallery → PACKS cut washes to the chrome stock instead of cross-fading two unrelated frames.
- `Assemble` (set story) lost its phone tile — it collided with the count pill.
- B2's certificate beat shows the certificate art large, two-line headline.
- `Reveal` sub-line sits at y 944, above the footer wordmark (D1/E1 re-rendered).
- Scenes read through `_mirror()`; E1 died once on an iCloud timeout before that.

## 13 · ROLLOUT — all 19 listings, 38 videos, attached on Etsy (2026-09-05)

Owner: "sukurk visus kitus likusius listingus … sukelk į tinkamą listingą, jei ten yra video —
ištrink ir įkelk naujus." Done the same day.

**Renderer:** `render_types.py sport <slug> <card|poster|sn|all>` — a `SPORTS` config per
sport (lead finishes, six-finish fan, casts, listing sources) and `SN_SPORTS` for the
sport-locked Senior Night sets; smoke test (`first + last frame of every beat`) before the
batch. Basketball uses the owner's real clips (B1 game moment as the hook, B6 card-in-hand
with the tracked SN front, poster-zoom as the wall); every other athlete is a minor →
procedural hooks. Volleyball's SR art was pulled from Figma (`5019:147/193/228`) and its
SR flip rendered; soccer + baseball SR flips rendered from the on-disk sources.

**Two production lessons:**
- **The disk filled at video 11 of 28** (PNG intermediates ≈ 1 GB per video plus the
  flip/wall frame dirs). Frames are JPEG q95 now (8× smaller); render frame dirs are deleted
  after each batch; the wall-clip variants are gone.
- **iCloud evicted the fresh renders** from `etsy/listing-videos/` the moment the disk was
  tight, and the Chrome extension's file read then timed out. Every finished video is staged
  into the scratchpad (`upload/`) by `stager.py` and uploaded from there.

**Etsy upload — the method that works (Claude in Chrome, owner's logged-in Chrome):**
1. `listing-editor/edit/<id>#media` → video tiles are the buttons "Primary video" /
   "Edit Listing video N"; each tile's container holds trash + trim buttons → JS-click the
   trash with ~1.8 s between the two (React) — no confirmation dialog.
2. With a slot free the page renders `input[type=file][accept^=video]` (label "Add video(s)");
   `find` it, `file_upload` from the scratchpad path (files were 4–9 MB, under the 10 MB cap).
   Upload **Video 1 first, wait ~20 s, then Video 2** — the first upload becomes the primary
   video, the second appends; no reordering needed (drag works too, but the first drag landed
   at position 8 of the media grid, not at the video slot).
3. Publish by JS (`button` with text "Publish changes" → `.click()`): a toast ("New attribute
   suggestions…") sat on top of the button and swallowed two coordinate clicks. Verify the
   "successfully updated" toast and that the page returned to `/tools/listings`.
4. Never `navigate` away with an unsaved change — the Leave-site dialog blocks the batch.

| Listing | Etsy id | Videos |
|---|---|---|
| Custom Basketball Trading Card | 4562666649 | `Custom Basketball Trading Card - Video 1/2.mp4` |
| Custom Basketball Poster | 4562700100 | `Custom Basketball Poster - Video 1/2.mp4` |
| Custom Cheerleading Trading Card | 4564284709 | `Custom Cheerleading Trading Card - Video 1/2.mp4` |
| Custom Cheerleading Poster | 4564287163 | `Custom Cheerleading Poster - Video 1/2.mp4` |
| Custom Baseball Card | 4567592965 | `Custom Baseball Card - Video 1/2.mp4` |
| Custom Baseball Poster | 4568369175 | `Custom Baseball Poster - Video 1/2.mp4` |
| Custom Soccer Card | 4567599879 | `Custom Soccer Card - Video 1/2.mp4` |
| Custom Soccer Poster | 4568359117 | `Custom Soccer Poster - Video 1/2.mp4` |
| Custom Volleyball Trading Card | 4567597109 | `Custom Volleyball Trading Card - Video 1/2.mp4` |
| Custom Volleyball Poster | 4568365063 | `Custom Volleyball Poster - Video 1/2.mp4` |
| Football Senior Night Gift | 4568844304 | `Football Senior Night Gift - Video 1/2.mp4` |
| Senior Night Volleyball Gift | 4568846696 | `Senior Night Volleyball Gift - Video 1/2.mp4` |
| Soccer Senior Night Gift | 4568841851 | `Soccer Senior Night Gift - Video 1/2.mp4` |
| Baseball Senior Night Gift | 4568844985 | `Baseball Senior Night Gift - Video 1/2.mp4` |

The five examples (football card/poster, Complete Set, SN any-sport, SN cheer) were uploaded
by the owner earlier the same day.
