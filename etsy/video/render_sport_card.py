#!/usr/bin/env python3
"""CARD-listing videos for any sport — story + close, from one config block.

Generalised from `render_football.py` / `render_cheer.py` after the third sport made the
copy-paste indefensible. Adding a sport is now a `SPORTS` entry plus its assets; the beats,
chrome, captions and end cards all come from the approved shared renderers.

Per listing the two videos do different jobs and reinforce each other:
  STORY  their photos -> the build -> the flip -> every finish   (why it is theirs)
  CLOSE  likeness proof -> measured -> proof -> what you get      (why it is safe to buy)

Lead finish per sport is deliberately DIFFERENT across the shop so the listings look
distinct in search and the shop learns which finish converts:
  basketball SN · football FS · cheer PR · soccer CA · baseball HE · volleyball SS

⚠️ Action beats are PROCEDURAL for every athlete here — soccer 15, baseball 16,
volleyball 17 are all minors, so image-to-video is off the table (only football's Tui,
18, was ever eligible). Check `ageYears` before considering i2v.

Run:  GDE_TRIAL=<local mirror> python3 etsy/video/render_sport_card.py <sport> [story|close|all]
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

W = H = 1080
FPS = 30
TRIAL = V3.TRIAL
SRC = "etsy/listing-images/04-complete-set/src"
FRAMES = os.environ.get("GDE_SPORT_FRAMES", "etsy/video/_frames_sport")

clamp01, eoc, eob = V3.clamp01, V3.ease_out_cubic, V3.ease_out_back
rounded, shadowed, font, chip = C.rounded, C.shadowed, C.font, C.chip
eyebrow, headline = C.eyebrow, C.headline
caption, contain = SET.caption, SET.contain

# ---------------------------------------------------------------- config
SPORTS = {
    "soccer": dict(
        slug="soccer", label="SOCCER", num="09", code="soc",
        finish="CHROME ALL-STAR",
        front=f"{SRC}/soccer-card-CA.png", back=f"{SRC}/soccer-card-back-CA.png",
        cert=f"{SRC}/soccer-certificate.png", flip="_f-socflip",
        action_photo="before/photo2.png", action_bias=0.42,
        fan=[f"{SRC}/soccer-card-SN.png", f"{SRC}/soccer-card-HE.png",
             f"{SRC}/soccer-card-CA.png", f"{SRC}/soccer-card-FS.png",
             f"{SRC}/soccer-card-PR.png"],
        cast=[("soccer", "SOCCER", f"{SRC}/soccer-card-CA.png"),
              ("football", "FOOTBALL", f"{SRC}/football-card-FS.png"),
              ("volleyball", "VOLLEYBALL", f"{SRC}/volleyball-card-SS.png"),
              ("baseball", "BASEBALL", f"{SRC}/baseball-card-HE.png")],
    ),
    "baseball": dict(
        slug="baseball", label="BASEBALL", num="10", code="bsb",
        finish="HERITAGE",
        front=f"{SRC}/baseball-card-HE.png", back=f"{SRC}/baseball-card-back-HE.png",
        cert=f"{SRC}/baseball-certificate.png", flip="_f-bsbflip",
        action_photo="before/photo2.png", action_bias=0.42,
        fan=[f"{SRC}/baseball-card-front.png", f"{SRC}/baseball-card-CA.png",
             f"{SRC}/baseball-card-HE.png", f"{SRC}/baseball-card-FS.png",
             f"{SRC}/baseball-card-PR.png"],
        cast=[("baseball", "BASEBALL", f"{SRC}/baseball-card-HE.png"),
              ("football", "FOOTBALL", f"{SRC}/football-card-FS.png"),
              ("soccer", "SOCCER", f"{SRC}/soccer-card-CA.png"),
              ("cheerleading", "CHEER", f"{SRC}/cheer-card-front-PR.png")],
    ),
    "volleyball": dict(
        slug="volleyball", label="VOLLEYBALL", num="11", code="vb",
        finish="SIGNATURE SPOTLIGHT",
        front=f"{SRC}/volleyball-card-SS.png", back=f"{SRC}/volleyball-card-back-SS.png",
        cert=f"{SRC}/volleyball-certificate.png", flip="_f-vbflip",
        action_photo="before/photo2.png", action_bias=0.40,
        fan=[f"{SRC}/volleyball-card-SN.png", f"{SRC}/volleyball-card-CA.png",
             f"{SRC}/volleyball-card-SS.png", f"{SRC}/volleyball-card-FS.png",
             f"{SRC}/volleyball-card-PR.png"],
        cast=[("volleyball", "VOLLEYBALL", f"{SRC}/volleyball-card-SS.png"),
              ("cheerleading", "CHEER", f"{SRC}/cheer-card-front-PR.png"),
              ("gymnastics", "GYMNASTICS", f"{SRC}/gymnastics-card-front.png"),
              ("soccer", "SOCCER", f"{SRC}/soccer-card-CA.png")],
    ),
}

# ---------------------------------------------------------------- story beats
class Action:
    """Procedural (never i2v for a minor): accelerating push + handheld drift on a real
    photo, then freeze and the shutter flash that hands over to the phone beat."""
    LEN = 72

    def __init__(self, cfg):
        self.img = Image.open(f"art-pipeline/out/athletes/{cfg['slug']}/{cfg['action_photo']}").convert("RGB")
        self.bias = cfg["action_bias"]

    def frame(self, i):
        FREEZE = 56
        j = min(i, FREEZE)
        t = j / float(FREEZE)
        z = 1.10 + 0.26 * (t * t)
        wob = t * 5
        iw, ih = self.img.size
        vw = int(min(iw, ih) / z)
        cx = iw // 2 + int(wob * math.sin(j / 2.1))
        cy = int(ih * self.bias) + int(wob * 0.6 * math.sin(j / 1.7 + 1.0))
        x0 = max(0, min(iw - vw, cx - vw // 2)); y0 = max(0, min(ih - vw, cy - vw // 2))
        f = self.img.crop((x0, y0, x0 + vw, y0 + vw)).resize((W, H), Image.LANCZOS)
        f = Image.blend(f, f.filter(ImageFilter.GaussianBlur(4)), clamp01(0.06 + 0.10 * t))
        if i > FREEZE + 4:
            f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)),
                            clamp01((i - FREEZE - 4) / 4.0))
        return caption(f, "IT STARTS WITH THEIR PHOTOS.", (i - 10) / 8.0)

class Phone:
    """Their four intake photos plus two scenery crops of their own — a believable camera
    roll with no repeats and nothing invented."""
    def __init__(self, cfg):
        base = f"art-pipeline/out/athletes/{cfg['slug']}/before"
        ph = [Image.open(f"{base}/photo{k}.png").convert("RGB") for k in range(1, 5)]
        a = ph[2].crop((0, 0, ph[2].width, int(ph[2].height * 0.34)))
        b = ph[1].crop((0, int(ph[1].height * 0.66), ph[1].width, ph[1].height))
        self.b2 = V3.B2(ph + [a, b])
        self.b2.TILES = [(0, 0.30), (1, 0.28), (2, 0.32), (3, 0.30), (4, 0.5), (5, 0.5)]

    def frame(self, i):
        return caption(self.b2.frame(i), "SEND US 4-10 REAL PHOTOS.", (i - 12) / 8.0)

class Packs:
    """Owner's flow (2026-08-27): after the ticks, the chosen photos COLLAPSE into a neat
    stack, the stack becomes the IDENTITY pack, that swaps to the KIT pack, and the card
    beat that follows is the result. One continuous idea instead of a static two-up slide."""
    LEN = 84

    def __init__(self, chrome, cfg):
        self.chrome = chrome
        base = f"art-pipeline/out/athletes/{cfg['slug']}"
        self.tiles = []
        for k in range(1, 5):
            im = ImageOps.fit(Image.open(f"{base}/before/photo{k}.png").convert("RGB"),
                              (300, 400), Image.LANCZOS, centering=(0.5, 0.30))
            pl = Image.new("RGB", (316, 416), (255, 255, 255))
            pl.paste(im, (8, 8))
            self.tiles.append(rounded(pl, 12))
        ident = ImageOps.contain(Image.open(f"{base}/_identity.png").convert("RGB"), (760, 470), Image.LANCZOS)
        ic = Image.new("RGB", (ident.width + 28, ident.height + 28), (255, 255, 255))
        ic.paste(ident, (14, 14)); self.ident = rounded(ic, 14)
        kit = ImageOps.contain(Image.open(f"{base}/_kit.png").convert("RGB"), (470, 470), Image.LANCZOS)
        kc = Image.new("RGB", (kit.width + 28, kit.height + 28), (255, 255, 255))
        kc.paste(kit, (14, 14)); self.kit = rounded(kc, 14)
        # where each photo starts (spread, as if just released by the phone) -> the stack
        self.starts = [(250, 420, -16), (830, 400, 14), (330, 760, 9), (770, 780, -11)]
        self.stack = [(-14, -10, -7), (10, -4, 4), (-6, 8, -3), (12, 12, 6)]

    def _pack_label(self, d, text, t):
        if t <= 0: return
        fa = font("Anton-Regular.ttf", 30)
        tw = fa.getlength(text) + 44
        hh = int(52 * min(1.0, eob(t)))
        chip(d, ((W - tw) / 2, 862, (W + tw) / 2, 862 + hh), text, fa, C.INK, rad=10)

    def frame(self, i):
        f = self.chrome.new()
        d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "BUILT FROM YOUR PHOTOS", underline_chars=5)
        headline(d, (70, 162), ["REBUILT FROM SCRATCH."], size=72)
        COLLAPSE, IDENT, SWAP = 24, 40, 60
        cx, cy = W // 2, 540
        if i < IDENT + 8:                                  # photos falling into the stack
            for k, (tile, (sx, sy, sdeg), (ox, oy, odeg)) in enumerate(
                    zip(self.tiles, self.starts, self.stack)):
                t = clamp01((i - k * 3) / float(COLLAPSE))
                e = eoc(t)
                x = sx + (cx + ox - sx) * e
                y = sy + (cy + oy - sy) * e
                deg = sdeg + (odeg - sdeg) * e
                sc = 1.0 - 0.18 * e
                im = tile.resize((int(316 * sc), int(416 * sc)), Image.LANCZOS)
                if deg:
                    im = im.rotate(deg, expand=True, resample=Image.BICUBIC)
                al = 1.0 if i < IDENT else clamp01(1 - (i - IDENT) / 8.0)
                if al < 1: im.putalpha(im.getchannel("A").point(lambda v: int(v * al)))
                shadowed(f, im, (int(x - im.width / 2), int(y - im.height / 2)),
                         blur=18, sa=44, dy=12)
        if i >= IDENT:                                     # the stack becomes IDENTITY
            t = clamp01((i - IDENT) / 12.0)
            out = clamp01((i - SWAP) / 10.0)
            if out < 1:
                e = eoc(t)
                sc = 0.86 + 0.14 * e
                im = self.ident.resize((int(self.ident.width * sc), int(self.ident.height * sc)), Image.LANCZOS)
                al = min(1.0, t * 1.8) * (1 - eoc(out))
                if al < 1: im.putalpha(im.getchannel("A").point(lambda v: int(v * al)))
                shadowed(f, im, (int(cx - im.width / 2 - out * 130), int(cy - im.height / 2)),
                         blur=20, sa=46, dy=14)
                self._pack_label(d, "IDENTITY PACK", clamp01((i - IDENT - 4) / 8.0) * (1 - out))
        if i >= SWAP:                                      # IDENTITY hands over to KIT
            t = clamp01((i - SWAP) / 12.0)
            e = eoc(t)
            im = self.kit.copy()
            al = min(1.0, t * 1.8)
            if al < 1: im.putalpha(im.getchannel("A").point(lambda v: int(v * al)))
            shadowed(f, im, (int(cx - im.width / 2 + (1 - e) * 140), int(cy - im.height / 2)),
                     blur=20, sa=46, dy=14)
            self._pack_label(d, "KIT PACK", clamp01((i - SWAP - 2) / 8.0))
        return f

class Flip:
    def __init__(self, cfg):
        self.dir = f"{TRIAL}/{cfg['flip']}"

    def frame(self, i):
        return V3.seq_frame(self.dir, 30 + i)

class Fan:
    def __init__(self, chrome, cfg):
        self.chrome = chrome
        self.tiles = [contain(p, 280, 392, 12) for p in cfg["fan"]]
        self.tiles[2] = contain(cfg["fan"][2], 318, 445, 12)   # the lead finish, centre
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

# ---------------------------------------------------------------- close beats
class Pairs(C.Pairs):
    def __init__(self, cfg):
        self.items = []
        for sport, label, cardp in cfg["cast"]:
            photo = Image.open(f"art-pipeline/out/athletes/{sport}/before/photo4.png").convert("RGB")
            photo = rounded(ImageOps.fit(photo, (self.PW, self.PH), Image.LANCZOS, centering=(0.5, 0.32)), 12)
            card = rounded(Image.open(cardp).convert("RGB").resize((self.CW, self.CH), Image.LANCZOS), 14)
            score, ok = C.gate_score(sport)
            self.items.append((label, photo, card, score, ok))

def measured_for(cfg):
    m = C.Measured()
    m.rows = [(lbl, *C.gate_score(sport)) for sport, lbl, _ in cfg["cast"]]
    m.rows.append(("A REJECTED TAKE", 0.287, False))
    return m

class Deliverables:
    TW, THh, GAP = 236, 338, 16

    def __init__(self, cfg):
        items = [(cfg["front"], "CARD FRONT"), (cfg["back"], "CARD BACK"),
                 (cfg["cert"], "CERTIFICATE"), (cfg["front"], "FLIP VIDEO")]
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

# ---------------------------------------------------------------- assembly
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

def main(sport, which="all"):
    cfg = SPORTS[sport]
    chrome = C.Frame()
    stem = f"etsy/listing-videos/GDE-etsy-{cfg['num']}-{cfg['code']}-card"

    if which in ("story", "all"):
        print(f"== {sport} card story")
        act, phone, packs = Action(cfg), Phone(cfg), Packs(chrome, cfg)
        flip, fan = Flip(cfg), Fan(chrome, cfg)
        end = C.EndCard("THEIR PHOTOS. THEIR CARD.")
        render([(act.LEN, act.frame), (60, phone.frame), (packs.LEN, packs.frame),
                (78, flip.frame), (54, fan.frame), (48, lambda i: end.frame(i, 48))],
               {2: 6, 3: 6, 4: 6, 5: 8}, f"{stem}-story-1080.mp4")

    if which in ("close", "all"):
        print(f"== {sport} card close")
        pairs, meas, deliv = Pairs(cfg), measured_for(cfg), Deliverables(cfg)
        proof = C.Proof()
        proof.card = rounded(Image.open(cfg["front"]).convert("RGB").resize((348, 487), Image.LANCZOS), 14)
        end = C.EndCard("THEIR PHOTOS. THEIR CARD.")
        beats = [(72, lambda i: pairs.frame(chrome, 0, i, 72, big_headline=True))]
        for k in range(1, 4):
            beats.append((36, (lambda kk: (lambda i: pairs.frame(chrome, kk, i, 36)))(k)))
        beats += [(60, lambda i: meas.frame(chrome, i, 60)),
                  (54, lambda i: proof.frame(chrome, i, 54)),
                  (60, lambda i: deliv.frame(chrome, i)),
                  (39, lambda i: end.frame(i, 39))]
        render(beats, {k: 6 for k in range(1, 8)}, f"{stem}-close-1080.mp4")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "all")
