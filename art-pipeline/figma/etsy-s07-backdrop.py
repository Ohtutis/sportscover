# Etsy listing slide 07 · "Every year, the same kid" — Figma JcQvsgIRiOQtuZcP3Q8dc9, node 19:165.
# Run from the repo root with .venv-matte/bin/python. backdrop first, then panels.
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, gaussian_filter
W="art-pipeline/out/etsy-shots/07-age-row"

src = Image.open("art-pipeline/out/athletes/soccer-age-22/hero.png").convert("RGB")
cut = Image.open("art-pipeline/out/athletes/soccer-age-22/hero.cutout.png")
a = np.array(cut.split()[-1]) > 8
mask = binary_dilation(a, np.ones((3,3),bool), iterations=22)   # ~44 px halo
img = np.array(src).astype(np.float32)
H,Wd,_ = img.shape
xs = np.arange(Wd)
out = img.copy()
for y in range(H):
    m = mask[y]
    if not m.any(): continue
    good = ~m
    if good.sum() < 8:
        continue
    for c in range(3):
        out[y,:,c] = np.where(m, np.interp(xs, xs[good], img[y,good,c]), img[y,:,c])
# any fully-masked rows: fill by vertical interpolation
bad_rows = np.where(mask.all(axis=1))[0]
if len(bad_rows):
    ok = np.setdiff1d(np.arange(H), bad_rows)
    for c in range(3):
        out[bad_rows,:,c] = np.array([np.interp(bad_rows, ok, out[ok,x,c]) for x in range(Wd)]).T
sm = np.stack([gaussian_filter(out[:,:,c], (60,260)) for c in range(3)], axis=2)
Image.fromarray(np.clip(sm,0,255).astype(np.uint8)).save(W+"/backdrop-full.png")
print("full", sm.shape, sm.min(), sm.max())

# crop so the photo's floor line (y=2356) sits at 0.9745 of the panel height
GROUND = 0.9296
ch = 2205/GROUND
cw = ch*319/980
cx = 848
box = (int(round(cx-cw/2)), 0, int(round(cx+cw/2)), int(round(ch)))
print("crop", box, "size", box[2]-box[0], box[3]-box[1])
bd = Image.fromarray(np.clip(sm,0,255).astype(np.uint8)).crop(box).resize((638,1960), Image.LANCZOS)
bd.save(W+"/backdrop.png")
print("ok")
