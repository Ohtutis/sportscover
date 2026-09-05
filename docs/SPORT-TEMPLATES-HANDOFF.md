# 17 sport template files — handoff

Started 2026-08-23. This is a separate workstream from `GAME-DAY-EDITION.md` (which owns the
design system) and `ATHLETE-ROSTER-HANDOFF.md` (which owns the art). This file owns only one
question: **how the finished art gets into 17 per-sport Figma files.**

## 1. The decisions, as taken by the user 2026-08-23

1. **The master file is an etalon and is NEVER touched.** `Cover Moment — Templates`
   (`KzdEYF1UD9EnsczY8Kpyxi`) stays exactly as it is, forever, including its Nia Brooks
   placeholder athlete. Basketball gets a COPY like every other sport — it is not a special
   case and the master does not become the basketball file.
2. **One duplicated file per sport**, each keeping all six finish pages and all five sections.
   This is not just a container choice: a duplicate carries its own copies of the `Athlete`
   and `Style` variable collections, which is the **only** architecture where the variable
   binding keeps working. Text becomes ~15 variable writes per file instead of thousands of
   text edits, and the 6-mode cap that blocks 17 athletes in one file never applies.
3. **No number means no number.** Where a sport does not number its athletes, we do not
   invent one. The giant ghost NUMBER becomes the ghost SURNAME (poster `#number`, card back
   `#number_ghost`), and it **must fit on one line** — the merge shrinks fontSize, it never
   wraps. Six sports: cheerleading, gymnastics, swimming, tennis, golf, pickleball.
4. **Full digital across all six styles**, not a reduced set. The point is a finished project
   to work from — every style × every sport athlete, ready for ad variations later.
5. **Print exports are not run.** The print artboards are populated by the same sweep so the
   file never contains a lie, but no 300 dpi export, no upscale-to-print, no flip-video render
   happens until an order or a specific need asks for it.

## 2. Why the file will not be too heavy — measured, not guessed

One finish page (Stadium Night) = **34 artboards, ~1 400 nodes**:

| Section | Artboards | Nodes |
|---|---|---|
| 01 · HERO & TEMPLATES | 3 | 128 |
| 02 · PRINT READY | 6 | 395 |
| 03 · SOCIAL | 9 | 335 |
| 04 · WALLPAPERS | 7 | 338 |
| 05 · DIGITAL BONUS | 9 | 198 |

Whole file ≈ **204 artboards, ~8 400 nodes** — the size it already is today, and it works.
Duplicating does not compound: 17 copies are 17 separate files of that same size, opened one
at a time.

**Swap targets per finish page** (name-matched, from the metadata dump): `#photo_main` ×24,
`#photo_3` ×21, `#photo_2` ×21, `#team_logo` ×19, `#background` ×14, plus backdrops and the
four cutout export frames — **~107 per page, ~640 per file**. That is a loop, not handwork.
Sections 02–05 are name-preserving clones of the hero content, which is why one sweep reaches
all of them.

## 3. What is DONE (2026-08-23, before the pilot)

### `art-pipeline/card-data.ts` — the text half of the merge

23 entries (17 sports + the 6-rung soccer age ladder), each with position, three season stats,
a highlight line and a graduation year. **Every number in it is invented** — plausible demo
props, not claims. `checkCardData()` enforces the measured field limits mechanically
(position ≤10, stat label ≤6, stat value ≤5, headline ≤28) and cross-checks the `numberless`
flag against `athletes.ts` `jerseyNumber`, so a sport cannot silently ship a "0".
`ghostText(slug)` returns what goes in the giant slot — the number, or the uppercase surname.

Run it: `npx tsx -e "import {checkCardData} from './art-pipeline/card-data.ts'; console.log(checkCardData())"`

### `art-pipeline/lib/fit.py` (`npm run art:fit`) — one layout, seventeen bodies

The slots were laid out around ONE athlete and every slot uses scaleMode FIT, which centres by
the CANVAS, not by the person. Measured across the roster the subject occupies **33%–94% of
canvas height** — dropped in raw that is 102 composites nudged by hand.

The tool measures the alpha bbox of all 92 approved cutouts and writes:
- `<pose>.fit.png` — a normalised twin (subject 90% tall, standing on 97%, centred, never
  closer than 4% to an edge). **`<pose>.cutout.png` is never touched; it is approved art.**
- `art-pipeline/out/athletes/_fit-report.json` — bbox, subject %, aspect, and a ready-made
  `transform` (scale + offset) per pose.

Two ways to use it in Figma, decide in the pilot: drop the `.fit.png` into a FIT fill (simple,
resamples once), or keep the approved pixels and apply the `transform` to a CROP fill
(lossless, more script). Scale factors sit between 0.96 and 1.15, so this is a light
correction — good evidence the poses are consistent and the layout is not being fought.

### The one real finding: two heroes cannot carry a portrait slot

The hero slots are 771×1146 (poster) and 600×900 (card front) — aspect ~0.67. Checked by
measurement and then by eye:

| Athlete | `hero` pose is | aspect | Use instead |
|---|---|---|---|
| cheerleading (Amara Boyd) | a toe-touch jump, legs spread wide | 1.93 | **`action3`** — vertical jump, pompoms overhead |
| gymnastics (Sofia Marchetti) | a split leap in flight | 1.19 | **`action2`** — standing finish, arms overhead |

No scaling fixes a horizontal pose in a vertical box. This is a **slot reassignment, not a
regeneration** — both alternatives are strong, face-forward frames, and the displaced wide
poses are ideal for the supporting slots (`#photo_2` on the poster is 928×1001, near square).
Everything else in the roster: `hero` fits.

## 4. What is BLOCKED, and on whom

1. **The basketball pilot needs a duplicated file.** Figma MCP cannot duplicate a file — that
   is a right-click → Duplicate in the Figma UI. Needed: the duplicate's **fileKey** (the
   string in its URL). Nothing else about the pilot is blocked.
2. **Backgrounds for sports 2–17 are 848×1264** and must be upscaled 4× before they are used
   (wallpapers alone are 3840×2160). The upscaler is **not on this machine any more** —
   `upscayl-bin` / `realesrgan-ncnn-vulkan` are absent, and no ESRGAN model is cached. It is a
   download + a binary to execute, so it waits for the user rather than being fetched
   unattended. **Basketball is unaffected** — its background IS the finish master at
   3392×5056, which is exactly why it is the right pilot.
3. **Still open, not urgent:** the per-sport "signature style" mapping for the Etsy listings,
   and whether the listing hero is a flat Figma layout or a product mockup. Neither blocks the
   17 files; both block the `06 · ETSY LISTING` section, which does not exist yet in any file
   and should be designed once and then propagated.

## 5. The per-file recipe (plan of record, unproven until the pilot)

1. User duplicates the master, names it by sport, hands over the fileKey.
2. Upload 11 assets: 6 finish backgrounds for that sport, 4 cutouts, 1 club crest.
   (Uploads are file-scoped — they repeat for every duplicate.)
3. Set ~15 `Athlete` variable values from `athletes.ts` + `card-data.ts`, and the two
   `team/primary` / `team/secondary` colours. All 204 artboards update at once.
4. Sweep the six pages by layer name, swapping ~640 image fills, using `_fit-report.json`
   for placement.
5. Per-sport template edits the frozen master cannot carry: stat chip LABELS are plain text
   (`PPG`/`APG`/`RPG` are literal strings, not variables — verified), and the six numberless
   sports need the ghost swapped to the surname with a fit pass and the `#number · ` half of
   the front meta line hidden.
6. QA by eye: the 3 canonical frames × 6 pages. The rest is correct by construction and
   **not visually verified** — do not ship from sections 03/04 without looking first.

## 7. Cutout quality gate (added 2026-08-23)

Before any cutout is uploaded to a sport file it must pass `npm run art:audit:cutout`. The
old check could not see debris smaller than ~31×31 px; the roster had four such frames, one of
which the customer had already spotted by eye (a dark fragment beside the skateboarder's shoe).
Full rationale and the shape rule that separates a ball from a crumb: `art-pipeline/README.md`
§45.

State as of 2026-08-23: **92 cutouts audited, 88 clean, 4 cleaned** — `cheerleading/back`,
`other-sport/hero`, `soccer-age-07/back`, `softball/back`. Cleaned copies are `<pose>.clean.png`;
the approved `<pose>.cutout.png` files were not modified, and `npm run art:fit` picks the clean
twin up automatically.

## 8. Field limits are measured, not remembered

`docs/ORDER-FIELDS-SPEC.md` holds the order-form field list with a maximum length for each,
measured inside the Figma file across all six finishes. Two results change how the files get
built: the **ghost surname holds 6 characters** at design size (so the merge must shrink it for
11 of the 17 athletes), and **Heritage's `#team` slot holds 15** while 15 of the 17 club names
are longer — that slot needs widening in the template before the files are built.


## 9. The basketball pilot — DONE 2026-08-23, and what it cost to learn

File: **Basketball GDE — Hero Template** (`fgueg7sV11zKnV1hir1Zsg`). Marcus Ellison,
Cedar Ridge Bears, #12, across all six finishes. Verified by eye on the Stadium Night poster
and card front, the Prism Rush poster and the Heritage poster.

### What the pilot actually changed

| Step | Scale |
|---|---|
| `headline` variable created (it did not exist) | 1 |
| literal merge fields bound to variables | **273** across 6 pages, 0 skipped |
| text fields switched from a fixed box to hug, or shrunk to one line | **162** |
| stale echo/shadow clones bound (Prism Rush RGB split, Heritage block shadow) | **28** |
| athlete photo + crest image fills swapped | **604** |
| crest re-swapped after the transparency fix | **125** |

Athlete text itself was ~22 variable writes plus six per-mode `cardId` values and two colours.

### Six defects the pilot exposed — every one of them would have hit all 17 files

1. **The poster was not variable-bound at all.** 45 merge fields per page were literal text.
   Now bound; a sport file is variable writes plus image swaps, not a text-rewriting job.
2. **No `headline` variable existed** — 16 literal "OWN THE MOMENT" nodes per page.
3. **Fixed-width name boxes wrap instead of overflowing.** `#first_name` was 144 px, cut for
   "NIA". "MARCUS" wrapped to **MA / RC / US** stacked down the nameplate and rendered over its
   neighbours. Any merge field except `#bio` now hugs its content.
4. **Shrink-to-fit is wrong for a name.** The first fit pass halved Prism Rush's first name
   (109 → 54 px) to make it fit a box cut for a three-letter name. A lockup GROWS; only the
   giant ghost slots shrink. Heritage's poster number legitimately shrank 918 → 830.
5. **Effect clones are invisible to a name-based sweep.** Prism Rush's `first_echo_magenta` /
   `name_echo_cyan` and Heritage's `number_block_shadow` are not named `#…`, so they kept
   saying NIA and BROOKS in cyan and magenta behind the new name. Sweep by **old value**, not
   only by layer name.
6. **Every crest in the repo is opaque on white** — all twenty measured 0.0% transparent, so
   the badge arrived as a white box on a dark poster. `npm run art:crest:cut` fixes it by
   flood-filling from the edges (white INSIDE a badge must survive) and reading the backdrop
   colour from an inset ring (Ash Grove Foxes is on grey behind a thin dark frame, and a
   white key did nothing to it).

### Still open on this file

- **The card BACK photo is not a layer on Stadium Night or Chrome All-Star** — the from-behind
  shot is baked into `#card_bg`. Fire & Smoke, Heritage, Signature Spotlight and Prism Rush each
  have a real `#back_photo` (7 nodes) and were swapped correctly. SN and CA still show the old
  athlete from behind. Fix once in the template: give both a `#back_photo` layer over a plain
  finish background, then it is a hash swap forever.
- **`back_photo (bleed)`** on the print card is named differently from `#back_photo` and was
  skipped — one node per page on FS/HE/SS/PR.
- **Heritage `#team` holds 15 characters** and "CEDAR RIDGE BEARS" is 17. Widen that slot.
- Backgrounds were NOT touched, correctly: the six finish masters are basketball courts.
  Sports 2–17 need their own background swapped in, and those files are 848 px — they must be
  upscaled first.


## 10. Validation pass — 2026-08-23, and the four defects it was built from

The customer looked at the basketball file and named four things no script had reported:
the card-back number covering the information, one supporting pose hidden behind another, the
number sliding onto the back over other content, and "12" being unreadable. All four were
real, and one more was hiding with them: the back photo still wore **23**, the previous
athlete's number.

**Fixed**

| Defect | Cause | Fix |
|---|---|---|
| Ghost "12" covering the whole card back | its fill opacity had drifted 0.2 → 1 on three Stadium Night nodes | restored from the master; CA/FS/HE/SS/PR checked and clean |
| Back photo showing number 23 | the from-behind shot was **baked into `#card_bg`** on SN and CA | 15 card backs rebuilt with a real `#back_photo` layer over the plain finish background, copying the Fire & Smoke structure |
| `back_photo (bleed)` still on the old athlete | named differently from `#back_photo`, so the sweep missed it | all four swapped (FS, HE, SS, PR) |
| "CEDAR RIDGE BEARS" running into "CLASS OF" | club name longer than the previous one | type stepped down 30.4 → 28.4 pt; **the name is never shortened** |
| Heritage block shadows the wrong size | my own sync forced them equal to the numeral | restored to the measured 10/9 varsity ratio |

**The validator** — `art-pipeline/figma/validate-layout.js`, rationale in `art-pipeline/README.md` §46.
It reads every artboard, finds text colliding with text and text escaping its frame, fixes what
it safely can and reports the rest. It caught three of my own mistakes on the way to being
trustworthy, including one where its earlier version drove nine Prism Rush headlines from
48 pt to 7.7 pt — those were recovered from the master, which still had the right values under
the same node ids.

**Final state of the basketball file: 0 escapes and 0 collisions across all six pages.**

## 11. What the master still does NOT have

The master keeps its baked card-back photo, because splitting it needs a transparent
from-behind cutout of its own athlete and there is none. So **every sport copy needs the
card-back restructure** — it is one scripted call per finish and the recipe is in §10 above.
The master DID receive: the `headline` variable, 301 field bindings, 180 hug conversions and
the block-shadow ratio fix.


## 12. Composition fix — the supporting figures (2026-08-23)

The customer saw it before any tool did: on the card front one supporting pose was "not visible
at all, hidden behind" the hero. Cause was mine — `fit.py` normalised all three poses to the
same 90% box, so the supporting figures rendered ~43% larger than the layout expects and landed
on top of the hero instead of behind him.

Fixed by measuring the reference art (`exports/shared-cutouts/`) and giving each slot its own
profile — hero 78.5%, action2 62.9%, action3 70.1% of canvas height. Rationale and the table:
`art-pipeline/README.md` §47. Re-normalised, re-uploaded and re-swapped across all six pages
(451 image fills). Verified against the master poster and card front side by side: three
separated figures, same reading order as the design.

**Open observation, not a defect:** Marcus's `action2` is a grounded crouch, and the supporting
slot floats its figure (the reference athlete is airborne in both supporting poses, so floating
reads naturally there). Worth a look per sport when the remaining sixteen are built — it is a
pose-selection question, not a layout one.


## 13. Session close — 2026-08-23

**Both files now carry the same design.** The customer hand-tuned the composite on the
basketball file; everything measurable about that was captured and propagated, and the master
received it too. The master keeps its own athlete — that is deliberate: the remaining sixteen
sport files get duplicated FROM it, and a master carrying a real athlete's photos would make
every duplicate start with data to scrub.

| Change | basketball file | master |
|---|---|---|
| `headline` variable + field bindings | 273 | 301 |
| hug / one-line fit | 162 | 180 |
| stale echo & shadow clones bound | 28 | included |
| block-shadow ratio restored to 10/9 | ✓ | ✓ |
| athlete photos + crest | 604 fills | n/a (keeps its own) |
| card backs rebuilt with a real `#back_photo` | 15 | not possible — see below |
| centre/right text re-anchored | 114 | — (never drifted; content unchanged) |
| `team/primary-ink` + rebinding | 299 text + 136 rules | 299 + 136 |
| tuned photo layout | 76 clones | 78 clones |

**The one thing the master cannot take:** splitting the baked card-back photo into
`#card_bg` + `#back_photo` needs a transparent from-behind cutout of the master's own athlete,
and none exists. So every sport file still needs that one step — it is a single scripted call
per finish, recipe in §10.

**Deferred on purpose, both files:** ten artboards per page whose aspect ratio is nothing like
the canonical frames — phone wallpapers (0.46), desktop (1.78), Story 1 (0.56), cover banner
(3.0) and the trio cutout. A 9:16 wallpaper cannot inherit a 3:4 composition; those need their
own pass rather than a blind transform.

---

## 14 · Kompozicija tapo komponentu (2026-08-23)

Trys nuotraukų laukai kiekviename kadre pakeisti **viena instancija**. Struktūra dviaukštė:

| Lygis | Kiek | Turinys | Kada liečiam |
|---|---|---|---|
| `Athlete / AIR` 1296×1728, `Athlete / TIGHT` 750×1050 | 2 | tik trys figūros (hero 100 %, action2/3 85 %) | keičiant SPORTĄ — 3 nuotraukos |
| `SN/CA/FS/HE/SS/PR × AIR/TIGHT` | 12 | to finišo ghost + įdėta atleto instancija | keičiant finišo MEDŽIAGĄ |
| kadrai | 126 | `athlete_block` instancija | tik pozicija ir mastelis |

**Kodėl ne kitaip.** 12 komponentų su savo nuotraukų kopijomis → sporto keitimas virstų
36 paveikslėliais vietoj 3. 2 komponentai su vienu bendru ghost'u → Figma neleidžia
instancijos vaikui perrašyti pozicijos ir dydžio, tad Heritage `number_block_shadow`
(10/9 mastelis) ir Prism Rush du RGB echo neišgyventų.

**Print variantas.** Ta pati instancija + `rescale(k)`. Patikrinta ant 4.1667:
1296 → 5400 px **ir** 855.8 → 3565.7 pt. Šrifto kegelis skaliuojasi kartu, tad
5475×7275 eksportas nereikalauja atskiro maketo.

**Kiek pritaikyta.** 21 kadras kiekviename iš 6 puslapių = 126. Neliesta 8 kadrai
puslapyje (48 iš viso), nes jų maketas iš esmės kitas:
`SOCIAL · Profile picture` (vien hero, CROP), `SOCIAL · Cover banner` (3:1 iškarpa),
`Cutout_Hero_PNG` (vienas), `Cutout_Trio_PNG` (gulsčias skaidrus eksportas).

**Netilpimo taisyklė.** Figūrų tikrasis plotis (be skaidrių paraščių) yra 233…1281 iš
1296 AIR ir 74…739 iš 750 TIGHT. Kur po perkėlimo jos išeidavo už kadro (37 kadrai,
iki 394 px), kompozicija sutraukta laikant herojaus centrą ir pėdų liniją vietoje;
mažiausias koeficientas 0.766 (telefono fonai). Po pataisos — 0 nukirstų.

### Klaida, kurią verta žinoti

`#number_ghost` faile reiškia **tris skirtingus dalykus**: kortelės nugaros skaitmenį,
blyškią (6 %) figūrą kortelės priekyje ir didelį centruotą skaitmenį ekrano fonuose.
Valant našlaičius filtras pagal vardą ištrynė visus **91**, nors defektų buvo 13.
Atstatyta iš neliesto master failo `KzdEYF1UD9EnsczY8Kpyxi` — 90 sluoksnių (kortelių
nugaros + ekrano fonai). Kortelės priekio egzemplioriai NEATSTATYTI sąmoningai: ten
dabar galioja taisyklė „vienas ghost iš komponento" ir priekyje lieka pavardė.

Naudingas faktas atstatymui: **efektų spinduliai ir poslinkiai keičiasi tiksliai
proporcingai `fontSize`**, tad juos galima saugoti normalizuotus (r/fs) ir atkurti bet
kokiam masteliui. Ekrano fonų ghost'ai turi fiksuotą dėžės plotį su centruotu tekstu —
atkuriant `textAutoResize='HEIGHT'` plotį reikia nustatyti atskirai.

### 14.1 · Centravimo taisyklė ir ghost variantai (2026-08-23, vėliau tą pačią dieną)

**Taisyklė:** herojus ir ghost'as visada ant kadro ašies, action'ai — į šonus. Įrašyta
į pačius komponentus: `Athlete / AIR` figūros pastumtos −41.7, `Athlete / TIGHT` −25.8,
kad herojaus centras (0.4997 nuo iškarpos pločio) sutaptų su rėmo viduriu (648 / 375).
Ghost'as kiekviename iš 12 stiliaus komponentų centruotas ant tos pačios ašies.

Dėliojant instanciją: `k ≤ (W/2 − m) / halfSpan`, kur `halfSpan` = 591.3 (AIR) ir
338.2 (TIGHT) — tai didesnysis atstumas nuo ašies iki figūrų krašto. Vertikalė laikoma
už **pėdų liniją** (1370.3 AIR / 916.9 TIGHT), kad atletas neplaukiotų.

**Išimtis — platūs kadrai** (`W/H ≥ 1.2`: juosta 1500×500 ir du darbalaukiai 3840×2160):
ten kairėje sėdi vardo blokas, tad herojus lieka savo derintoje vietoje, taikomas tik
tilpimo mastelis. 114 kadrų centruoti tiksliai (nuokrypis 0), 18 — plačių.

**Ghost turi DU variantus** kiekviename stiliaus komponente, matomas visada vienas:

| | numeruotas sportas | be numerio (imtynės, cheer, gimnastika, plaukimas, tenisas, golfas) |
|---|---|---|
| AIR (posteris) | `#number` | `#surname_ghost` |
| TIGHT (kortelė) | `#number` | `#surname_ghost` |

Perjungiama **komponente**, ne kadre — matomumo jungikliu. HE variantas nešasi savo
`*_block_shadow`, PR — savo du `*_echo_*`. Numatyta: AIR rodo skaičių, TIGHT — pavardę.

**Abu variantai užima TĄ PATĮ plotą** (pataisyta 2026-08-24). Posterio pavardė gauna
tiksliai skaitmens rašmens plotį ir tą patį centrą — ašis 648, vertikalė 57 % žemyn:

| finišas | skaičiaus ink | pavardės ink | pavardės kegelis |
|---|---|---|---|
| Stadium Night | 788×738 | 788×231 | 264.1 |
| Chrome All-Star | 954×746 | 956×252 | 211.1 |
| Fire & Smoke | 840×741 | 841×318 | 215.8 |
| Heritage | 999×745 | 1001×287 | 233.4 |
| Signature Spotlight | 981×758 | 983×290 | 251.6 |
| Prism Rush | 1021×724 | 1022×310 | 180.3 |

**Kodėl ne kadro pločio dalis.** Pirmas bandymas rišo pavardę prie kadro (0.92 × pločio).
Telefono fone kompozicija padidinta 1.058×, tad pavardė išsipūtė iki **98 % kadro** ir
nubėgo per abu kraštus bei per apačios patamsinimą. Rišant prie skaitmens ji niekada
neišlipa ten, kur neišlipa skaičius, ir perjungiant variantą niekas nepajuda.

Tuo pačiu Stadium Night skaitmuo grąžintas ant ašies (centras buvo nuklydęs į 611, kai
ašis 648; kituose penkiuose buvo tiksliai).

**Replikų sinchronizacija.** Print eksportas, Grid 1 ir Proof turėjo mažesnį vardo
šriftą nei etalonas (`MARCUS` 105 vietoj 129, `ELLISON` 176 vietoj 244.4, tarpaeilis
21 vietoj 88) — iš to ir 110 vnt. poslinkis žemyn. Suvienodinta su `Poster · Stadium
night hero`.

**Padengta:** 132 kadrai (21 + juosta + trio kiekviename iš 6 puslapių). Nepaliesti tik
`SOCIAL · Profile picture` ir `Cutout_Hero_PNG` — juose vienas herojaus laukas, ne trys.

### 14.2 · Rezoliucija: ką iš tikrųjų reikia upscalinti (išmatuota 2026-08-24)

Šaltinio dydžiai: iškarpos **1696×2528**, fonai **2732×4096**, herbas 2048×2048, QR 600×600.
Efektyvus DPI = 300 × natūralus plotis / padėtas plotis.

| Gamybos failas | Žemiausias efektyvus DPI | Reikia upscale? |
|---|---|---|
| PRINT EXPORT posteris 5400×7200 | **123** (`#photo_2`) | **TAIP** |
| PRINT kortelė FRONT 816×1110 | 719 | ne |
| PRINT kortelė BACK 816×1110 | 621 | ne |
| Sertifikatas 2550×3300 | 600 | ne |
| Pakuotė FLAT 2032×1560 | 403 | ne |

Posterio tempimai: `#background` 1.98× (152 DPI), `#photo_3` 2.23× (135),
`#photo_main` 2.16× (139), `#photo_2` 2.43× (123). Herbas 590 DPI — tvarkoje.

**Reikia: fonas ×2, iškarpos ×2.5.** ⚠️ CLAUDE.md sakė „4× upscale" — tai buvo drobės
mastelis (1296 → 5400), ne paveikslėlio. Pagal tikrus pikselius užtenka 2–2.5×.

**Upscale daromas TIK eksportuojant, ne šablone.** Priežastis skaičiais: iškarpa ×2.5 =
6.25× daugiau pikselių, fonas ×2 = 4×. Sunkios versijos reikia **6 kadrams iš 132**
(po vieną print posterį stiliuje), o šablonas dubliuojamas 17 sporto failų. Laikyti jas
šablone reikštų kelis kartus sunkesnius failus dėl 4.5 % kadrų.

Eiga užsakymui: šablonas lieka natūralios rezoliucijos → užsakius, TIK to stiliaus print
posteryje pakeičiamas nuotraukos užpildas upscalinta versija → eksportas 5400×7200 →
failas atmetamas. Kortelės, sertifikatas ir pakuotė eksportuojami tiesiai.

**`npm run art:upscale`** (pastatyta 2026-08-24, `art-pipeline/lib/upscale.py`).
Tikslinius dydžius skaičiuoja iš IŠMATUOTŲ maketo matmenų, ne iš akies:

    npm run art:upscale -- --athlete basketball --check
    layer    native     target  factor  dpi on poster
    hero     1696x2528  3850px  2.27x   139 -> 315
    action2  1696x2528  4335px  2.56x   123 -> 315
    action3  1696x2528  3968px  2.34x   135 -> 315

Variklių grandinė: `realesrgan-ncnn-vulkan`/`upscayl-bin` (jei yra kartu su savo
`models/`) → `.onnx` per onnxruntime iš `art-pipeline/models/` → Lanczos + unsharp.
Paskutinis yra sąžiningas atsarginis: pikselių kiekis teisingas, detalės — ne, ir
įrankis tai pasako pats.

Du dalykai, kurie įrašyti į kodą, ne į gerus ketinimus:
- **Alfa niekada neina pro modelį.** Iškarpos yra RGBA; ML upscaleris prigalvotų
  kraštą, kurį BiRefNet jau nusprendė. RGB per modelį, alfa perdiskretizuojama.
- **Vienas 4× praėjimas, tada sumažinimas iki tikslaus dydžio** (kaip
  `print-sources/MANIFEST.md`). Antras praėjimas dvigubina modelio prigalvotą faktūrą.

⚠️ **Trūksta tik modelio.** `realesrgan-ncnn-vulkan` šitame kompiuteryje BUVO — liko
12 avarijų ataskaitų 2026-08-19, ir `MANIFEST.md` saugo receptą (`realesrgan-x4plus`,
single pass, cap 4096). Krito su SIGSEGV iškart po starto, o tai ncnn binaruose
beveik visada reiškia nerastą `models/` aplanką. Todėl `find_binary()` dabar
reikalauja ir binaro, IR modelių — kitaip praleidžia jį su įspėjimu, o ne leidžia
kristi.

Po upscale'o herojų būtina praleisti pro `npm run art:identity` — upscaleris
prigalvoja detalių veide, o taisyklė „tas pats žmogus" turi likti matavimu.

### 14.3 · Kortelės nugaros skaitmuo — sluoksnių tvarka (2026-08-24)

**Teisinga tvarka: `#card_bg → #back_photo → photo_overlay → #number_ghost`.**
Ghost'as sėdi VIRŠ perdangos. Master faile (`KzdEYF1UD9EnsczY8Kpyxi`) taip ir yra:
`#card_bg → photo_overlay (gradientas 90/84/66/80/90 %) → #number_ghost` (baltas 20 %).
Perdanga skirta prislopinti nuotrauką, o ne skaitmenį.

Kopijoje vėliau įdėtas `#back_photo` pertvarkė eiliškumą ir **Stadium Night bei Chrome
All-Star** perdanga atsidūrė virš ghost'o — baltas 20 % po 100 % gradientu tampa
nematomas. FS, HE, SS ir PR buvo teisingi. Pataisyta 14 kadrų (abiejų finišų etalonas,
print, proof, Grid 3, Story 3, CardFlip_Back, MotionSpec).

Patikrinta pikseliais: skaitmens srities p95 89.3 prieš vietinę medianą 60.7 —
brūkšnių pakylėjimas 28.7, kai kairėje nuo jo mediana 15.3. Skaitmuo skaitosi.

⚠️ Trys spąstai, kuriuos šis vienas defektas atskleidė:
1. `figma.variables.setBoundVariableForPaint()` **numeta `opacity`** — susiejus kintamąjį
   su dažu, opacity nustatyk iš naujo ir patikrink.
2. `insertChild(idx, node)`, kai `node` jau yra tame pačiame tėve ir žemiau `idx`,
   grąžina jį į tą pačią vietą. Norint pakelti A virš B, **nuleisk B po A**.
3. Kontrasto matavimas „sritis prieš kaimyninę sritį" meluoja, kai abi dengia ta pati
   tamsi nuotrauka. Matuok brūkšnių pakylėjimą prieš VIETINĘ medianą.

Print nugara turi du art lygius: kadro lygyje bleed'o versijos (`#card_bg (bleed)`,
`#back_photo`, `photo_overlay (bleed)`), viduje — 744×1042 apkarpytas rėmelis su savo
pilnu stacku. Bleed'as negali gyventi apkarpytame rėmelyje, todėl dubliavimas čia yra
sąmoningas.

### 14.4 · Heritage skaitmuo — vienas receptas visur (2026-08-24)

Heritage kortelės skaitmuo nesutapo su posterio: tarpraidis **−10** vietoj −4, **du**
efektai vietoj trijų (trūko gilaus `DROP_SHADOW r50 o(24,30) a50`), o varsity šešėlis
buvo **to paties dydžio** kaip skaitmuo, tad poslinkio išvis nesimatė.

Posterio receptas (etalonas, `HE / AIR`), efektai normalizuoti pagal `fontSize`:

| dalis | reikšmė |
|---|---|
| tarpraidis | −4 % |
| INNER_SHADOW | r 0.03079 · o(0.01895, 0.01895) · a 0.75 juodas |
| DROP_SHADOW | r 0.00474 · o(−0.00592, −0.00592) · a 0.30 **baltas**, behind |
| DROP_SHADOW | r 0.05922 · o(0.02842, 0.03553) · a 0.50 juodas, behind |
| blokinis šešėlis | `fontSize × 10/9`, tas pats tarpraidis, be efektų |
| šešėlio poslinkis | centras −0.0748 × skaitmens ink aukščio X, −0.0083 Y |
| šešėlio tankis | 1.667 × skaitmens efektyvaus tankio |

Pritaikyta **15 kadrų**. Kiekvienas laiko SAVO dydį ir matomumą — perkeltas tik
apdorojimas. Pakeliui paaiškėjo, kad ekrano fonuose šešėlio santykis buvo pasklidęs
nuo 1.23 iki 1.773 — tai atrodo atsitiktinumas, ne sumanymas, todėl visi suvienodinti
į 10/9.

Taisyklė bendresnė nei Heritage: **finišo ghost apdorojimas yra vienas receptas,
proporcingas kegeliui.** Dydis priklauso nuo paviršiaus, apdorojimas — ne.

### 14.5 · Baigiamasis suvienodinimas (2026-08-24)

Klientas rankomis sutvarkė SN, CA, FS ir HE hero komponentus — praplėtė ghost'us
tarpraidžiu (SN AIR +12, FS AIR +10, CA TIGHT +9) ir padidino kortelių pavardes iki
86–95 % pločio, kad geriau matytųsi už figūrų. SS ir PR suvienodinti pagal tų keturių
medianą: AIR vertikalė 54 %, TIGHT 51 %, SS kortelės pavardė 75 % → 86 %.

**Ištaisyta:**

| Defektas | Kiek | Kas buvo |
|---|---|---|
| Dvigubi skaitmenys ekrano fonuose | 9 kadrai | kadro `#number_ghost` + kompozicijos `#number` vienu metu (PR 8, SS 1) |
| Prism Rush echo sluoksniai laužėsi | 16 sluoksnių | `textAutoResize: NONE` siauroje dėžėje — „ELLISON" į dvi eilutes (314×253 vietoj 701×164) |
| Vardo blokas nesutapo su etalonu | 12 replikų | CA/SS/PR nusileidęs 110–190 vnt., FS/HE kito aukščio; šriftas replikoje mažesnis |
| Kompozicija nesutapo kortelėse | 17 replikų | FS pastumta 30 vnt., HE 37/32 ir kito dydžio |
| Grid 1 vardo bloko plotis | 3 kadrai | 496 vietoj 633 — auto-layout counter ašis nebuvo perskaliuota |
| Figūros kirtosi už kadro | 12 kadrų | iki 70 px; pataisyta paslinkus, mastelio keisti neprireikė |

**Būsena:** 138 kompozicijos (po 23 kiekviename finiše), 0 dublikatų, 0 nukirstų figūrų,
0 replikų nuokrypių. Likę 12 „laisvų" nuotraukų laukų yra `SOCIAL · Profile picture` ir
`Cutout_Hero_PNG` — po du kiekviename finiše, ten vienas herojaus laukas, ne trys.

⚠️ Du matavimo spąstai, į kuriuos įkritau ir kurių verta vengti:
- „Figūros nukirstos" tikrinta pagal įsimintas konstantas; kai klientas judina nuotraukas
  komponente, jos pasensta. Persimatavus iš komponento (L 191.2, R 1239.2) paaiškėjo, kad
  sutampa — bet tikrinti reikėjo PRIEŠ, ne po.
- Proof ir MotionSpec kadruose greta guli posteris, priekis ir nugara. Dublikatų
  ieškiklis juos rodo kaip pažeidimą — tai klaidingas signalas, ne defektas.

### 14.6 · Prism Rush echo poslinkiai (2026-08-24)

Statistikos langelio „7.1" echo sluoksniai buvo **abu nustumti į kairę ir nesimetriški**
(magenta −9, cyan −15), kai „18.4" ir „4.6" turėjo tvarkingus ±3. Priežastis: echo yra
atskiri teksto sluoksniai, padėti ranka; kai reikšmė tapo siauresnė, jie liko ten, kur
tiko platesniam skaičiui. Tas pats kartojosi visose replikose.

Pataisyta 22 grupėse. Metodas, kurį verta pernaudoti: **kiekvienas echo poruojamas su
broliu, turinčiu TĄ PATĮ tekstą**, ir centruojamas ant jo ±poslinkis, o ne laikomas
savo absoliučioje pozicijoje. Statistikos langeliams poslinkis = `0.0679 × fontSize`
(iš tvarkingų „18.4" ir „4.6"). Pakeliui rastas ir „MARCUS" darbalaukio fone: buvo
(+10, −2), dabar (+6, −6).

⚠️ Taisyklė: **kiekviena reikšmė, kuri keisis su užsakymu (skaičiai, vardai), su savimi
neša echo sluoksnius, kurie NEPERSICENTRUOJA patys.** Keičiant atletą tai reikia
perleisti — kitaip trumpesnė pavardė ar kitas skaičius vėl „nubėgs".

### 14.7 · Vardo bloko echo replikose (2026-08-24)

Prism Rush `SOCIAL · Grid 1` vardo blokas atrodė purvinas: „ELLISON" echo sluoksniai
buvo skirtinguose aukščiuose (magenta y171, cyan y174 prieš etalono vienodą y199), o
cyan dar ir VIRŠ balto teksto. Skilimas skaitėsi kaip įstrižas šešėlis, ne kaip RGB.

Priežastis: echo yra **`layoutPositioning: 'ABSOLUTE'`** vaikai auto-layout rėmelyje.
Ankstesnis vardo bloko perkėlimas tvarkė rėmelio poziciją ir teksto kegelį, bet
absoliučių vaikų x/y ir sluoksnių eiliškumo — ne. Auto vaikai gauna vietą iš maketo,
absoliutūs — ne, todėl jie lieka kur buvo.

Dabar replikos vardo blokas kopijuoja iš etalono: absoliučių vaikų x/y × k, jų
`layoutPositioning` ir **visą sluoksnių eiliškumą**. Iš šešių stilių to prireikė
vieninteliam kadrui — likusieji sutapo.

⚠️ Perkeliant bet ką iš etalono į repliką tikrink tris dalykus, ne vieną: **geometriją,
absoliučią poziciją ir z tvarką.** Pirmieji du gali sutapti, o trečias vis tiek sugadins
vaizdą — spalva atsiduria ne toje pusėje.

### 14.8 · Etalonas → replikos, pilnas perkėlimas (2026-08-24)

Klientas sutvarkė `01 · HERO & TEMPLATES` sekcijos etalonus visuose šešiuose finišuose
ir paprašė, kad viskas, kas iš jų plaukia, būtų suvienodinta, o jo paties sudėlioti
kadrai (ekrano fonai, Story 1, ReelCover, PFP, juosta, pakuotė, sertifikatas) liktų
neliesti.

**Replikos apibrėžimas** (tik šie sinchronizuojami): `PRINT · Card FRONT/BACK`,
`PRINT EXPORT · Poster`, `Proof_Watermarked`, `SOCIAL · Grid 1/2/3`, `SOCIAL · Story 2/3`,
`CardFlip_Front/Back`, `CardFlip_MotionSpec`. Iš viso **96 replikos**.

Perkeliama iš etalono, mastelis `k = replikos plotis / etalono plotis`:
geometrija, dydis, `layoutPositioning`, absoliučių vaikų x/y, matomumas, opacity,
šrifto kegelis, `lineHeight`, `letterSpacing`, `textAutoResize`, `textAlign`,
efektų spinduliai ir poslinkiai, užpildo permatomumas, **kintamųjų sąsajos** ir
sluoksnių tvarka. Neliečiama: paties replikos rėmelio pozicija ir dydis (jie priklauso
savo kadrui) ir komponentų instancijų vidus (jį lemia komponentas).

**Rezultatas:** 301 pakeitimas 62 kadruose; galutinis patikrinimas — **96 replikos,
0 skirtumų.**

Trys tikri defektai, kuriuos šis perėjimas atidengė:
1. **Heritage replikose trūko `#first_name`** — print eksporte, proof ir Grid 1 nebuvo
   „MARCUS", o `#athlete_name` buvo pririštas prie `fullNameUpper` vietoj `lastNameUpper`.
   T. y. replikos naudojo VIENOS eilutės pilną vardą, kai etalonas skyla į dvi. Ištaisyta.
2. **SN kortelės nugaros ghost'as** replikose buvo 0.05, etalone 0.20.
3. Skirtingi `autoResize`, kegeliai ir efektų spinduliai daugelyje kortelių nugarų.

⚠️ **Sąsajų (`boundVariables.characters`) sinchronizuoti nepamiršk.** Pirmas perėjimas
lygino kegelius ir geometriją, bet ne sąsajas — todėl Heritage replikoje atsirado
„MARCUS" + „MARCUS ELLISON": pridėjau trūkstamą vardą prie teksto, kuris jau nešė pilną
vardą. Tekstas gali sutapti dydžiu ir vieta, o rodyti ne tą lauką.

⚠️ **Bleed sluoksniai nėra trūkumas.** `#card_bg`, `scrim`, `photo_overlay` ir
`#back_photo` print kortelėse gyvena KADRO lygyje (su bleed'u), o vidinis 744×1042
rėmelis neša tik apkarpytą turinį. Palyginime jie atrodo kaip „trūksta" — nėra.

## 15 · Beisbolas — pirmas sportas iš naujo šablono (2026-08-24)

Failas `baseball GDE — Hero Template` (`tL9vfpIhC5esFbXcozgAlT`) — tiksli hero šablono
kopija, tie patys komponentų ir kintamųjų ID. Atletas: **Casey Whitlock #7**, Harlow
Creek Larks, OUTFIELD · 2028, #B5451B / #F0E3D2.

### Eiga, kurią verta kartoti kitiems 15 sportų

1. **Kintamieji.** `Athlete` kolekcija + `cardId` per stiliaus modes. ⚠️ Nepamiršk
   sudėtų: `metaLine`, `frontMeta`, `playerHighlight`, `sportCode` ir statistikos slotų
   `PPG/APG/RPG` — jie neatsinaujina iš vardo/numerio ir juos lengva praleisti.
2. **Komandos spalva.** Neapdorota #B5451B ant tamsios kortelės duoda kontrastą 3.36.
   `team/primary-ink` perskaičiuotas į #D85626 → **4.65** (riba 4.5).
3. **Grafika.** 11 failų per `upload_assets` (POST grąžina `imageHash`), tada vienu
   ėjimu į visas vietas: 42 hero, 30+30 action, 48 back, 125 herbai, 196 fonai.
   Laikinus rėmelius, kuriuos palieka įkėlimas, reikia ištrinti.
4. **Kompozicija perskaičiuojama.** Aukštis normalizuotas, PLOTIS — ne:
   Casey action3 (skrydis prie kamuolio) yra **0.951** kadro pločio, kai Marcus
   action3 (varymas) — 0.270. Marcus maketas Casey netiktų: figūra driektųsi nuo −113
   iki 749 ir užgultų herojų. Naujas išdėstymas: action3 ašis 500 (mastelis 0.88),
   hero 648, action2 990.
5. **Vardas.** „WHITLOCK" ilgesnis už „ELLISON" — 244.4 pt lūžo į dvi eilutes.
   Sumažintas iki 206.3, kad tilptų į vieną. Taisyklė nesikeičia: **vardas
   netrumpinamas, mažėja šriftas.**
6. **Ghost.** Pavardė perfituota į juostą (posteris 76 %, kortelė 86 %), skaitmuo — į
   aukštį. ⚠️ **Vienženklis numeris pasislepia už herojaus**: „7" rašmuo 371 px, o
   herojaus siluetas 397 — ghost'o niekur nesimatė. Taisyklė: ghost'o plotis ≥ 1.5 ×
   herojaus siluetas.
7. **Profilio nuotrauka.** Kadras nustatytas pagal veido vietą, o Casey veidas yra
   7.7 % dešiniau ir 17 % mažesnis nei Marcus (ArcFace: cx 0.5155 vs 0.4385,
   h 0.0844 vs 0.1021). Mazgas perskaičiuotas taip, kad veidas atsidurtų ties
   (540, 515) ir užimtų 48 % kadro — kaip etalone.
8. **Replikos.** 96 patikrintos, 0 nuokrypių.

### Trys spąstai, kurie kainavo daugiausia

- **Figma pervadina teksto sluoksnį pagal turinį.** Pakeitus statistikas etalone,
  sluoksniai tapo `.341`/`AVG`, o replikose liko `18.4`/`PPG` — poriklis pagal vardą
  nustojo veikti ir sinchronizacija jų nepasiekė. Visi statistikos tekstai dabar
  pavadinti pastoviai: **`stat_value` / `stat_label`**.
- **Susieto užpildo permatomumas.** Kopija paimta prieš tą pataisymą krepšinyje, tad SN
  nugaros ghost'as buvo 1.0 vietoj 0.2 ir uždengė vardą. Pataisyta 7 kadruose.
- **„Telpa į vieną eilutę" negalioja pastraipoms.** Bendras fitteris sumažino MotionSpec
  techninį aprašą nuo 24 iki 9.4 pt ir sertifikato sakinį — abu turi lūžti. Fitteris
  dabar liečia tik `#athlete_name` ir `#first_name`.

⚠️ **Fonai buvo 848×1264**, ne 2732×4096 kaip krepšinio. Prieš įkeliant pakelti iki
1696×2528 (`art:upscale --in … --width 1696`), kitaip posteryje 1.53× tempimas.
Print posteriui vis tiek reikės tikro upscale'o.

### 15.1 · Kodėl tekstai tapo kreminiai, ir kur riba (2026-08-24)

Niekas to nesprendė — **taip išėjo iš duomenų**. Beisbolo atleto įraše
`secondaryColor` yra `#F0E3D2`, juo užpildytas `team/secondary`, o **1507 teksto
sluoksniai yra prie to kintamojo prirakinti**. Krepšinyje `team/secondary` buvo grynai
baltas, todėl skirtumo nesimatė. Kai komandos antrinė spalva nėra balta, visas failas
persidažo pats.

Klientas pasirinko palikti kreminį visur. Bet iš to plaukia **riba, kurios negalima
peržengti**: `GAME DAY EDITION · <stilius>` krepšinio faile taip pat surištas su
`team/secondary` — ten tai nekliuvo, o čia prekės ženklas taptų komandos spalva, ką
CLAUDE.md draudžia tiesiogiai. Todėl tos 42 eilutės atrištos ir laikomos sidabrinės.

Galutinė būsena: 1507 kreminiai (turinys), 196 balti (specifikacijų ir sertifikato
etiketės), 539 kiti (oranžinis `team/primary-ink`, PR echo, HE kreminis, gradientai),
42 prekės ženklo eilutės sidabrinės, 0 ant komandos spalvos.

⚠️ **Spąstas, į kurį įkritau:** valydama prekės ženklą filtravau pagal `/watermark/`,
o Proof kadras vadinasi `GDE_XX_Proof_Watermarked` — tad 804 sluoksniai, įskaitant visą
atleto turinį jame, tapo kieti balti. Atstatyta pagal krepšinio failo žemėlapį
(sluoksnio vardas → ar jis surištas su `team/secondary`). Pamoka: prekės ženklą atpažink
pagal SLUOKSNIO vardą ir tekstą, niekada pagal kadro pavadinimą.

### 15.2 · Kortelės nugaros skaitmens vieta

Klientas sudėliojo Stadium Night, iš to paimta taisyklė: skaitmuo **telpa visas**,
viršuje dešinėje, **tarpas nuo dešinio krašto 85 px iš 750 = 11.3 % pločio**, dydis
nekeičiamas. Pritaikyta likusiems penkiems finišams (poslinkiai 23–107 px).

### 15.3 · Nugaros iškarpa = herojaus mastelis (2026-08-24)

**Taisyklė:** kortelės nugaros figūra kadruojama TIKSLIAI kaip herojus priekyje — tas
pats objekto aukštis, ta pati ašis, ta pati žemės linija. Iš to gaunasi efektas, kad
abiejose kortelės pusėse atpažįsti tą patį atletą.

Buvo ne taip: nugaros figūra **40–51 % didesnė** už herojų (krepšinyje SN 1010 prieš
722, CA 1092 prieš 722), o pėdos nukirstos žemiau kortelės (bottom 1056–1145 iš 1050).

Skaičiavimas: `boxH = herojausObjektoAukštis / BACK.h`, `boxW = boxH × 1696/2528`,
`x = herojausCx − BACK.cx × boxW`, `y = herojausBottom − BACK.bottom × boxH`.
`BACK` = tos iškarpos objekto trupmenos (Marcus 0.8999/0.4997/0.9699;
Casey 0.8995/0.5003/0.9699). Pritaikyta abiejuose failuose: 6 etalonai + 42 replikos
kiekviename.

### 15.4 · Print kortelės juodas viršus — mano sinchronizacijos klaida

Replikos sinchronizacija kopijavo užpildą ir **pačiam replikos šakniniam rėmeliui**.
Etaloninė kortelė yra kadras su tamsiu fonu `SOLID[5,8,15]`, tad print vidinis rėmelis
gavo nepermatomą juodą ir uždengė kadro lygio `#card_bg (bleed)` + `scrim (bleed)`.

**Taisyklė: šakninio replikos rėmelio užpildas, pozicija ir dydis NIEKADA
nesinchronizuojami** — jie priklauso savo kadrui, ne etalonui. Sinchronizuojami tik
vaikai. Išvalyta 12 rėmelių beisbole ir 8 krepšinyje.

### 15.5 · Stadium Night nugaros patamsinimas = 70 %

Krepšinio faile klientas nustatė SN `photo_overlay` užpildą į **`@0.7`**; kiti penki
finišai lieka `@1`. Kopija paimta prieš tai, tad beisbole buvo `@1` ir nugara skendo.
Pritaikyta 8 sluoksniuose (etalonas, print + bleed, proof, Grid 3, Story 3, CardFlip,
MotionSpec).

## 16 · Sportai be numerio — taisyklė ir trys spąstai (2026-08-24)

Septyni sportai neturi marškinėlių numerio: **cheerleading, gymnastics, swimming,
tennis, golf, pickleball, pickleball-youth**. `athletes.json` juos žymi
`numberless: true`, `jerseyNumber` yra `0`.

**Taisyklė:** kur šablonas rodo numerį, be numerio sportas rodo **pavardę**. Bet ne
visur — pavardė yra plati, o numeris aukštas, tad vienas iš trijų numerio vaidmenų
paprasčiausiai išjungiamas.

| kur | numeruotas sportas | be numerio |
|---|---|---|
| `XX / AIR` (posteris) | `#number` | `#surname_ghost` |
| `XX / TIGHT` (kortelės priekis) | `#surname_ghost` | `#surname_ghost` (nesikeičia) |
| kortelės NUGARA, `#number_ghost` | didelis skaitmuo viršuje dešinėje | **paslėpta** |
| ekrano tapetai, ReelCover | jau paslėpta šablone | paslėpta |

Nugaros ghost'as slepiamas sąmoningai: pavardė toje vietoje atsiduria už statistikos
plytelių ir atleto figūros, tad matosi kaip purvas, o ne kaip ženklas. Pavardė toje
kortelėje jau yra du kartus (antraštėje ir priekio ghost'e).

Kintamieji: `jerseyNumber` ir `numberHash` = **tuščia eilutė**, `frontMeta` = pozicija
be numerio, `metaLine` = `POZICIJA · KOMANDA`. `cardId` paskutinis segmentas —
**`01`** (nėra numerio, tad tai leidimo eilės numeris, ne marškinėlių).

### Spąstai

1. **Tuščias tekstas neturi šrifto segmentų.** `getStyledTextSegments(['fontName'])`
   tuščiame sluoksnyje grąžina nieko, tad `loadFontAsync` neiškviečiamas ir pirmas
   `fontSize` priskyrimas krenta su „unloaded font Anton Regular". Visada papildomai
   įkelk patį `node.fontName`, kai jis ne `figma.mixed`.
2. **Kirpimas + pločio fitteris = išsibėgiojimas.** `absoluteRenderBounds` kadre su
   `clipsContent` grąžina tik MATOMĄ dalį. Tekstas, kyšantis pro dešinį kraštą, matuojasi
   kaip siauras ruoželis → fitteris jį didina → ruoželis dar siauresnis. „DEVARAJAN"
   išaugo iki **5902 pt ir 25 098 px pločio**. Prieš matuojant išjunk `clipsContent`
   visiems protėviams ir po to grąžink.
3. **Tuščias numeris palieka skyriklį.** `meta` eilutė yra auto-layout `#number` + `·` +
   `#position`. Ištuštinus numerį lieka kabantis taškas: kortelėje buvo „· SINGLES".
   Slepiant `#number` reikia paslėpti ir jį sekantį `·` (98 sluoksniai tenise).

### 16.1 · Replikų sinchronizacija ir auto-dydžio tekstas

Sinchronizacija nesuartėdavo į nulį: 238 „size" skirtumai kartojosi kiekvienam ėjimui.
Priežastis — `WIDTH_AND_HEIGHT` tekstas savo plotį/aukštį pasiskaičiuoja pats, tad
`resize()` iškart atšaukiamas ir kitas ėjimas vėl mato skirtumą. Ta pati problema su
auto-layout vaikais: `x/y` jiems priklauso tėvui.

Sinchronizuok tik tas ašis, kurias mazgas TIKRAI valdo:
- auto-layout vaikas (ne `ABSOLUTE`) — nei `x/y`, nei `FILL`/`HUG` ašies;
- `TEXT` su `WIDTH_AND_HEIGHT` — nei pločio, nei aukščio;
- `TEXT` su `HEIGHT` — tik plotį.

Su šiomis sąlygomis 58 replikos kiekviename faile suartėja į **0 skirtumų per du ėjimus**.

## 17 · Visi 23 sporto failai pastatyti (2026-08-24)

| failas | atletas | numeris | pastaba |
|---|---|---|---|
| basketball | Marcus Ellison #12 | ✓ | hero šablonas, neliestas |
| baseball | Casey Whitlock #7 | ✓ | §15 |
| wrestling | — | ✓ | |
| volleyball | — | ✓ | |
| track-field | Imani Whitfield #8 | ✓ | tekstas #f0efea |
| tennis | Arun Devarajan | — | pirmas be numerio, §16 |
| swimming | Nora Lindqvist | — | |
| softball | Brooke Danner #3 | ✓ | |
| soccer | Mateo Herrera #10 | ✓ | |
| soccer-age-07 | Finn Halloran #4 | ✓ | fonas iš soccer |
| soccer-age-10 | Ava Nakamura #9 | ✓ | fonas iš soccer |
| soccer-age-22 | Sienna Okafor #7 | ✓ | fonas iš soccer |
| soccer-age-32 | Danny Voss #6 | ✓ | suaugęs — CLASS OF paslėpta |
| soccer-age-50 | Teresa Aguilar #11 | ✓ | suaugęs — CLASS OF paslėpta |
| pickleball | Ray Solberg | — | suaugęs + be numerio |
| pickleball-youth | Nadia Rahimi | — | serija **02** (PKB-01 užimta) |
| other-sport | Sam Okonkwo #12 | ✓ | riedlentė |
| lacrosse | Reese Callahan #22 | ✓ | |
| ice-hockey | Nolan Reid #17 | ✓ | tekstas #eaecf0 |
| gymnastics | Sofia Marchetti | — | tekstas #eaedf0 |
| golf | Hana Park | — | |
| football | Tui Fa'agata #54 | ✓ | |
| cheerleading | Amara Boyd | — | |

Kiekviename: 6 puslapiai × (1 posteris + kortelė priekis/nugara + print + proof + social +
tapetai + bonus), **58 replikos suartintos į 0 skirtumų per du ėjimus**, 6 profilio
nuotraukos perkadruotos pagal veidą, 48 nugaros iškarpos herojaus masteliu.

### 17.1 · Suaugęs atletas neturi laidos metų

`classOf` tuščias → **paslepiama visa pora** (`CLASS OF` etiketė + reikšmė), o ne
paliekamas tuščias laukas. SEASON lieka vienas eilutėje — atrodo sąmoningai, ir niekas
neišgalvojama. 96 sluoksniai kiekviename iš dviejų failų.

### 17.2 · Skrendantis herojus — nugaros iškarpai reikia grindų

Taisyklė „nugaros figūra = herojaus mastelis" (§15.3) matuoja herojaus objekto AUKŠTĮ.
Toe-touch šuoliui (cheerleading `h = 0.333`) ir gimnastikos šuoliui (`h = 0.54`) tai
neteisinga: figūra plati, bet žema, tad nugara susitraukdavo iki **249×371 px** 750×1050
kortelėje — mažas siluetas kortelės viduryje.

**Pataisa:** nugaros objekto aukštis = `max(herojausAukštis, 0.55 × kortelės aukščio)`.
Normaliems sportams herojus jau yra 0.70–0.78 kortelės, tad riba nieko nekeičia; dviem
oro sportams ji grąžina kortelinį svorį (431×642). Ašis ir žemės linija nesikeičia.

### 17.3 · Kortelės ID be numerio

Be numerio sportams paskutinis segmentas yra leidimo eilės numeris, ne marškinėlių:
`GDE-XX-TEN-2026-01`. Kai to paties sporto kode yra du atletai (PKB: Ray ir Nadia),
antras gauna **02** — kitaip du skirtingi žmonės turėtų vienodą kortelės ID.

### 17.4 · Ką dar reikia peržiūrėti akimis (šaltinio grafika, ne maketas)

Prekės ženklai, kurie prasprūdo į iškarpas (README §40 — dažniausias defektas):
- **lacrosse** — New Balance ženklas ant herojaus marškinėlių
- **ice-hockey** — CCM ant šalmo, pirštinių ir lazdos
- **soccer-age-22** — Under Armour tipo ženklas ant herojaus marškinėlių
- **soccer-age-50** — „swoosh" ant kojinių/šortų palaikomosiose pozose
- **swimming** — action2/action3 maudymosi kostiumėlio herbas NE toks kaip herojaus

Identity-gate vėliavos, kurios buvo žinomos ir liko: swimming action3 **0.185**,
ice-hockey action2 **0.287**, softball action2 **0.330** (riba 0.36).

Nė vieno iš jų maketas neištaiso — reikia `npm run art:fix` su viena pataisa
(README §29), o tai kainuoja generavimą.
