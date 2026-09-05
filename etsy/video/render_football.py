#!/usr/bin/env python3
"""FOOTBALL card + poster listings — all four videos (story + close each).

Per the listing canon: the football PAIR leads with two different finishes —
CARD = Fire & Smoke, POSTER = Heritage (docs/ETSY-COPY.md, decided 2026-08-27).
Structure mirrors the approved basketball/set videos; captions are the set-story style
(white Anton, soft drop shadow, baked in).

Outputs (all 1080x1080, 30fps, <=15 s, no audio):
  GDE-etsy-05-ftb-card-story-1080.mp4    13.3 s
  GDE-etsy-05-ftb-card-close-1080.mp4    13.7 s
  GDE-etsy-06-ftb-poster-story-1080.mp4  12.3 s
  GDE-etsy-06-ftb-poster-close-1080.mp4  13.7 s

Run:  GDE_TRIAL=<local mirror> python3 etsy/video/render_football.py [card|poster|all]
"""
import importlib.util, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)

def load(name, path):
    sp = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
    return m

V3 = load("cardv3", "etsy/video/render_card_promo_v3.py")
C = load("cardclose", "etsy/video/render_card_close.py")
SET = load("setpromo", "etsy/video/render_set_promo.py")
PC = load("posterclose", "etsy/video/render_poster_close.py")
SC = load("sportcard", "etsy/video/render_sport_card.py")   # shared Packs transition

W = H = 1080
FPS = 30
TRIAL = V3.TRIAL
SRC = "etsy/listing-images/04-complete-set/src"
FB = "art-pipeline/out/athletes/football"
FRAMES = os.environ.get("GDE_FTB_FRAMES", "etsy/video/_frames_ftb")

clamp01, eoc, eob = V3.clamp01, V3.ease_out_cubic, V3.ease_out_back
rounded, shadowed, font, chip = C.rounded, C.shadowed, C.font, C.chip
eyebrow, headline = C.eyebrow, C.headline
caption = SET.caption
contain = SET.contain

FS_FRONT = f"{SRC}/football-card-FS.png"
FS_BACK_2X = "card-flip/assets/football-fs/card-back.png"
HE_POSTER = f"{SRC}/football-poster-HE.png"

CARD_FAN = [f"{SRC}/football-card-SS.png", f"{SRC}/football-card-HE.png",
            FS_FRONT, f"{SRC}/football-card-front.png", f"{SRC}/football-card-PR.png"]

CLOSE_CAST_CARDS = [
    ("football",     "FOOTBALL",   FS_FRONT),
    ("baseball",     "BASEBALL",   f"{SRC}/baseball-card-front.png"),
    ("cheerleading", "CHEER",      f"{SRC}/cheer-card-front-PR.png"),
    ("gymnastics",   "GYMNASTICS", f"{SRC}/gymnastics-card-front.png"),
]
CLOSE_CAST_POSTERS = [
    ("football",     "FOOTBALL",   HE_POSTER),
    ("baseball",     "BASEBALL",   f"{SRC}/baseball-poster.png"),
    ("cheerleading", "CHEER",      f"{SRC}/cheer-poster-PR.png"),
    ("gymnastics",   "GYMNASTICS", f"{SRC}/gymnastics-poster.png"),
]

# ---------------- shared story beats ----------------
class Action(SET.S2Action):
    pass                     # Tui Veo clip + flash, caption baked

def phone_beat():
    return SET.S3Phone()

class Ident(SET.S4Ident):
    pass

# ---------------- card story extras ----------------
class FlipBeat:
    """The Fire & Smoke flip on light stock."""
    def __init__(self):
        self.dir = f"{TRIAL}/_f-ftbflip"

    def frame(self, i):
        return V3.seq_frame(self.dir, 30 + i)

class FinishFan:
    """Six... five football finishes, Fire & Smoke center and largest."""
    def __init__(self, chrome):
        self.chrome = chrome
        self.tiles = [contain(p, 280, 392, 12) for p in CARD_FAN]
        self.tiles[2] = contain(CARD_FAN[2], 318, 445, 12)
        self.slots = [(178, 606, -14), (352, 566, -7), (540, 534, 0), (728, 566, 7), (902, 606, 14)]

    def frame(self, i):
        f = self.chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "ONE ATHLETE · SIX STYLES", underline_chars=3)
        headline(d, (70, 162), ["PICK THEIR FINISH."], size=72)
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

# ---------------- poster story extras ----------------
class PosterReveal:
    def __init__(self, chrome):
        self.chrome = chrome
        self.poster = contain(HE_POSTER, 520, 694, 10)

    def frame(self, i):
        f = self.chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "HERITAGE FINISH", underline_chars=8)
        headline(d, (70, 162), ["THE POSTER."], size=76)
        t = clamp01(i / 16.0)
        e = eob(t)
        s_ = 0.85 + 0.15 * e
        po = self.poster.resize((int(520 * s_), int(694 * s_)), Image.LANCZOS)
        al = min(1.0, t * 2)
        if al < 1: po.putalpha(po.getchannel("A").point(lambda v: int(v * al)))
        shadowed(f, po, (int(W / 2 - po.width / 2), int(640 - po.height / 2)), blur=24, sa=52, dy=16)
        return f

class RoomBeat:
    """The one good room composite. RIGHT-biased on purpose: the room's left wall carries
    generated basketball/NBA-style posters (wrong sport + third-party likeness risk) and the
    floor has a stray basketball. Window x>=487, y<=1516 keeps both out (owner-flagged)."""
    def __init__(self):
        self.img = Image.open(f"{SRC}/football-room2.png").convert("RGB")

    def frame(self, i):
        t = clamp01(i / 53.0)
        e = eoc(t)
        iw, ih = self.img.size
        z = 1.38 + 0.09 * e
        vw = int(min(iw, ih) / z)
        cx = int(iw * 0.60)                       # right-biased: boy + Tui poster only
        cy = int(ih * 0.40)
        x0 = max(0, min(iw - vw, cx - vw // 2)); y0 = max(0, min(ih - vw, cy - vw // 2))
        return self.img.crop((x0, y0, x0 + vw, y0 + vw)).resize((W, H), Image.LANCZOS)

# ---------------- close beats (subclassed casts) ----------------
class CardPairs(C.Pairs):
    def __init__(self):
        self.items = []
        for sport, label, cardp in CLOSE_CAST_CARDS:
            photo = Image.open(f"art-pipeline/out/athletes/{sport}/before/photo4.png").convert("RGB")
            photo = rounded(ImageOps.fit(photo, (self.PW, self.PH), Image.LANCZOS, centering=(0.5, 0.32)), 12)
            card = rounded(Image.open(cardp).convert("RGB").resize((self.CW, self.CH), Image.LANCZOS), 14)
            score, ok = C.gate_score(sport)
            self.items.append((label, photo, card, score, ok))

class PosterPairs(PC.Pairs):
    def __init__(self):
        self.items = []
        for sport, label, posterp in CLOSE_CAST_POSTERS:
            photo = Image.open(f"art-pipeline/out/athletes/{sport}/before/photo4.png").convert("RGB")
            photo = rounded(ImageOps.fit(photo, (self.PW, self.PH), Image.LANCZOS, centering=(0.5, 0.32)), 12)
            poster = rounded(Image.open(posterp).convert("RGB").resize((self.OW, self.OH), Image.LANCZOS), 10)
            score, ok = C.gate_score(sport)
            self.items.append((label, photo, poster, score, ok))

def measured_for(cast):
    m = C.Measured()
    m.rows = [(lbl, *C.gate_score(sport)) for sport, lbl, *_ in cast]
    m.rows.append(("A REJECTED TAKE", 0.287, False))
    return m

class CardDeliverables:
    """4 downloads + 1 live page — the FS football edition, everything contained."""
    TW, THh, GAP = 236, 338, 16

    def __init__(self):
        items = [(FS_FRONT, "CARD FRONT"), (FS_BACK_2X, "CARD BACK"),
                 (f"{SRC}/football-certificate.png", "CERTIFICATE"), (FS_FRONT, "FLIP VIDEO")]
        self.tiles = []
        for p, label in items:
            im = ImageOps.contain(Image.open(p).convert("RGB"), (self.TW - 16, self.THh - 16), Image.LANCZOS)
            pl = Image.new("RGB", (self.TW, self.THh), (255, 255, 255))
            pl.paste(im, ((self.TW - im.width) // 2, (self.THh - im.height) // 2))
            self.tiles.append((rounded(pl, 10), label))

    def frame(self, chrome, i):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "YOUR DIGITAL CARD SET", underline_chars=4)
        headline(d, (70, 162), ["EVERYTHING YOU GET."], size=76)
        x0 = (W - (self.TW * 4 + self.GAP * 3)) // 2
        fl = font("Barlow-SemiBold.ttf", 18)
        for k, (tile, label) in enumerate(self.tiles):
            t = clamp01((i - 4 - k * 4) / 12.0)
            if t <= 0: continue
            e = eoc(t)
            tl = tile.copy()
            tl.putalpha(tl.getchannel("A").point(lambda v: int(v * e)))
            tx, ty = x0 + k * (self.TW + self.GAP), int(300 + (1 - e) * 34)
            shadowed(f, tl, (tx, ty), blur=18, sa=38, dy=12)
            if label == "FLIP VIDEO" and t > 0.55:
                pcx, pcy, pr = tx + self.TW // 2, ty + self.THh // 2, 36
                d.ellipse([pcx - pr, pcy - pr, pcx + pr, pcy + pr], fill=(20, 25, 31))
                d.polygon([(pcx - 11, pcy - 16), (pcx + 16, pcy), (pcx - 11, pcy + 16)],
                          fill=(255, 255, 255))
            if t > 0.6:
                C.track_text(d, (tx + 4, 300 + self.THh + 18), label, fl, C.INK, tracking=2)
        if i > 24:
            t = clamp01((i - 24) / 10.0)
            fp = font("Anton-Regular.ttf", 50)
            txt = "YOUR PROOF IN 24 HOURS"
            tw = fp.getlength(txt) + 100
            hh = int(90 * min(1.0, eob(t)))
            chip(d, ((W - tw) / 2, 748, (W + tw) / 2, 748 + hh), txt, fp, C.ORANGE, rad=16)
        if i > 34:
            fs = font("Barlow-SemiBold.ttf", 22)
            txt = "PRINT-READY FILES + 1 LIVE REGISTRY PAGE  ·  ONE OF ONE"
            d.text(((W - C.text_w(fs, txt, 1)) / 2, 866), txt, font=fs, fill=C.MUTED)
        return f

class MattedSizes(PC.Sizes):
    """Heritage art in both frames; the 24x36 is the art matted in a charcoal 2:3 frame —
    no football 2:3 export exists yet and stretching would lie about the aspect."""
    def __init__(self):
        self.small = Image.open(HE_POSTER).convert("RGB")
        art = ImageOps.contain(self.small, (600, 800), Image.LANCZOS)
        mat = Image.new("RGB", (600, 900), (26, 29, 34))
        mat.paste(art, ((600 - art.width) // 2, (900 - art.height) // 2))
        self.big = mat

# ---------------- assembly ----------------
def render(beats, xf_map, out_mp4):
    os.makedirs(FRAMES, exist_ok=True)
    for old in os.listdir(FRAMES):
        os.remove(os.path.join(FRAMES, old))
    n, prev = 0, None
    for bi, (length, fn) in enumerate(beats):
        xf = xf_map.get(bi, 0)
        for i in range(length):
            img = fn(i)
            if prev is not None and i < xf:
                img = Image.blend(prev, img, (i + 1) / (xf + 1))
            img.save(f"{FRAMES}/f{n:04d}.png")
            n += 1
            if n % 90 == 0:
                print(f"  {n} frames")
        prev = fn(length - 1)
    print(f"  frames: {n} ({n / FPS:.2f}s)")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS),
                    "-i", f"{FRAMES}/f%04d.png", "-c:v", "libx264", "-crf", "17",
                    "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-an", out_mp4], check=True)
    print("  done:", out_mp4)

def main(which="all"):
    chrome = C.Frame()
    act, phone = Action(), phone_beat()
    packs = SC.Packs(chrome, {"slug": "football"})

    if which in ("card", "all"):
        print("== football card story")
        flip, fan = FlipBeat(), FinishFan(chrome)
        end = C.EndCard("THEIR PHOTOS. THEIR CARD.")
        render([(75, act.frame), (60, phone.frame), (packs.LEN, packs.frame),
                (78, flip.frame), (54, fan.frame), (48, lambda i: end.frame(i, 48))],
               {2: 6, 3: 6, 4: 6, 5: 8},
               "etsy/listing-videos/GDE-etsy-05-ftb-card-story-1080.mp4")

        print("== football card close")
        pairs = CardPairs()
        meas = measured_for(CLOSE_CAST_CARDS)
        proof = C.Proof()
        proof.card = rounded(Image.open(FS_FRONT).convert("RGB").resize((348, 487), Image.LANCZOS), 14)
        deliv = CardDeliverables()
        end = C.EndCard("THEIR PHOTOS. THEIR CARD.")
        beats = [(72, lambda i: pairs.frame(chrome, 0, i, 72, big_headline=True))]
        for k in range(1, 4):
            beats.append((36, (lambda kk: (lambda i: pairs.frame(chrome, kk, i, 36)))(k)))
        beats += [(60, lambda i: meas.frame(chrome, i, 60)),
                  (54, lambda i: proof.frame(chrome, i, 54)),
                  (60, lambda i: deliv.frame(chrome, i)),
                  (39, lambda i: end.frame(i, 39))]
        render(beats, {k: 6 for k in range(1, 8)},
               "etsy/listing-videos/GDE-etsy-05-ftb-card-close-1080.mp4")

    if which in ("poster", "all"):
        print("== football poster story")
        rev, room = PosterReveal(chrome), RoomBeat()
        end = C.EndCard("THEIR PHOTOS. THEIR POSTER.")
        render([(75, act.frame), (60, phone.frame), (packs.LEN, packs.frame),
                (60, rev.frame), (54, room.frame), (48, lambda i: end.frame(i, 48))],
               {2: 6, 3: 6, 4: 6, 5: 8},
               "etsy/listing-videos/GDE-etsy-06-ftb-poster-story-1080.mp4")

        print("== football poster close")
        pairs = PosterPairs()
        meas = measured_for(CLOSE_CAST_POSTERS)
        proof = PC.Proof()
        proof.poster = rounded(Image.open(HE_POSTER).convert("RGB").resize((342, 456), Image.LANCZOS), 10)
        sizes = MattedSizes()
        end = C.EndCard("THEIR PHOTOS. THEIR POSTER.")
        beats = [(72, lambda i: pairs.frame(chrome, 0, i, big_headline=True))]
        for k in range(1, 4):
            beats.append((36, (lambda kk: (lambda i: pairs.frame(chrome, kk, i)))(k)))
        beats += [(60, lambda i: meas.frame(chrome, i, 60)),
                  (54, lambda i: proof.frame(chrome, i)),
                  (72, lambda i: sizes.frame(chrome, i)),
                  (39, lambda i: end.frame(i, 39))]
        render(beats, {k: 6 for k in range(1, 8)},
               "etsy/listing-videos/GDE-etsy-06-ftb-poster-close-1080.mp4")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "all")
