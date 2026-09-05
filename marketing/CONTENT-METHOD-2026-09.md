# The content method — how every listing video was built, and how to make the next thing the same way

Written 2026-09-05 for the next marketing agent, the day all 19 Etsy listings got their two videos
(38 files, Etsy: *With video 19 / Without video 0*). This is the **method**, not the log — the log
is `etsy/VIDEO-STORYBOARDS-2026-09.md` §12–§13, and the per-beat timing tables are its §3–§7.
Everything here was decided with the owner in the same week; where a line is a quote, it is his.

**TL;DR**
1. Two videos per product: **STORY** (why it is theirs) and **CLOSE** (why it is safe to buy, and
   which package). They never repeat a beat. ≤15 s, muted, first frame = thumbnail, last frame loops.
2. Every video is **assembled by code from a beat library** — real photos, real art, real numbers,
   procedural motion. Nothing is exported from Figma and re-uploaded; nothing with an athlete goes
   through a video model (they are minors — hard refusal, not a setting).
3. **Problem first, product third.** The hook names the parent's loss before the product exists.
4. One visual language: white Anton captions over media; the listing chrome (light stock, orange
   brackets, eyebrow + Anton headline, pills) for information beats; silver shield, wordmark file.
5. **Every claim must be true for every package the video can be attached to** — no prices, no
   sale %, no dates, no "instant download", counts only as the live chips say them.
6. Every generated or composited frame goes through the judge; **no composite ships on "it'll pass."**
7. Render from a local mirror, never from the iCloud paths; JPEG intermediates; verify by pixels.

---

## 1 · What we sell, in the order buyers feel it

The same five points sit under every storyboard, pin and caption. Keep the order.

1. **Built from THEIR photos** — not a template, not a filter, not a face drop.
2. **Likeness is measured, not claimed** — the gate numbers (`FACE MATCH 0.xx`) and the one
   rejected take (`0.287 · REBUILT`) are real files, so show them.
3. **Front + back, numbered, registered** (cards) · print-ready and printed, free certificate (all).
4. **You approve it before it is final — or every cent back.**
5. **Six finishes, seventeen sports**; Senior Night is its own one-night, one-of-one edition.

The buyer is a parent (or the senior's sister/girlfriend for Senior Night), scrolling with the
sound off. The competitor in our niche is a mother making posterboard by hand, not a card artist —
`SOCIAL-FORMAT-AUDIT.md` §1 has the evidence. That is why the tone is maker, not corporation, and
why the transformation (phone photo → finished piece) is the content, not an advert about it.

## 2 · The two-video model

| | STORY — Video 1 | CLOSE — Video 2 |
|---|---|---|
| Question it answers | *How does my kid's phone photo become that?* | *Is this a template shop or a maker, and what exactly arrives?* |
| Material | Full-bleed real media, emotion, the only place with real motion (flip, reveal) | Likeness proof with real numbers, the packages as objects, certificate, proof → approved, timing chip |
| Never | a price matrix, package labels | re-telling the transformation |
| Length | 14.0–14.6 s (15 s hard cap; the owner never cuts in CapCut) | same |
| Ends on | the listing's brand line (`THEIR PHOTOS. THEIR CARD.`) | count or brand line |

Together they cover the listing's four blocks in the same order the 20 photos do:
WHAT/VALUE → CHOICE → TRUST → EXPANSION. A marketing reel is a STORY, almost never a CLOSE.

## 3 · The beat library (built once, cast per sport)

| Beat | What it is | Source | Real? |
|---|---|---|---|
| **HOOK** | the problem line over their real game photo — slow push + handheld drift, freeze, white flash | `art-pipeline/out/athletes/<slug>/before/photo2.png` (in kit) or an owner clip | real |
| **FLAT GALLERY** | a front-on gallery screen, 2×3 grid: the athlete's 4 real photos + 2 scenery crops OF THE SAME photos; the four tick themselves, count pill, orange `SEND TO GAME DAY EDITION` | `beat_flat_gallery.py` (`FlatGallery(slug)`) + rembg person masks | real photos, drawn UI |
| **PACKS** | ticked photos collapse into a stack → IDENTITY PACK → KIT PACK on chrome | `_identity.png`, `_kit.png` | real pipeline output |
| **FLIP** | the card turns front → back on light stock; caption lands as the back settles | `card-flip/out/GDE_<CODE>LIGHT_*` / `GDE_<CODE>SR_*` frames | real art |
| **FAN** | five finishes fan out, the listing's lead finish centre and largest — `PICK THEIR FINISH.` | per-sport card fronts | real art |
| **REVEAL** | poster scales up from 85 % with a shadow; eyebrow = finish name; `THE POSTER.` | poster art | real art |
| **ROOM** | the framed print in that sport's room, slow push (owner's poster-zoom clip where one exists) | `etsy-shots/packages/hero05-<sport>.png`, `p-room-<FIN>.png`, SR `poster-on-wall` | audited composite |
| **PAIRS** | `WILL IT LOOK LIKE THEM?` — real photo → product, `FACE MATCH 0.xx`; own sport first, then three a parent of that sport recognises | `before/photo4.png` + art + `_identity-gate.json` | real numbers |
| **MEASURED** | five score chips including the rejected take — `MEASURED, NOT CLAIMED.` | gate JSONs | real numbers |
| **PROOF** | `PROOF` watermark tile → `APPROVED` stamp; `NOT RIGHT? WE REVISE IT — OR REFUND EVERY CENT` | proof export | real artefact |
| **OBJECTS** | the package as things: screen · 12 cards + tube · 24 + 24×36 · sealed foil pack — `FOUR WAYS TO OWN IT.`, labels, no prices | `etsy-shots/packages/_<sport>/{digital,twelve,two4,pack}.png`, SR `set-*-real.png` | audited composites — **replace with real unboxing footage the day it exists** |
| **SIZES** | three rooms where the furniture is the ruler; the print grows 18×24 → 24×36 → 30×40 at one px-per-inch | `hang_poster.py` rooms | composite, true scale |
| **COUNTED** | `EVERYTHING YOU GET.` tiles on a white plate, count pill | listing slide 19 elements | real art |
| **END** | navy stock, silver shield, wordmark, one tagline, 0.2 s fade for the loop seam | `gde-shield-4x.png`, `gde-wordmark.png` | — |

Beat order and seconds per listing type: storyboards §3 (set), §4 (card), §5 (poster), §6–§7
(Senior Night). A card video says CARD, a poster video says POSTER, a set video says SET — a
poster listing never shows trading cards except inside the set cross-sell.

## 4 · The style — rules and tokens

**Captions over media**: white **Anton**, soft drop shadow, never an outline and never a plate;
≥44 px at 1080; every line on screen ≥1.2 s; US spelling. Beat captions are one line, verbs first,
a full stop at the end.

**Information beats** use the listing chrome so the video reads as part of the gallery:

| Token | Value |
|---|---|
| stock | `(244, 243, 239)` · hairline `(232, 231, 226)` |
| ink | `(20, 25, 31)` · muted `(110, 114, 120)` |
| orange (brackets, primary pill) | `(255, 107, 43)` — website/listing accent, never on artwork |
| pass / fail chips | `(78, 175, 144)` / `(216, 85, 75)` |
| eyebrow | Barlow SemiBold 26, tracked caps |
| headline | Anton 76 (two lines max), left-aligned, ends with a period |
| pill | Anton 34 inside a rounded chip; filled orange first, then outlined |
| corners | four orange brackets; watermark tile on proof beats |

Fonts live in `~/Library/Fonts` (`Anton-Regular.ttf`, `Barlow-*.ttf`, `SpaceGrotesk[wght].ttf`
— the variable font needs `set_variation_by_name("Bold")` in PIL or it renders Regular).

**Brand marks**: the shield is silver, always — never orange, never a team colour, never the
finish's foil. The wordmark is a **file** (`etsy/video/trial/gde-wordmark.png`, white on
transparent; tint to navy on light stock) — never "GAME DAY EDITION" set in a font.

**Senior Night** is gold inside the media (the edition is gold), chrome stays the shop chrome;
`CLASS OF 2026` lockup, career line `FR · SO · JR · SR` on the back, `SENIOR EDITION · 1 OF 1`.

**Social frames (reels, pins, posts) — the owner's final typography rule (2026-09-03):**
Anton headline on the left with a period → *optional* Space Grotesk Bold sub-line at ~2:1 to
the headline → a 38 px gap → pills. **Any label-type text goes into a pill.** No eyebrows, no
gradients, no dark bands, no centred white text — three iterations were rejected before this
landed ("fontai neatitinka mūsų stiliaus", "nenoriu tų gradientų", "turi būti consistency").
Backgrounds mix light and dark across a day's set (`Surface(light|dark)` in `gen_pins.py`).

**Truth rules**: claims hold for every package the video can be attached to (physical tiers are
live on all 19 listings) — so no "instant download", no "delivered in 1–2 days"; the timing chips
are verbatim from the live slide 11: `DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7` (card/poster/set)
and `FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS · SEALED PACK 3–4 WKS` (Senior Night). No
prices, no sale %, no dates. Counts only as the listings say them (the pack is **18 cards total**;
count-bearing ART still says 10 and is count-neutral in video for that reason). Captions never
promise a jersey number for a numberless sport.

**Real over generated, in this order**: owner-shot footage → real product photos → the audited
composites already on the listing → procedural animation on real photos. Products are always the
real art (card front/back, poster, certificate, pack panel) — never an athlete render standing in
for a product; the "after" of a before/after is the card (front + back) or the poster, never
athlete art.

## 5 · Hooks — the opening-line bank (owner's, verbatim)

The first 1–2 s name the parent's problem. Use these as written; write new ones in the same
register and add them to `docs/ETSY-COPY.md` "Video hooks", not to a chat.

- Camera-roll family: `YOUR CAMERA ROLL IS FULL OF THESE.` · `DON'T LET THEIR SEASON STAY ON
  YOUR PHONE.` · `THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.` (premium; set and poster)
- Transformation family: `THIS STARTED AS A PHONE PHOTO.` → hard cut to the piece ·
  `WHAT IF THEIR GAME PHOTOS LOOKED LIKE THIS?` (slower scrolls: Pinterest/Reels)
- Anti-template family: `NOT A TEMPLATE. NOT A FILTER.` → +0.5 s → `BUILT AROUND YOUR ATHLETE.`
- Senior Night: `ONE LAST HOME GAME.` · `FOUR YEARS ON A PHONE.` · `SENIOR NIGHT HAS A DATE. WE
  WORK TO IT.` · close on `MAKE IT LAST LONGER.`

Then the ask (`SEND US 4–10 REAL PHOTOS.`), the build (`REBUILT FROM SCRATCH.`), the product.

## 6 · The cast — what each sport swaps in

One storyboard per type; a sport swaps only its assets. The config is `SPORTS` / `SN_SPORTS` in
`etsy/video/render_types.py`; adding a sport is adding one dict.

| Sport | Athlete (age) | CARD lead | POSTER lead | Flip frames | Owner footage |
|---|---|---|---|---|---|
| Basketball | Marcus Ellison #12 (17) | Stadium Night | Stadium Night | `_f-fliplight` | ✅ B1 game moment (hook) · B6 card in hand · poster zoom (room) |
| Football | Tui Fa'agata #54 (18) | Fire & Smoke | Heritage | `_f-ftbflip` | Veo action clip (the only adult) |
| Cheerleading | Amara Boyd #0 (15) | Prism Rush | Signature Spotlight | `_f-chrflip` | — |
| Soccer | Mateo Herrera #10 (15) | Chrome All-Star | Fire & Smoke | `_f-socflip` | — |
| Baseball | Casey Whitlock #7 (16) | Heritage | Chrome All-Star | `_f-bsbflip` | — |
| Volleyball | Jaslene Ocampo #5 (17) | Signature Spotlight | Prism Rush | `_f-vbflip` | — |

Close-video casts: own sport first, then the three a parent of that sport recognises
(`cast_cards` / `cast_posters`). Senior Night: `SN_SPORTS` (football, volleyball, soccer,
baseball live; cheer is the E example; softball + wrestling sets are being built in a parallel
session as of 2026-09-05 — check `etsy/LISTING-STATE.md` before adding them).

**Where the assets live**

| Asset | Path |
|---|---|
| before photos, identity / kit plates, gate JSONs | `art-pipeline/out/athletes/<slug>/` (`before/photo1-4.png`, `_identity.png`, `_kit.png`, `_identity-gate.json`) |
| card / poster art, certificates per listing | `etsy/listing-images/<NN-sport-type>/src/` (e.g. `FB-SN-front.png`, `*-poster.png`, `*-certificate.png`) |
| package objects, rooms, hero scenes | `art-pipeline/out/etsy-shots/packages/` (`_<sport>/{digital,twelve,two4,pack}.png`, `hero05-<sport>.png`, `p-room-<FIN>.png`) |
| Senior Night scenes and SR set objects | `art-pipeline/out/etsy-shots/senior-night[-<sport>]/` (`gift-<sport>-composited.png`, `set-{printed,deluxe,ultimate}-real.png`, `team-order-*`, `poster-on-wall`) |
| SR art sources | `etsy/listing-images/03-senior-night/src/` (`ftb-sr-*`, `chr-sr-*`, `soc-sr-*`, `bsb-sr-*`, `vbl-sr-*`) |
| card flips (light stock + SR) | `card-flip/out/GDE_<CODE>LIGHT_CardFlip_1080x1350.mp4`, `GDE_<CODE>SR_…` (render new ones with `card-flip/render.sh`, `STYLE=… FLIP_ASSETS=…`) |
| owner's clips | `etsy/video/Video failai sugeneruoti/` (`B1.mov`, `B6.mov`, `poster zoom basketball.mov`, `poster on the wall.mov`) — not in git |
| brand | `etsy/video/trial/gde-wordmark.png`, `gde-shield-4x.png` |
| Veo scenes with nobody in them | `etsy/video/trial/` (`gen-veo.ts`, `gen-stands.ts`, …) — not in git |

## 7 · Tooling — the commands, in the order a render needs them

**Renderers** (`etsy/video/`): `render_types.py` is the one to use — it composes the beats from
the approved renderers (`render_card_promo_v3.py`, `render_card_close.py`, `render_set_promo.py`,
`render_poster_close.py`, `render_sport_card.py`, `render_football.py`) plus
`beat_flat_gallery.py`, `beat_wall.py`, `person_mask.py`. PIL frames → ffmpeg, 1080×1080, 30 fps,
H.264 crf 17, no audio.

1. **Mirror first, always.** `~/Documents` is iCloud-synced and evicts big files mid-read
   (ffmpeg "Operation timed out", renders that finish with stale frames, fresh mp4s turning into
   stubs). `rsync -a` what the job needs into the scratchpad and point `GDE_TRIAL` at it. The
   renderer looks there for: `packages/`, `sn/`, `sn-<sport>/`, `sn-chr/`, `athletes/`, `sr-src/`,
   `src/<listing>/` and every `_f-*` frame dir (`_mirror()` / `_p()` fall back to the repo paths).
   `brctl download <file>` materialises an evicted file (~10 s); verify by size + `ffprobe`, and
   verify renders by extracted pixels, never by the log.
2. **Frame dirs** are PNG sequences named `f0001.png…` at natural speed: 
   `ffmpeg -i "<clip>" "$GDE_TRIAL/_f-<name>/f%04d.png"` (flips from `card-flip/out`, owner clips,
   Veo clips). `Frames(dirname, n, offset, caption, cap_at, square_crop, flash_out, pills)` plays
   them; `square_crop=True` centre-crops a 16:9 or 4:5 clip.
3. **Person masks** for the flat gallery fillers: `python3 etsy/video/person_mask.py <slug>
   <outdir>` (rembg, CPU provider — CoreML hangs forever). Fillers with >6 % person pixels are
   out, near-duplicate crops are out. A skin heuristic let half a face through twice; do not go back.
4. **Render**
   ```bash
   GDE_TRIAL=<mirror> GDE_TYPES_FRAMES=<scratch>/frames \
     python3 etsy/video/render_types.py sport <slug> card|poster|sn|all      # one sport
   GDE_TRIAL=<mirror> python3 etsy/video/render_types.py A1|A2|B1|B2|C1|C2|D1|D2|E1|E2|all   # the examples
   ```
   Output: `etsy/listing-videos/<listing head title> - Video 1.mp4` / `- Video 2.mp4` — the file
   name says where it goes in Shop Manager. Intermediates are JPEG q95 (PNG frames filled a
   460 GB disk at video 11 of 28); the frames dir is wiped per render; keep one at a time. Long
   batches: `nohup … &` with a unique DONE marker, then stage the outputs out of iCloud
   (the extension's file read times out on an evicted file).
5. **Smoke test before a batch**: render the first and last frame of every beat for one sport;
   then a contact sheet of 5 frames per video for the whole batch (`ffmpeg -ss <t> -frames:v 1`),
   and eyes on it — sport, athlete, art, finish labels, caption timing, nothing cut at 15 s.
6. **The judge** for anything generated or composited:
   `npx tsx etsy/video/trial/audit-frame.ts <png> "<context>"` → `PASS|FAIL` + defects
   (anatomy, duplicated people, geometry, seams, text/brand/league marks, "reads as AI").
   FAIL → redo. The Veo wall clip went from four defects to one and still shipped only as a
   labelled `-alt` file for the owner's eye: **no composite ships on "it'll pass."**
7. **Veo** (`etsy/video/trial/gen-veo.ts`) only for scenes with nobody in them (stands, a phone,
   an empty room). It refuses image-to-video with minors at the safety layer — every athlete but
   Tui is a minor, and this is not a setting. Veo 3.1 Lite 1080p = 8 s = $0.64; `negativePrompt`
   and `personGeneration` are rejected today (say "nobody in the room" in the prompt); ask for the
   frame to stay inside the picture for the whole shot; the calls bypass the spend ledger — log by
   hand. One request per minute or you get 429s.
8. **Flips**: `cd card-flip && STYLE=<CODE> FLIP_ASSETS=assets/<x> FLIP_BG=... ./render.sh` from
   `card-front.png` / `card-back.png` (1500×2100). The light-stock variants are what the listing
   videos use; SR flips carry the career back.

## 8 · Publishing

**Etsy** (Claude in Chrome, the owner's logged-in Chrome — this works end to end, unlike the
social platforms' native uploaders):
1. `https://www.etsy.com/your/shops/me/listing-editor/edit/<id>#media`. Video tiles are the
   buttons `Primary video` / `Edit Listing video N`; each tile's container holds a trash button —
   JS-click it, ~1.8 s between the two (React), no confirmation.
2. A free slot renders `input[type=file]` labelled "Add video(s)": `find` it, `file_upload` from
   the **scratchpad copy** (≤10 MB per call; ours are 4–9 MB). **Upload Video 1, wait ~20 s, then
   Video 2** — the first upload becomes the primary video, the second appends; nothing to reorder.
3. Publish by JS (`button` with text "Publish changes" → `.click()`): a toast ("New attribute
   suggestions…") sits on the button and eats coordinate clicks. Verify the *successfully updated*
   toast and that the page returned to `/tools/listings`. Never `navigate` with an unsaved change.
4. The extension drops for a minute now and then; the batch may still have executed — re-read
   the page state before repeating a delete or an upload.

**Social video**: Metricool (all five channels connected, free plan, 20 posts/month) is the way to
publish video without the owner — its uploader reads `file_upload` directly (IG Reel, TikTok,
Short, FB Reel, Pinterest video); the native uploaders ignore synthetic file events. Otherwise the
split: the owner drops the file in a front tab, Claude fills caption/tags/board and publishes.
Details and the per-platform traps: memory notes `gde-metricool-scheduling`, `gde-video-upload-split`,
`marketing/DAILY-ROUTINE.md`, `marketing/CHANNEL-LOG.md`.

**Sizes** are chosen before rendering, never cropped after (`gen_social.PLATFORMS`): stills
1080×1350 (IG/FB/YT), 1080×1920 (TikTok photo); vertical video 1080×1920 with the app's UI
insets kept clear — TikTok top 130 / bottom 400 / right 180 px, Instagram 120/320/150,
Facebook 120/340/150, YouTube Shorts 110/290/150. Pinterest pins 1000×1500, Reddit 1080×1080.

## 9 · Reusing the system for marketing — the actual recipe

A marketing piece is a **STORY cut for the platform**, built from the same beats and assets:

- **Reel / Short / TikTok (7–12 s, 9:16, silent)**: HOOK (real photo, hook line) → FLAT GALLERY
  (4 photos tick) → PACKS or the REVEAL → FLIP (card) / ROOM (poster) → END with the wordmark.
  First frame is already the hook; the product gets the longest hold because it is the thing being
  sold; type stays inside the platform's safe insets (§8); the caption on the platform is the hook
  line plus the printed-first sentence ("Printed and shipped free in the US, or print-ready files if
  you would rather print it yourself"). No music of ours — the platforms replace it.
  `marketing/gen_video.py` is the current short transform (photo1 → photo2 → flash → product);
  extend it with the beats above rather than writing a new pipeline.
- **Pin (2:3)**: `t_transform` in `gen_pins.py` — photos in on the left, product out on the right,
  one honest sentence; headline from the hooks bank; the typography rule in §4; product pins show
  finished poster art or the card front/back only.
- **Composition rules**: different sports across one day's set (never the same athlete twice in a
  row), card and poster alternate, light and dark surfaces alternate, the Figma slide language
  but never the slide file (it carries "02 / 20" numbering and turns every channel into one
  repeated advert). Mechanical audit (`audit.md`) + contact sheet before anything uploads; the
  weekly report ranks templates/sports/boards by clicks per pin, never by totals.
- **What was tried and retired — do not go back**: hands-holding-a-phone composites for the photo
  pick (perspective quads, thumb re-paste, Veo screen tracking — every version had a defect; the
  flat screen replaced it); Veo with an athlete in frame; an athlete pose render framed as a
  product; the "after" as athlete art; text-set "GAME DAY EDITION"; gradients, eyebrows and dark
  bands on social frames; "25 cards" / "18 + 4 foil" / "instant download"; prices or dates in
  video; unaudited generated frames; PNG intermediates; reading assets from the iCloud path.

## 10 · State on 2026-09-05 and what changes the method next

- **Missing: real printed-product footage** (tube unboxing, cards fanned in hand, sealed pack,
  poster on a real wall). The first physical orders are not delivered yet. The day that footage
  exists it replaces the OBJECTS and ROOM composites in every video — `beat_wall.py` already
  composites the real print into any clip of a blank black frame, so a phone clip of an empty
  frame on the owner's wall is enough. The owner's shooting list is storyboards §10.
- **The basketball videos are the reference**: they carry the owner's own clips (hook, card in
  hand, poster zoom) and read best. Every other sport's hook is a procedural push on a real photo.
- `C1-alt` (the Veo wall) exists for the owner's eye only; it never passed the judge.
- Count-bearing art (pack face, certificate) still says 10 — keep videos count-neutral until it is
  fixed. The site and listings say 18.
- Etsy Search is still ~0 visits; every marketing frame links to the sport's listing with
  `utm_content=<id>` so Pinterest analytics join back to the queue.

## 11 · File map

```
etsy/VIDEO-STORYBOARDS-2026-09.md   the boards (§0 purpose, §1 rules, §2 beats, §3–§7 per type, §8 cast,
                                    §9 real/composited, §10 shooting list, §12 build log, §13 rollout + Etsy recipe)
etsy/VIDEO-PLAN-0*.md               the earlier per-listing plans (history, traps)
etsy/video/render_types.py          THE renderer — boards + `sport <slug> …`; SPORTS / SN_SPORTS config
etsy/video/beat_flat_gallery.py     photo pick as a flat screen
etsy/video/beat_wall.py             real print composited into a blank-frame clip
etsy/video/person_mask.py           rembg masks for the gallery fillers
etsy/video/render_*.py              the approved beat renderers the composer imports
etsy/video/trial/audit-frame.ts     the judge (PASS/FAIL + defects)
etsy/video/trial/gen-veo.ts         Veo scenes without people (not in git: outputs, owner clips, frames)
etsy/listing-videos/                the 38 rendered files (not in git — on Etsy, regenerable)
etsy/LISTING-STATE.md               what is live where
docs/ETSY-COPY.md                   "Video hooks" — the line bank
marketing/README.md                 the pin engine, gates, cadence, boards
marketing/SOCIAL-FORMAT-AUDIT.md    what the niche rewards, sizes per platform
marketing/gen_pins.py / gen_social.py / gen_video.py   stills, per-platform sets, the short transform video
```
