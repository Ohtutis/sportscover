# Etsy listing images — canon and change log

**Built 2026-08-27.** Figma file `JcQvsgIRiOQtuZcP3Q8dc9` (separate from the finish file
`KzdEYF1UD9EnsczY8Kpyxi`). Pages: `0:1` 01 · Digital CARD LISTING, `2:2` 02 · Digital POSTER
LISTING, `2:3` 03 · SENIOR NIGHT, `61:504` 04 · Complete set.

Every rebuild was done in a **copy** of the live frame (`Update …` / `Remake …` / `UPDATE …`),
never on the original. The originals still sit on the same pages — comparing or reverting is free.

---

## 0. The one rule everything else follows

**The hero is optimised for the CLICK, not for beauty.** In the search grid a tile has to create
curiosity — *"how does MY kid's phone photo become THAT?"* — not win a design award. Everything
below serves that, and the grid is the only judge: check every change at ~300 px, not at 100 %.

Second rule: **consistency across the shop beats per-listing variation.** One layout, one light,
one type system for all sports; the sport speaks through the artwork and the background surface.

---

## 1. Why the old hero was failing (diagnosis, from the live grid screenshot)

Measured against a real search-results screenshot, not from taste:

1. **Headline was clipped** — cap heights touched the tile's top edge.
2. **Bottom strip was eaten by Etsy's UI** — the play button sat on top of
   `FROM YOUR PHOTOS | DIGITAL FILE — PRINT IT YOUR WAY`; on mobile the carousel dots too.
3. **`DIGITAL EDITION` badge sat under the favourite (heart) button**, and duplicated Etsy's own
   "Digital download" label — two "it's only a file" signals next to a premium price.
4. **Product too small and too dark** — two cards at ~40 % of tile height on a busy arena photo;
   the tile was the darkest in the row with nothing to justify it.
5. **No reason to click** — `THEIR SEASON. MADE COLLECTIBLE.` is brand poetry, not a differentiator.
   Everything that actually separates us (from your photos, front+back, six finishes, numbered and
   registered edition) was invisible.

## 2. Safe zones (measured from the live tile + the 4:5 crop)

| Zone | Rule |
|---|---|
| Sides | all meaning inside x 200–1800 — the desktop grid crops ~10 % per side (4:5) |
| Top | type starts no higher than y ≈ 200 |
| Top-right | 400×400 free — the heart button |
| Bottom | 240 px free of type — carousel dots, "Digital download" label |
| Bottom-right | 400×400 free — the video play button |
| Corners | no marks within 120 px — the tile has rounded corners |

**Art may bleed; type and marks may not.** (Same rule as the wallpaper safe zones.)

## 3. Hero canon (both listings, all sports)

- Background: **the sport's own surface**, dark, blurred (§6), with a dark gradient overlay.
- Left column at x = 260: 3-line Anton headline from y = 210 → orange chip `FROM YOUR PHOTOS` →
  silver outline chip (`NUMBERED + REGISTERED` for cards, `PRINT-READY 300 DPI` for posters).
- **One big "before" photo** (400×533, 10 px white border, drop shadow) + a thick orange arrow
  pointing into the product. This is the click engine — see §7.
- Product on the right at ~66 % of tile height, double drop shadow, slight tilt, back card / poster
  edge bleeding off the right edge.
- Silver `GAME DAY EDITION` wordmark bottom-left, above the 240 px reserve.
- **Removed for good:** the bottom benefit strip and the `DIGITAL EDITION` badge (§1.2, §1.3).

Card hero `355:429` · football clone `394:133` (Fire & Smoke cards) · cheerleading clone `394:150`
(Prism Rush cards) · poster hero `386:511`.

**The finish differs per sport on purpose** (see memory: two finishes per sport): basketball card =
Stadium Night, football = Fire & Smoke, cheerleading = Prism Rush — so we learn which one converts.

## 4. Card image 02 — `Remake 02` (`366:459`)

Was a second transformation shot, i.e. the hero's story told twice. Now it proves the two claims
the hero makes:

- Headline `FRONT + BACK. NUMBERED. REGISTERED.`
- Sub-line `④ UNIQUE SHOTS OF YOUR ATHLETE — COMPOSED ON THE CARD`, the badge drawn exactly like
  the pose markers, and markers **1·2·3 on the front poses, 4 on the back figure** — this is the
  most expensive work we do and it was previously invisible.
- Both card faces flat and large; an orange ring on the QR printed on the card back.
- **Registry band below the cards**: a big real QR + `UNIQUE CARD ID / GDE-SN-BKB-2026-12 /
  PRINTED ON THE BACK OF EVERY CARD` → arrow → `SCAN THE QR / THE CARD'S OWN PAGE / IN THE GAME
  DAY EDITION REGISTRY`. No URL is shown — the registry is the promise, not the address.
- `PRINT-READY FILES · 300 DPI` chip with a printer icon on the right of the sub-line.
- Removed: the before-photos and the `NOT A FILTER / BUILT FROM SCRATCH` badge (they live in the
  hero and in image 04).

**The QR is real**, generated with the repo's `qrcode` package to
`https://gamedayedition.com/c/GDE-SN-BKB-2026-12`. People will scan it.

## 5. Poster image 02 — `UPDATE IMAGE 2` (`386:529`) — the scale sheet

`HOW BIG IT ACTUALLY IS / TWO SIZES, TO SCALE.` + `③ UNIQUE SHOTS …` (posters carry three poses,
cards four — the number is counted, never copied).

- Both sizes drawn **to scale** against a real cut-out of the athlete.
- **The ruler is cut from the athlete's own hero wall shot** (`p-hero-wall.png`) — standing in
  profile, in their casual clothes, not the studio kit pose. A kit pose has the arms out (helmet,
  pom-poms), so cropping it to the frame lops the arms off, and a uniform makes the ruler read as
  a fourth poster instead of a person in a room.
- A square `TRUE 300 DPI` detail tile with an orange anchor square on the same face in the small
  poster — a loupe with **no connector line** (every line we tried cut across the artwork).
- `PRINT IT YOUR WAY / AT HOME, A PRINT SHOP, OR ANY ONLINE LAB` with a printer icon.

### The scale must actually be true

**One px-per-inch for every object in the frame; the person is the ruler.** Current value
**24.8 px/in** → 18×24 = 446×595 px, 24×36 = 594×892 px, and the ruler node is the athlete's own
stature × 24.8 (Tui 6'1" = 1810 px, Amara 5'2" = 1538 px, Marcus 6'2" = 1835 px).

**Seat the ruler by the HEAD, never by the feet.** At a true 24.8 px/in a teenager is taller than
the 2000 px sheet, so the legs are meant to run off the bottom edge and be cropped by the frame
(`clipsContent = true`) — that is what basketball does. Bottom-anchoring a 6'1" athlete instead
pushed his head through the top rule. Head line is **y = 470** and the figure is right-aligned to
**x = 1935** on every sheet, so two athletes of different heights stay directly comparable.

This was caught and fixed on 2026-08-27: after several re-layouts the posters had drifted to
29.75 px/in while the person stayed at 21.42 — the 24×36 read as 72 % of a person's height instead
of the true 52 %. A listing image that says "to scale" and overstates the print size is a refund
waiting to happen. **After any resize, re-check `h ÷ inches` for all three objects.**

Markers and the loupe anchor are stored as *fractions of their host poster*, so a rescale can put
them back on the same faces.

## 6. Backgrounds — a system, not a mood

Generated in-repo: `art-pipeline/gen-hero-bg.ts` (`GDE_BUDGET_EUR=60 GEMINI_IMAGE_MODEL=
gemini-3.1-flash-image npx tsx art-pipeline/gen-hero-bg.ts`, ~1.7k tokens each).

Six candidates live in the poster hero as **switchable layers** (`bg - …`, one visible at a time):

| Layer | Verdict |
|---|---|
| `bg - court lowangle` | **ACTIVE.** Warm hardwood + painted lines, dark left third for the type. Warm wood against the cold blue poster is the strongest contrast we found, and the poster reads as standing on the court — the artwork's own line is "THIS IS MY COURT". |
| `bg - hoop haze` | Most dramatic (near-black left, spotlights, orange rim) but the hoop hides behind the poster, so the basketball cue is weak at thumbnail size. |
| `bg - gym night` | Warm and pleasant, the most generic of the three. |
| `bg - dusk window`, `bg - warm clean`, `bg - room SN frame` | Bedroom scenes. Kept, but **too weak — a room says nothing about the sport.** |

**The rule this establishes: the hero background is the sport's playing surface** — basketball
hardwood, football turf, hockey ice, cheer mat. The layout, light and type stay identical, so the
shop still reads as one brand while every listing announces its sport instantly. Prompts require an
EMPTY surface (no people, no ball, no hoop centre-frame) and a dark left third for the type.

## 7. What earns the click (why the hero looks the way it does)

The differentiator is not the poster — every competitor shows a poster. It is the **before → after**.
That proof used to be two 269 px photos in a dark corner: at the real grid size (~300 px) they
became two unreadable dots. Now it is **one large framed snapshot + a thick orange arrow**, and the
second photo is kept in the file, hidden, one click from returning.

**Always run the squint test:** export at 2000 px, downscale to 300 px, and look. If the
transformation is not obvious at that size, it does not exist.

Other levers, in order of cheapness: attach the already-rendered listing videos (they are built but
not attached in Shop Manager); keep the sport words in the first 3–4 title words; and remember that
with zero reviews, image 02 (registry / proof) is what carries a price above the ~$21–26 category
median.

## 8. Suggested image order (poster listing)

1. hero — *what is this?*
2. `THEIR SEASON. THEIR WALL.` room shot — *how will it look in my home?* (photo after graphic;
   also the proof the decor-intent keywords promise)
3. scale sheet — *what exactly do I get?*
4. `WE GET THEIR LIKENESS RIGHT FIRST` — *will it actually look like my kid?*
5. `THEIR UNIFORM. THEIR NUMBER.` — the second-biggest fear
6. … the rest unchanged.

The old `THEIR PHOTOS. THEIR CUSTOM POSTER.` slide is dropped: the hero now tells that story, and
gallery slots are too expensive to say anything twice.

## 9. Exports

| File | Frame |
|---|---|
| `etsy/listing-images/01-basketball-card/01-hero-v3.png` | `355:429` |
| `etsy/listing-images/01-basketball-card/02-front-back-registered.png` | `366:459` |
| `etsy/listing-images/02-basketball-poster/01-hero-v3.png` | `386:511` |
| `etsy/listing-images/02-basketball-poster/02-two-sizes-to-scale.png` | `386:529` |
| `etsy/listing-images/02-basketball-poster/02-print-ready.png` | earlier spec variant, kept |

All 2000×2000. Uploading to Etsy is manual, in Shop Manager.

## 10. Open items

- ~~**Football + cheerleading image 02**~~ — DONE 2026-08-27. `Remake 02 FOOTBALL` (`442:133`) and
  `Remake 02 CHEERLEADING` (`442:205`), each with its own card art, card id and a real QR, and
  the four pose markers re-placed on that sport's own figures (they are per-card geometry, never
  copied). Exported to `02-front-back-registered.png` in both listing folders.
- ~~**`GDE-SN-BKB-2026-12` must exist in `lib/registry/cards.ts`**~~ — DONE. The registry now
  carries every id the listing images print: `GDE-SN-BKB-2026-12`, `GDE-FS-FTB-2026-54`,
  `GDE-HE-FTB-2026-54` and `GDE-PR-CHR-2026-01`, and `npm run qr:gen` has written all five PNGs.
  `STYLE_CODES` was also corrected: Heritage/Signature Spotlight/Prism Rush added (Heritage needs
  an explicit entry or the initials fallback gives it "H"), the dropped Neon Future and Vintage
  Card removed.
- **The football and cheerleading heroes still carry TWO small before-photos**, not the one large
  framed snapshot §7 describes. They match the basketball hero as it stands today, so the shop is
  at least consistent; when basketball moves to one photo, move these two with it.
- **Vary the "poster in the room" scene per sport** (customer, 2026-08-27): three frames in a row
  is one idea, not the idea. Each sport should show the poster used differently — over a desk, in
  a hallway, beside the trophy shelf, propped on a bed — so the gallery does not repeat itself
  across seventeen listings.
- **The poster listing now promises two files (18×24 and 24×36)** — the deliverables must match the
  promise, or the image must claim only one size.
- Propagate the hero canon (safe zones, one big before photo, sport-surface background) to the
  remaining sports as their listings are built.

## 11. Traps worth remembering

- **Never let the model draw our card, and never generate the blank plate GREY.** The plate is
  generated MATTE PURE BLACK and the real export is masked in (`art-pipeline/lib/card_in_hand.py`).
  With a black plate the mask is exact and free: black = card, not-black = in front of it. With a
  grey one, a shadowed corner reads as a finger and a grey T-shirt reads as the plate. See
  `etsy/LISTING-STATE.md` for the three geometry bugs that rewrite had to fix.
- `upload_assets` silently fails to place a fill when the target node is not on the current page —
  switch the page first, or assign the returned `imageHash` by hand.
- `use_figma` responses must stay ASCII and small; a large or non-ASCII return breaks the transport.
- Editing a text node's characters can make the whole run inherit one colour — re-apply
  `setRangeFills` after any `characters` change.
- A line with `strokeCap = 'ARROW_EQUILATERAL'` gets a head at **both** ends — draw arrows as a
  rectangle plus a rotated triangle.
- Cloning a node into a clipping frame is how the 24×36 crop is made; check afterwards that stray
  nodes did not land inside it (a label once did and vanished from the export).

## Slide ORDER — poster listings (decided 2026-09-02, applied in Figma to all six sport rows)

Figma: file `JcQvsgIRiOQtuZcP3Q8dc9`, page **`02 · POSTER LISTING` (880:895)** — one SECTION per
sport (BASKETBALL 880:896, FOOTBALL 946:175, CHEERLEADING 960:175, SOCCER 969:175,
VOLLEYBALL 969:1777, BASEBALL 969:3420), 20 frames each at x = 160 + 2280·(n−1); every frame
name starts with its number and carries a `NN / 20` counter text (Space Grotesk on 02–20,
**Barlow Bold on the hero** — load the counter's own font, not a guess).

The poster buyer is a DECOR buyer (`sports wall art`, `boys room decor`), not an occasion buyer,
so the top of the gallery answers her questions in her order — **why → what size → which style →
what's inside → which package**:

| # | Slide | Job |
|---|---|---|
| 01 | HERO | "from my photos → this" — possibility |
| 02 | **Their season, their wall** | desire — the product on a real wall (was 05) |
| 03 | Three sizes, to scale | decor question #1: how big (was 04) |
| 04 | One athlete, six finishes | our USP vs one-template shops (was 06) |
| 05 | Everything you get | contents (was 03) |
| 06 | Choose your package | transactional; **link it to the variations** so it pops when the dropdown is opened (was 02) |
| 07–20 | unchanged | for the buyer who has decided and is checking details |

Rule behind it: **a price list before desire reads as a price list.** PACKAGE never sits at 02.
Same logic for the Senior Night set: HERO → EMOTION (poster must be readable in it) →
EVERYTHING → TIMING → … → PACKAGE, and SN-11 "photo to final" duplicates the hero.

Etsy side: reordering existing images is a drag in the listing editor (no re-upload, no
ranking effect); slides 02–06 carry a new baked-in counter, so re-upload those five when
convenient. **Sizes:** digital orders = TWO files (18×24 + 24×36); the 30×40 XL is a PRINTED
package only — never promise a 30×40 file to a digital buyer (owner's rule, 2026-09-02).

## Slide ORDER — card listings (applied in Figma 2026-09-02, all six sport rows)

Figma page **`01 · CARD LISTING` (636:170)** — sections BASKETBALL 636:171, FOOTBALL 636:1775,
CHEERLEADING 636:2614, SOCCER 639:919, VOLLEYBALL 639:1711, BASEBALL 639:127. VOLLEYBALL and
BASEBALL also hold hidden `ZZ OLD · 16/17` frames at x=8 / x=2288 — they are not slides; filter
them out (`name` starts with `ZZ`) before sorting by x.

| # | Slide | Job |
|---|---|---|
| 01 | HERO | possibility |
| 02 | **Front + back, numbered, registered** | the card IS both sides — the back (stats, QR, ID) is what makes it a trading card and not a photo print; this is the canon's image 02 (was 04) |
| 03 | The kid on the card | real scale, in hand — "it's a real card" (was 05) |
| 04 | One athlete, six finishes | USP (was 06) |
| 05 | Everything you get + registered | contents (was 03) |
| 06 | Choose your package | link to variations (was 02) |
| 07–20 | unchanged | |
