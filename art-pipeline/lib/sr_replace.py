"""Re-place every real export in one Senior Night scene set, on MEASURED plate corners.

    .venv-matte/bin/python art-pipeline/lib/sr_replace.py <scene-dir> [names...]

The plate is a perspective QUADRILATERAL, not a rotated rectangle (`sr_quad.quad4`): a card
warped into a minAreaRect sits square inside a holder that recedes, and reads as pasted on.
Cards and posters paste their whole quad -- a square-cut print has no rounded corners and the
plate's own wobble must not be cut into it. The phone keeps the plate mask, because a real
screen does have rounded corners and fingers cross it.
"""
import json, os, subprocess, sys
from pathlib import Path
import cv2, numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parent))
from sr_quad import quad4  # noqa: E402

HERE = Path(__file__).resolve().parent
PY_ = sys.executable
D = Path(sys.argv[1]); SRC = D / "src"
ONLY = sys.argv[2:]
LIST = Path("etsy/listing-images/03-senior-night/src")
CODE = {"senior-night": "ftb", "senior-night-volleyball": "vlb", "senior-night-cheerleading": "chr",
        "senior-night-soccer": "soc", "senior-night-baseball": "bsb"}[D.name]
SPORT = {"ftb": "football", "vlb": "volleyball", "chr": "cheerleading", "soc": "soccer", "bsb": "baseball"}[CODE]


def rect_quad(path, thr, lo, hi, minfrac=0.01):
    """Fallback for a plate whose corners cannot be traced (upright phone screen)."""
    img = cv2.imread(str(path)); g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    m = (g < thr).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((21, 21), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8); best = None
    for i in range(1, n):
        a = st[i, cv2.CC_STAT_AREA]
        if a < g.size * minfrac: continue
        cnt = max(cv2.findContours((lab == i).astype(np.uint8) * 255, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0], key=cv2.contourArea)
        (cx, cy), (w, h), ang = cv2.minAreaRect(cnt)
        if min(w, h) < 1: continue
        ar = min(w, h) / max(w, h)
        if not (lo <= ar <= hi) or a / (w * h) < 0.85: continue
        if best is None or a > best[0]: best = (a, cv2.boxPoints(((cx, cy), (w, h), ang)).ravel().tolist(), ar)
    return best


def sides(q):
    p = np.float32(q).reshape(4, 2)
    top = np.linalg.norm(p[1] - p[0]); bot = np.linalg.norm(p[2] - p[3])
    left = np.linalg.norm(p[3] - p[0]); right = np.linalg.norm(p[2] - p[1])
    return (top + bot) / 2, (left + right) / 2


def crop_to(src, out, aspect_wh):
    im = cv2.imread(str(src)); h, w = im.shape[:2]
    if w / h > aspect_wh:
        nw = int(round(h * aspect_wh)); x = (w - nw) // 2; im = im[:, x:x + nw]
    else:
        nh = int(round(w / aspect_wh)); y = (h - nh) // 2; im = im[y:y + nh]
    cv2.imwrite(str(out), im); return out


def compose(scene, items, out):
    sp = D / f"{out}.spec.json"; sp.write_text(json.dumps(items))
    subprocess.run([PY_, str(HERE / "plates_composite.py"), str(D / f"{scene}.png"), str(D / f"{out}.png"), str(sp)], check=True)


def want(n): return not ONLY or n in ONLY


def find(scene, dark=70, flat=10, near_spec=None, label=""):
    img = cv2.imread(str(D / f"{scene}.png"))
    near = json.loads((D / near_spec).read_text())[0]["quad"] if near_spec and (D / near_spec).exists() else None
    q = quad4(img, dark, flat, near)
    print(f"  {label or scene:16s}", "corners", [round(v) for v in q] if q else "NONE")
    return q


card = str(SRC / "card-front.png")
poster = str(SRC / "poster.png")

if want("card-in-case") and (D / "card-in-case.png").exists():
    q = find("card-in-case")
    compose("card-in-case", [{"asset": card, "quad": q, "mask": "quad", "expand": 1.012}], "card-in-case-composited")
if want("card-on-desk") and (D / "card-on-desk.png").exists():
    q = find("card-on-desk")
    compose("card-on-desk", [{"asset": card, "quad": q, "mask": "quad", "expand": 1.008}], "card-on-desk-composited")
if want("poster-on-wall") and (D / "poster-on-wall.png").exists():
    q = find("poster-on-wall")
    compose("poster-on-wall", [{"asset": poster, "quad": q, "mask": "quad"}], "poster-on-wall-composited")
if want("gift") and (D / f"gift-{SPORT}.png").exists():
    # The framed poster is found by SHAPE, never from the saved spec: a night sky in the corner
    # of the baseball scene is flat, dark and poster-shaped too, and it once won on area alone.
    # A frame someone is holding never runs off the edge of the photograph.
    from sr_sport_scenes import plates as _plates
    img = cv2.imread(str(D / f"gift-{SPORT}.png")); H, W = img.shape[:2]
    cands = [f["quad"] for f in _plates(img, 0.75, 0.2, 0.01, 0.6)]
    inner = [c for c in cands if min(c[0::2]) > 8 and min(c[1::2]) > 8 and max(c[0::2]) < W - 8 and max(c[1::2]) < H - 8]
    if not inner:
        sys.exit(f"gift-{SPORT}: no framed poster away from the edges")
    inner.sort(key=lambda c: -(max(c[0::2]) - min(c[0::2])) * (max(c[1::2]) - min(c[1::2])))
    q = quad4(img, 70, 10, inner[0]) or inner[0]
    print("  gift             corners", [round(v) for v in q], f"({len(cands)} plate candidates, {len(inner)} inside the frame)")
    compose(f"gift-{SPORT}", [{"asset": poster, "quad": q, "mask": "quad"}], f"gift-{SPORT}-composited")
if want("phone-in-hand") and (D / "phone-in-hand.png").exists():
    wp = SRC / "wall-phone.png"
    if not wp.exists(): wp = LIST / f"{CODE}-sr-wall-phone.png"
    b = rect_quad(D / "phone-in-hand.png", 45, 0.40, 0.56)
    print("  phone            corners", [round(v) for v in b[1]], "(rectangle: an upright screen)")
    fit = crop_to(wp, SRC / "wall-phone-fit.png", b[2])
    compose("phone-in-hand", [{"asset": str(fit), "quad": b[1], "mask": "plate"}], "phone-in-hand-composited")
if want("desk-monitor") and (D / "desk-monitor.png").exists():
    wd = SRC / "wall-desktop.png"
    if not wd.exists(): wd = LIST / f"{CODE}-sr-wall-desktop.png"
    q = find("desk-monitor", dark=60, label="monitor")
    w, h = sides(q)
    fit = crop_to(wd, SRC / "wall-desktop-fit.png", w / h)
    compose("desk-monitor", [{"asset": str(fit), "quad": q, "mask": "quad"}], "desk-monitor-composited")
if want("team-order") and (D / "team-order.png").exists():
    # the poster plate, then the card stacks, then the sheets under the top poster
    sys.path.insert(0, str(HERE))
    os.environ.setdefault("SR_SCENES_DIR", str(D))
    import importlib, sr_sport_scenes as S
    importlib.reload(S)
    img = cv2.imread(str(D / "team-order.png"))
    q = find("team-order", label="team poster")
    staged = S.paint_stack(img, q, poster)
    cv2.imwrite(str(D / "team-order-staged.png"), staged)
    items = [{"asset": poster, "quad": q, "mask": "quad"}]
    for st in S.card_stacks(img):
        items.append({"asset": card, "quad": st, "mask": "quad"})
    print(f"  team-order       poster 1 + card stacks {len(items) - 1}")
    compose("team-order-staged", items, "team-order-staged-composited")
