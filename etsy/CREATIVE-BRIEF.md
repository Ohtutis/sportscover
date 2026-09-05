# Etsy creative brief — images + video

Written 2026-08-24, from the live audit in [`research/AUDIT.md`](research/AUDIT.md) (19 listings
read image-by-image, ~120 scanned). This file is the **source of truth for what each listing
photo shows and says, and in what order.** Copy lives in `listings/*.json`; this is the picture
side of the same listings.

Every slot below gives: the **visual**, the **on-image text** (verbatim — set it, don't rewrite
it), and the **source asset** we already have. Where an asset does not exist yet it says
`NEEDS SHOOT` or `NEEDS BUILD`.

---

> **Revised 2026-08-24 after the locale correction.** The first pass searched from an LT
> session, which hid US-only sellers. Re-run with `&ship_to=US` and 12 new shops appear in the
> top 30, holding positions 1 and 2. See the CORRECTION section in
> [`research/AUDIT.md`](research/AUDIT.md). Rules 1, 2 and 10 below are the revised versions.

## The rules the audit produced

1. **Slot 1 puts the card in a human hand.** This is what the two dominant US sellers do in
   nearly every frame — StickWithCharlotte with plain phone snapshots, GameDayCards at a
   workbench. Authenticity outsells layout in this category. The photo→card transformation is
   still ours to own, but it belongs at slot 2, not slot 1. ⚠️ **We cannot shoot this until we
   print sample cards** — see the build list.
2. **Two languages, and the market picks which.** US card winners lead with in-hand
   photography and keep exactly one infographic (a numbered "how to order") near the end.
   Internationally-shipping card sellers (CardStokk, ArtsypartyDesign, ArcadiusForge) run dense
   designed infographics throughout. Poster sellers run quiet interiors with almost no type.
   **We sell to the US: photograph first, explain once.**
3. **Ten slots minimum; more only if every extra frame says something new.** Eight to fourteen
   is where every listing with volume sits, and Mosiva runs twenty. Three to five is what the
   losing senior-night listings have. Listing 01 goes to eighteen because slots 04–09 are the
   method — material no competitor can produce.
4. **Every listing gets a video.** Five of the six highest-volume shops have one.
5. **Text is set at thumbnail size.** If a line is not readable in a 200 px square, it is not on
   the image. Two lines maximum per frame, one idea per frame.
6. **One master layout per listing, art swapped per sport.** ArtsypartyDesign runs the identical
   frame for football, basketball, baseball and hockey. That is how 17 sports get covered without
   17 designs.
7. **"Nothing ships" is a picture, not a sentence.** It prevents the 1-star "I never got my
   package" review.
8. **The GDE mark stays silver foil** in every frame (`CLAUDE.md` conventions). `brand/accent`
   #FF6B2B is allowed on the listing frame furniture — banners, arrows, step numbers — because
   that is website-and-box territory, never on the artwork itself.
9. **No league marks anywhere**, including in mockups. Our own club crests only.
10. **Every competitor search runs with `&ship_to=US`.** The default view from here hides the
    US-only sellers we actually compete with. This is a research rule, but it is the one that
    changed the most conclusions.

---

# The slot budget — how many photos actually fit

Verified 2026-08-24, three ways: Etsy's own help copy, the live DOM, and the v3 API reference.

| | Number | Source |
|---|---|---|
| **Maximum photos** | **20** | Raised from 10 in August 2025. Confirmed live: the Mosiva listing renders **21 carousel panes = 20 photos + 1 video**, i.e. it is maxed out. |
| **Maximum video** | **2** | Corrected 2026-08-24 from the live listing form: "Add up to 20 photos and 2 videos." 3–15 s, audio stripped — see the Video section. |
| **Minimum to publish** | **1** | Etsy will publish a listing with a single photo. It is a floor, not a target. |
| **Competitive floor** | **8** | Everything in our sample with real volume sits at 8–14. The 3–5 photo listings all have single-digit reviews. |
| **Our plan** | **20** | Listing 01, full. Every frame names a deliverable or a guarantee. |

**Use all twenty — but every frame must name a thing the buyer receives.** The rule is not
"fill the slots", it is "leave nothing unexplained". A twentieth angle of the same card adds
nothing; a frame that shows the sticker sheet they did not know was included adds a reason to
choose the higher tier. Slots 15–19 are therefore the inventory: what lands in the inbox,
counted and shown.

**The one frame we cannot make yet is social proof.** Mosiva puts a five-star quote over a
lifestyle shot at frame 8 and it is the only listing in the sample doing it. We have no reviews,
and inventing one is out of the question. When the first real review arrives it replaces
**slot 02** (the sport-variety repeat), which is the most redundant frame in the set.

**One risk to test, not to assume.** Etsy's v3 `uploadListingImage` documents `rank` as
`integer >= 0` with **no stated upper bound** — the old "max 10" that still circulates in
third-party guides is not in the current spec. So the pipeline can probably push all 20 ranks,
but that is inference from a silence. **Verify ranks 11–20 on the first draft listing before
building the rest of `etsy:draft` around it**, and if they are refused, images 11–20 join the
photo-upload field as a manual Shop Manager step.

**Two API fields we are not using and should be.** `alt_text` (max 500 characters per image)
and `is_watermarked`. Alt text is free descriptive text attached to every image — write it from
the slot's own content, not the listing title. `is_watermarked` belongs on the proof frame
(slot 13).

---

# What we have that nobody in the audit has

Added 2026-08-24 after an inventory of the repo and the Figma file. **Every competitor in the
19-listing sample crops a customer photo into a template.** We do not — we reconstruct the
athlete and the kit as separate, inspectable artefacts, and *those artefacts are photographs in
their own right.* They have never appeared in the listing plan, and they are the strongest
material we own.

Reference exports for the brief live in [`research/ours/`](research/ours/), taken from the
ice-hockey pilot (`art-pipeline/out/athletes/ice-hockey/`).

| What | File | Why it sells |
|---|---|---|
| **Identity plate, FRONT** | `_identity.png` — 2400×1792 | A three-panel casting sheet of the child: face front, face three-quarter, full body, neutral clothes, neutral ground. It reads instantly as *"they built a reference of my kid before they made anything."* |
| **Identity plate, BACK** | `_identity-back.png` | The same person from behind — head and full body. Proof the likeness is three-dimensional, not a cropped headshot. |
| **Kit plate, FRONT** | `_kit.png` — 2048×2048 | The entire uniform as a flat-lay: helmet, jersey with the club crest and number, pants, socks, gloves, skates, stick, puck. Every piece separately reconstructed. |
| **Kit plate, BACK** | `_kit-back.png` | Jersey back with the number across the shoulders, pants back. |
| **Four poses from the locked plate** | `hero/action2/action3/back.png` — 1696×2528 | Demonstrably the same person in the same kit, four times. Competitors cannot show this because they only ever had one photo. |
| **A numeric face gate** | `_identity-gate.json` | ArcFace cosine against the plate, threshold 0.36. Real pilot numbers: hero 0.558, action3 0.491 — and action2 at 0.287 **fails and gets remade**. A measurement, and one that visibly rejects work. |
| **Intake that refuses bad orders** | `before/_intake.json` | Scores every submitted photo, ranks them by anchor quality, and rejects: more than one comparable face (team photos), faces under 180 px, blur, fewer than three usable frames, no angle coverage, and **photos that are not all the same child** — which is how a sibling gets into an order. |
| **Watermarked proof** | Figma `297:2` | Poster + both cards under an anti-removal watermark, for approval before anything final is released. |
| **Certificate** | `…certificate-2550x3300-300dpi.png` | Per finish, with a silver-foil notary seal (`auth_seal`) and a signature line. |
| **Registry + QR** | `lib/registry/cards.ts` → `/c/<cardId>` | `GDE-<style>-<sport>-<season>-<number>`, QR printed on the card back (`#card_qr`). |
| **Social pack, 9 assets** | Figma `03 · SOCIAL` (`287:2`) | Grid 1–3, story 1–3, reel cover, profile picture, cover banner. |
| **Wallpapers, 7** | Figma `04 · WALLPAPERS` (`287:3`) | 4 branded + 3 clean, every one with device safe zones so type never sits under the clock or the dock. |
| **Die-cuts** | Figma `05 · DIGITAL BONUS` (`294:2`) | Sticker + badge, silhouette per finish, plus 4 cutouts and the card-flip. |

**Three corrections to how we've been describing this.**

1. It is **four** frames per athlete, not three — `hero`, `action2`, `action3`, `back`. The
   back frame is conditional on the sport numbering the shirt (README §38).
2. Intake wants **3–10 photos**, and more *angles* beat more photos: the anchor is the mean of
   the set, so four different views help and four near-identical frames do not. That is worth
   saying to the customer in exactly those terms.
3. The QR resolves to a page that is still an acknowledged placeholder
   (`app/c/[cardId]/page.tsx`). The claim "your card has its own page" is true today; "a full
   digital twin" is not yet. Do not oversell it in copy.

**On registering the poster as well as the card** — worth doing, but as **one record, not two.**
One athlete, one edition, one ID, one QR. The card carries the QR because it has the printed
back for it; the certificate is what gets framed next to the poster, so the certificate should
carry the *same* QR rather than a second one. Two IDs would invent a distinction the buyer does
not have and double the admin per order. This is also how real print editions work: the
certificate carries the provenance, not the artwork.

---

> **Built in Figma 2026-08-24** — file `JcQvsgIRiOQtuZcP3Q8dc9` ("Etsy listing templates"),
> page `01 · CARD LISTING`. All 20 frames exist at 2000×2000. The slot order below was revised
> during the build: identity front+back merged into one frame, kit front+back merged into one,
> and the two freed slots went to **the age ladder** (order one every year, at the age they
> were) and **seventeen sports + any other on request**. Lithuanian production notes sit on the
> canvas *below* each artboard, never inside it.
>
> ⚠️ **One blocker found during the build.** The card, poster and certificate art all show
> **Nia Brooks** (#23, Northside Wolves) — a demo athlete that predates the current pipeline and
> has no identity or kit plate. The plates and poses show **Marcus Ellison** (#12, Cedar Ridge
> Bears). They are two different people, so frames 03, 09, 10, 14 and 16 currently contradict
> frames 04–08. Marcus has all four cutouts, so the fix is to **re-render the card, poster and
> certificate for Marcus in the design file** before anything is published.

## Listing 01 — Custom sports trading card, digital ($24 → $84)

Visual language: **photograph first, explain once** (US pattern), then **show the method**,
then **count the deliverables**. Twenty slots — the platform maximum, where Mosiva sits. Slots
01–03 sell, 04–09 prove the method, 10–14 handle the product and the objections, 15–19 leave
nothing about the delivery unexplained, 20 closes.

| # | Visual | On-image text | Asset |
|---|---|---|---|
| 01 | A hand holding the printed card, daylight, real surface. Not a studio. | none, or a small corner line | ⚠️ `NEEDS PRINT SAMPLE` |
| 02 | Same shot, four other sports and finishes. | none | ⚠️ `NEEDS PRINT SAMPLE` |
| 03 | Their phone photos on the left → the finished card on the right. | `THEIR PHOTOS → THEIR ROOKIE CARD` | `before/photo*.png` + card FRONT |
| 04 | **The scan.** Their 3–10 photos in a row, arrow, the identity plate's three panels below. | `WE BUILD A REFERENCE OF YOUR ATHLETE FIRST.`<br>sub: `Face, build, hair — locked before anything else is made.` | `research/ours/00-source-photo*.jpg` + `01-identity-plate-FRONT.jpg` |
| 05 | **Front and back of the athlete.** Identity plate FRONT beside identity plate BACK. | `FROM EVERY SIDE. NOT A CROPPED HEADSHOT.` | `01-…FRONT.jpg` + `02-…BACK.jpg` |
| 06 | **The kit, piece by piece.** The full flat-lay: helmet, jersey, pants, socks, gloves, skates, stick. | `WE REBUILD THE UNIFORM. EVERY PIECE.` | `03-kit-plate-FRONT.jpg` |
| 07 | Kit BACK — number across the shoulders, pants back. | `INCLUDING THE BACK.`<br>sub: `Your club's crest and their number — nothing invented.` | `04-kit-plate-BACK.jpg` |
| 08 | **Four frames, one person.** The four poses in a row. | `FOUR SHOTS. THE SAME KID IN ALL OF THEM.` | `05`–`08-pose-*.jpg` |
| 09 | **The measurement.** The four poses with their cosine scores under them, threshold line drawn, one frame struck through. | `WE MEASURE THE FACE MATCH.`<br>sub: `Below the line, the frame is remade. Not an opinion — a number.` | `_identity-gate.json` + poses. `NEEDS BUILD` |
| 10 | Card FRONT and BACK side by side. | `FRONT AND BACK. BOTH PRINT-READY.` | card FRONT + BACK PNGs |
| 11 | The same athlete in all six finishes, 3×2. | `ONE ATHLETE. SIX FINISHES.` | six card FRONT PNGs |
| 12 | Two columns: photos that work ✓ / photos that don't ✗. | `SEND US THESE. NOT THESE.`<br>sub: `3–10 photos. Different angles beat more photos.` | composed from `before/` |
| 13 | The watermarked proof, with an approve tick. | `YOU SEE IT BEFORE WE FINISH IT.`<br>sub: `Nothing final is released until you approve.` | Figma proof `297:2` |
| 14 | Split: a greyed league shield struck through / a real club crest clean. | `YOUR CLUB'S CREST — NEVER A LEAGUE LOGO.` | `art-pipeline/out/crests/` |
| 15 | **The full inventory**, everything laid out at once and counted: poster, card front + back, certificate, 7 wallpapers, 9 social tiles, sticker, badge, 4 cutouts, flip video, QR page. | `EVERYTHING YOU GET.`<br>sub: `26 files. Counted, not implied.` | all print outputs + Figma 03/04/05 |
| 16 | **Tier comparison**, three columns with ticks: Card file only / Full digital set / All six finishes. | `WHAT'S IN EACH PACKAGE.`<br>footer: `$24 · $39 · $59` | `NEEDS BUILD` from `listings/01-…json` offerings |
| 17 | Certificate with its foil seal, QR beside it, phone showing the card's page. | `REGISTERED. FINDABLE FOREVER.`<br>sub: `Scan the card, the page opens.` | certificate PNG + `public/cards/qr/` |
| 18 | The social pack + wallpapers as one grid, phone lock-screen inset. | `NINE SOCIAL POSTS. SEVEN WALLPAPERS.`<br>sub: `Safe zones so nothing sits under the clock or the dock.` | Figma `287:2`, `287:3` |
| 19 | **The digital bonus**: name-and-number sticker, number badge, four transparent cutouts, a frame of the flip video. | `STICKERS, BADGE, CUTOUTS AND A FLIP VIDEO.`<br>sub: `Yours to post, print or send.` | `exports/*/bonus/`, `exports/shared-cutouts/`, `card-flip/out/` |
| 20 | Four numbered steps + heavy bottom bar. | `DIGITAL FILES ONLY — NOTHING SHIPS.`<br>`RUSH 24 H AVAILABLE.` | `NEEDS BUILD` |

**17 sports** lives in the description and in slot 02's sport variety rather than taking a whole
frame — slots 04–09 and 15–19 earn their place ahead of it.

**Count the files before publishing.** Slot 15 states a number. Per finish we currently produce:
poster, card FRONT, card BACK, certificate, 7 wallpapers, 9 social assets, sticker, badge,
4 cutouts, flip video = 26. **Recount against the actual delivered folder before that number
goes on an image** — a number on a listing photo is a promise, and an inflated one is a case.

**Per-sport duplicates (Wave 2b).** Only slots 01, 02 and 03 change; the method frames (04–09)
and everything from 10 to 20 are shared across all 17 duplicates unchanged. That is the whole
economy of the idea: build seventeen frames once, reuse them seventeen times.


## Listing 02 — Custom sports poster, digital ($29 → $89)

Visual language: **quiet interiors.** Real rooms, real light, minimal type — this is what wins
in the poster category and it is the opposite of listing 01. Type only where it is a spec.

| # | Visual | On-image text | Asset |
|---|---|---|---|
| 01 | Framed poster on a teenager's bedroom wall, morning light, slight shadow. Athlete's face readable. | small, bottom-left: `18×24 IN · PRINT-READY 300 DPI` | `print-sources/output/*/GDE-*-poster-TRIM-5400x7200-300dpi.png` + room mockup |
| 02 | Same wall, phone photo inset bottom-right, thin arrow to the poster. | `From their photo.` (sentence case, small) | before-photo + poster |
| 03 | Six framed posters of the same athlete, one per finish, on one wall. | `SIX FINISHES.` | six poster PNGs |
| 04 | Scale shot — poster beside a desk and chair so 18×24 reads physically. | none | `NEEDS SHOOT` |
| 05 | 100% detail crop: the face, then the foil texture at the edge. | `300 DPI. Zoom in.` | poster PNG crop |
| 06 | Four rooms, four sports: volleyball in a bedroom, ice hockey in a basement, track in a hallway, soccer over a desk. | none | poster PNGs + mockups |
| 07 | Poster on the wall, the matching card on the desk below it. | `THE POSTER AND THE CARD MATCH.` | poster + card FRONT |
| 08 | File list on a clean ground: what lands in the inbox per tier. | `WHAT YOU GET` | `NEEDS BUILD` |
| 09 | Four numbered steps, quiet type. | `HOW IT WORKS` | `NEEDS BUILD` |
| 10 | Three printing routes — local print shop, online service, at home. | `DIGITAL FILE — NOTHING SHIPS.` | `NEEDS BUILD` |

---

## Listing 03 — Senior Night ($39 → $104)

**Revised — the opening is narrower than the first draft claimed.** In the US view this
category is owned by **weatherproof vinyl banners**: 11thStreetDesignShop alone holds 8 of the
top 24 with one banner listing per sport, alongside MVPBANNERS, SidelineSocialShop and
SlateGraphix. The 3–5-image photo collages I first described are the internationally-shipping
tail, not the category.

So the real question this listing has to answer in its first frame is *why a file instead of a
banner that arrives ready to hang on the fence.* Our honest answers: it is theirs the same
week, it is a **card and a poster and a certificate**, and nobody in the category generates the
athlete. Register stays emotional — the buyer is buying a night — but the comparison is now
explicit, not assumed.

| # | Visual | On-image text | Asset |
|---|---|---|---|
| 01 | The poster on an easel at the senior-night table, gym banner behind, family just out of focus. | `SENIOR NIGHT COMES ONCE.` | poster PNG + `NEEDS SHOOT` |
| 02 | Their photo → the finished poster, class year visible in the design. | `THEIR PHOTO → THEIR SENIOR POSTER` | before-photo + poster |
| 03 | The set laid out: poster, card front and back, certificate. | `POSTER. CARD. CERTIFICATE.` | poster + card + `…certificate-2550x3300…png` |
| 04 | Detail crop of the class year and the number worked into the design. | `THEIR YEAR. THEIR NUMBER.` | poster crop |
| 05 | The card alone, held, foil catching light. | `NOBODY ELSE GIVES THEM A CARD.` | card FRONT |
| 06 | Six cards in a row, six different athletes, one team's colours. | `ORDERING FOR THE WHOLE SENIOR CLASS?`<br>sub: `Message us first — team pricing is cheaper per athlete.` | six athletes' cards |
| 07 | Six finishes, 3×2, same senior. | `SIX FINISHES.` | six poster or card PNGs |
| 08 | Calendar graphic, game date circled, a 7-day bar running up to it. | `ORDER 7 DAYS BEFORE THE GAME.`<br>`RUSH 24 H IF YOU'RE LATE.` | `NEEDS BUILD` |
| 09 | Four numbered steps + the photo do's and don'ts condensed to one row. | `HOW IT WORKS` | `NEEDS BUILD` |
| 10 | Tier list. Heavy bottom bar. | `DIGITAL FILES ONLY — NOTHING SHIPS.` | `NEEDS BUILD` |

---

## Wave 2 — Non-personalised sport wall art (from the 96 backgrounds)

Different buyer: decor, not gift. Zero marginal cost, and it is the **only** listing of ours
that can honestly be an Etsy instant download, because the file is the same for every buyer.
Eight slots, interior language.

| # | Visual | On-image text |
|---|---|---|
| 01 | One strong background framed in a room. | none |
| 02 | Same sport in four finishes, 2×2. | `FOUR FINISHES.` |
| 03 | Gallery wall — set of three. | `BUY THREE, SAVE.` |
| 04 | Size/ratio chart. | `EVERY COMMON PRINT SIZE.` |
| 05 | 100% detail crop. | `300 DPI.` |
| 06 | The 17 sports as a picker grid. | `PICK YOUR SPORT.` |
| 07 | Delivery. | `INSTANT DOWNLOAD.` |
| 08 | Cross-sell: an athlete card beside the art. | `WANT YOUR OWN ATHLETE ON IT? →` |

---

## Wave 3 — Sealed 18-card foil pack

**Blocked on the print sample** (`docs/GAME-DAY-EDITION.md`). Nothing here can be shot until a
physical pack exists; listing it now with renders would be the one place where our images stop
being honest. Eight slots when it unblocks:

1. Sealed pack in a hand, foil live. 2. Pack with cards spilling out. 3. All 18 fanned —
`EIGHTEEN CARDS.` 4. Four-frame unwrap sequence. 5. Card front/back detail. 6. Certificate with
the pack. 7. Gift context. 8. `SHIPS WORLDWIDE` + what's in the box.

Pricing note from `listings/README.md` stands: do not advertise below $99.

---

# Video

## What Etsy actually accepts

Measured on live listings, not from a help page:

- **Two video slots per listing**, **3–15 s** each (a longer upload is auto-trimmed to the first 15 s, up to 60 s accepted), max **100 MB**, most file types accepted.
- **Audio is removed.** Etsy's own transform on every listing video is
  `…/upload/ac_none,du_15,q_auto:good/….mp4` — `ac_none` is *no audio codec*, `du_15` is the
  15-second cap. The player is `muted`. **Never put a beat, a voice-over or a sound cue in the
  plan.**
- **Square.** Both sampled competitor videos are 1:1 — Mosiva 1080×1080 / 7.1 s, TheONNOPrints
  1280×1280 / 15.0 s. Our existing renders are 1080×1920 and 1080×1350, so **neither fits**:
  `card-flip/render.sh` needs a 1080×1080 target before any of this ships.
- It autoplays muted and loops in the carousel, so **it has no beginning** — the last frame must
  cut back to the first without a visible seam.

## A — Listing 01, the card · "The turn" · 10 s · 1080×1080

Every beat carries its meaning as a picture; text is a caption, not the message.

| Time | Shot | On-screen text |
|---|---|---|
| 0.0–1.5 | Parent's phone photo, slow push in. | `THEIR PHOTO` |
| 1.5–2.5 | Dissolve to the finished card in the identical framing. | `THEIR CARD` |
| 2.5–5.5 | The flip. Foil travels across the face of the card as it turns. | — |
| 5.5–7.0 | Back lands: stats, ghost number, QR. | — |
| 7.0–9.0 | Six finishes, 0.33 s each, hard cuts. | `SIX FINISHES` |
| 9.0–10.0 | Silver GDE mark on black. | `ANY SPORT · PRINT-READY` |

Source: the existing flip render (`card-flip/render.sh`, `STYLE=SN …`) re-targeted to 1:1, with
the photo→card dissolve and the finish montage added at the head and tail.

## B — Listing 02, the poster · "The wall" · 8 s · 1080×1080

No motion graphics. Four stills, 2 s each, 0.4 s cross-dissolves — this is exactly what Mosiva
does and it reads as photography rather than advertising.

1. Bedroom wall, framed poster. 2. Detail crop of the face. 3. A different sport in a different
room. 4. Poster on the wall with the card on the desk.

One small line held from 0.5 s, bottom-left: `18×24 · PRINT-READY`. Buildable today with ffmpeg
from stills — no new render pipeline.

## C — Listing 03, senior night · "The moment" · 12 s · 1080×1080

| Time | Shot | On-screen text |
|---|---|---|
| 0.0–2.0 | Empty gym, banner, the table before anyone arrives. | `SENIOR NIGHT COMES ONCE.` |
| 2.0–5.0 | The poster revealed on the easel. | — |
| 5.0–8.0 | The card flip, quick. | — |
| 8.0–10.0 | Hands holding the poster, family out of focus. | — |
| 10.0–12.0 | Silver mark. | `CLASS OF 2026` |

## What we do not copy

TheONNOPrints — 717 sales — spends its whole 15 s on `UP TO 30% OFF / BUY 2 POSTERS GET 25% OFF
/ DON'T MISS THE BIG DISCOUNT`. It sells the shop, not the product, and it teaches the buyer to
wait for a sale. Keep it as an option for a real sale window only; never as the default.

## Build list

- [ ] **Print sample cards and photograph them in a hand.** One per finish, six total. This is
      now the highest-value item on the list: the single most persuasive frame in the US card
      category is a real card in a real hand, and a digital-only listing cannot fake it. Cost is
      a few dollars and one afternoon. It also unblocks slots 01/01b of listing 01 and slot 05
      of listing 03.
- [ ] `card-flip/render.sh` — add a **1080×1080** output target.
- [ ] ffmpeg still-slideshow script for videos B and C (cross-dissolve, no audio track at all).
- [ ] Room mockups: bedroom, basement, hallway, desk — four scenes, reused across listings 02
      and Wave 2.
- [ ] The four `NEEDS BUILD` infographic layouts (anatomy callouts, 6-step, photo do's/don'ts,
      delivery bar) as one Figma component set, so all three listings share them.
