#!/usr/bin/env python3
"""Measure whether every line of a listing actually reads.

    python3 art-pipeline/figma/audit-readability.py rects.csv bg/

`rects.csv` is one row per visible text, exported from Figma while every text was hidden:
    slide,x,y,w,h,r,g,b,fontSize   (x,y are the INK rect, in that slide's own coordinates)
`bg/NN.png` is a render of slide NN with EVERY TEXT HIDDEN, so what sits under a line can be
sampled instead of guessed. Slides with no render are treated as flat cream (#F3F1EE..#ECEAE6),
which is what the light slides are.

Rendering the whole 20-slide SECTION does not work: the exporter caps the image at 1024 px on
its long side, so a 44240 px strip comes back at 1024x56 and every sample is mush. Render the
slides one at a time.

Contrast is WCAG: (Llighter + 0.05) / (Ldarker + 0.05). Body copy needs 4.5:1; large display
type (>=32 px here, which at 2000 px canvas is well past the 24 px threshold) needs 3:1. A
photograph is not one colour, so the WORST 15% of the pixels behind a line decides it: a
headline legible over the dark half and gone over the bright half is not legible.
"""
import csv
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SLIDE = 2000
LARGE_PX = 32          # WCAG "large text", scaled to this canvas
FLOOR_BODY, FLOOR_LARGE = 4.5, 3.0
CREAM = (240, 238, 234)


def lum(rgb):
    c = np.asarray(rgb, dtype=np.float64) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def ratio(l1, l2):
    a, b = max(l1, l2), min(l1, l2)
    return (a + 0.05) / (b + 0.05)


rects_p, bg_dir = sys.argv[1], Path(sys.argv[2])
bgs = {}
for p in bg_dir.glob("*.png"):
    bgs[int(p.stem)] = np.asarray(Image.open(p).convert("RGB")).astype(np.float64)

fails, checked = [], 0
with open(rects_p) as fh:
    for row in csv.reader(fh):
        if not row or len(row) < 9:
            continue
        n, x, y, w, h, r, g, b, size = (int(float(v)) for v in row[:9])
        checked += 1
        fg = lum((r, g, b))
        img = bgs.get(n)
        if img is None:
            back_l = np.array([lum(CREAM)])
        else:
            s = img.shape[0] / SLIDE
            x0, y0 = max(0, int(x * s)), max(0, int(y * s))
            x1, y1 = min(img.shape[1], int((x + w) * s)), min(img.shape[0], int((y + h) * s))
            if x1 <= x0 or y1 <= y0:
                continue
            back_l = lum(img[y0:y1, x0:x1]).ravel()
        # the worst part of the backdrop, not its average
        worst = np.percentile(back_l, 85 if fg < 0.5 else 15)
        c = ratio(fg, worst)
        floor = FLOOR_LARGE if size >= LARGE_PX else FLOOR_BODY
        if c < floor:
            fails.append((round(c, 2), floor, n, size, (r, g, b), (x, y, w, h)))

fails.sort()
print(f"{checked} lines measured, {len(fails)} below the floor\n")
for c, floor, n, size, col, box in fails:
    print(f"  slide {n:>2}  {c:>5}:1 (needs {floor})  {size:>3}px  rgb{col}  at {box}")
