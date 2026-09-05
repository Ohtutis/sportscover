"""The plate's FOUR CORNERS, not a rotated rectangle.

A plate photographed at an angle is a perspective quadrilateral: its top edge is shorter than
its bottom edge, and its sides converge. `cv2.minAreaRect` cannot express that -- it returns
the smallest RECTANGLE that contains the blob, so a card warped into it sits square while the
holder around it recedes, and the eye reads it as pasted on. This module returns the polygon
the photograph actually has.

    from sr_quad import quad4
    q = quad4(img, dark=70, flat=10, near=quad_or_None)   # [x,y, x,y, x,y, x,y] or None
"""
import cv2
import numpy as np


def _order(p):
    s, d = p.sum(1), np.diff(p, axis=1).ravel()
    return np.float32([p[np.argmin(s)], p[np.argmin(d)], p[np.argmax(s)], p[np.argmax(d)]])


def plate_mask(img, dark=70, flat=10):
    """Flat AND dark is the plate -- the same test plates_composite uses for occlusion."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    mean = cv2.blur(g, (9, 9))
    std = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mean * mean, 0))
    m = ((g < dark) & (std < flat)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    return cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))


def quad4(img, dark=70, flat=10, near=None, min_frac=0.004, grow=1.35):
    """Corners of the largest plate component; `near` restricts the search to one plate."""
    m = plate_mask(img, dark, flat)
    if near is not None:
        P = np.float32(near).reshape(4, 2)
        (cx, cy), (w, h), ang = cv2.minAreaRect(P)
        box = np.zeros(m.shape, np.uint8)
        cv2.fillConvexPoly(box, cv2.boxPoints(((cx, cy), (w * grow, h * grow), ang)).astype(np.int32), 255)
        m = cv2.bitwise_and(m, box)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    best = None
    for i in range(1, n):
        a = st[i, cv2.CC_STAT_AREA]
        if a < m.size * min_frac:
            continue
        if best is None or a > best[0]:
            best = (a, i)
    if best is None:
        return None
    cnt = max(cv2.findContours((lab == best[1]).astype(np.uint8) * 255,
                               cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0], key=cv2.contourArea)
    peri = cv2.arcLength(cnt, True)
    for eps in (0.010, 0.015, 0.020, 0.030, 0.045, 0.060):
        ap = cv2.approxPolyDP(cnt, eps * peri, True)
        if len(ap) == 4:
            q = _order(ap.reshape(4, 2).astype(np.float32))
            # a true plate fills its own polygon; a merged blob does not
            probe = np.zeros(m.shape, np.uint8)
            cv2.fillConvexPoly(probe, q.astype(np.int32), 255)
            inside = float(cv2.bitwise_and(m, probe).sum()) / max(1.0, float(probe.sum()))
            if inside > 0.9:
                return [float(v) for pt in q for v in pt]
    return None
