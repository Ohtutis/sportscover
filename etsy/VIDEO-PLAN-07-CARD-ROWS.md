# The six CARD listings — video status and the shared pattern (2026-08-27)

Reviewed against the `01 · CARD LISTING` page in the listing-templates file, which now
carries six sport rows. Every row must have TWO videos that do different jobs:

- **STORY** — their photos → the build → the flip → every finish. Why the card is *theirs*.
- **CLOSE** — likeness proof with real gate scores → measured → proof → what you get.
  Why it is *safe to buy*.

| Row | Lead finish | Story | Close |
|---|---|---|---|
| BASKETBALL | Stadium Night | `GDE-etsy-01-card-story` (owner-finished in CapCut as `Final version Basketball.mov`) | `GDE-etsy-01-card-close` |
| FOOTBALL | Fire & Smoke | `GDE-etsy-05-ftb-card-story` | `GDE-etsy-05-ftb-card-close` |
| CHEERLEADING | Prism Rush | `GDE-etsy-07-chr-card-story` | `GDE-etsy-07-chr-card-close` |
| SOCCER | Chrome All-Star | `GDE-etsy-09-soc-card-story` | `GDE-etsy-09-soc-card-close` |
| BASEBALL | Heritage | `GDE-etsy-10-bsb-card-story` | `GDE-etsy-10-bsb-card-close` |
| VOLLEYBALL | Signature Spotlight | `GDE-etsy-11-vb-card-story` | `GDE-etsy-11-vb-card-close` |

**Six sports, six different lead finishes.** Deliberate: the listings look distinct in
search, and after a few weeks the shop can read which finish actually converts instead of
guessing. The poster listing of a sport always takes a different finish again (football
poster = Heritage, cheer poster = Signature Spotlight).

## `render_sport_card.py` — the renderer for all of them

The third sport made copy-paste indefensible, so soccer/baseball/volleyball share one
config-driven file. A new sport is a `SPORTS` entry (lead finish, five fan cards, cast,
flip frames, certificate) — every beat, the chrome, the captions and the end card come
from the approved shared renderers. Run:
`GDE_TRIAL=<mirror> python3 etsy/video/render_sport_card.py <sport> [story|close|all]`.

Football and cheer keep their own files (`render_football.py`, `render_cheer.py`) because
they also build POSTER videos, which this one does not.

## Cost of adding a sport (measured on these three)

7 Figma pulls — lead front+back @2x, four fan fronts @1x, certificate — plus one flip
render (`STYLE=<X>LIGHT FLIP_BG=239,235,228,255`). No generation needed for a card
listing; only poster listings need a room.

## ⚠️ Athlete ages gate the action beat

Mateo Herrera 15 · Casey Whitlock 16 · Jaslene Ocampo 17 — all minors, so all three action
beats are **procedural** (accelerating push + handheld drift + rising blur on their real
photo). Only football's Tui Fa'agata (18) has ever been eligible for Veo i2v. Check
`athletes.ts ageYears` before considering i2v for any new sport.

## Real gate scores on screen (read at render time, never typed)

soccer 0.782 · baseball 0.734 · volleyball 0.652 · football 0.840 · cheer 0.628 ·
gymnastics 0.651, plus the published rejected take 0.287. Each close casts its own sport
first, then the three sports its buyer is most likely to recognise.

## Two corrections applied across every video (2026-08-27, owner review)

### 1. The delivery claim was an over-promise — removed everywhere

`DELIVERED IN 1-2 DAYS` was true only for a digital order. The rows carry physical tiers
too (printing plus shipping), so the chip could not be honoured on every listing the video
appears on. Replaced with the promise the canon already makes on every tier:

    YOUR PROOF IN 24 HOURS

(`docs/ETSY-COPY.md`: "upload photos → proof in 24 h → approve → files/print"). It is
still a speed hook — arguably a better one, because it is the buyer's *first* moment — and
it is true whether they bought files or a printed card. The sub-line changed with it:
`4 DOWNLOADS + …` → **`PRINT-READY FILES + 1 LIVE REGISTRY PAGE · ONE OF ONE`**, which
also holds for a physical order (each tier includes the digital files of what was bought).

**Rule:** a claim baked into a video must be true for *every* listing that video can be
attached to. Digital-only wording belongs in the description, not in the art.

### 2. The build beat is now one continuous idea — `Packs`

Owner: after the photos are ticked they should *fall* into place and become the packs.
The old static two-up slide is replaced by `Packs` in `render_sport_card.py` (shared by
football and cheer, so all six card stories and both poster stories use it):

    ticks → the four photos collapse into a tidy stack → the stack becomes the
    IDENTITY PACK → it hands over to the KIT PACK → the flip is the result

Labels are small dark chips (`IDENTITY PACK` / `KIT PACK`) so the two stages read without
narration. 84 frames; the flip and fan beats were shortened to 78/54 to hold the runtime
under 15 s. Videos re-rendered: 16 (every close for the claim, every story for the beat).
