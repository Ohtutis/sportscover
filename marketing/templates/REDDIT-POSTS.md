# Reddit — templates, and the rules that decide whether they are allowed

Reddit is the second channel, not the first, and it is worth being blunt about why: this is
a product post from a shop with no history, and every sub worth reaching has a rule about
exactly that. The templates below are written to be *allowed*, which means they lead with
disclosure and with something useful, and the link is never the point of the comment.

## Before the first post in ANY sub — the rules check

Subreddit rules change, and they are not something to recall from memory.

✅ **reddit.com IS reachable** (corrected 2026-09-01, via the Chrome extension). The rules
check no longer needs a human: `fetch('https://www.reddit.com/r/<sub>/about/rules.json')`
from a reddit.com tab returns every rule with its full text, and `about.json` returns the
subscriber count. Re-run it before posting — rules change, and the verdicts below are dated.

Three questions decide the verdict, in this order:

1. Is there a rule with "self-promotion", "advertising", "no sales", "no shops" or a
   ratio rule (e.g. 9:1)? → **comment-only**, permanently.
2. Is there a promo day / megathread / flair for makers? → **post, on that day only.**
3. Is there a rule about **AI-generated content**? If AI work is banned, the maker post
   does not go there in any reworded form.

| Sub | Size | Verdict — checked 2026-09-01 |
|---|---|---|
| **r/Gifts** | 338k | ✅ **POST ALLOWED, and Etsy links are explicitly preferred**: "Links from trustworthy sites like Amazon, Etsy, Ebay etc are preferred." Cap: own content <10% of your activity. **This is the primary Reddit target.** |
| r/GiftIdeas | 583k | ⚠️ Self-promo POSTS banned outright; comments capped at 10% (9 clean per 1 promo, permanent ban for breaking it). Also bans promoting "AI card generators… low-effort AI products". Comment-only, and never frame us as a generator. |
| r/somethingimade | 3.1M | ❌ **REMOVED from the plan.** "Handmade Work Only" + "No AI Generated Content" + no self-promo links in posts OR replies. The maker post this file used to send here is not allowed in any rewording. |
| r/daddit | 2.0M | ❌ Post-wise: "No Self Promotion or Solicitation" AND "No AI Posts". Comment-only, product never named. |
| r/Mommit | 2.7M | ❌ "No blogs, surveys or promotional posts". Comment-only, product never named. |
| r/Parenting | 8.3M | ⬜ rules not yet pulled — answer surface at best. |
| r/Cheerleading | 11.7k | ⚠️ No self-promo rule found, but "Do not identify individuals or teams" — our art carries names and club crests, so images are a problem there. Text answers only. |
| r/YouthSports, r/highschoolsports | 48 / 82 | ❌ Dead and restricted. Ignore. |

Rule of thumb that holds almost everywhere: **10 useful comments per 1 self-referential
one**, and never a link in a top-level post to a shop.

## Phase 1 · warm-up (weeks 1–2, no links at all)

2–3 comments a day, on things you actually know: photography, youth sport, printing,
parenting logistics. Target ≥ 300 comment karma and an account older than 14 days. This
phase has no template — a template is what gets it removed.

## Phase 2 · the answer (from week 3)

Only under a post where somebody asked. Never volunteered.

> Full disclosure, I make these, so take it with the appropriate salt.
>
> For a {SPORT} player that age the thing that actually lands is something with **them** on
> it rather than the sport in general — a poster or a card with their own kit, number and
> club crest. Parents already have the photos on their phone; you don't need a
> photographer.
>
> If you want to do it yourself: a face shot in daylight, one full-body in the kit, one of
> the back of the jersey, and the crest close up is all it takes for a decent print. Cheap
> version is a photo book; the version I make is here → {LINK}
>
> Happy to answer if you'd rather do it yourself.

Rules for this comment: disclosure in line 1; a genuinely useful DIY answer even if they
never click; one link, at the end; never posted twice in the same thread.

## Phase 3 · the gift-idea post — r/Gifts only (week 3+, once)

⚠️ The old "maker post" targeting r/somethingimade is dead (AI ban, see the table). r/Gifts
is the one place that both allows the post and prefers an Etsy link. Post it as a GIFT IDEA,
not as a portfolio piece.

Title (no shop name, no price, no "check out"):

> I've been rebuilding ordinary phone photos of youth athletes into trading cards — here's
> the same kid, before and after

Body:

> My {SPORT}-playing {RELATION} kept ending up in blurry sideline photos, so I built a
> pipeline that rebuilds the same person in their real kit — same face, same number, same
> club crest — and lays it out as a trading card and a poster.
>
> The first image is the actual phone photo the parent sent. The second is the finished
> card. Nothing about the kit is invented: the crest and the number come from the photos,
> and if the sport doesn't put a number on the back, there isn't one on the back.
>
> The likeness step is AI (generation is guided by the photographs, and every frame is
> checked against a locked identity plate before it ships) — saying that up front because
> this sub cares, and it should.
>
> Happy to go into the process. Ask me anything about how the identity is kept stable, it
> was the hard part.

- Post the **images**, not a link. Answer link requests in the comments.
- If the sub bans AI work: don't post. Do not reword it to get past the rule.

## What never to do

- No brigading, no alt accounts, no "my friend found this shop".
- No posting the same text in five subs — it is detected across subs, not within one.
- No DMs to people who commented.
