# Second listing video — the close (built 2026-08-26)

`etsy/listing-videos/GDE-etsy-01-card-close-1080.mp4` · 1080×1080 · 15.70 s · no audio.
Renderer: `etsy/video/render_card_close.py` (PIL → ffmpeg, one command, no external input).

## Why it exists

Etsy allows two videos per listing. Video 1 (`…-card-story-…`) is emotional and sells the
transformation — it is the top of the funnel. This one is the bottom: the buyer has read
the gallery and is at the button, and what stops them is risk, not desire. It answers the
three questions in order:

1. **"Will it look like my kid?"** — five sports, each a real intake photo beside the
   finished card, with the athlete's own **face-match score** on a chip.
2. **"What if it's wrong?"** — the proof beat: watermarked proof → APPROVED → clean card.
3. **"What do I actually get?"** — four deliverables + the registry page, delivery window.

It is deliberately built in the **listing-slide style**, not video 1's cinematic style:
same light stock, orange corner brackets, GDE watermark, Anton headlines, Barlow body,
PASS/FAIL chips. Two videos that look alike would waste the second slot.

## Beats

| Frames | Time | Beat |
|---|---|---|
| 78 | 0.0–2.6 | `WILL IT LOOK LIKE THEM?` + basketball photo→card |
| 4 × 39 | 2.6–7.8 | football · cheer · gymnastics · ice hockey, same layout |
| 72 | 7.8–10.2 | `MEASURED, NOT CLAIMED.` — five score chips |
| 66 | 10.2–12.4 | `YOU SEE IT FIRST.` — proof → APPROVED |
| 60 | 12.4–14.4 | `EVERYTHING YOU GET.` — 4 downloads + 1 live page |
| 39 | 14.4–15.7 | silver shield end card |

## The numbers are real — keep them that way

Face-match values are read at render time from `art-pipeline/out/athletes/<sport>/
_identity-gate.json` (best pose similarity, threshold 0.36). Nothing is typed in by hand,
so a re-run of the gates updates the video. The one hard-coded number is **0.287**, the
rejected take — it is the same figure listing slide 06 already publishes, and it is on
screen on purpose: four passes plus one visible rejection is what makes the strip
credible. If the gate files change, re-render rather than editing text.

## Style tokens (sampled from `06 · Four shots, measured.jpg`)

bg `#F4F3EF` · ink `#14191F` · orange `#FF6B2B` · green `#4EAF90` · red `#D8554B` ·
muted `#6E7278` · hairline `#E8E7E2`. Anton for headlines and chips, Barlow SemiBold for
eyebrows/labels, Barlow Regular for body. Eyebrow = letter-spaced caps with an orange
underline under the first word or two.

## Assets it consumes (all already in the repo)

`before/photo4.png` per sport (the casual portrait — face clearly visible; photo1–3 are
action/at-home shots and pair badly), the five card fronts in
`etsy/listing-images/04-complete-set/src/`, `marcus-sn-card-back`, `marcus-sn-certificate`,
one frame of the light-background flip render, and `trial/gde-shield-4x.png`.

## If more sports are wanted later

Only five sports have card fronts on disk. Adding more means pulling those card renders
out of the per-sport Figma files first; `PAIRS` at the top of the renderer is the only
place to edit.

## Poster listing

The same structure works, with one swap: the likeness run stays, but beats D–E become
**size on a wall** (18×24 vs 24×36 next to furniture) — for a poster the unanswered
question is scale, not "what files do I get".

## Review pass (2026-08-26, same night)

- **The wordmark is the real one**, not a font approximation: it is lifted out of
  `card-flip/assets/marcus-sn/card-front.png` (region ~1030,1850–1400,1995), luminance-keyed
  to alpha and saved as `etsy/video/trial/gde-wordmark.png` (white on transparent). The
  footer inks it to `#14191F`; the end card tints it silver. Anton is close but not the
  mark — never re-type a logo when the artwork already contains it.
- **Shadows were wrong everywhere.** `shadowed()` built the blur on a canvas the size of
  the element, so the falloff was clipped at the element's own edges and read as a hard
  grey band. It now pads the canvas by 3× the blur radius. Any future soft-shadow helper
  must do the same.
- `YOU SEE IT FIRST.` → **`YOU APPROVE IT FIRST.`** (eyebrow: `NOTHING SHIPS UNTIL YOU
  SAY SO`) — approval is the promise; seeing is only half of it.
- **`EVERYTHING YOU GET` rebuilt**: four full-bleed tiles across the page (fit, not
  contain — contained images leave ragged white margins and the row stops reading as one
  system), play badge on the flip tile, and the emphasis inverted. The **`DELIVERED IN
  1-2 DAYS`** pill is now the big orange element — speed is the last push at the button;
  the file count is already told by the tile labels, so it dropped to a muted line.
- End card: shield smaller and higher, wordmark under it, tagline below — the tagline was
  overlapping the shield before.
