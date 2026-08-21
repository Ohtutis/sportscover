# Athlete roster — handoff

Written 2026-08-21, at the end of the session that finished the soccer age ladder and built
the first two roster athletes. **Read `art-pipeline/README.md` first** — this file only
records what changed, what is done, and what the next person walks into.

## 1. Where the roster stands

| set | athletes | state |
|---|---|---|
| Age ladder (soccer, one club) | 07, 10, 15, 22, 32, 50 | **complete, 7/7 approved each** |
| Roster — basketball | Marcus Ellison, Cedar Ridge Bears | **complete, 8/8 approved** |
| Roster — football | Tui Fa'agata, Millbrook Bison | **built, 0/8 approved — waiting on a human** |
| Roster — remaining 14 | see `athletes.ts` | not started |

`npm run art:approve -- --athlete <slug> --list` is the truth for any athlete.

**The football pack is deliberately left open.** Approval is a human act; everything was
generated and audited but nothing was signed off. Start there.

## 2. The pack is now EIGHT frames, not seven

`_kit-back` was added. The from-behind pose used to invent the back of the shirt on every
roll, and it damaged three sets in one day — soccer-22 lost its white shoulder panels,
soccer-32 grew a crest above the number, soccer-50 grew two of them inside the numerals.
It is the same fix `_identity-back` already was: the back gets its own plate, and the `back`
pose reads from it. Since it exists, every from-behind frame has been right first roll.

## 3. The runbook order CHANGED — crest now comes first

```
crest  →  before photos (the match frame WEARS the crest)  →  intake  →  SPEC ← audit by hand
       →  _kit + _kit-back  →  _identity + _identity-back  →  4 poses  →  orient  →  gate  →  QA
```

The crest used to arrive three stages later, at the kit plate. So the match snapshot had no
badge to copy, invented one ("EAGLES", "WILDCATS"), and then the plate stamped a different
badge on the same athlete. The soccer ladder hid this because all six shared one club and a
nearly plain shirt; seventeen clubs would show it every time.

## 4. The rule that decides most of this work

**The photograph outranks the prose.** `kitPlatePrompt` used to say the photos were attached
"only so you can SEE the items the list above names", which put a written description in
charge of how a garment looks. Fifteen plate re-rolls went into sentences like "a short
vertical white binding along the slit in the outside seam", and a hand-written description of
one football helmet still got the shell and the facemask the wrong way round.

The split that works:

- the **spec** decides WHICH items exist, whether they are branded, and anything the camera
  could not see. It is frozen and edited BY HAND, never re-resolved with `--force`.
- the **match photograph** decides what the garments look like — cut, collar, sleeve length,
  where panels and trim run, the colours, the numerals, the badge and where it sits.

## 5. Other changes made this session

- **`Sport.place`** — the snapshot scenarios were written in soccer nouns (pitch, touchline,
  kick-off, a goal at the far end) and the basketball athlete's training frame came back as a
  boy playing football. Scenarios are sport-neutral now and take their venue word from the sport.
- **`Sport.plateItems`** — the flat lay asked for five items, so football's helmet and shoulder
  pads simply did not appear. Football declares them; other sports may need it too.
- **`FRAME_EXPRESSION`** — expression is assigned per frame index, exactly one open laugh per
  set. "Vary it across the set" was a request the system could not keep, because the four
  scenarios are chosen independently and nothing counted open mouths.
- **Scenario pool 3/3/2/2 → 5 each** — with two training scenarios, half the roster got the
  same frame.
- **The squad number is stated in the match snapshot** — it was invented before, so the photo
  and the athlete's own card disagreed (Marcus wore 12 in his photos and 11 on his record).
- **One hair description for both identity plates** — the front read the frozen spec and the
  back read the `athletes.ts` record, so soccer-22's anchor had two different hairstyles.
- **Count first, then describe** — "BOTH shoes" was read as "both pairs" and produced four
  boots. "EXACTLY TWO SHOES IN THE WHOLE FRAME, never two pairs" fixed it on the first roll.
- **Sleeves and graphics on their own lines** in `posePrompt` — buried in a paragraph they
  lost every time (a short-sleeved plate came back sleeveless, an ornate lettered shield
  appeared where the club badge was attached). This pattern has now worked four times: a rule
  in its own line wins, the same rule mid-paragraph loses.
- **Two QA rubric contradictions fixed** — the plate banned "numbers" while specs require a
  squad number, and `crest_placement` hardcoded "left chest" and failed football's crest,
  which its own photograph places centred high.

## 6. Pose sets

`poses.ts` now has hand-written sets for **ice-hockey, soccer, basketball, football**. The other
13 sports fall back to the generic set, and `gen-athlete.ts` prints a warning the code itself
ends with "Do not ship it." **Write the set before generating that athlete.**

Two things the football set is worth reading for:

- **Research the position, not just the sport.** Number 54 with a lineman's body is not a
  quarterback, but `sports.ts` carries a generic `backPose` of "cocked back mid-throw". A
  throwing pose on that body is the same class of error as a footballer in the basketball frame.
- **If the sport covers the face, the hero must not.** The helmet is carried, not worn. The
  whole product is that a parent recognises their own child; the two supports are muted to
  ~0.45, so a helmeted silhouette costs nothing there.

## 7. Numbers to judge an athlete by

`npm run art:identity -- --athlete <slug>` — plate against the four source photos. Check that
the plate sits in the MIDDLE of the set, not that it clears the threshold.

| athlete | mean | note |
|---|---|---|
| football | 0.731 | strongest anchor built so far |
| soccer-50 | 0.668 | |
| soccer-32 | 0.651 | |
| soccer-22 | 0.649 | |
| basketball | 0.585 | weakest; leans to the portrait frames |

The match frame reliably fails the face-size check (150–270 px across four athletes). That is
what a sideline photo is; the frame exists for the KIT, and intake only needs 3 of 4.

## 8. Model choice

`GEMINI_IMAGE_MODEL` switches it; no code change, and the model is part of the cache key, so
switching re-renders rather than serving a stale file. Measured on the August bill:
**pro €0.0001053/token vs flash €0.0000526 — flash is exactly 2× cheaper**, roughly €0.12 vs
€0.06 an image.

One A/B was run, on the basketball "before" photos:

- flash held identity BETTER (intake passed; pro's set was rejected, one frame at 0.42 against
  the others' 0.60)
- flash's frames looked more composed — a defect for this stage, whose whole job is to look
  like an ordinary phone photo
- flash invented "WILDCATS 24" on a jersey
- on the crest, pro reproduced the spec exactly and flash drifted (hollow comet head, two
  streaks instead of three)

Not enough evidence for a policy. The demo roster is only ~€13–26 either way; the number that
matters is per ORDER (7–14 images), which is why it is worth measuring before orders exist.

## 9. Audit EVERY frame before generating the next

`npm run art:qa:athlete -- --athlete <slug> --pose <id>` grades one frame. The `--pose` flag
already existed and was not being used: the whole athlete was generated and only then judged,
so a crest that drifted in the hero was not caught until three more frames had been built on
top of it. Generate one frame, audit it, and only then move on.

## 10. The football crest position — unresolved, and worth reading

The spec places the badge centred high on the chest, which is where the athlete's own match
photograph shows it. The hero and the block frame kept putting it on the wearer's left chest.
Four things were tried, in this order, and the first three failed:

1. deferring placement to the plate in `posePrompt` — no effect
2. removing the hardcoded "POSITION: on the wearer's LEFT chest" — no effect
3. an absolute spatial rule in its own line, no alternatives named ("on the vertical
   centreline, equal jersey either side") — no effect
4. **looking at the plate** — and the badge is not centred THERE either

So the poses were faithful all along: they copy image 3, and image 3 is where the deviation
happened. The lesson is the one this pipeline is built on and it was nearly missed again —
when copies disagree with the intent, check the ANCHOR before rewriting the instructions to
the copies. The fix is a `_kit` re-roll, after which the poses inherit it for free.

One prompt bug WAS found on the way and is worth keeping: the placement line had been written
as "left chest, centred, wherever that is". Naming the unwanted option, even to dismiss it,
hands the model a menu and it takes the first item.

## 11. Open items

1. **Football's `_kit` badge is not where the spec puts it.** Re-roll the plate until the badge
   sits centred high on the chest, then re-roll the four poses, which inherit it. Or decide the
   left chest is fine — it is where real football badges usually sit — and correct the spec
   instead so nothing is left arguing with anything.
2. **Approve or reject the football pack** (0/8).
2. **Re-run football QA** after the two rubric fixes; the previous 0/4 was mostly rubric, not art.
   Verified by eye: the cleats are plain black (the judge read leather seams as three stripes)
   and action2's facemask is dark green (the white is the chin strap).
3. **13 pose sets** still to write, one per remaining sport.
4. **The club strip differs between the six ladder athletes** — each was resolved from its own
   photos, so Sunfield Kestrels has five different shirts. 07 and 10 are approved that way.
   Decide whether the timeline needs one strip.
5. **Site copy still says 25 cards** (`app/site-client.tsx:80` and `:537`, `lib/registry/cards.ts`)
   while the pack is 10.

## 12. Session 2026-08-21 (naktis) — kur kas stovi

**Užbaigti ir 8/8 patvirtinti:** basketball, football, ice-hockey (perdarytas nuo A iki Z su
nauju klubu **Northgate Anvils** — priekalas keystone formoje, nes Ironhawks vanagas dubliavosi
su Kestrels), soccer + visos 5 soccer amžiaus pakopos, **baseball** (naujas: Harlow Creek Larks,
vieversys rombe, degintos oranžinės), **softball** (naujas: Bell Hollow Wrens, karetaitė
apvalintame kvadrate, kaštoninė). Softball action2 veido gate'as 0.33 (riba 0.36, veidas 0.5%
kadro, profilis po vizoru) — priimtas sąmoningai, hockey precedentas.

**Vyksta:** volleyball (Jaslene Ocampo #5, Fox Hollow Anchors — inkaras apskritime jau
sugeneruotas, pozų rinkinys parašytas: šuolio smūgis prieš kontaktą + žemas dig + ramus back).

**Nauji įrankiai/vartai šią sesiją:** `art:fix` (+`--ref`), `art:spec:verify`,
`matches_kit_photo` (auditorius mato photo2), `no_league_mark`, plokštelės savikontrolė +
pozų atsisakymas FAIL plokštelės, `NO_MIRRORED_TEXT`, pilno ilgio kelnių taisyklė (§31).
Prekės ženklų politika apversta kliento sprendimu: **tikri ženklai, matomi jų pačių
nuotraukose, LIEKA; niekas nekuriama** ant daiktų, kurių nuotraukos nerodo.

**poses.ts buvo sunaikintas ir atstatytas** (open("w") trunkacija prieš exception;
atstatyta iš pokalbio + prompt sidecar'ų). Failo antraštėje — taisyklė skriptams:
suskaičiuok turinį PILNAI, tik tada atidaryk rašymui.

**Žinomi priimti nuokrypiai:** hockey marškinėlių siūlės plokštelėje; softball lopo
proporcija hero kadre (aukštesnis nei kvadratas); baseball action3 planketė nesimato
(kampas). Visi trys — kliento sprendimu „neverta perdaryti".

## 13. Volleyball (2026-08-21 naktis) — 8/8 patvirtinta, su vienu atviru klausimu rytui

Jaslene Ocampo #5, Fox Hollow Anchors (inkaras apskritime). Visa grandinė pagal runbook'ą:
spec patikrintas prieš nuotraukas (verifikatorius pagavo dvi MANO klaidas — kanto ir batų
spalvas; o dėl šoninio kanto teisėjas suklydo pats ir zoom'as jį atstatė), plokštelės su
tikrais ženklais (kelių apsaugų ir batų), 4 pozos: hero, šuolio smūgis (dešinėn), dig
(kairėn), ramus back.

**ATVIRAS KLAUSIMAS — identity gate NEPRAEINA:** plokštelė vs visas 4 nuotraukas kerta 0.36
ribą — v2 (su apgamu): vid. 0.296 (0.253–0.358); v1 (be apgamo) dar blogesnė: vid. 0.282.
Apgamo edit'as panašumą kiek pagerino, bet pati plokštelės generacija matuojasi kaip "panaši
mergina", ne "ta pati" — būtent tai, ko akis nepagauna, o gate'as pagauna. Pozos vs plokštelę
visos praeina (0.44–0.65), t. y. setas vidinai vieningas, tik inkaras silpnas prieš šaltinio
nuotraukas. **Rekomendacija rytui:** perrolinti `--stage identity --from-photos auto` kelis
kartus (kandidatai kaupiasi _versions), rinktis pagal `art:identity` skaičius, tada
regeneruoti 4 pozas nuo naujos plokštelės (~8 kadrų kaskada). Jei akimis "ta pati" — galima
ir priimti sąmoningai, bet skaičiai dabar sako ne.

**Žinomas priimtas nuokrypis:** action2 cutout `pieces 2` — tai kamuolys ore, atskira sala
PNG'e; kompozicijai tai ne defektas, o `pieces` taisyklė gaudo amputuotas galūnes. Jei
norėsis švaros — cutout checker'iui reikia "kamuolys gali būti atskira sala" išimties.

**Nauja pamoka (fix-one-thing riba):** pozos GALŪNĖ nėra "daiktas" — art:fix rankos
padėties nepakeitė dviem bandymais. Kūno pozą keičia tik re-roll'as su geresniu aprašu.

## 14. Du sprendimai, priimti 2026-08-21 pabaigoje (dar NEĮGYVENDINTI kode)

**1. Nematomas daiktas = „plain in the TEAM COLOURS", ne „plain black, unbranded".**
Kai daikto nė vienoje kliento nuotraukoje nėra (bateliai, kamuolys, šalmas), spec'e iki šiol
rašiau „plain black / plain white, unbranded". Rezultatas teisingas teisiškai, bet nuobodus:
lacrosse bateliai atėjo su Under Armour ženklu ir oranžiniais akcentais, ženklą nuėmiau — ir
kartu dingo derėjimas su komandos oranžine. Taisyklė turi būti: **ženklo nekuriam niekada, bet
spalvą imam iš komandos.** Vietoj „plain black cleats" → „plain cleats in the team colours,
charcoal with amber accents, no maker's mark". Liesti reikia `kits.ts` FOOTWEAR/CONSTANTS
formuluotes ir spec rašymo įprotį.

**2. Plaukai: rakinami TIK generuotam setui, ne „before" nuotraukoms.**
Dabar spec'as sako „viena uodega visuose kadruose" ir tai galioja ir before nuotraukoms —
todėl visos keturios atrodo kaip tas pats momentas. Gyvenime mergina namie plaukus paleidžia.
Rakinimas gimė iš tikro defekto (soccer-22 dvi kasos vietoj vienos), tad jo atsisakyti negalima
— bet jis turi galioti keturioms pozoms + identity plokštelei, o before kadrams reikia leisti
natūralią variaciją (surišti / paleisti / kitaip surišti). Volleyball spec'e jau yra tokio
formulavimo pavyzdys („namie žemiau ir laisviau — ta pati viena uodega paprastą dieną").
Liesti reikia `prompts.ts` snapshot bloką ir `spec.ts` hairText.

---

# 15. SESSION 2026-08-22 — START HERE

Written at the end of the session that finished wrestling and built cheerleading and gymnastics
end to end. **If you are a fresh session picking this up, read this section and
`art-pipeline/README.md` §36–§39 first, then go straight to §16 below for the next athlete.**

## Where every athlete stands (verified 2026-08-22)

| athlete | slug | state |
|---|---|---|
| Marcus Ellison | `basketball` | 8/8 approved |
| Tui Fa'agata | `football` | **6/8 — two frames never approved** |
| — | `baseball` | 8/8 approved |
| — | `softball` | 8/8 approved |
| — | `soccer` (+ the five age-ladder slugs) | 7/8 — pre-dates the 8-frame pack |
| — | `ice-hockey` | 8/8 approved |
| — | `volleyball` | 8/8 approved |
| — | `lacrosse` | 8/8 approved |
| Dawson Pryor | `wrestling` | **8/8 approved, gates green** |
| Amara Boyd | `cheerleading` | **8/8 approved, gates green** |
| Sofia Marchetti | `gymnastics` | **8/8 approved, gates green** |
| the remaining 6 | `track-field`, `swimming`, `tennis`, `golf`, `pickleball`, `other-sport` | not started |

`npm run art:approve -- --athlete <slug> --list` is the truth. Never trust this table over it.

## What changed in the code this session

| change | file | why |
|---|---|---|
| `npm run art:diff` | `plate-diff.ts` (new) | frame beside its plate in one picture — the check that finally worked (README §36) |
| `hasFootwear()` | `kits.ts`, `check-athlete.ts`, `gen-athlete.ts` | the plate rubric demanded socks and shoes from BAREFOOT sports and failed a correct gymnastics plate |
| HANDS clause on every pose | `prompts.ts` | fingers must be natural from the first roll — the customer's standing instruction |
| `before/photoN` is editable | `fix.ts` | so a defect in a demo snapshot can be corrected without re-rolling the face anchor |
| the bow left the identity record | `athletes.ts`, `kits.ts` | a competition item in `hair` followed the athlete to the sofa and the seaside (§37) |
| gymnastics `onePiece` | `sports.ts` | a leotard is ONE garment; without it the plate invents a two-piece |
| cheerleading + gymnastics pose sets | `poses.ts` | both were on the generic fallback, which must never ship |
| cheerleading `back` pose now MOVES | `poses.ts` | the calm back frame is a rule for kits WITH a back number only (§38) |
| duplicate `plateItems` removed | `sports.ts` | softball had the key twice and it broke `tsc` for everyone |

## The four rules this session added — all in `art-pipeline/README.md`

- **§36 — check the back frame against `_kit-back`, mechanically.** Ask *what may be seen at
  all* before asking whether it is on the right side. An invented number shipped twice in a row
  because the rule existed only as a good intention; it is now `npm run art:diff`.
- **§37 — a kit item written into the identity record follows the athlete through her whole
  life.** The test for any line in `athletes.ts`: could she wear this to school on a Tuesday?
- **§38 — the calm back frame is conditional.** Number across the shoulders → calm and square.
  No number → give the frame the sport's own celebration.
- **§39 — THE PHOTOGRAPH WINS, ALWAYS.** The customer's own words: *the spec is something you
  wrote and it can drift; our main guidance is the photographs.* When `art:spec:verify` reports
  a contradiction, the assumption is that the LINE is wrong.

## Two calibration notes from the customer, worth as much as the rules

- **The goal is that nobody can tell the render from a real photograph, and that a parent sees
  THEIR child from the photos they sent.** Face, hair, body and kit are where the effort goes.
- **But a difference nobody can see is not worth an image.** Shown three versions of a leotard
  plate with the chevron's bands swapped, the customer said all three looked identical — the
  first time in the project that happened. Trim IS part of the kit and matters; the test is
  whether the difference is visible to the eye, not what kind of detail it is.
- **Hands and fingers must be natural from the first roll.** Three flagged frames were waved
  away as acceptable, together with the instruction that this must be right everywhere, always.
  That is why the requirement now lives in the prompt rather than in a repair.

# 16. THE NEXT ATHLETE — exact commands

The roster order in `athletes.ts` puts **`track-field` (Imani Whitfield, 16, Ashgrove/…)** next,
then `swimming`, `tennis`, `golf`, `pickleball`, `other-sport`.

Before the first image, answer the §32 question: **does this athlete's sex, age or level change
the equipment the RULES require?** (Women's lacrosse has no helmet; youth baseball has face
cages; swimming is a one-piece and barefoot — `onePiece` and `hasFootwear` both apply.)

```bash
# 1. crest  — look at it; distinct SUBJECT and distinct SHAPE from every existing club (§34)
npm run art:athlete -- --athlete <slug> --stage crest

# 2. the four "before" photographs, then the gate
npm run art:athlete -- --athlete <slug> --stage snapshots
npm run art:intake  -- --photos art-pipeline/out/athletes/<slug>/before      # must print OK

# 3. the spec — the resolver drafts it, YOU write it from zoomed crops of photo2/photo3
npm run art:spec        -- --athlete <slug>
npm run art:spec:verify -- --athlete <slug>     # and again after every hand edit; §39 decides ties
#    label every line that no photograph shows as "the DECISION is …" — including the BACK of
#    the garment, or the kit plate will invent a number there. It has tried on three sports now.

# 4. the kit plate, then approve it
npm run art:athlete -- --athlete <slug> --stage kit
npm run art:approve -- --athlete <slug> --frame _kit
npm run art:approve -- --athlete <slug> --frame _kit-back

# 5. the identity plates — check HAIR and BODY against the photographs before approving
npm run art:athlete -- --athlete <slug> --stage identity --from-photos auto
npm run art:approve -- --athlete <slug> --frame _identity
npm run art:approve -- --athlete <slug> --frame _identity-back

# 6. write the pose set in poses.ts FIRST if the sport has none (the CLI warns "provisional"),
#    then one pose at a time, looking at each before the next
npm run art:athlete -- --athlete <slug> --stage poses --pose hero
npm run art:approve -- --athlete <slug> --frame hero
#    … action2, action3, back

# 7. the gates
npm run art:diff       -- --athlete <slug>     # frame vs plate, every mark must have a twin
npm run art:identity   -- --athlete <slug>     # ArcFace, free, local
npm run art:cutout     -- --athlete <slug> --force
npm run art:qa:athlete -- --athlete <slug>     # the judge, frame by frame
npm run art:approve    -- --athlete <slug> --list    # must read 8/8
```

**Fixing one thing never means re-rolling the frame** (§29): `npm run art:fix -- --athlete <slug>
--frame <f> --change "<one thing>" [--ref <photo>]`. One change per call — an edit carrying two
changes lost a third thing this session. `art:approve --version N` restores any earlier take free.

**What the judge is for.** `art:qa:athlete` grades every frame against the spec and the pose
brief and says which check failed and why; the customer reads its notes directly. It is right
more often than it is wrong, but a zoomed crop outranks it (§33) and the photograph outranks
everything (§39). Its stale FAILs on approved frames are expected — it re-grades but never
re-rolls what a human signed off.
