"""Hang a poster on a generated room wall at TRUE size.

The room is generated with a black placeholder rectangle (so the wall stays clear), but the model does not
respect inch sizes — so the placeholder is wiped back to wall colour and the poster is placed by measurement:
`--ppi` comes from a piece of furniture of known width (a 60 in headboard, an 84 in sofa, a 40 in desk),
the bottom edge sits a hand above that furniture, and the print is centred on it. Frontal camera only.

  hang_poster.py room.png art.png out.png --ppi 8.3 --bottom 462 --cx 513 --size 24x36 --clear 396,135,632,478
"""
import argparse
from PIL import Image, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("room"); ap.add_argument("art"); ap.add_argument("out")
ap.add_argument("--ppi", type=float, required=True, help="pixels per inch, measured on the furniture")
ap.add_argument("--bottom", type=int, required=True, help="y of the poster's bottom edge (px)")
ap.add_argument("--cx", type=int, required=True, help="x of the poster's centre (px)")
ap.add_argument("--size", required=True, help="WxH in inches, e.g. 24x36")
ap.add_argument("--clear", default=None, help="x0,y0,x1,y1 of the placeholder to wipe back to wall colour")
ap.add_argument("--shadow", type=float, default=0.32)
a = ap.parse_args()

room = Image.open(a.room).convert("RGB"); W, H = room.size
if a.clear:
    x0, y0, x1, y1 = [int(v) for v in a.clear.split(",")]
    x0, y0, x1, y1 = max(0, x0 - 4), max(0, y0 - 4), min(W, x1 + 14), min(H, y1 + 14)   # +shadow margin right/below
    px = room.load()
    for y in range(y0, y1):
        l, r = px[max(0, x0 - 10), y], px[min(W - 1, x1 + 10), y]
        for x in range(x0, x1):
            t = (x - x0) / max(1, x1 - x0)
            px[x, y] = tuple(int(l[i] + (r[i] - l[i]) * t) for i in range(3))
    # soften the patch edge so the wall's grain does not show a seam
    patch = room.crop((x0 - 12, y0 - 12, x1 + 12, y1 + 12)).filter(ImageFilter.GaussianBlur(1.2))
    room.paste(patch, (x0 - 12, y0 - 12))

w_in, h_in = [float(v) for v in a.size.lower().split("x")]
pw, ph = int(round(w_in * a.ppi)), int(round(h_in * a.ppi))
x, y = a.cx - pw // 2, a.bottom - ph
# wall shadow: a soft dark rectangle offset down-right, as an unframed print sits a few mm off the wall
sh = Image.new("L", (W, H), 0); Image.Image.paste(sh, int(255 * a.shadow), (x + 3, y + 6, x + pw + 3, y + ph + 6))
sh = sh.filter(ImageFilter.GaussianBlur(9))
room = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), room, sh)
art = Image.open(a.art).convert("RGB").resize((pw, ph), Image.LANCZOS)
room.paste(art, (x, y)); room.save(a.out)
print(f"{a.out}: {a.size} in -> {pw}x{ph} px at {x},{y} (ppi {a.ppi})")
