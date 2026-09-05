# SKU registry — every Etsy listing

**One SKU per listing, assigned before publishing.** Etsy does not enforce SKUs, but they are
how we tie an order → the sport file → the delivery folder → the finance line. Never publish
a listing without one, never reuse one.

## The scheme

```
GDE-<SPORT>-<PRODUCT>-<DELIVERY>
```

| Part | Values |
|---|---|
| `SPORT` | the 3-letter sport code from `art-pipeline/sports.ts` (see table), or `ANY` for the any-sport listings |
| `PRODUCT` | `CARD` · `POST` (poster) · `SET` (card+poster set) · `SNSET` (senior night set) · `SNBAN` (senior night banner) · `TEAM` (full team set) |
| `DELIVERY` | `DIG` (digital files) · `PRN` (printed/shipped — wave 2) |

Sport codes (authoritative — same codes the printed card IDs use):
`BKB` basketball · `FTB` football · `BSB` baseball · `SFB` softball · `SOC` soccer ·
`ICH` ice hockey · `VBL` volleyball · `LAX` lacrosse · `WRS` wrestling · `CHR` cheerleading ·
`GYM` gymnastics · `TRK` track & field · `SWM` swimming · `TEN` tennis · `GLF` golf ·
`PKB` pickleball · `OTH` skateboarding (slug stays `other-sport`).

⚠️ **`GDE-FBALL-CARD-DIG` in `etsy/listings/01-football-card.json` is the odd one out** — it
uses `FBALL` where every card ID in `lib/registry/cards.ts` uses `FTB` (e.g.
`GDE-SN-FTB-2026-54`). Two football codes in one business is a future mix-up. Corrected below
to **`GDE-FTB-CARD-DIG`**; update the JSON when you touch it next.

## The registry

### Live now — ⚠️ confirm/set these in Shop Manager

| SKU | Listing | Etsy listing ID |
|---|---|---|
| `GDE-BKB-CARD-DIG` | Custom Basketball Trading Card | 4562666649 |
| `GDE-BKB-POST-DIG` | Custom Basketball Poster | 4562700100 |
| `GDE-ANY-SET-DIG` | Custom Sports Poster & Card Set (any sport) | 4562711454 |
| `GDE-FTB-CARD-*` | Custom Football Card | 4563878038 |
| `GDE-CHR-CARD-*` | Custom Cheerleading Trading Card | 4564284709 |
| `GDE-SNSET-*` | Senior Night Set | 4564565764 |
| `GDE-BSB-CARD-*` | Custom Baseball Card | **4567592965** (published 2026-09-03) |
| `GDE-VBL-CARD-*` | Custom Volleyball Trading Card | **4567597109** (published 2026-09-03) |
| `GDE-SOC-CARD-*` | Custom Soccer Card | **4567599879** (published 2026-09-03) |

Card listings carry four SKUs each, one per `Package` variant: `-DIG`, `-P12`, `-P24`, `-PACK`.
⚠️ Football's live SKUs still read `GDE-FBALL-CARD-*`; every other listing and every card ID uses
`FTB`. Fix them the next time that listing is open.

### Wave A — senior night (publishing now)

| SKU | Listing |
|---|---|
| `GDE-FTB-SNSET-DIG` | Football Senior Night Set |
| `GDE-VBL-SNSET-DIG` | Volleyball Senior Night Set |
| `GDE-CHR-SNSET-DIG` | Cheer Senior Night Set |
| `GDE-SOC-SNSET-DIG` | Soccer Senior Night Set |
| `GDE-ANY-SNSET-DIG` | Senior Night Keepsake Set (any sport) |
| `GDE-FTB-SNBAN-DIG` | Football Senior Night Banner |
| `GDE-SOC-SNBAN-DIG` | Soccer Senior Night Banner |
| `GDE-CHR-SNBAN-DIG` | Cheer Senior Night Banner |
| `GDE-VBL-SNBAN-DIG` | Volleyball Senior Night Banner |

### Wave B — evergreen sports (card + poster per sport)

| Sport | Card | Poster |
|---|---|---|
| Football | `GDE-FTB-CARD-DIG` | `GDE-FTB-POST-DIG` |
| Cheerleading | `GDE-CHR-CARD-DIG` | `GDE-CHR-POST-DIG` |
| Baseball | `GDE-BSB-CARD-DIG` | `GDE-BSB-POST-DIG` |
| Soccer | `GDE-SOC-CARD-DIG` | `GDE-SOC-POST-DIG` |
| Volleyball | `GDE-VBL-CARD-DIG` | `GDE-VBL-POST-DIG` |
| Softball | `GDE-SFB-CARD-DIG` | `GDE-SFB-POST-DIG` |
| Ice Hockey | `GDE-ICH-CARD-DIG` | `GDE-ICH-POST-DIG` |
| Wrestling | `GDE-WRS-CARD-DIG` | `GDE-WRS-POST-DIG` |
| Gymnastics | `GDE-GYM-CARD-DIG` | `GDE-GYM-POST-DIG` |
| Lacrosse | `GDE-LAX-CARD-DIG` | `GDE-LAX-POST-DIG` |
| Track & Field | `GDE-TRK-CARD-DIG` | `GDE-TRK-POST-DIG` |
| Swimming | `GDE-SWM-CARD-DIG` | `GDE-SWM-POST-DIG` |
| Tennis | `GDE-TEN-CARD-DIG` | `GDE-TEN-POST-DIG` |
| Golf | `GDE-GLF-CARD-DIG` | `GDE-GLF-POST-DIG` |
| Pickleball | `GDE-PKB-CARD-DIG` | `GDE-PKB-POST-DIG` |
| Skateboarding | `GDE-OTH-CARD-DIG` | `GDE-OTH-POST-DIG` |
| Any sport | `GDE-ANY-CARD-DIG` | `GDE-ANY-POST-DIG` |

### Wave D–E — winter and spring additions

| SKU | Listing |
|---|---|
| `GDE-BKB-SNSET-DIG` | Basketball Senior Night Set (Nov) |
| `GDE-WRS-SNSET-DIG` | Wrestling Senior Night Set (Dec) |
| `GDE-SFB-SNSET-DIG` | Softball Senior Night Set (Feb) |
| `GDE-BSB-TEAM-DIG` | Baseball Full Team Set (Feb) |
| `GDE-BKB-SNBAN-DIG` | Basketball Senior Night Banner (Nov) |

### Later — physical (wave 2, after the POD test)

Same SKU with `PRN` instead of `DIG`: `GDE-FTB-CARD-PRN`, `GDE-BKB-SET-PRN`, and so on.
A printed listing is a separate listing and therefore a separate SKU — never the same SKU
with a variation.

## Rules

1. **Assign the SKU when the listing is created**, in the Inventory section of the form.
2. **Never reuse or re-point a SKU.** If a listing is deleted and rebuilt, keep the same SKU
   only if it is the same product; otherwise mint a new one.
3. **The order → work mapping runs off the SKU:** `FTB` tells you which sport file
   (`docs/SPORT-TEMPLATES-HANDOFF.md`), `SNSET` tells you which deliverables list.
4. This file is the source of truth. When you add a listing, add its row here first.

## Live poster + set listings after the 2026-09-04 rebuild (all Physical, `Package` variants)

| SKU family | Listing | Etsy ID | Variants (suffix) |
|---|---|---|---|
| `GDE-BKB-POST-*` | Custom Basketball Poster | 4562700100 | `DIG` · `P1824` · `P2436` · `P3040` (was `GDE-BBALL-POST-*`, fixed 2026-09-04) |
| `GDE-FTB-POST-*` | Custom Football Poster | 4564301710 | same |
| `GDE-CHR-POST-*` | Custom Cheerleading Poster | 4564287163 | same |
| `GDE-SOC-POST-*` | Custom Soccer Poster | **4568359117** (published 2026-09-04) | same |
| `GDE-VBL-POST-*` | Custom Volleyball Poster | **4568365063** (published 2026-09-04) | same |
| `GDE-BSB-POST-*` | Custom Baseball Poster | **4568369175** (published 2026-09-04) | same |
| `GDE-ANY-SET-*` | Complete Set (any sport) | 4562711454 | `DIG` · `PRINT` · `DLX` · `ULT` (was `GDE-SET-*`, fixed 2026-09-04) |

Poster printed-tier suffixes are the SIZE (`P1824`, `P2436`, `P3040`), not `PRN` — the live
convention set by the owner on 2026-09-01; the `PRN` wave-2 note above is superseded for posters.

## Senior Night listings after 2026-09-04 (all Physical, `Package` = DIG / PRINT / DLX / ULT)

| SKU family | Listing | Etsy ID |
|---|---|---|
| `GDE-ANY-SNSET-*` | Senior Night Set (any sport, 17-sport picker) | 4564565764 (was `GDE-SNSET-*`) |
| `GDE-FTB-SNSET-*` | Football Senior Night Set | **4568844304** |
| `GDE-VBL-SNSET-*` | Volleyball Senior Night Set (`Senior Night Volleyball Gift` title) | **4568846696** |
| `GDE-CHR-SNSET-*` | Cheer Senior Night Set | **4568849272** |
| `GDE-SOC-SNSET-*` | Soccer Senior Night Set | **4568841851** |
| `GDE-BSB-SNSET-*` | Baseball Senior Night Set | **4568844985** |
