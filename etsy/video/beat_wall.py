#!/usr/bin/env python3
"""WALL beat — a Veo room clip with an EMPTY black frame, the real poster composited per frame.

Why this shape (owner, 2026-09-05): Veo must never see the athlete (RAI refuses photoreal
minors; only Tui is 18) and must never draw the product (it rewrites text). So the clip is
generated with a flat matte-black plate inside the frame and the print is warped in
afterwards — the same "plate decides occlusion, art is ours" rule as the card in hand.

Detector = the 3:4 dark-opening scorer from `art-pipeline/figma/etsy-poster-in-room.py`
(shape + flatness + hangs-high), run per frame with a temporal prior: the previous quad
must be close, so a shadow or the bed never steals the frame mid-clip. Quads are then
smoothed (median over 5) because a frame-by-frame fit jitters by a pixel or two, which on a
wall reads as the print "breathing".

    python3 etsy/video/beat_wall.py <clip.mp4> <poster.png> <frames_out_dir> [--square-x 0..1]
    -> frames_out_dir/f0001.png ... (1080x1080), plus quads.npy
"""
import os, subprocess, sys, tempfile
import cv2, numpy as np
from PIL import Image

W = H = 1080

def order(p4):
    ss = p4.sum(1); dd = np.diff(p4, axis=1).ravel()
    return np.float32([p4[np.argmin(ss)], p4[np.argmin(dd)], p4[np.argmax(ss)], p4[np.argmax(dd)]])

def detect(gray, want=0.75, prior=None):
    Hh, Ww = gray.shape
    cand = []
    for thr in (35, 45, 55, 65, 80, 95):
        m = (gray < thr).astype(np.uint8) * 255
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
        cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in sorted(cnts, key=cv2.contourArea, reverse=True)[:6]:
            a = cv2.contourArea(c)
            if a < 0.015 * Hh * Ww: continue
            # true corners first (the plate is a perspective quad, not a rotated rectangle —
            # minAreaRect left dark slivers at two corners and the judge called them seams)
            quads = []
            for eps in np.arange(0.006, 0.06, 0.004):
                ap = cv2.approxPolyDP(c, eps * cv2.arcLength(c, True), True)
                if len(ap) == 4 and cv2.isContourConvex(ap):
                    quads.append(ap.reshape(4, 2).astype(np.float32)); break
            quads.append(cv2.boxPoints(cv2.minAreaRect(c)).astype(np.float32))
            for p4 in quads:
                o = order(p4)
                w_ = (np.linalg.norm(o[1] - o[0]) + np.linalg.norm(o[2] - o[3])) / 2
                h_ = (np.linalg.norm(o[3] - o[0]) + np.linalg.norm(o[2] - o[1])) / 2
                if h_ < 1: continue
                asp = w_ / h_
                if not (want * 0.84 < asp < want * 1.18): continue
                mm = np.zeros((Hh, Ww), np.uint8); cv2.fillConvexPoly(mm, o.astype(np.int32), 255)
                inner = cv2.erode(mm, np.ones((9, 9), np.uint8))
                sd = float(gray[inner > 0].std()) if (inner > 0).sum() > 500 else 99.0
                cyn = o[:, 1].mean() / Hh
                score = abs(asp - want) / want * 3.0 + sd / 22.0 - (a / (Hh * Ww)) * 3.0 + max(0.0, cyn - 0.55) * 3.0
                if prior is not None:
                    jump = float(np.abs(o - prior).mean())
                    if jump > 0.06 * Ww: continue           # temporal prior: no teleporting
                    score += jump / (0.02 * Ww)
                cand.append((score, o))
                break
    if not cand:
        return None
    cand.sort(key=lambda t: t[0])
    return cand[0][1]

def refine(gray, q):
    """Sub-pixel STRAIGHT edges: fit a line to the plate's boundary pixels along each side of
    the detected quad and intersect neighbours. A threshold mask has a jagged outline and the
    judge read it as 'jagged edges spilling over the mat'; a print has straight edges."""
    Hh, Ww = gray.shape
    poly = np.zeros((Hh, Ww), np.uint8); cv2.fillConvexPoly(poly, q.astype(np.int32), 255)
    near = cv2.dilate(poly, np.ones((21, 21), np.uint8))
    plate = ((gray < 70) & (near > 0)).astype(np.uint8) * 255
    cnts, _ = cv2.findContours(plate, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    if not cnts:
        return q
    pts = max(cnts, key=cv2.contourArea).reshape(-1, 2).astype(np.float32)
    lines = []
    for k in range(4):
        a, b = q[k], q[(k + 1) % 4]
        d = b - a; L = np.linalg.norm(d) + 1e-6; n = np.array([-d[1], d[0]]) / L
        rel = pts - a
        along = rel @ (d / L); dist = np.abs(rel @ n)
        sel = pts[(dist < 6) & (along > 0.08 * L) & (along < 0.92 * L)]
        if len(sel) < 20:
            return q
        vx, vy, x0, y0 = cv2.fitLine(sel, cv2.DIST_L2, 0, 0.01, 0.01).ravel()
        lines.append((np.array([x0, y0]), np.array([vx, vy])))
    out = []
    for k in range(4):
        p1, d1 = lines[(k - 1) % 4]; p2, d2 = lines[k]
        A = np.array([d1, -d2]).T
        if abs(np.linalg.det(A)) < 1e-6:
            return q
        t = np.linalg.solve(A, p2 - p1)
        out.append(p1 + d1 * t[0])
    return np.float32(out)

def find_coeffs(dst, src):
    A = []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    A = np.array(A, dtype=np.float64); b = np.array(src, dtype=np.float64).reshape(8)
    return np.linalg.solve(A, b)

def main():
    clip, poster_p, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
    sqx = 0.5
    for a in sys.argv[4:]:
        if a.startswith("--square-x="): sqx = float(a.split("=")[1])
    os.makedirs(outdir, exist_ok=True)
    tmp = tempfile.mkdtemp()
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", clip, "-vf", "fps=30", f"{tmp}/w%04d.png"], check=True)
    files = sorted(os.listdir(tmp))
    poster = Image.open(poster_p).convert("RGB")
    quads, prior = [], None
    frames = []
    for k, fn in enumerate(files):
        im = cv2.imread(f"{tmp}/{fn}")
        h, w = im.shape[:2]
        x0 = int(max(0, min(w - h, (w - h) * sqx)))
        sq = im[:, x0:x0 + h]
        sq = cv2.resize(sq, (W, H), interpolation=cv2.INTER_AREA)
        g = cv2.cvtColor(sq, cv2.COLOR_BGR2GRAY)
        q = detect(g, prior=prior)
        if q is None and prior is not None:
            q = prior.copy()
        if q is None:
            raise SystemExit(f"no frame opening in frame {k}")
        prior = q
        quads.append(refine(g, q)); frames.append(sq)
    quads = np.array(quads)                      # (n,4,2)
    sm = quads.copy()
    for i in range(len(quads)):
        lo, hi = max(0, i - 2), min(len(quads), i + 3)
        sm[i] = np.median(quads[lo:hi], axis=0)
    np.save(f"{outdir}/quads.npy", sm)
    pw, ph = poster.size
    for k, (sq, q) in enumerate(zip(frames, sm), 1):
        base = Image.fromarray(cv2.cvtColor(sq, cv2.COLOR_BGR2RGB))
        # straight-edged mask: the refined quad pushed 2.5 px outward (covers the plate's
        # anti-aliased rim, lands on white mat where it is invisible), 1 px feather
        c = q.mean(0); qe = c + (q - c) * 1.012
        coeffs = find_coeffs([tuple(p) for p in qe], [(0, 0), (pw, 0), (pw, ph), (0, ph)])
        warped = poster.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
        qm = []
        for p in q:
            v = p - c; qm.append(p + v / (np.linalg.norm(v) + 1e-6) * 2.5)
        m = np.zeros((H, W), np.uint8); cv2.fillConvexPoly(m, np.array(qm, np.int32), 255)
        # ... but never further than 2 px past the plate's real boundary: the straight quad
        # gives the edge its line, the plate gives it its limit (no spill onto the mat)
        gray = cv2.cvtColor(sq, cv2.COLOR_BGR2GRAY)
        near = cv2.dilate(m, np.ones((15, 15), np.uint8))
        plate = ((gray < 90) & (near > 0)).astype(np.uint8) * 255
        plate = cv2.morphologyEx(plate, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
        cn, _ = cv2.findContours(plate, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if cn:
            big = max(cn, key=cv2.contourArea); plate = np.zeros_like(plate); cv2.drawContours(plate, [big], -1, 255, -1)
        limit = cv2.dilate(plate, np.ones((5, 5), np.uint8))
        m = cv2.bitwise_and(m, limit)
        mask = Image.fromarray(cv2.GaussianBlur(m, (3, 3), 0))
        base.paste(warped, (0, 0), mask)
        base.save(f"{outdir}/f{k:04d}.png")
    print(f"{len(frames)} frames -> {outdir}; quad drift {np.abs(sm[-1]-sm[0]).max():.1f}px")

if __name__ == "__main__":
    main()
