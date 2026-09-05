#!/usr/bin/env python3
"""Etsy COMPLETE SET listing — second video: the close.

Mirror of the card/poster closes (imports `render_card_close.py` for chrome, helpers,
`Measured` and `EndCard`). The set buyer's question at the button is "what do I actually
get for $89?", so the counted tile wall is the money beat.

  A 0.0-2.4   WILL IT LOOK LIKE THEM? + basketball photo -> poster+card DUO
  B 2.4-7.2   football · cheer(PR) · gymnastics(HE) · ice hockey(FS), same DUO layout
  C 7.2-9.2   MEASURED, NOT CLAIMED — five real gate scores incl. the rejected take
  D 9.2-11.0  YOU APPROVE IT FIRST — poster+card proof -> APPROVED
  E 11.0-13.6 EVERYTHING. COUNTED. — 8 tiles + "27 FILES + 1 LIVE REGISTRY PAGE"
  F 13.6-14.9 shield + THE WALL. THE CARDS. THE WHOLE SEASON.

Run:  python3 etsy/video/render_set_close.py
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
TRIAL = C.TRIAL
OUT_FRAMES = os.environ.get("GDE_SCLOSE_FRAMES", "etsy/video/_frames_set_close")
OUT_MP4 = "etsy/listing-videos/GDE-etsy-04-set-close-1080.mp4"

font, chip, rounded, shadowed = C.font, C.chip, C.rounded, C.shadowed
eyebrow, headline, body, track_text = C.eyebrow, C.headline, C.body, C.track_text
clamp01, ease_out_cubic, ease_out_back = C.clamp01, C.ease_out_cubic, C.ease_out_back
INK, ORANGE, GREEN, MUTED = C.INK, C.ORANGE, C.GREEN, C.MUTED

# the listing's cast: FOOTBALL is the hero, then baseball, cheer, and the youngest
PAIRS = [
    ("football",     "FOOTBALL",    f"{SRC}/football-poster.png",    f"{SRC}/football-card-front.png"),
    ("baseball",     "BASEBALL",    f"{SRC}/baseball-poster.png",    f"{SRC}/baseball-card-front.png"),
    ("cheerleading", "CHEER",       f"{SRC}/cheer-poster-PR.png",    f"{SRC}/cheer-card-front-PR.png"),
    ("gymnastics",   "GYMNASTICS",  f"{SRC}/gymnastics-poster.png",  f"{SRC}/gymnastics-card-front.png"),
]

class Pairs:
    """Their photo -> the DUO: poster with the card overlapping its lower-right corner —
    the set is both products in one shot."""
    PW, PH = 330, 440

    def __init__(self):
        self.items = []
        for sport, label, posterp, cardp in PAIRS:
            photo = Image.open(f"art-pipeline/out/athletes/{sport}/before/photo4.png").convert("RGB")
            photo = rounded(ImageOps.fit(photo, (self.PW, self.PH), Image.LANCZOS,
                                         centering=(0.5, 0.32)), 12)
            poster = rounded(ImageOps.contain(Image.open(posterp).convert("RGB"),
                                              (340, 454), Image.LANCZOS), 8)
            card = rounded(ImageOps.contain(Image.open(cardp).convert("RGB"),
                                            (210, 294), Image.LANCZOS), 8)
            score, ok = C.gate_score(sport)
            self.items.append((label, photo, poster, card, score, ok))

    def frame(self, chrome, k, i, big_headline=False):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        label, photo, poster, card, score, ok = self.items[k]
        if big_headline:
            eyebrow(d, (72, 118), "THE ONE THING THAT MATTERS", underline_chars=7)
            headline(d, (70, 162), ["WILL IT LOOK", "LIKE THEM?"], size=82)
        else:
            eyebrow(d, (72, 118), "THEIR PHOTO. THEIR EDITION.", underline_chars=5)
            headline(d, (70, 162), [label], size=82)
        top = 366
        tp = clamp01(i / 12.0)
        tpo = clamp01((i - 5) / 14.0)
        tca = clamp01((i - 10) / 12.0)
        ep, epo, eca = ease_out_cubic(tp), ease_out_cubic(tpo), ease_out_cubic(tca)
        if ep > 0:
            ph = photo.copy()
            if ep < 1: ph.putalpha(ph.getchannel("A").point(lambda v: int(v * ep)))
            shadowed(f, ph, (int(92 - (1 - ep) * 90), top + 30), blur=20, sa=40, dy=14)
        if epo > 0:
            po = poster.copy()
            if epo < 1: po.putalpha(po.getchannel("A").point(lambda v: int(v * epo)))
            shadowed(f, po, (int(520 + (1 - epo) * 90), top), blur=22, sa=44, dy=16)
        if eca > 0:
            ca = card.copy()
            if eca < 1: ca.putalpha(ca.getchannel("A").point(lambda v: int(v * eca)))
            shadowed(f, ca, (800, int(top + 250 + (1 - eca) * 50)), blur=18, sa=46, dy=12)
        if epo > 0.15:
            ax, ay = 470, top + 220
            d.ellipse([ax - 22, ay - 22, ax + 22, ay + 22], fill=ORANGE)
            d.polygon([(ax - 6, ay - 9), (ax + 8, ay), (ax - 6, ay + 9)], fill=(255, 255, 255))
        if score is not None and i > 18:
            fc = font("Anton-Regular.ttf", 28)
            fs = font("Barlow-SemiBold.ttf", 19)
            chip(d, (520, top + 570, 1010, top + 622), f"FACE MATCH  {score:.2f}",
                 fc, GREEN if ok else C.RED)
            track_text(d, (92, top + 486), "THEIR REAL PHOTO", fs, MUTED, tracking=3)
        return f

class Proof:
    def __init__(self):
        self.poster = rounded(Image.open(f"{SRC}/football-poster.png").convert("RGB")
                              .resize((318, 424), Image.LANCZOS), 8)
        self.card = rounded(Image.open(f"{SRC}/football-card-front.png").convert("RGB")
                            .resize((198, 277), Image.LANCZOS), 8)

    def frame(self, chrome, i):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "NOTHING SHIPS UNTIL YOU SAY SO", underline_chars=7)
        headline(d, (70, 162), ["YOU APPROVE IT FIRST."], size=76)
        body(d, (72, 286), ["We send a proof of the whole edition and wait. Nothing is final",
                            "until you approve it — corrections are part of the price."])
        wm = clamp01(1 - (i - 26) / 12.0)
        poster = C.Proof.watermark(self, self.poster, wm) if wm > 0 else self.poster
        card = C.Proof.watermark(self, self.card, wm) if wm > 0 else self.card
        shadowed(f, poster, (330, 400), blur=22, sa=50, dy=16)
        shadowed(f, card, (610, 604), blur=18, sa=52, dy=12)
        if i > 20:
            t = clamp01((i - 20) / 8.0)
            fa = font("Anton-Regular.ttf", 34)
            tw = fa.getlength("APPROVED") + 64
            hh = int(58 * min(1.0, ease_out_back(t)))
            chip(d, ((W - tw) / 2, 900, (W + tw) / 2, 900 + hh), "APPROVED", fa, GREEN, rad=10)
        return f

class Counted:
    """The money beat: every tile is the FOOTBALL edition, and every element is CONTAINED
    on its white plate — nothing is crop-chopped (owner-flagged)."""
    TW, THh, GAP = 236, 240, 14
    FBC = "art-pipeline/out/athletes/football"

    def _plate(self):
        return Image.new("RGB", (self.TW, self.THh), (255, 255, 255))

    def _contain_tile(self, path, pad=10):
        im = ImageOps.contain(Image.open(path).convert("RGB"),
                              (self.TW - pad * 2, self.THh - pad * 2), Image.LANCZOS)
        pl = self._plate()
        pl.paste(im, ((self.TW - im.width) // 2, (self.THh - im.height) // 2))
        return rounded(pl, 10)

    def __init__(self):
        SRCF = SRC
        t = []
        t.append((self._contain_tile(f"{SRCF}/football-poster.png"), "POSTER × 2 SIZES"))
        # front + back together, both fully visible
        pl = self._plate()
        back = ImageOps.contain(Image.open(f"{SRCF}/football-card-back.png").convert("RGB"), (128, 180), Image.LANCZOS)
        front = ImageOps.contain(Image.open(f"{SRCF}/football-card-front.png").convert("RGB"), (140, 196), Image.LANCZOS)
        pl.paste(back, (108, 22))
        pl.paste(front, (20, 34))
        t.append((rounded(pl, 10), "CARD FRONT + BACK"))
        t.append((self._contain_tile(f"{SRCF}/football-certificate.png"), "CERTIFICATE"))
        flip = self._contain_tile(f"{SRCF}/football-card-front.png")
        t.append((flip, "FLIP VIDEO"))
        t.append((self._contain_tile(f"{SRCF}/football-social-grid.png"), "9 SOCIAL GRAPHICS"))
        # wallpaper: the poster art inside a phone-shaped rounded crop
        pl = self._plate()
        wp = ImageOps.fit(Image.open(f"{SRCF}/football-poster.png").convert("RGB"), (100, 208), Image.LANCZOS,
                          centering=(0.5, 0.30))
        wp = rounded(wp, 22)
        pl.paste(wp, ((self.TW - 100) // 2, 16), wp)
        t.append((rounded(pl, 10), "7 WALLPAPERS"))
        # sticker above badge, both whole
        pl = self._plate()
        st = Image.open(f"{SRCF}/football-sticker.png").convert("RGBA")
        st = st.resize((204, int(204 * st.height / st.width)), Image.LANCZOS)
        pl.paste(st, ((self.TW - st.width) // 2, 24), st)
        bd = Image.open(f"{SRCF}/football-badge.png").convert("RGBA")
        bd = bd.resize((104, int(104 * bd.height / bd.width)), Image.LANCZOS)
        pl.paste(bd, ((self.TW - bd.width) // 2, 122), bd)
        t.append((rounded(pl, 10), "STICKER + BADGE"))
        # football cutouts trio
        pl = self._plate()
        for k, (name, hgt, x) in enumerate((("hero", 190, 16), ("action2", 178, 92), ("action3", 178, 158))):
            cu = Image.open(f"{self.FBC}/{name}.cutout.png").convert("RGBA")
            cu = cu.resize((int(cu.width * hgt / cu.height), hgt), Image.LANCZOS)
            pl.paste(cu, (x, self.THh - hgt - 18), cu)
        t.append((rounded(pl, 10), "4 CUTOUTS"))
        self.tiles = t

    def frame(self, chrome, i):
        f = chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "YOUR COMPLETE DIGITAL SET", underline_chars=4)
        headline(d, (70, 162), ["EVERYTHING. COUNTED."], size=76)
        x0 = (W - (self.TW * 4 + self.GAP * 3)) // 2
        fl = font("Barlow-SemiBold.ttf", 16)
        for k, (tile, label) in enumerate(self.tiles):
            t = clamp01((i - 2 - k * 3) / 10.0)
            if t <= 0: continue
            e = ease_out_cubic(t)
            col, row = k % 4, k // 4
            x = x0 + col * (self.TW + self.GAP)
            y = 296 + row * (self.THh + self.GAP + 40) + int((1 - e) * 26)
            tl = tile.copy()
            tl.putalpha(tl.getchannel("A").point(lambda v: int(v * e)))
            shadowed(f, tl, (x, y), blur=16, sa=36, dy=10)
            if t > 0.6:
                track_text(d, (x + 2, 296 + row * (self.THh + self.GAP + 40) + self.THh + 10),
                           label, fl, INK, tracking=1)
            if label == "FLIP VIDEO" and t > 0.55:
                pcx, pcy, pr = x + self.TW // 2, y + self.THh // 2, 30
                d.ellipse([pcx - pr, pcy - pr, pcx + pr, pcy + pr], fill=(20, 25, 31))
                d.polygon([(pcx - 9, pcy - 14), (pcx + 13, pcy), (pcx - 9, pcy + 14)],
                          fill=(255, 255, 255))
        if i > 34:
            t = clamp01((i - 34) / 10.0)
            fp = font("Anton-Regular.ttf", 44)
            txt = "27 FILES + 1 LIVE REGISTRY PAGE"
            tw = fp.getlength(txt) + 96
            hh = int(76 * min(1.0, ease_out_back(t)))
            chip(d, ((W - tw) / 2, 856, (W + tw) / 2, 856 + hh), txt, fp, ORANGE, rad=14)
        if i > 46:
            fs = font("Barlow-SemiBold.ttf", 22)
            txt = "YOUR PROOF IN 24 HOURS  ·  FULLY CUSTOMIZED, ONE OF ONE"
            d.text(((W - C.text_w(fs, txt, 1)) / 2, 946), txt, font=fs, fill=MUTED)
        return f

def main():
    os.makedirs(OUT_FRAMES, exist_ok=True)
    for old in os.listdir(OUT_FRAMES):
        os.remove(os.path.join(OUT_FRAMES, old))
    chrome = C.Frame()
    pairs, meas, proof, counted = Pairs(), C.Measured(), Proof(), Counted()
    meas.rows = [(lbl, *C.gate_score(sport)) for sport, lbl, _, _ in PAIRS]
    meas.rows = [(lbl, sc, ok) for (lbl, sc, ok) in meas.rows]
    meas.rows.append(("A REJECTED TAKE", 0.287, False))
    end = C.EndCard("THE WALL. THE CARDS. THE WHOLE SEASON.")

    beats = [(72, lambda i: pairs.frame(chrome, 0, i, big_headline=True))]
    for k in range(1, 4):
        beats.append((36, (lambda kk: (lambda i: pairs.frame(chrome, kk, i)))(k)))
    beats.append((60, lambda i: meas.frame(chrome, i, 60)))
    beats.append((54, lambda i: proof.frame(chrome, i)))
    beats.append((78, lambda i: counted.frame(chrome, i)))
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
