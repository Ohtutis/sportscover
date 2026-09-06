# gamedayedition.com — svetainės MASTER PLANAS (2026-09-06)

> ⚠️ **2026-09-06 (vėliau tą pačią dieną) — kryptis pasikeitė.** Savininko sprendimu svetainė **parduoda tiesiogiai** (Stripe) kaina kiek aukštesne nei Etsy, statoma **iš naujo** (ne tiesos praėjimas esamame puslapyje), Stripe iš 5 → 2 fazės, komandų nuoroda v1 — 2 fazė. **Vykdomasis dokumentas dabar yra `docs/SITE-BUILD-SPEC-2026-09.md`** (sekcija po sekcijos). Šis dokumentas lieka kaip auditas ir taisyklių kanonas; kas keičiasi — žr. spec'o §14.


> **Kam skirta.** Savininkui ir kitam agentui, kuris statys svetainę. Tai kanonas svetainės sprendimams; produkto/gamybos kanonas lieka `CLAUDE.md`, `docs/GAME-DAY-EDITION.md`, `docs/ETSY-LISTINGS.md`, `docs/SUPPLIERS.md`.
> **Metodas.** 9 lygiagretūs repo skaitytojai (410 faktų, 104 spragos) → 3 nepriklausomi plano juodraščiai (reklama / SEO / produktas-pasitikėjimas) → 3 teisėjai → sintezė → „ko trūksta“ kritikas (23 spragos, 11 konfliktų su repo taisyklėmis, 18 greitų laimėjimų) → 55 teiginių verifikacija prieš repo (53 patvirtinti, 2 paneigti) + gyvi `curl` patikrinimai produkcijoje. Kur sintezė ir kritikas nesutapo, žemiau įrašytas **suderintas sprendimas** (žymima `SPRENDIMAS`).
> **Kalba.** Lietuviškai; failų keliai, CTA tekstai, draudžiami stringai ir listingų ID — pažodžiui angliškai, nes tokie jie yra kode ir Etsy.

---

## 0. TL;DR — 12 dalykų, kuriuos reikia žinoti

1. **Svetainė gyva (gamedayedition.com → www, Vercel), bet vis dar „Cover Moment“**: `<title>`, 404 puslapis, og:image rodo į `sportscover.vercel.app`, og:description žada **25 korteles**. Prod'e nėra `NEXT_PUBLIC_BRAND_NAME` / `SITE_URL`. Pataisoma per 5 min env'ais + per dieną kode.
2. **Registro puslapis `/c/<cardId>` yra PARDUOTAS produktas** („Live registry page linked from the QR code on the card“ — 14 iš 21 listingo), QR jau atspausdinti ant kortelių nugarų, sertifikatų ir Etsy paieškos nuotraukų — o puslapis yra pats save vadinantis **placeholder** (19/22 kortelių be statistikos, `#01` cheerleading'ui, „Cover Moment“ OG). Tai **pirmas** darbas.
3. **4 naujausių kortelių QR (softball/wrestling) gyvai grąžina 404**: įrašai `lib/registry/cards.ts` ir 4 QR PNG neįkomitinti šiame branch'e; Vercel deployina `main`. Proceso taisyklė: **registras deployinamas PRIEŠ listingui tampant gyvam**.
4. **Etsy off-platform taisyklė yra griežta**: jokio svetainės URL / el. pašto / „message me“ NIEKUR, ką pirkėjas mato prieš pirkimą. Etsy→web tiltas leidžiamas **tik apmokėto užsakymo vykdymui**: QR ant kortelės, `/order/<token>` (patvirtinimai), `/order/<token>/files` (pristatymas). Web→Etsy — laisvai, per `/go/etsy/<sku>` su UTM ir Share & Save.
5. **Svetainės kaina = Etsy kaina (niekada pigiau, jokių kuponų svetainėje).** Dabar svetainė rodo $119/$199/$299 vs Etsy V3 $29.39–$139.99 — ne tik neteisinga, bet ir Etsy politikos rizika. Vienas failas `lib/catalog/prices.ts` + CI testas.
6. **Etsy lieka sandoris visoms vartotojų pakopoms**, kol nepereiti matuojami vartai (Stripe — 5 fazė). Svetainės vaidmuo dabar: registras + fulfilment + brandas + turinys; **komandos** — po ~50 Etsy užsakymų.
7. **139 MB / 36 failų rinkinys netelpa į Etsy digital delivery (5×20 MB)** → svetainė yra vienintelis legalus pristatymo kanalas. `/order/<token>/files` — kietas blokatorius, statomas anksti (2 fazė), o patvirtinimų UI — tik kai užsakymų > ~5/dieną.
8. **Reklama (Meta) — tik per vartus, ne pagal datą**: ≥3 realūs Etsy atsiliepimai, listingo konversija ≥1.5 %, 0–2 fazės išėjimo kriterijai, teisininko peržiūra, pikselis+CAPI patikrinti, gamybos pajėgumas įvardytas užsakymais/dieną. Nusileidimas tik ant **≥$76.99** pakopų, niekada ant digital. Realiai — sausis–kovas 2027, nebent vartai įvykdyti spalį.
9. **Realybė, ne prognozė**: repo įrodo **1 realų užsakymą** (4164205493, tennis, Digital Complete Set); „$1.9k/mėn“ atmintyje yra 6–12 mėn. prognozė. Paskutinis realus užsakymas kainavo **~22 val., 57 generacijas, €17.75** (modelis sakė €2.60–3.30). Planas nesiremia esamomis pajamomis ir riboja spausdinimo pažadus pajėgumu.
10. **Teisinė spraga, kurios nė vienas juodraštis nematė**: pipeline'as skaičiuoja **ArcFace veido embedding'us** (biometrija — Illinois BIPA, Texas CUBI, GDPR 9 str.), studija Lietuvoje (GDPR taikomas), nuotraukos eina į Google Vertex AI. Reikia biometrinio sutikimo eilutės, subprocesorių sąrašo, teisininko scope su BIPA/GDPR/COPPA; **ArcFace balai klientui niekada nerodomi**.
11. **Kaštų disciplina**: sintezės 1–3 fazės buvo per didelės (5 lentelių DB, 4 CLI, 7 šriftų poros, 12 datuotų postų, A/B už $1.2k prieš $350 biudžetą). Suderinta: **registras statinis** (TS/JSON + `generateStaticParams`), DB — kai augs; **pillar 4 puslapiai + 2–3 trust postai**, blogas plečiamas pagal GSC; **jokio A/B** kol spend < ~$1k/mėn; pikselis+CAPI — tą savaitę, kai vartai realiai įvykdyti.
12. **Hostingas**: Vercel Hobby **draudžia komercinį naudojimą** → Vercel Pro ($20/mėn) yra „tai, ko reikia“, ne prabanga. Supabase free **pauzuoja po ~7 d. neveiklumo** → `/c` NIEKADA neturi priklausyti nuo DB, kuri gali užmigti (dar viena priežastis statiniam registrui).

---

## 1. Auditas: kas yra ŠIANDIEN

### 1.1 Gyvai patikrinta produkcijoje (2026-09-06, `curl`)

| # | Faktas | Įrodymas |
|---|---|---|
| 1 | `gamedayedition.com` → 308 → `www.gamedayedition.com`, 200, Vercel (`x-vercel-cache: HIT`); DNS A `216.198.79.1`, www CNAME → `vercel-dns` | `curl -I -L` |
| 2 | `<title>Custom Youth Sports Posters & Trading Cards \| Cover Moment</title>` — ir 404 puslapyje | `curl` + grep |
| 3 | `og:image` = `https://sportscover.vercel.app/og.webp` (metadataBase iš `NEXT_PUBLIC_SITE_URL`, prod'e = vercel.app) | meta tag |
| 4 | `og:description` = „… **25** personalized trading cards …“ (turi būti 18) | `app/layout.tsx:27` |
| 5 | `/robots.txt`, `/sitemap.xml`, `/blog`, `/senior-night` → **404** | `curl -L` |
| 6 | Jokio `fbq`/`gtag`/analytics HTML'e (0 atitikmenų) | grep |
| 7 | `/c/GDE-SN-BKB-2026-23` → 200; `/c/GDE-CA-SFB-2026-03`, `/c/GDE-FS-WRS-2026-01` → **404** | `git diff` rodo 4 `cardId` tik lokaliai; `public/cards/qr/GDE-{CA,SN}-SFB-2026-03.png`, `GDE-{FS,HE}-WRS-2026-01.png` untracked |
| 8 | `/privacy`, `/terms` → 200, bet su „POLICY TEMPLATE“ / „TERMS TEMPLATE“ antraštėmis ir „not legal advice“ pastaba | `app/privacy/page.tsx:8,19` |
| 9 | Šio branch'o `app/` ir `lib/` = `origin/main` (diff tuščias) → gyva svetainė = `main` | `git diff --stat origin/main..HEAD` |

### 1.2 Kas yra kode (repo skaitytojų išvados, patvirtintos)

- **5 puslapių maršrutai + 2 API**: `/`, `/privacy`, `/terms`, `/c/[cardId]`, `/api/submissions/{start,complete}`. Nėra `not-found.tsx`, `error.tsx`, `sitemap.ts`, `robots.ts`, `opengraph-image`, middleware, redirect'ų, security header'ių.
- **Vienas 607 eilučių `"use client"` komponentas** (`app/site-client.tsx`, 53 KB, 14 `useState`) laiko VISĄ turinį: hero, 5 senų stilių sąrašą (Neon Future, Vintage — išmesti 2026-08-19; trūksta Heritage, Signature Spotlight, Prism Rush, Senior Night), $119/$199/$299 paketus, add-on'us, „Team Collection from $699“, 5 žingsnių formą, FAQ. Copy'je: „Stripe payment link“, „One revision“, „Upload 3–5 photos“ (Etsy: 4–10), „JPG + print-ready PDF“ (pipeline'as: tik PNG 300 dpi), „10–15 s cinematic reveal“ (realiai: 5 s flip), „16 pt cardstock“, „semi-gloss“, „limited number of projects each week“.
- **Prekės ženklas**: `app/site-config.ts:2-4` default'ai „Cover Moment“, `hello@covermoment.co`; „CM“ tekstinis ženklas (`site-client.tsx:434,602`, `privacy:8`, `terms:8`); „From Camera Roll to Cover Moment.“ (`:516`); `public/og.webp` piešinys su užrašu COVER MOMENT; `package.json` name `cover-moment`; README; `.env.example`; Resend from-email; `sessionStorage` raktas `cover-moment-idempotency`; Turnstile callback `onCoverMomentTurnstile`.
- **Registras**: `lib/registry/cards.ts` — ranka redaguojamas TS masyvas, 22 įrašai (21 fiktyvūs demo per 9 atletus + **1 realus klientas** `GDE-SS-TEN-2026-12` su miestu ir Etsy užsakymo ID git'e). ID schema `GDE-<style>-<sport>-<season>-<number>` **neturi unikalumo** (antras #12 tos pačios sezono/šakos koliduoja; visos šakos be numerio gauna „01“). `getAthleteCards()` egzistuoja, nenaudojama. `scripts/gen-card-qr.ts` → `public/cards/qr/<id>.png` koduoja `https://gamedayedition.com/c/<id>`.
- **`/c/[cardId]`**: inline stiliai, `system-ui`, mėlyna `#1d4ed8`; statistika tik iš `ppg/apg/rpg` (`:34-38`) → 19/22 kortelių tuščios; `#{jerseyNumber}` besąlygiškai (`:60`); hard-coded „FIRST EDITION“; nėra paveikslo, flip, wallpaper, share, OG, `/a/`; nėra jokio visibility/noindex — nepilnamečių vardai ir statistika vieši visiems, turintiems URL.
- **Užsakymų forma**: Supabase signed upload + Postgres `submissions` (12 būsenų enum, RLS, privatus bucket, EXIF nuimamas kliento pusėje), HMAC token, Turnstile (fail-closed), Resend (raw fetch). **Lokaliai nėra jokių paslapčių**; ar prod'e forma veikia — nežinoma. Stripe — tik copy. Serveris **reikalauja** jersey_number/position/colours (`api/submissions/start/route.ts:30-33`) — laužo šakas be numerio. DB constraint `photo_count between 0 and 5`.
- **Negyvas karkasas**: `db/index.ts` importuoja `cloudflare:workers`, `db/schema.ts` = `export {}`, drizzle journal tuščias, `app/chatgpt-auth.ts` niekur neimportuojamas, `examples/d1`, `.vinext/.wrangler/dist`, tušti `tests/`, `worker/`, nėra `.github/`. Vienintelė reali DB — Supabase.
- **Vaizdai**: 17 sporto sprite-sheet'ų (`public/images/sport-examples/*.webp`, 3×2 langelių, CSS `background-position`) rodo **senus 5 finišus** ir Nike swoosh ant fiktyvaus kito; nėra jokių Heritage/SS/PR/SR vaizdų; `exports/*/bonus` ir `shared-cutouts` dar su Nia Brooks.
- **Marketingas**: kiekviena nuoroda iš pinų/bio/Shorts/FB veda į `gamedayedition.etsy.com` arba listingą; svetainė funnel'e **nedalyvauja**. `marketing/config.json public_base` tuščias (pinų PNG hostingas nesukonfigūruotas); `report.py` niekada nepaleistas (`metrics.csv` 2 eilutės). Kanalai: YouTube Shorts vienintelis platinantis (12→31 views); IG 0 sekėjų, TikTok suppressed, Pinterest 0 vizitų, Reddit 1 karma. Vienintelis užsakymas — pažįstamas su GDE75.

### 1.3 Verslo kontekstas, kurį svetainė turi atspindėti

- **Etsy**: 21 gyvas listingas (6 sport card, 6 sport poster, 1 any-sport Complete Set, 8 Senior Night set), visi Physical su 4 pakopų „Package“ variacija; softball/wrestling card+poster pastatyti, nepublikuoti. **V3 kainos (bazė → pirkėjo kaina su nuolatine −30 % sale)**: cards 41.99→29.39 / 69.99→48.99 / 98.99→69.29 / 84.99→59.49; posters 41.99→29.39 / 83.99→58.79 / 97.99→68.59 / 155.99→109.19; sets 49.99→34.99 / 109.99→76.99 / 135.99→95.19 / 199.99→139.99. **Sale baigiasi 2026-09-24** — jei neatnaujinta, Etsy šoka į bazę, o svetainė su sale kainomis tampa „pigesnė“.
- **Produktas**: 7 stiliai (6 finišai + Senior Night kaip proga, be stiliaus dropdown), 17 šakų; **18 kortelių pakelis = VISO** (4 holo chase + 14 standard; niekada „18 + 4“); statūs kampai, UV danga; plakatai matiniai 189 g/m²; nemokamas spausdintas sertifikatas kiekviename siunčiamame pakete; 28 failų digital rinkinys; 5 s flip; „DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7 · SEALED PACK 2–3 WEEKS“; niekada „instant download“. **Count-bearing menas dar sako 10** (TGC pack face, sertifikatas) — blokatorius prieš pirmą pakelį.
- **Tiekėjai** (`docs/SUPPLIERS.md`): kortelės Bay Photo (US), plakatai Printful (US), banneriai WHCC, pakelis QPMN (**Honkongas**, 2–3 sav.). US de minimis panaikintas 2025-08 → HK pakelis gali gauti muito/brokerio sąskaitą — DDP/DDU **neišsiaiškinta**.
- **Raktažodžiai**: visi skaičiai — Etsy Marketplace Insights (ne Google). Trys varikliai: **senior night** (spalis 6 475 / sausis 3 267), **Kalėdos** (football gifts lapkritis 26 708), **pavasario baseball** (baseball mom kovas 27 820; custom baseball card 16.6k/m.). Taisyklė: „matched intent beats volume“.
- **Reklamos slenkstis** (atmintis): $43 pakopa neapsimoka; riba ~$69, veikia nuo $99; svetainės kaina = Etsy kaina.

---

## 2. Strateginiai SPRENDIMAI (užrašyti kartą, taikomi visur)

| # | Sprendimas | Pagrindas |
|---|---|---|
| S1 | **Kanalų vaidmenys.** Etsy = sandoris visoms vartotojų pakopoms bent iki 2027 Q1 mokamo testo. Svetainė = registras (`/c`), fulfilment (`/order`), brandas, turinys. Komandų kanalas — po ~50 Etsy užsakymų, kaip KITAS produktas (sąskaita + kalendorius), ne tas pats už kitą kainą. | atmintis gde-revenue-and-site-role; 1 realus užsakymas, 0 atsiliepimų |
| S2 | **Etsy→web tik po pirkimo.** Jokio URL/el. pašto/„message me“ listinguose, nuotraukose, announcement'uose, pre-sale žinutėse. Leidžiama: QR ant kortelės/sertifikato → `/c`; pirma post-purchase žinutė → `/order/<token>`; pristatymo žinutė → `/order/<token>/files` (+ kortelės front PNG ir flip MP4 prisegti natūraliai Etsy, telpa į 5×20 MB). **Slide 17 be teksto URL** — QR yra vienintelis sankcionuotas tiltas. | docs/ETSY-COPY.md „Three rules that close shops“; etsy/LISTING-IMAGE-CANON.md §4 |
| S3 | **Kainų paritetas struktūriškai.** `lib/catalog/prices.ts` (bazė + sale + `saleExpiresAt`); VISI rodomi skaičiai iš jo (niekada hardcode copy'je); po `saleExpiresAt` svetainė automatiškai rodo bazę; Vitest testas kerta build'ą, jei kaina < Etsy sale; variantų pavadinimai = Etsy (≤20 simb.). Savininkas perrenka lentelę kiekvieną kartą keisdamas sale. | atmintis gde-paid-ads-threshold; kritiko #6 |
| S4 | **Registras statinis pirmiausia.** `lib/registry/cards.ts` lieka source of truth; `generateStaticParams` visiems įrašams; `visibility: public\|unlisted\|private` laukas; `card:new` scriptas (ID su unikalumu + QR + įrašas). DB (Supabase Postgres, ne D1) — kai realių kortelių > ~50 arba atsiras `/a` poreikis. `/c` niekada nepriklauso nuo DB, kuri gali užmigti. | kritiko overreach #1, hosting #10; docs: „migrate to DB once volume grows“ |
| S5 | **PII realių klientų įrašuose minimizuojama, ne perkeliama į env var.** Įraše lieka tik tai, kas atspausdinta ant kortelės (vardas, komanda, pozicija, statistika, finišas); **pašalinami** miestas, Etsy užsakymo ID, el. paštas, komentarai. Realūs klientai default **unlisted + noindex**; repo lieka privatus. Env var — konfigūracija, ne duomenų saugykla (matoma bendradarbiams ir build loguose). | kritiko contradictions #11; atmintis gde-etsy-offplatform |
| S6 | **`/order`: pristatymas pirma, patvirtinimai — pagal apimtį.** `/order/<token>/files` (signed download, 139 MB) — 2 fazė, nes tai vienintelis kietas blokatorius. Plate/proof patvirtinimai lieka Etsy žinutėse, kol užsakymų < ~5/dieną; tada UI. **ArcFace/identity balai klientui NIEKADA nerodomi** (biometrinė rizika + ginčai dėl skaičiaus). | kritiko overreach #4, legal #1 |
| S7 | **Vartotojų intake forma svetainėje išjungiama.** Svetainė „nieko neparduoda“ → forma be mokėjimo kelio yra aklavietė. Vartotojų CTA → „Order on Etsy“. Lieka tik **komandų užklausos** forma (supaprastinta) ant esamos Supabase infrastruktūros. Jokios 4–10 foto migracijos, hex pickerių, sex/age laukų dabar — jie grįžta su Stripe (5 fazė). | kritiko contradictions #2, overreach #13, web-form destiny #22 |
| S8 | **Matavimas etapais.** Dabar: GA4 (consent-mode) arba Vercel Web Analytics + Speed Insights (nemokama, be slapukų), Google Search Console, Bing, Pinterest `p:domain_verify`, Meta domain-verification meta, `/go/etsy` klikų logas. **Meta Pixel + CAPI — tą savaitę, kai reklamos vartai realiai įvykdyti**, ne anksčiau. Pikselis NIEKADA nekraunamas `/c`, `/a`, `/order`. | kritiko overreach #5; sintezės ads_readiness #12 |
| S9 | **Offsite Ads: OPT OUT** dabar ir per visą Meta testą (išvengia 12–15 % dvigubo mokesčio ir dvigubos atribucijos); peržiūrėti pasiekus $10k/m. | docs/ETSY-COPY.md rule 3; marketing/README.md prep 6 |
| S10 | **Leidimo (edition) gramatika.** Registro įrašas = leidimas (vienas atletui × finišui × sezonui). Fizinės kortelės nenumeruojamos. Pakelis: „18 cards — 4 holographic chase, 14 standard“. Sertifikatas: cardId, „Registered Edition“, ISSUED data, count-neutral. „1 OF 1“ — tik Senior Night. Listingų slide 02 „NUMBERED“ = **„carries its registered card ID“** — vienas sakinys visur (ne nuotraukų perdarymas). `serial` laukas 22 įšaldytiems įrašams lieka, nerodomas (išskyrus SR). | sintezė card_page_registry #4; kritiko #5 |
| S11 | **Logo sakinys (vienas abiem kanalams).** „We never reproduce league or governing-body marks (NFL, FIFA, NCAA, Olympic). Your school or club's own crest — yes, exactly as you send it.“ „Nike = Nike“ taisyklė galioja **gamybai** (kopijuojam kliento kitą kaip yra) — **nereklamuojama** svetainėje ir Etsy; įeina į teisininko scope. | kritiko #8; CLAUDE.md 2026-09-02 |
| S12 | **Siuntimo tekstas**: „Printed and shipped free in the US“ (COGS dengia tik USPS domestic). Tą pačią dieną taisomas IG bio „free shipping worldwide“. QPMN raštu klausiama DDP/DDU ir muito per pakelį — atsakymas eina į `/guarantee`. | marketing/CHANNEL-LOG.md; kritiko #8 supply chain |
| S13 | **Hostingas**: Vercel **Pro** ($20/mėn) — Hobby draudžia komercinį naudojimą; tai atitikties, ne patogumo klausimas. Analitika nemokama (Vercel WA / GA4). Supabase lieka free, kol registras statinis; jei DB — Pro ($25/mėn) su backup'ais. | kritiko #10 |
| S14 | **Pixel įvykis Etsy klikui = custom `EtsyClick`** (value = pakopos sale kaina, content_ids = SKU), server+client su tuo pačiu `event_id`; NE `InitiateCheckout` (off-platform perdavimas nėra checkout signalas), NE `Lead`. `Purchase` — tik su Stripe (5 fazė). | sintezė ads_readiness #4 |
| S15 | **Pirkėjų duomenų taisyklė (rašytinė).** Etsy pirkėjų el. paštai/vardai/užsakymų ID **niekada** nekeliami į Meta/Google (offline conversions, custom audiences), nededami į naujienlaiškį be atskiro opt-in, nefiguruoja analitikos įvykiuose. QR-skenuotojai niekada netampa reklamos auditorija. | sintezė etsy_integration #14; kritiko COPPA |
| S16 | **Reklamos tikslai**: ROAS ≥ **3:1** po Etsy mokesčių (ne 2.5:1); blended CPA ≤ $30 ant ≥$76.99 pakopų; cost/EtsyClick ≤ $3; LP→EtsyClick ≥ 8 % (paid) / ≥ 4 % (organic); nulis spend'o digital pakopai; **jokio A/B** kol spend < ~$1k/mėn (200 klikų/šaka × $3 = $1.2k prieš $350 biudžetą). | atmintis gde-paid-ads-threshold (3.3:1 ant $99); kritiko overreach #7 |
| S17 | **Publikavimas lieka žmogaus** — `/social/*.mp4` hostingas Graph/YouTube API maršrutui **atidedamas**, kol savininkas nenusprendžia automatizuoti. `/pins/` hostingas (Pinterest bulk CSV) — taip, 0 fazėje. | marketing/README.md; kritiko #7 |
| S18 | **Kiekvienas regeneruotas kadras** (17 sporto vaizdų, Nia Brooks pakeitimai, LP kūrybos) eina per tą patį judge auditą kaip marketingo kadrai. | atmintis gde-audit-all-generated |
| S19 | **Demo `/c` puslapiai, pasiekiami iš listingų QR**: vienintelis komercinis CTA — „Get yours on Etsy“ (paritetas). Prieš Stripe (5 fazė) iš jų nuimama site-commerce navigacija ARBA listingų nuotraukos pereksportuojamos be QR — kitaip QR tampa pre-purchase nuoroda į off-platform checkout. | kritiko contradictions #10 |
| S20 | **Kanoninis domenas = `www.gamedayedition.com`** (apex jau 308 → www). QR koduoja apex — vienas redirect'as, priimtina; `NEXT_PUBLIC_SITE_URL=https://www.gamedayedition.com`; HSTS preload, CAA, DMARC — DNS užduotys 0 fazėje. | gyvas `curl`; kritiko DNS #20 |

---

## 3. Tikslinė architektūra (sitemap su prioritetais)

`P0` = 0 fazė (savaitė 1) · `P1` = 1–2 fazės · `P2` = 3 fazė · `P3` = 4–5 fazės (vartai)

| Kelias | Paskirtis | Pr. | Pastabos |
|---|---|---|---|
| `/` | Brandas. 0 fazė = **tiesos praėjimas** esamame puslapyje (rebrand, 7 stiliai, kainos iš `prices.ts`, chips, registro paminėjimas, CTA „Order on Etsy“ + „Look up a card“). Perstatymas iš server sekcijų — **tik 3 fazėje ir tik jei `/go` klikai / reklama egzistuoja**. | P0/P2 | Hero receptas iš Etsy (viena „before“ nuotrauka → poster + card + pack kompozitas), 5 s flip už plakato rėmo, „from $29.39 digital · $76.99 printed set“ (iš `prices.ts`). Iš `<title>` išmesti „youth“ (docs/ETSY-COPY.md). |
| `/c/[cardId]` | **QR digital twin — parduotas produktas.** Spec'as §5. | **P0** | Kelias ir 22 esami ID **įšaldyti amžinai** (atspausdinti). 0 fazė — duomenų klaidos; 1 fazė — perstatymas. |
| `/registry` | Paieškos langelis: įvedi ID nuo kortelės nugaros/sertifikato → 302 į `/c/<id>`. **Ne** enumeracija; unlisted/private niekada nerodomi; rate-limit (ID nuspėjami). Indeksas (viešų demo kortelių) — atidėtas. | P1 (tik forma) | SPRENDIMAS: atskiro `/verify` nėra — edition panelis `/c` yra verifikacijos paviršius. |
| `/a/[athleteId]` | Atleto kolekcija (visos kortelės per sezonus/finišus). | **atidėta** | Kol nė vienas atletas neturi 2 realių kortelių ir demo `classOf` prieštaringi. `getAthleteCards()` jau yra. |
| `/order/[token]/files` | **Pristatymas**: 5 aplankai (print/social/wallpapers/bonus/video) su dydžiais/formatais (tik PNG 300 dpi), README spausdinimo patarimai, COMPLETE-SET zip; signed URL. | **P1 (2 fazė)** | noindex; 32 baitų atsitiktinis token su galiojimu; jokių kainų/upsell/kuponų. Leidžiama kaip apmokėto užsakymo vykdymas. Link atkūrimas: užsakymo nr. + pirkėjo el. paštas → persiųsti nuorodą. |
| `/order/[token]` | Būsena: Photos received → Photo check → Reference plate (JŪSŲ patvirtinimas) → Shots → Proof (approve / 1 revision) → Printing → Shipped (tracking per paketą) → Files. | P3 (kai > ~5 užs./d.) | Iki tol patvirtinimai Etsy žinutėse. „Approving means you checked name, number, spelling, colours“ + „Edit customization“ prieš approve. Jokių ArcFace balų. |
| `/go/etsy/[sku]` | **Sekamas išeinantis redirect**: SKU → gyvas listingas `https://gamedayedition.etsy.com/listing/<id>` (Share & Save, 4 % mokesčio grąža), UTM passthrough, klikas logu'ojamas prieš 302. Nežinomas SKU → Complete Set 4562711454. | **P0** | `app/go/etsy/[sku]/route.ts`; SKU žemėlapis iš `etsy/SEO/SKU-REGISTRY.md` + `marketing/config.json links.by_sport`. Vėliau čia šaunamas `EtsyClick`. |
| `/etsy` | Parduotuvės redirect bio/profiliams (viena nuoroda): 302 → `https://gamedayedition.etsy.com/?utm_source=site&utm_medium=referral&utm_campaign=shop`. | **P0** | Leidžia bio perjungti į gamedayedition.com neprarandant Etsy atribucijos. |
| `/trading-cards`, `/posters`, `/complete-set` | 3 produktų šeimos: 4 „Package“ pakopos (Etsy variantų pavadinimai, kainos iš `prices.ts`), deliverables iš LISTING-COPY-PACK, leidimo paaiškinimas („18 cards — 4 holographic chase, 14 standard“, square-cut, UV, free certificate), OUR PROMISE, HOW IT'S MADE, šakos pasirinkimas → `/go/etsy/<sku>`. | P1 | Product JSON-LD su `offers.url` = Etsy listingas. `/posters` = dekoro lentyna. **30×40 XL slepiamas**, kol nėra print failo. |
| `/senior-night` | Proga-hub'as (Engine A). Tik SR stilius, be finišo pasirinkimo; chip'as pažodžiui „FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS · SEALED PACK 3–4 WKS“; order-by skaičiuoklė (renginio data → kuri pakopa dar spėja; **US laiko juosta, US datų formatas**); CTA → 4564565764. | **P1 (minimalus, ~3 sav.)** | Google reitingo spalio 2026 pikui naujam domenui nesitikima — 2026 darbas: nuorodų taikinys pinams/Reddit/FB/spalio testui + indeksas sausio aidui. |
| `/senior-night/[sport]` | Tik 9 išmatuotos šakos: volleyball (528 High), football (328, +146 %), soccer (213), cheerleading (125, be numerio), baseball, softball (Apr 1 757), wrestling (Jan 618), ice-hockey (Jan 341), basketball (Jan). | P1 (2 fazė; 4 iki Oct 15, likusios iki Dec 1) | Niekada dance/track/band/lacrosse (mirę terminai). CTA → SN listingai (§4). |
| `/christmas-gift` | Engine B hub'as (football gifts lapkritis 26 708): order-by datos iš chip'ų, per-sport CTA į evergreen listingus. Live iki Oct 20; šventinis copy nuimamas Jan 5. | P1 | Niekada „instant download“. |
| `/how-it-works` | 6 žingsniai kaip Etsy (PHOTO CHECK · KIT BUILD · REFERENCE PLATE · THE SHOTS · VERIFICATION · FINISH) su tikrais artefaktais (atmesta imtis, intake atsisakymas, watermarked proof), HOW IT'S MADE AI atskleidimas pažodžiui, FAQPage schema. | P1 | Copy iš `etsy/listings/01-football-card.json` per `content/blocks/`. Niekada „AI generator“. |
| `/guarantee` | OUR PROMISE + siuntimas + grąžinimai vienoje vietoje: proof before final, refund every cent, free reprint / refund and keep the cards; chip'ai pažodžiui; etapinis pristatymas; Ultimate = 3 sekami paketai; US free shipping; HK pakelis (+ muito atsakymas iš QPMN); 30 d. grąžinimai Etsy; **siuntimo lentelė per pakopą** (kilmė, vežėjas, dienos, tracking, pakuotė, muitai). | P1 | Etsy užsakymų grąžinimai vykdomi Etsy — pasakyta aiškiai. |
| `/photo-guide` | Ką siųsti (4–10 nuotraukų) — tėvų checklist'as iš `art-pipeline/intake.ts` atmetimo priežasčių (veidas didelis ir ryškus, po vieną ~45° į šonus, viena full-body, viena su komandos apranga, be akinių nuo saulės, be grupinių su panašaus dydžio veidais, herbas atskiru failu). | P1 (2 fazė) | Turtas: `public/images/photo-guide.webp`, slides 12/13, Reddit DIY checklist. |
| `/about` | Kas prašo mano vaiko nuotraukų: studija Lietuvoje, US spausdinimo partneriai, **juridinis asmuo + adresas (imprint)**, „not affiliated with any league, team, school or trading-card company“, logo sakinys (S11). | **P1** (perkelta iš P2 — pirmas tėvų pasitikėjimo klausimas) | E-E-A-T paviršius blogui. |
| `/contact` | mailto `hello@gamedayedition.com` + įsipareigotas atsakymo langas („1 business day“, jei savininkas patvirtina) + kaip atgauti pamestą `/order` nuorodą. | **P0** | Etsy užsakymams — Etsy žinutės. |
| `/sports`, `/sports/[sport]` | Indeksas 17 šakų (kad „17 sports“ būtų tiesa) + atskiri puslapiai **tik 8 šakoms su gyvu listingu** (basketball, football, cheerleading, baseball, volleyball, soccer, softball, wrestling). | P2 | Jokių plonų puslapių 9 uodegos šakoms; `other-sport` → `/sports/skateboarding`; šakos be numerio — „their name, their club crest“. |
| `/styles/[finish]` | 6 finišai kaip kolekcinės „paralelės“: šriftų pora, medžiaga, front/back, plakatas, kambario kadras, flip. `/styles/senior-night` 301 → `/senior-night`. | P2 | „Nobody searches by finish“ — sitemap prioritetas 0.4; nuorodos tik iš produktų/`/c`/finišų posto. |
| `/blog`, `/blog/[slug]` | Turinio hub'as (Topps RIPPED / Panini blog paritetas be jų vardų). MDX `content/blog/*.mdx`; kategorijos = 13 Pinterest lentų. | P2 (pillar+trust pirma) | Kalendorius §7; plėtra pagal GSC. |
| `/lp/[slug]` | Reklamos LP be nav/footer, vienas CTA, noindex; vienas URL kampanijai (be A/B iki $1k/mėn). | P3 (vartai) | Pirmi: senior-night-volleyball, senior-night-football, complete-set, baseball-card. Ne sitemap'e. |
| `/team-orders` | Komandų užklausa/quote (roster skaičius, deadline, vėliau roster upload) — vienintelis dalykas, kurį svetainė parduoda, o Etsy ne (sąskaita + kalendorius). | P3 (po ~50 Etsy užs.) | Be viešos kainos, kol nenuspręstos komandų pakopos. **$119/$199/$299 ištrinami, ne perkeliami.** |
| `/privacy`, `/terms` | Perrašyti realiam verslui (§9) + teisininkas. 0 fazė: nuimti TEMPLATE etiketes, pridėti imprint, COPPA sakinį, registro gyvavimo pažadą. | P0/P1 | |
| `/pins/*` | Statinis pinų PNG hostingas (`public/pins/`) — Pinterest bulk CSV veikia. `/social/*` — atidėta (S17). | P0 | Stabilūs vieši keliai, ne sitemap'e. |
| `/sitemap.xml`, `/robots.txt`, `not-found.tsx` | `app/sitemap.ts` (vieši maršrutai + tik public kortelės), `app/robots.ts` (disallow `/api`, `/order`, `/go`, `/lp`), brandinis 404 („No card registered under this ID — check the back of the card“). | **P0** | Šiandien nė vieno nėra. |

---

## 4. Etsy ↔ web redirect žemėlapis

### 4.1 Web → Etsy (laisvai; VISI CTA per `/go/etsy/<sku>`)

Listingų ID patikrinti `etsy/LISTING-STATE.md`; SKU iš `etsy/SEO/SKU-REGISTRY.md`. Nuorodos forma **visada** `https://gamedayedition.etsy.com/listing/<id>` (Share & Save — 4 % mokesčio grąža; jau naudojama `marketing/config.json`). Niekada plikas `etsy.com/listing`.

| Svetainės puslapis / veiksmas | Etsy listingas (ID) |
|---|---|
| `/trading-cards` → basketball / football / cheer / baseball / volleyball / soccer | 4562666649 / 4563878038 (SKU dar `FBALL`) / 4564284709 / 4567592965 / 4567597109 / 4567599879 |
| `/trading-cards` be šakos arba uodegos šaka | Complete Set **4562711454** |
| `/posters` → basketball / football / cheer / soccer / volleyball / baseball | 4562700100 / 4564301710 / 4564287163 / 4568359117 / 4568365063 / 4568369175; fallback 4562711454 |
| `/complete-set`; `/styles/<finish>` (finišas renkamas listinge) | 4562711454 |
| `/senior-night` | SN any-sport **4564565764** |
| `/senior-night/football` / volleyball / cheerleading / soccer / baseball / softball / wrestling | 4568844304 / 4568846696 / 4568849272 / 4568841851 / 4568844985 / **4569506845** / **4569522144** (abu LIVE nuo 2026-09-05) |
| `/senior-night/basketball`, `/senior-night/ice-hockey` | 4564565764, kol jų SN listingai nepublikuoti (~Nov 20) |
| `/sports/<sport>` | tos šakos card + poster + SN listingai; softball/wrestling card/poster — kai publikuoti (draft'ai `etsy/listings/01-softball-card.json` ir kt.); uodegos šakos → 4562711454 su šaka žinutėje |
| `/christmas-gift` | evergreen card/poster listingas per šaką |
| `/c/<cardId>` „Order another edition — same price on Etsy“ | tos šakos card listingas, kitaip 4562711454 |
| `/etsy` | parduotuvės frontas |

**UTM sutartis** (praplečia `marketing/engine.py caption()`, kad pinai, postai, reklama ir svetainės klikai jungtųsi `marketing/report.py` per `utm_content`):
- `utm_source` ∈ {pinterest, instagram, tiktok, youtube, facebook, reddit, meta, email, qr, site}
- `utm_medium` ∈ {social, paid, email, qr, referral}
- `utm_campaign` = `<occasion>-<sport>-<tier>` (pvz. `seniornight-volleyball-printedset`) reklamai/puslapiams, arba pin šablono vardas pinams
- `utm_content` = pin id / creative id / puslapio slug; `utm_term` = auditorija (tik reklamai)
- `/go/etsy/<sku>` praleidžia visus nepakeistus; jei nėra — štampuoja `utm_source=site&utm_medium=referral&utm_campaign=<referring slug>`. Jokio first-party click ID Etsy URL'e (Etsy ataskaita sutaiko tik `utm_*`).

**Politikos-saugi kalba (web→Etsy)**: „Order on Etsy“, „Get theirs on Etsy“, „Order another edition — same price on Etsy“. Niekada kupono kodo svetainėje (kodai — tik DM), niekada „cheaper“, niekada „message us to order“.

### 4.2 Etsy → web (TIK vykdymas; nieko prieš pirkimą)

| Tiltas | Kur | Į ką |
|---|---|---|
| Spausdintas QR | kortelės nugara, sertifikatas, listingo slide 02/17 | `/c/<cardId>` |
| Pirma post-purchase žinutė | Etsy žinutė | `/order/<token>` (kai bus) arba — iki tol — tik pristatymo nuoroda |
| Pristatymo žinutė | Etsy žinutė + natūraliai prisegti front PNG ir flip MP4 (telpa į 5×20 MB) | `/order/<token>/files` (36 failai / 139 MB) |
| `orders/<id>/exports/README.txt` | zip'e | `/c/<cardId>` ir `/order/<token>/files` |

**Žinutės šablonas (pažodžiui, be kainų/upsell/kodo/naujienlaiškio):**
> Your order page — file download (and, when ready, proof approval): <link>. Files are delivered there because the full set is larger than Etsy's attachment limit; the card front and flip video are attached here too. Nothing to pay, nothing to sign up for.

**Draudžiama**: svetainės URL, el. paštas ar „message me“ bet kuriame listinge, nuotraukoje, announcement'e ar pre-sale žinutėje. **Slide 17** — be teksto URL (planas `etsy/LISTING-STATE.md 1037-1042` atšaukiamas): QR yra tiltas, „the registry is the promise, not the address“.

### 4.3 Bendras copy tarp kanalų
Keturi privalomi Etsy blokai (HOW IT'S MADE, PHOTO PRIVACY, INDEPENDENT STUDIO, DIGITAL PRODUCT) + OUR PROMISE gyvena kaip markdown `content/blocks/*.md`, renderinami svetainėje ir kopijuojami į listingus — tekstas niekada nesiskiria. Raktažodžių nuosavybė bendra su Etsy (`etsy/SEO/ETSY-SEO-MASTER-PLAN.md §6`): svetainės puslapis taiko tą pačią frazę ta pačia žodžių tvarka kaip listingas, į kurį siunčia — durys, ne konkurentas; 30 d. title/tag užšaldymas gerbiamas.


---

## 5. Kortelės puslapis `/c/<cardId>` + registras (spec'as)

### 5.1 Kodėl pirma
- Parduotas deliverable ant 14/21 listingų; QR jau realiame pasaulyje (kortelių nugaros `#card_qr`, sertifikatai, listingų slide 02/17, pirmo mokančio kliento README.txt → `gamedayedition.com/c/GDE-SS-TEN-2026-12`).
- Šiandien: placeholder; 19/22 be statistikos; „#01“ cheerleading'ui; hard-coded „FIRST EDITION“; 4 įrašai su tuščiu `playerHighlight` → tuščias meta description; „Cover Moment“/„25 cards“ OG per layout; nėra visibility.

### 5.2 0 fazė (tas pats failas, ~½ dienos)
1. Renderinti `CardRecord.stats[]` (fallback į `ppg/apg/rpg` tik seniems basketball įrašams).
2. „#“ eilutė tik kai šaka numeruoja marškinėlius (`art-pipeline/kits.ts hasBackNumber` / `marketing/engine.py numbered`), kitaip „Edition <n>“ arba tik vardas.
3. Išmesti hard-coded „FIRST EDITION“; meta description fallback „<First> <Last> · <Team> · <Finish> — Registered Game Day Edition“.
4. Per-finišo akcentas vietoj `#1d4ed8`; **GDE ženklas lieka sidabrinis** (failas, ne tekstas; niekada finišo folija ar komandos spalva).
5. `<meta name="robots" content="noindex,nofollow">` visiems ne-demo įrašams; sitemap'e — tik demo.
6. `app/not-found.tsx` brandinis.
7. **Commit'inti** `lib/registry/cards.ts` + 4 untracked QR PNG; pridėti Order 03 `GDE-SN-BKB-2026-51` (suaugęs; `classOf` slepiamas) ir bet kuriuos Order 01/02 ID kaip unlisted; iš `GDE-SS-TEN-2026-12` **pašalinti** miestą, užsakymo ID ir komentarus (S5); deploy; `curl` kiekvienam ID iš `etsy/LISTING-STATE.md`.
8. `generateStaticParams` + statinis renderinimas — QR niekada nepriklauso nuo DB/cold start.

### 5.3 1 fazė — puslapio spec'as (mobile-first, nes įėjimas = QR skenavimas)
1. **Finišo tipografija**: tik TOS finišo pora per `next/font` (SN Anton+Barlow, CA Russo One+Saira Condensed, FS Passion One+Khand, HE Graduate+Archivo Narrow, SS Space Grotesk+Archivo, PR Orbitron+Chakra Petch, SR Playfair+Oswald) — **kraunama tik viena pora per maršrutą**, niekada visos 7; `team/primary` + `team/secondary` iš įrašo; niekada Inter/system-ui.
2. **Hero = CSS-3D flip** tikslaus front/back (portas iš `card-flip/web/flip.html`, ta pati 5 s kreivė, tap kartoja), MP4 fallback. **Statūs kampai** — auditas abiem kryptim (`border-radius` / silueto mazgai), nes prototipas senesnis už 2026-09-01 sprendimą. Poster frame + lazy load, ne autoplay virš fold.
3. Identiteto eilutė `#12 · GUARD · CEDAR RIDGE BEARS · 2026` (arba vardas/leidimas šakoms be numerio).
4. 3 statistikos chip'ai iš `stats[]`; `playerHighlight`.
5. **EDITION PANEL**: „REGISTERED EDITION · GDE-SN-BKB-2026-12 · Stadium Night · 2026 · Registered <data>“ su „Verified“ būsena; SR — „SENIOR EDITION · 1 OF 1“.
6. Atsisiuntimai: **wallpaper'iai tik realiems klientams** (iš `orders/<id>/exports`; phone lock/home 1290×2796, iPad, desktop 3840×2160, clean variantai); demo — tik front/back + flip (be Figma eksportų kaštų).
7. Share: per-kortelės OG = front (`opengraph-image.tsx`), copy link, native share.
8. „Order another edition — same price on Etsy“ → `/go/etsy/<sport card SKU>`; „Get yours on Etsy“ demo kortelėms.
9. „Example artwork · Fictional athlete“ ženkliukas demo kortelėms.
10. **Klaviatūra + screen reader** flip'ui; kontrastas `team/primary` ant tamsaus fono (≥4.85:1 kaip Figma baseline); tap taikiniai ≥24 px; tikras `<img alt>`.
11. **„Manage this page“ — NE viešas mygtukas** be tapatybės patikros (piktnaudžiavimo vektorius): unlist/delete prašymai el. paštu su užsakymo nr. + pirkimo el. paštu; „Report this card“ nuoroda visiems (ne-globėjo skundai). Verifikuotas claim flow — 5 fazė.

### 5.4 Visibility būsenos mašina (identiška `/c`, `/registry`, sitemap, OG)
- **public** — indeksuojama, sitemap'e, share OG. Default: fiktyvios demo kortelės.
- **unlisted** — atsidaro tik tiksliu ID/QR, `noindex,nofollow`, ne sitemap'e, ne `/registry`. Default: **realūs klientai** (dauguma nepilnamečiai).
- **private** — QR atidaro neutralų „This card is registered with Game Day Edition“ be vardo ir meno.
- Public realiam klientui — tik su aiškiu globėjo opt-in užsakymo metu (Etsy — personalizacijos klausimas arba post-purchase žinutė; svetainėje — checkbox, kai bus forma), saugoma `consentPublicAt` + `consentSource`; suaugusieji opt-in laisvai; globėjas gali perjungti public→unlisted ar prašyti ištrynimo (per Request ID, jau pažadėtą `app/privacy`). Opt-in **niekada** nestumiamas dėl SEO. Tai suderina Etsy slide 12 „NEVER POSTED, NEVER SHARED“ su puslapiu, rodančiu nepilnamečio vardą.

### 5.5 ID schema (atgal suderinama)
Spausdintas prefiksas `GDE-<style>-<sport>-<season>-<number>` lieka (22 ID įšaldyti). Naujiems: numeruotos šakos `-<number>`, kolizijai `-<number>-2`; šakos be numerio ir suaugę — sezoninis leidimo skaitiklis `-E07` vietoj „01“. `makeCardId()` gauna sekos parametrą; unikalumas — unit testas.

### 5.6 Registras: statinis dabar, DB vėliau (S4)
- Dabar: `lib/registry/cards.ts` + `visibility` laukas + `card:new` scriptas (final ID su seka → QR PNG per refaktorintą `scripts/gen-card-qr.ts` → įrašas) + `generateStaticParams`. Turtas pagal cardId: `public/cards/<cardId>/{front,back}.webp`, flip MP4 — realiems klientams generuojama iš `orders/<id>/exports` (`order:publish` scriptas), demo — vieną kartą.
- Vėliau (>~50 realių kortelių arba `/a` poreikis): Supabase Postgres (ne D1): `athletes`, `cards`, `card_assets`, `orders`, `order_events`; RLS be politikų (tik server); seed iš TS; `getCard/getAthleteCards` parašai nesikeičia; Supabase Pro dėl pauzės/backup'ų.
- **Card-vs-print validacija**: įrašo vardas/numeris/statistika lyginami su Figma `Athlete` kintamaisiais (2026-09-05 rankinės korekcijos tampa patikra).

### 5.7 Testai (3, kurie saugo pajamas ir politiką — CI nuo 1 fazės)
1. Kiekvienas `cardId` iš `etsy/LISTING-STATE.md` egzistuoja registre ir grąžina 200 (etsy/SEO/README.md taisyklė 12 „Real QR codes only“).
2. Kainų paritetas (`prices.ts` vs renderinti skaičiai).
3. Draudžiamų stringų grep (§7.6) **įskaitant identifikatorius** (`cover-moment-idempotency`, `onCoverMomentTurnstile`).
+ `makeCardId` unikalumas; unlisted/private nėra sitemap'e; noindex header. Playwright — tik kai bus `/order` srautas.

### 5.8 Registro pažadai (į `/terms`)
- **Gyvavimo trukmė**: puslapis garantuotai atsidaro ≥5 metus nuo išleidimo + wind-down pažadas (Topps lygio registrui to reikia).
- Domenas: auto-renew + registrar lock (QR ant fizinių daiktų pergyvena viską); uptime monitorius `/c/GDE-SN-BKB-2026-23` ir `/` (UptimeRobot, nemokama).
- Analitika `/c`: tik be slapukų (Vercel WA / GA4 su consent), įvykiai su šaka+finišu, **niekada** vardu/užsakymo ID/nuotraukos URL; jokio pikselio.

---

## 6. Užsakymo / fulfilment ciklas

### 6.1 Realybė
Per-order kelias egzistuoja kode ir įvykdytas ≥4 realiems užsakymams: `art:intake` (aktualūs atmetimai) → identity plate iš kliento nuotraukų → ArcFace vartai (0.36) → 4 pozos po vieną → BiRefNet cutout'ai → Figma merge (rankinis, TODO #3) → 36 failų / 139 MB zip + registro įrašas + `qr:gen` (rankiniai). Paskutinis realus: ~22 val., 57 generacijos, €17.75. Etsy API negali nei rašyti žinučių, nei imti nuotraukų. Kaip pristatytas 4164205493 zip — repo neužfiksuota.

### 6.2 Ką statome (2 fazė) — pristatymas
- `/order/<token>/files` (§3): 5 aplankai, dydžiai, formatai (PNG only, 300 dpi), README patarimai, zip; signed 24 h URL; noindex; token 32 baitai, galioja, lyginamas constant-time (`verifySubmissionToken` šablonas).
- Scriptai savininko Mac'e (jokio `/admin` UI): `order:new` (Etsy receipt + tier → orders eilutė + token + provisional cardId; KPI < 10 min iki nuorodos žinutėje), `order:publish` (`orders/<id>/exports` → `public/cards/<cardId>/` arba bucket + būsena „delivered“), `card:new`.
- Resend šablonai (photos received, proof ready, shipped, files ready) — po Resend domeno verifikacijos (SPF/DKIM `mail.gamedayedition.com`, DMARC), `RESEND_FROM_EMAIL` ne `orders@example.com`.
- Nuorodos atkūrimas: `/contact` → užsakymo nr. + pirkimo el. paštas → persiųsti.
- Priminimo/timeout politika, kai klientas nepatvirtina plate/proof (pvz. 3 priminimai per 14 d., tada užsakymas pauzuojamas) — į `/terms`.

### 6.3 Ką atidedame (5 fazė / pagal apimtį)
Šešių būsenų `/order/<token>` UI su plate/proof patvirtinimu, „Verified“ paneliu (be balų), tracking per paketą — kai užsakymų > ~5/dieną. Iki tol Etsy žinutės. Supabase `submissions` → `orders/<id>/photos` tiltas (`order:pull`) — tik jei web forma grįžta (S7).

### 6.4 Pajėgumo taisyklė
Chip'ai „DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7 · SEALED PACK 2–3 WEEKS“ pažodžiui, **vienas pristatymo pažadas puslapyje**; jokio „same-day“; reklamos biudžetas ribojamas įvardytu užsakymų/dieną skaičiumi, kurį pipeline'as pristato per 1–2 d.; skalė — tik po merge automatizacijos.

---

## 7. SEO + blogas

### 7.1 Duomenų įspėjimas
Visi raktažodžių skaičiai — Etsy Marketplace Insights, **ne Google**. 0 fazė: Google Search Console + Bing. 3 fazė: viena Google raktažodžių praeiga prieš užšaldant postų pavadinimus. Iki tol Etsy intent'as — proxy; taisyklė „matched intent beats volume“.

### 7.2 Techninis SEO checklist'as (šiandien viskas 0)
- `app/sitemap.ts` (vieši maršrutai + public kortelės, `lastModified`); `app/robots.ts` (disallow `/api`, `/order`, `/go`, `/lp`).
- `alternates.canonical` per `generateMetadata`; `NEXT_PUBLIC_SITE_URL=https://www.gamedayedition.com` Vercel'yje, skaitomas ir `site-config.ts`, ir `lib/registry/cards.ts` (dabar du skirtingi default'ai).
- Per-maršruto OG (`opengraph-image.tsx`: šakos hero `/sports`, kortelės front `/c`) vietoj vieno `public/og.webp`.
- JSON-LD `lib/seo/jsonld.ts`: Organization (logo `exports/brand/GDE-etsy-shop-icon-1000x1000.png`; `sameAs` = Etsy, Instagram, TikTok, Facebook Page, YouTube, Pinterest iš `marketing/PROFILES.md`; **be** asmeninio Reddit; nuspręsti kanoninį handle'ą: `gamedayedition` vs `editiongameday`); Product+Offer produktų/šakų puslapiuose su `offers.url` = Etsy listingas ir kaina iš `prices.ts`; BreadcrumbList; FAQPage (tik matomi klausimai — `/how-it-works`, `/senior-night`, produktai; atskiras `/faq` maršrutas, jei FAQ lieka `/`); BlogPosting; ImageObject tik PUBLIC `/c`; **jokio AggregateRating** kol atsiliepimų < 5.
- `next.config.ts`: `redirects()` (`/styles/senior-night`→`/senior-night`, `/sports/other-sport`→`/sports/skateboarding`, `covermoment.co`→ jei resolvina), `headers()` (HSTS preload, X-Frame-Options, Referrer-Policy, leidžiantis CSP); DNS: CAA, DMARC.
- Verifikacijos: Pinterest `p:domain_verify`, Meta domain-verification, GSC/Bing — meta tag'ai `app/layout.tsx` **arba** TXT įrašai (išvardinti).
- Manifest + favicon/app ikonos (patikrinti `public/favicon.svg` nėra „CM“).
- Be `hreflang` (viena US rinka); USD visur; US datų formatas; business-day skaičiavimas US laiku.

### 7.3 Core Web Vitals
Suskaidyti `app/site-client.tsx` į server sekcijas + 3 client salas (forma, before/after, flip) — **3 fazėje**; `next/image` su `sizes` kiekvienam vaizdui; sprite-sheet'ai neindeksuojami ir rodo išmestus finišus → regeneruoti iš V3 eksportų (`Exportai Etsy/` 2000×2000 PNG per `next/image` AVIF/WebP) su auditu (S18); flip MP4 su poster frame, lazy; biudžetas: `/c` < 300 KB JS, < 1 MB above-the-fold; LCP < 2.5 s, CLS < 0.1; Lighthouse SEO ≥ 95.

### 7.4 Raktažodis → URL nuosavybė (anti-kanibalizacija)
| Frazės (Etsy vol./tier) | Puslapis |
|---|---|
| senior gifts 5.5k High · senior year gifts 1.5k VH · senior night poster 209 · senior night gifts 871 | `/senior-night` + vaikai |
| custom baseball card 1.1k High (Dec+May) · custom basketball cards 159 VH · custom football card 425 | `/sports/<sport>` |
| custom trading cards 935 High · sports trading cards 246 VH | `/trading-cards` |
| gym wall art 3.3k · dorm room decor 172k (May–Jul) · sports wall art | `/posters` |
| custom sports poster trading card set (Etsy jau #4) | `/complete-set` |
| baseball team gifts 592 VH · end of season gift 766 | `/team-orders` (kai bus) |
| senior banner (Aug pikas = bucket-list šablonai) | **niekada** kol nėra horizontalaus layout'o |
**Plonų puslapių disciplina**: jokio sport×style matricos; `/styles` ≤6; `/sports/<sport>` tik 8 gyvoms; dance/track/band/lacrosse niekada; niekada plikas „<sport> cards“ (Panini lentyna) ar „personalized card“ (atvirukų lentyna).

### 7.5 Blogas — sistema ir kalendorius (GSC-vartai)
- MDX `content/blog/*.mdx` (front-matter: title, slug, category, sport, occasion, primaryPage, publishAt, assets); kategorijos = 13 Pinterest lentų (`marketing/templates/BOARDS.md`); BlogPosting JSON-LD; sezoninė nav tvarka kaip BOARDS.md.
- **Publikavimo vartai**: postai eina tik po 1 fazės išėjimo (twin tikras, kainos teisingos, legal etiketės nuimtos) ir GSC verifikacijos. **Pillar 4** (`/senior-night`, `/how-it-works`, `/guarantee`, `/photo-guide`) + **2–3 trust postai** pirmi; sezoniniai klasteriai — tik kai GSC rodo impresijas arba listingas duoda užsakymų. Datos žemiau — taikiniai, ne įsipareigojimai.

| # | Data (taik.) | Postas | Frazė | Pirminis puslapis → CTA |
|---|---|---|---|---|
| 1 | ~Sep 22 | How we turn phone photos into a trading card — honestly (HOW IT'S MADE) | trust | `/how-it-works` → GDE-ANY-SET-DIG |
| 2 | ~Sep 25 | What is a registered edition? The QR on the back of every card | trust | `/registry` + demo `/c/GDE-SN-BKB-2026-12` → `/trading-cards` |
| 3 | ~Sep 28 | What to photograph before senior night: the 5-photo checklist | senior night | `/photo-guide` + `/senior-night` → 4564565764 |
| 4 | ~Oct 1 | Senior night gift ideas that aren't flowers | senior night gifts 871 · senior gifts 5.5k | `/senior-night` → 4564565764 |
| 5 | ~Oct 3 | Senior night volleyball: gifts, poster ideas and a timeline | senior night volleyball 528 High | `/senior-night/volleyball` → 4568846696 |
| 6 | ~Oct 6 | Football senior night: the gift that outlasts the banner | football senior night 328 (+146 %) · football banner 999 | `/senior-night/football` → 4568844304 (niekada nesišaipyti iš DIY banerio) |
| 7 | ~Oct 12 | Christmas gifts for youth athletes that aren't another water bottle | football gifts Nov 26 708 | `/christmas-gift` → per-sport |
| 8 | ~Oct 20 | Custom trading cards as a Christmas gift: order-by dates and what arrives when | custom trading cards 935 | `/trading-cards` + `/christmas-gift` (tik chip'ų datos) |
| 9 | ~Nov 15 | Winter senior night is in January: basketball, wrestling and hockey parents, plan before the holidays | wrestling SN Jan 618 · hockey Jan 341 | `/senior-night/{wrestling,basketball,ice-hockey}` → 4569522144 / 4564565764 |
| 10 | ~Nov 25 | Gifts for a football dad (and a baseball dad): a card of his own kid | football dad 870 High · baseball dad gift 118 | `/sports/football` → 4563878038 |
| 11 | ~Jan 15 | Custom baseball cards from your own photos: the complete guide | custom baseball card 1.1k High / 16.6k m. | `/sports/baseball` → 4567592965 |
| 12 | ~Feb 1 | Softball senior night comes in April: a spring checklist | softball senior night Apr 1 757 (+130 %) · softball mom 2.1k | `/senior-night/softball` → 4569506845 |
Vėlesni kandidatai: baseball team gifts (Feb), six finishes explainer, sports wall art sizes, rookie card first season, Father's Day baseball dad (May 15), end-of-season team gifts (May 1 / Nov 1).

**Vidinės nuorodos**: viena intencija = vienas puslapis; kiekvienas postas per pirmus 150 žodžių → tiksliai vienas money puslapis + `/how-it-works` arba `/photo-guide` + vienas `/go/etsy` CTA tai šakai; anchor = išmatuota frazė ta pačia tvarka; hub↔spoke tarp `/senior-night` ir vaikų; `/styles` — tik iš produktų/`/c`/finišų posto; `/c` → `/sports/<sport>`, `/styles/<finish>`, `/trading-cards`, `/registry`; breadcrumbs visur; šakos be numerio niekada „their number“ anchor'e/alt'e; nė vienas postas → `/banners`, 30×40 ar produktą, kuris negali būti išsiųstas.

**Pinterest kaip svetainės kanalas**: claim'inti domeną (meta tag) — Etsy URL claim'inti negalima, todėl svetainė „verta būti kilpoje“; `public/pins/` + `config.json public_base`; `link_mode` `engine.py caption()` (pinas → `/senior-night`, `/sports/<sport>` ar postas, `utm_content` = pin id); alternuoti kryptis (listingas vs svetainė) ir skaityti `report.py`, kuris **niekada nebuvo paleistas**.

### 7.6 DRAUDŽIAMA bet kuriame puslapyje, poste, alt tekste ar schemoje (CI grep)
`instant download` / `instant` bet kas; `25 cards`; `18 + 4 foil`; `rounded corners`; `free shipping worldwide`; jersey numeris šakoms be numerio; tikri lygų/komandų/mokyklų ženklai; **Topps / Panini / Upper Deck** ir graded-slab palyginimai (titles, alt, schema, price anchors); „AI generator“ (AI vis tiek atskleidžiamas); kainos/sale %/datos evergreen postuose; išgalvoti ar skatinti atsiliepimai; deliverables, kurių dar negalima pagaminti; count-bearing pakelio/sertifikato menas su „10“; pašaipa DIY tėvams; atleto pozos renderis kaip produktas („after“ = kortelės front+back arba plakatas); demo atletai kaip klientai (visada „Example artwork · Fictional athlete“); `Cover Moment`; `Neon Future`; `Vintage`; `PDF`; `Stripe payment link`. Leidžiamas vienintelis kategorijos inkaras: „most shops charge $15–30 for a single one“ (docs/ETSY-LISTINGS.md:560) ir „less than $4.10 per card“.

---

## 8. Meta reklamos pasiruošimas

### 8.1 VARTAI (trigger, ne data) — VISI turi būti tiesa prieš pirmą dolerį
a) ≥3 realūs Etsy atsiliepimai **ir** listingo konversija ≥1.5 % (savininko sprendimas 2026-09-05);
b) 0–2 fazių išėjimo kriterijai: nulis pasenusių stringų; svetainės kainos = Etsy sale su patvirtintu sale atnaujinimu po Sep 24; `/c` tikras kiekvienam atspausdintam QR; `/order/<token>/files` gyvas; legal puslapiai po teisininko be TEMPLATE; Pixel+CAPI patikrinti Events Manager'yje su dedup;
c) gamybos pajėgumas įvardytas užsakymais/dieną per 1–2 d. (šiandien: ~22 val., 57 gen., €17.75) ir dienos biudžetas prie jo pririštas.
Jei spalį įvykdyta — savininko ramp'as $5/d. 2 sav. → $10–15 → $25 tik kol konversija laikosi, ant Etsy-landing senior-night setų. Kitaip — **Jan–Mar 2027** (pigiausias langas).

### 8.2 Checklist'as
- [ ] Meta Business Manager + domain verification; išspręsti Facebook Page ID konfliktą (61594076368136 `PROFILES.md` vs 1231779406693811 `API-PUBLISHING.md`).
- [ ] Matavimo sluoksnis (vartų savaitę): Meta Pixel + CAPI `app/api/capi/route.ts` su `event_id` dedup, hash'inti tik IP/UA; GA4/Vercel WA; Pinterest tag; consent banner (analitika off iki sutikimo); env `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_TOKEN`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_PINTEREST_TAG` į `.env.example`.
- [ ] Įvykių taksonomija (S14): `PageView`; `ViewContent` produktų/šakų/progų/LP; `CustomizeProduct` renkant šaką/finišą; `Lead` tik realiai formai (team quote); `Contact`; custom `EtsyClick` (optimizacijos įvykis per custom conversion); custom `FlipPlayed`; `Purchase` tik su Stripe. Jokio pikselio `/c`, `/a`, `/order`.
- [ ] UTM (§4.1): `utm_source=meta&utm_medium=paid&utm_campaign=<occasion>-<sport>-<tier>&utm_content=<creative>&utm_term=<audience>`.
- [ ] Atribucijos modelis rašytinis: Etsy kelyje `Purchase` neprisiejamas prie kliko (pirkėjų duomenys niekada į Meta) → ad-set sprendimai pagal cost/EtsyClick + Etsy listingo konversiją; savaitinė lentelė EtsyClicks by campaign vs Etsy „social/other“ vizitai vs užsakymai per listingą minus baseline. Ši riba — verslo argumentas Stripe'ui (5 fazė), ne priežastis laužyti taisyklę.
- [ ] Nusileidimo taisyklės: tik ≥$69, patogiai ≥$99 — Printed Set $76.99, Deluxe $95.19, Ultimate $139.99, Sealed Pack $59.49 tik sete; **niekada** $29.39 digital; niekada 30×40 be failo. Kryptis — Etsy listingas arba `/lp/<slug>` ta pačia kaina; H1 = ad headline; kaina ir chip'ai virš fold (vėlyvas turnaround atskleidimas +15–25 % abandonment); vienas CTA ×3; įrodymų stekas pirkėjo tvarka (iš JŲ nuotraukų → atmesta imtis → front+back registered → approve or every cent back → 6 finišai, 17 šakų); garantija + vaiko nuotraukų pasitikėjimo eilutė prie kiekvieno CTA; muted 14 s story video iš `etsy/listing-videos/*Video 1.mp4`; mobile LCP < 2.5 s.
- [ ] Kūrybos taisyklės: tik fiktyvūs roster atletai su „Example artwork · Fictional athlete“; niekada kliento vaikas ar tikra „before“; AI atskleidimas kiekviename LP; hook'ai pažodžiui iš `docs/ETSY-COPY.md`; jokio atleto image-to-video (Veo atmeta nepilnamečius); kiekvienas kadras per judge auditą; count-bearing menas nerodomas.
- [ ] Tikra produkto fotografija: $350 goodwill biudžetas (GDE75, 5–8 užsakymai pažįstamiems) = pirmas pajamų žingsnis **ir** spausdintų daiktų footage šaltinis — su **atskiru rašytiniu sutikimu** fotografuoti pristatytus daiktus; be jo — komponuojamas fiktyvus menas.
- [ ] Kainų inkarai LP: „less than $4.10 per card“, „most shops charge $15–30 for a single one“, nemokamas sertifikatas, 28 failų rinkinys. NE: graded-slab, fotografo sesija, Topps/Panini.
- [ ] Vienas LP kampanijai, **be A/B** kol spend < ~$1k/mėn (S16).
- [ ] Retargeting: ViewContent 30 d. minus EtsyClick; EtsyClick 14 d. (rotuoti į `/how-it-works` ir registered-edition postą); video 50 %+ 30 d.; IG/FB engagers 90 d.; lookalike tik po ≥100 EtsyClick. **Niekada** `/c`/`/order` lankytojai.
- [ ] El. pašto rinkimas su priežastimi ir atskiru sutikimu — **atidėta**, kol nėra srauto (CAN-SPAM: pašto adresas + unsubscribe; GDPR double opt-in). Etsy pirkėjų el. paštai niekada.
- [ ] Ops prieš pirmą dolerį: `hello@` pašto dėžutė atnaujinta (Hostinger trial baigiasi **2026-09-23**); Etsy shipping profilis = svetainės tekstas (US-only); prod env Vercel'yje patikrintas; Offsite Ads OUT.

---

## 9. Pasitikėjimas ir „Topps lygis“ (be jų vardų)

### 9.1 Ką daro rimti brandai — ir ką turime turėti
Didieji signalizuoja rimtumą **infrastruktūra**: serial/hologram/QR lookup, grąžinantis tikslaus daikto nuotraukas; leidimo tiražo atskleidimas pavadinime; užsakymo būsena be priverstinės paskyros; turinio hub'as; el. pašto rinkimas su priežastimi; paskelbta garantija. Tiesioginiai custom-card konkurentai (Snapshot $17.99–49.99, 2–3 d.; Rookies $13.99/20 kortelių; I'm The Star $16–28; photo labs $7–9) yra checkout-first, kaina puslapyje, greiti — **bet nė vienas neturi registro, likeness iš tikrų nuotraukų, 18 kortelių pakelio su chase, plakato+kortelių+pakelio+sertifikato viename sete, nei vaiko nuotraukų sutikimo UI**. Tai GDE pozicionavimas: „Your athlete, not a template.“

### 9.2 Leidimo kalba kaip brando kalba
Kiekvienas produkto puslapis: „Sealed pack: 18 cards — 4 holographic chase, 14 standard“; „One registered edition per athlete“; „Free printed Certificate of Authenticity with silver seal in every shipped package“. `/c` edition panelis su ID, finišu, sezonu, registracijos data. Count-bearing menas count-neutral **prieš** pasirodant svetainėje ar išsiunčiant.

### 9.3 Rebrand = kodas + turtas (ne tik env)
`site-config.ts:2-4`; „CM“ → sidabrinis GDE skydas/wordmark **failas** (`exports/brand/GDE-etsy-shop-icon-1000x1000.png`); `site-client.tsx:516`; `layout.tsx:27,29`; `public/og.webp` perpiešti; `.env.example`; `complete/route.ts:54`; `package.json`; README; `cover-moment-idempotency`; `onCoverMomentTurnstile`; Figma kolekcija „Cover Moment“; Vercel projektas `sportscover` (pervadinti, jei norima); `public/favicon.svg` patikrinti. Akcentas `globals.css #f97316` → `brand/accent #FF6B2B` (tik svetainės chrome). Šriftai: Inter+Oswald → brando poros (Anton antraštė + Space Grotesk Bold paantraštė hero/social; per-finišo poros `/c`); mėlyna→violetinė gradiento plytelė išimama.

### 9.4 Produkto tiesa — identiška Etsy
7 stiliai (6 finišai + SR proga), 17 šakų, plakatas = menas (statistika kortelėje), kortelės 2.5×3.5" square-cut UV ant pro photo stock (**išmesti** „16 pt“, „semi-gloss“ kol Bay spec nepatvirtintas), loose printed sets 12/24 **atskirai** nuo 18 kortelių sealed pack (QPMN, HK, 2–3 sav.), 28 failų digital, wallpaper'iai su safe zones, 5.0 s flip MP4 ×2 + GIF (ne „10–15 s cinematic reveal“), tik PNG 300 dpi (ne PDF/JPG), 4–10 nuotraukų, matiniai 189 g/m² plakatai, 30×40 tik print, chip'ai pažodžiui, etapinis pristatymas, vienas pristatymo pažadas puslapyje. „Limited number of projects each week“, „Personal reply within 24 hours“, „first proof within 2 business days“ — **nuimami**, nebent savininkas patvirtina.

### 9.5 Teisinis scope (viena išorinė išlaida — teisininkas; **prieš** `/order` ir prieš mokamą srautą)
- **Biometrija**: ArcFace embedding'ai = biometriniai identifikatoriai (Illinois BIPA — rašytinis sutikimas + paskelbta saugojimo/naikinimo tvarka + privatus ieškinys $1k–5k/pažeidimą; Texas CUBI; Washington; GDPR 9 str.). Biometrinio sutikimo eilutė intake'e ir Etsy personalizacijos instrukcijose **prieš kitą US užsakymą**; embedding'ai naikinami po užsakymo; balai klientui nerodomi.
- **GDPR** (studija Lietuvoje → taikoma visada): teisinis pagrindas per tikslą, 28 str. sutartys su Supabase/Vercel/Resend/Google Vertex, tvarkymo įrašai, EU→US perdavimo pastaba, subprocesorių sąrašas `/privacy`, teisės (prieiga, ištrynimas, perkeliamumas).
- **AI atskleidimas tiksliai**: nuotraukos eina į Google Vertex AI (Gemini) — subprocesorius įvardijamas; „Never used for AI training“ ženkliukas skelbiamas **tik** patikrinus Vertex data-use sąlygas ir įsitikinus, kad pipeline'as niekada nenaudoja consumer `GEMINI_API_KEY` (yra `.env.local`).
- **COPPA pozicija (rašytinė)**: paslauga skirta suaugusiems; svetainė niekada nerenka informacijos IŠ vaiko; `/c`/`/order` be formų ir pikselio; jokių paskyrų nepilnamečiams; kaip elgiamasi su QR, kurį nuskenuoja <13 m.
- **Terms punktai**: licencija kurti išvestinius kūrinius iš nuotraukų ir nepilnamečio atvaizdo (globėjo right-of-publicity sutikimas); pristatyto meno nuosavybė/naudojimo teisės (asmeninis naudojimas; ar galima perparduoti korteles); US Copyright Office pozicija dėl AI vaizdų (ką teisiškai reiškia „registered edition“); proof approval = rašybos/numerio/spalvų priėmimas; be atšaukimo prasidėjus gamybai; ekrano vs spaudos spalvų nuokrypis; digital negrąžinamas išskyrus garantiją; „refund and keep the cards“ piktnaudžiavimo ribos; teisė/jurisdikcija (LT vs US); atsakomybės ribojimas; ES pirkėjams — personalizuotų prekių atsisakymo teisės išimtis; **registro gyvavimo pažadas** (≥5 m.); klubo herbo teisių patvirtinimas; kliento kito ženklų kopijavimo taisyklė (S11) — teisininko scope.
- **Pardavėjo tapatybė**: juridinis asmuo, adresas, įmonės/PVM kodas, atsakingas asmuo — footer'yje, `/terms`, `/about`, laiškuose (LT e-komercija; CAN-SPAM pašto adresas).
- **Saugojimas**: 30 d. / 12 mėn. su **realia** naikinimo rutina (Vercel cron) — šiandien niekas nevykdo; „delete my photos“ kelias per Request ID.
- Pasitikėjimo eilutė prie kiekvieno CTA/upload'o: „Never used for AI training · Never posted without your OK · Deleted after 12 months · Parent/guardian consent required“ (pirma frazė — tik po Vertex patikros).

### 9.6 Prieinamumas (WCAG 2.2 AA)
Išsaugoti `focus-visible` ir `prefers-reduced-motion` (`globals.css:39,262`); klaviatūra + SR flip'ui; kontrastas ≥4.85:1; tikri `<img alt>` vietoj sprite fonų; muted video tekstas DOM'e; tap ≥24 px; prieinamumo pareiškimo puslapis (3 fazė).

### 9.7 Palaikymas
`hello@gamedayedition.com` tik svetainėje ir sąskaitose (niekada Etsy); `/contact`; 3 žinučių proaktyvus ciklas (order/ship/deliver); garantija pažodžiui iš OUR PROMISE; atsiliepimai — kai bus: pirkėjo vardas + šaka + „verified Etsy purchase“ + nuoroda į listingą, kopijuojami ranka (Etsy API app neapsimoka iki ~20); jokio schema iki ≥5; niekada nuolaida už atsiliepimą; patikrinti Etsy sąlygas dėl citavimo.

---

## 10. Techninė architektūra

- **Stack lieka**: Next.js 16 App Router + TS + Tailwind 4 (naudoti su tokenais **arba** išmesti importą — ne abu) + Vercel **Pro** (S13); DB = esama Supabase Postgres per supabase-js (service-role tik server; RLS be politikų). **Ištrinti**: `db/index.ts` (cloudflare:workers), `db/schema.ts`, `drizzle/`, `drizzle.config.ts` (nebent nukreipiama į Supabase su realiomis migracijomis), `app/chatgpt-auth.ts`, `examples/d1`, create-next-app SVG, `.vinext/.wrangler/dist`, tušti `worker/`.
- **Maršrutų grupės**: `(marketing)` server-rendered iš `content/*.mdx` + `lib/catalog`; `(registry)` `/c`, `/registry` su `generateStaticParams` (public+unlisted statiniai; revalidate rašant); `(order)` `/order/[token]` dynamic, no-store, noindex; `api/` (capi, go, submissions, cli mutacijos).
- **Vienas katalogo modulis** `lib/catalog/{sports,styles,prices,skus,listings}.ts`: slug'ai, kodai (`STYLE_CODES` iš registro; sport kodai iš SKU-REGISTRY), `numbered/hasBackNumber` (iš `kits.ts` + `engine.py`), Etsy listing ID (`config.json` + SKU-REGISTRY), V3 kainos su `saleExpiresAt`. Copy, JSON-LD, `/go` taikiniai, būsimas checkout — visi skaito iš čia; Vitest saugo.
- **Turinys**: `@next/mdx`; `content/blog`, `content/sports`, `content/blocks` (4 Etsy blokai + OUR PROMISE, bendri su listingais); `generateStaticParams`, ISR 1 h, be client fetch.
- **Shell**: `site-client.tsx` → server sekcijos (Hero, Proof, Tiers, Finishes, Sports, Process, Guarantee, FAQ) + client salos (team forma, before/after, flip, tabs) — 3 fazė; `globals.css` → tokenai; `next/image` visur; sprite'ai išimami.
- **Redirect + matavimas**: `app/go/etsy/[sku]/route.ts` (302 Share&Save URL, UTM passthrough, `outbound_clicks` eilutė, vėliau `EtsyClick` CAPI su `event_id`); `lib/track.ts` (fbq/gtag/pintrk no-op be sutikimo, niekada `/c`/`/order`); `app/api/capi/route.ts`; consent komponentas.
- **Saugykla**: privatus `athlete-submissions` (yra); `public/cards/<cardId>/` web renderiams (statinis) arba bucket `cards/<cardId>/` (public-read tik public kortelėms, signed kitiems); deliverables prefiksas `/order/<token>/files`; renderiai + OG generuojami kartą su `sharp` kuriant kortelę.
- **Saugumas/ops**: headers + redirects `next.config.ts`; rate limit per Vercel WAF arba Upstash (in-memory `Map` `_shared.ts` neveikia serverless) — kai forma grįžta; Turnstile fail-closed; cron saugojimui; `error.tsx` + `not-found.tsx`; preview deploy'ai su apsauga (vieši URL renderintų realius įrašus); secrets rotacija; backup/export politika registrui; Vercel env auditas (`SUPABASE_*`, `RESEND_*`, `TURNSTILE_*`, `SUBMISSION_SIGNING_SECRET`, `NEXT_PUBLIC_SITE_URL/BRAND_NAME/SUPPORT_EMAIL`).
- **El. paštas**: Resend domeno verifikacija (SPF/DKIM `mail.gamedayedition.com`), DMARC, deliverability testas, nuolatinė `hello@` dėžutė (Hostinger trial → sprendimas).
- **Kokybės vartai**: `tests/` Vitest (paritetas, draudžiami stringai, cardId unikalumas, printed-IDs-resolve, sitemap/noindex); GitHub Actions (lint, tsc, tests; Lighthouse biudžetas nuo 3 fazės); Playwright — kai `/order` srautas.
- **Tiltas į art pipeline** (savininko Mac, `.venv-matte`, jokio cloud GPU): `order:publish` uždaro eksportą; niekas iš pipeline'o nekeliauja į cloud.
- **Stripe (5 fazė, vartai)**: Checkout iš `prices.ts`, webhook → orders → `/order/<token>`, `Purchase` CAPI, Stripe Tax (US nexus), Invoicing komandoms; prieš tai — S19 QR-nav taisyklė.


---

## 11. Fazės (suderintos su kaštų disciplina)

### 0 fazė — Tiesa ir vamzdynas (savaitė 1, Sep 7–13) · ~5–7 inž. dienos + 2–3 val. savininko · €0
**Tikslas**: kiekvienas viešas paviršius teisingas, kiekvienas atspausdintas QR atsidaro, nė vieno pasenusio teiginio, o jau kasdien publikuojami pinai/postai tampa matuojami — **prieš** siunčiant bet kokį naują lankytoją.
1. **5 minučių**: Vercel env `NEXT_PUBLIC_BRAND_NAME=Game Day Edition`, `NEXT_PUBLIC_SUPPORT_EMAIL=hello@gamedayedition.com`, `NEXT_PUBLIC_OWNER_NAME`, `NEXT_PUBLIC_SITE_URL=https://www.gamedayedition.com` → redeploy (header, footer, title, mailto, laiško parašas persijungia iškart).
2. Commit'inti registrą + 4 QR PNG; pridėti Order 03 (+01/02) kaip unlisted; PII minimizacija (S5); noindex ne-demo; `generateStaticParams`; deploy; `curl` visiems ID iš LISTING-STATE.
3. `/c` klaidos (§5.2 1–6); `app/not-found.tsx`.
4. Rebrand kode (§9.3) + `public/og.webp` perpiešti; `layout.tsx` „25“→18, alt; identifikatoriai (`cover-moment-idempotency`, `onCoverMomentTurnstile`); `package.json`, README, `.env.example`, `complete/route.ts:54`.
5. Stiliai: `styleOptions`/`visualStyles` → 7 iš `STYLE_CODES`; „FIVE finishes“ copy; select be Neon/Vintage.
6. Kainos ir teiginiai: `lib/catalog/prices.ts` (V3 + `saleExpiresAt` 2026-09-24) → paketai iš jo su „Order on Etsy“ CTA per `/go/etsy`; **ištrinti** add-on'us, $699 team, „Stripe payment link“, „One revision“, „16 pt“, „semi-gloss“, „PDF/JPG“, „Cinematic Reveal“, „3–5 photos“, scarcity juostą, „Personal reply within 24 hours“, „first proof within 2 business days“; pridėti chip'us pažodžiui, registro/QR pastraipą, „Printed and shipped free in the US“.
7. **Vartotojų intake forma → išjungta** (S7): CTA į Etsy; lieka tik komandų užklausa (minimalūs laukai) — jei prod Supabase env nepatikrintas, forma laikinai = mailto.
8. Legal: nuimti TEMPLATE etiketes ir „not legal advice“; **pridėti** imprint bloką (juridinis asmuo, adresas, hello@) footer'yje ir `/terms`; COPPA sakinį; registro gyvavimo pažadą; „Etsy refunds are processed on Etsy“; pastraipą apie viešą kortelės puslapį ir unlist/delete kelią el. paštu. Pilnas perrašymas — 1 fazė.
9. Vamzdynas: `app/go/etsy/[sku]/route.ts` + `/etsy`; `app/sitemap.ts` + `app/robots.ts` + canonical + www kanonas; security headers + redirects `next.config.ts`; Organization JSON-LD; GSC, Bing, Pinterest `p:domain_verify`, Meta domain-verification; Vercel Web Analytics + Speed Insights (arba GA4 consent-mode) — **be pikselio**; `content/blocks/*.md` iš LISTING-COPY-PACK, renderinami `/privacy`, `/terms`, FAQ; `/contact`; `public/pins/` + `config.json public_base`; uptime monitorius; Resend domenas SPF/DKIM/DMARC + `RESEND_FROM_EMAIL`; ištrinti negyvą karkasą; Vitest 3 testai + GitHub Actions (lint, tsc, tests).
10. **Savininko veiksmai šią savaitę**: patvirtinti −30 % sale atnaujinimo datą; atnaujinti `hello@` (baigiasi 09-23); **Offsite Ads OUT**; Vercel Pro; patikrinti prod env; pradėti GDE75 goodwill užsakymus (5–8) su marketingo foto sutikimo eilute; IG bio „free shipping worldwide“ → US; `marketing/README.md` kuponų lentelė; **Etsy 15 min redagavimai (ne po užšaldymu)**: išimti 6 stilių dropdown iš 8 SN listingų, FBALL→FTB SKU, paslėpti 30×40 XL, „rounded corners“ Etsy About; publikuoti softball/wrestling card+poster (2–4/d. kadencija); el. laiškas QPMN dėl DDP/muito; paleisti `marketing/report.py` prieš Pinterest eksportą (pirma eilutė `metrics.csv`).
**Išėjimas**: kiekvienas `cardId` iš LISTING-STATE grąžina 200 su statistika prod'e; 0 „Cover Moment/Neon Future/25 cards/PDF/instant“ build'e; kiekviena kaina = Etsy sale; sitemap pateiktas GSC; `/go/etsy` klikai matomi Etsy ataskaitoje per savaitę; Pinterest domenas claim'intas; CI žalias.

### 1 fazė — Digital twin, registras, produkto tiesa, teisė (savaitės 2–4, iki ~Oct 4) · ~2–2.5 inž. sav. + teisininkas
1. `/c` perstatymas pagal §5.3 (finišo tipografija — viena pora per maršrutą, CSS flip **square-cut**, edition panelis, statistika, share/OG, parity CTA, sidabrinis ženklas); `card:new` scriptas su ID seka + QR; `visibility` laukas; demo turtas `public/cards/<id>/` (front/back + flip; regeneruoti Nia Brooks — su auditu); `/registry` paieškos forma (302 tik).
2. Leidimo gramatika (S10) propaguota: puslapio tekstas, `serial` taisyklė, „NUMBERED = carries its registered card ID“ sakinys; **savininkas**: count-neutral Figma TGC pack face + sertifikatas **prieš** pirmą pakelį.
3. `/trading-cards`, `/posters`, `/complete-set` iš `lib/catalog` + `content/blocks` (Product JSON-LD, `offers.url` = Etsy); `/how-it-works`; `/guarantee` su siuntimo lentele; **`/about` su imprint ir logo sakiniu**; header/footer „Shop on Etsy“.
4. Minimalus `/senior-night` (SR turtas, chip'as pažodžiui, order-by skaičiuoklė US laiku, CTA 4564565764, nuorodos į SN šakų listingus) — 1–2 d., live iki ~Sep 27; Reddit profilis / FB mygtukas / pin `link_mode` → į jį, kur kanalas leidžia.
5. `/privacy` + `/terms` perrašymas (§9.5) + **teisininko peržiūra** (BIPA/CUBI/GDPR/COPPA/terms/logo taisyklė) — vienintelė išorinė išlaida; biometrinio sutikimo eilutė į Etsy personalizacijos instrukcijas.
6. Prieinamumo baseline (§9.6) ir performance biudžetas `/c`.
**Išėjimas**: nuskenavus bet kurią atspausdintą kortelę matoma tiksli kortelė, flip, statistika, leidimas ir data; naujas Etsy užsakymas → registruota kortelė < 5 min savininko laiko (`card:new`); realūs klientai unlisted + noindex; legal be TEMPLATE ir po teisininko; `/senior-night` gyvas; CI žalias.

### 2 fazė — Pristatymas, sezoniniai puslapiai, matavimo pagrindas (savaitės 5–9, Oct 5 – Nov 6) · ~2.5 inž. sav.
1. `/order/<token>/files` + `order:new` / `order:publish` + Resend šablonai + post-purchase žinutės šablonas + nuorodos atkūrimas per `/contact` + priminimo politika. (Patvirtinimų UI — ne.)
2. `/senior-night/[sport]`: volleyball, football, soccer, cheerleading iki Oct 15; baseball, softball, wrestling, ice-hockey, basketball iki Dec 1 (sausio aidas); `/christmas-gift` iki Oct 20; `/photo-guide`.
3. Savaitinė atribucijos lentelė (EtsyClicks by campaign vs Etsy vizitai vs užsakymai per listingą); `report.py` prieš Pinterest eksportą; pin `link_mode` alternavimas.
4. Komandų užklausos forma (supaprastinta) ant Supabase, jei prod env veikia; rate-limit per WAF; cron saugojimui — tik jei forma gyva.
5. **Pixel + CAPI + consent — tik jei 8.1 vartai įvykdyti spaliui**; kitaip → 4 fazė.
**Išėjimas**: realus užsakymas pristatytas per `/order/<token>/files` (139 MB) be Drive/WeTransfer; < 10 min nuo Etsy receipt iki nuorodos; SN vaikai ir Christmas hub indeksuoti iki savo datų; savininko admin laikas per užsakymą ≤ 10 min (be meno generavimo).

### 3 fazė — Brando namai, šakos ir finišai, turinio hub'as (Nov – Jan, part-time) · ~3 inž. sav. + savininko copy peržiūra
**Sąlyga**: `/go/etsy` klikai arba reklama egzistuoja — kitaip `/` perstatymas neapsimoka (0 fazės tiesos praėjimas yra deliverable).
1. `/` perstatymas iš server sekcijų pagal 20 skaidrių listingo stuburą; `site-client.tsx` skaidymas; 17 sporto vaizdų regeneravimas iš V3 eksportų (7 stiliai, be swoosh, fiktyvios etiketės) **su auditu**; dizaino tokenai + brando šriftų poros; Inter/Oswald ir gradiento plytelė lauk.
2. `/sports` (17) + `/sports/<sport>` 8 gyvoms; `/styles/[finish]` ×6 su flip ir kambario kadrais; per-maršruto OG; JSON-LD pilnas; `/faq`; prieinamumo pareiškimas; Lighthouse biudžetas CI.
3. Blogas (MDX, 13 lentų): pillar 4 + trust postai 1–2; sezoniniai 3–8 tik jei 1 fazė išėjo laiku **ir** GSC rodo impresijas; 9–10 lapkričio pabaigoje pagal tą patį įrodymą; 11–12 ir toliau — tik pagal GSC.
4. Cituoti pirmus realius Etsy atsiliepimus (vardas + šaka) produktų puslapiuose; goodwill užsakymų produkto fotografija (su sutikimu) keičia kompozitus.
5. `/social/*.mp4` hostingas ir el. pašto rinkimas — **tik jei savininkas nusprendžia automatizuoti publikavimą / yra srautas** (S17).
**Išėjimas**: core puslapiai CWV žali mobile (LCP < 2.5 s); GSC ≥ 60 indeksuotų URL ir pirmos ne-brando impresijos senior-night/Christmas frazėms; ≥ 6 postai gyvi; ≥ 20 % `/go` klikų iš organic/Pinterest nusileidimų svetainėje.

### 4 fazė — Mokamas testas Etsy keliu (Jan – Mar 2027, arba anksčiau tik per vartus) · ~1 inž. d./sav. · media $150–750/mėn pagal ramp'ą
1. Vartų patikra (8.1). 2. Pixel + CAPI + consent (jei dar nėra), `EtsyClick` per `/go`. 3. Vienas `/lp/<slug>` kampanijai (senior-night-<sport> žiemos šakoms sausį; baseball-card, complete-set Feb–Mar); kūryba iš `etsy/listing-videos` + flip su fiktyviais atletais; hook'ai pažodžiui. 4. Meta optimizacija ant `EtsyClick`; ramp'as $5 → $10–15 → $25/d. tik kol Etsy konversija ≥ 1.5 % ir cost/EtsyClick ≤ $3; Pinterest paid $5–10/d. kaip pigesnis palyginimas. 5. Savaitinė sutaikymo lentelė; retargeting per 8.2; **be A/B** iki $1k/mėn. 6. Ketvirčio pabaigoje — Stripe go/no-go.
**Išėjimas**: ≥ 100 `EtsyClick`; laimintis puslapis/pakopa/įrodymas ≤ $3/EtsyClick, blended CPA ≤ $30, ROAS ≥ 3:1 po Etsy mokesčių ant ≥ $76.99; dokumentuotas Stripe sprendimas.

### 5 fazė — Svetainės checkout, komandos, automatizacija (2027 Q2+, vartai) · ~3–4 inž. sav. + merge automatizacija
1. **Stripe vartai (visi 4)**: ≥ 10 Etsy atsiliepimų ≥ 4.8; `/order/<token>/files` gyvas ≥ 3 mėn.; Figma merge automatizacija (TODO #3) → realus užsakymas < ~2 val.; mokamas testas rodo LP→EtsyClick ≥ 8 % **bet** Etsy konversija < 1.5 % (nuteka listingas, ne paklausa). Tada Stripe Checkout Etsy-identiškomis kainomis iš `prices.ts`, webhook → orders → `/order/<token>`, `Purchase` CAPI, 4 žingsnių užsakymas su „Edit customization“; **prieš tai — S19** (demo `/c` be site-commerce nav arba listingų nuotraukos be QR); vartotojų intake forma grįžta (4–10 nuotraukų, migracija 0–10, intake verdiktas, hex spalvos, herbas + teisės, SN laukai, public-page opt-in).
2. `/order/<token>` patvirtinimų UI (plate/proof, be balų) — kai užsakymų > ~5/d.
3. `/team-orders` po ~50 Etsy užsakymų: roster upload, per-player kaina (niekada žemiau Etsy už vienetą), Stripe Invoicing, vienas proof ratas komandai — reikalauja pipeline batch režimo.
4. Registras → Supabase DB (§5.6), `/a/[athleteId]`, `/registry` indeksas; sezono priminimai (tik opt-in el. paštas); optional admin UI apgaubiantis CLI.
5. `/banners` tik su horizontaliu layout'u; fantasy-football turinys tik su produktu.

---

## 12. KPI

| Sritis | Rodikliai |
|---|---|
| QR / registras | 100 % registruotų ID → 200 su statistika ir renderiu (CI prieš prod + uptime); skenavimai per išsiųstą kortelę, flip peržiūros, wallpaper atsisiuntimai, share (be PII); globėjų opt-in rodiklis; 0 neišspręstų takedown > 48 val. |
| Savininko laikas | Etsy receipt → `/order` nuoroda < 10 min; receipt → registruota kortelė < 5 min admin; generacijos ir € per užsakymą (`_spend.jsonl`) nuo 57 / €17.75 link ≤ 10 / ≤ €3.50; mediana val. nuotraukos → proof; revizijų dalis. |
| Paritetas ir tiesa | 0 dienų su kaina < Etsy sale; 0 draudžiamų stringų CI; 0 item-not-as-described. |
| Etsy tiltas | `/go/etsy` klikai/sav. ir jų atitikimas Etsy „social/other“ vizitams; Etsy Search vizitai 0 → 5 → 20 → 50/mėn; atsiliepimai ≥ 3 (reklamos vartai) ir ≥ 10 (Stripe vartai); listingo konversija ≥ 1.5 % mokamais langais. |
| Paid (4 fazė) | cost/EtsyClick ≤ $3; LP→EtsyClick ≥ 8 % paid / ≥ 4 % organic; blended CPA ≤ $30 ir ROAS ≥ 3:1 ant ≥ $76.99; 0 spend digital pakopai; ≥ 100 EtsyClick prieš lookalike. |
| SEO / turinys | GSC indeksuoti URL — 25 (0 fazė), ≥ 60 (3 fazė); pirmos ne-brando impresijos senior-night frazėms iki sausio aido; ≥ 6 postai iki sausio, kiekvienas su ≥ 1 GSC impresija per 30 d.; ≥ 20 % `/go` klikų iš organic/Pinterest iki 6 mėn.; LCP < 2.5 s, CLS < 0.1 `/`, `/senior-night`, `/c`, produktuose; Lighthouse SEO ≥ 95. |
| Fulfilment | 100 % fizinių užsakymų per `/order/<token>/files`; digital ≤ 2 d. d.; reprint/refund dalis; 3 palaikymo žinutės (order/ship/deliver). |
| Brando paritetas (kas ketvirtį) | leidimo eilutė + registro lookup kiekviename produkto paviršiuje; 0 lygų ženklų ar konkurentų vardų; tikra produkto fotografija keičia kompozitus. |

---

## 13. Rizikos ir mitigacijos

1. **Etsy off-platform** — bet koks pre-purchase URL/el. paštas/pigesnė kaina/kuponas gali uždaryti parduotuvę → tik fulfilment tiltai, slide 17 be URL, parity CI su `saleExpiresAt`, jokių kodų svetainėje, neutralūs CTA QR puslapiuose, S19 prieš Stripe.
2. **Tyli kainų divergencija** — sale baigiasi 09-24 → `prices.ts` rodo bazę po datos; atnaujinimas 0 fazės savininko sąraše.
3. **Nepilnamečių privatumas / biometrija / GDPR** — unlisted+noindex default, 3 būsenos, PII minimizacija, jokio pikselio `/c`, biometrinis sutikimas, teisininkas prieš `/order` ir reklamą.
4. **Atribucijos aklumas Etsy keliu** — optimizuoti ant `EtsyClick`, savaitinis agregatas, Stripe tik per vartus.
5. **Pajėgumas** — ~22 val./užsakymą, rankinis merge → biudžetas pririštas prie užsakymų/d.; merge automatizacija prieš skalę.
6. **Spalio pikas webe praleistas** — naujas domenas nereitinguos; minimalus hub'as tarnauja pinams/Reddit/FB ir sausio aidui; rudens pajamos iš Etsy, goodwill ir organic.
7. **Leidimo/skaičiaus ginčai** — S10, count-neutral Figma prieš pakelį, count-bearing menas niekada svetainėje.
8. **Pasenęs turtas** — Nia Brooks eksportai, 5 finišų sprite'ai, swoosh, 30×40 be failo → tipo/hash auditas prieš naudojimą; XL slepiamas.
9. **Ploni/prieštaringi puslapiai** — tik 8 gyvos šakos, `/styles` ≤ 6, demo `classOf` sutvarkyti prieš `/a`.
10. **Prod forma gali būti negyva** — Vercel env auditas 0 fazėje; forma išjungta iki Stripe.
11. **Reklamos platformų politika** (vaikai + AI) — tik fiktyvūs atletai, AI atskleidimas, privatumo eilutė, komentarų moderacija, judge auditas.
12. **HK pakelio muitai** — QPMN DDP/DDU atsakymas prieš pirmą Ultimate; tekstas `/guarantee` ir Etsy.
13. **Hostingo tier'ai** — Vercel Hobby komercinis draudimas → Pro; Supabase pauzė → statinis registras.
14. **Atsparumas** — backup/export registrui, uptime, error monitoring, domeno auto-renew + lock, preview apsauga, secrets rotacija.
15. **Kaštų disciplina** — kiekviena fazė iš esamo turto ir nemokamų/pigių tier'ų; išorinės išlaidos = teisininkas + Vercel Pro + savininko media ramp'as per vartus.

---

## PRIEDAS A — Ko trūksta (pilnas sąrašas)

**Etsy tiltas**: jokios Etsy nuorodos `app/`; nėra `/go`, Share & Save, per-sport maršrutizavimo, UTM sutarties už Pinterest ribų, `/etsy`; Offsite Ads būsena nežinoma ir prieštaringa dokumentuose.
**Registras**: nėra `visibility`/consent/noindex/takedown/retention; ID be unikalumo; turtas pagal stilių, ne cardId; nėra testo, kad atspausdinti ID atsidaro; nėra `/registry` formos, brandinio 404, per-kortelės OG; realaus kliento PII git'e; Order 01–03 be įrašų/QR; DB negyva.
**Kortelės puslapis**: nėra renderio, flip (yra `card-flip/web/flip.html`, neprijungtas), wallpaper, share, edition panelio, finišo tipografijos; `stats[]` klaida; `#01`; „FIRST EDITION“.
**Fulfilment**: nėra `/order/<token>/files` (139 MB vs 5×20 MB); nėra `order:new/publish`; nėra Resend šablonų; 4164205493 pristatymo kanalas neužfiksuotas; nuorodos atkūrimo, priminimo/timeout politikos nėra.
**Matavimas**: nėra pikselio/CAPI, GA4/Vercel WA, Pinterest tag, consent, domenų verifikacijų (Pinterest/Meta/Google/Bing), GSC, UTM reklamai; `report.py` nepaleistas; dashboard'o nėra (Looker Studio ant GA4 + Etsy CSV užtektų); first-party ops įvykių (plate/proof/files) nėra.
**SEO**: nėra sitemap, robots, canonical, JSON-LD, per-maršruto OG, manifest, redirect'ų, security header'ių, MDX/content, Google raktažodžių duomenų; copy — JSX konstantos 53 KB client komponente.
**Puslapiai**: nėra `/sports`, `/styles`, `/senior-night`, `/christmas-gift`, `/trading-cards`, `/posters`, `/complete-set`, `/how-it-works`, `/guarantee`, `/photo-guide`, `/about`, `/contact`, `/faq`, `/team-orders`, `/lp`, `/blog`.
**Pasitikėjimas/teisė**: legal puslapiai — šablonai be teisininko; nėra bendrų copy blokų su Etsy; garantijos, licencijos, imprint, COPPA, biometrijos, GDPR subprocesorių, registro gyvavimo pažado, terms punktų (§9.5); count-bearing menas sako 10; logo sakinys skiriasi tarp Etsy ir savininko taisyklės; „numbered“ slide 02 vs nenumeruotos kortelės.
**Turtas**: nėra 7 stilių vaizdų svetainėje (Heritage/SS/PR/SR nėra `public/`); sprite'ai su išmestais finišais ir swoosh; Nia Brooks eksportai; nėra tikros spausdinto produkto fotografijos; 30×40 be failo; SN print-output aplanko nėra; favicon/manifest/app ikonos nesuplanuotos.
**Ops**: `tests/`, `.github/` tušti; in-memory rate limiter; prod paslaptys nepatikrintos; `hello@` baigiasi 09-23; `photo_count` 0–5; Resend domenas/DMARC/from-email placeholder; backup/uptime/error monitoring/preview apsauga; DNS: HSTS preload, CAA, DMARC, kas valdo DNS, `covermoment.co` likimas.
**Prieinamumas/performance**: jokių a11y punktų; 7 šriftų porų krovimo rizika; 2000×2000 PNG be `next/image`; biudžetų nėra.
**Internacionalizacija**: USD rodymas (savininkas mato EUR Shop Manager), US laiko juosta skaičiuoklei, US datos, digital-worldwide vs physical-US-only kiekviename produkte, ką mato ES/CA lankytojas, Stripe Tax/VAT (5 fazė).
**Atsiliepimai/įrodymai**: 0 Etsy atsiliepimų; citavimo taisyklės ir Etsy sąlygų patikra; komandų quote su roster upload ir komandų pakopomis.
**Etsy pusės priklausomybės** (Priedas D).
**Sąmoningai atidėta (ne spragos)**: Stripe (vartai), `/admin` UI (CLI pirma), `/a` ir `/registry` indeksas, `/banners`, fantasy-football, 30 postų blogas (GSC), el. pašto sekos, A/B, `/social` API hostingas, `/order` patvirtinimų UI, DB migracija, vartotojų intake forma.

## PRIEDAS B — Greiti laimėjimai (šiandien–rytoj, be priklausomybių)

1. Vercel env 4 kintamieji → redeploy (5 min).
2. `generateStaticParams` demo kortelėms (popietė).
3. Vercel Web Analytics + Speed Insights (1 paketas).
4. UptimeRobot ant `/c/GDE-SN-BKB-2026-23` ir `/`.
5. Ištrinti negyvą karkasą (10 min).
6. Order 03 (+01/02) į registrą kaip unlisted tame pačiame commit'e su 4 QR PNG.
7. Pervadinti `cover-moment-idempotency`, `onCoverMomentTurnstile`; patikrinti `favicon.svg`.
8. Security headers + www kanonas `next.config.ts` (30 min).
9. Organization JSON-LD `layout.tsx` (20 min).
10. `content/blocks/*.md` iš LISTING-COPY-PACK → `/privacy`, `/terms`, FAQ.
11. Etsy 15 min: SN dropdown lauk, FBALL→FTB, 30×40 slėpti, „rounded corners“ About, publikuoti softball/wrestling.
12. Resend SPF/DKIM/DMARC + tikras from-email (1 val. su DNS).
13. Imprint footer'yje ir `/terms`; `/contact` su atsakymo langu.
14. IG bio + README kuponų lentelė tą pačią dieną kaip svetainės siuntimo tekstas.
15. `report.py` prieš Pinterest eksportą — pirma `metrics.csv` eilutė.
16. COPPA sakinys + registro gyvavimo pažadas į `/privacy`/`/terms` nuimant TEMPLATE.
17. noindex realiems `/c` įrašams; sitemap'e tik demo.
18. El. laiškas QPMN dėl DDP/muito.

## PRIEDAS C — Savininko sprendimai / atviri klausimai

1. Kada ir kiek atnaujinamas −30 % sale (09-24)? Kokiu %?
2. Ar Offsite Ads dabar IN ar OUT gyvai? (Sprendimas: OUT.)
3. Kuris Facebook Page ID teisingas (61594076368136 vs 1231779406693811)?
4. Kanoninis handle: `gamedayedition` (IG/TikTok/YT) vs `editiongameday` (Pinterest/Gmail) — `sameAs`.
5. Kas valdo DNS (Hostinger vs Vercel); ar `covermoment.co` egzistuoja; nuolatinė `hello@` dėžutė.
6. Ar prod Vercel turi Supabase/Resend/Turnstile paslaptis; ar į `submissions` kada nors kas nors atėjo?
7. Bay „Design Your Own“ tikras kartonas (site sako „16 pt“) — įvardinti ar ne?
8. 30×40 XL: slėpti ar pastatyti failą (6000×8000)?
9. Rush: siūlyti svetainėje ar ne (Etsy — +$25 per žinutę)?
10. Kaip buvo pristatytas 4164205493 zip?
11. Ar plate patvirtinimas kiekviename užsakyme per Etsy žinutes; ar norima kietų vartų svetainėje?
12. Kuris per-order darbo laikas planuojamas: 10 min (savininko) ar 22 val. (paskutinis realus)?
13. Komandų pakopos ir nuolaida „one set per senior“; ar Full Team Set — tik svetainės produktas?
14. Banner linija: $34.99, dydžiai, WHCC vinyl kartu?
15. Ar realių klientų `/c` — opt-in (sprendimas), ar globėjas gali prašyti public?
16. Ar demo atletų sprite'ai su swoosh regeneruojami dabar (S18) ar 3 fazėje?
17. Teisininkas: kas, kada, biudžetas (BIPA/GDPR/COPPA scope).
18. Vercel Pro — patvirtinti.

## PRIEDAS D — Etsy pusės priklausomybės, nuo kurių priklauso svetainė

- 8 SN listingai vis dar su 6 stilių „Choose your art style“ (nuspręsta: tik SR).
- Football SKU `FBALL` → `FTB`.
- 30×40 XL parduodamas be print failo (svetainė slepia; Etsy — sprendimas).
- Etsy About: „rounded corners“ → statūs kampai.
- Softball + wrestling card/poster listingai pastatyti, nepublikuoti (svetainės `/sports` CTA rodo į niekur, kol nepublikuota).
- Etsy shop policies/FAQ nesinchronizuoti su `/guarantee`.
- Slide 02 „NUMBERED“ — vienas sakinys „carries its registered card ID“ (S10) prie kito aprašymo redagavimo (aprašymai ne po 30 d. užšaldymu).
- „Edition number“ Etsy copy → „registered edition ID“.
- Etsy shipping profilis: US-only arba perkainuoti international.
- Biometrinio sutikimo eilutė personalizacijos instrukcijose (prieš kitą US užsakymą).
- Post-purchase žinutės šablonas (§4.2) priimtas.

## Šaltiniai ir metodas

Skaitytojai: `app/*`, `lib/registry/cards.ts`, `supabase/`, `db/`, `scripts/`, `CLAUDE.md`, `docs/GAME-DAY-EDITION.md`, `docs/ORDER-FIELDS-SPEC.md`, `docs/SUPPLIERS.md`, `docs/ETSY-LISTINGS.md`, `docs/ETSY-04-COMPLETE-SET-PLAN.md`, `docs/ETSY-V3-ROLLOUT-HANDOFF.md`, `docs/SENIOR-NIGHT-*.md`, `docs/ETSY-COPY.md`, `docs/ETSY-GROWTH-PLAYBOOK.md`, `etsy/SEO/*`, `etsy/LISTING-STATE.md`, `etsy/LISTING-IMAGE-CANON.md`, `etsy/PLATFORM-CONSTRAINTS.md`, `etsy/listings/*.json`, `marketing/*`, `art-pipeline/README.md` (per-order skyriai), `orders/`, `exports/`, `print-sources/MANIFEST.md`, `youth-athlete-custom-website-codex-brief.md`; konkurentų tyrimas (WebSearch/WebFetch; topps.com ir dalis Etsy blokavo — pažymėta „unverified“ kur remtasi snippet'ais). Gyvi patikrinimai: `curl` prieš `gamedayedition.com` 2026-09-06. Workflow žurnalas: `.claude/.../subagents/workflows/wf_b9ed29cb-b91/journal.jsonl`.
