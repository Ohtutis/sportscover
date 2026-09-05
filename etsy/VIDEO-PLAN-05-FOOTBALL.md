# Football card + poster listings — all four videos (built 2026-08-27)

Renderer: `etsy/video/render_football.py` — ONE file produces all four by importing the
approved basketball/set renderers and overriding casts and assets. Run:
`GDE_TRIAL=<local mirror> python3 etsy/video/render_football.py [card|poster|all]`.

**Finish rule honoured**: the football pair leads with TWO different finishes —
CARD = **Fire & Smoke**, POSTER = **Heritage** (docs/ETSY-COPY.md, 2026-08-27). Both
closes cast football (hero) → baseball → cheer(PR) → gymnastics, real gate scores
(football 0.840 · baseball 0.734 · cheer 0.628 · gymnastics 0.651 · rejected 0.287).

| File | Length | Beats |
|---|---|---|
| `GDE-etsy-05-ftb-card-story` | 13.3 s | Tui Veo action → phone → identity/kit → **FS flip** → five-finish fan (FS center) → shield `THEIR PHOTOS. THEIR CARD.` |
| `GDE-etsy-05-ftb-card-close` | 13.1 s | FS pair (big) → 3 sports → measured → proof (FS) → 4 tiles `EVERYTHING YOU GET` + `DELIVERED IN 1-2 DAYS` → shield |
| `GDE-etsy-06-ftb-poster-story` | 12.3 s | action → phone → identity → **HE poster reveal** → room shot → shield `…THEIR POSTER.` |
| `GDE-etsy-06-ftb-poster-close` | 13.5 s | HE pair (big) → 3 sports → measured → proof (HE) → `TWO SIZES, TO SCALE` (matted 24×36) → shield |

## Assets made for this (all reusable)

- **FS flip render**: `card-flip/out/GDE_FTBLIGHT_CardFlip_1080x1350.mp4` — FS card
  front/back pulled @2x (`190:204`/`166:71`), `STYLE=FTBLIGHT FLIP_BG=239,235,228,255`.
- Football finish card fronts @1x: CA `190:136`, HE `190:291`, SS `190:353`, PR `190:415`
  → `src/football-card-{CA,HE,SS,PR}.png`; HE poster `190:253` → `football-poster-HE.png`.
- **Room composite**: `src/football-room2.png` — HE poster warped into
  `etsy-shots/p03-room-blank.png` via `etsy-poster-in-room.py` (aspect 0.673 vs 0.750,
  visually fine). `football-room1.png` (p01-frame-blank) is UNUSABLE — the detected quad
  covered the person's head; eye-check every room warp. The room beat's crop is
  left/up-biased (`cx 0.40, cy 0.40, z≥1.07`) to keep the room's stray basketball out.
- **Matted 24×36**: no football 2:3 export exists, and stretching 3:4 art would lie —
  the size diagram shows the HE art matted in a charcoal 2:3 frame instead. When the
  real 2:3 football export is made, swap it into `MattedSizes`.

## Scaling to the next sport (volleyball, soccer…)

This file IS the template: change `SRC` asset names, the two lead finishes, the cast, and
the flip render — everything else (chrome, measured, proof, sizes, captions, end cards)
comes from the shared modules. Budget ~7 Figma pulls + one flip render per sport.
