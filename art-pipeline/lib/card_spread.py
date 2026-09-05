"""Lay N real cards out on a real photograph of a table.

    .venv-matte/bin/python art-pipeline/lib/card_spread.py <table.png> <out.png> \
        --layout arc|rows --count 12 --front <front.png> --back <back.png>

WHY THIS INSTEAD OF GENERATING THE SPREAD. A generated fan of black plates is one connected black
blob: the cards overlap, so there is no way to measure where a single card is and warp the artwork
into it — every quad has to be guessed by eye, and it shows. Composing the spread here gives the
exact count, exact square corners, the real artwork on every card, and the same table under all
the tiles. The photograph supplies the surface, the light and the grain; we supply the geometry.
"""
import argparse
import math

import cv2
import numpy as np


def shadow(size, blur=26, spread=8):
    h, w = size
    s = np.zeros((h + 4 * blur, w + 4 * blur), np.float32)
    s[2 * blur - spread:2 * blur + h + spread, 2 * blur - spread:2 * blur + w + spread] = 1.0
    return cv2.GaussianBlur(s, (0, 0), blur)


def place(canvas, card, cx, cy, deg, scale, shade=1.0):
    """Rotate a card, drop a soft shadow under it, and composite it at (cx, cy)."""
    h, w = card.shape[:2]
    nw, nh = int(w * scale), int(h * scale)
    c = cv2.resize(card, (nw, nh), interpolation=cv2.INTER_AREA)
    c = (c.astype(np.float32) * shade).clip(0, 255).astype(np.uint8)
    pad = int(max(nw, nh) * 0.9)
    tile = np.zeros((nh + 2 * pad, nw + 2 * pad, 3), np.uint8)
    alpha = np.zeros(tile.shape[:2], np.float32)
    tile[pad:pad + nh, pad:pad + nw] = c
    alpha[pad:pad + nh, pad:pad + nw] = 1.0
    sh = shadow((nh, nw), blur=int(nw * 0.055), spread=int(nw * 0.012))
    shp = np.zeros_like(alpha)
    oy = (tile.shape[0] - sh.shape[0]) // 2 + int(nw * 0.035)
    ox = (tile.shape[1] - sh.shape[1]) // 2 + int(nw * 0.018)
    shp[oy:oy + sh.shape[0], ox:ox + sh.shape[1]] = sh
    M = cv2.getRotationMatrix2D((tile.shape[1] / 2, tile.shape[0] / 2), deg, 1.0)
    tile = cv2.warpAffine(tile, M, (tile.shape[1], tile.shape[0]))
    alpha = cv2.warpAffine(alpha, M, (alpha.shape[1], alpha.shape[0]))
    shp = cv2.warpAffine(shp, M, (shp.shape[1], shp.shape[0]))
    x0, y0 = int(cx - tile.shape[1] / 2), int(cy - tile.shape[0] / 2)
    H, W = canvas.shape[:2]
    xa, ya = max(0, x0), max(0, y0)
    xb, yb = min(W, x0 + tile.shape[1]), min(H, y0 + tile.shape[0])
    if xa >= xb or ya >= yb:
        return
    t = tile[ya - y0:yb - y0, xa - x0:xb - x0].astype(np.float32)
    a = alpha[ya - y0:yb - y0, xa - x0:xb - x0][:, :, None]
    s = np.clip(shp[ya - y0:yb - y0, xa - x0:xb - x0], 0, 1)[:, :, None]
    reg = canvas[ya:yb, xa:xb].astype(np.float32)
    reg = reg * (1 - 0.42 * s * (1 - a))          # shadow only where the card is not
    canvas[ya:yb, xa:xb] = (reg * (1 - a) + t * a).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("table"); ap.add_argument("out")
    ap.add_argument("--layout", default="arc"); ap.add_argument("--count", type=int, default=12)
    ap.add_argument("--front", required=True); ap.add_argument("--back", required=True)
    ap.add_argument("--size", type=int, default=1400)
    a = ap.parse_args()

    table = cv2.imread(a.table)
    table = cv2.resize(table, (a.size, a.size), interpolation=cv2.INTER_LANCZOS4)
    front = cv2.imread(a.front); back = cv2.imread(a.back)
    S = a.size
    cw = front.shape[1]

    if a.layout == "arc":
        # Owner, 2026-09-02: the fan alone never leaves a whole card readable — each one covers the
        # next. So TWO cards are drawn OUT of the fan and laid below it, one face and one back,
        # both complete; the rest stay a fan and carry the count.
        fan = a.count - 2
        scale = S * 0.205 / cw
        R = S * 0.40
        cx, cy = S * 0.5, S * 0.66
        span = 74.0
        pos = []
        for i in range(fan):
            t = i / (fan - 1)
            deg = -span / 2 + span * t
            ang = math.radians(-90 + deg)
            pos.append((i, cx + R * math.cos(ang), cy + R * math.sin(ang), deg, t))
        for i, x, y, deg, t in sorted(pos, key=lambda p: -p[1]):
            place(table, front, x, y, -deg * 0.62, scale, 0.96 + 0.04 * t)
        below = scale * 1.06
        place(table, front, S * 0.345, S * 0.775, -4, below)
        place(table, back,  S * 0.655, S * 0.775, 4, below)
    else:
        # Owner: top row all faces, bottom row all backs, one card apart above showing the face.
        scale = S * 0.185 / cw
        step = S * 0.046
        per = (a.count - 1) // 2
        place(table, front, S * 0.165, S * 0.175, -7, scale * 1.08)
        for r in range(2):
            y = S * (0.45 if r == 0 else 0.705)
            x0 = S * 0.54 - step * (per - 1) / 2
            for i in range(per):
                place(table, front if r == 0 else back,
                      x0 + step * i, y + (5 if i % 2 else -5),
                      -3 + (i % 3) * 2.5, scale, 0.96 + 0.04 * (i / per))
    cv2.imwrite(a.out, table)
    print(f"{a.out}  layout={a.layout} count={a.count} size={S}")


if __name__ == "__main__":
    main()
