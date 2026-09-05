#!/usr/bin/env python3
"""Render one batch of social content for every platform, at every platform's own size.

  python3 marketing/gen_social.py                 # everything
  python3 marketing/gen_social.py --only tiktok   # one platform
  python3 marketing/gen_social.py --no-video      # stills only (fast)

Output: marketing/social/<platform>/posts/... , /reels/... and captions.md

WHY THIS IS NOT ONE RENDER COPIED FOUR TIMES
Instagram's feed is 4:5 but its GRID crops to 3:4, TikTok's photo posts are 9:16, and a
vertical video loses a different slice of frame to each app's UI (TikTok's button rail and
caption eat ~400 px of the bottom; Shorts eats ~290). Type that clears one app sits under a
button in the next. So the art bleeds and the type moves — per platform, by measurement.
Sizes, safe zones and the competitor read behind the content choices: SOCIAL-FORMAT-AUDIT.md
"""
from __future__ import annotations

import argparse, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import engine, gen_pins as gp  # noqa: E402

os.chdir(engine.ROOT)
OUT = "marketing/social"
FPS = 24

# (top, bottom, right) insets the app's own UI covers on a 1080x1920 vertical video.
PLATFORMS = {
    "instagram": dict(post=(1080, 1350), video=(1080, 1920), safe=(120, 320, 150)),
    "facebook":  dict(post=(1080, 1350), video=(1080, 1920), safe=(120, 340, 150)),
    "tiktok":    dict(post=(1080, 1920), video=(1080, 1920), safe=(130, 400, 180)),
    # YouTube stills are 4:5 like the others on purpose: Community posts need 500
    # subscribers, so nothing here can be posted yet and a bespoke square layout
    # would be work spent on a frame no one will see. Shorts are what YouTube gets.
    "youtube":   dict(post=(1080, 1350), video=(1080, 1920), safe=(110, 290, 150)),
}

# Six finishes of the SAME athlete. These come from the football CARD listing, not from
# `print-sources/output/` — those are the original Nia Brooks template and are retired
# (owner, 2026-09-02: "sito nenaudojam maketo"). Keeping one athlete across all six is the
# whole point of the post: it isolates the finish as the only variable.
STYLES = [
    ("STADIUM NIGHT",       "etsy/listing-images/01-football-card/src/FB-SN-front.png"),
    ("CHROME ALL-STAR",     "etsy/listing-images/01-football-card/src/FB-CA-front.png"),
    ("FIRE & SMOKE",        "etsy/listing-images/01-football-card/src/FB-FS-front.png"),
    ("HERITAGE",            "etsy/listing-images/01-football-card/src/FB-HE-front.png"),
    ("SIGNATURE SPOTLIGHT", "etsy/listing-images/01-football-card/src/FB-SS-front.png"),
    ("PRISM RUSH",          "etsy/listing-images/01-football-card/src/FB-PR-front.png"),
]

# One athlete per post, but NOT the same athlete in every post. The roster is 17 sports
# (plus the soccer age ladder, 7 to 50), and a batch that shows one boy in every frame
# argues that this is a football product. Where a post needs six finishes of the SAME
# person, that is football; everywhere else the sport changes on purpose.
def photos_of(slug: str) -> list[str]:
    d = f"art-pipeline/out/athletes/{slug}/before"
    return [f"{d}/photo{n}.png" for n in (1, 2, 3, 4)
            if os.path.exists(f"{d}/photo{n}.png")]


def card_of(slug: str, side: str = "front") -> str:
    return f"marketing/cards/{slug}-{side}.png"


HERO = "football"                       # 4 before photos, card front+back, six card finishes
PHOTOS = photos_of(HERO)
CARD_F, CARD_B = card_of(HERO), card_of(HERO, "back")
BA = "basketball"                       # the before/after post — a different kid, on purpose
POSTER = "etsy/listing-images/02-cheerleading-poster/src/CH-SN-poster.png"
SR_SPORT = "volleyball"                 # senior night skews girls' sport; the TikTok evidence
SR_POSTER = "etsy/listing-images/03-senior-night/src/vlb-sr-poster.png"
CUTOUT = f"art-pipeline/out/athletes/{HERO}/action2.cutout.png"

# ---------------------------------------------------------------- toolkit ---
def ground(w: int, h: int, sf) -> Image.Image:
    im = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(im)
    for y in range(h):
        k = y / h
        d.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * k) for a, b in zip(sf.top, sf.bot)))
    return im


def corners(im: Image.Image, sf, inset: int = 30, arm: int = 58, wd: int = 4) -> None:
    d, w, h = ImageDraw.Draw(im), im.width, im.height
    for x, y, dx, dy in ((inset, inset, 1, 1), (w - inset, inset, -1, 1),
                         (inset, h - inset, 1, -1), (w - inset, h - inset, -1, -1)):
        d.line([(x, y), (x + arm * dx, y)], fill=gp.ACCENT, width=wd)
        d.line([(x, y), (x, y + arm * dy)], fill=gp.ACCENT, width=wd)


def shadowed(im: Image.Image, art: Image.Image, x: int, y: int, blur: int = 26,
             drop: int = 16, alpha: int = 140) -> None:
    """Paste `art` at (x, y) over a soft shadow, so it reads as an object on a surface."""
    pad = blur * 3
    sh = Image.new("RGBA", (art.width + pad * 2, art.height + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([pad, pad + drop, pad + art.width, pad + art.height + drop],
                                 fill=(0, 0, 0, alpha))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    box = (x - pad, y - pad)
    under = im.crop((box[0], box[1], box[0] + sh.width, box[1] + sh.height)).convert("RGBA")
    im.paste(Image.alpha_composite(under, sh).convert("RGB"), box)
    im.paste(art.convert("RGB") if art.mode != "RGBA" else art, (x, y),
             art if art.mode == "RGBA" else None)


def fit(path: str, box_w: int, box_h: int) -> Image.Image:
    src = Image.open(path)
    s = min(box_w / src.width, box_h / src.height)
    return src.resize((max(1, round(src.width * s)), max(1, round(src.height * s))), Image.LANCZOS)


def print_of(path: str, box_w: int, box_h: int, angle: float = 0.0) -> Image.Image:
    """A phone photo shown as a physical print — white border, square corners, tilted."""
    inner = gp.cover(path, box_w, box_h, 0.38)
    b = max(10, round(box_w * 0.05))
    plate = Image.new("RGBA", (box_w + b * 2, box_h + b * 2), (255, 255, 255, 255))
    plate.paste(inner, (b, b))
    # Rotate in RGBA with a transparent fill, or the expanded corners come back black and the
    # print reads as a photo of a photo on a black card.
    return plate.rotate(angle, resample=Image.BICUBIC, expand=True,
                        fillcolor=(0, 0, 0, 0)) if angle else plate


def wrap(d, text: str, font, max_w: int) -> list[str]:
    out, line = [], ""
    for word in text.split():
        t = (line + " " + word).strip()
        if d.textlength(t, font=font) <= max_w or not line:
            line = t
        else:
            out.append(line)
            line = word
    if line:
        out.append(line)
    return out


def footer(im: Image.Image, sf, y: float = 0.945, mark_h: int = 0) -> None:
    """Wordmark + shop address, always the last thing in the frame."""
    d, w, h = ImageDraw.Draw(im), im.width, im.height
    mark = gp.wordmark_img(mark_h or round(h * 0.035), sf.light)
    yy = round(h * y)
    if mark is not None:
        im.paste(mark, ((w - mark.width) // 2, yy - mark.height - round(h * 0.018)), mark)
    d.text((w // 2, yy), "gamedayedition.etsy.com", font=gp.body(round(w * 0.028)),
           fill=sf.muted, anchor="ma")


def eyebrow(im: Image.Image, sf, text: str, y: float = 0.055) -> None:
    d = ImageDraw.Draw(im)
    f = gp.body(round(im.width * 0.026))
    tw = d.textlength(text, font=f)
    x, yy = (im.width - tw) // 2, round(im.height * y)
    pad = round(im.width * 0.022)
    d.rectangle([x - pad, yy - round(pad * 0.55), x + tw + pad, yy + f.size + round(pad * 0.55)],
                fill=gp.ACCENT)
    d.text((x, yy), text, font=f, fill=(255, 255, 255))


def head(im: Image.Image, sf, title: str, sub: str, y_px: int, bottom_px: int = 0) -> int:
    """Headline + one supporting line, centred, starting at an ABSOLUTE y.

    y is a pixel, not a fraction of the frame, because the block underneath a layout has to
    start where that layout actually ended — a fixed fraction put the transform headline on
    top of its own photo at 4:5 and pushed the before/after subtitle off the bottom edge.
    If the text still will not fit above `bottom_px`, the type shrinks instead of overflowing.
    """
    d, w = ImageDraw.Draw(im), im.width
    bottom = bottom_px or round(im.height * 0.855)
    for k in (1.0, 0.90, 0.80, 0.70, 0.60):
        tf, sfont = gp.display(round(w * 0.072 * k)), gp.light(round(w * 0.030 * k))
        tl = wrap(d, title, tf, round(w * 0.86))
        sl = wrap(d, sub, sfont, round(w * 0.82)) if sub else []
        th = len(tl) * round(tf.size * 1.06)
        if sl:
            th += round(w * 0.012) + len(sl) * round(sfont.size * 1.30)
        if y_px + th <= bottom or k == 0.60:
            break
    yy = y_px
    for ln in tl:
        d.text((w // 2, yy), ln, font=tf, fill=sf.ink, anchor="ma")
        yy += round(tf.size * 1.06)
    if sl:
        yy += round(w * 0.012)
        for ln in sl:
            d.text((w // 2, yy), ln, font=sfont, fill=sf.muted, anchor="ma")
            yy += round(sfont.size * 1.30)
    return yy


def arrow(im: Image.Image, cx: int, cy: int, size: int, down: bool) -> None:
    d = ImageDraw.Draw(im)
    s = size
    if down:
        d.polygon([(cx - s, cy - s // 2), (cx + s, cy - s // 2), (cx, cy + s)], fill=gp.ACCENT)
    else:
        d.polygon([(cx - s // 2, cy - s), (cx - s // 2, cy + s), (cx + s, cy)], fill=gp.ACCENT)


# -------------------------------------------------------------- post 1..6 ---
def p_transform(w: int, h: int) -> list[Image.Image]:
    """Photos in -> product out. The one picture that explains the whole business."""
    sf = gp.Surface(True)
    im = ground(w, h, sf)
    corners(im, sf)
    eyebrow(im, sf, "FROM YOUR CAMERA ROLL")

    if h / w >= 1.5:                                    # 9:16 - stack it
        pw, ph = round(w * 0.33), round(w * 0.44)
        y0 = round(h * 0.115)
        bottom = 0
        for i, p in enumerate(PHOTOS[:2]):
            pr = print_of(p, pw, ph, -5 + i * 10)
            im.paste(pr, (round(w * (0.10 if i == 0 else 0.53)), y0), pr)
            bottom = max(bottom, y0 + pr.height)
        arrow(im, w // 2, bottom + round(h * 0.030), round(w * 0.035), True)
        cy = bottom + round(h * 0.065)
        card = fit(CARD_F, round(w * 0.56), round(h * 0.30))
        shadowed(im, card, (w - card.width) // 2, cy)
        end = cy + card.height
    else:
        pw, ph = round(w * 0.28), round(w * 0.36)
        y0 = round(h * 0.155)
        step = round(ph * 0.58)
        bottom = 0
        for i, p in enumerate(PHOTOS[:2]):
            pr = print_of(p, pw, ph, -6 + i * 12)
            im.paste(pr, (round(w * 0.05), y0 + i * step), pr)
            bottom = max(bottom, y0 + i * step + pr.height)
        card = fit(CARD_F, round(w * 0.38), bottom - y0)
        shadowed(im, card, round(w * 0.56), y0)
        arrow(im, round(w * 0.505), y0 + (bottom - y0) // 2, round(w * 0.030), False)
        end = max(bottom, y0 + card.height)

    head(im, sf, "THEIR OWN TRADING CARD",
         "Their real kit, their crest, their number. Nothing invented.",
         end + round(h * 0.045))
    footer(im, sf)
    return [im]


def p_beforeafter(w: int, h: int) -> list[Image.Image]:
    """The phone photo above, the card front and back below. The differentiator, on dark."""
    sf = gp.Surface(False)
    im = ground(w, h, sf)
    corners(im, sf)
    d = ImageDraw.Draw(im)
    lab = gp.body(round(w * 0.026))

    top = round(h * 0.075)
    bh = round(h * (0.24 if h / w >= 1.5 else 0.20))
    # 0.24, not the usual 0.34: the band is short and wide, and the default focus sliced
    # the top of his head off — which reads as a mistake rather than as a snapshot.
    im.paste(gp.cover(photos_of(BA)[0], w - round(w * 0.10), bh, 0.24),
             (round(w * 0.05), top))
    d.text((round(w * 0.05), top + bh + round(h * 0.010)), "THE PHOTO YOU ALREADY HAVE",
           font=lab, fill=sf.muted)

    # The cards are sized by what is LEFT, so the pair can never push the headline off the
    # bottom edge — which is exactly what a fixed card width did at 4:5.
    cy = top + bh + round(h * 0.105)
    gap = round(w * 0.04)
    ch = round(h * 0.66) - cy
    cw = round(ch * 816 / 1110)
    if cw * 2 + gap > round(w * 0.88):
        cw = (round(w * 0.88) - gap) // 2
        ch = round(cw * 1110 / 816)
    d.text((round(w * 0.05), cy - round(h * 0.038)), "WHAT COMES BACK - FRONT AND BACK",
           font=lab, fill=gp.ACCENT)
    x0 = (w - (cw * 2 + gap)) // 2
    for i, p in enumerate((card_of(BA), card_of(BA, "back"))):
        shadowed(im, fit(p, cw, ch), x0 + i * (cw + gap), cy)

    head(im, sf, "SAME KID.", "Six art styles. You approve a proof before anything prints.",
         cy + ch + round(h * 0.045))
    footer(im, sf)
    return [im]


def p_six_styles(w: int, h: int) -> list[Image.Image]:
    """Carousel, 6 slides: one athlete, six finishes. The 'which one is yours' post."""
    out = []
    for i, (name, path) in enumerate(STYLES):
        sf = gp.Surface(False)
        im = ground(w, h, sf)
        corners(im, sf)
        d = ImageDraw.Draw(im)
        d.text((w // 2, round(h * 0.065)), f"{i + 1} OF 6", font=gp.body(round(w * 0.026)),
               fill=gp.ACCENT, anchor="ma")
        card = fit(path, round(w * 0.62), round(h * (0.52 if h / w >= 1.5 else 0.58)))
        shadowed(im, card, (w - card.width) // 2, round(h * (0.145 if h / w >= 1.5 else 0.125)))
        y = round(h * (0.72 if h / w >= 1.5 else 0.755))
        d.text((w // 2, y), name, font=gp.display(round(w * 0.062)), fill=sf.ink, anchor="ma")
        d.text((w // 2, y + round(w * 0.075)), "Same athlete. Same photos. Different finish.",
               font=gp.light(round(w * 0.028)), fill=sf.muted, anchor="ma")
        footer(im, sf)
        out.append(im)
    return out


STEPS = [
    ("SEND 4-10 PHOTOS", "Whatever is on your phone. No studio, no photographer.",
     photos_of("volleyball")[0]),
    ("PICK A STYLE", "Six finishes. The kit and the crest stay theirs in all of them.", None),
    ("APPROVE THE PROOF", "You see it before anything is printed. Changes are free.", None),
    ("IT SHIPS FREE", "Printed and posted worldwide, or print-ready files the same week.",
     card_of("cheerleading")),
]


def p_how(w: int, h: int) -> list[Image.Image]:
    """Carousel, 4 slides. The objection-killer: people assume this is complicated."""
    out = []
    for i, (title, line, art_path) in enumerate(STEPS):
        sf = gp.Surface(i % 2 == 0)
        im = ground(w, h, sf)
        corners(im, sf)
        d = ImageDraw.Draw(im)
        d.text((w // 2, round(h * 0.085)), f"STEP {i + 1}", font=gp.display(round(w * 0.115)),
               fill=gp.ACCENT, anchor="ma")
        y = round(h * 0.20)
        d.text((w // 2, y), title, font=gp.display(round(w * 0.070)), fill=sf.ink, anchor="ma")
        y += round(w * 0.090)
        for ln in wrap(d, line, gp.light(round(w * 0.031)), round(w * 0.80)):
            d.text((w // 2, y), ln, font=gp.light(round(w * 0.031)), fill=sf.muted, anchor="ma")
            y += round(w * 0.044)

        box_h = round(h * (0.40 if h / w >= 1.5 else 0.34))
        top = y + round(h * 0.035)
        if i == 1:                                       # the six finishes, as a strip
            n, gap = 3, round(w * 0.02)
            cw = (round(w * 0.84) - gap * (n - 1)) // n
            for k, (_, p) in enumerate(STYLES[:6]):
                art = fit(p, cw, box_h // 2 - gap)
                shadowed(im, art, round(w * 0.08) + (k % n) * (cw + gap),
                         top + (k // n) * (box_h // 2), blur=14, drop=8)
        elif i == 2:                                     # the proof, watermarked
            art = fit(card_of("soccer", "back"), round(w * 0.46), box_h)
            shadowed(im, art, (w - art.width) // 2, top)
            d.text((w // 2, top + art.height + round(h * 0.018)), "PROOF - NOT YET PRINTED",
                   font=gp.body(round(w * 0.026)), fill=gp.ACCENT, anchor="ma")
        elif art_path and art_path.endswith("front.png"):
            art = fit(art_path, round(w * 0.50), box_h)
            shadowed(im, art, (w - art.width) // 2, top)
        elif art_path:
            pr = print_of(art_path, round(w * 0.44), round(w * 0.58), -4)
            im.paste(pr, ((w - pr.width) // 2, top), pr)
        footer(im, sf)
        out.append(im)
    return out


def p_product(w: int, h: int) -> list[Image.Image]:
    """The poster as an object. No before photos — this one sells the finished thing."""
    sf = gp.Surface(False)
    im = ground(w, h, sf)
    corners(im, sf)
    eyebrow(im, sf, "18x24 AND 24x36, SHIPPED FREE")
    art = fit(POSTER, round(w * 0.60), round(h * (0.56 if h / w >= 1.5 else 0.60)))
    shadowed(im, art, (w - art.width) // 2, round(h * (0.145 if h / w >= 1.5 else 0.135)))
    head(im, sf, "A POSTER OF YOUR OWN ATHLETE",
         "Built from your photos - not a template with a face dropped in.",
         round(h * (0.145 if h / w >= 1.5 else 0.135)) + art.height + round(h * 0.045))
    footer(im, sf)
    return [im]


def p_range(w: int, h: int) -> list[Image.Image]:
    """Fifteen sports in one grid — the answer to 'do you even do my sport'."""
    sf = gp.Surface(True)
    im = ground(w, h, sf)
    corners(im, sf)
    d = ImageDraw.Draw(im)
    d.text((w // 2, round(h * 0.07)), "DO YOU DO MY SPORT?", font=gp.display(round(w * 0.070)),
           fill=sf.ink, anchor="ma")
    d.text((w // 2, round(h * 0.07) + round(w * 0.082)), "17 of them. Yours is almost certainly one.",
           font=gp.light(round(w * 0.030)), fill=sf.muted, anchor="ma")

    fronts = sorted(p for p in (os.path.join("marketing/cards", f)
                                for f in os.listdir("marketing/cards")) if p.endswith("-front.png"))
    # Columns are chosen so the grid FILLS the frame — "17 sports" under six cards is a
    # claim the picture argues against.
    cols = 5 if h / w < 1.15 else 4
    gap = round(w * 0.018)
    cw = (round(w * 0.90) - gap * (cols - 1)) // cols
    ch = round(cw * 1110 / 816)
    top = round(h * (0.185 if h / w >= 1.15 else 0.20))
    rows = min((len(fronts) + cols - 1) // cols,
               max(1, (round(h * 0.80) - top) // (ch + gap)))
    for k, p in enumerate(fronts[:rows * cols]):
        art = fit(p, cw, ch)
        shadowed(im, art, round(w * 0.05) + (k % cols) * (cw + gap),
                 top + (k // cols) * (ch + gap), blur=12, drop=7, alpha=110)
    footer(im, sf)
    return [im]


POSTS = [
    ("01-transform",   "single",   p_transform),
    ("02-beforeafter", "single",   p_beforeafter),
    ("03-six-styles",  "carousel", p_six_styles),
    ("04-how-it-works","carousel", p_how),
    ("05-poster",      "single",   p_product),
    ("06-sports-range","single",   p_range),
]


# ------------------------------------------------------------------ reels ---
VW, VH = 1080, 1920
_bg_cache: dict = {}
_img_cache: dict = {}


def _bg(light: bool) -> Image.Image:
    if light not in _bg_cache:
        _bg_cache[light] = ground(VW, VH, gp.Surface(light))
    return _bg_cache[light].copy()


def _open(path: str) -> Image.Image:
    if path not in _img_cache:
        _img_cache[path] = Image.open(path).convert("RGBA")
    return _img_cache[path]


def push(path: str, t: float, start=1.08, end=1.0, focus=0.40) -> Image.Image:
    """Full-bleed photo with a slow push in. The hook beat is always one of these."""
    src = _open(path).convert("RGB")
    z = start + (end - start) * (t * t * (3 - 2 * t))
    s = max(VW / src.width, VH / src.height) * z
    im = src.resize((max(1, round(src.width * s)), max(1, round(src.height * s))), Image.LANCZOS)
    x = (im.width - VW) // 2
    y = min(max(0, round(im.height * focus - VH / 2)), im.height - VH)
    return im.crop((x, y, x + VW, y + VH))


def hold(path: str, t: float, light: bool, top_f=0.13, box_f=0.50) -> Image.Image:
    """A product settling onto the brand surface. Geometry fixed; only the scale breathes,
    so nothing below it ever moves (that bug shipped once already, in gen_video)."""
    im = _bg(light)
    art = _open(path)
    scale = 0.94 + 0.06 * min(1.0, t * 2.6)
    bh = round(VH * box_f * scale)
    bw = round(bh * art.width / art.height)
    if bw > VW - 220:
        bw, bh = VW - 220, round((VW - 220) * art.height / art.width)
    x, y = (VW - bw) // 2, round(VH * top_f) + (round(VH * box_f) - bh) // 2
    shadowed(im, art.resize((bw, bh), Image.LANCZOS), x, y, blur=30, drop=18, alpha=150)
    return im


def cutout_on_dark(t: float) -> Image.Image:
    """The athlete lifted off their background — the one build step we genuinely do.

    The cutout PNG keeps the pose frame's full canvas, so most of it is transparent padding.
    Scaling that canvas put the helmet off the top of the frame and left the figure floating;
    the alpha bbox is the subject, so crop to it first and scale THAT.
    """
    im = _bg(False)
    art = _open(CUTOUT)
    bb = art.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox()
    if bb:
        art = art.crop(bb)
    bh = round(VH * (0.56 + 0.03 * t))
    bw = round(bh * art.width / art.height)
    if bw > VW - 160:
        bw, bh = VW - 160, round((VW - 160) * art.height / art.width)
    a = art.resize((bw, bh), Image.LANCZOS)
    im.paste(a, ((VW - bw) // 2, round(VH * 0.15)), a)
    return im


ORANGE = (255, 107, 43)
INK = (20, 25, 31)
MUTED = (110, 114, 120)


def _luma(im: Image.Image, box) -> float:
    band = im.crop(box).convert("L")
    return sum(band.getdata()) / (band.width * band.height)


def _track(d, xy, text, f, fill, tracking=6):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=f, fill=fill)
        x += f.getlength(ch) + tracking
    return x


def _pill(d, x, y, text, f, filled: bool, ink, tracking=2, h=58, pad=30):
    """Hero-slide pill: filled orange with white text, or outlined in the frame's ink."""
    tw = f.getlength(text) + tracking * (len(text) - 1)
    w = tw + 2 * pad
    if filled:
        d.rounded_rectangle([x, y, x + w, y + h], h // 2, fill=ORANGE)
        col = (255, 255, 255)
    else:
        d.rounded_rectangle([x, y, x + w, y + h], h // 2, outline=ink, width=3)
        col = ink
    _, top, _, bot = f.getbbox(text)
    _track(d, (x + pad, y + (h - (bot - top)) / 2 - top), text, f, col, tracking=tracking)
    return w


_SG = os.path.expanduser("~/Library/Fonts/SpaceGrotesk[wght].ttf")   # google/fonts, OFL, installed 2026-09-03


def sub_font(size: int):
    """The listing sub-line face: Space Grotesk Bold (a variable font - select the Bold
    instance, PIL's default is Regular). Barlow Bold only if the file is missing."""
    if os.path.exists(_SG):
        f = ImageFont.truetype(_SG, size)
        f.set_variation_by_name("Bold")
        return f
    return gp.font("Barlow-Bold.ttf", size)


def vcap(im: Image.Image, safe, title: str, sub: str = "", pill: str = "", pill2: str = "") -> None:
    """Burned-in caption in the LISTING HERO system - and only that system.

    Owner, 2026-09-03: an Anton headline set LEFT; optionally a sub-line in the listing's
    sub-line face (Space Grotesk Bold 46 under a ~130 Anton on the slides - the ratio here
    is smaller, 84:44, because video gives the eye less time); then a clearly larger gap;
    then any supporting label as a pill - a filled orange one first, an outlined one second
    (the hero's `PRINTED OR DIGITAL` / `18x24 - 24x36 - 30x40` pair). No eyebrow, no
    gradient, no bar. On photographs the ink is white with a soft shadow; on the cream
    surface it is INK, and the sub-line is the slide's grey. Sits above the platform inset.
    """
    _, bottom, _ = safe
    x0, maxw = 72, VW - 144
    f_head, f_sub, f_pill = gp.font("Anton-Regular.ttf", 84), sub_font(44), gp.font("Barlow-SemiBold.ttf", 27)
    d0 = ImageDraw.Draw(im)
    # a manual newline in the headline is a deliberate break (avoids a one-word last line)
    lines = [ln for part in title.split("\n") for ln in wrap(d0, part, f_head, maxw)]
    subs = wrap(d0, sub, f_sub, maxw) if sub else []
    lead, slead = round(84 * 0.98), round(44 * 1.22)
    n_p = (1 if pill else 0) + (1 if pill2 else 0)
    h = len(lines) * lead + (10 + len(subs) * slead if subs else 0) + (38 if n_p else 0) + n_p * 58 + max(0, n_p - 1) * 14
    y_top = VH - bottom - 28 - h
    light = _luma(im, (0, y_top - 20, VW, VH - bottom)) > 140
    ink = INK if light else (255, 255, 255)
    sub_ink = (78, 82, 90) if light else (232, 234, 238)
    lay = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    y = y_top
    for ln in lines:
        d.text((x0, y), ln, font=f_head, fill=ink)
        y += lead
    if subs:
        y += 10
        for ln in subs:
            d.text((x0, y), ln, font=f_sub, fill=sub_ink)
            y += slead
    if n_p:
        y += 38
    if pill:
        _pill(d, x0, y, pill, f_pill, True, ink)
        y += 58 + 14
    if pill2 and f_pill.getlength(pill2) + 2 * (len(pill2) - 1) + 60 <= maxw:
        _pill(d, x0, y, pill2, f_pill, False, ink)
    if not light:
        sh = Image.new("RGBA", (VW, VH), (0, 0, 0, 0))
        sh.paste(lay, (3, 5), lay)
        sh = sh.filter(ImageFilter.GaussianBlur(6))
        dark = Image.new("RGBA", (VW, VH), (0, 0, 0, 0)); dark.putalpha(sh.getchannel("A").point(lambda v: int(v * 0.8)))
        im.paste(dark, (0, 0), dark)
    im.paste(lay, (0, 0), lay)


def vask(im: Image.Image, safe) -> None:
    """The closing frame's ask, also inside the safe box.

    Ink is chosen from the frame itself. The closing beat of some reels lands on the cream
    surface and of others on navy; a hardcoded white wordmark simply vanished on the cream one.
    """
    _, bottom, _ = safe
    band = im.crop((0, VH - bottom - 260, VW, VH - bottom - 40)).convert("L")
    light = sum(band.getdata()) / (band.width * band.height) > 128
    d = ImageDraw.Draw(im)
    mark = gp.wordmark_img(76, light)
    y = VH - bottom - 190
    if mark is not None:
        im.paste(mark, ((VW - mark.width) // 2, y), mark)
    d.text((VW // 2, y + 112), "gamedayedition.etsy.com", font=gp.body(38),
           fill=gp.INK_SOFT if light else gp.SILVER, anchor="ma")


# ---- reel 01, rebuilt 2026-09-02 ------------------------------------------------------
# The first cut was stills with pushes. The owner held it back: "check other videos we made
# for listings - was stronger". The listing videos open on REAL MOTION (Tui driving a sled),
# show a hand scrolling an actual camera roll, and show the genuine build (identity plate +
# laid-out kit). Those three beats are what this version adds; everything is sourced from
# clips already in the repo, and the phone gallery is composited per frame onto the black
# screen of the Veo phone clip (the screen is stable within ~5 px over 180 frames - measured).
TUI_CLIP   = "etsy/video/trial/tui-action-veo.mp4"     # 1080x1920, 24 fps, 8 s
PHONE_DIR  = "etsy/video/trial/_f-phone"               # 1080x1920, 30 fps, 240 frames
IDENT_PNG  = f"art-pipeline/out/athletes/{HERO}/_identity.png"
KIT_PNG    = f"art-pipeline/out/athletes/{HERO}/_kit.png"
_tui_dir: str | None = None


def _find_coeffs(dst, src):
    import numpy as np
    A = []
    for (x, y), (X, Y) in zip(dst, src):
        A.append([X, Y, 1, 0, 0, 0, -x * X, -x * Y])
        A.append([0, 0, 0, X, Y, 1, -y * X, -y * Y])
    b = np.array([c for p in dst for c in p], dtype=np.float64)
    return np.linalg.solve(np.array(A, dtype=np.float64), b)


def tui_frame(t: float, secs: float, start: float = 0.3) -> Image.Image:
    """Frame of the sled clip at reel time t in [0,1] over `secs`, from `start` s in.

    Extracted once per run with ffmpeg at the reel's own FPS so the clip is never re-timed.
    The 0.3-2.8 s window was chosen on a contact strip: after ~2 s the camera drifts and the
    motion blur takes over.
    """
    global _tui_dir
    n = max(1, round(secs * FPS))
    if _tui_dir is None:
        _tui_dir = tempfile.mkdtemp(prefix="gde-tui-")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(start), "-t", str(secs + 0.2),
                        "-i", TUI_CLIP, "-r", str(FPS), "-vf", f"scale={VW}:{VH}",
                        os.path.join(_tui_dir, "f%04d.png")], check=True)
    k = 1 + min(n - 1, round(t * (n - 1)))
    im = Image.open(os.path.join(_tui_dir, f"f{k:04d}.png")).convert("RGB")
    # a 3 % push so the hook never reads as a still even on a frozen-frame preview
    z = 1.0 + 0.03 * t
    w, h = round(VW * z), round(VH * z)
    im = im.resize((w, h), Image.LANCZOS)
    return im.crop(((w - VW) // 2, (h - VH) // 2, (w - VW) // 2 + VW, (h - VH) // 2 + VH))


class PhoneGallery:
    """The hand-and-phone clip with the athlete's own camera roll on its screen.

    The black screen is found per frame (largest near-black blob) but the four corners are
    NOT used raw: detection noise is 1-3 px frame to frame on top of a ~10 px drift over
    the window, and raw corners made the gallery shake against the phone (owner: "keistai
    shakina"). Each corner coordinate is fitted with a degree-2 polynomial over the whole
    window, so the gallery follows the hand's slow drift and nothing else. The thumb is
    re-pasted opaque so a finger crosses the photos - no finger reads as fake.
    """
    GW, GH, GAP = 640, 1300, 5
    TILES = [(0, 0.30), (1, 0.34), (2, 0.36), (3, 0.28), (1, 0.62), (0, 0.66)]
    START = 60                                          # first clean source frame

    def __init__(self, photos: list[str], n_out: int):
        from PIL import ImageOps
        ph = [Image.open(p).convert("RGB") for p in photos[:4]]
        p3, p2 = ph[2], ph[1]
        self.photos = ph + [p3.crop((0, 0, p3.width, int(p3.height * 0.40))),
                            p2.crop((0, 0, p2.width, int(p2.height * 0.34)))]
        self.idxs = [min(238, self.START + round(i * 30 / FPS)) for i in range(n_out)]
        self._prep = {}
        self._fit()

    def _raw(self, idx: int):
        import numpy as np
        from scipy import ndimage as nd
        base = Image.open(f"{PHONE_DIR}/f{idx:04d}.png").convert("RGB")
        a = np.asarray(base).astype(int)
        dark = nd.binary_opening(a.max(axis=2) < 40, iterations=6)
        lab, n = nd.label(dark)
        sizes = nd.sum(dark, lab, range(1, n + 1))
        m = lab == (int(np.argmax(sizes)) + 1)
        ys, xs = np.nonzero(m)
        pts = np.stack([xs, ys], 1)
        sm, df = pts.sum(1), pts[:, 0] - pts[:, 1]
        quad = [pts[i] for i in (sm.argmin(), df.argmax(), sm.argmax(), df.argmin())]
        return base, a, np.array(quad, float)

    def _fit(self):
        import numpy as np
        from scipy import ndimage as nd
        uniq = sorted(set(self.idxs))
        raws = {i: self._raw(i) for i in uniq}
        x = np.array(uniq, float)
        Q = np.array([raws[i][2] for i in uniq])           # (n, 4, 2)
        F = np.empty_like(Q)
        for c in range(4):
            for k in range(2):
                F[:, c, k] = np.polyval(np.polyfit(x, Q[:, c, k], 2), x)
        for j, i in enumerate(uniq):
            base, a, _ = raws[i]
            quad = [tuple(map(float, F[j, c])) for c in range(4)]
            skin = (a[..., 0] > 95) & (a[..., 0] > a[..., 1] + 12) & (a[..., 1] > a[..., 2]) & \
                   (a[..., 0] - a[..., 2] > 18)
            qm = Image.new("L", base.size, 0)
            ImageDraw.Draw(qm).polygon([(int(px), int(py)) for px, py in quad], fill=255)
            skin = skin & (np.asarray(qm) > 0)
            skin = nd.binary_dilation(nd.binary_opening(nd.binary_closing(skin, iterations=4), iterations=2), iterations=2)
            thumb = Image.fromarray((skin * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2))
            coeffs = _find_coeffs([(0, 0), (self.GW, 0), (self.GW, self.GH), (0, self.GH)], quad)
            gm = Image.new("L", (self.GW, self.GH), 0)
            ImageDraw.Draw(gm).rounded_rectangle([0, 0, self.GW - 1, self.GH - 1], 64, fill=255)
            alpha = gm.transform(base.size, Image.PERSPECTIVE, coeffs, Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
            self._prep[i] = (base, coeffs, alpha, thumb)

    def gallery(self, i: int) -> Image.Image:
        from PIL import ImageOps
        g = Image.new("RGB", (self.GW, self.GH), (10, 10, 12))
        tw = (self.GW - self.GAP) // 2
        th = int((self.GH - 2 * self.GAP) / 2.55)
        d = ImageDraw.Draw(g)
        tick_at = [10, 20, 30, 40]
        for k, (pi, bias) in enumerate(self.TILES):
            col, row = k % 2, k // 2
            x, y = col * (tw + self.GAP), row * (th + self.GAP)
            if y >= self.GH:
                break
            g.paste(ImageOps.fit(self.photos[pi], (tw, th), Image.LANCZOS, centering=(0.5, bias)), (x, y))
            if k < 4:
                tt = max(0.0, min(1.0, (i - tick_at[k]) / 7.0))
                if tt > 0:
                    e = 1 - (1 - tt) ** 3
                    r = int(24 * e)
                    cx, cy = x + tw - 38, y + 38
                    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(43, 106, 255))
                    if tt > 0.5 and r > 8:
                        lw = max(3, r // 4)
                        d.line([cx - r * 0.45, cy, cx - r * 0.1, cy + r * 0.38], fill="white", width=lw)
                        d.line([cx - r * 0.1, cy + r * 0.38, cx + r * 0.5, cy - r * 0.35], fill="white", width=lw)
        return g

    def frame(self, i: int) -> Image.Image:
        base, coeffs, alpha, thumb = self._prep[self.idxs[min(i, len(self.idxs) - 1)]]
        f = base.copy()
        warped = self.gallery(i).transform(f.size, Image.PERSPECTIVE, coeffs, Image.BICUBIC)
        warped = Image.eval(warped, lambda v: int(v * 0.93))
        f.paste(warped, (0, 0), alpha)
        f.paste(base, (0, 0), thumb)
        if i < 4:
            f = Image.blend(f, Image.new("RGB", (VW, VH), (255, 255, 255)), (3 - i) / 4.0)
        return f


def _rounded_card(path: str, box: tuple[int, int], pad: int = 14) -> Image.Image:
    from PIL import ImageOps
    art = ImageOps.contain(Image.open(path).convert("RGB"), box, Image.LANCZOS)
    card = Image.new("RGBA", (art.width + 2 * pad, art.height + 2 * pad), (255, 255, 255, 255))
    card.paste(art, (pad, pad))
    m = Image.new("L", card.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, card.width - 1, card.height - 1], 18, fill=255)
    card.putalpha(m)
    return card


_ident_cache: dict = {}


def _ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def _photo_tile(path: str, size=(300, 400)) -> Image.Image:
    from PIL import ImageOps
    t = ImageOps.fit(Image.open(path).convert("RGB"), size, Image.LANCZOS, centering=(0.5, 0.3))
    card = Image.new("RGBA", (size[0] + 16, size[1] + 16), (255, 255, 255, 255))
    card.paste(t, (8, 8))
    m = Image.new("L", card.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, card.width - 1, card.height - 1], 14, fill=255)
    card.putalpha(m)
    return card


def assemble_beat(t: float) -> Image.Image:
    """The build, as the owner asked for it: the four photos FLY IN and become the identity
    plate; the kit is produced from that. Three phases on one dark frame:
      0.00-0.45  photos fly in from the edges and converge into a fanned stack
      0.40-0.65  the stack collapses into the identity plate (crossfade + scale)
      0.60-1.00  the kit rises from below and settles under the plate
    """
    if not _ident_cache:
        _ident_cache["id"] = _rounded_card(IDENT_PNG, (920, 690))
        _ident_cache["kit"] = _rounded_card(KIT_PNG, (470, 470))
        _ident_cache["ph"] = [_photo_tile(p) for p in PHOTOS[:4]]
    im = _bg(False)
    idc, kit, tiles = _ident_cache["id"], _ident_cache["kit"], _ident_cache["ph"]
    id_xy = ((VW - idc.width) // 2, 165)
    cx, cy = VW // 2, 165 + idc.height // 2
    # phase 1: fly in
    starts = [(-360, 260), (VW + 60, 140), (-300, 980), (VW + 40, 900)]
    ends = [(cx - 150 - 44, cy - 200 + 10), (cx - 150 + 44, cy - 200 - 10),
            (cx - 150 - 22, cy - 200 + 26), (cx - 150 + 18, cy - 200 - 22)]
    rots = [-9, 7, -4, 5]
    p1 = _ease(t / 0.45)
    fade_stack = 1.0 - _ease((t - 0.42) / 0.20)
    if fade_stack > 0:
        for k in range(4):
            e = _ease((t - k * 0.05) / 0.42)
            if e <= 0:
                continue
            x = starts[k][0] + (ends[k][0] - starts[k][0]) * e
            y = starts[k][1] + (ends[k][1] - starts[k][1]) * e
            tl = tiles[k].rotate(rots[k] * e, expand=True, resample=Image.BICUBIC)
            a = tl.getchannel("A").point(lambda v: int(v * fade_stack))
            tl.putalpha(a)
            shadowed(im, tl, int(x - (tl.width - tiles[k].width) / 2), int(y - (tl.height - tiles[k].height) / 2),
                     blur=24, drop=14, alpha=int(120 * fade_stack))
    # phase 2: identity appears where the stack was
    e2 = _ease((t - 0.42) / 0.23)
    if e2 > 0:
        sc = 0.92 + 0.08 * e2
        a = idc.resize((int(idc.width * sc), int(idc.height * sc)), Image.LANCZOS)
        a.putalpha(a.getchannel("A").point(lambda v: int(v * e2)))
        shadowed(im, a, cx - a.width // 2, cy - a.height // 2, blur=28, drop=16, alpha=int(140 * e2))
    # phase 3: kit rises
    e3 = _ease((t - 0.60) / 0.40)
    if e3 > 0:
        a = kit.copy()
        a.putalpha(a.getchannel("A").point(lambda v: int(v * e3)))
        ky = 165 + idc.height + 40 + int((1 - e3) * 160)
        shadowed(im, a, (VW - kit.width) // 2, ky, blur=28, drop=16, alpha=int(140 * e3))
    return im


FLIP_FRONT = "card-flip/assets/football-fs/card-front.png"
FLIP_BACK = "card-flip/assets/football-fs/card-back.png"


def card_flip(t: float, light: bool = True, top_f: float = 0.10, box_f: float = 0.56) -> Image.Image:
    """The card turns on its vertical axis, front to back (t 0..1 = 0..180 deg). Width
    follows |cos|, the receding edge shortens a little for perspective, and the face goes
    dark near edge-on. Same box as hold() so the flip lands exactly where the card sat."""
    im = _bg(light)
    front, back = _open(FLIP_FRONT), _open(FLIP_BACK)
    th = t * 3.14159265
    import math
    c, sn = math.cos(th), math.sin(th)
    art = front if c >= 0 else back
    bh = round(VH * box_f)
    bw = round(bh * art.width / art.height)
    if bw > VW - 220:
        bw, bh = VW - 220, round((VW - 220) * art.height / art.width)
    x0c, y0c = VW // 2, round(VH * top_f) + bh // 2
    w = max(2, bw * abs(c))
    persp = 0.05 * sn * (1 if c >= 0 else -1)
    hl, hr = bh * (1 + persp), bh * (1 - persp)
    quad = [(x0c - w / 2, y0c - hl / 2), (x0c + w / 2, y0c - hr / 2),
            (x0c + w / 2, y0c + hr / 2), (x0c - w / 2, y0c + hl / 2)]
    coeffs = _find_coeffs([(0, 0), (art.width, 0), (art.width, art.height), (0, art.height)], quad)
    warped = art.transform((VW, VH), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
    dark = 1.0 - 0.35 * abs(sn)
    rgb = Image.eval(warped.convert("RGB"), lambda v: int(v * dark))
    rgb.putalpha(warped.getchannel("A"))
    sh = rgb.getchannel("A").filter(ImageFilter.GaussianBlur(30)).point(lambda v: int(v * 0.55))
    im.paste(Image.new("RGB", (VW, VH), (0, 0, 0)), (0, 18), sh)
    im.paste(rgb, (0, 0), rgb)
    return im


class WallPoster:
    """A real room photo whose empty frame holds the poster, then a slow push in - the
    poster reel's payoff is the poster ON A WALL WITH MOTION, not a card-style hold.
    The frame's black plate is detected like the phone screen; the poster is warped into
    it with a small inset so the mat stays visible."""
    def __init__(self, room: str, poster: str):
        import numpy as np
        from scipy import ndimage as nd
        base = Image.open(room).convert("RGB")
        a = np.asarray(base).astype(int)
        dark = nd.binary_opening(a.max(axis=2) < 34, iterations=8)
        lab, n = nd.label(dark)
        sizes = nd.sum(dark, lab, range(1, n + 1))
        m = lab == (int(np.argmax(sizes)) + 1)
        ys, xs = np.nonzero(m)
        pts = np.stack([xs, ys], 1)
        sm, df = pts.sum(1), pts[:, 0] - pts[:, 1]
        q = [pts[i].astype(float) for i in (sm.argmin(), df.argmax(), sm.argmax(), df.argmin())]
        cxq = sum(p[0] for p in q) / 4; cyq = sum(p[1] for p in q) / 4
        quad = [(cxq + (p[0] - cxq) * 0.985, cyq + (p[1] - cyq) * 0.985) for p in q]
        art = Image.open(poster).convert("RGB")
        coeffs = _find_coeffs([(0, 0), (art.width, 0), (art.width, art.height), (0, art.height)], quad)
        warped = art.transform(base.size, Image.PERSPECTIVE, coeffs, Image.BICUBIC)
        mask = Image.new("L", (art.width, art.height), 255).transform(base.size, Image.PERSPECTIVE, coeffs, Image.BICUBIC)
        # glass: a touch of the wall's own light on the print
        warped = Image.blend(warped, base, 0.08)
        base.paste(warped, (0, 0), mask.filter(ImageFilter.GaussianBlur(0.8)))
        self.img = base
        self.center = (cxq, cyq)

    def frame(self, t: float) -> Image.Image:
        e = _ease(t)
        iw, ih = self.img.size
        z = 1.0 + 0.08 * e
        h = int(ih / z); w = int(h * VW / VH)
        # start on the room, drift toward the poster
        px, py = self.center
        cx = int(iw * 0.50 + (px - iw * 0.50) * (0.35 + 0.65 * e))
        cy = int(ih * 0.46 + (py - ih * 0.46) * (0.35 + 0.65 * e))
        # keep the poster in the upper ~60 % of the frame: the caption block (headline, sub-line,
        # two pills) needs the bottom clear, and the push-in was dragging the frame down into it
        cy -= int(h * (0.11 + 0.15 * e))
        x0 = max(0, min(iw - w, cx - w // 2)); y0 = max(0, min(ih - h, cy - h // 2))
        return self.img.crop((x0, y0, x0 + w, y0 + h)).resize((VW, VH), Image.LANCZOS)


ROOM_BLANK = "art-pipeline/out/etsy-shots/cheer-room-blank.png"
_wall_cache: dict = {}


def wall(t: float, poster: str = None) -> Image.Image:
    poster = poster or SR_POSTER
    if poster not in _wall_cache:
        _wall_cache[poster] = WallPoster(ROOM_BLANK, poster)
    return _wall_cache[poster].frame(t)


def r_build() -> list[tuple]:
    """Beats for reel 1. Each entry: (seconds, frame_fn(t), caption or None)."""
    n_phone = round(2.2 * FPS)
    pg = PhoneGallery(PHOTOS, n_phone)
    return [
        (2.5, lambda t: tui_frame(t, 2.5), ("IT STARTS WITH\nA REAL PHOTO.", "Off your phone — no photographer needed.", "STEP 1")),
        (0.15, lambda t: Image.new("RGB", (VW, VH), (255, 255, 255)), None),
        (2.2, lambda t: pg.frame(round(t * (n_phone - 1))), ("SEND 4-10 PHOTOS.", "The ones you already have.", "STEP 2")),
        (2.4, lambda t: assemble_beat(t), ("WE REBUILD THEM.", "Identity first, kit second — nothing invented.", "STEP 3")),
        (0.15, lambda t: Image.new("RGB", (VW, VH), (255, 255, 255)), None),
        # card payoff = a FLIP, front to back and back again (owner, 2026-09-03)
        (1.0, lambda t: hold(FLIP_FRONT, min(1.0, t * 3), True, 0.10, 0.56),
         ("THEIR OWN TRADING CARD.", "Six art styles. You approve the proof.", "FIRE & SMOKE")),
        # caption switches exactly at the 90-degree point, so "FRONT AND BACK" never sits on the front
        (0.7, lambda t: card_flip(t * 0.5), ("THEIR OWN TRADING CARD.", "Six art styles. You approve the proof.", "FIRE & SMOKE")),
        (0.7, lambda t: card_flip(0.5 + t * 0.5), ("FRONT AND BACK.", "Their stats, their season.", "FIRE & SMOKE")),
        (0.8, lambda t: card_flip(1.0), ("FRONT AND BACK.", "Their stats, their season.", "FIRE & SMOKE")),
        (1.0, lambda t: card_flip(1.0 - t), ("FRONT AND BACK.", "Their stats, their season.", "FIRE & SMOKE")),
        (2.4, lambda t: card_flip(0.0), "ASK"),
    ]


def r_styles() -> list[tuple]:
    beats = [(2.0, lambda t: push(PHOTOS[1], t), ("ONE ATHLETE.", "One set of photos.", "SIX FINISHES"))]
    for name, path in STYLES:
        beats.append((1.0, (lambda p: lambda t: hold(p, 1.0, False, 0.12, 0.54))(path),
                      (name + ".", "", "ONE ATHLETE · SIX FINISHES")))
    beats.append((3.5, lambda t: hold(STYLES[0][1], min(1.0, t * 3), True, 0.12, 0.54),
                  ("SIX FINISHES.", "Same kid, your pick.", "CHOOSE ONE, OR ALL SIX")))
    beats.append((2.5, lambda t: hold(STYLES[0][1], 1.0, True, 0.12, 0.54), "ASK"))
    return beats


def r_senior() -> list[tuple]:
    """Poster reel: the payoff is the poster ON HER WALL with a slow push, not a hold."""
    return [
        (2.5, lambda t: push(photos_of(SR_SPORT)[0], t), ("SENIOR NIGHT IS COMING.", "", "ONE LAST HOME GAME")),
        (2.0, lambda t: push(photos_of(SR_SPORT)[1], t, 1.0, 1.10),
         ("YOU HAVE THE PHOTOS ALREADY.",)),
        (0.2, lambda t: Image.new("RGB", (VW, VH), (255, 255, 255)), None),
        (6.3, lambda t: wall(t * 0.72), ("WE MAKE THE POSTER.", "You do not have to be crafty.", "PRINTED OR DIGITAL · 18×24 · 24×36")),
        (3.0, lambda t: wall(0.72 + 0.28 * t), "ASK"),
    ]


STEP_PILLS = ["NO STUDIO · NO PHOTOGRAPHER", "THE KIT AND CREST STAY THEIRS",
              "CHANGES ARE FREE", "OR PRINT-READY FILES"]


def r_how() -> list[tuple]:
    art = [lambda t: push(photos_of("volleyball")[0], t),
           lambda t: hold(STYLES[2][1], min(1.0, t * 3), False, 0.12, 0.54),
           lambda t: hold(card_of("soccer", "back"), min(1.0, t * 3), True, 0.12, 0.54),
           lambda t: hold(card_of("cheerleading"), min(1.0, t * 3), True, 0.12, 0.54)]
    beats = [(2.8, art[i], (f"{STEPS[i][0].rstrip('.')}.", STEPS[i][1], f"STEP {i + 1}")) for i in range(4)]
    beats.append((2.8, art[3], "ASK"))
    return beats


REELS = [("01-build", r_build), ("02-six-styles", r_styles),
         ("03-senior-night", r_senior), ("04-how-it-works", r_how)]


# ------------------------------------------------------------------- copy ---
# Written against what actually performs in this niche (SOCIAL-FORMAT-AUDIT.md §1): the
# posts that win are a parent's feeling or a visible build, never a feature list. The DIY
# poster crowd is the buyer, so the line is always "you don't have to be crafty" and never
# anything that makes her craft look like a waste of a Saturday.
CAPTIONS = {
    "01-transform": (
        "Four to ten photos off your phone. That is the whole brief.\n\n"
        "We rebuild your athlete from them - their real kit, their club crest, their number - "
        "and send back a trading card you can actually hold. Nothing about it is invented, and "
        "you see a proof before anything is printed.\n\n"
        "17 sports. Six art styles. Free shipping worldwide."),
    "02-beforeafter": (
        "Top: the photo already on your phone. Below it: what comes back.\n\n"
        "Front and back, print-ready, their name and their crest. Same kid - just finally on "
        "the kind of card the pros get."),
    "03-six-styles": (
        "One athlete. One set of photos. Six completely different finishes.\n\n"
        "Swipe to see all six, then tell me which one you would pick for yours. "
        "(Most people go Stadium Night. I would not argue with Fire & Smoke.)"),
    "04-how-it-works": (
        "The most common question: how complicated is this?\n\n"
        "Four steps. You send photos, you pick a style, you approve a proof, it ships. "
        "That is genuinely all of it - and the proof stage means you never get a surprise."),
    "05-poster": (
        "The poster version. 18x24 or 24x36, printed and shipped free.\n\n"
        "Built from your own photos, so it is your athlete on the wall - not a stock template "
        "with a face dropped into it."),
    "06-sports-range": (
        "\"Do you do my sport?\" - almost certainly yes. 17 of them.\n\n"
        "Football, baseball, softball, basketball, soccer, volleyball, hockey, lacrosse, "
        "wrestling, cheer, gymnastics, track, swim, tennis, golf, pickleball, skateboarding. "
        "If yours is not on the list, message me - we can still build it."),
    "reel-01-build": (
        "How a phone photo becomes their own trading card.\n\n"
        "No studio, no photographer. We lift them out, rebuild the kit and the crest, and you "
        "approve the proof before a single card is printed."),
    "reel-02-six-styles": (
        "Same athlete, same photos, six finishes. Which one is yours?"),
    "reel-03-senior-night": (
        "Senior night is coming and you already have the photos.\n\n"
        "You do not have to be crafty. Send 4-10 photos, we build the poster, you approve it "
        "before it prints."),
    "reel-04-how-it-works": (
        "Four steps, start to finish. Send photos, pick a style, approve the proof, it ships free."),
}

TAGS = {
    "instagram": "#youthsports #sportsmom #seniornight #customtradingcards #sportsgift "
                 "#footballmom #baseballmom #volleyballmom #seniornightposter #teamgift",
    "facebook":  "#youthsports #seniornight #sportsmom",
    "tiktok":    "#seniornight #sportsmom #youthsports #customcard #cardtok #fyp "
                 "#footballmom #seniornightposter",
    "youtube":   "#youthsports #seniornight #shorts",
}


# ------------------------------------------------------------------- main ---
def render_reel(name: str, beats, platforms: list[str]) -> None:
    tmp = tempfile.mkdtemp(prefix="gde-art-")
    specs, n = [], 0
    for secs, fn, cap in beats:
        frames = max(1, round(secs * FPS))
        for i in range(frames):
            fn(i / max(1, frames - 1)).convert("RGB").save(os.path.join(tmp, f"f{n:05d}.png"))
            specs.append(cap)
            n += 1
    for plat in platforms:
        safe = PLATFORMS[plat]["safe"]
        tmp2 = tempfile.mkdtemp(prefix="gde-cap-")
        for k in range(n):
            im = Image.open(os.path.join(tmp, f"f{k:05d}.png")).convert("RGB")
            cap = specs[k]
            if cap == "ASK":
                vask(im, safe)
            elif cap:
                vcap(im, safe, *cap)
            im.save(os.path.join(tmp2, f"f{k:05d}.png"))
        out = f"{OUT}/{plat}/reels/{name}-1080x1920.mp4"
        os.makedirs(os.path.dirname(out), exist_ok=True)
        # a silent AAC track is included on purpose: Instagram web and some schedulers reject
        # video with no audio stream at all; a silent track is replaced in-app like any other
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS),
                        "-i", os.path.join(tmp2, "f%05d.png"),
                        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
                        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "22",
                        "-c:a", "aac", "-b:a", "64k", "-shortest", "-movflags", "+faststart", out],
                       check=True)
        print(f"  {out}  ({n / FPS:.1f}s)")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="", help="one platform, e.g. tiktok")
    ap.add_argument("--no-video", action="store_true")
    ap.add_argument("--no-posts", action="store_true")
    args = ap.parse_args()
    plats = [args.only] if args.only else list(PLATFORMS)

    for plat in plats:
        w, h = PLATFORMS[plat]["post"]
        pdir = f"{OUT}/{plat}/posts"
        os.makedirs(pdir, exist_ok=True)
        if not args.no_posts:
            print(f"{plat}  posts {w}x{h}")
            for name, kind, fn in POSTS:
                for i, im in enumerate(fn(w, h)):
                    suffix = f"-{i + 1:02d}" if kind == "carousel" else ""
                    p = f"{pdir}/{name}{suffix}-{w}x{h}.png"
                    im.save(p)
                    print(f"  {p}")

    if not args.no_video:
        for name, fn in REELS:
            print(f"reels {name}")
            render_reel(name, fn(), plats)

    for plat in plats:
        lines = [f"# {plat} - batch 01\n",
                 f"Post size **{PLATFORMS[plat]['post'][0]}x{PLATFORMS[plat]['post'][1]}**, "
                 f"reels 1080x1920. Sizes and safe zones: `marketing/SOCIAL-FORMAT-AUDIT.md`.\n"]
        if plat == "youtube":
            lines.append("> ⚠️ The six stills cannot be posted yet - YouTube Community posts "
                         "need 500 subscribers. They are rendered so they are ready, and so "
                         "the batch is complete. Post the Shorts.\n")
        for name, kind, _ in POSTS:
            lines += [f"\n## {name} ({kind})\n", CAPTIONS[name], f"\n\n{TAGS[plat]}\n"]
        for name, _ in REELS:
            lines += [f"\n## reel {name}\n", CAPTIONS[f"reel-{name}"], f"\n\n{TAGS[plat]}\n"]
        os.makedirs(f"{OUT}/{plat}", exist_ok=True)
        with open(f"{OUT}/{plat}/captions.md", "w") as fh:
            fh.write("".join(lines))
        print(f"  {OUT}/{plat}/captions.md")


if __name__ == "__main__":
    main()
