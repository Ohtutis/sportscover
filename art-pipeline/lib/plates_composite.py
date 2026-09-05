"""Warp real exports into the BLANK BLACK plates of a generated scene.

    .venv-matte/bin/python lib/plates_composite.py scene.png out.png spec.json

`spec.json` is a list of {"asset": path, "quad": [x,y, x,y, x,y, x,y]} in scene pixels,
corners in any order. Same principle as card_in_hand.py and for the same reason: the
model draws card ART well and card TYPE badly, so the plate is generated matte black and
the real file is warped in here, where every glyph is ours.

Two things this adds over a plain warp:

* OCCLUSION comes from the photograph, not from a guess. Inside the quad, the pixels that
  are dark AND flat ARE the plate; anything else (a thumb, a strand of hair, a jacket
  cuff) is in front of it and must stay in front. That is the mask a retoucher would have
  pulled by hand.
* ILLUMINATION is carried across. The plate is lit by the room, so the warped art is
  multiplied by the plate's own luminance normalised to its mean — a flat plate leaves the
  art alone, a plate with light falling across it keeps that falloff.
"""
import json
import os
import sys

import cv2
import numpy as np


def order_quad(p):
    s, d = p.sum(1), np.diff(p, axis=1).ravel()
    return np.float32([p[np.argmin(s)], p[np.argmin(d)], p[np.argmax(s)], p[np.argmax(d)]])


def plate_mask(gray, quad, dark=95, flat=9.0):
    """Inside the quad: the flat dark pixels are the plate; everything else is in front."""
    h, w = gray.shape
    poly = np.zeros((h, w), np.uint8)
    cv2.fillConvexPoly(poly, quad.astype(np.int32), 255)
    g = gray.astype(np.float32)
    mean = cv2.blur(g, (9, 9))
    std = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mean * mean, 0))
    m = ((g < dark) & (std < flat)).astype(np.uint8) * 255
    m = cv2.bitwise_and(m, poly)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    return m, poly


def main():
    scene_p, out_p, spec_p = sys.argv[1], sys.argv[2], sys.argv[3]
    scene = cv2.imread(scene_p)
    gray = cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY)
    out = scene.copy()
    report = []
    for item in json.load(open(spec_p)):
        art = cv2.imread(item["asset"], cv2.IMREAD_COLOR)
        quad = order_quad(np.float32(item["quad"]).reshape(4, 2))
        # optional geometry tweaks: "expand" scales the quad about its centroid (1.04 = 4% larger)
        if item.get("expand"):
            c = quad.mean(0, keepdims=True)
            quad = (c + (quad - c) * float(item["expand"])).astype(np.float32)
        ah, aw = art.shape[:2]
        M = cv2.getPerspectiveTransform(
            np.float32([[0, 0], [aw, 0], [aw, ah], [0, ah]]), quad)
        warped = cv2.warpPerspective(art, M, (scene.shape[1], scene.shape[0]))

        m, poly = plate_mask(gray, quad)
        # "mask": "quad" (or PLATES_MASK=quad) pastes the WHOLE quad: for a plate nothing stands in
        # front of, the flat-dark mask only adds the plate's rounded corners and its edge wobble to
        # a square-cut print (README section 50: card = rect - hand, never card = plate).
        if item.get("mask", os.environ.get("PLATES_MASK", "plate")) == "quad":
            m = poly.copy()
        cover = float((m > 0).sum()) / max(1.0, float((poly > 0).sum()))

        # the room's light, carried onto the art
        lum = cv2.GaussianBlur(gray.astype(np.float32), (0, 0), 25)
        inside = lum[m > 0]
        if inside.size:
            ratio = np.clip(lum / max(1e-6, float(inside.mean())), 0.75, 1.35)[..., None]
            warped = np.clip(warped.astype(np.float32) * ratio, 0, 255).astype(np.uint8)

        a = cv2.GaussianBlur(m.astype(np.float32) / 255.0, (0, 0), 1.1)[..., None]
        out = (warped.astype(np.float32) * a + out.astype(np.float32) * (1 - a)).astype(np.uint8)
        report.append({"asset": item["asset"].split("/")[-1], "plate_cover": round(cover, 3)})
    cv2.imwrite(out_p, out)
    for r in report:
        print(f"  {r['asset']:22s} plate covered {r['plate_cover']:.1%} of the quad")
    print(f"wrote {out_p}")


if __name__ == "__main__":
    main()
