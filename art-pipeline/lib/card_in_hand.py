"""Put the REAL card into a photograph of someone holding a BLANK BLACK one.

    .venv-matte/bin/python lib/card_in_hand.py <photo.png> <card.png> <out.png>
        [--quad x1,y1,...]   corners by hand, if the plate is ever unfindable
        [--debug]            also write <out>.mask.png and draw the quad
        [--strict]           exit non-zero when the audit finds a problem

WHY A BLACK PLATE, AND WHY THAT IS THE WHOLE TRICK
The card is the product. Asked to draw a card it can see in a reference, the model reproduces the
artwork well and the TYPE badly — "MILLBROOK BISON" came back as "MELLROCOK BTODA". So the
photograph is generated holding a blank plate and the real export is warped in here, where every
glyph is ours.

The first version of this file generated a GREY plate and then tried to work out which pixels
were fingers: by colour distance, by saturation, by skin chroma, by distance transforms. Every one
of those is a guess and each failed differently. A shadowed corner of a grey plate is as dark as a
finger, so the corner got cut off in a straight line. A grey T-shirt behind a grey plate merges
with it, so the region grew into the shirt. A thumb across the corner was either painted over —
and the card stopped looking held — or cut into the artwork.

Generating the plate MATTE PURE BLACK removes the guessing, which is what a retoucher would have
done with a mask twenty years ago:

    the black pixels ARE the card's visible area
    anything inside the card that is NOT black IS in front of it

No colour model, no thresholds to tune per photograph, no morphology to speak of. The mask carries
the thumb's true silhouette, the gaps between fingers and the die's rounded corners, because it is
a photograph of exactly those things. The card is warped into the quad recovered from the CONVEX
HULL of that black region: fingers only ever cut inward, so the hull restores the full rectangle
the plate would have had if nothing were in front of it.

The illumination transfer is kept from the old one-off `figma/etsy-s03-card-inpaint.py`, for the
reason recorded there: a per-pixel or blurred ratio carries the plate's own shading across as a
ghost, while a 2nd-order surface can hold a room's light falloff and cannot draw a subject.
"""
import sys

import cv2
import numpy as np

CARD_ASPECT = 750 / 1050   # every GDE card, trimmed
BLACK_MAX = 70             # a matte black plate sits well under this; skin and kit well over
FEATHER = 1.1              # px of edge softening, so the card is not visibly die-cut in
HAND_KERNEL = 17           # no finger is thinner than this; every other gap in the plate is
HAND_GROW = 21             # grow the hand back by the rim the opening took off, and no further:
                           # unbounded, it floods along any letter a thumb happens to touch
PLATE_CLOSE = 27           # fills the notches a generated plate edge carries, keeps the edge
PAD_MAX = 14.0             # px the card may stand beyond the measured plate: enough for a rounded
                           # corner and a soft edge, not enough for a slack fit to show as a band


def order_quad(p):
    """TL, TR, BR, BL."""
    s, d = p.sum(1), np.diff(p, axis=1).ravel()
    return np.float32([p[np.argmin(s)], p[np.argmin(d)], p[np.argmax(s)], p[np.argmax(d)]])


def _aspect(q):
    w = (np.linalg.norm(q[1] - q[0]) + np.linalg.norm(q[2] - q[3])) / 2
    h = (np.linalg.norm(q[3] - q[0]) + np.linalg.norm(q[2] - q[1])) / 2
    return w / max(h, 1e-6)


def quad_from_hull(hull):
    """The card's four corners.

    Fingers cut INTO the outline, so the work starts from the convex hull. But a thumb can eat a
    whole CORNER, and then the hull has no corner there to recover: the polygon approximation
    returns a four-sided shape with one edge sloping across the bite, and the card gets warped
    into a wedge. That is what the first black-plate take did.

    The card's aspect ratio is the one thing we know for certain, so it is used as the referee:
    take both the polygon fit and the minimum-area rectangle, keep whichever is closer to a
    card's proportions, and if it is still off, correct it — the rectangle stays where it is and
    keeps its angle, it is only made to hold the card's true shape.
    """
    peri = cv2.arcLength(hull, True)
    cands = []
    for eps in (0.01, 0.015, 0.02, 0.03, 0.04, 0.06):
        ap = cv2.approxPolyDP(hull, eps * peri, True)
        if len(ap) == 4 and cv2.isContourConvex(ap):
            cands.append(order_quad(ap.reshape(4, 2).astype(np.float32)))
            break
    rect = cv2.minAreaRect(hull)
    cands.append(order_quad(cv2.boxPoints(rect).astype(np.float32)))
    q = min(cands, key=lambda c: abs(_aspect(c) - CARD_ASPECT))
    if abs(_aspect(q) - CARD_ASPECT) <= CARD_ASPECT * 0.04:
        return q

    # Still wrong: rebuild the rectangle at the card's own aspect — same centre, same area, and
    # the card's LONG side along the blob's long side, so it covers what the plate covered
    # without stretching the artwork.
    #
    # The angle is the part that bites. For an OpenCV rect ((cx,cy),(w,h),theta) the w-side lies
    # at theta and the h-side at theta+90. A card's long side is its HEIGHT, so theta must be
    # (direction of the long side) - 90. Setting theta to the long side's own direction instead
    # lays the card down sideways, which is what turned a 378x552 plate into a 541x386 card.
    (cx, cy), (rw, rh), ang = rect
    long_ang = (ang + 90) if rh >= rw else ang
    # Size it to CONTAIN the plate, not merely to match its area: a plate measured at 0.685
    # against a card's 0.714 leaves a hairline of black along one pair of edges otherwise, and
    # that hairline is the blank plate surviving into the listing.
    long_side, short_side = max(rw, rh), min(rw, rh)
    h = max(long_side, short_side / CARD_ASPECT)
    w = CARD_ASPECT * h
    return order_quad(cv2.boxPoints(((cx, cy), (w, h), long_ang - 90)).astype(np.float32))


def find_black_plate(bgr):
    """Return (mask of the plate's VISIBLE black pixels, quad of the whole card).

    The plate is the largest dark blob whose convex hull has a card's proportions and fills that
    hull like a rectangle. The fill test is what separates a card from a shadow: a shadow is a
    puddle, a card is a rectangle with bites taken out of it.

    Two axes are searched, because one is never enough. The THRESHOLD decides how much of the
    scene counts as dark; the OPENING decides whether the card stays joined to whatever dark
    thing it happens to overlap. On the football take the card sat against a group of dark
    figures and no threshold could separate them — an 11 px opening severed the bridge at once.
    """
    H, W = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    best = None
    for thr in (BLACK_MAX, BLACK_MAX + 25, BLACK_MAX + 50, BLACK_MAX - 25):
        for k in (5, 11, 17):
            m = (gray < thr).astype(np.uint8) * 255
            m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((k, k), np.uint8))
            n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
            for i in range(1, n):
                area = int(stats[i, cv2.CC_STAT_AREA])
                if area < W * H * 0.008 or area > W * H * 0.25:
                    continue
                # A card held in a hand sits in the middle of the picture. Anything touching the
                # frame edge is scenery: the open boot of a car read as a perfectly card-shaped
                # dark rectangle and swallowed a third of one take.
                bx, by = int(stats[i, cv2.CC_STAT_LEFT]), int(stats[i, cv2.CC_STAT_TOP])
                bw, bh = int(stats[i, cv2.CC_STAT_WIDTH]), int(stats[i, cv2.CC_STAT_HEIGHT])
                if bx <= 2 or by <= 2 or bx + bw >= W - 2 or by + bh >= H - 2:
                    continue
                comp = (lab == i).astype(np.uint8) * 255
                cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                if not cnts:
                    continue
                hull = cv2.convexHull(max(cnts, key=cv2.contourArea))
                hull_area = cv2.contourArea(hull)
                if hull_area <= 0:
                    continue
                (_, _), (rw, rh), ang = cv2.minAreaRect(hull)
                if min(rw, rh) < 1:
                    continue
                ratio = min(rw, rh) / max(rw, rh)
                if not (CARD_ASPECT * 0.72 <= ratio <= CARD_ASPECT * 1.28):
                    continue
                # The card is held PORTRAIT, so its long side is roughly vertical. Without this a
                # landscape blob — a mat, a doorway, a band of shadow — has exactly the same
                # min/max ratio as a card and gets the artwork laid into it sideways.
                long_ang = (ang + 90) if rh >= rw else ang
                d = (long_ang - 90) % 180                     # 90 deg IS vertical
                if min(d, 180 - d) > 40:
                    continue
                if hull_area < rw * rh * 0.86:      # a card fills its own bounding rectangle
                    continue
                if area < hull_area * 0.55:         # fingers may bite it, but not eat half of it
                    continue
                if best is None or hull_area > best[0]:
                    best = (hull_area, comp, quad_from_hull(hull))
    if best is None:
        return None, None
    return best[1], best[2]


def plate_pixels(gray, seed_quad):
    """EVERY pixel of the black plate, as one object.

    find_black_plate above locates it; this measures it. The difference matters: the locator is
    allowed to be a few px off, and the mask is not — the mask IS the card's silhouette, so a
    pixel of plate it misses prints as a black crumb, and a pixel it invents prints over a finger.

    Measured by HYSTERESIS, not by one threshold. A plate is not one shade: it is lit, so a corner
    turned away from the light sits 20 levels brighter than the middle. A single strict threshold
    dropped exactly those corners, the fitted card came out short of them, and the uncovered plate
    printed as a black L past the card's edge — while the audit, reading the same too-strict mask,
    reported nothing left over. So take the plate's own level from the middle of the located area,
    grow outward through everything within reach of it, and fall back to the strict core if that
    growth escapes into the room.
    """
    H, W = gray.shape
    seed = np.zeros((H, W), np.uint8)
    cv2.fillConvexPoly(seed, seed_quad.astype(np.int32), 1)
    seed = cv2.erode(seed, np.ones((25, 25), np.uint8))       # the middle of the card only
    if seed.sum() < 100:
        return None, 0.0
    lvl = float(np.median(gray[seed > 0]))                    # the plate's own black

    def component(mask):
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(mask, 8)
        best = None
        for i in range(1, n):
            comp = (lab == i).astype(np.uint8)
            if (comp & seed).sum() < 0.2 * seed.sum():
                continue                                      # not the blob we located
            if best is None or st[i, cv2.CC_STAT_AREA] > best[1]:
                best = (comp, st[i, cv2.CC_STAT_AREA])
        return None if best is None else best[0]

    core = component(cv2.morphologyEx((gray < lvl + 16).astype(np.uint8), cv2.MORPH_OPEN,
                                      np.ones((5, 5), np.uint8)))
    if core is None:
        return None, lvl
    loose = component((gray < lvl + 58).astype(np.uint8))
    if loose is None:
        return core, lvl
    pts = np.argwhere(loose)[:, ::-1].astype(np.float32)
    (_, _), (rw, rh), _ = cv2.minAreaRect(cv2.convexHull(pts))
    fill = float(loose.sum()) / max(rw * rh, 1.0)
    if loose.sum() > 1.8 * core.sum() or fill < 0.82:
        return core, lvl                                      # the growth escaped: trust the core
    return loose, lvl


def push_out(q, pts, pad=1.5, keep=92.0):
    """Slide each of the four edges outward until the quad holds every plate pixel.

    Containment done on the EDGES, not on a bounding box, because the plate in these photographs
    is a perspective quad and not a rotated rectangle — its top edge is genuinely shorter than its
    bottom. Fitting a rotated rectangle to it left slack on one side and a shortfall on the other,
    and the shortfall printed as a black L past the card's corner.
    """
    c = q.mean(0)
    lines = []
    for i in range(4):
        a, b = q[i], q[(i + 1) % 4]
        d = b - a
        n = np.array([d[1], -d[0]], float)
        n /= (np.linalg.norm(n) or 1.0)
        if float(n @ (a - c)) < 0:
            n = -n                                            # outward
        # A PERCENTILE, not the maximum. Pushed to the outermost plate pixel, an edge stands 8-10
        # px clear of the plate everywhere else — and that band is wide enough for the hand mask's
        # own growth to bite notches out of it, which print as little dark tabs hanging under the
        # card. At the 92nd percentile the edge sits on the plate's actual boundary; the couple of
        # pixels of soft edge that then fall outside the card are the plate's antialiasing, and
        # they are invisible.
        off = float(np.percentile((pts - a) @ n, keep))
        lines.append((n, float(n @ a) + max(off, 0.0) + pad))
    out = []
    for i in range(4):
        (n1, c1), (n2, c2) = lines[i - 1], lines[i]
        out.append(np.linalg.solve(np.array([n1, n2]), [c1, c2]))
    return np.float32(out)


def _edge_line(x, y, outward):
    """The line along one edge of the plate, fitted to its OUTER envelope.

    Not a symmetric robust fit. Every error here has one sign: a finger can only eat INTO the
    plate, never extend it, so every sample a finger touches lies on the inner side and the true
    edge is the outermost run of samples. A fit that trims the worst residuals on both sides
    splits the difference with the fingers — on the soccer take that tilted the bottom edge by a
    degree, which hugs the plate at one end and stands fifteen pixels clear at the other, and the
    wedge between printed as a black band. So drop the inner half and refit, twice: the line walks
    out to the envelope while still averaging over hundreds of points rather than chasing three.

    `outward` is +1 when the edge lies at larger y (bottom, right) and -1 when at smaller (top,
    left).
    """
    x, y = np.asarray(x, float), np.asarray(y, float)
    coef = np.polyfit(x, y, 1)
    for _ in range(3):
        resid = (y - np.polyval(coef, x)) * outward
        keep = resid >= np.percentile(resid, 45)
        if keep.sum() < 12:
            break
        x, y = x[keep], y[keep]
        coef = np.polyfit(x, y, 1)
    return coef


def fit_containing(comp):
    """The card's four corners: fit the four EDGES, then grow until they hold all of the plate.

    Not a rotated rectangle (the plate is a perspective quad — one edge really is shorter than
    its opposite), and not a polygon fitted to the convex hull either: a finger eats a corner,
    the hull cuts straight across the bite, and the polygon puts the corner 100 px inside the
    card. An EDGE survives what a corner does not — the fingers touch a stretch of it and leave
    the rest exactly where it was, so each edge is fitted from its own middle with the outliers
    dropped, and the corners are where the lines meet.

    A card a hair too large is invisible, because the mask clips it back to the plate. A card a
    hair too small is the black crumb the customer kept finding at the edge of a finger.
    """
    pts = np.argwhere(comp)[:, ::-1].astype(np.float64)       # x, y
    hull = cv2.convexHull(pts.astype(np.float32))
    box = cv2.boxPoints(cv2.minAreaRect(hull))
    edges = [box[(i + 1) % 4] - box[i] for i in range(4)]
    i = int(np.argmax([np.linalg.norm(e) for e in edges[:2]]))
    v = edges[i] / np.linalg.norm(edges[i])                   # along the card's height
    if v[1] < 0:
        v = -v                                                # v points DOWN the picture...
    u = np.array([v[1], -v[0]])                               # ...so u points right, and the
    #                                                           corners come out TL, TR, BR, BL.
    #                                                           Without this the axes could come
    #                                                           back flipped and the artwork was
    #                                                           warped in upside down.
    c = pts.mean(0)
    pu, pv = (pts - c) @ u, (pts - c) @ v

    def extremes(key, val):
        k = np.round(key).astype(int)
        k -= k.min()
        lo = np.full(k.max() + 1, np.inf)
        hi = np.full(k.max() + 1, -np.inf)
        np.minimum.at(lo, k, val)
        np.maximum.at(hi, k, val)
        ok = np.isfinite(lo)
        ks = np.nonzero(ok)[0] + int(np.round(key).min())
        return ks.astype(float), lo[ok], hi[ok]

    # only the middle of each side: the fingers grip the ends
    kv, umin, umax = extremes(pv, pu)
    m = (kv > np.percentile(kv, 8)) & (kv < np.percentile(kv, 92))
    left, right = _edge_line(kv[m], umin[m], -1), _edge_line(kv[m], umax[m], +1)
    ku, vmin, vmax = extremes(pu, pv)
    m = (ku > np.percentile(ku, 8)) & (ku < np.percentile(ku, 92))
    top, bottom = _edge_line(ku[m], vmin[m], -1), _edge_line(ku[m], vmax[m], +1)

    def meet(side, cap):
        """side: u = a*v + b.  cap: v = p*u + q.  Solve for the corner."""
        a, b = side
        p, q = cap
        vv = (p * b + q) / (1 - p * a)
        return np.array([a * vv + b, vv])

    quad_uv = [meet(left, top), meet(right, top), meet(right, bottom), meet(left, bottom)]
    quad = np.float32([c + p[0] * u + p[1] * v for p in quad_uv])
    return push_out(quad, hull.reshape(-1, 2).astype(np.float64))


def relight(orig, new, mask, quad):
    """Match the card to the photograph's light with a quadratic surface only."""
    ys, xs = np.nonzero(mask)
    if len(xs) < 400:
        return new
    ys, xs = ys[::7], xs[::7]
    cx0, cy0 = quad[:, 0].mean(), quad[:, 1].mean()
    sx = np.ptp(quad[:, 0]) or 1.0
    sy = np.ptp(quad[:, 1]) or 1.0
    nx, ny = (xs - cx0) / sx, (ys - cy0) / sy
    A = np.stack([np.ones_like(nx), nx, ny, nx * nx, nx * ny, ny * ny], 1)
    gy, gx = np.mgrid[0:orig.shape[0], 0:orig.shape[1]]
    GX, GY = (gx - cx0) / sx, (gy - cy0) / sy
    B = np.stack([np.ones_like(GX), GX, GY, GX * GX, GX * GY, GY * GY], 2)
    # A black plate carries very little signal, so read the light from its own faint gradient
    # and clamp hard: a card must not be relit into something darker or brighter than it is.
    # ONE gain for all three channels. Fitting per channel let the surface push blue up 30 %
    # while pulling red and green down 20 % — a dusk photograph turned the card's cream name
    # violet, and the customer saw it before the audit did. Shading is luminance; the card's
    # own colours are the product and are not up for grabs.
    lo = cv2.GaussianBlur(orig, (0, 0), 12)
    lum = lo.mean(2)
    base = float(np.median(lum[mask])) + 1e-3
    r = np.clip(lum[ys, xs] / base, 0.90, 1.12)
    coef, *_ = np.linalg.lstsq(A, r, rcond=None)
    surf = np.clip(B @ coef, 0.90, 1.12)
    return np.clip(new * surf[:, :, None], 0, 255)


def face_width(bgr):
    """The person's face width in pixels — the ruler a card's size is judged against.

    THE PERSON IS THE RULER (the same rule the listing scale sheet runs on). The previous measure
    used the region the hand covered, which only works when something is in the way: with a clean
    side-edge grip the occlusion is a sliver and the metric called a 2.5 in card ten fingers wide.
    A face is always in these photographs, always about 4.7 in across, and is measured by a model
    that does nothing else. Returns 0.0 when there is no face to measure, and the check is skipped.
    """
    try:
        from insightface.app import FaceAnalysis
    except Exception:
        return 0.0
    global _FACE_APP
    if _FACE_APP is None:
        import contextlib
        import io as _io
        with contextlib.redirect_stdout(_io.StringIO()):
            _FACE_APP = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
            _FACE_APP.prepare(ctx_id=-1, det_size=(640, 640))
    faces = _FACE_APP.get(bgr)
    if not faces:
        return 0.0
    return float(max(f.bbox[2] - f.bbox[0] for f in faces))


_FACE_APP = None


def main():
    photo_p, card_p, out_p = sys.argv[1], sys.argv[2], sys.argv[3]
    photo = cv2.imread(photo_p)
    if photo is None:
        raise SystemExit(f"cannot read {photo_p}")
    card = cv2.imread(card_p, cv2.IMREAD_UNCHANGED)
    if card is None:
        raise SystemExit(f"cannot read {card_p}")
    if card.shape[2] == 4:                       # flatten a transparent export onto black
        a = card[:, :, 3:4].astype(np.float32) / 255.0
        card = (card[:, :, :3].astype(np.float32) * a).astype(np.uint8)

    H, W = photo.shape[:2]
    gray = cv2.cvtColor(photo, cv2.COLOR_BGR2GRAY)

    _, seed = find_black_plate(photo)
    if "--quad" in sys.argv:
        nums = [float(v) for v in sys.argv[sys.argv.index("--quad") + 1].split(",")]
        if len(nums) != 8:
            raise SystemExit("--quad needs 8 numbers: x1,y1,x2,y2,x3,y3,x4,y4")
        seed = order_quad(np.float32(nums).reshape(4, 2))
    if seed is None:
        raise SystemExit(
            "no black card found. The photograph must be generated holding a MATTE PURE BLACK "
            "blank plate — a grey one cannot be told apart from a grey shirt. Regenerate it, or "
            "pass --quad x1,y1,x2,y2,x3,y3,x4,y4.")

    plate, lvl = plate_pixels(gray, seed)
    if plate is None:
        raise SystemExit("located a plate but could not measure it — pass --quad, or regenerate")
    quad = fit_containing(plate)

    # --- warp the real card into the recovered rectangle ---------------------------
    ch, cw = card.shape[:2]
    src = np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]])
    M = cv2.getPerspectiveTransform(src, quad)
    warp = cv2.warpPerspective(card, M, (W, H), flags=cv2.INTER_LANCZOS4)
    # The card's outline, drawn at SUB-PIXEL accuracy. A polygon rasterised to whole pixels has a
    # staircase along any edge that is not axis-aligned — one step every 40 px on a shallow slope —
    # and the feather below turns each step into a little dark tab hanging under the card. The
    # photograph has nothing there; the staircase does. Supersampling by four and averaging gives
    # a straight edge with a real fractional coverage at its boundary.
    big = np.zeros((H * 2, W * 2), np.uint8)
    cv2.fillConvexPoly(big, (quad * 2).astype(np.int32), 255, lineType=cv2.LINE_AA)
    rect_aa = cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    rect = (rect_aa > 0.5).astype(np.uint8) * 255
    card_px = max(int((rect > 0).sum()), 1)

    # --- THE CARD IS THE RECTANGLE; THE HAND IS WHAT IS SUBTRACTED -------------------
    # The photograph is generated holding a blank black plate, and the plate is what tells us
    # where a finger is: everything inside the card's outline that is NOT plate is either
    # something in front of the card, or a place the plate itself fell short of the card's true
    # shape. The second kind is common, and it is not optional — the model draws the plate with
    # ROUNDED corners however firmly the prompt says square, its edge fades over two or three
    # pixels, and it prints a name on a card it was told to leave blank.
    #
    # So the question is not "where is the plate" but "where is the HAND", and the card is
    # everything else inside its own rectangle. Reading it the other way round — mask = plate,
    # plus a list of exceptions for corners and ink and hairlines — is what cost this file a
    # session: every exception was an area or a distance test, and every one of them was wrong
    # somewhere. It rounded the corners of a square-cut card, it clipped the keyline printed a
    # few pixels in from the edge, and where an exception fired it did not belong, it laid the
    # card's own black border across a fingertip.
    #
    # A hand is THICK, and it reaches in from the OUTSIDE. Nothing else in that gap is: a rounded
    # corner is a nick, an antialiased edge is a hairline, a letter is a stroke. So open the gap
    # with a kernel no finger is thinner than — what survives is hand and only hand — then grow it
    # back to recover the rim the opening took off, bounded, so that letters merely TOUCHING a
    # thumb are not swallowed with it.
    #
    # One cap, and only one: the card may exceed the measured plate by at most PAD_MAX pixels.
    # It is a SAFETY NET, not the shape: the shape is the straight-edged rectangle, and the cap
    # only stops a pathological fit from printing a wedge. Set tight (8 px) it did the opposite —
    # it made the plate's own wavy generated edge the card's edge, and hung a row of little dark
    # tabs under the bottom. The plate is closed first for the same reason.
    gap = ((rect > 0) & (plate == 0)).astype(np.uint8)
    core = cv2.morphologyEx(gap, cv2.MORPH_OPEN, np.ones((HAND_KERNEL, HAND_KERNEL), np.uint8))
    hand = (cv2.dilate(core, np.ones((HAND_GROW, HAND_GROW), np.uint8)) > 0) & (gap > 0)
    # Measured against a CLOSED plate. The plate's own outline is ragged by two or three pixels —
    # a generated edge, not a cut one — and a cap measured off it inherits every notch, hanging a
    # row of little tabs under the card's bottom edge. Closing fills notches narrower than the
    # kernel and leaves the edge where it was.
    plate_s = cv2.morphologyEx(plate.astype(np.uint8), cv2.MORPH_CLOSE,
                               np.ones((PLATE_CLOSE, PLATE_CLOSE), np.uint8))
    d_plate = cv2.distanceTransform((plate_s == 0).astype(np.uint8), cv2.DIST_L2, 5)
    paint = ((rect > 0) & ~hand & (d_plate <= PAD_MAX)).astype(np.uint8) * 255
    filled = int((paint > 0).sum() - (plate > 0).sum())

    lit = relight(photo.astype(np.float32), warp.astype(np.float32), paint > 127, quad)
    alpha = cv2.GaussianBlur(paint, (0, 0), FEATHER).astype(np.float32) / 255.0
    # The feather may soften the card's edge; it may not push the card PAST it. Clipping to the
    # sub-pixel outline is what keeps the outer edge a straight line instead of a row of tabs.
    alpha = np.minimum(alpha, rect_aa)
    # A real card's edge against a finger is CRISP — it is an occlusion, not a soft join. Only the
    # outer edge, against the background, gets the feather.
    alpha[hand] = 0.0
    alpha = alpha[:, :, None]
    out = (photo.astype(np.float32) * (1 - alpha) + lit * alpha).astype(np.uint8)

    # --- audit ---------------------------------------------------------------------
    occluded = (rect > 0) & (paint <= 127)
    occl_frac = occluded.sum() / float(card_px)
    # HOW WELL THE CARD SITS ON THE PLATE, in pixels. "Is any plate left over" cannot be asked of
    # the same mask the card was built from — it answers no by construction, and it answered no
    # while a black L stood past the corner. Asking "is anything dark near the card" instead cried
    # wolf at every drop shadow. So measure the fit itself: how far each edge of the fitted card
    # stands off the nearest plate pixel. A tight fit is under a pixel or two; the rotated-
    # rectangle fit that shipped the black L stood off by fifteen.
    d2plate = cv2.distanceTransform((plate == 0).astype(np.uint8), cv2.DIST_L2, 5)
    edge_pts = []
    for i in range(4):
        a, b = quad[i], quad[(i + 1) % 4]
        t = np.linspace(0.06, 0.94, 60)[:, None]
        edge_pts.append(a + (b - a) * t)
    ep = np.concatenate(edge_pts)
    ctr = quad.mean(0)
    inward = ep + (ctr - ep) / np.linalg.norm(ctr - ep, axis=1)[:, None] * 9.0
    ep = np.clip(ep, [0, 0], [W - 1, H - 1]).astype(int)
    inward = np.clip(inward, [0, 0], [W - 1, H - 1]).astype(int)
    # Only where the plate is actually there to measure against. A finger gripping an edge is not
    # a fit error, and counting it made every clean composite look like a miss.
    lit_edge = plate[inward[:, 1], inward[:, 0]] > 0
    standoff = float(np.percentile(d2plate[ep[lit_edge, 1], ep[lit_edge, 0]], 90)) \
        if lit_edge.sum() > 40 else 0.0
    leftover_frac = 0.0

    wid = (np.linalg.norm(quad[1] - quad[0]) + np.linalg.norm(quad[2] - quad[3])) / 2
    hei = (np.linalg.norm(quad[3] - quad[0]) + np.linalg.norm(quad[2] - quad[1])) / 2
    aspect = wid / max(hei, 1e-6)
    frac = card_px / float(H * W)

    # BLEED: card ink standing where the photograph had none. Every defect the customer found at
    # 100 % zoom was this — a black dash on a fingertip, a sawtooth along an edge, a hook hanging
    # off a corner. It is measurable exactly: a pixel that is dark in the composite, was bright in
    # the photograph, is not plate, and is not deep inside the card (where covering the model's own
    # printed name is the whole point). Judged by the BIGGEST blob, not the total: one 20x4 bar is
    # what gets noticed, a scatter of single pixels is not.
    edge_out = ((gray.astype(np.int16) - cv2.cvtColor(out, cv2.COLOR_BGR2GRAY).astype(np.int16)) > 50)
    # Two exemptions, both deliberate: deep inside the card, covering the model's own printed name
    # is the whole point; and within PAD_MAX of the plate, the card is allowed to stand slightly
    # proud of it — that is the rounded corner and the soft edge being squared off.
    deep = cv2.erode(rect, np.ones((31, 31), np.uint8))
    edge_out &= (cv2.cvtColor(out, cv2.COLOR_BGR2GRAY) < 90) & (plate == 0) & (deep == 0)
    edge_out &= d_plate > PAD_MAX + 2
    nb_, lb_, sb_, _ = cv2.connectedComponentsWithStats(edge_out.astype(np.uint8), 8)
    bleed = int(max([sb_[i, cv2.CC_STAT_AREA] for i in range(1, nb_)], default=0))

    # THE KEYLINE. Every finish prints a border a few pixels in from the card's edge, and the
    # customer's eye goes straight to it: a mask that stops short anywhere leaves the frame broken
    # at that spot. Measured as the share of the card's outer ring that is actually painted — a
    # finger legitimately covers some of it, so this is read next to hand-covers, not alone.
    ring_src = np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]])
    ring_in = np.float32([[cw * 0.035, ch * 0.025], [cw * 0.965, ch * 0.025],
                          [cw * 0.965, ch * 0.975], [cw * 0.035, ch * 0.975]])
    m_out = np.zeros((H, W), np.uint8)
    m_in = np.zeros((H, W), np.uint8)
    cv2.fillConvexPoly(m_out, cv2.perspectiveTransform(ring_src[None], M)[0].astype(np.int32), 255)
    cv2.fillConvexPoly(m_in, cv2.perspectiveTransform(ring_in[None], M)[0].astype(np.int32), 255)
    ring = (m_out > 0) & (m_in == 0)
    frame_ok = float((ring & (paint > 127)).sum()) / max(int(ring.sum()), 1)

    face = face_width(photo)
    ratio = wid / face if face > 20 else 0.0

    problems = []
    if not (CARD_ASPECT * 0.80 <= aspect <= CARD_ASPECT * 1.24):
        problems.append(f"the card came out {aspect:.3f} wide/tall, not a card's {CARD_ASPECT:.3f}")
    if standoff > 6.0:
        problems.append(f"the card stands {standoff:.0f} px off the plate - the fit missed; "
                        f"look at it, or pass --quad")
    if bleed > 60:
        problems.append(f"{bleed} px of card ink stand where the photograph had none - a dash or a "
                        f"sawtooth on the hand; look at the card's edge at 100 %")
    if frame_ok < 0.80 and occl_frac < 0.15:
        problems.append(f"only {frame_ok*100:.0f}% of the card's border ring is drawn - the frame "
                        f"line will read as broken")
    if occl_frac > 0.30:
        problems.append(f"the hand covers {occl_frac*100:.0f}% of the card - it will not read")
    if frac < 0.02:
        problems.append(f"the card is {frac*100:.1f}% of the picture - too small to read")
    # A 2.5 in card against a ~4.7 in face is about 0.53 at the same depth, and more when the arm
    # reaches toward the camera. Past 1.05 the card is as wide as a whole face: no hand-held
    # trading card ever is, and that is the "monster card" the customer kept catching.
    if ratio and not (0.30 <= ratio <= 1.05):
        problems.append(f"the card is {ratio:.2f} of a face wide; a real 2.5 in card is about 0.6 - "
                        f"REGENERATE the photo, do not ship a monster card")

    # The NAME BAND is the product's face. A thumb across the lower-left is a natural hold, but
    # if it eats into the 58-82% height band where the nameplate lives, the name stops reading -
    # the baseball take hid half of CASEY. Warn by measurement, not by taste.
    Hn0, Hn1 = 0.58, 0.82
    src_band = np.float32([[0, ch * Hn0], [cw, ch * Hn0], [cw, ch * Hn1], [0, ch * Hn1]])
    band_mask = np.zeros((H, W), np.uint8)
    cv2.fillConvexPoly(band_mask, cv2.perspectiveTransform(src_band[None], M)[0].astype(np.int32), 255)
    nb = (band_mask > 0) & (rect > 0)
    nb_occl = (nb & (paint <= 127)).sum() / max(nb.sum(), 1)
    if nb_occl > 0.10:
        problems.append(f"the hand covers {nb_occl*100:.0f}% of the NAME band - the name will not read")

    if "--debug" in sys.argv:
        cv2.imwrite(out_p.replace(".png", ".mask.png"), paint)
        cv2.polylines(out, [quad.astype(np.int32)], True, (0, 0, 255), 2)
    cv2.imwrite(out_p, out)
    print(f"{out_p}  quad={[[round(float(x)), round(float(y))] for x, y in quad]}  "
          f"aspect={aspect:.3f}  hand-covers={occl_frac*100:.1f}%  "
          f"stand-off={standoff:.1f}px  bleed={bleed}px  frame={frame_ok*100:.0f}%  of-frame={frac*100:.1f}%  "
          f"card={ratio:.2f} of a face  (gaps filled {filled} px)")
    for m in problems:
        print("  ! " + m)
    if problems and "--strict" in sys.argv:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
