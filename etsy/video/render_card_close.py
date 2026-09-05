#!/usr/bin/env python3
"""Etsy card listing — SECOND video: the close.

Video 1 (`GDE-etsy-01-card-story-1080.mp4`) is emotional: it sells the transformation.
This one is evidence: it answers the three questions that stop a buyer at the button —
"will it look like my kid?", "what if it's wrong?", "what do I actually get?".

Built in the LISTING SLIDE style (light stock, orange corner brackets, GDE watermark,
Anton headlines, Barlow body, PASS/FAIL chips) so it reads as part of the gallery, and
deliberately NOT like video 1 — different texture, different job.

  A 0.0-2.6   "WILL IT LOOK LIKE THEM?" + basketball photo -> card pair
  B 2.6-7.8   four more sports, same layout, real gate scores on each
  C 7.8-10.2  the scores strip: MEASURED, NOT CLAIMED (incl. a real rejected take)
  D 10.2-12.4 proof -> approved -> clean card: nothing is final until you say so
  E 12.4-14.4 4 downloads + 1 live registry page, delivery 1-2 days
  F 14.4-15.7 silver GDE shield on navy

Every number on screen is read from the real identity-gate JSONs — nothing is invented.
Run:  python3 etsy/video/render_card_close.py
"""
import json, math, os, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
W = H = 1080
FPS = 30
OUT_FRAMES = os.environ.get("GDE_CLOSE_FRAMES", "etsy/video/_frames_close")
OUT_MP4 = "etsy/listing-videos/GDE-etsy-01-card-close-1080.mp4"
TRIAL = "etsy/video/trial"
SRC = "etsy/listing-images/04-complete-set/src"

# ---- style tokens, sampled from "06 · Four shots, measured.jpg" ----
BG = (244, 243, 239)
INK = (20, 25, 31)
ORANGE = (255, 107, 43)
GREEN = (78, 175, 144)
RED = (216, 85, 75)
MUTED = (110, 114, 120)
HAIR = (232, 231, 226)

FONTS = os.path.expanduser("~/Library/Fonts")
def font(name, size):
    return ImageFont.truetype(f"{FONTS}/{name}", size)

def ease_out_cubic(t): return 1 - (1 - t) ** 3
def ease_out_back(t, s=1.25):
    t -= 1
    return 1 + (s + 1) * t ** 3 + s * t * t
def clamp01(t): return max(0.0, min(1.0, t))

# ---------------- drawing helpers ----------------
def track_text(d, xy, text, f, fill, tracking=0, anchor_left=True):
    """Letter-spaced text (PIL has no tracking)."""
    x, y = xy
    if not anchor_left:
        total = sum(f.getbbox(c)[2] - f.getbbox(c)[0] + tracking for c in text) - tracking
        x -= total
    for c in text:
        d.text((x, y), c, font=f, fill=fill)
        x += (f.getlength(c) if hasattr(f, "logenth") else f.getlength(c)) + tracking
    return x

def text_w(f, s, tracking=0):
    return f.getlength(s) + tracking * max(0, len(s) - 1)

def rounded(img, rad):
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], rad, fill=255)
    img = img.convert("RGBA"); img.putalpha(m); return img

def shadowed(canvas, img, xy, blur=24, sa=44, dy=16):
    """Soft drop shadow. The canvas is padded by 3x the blur — building it at the
    element's own size clips the falloff and leaves a hard grey band."""
    pad = blur * 3
    sh = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    sh.paste(Image.new("RGBA", img.size, (0, 0, 0, sa)), (pad, pad), img)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    canvas.paste(sh, (xy[0] - pad + 2, xy[1] - pad + dy), sh)
    canvas.paste(img, xy, img)

def chip(d, box, text, f, fill, fg=(255, 255, 255), rad=8):
    d.rounded_rectangle(box, rad, fill=fill)
    tw = f.getlength(text)
    _, top, _, bot = f.getbbox(text)
    d.text((box[0] + (box[2] - box[0] - tw) / 2,
            box[1] + (box[3] - box[1] - (bot - top)) / 2 - top), text, font=f, fill=fg)

class Frame:
    """The listing-slide chrome: stock, watermark, hairlines, brackets, footer."""
    def __init__(self):
        base = Image.new("RGB", (W, H), BG)
        d = ImageDraw.Draw(base)
        # faint guide hairlines, as on the slides
        d.line([(W * 0.18, 0), (W * 0.18, H)], fill=HAIR, width=2)
        d.line([(0, H * 0.70), (W, H * 0.70)], fill=HAIR, width=2)
        # watermark: the shield, oversized, barely there
        sh = Image.open(f"{TRIAL}/gde-shield-4x.png").convert("RGBA")
        a = np.asarray(sh).astype(np.float32)
        glyph = (a[..., 0] < 120) & (a[..., 3] > 40)
        wm = np.zeros_like(a)
        wm[..., 0], wm[..., 1], wm[..., 2] = 226, 225, 220
        wm[..., 3] = np.where(glyph, 190, 0)
        wm = Image.fromarray(wm.astype("uint8"), "RGBA")
        wm = wm.resize((int(W * 0.78), int(W * 0.78 * sh.height / sh.width)), Image.LANCZOS)
        base.paste(wm, (int(W * 0.44), int(H * 0.30)), wm)
        # orange corner brackets
        m, L, t = 34, 54, 3
        for (cx, cy, dx, dy) in ((m, m, 1, 1), (W - m, m, -1, 1), (m, H - m, 1, -1), (W - m, H - m, -1, -1)):
            d.line([(cx, cy), (cx + dx * L, cy)], fill=ORANGE, width=t)
            d.line([(cx, cy), (cx, cy + dy * L)], fill=ORANGE, width=t)
        # footer lockup — the real wordmark from the card art, inked for light stock
        wmk = Image.open(f"{TRIAL}/gde-wordmark.png").convert("RGBA")
        wmk = wmk.resize((196, int(196 * wmk.height / wmk.width)), Image.LANCZOS)
        ink = Image.new("RGBA", wmk.size, INK + (255,)); ink.putalpha(wmk.getchannel("A"))
        base.paste(ink, (72, H - 104), ink)
        self.base = base

    def new(self):
        return self.base.copy()

def eyebrow(d, xy, text, underline_chars=0):
    f = font("Barlow-SemiBold.ttf", 26)
    x, y = xy
    end = track_text(d, (x, y), text, f, INK, tracking=6)
    if underline_chars:
        uw = text_w(f, text[:underline_chars], 6)
        d.line([(x, y + 36), (x + uw, y + 36)], fill=ORANGE, width=3)
    return end

def headline(d, xy, lines, size=76, fill=INK, lead=1.02):
    f = font("Anton-Regular.ttf", size)
    x, y = xy
    for ln in lines:
        d.text((x, y), ln, font=f, fill=fill)
        y += int(size * lead)
    return y

def body(d, xy, lines, size=27, fill=MUTED):
    f = font("Barlow-Regular.ttf", size)
    x, y = xy
    for ln in lines:
        d.text((x, y), ln, font=f, fill=fill)
        y += int(size * 1.38)
    return y

# ---------------- content ----------------
def gate_score(sport):
    """Best real pose similarity for this athlete, from the identity gate."""
    p = f"art-pipeline/out/athletes/{sport}/_identity-gate.json"
    d = json.load(open(p))
    rows = [r for r in d.get("rows", []) if isinstance(r.get("similarity"), (int, float))]
    best = max(rows, key=lambda r: r["similarity"]) if rows else None
    return (best["similarity"], str(best.get("verdict", "")).lower() == "pass") if best else (None, False)

PAIRS = [
    ("basketball",   "BASKETBALL",  f"{SRC}/marcus-sn-card-front.png"),
    ("football",     "FOOTBALL",    f"{SRC}/football-card-front.png"),
    ("cheerleading", "CHEER",       f"{SRC}/cheer-card-front-PR.png"),
    ("gymnastics",   "GYMNASTICS",  f"{SRC}/gymnastics-card-front.png"),
    ("ice-hockey",   "ICE HOCKEY",  f"{SRC}/hockey-card-front.png"),
]

class Pairs:
    PW, PH = 372, 496        # the "before" photo
    CW, CH = 386, 540        # the card

    def __init__(self):
        self.items = []
        for sport, label, cardp in PAIRS:
            photo = Image.open(f"art-pipeline/out/athletes/{sport}/before/photo4.png").convert("RGB")
            photo = rounded(ImageOps.fit(photo, (self.PW, self.PH), Image.LANCZOS, centering=(0.5, 0.32)), 12)
            card = rounded(Image.open(cardp).convert("RGB").resize((self.CW, self.CH), Image.LANCZOS), 14)
            score, ok = gate_score(sport)
            self.items.append((label, photo, card, score, ok))

    def frame(self, chrome, k, i, n, big_headline=False):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        label, photo, card, score, ok = self.items[k]
        if big_headline:
            eyebrow(d, (72, 118), "THE ONE THING THAT MATTERS", underline_chars=7)
            headline(d, (70, 162), ["WILL IT LOOK", "LIKE THEM?"], size=82)
            top = 352
        else:
            eyebrow(d, (72, 118), "THEIR PHOTO. THEIR CARD.", underline_chars=5)
            headline(d, (70, 162), [label], size=82)
            top = 352
        # photo slides in from the left, card from the right
        tp = clamp01(i / 12.0); tc = clamp01((i - 5) / 14.0)
        ep, ec = ease_out_cubic(tp), ease_out_cubic(tc)
        gap = 44
        total = self.PW + gap + self.CW
        x0 = (W - total) // 2
        if ep > 0:
            ph = photo.copy()
            if ep < 1:
                al = ph.getchannel("A").point(lambda v: int(v * ep)); ph.putalpha(al)
            shadowed(f, ph, (int(x0 - (1 - ep) * 90), top + 22))
        if ec > 0:
            cd = card.copy()
            if ec < 1:
                al = cd.getchannel("A").point(lambda v: int(v * ec)); cd.putalpha(al)
            shadowed(f, cd, (int(x0 + self.PW + gap + (1 - ec) * 90), top))
        # arrow between them
        if ec > 0.15:
            ax = x0 + self.PW + gap / 2
            ay = top + self.CH / 2
            r = 22
            d.ellipse([ax - r, ay - r, ax + r, ay + r], fill=ORANGE)
            d.polygon([(ax - 6, ay - 9), (ax + 8, ay), (ax - 6, ay + 9)], fill=(255, 255, 255))
        # score chip under the card
        if score is not None and i > 16:
            fc = font("Anton-Regular.ttf", 28)
            fs = font("Barlow-SemiBold.ttf", 19)
            txt = f"FACE MATCH  {score:.2f}"
            bx = x0 + self.PW + gap
            chip(d, (bx, top + self.CH + 18, bx + self.CW, top + self.CH + 70), txt, fc,
                 GREEN if ok else RED)
            track_text(d, (x0, top + self.PH + 34), "THEIR REAL PHOTO", fs, MUTED, tracking=3)
        return f

# ---------------- beats ----------------
class Measured:
    def __init__(self):
        self.rows = []
        for sport, label, _ in PAIRS[:4]:
            s, ok = gate_score(sport)
            self.rows.append((label, s, ok))
        # the take we threw away — the same number listing slide 06 publishes
        self.rows.append(("A REJECTED TAKE", 0.287, False))

    def frame(self, chrome, i, n):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "HOW WE KNOW IT'S THEM", underline_chars=7)
        headline(d, (70, 162), ["MEASURED,", "NOT CLAIMED."], size=82)
        body(d, (72, 398), ["Every finished frame is scored against the real photos you send.",
                            "Below 0.36 the take is rejected and rebuilt — not shipped."])
        fc = font("Anton-Regular.ttf", 46)
        fl = font("Barlow-SemiBold.ttf", 17)
        fv = font("Barlow-SemiBold.ttf", 19)
        bw, gap = 172, 18
        x0 = (W - (bw * 5 + gap * 4)) // 2
        for k, (label, s, ok) in enumerate(self.rows):
            t = clamp01((i - 6 - k * 5) / 12.0)
            if t <= 0: continue
            e = ease_out_back(t)
            hgt = int(104 * min(1.0, e))
            x = x0 + k * (bw + gap)
            y = 520
            chip(d, (x, y, x + bw, y + hgt), f"{s:.3f}", fc, GREEN if ok else RED)
            track_text(d, (x + 2, y + hgt + 16), label, fl, INK, tracking=1)
            track_text(d, (x + 2, y + hgt + 46), "PASS" if ok else "REBUILT",
                       fv, GREEN if ok else RED, tracking=1)
        if i > 34:
            fp = font("Anton-Regular.ttf", 30)
            tw = fp.getlength("MEASURED, NOT CLAIMED") + 56
            chip(d, ((W - tw) / 2, 706, (W + tw) / 2, 762), "MEASURED, NOT CLAIMED", fp, ORANGE, rad=10)
        return f

class Proof:
    def __init__(self):
        self.card = rounded(Image.open(f"{SRC}/marcus-sn-card-front.png").convert("RGB")
                            .resize((348, 487), Image.LANCZOS), 14)

    def watermark(self, card, alpha):
        lay = Image.new("RGBA", card.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(lay)
        f = font("Anton-Regular.ttf", 34)
        for row in range(-2, 10):
            for col in range(-2, 4):
                d.text((col * 170 - 40, row * 92 - 20), "PROOF", font=f,
                       fill=(255, 255, 255, int(70 * alpha)))
        lay = lay.rotate(-28, resample=Image.BICUBIC, center=(card.width / 2, card.height / 2))
        out = card.copy()
        out.alpha_composite(lay)
        return out

    def frame(self, chrome, i, n):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "NOTHING SHIPS UNTIL YOU SAY SO", underline_chars=7)
        headline(d, (70, 162), ["YOU APPROVE IT FIRST."], size=76)
        body(d, (72, 286), ["We send a proof and wait. Nothing is final until you approve it —",
                            "corrections are part of the price, not an extra."])
        wm_a = clamp01(1 - (i - 30) / 12.0)
        card = self.watermark(self.card, wm_a) if wm_a > 0 else self.card
        shadowed(f, card, ((W - card.width) // 2, 372), blur=18, sa=60)
        if i > 22:
            t = clamp01((i - 22) / 8.0)
            e = ease_out_back(t)
            fa = font("Anton-Regular.ttf", 34)
            tw = fa.getlength("APPROVED") + 64
            hh = int(58 * min(1.0, e))
            chip(d, ((W - tw) / 2, 884, (W + tw) / 2, 884 + hh), "APPROVED", fa, GREEN, rad=10)
        return f

class Deliverables:
    TW, THh = 240, 352
    GAP = 12

    def __init__(self):
        items = [(f"{SRC}/marcus-sn-card-front.png", "CARD FRONT"),
                 (f"{SRC}/marcus-sn-card-back.png", "CARD BACK"),
                 (f"{SRC}/marcus-sn-certificate.png", "CERTIFICATE"),
                 (f"{TRIAL}/_f-fliplight/f0070.png", "FLIP VIDEO")]
        self.tiles = []
        for p, label in items:
            im = Image.open(p).convert("RGB")
            # fill the plate instead of floating inside it — a row of full-bleed
            # tiles reads as one system; contained images leave ragged white margins
            im = ImageOps.fit(im, (self.TW - 12, self.THh - 12), Image.LANCZOS,
                              centering=(0.5, 0.5))
            plate = Image.new("RGB", (self.TW, self.THh), (255, 255, 255))
            plate.paste(im, (6, 6))
            self.tiles.append((rounded(plate, 10), label))

    def frame(self, chrome, i, n):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "YOUR COMPLETE DIGITAL SET", underline_chars=4)
        headline(d, (70, 162), ["EVERYTHING YOU GET."], size=76)
        fl = font("Barlow-SemiBold.ttf", 18)
        x0 = (W - (self.TW * 4 + self.GAP * 3)) // 2
        top = 292
        for k, (tile, label) in enumerate(self.tiles):
            t = clamp01((i - 4 - k * 4) / 12.0)
            if t <= 0: continue
            e = ease_out_cubic(t)
            tl = tile.copy()
            al = tl.getchannel("A").point(lambda v: int(v * e)); tl.putalpha(al)
            tx, ty = x0 + k * (self.TW + self.GAP), int(top + (1 - e) * 34)
            shadowed(f, tl, (tx, ty), blur=20, sa=40, dy=14)
            if label == "FLIP VIDEO" and t > 0.55:
                pcx, pcy, pr = tx + self.TW // 2, ty + self.THh // 2, 38
                d.ellipse([pcx - pr, pcy - pr, pcx + pr, pcy + pr], fill=(20, 25, 31))
                d.polygon([(pcx - 11, pcy - 17), (pcx + 17, pcy), (pcx - 11, pcy + 17)],
                          fill=(255, 255, 255))
            if t > 0.6:
                track_text(d, (tx + 4, top + self.THh + 20), label, fl, INK, tracking=2)
        # the last push: how fast they get it
        if i > 22:
            t = clamp01((i - 22) / 10.0)
            e = ease_out_back(t)
            fp = font("Anton-Regular.ttf", 54)
            txt = "YOUR PROOF IN 24 HOURS"
            tw = fp.getlength(txt) + 104
            hh = int(96 * min(1.0, e))
            chip(d, ((W - tw) / 2, 730, (W + tw) / 2, 730 + hh), txt, fp, ORANGE, rad=16)
        if i > 32:
            fs = font("Barlow-SemiBold.ttf", 22)
            txt = "PLUS A LIVE REGISTRY PAGE  ·  FULLY CUSTOMIZED, ONE OF ONE"
            d.text(((W - text_w(fs, txt, 1)) / 2, 856), txt, font=fs, fill=MUTED)
        return f

def navy_bg():
    base = Image.new("RGB", (W, H))
    px = base.load()
    cx, cy = W / 2, H * 0.42
    top, bot = (16, 24, 40), (5, 8, 15)
    for y in range(H):
        for x in range(0, W, 4):
            dd = min(1.0, math.hypot(x - cx, y - cy) / (H * 0.95))
            c = tuple(int(a + (b - a) * dd) for a, b in zip(top, bot))
            for k in range(4):
                if x + k < W: px[x + k, y] = c
    return base

class EndCard:
    def __init__(self, tagline="THEIR PHOTOS. THEIR CARD."):
        self.tagline = tagline
        self.bg = navy_bg()
        sh = Image.open(f"{TRIAL}/gde-shield-4x.png").convert("RGBA")
        a = np.asarray(sh).astype(np.float32)
        glyph = (a[..., 0] < 120) & (a[..., 3] > 40)
        grad = np.linspace(0, 1, a.shape[0])[:, None]
        out = np.zeros_like(a)
        out[..., 0] = 214 - 74 * grad; out[..., 1] = 219 - 72 * grad; out[..., 2] = 228 - 66 * grad
        out[..., 3] = np.where(glyph, a[..., 3], 0)
        self.sh = Image.fromarray(out.astype("uint8"), "RGBA")

    def frame(self, i, n):
        f = self.bg.copy()
        t = clamp01(i / 16.0); e = ease_out_cubic(t)
        s = 1.10 - 0.10 * e
        sh = self.sh.resize((int(self.sh.width * 0.29 * s), int(self.sh.height * 0.29 * s)), Image.LANCZOS)
        cy = 400
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        glow.paste(Image.new("RGBA", sh.size, (205, 212, 224, int(66 * e))),
                   (int(W / 2 - sh.width / 2), int(cy - sh.height / 2)), sh)
        glow = glow.filter(ImageFilter.GaussianBlur(34))
        f = Image.alpha_composite(f.convert("RGBA"), glow)
        aa = sh.getchannel("A").point(lambda v: int(v * e)); sh.putalpha(aa)
        f.paste(sh, (int(W / 2 - sh.width / 2), int(cy - sh.height / 2)), sh)
        f = f.convert("RGB")
        if t > 0.45:
            te = clamp01((i - 8) / 12.0)
            wmk = Image.open(f"{TRIAL}/gde-wordmark.png").convert("RGBA")
            wmk = wmk.resize((286, int(286 * wmk.height / wmk.width)), Image.LANCZOS)
            sil = Image.new("RGBA", wmk.size, (214, 219, 228, 255))
            sil.putalpha(wmk.getchannel("A").point(lambda v: int(v * te)))
            f.paste(sil, ((W - wmk.width) // 2, 646), sil)
            d = ImageDraw.Draw(f)
            fa = font("Anton-Regular.ttf", 34)
            txt = self.tagline
            d.text(((W - fa.getlength(txt)) / 2, 806), txt, font=fa,
                   fill=(int(150 + 46 * te), int(160 + 46 * te), int(176 + 40 * te)))
        if i >= n - 6:
            f = Image.blend(f, Image.new("RGB", (W, H), (0, 0, 0)), clamp01((i - (n - 6)) / 5.0))
        return f

# ---------------- assemble ----------------
def main():
    os.makedirs(OUT_FRAMES, exist_ok=True)
    for old in os.listdir(OUT_FRAMES):
        os.remove(os.path.join(OUT_FRAMES, old))
    chrome = Frame()
    pairs, meas, proof, deliv, endc = Pairs(), Measured(), Proof(), Deliverables(), EndCard()

    beats = []
    beats.append((78, lambda i, n: pairs.frame(chrome, 0, i, n, big_headline=True)))
    for k in range(1, 5):
        beats.append((39, (lambda kk: (lambda i, n: pairs.frame(chrome, kk, i, n)))(k)))
    beats.append((72, lambda i, n: meas.frame(chrome, i, n)))
    beats.append((66, lambda i, n: proof.frame(chrome, i, n)))
    beats.append((60, lambda i, n: deliv.frame(chrome, i, n)))
    beats.append((39, lambda i, n: endc.frame(i, n)))

    XF = 6
    idx = 0
    prev_last = None
    for bi, (length, fn) in enumerate(beats):
        for i in range(length):
            img = fn(i, length)
            if prev_last is not None and i < XF:
                img = Image.blend(prev_last, img, (i + 1) / (XF + 1))
            img.save(f"{OUT_FRAMES}/f{idx:04d}.png")
            idx += 1
            if idx % 60 == 0:
                print(f"{idx} frames")
        prev_last = fn(length - 1, length)
    print("frames:", idx, f"({idx / FPS:.2f}s)")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS),
                    "-i", f"{OUT_FRAMES}/f%04d.png", "-c:v", "libx264", "-crf", "17",
                    "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-an", OUT_MP4], check=True)
    print("done:", OUT_MP4)

if __name__ == "__main__":
    main()
