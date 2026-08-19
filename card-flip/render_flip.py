#!/usr/bin/env python3
"""GDE card flip — frame renderer.

Renders the premium front->back card flip per the Figma motion spec
(GDE_SN_CardFlip_MotionSpec): hold front (subtle idle scale) -> ease-in
rotateY to 90deg with slight zoom -> thin foil edge moment -> ease-out to
back -> hold. 1080x1350 canvas (social 4:5), navy ground, moving shadow.

Usage: python3 render_flip.py  (expects assets/card-front.png, assets/card-back.png)
Frames go to out/frames/, then assemble with ffmpeg (see render.sh).
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ASSET_DIR = os.environ.get('FLIP_ASSETS', 'assets')
FRONT = Image.open(os.path.join(HERE, ASSET_DIR, 'card-front.png')).convert('RGBA')
BACK = Image.open(os.path.join(HERE, ASSET_DIR, 'card-back.png')).convert('RGBA')
OUT = os.path.join(HERE, 'out/frames')
os.makedirs(OUT, exist_ok=True)

W = int(os.environ.get('FLIP_W', 1080))       # canvas
H = int(os.environ.get('FLIP_H', 1350))
CARD_H = int(os.environ.get('FLIP_CARD_H', 980))  # card height at scale 1.0
FPS = 30
DUR = 5.0                  # seconds
NAVY = tuple(int(os.environ.get('FLIP_BG', '5,10,23,255').split(',')[i]) for i in range(4))
FOCAL = 2.6                # perspective strength (in card-half-width units)

card_w = int(CARD_H * FRONT.width / FRONT.height)


def ease_in(t):
    return t * t * t


def ease_out(t):
    u = 1 - t
    return 1 - u * u * u


def ease_in_out(t):
    return t * t * (3 - 2 * t)


def angle_at(t):
    """Rotation angle (deg) and scale at time t seconds."""
    if t < 1.5:                       # hold front, idle zoom 1.00 -> 1.02
        k = ease_in_out(t / 1.5)
        return 0.0, 1.0 + 0.02 * k
    if t < 2.2:                       # front -> edge
        k = ease_in((t - 1.5) / 0.7)
        return 90.0 * k, 1.02 + 0.02 * k
    if t < 2.9:                       # edge -> back
        k = ease_out((t - 2.2) / 0.7)
        return 90.0 + 90.0 * k, 1.04 - 0.04 * k
    return 180.0, 1.0                 # hold back


def find_coeffs(dst, src):
    """PIL PERSPECTIVE coeffs: map OUTPUT (dst) coords -> INPUT (src) coords."""
    A = []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    A = np.array(A, dtype=np.float64)
    b = np.array([c for p in src for c in p], dtype=np.float64)
    return np.linalg.solve(A, b)


def project_quad(angle_deg, scale):
    """Project the rotating card plane's corners onto the canvas."""
    th = math.radians(angle_deg)
    hw, hh = (card_w * scale) / 2, (CARD_H * scale) / 2
    cx, cy = W / 2, H / 2 - 20
    pts = []
    for sx, sy in [(-1, -1), (1, -1), (1, 1), (-1, 1)]:
        x3, z3 = sx * math.cos(th), sx * math.sin(th)
        persp = FOCAL / (FOCAL + z3 * 0.5)
        pts.append((cx + x3 * hw * persp, cy + sy * hh * persp))
    return pts


def render_frame(i):
    t = i / FPS
    ang, scale = angle_at(t)
    canvas = Image.new('RGBA', (W, H), NAVY)

    # soft radial glow behind the card
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([W/2-620, H/2-560, W/2+620, H/2+400], fill=(67, 99, 155, 70))
    canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(160)))

    showing_back = ang > 90
    face = BACK if showing_back else FRONT
    eff = ang - 180 if showing_back else ang   # -90..0 for back half

    # shadow squashes with the turn and slides opposite it
    sh_w = card_w * scale * abs(math.cos(math.radians(eff))) * 0.92 + 40
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    scx = W/2 - math.sin(math.radians(eff)) * 60
    sd.ellipse([scx - sh_w/2, H/2 + CARD_H*scale/2 - 6,
                scx + sh_w/2, H/2 + CARD_H*scale/2 + 74], fill=(0, 0, 0, 150))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(28)))

    if abs(abs(eff) - 90) < 1.5:
        # edge moment: thin foil sliver
        eh = int(CARD_H * scale)
        edge = Image.new('RGBA', (14, eh), (0, 0, 0, 0))
        ed = ImageDraw.Draw(edge)
        for y in range(eh):
            k = y / eh
            v = int(200 + 55 * math.sin(k * math.pi * 3))
            ed.line([(0, y), (14, y)], fill=(v, v, min(255, v + 12), 255))
        canvas.alpha_composite(edge, (W // 2 - 7, H // 2 - 20 - eh // 2))
    else:
        quad = project_quad(eff, scale)
        src = [(0, 0), (face.width, 0), (face.width, face.height), (0, face.height)]
        coeffs = find_coeffs(quad, src)
        # brightness dips slightly mid-turn (light model)
        dim = 1.0 - 0.18 * abs(math.sin(math.radians(eff)))
        f = face
        if dim < 0.999:
            f = Image.eval(face, lambda px: int(px * dim))
            f.putalpha(face.split()[-1])
        warped = f.transform((W, H), Image.PERSPECTIVE, coeffs,
                             Image.BICUBIC, fillcolor=None)
        canvas.alpha_composite(warped)

    canvas.convert('RGB').save(os.path.join(OUT, f'f{i:04d}.png'))


total = int(DUR * FPS)
for i in range(total):
    render_frame(i)
    if i % 30 == 0:
        print(f'{i}/{total}')
print('done', total, 'frames')
