"""Turn an athlete cutout into a scale-sheet ruler, measured head-to-feet.

The scale sheet puts the athlete beside the posters, so the BODY has to be the constant — not the
image. A raised-arm pose (a jump shot, a celebration) is taller AND wider than the body, so
scaling by the image would shrink the athlete and lie about the size of the print.

So: crop to the column the legs occupy (outstretched hands run off the sides, the way the etalon's
ruler runs off the bottom), then report the head-to-feet height inside that column.

  ruler_from_cutout.py in.png out.png [head_top_fraction]
  -> width height head_top body_h aspect

`head_top_fraction` overrides the automatic head detection, which cannot tell a basketball held
overhead from the head under it; measure it on a percentage grid and pass it.
"""
import sys
from PIL import Image
import numpy as np

src, out = sys.argv[1], sys.argv[2]
frac = float(sys.argv[3]) if len(sys.argv) > 3 else None
im = Image.open(src).convert("RGBA"); im = im.crop(im.getbbox())
a = np.array(im)[:, :, 3] > 24
h, w = a.shape
# The whole figure is kept: an arm chopped by the crop reads as a defect, and the athlete is the
# ruler, so nothing about the body may be cut. Width follows from the pose.
if frac is not None:
    head_top = int(h * frac)
else:
    band = a[:, int(w * 0.34):int(w * 0.66)]
    rows = np.where(band.any(axis=1))[0]
    head_top = int(rows[0]) if len(rows) else 0
im.save(out)
print("%d %d %d %d %.4f" % (w, h, head_top, h - head_top, w / h))
