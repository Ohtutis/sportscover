"""Warp one flat artwork onto a quad in a photograph, matching the photograph's light.

    .venv-matte/bin/python art-pipeline/lib/warp_onto.py \
        <scene.png> <art.png> <out.png> --quad x1,y1,x2,y2,x3,y3,x4,y4 [--mask-dark]

WHY A SEPARATE TOOL FROM card_in_hand.py. That one FINDS the plate and fits a card-shaped quad to
it — exactly wrong when the photograph holds a whole fan or stack of black cards (it fits the
stack) or an object that is not card-shaped (a foil pack). Here the quad is GIVEN and the only job
is to put the art there convincingly.

`--mask-dark` keeps the paint inside the object's own dark pixels, so a finger in front of it stays
in front — the same rule as the card-in-hand shot, just with the geometry supplied by hand.
"""
import sys

import cv2
import numpy as np


def order_quad(p):
    s, d = p.sum(1), np.diff(p, axis=1).ravel()
    return np.float32([p[np.argmin(s)], p[np.argmin(d)], p[np.argmax(s)], p[np.argmax(d)]])


def main():
    scene_p, art_p, out_p = sys.argv[1], sys.argv[2], sys.argv[3]
    scene = cv2.imread(scene_p)
    art = cv2.imread(art_p, cv2.IMREAD_UNCHANGED)
    if scene is None or art is None:
        raise SystemExit("cannot read scene or art")
    if art.shape[2] == 4:
        a = art[:, :, 3:4].astype(np.float32) / 255.0
        art = (art[:, :, :3].astype(np.float32) * a).astype(np.uint8)
    nums = [float(v) for v in sys.argv[sys.argv.index("--quad") + 1].split(",")]
    quad = order_quad(np.float32(nums).reshape(4, 2))
    H, W = scene.shape[:2]
    ah, aw = art.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [aw, 0], [aw, ah], [0, ah]]), quad)
    warp = cv2.warpPerspective(art, M, (W, H), flags=cv2.INTER_LANCZOS4)

    mask = np.zeros((H, W), np.uint8)
    cv2.fillConvexPoly(mask, quad.astype(np.int32), 255)
    if "--pack-mask" in sys.argv:
        # The object's own SILHOUETTE, for a base image that already carries a printed design.
        # "Keep the dark pixels" is wrong here: the old artwork's white type is bright, so it
        # survives the mask and shows straight through the new print as a ghost. What is NOT the
        # object is skin and blown-out background — subtract those, then fill the holes, and the
        # white type comes back as part of the object.
        hsv = cv2.cvtColor(scene, cv2.COLOR_BGR2HSV)
        ycc = cv2.cvtColor(scene, cv2.COLOR_BGR2YCrCb)
        skin = (ycc[:, :, 1] >= 133) & (ycc[:, :, 1] <= 177) & \
               (ycc[:, :, 2] >= 77) & (ycc[:, :, 2] <= 127)
        blown = (hsv[:, :, 2] > 195) & (hsv[:, :, 1] < 30)
        core = ((mask > 0) & ~skin & ~blown).astype(np.uint8)
        core = cv2.morphologyEx(core, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(core, 8)
        if n > 1:
            big = max(range(1, n), key=lambda i: st[i, cv2.CC_STAT_AREA])
            core = (lab == big).astype(np.uint8)
        ff = core.copy()
        pad = np.zeros((core.shape[0] + 2, core.shape[1] + 2), np.uint8)
        cv2.floodFill(ff, pad, (0, 0), 1)
        holes = (ff == 0).astype(np.uint8)          # everything the outside flood could not reach
        core = ((core | holes) > 0).astype(np.uint8)
        core = cv2.morphologyEx(core, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
        mask = cv2.bitwise_and(mask, core * 255)

    if "--mask-dark" in sys.argv:
        gray = cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY)
        lvl = float(np.percentile(gray[mask > 0], 35))
        keep = ((gray < lvl + 45) & (mask > 0)).astype(np.uint8) * 255
        keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
        mask = keep

    # carry the scene's own light across the print: one quadratic luminance surface, never a
    # per-channel fit — that turns a cream name violet (card_in_hand.py, same lesson).
    orig = scene.astype(np.float32)
    new = warp.astype(np.float32)
    ys, xs = np.nonzero(mask)
    if len(xs) > 400:
        ys, xs = ys[::7], xs[::7]
        cx, cy = quad[:, 0].mean(), quad[:, 1].mean()
        sx, sy = np.ptp(quad[:, 0]) or 1.0, np.ptp(quad[:, 1]) or 1.0
        nx, ny = (xs - cx) / sx, (ys - cy) / sy
        A = np.stack([np.ones_like(nx), nx, ny, nx * nx, nx * ny, ny * ny], 1)
        gy, gx = np.mgrid[0:H, 0:W]
        GX, GY = (gx - cx) / sx, (gy - cy) / sy
        B = np.stack([np.ones_like(GX), GX, GY, GX * GX, GX * GY, GY * GY], 2)
        lo = cv2.GaussianBlur(orig, (0, 0), 12).mean(2)
        base = float(np.median(lo[mask > 0])) + 1e-3
        r = np.clip(lo[ys, xs] / base, 0.82, 1.20)
        coef, *_ = np.linalg.lstsq(A, r, rcond=None)
        new = np.clip(new * np.clip(B @ coef, 0.82, 1.20)[:, :, None], 0, 255)

    if "--displace" in sys.argv:
        # A foil pouch is not flat. Multiplying the scene's light through the art gets the shading
        # right but leaves the print itself perfectly straight, which is what makes a mockup read
        # as a sticker. Pushing each sample along the gradient of the scene's own smoothed
        # luminance bends the print into the folds: where the foil rises, the art rides over it.
        lum0 = cv2.GaussianBlur(cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), 9)
        gxm = cv2.Scharr(lum0, cv2.CV_32F, 1, 0) / 16.0
        gym = cv2.Scharr(lum0, cv2.CV_32F, 0, 1) / 16.0
        k = float(sys.argv[sys.argv.index("--displace") + 1]) if \
            (sys.argv.index("--displace") + 1 < len(sys.argv) and
             sys.argv[sys.argv.index("--displace") + 1].replace('.', '', 1).isdigit()) else 0.6
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        new = cv2.remap(new, xx + np.clip(gxm * k, -14, 14), yy + np.clip(gym * k, -14, 14),
                        cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)

    if "--multiply" in sys.argv:
        # A mockup of a FOIL pack is not a flat plane: the pouch bulges, the crimps catch the
        # light, and the whole sell is that the print follows those folds. A quadratic surface
        # cannot carry a specular highlight, so the scene's own luminance is multiplied through
        # the art instead — the standard mockup transfer, and the reason the result reads as
        # printed foil rather than as a sticker.
        # Blur the luminance FIRST when the base image already carries a printed design: its own
        # type is high-contrast structure, and an unblurred gain paints that old wording straight
        # back through the new artwork as a ghost. `--smooth N` sets how much broad shading to
        # keep and how much print to forget.
        sm = 1.4
        if "--smooth" in sys.argv:
            sm = float(sys.argv[sys.argv.index("--smooth") + 1])
        lum = cv2.GaussianBlur(cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY).astype(np.float32), (0, 0), sm)
        mid = float(np.median(lum[mask > 0])) + 1e-3
        gain = np.clip(lum / mid, 0.45, 1.85)
        new = np.clip(new * gain[:, :, None], 0, 255)

    if "--round" in sys.argv:
        # A foil pouch has no square corners: printing a hard-cornered rectangle onto one is the
        # single loudest tell that an image is a mockup. Round the mask to the pouch's own corner.
        r = int(sys.argv[sys.argv.index("--round") + 1])
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k)

    alpha = (cv2.GaussianBlur(mask, (0, 0), 0.9).astype(np.float32) / 255.0)[:, :, None]
    out = (orig * (1 - alpha) + new * alpha).astype(np.uint8)
    cv2.imwrite(out_p, out)
    w = (np.linalg.norm(quad[1] - quad[0]) + np.linalg.norm(quad[2] - quad[3])) / 2
    h = (np.linalg.norm(quad[3] - quad[0]) + np.linalg.norm(quad[2] - quad[1])) / 2
    print(f"{out_p}  quad={[[int(x), int(y)] for x, y in quad]}  aspect={w/max(h,1e-6):.3f}  "
          f"painted={int((mask>0).sum())}px")


if __name__ == "__main__":
    main()
