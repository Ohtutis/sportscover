#!/usr/bin/env python3
"""Etsy card promo v3 — 15 s, 1080x1080, 30 fps, NO text (CapCut adds it later).

  B1 0.0-2.4   REAL game photo (before/photo2, untouched pixels) — vertical Ken Burns
               pan + subject/bg parallax + handheld drift -> freeze + shutter flash
  B2 2.4-4.8   Veo clip: parent's hands + phone at home; gallery of the 4 REAL intake
               photos tracked onto the (moving) dark screen, selection ticks
  B3 4.8-6.8   the 4 photos fan out on the light beige background
  B4 6.8-8.8   identity reveal: front / three-quarter / full, then back + kit
  B5 8.8-11.8  card flip on the light background (SNLIGHT render)
  B6 11.8-13.8 Marcus holding his card — parallax push-in (pixels untouched)
  B7 13.8-15.0 silver GDE shield on navy, fade out

Rule (gde-audit-all-generated): every generated frame used here passed the judge audit
or is 100% real photograph pixels. The two AI square-extension takes of photo2 FAILED
audit (invented people, seams) and were replaced by the real-pixel pan in B1.
"""
import math, os, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
W = H = 1080
FPS = 30
TRIAL = os.environ.get("GDE_TRIAL", "etsy/video/trial")
OUT_FRAMES = "/private/tmp/claude-501/-Users-a-Documents-sportscover/17c91614-e973-4806-aca1-ba7fb5ffafdc/scratchpad/enc3"
BEIGE = (239, 235, 228)

def ease_out_cubic(t): return 1 - (1 - t) ** 3
def ease_in_cubic(t): return t ** 3
def ease_out_back(t, s=1.3):
    t -= 1
    return 1 + (s + 1) * t ** 3 + s * t * t
def clamp01(t): return max(0.0, min(1.0, t))

def prep():
    jobs = []
    # DROP-IN SLOTS for owner-modeled clips: place a file at either path and rerun —
    # it replaces the built-in crop animation for that beat. Any resolution/aspect;
    # frames are center-cropped square.
    if os.path.exists(f"{TRIAL}/b1-custom.mp4"):
        jobs.append((f"{TRIAL}/b1-custom.mp4", f"{TRIAL}/_f-b1custom", "fps=30"))
    if os.path.exists(f"{TRIAL}/b6-custom.mp4"):
        jobs.append((f"{TRIAL}/b6-custom.mp4", f"{TRIAL}/_f-b6custom", "fps=30"))
    jobs += [
        ("card-flip/out/GDE_SNLIGHT_CardFlip_1080x1350.mp4", f"{TRIAL}/_f-fliplight",
         "crop=1080:1080:0:135,fps=30"),
        (f"{TRIAL}/phone-veo.mp4", f"{TRIAL}/_f-phone", "fps=30"),
    ]
    for src, dst, vf in jobs:
        if os.path.isdir(dst) and os.listdir(dst):
            continue
        os.makedirs(dst, exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src,
                        "-vf", vf, f"{dst}/f%04d.png"], check=True)

def seq_frame(d, i): return Image.open(f"{d}/f{i:04d}.png").convert("RGB")

def rounded(img, rad):
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, img.size[0] - 1, img.size[1] - 1], rad, fill=255)
    img = img.convert("RGBA"); img.putalpha(m); return img

def paste_rot(canvas, img, center, deg, alpha=1.0):
    r = img.rotate(deg, expand=True, resample=Image.BICUBIC)
    if alpha < 1.0:
        a = r.getchannel("A").point(lambda v: int(v * alpha)); r.putalpha(a)
    canvas.paste(r, (int(center[0] - r.width / 2), int(center[1] - r.height / 2)), r)

def shadowed(canvas, img, center, deg=0.0, alpha=1.0, blur=16, sa=70):
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.paste(Image.new("RGBA", img.size, (0, 0, 0, sa)), (0, 0), img)
    sh = sh.rotate(deg, expand=True, resample=Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))
    if alpha < 1.0:
        a = sh.getchannel("A").point(lambda v: int(v * alpha)); sh.putalpha(a)
    canvas.paste(sh, (int(center[0] - sh.width / 2 + 5), int(center[1] - sh.height / 2 + 12)), sh)
    paste_rot(canvas, img, center, deg, alpha)

def beige_bg():
    f = Image.new("RGB", (W, H), BEIGE)
    v = Image.new("L", (W, H), 0)
    ImageDraw.Draw(v).ellipse([-W * 0.3, -H * 0.3, W * 1.3, H * 1.3], fill=26)
    v = v.filter(ImageFilter.GaussianBlur(160))
    f.paste(Image.new("RGB", (W, H), (222, 217, 208)), (0, 0), Image.eval(v, lambda x: 26 - x))
    return f

# ---------------- B1: real game moment, real pixels only ----------------
def square_from(d, i):
    """Center-crop a custom clip frame to 1080x1080."""
    f = seq_frame(d, i)
    w, h = f.size
    side = min(w, h)
    f = f.crop(((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2))
    return f.resize((W, H), Image.LANCZOS)

class B1:
    def __init__(self):
        self.img = Image.open("art-pipeline/out/athletes/basketball/before/photo2.png").convert("RGB")
        self.mask = Image.open(f"{TRIAL}/photo2-mask.png").convert("L").filter(ImageFilter.GaussianBlur(3))
        self.custom = os.path.isdir(f"{TRIAL}/_f-b1custom")
        self.nc = len(os.listdir(f"{TRIAL}/_f-b1custom")) if self.custom else 0

    def frame(self, i):
        FREEZE = 58
        if self.custom:
            # owner clip at ITS OWN speed, every frame, no time compression; the shutter
            # flash lands on the frozen last frame.
            last = self.nc - 1
            idx = 1 + min(i, last - 1)
            f = square_from(f"{TRIAL}/_f-b1custom", idx)
            if i >= last:
                ft = clamp01((i - last) / 4.0)
                f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)), ft)
            return f
        j = min(i, FREEZE)
        t = j / float(FREEZE)
        e = ease_out_cubic(t)
        iw, ih = self.img.size  # 1792x2400
        # window: starts near the head, drifts down toward the ball, zooming in
        zoom = 1.10 + 0.10 * e
        vw = int(iw / zoom)
        wob_x = 2.2 * math.sin(j / 6.3) + 1.4 * math.sin(j / 2.9)
        wob_y = 1.8 * math.sin(j / 5.1 + 1.2)
        cx = iw // 2 + int(wob_x * 2)
        cy = int(ih * 0.335 + ih * 0.05 * e + wob_y * 2)
        x0 = max(0, min(iw - vw, cx - vw // 2))
        y0 = max(0, min(ih - vw, cy - vw // 2))
        f = self.img.crop((x0, y0, x0 + vw, y0 + vw)).resize((W, H), Image.LANCZOS)
        # subject layer with slightly stronger zoom -> parallax
        sz = zoom * 1.017
        sw = int(iw / sz)
        sx0 = max(0, min(iw - sw, cx - sw // 2))
        sy0 = max(0, min(ih - sw, cy - sw // 2))
        sub = self.img.crop((sx0, sy0, sx0 + sw, sy0 + sw)).resize((W, H), Image.LANCZOS)
        smk = self.mask.crop((sx0, sy0, sx0 + sw, sy0 + sw)).resize((W, H), Image.LANCZOS)
        f.paste(sub, (0, 0), smk)
        br = 1.0 + 0.02 * math.sin(j / 7.0)
        f = Image.eval(f, lambda v: min(255, int(v * br)))
        if i > FREEZE + 4:
            ft = clamp01((i - FREEZE - 4) / 8.0)
            f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)), 0.85 * ft)
        return f

# ---------------- B2: Veo phone clip + tracked gallery ----------------
def find_coeffs(dst, src):
    A = []
    for (x, y), (X, Y) in zip(dst, src):
        A.append([X, Y, 1, 0, 0, 0, -x * X, -x * Y])
        A.append([0, 0, 0, X, Y, 1, -y * X, -y * Y])
    b = np.array([c for p in dst for c in p], dtype=np.float64)
    return np.linalg.solve(np.array(A, dtype=np.float64), b)

class B2:
    """Static still + hand-measured screen quad + procedural life (wobble/push/breathe).
    The Veo phone clip was shelved: its screen carries bright reflections, so no
    darkness-based tracking can find it (three failed attempts documented in git)."""
    GW, GH = 640, 1300
    QUAD = [(574, 692), (903, 653), (978, 1310), (692, 1342)]  # bottom corners re-measured after the judge caught the gallery spilling past the screen edge

    def __init__(self, photos):
        self.base = Image.open(f"{TRIAL}/phone-gallery-still.png").convert("RGB")
        self.photos = photos
        coeffs = find_coeffs([(0, 0), (self.GW, 0), (self.GW, self.GH), (0, self.GH)], self.QUAD)
        self.coeffs = coeffs
        S = self.base.size
        # ROUNDED corners: the phone screen is rounded, a square mask pokes out past
        # the corners (owner-flagged bug, 2026-08-27) — round the mask in gallery space
        qm = Image.new("L", (self.GW, self.GH), 0)
        ImageDraw.Draw(qm).rounded_rectangle([0, 0, self.GW - 1, self.GH - 1], 64, fill=255)
        qmask = qm.transform(S, Image.PERSPECTIVE, coeffs, Image.BICUBIC)
        self.alpha = qmask.filter(ImageFilter.GaussianBlur(1.5))
        # the thumb crossing the screen is re-pasted OPAQUE afterwards — a phone with a
        # gallery and no finger over it reads as fake (owner-flagged)
        from scipy import ndimage as _nd
        a = np.asarray(self.base).astype(np.int16)
        skin = (a[..., 0] > 95) & (a[..., 0] > a[..., 1] + 12) & \
               (a[..., 1] > a[..., 2]) & (a[..., 0] - a[..., 2] > 18)
        skin = skin & (np.asarray(qmask) > 100)
        skin = _nd.binary_closing(skin, iterations=5)
        skin = _nd.binary_opening(skin, iterations=3)
        skin = _nd.binary_dilation(skin, iterations=2)
        self.thumb = Image.fromarray((skin * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2))
        # the hand crossing the screen is re-pasted opaque afterwards
        a = np.asarray(self.base).astype(np.int16)
        skin = (a[..., 0] > 95) & (a[..., 0] > a[..., 1] + 12) & \
               (a[..., 1] > a[..., 2]) & (a[..., 0] - a[..., 2] > 18)
        skin = skin & (np.asarray(qmask) > 128)
        from scipy import ndimage as _nd
        skin = _nd.binary_closing(skin, iterations=4)
        skin = _nd.binary_opening(skin, iterations=2)
        self.thumb = Image.fromarray((skin * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2))

    # Full-bleed gallery: two full rows plus the top of a third, cut by the screen edge —
    # exactly how a real photo app looks when scrolled to the top. The hand crossing the
    # screen is NOT re-pasted, so no finger sits over the photos.
    GAP = 5
    # (photo index, vertical crop bias) — the last two are tighter crops of earlier shots,
    # only their top strip is ever visible in the cut-off third row.
    TILES = [(0, 0.30), (1, 0.34), (2, 0.36), (3, 0.28), (1, 0.62), (0, 0.66)]

    def gallery(self, i):
        g = Image.new("RGB", (self.GW, self.GH), (10, 10, 12))
        tw = (self.GW - self.GAP) // 2
        th = int((self.GH - 2 * self.GAP) / 2.55)      # 2 full rows + a cut third
        tick_at = [16, 30, 44, 58]
        for k, (pi, bias) in enumerate(self.TILES):
            col, row = k % 2, k // 2
            x = col * (tw + self.GAP)
            y = row * (th + self.GAP)
            if y >= self.GH:
                break
            tile = ImageOps.fit(self.photos[pi], (tw, th), Image.LANCZOS, centering=(0.5, bias))
            g.paste(tile, (x, y))
            if k < 4:
                tt = clamp01((i - tick_at[k]) / 8.0)
                if tt > 0:
                    e = ease_out_back(tt)
                    r = int(24 * e)
                    cxx, cyy = x + tw - 38, y + 38
                    d = ImageDraw.Draw(g)
                    d.ellipse([cxx - r, cyy - r, cxx + r, cyy + r], fill=(43, 106, 255))
                    if tt > 0.5:
                        lw = max(3, r // 4)
                        d.line([cxx - r * 0.45, cyy, cxx - r * 0.1, cyy + r * 0.38], fill="white", width=lw)
                        d.line([cxx - r * 0.1, cyy + r * 0.38, cxx + r * 0.5, cyy - r * 0.35], fill="white", width=lw)
        return g

    def frame(self, i):
        f = self.base.copy()
        warped = self.gallery(i).transform(f.size, Image.PERSPECTIVE, self.coeffs, Image.BICUBIC)
        warped = Image.eval(warped, lambda v: int(v * 0.93))
        f.paste(warped, (0, 0), self.alpha)
        f.paste(self.base, (0, 0), self.thumb)
        # procedural life: handheld wobble + slow push + warm light breathing
        t = i / 71.0
        e = ease_out_cubic(t)
        vw = int(1560 - 70 * e)
        wob_x = 2.0 * math.sin(i / 6.1) + 1.2 * math.sin(i / 2.7)
        wob_y = 1.6 * math.sin(i / 4.9 + 0.7)
        cx = 780 + int(wob_x * 2); cy = 1010 + int(wob_y * 2)
        iw, ih = f.size
        x0 = max(0, min(iw - vw, cx - vw // 2)); y0 = max(0, min(ih - vw, cy - vw // 2))
        f = f.crop((x0, y0, x0 + vw, y0 + vw)).resize((W, H), Image.LANCZOS)
        br = 1.0 + 0.018 * math.sin(i / 8.0)
        f = Image.eval(f, lambda v: min(255, int(v * br)))
        if i < 6:
            f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)), (5 - i) / 6.0)
        return f

# ---------------- B3 / B4 (light bg) ----------------
class B3:
    def __init__(self, photos, bg):
        self.bg = bg
        self.tiles = []
        for p in photos:
            t = ImageOps.fit(p, (430, 560), Image.LANCZOS)
            card = Image.new("RGB", (458, 588), (250, 249, 246))
            card.paste(t, (14, 14))
            self.tiles.append(rounded(card, 12))

    def frame(self, i):
        f = self.bg.copy()
        slots = [(292, 430, -8), (555, 385, -2.5), (795, 430, 4), (540, 730, 7)]
        for k, (tile, (sx, sy, deg)) in enumerate(zip(self.tiles, slots)):
            t = clamp01((i - k * 6) / 16)
            if t <= 0: continue
            e = ease_out_cubic(t)
            x = sx + (1 - e) * (540 - sx) * 0.9
            y = sy + (1 - e) * (1400 - sy)
            s = 0.55 + 0.45 * e
            tl = tile.resize((int(tile.width * s), int(tile.height * s)), Image.LANCZOS)
            shadowed(f, tl, (x, y), deg * e, min(1.0, t * 1.6), blur=14, sa=60)
        return f

class B4:
    def __init__(self, bg):
        self.bg = bg
        ident = ImageOps.contain(
            Image.open("art-pipeline/out/athletes/basketball/_identity.png").convert("RGB"),
            (940, 660), Image.LANCZOS)
        icard = Image.new("RGB", (ident.width + 28, ident.height + 28), (250, 249, 246))
        icard.paste(ident, (14, 14)); self.identp = rounded(icard, 14)
        back = ImageOps.contain(
            Image.open("art-pipeline/out/athletes/basketball/_identity-back.png").convert("RGB"),
            (560, 500), Image.LANCZOS)
        bcard = Image.new("RGB", (back.width + 24, back.height + 24), (250, 249, 246))
        bcard.paste(back, (12, 12)); self.backp = rounded(bcard, 12)
        kit = ImageOps.contain(
            Image.open("art-pipeline/out/athletes/basketball/_kit.png").convert("RGB"),
            (500, 500), Image.LANCZOS)
        kcard = Image.new("RGB", (kit.width + 24, kit.height + 24), (250, 249, 246))
        kcard.paste(kit, (12, 12)); self.kitp = rounded(kcard, 12)

    def frame(self, i):
        f = self.bg.copy()
        SWAP = 34
        if i < SWAP + 8:
            t = clamp01(i / 14)
            e = ease_out_cubic(t)
            al = 1.0 if i < SWAP else clamp01(1 - (i - SWAP) / 8.0)
            s_ = 0.94 + 0.06 * e
            pl = self.identp.resize((int(self.identp.width * s_), int(self.identp.height * s_)), Image.LANCZOS)
            shadowed(f, pl, (W / 2, 540 + (1 - e) * 90), 0, min(al, t * 1.8), blur=14, sa=55)
        if i >= SWAP:
            t = clamp01((i - SWAP) / 14); e = ease_out_cubic(t)
            shadowed(f, self.backp, (330, 540 + (1 - e) * 100), 0, t, blur=14, sa=55)
            t2 = clamp01((i - SWAP - 5) / 14); e2 = ease_out_cubic(t2)
            if t2 > 0:
                shadowed(f, self.kitp, (790, 540 + (1 - e2) * 100), 0, t2, blur=14, sa=55)
        return f

# ---------------- B6: holding the card, parallax (pixels untouched) ----------------
class B6:
    """Owner's second take (card held clear of the face, thumb only at the bottom-left
    corner). The clip's own card art is mangled, so the REAL front is corner-pinned on
    using per-frame quads tracked in trial/b6new-quads.npy (frame-to-frame translation
    tracking, both ends anchored to hand-measured corners)."""
    CROP = (0, 420, 1080, 1500)   # the 9:16 file is a letterboxed 1080x1080 clip
    LAST = 118

    def __init__(self):
        self.img = Image.open("art-pipeline/out/etsy-shots/03-kid-card-COMPOSITED.png").convert("RGB")
        self.mask = Image.open(f"{TRIAL}/kidcard-mask.png").convert("L").filter(ImageFilter.GaussianBlur(3))
        self.custom = os.path.isdir(f"{TRIAL}/_f-b6custom")
        self.card = Image.open("card-flip/assets/marcus-sn/card-front.png").convert("RGB")
        qp = f"{TRIAL}/b6new-quads.npy"
        self.quads = np.load(qp) if (self.custom and os.path.exists(qp)) else None

    def frame(self, i):
        if self.custom and self.quads is not None:
            idx = 1 + min(i, self.LAST - 1)   # natural speed, one clip frame per output frame
            src = seq_frame(f"{TRIAL}/_f-b6custom", idx).crop(self.CROP)
            f = src.copy()
            q = [tuple(p) for p in self.quads[idx - 1]]
            cx = sum(p[0] for p in q) / 4.0; cy = sum(p[1] for p in q) / 4.0
            q = [(x - (cx - x) * 0.035, y - (cy - y) * 0.035) for x, y in q]  # expand to hide the clip's own card edge
            GW, GH = self.card.size
            coeffs = find_coeffs([(0, 0), (GW, 0), (GW, GH), (0, GH)], q)
            warped = self.card.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
            qm = Image.new("L", (GW, GH), 255).transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
            qm = qm.filter(ImageFilter.GaussianBlur(1.2))
            f.paste(warped, (0, 0), qm)
            # the fingers cross the card's bottom-left corner: put that skin back on top
            base = np.asarray(src).astype(np.int16)
            skin = (base[..., 0] > 95) & (base[..., 0] > base[..., 1] + 12) & \
                   (base[..., 1] > base[..., 2]) & (base[..., 0] - base[..., 2] > 18)
            xs = [p[0] for p in q]; ys = [p[1] for p in q]
            reg = np.zeros(skin.shape, bool)
            y0 = int(min(ys) + (max(ys) - min(ys)) * 0.62)
            reg[y0:int(max(ys)) + 45, max(0, int(min(xs)) - 45):int(min(xs) + (max(xs) - min(xs)) * 0.5)] = True
            sm = Image.fromarray(((skin & reg) * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(2))
            f.paste(src, (0, 0), sm)
            return f
        t = i / 59.0
        e = ease_out_cubic(t)
        iw, ih = self.img.size
        z = 1.12 - 0.08 * e
        vw = int(iw / z)
        wob_x = 1.6 * math.sin(i / 6.7); wob_y = 1.3 * math.sin(i / 5.3 + 0.8)
        cx = int(iw * 0.47) + int(wob_x * 2); cy = int(ih * 0.46) + int(wob_y * 2)
        x0 = max(0, min(iw - vw, cx - vw // 2)); y0 = max(0, min(ih - vw, cy - vw // 2))
        f = self.img.crop((x0, y0, x0 + vw, y0 + vw)).resize((W, H), Image.LANCZOS)
        sz = z * 1.014
        sw = int(iw / sz)
        sx0 = max(0, min(iw - sw, cx - sw // 2)); sy0 = max(0, min(ih - sw, cy - sw // 2))
        sub = self.img.crop((sx0, sy0, sx0 + sw, sy0 + sw)).resize((W, H), Image.LANCZOS)
        smk = self.mask.crop((sx0, sy0, sx0 + sw, sy0 + sw)).resize((W, H), Image.LANCZOS)
        f.paste(sub, (0, 0), smk)
        return f

# ---------------- B7 ----------------
def navy_bg():
    base = Image.new("RGB", (W, H))
    px = base.load()
    cx, cy = W / 2, H * 0.42
    top, bot = (16, 24, 40), (5, 8, 15)
    for y in range(H):
        for x in range(0, W, 4):
            d = min(1.0, math.hypot(x - cx, y - cy) / (H * 0.95))
            c = tuple(int(t + (b - t) * d) for t, b in zip(top, bot))
            for dx in range(4):
                if x + dx < W: px[x + dx, y] = c
    return base

def silver_shield(path):
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    glyph = (a[..., 0] < 120) & (a[..., 3] > 40)
    grad = np.linspace(0, 1, a.shape[0])[:, None]
    out = np.zeros_like(a)
    out[..., 0] = 214 - 74 * grad; out[..., 1] = 219 - 72 * grad; out[..., 2] = 228 - 66 * grad
    out[..., 3] = np.where(glyph, a[..., 3], 0)
    return Image.fromarray(out.astype("uint8"), "RGBA")

class B7:
    def __init__(self):
        self.bg = navy_bg()
        self.sh = silver_shield(f"{TRIAL}/gde-shield-4x.png")

    def frame(self, i):
        f = self.bg.copy()
        t = clamp01(i / 18); e = ease_out_cubic(t)
        s = 1.10 - 0.10 * e
        sh = self.sh.resize((int(self.sh.width * 0.40 * s), int(self.sh.height * 0.40 * s)), Image.LANCZOS)
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        glow.paste(Image.new("RGBA", sh.size, (205, 212, 224, int(70 * e))),
                   (int(W / 2 - sh.width / 2), int(H / 2 - sh.height / 2)), sh)
        glow = glow.filter(ImageFilter.GaussianBlur(36))
        f = Image.alpha_composite(f.convert("RGBA"), glow)
        aa = sh.getchannel("A").point(lambda v: int(v * e)); sh.putalpha(aa)
        f.paste(sh, (int(W / 2 - sh.width / 2), int(H / 2 - sh.height / 2)), sh)
        f = f.convert("RGB")
        if i >= 30:
            f = Image.blend(f, Image.new("RGB", (W, H), (0, 0, 0)), clamp01((i - 30) / 5.0))
        return f

def main():
    prep()
    os.makedirs(OUT_FRAMES, exist_ok=True)
    photos = [Image.open(f"art-pipeline/out/athletes/basketball/before/photo{k}.png").convert("RGB")
              for k in range(1, 5)]
    bg = beige_bg()
    b1, b2, b3 = B1(), B2(photos), B3(photos, bg)
    b4, b6, b7 = B4(bg), B6(), B7()
    flip = lambda i: seq_frame(f"{TRIAL}/_f-fliplight", 30 + i)

    # B1 and B6 run at the owner clips' own speed (102 and 118 frames); nothing is
    # time-compressed anywhere. The master is ~19.5 s — the owner trims in CapCut.
    beats = [(108, b1.frame), (78, b2.frame), (66, b3.frame), (72, b4.frame),
             (100, flip), (118, b6.frame), (42, b7.frame)]
    XF = {2: 8, 3: 8, 4: 8, 5: 10, 6: 8}

    n = 0
    last_of_prev = None
    for bi, (length, fn) in enumerate(beats):
        xf = XF.get(bi, 0)
        for i in range(length):
            img = fn(i)
            if last_of_prev is not None and i < xf:
                img = Image.blend(last_of_prev, img, (i + 1) / (xf + 1))
            img.save(f"{OUT_FRAMES}/f{n:04d}.png")
            n += 1
            if n % 90 == 0: print(f"{n}/450")
        last_of_prev = fn(length - 1)
    print("frames:", n)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS),
                    "-i", f"{OUT_FRAMES}/f%04d.png",
                    "-c:v", "libx264", "-crf", "17", "-preset", "slow",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
                    "etsy/listing-videos/GDE-etsy-01-card-story-1080.mp4"], check=True)
    print("done")

if __name__ == "__main__":
    main()
