# Senior Night SET listingai — planas (2026-09-03)

Skaityti prieš statant. Fiksuoja savininko 2026-09-03 sprendimą: **Senior Night parduodamas
kaip SETAI su 4 fiziniais paketais — vienas bendras (any sport, jau gyvas) + po vieną
prioritetiniams sportams.** Card-only (03b) ir poster-only (03c) **parkuojami** — jų nėra nei
copy pack'e, nei SKU registre, o kortelių listingai jau rodo, kad geriausiai veikia
„Printed or Digital" su paketų matrica.

---

## 0 · Ką šis planas fiksuoja (kad nebūtų perginčijama)

| Sprendimas | Šaltinis |
|---|---|
| SN = **setai**, ne card/poster. 03b/03c → `ZZ PARKED`, JSON'ai lieka kaip istorija | savininkas 2026-09-03 |
| **4 paketai**, kaip gyvame SN Set 4564565764: Digital Complete Set 49.99 · Printed Set 109.99 · Deluxe Set 135.99 · Ultimate Set 199.99; processing 1–2 d / 5–7 d / 5–7 d / 2–3 sav.; SKU `GDE-<SPORT>-SNSET-{DIG,PRINT,DLX,ULT}` | `docs/ETSY-LISTINGS.md:611`, gyvas listingas |
| Paketų turinys: DIG = 28 failų + registry; PRINT = 12 kortelių + 18×24 + sertifikatas + visi failai; DLX = 24 kortelės + 24×36 + sert.; ULT = DLX + **18 kortelių foil pakelis (4 foil + 14)**, siunčiamas trimis siuntomis | `docs/ETSY-LISTINGS.md:300-302, 499-503` |
| **Vienas stilius — SR.** Jokio stilių dropdown'o | `CLAUDE.md:177`, `etsy/SEO/README.md §7` |
| Menas **per sportą**, stilius bendras. Vienas sportas per listingą (sportas = paieškos ašis) — išskyrus any-sport masterį, kur sportas yra picker'is | `docs/ETSY-COPY.md:181-192` |
| Eilė: any-sport (gyvas, refresh) → **Volleyball #1** → Football → Soccer → Cheer → Basketball ~lapkr. 20 | savininko lentelė 2026-09-03, `LISTING-COPY-PACK.md A1–A5, D1` |
| Gerosios praktikos etalonas = **01 · CARD LISTING** (sekcija per sportą, 20 skaidrių, 02 paketų matrica, 03 „everything you get", 11 „how to order — digital or printed") | Figma `636:170` |

---

## 1 · Kas jau yra — pasirengimo matrica

| Sportas | SR poster + card F/B (sekc. 01) | SR sekcijos 02–05 (print, social, wallpapers, bonus) | SR fonas | Identity + before nuotraukos | Registry įrašas | Package tile'ai (kortelių listingui) |
|---|---|---|---|---|---|---|
| Football (Tui #54) | ✅ | ✅ | ✅ | ✅ | ✅ `GDE-SR-FTB-2026-54` | ✅ `packages/_football` |
| Basketball (Marcus #12) | ✅ | ✅ | ✅ | ✅ | ✅ `GDE-SR-BKB-2026-12` | ✅ |
| Volleyball (Jaslene #5) | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ `_volleyball` |
| Soccer (Mateo #10) | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ `_soccer` |
| Cheerleading (Amara) | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ `_cheerleading` |

Ką tai reiškia: **football gali eiti dabar be jokios meno skolos**; volleyball/soccer/cheer
prieš savo listingą reikalauja `docs/FINISH-COMPLETION-PLAYBOOK.md` praėjimo (sekcijos 02–05
SR puslapyje) — kitaip „everything you get" ir paketų skaidrės rodytų svetimą sportą.

Bendri ištekliai, kurie jau padaryti šiame 03 puslapyje ir klonuojami į visas sekcijas:
gift-handover (`gift-composited`), four seniors (`celebration-composited`), case, binder,
poster-on-wall, card-on-desk, phone-in-hand, desk-monitor, good-photo × 4, `fit_plates.py`
(kvadratai matuojami, ne skaitomi akimis), `plates_composite.py`.

---

## 2 · Naujoji 20 — SN SET masteris (any sport, football herojus)

Seto pirkėjo klausimas kitas nei kortelės ar plakato: **„kas yra dėžėje, skaitmeninis ar
spausdintas, kuris paketas yra dovana"** + senior night emocija. Todėl 03–04 ir 11 perkerpamos
paketo sprendimui (kaip plakato plane), o emocinės skaidrės lieka. Dabartinis 03 puslapis
parduoda **$99 skaitmeninį** setą („28 FILES", „DIGITAL PRODUCT") — gyvas listingas yra
**fizinis, 4 paketai**. Tai pirmas tiesos klausimas.

| # | Skaidrė | Iš kur | Kas keičiasi |
|---|---|---|---|
| 01 | HERO — poster + kortelės | lieka | piliulės → `PRINTED OR DIGITAL · POSTER + CARDS · CLASS OF 2026` |
| 02 | ONE LAST HOME GAME (dovanojimas) | lieka | — (tai senior night kablys, kortelių eilė tokio neturi) |
| 03 | **CHOOSE YOUR PACKAGE** | **nauja** — klonas kortelių 02 matricos | 4 stulpeliai su tikromis nuotraukomis: `tile-digital` (failai ekrane) · Printed Set (12 kortelių + 18×24 tūboje) · Deluxe (24 + 24×36) · Ultimate (+ sealed pack). Eilutės: poster / cards / certificate / registry+QR / wallpapers+social / free US shipping / sealed wrapper / ready in. Badge „MOST GIFTED" ant Printed Set. Tile'ai — `packages/pkg-*.json` receptas su SR menu |
| 04 | **EVERYTHING YOU GET + the print** | perdaryta dabartinė SN-03 | per paketą, ne „28 failai": poster kaip daiktas (tūba), kortelių stirta, sertifikatas, pakelis, telefonas su registry puslapiu. Oranžinė juosta: `28 FILES · PRINTS SHIP FREE · 1 LIVE REGISTRY PAGE`. Social/wallpaper faktai iš buvusios SCREENS eina čia į sąrašą |
| 05 | FOUR SENIORS. ONE LAST SEASON | lieka | — |
| 06 | EVERY SENIOR. EVERY SPORT (17 sportų picker'is) | lieka **tik masteryje** | per-sportinėse sekcijose keičiama į „THEIR FIELD, THEIR NIGHT" (žr. §3) |
| 07 | EVERY DETAIL IS YOURS | lieka | — |
| 08 | THEIR SEASON, IN THEIR OWN WORDS (citata) | lieka (perdaryta 09-03) | — |
| 09 | ONE SENIOR. ONE EDITION (dėklas) | lieka | — |
| 10 | NUMBERED. REGISTERED. VERIFIABLE | lieka | QR → `GDE-SR-FTB-2026-54` |
| 11 | **HOW TO ORDER — DIGITAL OR PRINTED** | **nauja** — klonas kortelių 11 | juosta `DIGITAL IN 1–2 DAYS · PRINTED SETS SHIP IN 5–7 · SEALED PACK 2–3 WEEKS`; chip „ULTIMATE SHIPS IN THREE TRACKED PACKAGES" |
| 12 | YOUR PHOTOS → THEIR EDITION | lieka | — |
| 13 | BUILT AROUND THEIR REAL LOOK | lieka | + atmestas kadras (kaip plakato plane) |
| 14 | THEIR UNIFORM, THEIR NUMBER | lieka | — |
| 15 | THE PHOTOS THAT WORK BEST | lieka | — |
| 16 | YOU APPROVE IT BEFORE IT'S FINAL | lieka | + refund juosta |
| 17 | READY BEFORE THE NIGHT (timing) | **perrašyta** | dabar sako „order 5–7 days before" — spausdintam setui tai **melas**. Trys eilutės: Digital — 5–7 d. prieš · Printed/Deluxe — 2 sav. prieš · Ultimate — 3–4 sav. prieš |
| 18 | TWO SIZES. READY TO PRINT (poster on wall + card on desk) | lieka | antraštė → `18×24 OR 24×36 — PRINTED FOR YOU, OR THE FILES` |
| 19 | YOUR CLUB'S CREST, NOT LEAGUE TRADEMARKS | lieka | — |
| 20 | CROSS-SELL | lieka | veda į kortelių ir plakatų evergreen listingus + kitus SN setus |

**Išmesta (2), kad liktų 20:** `IT'S A FILE, PRINT AS MANY AS YOU LIKE` (segtuvas) — su
spausdintais paketais argumentas prieštarauja pačiam listingui; jo nuotrauka tampa DIGITAL
tile'u 03-ioje. `IT GOES ON THE WALL AND ON EVERY SCREEN` — abu faktai eina į 03 eilutę ir 04
sąrašą; telefono/monitoriaus nuotraukos lieka kaip 04 daiktai.

---

## 3 · Per-sportinė sekcija — kas keičiasi, kas bendra

**Būsena 2026-09-03: FOOTBALL sekcija pastatyta** (`936:129`, 20 skaidrių, auditorius 0 klaidų),
JSON `etsy/listings/03d-football-senior-night-set.json` su savais SKU `GDE-FTB-SNSET-*`.
Pakeista prieš masterį: **01** antraštė „CUSTOM FOOTBALL SENIOR NIGHT SET"; **02** dovanojimas
perkeltas iš salės **ant aikštės naktį** (`gen-sr-sport-scenes.ts --only gift-football`, Tui +
mama, rėmas = plokštelė); **06** „EVERY SENIOR. EVERY SPORT." → **`SN-06-TEAM`** „ONE SET PER
SENIOR." su komandos užsakymo nuotrauka; **20** cross-sell veda į kitų sportų SN setus.

**Komandos pasiūlymas** (savininko sprendimas 2026-09-03: „rodom galimybe kad gali pirkti visai
komandai"): scena `team-order` — **krūva iš 6 plakatų** (viršutinis atverstas, penkių matyti balti
popieriaus kraštai), 6 tūbos, 6 kortelių stirtos ir siuntimo dėžė —
generuota VIENĄ kartą ir tinka visiems sportams; keičiasi tik plakatas ir kortelės, o tai yra
kompozitas (`lib/sr_sport_scenes.py`), ne generacija. ⚠️ **Kadre matyti tik VIENAS plakato veidas.**
Pirmas variantas rodė vieną plakatą prie šešių tūbų (savininkas: „matosi daug tubu bet plakatu tik
vienas"), antras — tris atverstus, bet visi trys būtų gavę tą patį atletą, o komandoje kiekvienas
senjoras savas. Krūva suskaičiuoja šešis plakatus ir nieko nemeluoja. Lakštai po viršutiniu **taip pat nešioja
Senior Night foną** (`paint_stack()`): atspausdinto plakato kraštas yra tamsus su bleed'u, ne
baltas popierius. Piešiama nuo apatinio į viršų, o kaukė **išima viršutinio plakato kvadratą** —
kitaip lakšto menas lieka ant plokštelės, `plates_composite` nebegali ten piešti ir viršutinio
plakato tekstas išeina dvigubas. Ta pati
riba galios kiekvienam sportui, kol turėsime po vieną atletą sporte. ⚠️ Kainodara: aprašas kviečia parašyti
žinutę; Etsy kupono prie vieno listingo neprisegsi (tik order minimum) — **nuolaidų pakopos dar
neapsispręstos**, todėl skaidrėje jokio procento nėra.

**Sporto salė / paviršius:** taisyklė — kiekviena scena, kurioje matyti VIETA, turi būti to sporto
vieta. Football = aikštė po prožektoriais; volleyball/cheer = salė; soccer = pieva. Tai liečia 02
(dovanojimas) ir, jei kada bus, 05 (šventimas).

Kortelių listinge savininko praktika buvo **visos 20 pritaikytos sportui**. Bet SN atveju 8
skaidrės neturi sporto (procesas, taisyklės, timing), ir kanonas sako „consistency across the
shop beats per-listing variation". Todėl:

| Keičiasi per sportą (12) | Bendros su masteriu (8) |
|---|---|
| 01 hero (to sporto SR poster + kortelės) | 05 four seniors (rodo visus 4 — tai ir yra range slide) |
| 02 dovanojimas — **nauja generacija** su to sporto identity plate + black plates (€0.05) | 13 likeness |
| 03 paketų tile'ai — `pkg-*.json` receptas su to sporto SR menu (4 × €0.05) | 15 photo guide |
| 04 everything you get — to sporto poster/cards/cert/pack/phone | 16 approval |
| 06 → **THEIR FIELD, THEIR NIGHT** — to sporto SR poster didelis ant savo paviršiaus (menas yra) | 17 timing |
| 07 personalization callout'ai ant to sporto kortelės | 19 crest policy |
| 08 citata — to sporto card back | 11 how to order |
| 09 dėklas — to sporto card (plate scene ta pati, compositas naujas) | 20 cross-sell (nuoroda į kitus SN setus) |
| 10 registry — **naujas registro įrašas + QR** | |
| 12 photos→final — to atleto before nuotraukos (`athletes/<sport>/before/`) | |
| 14 uniform — to sporto kit plates (yra) | |
| 18 two sizes — poster-on-wall / card-on-desk plate scenos tos pačios, compositas naujas | |

Per sportą: **~6 kompozitai iš esamų plate scenų + 5 generacijos (~€0.30) + 1 registro
įrašas** — jei SR sekcijos 02–05 tam sportui jau yra. Jei nėra (volleyball, soccer, cheer):
**+ playbook'as** (sert., pakelis, proof, 9 social, 7 wallpapers, bonus) — tai didžiausia
eilutė.

Registry: `GDE-SR-SOC-2026-10` (Mateo), `GDE-SR-CHR-2026-01` (Amara — edicijos numeris, kaip
`GDE-PR-CHR-2026-01`), volleyball kodas iš `art-pipeline/sports.ts`, Jaslene #5.

---

## 4 · Eilė, kaina, laikas

**Būsena 2026-09-03:** žingsnis 1 (masteris → SET su 4 paketais) **padarytas** — 20 skaidrių,
auditorius 0 klaidų. Node ID: SN-03-PACKAGE `907:187` (klonas kortelių `641:127`), SN-11-HOW-TO-ORDER
`907:284` (klonas `636:2498`); segtuvas `499:3126` ir SCREENS `499:1985` — `ZZ PARKED` po sekcija.
SR paketų tile'ai: DIGITAL — `art-pipeline/gen-sr-package-shots.ts` (`sr-digital.png`, kortelių listingo
laptop plate scena). PRINTED / DELUXE / ULTIMATE — **`art-pipeline/gen-sr-set-tiles.ts` +
`lib/sr_set_tiles.py`** (`tile-set-{printed,deluxe,ultimate}.png`): seto tile'as rodo plakatą IR korteles
(ir pakelį) — vien kortelių vėduoklė parduoda kortelių listingą, ne setą. Receptas: plate scena → plakatas
įkomponuojamas tiksliai (`plates_composite.py`) → kortelės/pakelis „print image N onto…" → plakato sritis
įklijuojama atgal. Dvi taisyklės, kurios kainavo po vieną kadrą: **niekas negali gulėti ant plakato**
(vėduoklė ant kampo susilieja su plokštele ir tiktis neranda krašto) ir **Ultimate = du edit'ai** (kortelės,
paskui pakelis) — vienas edit'as su abiem dizainais uždėjo pakelio meną ant kortelių krūvelių. ~€0.55 viso. §7 sprendimai priimti pagal numatytuosius:
Ultimate 199.99 (gyva tiesa), per-sportiniai setai atskiri sport-locked listingai, football prieš volleyball
(nulis skolos), cross-sell rodo ir evergreen.

**Gate #1 uždarytas football SR faile:** pakelio veidas `4068:554` „10 COLLECTIBLE CARDS" → „SEALED
COLLECTOR PACK", nugarėlė `4068:562` be skaičiaus, sertifikato sakinys `4068:616` „limited run of 10 cards"
→ „a single numbered edition for this athlete". ⚠️ Tas pats „10" tebėra basketball SR faile ir visuose
šešiuose evergreen finišuose (`print-sources/output/*/…booster-pack…` ir `…certificate…` yra TRACKED PNG) —
sutvarkyti ten pat prieš pirmą Ultimate/pack užsakymą.


| Žingsnis | Ką | Skola prieš tai | Apimtis |
|---|---|---|---|
| **1** | Masteris `03 · Digital SENIOR NIGHT` → SET su 4 paketais (§2) | nieko — football pilnas | 2 naujos + 3 perdarytos skaidrės, 2 išmestos; 4 tile compositai |
| **2** | Sekcija **FOOTBALL** 03 puslapyje | nieko | beveik klonas masterio (herojus jau football) — daugiausia pervadinimas + 06 |
| **3** | Sekcija **VOLLEYBALL** (#1 pagal paklausą, 850) | **playbook 02–05** | playbook + 12 per-sport skaidrių |
| **4** | Sekcija **SOCCER** | playbook 02–05 | tas pats |
| **5** | Sekcija **CHEER** | playbook 02–05 | tas pats |
| **6** | Sekcija **BASKETBALL** (~lapkr. 20) | nieko — sekcijos yra | 12 per-sport skaidrių |

Rekomendacija dėl eilės: 1 ir 2 — iš karto (nulis skolos, football = herojus). Volleyball po
jų, nes jam reikia playbook'o; jo #1 paklausa pateisina tą darbą pirmam iš trijų.

Vienas kartas, ne per sportą: `tile-digital / tile-12 / tile-24 / tile-pack` + `pkg-tube`
plate scenos jau yra `art-pipeline/out/etsy-shots/packages/` — naujos generacijos nereikia,
tik SR meno kompozitas.

---

## 5 · Etsy pusė

- Copy pack A1–A4 tituluose **„Digital Download" → „Printed or Digital"**, kaina ne $69.99, o 4
  variantai kaip gyvame SN Set. Pavadinimų šablonas: `<Sport> Senior Night Gift | Custom
  Poster and Trading Card Set | Printed or Digital` (<14 žodžių, be pasikartojimų — V3 taisyklė).
- Variantų pavadinimai ir processing — kopija iš 4564565764; partneriai Bay + Printful +
  QPMN prisegami po vieną (spąstai `docs/ETSY-LISTINGS.md:618`).
- Personalizacija: sportas **užrakintas** (nėra picker'io), klasė, 4 metų karjera, senior
  quote, senior night data. Stiliaus lauko nėra.
- Aprašo blokai: CHOOSE YOUR PACKAGE + FREE Certificate + OUR PROMISE + SHIPPING, Ultimate
  „ships in three tracked packages". Švelni eilutė „other finishes by message".
- `etsy/listings/03-senior-night.json` perrašomas į fizinį 4-variantų; sukuriami
  `03-volleyball-senior-night-set.json` ir t. t. pagal `01-football-card.json` šabloną.
- Video: SN Set 0/2 slotai — SR-specifinis video lieka skola (`ETSY-V3-ROLLOUT-HANDOFF.md:112`).

---

## 6 · Tiesos gate'ai prieš publikavimą

1. **Count-bearing art**: pakelio veidas sako „10 COLLECTIBLE CARDS", sertifikatas — 10; pakelis
   yra 18. Turi tapti count-neutral **prieš** Ultimate paketą rodant skaidrėje (CLAUDE.md).
2. **Timing skaidrė** per paketą (17) — nepalikti „5–7 days before" ant spausdintų setų.
3. Registry puslapiai `/c/GDE-SR-*` turi atsidaryti gyvai kiekvienam listinge rodomam QR.
4. SR flip video (`STYLE=SR ./render.sh`) — aprašas jį žada.
5. 03b/03c Figma puslapiai pervadinami `ZZ PARKED · …`, kad auditorius jų neskaičiuotų.
6. Po kiekvienos sekcijos — `audit-listing.js` + `audit-readability.py` (0 issues, negyvų
   image hash'ų nėra; atlasas ≤ 4096 px).

---

## 7 · Ko reikia iš savininko prieš startą

1. **Ultimate kaina**: gyvas listingas rodo **$199.99**, `ETSY-LISTINGS.md:503` V3.1 lentelė —
   $175.99. Skaidrėse rašysiu 199.99 (gyva tiesa) — patvirtink.
2. Ar per-sportiniai SN setai eina kaip **atskiri Etsy listingai** (sport-locked, kaip copy
   pack A1–A4), o any-sport lieka bendrinių frazių savininku? (Planas daro taip.)
3. Ar volleyball tikrai prieš football, nors football neturi skolos ir gali būti gyvas rytoj?
4. Cross-sell 20-oje: rodyti ir kortelių/plakatų evergreen listingus, ar tik kitus SN setus?

---

## 8 · Būsena 2026-09-04 — masteris ir FOOTBALL perkirpti į Complete Set V3 seką

Savininko sprendimas: SN setai gauna **tą pačią skaidrių seką ir logiką kaip Complete Set V3** (hero → what you get →
emocija → where it lives → range → package → produkto detalės → every field → how to order → photos → procesas → made
for the moment → counted → sportai). §2 lentelė šiuo atžvilgiu **pasenusi** — galiojantis žemėlapis:
`etsy/SLIDE-NODE-MAP.md` „Senior Night SET" ir `etsy/LISTING-STATE.md` 2026-09-04 blokas. Išmesti: registry, one-of-one,
timing (sulieta į 11 chip'ą), print sizes, story (citata perkelta į 09/07 nugarėlės eilutę), sena 06 sportų eilė
(pakeista CS 05 tinkleliu su 5 SR sportais + „+12 more sports"). Archyvas: sekcija `1138:127`.

Toliau (savininko eilė 2026-09-04): **volleyball → baseball → cheerleading → soccer**. Skola prieš kiekvieną —
§3 lentelė; baseball neturi jokio SR meno (nei plakato, nei kortelės), tad jam pirma reikia SR puslapio baseball
faile (`tL9vfpIhC5esFbXcozgAlT`) pagal basketball etaloną (`fgueg7sV…` puslapis `2304:566`).

## 9 · Būsena 2026-09-04 (vėlai) — visi keturi per-sportiniai setai pastatyti Figmoje

VOLLEYBALL `1161:127`, CHEERLEADING `1168:127`, SOCCER `1168:1140`, BASEBALL `1170:127` — visi 20 skaidrių pagal V3
seką, su SAVO sporto SR sekcijomis 02–05 sporto failuose (§1 skola uždaryta), registro įrašais ir QR. Neeksportuota,
Etsy nepublikuota. JSON: `03e`–`03h`. Kaina: žr. `etsy/LISTING-STATE.md` (generacijos ~€6 keturiems sportams).
Prieš publikavimą: savininko peržiūra + eksportas 20×4 + copy pack'o A1–A4 titulai/žymos.
