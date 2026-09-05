# Complete Set listing — both videos, built 2026-08-27

Listing: etsy.com/listing/4562711454 (Custom Sports Poster & Trading Card Set, $89).
Both sketches were approved by the owner before rendering; the close sketch as-is, the
story after a v2 revision (set-first hook, football spine, captions on).

## Video 1 — story: `GDE-etsy-04-set-story-1080.mp4` · 14.50 s · TEXT ON

Renderer: `etsy/video/render_set_promo.py` (imports the card story + close renderers).
This is the first story video that carries its own captions — the card/poster stories
are textless for CapCut; here the owner wanted text baked in. Caption style: Anton 52 on
a dark scrim pill, bottom-center, fades in ~0.4 s into each beat; a sub-line extends the
SAME pill (white-on-beige subs are invisible — learned the hard way).

| Time | Beat | Caption |
|---|---|---|
| 0.0–2.2 | HOOK — the football edition assembles (poster, both cards, certificate) | THE COMPLETE DIGITAL SET |
| 2.2–4.6 | explosive football action → freeze + flash | EVERY SEASON HAS ITS MOMENT |
| 4.6–6.6 | phone gallery, FOOTBALL intake photos | SEND 4-10 REAL PHOTOS |
| 6.6–8.8 | football identity plate → kit | REBUILT FROM SCRATCH / NOT A TEMPLATE. NOT A FACE SWAP. |
| 8.8–10.8 | five sports, five finishes card row | ANY SPORT · SIX STYLES |
| 10.8–12.7 | sticker + badge + cutouts | ONLY IN THE COMPLETE SET |
| 12.7–14.5 | shield end card | THE WALL. THE CARDS. THE WHOLE SEASON. + 17 SPORTS · 6 STYLES · 27 FILES |

Decisions that shaped it (owner feedback on sketch v1):
- **The set opens the video.** Product-first hook for the flagship listing; the story
  follows. The B1 hook is FOOTBALL-ONLY — the Marcus sticker/badge/cutouts were removed
  from it (mixed athletes in one composition); bonus items live in their own beat.
- **Football spine, not basketball.** The listing's hero is Tui; basketball already opens
  the card and poster videos; football has the best gate score (0.84) and the most
  explosive before photo (photo3, sled drill).
- **B2 drop-in slot**: `etsy/video/trial/b2set-custom.mp4` replaces the procedural
  push+shake on photo3 if the owner models a real motion clip.

## Video 2 — close: `GDE-etsy-04-set-close-1080.mp4` · 14.90 s

Renderer: `etsy/video/render_set_close.py` (imports `render_card_close.py`). Same
structure as the card/poster closes; what changes is the DUO and the money beat:

- Pairs show photo → **poster with the card overlapping its corner** — the set is both
  products in one shot. Five sports, four finishes, real gate scores.
- `EVERYTHING. COUNTED.` — 8-tile wall (poster ×2 sizes, card F+B, certificate, flip with
  play badge, 9 social, 7 wallpapers, sticker+badge composite, 4 cutouts) + orange
  `27 FILES + 1 LIVE REGISTRY PAGE` + delivery line. The sticker+badge tile is a built
  composite (contain), never a crop — a blind `fit` on the wide sticker showed "LISON".
- End tagline on both videos: **THE WALL. THE CARDS. THE WHOLE SEASON.**

## Shared caveats

- The bonus PNGs on disk are Marcus/basketball only — a football sticker/badge/cutout set
  does not exist; that is why the story's bonus beat shows Marcus items.
- The counted beat's file list mirrors listing slide 19 (27 files audited 2026-08-25); if
  the deliverable list ever changes, update BOTH the listing slide and `Counted.TILES`.

## Story v3 (2026-08-27) — owner review round

- **Veo i2v IS allowed here**: Tui Fa'agata is **18** (`athletes.ts ageYears: 18`), so the
  photorealistic-minor refusal does not apply. `trial/tui-action-veo.mp4` (9:16 1080p 8 s,
  veo-3.1-lite, from a 9:16 crop of `football/before/photo3.png`) passed RAI and holds
  identity; the best 2.5 s (frames 55–129, peak sled drive) are staged as `_f-b2set`.
  Check `ageYears` BEFORE any athlete i2v attempt — adult = allowed, minor = never.
- **Caption style is the owner's CapCut preset**: white Anton caps, stroke_width 7 dark
  outline, straight on the image, no plate. Wordings from the owner: `IT STARTS WITH
  THEIR PHOTOS.` (action), `SEND US 4-10 REAL PHOTOS.` (phone).
- **⚠️ Phone-screen composite bug (owner-flagged, fixed in `render_card_promo_v3.py`)**:
  the gallery mask was a square rectangle, so photos poked past the phone screen's
  ROUNDED corners. The mask is now a rounded rectangle (radius 64 in gallery space)
  warped with the same homography. Any future screen composite must round its mask.
- B1 hook rebuilt denser (9 items incl. wallpaper strip + social tile + bonus, staggered
  with rotation); B5 is an overlapping fan with FOOTBALL center and largest (listing cast:
  football hero, baseball + cheer beside — `baseball-card-front.png` pulled from the
  baseball file `tL9vfpIhC5esFbXcozgAlT` node `40:2`); B6 moved to navy with brightened
  (+28%) Marcus cutouts. Remaining Marcus assets in hook/bonus/counted are accepted for
  now — "keisim vėliau į futbolą" (owner).

## v4 — the story adopts the close's language (2026-08-27, final owner round)

Owner: "perdaryk abu, kad pirmas stiliuku būtų labiau kaip antras ir pasakotų visą story".
The story is now chrome-slide beats (light stock, brackets, eyebrow + Anton headline)
with full-bleed media ONLY where it is alive — the Tui Veo clip and the phone. 12.90 s.

- **Captions over media**: white Anton + SOFT drop shadow (blurred dark copy underneath),
  the Figma-template treatment. The heavy stroke outline from v3 was rejected.
- **The bonus beat is DELETED** — "nerodom šito, nėra čia vertės". Bonus items appear only
  inside the S1 assembly and the close's counted wall.
- **Phone gallery repeats fixed**: the 3rd row was tighter crops of photos 1–2 and read as
  duplicates. Filler tiles are now scenery crops from Tui's own shots (empty field with
  goalposts from photo3, turf from photo2) — a believable camera roll, no invented photos.
- **No basketball anywhere prominent.** Story fan: hockey · baseball · FOOTBALL (center,
  largest) · cheer(PR) · gymnastics. Close cast: FOOTBALL hero pair → baseball → cheer →
  gymnastics ("your kid" slot); proof + counted tiles switched to the football edition
  (`baseball-poster.png` + `baseball-card-front.png` pulled from `tL9vfpIhC5esFbXcozgAlT`
  nodes `38:2`/`40:2`). Marcus remains only in small counted tiles (social/wallpapers/
  bonus) — no per-sport art exists for those yet; owner: "keisim vėliau".
- Close `Measured` rows now follow the same cast (rows overridden after construction).

## v5 — the composite auditor round (2026-08-27)

- **Composite audits are now mandatory** (owner: "įsidėk auditorių tokiem dalykam").
  `audit-frame.ts` runs on every screen/hand/wall composite before shipping; the judge
  caught the gallery spilling past the phone's bottom-left screen edge — the measured
  QUAD's bottom corners were low, re-measured to `(978,1310)/(692,1342)`. Source-photo
  nitpicks at 4× zoom are not blockers; composite boundary errors are.
- The thumb over the screen is re-pasted OPAQUE (a gallery with no finger reads fake);
  gallery fillers are scenery crops (goalposts, field edge) — never tighter crops of
  already-shown photos (they read as duplicates).
- `EVERYTHING. COUNTED.` rebuilt: all 8 tiles are the FOOTBALL edition (sticker `97:2`,
  badge `97:7`, social grid `70:64` pulled from `rnOtXNBGu5VmumfldAhtNO`; cutouts from
  `art-pipeline/out/athletes/football/*.cutout.png`), and every element is CONTAINED on
  its white plate — `fit` crops chopped names and were rejected.
- Story ends with **S5b: the fan's cards flip on their vertical axis into the posters**
  (`THE CARDS. THE WALL.`), then the shield. 14.40 s.
