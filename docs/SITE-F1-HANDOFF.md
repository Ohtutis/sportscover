# Site F1 — what shipped, what the owner still has to do (2026-09-08)

F1 rebuilt the whole marketing site and the card registry on the design system in
`docs/f1/DESIGN.md`, the copy in `docs/f1/COPY.md` and the contracts in `docs/f1/CONTRACTS.md`.
Integrator decisions that override those documents are in `docs/f1/GAPS.md`; every builder's
notes, decisions and requests are in `docs/f1/INTEGRATION-NOTES.md`.

## Shipped in code

**Pages** — `/` (13 sections), `/trading-cards`, `/posters`, `/complete-set`, `/senior-night`
(with the order-by calculator and a printable gift note), `/how-it-works`, `/guarantee`,
`/photo-guide`, `/about`, `/faq`, `/contact`, `/registry`, `/accessibility`, `/privacy`,
`/privacy/biometric`, `/terms`, `/c/<cardId>` for every registry record, plus `not-found`,
`error`, per-route OG images, `sitemap.xml`, `robots.txt`, `/registry/lookup`, `/api/gone`,
`/go/etsy/<sku>`, `/etsy`.

**Design system** — Tailwind 4 tokens (stock / ink / accent / navy / arena / silver), Anton +
Space Grotesk + Barlow through `next/font`, the seven per-finish font pairs loaded only on
`/c`, the brand shield and wordmark as real vector components, and ~35 shared components
(TierCard, EditionPanel, CardFlip, BracketFrame, GateRow, FourFears, TrustLine, Ledger,
ToScaleSheet, PhotoChecklist, OrderByCalculator …).

**Truth rules in code** — prices only from `lib/catalog/prices.ts` (Etsy buyer price + 10 %,
rounded up to .99); delivery chips verbatim from `lib/catalog/delivery.ts`; the forbidden-string
lint; the FictionalLabel on every fictional athlete; no reviews block until a real review with
consent exists; unlisted customer pages carry no name in any meta tag.

**Assets** — 74 site images and 15 card faces converted with provenance checks (roster athletes
only, square corners audited, no count-bearing pack or certificate art, no pre-rename exports).
Every card back the site shows was re-stamped with the correct QR and decode-tested.

## Owner checklist

Nothing here blocks the deploy. Items marked ⚠ block F2 (direct checkout).

1. **F1-QR-01 — the QR layer was never rebound in the Figma sport files.** Eleven card backs on
   disk encode the demo athlete's page instead of their own. The website is safe (every back it
   serves was re-stamped), but the **live Etsy listing images** and **the physical card already
   shipped to the Order 03 customer** still carry the wrong QR. Fix the `#qr` layer per sport
   file, re-export, and consider a reprint for that customer.
2. **F1-ART-01** — export four card faces (front + back) from the softball and wrestling sport
   files: `GDE-CA-SFB-2026-03`, `GDE-SN-SFB-2026-03`, `GDE-FS-WRS-2026-01`, `GDE-HE-WRS-2026-01`.
   Target paths are pre-declared, so the close-out is: drop the files, delete the entries from
   `ART_PENDING`, run `npm run cards:assets`.
3. **F1-ART-05** — two square-cut BACK exports (Heritage football, Signature Spotlight
   cheerleading). Same recipe, about ten minutes.
4. **F1-ART-02** — decide on the oldest demo record (`GDE-SN-BKB-2026-23`): regenerate its art
   with the audit, or set the record private. Until then its page shows the pending block.
5. **F1-ART-04** — dark flip re-renders. No flip video on disk is shippable (all are light-ground
   or built from pre-square-corner faces), so `/c` ships the CSS flip with no video fallback.
6. **F1-ART-03** — square-cut fronts for the nine sports whose tiles currently use an inset crop.
7. **Sale renewal** — bump `SALE_EXPIRES_AT` in `lib/catalog/prices.ts` before **2026-09-24**,
   or the site silently switches to base prices and the per-card anchor changes.
8. ⚠ **Imprint** — set `NEXT_PUBLIC_IMPRINT_LEGAL_NAME`, `_COMPANY_CODE`, `_VAT`, `_ADDRESS` on
   Vercel. Until then the footer, `/about` and `/terms` show the fallback line and never claim a
   legal entity.
9. ⚠ **Lawyer** — `/privacy`, `/privacy/biometric` and `/terms` are lawyer-ready drafts, not
   legal advice. They must be read before F2 takes payments.
10. **Founder photo** — add `public/brand/founder.jpg` (your real Etsy profile photo). Until then
    the founder blocks render with the name only, never a generated face.
11. **Verification tokens and social URLs** — Google, Bing, Pinterest, Meta; Instagram, TikTok,
    YouTube, Pinterest, Facebook. Submit the sitemap in Search Console and Bing.
12. **Delete the pre-rename Vercel env vars** if you have not yet (`NEXT_PUBLIC_BRAND_NAME`,
    `NEXT_PUBLIC_OWNER_NAME`, `NEXT_PUBLIC_SITE_URL`, `RESEND_FROM_EMAIL`).
13. **Confirm two facts the copy relies on** — that the poster partner ships the printed
    certificate with poster-only orders, and the lab holiday list and five-day transit
    assumption in `lib/capacity.ts`.
14. **Confirm the two real customers' unlisted pages** before their card art is published, even
    though the pages are unlisted and noindexed.
15. **Guarantee wording gap** — the site no longer promises an at-cost reprint for an error the
    customer approved on the proof. Decide what you want to promise and say it on `/guarantee`
    and in `/terms#refunds`.

16. **Wallpaper safe zones** — the site no longer promises them (Stadium Night and Chrome All-Star
    wallpapers still lack the pass). Run that pass, then put the promise back in one place:
    `deliverables.posters` in `lib/catalog/tiers.ts`.
17. **Complete-set file count** — the Etsy listing advertises 27 files and one live page, but the
    per-folder description adds up to more. Publish the real per-folder counts and the site can
    enumerate them again.
18. **Sports without a live Etsy listing** — nine card sports and two poster sports now send buyers
    to the Complete Set listing, because sending them to another sport's listing showed a
    basketball card to a gymnastics buyer. Publishing those listings turns the CTA back on
    automatically (add the listing id in `lib/catalog/sports.ts`).

19. **An adult athlete for the hero story (F1-ART-07).** The hero cycles three scenes — basketball,
    softball, football — but the owner asked for an older athlete as the third beat, and no adult
    roster athlete has card or poster art anywhere in the repo. Render a front, back, poster and one
    "before" frame for Ray Solberg (pickleball, 58), and `hero.story.4.*` drops straight in with no
    code change.

20. **Publish the missing Etsy listings, and the picker improves itself.** Only six sports have their
    own trading-card and poster listing (basketball, football, baseball, soccer, volleyball,
    cheerleading). The other eleven now tell the buyer plainly that they open the Complete Set
    listing instead. Softball and wrestling already have drafts in `etsy/listings/`. Publishing a
    listing is a one-line change: add its id to that sport in `lib/catalog/sports.ts` and it moves
    into the "Has its own listing" group automatically.

21. **Closed on 2026-09-08 — the "finished and smooth" round.** Two audits (layout at 1440 / 1024 /
    834 / 768 / 390, and motion / interaction / states / copy voice) produced 9 layout blockers, 6
    interaction blockers, ~35 should-fixes and a jargon table; all were fixed by three parallel
    builders with file ownership, measured before and after in Chrome. Highlights: the hero holds a
    complete frame when paused; tap targets ≥ 44 px on every touch control (FAQ rows, mobile menu,
    breadcrumbs, `/c` buttons); the tier ladder never orphans a tier; `/senior-night`'s nine-sport
    row is a scroller on phones; product heroes no longer crop the poster or the held card; one
    17-sport grid scale for the whole site; tablet pages are ~25 % shorter; the header is 64 px from
    768; `/c` card sits at the panel's top edge and loads each font once; the registry miss keeps the
    typed ID; the whole site speaks to a parent (no "plate", "gate", "artefact", "re-rolled").

    Still open, all taste-level: the home H1 is four lines between 1024 and 1279 (it is a 46-character
    sentence); `/senior-night` §04 is ~1,700 px at 1440 (target was 1,400); "Copy ID" on the edition
    panel stays a 24 px inline control by DESIGN §2.6; the font-swap CLS fix (metric-matched fallbacks)
    could not be measured against a reproducible "before"; `app/error.tsx` has no header or footer
    by design.

22. **F1-ART-08 — eighteen listing demo cards have a live registry page but no face art** (deployed
    2026-09-23 because their QRs were already printed on the Etsy listing images for ice hockey,
    lacrosse, track, golf, gymnastics, pickleball, tennis, swimming and skateboarding). Each `/c` page
    shows the pending block. Close-out per card: export front + back (square-cut) from the sport file,
    drop them under the `lib/registry/art-sources.ts` path, delete the entry from `ART_PENDING`, run
    `npm run cards:assets`. Ids: GDE-CA-ICH-2026-17, GDE-SN-ICH-2026-17, GDE-SS-GYM-2026-01,
    GDE-HE-GYM-2026-01, GDE-PR-PKB-2026-02, GDE-CA-PKB-2026-02, GDE-CA-TEN-2026-01, GDE-SS-TEN-2026-01,
    GDE-HE-GLF-2026-01, GDE-SN-GLF-2026-01, GDE-FS-LAX-2026-22, GDE-PR-LAX-2026-22, GDE-PR-TRK-2026-08,
    GDE-FS-TRK-2026-08, GDE-SN-SWM-2026-01, GDE-SS-SWM-2026-01, GDE-SS-OTH-2026-12, GDE-CA-OTH-2026-12.
    Avery O'Neal's card (`GDE-FS-FTB-2026-80`, order #4180204338) is an unlisted customer record — its
    art is built only from `orders/**` with `--allow-orders`, never committed to `public/`.

## 2026-10-04 — free proof first (D29): what the owner still has to do

The site now converts to a **free-proof request** instead of an Etsy click: every primary button opens
`/free-proof` (prefilled from the page it sits on), Etsy is the outline "Also on Etsy →" beside it, and a
four-step path (send photos → free watermarked proof → choose digital or printed and pay your way → we
complete the order) sits under every hero CTA. Payment happens only after the parent approves the proof —
by a secure payment link you send, or on Etsy. The decision, the routes, the prefill contract, the
storage layout and the request runbook are in `docs/SITE-F2A-FREE-PROOF-2026-10.md`; one flag,
`FREE_PROOF_FIRST` in `lib/site.ts`, turns it all back to the Etsy-primary site.

23. **Vercel env vars** — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
    `SUPABASE_STORAGE_BUCKET` (default `athlete-submissions`), `SUBMISSION_SIGNING_SECRET`,
    `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `OWNER_NOTIFICATION_EMAIL`; optional
    `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. Until the Supabase three are set the form
    tells parents to email their photos instead; `/api/intake/health` shows which parts are on.
24. **Supabase** — keep the project awake (free projects pause after a week idle) and make sure the
    bucket is **private**; the site only ever hands out signed upload URLs.
25. **Resend** — verify the sending domain for `gamedayedition.com`, or the two emails (yours and the
    parent's) fail; a failed email never loses the request, but the parent gets no confirmation.
26. **Blanket prices** — add the blanket tiers to `lib/catalog/prices.ts` and their SKUs to the blanket
    options in `lib/intake/products.ts`; until then the form says "Price confirmed with your free proof".
27. **Banners on Etsy** — printed banners are made through Printify: declare it as a Production Partner
    on Etsy before a printed banner is sold there.
28. **Meta pixel** — set `NEXT_PUBLIC_META_PIXEL_ID` on Vercel and redeploy when the ads start. It loads
    only on `/free-proof` and `/free-proof/thanks` (never `/c`, `/order` or the registry), sends a
    PageView and, on the thanks page, a Lead; browsers sending Global Privacy Control get nothing.
29. **Lawyer** — the consent sentences on the form are the spec's (D16), versioned; the written
    biometric policy already exists at `/privacy/biometric` — confirm it covers a request that never
    becomes an order (destroyed within 30 days), and whether running the pixel for ad targeting needs a
    "Do Not Sell or Share" link (CCPA) before the ads scale.
30. **Each request** — pull it with `npx tsx scripts/intake-pull.ts <requestId>`, build the proof, send it
    with the payment choice, and after payment run the usual `card:new` → `qr:gen` → `cards:assets`
    sequence from `docs/ORDER-TO-WEB-CARD-FLIP.md`. Delete a declined request's folder 30 days after the no.

### Production state after the merge (2026-10-04, PR #13 live)

`GET https://www.gamedayedition.com/api/intake/health` → `storage: true, email: false, turnstile: false,
bucket: "athlete-submissions"`: the Supabase variables from the old site are still set on Vercel; the
Resend key is not. A real end-to-end submission from the build machine (fictional roster photos,
`start` → signed uploads → `complete`) answered **503 `storage_unavailable`** at `start`, so the
form currently shows its honest fallback (email your photos to hello@). Most likely cause: the
Supabase project has been **paused** (free tier, idle since August) or the bucket is missing. To
switch the form on: (1) open the Supabase dashboard → restore/unpause the project; confirm the
private bucket `athlete-submissions` exists (no MIME restriction, ≥ 25 MB file limit); (2) set
`RESEND_API_KEY` on Vercel (and verify gamedayedition.com in Resend); (3) redeploy; (4) re-run the
five-line first real test in `docs/SITE-F2A-FREE-PROOF-2026-10.md` — `health` must show
`storage: true, email: true` and a phone submission must land on `/free-proof/thanks`.

## Not in F1 on purpose

Direct checkout and order pages, team links, `/sports/<sport>`, `/styles/<finish>`,
`/senior-night/<sport>`, `/christmas-gift`, the blog, reviews, the Meta pixel. All are F2–F4 in
`docs/SITE-BUILD-SPEC-2026-09.md` §11. (2026-10-04: the blog and the Meta pixel — off until its env var
is set, `/free-proof` only — have since been built; checkout is still F2.)
