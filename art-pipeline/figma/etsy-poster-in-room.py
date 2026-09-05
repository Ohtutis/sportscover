# Warp a real GDE poster into the EMPTY black frame of a generated room photograph.
#   .venv-matte/bin/python art-pipeline/figma/etsy-poster-in-room.py <room.png> <poster.png> <out.png>
# The frame interior is generated flat black on a lit wall, so unlike the card-in-hand shot
# the quad IS reliably detectable — but the result is still checked by eye, and the printed
# aspect is reported so a badly-shaped opening is caught instead of silently distorting art.
import sys, cv2, numpy as np

room_p, poster_p, out_p = sys.argv[1], sys.argv[2], sys.argv[3]
# optional 4th arg: the expected aspect of the opening. A poster frame is 0.750, but the same
# routine drops a wallpaper onto a monitor (1.778) or a social post onto a phone (0.462).
WANT = float(sys.argv[4]) if len(sys.argv) > 4 else 0.750
BRIGHT = len(sys.argv) > 5 and sys.argv[5] == 'bright'   # screen generated white, not black
# Optional --region x0,y0,x1,y1 in the ROOM image's own pixels. The scorer rewards area, so a
# big dark object beats a small frame: cheerleading's desk chair (aspect 0.852, 8 % of the
# picture) won over the frame opening and the poster was pasted across the whole room. When a
# room has one of those, say where the frame is instead of re-tuning a scorer that six other
# rooms already depend on.
REGION = None
for _a in sys.argv[1:]:
    if _a.startswith('--region='):
        REGION = [float(v) for v in _a.split('=', 1)[1].split(',')]
SC = 2
room = cv2.imread(room_p)
room = cv2.resize(room, (room.shape[1]*SC, room.shape[0]*SC), interpolation=cv2.INTER_LANCZOS4)
poster = cv2.imread(poster_p)
H, W = room.shape[:2]

g = cv2.cvtColor(room, cv2.COLOR_BGR2GRAY)
# Collect EVERY dark convex quad, then choose by shape, not by "first found". A TV, a window
# or a shadowed wall is also dark; what separates the frame opening is that it is 3:4. Taking
# the first/largest dark blob put the poster on a television in three rooms out of six.
cand = []
for thr in ((235, 225, 215, 200, 185, 170) if BRIGHT else (35, 45, 55, 65, 80, 95)):
    m = ((g > thr) if BRIGHT else (g < thr)).astype(np.uint8)*255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9*SC,9*SC), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN,  np.ones((7*SC,7*SC), np.uint8))
    cnts,_ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in sorted(cnts, key=cv2.contourArea, reverse=True)[:6]:
        a = cv2.contourArea(c)
        if a < 0.02*H*W: continue
        # A phone screen has big corner radii, so approxPolyDP never returns 4 points for it.
        # minAreaRect does, and a screen really is a rectangle — so offer both as candidates.
        quads = []
        box = cv2.boxPoints(cv2.minAreaRect(c))
        quads.append(box.astype(np.float32))
        for eps in np.arange(0.008, 0.06, 0.004):
            ap = cv2.approxPolyDP(c, eps*cv2.arcLength(c, True), True)
            if len(ap) == 4 and cv2.isContourConvex(ap):
                quads.append(ap.reshape(4,2).astype(np.float32))
                break
        for p4 in quads:
            if True:
                ss = p4.sum(1); dd = np.diff(p4, axis=1).ravel()
                o = np.float32([p4[np.argmin(ss)], p4[np.argmin(dd)], p4[np.argmax(ss)], p4[np.argmax(dd)]])
                w_ = (np.linalg.norm(o[1]-o[0]) + np.linalg.norm(o[2]-o[3]))/2
                h_ = (np.linalg.norm(o[3]-o[0]) + np.linalg.norm(o[2]-o[1]))/2
                if h_ < 1: continue
                asp = w_/h_
                if not (WANT*0.86 < asp < WANT*1.16): continue   # tight: a poster on the wall behind a phone is 0.56 vs the screen's 0.46
                # an EMPTY frame is not just 3:4 and dark — it is FLAT. A poster lying on a
                # desk, a window or a TV all passed the shape test; interior variance is what
                # actually separates "nothing printed here yet" from "something is there".
                mm = np.zeros((H,W), np.uint8); cv2.fillConvexPoly(mm, o.astype(np.int32), 255)
                inner = cv2.erode(mm, np.ones((9*SC,9*SC), np.uint8))
                sd = float(g[inner>0].std()) if (inner>0).sum() > 500 else 99.0
                # and it HANGS: a frame on a wall sits high in the picture, a poster lying on
                # a desk sits low. Without this the Prism Rush room printed onto the desk twice.
                cyn = o[:,1].mean()/H
                if REGION is not None:
                    qx, qy = o[:,0].mean()/SC, o[:,1].mean()/SC
                    if not (REGION[0] <= qx <= REGION[2] and REGION[1] <= qy <= REGION[3]): continue
                score = abs(asp-WANT)/WANT*3.0 + sd/22.0 - (a/(H*W))*3.0 + max(0.0, cyn-0.55)*3.0
                cand.append((score, asp, a, o))
                break
if not cand:
    raise SystemExit("no 3:4 frame opening found in " + room_p)
cand.sort(key=lambda t: t[0])
best = (cand[0][2], cand[0][3])

q = best[1]
s = q.sum(1); d = np.diff(q, axis=1).ravel()
quad = np.float32([q[np.argmin(s)], q[np.argmin(d)], q[np.argmax(s)], q[np.argmax(d)]])  # TL TR BR BL
wid = (np.linalg.norm(quad[1]-quad[0]) + np.linalg.norm(quad[2]-quad[3]))/2
hei = (np.linalg.norm(quad[3]-quad[0]) + np.linalg.norm(quad[2]-quad[1]))/2
print("%-22s opening %.0fx%.0f  aspect %.3f (want %.3f)" % (room_p.split('/')[-1], wid, hei, wid/hei, WANT))

ph, pw = poster.shape[:2]
M = cv2.getPerspectiveTransform(np.float32([[0,0],[pw,0],[pw,ph],[0,ph]]), quad)
warp = cv2.warpPerspective(poster, M, (W,H), flags=cv2.INTER_LANCZOS4)
mask = np.zeros((H,W), np.uint8)
cv2.fillConvexPoly(mask, quad.astype(np.int32), 255)

# carry the room's own light across the print: a quadratic surface only, never a blurred
# ratio — that would drag the frame's own shading into the artwork.
orig = room.astype(np.float32); new = warp.astype(np.float32)
ys, xs = np.nonzero(mask); ys, xs = ys[::7], xs[::7]
cx, cy = quad[:,0].mean(), quad[:,1].mean()
sx, sy = np.ptp(quad[:,0]) or 1, np.ptp(quad[:,1]) or 1
nx, ny = (xs-cx)/sx, (ys-cy)/sy
A = np.stack([np.ones_like(nx), nx, ny, nx*nx, nx*ny, ny*ny], 1)
gy, gx = np.mgrid[0:H, 0:W]
GX, GY = (gx-cx)/sx, (gy-cy)/sy
B = np.stack([np.ones_like(GX), GX, GY, GX*GX, GX*GY, GY*GY], 2)
lo = cv2.GaussianBlur(orig,(0,0),12*SC); ln = cv2.GaussianBlur(new,(0,0),12*SC)
for c in range(3):
    r = np.clip((lo[ys,xs,c]+10)/(ln[ys,xs,c]+10), 0.45, 1.8)
    coef, *_ = np.linalg.lstsq(A, r, rcond=None)
    new[:,:,c] = np.clip(new[:,:,c]*np.clip(B@coef, 0.72, 1.18), 0, 255)

# a faint diagonal sheen so it reads as glass, not a sticker
sheen = np.clip(((gx*0.6 + gy*0.8)/ (W*0.6 + H*0.8) - 0.18)*2.2, 0, 1)**2 * 26
new = np.clip(new + sheen[:,:,None], 0, 255)
new = cv2.GaussianBlur(new, (0,0), 0.5*SC)
new = np.clip(new + np.random.default_rng(11).normal(0, 1.8, new.shape), 0, 255)

a = (cv2.GaussianBlur(mask.astype(np.float32), (0,0), 0.9*SC)/255.0)[:,:,None]
out = (new*a + orig*(1-a)).astype(np.uint8)
cv2.imwrite(out_p, out)
print("   ->", out_p)
