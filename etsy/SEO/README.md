# START HERE — Etsy listings & SEO

**One folder, one job: everything needed to write, price and publish a Game Day Edition Etsy
listing.** Last full research sweep: 2026-08-28 (Marketplace Insights, Etsy Plus, US data,
~85 terms measured + ~80 harvested).

## Read in this order (30 minutes to full context)

| # | File | What it gives you |
|---|---|---|
| 0 | **`CARD-LISTINGS-PACK.md`** + **`ready/*.md`** | **The six card listings, paste-ready** (2026-09-02). The pack holds the cross-listing decisions and the publish order; each `ready/<sport>-card.md` is one listing top to bottom. ⚠️ These supersede the copy pack for the CARD listings: the copy pack predates the V3 rollout and still says `Digital Download` / `Type: Digital`. |
| 1 | `LISTING-COPY-PACK.md` | Publish order A→F and the same fields for every OTHER product (posters, sets, senior night, banners). Still the source for those. |
| 2 | `KEYWORD-LIST.md` | Every measured keyword ranked T1 gold → T4 dead, with the owning listing. Use when you need a tag not in the pack. |
| 3 | `SKU-REGISTRY.md` | One SKU per listing — assign it before publishing, never reuse. |
| 4 | `../LISTING-IMAGE-CANON.md` | How the images must be built (safe zones, hero recipe, what image 02 must prove). |
| 4 | `NICHE-REPORT-2026-08.md` | Why the plan looks like it does: the three engines, per-sport curves, competitor archetypes. |
| 5 | `ETSY-SEO-MASTER-PLAN.md` | Architecture and rationale: keyword ownership map, waves, product opportunities. |
| 6 | `ETSY-SEO-FINDINGS.md` | The first research round (2026-08-27). Historical; superseded numbers are marked. |

Also relevant, outside this folder: `../LISTING-STATE.md` (what is actually live),
`../../docs/ETSY-LISTINGS.md` (the 34-listing roster — order superseded by the copy pack),
`../../docs/ETSY-GROWTH-PLAYBOOK.md` (Etsy ranking mechanics),
`../listings/*.json` (drafts — ⚠️ descriptions there are the OLD ━━━ format, do not copy).

## The rules that are already decided — do not re-litigate

1. **Three seasonal engines, not one.** Senior night (Oct 6475 + Jan 3267), **Christmas
   (football gifts Nov 26,708 — the biggest spike in the niche)**, spring baseball
   (baseball mom Mar 27,820; custom baseball card 16.6k/yr, High). Every listing must be
   indexed BEFORE its engine, not during.
2. **One intent = one listing.** A phrase has exactly one owner (map: master plan §6).
   Senior/graduation tags live only on senior-night listings; evergreens stay evergreen.
3. **The sport is the doorway; the pack is the price decision.** Sport-specific listings
   catch search; sets monetise the convinced. No sport-agnostic listing as a main entry.
4. **Matched intent beats volume.** 246 searches at Very high conversion beats 2.3k whose
   shoppers want Panini. A term without *custom* / *personalized* / an occasion usually
   belongs to someone else's product.
5. **Etsy form limits, verified in the live form:** title **≤14 words AND no word repeated** (the form warns on both) and ≤140 chars · tag ≤20 chars · **personalization instruction text ≤120 chars** ·
   personalization inputs 256/512. Never tag `personalized card` (greeting-card shelf) or
   bare `football cards` (collector shelf). Tags are delivered as one comma-separated line.
6. **Description format = plain CAPS section lines, NO `━` dividers.** Bullets only under
   WHAT YOU GET. The four closing blocks are mandatory: DIGITAL PRODUCT, HOW IT'S MADE
   (AI disclosure), PHOTO PRIVACY, INDEPENDENT STUDIO. Source of truth = the live basketball
   card listing; the template is in the copy pack.
7. **Senior Night listings sell the OCCASION, not a style.** SR style only — no art-style
   dropdown. Team colors come through SR's accents anyway. A soft line near the end offers
   other finishes by message; the last gallery slide cross-sells the evergreen listing.
   Evergreen sport listings keep the 6-style dropdown. Each listing has one job.
8. **The hero is optimised for the CLICK, not for beauty** — judged at 300 px, not 100%.
   One big "before" photo + a thick arrow. Background = that sport's playing surface.
9. **Publishing cadence: 2–4 new listings per day** is correct — Etsy gives each new listing
   a visibility boost, and spreading them spreads the boosts. The **30-day freeze applies only
   to EDITING title/tags of a listing that already has impressions.**
10. **We are the fourth archetype.** The shelf holds templates ($3–18), party consumables
    ($5–30), photo-collage/done-for-you ($24–63) and premium one-offs ($145). We are
    *designed-for-you AI sports art*. Every description draws that line in the first lines:
    **not a template, not a collage — we design it from your photos, you approve a proof.**
11. **Never promise a deliverable we cannot ship.** If the copy says two poster sizes, both
    files must exist. Banner listings stay unpublished until the horizontal layout is built.
12. **Real QR codes only.** Card IDs printed in images must exist in `lib/registry/cards.ts` —
    buyers scan them.

## What is NOT worth researching again (measured dead)

monster/pet/kids/teacher/DnD trading cards, `custom pokemon card` (Etsy suppresses it — IP),
sports banquet, game day sign, sports keepsake, sports photo collage, track/band/dance senior
night, `sports gifts for boys`. Numbers in `KEYWORD-LIST.md` tier 4.

## How to research more (the tool)

Marketplace Insights, logged in as the shop owner:
`https://www.etsy.com/your/shops/me/marketplace-insights/search?query=<term>` — URL-driven,
no typing needed. 12-month curve is a UI toggle (Date range → Last 12 months), no URL param.
Similar-terms tables run 9–20 pages — that free harvest is bigger than the query itself.
Etsy Plus showed no query limit in ~85 searches. Always sanity-check the bestsellers block:
a term's "Very high" conversion may belong to a $6 template, not to our product.
