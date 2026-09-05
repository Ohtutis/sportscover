# Marketing engine — Pinterest first, Reddit second

**This file is the start point for external traffic**, the way `etsy/SEO/README.md` is the
start point for on-Etsy SEO. That one answers *why does nobody find us on Etsy*; this one
answers *how do we bring the first buyers ourselves, and what does Claude do about it every
day*.

Written 2026-08-28, on the evidence in `etsy/SEO/ETSY-SEO-FINDINGS.md`: 21 visits, **0 from
Etsy Search**, 0 orders. That is not a conversion problem — Etsy has not shown the shop to
anybody yet. Etsy's ranking loop needs clicks, favourites and above all **sales per listing**
before it opens the tap, and none of those can be manufactured on-platform without breaking
Etsy's rules. So the first ones come from outside.

- **`API-PUBLISHING.md`** — the hands-off route for reels (Meta Graph, Pinterest, YouTube APIs): what the owner sets up once, what Claude runs daily. Written 2026-09-03 after every browser video upload failed.

## The loop this engine drives

```
pins rendered from assets already in the repo   (automated, daily)
        ↓
Pinterest: high-intent boards, one destination per pin   (human paste, ~4 min/day)
        ↓
outbound clicks → Etsy listing → favourite / order
        ↓
listing quality score rises + reviews accumulate
        ↓
Etsy Search finally shows the shop  ← the number we are actually chasing
```

Reddit joins at week 3, not week 1: a fresh account posting a product link gets removed and
the domain gets shadow-filtered, which costs more than the traffic is worth. Reddit's job is
different anyway — it answers *questions*, so it belongs where somebody has already asked one.

## What is automated and what is not

| Step | Who | Cost |
|---|---|---|
| Choose today's 5 pins (sport, occasion, template, asset) | `marketing/engine.py` | 0 |
| Render the 1000×1500 pins | `npm run mkt:day` | ~20 s |
| Write the pin title, description, board, keywords, tracked link | same command | 0 |
| Emit `pinterest.csv` for bulk create | same command | 0 |
| **Get the image into Pinterest** | **human** — drag the day's PNGs into the pin builder as drafts (this browser has no file picker) | ~1 min/day |
| Fill each draft (title, description, link, board, AI flags) and publish | Claude | — |
| **Post or comment on Reddit** | **human** | 10 min/day, from week 3 |
| Record the weekly numbers | human types 6 numbers into `metrics.csv` | 2 min/week |
| Read the numbers, change the plan | Claude, weekly | — |

**Model change, owner's decision 2026-09-01:** Claude publishes — Pinterest pins, Reddit
answers, Facebook answers — through the browser it shares with the owner, but ONLY after
the owner approves the batch in chat first: the text, the images, and where it goes
(board / subreddit / group). Nothing is ever posted unapproved. The cadence stays human
(3–5 pins/day, answers only on Reddit/FB); what changed is whose hands paste it in.
Accounts remain the owner's asset. IG: the owner runs it themselves (1080×1350 assets
from this same engine). New listings (2–4/day) the owner enters too.

## Prep — do these once, in this order

👉 **`marketing/SETUP-CHECKLIST.md` is the click-by-click version of this section**, with the
exact values and nothing left to decide. Use it; the prose below is the reasoning behind it.

1. **Pinterest Business account** on the shop's own email (`editiongameday@gmail.com`),
   country **United States**, language English. A personal account converted to business is
   fine. US country matters: it decides which feed the pins are seeded into.
2. **Claim the domain** `gamedayedition.com` in Pinterest settings (a DNS TXT record or an
   HTML tag in the Next.js `<head>`). Claimed domains get attribution and more distribution.
   Etsy shop URLs cannot be claimed — this is why the site is worth having in the loop.
3. **Create the 13 boards** in `marketing/templates/BOARDS.md`, each with the description
   given there. Board descriptions are indexed; empty boards are dead weight.
4. **Fill `marketing/config.json`** — the card and poster listing URLs (only the $89 set URL
   is known in-repo). Then replace all four with **Share & Save** links from
   Shop Manager → Marketing → Share & Save: Etsy refunds 4 % of any order that arrives
   through one, so every pin should carry one.
5. **Reddit account, created today** even though it posts nothing for two weeks — it needs
   age and comment karma before anything it says is visible. Use a human handle, not the
   shop name: the account that comments is a maker, not a brand.
6. **Etsy coupons — exact settings, the maths and the outreach messages are in
   `marketing/templates/FIRST-SALES.md`.** In short (Shop Manager → Marketing → Sales &
   Discounts):
   - ~~`FIRST10`~~ **DEACTIVATED 2026-09-02** (it was 75 % off with no per-buyer cap - a loss on every printed tier). Live code is now `SENIORNIGHT`: $30 off, order minimum $32. That is $4.99 on a
     $49 item and ≈ $6.40 net after fees — the order stays real and it covers the
     generation cost.
   - **Automatic offers**: recently-favourited 15 %, abandoned cart 15 %, thank-you 10 %.
     Etsy sends these itself.
   - **Opt out of Offsite Ads** while lifetime sales are under $10 000, or Etsy takes
     another 15 % of exactly the orders this code is meant to produce.
   ⚠️ A discount is allowed; **a discount in exchange for a review is not.** Ask for the
   review separately, after delivery, with nothing attached to it.
7. Optional but it unlocks bulk upload: publish the day's PNGs to
   `public/pins/` on the site, deploy, and set `public_base` in `config.json`. Pinterest's
   bulk-create CSV needs **publicly reachable image URLs**; without them the CSV is only a
   copy-paste sheet.

### The AI disclosure

Pinterest's pin builder asks two direct questions: is this AI-modified, and does it include
an AI-generated person. For these pins both answers are **yes** — the demo roster is
generated — so both are ticked on every pin. It may cost some distribution. Answering "no"
to a platform that asks directly is the kind of thing that costs an account, and it would
also contradict the disclosure this project already makes on Reddit.

(For a real customer the likeness is their own child's, rebuilt from their photos. That is a
different claim, and it is the one the listings make.)

## What Claude cannot do for you, ever

Accounts and publishing. Creating a Pinterest/Reddit account, claiming the domain, making
the coupon codes, uploading a pin, posting a comment — all of it is yours. Claude renders,
writes and measures; the account is the asset and it stays in your hands.

And the forbidden lever, restated because it is the one that ends a shop: no self-purchases,
no bought reviews, no second account favouriting anything. A deep discount to somebody who
genuinely wants the product is fine and is the plan; a scripted sale is not.

## The daily command

```bash
npm run mkt:day
```

Renders today's pins into `marketing/out/<date>/` plus:

- `captions.md` — paste-ready title / description / board / tracked link, in upload order
- `pinterest.csv` — Pinterest bulk-create columns (needs `public_base` to be useful)
- `audit.md` — the mechanical defect list for the batch (empty is the normal case)
- `_contact-sheet.png` — the whole batch in one strip, for the ten seconds of eyes it needs

Other forms:

```bash
npm run mkt:pins -- --day 2026-09-01 --days 7      # a week in advance, one sitting
npm run mkt:pins -- --day today --video            # also cut a 2:3 video pin
```

The queue is **deterministic from `start_date`**: the same day always yields the same five
pins, so re-running never re-posts different art under a caption that is already live.

### Channel codes and where they are handed out (2026-09-01)

Three promo codes, all 75% off, 10 uses each, single use per buyer, **not shown in the shop** —
they only exist if we hand them out, so the limit is a ceiling, not a plan:

| Code | Channel | Live until |
|---|---|---|
| `FIRST10` | Pinterest + anything without its own code (Etsy messages, direct) | Oct 28 |
| `REDDIT10` | Reddit — in a DM reply, never in a public comment | Nov 1 |
| `FACEBOOK10` | Facebook groups — in a DM reply | Nov 1 |

Never paste a code into a public thread: within a day it is on the coupon-scraper sites and
everyone uses it. And never trade a code for a review — Etsy policy, and the review is worth
more than the order. What the code costs us per tier is in the economics note below.

⚠️ The shop-wide **−30% sale expires Sep 24, 2026**. Every V3 price assumes it is running; if
it lapses, every listing jumps to the base price. Renew before then.

### Reddit: how a reader actually reaches us (2026-09-01)

The profile is the landing page, not the comment. Set up and live:

- Display name **Ohtutis**, avatar, bio, and a **social link to the Etsy shop** — subs that ban
  links in comments (r/somethingimade says it outright) still allow "it's in my profile".
- A **profile post** — posts to `u/<name>/submit/` obey no subreddit rules, so the before/after
  portfolio lives there permanently and every helpful comment points at it.
- r/Gifts is the only sub where a direct Etsy link is welcome (its rules prefer them).
- DMs: inbound only. r/GiftIdeas bans even *asking* for a DM, and an unsolicited DM from a
  1-karma account reads as spam.

Karma reality: the account is 2.5 years old (passes age gates) but has **1 karma**, so the
first ~10 days are comments only — no links anywhere.

### Publishing a pin (2026-09-01, verified working)

Claude publishes the approved batch itself, through the **Chrome extension** (`claude-in-chrome`),
because that is where a real file upload works. The app's own browser pane cannot: Pinterest's
CSP blocks `connect-src` to localhost, so a page-side `fetch` of a local PNG is refused, and the
pane has no file-upload tool. Etsy rejects the same injection outright, so Etsy media stays manual.

Sequence per pin (deviating from it is what costs the time):

1. `pin-creation-tool` → `find` the file input → `file_upload` with the PNG.
2. Title and Link: native-setter injection on the `<input>`s works.
3. Description is a Draft.js `contenteditable`. **Click it and type with real keystrokes.**
   `document.execCommand('insertText')` reports success, leaves the editor mounted-but-dead, and
   the field then rejects everything until a page reload.
4. Board: open the dropdown, type into the dropdown's own search (there are two inputs whose
   placeholder is "Search" — the page-global one sits at y<200; take the one below it).
5. **Reload the page and reopen the draft from the right-hand panel.** After a long edit session
   Publish goes disabled and stays disabled; a reload restores it. The AI-disclosure flags do NOT
   survive in the draft, so set them after the reload.
6. Both AI flags on ("Mark as AI-Modified" + "includes an AI-generated person"), then Publish.

Rate limit: after roughly three uploads with several reloads each, Pinterest starts serving an
empty body on every page. That is the account being throttled, not a bug — stop for the day, the
unpublished draft is saved. Three pins a day is the cadence anyway.

### Printed first, digital second (2026-09-02)

Captions used to end "Digital files, printable at home or at any print shop" — which reads as
an instruction to buy the cheapest tier. The printed tiers are the ones that carry the margin,
the review photos and the supplier test, so the line now leads with **"Printed and shipped free
in the US, or print-ready files if you would rather print it yourself."** Digital stays
available; it just stops being the recommendation.

Posters get the same billing as cards: `product` (the poster frame) is in the rotation as often
as `spec`, and `transform` alternates card and poster by position. A sport with no poster art
falls back to its card rather than faking one.

### Frames are per platform, and the art is composed here (2026-09-01)

Marketing frames are **assembled by `gen_pins.py` from the parts** — the athlete's own before
photos, the finished card or poster, the surface, the type — not exported from Figma and
re-uploaded. Figma gives the design language; the file is built in code. A listing slide
carries its own "02 / 20" numbering, and posting the same export everywhere makes each channel
look like one repeated advert.

`t_transform` is that frame: photos in on the left, product out on the right, one honest
sentence underneath. Its caption adapts — a sport with no jersey number is never promised one.

Sizes come from `CANVAS` and are chosen **before** rendering, never cropped after:

| Target | Frame | Why |
|---|---|---|
| Pinterest | 1000×1500 (2:3) | what Pinterest ranks and crops for |
| Reddit | 1080×1080 | its gallery viewer is a landscape box; a 2:3 frame sits in it with blurred bars |
| Instagram | 1080×1350 (4:5) | the tallest the feed shows uncropped |

`with canvas("reddit"): ...` swaps the frame; the transform block centres both ways, so the
same code fills any of them without dead margins.

### What a pin may show (2026-09-01)

A pin shows the **product**: finished poster art, or the card front/back. It never shows an
athlete pose render dressed up as a product — that shipped once (`product` template framed a
bare studio photo of a kid under the headline "A POSTER OF YOUR OWN KID") and it is the same
defect as a before/after whose "after" is athlete art. `engine.posters_for(slug)` holds the
real poster art (9 sports today, all 3:4, from `etsy/listing-images/*/src/`). A sport with no
poster art does not get a product pin — the queue falls back to the card pin, and `audit.md`
flags any product pin that lost its art. The art is pasted whole, at its own ratio: cropping
a poster misrepresents the thing being sold.

### How many pins a day

**Three a day for the first three weeks, then five.** That ramp is in `engine.RAMP`.

The reasoning: a young account is being judged on whether it is legible, not on whether it is
prolific — Pinterest has to work out what this account is about before volume helps. The
"25 pins a day" number still floating around is from the Tailwind era and is now
counter-productive; current third-party consensus lands at 1–5 fresh pins a day for a new
account, every day, beating any burst. Five is the ceiling worth reaching here anyway,
because at five a day the 22-athlete library produces 30 days of pins with no composition
repeating inside ten days — and past that the repeats start.

⚠️ Changing the ramp **re-deals every future pin** (the queue is one continuous walk).
Change it before posting starts.

### The mix

Templates come off an eleven-slot ring walked by the global counter — before/after ×4,
spec ×2, product ×2, slide ×2, list ×1 — so the proportions hold whether the day is three
pins or five. (Indexed per-day instead, three-pin days silently never reached slide or list
at all.)

| Template | Share | Why it exists |
|---|---|---|
| `beforeafter` | 36 % | An ordinary phone photo above; the real card, **front and back**, below. The after half must be the PRODUCT — athlete art there reads as two photographs of a kid and sells nothing. Cards come from `marketing/cards/<sport>-{front,back}.png`, exported from the per-sport Figma files. It is still the only pin that proves the INPUT was ordinary — the workhorse. |
| `product` | 18 % | The art as a **printed poster** in a white frame. A pin that shows only art reads as a stock sports picture; the frame is what says *product*. |
| `spec` | 18 % | The category's own convention: light ground, the card big, the promises listed down the side. Every competing shop on this query runs a version of it, which is evidence about what this audience *recognises*. Runs for every sport now that all 15 have card renders; without one it falls back to `product`. |
| `slide` | 18 % | An existing Etsy slide, re-framed to 2:3 over its own blurred backdrop. Free reuse of 60 finished slides — but only the ones that survive the 236 px grid (`slide_keywords` in the config). |
| `list` | 9 % | A text pin — "5 senior night gift ideas that aren't flowers". Pinterest search rewards these, and they rank for the *occasion* rather than for the product. |

Sports are weighted by demand (basketball / football / volleyball / soccer get roughly a
third of all pins), and the occasion is weighted by **season**: in September–November,
three of every five pins are Senior Night.

### What the competition is doing, and what to take from it

Searching this niche on Pinterest shows the top of the results held by Etsy sellers who
**reposted their own listing images** — light background, the card large, a checklist of
features down the side, shop name across the top. Two things follow, and they point in
opposite directions on purpose:

- **Take the form.** That layout is what this audience recognises as "custom sports card",
  and refusing to speak the category's visual language is a way of being ignored, not a way
  of being distinctive. Hence the `spec` template.
- **Keep the differentiator.** Not one of them shows the **transformation**. They show a
  finished card; we can show the ordinary phone photo it came from. That is the one thing
  the competition structurally cannot copy, because they do not rebuild anything.

⚠️ A caveat about that evidence: Pinterest results are **personalised**, and a logged-in
account that has been researching this niche is shown what it has been looking at. So treat
"everyone at the top does X" as a hypothesis the weekly report tests, not as a measurement.

## Cadence, and the lines not to cross

- **3/day, then 5/day — every day.** Not 30 in one sitting. A young account that posts 30
  pins in an hour gets distribution-limited, and the point of a daily drip is that Pinterest
  learns which boards and which sports get saved.
- **One board per pin**, never the same board twice in a row within a day.
- **Never the same image twice.** Duplicate images across boards is the oldest Pinterest
  spam signal there is. The queue guarantees unique files by construction.
- **The link must resolve to the thing in the picture.** A cheer pin that lands on a
  basketball listing is the fastest way to teach Pinterest the pin is bait.
- **No engagement pods, no bought saves.** Same rule as Etsy: the account is the asset.

## Quality — three gates, because "make good pins" is not a plan

A pin cannot be made to convert by deciding it should. What can be done is make every pin
**checkable** and every pin **distinguishable**, then let the measured winners multiply.

**Gate 1 — mechanical, every render (`audit.md`).** Fails the batch loudly on:

- the athlete's head not guaranteed inside the frame (this is why `cover_subject` exists —
  the first batch shipped two decapitated pins);
- a headline that renders under 46 px, i.e. under 11 px in Pinterest's 236 px grid — a grey
  smear instead of a claim;
- a pin whose link goes to the shop front instead of that sport's listing;
- the same composition inside a 10-day window (Pinterest treats near-duplicates as one pin);
- the athlete filling less than a quarter of the source frame;
- a label that does not match the link it sits above.

**Gate 2 — ten seconds of eyes (`_contact-sheet.png`).** The whole batch as one strip at pin
size. This is where a machine will never help: whether the moment is any good, whether the
kid looks like a kid you'd want a card of, whether a kit detail is wrong. Look at it before
uploading. The mechanical gate has never caught a bad photograph and never will.

**Gate 3 — weekly arithmetic (`npm run mkt:report`).**

```bash
npm run mkt:report -- --export ~/Downloads/pin_stats.csv
```

Every pin carries `utm_content=<pin id>` into its link and the id encodes date, template and
sport — so Pinterest's own analytics export (Analytics → Pin stats → Export) joins straight
back to the queue with no bookkeeping. The report ranks **templates, boards, sports, occasions and keywords** by clicks per pin
(never by total — whatever got more pins always wins on total, which tells you nothing) and
names four things:

- which template to shift the ring towards,
- which sports carry the account and which to demote in `SPORTS`,
- **which boards earn saves and which do not.** A board with impressions and zero saves is
  aimed at the wrong search; rewrite its description before adding pins to it. Keywords are
  ranked only when 3+ pins carry them — one pin ranks on its own luck, not the keyword's —
  and a keyword that keeps earning belongs in the matching Etsy listing's tags too, which is
  how the Pinterest data feeds back into Etsy SEO,
- **pins with 200+ impressions and zero clicks** — that is a thumbnail problem specifically,
  not a price problem and not a listing problem. It is the single most useful line in the
  report, because it separates "nobody saw it" from "they saw it and did not care".

The order the gates fail in matters: gate 1 says the pin is not broken, gate 2 says it is
worth looking at, gate 3 says whether anyone agreed.

## Reddit — starts week 3, and it is not a posting channel

Reddit's rule everywhere that matters is: *self-promotion is allowed only from somebody who
was already part of the conversation*. So the sequence is fixed:

1. **Weeks 1–2 — warm-up.** 2–3 genuine comments a day, no links, in the subs listed in
   `marketing/templates/REDDIT-POSTS.md`. Target ≥ 300 comment karma and a 2-week-old
   account before anything else.
2. **Week 3 — answer, don't announce.** The highest-value Reddit surface for this product is
   somebody asking *"gift for a basketball player?"* in a gifts sub. The answer template
   discloses that you make it, in the first line, every time.
3. **Week 4 — one maker post.** The before/after process post, in a maker sub, with the AI
   step stated plainly. It either lands or it doesn't; it is one post, not a campaign.

⚠️ **Subreddit rules change and cannot be recalled from memory.** Before the first post in
any sub, read its rules and its "no self-promotion" wording — ask Claude to fetch them with
the in-app browser and write the verdict into the template file. A sub that bans promotion
is a comment-only sub for us, permanently.

## The numbers, and when to change the plan

Type six numbers into `marketing/metrics.csv` every Monday (Pinterest Analytics + Etsy Stats):

`date, pin_impressions, pin_outbound_clicks, etsy_search_visits, etsy_social_visits, favourites, orders`

Milestones, in order — each one is a different problem solved:

| Milestone | What it proves | If it stalls |
|---|---|---|
| Pinterest impressions > 1 000/wk | the account is being distributed | boards/descriptions too thin; claim the domain |
| Outbound clicks > 50/wk | the **pin image** works | the thumbnail is the problem — before/after harder, bigger type |
| Etsy `social` visits ≈ outbound clicks | the link is tracked correctly | check Share & Save / UTM |
| Favourites, then the **first order** | the listing converts | price, description, or the hero image |
| **Etsy Search visits 0 → 5 → 20 → 50** | Etsy has started distributing | *this* is when title/tag rework is finally justified |

Until Etsy Search moves off 0, **do not rewrite titles and tags** — there is no data to
rewrite them against, and the 30-day freeze on live listings costs more than the guess wins.

## Files

```
marketing/
  README.md          this file
  config.json        links, UTM, slide sources, public_base   ← the only file you edit
  engine.py          sports, occasions, boards, copy formulas, the deterministic queue
  gen_pins.py        the four pin templates + captions.md + pinterest.csv
  templates/
    BOARDS.md            the 13 boards and their descriptions
    REDDIT-POSTS.md      comment + post templates, sub list, the rules check
    FACEBOOK-GROUPS.md   sports-parent group post, and how to ask permission first
  metrics.csv        six numbers a week
  LOG.md             what was posted, and what happened
  out/<date>/        the day's pins, captions.md, pinterest.csv
```
