#!/usr/bin/env python3
"""FLAT GALLERY beat — the photo pick as a flat, front-on screen (owner, 2026-09-05).

Replaces the hands-holding-a-phone composite: no perspective, no thumb, nothing generated.
The screen IS the frame: a dark, generic gallery UI (no vendor chrome), a 3x3 grid of the
athlete's real photos plus scenery crops of those same photos, and the four athlete photos
get SELECTED one after another — a ring, a check, a count that climbs to 4 — then the send
button lights up. Everything is drawn, so it is crisp at 1080 and readable at 400 px.

    FlatGallery(slug).frame(i)   ->  1080x1080 RGB, i in 0..LEN-1
"""
import importlib.util, math, os, sys
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
clamp01, eoc, eob = V3.clamp01, V3.ease_out_cubic, V3.ease_out_back
font, rounded, caption = C.font, C.rounded, SET.caption

SCREEN_BG = (14, 15, 18)
PANEL = (24, 26, 30)
BLUE = (52, 120, 246)
ORANGE = C.ORANGE
MUTED = (150, 154, 160)

def skin_fraction(im):
    small = im.convert("YCbCr").resize((64, 64))
    px = small.load(); n = 0
    for y in range(64):
        for x in range(64):
            _, cb, cr = px[x, y]
            if 77 <= cb <= 127 and 133 <= cr <= 173: n += 1
    return n / 4096.0

def brightness(im):
    g = im.convert("L").resize((32, 32))
    return sum(g.getdata()) / 1024.0

class FlatGallery:
    LEN = 66
    # grid geometry: 3 columns inside a 1080 screen with a header and a footer
    COLS, TILE, GAP = 3, 316, 14
    GX0, GY0 = (W - (3 * 316 + 2 * 14)) // 2, 170
    # which grid cells hold the athlete photos (the ones that get selected), and when
    PICKS = [(1, 22), (2, 31), (3, 40), (5, 49)]       # (cell, frame the tick lands) — 2x3 grid

    def __init__(self, slug):
        base = f"art-pipeline/out/athletes/{slug}/before"
        ph = [Image.open(f"{base}/photo{k}.png").convert("RGB") for k in range(1, 5)]
        # scenery fillers are crops of the SAME photos — never an invented image and never a
        # person: every candidate crop is scored for skin (YCrCb) and the five cleanest win,
        # because the first cut used top strips and two of them held half a head.
        # fillers: crops of the SAME photos that contain NOBODY — decided by a rembg person
        # mask (etsy/video/person_mask.py), not by a skin heuristic, which let half a face
        # through. Candidate strips on all four sides; keep those with <1.5 % person pixels.
        mdir = f"{V3.TRIAL}/masks"
        cands = []
        for pi, p in enumerate(ph):
            mp = f"{mdir}/{slug}-photo{pi + 1}.png"
            mk = Image.open(mp).convert("L") if os.path.exists(mp) else None
            w, h = p.size
            for name, box in (("top", (0, 0, w, int(h * .30))), ("bot", (0, int(h * .74), w, h)),
                              ("left", (0, 0, int(w * .34), h)), ("right", (int(w * .66), 0, w, h)),
                              ("tl", (0, 0, int(w * .5), int(h * .45))), ("tr", (int(w * .5), 0, w, int(h * .45)))):
                c = p.crop(box)
                pf = (sum(mk.crop(box).resize((64, 64)).getdata()) / (64 * 64 * 255.0)) if mk else 1.0
                if pf > 0.06: continue                  # a sliver of shoulder at the edge is tolerated
                cands.append((round(pf, 2), -brightness(c), pi, name, c))
        cands.sort(key=lambda t: (t[0], t[1]))
        cands = [(b, pi, name, c) for _, b, pi, name, c in cands]
        fill, used, sigs = [], set(), []
        def sig(im):
            return list(im.convert("L").resize((8, 8)).getdata())
        for _, pi, name, c in cands:
            if pi in used: continue
            sg = sig(c)
            # no near-duplicates: two crops of one wall read as a repeated photo
            if any(sum(abs(a - b) for a, b in zip(sg, o)) / 64.0 < 18 for o in sigs): continue
            fill.append(c); used.add(pi); sigs.append(sg)
            if len(fill) == 2: break
        while len(fill) < 2:                       # no clean strip at all: the emptiest corner
            best = min(((sum(Image.open(f"{mdir}/{slug}-photo{k + 1}.png").convert("L").crop((int(p.width * .6), 0, p.width, int(p.height * .3))).resize((32, 32)).getdata()), k)
                        for k, p in enumerate(ph) if os.path.exists(f"{mdir}/{slug}-photo{k + 1}.png")), default=(0, 0))[1]
            p = ph[best]; fill.append(p.crop((int(p.width * .6), 0, p.width, int(p.height * .3))))
        cells = [None] * 6
        for (cell, _), p in zip(self.PICKS, ph):
            cells[cell] = p
        fi = 0
        for k in range(6):
            if cells[k] is None:
                cells[k] = fill[fi]; fi += 1
        self.tiles = [rounded(ImageOps.fit(im, (self.TILE, self.TILE), Image.LANCZOS,
                                           centering=(0.5, 0.28)), 18) for im in cells]
        self.pick_cells = {c: f for c, f in self.PICKS}

    def _cell_xy(self, k):
        r, c = divmod(k, self.COLS)
        return (self.GX0 + c * (self.TILE + self.GAP), self.GY0 + r * (self.TILE + self.GAP))

    def frame(self, i):
        f = Image.new("RGB", (W, H), SCREEN_BG)
        d = ImageDraw.Draw(f)
        # header — generic, no vendor UI
        fh = font("Barlow-SemiBold.ttf", 34)
        d.text((self.GX0, 92), "Select photos", font=fh, fill=(235, 236, 240))
        picked = sum(1 for c, t in self.PICKS if i >= t)
        fc = font("Barlow-SemiBold.ttf", 30)
        label = f"{picked} selected" if picked else "Choose 4–10"
        tw = fc.getlength(label) + 44
        x1 = self.GX0 + 3 * self.TILE + 2 * self.GAP
        d.rounded_rectangle([x1 - tw, 86, x1, 86 + 50], radius=25, fill=PANEL)
        d.text((x1 - tw + 22, 94), label, font=fc, fill=(235, 236, 240))
        # tiles fade/scale in over the first 18 frames, staggered
        for k, tile in enumerate(self.tiles):
            t = clamp01((i - k * 1.5) / 14.0)
            if t <= 0: continue
            e = eoc(t)
            x, y = self._cell_xy(k)
            im = tile
            sel_t = 0.0
            if k in self.pick_cells:
                sel_t = clamp01((i - self.pick_cells[k]) / 8.0)
            s_ = (0.92 + 0.08 * e) * (1.0 - 0.06 * eob(sel_t))
            sz = max(1, int(self.TILE * s_))
            im2 = im.resize((sz, sz), Image.LANCZOS)
            if e < 1:
                im2.putalpha(im2.getchannel("A").point(lambda v: int(v * e)))
            ox, oy = x + (self.TILE - sz) // 2, y + (self.TILE - sz) // 2
            f.paste(im2, (ox, oy), im2)
            if sel_t > 0:
                a = eoc(sel_t)
                lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                ld = ImageDraw.Draw(lay)
                # selection ring
                ld.rounded_rectangle([ox - 3, oy - 3, ox + sz + 2, oy + sz + 2], radius=20,
                                     outline=BLUE + (int(255 * a),), width=6)
                # check disc, top-right
                r = int(24 * (0.6 + 0.4 * eob(sel_t)))
                cx, cy = ox + sz - 30, oy + 30
                ld.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BLUE + (int(255 * a),))
                if sel_t > 0.35:
                    ld.line([(cx - 10, cy + 1), (cx - 3, cy + 8), (cx + 11, cy - 7)],
                            fill=(255, 255, 255, int(255 * a)), width=5, joint="curve")
                f.paste(lay, (0, 0), lay)
        # footer send button — lights orange once four are picked
        fb = font("Anton-Regular.ttf", 38)
        on = clamp01((i - 54) / 6.0)
        col = tuple(int(PANEL[j] + (ORANGE[j] - PANEL[j]) * eoc(on)) for j in range(3))
        bx0, by0 = self.GX0, self.GY0 + 2 * self.TILE + self.GAP + 30
        d.rounded_rectangle([bx0, by0, x1, by0 + 72], radius=18, fill=col)
        txt = "SEND TO GAME DAY EDITION" if on > 0.5 else "SELECT 4–10 PHOTOS"
        d.text(((bx0 + x1) / 2 - fb.getlength(txt) / 2, by0 + 15), txt, font=fb,
               fill=(255, 255, 255) if on > 0.5 else MUTED)
        return f

if __name__ == "__main__":
    slug = sys.argv[1] if len(sys.argv) > 1 else "football"
    out = sys.argv[2] if len(sys.argv) > 2 else "/tmp/flat-gallery-test.png"
    g = FlatGallery(slug)
    strip = Image.new("RGB", (4 * 360, 360))
    for k, i in enumerate((6, 26, 46, 64)):
        strip.paste(g.frame(i).resize((360, 360), Image.LANCZOS), (k * 360, 0))
    strip.save(out); print("saved", out)
