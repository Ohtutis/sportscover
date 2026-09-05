# Listing 01 — Custom sports trading card · field-by-field fill sheet

Written 2026-08-24 against the **live Shop Manager form** (screenshots, shop `GameDayEdition`,
locale Lithuania). Every heading below is a real section of that form, in the order it appears.
Where a value is still a decision, it says **DECIDE** and nothing else is invented.

---

## Photo & Video

**"Add up to 20 photos and 2 videos."** — two video slots, not one. The earlier note in
`CREATIVE-BRIEF.md` said 1 and has been corrected.

| Spec | Value |
|---|---|
| Photo formats | JPG, GIF, PNG |
| Photo size | **2000 px on the shortest side, 72 PPI** |
| Photo weight | **under 1 MB** (Etsy's own advice, for upload speed) |
| Video length | **3–15 s**; a longer file (up to 60 s) is auto-trimmed to the first 15 s |
| Video weight | max 100 MB |
| Video audio | **stripped** — never rely on sound |

Export the 20 listing frames as **2000×2000 JPEG, quality ~85, under 1 MB**. The Figma frames
are larger than that; they need a downscale on export, not a straight PNG dump.

Second video slot is new capacity. Suggested use: slot 1 = the flip-card video (product),
slot 2 = the before → after transformation (proof).

---

## Item details

| Field | Value |
|---|---|
| **Category** | **DECIDE — and do it first.** The `+ Add variation` button is greyed out in the screenshot; on Etsy variation properties come from the category taxonomy, so nothing can be added until a category is set. Type "trading card" and compare the sports-collectible and the art-print branches before choosing. |
| **When was it made?** | **Made To Order** ✓ already selected — correct, keep it |
| **Title** (140) | `Custom Sports Trading Card, Personalized Youth Athlete Card from Your Photos, Basketball Baseball Football Hockey, Digital or Printed` *(132 chars)* |
| **Description** | First lines are all the buyer sees before "expand" — lead with what they get and how, not with brand story. Draft lives below. |

---

## Item options

### Variations — 2 properties (Etsy's cap)

| Property | Values | Price |
|---|---|---|
| **Package** | Digital card · Digital full set · Printed card shipped · Printed set, 6 finishes | $24 / $39 / $59 / $89 |
| **Turnaround** | Standard · **Rush 24 h design** | +$0 / +$25 |

8 offerings. "Rush" is named *design* turnaround deliberately — it is how fast **we** work, not
how fast the post moves, so it stays true on the printed tiers.

The two printed tiers stay **disabled** until a TGC sample is in hand. Building them now means
the listing never has to be restructured.

### Custom options — 5 fields (Etsy's cap)

Form text confirms it: *"Create up to 5 input fields to collect details from buyers like text,
images, or names."*

| # | Type | Label | Required |
|---|---|---|---|
| 1 | **File upload** | Photos of your athlete — 3 to 10, face clearly visible | yes |
| 2 | Text box | Athlete first and last name | yes |
| 3 | Text box | Number, position, team, stats, and one line for the back | yes |
| 4 | List of options | Art finish — the six finish names | yes |
| 5 | Text box | Second finish (only if you chose the 6-finish package) | no |

Field 1 is the whole intake problem, solved by the platform.

---

## Attributes — 13 tags, max 20 characters each

```
custom sports card · trading card gift · personalized card · youth sports gift
senior night gift · basketball card · baseball card · football card · hockey card
sports team gift · athlete gift · custom card photo · sports card print
```

---

## Price and inventory

| Field | Value |
|---|---|
| Price | **$24** — Etsy shows the lowest offering as the "from" price |
| Quantity | 999 per offering (made-to-order; nothing is physically stocked) |
| SKU | `GDE-CARD-{D1,D2,P1,P6}-{STD,RUSH}` |
| **Add estimated US tariff cost** | Not needed while TGC prints **inside** the US — no import, no tariff. Revisit only if a supplier outside the US is ever used. |

---

## Shipping, processing, and returns

| Field | Value |
|---|---|
| Processing profile | **DECIDE.** Must cover the slowest offering, i.e. the printed tiers: our design time + TGC production + UPS Ground 1–5 d. |
| Shipping option | **DECIDE — and check the origin.** TGC drop-ships from Wisconsin, so the profile's origin should be the **US**, not Lithuania, or every US buyer sees an international delivery estimate on a domestically-shipped card. Confirm Etsy permits a US origin on an LT-registered shop before publishing. |
| Returns | **Do NOT apply the offered "Simple policy 30 days".** This is a personalized item made from the buyer's own photographs; Etsy allows custom items to be excluded from returns. Correct policy: no returns on personalized work, free cancellation before art starts, full remake or refund on a defect. |

## GPSR

The form's own text: *"If you're a 'trader' selling to EEA states or Northern Ireland… You can
also choose to stop selling to these states in GPSR settings."*

Our market is the US. **Restricting sales to the US removes the GPSR obligation entirely** and
matches the positioning decision already made. Do it in GPSR settings, not per listing.

## How it's made

| Field | Value |
|---|---|
| Who made it? | **DECIDE** — while everything is digital, "I did" is accurate. |
| What is it? | A finished product |
| **Production partners** | **Required once printing goes live.** TGC physically produces the card, which makes them a production partner under Etsy's rules. Undeclared production partners are a policy violation, not a formality — add TGC before the first printed tier is enabled. |

## Settings

| Field | Value |
|---|---|
| Shop section | **DECIDE** — create "Trading cards" now; sections are how the shop reads once there are 12+ listings |
| Feature this listing | on — it is the only listing at launch |
| Renewal | Automatic, $0.20 |

---

## Description draft — first three lines carry it

> **A trading card of your own athlete, built from your photos — not a template with a face
> pasted in.**
> You send 3–10 photos. We build the card, and you get print-ready files back. Six art finishes.
> Optional: we print it and ship it to you.

Then, in order: what you get · how it works in 4 steps · the six finishes · turnaround ·
what is NOT included · how your photos are handled.

---

## Open decisions, collected

1. Category — blocks variations, do first
2. TGC sample order — blocks the printed tiers and the card-in-hand photographs
3. Whether $89 gives all six finishes physically
4. Shipping origin US vs LT — confirm with Etsy before publishing
5. Processing profile durations

---

# V2 PAKETŲ LENTELĖ (2026-09-01) — pakeičia viršuje esančią variacijų sekciją

Savininko kryptis: kortelės ir plakatai gali eiti kartu su užsakymu; **kiekvienas
spausdintas paketas gauna NEMOKAMĄ atspausdintą sertifikatą** (mūsų
`GDE-*-certificate-2550x3300-300dpi.png` = 8.5×11, Bay lustre €6.29 toje pačioje
siuntoje). Principas: VIENA variacijos savybė, 4 aiškūs laipteliai, „from" kaina
konkurencinga lentynai (išmatuota mediana $24).

## Variacija: „Choose your package" (viena savybė, 4 pasirinkimai)

| # | Pavadinimas pirkėjui | Kas viduje | Kaina | COGS | Marža* |
|---|---|---|---|---|---|
| 1 | **Digital Card Files** | kortelės priekis+nugara spaudai ir ekranui + tel. wallpaper | **$29** | ~$0.6 | ~$24 |
| 2 | **12 Printed Cards — shipped** ⭐ | 12 dvipusių UV kortelių + **FREE printed Certificate** + visi digital failai | **$59** | ~$17 | ~$34 |
| 3 | **Cards + 12×18 Art Print** | #2 + 12×18 spauda toje pačioje dėžutėje | **$79** | ~$27 | ~$41 |
| 4 | **Complete: Cards + 18×24 Poster** | #2 + 18×24 plakatas (atskira siunta iš poster lab) | **$99** | ~$36 | ~$47 |

*po ~13 % Etsy mokesčių. Kainos — savininko sprendimas; ši lentelė yra rekomendacija su
šia logika: $29 digital pataiso „from" kainą lentynoje (buvom $35.57 tarp $11–30 fizinių);
#2 yra numatytas nugalėtojas (2× digital už fizinį + dovana); #3 daro #4 „pilnu"; #4 —
kainos inkaras.

- **Rush IŠIMTAS iš variacijų** (paprastumas). Prireikus — per žinutę, +$25 rankinis.
- Fulfillment: #2–3 = viena Bay white-label siunta; #4 = Bay + Printful, apraše
  atskleidžiama „poster ships separately".
- Processing: digital 1–2 d.; spausdinti 5–10 business days (konservatyvu, Bay ~1 sav.).
- Prie listingo prisegti partnerius: Bay (visi spausdinti), Printful (#4).
- Quantity 999 per offering; SKU `GDE-CARD-{DIG,P12,P12P,FULL}`.

## Aprašo blokai (įterpti į listingą)

**Po fold'u, prie paketų:**
> EVERY SHIPPED PACKAGE INCLUDES a printed Certificate of Authenticity with your
> athlete's name and edition number — free.

**Garantija (atskiras blokas, didžiosiomis):**
> OUR PROMISE — you approve a proof before anything is finalized. If we cannot reach a
> result you are happy with, we refund every cent you spent. And if anything about the
> print isn't right when it arrives, we reprint it free or refund you in full. You keep
> the cards. No forms, no questions.

⚠️ Pirmasis sakinys pridėtas 2026-09-02 — jis dengia **dizaino/proof** etapą, o senasis
tekstas dengė tik spaudą. To reikalauja listingo nuotrauka **17 skaidrė**
(`NOT RIGHT? WE REVISE IT — OR REFUND EVERY CENT`): pažadas paveikslėlyje be to paties
pažado aprašyme yra neuždengtas teiginys. **Į gyvus listingus dar neįklijuota** — tai
savininko veiksmas (aprašo redagavimas 8-iuose listinguose).

**#4 pastaba:** Poster ships separately from our poster lab — both packages are tracked.

## Vaizdų darbai augimui (hero perdirbti NEREIKIA — badge užtenka)

- Hero: kampe ženkliukas „12 PRINTED CARDS · FREE CERTIFICATE" (spausdintų tiers žinia).
- 02 slide: 4 paketų palyginimo kortelė (kas viduje, viena akimirka suprasti).
- Kai ateis pirmo kliento nuotraukos su leidimu — jos keičia mockup'us.
