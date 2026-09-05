"""Composite the real Senior Night exports into the per-sport scene plates.

    .venv-matte/bin/python art-pipeline/lib/sr_sport_scenes.py team-order   [--sport football]
    .venv-matte/bin/python art-pipeline/lib/sr_sport_scenes.py gift-football

`team-order` carries one poster plate plus six card-stack plates: the poster is the large plate
whose shape is a poster's, the stacks are the small ones whose shape is a card's. Both are found
by shape, not by eye — the same rule as fit_plates.py, which is what stopped the cards landing
half off the hands. `gift-football` carries a single framed poster plate.

Only the poster changes between sports, so a new sport is one more run of this file and no new
generation.
"""
import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent
import os
# SR_SCENES_DIR: per-sport working dir (senior-night-<sport>) with the same plate scenes + its own src/
OUT = Path(os.environ.get("SR_SCENES_DIR") or (HERE.parent / "out" / "etsy-shots" / "senior-night"))
SRC = OUT / "src"
PY = sys.executable


def plates(img, want_aspect, tol, min_frac, max_frac, dark=70, flat=10):
    """Every flat-dark blob whose minimum-area rectangle has roughly the wanted shape."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    mean = cv2.blur(g, (9, 9))
    std = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mean * mean, 0))
    m = ((g < dark) & (std < flat)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    total = img.shape[0] * img.shape[1]
    found = []
    for i in range(1, n):
        a = stats[i, cv2.CC_STAT_AREA]
        if not (total * min_frac < a < total * max_frac):
            continue
        cnt = max(cv2.findContours((lab == i).astype(np.uint8) * 255, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0], key=cv2.contourArea)
        rect = cv2.minAreaRect(cnt)
        (cx, cy), (w, h), _ = rect
        if w > h:
            w, h = h, w
        if h < 1 or abs(w / h - want_aspect) > tol or a / (w * h) < 0.80:
            continue
        q = cv2.boxPoints(rect).astype(np.float32)
        s_, d_ = q.sum(1), np.diff(q, axis=1).ravel()
        o = [q[np.argmin(s_)], q[np.argmin(d_)], q[np.argmax(s_)], q[np.argmax(d_)]]
        found.append({"cx": cx, "cy": cy, "quad": [float(v) for pt in o for v in pt]})
    found.sort(key=lambda r: (round(r["cy"] / 80), r["cx"]))
    return found


def card_stacks(img, dark=70, flat=10):
    """The six stack tops, each measured on its OWN.

    A shared median rectangle placed at each blob's centroid does not work: the stacks sit at
    different distances from the lens, so each top face has its own size and skew, and the
    centroid of a stack includes the visible SIDE of the stack, which pulls the rectangle down.
    Printed with one median shape, the art came off the card edges. So: erode to get one marker
    per stack, watershed the un-eroded mask to split the merged ones, then take each region's own
    minimum-area rectangle and shave the stack's side off the bottom.
    """
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    mean = cv2.blur(g, (9, 9))
    std = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mean * mean, 0))
    full = ((g < dark) & (std < flat)).astype(np.uint8) * 255
    full = cv2.morphologyEx(full, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    total = img.shape[0] * img.shape[1]

    seeds = cv2.erode(full, np.ones((41, 1), np.uint8))
    n, lab, stats, cent = cv2.connectedComponentsWithStats(seeds, 8)
    markers = np.zeros(full.shape, np.int32)
    keep = 0
    for i in range(1, n):
        if not (total * 0.0012 < stats[i, cv2.CC_STAT_AREA] < total * 0.02):
            continue
        keep += 1
        markers[lab == i] = keep
    if keep == 0:
        return []
    markers[full == 0] = keep + 1                 # everything outside the plates is background
    cv2.watershed(cv2.cvtColor(full, cv2.COLOR_GRAY2BGR), markers)

    cands = []
    for k in range(1, keep + 1):
        region = (markers == k).astype(np.uint8) * 255
        if int(region.sum() / 255) < total * 0.0012:
            continue
        cnts = cv2.findContours(region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0]
        if not cnts:
            continue
        cnt = max(cnts, key=cv2.contourArea)
        (cx, cy), (w, h), ang = cv2.minAreaRect(cnt)
        if w > h:
            w, h, ang = h, w, ang + 90
        if h < 1 or not (0.45 < w / h < 0.95):
            continue
        cands.append((cx, cy, w, h, ang, cnt))
    if not cands:
        return []

    # a real stack is nearly all plate inside its own rectangle; a box edge is not
    out = []
    for cx, cy, w, h, ang, cnt in cands:
        q = cv2.boxPoints(((cx, cy), (w, h), ang)).astype(np.float32)
        probe = np.zeros(full.shape, np.uint8)
        cv2.fillConvexPoly(probe, q.astype(np.int32), 255)
        area = max(1, int(probe.sum() / 255))
        if int(cv2.bitwise_and(full, probe).sum() / 255) / area < 0.85:
            continue
        out.append((cx, cy, w, h, ang))
    if len(out) > 1:
        reach = float(np.median([o[2] for o in out])) * 3.0
        best = max(out, key=lambda a: sum(1 for b in out if (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 < reach ** 2))
        out = [b for b in out if (best[0] - b[0]) ** 2 + (best[1] - b[1]) ** 2 < reach ** 2]

    # the blob includes the stack's side wall below the face; the face keeps the card's own
    # 0.714 shape, so trim the bottom until the rectangle is a card again
    res = []
    for cx, cy, w, h, ang in sorted(out, key=lambda c: (round(c[1] / 120), c[0])):
        face_h = min(h, w / 0.714)
        shift = (h - face_h) / 2.0
        rad = np.deg2rad(ang)
        cy2 = cy - shift * np.cos(rad)
        cx2 = cx + shift * np.sin(rad)
        q = cv2.boxPoints(((float(cx2), float(cy2)), (w, face_h), ang)).astype(np.float32)
        s_, d_ = q.sum(1), np.diff(q, axis=1).ravel()
        o = [q[np.argmin(s_)], q[np.argmin(d_)], q[np.argmax(s_)], q[np.argmax(d_)]]
        res.append([float(v) for pt in o for v in pt])
    return res


def paint_stack(img, poster_quad_pts, poster_path, sheets=5):
    """Print the poster onto the sheets UNDER the top one.

    A real printed poster shows its own dark, bleeding edge where it peeks out of a stack, not
    blank white paper. The sheets are the same poster offset by a constant step, so each one is
    warped in at its own offset, back to front, clipped to the stack's footprint so nothing
    lands on the table. plates_composite still handles the TOP poster afterwards, because its
    black plate is untouched by this.
    """
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    mean = cv2.blur(g, (9, 9))
    std = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mean * mean, 0))
    P = np.array(poster_quad_pts, np.float32).reshape(4, 2)
    pmask = np.zeros(g.shape, np.uint8)
    cv2.fillConvexPoly(pmask, P.astype(np.int32), 255)
    near = np.zeros(g.shape, np.uint8)
    (cx, cy), (w, h), ang = cv2.minAreaRect(P)
    cv2.fillConvexPoly(near, cv2.boxPoints(((cx, cy), (w * 1.6, h * 1.6), ang)).astype(np.int32), 255)
    white = cv2.bitwise_and(((g > 185) & (std < 14)).astype(np.uint8) * 255, near)
    white = cv2.morphologyEx(white, cv2.MORPH_OPEN, np.ones((11, 11), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(white, 8)
    if n < 2:
        return img
    j = max(range(1, n), key=lambda k: st[k, cv2.CC_STAT_AREA])
    wx, wy, ww, wh = st[j, 0], st[j, 1], st[j, 2], st[j, 3]
    px0, py0 = P[:, 0].min(), P[:, 1].min()
    px1, py1 = P[:, 0].max(), P[:, 1].max()
    # the sheets peek out on whichever sides the white runs past the top poster
    dx = (wx + ww - px1) / sheets if (wx + ww) > px1 else (wx - px0) / sheets
    dy = (wy + wh - py1) / sheets if (wy + wh) > py1 else (wy - py0) / sheets
    art = cv2.imread(poster_path, cv2.IMREAD_COLOR)
    ah, aw = art.shape[:2]
    # ONLY where the sheets peek out: painting inside the top poster's own quad leaves art on the
    # plate, so plates_composite cannot draw the top poster there and the type comes out doubled
    # The sheets must meet each other and the top poster with NO paper showing between them: a
    # dilated plate mask and a 3 px erosion per sheet left five white slivers and a white corner,
    # which is what a stack of prints never has. The top poster is pasted afterwards over its
    # whole quad, so painting right up to (and just inside) the plate cannot double the type.
    foot = cv2.dilate((lab == j).astype(np.uint8) * 255, np.ones((9, 9), np.uint8))
    foot = cv2.bitwise_and(foot, cv2.bitwise_not(cv2.erode(pmask, np.ones((9, 9), np.uint8))))
    out = img.copy()
    for k in range(sheets, 0, -1):
        q = P + np.float32([dx * k, dy * k])
        M = cv2.getPerspectiveTransform(np.float32([[0, 0], [aw, 0], [aw, ah], [0, ah]]), q)
        warped = cv2.warpPerspective(art, M, (img.shape[1], img.shape[0]),
                                     borderMode=cv2.BORDER_REPLICATE)
        if k == sheets:
            # the BACK sheet is painted over the whole footprint, so no estimate of the sheet
            # step can leave a strip of bare paper between two sheets; the nearer sheets then
            # overpaint it inside their own quads
            m = foot.copy()
        else:
            m = np.zeros(g.shape, np.uint8)
            cv2.fillConvexPoly(m, q.astype(np.int32), 255)
            m = cv2.bitwise_and(m, foot)
        out[m > 0] = warped[m > 0]
    return out


def run(scene, spec):
    sp = OUT / f"{scene}.spec.json"
    sp.write_text(json.dumps(spec))
    subprocess.run([PY, str(HERE / "plates_composite.py"), str(OUT / f"{scene}.png"),
                    str(OUT / f"{scene}-composited.png"), str(sp)], check=True)


def main():
    scene = sys.argv[1]
    sport = "football"
    if "--sport" in sys.argv:
        sport = sys.argv[sys.argv.index("--sport") + 1]
    poster, card = str(SRC / "poster.png"), str(SRC / "card-front.png")
    img = cv2.imread(str(OUT / f"{scene}.png"))
    spec = []
    if scene == "team-order":
        big = plates(img, 0.75, 0.14, 0.02, 0.40)
        if not big:
            sys.exit("poster plate not found")
        spec.append({"asset": poster, "quad": big[0]["quad"]})
        for st in card_stacks(img):
            spec.append({"asset": card, "quad": st})
        print(f"poster 1, card stacks {len(spec) - 1}")
        staged = paint_stack(img, big[0]["quad"], poster)
        cv2.imwrite(str(OUT / f"{scene}-staged.png"), staged)
        scene = f"{scene}-staged"
    else:
        big = plates(img, 0.75, 0.16, 0.03, 0.45)
        if not big:
            sys.exit("poster plate not found")
        spec.append({"asset": poster, "quad": big[0]["quad"]})
    run(scene, spec)
    print(f"wrote {scene}-composited.png ({sport})")


if __name__ == "__main__":
    main()
