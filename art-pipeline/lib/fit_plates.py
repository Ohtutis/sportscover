"""Fit card-shaped quads to the blank plates in a generated scene.

    .venv-matte/bin/python lib/fit_plates.py scene.png N [y0 y1] [aspect]

Reading quads off a coordinate grid by eye is what put the cards half off the hands twice.
A trading card has ONE shape — 2.5 x 3.5, aspect 0.714 — so the fit is constrained to that
shape and only position, size and rotation are searched. Score rewards plate pixels inside
the rect and punishes plate pixels just outside it, which stops a dark sleeve from being
swallowed into the card.
"""
import json
import sys

import cv2
import numpy as np

ASPECT = 0.714   # a trading card; pass an aspect to fit posters (0.75) instead


def plate_mask(img):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mean = cv2.blur(g, (9, 9))
    std = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mean * mean, 0))
    m = (g < 105) & (std < 20) & (hsv[:, :, 1] < 90)
    m = cv2.morphologyEx(m.astype(np.uint8) * 255, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    return m


def score(mask, cx, cy, w, ang):
    h = w / ASPECT
    inner = np.zeros(mask.shape, np.uint8)
    box = cv2.boxPoints(((cx, cy), (w, h), ang)).astype(np.int32)
    cv2.fillConvexPoly(inner, box, 255)
    outer = np.zeros(mask.shape, np.uint8)
    box2 = cv2.boxPoints(((cx, cy), (w * 1.35, h * 1.35), ang)).astype(np.int32)
    cv2.fillConvexPoly(outer, box2, 255)
    ring = cv2.bitwise_and(outer, cv2.bitwise_not(inner))
    ai = max(1, int(inner.sum() / 255))
    ar = max(1, int(ring.sum() / 255))
    hit = int(cv2.bitwise_and(mask, inner).sum() / 255) / ai
    spill = int(cv2.bitwise_and(mask, ring).sum() / 255) / ar
    return hit - 1.2 * spill


def fit_one(mask, seed, w0):
    cx, cy = seed
    best = (-9, cx, cy, w0, 0.0)
    for it, (dp, dw, da) in enumerate([(26, 0.30, 14), (10, 0.14, 6), (4, 0.06, 2.5), (2, 0.03, 1.0)]):
        c = best
        for x in np.arange(c[1] - dp, c[1] + dp + 1, max(1, dp / 3)):
            for y in np.arange(c[2] - dp, c[2] + dp + 1, max(1, dp / 3)):
                for w in np.arange(c[3] * (1 - dw), c[3] * (1 + dw) + 1, max(1.5, c[3] * dw / 3)):
                    for a in np.arange(c[4] - da, c[4] + da + 0.1, max(0.8, da / 3)):
                        s = score(mask, float(x), float(y), float(w), float(a))
                        if s > best[0]:
                            best = (s, float(x), float(y), float(w), float(a))
    return best


def main():
    global ASPECT
    if len(sys.argv) > 5:
        ASPECT = float(sys.argv[5])
    img = cv2.imread(sys.argv[1])
    want = int(sys.argv[2])
    y0 = int(sys.argv[3]) if len(sys.argv) > 4 else 0
    y1 = int(sys.argv[4]) if len(sys.argv) > 4 else img.shape[0]
    mask = plate_mask(img)
    band = np.zeros_like(mask)
    band[y0:y1] = 255
    m = cv2.bitwise_and(mask, band)
    n, lab, stats, cent = cv2.connectedComponentsWithStats(m, 8)
    blobs = sorted(range(1, n), key=lambda i: -stats[i, cv2.CC_STAT_AREA])
    seeds = []
    for i in blobs:
        a = stats[i, cv2.CC_STAT_AREA]
        if a < 1500:
            break
        seeds.append((cent[i], np.sqrt(a * ASPECT)))
        if len(seeds) >= want * 3:
            break
    out = []
    for (c, w0) in seeds:
        s, cx, cy, w, ang = fit_one(mask, (float(c[0]), float(c[1])), float(w0))
        if s < 0.30:
            continue
        if any(abs(cx - o["cx"]) < w * 0.8 and abs(cy - o["cy"]) < w for o in out):
            continue
        box = cv2.boxPoints(((cx, cy), (w, w / ASPECT), ang))
        p = box.astype(np.float32)
        ss, dd = p.sum(1), np.diff(p, axis=1).ravel()
        o = [p[np.argmin(ss)], p[np.argmin(dd)], p[np.argmax(ss)], p[np.argmax(dd)]]
        out.append({"score": round(float(s), 3), "cx": round(cx), "cy": round(cy),
                    "w": round(w), "ang": round(ang, 1),
                    "quad": [round(float(v), 1) for pt in o for v in pt]})
    out.sort(key=lambda r: -r["score"])
    print(json.dumps(out[:want], indent=1))


main()
