#!/usr/bin/env python3
"""Build a vertical before -> after video from the same parts the pins are made of.

  python3 marketing/gen_video.py --sport football --product card
  python3 marketing/gen_video.py --sport cheerleading --product poster --platform reels

WHY THIS EXISTS
`gen_pins.video_pin` only re-crops an existing listing video, which is the same clip every
time. Short video is the one place where this product is native — a phone photo turning into
a finished card is the format, not an ad about it — so the video is COMPOSED here from the
athlete's own before photos and the finished product, exactly like `t_transform` does for
stills. Owner's direction 2026-09-02.

Sound is deliberately absent: TikTok and Reels replace it with the creator's own audio, and a
silent track is safer than a licensed one.
"""
from __future__ import annotations

import argparse, json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import engine, gen_pins as gp  # noqa: E402

os.chdir(engine.ROOT)
FPS = 24
SIZE = {"tiktok": (1080, 1920), "reels": (1080, 1920), "square": (1080, 1080)}

# The beats, in seconds. Short: the first frame has to already be the hook, and the product
# needs the longest hold because that is the thing being sold.
BEATS = [("photo1", 1.3), ("photo2", 1.3), ("flash", 0.25), ("product", 4.4)]


def ease(t: float) -> float:
    return t * t * (3 - 2 * t)


def zoom_frame(path: str, w: int, h: int, t: float, start=1.06, end=1.0) -> Image.Image:
    """Full-bleed crop of a photo with a slow push, `t` in 0..1."""
    src = Image.open(path).convert("RGB")
    z = start + (end - start) * ease(t)
    s = max(w / src.width, h / src.height) * z
    im = src.resize((max(1, round(src.width * s)), max(1, round(src.height * s))), Image.LANCZOS)
    x = (im.width - w) // 2
    y = min(max(0, round(im.height * 0.42 - h / 2)), im.height - h)
    return im.crop((x, y, x + w, y + h))


def label(im: Image.Image, text: str, sub: str = "") -> None:
    """A caption band that stays legible over any photo.

    The band has to cover the SUBTITLE too. An earlier version drew the dark plate behind the
    headline only and left the second line as white type straight on the photo — over pale
    curtains it disappeared completely.
    """
    d = ImageDraw.Draw(im, "RGBA")
    f = gp.display(58 if im.width >= 1080 else 44)
    fs = gp.body(30)
    pad, x0, y0, gap = 34, 54, 96, 12
    tw = d.textbbox((0, 0), text, font=f)[2]
    sw = d.textbbox((0, 0), sub, font=fs)[2] if sub else 0
    w = max(tw, sw) + pad * 2
    h = f.size + (gap + fs.size if sub else 0) + pad
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], 16, fill=(8, 12, 20, 224))
    d.text((x0 + pad, y0 + pad // 2), text, font=f, fill=gp.WHITE)
    if sub:
        d.text((x0 + pad, y0 + pad // 2 + f.size + gap), sub, font=fs, fill=(198, 205, 216))


def product_frame(prod_path: str, w: int, h: int, t: float, sf) -> Image.Image:
    """The finished card or poster settling onto the brand surface.

    Geometry is FIXED and the animation only breathes inside it: an earlier version scaled the
    product itself, so the caption underneath moved with it and ended up on top of the
    wordmark by the last frame. Text positions must not depend on the artwork's height.
    """
    im = Image.new("RGB", (w, h))
    for y in range(h):
        k = y / h
        im.paste(tuple(int(a + (b - a) * k) for a, b in zip(sf.top, sf.bot)), (0, y, w, y + 1))

    BOX_TOP, BOX_H = round(h * 0.11), round(h * 0.50)     # the artwork lives only here
    prod = Image.open(prod_path).convert("RGB")
    scale = 0.94 + 0.06 * ease(min(1.0, t * 2.4))          # settles, then holds
    ph = round(BOX_H * scale)
    pw = round(ph * prod.width / prod.height)
    if pw > w - 150:
        pw = w - 150
        ph = round(pw * prod.height / prod.width)
    x = (w - pw) // 2
    y = BOX_TOP + (BOX_H - ph) // 2                        # centred in the box, never below it

    sh = Image.new("RGBA", (pw + 120, ph + 120), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([60, 74, pw + 60, ph + 74], fill=(0, 0, 0, 130))
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    under = im.crop((x - 60, y - 60, x - 60 + sh.width, y - 60 + sh.height)).convert("RGBA")
    im.paste(Image.alpha_composite(under, sh).convert("RGB"), (x - 60, y - 60))
    im.paste(prod.resize((pw, ph), Image.LANCZOS), (x, y))

    d = ImageDraw.Draw(im)
    d.text((w // 2, round(h * 0.655)), "SAME KID.", font=gp.display(66), fill=sf.ink, anchor="ma")
    d.text((w // 2, round(h * 0.700)), "THEIR OWN EDITION.", font=gp.display(66),
           fill=sf.ink, anchor="ma")
    d.text((w // 2, round(h * 0.762)), "Built from the photos you already have",
           font=gp.light(34), fill=sf.muted, anchor="ma")
    mark = gp.wordmark_img(70, sf.light)
    if mark is not None:
        im.paste(mark, ((w - mark.width) // 2, round(h * 0.845)), mark)
    d.text((w // 2, round(h * 0.925)), "gamedayedition.etsy.com", font=gp.body(34),
           fill=sf.muted, anchor="ma")
    return im


def build(sport_slug: str, product: str, platform: str, out_path: str) -> str:
    cfg = json.load(open("marketing/config.json"))
    sport = [s for s in engine.SPORT_RING if s["slug"] == sport_slug]
    if not sport:
        raise SystemExit(f"unknown sport: {sport_slug}")
    item = dict(id=f"v-1-transform-{sport_slug}", date="", template="transform", sport=sport[0],
                occasion="evergreen", pose="action2", photo=1,
                link_key="card" if product == "card" else "poster", headline="", list=None)
    a = gp.resolve(item, cfg, [], 1)
    if not a:
        raise SystemExit(f"no assets for {sport_slug} / {product}")

    w, h = SIZE[platform]
    sf = gp.Surface(True)
    tmp = tempfile.mkdtemp(prefix="gde-vid-")
    n = 0
    for name, secs in BEATS:
        frames = max(1, round(secs * FPS))
        for i in range(frames):
            t = i / max(1, frames - 1)
            if name == "photo1":
                im = zoom_frame(a["photos"][0], w, h, t)
                label(im, "PHOTOS OFF A PHONE", "no photographer, no studio")
            elif name == "photo2":
                im = zoom_frame(a["photos"][1], w, h, t)
                label(im, "NOTHING POSED")
            elif name == "flash":
                im = Image.new("RGB", (w, h), (255, 255, 255))
            else:
                im = product_frame(a["product"], w, h, t, sf)
            im.save(os.path.join(tmp, f"f{n:05d}.png"))
            n += 1

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS),
                    "-i", os.path.join(tmp, "f%05d.png"),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "19",
                    "-movflags", "+faststart", out_path], check=True)
    return out_path


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--sport", required=True)
    p.add_argument("--product", default="card", choices=["card", "poster"])
    p.add_argument("--platform", default="tiktok", choices=list(SIZE))
    p.add_argument("--out", default="")
    args = p.parse_args()
    out = args.out or f"marketing/video/{args.sport}-{args.product}-{args.platform}.mp4"
    print(build(args.sport, args.product, args.platform, out))


if __name__ == "__main__":
    main()
