"""Put the REAL artwork on the wall, with the light the model rendered.

Two failure modes, one fix each:
  · Pasting the art flat on the base photo stays razor sharp on a picture with shallow depth of
    field, and that is what reads as fake.
  · Letting the model print the art photographically fixes the light — and re-spells our type.
    "THIS IS MY PITCH" came back "THIS IS MY PITEN" and "KESTRELS" as "AESTRELS".

So: keep the model's LIGHT and throw away its lettering. The lit render and the base differ only
where the poster is, so the difference gives the poster's rectangle; our own artwork goes in there,
multiplied by the low-frequency light field the render carries and softened to the wall's own focus.

  print_on_wall.py base.png lit.png art.png out.png [--blur 1.2]
"""
import argparse
import cv2, numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("base"); ap.add_argument("lit"); ap.add_argument("art"); ap.add_argument("out")
ap.add_argument("--blur", type=float, default=1.2)
ap.add_argument("--pad", type=int, default=0)
a = ap.parse_args()

base = cv2.imread(a.base); lit = cv2.imread(a.lit)
if base.shape != lit.shape: lit = cv2.resize(lit, (base.shape[1], base.shape[0]))
d = cv2.absdiff(cv2.cvtColor(base, cv2.COLOR_BGR2GRAY), cv2.cvtColor(lit, cv2.COLOR_BGR2GRAY))
m = (d > 26).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
i = 1 + int(np.argmax(st[1:, 4]))
x, y, w, h, _ = st[i]
x, y, w, h = x + a.pad, y + a.pad, w - 2 * a.pad, h - 2 * a.pad

art = cv2.imread(a.art, cv2.IMREAD_COLOR)
ah, aw = art.shape[:2]
# keep the artwork's own aspect: fit inside the rendered rectangle, centred
s = min(w / aw, h / ah)
nw, nh = int(aw * s), int(ah * s)
art = cv2.resize(art, (nw, nh), interpolation=cv2.INTER_AREA)
ox, oy = x + (w - nw) // 2, y + (h - nh) // 2

region = lit[oy:oy + nh, ox:ox + nw].astype(np.float32)
light = cv2.GaussianBlur(cv2.cvtColor(region, cv2.COLOR_BGR2GRAY), (0, 0), 31)
light = light / max(light.mean(), 1e-3)                       # low-frequency light field only
light = np.clip(light, 0.72, 1.35)[:, :, None]

outart = np.clip(art.astype(np.float32) * light, 0, 255)
if a.blur > 0: outart = cv2.GaussianBlur(outart, (0, 0), a.blur)
out = base.copy()
# wipe the whole rectangle the render changed, or a sliver of ITS poster survives around ours
X0, Y0, X1, Y1 = max(0, x - 6), max(0, y - 6), min(out.shape[1], x + w + 8), min(out.shape[0], y + h + 8)
px = out.copy()
for yy in range(Y0, Y1):
    l = px[yy, max(0, X0 - 12)].astype(np.float32); r = px[yy, min(out.shape[1] - 1, X1 + 12)].astype(np.float32)
    t = np.linspace(0, 1, X1 - X0)[:, None]
    out[yy, X0:X1] = (l + (r - l) * t).astype(np.uint8)
patch = cv2.GaussianBlur(out[max(0, Y0 - 10):Y1 + 10, max(0, X0 - 10):X1 + 10], (0, 0), 2.0)
out[max(0, Y0 - 10):Y1 + 10, max(0, X0 - 10):X1 + 10] = patch
out[oy:oy + nh, ox:ox + nw] = outart.astype(np.uint8)

# the paper's own edge: a hair of shadow down the right and along the bottom, as the render has
sh = np.zeros(out.shape[:2], np.float32)
cv2.rectangle(sh, (ox + 4, oy + 6), (ox + nw + 4, oy + nh + 6), 1.0, -1)
sh = cv2.GaussianBlur(sh, (0, 0), 7)
sh[oy:oy + nh, ox:ox + nw] = 0
out = (out.astype(np.float32) * (1 - 0.22 * sh[:, :, None])).astype(np.uint8)
cv2.imwrite(a.out, out)
print("%s  poster %dx%d at %d,%d" % (a.out, nw, nh, ox, oy))
