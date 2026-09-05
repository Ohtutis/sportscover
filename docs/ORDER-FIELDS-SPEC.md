# Order fields — what we ask for, and how long it may be

Measured 2026-08-23 **from the Figma file itself**, not estimated. Method: for every merge
field, find the tightest instance on each of the six finish pages, clone it, grow the string
character by character and record where it stops fitting the space available inside its
artboard. The limit below is the **minimum across all six finishes** — a value that fits
everywhere, so one order form serves every style.

Measured on cycling uppercase letters, i.e. an average-width string. A name of all `W`s and
`M`s runs ~15% wider and a name of all `I`s much narrower; the merge auto-fits, so these are
"looks as designed" limits, not hard failures.

## The form

| # | Field | Example | Max | Why that number |
|---|---|---|---|---|
| 1 | First name | Marcus | **12** | poster lockup, tightest on Prism Rush (Orbitron is a wide face) |
| 2 | Last name | Ellison | **9** | the poster surname; Heritage's Graduate is the widest at this size |
| 3 | Jersey number | 12 | **2 digits** | see "the number slots" below |
| 4 | Position / event | GUARD | **24** | Heritage card slot |
| 5 | Team / club | Cedar Ridge Bears | **15** | one narrow Heritage slot — see the defect note below |
| 6 | Season | 2026 | **24** | never a constraint in practice |
| 7 | Class of | 2027 | 4 | year |
| 8 | Headline | THIS IS MY COURT | **25** | Heritage; Prism Rush and Signature Spotlight both sit at 26 |
| 9 | Bio / highlight | 2027 All-Conference First Team | **41 per line, 2 lines ≈ 80** | wraps; Signature Spotlight is tightest |
| 10–12 | Stat value ×3 | 18.4 | **5** | the chip is fixed width |
| 10–12 | Stat label ×3 | PPG | **6** | the chip is fixed width |

Derived and never asked for: `fullNameUpper`, `metaLine` (`#12 · GUARD · CEDAR RIDGE BEARS`,
fits to 44), `cardId` (fits to 52), `firstEdition`, `styleSeason`. They are recomputed by the
merge; their limits follow from the fields above and none of them binds first.

## The number slots are different — they are meant to bleed

`#number` (poster, up to 1120 px) and `#number_ghost` (card) measure as "1 character fits"
on four of six finishes. That is not a defect: these are background typography, deliberately
larger than the box and cropped by the artboard. The current two-digit content is what the
design was built around.

Practical rule: **1–2 digits is the design.** Three digits still work but the merge must
reduce `fontSize`, and it changes the look of the poster. Worth knowing before a customer
types 100.

## The one field that will not fit as designed: the ghost surname

`#surname_ghost` on the card front holds **6 characters** at its design size on five of the
six finishes — it was sized for "BROOKS". Of the seventeen roster athletes, ELLISON (7),
CALLAHAN (8), WHITFIELD (9), MARCHETTI (9), LINDQVIST (9) and DEVARAJAN (9) all exceed it.

This is not a reason to shorten anything. It is the merge's job: shrink `fontSize` until the
string fits on ONE line, then re-centre. That rule already existed in the handoff doc as a
warning; it is now a measured number.

## The name never shortens — the type does

Customer rule, 2026-08-23: when a club or athlete name does not fit, **the font size steps
down one point at a time until it fits. The name is never truncated and never abbreviated.**
So the numbers in the table above are "the size the design was drawn at", not a hard cap on
what a customer may type. `art-pipeline/figma/validate-layout.js` enforces this: the field that
yields is always the variable-bound one, never the fixed label beside it.

The floor is 85% of the designed size. Below that the tool puts the original size back and
reports the artboard instead — a legible defect beats a silently mangled one.

## A defect found while measuring

**Heritage `#team` is too narrow.** Its tightest instance has 204 px of space at 21 px type —
15 characters — while the current content is "NORTHSIDE WOLVES" at 16. So the master is
already overflowing there by one character, before any customer data arrives. Every other
finish gives that field 34–48 characters. Either widen the Heritage slot or accept a shorter
club name; until it is fixed, 15 is the honest cap for the whole system.

## What this changes in the repo

`art-pipeline/card-data.ts` was written against the older, remembered limits (headline ≤28).
Its `LIMITS` now match this table, and `checkCardData()` fails anything over.
