# print-sources / exports — what is tracked and what is not

Git holds the **final print-ready deliverables** and the **pipeline code**.
Large raw art, upscales and 30 MB+ poster masters are gitignored — they are
regenerable and live on the working machine.

## Tracked (in git)

| Path | What |
|---|---|
| `print-sources/output/stadium-night/GDE-SN-card-{FRONT,BACK}-816x1110-300dpi.png` | card, supplier template, 300 DPI |
| `print-sources/output/stadium-night/GDE-SN-booster-pack-FLAT-2032x1560-300dpi.png` | pack wrapper flat |
| `print-sources/output/chrome-allstar/GDE-CA-card-{FRONT,BACK}-816x1110-300dpi.png` | ” |
| `print-sources/output/chrome-allstar/GDE-CA-booster-pack-FLAT-2032x1560-300dpi.png` | ” |
| `print-sources/output/chrome-allstar/GDE-CA-certificate-2550x3300-300dpi.png` | certificate |
| `print-sources/pack-assets-foil-pinstripe-tile.png` | 240 px seamless tile used on the pack flaps |
| `exports/{stadium-night,chrome-allstar}/bonus/*.png` | sticker + number badge, transparent |
| `card-flip/render_flip.py`, `render.sh`, `web/flip.html` | flip render pipeline |
| `card-flip/out/*.mp4` | rendered flip videos (customer deliverable) |

## NOT tracked — how to regenerate

| Path | Regenerate by |
|---|---|
| `print-sources/upscaled/`, `figma-ready/`, `chrome-allstar/` | Extract sources from Figma at native res, upscale 4× with upscayl-bin (`realesrgan-x4plus`, **single pass**), cap 4096 px. Full recipe: `docs/GAME-DAY-EDITION.md` → "The pipeline". |
| `print-sources/output/**/*poster-*.png` (~33 MB each) | Figma → select `90:2` (SN) / `105:1218` (CA) → Export PNG @1x → stamp 300 DPI + flatten to RGB with PIL. |
| `card-flip/assets/**` | Figma → export `CardFlip_Front` / `CardFlip_Back` at **2×** (1500×2100) into `card-flip/assets/` (SN) or `assets/ca/` (CA). |
| `card-flip/out/*.gif` | `./render.sh` regenerates it alongside the MP4. |
| `exports/shared-cutouts/` | Figma → `Cutout_Hero/Trio/Pose2/Pose3` frames at 2×. These are **athlete-specific, not finish-specific** — one set per order. |
| `print-sources/_qa_*.png` | Throwaway QA crops from the upscale step. |

## Rebuilding the flip videos

```
./render.sh                                                    # Stadium Night 4:5
STYLE=CA FLIP_ASSETS=assets/ca FLIP_BG=8,12,18,255 ./render.sh # Chrome All-Star 4:5
```
