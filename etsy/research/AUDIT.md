# Etsy competitor audit — 2026-08-24

Method: Etsy browsed live (search + listing pages). **16 listings audited image-by-image**,
~60 more read at search-result level across four queries: `custom sports trading card`,
`senior night poster custom sports`, `custom sports poster digital download athlete`,
`custom sports card`. Market shown in USD, Etsy LT locale — prices are Etsy's own USD
conversion, so treat them as ±3%, not to the cent.

Reference images are saved per shop under `etsy/research/competitors/<shop>/`, numbered in
carousel order. **They are competitors' copyrighted product photos, kept for comparison only —
never reuse, trace, or adapt them in our own listings.**

## The sample

| Shop | Product | Shown → ceiling | Photos | Video | Volume signal |
|---|---|---|---|---|---|
| LikeThePros | printed cards, sleeves+cases | $16.45 | 10 | ✅ | **723 shop sales**, 29 item reviews |
| TheONNOPrints | poster (digital + framed) | $9.97 → $332 | 8 | ✅ 15 s | **717 shop sales**, Star Seller |
| ArcadiusForge | Topps/Panini-style card | $24.12 → $49.97 | 11 | ❌ | 247 sales, 70 reviews, Star Seller |
| CardStokk | holo / slab card | $24.19 → $66.54 | 8 | ✅ | Bestseller, 153 sales |
| SeenCards | graded-slab card | $35.98 | 8 | ✅ | Bestseller + Star Seller, 133 sales |
| ArtRaiderMuseum | poster, digital | $10.25 | 5 | ✅ | 120 sales |
| DesignsByHMcStudio | metal card | $22.39 → $27.57 | 6 | ✅ | Bestseller, **218 item reviews** |
| ArtsypartyDesign | slab card | $15.43 → $41.14 | 6 | ✅ | Star Seller |
| JayHoangDesigns | card + toploader | $12.10 → $108.90 | 7 | ❌ | Star Seller |
| Mosiva | AI magazine cover, digital | $24.56 | **20** | ✅ 7 s | 47 sales |
| AllStarWallArt | poster, digital | $25.86 | 9 | ✅ | 3 reviews |
| LoveMementos | senior-night collage, digital | $14.47 → $71.76 | 13 | ❌ | 3 reviews |
| UniCheek | watercolour poster | $15.73 → $38.54 | 5 | ❌ | Star Seller |
| SeniorNightStudio | senior-night poster | $14.52 → $54.45 | **3** | ❌ | 14 sales |
| CustomizedGift93 | senior jersey collage | $7.62 → $31.30 | 4 | ❌ | 3 reviews |
| FreshNFrames | digital card from photo | $12.10 | 6 | ❌ | **0 sales** (negative control) |

## Ten findings that change what we build

1. **Image 1 carries the transformation, not the product.** Mosiva — the closest thing to our
   model — puts the source photo in a circle, a red arrow, and the finished cover in frame 1.
   ArcadiusForge puts the card in a hand at pitch-side. Both are readable at 200 px.
2. **Cards and posters are two different visual languages.** Card listings are dense designed
   infographics with headline + benefit icon rows (CardStokk, ArtsypartyDesign, ArcadiusForge).
   Poster listings are quiet interior mockups with almost no type (UniCheek, ArtRaiderMuseum,
   TheONNOPrints). Using one language for the other is the most common way to look wrong.
3. **8–11 photos is the winning band.** Every listing with real volume sits there. The 3–5
   photo listings are all in the senior-night category and all have single-digit reviews.
   Mosiva at 20 is the outlier and is also the most carefully designed listing in the sample.
4. **Video tracks with volume.** Five of the six highest-volume shops have one; the sixth
   (ArcadiusForge) does not. It is the cheapest unclaimed advantage we have — we already render
   a flip video per finish.
5. **Etsy strips audio and caps at 15 s** — proven by Etsy's own transform URL on every listing
   video: `.../upload/ac_none,du_15,q_auto:good/….mp4` (`ac_none` = no audio codec). The
   `<video>` element is also `muted`. Both sampled videos are **square**: Mosiva 1080×1080 /
   7.1 s, TheONNOPrints 1280×1280 / 15.0 s.
6. **"Digital, nothing ships" has to be a picture.** LoveMementos spends 2 of 6 images on it,
   Mosiva 2 of 20. It is return-and-1-star insurance, not decoration.
7. **A numbered "how it works" image is near-universal** — ONNO #2, LoveMementos #2,
   Mosiva #19, ArtsypartyDesign as an icon column on every frame.
8. **Breadth sells with a grid.** Mosiva devotes two frames to "40+ sports" and "every moment".
   ArtsypartyDesign repeats one master layout per sport — same frame, different card art. That
   is exactly how we cover 17 sports × 6 finishes at near-zero cost.
9. **The last frame is an upsell.** CardStokk closes on its Pokémon listing; ArcadiusForge on
   the sealed-pack upgrade.
10. **Most of this market infringes.** Mosiva uses the real *Sports Illustrated* logo,
    ArcadiusForge real Topps + club marks, CardStokk MLB team marks, TheONNOPrints sells
    posters of Messi and Kobe. We do not and will not — so "your club's crest, never a league
    mark" has to be sold as a feature in its own frame, not buried in the description.

## Operational patterns worth copying

- **ArtsypartyDesign auto-sends a design form after purchase** ("A form will automatically be
  sent to you so you can design your card after purchase"). That routes around Etsy's missing
  photo-upload API — the same problem listed in `etsy/listings/README.md`.
- **TheONNOPrints and Mosiva both send a preview and wait for confirmation** before delivering.
  Our reference-plate approval is the same step, and it is already in our copy.
- **LoveMementos answers the privacy question in an image** ("We delete your photos & personal
  info right after this order"). We make the same promise in text only.
- **The floor price is the ad.** ONNO shows $9.97 and reaches $332. ArtsyParty shows $15.43 and
  reaches $41.14. JayHoang shows $12.10 and reaches $108.90. Our $24 floor on listing 01 is
  high for the click; that is a positioning choice, not an oversight — worth revisiting if
  impressions come in low.

## Where the opening is

Senior night. Every listing in that category is a photo collage — a jersey or a number filled
with snapshots — at 3–5 images, no video, and no card. Nobody there is selling a generated
athlete, a trading card, or a set. It is the weakest creative in the niche and the highest
intent, date-driven buyer.

---

# CORRECTION — 2026-08-24, same day

**The first pass was biased by locale, and the bias changed conclusions.** The searches ran
from an LT session. Re-running the identical query with `&ship_to=US` returns a materially
different result set: of the top 30, **12 shops appear only in the US view.** Two of them hold
positions 1 and 2. Etsy's ranking is destination-aware, so a US-only seller — which is exactly
our target market — was invisible in the first pass.

## What the US view adds

| Shop | Product | Shown → ceiling | Photos | Video | Signal |
|---|---|---|---|---|---|
| StickWithCharlotte | slab-case card, 8 listings in top 30 | $30.24 → $66.54 | 14 | ✅ | **138 item reviews**, Bestseller + Star Seller, Etsy's Pick |
| ChampionCustomCards | **full-team card set** | $8.71/card, tiered | 5 | ✅ | 215 sales, 27 reviews, Star Seller |
| GameDayCards | youth card, packs of 1/5/10 | $8.16 → $81.67 | 10 | ✅ | 197 sales, 23 reviews, Bestseller + Star Seller |
| M6Slabs, Invtlabs, SPORTRAITCO, ITSTradingCards, JCoCustomCards, RoyalSwampDesigns, TailoredSpark, BoStockArtandDesign, LacePetalAtelier | cards, team packs, breaks | — | — | — | several Bestsellers, not deep-audited |

Senior night changes even more. With `ship_to=US`, **11thStreetDesignShop takes 8 of the top 24**
with per-sport *weatherproof vinyl banners*, alongside MVPBANNERS, SidelineSocialShop and
SlateGraphix. The US senior-night category is **large-format printed banners**, not the digital
photo collages the LT view showed.

## What this overturns

1. **Finding 2 was wrong for the US market.** "Card listings are dense designed infographics"
   held for the internationally-shipping sellers (CardStokk, ArtsypartyDesign, ArcadiusForge).
   The dominant US sellers do close to the opposite: **StickWithCharlotte's first ten frames are
   plain in-hand phone photos** — a hand, chipped nail polish, backyard turf, a houseplant — one
   per sport and per occasion. GameDayCards runs eight of ten frames as a hand holding the card
   at a workbench. The single infographic ("HOW TO ORDER", 7 steps) sits at frame 13, near the
   end. In the US view the persuasion is *authenticity*, not layout.
2. **The senior-night opening is narrower than claimed.** It is not an empty field of weak
   collages; it is a field owned by physical banners. A digital 18×24 file competes against a
   $40–50 weatherproof banner that arrives ready to hang on a fence.
3. **US price floors are far below ours.** GameDayCards opens at $8.16 and ChampionCustomCards
   at $8.71/card, against our $24 floor on listing 01. The floor is the ad; ours is ~3× the
   market's.
4. **Team and bulk sets are a proven category we had not seen at all.** ChampionCustomCards
   sells a card per player at 1–15 → $8, 16–30 → $7, 31+ → $6, and takes intake by email with
   the Etsy order number in the subject. M6Slabs advertises bulk rates in its title. This is our
   senior-class idea, already validated — but at a per-card price an order of magnitude below
   what listing 03 assumes.
5. **A proof is a sellable upgrade.** StickWithCharlotte charges +$6.05 for "w Proof" and puts
   *Receive your proof → Approve your proof (48 h)* in its how-to-order graphic. We give the
   reference-plate approval away as a differentiator; that is a choice, not the only option.

## What survives unchanged

Photo-count band (US winners sit at 10–14, so the floor moves **up**, not down), video tracking
with volume (all three new US winners have one), the Etsy video spec, the "nothing ships"
picture for digital listings, the near-universal how-it-works frame, and breadth-by-repeated-
frame — StickWithCharlotte and GameDayCards both run one layout per sport, which is precisely
the mechanism we planned to use for 17 sports.

## The constraint this exposes

The strongest device in the US card category — **a real card in a real hand** — is unavailable
to a digital-only listing, because nothing physical exists. Printing one card per finish and
photographing it is cheap and would unlock the category's most persuasive frame. It is now the
top item on the build list.

## Method note

Always run competitor searches with `&ship_to=US` appended. The LT-default view hides US-only
sellers, and those are the ones we actually compete with.
