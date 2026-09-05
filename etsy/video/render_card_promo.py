#!/usr/bin/env python3
"""Etsy card-listing promo — 15 s, 1080x1080, 30 fps, NO text overlays.

Text is added later in CapCut by the owner — this renders pure visuals:
  B1 0.0-2.6   poster art alive (Veo clip, center crop)
  B2 2.6-4.6   stands/phone POV (Veo clip) ending in a shutter flash
  B3 4.6-8.0   the build: real intake photos -> identity/kit plates -> card front
  B4 8.0-11.6  card flip (existing SN Marcus render)
  B5 11.6-13.4 six finishes row, lateral dolly
  B6 13.4-15.0 end card: navy gradient + silver GDE shield

Inputs are pre-extracted frame dirs for the two Veo clips and the flip video
(see prep() below). Run from repo root:  python3 etsy/video/render_card_promo.py
"""
import math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
W = H = 1080
FPS = 30
OUT_FRAMES = "etsy/video/_frames"
TRIAL = "etsy/video/trial"

# ---------- easing ----------
def ease_out_cubic(t): return 1 - (1 - t) ** 3
def ease_in_cubic(t): return t ** 3
def ease_out_back(t, s=1.35):
    t -= 1
    return 1 + (s + 1) * t ** 3 + s * t * t
def clamp01(t): return max(0.0, min(1.0, t))

# ---------- frame sources ----------
def prep():
    """Extract Veo + flip frames once."""
    jobs = [
        (f"{TRIAL}/stands-final-veo.mp4", f"{TRIAL}/_f-b2", "crop=1080:1080:0:420"),
        ("card-flip/out/GDE_SN_CardFlip_1080x1350.mp4", f"{TRIAL}/_f-flip", "crop=1080:1080:0:135"),
    ]
    for src, dst, crop in jobs:
        if os.path.isdir(dst) and os.listdir(dst):
            continue
        os.makedirs(dst, exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src,
                        "-vf", f"{crop},fps={FPS}", f"{dst}/f%04d.png"], check=True)

def seq_frame(dirpath, i):
    return Image.open(f"{dirpath}/f{i:04d}.png").convert("RGB")

# ---------- shared art ----------
def navy_bg():
    """Radial navy gradient, brand-dark."""
    base = Image.new("RGB", (W, H))
    cx, cy = W / 2, H * 0.42
    top, bot = (16, 24, 40), (5, 8, 15)
    px = base.load()
    for y in range(H):
        for x in range(0, W, 4):
            d = min(1.0, math.hypot(x - cx, y - cy) / (H * 0.95))
            c = tuple(int(t + (b - t) * d) for t, b in zip(top, bot))
            for dx in range(4):
                if x + dx < W:
                    px[x + dx, y] = c
    return base

def rounded(img, rad):
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], rad, fill=255)
    img = img.convert("RGBA")
    img.putalpha(m)
    return img

def paste_rot(canvas, img, center, deg, alpha=1.0):
    r = img.rotate(deg, expand=True, resample=Image.BICUBIC)
    if alpha < 1.0:
        a = r.getchannel("A").point(lambda v: int(v * alpha))
        r.putalpha(a)
    canvas.paste(r, (int(center[0] - r.width / 2), int(center[1] - r.height / 2)), r)

def shadowed(canvas, img, center, deg=0.0, alpha=1.0, blur=18, sa=110):
    """Drop shadow + paste."""
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.paste(Image.new("RGBA", img.size, (0, 0, 0, sa)), (0, 0), img)
    sh = sh.rotate(deg, expand=True, resample=Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))
    if alpha < 1.0:
        a = sh.getchannel("A").point(lambda v: int(v * alpha))
        sh.putalpha(a)
    canvas.paste(sh, (int(center[0] - sh.width / 2 + 6), int(center[1] - sh.height / 2 + 14)), sh)
    paste_rot(canvas, img, center, deg, alpha)

# ---------- B3 assets ----------
def load_b3():
    photos = []
    for i in range(1, 5):
        p = Image.open(f"art-pipeline/out/athletes/basketball/before/photo{i}.png").convert("RGB")
        p = ImageOps.fit(p, (430, 560), Image.LANCZOS)
        tile = Image.new("RGB", (430 + 28, 560 + 28), (245, 245, 243))
        tile.paste(p, (14, 14))
        photos.append(rounded(tile, 12))
    ident = Image.open("art-pipeline/out/athletes/basketball/_identity.png").convert("RGB")
    ident = rounded(ImageOps.contain(ident, (760, 570), Image.LANCZOS), 10)
    kit = Image.open("art-pipeline/out/athletes/basketball/_kit.png").convert("RGB")
    kit = rounded(ImageOps.contain(kit, (570, 570), Image.LANCZOS), 10)
    card = Image.open("card-flip/assets/marcus-sn/card-front.png").convert("RGB")
    card = rounded(card.resize((700, 980), Image.LANCZOS), 26)
    return photos, ident, kit, card

# ---------- B5: six cards row from slide 08 ----------
def load_cards_row():
    """Detect the six dark card rectangles on the light slide, cut them out."""
    import numpy as np
    slide = Image.open("etsy/listing-images/04-complete-set/08-six-finishes.png").convert("RGB")
    a = np.asarray(slide.convert("L")) < 165
    # collapse to bounding boxes by scanning connected dark columns/rows in the two card bands
    boxes = []
    for y0, y1 in [(int(slide.height * 0.20), int(slide.height * 0.55)),
                   (int(slide.height * 0.55), int(slide.height * 0.90))]:
        band = a[y0:y1]
        cols = band.sum(axis=0) > (y1 - y0) * 0.55
        x = 0
        while x < len(cols):
            if cols[x]:
                x2 = x
                while x2 < len(cols) and cols[x2]:
                    x2 += 1
                if x2 - x > slide.width * 0.12:
                    rows = band[:, x:x2].sum(axis=1) > (x2 - x) * 0.5
                    ys = [i for i, v in enumerate(rows) if v]
                    boxes.append((x, y0 + ys[0], x2, y0 + ys[-1]))
                x = x2
            x += 1
    cards = [rounded(slide.crop(b).resize((520, 728), Image.LANCZOS), 20) for b in boxes[:6]]
    return cards

# ---------- beats ----------
# B1 is procedural: Veo's RAI filter refuses i2v on photorealistic children, so the
# poster art is animated by hand — Ken Burns + drifting fog + dust + light pulse.
import random

def _fog_layer(seed, size):
    rnd = random.Random(seed)
    lo = Image.new("L", (96, 80), 0)
    px = lo.load()
    for y in range(80):
        for x in range(96):
            px[x, y] = rnd.randint(0, 255)
    lo = lo.resize(size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(48))
    return lo.point(lambda v: int(max(0, v - 130) * 0.55))  # sparse soft clouds

class B1:
    def __init__(self):
        art = Image.open(f"{TRIAL}/poster-artzone.png").convert("RGB")
        self.big = art.resize((int(art.width * 1.35), int(art.height * 1.35)), Image.LANCZOS)
        self.fog1 = _fog_layer(7, (2600, 1400))
        self.fog2 = _fog_layer(23, (2600, 1400))
        rnd = random.Random(99)
        self.dust = [(rnd.uniform(0, W), rnd.uniform(0, H), rnd.uniform(1.2, 3.2),
                      rnd.uniform(4, 14), rnd.uniform(0, 6.28)) for _ in range(42)]

    def frame(self, i):
        t = i / 77.0
        e = ease_out_cubic(t)
        scale = 1.16 - 0.10 * e
        vw, vh = int(W * scale), int(H * scale)
        cx = int(self.big.width * (0.44 + 0.10 * e))
        cy = int(self.big.height * 0.5)
        x0 = max(0, min(self.big.width - vw, cx - vw // 2))
        y0 = max(0, min(self.big.height - vh, cy - vh // 2))
        f = self.big.crop((x0, y0, x0 + vw, y0 + vh)).resize((W, H), Image.LANCZOS)
        # fog: two layers drifting at different speeds
        for fog, spd, al in ((self.fog1, 2.4, 46), (self.fog2, -1.5, 34)):
            off = int(i * spd) % fog.width
            band = Image.new("L", (W, H), 0)
            band.paste(fog.crop((off, 160, min(off + W, fog.width), 160 + H)), (0, 0))
            if off + W > fog.width:
                band.paste(fog.crop((0, 160, off + W - fog.width, 160 + H)), (fog.width - off, 0))
            tint = Image.new("RGB", (W, H), (168, 186, 210))
            a = band.point(lambda v, al=al: int(v * al / 100))
            f.paste(tint, (0, 0), a)
        # light pulse top
        pulse = 0.82 + 0.18 * math.sin(i / 9.0)
        gl = Image.new("L", (W, H), 0)
        ImageDraw.Draw(gl).ellipse([W * 0.18, -H * 0.42, W * 0.86, H * 0.30], fill=int(52 * pulse))
        gl = gl.filter(ImageFilter.GaussianBlur(80))
        f.paste(Image.new("RGB", (W, H), (205, 220, 245)), (0, 0), gl)
        # dust
        d = ImageDraw.Draw(f, "RGBA")
        for (dx, dy, r, spd, ph) in self.dust:
            x = (dx + i * spd * 0.22) % (W + 40) - 20
            y = (dy - i * spd * 0.12) % (H + 40) - 20
            a = int(70 + 55 * math.sin(i / 8.0 + ph))
            d.ellipse([x - r, y - r, x + r, y + r], fill=(220, 230, 245, a))
        return f

def b2_frame(i):  # 60 frames, veo clip from 1.0s
    img = seq_frame(f"{TRIAL}/_f-b2", 31 + i)
    if i >= 56:  # shutter flash, 4 frames rising
        t = (i - 56) / 3.0
        img = Image.blend(img, Image.new("RGB", (W, H), (255, 255, 255)), 0.25 + 0.75 * t)
    return img

def b3_frame(i, bg, photos, ident, kit, card):  # 102 frames
    f = bg.copy()
    slots = [(300, 420, -7), (610, 380, 4), (390, 700, 6), (720, 660, -5)]
    for k, (ph, (sx, sy, deg)) in enumerate(zip(photos, slots)):
        t0 = k * 7
        t = clamp01((i - t0) / 16)
        if t <= 0:
            continue
        e = ease_out_cubic(t)
        drift = clamp01((i - 40) / 22)  # slide left + fade from f40
        x = sx + (1 - e) * 900 - drift * 620
        y = sy + (1 - e) * 260
        al = min(1.0, e) * (1 - 0.9 * ease_in_cubic(drift))
        if al > 0.01:
            shadowed(f, ph, (x, y), deg + (1 - e) * 10, al, blur=14, sa=90)
    # plates
    tp = clamp01((i - 44) / 18)
    fade_all = clamp01((i - 74) / 14)  # everything yields to the card
    if tp > 0:
        e = ease_out_cubic(tp)
        al = e * (1 - ease_in_cubic(fade_all))
        if al > 0.01:
            shadowed(f, ident, (W / 2 + (1 - e) * 500, 330), 0, al, blur=12, sa=80)
            shadowed(f, kit, (W / 2 + (1 - e) * 720, 790), 0, al, blur=12, sa=80)
    # card snap: lands exactly at flip geometry (700x980 centered)
    tc = clamp01((i - 80) / 20)
    if tc > 0:
        e = ease_out_back(tc)
        s = 0.62 + 0.38 * e
        c = card.resize((max(1, int(700 * s)), max(1, int(980 * s))), Image.LANCZOS)
        shadowed(f, c, (W / 2, H / 2), 0, min(1.0, tc * 2.2), blur=26, sa=140)
    return f

def b4_frame(i):  # 108 frames -> flip frames 15..122
    return seq_frame(f"{TRIAL}/_f-flip", 15 + i)

def b5_frame(i, bg, cards):  # 54 frames
    f = bg.copy()
    gap = 64
    roww = 6 * 520 + 5 * gap
    t = i / 53.0
    x0 = int(W * 0.72 - t * (roww - W * 0.28 - W))  # dolly right->left
    x0 = int(W * 0.65 - t * (roww + W * 0.3 - W))
    for k, c in enumerate(cards):
        cx = x0 + k * (520 + gap) + 260
        if -400 < cx < W + 400:
            shadowed(f, c, (cx, H / 2), 0, 1.0, blur=20, sa=120)
    return f

def b6_frame(i, bg, shield):  # 48 frames
    f = bg.copy()
    t = clamp01(i / 26)
    e = ease_out_cubic(t)
    s = 1.10 - 0.10 * e
    sh = shield.resize((int(shield.width * 0.42 * s), int(shield.height * 0.42 * s)), Image.LANCZOS)
    # soft silver glow
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow.paste(Image.new("RGBA", sh.size, (205, 212, 224, int(70 * e))),
               (int(W / 2 - sh.width / 2), int(H / 2 - sh.height / 2)), sh)
    glow = glow.filter(ImageFilter.GaussianBlur(38))
    f = Image.alpha_composite(f.convert("RGBA"), glow)
    a = sh.getchannel("A").point(lambda v: int(v * e))
    sh.putalpha(a)
    f.paste(sh, (int(W / 2 - sh.width / 2), int(H / 2 - sh.height / 2)), sh)
    f = f.convert("RGB")
    if i >= 40:  # fade to black for loop
        f = Image.blend(f, Image.new("RGB", (W, H), (0, 0, 0)), (i - 40) / 7.0)
    return f

def silver_shield(path):
    """Brand rule: the GDE mark is ALWAYS silver. The Figma export is navy on a white
    badge — keep only the glyph and refill it with a vertical silver gradient."""
    import numpy as np
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    glyph = (a[..., 0] < 120) & (a[..., 3] > 40)  # dark navy pixels
    hgt = a.shape[0]
    grad = np.linspace(0, 1, hgt)[:, None]
    r = 214 - 74 * grad; g = 219 - 72 * grad; b = 228 - 66 * grad
    out = np.zeros_like(a)
    out[..., 0] = r; out[..., 1] = g; out[..., 2] = b
    out[..., 3] = np.where(glyph, a[..., 3], 0)
    return Image.fromarray(out.astype("uint8"), "RGBA")

# ---------- assemble ----------
def main():
    prep()
    os.makedirs(OUT_FRAMES, exist_ok=True)
    bg = navy_bg()
    photos, ident, kit, card = load_b3()
    cards = load_cards_row()
    print(f"cards row: {len(cards)} cards detected")
    shield = silver_shield(f"{TRIAL}/gde-shield-4x.png")

    XF = 8  # crossfade frames
    b1 = B1()
    beats = [
        (78, b1.frame),
        (60, lambda i: b2_frame(i)),
        (102, lambda i: b3_frame(i, bg, photos, ident, kit, card)),
        (108, lambda i: b4_frame(i)),
        (54, lambda i: b5_frame(i, bg, cards)),
        (48, lambda i: b6_frame(i, bg, shield)),
    ]
    # which joints crossfade (B2->B3 is a hard cut off the flash, B3->B4 is a geometry-matched cut)
    xfade_after = {0: True, 1: False, 2: False, 3: True, 4: True}

    n = 0
    prev_tail = []
    for bi, (length, fn) in enumerate(beats):
        for i in range(length):
            img = fn(i)
            if i < len(prev_tail):  # blend with previous beat's tail
                a = (i + 1) / (len(prev_tail) + 1)
                img = Image.blend(prev_tail[i], img, a)
            img.save(f"{OUT_FRAMES}/f{n:04d}.png")
            n += 1
            if n % 90 == 0:
                print(f"{n}/450")
        prev_tail = []
        if bi < len(beats) - 1 and xfade_after.get(bi):
            prev_tail = [fn(length - 1)] * XF
            n -= 0  # tail blends into the next beat's first XF frames
    print("frames:", n)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS),
                    "-i", f"{OUT_FRAMES}/f%04d.png",
                    "-c:v", "libx264", "-crf", "17", "-preset", "slow",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
                    "etsy/listing-videos/GDE-etsy-01-card-story-1080.mp4"], check=True)
    print("done: etsy/listing-videos/GDE-etsy-01-card-story-1080.mp4")

if __name__ == "__main__":
    main()
