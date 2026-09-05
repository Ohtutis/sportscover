# Instagram augimas: sekimas + komentarai

Kanalas turi 0 sekėjų, todėl turinys pats nepasiekia nieko. Vienintelis dalykas, kuris pirmomis
savaitėmis realiai atveda profilio peržiūras — **komentaras po tikslinio žmogaus įrašu**. Sekimas
vienas pats beveik neduoda nieko (žmonės nebeatseka, kas juos pasekė), bet jis pigus ir
kontekstui padeda, tad einam abu kartu.

## Dienos norma (jauna paskyra — NEVIRŠYTI)

| Veiksmas | Per dieną | Kodėl tiek |
|---|---|---|
| Sekimų | **15–25**, po 5–8 per porciją, tarp porcijų ≥1 val. | virš ~50/d. jaunai paskyrai = action block |
| Komentarų | **8–12**, tarp jų ≥2 min | greitesnis ritmas atrodo kaip botas |
| Patiktukų | laisvai, bet ne 30 iš eilės vienoje paskyroje | |
| DM šaltiems | **0** | tik atsakymai į įeinančius |

Po ~2 savaičių ribas galima kelti maždaug dvigubai.

## Ką sekam (prioriteto tvarka)

1. **Mokyklų komandų paskyros** (`lzhsfootball` tipo). Jų auditorija — būtent tėvai, ir jos
   pačios postina senior night. Ieškoti: `#seniornight`, `#<mokykla>athletics`.
2. **Sporto mamos su 1–25 tūkst. sekėjų.** Pakankamai didelės, kad būtų aktyvios, pakankamai
   mažos, kad mūsų komentarą pamatytų. Ieškoti: `#sportsmom #volleyballmom #footballmom
   #baseballmom #cheermom #softballmom #hockeymom`.
3. **Žmonės, komentuojantys po tokiais įrašais.** Jie jau įrodė, kad yra aktyvūs, ne tik skaito.
4. **Gretimi meistrai** (rankomis dažyti kamuoliai, senior night lentos). Ne konkurentai —
   jie daro kitą daiktą tai pačiai progai, ir jų auditorija yra mūsų.

## Ko NESEKAM ir nekomentuojam

- **Įžymybių įrašai.** 300 tūkst. patiktukų ir 13 tūkst. komentarų — mūsų ten fiziškai nesimato.
- **Įrašai senesni nei ~48 val.** Komentaras po 13 savaičių senumo įrašu nepasiekia nieko.
- **Patys sportininkai** (nepilnamečiai). Perkam ne jie, ir tai netinkama auditorija mums rašyti.

## Kaip rašom komentarą

Vienintelė taisyklė: **komentaras turi būti vertingas net jei žmogus niekada nepaspaus mūsų
profilio.** Todėl:

- Reaguojam į **konkrečią** įrašo detalę (skalbinių krūva, mini pom-pomai, rungtynių rezultatas).
  Bendrinis „Love this! 🔥" yra spamo signalas ir algoritmui, ir žmogui.
- **Jokių nuorodų, jokio produkto, jokio „DM me".** Niekada. Pardavimas ateina iš profilio, ne
  iš komentaro.
- **TRUMPAI. 2–3 sakiniai, ne daugiau** (savininko taisyklė 2026-09-05: ilgi komentarai
  atgraso skaityti). Vienas konkretus patarimas + atskleidimas + pasiūlymas, ir viskas.
  Tas pats galioja Facebook grupių komentarams.
- Šiltas, ne dirbtinis. Emoji ne daugiau vieno, dažniausiai nė vieno.
- Niekada nekomentuojam du kartus tos pačios paskyros tą pačią dieną.

**Veikiantys pavyzdžiai (2026-09-04):**
> Nobody warns you that the driving is its own season. Car smells like a locker room from August
> to July and you would still not give the seat up.

> That laundry pile is the receipt for the entire weekend. Two nurse shifts on top of it is not
> real life, that is a superpower with worse hours.

> The mini pom-poms photo next to the real uniform is the whole thing right there.

## Techninė dalis (Chrome plėtinys)

- Įrašų sąrašas iš žymos: `instagram.com/explore/search/keyword/?q=%23<žyma>` → JS surenka
  `a[href^="/p/"]`. Prieš komentuojant **visada perskaityti įrašo tekstą** (`document.body.innerText`).
- **Sekimas per JS patikimiausias:** `[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Follow').click()`
  profilio puslapyje. Įrašo puslapyje `ref` click dažnai nepataiko, nes puslapis pasislenka.
- **Komentaras — koordinatėmis, ne per `ref`.** Paspausk „Add a comment…", rašyk, tada „Post"
  mygtukas atsiranda dešinėje tame pačiame aukštyje. Patikra: `document.body.innerText` turi
  turėti komentaro frazę.
- Privati paskyra po sekimo rodo „Requested" — tai normalu, skaičiuojam kaip padarytą.
- ⚠️ Prieš pradedant patikrink, kuria paskyra prisijungta: naršyklė laiko kelias, ir numatytoji
  buvo asmeninė `ohtutis`, ne `gamedayedition`.

## Ką matuojam

Kas rytą užsirašyti į `CHANNEL-LOG.md`: sekimų skaičių, komentarų skaičių, **profilio peržiūras**
(Insights) ir naujus sekėjus. Jei po 2 savaičių ir ~150 komentarų sekėjų prieaugis ~0, problema
yra profilyje (bio, pirmos 6 plytelės), ne komentarų kiekyje.
