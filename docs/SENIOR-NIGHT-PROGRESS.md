# Senior Night (SR) — progress

**Started 2026-08-27.** The seventh style, and the first **occasion-led** one: it is not a material
invented for the shelf, it is the ceremony that actually happens on an American senior night — the
last home game, house lights down, gold confetti, the crowd holding up phones.

Why it exists: senior-night searches peak **Sept–Oct at ~7.1k vs ~1k in late August**
(`etsy/SEO/ETSY-SEO-FINDINGS.md`), and the buyer is the least price-sensitive in the shop — a fixed
date, a final season. The listings have to be live and indexed **by September**.

---

## 1 · The style

| | |
|---|---|
| Name / code | **Senior Night** · `SR` (`SN` was already Stadium Night) |
| Palette | champagne gold `#D9B36A` + ivory `#F4EDE0` on warm near-black |
| Typography | **Playfair Display Black** (display) + **Oswald** (supporting) — used by no other finish |
| Signature glyph | a **mortarboard with a tassel**. The stars were dropped: they already belong to Chrome All-Star's listing |
| Card frame | **banner-pennant** — gold hanging rod, grommets, stitched dashed border, swallowtail bottom, and the athlete breaking out over the frame |
| Headline | `ONE LAST HOME GAME` |
| Card ID | `GDE-SR-<SPORT>-2026-<number>` |

**The card back is different on purpose** — this is what a senior buys that a season card cannot give:
CAREER HIGHS instead of season stats, a `FR 2023 · SO 2024 · JR 2025 · SR 2026` progression line,
`SENIOR SEASON 2025-26` / `CLASS OF 2026`, the athlete's **senior quote** set in Playfair Italic, a
signature line, and a `SENIOR EDITION · 1 OF 1` stamp.

## 2 · Art — DONE for 5 sports

`senior-night` is a real entry in `art-pipeline/finishes.ts`, so backgrounds come off the same
conveyor as every other finish:

```bash
npm run art:bg -- --finish senior-night --sport <slug>
```

Reference: `print-sources/senior-night/senior-night-background.png` (the approved basketball take).
Seven basketball candidates were generated first; **E "Confetti Storm"** won — the earlier
"C Legacy Deep" was too dark to see people in.

| Sport | Background | Figma page |
|---|---|---|
| basketball | ✅ | `2304:566` — **sections 01–05 complete** |
| football | ✅ | `4052:155` — section 01 |
| cheerleading | ✅ | `4022:146` — section 01 |
| soccer | ✅ | `5015:146` — section 01 |
| volleyball | ✅ | `5019:146` — section 01 |

Node IDs per sport: `docs/FIGMA-FILES.md`.

Three backgrounds needed a second roll, and each fix became a rule rather than a re-dice:
soccer read as an ordinary floodlit night match (the finish now says **the house lights are OUT**);
cheerleading arrived with a judges' podium and rows of chairs (`prompts.ts` now names the furniture
for every propless sport, which also protects gymnastics and wrestling); football's goalposts were
cropped and off-centre.

**Total AI spend on Senior Night art: ~€2.75 across 18 generations.**

## 3 · Listings — THREE, mirroring the regular line

The regular line already splits 04 set / 01 card / 02 poster, so the same split here makes three
distinct products rather than re-titled duplicates — the exact risk that got Senior Night parked in
`docs/ETSY-LISTINGS.md` in the first place.

| Page | Figma | Price | Contents | JSON |
|---|---|---|---|---|
| `03 · Digital SENIOR NIGHT` | `2:3` | **$99** | 28 files + live registry page | `etsy/listings/03-senior-night.json` |
| `03b · SENIOR NIGHT — CARD` | `522:127` | **$49** | 20 files + live registry page | `03b-senior-night-card.json` |
| `03c · SENIOR NIGHT — POSTER` | `525:127` | **$49** | 18 files, no registry | `03c-senior-night-poster.json` |

20 slides each, 2000×2000. Exports: `etsy/listing-images/03-senior-night/`,
`03b-senior-night-card/`, `03c-senior-night-poster/` (gitignored — regenerate from Figma).

- **Slide 02 shows four REAL Senior Night sets** — Tui (football), Amara (cheer), Mateo (soccer),
  Jaslene (volleyball). It used to show four different finishes, while the listing claims one style
  for every sport. A listing that claims one style has to show one style.
- **Card variant**: hero is card front + back; slide 19 drops the poster and set-bonus panels.
- **Poster variant**: hero is the poster alone; **slide 18 was rebuilt from the registry slide into
  the print story**, because a poster ships no card and no certificate, so it cannot promise a QR.
- The hero follows the canon in `etsy/LISTING-IMAGE-CANON.md`: canonical left column, one big
  before-photo and arrow, nothing in the heart or play-button zones.

## 4 · Open — read before publishing

1. **SR sections 02–05 exist only in the BASKETBALL file.** Football, cheerleading, soccer and
   volleyball have section 01 (poster + card FRONT/BACK) only. The listings promise social files
   and wallpapers, so these must be built per order — or before the sport picker is used at scale.
2. **`/c/GDE-SR-BKB-2026-12` must render** — the QR on images 16/18 is real and scannable from the
   search grid. The id and `Senior Night: "SR"` are in `lib/registry/cards.ts`; `npm run qr:gen` has
   written the PNG.
3. **SR card-flip video not rendered** — `card-flip/render.sh STYLE=SR`. All three descriptions
   promise it for the card and set listings.
4. **Slide 03's card-in-hand photo still shows the Stadium Night card** — regenerate through
   `art-pipeline/lib/card_in_hand.py`.
5. **24×36 is promised in the poster copy.** The 2:3 SR frame exists in basketball at 1800×2700;
   export at 4× for true 300 DPI before the first delivery.
6. No listing videos for any of the three.

## 5 · Traps this build paid for

Written up in full in `docs/FIGMA-FILES.md`; the short version:

- **Card-back stat echoes are named `stat_value`, not `*_echo_*`.** Hiding by `/echo/` leaves three
  identical values stacked ~6–12 px apart and "312" reads as "302". Keep the LAST one in z-order
  and re-centre its ink.
- **Figma renames a text layer to its own content.** After `characters = "SENIOR SEASON"` the layer
  is no longer named `SEASON`, so a later `name ===` test silently fails. Capture the name first.
- **You cannot move a node inside an INSTANCE** (`relative-transform` is not overridable). Hide the
  instance's `#number` and draw the ghost on the poster instead — and seat it by measuring
  `absoluteRenderBounds`, because Playfair's ascender puts the ink ~390 px below the box top at 880 px.
- **`upload_assets` places a plate on the current page**; read the plugin-side `imageHash` back and
  assign fills by hash. The upload endpoint's hash is a different id space.
- A stray upload plate left on the poster silently covered the athletes — check a frame's children
  after any upload.
