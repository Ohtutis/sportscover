#!/usr/bin/env python3
"""Etsy POSTER listing — second video: the close.

Mirror of `render_card_close.py` (it imports that file's chrome, helpers and shared
beats rather than copying them). One beat is different, and it is the whole point:

  the card buyer asks "what files do I get?"  → the card close answers with deliverables
  the poster buyer asks "how big is it?"      → this one answers with a scale drawing

  A 0.0-2.4   "WILL IT LOOK LIKE THEM?" + basketball photo -> poster
  B 2.4-7.2   football · cheer · gymnastics · ice hockey, same layout, real gate scores
  C 7.2-9.2   MEASURED, NOT CLAIMED — the five score chips
  D 9.2-11.0  YOU APPROVE IT FIRST — proof -> approved
  E 11.0-13.4 TWO SIZES, TO SCALE — 18x24 next to 24x36 with a 5'9" figure
  F 13.4-14.7 shield + THEIR PHOTOS. THEIR POSTER.

Run:  python3 etsy/video/render_poster_close.py
"""
import importlib.util, os, subprocess
from PIL import Image, ImageDraw, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)

_spec = importlib.util.spec_from_file_location("cardclose", "etsy/video/render_card_close.py")
C = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(C)

W = H = 1080
FPS = 30
SRC = C.SRC
OUT_FRAMES = os.environ.get("GDE_PCLOSE_FRAMES", "etsy/video/_frames_poster_close")
OUT_MP4 = "etsy/listing-videos/GDE-etsy-02-poster-close-1080.mp4"

font, chip, rounded, shadowed = C.font, C.chip, C.rounded, C.shadowed
eyebrow, headline, body, track_text = C.eyebrow, C.headline, C.body, C.track_text
clamp01, ease_out_cubic, ease_out_back = C.clamp01, C.ease_out_cubic, C.ease_out_back
INK, ORANGE, GREEN, MUTED = C.INK, C.ORANGE, C.GREEN, C.MUTED

PAIRS = [
    ("basketball",   "BASKETBALL",  f"{SRC}/marcus-sn-poster.png"),
    ("football",     "FOOTBALL",    f"{SRC}/football-poster.png"),
    ("cheerleading", "CHEER",       f"{SRC}/cheer-poster-PR.png"),
    ("gymnastics",   "GYMNASTICS",  f"{SRC}/gymnastics-poster.png"),
    ("ice-hockey",   "ICE HOCKEY",  f"{SRC}/hockey-poster.png"),
]

class Pairs:
    """Their photo beside their poster. Posters are 3:4, so both sides are 3:4 and the
    row sits lower than the card version's."""
    PW, PH = 340, 453
    OW, OH = 372, 496

    def __init__(self):
        self.items = []
        for sport, label, posterp in PAIRS:
            photo = Image.open(f"art-pipeline/out/athletes/{sport}/before/photo4.png").convert("RGB")
            photo = rounded(ImageOps.fit(photo, (self.PW, self.PH), Image.LANCZOS,
                                         centering=(0.5, 0.32)), 12)
            poster = rounded(Image.open(posterp).convert("RGB")
                             .resize((self.OW, self.OH), Image.LANCZOS), 10)
            score, ok = C.gate_score(sport)
            self.items.append((label, photo, poster, score, ok))

    def frame(self, chrome, k, i, big_headline=False):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        label, photo, poster, score, ok = self.items[k]
        if big_headline:
            eyebrow(d, (72, 118), "THE ONE THING THAT MATTERS", underline_chars=7)
            headline(d, (70, 162), ["WILL IT LOOK", "LIKE THEM?"], size=82)
        else:
            eyebrow(d, (72, 118), "THEIR PHOTO. THEIR POSTER.", underline_chars=5)
            headline(d, (70, 162), [label], size=82)
        top = 376
        tp = clamp01(i / 12.0); tc = clamp01((i - 5) / 14.0)
        ep, ec = ease_out_cubic(tp), ease_out_cubic(tc)
        gap = 44
        x0 = (W - (self.PW + gap + self.OW)) // 2
        if ep > 0:
            ph = photo.copy()
            if ep < 1:
                ph.putalpha(ph.getchannel("A").point(lambda v: int(v * ep)))
            shadowed(f, ph, (int(x0 - (1 - ep) * 90), top + 22), blur=20, sa=40, dy=14)
        if ec > 0:
            po = poster.copy()
            if ec < 1:
                po.putalpha(po.getchannel("A").point(lambda v: int(v * ec)))
            shadowed(f, po, (int(x0 + self.PW + gap + (1 - ec) * 90), top), blur=22, sa=44, dy=16)
        if ec > 0.15:
            ax, ay = x0 + self.PW + gap / 2, top + self.OH / 2
            r = 22
            d.ellipse([ax - r, ay - r, ax + r, ay + r], fill=ORANGE)
            d.polygon([(ax - 6, ay - 9), (ax + 8, ay), (ax - 6, ay + 9)], fill=(255, 255, 255))
        if score is not None and i > 16:
            fc = font("Anton-Regular.ttf", 28)
            fs = font("Barlow-SemiBold.ttf", 19)
            bx = x0 + self.PW + gap
            chip(d, (bx, top + self.OH + 18, bx + self.OW, top + self.OH + 70),
                 f"FACE MATCH  {score:.2f}", fc, GREEN if ok else C.RED)
            track_text(d, (x0, top + self.PH + 36), "THEIR REAL PHOTO", fs, MUTED, tracking=3)
        return f

class Proof:
    def __init__(self):
        self.poster = rounded(Image.open(f"{SRC}/marcus-sn-poster.png").convert("RGB")
                              .resize((342, 456), Image.LANCZOS), 10)

    def frame(self, chrome, i):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "NOTHING SHIPS UNTIL YOU SAY SO", underline_chars=7)
        headline(d, (70, 162), ["YOU APPROVE IT FIRST."], size=76)
        body(d, (72, 286), ["We send a proof and wait. Nothing is final until you approve it —",
                            "corrections are part of the price, not an extra."])
        wm = clamp01(1 - (i - 26) / 12.0)
        poster = C.Proof.watermark(self, self.poster, wm) if wm > 0 else self.poster
        shadowed(f, poster, ((W - poster.width) // 2, 396), blur=22, sa=52, dy=16)
        if i > 20:
            t = clamp01((i - 20) / 8.0)
            fa = font("Anton-Regular.ttf", 34)
            tw = fa.getlength("APPROVED") + 64
            hh = int(58 * min(1.0, ease_out_back(t)))
            chip(d, ((W - tw) / 2, 884, (W + tw) / 2, 884 + hh), "APPROVED", fa, GREEN, rad=10)
        return f

class Sizes:
    """A wall elevation drawn to one scale — posters, a sofa and a 5'9" figure at the same
    pixels-per-inch. A mockup shows a poster; this shows how big it is."""
    PPI = 8
    FLOOR = 900

    def __init__(self):
        self.small = Image.open(f"{SRC}/marcus-sn-poster.png").convert("RGB")      # 3:4 = 18x24
        big = f"{SRC}/marcus-sn-poster-2to3.png"                                    # 2:3 = 24x36
        self.big = Image.open(big).convert("RGB") if os.path.exists(big) else self.small

    def _hang(self, d, f, img, w_in, h_in, cx, label, t):
        if t <= 0: return
        w, h = int(w_in * self.PPI), int(h_in * self.PPI)
        e = ease_out_cubic(t)
        pl = rounded(img.resize((w, h), Image.LANCZOS), 6)
        pl.putalpha(pl.getchannel("A").point(lambda v: int(v * e)))
        cy = self.FLOOR - int(57 * self.PPI)          # hung at eye level, 57 in
        x, y = int(cx - w / 2), int(cy - h / 2 + (1 - e) * 22)
        shadowed(f, pl, (x, y), blur=18, sa=42, dy=12)
        if t > 0.5:
            d.line([(x, y + h + 16), (x + w, y + h + 16)], fill=ORANGE, width=3)
            for tick in (x, x + w):
                d.line([(tick, y + h + 8), (tick, y + h + 24)], fill=ORANGE, width=3)
            fs = font("Anton-Regular.ttf", 28)
            tw = fs.getlength(label) + 36
            chip(d, (cx - tw / 2, y + h + 32, cx + tw / 2, y + h + 78), label, fs, INK, rad=8)

    def _sofa(self, d, t):
        """72 x 30 in, drawn schematically so it never reads as a photograph."""
        if t <= 0: return
        col = (215, 214, 209)
        w, h = int(72 * self.PPI), int(30 * self.PPI)
        x0, y0 = 108, self.FLOOR - h
        e = ease_out_cubic(t)
        y0 += int((1 - e) * 18)
        d.rounded_rectangle([x0, y0, x0 + w, y0 + int(h * 0.52)], 16, fill=col)          # back
        d.rounded_rectangle([x0 - 6, y0 + int(h * 0.42), x0 + w + 6, self.FLOOR - 22], 18, fill=col)
        for lx in (x0 + 26, x0 + w - 26):                                                 # legs
            d.rounded_rectangle([lx - 7, self.FLOOR - 26, lx + 7, self.FLOOR], 4, fill=(196, 195, 190))

    def _figure(self, d, cx, t):
        if t <= 0: return
        col = (206, 205, 200)
        hgt = 69 * self.PPI
        top = self.FLOOR - hgt
        hr = int(4.4 * self.PPI)
        d.ellipse([cx - hr, top, cx + hr, top + hr * 2], fill=col)
        bt = top + hr * 2 + 5
        bh = int(hgt * 0.40)
        bw = int(9.5 * self.PPI)
        d.rounded_rectangle([cx - bw / 2, bt, cx + bw / 2, bt + bh], 14, fill=col)
        lt = bt + bh - 4
        lw = int(3.4 * self.PPI)
        d.rounded_rectangle([cx - bw / 2 + 2, lt, cx - bw / 2 + 2 + lw, self.FLOOR], 8, fill=col)
        d.rounded_rectangle([cx + bw / 2 - 2 - lw, lt, cx + bw / 2 - 2, self.FLOOR], 8, fill=col)
        fs = font("Barlow-SemiBold.ttf", 20)
        track_text(d, (cx - 30, self.FLOOR + 14), "5'9\"", fs, MUTED, tracking=2)

    def frame(self, chrome, i):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "HOW BIG IT ACTUALLY IS", underline_chars=7)
        headline(d, (70, 162), ["TWO SIZES, TO SCALE."], size=76)
        fs = font("Barlow-Regular.ttf", 25)
        d.text((72, 262), "Both files print-ready at 300 DPI — print at home, locally, or online.",
               font=fs, fill=MUTED)
        d.line([(60, self.FLOOR), (W - 60, self.FLOOR)], fill=(214, 213, 208), width=3)
        self._sofa(d, clamp01((i - 18) / 12.0))
        self._hang(d, f, self.small, 18, 24, 300, "18 × 24 in", clamp01(i / 14.0))
        self._hang(d, f, self.big, 24, 36, 566, "24 × 36 in", clamp01((i - 9) / 14.0))
        self._figure(d, 906, clamp01((i - 26) / 10.0))
        return f

def main():
    os.makedirs(OUT_FRAMES, exist_ok=True)
    for old in os.listdir(OUT_FRAMES):
        os.remove(os.path.join(OUT_FRAMES, old))
    chrome = C.Frame()
    pairs, meas, proof, sizes = Pairs(), C.Measured(), Proof(), Sizes()
    end = C.EndCard("THEIR PHOTOS. THEIR POSTER.")

    beats = [(72, lambda i: pairs.frame(chrome, 0, i, big_headline=True))]
    for k in range(1, 5):
        beats.append((36, (lambda kk: (lambda i: pairs.frame(chrome, kk, i)))(k)))
    beats.append((60, lambda i: meas.frame(chrome, i, 60)))
    beats.append((54, lambda i: proof.frame(chrome, i)))
    beats.append((72, lambda i: sizes.frame(chrome, i)))
    beats.append((39, lambda i: end.frame(i, 39)))

    XF, n, prev = 6, 0, None
    for length, fn in beats:
        for i in range(length):
            img = fn(i)
            if prev is not None and i < XF:
                img = Image.blend(prev, img, (i + 1) / (XF + 1))
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
