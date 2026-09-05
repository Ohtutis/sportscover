#!/usr/bin/env python3
"""Etsy POSTER listing — first video (the story), 1080x1080, 14.2 s, no text.

Same spine as the card story video (`render_card_promo_v3.py`) — that file owns the
shared beats and this one imports them rather than copying 400 lines:

  B1 0.0-2.8   the owner's game clip, tail end, freeze + shutter flash
  B2 2.8-4.8   phone gallery of the four REAL intake photos
  B3 4.8-6.6   the photos fan out on light stock
  B4 6.6-8.8   identity plate -> back + kit
  B5 8.8-10.3  the POSTER, on the wall, he looks at it   (owner clip)
  B6 10.3-12.8 three posters framed above him, living with it (owner clip)
  B7 12.8-14.2 silver GDE shield

Nothing is time-compressed: both owner clips play frame-for-frame at their own speed,
and B1 is TRIMMED FROM THE FRONT so the shot release — the moment worth freezing — is
what the flash lands on. Etsy's limit is 15 s; this leaves ~0.8 s of headroom.

Run:  python3 etsy/video/render_poster_promo.py
"""
import importlib.util, os, subprocess
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)

# reuse the card video's beats + helpers
_spec = importlib.util.spec_from_file_location("cardv3", "etsy/video/render_card_promo_v3.py")
V3 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(V3)

# the close video's end card is the better one (shield + the real wordmark + tagline)
_spec2 = importlib.util.spec_from_file_location("cardclose", "etsy/video/render_card_close.py")
CLOSE = importlib.util.module_from_spec(_spec2)
_spec2.loader.exec_module(CLOSE)

W = H = V3.W, V3.H
W = H = 1080
FPS = 30
TRIAL = V3.TRIAL
OUT_FRAMES = os.environ.get("GDE_POSTER_FRAMES", "etsy/video/_frames_poster")
OUT_MP4 = "etsy/listing-videos/GDE-etsy-02-poster-story-1080.mp4"
clamp01 = V3.clamp01

class GameOpen:
    """The owner's B1 clip, tail 84 frames, then freeze + a hard white shutter flash."""
    LEN = 84

    def __init__(self):
        self.dir = f"{TRIAL}/_f-b1custom"
        self.n = len(os.listdir(self.dir))
        self.off = max(0, self.n - self.LEN - 1)

    def frame(self, i):
        idx = 1 + self.off + min(i, self.LEN - 1)
        f = V3.square_from(self.dir, min(idx, self.n - 1))
        if i >= self.LEN - 6:
            t = clamp01((i - (self.LEN - 6)) / 4.0)
            f = Image.blend(f, Image.new("RGB", (W, H), (255, 255, 255)), t)
        return f

class Rooms:
    """The poster hanging in six real rooms — one per finish. Replaces the second owner
    clip: six rooms in three seconds say "your wall, your style" faster than one room can."""
    FILES = ["room-SN.png", "room-CA.png", "room-FS.png",
             "room-HE.png", "room-SS.png", "room-PR.png"]
    HOLD = 13          # frames per room
    XF = 4             # crossfade between rooms

    def __init__(self):
        self.imgs = [Image.open(f"etsy/listing-images/02-basketball-poster/{f}").convert("RGB")
                     for f in self.FILES]
        self.n = len(self.imgs) * self.HOLD

    def _shot(self, k, t):
        """One room with a slow push-in; t in 0..1 across its hold."""
        im = self.imgs[k]
        z = 1.07 - 0.05 * V3.ease_out_cubic(t)
        vw = int(im.width / z)
        x0 = (im.width - vw) // 2
        y0 = (im.height - vw) // 2
        return im.crop((x0, y0, x0 + vw, y0 + vw)).resize((W, H), Image.LANCZOS)

    def frame(self, i):
        k = min(len(self.imgs) - 1, i // self.HOLD)
        j = i - k * self.HOLD
        f = self._shot(k, j / float(self.HOLD - 1))
        if j < self.XF and k > 0:      # dissolve out of the previous room
            prev = self._shot(k - 1, 1.0)
            f = Image.blend(prev, f, (j + 1) / (self.XF + 1))
        return f

class Clip:
    """An owner clip played frame-for-frame — never resampled to fit a duration."""
    def __init__(self, name):
        self.dir = f"{TRIAL}/_f-{name}"
        self.n = len(os.listdir(self.dir))

    def frame(self, i):
        return V3.square_from(self.dir, 1 + min(i, self.n - 2))

def main():
    os.makedirs(OUT_FRAMES, exist_ok=True)
    for old in os.listdir(OUT_FRAMES):
        os.remove(os.path.join(OUT_FRAMES, old))

    photos = [Image.open(f"art-pipeline/out/athletes/basketball/before/photo{k}.png").convert("RGB")
              for k in range(1, 5)]
    bg = V3.beige_bg()
    game = GameOpen()
    phone = V3.B2(photos)
    fan = V3.B3(photos, bg)
    ident = V3.B4(bg)
    zoom = Clip("poster-zoom")
    rooms = Rooms()
    end = CLOSE.EndCard("THEIR PHOTOS. THEIR POSTER.")

    beats = [
        (game.LEN, game.frame),
        (60, phone.frame),
        (54, fan.frame),
        (66, ident.frame),
        (zoom.n - 1, zoom.frame),
        (rooms.n, rooms.frame),
        (48, lambda i: end.frame(i, 48)),
    ]
    XF = {2: 8, 3: 8, 4: 6, 5: 6, 6: 8}   # B1->B2 is a hard cut off the flash

    n = 0
    prev = None
    for bi, (length, fn) in enumerate(beats):
        xf = XF.get(bi, 0)
        for i in range(length):
            img = fn(i)
            if prev is not None and i < xf:
                img = Image.blend(prev, img, (i + 1) / (xf + 1))
            img.save(f"{OUT_FRAMES}/f{n:04d}.png")
            n += 1
            if n % 60 == 0:
                print(f"{n} frames")
        prev = fn(length - 1)
    print(f"frames: {n} ({n / FPS:.2f}s)")

    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS),
                    "-i", f"{OUT_FRAMES}/f%04d.png", "-c:v", "libx264", "-crf", "17",
                    "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-an", OUT_MP4], check=True)
    print("done:", OUT_MP4)

if __name__ == "__main__":
    main()
