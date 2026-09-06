# gamedayedition.com — NAUJOS SVETAINĖS BUILD SPEC'AS (2026-09-06)

> **Kas tai.** Sekcija po sekcijos, funkcija po funkcijos aprašyta NAUJA svetainė, kuri **pati parduoda** (Stripe), turi **komandų užsakymo nuorodą**, **vidinį kortelių atvaizdavimą** (registras `/c`), **pilną istoriją** (kas mes ir kodėl), **modernų brandą** ir **SEO struktūrą**. Sena svetainė („Cover Moment“ idėjos fazė) **ignoruojama** — išlieka tik `/c/<cardId>` kelias ir 22 atspausdinti ID (jie ant realių kortelių).
> **Kaip naudoti.** §1 — sprendimai, kuriuos turi patvirtinti (kiekvienas su rekomendacija). §4 — puslapiai; kiekviena sekcija turi *Turinį* ir *Funkciją*, kad galėtum pasakyti „taip / keisk / mesk“. §11 — statymo eilė. §12 — klausimai, į kuriuos man reikia atsakymų prieš pradedant. Patvirtinus §1 + §12 — pradedu 0 fazę tą pačią dieną.
> **Metodas.** 4 nepriklausomi spec'ai (brandas+istorija / konversija+checkout+ops / SEO+struktūra / pasitikėjimas+autentika) → 3 teisėjai (pirkėja-mama, savininkas-ops, brandas-teisė-politika) → pilnumo/sąžiningumo kritikas → ši sintezė. Remiasi `docs/SITE-MASTER-PLAN-2026-09.md` auditu (410 faktų). Kur sintezė nukrypsta nuo master plano — žr. §14.

---

## 0. Kas pasikeitė nuo master plano (2026-09-06 rytas → vakaras)

| Buvo (master planas) | Dabar (šis spec'as) | Kodėl |
|---|---|---|
| Svetainė „nieko neparduoda“ iki 5 fazės vartų (S1, S7) | **Svetainė parduoda tiesiogiai per Stripe nuo 2 fazės**; kaina **kiek aukštesnė nei Etsy** | Savininko sprendimas. Etsy off-platform taisyklė draudžia būti *pigesniam* ir vilioti iš platformos prieš pirkimą — brangesnė savo svetainė konflikto nekuria |
| 0 fazė = „tiesos praėjimas“ esamame puslapyje | 0 fazė = **gyvos svetainės skubi pagalba** (env, QR 404, kainos, imprint — 2–3 d.), o **nauja svetainė statoma iš naujo** nuo 1 fazės | Senas kodas — idėjos fazė; neverta į jį investuoti |
| Komandos — po ~50 Etsy užsakymų | **Komandų nuoroda `/t/<code>` — v1 jau 2 fazėje** (koučo forma → CLI patvirtinimas → dalinama nuoroda) | Savininko prioritetas „kad galėtume išsiųsti visiem“ |
| Registras statinis; DB vėliau | **Lieka** (registras statinis; Supabase tik užsakymams/komandoms) | Supabase free pauzuoja → `/c` niekada nepriklauso nuo DB |
| Etsy taisyklės, PII, biometrija, count-neutral, forbidden strings, reklamos vartai | **Lieka nepakitę** | Politika ir teisė nesikeičia nuo to, kad parduodame patys |

---

## 1. SPRENDIMAI (D1–D28) — patvirtink arba keisk

| # | Sprendimas | Rekomendacija ir pagrindas |
|---|---|---|
| **D1** | **Svetainė parduoda tiesiogiai.** Stripe Checkout (hosted), be paskyros, magic-link užsakymo puslapis. Etsy — antras kanalas („Also on Etsy →“), abu kanalai vykdomi per tą patį `/order/<token>`. | Vienintelis būdas turėti pilną atribuciją reklamai, komandų kanalą ir „rimto verslo“ įspūdį. |
| **D2** ✅ | **Kainos taisyklė (savininko sprendimas 2026-09-06):** svetainė rodo kainą **taip pat kaip Etsy — bazinė perbraukta + sale kaina — bet abi 10 % aukštesnės**: `siteBase = ceilTo99(etsyBase × 1.10)`, `siteSale = ceilTo99(etsySale × 1.10)`; sale rodoma kol `saleExpiresAt` ateityje, po to — tik `siteBase` be perbraukimo. Skaičiuojama iš `lib/catalog/prices.ts`, niekada rašoma ranka. Vitest: `siteSale ≥ etsySale` ir `siteBase ≥ etsyBase`; jokio `$` skaičiaus JSX'e už `prices.ts`. **Etsy kainos vis tiek nerodomos** — perbraukta yra *mūsų* bazinė. | +10 % ≈ Etsy mokesčių krepšelis → marža abiem kanalais panaši. **Teisininkui:** perbraukta „buvusi“ kaina JAV turi būti tikra (16 CFR 233) — sale turi būti terminuota ir realiai baigtis/atsinaujinti su datomis (`saleExpiresAt`), ne amžina. |
| **D3** | **Etsy kaina svetainėje NIEKADA nerodoma.** Jokio perbraukimo, „cheaper“, „buyer protection“. Vienas neutralus outline mygtukas „Also on Etsy →“ per `/go/etsy/<sku>`. Product JSON-LD — **tik svetainės pasiūlymas** (dvi kainos schemoje = palyginimo paviršius). Jokių kuponų svetainėje (GDE75/SENIORNIGHT lieka Etsy). | Sutaria 3 iš 4 spec'ų ir visi teisėjai. |
| **D4** | **Checkout = 4 žingsniai; įsipareigotos datos rodomos 1 žingsnyje PRIEŠ bet kokį darbą; mokėjimas pirma; nuotraukos keliamos PO mokėjimo į `/order/<token>`.** Nepraėjus foto patikrai — **automatinis pilnas refund per 1 d.d.** | Nuotraukos po mokėjimo panaikina draft lentelę, TTL cron'ą, paliktų vaikų nuotraukų riziką ir pending-polling puslapį (teisėjas 2). Etsy About sakinį „we tell you before you pay“ → **„before any art is made“** abiem kanalams (tavo Etsy redagavimas). Atsarginis variantas, jei Stripe/teisininkas vėluoja: užklausa → foto patikra → savininko siunčiama Stripe nuoroda. |
| **D5** ✅ | **Limito nėra (savininko sprendimas):** `weeklyCap` — išjungtas (config `null`), `CapacityNote` nerodoma; **įsipareigotos datos = chip'ai nuo apmokėjimo dienos** („DIGITAL IN 1–2 DAYS · PRINTS SHIP IN 5–7 · SEALED PACK 2–3 WEEKS“, US Eastern d.d.), įšaldomos ant užsakymo; slip politika lieka (§5.6). Senior-night ir komandų skaičiuoklės naudoja tik chip'ų lead time'us. `weeklyCap` lieka kaip **išjungtas jungiklis** — įjungiamas per `capacity:set`, jei kada prireiks. | Savininkas: „galiu padaryti tiek, kiek reikės“. Rizika: chip'ai tampa vieninteliu pažadu — jei antplūdis, `order:advance --new-date` + refund pasiūlymas. |
| **D6** | **Patvirtinimai:** proof patvirtinimas su checklist'u („I checked name, number, spelling, colours“) — **užsakymo puslapyje nuo Stripe paleidimo** (tai garantijos mechanizmas); reference plate patvirtinimas — **el. paštu**, kol užsakymų < ~5/d. **ArcFace/identity balai klientui niekada.** | Teisėjas 3 sprendimas; biometrinė rizika + ginčai dėl skaičiaus. |
| **D7** | **Komandos v1 (2 fazė):** koučo forma → savininko CLI `team:approve` (herbo patikra: ne lygos ženklas) → `/t/<code>` (užrakinta šaka/finišas/herbas/spalvos/deadline; countdown prieš renginį; „N families ordered“; kaina = ta pati site kaina) → **kiekviena šeima moka savo Stripe ir gauna į namus**; koučo magic-link dashboard: skaičius + vardai (tik vardas) + share kit (nuoroda, QR PNG, copy-paste žinutė grupei). **Koučas niekada nemato nuotraukų.** Club invoice / grouped shipping / reveal hold / komandos galerija — **vėliau**, el. paštu, kol antra komanda nepaprašo. | Pipeline'as neturi batch režimo — „nobody's kid is a copy-paste“ parduodama kaip privalumas. Vienintelis tikras pipeline privalumas komandai: herbo/kito plokštelė daroma kartą. |
| **D8** | **Social proof — tik sąžiningas.** Produktų puslapiuose reviews blokas **nerenderinamas** kol nėra realaus atsiliepimo su sutikimu (jokių žvaigždžių, „coming soon“, placeholder'ių). Kandorą neša **„We are new — what that means for you“** blokas (`/guarantee` + prie checkout). Fiktyvūs pavyzdžiai — komponentas `<FictionalLabel>` („Example — fictional athlete · photo and artwork generated“), kuris dengia ir sugeneruotą „before“ nuotrauką. **GDE75 draugų atsiliepimai** — tik su „friends-and-family launch order“ disclosure ir **niekada** į ≥5 AggregateRating. Etsy atsiliepimų citavimas — po Etsy sąlygų patikros, tik kaip tekstas su nuoroda, be schema. | FTC 16 CFR 465 (2024): išgalvoti ir „insider“ atsiliepimai baudžiami; Etsy/Meta — manipuliacija. |
| **D9** | Edition panelyje **„Registered · <data>“**, ne „Verified“ (registras negali autentifikuoti fizinės kortelės). „Verified“ lieka tik proceso aprašyme (identity gate), be skaičių. | Kritiko sąžiningumo punktas. |
| **D10** ✅ | **Įkūrėjas = John Birch**; nuotrauka — iš Etsy parduotuvės profilio (perkelti į `public/brand/founder.jpg`). Rodomas `/about`, home „founder note“, blogo autoriuje, Organization/Person JSON-LD. Miestas ir imprint (juridinis asmuo, adresas, kodas) — **dar reikia** (§12 #6). | Savininko sprendimas 2026-09-06. |
| **D11** | **Fonai:** šviesus **stock** viskam, ką tėvas skaito, pildo, moka (rinkodara, produktai, progos, formos, legal, order status, komandos); tamsus **arena `#080C12`** (flip render'io fonas 8,12,18) tik `/c`, `/styles/[finish]`, flip scenoms ir proof viewer'iui. Tamsi juosta gali būti šviesiame puslapyje kaip „artwork band“; tekstas ant nuotraukos — tik ant vientisos plokštės. | Finišų folija skaitosi tik ant tamsaus; formos ir teisė — „ant popieriaus“, ne gaming UI. |
| **D12** | **Tipografija:** Anton antraštė (DIDŽIOSIOS, baigiasi tašku, ≤2 eil.) → Space Grotesk Bold paantraštė ~2:1 → 38 px tarpas → pill'ai (**Anton pill'e**, pagal §4 tokeną). Body/UI — Space Grotesk 400/500. Barlow — **tik** formų label'iams, lentelių antraštėms, ID/laiko eilutėms. **Niekada** Inter/system-ui, eyebrow, gradientai, tamsios juostos, centruotas baltas tekstas. Per-finišo poros — **tik** `/c` ir `/styles`, **viena pora per maršrutą**. | Savininko taisyklė 2026-09-03 + CONTENT-METHOD §4; teisėjas 3 pataisė 3 nukrypimus. |
| **D13** | **URL tinklas:** `/sports/[sport]` tik 8 gyvoms šakoms (ne `/trading-cards/[sport]` + `/posters/[sport]` + 17 hub'ų); `/teams`, `/t/[code]`, `/t/[code]/manage`; `/order/new`, `/order/[token]`, `/order/[token]/files`, `/order/recover`; `/registry` (tik paieškos forma); `/styles/[finish]` ×6 (prioritetas 0.4); `/senior-night` (+9 šakų); `/christmas-gift` minimalus; FAQPage schema tik ten, kur klausimai matomi, be dubliavimo. | Ploni puslapiai = šablonų parduotuvės įspūdis; vienas intentas = vienas URL (`lib/seo/intents.ts` + testas). |
| **D14** | **Geografija v1: tik JAV** — ir digital, ir physical. Stripe Tax įjungtas, **be** JAV valstijų registracijų (renkama $0 iki nexus slenksčių). | Digital worldwide = ES OSS PVM, UK/AU/CA GST — Etsy tai daro už mus, svetainė ne. |
| **D15** | **Retencija (viena lentelė visur):** nuotraukos — ištrinamos **30 d. po pristatymo**; menas/plokštelės — **12 mėn.** (reprint'ams); embedding'ai — **ištrinami užsakymui užsidarius (≤30 d.)**; registro įrašas — **≥5 m.**; ištrynimo prašymas — įvykdomas per 30 d. Cron realiai vykdo. | Keturi spec'ai turėjo 4 skirtingas lenteles; teisininkui reikia vienos. |
| **D16** | **Biometrija:** atskiras viešas **`/privacy/biometric`** (BIPA §15(a) reikalauja viešos rašytinės saugojimo/naikinimo politikos); biometrinio sutikimo eilutė checkout'e (privaloma) **ir** Etsy personalizacijos instrukcijose; `biometric_audit` eilutė (tik faktas + `deletedAt`, niekada vektorius/balas). | Neprocesuoti nė vieno naujo JAV užsakymo per ArcFace be šito. |
| **D17** | **EU AI Act 50 str.** (galioja nuo 2026-08-02): vienos eilutės atskleidimas, kad vaizdas sugeneruotas AI su žmogaus peržiūra — ant `/c` edition panelio, sertifikato ir failų README (ne tik HOW IT'S MADE). | Studija LT = deployer'is ES. Kaina — viena eilutė. |
| **D18** | **Sealed Foil Pack svetainėje** — tik kai (a) TGC pack face + sertifikatas Figmoje count-neutral ir (b) QPMN DDP/DDU atsakymas gautas; iki tol tier'as **slepiamas**. **30×40 XL slepiamas** kol nėra failo. **Rush — ne.** | Item-not-as-described + muitų rizika. |
| **D19** | **Pixel + CAPI + consent banner — tik reklamos vartų savaitę** (master planas §8); niekada `/c`, `/order`, `/t`. Iki tol: Vercel Web Analytics + Speed Insights (be slapukų), GSC, Bing, `/go` klikų logas. | Kaštų disciplina; COPPA. |
| **D20** | **GDE75 goodwill užsakymai — per Etsy** (atsiliepimai ten, kur skaičiuoja reklamos vartai). Stripe end-to-end testas — tavo paties arba draugo **pilnos kainos** užsakymas. | Kupono svetainėje būti negali (D3). |
| **D21** | **Leidimo gramatika:** registro įrašas = leidimas; fizinės kortelės **nenumeruojamos**; listingų „NUMBERED“ = **„carries its registered card ID“** (vienas sakinys visur); pakelis „18 cards — 4 holographic chase, 14 standard“; SR — „1 OF 1“. | Master planas S10. |
| **D22** | **Logo sakinys (vienas):** „We never reproduce league or governing-body marks (NFL, FIFA, NCAA, Olympic). Your school or club's own crest — yes, exactly as you send it.“ „Nike = Nike“ — gamybos taisyklė, **nereklamuojama**. | Master planas S11; kritiko #8. |
| **D23** | Kainos inkaras: **„less than $4.50 per card“** (perskaičiuota iš site kainos $53.99/12) arba išmesti; **ne** $4.10 (Etsy skaičius). Leidžiamas ir „most shops charge $15–30 for a single one“. Jokių Topps/Panini/slab palyginimų. | Tiesos taisyklė. |
| **D24** | **Balsas:** „we“ visoje svetainėje + pasirašyta pirmo asmens įkūrėjo pastaba. Bendri Etsy blokai (dabar „designed by me“) suvienodinami prie kito Etsy aprašymo redagavimo. | Vienas balsas abiem kanalams. |
| **D25** ⏳ | **Hostingas — pigiausias saugus variantas (savininkas nori be papildomų mokesčių):** F0–F1 lieka **Vercel Hobby**; **nuo Stripe checkout paleidimo (F2) — Vercel Pro $20/mėn** (Hobby sąlygos draudžia komercinį naudojimą; mokėjimus priimanti svetainė yra komercinė — rizika = projekto sustabdymas). **Supabase lieka Free** tik DB eilutėms (užsakymai, komandos — kilobaitai) su **keepalive cron'u** (Vercel Hobby cron 1×/d. pinguoja DB, kad neužmigtų po 7 d.) + **savaitiniu `orders:export`** (free neturi backup'ų). **Failai (nuotraukos + 139 MB rinkiniai) — ne Supabase storage (1 GB free = ~7 užsakymai, 2 GB egress = ~15 atsisiuntimų), o Cloudflare R2** (10 GB free, **egress nemokamas**, toliau $0.015/GB; S3 API, signed URL). Registras — statinis (`public/cards/`). Supabase Pro ($25) — tik jei norėsi backup'ų/SLA, neprivaloma. | Iš viso: ~$0/mėn iki F2, **~$20/mėn nuo F2** (+ Stripe per-transakcinis, + pašto dėžutė ~€1–3). |
| **D26** | **`/c` CTA pagal kanalą** (`channel: site\|etsy\|demo-site\|demo-etsy` įraše): **demo-etsy** (QR ant Etsy listingų nuotraukų) → **tik** „Get yours on Etsy“; kiti → „Order another edition“ (svetainė) + „Also on Etsy“. Jokių kainų ant `/c`. | S19 tampa mechaninis, be listingų nuotraukų pereksportavimo. |
| **D27** | **Istorijai reikia tavo interviu** (Priedas A, 10 klausimų) — repo neturi įkūrėjo, kilmės momento, miesto; Etsy About dar sako „rounded corners“. | Be to „pilnas storytelling“ liks bendrinis. |
| **D28** | **Home H1** = hook'as **„THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.“** (tavo bankas), paantraštė = SEO frazė „Custom sports trading cards and posters from your photos.“ (arba atvirkščiai — tavo pasirinkimas). Kiti hook'ai („DON'T LET THEIR SEASON STAY ON YOUR PHONE.“, „ONE LAST HOME GAME.“) — produktų/progų puslapiams. | Vienas hero, be tab'ų virš fold'o. |

---

## 2. BRANDO SISTEMA (tokenai, tipas, ženklai, vaizdai, judesys, komponentai)

### 2.1 Spalvos (`app/globals.css`, Tailwind 4 `@theme`)
| Token | Reikšmė | Kur |
|---|---|---|
| `--stock` | `#F4F3EF` | šviesus puslapio fonas (= listingų chrome „stock“) |
| `--hairline` | `#E8E7E2` | linijos, rėmeliai ant stock |
| `--ink` | `#14191F` | tekstas ant stock |
| `--muted` | `#6E7278` | antrinis tekstas |
| `--accent` | `#FF6B2B` | **TIK chrome**: pirminiai mygtukai, focus ring, before→after rodyklė, pill'o užpildas, kampų skliaustai. Niekada ant meno, skydo, kaip fonas, kaip tekstas ant tamsaus |
| `--navy` | `#172C50` | skydo plokštė ant stock, footer juosta |
| `--arena` | `#080C12` | tamsus fonas (`/c`, `/styles`, flip scenos, proof viewer) |
| `--arena-surface` | `#14191F` | panelės ant arena |
| `--arena-hairline` | `rgba(255,255,255,.08)` | linijos ant arena |
| `--silver` | gradientas `20deg #FFFFFF→#C7D0DC→#FFFFFF` | **TIK** GDE skydas/wordmark/sertifikato antspaudas; ant stock — flat navy |
| `--pass` / `--fail` | `#4EAF90` / `#D8554B` | būsenų chip'ai (intake, order) |
| `--gold` | `#C9A227` | tik Senior Night medijos viduje |
| `team/primary`, `team/secondary` | iš registro įrašo | **tik** `/c` ir peržiūrose; kontrastas ≥4.85:1 ant arena, kitaip baltas tekstas + 4 px spalvos linija |

### 2.2 Tipografija (`next/font`)
- **Anton** — H1/H2 (didžiosios, taškas gale, ≤2 eil.), pill'ų tekstas. Skalė (rem): display 4.5/3.5/2.75 (desktop/tablet/mobile), h2 2.75/2.25/2, h3 1.5.
- **Space Grotesk** — Bold paantraštė 1.375 (~2:1 prie antraštės), 400/500 body 1.0625 (17 px) / 1.55, small .875.
- **Barlow SemiBold** — tik formų label'iai, lentelių antraštės, ID/laiko eilutės. Niekada eyebrow.
- **Per-finišo poros** (tik `/c/[cardId]` ir `/styles/[finish]`, viena pora per maršrutą): SN Anton+Barlow · CA Russo One+Saira Condensed · FS Passion One+Khand · HE Graduate+Archivo Narrow · SS Space Grotesk+Archivo · PR Orbitron+Chakra Petch · SR Playfair Display+Oswald. Display = atleto vardas/ghost numeris/statistikos reikšmės; supporting = etiketės ir ID — kaip ant kortelės. Finišų pavadinimai rinkodaros puslapiuose — **pre-eksportuoti SVG label'iai**, ne šriftai (kad home lieka su 2 šeimom).

### 2.3 Ženklai
- GDE skydas ir wordmark — **FAILAI**, niekada tekstas: eksportuoti SVG iš Figma 65:3 (skydas) ir 63:3 (wordmark) į `public/brand/`; iki tol `exports/brand/GDE-etsy-shop-icon-1000x1000.png`, `etsy/video/trial/gde-wordmark.png`. Skydas sidabrinis visada (ant stock — navy plokštė); wordmark ant stock tonuojamas navy, ant arena — baltas/sidabrinis. Favicon/app ikonos iš skydo (patikrinti, kad `favicon.svg` nėra „CM“).

### 2.4 Vaizdų taisyklės
- Produktas visada = tikras menas (kortelės front+back, plakatas, sertifikatas, pakelio panelis, kambario kadrai) — **niekada** atleto pozos renderis vietoj produkto; before→after „after“ visada kortelė arba plakatas.
- Kiekvienas fiktyvus atletas — `<FictionalLabel>` komponentas kadre arba iškart po juo („Example — fictional athlete · photo and artwork generated“). Realių klientų daiktai — tik su rašytiniu sutikimu.
- Hero receptas iš Etsy: viena didelė „before“ telefono nuotrauka + stora oranžinė rodyklė → poster + card + pack kompozitas; hero fonai = šakos žaidimo paviršius, tamsiai išblurintas, tekstas ant vientisos plokštės.
- Šaltiniai: `etsy/listing-images/<NN-sport-type>/` (20 skaidrių rinkiniai — jie **yra** produktų puslapių sekcijos: 02 front+back registered, 03 kid on the card, 06 four shots, 08 six finishes, 12–13 photos/crest, 15–16 proof/registered, 19 everything counted), `marketing/cards/*-front|back.png` (15 šakų), `card-flip/out/`, `art-pipeline/out/etsy-shots/packages/` (room-<FIN>.png, hero05-<sport>.png), `print-sources/output/<finish>/`. 2000×2000 šaltiniai per `next/image` AVIF/WebP su `sizes`.
- **Nenaudoti:** 17 senų sprite'ų (išmesti finišai, swoosh), Nia Brooks eksportų, count-bearing pakelio/sertifikato meno, SN/CA wallpaper'ių be safe zonų. Kiekvienas regeneruotas kadras — per judge auditą (S18); tipo/hash auditas prieš įkeliant į `public/`.

### 2.5 Judesys
- **Vienas parašinis judesys** — 5.0 s kortelės flip (portas iš `card-flip/web/flip.html`, **radius 0 — statūs kampai**, ta pati easing kreivė), autoplay tik žemiau fold ir vieną kartą, tap/click/Enter/Space kartoja; `prefers-reduced-motion` → statinis front/back perjungiklis; MP4 fallback.
- 180 ms ease-out hover/focus; 240 ms slide-in edition panelio „Registered“ būsenai. Jokio parallax, scroll-jacking, kilpinio hero video virš fold.

### 2.6 Komponentų kalba
`Pill` (Anton, 999 px; užpildytas orange = pirminis teiginys, outline ink = antrinis, outline silver ant arena) · `DeliveryChips` (pažodiniai chip'ai iš `lib/catalog/delivery.ts`, vienas pristatymo pažadas puslapyje) · `BracketFrame` (4 oranžiniai kampų skliaustai aplink proceso artefaktus — „audito“ motyvas iš video) · `Plate` (vientisa stock/arena plokštė tekstui ant nuotraukos) · `EditionPanel` (arena kortelė, sidabrinė linija: REGISTERED EDITION · ID · finišas · sezonas · Registered <data>) · `StatChip` · `FictionalLabel` (neišjungiamas) · `GateRow` (PHOTO CHECK · KIT · PLATE · SHOTS · VERIFICATION · FINISH su pass/fail chip'ais — tik `/how-it-works`) · `TierCard` (pavadinimas = Etsy varianto vardas ≤20 simb., kaina iš `prices.ts`, „what's in the box“, „ships from“, chip'as) · `TrustLine` (po kiekvienu CTA/upload: „Never posted without your OK · Deleted after delivery, on a schedule you can see · Parent/guardian consent required“; „Never used for AI training“ — tik po Vertex data-use patikros, per `lib/catalog/trust.ts` vėliavą) · `FounderNote` (Space Grotesk italic, pasirašyta) · `CapacityNote` („Next available start: Mon Sep 14 · files by Sep 16 · prints ship by Sep 23“) · `ConsentRow` (vienas sakinys = vienas checkbox, niekada sujungti) · `FourFears` („Still deciding?“ 4 eilučių juosta prie kiekvieno CTA).
Mygtukai: pirminis = orange fill, ink tekstas, 12 px, 48 px aukštis; antrinis = ink outline; **Etsy = outline su „Also on Etsy →“, niekada oranžinis**. Kampai: 12 px UI panelėms, **0 px viskam, kas vaizduoja kortelę**. Ikonos: 1.5 px stroke SVG, jokių emoji.

---

## 3. SITEMAP (galutinis URL tinklas)

`F0` = 0 fazė (skubi pagalba gyvai svetainei) · `F1` = 1 fazė (nauja svetainė be checkout) · `F2` = 2 fazė (checkout, užsakymai, komandos v1) · `F3` = 3 fazė · `F4` = vartai

| Kelias | Paskirtis | Fazė | Indeksavimas |
|---|---|---|---|
| `/` | Brando namai: hook hero, keturios baimės, 3 produktų šeimos, proof before print, registras, 6 finišai + SR, 17 šakų, kaip gaminama (paprastais žodžiais), vaiko nuotraukos, proof wall, įkūrėjo pastaba, progos, footer su imprint | F1 | 1.0 |
| `/trading-cards` · `/posters` · `/complete-set` | Produktų šeimos su 4 pakopom ir spec sheet'u; checkout įėjimas | F1 | 0.9 |
| `/senior-night` · `/senior-night/[sport]` (9) | Proga A; SR tik; order-by skaičiuoklė; 9 išmatuotos šakos | F1 min → F2 vaikai | 1.0 / 0.9 |
| `/christmas-gift` | Proga B (minimalus): order-by lentelė iš chip'ų, per-sport CTA; šventinis copy Oct 20 → Jan 5, URL be metų | F2 | 0.8 sezoniškai |
| `/sports` · `/sports/[sport]` (8 gyvos) | Indeksas 17 (kad „17 sports“ tiesa) + puslapiai tik 8 su listingu; `other-sport`→`/sports/skateboarding` | F3 | 0.6 / 0.8 |
| `/styles/[finish]` (6) | Finišai kaip „paralelės“; tamsus; `/styles/senior-night` 301→`/senior-night` | F3 | 0.4 |
| `/how-it-works` | 6 vartai su tikrais artefaktais, AI atskleidimas, FAQPage | F1 | 0.8 |
| `/guarantee` | OUR PROMISE + siuntimo lentelė + grąžinimai + refund laiptai + „We are new“ | F1 | 0.7 |
| `/photo-guide` | Ką siųsti (4–10) iš `intake.ts` priežasčių | F1 | 0.7 |
| `/about` | Kas prašo mano vaiko nuotraukų: įkūrėjas, kodėl registras/proof, nepriklausomumas, imprint, tikri skaičiai | F1 | 0.6 |
| `/registry` | Paieška pagal ID (302 → `/c`) + kas yra registruotas leidimas + ≥5 m. pažadas | F1 | 0.6 |
| `/c/[cardId]` | **QR digital twin** — parduotas produktas; 22 ID įšaldyti | F0 duomenys → F1 perstatymas | public 0.5; unlisted noindex; private neutralus; deleted 410 |
| `/faq` | Visi matomi klausimai vienoje vietoje (FAQPage tik čia + puslapiuose su savo poaibiu, be dubliavimo) | F1 | 0.5 |
| `/contact` | hello@ + atsakymo langas + pamestos nuorodos atkūrimas + takedown kelias | F0 | 0.3 |
| `/order/new` | 4 žingsnių checkout → Stripe | F2 | noindex, robots disallow |
| `/order/[token]` | Magic-link būsena: nuotraukų įkėlimas → foto patikra → plate → shots → proof (approve/1 revizija) → files → printing → shipped | F2 | noindex |
| `/order/[token]/files` | 139 MB pristatymas (5 aplankai + zip, signed URL) — ir Etsy užsakymams | F2 | noindex |
| `/order/recover` | Užsakymo nr. + pirkimo el. paštas → nuoroda persiunčiama (visada tas pats atsakymas) | F2 | noindex |
| `/teams` | Koučams/klubams/booster tėvams: modelis, 4 žingsniai, kaina, forma | F2 | 0.7 |
| `/t/[code]` | Dalinama komandos nuoroda (užrakintas setup) | F2 | noindex |
| `/t/[code]/manage` | Koučo magic-link dashboard v1 | F2 | noindex |
| `/privacy` · `/privacy/biometric` · `/terms` · `/accessibility` | Tikra teisė (teisininkas), BIPA politika, WCAG 2.2 AA pareiškimas | F0 etiketės → F1 perrašymas → F2 pasirašymas | 0.2 |
| `/blog` · `/blog/[slug]` | MDX hub'as; trust postai pirmi; sezoniniai pagal GSC | F3 | 0.6 |
| `/go/etsy/[sku]` · `/etsy` | Sekami išeinantys redirect'ai (Share & Save + UTM + `outbound_clicks`) | F0 | disallow |
| `/lp/[slug]` | Reklamos LP (be nav, vienas CTA) | F4 | noindex |
| `/pins/*` · `/cards/qr/*` · `/brand/*` | Statinis turtas | F0 | ne sitemap'e |
| `/sitemap.xml` (indeksas: pages/sports/blog/cards-public) · `/robots.txt` · `not-found.tsx` | Techninis SEO; robots disallow `/api /order /go /t /lp`; brandinis 404 „No card registered under this ID — check the back of the card“ | F0 | — |

**Redirect'ai** (`next.config.ts`): `/styles/senior-night`→`/senior-night`; `/sports/other-sport`→`/sports/skateboarding`; seni Cover Moment keliai → atitikmenys; `covermoment.co` → jei resolvina. Kanoninis host `www.gamedayedition.com` (apex 308 jau yra).

---

## 4. PUSLAPIAI — sekcija po sekcijos (A: rinkodara ir istorija)

Formatas: **N) Sekcija** — *Tikslas* → **Turinys** (copy intentas + esamas turtas) → **Funkcija** (elgsena, duomenys) → *Pastabos*. Kiekviena sekcija patvirtinama atskirai.

### 4.1 `/` — brando namai (šviesus stock; 13 sekcijų)

1) **Hero — „THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.“** — *Per 3 s pasakyti kas tai, parodyti transformaciją, kainą, chip'us ir garantiją virš fold.* → Anton H1 (hook'as pažodžiui); Space Grotesk Bold paantraštė „Custom sports trading cards and posters from your photos. One registered edition per athlete.“ Kairėje viena didelė „before“ telefono nuotrauka (fiktyvus roster atletas, `FictionalLabel`) + stora oranžinė rodyklė → dešinėje kortelė front+back + plakatas + pakelis (kompozitas iš `etsy/listing-images/04-complete-set/01-hero` sluoksnių arba `hero05-<sport>.png`). Pill'ai: `FROM YOUR PHOTOS` (orange) · `REGISTERED EDITION` (outline). Kainos eilutė iš `prices.ts`: „from $32.99 digital · $84.99 printed set“. `DeliveryChips` pažodžiui. `TrustLine`. → CTA „Start an order“ → `/order/new` (iki 2 fazės — „Order on Etsy“ per `/go/etsy/GDE-ANY-SET`); antrinis „Look up a card“ → `/registry`. Server-rendered; LCP vaizdas preload; **jokio video virš fold**; be sport tab'ų. → *Niekada „instant“, niekada numeris šakoms be numerio.*

2) **Keturios baimės, atsakytos** — *Tėvo prieštaravimai jų tvarka, kiekviena — vienas paspaudimas iki įrodymo.* → 4 kortelės: „Will it look like my kid?“ (likeness: „we build a reference of your athlete first; if it doesn't look like them, it doesn't ship“ → `/how-it-works#likeness`) · „Who is asking for my child's photos?“ („An independent studio in Lithuania, printed by professional labs in the US. Legal entity and address in the footer.“ → `/about`) · „What if it's wrong?“ (OUR PROMISE pirmas sakinys → `/guarantee`) · „Is this a real card or a photo print?“ (front+back su QR žiedu, „square-cut, UV-coated 2.5×3.5 in, registered ID on the back“ → `/trading-cards#spec`). → Statinė; visa kortelė — nuoroda; SVG ikonos. → *Ši juosta trumpa forma („Still deciding?“) kartojasi prie kiekvieno produkto CTA.*

3) **Trys produktų šeimos** — *Nukreipti į teisingą puslapį su tikra kainų kopėčia.* → `TierCard` ×3: Trading Cards (front+back plytelė), Posters (kambario kadras `room-SN.png`), Complete Set (`tile-printed.jpg`); „from $X“ iš `prices.ts`; po 3 tiesos punktus iš LISTING-COPY-PACK; chip'as; „Free printed Certificate of Authenticity in every shipped package“ — vieną kartą. → Nuorodos į šeimų puslapius; Product JSON-LD ne čia.

4) **Proof before print — pažadas** (tamsi „artwork band“) — *2-a baimė (numeris/rašyba) + refund pažadas.* → Kairėje watermarked proof su `BracketFrame` (`etsy/listing-images/03-senior-night/src/bsb-sr-proof.png` ar `print-sources` proof), dešinėje OUR PROMISE pažodžiui iš `content/blocks/our-promise.md`; pill `YOU SEE IT FIRST`. → Nuorodos į `/guarantee`, `/how-it-works`.

5) **Registruota, ne tik atspausdinta** — *Pristatyti registrą kaip infrastruktūrą ir leisti išbandyti.* → Kortelės nugara su oranžiniu žiedu aplink QR (02 skaidrės iškarpa) → rodyklė → gyvas `EditionPanel` demo kortelei `GDE-SN-BKB-2026-12`; copy „Every card carries its registered card ID on the back. Scan it — the card's own page opens with the edition, the stats and the season. Registered pages stay up for at least five years.“; paieškos laukas inline. → Laukas → POST `/registry` → 302 `/c/<id>`; miss → brandinis not-found inline; rate-limit. → *S10: „carries its registered card ID“, ne „numbered“. Demo pažymėtas „Example edition · Fictional athlete“.*

6) **Šeši finišai, vienas atletas** — *USP prieš vieno šablono parduotuves; finišas kalba medžiaga.* → Horizontali juosta: tas pats fiktyvus atletas SN/CA/FS/HE/SS/PR (`etsy/listing-images/01-basketball-card/src/BK-*-front.png`), finišo pavadinimas — pre-eksportuotas SVG label'is; 7-a plytelė „Senior Night edition“ auksu → `/senior-night`. → Mobile snap-scroll; plytelė → `/styles/[finish]`.

7) **Septyniolika šakų — „Their name, their club crest.“** — *„17 sports“ tiesa + šakų be numerio tiesa.* → 17 plytelių (kortelės front per šaką iš `marketing/cards/` — 15 yra; pickleball ir skateboarding regeneruojamos su auditu); šakos be numerio pažymėtos „their name, their club crest“. → Plytelė → `/sports/[sport]` (8 gyvos) arba `/order/new?sport=` (kitos). → *Niekada numeris cheer/gymnastics/swimming/tennis/golf; plain back wrestling/track/pickleball/skateboarding.*

8) **Kaip gaminama — paprastais žodžiais** — *AI atskleidimas + procesas kaip pasitikėjimas, be žargono home'e.* → Vienas sakinys: „We check your photos, build a reference of your athlete, make four shots, check every one against it, and you approve the proof before anything prints.“ + HOW IT'S MADE blokas pažodžiui (`content/blocks/how-its-made.md`) + 3 mažos artefaktų miniatiūros (intake verdiktas, identity plate, watermarked proof) su `FictionalLabel`. → „See the full process“ → `/how-it-works` (ten GateRow su vartų pavadinimais). → *Niekada „AI generator“; jokių balų.*

9) **Jūsų vaiko nuotraukos** — *3-ia baimė.* → PHOTO PRIVACY blokas pažodžiui + `TrustLine` (3 eilutės) + „We ask for 4–10 photos and nothing else. No date of birth, no home address, no school name.“ + nuoroda į `/privacy` subprocesorių sąrašą ir `/privacy/biometric`. → Statinė; „Never used for AI training“ tik per `trust.ts` vėliavą.

10) **Proof wall (sąžiningas social proof)** — *Ką vertinti pirmą dieną be nė vieno išgalvoto atsiliepimo.* → Kairėje „Example editions“ (8 kortelių front iš `marketing/cards/`, `FictionalLabel`) → `/sports`; centre **viena** atmesta-vs-patvirtinta pora su priežastimi („The kit changed between shots — rejected.“) → `/how-it-works#gates`; dešinėje **„We are new“** trumpa versija („Opened August 2026. One designer, three professional labs, a weekly order cap. That's why the guarantee reads the way it does.“) → `/guarantee`. **Reviews blokas nerenderinamas**, kol nėra realaus atsiliepimo su sutikimu (D8). → `content/reviews/*.json` su `consentToPublish`; count=0 → blokas nėra; ≥1 → citatos su vardu+šaka+šaltiniu; AggregateRating tik ≥5 site-collected.

11) **Įkūrėjo pastaba** — *Žmogus, ne korporacija, prašo nuotraukų.* → Trumpa pirmo asmens pastaba iš About istorijos („Game Day Edition started with a simple observation: kids who love their sport end up with hundreds of photos on a phone and nothing on their wall.“), tikra nuotrauka + vardas + miestas (D10), „Printed by professional labs in the US · Independent — not affiliated with any league, team, school or trading-card company“ → `/about`. → `NEXT_PUBLIC_OWNER_NAME`; nuotrauka — tikra, niekada generuota.

12) **Progos + uždarantis CTA** — *Pagauti 3 variklius ir uždaryti.* → 3 progų kortelės pagal datą (`lib/catalog/seasons.ts`): Senior Night (auksas, SN chip'as pažodžiui) · Christmas (order-by datos iš chip'ų, tik sezonu) · End of season / team gift → `/teams`; H2 „ONE ATHLETE. ONE EDITION.“ + CTA pora + chip'ai + `TrustLine`.

13) **Footer su imprint** — *Teisinė tapatybė kiekviename puslapyje.* → Sidabrinis skydas ant navy; juridinis asmuo, adresas, įmonės/PVM kodas, atsakingas asmuo, hello@; nuorodos: Guarantee · Privacy · Biometric policy · Terms · Accessibility · Registry lookup · Contact · Etsy shop (`/etsy`); INDEPENDENT STUDIO sakinys; social handle'ai iš `marketing/PROFILES.md` (be asmeninio Reddit). → Imprint iš `content/blocks/imprint.md`; Organization JSON-LD layout'e.

### 4.2 Produktų šeimos — `/trading-cards` · `/posters` · `/complete-set` (bendras šablonas, šviesus)

1) **Hero + pakopos** — *Parduoti šeimą svetainės kainomis Etsy variantų vardais.* → H1 (Anton): „CUSTOM TRADING CARDS FROM YOUR PHOTOS.“ / „CUSTOM SPORTS POSTERS FROM YOUR PHOTOS.“ / „THE COMPLETE EDITION: POSTER, CARDS, CERTIFICATE, REGISTRY.“; paantraštė su boundary line („Not a template with a photo dropped in — composed around your athlete“). Kortelės: front+back dideli (`02-front-back-registered.png`) + flip komponentas; plakatai: kambario kadras + to-scale lapas; setas: kompozitas. 4 `TierCard` su Etsy variantų vardais ir site kainomis iš `prices.ts` (žr. §7 lentelę), „what's in the box“ iš LISTING-COPY-PACK, per-tier chip'as, „ships from“; „Free printed Certificate of Authenticity in every shipped package“. `CapacityNote`. → CTA „Choose this package“ → `/order/new?family=&tier=&sport=`; antrinis outline „Also on Etsy →“ → `/go/etsy/<sku>` (be kainos). Product + Offer JSON-LD — **tik site pasiūlymas**, `offers.url` = šis puslapis, `priceValidUntil` = `saleExpiresAt`+1, `shippingDetails` (US, free), `hasMerchantReturnPolicy`. Šakos pasirinkimas (17; plakatams — tik šakos su plakato menu) nustato SKU abiem CTA. Sealed Foil Pack ir 30×40 XL — renderinami tik per katalogo vėliavas (D18). → *Inkaras: „less than $4.50 per card“ (D23). „18 cards — 4 holographic chase, 14 standard“, niekada „18 + 4“.*

2) **Spec sheet** (lentelė vietoj būdvardžių) — *Stipriausias „rimto gamintojo“ signalas.* → Kortelės: Size 2.5×3.5 in · Corners square-cut · Finish UV-coated · Stock „professional photo card stock“ (svoris tik jei Bay patvirtina; **ne** „16 pt“/„semi-gloss“) · Print 300 dpi from 816×1110 · Back: stats, highlight, registered ID, QR · Loose sets 12/24 — printed in California, ship free in the US · Sealed pack 18 (4 holo chase, 14 standard) — printed in Hong Kong, ships separately 2–3 weeks · Digital: PNG 300 dpi only, front+back+certificate+flip MP4×2+GIF. Plakatai: matte 189 g/m², 18×24 / 24×36 (30×40 print-only, paslėpta), 4× upscale iš 5400×7200, veidai tikrinami 4× prieš XL. Setas: 28 failų inventorius (01-print · 02-social · 03-wallpapers su safe zonom · 04-bonus · 05-video) — **tie patys aplankų vardai kaip `/order/[token]/files`**. → Iš `lib/catalog/tiers.ts`.

3) **Front + back, registered** (kortelės) / **To-scale lapas** (plakatai; „the person is the ruler“, 58" centras) / **Everything counted + etapinio pristatymo laiko juosta** (setas: files 1–2 d → prints ship 5–7 → sealed pack 2–3 wks; „Ultimate ships as three tracked packages“) — *Įrodyti, kad tai tikra kortelė / tikras dydis / viskas suskaičiuota.* → 06-four-shots + QR žiedas + `EditionPanel` demo → `/registry`.

4) **Vienas atletas, šeši finišai** — *USP be stilių matricos.* → 08-six-finishes skaidrė (`FictionalLabel`); plytelės → `/styles/[finish]`; SR pastaba → `/senior-night`.

5) **Šakų be numerio tiesa** (kortelės) — *Užbėgti už akių dažniausiam defektui.* → „Cheerleading, gymnastics, swimming, tennis and golf don't wear numbers — their card carries their name and club crest instead. Wrestling, track, pickleball and skateboarding get a plain back.“ + cheer kortelės pavyzdys. → Checkout'e numerio laukas slepiamas šioms šakoms.

6) **Still deciding?** — `FourFears` trumpa juosta prie CTA.

7) **Privalomi blokai + FAQ + CTA** — OUR PROMISE, HOW IT'S MADE, PHOTO PRIVACY, INDEPENDENT STUDIO iš `content/blocks/` (tas pats tekstas kaip Etsy); 6 matomi FAQ (nuotraukų skaičius, šakos be numerio, kampai, ką reiškia „registered“, Etsy vs čia, refund'ai) su FAQPage schema tik matomiems; CTA pora + chip'ai + `TrustLine`.

### 4.3 `/senior-night` ir `/senior-night/[sport]` (9 šakos)

1) **Hero — „ONE LAST HOME GAME.“** → SR hero (`etsy/listing-images/03-senior-night/01-hero.png`; auksas medijos viduje, chrome lieka orange), pill `SENIOR EDITION · 1 OF 1`, chip'as pažodžiui `FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS · SEALED PACK 3–4 WKS`. → CTA „Start their senior edition“ → `/order/new?style=SR`; „Also on Etsy →“ → `/go/etsy/GDE-ANY-SNSET` (4564565764). *Jokio finišo pasirinkimo SN paviršiuose.*

2) **Order-by skaičiuoklė** → „When is senior night?“ (US datos formatas, US Eastern) → kurios pakopos dar spėja (files / printed set / sealed pack) iš SN chip'ų + `weeklyCap`; jei niekas nespėja — sąžiningai: „digital files before the night, printed after“ + **„Gift the digital first“** su spausdinamu dovanų rašteliu. → Gryna funkcija `lib/capacity.ts`; rezultatas deep-link'ina į `/order/new` su pakopa ir data.

3) **Kas yra senior edition** → nugara (`bsb-sr-back.png`: class year, career FR·SO·JR·SR, senior quote), sertifikatas, pakelio panelis (**tik count-neutral**), lipdukas/ženkliukas. 

4) **Devynios šakos** → plytelės su SR front'ais (`card-flip/out/GDE_*SR_*` still'ai) → `/senior-night/[sport]`; kitos šakos → `/order/new?style=SR&sport=`. *Niekada dance/track/band/lacrosse.*

5) **Visa senior klasė?** → „One link for every family.“ → `/teams?occasion=senior-night` (prefill SR).

6) **Pasitikėjimo stekas** → blokai pažodžiui + „Ordering for a senior night date? Add the date — we schedule proofs against real deadlines.“

`/senior-night/[sport]` = tas pats stuburas su šakos SR menu, `'<sport> senior night'` H1 išmatuota žodžių tvarka, šakos FAQ (cheer: be numerio, level/title/years nugaroje), CTA į tos šakos SN listingą (§7 žemėlapis) ir `/order/new`. Pirmi 4 (volleyball, football, soccer, cheerleading) iki Oct 15; likę 5 iki Dec 1.

### 4.4 `/christmas-gift` (minimalus, F2, live Oct 20 → Jan 5)
1) **Order-by lentelė** iš chip'ų + `weeklyCap` per pakopą („Order by Dec 3 for printed sets under the tree; digital by Dec 20“). 2) **Per-sport CTA** į evergreen kortelių/plakatų listingus ir `/order/new`. 3) **„Gift the digital first“** raštelis vėluojantiems. Šventinis copy perjungiamas serverio data; URL be metų; niekada „instant download“.

### 4.5 `/sports` ir `/sports/[sport]` (F3; puslapiai tik 8 gyvoms)
`/sports`: 17 plytelių su kortelės front'u, numeruota/plain-back tiesa per šaką, uodegos šakos → `/order/new?sport=`. `/sports/[sport]`: 1) Hero ant šakos paviršiaus, H1 = listingo head frazė („custom basketball cards“) → 2) front/back + plakatas (jei yra) + du tos šakos finišai → 3) SR įėjimas → 4) šakos FAQ (3) → 5) CTA `/order/new?sport=` + „Also on Etsy“ į tos šakos card/poster/SN listingus. Product JSON-LD per šeimą. *Niekada numeris copy/alt šakoms be numerio.*

### 4.6 `/styles/[finish]` (F3; tamsus; 6)
1) **Medžiagos hero** — front/back + plakatas + kambario kadras (`room-<XX>.png`) + flip MP4; finišo pavadinimas jo display šriftu (vienintelė šiame maršrute krauta pora); medžiagos eilutė („soft silver foil + arena atmosphere“). 2) **Tipografijos pora** ir kodėl. 3) CTA `/order/new?style=<code>`. Sitemap 0.4. Skydas lieka sidabrinis.

### 4.7 `/how-it-works` (F1)
1) **Hero — „MADE BY A PERSON. AI IS IN THE TOOLBOX.“** → HOW IT'S MADE pažodžiui kaip pirma pastraipa. 2) **Šeši vartai, po vieną artefaktą** (`GateRow` + `BracketFrame`): PHOTO CHECK (tikras intake atsisakymo tekstas: „Photo 3 has four faces in it — send one with only <name>“) · KIT BUILD (`_kit.png`; „the kit is a property of the sport“; **tik** D22 logo sakinys) · REFERENCE PLATE („approved and locked before a single pose is made“) · THE SHOTS (4 pozos, „hands asked for“) · VERIFICATION („every crest, number and mark must have a twin on the plate“ — **be skaičių**) · FINISH (proof → approve → print). Akordeonas; vaizdai tik iš fiktyvaus roster'io, audituoti. 3) **Atmesta imtis** — **viena** near-miss vs patvirtinta pora su priežastimi (tikra atmesta, ne inscenizuota). 4) **Pastangų sakinys**: „About fifty frames are generated for one athlete. Four ship.“ (ne „57 generations / 22 h“ plytelė). 5) **Ką tvirtini ir kada** — laiko juosta kaip `/order/[token]` + „Approving means you checked name, number, spelling, colours“ + viena revizija. 6) **Spausdinimo partneriai** tokiais pat aprašomaisiais vardais kaip Etsy deklaracijoje (Professional photo print lab, Santa Cruz CA · Print-on-demand poster partner, Charlotte NC · Trading card pack printing partner, Hong Kong; **be** bannerių eilutės) + FAQ (FAQPage). 

### 4.8 `/guarantee` (F1)
1) **OUR PROMISE pažodžiui** + aiškiomis ribomis (ką reiškia proof approval; ekrano vs spaudos spalvų nuokrypis; be atšaukimo prasidėjus spaudai; „refund and keep the cards“ piktnaudžiavimo ribos → `/terms`). 2) **Siuntimo lentelė per pakopą** iš `lib/catalog/shipping.ts`: Digital (order page, US, 1–2 d.d.) · 12/24 printed cards (California, tracked, 5–7 d.d. po patvirtinimo) · Posters (North Carolina, tracked, tube) · Sealed pack (Hong Kong, 2–3 sav., tracked, **muitų eilutė po QPMN atsakymo**) · Ultimate = 3 sekami paketai. Eilutės apie pakuotę/vežėją pažymėtos „per lab“, kol nė vienas siuntimas nestebėtas (SUPPLIERS.md: testinio užsakymo nebuvo). „Printed and shipped free in the US. Physical and digital: US only for now.“ 3) **Grąžinimai ir kur** — „Etsy orders are refunded on Etsy; orders placed here — here, within 5 business days of the decision.“ 4) **Refund laiptai** (§5.6). 5) **„We are new — what that means for you“** — „Game Day Edition opened in August 2026. We are one designer and three professional labs, with a weekly order cap. That is why the guarantee is written the way it is: the risk of trying us is ours, not yours.“ (pristatytų užsakymų skaičius — tik kai ≥5, tik realūs) + įkūrėjo parašas → `/about`.

### 4.9 `/photo-guide` (F1)
Checklist'as iš `art-pipeline/intake.ts` atmetimo priežasčių (tas pats komponentas naudojamas `/order/[token]` įkėlime): veidas didelis ir ryškus; po vieną ~45° į kiekvieną pusę; viena full-body; viena su komandos apranga; be akinių/skydelio šešėlio; be grupinių, kur kitas veidas panašaus dydžio; originalai, ne screenshot'ai; herbas atskiru failu. Geri/blogi pavyzdžiai (`public/images/photo-guide.webp`, skaidrės 12/13, `FictionalLabel`). „If your photos can't carry the likeness, we tell you before any art is made and refund every cent.“ Spausdinamas.

### 4.10 `/about` (F1)
1) **Kas prašo mano vaiko nuotraukų** — John Birch, nuotrauka iš Etsy profilio, miestas (D10); About istorija (iš `docs/ETSY-COPY.md`, **pataisyta**: square-cut, ne rounded) su **savininko istorijos stuburu (2026-09-06):** „I put everything I know — design and the AI process behind it — into one thing: making a kid look and feel the way they would after a professional photoshoot, on their own card and poster. A gift nobody else has.“ (+ Priedo A atsakymai, jei bus). 2) **Kodėl registras / kodėl proof pirma** — dvi trumpos esė: „A card without a record is a photo print“ (kodėl kiekviena kortelė atsidaro `/c`, ≥5 m. pažadas) ir „Why you see it first“ (plate → shots → verification → proof; kas yra atmesta imtis). 3) **Nepriklausomumas ir ženklai** — INDEPENDENT STUDIO blokas + D22 logo sakinys. 4) **Studija + partneriai** — „Designed in Lithuania — printed by professional labs in the US“; partneriai aprašomaisiais vardais. 5) **Imprint** — pilnas. 6) **Tikri skaičiai** — 17 sports · 7 styles · 18-card sealed pack · 28-file digital set · registry live since August 2026. *Jokių klientų skaičių ar reitingų, kol netikri.* Organization + Person JSON-LD.

### 4.11 `/registry` (F1)
1) **Paieška** — H1 „LOOK UP A CARD.“; laukas su kauke `GDE-XX-XXX-YYYY-NN`, pagalba „Printed on the back of every card and on the certificate“; mygtukas „Find this edition“. → POST → 302 `/c/<id>`; miss → brandinis not-found („mind O vs 0“); private → neutralus; rate-limit (WAF); **jokios enumeracijos**, jokio unlisted/private sąrašo. 2) **Kas yra registruotas leidimas** — kaip skaityti ID (style · sport · season · number/E##), „one edition per athlete per finish per season“, ką registras saugo (tik tai, kas atspausdinta) ir ko niekada (nuotraukų, adresų, gimtadienių), sertifikatas, ≥5 m. pažadas + wind-down → `/terms#registry`. *Atskiro `/verify` nėra.*

### 4.12 `/faq`, `/contact`, `/blog`
- **`/faq`** — visi matomi klausimai (produktai, nuotraukos, šakos be numerio, laikas, AI, privatumas, refund'ai, Etsy vs čia, komandos, registras); FAQPage schema čia; produktų puslapiai rodo poaibį be dubliuoto markup'o.
- **`/contact`** — hello@gamedayedition.com; atsakymo langas (**tik jei įsipareigoji**, §12 #17); „Lost your order link?“ → `/order/recover`; „Card page takedown/unlist: email from the purchase email with the order number“; „Etsy orders: message us on Etsy“. Mailto, jokios formos iki srauto.
- **`/blog`** — MDX (`content/blog/*.mdx`; front-matter: title, slug, category=board, sport, occasion, primaryPage, cta, publishAt, updatedAt, heroAsset, fictionalLabel); kategorijos = 13 Pinterest lentų; BlogPosting schema; **vartai**: 1 fazės išėjimas + GSC verifikuota; pirmi — trust postai (1 „How we turn phone photos into a trading card — honestly“ → `/how-it-works`; 2 „What is a registered edition? The QR on the back of every card“ → `/registry`; 3 „What to photograph before senior night: the 5-photo checklist“ → `/photo-guide`), sezoniniai (master planas §7.5 lentelė) tik pagal GSC impresijas; kiekvienas postas per 150 žodžių → tiksliai vienas money puslapis + `/how-it-works`/`/photo-guide` + vienas CTA (site + `/go/etsy` alt); `updatedAt` atnaujinimas vietoj dublikatų; be kainų/sale % evergreen postuose.

---

## 4. PUSLAPIAI — B: registras, užsakymas, komandos, teisė

### 4.13 `/c/[cardId]` — QR digital twin (tamsus arena; mobile-first, nes įėjimas = QR skenavimas)

1) **Identiteto antraštė** → „FIRST LAST“ finišo display šriftu; meta eilutė „#12 · GUARD · CEDAR RIDGE BEARS · 2026“ — šakoms be numerio ir suaugusiems **be „#“**; sidabrinis skydas (failas) viršuje kairėje; pill `REGISTERED EDITION`; demo įrašams — `FictionalLabel`. → `generateStaticParams` visiems public+unlisted įrašams; **tik to finišo pora** per `next/font`; `team/primary`/`secondary` iš įrašo su kontrasto patikra (fallback sidabras); numeruota/ne iš `lib/catalog/sports.ts`.

2) **Flip hero** → CSS-3D flip tikslaus `public/cards/<cardId>/front.webp` ir `back.webp`, **statūs kampai** (auditas abiem kryptim), 5.0 s kreivė, poster frame = front, „Tap to flip“, MP4 fallback (`card-flip/out/*`). → Klaviatūra (Enter/Space) + SR mygtukas; reduced-motion → statinis su perjungikliu; turtas generuojamas kartą `card:new`/`order:publish` (sharp) iš `orders/<id>/exports` arba demo eksportų; lazy žemiau antraštės; `/c` biudžetas < 300 KB JS.

3) **Edition panel (verifikacijos paviršius)** → Eilutės: EDITION ID `GDE-SN-BKB-2026-12` · FINISH Stadium Night · SPORT Basketball · SEASON 2026 · **REGISTERED Aug 27, 2026** (D9, ne „Verified“) · CERTIFICATE „Printed and included with every shipped package“; SR — `SENIOR EDITION · 1 OF 1`. Sakinys: „One registered edition per athlete, per finish, per season. Physical cards are not individually numbered; the sealed pack is 18 cards — 4 holographic chase, 14 standard.“ **EU AI Act eilutė (D17):** „Artwork generated with AI tools from the athlete's photos and finished by a person.“ → Tas pats komponentas checkout peržiūroje, `/order` ir `/t`; copy-ID mygtukas; „last updated“ iš `updatedAt`; nuoroda „What is a registered edition?“ → `/registry`.

4) **Statistika ir highlight** → iki 3 chip'ų iš `stats[]` (fallback `ppg/apg/rpg` tik seniems basketball įrašams), `playerHighlight`, `classOf` tik demo nepilnamečiams arba opt-in klientams. → Chip'ai praleidžiami, kai `stats[]` tuščias (jokių „—“).

5) **Atsisiuntimai ir dalijimasis** → Realūs klientai: wallpaper'iai (phone lock/home 1290×2796, iPad, desktop, clean variantai — **su safe zonom**; SN/CA regeneruoti prieš rodant) iš užsakymo eksportų; demo — tik front/back PNG + flip GIF. Share: copy link, native share, per-kortelės OG = front (`opengraph-image.tsx`; unlisted — **be vardo**). → Public — statiniai failai; unlisted — neatspėjami, bet nepasirašyti (QR turėtojas = savininkas); wallpaper'iai tik kai užsakymas `delivered`; analitika be PII, jokio pikselio.

6) **Apie šį finišą** → dvi eilutės (medžiaga + tipografijos pora) → `/styles/<finish>`; SR → `/senior-night`. Iš `lib/catalog/styles.ts`.

7) **CTA eilutė pagal kanalą (D26)** → `channel: demo-etsy` (ID ant Etsy listingų nuotraukų) → **tik** „Get yours on Etsy“ → `/go/etsy/<sport card SKU>`; `site`/`etsy`/`demo-site` → „Order another edition“ → `/order/new?sport=&style=` + outline „Also on Etsy →“. **Jokių kainų, jokių kuponų ant `/c`.** Realių klientų puslapiuose — jokios nuorodos į įrašo savininką.

8) **Privatumo ir kontrolės footer'is** → unlisted: „This page is unlisted: it opens only from the card's QR or exact ID, and search engines are asked not to index it.“ · „Report this card“ (visiems, mailto su ID) · **„Manage this page“ NĖRA viešas mygtukas** — „To unlist, make public or delete a page, email hello@ from the purchase email with the order number.“ · public: „Public — shared with guardian permission“. → Būsenų mašina: `public` (indeksuojama, sitemap'e, OG su vardu) · `unlisted` (`noindex,nofollow` + `X-Robots-Tag`, ne sitemap'e, OG be vardo) · `private` (neutralus „This card is registered with Game Day Edition“ be vardo/meno) · `deleted` (410). Default: demo public; realūs klientai unlisted; public tik su `consentPublicAt`+`consentSource`. Nežinomas ID → brandinis 404. Takedown SLA 48 val. (KPI).

### 4.14 `/order/new` — checkout (šviesus; 4 žingsniai; D4)

1) **Žingsnis 1 · Paketas ir data** → Šeimos tab'ai (Cards / Posters / Complete Set / Senior Night set), 4 `TierCard` su site kainom, per-tier chip'as, „Printed packages ship to US addresses only“, „Sealed pack ships separately from Hong Kong, 2–3 weeks“ (jei tier'as įjungtas). **Įsipareigotos datos iš chip'ų nuo šiandien** (D5): „Order today → files by Sep 16 · prints ship by Sep 23 · sealed pack by Oct 7“ — `delivery.ts` (US Eastern d.d.); `weeklyCap` išjungtas. Progos data (optional) → jei pasirinkta pakopa nespėja, rodoma ta, kuri spėja. → Skaito `?family=&tier=&sport=&style=&team=&occasion=`; **tos pačios datos įšaldomos ant užsakymo mokant** (pažadas = sutartis).

2) **Žingsnis 2 · Šaka ir stilius** → 17 šakų tinklelis su kortelės front'u per šaką; 6 finišų plytelės (front/back miniatiūros + medžiagos eilutė) arba „Senior Night edition“ (nuima finišus, prideda class year, FR·SO·JR·SR, senior quote, renginio datą). **Peržiūra = statinė tos šakos demo kortelė tame finiše** (`marketing/cards`) + `EditionPanel` su provisional ID šablonu, užrašas „Your athlete's art is composed after the photo check — this shows the finish, not your kid.“ (jokio gyvo tipografinio renderio). → Šakos be numerio išjungia numerio lauką; komandos nuoroda užrakina šaką/finišą/spalvas/herbą/sezoną (rodoma chip'ais).

3) **Žingsnis 3 · Atleto duomenys + sutikimai** → Laukai pagal `docs/ORDER-FIELDS-SPEC.md` kaip *minkšti* limitai („Names are never shortened — the type steps down instead“): first (12), last (9), number (1–2 skaitm.; slepiamas be numerio), position/event (24), team (15), season, class of (SR), headline (25), bio (2×41), iki 3 stat (value ≤5, label ≤6) su šakos placeholder'iais, „N/A = we choose“; komandos spalvos (2 swatch + hex, kontrasto užuomina); herbas (PNG/SVG, optional) + patvirtinimas „This is our school's or club's own crest and we are allowed to use it. We never reproduce league or governing-body marks (NFL, FIFA, NCAA, Olympic).“; pirkėjo el. paštas, telefonas optional. **`ConsentRow` — po vieną sakinį, niekada sujungti. Privalomi (3):** (1) „I am the athlete, or the parent/legal guardian of the athlete, and I have the right to share these photos.“ (2) **BIOMETRIC:** „I consent to Game Day Edition creating a facial-geometry measurement from the photos I will upload, used only to check that the artwork looks like the athlete, never shared, and destroyed when the order closes. Written policy: /privacy/biometric.“ (3) LICENCE: „I grant permission to create artwork from these photos and the athlete's likeness for this order.“ **Optional, default off (2):** (4) „Make the card's registry page public (searchable). Otherwise it opens only from the QR/ID.“ (5) „You may show my athlete's finished card/poster in marketing (name optional).“ Retencijos laiko juostos grafikas (D15) + subprocesorių eilutė („Photos are processed on Google Vertex AI and stored on Supabase, private bucket“). → Kiekvienas sutikimas saugomas su `textVersion` (`consents_text` lentelė), laiku, IP hash; be (1)–(3) toliau negalima; marketingo sutikimas niekada nesujungtas; jokio pikselio.

4) **Žingsnis 4 · Peržiūra ir mokėjimas** → Santrauka (paketas, šaka, finišas, atleto eilutė, **įsipareigotos datos**, kaina, „Sales tax calculated at checkout“), „Edit“ per žingsnį, „After payment you'll upload 4–10 photos on your order page. We check them within 1 business day; if they can't carry the likeness we refund every cent — before any art is made.“, „Approving your proof later means you checked name, number, spelling and colours.“, „Prefer Etsy?“ outline. → POST `/api/checkout` → Stripe Checkout Session (`mode=payment`, `automatic_tax=on`, `shipping_address_collection` US-only printed tier'ams, metadata: sku/sport/style/teamCode/athlete JSON/consents ref, `client_reference_id`) → hosted Stripe. Webhook `checkout.session.completed` → `orders` eilutė (`status=paid_awaiting_photos`), token (32 B, hash'inamas), įšaldytos datos, provisional `cardId` (seka), Resend „Order received — upload your photos“ su `/order/<token>`; success URL → `/order/<token>` tiesiogiai (be pending polling — webhook paprastai spėja; jei ne, puslapis rodo „Confirming payment…“ ir refresh'ina).

### 4.15 `/order/[token]` — užsakymo puslapis (šviesus; proof viewer tamsus)

1) **Antraštė** → Paketas, šaka, finišas, atleto vardas, užsakymo nr. `GDE-O-<yyyymm>-<seq>`, **įsipareigotos datos**, sidabrinis skydas, `EditionPanel` (provisional → registered). → Token constant-time; no-store; noindex; jokio pikselio; magic link kiekviename būsenos laiške; atkūrimas per `/order/recover`.

2) **Veiksmo kortelė (viena, ta, kurios reikia dabar)** → **Pirma: nuotraukų įkėlimas** (4–10, JPG/PNG/HEIC ≤25 MB, EXIF nuimamas kliento pusėje, per-foto miniatiūros su delete, checklist'as iš `/photo-guide`, herbas jei nepridėtas; „What we never ask: no birthday, no home address, no school“). Vėliau: **Photo check** rezultatas („passed“ arba „we need 2 more photos: <intake.ts priežastys tėvui>“ su įkėlimu; „declined — refunded“); **Reference plate** — el. paštu (D6) su „Does this look like your athlete? Reply approve, or tell us what's off (jaw, hair, build)“; **Proof** — puslapyje: watermarked proof (tamsus viewer, `BracketFrame`), checklist'as „I checked name · number · spelling · colours“, „Edit customization“ prieš approve, „Approve“ (užrakina; spausdintoms pakopoms startuoja spauda — pasakyta ant mygtuko) arba „Request one revision“ (tekstas per elementą); antra revizija — „ask us — usually free for small text fixes“ el. paštu. → Signed upload į privatų bucket `orders/<id>/photos/`; Turnstile; approvals — POST su idempotency raktu, saugomi `order_events`; priminimai 3/7/12 d., pauzė 14 d. („resume any time within 12 months“), pauzė atlaisvina savaitės slotą.

3) **Laiko juosta (būsenos)** → PAID · PHOTOS RECEIVED · PHOTO CHECK (needs_more / declined_refunded) · REFERENCE PLATE (your approval) · THE SHOTS · PROOF (revision_requested) · FILES READY · PRINTING (per paketą) · SHIPPED (per paketą, tracking) · DELIVERED; šalutinės: paused, cancelled. Kiekviena su laiku, „what happens now“, „what we need from you“, ETA iš chip'ų + slot'o — niekada greičiau. Pastabos klientui — paprastas tekstas, **niekada ArcFace balai ar generacijų skaičiai**. Digital baigiasi FILES READY; Ultimate rodo 3 siuntas.

4) **Failai** → kortelė → `/order/[token]/files` kai FILES READY; aplankų sąrašas ir dydis.

5) **Siuntos** → per paketą: turinys, vežėjas, tracking, kilmė (US lab / HK), muitų pastaba pakeliui; iš `order:ship`.

6) **Jūsų kortelės puslapis** → `cardId`, nuoroda į `/c/<cardId>`, matomumo būsena (Unlisted / Public pagal sutikimą) su prašymo keisti nuoroda (el. paštu v1; toggle — kai bus apimtis), „Request deletion of photos“ (sukuria Request ID; per 30 d.; embedding'ai jau ištrinti užsidarius).

7) **Pagalba ir privatumas** → hello@ mailto su užsakymo nr.; atsakymo langas; garantijos santrauka; sutikimų kvitai (ką sutikai, kada, teksto versija); „Etsy orders are supported through Etsy Messages“.

### 4.16 `/order/[token]/files` — pristatymas
5 aplankai kaip eksporte: `01-print` (card front/back 816×1110 300 dpi, poster 18×24 + 24×36, certificate) · `02-social` · `03-wallpapers` (su safe zonom; phone lock/home, tablet, desktop) · `04-bonus` · `05-video` (flip 1080×1350, 1080×1920 MP4 + 540 GIF); `COMPLETE-SET.zip`; README spausdinimo patarimai („Print PNG at 300 dpi, no scaling; a $2 toploader is the most-opened gift“); „PNG only — no PDF/JPG, by design“; EU AI Act eilutė README. → Signed 24 h URL, perpasirašomi kiekvieną apsilankymą; noindex; **jokių kainų, upsell, kuponų**; tas pats puslapis Etsy užsakymams (`order:new --etsy <receipt>`; post-purchase žinutės šablonas §5.5); atsisiuntimų įvykiai be PII.

### 4.17 `/order/recover`
Užsakymo nr. + pirkimo el. paštas → magic link persiunčiamas; **visada** tas pats atsakymas („If this matches an order, an email is on its way“); rate-limit; Turnstile.

### 4.18 `/teams` — koučams, klubams, booster tėvams (F2)

1) **Hero — „ONE TEAM SETUP. EVERY FAMILY ORDERS THEIR OWN.“** → Paantraštė: „You choose the finish, upload the crest and colours once, set a deadline — then share one link. Each parent orders and pays for their own athlete; every card is built individually and checked against its own photos.“ Pill'ai: `SAME PRICE PER ATHLETE` · `CREST APPROVED ONCE` · `NO MINIMUM · NO DEPOSIT`. Kompozitas iš 6 fiktyvių komandos draugų kortelių viename finiše (`FictionalLabel`). → CTA „Create a team link“ → forma. *Jokių nuolaidų kalbos; niekada žemiau Etsy už vienetą.*

2) **Kaip veikia (4 žingsniai)** → 1 Set up (5 min) → 2 Share the link/QR/message → 3 Families order by the deadline → 4 Proofs go to each family; prints ship home. **Privatumo eilutė:** „Your photos go only to the studio. The coach sees names and order status — never photos or files.“ **Laiko sakinys:** „Each athlete is a separate build — nobody's kid is a copy-paste. Files in 1–2 days, prints ship in 5–7, sealed pack 2–3 weeks — per athlete, from each family's order date.“ → Skaičiuoklė: renginio data → paskutinė užsakymo diena per pakopą iš chip'ų (`delivery.ts`).

3) **Kaina komandoms** → per-atleto kaina = 4 pakopos iš `prices.ts`; „Setup is free. Families pay for their own athlete at checkout.“ (Club invoice — „ask us“ el. paštu, D7.)

4) **Sukurti komandos nuorodą (forma)** → koučo vardas/el. paštas/rolė, komanda, šaka, finišas arba Senior Night, sezonas, spalvos (2 hex), herbas + teisių patvirtinimas („I am authorised to use this crest; we never reproduce league marks“), roster dydžio įvertis, renginio/deadline data (min apskaičiuota), pristatymo pageidavimas (home; „one box to me“ — ask us), pastaba. **Jokių vaikų vardų iš koučo.** → Supabase `teams` (status `pending_crest`) + Turnstile; el. pašto verifikacija magic link'u (prieš spam nuorodas); savininkas CLI `team:approve` (herbas ne lygos ženklas; deadline telpa į pajėgumą) → status `open` → `/t/<code>` gyvas + koučui magic link į `/t/<code>/manage` + share kit.

5) **Komandos įrodymas + FAQ** → „First season“ sakinys („We're opening team ordering for the 2026–27 season; the first teams shape how it works“) + fiktyvus kompozitas; FAQ: „Can the club pay one invoice?“ (ask us) · „Same finish for everyone?“ (yes — that's the point) · „Numberless sports?“ · „What does the coach see?“ Jokio „trusted by N teams“, kol N nėra DB skaičius.

### 4.19 `/t/[code]` — dalinama komandos nuoroda (noindex)
1) **Komandos antraštė** → herbas, komandos vardas, šaka, finišas (SVG label), spalvų swatch'ai, **deadline countdown prieš renginį** („Order by Oct 3 for delivery before Senior Night Oct 24“), „Set up by <koučo vardas> · Crest approved“, „N of M families have ordered“ (tik skaičius), kaina per atletą, `FourFears`. → Kodas 8 simb. neatspėjamas; po deadline — „This team link has closed — you can still order solo“ + koučo kontaktas. 2) **Ką gauna kiekviena šeima** → front/back + plakatas tame finiše tai šakai, pakopos su kainom. 3) **CTA „Order for your athlete“** → `/order/new?team=<code>` (šaka/finišas/herbas/spalvos/sezonas užrakinti chip'ais; atleto laukai atviri; savo nuotraukos, sutikimai, Stripe). 4) **Pasitikėjimo stekas** → blokai + „The coach set this up; we build each athlete separately.“ Kiekvienas užsakymas = atskiras pipeline run; `orders.teamId`; skaičius didėja per webhook.

### 4.20 `/t/[code]/manage` — koučo dashboard v1 (magic link; noindex)
1) **Share kit** → nuoroda, QR PNG (per `scripts/gen-card-qr.ts` helper'į), copy-paste žinutė grupės pokalbiui ir el. paštui („Hi parents — our team's Game Day Edition link: … Each family orders their own athlete. Order by <date>.“). 2) **Roster** → eilutės: atleto vardas (tik vardas) + pakopa + būsena (Ordered / Photo check / Plate / Proof / Files / Printing / Shipped) — **be nuotraukų, be el. paštų**. 3) **Deadline** → data, „close link early“ (owner CLI arba mygtukas), pratęsimas perskaičiuojamas prieš pajėgumą. Vėliau (kai antra komanda paprašys): club invoice, grouped shipping (su „close + 10 d.d., late ones ship separately“ taisykle), reveal hold, komandos galerija tik su per-globėjo opt-in.

### 4.21 Teisiniai puslapiai
- **`/privacy`** — paprasta santrauka viršuje: ką renkame (nuotraukos, atspausdinti atleto duomenys, pirkėjo kontaktas/mokėjimas per Stripe), ko niekada neprašome (gimimo data, vaiko adresas, mokykla), kur keliauja (**subprocesoriai**: Vercel, Supabase, Google Vertex AI, Stripe, Resend, spaudos partneriai), retencijos lentelė (D15), GDPR teisės + EU→US perdavimo pastaba, **COPPA pozicija** („service directed to adults; we never collect information from a child; card and order pages carry no forms or trackers“), kortelės puslapio matomumo taisyklės, „delete my photos“ kelias per Request ID, marketingo naudojimas tik atskiru sutikimu. Versijuojama; sutikimų kvitai rodo teksto versiją; be TEMPLATE etikečių.
- **`/privacy/biometric`** (D16) — kas yra matavimas (veido geometrijos palyginimas tik likeness patikrai), kada kuriamas, kad niekada neparduodamas/nesidalinamas/nenaudojamas kitur, saugojimas (sunaikinamas užsakymui užsidarius arba paprašius, kas pirmiau), kas turi prieigą (tik savininkas), kaip naikinimas registruojamas, kontaktas; Illinois/Texas/Washington + GDPR 9 str. paminėjimas teisininko scope.
- **`/terms`** — licencija kurti išvestinius kūrinius iš nuotraukų ir nepilnamečio atvaizdo (globėjo right-of-publicity sutikimas, atskirai nuo marketingo); pristatyto meno naudojimas (asmeninis; perpardavimo taisyklės); proof approval = rašybos/numerio/spalvų priėmimas; be atšaukimo prasidėjus gamybai (plate generuojama prieš plate approval — tai turi būti pasakyta: „cancel with full refund until you approve the reference plate“); ekrano vs spaudos tolerancija; digital negrąžinamas išskyrus garantiją; „refund and keep the cards“ ribos; **registro gyvavimas ≥5 m. + wind-down pledge** (su domeno auto-renew/lock ir fallback'u); „registered edition“ ≠ copyright registracija; herbo teisių patvirtinimas; teisė/jurisdikcija; ES personalizuotų prekių išimtis + digital turinio atsisakymo teisės waiver checkout'e; priminimų/timeout politika (3/14 d.); Etsy užsakymai — Etsy taisyklės.
- **`/accessibility`** — WCAG 2.2 AA pareiškimas (F3).

### 4.22 Pagalbiniai maršrutai
`/go/etsy/[sku]` (302 į `https://gamedayedition.etsy.com/listing/<id>` iš `lib/catalog/listings.ts`, UTM passthrough arba `utm_source=site&utm_medium=referral&utm_campaign=<slug>`, `outbound_clicks` eilutė prieš redirect'ą; fallback 4562711454) · `/etsy` (parduotuvė) · `app/sitemap.ts` (indeksas → pages / sports / blog / cards-public; `lastModified`) · `app/robots.ts` · `not-found.tsx` · `error.tsx` · `opengraph-image.tsx` per maršrutą (home kompozitas; produktas — front/back/plakatas ant stock su kainos pill'u; proga — SR hero su chip'ais; `/c` public — front ant arena su edition juosta ir vardu, unlisted — be vardo; blog — Anton pavadinimo kortelė; komanda — bendrinė be vardų).

---

## 5. SRAUTAI

### 5.1 Checkout (svetainė)
1. Bet kuris CTA → `/order/new` su prefill'ais (šeima, pakopa, šaka, stilius, komanda, progos data). „Also on Etsy →“ lieka kiekvieno žingsnio antraštėje.
2. Ž1: pakopa + **įsipareigotos datos** iš `weeklyCap` + `delivery.ts` (US Eastern d.d.); pilna savaitė → kita, matoma; progos data → spėjanti pakopa.
3. Ž2: šaka + finišas/SR; statinė peržiūra; šakos be numerio → be numerio lauko.
4. Ž3: atleto laukai (minkšti limitai) + herbas + teisės + 3 privalomi ir 2 optional sutikimai (teksto versija, laikas, IP hash) + el. paštas.
5. Ž4: santrauka → Stripe Checkout (Tax on, US-only shipping printed tier'ams) → webhook → `orders` (`paid_awaiting_photos`), token, **datos įšaldomos**, provisional `cardId`, `order_events`, Resend „Order received — upload your photos“ → `/order/<token>`.
6. Klientas įkelia 4–10 nuotraukų `/order/<token>` (signed upload į `orders/<id>/photos/`) → būsena `photos_received` → Resend „Photos received“.
7. Savininkas (Mac): `order:pull <id>` → `art:intake` → `order:advance <id> photo_check --verdict ok|more|declined --reasons …` (viena komanda = įvykis + laiškas; `declined` → `order:refund` automatiškai, pilnai, per 1 d.d.).
8. Plate: `art:athlete --stage identity --from-photos` → `order:advance <id> plate_review --file plate.png` → klientas patvirtina **el. paštu** (atsakymu) → `order:advance plate_approved` → 4 pozos → cutout'ai → judge + identity gate (balai neišeina) → Figma merge → watermarked proof → `order:advance proof --files …`.
9. Proof: klientas patvirtina **puslapyje** su checklist'u arba viena revizija (tekstas) → naujas proof → approve → spausdintoms pakopoms `printing`, digital → `files_ready`.
10. `order:publish <id>` → eksportai į `deliverables/<orderId>/` (signed) + registro įrašas (`card:new`: final ID su seka, visibility pagal sutikimą, `channel=site`), QR PNG, `public/cards/<cardId>/` renderiai (sharp), sitemap revalidate → Resend „Your files are ready“.
11. Spauda: savininkas deda Bay/Printful/(QPMN) užsakymus rankiniu būdu (white-label, Color Correction OFF) → `order:ship <id> --pkg cards|poster|pack --carrier --tracking` per paketą → laiškai → „delivered check-in“ po 2 d. (3 žinučių ciklas) → `delivered`; embedding'ai ištrinami; nuotraukų ištrynimas 30 d. po pristatymo (cron); atsiliepimo kvietimas atskira žinute be paskatos, su aiškiais sutikimo langeliais (atsiliepimas / nuotrauka / vardas).

### 5.2 Etsy užsakymas (vykdymo tiltas)
`order:new --etsy <receiptId> --tier <SKU>` → `orders` (`channel=etsy`) + token → pirma Etsy žinutė (šablonas §5.5) → tas pats ciklas nuo 6 žingsnio; failai per `/order/<token>/files` (+ front PNG ir flip MP4 prisegti Etsy, telpa į 5×20 MB); registro įrašas `channel=etsy` → `/c` CTA pagal D26. **Jokio pre-purchase URL Etsy.**

### 5.3 Komandos užsakymas
1. Koučas: `/teams` forma → el. pašto verifikacija → `teams` (`pending_crest`).
2. Savininkas: `team:approve <id>` (herbas; deadline vs pajėgumas) → `open` → koučui magic link + share kit.
3. Tėvas: `/t/<code>` → „Order for your athlete“ → `/order/new?team=<code>` (užrakinti laukai) → savo sutikimai, savo Stripe, savo adresas.
4. Kiekvienas atletas = atskiras `orders` įrašas/token/cardId/foto patikra/plate/proof; komanda ima iš to paties `weeklyCap`; koučas mato tik vardus + būsenas.
5. Deadline → nuoroda užsidaro (solo užsakymas vis dar galimas su įprastu laiku); vėliau: club invoice / grouped shipping / reveal hold / galerija (per-globėjo opt-in) — el. paštu iki antros komandos.

### 5.4 Kortelės puslapis
QR (apex 308 → www) arba `/registry` → statinis `/c/<id>` pagal `visibility` → flip → edition panel („Registered · data“) → stats → downloads/share → CTA pagal `channel` → footer su takedown keliu. Nežinomas → 404; ištrintas → 410.

### 5.5 Post-purchase Etsy žinutės šablonas (pažodžiui; be kainų/upsell/kodų/naujienlaiškio)
> Your order page — upload your photos, follow progress and download your files: <link>. Files are delivered there because the full set is larger than Etsy's attachment limit; the card front and flip video are attached here too. Nothing to pay, nothing to sign up for.

### 5.6 Refund laiptai (svetainės užsakymai)
Iki reference plate patvirtinimo — atšaukti bet kada, pilnas refund · Foto patikra nepraėjo ir nėra geresnių nuotraukų — automatinis pilnas refund · Po vienos revizijos vis tiek nepatinka proof — refund every cent · Po proof patvirtinimo — spauda prasideda, be atšaukimo, bet spaudos defektas → free reprint arba refund and keep the cards · Digital po pristatymo negrąžinamas išskyrus garantiją · **Slip politika:** jei studija nespėja į įšaldytą datą — `order:advance --new-date --note` → laiškas + pilno refund pasiūlymas, jei nauja data praleidžia progos datą · Priminimai 3/7/12 d., pauzė 14 d., resume per 12 mėn. · Etsy užsakymai — Etsy.

### 5.7 Transakciniai laiškai (Resend; 10 šablonų, ne 25)
`order_received` (upload photos) · `photos_received` · `photo_check_ok` · `photo_check_more` · `photo_check_declined_refunded` · `plate_ready` (approve by reply) · `proof_ready` · `files_ready` · `shipped_<package>` · `delivered_checkin`; + `reminder_1/2/3`, `paused`, `slip_notice`, `link_recovery`, `team_verify`, `team_created`, `deletion_done` — visi su magic link, pašto adresu footer'yje (CAN-SPAM), be marketingo.

---

## 6. SĄŽININGAS SOCIAL PROOF — kiekvienas blokas „prieš“ ir „po“ realių atsiliepimų

| Blokas | Kur | PRIEŠ (nuo 1 dienos) | PO (kai yra tikri) | Kodėl sąžininga |
|---|---|---|---|---|
| Pavyzdinių leidimų galerija | `/`, produktai, `/teams` | 6–8 fiktyvūs roster atletai (front+back+plakatas), kiekvienas su `FictionalLabel` **kadre**; antraštė „Every example on this site is a fictional athlete from our own roster — we never show a customer's child without written permission.“ | Nesikeičia; atskira eilutė „Customer editions · shared with permission · <sport>“ tik su marketingo sutikimu + globėjo parašu | Etiketė ant paveikslo, ne išnašoje; komponentas neišjungiamas |
| Proceso įrodymas | `/how-it-works`, `/` | Tikras intake atsisakymas, identity plate, **viena** atmesta-vs-patvirtinta pora su priežastimi, `art:diff` lapas, watermarked proof; „About fifty frames are generated. Four ship.“ | Nesikeičia (+ realaus kliento pora tik su sutikimu ir išblurintu veidu) | Rodo, ką atsisakėme, ne ką teigiame; jokių balų |
| Registras kaip įrodymas | `/registry`, `/c`, `/` | Gyva demo paieška + „registry live since August 2026“ + ≥5 m. pažadas; **jokio skaičiaus** | „N registered editions“ tik kai ≥25 realių (demo neįskaičiuojami), skaičiuojama iš registro | Paieška veikia kiekvienam atspausdintam ID (CI) |
| Garantija | kiekvienas CTA, `/guarantee` | OUR PROMISE pažodžiui + „Because we are new, the risk of trying us is ours.“ | Nesikeičia | Įsipareigojimas, ne teiginys apie kitus |
| „We are new“ | `/guarantee`, prie checkout, `/` trumpai | „Opened August 2026. One designer, three professional labs, a weekly order cap…“ | Pristatytų skaičius tik ≥5, tik realūs | Kandorą apie mastą = įrodymas, kad niekas kitas neišpūsta |
| Tikrų skaičių juosta | `/`, `/about`, footer | 17 sports · 7 styles · 18-card sealed pack (4 holo, 14 std) · 28-file set · square-cut UV · registered ID on every card | Nesikeičia | Kiekvienas skaičius iš `lib/catalog`, su nuoroda į įrodantį puslapį |
| Įkūrėjas | `/about`, `/`, blogo autorius | Tikras vardas, tikra nuotrauka, miestas, imprint, partneriai aprašomaisiais vardais | + tikri etapai („100 editions registered“) | Patikrinama tapatybė, ne būdvardžiai |
| Atsiliepimų blokas | produktai, `/` | **Nerenderinamas** (jokių žvaigždžių, „coming soon“, placeholder'ių) | Vardas + inicialas, šaka, pakopa, citata pažodžiui (ir kritika), „Verified Etsy purchase“ (nuoroda į listingo atsiliepimą) arba „Verified order“, data, „Shared with the buyer's permission“; **GDE75 draugų** — tik su „friends-and-family launch order“ ir niekada į schema; AggregateRating tik ≥5 site-collected; niekada už nuolaidą | FTC 16 CFR 465; Etsy/Meta |
| „In the wild“ nuotraukos | produktai, `/senior-night` | **Paslėpta** (jokio placeholder'io) | Klientų pristatytų daiktų nuotraukos su atskiru rašytiniu sutikimu, „Customer photo · shared with permission“ | Blokas neegzistuoja, kol nėra tikros nuotraukos |
| Komandų įrodymas | `/teams` | „First season“ sakinys + fiktyvus kompozitas | Viena tikra komandos istorija su koučo sutikimu, be atletų PII | „Teams we've built: N“ tik kai N iš DB > 0 |
| Etsy parduotuvės nuoroda | footer, produktai | Neutralus „See our Etsy shop →“ | + Etsy reitingas tik ≥5, kopijuojamas ranka su data (po Etsy sąlygų patikros) | Jokio scrapinimo, kupono, kainų palyginimo |
| Užsakymo puslapio sąžiningumas | `/order/<token>` | Įšaldytos datos, priminimų politika, „kas, jei nespėsime“ nuo 1 dienos | — | Antram pirkėjui (dažnai komandos draugo tėvui) tai ir yra social proof |

---

## 7. KAINODARA

**Taisyklė (D2):** `sitePrice(sku, now) = ceilTo99(etsyBuyerNow(sku, now) × 1.10)`; `etsyBuyerNow` = `etsySale` kol `saleExpiresAt` ateityje, kitaip `etsyBase`. Skaičiuojama build ir request metu iš `lib/catalog/prices.ts`. Testai: (1) kiekvienas SKU ≥ Etsy pirkėjo kaina abiem sale būsenom; (2) jokio `$\d` JSX'e už `prices.ts`; (3) `saleExpiresAt` ateityje **arba** rodoma bazė. Jokių kuponų svetainėje. Komandos = ta pati kaina.

| Šeima · pakopa (Etsy varianto vardas) | Etsy bazė | Etsy sale (pirkėjas dabar) | **Svetainė dabar** | Svetainė po sale (bazė×1.10) |
|---|---|---|---|---|
| Cards · Digital Card Files | 41.99 | 29.39 | **32.99** | 46.99 |
| Cards · 12 Printed Cards | 69.99 | 48.99 | **53.99** | 76.99 |
| Cards · 24 Printed Cards | 98.99 | 69.29 | **76.99** | 108.99 |
| Cards · Sealed Foil Pack *(slepiama iki D18)* | 84.99 | 59.49 | **65.99** | 93.99 |
| Posters · Digital Poster Files | 41.99 | 29.39 | **32.99** | 46.99 |
| Posters · 18×24 | 83.99 | 58.79 | **64.99** | 92.99 |
| Posters · 24×36 | 97.99 | 68.59 | **75.99** | 107.99 |
| Posters · 30×40 XL *(slepiama)* | 155.99 | 109.19 | 120.99 | 171.99 |
| Set · Digital Complete Set | 49.99 | 34.99 | **38.99** | 54.99 |
| Set · Printed Set | 109.99 | 76.99 | **84.99** | 120.99 |
| Set · Deluxe Set | 135.99 | 95.19 | **104.99** | 149.99 |
| Set · Ultimate Set | 199.99 | 139.99 | **153.99** | 219.99 |

Pastabos: Stripe (LT subjektas, USD kortelės) ≈ 3.25 % + €0.25 + ~2 % FX be USD atsiskaitymo sąskaitos — „ta pati marža abiem kanalais“ **neįrodyta**, +10 % yra apatinė riba; Etsy Payments LT ≈ 4 % + €0.30 + PVM. Stripe Tax: įjungtas, be JAV registracijų ($0 iki nexus). Per-kortelės inkaras „less than $4.50 per card“ (12 × $53.99).

---

## 8. SEO

- **Raktažodis → URL nuosavybė** (`lib/seo/intents.ts`, Vitest unikalumas): brandas → `/`; „custom trading cards“, „custom sports trading cards“ → `/trading-cards`; „custom <sport> card(s)“ → `/sports/[sport]` (8); „custom sports poster“, „sports wall art from photo“, „gym wall art“, „dorm room decor“ → `/posters`; „sports poster and trading card set“ → `/complete-set`; „senior night gift(s)/poster/ideas“, „senior gifts“, „senior year gifts“ → `/senior-night`; „<sport> senior night“ → `/senior-night/[sport]`; „christmas gifts for <sport> players“, „gifts for young athletes“ → `/christmas-gift`; „team gifts <sport>“, „end of season team gift“, „baseball team gifts“ → `/teams`; „how are custom trading cards made“ → `/how-it-works`; „what photos for a custom card“ → `/photo-guide`; „trading card registry / registered edition / QR“ → `/registry` + postas #2. **Niekada:** plikas „<sport> cards“ (Panini lentyna), „personalized card“ (atvirukai), „senior banner“ (nėra produkto), dance/track/band/lacrosse SN, sport×finish matricos.
- **Etsy anti-kanibalizacija:** Google rodo ir svetainę, ir listingą — du rezultatai, ne konfliktas; taisyklė = **nuoseklumas**: svetainės puslapis, kuris nukreipia į listingą, naudoja jo head frazę ta pačia žodžių tvarka H1/anchor'e ir niekada neprieštarauja kainai, skaičiui, laikui; svetainė savinasi informacinius modifikatorius (ideas, checklist, timeline, sizes, how it's made) ir registro paviršių; Etsy 30 d. title/tag užšaldymas nepaliestas.
- **Title/meta šablonai:** produktas „<Head phrase> From Your Photos | Game Day Edition“ (≤60), meta ≤155 su boundary line; proga „<Occasion> Gift: Custom Poster & Card Set | Game Day Edition“; `/c` public „<First> <Last> · <Team> · <Finish> — Registered Game Day Edition“, unlisted „<Finish> — Registered Edition“; blogas „<Title> | Game Day Edition“. Be „youth“. Vienas H1 per puslapį.
- **Techninis:** kanoninis `www`; `NEXT_PUBLIC_SITE_URL` vienoje vietoje (`lib/site.ts` — dabar du skirtingi default'ai); `alternates.canonical` per `generateMetadata`; sitemap indeksas (pages/sports/blog/cards-public, `lastmod`); robots disallow `/api /order /go /t /lp`; `noindex` + `X-Robots-Tag` unlisted `/c`, `/order/*`, `/t/*`, `/lp/*`; 410 ištrintoms kortelėms; redirect'ai; HSTS preload, X-Frame-Options, Referrer-Policy, CSP; DNS: CAA, DMARC; manifest + skydo ikonos; IndexNow (Bing); GSC + Bing + Pinterest `p:domain_verify` + Meta domain-verification meta tag'ai layout'e; be hreflang; USD; US datos; US Eastern d.d. serveryje.
- **JSON-LD** (`lib/seo/jsonld.ts`, testuojamas): Organization (skydo logo, `sameAs` su kanoniniu handle'u, founder Person, address = imprint) + WebSite layout'e; Product+Offer (tik site) su `shippingDetails` ir `hasMerchantReturnPolicy` šeimose/šakose/progose; BreadcrumbList visur; FAQPage tik ten, kur klausimai matomi, be dubliavimo; Article `/how-it-works`, `/photo-guide`; BlogPosting; CollectionPage `/sports/[sport]`; ImageObject + VideoObject (flip) **tik** public `/c`; Review/AggregateRating tik ≥5 site-collected su sutikimu — niekada Etsy citatos kaip markup.
- **Per-maršruto OG** — §4.22.
- **Vaizdų SEO:** `next/image` + `sizes` visur; aprašomieji failų vardai (`football-trading-card-front-fire-and-smoke.webp`); alt iš įrašų („Custom football trading card front — Fire & Smoke finish — example artwork, fictional athlete“); lazy žemiau fold, LCP preload; flip MP4 su poster frame.
- **CWV biudžetas:** LCP < 2.5 s mobile (`/`, `/senior-night`, `/c`, produktai); CLS < 0.1 (rezervuotos medijos dėžės); `/c` < 300 KB JS, < 1 MB above-the-fold; viena šriftų pora per maršrutą; Lighthouse SEO ≥ 95; Speed Insights.
- **Blogas** — §4.12; sezoninis URL be metų; GSC-vartai; viena Google raktažodžių praeiga prieš užšaldant pavadinimus (visi skaičiai — Etsy Insights).
- **Pinterest kaip kanalas:** domeno claim; `public/pins/` + `config.json public_base`; `link_mode` `engine.py caption()` (pinas → svetainės puslapis, `utm_content` = pin id); Product rich pins skaito Product schema (kaina sutaps — tas pats šaltinis); `report.py` prieš kiekvieną eksportą.
- **Draudžiami stringai (CI grep — puslapiai, MDX, alt, schema, identifikatoriai):** `instant`; `25 cards`; `18 + 4`; `rounded corners`; `free shipping worldwide`; `Topps`/`Panini`/`Upper Deck`; `graded slab`; `AI generator`; `Cover Moment`; `Neon Future`; `Vintage`; `PDF`; `Stripe payment link`; `16 pt`; `semi-glossy?`; `Verified` ant edition panelio; `Same price on Etsy`; `cheaper`; numeris šakoms be numerio; kainos/sale % evergreen postuose; `review`/`stars` copy be duomenų šaltinio; count-bearing pakelio menas (hash denylist); `cover-moment-idempotency`, `onCoverMomentTurnstile`.

---

## 9. DUOMENŲ MODELIS

**Katalogas (kodas, ne DB):** `lib/catalog/prices.ts` (sku, family, tierName ≤20, etsyBase, etsySale, saleExpiresAt, sitePrice()) · `tiers.ts` (deliverables, paketų skaičius, kilmė, chip'as, flags: `packEnabled`, `xlFileExists`) · `delivery.ts` (chip'ai pažodžiui, digitalBusinessDays [1,2], shipBusinessDays [5,7], packWeeks [2,3], SR variantas, `computeCommittedDates`) · `shipping.ts` (partneris aprašomuoju vardu, kilmė, vežėjas „per lab“, tracking, customsNote) · `sports.ts` (slug, name, code, hasBackNumber, numbered, statLabelExamples, hasPosterArt, live, `indexable()`) · `styles.ts` (code, name, fontPair, materialLine, flipAssets, isOccasion) · `listings.ts` (SKU → Etsy listing ID, fallback 4562711454) · `seasons.ts` (progų langai) · `trust.ts` (`vertexNoTrainingVerified`) · `lib/capacity.ts` (weeklyCap, leadTimes, businessDays US Eastern, `earliestDates(tier, now, roster)`, `feasible()`) · `lib/seo/intents.ts` · `lib/site.ts` (vienas SITE_URL).

**Registras (statinis; `lib/registry/cards.ts`, atgal suderinamas):** `cardId` (22 įšaldyti; nauji su seka: numeruotos `-<n>`, kolizija `-<n>-2`, be numerio/suaugę `-E07`), `athleteId`, `firstName`, `lastName`, `jerseyNumber?`, `position`, `team`, `season`, `classOf?`, `stats[]`, `playerHighlight?`, `sportCode`, `sportSlug`, `styleName`, `styleCode`, `serial?` (rodomas tik SR), **`visibility`** (`public|unlisted|private|deleted`), **`channel`** (`site|etsy|demo-site|demo-etsy`), `isFictional`, `consentPublicAt?`, `consentSource?`, `marketingUseConsentAt?`, `teamColors {primary, secondary}`, `assets {front, back, flipMp4, flipGif, poster?, wallpapers?[]}`, `orderRef?` (nepermatomas id; **ne** Etsy receipt), `registeredAt`, `updatedAt`. **Be** miesto, el. pašto, komentarų. `makeCardId(p, seq)` + unikalumo testas. Turtas: `public/cards/<cardId>/{front,back}.webp, flip.mp4, flip.gif, og.png`; wallpaper'iai — bucket `cards/<cardId>/wallpapers/*` (signed unlisted). Migracija į Postgres — kai realių kortelių > ~50 arba reikia `/a`.

**Supabase (Postgres, service-role tik serveryje, RLS be politikų; Pro nuo checkout):**
- `orders` — id, orderNumber, tokenHash, tokenExpiresAt, channel (`site|etsy`), etsyReceiptId?, stripeSessionId?, stripePaymentIntentId?, sku, family, tier, sportSlug, styleCode, occasionDate?, teamId?, email, shipTo JSON? (US), amounts (subtotal, tax, total, currency), **committedDigitalBy, committedShipBy, committedPackBy**, capacityWeek, athlete JSON (tik atspausdinami laukai + teamPrimary/Secondary, crestAssetId?, crestRightsAffirmedAt), ageBand (`adult|minor`), status enum (`paid_awaiting_photos, photos_received, photo_check, needs_more_photos, declined_refunded, plate_pending, plate_approved, shots, proof_pending, revision_requested, proof_approved, files_ready, printing, shipped, delivered, paused, cancelled`), cardId?, revisionUsed, pausedAt?, photosDeletedAt?, embeddingsDeletedAt?, createdAt, updatedAt.
- `order_events` — orderId, fromStatus, toStatus, customerNote, internalNote, actor (`cli|customer|webhook|cron`), attachments[], at.
- `order_assets` — orderId, kind (`photo|crest|plate|proof|deliverable|zip`), bucketPath, bytes, sha256, width, height, folder, deleteAt?, deletedAt?.
- `consents` — orderId, kind (`guardian|biometric|licence|crestRights|publicPage|marketingUse|review`), textVersion, acceptedAt, ipHash, revokedAt?; `consents_text` — version, kind, text, effectiveFrom.
- `biometric_audit` — orderId, createdAt, purpose (`likeness check`), deletedAt (tik faktas).
- `shipments` — orderId, package (`cards|poster|pack`), supplier, carrier, tracking, origin, shippedAt, deliveredAt?, customsNote?.
- `refunds` — orderId, stripeRefundId, amount, reason (`declined_photos|promise|cancel_before_plate|print_defect|slip`), at.
- `teams` — id, code (8 simb.), name, sportSlug, styleCode|SR, season, colors JSON, crestPath, crestRightsAffirmedAt, coachName, coachEmail, coachRole, manageTokenHash, rosterEstimate, deadline, closeAt?, shipMode (`home` v1), status (`pending_crest|open|closed`), createdAt.
- `outbound_clicks` — sku, listingId, referrerPath, utm JSON, uaHash, at.
- `reviews` — orderId?, source (`site|etsy`), etsyListingId?, displayName, sport, tier, text, rating?, isFriendsAndFamily, consentAt, published, publishedAt.
- `email_log` — orderId?/teamId?, template, resendId, at.
**Storage:** **Cloudflare R2** (S3 API, free egress) — privatūs `orders/<id>/{photos,crest,plates,proofs}/`, `deliverables/<orderId>/` (signed URL 24 h); vieši repo `public/cards/<cardId>/`, `public/brand/`, `public/images/products/<family>/<sport>/`, `public/pins/`. Supabase storage nenaudojamas (free tier limitai).
**Turinys:** `content/blocks/*.md` (how-its-made, photo-privacy, independent-studio, digital-product, our-promise, imprint, logo-sentence, chips-standard, chips-senior-night) — renderinami svetainėje **ir** kopijuojami į Etsy; `content/blog/*.mdx`; `content/legal/*.mdx` (versijuojami); `content/reviews/*.json`.

---

## 10. TECHNINĖ ARCHITEKTŪRA, CLI, TESTAI

- **Stack:** Next.js 16 App Router + TS + Tailwind 4 (`@theme` tokenai) + `next/font`; Vercel Hobby → **Pro nuo F2**; Supabase Postgres **Free** (DB tik; keepalive cron + savaitinis export) + **Cloudflare R2** failams; Stripe (Checkout, Tax, webhooks, Refunds); Resend (SPF/DKIM `mail.gamedayedition.com`, DMARC); Turnstile; Vercel WAF rate-limit (`/registry`, `/order/recover`, upload); Vercel cron (retencija, priminimai, `saleExpiresAt` revalidate); Vercel Web Analytics + Speed Insights; UptimeRobot (`/c/GDE-SN-BKB-2026-23`, `/`).
- **Maršrutų grupės:** `(marketing)` server-rendered iš `content/` + `lib/catalog`; `(registry)` `/c`, `/registry` statiniai (`generateStaticParams`, revalidate rašant); `(order)` `/order/*`, `/t/*` dinaminiai, no-store, noindex; `api/` (checkout, stripe/webhook, uploads/sign, order/[token]/*, team/*, go, capi vėliau). Client salos: checkout wizard, flip, before/after, upload, proof approval.
- **Ištrinti:** `db/`, `drizzle/`, `drizzle.config.ts`, `app/chatgpt-auth.ts`, `examples/d1`, `.vinext/.wrangler/dist`, senas `site-client.tsx`, sprite'ai, `worker/`.
- **Savininko CLI (Mac):** `order:new [--etsy <receipt>] --tier` · `order:pull <id>` · `order:advance <id> <state> --verdict --reasons --file --new-date --note` (viena komanda = įvykis + laiškas + refund jei declined) · `order:publish <id>` · `order:ship <id> --pkg --carrier --tracking` · `order:refund <id> --reason` · `order:delete <id>` (nuotraukos + embedding audit) · `card:new` (ID seka + QR + įrašas + renderiai) · `team:approve <id>` · `team:close <code>` · `capacity:set <n>` · `prices:sync` (spausdina parity lentelę) · `seo:audit` (JSON-LD + draudžiami stringai) · `sitemap:check`. **Admin UI — ne** (kol užsakymų < ~5/d.).
- **Testai (Vitest + GitHub Actions: lint, tsc, tests):** kainų paritetas abiem būsenom; jokio `$` JSX; draudžiami stringai (įsk. identifikatorius); kiekvienas atspausdintas `cardId` iš `etsy/LISTING-STATE.md` resolvina; `makeCardId` unikalumas; unlisted/private ne sitemap'e + noindex header'is; `intents.ts` unikalumas; JSON-LD validacija; flip komponento `border-radius: 0`. Playwright — nuo 2 fazės: `/order/new` → Stripe test → `/order/<token>` → upload → files. Lighthouse biudžetas CI — nuo 3 fazės.
- **Saugumas/ops:** headers + redirects; tokenai 32 B, hash at rest, constant-time; preview deploy apsauga (realūs įrašai); secrets rotacija; backup/export politika (`orders`, registras); domeno auto-renew + registrar lock; error monitoring (`error.tsx` + Vercel logs).
- **Prieinamumas (WCAG 2.2 AA):** focus-visible, reduced-motion, klaviatūra + SR flip'ui, kontrastas ≥4.85:1 ant arena, tikri `alt`, tap ≥24 px, muted video tekstas DOM'e, pareiškimas `/accessibility`.
- **Performance:** viena šriftų pora per maršrutą (finišų — tik `/c`, `/styles`); 2000×2000 → AVIF/WebP; flip lazy su poster; `/c` biudžetas.

---

## 11. STATYMO EILĖ (fazės, savaitės, išėjimo kriterijai)

### F0 — Gyvos svetainės skubi pagalba + vamzdynas (Sep 7–10, ~2–3 d.)
*Tik tai, kas kraujuoja ir kas persikels į naują svetainę.* Vercel env (brand, support email, `SITE_URL=www`) → redeploy (Hobby lieka iki F2) · commit'inti registrą + 4 QR PNG; Orders 01–03 unlisted; PII minimizacija; `noindex` ne-demo; `generateStaticParams`; `curl` visiems ID · `/c` duomenų klaidos (stats[], „#“, FIRST EDITION, „Registered · date“, sidabrinis skydas, `FictionalLabel`) · `lib/catalog/prices.ts` + parity Vitest → senos kainos/add-on'ai/$699/PDF/16 pt/3–5 lauk, chip'ai pažodžiui · `/go/etsy` + `/etsy` + `outbound_clicks` · `sitemap.ts`/`robots.ts`/canonical/headers/Organization JSON-LD · GSC/Bing/Pinterest/Meta verifikacijos; Vercel WA + Speed Insights; UptimeRobot · TEMPLATE etiketės lauk; imprint footer'yje ir `/terms`; COPPA sakinys; registro pažadas; `/contact`; `/privacy/biometric` **tekstas** + biometrinio sutikimo eilutė į Etsy instrukcijas · `content/blocks/*.md` · Resend domenas SPF/DKIM/DMARC · negyvo karkaso trynimas · CI. **Savininkas:** sale atnaujinimo data (09-24), `hello@` (09-23), Offsite Ads OUT, Stripe paskyra (LT subjektas, USD sąskaita?), teisininkas su scope (§9.5 master + BIPA/CUBI/WA + GDPR 9 + COPPA + AI Act 50 + terms + registro pažadas), QPMN DDP laiškas, Etsy 15 min redagavimai (SN dropdown, FBALL→FTB, 30×40 slėpti, „rounded corners“, About „before any art is made“), softball/wrestling publikavimas, GDE75 su sutikimo eilute, IG bio, **Priedo A interviu + imprint duomenys + vardas/nuotrauka**.
**Išėjimas:** kiekvienas atspausdintas ID → 200 su statistika prod'e; 0 draudžiamų stringų; kiekviena kaina ≥ Etsy abiem būsenom; sitemap GSC; `/go` klikai matomi Etsy per savaitę; CI žalias.

### F1 — Nauja svetainė be checkout: dizaino sistema, registras kaip produktas, šeimos, pasitikėjimo puslapiai, teisė (Sep 11 – Oct 4, ~3.5 sav.)
Tokenai + Anton/Space Grotesk shell + header/footer + komponentai (Pill, DeliveryChips, TierCard, EditionPanel, TrustLine, ConsentRow, FictionalLabel, BracketFrame, CapacityNote, FourFears) + brand SVG iš Figma 65:3/63:3 · `/c` perstatymas (§4.13) + `card:new` + `visibility`/`channel` + demo turtas (`print-sources/output` + `card-flip/out` per sharp; Nia Brooks regeneruota su auditu) · `/registry` · `/` (§4.1) · `/trading-cards`, `/posters`, `/complete-set` (**CTA = „Order on Etsy“ per `/go` iki checkout; jokio „opening soon“**) · `/how-it-works`, `/guarantee`, `/photo-guide`, `/about`, `/faq`, `/contact` · minimalus `/senior-night` su skaičiuokle (**iki ~Sep 27**) · `/privacy`, `/privacy/biometric`, `/terms` perrašymas → teisininkas · per-maršruto OG; BreadcrumbList; Vitest pilnas; a11y baseline; `/c` performance biudžetas.
**Išėjimas:** nuskenavus bet kurią kortelę — tiksli kortelė, flip, stats, leidimas, data; realūs klientai unlisted+noindex; naujas Etsy užsakymas → registruota kortelė < 5 min (`card:new`); legal be TEMPLATE, teisininko rankose; `/senior-night` gyvas; Lighthouse SEO ≥ 95 core puslapiuose.

### F2 — Tiesioginis checkout, užsakymo puslapis, pristatymas, komandos v1, sezoniniai (Oct 5 – Nov 6, ~4.5 sav.)
**Teisininko parašas = vartai `/order/new` viešinimui.** Vercel Pro ($20) + Cloudflare R2 bucket + Supabase keepalive cron · `/order/new` 4 žingsniai (§4.14) + Stripe Checkout + Tax + webhook + `orders` + token + įšaldytos datos + provisional `cardId` · `/order/[token]` (§4.15: upload pirma, timeline, proof approval puslapyje, plate el. paštu, shipments, card link, privatumo kelias) + `/order/[token]/files` + `/order/recover` · `lib/capacity.ts` (`weeklyCap=null`; datos = chip'ai nuo apmokėjimo) · CLI: `order:new/pull/advance/publish/ship/refund/delete`, `capacity:set` · Resend 10 šablonų + priminimai + slip · retencijos cron (30 d. nuotraukos / 12 mėn. menas / embedding audit) · **komandos v1**: `/teams` forma + el. pašto verifikacija + `teams` + `team:approve` + `/t/[code]` + `/t/[code]/manage` lite (share kit, roster vardai+būsenos, deadline) · CTA perjungimas į `/order/new` (Etsy — outline) · S19 auditas (`channel=demo-etsy`) · `/senior-night/[sport]` ×4 iki Oct 15 · `/christmas-gift` iki Oct 20 · savaitinė atribucijos lentelė; `report.py` · Playwright checkout smoke.
**Išėjimas:** realus užsakymas apmokėtas Stripe, nuotraukos įkeltos puslapyje, foto patikra ir proof patvirtinti per puslapį/el. paštą, failai per `/files` (be Drive/WeTransfer); Etsy užsakymas per tą patį `/files`; < 10 min nuo Etsy receipt iki nuorodos; savininko admin ≤ 10 min/užsakymą (be meno); viena komandos nuoroda sukurta ir ≥1 tėvas per ją užsakė; 0 pažadų greičiau nei chip'ai.

### F3 — Šakos, finišai, turinys, atsiliepimų infrastruktūra, poliravimas (Nov 9 – Dec 18, part-time, ~3 sav.)
`/sports` (17) + `/sports/[sport]` ×8 · `/styles/[finish]` ×6 · `/senior-night/[sport]` likę 5 iki Dec 1 · 17 sporto vaizdų regeneravimas iš V3 eksportų su auditu · blogas (MDX; trust postai 1–3; sezoniniai pagal GSC) · `reviews` + kvietimas po pristatymo su sutikimais; pirmos tikros citatos (be schema iki ≥5); „In the wild“ su sutikimu · `/accessibility` + Lighthouse biudžetas CI · plate patvirtinimas puslapyje **tik jei** > ~5 užs./d. · Pinterest `link_mode` į svetainę · komandų „ask us“ funkcijos (invoice/grouped/reveal/galerija) — tik jei antra komanda paprašė.
**Išėjimas:** core CWV žali mobile; GSC ≥ 60 URL ir pirmos ne-brando impresijos senior-night/Christmas; ≥ 6 postai; ≥ 20 % `/go` + `/order/new` sesijų iš organic/Pinterest; ≥ 3 tikri atsiliepimai su sutikimu.

### F4 — Vartai (Jan–Mar 2027 arba anksčiau tik per §8 vartus)
Pixel + CAPI + consent (ne `/c`, `/order`, `/t`) · `/lp/[slug]` be A/B iki $1k/mėn · `EtsyClick` + `Purchase` (Stripe) · Figma merge automatizacija **prieš** keliant `weeklyCap` · registras → Supabase kai > ~50 realių; `/a/[athleteId]`; `/registry` indeksas · Stripe Invoicing klubams / grouped shipping — jei prašo · framed/banner tik su tiekėjo testu ir layout'u · ketvirčio brando/pariteto auditas.
**Išėjimas:** ROAS ≥ 3:1 po mokesčių ant ≥ $84.99; `weeklyCap` keliamas tik po išmatuotos merge automatizacijos; DB migracija be nė vieno sulūžusio QR.

**Iš viso:** ~13–14 savaičių iki pilnai veikiančios naujos svetainės su checkout, komandomis, registru ir turiniu (Sep 7 → Dec 18). Kritinis kelias: **teisininkas** (F1 pabaiga) ir **tavo sprendimai §12**.

---

## 12. SAVININKO SPRENDIMAI — atsakyk prieš man pradedant (rekomendacija skliaustuose)

> **Gauti atsakymai 2026-09-06:** #1 — kaina rodoma kaip Etsy (bazinė perbraukta + sale), abi +10 % (D2 ✅); #3 — limito nėra (D5 ✅); #5 — **John Birch**, nuotrauka iš Etsy (D10 ✅); #9 — Stripe tinka, pasidarysim ✅; **„su visu kitu sutinku“** → #2, #4, #8, #10–#20, #22, #24–#26 = rekomendacijos priimtos ✅. Priedas A — gautas istorijos stuburas (§4.10).
> **Dar reikia:** **#6 imprint** (juridinis asmuo, kodas, PVM, adresas, atsakingas asmuo — privaloma footer'iui/terms), **#7 teisininkas** (kas/kada — vartai `/order/new`), **#1 sale atnaujinimo data ir %** (09-24), **#21 FB Page ID + kanoninis handle**, **#9 Stripe subjektas/valiuta** (kai darysite), **hostingas** — patvirtinti D25 (Hobby → Pro nuo F2; Supabase Free + R2).


1. Kainos taisyklė ×1.10 → .99: **taip/ne**; po sale pabaigos — **(a) bazė×1.10** ar (b) lubos=bazė? Ar atnaujinsi −30 % sale iki 09-24 ir kokiu %? *(taip; a; atnaujinti tuo pačiu %)*
2. Etsy kainą rodyti svetainėje? *(ne — vienas neutralus „Also on Etsy →“)*
3. `weeklyCap` skaičius: 1 / 2 / 3 / 5? Tavo realus laikas per užsakymą: ~22 val. (paskutinis) ar ~10 min? Komandos iš to paties limito? *(2; iš to paties)*
4. Mokėjimas pirma + automatinis refund nepraėjus foto patikrai **ar** užklausa → patikra → Stripe nuoroda? *(mokėjimas pirma; Etsy About → „before any art is made“)*
5. Įkūrėjo vardas + tikra nuotrauka + miestas `/about`, home ir bloge? Iki kada? *(taip)*
6. Imprint: juridinis asmuo ir forma, įmonės kodas, PVM statusas/nr., adresas, atsakingas asmuo — **iki F0 pabaigos**.
7. Teisininkas: kas, biudžetas (€), data. Scope: BIPA/CUBI/WA + GDPR 9 str. + COPPA + EU AI Act 50 + terms punktai + registro ≥5 m. pažadas + logo taisyklė. *(privaloma prieš `/order/new`)*
8. Geografija v1: tik JAV (digital ir physical)? *(taip)* Jei digital worldwide — ES OSS registracija?
9. Stripe: kuris subjektas, atsiskaitymo valiuta (USD sąskaita vs EUR su ~2 % FX), Stripe Tax on be JAV registracijų? *(LT subjektas; USD sąskaita jei įmanoma; taip)*
10. Retencija: nuotraukos 30 d. po pristatymo, menas 12 mėn., embedding'ai užsidarius, registras ≥5 m., ištrynimas per 30 d.? *(taip)*
11. Demo QR ant Etsy listingų nuotraukų: (a) `channel=demo-etsy` → tik Etsy CTA, ar (b) pereksportuoti skaidres 02/16/17 be QR? *(a)*
12. Komandos: ta pati kaina *(taip)*; grouped shipping koučui — launch ar vėliau *(vėliau, „ask us“)*; club invoice — launch ar vėliau *(vėliau)*; koučas mato vardus *(tik vardą)*; galerija su per-globėjo opt-in *(vėliau)*.
13. Atsiliepimai: rodyti GDE75 draugų atsiliepimus? *(tik su „friends-and-family launch order“ disclosure, niekada į schema)*; kas ir kada patikrina Etsy sąlygas dėl citavimo; patvirtinti sutikimo eilutę ir atskirą nuotraukų prašymą.
14. „The last order, by the numbers“ plytelė? *(ne — „about fifty frames, four ship“ sakinys)*
15. „Never used for AI training“: kas patikrina Vertex data-use sąlygas ir kad consumer `GEMINI_API_KEY` niekada nėra kliento kelyje; iki tol pill'as išjungtas *(taip)*.
16. Sealed Foil Pack svetainėje nuo starto? Reikia (a) count-neutral Figma (data?) ir (b) QPMN DDP atsakymo *(slėpti, kol abu nebus)*. 30×40 XL — slėpti *(taip)*. Rush — ne *(taip)*.
17. Įsipareigojimai: „1 business day“ atsakymas `/contact` ir „photo check within 1 business day“ — laikysi? *(jei ne — sakinių nėra)*
18. URL: `/sports/[sport]` tik 8 gyvoms *(taip)*; `/christmas-gift` atskiras minimalus puslapis ar sekcija `/senior-night`? *(atskiras minimalus)*
19. Fonai: šviesus stock rinkodarai/formoms/legal/order, tamsus `#080C12` `/c`, `/styles`, flip *(taip)*. Home H1 = hook'as, SEO frazė paantraštėje *(taip)*.
20. Edition panelis: „Registered · <data>“ *(taip)*.
21. Kanoninis social handle (`gamedayedition` vs `editiongameday`) ir tikras Facebook Page ID (61594076368136 vs 1231779406693811)?
22. Balsas: „we“ + pirmo asmens įkūrėjo pastaba; Etsy blokai suvienodinami prie kito redagavimo *(taip)*.
23. **Priedo A interviu** — atsakysi raštu iki (data)?
24. Stripe checkout 2 fazėje su teisininku kaip vieninteliais kietais vartais (vietoj master plano 5 fazės) *(taip)*.
25. Bay kartonas: įvardyti tikslų stock/svorį ar palikti „professional photo card stock“? *(palikti, kol Bay nepatvirtins)*
26. Sporto vaizdų regeneravimas (17, S18 auditas) — F1 ar F3? *(F3; F1 naudoja `marketing/cards` 15 + 2 minimaliai)*

---

## 13. RIZIKOS (santrauka; pilna — master planas §13)
Etsy off-platform (kaina < Etsy net dieną, kuponas, pre-purchase URL) → skaičiuotos kainos + CI + jokių kuponų + D26 · Pajėgumas (~22 val./užs.) → `weeklyCap` = tavo skaičius, įšaldytos datos, slip politika, be reklamos iki merge automatizacijos · Biometrija/nepilnamečiai/GDPR/COPPA/AI Act → sutikimai, `/privacy/biometric`, embedding naikinimas, unlisted default, jokio pikselio, teisininkas prieš `/order` · Chargeback'ai naujoje Stripe paskyroje → auto-refund per 1 d.d., skaidrus copy, Radar · Fake proof pagunda → blokas nerenderinamas iki tikro, `FictionalLabel`, CI · Ploni puslapiai → 8 šakos, ≤6 finišai, be matricų · Spalio pikas webe praleistas → hub'as tarnauja pinams/Reddit/FB ir sausio aidui · HK muitai → QPMN atsakymas prieš pakelį · Count-bearing menas → hash denylist · Supabase/Vercel tier'ai → Pro; `/c` statinis · Komandų nuorodų piktnaudžiavimas → 8 simb. kodai, auto-close, tik vardai · Įkūrėjo anonimiškumas → imprint neša · Stripe Tax/OSS → tik JAV v1 · Registro ≥5 m. pažadas → domeno lock + fallback `/terms`.

---

## 14. Kas iš master plano lieka / keičiasi
**Lieka:** S2 (Etsy→web tik po pirkimo), S3 mechanizmas (`prices.ts` + CI; keičiasi tik formulė), S4 (statinis registras), S5 (PII), S6 (patvirtinimai pagal apimtį), S8 (matavimas etapais), S9–S13, S15–S20, §7 raktažodžių žemėlapis ir kalendorius, §8 reklamos vartai, §9.5 teisinis scope, Priedas B greiti laimėjimai, Priedas D Etsy priklausomybės.
**Keičiasi:** S1 (svetainė **parduoda**), S7 (nauja checkout forma vietoj išjungtos), Stripe iš 5 → **2 fazės**, komandos v1 → **2 fazė**, 0 fazė = skubi pagalba (ne investicija į seną puslapį), `/` perstatymas → **1 fazė** (nauja svetainė), kaina = **Etsy +10 %** (ne paritetas).

---

## PRIEDAS A — Įkūrėjo interviu (10 klausimų istorijai; atsakyk raštu, 2–5 sakiniai kiekvienam)
1. Kada ir kaip kilo mintis — koks buvo momentas su nuotraukomis telefone? 2. Pirmas atletas, kuriam padarei kortelę — kas, kokia šaka, kas nutiko, kai pamatė? 3. Kodėl kortelės, o ne tik plakatas? Ką kortelė daro rankoje, ko ekranas nedaro? 4. Kodėl registras ir QR — ką nori, kad vaikas jaustų po 5 metų? 5. Kodėl atsisakai imties — papasakok vieną atvejį, kai nusprendei „tai nesiųs“. 6. Kur yra studija (miestas), kas tu (vardas, ką darei prieš tai), kiek jūsų? 7. Ką pažadi tėvui apie vaiko nuotraukas — savais žodžiais. 8. Kam tai skirta labiausiai (senior night? seneliams? treneriams?) — viena scena. 9. Ko šis produktas **nėra** (šablonas, filtras, „AI generatorius“) — kaip tai pasakytum mamai. 10. Vienas sakinys, kurį norėtum matyti ant sienos po plakatu.

## PRIEDAS B — Turto žemėlapis (kas jau yra ir kur naudojama)
`etsy/listing-images/01-<sport>-card/`, `02-<sport>-poster/`, `03-senior-night/`, `04-complete-set/` (20 skaidrių = produktų sekcijos) · `marketing/cards/<sport>-front|back.png` (15 šakų) · `card-flip/out/GDE_<CODE>_CardFlip_*.mp4|gif` (per finišą + SR per šaką) · `art-pipeline/out/etsy-shots/packages/` (`_<sport>/{digital,twelve,two4,pack}.png`, `hero05-<sport>.png`, `p-room-<FIN>.png`) · `print-sources/output/<finish>/` (front/back 816×1110) · `exports/brand/GDE-etsy-shop-icon-1000x1000.png`, `etsy/video/trial/gde-wordmark.png`, `gde-shield-4x.png` (SVG — iš Figma 65:3/63:3) · `public/images/photo-guide.webp` · `docs/ETSY-COPY.md` (About, tagline, hook'ai) · `etsy/SEO/LISTING-COPY-PACK.md` (blokai, deliverables, OUR PROMISE) · `etsy/listing-videos/` (38) · `art-pipeline/out/athletes/<slug>/` (before nuotraukos, plokštelės, gate JSON — tik fiktyviems, audituotiems). **Nenaudoti:** `public/images/sport-examples/*` (sprite'ai), Nia Brooks eksportai, count-bearing pakelio/sertifikato menas, SN/CA wallpaper'iai be safe zonų.

## Metodas ir šaltiniai
Workflow `wf_da060d52-6be` (4 spec'ai, 3 teisėjai, kritikas; 8 agentai, ~2 M tokenų) ant `docs/SITE-MASTER-PLAN-2026-09.md` audito. Teisėjų balai: Trust 24/30 · Conversion 22.5 · Brand 22 · SEO 21 — sintezė = Trust stuburas + Conversion srautai + Brand sistema/istorija + SEO struktūra, suderinta su kritiko 23 spragom, 13 taisyklių konfliktų, 13 sąžiningumo/teisės punktų, 10 overbuilt ir 12 greitų laimėjimų.
