"""Face embeddings — the numeric half of the identity check.

Called by identity-gate.ts and intake.ts:

    python lib/face.py <out.json> <image> [<image> ...]

It WRITES the result to <out.json> rather than printing it. insightface prints its own
provider diagnostics to stdout — including bracketed lists — so anything parsing stdout as
JSON picks up the diagnostics instead. Learned the hard way; do not "simplify" this back to
printing.

Result: one entry per input image, each with every face found, its bounding box, its
detection score and its 512-d ArcFace embedding.

WHY THIS EXISTS AT ALL
The vision judge in check-athlete.ts answers `identity_match`, and on the ice-hockey pilot
that same judge FAILED a frame and then PASSED the byte-identical file on the next run. A
model is not stable on questions that have a formula, and "is this the same face" has one:
cosine distance between ArcFace embeddings. For the demo roster the judge is good enough.
For a paid order — a parent buying a poster of their own child — "looks similar" is not an
answer anyone should accept, so the gate is arithmetic.

Provider is pinned to CPU for the same reason as matte.py: onnxruntime here offers CoreML
first and hangs forever compiling for the Neural Engine. See the note in that file.

First run downloads the buffalo_l pack (~300 MB) to ~/.insightface/.
"""
import json
import sys
import warnings

warnings.filterwarnings("ignore")

import numpy as np
from insightface.app import FaceAnalysis

def eye_ratio(img, face):
    """How dark the eyes are relative to the rest of the face.

    Sunglasses are the one occlusion that ArcFace does not report as an occlusion: it
    returns a confident detection and a perfectly good embedding, just of a face whose most
    identity-critical feature is missing. Downstream that shows up as "this is a different
    person" (0.57 against the set's 0.80) and the customer is told to check for a sibling
    who was never there.

    So it is measured instead. A patch on each eye landmark against the mean of the whole
    face box: bare eyes sit a little under the face mean, a dark lens sits far under it.
    """
    import cv2
    import numpy as np

    if face.kps is None or len(face.kps) < 2:
        return None
    x0, y0, x1, y1 = [int(v) for v in face.bbox]
    x0, y0 = max(x0, 0), max(y0, 0)
    x1, y1 = min(x1, img.shape[1]), min(y1, img.shape[0])
    if x1 - x0 < 20 or y1 - y0 < 20:
        return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    face_mean = float(gray[y0:y1, x0:x1].mean())
    if face_mean <= 1:
        return None
    r = max(3, int((x1 - x0) * 0.11))
    patches = []
    for (ex, ey) in face.kps[:2]:
        ex, ey = int(ex), int(ey)
        patch = gray[max(ey - r, 0):ey + r, max(ex - r, 0):ex + r]
        if patch.size:
            patches.append(float(patch.mean()))
    if not patches:
        return None
    return float(np.mean(patches) / face_mean)


def roll_deg(face):
    """How far the eye line is off horizontal, in degrees.

    A phone photograph taken in portrait and saved without an orientation tag arrives
    sideways. insightface still finds the face — it is tolerant of that — so nothing in the
    pipeline complained, and the identity plate would have been built from photographs lying
    on their side. Three of Order 02's four were like this, and Order 01 had one.

    The eye line answers it with no model involved: upright is ~0 degrees, a quarter turn is
    ~+-90.
    """
    import math

    if face.kps is None or len(face.kps) < 2:
        return None
    (lx, ly), (rx, ry) = face.kps[0], face.kps[1]
    return float(math.degrees(math.atan2(ry - ly, rx - lx)))


def sharpness(img, face):
    """How much DETAIL the face actually carries, not how many pixels it spans.

    intake measures a face in pixels across and stops there, so a 935 px face photographed
    softly passes while a 400 px sharp one would too — and they are not the same anchor.
    Measured on the two real orders, over the photographs each set actually used:

        Order 01  206  114   25   19     -> best plate 0.886
        Order 02   16   11    6    3     -> best plate 0.784

    Thirteen times apart at the top of each set, with no overlap. Every other quantity tried
    on the same photographs — clipping, side lighting, brightness — separated them by nothing.
    Variance of the Laplacian over the face crop, divided by face width so a bigger face does
    not win for being bigger.
    """
    import cv2

    x0, y0, x1, y1 = [int(v) for v in face.bbox]
    x0, y0 = max(x0, 0), max(y0, 0)
    x1, y1 = min(x1, img.shape[1]), min(y1, img.shape[0])
    if x1 - x0 < 20 or y1 - y0 < 20:
        return None
    crop = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(crop, cv2.CV_64F).var() / max(1.0, (x1 - x0) / 200.0))


app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
app.prepare(ctx_id=-1, det_size=(640, 640))

dest = sys.argv[1]

out = []
for path in sys.argv[2:]:
    import cv2

    img = cv2.imread(path)
    if img is None:
        out.append({"path": path, "error": "unreadable"})
        continue
    faces = app.get(img)
    out.append({
        "path": path,
        "height": int(img.shape[0]),
        "width": int(img.shape[1]),
        "faces": [
            {
                "bbox": [float(v) for v in f.bbox],
                "score": float(f.det_score),
                # Five landmarks: both eyes, nose, both mouth corners. Where the nose sits
                # between the eyes tells you which way the head is turned, which is how
                # orient.ts decides a facing deterministically instead of asking for one.
                "kps": [[float(x), float(y)] for x, y in f.kps] if f.kps is not None else [],
                # <1 means the eyes are darker than the face around them; a dark lens is far
                # under. See eye_ratio() above.
                "eyeRatio": eye_ratio(img, f),
                # Degrees off horizontal; ~+-90 means the photo is lying on its side.
                "roll": roll_deg(f),
                # Detail in the face crop. See sharpness() — this is the quantity that
                # predicted which order produced a usable plate.
                "sharpness": sharpness(img, f),
                # Normalised, so a dot product IS the cosine similarity.
                "embedding": (f.normed_embedding / np.linalg.norm(f.normed_embedding)).tolist(),
            }
            for f in sorted(faces, key=lambda f: -(f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
        ],
    })

with open(dest, "w") as fh:
    json.dump(out, fh)
print(f"faces -> {dest}")
