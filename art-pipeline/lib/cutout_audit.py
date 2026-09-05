#!/usr/bin/env python3
"""Full-resolution audit of every approved cutout.

WHY THIS EXISTS
---------------
`cutout.ts` already checks islands, crop, soft edge and halo — but it does it on a mask
downsampled to ~240 px on the long side, and then discards any island under 0.1% of the
matte. At 1696x2528 that means **a speck up to roughly 31x31 source pixels is invisible to
it**. A speck that size is nothing on screen and is a visible crumb of leftover backdrop on
an 18x24" print. That is the gap this file closes: it works at full resolution and reports
every island, however small.

It also separates the two things the old check could not tell apart. A soccer ball in the
air and a crumb of leftover backdrop are both "a second piece"; one is the sport and the other is a defect.
The split used here:

  * an island is EQUIPMENT if it is reasonably large (>= --equip, default 0.5% of the
    subject) AND compact (fills a decent share of its own bounding box) AND close to the
    subject. A ball, a pompom, a bat.
  * an island is GARBAGE if it is small, or a thin sliver, or far from the subject, or
    touching the canvas edge. Those never belong to the athlete.

Nothing here is destructive; it reads and reports. `--contact <path>` writes a picture of the
worst offenders with every speck ringed, because a number that says "3 specks" is not the
same as seeing where they are.

Usage:
  python3 art-pipeline/lib/cutout_audit.py [--athlete <slug>] [--suffix cutout|fit]
                                           [--equip 0.005] [--contact out.png]
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
ATHLETES = ROOT / "art-pipeline" / "out" / "athletes"
POSES = ("hero", "action2", "action3", "back")

# Anything at or below this alpha is background. Matched to cutout.ts (>8 is subject) so the
# two tools agree about what a pixel is.
ALPHA_FLOOR = 8


def audit_one(path: Path, equip_share: float):
    im = Image.open(path).convert("RGBA")
    a = np.array(im.getchannel("A"))
    H, W = a.shape
    solid = a > ALPHA_FLOOR
    lab, n = ndimage.label(solid)
    if n == 0:
        return {"error": "fully transparent"}
    areas = ndimage.sum(solid, lab, range(1, n + 1)).astype(int)
    order = np.argsort(areas)[::-1]
    main_idx = order[0] + 1
    main_area = int(areas[order[0]])
    objs = ndimage.find_objects(lab)
    my0, my1 = objs[main_idx - 1][0].start, objs[main_idx - 1][0].stop
    mx0, mx1 = objs[main_idx - 1][1].start, objs[main_idx - 1][1].stop

    equipment, garbage = [], []
    for i in order[1:]:
        lbl = i + 1
        area = int(areas[i])
        sl = objs[i]
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        bw, bh = x1 - x0, y1 - y0
        share = area / main_area
        fill = area / max(1, bw * bh)          # compactness inside its own box
        # gap from the main subject's bounding box, in px
        gap = max(0, mx0 - x1, x0 - mx1, my0 - y1, y0 - my1)
        touches_edge = x0 <= 1 or y0 <= 1 or x1 >= W - 1 or y1 >= H - 1
        rec = {"area": area, "share": round(share, 5), "box": [int(x0), int(y0), int(bw), int(bh)],
               "fill": round(fill, 3), "gap": int(gap), "edge": bool(touches_edge)}
        # SHAPE, not size, is what separates kit from garbage — learned by measuring the five
        # findings in the roster. A ball is round and fills ~0.79 of its own bounding box; the
        # four real defects were ragged slivers at 0.29-0.52. A size-only rule called a golf
        # ball garbage because it happened to be under 0.5% of the body.
        near = gap <= max(W, H) * 0.25 and not touches_edge
        looks_like_kit = near and (fill >= 0.65 or share >= equip_share)
        if area < 25:
            garbage.append(rec)          # dust; the DUST floor below decides if it is reported
        else:
            (equipment if looks_like_kit else garbage).append(rec)

    # A hole is background fully enclosed by the subject. Some are real (the gap between an
    # arm and the torso is NOT one — that connects to the outside), so only interior ones
    # count, and only if they are big enough to see.
    filled = ndimage.binary_fill_holes(lab == main_idx)
    holes = filled & ~(lab == main_idx)
    hlab, hn = ndimage.label(holes)
    hole_areas = ndimage.sum(holes, hlab, range(1, hn + 1)).astype(int) if hn else np.array([])
    big_holes = [int(x) for x in hole_areas if x > main_area * 0.0005]

    ys, xs = np.where(solid)
    margins = {"top": int(ys.min()), "bottom": int(H - 1 - ys.max()),
               "left": int(xs.min()), "right": int(W - 1 - xs.max())}
    partial = int(((a > ALPHA_FLOOR) & (a < 250)).sum())
    total = int(solid.sum())

    # A single stray pixel is invisible even at 300 dpi (0.08 mm). What matters is debris big
    # enough to read as a mark on paper: 5x5 px at this canvas size is ~0.4 mm printed.
    DUST = 25
    debris = [g for g in garbage if g["area"] >= DUST]
    fails = []
    if debris:
        fails.append(f"{len(debris)} stray piece(s) — largest {max(g['area'] for g in debris)} px")
    for side, v in margins.items():
        if v <= 1:
            fails.append(f"cropped at the {side} edge")
    # Holes are NOT a defect signal and must never gate. The enclosed gap between an arm and
    # the torso, or between the legs of a toe-touch jump, is a real hole in a real silhouette —
    # 59 of 92 cutouts "failed" on holes before this was demoted, which is a gate nobody would
    # ever read twice. Counted and reported, never failed on.
    if total and partial / total < 0.005:
        fails.append("hard stencil edge — hair will look cut out")

    return {"canvas": [W, H], "mainArea": main_area, "islands": int(n),
            "equipment": equipment, "garbage": debris, "dust": len(garbage) - len(debris),
            "holes": big_holes,
            "margins": margins, "softEdge": round(partial / max(1, total), 4), "fails": fails}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--athlete")
    ap.add_argument("--suffix", default="cutout", choices=["cutout", "fit"])
    ap.add_argument("--equip", type=float, default=0.005)
    ap.add_argument("--contact")
    ap.add_argument("--fix", action="store_true",
                    help="write <pose>.clean.png with the garbage islands erased. The approved "
                         "<pose>.cutout.png is never modified.")
    args = ap.parse_args()

    slugs = sorted(d.name for d in ATHLETES.iterdir() if d.is_dir())
    if args.athlete:
        slugs = [s for s in slugs if s == args.athlete]

    report, worst = {}, []
    for slug in slugs:
        for pose in POSES:
            p = ATHLETES / slug / f"{pose}.{args.suffix}.png"
            if not p.exists():
                continue
            r = audit_one(p, args.equip)
            report.setdefault(slug, {})[pose] = r
            if args.fix and r.get("garbage"):
                # Identify each island by its EXACT area and bounding box, never by a pixel
                # sampled from the middle of its box. A thin diagonal sliver has background at
                # its box centre, and the first fallback wrote the MAIN BODY's label into the
                # erase list — the softball back lost its whole head, and only a before/after
                # crop caught it. Match on identity, not on position.
                im = Image.open(p).convert("RGBA")
                arr = np.array(im)
                solid = arr[:, :, 3] > ALPHA_FLOOR
                lab, nlab = ndimage.label(solid)
                areas = ndimage.sum(solid, lab, range(1, nlab + 1)).astype(int)
                boxes = ndimage.find_objects(lab)
                want = {(g["area"], tuple(g["box"])) for g in r["garbage"]}
                removed, kept_unmatched = 0, []
                for i in range(nlab):
                    sl = boxes[i]
                    key = (int(areas[i]),
                           (int(sl[1].start), int(sl[0].start),
                            int(sl[1].stop - sl[1].start), int(sl[0].stop - sl[0].start)))
                    if key in want:
                        arr[lab == i + 1] = 0
                        removed += 1
                        want.discard(key)
                if want:
                    kept_unmatched = sorted(want)
                if removed:
                    Image.fromarray(arr).save(p.with_name(f"{pose}.clean.png"))
                r["cleaned"] = {"removed": removed, "unmatched": kept_unmatched}
            if r.get("fails"):
                worst.append((slug, pose, p, r))

    out = ATHLETES / f"_cutout-audit-{args.suffix}.json"
    out.write_text(json.dumps(report, indent=1))

    total = sum(len(v) for v in report.values())
    print(f"audited {total} cutouts ({args.suffix})   ->  {out.relative_to(ROOT)}")
    print(f"clean: {total - len(worst)}    with findings: {len(worst)}\n")
    for slug, pose, _p, r in worst:
        holes = len(r.get("holes", []))
        note = f"   (+{holes} silhouette hole(s), informational)" if holes else ""
        print(f"  {slug:18s} {pose:8s} {'; '.join(r['fails'])}{note}")
        for g in r["garbage"][:4]:
            print(f"      stray {g['area']:>7} px at {g['box'][:2]}  size {g['box'][2]}x{g['box'][3]}"
                  f"  gap {g['gap']}px" + ("  TOUCHES EDGE" if g["edge"] else ""))
    for slug, v in report.items():
        for pose, r in v.items():
            for e in r.get("equipment", []):
                print(f"  {slug:18s} {pose:8s} kept as equipment: {e['area']} px, "
                      f"{e['share']*100:.1f}% of body, gap {e['gap']}px")

    if args.contact and worst:
        tiles = []
        for slug, pose, p, r in worst[:12]:
            im = Image.open(p).convert("RGBA")
            bg = Image.new("RGB", im.size, (64, 66, 72))
            bg.paste(im, (0, 0), im)
            d = ImageDraw.Draw(bg)
            for g in r["garbage"]:
                x, y, w, h = g["box"]
                pad = max(28, w, h)
                d.ellipse([x + w / 2 - pad, y + h / 2 - pad, x + w / 2 + pad, y + h / 2 + pad],
                          outline=(255, 60, 40), width=8)
            bg.thumbnail((320, 480), Image.LANCZOS)
            d2 = ImageDraw.Draw(bg)
            d2.text((6, 6), f"{slug} {pose}", fill=(255, 255, 255))
            tiles.append(bg)
        cols = min(6, len(tiles))
        rows = (len(tiles) + cols - 1) // cols
        tw, th = max(t.width for t in tiles), max(t.height for t in tiles)
        sheet = Image.new("RGB", (cols * tw, rows * th), (24, 24, 26))
        for i, t in enumerate(tiles):
            sheet.paste(t, ((i % cols) * tw, (i // cols) * th))
        sheet.save(args.contact)
        print(f"\ncontact sheet: {args.contact}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
