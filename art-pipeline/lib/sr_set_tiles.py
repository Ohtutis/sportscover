"""Warp the Senior Night poster into the set-tile plate scenes, and paste it back after the edit.

    .venv-matte/bin/python art-pipeline/lib/sr_set_tiles.py            # stage 1: poster in
    .venv-matte/bin/python art-pipeline/lib/sr_set_tiles.py --finish   # stage 2: paste back + tiles

Stage 1 finds the poster plate — the largest flat-black region with a poster's aspect — by the
same rule as fit_plates.py (shape is fixed, only position/size/rotation are searched), warps
`src/poster.png` in with plates_composite.py, and writes `<scene>-poster.png` plus the quad.
Stage 2 takes the model-edited `<scene>-real.png`, pastes the exact poster region back from
stage 1 (the edit is told not to touch it, but a paste costs nothing and a redraw costs the
listing), and writes the 1400 px tile the matrix uses.
"""
import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent
import os
# SET_TILES_DIR lets the same recipe run for another set (the Complete Set uses basketball / Stadium Night)
OUT = Path(os.environ.get("SET_TILES_DIR") or (HERE.parent / "out" / "etsy-shots" / "senior-night"))
SRC = OUT / "src"
PY = sys.executable
SCENES = {"set-printed": 0.75, "set-deluxe": 0.667, "set-ultimate": 0.667}


def poster_quad(img, aspect):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    mean = cv2.blur(g, (9, 9))
    std = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mean * mean, 0))
    m = ((g < 70) & (std < 10)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((15, 15), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    best = None
    for i in range(1, n):
        a = stats[i, cv2.CC_STAT_AREA]
        if a < img.shape[0] * img.shape[1] * 0.08:
            continue
        cnt = max(cv2.findContours((lab == i).astype(np.uint8) * 255, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0], key=cv2.contourArea)
        (cx, cy), (w, h), ang = cv2.minAreaRect(cnt)
        if w > h:
            w, h = h, w
        if h < 1:
            continue
        ar = w / h
        fill = a / (w * h)
        # the poster is the one big plate whose shape is a poster's; the card rows are wide and low
        score = fill - abs(ar - aspect) * 3
        if fill > 0.78 and abs(ar - aspect) < 0.14 and (best is None or score > best[0]):
            best = (score, cnt)
    if best is None:
        return None
    cnt = best[1]
    quad = cv2.boxPoints(cv2.minAreaRect(cnt)).astype(np.float32)
    s_, d_ = quad.sum(1), np.diff(quad, axis=1).ravel()
    o = [quad[np.argmin(s_)], quad[np.argmin(d_)], quad[np.argmax(s_)], quad[np.argmax(d_)]]
    return [float(v) for pt in o for v in pt]


def stage1():
    for name, aspect in SCENES.items():
        scene = OUT / f"{name}.png"
        if not scene.exists():
            print(f"- {name}: no scene")
            continue
        img = cv2.imread(str(scene))
        q = poster_quad(img, aspect)
        if q is None:
            print(f"! {name}: poster plate not found")
            continue
        spec = OUT / f"{name}.spec.json"
        # a 2:3 plate takes the 2:3 poster when the set has one — warping 3:4 art into it would stretch it
        art = SRC / "poster-2x3.png" if (abs(aspect - 0.667) < 0.01 and (SRC / "poster-2x3.png").exists()) else SRC / "poster.png"
        spec.write_text(json.dumps([{"asset": str(art), "quad": q}]))
        out = OUT / f"{name}-poster.png"
        subprocess.run([PY, str(HERE / "plates_composite.py"), str(scene), str(out), str(spec)], check=True)
        (OUT / f"{name}.quad.json").write_text(json.dumps(q))
        print(f"ok {name}: quad {[round(v) for v in q]}")


def stage2():
    for name in SCENES:
        real, warped, qf = OUT / f"{name}-real.png", OUT / f"{name}-poster.png", OUT / f"{name}.quad.json"
        if not (real.exists() and warped.exists() and qf.exists()):
            print(f"- {name}: missing inputs")
            continue
        a, b = cv2.imread(str(real)), cv2.imread(str(warped))
        if a.shape != b.shape:
            a = cv2.resize(a, (b.shape[1], b.shape[0]), interpolation=cv2.INTER_LANCZOS4)
        p = np.array(json.loads(qf.read_text()), np.float32).reshape(4, 2)
        mask = np.zeros(b.shape[:2], np.uint8)
        cv2.fillConvexPoly(mask, p.astype(np.int32), 255)
        mask = cv2.erode(mask, np.ones((5, 5), np.uint8))       # keep the edit's own edge pixels
        out = a.copy()
        out[mask > 0] = b[mask > 0]
        tile = cv2.resize(out, (1400, 1400), interpolation=cv2.INTER_AREA)
        cv2.imwrite(str(OUT / f"tile-{name}.png"), tile)
        print(f"ok tile-{name}.png")


if __name__ == "__main__":
    stage2() if "--finish" in sys.argv else stage1()
