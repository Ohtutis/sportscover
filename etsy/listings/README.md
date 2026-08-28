# Etsy listings — source of truth

Three Wave 1 listings, all digital, written 2026-08-24. **Edit the JSON here, never in Shop
Manager** — the next `etsy:draft` run overwrites anything typed on the Etsy side.

Fields map 1:1 onto Etsy Open API v3 (`createDraftListing` + `updateListingInventory` +
`updateListingPersonalization`), so these files stay usable when the pipeline is written.

| File | Displayed | Ceiling | Targets |
|---|---|---|---|
| `01-digital-trading-card.json` | $24 | $84 | "custom sports card", the main listing |
| `02-digital-poster.json` | $29 | $89 | "custom sports poster", same production |
| `03-senior-night.json` | $39 | $104 | seasonal, high intent, spring + autumn peaks |

Every listing shows its lowest variant in search — that is the click. The ladder is where the
basket actually lands. Market check: ArtsypartyDesign shows $15.43 and reaches $41.14,
JayHoangDesigns shows $12.10 and reaches $108.90.

## Three things the API cannot do

1. **The photo upload field must be added by hand,** once per listing, in Shop Manager. The
   Etsy spec has `labeled_upload` and `unlabeled_upload` in the enum but states: *"Currently,
   only a single question with type `text_input` is supported."* Verified live on competitor
   listings — ArcadiusForge allows 3 files, RingerCards 10. **Without this field the whole
   order flow breaks**, so it is the first thing to set up.
2. **Buyer-uploaded photos cannot be retrieved via API.** `ShopReceiptTransaction.variations`
   returns the text answers only; no file URL exists anywhere in the schema. Photos get
   downloaded by hand from Shop Manager. This is the one manual step in the whole flow.
3. **There is no send-message endpoint at all.** `createReceiptShipment` carries a
   `note_to_buyer`, but that fires when the order is closed, so it is the delivery channel,
   not the intake one. `buyer_email` exists but reads *"Access is case-by-case and subject to
   approval"* — do not plan around it.

## Open questions before publishing

1. **Listing type.** Set to `physical` on purpose. Instant download attaches one file for
   every buyer, which cannot work per athlete, and it also closes the order immediately —
   Etsy would ask for a review before the work is done. ScrapBits (73.6k sales) runs
   made-to-order with delivery by message. Confirm the exact setting in Shop Manager.
2. **`taxonomy_id`** — fill from `getSellerTaxonomyNodes`. Target: Art & Collectibles >
   Prints > Digital Prints.
3. **`shipping_profile_id`** — needs a $0 / no-ship profile since nothing physical moves.
4. **Offsite Ads: switch OFF** while under $10k/year. It is 15% and opt-out is allowed below
   that threshold; on a $39 order it takes $5.85 of a $26.89 margin.

## Rules baked into the copy

- **AI disclosure is mandatory** and sits in every description. Etsy's Creativity Standards
  allow "Seller-prompted AI creations" and name a custom pet portrait as a permitted example,
  but require disclosure in the listing description.
- **Never claim "our own AI model."** The model is Gemini. The six-step *process* is ours and
  is the stronger claim anyway, because it is specific.
- **Indistinguishability is stated as a standard we hold, never as a promise.** A promise you
  miss becomes a 1-star review and a case.
- **No real league marks** (NFL, FIFA, NCAA, Olympic, sportswear logos) — stated in the copy
  as a feature. It is already enforced by the `no_league_mark` judge check.
- Etsy allows **max 2 variation properties** per listing, which is why the six art styles live
  in the personalisation text and not in the inventory matrix.

## Next waves

- **Wave 2** — non-personalised sport wall art from the 96 existing backgrounds (zero
  marginal cost), plus per-sport duplicates of listing 01.
- **Wave 3** — the sealed 18-card foil pack. Blocked on a print sample; see
  `docs/GAME-DAY-EDITION.md`. Do not advertise below $99: at a real Meta CPA of $30–38 the
  cheap digital tier does not survive paid traffic.
