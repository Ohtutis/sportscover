# The daily routine — three channels, one loop

Written 2026-09-02. The division of labour, decided by the owner: **Claude prepares
everything and publishes; the owner approves the content and the target before anything
goes out.** Nothing in this file is posted without that approval — the approval is per
batch, not a standing permission.

Every step below ends in one of two places: a thing to approve, or a number to read.

---

## Every morning (Claude, ~15 min, before the owner reads anything)

**1 · Read the results first.** In this order, because the earlier ones change the plan:

| Check | Where | What it changes |
|---|---|---|
| Orders | Etsy → Orders | An order stops routine work. Go to "When the first order lands". |
| Visits + code used | Etsy → Stats | Which channel actually works; the code is the attribution |
| FB post state | the group | pending / live / declined — a decline is information, not a failure |
| Reddit | profile + inbox | karma, replies, removed comments |
| Pinterest | the two live pins | outbound clicks, saves |

**2 · Render the day's pins.** `npm run mkt:day` → `marketing/out/<date>/`. Read `audit.md`
and the contact sheet with actual eyes before proposing anything.

**3 · Find the day's Reddit threads.** Fresh (<24 h) threads in r/Gifts, r/GiftIdeas,
r/sportsphotography where the account can genuinely help. Draft the comments in full.

**4 · Check the Facebook queue.** Whether a pending post cleared; whether a group approved
membership; whether anyone replied.

**5 · Post the batch for approval** — pins with their captions and boards, comment texts
with their thread links, any Facebook text with its group. One message, everything visible.

## After approval (Claude publishes)

- **Pinterest** — up to 3/day. Chrome extension only (the app pane cannot upload). Reload
  between pins; set both AI-disclosure flags after the reload, then publish.
- **Reddit** — max 2 comments/day while karma is under ~20, never two in the same sub in a
  row, never a link in a comment.
- **Facebook** — max 2 comments/day, and a product post only where the group's own rules
  allow it. Never a DM to a stranger.

Then update `CHANNEL-LOG.md`. An action that is not logged did not happen.

## Short video — the format this product is native to

`npm run mkt:video -- --sport football --product card` builds a 7.3 s vertical clip
(1080x1920, silent) from the same parts as the stills: two of the athlete's real before
photos, a white cut, then the finished card or poster settling onto the brand surface with
the shop address. `--platform square` gives a 1:1 version for the feed.

Why silent: TikTok and Reels replace the audio with the creator's own track, and no licensed
music means no takedown. Add sound in the app when posting, not here.

Rules that already cost a rebuild once: the artwork lives in a fixed box and only breathes
inside it — never let the caption's position depend on the artwork's height, or the last
frame ends with the type sitting on the wordmark.

Cadence: one clip a day is plenty. The same clip goes to TikTok, Reels and Shorts; posting it
three times is three chances at the same cost.

## Weekly (Mondays)

- Re-read the rules of every group and subreddit in use — they change and admins change.
- Six numbers into `marketing/metrics.csv`: visits, favourites, orders, revenue, pins live,
  comment karma.
- Decide one thing to stop and one thing to double. A channel with no clicks after two weeks
  is not "early", it is answered.

## When the first order lands

This is the point of everything above, so it takes priority over the routine:

1. Build it properly and fast; the proof goes out the same day if the photos allow.
2. Ask for feedback — never in exchange for the review, which Etsy forbids. Ask separately,
   after delivery, and ask for photos of the printed item if it was a printed tier.
3. If it was printed: that is also the **supplier test** (Bay / Printful / QPMN). Record what
   arrived, how long it took and what it looked like in `docs/SUPPLIERS.md`.
4. Only then go back to the routine.

## Standing rules that do not need re-deciding

- Codes are private and handed out, never pasted into public threads. Live: `SENIORNIGHT`
  ($30 off, order minimum $32, 5 uses, one per buyer), `REDDIT25`, `FACEBOOK25` ($25 off,
  10 uses, one per buyer). `FIRST10` was deactivated 2026-09-02 - do not hand it out.
  Prices are USD and carry NO VAT for a US buyer; what we see in Lithuania is 21 % higher.
- Every frame is composed by `gen_pins.py` from real parts, at the target platform's size.
  Never re-upload a Figma listing slide.
- A pin shows the product, and a caption never promises a jersey number to a sport that has
  none.
- The owner's personal Facebook account carries the risk: no cold DMs, no repeated text
  across groups, ≤2 groups joined per day.

## Social batch — Instagram, TikTok, Facebook Page, YouTube

`npm run mkt:social` renders a full batch: six post concepts and four 14 s reels, each at
every platform's own size and safe zone. Batch 01 is already rendered in `marketing/social/`
and **nothing in it has been posted**.

Daily, per platform, one piece at a time:
1. Open `marketing/social/<platform>/README.md` order and pick the next unposted piece.
2. Bring it here with its caption from `captions.md` for approval before anything goes up.
3. On upload, add trending in-app audio to reels — the files are silent on purpose.
4. Log it in `CHANNEL-LOG.md`. If it is not in the log, it did not happen.

Cadence to start: **1 reel + 1 post per platform per day, staggered** — not all four platforms
at the same hour, and never the same piece everywhere on the same day. New accounts that post
four identical things in one burst look automated, and all four of these apps act on that.
