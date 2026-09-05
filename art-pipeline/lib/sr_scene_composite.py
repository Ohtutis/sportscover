"""Warp ONE real export into the single blank plate of a generated scene, found by shape.

    .venv-matte/bin/python art-pipeline/lib/sr_scene_composite.py scene.png asset.png ASPECT out.png [tol]

ASPECT is the plate's width/height with width < height (poster 0.75, card 0.714, phone
wallpaper 0.46, a 16:9 monitor 0.5625 — the finder always reports the short side over the
long side). Same plate rule as sr_sport_scenes.py: flat AND dark is the plate, the quad is a
minimum-area rectangle, plates_composite.py carries occlusion and illumination.
"""
import json, subprocess, sys
from pathlib import Path
import cv2
sys.path.insert(0, str(Path(__file__).resolve().parent))
from sr_sport_scenes import plates  # noqa: E402

scene, asset, aspect, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
tol = float(sys.argv[5]) if len(sys.argv) > 5 else 0.12
img = cv2.imread(scene)
found = plates(img, aspect, tol, 0.01, 0.6)
if not found:
    sys.exit(f"no plate of aspect {aspect} in {scene}")
found.sort(key=lambda r: -abs((r["quad"][4]-r["quad"][0])*(r["quad"][5]-r["quad"][1])))
spec = Path(out).with_suffix(".spec.json")
spec.write_text(json.dumps([{"asset": asset, "quad": found[0]["quad"]}]))
subprocess.run([sys.executable, str(Path(__file__).resolve().parent / "plates_composite.py"), scene, out, str(spec)], check=True)
print("wrote", out, "plate", [round(v) for v in found[0]["quad"]])
