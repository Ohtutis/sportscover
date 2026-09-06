# Game Day Edition — Project Handoff & Status

> Continuation doc so any Claude Code session (incl. a different account / stronger plan)
> can pick up this work. Last updated: **2026-08-20**.

## What this project is

**Game Day Edition** (domain: **gamedayedition.com**) turns a few real photos of a youth
athlete into a premium personalized package:

- **Poster** (18×24"), **25 collectible trading cards** (2.5×3.5"), digital artwork,
  phone **wallpaper**, **social** graphics, and a **reveal video**.
- **17 sports**, **5 fixed art finishes**: `Stadium Night`, `Chrome All-Star`,
  `Fire & Smoke`, `Neon Future`, `Vintage Card`.
- Per order we print **25 identical Hero Cards** (no rarity/Gold/Chrome variants yet).

The repo here (`package.json` name `game-day-edition`) is the marketing site + the card
registry. Brand was renamed **Cover Moment → Game Day Edition**; since 2026-09-06 the brand,
owner and canonical origin are code constants in `lib/site.ts` (no env override — see
`docs/SITE-F0-HANDOFF.md` for the stale Vercel variables to delete).

## The two production layers (don't mix them)

- **Layer A — AI art (external, NOT in Figma/MCP):** generate the athlete as
  **transparent cutout PNGs** (4 poses: hero + 2 supporting + from-behind) + sport/finish
  **backgrounds**. Both halves live in `art-pipeline/`.
  Tools: ComfyUI (Flux + PuLID/InstantID + OpenPose) for reproducible batches, or
  Midjourney `--cref` / Nano Banana (Gemini image) for fast identity-locked poses.
  Background removal: `rembg` (u2net) works; use **BiRefNet** for clean hair/edges in prod.
- **Layer B — layout/branding (Figma via MCP):** templates + variables. This is what the
  Figma MCP builds. It **cannot** generate the athlete image.

Pipeline: `[AI: cutouts + background] → [Figma template + variables → export] → registry/QR`.

**Layer A is now automated — see `art-pipeline/README.md`** (built 2026-08-19/20). It
generates the finish x sport background matrix from the approved finish backgrounds used as
image references, and grades every result against the same rules its prompt was built from.
That README is the handoff doc for the art layer: endpoint/auth gotchas, the data model and
why each field exists, the diagnosed failure modes, and what is still broken. Read it before
generating art. All 16 Chrome All-Star sport backgrounds exist as of 2026-08-20.

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
- **Name lockup is identical everywhere:** `#headline` (white/`paper`) → `accent_bar` (team primary) →
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

**Mode cap on this plan is 6 — now FULL** (all six finishes have a mode; adding a 7th
finish requires dropping one or upgrading the plan).
The old Athlete copies are renamed `zz_deprecated/*`; do not bind to them.

**All six modes (2026-08-19):** Stadium Night `141:6`, Chrome All-Star `141:7`,
Fire & Smoke `164:0`, Heritage `164:1`, Signature Spotlight `164:2`, Prism Rush `165:0`.
Each new page is pinned to its mode; the six string values follow the same pattern
(styleCode FS / HE / SS / PR; cardId `GDE-<code>-BKB-2026-23`).
Style-bound text needs no edits — it resolves per page automatically.

## Finish lineup finalized (2026-08-19) — 6 finishes

**Stadium Night · Chrome All-Star · Fire & Smoke · Heritage · Signature Spotlight ·
Prism Rush.** Neon Future and Vintage Card are DROPPED. Prism Rush is the colorful
social-first sixth style (was discussed as "Color Rush"); Heritage was almost named
"Legacy Edition" — folder + mode say **Heritage**.

### Typography: PER-FINISH font pairs (decided 2026-08-19, replaces the single-pair rule)
Each finish now has its own display + supporting pair — typography is part of the finish
identity, alongside material. Anton + Barlow Condensed are retired everywhere.

| Finish | Display | Supporting |
|---|---|---|
| Chrome All-Star | Russo One | Saira Condensed (SemiBold/Medium) |
| Fire & Smoke | Passion One Black | Khand |
| Heritage | Graduate | Archivo Narrow |
| Signature Spotlight | Space Grotesk Bold | Archivo |
| Prism Rush | Orbitron Black | Chakra Petch |
| Stadium Night | **Anton** (kept — user picked V1 as final; SN V2/Oswald was discarded) | Barlow Condensed |

Display = athlete name, ghost surname/number, stat values. Supporting = everything else
(meta, labels, profile, card id). The font-sweep script (session 2026-08-19) auto-shrinks
any line that outgrows its box after a swap — reuse it for Stadium Night.
⚠️ Chrome All-Star sections 02–05 still carry Anton/Barlow and the OLD background — the CA
print exports in `print-sources/output/chrome-allstar/` are STALE (fonts + background).

### Chrome All-Star hero refresh (2026-08-19)
- New hero background `print-sources/chrome-allstar/background-new.png` (3392×5056),
  Figma hash **`0956ffd5…`** — now the `#background` on poster `102:2` and `#card_bg`
  on card FRONT `102:63`. Old bg layers kept hidden as `zz_deprecated/bg_v1|v2`.
- Card BACK `102:85`: the old from-behind photo (`c5c5f76b…`) is hidden as
  `zz_deprecated/back_photo_v1`; backdrop is now the new chrome art + full-frame
  `photo_overlay` gradient scrim. Restore the photo layer when a new from-behind shot
  rendered in the new chrome set exists.

### New finish pages — section 01 · HERO & TEMPLATES (built 2026-08-19)

| Finish | Page | Section | Poster | Card FRONT | Card BACK | bg hash |
|---|---|---|---|---|---|---|
| Fire & Smoke | `164:2` | `166:2` | `166:3` | `166:46` | `166:71` | `16ca15e7…` |
| Heritage | `164:3` | `166:111` | `166:112` | `166:155` | `166:180` | `25305fe1…` |
| Signature Spotlight | `164:4` | `166:220` | `166:221` | `166:264` | `166:289` | `499986b7…` |
| Prism Rush | `165:3` | `166:329` | `166:330` | `166:373` | `166:398` | `1721839c…` |

Backgrounds live in `print-sources/<finish-folder>/` (3392×5056 each), uploaded to Figma
capped at 2748×4096 (Figma's 4096 limit), JPEG q92. Print poster exports later follow the
standard clone + `rescale(5475/1314)` recipe — sources are already at max Figma res.

**Propagation notes (differences vs the CA masters they were cloned from):**
- CA-only decorations removed from clones: `star_ghost`, `allstar_star`×3, `glint`×6.
- New-finish BACK cards have **no from-behind athlete photo yet** — the finish background
  + `photo_overlay` tint serves as backdrop; swap in the AI shot per finish when available.
- Per-finish materials (fills = 5-stop foil gradient on ghost type/accent bar/card border;
  radial glows/rims tinted):
  - **Fire & Smoke**: ember foil accents, warm glows; ghost number = Passion One with a
    vertical FIRE gradient (cream→orange→deep red, poster op 0.55 / front fill 0.75) +
    orange glow + 12 `ember` particles; warm border glow.
  - **Heritage**: antique-gold foil, amber glows; ghost number = Graduate varsity 3D
    block — cream fill 30% + gold stroke + `*_block_shadow` clone offset (+12/+20) in dark
    brown; `card_border_inner (heritage double line)`.
  - **Signature Spotlight**: silver foil kept, white glows, poster `scrim_bottom` 0.62;
    ghost number = OVERSIZED hairline outline (front 440px / poster 1120px, fill ~5%,
    white stroke) + `spotlight_beam` behind photos; border stays minimal silver.
  - **Prism Rush**: iridescent cyan–magenta foil, neon glows; ghost number = Orbitron with
    RGB split (`number_echo_cyan`/`number_echo_magenta` clones at ±13/8 front, ±22/12
    poster) + cyan glow; neon tube border; 3 `prism_streak` BEHIND photos, 4 `sparkle`.
- Posters mirror each finish's ghost-number treatment (`#number` on the poster).
- **Ghost-type placement rule (2026-08-19, after user pass):** POSTER carries the giant
  ghost NUMBER; card FRONT carries the ghost SURNAME (front `#number_ghost` layers were
  DELETED on CA/FS/HE/SS/PR — they collided with the surname); card BACK carries the
  number again, brighter (it is the back's main visual), styled like the poster's.
  The surname ghost uses the same material/effect treatment as the finish's number.
  Stadium Night keeps its own quieter originals (approved exception).
  ⚠️ Surname ghost is auto-width and sized for "BROOKS" — the per-order merge script MUST
  shrink `fontSize` if a longer `lastNameUpper` exceeds ~640px width (the 2026-08-19
  font-sweep script has the fit logic; PR's box overflowed at 128px → fixed to fit+centre).
- **Stat chips are per-finish** (back card `stats` → 3 `stat` frames): SN neutral glass
  (reference); CA brushed-chrome plates w/ silver-foil border; FS glowing-coal plates w/
  ember border + warm glow; HE walnut trophy plaques w/ gold border + gilt inner edge;
  SS hairline minimal glass; PR neon tiles w/ cyan→magenta border + cyan glow.
- **Border rule:** one geometry for all finishes (print-safe); individuality via material
  + one signature detail. Do not change border position/weight per finish.
- **Style glyph system (2026-08-19):** every finish carries a trio of signature symbols,
  layer name **`style_glyph`** (CA's `allstar_star` nodes were renamed to this), in the
  SAME two slots: poster above the nameplate (centres x 119/198/275, y ~1200,
  small-BIG-small) and card FRONT above `#team` (centres x 67/94/121, y ~780).
  Per finish: SN = floodlight dots (white + blue glow) · CA = ★ silver-foil stars ·
  FS = flames (Font Awesome "fire" silhouette SVG w/ inner-tongue cutout, fire gradient
  + glow — the first teardrop version was rejected) · HE = gold varsity chevrons ·
  SS = outline 4-point sparkles (stroke only) · PR = prism triangles (cyan→magenta +
  glow). Reuse the glyph on the pack + certificate when those sections are built.
  ⚠️ Card-front placement rule: `#team`'s y VARIES per finish (SN 775 / CA·FS 802 /
  HE·SS 792 / PR 785) — always place glyphs so their bottom sits **12px above the
  actual `#team` top**, never by copied absolute coords (that overlap already happened
  twice).

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

## V2 explorations — poster + card front (2026-08-19)

Separate exploration frames next to the originals (originals untouched), placed at
y=2160 inside each page's `01` section (sections grown to 3516×4150). Differentiation
on top of the V1 system:

| Style | Poster V2 / Front V2 | What changed |
|---|---|---|
| Stadium Night | `190:2` / `190:66` | display → **Oswald Bold** (cinematic); card gets an editorial `info_plate` + hairline rule behind the name block |
| Chrome All-Star | `190:93` / `190:136` | angular `chrome_panel` (skewed, foil stroke) + 5-star `star_row` = insert-card look. **Type is Russo One** — see the Michroma correction below |
| Fire & Smoke | `190:167` / `190:204` | display → **Anton SC**; nameplate tilted −2°; meta dots replaced with `separator_flame` glyphs |
| Heritage | `190:253` / `190:291` | **centered** classic composition (nameplate counter-axis CENTER, card block + chevrons centered; GDE wordmark stays bottom-right) |
| Signature Spotlight | `190:319` / `190:353` | **single-cutout minimal** (`#photo_2/3` hidden on both), name −15–20%, `hairline_accent` line |
| Prism Rush | `190:379` / `190:415` | display → **Audiowide**; RGB `name_echo_*` on the name (poster echoes are ABSOLUTE children of the autolayout nameplate!); `neon_line` diagonals; `hud_bracket` corners on the card |

V2 revision round (user feedback, same day): SN lightened (bg exposure +0.06/0.07,
scrim/vignette reduced, `info_plate` opacity 0.58); CA panel rebuilt to CONTAIN all info
incl. the GDE wordmark + star row (name capped ≤520px); FS poster surname is now
full-width Anton SC (~244px, sized via HUG — see gotcha) with card name 74px and metas
re-stacked; HE card block lifted and the wordmark centered beneath it (bottom 995);
SS supporting cutouts RESTORED at 0.55 opacity (3-photo trio = the product's
differentiator — never remove it); PR first name = surname (Audiowide, same size, own
RGB echoes) + smaller triangles + HUD brackets on the poster.
**PR RGB-split rule (after lockup repair):** echoes are HORIZONTAL-ONLY — diagonal
offsets read as mud. Name echoes ±4px @0.5, ghost-number echoes ±10px @0.3, always
re-anchored to the settled flow (`meta_spacer` frame gives the meta line its gap;
name lines use lineHeight 100%).

Gotchas recorded:
- Cloning a text node inside an auto-layout frame makes the clone a FLOW child (it
  stacks!) — set `layoutPositioning = 'ABSOLUTE'` first, and re-anchor echo positions
  AFTER the flow settles (any font/size change reflows and strands absolute echoes).
- A text child with `layoutSizingHorizontal: FILL` always reports the container width —
  width-targeted font sizing silently shrinks it. Switch to HUG, size, then restore FILL.
- The 3-photo trio composite is a hard brand rule (sales differentiator) — minimal
  styles reduce supporting-cutout OPACITY, never visibility.

**FINALS CHOSEN (2026-08-19 audit):** SN = V1 (Anton identity; its V2 frames were
discarded). CA/FS/HE/SS/PR = V2 (V1 posters kept hidden as reference: 102:2 / 166:3 /
166:112 / 166:221 / 166:330; V1 fronts were deleted). Canonical hero frames now:

| Finish | Poster | Card FRONT | Card BACK |
|---|---|---|---|
| Stadium Night | 38:2 | 40:2 | 49:2 |
| Chrome All-Star | 190:93 | 190:136 | 102:85 |
| Fire & Smoke | 190:167 | 190:204 | 166:71 |
| Heritage | 190:253 | 190:291 | 166:180 |
| Signature Spotlight | 190:319 | 190:353 | 166:289 |
| Prism Rush | 190:379 | 190:415 | 166:398 |

**Back-card font rule (unification audit):** back `#athlete_name` = the finish's NAME
display font (FS→Anton SC, PR→Audiowide were fixed; SN/CA/HE/SS already
matched); stat VALUES + back/poster ghost `#number` = the finish's NUMBER font
(SN Anton · CA Russo One · FS Passion One Regular · HE Graduate · SS Space Grotesk ·
PR Orbitron) — names follow the name font, numbers follow the number font.

> ⚠️ **Michroma is RETIRED from Chrome All-Star (user decision, 2026-08-20).** Earlier notes
> claimed CA's name font was Michroma. **CA display type is Russo One everywhere** — cards,
> poster, socials, wallpapers, pack lockup, certificate and bonus stickers. Saira Condensed
> stays as the supporting face. Michroma must not appear on any CA surface.
>
> Migrated in two passes: 5 stale `#athlete_name` nodes in derived social/wallpaper layouts
> (Story 1, ReelCover, Cover banner, Desktop wallpaper, Lock iPhone — several had `NIA` in
> Russo One and `BROOKS` in Michroma *inside the same lockup*), then the pack's
> `style_line_1`/`style_line_2`, the certificate `#athlete_name` and the bonus sticker.
>
> **Russo One sets ~35 % narrower than Michroma at the same size**, so every swap needs a
> refit, and the refit target differs by context: width-driven lockups (pack lines, sticker)
> refit to their previous optical width; a fixed-width centred block (the certificate name)
> must be sized to the **vertical gap to the element below it** — fitting it to 92 % of its
> box pushed it to 309 px and straight through the meta line.

> ⚠️ **Prism Rush is now an explicit EXCEPTION to that rule (user decision, 2026-08-19).**
> PR stat VALUES follow the **NAME** font (**Audiowide**), not the number font. The ghost
> `#number` and the poster `#number` stay **Orbitron Black**. The other five finishes keep
> the name/number rule unchanged — do not generalise this.

### Hero → replica propagation pass, Stadium Night (2026-08-19)

Full re-sync of every SN replica against the three hero masters (poster `38:2`,
front `40:2`, back `49:2`). **Method: diff first, then sync — never blind-clone everything.**

**The diff script** (keep it, it is the tool for this job): walk `hero.children`, key each
layer as `name#occurrenceIndex` (handles the 3× `style_glyph` duplicates), and compare each
replica scale-normalised by `k = replicaWidth / heroWidth`. Report `missing` / `extra` /
`moved` where `|Δ| > 2 px`, plus opacity and visibility deltas.

What it found and what was done:

| Group | Finding | Action |
|---|---|---|
| 13 card replicas (front + back) | `style_glyph` trio **absent** from 5 front replicas; `#number_ghost` off by 32–86 px on **all 6** back replicas; `signature_label`/`line` off 6–17 px | Geometry/opacity/visibility synced from hero, 15 missing glyph nodes cloned in. **Drift now 0.** |
| 3 true 1:1 poster copies — `proof_poster`, print export, Grid 1 `poster_art` | 47 layers vs hero's 50 | **Replaced outright** with fresh `hero.clone()` + `rescale(k)`, preserving each one's name/x/y/size and parent index |
| Story 1, ReelCover, Profile, 7 wallpapers | Derived layouts — own lockups, `atmosphere_marker`, `#number_ghost` instead of `#number` | **Left alone** (user decision). These are NOT copies; blind-syncing would destroy their compositions. |

**Replicas that intentionally omit hero layers** — keep this skip-map when syncing:
`211:4` (print FRONT) omits `#card_bg` + `scrim`; `211:31` (print BACK) omits `#card_bg` +
`photo_overlay`. Those live as full-bleed layers *outside* the clone.

### Hero → replica propagation pass, Chrome All-Star (2026-08-19)

Same diff-first method as Stadium Night, against the canonical **V2** heroes:
poster `190:93`, front `190:136`, back `102:85`.

**The hero back's background had been replaced** with a new from-behind shot (`c5c5f76b…`)
imported as a layer literally named **`download (12) 1`**. Renamed to **`#card_bg`** — the
`#`-prefixed name is what every propagation script matches on, so an import-named layer
silently breaks the sync (replicas keep their own `#card_bg` and the new art never travels).
**Always rename dropped-in art to its token name before propagating.**

Unlike SN, most CA replicas were built from the **superseded V1 front** — they carried
`allstar_star` + `#number_ghost` and were missing `chrome_panel` and all three `glint`
layers (17 layers vs the hero's 20). Geometry-syncing could not fix that, so **all 16
replicas were rebuilt outright** as `hero.clone()` + `rescale(k)`:

| Group | Replicas rebuilt |
|---|---|
| FRONT (hero `190:136`) | print clone, `proof_card_front`, Grid 2, Story 2, `CardFlip_Front`, 2× MotionSpec |
| BACK (hero `102:85`) | print clone, `proof_card_back`, Grid 3, Story 3, `CardFlip_Back`, MotionSpec |
| POSTER (hero `190:93`) | print export, `proof_poster`, Grid 1 `poster_art` |

**When replacing rather than syncing, carry these across or they are lost:** `name`, `x`,
`y`, and **`exportSettings`** (`CardFlip_Front`/`Back` each carry one — losing them breaks
the flip pipeline). Then re-strip the layers the print clones intentionally omit.

⚠️ **The print BACK bleed plate was showing the FRONT artwork** — `#card_bg (bleed)`
(`210:33`) was filled with `0956ffd5` (the chrome front background) while the back had moved
to `c5c5f76b`. Repointed, and `photo_overlay (bleed)` re-synced from the hero. **Whenever a
card's background changes, the print frame's bleed plate must be repointed too — it lives
outside the clone and no propagation script will touch it.**

Residual drift after the pass: **0**, except the print-export poster's `#number`, 3 px wider
than `hero × 4.167` — text auto-resize rounding at 4× scale, 0.06 % of a 5400 px canvas.

⚠️ **`Card · Chrome All-Star — FRONT` (`102:63`) was left untouched.** It is the superseded
V1 front, it still sits **loose at page level** (against the "nothing at page level"
convention) and it is 4 layers behind the V2 hero. It is referenced by nothing — recommend
deleting it.

⚠️ **CA flip videos are stale** (user deferred rendering). `CardFlip_Front`/`Back` were
rebuilt, so `card-flip/assets/ca/` and `card-flip/out/GDE_CA_*` need a re-export + re-render
before the next delivery.

### Certificate carries the personalisation block (2026-08-20)

The certificate is often framed and hung next to the poster, so it now repeats the athlete's
own statement, not just the registry fields. `#headline` + `#bio` were added under the name
lockup on both certificates, styled from that finish's **card back** (font, fill and letter
spacing are read off `#headline`/`#bio` at build time, so it ports to the other finishes):

- `#headline` — 76 px, centred, letterSpacing 6 %, lineHeight 120 %, y 1300
- `#bio` — 42 px, centred, lineHeight 120 %, y = headline bottom + 22

To make room, **everything between the name block and the legal statement shifts down
150 px** — select by geometry (`1400 ≤ y ≤ 2700`), which catches the six field rows, the
divider, the QR block, the seal and the signature without touching the statement (y 2740) or
the footer (y 3010). The band that opens up is ~264 px; the block uses ~165 of it.

### Bonus stickers redesigned (2026-08-20)

The old name sticker and number badge were **floating text with a drop shadow** — no
silhouette, no die-cut edge, and `#number` sat off on its own with no relationship to the
name. Rebuilt as real stickers, since these may go to print as die-cuts.

**Sticker anatomy (all finishes):**

1. `cut_contour` — the silhouette in paper-white `#F8FAFC`, carrying the lift shadow. This
   is the die-cut border and it is what makes the thing read as a sticker.
2. `plate` — the themed background, inset ~14 px inside the contour.
3. `foil_edge` / `foil_hairline` — a foil stroke just inside the plate.
4. content: `style_glyph` trio, `#first_name`, `#athlete_name`, and the number in its **own
   overlapping token** — overlap is what stops it looking like a rectangle of text.

**Shape carries the finish** (this is the one place where finishes differ by silhouette, not
just material):

| | Name sticker | Number badge |
|---|---|---|
| Stadium Night | soft rounded banner (r 70/58) + circular **coin** in `team/primary` | circular collector **coin**, foil ring |
| Chrome All-Star | **chamfered** slab (74 px corner cut, vector path) + octagonal chip | **hexagon** patch (pointy-top), foil edge |

Chamfer path helper: `M c 0 L w-c 0 L w c L w h-c L w-c h L c h L 0 h-c L 0 c Z`.
Hexagon: `M w/2 0 L w h/4 L w 3h/4 L w/2 h L 0 3h/4 L 0 h/4 Z`.

⚠️ **Set `lineHeight` to 100 % on sticker display type.** Anton's default text box is ~1.5 ×
the font size, so a surname positioned by `y` alone hangs straight out of the plate. With an
explicit line height the box equals the font size and the layout becomes predictable.

⚠️ **`get_screenshot` composites onto opaque white — it CANNOT export transparency.** The
first sticker export came back RGBA but fully opaque, which would have been useless as a
die-cut. Use **`download_assets`** for any transparent asset: it honours the node's own
export settings (these are PNG @2×, `contentsOnly`) and preserves alpha. Verify with
`Image.getchannel('A').getextrema()` — the low end must be 0, not 255.

⚠️ When rebuilding a frame's contents, do not `clone()` a child and then wipe the frame with
a snapshot of `children` — the snapshot includes the clone and removes it too. Source clones
from a node **outside** the frame (the certificate shield works well).

### Print bleed: the card FACE must own its background (2026-08-20)

A print card frame is `bleed plate` + `overlay plate` + the card clone on top. It is tempting
to strip `#card_bg`/`scrim`/`photo_overlay` from the clone and let the plates show through —
**do not.** The plates are `816×1110` with `scaleMode: FILL`, which centre-crops on a
different aspect than the hero's own background placement (CA back: `761×1135` at `-7,-10`
inside a `750×1050` card). The result is a silently different crop — on CA it cropped the
from-behind athlete straight out of the card.

**Rule: the clone keeps its own background layers, scaled by `k`, so the TRIM area is a pixel
match for the hero. The plates exist only to fill the 36 px bleed margin**, which is cut away
anyway — an approximate crop there is invisible in the finished product.

### Pack flap centring — texts drift, vectors do not (2026-08-20)

Flap content is centred on the **visible, post-fold** part of the panel, not on the panel
frame. Folds sit at page `x = 212 / 605 / 1423 / 1815`, so:

| Flap | Panel origin | Visible span | Local centre |
|---|---|---|---|
| left (inner) | `x 0` | 212 → 605 | **408.5** |
| right (outer) | `x 1423` | 1423 → 1815 | **196** |

On CA every flap **text** had drifted off that centre by up to **69 px** while the shields,
hairlines, wordmark and QR were still correct — the same font-swap damage that threw the CA
certificate footer off-canvas. Re-anchor with `t.x = localCentre - t.width / 2`.
**After any font change, re-centre by measured width; never trust the stored `x`.**

### Pack front — style signature (2026-08-19)

Both production packs are deliberately **typographic only** — no athlete, no card preview (user
decision). It gained the floodlight-dot `style_glyph` trio so the pack carries the same style
cue as the poster and both cards: sizes **18 / 24 / 18**, centre spacing **44 px**, centred on
the panel at **y 196** — i.e. crowning the panel, 68 px above the GDE shield.

⚠️ First attempt put the trio in the box gap between `COLLECTOR SERIES` (ends y 638) and
`STADIUM` (starts y 678) and it **collided with the letterforms**: Anton's glyphs render
*above* their text-box top, so a 40 px box gap is not 40 px of visual air. When placing
anything against Anton, judge from a screenshot, not from `y + height`.

Chrome All-Star got the same treatment with its **star** glyph (CA's `style_glyph` is a
STAR, not an ellipse): sizes **30 / 40 / 30**, spacing **52 px**, same y 196, cloned from the
hero front so the foil gradient carries over.

**Copy fix — BOTH packs:** the left flap said *"One of **five** art finishes"*. The lineup
has been six since the 2026-08-19 decision. Both now read "six".

### Stat-chip transparency rule — opacity goes on the FILL, never the frame (2026-08-19)

**Target: the chip background reads at 70%, the value + label text stay 100% bright.**

The trap: setting `opacity` on the `stats` row or on a `stat` frame dims **everything inside
it**, text included — node opacity composites the whole subtree. Five of the six finishes had
exactly this (`stats` row at 0.7–0.8), which is why the numbers looked washed out.

```js
// WRONG — dims the numbers and labels too
chip.opacity = 0.70;

// CORRECT — only the background plate goes translucent
chip.opacity = 1;
chip.fills = chip.fills.map(f => ({ ...f, opacity: 0.70 }));  // paint-level opacity
```

Applied to all six hero card BACKs: row `opacity → 1`, chip frame `opacity → 1`, chip **fill
paint** `opacity → 0.70`, every descendant `opacity → 1`. Strokes were left alone — the
border is identity (CA foil, PR neon, HE gold, SS hairline) and must stay crisp.

| Finish | Hero BACK | `stats` row | Row opacity before |
|---|---|---|---|
| Stadium Night | `49:2` | `49:12` | 0.70 |
| Chrome All-Star | `102:85` | `102:95` | 0.80 |
| Fire & Smoke | `166:71` | `166:82` | 0.80 |
| Heritage | `166:180` | `166:191` | 0.70 |
| Signature Spotlight | `166:289` | `166:300` | 1.00 |
| Prism Rush | `166:398` | `166:409` | 0.80 |

⚠️ **Signature Spotlight needed a colour change, not just an opacity change.** Its chip fill
was pure **WHITE** at 0.05 — at 0.70 that became a near-solid light block and swallowed the
white value text. SS chips are now the same dark-glass gradient as the family
(`0.109,0.129,0.169 → 0.043,0.051,0.071` @0.70), keeping SS's own thin light stroke and
inner shadow. **Before applying a "make it N% transparent" instruction, check whether the
fill is light or dark — the same number reads opposite ways.**

⚠️ **This was scoped to the HERO cards only (user decision).** The SN and CA hero BACKs now
**differ from their 6 print/proof/social/flip replicas**, which still carry the older chip
values (SN fill 0.82, CA 0.88, row 0.7/0.8). The tracked print PNGs and the flip videos were
**not** re-exported for this change. Propagate with the replica table above before the next
print run.

### Prism Rush neon treatment (canonical recipe)

Neon in PR is a **3-layer RGB split**, not a glow alone. Any display text that should read
as neon gets all three:

| Layer | Fill | Position |
|---|---|---|
| `*_echo_magenta` | solid `(1, 0.35, 0.90)`, fill opacity **0.5**, no effects | main **+ offset** |
| `*_echo_cyan` | solid `(0.30, 0.92, 1)`, fill opacity **0.5**, no effects | main **− offset** |
| main text | normal fill (paper-white or gradient) | carries the glow |

- **Echoes sit BEHIND the main node** (insert at the main node's index, magenta first).
- **Offset scales with type size: `4 × fontSize / 62`** — ±4 px at the 62 px V2 name.
- **Echoes are HORIZONTAL-ONLY** (no vertical component) — see the PR RGB-split rule above.
- **Glow** = `DROP_SHADOW`, cyan `(0.30, 0.92, 1)` @ ~0.45, `offset 0,0`, `spread 0`,
  radius ≈ 16–18 on card type, 36 on the card ghost, 90 on the poster number.
- Inside an **auto-layout** chip the echo clones must be set to
  `layoutPositioning = 'ABSOLUTE'` or they will flow as siblings instead of stacking.

Applied 2026-08-19 to the PR back card: `#athlete_name` (`166:405`) gained the echo pair +
glow, the three stat values gained `value_echo_*` pairs + glow, and the V2 front name
(`190:435`) gained the matching glow so front and back read identically.

**Also fixed in the same pass:** the PR stat row was uneven — chip 1 was **126 px** tall
with a **51.5 px** value while chips 2–3 were 116 px / 44.2 px. Normalised to **115 px**
chips, **44.2 px** values, labels at `y 75`, everything re-centred (`x = (chipW − w) / 2`).

When propagating to sections 02–05, clone from the canonical frames above.

## SN + CA propagation to sections 02–05 — DONE (2026-08-19)

- **Cleanup:** hidden V1 posters deleted on every page (SN backup `9:2`, CA `102:2`,
  FS `166:3`, HE `166:112`, SS `166:221`, PR `166:330`); CA back's hidden
  `zz_deprecated/back_photo_v1` layer deleted (old from-behind shot hash `c5c5f76b…`
  stays recoverable from this doc). Functional hidden layers (TEMPLATE_GUIDES,
  atmosphere_marker, crop guides) kept.
- **CA sections 02–05 swept:** 33 image fills old-chrome→new (`0956ffd5…`), ~300 text
  nodes migrated (Anton→Russo One, `#athlete_name`→Michroma incl. 12 Russo stragglers,
  Barlow→Saira, Inter leftovers), headline lockup rule applied (paper white + 6% + primary
  bars).
- **SN sections 02–05 swept:** 6 Inter bullets→Barlow, 13 headlines→paper white 6%,
  15 accent bars bound to team/primary.
- **Rebuilt from canonicals:** PRINT card FRONT/BACK on both pages (bleed recipe:
  full-bleed `#card_bg (bleed)` + `scrim/photo_overlay (bleed)` + design clone rescaled
  744/750, cornerRadius 0), CardFlip front/back ×2 pages (content replace), poster print
  exports `90:2` and `105:1218` (frame fill = bg image, clone rescale 5475/1314).
- **CA pack:** CHROME/ALL-STAR lockup → Michroma (81/69px, both lines ≈540 wide).
- **Certificates:** "25 cards" → "10" on BOTH certs (SN `79:2`, CA `144:120`).
- **Repo print outputs REGENERATED** (816×1110 / 2032×1560 / 2550×3300, 300 DPI RGB):
  SN + CA card FRONT/BACK, CA pack flat, CA certificate.
- **Still stale / TODO:** ~~flip videos~~ **DONE** (see "SN + CA final pass"); ~~CA proof
  `105:803`~~ **DONE** (it re-renders from the swept frames — verified). SN social/wallpapers
  still don't carry the floodlight-dot glyphs (hero-only detail — add manually if wanted);
  site copy still says 25 cards (`app/site-client.tsx`).

## SN + CA final pass — DONE (2026-08-19, later session)

Closing pass over the two production-complete finishes. Three real defects were found and
fixed, then propagated and re-exported.

### 1 · Certificates had no authentication stamp
`AUTHORISED · GAME DAY EDITION` sat under a bare rule — nothing signed it. Added
**`auth_seal`** (SN `220:2`, CA `220:10`), a 360 px silver-foil notary seal placed in the
gap between the QR block and the signature line, so the bottom row now reads
**QR → SEAL → SIGNATURE**:

| Layer | What |
|---|---|
| `seal_rosette` | 56-point STAR, `innerRadius 0.945` — scalloped notary edge, foil fill @0.45 |
| `seal_disc` | white @0.05, so the rings read on navy |
| `seal_ring_outer` / `seal_ring_inner` | foil strokes 5 px / 2.5 px |
| `seal_shield` | clone of the certificate's own GDE Shield, 100 px, foil fill |
| `seal_top` / `seal_bottom` | `AUTHENTICATED` / `GAME DAY EDITION` |

Foil = the standard 5-stop white→#C7D0DC→white gradient, ~20° tilt. **Seal type uses the
finish's SUPPORTING font** (SN Barlow Condensed SemiBold, CA Saira Condensed SemiBold) — it
is read from the cert's own `signature_label` node at build time, so the recipe ports to the
other four finishes unchanged. The seal frame carries a drop shadow so it reads embossed.

### Certificate signature (`auth_signature`)

The signature line is now actually signed. `auth_signature` (SN `233:2`, CA `233:3`) is a
430×143 rectangle with an **image fill, `scaleMode: FIT`**, sitting at **x 1590, y 2272** so
the ink rests on `signature_line` (y 2400) with the flourish crossing it, the way a real
signature does. Both finishes share one Figma image hash — **`adb19971…`** — so a re-upload
is only needed if the artwork itself changes; to add it to another finish, just set the same
`{type:'IMAGE', imageHash, scaleMode:'FIT'}` fill on a new node.

Cutout recipe (source was dark ink on cream paper; tracked at
`print-sources/brand/GDE-auth-signature.png`, 997×331 RGBA):

1. Luminance `L = 0.2126R + 0.7152G + 0.0722B`.
2. Estimate the plate robustly — `paper = percentile(L, 92)`, `ink = percentile(L, 0.5)` —
   never hardcode 255/0, the scan has a vignette.
3. Soft alpha ramp `alpha = clip((hi − L) / (hi − lo))` with `lo = ink`,
   `hi = paper − 0.18·(paper − ink)`; zero anything under 0.06 to kill paper grain, then
   `alpha **= 0.85` so the hairlines survive.
4. 0.4 px Gaussian blur on the alpha to anti-alias, crop to the ink bbox + 12 px margin.
5. **Recolour the strokes** to paper-white `#F8FAFC` and keep only the alpha — do not ship
   the original ink colour, it has to read on navy.

⚠️ Keep the RGB channels flat white; if you leave the original ink colour in the RGB and
only mask the alpha, the semi-transparent edge pixels fringe blue against the navy ground.

### 2 · Card BACK — three defects (both finishes)
- **`#number_ghost` overflowed the card** on the top and right edges (x 483 + w 297 = 780 in
  a 750 frame, y −40). Print-unsafe. **Placement rule now: right edge of the ghost sits
  `38·k` px inside the frame, top at `26·k`**, where `k = hostWidth / 750`.
- **`#card_bg` was offset 61 px down** on Stadium Night, so the top of the card had no art
  (flat navy band) and the bottom 61 px of the image fell outside. Reset to 0,0.
- **`photo_overlay` bottom was only 0.20–0.30 alpha**, so the crowd and the athlete's legs
  fought the headline, signature and QR. New SN ramp: `0.90 → 0.84 @40% → 0.66 @62% →
  0.80 @80% → 0.90`. Keeps the athlete readable mid-card, restores contrast under the text.
- **Stat chips were invisible** (white 0.035 fill / 0.07 stroke) — the third chip vanished
  into the ghost number. SN chips now: dark glass gradient @0.82, white hairline @0.20,
  1.5 px, inner + drop shadow. **SN stays NEUTRAL glass — the foil-stroked plate is Chrome
  All-Star's cue.** CA chips were already correct and were not touched.

### 3 · CA certificate footer was off-canvas
`GAMEDAYEDITION.COM` (`144:147`) sat at x 1077 with width 2150 → right edge 3227 on a
2550-wide canvas, so it rendered hard right instead of centred. The font sweep had resized
it without re-anchoring. Reset to x 200 / w 2150 / CENTER; `statement` re-centred to x 450.

### Propagation — 6 replicas per finish
The card BACK is copied into six other places per page. **All of them carried the same
defects** and were fixed with a scale-aware pass (`k = hostWidth / 750`):

| Replica | SN host | CA host |
|---|---|---|
| PRINT card BACK clone | `211:31` | `210:35` |
| Proof `proof_card_back` | `98:86` | `111:158` |
| SOCIAL Grid 3 `card` | `70:96` | `111:30` |
| SOCIAL Story 3 `card` | `71:98` | `111:94` |
| CardFlip_Back | `92:25` | `111:222` |
| MotionSpec CardFlip_Back | `92:112` | `144:287` |

The PRINT frame's **full-bleed `photo_overlay (bleed)`** layer lives outside the clone and
needs the gradient too (SN `211:30`; CA `210:34` unchanged).

⚠️ **Gotcha re-confirmed:** `page.query('[name=#number_ghost]')` returns **0 results** — the
`#` prefix is not matchable. Use `page.findAll(n => n.name === '#number_ghost')`.

⚠️ **`get_screenshot` never upscales.** Asking for `maxDimension 2100` on a 750×1050 frame
returns 750×1050. To export at 2×: clone → `page.appendChild` → `rescale(2)` → screenshot →
**remove the clone**. Same trick as the poster print export.

### Re-exported
| File | Note |
|---|---|
| `output/stadium-night/GDE-SN-card-BACK-816x1110-300dpi.png` | card-back fixes |
| `output/stadium-night/GDE-SN-certificate-2550x3300-300dpi.png` | **new file** — SN cert had never been exported |
| `output/stadium-night/GDE-SN-booster-pack-FLAT-2032x1560-300dpi.png` | was stale vs the font sweep |
| `output/stadium-night/GDE-SN-poster-{BLEED,TRIM}-*.png` | regenerated (gitignored) |
| `output/chrome-allstar/GDE-CA-card-BACK-816x1110-300dpi.png` | card-back fixes |
| `output/chrome-allstar/GDE-CA-certificate-2550x3300-300dpi.png` | seal + footer fix |
| `output/chrome-allstar/GDE-CA-poster-{BLEED,TRIM}-*.png` | **new** — CA poster print export had never been generated (gitignored) |
| `card-flip/assets/{,ca/}card-{front,back}.png` | fresh 2× exports |
| `card-flip/out/GDE_{SN,CA}_CardFlip_{1080x1350,1080x1920}.mp4` + `_540.gif` | all 6 re-rendered |

TRIM posters are a centred crop of the BLEED file (offset 38 px; the 0.125" bleed is 37.5 px
per side, so it cannot be exact). Run the GIF-producing render LAST for the cut you want the
GIF to come from — every `render.sh` invocation overwrites `GDE_<STYLE>_CardFlip_540.gif`.

## Fire & Smoke — section `02 · PRINT READY` BUILT (2026-08-20)

Third finish to reach print parity. Page `164:2`, new section **`276:2`**, built from the
canonical FS heroes (poster `190:167`, card FRONT `190:204`, card BACK `166:71`) — no CA art
was carried over except the pack/certificate *structure*, which was cloned then re-materialised.

| Deliverable | Node | Output file |
|---|---|---|
| Poster print export (5475×7275) | `277:2` | `print-sources/output/fire-and-smoke/GDE-FS-poster-PRINT-5475x7275-300dpi.png` (gitignored) |
| **PRINT card FRONT / BACK** | **`276:3` / `276:47`** | `…/fire-and-smoke/GDE-FS-card-{FRONT,BACK}-816x1110-300dpi.png` |
| **PACK flat** | **`278:2`** | `…/fire-and-smoke/GDE-FS-booster-pack-FLAT-2032x1560-300dpi.png` |
| **Certificate** | **`278:56`** | `…/fire-and-smoke/GDE-FS-certificate-2550x3300-300dpi.png` |

**Print cards** follow the 2026-08-20 bleed rule exactly: the clone keeps its own background
layers (`#card_bg`, `scrim` / `#back_photo` + `photo_overlay`), `rescale(744/750)`, centred at
`36, 34.2`; the plates underneath only fill the 36 px bleed margin. FS BACK needs **three**
plates, not two — `#card_bg (bleed)` (finish art) + `back_photo (bleed)` + `photo_overlay (bleed)` —
because FS already has its own from-behind shot (`330c90db…`), unlike the other new finishes.
That layer was named `image - 2026-08-19T224045.012 1`; renamed to **`#back_photo`** on the hero
and the print clone so the merge script can find it.

**FS pack treatment** (cloned from CA `142:2`, then re-materialised):
- base gradient charcoal→ember-brown→near-black `#150D08 → #2E1810 → #0A0503`; `chrome_texture`
  renamed **`finish_texture`** = the FS background `16ca15e7…` @0.50 (temp +0.12, contrast +0.12,
  sat −0.05); `glow_floodlight` → **`glow_ember`**; both rim glows, vignette and both scrims
  re-tinted warm (the CA originals are navy — leaving them makes the fire read purple).
- Every foil paint (shields, wordmarks, ghost shield, hairlines, lockup) → the FS ember foil
  5-stop ramp, i.e. the same ramp as the card border.
- `style_glyph` = the **flame** trio cloned from the hero front, sizes 30/40/30, centres
  x 359.6/411.6/463.6 local, centre y 196 — same slot as CA's stars.
- Lockup `FIRE &` / `SMOKE` in **Anton SC**, `back_footer` copy updated to the finish name.
  (`left_heading` is bound to `styleNameUpper`, so it filled itself.)

⚠️ **Anton SC cannot be width-fitted like Russo One.** Sizing the lockup to 535 px wide the way
CA does produced **209 px** type (Anton SC sets ~0.37 em/char vs Russo One's ~0.57) and a 411 px
block that ran into the accent bar. Fix: fit with **tracking**, not size — `letterSpacing 26 px`,
solve `fontSize` for the target width, which lands at 154/145 px and a 307 px block. The accent
bar, card count and edition line are then re-flowed from the measured block bottom
(`bar = bottom + 60`, `contents = bar + 42`, `edition = contents + 10`). Applies to any
condensed display face — Heritage's Graduate will need the same treatment.

**Certificate**: warm ground `#140C08`-ish (the frame fill was bound to a file-global variable —
setting an explicit fill unbinds this node only, it does not touch SN/CA), ember glow, ember foil
on border/shield/rule/seal, Saira→Khand, `#athlete_name`→Anton SC fitted to the **vertical gap**
above `#meta` (the CA rule — never to the box width). Landed at 153.3 px.

**Proofed, not eyeballed:** the pack geometry check (31 content nodes vs safe box x 165–1876 /
y 157–1404 and each panel's own fold span) returns 0 problems.

### Sections 03 / 04 / 05 + proof - BUILT (2026-08-20)

| Section | Node | Contents |
|---|---|---|
| `03 · SOCIAL` | `287:2` | grid 1-3, story 1-3, reel cover, profile picture, cover banner |
| `04 · WALLPAPERS` | `287:3` | 4 branded + 3 clean, all with `TEMPLATE_GUIDES` |
| `05 · DIGITAL BONUS` | `294:2` | card-flip front `294:3` / back `294:44`, motion spec `294:84`, 4 cutouts, sticker `296:3`, badge `296:21` |
| Proof (watermarked) | `297:2` | in section 02 - poster + both cards under the anti-removal watermark |

**Method - sweep, don't re-clone.** The social/wallpaper artboards are *derived layouts*, not
copies of the hero: they reuse the poster's layer names (`#background`, `glow_main`, `rim_*`,
`scrim_bottom`, `vignette`) with their own composition. So each CA artboard was cloned and then
swept: image hashes `0956ffd5...`->`16ca15e7...` and `c5c5f76b...`->`330c90db...`, atmosphere
fills copied **by layer name off the FS hero poster**, everything else run through a cool->warm
remap (`b > r + 0.04` -> warm), CA `glint`/`star_ghost`/`chrome_panel` deleted, CA stars swapped
for the flame `style_glyph`. Only the frames that *embed* art (grid 1 `poster_art`, grid/story
2-3 `card`, the motion spec, the proof) got true hero clones, rescaled to their existing box.

**Two traps this pass hit - both worth remembering:**
1. **A neutral gradient is not necessarily foil.** The first sticker/badge sweep replaced every
   near-neutral ramp with the ember foil ramp - including the **dark graphite plate**, which lit
   up copper and swallowed the type. Gate the substitution on luminance: only ramps averaging
   **> 0.55** are foil; darker neutral ramps are plates and must stay dark.
2. **Anton SC sets ~1.44x narrower than Russo One** (`Passion One` ~1.42x, measured per string
   with a throwaway text node). A straight family swap silently shrinks every lockup. Each
   swapped text is refitted by its own measured ratio, then the column is **re-stacked
   bottom-anchored with gaps scaled by the same factor**, damped so the block never outgrows its
   frame (`damp = available / newBlockHeight`; Story 1 needed 0.87, desktop 0.91).

**Bonus stickers get their own SILHOUETTE, not just their own material (2026-08-20, user call).**
Re-materialising the CA sticker/badge left them reading as Chrome All-Star, because the *shape*
is what you recognise first: CA's chamfered-octagon plate and hexagon badge. Fire & Smoke now
has its own die-cut geometry, authored as `vectorPaths` on the existing `cut_contour` / `plate` /
`foil_edge` / `chip_*` nodes (same three concentric boxes, so nothing else had to move):

| Asset | Fire & Smoke silhouette |
|---|---|
| Sticker plate | **ember banner** - straight top/bottom so the name stays legible, flame-swept curved ends |
| Number chip + badge | **flame-crest disc** - round body, three tongues (centre tall, two outer) rising off the top |

The badge's `GDE Shield` moved down to y 250 because the old position sat where the flame
tongues now are. Path gotcha: **Figma's `vectorPaths` parser rejects commas** - write
`C x1 y1 x2 y2 x y`, not `C x1 y1, x2 y2, x y` ("Invalid command at ,"). Keep every path
touching all four bounds of its box or the node's bbox (and therefore its position) shifts.
This shape-per-finish rule applies to the **bonus die-cuts only** - the card border stays one
geometry for every finish (print-safe).

**Exports:** `exports/fire-and-smoke/bonus/GDE-FS-{sticker-name-number,badge-number}.png`
(2x transparent - alpha verified 0-255 via `download_assets`, never `get_screenshot`).

**Flip video RENDERED:** faces exported at 2x to `card-flip/assets/fs/`, then
`STYLE=FS FLIP_ASSETS=assets/fs FLIP_BG=18,10,6,255 ./render.sh` (4:5) and the same with
`FLIP_W=1080 FLIP_H=1920 FLIP_CARD_H=1150` (9:16) -> `card-flip/out/GDE_FS_CardFlip_*.mp4`
(5.0 s each) + `GDE_FS_CardFlip_540.gif`. The 4:5 cut was rendered LAST so the GIF comes from it.

**Fire & Smoke is now complete** - every deliverable Stadium Night and Chrome All-Star have.

## Screen safe zones — wallpapers & socials (2026-08-20)

Until now only the **pack** had a safe area. Wallpapers had none, and because every finish's
wallpapers descend from the Chrome All-Star originals, they all placed type in the corners
and inside OS chrome. Defined now, and enforced with a hidden **`TEMPLATE_GUIDES`** frame in
every wallpaper artboard (same convention as the pack: unhide to proof, hide before export).

**Rule: ART MAY BLEED — TYPE AND MARKS MAY NOT.** Ghost numbers, cutouts and backgrounds are
allowed to run off the edge; `#athlete_name`, `#meta`, `accent_bar`, the GDE wordmark and any
logo must sit inside the safe box.

| Template | Canvas | Safe box (x0,y0 -> x1,y1) | What the box avoids |
|---|---|---|---|
| Desktop | 3840x2160 | **300, 300 -> 3540, 1830** | 16:10 / 3:2 re-crop (7.8 % per side), 21:9 re-crop (12 % top+bottom), macOS menu bar, Dock ~240 px, Windows taskbar, desktop icon column |
| Phone - lock | 1290x2796 | **90, 720 -> 1200, 2400** | status bar, the **clock/date block y 170-560**, widget row to 700, quick-action buttons y 2440-2620, home indicator y 2700+ |
| Phone - home | 1290x2796 | **90, 300 -> 1200, 2400** | status bar, dock y 2440+. (Icons cover y 300-2400 anyway - a home wallpaper is mostly hidden, so branding belongs just above the dock.) |
| Tablet (iPad) | 2048x2732 | **150, 220 -> 1898, 2440** | status bar, dock y 2500+ |

### Desktop needs a second, tighter tier: `focus_zone` (2026-08-20, user call)

The hard `safe_zone` above covers 3:2 and 21:9 but **not** 5:4, and type sitting on the margin
reads stretched on ultrawide even when it technically survives. How a 3840x2160 wallpaper is
actually cropped by "fill":

| Display | Aspect | Cropped |
|---|---|---|
| 2560x1600 / 1440x900 | 1.60 | 5 % off each side |
| Surface 3:2 | 1.50 | 7.8 % off each side |
| 3440x1440 / 2560x1080 | 2.37 | **12.5 % off top AND bottom** |
| 1280x1024 (legacy) | 1.25 | **15 % off each side** |

So desktop artboards carry a second guide, **`focus_zone` = `576, 380 -> 3264, 1780`**, which
survives every one of those. All desktop type and marks live inside it. On Fire & Smoke that
put the lockup at x 600 and the wordmark's right edge at 3240 - **symmetric ~600 px margins**,
which is also simply the better composition: deliberate rather than pushed into the corners.
Verified by cropping the exported PNG to 1.25 / 1.5 / 1.6 / 2.37 and looking at each - the full
lockup and wordmark survive all four (only supporting cutout art is lost at 5:4, which is fine).

Guide layers per artboard: `safe_zone` (green dashed), `focus_zone` (gold dashed, desktop only)
plus the red device zones - desktop
`ui_menu_bar` / `ui_dock` / `ui_icon_column` / `crop_21_9`; phone `ui_clock` / `ui_widgets` /
`ui_actions` / `ui_home_indicator` / `ui_icon_grid`; tablet `ui_status` / `ui_dock`.

**Fixed on Fire & Smoke (all 7 wallpapers):** the branded desktop lockup moved up 184 px out
of the Dock strip and in to x 312, its wordmark pulled out of the bottom-right corner to
3240/1700; the phone-home, phone-lock and iPad wordmarks lifted above the dock; the lock-screen
`#athlete_name` + `#number` moved up 328 px out of the quick-action/home-indicator strip and
their **full-width text boxes narrowed to the safe width (x 90, w 1110)** so a long surname
wraps inside the safe area instead of running to the bezel. Verified: 11/11 type+mark elements
inside their boxes, 0 problems.

> **Stadium Night and Chrome All-Star carried the original defect** - same layouts, type in the
> Dock/home-indicator strips, no guides. A dedicated pass over both was run on 2026-08-20; see
> `work/reports/sn-ca-safezones.md`.

**Socials** were checked against platform chrome and pass as designed: story lockups end at
y ~1663 of 1920 (IG reply bar needs the bottom ~250 px), reel-cover content ends at 1472
(clear of the right action rail and caption block), and grid posts keep the key content inside
the centre square that the profile grid crops to.

## Heritage · Signature Spotlight · Prism Rush — COMPLETE (2026-08-20)

All three built in parallel from the Chrome All-Star structure, each on its own page, following
`docs/FINISH-COMPLETION-PLAYBOOK.md`. **All six finishes are now production-complete.**

| | Heritage (`164:3`) | Signature Spotlight (`164:4`) | Prism Rush (`165:3`) |
|---|---|---|---|
| Sections 02 / 03 / 04 / 05 | `305:90` `305:91` `305:92` `305:93` | `305:82` `305:83` `305:84` `305:85` | `305:86` `305:87` `305:88` `305:89` |
| Print card FRONT / BACK | `305:202` / `305:233` | `305:94` / `305:123` | `305:278` / `305:324` |
| Poster print export | `305:378` | `305:167` | `305:416` |
| Pack flat | `305:522` | `305:468` | `305:632` |
| Certificate | `305:780` | `305:741` | `305:820` |
| Proof (watermarked) | `305:1239` | `305:906` | `305:1580` |
| Die-cut silhouette | swallowtail pennant + heraldic shield chip + 18-notch laurel medallion | soft capsule with one chamfered corner + plain disc with hairline ring | 14-sided crystal shard + rotated square on point |
| Flip video | `card-flip/out/GDE_HE_CardFlip_*` | `GDE_SS_*` | `GDE_PR_*` |

Outputs: `print-sources/output/{heritage,signature-spotlight,prism-rush}/` (5 PNGs each),
`exports/{…}/bonus/` (sticker + badge, 2x transparent), `card-flip/assets/{he,ss,pr}/`.

### Three corrections this pass produced

**1 · Every new finish DOES have a from-behind back photo.** The handoff doc previously implied
only Fire & Smoke had one. In fact Heritage (`181:53`, hash `5a430644…`), Signature Spotlight
(`181:55`) and Prism Rush (`181:54`, hash `970fa1dd…`) all had one sitting under an unnamed
import layer — all now renamed **`#back_photo`**. Consequence: every print card BACK needs
**three** bleed plates (`#card_bg` + `back_photo` + `photo_overlay`), not two.

**2 · The GDE mark is SILVER on every finish — enforced.** `CLAUDE.md` has always said the mark
is always silver foil, but re-materialising a pack naturally sweeps the brand shield and wordmark
along with everything else. Fire & Smoke had **74** mark nodes warmed to ember (including all 46
watermark tiles on the proof) and Prism Rush **14** tinted iridescent; both were restored to the
canonical silver ramp. Heritage caught this itself and kept silver; Signature Spotlight is silver
by definition. **Rule, now explicit: the finish speaks through the lockup, ghost type, borders,
glyphs and atmosphere — never through the GDE shield, wordmark, seal or watermark tiles.**
It also simply looks better: the constant mark makes the finish read as a finish, not a re-skin.

**3 · An inherited Chrome All-Star bug: centred captions with off-canvas text boxes.** On CA,
`swipe_cue` (Grid 2, Story 2) and `#style_season` (Story 3) had boxes running 216–342 px past the
artboard edge — a centred box whose width exceeds the frame still *looks* centred until the text
grows or the font changes, then it silently shifts. Found on CA, Fire & Smoke, Heritage and
Signature Spotlight (Prism Rush's build caught and fixed its own); Stadium Night predates the
layout and was clean. All re-boxed to a 5.5 % margin.

⚠️ **Do not blanket-"fix" every centred box that overflows its frame.** Heritage's
`number_ghost_block_shadow` clones are *supposed* to hang past the edge — they are the varsity
3D block offset (−10 to −15 px at the ghost's full width). A sweep that re-boxed them flattened
the 3D effect on 7 artboards and had to be reverted node by node. Check for an offset-clone
sibling before touching an overflowing node.

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
   **Fire & Smoke: DONE except the flip video (2026-08-20)** — print cards, pack, certificate,
   poster print export, socials, wallpapers (with safe zones), digital bonus and the proof frame. Remaining finishes: **Heritage, Signature Spotlight, Prism Rush** — they
   have section 01 only; follow the propagation recipe and the FS print-ready recipe above.
5. **AI art layer — backgrounds DONE, athletes piloted (2026-08-20).** Backgrounds are the
   finish x sport matrix (`art-pipeline/`). The athlete half now exists too, piloted on
   **ice hockey**: club crest -> **identity plate** -> four poses -> BiRefNet cutout ->
   two rubrics. The identity plate is the anchor that keeps one face across four poses,
   and it is the **seam with the per-order tool** — for a real customer it is built from
   their 3-4 photos and every stage after it is unchanged. Read
   `art-pipeline/README.md` sections 10-19 before touching it. Remaining: the other 16
   athletes, a numeric face-embedding gate (a vision judge is not a guarantee), photo
   intake, and the logo-upload + consent fields on the order form.

## Order form fields (from the site) → where they land
first name, last name/initial, jersey number, position/event, team, graduation year,
primary/secondary team color, season/year, short headline (`playerHighlight`), stats.
All map to `Athlete` variables; poster shows identity, card shows the data.
