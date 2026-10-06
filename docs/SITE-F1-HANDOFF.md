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

## 2026-10-04 — registry completeness (F1-ART-09)

31. **F1-ART-09 — seventy-two more listing demo cards have a live registry page but no face art**
    (registered 2026-10-04 because their ids are printed on the live Etsy listing images: every card listing
    shows the back of all six finishes, each printing its own id, and only the one or two lead ids per sport
    were registered). Evidence, the per-sport table and the listing defects found on the way (slide 17 prints
    another card's id on 22 poster / banner / blanket images; the ice hockey slide-05 QR opens the wrestling
    card) are in `docs/registry/QR-AUDIT-2026-10-04.md`. Each `/c` page shows the pending block. Close-out
    per card: rebind the back's `#qr` layer to the card's own QR first (F1-QR-01, item 1 — every back on disk
    still encodes `GDE-SN-BKB-2026-23`), export front + back (square-cut) from the sport file, drop them under
    the `lib/registry/art-sources.ts` path, delete the entry from `ART_PENDING`, run `npm run cards:assets`.
    Before publishing any listing, run `npx tsx scripts/registry-qr-audit.ts etsy/listing-images`.
    Ids: GDE-CA-BKB-2026-12, GDE-FS-BKB-2026-12, GDE-HE-BKB-2026-12, GDE-SS-BKB-2026-12,
    GDE-PR-BKB-2026-12, GDE-SN-FTB-2026-54, GDE-CA-FTB-2026-54, GDE-SS-FTB-2026-54, GDE-PR-FTB-2026-54,
    GDE-SN-BSB-2026-07, GDE-CA-BSB-2026-07, GDE-FS-BSB-2026-07, GDE-SS-BSB-2026-07, GDE-PR-BSB-2026-07,
    GDE-FS-SFB-2026-03, GDE-HE-SFB-2026-03, GDE-SS-SFB-2026-03, GDE-PR-SFB-2026-03, GDE-SN-SOC-2026-10,
    GDE-FS-SOC-2026-10, GDE-HE-SOC-2026-10, GDE-SS-SOC-2026-10, GDE-PR-SOC-2026-10, GDE-FS-ICH-2026-17,
    GDE-HE-ICH-2026-17, GDE-SS-ICH-2026-17, GDE-PR-ICH-2026-17, GDE-SN-VBL-2026-05, GDE-CA-VBL-2026-05,
    GDE-FS-VBL-2026-05, GDE-HE-VBL-2026-05, GDE-PR-VBL-2026-05, GDE-SN-LAX-2026-22, GDE-CA-LAX-2026-22,
    GDE-HE-LAX-2026-22, GDE-SS-LAX-2026-22, GDE-SN-WRS-2026-01, GDE-CA-WRS-2026-01, GDE-SS-WRS-2026-01,
    GDE-PR-WRS-2026-01, GDE-SN-CHR-2026-01, GDE-CA-CHR-2026-01, GDE-FS-CHR-2026-01, GDE-HE-CHR-2026-01,
    GDE-SN-GYM-2026-01, GDE-CA-GYM-2026-01, GDE-FS-GYM-2026-01, GDE-PR-GYM-2026-01, GDE-SN-TRK-2026-08,
    GDE-CA-TRK-2026-08, GDE-HE-TRK-2026-08, GDE-SS-TRK-2026-08, GDE-CA-SWM-2026-01, GDE-FS-SWM-2026-01,
    GDE-HE-SWM-2026-01, GDE-PR-SWM-2026-01, GDE-SN-TEN-2026-01, GDE-FS-TEN-2026-01, GDE-HE-TEN-2026-01,
    GDE-PR-TEN-2026-01, GDE-CA-GLF-2026-01, GDE-FS-GLF-2026-01, GDE-SS-GLF-2026-01, GDE-PR-GLF-2026-01,
    GDE-SN-PKB-2026-02, GDE-FS-PKB-2026-02, GDE-HE-PKB-2026-02, GDE-SS-PKB-2026-02, GDE-SN-OTH-2026-12,
    GDE-FS-OTH-2026-12, GDE-HE-OTH-2026-12, GDE-PR-OTH-2026-12.

## 2026-10-06 — free-proof v3 (owner review, 7 builders) + the SEO plan applied

Shipped on `site/free-proof` in one PR (every builder's work integrated, 1,660 tests green, production build green,
browser-checked at 1440 and 375):

**Free proof v3 (owner review 2026-10-06, the pasted 20 points + follow-ups)**
- Hero with the proof visual on the right (`show.proof.basketball` + three phone photos fanned over its corner); the
  four how-it-works cards carry pictures and sit in their own `ProofPathBand` under the hero of `/`, the three family
  pages, `/senior-night`, `/guarantee` and `/how-it-works` (the home hero is back to three blocks).
- Four product cards, no set card: options open INSIDE the chosen card; the set price is a computed line under the
  cards and in "Your order". Product tiles v2: cards, poster, banner, blanket (`docs/f1/ASSETS-RENDERS.md`, €1.00).
- Fields: white fill, 1.5 px ink-60 edge (contrast 2.5 → 4.2:1). "Your order" shows a live nameplate preview on the
  chosen finish's card front as the parent types (first/last name, number only for numbered sports, position · team,
  gold "Class of" for Senior Night).
- Step 4: a seven-tile ✓/✕ photo gallery (real fictional-roster photos) replaces the text block; a free on-device
  photo check (`components/intake/photoCheck.ts`: blur, size, light, duplicate burst, screenshot) runs with no network
  and no model — it cannot see faces, eyes or head direction (documented in ASSETS-RENDERS).
- Permissions: a white "THREE QUICK CONFIRMATIONS." card (four with a crest), plain titles over the verbatim consent
  sentences; the Etsy alternative is one muted line + the house `EtsyButton`.

**SEO (docs/SEO-PLAN-GDE-2026-10.md — read it; seo/README.md for the loop)**
- New pages, every one from a fact table: `/sports` + 9 sport pages (`lib/seo/sport-facts.ts`), 9 senior-night
  spokes (`lib/seo/senior-night-facts.ts`), `/banners`, `/christmas-gift` (order-by dates computed), `/teams`
  (honest email-first setup). 4 blog posts (11 total). The senior-night hub tiles, the family sport pickers and the
  home proof wall now link them.
- Gates: `tests/seo-families.test.ts` (≤ 20 % templated sentence shapes per page, ≥ 12 own sentences),
  `tests/seo-infra.test.ts` (fact-table hygiene, honest lastmod, llms.txt, IndexNow key, attribution, nav).
- Fixed on the way: `pageMeta()` always set `openGraph.images`, which made Next ignore every per-route
  `opengraph-image.tsx` (`/senior-night`, `/trading-cards` … all shared `/og.webp`). Now a route with its own image
  gets no `images` key (`lib/seo/meta.ts routeHasOgImage`).
- `/llms.txt`: sport lines, every FAQ answer verbatim, a "Do not say" misquote firewall, how to cite.
- Measurement: `npm run seo:monitor` (weekly Search Console monitor → `seo/REPORT.md`; needs the owner's
  service account), IndexNow after every main deploy (`.github/workflows/indexnow.yml` waits for `/api/version`),
  first-touch entry attribution (`components/EntryAttribution.tsx` → the free-proof request's `source.landingPath`
  is the ENTRY page, not `/free-proof`), the AI-answer panel (`seo/ai-panel/questions.json`, monthly by hand).
- Banner SKUs resolve (`GDE-<code>-BAN`, `GDE-<code>-SNBAN`; `GDE-ANY-BAN` → the shop front); basketball's Senior
  Night set listing (4580022282) is in the catalog; `/teams` is a page again (`TEAMS_HREF`).

**Owner, in order (nothing on the site is blocked on these; the measurement is)**
1. Search Console: Domain property `gamedayedition.com` (DNS TXT), second owner, submit
   `https://www.gamedayedition.com/sitemap.xml`, inspect `/`, `/free-proof`, `/senior-night/volleyball`,
   `/sports/baseball`, `/banners`. Then a service account for the monitor (`seo/README.md` §1), or say so and we do
   it together. Bing Webmaster Tools: import from Search Console.
2. Supabase (unpause + bucket `athlete-submissions`) + `RESEND_API_KEY` + redeploy — still open from 2026-10-04;
   until then the form falls back to email and no attribution row is stored.
3. Privacy page vs the Meta pixel: `/privacy` says "No advertising pixels" and the pixel component ships the moment
   `NEXT_PUBLIC_META_PIXEL_ID` is set. Before the first ad: either the lawyer rewrites that bullet or the pixel stays
   off. (The new attribution bullet on `/privacy` is already true: a path and a referrer, in the browser only.)
4. Banner lab: declare the banner printer as an Etsy Production Partner and add it to `lib/catalog/shipping.ts` /
   C19 — until then banner tiers say "Ships separately, 1–2 weeks" and carry no shippingDetails markup.
5. Etsy listing images the product-tile builder found defective (on the site's denylist, still live on Etsy): the
   football and volleyball banner `use-fence.png` mirror the athletes at the edges (BORDER_REFLECT in
   `banner_listing_assets.art_for_quad`; scale-to-cover fixes it), all eleven armchair blanket images stretch the art,
   `02-football-poster/src/mock-room-PR.png` shows an older poster layout.
6. Blanket prices into `lib/catalog/prices.ts` when the blanket listings go live (then `/blankets` passes the
   new-URL rule); swap the blanket product tile (a mockup, labelled) for a photo of the production sample.
7. Wrestling: the catalog says `numbered: true` (number on the front) while the kit, the fact rows and C9 treat the
   singlet as number-free (plain back). The hub line and the wrestling pages no longer promise a number; decide
   whether the catalog flag should flip (it drives the intake's number field and `showsJerseyNumber`).

## Not in F1 on purpose

Direct checkout and order pages, team links, `/sports/<sport>`, `/styles/<finish>`,
`/senior-night/<sport>`, `/christmas-gift`, the blog, reviews, the Meta pixel. All are F2–F4 in
`docs/SITE-BUILD-SPEC-2026-09.md` §11. (2026-10-04: the blog and the Meta pixel — off until its env var
is set, `/free-proof` only — have since been built; checkout is still F2.)
