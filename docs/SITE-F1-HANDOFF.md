# Site F1 — what shipped, what the owner still has to do (2026-09-07)

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

21. **Design follow-ups the 2026-09-07 audit left open** (all small, none blocking): `/posters` and
    `/complete-set` heroes still stack price line + chips + trust row where `/trading-cards` was
    trimmed to one system; the arena plate under the rejected/approved pair; tap targets in the
    breadcrumbs and mobile menu are under 44 px; the to-scale sheet always hangs football art (no
    per-sport poster key); `/senior-night` §04 grew to ~2,300 px at 1440 with full-size tiles; the
    home page is longer on phones now that sport tiles are whole cards and the proof pair stacks
    (the lever is three columns in §07 on phones — a taste call); the hero's four-photo deal costs
    ~370 KB at 390 px against a 600 KB budget (the lever is dealing two photos on phones).

## Not in F1 on purpose

Direct checkout and order pages, team links, `/sports/<sport>`, `/styles/<finish>`,
`/senior-night/<sport>`, `/christmas-gift`, the blog, reviews, the Meta pixel. All are F2–F4 in
`docs/SITE-BUILD-SPEC-2026-09.md` §11.
