#!/usr/bin/env python3
"""Upscale athlete cutouts and finish backgrounds to real print resolution.

The poster is the only deliverable that needs this. Measured 2026-08-24 on the
Figma print board (5400x7200 art inside a 5475x7275 bleed board):

    layer         native        placed        stretch   effective DPI
    #photo_main   1696x2528  ->  3667x5450      2.16x        139
    #photo_2      1696x2528  ->  4129x4454      2.43x        123
    #photo_3      1696x2528  ->  3779x5013      2.23x        135
    #background   2732x4096  ->  5400x7200      1.98x        152

Cards (719 dpi), certificate (600) and pack (403) are already above 300 and are
never touched by this script.

Recipe, unchanged from print-sources/MANIFEST.md: ONE 4x pass, then resample down
to the exact target. A second pass compounds the model's invented texture; going
straight to 2x with the 4x model does the same at the tile seams.

Alpha never goes through the model. The cutouts are RGBA and an ML upscaler will
happily hallucinate fringe into a matte that BiRefNet already decided. RGB is
upscaled, alpha is resampled, and they are recombined.

    npm run art:upscale -- --athlete basketball
    npm run art:upscale -- --athlete basketball --check
    npm run art:upscale -- --in path/to/background.png --width 5400
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parents[2]
ATHLETES = ROOT / "art-pipeline" / "out" / "athletes"
OUT = ROOT / "print-sources" / "upscaled"
MODELS = ROOT / "art-pipeline" / "models"

# Width each layer occupies on the 5400x7200 poster, measured in Figma.
# Headroom is applied on top so a later layout nudge does not send us back here.
POSTER_WIDTH = {"hero": 3667, "action2": 4129, "action3": 3779}
BACKGROUND_WIDTH = 5400
HEADROOM = 1.05
POSTER_PX = (5400, 7200)


# ---------------------------------------------------------------- backends


def find_binary() -> tuple[str, Path] | None:
    """An ncnn upscaler plus the model directory it needs beside it.

    The binary segfaults on startup when it cannot find its .param/.bin files,
    which is exactly how this machine lost the tool on 2026-08-19 (12 crashes in
    under two minutes, EXC_BAD_ACCESS at dyld start). So the model directory is
    part of what counts as "installed".
    """
    for name in ("realesrgan-ncnn-vulkan", "upscayl-bin", "realsr-ncnn-vulkan"):
        exe = shutil.which(name)
        if not exe:
            continue
        here = Path(exe).resolve().parent
        for models in (here / "models", here.parent / "models", here.parent / "share" / name / "models"):
            if models.is_dir() and any(models.glob("*.param")):
                return exe, models
        print(f"  ! {name} is on PATH but its models/ directory is missing — skipping "
              f"(it would segfault, not error)", file=sys.stderr)
    return None


def find_onnx() -> Path | None:
    if not MODELS.is_dir():
        return None
    for p in sorted(MODELS.glob("*.onnx")):
        return p
    return None


def upscale_ncnn(rgb: Image.Image, exe: str, models: Path) -> Image.Image:
    with tempfile.TemporaryDirectory() as td:
        src, dst = Path(td) / "in.png", Path(td) / "out.png"
        rgb.save(src)
        cmd = [exe, "-i", str(src), "-o", str(dst), "-s", "4", "-m", str(models), "-f", "png"]
        if any(m.name.startswith("realesrgan-x4plus") for m in models.glob("*.param")):
            cmd += ["-n", "realesrgan-x4plus"]
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0 or not dst.exists():
            raise RuntimeError(f"upscaler failed (rc={r.returncode}): {r.stderr.strip()[:200]}")
        return Image.open(dst).convert("RGB")


def upscale_onnx(rgb: Image.Image, model: Path, tile: int = 512, pad: int = 16) -> Image.Image:
    import onnxruntime as ort  # noqa: PLC0415  (optional dependency)

    sess = ort.InferenceSession(str(model), providers=["CPUExecutionProvider"])
    iname = sess.get_inputs()[0].name
    a = np.asarray(rgb, dtype=np.float32) / 255.0
    h, w, _ = a.shape
    out = np.zeros((h * 4, w * 4, 3), dtype=np.float32)
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad)
            y1, x1 = min(h, y + tile + pad), min(w, x + tile + pad)
            patch = a[y0:y1, x0:x1].transpose(2, 0, 1)[None]
            res = sess.run(None, {iname: patch})[0][0].transpose(1, 2, 0)
            ty0, tx0 = (y - y0) * 4, (x - x0) * 4
            th = min(tile, h - y) * 4
            tw = min(tile, w - x) * 4
            out[y * 4:y * 4 + th, x * 4:x * 4 + tw] = res[ty0:ty0 + th, tx0:tx0 + tw]
    return Image.fromarray((np.clip(out, 0, 1) * 255).round().astype(np.uint8))


def upscale_lanczos(rgb: Image.Image) -> Image.Image:
    """Resample and re-sharpen. Adds no detail — it only stops the softness from
    compounding when the image is placed. Reported honestly by the caller."""
    from PIL import ImageFilter

    big = rgb.resize((rgb.width * 4, rgb.height * 4), Image.LANCZOS)
    return big.filter(ImageFilter.UnsharpMask(radius=2.0, percent=55, threshold=3))


# ---------------------------------------------------------------- pipeline


def upscale_file(src: Path, dst: Path, target_w: int, backend: str,
                 binary=None, onnx=None) -> dict:
    im = Image.open(src)
    has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    im = im.convert("RGBA") if has_alpha else im.convert("RGB")

    rgb = im.convert("RGB")
    alpha = im.getchannel("A") if has_alpha else None

    if backend == "ncnn":
        big = upscale_ncnn(rgb, *binary)
    elif backend == "onnx":
        big = upscale_onnx(rgb, onnx)
    else:
        big = upscale_lanczos(rgb)

    target_h = round(target_w * im.height / im.width)
    if (big.width, big.height) != (target_w, target_h):
        big = big.resize((target_w, target_h), Image.LANCZOS)

    if alpha is not None:
        # the matte is a decision already made — resample it, never re-imagine it
        a = alpha.resize((target_w, target_h), Image.LANCZOS)
        big = big.convert("RGBA")
        big.putalpha(a)

    dst.parent.mkdir(parents=True, exist_ok=True)
    big.save(dst)
    def rel(p: Path) -> str:
        p = p.resolve()
        try:
            return str(p.relative_to(ROOT))
        except ValueError:          # a path outside the repo is reported as given
            return str(p)

    return {
        "src": rel(src),
        "out": rel(dst),
        "native": [im.width, im.height],
        "result": [big.width, big.height],
        "factor": round(target_w / im.width, 3),
        "alpha": has_alpha,
    }


def poster_dpi(native_w: int, placed_w: int) -> int:
    return round(300 * native_w / placed_w)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--athlete", help="slug under art-pipeline/out/athletes/")
    ap.add_argument("--in", dest="infile", help="a single file instead of an athlete")
    ap.add_argument("--width", type=int, help="target width for --in")
    ap.add_argument("--out", help="output directory (default print-sources/upscaled/<athlete>)")
    ap.add_argument("--poses", default="hero,action2,action3")
    ap.add_argument("--backend", default="auto", choices=["auto", "ncnn", "onnx", "lanczos"])
    ap.add_argument("--check", action="store_true", help="report what is needed, change nothing")
    args = ap.parse_args()

    binary = find_binary()
    onnx = find_onnx()
    if args.backend == "auto":
        backend = "ncnn" if binary else ("onnx" if onnx else "lanczos")
    else:
        backend = args.backend
    if backend == "ncnn" and not binary:
        print("! no ncnn upscaler with a models/ directory found", file=sys.stderr)
        return 2
    if backend == "onnx" and not onnx:
        print(f"! no .onnx model in {MODELS.relative_to(ROOT)}", file=sys.stderr)
        return 2

    jobs: list[tuple[Path, Path, int, str]] = []
    if args.infile:
        if not args.width:
            print("! --in needs --width", file=sys.stderr)
            return 2
        src = Path(args.infile)
        out = Path(args.out) if args.out else OUT
        jobs.append((src, out / src.name, args.width, src.stem))
    elif args.athlete:
        d = ATHLETES / args.athlete
        if not d.is_dir():
            print(f"! no athlete at {d.relative_to(ROOT)}", file=sys.stderr)
            return 2
        out = Path(args.out) if args.out else OUT / args.athlete
        for pose in args.poses.split(","):
            pose = pose.strip()
            src = d / f"{pose}.cutout.png"
            if not src.exists():
                print(f"  ! {pose}: no cutout — run art:cutout first", file=sys.stderr)
                continue
            need = POSTER_WIDTH.get(pose)
            if not need:
                print(f"  ! {pose}: not a poster layer, skipping", file=sys.stderr)
                continue
            jobs.append((src, out / f"{pose}.png", round(need * HEADROOM), pose))
    else:
        ap.error("give --athlete or --in")

    label = {"ncnn": f"realesrgan ({Path(binary[0]).name})" if binary else "ncnn",
             "onnx": f"onnxruntime ({onnx.name})" if onnx else "onnx",
             "lanczos": "Lanczos + unsharp — RESAMPLE ONLY, adds no detail"}[backend]
    print(f"backend: {label}")
    print(f"poster:  {POSTER_PX[0]}x{POSTER_PX[1]} @300dpi\n")

    rows, report = [], []
    for src, dst, target_w, pose in jobs:
        im = Image.open(src)
        placed = POSTER_WIDTH.get(pose, args.width or target_w)
        before, after = poster_dpi(im.width, placed), poster_dpi(target_w, placed)
        rows.append((pose, f"{im.width}x{im.height}", f"{target_w}px",
                     f"{target_w / im.width:.2f}x", f"{before} -> {after}"))
        if not args.check:
            report.append(upscale_file(src, dst, target_w, backend, binary, onnx))

    w = [max(len(str(r[i])) for r in rows) for i in range(5)]
    print(f"{'layer'.ljust(w[0])}  {'native'.ljust(w[1])}  {'target'.ljust(w[2])}  "
          f"{'factor'.ljust(w[3])}  dpi on poster")
    for r in rows:
        print(f"{r[0].ljust(w[0])}  {r[1].ljust(w[1])}  {r[2].ljust(w[2])}  "
              f"{r[3].ljust(w[3])}  {r[4]}")

    if args.check:
        print("\n--check: nothing written")
        return 0

    if backend == "lanczos":
        print("\n! Lanczos only. The pixel count is now right, the detail is not.")
        print("  Install an ncnn upscaler WITH its models directory, or drop a")
        print(f"  Real-ESRGAN .onnx into {MODELS.relative_to(ROOT)}/ and rerun.")

    manifest = (Path(args.out) if args.out else (OUT / (args.athlete or ""))) / "_upscale.json"
    manifest.parent.mkdir(parents=True, exist_ok=True)
    manifest.write_text(json.dumps(
        {"backend": backend, "posterPx": list(POSTER_PX), "files": report}, indent=2))
    try:
        shown = manifest.resolve().relative_to(ROOT)
    except ValueError:
        shown = manifest
    print(f"\nwrote {len(report)} file(s) + {shown}")
    if args.athlete and backend != "lanczos":
        print(f"\nnext: npm run art:identity -- --athlete {args.athlete} "
              f"--against {(OUT / args.athlete / 'hero.png').relative_to(ROOT)}")
        print("      an upscaler invents detail; the face must still measure as the same person")
    return 0


if __name__ == "__main__":
    sys.exit(main())
