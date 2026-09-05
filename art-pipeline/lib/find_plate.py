"""Find the blank black plate(s) in a generated scene and print their quads.

    .venv-matte/bin/python lib/find_plate.py scene.png [n]

Reading quads off a coordinate grid by eye is how the hands came out wrong last time; the
plate is by construction the only flat near-black region, so measure it instead. Prints
JSON quads (x,y clockwise from top-left) and the fill ratio of each detection.
"""
import json
import sys

import cv2
import numpy as np

img = cv2.imread(sys.argv[1])
want = int(sys.argv[2]) if len(sys.argv) > 3 else 1
g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
mean = cv2.blur(g, (11, 11))
std = np.sqrt(np.maximum(cv2.blur(g * g, (11, 11)) - mean * mean, 0))
m = (((g < 70) & (std < 12)).astype(np.uint8)) * 255
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))
n, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
order = sorted(range(1, n), key=lambda i: -stats[i, cv2.CC_STAT_AREA])
out = []
for i in order[:want]:
    comp = (lab == i).astype(np.uint8) * 255
    area = stats[i, cv2.CC_STAT_AREA]
    if area < img.shape[0] * img.shape[1] * 0.01:
        continue
    cnt = max(cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0], key=cv2.contourArea)
    peri = cv2.arcLength(cnt, True)
    quad = None
    for k in range(1, 40):
        ap = cv2.approxPolyDP(cnt, 0.002 * k * peri, True)
        if len(ap) == 4:
            quad = ap.reshape(4, 2)
            break
    if quad is None:
        box = cv2.boxPoints(cv2.minAreaRect(cnt))
        quad = box.astype(int)
    p = quad.astype(np.float32)
    s, d = p.sum(1), np.diff(p, axis=1).ravel()
    ordered = [p[np.argmin(s)], p[np.argmin(d)], p[np.argmax(s)], p[np.argmax(d)]]
    w = (np.linalg.norm(ordered[1] - ordered[0]) + np.linalg.norm(ordered[2] - ordered[3])) / 2
    h = (np.linalg.norm(ordered[3] - ordered[0]) + np.linalg.norm(ordered[2] - ordered[1])) / 2
    out.append({
        "quad": [round(float(v), 1) for pt in ordered for v in pt],
        "aspect": round(float(w / h), 3),
        "fill": round(float(area / cv2.contourArea(quad.astype(np.float32))), 3),
    })
print(json.dumps(out, indent=1))
