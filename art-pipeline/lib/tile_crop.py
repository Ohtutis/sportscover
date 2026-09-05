"""Crop a product photograph to a SQUARE tile with its subject centred and at a set scale.

    .venv-matte/bin/python art-pipeline/lib/tile_crop.py <in.png> <out.png> [fill] [--pad-bottom N]

Why this exists: four listing tiles sit side by side in one row, and the eye reads them as a set.
A subject that is off-centre in its own photograph stays off-centre in the tile however the fill
is set in Figma — one laptop clipped at the edge, one pair of cards drifting low-left. So the
subject is MEASURED here (everything that differs from the background sampled at the border) and
the crop is built around it: same centre, same share of the frame, every tile.
"""
import sys

import cv2
import numpy as np


def subject_box(bgr, thr=26, dark=False):
    # On a wood table the grain and the window light differ from the border median as much as the
    # product does, so "not background" selects the whole frame. What the product actually is, in
    # every one of these shots, is the DARKEST thing on a light surface — measure that instead.
    if dark:
        g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        h, w = g.shape
        ring = np.ones((h, w), bool)
        m = int(min(h, w) * 0.055)
        ring[m:h - m, m:w - m] = False
        bg = float(np.median(g[ring]))
        mask = (g < bg - 45).astype(np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((11, 11), np.uint8))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((31, 31), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(mask, 8)
        keep = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 0.004 * h * w]
        if not keep:
            raise SystemExit("no dark subject found")
        return (int(min(st[i, cv2.CC_STAT_LEFT] for i in keep)),
                int(min(st[i, cv2.CC_STAT_TOP] for i in keep)),
                int(max(st[i, cv2.CC_STAT_LEFT] + st[i, cv2.CC_STAT_WIDTH] for i in keep)),
                int(max(st[i, cv2.CC_STAT_TOP] + st[i, cv2.CC_STAT_HEIGHT] for i in keep)))
    return _not_background(bgr, thr)


def _not_background(bgr, thr=26):
    h, w = bgr.shape[:2]
    ring = np.ones((h, w), bool)
    m = int(min(h, w) * 0.055)
    ring[m:h - m, m:w - m] = False
    bg = np.median(bgr[ring].reshape(-1, 3), 0)
    d = np.linalg.norm(bgr.astype(np.float32) - bg, axis=2)
    mask = (d > thr).astype(np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask, 8)
    keep = [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 0.004 * h * w]
    if not keep:
        raise SystemExit("no subject found")
    x0 = min(st[i, cv2.CC_STAT_LEFT] for i in keep)
    y0 = min(st[i, cv2.CC_STAT_TOP] for i in keep)
    x1 = max(st[i, cv2.CC_STAT_LEFT] + st[i, cv2.CC_STAT_WIDTH] for i in keep)
    y1 = max(st[i, cv2.CC_STAT_TOP] + st[i, cv2.CC_STAT_HEIGHT] for i in keep)
    return int(x0), int(y0), int(x1), int(y1)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    fill = float(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3][0].isdigit() else 0.76
    im = cv2.imread(src)
    H, W = im.shape[:2]
    x0, y0, x1, y1 = subject_box(im, dark="--dark" in sys.argv)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    side = max(x1 - x0, y1 - y0) / fill
    side = min(side, min(H, W))                       # never ask for pixels that are not there
    # keep the square inside the photograph, sliding rather than shrinking so the scale holds
    left = int(round(min(max(cx - side / 2, 0), W - side)))
    top = int(round(min(max(cy - side / 2, 0), H - side)))
    s = int(round(side))
    out = im[top:top + s, left:left + s]
    out = cv2.resize(out, (1400, 1400), interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(dst, out)
    print(f"{dst}  subject=({x0},{y0})-({x1},{y1})  side={s}  fill={max(x1-x0, y1-y0)/s:.2f}")


if __name__ == "__main__":
    main()
