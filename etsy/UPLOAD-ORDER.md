# What to upload, in what order — football and cheerleading

Written 2026-08-27. ⚠️ **CORRECTED 2026-09-02: the cap is 20 photos and 2 videos**, verified in
the live listing editor ("Add up to 20 photos and 2 videos"), not the 10 this file was written
against. The ten-slot orders below are still a useful priority ranking — they say which slides
earn the top of the gallery — but there is no longer a reason to leave the other ten out.
The first image is the search-grid tile. Files are 2000×2000 PNG in the folders below.

**Each folder holds 21 files but only 20 are slides.** `02-transformation.png` is the OLD image 02
and is superseded by `02-front-back-registered.png` (canon §4 — the hero already tells the
transformation story, and a gallery slot is too expensive to say anything twice). Keep the old one
on disk, do not upload it.

## Football — digital CARD ($49) · `etsy/listing-images/01-football-card/`

| Slot | File | What it answers |
|---|---|---|
| 1 | `01-hero.png` | what is this? |
| 2 | `02-front-back-registered.png` | front + back, numbered, registered — carries the price |
| 3 | `03-kid-on-the-card.png` | it is really their kid |
| 4 | `06-four-shots.png` | will it look like them? (measured) |
| 5 | `05-kit.png` | the uniform is rebuilt, not invented |
| 6 | `08-six-finishes.png` | six styles to choose from |
| 7 | `14-every-field.png` | every field is yours to set |
| 8 | `12-photos.png` | what photos to send |
| 9 | `17-everything-you-get.png` | the file list |
| 10 | `18-digital-delivery.png` | nothing ships |

Remaining slides (04, 07, 09–11, 13, 15, 16, 19, 20) are built and exported; use them if Etsy
raises the limit or swap them in to test.

## Football — digital POSTER ($49) · `etsy/listing-images/02-football-poster/`

**The opening three now match the basketball poster listing exactly**: hero, scale sheet, room.

| Slot | File | What it answers |
|---|---|---|
| 1 | `01-hero-v3.png` | what is this? (canon hero: sport surface, before photo, arrow) |
| 2 | `02-two-sizes-to-scale.png` | how big is it? — both sizes against the athlete, to scale |
| 3 | `03-kid-and-poster.png` | how will it look in my home? |
| 4 | `04-likeness.png` | will it look like my kid? |
| 5 | `05-kit.png` | the uniform is rebuilt, not invented |
| 6 | `06-four-shots.png` | measured, not claimed |
| 7 | `08-six-finishes.png` | six styles |
| 8 | `16-social-screens.png` | it goes on screens too |
| 9 | `17-everything-you-get.png` | the file list |
| 10 | `18-digital-delivery.png` | nothing ships |

`01-hero.png` is the OLD hero and `02-transformation.png` the OLD image 2 — both superseded,
kept on disk, not for upload.

## Cheerleading — digital CARD ($49) · `etsy/listing-images/01-cheerleading-card/`

Same order as the football card listing, same filenames.

## Cheerleading — digital POSTER ($49) · `etsy/listing-images/02-cheerleading-poster/`

Same ten slots and the same filenames as the football poster listing. Lead finish Signature
Spotlight. Its "in the room" slide is deliberately NOT the three-frame wall — the poster leans on
a dresser, not yet hung, while she writes at her desk.

## Before you publish

- The QR codes printed on images 02 are **real** and resolve to
  `gamedayedition.com/c/<card id>`. Those pages must render, or a shopper who scans from the
  search grid lands on a 404. The ids are in `lib/registry/cards.ts`; the page is
  `app/c/[cardId]/page.tsx`.
- Listing copy lives in `etsy/listings/01-football-card.json`, `02-football-poster.json`,
  `01-cheerleading-card.json` — title, tags and description are ready to paste.
- None of the four listings has a video yet.
- Slide 06 differs on purpose between the two sports: **cheerleading shows a rejected take
  (0.325 against a 0.36 threshold)**, **football shows four passes and no red panel**, because
  no football frame has ever measured below the threshold. Do not "fix" the football one by
  adding a red panel — there is nothing honest to put in it.

## 2026-08-27 — Etsy raised the photo limit to 20

The listing editor now says "Add up to 20 photos and 2 videos", so the ten held-back slides fit
after slot 10 in numeric order (03/04 variants, 07, 09–11, 13, 15/16, 19, 20). The first 10 above
stay exactly as ordered — the grid tile and the price-carrying image 02 do not move.

## Football card draft exists in Shop Manager (2026-08-27)

Made by COPYING the live basketball card listing (Copy keeps variations, personalisation
questions, digital+made-to-order settings the API cannot write). Title/tags/description/SKU are
football + SEO-mined (see etsy/SEO/ETSY-SEO-FINDINGS.md — senior night in the title, measured
gold tags). ⚠️ The copy KEPT basketball's photos and video: replace all media with
`etsy/listing-images/01-football-card/` before publishing. Publishing stays a human step.
