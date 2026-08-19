# Game Day Edition — Project Handoff & Status

> Continuation doc so any Claude Code session (incl. a different account / stronger plan)
> can pick up this work. Last updated: **2026-08-19**.

## What this project is

**Game Day Edition** (domain: **gamedayedition.com**) turns a few real photos of a youth
athlete into a premium personalized package:

- **Poster** (18×24"), **25 collectible trading cards** (2.5×3.5"), digital artwork,
  phone **wallpaper**, **social** graphics, and a **reveal video**.
- **17 sports**, **5 fixed art finishes**: `Stadium Night`, `Chrome All-Star`,
  `Fire & Smoke`, `Neon Future`, `Vintage Card`.
- Per order we print **25 identical Hero Cards** (no rarity/Gold/Chrome variants yet).

The repo here (`package.json` name `cover-moment`) is the marketing site + will host the
card registry. Brand was renamed **Cover Moment → Game Day Edition** (site-config.ts still
defaults to "Cover Moment"; override via `NEXT_PUBLIC_BRAND_NAME`).

## The two production layers (don't mix them)

- **Layer A — AI art (external, NOT in Figma/MCP):** generate the athlete as
  **transparent cutout PNGs** (3 poses per composite) + sport/finish **backgrounds**.
  Tools: ComfyUI (Flux + PuLID/InstantID + OpenPose) for reproducible batches, or
  Midjourney `--cref` / Nano Banana (Gemini image) for fast identity-locked poses.
  Background removal: `rembg` (u2net) works; use **BiRefNet** for clean hair/edges in prod.
- **Layer B — layout/branding (Figma via MCP):** templates + variables. This is what the
  Figma MCP builds. It **cannot** generate the athlete image.

Pipeline: `[AI: cutouts + background] → [Figma template + variables → export] → registry/QR`.

## Figma (design system)

- Official Figma MCP is **write-capable** here via `use_figma`. **Always load the
  `figma-use` skill** (`get_figma_skill` → `skill://figma/figma-use/SKILL.md`) before calling it.
- Account: `tautvydasberzinis@gmail.com`, plan **Professional** (Starter had a low MCP
  tool-call limit — now lifted).
- **File:** `Cover Moment — Templates`, fileKey **`KzdEYF1UD9EnsczY8Kpyxi`**
  (https://www.figma.com/design/KzdEYF1UD9EnsczY8Kpyxi).

### Key nodes (Stadium Night)
| What | Node | Notes |
|---|---|---|
| Poster HERO (winner) | `38:2` | "Stadium Night v7 (arena open)" — reveals real arena bottom-right |
| Poster (Brooks-centre backup) | `9:2` | earlier v2 composite, kept as fallback |
| Card FRONT | `40:2` | 3-figure composite; team-color border; GAME DAY EDITION mark |
| Card BACK | `49:2` | info layout + subtle from-behind photo + QR chip `56:2` |

Leftover photo-forward back `46:2` has been deleted.

**Card front layer-naming fix:** frame `41:4` is the *style/season* line
("STADIUM NIGHT · 2026"), but its children were misnamed `#number` / `#position` — the merge
step would have written the jersey number into the style slot. Renamed to `style_meta` /
`#style_name` / `#season`. The real number+position line is `48:25` (`meta`).

### Design decisions (apply to all finishes)
- Poster = **3-photo composite** ("athlete edit", à la Haaland/Dirk): 1 main cutout +
  2 muted supporting cutouts (image `filters` desaturate/darken + ~0.5 opacity), giant
  translucent number as **background typography**, ghost surname as a dark shadow, sport
  background, blue rim-light + fog + subtle hoop + particles.
- Typography: **Anton** (big name/number), **Barlow Condensed** SemiBold (first name + meta).
  NOT Inter. Name lockup = first name over surname.
- **Team colors drive accents** (no orange brand color on posters). Headline is a signature
  system line ("OWN THE MOMENT"; others: BUILT DIFFERENT / THIS IS MY COURT / NEXT UP…).
- Logo goes in a **square** container (rect + scaleMode FIT), never a circle (crops it).
- Posters are art (minimal text). **Stats/grad-year live on the card**, not the poster.
- Keep each finish visually distinct — don't pile the same graphics on every style.

### Color tokens — collection "Cover Moment"
`team/primary` (VariableID:1:3), `team/secondary` (1:4), `brand/accent` #FF6B2B (1:5),
`ink` (1:6), `paper` (1:7). Recolor for a new team by changing team/primary + team/secondary.

### Templating variables — collection "Athlete" (VariableCollectionId:51:5, mode 51:1)
STRING variables = **source of truth**, bound to text via
`textNode.setBoundVariable('characters', variable)` (confirmed works; scope `TEXT_CONTENT`):
`firstName, lastName, jerseyNumber, position, team, season, classOf, PPG, APG, RPG,
playerHighlight, sportCode, styleName` + derived display strings
(`fullNameUpper, lastNameUpper, numberHash, positionUpper, teamUpper, frontMeta, metaLine,
styleSeason, styleNameUpper, styleCode, cardId, firstEdition`).
Derived vars are computed in JS at creation — Figma string vars don't auto-derive, so a
**merge step recomputes them at generation time** (see TODO: merge plugin).

### Merge-field layer naming (# prefix)
`#background, #photo_main, #photo_2, #photo_3, #surname_ghost, #number, #number_ghost,
#athlete_name, #first_name, #position, #team, #season, #stat_N_value, #stat_N_label,
#team_logo, #headline, #bio, #card_qr, #card_id`.

### Print sizes
Poster trim 1296×1728 (18×24" @72ppi) — add 0.125" bleed before export. Card 750×1050
(2.5×3.5" @300 DPI). See DPI note below.

### Figma MCP gotchas
- `node.query('RECTANGLE[name=#foo]')` does NOT match names starting with `#` — query all
  and filter by name in JS.
- `upload_assets` returns a `submitUrl`; POST bytes to it with `curl` (that POST is not an
  MCP call). Use `scaleMode: FIT` for cutouts, `FILL` for backgrounds.
- Radial gradients need an explicit `gradientTransform`.
- `get_screenshot` (with `enableBase64Response:true`) is reliable for previews.

## Social / digital deliverables (Stadium Night) — BUILT

All live on `Page 1` of the Figma file, below the poster/card row. Every text layer is bound
to an **Athlete** variable, so a new order re-fills them automatically.

| Deliverable | Size | Node |
|---|---|---|
| Grid 1 — poster reveal | 1080×1350 (4:5) | `70:2` |
| Grid 2 — card FRONT (swipe 1/2) | 1080×1350 | `70:64` |
| Grid 3 — card BACK (swipe 2/2) | 1080×1350 | `70:92` |
| Story 1 — poster, full-bleed | 1080×1920 | `75:2` |
| Story 2 — card FRONT | 1080×1920 | `71:68` |
| Story 3 — card BACK | 1080×1920 | `71:95` |
| Wallpaper — phone home | 1290×2796 | `72:2` |
| Wallpaper — phone lock (clock-safe) | 1290×2796 | `72:10` |
| Wallpaper — iPad | 2048×2732 | `73:2` |
| Wallpaper — desktop | 3840×2160 | `73:10` |
| Profile picture (circle-safe) | 1080×1080 | `78:2` |
| Cover banner (X / Facebook) | 1500×500 | `78:7` |
| Certificate of Authenticity | 2550×3300 @300dpi | `79:2` |

### Rules learned building these
- **Grid posts are 4:5 (1080×1350), not 1:1** — max feed real estate. IG crops profile-grid
  thumbnails to 3:4, so keep face + name inside the centre 1080×1440 band.
- **Stories respect a 250px top and bottom safe zone** (1080×1920 → content lives 250–1670).
- **Copy is athlete-first, never sales copy.** These assets exist so the *customer* can post
  about their own kid, the way a club announces a player. No "25 collectible cards", no
  "scan the card". Captions bind to `metaLine`, `firstEdition`, `styleSeason`.
- **Every format keeps the 3-photo composite** (hero + 2 muted supporting cutouts at ~0.45
  opacity) — it is the brand's signature "athlete edit" look, wallpapers included.
- Full-bleed formats are **built natively** (background image FILL + cutouts placed for that
  aspect), not cropped from the poster — a scaled poster letterboxes or cuts the nameplate.
- Avatar uses an oversized `#photo_main` inside a clipping frame to zoom to head-and-shoulders;
  `circle_crop_guide` is a hidden guide layer, not artwork. Its background is **blurred
  (layer blur 18) + tinted + vignetted** so the face carries the avatar.
- **Purchase-date stamp:** every standalone GDE wordmark (story, wallpapers, cover) has an
  `#issued` line under it bound to the **`purchaseDate`** Athlete variable
  (`VariableID:81:2`, e.g. "AUG 2026") — set per order at merge time. The certificate's
  detail grid has an ISSUED slot bound to the same variable. **No serial numbers** — the
  certificate says "limited run of 25 cards" without numbering.
- **Name lockup is identical everywhere:** `#headline` (team primary) → `accent_bar` →
  `#first_name` (Barlow Cond SemiBold) → `#athlete_name` (Anton) → `#meta`. Same order on
  poster, story, cover and desktop wallpaper.
- Ghost numbers bind to **`jerseyNumber`** ("23"), not `numberHash` ("#23") — the `#` glyph
  reads as noise at giant sizes. Opacity ~0.10, kept fully inside the frame on desktop.

## Brand marks

| What | Node | Notes |
|---|---|---|
| Brand frame | `60:3` | "Brand — Game Day Edition" |
| Wordmark (navy, master) | `63:2` / vector `63:3` | for light backgrounds |
| Shield logo (navy, master) | `65:3` | |
| Wordmark on card front | `58:32` / vector `58:33` | **silver foil** — clone this one for dark art |
| Shield on card back | `58:34` | **silver foil** |

**Logo colour rule:** on cards, posters and social the GDE mark is a **silver foil gradient**
(white → #C7D0DC → white, ~20° tilt), never orange and never a team colour. Reasons: it works
across all 17 sports and 5 finishes, it reads as premium/collectible, and it never competes
with the athlete or the team palette. **`brand/accent` #FF6B2B stays on the website and the outer box** — not on the
artwork, and no longer on the booster pack (its accent bar follows `team/primary`).

## DIGITAL BONUS ASSETS (section `92:2` in Figma)

Value-add digital extras, all bound to Athlete variables, export settings preset:

| Asset | Frame | Size / export |
|---|---|---|
| Card flip — front | `GDE_SN_CardFlip_Front` `92:3` | 750×1050, PNG 2x |
| Card flip — back | `GDE_SN_CardFlip_Back` `92:25` | 750×1050, PNG 2x |
| Card flip — motion spec | `GDE_SN_CardFlip_MotionSpec` `92:64` | 4 stages + timings + CSS notes (rotateY, preserve-3d, ~5 s, edge foil sliver) |
| Hero cutout (transparent) | `GDE_SN_Cutout_Hero_PNG` `92:161` | individual, PNG 2x = 2732×4096 — all 3 poses export separately |
| Trio cutout (transparent) | `GDE_SN_Cutout_Trio_PNG` `92:163` | poster arrangement, full opacity, PNG 2x |
| Reel/TikTok cover | `GDE_SN_ReelCover_1080x1920` `93:2` | centred comp; face+name inside 1:1 and 3:4 preview crops |
| Name+number sticker (transparent) | `GDE_SN_Sticker_NameNumber_PNG` `97:2` | NIA / BROOKS / #23 lockup, team colors, drop shadow, PNG 2x |
| GDE number badge (transparent) | `GDE_SN_Badge_Number_PNG` `97:7` | navy squircle, foil border+shield, giant jersey number, PNG 2x |
| Pose 2 cutout (transparent) | `GDE_SN_Cutout_Pose2_PNG` `97:12` | individual, PNG 2x = 2732×4096 |
| Pose 3 cutout (transparent) | `GDE_SN_Cutout_Pose3_PNG` `97:14` | individual, PNG 2x = 2732×4096 |
| Clean wallpaper — lock | `GDE_SN_Wallpaper_Lock_iPhone` `94:2` | trio + ghost number, clock-safe top, subtle BROOKS + #23 bottom, no GDE branding |
| Clean wallpaper — home | `GDE_SN_Wallpaper_Home_iPhone` `94:9` | trio + ghost number, zero text |
| Clean wallpaper — desktop | `GDE_SN_Wallpaper_Desktop_3840x2160` `94:14` | trio + ghost number, cinematic, tiny wordmark 45% bottom-right |

### Card flip video — RENDERED (`card-flip/` in repo)
**Customer gets the MP4s** (universal, small, share-ready); GIF is internal/email preview only.
- `card-flip/out/GDE_SN_CardFlip_1080x1350.mp4` — 4:5 feed version (1.5 MB)
- `card-flip/out/GDE_SN_CardFlip_1080x1920.mp4` — 9:16 story/TikTok version (1.9 MB)
- `card-flip/out/GDE_SN_CardFlip_540.gif` — 540px GIF for email/chat (3.3 MB)
- Fully env-parameterized: `STYLE` (output name), `FLIP_ASSETS` (input dir), `FLIP_BG` (ground
  colour r,g,b,a), `FLIP_W/FLIP_H/FLIP_CARD_H` (canvas). Outputs are named per style, so finishes
  never overwrite each other:
  ```
  ./render.sh                                                        # Stadium Night 4:5
  STYLE=CA FLIP_ASSETS=assets/ca FLIP_BG=8,12,18,255 ./render.sh      # Chrome All-Star 4:5
  STYLE=CA FLIP_ASSETS=assets/ca FLIP_BG=8,12,18,255 \
    FLIP_W=1080 FLIP_H=1920 FLIP_CARD_H=1150 ./render.sh              # 9:16 story cut
  ```
- `card-flip/render_flip.py` + `render.sh` — full pipeline: PIL perspective-projects the two
  card faces per the motion spec (hold → ease-in to 90° with +4% zoom → foil edge sliver →
  ease-out to back → hold), ffmpeg assembles. Re-run per order: export CardFlip_Front/Back
  at 2x from Figma into `card-flip/assets/`, then `./render.sh`.
- `card-flip/web/flip.html` — CSS 3D version (same timing curve) for the `/c/[cardId]` page;
  click replays. PIL gotcha: PERSPECTIVE coeffs map output→input — solve from dst points.

**Wallpaper decision: the clean set is the PRIMARY deliverable** (people actually use it).
The branded wallpapers (`72:2`,`72:10`,`73:2`,`73:10`) stay as a secondary/optional pack.
**"Clean" means no GDE branding and minimal text — NOT a different style.** Every wallpaper
still carries the family DNA: 3-photo trio composite, giant ghost jersey number, and the
poster atmosphere kit.

### Atmosphere kit (applied)
A full-bleed athlete artboard is NOT just bg+glow — it must carry the **poster's atmosphere
layers**, cloned from `38:2`: vignette `38:6` (stretched to frame), glow_accent `38:5`,
flare `38:12`, rims `38:13–15` (under the photos), fog `38:33–35`, arena spill `38:49`,
crowd haze `31:4`, bokeh `31:6–17` (over the photos, under text), particles `38:20–32`
(branded assets only, not clean wallpapers). Mapping: uniform scale by width (portrait) or
height (desktop, with dx to centre on the athlete), y proportional (y/1728·H). Applied to
story `75:2`, reel cover `93:2`, all 7 wallpapers. Each carries a hidden `atmosphere_marker`
child so the operation is idempotent. Card posts keep plain backdrops — the card is the subject.

### Color unification (applied)
The hero poster `38:2` is the color reference. Social/wallpaper backdrops were darker and
desaturated vs the poster — unified: card-post backdrops exposure −0.10 / sat −0.15 / tint 0.55
(was −0.25/−0.35/0.78); wallpapers + story + cover exposure −0.06…−0.08 / sat −0.10…−0.12;
PFP tint 0.22. Rule: **any new artboard's backdrop stays within these values** so nothing
reads flatter than the poster.

## Page organisation + the Style variable collection (2026-08-19)

### Every finish page uses the same five sections
Both pages are laid out identically so a whole pack can be reviewed at a glance:

| Section | Contains |
|---|---|
| `01 · HERO & TEMPLATES` | poster hero + card FRONT/BACK design masters (+ Brand frame on SN) |
| `02 · PRINT READY` | print cards 816×1110, pack flat 2032×1560, certificate, proof, poster print export |
| `03 · SOCIAL` | grid 1–3, story 1–3, reel cover, profile picture, cover banner |
| `04 · WALLPAPERS` | 4 branded + 3 clean |
| `05 · DIGITAL BONUS` | card flip front/back + motion spec, 4 cutouts, sticker, badge |

Nothing lives loose at page level. Re-running the layout script (session history) re-sorts a page
after new frames are added — it classifies by frame-name regex, so **keep the naming prefixes**
(`Poster ·`, `Card ·`, `PRINT`, `PACK ·`, `SOCIAL ·`, `WALLPAPER ·`, `Cutout|Sticker|Badge|CardFlip`).

### ⚠️ Style strings are per-page now — collection "Style" (`VariableCollectionId:141:3`)
**The bug this fixed:** `styleName`/`styleNameUpper`/`styleCode`/`styleSeason`/`cardId` lived in the
file-global **Athlete** collection. With two finish pages, the Chrome All-Star page rendered
"STADIUM NIGHT" and "GDE-SN-…" — it would have gone to print wrong.

Fix: a **Style** collection with **one mode per finish**, and each page pinned to its mode via
`page.setExplicitVariableModeForCollection(col, modeId)`.

| Variable | Stadium Night (mode `141:6`) | Chrome All-Star (mode `141:7`) |
|---|---|---|
| `styleName` `141:4` | Stadium Night | Chrome All-Star |
| `styleNameUpper` `141:5` | STADIUM NIGHT | CHROME ALL-STAR |
| `styleCode` `141:6` | SN | CA |
| `styleSeason` `141:7` | STADIUM NIGHT · 2026 | CHROME ALL-STAR · 2026 |
| `cardId` `141:8` | GDE-SN-BKB-2026-23 | GDE-CA-BKB-2026-23 |
| `brandStyleLine` `141:9` | GAME DAY EDITION · STADIUM NIGHT | GAME DAY EDITION · CHROME ALL-STAR |

**Mode cap on this plan is 6** (probed) — enough for all five finishes.
The old Athlete copies are renamed `zz_deprecated/*`; do not bind to them.

**Adding finish #3:** `col.addMode('Fire & Smoke')`, set the six values, then pin the new page.
Style-bound text needs no edits — it resolves per page automatically.

## Chrome All-Star (page `103:2` — finishes live on separate PAGES)

The file now has one page per finish: **"Stadium Night"** (original Page 1) and
**"Chrome All-Star"**. New finishes = new page; keeps packs from mixing.

Sources: `print-sources/chrome-allstar/` — `background.png` (3392×5056, no upscale needed),
`back-card.png` (848×1264 → 4× upscaled). Figma hashes: bg `2a75f529…`, back `c5c5f76b…`.

**CA design rules (vs Stadium Night):**
- **Typography unchanged** (Anton + Barlow) — the finish differentiates by MATERIAL:
  chrome gradient on giant `#number`/ghost type, chrome `accent_bar`s, chrome `card_border`.
- **No arena atmosphere**: `br_arena_spill`, `br_crowd_haze`, `bokeh` removed; fog at ~50%
  (chrome = clean reflections, not smoke). Vignette/rims/particles stay.
- **Style-specific back-card photo** (from-behind shot rendered against the chrome set) —
  each finish gets its own back shot against its own environment.
- Team colors still drive headline/meta accents (bound variables untouched).

**Chrome All-Star is COMPLETE** — full parity with Stadium Night.

| Deliverable | Node | Output file |
|---|---|---|
| Poster hero / print export | `102:2` / `105:1218` | — (export at 1x) |
| Card FRONT / BACK masters | `102:63` / `102:85` | — |
| **PRINT card FRONT / BACK** | **`141:10` / `141:38`** | `print-sources/output/chrome-allstar/GDE-CA-card-{FRONT,BACK}-816x1110-300dpi.png` |
| **PACK flat** | **`142:2`** | `…/GDE-CA-booster-pack-FLAT-2032x1560-300dpi.png` |
| **Certificate** | **`144:120`** | `…/GDE-CA-certificate-2550x3300-300dpi.png` |
| Proof (watermarked) | `105:803` | — |
| Social: PFP / cover / grid 1–3 / story 1–3 / reel | `105:2` `105:9` `105:23` `105:134` `105:186` `105:407` `105:271` `105:322` `105:460` | — |
| Wallpapers: branded ×4 / clean ×3 | `105:506` `105:553` `105:600` `105:647` / `105:702` `105:736` `105:768` | — |
| **Card flip front / back / motion spec** | **`111:197` / `111:222` / `144:3`** | `card-flip/out/GDE_CA_CardFlip_{1080x1350,1080x1920}.mp4` + `_540.gif` |
| **Sticker / badge** | **`144:106` / `144:111`** | `exports/chrome-allstar/bonus/GDE-CA-{sticker-name-number,badge-number}.png` |
| **Cutouts hero/trio/pose2/pose3** | `144:100` `144:102` `144:116` `144:118` | `exports/shared-cutouts/GDE-cutout-*.png` |

**Cutouts are athlete-specific, not finish-specific** — one set serves every finish in an order,
hence `exports/shared-cutouts/`. The per-finish pages each carry a copy so a page exports standalone.

**CA pack treatment** (cloned from the SN pack `125:2`, then re-materialised): graphite base
`#0E141C→#1A2532→#080C12`, chrome texture at 55% (`2a75f529…`, saturation −0.35, temp −0.10),
silver highlight radials instead of blue floodlight, hero lockup `CHROME / ALL-STAR` sized so the
**wider** line fills 540 px. `left_heading` is bound to `styleNameUpper` so finish #3 auto-fills.

**Propagation recipe used** (repeat for the next 3 finishes): clone each SN artboard to the
new page → swap `#background`/`backdrop` hash → apply finish treatment (type material, fog
level, atmosphere subset) → replace nested `card`/`poster_art` clones with the finish's own
trio clones. ~6 scripted passes, no rebuilding.

## Print quality (DPI)

| Product | Needs @300 DPI | Current AI (~1024px) |
|---|---|---|
| Poster 18×24" | 5400×7200 | ❌ upscale ~4× first |
| Card 2.5×3.5" | 750×1050 | ✅ fine |
| Social / wallpaper | ~1080–1440 | ✅ fine |

For posters: upscale the **source** background + cutouts 4× (Upscayl free, or Topaz/Magnific)
**before** compositing in Figma, then export at print size.

## Print pipeline (hero poster) — WORKING

Print-ready files live in **`print-sources/output/`**:
- `poster-stadium-night-BLEED-5475x7275-300dpi.png` — send this to the printer (18×24" + 0.125" bleed)
- `poster-stadium-night-TRIM-5400x7200-300dpi.png` — proofing version, no bleed

Only two poster frames exist: design original **`38:2`** and full-size print export **`90:2`**
"PRINT EXPORT · 5475x7275 @300dpi" (export settings preset — select + Export = printer file).
The intermediate small bleed master was removed. After design changes on `38:2`:
re-clone into a +9px/side bleed frame, rescale(5475/1314), replace `90:2`.

**The whole file now runs on the 4K sources** — all 64 image fills were swapped to the
AI-upscaled hashes (background `08aa…`, main `6606…`, p2 `b6ac…`, p3 `b73a…`, logo `d484…`).
Rule going forward: **generate or upscale every asset to 4096px long side BEFORE importing**
(Figma's image cap is 4096) — no more low-res sources anywhere.

### The pipeline (repeat per finish/order)
1. **Extract sources** from Figma at native res: temp rects with each `imageHash` at the
   image's `getSizeAsync()` size → `get_screenshot` (contentsOnly) → curl. Alpha survives.
2. **Upscale 4×** with Real-ESRGAN (`realesrgan-x4plus`). Working binary:
   **upscayl-ncnn** latest release (github.com/upscayl/upscayl-ncnn) — the official 2022
   xinntao macOS build **segfaults on modern macOS**; use upscayl-bin with the model dir
   from the xinntao zip. Runs need sandbox disabled (GPU/Vulkan).
   **Single pass only** — a second pass brightens/flattens the image (mood drift).
3. **Cap at 4096px** long side (Lanczos down) — Figma's image limit.
4. **Upload** via `upload_assets` (multipart POST), swap `imageHash`es in the print master.
   Set the clone frame's `fills=[]` — the original frame's solid fill otherwise hides the
   bleed-frame background. Frame's own fill = same bg image (covers bleed seamlessly).
5. **Export**: `get_screenshot` only *downsizes*, so clone the master and `rescale(5475/1314)`
   to true print pixels — that clone is kept as `90:2`. Screenshot it at `maxDimension: 7275`
   (or export from Figma UI at 1x), then stamp 300 DPI + flatten to RGB with PIL.

Sources: `print-sources/` (originals ~843×1264) and `print-sources/upscaled/` (4×).

## Print templates — supplier qpmarketnetwork.com (BUILT)

Supplier templates decoded from their PDFs (`~/Downloads/2_48x3_46American_poker_size.pdf`,
`~/Downloads/Booster Pack.pdf`). **These are the exact specs their uploader expects.**

### Card — "American poker size" 2.48×3.46"
| Box | Inches | px @300 DPI | Inset from canvas |
|---|---|---|---|
| Bleed (upload this size) | 2.72 × 3.70 | **816 × 1110** | — |
| Cut / trim | 2.48 × 3.46 | 744 × 1038 | 36 px |
| Safe area | 2.28 × 3.27 | 684 × 981 | 66 px |

Figma print frames (export PNG @1x, guides already excluded):
- `PRINT · Card FRONT — 816x1110` **`121:2`**
- `PRINT · Card BACK — 816x1110` **`121:27`**

**How they're built** (repeat for any finish): clone the 750×1050 design → `rescale(0.992)`
so 750→744 trim → centre in an 816×1110 frame. Then the background layers (`#card_bg`, plus
`scrim` on the front / `photo_overlay` on the back) are **removed from the clone** and
re-drawn full-bleed underneath at the **source 750×1050 aspect scaled by 1.088** (cover) —
this keeps the approved crop and leaves **no seam at the trim line**.
⚠️ Gotcha: the source card frames carry their own dark solid fill. Set `clone.fills = []`
or it hides the bleed layers and the card reads flat navy.

Output: `print-sources/output/stadium-night/GDE-SN-card-{FRONT,BACK}-816x1110-300dpi.png`

Note: `card_border` sits ~19 px (0.06") inside the trim — tight but intentional. All text and
logos clear the 66 px safe line.

### Booster pack — flat wrapper 6.54×4.94"
| Box | Inches | px @300 DPI |
|---|---|---|
| Bleed (upload this size) | 6.77 × 5.19 | **2032 × 1560** |
| Cut / trim | 6.54 × 4.94 | inset 35.4 px (x 35.4–1996.1, y 35.4–1523.6) |
| **Safe area** | — | **x 165–1876, y 157–1404** (~120 px / 0.4" inside the cut) |
| Tear notch | — | V at bottom cut edge, x 1288.7–1360.7, 62.5 px deep |

⚠️ **The downloadable PDF template is wrong/incomplete — trust their uploader.** The PDF draws
only **2** fold lines (x 602.4, 1429.2) and marks no safe area. The live uploader shows **4**
fold lines and a much tighter safe box. Verified by uploading a proof and reading the overlay:

| Fold | x (px @300) |
|---|---|
| 1 | 212 |
| 2 | 605 |
| 3 | 1423 |
| 4 | 1815 |

So it is a **fin-seal**, not a simple 3-panel wrap:

```
[ seal lap 35–212 ][ BACK-LEFT 212–605 ][ FRONT 605–1423 ][ BACK-RIGHT 1423–1815 ][ seal lap 1815–1996 ]
```

The two back halves meet at the back centre; the two outer laps fuse together as the fin.
**Usable content width per back half ≈ 320 px** (393 minus fold clearance). The seal laps take
background/pattern only — anything printed there is fused and lost.

Figma: `PACK · Stadium Night — FLAT 2032x1560` **`125:2`** →
`PANEL · FRONT` `126:2` (x 605–1423), `PANEL · BACK (right flap — outer)` `128:2` (x 1423–2032),
`PANEL · BACK (left flap — inner)` `128:12` (x 0–605), `TEMPLATE_GUIDES` (hidden — cut/safe/
4 folds/seal laps; unhide to proof, hide before export).

Output: `print-sources/output/stadium-night/GDE-SN-booster-pack-FLAT-2032x1560-300dpi.png`

**Pack design rules:**
- Pack carries **no athlete image** — brand only, so one artwork serves every order of a finish.
- Front: foil shield → foil GDE wordmark → "COLLECTOR SERIES" → **STADIUM NIGHT** stacked in
  Anton with the silver-foil gradient → orange accent bar → card count → `gamedayedition.com`.
  A giant ghost shield at 5.5% opacity is the background typography (family DNA, standing in
  for the poster's ghost jersey number).
- Back is **two panels, not one**: back-left = brand block (finish name, what the product is,
  foil wordmark); back-right = "WHAT'S INSIDE" + contents + QR. They sit side by side on the
  assembled back with the fin seam between them.
- **Accent bar follows the team colour** — `accent_bar (team/primary)` is a SOLID fill bound
  to `team/primary` (VariableID:1:3), the same variable driving `card_border`. Its glow is
  hue-neutral white @30% so it reads lit for any team palette.
  ⚠️ **Consequence: the pack is now per-order, not per-finish.** It can no longer be bulk
  printed ahead of time — each order's pack picks up that team's colour. If you ever want
  stock packs again, swap this one fill back to a fixed colour.
- Orange `brand/accent` #FF6B2B is **not** used on the pack (decided 2026-08-19 — replaced by
  the team colour). It still belongs on the website and the outer box.
- Atmosphere is built graphically (night gradient + stadium photo at 42% + floodlight/rim
  radials + vignette), *not* a full-bleed photo — the portrait poster art crops badly to
  landscape and a graphic field prints cleaner on film.
- Scrims live at **canvas level, never per-panel** — a panel-width scrim puts a hard vertical
  step exactly on a fold line.
- Flaps carry a seamless foil pinstripe tile (`36d4bb07c57c3b0153e6c4b1a3f2ff20eccfb7f3`,
  240 px, TILE @0.62, 34% opacity), generated by PIL and uploaded via `upload_assets`.
- Every panel frame is aligned to its real fold boundaries so the pinstripe has no seam at the
  crease.

**Proofing rule:** before every export, unhide `TEMPLATE_GUIDES` and confirm each element is
(a) inside the safe box and (b) between its own panel's two fold lines. A script that checks
both is in the session history — re-run it rather than eyeballing.

### Sourcing decision (2026-08-19) — stay with qpmarketnetwork

Researched US-based alternatives to cut the ~10-day shipping and $10 freight. **Decision: stay
with QPMN.** Reasons:
- QPMN prints cards **and** the wrapper, assembles, seals and ships as one finished pack — no
  self-assembly, no heat sealer. It also offers holographic/foil stock.
- Cards are personalised, so they must be printed per order regardless. The $10 freight is
  therefore per order no matter who prints the wrapper — bulk-printing wrappers separately
  saves little unless we self-seal at home.
- **Because the pack ships with the cards anyway, the team-coloured accent bar costs nothing.**
  Keep `accent_bar (team/primary)` bound.

US options priced/checked, kept for reference:
| Vendor | Location | MOQ | Verdict |
|---|---|---|---|
| Shuffled Ink | Winter Garden, FL | low | Real US manufacturer, no setup/rush fees — best fallback for **cards only** |
| The Game Crafter | Madison, WI | 1 | POD, 17 card sizes; no foil wrapper |
| DriveThruCards | US | 10 cards | ~$12.42/deck; no custom wrapper |
| Ad Magic | New Jersey | proto→global | US; worth a quote at volume |
| Snapshot (makesnapshots) | Des Moines, IA | 1 | **Consumer product, not B2B** — $49.99/18 cards ($2.78/card), ~$40 for 10. Too expensive |
| custom-tradingcards.com | Colorado | 500 packs / $650 | Packaging only for cards they print |
| PrintMyGame / MPC / BoardGamesMaker / PrintNinja | India / HK / China | — | Not US despite US-facing sites |

Wrapper cost curve for reference: ~$10–18 at qty 1, **$0.02–0.05 at 10,000+**. Direct-to-foil
printing normally needs ~20,000 MOQ; QPMN's no-MOQ printed wrapper is genuinely unusual.

### Staged delivery (decided)
Poster + full digital set ship/deliver **immediately**; physical cards follow later. The
`/c/[cardId]` digital twin + card-flip video carry the moment while the cards are in transit.
Order flow and confirmation email must set this expectation explicitly.

### Pack capacity — why 10 cards, not 25
The front panel is 70 mm wide for a 63 mm card, so the flattened tube allows a stack
thickness of **≤ 7 mm**. At ~0.32 mm per 300 gsm card:
- **10 cards = 3.2 mm** ✅ comfortable
- 25 cards = 8.0 mm ❌ exceeds the panel; the pack would not seal flat

Practical ceiling for this pack is ~15 cards. **10 is the right count** — it also matches a
youth roster (keep 1–2, hand out the rest) and reads as more exclusive.

## Per-order workflow

**Proof frame:** `GDE_SN_Proof_Watermarked` (`98:2`, next to the certificate) — poster + card
front/back under an anti-removal watermark: ~45 wordmark tiles (26–34%, varied size/rotation),
diagonal line grid, centre shield, mixed NORMAL/OVERLAY blend modes (overlay entangles the mark
with image luminance — harder to inpaint), and explicit tiles OVER every face. Footer strip:
PROOF — NOT FINAL + `cardId` + `purchaseDate` (variable-bound). Export PNG 1x (2000px — far
below print res, so the proof is unusable for 18×24" even if cleaned). Attach to the approval
email before printing.

**Steps per order** (M = manual, A = automatable / Claude-assisted):
1. **(M) AI art from customer photos** — Nano Banana / ComfyUI: 3 identity-locked poses →
   transparent cutouts (rembg/BiRefNet), + 1 from-behind shot for the card back. The finish
   background is REUSED per style — do not regenerate it per order.
2. **(A) Upscale 4×** (upscayl-bin, realesrgan-x4plus, single pass) → cap 4096px.
3. **(A) Upload + swap** the 4 athlete-specific hashes (3 poses + card-back photo) and the
   team logo via `upload_assets`; team colors → `team/primary` / `team/secondary` variables.
4. **(A) Set Athlete variables** (name, number, position, team, stats, classOf, highlight,
   `purchaseDate`) + recompute the derived strings (fullNameUpper, cardId, metaLine…) — one
   script; ALL artboards update at once because everything is variable-bound.
5. **(A) Proof round:** export `98:2` → email → wait for approval.
6. **(A) Export everything** (all frames have export settings preset), regenerate the print
   poster (`90:2` refresh), `npm run qr:gen` for the card QR, registry entry.

**File strategy:** the template file holds ONE athlete at a time (variables are file-global).
Per order: **duplicate the Figma file** (right-click → Duplicate) named by cardId, work there,
keep the master template untouched. Two orders in parallel in one file = conflict.

**Other finishes** (Chrome All-Star, Fire & Smoke, Neon Future, Vintage): build in THIS same
template file as new rows, reusing the same variables + layout + atmosphere kit; only the
backgrounds/grades differ. An order's duplicate then contains every finish; export only the
ordered one.

## Registry + QR (built in this repo)

- `lib/registry/cards.ts` — file-based registry (source of truth) + helpers
  `makeCardId`, `cardUrl`, `getCard`, `getAthleteCards`. Card ID =
  `GDE-<styleCode>-<sportCode>-<season>-<jerseyNumber>` (e.g. `GDE-SN-BKB-2026-23`).
- `scripts/gen-card-qr.ts` + `npm run qr:gen` (deps: `qrcode`, `tsx`) → writes
  `public/cards/qr/<cardId>.png` (dark modules on white so it scans on dark cards). QR encodes
  `https://gamedayedition.com/c/<cardId>` (override with `NEXT_PUBLIC_SITE_URL`).
- `app/c/[cardId]/page.tsx` — **PLACEHOLDER** card page; renders registry data so scanned
  QRs resolve. Verified working on localhost.
- QR is placed on the Figma card back (`#card_qr` 56:2), replacing the old barcode.

## TODO / next steps

1. ~~Social + wallpaper set~~ **DONE**. ~~Print export~~ **DONE** (see Print pipeline below).
   Remaining for the Stadium Night pack: the **reveal video**.
2. **Card registry — real display:** design the `/c/[cardId]` "digital twin" page (hero render,
   reveal video, wallpaper download, share, "View full collection"); add athlete collection
   page `/a/[athleteId]`; migrate registry file → DB (`db/schema.ts` is empty; Drizzle present);
   wire order form → create card record + `qr:gen`. **Decided: no serial numbering** (still a run of 25, just not numbered).
3. **Merge automation (the big one):** a Figma plugin (or Make/Zapier) that, per order, sets the
   `Athlete` variable values (and recomputes derived vars/cardId), swaps in the AI cutouts +
   background, and exports all formats. This is the "minimal manual work per customer" goal.
4. ~~Chrome All-Star~~ **DONE — full parity, print + pack + bonus + flip video.**
   Remaining finishes: **Fire & Smoke, Neon Future, Vintage Card** — follow the propagation
   recipe, then `addMode` on the Style collection and pin the new page to it.
5. **AI art layer** — stand up the ComfyUI (or Nano Banana) recipe with locked seed + identity
   reference per finish for reproducible cutouts/backgrounds.

## Order form fields (from the site) → where they land
first name, last name/initial, jersey number, position/event, team, graduation year,
primary/secondary team color, season/year, short headline (`playerHighlight`), stats.
All map to `Athlete` variables; poster shows identity, card shows the data.
