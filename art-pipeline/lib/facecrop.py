"""Crop a photograph to a target aspect WITHOUT cutting the face off.

    python lib/facecrop.py <faces.json> <src.png> <dstW> <dstH> <out.png>

Figma's IMAGE fill with scaleMode FILL crops from the CENTRE of the picture. Parents'
photographs almost never put the face in the centre — the football intake set has the face
in the upper third of a 3:4 frame — so a centre crop into a 380x389 square beheads the
athlete. Every Etsy listing slide that shows a "photo you send" hits this.

So the crop is decided here, before the upload, off the ArcFace boxes that lib/face.py
already writes: the crop window is the largest window of the target aspect that fits, moved
so the face CENTRE sits at 38 % of its height and at its horizontal centre, then clamped
back inside the picture. With no face found it falls back to a centre crop, which is the
old behaviour and no worse.

`faces.json` is whatever `lib/face.py` wrote; the entry is matched by path suffix, so one
faces.json can serve a whole batch.
"""
import json
import sys

from PIL import Image

FACE_AT = 0.38  # where the face centre sits down the cropped frame


def face_box(faces_json, src):
    data = json.load(open(faces_json))
    entries = data if isinstance(data, list) else data.get("images", data)
    tail = src.split("/")[-1]
    for e in entries:
        if str(e.get("path", "")).endswith(tail):
            fs = sorted(e.get("faces", []), key=lambda f: -f.get("det_score", 0))
            return fs[0]["bbox"] if fs else None
    return None


def crop(src, dst_w, dst_h, out, faces_json=None):
    im = Image.open(src).convert("RGB")
    W, H = im.size
    target = dst_w / dst_h

    # Largest window of the target aspect that fits inside the picture.
    if W / H > target:
        cw, ch = int(round(H * target)), H
    else:
        cw, ch = W, int(round(W / target))

    bbox = face_box(faces_json, src) if faces_json else None
    if bbox:
        fx = (bbox[0] + bbox[2]) / 2
        fy = (bbox[1] + bbox[3]) / 2
        x = int(round(fx - cw / 2))
        y = int(round(fy - ch * FACE_AT))
    else:
        x = (W - cw) // 2
        y = (H - ch) // 2

    x = max(0, min(x, W - cw))
    y = max(0, min(y, H - ch))

    im.crop((x, y, x + cw, y + ch)).resize((dst_w, dst_h), Image.LANCZOS).save(out)
    return out, (x, y, cw, ch), bool(bbox)


if __name__ == "__main__":
    faces_json, src, w, h, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
    _, win, had_face = crop(src, w, h, out, faces_json if faces_json != "-" else None)
    print(f"{src} -> {out} window={win} face={'yes' if had_face else 'CENTRE FALLBACK'}")
