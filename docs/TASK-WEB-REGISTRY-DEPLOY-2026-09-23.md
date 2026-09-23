# TASK · WEB — get the card registry live again

Owner: web agent. Raised 2026-09-23 from order #4180204338's final export.

## The job in one line

Every `cardId` in `lib/registry/cards.ts` must return **HTTP 200** at
`https://www.gamedayedition.com/c/<cardId>`. Today 19 of them return 404.

## Why it is urgent

The QR printed on every card back, on the foil-pack wrapper and on the certificate resolves to
`/c/<cardId>`, under the words SCAN TO OPEN THE DIGITAL TWIN. A 404 there does not read as
"not deployed yet" — it reads as a fake card.

Two live surfaces are already affected:

1. **Order #4180204338 (Avery O'Neal) is at the print queue.** `GDE-FS-FTB-2026-80` 404s. The
   buyer has approved the proof; cards, a sealed foil pack and a certificate all carry that QR.
2. **18 listing demo cards 404 as well**, and their QRs are printed on **live Etsy listing
   images** (ice hockey, lacrosse, track, golf, gymnastics, pickleball, tennis, swimming,
   skateboard). Any shopper who scans one today gets "NO CARD REGISTERED UNDER THIS ID".

## Current state

| | |
|---|---|
| live build | GitHub `main` @ `06c7545` — **23** cards |
| local `lib/registry/cards.ts` | **42** cards |
| difference | 19 cards, all 404 live |

```
GDE-CA-ICH-2026-17   GDE-CA-OTH-2026-12   GDE-CA-PKB-2026-02   GDE-CA-TEN-2026-01
GDE-FS-FTB-2026-80   GDE-FS-LAX-2026-22   GDE-FS-TRK-2026-08   GDE-HE-GLF-2026-01
GDE-HE-GYM-2026-01   GDE-PR-LAX-2026-22   GDE-PR-PKB-2026-02   GDE-PR-TRK-2026-08
GDE-SN-GLF-2026-01   GDE-SN-ICH-2026-17   GDE-SN-SWM-2026-01   GDE-SS-GYM-2026-01
GDE-SS-OTH-2026-12   GDE-SS-SWM-2026-01   GDE-SS-TEN-2026-01
```

## The blocker — read before touching git

This checkout **cannot push as it stands**, and the reason is not the registry:

- local `main` is **unborn** — `git log` reports "your current branch 'main' does not have any
  commits yet", while the whole working tree sits staged as new files;
- the remote has full history (`origin/main` = `06c7545`);
- three stale lock files block every ref update:
  `.git/index 2.lock`, `.git/refs/heads/main.lock`, `.git/refs/remotes/origin/main.lock`.
  The `" 2"` in the first name is an iCloud duplicate (see the iCloud-eviction note in
  `docs/` — this repo lives under `~/Documents` and gets evicted).

`git fetch` works; `git reset` was refused by the sandbox. So the repair, and any push, is an
**owner-approved step** — confirm before running anything that rewrites refs.

**Do not** `push --force`, do not discard `06c7545`, and do not `git init` over the top. If the
working tree turns out to have diverged widely from `origin/main`, land the registry change as a
small branch off `origin/main` rather than pushing the whole tree.

## Also in this change

`lib/registry/cards.ts` was corrected for Avery on 2026-09-22 and the fix must ship with the
deploy:

- `ageBand` was `"adult"` — copied from the tennis record above it. `showsJerseyNumber()` returns
  false for adults, which silently dropped `#80` on `/c` for a 16-year-old in a numbered sport.
  Now `"minor"`.
- `playerHighlight: "September Player of the Week"` added.
- The stale tennis comment above the record was replaced.

## Done means

```bash
for id in $(grep -oE 'cardId: "[^"]+"' lib/registry/cards.ts | sed 's/cardId: //;s/"//g'); do
  code=$(curl -sL -o /dev/null -w "%{http_code}" "https://www.gamedayedition.com/c/$id")
  [ "$code" = 200 ] || echo "FAIL $id -> $code"
done
```

No output. Note the `-L`: the apex domain 308-redirects to `www`, so a curl without it always
shows 308 and tells you nothing.

Then spot-check `GDE-FS-FTB-2026-80` in a browser and confirm the page shows **#80** (that is the
`ageBand` fix rendering) and "September Player of the Week".

## Standing rule this came from

Before any final order export, the registry entry must resolve live. Decoding the QR proves the
id is right, not that the page exists — two separate checks.
