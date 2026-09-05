"""Measure the black plate in a generated "holding a blank card" photograph.

    .venv-matte/bin/python art-pipeline/lib/plate_quad.py <photo.png> [--debug]

Prints a ready-to-paste `--quad x1,y1,...` for lib/card_in_hand.py.

WHY THIS EXISTS. card_in_hand.py finds the plate by scanning thresholds and openings and keeping
the blob whose convex hull is card-shaped. That search is robust to a hand biting into the plate,
but it is a SEARCH: it has twice locked onto the wrong candidate — a dark background merged with
the plate (cheerleading, fit ~50 px low) and a dark hoodie-and-hair region (football, ~500 px
high). Both passed every shape test, because both really were card-shaped.

This does the opposite: it does not search. It takes the single darkest large blob, and fits the
four EDGES by least squares on the segments a hand is not touching, then intersects the lines.
Fitting lines beats fitting a rectangle to a bitten blob, because the bite moves a rectangle's
corner but leaves the line through the surviving edge exactly where it was.

The output is a measurement to be checked by eye, not a promise — always look at the composite.
"""
import sys

import cv2
import numpy as np

CARD_ASPECT = 750 / 1050
PURE = 45          # a matte black plate; the darkest thing in the picture by construction
MIN_FRAC = 0.008   # of the whole picture, below which a blob is not the card


def plate_blob(bgr):
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    H, W = g.shape
    m = (g < PURE).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    best, best_score = None, -1.0
    for i in range(1, n):
        x, y, w, h, a = stats[i]
        if a < MIN_FRAC * W * H:
            continue
        if x <= 2 or y <= 2 or x + w >= W - 2 or y + h >= H - 2:
            continue                                  # scenery running off the frame
        if not (0.45 < w / max(h, 1) < 1.05):
            continue                                  # a card is portrait
        score = a / float(w * h)                      # how rectangle-like the blob is
        if score > best_score:
            best, best_score = i, score
    if best is None:
        raise SystemExit("no plate found — is the card actually matte black in this photograph?")
    return (lab == best).astype(np.uint8), stats[best]


def fit_edges(mask):
    """Fit the four edge lines, using only the stretches a hand is not eating into."""
    ys, xs = np.nonzero(mask)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()

    def side(pick, axis_range, along_rows):
        pts = []
        for v in axis_range:
            line = mask[v] if along_rows else mask[:, v]
            nz = np.nonzero(line)[0]
            if len(nz):
                pts.append((nz[pick], v) if along_rows else (v, nz[pick]))
        return pts

    # only the upper two-thirds of the sides: below that the hand is in the way
    ymid = int(y0 + (y1 - y0) * 0.68)
    L = side(0, range(y0, ymid, 2), True)
    R = side(-1, range(y0, ymid, 2), True)
    T = side(0, range(x0, x1, 2), False)

    def robust(pts, vertical):
        """Least squares, then drop the worst third and refit — the hand is the outlier."""
        a = np.array(pts, float)
        for _ in range(3):
            if vertical:
                coef = np.polyfit(a[:, 1], a[:, 0], 1)
                err = np.abs(np.polyval(coef, a[:, 1]) - a[:, 0])
            else:
                coef = np.polyfit(a[:, 0], a[:, 1], 1)
                err = np.abs(np.polyval(coef, a[:, 0]) - a[:, 1])
            keep = err <= np.percentile(err, 67)
            if keep.sum() < 8:
                break
            a = a[keep]
        return coef

    mL, mR = robust(L, True), robust(R, True)
    mT = robust(T, False)

    def cross(vert, horiz):
        m1, c1 = vert            # x = m1*y + c1
        m2, c2 = horiz           # y = m2*x + c2
        y = (m2 * c1 + c2) / (1 - m1 * m2)
        return m1 * y + c1, y

    tl, tr = cross(mL, mT), cross(mR, mT)

    # The BOTTOM edge is never measured. In this whole family of shots the hand grips the bottom,
    # so "the last black pixel in this column" is the top of a thumb, not the edge of the card —
    # that is what skewed both earlier fits. Left, right and top are clean, and the card's aspect
    # is known, so the fourth edge is DERIVED: slide down each side edge by the height a card of
    # this width must have. A measured wrong number is worse than a computed right one.
    w = float(np.hypot(tr[0] - tl[0], tr[1] - tl[1]))
    h = w / CARD_ASPECT

    def down(coef):
        """Unit vector pointing down along a line given as x = m*y + c."""
        m = coef[0]
        v = np.array([m, 1.0])
        return v / np.linalg.norm(v)

    bl = tuple(np.array(tl) + down(mL) * h)
    br = tuple(np.array(tr) + down(mR) * h)
    return [tl, tr, br, bl]


if __name__ == "__main__":
    p = sys.argv[1]
    img = cv2.imread(p)
    if img is None:
        raise SystemExit(f"cannot read {p}")
    mask, st = plate_blob(img)
    q = fit_edges(mask)
    (tlx, tly), (trx, try_), (brx, bry), (blx, bly) = q
    w = ((trx - tlx) + (brx - blx)) / 2
    h = ((bly - tly) + (bry - try_)) / 2
    print(f"{p}  plate {w:.0f}x{h:.0f}  aspect {w / h:.4f}  (a card is 0.714)")
    print("--quad " + ",".join(f"{v:.1f}" for pt in q for v in pt))
    if "--debug" in sys.argv:
        vis = img.copy()
        cv2.polylines(vis, [np.int32(q)], True, (0, 0, 255), 3)
        out = p.replace(".png", ".quad.png")
        cv2.imwrite(out, vis)
        print("wrote " + out)
