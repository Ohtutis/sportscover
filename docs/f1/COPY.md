# F1 COPY PACK — gamedayedition.com (2026-09-06)

Final English site copy for every F1 page of `docs/SITE-BUILD-SPEC-2026-09.md` (§4.1–4.3, §4.7–4.13,
§4.21), ready to paste. Builders: paste from here, do not re-improvise. Where a sentence is marked
**CANON** it must be byte-identical everywhere it appears (site, Etsy, emails, certificate).

Sources: the spec (§2, §3, §4, §5.6, §6, §7, §8, §11), `content/blocks/*.md`,
`etsy/SEO/LISTING-COPY-PACK.md`, `docs/ETSY-COPY.md`, `docs/SUPPLIERS.md`, `art-pipeline/intake.ts`,
`art-pipeline/README.md` §20/§29, `lib/catalog/{delivery,tiers,prices,sports,styles}.ts`,
`app/site-config.ts`, `docs/SITE-F0-HANDOFF.md`, the live `app/privacy`, `app/privacy/biometric`,
`app/terms` pages.

---

## 0. HOUSE RULES FOR THIS PACK

### 0.1 Voice and type
- Voice is **"we"** everywhere. The founder note (`/`, `/about`, `/guarantee` signature) is first person and signed **John Birch**.
- **H1 / H2:** Anton, UPPERCASE, ends with a period, ≤2 lines. One H1 per page.
- **Subhead:** Space Grotesk Bold (~2:1 to the H1). Body Space Grotesk 400/500. Barlow SemiBold only for form labels, table headers, ID/time lines.
- **Pills:** Anton, UPPERCASE, no period.
- US spelling throughout (`color`, `colors`, `finalized`). The spec's "colours" is rendered `colors` on the site.
- Never an emoji. Never "youth". Never "instant/instantly". Never a jersey number for cheerleading, gymnastics, swimming, tennis or golf — in copy, alt text or example data.

### 0.2 Tokens (never type a number the catalog owns)
| Token | Renders from |
|---|---|
| `{price:SKU}` | `formatUsd(sitePrice(getTier(SKU)))` — current site price |
| `{compareAt:SKU}` | `siteBase(tier)` struck through **only while `isSaleActive()`** |
| `{from:cards|posters|set}` | `formatUsd(fromPrice(family))` |
| `{from:digital}` | min `sitePrice` over enabled tiers with `physical:false` (today: `GDE-ANY-CARD-DIG`) |
| `{perCard}` | **new helper in `lib/catalog/prices.ts`**: `perCardAnchor(now) = ceilToHalf(sitePrice(GDE-ANY-CARD-P12, now) / 12)` rendered as `less than {perCard} per card` (D23: today `less than $4.50 per card`; after the sale lapses the helper moves it — never hand-typed) |
| `{chips:standard}` / `{chips:seniorNight}` | `CHIPS.standard` / `CHIPS.seniorNight` verbatim from `lib/catalog/delivery.ts` |
| `{chip:digital}` / `{chip:prints}` / `{chip:pack}` | the matching ` · `-separated segment of `CHIPS.standard` (+ pack from `LEAD_TIMES.sealedPackWeeks`), never re-typed |
| `{shippingSentence}` | `SHIPPING_SENTENCE` |
| `{stagedSentence}` | `STAGED_DELIVERY_SENTENCE` |
| `{block:name}` | `block("name")` from `content/blocks/` |
| `{saleEnds}` | `SALE_EXPIRES_AT` as `Sep 24, 2026` |
| `{imprint}` | `IMPRINT` (see §1.2 fallback) |
| `{email}` | `SUPPORT_EMAIL` = hello@gamedayedition.com |
| `{date:…}` | computed US Eastern business-day dates from `lib/capacity.ts` / `delivery.ts` |

Dollar amounts appear in this document only inside tokens or in the D23 note above; a `$<digits>` literal in JSX outside `lib/catalog/prices.ts` fails the build.

### 0.3 CANON strings (identical everywhere; IDs referenced below)
- **C1 · OUR PROMISE** — `{block:our-promise}`: "You approve a proof before anything is finalized. If we cannot reach a result you are happy with, we refund every cent you spent. On shipped packages: if anything about the print isn't right when it arrives, we reprint it free or refund you in full — you keep the cards."
- **C2 · HOW IT'S MADE** — `{block:how-its-made}`: "Every piece is designed by me from the photos you send. AI imaging tools are part of my creative process, and every composition, likeness, spelling, color and detail is reviewed and finished by hand before delivery. Nothing is released as final until you approve the proof." *(Still "me" — D24 unifies to "we" on both channels at the next Etsy description edit; until then the block stays verbatim so the two channels never diverge.)*
- **C3 · PHOTO PRIVACY** — `{block:photo-privacy}`: "Your athlete's photos are used only to complete your order. They are not posted, shared or used to promote Game Day Edition without separate permission."
- **C4 · INDEPENDENT STUDIO** — `{block:independent-studio}`: "Game Day Edition is an independent custom design studio. We are not affiliated with any professional league, team, school or trading-card company, and we do not reproduce protected professional league or governing-body marks."
- **C5 · PHOTOS THAT WORK BEST** — `{block:photos-that-work-best}`: "Send 4–10 photos with a clear view of the athlete's face and body. Different angles are better than many similar photos. Game photos, portraits and uniform photos all help."
- **C6 · LOGO SENTENCE** — `{block:logo-sentence}`: "We never reproduce league or governing-body marks (NFL, FIFA, NCAA, Olympic). Your school or club's own crest — yes, exactly as you send it."
- **C7 · THE PACK LINE**: "18 cards — 4 holographic chase, 14 standard". Never a plus sign, never a different count.
- **C8 · THE REGISTERED-ID LINE**: "Every card carries its registered card ID on the back." (S10: never "numbered".)
- **C9 · THE NUMBERLESS LINE**: "Cheerleading, gymnastics, swimming, tennis and golf don't wear numbers — their card carries their name and club crest instead. Wrestling, track & field, pickleball and skateboarding get a plain back."
- **C10 · THE DELIVERY CLOCKS** (see §5): "Digital files within 1–2 business days of your order; printed items ship within 5–7 business days of your order. Both clocks start on the day you order — printing begins the moment you approve the proof, so a proof left waiting moves the ship date by the same amount."
- **C11 · SHIPPING**: `{shippingSentence}` = "Printed and shipped free in the US. Physical and digital orders: US only for now."
- **C12 · STAGED DELIVERY**: `{stagedSentence}` = "Digital files arrive first. Printed items ship after you approve the proof and may arrive in separate packages."
- **C13 · FICTIONAL LABEL** (`<FictionalLabel>`, not disableable): "Example — fictional athlete · photo and artwork generated"
- **C14 · TRUST LINE** (`<TrustLine>`, under every CTA/upload): "Never posted without your OK · Deleted after delivery, on a schedule you can see · Parent/guardian consent required" — the fourth segment "Never used for AI training" is prepended **only** when `lib/catalog/trust.ts` `vertexNoTrainingVerified === true`.
- **C15 · AI ACT LINE** (D17; `/c` edition panel, certificate, files README): "Artwork generated with AI tools from the athlete's photos and finished by a person."
- **C16 · WE ARE NEW (short)**: "Opened August 2026. One designer, three professional labs, every athlete built one at a time. That's why the guarantee reads the way it does." *(The spec's draft said "a weekly order cap"; D5 turned the cap off, so the cap is not mentioned anywhere on the site.)*
- **C17 · THE SENIOR DATE LINE**: "Ordering for a senior night date? Add the date — we schedule proofs against real deadlines."
- **C18 · EXAMPLE GALLERY CAPTION**: "Every example on this site is a fictional athlete from our own roster — we never show a customer's child without written permission."
- **C19 · PARTNER NAMES** (exactly as declared to Etsy as Production Partners, `docs/SUPPLIERS.md`): "Professional photo print lab, Santa Cruz CA" · "Print-on-demand poster printing partner, Charlotte NC" · "Trading card pack printing partner, Hong Kong". No banner line on the site.
- **C20 · PROOF CHECKLIST**: "Approving your proof means you checked the name, number, spelling and colors."

### 0.4 The ban list (reference only — this table is the ONLY place these strings may appear; never paste it)
Cover Moment · instant / instantly · 25 cards · "18 + 4" · rounded corners · free shipping worldwide · Topps / Panini / Upper Deck · graded slab · AI generator · Neon Future · Vintage (any form) · PDF (write "PNG only, by design" — never name the other format) · Stripe payment link · 16 pt · semi-gloss · cheaper · Same price on Etsy · "Verified" as a badge or before edition/card/athlete/purchase/buyer/customer · any "customer/real/verified/5-star reviews", star counts or x/5 · "10 cards" / "22 cards" · youth · a number for the five numberless sports · Etsy prices or coupons anywhere on the site.

### 0.5 Alt-text patterns
- Card front: `Custom {sport} trading card front — {Finish} finish — example artwork, fictional athlete`
- Card back: `Custom {sport} trading card back with season stats, registered card ID and QR code — {Finish} finish — example artwork, fictional athlete`
- Poster: `Custom {sport} poster, 18 × 24 in — {Finish} finish — example artwork, fictional athlete`
- Room shot: `Custom {sport} poster hung on a bedroom wall — {Finish} finish — example artwork, fictional athlete`
- Before photo (generated): `Phone photo of a fictional {sport} player — the starting point; photo generated`
- Proof: `Watermarked proof of a custom {sport} card — {Finish} finish — example, fictional athlete`
- Certificate: `Printed Certificate of Authenticity for a Game Day Edition card — example, fictional athlete` (count-neutral art only)
- Process artefacts: `Photo-check verdict as the parent reads it — example order`, `Reference plate: three views of a fictional athlete built from their photos`, `Frame beside its reference plate — verification sheet, fictional athlete`
- Founder: `John Birch, designer and founder of Game Day Edition` (real photo only; if `public/brand/founder.jpg` is absent, render no image and no alt)
- Brand: `Game Day Edition shield` / `Game Day Edition wordmark`
- Never a jersey number in alt text for cheerleading, gymnastics, swimming, tennis, golf. Real customers' editions never appear without written consent; when they do (F3+), alt = `Customer edition · shared with permission · {sport}`.

---

## 1. GLOBAL CHROME

### 1.1 Header
Logo: shield + wordmark files (`public/brand/`), link → `/`, `aria-label="Game Day Edition — home"`.
Nav (desktop, left→right): **Trading Cards** `/trading-cards` · **Posters** `/posters` · **Complete Set** `/complete-set` · **Senior Night** `/senior-night` · **How it's made** `/how-it-works` · **Guarantee** `/guarantee` · **About** `/about`
Right: outline **Look up a card** `/registry` · primary **Order on Etsy →** `/go/etsy/GDE-ANY-SET` *(F1)* → becomes **Start an order** `/order/new` with outline **Also on Etsy →** `/go/etsy/GDE-ANY-SET` *(F2)*.
Mobile menu adds: Photo guide `/photo-guide` · Registry `/registry` · FAQ `/faq` · Contact `/contact` · Etsy shop `/etsy`.
Skip link: "Skip to content".

### 1.2 Footer (every page; navy band, silver shield)
**Column · Shop:** Trading Cards · Posters · Complete Set · Senior Night · Teams & clubs (F1: `mailto:{email}?subject=Team%20order` · F2: `/teams`) · Etsy shop (`/etsy`)
**Column · Trust:** Our promise (`/guarantee`) · How it's made (`/how-it-works`) · Photo guide (`/photo-guide`) · Look up a card (`/registry`) · FAQ (`/faq`) · Contact (`/contact`)
**Column · Legal:** Privacy (`/privacy`) · Biometric policy (`/privacy/biometric`) · Terms (`/terms`) · Accessibility (`/accessibility`)

**Imprint block (renders when `imprintComplete()`):**
> {legalName} · Company code {companyCode}{, VAT {vat}} · {address} · Responsible person: John Birch · {email}

**Imprint fallback (until the owner supplies #6):**
> Game Day Edition is an independent custom design studio operated from Lithuania. {email}

Never a "TEMPLATE" label, never "details coming". The same fallback rule applies on `/terms` "Who we are" and `/about` §5.

**True-numbers strip** (from `TRUE_COUNTS`, each linked): 17 sports → `/trading-cards#sports` · 7 styles — 6 finishes + Senior Night → `/trading-cards#finishes` · Square-cut, UV-coated 2.5 × 3.5 in cards → `/trading-cards#spec` · Free printed Certificate of Authenticity with every shipped package → `/guarantee` · A registered card ID on every card → `/registry`

**C4** (Independent studio) as a full-width line.
**Social row:** Etsy · Instagram · TikTok · YouTube · Facebook · Pinterest — only handles present in `SOCIAL_URLS`; never the personal Reddit account. Each link `aria-label="Game Day Edition on {platform}"`.
**Bottom line:** "© 2026 Game Day Edition · Designed in Lithuania · Printed by professional labs in the US"

### 1.3 Shared components — copy

**Pills** (Anton): `FROM YOUR PHOTOS` (orange) · `REGISTERED EDITION` (outline) · `YOU SEE IT FIRST` · `FRONT + BACK` · `SQUARE-CUT · UV-COATED` · `SENIOR EDITION · 1 OF 1` · `FEATURED` (on `featured: true` tiers — never "best seller"/"most popular", which are claims) · `HIDDEN UNTIL READY` (internal only, never rendered).

**DeliveryChips:** `{chips:standard}` = `DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7` · `{chips:seniorNight}` = `FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS · SEALED PACK 3–4 WKS`. One delivery claim per page.

**TrustLine:** C14.

**FourFears — long (4 cards; whole card is the link; 1.5 px SVG icons, no emoji):**
1. **Will it look like my kid?** — We build a reference of your athlete from your photos before a single shot is made, and check every shot against it. If it doesn't look like them, it doesn't ship. → *How likeness is checked* `/how-it-works#likeness`
2. **Who is asking for my child's photos?** — An independent studio in Lithuania, printed by professional labs in the US. The legal entity and address are in the footer of every page. → *Who we are* `/about`
3. **What if it's wrong?** — You approve a proof before anything is finalized. If we cannot reach a result you are happy with, we refund every cent you spent. → *Read the promise* `/guarantee`
4. **Is this a real card or a photo print?** — A square-cut, UV-coated 2.5 × 3.5 in trading card, front and back, with its registered card ID and QR code on the back. → *See the spec sheet* `/trading-cards#spec`

**FourFears — short strip ("Still deciding?", beside every product CTA):**
> **Still deciding?** Looks like them or it doesn't ship · You approve a proof first · Refund every cent if we can't get there · Real square-cut card, registered ID on the back
Each fragment links to the same targets as above.

**FictionalLabel:** C13 — in the frame or directly under it; covers generated "before" photos too.

**CapacityNote:** hidden (D5, `weeklyCap = null`). If ever enabled: "Next available start: {date} · files by {date} · prints ship by {date}".

**We are new — long** (`/guarantee`, beside checkout):
> **We are new — what that means for you.** Game Day Edition opened in August 2026. We are one designer and three professional labs, and every athlete is built one at a time. That is why the guarantee is written the way it is: the risk of trying us is ours, not yours. {deliveredCount — rendered only when ≥5 real delivered orders: "So far: {n} editions delivered."}
> — John Birch

**We are new — short:** C16.

**Example gallery caption:** C18.

**CTA labels:** F1 primary `Order on Etsy →` (via `/go/etsy/<sku>`); F2 primary `Start an order` / `Choose this package` / `Start their senior edition` / `Order for your athlete`; F2 secondary outline `Also on Etsy →` (never orange, never with a price); registry `Look up a card` / `Find this edition`; process `See how it's made`; guarantee `Read the promise`.

**Miss / error strings:** registry miss — "No card is registered under that ID. Check the back of the card — mind O versus 0 and I versus 1." · private — "This card is registered with Game Day Edition." · rate-limited — "Too many lookups in a row. Try again in a minute." · generic error — "Something went wrong on our side. Nothing was lost — try again, or email {email}."

---

## 2. PAGES

### 2.1 `/` — brand home (light stock; 13 sections)

**1) Hero**
- H1: **THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.**
- Subhead: **Custom sports trading cards and posters from your photos. One registered edition per athlete.**
- Left: one large "before" phone photo (fictional roster athlete; C13 in frame). Alt: `Phone photo of a fictional football player on the sideline — the starting point; photo generated`.
- Orange arrow → right: card front + back + poster + certificate composite (count-neutral; no pack face until D18). Alt: `The finished edition: custom football trading card front and back, 18 × 24 poster and certificate — Fire & Smoke finish — example artwork, fictional athlete`.
- Pills: `FROM YOUR PHOTOS` (orange) · `REGISTERED EDITION` (outline)
- Price line: **from {from:digital} digital · {price:GDE-ANY-SET-PRINT} printed set**
- `{chips:standard}`
- CTA primary (F1): **Order on Etsy →** `/go/etsy/GDE-ANY-SET` · (F2): **Start an order** `/order/new`. Secondary outline: **Look up a card** `/registry`.
- TrustLine C14.
- No video above the fold; no sport tabs.

**2) Four fears, answered**
- H2: **FOUR THINGS EVERY PARENT ASKS FIRST.**
- Subhead: **Each one is a single click from the proof.**
- FourFears long (§1.3).

**3) Three product families**
- H2: **CHOOSE THEIR EDITION.**
- Subhead: **Three ways to keep the season. Every one starts from the same 4–10 photos and ends with a proof you approve.**
- TierCard · **Trading Cards** — from {from:cards} — image: front + back tile — three truths: "Front and back, composed from four shots of your athlete" · "Registered card ID and QR code on the back — the card's own page" · "Certificate of Authenticity and flip video included" — `{chips:standard}` — CTA **See trading cards** `/trading-cards`
- TierCard · **Posters** — from {from:posters} — image: `room-SN.png` (alt per §0.5) — truths: "Two print sizes in every order — 18 × 24 and 24 × 36 in, 300 DPI" · "Phone and desktop wallpapers with safe zones" · "Printed matte poster, shipped free in the US" — CTA **See posters** `/posters`
- TierCard · **Complete Set** — from {from:set} — image: `v3/tile-printed.jpg` — truths: "Poster plus card front and back, certificate and flip video" · "Wallpapers and the card's own registered page" · "Every digital file included with printed sets" — CTA **See the complete set** `/complete-set`
- Once, under the row: **Free printed Certificate of Authenticity in every shipped package.**

**4) Proof before print (dark artwork band)**
- Pill: `YOU SEE IT FIRST`
- H2: **NOTHING PRINTS UNTIL YOU SAY SO.**
- Left: watermarked proof in `BracketFrame` (`etsy/listing-images/03-senior-night/src/bsb-sr-proof.png`). Caption: "A watermarked proof, exactly as you receive it — Senior Night edition, baseball." + C13.
- Right: **Our promise** — C1 verbatim.
- Links: **Read the full promise** `/guarantee` · **See how it's made** `/how-it-works`

**5) Registered, not just printed**
- H2: **REGISTERED, NOT JUST PRINTED.**
- Body: **Every card carries its registered card ID on the back. Scan it — the card's own page opens with the edition, the stats and the season. Registered pages stay up for at least five years.**
- Left: card back with the orange ring around the QR (crop of slide 02). Alt: `Back of a custom basketball trading card with the QR code ringed — Stadium Night finish — example artwork, fictional athlete`.
- Arrow → live `EditionPanel` for `GDE-SN-BKB-2026-12`, labelled **Example edition · Fictional athlete**: `REGISTERED EDITION` · EDITION ID **GDE-SN-BKB-2026-12** · FINISH Stadium Night · SPORT Basketball · SEASON 2026 · REGISTERED Aug 27, 2026.
- Inline lookup: label **Card ID** · placeholder `GDE-SN-BKB-2026-12` · help "Printed on the back of every card and on the certificate" · button **Find this edition** → POST `/registry` → 302 `/c/<id>`; miss → §1.3 miss string inline.
- Link: **What is a registered edition?** `/registry`

**6) Six finishes, one athlete**
- H2: **SIX FINISHES. ONE ATHLETE.**
- Subhead: **Same athlete, same photos. The finish changes the material, not the layout.**
- Horizontal snap row, same fictional basketball athlete (`etsy/listing-images/01-basketball-card/src/BK-{SN,CA,FS,HE,SS,PR}-front.png`), finish name as pre-exported SVG label, material line from `styles.ts`:
  - Stadium Night — Soft silver foil, floodlit arena atmosphere.
  - Chrome All-Star — High-contrast chrome, clean studio light.
  - Fire & Smoke — Ember glow, drifting smoke, high energy.
  - Heritage — Classic card character with a warm plate.
  - Signature Spotlight — Clean spotlight and a signature line.
  - Prism Rush — Prismatic light and split-type energy.
  - 7th tile (gold): **Senior Night edition** — Gold senior edition — class year, four-year career line, senior quote. → `/senior-night`
- Tile link: F1 → `/trading-cards#finishes`; F3 → `/styles/<slug>`. C13 once on the row.

**7) Seventeen sports**
- H2: **SEVENTEEN SPORTS. THEIR NAME, THEIR CLUB CREST.**
- Subhead: **Numbered sports carry their number. C9**
- 17 tiles (card fronts from `marketing/cards/<slug>-front.png`; pickleball and skateboarding text-only until exported): Basketball · Football · Baseball · Softball · Soccer · Ice Hockey · Volleyball · Lacrosse · Wrestling *(plain back)* · Cheerleading *(name + crest)* · Gymnastics *(name + crest)* · Track & Field *(plain back)* · Swimming *(name + crest)* · Tennis *(name + crest)* · Golf *(name + crest)* · Pickleball *(plain back)* · Skateboarding *(plain back)*
- Tile link: F1 → `/trading-cards?sport=<slug>`; F3 → `/sports/<slug>` for the 8 live sports, `/order/new?sport=<slug>` for the rest.
- Alt per §0.5 (no number in alt for the five numberless sports).

**8) How it's made — in plain words**
- H2: **MADE BY A PERSON. AI IS IN THE TOOLBOX.**
- One sentence: **We check your photos, build a reference of your athlete, make four shots, check every one against it, and you approve the proof before anything prints.**
- Then C2 verbatim.
- Three thumbnails (fictional, audited; C13 under each): "Photo check — the verdict, as the parent reads it" · "Reference plate — approved and locked before a single pose" · "Watermarked proof — what you approve".
- CTA: **See the full process** `/how-it-works`

**9) Your athlete's photos**
- H2: **YOUR ATHLETE'S PHOTOS STAY YOURS.**
- Body: C3 verbatim. Then: **We ask for 4–10 photos and nothing else. No date of birth, no home address, no school name.**
- TrustLine C14.
- Links: **Who processes the photos** `/privacy#subprocessors` · **The likeness check, in writing** `/privacy/biometric`

**10) Proof wall (honest social proof)**
- H2: **WHAT TO JUDGE US ON, DAY ONE.**
- Left · **Example editions** — 8 card fronts from `marketing/cards/` (basketball, football, baseball, softball, soccer, volleyball, cheerleading, wrestling), C18 under the grid, C13 in frame. Link **All seventeen sports** → `/trading-cards#sports` (F3: `/sports`).
- Centre · **One rejected take, one approved** (a real rejection from the ice-hockey pilot, `art-pipeline/README.md` §20):
  - Left frame, chip FAIL: **REJECTED — the kit changed between shots.** "Solid navy with a red hem in one frame, red shoulders and sleeves in the next. All three front shots sit in one composite, so this one never ships."
  - Right frame, chip PASS: **APPROVED — same athlete, same kit in every shot.**
  - C13 under the pair. Link **See all six gates** → `/how-it-works#gates`
- Right · **We are new** — C16 → `/guarantee`
- **Reviews block: not rendered** while `content/reviews/*.json` with `consentToPublish` is empty. No stars, no "coming soon", no placeholder.

**11) Founder note**
- H2: **A NOTE FROM THE DESIGNER.**
- Body (Space Grotesk italic, first person):
  > Game Day Edition started with a simple observation: kids who love their sport end up with hundreds of photos on a phone and nothing on their wall.
  > I put everything I know — design and the AI process behind it — into one thing: making a kid look and feel the way they would after a professional photoshoot, on their own card and poster. A gift nobody else has.
- Signature: **John Birch** · Game Day Edition · {city — owner to supply; omit the segment until then}
- Under: **Designed in Lithuania · Printed by professional labs in the US · Independent — not affiliated with any league, team, school or trading-card company**
- Photo: `public/brand/founder.jpg` (real; never generated). Absent → no image.
- Link: **About the studio** `/about`

**12) Occasions + closing CTA**
- H2: **ONE ATHLETE. ONE EDITION.**
- Card · **Senior Night** (gold inside the media): **ONE LAST HOME GAME.** — "A gold senior edition: class year, four-year career line, senior quote." — `{chips:seniorNight}` — **Plan their senior edition** `/senior-night`
- Card · **Christmas** (rendered by server date Oct 20 → Jan 5): **UNDER THE TREE, NOT ON A PHONE.** — "Order by {date:printedByDec24} for printed sets under the tree; digital files by {date:digitalByDec24}." — **See Christmas timing** `/christmas-gift` (F2; F1 → `/complete-set`)
- Card · **End of season / team gift**: **ONE TEAM SETUP. EVERY FAMILY ORDERS THEIR OWN.** — "You choose the finish, send the crest and colors once, set a deadline. Every card is built and proofed individually." — F1 **Email us about a team** `mailto:{email}?subject=Team%20order` · F2 **Teams & clubs** `/teams`
- Closing CTA pair: F1 **Order on Etsy →** `/go/etsy/GDE-ANY-SET` + outline **Look up a card** `/registry`; F2 **Start an order** + **Also on Etsy →**. `{chips:standard}`. TrustLine C14.

**13) Footer** — §1.2.

### 2.2 `/trading-cards` — product family (light; shared template with 2.3/2.4)

**1) Hero + tiers**
- H1: **CUSTOM TRADING CARDS FROM YOUR PHOTOS.**
- Subhead: **Not a template with a photo dropped in — composed around your athlete: their photos, their kit, their colors, their season. Front and back, with a registered card ID on the back.**
- Pills: `FRONT + BACK` · `REGISTERED EDITION` · `SQUARE-CUT · UV-COATED`
- Media: `02-front-back-registered.png` crop (front + back large) + flip component (5.0 s, square corners; poster frame = front; "Tap to flip"; MP4 fallback `card-flip/out/`). Alt per §0.5. C13.
- Sport picker: label **Their sport** (17, default Basketball; `?sport=` prefills). Under it, for a numberless pick: "No jersey number in {sport} — the card carries their name and club crest instead."
- Anchor line (D23): **Twelve printed cards for {price:GDE-ANY-CARD-P12} — {perCard}.** *(No second "most shops charge…" line: a hand-typed dollar range is not allowed in JSX and the market figure has no catalog source — dropped.)*
- `{chips:standard}` · C11.

**TierCards ×4** (names = Etsy variant names ≤20 chars from `prices.ts`; prices via tokens; `compareAt` struck through only while the sale runs, with the small line "Sale price until {saleEnds}"):

| Tier (name) | Price | What's in the box | Ships from | Chip |
|---|---|---|---|---|
| **Digital Card Files** | {price:GDE-ANY-CARD-DIG} / {compareAt} | Custom trading card — FRONT · Custom trading card — BACK · Certificate of Authenticity · Card flip video · Live registry page linked from the QR code on the card · High-resolution digital files ready for printing | Delivered on your order page — **PNG at 300 dpi, by design** | `{chip:digital}` |
| **12 Printed Cards** `FEATURED` | {price:GDE-ANY-CARD-P12} / {compareAt} | 12 printed cards — square-cut, UV-coated, 2.5 × 3.5 in · Free printed Certificate of Authenticity · Every digital file above · Printed and shipped free in the US | Professional photo print lab, Santa Cruz CA · tracked (per lab) | `{chip:prints}` |
| **24 Printed Cards** | {price:GDE-ANY-CARD-P24} / {compareAt} | 24 printed cards — square-cut, UV-coated, 2.5 × 3.5 in · Free printed Certificate of Authenticity · Every digital file above · Printed and shipped free in the US | Professional photo print lab, Santa Cruz CA · tracked (per lab) | `{chip:prints}` |
| **Sealed Foil Pack** *(hidden until D18: `enabled:false`)* | {price:GDE-ANY-CARD-PACK} | Sealed pack: 18 cards — 4 holographic chase, 14 standard · Every digital file above · Ships separately | Trading card pack printing partner, Hong Kong · tracked (per lab) · duties line after the QPMN answer | `{chip:pack}` |

- Per-tier CTA: F1 **Order on Etsy →** `/go/etsy/GDE-{SPORT}-CARD-{TIER}`; F2 **Choose this package** `/order/new?family=cards&tier={TIER}&sport={slug}` + outline **Also on Etsy →** (no price).
- Once under the row: **Free printed Certificate of Authenticity in every shipped package.**
- Product + Offer JSON-LD: site offer only (`offers.url` = this page, `priceValidUntil` = `SALE_EXPIRES_AT` + 1 day, US free shipping, return policy → `/guarantee`).

**2) Spec sheet** — H2: **THE SPEC SHEET.** Subhead: **A table instead of adjectives.** `id="spec"`

| Row | Value |
|---|---|
| Size | 2.5 × 3.5 in (63.5 × 89 mm) |
| Corners | Square-cut |
| Finish | UV-coated |
| Stock | Professional photo card stock |
| Print | 300 dpi from 816 × 1110 px files with bleed |
| Front | Four shots of your athlete, name, position, team, season, finish |
| Back | Season stats (up to three), highlight line, athlete signature line, registered card ID, QR code |
| Loose sets | 12 or 24 cards — printed in California, shipped free in the US |
| Sealed pack *(row hidden until D18)* | 18 cards — 4 holographic chase, 14 standard — printed in Hong Kong, ships separately, {LEAD_TIMES.sealedPackWeeks} weeks |
| Digital files | PNG at 300 dpi: front, back, certificate, flip video (MP4 ×2) and GIF |
| Registry | One registered edition per athlete, per finish, per season; page kept online at least five years |

**3) Front + back, registered** — H2: **FRONT + BACK. REGISTERED.**
- Body: **Four shots of your athlete, composed on one card. The back carries the season stats, the highlight line, the athlete signature line, the registered card ID and its QR code. C8 Physical cards are not individually numbered — every card of an edition carries the same registered ID; the sealed pack is 18 cards — 4 holographic chase, 14 standard.**
- Media: `06-four-shots.png` (numbered callouts 1–4) + QR ring crop + live `EditionPanel` demo (`GDE-SN-BKB-2026-12`, label "Example edition · Fictional athlete").
- Link: **What is a registered edition?** `/registry`

**4) One athlete, six finishes** — H2: **ONE ATHLETE. SIX FINISHES.** `id="finishes"` Subhead: **The finish speaks through material — foil, chrome, ember, plate, spotlight, prism — never through a different layout.** Media: `08-six-finishes.png` + C13. Tiles → F3 `/styles/<slug>`. Line: **Ordering for senior night? The Senior Night edition replaces the finish picker with class year, career line and senior quote.** → `/senior-night`

**5) Sports without numbers** — H2: **NO NUMBER? NO PROBLEM.** Body: C9. Media: cheerleading card front + back (`marketing/cards/cheerleading-*.png`; alt without a number). Note under: "At checkout the number field disappears for these sports." `id="sports"` anchor also lives here with the 17-sport list (same tiles as home §7).

**6) Still deciding?** — FourFears short strip.

**7) Mandatory blocks + FAQ + CTA**
- **Our promise** — C1 · **How it's made** — C2 · **Photo privacy** — C3 · **Independent studio** — C4 (+ C6 as the second sentence of the crest answer below).
- FAQ (6 visible; FAQPage schema on these only):
  1. **How many photos should I send?** — C5
  2. **My athlete's sport has no jersey number.** — C9
  3. **Are the corners rounded?** — No. The cards are square-cut, the way a card comes out of a pack, UV-coated, 2.5 × 3.5 in, printed by a professional photo lab in the US.
  4. **What does "registered" mean?** — Every card carries its own registered card ID and a QR code. Scanning it opens the card's page here — the edition, the stats and the season. "Registered" is our own edition registry, not a copyright registration; customer pages are unlisted unless you choose to make them public.
  5. **Should I order here or on Etsy?** — Both are the same edition, built and proofed the same way, delivered on the same order page. Etsy orders are placed and refunded on Etsy; orders placed here are handled here. *(F1 variant, while the site does not sell: "Orders are placed on our Etsy shop. Every card is built and proofed the same way, and your files and your card's page are delivered here.")*
  6. **What if I'm not happy?** — C1. Full ladder on the guarantee page.
- CTA pair + `{chips:standard}` + TrustLine C14.

### 2.3 `/posters` — product family

**1) Hero + tiers**
- H1: **CUSTOM SPORTS POSTERS FROM YOUR PHOTOS.**
- Subhead: **Not a template with a photo dropped in — composed around your athlete. The poster is art for the wall; the stats live on the card.**
- Pills: `FROM YOUR PHOTOS` · `TWO PRINT SIZES` · `300 DPI`
- Media: room shot (`art-pipeline/out/etsy-shots/packages/p-room-SN.png` family) + to-scale sheet. Alt per §0.5. C13.
- Sport picker: label **Their sport** — only sports with poster art (today: basketball, football, baseball, softball, soccer, volleyball, cheerleading, wrestling — `sports.ts` needs a `hasPosterArt` flag; see §7 open questions). Under it: "Another sport? Order the card family or email us — every sport gets a poster on request." *(Only if the owner confirms; otherwise omit.)*
- `{chips:standard}` · C11.

| Tier (name) | Price | What's in the box | Ships from | Chip |
|---|---|---|---|---|
| **Digital Poster Files** | {price:GDE-ANY-POST-DIG} / {compareAt} | Custom poster in TWO print sizes — 18 x 24 in and 24 x 36 in, 300 DPI · Phone and desktop wallpapers with safe zones · High-resolution digital files ready for printing | Delivered on your order page — PNG at 300 dpi, by design | `{chip:digital}` |
| **18×24 Printed Poster** `FEATURED` | {price:GDE-ANY-POST-P1824} / {compareAt} | 18 × 24 in matte poster, 189 g/m² · Free printed Certificate of Authenticity · Every digital file above · Printed and shipped free in the US | Print-on-demand poster printing partner, Charlotte NC · poster and certificate in one shipment, in a tube, tracked (per lab) | `{chip:prints}` |
| **24×36 Printed Poster** | {price:GDE-ANY-POST-P2436} / {compareAt} | 24 × 36 in matte poster, 189 g/m² · Free printed Certificate of Authenticity · Every digital file above · Printed and shipped free in the US | Print-on-demand poster printing partner, Charlotte NC · poster and certificate in one shipment, in a tube, tracked (per lab) | `{chip:prints}` |
| **30×40 XL Poster** *(hidden: `enabled:false`)* | {price:GDE-ANY-POST-P3040} | 30 × 40 in matte poster — printed package only; digital orders receive the two sizes above · Free printed Certificate of Authenticity | Charlotte NC | `{chip:prints}` |

- CTA per tier: F1 **Order on Etsy →** `/go/etsy/GDE-{SPORT}-POST-{TIER}`; F2 **Choose this package** `/order/new?family=posters&tier=…` + **Also on Etsy →**.
- Once under the row (the shared-template line, same as 2.2 and 2.4): **Free printed Certificate of Authenticity in every shipped package.**
- *Builder note (2026-09-06 correction).* An earlier draft of this section rendered a line here denying the certificate for poster-only packages, instead of the shared once-line. That was wrong: it came from the 2026-08-25 **digital**-listing decision in `etsy/LISTING-STATE.md` ("certificate ships with the card listing and the complete set, not the poster listing"), which predates the physical poster tiers. The current canon is the owner's 2026-09-01 decision in `docs/ETSY-LISTINGS.md` (poster menu row B "18×24 Printed + FREE Certificate (A4 in the same shipment)", V2.5 "18×24 / 24×36 Printed Poster + FREE Certificate", V3.2 "the certificate is still put into every shipment"), and every live poster listing already promises it: `etsy/SEO/ready/v3-posters/*-poster.md` line 41 — "EVERY SHIPPED PACKAGE INCLUDES a printed Certificate of Authenticity … free of charge" — with the poster proof slide 17 showing poster + certificate + wallpaper. Spec §8 forbids the site contradicting the listing it links to, and the footer strip (§1.2 `TRUE_COUNTS`), `/faq` #2 (§2.11), the `/c` edition panel (§2.15 §3) and `/registry` (§2.10) all say "every shipped package" — so the poster page says it too. What stays true and unchanged: the **Digital Poster Files** tier carries no certificate file (`deliverables.posters` in `lib/catalog/tiers.ts` matches the listing's WHAT YOU GET list and is not edited); the certificate is a **shipped-package** promise only. **Code change for the builder** (this pack is copy; the catalog is the source the TierCard reads): in `lib/catalog/tiers.ts` `tierNotes`, insert `"Free printed Certificate of Authenticity"` as the second entry of `GDE-ANY-POST-P1824` and `GDE-ANY-POST-P2436` (and of `GDE-ANY-POST-P3040` when that SKU gains a note), between the paper line and "Printed and shipped free in the US" — the same position the card tiers use. Owner confirmation of the mechanics (the A4 certificate printed and packed by the Charlotte partner in the same tube) is §6 #14; if it turns out NOT to ship, §6 #14 says what changes, and the Etsy listing changes first.

**2) Spec sheet** — H2: **THE SPEC SHEET.** `id="spec"`

| Row | Value |
|---|---|
| Paper | Matte, 189 g/m² |
| Sizes | 18 × 24 in · 24 × 36 in (30 × 40 in printed-only, when available) |
| Source | Composed at 5400 × 7200 px for 18 × 24 at 300 dpi; larger sizes upscaled 4× with faces checked at 4× before print |
| Packaging | Rolled, shipped in a tube with the printed certificate (per lab) |
| Certificate | Free printed Certificate of Authenticity in every shipped package — the digital files tier has no certificate |
| Digital files | Both sizes as PNG at 300 dpi; phone (lock and home), tablet and desktop wallpapers with safe zones |
| Printed in | North Carolina — shipped free in the US |

**3) To scale** — H2: **TO SCALE. THE PERSON IS THE RULER.**
- Body: **Hung at a 58-inch center, the way galleries hang. The athlete on the sheet stands 5 ft 9 in — measure the poster against them, not against the frame.** Media: to-scale sheet (18 × 24 and 24 × 36 side by side against the figure). Alt: `To-scale sheet: 18 × 24 and 24 × 36 in posters beside a 5 ft 9 in figure`.

**4) One athlete, six finishes** — as 2.2 §4 with the poster row (`10–11-pair-*.png`).

**5) Sports without numbers** — H2: **THEIR NAME ON THE WALL.** Body: "The poster carries the athlete's name, team and season. C9 (first sentence only)."

**6) Still deciding?** — FourFears short.

**7) Blocks + FAQ (6) + CTA**
  1. **How many photos should I send?** — C5
  2. **Which size should I choose?** — 18 × 24 sits above a desk or dresser; 24 × 36 holds a wall on its own. Every order includes both sizes as files, so a printed 18 × 24 can be printed again larger later.
  3. **Can I print the files myself?** — Yes. The files are PNG at 300 dpi in both sizes, sized for any print shop. Print at 100 %, no scaling.
  4. **Are the wallpapers safe for the lock screen?** — Yes. Every wallpaper keeps the name and marks out of the clock and home-indicator strips; the art may bleed, the type may not.
  5. **Should I order here or on Etsy?** — as 2.2 #5.
  6. **What if the print arrives damaged?** — C1 (shipped-package sentence). Photograph the damage and email us with the order number; we reprint free or refund in full.
- CTA pair + chips + TrustLine.

### 2.4 `/complete-set` — product family

**1) Hero + tiers**
- H1: **THE COMPLETE EDITION: POSTER, CARDS, CERTIFICATE, REGISTRY.**
- Subhead: **Everything we make for one athlete, counted — the poster, the card front and back, the certificate, the flip video, the wallpapers and the card's own registered page.**
- Pills: `EVERYTHING COUNTED` · `REGISTERED EDITION` · `SHIPS IN STAGES`
- Media: composite from `04-complete-set/01-hero` layers or `hero05-<sport>.png` (count-neutral only). C13.
- Sport picker as 2.2.
- `{chips:standard}` · C11 · C12.

| Tier (name) | Price | What's in the box | Ships from | Chip |
|---|---|---|---|---|
| **Digital Complete Set** | {price:GDE-ANY-SET-DIG} / {compareAt} | Custom poster — 18 x 24 and 24 x 36 in, 300 DPI · Custom trading card — FRONT and BACK · Certificate of Authenticity · Card flip video · Phone and desktop wallpapers · Live registry page linked from the QR code on the card · High-resolution digital files ready for printing | Delivered on your order page — PNG at 300 dpi, by design | `{chip:digital}` |
| **Printed Set** `FEATURED` | {price:GDE-ANY-SET-PRINT} / {compareAt} | 12 printed cards + 18 × 24 poster + printed certificate · Every digital file included · Printed and shipped free in the US | Two packages: cards from the professional photo print lab, Santa Cruz CA; poster from the print-on-demand poster printing partner, Charlotte NC · tracked (per lab) | `{chip:prints}` |
| **Deluxe Set** | {price:GDE-ANY-SET-DLX} / {compareAt} | 24 printed cards + 24 × 36 poster + printed certificate · Every digital file included · Printed and shipped free in the US | Two packages (as above) | `{chip:prints}` |
| **Ultimate Set** *(hidden until D18: `enabled:false`)* | {price:GDE-ANY-SET-ULT} | Deluxe Set + sealed foil pack (18 cards — 4 holographic chase, 14 standard) · Ships in three tracked packages | Santa Cruz CA · Charlotte NC · Trading card pack printing partner, Hong Kong | `{chip:pack}` |

- CTA per tier: F1 **Order on Etsy →** `/go/etsy/GDE-ANY-SET` (the Complete Set listing); F2 **Choose this package** `/order/new?family=set&tier=…` + **Also on Etsy →**.
- Once: **Free printed Certificate of Authenticity in every shipped package.**

**2) Spec sheet** — H2: **EVERYTHING YOU GET.** Subhead: **27 files and one live page. Counted, not implied.** `id="spec"` *(27 + 1 is the audited count on listing slide 19, `etsy/LISTING-STATE.md`; the spec's "28-file set" is that same 27 + the registry page — do not write "28 files".)*

| Folder (same names as `/order/[token]/files`) | Contents |
|---|---|
| `01-print` | Card front and back (816 × 1110 px, 300 dpi, with bleed) · poster 18 × 24 and 24 × 36 · certificate |
| `02-social` | Nine social posts — square, portrait and story |
| `03-wallpapers` | Seven wallpapers with safe zones — phone lock and home, tablet, desktop |
| `04-bonus` | Sticker, number badge (numbered sports) or name badge, four transparent cutouts |
| `05-video` | Card flip — 1080 × 1350 and 1080 × 1920 MP4, 540 px GIF |
| Live page | The card's registered page, from the QR code on the back |

**3) Everything counted + staged delivery** — H2: **EVERYTHING COUNTED. DELIVERED IN STAGES.**
- Timeline: **Files** — 1–2 business days from your order → **Printed cards and poster** — ship 5–7 business days from your order, in separate packages → **Sealed pack** (Ultimate) — {LEAD_TIMES.sealedPackWeeks} weeks, separately. Under it: C10, then "Ultimate ships as three tracked packages."
- Media: `19-everything-counted.png` + `EditionPanel` demo → `/registry`.

**4) One athlete, six finishes** — as 2.2 §4.
**5) Sports without numbers** — C9 with the cheerleading set.
**6) Still deciding?** — FourFears short.
**7) Blocks + FAQ (6) + CTA**
  1. **How many photos should I send?** — C5
  2. **Do the printed pieces arrive together?** — C12 The cards come from the photo lab in California and the poster from the poster partner in North Carolina, so they usually arrive on different days. Both are tracked.
  3. **Is the digital set the same art as the printed set?** — Yes. Every printed set includes every digital file; the digital set is the same 27 files without the printing.
  4. **What does "registered" mean?** — as 2.2 #4.
  5. **Should I order here or on Etsy?** — as 2.2 #5.
  6. **What if I'm not happy?** — C1.
- CTA pair + chips + TrustLine.

### 2.5 `/senior-night` — occasion A (light; gold only inside the media)

**1) Hero**
- H1: **ONE LAST HOME GAME.**
- Subhead: **A senior edition built from your athlete's own photos — gold Senior Night finish, class year, four-year career line and their senior quote, on a card and poster that are theirs alone.**
- Pill: `SENIOR EDITION · 1 OF 1`
- `{chips:seniorNight}` (the only delivery claim on this page)
- Media: **a cluster composed in the DOM from `etsy/listing-images/03-senior-night/src/` layers — never a slide.** The spec's file `03-senior-night/01-hero.png` is banned whole (viewed 2026-09-06: its pill reads "NUMBERED + REGISTERED" — S10 — its headline "SENIOR NIGHT GIFT SET ANY SPORT" is baked into the pixels, and its cards pre-date the square-corner pass; sha256 in `scripts/denylist.json`, CONTRACTS §4.12). The athlete is **Marcus Ellison, basketball, `GDE-SR-BKB-2026-12`** — the fictional athlete the spec's hero file shows and the home `EditionPanel` demo uses. Three layers, keys per CONTRACTS §5.9:
  - `sn.hero.poster` = `src/sr-poster.png` (1296×1728) — the LCP element (`priority`). Alt: `Custom basketball poster, 18 × 24 in — Senior Night finish — example artwork, fictional athlete`.
  - `sn.hero.front` = `src/sr-card-front.png` (750×1050, square-cut). Alt: `Custom basketball trading card front — Senior Night finish — example artwork, fictional athlete`.
  - `sn.hero.back` = `src/sr-card-back.png` (750×1050). Alt (literal — the SR back has no `lib/alt.ts` pattern): `Custom basketball trading card back — career highs, class year, four-year career line, senior quote, registered card ID and QR code — Senior Night finish — example artwork, fictional athlete`.
  - Nothing else in the cluster: no badge or sticker (the only SR badges on disk are per-sport — `bsb-sr-badge.png` is the baseball "7 · CLASS OF 2026" disc, wrong sport and wrong number beside Marcus #12; no basketball SR badge exists), no certificate (`sr-certificate.png` is still VERIFY, ASSETS §2.1), no pack, no phone (SR wallpaper safe zones unverified).
  - Every word inside the media is HTML, never pixels: `Pill tone="accent"` **FROM YOUR PHOTOS** and `Pill tone="gold"` **SENIOR EDITION · 1 OF 1** on an arena `Plate` in the cluster (gold is a media-only tone — the page pill above stays `outline`). No arrow, no headline, no counter, no delivery, shipping or price text in the media; `{chips:seniorNight}` stays the page's only delivery claim. The product's own printed words (the poster's "SENIOR NIGHT · CLASS OF 2026" strip, the back's "SENIOR EDITION · 1 OF 1") are the product, not copy, and stay.
  - The cluster is one `<figure>` with C13 as its `<figcaption>` (`FictionalLabel`). Group label (`aria-label` on the figure) and the OG-image alt: `Senior Night edition: custom basketball poster and trading card, front and back, in the gold senior finish — example artwork, fictional athlete`.
  - **Fallback, only if the composed cluster is not ready by the SN deadline (~Sep 27):** `sn.hero.fallback` = `art-pipeline/out/etsy-shots/senior-night/poster-on-wall-composited.png` (2048², 09-04; the Tui Fa'agata **football** SR poster framed on a bedroom wall, no baked text — viewed 2026-09-06). Alt: `Custom football poster hung on a bedroom wall — Senior Night finish — example artwork, fictional athlete`. C13. Media and alt travel together: the cluster is basketball and says basketball, the fallback is football and says football — never the football alt on the basketball art (the defect this line replaces). The live Etsy hero `Exportai Etsy/SN FULL/SN-01-HERO.jpg` is **not** a fallback: its art cannot be cut free of the arrow and the baked "PRINTED OR DIGITAL · PRINTS SHIP FREE" line without clipping the card front (ASSETS §3.13).
- CTA: F1 **Order on Etsy →** `/go/etsy/GDE-ANY-SNSET` (4564565764); F2 **Start their senior edition** `/order/new?style=SR` + outline **Also on Etsy →**.
- No finish picker anywhere on this page.

**2) Order-by calculator**
- H2: **WHEN IS SENIOR NIGHT?**
- Label: **Senior night date** · input type date · help "US date, Eastern time. We count business days from the day you order."
- Button: **Check what's in time**
- Result rows (from `lib/capacity.ts` with the SR lead times; `weeklyCap` off):
  - **Digital files** — "Files by {date} — before the night" / "Files land after the night"
  - **Printed set** — "Order by {date} for the printed set to ship in time" / "A printed set can no longer ship before the night"
  - **Sealed pack** — "Order by {date}" / "The sealed pack arrives after the night"
- Result CTA: **Start their senior edition** → `/order/new?style=SR&tier={fits}&occasion={date}` (F1: **Order on Etsy →**).
- Honest fallback (nothing printed fits): **Nothing printed can arrive before {date}. Order the digital files — they arrive first, in 1–2 business days — and hand over a printed gift note on the night. The printed set follows after.** Button: **Gift the digital first — print the gift note** (opens the printable below).
- **Printable gift note** (letter/A5, gold rule, silver shield):
  - Heading: **THIS IS YOUR SENIOR EDITION.**
  - Body: "{First}, your Senior Night card and poster are being made from your own photos — one registered edition, yours alone. The printed set arrives after the night. One last home game — and it's on the wall for good."
  - Sign-off line: "From ____________"
  - Small: "Game Day Edition · gamedayedition.com/senior-night"
- C17 under the calculator.

**3) What a senior edition is**
- H2: **WHAT MAKES IT A SENIOR EDITION.**
- Four items, each with media from `03-senior-night/src/` (C13 on the group):
  - **The back** (`bsb-sr-back.png`): "Career highs, class year, the four-year line — FR · SO · JR · SR — the senior quote, the athlete signature line, and SENIOR EDITION · 1 OF 1 beside the registered card ID."
  - **The certificate** (`bsb-sr-cert.png` — only if count-neutral; otherwise omit the media and keep the text): "A printed Certificate of Authenticity ships with every printed set."
  - **The badge and sticker** (`bsb-sr-badge.png`, `bsb-sr-sticker.png`): "Die-cut bonus files in the senior gold."
  - **The pack panel** — **hidden** until the TGC pack face is count-neutral (it still prints a card count). Text only if shown later: "The sealed pack, 18 cards — 4 holographic chase, 14 standard."
- Alt for the back: `Back of a Senior Night trading card: career highs, class year, four-year career line and senior quote — example artwork, fictional athlete`.

**4) Nine sports**
- H2: **NINE SENIOR NIGHTS, MEASURED.** Subhead: **The sports parents search for by name. Every other sport gets its senior edition at the order.**
- Tiles (SR front stills from `card-flip/out/GDE_*SR_*`): Football · Volleyball · Cheerleading *(name + crest — no number)* · Soccer · Basketball · Wrestling · Softball · Baseball · Ice Hockey
- Tile link: F2 `/senior-night/<slug>`; F1 → `/go/etsy/GDE-<CODE>-SNSET` where a listing is live (football, baseball, softball, soccer, volleyball, wrestling, cheerleading), else `/go/etsy/GDE-ANY-SNSET`.
- Line: **Another sport? Choose it at the order — all 17 get the senior edition.** → `/order/new?style=SR&sport=` (F1: Etsy any-sport SN listing).
- Never dance, track, band or lacrosse tiles.

**5) The whole senior class**
- H2: **THE WHOLE SENIOR CLASS?**
- Body: **One link for every family. You set the crest, the colors and the deadline once; every parent orders and pays for their own athlete, and every card is built and proofed on its own.**
- CTA: F1 **Email us about the class** `mailto:{email}?subject=Senior%20night%20team` · F2 **Create a team link** `/teams?occasion=senior-night`.

**6) Trust stack**
- C1 · C2 · C3 · C4, each under its heading (Our promise · How it's made · Photo privacy · Independent studio), then C17.
- SN FAQ (4 visible):
  1. **What goes on the back of a senior card?** — Career highs, position, team, senior season, class of, the four-year line FR · SO · JR · SR, a senior quote and the athlete signature line — plus the registered card ID and QR code.
  2. **My senior is a cheerleader — no number?** — Right. Cheerleading cards carry the name and club crest; the back shows level, title and years instead of a number.
  3. **When do I have to order?** — `{chips:seniorNight}`. Add the date at the order and we schedule the proof against it. If nothing printed can make it, order the digital files and gift the note above.
  4. **Digital and printed?** — Every printed senior set includes every digital file. Files arrive first; the printed set ships after you approve the proof.
- CTA pair + `{chips:seniorNight}` + TrustLine.

`/senior-night/[sport]` (F2): same spine; H1 = **{SPORT} SENIOR NIGHT.** in the measured word order (`senior night volleyball` for volleyball — H1 **SENIOR NIGHT VOLLEYBALL.**); sport FAQ (3); CTA → that sport's SN listing via `/go/etsy/GDE-<CODE>-SNSET` and `/order/new?style=SR&sport=<slug>`.

### 2.6 `/how-it-works` (light; Article schema + FAQPage on the visible FAQ)

**1) Hero**
- H1: **MADE BY A PERSON. AI IS IN THE TOOLBOX.**
- First paragraph: C2 verbatim.
- Second paragraph: **Six gates stand between your photos and the print. Each one produces something you can look at, and each one can say no. Here is every gate, with the real artefact it makes.**
- Pills: `SIX GATES` · `YOU SEE IT FIRST`

**2) Six gates, one artefact each** (`GateRow` with PASS/FAIL chips; accordion; `BracketFrame` on each artefact; all media from the audited fictional roster; C13 on each) `id="gates"`

1. **PHOTO CHECK** — *artefact: the verdict, as the parent reads it.*
   Body: **Before a cent is spent we look at every photo you sent and tell you, in plain words, which ones can carry the likeness and what would fix the rest. The reasons are things you can act on — never "validation failed".**
   Artefact card (three real reasons from `art-pipeline/intake.ts`, rendered as rows with FAIL/NOTE chips):
   - `FAIL` Photo 3 — 4 people in this photo and no clear subject — send one where the athlete is the closest person to the camera.
   - `FAIL` Photo 5 — the eyes are hidden — sunglasses, a visor or a shadow across them; send one where both eyes are visible.
   - `NOTE` Every photo faces the camera square on — send two more, the head turned about 45° to one side in one and to the other side in the other.
   - `PASS` Photos 1, 2, 4, 6 — usable. Anchor: photo 2.
   Footer line: **If your photos can't carry the likeness and you have no stronger ones, you get every cent back — before any art is made.** Link: **What to send** → `/photo-guide`.

2. **KIT BUILD** — *artefact: the kit plate (`_kit.png`).*
   Body: **The kit is a property of the sport, not the person: shirt, shorts, socks, footwear and your crest, copied from your photos exactly as they are. Nothing on the kit is invented — a mark the photos don't show is a mark that doesn't exist.** Then C6.
   Caption: `Kit plate: the athlete's real kit, front and back, built once and reused for every shot`.
   Side note (real, README §29): **A re-rolled plate once came back with a league shield where the club crest had been. It never left the studio — that is what this gate is for.**

3. **REFERENCE PLATE** — *artefact: three views of your athlete.* `id="likeness"`
   Body: **From your photos we build one reference of your athlete — front and both sides — and lock it before a single pose is made. You see it first and answer by email: "that's them", or what's off — jaw, hair, build. The plate is the anchor; every later shot is measured against it.**
   Caption: `Reference plate: three views of a fictional athlete built from their photos`.

4. **THE SHOTS** — *artefact: four frames.*
   Body: **Four shots from the locked plate — a hero, two action frames and a back or celebration frame. Hands are asked for, not repaired: five separated fingers doing something real is in the brief for every pose. When a frame is right except for one detail, that one detail is changed and nothing else moves.**
   Caption: `Four shots of one fictional athlete — hero, two action frames, back`.

5. **VERIFICATION** — *artefact: the frame beside its plate.*
   Body: **Every frame goes next to the plate in one picture. Every crest, number and mark on the frame must have a twin on the plate, and the face must measure as the same person. No scores are shown to anyone — a frame passes or it doesn't, and a frame that doesn't never reaches the finish.**
   Caption: `Verification sheet: a frame beside its reference plate — every mark must have a twin`.

6. **FINISH** — *artefact: the watermarked proof.*
   Body: **The finish is built around the shots — the type, the material, your team colors — and a watermarked proof comes to you. C20 One revision is included. Approve, and the files are released; for printed packages, printing starts that moment.**
   Caption: `Watermarked proof of a custom card — what you approve`.

**3) The rejected take** — H2: **ONE THAT DIDN'T SHIP.** Subhead: **A real rejection from our own roster, not a staged one.**
- Pair as home §10 (kit changed between shots — README §20). Under it: **A rejection is never fixed by loosening the gate. The input is fixed, or you are asked for a better photo.**

**4) The effort sentence** — single line, Anton: **ABOUT FIFTY FRAMES ARE GENERATED FOR ONE ATHLETE. FOUR SHIP.** *(No generation counts, hours or scores anywhere else.)*

**5) What you approve, and when** — H2: **WHAT YOU APPROVE, AND WHEN.**
- Timeline (same states as `/order/[token]`): **PAID** → **PHOTOS RECEIVED** → **PHOTO CHECK** (passed · needs more photos · declined and refunded) → **REFERENCE PLATE** *your approval, by email* → **THE SHOTS** → **PROOF** *your approval, on your order page* → **FILES READY** → **PRINTING** (per package) → **SHIPPED** (per package, tracked) → **DELIVERED**
- Under: C20 **One revision is included; a second small text fix is usually free — ask.** Then C10.
- Reminder line: **When an order needs something from you, we send up to three reminders over 14 days, then pause it. A paused order can be resumed any time within 12 months.**

**6) Printing partners** — H2: **WHO PRINTS IT.**
- Three rows (C19): **Professional photo print lab, Santa Cruz CA** — the 12- and 24-card sets, with the printed certificate · **Print-on-demand poster printing partner, Charlotte NC** — 18 × 24 and 24 × 36 posters, with the printed certificate · **Trading card pack printing partner, Hong Kong** — the sealed foil pack *(row hidden until D18)*. *(Each shipped package carries its own printed certificate from the lab that prints it — §2.3 note, §6 #14.)*
- Line: **Labs receive only the finished artwork and a shipping address — never your photos. Color correction is switched off at the lab: what you approved is what prints.**
- C4.

**7) FAQ** (visible; FAQPage schema here):
  1. **Is this a template with my photo dropped in?** — No. Every piece is composed around your athlete — their photos, kit, colors and sport. AI imaging tools are part of the creative process, and every composition, likeness, spelling, color and detail is reviewed and finished by a person before you see the proof.
  2. **Will it look like my athlete?** — Recognizable likeness is the point. We build a reference of your athlete from your photos first and check every shot against it. If it does not look like them, it does not ship.
  3. **Do I approve it before it prints?** — Yes. You receive a proof and approve it before anything is finalized or printed. One revision is included.
  4. **What happens to the reference you build?** — It exists only to check likeness for your order, is never shared, and is destroyed when the order closes. The written policy is at `/privacy/biometric`.
  5. **How long does it take?** — C10 (plus C17).
  6. **Do you show my athlete on this page?** — Never without written permission. Every example here is a fictional athlete from our own roster — C13 marks each one.
- CTA pair + `{chips:standard}` + TrustLine.

### 2.7 `/guarantee` (light)

**1) The promise and its limits**
- H1: **OUR PROMISE, IN WRITING.**
- Subhead: **Because we are new, the risk of trying us is ours.**
- C1 as the lead paragraph, in a `BracketFrame`.
- H2: **WHAT THAT MEANS, EXACTLY.**
  - **Proof approval.** C20 Once you approve, the proof is the print. If a name is misspelled on the proof you approved, we still fix it on the files free — but a printed package already in production is reprinted at cost.
  - **Screen versus print.** Colors on a phone or monitor are backlit; paper is not. A slight difference between the proof on screen and the print in hand is normal and is not a defect. A wrong color — the team red printed orange — is a defect and is reprinted free.
  - **No cancellation once printing starts.** Printing starts the moment you approve the proof. Until you approve the reference plate you can cancel for any reason with a full refund; between plate approval and proof approval the promise above applies.
  - **"Refund and keep the cards."** That is for prints that arrive wrong — damaged, mis-cut, off-color. It is not a way to get free cards, and repeated claims on one order are handled under the terms → `/terms#refunds`.

**2) Shipping table** — H2: **WHERE IT SHIPS FROM, AND WHEN.** *(rows from `lib/catalog/shipping.ts`; carrier and packaging cells carry the tag "per lab" until the first tracked shipment is observed — `docs/SUPPLIERS.md` records no test order)*

| Package | Ships from | Carrier / packaging | Timing | Tracking |
|---|---|---|---|---|
| Digital files | Your order page | — | 1–2 business days from your order | — |
| 12 or 24 printed cards + certificate | Professional photo print lab, Santa Cruz CA | USPS, plain white-label box (per lab) | Ship within 5–7 business days of your order, after proof approval | Yes |
| Posters 18 × 24 / 24 × 36 + certificate | Print-on-demand poster printing partner, Charlotte NC | Tube, poster and certificate in one shipment (per lab) | Ship within 5–7 business days of your order, after proof approval | Yes |
| Sealed foil pack *(row hidden until D18)* | Trading card pack printing partner, Hong Kong | International, tracked (per lab) | {LEAD_TIMES.sealedPackWeeks} weeks, ships separately | Yes — duties line to be added after the partner's DDP answer |
| Ultimate Set | All three | — | Three tracked packages, staged | Yes |

- Under the table: C11 · C12 · C10.

**3) Refunds — where** — H2: **WHERE A REFUND HAPPENS.**
- **Etsy orders are refunded on Etsy. Orders placed here are refunded here, to the card you paid with, within 5 business days of the decision.**

**4) The refund ladder** (§5.6) — H2: **THE REFUND LADDER.** `id="refunds"`

| Stage | What happens |
|---|---|
| Before you approve the reference plate | Cancel any time — full refund |
| Photo check not passed and no stronger photos | Automatic full refund, within 1 business day — before any art is made |
| After one revision you still don't like the proof | Refund every cent |
| After proof approval | Printing starts; no cancellation — but a print defect means a free reprint, or a refund and you keep the cards |
| Digital files after delivery | Not refundable, except under the promise above |
| If we miss a committed date | You get a new date in writing; if the new date misses your senior night or occasion date, a full refund is offered |
| Reminders and pauses | Up to three reminders over 14 days, then the order pauses; resume any time within 12 months |
| Etsy orders | Etsy's purchase terms and Etsy refunds apply |

**5) We are new** — the long block from §1.3, signed **John Birch**, link **About the studio** → `/about`.
- CTA pair + TrustLine.

### 2.8 `/photo-guide` (light; Article schema; print stylesheet)

- H1: **THE PHOTOS THAT WORK.**
- Subhead: **Send 4–10. These nine things are what the photo check looks for — and every one of them is something you can do with the phone you already have.**
- Pills: `4–10 PHOTOS` · `ORIGINALS, NOT SCREENSHOTS`
- Lead: C5.

**Checklist** (same component as the F2 upload page; rows map 1:1 to `intake.ts` reasons):
1. **Face large and sharp.** The face should be at least a hand's width of the frame and crisp. Move closer, and send the original file — a screenshot throws the detail away. *(intake: "the face is only N px across and not sharp enough" / "the athlete is too far away in the frame")*
2. **One turned about 45° each way.** One with the head turned to the left, one to the right. Without them the side view has to be guessed. *(intake: "every photo faces the camera square on" / "no photo turned to the LEFT/RIGHT")*
3. **One full-body.** Head to shoes, standing or moving — it sets the build and the proportions.
4. **One in the team kit.** A game photo or team photo day. The kit on the card is copied from it, crest and all.
5. **Both eyes visible.** No sunglasses, no visor shadow, no helmet cage across the eyes. *(intake: "the eyes are hidden — sunglasses, a visor or a shadow across them")*
6. **Your athlete is the closest person to the camera.** Teammates and parents behind are fine. A team photo where six faces are the same size is not — nothing in it says which one is yours. *(intake: "N people in this photo and no clear subject")*
7. **Different moments, not the same second.** Four frames from one burst count as one photo. *(intake: "every photo is nearly the same shot")*
8. **Well lit, not blurred.** Motion blur and dark gyms hide the face. One crisp, close, well-lit photo does more than four soft ones. *(intake: "the face is unclear — likely blurred or badly lit" / "every usable photo is SOFT")*
9. **The crest as its own file.** A PNG or SVG of the school or club crest, if you have one — otherwise a straight-on photo of it. C6.

**What we never ask for:** no date of birth, no home address, no school name.

**Good / not yet** — H2: **GOOD, AND NOT YET.** Media `public/images/photo-guide.webp` (six panels; C13):
- Top row, `PASS`: **Clear face, close, both eyes** · **Full body in the team kit** · **Action, athlete closest to the camera**
- Bottom row, `FAIL`: **Motion blur** · **Too dark** · **Too far away**
- Alt: `Six example photos of fictional athletes: three that pass the photo check and three that don't — blur, darkness, distance; photos generated`.
- Also usable: listing slides 12/13 (`12-photos.png`, `13-crest.png`) with C13.

**Closing line:** **If your photos can't carry the likeness, we tell you before any art is made and refund every cent.**
**Buttons:** **Print this checklist** (window.print; the print stylesheet keeps the nine rows and drops the media) · **See how photos become a card** → `/how-it-works` · CTA pair + TrustLine.

### 2.9 `/about` (light; Organization + Person JSON-LD)

**1) Who is asking for my child's photos**
- H1: **WHO IS ASKING FOR YOUR ATHLETE'S PHOTOS.**
- Subhead: **A designer in Lithuania, three professional labs in the US, and a registry that outlives the season.**
- Founder card: `public/brand/founder.jpg` (real, from the Etsy profile; absent → no image) · **John Birch** · Designer and founder · {city — pending} · {email}.
- Story (from `docs/ETSY-COPY.md` About, corrected — square-cut; "before any art is made"; owner's spine 2026-09-06):
  > Game Day Edition started with a simple observation: kids who love their sport end up with hundreds of photos on a phone and nothing on their wall.
  >
  > So that is what we make. You send the photos you already have — a few clear shots of your athlete. We design a poster and a set of collectible trading cards around them: their name, their number where the sport has one, their team colors, their season. Then we print them properly, square-cut on real card stock, the way a card is supposed to feel in a kid's hand.
  >
  > **What makes it different.** This is not a template with a photo dropped in. Every piece is composed for the athlete in it — the crop, the light, the type, the color. Six finishes, each with its own materials and mood, from a floodlit stadium at night to high-contrast chrome. Seventeen sports, from basketball and football to gymnastics, wrestling and pickleball.
  >
  > **How it is made.** Each piece is designed here, not pulled off a shelf. We use AI imaging tools as part of the creative process, and every composition, likeness, spelling, color and detail is reviewed and finished by a person before it reaches you. If it does not look like your athlete, it does not ship. Nothing goes to print until you have seen it. You get a proof first. If something is wrong — the number, the spelling, the crop — it gets fixed before anything is printed.
  >
  > **About your photos.** We ask for 4 to 10 photos and nothing else. No date of birth, no home address, no school name. Your athlete's photos are used for your order and for nothing else. They are never posted, shared, or used to promote this studio unless you give permission separately, after the work is done. And if the photos you have are not strong enough to do the job well, we will tell you before any art is made.
  >
  > **Who it is for.** Senior nights. End-of-season gifts. Grandparents who want something for the wall that is not a school portrait. First-year players and last-year players. Adults who still compete.
- Founder note (first person, italic, signed):
  > I put everything I know — design and the AI process behind it — into one thing: making a kid look and feel the way they would after a professional photoshoot, on their own card and poster. A gift nobody else has.
  > — John Birch
- *(Appendix A interview answers slot in here when the owner supplies them: origin moment, first athlete, why cards, why the registry, one refusal story, the one sentence for the wall.)*

**2) Two short essays**
- H2: **A CARD WITHOUT A RECORD IS A PHOTO PRINT.**
  > A trading card is a claim: this player, this season, this edition. A photo print makes no claim; it is just a nice picture. That is why every card we make carries its registered card ID on the back and opens its own page here — the edition, the finish, the season, the stats, the date it was registered. One registered edition per athlete, per finish, per season. Physical cards are not individually numbered; the record is the registration, not a serial. We keep every registered page online for at least five years from the order, and if the studio ever winds down we keep the registry resolving for that period or tell you how to keep a copy. The domain is locked and renews on its own. A kid who scans the card in 2031 should see what their parent saw in 2026.
- H2: **WHY YOU SEE IT FIRST.**
  > Every edition goes through the same six gates: a photo check that says which photos can carry the likeness; a kit plate copied from your photos; a reference plate of your athlete — three views — that you approve before a single pose is made; four shots built from that plate; a verification sheet where every crest, number and mark on a frame must have a twin on the plate and the face must measure as the same person; and a watermarked proof you approve before anything prints. About fifty frames are generated for one athlete. Four ship. The rest are the rejected takes — the kit that changed between shots, the frame that drifted from the plate — and they are the reason the promise can say what it says. → `/how-it-works`

**3) Independence and marks** — H2: **INDEPENDENT, AND WHAT THAT MEANS FOR YOUR CREST.** C4 then C6. Then: **Your school or club's own crest is yours to use and ours to copy exactly; a league mark is neither.**

**4) Studio and partners** — H2: **DESIGNED IN LITHUANIA. PRINTED IN THE US.**
- **Every edition is designed at the studio in Lithuania and printed by professional labs in the United States:** C19 three rows (pack row hidden until D18). **Labs receive the finished artwork and a shipping address — never your photos.**

**5) Imprint** — H2: **THE LEGAL ENTITY.** Full imprint block when complete; fallback line otherwise (§1.2). Plus: **Registered in Lithuania. Contact: {email}.**

**6) True numbers** — H2: **THE NUMBERS THAT ARE TRUE TODAY.**
- **17 sports** → `/trading-cards#sports` · **7 styles — 6 finishes + Senior Night** → `/trading-cards#finishes` · **18-card sealed pack — 4 holographic chase, 14 standard** (hidden until D18) · **27 files and one live page in every complete set** → `/complete-set#spec` · **Registry live since August 2026** → `/registry` · **Square-cut, UV-coated 2.5 × 3.5 in cards** → `/trading-cards#spec`
- No customer counts, no ratings, no "trusted by" — until they are real and consented.
- CTA pair + TrustLine.

### 2.10 `/registry` (light)

**1) Lookup**
- H1: **LOOK UP A CARD.**
- Subhead: **Every card carries its registered card ID on the back and on the certificate. Type it here to open the card's page.**
- Field: label **Card ID** · mask `GDE-XX-XXX-YYYY-NN` · placeholder `GDE-SN-BKB-2026-12` · help "Printed on the back of every card and on the certificate. Mind O versus 0 and I versus 1." · button **Find this edition**
- Behaviour copy: hit → 302 `/c/<id>` · miss → "No card is registered under that ID. Check the back of the card — mind O versus 0 and I versus 1." · private → "This card is registered with Game Day Edition." · rate-limited → §1.3 string. No list of cards, ever.
- Demo line: **Try a demo: GDE-SN-BKB-2026-12 (fictional athlete).** → `/c/GDE-SN-BKB-2026-12`

**2) What a registered edition is** — H2: **WHAT A REGISTERED EDITION IS.**
- **How to read the ID.** `GDE-<style>-<sport>-<season>-<number>` — style is the finish code (SN Stadium Night · CA Chrome All-Star · FS Fire & Smoke · HE Heritage · SS Signature Spotlight · PR Prism Rush · SR Senior Night), sport is the three-letter sport code, season is the year on the card, and the last part is the jersey number — or, for sports that don't wear numbers and for adult athletes, an edition counter (`E07`) rather than a shirt number.
- **One registered edition per athlete, per finish, per season.** Physical cards are not individually numbered — every card in a 12- or 24-card set carries the same registered ID; the sealed pack is 18 cards — 4 holographic chase, 14 standard. Senior Night editions carry `SENIOR EDITION · 1 OF 1`.
- **What the registry stores.** Only what is printed on the card — name, team, position, season, stats, highlight and the finish — plus the date it was registered. **What it never stores:** photos, addresses, birthdays, emails, order numbers.
- **The certificate.** A printed Certificate of Authenticity ships with every printed package and shows the same ID.
- **How long.** Registered pages stay online for at least five years from the order, and if the studio ever winds down we keep the registry resolving for that period or tell you how to keep a copy → `/terms#registry`.
- **Visibility.** Customer pages are unlisted by default: they open only from the QR code or the exact ID and are not indexed by search engines. Public pages exist only with the parent or guardian's written permission. To unlist, make public or delete a page, email {email} from the purchase address with the order number.
- *(There is no separate "verify" page; the registry lookup is the verification surface.)*

### 2.11 `/faq` — master list (FAQPage schema here; product pages render subsets without duplicate markup)

- H1: **QUESTIONS, ANSWERED.**
- Subhead: **Everything we are asked, in one place — products, photos, timing, privacy, refunds.**

**Products**
1. **Is this a template with my photo dropped in?** — as 2.6 #1.
2. **Are the printed cards real trading cards?** — Yes. Square-cut, UV-coated, 2.5 × 3.5 in cards printed by a professional photo lab in the US, with a free printed Certificate of Authenticity in every shipped package.
3. **Are the corners rounded?** — as 2.2 #3.
4. **What's in the sealed pack?** *(render only when the pack tier is enabled)* — 18 cards — 4 holographic chase, 14 standard — sealed at our pack partner in Hong Kong and shipped separately, {LEAD_TIMES.sealedPackWeeks} weeks.
5. **Which poster size should I choose?** — as 2.3 #2.
6. **What's in the complete set?** — 27 files and one live page: the poster in two sizes, the card front and back, the certificate, nine social posts, seven wallpapers, the bonus die-cuts, the flip video, and the card's registered page. Printed sets add the printed cards, poster and certificate.
7. **Can I print the files myself?** — as 2.3 #3.

**Photos**
8. **How many photos should I send?** — C5
9. **What if my photos can't carry the likeness?** — We tell you before any art is made and ask for stronger photos. If there are none, you get every cent back.
10. **Will it look like my athlete?** — as 2.6 #2.
11. **Can you use our team crest?** — Yes — your school or club's own crest, exactly as you send it. C6 (first sentence).

**Sports without numbers**
12. **My athlete's sport has no jersey number.** — C9
13. **My senior is a cheerleader — no number?** — as 2.5 SN FAQ #2.

**Timing and delivery**
14. **How long does it take?** — C10 Then C17.
15. **Where do you ship?** — C11
16. **Do the printed pieces arrive together?** — as 2.4 #2.
17. **Ordering for senior night — when do I have to order?** — as 2.5 SN FAQ #3.

**How it's made**
18. **Do I approve it before it prints?** — as 2.6 #3.
19. **Do you use AI?** — Yes, as a tool. C2 The full process, gate by gate, is on the how-it-works page.
20. **What happens to the reference you build of my athlete?** — as 2.6 #4.

**Privacy**
21. **Will my athlete's photos be posted anywhere?** — No. C3
22. **What do you never ask for?** — A date of birth, the athlete's home address, a school name. We ask for 4–10 photos and the details printed on the card, and nothing else.
23. **How long do you keep the photos?** — Deleted 30 days after delivery, or earlier if you ask. The finished artwork is kept 12 months so reprints stay possible. The likeness-check measurement is destroyed when the order closes. The registry record — only what is printed on the card — stays for at least five years.

**Refunds and the promise**
24. **What if I'm not happy?** — C1 The full ladder is on the guarantee page.
25. **Can I cancel?** — Until you approve the reference plate, any time, with a full refund. After proof approval printing starts and the order cannot be cancelled — but a print defect is reprinted free or refunded in full.
26. **Where is a refund paid?** — Etsy orders on Etsy; orders placed here, here, within 5 business days of the decision.

**Etsy and this site**
27. **Should I order here or on Etsy?** — as 2.2 #5 (F1 variant while the site does not sell).
28. **Where do I order?** *(F1 only)* — Orders are placed on our Etsy shop. Every card, poster and set is built and proofed the same way, and your files and your card's page are delivered here.
29. **I ordered on Etsy — where are my files?** — On your order page, linked in your Etsy message after purchase. The full set is larger than Etsy's attachment limit; the card front and flip video are attached on Etsy as well.

**Teams**
30. **Can I order for a whole team?** — Yes. Email us the sport, roster size and event date — every family orders their own athlete under one team setup, and each card is built and proofed individually. *(F2: "Create a team link on the teams page.")*
31. **What does the coach see?** — Names and order status. Never photos, never files.

**Registry and card pages**
32. **What is the registered card ID on the back?** — Every card carries its own registered card ID and a QR code. Scanning it opens the card's page here — the edition, the stats and the season. Customer pages are unlisted unless you choose to make them public.
33. **Can I make the page public, or take it down?** — Yes. Email {email} from the purchase address with the order number and the card ID. Takedowns are done within 48 hours; other changes within 30 days.
34. **How long will the page stay up?** — At least five years from the order; if the studio ever winds down we keep the registry resolving for that period or tell you how to keep a copy.
35. **The QR code opened a "not found" page.** — Check the ID on the back of the card or on the certificate — it reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1. Still nothing? Email {email} with a photo of the card back.

### 2.12 `/contact` (light; mailto only until there is traffic)

- H1: **TALK TO A PERSON.**
- Subhead: **Email {email}. Include your order number if you have one.**
- Response window: **render only if the owner commits (§12 #17)** — "We answer within 1 business day, US Eastern." Otherwise no sentence at all.
- **Etsy orders** — Questions about an order placed on Etsy are fastest through Etsy Messages — that is also where Etsy orders are refunded.
- **Lost your order link?** *(F2)* — Enter your order number and the purchase email and we resend it → `/order/recover`. *(F1: "Email us from the purchase address with your order number.")*
- **Card pages** — To unlist, make public or delete a card page, email from the address used for the purchase and include the order number and the card ID. Takedowns within 48 hours; other requests within 30 days.
- **Report a card page** — Seen a page that shouldn't be public? Email the card ID; we act within 48 hours.
- **Teams and clubs** — Email the sport, roster size and event date. One setup for the team; every family orders their own athlete, and each card is built and proofed individually.
- **Photos** — To have your athlete's photos deleted, email with the order number; you receive a Request ID and confirmation within 30 days. Photos are deleted 30 days after delivery in any case; the likeness-check measurement is destroyed when the order closes.
- **Press and partnerships** — Same address. We don't do affiliate programs or paid placements.
- Imprint block or fallback (§1.2).

### 2.13 `not-found.tsx` (branded 404) and the `/c` unknown-ID variant

- Generic: H1 **THAT PAGE DOES NOT EXIST.** Body: "Scanned a card? Check the ID on the back of the card or on the certificate — it reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1." Links: **Look up a card** `/registry` · **Home** `/`.
- `/c/<unknown>`: H1 **NO CARD REGISTERED UNDER THIS ID.** Body: "Check the back of the card — the ID reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1." Inline lookup field + **Find this edition**. Link: **What is a registered edition?** `/registry`.
- `/c/<deleted>` (410): H1 **THIS CARD PAGE HAS BEEN REMOVED.** Body: "The page was removed at the request of the edition's owner. The card itself is still a registered Game Day Edition." No name, no art.
- `error.tsx`: H1 **SOMETHING WENT WRONG ON OUR SIDE.** Body: "Nothing was lost. Try again, or email {email}." Button **Try again**.

### 2.14 `/accessibility` (WCAG 2.2 AA statement)

- H1: **ACCESSIBILITY.**
- Subhead: **We want every parent, grandparent and athlete to be able to use this site — including with a screen reader, a keyboard, or reduced motion.**
- **Our standard.** We build gamedayedition.com to the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.
- **What that means here.** Every image has a real text description; text keeps at least a 4.5:1 contrast on light pages and 4.85:1 on the dark card pages; every control works with a keyboard and shows a visible focus ring; the card flip has a keyboard and screen-reader button and becomes a plain front/back switch when your device asks for reduced motion; muted videos carry their text in the page; tap targets are at least 24 px; nothing flashes.
- **Known limits.** Card artwork is an image of a printed card; its text (name, stats, ID) is repeated in the edition panel on the same page. Third-party pages we link to — Etsy, the payment provider — follow their own standards.
- **Tell us.** If something on this site is hard to use, email {email} with the page address and what happened. We answer within 5 business days and fix what we can in the next release.
- **Status.** Statement first published {date}; reviewed with each release.

### 2.15 `/c/[cardId]` — the QR digital twin (dark arena; mobile-first; strings only)

**1) Identity header**
- Name: `{FIRST} {LAST}` in the finish's display font.
- Meta line: `#{number} · {POSITION} · {TEAM} · {season}` for numbered sports and minors; **without `#`** and without a number for the five numberless sports and for adult athletes: `{POSITION} · {TEAM} · {season}`.
- Silver shield (file) top-left, `alt="Game Day Edition shield"`.
- Pill: `REGISTERED EDITION`; SR: `SENIOR EDITION · 1 OF 1`.
- Demo records: C13 directly under the header.

**2) Flip hero**
- Button label: **Tap to flip** (`aria-label="Flip the card to show the back"` / "…the front"); after flip: **Tap to flip back**.
- Reduced motion: two-state switch **Front** / **Back**.
- Video fallback `aria-label="Card flip video, {FIRST} {LAST}, {Finish} finish"`; poster frame = front.
- Alt front: `Registered card front — {sport} — {Finish} finish` (+ ` — example artwork, fictional athlete` for demo). Alt back: `Registered card back — season stats, registered card ID and QR code`.

**2b) Flip hero — art pending** (rendered *instead of* (2) whenever `cardArtFor(id)` is `null`: today the five `ART_PENDING` records — `GDE-CA-SFB-2026-03`, `GDE-SN-SFB-2026-03`, `GDE-FS-WRS-2026-01`, `GDE-HE-WRS-2026-01`, `GDE-SN-BKB-2026-23` (CONTRACTS §4.10) — and any future record whose files have not been generated yet)
- Same 5:7 box on the arena as (2) (CLS 0), the silver shield centred inside it (`aria-hidden`); no image, no button, no video, no "Tap to flip".
- Pill (outline-silver) above the sentence: **ARTWORK PENDING**
- Body — the only wording allowed; no "soon"-type promise, no date, no apology: **This edition's card art is being prepared — the registration below is live.**
- Wrapper `<section aria-label="Card artwork">`; the sentence is visible text, no `aria-label` repeats it.
- Everything else on the page is unchanged and must be literally live: (1) identity header (C13 stays for demo records — the athlete is fictional whether or not art shows), (3) edition panel, (4) stats, (5) share row, (6) about this finish, (7) CTA row, (8) footer. The **DOWNLOADS** heading and its rows are omitted entirely (never an empty section, never a disabled button).
- Title, meta, share text and OG title unchanged; OG image puts the shield where the front would be (CONTRACTS §5.6).
- Never used for `private` (its own body, (8)) or `deleted` (§2.13 410) — those states win over art state.

**3) Edition panel** (silver rule; `Registered`, never "Verified")
| Row label | Value |
|---|---|
| EDITION ID | `{cardId}` + **Copy ID** button (`aria-label="Copy card ID"`, toast "Copied") |
| FINISH | `{styleName}` |
| SPORT | `{sport name}` |
| SEASON | `{season}` |
| REGISTERED | `{registeredAt as "Aug 27, 2026"}` |
| CERTIFICATE | Printed and included with every shipped package |
| EDITION *(SR only)* | SENIOR EDITION · 1 OF 1 |
- Sentence under the rows: **One registered edition per athlete, per finish, per season. Physical cards are not individually numbered; the sealed pack is 18 cards — 4 holographic chase, 14 standard.**
- AI Act line (C15): **Artwork generated with AI tools from the athlete's photos and finished by a person.**
- Small: **Last updated {updatedAt}** · link **What is a registered edition?** → `/registry`.

**4) Stats and highlight**
- Section label: **SEASON STATS** (SR: **CAREER HIGHS**); up to three `StatChip`s from `stats[]` (label under value); omitted entirely when empty — never a dash.
- Highlight line: `{playerHighlight}`; **CLASS OF {classOf}** only for demo minors or opt-in customers.
- SR extra rows: **SENIOR SEASON {season}** · **FR {y} · SO {y} · JR {y} · SR {y}** · quote in the finish's supporting italic.

**5) Downloads and share**
- H2 (small caps label): **DOWNLOADS**
- Real customers, when `delivered`: **Phone wallpaper — lock** · **Phone wallpaper — home** · **Tablet** · **Desktop** · **Clean (no type)** — each `aria-label="Download {name} wallpaper"`; note "Wallpapers keep the name and marks out of the clock and home-indicator strips." (SN/CA files only after their safe-zone pass.)
- Demo: **Card front (PNG)** · **Card back (PNG)** · **Flip (GIF)** — the whole DOWNLOADS block is omitted when `cardArtFor(id)` is `null` (2b).
- Share: **Copy link** (toast "Link copied") · **Share** (native share where available). Share text: public — `{FIRST} {LAST} · {Team} · {Finish} — Registered Game Day Edition`; unlisted — `{Finish} — Registered Edition`.

**6) About this finish**
- Two lines from `styles.ts`: `{material}` · `Type: {display} + {supporting}`. Link **See the {Finish} finish** → `/styles/<slug>` (F3; F1 → `/trading-cards#finishes`). SR → **About Senior Night editions** → `/senior-night`.

**7) CTA row by channel (D26)**
- `channel: demo-etsy` → single outline button **Get yours on Etsy →** `/go/etsy/GDE-{SPORT}-CARD`.
- `site` / `etsy` / `demo-site` → primary **Order another edition** `/order/new?sport={slug}&style={code}` (F1: **Order on Etsy →**) + outline **Also on Etsy →**.
- No prices, no coupons, no link to the edition's owner on real customers' pages.

**8) Privacy and control footer**
- `unlisted`: **This page is unlisted: it opens only from the card's QR code or its exact ID, and search engines are asked not to index it.**
- `public`: **Public — shared with the parent or guardian's permission.**
- All: **Report this card** → `mailto:{email}?subject=Report%20card%20{cardId}` — "Seen something on this page that shouldn't be here? Email us; we act within 48 hours."
- Manage line (no button): **To unlist, make public or delete this page, email {email} from the purchase email with the order number.**
- `private` page body: **This card is registered with Game Day Edition.** (no name, no art, no CTA beyond **Look up a card** → `/registry`).
- `deleted` → §2.13 410 copy.
- Demo footer adds C18 (short form: "Fictional athlete from our own roster — an example edition.").

**OG / title (per §8):** public — `<First> <Last> · <Team> · <Finish> — Registered Game Day Edition`; unlisted — `<Finish> — Registered Edition`; OG image: front on arena with the edition strip; **no name on unlisted OG**.

### 2.16 Legal pages (plain English; lawyer-ready drafts; no TEMPLATE labels; versioned)

Keep the existing page shell (`legal-page`, eyebrow "PRIVACY POLICY · UPDATED …", `BrandMark`, back link). The texts below **replace** the article body. Version line at the top of each: **Version 2026-09-F1 · effective {date} · previous versions on request.**

#### 2.16.1 `/privacy` — Privacy Policy

**H1: PRIVACY POLICY.**
Intro: **What we collect to make your athlete's edition, where it goes, how long we keep it, and what we never do with it. Written for the parent of a minor.**

**The short version.** We need 4–10 photos of the athlete and the details printed on the card — name, team, position, number where the sport has one, season, optional stats and a highlight line — plus the buyer's contact details and, for printed packages, a US shipping address. We never ask for a date of birth, a home address for the athlete, or a school. C3

**What we collect and why.**
- *To make the edition:* the photos you send, the athlete details you type, your team colors and crest, the reference and artwork we create from them, and your approvals (plate, proof) with their time and text version.
- *To run the order:* buyer name and email, order number, payment references (payments are processed by Stripe for orders placed here, or by Etsy for Etsy orders — card numbers never reach us), the shipping address for printed items, our messages with you, and shipment tracking.
- *To keep the registry:* only what is printed on the card, the finish, the season, the card ID and the registration date.
- *To keep the site working:* cookieless, aggregated analytics (page, country, device class) that never contain names, emails, photos or card IDs. No advertising pixels. No cookies for tracking.
- *Legal basis (GDPR):* performance of the contract with you (making and delivering the edition); your explicit consent for the likeness check (Article 9) and for any public page or marketing use; our legitimate interest in keeping the site secure and accounting records the law requires.

**Photos and the likeness check.** Photos are stored in private storage and used only to create your order. To check that the artwork looks like your athlete, we create a facial-geometry measurement from your photos and compare it against the artwork. That measurement is created only with your explicit consent, is used for nothing else, is never shared, and is destroyed when the order closes. The full written policy is at `/privacy/biometric`.

**Who processes the data (subprocessors).** `id="subprocessors"`
| Provider | Role | Where |
|---|---|---|
| Vercel | Hosting, cookieless analytics | US / EU edge |
| Supabase | Order and team records (database) | US |
| Cloudflare R2 | Private file storage — photos, artwork, deliverables (orders placed here) | US |
| Google Cloud Vertex AI | AI image generation from the photos you send, under Google Cloud's data-processing terms | US |
| Stripe | Payment, tax and refunds for orders placed here | US / EU |
| Resend | Transactional email | US |
| Etsy and Etsy Payments | Marketplace, payment and messages for Etsy orders | US |
| Printing partners (C19) | Receive only the finished artwork and the shipping address for printed items | US · Hong Kong (pack) |
Each provider receives only what its role needs. We do not sell personal data and we do not share it with advertisers.

**How long we keep things (retention).**
| Data | Kept |
|---|---|
| Source photos | Deleted 30 days after delivery, or earlier on request |
| Finished artwork and production files | 12 months, so reprints stay possible; then deleted |
| Likeness-check measurement | Destroyed when the order closes — at the latest 30 days after delivery |
| Registry record (only what is printed on the card) | At least five years, so the card's page keeps resolving |
| Order, payment and accounting records | As long as Lithuanian accounting and tax law requires (currently 10 years) |
| Consent records | For the life of the registry record |
| Deletion requests | Carried out within 30 days; you receive a Request ID and a confirmation |

**The card page.** Every card carries a QR code that opens its page on this site. For customers that page is **unlisted by default** — it opens only from the QR code or the exact card ID, is not indexed by search engines, and its social preview carries no name. It becomes public only if the parent or guardian asks for that in writing. You can unlist, make public or delete the page at any time by emailing {email} from the purchase address with the order number; takedowns are done within 48 hours.

**Children (COPPA and GDPR).** The service is directed to adults — the parent or legal guardian ordering for their athlete, or an adult athlete ordering for themselves. We never knowingly collect information from a child, and we do not offer accounts to minors. Card pages and order pages carry no forms, sign-ups or advertising trackers, so a child who scans a card gives us nothing. If you believe a child has sent us information directly, email {email} and we delete it.

**Marketing use.** C3 Any use of a finished piece in marketing needs its own separate permission, asked for after the order is complete, never tied to a discount, and revocable at any time.

**Your rights.** You can ask to see, correct, export or delete what we hold about you or your athlete, object to processing, and withdraw a consent (withdrawal does not undo work already done with it). Email {email} with the order number; requests are answered within 30 days. You can also complain to the Lithuanian State Data Protection Inspectorate (vdai.lrv.lt) or your local authority. Game Day Edition is operated from Lithuania; EU data-protection law (GDPR) applies to how we process data. The providers above process data in the United States under their standard contractual clauses and, where applicable, the EU–US Data Privacy Framework.

**Security.** Photos and files live in private storage behind signed, expiring links; order pages open only from a secret link sent to the purchase email; the likeness-check measurement exists only on studio equipment during production.

**Changes.** We date every version and keep the previous ones; your consent receipts name the version you accepted.

**Independent studio.** C4
**Contact.** {email} · imprint block or fallback (§1.2).

#### 2.16.2 `/privacy/biometric` — The likeness check (biometric data policy)

**H1: THE LIKENESS CHECK.**
Intro: **To make sure the artwork looks like your athlete, Game Day Edition measures facial geometry from the photos you send and compares it against every shot before the proof. This page is our written policy for that data, published to satisfy state biometric-privacy laws (including the Illinois Biometric Information Privacy Act, the Texas Capture or Use of Biometric Identifier Act and Washington's biometric identifier law) and Article 9 of the GDPR.**

**What is created.** A numeric facial-geometry measurement (a "face embedding") derived from the photos you provide, and the same measurement derived from the generated artwork. The two are compared to confirm the artwork depicts the same person. No photograph is altered by this step.

**When.** After the photo check and before any art is made — never at the moment you upload, never before you have consented.

**Why, and only why.** To check likeness for your order. It is the difference between claiming the artwork looks like your athlete and measuring it. It is never used to identify anyone, to search for anyone, or to compare against anyone outside your order.

**Consent.** We create this measurement only with the written consent of the athlete, or of the parent or legal guardian of a minor athlete, given when the order is placed (the checkbox at checkout, or the consent line in the Etsy personalization instructions). Without that consent we do not run the check and cannot complete the order. You can withdraw consent by email; we then destroy the measurement within 30 days, and any unfinished order is refunded under the refund ladder.

**What we never do.** We never sell, lease, trade, share or otherwise profit from this data; never use it to identify anyone outside your order; never use it to train AI models; never upload it to a public service; and never disclose it to anyone except as required by law.

**Retention and destruction.** The measurement is destroyed when the order closes — at the latest 30 days after delivery — or within 30 days of your written request, whichever comes first. Destruction is recorded in our order log as a fact and a date only; the measurement itself is never logged, and no score from the comparison is stored or shown to anyone.

**Access and security.** The measurement exists only on studio equipment in Lithuania during production and is never uploaded to a cloud service. Access is limited to the person producing the order. It is protected with the same care as the photos it comes from.

**Questions and requests.** Email {email} with your order number. Illinois, Texas and Washington residents may request a copy of this policy and the date of destruction for their order.

#### 2.16.3 `/terms` — Terms of Service

**H1: TERMS OF SERVICE.**
Intro: **These terms cover custom editions made by Game Day Edition — ordered on this site or on our Etsy shop. For Etsy orders, Etsy's purchase terms and Etsy's refund process also apply; the terms below describe the work itself.**

**1. Who we are.** Imprint block when complete, else: Game Day Edition is an independent custom design studio operated from Lithuania. Contact: {email}. C4

**2. What you are buying.** A personalized edition — artwork composed from the photos and details you supply, delivered as digital files and, for printed packages, as printed items made to order for you. Prices are shown in US dollars and include everything except sales tax, which is calculated at checkout. A struck-through price is our own regular price, shown only while a dated sale runs.

**3. Your photos and your athlete's likeness (licence).** You confirm that you are the athlete, or the parent or legal guardian of the athlete; that you own the photos or have the right to share them; and that you grant us a licence to create artwork from the photos and the athlete's likeness for this order — including the right of publicity in a minor's likeness, which as guardian you grant on their behalf. This licence covers the order only. Any use of the finished work in our marketing needs a separate, written, revocable permission. You confirm that any team crest you supply is your school's or club's own and that you may use it. C6

**4. How it is made.** C2 Photos are checked before any art is made; if they cannot carry the likeness we tell you and refund every cent. We create a facial-geometry measurement from your photos to check likeness, with your explicit consent, under the biometric policy at `/privacy/biometric`. Recognizable likeness is a priority, but results depend on the quality, angle and lighting of the photos you send. C15

**5. Approvals.** Two approvals are yours: the reference plate (by email) and the proof (on your order page, or by Etsy message for Etsy orders). C20 One revision is included. Printing starts only after your proof approval.

**6. Cancellation and refunds.** `id="refunds"`
- Until you approve the reference plate you may cancel for any reason with a full refund.
- If the photo check is not passed and you have no stronger photos, the order is refunded in full within 1 business day.
- If after one revision you are still not happy with the proof, we refund every cent.
- After proof approval printing starts and the order cannot be cancelled. If anything about a printed item is wrong when it arrives, we reprint it free or refund you in full and you keep the cards. That remedy covers defects — damage, mis-cutting, wrong color — not a change of mind, and we may decline repeated claims on one order or ask for a photo of the defect.
- Digital files are not refundable after delivery except under the promise above.
- Colors on screen and in print differ slightly; that is not a defect.
- Refunds for orders placed here go to the original payment method within 5 business days of the decision. Refunds for Etsy orders are processed on Etsy.
- Because every edition is personalized, the EU right of withdrawal for goods made to the consumer's specifications does not apply once production has started; for digital content you agree at checkout that delivery may begin immediately and that you waive the withdrawal right once the files are delivered.

**7. Delivery and committed dates.** C10 Printed items ship within the US only; digital and physical orders are US only for now. The dates shown at checkout are counted in US Eastern business days from the order date and are recorded on the order. If we cannot meet a recorded date we tell you in writing with a new date; if the new date misses the occasion date you gave us, you may cancel for a full refund. Printed items may arrive in separate packages. Where a printing partner is used, it receives only the finished artwork and the shipping address.

**8. Reminders and pauses.** When an order needs something from you (photos, an approval), we send up to three reminders over 14 days, then pause the order. A paused order can be resumed within 12 months; after that it is closed and any unfinished balance is refunded under section 6.

**9. The registered card page.** `id="registry"` Every card carries a registered card ID and a QR code that opens its page on this site. Customer pages are unlisted unless you ask otherwise in writing. **We keep every registered page online for at least five years from the order date. If the service ever winds down, we will keep the registry resolving for the rest of that period or tell you how to keep a copy of your page; the domain is locked and set to renew automatically.** "Registered" describes our own edition registry — one edition per athlete, per finish, per season; it is not a copyright registration, and physical cards are not individually numbered.

**10. Use of the artwork.** Finished deliverables are licensed to you for personal, non-commercial use — print them, share them, frame them, give them away. Reselling the artwork or the printed items, or using them to sell goods or services, needs our written agreement. Studio source files, references and methods remain ours. Artwork created with AI tools may not be eligible for copyright protection in some countries; nothing in these terms claims otherwise.

**11. Your responsibilities.** Give accurate details for the card — we print what you approve. Send photos you have the right to share. Do not upload photos of anyone other than the athlete you are ordering for as the subject.

**12. Liability and law.** To the extent the law allows, our liability is limited to the amount you paid for the order. Nothing in these terms limits rights that cannot legally be excluded, including consumer rights under the law of your country of residence. These terms are governed by the laws of the Republic of Lithuania; disputes go to the courts of Lithuania, without prejudice to a consumer's right to bring a claim where they live. EU consumers may also use the European Commission's online dispute resolution platform.

**13. Changes.** We date every version and keep the previous ones; the version in force when you ordered applies to that order.

**14. Independent studio.** C4

---

## 3. SEO — TITLE, META, OG, BREADCRUMBS (per §8; title ≤60, meta ≤155; one H1 per page)

| Route | `<title>` | Meta description | OG text (image per §4.22) | BreadcrumbList |
|---|---|---|---|---|
| `/` | Game Day Edition — Custom Sports Trading Cards & Posters | Custom sports trading cards and posters from your photos. One registered edition per athlete; you approve a proof before anything prints. Not a template. | Hero composite; text "THEIR SEASON DESERVES MORE THAN A CAMERA ROLL." | Home |
| `/trading-cards` | Custom Trading Cards From Your Photos \| Game Day Edition | Custom trading cards composed around your athlete: front and back, square-cut, UV-coated, a registered card ID on the back. Not a template: built for them. | Front + back on stock, price pill `from {from:cards}` | Home › Trading Cards |
| `/posters` | Custom Sports Posters From Your Photos \| Game Day Edition | Custom sports posters composed around your athlete, in two print sizes at 300 DPI. Not a template — art for the wall; the stats live on the card. | Poster in a room, price pill `from {from:posters}` | Home › Posters |
| `/complete-set` | Sports Poster and Trading Card Set \| Game Day Edition | The complete edition from your photos: poster, card front and back, certificate, flip video, wallpapers and the card's own page. Counted, not implied. | Set composite, price pill `from {from:set}` | Home › Complete Set |
| `/senior-night` | Senior Night Gift: Poster & Card Set \| Game Day Edition | A senior night gift built from your athlete's photos: a gold senior edition with class year, career line and senior quote. Files a week before the night. | SR hero with `{chips:seniorNight}` | Home › Senior Night |
| `/senior-night/[sport]` (F2) | {Sport} Senior Night Gift: Poster & Card Set \| Game Day Edition *(trim "Poster & " if >60)* | {Sport} senior night gift from your athlete's photos — a gold senior edition card and poster. Add the date; we schedule the proof against it. | SR sport hero | Home › Senior Night › {Sport} |
| `/how-it-works` | How Custom Trading Cards Are Made \| Game Day Edition | Six gates between your photos and the print — photo check, kit, reference plate, four shots, verification, proof. Made by a person; AI is in the toolbox. | Gate row artefacts | Home › How it's made |
| `/guarantee` | Our Promise: Proof First, Refund in Full \| Game Day Edition | You approve a proof before anything is finalized; if we can't get there, every cent back. Shipping by package, the refund ladder, what new means for you. | Promise in a bracket frame | Home › Guarantee |
| `/photo-guide` | What Photos to Send for a Custom Card \| Game Day Edition | The nine things the photo check looks for — face size, angles, kit, eyes, who's closest to the camera. Send 4–10; we tell you before any art is made. | Good/not-yet grid | Home › Photo guide |
| `/about` | About Game Day Edition \| Independent Custom Card Studio | Who is asking for your athlete's photos: a designer in Lithuania, three professional labs in the US, and a registry that keeps each card's page five years. | Founder + shield | Home › About |
| `/registry` | Look Up a Registered Card \| Game Day Edition | Type the registered card ID from the back of any Game Day Edition card or certificate to open its page — the edition, the finish, the season. | Card back with QR ring | Home › Registry |
| `/faq` | FAQ — Custom Cards, Photos, Delivery \| Game Day Edition | Every question we are asked, in one place: products, photos, sports without numbers, timing, AI, privacy, refunds, Etsy or here, teams and the registry. | Wordmark card | Home › FAQ |
| `/contact` | Contact \| Game Day Edition | How to reach Game Day Edition about an order, a card page, a team or your athlete's photos. | Wordmark card | Home › Contact |
| `/accessibility` | Accessibility Statement \| Game Day Edition | Game Day Edition builds to WCAG 2.2 AA — keyboard, screen readers, reduced motion, real alt text. How to tell us when something is hard to use. | Wordmark card | Home › Accessibility |
| `/privacy` | Privacy Policy \| Game Day Edition | What we collect to make your athlete's edition, who processes it, how long we keep it, and what we never do with it. Written for the parent of a minor. | Wordmark card | Home › Privacy |
| `/privacy/biometric` | Biometric Data Policy \| Game Day Edition | Our written policy for the likeness check: what is measured, why, with whose consent, who can access it, and when it is destroyed. | Wordmark card | Home › Privacy › Likeness check |
| `/terms` | Terms of Service \| Game Day Edition | The terms for custom editions: licence, approvals, cancellation and refunds, delivery dates, the registered card page and its five-year pledge. | Wordmark card | Home › Terms |
| `/c/[cardId]` public | {First} {Last} · {Team} · {Finish} — Registered Game Day Edition | {First} {Last}, {Team}, {season} — a registered Game Day Edition trading card in the {Finish} finish. Scan the QR on the back to open this page. | Front on arena + edition strip + name | Home › Registry › {cardId} |
| `/c/[cardId]` unlisted | {Finish} — Registered Edition | A registered Game Day Edition trading card. This page is unlisted and opens from the card's QR code. (`noindex,nofollow`) | Front on arena, **no name** | none |
| `/c/[cardId]` private | Registered Edition \| Game Day Edition | This card is registered with Game Day Edition. (`noindex`) | Shield only | none |
| not-found | Not Found \| Game Day Edition | — | — | — |

Rules: `alternates.canonical` on every route; unlisted/private `/c` get `noindex` + `X-Robots-Tag`; FAQPage only on `/faq`, `/how-it-works`, product pages (their own visible subset); Article on `/how-it-works`, `/photo-guide`; Product+Offer (site offer only) on the three family pages; Organization + WebSite in layout; Person on `/about`; ImageObject + VideoObject only on public `/c`. Never "youth" in any title or meta.

## 4. KEYWORD → URL OWNERSHIP (data for `lib/seo/intents.ts`; Vitest asserts one owner per intent)

```ts
// lib/seo/intents.ts — one intent, one URL. Head phrases in the measured word order.
export const intents = [
  { intent: "game day edition", url: "/" },
  { intent: "custom trading cards", url: "/trading-cards" },
  { intent: "custom sports trading cards", url: "/trading-cards" },
  { intent: "sports trading cards", url: "/trading-cards" },
  { intent: "athlete trading card", url: "/trading-cards" },
  { intent: "custom basketball cards", url: "/sports/basketball" },   // F3; until then /trading-cards
  { intent: "custom football card", url: "/sports/football" },
  { intent: "custom baseball card", url: "/sports/baseball" },
  { intent: "custom softball card", url: "/sports/softball" },
  { intent: "custom soccer card", url: "/sports/soccer" },
  { intent: "custom volleyball card", url: "/sports/volleyball" },
  { intent: "custom cheerleading trading card", url: "/sports/cheerleading" },
  { intent: "custom wrestling card", url: "/sports/wrestling" },
  { intent: "custom sports poster", url: "/posters" },
  { intent: "sports wall art from photo", url: "/posters" },
  { intent: "gym wall art", url: "/posters" },
  { intent: "dorm room decor", url: "/posters" },
  { intent: "sports room decor", url: "/posters" },
  { intent: "sports poster and trading card set", url: "/complete-set" },
  { intent: "custom sports poster trading card set", url: "/complete-set" },
  { intent: "senior night gift", url: "/senior-night" },
  { intent: "senior night gifts", url: "/senior-night" },
  { intent: "senior night poster", url: "/senior-night" },
  { intent: "senior night ideas", url: "/senior-night" },
  { intent: "senior gifts", url: "/senior-night" },
  { intent: "senior year gifts", url: "/senior-night" },
  { intent: "football senior night", url: "/senior-night/football" },      // F2 children
  { intent: "senior night volleyball", url: "/senior-night/volleyball" },
  { intent: "soccer senior night", url: "/senior-night/soccer" },
  { intent: "cheer senior night", url: "/senior-night/cheerleading" },
  { intent: "basketball senior night", url: "/senior-night/basketball" },
  { intent: "wrestling senior night", url: "/senior-night/wrestling" },
  { intent: "softball senior night", url: "/senior-night/softball" },
  { intent: "baseball senior night", url: "/senior-night/baseball" },
  { intent: "hockey senior night", url: "/senior-night/ice-hockey" },
  { intent: "christmas gifts for football players", url: "/christmas-gift" }, // F2
  { intent: "gifts for young athletes", url: "/christmas-gift" },
  { intent: "team gifts", url: "/teams" },                                    // F2; F1 mailto
  { intent: "end of season team gift", url: "/teams" },
  { intent: "baseball team gifts", url: "/teams" },
  { intent: "how are custom trading cards made", url: "/how-it-works" },
  { intent: "what photos for a custom card", url: "/photo-guide" },
  { intent: "trading card registry", url: "/registry" },
  { intent: "registered edition", url: "/registry" },
  { intent: "trading card qr code", url: "/registry" },
] as const;

// NEVER owned (test asserts absence): bare "<sport> cards", "personalized card", "senior banner",
// "dance senior night", "track senior night", "band senior night", "lacrosse senior night",
// any sport×finish phrase, anything with "youth".
```

Anti-cannibalisation rule: a site page that links to an Etsy listing uses that listing's head phrase in the same word order in its H1/anchor and never contradicts its price, count or timing; the site owns the informational modifiers (ideas, checklist, timeline, sizes, how it's made) and the registry surface.

## 5. DELIVERY CLOCKS — the one wording, everywhere

- **D5 (owner decision):** there is no weekly cap. Committed dates are the chips counted from the **order date** in **US Eastern business days**: digital 1–2 · prints ship 5–7 · sealed pack {LEAD_TIMES.sealedPackWeeks} weeks (pack tier hidden until D18). Senior Night uses its own chip (`FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS · SEALED PACK 3–4 WKS`).
- **Printing starts at proof approval.** A proof left waiting moves the ship date by the same amount — C10 is the sentence, already live in the FAQ and `/terms`; it appears verbatim on `/`, product pages (§3 timeline), `/how-it-works` §5, `/guarantee` §2, `/faq` #14 and `/terms` §7. Never paraphrase it.
- **One delivery claim per page**: the chip. Prose repeats the clocks only through C10.
- **Slip policy** (§5.6): a missed committed date → new date in writing; if it misses the occasion date → full refund offered (`/guarantee` ladder, `/terms` §7).
- **Never faster than the chips** — in copy, FAQ, emails or `/order` states. Never "instant", never "same day".

## 6. OPEN QUESTIONS AND NOTES FOR BUILDERS

1. **Founder city** (D10) — the signature on `/`, `/about` and `/guarantee` omits the city segment until supplied. Founder photo `public/brand/founder.jpg` — absent → render no image.
2. **Imprint** (#6) — footer, `/terms` §1, `/about` §5 use the fallback line until `imprintComplete()`.
3. **Sealed pack lead time conflict** — the spec (D5, §4.2, §4.14) says "2–3 weeks"; `lib/catalog/delivery.ts` and `tiers.ts` say **3–4 weeks**. This pack follows the code (`LEAD_TIMES.sealedPackWeeks`); the tier is hidden anyway (D18). Owner to confirm before D18.
4. **File count** — the audited listing slide says **27 files + 1 live page** (`etsy/LISTING-STATE.md`); the spec's "28-file set" is the same thing with the page counted. Copy says "27 files and one live page"; `TRUE_COUNTS` must not say "28 files".
5. **`{perCard}` helper** — D23's "less than $4.50 per card" must be computed (`perCardAnchor`) in `prices.ts`, never typed; the "$15–30 for a single one" line is dropped unless the range is added to `prices.ts` as data.
6. **`hasPosterArt` per sport** — `sports.ts` has no such flag; the poster picker needs one (today: basketball, football, baseball, softball, soccer, volleyball, cheerleading, wrestling).
7. **Nine senior-night sports** — football, volleyball, cheerleading, soccer, basketball, wrestling, softball, baseball and **ice hockey** (the ninth measured term, `etsy/SEO/KEYWORD-LIST.md`). Confirm hockey.
8. **Response window** (§12 #17) — `/contact` and the accessibility "5 business days" line render only if the owner commits; the photo-check "within 1 business day" appears only in the refund ladder and checkout copy.
9. **Partner name** — the task brief wrote "Print-on-demand poster partner"; the Etsy Production Partner declaration in `docs/SUPPLIERS.md` reads "Print-on-demand poster printing partner". This pack uses the declared wording (C19) so both channels match.
10. **`Verified Etsy purchase`** — the spec's future review block label (§6, F3) would trip the forbidden-strings test; when reviews exist, label them "Etsy purchase · linked" / "Order on record".
11. **`{block:how-its-made}` says "by me"** — D24 unifies to "we" at the next Etsy edit; do not edit the block on the site alone.
12. **Cert / pack art** — the certificate and pack face still print a card count; `/senior-night` §3 and every composite must use count-neutral files only (hash denylist).
13. **Lawyer scope** — §2.16 is a draft for the lawyer (BIPA/CUBI/WA, GDPR 9, COPPA, AI Act 50, LT consumer law, registry pledge, logo rule). The retention years for accounting records (10) and the ODR platform mention are to be confirmed by them.
14. **Art-pending card pages** (§2.15 (2b)) — five public demo IDs printed on live Etsy images have no allowed card art yet (`ART_PENDING`, CONTRACTS §4.10; Figma-export ticket F1-ART-01 and the Nia decision F1-ART-02 in `docs/f1/ASSETS-LISTING.md` §5.1 / §7). The pending sentence is the only wording for that state; builders do not change those records' `visibility`, and the state disappears by itself when `public/cards/<id>/front.webp` + `back.webp` exist.
14. **Certificate with printed posters — owner to confirm the mechanics, not the promise.** The promise is already live: every poster listing says "EVERY SHIPPED PACKAGE INCLUDES a printed Certificate of Authenticity … free of charge" (`etsy/SEO/ready/v3-posters/*-poster.md:41`), and `docs/ETSY-LISTINGS.md` (owner, 2026-09-01) plans it as an A4 certificate printed by the Charlotte poster partner and packed in the same tube (poster menu row B; V3.2 "the certificate is still put into every shipment", COGS unchanged). This pack follows that canon: §2.3 tier rows and once-line, §2.3 spec sheet, §2.6 §6 partner rows, §2.7 shipping table, and the unchanged "every shipped package" lines in §1.2 `TRUE_COUNTS`, §2.10, §2.11 #2 and §2.15 §3 all agree. **Builder:** add `"Free printed Certificate of Authenticity"` to `tierNotes["GDE-ANY-POST-P1824"]` and `tierNotes["GDE-ANY-POST-P2436"]` in `lib/catalog/tiers.ts` (second entry, after the paper line — see §2.3 note); `deliverables.posters` stays without a certificate (the digital tier has none). **Owner:** confirm before the first printed poster order that the A4 certificate is placed in the Printful order as a second item so it ships in the same tube (no test order has been placed — `docs/SUPPLIERS.md`). **If it does NOT ship:** change the Etsy poster listings first (drop line 41 and the certificate from proof slide 17), then narrow every "every shipped package" line on the site to "with every printed card package and set" — §1.2 `TRUE_COUNTS[3]`, §2.10 "The certificate", §2.11 #2, §2.15 §3 CERTIFICATE row, the §2.1 §3 / §2.2 / §2.4 once-lines — and restore a poster-page line reading "The certificate ships with card packages and sets; a poster package is the poster." Never let the site and the listing say different things for a day.
15. **Senior Night hero is composed, not a slide** (§2.5 (1), patched 2026-09-06). Both hero slides on disk carry baked marketing text — the spec's `03-senior-night/01-hero.png` says "NUMBERED + REGISTERED" (S10) over Marcus Ellison basketball SR art, and the live `Exportai Etsy/SN FULL/SN-01-HERO.jpg` says "PRINTED OR DIGITAL · PRINTS SHIP FREE" and "01 / 20" over Tui Fa'agata football SR art — so the site builds the cluster from `03-senior-night/src/sr-{poster,card-front,card-back}.png` with the pills in HTML, and the alt names **basketball**. The only approved fallback is the football poster-on-wall scene with a **football** alt. Media and alt are one decision; the earlier line paired a football alt with basketball art.
