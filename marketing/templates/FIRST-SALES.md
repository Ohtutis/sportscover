> ⚠️ **OUTDATED (2026-09-02): `FIRST10` is DEACTIVATED** — it was 75 % off with no
> per-buyer cap and lost money on every printed tier. The live code is **`SENIORNIGHT`**
> ($30 off, order minimum $32, 5 uses, one per buyer). Also: US buyers pay NO VAT —
> the +21 % we see in Lithuania is local VAT, so every price below that was derived
> from a VAT-inclusive figure is wrong. Canon: `marketing/CHANNEL-LOG.md`.

# The first 10 sales — the coupon, the maths, and what to say

The point of the first ten orders is not margin. It is three things Etsy's ranking loop cannot
start without: **conversion data on a listing**, **reviews**, and a shop that has sold
something. Everything below is priced to make those three cheap without making them fake.

## Why the order is paid and not free

A free giveaway produces no conversion event, no review eligibility, and nothing Etsy's model
reads as demand. A **real order at a real price** does — and a buyer who paid $7 behaves like a
buyer, not like a favour. It also keeps the whole thing honest: the person wanted the thing and
paid for it.

## Created and live, 2026-08-28

| What | Code | Value | Note |
|---|---|---|---|
| Launch coupon | `FIRST10` | **75 % off**, whole shop, **10 uses**, Aug 28 – Oct 27 | 75 % is Etsy's ceiling for a percentage code — 85 % is rejected. Share URL: `https://gamedayedition.etsy.com/?coupon=FIRST10` |
| Favourited item | `FAVORITE15` | 15 %, sent automatically, expires 60 days after it's sent | |
| Abandoned cart | `CARTBACK15` | 15 %, sent automatically | Highest-converting of the three |
| Thank-you (after an order) | `THANKYOU10` | 10 %, sent automatically | Turns order 1 into order 2 |

A **30 % shop-wide sale** also runs to Sep 24. If a coupon stacks on top of it the price
falls further — the table below covers both cases, and both clear the target.

## The maths (US buyer, LT seller, digital item)

Etsy takes roughly: **6.5 % transaction + ~3 % + $0.25 payment processing** (plus the $0.20
listing fee already paid). So net ≈ `0.905 × price − $0.25`.

List prices are **$41.99** (card, poster) and **$69.99** (the set).

| What the buyer pays | You net | |
|---|---|---|
| $10.50 — `FIRST10` on $41.99, no stacking | ≈ **$9.25** | comfortable |
| $7.35 — `FIRST10` on top of the 30 % sale | ≈ **$6.40** | still comfortable |
| $17.50 — `FIRST10` on the $69.99 set | ≈ **$15.60** | |
| $12.25 — same, stacked with the sale | ≈ **$10.85** | |

Every row clears the €3–5 target, so the stacking question does not need answering before
the code goes out.

Offsite Ads: while lifetime sales are under $10 000 the shop can **opt out** — do that before
running the code, or Etsy takes another 15 % of any order that arrives through its ads.

## The coupon — exact settings

Already created — this is the record of what was set.

| Field | Value |
|---|---|
| Code | `FIRST10` |
| Type | Percentage off |
| Amount | **75 %** (Etsy's maximum; it rejects anything above it) |
| Applies to | All listings |
| Minimum order | none |
| Number of uses | **10** |
| Duration | Aug 28 – Oct 27 2026 |
| Visible in shop | **No** — it is handed out by hand, not shown on the listing |

⚠️ Do not attach the code to a review request. A discount is allowed; a discount **for** a
review is not, and it is the one thing that can cost the shop its account.

## The three automatic offers — set once, run forever

Same screen, "Send offers to interested shoppers". These are Etsy's own messages, sent by
Etsy, and they are the highest-converting thing a shop with no traffic can switch on.

All three are created. Etsy requires each to carry its own code.

| Offer | Discount | Why |
|---|---|---|
| **Favourited item** (`FAVORITE15`) | 15 % | Someone favourited and left. This is the warmest audience the shop has. |
| **Abandoned cart** (`CARTBACK15`) | 15 % | They got as far as the cart. Highest conversion of the three. |
| **Thank you** (`THANKYOU10`) | 10 % | Turns order 1 into order 2, and a second order is what makes a review likely. |

## The outreach — who to send `FIRST10` to

Not "everyone I know". People who **have a young athlete**, because they are the only ones who
will still be happy with it a week later. Ten of them is the whole target. US contacts first —
they can buy without a currency or shipping thought.

### The message (EN, for US contacts)

> Hey — I've built a thing and I need ten real people to run it end to end before I open it
> properly.
>
> It turns ordinary phone photos of a kid into a proper trading card and poster — their own
> kit, their number, their club crest. Not a filter; the whole thing is rebuilt.
>
> If {KID} would like one, here's a code that takes it to about $10: **FIRST10** on
> {LISTING LINK}. That's below what it costs me to make, which is fine — I need the first ten
> to be real orders so I can see what actually happens.
>
> You send 3–4 photos (a face shot in daylight, one in the kit, the back of the jersey, the
> crest). I send a proof first, you tell me what to change.

### The message (LT, savo kontaktams)

> Sveiki — pastačiau daiktą ir man reikia dešimties tikrų žmonių, kurie jį pereitų nuo pradžios
> iki galo, kol dar neatidariau normaliai.
>
> Iš eilinių telefono nuotraukų padaro vaikui kolekcinę kortelę ir plakatą — su jo paties
> apranga, numeriu ir klubo herbu. Ne filtras, viskas perpiešiama.
>
> Jei {VAIKAS} norėtų, štai kodas, su kuriuo išeina apie 10 $: **FIRST10** čia {NUORODA}. Tai
> mažiau, nei man kainuoja pagaminti — sąmoningai, nes man reikia, kad pirmi dešimt būtų tikri
> užsakymai.
>
> Atsiunti 3–4 nuotraukas (veidas dienos šviesoje, viena su apranga, marškinėlių nugara,
> herbas iš arti). Pirma atsiunčiu peržiūrą, pasakai, ką keisti.

### After delivery — the review ask, sent separately

Wait until they have had the files a day or two. One message, nothing attached to it:

> Glad it landed. One thing that would genuinely help a shop this new: if you have a minute,
> a review on Etsy. No pressure at all — and it doesn't need to be glowing, honest is more
> useful to me.

## Order the first ten in

Each one is a real order through the normal path: `art:intake` on their photos →
`art:athlete --stage identity --from-photos` → proof → delivery. Time it. If an order takes
more than ~30 minutes at this volume, that is the thing to fix before traffic arrives, not
the pins.
