"""Put our artwork inside a framed picture that a photograph already contains.

The scene is generated with a flat matte-black rectangle inside the frame's mat. That rectangle is
the target: its FOUR CORNERS give the perspective, and its own luminance — black, but not evenly
lit — carries the room's light falling across the glassless print. So:

  · corners, not a bounding box: a frame photographed even slightly off-axis is a quadrilateral,
    and fitting a rectangle to it leaves white slivers of mat down one side.
  · the art fills the quad exactly: no letterboxing inside the mat.
  · light comes from the placeholder, so no second generation is needed — and the model never gets
    a chance to re-spell our type (it has turned "PITCH" into "PITEN" and "HERRERA" into "HAMRERA").

  frame_insert.py scene.png art.png out.png [--blur 1.0] [--debug quad.jpg]
"""
import argparse
import cv2, numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("scene"); ap.add_argument("art"); ap.add_argument("out")
ap.add_argument("--blur", type=float, default=1.0)
ap.add_argument("--debug", default=None)
a = ap.parse_args()

im = cv2.imread(a.scene); H, W = im.shape[:2]
g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
var = cv2.blur(g * g, (9, 9)) - cv2.blur(g, (9, 9)) ** 2
m = ((var < 30) & (g < np.percentile(g, 32))).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
best = None
for i in range(1, n):
    x, y, w, h, area = st[i]
    if x <= 2 or y <= 2 or x + w >= W - 2 or y + h >= H - 2: continue
    if area < 6000 or h < w * 0.9: continue
    if area / (w * h) < 0.78: continue
    if best is None or area > st[best, 4]: best = i
if best is None: raise SystemExit("no placeholder found")

comp = (lab == best).astype(np.uint8)
cnt = max(cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0], key=cv2.contourArea)
peri = cv2.arcLength(cnt, True)
quad = None
for eps in (0.01, 0.02, 0.03, 0.04):
    ap_ = cv2.approxPolyDP(cnt, eps * peri, True)
    if len(ap_) == 4: quad = ap_.reshape(4, 2).astype(np.float32); break
if quad is None: quad = cv2.boxPoints(cv2.minAreaRect(cnt)).astype(np.float32)
s = quad.sum(1); d = np.diff(quad, axis=1).ravel()
dst = np.float32([quad[np.argmin(s)], quad[np.argmin(d)], quad[np.argmax(s)], quad[np.argmax(d)]])  # TL TR BR BL

art = cv2.imread(a.art, cv2.IMREAD_COLOR)
ah, aw = art.shape[:2]
src = np.float32([[0, 0], [aw - 1, 0], [aw - 1, ah - 1], [0, ah - 1]])
Mh = cv2.getPerspectiveTransform(src, dst)
warp = cv2.warpPerspective(art, Mh, (W, H), flags=cv2.INTER_AREA)
mask = cv2.warpPerspective(np.full((ah, aw), 255, np.uint8), Mh, (W, H), flags=cv2.INTER_NEAREST)
mask = cv2.erode(mask, np.ones((3, 3), np.uint8))

# the light the room throws on the print, read off the placeholder itself
lightsrc = cv2.GaussianBlur(g, (0, 0), 25)
inside = lightsrc[mask > 0]
light = np.clip(lightsrc / max(float(inside.mean()), 1e-3), 0.80, 1.30)[:, :, None]
lit = np.clip(warp.astype(np.float32) * light, 0, 255)
if a.blur > 0: lit = cv2.GaussianBlur(lit, (0, 0), a.blur)

alpha = (cv2.GaussianBlur(mask, (0, 0), 1.0).astype(np.float32) / 255.0)[:, :, None]
out = (im.astype(np.float32) * (1 - alpha) + lit * alpha).astype(np.uint8)
cv2.imwrite(a.out, out)
if a.debug:
    vis = im.copy(); cv2.polylines(vis, [dst.astype(np.int32)], True, (255, 0, 255), 3); cv2.imwrite(a.debug, vis)
print("%s  quad %s" % (a.out, ",".join("%d,%d" % (p[0], p[1]) for p in dst)))
