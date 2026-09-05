"""Proportions of a standing body, from a silhouette.

WHY THIS EXISTS (2026-08-23)
The identity gate scores FACES. It is blind to the body, and for a whole evening that made
it actively misleading: attaching a full-length reference photograph made every cosine drop,
because the model was now spending attention on a frame the metric cannot see. The customer
looked at the same plates and said the body was the best yet — it had even carried over a
real tattoo on the forearm. The number said worse; the eye said better; the eye was right,
because the number was measuring the wrong thing.

So the body gets its own number. rembg gives a mask, and a standing silhouette gives ratios
that survive a change of clothing and a change of background:

    height / width of the bounding box
    shoulder width and waist width, as a fraction of height
    hip width — MEASURED BUT NOT TRUSTED, see below

WHAT IT CANNOT DO, stated plainly so nobody trusts it further than it goes: it compares
SILHOUETTES, so a different pose moves it. Measured on Order 02's own reference, where she is
walking with one arm out holding a punnet:

    hip / height      reference 0.4065   plate 0.2651     <- the arm, not the hip
    shoulder / height reference 0.2489   plate 0.2651
    waist / height    reference 0.2678   plate 0.2663

The hip row is not a measurement of her hips; it is the width of a woman with her arm out.
Shoulders and waist survive the pose and hips do not, so `deviation` in compose-plate.ts uses
only the first two. Do not add hips back without a reference photographed with arms down.

    python lib/body.py out.json <image> [<image> ...]
"""
import json
import sys
import warnings

warnings.filterwarnings("ignore")

import numpy as np
from rembg import remove, new_session

# CPU for the same reason as matte.py — CoreML hangs compiling for the Neural Engine.
session = new_session("birefnet-general", providers=["CPUExecutionProvider"])


def largest_person(alpha):
    """Keep the biggest blob in the mask and drop everything else.

    rembg masks EVERY person it finds. The one full-length photograph in Order 02 has a
    toddler holding her hand, so the silhouette was two people fused at the arm and the
    proportions were meaningless — 12-14% deviation against a reference that was partly a
    child. Cropping around the face box was not enough; the child sits close beside her.

    The adult is always the larger blob, so this needs no cleverness: label the components,
    keep the largest, and the child, the bystanders and the app's own buttons all fall away.
    """
    import cv2

    binary = (alpha > 128).astype("uint8")
    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    if n <= 1:
        return alpha
    biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return np.where(labels == biggest, alpha, 0).astype(alpha.dtype)


def widths(mask):
    """Silhouette width at each row, in pixels."""
    return (mask > 128).sum(axis=1)


def profile(path):
    import cv2

    img = cv2.imread(path)
    if img is None:
        return {"path": path, "error": "unreadable"}
    cut = remove(cv2.cvtColor(img, cv2.COLOR_BGR2RGBA), session=session)
    alpha = largest_person(np.array(cut)[:, :, 3])
    rows = widths(alpha)
    nz = np.nonzero(rows)[0]
    if nz.size < 40:
        return {"path": path, "error": "no body found"}
    top, bottom = int(nz[0]), int(nz[-1])
    h = bottom - top
    cols = np.nonzero((alpha > 128).sum(axis=0))[0]
    w = int(cols[-1] - cols[0]) if cols.size else 0

    def at(frac):
        y = top + int(h * frac)
        return float(rows[min(max(y, 0), len(rows) - 1)])

    # Shoulders sit just below the head; hips near the middle of a standing figure.
    shoulder = max(at(0.20), at(0.23), at(0.26))
    hip = max(at(0.50), at(0.53), at(0.56))
    waist = min(at(0.38), at(0.41), at(0.44))
    return {
        "path": path,
        "heightPx": h,
        "aspect": round(h / w, 3) if w else None,
        "shoulderOverHeight": round(shoulder / h, 4),
        "waistOverHeight": round(waist / h, 4),
        "hipOverHeight": round(hip / h, 4),
        "shoulderOverHip": round(shoulder / hip, 3) if hip else None,
    }


dest = sys.argv[1]
out = [profile(p) for p in sys.argv[2:]]
with open(dest, "w") as fh:
    json.dump(out, fh)
print(f"bodies -> {dest}")
