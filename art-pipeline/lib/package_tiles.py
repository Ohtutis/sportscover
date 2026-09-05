"""The four CHOOSE YOUR PACKAGE tiles for one sport, from assets already in the repo.

    .venv-matte/bin/python art-pipeline/lib/package_tiles.py \
        --sport football --finish FS --code FTB

Nothing is generated here. The three base photographs — the empty oak table, the laptop-and-phone
desk, and the supplier's hand holding a pack — are shot once and reused for every sport, so the
whole shop's package row looks photographed in one sitting. Only the artwork changes:

  digital   the sport's card FRONT and BACK warped into the two pages on the laptop, and the
            FRONT again on the phone (the phone screen is masked, because a phone really is round)
  12        a fan of ten faces with two cards drawn out below it, one face and one back
  24        two rows — faces on top, backs beneath — plus one card apart, face up
  pack      the finish's own booster-pack panel warped onto the supplier mockup

Every count-bearing panel is checked for the old "10 COLLECTIBLE CARDS": the pack holds 18.
"""
import argparse
import glob
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.getcwd()
P = "art-pipeline/out/etsy-shots/packages"
SCENE_PACK = "examples/card in foil.jpeg"
SCENE_DESK = f"{P}/pkg-digital.png"
SCENE_TABLE = f"{P}/pkg-table.png"
# The phone screen on SCENE_DESK, fitted to the glass itself (2026-09-02). The old quad was
# 215 px wide because the dark bookshelf behind the phone joins its mask — it painted the card
# past the phone's right edge and squashed it. Measured: left/right edges fitted per row, top/
# bottom per column over the middle columns only, so the notch and the rounded corners do not
# pull the fit, then inset 5 px onto the glass.
PHONE_QUAD = "801,345,952,342,947,655,797,655"
PHONE_AR = 151 / 312
# poster listing's digital scene (gen-package-shots.ts `pkg-digital-poster`): one page in the reader on a
# 27-inch monitor, phone in a wooden stand. Quads fitted on the flat black rectangles (fit_dark_quads).
SCENE_MONITOR = f"{P}/pkg-digital-poster.png"
MONITOR_PAGE_QUAD = "398,334,625,334,625,634,398,634"     # aspect 0.757 — an 18x24 fits it as-is
MONITOR_PHONE_QUAD = "862,644,962,651,948,852,848,845"    # bezel included; --mask-dark keeps the paint on the screen
MONITOR_PHONE_AR = 0.499
FINISH_DIR = {"SN": "stadium-night", "CA": "chrome-allstar", "FS": "fire-and-smoke",
              "HE": "heritage", "SS": "signature-spotlight", "PR": "prism-rush"}


def run(cmd):
    r = subprocess.run([sys.executable] + cmd, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit((r.stderr or r.stdout)[-600:])
    return r.stdout.strip()


def pack_panel(finish, out):
    """Crop the pack's FRONT panel out of the flat print file and fix the card count."""
    src = glob.glob(f"print-sources/output/{FINISH_DIR[finish]}/GDE-*-booster-pack-FLAT-*.png")[0]
    flat = cv2.imread(src)
    panel = flat[35:1525, 605:1423]                    # folds at x = 212/605/1423/1815
    g = cv2.cvtColor(panel, cv2.COLOR_BGR2GRAY)
    # the count line is the bright row of type in the lower third
    band = g[1020:1140, :]
    rows = (band > 150).sum(1)
    ys = np.nonzero(rows > 40)[0]
    if len(ys):
        y0, y1 = 1020 + ys.min(), 1020 + ys.max()
        cols = (g[y0:y1 + 1, :] > 150).sum(0)
        xs = np.nonzero(cols)[0]
        # the first glyph cluster is the number; find the gap that ends it
        gap, run_, first = None, 0, xs.min()
        for x in range(first, xs.max()):
            if cols[x] == 0:
                run_ += 1
                if run_ > 12:
                    gap = x - run_
                    break
            else:
                run_ = 0
        if gap and gap - first < 90:                   # a two-digit count, not a whole word
            digits = panel[y0 - 6:y1 + 8, first - 4:gap + 4]
            bg = tuple(int(v) for v in panel[1160:1180, 300:520].reshape(-1, 3).mean(0)[::-1])
            pil = Image.fromarray(cv2.cvtColor(panel, cv2.COLOR_BGR2RGB))
            dr = ImageDraw.Draw(pil)
            dr.rectangle([first - 4, y0 - 6, gap + 4, y1 + 8], fill=bg)
            cap = y1 - y0
            # Draw at a comfortable size and SCALE to the measured cap height and width. Hunting
            # for a font whose cap height matches exactly fails on half the finishes, and the
            # fallback — picking a lighter weight that happens to be the right width — reads as a
            # different typeface at 2x zoom.
            path = os.path.expanduser("~/Library/Fonts/Barlow-Medium.ttf")
            if os.path.exists(path) and cap > 6:
                fo = ImageFont.truetype(path, 96)
                b = fo.getbbox("18")
                tile = Image.new("L", (b[2] - b[0] + 12, b[3] - b[1] + 14), 0)
                ImageDraw.Draw(tile).text((6 - b[0], 7 - b[1]), "18", font=fo, fill=255)
                target_w = gap - first
                sc = cap / float(b[3] - b[1])
                tile = tile.resize((max(target_w + 8, 8), max(int(tile.height * sc), 8)),
                                   Image.LANCZOS)
                m = np.array(tile).astype(np.float32) / 255.0
                arr = np.array(pil)
                yy, xx = y0 - 5, first - 4
                reg = arr[yy:yy + m.shape[0], xx:xx + m.shape[1]].astype(np.float32)
                ink = np.array([247.0, 246.0, 246.0])
                arr[yy:yy + m.shape[0], xx:xx + m.shape[1]] = (
                    reg * (1 - m[:, :, None]) + ink * m[:, :, None]).astype(np.uint8)
                pil = Image.fromarray(arr)
            panel = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    cv2.imwrite(out, panel)
    return out


def fit_aspect(src, out, aspect):
    """Centre-crop an image to the given aspect (w/h) — a wallpaper onto a phone quad."""
    im = Image.open(src).convert("RGB"); w, h = im.size
    if w / h > aspect: nw = int(h * aspect); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = int(w / aspect); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.save(out); return out


def page_fit(art, out, aspect, pad=0.04, bg=(250, 250, 250)):
    """Fit artwork into a PAGE of a given aspect, on paper white, with a small margin.

    The laptop reader's two page quads are measured on the scene and their aspect is fixed
    (~0.70). A card (0.714) fills them almost exactly; a poster (0.75) or a 2:3 poster (0.667)
    does not, and warping it straight in would stretch it. A PDF reader shows a page, and the
    page shows the art with its margins — so build that page first, then warp the page.
    """
    im = Image.open(art).convert("RGB")
    W = 1000; H = int(round(W / aspect))
    page = Image.new("RGB", (W, H), bg)
    box_w, box_h = int(W * (1 - 2 * pad)), int(H * (1 - 2 * pad))
    s = min(box_w / im.width, box_h / im.height)
    im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    page.paste(im, ((W - im.width) // 2, (H - im.height) // 2))
    ImageDraw.Draw(page).rectangle([(W - im.width) // 2, (H - im.height) // 2,
                                    (W + im.width) // 2 - 1, (H + im.height) // 2 - 1], outline=(215, 215, 215))
    page.save(out)
    return out


def phone_page(front, out, w=840, aspect=PHONE_AR, doc_aspect=750 / 1050):
    """The phone screen as a DOCUMENT VIEWER, not a full-bleed wallpaper.

    A card is 2.5x3.5 (0.714); a phone screen is about 0.65 and taller. Warping the card
    straight onto the screen therefore stretched it and cut its own margins off — the card
    read as crooked. A person looking at their files on a phone sees a PDF page centred in a
    reader with the app's ground either side, so that is what this builds: dark reader
    ground, the card at its true aspect with room around it, and a soft shadow under it.
    The screen quad then receives an image that already has the screen's shape, so nothing
    is distorted.
    """
    h = int(round(w / aspect))
    BG, BAR = (22, 24, 28), (30, 33, 38)
    page = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(page)
    bar = int(h * 0.065)
    d.rectangle([0, 0, w, bar], fill=BAR)                       # the reader's top chrome
    cw = int(w * 0.88)
    ch = int(cw / doc_aspect)
    if ch > h - bar - int(h * 0.06):                            # never let the page overflow
        ch = h - bar - int(h * 0.06)
        cw = int(ch * doc_aspect)
    x = (w - cw) // 2
    y = bar + (h - bar - ch) // 2
    card = Image.open(front).convert("RGB").resize((cw, ch), Image.LANCZOS)
    shadow = Image.new("L", (w, h), 0)
    ImageDraw.Draw(shadow).rectangle([x + 6, y + 10, x + cw + 6, y + ch + 10], fill=110)
    page = Image.composite(Image.new("RGB", (w, h), (0, 0, 0)), page,
                           shadow.filter(ImageFilter.GaussianBlur(14)))
    page.paste(card, (x, y))
    ImageDraw.Draw(page).rectangle([x, y, x + cw - 1, y + ch - 1], outline=(58, 62, 68))
    page.save(out)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sport", required=True)
    ap.add_argument("--finish", required=True)
    ap.add_argument("--front", required=True)
    ap.add_argument("--back", required=True)
    ap.add_argument("--product", default="card", choices=["card", "poster"])
    ap.add_argument("--wallpaper", default=None, help="poster: lock-screen wallpaper shown on the phone")
    ap.add_argument("--only", default="all",
                    choices=["all", "digital", "12", "24", "pack"])
    a = ap.parse_args()
    D = f"etsy/listing-images/01-{a.sport}-card/src"
    W = "art-pipeline/lib/warp_onto.py"
    S = "art-pipeline/lib/card_spread.py"
    C = "art-pipeline/lib/tile_crop.py"
    tmp = f"{P}/_{a.sport}"
    os.makedirs(tmp, exist_ok=True)

    if a.only in ("all", "digital"):
        # 1 · digital — two pages on the laptop, the face again on the phone
        # measured on SCENE_DESK: two pages in the reader window, and the upright phone beside it
        PAGE_AR = 164 / 234                       # the reader's page quads, as measured
        if a.product == "poster":
            # poster: ONE page in the reader (a poster is one file, not a spread) on the monitor
            # scene, so the two listings do not share a scene; the phone shows the lock-screen
            # wallpaper (the buyer's second screen), not the same page again
            D = f"etsy/listing-images/02-{a.sport}-poster/src"
            os.makedirs(D, exist_ok=True)
            run([W, SCENE_MONITOR, a.front, f"{tmp}/d1.png", "--quad", MONITOR_PAGE_QUAD])
            if a.wallpaper:
                phone = fit_aspect(a.wallpaper, f"{tmp}/phone-wall.png", MONITOR_PHONE_AR)
            else:
                phone = phone_page(a.front, f"{tmp}/phone-page.png", doc_aspect=0.75, aspect=MONITOR_PHONE_AR)
            run([W, f"{tmp}/d1.png", phone, f"{tmp}/digital.png", "--quad", MONITOR_PHONE_QUAD, "--mask-dark"])
        else:
            p1, p2 = a.front, a.back
            phone = phone_page(a.front, f"{tmp}/phone-page.png")
            run([W, SCENE_DESK, p1, f"{tmp}/d1.png", "--quad", "275,330,439,330,439,564,275,564"])
            run([W, f"{tmp}/d1.png", p2, f"{tmp}/d2.png", "--quad", "484,330,648,330,648,566,484,566"])
            run([W, f"{tmp}/d2.png", phone, f"{tmp}/digital.png", "--quad", PHONE_QUAD, "--mask-dark"])
        run([C, f"{tmp}/digital.png", f"{D}/pkg-01-digital.png", "0.82"])

    if a.only in ("all", "12"):
        # 2 · twelve — a fan with two cards drawn out below it
        run([S, SCENE_TABLE, f"{tmp}/twelve.png", "--layout", "arc", "--count", "12",
             "--front", a.front, "--back", a.back])
        run([C, f"{tmp}/twelve.png", f"{D}/pkg-02-12-cards.png", "0.90", "--dark"])

    if a.only in ("all", "24"):
        # 3 · twenty-four — faces on top, backs beneath
        run([S, SCENE_TABLE, f"{tmp}/two4.png", "--layout", "rows", "--count", "25",
             "--front", a.front, "--back", a.back])
        run([C, f"{tmp}/two4.png", f"{D}/pkg-03-24-cards.png", "0.88", "--dark"])

    if a.only in ("all", "pack"):
        # 4 · the sealed pack, on the supplier's mockup
        panel = pack_panel(a.finish, f"{tmp}/panel.png")
        run([W, SCENE_PACK, panel, f"{tmp}/pack.png",
             "--quad", "728,586,1374,578,1380,1490,722,1498",
             "--pack-mask", "--multiply", "--smooth", "26"])
        run([C, f"{tmp}/pack.png", f"{D}/pkg-04-foil-pack.png", "0.80"])

    print(f"{a.sport}: {a.only} tile(s) written to {D}")


if __name__ == "__main__":
    main()
