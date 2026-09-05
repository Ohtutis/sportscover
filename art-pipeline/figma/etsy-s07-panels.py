# Etsy listing slide 07 · "Every year, the same kid" — Figma JcQvsgIRiOQtuZcP3Q8dc9, node 19:165.
# Run from the repo root with .venv-matte/bin/python. backdrop first, then panels.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W="art-pipeline/out/etsy-shots/07-age-row"

PW,PH = 638,1960
FEETY = 1822      # one floor line for all five
PXCM  = 9.70      # panel px per cm of real standing height
AGES  = ['07','10','22','32','50']
BALL  = {'07':(1014,2204,173),'10':(1012,2270,180),'22':(680,2206,138),
         '32':(1000,2270,140),'50':(810,2270,166)}
CM    = {'07':122,'10':138,'22':168,'32':178,'50':165}
# age 50's leading shoe is hidden behind the ball — the mask's lowest body pixel
# is her sock, not her foot. Floor level for her is the ball's own contact point.
FEET_OVERRIDE = {'50':2400}

backdrop = Image.open(W+"/backdrop.png").convert("RGB")
rep=[]
for slug in AGES:
    cut = Image.open("art-pipeline/out/athletes/soccer-age-%s/hero.cutout.png"%slug).convert("RGBA")
    A = np.array(cut.split()[-1]); m = A > 12
    ys,xs = np.where(m); head = ys.min(); u_l,u_r = xs.min(), xs.max()+1
    bx,by,br = BALL[slug]
    yy,xx = np.mgrid[0:m.shape[0],0:m.shape[1]]
    body = m & ~((xx-bx)**2+(yy-by)**2 <= (br+14)**2)
    bys,bxs = np.where(body)
    feet = FEET_OVERRIDE.get(slug, bys.max()+1)
    b_l,b_r = bxs.min(), bxs.max()+1

    s  = CM[slug]*PXCM/(feet-head)
    fig = cut.resize((int(round(cut.width*s)), int(round(cut.height*s))), Image.LANCZOS)
    ox = int(round(PW/2 - (u_l+u_r)/2*s))
    oy = int(round(FEETY - feet*s))
    bally = (by+br)*s+oy

    panel = backdrop.copy()
    sh = Image.new("L",(PW,PH),0); d = ImageDraw.Draw(sh)
    bcx, bw = bx*s+ox, 2*br*s*1.12; bh = bw*0.22
    d.ellipse([bcx-bw/2, bally-bh*0.62, bcx+bw/2, bally+bh*0.38], fill=140)
    fl,fr = b_l*s+ox, b_r*s+ox
    fw = max(70,(fr-fl)*0.78); fh = fw*0.16; fcx = (fl+fr)/2
    d.ellipse([fcx-fw/2, FEETY-fh*0.55, fcx+fw/2, FEETY+fh*0.45], fill=120)
    sh = sh.filter(ImageFilter.GaussianBlur(28))
    dark = Image.new("RGB",(PW,PH),(40,40,42))
    panel = Image.composite(Image.blend(panel,dark,0.58), panel, sh)
    panel.paste(fig,(ox,oy),fig)
    panel.save("%s/panel-%s.png"%(W,slug))
    rep.append(dict(age=slug, cm=CM[slug], h=round(CM[slug]*PXCM), s=round(float(s),4),
                    head=int(head*s+oy), feet=FEETY, ball=int(bally),
                    L=int(u_l*s+ox), R=int(u_r*s+ox)))
for r in rep: print(r)

strip = Image.new("RGB",(PW*5+4*24, PH),(240,239,236))
for i,slug in enumerate(AGES):
    strip.paste(Image.open("%s/panel-%s.png"%(W,slug)),(i*(PW+24),0))
strip.resize((strip.width//3, PH//3), Image.LANCZOS).save(W+"/strip.png")
print("strip", strip.size)
