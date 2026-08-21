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
                # Normalised, so a dot product IS the cosine similarity.
                "embedding": (f.normed_embedding / np.linalg.norm(f.normed_embedding)).tolist(),
            }
            for f in sorted(faces, key=lambda f: -(f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
        ],
    })

with open(dest, "w") as fh:
    json.dump(out, fh)
print(f"faces -> {dest}")
