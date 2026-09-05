#!/usr/bin/env python3
"""ONE example video per listing TYPE — the ten boards in etsy/VIDEO-STORYBOARDS-2026-09.md.

    GDE_TRIAL=<mirror> python3 etsy/video/render_types.py <A1|A2|B1|B2|C1|C2|D1|D2|E1|E2|all>

Output names = the listing's head title + " - Video 1" (story) / " - Video 2" (close), so
the file says where it goes in Shop Manager (owner, 2026-09-05).

Examples: A = Complete Set (football leads) · B/C = football card / poster · D = Senior Night
any-sport (football) · E = Senior Night cheerleading. Beats come from the approved renderers;
the new ones here are the FLAT GALLERY (owner, 2026-09-05: a front-on screen, photos tick
themselves, no finger), full-bleed SCENE pushes on the audited listing scenes, the OBJECTS
package sequence, SIZES rooms and the Veo WALL clip (beat_wall.py) when its frames exist.
Every claim is a live slide-11 chip, true for every package on the listing.
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
SC = load("sportcard", "etsy/video/render_sport_card.py")
FTB = load("football", "etsy/video/render_football.py")
FG = load("flatgallery", "etsy/video/beat_flat_gallery.py")

W = H = 1080
FPS = 30
TRIAL = V3.TRIAL
FRAMES = os.environ.get("GDE_TYPES_FRAMES", "etsy/video/_frames_types")
OUT = "etsy/listing-videos"
SRC = "etsy/listing-images/04-complete-set/src"
FCARD = "etsy/listing-images/01-football-card/src"
FPOST = "etsy/listing-images/02-football-poster/src"
SHOTS = "art-pipeline/out/etsy-shots"
# iCloud evicts the repo copies mid-render ("Operation timed out"); every scene is read from
# the scratchpad mirror when it exists (rsync'd before a render — memory: gde-icloud-eviction)
def _mirror(sub, fallback):
    d = f"{TRIAL}/{sub}"
    return d if os.path.isdir(d) and os.listdir(d) else fallback
PKG = _mirror("packages", f"{SHOTS}/packages")
SN = _mirror("sn", f"{SHOTS}/senior-night")
SNC = _mirror("sn-chr", f"{SHOTS}/senior-night-cheerleading")
ATH = _mirror("athletes", "art-pipeline/out/athletes")
SRSRC = _mirror("sr-src", "etsy/listing-images/03-senior-night/src")

clamp01, eoc, eob = V3.clamp01, V3.ease_out_cubic, V3.ease_out_back
rounded, shadowed, font, chip = C.rounded, C.shadowed, C.font, C.chip
eyebrow, headline = C.eyebrow, C.headline

TIMING = "DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7"
TIMING_SN = "FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS · SEALED PACK 3–4 WKS"

# ---------------------------------------------------------------- caption with auto-fit
def cap(f, text, t, size=58, y=None):
    """White Anton + soft shadow (the set-story style), shrunk to fit and split to two
    lines when a hook is long — never clipped, never below 44 px."""
    if t <= 0:
        return f
    a = eoc(clamp01(t))
    lines, sz = [text], size
    fa = font("Anton-Regular.ttf", sz)
    if fa.getlength(text) > 960:
        sz = max(44, int(size * 960 / fa.getlength(text)))
        fa = font("Anton-Regular.ttf", sz)
        if sz <= 46 and len(text) > 30:
            words = text.split(); mid = len(words) // 2
            lines = [" ".join(words[:mid]), " ".join(words[mid:])]
            sz = size - 4; fa = font("Anton-Regular.ttf", sz)
    lh = int(sz * 1.12)
    y0 = (H - 186 - (len(lines) - 1) * lh) if y is None else y
    y0 += int((1 - a) * 20)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
    for k, ln in enumerate(lines):
        x = (W - fa.getlength(ln)) / 2; yy = y0 + k * lh
        sd.text((x + 3, yy + 5), ln, font=fa, fill=(8, 10, 14, 170))
        ld.text((x, yy), ln, font=fa, fill=(255, 255, 255, 255))
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0)); out.paste(sh, (0, 0), sh); out.paste(lay, (0, 0), lay)
    if a < 1:
        out.putalpha(out.getchannel("A").point(lambda v: int(v * a)))
    f.paste(out, (0, 0), out)
    return f

def pill(f, text, xy, t, color=None, size=34, dark=False):
    """A label on media goes into a pill (owner's caption system)."""
    if t <= 0: return
    d = ImageDraw.Draw(f)
    fp = font("Anton-Regular.ttf", size)
    tw = fp.getlength(text) + 44
    x, y = xy
    hh = int((size + 24) * min(1.0, eob(clamp01(t))))
    col = (20, 25, 31) if dark else (color or C.ORANGE)
    d.rounded_rectangle([x, y, x + tw, y + hh], radius=12, fill=col)
    if hh > size + 10:
        d.text((x + 22, y + 10), text, font=fp, fill=(255, 255, 255))

def square(im, focus=(0.5, 0.5), zoom=1.0):
    iw, ih = im.size
    side = int(min(iw, ih) / zoom)
    cx, cy = int(iw * focus[0]), int(ih * focus[1])
    x0 = max(0, min(iw - side, cx - side // 2)); y0 = max(0, min(ih - side, cy - side // 2))
    return im.crop((x0, y0, x0 + side, y0 + side)).resize((W, H), Image.LANCZOS)

# ---------------------------------------------------------------- beats
class Scene:
    """Full-bleed push on a real/audited scene, optional caption + pills + white flash out."""
    def __init__(self, path, caption=None, n=60, zoom=(1.0, 1.08), focus=(0.5, 0.5),
                 cap_at=8, pills=(), flash_out=False, cap_size=58):
        self.img = Image.open(path).convert("RGB")
        self.caption, self.n, self.zoom, self.focus = caption, n, zoom, focus
        self.cap_at, self.pills, self.flash_out, self.cap_size = cap_at, pills, flash_out, cap_size

    def frame(self, i):
        t = clamp01(i / max(1, self.n - 1))
        z = self.zoom[0] + (self.zoom[1] - self.zoom[0]) * eoc(t)
        f = square(self.img, self.focus, z)
        if self.flash_out and i > self.n - 6:
            f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)), clamp01((i - self.n + 6) / 4.0))
        for k, (txt, xy) in enumerate(self.pills):
            pill(f, txt, xy, (i - 10 - k * 5) / 8.0)
        if self.caption:
            cap(f, self.caption, (i - self.cap_at) / 8.0, size=self.cap_size)
        return f

class Frames:
    """A rendered frame sequence (flip, Veo clip, wall composite), natural speed, captioned."""
    def __init__(self, dirname, n, offset=0, caption=None, cap_at=10, square_crop=False,
                 flash_out=False, pills=()):
        self.dir = f"{TRIAL}/{dirname}" if not dirname.startswith("/") else dirname
        self.count = len([x for x in os.listdir(self.dir) if x.endswith(".png")])
        self.n, self.offset, self.caption, self.cap_at = n, offset, caption, cap_at
        self.square_crop, self.flash_out, self.pills = square_crop, flash_out, pills

    def frame(self, i):
        idx = 1 + min(self.offset + i, self.count - 1)
        f = V3.square_from(self.dir, idx) if self.square_crop else V3.seq_frame(self.dir, idx)
        if self.flash_out and i > self.n - 6:
            f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)), clamp01((i - self.n + 6) / 4.0))
        for k, (txt, xy) in enumerate(self.pills):
            pill(f, txt, xy, (i - 10 - k * 5) / 8.0)
        if self.caption:
            cap(f, self.caption, (i - self.cap_at) / 8.0)
        return f

class Hook:
    """Problem line over their real photo: accelerating push + handheld drift, freeze, flash."""
    def __init__(self, slug, caption, n=72, photo="photo2", bias=0.42):
        self.img = Image.open(f"{ATH}/{slug}/before/{photo}.png").convert("RGB")
        self.caption, self.n, self.bias = caption, n, bias

    def frame(self, i):
        FREEZE = self.n - 16
        j = min(i, FREEZE); t = j / float(FREEZE)
        z = 1.10 + 0.26 * (t * t); wob = t * 5
        iw, ih = self.img.size; vw = int(min(iw, ih) / z)
        cx = iw // 2 + int(wob * math.sin(j / 2.1)); cy = int(ih * self.bias) + int(wob * 0.6 * math.sin(j / 1.7 + 1.0))
        x0 = max(0, min(iw - vw, cx - vw // 2)); y0 = max(0, min(ih - vw, cy - vw // 2))
        f = self.img.crop((x0, y0, x0 + vw, y0 + vw)).resize((W, H), Image.LANCZOS)
        f = Image.blend(f, f.filter(ImageFilter.GaussianBlur(4)), clamp01(0.06 + 0.10 * t))
        if i > FREEZE + 4:
            f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)), clamp01((i - FREEZE - 4) / 4.0))
        return cap(f, self.caption, (i - 10) / 8.0)

class Gallery:
    """The flat screen; its last four frames wash to the chrome stock so the cut to the
    PACKS beat reads as the send button firing, not as two unrelated frames blending."""
    STOCK = (244, 243, 239)
    def __init__(self, slug):
        self.g = FG.FlatGallery(slug); self.n = self.g.LEN
    def frame(self, i):
        f = self.g.frame(i)
        if i > self.n - 5:
            f = Image.blend(f, Image.new("RGB", (W, H), self.STOCK), clamp01((i - self.n + 5) / 4.0))
        return f

class Reveal:
    """Poster scales up on chrome; eyebrow = the finish; optional pose markers."""
    def __init__(self, chrome, path, eyebrow_txt, head, n=66, markers=False, sub=None):
        self.chrome, self.n, self.markers, self.sub = chrome, n, markers, sub
        self.eyebrow_txt, self.head = eyebrow_txt, head
        self.poster = SET.contain(path, 520, 694, 10)

    def frame(self, i):
        f = self.chrome.new(); d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), self.eyebrow_txt, underline_chars=min(9, len(self.eyebrow_txt.split()[0])))
        headline(d, (70, 162), [self.head], size=76)
        t = clamp01(i / 16.0); e = eob(t); s_ = 0.85 + 0.15 * e
        po = self.poster.resize((int(520 * s_), int(694 * s_)), Image.LANCZOS)
        al = min(1.0, t * 2)
        if al < 1: po.putalpha(po.getchannel("A").point(lambda v: int(v * al)))
        x, y = int(W / 2 - po.width / 2), int(640 - po.height / 2)
        shadowed(f, po, (x, y), blur=24, sa=52, dy=16)
        if self.markers and i > 24:
            fm = font("Anton-Regular.ttf", 30)
            for k, (fx, fy) in enumerate(((0.30, 0.42), (0.55, 0.36), (0.78, 0.44))):
                tt = clamp01((i - 24 - k * 5) / 8.0)
                if tt <= 0: continue
                r = int(24 * eob(tt)); cx, cy = x + int(po.width * fx), y + int(po.height * fy)
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=C.ORANGE, outline=(255, 255, 255), width=3)
                if r > 18: d.text((cx - 8, cy - 18), str(k + 1), font=fm, fill=(255, 255, 255))
        if self.sub and i > 30:
            fs = font("Barlow-SemiBold.ttf", 26)
            d.text(((W - C.text_w(fs, self.sub, 1)) / 2, 944), self.sub, font=fs, fill=C.MUTED)   # above the footer wordmark
        return f

class Objects:
    """The package as things — one scene per package, label pill, one persistent caption."""
    def __init__(self, items, caption, per=24, xf=6):
        self.items = [(Image.open(p).convert("RGB"), lbl) for p, lbl in items]
        self.caption, self.per, self.xf = caption, per, xf
        self.n = per * len(items)

    def frame(self, i):
        k = min(len(self.items) - 1, i // self.per); j = i - k * self.per
        img, lbl = self.items[k]
        f = square(img, zoom=1.0 + 0.05 * (j / self.per))
        if j < self.xf and k > 0:
            prev = square(self.items[k - 1][0], zoom=1.05)
            f = Image.blend(prev, f, (j + 1) / (self.xf + 1))
        pill(f, lbl, (48, 48), (j - 2) / 6.0 if k else (i - 2) / 6.0, size=36)
        return cap(f, self.caption, (i - 6) / 8.0)

class Chrome:
    """Information beat on the listing chrome: eyebrow, headline, body, chip(s), optional art."""
    def __init__(self, chrome, eyebrow_txt, head, body=None, chips=(), art=None, art_box=(560, 720), n=54, sub=None):
        self.chrome, self.eyebrow_txt, self.head, self.body = chrome, eyebrow_txt, head, body
        self.chips, self.n, self.sub = chips, n, sub
        self.art = None
        if art:
            im = ImageOps.contain(Image.open(art).convert("RGB"), art_box, Image.LANCZOS)
            pl = Image.new("RGB", (im.width + 24, im.height + 24), (255, 255, 255)); pl.paste(im, (12, 12))
            self.art = rounded(pl, 12)

    def frame(self, i):
        f = self.chrome.new(); d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), self.eyebrow_txt, underline_chars=min(9, len(self.eyebrow_txt.split()[0])))
        headline(d, (70, 162), self.head if isinstance(self.head, list) else [self.head], size=72)
        y = 276 if isinstance(self.head, str) else 356
        if self.body:
            C.body(d, (72, y), self.body); y += 40 * len(self.body) + 30
        if self.art:
            t = clamp01((i - 6) / 14.0); e = eoc(t)
            if t > 0:
                im = self.art.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * e)))
                shadowed(f, im, (int(W / 2 - im.width / 2), int(y + 20 + (1 - e) * 30)), blur=22, sa=48, dy=14)
            y += self.art.height + 60
        for k, (txt, col) in enumerate(self.chips):
            t = clamp01((i - 16 - k * 8) / 10.0)
            if t <= 0: continue
            fp = font("Anton-Regular.ttf", 46 if k == 0 else 34)
            tw = fp.getlength(txt) + 96; hh = int((84 if k == 0 else 62) * min(1.0, eob(t)))
            yy = max(y, 700) + k * 100
            chip(d, ((W - tw) / 2, yy, (W + tw) / 2, yy + hh), txt, fp, col, rad=16)
        if self.sub and i > 30:
            fs = font("Barlow-SemiBold.ttf", 24)
            d.text(((W - C.text_w(fs, self.sub, 1)) / 2, 986), self.sub, font=fs, fill=C.MUTED)
        return f

class Assemble:
    """The set assembles on chrome: poster lands, card front + back slide in, certificate,
    phone — then the count pill."""
    def __init__(self, chrome, poster, front, back, cert, phone, head="ONE ATHLETE. ONE EDITION.", pill_txt="POSTER · CARDS · CERTIFICATE · 28 FILES", n=78):
        self.chrome, self.head, self.pill_txt, self.n = chrome, head, pill_txt, n
        # poster left, the two card faces stacked centre, certificate right — the phone was
        # dropped: it collided with the count pill and the set's screens have their own beat
        self.items = [(SET.contain(poster, 400, 534, 10), 80, 320, 0, 0),
                      (SET.contain(front, 250, 350, 12), 508, 372, 5, 6),
                      (SET.contain(back, 250, 350, 12), 640, 470, 9, 10),
                      (SET.contain(cert, 270, 348, 8), 780, 300, -5, 14)]

    def frame(self, i):
        f = self.chrome.new(); d = ImageDraw.Draw(f)
        eyebrow(d, (72, 118), "YOUR COMPLETE SET", underline_chars=4)
        headline(d, (70, 162), [self.head], size=72)
        for im, x, y, deg, st in self.items:
            t = clamp01((i - st) / 12.0)
            if t <= 0: continue
            e = eob(t); s_ = 0.78 + 0.22 * e
            im2 = im.resize((max(1, int(im.width * s_)), max(1, int(im.height * s_))), Image.LANCZOS)
            if deg: im2 = im2.rotate(deg * e, expand=True, resample=Image.BICUBIC)
            al = min(1.0, t * 2)
            if al < 1: im2.putalpha(im2.getchannel("A").point(lambda v: int(v * al)))
            cx, cy = x + im.width // 2, y + im.height // 2
            shadowed(f, im2, (cx - im2.width // 2, cy - im2.height // 2), blur=18, sa=44, dy=12)
        if i > 34:
            t = clamp01((i - 34) / 10.0); fp = font("Anton-Regular.ttf", 38)
            tw = fp.getlength(self.pill_txt) + 88; hh = int(70 * min(1.0, eob(t)))
            chip(d, ((W - tw) / 2, 930, (W + tw) / 2, 930 + hh), self.pill_txt, fp, C.ORANGE, rad=14)
        return f

class Sizes:
    """Three rooms, the furniture is the ruler — 18x24 / 24x36 / 30x40, one caption."""
    def __init__(self, paths, labels, caption, per=34):
        self.items = [(Image.open(p).convert("RGB"), l) for p, l in zip(paths, labels)]
        self.caption, self.per, self.n = caption, per, per * len(paths)

    def frame(self, i):
        k = min(len(self.items) - 1, i // self.per); j = i - k * self.per
        img, lbl = self.items[k]
        f = square(img, zoom=1.0 + 0.04 * (j / self.per))
        if j < 5 and k > 0:
            f = Image.blend(square(self.items[k - 1][0], zoom=1.04), f, (j + 1) / 6.0)
        pill(f, lbl, (48, 48), (j - 2) / 6.0, size=40)
        return cap(f, self.caption, (i - 6) / 8.0)

def pairs_from(cast, kind):
    """kind = 'card' (C.Pairs) or 'poster' (PC.Pairs); cast = [(sport, LABEL, art_path)]."""
    cls = C.Pairs if kind == "card" else PC.Pairs
    p = cls.__new__(cls); p.items = []
    for sport, label, art in cast:
        photo = Image.open(f"{ATH}/{sport}/before/photo4.png").convert("RGB")
        photo = rounded(ImageOps.fit(photo, (p.PW, p.PH), Image.LANCZOS, centering=(0.5, 0.32)), 12)
        if kind == "card":
            prod = rounded(Image.open(art).convert("RGB").resize((p.CW, p.CH), Image.LANCZOS), 14)
        else:
            prod = rounded(Image.open(art).convert("RGB").resize((p.OW, p.OH), Image.LANCZOS), 10)
        score, ok = C.gate_score(sport)
        p.items.append((label, photo, prod, score, ok))
    return p

def pairs_beats(p, kind, chrome, big=72, small=30):
    beats = []
    if kind == "card":
        beats.append((big, lambda i: p.frame(chrome, 0, i, big, big_headline=True)))
        for k in range(1, len(p.items)):
            beats.append((small, (lambda kk: (lambda i: p.frame(chrome, kk, i, small)))(k)))
    else:
        beats.append((big, lambda i: p.frame(chrome, 0, i, big_headline=True)))
        for k in range(1, len(p.items)):
            beats.append((small, (lambda kk: (lambda i: p.frame(chrome, kk, i)))(k)))
    return beats

def proof_beat(chrome, kind, art, n=48):
    if kind == "card":
        pr = C.Proof(); pr.card = rounded(Image.open(art).convert("RGB").resize((348, 487), Image.LANCZOS), 14)
        return (n, lambda i: pr.frame(chrome, i, n))
    pr = PC.Proof(); pr.poster = rounded(Image.open(art).convert("RGB").resize((342, 456), Image.LANCZOS), 10)
    return (n, lambda i: pr.frame(chrome, i))

def measured_beat(chrome, cast, n=48):
    m = FTB.measured_for(cast)
    return (n, lambda i: m.frame(chrome, i, n))

def end_beat(tagline, n=42):
    e = C.EndCard(tagline)
    return (n, lambda i: e.frame(i, n))

def wall_or_scene(caption):
    """C1 ROOM. Default = the live slide-02 room scene with a push (audited, on the listing).
    Set GDE_WALL_DIR=<frames dir> to use a Veo wall composite (beat_wall.py) instead —
    frames 30-102 of the dolly, where the print is big and still fully inside the picture."""
    d = os.environ.get("GDE_WALL_DIR", "")
    if d and os.path.isdir(d) and len(os.listdir(d)) > 110:
        return (72, Frames(d, 72, offset=30, caption=caption, cap_at=12).frame)
    return (72, Scene(f"{FPOST}/05-their-wall.jpg", caption, n=72, zoom=(1.0, 1.10), focus=(0.5, 0.42)).frame)

# ---------------------------------------------------------------- assembly
def render(beats, xf_map, out_mp4):
    os.makedirs(FRAMES, exist_ok=True)
    for old in os.listdir(FRAMES):
        os.remove(os.path.join(FRAMES, old))
    n, prev = 0, None
    for bi, (length, fn) in enumerate(beats):
        xf = xf_map.get(bi, 6 if bi else 0)
        for i in range(length):
            img = fn(i)
            if prev is not None and i < xf:
                img = Image.blend(prev, img, (i + 1) / (xf + 1))
            # JPEG q95 intermediates: 8x smaller than PNG — a full disk killed the 2026-09-05
            # batch at video 11 of 28; x264 at crf 17 hides the difference
            img.save(f"{FRAMES}/f{n:04d}.jpg", quality=95, subsampling=0); n += 1
        prev = fn(length - 1)
    print(f"  frames: {n} ({n / FPS:.2f}s)")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-i", f"{FRAMES}/f%04d.jpg",
                    "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart", "-an", out_mp4], check=True)
    print("  done:", out_mp4)

def build(which):
    ch = C.Frame()
    fb = "football"
    HE, FS, FSB = FTB.HE_POSTER, FTB.FS_FRONT, FTB.FS_BACK_2X
    CERT_F = f"{SRC}/football-certificate.png"

    if which == "A1":
        beats = [
            (72, Frames("_f-b2set", 72, caption="DON'T LET THEIR SEASON STAY ON YOUR PHONE.", square_crop=True, flash_out=True).frame),
            (66, Gallery(fb).frame),
            (78, SC.Packs(ch, {"slug": fb}).frame),
            (78, Assemble(ch, HE, FS, f"{SRC}/football-card-back.png", CERT_F, f"{PKG}/_football/phone-wall.png").frame),
            (66, Scene(f"{SRC}/s03b/composed.png", "THE CARD IN HAND. THE POSTER ON THE WALL.", n=66, zoom=(1.0, 1.08), focus=(0.5, 0.45)).frame),
            (36, Scene("etsy/listing-images/04-complete-set/v3/hero-plate-tunnel.jpg", "ANY SPORT. ANY AGE.", n=36, zoom=(1.04, 1.10), cap_at=2).frame),
            end_beat("THE WALL. THE CARDS. THE WHOLE SEASON."),
        ]
        render(beats, {2: 6, 3: 6, 4: 6, 5: 6, 6: 8}, f"{OUT}/Custom Sports Poster and Trading Card Set - Video 1.mp4")

    if which == "A2":
        p = pairs_from(FTB.CLOSE_CAST_POSTERS, "poster")
        beats = pairs_beats(p, "poster", ch, big=66, small=28)
        beats += [measured_beat(ch, FTB.CLOSE_CAST_POSTERS, 42),
                  (96, Objects([(f"{PKG}/_football/digital.png", "DIGITAL COMPLETE SET"),
                                ("etsy/listing-images/04-complete-set/v3/tile-printed.jpg", "PRINTED SET · 12 CARDS + 18×24"),
                                ("etsy/listing-images/04-complete-set/v3/tile-deluxe.jpg", "DELUXE · 24 CARDS + 24×36"),
                                ("etsy/listing-images/04-complete-set/v3/tile-ultimate.jpg", "ULTIMATE · + SEALED FOIL PACK")],
                               "FOUR WAYS TO OWN IT.").frame),
                  (36, Chrome(ch, "WITH EVERY SHIPPED SET", "FREE PRINTED CERTIFICATE.",
                              body=["Your athlete's name and edition number — printed, signed, in the box."],
                              art=CERT_F, art_box=(420, 540), n=36).frame),
                  proof_beat(ch, "poster", HE, 42),
                  (36, Chrome(ch, "HOW FAST", "DIGITAL OR PRINTED.", chips=[(TIMING, C.ORANGE), ("FREE US SHIPPING · TRACKED", C.INK)], n=36).frame),
                  end_beat("28 FILES + 1 LIVE REGISTRY PAGE.", 32)]   # 438 frames = 14.6 s (was 15.2, over Etsy's cap)
        render(beats, {}, f"{OUT}/Custom Sports Poster and Trading Card Set - Video 2.mp4")

    if which == "B1":
        beats = [
            (72, Frames("_f-b2set", 72, caption="YOUR CAMERA ROLL IS FULL OF THESE.", square_crop=True, flash_out=True).frame),
            (66, Gallery(fb).frame),
            (78, SC.Packs(ch, {"slug": fb}).frame),
            (78, Frames("_f-ftbflip", 78, offset=30, caption="FRONT + BACK. NUMBERED. REGISTERED.", cap_at=44).frame),
            (54, SC.Fan(ch, {"fan": FTB.CARD_FAN}).frame),
            (36, Scene(f"{FCARD}/s03-athlete-holds-card.png", "THEIR FACE. THEIR NAME. THEIR CARD.", n=36, zoom=(1.0, 1.08), focus=(0.5, 0.42), cap_at=2).frame),
            end_beat("THEIR PHOTOS. THEIR CARD."),
        ]
        render(beats, {2: 6, 3: 6, 4: 6, 5: 6, 6: 8}, f"{OUT}/Custom Football Card - Video 1.mp4")

    if which == "B2":
        p = pairs_from(FTB.CLOSE_CAST_CARDS, "card")
        beats = pairs_beats(p, "card", ch, big=66, small=28)
        beats += [measured_beat(ch, FTB.CLOSE_CAST_CARDS, 42),
                  proof_beat(ch, "card", FS, 42),
                  (96, Objects([(f"{FCARD}/pkg-01-digital.png", "DIGITAL CARD FILES"),
                                (f"{FCARD}/pkg-02-12-cards.png", "12 PRINTED CARDS"),
                                (f"{FCARD}/pkg-03-24-cards.png", "DOUBLE DECK · 24 CARDS"),
                                (f"{FCARD}/pkg-04-foil-pack.png", "SEALED FOIL PACK · 18 CARDS")],
                               "FOUR WAYS TO OWN IT.").frame),
                  (42, Chrome(ch, "WITH EVERY SHIPPED PACKAGE", ["FREE CERTIFICATE.", "LIVE REGISTRY PAGE."],
                              body=["Printed, numbered and signed — and the QR on the card opens its own page."],
                              art=f"{FCARD}/FB-FS-certificate.png", art_box=(400, 500), n=42).frame),
                  (30, Chrome(ch, "HOW FAST", "DIGITAL OR PRINTED.", chips=[(TIMING, C.ORANGE)], n=30).frame),
                  end_beat("THEIR PHOTOS. THEIR CARD.", 36)]
        render(beats, {}, f"{OUT}/Custom Football Card - Video 2.mp4")

    if which == "C1":
        beats = [
            (72, Frames("_f-b2set", 72, caption="THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.", square_crop=True, flash_out=True).frame),
            (66, Gallery(fb).frame),
            (72, SC.Packs(ch, {"slug": fb}).frame),
            (66, Reveal(ch, HE, "HERITAGE FINISH", "THE POSTER.", markers=True, sub="3 SHOTS OF YOUR ATHLETE — COMPOSED ON ONE POSTER").frame),
            wall_or_scene("THEIR SEASON. THEIR WALL."),
            (30, Objects([(f"{FPOST}/mock-room-SN.png", "STADIUM NIGHT"), (f"{FPOST}/mock-room-FS.png", "FIRE & SMOKE"),
                          (f"{FPOST}/mock-room-PR.png", "PRISM RUSH")], "SIX FINISHES.", per=10, xf=3).frame),
            end_beat("THEIR PHOTOS. THEIR POSTER.", 40),
        ]
        suffix = os.environ.get("GDE_OUT_SUFFIX", "")
        render(beats, {2: 6, 3: 6, 4: 6, 5: 4, 6: 8}, f"{OUT}/Custom Football Poster - Video 1{suffix}.mp4")

    if which == "C2":
        p = pairs_from(FTB.CLOSE_CAST_POSTERS[:2], "poster")
        beats = pairs_beats(p, "poster", ch, big=60, small=28)
        beats += [measured_beat(ch, FTB.CLOSE_CAST_POSTERS, 42),
                  (102, Sizes([f"{FPOST}/room-18x24.jpg", f"{FPOST}/room-24x36.jpg", f"{FPOST}/room-30x40.jpg"],
                              ["18 × 24 IN", "24 × 36 IN", "30 × 40 IN · XL"], "THREE SIZES, TO SCALE.").frame),
                  (42, Scene(f"{PKG}/pkg-tube.png", "ENHANCED MATTE 189 g/m² · ROLLED IN A TUBE", n=42, zoom=(1.0, 1.06), cap_size=50).frame),
                  (36, Scene(f"{FPOST}/pkg-01-digital.png", "WALLPAPERS + SOCIAL, INCLUDED.", n=36, zoom=(1.0, 1.06)).frame),
                  proof_beat(ch, "poster", HE, 42),
                  (30, Chrome(ch, "HOW FAST", "DIGITAL OR PRINTED.", chips=[(TIMING, C.ORANGE), ("FREE US SHIPPING · TRACKED", C.INK)], n=30).frame),
                  end_beat("THEIR PHOTOS. THEIR POSTER.", 36)]
        render(beats, {}, f"{OUT}/Custom Football Poster - Video 2.mp4")

    # ---- Senior Night, any sport (football leads)
    SRP, SRF, SRB, SRC_ = f"{SRSRC}/ftb-sr-poster.png", f"{SRSRC}/ftb-sr-front.png", f"{SRSRC}/ftb-sr-back.png", f"{SRSRC}/ftb-sr-cert.png"
    SR_CAST = [("football", "FOOTBALL", SRP), ("cheerleading", "CHEER", f"{SRSRC}/chr-sr-poster.png"),
               ("soccer", "SOCCER", f"{SRSRC}/soc-sr-poster.png"), ("baseball", "BASEBALL", f"{SRSRC}/bsb-sr-poster.png")]
    if which == "D1":
        beats = [
            (78, Scene(f"{SN}/gift-football-composited.png", "ONE LAST HOME GAME.", n=78, zoom=(1.0, 1.10), focus=(0.5, 0.40), flash_out=True).frame),
            (60, Gallery(fb).frame),
            (72, SC.Packs(ch, {"slug": fb}).frame),
            (66, Reveal(ch, SRP, "THE SENIOR NIGHT EDITION", "ONE NIGHT. ONE EDITION.", sub="CHAMPAGNE GOLD · THEIR TEAM COLORS · CLASS OF YEAR").frame),
            (72, Frames("_f-ftbsr", 72, offset=30, caption="THEIR CAREER ON THE BACK. THEIR WORDS.", cap_at=40).frame),
            (42, Scene(f"{SN}/celebration-composited.png", "ANY SPORT. ONE EDITION.", n=42, zoom=(1.0, 1.08), focus=(0.5, 0.45), cap_at=2).frame),
            end_beat("MAKE IT LAST LONGER.", 42),
        ]
        render(beats, {2: 6, 3: 6, 4: 6, 5: 6, 6: 8}, f"{OUT}/Senior Night Gift - Video 1.mp4")

    if which == "D2":
        p = pairs_from(SR_CAST[:2], "poster")
        beats = [
            (66, Scene(f"{SN}/gift-football-composited.png", "SENIOR NIGHT HAS A DATE. WE WORK TO IT.", n=66, zoom=(1.08, 1.02), focus=(0.5, 0.40),
                       pills=[("FILES 1 WEEK BEFORE", (48, 48)), ("PRINTED SETS 2 WEEKS", (48, 118)), ("SEALED PACK 3–4 WEEKS", (48, 188))]).frame),
            (96, Objects([(f"{SN}/sr-digital.png", "DIGITAL COMPLETE SET"), (f"{SN}/set-printed-real.png", "PRINTED SET · 12 CARDS + 18×24"),
                          (f"{SN}/set-deluxe-real.png", "DELUXE · 24 CARDS + 24×36"), (f"{SN}/set-ultimate-real.png", "ULTIMATE · + SEALED FOIL PACK")],
                         "FOUR WAYS TO OWN IT.").frame),
            (42, Scene(f"{SN}/card-in-case-composited.png", "NUMBERED. REGISTERED. 1 OF 1.", n=42, zoom=(1.0, 1.08), focus=(0.5, 0.5)).frame),
        ] + pairs_beats(p, "poster", ch, big=54, small=28) + [
            measured_beat(ch, SR_CAST, 36),
            proof_beat(ch, "poster", SRP, 40),
            (40, Scene(f"{SN}/team-order-staged-composited.png", "ONE SET PER SENIOR. SEND THE ROSTER.", n=40, zoom=(1.0, 1.06)).frame),
            end_beat("ONE LAST HOME GAME. MAKE IT LAST LONGER.", 40),
        ]
        render(beats, {}, f"{OUT}/Senior Night Gift - Video 2.mp4")

    # ---- Senior Night, sport-locked: CHEERLEADING
    CP, CF, CB, CC = f"{SRSRC}/chr-sr-poster.png", f"{SRSRC}/chr-sr-front.png", f"{SRSRC}/chr-sr-back.png", f"{SRSRC}/chr-sr-cert.png"
    C_CAST = [("cheerleading", "CHEER", CP), ("football", "FOOTBALL", SRP), ("soccer", "SOCCER", f"{SRSRC}/soc-sr-poster.png"), ("baseball", "BASEBALL", f"{SRSRC}/bsb-sr-poster.png")]
    if which == "E1":
        beats = [
            (78, Scene(f"{SNC}/gift-cheerleading-composited.png", "ONE LAST HOME GAME.", n=78, zoom=(1.0, 1.10), focus=(0.5, 0.40), flash_out=True).frame),
            (60, Gallery("cheerleading").frame),
            (72, SC.Packs(ch, {"slug": "cheerleading"}).frame),
            (66, Reveal(ch, CP, "CHEER SENIOR NIGHT EDITION", "ONE NIGHT. ONE EDITION.", sub="CHAMPAGNE GOLD · THEIR TEAM COLORS · CLASS OF YEAR").frame),
            (72, Frames("_f-chrsr", 72, offset=30, caption="THEIR CAREER ON THE BACK. THEIR WORDS.", cap_at=40).frame),
            (42, Scene(f"{SNC}/team-order-staged-composited.png", "ONE SET PER SENIOR.", n=42, zoom=(1.0, 1.08), cap_at=2).frame),
            end_beat("MAKE IT LAST LONGER.", 42),
        ]
        render(beats, {2: 6, 3: 6, 4: 6, 5: 6, 6: 8}, f"{OUT}/Cheer Senior Night Gift - Video 1.mp4")

    if which == "E2":
        p = pairs_from(C_CAST[:2], "poster")
        beats = [
            (66, Scene(f"{SNC}/gift-cheerleading-composited.png", "SENIOR NIGHT HAS A DATE. WE WORK TO IT.", n=66, zoom=(1.08, 1.02), focus=(0.5, 0.40),
                       pills=[("FILES 1 WEEK BEFORE", (48, 48)), ("PRINTED SETS 2 WEEKS", (48, 118)), ("SEALED PACK 3–4 WEEKS", (48, 188))]).frame),
            (96, Objects([(f"{SNC}/sr-digital.png", "DIGITAL COMPLETE SET"), (f"{SNC}/set-printed-real.png", "PRINTED SET · 12 CARDS + 18×24"),
                          (f"{SNC}/set-deluxe-real.png", "DELUXE · 24 CARDS + 24×36"), (f"{SNC}/set-ultimate-real.png", "ULTIMATE · + SEALED FOIL PACK")],
                         "FOUR WAYS TO OWN IT.").frame),
            (42, Scene(f"{SNC}/card-in-case-composited.png", "NUMBERED. REGISTERED. 1 OF 1.", n=42, zoom=(1.0, 1.08)).frame),
        ] + pairs_beats(p, "poster", ch, big=54, small=28) + [
            measured_beat(ch, C_CAST, 36),
            proof_beat(ch, "poster", CP, 40),
            (40, Scene(f"{SNC}/poster-on-wall-composited.png", "EVERY FALL SPORT HAS ITS OWN SET.", n=40, zoom=(1.0, 1.06)).frame),
            end_beat("ONE LAST HOME GAME. MAKE IT LAST LONGER.", 40),
        ]
        render(beats, {}, f"{OUT}/Cheer Senior Night Gift - Video 2.mp4")

if __name__ == "__main__" and not (len(sys.argv) > 1 and sys.argv[1] == "sport"):
    w = sys.argv[1] if len(sys.argv) > 1 else "all"
    for which in (["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2", "E1", "E2"] if w == "all" else [w]):
        print("==", which); build(which)

# ============================================================================================
# ALL REMAINING LISTINGS — one config per sport, the same six builds (owner, 2026-09-05:
# "sukurk visus kitus likusius listingus"). Football card/poster, the set, SN any-sport and SN
# cheer were shipped as the examples above; everything else renders from here.
#
#   GDE_TRIAL=<mirror> python3 etsy/video/render_types.py sport <slug> <card|poster|sn|all>
# ============================================================================================
import numpy as np

SRCM = f"{TRIAL}/src"                                   # mirrored listing sources per sport

def _p(*parts):
    """First existing path wins (mirror first, repo second)."""
    for p in parts:
        if p and os.path.exists(p):
            return p
    return parts[-1]

def _ls(listing, name):
    return _p(f"{SRCM}/{listing}/{name}", f"etsy/listing-images/{listing}/src/{name}")

SPORTS = {
    "basketball": dict(
        code="bkb", label="BASKETBALL", athlete="Marcus Ellison",
        card_title="Custom Basketball Trading Card", poster_title="Custom Basketball Poster",
        card="01-basketball-card", poster="02-basketball-poster", px="BK",
        card_lead=("SN", "STADIUM NIGHT"), poster_lead=("SN", "STADIUM NIGHT"),
        fan=["SS", "HE", "SN", "CA", "PR"], flip="_f-fliplight",
        cert=f"{SRC}/marcus-sn-certificate.png",
        six_rooms=[f"{PKG}/p-room-{k}.png" for k in ("SN", "CA", "FS", "HE", "SS", "PR")],
        room_labels=["STADIUM NIGHT", "CHROME ALL-STAR", "FIRE & SMOKE"], room_pick=[0, 1, 2],
        hook_frames="_f-b1custom", hook_offset=29, kid_frames="_f-b6custom", room_frames="_f-posterzoom",
        cast_cards=[("basketball", "BASKETBALL", None), ("football", "FOOTBALL", f"{SRC}/football-card-FS.png"),
                    ("baseball", "BASEBALL", f"{SRC}/baseball-card-HE.png"), ("cheerleading", "CHEER", f"{SRC}/cheer-card-front-PR.png")],
        cast_posters=[("basketball", "BASKETBALL", None), ("football", "FOOTBALL", f"{SRC}/football-poster-HE.png"),
                      ("baseball", "BASEBALL", f"{SRC}/baseball-poster.png"), ("cheerleading", "CHEER", f"{SRC}/cheer-poster-SS.png")],
    ),
    "cheerleading": dict(
        code="chr", label="CHEER", athlete="Amara Boyd",
        card_title="Custom Cheerleading Trading Card", poster_title="Custom Cheerleading Poster",
        card="01-cheerleading-card", poster="02-cheerleading-poster", px="CH",
        card_lead=("PR", "PRISM RUSH"), poster_lead=("SS", "SIGNATURE SPOTLIGHT"),
        fan=["SS", "HE", "PR", "SN", "FS"], flip="_f-chrflip",
        cert=None, six_rooms=None, room_labels=["STADIUM NIGHT", "FIRE & SMOKE", "PRISM RUSH"], room_pick=[0, 2, 5],
        cast_cards=[("cheerleading", "CHEER", None), ("gymnastics", "GYMNASTICS", f"{SRC}/gymnastics-card-front.png"),
                    ("football", "FOOTBALL", f"{SRC}/football-card-FS.png"), ("baseball", "BASEBALL", f"{SRC}/baseball-card-HE.png")],
        cast_posters=[("cheerleading", "CHEER", None), ("gymnastics", "GYMNASTICS", f"{SRC}/gymnastics-poster.png"),
                      ("football", "FOOTBALL", f"{SRC}/football-poster-HE.png"), ("baseball", "BASEBALL", f"{SRC}/baseball-poster.png")],
    ),
    "baseball": dict(
        code="bsb", label="BASEBALL", athlete="Casey Whitlock",
        card_title="Custom Baseball Card", poster_title="Custom Baseball Poster",
        card="01-baseball-card", poster="02-baseball-poster", px="BB",
        card_lead=("HE", "HERITAGE"), poster_lead=("CA", "CHROME ALL-STAR"),
        fan=["SN", "CA", "HE", "FS", "PR"], flip="_f-bsbflip",
        cert=f"{SRC}/baseball-certificate.png", six_rooms=None, room_labels=["STADIUM NIGHT", "FIRE & SMOKE", "PRISM RUSH"], room_pick=[0, 2, 5],
        cast_cards=[("baseball", "BASEBALL", None), ("football", "FOOTBALL", f"{SRC}/football-card-FS.png"),
                    ("soccer", "SOCCER", f"{SRC}/soccer-card-CA.png"), ("cheerleading", "CHEER", f"{SRC}/cheer-card-front-PR.png")],
        cast_posters=[("baseball", "BASEBALL", None), ("football", "FOOTBALL", f"{SRC}/football-poster-HE.png"),
                      ("soccer", "SOCCER", None), ("cheerleading", "CHEER", f"{SRC}/cheer-poster-SS.png")],
    ),
    "soccer": dict(
        code="soc", label="SOCCER", athlete="Mateo Herrera",
        card_title="Custom Soccer Card", poster_title="Custom Soccer Poster",
        card="01-soccer-card", poster="02-soccer-poster", px="SC",
        card_lead=("CA", "CHROME ALL-STAR"), poster_lead=("FS", "FIRE & SMOKE"),
        fan=["SN", "HE", "CA", "FS", "PR"], flip="_f-socflip",
        cert=f"{SRC}/soccer-certificate.png", six_rooms=None, room_labels=["STADIUM NIGHT", "HERITAGE", "PRISM RUSH"], room_pick=[0, 3, 5],
        cast_cards=[("soccer", "SOCCER", None), ("football", "FOOTBALL", f"{SRC}/football-card-FS.png"),
                    ("volleyball", "VOLLEYBALL", f"{SRC}/volleyball-card-SS.png"), ("baseball", "BASEBALL", f"{SRC}/baseball-card-HE.png")],
        cast_posters=[("soccer", "SOCCER", None), ("football", "FOOTBALL", f"{SRC}/football-poster-HE.png"),
                      ("volleyball", "VOLLEYBALL", None), ("baseball", "BASEBALL", f"{SRC}/baseball-poster.png")],
    ),
    "volleyball": dict(
        code="vb", label="VOLLEYBALL", athlete="Jaslene Ocampo",
        card_title="Custom Volleyball Trading Card", poster_title="Custom Volleyball Poster",
        card="01-volleyball-card", poster="02-volleyball-poster", px="VB",
        card_lead=("SS", "SIGNATURE SPOTLIGHT"), poster_lead=("PR", "PRISM RUSH"),
        fan=["SN", "CA", "SS", "FS", "PR"], flip="_f-vbflip",
        cert=f"{SRC}/volleyball-certificate.png", six_rooms=None, room_labels=["STADIUM NIGHT", "FIRE & SMOKE", "PRISM RUSH"], room_pick=[0, 2, 5],
        cast_cards=[("volleyball", "VOLLEYBALL", None), ("cheerleading", "CHEER", f"{SRC}/cheer-card-front-PR.png"),
                    ("gymnastics", "GYMNASTICS", f"{SRC}/gymnastics-card-front.png"), ("soccer", "SOCCER", f"{SRC}/soccer-card-CA.png")],
        cast_posters=[("volleyball", "VOLLEYBALL", None), ("cheerleading", "CHEER", f"{SRC}/cheer-poster-SS.png"),
                      ("gymnastics", "GYMNASTICS", f"{SRC}/gymnastics-poster.png"), ("soccer", "SOCCER", None)],
    ),
}

SN_SPORTS = {
    "football":   dict(code="ftb", title="Football Senior Night Gift",   sn="sn",            gift="gift-football-composited.png",   flip="_f-ftbsr", sr="ftb"),
    "volleyball": dict(code="vbl", title="Senior Night Volleyball Gift", sn="sn-volleyball", gift="gift-volleyball-composited.png", flip="_f-vbsr",  sr="vbl"),
    "soccer":     dict(code="soc", title="Soccer Senior Night Gift",     sn="sn-soccer",     gift="gift-soccer-composited.png",     flip="_f-socsr", sr="soc"),
    "baseball":   dict(code="bsb", title="Baseball Senior Night Gift",   sn="sn-baseball",   gift="gift-baseball-composited.png",   flip="_f-bsbsr", sr="bsb"),
}

def poster_art(slug, fin):
    """A sport's poster in a finish: the poster-listing source, soccer's Fire & Smoke being the
    stitch-free v2 (2026-09-04 re-audit)."""
    c = SPORTS[slug]
    if slug == "soccer" and fin == "FS":
        return _ls(c["poster"], "SC-FS-poster-v2.png")
    return _ls(c["poster"], f"{c['px']}-{fin}-poster.png")

def card_front(slug, fin):
    c = SPORTS[slug]
    p = _ls(c["card"], f"{c['px']}-{fin}-card-FRONT.png")
    return p if os.path.exists(p) else _ls(c["card"], f"{c['px']}-{fin}-front.png")

def card_back(slug, fin):
    return _ls(SPORTS[slug]["card"], f"{SPORTS[slug]['px']}-{fin}-card-BACK.png")

def cert_of(slug):
    c = SPORTS[slug]
    return c["cert"] or _ls(c["card"], f"{c['px']}-certificate.png")

def six_rooms(slug):
    c = SPORTS[slug]
    if c["six_rooms"]:
        return c["six_rooms"]
    fins = ("SN", "CA", "FS", "HE", "SS", "PR")
    a = [_ls(c["poster"], f"mockroom-{k}.jpg") for k in fins]
    if all(os.path.exists(p) for p in a):
        return a
    return [_ls(c["poster"], f"mock-room-{k}.png") for k in fins]

class OwnerCardInHand:
    """Basketball only: the owner's B6 take (card held clear of the face) with the real SN
    front corner-pinned per frame from the tracked quads — the V3.B6 method on the mirrored,
    already-square frames."""
    def __init__(self, caption, n=72):
        self.dir = f"{TRIAL}/_f-b6custom"; self.n = n
        self.count = len([x for x in os.listdir(self.dir) if x.endswith(".png")])
        self.card = Image.open("card-flip/assets/marcus-sn/card-front.png").convert("RGB")
        self.quads = np.load(f"{TRIAL}/b6new-quads.npy")
        self.caption = caption
        self.LAST = min(118, len(self.quads), self.count)

    def frame(self, i):
        idx = 1 + min(i, self.LAST - 1)
        src = V3.seq_frame(self.dir, idx); f = src.copy()
        q = [tuple(p) for p in self.quads[idx - 1]]
        cx = sum(p[0] for p in q) / 4.0; cy = sum(p[1] for p in q) / 4.0
        q = [(x - (cx - x) * 0.035, y - (cy - y) * 0.035) for x, y in q]
        GW, GH = self.card.size
        coeffs = V3.find_coeffs([(0, 0), (GW, 0), (GW, GH), (0, GH)], q)
        warped = self.card.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
        qm = Image.new("L", (GW, GH), 255).transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
        f.paste(warped, (0, 0), qm)
        base = np.asarray(src).astype(np.int16)
        skin = (base[..., 0] > 95) & (base[..., 0] > base[..., 1] + 12) & (base[..., 1] > base[..., 2]) & (base[..., 0] - base[..., 2] > 18)
        xs = [p[0] for p in q]; ys = [p[1] for p in q]
        reg = np.zeros(skin.shape, bool)
        y0 = int(min(ys) + (max(ys) - min(ys)) * 0.62)
        reg[y0:int(max(ys)) + 45, max(0, int(min(xs)) - 45):int(min(xs) + (max(xs) - min(xs)) * 0.5)] = True
        sm = Image.fromarray(((skin & reg) * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2))
        f.paste(src, (0, 0), sm)
        return cap(f, self.caption, (i - 8) / 8.0)

def hook_beat(slug, caption):
    c = SPORTS.get(slug, {})
    if c.get("hook_frames") and os.path.isdir(f"{TRIAL}/{c['hook_frames']}"):
        return (72, Frames(c["hook_frames"], 72, offset=c.get("hook_offset", 0), caption=caption, flash_out=True).frame)
    return (72, Hook(slug, caption).frame)

def kid_beat(slug, caption):
    c = SPORTS[slug]
    if c.get("kid_frames") and os.path.isdir(f"{TRIAL}/{c['kid_frames']}") and os.path.exists(f"{TRIAL}/b6new-quads.npy"):
        return (36, OwnerCardInHand(caption, 36).frame)
    return (36, Scene(_ls(c["card"], "s03-athlete-holds-card.png"), caption, n=36, zoom=(1.0, 1.08), focus=(0.5, 0.42), cap_at=2).frame)

def room_beat(slug, caption):
    c = SPORTS[slug]
    if c.get("room_frames") and os.path.isdir(f"{TRIAL}/{c['room_frames']}"):
        return (72, Frames(c["room_frames"], 72, caption=caption, cap_at=12).frame)
    return (72, Scene(_ls(c["poster"], "05-their-wall.jpg"), caption, n=72, zoom=(1.0, 1.10), focus=(0.5, 0.42)).frame)

def build_sport(slug, kind):
    ch = C.Frame()
    c = SPORTS[slug]
    lead, lead_name = c["card_lead"]
    plead, plead_name = c["poster_lead"]
    front, back = card_front(slug, lead), card_back(slug, lead)
    poster = poster_art(slug, plead)
    cast_c = [(s, l, a or front) for s, l, a in c["cast_cards"]]
    cast_p = [(s, l, a or (poster if s == slug else poster_art(s, SPORTS[s]["poster_lead"][0]))) for s, l, a in c["cast_posters"]]
    fan = [card_front(slug, k) for k in c["fan"]]

    if kind == "card":
        beats = [hook_beat(slug, "YOUR CAMERA ROLL IS FULL OF THESE."),
                 (66, Gallery(slug).frame),
                 (78, SC.Packs(ch, {"slug": slug}).frame),
                 (78, Frames(c["flip"], 78, offset=30, caption="FRONT + BACK. NUMBERED. REGISTERED.", cap_at=44).frame),
                 (54, SC.Fan(ch, {"fan": fan}).frame),
                 kid_beat(slug, "THEIR FACE. THEIR NAME. THEIR CARD."),
                 end_beat("THEIR PHOTOS. THEIR CARD.")]
        render(beats, {2: 6, 3: 6, 4: 6, 5: 6, 6: 8}, f"{OUT}/{c['card_title']} - Video 1.mp4")

        p = pairs_from(cast_c, "card")
        beats = pairs_beats(p, "card", ch, big=66, small=28)
        beats += [measured_beat(ch, cast_c, 42), proof_beat(ch, "card", front, 42),
                  (96, Objects([(_ls(c["card"], "pkg-01-digital.png"), "DIGITAL CARD FILES"),
                                (_ls(c["card"], "pkg-02-12-cards.png"), "12 PRINTED CARDS"),
                                (_ls(c["card"], "pkg-03-24-cards.png"), "DOUBLE DECK · 24 CARDS"),
                                (_ls(c["card"], "pkg-04-foil-pack.png"), "SEALED FOIL PACK · 18 CARDS")], "FOUR WAYS TO OWN IT.").frame),
                  (42, Chrome(ch, "WITH EVERY SHIPPED PACKAGE", ["FREE CERTIFICATE.", "LIVE REGISTRY PAGE."],
                              body=["Printed, numbered and signed — and the QR on the card opens its own page."],
                              art=cert_of(slug), art_box=(400, 500), n=42).frame),
                  (30, Chrome(ch, "HOW FAST", "DIGITAL OR PRINTED.", chips=[(TIMING, C.ORANGE)], n=30).frame),
                  end_beat("THEIR PHOTOS. THEIR CARD.", 36)]
        render(beats, {}, f"{OUT}/{c['card_title']} - Video 2.mp4")

    if kind == "poster":
        rooms = six_rooms(slug)
        beats = [hook_beat(slug, "THEIR SEASON DESERVES MORE THAN A CAMERA ROLL."),
                 (66, Gallery(slug).frame),
                 (72, SC.Packs(ch, {"slug": slug}).frame),
                 (66, Reveal(ch, poster, f"{plead_name} FINISH", "THE POSTER.", markers=True, sub="3 SHOTS OF YOUR ATHLETE — COMPOSED ON ONE POSTER").frame),
                 room_beat(slug, "THEIR SEASON. THEIR WALL."),
                 (30, Objects([(rooms[k], lbl) for k, lbl in zip(c["room_pick"], c["room_labels"])], "SIX FINISHES.", per=10, xf=3).frame),
                 end_beat("THEIR PHOTOS. THEIR POSTER.", 40)]
        render(beats, {2: 6, 3: 6, 4: 6, 5: 4, 6: 8}, f"{OUT}/{c['poster_title']} - Video 1.mp4")

        p = pairs_from(cast_p[:2], "poster")
        beats = pairs_beats(p, "poster", ch, big=60, small=28)
        beats += [measured_beat(ch, cast_p, 42),
                  (102, Sizes([_ls(c["poster"], "room-18x24.jpg"), _ls(c["poster"], "room-24x36.jpg"), _ls(c["poster"], "room-30x40.jpg")],
                              ["18 × 24 IN", "24 × 36 IN", "30 × 40 IN · XL"], "THREE SIZES, TO SCALE.").frame),
                  (42, Scene(f"{PKG}/pkg-tube.png", "ENHANCED MATTE 189 g/m² · ROLLED IN A TUBE", n=42, zoom=(1.0, 1.06), cap_size=50).frame),
                  (36, Scene(_ls(c["poster"], "pkg-01-digital.png"), "WALLPAPERS + SOCIAL, INCLUDED.", n=36, zoom=(1.0, 1.06)).frame),
                  proof_beat(ch, "poster", poster, 42),
                  (30, Chrome(ch, "HOW FAST", "DIGITAL OR PRINTED.", chips=[(TIMING, C.ORANGE), ("FREE US SHIPPING · TRACKED", C.INK)], n=30).frame),
                  end_beat("THEIR PHOTOS. THEIR POSTER.", 36)]
        render(beats, {}, f"{OUT}/{c['poster_title']} - Video 2.mp4")

def build_sn(slug):
    ch = C.Frame()
    s = SN_SPORTS[slug]
    D = _mirror(s["sn"], f"{SHOTS}/senior-night" + ("" if slug == "football" else f"-{slug}"))
    SRP, SRF = f"{SRSRC}/{s['sr']}-sr-poster.png", f"{SRSRC}/{s['sr']}-sr-front.png"
    others = [k for k in ("football", "cheerleading", "soccer", "baseball", "volleyball") if k != slug][:3]
    srmap = {"football": "ftb", "cheerleading": "chr", "soccer": "soc", "baseball": "bsb", "volleyball": "vbl"}
    labels = {"football": "FOOTBALL", "cheerleading": "CHEER", "soccer": "SOCCER", "baseball": "BASEBALL", "volleyball": "VOLLEYBALL"}
    cast = [(slug, labels[slug], SRP)] + [(k, labels[k], f"{SRSRC}/{srmap[k]}-sr-poster.png") for k in others]
    label = labels[slug]
    beats = [(78, Scene(f"{D}/{s['gift']}", "ONE LAST HOME GAME.", n=78, zoom=(1.0, 1.10), focus=(0.5, 0.40), flash_out=True).frame),
             (60, Gallery(slug).frame),
             (72, SC.Packs(ch, {"slug": slug}).frame),
             (66, Reveal(ch, SRP, f"{label} SENIOR NIGHT EDITION", "ONE NIGHT. ONE EDITION.", sub="CHAMPAGNE GOLD · THEIR TEAM COLORS · CLASS OF YEAR").frame),
             (72, Frames(s["flip"], 72, offset=30, caption="THEIR CAREER ON THE BACK. THEIR WORDS.", cap_at=40).frame),
             (42, Scene(f"{D}/team-order-staged-composited.png", "ONE SET PER SENIOR.", n=42, zoom=(1.0, 1.08), cap_at=2).frame),
             end_beat("MAKE IT LAST LONGER.", 42)]
    render(beats, {2: 6, 3: 6, 4: 6, 5: 6, 6: 8}, f"{OUT}/{s['title']} - Video 1.mp4")

    p = pairs_from(cast[:2], "poster")
    beats = [(66, Scene(f"{D}/{s['gift']}", "SENIOR NIGHT HAS A DATE. WE WORK TO IT.", n=66, zoom=(1.08, 1.02), focus=(0.5, 0.40),
                        pills=[("FILES 1 WEEK BEFORE", (48, 48)), ("PRINTED SETS 2 WEEKS", (48, 118)), ("SEALED PACK 3–4 WEEKS", (48, 188))]).frame),
             (96, Objects([(f"{D}/sr-digital.png", "DIGITAL COMPLETE SET"), (f"{D}/set-printed-real.png", "PRINTED SET · 12 CARDS + 18×24"),
                           (f"{D}/set-deluxe-real.png", "DELUXE · 24 CARDS + 24×36"), (f"{D}/set-ultimate-real.png", "ULTIMATE · + SEALED FOIL PACK")],
                          "FOUR WAYS TO OWN IT.").frame),
             (42, Scene(f"{D}/card-in-case-composited.png", "NUMBERED. REGISTERED. 1 OF 1.", n=42, zoom=(1.0, 1.08)).frame),
             ] + pairs_beats(p, "poster", ch, big=54, small=28) + [
             measured_beat(ch, cast, 36),
             proof_beat(ch, "poster", SRP, 40),
             (40, Scene(f"{D}/poster-on-wall-composited.png", "EVERY FALL SPORT HAS ITS OWN SET.", n=40, zoom=(1.0, 1.06)).frame),
             end_beat("ONE LAST HOME GAME. MAKE IT LAST LONGER.", 40)]
    render(beats, {}, f"{OUT}/{s['title']} - Video 2.mp4")

if __name__ == "__main__" and len(sys.argv) > 2 and sys.argv[1] == "sport":
    slug = sys.argv[2]; kind = sys.argv[3] if len(sys.argv) > 3 else "all"
    if kind in ("card", "all") and slug in SPORTS: print("==", slug, "card"); build_sport(slug, "card")
    if kind in ("poster", "all") and slug in SPORTS: print("==", slug, "poster"); build_sport(slug, "poster")
    if kind in ("sn", "all") and slug in SN_SPORTS: print("==", slug, "sn"); build_sn(slug)
