#!/usr/bin/env python3
"""CHEERLEADING card + poster listings — all four videos (story + close each).

Second sport built from the football template (`render_football.py`), which is now the
per-sport pattern: import the approved renderers, swap assets, cast and lead finishes.

Lead finishes, per the canon rule that a sport's card and poster must differ:
  CARD = **Prism Rush** (vivid — reads as cheer energy)
  POSTER = **Signature Spotlight** (clean and bright — the opposite register)

⚠️ **No Veo here.** Amara Boyd is 15 (`athletes.ts ageYears: 15`), so image-to-video is
refused for her by policy and by the provider — the action beat is a procedural push +
parallax on her real gym photo. Check `ageYears` before any athlete i2v, every time.

Outputs (1080x1080, 30 fps, <= 15 s, no audio):
  GDE-etsy-07-chr-card-story-1080.mp4
  GDE-etsy-07-chr-card-close-1080.mp4
  GDE-etsy-08-chr-poster-story-1080.mp4
  GDE-etsy-08-chr-poster-close-1080.mp4

Run:  GDE_TRIAL=<local mirror> python3 etsy/video/render_cheer.py [card|poster|all]
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
CH = "art-pipeline/out/athletes/cheerleading"
FRAMES = os.environ.get("GDE_CHR_FRAMES", "etsy/video/_frames_chr")

clamp01, eoc, eob = V3.clamp01, V3.ease_out_cubic, V3.ease_out_back
rounded, shadowed, font, chip = C.rounded, C.shadowed, C.font, C.chip
eyebrow, headline = C.eyebrow, C.headline
caption, contain = SET.caption, SET.contain

PR_FRONT = f"{SRC}/cheer-card-front-PR.png"
PR_BACK = f"{SRC}/cheer-card-back-PR.png"
SS_POSTER = f"{SRC}/cheer-poster-SS.png"
CERT = f"{SRC}/cheer-certificate.png"
ROOM = f"{SRC}/cheer-room.png"

CARD_FAN = [f"{SRC}/cheer-card-SS.png", f"{SRC}/cheer-card-HE.png",
            PR_FRONT, f"{SRC}/cheer-card-front.png", f"{SRC}/cheer-card-FS.png"]

# cheer leads; then the sports a cheer parent recognises around her
CLOSE_CAST_CARDS = [
    ("cheerleading", "CHEER",      PR_FRONT),
    ("gymnastics",   "GYMNASTICS", f"{SRC}/gymnastics-card-front.png"),
    ("football",     "FOOTBALL",   f"{SRC}/football-card-FS.png"),
    ("baseball",     "BASEBALL",   f"{SRC}/baseball-card-front.png"),
]
CLOSE_CAST_POSTERS = [
    ("cheerleading", "CHEER",      SS_POSTER),
    ("gymnastics",   "GYMNASTICS", f"{SRC}/gymnastics-poster.png"),
    ("football",     "FOOTBALL",   f"{SRC}/football-poster-HE.png"),
    ("baseball",     "BASEBALL",   f"{SRC}/baseball-poster.png"),
]

# ---------------- story beats ----------------
class Action:
    """Procedural, NOT Veo — the athlete is a minor. Accelerating push + handheld drift on
    her real gym photo, then freeze + the shutter flash."""
    LEN = 72

    def __init__(self):
        self.img = Image.open(f"{CH}/before/photo2.png").convert("RGB")

    def frame(self, i):
        FREEZE = 56
        j = min(i, FREEZE)
        t = j / float(FREEZE)
        z = 1.10 + 0.26 * (t * t)
        wob = t * 5
        iw, ih = self.img.size
        side = min(iw, ih)
        vw = int(side / z)
        cx = iw // 2 + int(wob * math.sin(j / 2.1))
        cy = int(ih * 0.42) + int(wob * 0.6 * math.sin(j / 1.7 + 1.0))
        x0 = max(0, min(iw - vw, cx - vw // 2)); y0 = max(0, min(ih - vw, cy - vw // 2))
        f = self.img.crop((x0, y0, x0 + vw, y0 + vw)).resize((W, H), Image.LANCZOS)
        f = Image.blend(f, f.filter(ImageFilter.GaussianBlur(4)), clamp01(0.06 + 0.10 * t))
        if i > FREEZE + 4:
            ft = clamp01((i - FREEZE - 4) / 4.0)
            f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)), ft)
        return caption(f, "IT STARTS WITH THEIR PHOTOS.", (i - 10) / 8.0)

def cheer_gallery_photos():
    """Her 4 photos + 2 scenery crops from her own shots — no repeats, no invented images."""
    ph = [Image.open(f"{CH}/before/photo{k}.png").convert("RGB") for k in range(1, 5)]
    gym = ph[2].crop((0, 0, ph[2].width, int(ph[2].height * 0.34)))       # gym wall + mats
    mats = ph[1].crop((0, int(ph[1].height * 0.66), ph[1].width, ph[1].height))
    return ph + [gym, mats]

class Phone:
    def __init__(self):
        self.b2 = V3.B2(cheer_gallery_photos())
        self.b2.TILES = [(0, 0.30), (1, 0.28), (2, 0.30), (3, 0.30), (4, 0.5), (5, 0.5)]

    def frame(self, i):
        return caption(self.b2.frame(i), "SEND US 4-10 REAL PHOTOS.", (i - 12) / 8.0)

class Ident:
    def __init__(self, chrome):
        self.chrome = chrome
        ident = ImageOps.contain(Image.open(f"{CH}/_identity.png").convert("RGB"), (660, 452), Image.LANCZOS)
        ic = Image.new("RGB", (ident.width + 24, ident.height + 24), (255, 255, 255))
        ic.paste(ident, (12, 12)); self.ident = rounded(ic, 12)
        kit = ImageOps.contain(Image.open(f"{CH}/_kit.png").convert("RGB"), (340, 340), Image.LANCZOS)
        kc = Image.new("RGB", (kit.width + 24, kit.height + 24), (255, 255, 255))
        kc.paste(kit, (12, 12)); self.kit = rounded(kc, 12)

    def frame(self, i):
        f = self.chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "BUILT FROM YOUR PHOTOS", underline_chars=5)
        headline(d, (70, 162), ["REBUILT FROM SCRATCH."], size=72)
        C.body(d, (72, 276), ["Identity first, kit second — every frame is built around",
                              "your athlete. Not a template. Not a face swap."])
        t1 = clamp01(i / 14.0); t2 = clamp01((i - 8) / 14.0)
        if t1 > 0:
            SET.fade_paste(f, self.ident, (int(64 - (1 - eoc(t1)) * 80), 396), eoc(t1))
        if t2 > 0:
            SET.fade_paste(f, self.kit, (int(650 + (1 - eoc(t2)) * 80), 560), eoc(t2))
        return f

class FlipBeat:
    def __init__(self):
        self.dir = f"{TRIAL}/_f-chrflip"

    def frame(self, i):
        return V3.seq_frame(self.dir, 30 + i)

class FinishFan:
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

class PosterReveal:
    def __init__(self, chrome):
        self.chrome = chrome
        self.poster = contain(SS_POSTER, 520, 694, 10)

    def frame(self, i):
        f = self.chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "SIGNATURE SPOTLIGHT", underline_chars=9)
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
    """Her own room, generated empty and warped — no person, nothing readable, and the
    shelf carries pom-poms and medals so the room belongs to a cheer athlete."""
    def __init__(self):
        self.img = Image.open(ROOM).convert("RGB")

    def frame(self, i):
        t = clamp01(i / 53.0)
        e = eoc(t)
        iw, ih = self.img.size
        z = 1.12 + 0.10 * e
        vw = int(min(iw, ih) / z)
        cx, cy = int(iw * 0.44), int(ih * 0.46)
        x0 = max(0, min(iw - vw, cx - vw // 2)); y0 = max(0, min(ih - vw, cy - vw // 2))
        return self.img.crop((x0, y0, x0 + vw, y0 + vw)).resize((W, H), Image.LANCZOS)

# ---------------- close beats ----------------
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
    TW, THh, GAP = 236, 338, 16

    def __init__(self):
        items = [(PR_FRONT, "CARD FRONT"), (PR_BACK, "CARD BACK"),
                 (CERT, "CERTIFICATE"), (PR_FRONT, "FLIP VIDEO")]
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
    """SS art in both frames; 24x36 is the art matted in a charcoal 2:3 frame — no cheer
    2:3 export exists, and stretching 3:4 art would lie about the aspect."""
    def __init__(self):
        self.small = Image.open(SS_POSTER).convert("RGB")
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
    act, phone = Action(), Phone()
    packs = SC.Packs(chrome, {"slug": "cheerleading"})

    if which in ("card", "all"):
        print("== cheer card story")
        flip, fan = FlipBeat(), FinishFan(chrome)
        end = C.EndCard("THEIR PHOTOS. THEIR CARD.")
        render([(act.LEN, act.frame), (60, phone.frame), (packs.LEN, packs.frame),
                (78, flip.frame), (54, fan.frame), (48, lambda i: end.frame(i, 48))],
               {2: 6, 3: 6, 4: 6, 5: 8},
               "etsy/listing-videos/GDE-etsy-07-chr-card-story-1080.mp4")

        print("== cheer card close")
        pairs, meas, deliv = CardPairs(), measured_for(CLOSE_CAST_CARDS), CardDeliverables()
        proof = C.Proof()
        proof.card = rounded(Image.open(PR_FRONT).convert("RGB").resize((348, 487), Image.LANCZOS), 14)
        end = C.EndCard("THEIR PHOTOS. THEIR CARD.")
        beats = [(72, lambda i: pairs.frame(chrome, 0, i, 72, big_headline=True))]
        for k in range(1, 4):
            beats.append((36, (lambda kk: (lambda i: pairs.frame(chrome, kk, i, 36)))(k)))
        beats += [(60, lambda i: meas.frame(chrome, i, 60)),
                  (54, lambda i: proof.frame(chrome, i, 54)),
                  (60, lambda i: deliv.frame(chrome, i)),
                  (39, lambda i: end.frame(i, 39))]
        render(beats, {k: 6 for k in range(1, 8)},
               "etsy/listing-videos/GDE-etsy-07-chr-card-close-1080.mp4")

    if which in ("poster", "all"):
        print("== cheer poster story")
        rev, room = PosterReveal(chrome), RoomBeat()
        end = C.EndCard("THEIR PHOTOS. THEIR POSTER.")
        render([(act.LEN, act.frame), (60, phone.frame), (packs.LEN, packs.frame),
                (60, rev.frame), (54, room.frame), (48, lambda i: end.frame(i, 48))],
               {2: 6, 3: 6, 4: 6, 5: 8},
               "etsy/listing-videos/GDE-etsy-08-chr-poster-story-1080.mp4")

        print("== cheer poster close")
        pairs, meas, sizes = PosterPairs(), measured_for(CLOSE_CAST_POSTERS), MattedSizes()
        proof = PC.Proof()
        proof.poster = rounded(Image.open(SS_POSTER).convert("RGB").resize((342, 456), Image.LANCZOS), 10)
        end = C.EndCard("THEIR PHOTOS. THEIR POSTER.")
        beats = [(72, lambda i: pairs.frame(chrome, 0, i, big_headline=True))]
        for k in range(1, 4):
            beats.append((36, (lambda kk: (lambda i: pairs.frame(chrome, kk, i)))(k)))
        beats += [(60, lambda i: meas.frame(chrome, i, 60)),
                  (54, lambda i: proof.frame(chrome, i)),
                  (72, lambda i: sizes.frame(chrome, i)),
                  (39, lambda i: end.frame(i, 39))]
        render(beats, {k: 6 for k in range(1, 8)},
               "etsy/listing-videos/GDE-etsy-08-chr-poster-close-1080.mp4")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "all")
