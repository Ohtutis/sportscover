# V3 rollout — perdavimas kitam agentui (2026-09-01)

**BŪSENA 2026-09-01: LISTINGŲ KONVERSIJA BAIGTA — visi 8 gyvi su V3 paketais.**
Liko tik NUOTRAUKŲ užduotis žemiau. Suvedimo detalės ir 4 nauji spąstai (partnerių
checkbox po vieną su pauze; returns policy privaloma, klaida tik antrame publish;
tipo keitimas per kategorijos Change; buyer kainos su EUR→USD konversija) —
ETSY-LISTINGS.md „V3 SUVEDIMO ŽURNALAS".

👉 Kainų/laiptelių kanonas: `docs/ETSY-LISTINGS.md` (V3 + V3.1–V3.3b + suvedimo žurnalas).
👉 Vaizdų kanonas: `etsy/LISTING-IMAGE-CANON.md`. Figma listingų failas: `JcQvsgIRiOQtuZcP3Q8dc9`.
👉 Etsy prisijungęs programos naršyklės panelėje; shipping profilis
„US Print Lab - Free Shipping" JAU SUKURTAS — tik parinkti iš sąrašo.

## Padaryta (etalonas)

**Football Card 4563878038** — pilnai gyvas: Physical, 4 variantai su kainom/SKU/
per-variant processing, profilis, returns 30 d, partneriai Bay+QPMN, aprašas su
CHOOSE YOUR PACKAGE / FREE Certificate / garantija / SHIPPING / Complete Set nuoroda,
title „Custom Football Card | Personalized Player Gift From Your Photos | Printed or
Digital". Visi žingsniai ir spąstai — ETSY-LISTINGS.md „V3 SUVEDIMO ŽURNALAS".

## Eilė ir tikslūs titles (savininko taisyklės: <14 žodžių, BE pasikartojančių žodžių,
galvos frazė nekeičiama)

| Listingas (id iš Shop Manager) | Naujas title | Variantai (≤20 simbolių!) → bazės |
|---|---|---|
| Basketball Card | Custom Basketball Trading Card \| Personalized Athlete Gift From Your Photos \| Printed or Digital | kaip Football: Digital Card Files 41.99 · 12 Printed Cards 69.99 · 24 Printed Cards 98.99 · Sealed Foil Pack 84.99; SKU GDE-BBALL-CARD-{DIG,P12,P24,PACK} |
| Cheerleading Card | Custom Cheerleading Trading Card \| Personalized Cheer Gift From Your Photos \| Printed or Digital | kaip Football; SKU GDE-CHR-CARD-* |
| Football Poster | Custom Football Poster \| Personalized Athlete Wall Art From Photos \| Printed or Digital | Digital Poster Files 41.99 · 18x24 Printed Poster 83.99 · 24x36 Printed Poster 97.99 · 30x40 XL Poster 155.99; processing 1–2 d / 5–7 d ×3; partneris TIK Printful; SKU GDE-FTB-POST-* |
| Basketball Poster | Custom Basketball Poster \| Personalized Athlete Wall Art From Photos \| Printed or Digital | kaip Football Poster; SKU GDE-BBALL-POST-* |
| Cheerleading Poster | Custom Cheerleading Poster \| Personalized Cheer Wall Art From Photos \| Printed or Digital | kaip Football Poster; SKU GDE-CHR-POST-* |
| Complete Set | Custom Sports Poster & Trading Card Set \| Athlete Gift From Photos \| Printed or Digital | Digital Complete Set 49.99 · Printed Set 109.99 · Deluxe Set 135.99 · Ultimate Set 199.99 (V3.1 + V3.3 bump — NE senoji V3 lentelė); processing 1–2 d / 5–7 d / 5–7 d / 2–3 sav.; partneriai Bay+Printful+QPMN; SKU GDE-SET-* |
| Senior Night Set | Senior Night Gift \| Custom Athlete Poster & Trading Card Set \| Printed or Digital | kaip Complete Set; SKU GDE-SNSET-* |

Aprašų blokai — adaptuoti Football Card versiją (sportas/produktas keičiasi; posteriuose
vietoj per-card palyginimo: „printed on premium matte, shipped free with tracking");
setų Ultimate su „ships in three tracked packages (cards ~1 wk, poster ~1.5 wk, sealed
pack ~3 wks)".

## NUOTRAUKŲ užduotis (kiekvienam iš 8, įskaitant Football)

1. **02 pozicijoje — paketų palyginimo skaidrė**: 3–4 paketai stulpeliais, kas viduje,
   be kainų (kainos keičiasi su sale — skaidrė ne). Statoma Figma listingų faile pagal
   esamų skaidrių tinklelį (žr. LISTING-IMAGE-CANON.md safe zones; tekstas ≥44 px).
2. **Hero badge** papildyti: kortelėms „PRINTED + SHIPPED · FREE CERTIFICATE", plakatams
   „PRINTED + SHIPPED · 3 SIZES". Hero pertvarkyti NEREIKIA — tik badge eilutė.
3. Sertifikato vaizdą įtraukti į „Everything you get" skaidrę, jei jos dar nėra kadre
   (asset: print-sources/output/<finišas>/GDE-*-certificate-*.png).
4. Įkėlimas per panelę neveikia (nėra file picker) — nuotraukas įkelia SAVININKAS,
   agentas paruošia failus `etsy/listing-images/<listingas>/v3/` ir pasako tvarką.

## Griežtos taisyklės

- Kainų NEkeisti nuo lentelės be savininko. Worldwide NEjungti. Kategoriją PERRINKTI
  po tipo keitimo. Variantų vardai ≤20 simbolių. Titles — be žodžių pasikartojimų.
- Po kiekvieno listingo: atsidaryti kaip pirkėjui, patikrinti „from" kainą, dropdown,
  processing prie pack varianto, partnerių bloką.

---

## NAKTIES DARBAI ATLIKTI (2026-09-01 → 02, agentas)

**Figma failai (be jokių eksportų — jie tavo):**

1. **Kampai statūs visuose 24 failuose** (23 sporto + master `fRKQzJg5…`). Keista tik korta:
   `Card · *` rėmeliai, `card_border(_inner)`, social `card` wrapperiai, `proof_card_*`,
   CardFlip veidai (atpažinti pagal aspect 0.714). `stat`/`accent_bar`/`#card_qr`/`#photo_*`
   spinduliai NELIESTI. Auditas kiekviename faile: liko apvalių = 0. Pastaba: „card_border_inner
   (heritage double line)" — vardas su priedu, `===` palyginimas jį praleido, `startsWith` pagavo.
2. **Lipdukai**: vardo tekstas niekada nebelenda po numerio čipu — fitteris (vardas
   nesitrumpina, mažėja šriftas) pravarytas per visus failus; SN čipas vadinasi `coin_contour`,
   kiti `chip_contour`. Baseball WHITLOCK, lacrosse CALLAHAN, gymnastics MARCHETTI ir kt. — sutvarkyti.
   Rombo spalva pasirodė JAU surišta su `team/primary` (Casey komanda oranžinė) — spalvos defekto nebuvo.
3. **`01 · CARD LISTING` (636:170)** — fizinė istorija visose 6 sekcijose:
   - Nauja skaidrė **`02 · CHOOSE YOUR PACKAGE`** (4 stulpeliai, be kainų) visose sekcijose.
   - Hero gavo eilutę **PRINTED + SHIPPED · FREE CERTIFICATE** (po NUMBERED + REGISTERED).
   - 18 skaidrės melas „DIGITAL FILES ONLY · NOTHING SHIPS" → „DIGITAL IN DAYS — OR PRINTED &
     SHIPPED FREE"; 17: „YOUR COMPLETE SET — DIGITAL OR PRINTED" + „PRINT PACKAGES SHIP FREE".
   - A5 sweep: puslapyje nebeliko NĖ VIENO „digital only / nothing ships / no physical item".
4. **Naujos sekcijos: BASEBALL (639:127), SOCCER (639:919), VOLLEYBALL (639:1711)** — klonai su
   pilnu tekstų pakeitimu (Casey Whitlock #7 Harlow Creek Larks / Mateo Herrera #10 Sunfield
   Kestrels / Jaslene Ocampo #5 Fox Hollow Anchors), donoro žodžių auditas CLEAN. Finišų vardai
   08–11 skaidrėse sąmoningai nekeisti (ten rodomi visi šeši).
5. **Registras**: +3 eilutės (`GDE-HE-BSB-2026-07`, `GDE-CA-SOC-2026-10`, `GDE-SS-VBL-2026-05`)
   ir QR sugeneruoti (`public/cards/qr/`).
6. Kodas: `die_mask` → statūs kampai (+ kampų užpiešimas ant senų apvalių plokštelių nuotraukų),
   promptai „rounded" → „SHARP SQUARE".

## RYTOJAUS EKSPORTO SĄRAŠAS (savininkui)

Visi kortelių vaizdai dabar SENSTELĖJĘ (apvalūs kampai) — eksportuoti iš sporto failų po šios
nakties pataisų:
1. Kiekvienam iš 6 sportų (BKB/FTB/CHR/BSB/SOC/VBL): FRONT V2 + BACK @2x, lead-finišo poster @2x.
2. Naujoms sekcijoms — visi vaizdų fill'ai dar rodo donoro (football/cheer) meną: po eksporto
   agentas juos sukeis + perkompozituos „kortelė rankoje" (jau stačiais kampais) ir sudės QR.
3. Sertifikato vaizdą į 17 skaidrę (asset print-sources/output/<finišas>/GDE-*-certificate-*.png).

## VIDEO į listingus (2026-09-01, savininko sprendimas: daryti dabar)

Kiekvienas listingas turi 2 video slotus (3–15 s naudojama, >15 s Etsy nukerpa; max 100 MB;
garsas išmetamas). Failai JAU yra `etsy/listing-videos/` — žemėlapis:

| Listingas | Slot 1 (story/product) | Slot 2 (close/proof) |
|---|---|---|
| Basketball Card 4562666649 | GDE-etsy-01-card-1080.mp4 (10.8 s; story 19.5 s per ilgas) | GDE-etsy-01-card-close-1080.mp4 (15.7 s — Etsy nukirps 0.7 s) |
| Basketball Poster 4562700100 | GDE-etsy-02-poster-story-1080.mp4 (14.4 s) | GDE-etsy-02-poster-close-1080.mp4 (14.7 s) |
| Football Card 4563878038 | GDE-etsy-05-ftb-card-story-1080.mp4 (13.3 s) | GDE-etsy-05-ftb-card-close-1080.mp4 (13.1 s) |
| Football Poster 4564301710 | GDE-etsy-06-ftb-poster-story-1080.mp4 (12.3 s) | GDE-etsy-06-ftb-poster-close-1080.mp4 (13.5 s) |
| Cheer Card 4564284709 | GDE-etsy-07-chr-card-story-1080.mp4 (13.2 s) | GDE-etsy-07-chr-card-close-1080.mp4 (13.1 s) |
| Cheer Poster 4564287163 | GDE-etsy-08-chr-poster-story-1080.mp4 (12.4 s) | GDE-etsy-08-chr-poster-close-1080.mp4 (13.5 s) |
| Complete Set 4562711454 | GDE-etsy-04-set-story-1080.mp4 (14.4 s) | GDE-etsy-04-set-close-1080.mp4 (13.7 s) |
| Senior Night Set 4564565764 | GDE-etsy-04-set-story-1080.mp4 (turinys set-generic, patikrinta kadrais) | GDE-etsy-04-set-close-1080.mp4 · SKOLA: SR-specifinis video |

**BŪSENA po bandymo 2026-09-01:** gyvai suskaičiuota — video jau turi 6 iš 8 listingų
(savininkas sukėlė anksčiau). TRŪKSTA tik: **Senior Night Set 0/2** (abu slotai) ir
**Football Poster 1/2** (antras slotas). Failai: SN Set ← GDE-etsy-04-set-story +
GDE-etsy-04-set-close; FTB Poster ← GDE-etsy-06-ftb-poster-close. Įkelia SAVININKAS
(drag į „Add videos" tile'ą Photo & Video tab'e).

⚠️ SPĄSTAI (patikrinta, nebekartoti): Chrome plėtinio `file_upload` injekcija į Etsy
video uploader'į NEVEIKIA — failas atmetamas kliento pusėje be jokios tinklo užklausos
(greičiausiai isTrusted patikra; bandyta 4×, du skirtingi failai). Pinterest per Chrome
iš viso nerenderina SPA turinio (pin-builder / business hub — tuščias body, header only)
— Pinterest darbams naudoti TIK programos panelės naršyklę. Teksto veiksmai (užpildyti,
paskelbti) panelėje automatizuojasi; failų įkėlimą daro savininkas.

## VEIKLOS MODELIS nuo 2026-09-01 (savininko sprendimas, keičia „publishing stays human")

Claude PUBLIKUOJA pats — Pinterest pinus, Reddit atsakymus, Facebook atsakymus — bet
KIEKVIENĄ turinio partiją (tekstas + vaizdai + kur keliama: boardas/subreddit/grupė)
pirma patvirtina savininkas chate. Be patvirtinimo niekas neskelbiama. IG kuria pats
savininkas (turinys iš to paties pin variklio, 1080×1350 formatai jau yra). Naujus
listingus (2–4/d.) suveda savininkas pagal etsy/SEO/LISTING-COPY-PACK.md.
