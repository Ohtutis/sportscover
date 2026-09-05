#!/usr/bin/env python3
"""Etsy COMPLETE SET listing — first video (the story), v4.

Owner direction (2026-08-27): the story now speaks the SECOND video's language — the
listing-slide chrome (light stock, orange brackets, watermark, eyebrow + Anton headline)
— and full-bleed media appears only where it is alive: the Veo action clip and the phone.
Captions over media are white Anton with a SOFT drop shadow (the Figma-template style),
never an outline, never a plate. The bonus beat is gone — it showed no value.

  S1 0.0-2.6   chrome: ONE ATHLETE. ONE EDITION. — the football set assembles + count chip
  S2 2.6-5.1   full-bleed: Tui sled-drive (Veo, adult athlete) -> white flash
  S3 5.1-7.1   full-bleed: phone gallery — Tui's 4 photos + 2 field shots, no repeats
  S4 7.1-9.3   chrome: REBUILT FROM SCRATCH. — football identity + kit
  S5 9.3-11.3  chrome: ANY SPORT. ANY ATHLETE. — fan, football center (no basketball)
  S6 11.3-12.9 navy end card — THE WALL. THE CARDS. THE WHOLE SEASON.

Run:  python3 etsy/video/render_set_promo.py
"""
import importlib.util, math, os, subprocess
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)

_s1 = importlib.util.spec_from_file_location("cardv3", "etsy/video/render_card_promo_v3.py")
V3 = importlib.util.module_from_spec(_s1); _s1.loader.exec_module(V3)
_s2 = importlib.util.spec_from_file_location("cardclose", "etsy/video/render_card_close.py")
C = importlib.util.module_from_spec(_s2); _s2.loader.exec_module(C)

W = H = 1080
FPS = 30
TRIAL = V3.TRIAL
SRC = "etsy/listing-images/04-complete-set/src"
FB = "art-pipeline/out/athletes/football"
OUT_FRAMES = os.environ.get("GDE_SPROMO_FRAMES", "etsy/video/_frames_set_promo")
OUT_MP4 = "etsy/listing-videos/GDE-etsy-04-set-story-1080.mp4"

clamp01, eoc, eob = V3.clamp01, V3.ease_out_cubic, V3.ease_out_back
rounded, shadowed, font, chip = C.rounded, C.shadowed, C.font, C.chip
eyebrow, headline = C.eyebrow, C.headline

def cutout(path, hgt):
    im = Image.open(path).convert("RGBA")
    return im.resize((int(im.width * hgt / im.height), hgt), Image.LANCZOS)

def contain(path, w, h, rad=8):
    im = ImageOps.contain(Image.open(path).convert("RGB"), (w, h), Image.LANCZOS)
    return rounded(im, rad)

def caption(f, text, t):
    """White Anton with a soft drop shadow — the Figma-template treatment."""
    if t <= 0:
        return f
    a = eoc(clamp01(t))
    fa = font("Anton-Regular.ttf", 58)
    tw = fa.getlength(text)
    x, y = (W - tw) / 2, H - 186 + int((1 - a) * 20)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((x + 3, y + 5), text, font=fa, fill=(8, 10, 14, 170))
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    lay.paste(sh, (0, 0), sh)
    ImageDraw.Draw(lay).text((x, y), text, font=fa, fill=(255, 255, 255, 255))
    if a < 1:
        lay.putalpha(lay.getchannel("A").point(lambda v: int(v * a)))
    f.paste(lay, (0, 0), lay)
    return f

def fade_paste(canvas, img, xy, alpha, deg=0.0):
    im = img.copy()
    if deg:
        im = im.rotate(deg, expand=True, resample=Image.BICUBIC)
    if alpha < 1:
        im.putalpha(im.getchannel("A").point(lambda v: int(v * alpha)))
    shadowed(canvas, im, xy, blur=16, sa=42, dy=10)

# ---------------- S1: chrome hook — the set assembles ----------------
class S1Hook:
    def __init__(self, chrome):
        self.chrome = chrome
        self.items = []
        def add(im, x, y, deg, st): self.items.append((im, x, y, deg, st))
        add(contain(f"{SRC}/football-certificate.png", 250, 328), 78, 356, -5, 12)
        add(contain(f"{SRC}/football-card-back.png", 222, 310), 742, 372, 6, 8)
        add(cutout(f"{SRC}/football-sticker.png", 96), 96, 724, -3, 20)
        add(contain(f"{SRC}/football-social-grid.png", 190, 238), 806, 640, 4, 22)
        add(contain(f"{SRC}/football-card-front.png", 248, 346), 652, 430, 3, 4)
        add(contain(f"{SRC}/football-poster.png", 360, 480), 292, 330, 0, 0)

    def frame(self, i):
        f = self.chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "YOUR COMPLETE DIGITAL SET", underline_chars=4)
        headline(d, (70, 162), ["ONE ATHLETE. ONE EDITION."], size=72)
        for im, x, y, deg, st in self.items:
            t = clamp01((i - st) / 10.0)
            if t <= 0: continue
            e = eob(t)
            s_ = 0.74 + 0.26 * e
            im2 = im.resize((max(1, int(im.width * s_)), max(1, int(im.height * s_))), Image.LANCZOS)
            if deg:
                im2 = im2.rotate(deg * e, expand=True, resample=Image.BICUBIC)
            cx, cy = x + im.width // 2, y + im.height // 2
            al = min(1.0, t * 2.0)
            if al < 1: im2.putalpha(im2.getchannel("A").point(lambda v: int(v * al)))
            shadowed(f, im2, (cx - im2.width // 2, cy - im2.height // 2), blur=16, sa=42, dy=10)
        if i > 30:
            t = clamp01((i - 30) / 10.0)
            fp = font("Anton-Regular.ttf", 40)
            txt = "27 FILES + 1 LIVE REGISTRY PAGE"
            tw = fp.getlength(txt) + 88
            hh = int(70 * min(1.0, eob(t)))
            chip(d, ((W - tw) / 2, 900, (W + tw) / 2, 900 + hh), txt, fp, C.ORANGE, rad=14)
        return f

# ---------------- S2: Tui action (Veo) ----------------
class S2Action:
    def __init__(self):
        self.dir = f"{TRIAL}/_f-b2set"
        self.n = len(os.listdir(self.dir)) if os.path.isdir(self.dir) else 0
        self.img = Image.open(f"{FB}/before/photo3.png").convert("RGB")

    def frame(self, i):
        if self.n:
            idx = 1 + min(i, self.n - 2)
            f = V3.square_from(self.dir, idx)
        else:
            f = ImageOps.fit(self.img, (W, H), Image.LANCZOS, centering=(0.5, 0.42))
        if i > 63:
            ft = clamp01((i - 63) / 4.0)
            f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)), ft)
        return caption(f, "IT STARTS WITH THEIR PHOTOS.", (i - 10) / 8.0)

# ---------------- S3: phone gallery, no repeats ----------------
def football_gallery_photos():
    """Tui's 4 photos + 2 scenery crops from his own shots — a believable camera roll."""
    ph = [Image.open(f"{FB}/before/photo{k}.png").convert("RGB") for k in range(1, 5)]
    p3 = ph[2]
    field = p3.crop((0, 0, p3.width, int(p3.height * 0.40)))               # goalposts, empty field
    p2 = ph[1]
    sky = p2.crop((0, 0, p2.width, int(p2.height * 0.34)))                 # field edge + trees, no person
    return ph + [field, sky]

class S3Phone:
    def __init__(self):
        photos = football_gallery_photos()
        self.b2 = V3.B2(photos)
        self.b2.TILES = [(0, 0.30), (1, 0.30), (2, 0.36), (3, 0.30), (4, 0.5), (5, 0.5)]

    def frame(self, i):
        return caption(self.b2.frame(i), "SEND US 4-10 REAL PHOTOS.", (i - 12) / 8.0)

# ---------------- S4: chrome — identity + kit ----------------
class S4Ident:
    def __init__(self, chrome):
        self.chrome = chrome
        ident = ImageOps.contain(Image.open(f"{FB}/_identity.png").convert("RGB"), (660, 452), Image.LANCZOS)
        icard = Image.new("RGB", (ident.width + 24, ident.height + 24), (255, 255, 255))
        icard.paste(ident, (12, 12)); self.ident = rounded(icard, 12)
        kit = ImageOps.contain(Image.open(f"{FB}/_kit.png").convert("RGB"), (340, 340), Image.LANCZOS)
        kcard = Image.new("RGB", (kit.width + 24, kit.height + 24), (255, 255, 255))
        kcard.paste(kit, (12, 12)); self.kit = rounded(kcard, 12)

    def frame(self, i):
        f = self.chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "BUILT FROM YOUR PHOTOS", underline_chars=5)
        headline(d, (70, 162), ["REBUILT FROM SCRATCH."], size=72)
        C.body(d, (72, 276), ["Identity first, kit second — every frame is built around",
                              "your athlete. Not a template. Not a face swap."])
        t1 = clamp01(i / 14.0); t2 = clamp01((i - 8) / 14.0)
        if t1 > 0:
            fade_paste(f, self.ident, (int(64 - (1 - eoc(t1)) * 80), 396), eoc(t1))
        if t2 > 0:
            fade_paste(f, self.kit, (int(650 + (1 - eoc(t2)) * 80), 560), eoc(t2))
        return f

# ---------------- S5: chrome — the fan, football center ----------------
class S5Sports:
    CARDS = [f"{SRC}/hockey-card-front.png", f"{SRC}/baseball-card-front.png",
             f"{SRC}/football-card-front.png", f"{SRC}/cheer-card-front-PR.png",
             f"{SRC}/gymnastics-card-front.png"]

    def __init__(self, chrome):
        self.chrome = chrome
        self.tiles = [contain(p, 280, 392, 12) for p in self.CARDS]
        self.tiles[2] = contain(self.CARDS[2], 318, 445, 12)
        self.slots = [(178, 606, -14), (352, 566, -7), (540, 534, 0), (728, 566, 7), (902, 606, 14)]

    def frame(self, i):
        f = self.chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "17 SPORTS · 6 STYLES", underline_chars=8)
        headline(d, (70, 162), ["ANY SPORT. ANY ATHLETE."], size=72)
        for k, (tile, (cx, cy, deg)) in enumerate(zip(self.tiles, self.slots)):
            t = clamp01((i - k * 4) / 12.0)
            if t <= 0: continue
            e = eob(t)
            im = tile.rotate(deg * e, expand=True, resample=Image.BICUBIC)
            al = min(1.0, t * 1.8)
            if al < 1: im.putalpha(im.getchannel("A").point(lambda v: int(v * al)))
            y = cy + int((1 - e) * 110)
            shadowed(f, im, (int(cx - im.width / 2), int(y - im.height / 2)), blur=20, sa=48, dy=14)
        return f

class S5Flip:
    """The fan's cards flip on their vertical axis and become the posters."""
    POSTERS = [f"{SRC}/hockey-poster.png", f"{SRC}/baseball-poster.png",
               f"{SRC}/football-poster.png", f"{SRC}/cheer-poster-PR.png",
               f"{SRC}/gymnastics-poster.png"]

    def __init__(self, chrome, s5):
        self.chrome = chrome
        self.s5 = s5
        self.posters = [contain(p, 280, 392, 12) for p in self.POSTERS]
        self.posters[2] = contain(self.POSTERS[2], 318, 445, 12)

    def frame(self, i):
        f = self.chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "17 SPORTS · 6 STYLES", underline_chars=8)
        headline(d, (70, 162), ["THE CARDS. THE WALL."], size=72)
        for k, (card, poster, (cx, cy, deg)) in enumerate(
                zip(self.s5.tiles, self.posters, self.s5.slots)):
            t = clamp01((i - k * 4) / 16.0)
            wf = abs(math.cos(math.pi * min(1.0, t)))
            im = card if t < 0.5 else poster
            im = im.rotate(deg, expand=True, resample=Image.BICUBIC)
            w2 = max(2, int(im.width * (wf if t < 1.0 else 1.0)))
            im = im.resize((w2, im.height), Image.LANCZOS)
            shadowed(f, im, (int(cx - im.width / 2), int(cy - im.height / 2)),
                     blur=20, sa=48, dy=14)
        return f

def main():
    os.makedirs(OUT_FRAMES, exist_ok=True)
    for old in os.listdir(OUT_FRAMES):
        os.remove(os.path.join(OUT_FRAMES, old))
    chrome = C.Frame()
    s1, s2, s3 = S1Hook(chrome), S2Action(), S3Phone()
    s4, s5 = S4Ident(chrome), S5Sports(chrome)
    end = C.EndCard("THE WALL. THE CARDS. THE WHOLE SEASON.")

    def s6(i):
        f = end.frame(i, 48)
        if i > 14:
            d = ImageDraw.Draw(f)
            fs = font("Barlow-SemiBold.ttf", 24)
            txt = "17 SPORTS  ·  6 STYLES  ·  27 FILES"
            d.text(((W - fs.getlength(txt)) / 2, 878), txt, font=fs, fill=(150, 160, 176))
        return f

    s5b = S5Flip(chrome, s5)
    beats = [(78, s1.frame), (75, s2.frame), (60, s3.frame),
             (66, s4.frame), (60, s5.frame), (45, s5b.frame), (48, s6)]
    XF = {1: 6, 3: 6, 4: 6, 6: 8}   # S2->S3 hard cut; S5->S5b seamless (same layout)

    n, prev = 0, None
    for bi, (length, fn) in enumerate(beats):
        xf = XF.get(bi, 0)
        for i in range(length):
            img = fn(i)
            if prev is not None and i < xf:
                img = Image.blend(prev, img, (i + 1) / (xf + 1))
            img.save(f"{OUT_FRAMES}/f{n:04d}.png")
            n += 1
            if n % 60 == 0:
                print(f"{n} frames")
        prev = fn(length - 1)
    print(f"frames: {n} ({n / FPS:.2f}s)")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS),
                    "-i", f"{OUT_FRAMES}/f%04d.png", "-c:v", "libx264", "-crf", "17",
                    "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-an", OUT_MP4], check=True)
    print("done:", OUT_MP4)

if __name__ == "__main__":
    main()
