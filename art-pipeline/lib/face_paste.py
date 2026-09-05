#!/usr/bin/env python3
"""Paste an approved portrait's face onto a pose — pixels, not a model.

    .venv-matte/bin/python art-pipeline/lib/face_paste.py --src <portrait.png> --dst <pose.png> --out <png>

The owner's ask (order 4164205493): "exactly this face, no change at all". A generation can only
re-draw a face; this copies it. The five insightface landmarks (eyes, nose, mouth corners) on
both images give a similarity transform; the portrait is warped into the pose, its colour
matched to the pose's skin in Lab inside the face, and blended under a feathered ellipse that
covers forehead-to-chin and cheek-to-cheek but NOT the hair — the pose keeps its ponytail.
Angle must already match (face-angle.ts); this does not rotate a head in 3D.
"""
import argparse, sys
import numpy as np, cv2
from PIL import Image
from insightface.app import FaceAnalysis

ap = argparse.ArgumentParser(); ap.add_argument("--src", required=True); ap.add_argument("--dst", required=True)
ap.add_argument("--out", required=True); ap.add_argument("--feather", type=float, default=0.18); ap.add_argument("--scale", type=float, default=1.0)
a = ap.parse_args()

app = FaceAnalysis(providers=["CPUExecutionProvider"]); app.prepare(ctx_id=0, det_size=(640, 640))
def biggest(path):
    img = cv2.imread(path); fs = app.get(img)
    if not fs: sys.exit(f"no face in {path}")
    f = max(fs, key=lambda f: (f.bbox[2]-f.bbox[0])*(f.bbox[3]-f.bbox[1])); return img, f.kps.astype(np.float32), f.bbox
src, sk, _ = biggest(a.src); dst, dk, _ = biggest(a.dst)

# similarity transform from portrait landmarks to pose landmarks
M, _ = cv2.estimateAffinePartial2D(sk, dk, method=cv2.LMEDS)
H, W = dst.shape[:2]
warped = cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)

# face ellipse on the pose from its own landmarks: eye line, eye->mouth height, roll
eyeL, eyeR, nose, mL, mR = dk
eye_c = (eyeL + eyeR) / 2; mouth_c = (mL + mR) / 2
eye_d = np.linalg.norm(eyeR - eyeL); em = np.linalg.norm(mouth_c - eye_c)
roll = np.degrees(np.arctan2(eyeR[1]-eyeL[1], eyeR[0]-eyeL[0]))
cx, cy = eye_c + (mouth_c - eye_c) * 0.45
rx = max(eye_d, 0.95*em) * 1.05 * a.scale; ry = em * 1.55 * a.scale
mask = np.zeros((H, W), np.float32)
cv2.ellipse(mask, (int(cx), int(cy)), (int(rx), int(ry)), float(roll), 0, 360, 1.0, -1)
k = int(max(3, a.feather * 2 * ry)) | 1
mask = cv2.GaussianBlur(mask, (k, k), 0)

# colour: match the portrait's face to the pose's face in Lab, inside the mask
core = (mask > 0.6)
lab_w = cv2.cvtColor(warped, cv2.COLOR_BGR2LAB).astype(np.float32); lab_d = cv2.cvtColor(dst, cv2.COLOR_BGR2LAB).astype(np.float32)
for c in range(3):
    mw, sw = lab_w[..., c][core].mean(), lab_w[..., c][core].std() + 1e-3
    md, sd = lab_d[..., c][core].mean(), lab_d[..., c][core].std() + 1e-3
    lab_w[..., c] = (lab_w[..., c] - mw) * (sd / sw) * 0.85 + md  # 0.85: keep some of the portrait's own contrast
warped = cv2.cvtColor(np.clip(lab_w, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)

m3 = mask[..., None]
out = (warped.astype(np.float32) * m3 + dst.astype(np.float32) * (1 - m3)).astype(np.uint8)
cv2.imwrite(a.out, out)
print(f"ok {a.out}  eye_d {eye_d:.0f}px  ellipse {int(rx)}x{int(ry)} roll {roll:.1f}")
