"""Build the poster listing's package tiles for one sport.

Writes into etsy/listing-images/02-<sport>-poster/src:
  pkg-01-digital.png   monitor scene, ONE page in the reader + the phone showing the wallpaper
  room-18x24.jpg       print hung above a desk   (S)
  room-24x36.jpg       print hung above a bed    (M)
  room-30x40.jpg       print hung above a sofa   (L)

The rooms are pre-generated scenes shared by every sport (only the artwork changes), and the print
is placed by MEASUREMENT, never by the generated placeholder — see art-pipeline/lib/hang_poster.py.
The three tiles are cropped to one shared px-per-inch in Figma, so S/M/L grows truly.

  poster_tiles_for_sport.py --sport football --poster ftb/poster-he.png --wallpaper ftb/wall-he.png

⚠️ 24x36 is a 2:3 print but most sports only have 3:4 artwork, so the tile uses a centre crop.
Building real 2:3 compositions per sport is a separate job (only basketball has them, 3 finishes).
"""
import argparse, os, subprocess, sys
from PIL import Image

P = "art-pipeline/out/etsy-shots/packages"
ROOMS = [("18x24", "room-18x24.png", 12.2, 518, 513, "396,177,627,490", 0.75),
         ("24x36", "room-24x36.png", 8.3, 462, 513, "398,137,627,472", 2 / 3),
         ("30x40", "room-30x40.png", 9.4, 525, 527, "387,138,657,528", 0.75)]

ap = argparse.ArgumentParser()
ap.add_argument("--sport", required=True)
ap.add_argument("--poster", required=True, help="the lead finish's poster art, 3:4")
ap.add_argument("--wallpaper", required=True, help="the lead finish's phone lock wallpaper")
ap.add_argument("--tmp", default="/tmp/poster-tiles")
a = ap.parse_args()

D = f"etsy/listing-images/02-{a.sport}-poster/src"
os.makedirs(D, exist_ok=True); os.makedirs(a.tmp, exist_ok=True)

subprocess.run([sys.executable, "art-pipeline/lib/package_tiles.py", "--sport", a.sport, "--finish", "X",
                "--front", a.poster, "--back", a.poster, "--product", "poster", "--only", "digital",
                "--wallpaper", a.wallpaper], check=True)

art34 = Image.open(a.poster).convert("RGB")
for size, scene, ppi, bottom, cx, clear, ar in ROOMS:
    src = a.poster
    if abs(art34.width / art34.height - ar) > 0.01:                     # 2:3 wanted, 3:4 given -> centre crop
        nw = int(art34.height * ar); src = f"{a.tmp}/{a.sport}-{size}.png"
        art34.crop(((art34.width - nw) // 2, 0, (art34.width - nw) // 2 + nw, art34.height)).save(src)
    out = f"{a.tmp}/{a.sport}-room-{size}.png"
    subprocess.run([sys.executable, "art-pipeline/lib/hang_poster.py", f"{P}/{scene}", src, out,
                    "--ppi", str(ppi), "--bottom", str(bottom), "--cx", str(cx), "--size", size,
                    "--clear", clear], check=True)
    Image.open(out).convert("RGB").save(f"{D}/room-{size}.jpg", quality=92)
print(f"{a.sport}: tiles in {D}")
