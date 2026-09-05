#!/usr/bin/env python3
"""Person masks for the athlete's BEFORE photos (rembg, CPU-pinned — CoreML hangs forever).
    .venv-matte/bin/python etsy/video/person_mask.py <slug> <out_dir>
Writes <out_dir>/<slug>-photoN.png (L mask, 255 = person). Used by the flat gallery beat to
choose scenery fillers that contain nobody — a skin heuristic let half a face through."""
import os, sys
from PIL import Image
from rembg import new_session, remove
slug, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
sess = new_session("birefnet-general", providers=["CPUExecutionProvider"])
for k in range(1, 5):
    src = f"art-pipeline/out/athletes/{slug}/before/photo{k}.png"
    dst = f"{out}/{slug}-photo{k}.png"
    if os.path.exists(dst): continue
    im = Image.open(src).convert("RGB")
    im.thumbnail((1024, 1024))
    m = remove(im, session=sess, only_mask=True)
    m.resize(Image.open(src).size, Image.BILINEAR).save(dst)
    print("mask", dst)
