# Build a generic social-feed post around one of our delivered social files, sized for a phone
# screen, so slide 16 can show a real POST rather than a full-bleed image (which read as a
# wallpaper). Deliberately generic chrome: no platform name, no platform logo, no wordmark.
#   .venv-matte/bin/python art-pipeline/figma/etsy-fake-social-post.py <social.png> <avatar.png> <out.png>
#       [handle] [team] [caption]
# Handle/team/caption are optional and default to the basketball athlete, so the original
# slide-16 call still works unchanged. They were hardcoded until 2026-08-25, when the complete-set
# hero needed the SAME post for the football athlete — a Cedar Ridge caption over a Millbrook
# Bison photograph is the listing telling two different stories in one frame.
import sys
from PIL import Image, ImageDraw, ImageFont

src_p, avatar_p, out_p = sys.argv[1], sys.argv[2], sys.argv[3]
HANDLE  = sys.argv[4] if len(sys.argv) > 4 else "marcus.ellison"
TEAM    = sys.argv[5] if len(sys.argv) > 5 else "Cedar Ridge Bears"
CAPTION = sys.argv[6] if len(sys.argv) > 6 else "senior season, framed."
W, H = 1290, 2796
BG, INK, MUTE = (255,255,255), (20,24,31), (130,136,145)
F = "/System/Library/Fonts/Supplemental/Arial %s.ttf"
def font(sz, bold=False): return ImageFont.truetype(F % ("Bold" if bold else "Unicode"), sz)

im = Image.new("RGB", (W,H), BG)
d  = ImageDraw.Draw(im)

# status bar
d.text((70, 70), "9:41", font=font(46, True), fill=INK)
d.rounded_rectangle([W-190, 66, W-120, 100], 8, outline=INK, width=4)
d.rectangle([W-186, 72, W-140, 94], fill=INK)

# post header
top = 190
av = Image.open(avatar_p).convert("RGB").resize((110,110))
mask = Image.new("L", (110,110), 0); ImageDraw.Draw(mask).ellipse([0,0,109,109], fill=255)
im.paste(av, (70, top), mask)
d.ellipse([68, top-2, 180, top+110], outline=(230,232,236), width=4)
d.text((205, top+18), HANDLE, font=font(48, True), fill=INK)
d.text((205, top+70), TEAM, font=font(40), fill=MUTE)
for i in range(3):
    d.ellipse([W-120+i*22, top+48, W-110+i*22, top+58], fill=INK)

# the post itself — our delivered 1080x1350 social file, full bleed
y = top + 150
post = Image.open(src_p).convert("RGB")
pw = W; ph = round(post.height * pw / post.width)
im.paste(post.resize((pw, ph)), (0, y))
y += ph

# actions
ay = y + 74
def heart(x, cy, s):
    d.ellipse([x, cy-s, x+s*1.1, cy+s*0.1], outline=INK, width=6)
    d.ellipse([x+s*0.9, cy-s, x+s*2.0, cy+s*0.1], outline=INK, width=6)
    d.polygon([(x+2, cy-s*0.1),(x+s*2.0, cy-s*0.1),(x+s, cy+s*1.15)], outline=INK)
    d.line([(x+2, cy-s*0.15),(x+s, cy+s*1.15),(x+s*2.0, cy-s*0.15)], fill=INK, width=6)
heart(70, ay, 26)
d.rounded_rectangle([210, ay-30, 296, ay+34], 22, outline=INK, width=6)
d.polygon([(228, ay+30),(252, ay+30),(228, ay+56)], fill=INK)
d.polygon([(340, ay-32),(414, ay+2),(340, ay+34),(352, ay+2)], outline=INK)
d.line([(340, ay-32),(414, ay+2),(340, ay+34),(352, ay+2),(340,ay-32)], fill=INK, width=6)
d.rounded_rectangle([W-140, ay-32, W-92, ay+34], 4, outline=INK, width=6)

d.text((70, ay+82), "1,204 likes", font=font(44, True), fill=INK)
d.text((70, ay+150), HANDLE, font=font(42, True), fill=INK)
d.text((70+len(HANDLE)*23, ay+150), CAPTION, font=font(42), fill=INK)
d.text((70, ay+214), "View all 87 comments", font=font(40), fill=MUTE)
d.text((70, ay+272), "2 HOURS AGO", font=font(34), fill=MUTE)

im.save(out_p)
print("post ->", out_p, im.size)
