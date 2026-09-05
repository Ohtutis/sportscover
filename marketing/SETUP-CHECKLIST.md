> ⚠️ **OUTDATED (2026-09-02): `FIRST10` is DEACTIVATED** — it was 75 % off with no
> per-buyer cap and lost money on every printed tier. The live code is **`SENIORNIGHT`**
> ($30 off, order minimum $32, 5 uses, one per buyer). Also: US buyers pay NO VAT —
> the +21 % we see in Lithuania is local VAT, so every price below that was derived
> from a VAT-inclusive figure is wrong. Canon: `marketing/CHANNEL-LOG.md`.

# The 15-minute setup — click by click

Everything here needs a logged-in browser session, which is the one thing Claude cannot
borrow while the Chrome extension is disconnected. Either connect it and Claude runs the
whole list, or run it yourself — it is about fifteen minutes. Values are exact; nothing here
needs a decision.

Tick them off in order. The order matters: Offsite Ads before the coupon, domain before the
boards, boards before the first pin.

## A · Etsy — 6 minutes

- [ ] **1. Turn Offsite Ads OFF.** Shop Manager → Marketing → Offsite Ads → opt out.
      Allowed while lifetime sales are under $10 000. Do this FIRST: otherwise Etsy takes
      ~15 % of exactly the discounted orders the launch code is meant to produce.
- [x] ~~**2. Coupon `FIRST10`.**~~ **DONE 2026-08-28 — 75 % (Etsy's ceiling), 10 uses,
      Aug 28 – Oct 27, whole shop, not displayed.** Share URL
      `https://gamedayedition.etsy.com/?coupon=FIRST10`
- [ ] ~~old spec:~~ Marketing → Sales and discounts → New special offer → Coupon.
      - Code `FIRST10` · Percentage off · **85 %** · all listings · no minimum
      - Number of uses **10** · expires **60 days out** · **not** displayed in the shop
      - ($49 → $7.35, ≈ $6.40 net after fees. Real order, covers the generation cost.)
- [x] ~~**3. Three automatic offers.**~~ **DONE 2026-08-28** — `FAVORITE15` 15 %,
      `CARTBACK15` 15 %, `THANKYOU10` 10 %.
- [ ] ~~old spec:~~ Same screen → "Send offers to interested shoppers":
      - Recently favourited items — **15 %**
      - Abandoned cart — **15 %**
      - Thank you for your purchase — **10 %**
- [ ] **4. Share & Save links.** Marketing → Share & Save. Copy one link per listing.
      Etsy refunds **4 %** of any order that arrives through one.
- [x] ~~**5. Paste the links into `marketing/config.json`**~~ **DONE for 5 of 7 listings**
      (football card+poster, cheer card+poster, basketball poster, the set). Missing: the
      **basketball card** listing URL, and every sport that has no listing yet.
- [ ] ~~old:~~ under `links.by_sport`, one line
      per sport and product. Until then the audit will keep saying those pins land on the
      shop front — which they do, and which costs clicks.

## B · Pinterest — 7 minutes

- [ ] **6. Business account** on `editiongameday@gmail.com`, country **United States**,
      language English. (Country decides which feed the pins are seeded into.)
- [ ] **7. Profile**: name `Game Day Edition`, and an about line that is a search phrase,
      not a slogan:
      > Custom trading cards and posters for youth and high school athletes — built from
      > your own phone photos. Senior night, birthdays, end of season. 17 sports.
- [ ] **8. Claim `gamedayedition.com`** — Settings → Claimed accounts → Claim website.
      Take the `<meta name="p:domain_verify" ...>` tag and paste it into this session;
      Claude puts it in the Next.js `<head>` and it ships on the next deploy. (The DNS-TXT
      route works too, via the Vercel dashboard.)
- [ ] **9. Create the 13 boards** — names and descriptions in
      `marketing/templates/BOARDS.md`, copy-paste. Senior Night first in the order while it
      is in season.
- [ ] **10. Upload today's pins** from `marketing/out/<today>/`, captions from `captions.md`
      in that folder, in that order. One board per pin.

## C · Reddit — 2 minutes now, nothing else for two weeks

- [ ] **11. Create the account** with a **human handle**, not the shop name. The account
      that comments is a maker, not a brand.
- [ ] **12. Nothing else.** No posts, no links, no shop name in the bio yet. Two weeks of
      ordinary commenting first — see `templates/REDDIT-POSTS.md`.

## D · Weekly, from week two

- [ ] Pinterest Analytics → Pin stats → Export → `npm run mkt:report -- --export <file>`
- [ ] Six numbers into `marketing/metrics.csv`
- [ ] Read the report's "What to change" and do exactly what it says
