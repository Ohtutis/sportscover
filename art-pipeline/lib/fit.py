#!/usr/bin/env python3
"""Normalise approved cutouts so one Figma layout composes for every athlete.

WHY THIS EXISTS
---------------
The poster and card slots were laid out around ONE athlete (the Nia Brooks placeholder).
Every slot uses scaleMode FIT, so a cutout is centred inside its box by the CANVAS, not by
the person: two files of the same 1696x2528 size compose completely differently if one
subject stands full height and the other is a wide airborne shape in the top third.

Measured across the 17-sport roster the subject occupies anywhere from 33% to 94% of the
canvas height. Dropping those in raw means nudging 102 composites by hand. So instead each
approved cutout gets a normalised twin whose subject sits in a fixed box, and the Figma
merge can place by name with no per-sport arithmetic.

WHAT IT DOES NOT DO
-------------------
It never touches `<pose>.cutout.png` — that file is approved art. Output is `<pose>.fit.png`.
And it cannot rescue a HORIZONTAL pose dropped into a VERTICAL slot: no scaling makes a
flying-eagle cheer stunt fill a 2:3 portrait box. Those it reports instead, with the pose
from the same approved set that does fit, so the fix is a slot reassignment and not a
regeneration.

Usage:  python3 art-pipeline/lib/fit.py [--athlete <slug>] [--write]
        (without --write it only measures and reports)
"""

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ATHLETES = ROOT / "art-pipeline" / "out" / "athletes"
POSES = ("hero", "action2", "action3", "back")

# Alpha below this is matting fringe, not the subject. Measuring on >0 pulled the box out to
# stray semi-transparent pixels on three athletes and made every subject read wider than it is.
ALPHA_FLOOR = 24

# ONE BOX PER SLOT, NOT ONE BOX FOR ALL THREE.
#
# The first version put every pose in the same box — subject 90% tall, standing on 97%. It
# looked reasonable as a number and destroyed the composite: the poster and card are a
# three-figure "athlete edit" where the two supporting poses are meant to read as smaller and
# further back, and making them the same size as the hero put one of them directly behind him.
#
# These targets are MEASURED off the artwork the layouts were actually designed around —
# `exports/shared-cutouts/GDE-cutout-{hero,pose2,pose3}.png`, the reference athlete:
#
#   hero    subject 78.5% of canvas height, standing on 89%, centred
#   pose2   subject 62.9%, standing on 67%, centred at 47%
#   pose3   subject 70.1%, standing on 74%, centred at 47%
#
# Every slot uses scaleMode FIT and fits by height, so "share of canvas height" is exactly
# "share of slot height" — matching these fractions reproduces the designed composition for
# any athlete, whatever their own framing.
#
# `back` is not part of the composite: it fills the card back with scaleMode FILL, which crops
# rather than fits, so it keeps a full-height subject.
PROFILES = {
    "hero":    {"h": 0.785, "bottom": 0.89, "cx": 0.50},
    "action2": {"h": 0.629, "bottom": 0.67, "cx": 0.47},
    "action3": {"h": 0.701, "bottom": 0.74, "cx": 0.47},
    "back":    {"h": 0.900, "bottom": 0.97, "cx": 0.50},
}

# A wide pose gets fitted by width instead of height, and a pixel-exact clamp puts the
# subject's outermost antialiased pixels ON the canvas edge — the swimming dive lost its
# fingertips that way. Leave a margin so nothing ever touches the boundary.
MAX_W = 0.96

# Hero slots are 771x1146 (poster) and 600x900 (card front) -> aspect ~0.67. A subject wider
# than this cannot fill one; the cut-off is deliberately loose, because a subject slightly
# wider than the slot still reads as a full-height figure.
HERO_MAX_ASPECT = 0.95


def measure(path: Path):
    im = Image.open(path).convert("RGBA")
    alpha = im.getchannel("A")
    box = alpha.point(lambda v: 255 if v >= ALPHA_FLOOR else 0).getbbox()
    if box is None:
        raise ValueError(f"{path} is fully transparent")
    x0, y0, x1, y1 = box
    return im, box, (x1 - x0), (y1 - y0)


def _transform(W, H, box, sub_w, sub_h, prof):
    scale = (prof["h"] * H) / sub_h
    if sub_w * scale > MAX_W * W:
        scale = (MAX_W * W) / sub_w
    off_x = (prof["cx"] * W) - (box[0] * scale + sub_w * scale / 2)
    off_y = (prof["bottom"] * H) - (box[1] * scale + sub_h * scale)
    return {"scale": round(scale, 4),
            "offset_x_pct": round(off_x / W, 4),
            "offset_y_pct": round(off_y / H, 4)}


def normalise(im: Image.Image, box, sub_w: int, sub_h: int, prof) -> Image.Image:
    W, H = im.size
    scale = (prof["h"] * H) / sub_h
    # Never let the normalisation push the subject off its own canvas sideways. A wide pose
    # gets fitted by width instead, and stays short in frame — which is the honest result and
    # is exactly what the hero check below is for.
    if sub_w * scale > MAX_W * W:
        scale = (MAX_W * W) / sub_w
    new = im.resize((max(1, round(W * scale)), max(1, round(H * scale))), Image.LANCZOS)
    sx0, sy0 = box[0] * scale, box[1] * scale
    # Where the subject must land on the output canvas.
    want_cx = prof["cx"] * W
    want_bottom = prof["bottom"] * H
    off_x = round(want_cx - (sx0 + sub_w * scale / 2))
    off_y = round(want_bottom - (sy0 + sub_h * scale))
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    out.paste(new, (off_x, off_y), new)
    return out


def main() -> int:
    args = sys.argv[1:]
    write = "--write" in args
    only = None
    if "--athlete" in args:
        only = args[args.index("--athlete") + 1]

    slugs = sorted(d.name for d in ATHLETES.iterdir() if d.is_dir())
    if only:
        slugs = [s for s in slugs if s == only]

    report, problems = {}, []
    for slug in slugs:
        poses = {}
        for pose in POSES:
            # Prefer the cleaned matte when the audit produced one: strays must never reach
            # Figma, and the approved cutout must never be edited. `cutout_audit.py --fix`
            # writes the clean twin; if there is none, nothing was wrong with this frame.
            clean = ATHLETES / slug / f"{pose}.clean.png"
            src = clean if clean.exists() else ATHLETES / slug / f"{pose}.cutout.png"
            if not src.exists():
                continue
            im, box, sub_w, sub_h = measure(src)
            W, H = im.size
            poses[pose] = {
                "bbox": list(box),
                "canvas": [W, H],
                "subject_w_pct": round(sub_w / W * 100, 1),
                "subject_h_pct": round(sub_h / H * 100, 1),
                "aspect": round(sub_w / sub_h, 3),
                # Ready-made placement for a Figma CROP fill, so the approved pixels can be
                # positioned without being resampled at all. Same maths as normalise().
                "transform": _transform(W, H, box, sub_w, sub_h, PROFILES[pose]),
            }
            if write:
                normalise(im, box, sub_w, sub_h, PROFILES[pose]).save(ATHLETES / slug / f"{pose}.fit.png")
        if not poses:
            continue

        # Which pose can carry the portrait hero slot?
        usable = {p: d for p, d in poses.items() if d["aspect"] <= HERO_MAX_ASPECT}
        if "hero" in usable:
            best = "hero"
        elif usable:
            # tallest subject wins; a back shot is the last resort because the face is hidden
            best = max(usable, key=lambda p: (poses[p]["subject_h_pct"], p != "back"))
        else:
            best = None
        if best != "hero":
            problems.append((slug, poses.get("hero", {}).get("aspect"), best))
        report[slug] = {"poses": poses, "hero_slot": best}

    out = ATHLETES / "_fit-report.json"
    out.write_text(json.dumps(report, indent=1))

    print(f"{'athlete':18s} {'pose':8s} {'subj w%':>8} {'subj h%':>8} {'aspect':>7}")
    for slug, d in report.items():
        for pose, p in d["poses"].items():
            print(f"{slug:18s} {pose:8s} {p['subject_w_pct']:7.1f}% {p['subject_h_pct']:7.1f}% {p['aspect']:7.2f}")

    print(f"\nwrote {out.relative_to(ROOT)}" + ("  (+ *.fit.png)" if write else "  (measure only)"))
    if problems:
        print("\nHERO SLOT — these poses cannot fill a portrait slot (aspect > "
              f"{HERO_MAX_ASPECT}); use the suggested approved pose instead:")
        for slug, aspect, best in problems:
            print(f"  {slug:18s} hero aspect {aspect}  ->  use '{best}' in the hero slot")
    else:
        print("\nHERO SLOT — every athlete's `hero` pose fits a portrait slot.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
