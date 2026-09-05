# Etsy listing slide 03 · "The kid on the card" — Figma JcQvsgIRiOQtuZcP3Q8dc9, node 29:4.
# Puts the real Stadium Night basketball FRONT into the card the boy is holding.
# Run from the repo root with .venv-matte/bin/python.
import cv2, numpy as np
S = "/private/tmp/claude-501/-Users-a-Documents-sportscover/19f38435-985e-4a74-9178-8c6e3ae700c9/scratchpad/s03"
SC = 2
photo = cv2.resize(cv2.imread(S+"/raw.jpg"), (1024*SC,1024*SC), interpolation=cv2.INTER_LANCZOS4)
card  = cv2.imread("print-sources/output/tgc/GDE-SN-BKB-card-FRONT-825x1125-TGC.png")
h, w = card.shape[:2]

# --- where the card actually is -----------------------------------------------
# Corners = intersections of four edges, each fitted to the bright<->dark crossing read
# off RAW PIXEL VALUES. Eye-reading was 14-17 px out and gave the card the wrong shape.
#   L x=0.0853y+232.82  R x=0.0828y+380.58  T y=-0.0773x+446.53  B y=-0.0588x+656.49
QUAD = np.float32([[269.1,425.7],[414.9,414.5],[432.8,631.0],[287.4,639.6]])

# Measured against the boy's own fingers (44 px each, same depth as the card) the card
# is 3.3 finger-widths wide — the same ratio a real poker card shows in a real hand. It
# is NOT oversized. Shrinking was tried at 0.88 and abandoned: it means inventing the
# 10 % of shirt and wall the card used to cover, and both cv2.inpaint(TELEA) and a
# mirror-reflect fill leave a visible band. If the card must read smaller, regenerate
# the base photo with gen-etsy-shots — do not patch it here.
SHRINK = 1.0
piv  = QUAD[3].copy()
quad = ((QUAD - piv)*SHRINK + piv)*SC
quad_old = QUAD*SC

# 825x1125 is the TGC UPLOAD plate: 750x1050 trim + 37.5 px bleed. A card in a hand is
# TRIMMED, so map the trim rect and cut the same 1/8" corner radius the die does.
BLEED, RAD = 37.5, 38.0
src = np.float32([[BLEED,BLEED],[w-BLEED,BLEED],[w-BLEED,h-BLEED],[BLEED,h-BLEED]])
die = np.zeros((h,w), np.uint8)
cv2.rectangle(die, (int(BLEED+RAD),int(BLEED)), (int(w-BLEED-RAD),int(h-BLEED)), 255, -1)
cv2.rectangle(die, (int(BLEED),int(BLEED+RAD)), (int(w-BLEED),int(h-BLEED-RAD)), 255, -1)
for cx,cy in [(BLEED+RAD,BLEED+RAD),(w-BLEED-RAD,BLEED+RAD),(w-BLEED-RAD,h-BLEED-RAD),(BLEED+RAD,h-BLEED-RAD)]:
    cv2.circle(die, (int(cx),int(cy)), int(RAD), 255, -1)
def silhouette(q):
    M = cv2.getPerspectiveTransform(src, q)
    return M, (cv2.warpPerspective(die, M, (1024*SC,1024*SC), flags=cv2.INTER_LINEAR) > 127).astype(np.uint8)*255
M, mask     = silhouette(quad)
_, mask_old = silhouette(quad_old)

warp = cv2.warpPerspective(card, M, (1024*SC,1024*SC), flags=cv2.INTER_LANCZOS4)
orig = photo.astype(np.float32); new = warp.astype(np.float32)

# --- illumination transfer, as a QUADRATIC SURFACE only ------------------------
# A per-pixel or blurred ratio carries the OLD card's artwork across: the old player's
# head came back as a ghost face. A 2nd-order surface holds the room's light falloff
# and cannot draw a subject.
ys, xs = np.nonzero(mask); ys, xs = ys[::7], xs[::7]
cx0, cy0 = quad[:,0].mean(), quad[:,1].mean()
sx, sy = np.ptp(quad[:,0]) or 1, np.ptp(quad[:,1]) or 1
nx, ny = (xs-cx0)/sx, (ys-cy0)/sy
A = np.stack([np.ones_like(nx), nx, ny, nx*nx, nx*ny, ny*ny], 1)
gy, gx = np.mgrid[0:photo.shape[0], 0:photo.shape[1]]
GX, GY = (gx-cx0)/sx, (gy-cy0)/sy
B = np.stack([np.ones_like(GX), GX, GY, GX*GX, GX*GY, GY*GY], 2)
lo = cv2.GaussianBlur(orig,(0,0),10*SC); ln = cv2.GaussianBlur(new,(0,0),10*SC)
for c in range(3):
    r = np.clip((lo[ys,xs,c]+8)/(ln[ys,xs,c]+8), 0.5, 2.0)
    coef, *_ = np.linalg.lstsq(A, r, rcond=None)
    new[:,:,c] = np.clip(new[:,:,c]*np.clip(B@coef, 0.88, 1.15), 0, 255)

new = cv2.GaussianBlur(new, (0,0), 0.55*SC)
new = np.clip(new + np.random.default_rng(7).normal(0, 2.0, new.shape), 0, 255)

# --- the thumb stays in front of the card --------------------------------------
# Skin detection failed twice (the card's PRINTED player is skin-coloured, and a close
# merged his arms with the real thumb). The thumb is one shape in one photo: its top
# edge was probed per column for the dark->bright crossing, then traced.
THUMB = np.array([(230,596),(260,601),(275,604),(286,607),(290,607),(294,608),(298,609),
                  (302,610),(306,611),(310,613),(314,615),(316,616),(318,619),(321,625),
                  (321,633),(318,639),(313,647),(302,656),(285,663),(255,668),(230,668)],
                 np.float32)*SC
thumb = np.zeros(photo.shape[:2], np.uint8)
cv2.fillPoly(thumb, [THUMB.astype(np.int32)], 255)
# NOT clipped to the card: both edges are feathered, and making them coincide leaves
# alpha ~0.3 along the card's own edge, printing its silhouette across the thumb.

a = cv2.GaussianBlur(mask.astype(np.float32),(0,0),0.9*SC)/255.0
a = a*(1.0 - cv2.GaussianBlur(thumb.astype(np.float32),(0,0),1.2*SC)/255.0)
out = (new*a[:,:,None] + orig*(1-a[:,:,None])).astype(np.uint8)
cv2.imwrite(S+"/s03-composited.png", out)
print("ok  shrink=%.2f  card width px(1024) %.1f -> %.1f"
      % (SHRINK, np.hypot(*(QUAD[1]-QUAD[0])), np.hypot(*(quad[1]-quad[0]))/SC))
