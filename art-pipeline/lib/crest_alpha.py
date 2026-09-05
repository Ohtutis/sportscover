#!/usr/bin/env python3
"""Give every club crest a transparent background.

Background colour is read from the CORNERS, not assumed to be white.

The crest generator returns a flat PNG on white. On a card that is fine only if the card is
also white — on all six finishes it is a WHITE BOX sitting behind the badge, and it appeared
on the very first sport file built. All twenty crests in the repo measure 0.0% transparent.

The background is removed by FLOOD FILL FROM THE EDGES, not by "make white transparent":
crests contain white themselves — the Bears' muzzle, the Larks' wing bars, the Anvils'
keystone — and a global white key eats those. Only white that is CONNECTED to the border is
background.

Writes `<slug>.cut.png` and leaves the original alone.

Usage: python3 art-pipeline/lib/crest_alpha.py [--crest <slug>] [--threshold 244]
"""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
CRESTS = ROOT / "art-pipeline" / "out" / "crests"


def cut(path: Path, thr: int) -> tuple[Path, float]:
    im = Image.open(path).convert("RGB")
    a = np.array(im).astype(np.int16)
    # Do NOT assume the background is white. Ash Grove Foxes is on mid-grey, and a white key
    # left it fully opaque — the one crest of twenty that silently did nothing. Read the
    # backdrop off the four corners instead and key on distance from THAT.
    h, w = a.shape[:2]
    # Sample an INSET ring, not the literal corners: Ash Grove Foxes has a thin dark frame
    # drawn at the very edge, so the corners report the frame and the key finds nothing.
    ins = max(4, round(min(h, w) * 0.01))
    ring = np.concatenate([a[ins, ins:-ins], a[-ins - 1, ins:-ins],
                           a[ins:-ins, ins], a[ins:-ins, -ins - 1]])
    bgcol = np.median(ring, axis=0)
    tol = max(18, 255 - thr)                       # thr 244 -> tol 18
    nearly_white = (np.abs(a - bgcol).max(axis=2) <= tol)
    # The frame band itself is never part of the badge.
    nearly_white[:ins, :] = True
    nearly_white[-ins:, :] = True
    nearly_white[:, :ins] = True
    nearly_white[:, -ins:] = True

    # Connected-to-the-border white only.
    lab, n = ndimage.label(nearly_white)
    border = set(lab[0, :].tolist()) | set(lab[-1, :].tolist()) | set(lab[:, 0].tolist()) | set(lab[:, -1].tolist())
    border.discard(0)
    bg = np.isin(lab, list(border))

    alpha = np.where(bg, 0, 255).astype(np.uint8)
    # One soft pixel at the boundary, or the badge reads as a sticker cut with scissors.
    alpha_img = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(1.1))
    alpha = np.array(alpha_img)
    # Anything the fill called background stays fully clear — the blur must not paint it back.
    alpha[bg & (ndimage.binary_erosion(bg, iterations=2))] = 0

    out = Image.fromarray(np.dstack([np.array(im), alpha]).astype(np.uint8), "RGBA")
    dst = path.with_name(path.stem + ".cut.png")
    out.save(dst)
    return dst, float((alpha < 8).mean() * 100)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--crest")
    ap.add_argument("--threshold", type=int, default=244)
    args = ap.parse_args()
    files = sorted(p for p in CRESTS.glob("*.png") if not p.name.endswith(".cut.png"))
    if args.crest:
        files = [p for p in files if p.stem == args.crest]
    for p in files:
        dst, pct = cut(p, args.threshold)
        print(f"{p.stem:28s} -> {dst.name:32s} transparent {pct:5.1f}%")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
