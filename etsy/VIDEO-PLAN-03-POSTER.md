# Poster listing — first video (the story), built 2026-08-27

`etsy/listing-videos/GDE-etsy-02-poster-story-1080.mp4` · 1080×1080 · **14.43 s** ·
no audio, no text (CapCut adds it). Renderer: `etsy/video/render_poster_promo.py`.

## It reuses the card video rather than copying it

The renderer imports `render_card_promo_v3.py` and uses its beats and helpers directly
(`B2` phone gallery, `B3` photo fan, `B4` identity/kit, `beige_bg`, `square_from`), plus
the end card from `render_card_close.py`. Only the sport-specific half is new. Editing a
shared beat therefore changes both videos — that is deliberate; do not fork them.

| Frames | Time | Beat | Source |
|---|---|---|---|
| 84 | 0.0–2.8 | game action → freeze + white shutter flash | owner's `B1.mov`, **tail** 84 frames |
| 60 | 2.8–4.8 | phone gallery, 4 real intake photos | shared with the card video |
| 54 | 4.8–6.6 | photos fan out on light stock | shared |
| 66 | 6.6–8.8 | identity plate → back + kit | shared |
| 43 | 8.8–10.2 | **the poster on the wall, he looks at it** | owner's `poster zoom basketball.mov` |
| 78 | 10.2–12.8 | **six rooms, one per finish**, 0.43 s each with a push-in | `02-basketball-poster/room-*.png` |
| 48 | 12.8–14.4 | shield + wordmark + `THEIR PHOTOS. THEIR POSTER.` | `EndCard(tagline=…)` |

**Why rooms instead of the second owner clip:** the `poster on the wall.mov` take showed one
room well, but the buyer's real question is "does this fit MY wall". Six existing room
renders — bedroom, living room, home gym, study, bright wall, gaming desk, each carrying a
different finish — answer that and sell the style range at the same time, in the same
runtime. The clip is kept in `Video failai sugeneruoti/` in case a single-room cut is
wanted later.

## Rules this build follows

- **Nothing is time-compressed.** Both owner clips play frame-for-frame; B1 is trimmed
  **from the front** (not the back) so the flash lands on the shot release rather than on
  the wind-up. Trimming is how a beat is shortened — never speed.
- Etsy's cap is 15 s; 14.3 s leaves headroom so the owner does not have to cut anything.
- `EndCard` now takes a `tagline` argument — the card videos keep `THEIR PHOTOS. THEIR
  CARD.`, this one says `POSTER`. Never ship a poster listing with card wording.

## The second poster video, when it is wanted

Mirror `render_card_close.py`, with one swap: the likeness run and the proof beat carry
over unchanged, but "everything you get" becomes **size on a wall** — 18×24 next to
24×36, with furniture for scale. For a poster the unanswered question at the button is
how big it is, not which files arrive.

---

# Poster listing — second video (the close), built 2026-08-27

`etsy/listing-videos/GDE-etsy-02-poster-close-1080.mp4` · 1080×1080 · **14.70 s** ·
no audio. Renderer: `etsy/video/render_poster_close.py`, which imports
`render_card_close.py` for the chrome, helpers, `Measured` and `EndCard` — only the
poster-specific beats are new.

| Frames | Time | Beat |
|---|---|---|
| 72 | 0.0–2.4 | `WILL IT LOOK LIKE THEM?` + basketball photo → poster |
| 4 × 36 | 2.4–7.2 | football · cheer (Prism Rush) · gymnastics (Heritage) · ice hockey (Fire & Smoke) |
| 60 | 7.2–9.2 | `MEASURED, NOT CLAIMED.` — shared with the card close |
| 54 | 9.2–11.0 | `YOU APPROVE IT FIRST.` — poster proof → APPROVED |
| 72 | 11.0–13.4 | **`TWO SIZES, TO SCALE.`** |
| 39 | 13.4–14.7 | shield + `THEIR PHOTOS. THEIR POSTER.` |

## The size beat is the whole reason this video differs

A card buyer asks *what files do I get*; a poster buyer asks *how big is it*. So instead
of the deliverables row, this video draws a **wall elevation at one scale**: 8 px per real
inch for everything on screen — the 18×24 (3:4 art), the 24×36 (the true 2:3 export,
proxied at 600×900 from `GDE-SN-BKB-poster-2to3-7200x10800`), a 72×30 in sofa and a 5'9"
figure, with both posters hung at 57 in eye level and orange dimension ticks under each.
The sofa and figure are drawn schematically, never photographed, so nobody can mistake the
diagram for a room mockup — the room mockups are the *first* poster video's job.

If the scale ever needs changing, `Sizes.PPI` is the single knob; everything (posters,
sofa, figure, hanging height) derives from it, so the drawing stays internally honest.

## Card cheer/gymnastics finishes, and where per-finish art comes from

Every per-sport Figma file carries all six finishes at the SAME node ids even though its
only page is named "Stadium Night": card FRONT — SN `40:2`, CA `190:136`, FS `190:204`,
HE `190:291`, SS `190:353`, PR `190:415`; posters — SN `38:2`, FS `190:167`, HE `190:253`,
PR `190:379`. So any sport in any finish is one `download_assets` call, with no Figma
edit. That is how the Prism Rush cheer card and poster got here.
