# V3 rebuild — darbo planas ir auditoriai (2026-09-01)

**Režimas: TIK Figma.** Jokių `download_assets` eksportų — savininkas eksportuos pats arba
paprašys rytoj. Viskas, kas žemiau, yra failų vidaus taisymas.

## Puslapių struktūra po savininko pertvarkos

| puslapis | id | vaidmuo |
|---|---|---|
| `01 · CARD LISTING` | `636:170` | **darbinis** — fizinis V3. Čia eina visi taisymai ir nauji sportai |
| `01 Dig · Digital CARD LISTING` | `0:1` | **užšaldytas reference** — NELIEČIAMAS |
| `02 · Digital POSTER LISTING` | `2:2` | laukia to paties skėlimo; plakatų darbai po jo |

Nauji sportai (baseball, volleyball, soccer) dedami **tik į `636:170`**. Jų plakatų sekcijos
statomos tada, kai savininkas atskils `02`.

## Užduotys ir eilė

```
1 kampai (23 failai)  →  2 lipdukai (23 failai)  →  3 sekcijos 636:170  →  [eksportas: savininkas]  →  4 Etsy
```

**Kodėl kampai pirmi.** Listingo skaidrės neša kortelę kaip **įkeltą PNG**, ne gyvą nuorodą —
pakeitus kampą sporto faile, skaidrė NEatsinaujina savaime. Todėl kiekvienas kampo taisymas
po sekcijų statybos reikštų antrą įkėlimo ratą į visas skaidres. Kampai baigiami pirmi, kad
rytojaus eksportas būtų vienintelis.

---

## 1. Kampai: apvalūs → statūs

**Ką keisti.** Faile **723 mazgai su `cornerRadius > 0`**, bet kortelės siluetą sudaro tik trys.
Visa kita — vidinis dizainas ir **neliečiama**: `stat` čipai (r22, 129 vnt.), `accent_bar` (r3),
`#card_qr` (r12), `#photo_*` maskės.

| mazgas | dabar | po |
|---|---|---|
| `Card · <finish> — FRONT/BACK` (rėmelis) | r30 | 0 |
| `card_border` | r20 | 0 |
| `card_border_inner` | r12 | 0 |

× 2 × 6 finišų × 23 failai. **Niekada „visiems radius = 0"** — tai sunaikintų stat čipus ir QR.

**Kodas (ne Figma, bet daroma kartu, kad nepamirščiau):**
- `lib/card_in_hand.py` → `die_mask(radius_frac=0.036)` → `0`. **Neužtenka:** esamos „laiko juodą
  plokštelę" nuotraukos turi APVALIĄ plokštelę, o kaukė yra `plate_mask ∩ die` — kampuose
  plokštelės tiesiog nėra, tad kortelė liks apvali. Kaukę imti iš **keturkampio minus tikri
  užstojimai**, ne iš plokštelės kampų.
- `gen-etsy-shots.ts`, `gen-etsy-sport-shots.ts` — 6 promptai sako „rounded corners" → „sharp
  square corners", kad naujos plokštelės gimtų teisingos.

**A1 `corner-audit`** (naujas, 1 `use_figma` kvietimas failui) — grąžina DU skaičius:
> `Card · * — FRONT|BACK`, `card_border`, `card_border_inner` su r ≠ 0 → **liko apvalių**.
> `stat` / `accent_bar` / `#card_qr` su r == 0 → **per daug nuimta**.
> Abu turi būti 0. Vieno skaičiaus neužtenka — būtent „per daug nuimta" yra tylus brokas.

---

## 2. Lipdukai (baseball patvirtinta; tikrinti visus 23)

`GDE_PR_Sticker_NameNumber_PNG`, baseball — trys defektai viename kadre:

- **„WHITLOCK" lenda po numerio rombu**, „K" nukirsta. Fitteris nesumažino šrifto, nors
  taisyklė yra: *vardas netrumpinamas, mažėja šriftas*.
- **Rombas oranžinis** — atrodo kaip `brand/accent #FF6B2B`, kuris pagal CLAUDE.md priklauso
  TIK svetainei ir išorinei dėžei, **ne menui**. Turi būti `team/primary`.
- Lipduko siluetas yra finišo savybė — patikrinti, ar baseball nepaveldėjo svetimo.

**A3 `sticker-fit`** (naujas): vardo teksto `absoluteBoundingBox` prieš numerio rombo dėžę —
persidengimas > 0 px = KLAIDA. Rombo `fills` turi būti **surištas su kintamuoju**, ne literalas
(literalas nutraukia ryšį — jau degėme ties Style režimais).

---

## 3. Sekcijos `636:170` — nauji sportai

Menas baseball jau diske (6 finišų kortelės, 6 plakatai, kortelė rankoje) — **bet po kampų
taisymo jis pasensta**, todėl sekcijos pildomos vaizdais tik po rytojaus eksporto. Šiandien
Figmoje daroma tai, kam vaizdų nereikia: klonas + **visas tekstas**.

Klonas iš `636:2614` (CHEERLEADING): 836 mazgai, 224 tekstai, 67 vaizdai.

**A7 `section-audit`** (naujas, po kiekvieno klono): sekcijoje negali likti nė vieno donoro
vaizdo hash'o ir nė vieno donoro žodžio (`AMARA`, `VALE PREP`, `FLYER`, `CHEER`, `PRISM`).
Grąžina likučius su mazgų ID. Tai vienintelis būdas pagauti „klonas atrodo teisingai, bet trys
skaidrės liko svetimos".

**A8 `template-audit`** (jau veikia, `docs/FIGMA-FILES.md`): prieš klonuojant — sporto failas
mini vieną atletą, bonus iškarpa == kortelės vaizdas, nulis etalono hash'ų.

---

## 4. Listingų turinys: „vien digital" → V3

Kanonas `docs/ETSY-LISTINGS.md`, eilė `docs/ETSY-V3-ROLLOUT-HANDOFF.md`.

Nuotraukų spraga: visos 20 skaidrių pasakoja skaitmeninę istoriją.
- **02 pozicija — paketų palyginimo skaidrė** (3–4 stulpeliai, kas viduje, BE kainų).
- **Hero badge**: kortelėms `PRINTED + SHIPPED · FREE CERTIFICATE`, plakatams
  `PRINTED + SHIPPED · 3 SIZES`. Hero pats neperdaromas.
- **18 · Digital delivery skaidrė dabar MELUOJA** („nothing ships") — perdaryti į siuntimą.
- Sertifikatas į „Everything you get".

**A5 `copy-audit`**: jokiame fiziniame listinge negali likti `instant download`,
`no physical item`, `DIGITAL DELIVERY ONLY`, `nothing ships`. Tikrinti **skaidrių TEKSTUS
Figmoje**, ne tik Etsy aprašą — tekstas ant paveikslo neišgrepinamas ir todėl praslysta.

**A6 pirkėjo akimis** (rankinis): „from" kaina, dropdown, processing prie pack varianto,
partnerių blokas. Automatika šito nepakeičia.

---

## Ko NEDARYSIU be atskiro patvirtinimo

- Jokių eksportų (savininko nurodymas).
- Neliesiu `01 Dig` puslapio — tai reference.
- Nekeisiu kainų; nejungsiu Worldwide; nepublikuosiu nė vieno listingo.
- Netrinsiu paslėptų V1 rėmelių — tik pasiūlysiu pervadinti į `ZZ OLD`.
- Neliesiu `stat` / `accent_bar` / QR spindulių.

## Kaštai

Generacijų nereikia. Viskas — Figma redagavimas.
