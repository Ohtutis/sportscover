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
| `print-sources/output/stadium-night/GDE-SN-certificate-2550x3300-300dpi.png` | ” |
| `print-sources/output/fire-and-smoke/GDE-FS-card-{FRONT,BACK}-816x1110-300dpi.png` | ” |
| `print-sources/output/fire-and-smoke/GDE-FS-booster-pack-FLAT-2032x1560-300dpi.png` | ” |
| `print-sources/output/fire-and-smoke/GDE-FS-certificate-2550x3300-300dpi.png` | ” |
| `print-sources/output/heritage/GDE-HE-*.png` | card FRONT/BACK, pack, certificate |
| `print-sources/output/signature-spotlight/GDE-SS-*.png` | ” |
| `print-sources/output/prism-rush/GDE-PR-*.png` | ” |
| `print-sources/pack-assets-foil-pinstripe-tile.png` | 240 px seamless tile used on the pack flaps |
| `print-sources/brand/GDE-auth-signature.png` | 997×331 RGBA — the authorised signature, background removed, strokes recoloured paper-white `#F8FAFC`. Figma image hash `adb19971…`. Source of the cutout script: `docs/GAME-DAY-EDITION.md` → "Certificate signature". |
| `exports/<finish>/bonus/*.png` | sticker + number badge, transparent (2x, alpha verified) — all six finishes; **die-cut silhouette is per-finish** |
| `card-flip/render_flip.py`, `render.sh`, `web/flip.html` | flip render pipeline |
| `card-flip/out/*.mp4` | rendered flip videos (customer deliverable) |

## NOT tracked — how to regenerate

| Path | Regenerate by |
|---|---|
| `print-sources/upscaled/`, `figma-ready/`, `chrome-allstar/` | Extract sources from Figma at native res, upscale 4× with upscayl-bin (`realesrgan-x4plus`, **single pass**), cap 4096 px. Full recipe: `docs/GAME-DAY-EDITION.md` → "The pipeline". |
| `print-sources/Fire-and-smoke/`, `Heritage/`, `Signature-spotlight/`, `prism-rush/` | Finish master backgrounds (AI-generated, 3392×5056). Uploaded to Figma 2026-08-19 (capped 2748×4096, JPEG q92) — hashes in the handoff doc. Re-extract from Figma if the local file is lost. |
| `print-sources/output/**/*poster-*.png` (~33 MB each) | Figma → select `90:2` (SN) / `105:1218` (CA) / `277:2` (FS) → Export PNG @1x → stamp 300 DPI + flatten to RGB with PIL. |
| `card-flip/assets/**` | Figma → export `CardFlip_Front` / `CardFlip_Back` at **2×** (1500×2100) into `card-flip/assets/` (SN) or `assets/ca/` (CA). |
| `card-flip/out/*.gif` | `./render.sh` regenerates it alongside the MP4. |
| `exports/shared-cutouts/` | Figma → `Cutout_Hero/Trio/Pose2/Pose3` frames at 2×. These are **athlete-specific, not finish-specific** — one set per order. |
| `print-sources/_qa_*.png` | Throwaway QA crops from the upscale step. |

## Rebuilding the flip videos

```
./render.sh                                                    # Stadium Night 4:5
STYLE=CA FLIP_ASSETS=assets/ca FLIP_BG=8,12,18,255 ./render.sh # Chrome All-Star 4:5
```

## Senior Night (SR)

`print-sources/senior-night/senior-night-background.png` is the canonical SR reference that
`art-pipeline/finishes.ts` points at - the approved basketball "E Confetti Storm" take. Like the
other finish references it is not in git; regenerate with
`npx tsx art-pipeline/gen-senior-night.ts` (writes candidates to
`art-pipeline/out/backgrounds/senior-night/`) and copy the chosen one into place, or pull it from
the Figma poster hero on the basketball file page `2304:566`.
