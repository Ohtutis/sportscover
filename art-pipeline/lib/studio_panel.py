"""Rebuild the slide-06 pose panels on ONE studio backdrop.

    python lib/studio_panel.py <W> <H> <out.png> <cutout.png> [<cutout.png> ...]

The four frames on "One athlete, consistent in every shot" are four separate generations, so
each arrives with its own backdrop: on football, panel 1 came back warm brown, panel 2 mid
grey, panel 3 a cooler grey-green. Side by side that reads as four different photo shoots,
which is the exact opposite of what the slide claims.

So the backdrop is not inherited from the generation — it is drawn here, once, and every
cutout is placed on it with the same light and the same contact shadow. What the panels then
share is real, not lucky.
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

TOP = (150, 150, 152)      # seamless paper, lit from above
BOTTOM = (108, 108, 112)
FLOOR = 0.86               # where the paper curves into the floor, as a fraction of height


def backdrop(w, h):
    g = np.zeros((h, w, 3), np.float32)
    for y in range(h):
        t = min(y / (h * FLOOR), 1.0)
        g[y, :, :] = np.array(TOP) * (1 - t) + np.array(BOTTOM) * t
    im = Image.fromarray(g.astype(np.uint8))
    # a soft pool of light behind the subject, so the panel is not a flat wall
    glow = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(glow)
    d.ellipse([-w * 0.25, -h * 0.15, w * 1.25, h * 0.85], fill=52)
    glow = glow.filter(ImageFilter.GaussianBlur(w * 0.18))
    return Image.composite(Image.new("RGB", (w, h), (176, 176, 178)), im, glow)


def place(canvas, cut, margin=0.05):
    w, h = canvas.size
    bb = cut.split()[3].point(lambda a: 255 if a > 10 else 0).getbbox()
    sub = cut.crop(bb)
    s = min(w * (1 - margin * 2) / sub.width, h * (1 - margin) / sub.height)
    nw, nh = max(1, int(sub.width * s)), max(1, int(sub.height * s))
    sub = sub.resize((nw, nh), Image.LANCZOS)
    x, y = (w - nw) // 2, int(h * FLOOR) - nh + int(h * 0.02)
    y = max(int(h * 0.02), min(y, h - nh))

    # contact shadow: the subject's own silhouette, squashed, blurred and darkened
    alpha = sub.split()[3]
    sh = alpha.resize((int(nw * 1.05), max(2, int(nh * 0.06))), Image.LANCZOS)
    shadow = Image.new("L", (w, h), 0)
    shadow.paste(sh, (x - int(nw * 0.025), y + nh - int(nh * 0.03)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(w * 0.02)).point(lambda v: int(v * 0.55))
    canvas = Image.composite(Image.new("RGB", (w, h), (58, 58, 60)), canvas, shadow)

    canvas.paste(sub, (x, y), sub)
    return canvas


if __name__ == "__main__":
    W, H, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
    srcs = sys.argv[4:]
    base = backdrop(W, H)
    for i, p in enumerate(srcs):
        panel = place(base.copy(), Image.open(p).convert("RGBA"))
        dst = out if len(srcs) == 1 else out.replace(".png", f"-{i + 1}.png")
        panel.save(dst)
        print(dst, panel.size)
