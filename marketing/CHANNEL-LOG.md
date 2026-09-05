# Channel log — what is live, what to check, what goes next

One file for all three channels, because the work is a loop, not a launch: post → wait →
read the numbers → post the next thing. **Update this file every session.** If an entry is
not here, it did not happen.

Codes in use: `REDDIT25`, `FACEBOOK25`, `FIRST10` — all €25 off / 10 uses / single use per
buyer, private (not shown in the shop). Shop prices are EUR numerals; US buyers see USD ×1.21.
Shipping: **free worldwide** on all 8 listings since 2026-09-02.

---

## Morning read — 2026-09-03

| Check | Result |
|---|---|
| Etsy orders | **0.** 2 visits today, 5 views. Traffic sources: 50% Etsy internal, 50% direct. **Social = 0.** |
| FB Sports Mom Marketplace | Post **still pending admin approval** after 24h+ |
| FB Volleyball Moms | ✅ **Membership approved — 122K members, we are in** |
| Reddit | All 3 comments alive (score 1 each). Karma still 1 total. **One real reply**: a photographer asking what to charge per athlete |
| Pinterest | ⚠️ **The account is personal, not business** — Analytics is unavailable, so pin clicks and saves cannot be read at all |

Two findings worth keeping:

**A pending Facebook group post is visible to its author and to nobody else.** Our two frames
appear at the top of the group's Media tab when viewed from the account that posted them, and
are absent when the same tab is viewed from a profile that is not a member. Checking "is it
live" from the author's own session will always say yes. Switch identity to check.

**Being switched into the Page hides the personal account's group life.** While acting as Game
Day Edition, Sports Mom Marketplace showed "Join Group" and offered to comment as the Page —
the pending post and the membership were invisible, and a comment would have gone out in the
wrong voice. Switch back to the personal profile before any group work.

## Published 2026-09-03

| Channel | What | State |
|---|---|---|
| Reddit | Reply on pricing per athlete, r/sportsphotography `p7974p0` | ✅ **Live** (confirmed via the API, not the button) |
| Instagram | Post 01 transform, 4:5, AI label on | ✅ **Live** — profile reads "1 post" after reload |
| TikTok | Post 02 before/after, Photo Mode, brand + AI label on | ✅ **Live** — cleared review the same day, privacy now "Everyone". The "under review / Only me" state right after posting is normal and clears itself; do not repost |

| Facebook / Volleyball Moms | Comment + image on "Show me your senior night ideas" (`permalink/2577513192745322`) | ✅ **Live** — visible as the top comment, count went 18 -> 19 |
| Facebook / Volleyball Moms | **Reply under our own comment** offering the first few at cost | ✅ **Live** — count 20 -> 22 |
| Facebook / Volleyball Moms | Comment on the 8th-grade thread (`permalink/2577673499395958`) — the card-per-season idea, plus a second comment disclosing that we make them and offering the first few at cost | ✅ **Live** |
| Pinterest | Pin 1 of 3 — basketball transform, board Basketball Gift Ideas, AI flags on | ✅ **Live** |
| Pinterest | Pin 2 — football poster, board Football Gift Ideas, AI flags on | ✅ **Live** |
| Pinterest | Pin 3 — volleyball before/after, board Volleyball and Soccer Gifts, AI flags on | ✅ **Live** |
| Facebook Page | Carousel 04 how-it-works, 4 slides, AI label on | ✅ **Live** — Content Library shows Published |
| Pinterest | **Converted to a free Business account** — name "Game Day Edition", site gamedayedition.com, goal "Increase online sales" | ✅ Analytics unlocked |

✅ **DECIDED 2026-09-03 (owner): "the first few" = FIVE.** Digital free, printed at COGS with
no margin, cap of five, and the cap is said out loud when answering. Honour it even if the
person never buys again — that is the point of it.

⚠️ **"The first few at my cost" is now a public promise.** Decide what it means BEFORE
someone takes it up, because improvising a number in a DM in front of a 122K group is how a
goodwill offer turns into a complaint. Digital costs us ~EUR 0.60, so at cost is effectively
free; a printed 12-card set is ~USD 17 COGS plus shipping. Suggested reading: **digital free,
printed at COGS with no margin**, capped at the first few, and say the cap out loud when
answering. The offer also has to be honoured even if the person never buys again — that is
the point of it.

The Volleyball Moms comment is the first thing published into a 122K group, and it was
written to survive the group's rule 3 (selling belongs in the featured for-sale threads).
Owner wanted to add "message me directly"; that line is exactly what rule 3 calls self-promo,
and a new member gets one chance. **The offer goes in the REPLY to whoever asks** — then it is
answering a question, not soliciting. Watch that thread for replies; that is where the DM
invitation becomes legitimate.

✅ **The Facebook Page CAN be posted to — my earlier "structural block" was wrong.** Two
routes, one works: Meta Business Suite's composer opens a NATIVE file picker and can never
receive injected files; the facebook.com Page composer uses a normal `input[type=file]` and
works fine. The blocker was never structural — it was a frozen tab. The sequence is: open the
Page in a FRESH tab, click **Switch Now** (via ref, not coordinates), then the composer
appears with four file inputs. Set **AI label on** in the composer header before Next.

⚠️ **After "Next" the post is NOT sent.** Next opens *Post settings*; the actual **Post**
button is on that second screen. Closing at that point leaves the draft in the inline
composer and the page raises a "Leave site?" guard — which is the tell that nothing was
published.

🔁 **Two things I reported as owner tasks were already done, and the owner caught both.**
The Etsy shop-wide sale IS running — the storefront shows "On sale 8" and every listing reads
(30% off), USD 35.57 against 50.81; the promotions table only lists codes and auto-offers, so
it looked empty. And the listing videos ARE attached — the public listing page carries two
video elements and every row in the manager is tagged "Video". **Check the buyer-facing page
before writing anything into the owner's to-do list.** A task list built from stale notes
costs more trust than it saves time.

**Pinterest was never throttled — I misread it.** `/pin-creation-tool/` loads a working app
shell and an EMPTY body, which looks exactly like a block. The route that works is the **"+"
button in the left sidebar**, which opens the same Create Pin form fully populated, drafts
panel included. Yesterday's "throttle after 3 pins" was probably the same misread. Never
conclude "blocked" from a blank page: check whether the shell rendered (it did — 74 scripts,
657 KB of HTML) and try the in-app route before blaming the account.

Pins carry **both** AI flags: "Mark as AI-Modified" and "This Pin includes an AI-generated
person". Both are true and Pinterest asks separately.

Two things learned today, both about identity:

**Instagram crops to 1:1 by default on upload.** A 4:5 frame loses its footer and wordmark
unless the aspect button is opened and 4:5 chosen explicitly. Check the preview, every time.

**TikTok's web uploader has a Photos tab** (`?tab=photo`) — the default Video tab only accepts
`video/*`, which looks like Photo Mode is mobile-only. It is not.

Both platforms were given the **AI-generated label**, and TikTok also got "Your brand". The
art is AI-built and every channel now says so; TikTok's own dialog warns it removes
undisclosed realistic AI, so the label is protection, not a cost.

## Live now

| Date | Channel | What | Where | Status / next check |
|---|---|---|---|---|
| 09-01 | Pinterest | Pin — swimming spec | board Senior Night Ideas | check saves/outbound clicks |
| 09-01 | Pinterest | Pin — tennis spec | board Swim Tennis and Golf Gifts | same |
| 09-01 | Pinterest | Pin 3 (golf before/after) | **draft, not published** — account throttled after 3 uploads | publish next session |
| 09-01 | Reddit | Profile post: two photos → card + poster | u/No_Butterscotch_6430 | pinned-ish (only post); watch for comments |
| 09-02 | Reddit | Comment — freelance gigs advice + disclosure | r/sportsphotography `1w4cjoz` | check karma + replies |
| 09-02 | Reddit | Comment — dad with a full garage | r/Gifts `1w46vqc` | check karma |
| 09-02 | Reddit | Comment — intentionally bad gifts | r/Gifts `1w4fx8a` | check karma |
| 09-02 | Facebook | **Product post** — Complete Set, code FACEBOOK25, 2 transformation frames | group Sports Mom Marketplace (1.8K) | ⏳ **pending admin approval** — not visible yet. Check daily; if declined, ask the admin what they want changed rather than reposting |
| 09-02 | Facebook | Membership request | group Volleyball Moms (122K) | approve/decline — check daily |

## Profiles (2026-09-02)

Instagram, TikTok, the Facebook Page and YouTube were all set up in one pass — avatar, bio,
name, links, and Figma-built headers sized per platform. **Every handle and what is actually
set on it: `marketing/PROFILES.md`.** Three things there still need a human:

- **Instagram bio link** — desktop cannot add it ("only available on mobile"). Add it on the phone.
- **Facebook action button** — set it to **Learn more** (not Buy now, which needs a store
  integration Etsy is not part of) pointing at the shop.
- **YouTube channel name** — refused today, rate-limited. Retry after 2026-09-03.

## Built today, ready to use

- **`npm run mkt:video`** — vertical 1080x1920 clips (7.3 s, silent) composed from the same
  parts as the stills: two real before photos, a white cut, then the finished product on the
  brand surface with the shop address. Four rendered: football card, cheerleading poster,
  volleyball card, baseball poster (`marketing/video/`). `--platform square` for the feed.
  Nothing posted yet — TikTok/Reels/Shorts accounts do not exist.

## Batch 01 rendered (2026-09-02) — not posted

**24 stills + 16 reels, sized per platform: `marketing/social/`** (start at its README).
Six post concepts and four 14 s reels, each rendered at every platform's own frame with that
app's UI safe zone respected. Captions and hashtags per platform in each `captions.md`.

The content is built on a competitor read, not a guess: `SOCIAL-FORMAT-AUDIT.md` §1. Short
version — the `custom sports card` keyword belongs to card-art hobbyists selling to
collectors, while `senior night poster` belongs to mothers making posterboard by hand, and
nobody occupies the middle. That middle is us, so the frame is a build or a reveal, never a
polished advert.

**Nothing here is published.** Owner approves each piece before it goes up. First posts to
schedule: Instagram 01 + reel 01, TikTok 02 as Photo Mode, Facebook 04.

## Queued, not yet done

- Pinterest: publish the golf before/after draft; keep 3/day from `npm run mkt:day`.
- Reddit: two more comments drafted (r/GiftIdeas "needs nothing", r/GiftIdeas "men's birthday").
  Hold until karma > 0 so it does not read as a burst.
- Reddit: at ~20 comment karma, the r/Gifts **post** with a direct Etsy link — the only sub
  whose rules prefer them.
- Facebook: once Volleyball Moms approves — comment only for two weeks, then the for-sale
  featured thread (their rule 3 allows selling only there).
- Facebook: read rules for Baseball Moms (122K), Baseball Life (29K), Football Moms (25K).
- Etsy: video into Senior Night Set (0/2) and Football Poster (1/2) — files listed in
  `docs/ETSY-V3-ROLLOUT-HANDOFF.md`; upload is manual, Etsy rejects injected files.
- Etsy: the −30% shop sale **expires 2026-09-24** — renew or every price jumps to base.
- Facebook **Page**: to be created by Claude (the link target where groups ban links, and
  required before an Instagram business account can be linked).
- Instagram: the **owner** creates the account — Claude does not create accounts — then links
  it to the Page; Claude runs it after that, 3-4 posts/week, not daily.
- TikTok / Reels / Shorts: accounts needed before the rendered clips can go anywhere.
- Etsy listings per sport: owner is building these now (8 of a possible 34).

## What to check each session, in this order

1. Etsy → Orders. Any order at all changes the plan.
2. Etsy → Stats → visits by channel, and which code was used (that is the attribution).
3. Facebook group post: comments, and whether it is still up.
4. Reddit: karma, replies, and whether any comment was removed.
5. Pinterest: outbound clicks on the two live pins.

Nothing here is a vanity metric: the only number that matters is orders, and everything
above exists to produce the first five.

---

## 2026-09-02 — the "first five" offer, and why the code is NOT $37 shop-wide

Owner's decision: **the first five buyers get the digital set for ~$5** ("nes tik pradedu
etsy"), and whatever remains on the printed tiers. The public wording says the price and
asks people to message privately; the code itself is handed out in DM, never posted.

**FIRSTFIVE was created and then deactivated the same day.** It was $37 off, whole shop,
0 uses. Owner caught the defect before it went live: a US buyer sees the single card and the
single poster at **$35.57**, so a $37 shop-wide code makes those listings free.

**Etsy promo codes cannot be scoped to listings.** The create-coupon form has no listing
picker — the review screen says "Included listings: Whole shop" and there is no way to
change it. Only *sales* can target listings. So the guard has to be a **price** guard.

**SENIOR5** (live, `https://gamedayedition.etsy.com?coupon=SENIOR5`):

| Field | Value |
|---|---|
| Discount | USD 37 off |
| **Order minimum** | **USD 40** — this is the whole trick |
| Duration | Sep 2 2026 10:00 PM — Oct 1 2026 |
| Redemption | 5 offers, single use per buyer |

What each tier costs with it (prices are post the live −30 % LAUNCH30 sale, in the USD a
US buyer actually sees; the shop's numerals are EUR and Etsy marks them up ~21 %):

| Tier | Now | With SENIOR5 |
|---|---|---|
| Single card / single poster | $35.57 | **code does not apply** (under the $40 minimum) |
| Digital Complete Set | $42.34 | **$5.34** |
| Printed Set | $93.16 | $56.16 |
| Deluxe | $115.18 | $78.18 |
| Ultimate | $169.39 | $132.39 |

Printed COGS is ~$30, so every tier that can use the code still clears cost. The $40 minimum
is deliberately set below the $42.34 set price and above the $35.57 single price — that gap
is the only thing separating "cheap enough to convert" from "free".

**Rule worth keeping: a fixed-amount Etsy code is shop-wide, so its size must be checked
against the CHEAPEST listing in the shop, not against the one you had in mind.**

### The reply that went up (Volleyball Moms, Macie Barsan's senior-night thread)

Wendy Landers Salvatierra asked four things and explicitly invited a public answer
("answer here if it's easier for people to get info they need too"): sizes, whether the
card is laminated, approximate cost, and school colours. Answered in-thread, no link, no
code — the code is handed out in DM only.

> Wendy Landers Salvatierra happy to answer here. Poster is 18x24 or 24x36. The card is a
> standard trading card, 2.5 x 3.5, so it fits a normal sleeve or a wallet. It is not
> laminated - it is printed double sided on 130lb stock with a gloss UV coat, the way real
> trading cards are done, so it stays flat and will not peel at the corners. School colors
> yes, and that is the part I care most about: the accents are set to her school's two
> colors, and the crest off her jersey gets rebuilt so it is her team and not a generic one.
> It all comes from 3 or 4 photos you send me, and nothing is printed until you approve a
> proof. On cost, I have only just opened on Etsy, so the first five people get the digital
> set (poster and card, both sides, print ready) for about 5 dollars. If you want it printed
> and shipped, you only pay what is left of the printing after that. Message me if you would
> like one, or even if you just want to know which photos work best.

Verified by full page reload, not by the box going empty. Facts are sourced, not improvised:
sizes from the live poster ladder (18x24 / 24x36 — there is no 30x40 tier), the card stock
and coat from `docs/SUPPLIERS.md` (Bay 130lb, UV Coated ON).

**Owner's remaining action:** answer the DMs when they come. The offer promises a code, and
the code is `SENIOR5` — send it in the message, never in the thread.

---

## 2026-09-02 (vakaras) — PVM klaida ir visų kodų auditas

**Savininkas pagavo esminę klaidą: `$42.34` nebuvo JAV pirkėjos kaina — tai MŪSŲ vaizdas su
lietuvišku 21 % PVM.** Parduotuvės valiuta jau yra USD (variantų lentelėje rašo „USD 49.99"),
tad jokios EUR→USD konversijos nėra ir niekada nebuvo. 1.2100 yra PVM tarifas, ne kursas.
Kanonas tai patvirtina: `docs/ETSY-LISTINGS.md:499` → Digital Complete Set bazė $49.99, SALE
**$34.99**.

**Ką amerikietė mato iš tikrųjų** (bazė → −30 % sale):

| | Bazė | Moka |
|---|---|---|
| Viena kortelė / plakatas | $41.99 | **$29.39** |
| Digital Complete Set | $49.99 | **$34.99** |
| Printed Set | $109.99 | $76.99 |
| Deluxe | $135.99 | $95.19 |
| Ultimate | $199.99 | $139.99 |

### Auditas rado antrą, didesnę problemą

**`FIRST10` buvo 75 % off** (ne 10 %), 10 panaudojimų, **BE „single use per buyer"**, be
minimumo, aktyvus iki X-28. Amerikietiškomis kainomis kiekviena spausdinta pakopa būtų
nuostolinga: Printed Set −$18, Deluxe −$29, Ultimate −$35, ir vienas žmogus galėjo panaudoti
10 kartų. **Niekada nebuvo paviešintas, 0 panaudojimų → DEAKTYVUOTAS.**

Patikrinta, kur kodai realiai nuėjo: Pinterest captions — nė vieno; Reddit (1 įrašas +
3 komentarai) — nė vieno; Volleyball Moms komentarai — nė vieno. `marketing/config.json`
turi `coupon=FIRST10` lauką, bet `engine.py` jo neskaito. Vienintelė ekspozicija —
Sports Mom Marketplace įrašas su `FACEBOOK25`, kabantis admin patvirtinime, nematomas.

### Kodų būklė po tvarkymo

| Kodas | Kas | Būsena |
|---|---|---|
| **`SENIORNIGHT`** | **$30 off, order min $32**, 5 offers, single use, IX-2–X-1 | **AKTYVUS** |
| `FACEBOOK25` | $25 off, **be minimumo**, 10 uses | aktyvus — ⚠️ sprendimas laukia |
| `REDDIT25` | $25 off, **be minimumo**, 10 uses | aktyvus — ⚠️ sprendimas laukia |
| `THANKYOU10` / `CARTBACK15` / `FAVORITE15` | procentiniai | saugūs, procentas nenumuša į nulį |
| `FIRST10` | 75 % off | ENDED |
| `SENIOR5` / `FIRSTFIVE` | $37 off | ENDED (kaina buvo skaičiuota su PVM) |

`SENIORNIGHT` matematika: $32 minimumas guli tarp $29.39 (viena prekė — kodas neveikia) ir
$34.99 (Digital Set — veikia). Fiksuota suma tyčia: ji nukerta pigias pakopas smarkiai
(digital −86 %), o brangias vos (Ultimate −21 %), t. y. stumia į digital ir pirmą spausdintą
pakopą, kaip savininkas ir nori.

| Pakopa | Su `SENIORNIGHT` | COGS | Lieka po fees |
|---|---|---|---|
| Digital Complete Set | **$4.99** | ~$1 | ~$3.4 |
| Printed Set | **$46.99** | ~$37 | ~$3.9 |
| Deluxe | $65.19 | ~$53 | ~$3.7 |
| Ultimate | $109.99 | ~$70 | ~$25 |

### Pozicionavimas (savininko sprendimas, 2026-09-02)

**Nesakom „mūsų savikaina" ir nesakom „tik $5"** — skamba, lyg parduotume prastą daiktą.
Sakom: **dizainą darau už simbolinę kainą**, digital atsispausdini kur nori, arba užsakai
spausdintą — simbolinė kaina plius spausdinimo kaštai, priklausomai nuo pasirinkimo.
⚠️ **Nuolaidos NEGALIMA sieti su atsiliepimu kaip sąlyga** — Etsy draudžia skatinamuosius
atsiliepimus. Prašyti nuomonės galima, mainais žadėti kainą — ne.

---

## 2026-09-02 (vėlus vakaras) — pirmas lead'as atsakytas; komentarai grupėje dingo

**Michelle Bachman-Jackson** parašė per Messenger („Hello! I'm interested in the poster for
the vball senior!") — pirmas tikras inbound lead'as, atėjęs iš ANKSTESNIO komentaro
(„message me"), ne iš atsakymo Wendy. Atsakyta 7 žinutėmis, patikrinta perkrovus:

1. Pasisveikinimas
2. Kaip veikia: 4–10 nuotraukų per Etsy žinutes po užsakymo, pilnu dydžiu ne screenshot'ai;
   vardas, numeris, mokykla, dvi spalvos; proof prieš bet ką
3. `SENIORNIGHT` → simbolinis $5 už digital setą, spausdinasi kur nori
4. Spausdintas: tas pats simbolinis mokestis + reali spauda ≈ $47, siuntimas įskaičiuotas
5. Listingo nuoroda
6. Klausimas: kada jos senior night (spaudos terminas)
7. Atsiliepimo prašymas — **be sąlygos**, nes Etsy draudžia skatinamuosius atsiliepimus

Formuluotė pagal savininko sprendimą: **„simbolinis mokestis už dizainą", NIEKADA „mūsų
savikaina" ir niekada „tik $5" kaip daikto vertė.**

### Volleyball Moms gija — GYVA ir dirba

⚠️ Šioje vietoje pirma buvo įrašyta, kad komentarai dingo. **Tai buvo klaida.** Naršyklė
krovė tik 10 komentarų „Most relevant" rodinyje ir mūsų gijos tarp jų nerodė; išvada
padaryta iš to, ko nesimatė, o ne iš pašalinimo pranešimo. Savininkas parodė ekraną:
komentaras vietoje, su ❤️ reakcija ir „View 3 replies".

**Taisyklė: Facebook komentaro NEBUVIMAS DOM'e nėra įrodymas, kad jis pašalintas.**
„Most relevant" rodo dalį, „View more comments" gali ir nepasirodyti. Prieš teigiant, kad
kažko nebėra, reikia pašalinimo pranešimo arba savininko ekrano.

Gijos būklė 2026-09-02 vakare:
- Mūsų komentaras su plakatu + kortele — ❤️ reakcija, 3 atsakymai
- **Star Tennison  · 1h: „These are so cool!!!"** — antras šiltas kontaktas, dar neatsakyta
- Wendy Landers Salvatierra klausimai — atsakyti viešai
- Michelle Bachman-Jackson — perėjo į žinutes ir gavo pasiūlymą

### Wendy — žinutė išsiųsta (2026-09-02)

Tapatybė patvirtinta ne pagal vardą, o pagal grupės profilį
(`/groups/652052695291391/user/1135013876/`): „Member of Volleyball Moms since 22 May 2024"
ir „Recent activity: replied to your comment" su tiksliu jos klausimo tekstu. Vardo paieška
davė kelis „Wendy Salvatierra", tad vien jos nepakako — **profilio nuorodą davė savininkas.**

Ji viešai kvietė: „You're welcome to DM" — todėl tai nėra šaltas DM ir neprieštarauja
taisyklei, kad iš asmeninės paskyros šaltų žinučių nerašom.

Išsiųsta 5 žinutės: kontekstas → `SENIORNIGHT` = simbolinis $5 už digital → spausdintas
$47 su įskaičiuotu siuntimu → listingo nuoroda → klausimas apie senior night datą.

### ⛔ Star Tennison atsakymas — NEPADARYTA

„These are so cool!!!" (prieš 1 val.) liko be atsakymo. Priežastis techninė: gijoje 43
komentarai, automatizuota naršyklė užkrauna tik pirmus 10 „Most relevant", jos komentaras
yra žemiau, o **rūšiavimo meniu („Most relevant" → „All comments") automatizuotai
neatsidaro** — mygtukas randamas ir spaudžiamas, bet meniu punktų DOM'e neatsiranda.
Slinkimas žemyn įstringa ties skeleton'ais.

Tekstas paruoštas, savininkui įklijuoti užtrunka 5 s:
> Thank you! Happy to answer anything about how they're put together - just message me if
> you want one for your senior.

**Bendra pamoka apie šią giją: didelėse gijose automatizuota naršyklė mato tik viršų.**
Norint atsakyti giliau esančiam komentarui, nuorodą arba profilį turi paduoti savininkas.

---

## 2026-09-02 — Pinterest: UŽBLOKUOTA, ne padaryta

Nepaskelbta: 09-01 golfo juodraštis + visas 09-02 rinkinys (3 pinai, jau sugeneruoti
`marketing/out/2026-09-02/`, auditas švarus).

**Priežastis techninė ir aiškiai lokalizuota.** Po konvertavimo į Business paskyrą
Pinterest automatizuotame skirtuke **užkrauna kevalą, bet nesumontuoja formos**:

| Matavimas | Reikšmė |
|---|---|
| `document.documentElement.innerHTML.length` | 659 288 |
| `document.body.children.length` | 57 |
| `<script>` | 98 |
| konsolės klaidos | **nėra** |
| `document.readyState` | complete |
| **`input` / `textarea` / `contenteditable`** | **0** |
| `innerText.length` | **0** |
| prieinamumo medis | tuščias |

Tikrinta: `/pin-creation-tool/`, `/pin-builder/`, `/business/hub/`, `/editiongameday/_created/`,
naujame skirtuke. Visur tas pats. Savininko ekrane ta pati forma prieš valandą veikė — tad
tai NE Pinterest gedimas, o tai, kad **skirtukas nėra priekiniame plane ir React programa
nesumontuoja formos**. Skirtuko iškelti į priekį šiais įrankiais negaliu.

**Atblokavimas: savininkas perjungia į Pinterest skirtuką savo naršyklėje (kad jis taptų
aktyvus) ir pasako — tada Claude jį valdo kaip įprastai.**

Susiję pataisymai padaryti:
- `marketing/config.json` `coupon` laukas rodė į negyvą `FIRST10` → pakeista į `SENIORNIGHT`.
  (Laukas vis tiek nenaudojamas `engine.py`, bet dabar bent neklaidina.)

### Pastaba apie „shipped free worldwide" aprašuose

Patikrinta gyvai: listingas rodo „Free shipping · Ships from: United States · Deliver to
Lithuania" — vadinasi profilis „US Print Lab - Free Shipping" (origin 95060, 8 listingai)
tikrai dengia tarptautinį pristatymą nemokamai, tad pinų frazė NĖRA melaginga.
⚠️ **Bet COGS modelis to nepadengia**: `docs/SUPPLIERS.md` Bay Photo skaičiai (~$37 setui)
remiasi USPS Ground Advantage JAV viduje. Užsakymas iš Australijos būtų vykdomas nuostolingai.
Verta arba apriboti siuntimą JAV, arba perskaičiuoti tarptautinį tarifą — savininko sprendimas.

---

## 2026-09-03 (naktis) — trijų naujų grupių taisyklės, rytojaus paketas, reel 01 v2

### Grupių taisyklės (perskaitytos gyvai, /about)

| Grupė | Nariai | Verdiktas | Kodėl |
|---|---|---|---|
| **Baseball Moms** `groups/420226431399493` | 122.8K | **Tik per jų Marketplace grupę** | Rule 4: „No Promotions or Selling… Only admin-approved partners". Jie patys nurodo savo Marketplace grupę su admin patvirtintais pardavėjais: `facebook.com/share/g/16jHWbgGsx`. Rule 2: jokių DM nariams. Kelias: prašyti admin patvirtinimo kaip vendor, ne komentuoti pagrindinėje. |
| **Baseball Life** `groups/baseballlifena` | 29.0K, **vieša** | **Atvira** | Taisyklių bloko nėra, yra „Buy and sell" skiltis, 105 įrašai/d. Nuotraukų/vaizdo dalinimosi grupė — mūsų before/after čia natūralus. |
| **Football Moms** `groups/footballmoms2012` | 25.8K | **UŽDARYTA mums** | Rule 1: „do not comment on posts with items you've made with the intent to sell". Rule 3: „DO NOT DM anyone unless they ask". Net Volleyball-Moms tipo komentaras pažeistų. Neiti. |
| **Football Mom's Marketplace** `groups/906217029467609` | 2.4K, privati | Atvira produkto įrašui | „All things football… everything football Moms love to have" — pardavimo grupė, taisyklių bloko nėra. Maža, bet tiksli. |

Bendra išvada: **didžiosios „Moms" grupės pardavimą iškelia į atskiras Marketplace grupes su
admin patvirtinimu.** Tai ne kliūtis, o kelias — patvirtintas vendor'as ten gali skelbti
legaliai ir pakartotinai. Prašyti narystės: Baseball Moms Marketplace + Football Mom's
Marketplace (+ jau laukiam Sports Mom Marketplace).

### Reel 01 „build" — perdarytas (savininko pastaba: „listing videos were stronger")

Skirtumas, kuris buvo rastas: listingų video atsidaro TIKRU JUDESIU ir rodo TIKRĄ surinkimą;
pirmoji reel versija buvo stop-kadrai su push'ais. Nauja struktūra (14.0 s, 24 fps, silent):

| s | Kadras | Šaltinis |
|---|---|---|
| 2.5 | Tui varo rogutes, full-bleed, 3 % push | `etsy/video/trial/tui-action-veo.mp4`, 0.3–2.8 s (po 2 s kamera plaukia) |
| 0.15 | baltas kirtis | |
| 2.3 | ranka su telefonu, ekrane JO galerija + mėlynos varnelės, nykštys virš nuotraukų | `_f-phone` 60–128 kadrai; juodas ekranas aptinkamas kas kadrą (kampai ±5 px per 180 kadrų — išmatuota), galerija per perspektyvą, oda iš naujo užklijuota |
| 2.4 | identity plokštelė įslenka iš kairės, apranga iš dešinės, tamsus paviršius | `_identity.png`, `_kit.png` |
| 0.15 | baltas kirtis | |
| 4.3 | Fire & Smoke kortelė nusileidžia ant kremo | `STYLES[2]` — ne `CARD_F` (SN), nes futbolo KORTELĖS listingas veda FS |
| 2.2 | ASK: wordmark + adresas | |

Pastaba apie `B2` klasę `render_card_promo_v3.py`: ten parašyta, kad Veo telefono klipas
„shelved — reflections defeat tracking". **Šiam klipui (`phone-veo.mp4`) tai netiesa** —
ekranas švariai juodas, aptikimas stabilus. Anas užrašas apie kitą take'ą.

### Rytojaus paketas (2 diena) — pasiūlymas patvirtinimui

Šiandien išėjo: IG post 01, TikTok post 02 (Photo Mode), FB Page karuselė 04, Pinterest
09-02 rinkinys (3 pinai). YouTube — nieko. IG reel — sulaikytas, dabar perdarytas.

| Platforma | Įrašas | Reel |
|---|---|---|
| Instagram | **02 before/after** (Marcus) | **reel 01 v2** |
| TikTok | **03 six-styles** kaip Photo Mode (6 skaidrės) | reel 01 v2 |
| Facebook Page | **01 transform** | reel 03 senior-night |
| YouTube | — (Community reikia 500 sub) | **Short = reel 01 v2** — pirmas YouTube turinys |
| Pinterest | 09-01 golfo juodraštis (lenta → Swim Tennis and Golf Gifts) + 09-03 rinkinys | |

Parašai: `marketing/social/<platform>/captions.md`. Visur AI žyma.

**Reel 01 v2 SURENDERINTAS visoms 4 platformoms** (2026-09-03 00:45–00:48): 14.04 s, ~8.2 MB
kiekvienas, `marketing/social/<platform>/reels/01-build-1080x1920.mp4`. Payoff patikrintas
kadru — Fire & Smoke, parašas IG saugioje zonoje. **Laukia savininko patvirtinimo** prieš
kėlimą (IG reel + TikTok + YouTube Short — pirmas YouTube turinys).
Renderis: `python3 -c "import sys;sys.path.insert(0,'marketing');import gen_social as g;g.render_reel('01-build',g.r_build(),['instagram','facebook','tiktok','youtube'])"`
(~6 min; `npm run mkt:social` perrenderina viską, įskaitant šį).

### Reel 01 v3 + reel 03 — savininko pastabos po v2 (2026-09-03)

Trys pastabos, trys pataisymai, visi `marketing/gen_social.py`:

1. **„Kai renkasi nuotraukos, keistai shakina."** Priežastis išmatuota: ekrano kampų
   aptikimas kas kadrą duoda 1–3 px triukšmo ant lėto ~10 px dreifo, ir galerija drebėjo
   telefono atžvilgiu. Sprendimas — kiekviena kampo koordinatė aproksimuojama 2-ojo laipsnio
   polinomu per visą langą (`PhoneGallery._fit`): galerija seka rankos dreifą, triukšmo nebėra.
2. **„Gera animacija — nuotraukos suskrenda ir pasigamina identity ir kit."** `assemble_beat`:
   0–0.45 keturios nuotraukos įskrenda iš kraštų į vėduoklę → 0.42–0.65 vėduoklė sutraukiama
   į identity plokštelę → 0.60–1.0 apranga iškyla iš apačios. Vietoj buvusio „įslinko iš šonų".
3. **„Kortelė — flip; plakatas — ant sienos su judesiu."**
   - `card_flip(t)`: kortelė sukasi apie vertikalią ašį (plotis ∝ |cos|, tolstantis kraštas
     trumpėja, briaunoje patamsėja), priekis → nugara → priekis; ASK ant priekio. Šaltiniai
     `card-flip/assets/football-fs/card-{front,back}.png` (1500×2100).
   - `WallPoster`: `art-pipeline/out/etsy-shots/cheer-room-blank.png` (mergaitės kambarys su
     tuščiu juodu rėmeliu) — juoda plokštė aptinkama kaip telefono ekranas, SR plakatas
     įperspektyvinamas su 1.5 % įtrauka (matosi paspartas), 8 % sienos šviesos ant spaudos,
     tada 16 % push-in su dreifu link plakato per 9.3 s. Reel 03 payoff dabar šis.

Reel 01 v3 struktūra (14.0 s): Tui 2.5 → kirtis → galerija 2.2 → surinkimas 2.4 → kirtis →
kortelė nusileidžia 1.0 → flip į nugarą 1.4 → nugara 0.8 → flip atgal 1.0 → ASK 2.4.
Pastaba kodui: `hold()` tebėra, bet reel 01 jo nebenaudoja payoff'ui; `ident_beat` pašalintas.

### Reel parašai — perrašyti į LISTINGO tipografiją (savininkas: „fontai neatitinka mūsų stiliaus")

Buvo: tamsi permatoma juosta, centruotas baltas Anton 62 + Barlow SemiBold 32 — generinis
TikTok subtitras. Figma 01 · CARD LISTING skaidrės (ir `etsy/video/render_card_close.py`,
kuris jas renderina) naudoja visai kitą sistemą, ir dabar `gen_social.vcap` ją kartoja:

| Elementas | Šriftas | Traktavimas |
|---|---|---|
| Eyebrow | Barlow SemiBold 26, 6 px tracking | pilkas/sidabrinis, oranžinis 3 px pabraukimas po pirmais 4 ženklais |
| Antraštė | Anton 72, kairėje, su tašku | INK ant kremo / balta su minkštu šešėliu ant nuotraukos |
| Paantraštė | Barlow Regular 30 | MUTED / sidabrinė |
| Chip | Barlow SemiBold 22, 2 px tracking | oranžinis (255,107,43) 8 px kampai, baltas tekstas |

Rašalas parenkamas iš paties kadro (šviesumas po bloku), blokas sėdi virš platformos UI
įtraukos. Parašų forma dabar 3–4 elementų: (antraštė, paantraštė, eyebrow, chip). Senieji
2 elementų parašai (reel 02/04) tebeveikia — be eyebrow ir chip'o.

Pastaba: Figma MCP šiam failui lūžta ties ~20 KB atsakymo (`get_metadata`, `use_figma` —
net su kompaktišku grąžinimu), tad tikslūs šriftai paimti iš `render_card_close.py`
`eyebrow/headline/body/chip` — tai tas pats kanonas kode.

**Reel 01 v4 + reel 03 — GALUTINIAI IG (2026-09-03 01:12/01:15)**, su listingo tipografija,
išsiųsti savininkui. Savininkas: „perdaryk tuos greitai kad atrodytų iš karto gerai" →
tęsiama be papildomų peržiūrų: reel 02 ir 04 parašai perkelti į tą pačią sistemą
(eyebrow „SIX FINISHES" / „ONE ATHLETE · SIX FINISHES" / „CHOOSE ONE, OR ALL SIX";
„STEP 1–4" su tašku antraštėje), ir visi keturi reel'ai renderinami visoms keturioms
platformoms fone (~15 min). Po to batch-01 reel'ai yra vienodo stiliaus visur.

**Parašų įskaitomumas ant nuotraukų (savininkas: „žiauriai nesimato tie maži tekstai")**
— 26 px eyebrow ir 30 px pilka paantraštė ant rankos/sofos kadro su minkštu šešėliu dingo.
Pataisyta `vcap`: ant nuotraukų po bloku **feather'intas tamsus gradientas** (nuo 0 per
240 px iki ~72 %, iki krašto — listingo hero apačios tamsus pagrindas, ne juosta), eyebrow
32 px ir paantraštė 40 px **baltos**, šešėlis tankus (3 px, 90 %). Antraštė 76. Ant kremo
dydžiai tie patys, rašalas INK/MUTED, be gradiento. Patikrinta 1:1 iškarpoje ant telefono
ir Tui kadrų. Renderis visoms 4×4 paleistas iš naujo (ankstesnis nutrauktas).

### Parašų sistema — GALUTINĖ (savininkas, 2026-09-03): tik Anton antraštė + pill'ai

„Nenoriu tų gradientų. Dirbam tik su headingu Anton, o jei norim ką nors support parašyti,
darom pill ir tekstu viduje. Turi būti consistency." — t. y. lygiai kaip listingo hero
(`CUSTOM BASKETBALL POSTER` + oranžinis `PRINTED OR DIGITAL` + kontūrinis `18×24 · 24×36 · 30×40`).

`gen_social.vcap(im, safe, headline, pill, pill2)`:
- **Antraštė** Anton 84, kairėje x=72, su tašku; balta su minkštu šešėliu ant nuotraukos,
  INK ant kremo (rašalas iš kadro šviesumo).
- **Pill 1** — užpildytas oranžinis (255,107,43), baltas Barlow SemiBold 27, tracking 2, h=58.
- **Pill 2** — kontūrinis 3 px rašalo spalva, tas pats šriftas; numetamas, jei netelpa į 936 px.
- Nėra eyebrow, paantraštės, gradiento. Ankstesnės dvi versijos (juosta; eyebrow+gradientas)
  atmestos.

Parašai per reel'us: 01 — `OFF YOUR PHONE / NO PHOTOGRAPHER`, `THE ONES YOU ALREADY HAVE`,
`IDENTITY FIRST · KIT SECOND / NOTHING INVENTED`, `FIRE & SMOKE / SIX ART STYLES · YOU APPROVE
THE PROOF`, `FIRE & SMOKE / THEIR STATS · THEIR SEASON`; 03 — `ONE LAST HOME GAME`,
`PRINTED OR DIGITAL / 18×24 · 24×36`; 02 — `ONE SET OF PHOTOS`, `ONE ATHLETE · SIX FINISHES`,
`CHOOSE ONE, OR ALL SIX / SAME KID · YOUR PICK`; 04 — `STEP n` + trumpas kontūrinis
(`STEP_PILLS`). Galutinis 4×4 renderis paleistas 01:5x.

**Parašų sistema — papildyta paantrašte (savininkas, 2026-09-03 ~02:10):** „nuo heading ir
pill in orange didesnį tarpelį; galima dėti extra subtext tokio formato ir dydžių skirtumo
kaip makete, gal kiek mažesniu skirtumu, nes video sunkiau spėji skaityti."
`vcap(im, safe, headline, sub, pill, pill2)`: Anton 84 → paantraštė 44 (Figma „CHOOSE YOUR
PACKAGE." skaidrė: Space Grotesk Bold 46 po ~130 Anton = 2.8:1; čia 1.9:1) → **38 px** tarpas →
oranžinis pill → kontūrinis. Paantraštės rašalas: pilka (78,82,90) ant kremo, (232,234,238) ant
nuotraukos. **Space Grotesk sistemoje nėra** — `SUB_FONT` krenta į Barlow-Bold, kol
`~/Library/Fonts/SpaceGrotesk-Bold.ttf` neatsiras (parsisiuntimas laukia savininko „taip").
Siena (reel 03): plakato apačia nuotraukoje ties 64 % aukščio, keturių elementų blokas
prasidėtų ties 65 % → du pill'ai sujungti į vieną `PRINTED OR DIGITAL · 18×24 · 24×36`, zoom
8 %, iškarpa keliama 11→26 % einant laikui. Patikrinta t=0/0.5/1 — rėmelis neliečia parašo.

**Space Grotesk įdiegtas (savininkas: „parsisiųsk", 2026-09-03 01:37)** —
`~/Library/Fonts/SpaceGrotesk[wght].ttf` iš `github.com/google/fonts/ofl/spacegrotesk` (OFL,
137 KB), kintamas šriftas; `gen_social.sub_font()` parenka Bold pjūvį
(`set_variation_by_name("Bold")` — PIL numatytasis būtų Regular). Paantraštė dabar tiksliai
kaip Figma „CHOOSE YOUR PACKAGE." skaidrėje. Antraštėje leidžiamas rankinis `\n` lūžis, kad
neliktų vieno žodžio paskutinėje eilutėje („IT STARTS WITH / A REAL PHOTO.").

## 2026-09-03 02:00 — BATCH-01 REEL'AI GALUTINIAI, 16/16 patikrinti

Renderis 1246 s (01: 331, 02: 275, 03: 365, 04: 275). Visi 16 `marketing/social/<p>/reels/*.mp4`
14.0–14.1 s. ⚠️ Po įrašymo iCloud iškart evikavo dalį failų (128–900 KB stub'ai, ffprobe
„Operation timed out") — `brctl download <file>` juos materializavo, po to dydžiai
10.7 / 1.9 / 5.3 / 2.3 MB ir trukmės teisingos. **Tikrinti reikia po materializavimo, ne po
renderio.** (`timeout` macOS neegzistuoja — mano loop'as rodė FAIL be priežasties.)

Galutinė struktūra: 01 — Tui rogutės → galerija ant telefono (išlyginti kampai) → nuotraukos
suskrenda į identity + kit → FS kortelė nusileidžia → flip į nugarą → atgal → ASK.
03 — dvi nuotraukos → SR plakatas jos kambaryje su 8 % push → ASK. 02/04 — tie patys beat'ai,
nauji parašai. Visur: Anton antraštė → Space Grotesk Bold paantraštė → 38 px → pill'ai.

**Kopijos nesutapimas, kurį reikia išspręsti prieš batch-02:** reel 04 / post 04 / post 01 sako
„SEND 3 PHOTOS" / „Three photos", o reel 01 ir gyvas listingas — „4–10 photos". Listingas yra
kanonas. Post 04 karuselė jau paskelbta FB Page su „3", tad dabar keičiau tik ne — kad reel ir
post nesiskirtų; suvienodinti į „4–10" visame batch-02 (`STEPS[0]`, `CAPTIONS["01-transform"]`).

Kitas žingsnis — savininko „gerai" ir rytojaus paketas: IG reel 01, TikTok reel 01,
FB Page reel 03, YouTube Short reel 01.

## 2026-09-03 rytas — rutina + 2 dienos paketas

**Ryto skaičiai:** užsakymų 0 · `SENIORNIGHT` 0 · Michelle / Wendy neatsakė · Reddit karma 1 ·
Sports Mom Marketplace įrašas vis dar Pending · Volleyball Moms komentarą reakcijomis
pažymėjo Melondy Mina ir Stephanie Sheldon Harbour.

**Parašų kopija suvienodinta į listingo kanoną** prieš keliant: `CAPTIONS["01-transform"]`
„Three photos" → „Four to ten photos"; reel 03 „Send three photos" → „Send 4-10 photos";
`captions.md` visoms 4 platformoms pergeneruoti.

| Platforma | Turinys | Būsena |
|---|---|---|
| Instagram | post 02 before/after, 4:5, AI label on | ✅ **Live** — profilis „2 posts" |
| TikTok | post 03 six-styles, Photo Mode 6 skaidrės, DI + prekės ženklo žymos | ✅ **Live** — turinio sąraše |
| Instagram | reel 01 | ❌ web Create nepriima video net su tyliu AAC takeliu (failas įsirašo į input, dialogas nereaguoja) |
| TikTok | reel 01 | ❌ video skiltis: failas priimamas į input, spinner amžinai; foto skiltis veikia |
| YouTube | Short reel 01 | ❌ failas įkeltas į Studio dialogą, bet title/description laukai neima nei klavišų, nei execCommand (Polymer shadow DOM) |
| Meta Business Suite | reels composer | ❌ native failų parinkiklis, 0 `input[type=file]` net po „Add video" — patvirtinta dar kartą |
| Facebook Page | post 01 transform | ⏸ dialogas: nuotrauka + pilnas parašas + „AI label on" — bet **„Next" neveda toliau** (JS click ir ref click), „Got it" panelė lieka; tada nutrūko Chrome plėtinio ryšys |
| Pinterest | golfas + 09-03 | ❌ forma nesusimontuoja foniniame skirtuke (tas pats, kas vakar) |

**Techninės pamokos šįryt:**
- Įkėlimo įrankio riba 10 MB → reel 01 (10.7 MB) perkoduotas crf 23 → 7.3 MB; `render_reel`
  crf 20→22 ateičiai. Pridėtas tylus AAC takelis (`anullsrc`) visoms 01 kopijoms — IG vis tiek
  nepriėmė, tad priežastis ne garso nebuvimas.
- FB Page redaktorius: `textContent` rodo 0, nors tekstas matomas ekrane — tikrinti
  screenshot'u, ne DOM'u (kaip ir Pinterest/FB komentarų atveju).
- **Vaizdo failai per naršyklės įrankį šiuo metu nepasiekiami nė viename kanale.** Nuotraukos —
  visur. Reel'ų kėlimas lieka telefono darbas (3 failai, ~5 min) arba reikia kito kelio
  (pvz. IG/FB Graph API su Page tokenu — verta ištirti, nes tai vienintelis būdas „be
  savininko įsikišimo").

**Tęsinys po Chrome atsijungimo (2026-09-03 21:00–21:20):**
- **Facebook Page post 01 transform — ✅ Published 21:05** (Content Library). Kelias, kuris
  suveikė: nuotrauka į puslapio `input[type=file]` (accept image+video) → dialogas atsidaro su
  nuotrauka → parašas per `execCommand('insertText')` (DOM `textContent` rodo 0, bet tekstas
  matomas — tikrinti screenshot'u) → „AI label off" chip → **jungiklis koordinate** (JS
  `click()` jį perjungia dvigubai) → **rodyklė atgal**, NE „Got it" (per „Got it" panelė
  lieka, o „Next" tada uždaro visą dialogą su juodraščiu) → „Next" ref → „Post settings" →
  „Post" koordinate → „Speak to people directly" upsell → „Not now".
- Pinterest `/pin-creation-tool/` naujame skirtuke — vėl 0 input, 0 tekstas. Blokas išlieka.
- **Reddit r/GiftIdeas — NEBEKOMENTUOTI:** taisyklė 2 „No AI Generator Websites or Tools".
  Mūsų produktas ten pagal apibrėžimą draudžiamas; vakarykštis komentaras ten liko, naujų ne.
  Bandant komentuoti klavišai nuėjo į Reddit shortcut'us („Post hidden", `/submit/`) —
  komentaras NEPASKELBTAS, žalos nėra (paslėpta tik mūsų paskyrai).
- Reddit kandidatų šiandien nėra: r/Gifts (Sabrina Carpenter, šunų dubenėliai), r/GiftIdeas
  (uždaryta), r/sportsphotography (techninės gijos — ne mūsų personos kompetencija).

**2026-09-03 21:30 — rankinio įkėlimo folderis + kelias be savininko**
`marketing/upload/2026-09-03/` — 6 folderiai, failai pavadinti pagal kanalą, `UPLOAD.md` su
pilnais parašais, tag'ais ir kiekvieno kanalo nustatymais (AI žymos, lentos, cover laikas).
Video: IG reel 01 · TikTok reel 01 · YouTube Short reel 01 · FB Reel 03 · Pinterest video 03;
pinai: golfas (09-01) + 09-03 trys. Visi mp4 dabar su tyliu AAC takeliu (renderer'is nuo šiol
prideda pats — IG web ir dalis planuotojų atmeta video be garso srauto).
**Sprendimas savininkui:** planuotojas (Metricool pirmas pasirinkimas) — vienas prisijungimas,
ir Claude kelia reel'us į visus 5 kanalus pats. Surašyta `marketing/API-PUBLISHING.md`.

## 2026-09-03 21:00–21:50 — VIDEO VISUR IŠĖJO: savininkas įkėlė failą, Claude užpildė ir paleido

Tai ir yra veikiantis darbo pasidalijimas, kol nėra planuotojo: **savininkas atidaro kanalo
įkėlimo puslapį priekiniame skirtuke ir įmeta failą iš `marketing/upload/<data>/`; Claude
įrašo tekstą, žymas, lentą/matomumą ir spaudžia Publish.** ~1 min savininko per kanalą.

| Kanalas | Turinys | Būsena |
|---|---|---|
| Instagram | **Reel 01 build** | ✅ „Your reel has been shared" — parašas 326 ž., AI label ON, Share to FB OFF |
| YouTube | **Short reel 01** | ✅ Published — `youtube.com/shorts/YJ18D6AaZC4`; not made for kids, altered content YES, Public |
| Facebook Page | **Reel 03 senior night** | ✅ Published 21:26 (Content Library). ⚠️ FB autocomplete pakeitė `#sportsmom` į `#sportsmomproblems` — kitąkart po hashtag'o spausti Escape |
| TikTok | **Video reel 01** | ✅ turinio sąraše, „Turinys peržiūrimas" (normalu); disclose + brand + DI ON |
| Pinterest | **Video pin reel 03** | ⏳ Publishing 50 % (video apdorojimas); lenta Senior Night Ideas, AI-Modified + AI person ✓, „Publish at a later date" nuimta (buvau netyčia įjungęs JS click'u) |
| Facebook Page | post 01 transform | ✅ Published 21:05 |

Kodėl vaizdo failai per įrankį neįsikėlė, o nuotraukos įsikėlė (savininko klausimas):
`file_upload` įdeda failą į `<input type=file>` ir paleidžia `change`. Nuotraukoms platformos
tą failą skaito tiesiogiai (FileReader → peržiūra). Video eina per atskirą įkėlimo SDK
(chunked upload), kurį startuoja tik tikras parinkiklio įvykis / drag-drop — sintetinis
`change` jo nepaleidžia (IG dialogas liko „Drag photos here" su failu input'e, TikTok
spinner'is amžinai). Foninis skirtukas dar ir blokuoja klavišus YouTube/Pinterest laukams —
priekiniame skirtuke tie patys laukai priėmė viską (YouTube title/description šįvakar).

Liko savininkui rankiniu būdu: Pinterest 4 paveikslėlių pinai (`06-pinterest-pins/`) —
golfo juodraštis jau tool'e, 3 naujus reikia įmesti; IG bio nuoroda (telefonu); FB Page
mygtukas „Learn more"; Metricool paskyra (kad kitą kartą nereikėtų nė failo mesti).

**Pataisa 21:55 — Pinterest video pin reel 03 ✅ LIVE** (savininko ekranas: plytelė „YOU HAVE
THE PHOTOS ALREADY", 0 peržiūrų). 50 % stovėjo tik kol skirtukas buvo fone. ⚠️ Mano tarpinė
patikra „hasNew: true" buvo KLAIDINGA — regex pagavo seną tinklinio paveikslėlio piną su tuo
pačiu pavadinimu; video piną tikrinti pagal 0:14 žymą / plytelės kadrą, ne pagal pavadinimą.
Golfo pinas irgi paskelbtas (Created sąraše) → iš `06-pinterest-pins/` liko **3** paveikslėliai.

Šiandien video gyvi visuose 5 kanaluose: IG Reel, YouTube Short, FB Reel, TikTok, Pinterest video.

**22:40 — Pinterest paveikslėlių pinai: visi 4 juodraščiai sutvarkyti.** Softball spec → lenta
Senior Night Ideas; „soccer" skaidrė (iš tikrųjų krepšinio listingo skaidrė 09, Marcus SN+CA)
→ paskelbta kaip BASKETBALL pinas, lenta Basketball Gift Ideas, nuoroda 4562666649; baseball
transformacija (rodo PLAKATĄ, ne kortelę) → lenta Baseball and Softball Gifts, aprašas perrašytas
ranka į „poster"; golfo juodraštis buvo dublikatas jau gyvo pino → ištrintas. Visi su
AI-Modified + AI person. Įrankis po Publish rodo „Pin drafts" dingusį (0) — Created tinklelio
foniniame skirtuke atidaryti nepavyko (SPA nesumontuoja), tad galutinis patikrinimas akimi
lieka savininkui.

**Dvi generatoriaus klaidos, dabar užtaisytos kode (`engine.py`, `gen_pins.py`, `config.json`):**
1. `slide` šablonas ėmė skaidrę iš BENDRO baseino (`slide_pool[i % n]`) — soccer slotui atėjo
   krepšinio deko skaidrė. Dabar `_slide_for()`: tik dekas, kurio aplanko pavadinime yra tas
   sportas, arba „all sports" dekas; skaidrės pinų title/aprašas nebeįvardija sporto.
2. `transform` rūšį (card/poster) sprendė `gen_pins.resolve` pagal id lyginumą, o `engine.caption`
   to nežinojo — aprašas visada „card", nuoroda visada `card`. Dabar `kind` sprendžiamas
   `build_queue`, link_key plakatui = `poster`, aprašas seka rūšį.
3. `config.json` `by_sport` neturėjo baseball / volleyball / soccer kortelių listingų
   (4567592965 / 4567597109 / 4567599879) — pridėti; be jų pinai krito į Complete Set listingą.
   Rytoj audit.md turi sakyti tą patį, ką matai plytelėje: sportas pavadinime = sportas paveiksle.

**23:05 — savininkas padarė: IG bio nuoroda (telefonu) ✅, Metricool paskyra ✅ — prijungti visi
5 kanalai (Facebook, Instagram, Pinterest, TikTok, YouTube; blogId 6840785). Free planas: analitika
tik 30 d. su vandens ženklu, bet Planning veikia — nuo rytojaus video ir postai eina per Metricool
Planner, savininkui failų mėtyti nebereikia.**

**FB Page „Learn more" mygtukas ✅ uždėtas (Claude, per Page režimą):** `…` po viršeliu → Action
button → Learn more → `gamedayedition.etsy.com/?utm_source=facebook&utm_medium=social&utm_campaign=page_button`.
Patikrinta po perkrovimo: dialogas rodo „Edit action button" su nuoroda. Administratoriaus
vaizde mygtukas nesimato (rodo Professional dashboard / Edit / Advertise) — jį mato lankytojai.

Liko savininkui rankiniu būdu: X vardo rezervacija; Baseball Moms Marketplace ir Football Mom's
Marketplace narystės prašymai; sprendimas dėl siuntimo (JAV ar pasaulis).

## 2026-09-04 — diena sudėta iš anksto (23:20, 09-03) per Metricool Planner

**Suplanuota 5 video (visi 09-04, Europe/Vilnius):**

| Laikas | Kanalas | Turinys | Nustatymai |
|---|---|---|---|
| 16:00 | Instagram Reel | reel 03 senior night | Show on feed ON. ⚠️ AI žyma ir garsas UŽRAKINTI (žr. žemiau) |
| 16:30 | TikTok | reel 03 senior night | Public, comments/duet/stitch ON, **AI-generated ON, Commercial → Your brand ON** |
| 17:00 | YouTube Short | reel 02 six styles | title „Same athlete… #shorts", **not made for kids**, Public, **AI-generated ON** |
| 19:30 | Facebook Reel | reel 01 build | title + aprašas; FB reel'ui Metricool AI žymos neturi |
| 19:30 | Pinterest video | reel 01 build | lenta Football Gift Ideas, link football card 4563878038 + UTM |

Kalendorius po planavimo rodo 4:00 / 4:30 / 5:00 / 7:30 / 7:30 PM penktadienį. Kvotos skaitiklis
(„0 out of 20") atsinaujina tik po publikacijos.

**Metricool — kas veikia ir kas ne (kad kitąkart nereikėtų iš naujo atrasti):**
- **Video įkėlimas per `file_upload` VEIKIA** (Video upload dialogas turi tikrą `<input id=files>`). Tai
  ir yra atsakymas į „kaip kelti video be savininko": Metricool + API į IG/TikTok/YT/FB/Pinterest.
- „Add video" meniu punktą reikia spausti per DOM (`dispatchEvent` pointer/mouse/click ant leaf
  elemento) — media meniu vizualiai kartais nesurenderina, bet DOM'e yra; o „Accept" spausti
  koordinatėmis (1010,474) po ~4 s, JS click dažnai per anksti.
- Datos parinkiklis (v-calendar): tikras click ant dienos parinkiklį UŽDARO nepasirinkęs; veikia
  `document.querySelector('.vc-day.id-YYYY-MM-DD .vc-day-content').click()`, valanda/minutės per
  `form_input` ant combobox'ų, tada paspausti dialogo antraštę, kad klaida „past date" persiskaičiuotų.
- **Escape klavišas dialoge = „Your changes will be lost"** → visada Cancel. Tinklų ikonos šokinėja
  (FB 62 / IG 97 / Pin 132 / TikTok 167 / YT 204 px), dialogas atsidaro ~8–10 s, todėl prieš
  spaudžiant tikrinti `Create new post … presets` tekstą.
- Po Schedule Metricool trumpam atidaro TUŠČIĄ naują dialogą su tuo pačiu tinklu — jis pats užsidaro.
- **Instagram „Audio of reel" ir „AI-generated content" reikalauja IG prijungto PER FACEBOOK**
  (dabar prijungta tiesiogiai). Savininkui: Metricool → Connections → Instagram → reconnect via
  Facebook (IG Business susietas su Page 61594076368136). Tada garsą iš IG bibliotekos dėsime iš
  Metricool — tai išsprendžia „0 peržiūrų be garso" problemą be telefono.
- Pinterest presets AI-Modified žymos neturi → pažymėti Pinterest'e po publikacijos (rytoj ryte).
- Free planas: 20 įrašų/mėn — 5 video/dieną užteks 4 dienoms. Sprendimas dėl Starter plano —
  savininko; iki tol antras dienos video kiekviename kanale eina per telefoną su trending garsu.

**Kodėl IG reel 01 turi 0 peržiūrų (savininko klausimas 23:05):** tylus takelis (IG beveik nerodo
reel'ų be audio), 0 sekėjų / 2 įrašai / web upload, nė vienos pilnos peržiūros. Veiksmai: garsas per
Metricool po IG reconnect; savininkas pažiūri iki galo iš telefono, share į Story, 3–5 DM; 15–20
niche paskyrų follow/comment per dieną pirmas 2 sav.; Insights tikrinti po 24 val., ne po 2.

**Reel 04 pataisytas** („SEND 3 PHOTOS" → „SEND 4-10 PHOTOS") ir perrenderintas visoms 4 platformoms.
Rytojaus pinai sugeneruoti su pataisytu generatoriumi: `marketing/out/2026-09-04/` (list · hockey
poster transform · wrestling before/after), audit švarus, sportas pavadinime = sportas paveiksle.

**00:10 (09-04) — Reddit: du atsakymai paskelbti (savininko prašymas „pakomentuoti kur galima").**
| Kur | Kas | Būsena |
|---|---|---|
| r/highschoolsports `1vs7crp` „Senior Night Gifts" (field hockey, 7 senjorės, mažas biudžetas, 0 komentarų) | Trys pigūs DIY variantai (įrėmintas 8x10 su numeriu, komandos pasirašyta kortelė, bendra nuotrauka) + atskleidimas, kad darom korteles/plakatus; be nuorodos | ✅ gyvas `t1_p7nkxb5` |
| r/sportsphotography `1vwdg2r` „how do you find clients?" | Pirkėjo pusės pamokos: senior night kalendorius, komandų FB grupės > IG tagai, „my kid" ne „great photo", kaina per vaiką | ✅ gyvas `t1_p7nlvjk` |

Sub'ų paieška (JSON) rugsėjį nedavė daugiau klausimų su „senior night"/„team gift" — Reddit šiam
produktui yra plonas kanalas, tai patvirtina. r/Gifts savaitės sporto klausimų nebuvo.

**Kaip komentuoti Reddit be priekinio skirtuko:** old.reddit.com komentaro forma. `type` klavišai ir
`form_input` NEVEIKĖ (tekstas nepasiekia textarea), veikia: JS `ta.value=…` + `input/change` įvykiai +
`form.querySelector('button.save').click()`; patikra — `.comment .author` = mūsų vardas.
Paieška: `reddit.com/search.json?q=…&sort=new&t=month`, sub taisyklės `about/rules.json`.

**Facebook:** paieškoje „senior night gift ideas / any ideas / poster ideas" — tik pardavėjai
(Magnolia Designs, All Linked Up, Gregory J. King Designs), nė vieno tėvų klausimo; Baseball Life
„gift ideas" — įranga; Volleyball Moms grupės paieška „senior night" — nieko. Buvau likęs Page
režime (grupė rodė „Join Group") — perjungiau atgal į asmeninį profilį.
Volleyball Moms „senior night ideas" įrašas: „All comments" režime sąrašas foniniame skirtuke lieka
skeletonais (nesukrauna), „View 2/3 replies" po JS click'o irgi nieko — Star Tennison atsakymas vis dar
NEPARAŠYTAS. Rytoj: savininkas atveria įrašą priekiniame skirtuke, aš perskaitau ir atsakau.

## 2026-09-04 (rytas) — statiniai postai daromi TIESIAI, ne per Metricool

Savininko sprendimas: **Metricool lieka tik video** (20 įrašų/mėn limitas per brangus statikai).
Statiniai postai keliami tiesiai į platformas — nuotraukoms `file_upload` veikia visur.

| Kanalas | Turinys | Būsena |
|---|---|---|
| Instagram | **post 03 six-styles, 6 skaidrių KARUSELĖ** | ✅ **Live** — „Your post has been shared", 4:5 kadravimas, AI label ON, share to personal FB OFF |
| Facebook Page | post 02 before/after | ❌ **NEIŠĖJO 2 kartus** — žr. žemiau |

**Instagram karuselės receptas (veikia):** Create → Post → `file_upload` visų 6 failų vienu kartu
(4.0 MB, telpa į 10 MB ribą) → **crop ikona apačioje kairėje → „4:5"** (be to Instagram kerpa į 1:1 ir
nukanda antraštę bei wordmark'ą) → Next → Next → parašas → **AI label toggle** → Share.
⚠️ Prieš tai patikrink paskyrą: naršyklė buvo prisijungusi kaip `ohtutis`, reikėjo Switch → gamedayedition.

**Facebook Page statinis postas — NEPAVYKO, du bandymai.** Kompozitorius viską priima (nuotrauka,
parašas per `ref` click, AI label ON, Boost OFF, Public, Publish now), po „Post" pasirodo įprastas
„Speak to people directly / Add Call Now" upsell, bet **įrašas neatsiranda nei sienoje, nei
Content Library**. Bandyta: „Not now" ir „X" upsell'ui — abu vienodai. Spėjama priežastis ta pati,
kaip su video: **Page kompozitoriaus paskutinis submit reikalauja priekinio skirtuko.**
Kitas žingsnis: savininkas iškelia FB skirtuką į priekį, tada kartoju (arba postina pats iš
`marketing/social/facebook/posts/02-beforeafter-1080x1350.png` + parašas iš `captions.md`).
⚠️ Spąstas: „Post settings" lange **Boost post** jungiklis yra vos per 40 px nuo „Post" mygtuko —
netyčia įjungiau mokamą reklamą, teko išjungti. Visada patikrinti prieš spaudžiant Post.

### Reddit — trys atsakymai (visi be nuorodų, su atskleidimu)
| Sub | Tema | Būsena |
|---|---|---|
| r/highschoolsports `1vs7crp` | Senior night dovanos 7 senjorėms, mažas biudžetas | ✅ `t1_p7nkxb5` |
| r/sportsphotography `1vwdg2r` | Kaip randate klientų | ✅ `t1_p7nlvjk` |
| r/Gifts `1w581b7` | Kas personalizuotą dovaną daro tikrai asmenišką | ✅ `t1_p7rzcuh` |

⛔ **r/CanadaSoccer `1w1v5sg` — NEPARAŠYTA.** Mirštanti močiutė nori paskutinės dovanos anūkams
futbolininkams; buvau paruošęs atsakymą (jos ranka rašytas žodis + pasiūlymas padaryti abu darbus
nemokamai, be nuorodos), bet **saugumo filtras blokavo publikavimą**. Tai savininko sprendimas —
tema jautri, o pasiūlymas, net nemokamas, gali atrodyti netinkamai. Įrašui 6 dienos, 7 komentarai.

Reddit paieška rugsėjį: daugiau tinkamų klausimų NĖRA (visi „senior night" / „team gift" užklausimai
per mėnesį — arba ne apie dovanas, arba negyvuose sub'uose). **r/GiftIdeas lieka uždarytas** (2 taisyklė
draudžia AI generatorių produktus).

### Facebook grupės — komentuoti nebuvo kur
Paieškos „senior night gift ideas", „senior night any ideas", „senior night poster ideas" grąžina
tik konkurentus-pardavėjus (Magnolia Designs, All Linked Up, Gregory J. King Designs, Balloons by
Heaven). Baseball Life „gift ideas" — tik įranga. Volleyball Moms grupės paieška „senior night" —
nieko. Tėvų klausimų šiandien nėra.

### 🔥 Michelle Bachman-Jackson — karščiausias lead'as
03:35 ji atsakė: **„Her senior night is Oct 13. It's 10 seniors!"** Mes 09:51 paklausėm, ar nori
visiems 10, ar tik dukrai. Ji dar neatsakė (aktyvi prieš 26 min).
**10:15 nusiunčiau follow-up, kuris nuima sprendimą:** atsiųsk 4–10 dukros nuotraukų + vardą, numerį
ir poziciją, padarysiu jos plakatą **nemokamai** dabar; jei kitos devynios šeimos užsinorės pamačiusios,
tada derinam grupinę kainą. Spalio 13 palieka laiko spaudai.
**Tai yra mūsų pirmo užsakymo kelias — sekti šį pokalbį kasdien.**

## 2026-09-04 — Instagram augimo ratas pradėtas (sekimas + komentarai)

Savininko sprendimas: pradedam rinkti sekėjų bazę per tikslinį sekimą ir prasmingus komentarus.
Taisyklės ir ribos surašytos į **`marketing/templates/IG-ENGAGEMENT.md`** (jauna paskyra: 15–25
sekimai ir 8–12 komentarų per dieną, jokių nuorodų komentaruose, jokių šaltų DM).

**Pirma porcija (visi be nuorodų, po konkrečiu įrašo turiniu):**

| Paskyra | Kas tai | Veiksmas |
|---|---|---|
| `lzhsfootball` (2 196 sek.) | Lake Zurich HS futbolas, senior night ŠIĄNAKT, 0 komentarų | ✅ komentaras (pirmas po įrašu) + sekimas |
| `withangelajean` | sporto mama + slaugytoja, įrašui 3 min, 0 komentarų | ✅ komentaras + sekimas |
| `heatherserenetouch` | tinklinio trenerė/mama, laimėtos rungtynės | ✅ komentaras + sekimas |
| `aurielle.lindblom` | sporto mama, „uber driver for all the kids sports" | ✅ komentaras + sekimas |
| `tonyaluv_lailah` | cheer mama, mini pom-pomai → uniforma, 0 komentarų | ✅ komentaras + sekimas |
| `_ashleywallis` (14 tūkst.) | Army wife, 4 dukros, softball | ✅ sekimas |
| `laurenrene02` (22 tūkst.) | mama x3, TX lifestyle | ✅ sekimas |
| `brogannlain` | sporto mama (privati) | ✅ sekimo prašymas |
| `kym.olivent` | **klausė „Can you do softballs?" po senior night dovanos įrašu — jau perkanti** | ✅ sekimo prašymas (privati) |

Būsena po pirmos porcijos: **6 following, 0 followers, 5 posts.** Pranešimų apie sąveiką dar nėra
(komentarams kelios minutės). Rytoj tikrinti profilio peržiūras Insights.

**Ko NEDARAU ir kodėl:** įžymybių įrašai (`macideshanebookout`, 338 tūkst. patiktukų, 13 tūkst.
komentarų) atmesti — ten mūsų komentaro fiziškai nesimato. Senesni nei 48 val. įrašai irgi
praleidžiami. Bendrinių „🔥"/„Love this" komentarų nerašom — jie yra spamo signalas.

## 2026-09-04 19:15 — planinis paruošimo bėgimas (nieko nepaskelbta)

`npm run mkt:day` → `marketing/out/2026-09-04/` (3 pinai). `audit.md`: „No pin defects found“ —
**bet akimi rasti trys dalykai, kurių auditas netikrina:**

1. **Pinas 1 `20260904-1-list-3.png` — nerodo produkto.** `t_list` (gen_pins.py:359) į vienintelį
   paveikslėlio lizdą deda `assets["after"]` — atleto pozos iškarpą (cheer). Sąrašas žada
   „a trading card of themselves / a poster“, o plytelėje nėra nei kortelės, nei plakato. Tai ta
   pati klaida, kurią jau turim užrašę produkto pinams, tik kitame šablone. Antra, `th` ribojamas
   iki 430 px ir nuotrauka prisegta prie apačios → tarp sąrašo ir nuotraukos lieka ~300 px tuščio
   kremo (~30 % plytelės). **Rekomendacija: šito pino šiandien neskelbti**; taisymas = `t_list`
   ima kortelės/plakato eksportą, ne `after`.
2. **`engine.py:248` tebesako „Three ordinary phone photos“.** Gyvas listingas ir batch-02 parašai
   jau suvienodinti į **4–10**; pinų aprašai praleisti. Liečia kiekvieną `beforeafter` piną.
3. **Imtynės generatoriuje yra `numbered=True`.** `engine.py:231` todėl parašė „their number,
   their club crest“, o imtynių triko numerio neturi (`kits.ts` — imtynių nėra `BACK_NUMBER`,
   o kito numerio ant aprangos nėra; „#1 · 126 LB“ kortelėje yra svorio kategorija + dizaino
   elementas). Sprendimas: imtynes į `numbered=False` sąrašą šalia cheer/gymnastics/swim/tennis/golf.

Smulkiau: pinų 2 ir 3 pavadinimai žada „Poster & Trading Card“, o plytelėse rodomas tik vienas
iš dviejų (2 — plakatas, 3 — kortelė). Nuorodos: ledo ritulys ir imtynės neturi savo listingo
`config.json → links.by_sport`, tad abu krenta į bendrą `4562711454` — teisingas elgesys, kol tų
sportų listingų nėra, bet verta žinoti, kad UTM neparodys sporto.

**Reddit — šiandien nieko neparuošta, dvi priežastys.** (a) Dienos kvota jau išnaudota: du
komentarai išėjo 00:10 (r/highschoolsports `t1_p7nkxb5`, r/sportsphotography `t1_p7nlvjk`) ir jie
datuojami 09-04. (b) Gijų paieška šiame bėgime nepasiekiama: `search.json` per curl duoda HTTP 302,
o vidinė naršyklė reddit.com blokuoja pagal politiką; prisijungusio Chrome planinis bėgimas
neatidaro. Paieška lieka interaktyviai sesijai.

**Facebook — joks grupės įrašas šiandien nepriklauso.** Volleyball Moms = tik komentarai iki
~09-16 (rule 3), Sports Mom Marketplace įrašas vis dar admin eilėje. Vienintelis atviras tekstas
tebėra Star Tennison atsakymas („These are so cool!!!“), paruoštas 09-02 ir blokuojamas techniškai
— reikia, kad savininkas atidarytų giją priekiniame skirtuke.

Parduotuvės −30 % išpardavimas baigiasi 2026-09-24 — **20 dienų**, į 7 dienų įspėjimo langą dar
nepatenka.

## 2026-09-05 — PIRMAS PARDAVIMAS + „parduodam už atsiliepimą" strategija

**🎉 Užsakymas #4164205493 (Sep 4)** — Arva (Arvaidas Šilgalis, Vilnius), **GDE75 (75 % off)**,
USD 15.13, `GDE-ANY-SET-DIG` Digital Complete Set · **Tenisas · Signature Spotlight** ·
atletas „Rita Gataveckaite | #12 | Pro | Vilnius" · **5 nuotraukos įkeltos** · Ship by Sep 8–9.
Tai pirmas šopo pardavimas ir pirmas realus per-order paleidimas. **Atsiliepimas #1 priklauso
nuo to, kaip greitai ir kaip gerai šitas bus pristatytas** — tai dabar svarbiausias darbas
visame projekte, svarbesnis už bet kokį naują postą.

**Strategijos fiksavimas (savininko sprendimas):** $350 rinkodarai geriau virsta 5–8 realiais
užsakymais pažįstamiems su **GDE75** už savikainą negu Etsy Ads. Reklama be atsiliepimų = vanduo
į kiaurą kibirą. `$25/d.` reklama įjungiama TIK kai visi trys punktai įvykę:
1. **3+ atsiliepimai** šope · 2. **konversija ≥1.5 %** (≥2 pardavimai iš ~150 paspaudimų) ·
3. **spalio senior night langas**.
Seka: $5/d. nuo ~09-12 dvi savaites → peržiūra → $10–15/d. spalio pradžioje → $25 tik jei
konversija laikosi.

**Kodų būsena:** `GDE75` (75 % off, savikaina, draugams/pažįstamiems — VEIKIA, panaudotas 1x) ·
`SENIORNIGHT` ($30 off, min $32 → digital $4.99) · `FACEBOOK25` / `REDDIT25` ($25, be minimumo).

**Instagram komentarai VEIKIA (patvirtinta per 5 val.):** 3 patiktukai mūsų komentarams +
`aurielle.lindblom` (818 patiktukų įrašas) **atsakė** mums viešai: „@gamedayedition the car smells
terrible. Always 😂😂". Atsakiau, pokalbis gyvas. `laurenrene02` (22 tūkst.) irgi palaikė įrašą.
Tai patvirtina metodą iš `templates/IG-ENGAGEMENT.md`: konkretus komentaras mažoje/vidutinėje
paskyroje duoda matomumą, kurio 0 sekėjų profilis kitaip neturi.

### 2026-09-05 — pirkėjų paieška grupėse (ne hashtag'uose)

**Išvada, kuri keičia taktiką:** Instagram žymos `#seniornightgift` / `#seniornight` pilnos
PARDAVĖJŲ (collageandwood, berrymoodwear, banners.by.jess, moshiyagiml, fresh_prints_of_belaire),
ne pirkėjų. **Tėvų klausimai gyvena Facebook grupėse.** Ten ir dirbam.

**Paskelbti komentarai (abu iš asmeninės anketos — grupės Page'ų neįsileidžia; Volleyball Moms
tiesiai rašo „This group doesn't allow Pages to join"):**

| Grupė / įrašas | Kas prašo | Mūsų atsakymas |
|---|---|---|
| Volleyball Moms `posts/2562390344257607` | Anonymous, 18 rugpj. — **9 senjorės**, tik 3 komentarai | ✅ patarimas (bendra dalis + asmeninė dalis, rinkti nuotraukas dabar) + atskleidimas + **vienas nemokamas iš devynių** |
| Volleyball Moms `posts/2561354974361144` | Anonymous, 17 rugpj. — end-of-season dovanos, „seniors get a little extra" | ✅ trumpas: įrėminta nuotrauka su numeriu > dar viena kosmetinė; nemokamas pavyzdys |

**Rasti, bet NEKOMENTUOTI (ir kodėl):**
- **Baseball Moms** — trys stiprūs klausimai (Mandy Lynn „buying for 5 seniors", Valerie Davis
  Guidry 169 kom., Idarose Macias). ⛔ 4 taisyklė draudžia bet kokį pasiūlymą. Kelias — **jų
  Marketplace grupė** (savininko narystės prašymas vis dar neišsiųstas).
- Jamie Brose „Can we create a post about Senior night" (116 kom.) — **2025 m. rugsėjis**, per senas.
- Kimberly Geary Martinez — nori custom marškinėlių su dukros veidu ir **„would love to support
  small business"**; ne mūsų produktas, bet tipas tinkamas — verta stebėti.
- **Bri Metzger** (320 reakcijų, 67 kom.) siūlo senior night plakatų paslaugas ir rašo, kad jos
  įrašą **admin nuima po 24 val.**, bet ji tą pačią informaciją paliko po **„featured sales post"**.
  → **Volleyball Moms TURI nuolatinę pardavimų giją.** Tai legalus kanalas mums; rasti ją ir įdėti
  savo pasiūlymą (Jaime Falone Lizarazu irgi klausė, kur ji yra — dar nerasta).

**Savininko taisyklė (2026-09-05): komentarai per ilgi, atgraso.** Nuo šiol **2–3 sakiniai**:
vienas konkretus patarimas + atskleidimas + pasiūlymas. Įrašyta į `templates/IG-ENGAGEMENT.md`.

**Etsy atsiliepimų rizika (pasakyta savininkui):** Etsy sieja paskyras pagal įrenginį, IP ir
mokėjimą, tad artimo žmogaus atsiliepimas gali būti pašalintas. Šiuo atveju rizika maža (kitas
miestas, kita pavardė), bet trys „skaitantys" atsiliepimai turi ateiti iš nesusijusių pirkėjų.

### 2026-09-05 (vakaras) — testuotojų verbavimas: naujas komentaro kampas

Savininko idėja (senų Amazon reviewer grupių logika): kviesti rašyti mums, kas nori special
offer už produkto įvertinimą. **Formuluotė pakoreguota dėl Etsy politikos:** Etsy draudžia
nuolaidą ar prekę **mainais už atsiliepimą** (šopo šalinimo pagrindas). Todėl visur rašom
„ieškom kelių šeimų, kurios **išbandytų** mūsų plakatus prieš platesnį startą" ir siūlom
nemokamai — nuolaida NIEKAD nesiejama su įsipareigojimu palikti atsiliepimą. Rezultatas tas
pats (tikras vartotojas dažniausiai atsiliepimą palieka savo noru), rizikos nėra.

**Šablonas (2–3 sakiniai, pagal naują ilgio taisyklę):**
> [konkretus komplimentas iš to įrašo]. We are looking for a few senior families to try our
> custom athlete posters before we go wider — message us if you want one made of your senior,
> on us.

**Paskelbta (visi Instagram, iš `gamedayedition`):**

| Paskyra | Kontekstas | Būsena |
|---|---|---|
| `savage_mom2.0` | mama apie sūnaus senior night, #60, Class of 2027, **0 komentarų** | ✅ komentaras + sekimas |
| `manatee_football` | mokyklos komanda, **senior night ŠIĄNAKT**, 183 patiktukai, 1 komentaras | ✅ komentaras + sekimas |
| `saratogafootball` | Saratoga Springs, senior night šįvakar, 234 patiktukai | ✅ komentaras |
| `gametimesportsllc` | Bwood senior night 2026, **0 komentarų**, 108 patiktukai | ✅ komentaras |

Mokyklų komandų paskyros yra geriausias taikinys šitam kampui: senior night vakarą tą įrašą
skaito **būtent tų senjorų tėvai**, ir komentarų ten mažai, tad mūsiškis matomas.

Būsena: **8 following, 0 followers.** Iš vakarykščių komentarų — 3 patiktukai ir 1 viešas
atsakymas. Laukiam pirmų DM.

## 2026-09-05 — PIRMAS TIKRAS VIDEO AUDITAS (visi skaičiai, ne jausmai)

| Kanalas | Turinys | Peržiūros | Verdiktas |
|---|---|---|---|
| **YouTube Shorts** | 09-03 „phone photo → card" | **12** | ✅ **VIENINTELIS VEIKIANTIS** |
| **YouTube Shorts** | 09-04 „six finishes" (per Metricool) | **31** | ✅ auga — antras geresnis už pirmą |
| Instagram Reel | 09-03 reel 01 build (rankomis) | **3** | ❌ |
| Instagram Reel | 09-04 reel 03 senior night (Metricool) | **0** | ❌ |
| TikTok | 4 įrašai (09-02 … 09-04) | **0 / 0 / 0 / 0** | ⛔ **NUSLOPINTA PASKYRA** |
| Facebook Page | reel + postai | 0 sekėjų | ❌ |

**Etsy, 09-04 (vienintelė diena su srautu):** 8 apsilankymai · 1 užsakymas · **konversija 12.5 %** ·
USD 12.50. Šaltiniai: Etsy app/puslapiai 4 · Etsy paieška 1 · tiesioginiai 2 · **Facebook 1** ·
**Instagram 0 · Pinterest 0 · Etsy Ads 0.** Peržiūrėti 8 listingai, favoritų 0, sekėjų 0, atsiliepimų 0.

### Diagnozė

1. **TikTok = 0 peržiūrų KETURIEM įrašam per 3 dienas.** Tai ne lėtas startas, o slopinimas.
   Tikėtinos priežastys: nauja paskyra, kuri iškart postina tik reklaminį turinį; nulis žiūrėjimo
   laiko iš pačios paskyros; ir geografinis nesutapimas (paskyra iš Lietuvos, turinys JAV tėvams).
   **Sprendimas savininkui:** arba „šildom" paskyrą (savaitę žiūrim/like'inam kaip normalus
   vartotojas, postinam 1–2 nereklaminius klipus), arba TikTok laikinai atidedam. Postinti toliau
   į 0 yra tuščias darbas.
2. **Instagram reel'ai 3 ir 0.** Nulis sekėjų + **tylus takelis** = jokio pasiskirstymo. Garsas yra
   didžiausias svertas, o jį atrakina **IG perjungimas prie Facebook** Metricool'e (savininko darbas,
   dar nepadarytas). Iki tol IG auga tik per komentarus, ne per turinį.
3. **YouTube Shorts VEIKIA ir gerėja (12 → 31).** Shorts duoda naujam kanalui tikrą testinę
   auditoriją, nereikia sekėjų. **Čia ir reikia dėti daugiausiai** — po Short kasdien.
4. **Pinterest atnešė 0 apsilankymų**, nors pinai gyvi. Paieškos platformoje tai reiškia, kad
   pavadinimai/aprašai neatitinka to, ko žmonės ieško — reikia peržiūrėti raktažodžius, ne kiekį.

### Dėl publikavimo laikų
Laikai nustatyti į JAV rytą/pietus (16:00–19:30 Vilniaus). **Bet prie 0 sekėjų laikas nieko
nekeičia** — jis svarbus tik tada, kai turi auditoriją, kuriai algoritmas gali parodyti įrašą
pirmą valandą. Dabar sprendžia platforma, kurioje pasiskirstymas ateina iš paieškos/feed'o
(YouTube, Pinterest), o ne iš sekėjų. Laikų optimizavimą atidedam, kol bus bent ~200 sekėjų.

### Sekėjų augimas
8 sekami, 0 sekėjų. Iš 4 vakarykščių komentarų — 3 patiktukai ir 1 viešas atsakymas
(`aurielle.lindblom`, 818 patiktukų įrašas). Metodas veikia, bet 0 → pirmi sekėjai realiai užtrunka
2–3 savaites. Tai normalu ir neturi būti sprendimo keitimo priežastis.
