# Marketing log

One line per day. What went out, and what came back. Numbers go in `metrics.csv`; this file
is for the things a number cannot hold — which pin got saved, which group said no, which
comment got a reply.

Format: `## YYYY-MM-DD` then bullets. Newest at the bottom.

## 2026-08-28
- Engine built. Boards not yet created, Pinterest account not yet opened.
- Baseline: 21 shop visits total, **0 from Etsy Search**, 0 orders, 1 self-favourite.

## 2026-08-28 (later)
- **Pin defect found by the owner and fixed: decapitation.** The before/after band cropped a
  full-body 2:3 render by geometry, so basketball and football shipped headless. The crop is
  now anchored to the BiRefNet cutout's alpha bbox — the top of the head lands 7 % down the
  band and the legs are what gets lost. `cover_subject()` in `gen_pins.py`.
- **The `back` pose is out of the rotation.** A from-behind frame has no face, so it cannot
  prove "same kid" — it had shipped twice as a hockey product pin.
- **Swimming gets a tight (2.3×) crop everywhere.** A full-body competition-swimsuit frame of
  a teenager is not a marketing image; head-and-shoulders is.
- Added `audit.md` + `_contact-sheet.png` per day, so a batch can be checked at a glance and
  mechanically (head in frame, subject big enough, label matches link).
- Pins now route to the **sport's own listing** when one is known (`links.by_sport`). Only the
  football poster and the $89 set are filled in.

## 2026-08-28 (evening)
- **Pins per day set to a ramp: 3/day for 21 days, then 5/day** (`engine.RAMP`). The
  "25 a day" advice is Tailwind-era; a young account is judged on legibility, not volume.
- **Bug the ramp exposed:** the daily mix was indexed by slot, so three-pin days never
  reached `slide` or `list` at all. Templates now come off an eleven-slot ring walked by the
  global counter, so proportions survive any pins-per-day.
- **Pose and before-photo now rotate on the SPORT's appearance count**, not the global
  counter — keyed globally they collided and the same composition came round every 5 days.
- **New `spec` template** after the owner spotted that the top of this Pinterest niche is
  Etsy sellers reposting their listing images: light ground, card large, promises listed.
  Runs only where a real card render exists (`engine.CARDS`), falls back to `product`.
- **`npm run mkt:report`** joins a Pinterest analytics export back to the queue on
  `utm_content` and ranks templates and sports by clicks per pin.
- **Report now tracks boards, occasions and keywords**, not just templates and sports; the
  queue is deterministic so all of it is recovered from the pin id — nothing is recorded at
  upload time. Keywords rank only at 3+ pins.
- **Caption bug found by the report and fixed:** the occasion keyword was built by
  concatenating the head term with a sentence-shaped phrase, producing "golf custom golf
  gift" and "golf birthday gift for a golfer" in the keyword field of every pin. It is now
  built from the occasion LABEL: "golf senior night gift", "custom golf gift".

## 2026-08-28 (Etsy set up, via the in-app browser)
- **`FIRST10` is live** — 75 % off (Etsy rejects anything above 75), whole shop, 10 uses,
  Aug 28 – Oct 27, not displayed in the shop.
  Share URL: `https://gamedayedition.etsy.com/?coupon=FIRST10`
  At $41.99 that is $10.50 to the buyer, ≈ $9.25 net; stacked with the running 30 % shop
  sale, $7.35 and ≈ $6.40 net. Both clear the €3–5 target.
- **Three automatic offers created**: `FAVORITE15` 15 %, `CARTBACK15` 15 %, `THANKYOU10` 10 %.
  Etsy requires each targeted offer to carry its own code.
- **Five listing URLs harvested into `config.json`** so pins land on the sport in the
  picture. Missing: the basketball CARD listing.
- Not done, and deliberately left to the owner: **opting out of Offsite Ads**. It is a real
  trade (Etsy stops advertising the shop) and that is a business call, not a mechanical step.

## 2026-08-29 — the after half became the PRODUCT
- **The defect the owner named:** "nei posteris nei trading card" — the before/after pin put
  the rebuilt athlete ART in the bottom half, so it read as two photographs of a kid and told
  nobody they were buying a card. The after is now the real card, **front and back, both
  smaller**, with drop shadows. That is also the honest version: the card is what ships.
- **All 15 sports now have real card renders.** Exported from the per-sport Figma files
  (`docs/FIGMA-FILES.md`), Stadium Night page, node `40:2` front / `49:2` back, via
  `download_assets` + curl, downscaled to 900x1260 → `marketing/cards/` (37 MB total).
  `engine.CARDS` is now empty and the lookup is by filename.
- **Second claim bug, caught by looking at a week at once:** a POSTER pin carried the headline
  "CUSTOM WRESTLING TRADING CARD". `HEADLINES["product"]` no longer says "card", and the audit
  now fails any poster pin headlined as a card (and any card pin headlined as a poster).
- Seven days re-rendered: 21 pins, **zero audit flags**.

## 2026-08-29 — Pinterest account built
- Profile: name **Game Day Edition**, bio written as a search phrase, website
  `gamedayedition.com`. Username stays `editiongameday`.
- **All 13 boards created, all 13 descriptions written.** Names use "and", not "&"
  (`engine.BOARDS` matches exactly, or the daily captions would name a board that does not
  exist).
- **Stray pin removed.** A mis-aimed click had saved somebody else's "Senior Night 2012" pin
  to our board. Deleted via the board's Organize tool; the board is at 0 pins.
- **Method change that caused that mistake:** clicking by screenshot coordinates. The
  browser pane resizes itself, so coordinates go stale. Drive by `ref` wherever the element
  is in the accessibility tree; Pinterest's modals are portals that are not, so those still
  need a screenshot taken in the SAME batch as the click.
- **The pin upload is blocked on hosting, not on permission.** This browser has no
  file-picker capability, so local PNGs cannot be uploaded. But Pinterest's pin builder has
  **"Save from URL"**, which takes a direct image URL — so once the day's pins are publicly
  reachable, pin creation is fully automatable. That makes `public_base` (checklist step 7)
  the unblocker rather than an optimisation.

## 2026-08-29 — first three pins are LIVE
- Owner uploaded the images as pin drafts (this browser has no file picker); Claude filled
  and published each one: title, description, tracked link and board from `captions.md`.
  1. `20260829-1-beforeafter-soccer` → **Volleyball and Soccer Gifts** → shop front (no soccer listing yet)
  2. `20260829-2-slide-baseball` → **Baseball and Softball Gifts** → the $69.99 set listing
  3. `20260829-3-beforeafter-softball` → **Baseball and Softball Gifts** → shop front (no softball listing yet)
- **Every pin is marked "AI-Modified" and "includes an AI-generated person".** Pinterest asks
  directly and the answer is yes: the demo roster is generated. It may cost some
  distribution; mislabelling on a platform that asks is the thing that costs an account.
  The flags are editable after publishing if the owner decides otherwise.
- Division of labour that works today: **owner drops the files into the pin builder as
  drafts, Claude fills and publishes.** Hosting the pins (so "Save from URL" can be used)
  would remove even that step.
