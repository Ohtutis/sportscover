"""Print the CROP imageTransform for a square zoom on the largest face in a poster.

Figma's CROP transform is [[w,0,x],[0,h,y]] in normalised image coordinates, so a square tile
needs w*W == h*H in pixels. Used for the listing's "TRUE 300 DPI" loupe, which must show THIS
sport's athlete — a leftover face from another sport is the kind of defect a buyer spots first.
"""
import sys
import cv2, numpy as np
from insightface.app import FaceAnalysis

src, zoom = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 2.6
im = cv2.imread(src); H, W = im.shape[:2]
app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"]); app.prepare(ctx_id=-1, det_size=(640, 640))
faces = app.get(im)
if not faces: print("NO FACE"); sys.exit(1)
f = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
x0, y0, x1, y1 = f.bbox; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
side = max(x1 - x0, y1 - y0) * zoom                       # square side in px
side = min(side, W, H)
px, py = min(max(cx - side / 2, 0), W - side), min(max(cy - side / 2, 0), H - side)
print("face %dx%d at %d,%d | crop w=%.4f h=%.4f x=%.4f y=%.4f" %
      (x1 - x0, y1 - y0, cx, cy, side / W, side / H, px / W, py / H))
