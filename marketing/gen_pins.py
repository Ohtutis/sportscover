#!/usr/bin/env python3
"""Render one day's Pinterest batch from assets already in the repo.

  python3 marketing/gen_pins.py --day today
  python3 marketing/gen_pins.py --day 2026-08-29 --days 7      # a week ahead
  python3 marketing/gen_pins.py --day today --video            # also cut the 2:3 video pin

Output per day: marketing/out/<date>/*.png, captions.md (paste-ready) and pinterest.csv
(Pinterest bulk-create). Nothing is uploaded — publishing stays a human action.

WHY 2:3 AND NOT 1:1
Pinterest ranks and crops for 1000x1500. A square pin loses a third of its height in the
feed, which is where the before/after arrow lives. Every template here is 1000x1500.
"""
from __future__ import annotations

import argparse, csv, datetime as dt, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import engine  # noqa: E402

ROOT = engine.ROOT
os.chdir(ROOT)
W, H = 1000, 1500
FONTS = os.path.expanduser("~/Library/Fonts")
NAVY_T, NAVY_B = (16, 24, 40), (5, 8, 15)
ACCENT = (255, 107, 43)
SILVER = (214, 219, 228)
WHITE = (255, 255, 255)
# Sampled from the Figma listing slides — the pins share that surface system rather than
# inventing one: cream ground, navy ink, orange accent, corner brackets, real wordmark.
# Owner's direction 2026-09-01: "dizaino flavour yra tau Figmoje pateiktas", and the batch
# must MIX light and dark rather than being uniformly dark.
CREAM_T, CREAM_B = (247, 246, 244), (237, 236, 231)
INK = (21, 27, 39)
INK_SOFT = (94, 103, 118)


class Surface:
    """Which of the two grounds a pin is painted on. Everything else derives from it."""

    def __init__(self, light_ground: bool):
        self.light = light_ground
        self.top, self.bot = (CREAM_T, CREAM_B) if light_ground else (NAVY_T, NAVY_B)
        self.ink = INK if light_ground else WHITE
        self.muted = INK_SOFT if light_ground else SILVER
        self.rule = (214, 210, 202) if light_ground else (38, 46, 62)


def font(name, size):
    return ImageFont.truetype(f"{FONTS}/{name}", size)


def display(size):  return font("Anton-Regular.ttf", size)
def body(size):     return font("Barlow-SemiBold.ttf", size)
def light(size):    return font("Barlow-Regular.ttf", size)


# ------------------------------------------------------------------ paint ---
def bg(surface: "Surface | None" = None) -> Image.Image:
    surface = surface or Surface(False)
    im = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)],
               fill=tuple(int(a + (b - a) * t) for a, b in zip(surface.top, surface.bot)))
    brackets(d)
    return im


def brackets(d: ImageDraw.ImageDraw, inset: int = 26, arm: int = 54, w: int = 3):
    """The four orange corner L's the listing slides are framed with."""
    for x, y, dx, dy in ((inset, inset, 1, 1), (W - inset, inset, -1, 1),
                         (inset, H - 88 - inset, 1, -1), (W - inset, H - 88 - inset, -1, -1)):
        d.line([(x, y), (x + arm * dx, y)], fill=ACCENT, width=w)
        d.line([(x, y), (x, y + arm * dy)], fill=ACCENT, width=w)


def wordmark_img(h: int, ink_light: bool) -> "Image.Image | None":
    """The brand wordmark asset, tinted for the surface it sits on."""
    if not os.path.exists(WORDMARK):
        return None
    m = Image.open(WORDMARK).convert("RGBA")
    m = m.resize((round(m.width * h / m.height), h), Image.LANCZOS)
    if ink_light:                                  # white art -> navy, for cream grounds
        solid = Image.new("RGBA", m.size, INK + (255,))
        solid.putalpha(m.getchannel("A"))
        m = solid
    return m


def cover(path: str, w: int, h: int, focus: float = 0.42) -> Image.Image:
    """Fill w x h, cropping the overflow. `focus` = where vertically to keep (0 = top)."""
    src = Image.open(path).convert("RGB")
    s = max(w / src.width, h / src.height)
    src = src.resize((max(1, round(src.width * s)), max(1, round(src.height * s))), Image.LANCZOS)
    x = (src.width - w) // 2
    y = min(max(0, round(src.height * focus - h / 2)), src.height - h)
    return src.crop((x, y, x + w, y + h))


def subject_box(cutout: str) -> tuple[int, int, int, int] | None:
    """Bounding box of the athlete, from the BiRefNet cutout's alpha. The top edge of this
    box is the top of the head — the one pixel row the crop is not allowed to lose."""
    a = Image.open(cutout).convert("RGBA").getchannel("A").point(lambda v: 255 if v > 16 else 0)
    return a.getbbox()


def cover_subject(path: str, w: int, h: int, cutout: str | None, head: float = 0.07,
                  tight: float = 1.0) -> Image.Image:
    """Fill w x h with the HEAD guaranteed inside the frame.

    A full-body 2:3 render cropped into a landscape band by geometry alone decapitates the
    athlete — it happened on the first batch, on basketball and on football, and a pin whose
    subject has no face proves nothing at all. So the crop is anchored to the cutout's alpha
    bbox: the top of the head lands `head` of the way down the band, and the legs are what
    gets lost instead. No cutout (a customer photo, a slide) falls back to `cover`.
    """
    if not cutout or not os.path.exists(cutout):
        return cover(path, w, h, 0.34)
    box = subject_box(cutout)
    if not box:
        return cover(path, w, h, 0.34)
    src = Image.open(path).convert("RGB")
    s = max(w / src.width, h / src.height) * tight
    sw, sh = max(1, round(src.width * s)), max(1, round(src.height * s))
    src = src.resize((sw, sh), Image.LANCZOS)
    x0, y0, x1, y1 = [round(v * s) for v in box]
    x = min(max(0, (x0 + x1) // 2 - w // 2), max(0, sw - w))
    y = min(max(0, y0 - round(h * head)), max(0, sh - h))
    return src.crop((x, y, x + w, y + h))


def chip(d: ImageDraw.ImageDraw, xy, text, fill=ACCENT, fg=WHITE, f=None):
    f = f or body(26)
    x, y = xy
    tw = d.textlength(text, font=f)
    d.rounded_rectangle([x, y, x + tw + 44, y + 52], 26, fill=fill)
    d.text((x + 22, y + 26), text, font=f, fill=fg, anchor="lm")
    return tw + 44


def fit_lines(d, lines, f_factory, max_w, start_size):
    """Largest display size at which every line fits max_w."""
    size = start_size
    while size > 22:
        f = f_factory(size)
        if all(d.textlength(l, font=f) <= max_w for l in lines):
            return f
        size -= 2
    return f_factory(22)


def wrap(d, text, f, max_w):
    out, line = [], ""
    for word in text.split():
        t = (line + " " + word).strip()
        if d.textlength(t, font=f) <= max_w:
            line = t
        else:
            out.append(line); line = word
    if line:
        out.append(line)
    return out


def scrim(im: Image.Image, top: int, strength: int = 232):
    """Darken from `top` down so type reads over art."""
    ov = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(ov)
    for y in range(top, H):
        d.line([(0, y), (W, y)], fill=int(strength * ((y - top) / max(1, H - top)) ** 0.85))
    im.paste(Image.new("RGB", (W, H), (4, 7, 14)), (0, 0), ov)


# The brand mark is an ASSET, not a typed line. Setting "GAME DAY EDITION" in the pin's own
# display font produced a different lockup from the one on every card, poster and listing
# slide — the two-line wordmark with its own weights and spacing. Owner's call, 2026-09-01.
WORDMARK = "etsy/video/trial/gde-wordmark.png"


def footer(im: Image.Image, right: str = "", surface: "Surface | None" = None):
    surface = surface or Surface(False)
    d = ImageDraw.Draw(im)
    band = (250, 249, 247) if surface.light else (4, 7, 14)
    d.rectangle([0, H - 88, W, H], fill=band)
    d.rectangle([0, H - 92, W, H - 88], fill=ACCENT)
    mark = wordmark_img(46, surface.light)
    if mark is not None:
        im.paste(mark, (44, H - 44 - mark.height // 2), mark)
    else:
        d.text((44, H - 44), "GAME DAY EDITION", font=display(30),
               fill=surface.ink, anchor="lm")
    if right:
        d.text((W - 44, H - 44), right, font=body(24), fill=surface.muted, anchor="rm")


# ---------------------------------------------------------------- canvases ---
# Every surface has its own frame, and rendering one size for all of them is what makes a
# post look borrowed. Pinterest ranks 2:3; Reddit's gallery viewer is a landscape box that
# letterboxes anything tall (owner caught a 2:3 frame sitting in it with blurred bars);
# Instagram's feed tops out at 4:5. Check the target before rendering, never after.
CANVAS = {"pinterest": (1000, 1500), "reddit": (1080, 1080), "instagram": (1080, 1350)}


class canvas:
    """Temporarily render at another frame size: `with canvas("reddit"): ...`"""

    def __init__(self, name: str):
        self.size = CANVAS[name]

    def __enter__(self):
        global W, H
        self.prev = (W, H)
        W, H = self.size
        return self

    def __exit__(self, *exc):
        global W, H
        W, H = self.prev
        return False


def surface_for(item: dict) -> Surface:
    """Light or dark, decided by the pin's own id so a re-run repaints it identically.
    The listing slides mix both grounds; a feed of nothing but dark pins reads as one
    long advert, and Pinterest's grid is where that shows."""
    n = int(item["id"].split("-")[1])            # 1-based position in the day's batch
    return Surface(n % 2 == 1)


# -------------------------------------------------------------- templates ---
def card_with_shadow(im: Image.Image, path: str, box: tuple[int, int, int, int]) -> None:
    """Paste a card at `box` with a soft drop shadow, so it reads as an object and not as a
    rectangle of artwork."""
    x, y, w, h = box
    sh = Image.new("RGBA", (w + 80, h + 80), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([40, 46, w + 40, h + 46], 14, fill=(0, 0, 0, 165))
    sh = sh.filter(ImageFilter.GaussianBlur(16))
    under = im.crop((x - 40, y - 40, x - 40 + sh.width, y - 40 + sh.height)).convert("RGBA")
    im.paste(Image.alpha_composite(under, sh).convert("RGB"), (x - 40, y - 40))
    card = Image.open(path).convert("RGB").resize((w, h), Image.LANCZOS)
    im.paste(card, (x, y))


def t_beforeafter(item, assets) -> Image.Image:
    """The transformation, and the AFTER has to be the PRODUCT.

    The first version put the rebuilt athlete art in the bottom half, and the owner called it
    exactly right: two photographs of a kid do not tell anyone they are buying a card. The
    after is now the real card, FRONT and BACK, both smaller — which is also the honest
    version, because the card is what actually ships.
    """
    sf = surface_for(item)
    im = bg(sf)
    d = ImageDraw.Draw(im)
    head = [l for l in item["headline"].split("\n") if l]
    f = fit_lines(d, head, display, W - 96, 66)
    y = 44
    for l in head:
        d.text((W // 2, y), l, font=f, fill=sf.ink, anchor="ma")
        y += f.size + 4
    top = y + 20

    gap, band = 22, 72
    cw = (W - 96 - 28) // 2
    ch = round(cw * 1050 / 750)
    hb = H - 88 - 26 - ch - band - gap - top

    im.paste(cover(assets["before"], W - 96, hb, 0.33), (48, top))
    d.rectangle([48, top, W - 48, top + hb], outline=(60, 70, 90), width=2)
    chip(d, (68, top + 18), "THEIR PHONE PHOTO", fill=INK, fg=(236, 238, 242), f=body(24))

    by = top + hb + gap
    d.rectangle([48, by, W - 48, by + band], fill=(10, 14, 24))
    d.polygon([(W // 2 - 24, by + 20), (W // 2 - 24, by + 50), (W // 2 + 24, by + 35)], fill=ACCENT)
    d.text((150, by + band // 2), "SAME KID", font=body(26), fill=sf.muted, anchor="lm")
    d.text((W - 150, by + band // 2), "REAL CARD", font=body(26), fill=sf.muted, anchor="rm")

    cy = by + band + gap
    card_with_shadow(im, assets["card_front"], (48, cy, cw, ch))
    card_with_shadow(im, assets["card_back"], (48 + cw + 28, cy, cw, ch))
    d = ImageDraw.Draw(im)
    d.text((W // 2, cy + ch + 16), "FRONT AND BACK  ·  PRINT-READY 300 DPI",
           font=body(24), fill=(150, 158, 172), anchor="ma")
    footer(im, item["sport"]["name"].upper(), surface=sf)
    return im


def t_product(item, assets) -> Image.Image:
    """The art as a PRINTED POSTER, not as a photo. A pin that shows only art reads as a
    stock sports picture; the white border and the drop shadow are what say `product`."""
    sf = surface_for(item)
    im = bg(sf)
    d = ImageDraw.Draw(im)
    occ = engine.OCCASIONS[item["occasion"]]["label"]
    chip(d, (48, 48), (occ or item["sport"]["name"]).upper())

    head = [l for l in item["headline"].format(NAME=item["sport"]["name"].upper()).split("\n") if l]
    f = fit_lines(d, head, display, W - 96, 68)
    y = 128
    for l in head:
        d.text((48, y), l, font=f, fill=sf.ink)
        y += f.size + 6
    top = y + 62          # the poster frame must never touch the headline

    box_h = H - 88 - 96 - top
    art = Image.open(assets["poster"]).convert("RGB")
    ar = art.width / art.height          # the poster's own ratio; 18x24 and 24x36 are both 3:4
    ph = box_h
    pw = round(ph * ar)
    if pw > W - 200:                     # never let the mat run into the pin edges
        pw = W - 200
        ph = round(pw / ar)
    px, py = (W - pw) // 2, top + (box_h - ph) // 2
    pad = 26
    sh = Image.new("RGBA", (pw + pad * 2 + 60, ph + pad * 2 + 60), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([30, 34, pw + pad * 2 + 30, ph + pad * 2 + 34], fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(20))
    im.paste(Image.alpha_composite(im.crop((px - pad - 30, py - pad - 30,
             px - pad - 30 + sh.width, py - pad - 30 + sh.height)).convert("RGBA"), sh).convert("RGB"),
             (px - pad - 30, py - pad - 30))
    d = ImageDraw.Draw(im)
    d.rectangle([px - pad, py - pad, px + pw + pad, py + ph + pad], fill=(246, 246, 244))
    im.paste(art.resize((pw, ph), Image.LANCZOS), (px, py))
    d.text((W // 2, py + ph + pad + 34),
           "Built from your own photos  ·  6 art styles  ·  you approve the proof",
           font=light(24), fill=sf.muted, anchor="ma")
    footer(im, "18x24 & 24x36 · PRINTED OR DIGITAL", surface=sf)
    return im


def t_slide(item, assets) -> Image.Image:
    sf = surface_for(item)
    im = bg(sf)
    blur = cover(assets["slide"], W, H, 0.5).filter(ImageFilter.GaussianBlur(38))
    im.paste(Image.blend(blur, Image.new("RGB", (W, H), (6, 10, 18)), 0.55), (0, 0))
    d = ImageDraw.Draw(im)
    head = [l for l in item["headline"].split("\n") if l]
    f = fit_lines(d, head, display, W - 96, 62)
    y = 52
    for l in head:
        d.text((W // 2, y), l, font=f, fill=sf.ink, anchor="ma")
        y += f.size + 4
    top = y + 26
    box_h = H - 88 - 40 - top
    src = Image.open(assets["slide"]).convert("RGB")
    s = min((W - 56) / src.width, box_h / src.height)
    sw, sh = round(src.width * s), round(src.height * s)
    px, py = (W - sw) // 2, top + (box_h - sh) // 2
    d.rectangle([px - 6, py - 6, px + sw + 6, py + sh + 6], fill=(0, 0, 0))
    im.paste(src.resize((sw, sh), Image.LANCZOS), (px, py))
    footer(im, "WHAT YOU GET", surface=sf)
    return im


def t_list(item, assets) -> Image.Image:
    sf = surface_for(item)
    im = bg(sf)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 14], fill=ACCENT)
    head = [l for l in item["list"]["title"].split("\n") if l]
    f = fit_lines(d, head, display, W - 112, 74)
    y = 92
    for l in head:
        d.text((56, y), l, font=f, fill=sf.ink)
        y += f.size + 8
    y += 30
    d.rectangle([56, y, 176, y + 7], fill=ACCENT)
    y += 58
    for i, line in enumerate(item["list"]["lines"], 1):
        d.text((56, y + 4), f"{i}", font=display(40), fill=ACCENT)
        for j, part in enumerate(wrap(d, line, body(34), W - 190)):
            d.text((116, y + j * 44), part, font=body(34), fill=sf.muted)
        y += 44 * max(1, len(wrap(d, line, body(34), W - 190))) + 34
    if assets.get("after"):
        th = min(430, H - 88 - 40 - y)
        if th > 150:
            tw = round(th * 0.72)
            im.paste(cover_subject(assets["after"], tw, th, assets.get("cutout"), tight=assets["tight"]),
                     (W - 56 - tw, H - 88 - 34 - th))
    footer(im, engine.OCCASIONS[item["occasion"]]["label"].upper() or "GIFT IDEAS", surface=sf)
    return im


def t_spec(item, assets) -> Image.Image:
    """The category's own convention: light ground, the product big, and the promises listed.

    Every competing shop on this Pinterest query runs some version of this layout, which is
    evidence about what the audience recognises, not a reason to copy anyone's wording. So
    the FORM is the convention and the CONTENT is ours — and every bullet has to be true of
    what actually ships. The dark before/after pin stays the differentiator; this one is the
    pin that looks like it belongs in the results.
    """
    sf = Surface(True)                     # this template is the light one by definition
    CREAM, MUTED = sf.top, sf.muted
    im = bg(sf)
    d = ImageDraw.Draw(im)
    d.text((W // 2, 46), "ONLY AT GAME DAY EDITION", font=body(23), fill=MUTED, anchor="ma")

    head = [f"CUSTOM {item['sport']['name'].upper()}", "TRADING CARD"]
    f = fit_lines(d, head, display, W - 120, 82)
    y = 96
    for l in head:
        d.text((W // 2, y), l, font=f, fill=sf.ink, anchor="ma")
        y += f.size + 4
    d.text((W // 2, y + 16), "Built from your photos. Not a template.",
           font=light(28), fill=MUTED, anchor="ma")

    top = y + 76
    lines = engine.SPEC_LINES
    bullets_h = len(lines) * 52 + 20
    box_h = H - 88 - 34 - bullets_h - top
    card = Image.open(assets["card"]).convert("RGB")
    cw = min(560, round(box_h * card.width / card.height))
    ch = round(cw * card.height / card.width)
    cx, cy = (W - cw) // 2, top + (box_h - ch) // 2
    sh = Image.new("RGBA", (cw + 90, ch + 90), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([45, 52, cw + 45, ch + 52], fill=(0, 0, 0, 90))
    sh = sh.filter(ImageFilter.GaussianBlur(22))
    im.paste(Image.alpha_composite(
        im.crop((cx - 45, cy - 45, cx - 45 + sh.width, cy - 45 + sh.height)).convert("RGBA"),
        sh).convert("RGB"), (cx - 45, cy - 45))
    im.paste(card.resize((cw, ch), Image.LANCZOS), (cx, cy))

    d = ImageDraw.Draw(im)
    by = top + box_h + 10
    for line in lines:
        d.rectangle([64, by + 12, 82, by + 30], fill=ACCENT)
        d.text((104, by + 21), line, font=body(29), fill=sf.ink, anchor="lm")
        by += 52

    footer(im, "17 SPORTS · ANY AGE", surface=sf)
    return im


def t_transform(item, assets) -> Image.Image:
    """`photos in -> product out`, ASSEMBLED HERE from the separate elements.

    Owner's direction 2026-09-01: do not re-upload the Figma listing slides. They carry the
    slide numbering ("02 / 20") that belongs inside a listing, and re-posting the same
    exported picture everywhere makes every channel look like the same advert. Composing it
    from the raw parts — the athlete's own before photos, the finished card or poster, the
    surface, the type — means every post is unique and nothing has to be re-exported.
    """
    sf = surface_for(item)
    im = bg(sf)
    d = ImageDraw.Draw(im)

    product_is_card = assets.get("kind") == "card"
    head = ["THEIR PHOTOS.", "THEIR OWN TRADING CARD." if product_is_card else "THEIR CUSTOM POSTER."]
    f = fit_lines(d, head, display, W - 96, 58)
    y = 66
    for l in head:
        d.text((48, y), l, font=f, fill=sf.ink)
        y += f.size + 2
    top = y + 26

    caption_h = 96                     # one honest sentence, above the footer
    avail = H - 88 - caption_h - top - 26

    # right: the finished thing, as tall as the canvas allows
    col_w, gap = 258, 30
    prod = Image.open(assets["product"]).convert("RGB")
    rh = avail
    rw = round(rh * prod.width / prod.height)
    if rw > W - 96 - col_w - gap:      # product is wider than the frame allows
        rw = W - 96 - col_w - gap
        rh = round(rw * prod.height / prod.width)
        top += (avail - rh) // 2       # …so the block centres instead of leaving a hole
    # centre the whole block horizontally too — a square frame leaves slack a 2:3 one does not
    xoff = max(48, (W - (col_w + gap + rw)) // 2)
    rx = xoff + col_w + gap
    card_shadow(im, (rx, top, rw, rh))
    im.paste(prod.resize((rw, rh), Image.LANCZOS), (rx, top))

    # left: the photos that came in, as prints, sized to end level with the product
    chip_h = 104
    ph_h = (rh - chip_h - gap * 2) // 2
    px, py = xoff, top
    for p in assets["photos"][:2]:
        shot = cover(p, col_w - 20, ph_h - 20, focus=0.36)
        card_shadow(im, (px, py, col_w, ph_h), blur=14)
        dd = ImageDraw.Draw(im)
        dd.rectangle([px, py, px + col_w, py + ph_h], fill=(255, 255, 255))
        im.paste(shot, (px + 10, py + 10))
        py += ph_h + gap
    d = ImageDraw.Draw(im)
    d.rectangle([px, py, px + col_w, py + chip_h], fill=INK)
    d.rectangle([px + 20, py + 22, px + 58, py + 26], fill=ACCENT)
    d.text((px + 20, py + 40), "NOT A FILTER", font=body(18), fill=ACCENT)
    d.text((px + 20, py + 62), "BUILT FROM SCRATCH", font=display(24), fill=WHITE)

    cy = top + rh + 30
    # A numberless sport must never be promised a number — same rule as the captions.
    what = ("the kit, the number and the crest" if item["sport"].get("numbered", True)
            else "the kit, the crest and the name")
    d.text((xoff, cy), f"Both photos came off a phone. And {what}", font=light(26), fill=sf.muted)
    d.text((xoff, cy + 34), "come from the photos — nothing about them is invented.",
           font=light(26), fill=sf.muted)

    footer(im, item["sport"]["name"].upper(), surface=sf)
    return im


def card_shadow(im: Image.Image, box: tuple[int, int, int, int], blur: int = 18) -> None:
    x, y, w, h = box
    sh = Image.new("RGBA", (w + 90, h + 90), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([45, 52, w + 45, h + 52], fill=(0, 0, 0, 120))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    under = im.crop((x - 45, y - 45, x - 45 + sh.width, y - 45 + sh.height)).convert("RGBA")
    im.paste(Image.alpha_composite(under, sh).convert("RGB"), (x - 45, y - 45))


RENDER = {"transform": t_transform, "beforeafter": t_beforeafter, "product": t_product, "slide": t_slide,
          "list": t_list, "spec": t_spec}


# ------------------------------------------------------------------ audit ---
def headline_size(lines: list[str], max_w: int, start: int) -> int:
    """The size fit_lines will settle on — recomputed rather than smuggled out of the
    template, so the audit stays independent of the renderer."""
    d = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    return fit_lines(d, lines, display, max_w, start).size


def audit(item, assets, im: Image.Image, cfg: dict, seen: dict) -> list[str]:
    """Mechanical checks on the rendered pin. A pin is a promise about what is in it, so
    every claim it makes has to be checkable without eyes: the head is in the frame, the
    athlete is big enough to read at 236 px, and the label matches the link."""
    out = []
    if assets.get("cutout") and assets.get("after"):
        box = subject_box(assets["cutout"])
        src = Image.open(assets["after"])
        if box:
            frac = (box[3] - box[1]) / src.height
            if frac < 0.25:
                out.append(f"subject fills only {frac:.0%} of the source frame")
    if item["template"] == "beforeafter" and not (assets.get("card_front") and assets.get("card_back")):
        out.append("no exported card for this sport — the after half cannot show the product")
    # The headline names the product in the picture, or it is a promise the pin does not keep.
    head_txt = (item.get("headline") or "").upper()
    if item["template"] == "product" and "CARD" in head_txt:
        out.append("a poster pin headlined as a CARD")
    if item["template"] == "spec" and "POSTER" in head_txt:
        out.append("a card pin headlined as a POSTER")
    if item["template"] == "product" and not assets.get("poster"):
        out.append("product pin without finished poster art — it would show raw athlete art")
    for w, occ in engine.HEADLINE_OCCASION.items():
        if w in head_txt and item.get("occasion") != occ:
            out.append(f"headline says {w} but the pin's occasion is '{item.get('occasion')}'"
                       " — chip, caption and headline must tell one story")
    if im.convert("L").resize((1, 1)).getpixel((0, 0)) < 12:
        out.append("pin is almost entirely black — check the source art")

    # A pin is judged in a 236 px column. Below ~46 px on a 1000 px canvas the headline is
    # under 11 px there, which is a grey smear, not a claim.
    head = item["list"]["title"] if item["template"] == "list" else item.get("headline", "")
    lines = [l for l in head.format(NAME=(item["sport"] or {}).get("name", "").upper()).split("\n") if l]
    if lines:
        size = headline_size(lines, W - 112, 84)
        if size < 46:
            out.append(f"headline renders at {size} px — under 11 px in the Pinterest grid; "
                       f"shorten it")

    # The link must resolve to the thing in the picture. A cheer pin landing on the shop
    # front is how Pinterest learns a pin is bait.
    link = engine.caption(item, cfg)["link"].split("?")[0]
    if link == cfg["links"]["shop"] and item["template"] != "list":
        out.append(f"LINK|{(item['sport'] or {}).get('name')}")

    # The same source frame twice inside ten days reads as a repost, and Pinterest treats
    # near-duplicates as one pin.
    # A before/after with a different "before" photo is a different picture, so the repeat
    # key is the whole composition, not just the athlete frame.
    key = f"{assets.get('after')}|{assets.get('before') if item['template'] == 'beforeafter' else ''}"
    prev = seen.get(key)
    if prev and (dt.date.fromisoformat(item["date"]) - prev).days < 10:
        out.append(f"reuses the same composition, last seen {prev} — inside the 10-day window")
    seen[key] = dt.date.fromisoformat(item["date"])
    return out


def contact_sheet(paths: list[str], dest: str) -> None:
    if not paths:
        return
    w, h = 300, 450
    sheet = Image.new("RGB", (len(paths) * (w + 10) + 10, h + 20), (18, 18, 20))
    for i, p in enumerate(paths):
        sheet.paste(Image.open(p).resize((w, h), Image.LANCZOS), (10 + i * (w + 10), 10))
    sheet.save(dest, "PNG")


# ----------------------------------------------------------------- assets ---
def first(*paths):
    for p in paths:
        if p and os.path.exists(p):
            return p
    return None


def slides(cfg) -> list[str]:
    """Only slides that survive the 236 px grid. A dense diagram is unreadable as a pin —
    the filter is a whitelist of words in the exported slide names, not a blanket glob."""
    keep = [w.lower() for w in cfg.get("slide_keywords", [])]
    out = []
    for d in cfg.get("slide_dirs", []):
        if os.path.isdir(d):
            for f in sorted(os.listdir(d)):
                if not f.lower().endswith((".jpg", ".png")) or f.startswith("."):
                    continue
                if keep and not any(w in f.lower() for w in keep):
                    continue
                out.append(os.path.join(d, f))
    return out


def _slide_for(slug: str, pool: list[str], i: int) -> str | None:
    """A slide may only stand for the sport in the picture. Decks exported for ONE sport carry
    that sport in the folder name ("Digital poster basketball"); decks for all sports say so
    ("all sports"). A soccer slot pulled a basketball slide from the shared pool on 2026-09-03."""
    own = [p for p in pool if slug and slug in os.path.dirname(p).lower()]
    multi = [p for p in pool if "all sports" in os.path.dirname(p).lower()]
    use = own or multi
    return use[i % len(use)] if use else None


def resolve(item, cfg, slide_pool, i) -> dict | None:
    a = item["sport"]["athlete"] if item["sport"] else "basketball"
    ap, wk = f"art-pipeline/out/approved/{a}", f"art-pipeline/out/athletes/{a}"
    after = first(f"{ap}/{item['pose']}.png", f"{wk}/{item['pose']}.png", f"{ap}/hero.png", f"{wk}/hero.png")
    before = first(f"{wk}/before/photo{item['photo']}.png", f"{ap}/before/photo{item['photo']}.png",
                   f"{wk}/before/photo1.png")
    label = "THEIR CARD ART" if item["link_key"] == "card" else "THEIR POSTER ART"
    cut = first(f"{ap}/{item['pose']}.cutout.png", f"{wk}/{item['pose']}.cutout.png") if after else None
    if cut and os.path.basename(cut).split(".")[0] != os.path.basename(after).split(".")[0]:
        cut = None                       # never anchor one pose's crop to another pose's alpha
    slug = (item["sport"] or {}).get("slug", "")
    cards = engine.CARDS.get(slug, [])
    front = first(f"marketing/cards/{slug}-front.png")
    back = first(f"marketing/cards/{slug}-back.png")
    posters = engine.posters_for(slug)
    photos = [p for p in (first(f"{wk}/before/photo{n}.png", f"{ap}/before/photo{n}.png")
                          for n in (1, 2, 4, 3)) if p]
    d = dict(after=after, before=before, after_label=label, cutout=cut,
             poster=posters[i % len(posters)] if posters else None,
             card=front or (cards[i % len(cards)] if cards else None),
             card_front=front, card_back=back,
             tight=(item["sport"] or {}).get("tight", 1.0),
             slide=_slide_for(slug, slide_pool, i))
    if item["template"] == "beforeafter" and not (before and front and back):
        return None
    d["photos"] = photos
    if item["template"] == "transform":
        # card by default; poster when the sport has art and the queue asked for one
        # alternate card / poster by position so both products get shown, not just cards
        want_card = item.get("kind", "card") == "card"   # decided in engine.build_queue
        d["kind"] = "card" if (want_card and front) else ("poster" if d["poster"] else None)
        d["product"] = front if d["kind"] == "card" else d["poster"]
        if not (d["kind"] and d["product"] and len(photos) >= 2):
            return None
    if item["template"] == "product" and not d["poster"]:
        return None                      # no finished poster for this sport — never fake one
    if item["template"] == "slide" and not d["slide"]:
        return None
    if item["template"] == "spec" and not d["card"]:
        return None
    return d


def video_pin(day_dir: str, cfg) -> str | None:
    """A 2:3 video pin from an existing listing video. Video pins get more distribution."""
    src = first(*cfg.get("video_sources", []))
    if not src:
        return None
    out = os.path.join(day_dir, "video-pin-1000x1500.mp4")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-vf",
                    "scale=1000:-2,crop=1000:1500:0:(ih-1500)/2,setsar=1",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-an", out], check=True)
    return out


# ------------------------------------------------------------------- main ---
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--day", default="today")
    ap.add_argument("--days", type=int, default=1)
    ap.add_argument("--per-day", type=int, default=None,
                    help="override the ramp in engine.RAMP")
    ap.add_argument("--start", default=None, help="queue epoch; default = config.start_date")
    ap.add_argument("--video", action="store_true")
    args = ap.parse_args()

    cfg = engine.config()
    start = dt.date.fromisoformat(args.start or cfg["start_date"])
    day0 = dt.date.today() if args.day == "today" else dt.date.fromisoformat(args.day)
    horizon = max(1, (day0 - start).days + args.days)
    queue = engine.build_queue(start, horizon, args.per_day)
    pool = slides(cfg)
    seen: dict = {}                       # source frame -> date last used, for repeat checks

    for k in range(args.days):
        date = day0 + dt.timedelta(days=k)
        todays = [i for i in queue if i["date"] == f"{date:%Y-%m-%d}"]
        day_dir = os.path.join("marketing", "out", f"{date:%Y-%m-%d}")
        os.makedirs(day_dir, exist_ok=True)
        rows, notes, made = [], [], 0
        made_paths, flags = [], []
        for n, item in enumerate(todays):
            assets = resolve(item, cfg, pool, n + date.toordinal())
            for a, b, lk in (("spec", "product", "poster"), ("product", "spec", "card")):
                if not assets and item["template"] == a:
                    item = dict(item, template=b, link_key=lk,
                                id=item["id"].replace(f"-{a}-", f"-{b}-"),
                                headline=(lambda hb: hb[n % len(hb)])(
                                    engine.headlines_for(b, item["occasion"])))
                    assets = resolve(item, cfg, pool, n + date.toordinal())
            if not assets:
                notes.append(f"- SKIPPED {item['id']} — missing source art")
                continue
            im = RENDER[item["template"]](item, assets)
            png = os.path.join(day_dir, f"{item['id']}.png")
            im.save(png, "PNG", optimize=True)
            made_paths.append(png)
            for problem in audit(item, assets, im, cfg, seen):
                flags.append(f"- **{item['id']}** — {problem}")
            c = engine.caption(item, cfg)
            base = cfg.get("public_base", "").rstrip("/")
            rows.append([c["title"], f"{base}/pins/{item['id']}.png" if base else "",
                         c["board"], "", c["description"], c["link"],
                         f"{date:%Y-%m-%d}", c["keywords"]])
            notes.append(
                f"\n### {n+1}. `{os.path.basename(png)}` · board **{c['board']}**\n"
                f"**Title**  \n{c['title']}\n\n**Description**  \n{c['description']}\n\n"
                f"**Link**  \n{c['link']}\n")
            made += 1
        if args.video:
            v = video_pin(day_dir, cfg)
            if v:
                notes.append(f"\n### video · `{os.path.basename(v)}` — reuse any caption above "
                             f"on board **Custom Sports Posters**\n")
        with open(os.path.join(day_dir, "pinterest.csv"), "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["Title", "Media URL", "Pinterest board", "Thumbnail",
                        "Description", "Link", "Publish date", "Keywords"])
            w.writerows(rows)
        # A pin that fell back to another template leaves its old PNG behind, and the folder
        # then disagrees with captions.md about what to upload. The folder is the instruction.
        keep = {os.path.basename(p) for p in made_paths} | {"_contact-sheet.png"}
        for f in os.listdir(day_dir):
            if f.endswith(".png") and f not in keep:
                os.remove(os.path.join(day_dir, f))
        contact_sheet(made_paths, os.path.join(day_dir, "_contact-sheet.png"))
        # The missing-listing flag is one fact about the shop, not N facts about N pins.
        missing = sorted({f.split("LINK|")[1] for f in flags if "LINK|" in f})
        real = [f for f in flags if "LINK|" not in f]
        with open(os.path.join(day_dir, "audit.md"), "w", encoding="utf-8") as f:
            f.write(f"# Audit {date:%Y-%m-%d}\n\n")
            f.write(("\n".join(real) + "\n") if real else "No pin defects found.\n")
            if missing:
                f.write(f"\nNo sport listing yet for **{', '.join(missing)}** — those pins go "
                        f"to the shop front. Add them to `links.by_sport` in config.json.\n")
        flags = real
        with open(os.path.join(day_dir, "captions.md"), "w", encoding="utf-8") as f:
            f.write(f"# Pins for {date:%Y-%m-%d} ({made} pins)\n\n"
                    "Upload order = the order below. One board per pin, never the same board "
                    "twice in a row.\n")
            f.write("\n".join(notes) + "\n")
        print(f"{date:%Y-%m-%d}: {made} pins -> {day_dir}"
              + (f"  ⚠️ {len(flags)} audit flag(s)" if flags else ""))


if __name__ == "__main__":
    main()
