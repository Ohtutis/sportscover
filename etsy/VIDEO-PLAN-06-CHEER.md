# Cheerleading card + poster listings — all four videos (built 2026-08-27)

Renderer: `etsy/video/render_cheer.py`, built from `render_football.py` — that file is now
the confirmed per-sport template. Run:
`GDE_TRIAL=<local mirror> python3 etsy/video/render_cheer.py [card|poster|all]`.

Lead finishes (canon: a sport's card and poster must differ):
**CARD = Prism Rush · POSTER = Signature Spotlight** — the vivid card against the clean,
bright poster is the widest visible gap in the six, so the A/B reads clearly.

| File | Length | Beats |
|---|---|---|
| `GDE-etsy-07-chr-card-story` | 13.2 s | gym action → phone → identity/kit → **PR flip** → five-finish fan (PR center) → shield |
| `GDE-etsy-07-chr-card-close` | 13.1 s | PR pair (big) → gymnastics · football · baseball → measured → proof → 4 tiles + `DELIVERED IN 1-2 DAYS` → shield |
| `GDE-etsy-08-chr-poster-story` | 12.4 s | gym action → phone → identity → **SS poster reveal** → her room → shield |
| `GDE-etsy-08-chr-poster-close` | 13.5 s | SS pair (big) → 3 sports → measured → proof → `TWO SIZES, TO SCALE` → shield |

Close cast is cheer-first: **CHEER 0.628 · GYMNASTICS 0.651 · FOOTBALL 0.840 ·
BASEBALL 0.734**, plus the published rejected take 0.287. Ordering is deliberate — a cheer
parent recognises gymnastics next, then the big US team sports.

## ⚠️ No Veo for this athlete

Amara Boyd is **15** (`athletes.ts ageYears: 15`), so image-to-video is off the table —
policy and provider both refuse photorealistic minors. The action beat is procedural:
accelerating push + handheld drift + a rising blur on her real gym photo (`before/photo2`,
in uniform on the mat), then freeze + the shutter flash. **Check `ageYears` before every
athlete i2v attempt**; football worked only because Tui is 18.

## Assets made for this (7 Figma pulls + 1 generation + 1 flip render)

- Cheer PR card front/back @2x (`190:415` / `166:398`) → `card-flip/assets/cheer-pr/`;
  flip rendered as `GDE_CHRLIGHT_CardFlip_1080x1350.mp4` (`FLIP_BG=239,235,228,255`).
- Fan cards @1x: CA `190:136`, FS `190:204`, HE `190:291`, SS `190:353`
  (SN and PR were already on disk). SS poster `190:319`. Certificate `79:2`.
- **`cheer-room-blank.png` — a NEW generated room**, because every existing blank room is a
  basketball boy's bedroom (wrong sport, and one of them carries generated NBA-style wall
  posters — a third-party-likeness risk that already had to be cropped out of the football
  video). The cheer room is a bright girl's bedroom with pom-poms and medals on a shelf,
  ONE empty 3:4 black frame, and **no people** — generating a minor for a mockup is avoided
  on purpose. `etsy-poster-in-room.py` then warps the SS poster in (opening aspect 0.658).

## The football fix in the same pass

`render_football.py` `RoomBeat` is now **right-biased** (`cx 0.60, cy 0.40, z 1.38→1.47`).
The earlier left-biased crop pulled the room's left wall into shot, which carries
generated basketball/NBA-style posters — wrong sport for a football listing and a
likeness risk. Any reuse of `p03-room-blank` must keep the window at x ≥ 487.
