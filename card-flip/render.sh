#!/bin/sh
# GDE card flip - full render pipeline.
# Inputs:  $FLIP_ASSETS/card-front.png, card-back.png (1500x2100, Figma CardFlip_Front/Back @2x)
# Outputs: out/GDE_${STYLE}_CardFlip_*.{mp4,gif}
#
#   ./render.sh                                   -> Stadium Night, 4:5
#   STYLE=CA FLIP_ASSETS=assets/ca FLIP_BG=8,12,18,255 ./render.sh
#   FLIP_W=1080 FLIP_H=1920 FLIP_CARD_H=1150 ./render.sh   -> 9:16 story cut
set -e
cd "$(dirname "$0")"
STYLE="${STYLE:-SN}"
W="${FLIP_W:-1080}"
H="${FLIP_H:-1350}"
python3 render_flip.py
ffmpeg -y -loglevel error -framerate 30 -i out/frames/f%04d.png \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart \
  "out/GDE_${STYLE}_CardFlip_${W}x${H}.mp4"
ffmpeg -y -loglevel error -framerate 30 -i out/frames/f%04d.png \
  -vf "fps=20,scale=540:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  "out/GDE_${STYLE}_CardFlip_540.gif"
rm -rf out/frames
echo "done: out/GDE_${STYLE}_CardFlip_${W}x${H}.mp4 + out/GDE_${STYLE}_CardFlip_540.gif"
