# Etsy platform constraints — verified live, 2026-08-24

Checked against Etsy's own help pages and live listings, not from memory. Two of these
contradict what `listings/README.md` and `LISTING-PLAN.md` assumed.

## 1. Digital listings cannot have variations — CONFIRMED

Etsy help, *How to Manage Your Digital Listings*, verbatim:

> **Can I offer variations for my digital items?**
> No, you can't offer variations for digital items.

So the package × turnaround ladder in `listings/*.json` **cannot exist on a digital listing.**

**Why competitor digital listings appear to have variations.** LoveMementos shows a
"Digital download" badge *and* two priced variations (size, photo count). That badge is Etsy's
**category** label (Art & Collectibles > Prints > Digital Prints), not the listing *type*.
Sellers who need variations list as **physical** and deliver by message. That is the same
workaround our JSON already chose — but for the wrong stated reason.

## 2. Digital items come in two kinds, and the second is the one we want

| Kind | How it works |
|---|---|
| **Instant download** | Files attached when the listing is created. Buyer downloads immediately. |
| **Made-to-order download** | *"Custom files made to a buyer's specification that will be sent to them upon completion."* Set via **When did you make it? → Made To Order**. No files at listing time. |

Made-to-order delivery: Shop Manager → Orders → New → **Complete order** → **Upload file** →
**Complete order**. Buyer is emailed a download link.

## 3. The delivery cap is the real blocker — 5 files × 20 MB

Etsy allows **up to five files, 20 MB each**, on both instant and made-to-order digital.

Measured against one finish of our actual output:

| File | Size |
|---|---|
| Poster TRIM 5400×7200 | **32 MB** |
| Poster BLEED 5475×7275 | **33 MB** |
| Booster pack flat | 2.9 MB |
| Certificate | 1.3 MB |
| Card FRONT / BACK | 852 KB / 688 KB |
| **One finish, print + bonus** | **72 MB across 26 files** |

**The poster alone exceeds the per-file cap**, and the full set exceeds the file count six times
over. Etsy's native digital delivery cannot carry this product at any listing type.

Therefore delivery is a **link** (our own storage / Drive / WeTransfer) sent with the order,
with a small ZIP or a card-only file attached natively so the buyer still gets something inside
Etsy. This is an operational decision that must be made before any listing is published.

## 4. Buyer photo upload IS natively supported — correction

`listings/README.md` says the upload field "CANNOT BE CREATED VIA API… only `text_input` is
supported". The API half is still true. The **product** half was wrong: Etsy officially supports
it and calls the feature **Custom options**.

Etsy help, *How to Offer Personalized Listings*:

- **Up to 5 fields per listing.**
- Three field types: **Text box**, **List of options**, **File upload**.
- File upload's own documented use is *"Pet photos, logos"*.
- *"If you enable File upload personalization, content submitted by buyers must comply with
  Etsy's Buyer Policy."*

Verified live: ArcadiusForge's listing carries `input[type=file]` inside
`#enhanced-perso-content` with `accept="image/jpeg,image/png,image/gif,image/svg+xml,
image/heif,image/heic,application/pdf"` and `multiple: true`.

**So the intake problem is solved by the platform** — the buyer uploads photos on the listing
page. It still has to be added by hand per listing, because the API only writes `text_input`.

## 5. Text-box add-on pricing — the only native way to charge extra without variations

- Add-on pricing works on **optional, text-based** Custom options fields only.
- Range **$0.20 – $500**.
- Etsy explicitly recommends it over variations:
  > *"If you use variations to charge for text-based customizations, consider switching to an
  > optional Custom options field with add-on pricing instead."*

It does **not** work on List of options or File upload fields.

## 6. A listing-image rule we were about to break

> *"For personalized commercial items… your primary image must show a finished, personalized
> item similar to the final product. Do not use blank product images or mockups with placeholder
> text (ex. 'Your Text Here') as the main image."*

Our card-listing frames 01 and 02 are currently dashed placeholders reading
**PHOTOGRAPH GOES HERE**. Those must never be image 1 on a published listing.

---

## What this means for the plan

Two viable structures. Neither keeps the current JSON as written.

**A · Digital, made-to-order — one listing per package**
Three listings instead of one with variations: Card file only $24, Full digital set $39,
All six finishes $59. Native product type, no shipping profile, Custom options carry the photo
upload. Cost: 3× the listing admin, and the tiers stop being a single click for the buyer.

**B · Physical, made-to-order — keep the variation ladder**
What the JSON says today. Keeps package × turnaround in one listing. Needs a $0 shipping
profile, and "DIGITAL FILES ONLY — NOTHING SHIPS" has to carry the whole explanation.
This is what LoveMementos, TheONNOPrints and ArcadiusForge all do.

Delivery is a link either way, because of §3.
