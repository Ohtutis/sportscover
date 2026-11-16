# Free proof first, pay later — the site's conversion from 2026-10-04 (D29)

The owner's decision of 2026-10-04, as built. Read this before touching `lib/cta.ts`, `lib/site.ts`,
`app/(marketing)/free-proof/**`, `app/api/intake/**` or `lib/intake/**`.

## 1. The decision (D29)

- **The conversion is a free-proof request.** Not an Etsy click (F1), not yet a Stripe checkout (F2). A
  parent chooses what to make — trading cards, a poster, a banner, a blanket; one or all; digital or
  printed, with sizes — picks one of the six finishes or the Senior Night edition (or lets us
  recommend), and sends 4–10 photos. We build a **watermarked proof for free** within 1–2 business days.
- **Pay only after approving.** If the parent loves the proof, we send a **secure payment link**, or
  they pay **on Etsy** — their choice. Then the watermark comes off and the files and prints follow. If
  the proof is not right after one revision, there is nothing to pay.
- **The site never takes a card number.** No checkout, no account, no stored payment data.
- **Etsy stays — always as the secondary.** Every primary button opens `/free-proof`; Etsy is the outline
  "Also on Etsy →" beside it (the header keeps "Look up a card" instead). Demo cards printed on Etsy
  listing images still link back to Etsy only (S19 / D26) — unchanged.
- This is D4's own fallback path ("request → photo check → owner-sent link"), promoted to the main
  path while Stripe waits for the lawyer. Meta ads land on `/free-proof`.

The whole mode is one flag: `FREE_PROOF_FIRST = true` in `lib/site.ts`. Setting it to `false` restores
the F1 Etsy-primary site everywhere (labels, links, the four-step path, the FAQ answers, the timeline).
`SITE_SELLS_DIRECT` (F2, Stripe) wins over it the day it flips. Pages ask `freeProofMode()` from
`lib/cta.ts` before printing anything that is only true in this mode.

## 2. The flow

1. **Send photos** — the parent fills `/free-proof` (products + options, style, athlete, photos, contact,
   consents). Nothing to pay, no card details.
2. **Free watermarked proof** — we check the photos (email the same day if one more angle would help),
   build the proof, email it within 1–2 business days.
3. **Choose digital or printed, and pay the way you prefer** — secure payment link or Etsy. One revision
   is included before that.
4. **We complete the order** — watermark off; digital files within 1–2 business days of payment, printed
   items ship within 5–7.

The four steps are ONE constant, `PROOF_PATH` in `lib/copy/canon.ts`, rendered by `components/ProofPath.tsx`
under the hero CTA of `/`, `/trading-cards`, `/posters`, `/complete-set`, `/senior-night`, `/guarantee` and
`/how-it-works`, and set as one sentence (`proofPathLine()`) in the FAQ answer "Do I pay before I see
anything?". The promise sentence is `CANON.proofFirstLine`:

> You see a free watermarked proof before you pay anything. Pay only if you love it — then the watermark
> comes off and the files and prints follow.

## 3. Routes

| Route | What | Index | Sitemap | Pixel |
|---|---|---|---|---|
| `/free-proof` | the request form (builder A) | yes | yes (F1 row, priority 0.9) | yes, when the env var is set |
| `/free-proof/thanks` | confirmation + reference + `Lead` | **noindex** (row + `X-Robots-Tag`) | no | yes, when the env var is set |
| `POST /api/intake/start` | validate, write `request.json` (status `uploading`), hand out signed upload URLs | — | — | — |
| `POST /api/intake/complete` | verify token + paths, status `received`, send both emails | — | — | — |
| `GET /api/intake/health` | `{ storage, email, turnstile, bucket }` booleans only, `no-store` | — | — | — |

### Where every primary button goes (`ctaFor`)

| Context | Label | Primary href | Secondary |
|---|---|---|---|
| header | "Get a free proof →" ("Free proof →" below 640 px) | `/free-proof` | "Look up a card" → `/registry` |
| home (hero, §12, `/guarantee`, `/how-it-works`, `/faq`, `/about`, `/photo-guide`) | "Get a free proof →" | `/free-proof` | "Also on Etsy →" → `/go/etsy/GDE-ANY-SET` |
| cards | "Get a free proof →" | `/free-proof?product=cards&sport=<slug>` | the sport's card listing |
| posters | "Get a free proof →" | `/free-proof?product=poster&sport=<slug>` | the sport's poster listing |
| set | "Get a free proof →" | `/free-proof?product=cards,poster&sport=<slug>` | the Complete Set listing |
| senior-night | "See your proof first →" | `/free-proof?product=cards,poster&sport=<slug>&style=SR` | the sport's SN set listing |
| card page (`/c`, real customer) | "Get a free proof →" | `/free-proof?product=cards&sport=<slug>&style=<code>` | the GAPS #18 SKU |
| card page (demo-etsy) | "Get yours on Etsy →" (outline, alone) | unchanged | — |
| tier cards | "Get a free proof →" + the tier's option | e.g. `…?product=cards&option=p12&sport=basketball` | that tier's listing SKU |
| home family tiles | "Get a free proof" | `…?product=cards` / `…?product=poster` / `…?product=cards,poster` | (header nav keeps the family pages) |
| footer "Shop" | "Free proof" (first link) | `/free-proof` | — |

### The prefill contract (`freeProofHref`, read by `components/intake/model.ts` `parsePrefill`)

`/free-proof?product=cards,poster&option=…&sport=basketball&style=SR&classOf=2027`, always in that order,
every parameter optional, an unknown value dropped before it is written:

- `product` — comma list of `cards | poster | banner | blanket`.
- `option` — one bare option key applying to every listed product that offers it (`p12`, `digital`), or
  `product:option` pairs (`cards:p12,poster:p1824`). A tier SKU becomes its option through
  `optionForSku`: `GDE-BKB-CARD-P12` → `p12`; the Complete Set's `DIG` → `digital`, `PRINT` →
  `cards:p12,poster:p1824`, `DLX` → `cards:p24,poster:p2436` (what `boxContents` says they hold).
- `sport` — the slug (a code is accepted as input and written as the slug).
- `style` — the style code (`SN CA FS HE SS PR SR`).
- `classOf` — one of `CLASS_YEARS`.

## 4. Storage and environment (from the builders' brief)

Bucket `SUPABASE_STORAGE_BUCKET` (default `athlete-submissions`), **private**:

```
proof-requests/<yyyy-mm>/<requestId>/request.json      status uploading → received; consents + consentTextVersion; source (landing path, referrer, utm_*, fbclid)
proof-requests/<yyyy-mm>/<requestId>/photos/<nn>-<sanitised-name>
proof-requests/<yyyy-mm>/<requestId>/crest/<sanitised-name>
```

Request ids look like `GDE-R-20261004-7KQ2MX` (never a card ID).

| Variable | Where | What |
|---|---|---|
| `SUPABASE_URL` | server | the project URL |
| `SUPABASE_ANON_KEY` | server (handed to the browser in the start response for the signed-upload headers) | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | writes `request.json`, signs upload URLs |
| `SUPABASE_STORAGE_BUCKET` | server | default `athlete-submissions` |
| `SUBMISSION_SIGNING_SECRET` | server | HMAC for the complete token (falls back to a hash of the service key) |
| `RESEND_API_KEY` | server | the two emails |
| `RESEND_FROM_EMAIL` | server | default `Game Day Edition <hello@gamedayedition.com>` |
| `OWNER_NOTIFICATION_EMAIL` | server | default `hello@gamedayedition.com` |
| `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | server + build | optional bot check; verified only when the secret is set |
| `NEXT_PUBLIC_META_PIXEL_ID` | build | optional; the Meta pixel is off until it is set (§6) |

Every missing variable degrades honestly: `/api/intake/health` says which part is off, `start` answers 503
and the form shows the email fallback ("Email your photos … to hello@…"), a failed email is logged and
never blocks the request. No key is ever logged.

## 5. Owner runbook — one request, start to finish

1. **It arrives.** Two emails go out on `complete`: the parent's confirmation (with the reference) and
   yours at `OWNER_NOTIFICATION_EMAIL` — the same summary (products and options with their prices, style,
   athlete, contact, consents) plus a 7-day signed link per file, the `request.json` link and where the
   visit came from. The files are already in the bucket. If an email failed, the request is still
   there: `npx tsx scripts/intake-pull.ts --list --month 2026-10` lists the month, including requests
   whose upload never completed ("upload not completed" — the contact details are in the record; follow
   up by email).
2. **Pull it.** `npx tsx scripts/intake-pull.ts GDE-R-20261004-7KQ2MX` → `orders/<requestId>/from-buyer/`
   (`request.json`, photos, crest) and a printed summary. `orders/` is git-ignored — personal data never
   enters the repo. Credentials come from the environment or `.env.local`.
3. **Check the photos** the same business day (`npm run art:intake -- --photos <dir>`); if one more angle
   would help, reply to the confirmation thread the same day.
4. **Build the proof** the usual way (crest → kit → identity → poses → finish; README §27 and
   `docs/FINISH-COMPLETION-PLAYBOOK.md`), watermarked, within 1–2 business days.
5. **Send the proof + the payment choice** in one email: the watermarked proof, one revision offered, and
   both ways to pay — a secure payment link for the quoted options (prices from `lib/catalog/prices.ts`;
   the blanket is "priced on your proof" until its tiers exist) or the matching Etsy listing.
6. **After payment**: remove the watermark, deliver, and put the card on the web exactly as an Etsy order
   — `npm run card:new`, `npm run qr:gen`, `npm run cards:assets -- --id <cardId> --allow-orders`, PR,
   owner merge, `curl` the live `/c/<cardId>` for a 200 (`docs/ORDER-TO-WEB-CARD-FLIP.md`). Printed items
   go to the suppliers in `docs/SUPPLIERS.md`.
7. **Retention.** A request that ends in a "no" (or no answer after the reminders): delete its bucket
   folder and `orders/<requestId>/` **30 days** after the no — the biometric consent the parent gave says
   "destroyed when my request closes — within 30 days if I don't go ahead". A paid request follows the
   order table (D15): photos 30 days after delivery, artwork 12 months, registry record ≥ 5 years.

## 6. Meta ads and measurement (D19 kept honest)

- `components/MetaPixel.tsx` renders nothing and loads nothing until `NEXT_PUBLIC_META_PIXEL_ID` is set
  at build time (digits only; anything else loads nothing). Set it on Vercel and redeploy to turn it on.
- It is mounted by **one file**, `app/(marketing)/free-proof/layout.tsx`. `/c`, `/order`, `/registry`
  and every other page never load it (a test scans for any other import).
- No `<noscript>` image beacon; `autoConfig` off (no automatic button-click or page-metadata events);
  `disablePushState` (no PageView on later client navigations, so leaving `/free-proof` sends nothing
  more); a browser sending **Global Privacy Control** gets no pixel at all.
- Events: one `PageView` per page load that reaches `/free-proof`; `CustomizeProduct` when a product or
  style tile is chosen; **`Lead` on the thanks page**, once per request reference (`lib/track.ts`;
  payloads carry product keys only — never a name, an email or a photo).
- **UTMs**: the form records the landing path, the referrer and `utm_source / utm_medium / utm_campaign
  / utm_content / utm_term / fbclid` in `request.json` (`source`), so every request can be traced to its
  ad without the pixel.
- Not built: CAPI, a consent banner, a "Do Not Sell or Share" link. See §8.

## 7. Deliberately not built

- **No database** — the bucket is the store; `request.json` is the record (D25's free tiers).
- **No admin UI** — the owner works from the email, `scripts/intake-pull.ts` and the bucket console.
- **No Stripe / no checkout** — payment is a link the owner sends, or Etsy. F2 stays as specced.
- No accounts, no saved drafts, no team links (F2), no automatic proof status page.

## 8. Open items for the owner

- Vercel env vars (§4); Supabase project awake (free projects pause after 7 days idle) and the bucket
  **private**; Resend sending domain verified for `gamedayedition.com`.
- Blanket prices: add the tiers to `lib/catalog/prices.ts` and their SKUs to the blanket options in
  `lib/intake/products.ts` — until then the form says "Price confirmed with your free proof".
- Banners are printed through Printify: declare it as a Production Partner on Etsy before selling a
  printed banner there.
- The pixel id, and before scaling ads: the lawyer's view on CCPA "sharing" (a pixel used for ad
  targeting may need a "Do Not Sell or Share" link; GPC is already honoured) and on a consent banner for
  non-US visitors.
- Lawyer: the consent sentences are the spec's (D16), versioned by `CONSENT_TEXT_VERSION`; the written
  biometric policy (`/privacy/biometric`) already exists — confirm it covers a request that never becomes
  an order (30-day destruction).

## v8 — the ads landing order (2026-10-07, stage A of the ChatGPT brief the owner relayed)

Stage A touched nothing in the form, the API or the uploads. The page now reads: hero (eyebrow "Free custom proof",
H1 "Turn their photos into their own sports collectible.", one sentence, "Create my free proof →", three claims:
nothing to pay today / no card required / proof in 1–2 business days) → the three-beat strip (upload → we create it →
see it first, with the digital "from" price as the anchor) → "LET'S CREATE YOUR ATHLETE." and the form at once → the
five-card how-it-works band (`#how-it-works`) → "From camera roll to collectible" (three sports, phone photos → poster +
card, `components/intake/Examples.tsx`) → six trust lines (`TrustGrid`) → the nine-question FAQ (`faqSubset("free-proof")`,
FAQPage JSON-LD) → the closing "You don't have to buy it. You just have to see it." (`FinalCta`) → a sticky phone bar
(`StickyCta`, hidden while `#free-proof-form` is on screen). Every CTA glides to `#create`. Deliberate deviations from
the brief: no "$0" wording (owner, 2026-10-07: a zero reads as "free overall"), the price anchor sits in the strip
rather than under the hero CTA (owner, 2026-09-07), banners and blankets stay on the page. Stage B (the four-step
form, defaults instead of early decisions, the privacy box, the thanks page, `product=card|poster|complete-set`
links, funnel events) is its own PR.

## v8 stage B — the four-step form (2026-10-07)

UI and state only; `onSubmit`, the start/complete calls, the uploads, the payload (`buildPayload`) and the consent
sentences are untouched. Four steps: 1 WHAT ARE WE MAKING? (three parts under one heading: their sport; what to
make — three category radios card / poster / complete set that set the card and poster flags (`chooseCategory`),
"more to make" with the banner and the blanket as checkboxes, "choose formats and sizes now (optional)" that reveals
the old option rows for chosen products, the bundle ladder; the look — "choose the best style for me" first and
chosen by default (`initialState().style = "recommend"`), the seven tiles under "or choose the look yourself"),
2 WHO ARE WE CREATING? (unchanged fields), 3 UPLOAD THEIR PHOTOS (two reassurance lines over the uploader),
4 WHERE SHOULD WE SEND YOUR PROOF? Then the privacy box ("Your photos stay private."), the three unchanged
confirmations, "Create my free proof →" / "No payment information required." Ad links: `product=card|poster|
complete-set|set|banner|blanket` (`PRODUCT_LINK_KEYS`), `campaign=senior-night` → the Senior Night look
(`CAMPAIGN_STYLES`); `style=` wins. Pixel: `trackCustom` ProofStart (first touch), SportSelected, PhotoUpload; the
Lead stays on the thanks page. On the funnel the header shows How it works / Examples / FAQ (`FUNNEL_LINKS`).
Thanks page: "Your free proof is in the works." with the three next steps.

## v9 — the owner's review of v8 (2026-10-07, evening)

Three corrections, all live in one PR: (1) the product step is the four cards with their option rows again — "the
choices were good, no complete set here"; the category radios, "more to make" and the formats disclosure are gone.
(2) The look: Stadium Night is the default (`initialState().style = "SN"`), and "You choose for me" is the dark tile
after Senior Night again, never pre-selected — the full-width recommended card had become "the strongest button on the
page". (3) The brief's three-beat text strip under the hero read weaker than the five-card band, so the band is back
directly under the hero and the strip is deleted; the form follows the band. The hero itself was remade (the owner:
"I wanted it completely redone"): no sheet, no bracket frame — the poster stands large with a "Their edition" pill,
the card over its corner with C13, one PROOF stamp across the art, the phone-photo fan in front with "Your photos →".
The four-step form, the privacy box, the funnel header, the link mapping and the funnel events from stage B stay.

## Pricing v2 — the digital add-on (2026-10-07, evening)

Owner: "if everything chosen is digital, a bigger digital saving must apply than on printed — the files cost me
nothing extra and the sale needs the harder push. The first 19.99, the second, third and fourth 5 each." Implemented
in the one bundle function, `lib/catalog/prices.ts` `bundleTotal`, so the form's ladder, "Your order", the conversion
card, the request emails and the set tiers all move together:

- A `BundleLine` now says whether it is the product's digital files (`digital`). `DIGITAL_ADDON = 5`.
- **All digital:** the first product `DIGITAL_PRICE` (19.99), every further product `DIGITAL_ADDON` — 2 products 24.99,
  3 products 29.99, all 4 **34.99** (bought separately 79.96, saving 44.97 = 56 %). `allDigitalTotal(count)`.
- **Printed:** unchanged — the printed ladder by the number of PRINTED products (2 → 15 %, 3 → 20 %, 4 → 25 %, the
  printed total rounded down to .99).
- **Mixed (my decision, consistent with the rule — the owner named only the all-digital case):** the printed
  products are the printed ladder by their own count, and every digital product in the order is the add-on. A printed
  poster + the cards' files = 46.99 + 5 = 51.99; two printed at 15 % + two digital = 72.99 + 10 = 82.99. Adding a
  product never lowers the total, and moving a product from files to print never lowers it either (both tested over
  every combination of options). The alternative — the printed rate by the TOTAL product count with digital at the
  add-on — made "add the cards' files" cost less than the poster alone, so it was rejected.
- `discountRate` is now the effective share saved (discount ÷ à-la-carte); `formatPercent` rounds DOWN so a chip beside
  a "2 products −15%" rung never reads "16%" (the .99 rounding lifts 15 % to 15.5 % on the Deluxe pair).
- **The digital Complete Set** (`GDE-ANY-SET-DIG`, the bundle of its two digital parts) is therefore **24.99** (was
  33.99) — still above Etsy's digital set buyer price of 24.49, so the site never undercuts Etsy (tested).
- **The ladder under the product cards** has two rows: "Digital files — 2 products $24.99 · 3 products $29.99 · all 4
  $34.99" and "Printed — 2 products −15% · 3 products −20% · all 4 −25%"; an all-digital order lights the digital row
  by its count, printed products light the printed row by theirs. The live line: before a choice "Every extra product
  as digital files is $5 more. Printed products save by their number."; next product as files → "Add a poster as
  digital files for $5 more."; next product printed → the saving as before; all four digital → "All four as digital
  files: $34.99 together."; all four otherwise → "…the whole order saves 25%."
- **The conversion card** (owner, the same evening: "where we show at the end what it will cost if they approve the
  proof — like we have the price on the side"): beside "Today $0", once a product is chosen, "After approval" with the
  bundle total at the same size, and under it the same items bought separately struck through and the saving chip —
  `CtaFigures` in `components/intake/SummaryRail.tsx`, the same `bundleTotal` as the rail. Nothing chosen → "Today"
  only.
- Emails: the three bundle lines are unchanged in shape; the percent is the effective one.
- Untouched: option prices, the submission flow, the payload, the consents.
