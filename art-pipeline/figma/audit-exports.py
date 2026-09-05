#!/usr/bin/env python3
"""Audit a folder of exported listing slides before they go anywhere near Etsy.

    python3 art-pipeline/figma/audit-exports.py etsy/listing-images/03-senior-night

Checks what a screenshot cannot: that every slide is there, is the right size, is not
blank, and is not a near-duplicate of its neighbour (the usual sign of a stale export).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

folder = Path(sys.argv[1])
files = sorted(p for p in folder.glob("*.png") if p.parent.name != "src")
problems = []
sigs = {}
for p in files:
    im = Image.open(p).convert("RGB")
    if im.size != (2000, 2000):
        problems.append(f"{p.name}: {im.size[0]}x{im.size[1]}, expected 2000x2000")
    a = np.asarray(im.resize((64, 64))).astype(np.float32)
    if a.std() < 4:
        problems.append(f"{p.name}: looks blank (std {a.std():.1f})")
    sigs[p.name] = a
names = list(sigs)
for i in range(len(names) - 1):
    a, b = sigs[names[i]], sigs[names[i + 1]]
    if float(np.abs(a - b).mean()) < 1.5:
        problems.append(f"{names[i]} and {names[i+1]} are near-identical — stale export?")
print(f"{len(files)} slides in {folder}")
if len(files) != 20:
    problems.append(f"expected 20 slides, found {len(files)}")
for x in problems:
    print("  !", x)
print("  clean" if not problems else f"  {len(problems)} problem(s)")
sys.exit(1 if problems else 0)
