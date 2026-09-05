# 15 s Etsy video — 01 CARD listing (production plan, not yet built)

Planned 2026-08-26. Execution handed to a follow-up session — this doc is written to be
sufficient on its own. The three existing slideshow videos in `etsy/listing-videos/` stay
as v1; this is the v2 "story" video that replaces `GDE-etsy-01-card-1080.mp4` when done.

**Format:** 1080×1080 master, 30 fps, 15.0 s, H.264 CRF 17, yuv420p, `+faststart`, no
audio track. Etsy mutes everything and loops the video — every beat must read silently,
and the last frame is designed to loop into the first. All type ≥44 px at 1080, always on
a plate/pill, never raw over photography (etsy hero rules). Athlete art is ONLY existing
approved Marcus Ellison assets — nothing about the athlete is ever re-generated.

## Sales logic (why each beat exists)

1. **Recognition** — the buyer sees their own kid's game moment, not our product.
2. **Friction kill** — "you already have the photos": the #1 silent objection is
   "I'd need professional photos". Say out loud that phone photos are enough.
3. **Differentiation** — show the actual identity/kit build plates. No template shop can
   show this; it proves "built from scratch" instead of claiming it.
4. **Desire** — the card itself, front AND back (stats, QR, registry = "real card").
5. **Fit** — 6 styles / any sport: "this works for MY kid".
6. **Brand + loop** — the locked phrase "THEIR PHOTOS. THEIR CARD." No sale %, no
   dates — the video outlives the promo.

## Storyboard

| # | Time | Visual | Source assets | Motion | Text (appears ~0.4 s in) |
|---|---|---|---|---|---|
| 1 | 0.0–2.6 | Marcus mid-action under arena lights, slow-mo feel | `art-pipeline/out/athletes/basketball/action2.png` (or the SN poster art) split into bg + `action2.cutout.png` | 2.5D parallax: bg scales 1.00→1.04, cutout 1.00→1.08, slight vertical drift; one diagonal light sweep | `EVERY SEASON HAS ITS MOMENT` |
| 2 | 2.6–4.6 | Stands POV: hands holding a phone, our beat-1 frame ON the screen; shutter-blink white flash (2 frames) on the cut | NEW GENERATION (see below) + beat-1 frame warped in via `art-pipeline/figma/etsy-poster-in-room.py` | Handheld wobble ±3 px, slow push toward the screen | `YOU ALREADY HAVE THE PHOTOS` |
| 3 | 4.6–8.0 | The build: 4 real phone photos fan in → slide aside → identity + kit plates appear with thin animated measurement lines → hero cutout snaps onto the SN card layout | `basketball/before/photo1-4.png`, `_identity.png`, `_kit.png`, `hero.cutout.png` | Photos: staggered fly-in, slight rotations; plates: blueprint-style line draw-on; snap: 3-frame scale overshoot | `WE REBUILD THEM FROM SCRATCH` / small: `NOT A TEMPLATE. NOT A FACE SWAP.` |
| 4 | 8.0–11.6 | Card flip, front → back; on the back, two callout pops | `card-flip/out/GDE_SN_CardFlip_1080x1350.mp4` (Marcus, re-rendered 08-26) center-cropped to 1:1, or re-render frames natively 1080×1080 via `card-flip/render_flip.py` | As rendered; callouts pop-in at back-reveal +0.4 s and +0.9 s | top: `THEIR OWN TRADING CARD`; callouts: `REAL STATS` · `QR → LIVE REGISTRY` |
| 5 | 11.6–13.4 | Six finishes as six cards in a row | listing slide `etsy/listing-images/04-complete-set/08-six-finishes.png` art, or the six per-finish card PNGs | Lateral dolly right-to-left across the row | `6 STYLES · ANY SPORT` |
| 6 | 13.4–15.0 | End card: dark navy brand bg, silver GDE shield (NEVER orange/team/finish foil) | shield SVG (node 65:3 per figma-asset-transfer memory) | Shield fades in, text settles; 0.2 s fade to black at 14.8 for the loop seam | `THEIR PHOTOS. THEIR CARD.` / small: `GameDayEdition` |

Beat 1 opens near-black for 6 frames so the loop from beat 6's fade lands seamlessly.

## The ONE new generation (beat 2)

Prompt intent: from the stands at a youth basketball game, a parent's hands holding up a
smartphone, photographing the court; the phone screen is **EMPTY/dark** (art is composited
in afterwards — identity never passes through a generative model); shallow depth, arena
bokeh behind; crowd anonymous/defocused. Guardrails from the pipeline laws: hands with
five separated fingers actually gripping the phone (hands are asked for, not repaired);
phone is brandless — no logo, no island/notch detail; **no league marks** anywhere
(scoreboards, banners, jerseys in bokeh); nothing readable in the background. Generate at
≥2048², pick of 2–3 takes. Then `etsy-poster-in-room.py` warps the beat-1 frame into the
screen opening (the script prints the detected opening's aspect — expect ≈9:16-ish for a
phone; if it reports something else it found the wrong rectangle).

**Optional upgrade, decide with cost in view (pre-revenue rule: check price first):**
beat 1 as a true 2–3 s Veo clip via the same Vertex project instead of parallax stills.
Only if the parallax version disappoints — the parallax is likely enough at 1080 gallery
size.

## Assembly tooling

No GUI editor exists in this environment (no After Effects/Premiere). The repo's proven
pattern IS the editor: **Python/PIL renders numbered frames → ffmpeg encodes** — exactly
how `card-flip/render_flip.py` works. Build `etsy/video/render_promo.py` the same way:
a small timeline engine (beats with in/out times, layers, easing functions
ease-out-cubic for entries, linear for dollies), text drawn with the brand fonts from the
repo, then the render.sh-style ffmpeg encode. Alternative if the executing session
prefers React: Remotion via npm — but PIL+ffmpeg keeps zero new dependencies and matches
the existing pipeline. Plain ffmpeg filters alone are NOT enough for beats 3's
choreography — don't try.

## Deliverables from one timeline

- `GDE-etsy-01-card-1080.mp4` 1080×1080 — the Etsy listing video (replaces v1)
- 1080×1350 (4:5) and 1080×1920 (9:16) re-frames for IG/TikTok — design all beats with
  the center 1:1 as the safe zone so the re-frames are crops, not re-layouts
- First frame doubles as a decent thumbnail (near-black + first text plate is weak — if
  Etsy uses frame 1, consider opening on the beat-1 action frame already 20% in)

## Poster/set videos later reuse this

Beats 1–3 carry over unchanged. Poster video: beat 4 → poster hero + room shots
(`etsy/listing-images/02-basketball-poster/room-*.png`), beat 5 → wallpapers strip.
Set video: beat 4 stays the flip, beat 5 → "27 FILES + 1 LIVE PAGE" counted slide.
Three story videos for roughly 1.3× the work of one.

## Known traps

- The five non-SN flip videos still show Nia Brooks — only the SN flip is safe to use.
- `zoompan` jitters at tiny zoom rates; the PIL renderer sidesteps this (compute scale
  per frame in float, resample with LANCZOS from the 2× source).
- Etsy strips audio — never spend time on sound.
- Text timing: every plate needs ≥1.2 s fully readable on screen; if a beat feels tight,
  cut words, not display time.

## v2 upgrade — generated motion (decided 2026-08-26, do AFTER the PIL version works)

Use Gemini image (the existing pipeline) for new stills and **Veo i2v for exactly two
beats** — never more:

- **Beat 2 first** (stands/phone POV): zero identity risk (Marcus is not in the shot),
  ambient motion (crowd bokeh, breathing handheld, light flicker) is where i2v beats
  parallax outright. Generate 4 s, use ~2 s. If the phone moves, compositing our frame
  onto the screen needs corner-pin tracking (OpenCV homography per frame — feasible but
  fiddly); the cheaper route is prompting a steady phone with a dark screen and showing
  "the photo taken" as a hard cut to the full-screen frame + shutter flash — no tracking.
- **Beat 1 second** (Marcus action): real upgrade in energy, but ALL the risk lives here.
  Video models repaint face, jersey number and crest EVERY FRAME (i2v anchors only the
  first frame — README §29 applies to every later one). Rules: first frame = approved
  Marcus art; clip 2–3 s max, cut before drift; composition with the face small/in
  profile and the number visible only briefly; 3 takes; frame-by-frame review of number
  "12" and the bear crest in every take; game face (no smiles). Fails the eye test →
  ship the parallax version, which stays fully specced above.
- **Beats 3, 4, 5, 6: never generated.** Beat 3's value is that the plates are real;
  beat 4 is the product render.

Tier strategy: draft takes on the fast/lite Veo tier, final picks on the standard tier.
Check current Vertex video pricing BEFORE generating (pre-revenue cost rule); budget
roughly $5–15 for the whole video including rejected takes. Veo outputs 16:9/9:16 —
frame center-safe for the 1:1 master crop.

### Trial result (2026-08-26, this session)

Beat-2 trial EXECUTED and it works: `etsy/video/trial/stands-phone-still.png` (gen-stands.ts
beside it, gemini-3-pro-image 2K, ~€0.32, in the ledger) → `stands-phone-veo-lite-4s.mp4`
(veo-3.1-lite, 9:16 720p 4 s, i2v via predictLongRunning on the SAME AI-Studio key — probed:
veo-3.1 generate/fast/lite all resolve). Verdict: real ambient motion (crowd shifts, players
move in bokeh, handheld breathing), screen stays dark throughout, nothing readable. Veo
reframed slightly wider than the source still (outpainted more arena + an unreadable
scoreboard) — acceptable; if exact framing matters, crop the source tighter before submitting.
NOTE: the Veo call bypasses lib/budget.ts (raw curl) — it is NOT in the ledger; add it by hand
or route future calls through a wrapper. Monthly cap was already exceeded (~€37.60/€25);
the trial ran with an explicit GDE_BUDGET_EUR=45 override. For the final video: 720p is
enough for the 1080-square master only if upscaled gently — prefer 1080p on the final take.

### v2 BUILT (2026-08-26, same session) — `GDE-etsy-01-card-story-1080.mp4`

The story video exists: 15.0 s, 1080×1080, NO text overlays (owner adds text in CapCut).
Renderer: `etsy/video/render_card_promo.py` (PIL frames → ffmpeg, self-contained, rerunnable).

**Hard lesson that changes the plan permanently: Veo's RAI filter REFUSES i2v on images
containing photorealistic children** ("can't create videos from input images containing
photorealistic children") — the poster-alive shot was filtered, and this closes ALL
athlete-bearing Veo shots for every future video (poster video included). Do not attempt
workarounds. Athlete beats are animated procedurally instead: beat 1 is Ken Burns over the
poster art zone + two drifting procedural fog layers + floating dust + arena light pulse,
all in the renderer.

Beat sources as built: B1 procedural (above); B2 = `trial/stands-final-veo.mp4`
(veo-3.1-lite 9:16 **8 s 1080p** — 1080p requires 8 s duration, 4/6 s are rejected) with a
4-frame shutter flash out; B3 = real intake photos → identity/kit plates → card front
landing at exactly the flip video's card geometry (700×980 centered) so the B3→B4 cut is
invisible; B4 = Marcus SN flip frames 15–122 cropped 1:1; B5 = six finish cards auto-cut
from listing slide 08 (luminance < 165, column fill > 0.55 — at 105/0.45 the bright
Heritage card is missed) on a lateral dolly; B6 = end card, navy radial + the GDE shield
recolored to SILVER in code (the Figma 65:3 export is navy-on-white; brand rule: the mark
is always silver, never navy-on-a-white-badge).

Veo ops quota: several submissions in a minute hit 429 — space them ~45 s apart.
Spend this session: 1 still (~€0.32, ledgered) + three Veo lite calls (4 s trial, one
filtered, 8 s final — small, NOT ledgered; raw curl bypasses lib/budget.ts).

### v3 BUILT (2026-08-26 late) — the recut per owner feedback, no text overlays

Renderer: `etsy/video/render_card_promo_v3.py`. Storyboard: real game photo (before/photo2,
pixels untouched — vertical pan + rembg parallax + freeze + shutter flash) → home evening
phone still with the 4 REAL intake photos composited as a ticking gallery → photo fan on
the LIGHT beige bg → identity front/¾/full then back+kit → flip re-rendered on light bg
(`GDE_SNLIGHT_CardFlip`, FLIP_BG=239,235,228) → Marcus holding his card
(03-kid-card-COMPOSITED, parallax) → silver shield.

Lessons burned in this pass:
- **Audit EVERY generated frame with the judge** (`etsy/video/trial/audit-frame.ts`) —
  two square-extension takes of the game photo FAILED (invented truncated people, seams);
  the fix was real-pixel panning, not a third take. Memory: gde-audit-all-generated.
- **Veo screen-tracking is a dead end**: the clip's phone screen carries bright
  reflections, so darkness-based quad detection cannot find it (three approaches failed).
  The shipped B2 is the static still + hand-measured screen quad
  ([(574,692),(903,653),(984,1322),(670,1373)] at 2048²) + procedural wobble/push.
  `trial/phone-veo.mp4` kept unused.
- **PIL PERSPECTIVE find_coeffs argument order**: matrix rows come from the OUTPUT quad,
  target vector from the INPUT rect — inverted args silently paint content elsewhere.
- rembg/birefnet MUST be pinned `providers=["CPUExecutionProvider"]` (CoreML hangs at 0%
  CPU — same trap as the README documents for the pipeline).

### Drop-in slots for owner-modeled shots (2026-08-26 evening)

The owner is modeling the two photo-based shots (B1 game moment, B6 card-in-hand)
himself — crop-animations were rejected as lifeless. The renderer now takes drop-ins:

- `etsy/video/trial/b1-custom.mp4` → replaces B1's motion part (first ~1.6 s used),
  the renderer still appends the REAL-photo freeze + shutter flash after it
- `etsy/video/trial/b6-custom.mp4` → replaces B6 entirely (2.0 s used)

Any resolution/aspect — frames are center-cropped to 1080². Just place the file and
rerun `python3 etsy/video/render_card_promo_v3.py`.

Also available as raw material: `trial/action-faceless-veo.mp4` — Veo t2v (no child in
frame, passes RAI): ball + adult legs + warm gym light, no faces, no brands; first ~5 s
usable, tail fades to black. If Veo is used for more such inserts, keep every prompt
faceless/brandless and audit the frames (gde-audit-all-generated).

### Owner clips integrated (2026-08-26 late evening) — FINAL v3

`etsy/video/Video failai sugeneruoti/B1.mov` (3.4 s, dribble→jump shot, i2v from
before/photo2 done by the owner in an external tool) and `B6.mov` (4.0 s, slow zoom to
the held card) are wired into the drop-in slots (transcoded to `trial/b1-custom.mp4` /
`b6-custom.mp4`). B1 is time-remapped over the whole 2.4 s beat with the shutter flash
landing on the shot-release pose; B6's full 4 s zoom is remapped into 2 s. Frames
audited: kit/number/crest stable in B1, the card stays sharp and readable in B6.
The final `GDE-etsy-01-card-story-1080.mp4` ships these.

### Fixes after owner review (2026-08-26, ~22:00)

1. **B2 finger on a face.** The gallery is composited into the phone screen with a
   darkness-weighted alpha, so the parent's skin shows through wherever it crosses the
   screen — it landed as a smudge over a face. The thumb footprint was measured in
   gallery space by inverting the screen homography: it occupies x < 90 (the grip, all
   heights) and x 400-560 below y ~ 790. The four tiles now live in the clean rectangle
   x 95-620, y 25-795 (`B2.POS`, 255x375 each); the dark area below reads as phone UI and
   is where the finger rests. Any future layout change must re-check that map.
2. **B6 replaced** with the owner's second take (`Video failai sugeneruoti/B6 new.mp4`,
   1080x1920 with a letterboxed 1080x1080 clip at y 420-1500 — `B6.CROP`). The card is
   held clear of the face with only the fingers at its bottom-left corner.
   The real card front is corner-pinned per frame from `trial/b6new-quads.npy`: quads were
   produced by frame-to-frame translation tracking of the card patch, with BOTH ends
   anchored to hand-measured corners (frame 1 and 118) and the residual drift distributed
   linearly. Hand-keying three quads and interpolating was tried first and failed — the
   card does not move linearly. The pinned quad is expanded 3.5 % so the clip's own
   (mangled) card edge cannot peek out, then the fingers are re-pasted on top via skin
   detection in the lower-left of the quad.

`TRIAL` and `OUT_FRAMES` now honour `GDE_TRIAL` / the local scratchpad path, so renders
read and write outside the iCloud-backed repo (see the gde-icloud-eviction memory).

### Second review pass (2026-08-26, ~22:20) — master is now 19.5 s

- **Nothing is time-compressed any more.** The owner's clips run at their own frame rate
  (B1 = 102 frames, B6 = 118), which is why the master runs 19.47 s instead of 15 —
  compressing B6 2:1 made the ending "fly". Beat lengths:
  108 / 78 / 66 / 72 / 100 / 118 / 42 frames. The owner trims to Etsy's 15 s in CapCut,
  so never re-compress a clip to hit a duration — shorten a beat instead.
- **Phone gallery fills the screen** (two full rows plus the cut top of a third, like a
  real photo app scrolled to the top; `B2.TILES` carries per-tile vertical crop bias).
  The hand crossing the screen is NOT re-pasted — the screen is painted opaque — because
  a finger over the photos read as a smudge. The thumb-footprint map is still documented
  above in case a layout ever needs to dodge it again.
