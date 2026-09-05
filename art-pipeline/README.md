# art-pipeline — the AI art layer for Game Day Edition

**Read this before generating any art.** It is written so a fresh agent can take over
with no access to the conversation that built it.

This is **Layer A** of the two production layers described in
`docs/GAME-DAY-EDITION.md`: everything Figma cannot generate — sport/finish
**backgrounds**, athlete **cutouts**, and the from-behind **card-back shot**.
Figma (Layer B) still owns all layout, type and variables. Never move layout work here,
and never try to generate art in Figma.

---

## 0. Generate the empty set plate FIRST

```bash
npx tsx art-pipeline/gen-plate.ts --finish chrome-allstar
```

The approved finish backgrounds in `print-sources/` are **basketball sets** — a basketball
court is baked into the very image used as the visual reference. Referencing them directly
makes every other sport fight that court, and for sports far from an indoor court (golf,
swimming, track, tennis, lacrosse) the model loses and leaves the basketball lines behind.
Six sports came back with an identical basketball key and three-point arc before this was
understood.

`gen-plate.ts` produces the same set with a clean unmarked floor into
`out/plates/<finish>.png`. `gen-backgrounds.ts` uses it automatically whenever it exists,
falling back to the original otherwise. A sport then only ever has lines ADDED to an empty
floor. Verified on Chrome All-Star 2026-08-20: tennis and golf both lost the basketball
court immediately.

Approve the plate once per finish before generating that finish's sports.

## 0.5 READ THIS BEFORE GENERATING ANY SPORT

Two rules, learned the expensive way across 96 backgrounds (2026-08-20). Almost every
defect in that matrix was a **logic error, not a rendering error**.

### Research the real playing area first. Never guess where elements go.

The pipeline carries the FINISH as a reference image but the SPORT only as words. So the
model reproduces the look exactly and *invents the geometry*. That asymmetry produced:

- a baseball backstop standing out in the field instead of behind home plate
- home plate and batter's boxes painted on grass with the dirt behind them — inverted
- a lacrosse crease rendered as a large soccer centre circle, goal facing away
- hockey markings on wooden parquet because the finish's floor was inherited
- a running track whose direction was unreadable, blocks on a bend, hurdle on the grass
- a pickleball court on floorboards; a wrestling mat that was a basketball key

In the user's words: *"manau didziausia klaida kad nedaviau tikslios aiksteles vaizdo -
daugiausiai buvo tokiu loginiu klaidu."*

**So: if it is not obvious how a sport's elements are laid out, stop and research it before
generating.** Get a real reference of that field, then build the image in the finish's
style. When a layout keeps coming back wrong, do NOT keep rewriting the prompt — words lose
to images. Options, in order: ask the user for a reference they have rights to (found
photos are usually copyrighted and this is a commercial product); or build a schematic.
`generateImage()` already accepts multiple `refs`, so a second per-sport geometry reference
is cheap to add — that is the natural next step if words fail again.

Put concrete, checkable facts in the data: real distances, what stands on what, what faces
where. Vague geometry ("the taped lane geometry of a cheer mat") makes the model fall back
on a basketball court from its own prior. Naming the real shape fixes it.

### The same camera angle is NOT required across sports.

What must stay consistent is the **theme and the look and feel** — palette, light quality,
atmosphere, material. Framing is a per-sport choice, and most sports have several valid
angles. *"nebuvo butinas cia visiem tas pats kampas, svarbu ta pati tema and look and
feel."* A `cameraNote` in `sports.ts` is one such choice, not a law — the baseball
pitcher's-side view is simply the most commonly used framing, not the only correct one.
Consistency comes from the finish reference, which is what makes 96 images read as one
product.

## 1. The one idea this rests on

**A finish is the set. A sport is only the floor plus one prop.**

So a background is never generated from words alone. The already-approved background for
that finish is sent to the model **as an image reference**, and the prompt only names what
to swap. That is what keeps 102 backgrounds looking like one product instead of 102
separate pictures.

Corollary: **the prompts are the source of truth, not the PNGs.** `art-pipeline/out/` is
gitignored. Anything in it is reproducible from `finishes.ts` + `sports.ts`.

---

## 2. Endpoint and auth — read this before debugging a 404

The key in `.env.local` (`GEMINI_API_KEY`) is **not** a Google AI Studio key. It is a
Vertex *express* key bound to a service account and restricted to the Agent Platform
(Vertex) API. Consequences, all verified 2026-08-19:

| Thing | Result |
|---|---|
| `generativelanguage.googleapis.com` | **403** `API_KEY_SERVICE_BLOCKED` — never works |
| `aiplatform.googleapis.com/**v1**/publishers/google/models/...` | 404 for image models |
| `aiplatform.googleapis.com/**v1beta1**/publishers/google/models/...` | ✅ this is the one |
| `us-central1-aiplatform...` regional path | 404 — the key routes to europe-west1/4 |
| `GET .../publishers/google/models` (listing) | 401 — API keys cannot list; probe by name |

**A single 404 from this endpoint is often throttling, not a missing model.** Retry before
concluding a model does not exist — that mistake cost an hour once already.

Models: `gemini-3.1-flash-image` (generation, override with `GEMINI_IMAGE_MODEL`) and
`gemini-2.5-flash` (QA judge, override with `GEMINI_JUDGE_MODEL`).

**Rate limits are the real constraint.** 429 `RESOURCE_EXHAUSTED` appears at concurrency 2+
and even at 1 under load. Always run the matrix at `--concurrency 1`. Backoff is capped at
60 s over 7 attempts; a 14-image run still lost 7 cells to quota before the backoff was
lengthened. Expect to re-run the command — the cache makes that free for what landed.

---

## 3. Output size — do not change it

Generation returns **848×1264**. That is deliberate: `848×1264 × 4 = 3392×5056`, which is
exactly the finish master background size already used in Figma and in
`print-sources/<finish>/`. It drops straight into the existing 4× upscale recipe
(upscayl-bin, realesrgan-x4plus, single pass, cap 4096) with no resize step.

---

## 4. The data model, and why each field exists

Every field below was added to fix a specific observed failure. Do not collapse or
"simplify" them without reading the reason.

### `finishes.ts`

| Field | Why it exists |
|---|---|
| `ref` | The approved background, sent as the visual reference. This carries the finish, not the words. |
| `material` | What the model must preserve — described only so the text reinforces the reference. |
| `forbid` | Finish-specific negations (e.g. Chrome All-Star must have no arena haze). |
| `keepsRealSurface` | `true` = a real location (Stadium Night, Heritage) → the sport's actual material belongs. `false` = a studio set → **only line geometry** is etched into the set's own floor. |
| `floor` | The set's own floor, named so the prompt can insist it survives. |
| `crowdInSet` | `true` when the reference already contains a distant out-of-focus crowd. Without this the QA rubric rejects Stadium Night for looking like itself. |

### `sports.ts`

| Field | Why it exists |
|---|---|
| `markings` | Line geometry **only** — no material, no colour words. |
| `material` | The real surface. **Only arena finishes ever use it.** |
| `props` | The one object that makes the sport readable. Order matters: put the defining object first (`"a hockey goal with its net, dasher boards behind it"`, not the reverse). |
| `propScale` | Real-world size with a human yardstick. Without it the model inflates the prop to fill the frame — a soccer goal came out three storeys tall. |

---

## 5. Failure modes already diagnosed

Each of these was hit, understood, and fixed. If you see the symptom again, this is the cause.

**Contradiction between material and treatment.** The original `surface` field held both
geometry and material in one sentence (`"polished white ice with red and blue lines"`), while
the treatment said "no natural colour". The model got two opposite instructions and picked a
different one each run — it looked like the model "not understanding", but it was obeying
alternate halves. **Fixed by splitting `markings` from `material`, and by negating the
material by name** (`"no polished white ice, none of its colour anywhere"`). Abstract
negations like "no natural colours" do not work; naming the thing does.

**Fallback to the reference's own court.** When a sport's markings are weak or abstract
(golf, swimming, lacrosse, gymnastics, tennis, track), the model gives up and copies the
basketball court baked into the reference. Symptom: unrelated sports all show an identical
basketball key + three-point arc. Prompt wording does NOT fix this — the court is in the
image, not the words. **Fix: the empty set plate, §0.** This was the single biggest source
of bad frames.

**Sports with no line geometry.** Golf has no court markings at all, so "etch the markings
into the floor" is meaningless for it — it still came out wrong after the plate fixed the
fallback. Sports like this need their own surface concept (a putting-green outline and cup,
or an exception that keeps a real surface strip even under a studio finish). Do not try to
solve golf with better marking words.

**Props pushed to the back.** The prompt said "mid-background, off to one side of centre" —
correct for a goal, wrong for a volleyball net, a gymnastics beam or starting blocks.
**Rule, from the user: if the equipment is used in the middle of play, it belongs in the
middle.** Needs a per-sport placement field rather than one global rule.

**The scale pendulum.** Adding real-world dimensions fixed an oversized soccer goal but then
made it too small to read. Both extremes fail. The QA rubric's `prop_scale` check fails in
both directions on purpose — do not relax it to one side.

**Floating props.** Objects render mid-air unless told the base touches the floor and that
the join is visible. Seating (dugouts, bleachers) is the worst offender.

---

## 6. QA — nothing is trusted on sight

The generator is not reliable cell by cell: the same prompt can keep the set and lose the
floor rule, or nail the floor and shrink the prop to nothing. So every image is graded by a
vision model against **the same rules the prompt was built from**.

```bash
npx tsx art-pipeline/qa.ts                       # grade what is on disk
npx tsx art-pipeline/qa.ts --reroll              # and regenerate the failures
npx tsx art-pipeline/qa.ts --finish chrome-allstar --reroll --max-attempts 3
```

Ten checks: `no_people`, `no_text`, `set_matches_reference`, `surface_rule`,
`sport_readable`, `prop_scale`, `prop_grounded`, `prop_placement`, `centre_clear`,
`render_quality`. `prop_placement` and `centre_clear` both branch on the sport's
`propPlacement` — a volleyball net in the middle is correct, the same net against the back
wall is a failure, and `centre_clear` must not punish equipment the athlete will cover.
Report lands in `out/qa-report.json`. With `--reroll`, the judge's own complaints are
appended to the prompt for the retry (see `retryHint` in `check.ts`), so the second attempt
is told exactly what was wrong instead of rolling the dice again.

Grading costs a fraction of a cent, so **never optimise the grading** — optimise re-rolls.

### Two rules that matter more than the code

**When the judge rejects something a human approved, fix the rubric, not the art.** The
first QA run failed both Stadium Night images for "people in the stands". The crowd is that
finish's defining feature and is present in the approved reference — the rubric was
rejecting the finish for looking correct. That is what `crowdInSet` exists for. Fire & Smoke
and Prism Rush will likely surface their own version of this.

**`approved.json` is a lock, not a preference.** Cells listed there are still graded but
never re-rolled. A judge must not overwrite work a human already accepted. Add a cell when
the user signs it off; remove it to put it back under automatic control.

---

## 7. Commands

```bash
npx tsx art-pipeline/gen-backgrounds.ts --finish all --sport all --concurrency 1
npx tsx art-pipeline/gen-backgrounds.ts --finish chrome-allstar --sport soccer
npx tsx art-pipeline/gen-backgrounds.ts --finish all --sport all --dry-run
npx tsx art-pipeline/qa.ts --reroll
```

Also `npm run art:bg` and `npm run art:qa`.

Flags: `--force` (ignore cache), `--dry-run` (print the plan and one full prompt, no spend),
`--concurrency N`, `--max-attempts N` (qa only).

Re-runs are free. Each PNG has a `.json` sidecar holding the prompt hash; a cell is only
re-billed when its prompt actually changed. Review everything at once in
`out/_contact-sheet-backgrounds.png`.

Cost: ~2 550 tokens ≈ $0.04 per image. The full 102-background matrix is ~$4, so **never
optimise for cost — optimise for how many cells pass QA on the first attempt.**

---

## 8. Files

| File | What |
|---|---|
| `finishes.ts` | 6 finishes — reference, material, forbid, surface rule, crowd flag |
| `sports.ts` | 17 sports — markings, material, props, prop scale, from-behind pose, gear |
| `prompts.ts` | the two prompt templates (background, card-back shot) |
| `gen-plate.ts` | the empty set plate — run this first, see §0 |
| `gen-backgrounds.ts` | the finish × sport matrix runner |
| `check.ts` | the QA rubric |
| `qa.ts` | grades everything on disk, optionally re-rolls failures |
| `approved.json` | human sign-off lock |
| `lib/gemini.ts` | Vertex client — endpoint notes in the header |
| `lib/img.ts` | reference downscale + contact sheet |

---

## 9. Status as of 2026-08-20 (evening)

**Chrome All-Star and Stadium Night are both complete — 16 sport backgrounds each**
(basketball is skipped in both: the finish reference *is* the basketball background).
All Chrome All-Star cells are locked in `approved.json`.

Stadium Night scored **14/16** on the strict rubric first pass. The two failures are
`soccer` and `ice-hockey` — the only two SN cells generated before these fixes, back when
the judge was flash and the layout field did not exist. Both were approved by the user
earlier, so the lock correctly refused to touch them, but the judge is right about them:
the ice-hockey goal is tiny and cropped by the right frame edge, the soccer goal is
half-cropped, and its corner flag sits beside the centre circle. Regenerating them means
removing their entries from `approved.json` first.

Stadium Night is easier than Chrome All-Star because `keepsRealSurface: true` — the ground
becomes real turf/ice/water rather than an etched mirror floor, so there is no mirror-floor
rule for the model to break. Ten of the sixteen passed on the first attempt.

### What was actually broken — four bugs, not bad prompting

The prompts were mostly fine. The pipeline was wired wrong, and the QA loop hid it:

1. **The judge graded against the wrong image.** `gen-backgrounds.ts` referenced the empty
   plate, but `check.ts` still referenced `finish.ref` — the *basketball* set. So the judge
   was shown a reference containing a basketball court and asked "does image 2 match image
   1?". It rewarded the exact defect the plate exists to remove: swimming, golf, gymnastics
   and track-field all PASSED while showing a basketball key. Fixed by `refs.ts` —
   `referenceFor()` is now the single answer used by generation, re-roll and grading alike.

2. **`qa.ts --reroll` regenerated against `finish.ref` too**, so every automatic re-roll
   pulled the basketball court straight back in. QA actively made things worse.

3. **A partial answer scored as a pass.** `checks.every(pass)` is vacuously true on a short
   array and nothing pinned the ids. `CHECK_IDS` now enumerates the rubric and any id the
   judge fails to answer counts as a failure.

4. **The judge was too weak.** On `gemini-2.5-flash` calibration sat at 7–8/9 and jittered
   run to run. `gemini-2.5-pro` reproduces all 9 human verdicts single-shot. Judge cost is
   a rounding error next to generation — never economise here.

### Two rules the data model was missing

- **`layout`** (new, per sport). Scale and placement alone passed frames that were
  geometric nonsense: a baseball backstop on the far side of the diamond, a tennis net
  aligned to no line of the court beneath it, a lacrosse goal parked on the centre circle
  with no crease. `layout` states what stands on what, facing which way, seen from where.
  It feeds both the prompt and a `layout_correct` check, alongside `court_correct`.
- **Concrete geometry beats abstract geometry.** "the taped lane geometry of a cheer
  competition mat" gave the model nothing to draw, so it fell back on a basketball court
  from its own prior — the §5 failure mode, arriving from the *words* this time rather than
  the reference. Naming the real shape ("nine parallel taped panel strips, a bold taped
  border, no circles and no arcs") fixed cheerleading, gymnastics and other-sport.

### Two ways the tooling could destroy approved work — both closed

- `gen-backgrounds.ts` never consulted `approved.json` (only `qa.ts` did), so a data-model
  change plus `--sport all` silently replaced frames the user had accepted. `approved.ts`
  is now shared and the generator skips locked cells unless `--force`.
- **`--reroll` kept the LAST attempt, not the best.** A re-roll is a fresh roll of the
  dice and can come back worse. It overwrote an accepted wrestling frame with two
  progressively worse ones and the good frame was gone. `qa.ts` now scores every attempt
  by failed-check count and restores the best.

### Model choice

| Role | Model | Note |
|---|---|---|
| Generation | `gemini-3-pro-image` (Nano Banana Pro) | Set via `GEMINI_IMAGE_MODEL`. The default in `lib/gemini.ts` is still Nano Banana 2 (`gemini-3.1-flash-image`). |
| Judge | `gemini-2.5-pro` | Now the default. |

Nano Banana 2 could not hold the `layout` geometry: swimming had no pool at all, baseball
drew the whole diamond as a scale model. Nano Banana Pro fixed both on the first attempt.
It costs more per image but collapses the re-roll count, which is where the money actually
goes. Probed 2026-08-20: `gemini-3-pro-image`, `gemini-2.5-flash-image`, `gemini-2.5-pro`
and `gemini-2.5-flash` resolve; every `gemini-3.x` **text** model 404s.

**Not yet built:** `gen-poses.ts` (4 athlete cutouts per order) and `gen-backshot.ts`
(personalised from-behind card-back shot — the user chose the personalised variant, so the
jersey number and team colours are baked into the render). `backShotPrompt` already exists
in `prompts.ts`; only the CLI is missing. Cutouts also still need a background-removal step
(rembg u2net, or BiRefNet for clean hair edges in production).

**Next:** run the other five finishes. Generate each plate first (§0), approve it, then the
sports. The `layout` field is finish-independent, so it carries over unchanged.

### Known-but-unfixed, as of 2026-08-20 evening

All 96 backgrounds exist (6 finishes x 16 sports) and the user has accepted the set.
These defects are recorded so nobody rediscovers them by spending tokens. Fix them only
when there is a reason to spend — the project has no revenue yet and the standing
instruction is to spend nothing that is not actually needed.

| Cell | Defect |
|---|---|
| `heritage/cheerleading` | seating stands on the mat instead of on bare floor beside it |
| `heritage/wrestling` | same — bleachers on the mat |
| `heritage/pickleball` | reads as tennis: net too high, no kitchen zone |
| `heritage/lacrosse` | basketball markings on the floor |

The seating-on-the-mat failure recurs across finishes despite explicit `layout` text
telling the model to leave a clear strip of bare floor. It is the one defect that has
resisted a data fix; it likely needs a different lever than prompt wording.

**QA coverage is uneven.** The last `--reroll` sweep was stopped part-way through
Stadium Night so the files could be frozen for human review. Chrome All-Star and most of
Heritage carry judge verdicts; the final venue-reworked frames in SN, FS, SS and PR have
human review only. To get machine verdicts without changing any artwork, run qa.ts
WITHOUT `--reroll` — it grades and writes the report but never regenerates.

### Always run this after touching `check.ts`

```bash
npx tsx art-pipeline/calibrate.ts
```

`labels.json` holds the human verdicts. The judge is only useful when it agrees with the
person who signs off the print — and its first version did not. Do not trust
`qa.ts --reroll` unattended until calibrate reports full agreement.

---

# Layer A, part 2 — ATHLETES

Backgrounds are the empty stage. This half puts a person on it. Everything below was
built 2026-08-20 as a one-athlete pilot (ice hockey) before committing to all 17.

## 10. The one idea this rests on (again, transposed)

Backgrounds: **the finish is the reference image, the sport is the swap.**
Athletes: **the person is the reference image, the pose is the swap.**

It is the same machine. A face cannot be held in words — the same sentence gives a
different person every run — so identity is carried by an image, exactly the way the
finish is. That image is the **identity plate**, and it plays the same role for athletes
that `gen-plate.ts` plays for backgrounds: generate it once, look at it, approve it, lock
it, and every pose afterwards references it.

Two rules follow, and both matter:

- **Poses reference the PLATE, never each other.** Chaining pose 3 off pose 2 compounds
  drift and by the fourth pose it is a different kid.
- **Approve the plate before generating poses.** `--stage all` in one go throws away the
  only control there is over "the same face four times".

## 11. Why exactly four poses

Not a guess — the Figma layouts already decided it:

| Pose | Lands in | Notes |
|---|---|---|
| `hero` | `#photo_main`, `GDE_*_Cutout_Hero_PNG` | full opacity, the face carries the product |
| `action2` | `#photo_2`, `GDE_*_Cutout_Pose2_PNG` | muted to ~0.45 — silhouette matters more than face |
| `action3` | `#photo_3`, `GDE_*_Cutout_Pose3_PNG` | muted to ~0.45 |
| `back` | card BACK `#back_photo` | jersey number across the shoulders, face never visible |

The three front poses must differ by **camera**, not just by limbs — three shots of the
same stance from the same height read as one photo pasted three times, which is exactly
what the "athlete edit" composite must not look like. Hence `camera` is its own field in
`poses.ts` and the three front poses use three different ones (eye-level 85 mm, side
50 mm, low 35 mm).

The `back` pose is generated as a **cutout**, unlike the older `backShotPrompt` in
`prompts.ts` which bakes the athlete into a finish set. A cutout drops onto all six
finishes; a baked-in shot has to be generated and approved six times.

## 12. One neutral lighting rig, not six finish-specific ones

Cutouts are athlete-specific, not finish-specific — one set serves the whole order (that
is what `exports/shared-cutouts/` already assumes). So every pose is lit by one fixed rig
(`LIGHTING_RIG` in `prompts.ts`): soft key camera-left, hard rim from behind-right, weak
fill. Finish character is added in Figma with filters and glow, not baked into the person.

Four poses lit four different ways cannot be composited into one poster however good each
is alone. If a finish genuinely needs more (Fire & Smoke embers, Prism Rush spectral),
**relight the approved cutout** in a second pass with the cutout as the reference — never
regenerate the person, which puts identity back at risk.

`preview-composite.ts` exists to test this: it drops a cutout onto the real finish
background so you can see whether it sits in the set or reads as a sticker. If it reads as
a sticker, fix the rig, not the layout.

## 13. "Real people, not plastic" is a rubric item, not an adjective

`photorealistic` on its own returns a wax figure every time. What works is naming the
physical evidence of a real photograph, and then naming the artefacts to avoid — the same
lesson as §5: abstract negations do nothing, named ones work.

`REALISM` in `prompts.ts` asks for pore texture, uneven tone, a flush of blood, separate
hair strands with flyaways, uneven eyebrows, an asymmetric face, creased and damp fabric,
scuffed equipment. `NOT_PLASTIC` forbids, by name: airbrushed/beauty-filtered skin, waxy
sheen, 3D render, video-game character, symmetric face, flawless teeth, poreless skin,
factory-fresh kit. `not_plastic` is then graded as its own check and is the one the rubric
calls most important.

**A trap worth stating: do NOT run a face-restoration model (GFPGAN, CodeFormer) on these.**
Those models are trained to output smooth, idealised faces — they produce exactly the
plastic look this whole section exists to prevent. Upscale with a photo model
(realesrgan-x4plus, as the backgrounds do) or, better, generate at `imageSize: "2K"` and
upscale less.

## 14. Team logos — the part that is a legal question, not a technical one

Wanted: the club's crest on the jersey and ready for the layouts. How it is sourced
decides whether this is safe:

- **Demo roster:** the crests are **ours**, invented and generated in-house (`crests.ts`,
  `--stage crest`). Never a real club's mark on marketing material.
- **Real orders:** the customer **uploads** their team logo and affirms they may use it.
  They have it; it is their club. An automatic name→logo lookup may only ever *suggest* a
  candidate for a human to confirm — scraping a school's mark by name and printing it on a
  product we sell is a trademark problem no amount of prompt engineering fixes.

**The crests are wordless, by rule.** Image models mangle letterforms; a crest carrying the
club name comes back as `NORTHCATE IRONHAWNS` and the whole pose has to be re-rolled. The
club name lives in the Figma layout as type, where it is correct by construction. This one
decision removes the single most reliable failure in the pipeline.

Mechanically the crest is the **second reference image** on every pose (image 1 = identity
plate, image 2 = crest) and is graded by `crest_fidelity`. If that check proves unreliable,
the documented escape hatch is a blank chest panel plus a second crest-application pass —
one more image per pose, and one more chance to drift, so only if the data says so.

## 15. QA is split: arithmetic where there is a formula, the judge where there is not

`cutout.ts` grades the matte with **pixel math, not a model** — cropping is a bounding box
touching a frame edge, a detached stick is a second connected component, a grey fringe is a
measurable colour distance to the sampled backdrop. Free, exact, repeatable. It writes
`<pose>.onblack.png` too, because every finish is dark and that is where a halo shows.

`check-athlete.ts` keeps what only eyes can answer: `identity_match`, `age_correct`,
`build_correct`, `not_plastic`, `pose_correct`, `camera_correct`, `frame_complete`,
`clean_backdrop`, `gear_correct`, `crest_fidelity`, `no_stray_text`, `render_quality`.
Same guards as the background rubric: forced observations before any verdict, every id
enumerated so a partial answer cannot score as a pass, best-attempt-wins on re-roll, and
`approved.json` as a hard lock (keys are `athlete/<tag>`, e.g. `athlete/ice-hockey/_identity`).

⚠️ **`identity_match` from a vision model is not a guarantee.** For the per-order tool it
has to be backed by a numeric face-embedding distance (ArcFace/InsightFace cosine, gated at
a threshold). "We keep your child's face" is a promise being sold, and a judge answering
"looks similar" is the wrong instrument to bet a paid order on.

## 16. Matting

`lib/matte.py` + the `.venv-matte` virtualenv, model **`birefnet-general`**. The rembg CLI
is broken on this machine (its `s` command imports gradio, which fails on Python 3.9); the
library API is fine, which is why this is a script and not a shell-out to `rembg i`.

u2net chops hair into a hard stencil. BiRefNet keeps strands and mesh, which is where a
cutout gives itself away on a dark background. Weights (~970 MB) land in `~/.u2net/` on
first run.

**Two traps, both hit and both fixed on 2026-08-20 — do not undo either:**

- **Force `providers=["CPUExecutionProvider"]`.** onnxruntime here advertises
  CoreMLExecutionProvider first and rembg takes it by default; `new_session()` then hangs
  forever compiling the model for the Neural Engine — no error, no progress, 0% CPU, which
  reads as a slow model rather than a deadlock. Two runs were killed at four minutes on a
  512 px image before this was understood. On CPU the same call takes **2 seconds**.
- **Do NOT pass `post_process_mask=True`.** It binarises the alpha. The first matte came
  back with **0.00%** partially-transparent pixels — a scissors-cut stencil — which throws
  away the exact soft edge BiRefNet was chosen for. Without it: 3.45% soft edge, halo
  distance 121, hair and the thin stick shaft intact.

**The cutout carries no ground shadow, by design** — a cast shadow on the backdrop would be
matted in and follow the athlete onto every background. The consequence is that the athlete
*floats* until the layout puts a contact shadow under them. That is a Figma job (a soft
ellipse under the feet, plus the finish's colour grade on the cutout), not a generation job.
`preview-composite.ts` shows the un-shadowed state on purpose.

## 17. Commands

```bash
npm run art:athlete -- --athlete ice-hockey --stage crest      # 1. club crest
npm run art:athlete -- --athlete ice-hockey --stage identity   # 2. identity plate — LOOK AT IT, then lock it
npm run art:athlete -- --athlete ice-hockey --stage poses      # 3. the four poses
npm run art:cutout  -- --athlete ice-hockey                    # 4. matte + arithmetic QA
npm run art:qa:athlete -- --athlete ice-hockey --reroll        # 5. the judge
npx tsx art-pipeline/preview-composite.ts --athlete ice-hockey --finish stadium-night
```

Locking: add `athlete/<athlete>/<pose>` (or `athlete/crest/<slug>`) to `approved.json`.

## 18. Files

| File | What |
|---|---|
| `athletes.ts` | the demo roster — one athlete per sport, and why each field exists |
| `poses.ts` | the four poses, hand-written per sport with a flagged generic fallback |
| `crests.ts` | invented club crests + the two rules that keep them safe and legible |
| `gen-athlete.ts` | crest → identity plate → poses, staged, cached, lockable |
| `cutout.ts` | BiRefNet matte + the arithmetic matte rubric |
| `check-athlete.ts` | the vision rubric |
| `qa-athletes.ts` | grade + re-roll, best attempt wins |
| `preview-composite.ts` | cutout on a real finish background — the end-to-end check |
| `lib/matte.py` | the rembg call |

## 19. Where this is going — the per-order tool

The whole point of the identity plate is that it is a **seam**. For a paying customer the
plate is not generated from `athletes.ts`; it is built from **their 3–4 photos**. Every
stage after it — poses, crest, cutout, both rubrics, the previews — is bit for bit the same
code. That is the tool the user wants, and it is mostly already here.

**Two of the four pieces now exist** (built 2026-08-20, see §21):

- `intake.ts` — validates the customer's photos before a cent is spent.
- `identity-gate.ts` — the numeric "is this the same person" check.

Still to build:
1. `gen-athlete.ts --from-photos <dir>` — build the identity plate from the intake's
   `anchorOrder` instead of from `athletes.ts`. This is the only genuinely new generation
   step in the whole customer pipeline.
2. Logo upload + a rights affirmation on the order form (§14), and a retention/deletion
   policy for the reference photos. These are photos of minors; consent and deletion are
   product requirements, not paperwork.
3. A human approval step before anything goes to print.
4. Raise `--max-attempts` on the customer path. For the demo roster you optimise the
   first-attempt pass rate; for a paid order you simply buy more attempts — at ~$0.13 an
   image, twenty-five images is $3.25 against the value of the order. Different economics,
   different setting.

## 21. The identity gate

```bash
npm run art:intake   -- --photos orders/1042/photos
npm run art:identity -- --athlete ice-hockey
npm run art:identity -- --athlete ice-hockey --threshold 0.40
```

ArcFace embeddings via insightface `buffalo_l`, CPU-pinned (same CoreML trap as §16),
weights in `~/.insightface/`. The anchor is the **mean** of the faces found in the identity
plate, re-normalised — its three panels are the same person from three angles by
construction, and a multi-view average beats any single view. In the customer variant the
anchor is the mean over their 3–4 intake photos instead; that is the entire difference.

**Measured on the ice-hockey pilot** (threshold 0.36):

| Pose | Cosine | Face as share of frame |
|---|---|---|
| `hero` | **0.544** | 1.47% |
| `action2` | 0.483 | 0.86% |
| `action3` | 0.453 | 0.97% |
| `back` | — (no face, correct) | — |

Three things this data says:

- **The plate method works numerically, not just to the eye.** Every pose cleared the line.
- **The number agrees with the judge.** The one pose the vision rubric queried on
  `identity_match` — "a generically similar teenager, not the specific individual" — is
  `action3`, and it also scores lowest. Two independent measures ranked the poses the same
  way, which means the threshold can be calibrated against human verdicts the way
  `calibrate.ts` does for backgrounds. **Never raise the threshold to make a batch pass.**
- **Similarity tracks face size in frame.** `hero` has the biggest face and the best score.
  At 2K a face occupying ~1% of the frame is only ~190 px, which becomes ~760 px after the
  4× upscale — adequate, with no margin. On the customer path the hero pose should be framed
  tighter, because it carries both the likeness and the print detail.

`intake.ts` rejects on things a customer can act on: more than one face in the shot (a team
photo is the single most common bad submission), a face under 180 px, a low detection score
(blur), fewer than three usable photos, and — from the same pairwise similarities — photos
that are all nearly the same shot (no angle coverage) or that are **not all the same child**,
which is how a sibling gets into an order. It writes `_intake.json` with an `anchorOrder`
ranked by face size × detection confidence.

## 20. Pilot findings — ice hockey, 2026-08-20

One athlete, one crest, one identity plate, four poses, run end to end. Everything below
was observed, not predicted.

**What worked first time**

- **Identity held.** The plate anchored the face across poses without any per-pose face
  description. The judge only queried it on `action3`, where a full cage covers the face —
  the pose where it is genuinely hard to tell.
- **`not_plastic` passed on every frame.** The named-artefact approach (§13) works. This
  was the requirement most likely to fail and it did not fail once.
- **The matte is production grade.** BiRefNet removed a cast shadow AND a visible floor
  seam cleanly, kept the thin stick shaft, 3.45% soft edge, halo distance 121.
- **The cutout sits in the set.** `preview-composite.ts` on Stadium Night reads as one
  photograph, not a sticker — the neutral rig decision (§12) is sound.
- **The crest is legible at jersey scale** and carries no lettering to mangle (§14).

**What the pilot broke, and the fix**

| Defect | Cause | Fix |
|---|---|---|
| The **kit changed between poses** — solid navy with a red hem in one shot, red shoulders and sleeves in the next | colours were specified, the garment was not; the model designs a new jersey each run | `kit` field in `athletes.ts`. Unlike a face, a garment CAN be pinned down in words, so this stays data rather than a third reference image. **This one is fatal if missed** — all three front cutouts sit in one composite. |
| **Poses ignored.** `action2` asked for a slapshot wind-up and returned a skating stride; `action3` asked for a hockey stop and returned a standing stance | self-contradiction inside the prompt: the pose said "stick raised high behind the shoulder", the equipment line said "**shorten the wind-up** rather than crop the stick". The model resolved it by dropping the wind-up. Exactly the failure family in §5 | never soften a pose to fit the frame — **pull the camera back**. Both pose entries rewritten, and the rule stated in `poses.ts` |
| **Stick blade cropped** on `back` | "clear empty margin" was too vague to act on | an explicit empty band on all four sides, naming the far end of the stick as the thing that gets clipped |
| **Crest redrawn** — colours inverted, white field dropped | "reproduced exactly as it appears" was not strong enough | "COPY IT, do not redraw it", with the specific drifts named. If this still fails, the two-pass escape hatch in `prompts.ts` is next |
| **Faint manufacturer logos** on skates and stick | real equipment carries them, so the model draws them | equipment declared UNBRANDED, item by item |
| `clean_backdrop` **failed all four frames** for a contact shadow | rubric defect, not an art defect — the matte removes that shadow perfectly | rubric softened to what actually matters: fail only what a matte cannot remove or what corrupts the edge. §6's rule — when the judge rejects what the pipeline handles, fix the rubric |

**The judge is not stable on geometry — the arithmetic is.** The clearest single result of
the pilot: `qa-athletes.ts` FAILED `hero` for a cropped skate and stick on one run and
PASSED the **byte-identical file** on the next, while `cutout.ts` measured a right-edge
margin of exactly **0 px** both times. This is why the QA split in §15 exists, and
`qa-athletes.ts` now folds the matte's verdict into the judge's as `matte_geometry`:
anything the bounding box can prove outranks anything the model felt. The merge is guarded
on mtime — a cutout report older than the pose it describes is reported as stale rather
than used, so a re-rolled frame is never failed for its predecessor's crop.

The general rule this suggests: **give the judge only the questions that have no formula.**
Every check that can be reduced to arithmetic should be, and not because it is cheaper —
because it is the only one of the two that gives the same answer twice.

**`crest_fidelity` failed the `back` pose for the chest not being visible** — a second
rubric defect of the same family as `clean_backdrop`. From behind, the chest is hidden by
design. The check is now conditional: on `back` it grades a crest on the back if there is
one and passes when there is none.

**Manufacturer logos are a model prior the prompt cannot beat.** After equipment was
declared UNBRANDED item by item, and after a re-roll carrying the judge's own complaint,
the skates still said **Bauer** and the stick still said **CCM**. This is commercially the
same trademark exposure as §14, arriving from the other direction: a real third-party mark
on a product being sold. Treat it as an open problem, not a solved one. The realistic
options are a targeted inpaint pass over the detected marks, framing that keeps boot and
shaft out of the readable area, or accepting it only on assets that never leave internal
review. `no_stray_text` should stay a hard fail so it never ships unnoticed.

**Two poses the model will not perform.** `action3` asked for a hard hockey stop mid-pivot
from an ice-level camera and returned a generic skating stance on every attempt. Some
actions are simply outside what the model will draw, and re-rolling them is money spent to
get the same answer. When a pose fails twice on `pose_correct`, **change the pose**, do not
raise `--max-attempts`. These supporting cutouts sit at ~0.45 opacity in the layouts, so
what they owe the composite is a distinct silhouette and a distinct camera — not one
specific movement.

**`--reroll` earned its keep.** "Keep the best attempt, not the last" fired twice in one
run: both second attempts scored worse than the first and were rolled back automatically.
Without it the pilot would have ended holding its two worst frames.

**Two infrastructure bugs**, both in §16: rembg hanging forever on CoreML, and
`post_process_mask` binarising the alpha.

**Cost and time.** Six images (crest + plate + four poses) at `gemini-3-pro-image`, 2K.
Generation is ~2–5 min per image and **strictly sequential** — the express key 429s under
any parallel load, including another session running a background sweep at the same time,
which is what stretched this pilot across an hour. Judge passes are seconds. Budget the
17-athlete roster as ~100 images plus re-rolls: a few hours of wall clock, a few dollars.

**Read this before doing the other 16.** The `kit` field and the pose-vs-frame rule are the
two things that will otherwise be rediscovered sixteen times.


## 22. The roster has two jobs, and they are separate artefacts

Added 2026-08-20 after working through what the website actually has to prove.

**Sport coverage — seventeen athletes, one per sport.** Answers "is my sport here?" Ages sit
in the high-school band because that is the core buyer. Demographics follow who actually
plays each sport in US high schools rather than an even split, because this set doubles as
the marketing set and has to look like the customer base. Seventeen clubs, seventeen
distinct primary colours, seventeen wordless crests with deliberately different outline
shapes so no two read as the same badge in a grid.

**The age ladder — six athletes in ONE sport.** Answers "does this fit my person?" Soccer,
because it is the only sport in the seventeen genuinely played at every one of these ages in
the US. Sport and club are held constant so age is the only variable that moves.

The rule underneath both, and underneath the site layout: **hold everything constant except
the thing the section is about.** Sports section varies the sport. Age ladder varies the age.
The styles section must show the SAME athlete in all six finishes — six different athletes
there and nobody can tell what the finish did. Mixing ages across seventeen sports would
answer neither question, because no viewer can tell whether what they are seeing is the age
or the sport.

`ladderLabel` carries a relationship — "your kid", "your partner", "your mom" — not a
number. The ladder's real variable is not age, it is who you are buying for, and that
audience is not one gender, which is why gender varies there while sport and club do not.

**Pickleball is deliberately 58.** US pickleball genuinely skews older, so the honest
demographic also puts the older end of the age range inside the main roster at no extra cost.

## 23. The kit is a property of the SPORT, not the person

`kits.ts`. On the pilot the uniform changed between poses, and the fix was to describe the
garment rather than only its colours. But the reason it lives in its own file is the
per-order tool:

- the customer's photos show their real team strip → keep theirs (`Athlete.kit` override)
- they do not → dress them in the sport's basic kit in their team colours

`kitFor()` is that branch, and the demo roster leaves `kit` empty almost everywhere on
purpose, so the demo exercises the same path a real order takes. Ice hockey keeps an
override because it was authored before the split — it doubles as the test of the
"customer has their own kit" branch.

`fitFor(age)` is not decoration. A model tailors every uniform perfectly, and **a small
child in a perfectly fitted kit stops looking like a child and starts looking like a doll.**
Real seven-year-olds wear a jersey bought to grow into: sleeves past the elbows, shorts
below the knee, socks folded over. At the other end a fifty-year-old in a factory-fresh kit
reads as a catalogue model rather than someone who has played in the same league for years.

## 24. Documentary, not studio — and why the "before" must look bad

The pilot's identity plate was technically correct and commercially useless: **too polished
to use in marketing.** The cause was in `LIGHTING_RIG` — a large soft key, a hard rim and a
fill is a beauty/commercial setup, and it renders a catalogue portrait no matter what the
realism block asks for.

The rig now keeps its DIRECTION constant, because compositing four poses requires that, but
its character is documentary: one dominant hard-ish source, the shadow side left unfilled,
slightly cool and slightly uneven. **Consistency is not the same thing as polish** — that
distinction is the whole fix.

The same problem, larger, applies to the before/after row, which is the strongest section a
site like this can have: it is the only one that proves the INPUT was ordinary. The
visitor's real objection is never "is this beautiful", it is "will this work with the photos
actually on my phone". **So the "before" images must look genuinely bad** — phone flash,
cluttered room, off-centre framing, soft focus. If they look competent the section quietly
says "send us a photo shoot" and argues against the product.

`snapshotPrompt` generates them, with four scripted scenarios (indoor flash, overcast
sideline, cropped-in full length, sitting down). The one thing that must NOT be ordinary is
the face: it still has to clear `intake.ts`, which is exactly the constraint a real customer
is under.

**And this is why the marketing asset and the product are one build.** An honest before/after
cannot be faked from a word-generated plate. It requires generating the snapshots first and
building the plate FROM them — which is `identityFromPhotosPrompt`, the per-order path. Doing
the strongest marketing section forces the real customer pipeline to exist and be tested.

`identityFromPhotosPrompt` is a NORMALISATION, not an invention: it removes the flash, the
room and the odd angles and keeps everything that identifies the person. It is explicitly
told not to idealise — no slimming, no straightening teeth, no clearing skin, no making the
face more symmetrical. `identity-gate.ts` then measures whether it obeyed, before a single
pose is generated.


## 25. The per-order path, measured end to end

First real run of the customer pipeline, 2026-08-20, on the seven-year-old of the age
ladder: four generated "before" snapshots → `intake.ts` → identity plate built FROM those
photographs → `identity-gate.ts`.

```
photos against each other (leave-one-out)   0.526 – 0.605   mean ~0.554
plate against those same photos             0.464 – 0.660   mean  0.549
```

**The plate is as close to each photograph as the photographs are to each other.** It did
not drift to one side of the set; it landed in the middle of it, behaving like a fifth
photograph of the same child rather than a new person. That is a stronger result than
"above threshold", and it is the thing to check on every order: not just whether the number
clears the line, but whether the plate sits at the centre of the customer's photos.

The gate now runs in **both** places it was always specified to. Only the plate-vs-poses
half existed until this run, which was the wrong half to have alone — everything downstream
references the plate, so a plate that has already lost the likeness cannot be rescued by any
later check. `identity-gate.ts` measures plate-vs-source-photos first and says plainly:
re-roll the PLATE, do not generate poses from it.

### Two calibration findings

**Worst-pair is the wrong statistic for identity.** `intake.ts` originally failed a set if
any pair fell under 0.36, and it rejected a genuine set of four photos of one child: a
training shot with the head down and the face shaded scored 0.322 against a wide open laugh
with the eyes squeezed shut. Two extreme but perfectly valid frames always look far apart,
and it is worse for children, since ArcFace is trained mostly on adults. Each photo is now
compared against the **mean of the others**, which is both far more stable and the same
statistic the pipeline uses downstream. **The statistic changed, not the threshold** — that
distinction matters, because loosening a gate to make a batch pass is what §6 forbids.

**Other people in the frame are normal.** The first version failed any photo containing more
than one face and threw out both sideline shots — a child in the foreground with teammates
and parents behind, which is exactly what a parent's best photos look like. The real problem
is ambiguity, not company: fail only when the second face is close enough in size to be
mistaken for the subject (a team photo), which is a relative test rather than a count.

## 26. The demo's "before" photos need their own anchor

Generating four snapshots independently from words produced **four different children** —
ArcFace 0.14 to 0.34 between them — and `intake.ts` caught it immediately. Same lesson as
the identity plate, arriving one layer earlier than expected: words do not hold a face.

So snapshot 1 is generated from words and every snapshot after it references snapshot 1.
Unlike poses, snapshots SHOULD drift in everything except identity — different day, light
and clothes — so chaining is correct here rather than harmful. A real customer's photos are
one person by definition; only the demo has to manufacture that.

### The four photos, and the line they sit on

The set is fixed: **home, a game in the team kit, a training session, ordinary life.**
Between them they carry a clean look at the face, the real uniform if there is one, the body
in motion, and the person away from sport.

Two wrong turns were taken chasing "real", and both are worth naming because they are easy
to repeat. The first made the ROOM shabby — a torn armchair, marked walls. The second made
the CHILD battered — scabbed knees, grazes, mud, which had piled up from three places at
once (`skinTone`, `realismFor` and `fitFor` each adding their own damage). Both read as a
hard life rather than an ordinary one, and both are quietly insulting to the customer whose
photograph this stands in for.

**The imperfection belongs to the PHOTOGRAPH, not to the person or their life.** Available
light, a slightly crooked frame, an off-centre subject, a touch of softness — all of them
say "somebody's mum took this on her phone". Broken furniture, injuries and dirt say
something else, and none of it is what the before/after is proving.

And the assumption underneath was wrong too: **a parent does not send their worst photos.**
They scroll the camera roll and pick the ones where their child looks lovely. Those are
still phone photos — unposed, available light, not styled — but they are nice ones.

**Expressions must be assigned, not left to the model.** Every scenario described a candid
moment, so all four came back with the mouth open and the set looked wrong. Three are now
closed-mouthed and exactly one is a real laugh, which is also the only frame where the
seven-year-old's missing tooth shows.


## 27. THE RUNBOOK — one athlete, zero to a signed-off set

Rewritten 2026-08-21 after building football and ice hockey end to end in one day. Every
step below exists because skipping it cost real money that day; the notes in brackets say
what it catches.

### The one law

**Nothing is invented.** Every fact about an athlete comes from exactly one of three places,
and each fact has exactly ONE home:

| the fact | its home | who may change it |
|---|---|---|
| what they look like | their photographs → `_identity.png` | nobody, once approved |
| what their kit looks like | their kit photograph → `_kit.png` | nobody, once approved |
| their name, number, club, colours | the order form → `athletes.ts` | the customer |
| everything the photos cannot show | `_spec.json` | a human, by hand |
| how a frame is shot | `poses.ts` | a human, by hand |

Two homes for one fact is the failure this whole layer keeps rediscovering. It cost the
football set its shoulder pads, and it cost the hockey set a collar, two sleeve bands, a
number colour and a glove — every one of those was a sentence I typed that disagreed with a
photograph nobody was comparing it to.

### The chain, with its gates

```
photos → intake → SPEC → spec:verify → crest → KIT PLATE → grade → IDENTITY → 4 POSES → gate → cutout → approve
           ▲        ▲         ▲                    ▲          ▲         ▲          ▲        ▲       ▲
           └────────┴─────────┴────────────────────┴──────────┴─────────┴──────────┴────────┴───────┘
                          every one of these refuses to let a defect travel further
```

### 1. Photographs
```bash
npm run art:athlete -- --athlete <slug> --stage snapshots     # demo athletes only
```
A real order drops the customer's uploads into `out/athletes/<slug>/before/`. Four frames:
home, **the match** (`photo2` by convention), training, ordinary life.

`photo2` does two jobs — it is the garment reference AND an identity input — so it must be
CLOSE. A sideline shot returns a face at 1% of frame and fails the next step.

### 2. Intake — before a cent is spent
```bash
npm run art:intake -- --photos art-pipeline/out/athletes/<slug>/before
```
Must print **OK**. [catches: too-small faces, a sibling mixed into the set, four copies of one
shot] A rejection is never fixed by loosening the gate — fix the input, or ask the customer
for a better photo. That is exactly what a real order will have to do.

### 3. The spec — freeze the decisions ← **CHECKPOINT**
```bash
npm run art:spec        -- --athlete <slug>
npm run art:spec:verify -- --athlete <slug>      # ← and again after EVERY hand edit
```
`art:spec` reads hair, build and each garment off the photographs. **Read every line.**
Correct anything wrong by editing `_spec.json` by hand — never by re-running with `--force`
(the judge is not deterministic, and re-freezing a frozen spec discards accepted decisions).

Then **verify**, and this is the step that did not exist until 2026-08-21: it puts every claim
in the spec side by side with the photographs and reports `confirmed` / `contradicted` /
`not_visible`. [catches: exactly the class of error a human hand-edit introduces — one band
instead of two, white where the photo shows red, "plain and unbranded" over a visible
wordmark] One judge call, no image cost, and it guards every frame built afterwards.

Rules for writing spec lines:
- **Describe only what a photograph cannot settle.** For anything visible, write "exactly as
  the athlete's kit photograph shows it" and let the image decide. A prose description of a
  visible garment is a second source, and it will be the wrong one.
- **Do not write down a fact a measurement cannot settle.** Two verify runs named opposite
  thighs for one wordmark; the line now says "on one thigh".
- **Branding:** a mark the athlete's own equipment really carries is KEPT, exactly as it
  appears. Nothing is ever added to an item that has none, and a real league or federation
  emblem is never drawn at all (§29).
- Set `bestPortrait` to the photograph the family would call the best likeness.

### 4. The crest
```bash
npm run art:athlete -- --athlete <slug> --stage crest
```
Look at it before it goes on a shirt. One idea, wordless, and **distinct in SILHOUETTE from
every other club in the file** — two raptor heads in two shields are one club in two colours
at card size, which is what Northgate and Sunfield were until the hockey club became an anvil
in a keystone.

### 5. The kit plate ← **CHECKPOINT**
```bash
npm run art:athlete -- --athlete <slug> --stage kit     # front + back, then grades itself
npm run art:approve -- --athlete <slug> --frame _kit
npm run art:approve -- --athlete <slug> --frame _kit-back
```
Every pose inherits the wardrobe from this one image, so an unaudited plate poisons four
frames. The stage now grades its own output against **the spec AND the kit photograph**,
element by element — collar, sleeve bands, hem, crest, number, footwear, gloves, helmet — and
writes `_kit-grade.json`. The poses stage refuses a plate that failed unless a human approves
it deliberately. [catches: invented trim, wrong number colour, missing pads, a plate that
simply is not their kit]

If one item is wrong, **do not re-roll the plate** — edit it (§29):
```bash
npm run art:fix -- --athlete <slug> --frame _kit \
  --ref art-pipeline/out/athletes/<slug>/before/photo2.png \
  --change "the GLOVES are made to match the gloves in the reference photograph: ..."
```

### 6. The identity plates ← **CHECKPOINT**
```bash
npm run art:athlete -- --athlete <slug> --stage identity --from-photos auto
npm run art:approve -- --athlete <slug> --frame _identity
npm run art:approve -- --athlete <slug> --frame _identity-back
```
Check the HAIR against the photographs — a parent recognises it before the face, and the
numeric gate is blind to it. The plate's BODY is the body every pose will have; if it
disagrees with the photographs, fix the record and the spec, not the poses.

### 7. The four poses — ONE AT A TIME ← **CHECKPOINT EACH**
```bash
npm run art:athlete -- --athlete <slug> --stage poses --pose hero
# look at it → approve it (approval LOCKS it) → only then the next
npm run art:approve -- --athlete <slug> --frame hero
# then action2, then action3, then back
```
Hero first: everything after it is judged against it. Approve each frame the moment it is
right — an approved frame cannot be overwritten by a later spec edit or a re-roll.

For each frame, exactly one of three moves:

| what is wrong | move | cost |
|---|---|---|
| one item (a boot, a badge, a stray mark) | `art:fix --change "…"`, with `--ref` when a picture settles it | 1 image, nothing else moves |
| the frame's DESIGN (pose, camera, facing) | fix `poses.ts`, then regenerate that pose | 1 image, re-diced |
| a FACT (colour, trim, placement) | fix `_spec.json` → `art:spec:verify` → regenerate | 1 image + 1 judge call |

Never re-roll to change an item, and never re-roll a frame that is already right.

### 8. Measure, cut out, sign off
```bash
npm run art:identity   -- --athlete <slug>      # ArcFace: is it the same face? free, local
npm run art:qa:athlete -- --athlete <slug>      # the rubric, frame by frame
npm run art:cutout     -- --athlete <slug>      # BiRefNet matte + geometry audit
npm run art:approve    -- --athlete <slug> --list      # must read 8/8
```
`art:cutout` is the arithmetic gate: it measures margins and fails a frame that touches an
edge, which a vision judge will pass on one run and fail on the next. Re-run it after ANY
frame changes — the `.cutout.png` and `.onblack.png` files are outputs of the frame they were
cut from and go stale the moment it is replaced.

A support frame whose face is a fraction of the frame can fail the numeric gate on
measurement noise (hockey `action2`: 0.287 with the face 0.7% of frame, behind a visor). Take
one re-roll; if it comes back worse, restore the better take — `--version N` costs nothing —
and record the number rather than chasing it.

### What a finished athlete looks like

```
out/approved/<slug>/   _kit  _kit-back  _identity  _identity-back  hero  action2  action3  back
out/athletes/<slug>/   *.cutout.png (4)   _spec.json   _spec-audit.json   _kit-grade.json
                       _identity-gate.json   _cutout-report.json   _qa-report.json
```
Eight approved frames, four clean cutouts, and every audit file green or explained.

### The five rules that cost the most to learn

1. **A generation re-dices everything.** Fixing one item by regenerating gets that item and a
   new picture. Edit instead (§29). Restoring an earlier take is free; regenerating is not.
2. **The photograph outranks prose — so don't write the prose.** Where a garment is visible,
   the spec should point at the image, not describe it.
3. **Nothing is checked until something checks it against the source.** The plate was audited
   against my words, and my words were never audited against the photograph. Both audits now
   exist; neither existed this morning.
4. **A blanket rule is somebody's face.** "Some acne along the jaw" ran on every teenager in
   the roster until a customer asked why the boy was so spotty. Individual features belong to
   the individual's record.
5. **Variety has to be built in.** Deterministic scenario picks over a pool of five put the
   same kitchen table behind half the roster. If it must not repeat, the pool must be bigger
   than the roster.


## 28. Facing: name the limbs, not the direction

`orient.ts` measures which way a frame faces from the face landmarks — where the nose sits
between the eyes, normalised by eye separation — and mirrors it if it is wrong. Exact, free,
no re-roll:

```bash
npm run art:orient -- --athlete <slug> --frame action3 --opposite-to action2
```

**But a flip moves the crest to the wrong chest**, so it is a repair, not a plan. It is fine
on a support (turned away, small, muted to 45% in the layout) and never acceptable on the
hero, where the chest is square to camera.

The way to be right the first time is not a better direction word. "Face left" loses to the
pose description, because a ball dropping onto a raised thigh already turns the body and the
model follows the anatomy. Six frames across two athletes came back facing the same way as
their sibling.

**So name the limbs.** "Planted on the left foot, striking with the right" cannot be drawn
facing the wrong way — the body would not work. The two supports are specified as anatomical
mirrors of each other, and the orientation falls out for free. Same principle as everywhere
else in this pipeline: replace a request with a constraint the model cannot satisfy wrongly.

## 29. Fix ONE thing — never re-roll a frame to change an item

The most expensive hour of the football build went like this: the plate was right except the
boots, so the plate was re-rolled. It came back with the boots right, the club crest replaced
by the **NFL shield**, and the jersey a different length. Re-rolled again: crest back, boots
wrong again. Fix one, break two, three times over.

Nothing was wrong with the model. **A generation is an independent roll of the dice** —
everything not nailed to a reference image is decided again, from scratch, every run. Asking
for one change by regenerating asks for one change and gets a new picture.

```bash
npm run art:fix -- --athlete football --frame _kit \
  --change "both black shoes are HIGH-TOP American football cleats, collar above the ankle"
```

`fix.ts` attaches the finished frame as the reference and asks for **that image back with one
change** — position, scale, colour, lighting, background, badge, all named as unchanged. It is
the same principle as the identity plate and the kit plate, applied to the frame being
corrected: the thing that must not drift is carried by an image, and here the image is the
frame itself.

**Which tool when**

| the frame… | use | costs |
|---|---|---|
| does not exist, or its DESIGN is wrong | `art:athlete --stage <s>` | a full roll |
| is right except for one item | `art:fix --frame <f> --change "…"` | one edit, nothing else moves |
| needs a correction that must survive future rebuilds | `art:revise` (or `_spec.json`) then re-run | a full roll |

`art:fix` changes PIXELS, not the recipe: the next full generation will not know about it. If
the correction is a standing decision, put it in `_spec.json` (a fact) or `art:revise` (how a
frame reads) **as well**.

And when a roll comes back worse, **restoring is free** — every generation is kept:

```bash
npm run art:approve -- --athlete football --frame _kit --version 7
```

### The other three rules this cost us

- **No real-world league marks, ever.** `NO_REAL_WORLD_MARKS` in prompts.ts refuses NFL, NBA,
  FIFA, UEFA, NCAA, Olympic and national-federation emblems BY NAME, and `no_league_mark` is a
  judge check on both the plate and every pose. "No brand logos" never caught it: a league
  emblem carries no letters, so "no text" misses it, and it is not a manufacturer's mark, so
  the swoosh/three-stripes list missed it too. It is also the worst one that can appear — a
  registered mark of a body we have no relationship with, on a child's card.
- **The plate is graded before the poses inherit it.** `--stage kit` now judges its own output
  and writes `_kit-grade.json`; the poses stage refuses a plate that failed unless a human
  approved it. The runbook always said an unaudited plate poisons all four poses; it was a
  sentence in a document, and the football set was built on a plate the judge had already
  failed.
- **A worn item has priors a flat lay cannot argue with.** The plate helmet was clean and every
  worn helmet still came back with a swoosh on the shell and printed warning labels on the
  back. Things the model "knows" about real equipment have to be refused in words even when an
  image shows otherwise — the image settles what a thing LOOKS like, not what may be added to it.

## 30. Two supports must be anatomical mirrors — and "mirror" is geometry, not a limb

§28 says name the limbs, not the direction. True, and it is not sufficient. Football's
action2 said "down on the RIGHT hand, right shoulder leading" and action3 said "driving off
the RIGHT foot, right shoulder leading" — both perfectly specific, both naming the SAME lead
shoulder, so both frames faced the same way and both leaned out of the composite.

A limb fixes the anatomy. It does not fix the compass. State the two facts that imply each
other and cannot be drawn wrongly:

- **which edge of the frame the athlete is driving towards**, and
- **which shoulder is therefore nearest the lens** (moving right = the camera sees the right
  side), plus which side of the composite the frame lands on.

Never write a support's facing as a comparison with its sibling ("the opposite lean to
action2"): that is a sentence about a prompt the model cannot see, and it loses to the limb
names every time. `art:orient` can mirror a frame afterwards, but on a sport whose jersey
carries a front number a flip reverses the number — repair, never plan.

## 31. The plate states garment LENGTH the way it states colour

Baseball's and softball's kit plates laid the grey pants with the legs folded under, so on
the plate they READ as knee-length — and every pose then dressed the athlete knicker-style
with the socks out, which cost five separate pixel edits across the two sets. The customer
found the root cause: **the poses copy garment length from the plate image**, and a folded
leg is the image saying "short".

The rule, now in `kitPlatePrompt` and the `flat_lay` check: full-length trousers are laid
with BOTH legs extended completely straight, hems plainly visible — never folded, rolled, or
arranged so they could be mistaken for knee-length. Anything the poses must copy has to be
legible in the plate; a flat lay states length exactly the way it states colour.

## 32. Some women's sports are a DIFFERENT GAME, not a different cut

`BASE.lacrosse` in `kits.ts` describes a helmet, shoulder pads and gloves — the men's game,
because that is what "lacrosse kit" returns if nobody asks the question. **Women's lacrosse
forbids body checking and therefore has no helmet and no pads at all:** protective goggles, a
mouthguard, a kilt or shorts, a shallower pocket. Generating a sixteen-year-old girl in a
men's cage helmet would not have been a rendering defect — the picture would have obeyed the
description perfectly. It is the research defect §20 is about, caught this time BEFORE the
first image because the pose set is written before anything is generated.

`kitFor` and `paddingFor` now branch on `presents`, reading `BASE_WOMENS` first. The rule for
what belongs in that table: **only sports whose RULES differ.** A girl's soccer, basketball or
volleyball kit is the same garment — listing those would turn the table into a place to encode
assumptions about how girls dress, which is a different and worse mistake.

**Before writing any new sport's pose set, ask the same question:** does this athlete's sex,
age or level change the EQUIPMENT the rules require? Youth vs adult (face cages in youth
baseball), women's vs men's (lacrosse, and headgear rules in several others) — the kit table
is the place for it, never a per-athlete note.

## 33. `art:spec:verify` is a finder, not a judge of last resort — the zoom outranks it

On lacrosse the verifier called the chest crest "above the number" on its first pass and "on
the left chest" on its next two, and separately denied a black outline on numerals that
plainly have one. A wide crop settled all of it in seconds. The same instability produced
opposite thighs on baseball and an appearing/disappearing side-seam piping on volleyball.

So: **run it — it catches real errors nobody else will** (it found five "plain and unbranded"
lines contradicted by visible CCM marks on ice hockey, my wrong shoe colours on volleyball,
and a missed headband on lacrosse). **But when it disagrees with a zoomed crop, the crop
wins,** and when it flips between runs on the same claim, stop asking and go look. Record the
override in the spec's `why` so the next person does not "fix" it back.

Two runs is the useful budget: one to find real errors, one to confirm the corrections. A
third run is the tool arguing with itself.

## 34. Check a new crest against every existing SUBJECT, not just the shapes

The fox/kestrel collision taught "vary the silhouette first" (§ the northgate-anvils note),
and the very next club broke the same rule from the other side: Foundry Hill Forge came back
as an anvil with crossed hammers while Northgate Anvils is already an anvil. Different shape
— octagon vs keystone — same object, so at card size they read as one club again.

Before generating any crest, list what every existing club already IS: bear, bison, lark,
wren, kestrel, fox (animals); anchor, anvil, hammer (objects). A new club takes a subject
nobody has and a shape nobody has. And it takes ONE of that subject — the first forge crest
had an anvil *and* two hammers; the replacement is a single hammer, because a crest that has
to survive being printed 12 mm wide carries one idea.

## 35. Two structural assumptions the plate made about every sport — both wrong

Wrestling was the first sport to break the kit plate's built-in idea of what a kit IS, and it
broke it twice in the same flat lay:

- **"the shirt … the shorts below it"** — a singlet is ONE garment. A plate asked for both
  invents a two-piece kit that does not exist, and the poses then copy it. `Sport.onePiece`
  now carries the sentence for the single garment (singlet, leotard, competition swimsuit)
  and replaces both lines.
- **"the ball or implement of <sport>"** — wrestling, gymnastics, track and field and the
  generic fallback have none. Asking a flat lay for an object the sport does not have is how
  an invented ball ends up in the corner of a wrestling plate. `hasImplement()` derives the
  answer from the CONSTANTS table already in `kits.ts` (a constant starting with "no" means
  there is nothing to lay out) rather than duplicating the fact into a second list.

Both rules also had to be taught to the `all_items_present` check, or the rubric would fail a
correct plate for missing the very things the sport does not have. **When a new sport arrives,
ask what the plate is silently assuming about it** — the assumptions are invisible until the
sport that violates them shows up.


## 36. A from-behind frame is graded against the BACK plate — and the first question is what may be SEEN at all

The wrestling `back` frame came back with the white number 1 printed across the back of the
left thigh. I looked straight at it, checked that the number sat on the LEFT leg — which is
where this athlete's number belongs — and approved the frame. The customer caught it in one
glance, and the judge never saw it because the judge was never asked.

The check was the right check for the wrong question. The number is printed on the FRONT of
the thigh, and `_kit-back.png` shows the singlet's back plain red from shoulders to hem. So
in a from-behind frame the number **cannot appear at all**, and asking "is it on the correct
side?" quietly concedes that it belongs in the picture. *An attribute check assumes the thing
exists.* That is the whole failure, and it is not specific to numbers.

Ask the two questions in this order, never the second one first:

1. **What may be seen AT ALL from this angle?** Put the frame next to `_kit-back.png` — not
   `_kit.png` — and treat every printed mark in it as guilty: a mark that is not on the back
   plate is invented, whatever side it is on. Wrestling makes this cheap to check, because its
   back plate is blank: **any** mark on the seat, the back or the thigh backs is a defect.
2. **Only then**, is each surviving mark on the right limb, the right colour, the right size?

### The rule above was written and then broken the very next day — so it is a COMMAND now

Cheerleading's back frame shipped with the skirt number printed across the back of the skirt,
on a kit whose back plate is blank from shoulder to hem. Same defect as wrestling's, one
athlete later, with the rule already written down. The customer's words: *the same mistake
twice in a row — you are checking it the wrong way.*

They were right, and the diagnosis matters more than the defect: I "checked" by looking at the
frame and comparing it against my MEMORY of the plate, and memory supplied a plate with a
number on it, because the FRONT one has a number on it. A check that runs on recall is not a
check.

```bash
npm run art:diff -- --athlete <slug>              # all four sheets
npm run art:diff -- --athlete <slug> --frame back
```

`plate-diff.ts` puts the frame and the plate it must agree with side by side in one picture at
the same height, in `out/athletes/<slug>/_diff/` — front poses against `_kit.png`, the `back`
pose against `_kit-back.png`. Then read the GARMENT, item by item: **every crest, number, band
and maker's mark on the left must have a twin on the right.** No twin, no mark.

Run it before approving any pose, and again after any `art:fix` that touched a garment. It
costs no generation, and it is the only version of this rule that has actually worked.


The generalisation: **a surface the kit plate shows plain is a surface where any mark is a
defect.** The rubric grades what IS there against the spec's description of it; nothing in it
asks whether a surface that must be blank stayed blank, so nothing in it can catch an addition
to an empty area. Until `qa-athletes.ts` carries that check, it is a human's job, and it is the
first thing to look for in the `back` frame of every sport whose kit carries its number
anywhere but across the shoulders.

Two smaller traps from the same session, both cheap to avoid and expensive to find:

- **`art:cutout` will not re-matte a frame that already has a `.cutout.png`** — it recomputes
  the geometry from the OLD matte and reports `ok`, so a corrected frame keeps the cutout of
  the picture it replaced. Pass `--force` after ANY change to a frame. (`back.onblack.png` was
  rebuilt while the matte under it was not, which is exactly how this hides.)
- **Left and right in a photograph are the SUBJECT's, and a frontal frame mirrors them.**
  Facing the lens, his right knee is on the viewer's LEFT; in profile facing frame-right, the
  camera sees his RIGHT side. I read one frame backwards, called a correct pad wrong, and paid
  for a re-roll to get back what I already had. Work it out on the visible number — this kit
  carries it on the left thigh — before concluding a limb is wrong.

## 37. A kit item written into the identity record follows the athlete through her whole life

Cheerleading's `athletes.ts` record said `hair: "black, straightened into a high ponytail tied
with a large berry-coloured bow"`. Every one of the four "before" snapshots takes `a.hair`
verbatim — the scenario decides the CLOTHES, never the hair — so the competition bow turned up
on the sofa at home, in the training gym and on a cliff path by the sea. The customer spotted
it in one glance: *she is not wearing this bow every moment in her life.*

The record's fields are not a costume list, they are **what is true about the person when she
is asleep**. Hair colour, cut and how she wears it belong there. Anything she puts on to
compete — a bow, a headband in club colours, tape, a mouthguard, eye black — belongs in
`kits.ts` with the shirt, because `kitFor()` is what the match frame, the kit plate and the
four poses read, and nothing else does.

The fix cost three edited photographs. It would have cost four fresh ones plus a new face if
the bow had been removed by re-rolling: photo1 is the anchor the other three chain from, so
re-generating it re-dices the person. That is why `art:fix` now accepts `before/photoN` as a
frame — the demo's snapshots are ours to correct, and correcting one must not disturb the
identity the rest of the set is built on. (A real order's `before/` files are the customer's
own photographs and are never edited.)

**The test, for any line in an athlete record:** could she wear this to school on a Tuesday? If
not, it is kit.

## 38. The calm back frame is a rule for kits WITH a number, not a house style

Every sport's `back` pose was written calm and square — feet level, arms down, nothing
crossing the shoulders — because the card back exists to show the number across the shoulders
and a raised arm puts a limb over it (the ice-hockey note in `poses.ts`). Correct, and then
copied to two sports where the premise is false: wrestling carries its number on the THIGH and
cheerleading on the SKIRT HIP, so both have a blank back, and both were standing to attention
for no reason. The customer noticed before I did — the row of card backs had gone static.

So the rule is conditional, and it reads: **if the kit prints a number between the shoulder
blades, the back frame is calm and square. If it does not, the frame is free to move, and it
should — give it the moment the sport celebrates in.** Cheerleading's back is now the landing
of a routine: both arms thrown into a high V with a pom in each hand, heels up, back arched,
head tipped back, the BOW where the number would have been. Wrestling's back is still the calm
one and has the same licence whenever it is worth an image.

Two smaller notes from the same build:

- **`art:athlete` will not overwrite an approved frame** and says so quietly (`0 ok, 0
  failed`). Pass `--force` when the redesign is deliberate; the old take is kept in
  `_versions/` either way.
- **An edit that carries two changes at once can lose a third thing.** One `art:fix` asked
  action3 for a deeper yoke AND shorter socks; it returned an asymmetric yoke, unchanged
  socks, and the chest crest relocated to the skirt. Restoring and re-rolling was cheaper
  than arguing. §29 says one thing per edit — it means it.

## 39. THE PHOTOGRAPH WINS. Always. The spec is a note about it, not a rival to it

Stated by the customer on 2026-08-22, and it settles every argument this layer keeps having:

> *The photograph always wins — because the spec is something you wrote and it can drift, but
> our main guidance is the photographs.*

`_spec.json` is prose typed by a person from looking at pictures. Every failure recorded in
this README where a garment came out wrong has the same shape: a line of that prose disagreed
with the customer's own photograph, and the pipeline obeyed the prose, because the prose was
the thing everything downstream was graded against. The photograph is not one source among
several — it is THE source, and the spec is a set of notes about it plus decisions for the
things it cannot show.

**So when a spec line and a photograph disagree, the line is wrong.** Not "one of them is
wrong": the line. Change it, record why, and let every frame follow. This applies even when
the line reads better, even when it was deliberately written that way, and even when it is
already approved and downstream frames obey it.

Three cases where I got this backwards and had to be told:

- **Wrestling socks.** The spec said "PLAIN BLACK with NO maker's mark … the small mark is not
  legible enough to reproduce". A 3x crop of `photo3.png` shows a perfectly legible white
  swoosh. The correct move was to fix the line; instead I planned to edit the mark OUT of the
  hero, which would have made three frames disagree with the athlete's own kit.
- **Wrestling shoes.** The spec said low-cut; the photograph shows a high ankle wrap. Four
  generations were blamed for "failing" while they were drawing the photograph correctly.
- **The thigh mark.** The spec declared the opposite leg plain; `photo2.png` carries a small
  white Champion C.

The order of authority, top to bottom: **the photograph** → a zoomed crop of it (§33) → the
frozen decisions in `_spec.json` for what no photograph shows → the sport defaults in
`kits.ts`. `art:spec:verify` exists to find where prose has drifted from the picture; when it
reports a contradiction, the default assumption is that it is right about the picture and my
line is what changes.

**Where the spec still rules:** only what no photograph shows — the back of a wrestling
singlet, briefs under a cheer skirt, pom-poms nobody photographed. Those are decisions, and
they must be labelled as decisions in the line itself, so a later reader can tell a DECISION
from a READING at a glance.

## 40. The SEX is stated, not inferred from the build and the hair

`Athlete.presents` reached the identity plate and nothing before it. The snapshots are
generated FIRST and the plate is built FROM them, so the one stage that could not afford to
guess was the one stage never told.

Imani Whitfield — sixteen, "very lean", "light through the upper body", cornrows gathered into
a low bun — came back as a **teenage boy in all four "before" photographs** (2026-08-22).
Nothing in her record is untrue of a boy. A build is not a sex and a hairstyle is not a sex,
and a model asked for a lean sprinter with cornrows draws the commoner one. `intake.ts` was
happy: the four frames were one consistent person, just not the right one.

`personNoun()` in `prompts.ts` now turns `presents` + `ageYears` into "teenage girl" / "man" /
"boy", `identityPlatePrompt` uses it, and `snapshotPrompt` states it **twice** — once at the
head of the description block and once as a hard requirement, because a single line loses to
four lines about a lean torso.

Same family as the kit and the face: **what must not drift is carried explicitly, never
inferred from adjacent facts.**

## 41. The back of the shirt is PLAIN unless the sport actually numbers it

Third time this exact shape of bug. `kitPlateBackPrompt` and the from-behind pose both
ASSERTED the squad number across the upper back, unconditionally, in a line sitting AFTER the
frozen spec — so it beat the spec every time. Imani's spec said in as many words that the
track singlet's back stays plain because the race number is on a bib on the shorts, and the
plate came back with a 30 cm black **8** across the shoulders anyway (2026-08-22).

`hasBackNumber()` in `kits.ts` is now a real property, and it is a table because nothing else
here implies it. Team-sport shirts carry a back number; the individual sports do not. Track's
number is a bib, a racing suit has none, gymnastics puts it on a sleeve, and a tennis shirt, a
golf polo and a skate tee carry nothing at all.

**The default is FALSE.** A sport missing from the table gets a plain back, which is the safe
direction: a missing number is a visible gap that someone fixes, an invented one is a mark
printed on a garment the athlete does not own. `check-athlete.ts` branches too — asking the
judge for a number the kit does not have taught it to pass an invented one.

The badge is the same story and is NOT covered by this flag: the track and swimming back
frames each printed the CHEST crest between the shoulder blades while their `_kit-back` plates
showed a plain back. That is what `npm run art:diff` is for (§36) — run it on every back frame.

## 42. A pose brief must describe an ACT, and the camera must be able to SEE it

Two heroes in one day came back as catalogue stands, and neither was a rendering failure.

- **Track, three takes.** "At full sprint driving STRAIGHT at the camera … front knee to hip
  height, back leg fully extended behind" — head-on, both of those point away from the lens
  and foreshorten to nothing, so the one shape the brief asks for is the one shape that view
  cannot show. `art:fix` could not rescue it either: there was no defect in the drawing. Fixed
  by MOVING THE CAMERA to three-quarters, not by softening the pose — §20, again.
- **Swimming, two takes.** "Caught at the END of a shoulder swing … stopped between two
  movements" — a movement that has already finished is indistinguishable from standing still,
  so there is nothing to draw. Fixed by giving the frame a real act with a beginning and an
  end: seating the goggles, both hands up beside the face. That also satisfies the hands rule
  for free, which a hanging arm never does.
- **The swimming back frame, two takes.** "Hinged forward at the hips, arms swung back and
  still rising, heels lifted" rendered as a fold with the head between the knees — and the
  second take filled the gap by inventing a marlin on the suit AND another on the cap. **A
  pose the body cannot hold invites invented marks.**

The test before generating: *can a body hold this shape, and can this camera see the part that
matters?* If either answer is no, fix the brief in `poses.ts` — it is free — rather than
spending rolls on a frame that was never going to arrive.

## 43. A rubric must be handed the same facts on every path that calls it

`gen-athlete.ts` passes `hasImplement`/`hasFootwear` into `checkKitPlate`; `qa-athletes.ts`
did not. So the SAME swimming plate that the build graded **PASS** came back **FAIL** from
`art:qa:athlete` — "missing shoes, socks and a sport implement" on a barefoot sport that has
no implement, in a note that went on to say the specification calls for bare feet
(2026-08-22).

That is precisely the failure `hasFootwear` was added to stop in §35: a rubric that fails
correct work teaches everyone to ignore the rubric. Two call sites, one rubric, one set of
facts — when a check takes a flag, every caller passes it.

## 44. The cost model — measured, and the rules that follow from it

Written 2026-08-22, the day a month of spend had to be explained backwards from three billing
widgets with three different latencies. The numbers below are measured on this pipeline, not
quoted from a price list.

**What a generation costs.** Every image in this project so far has been `gemini-3-pro-image`
at `2K` (505/505 sidecars; ~4.3 MP regardless of aspect). One such image bills ~5 000 output
tokens ≈ **€0.32 all-in** (including the judge's share, ~5% of spend). The judge inputs are
already cheap — `refFor` downsizes to ≤1024 px before sending. File size on disk (MB) has
NOTHING to do with cost: the old soccer PNGs are 4–5 MB and the new ones 2 MB at identical
pixels — that is compression, and billing is per generated image.

**Where the money actually went.** `npm run art:cost` sums it from the sidecars. The old-key /
new-key difference the spend dashboards suggested was an illusion of latency: both eras ran the
same model at the same rate (~€115 for Aug 20 vs ~€127 for Aug 21–22). What varies is the
NUMBER of generations per athlete: the theoretical minimum for a demo athlete is 13, the
session average was 28, and the old pilots hit 47–48. **Half the money is re-rolls and fixes**
— an `art:fix` bills exactly like a fresh frame.

**THE PRICE LIST, LOOKED UP RATHER THAN INFERRED (2026-08-22).** Three days were spent
deducing rates backwards from dashboards that lag 10 minutes and 24 hours. The published page
(ai.google.dev/gemini-api/docs/pricing) settles it in one table, and every constant this repo
had guessed was wrong:

| USD / 1M tokens | input | output | 1K | 2K | 4K |
|---|---|---|---|---|---|
| `gemini-3-pro-image` | 2.00 | 120.00 | 1120 tok · $0.134 | **1120 tok · $0.134** | 2000 tok · $0.24 |
| `gemini-3.1-flash-image` | 0.50 | 60.00 | 1120 tok · $0.067 | 1680 tok · $0.101 | 2520 tok · $0.151 |
| `gemini-3.1-pro-preview` (judge) | 2.00 | 12.00 | | | |

Three things follow, and two of them reverse earlier entries in this file:

1. **On Pro, 1K and 2K bill the same 1120 tokens.** Generating small to save money saves
   nothing. The probe measured this before the price list confirmed it. Always 2K on Pro.
2. **Flash is ~25% cheaper than Pro at 2K, not 8x and not 50x** ($0.101 vs $0.134). Both
   earlier estimates here were arithmetic stacked on a Pro rate that was itself 2.5x too
   high. Choosing flash is a QUALITY decision with a rounding error attached.
3. **The billed output runs ABOVE the published nominal.** Measured on this account: flash 1K
   returned 1561 output tokens against a published 1120, Pro 2K returned ~1190 against 1120.
   So the ledger prices from `usageMetadata` — `promptTokenCount` and `candidatesTokenCount`
   separately, because they bill at 2 and 120 USD per 1M — rather than from the headline.
   Tiers 1/2/3 are rate limits, not price bands.

**AND THEREFORE, THE REAL SHAPE OF THE OVERSPEND.** A Pro image costs ~€0.12, not the €0.32
this file used. The invoices were €242 against 764 sidecars, which at €0.32 looked like 764
generations and at the true price is closer to **1 900**. The account was never paying too
much per image — it was making two to three times more images than left any trace on disk,
because a re-roll before `_versions/` existed overwrote its own sidecar. The most expensive
behaviour in the pipeline was the one that recorded nothing. That is what `_spend.jsonl` now
prevents: every call is written at the moment it is made, including ones whose output is
thrown away.

**The two bills are additive, and they reconcile.** The account was running on two projects at
once: the Vertex express project (Aug 19-21) and the AI Studio key (Aug 21-22). Their dashboards
are separate and neither one is the total. Read together on 2026-08-22 they came to
€109.89 (Vertex, SKU *Gemini 3.0 / 3.1 Pro Image Output - Predictions*) + €132.42 (AI Studio
cap counter) = **€242.31**, against `art:cost`'s €243.06 from the sidecars — 0.3% apart over
764 generations and two billing systems. That closes the question the graphs could not:
**Vertex was never cheaper.** The €15.76 that made it look cheap was a small day's work, not a
lower rate; per frame both paths bill ~€0.317. There is nothing to save by switching endpoints,
and `art:cost` can be trusted ahead of any dashboard, which lag up to 24 h.

**Resolution is not a lever — measured, not assumed.** Same model, same prompt, one step apart:
`1K` = 1 517 output tokens, `2K` = 2 071. **2K costs 1.37x of 1K, not 4x**, because image output
is billed per token at a resolution-tiered rate, not per pixel. The input side (prompt text plus
two or three reference plates) does not shrink at all when the output does, so the real saving on
a full job is well under a third. Dropping the `back` frame to 1K — the one frame with no face in
it — saves roughly €0.03 and risks a soft card back. **Generate everything at 2K and spend the
attention on the number of generations instead.** A resolution audit is a day's work for the
price of one re-roll.

**The rules:**

1. **Draft cheap, finalise dear.** Pose-hunting, framing experiments and anything that will be
   re-rolled runs `npm run art:draft` (flash model + 1K — pennies). Only the take that is about
   to be APPROVED is generated with `art:athlete` (Pro 2K). Identity plates and final poses
   stay Pro 2K always — the face is the product, and the poster needs the resolution.
2. **A fix must earn its €0.32.** Before any `art:fix`, ask whether the defect is visible at
   the size it will print (§16's calibration: a difference nobody can see is not worth an
   image). Legal defects — brand marks, invented numbers, wrong crests — always qualify.
   A sock cuff on a 45%-muted support cutout may not.
3. **Approved work is never re-judged.** `art:qa:athlete` now skips locked frames by default
   (`--all` for a deliberate full audit). A verdict on a frame that cannot be re-rolled is
   money spent to produce a number nobody may act on.
4. **`art:spec:verify` runs twice, not six times.** Once after the draft, once after the hand
   edit. When it flip-flops on a few-dozen-pixel detail, §33 already decides — a zoomed local
   crop is free and outranks it. Chasing its verdicts costs a judge call per lap.
5. **Fix briefs, not frames.** §42's lesson priced out: a pose brief that cannot render burns
   €1–1.5 before anyone reads the brief. `poses.ts` edits are free; three re-rolls are not.
6. **Cost is read from disk.** Every sidecar now records `tokens`; `npm run art:cost` groups
   spend by day and athlete. When the observed rate drifts, update the constants at the top of
   `cost.ts` — and keep treating its output as an estimate, not an invoice.

**What this buys.** A customer order (intake → spec → 2 kit plates → 2 identity plates → 4
poses) is 8 final generations ≈ **€2.60** when the prompts hold, ~€3.30 with one fix. A demo
athlete built by these rules lands near ~€5 instead of the ~€9 the session average implied and
the ~€15 the old pilots cost.

---

## 45. A cutout gate that cannot see a speck is not a gate

`cutout.ts` has checked islands, crop, soft edge and halo since the cutouts existed, and it
still shipped four cutouts with visible debris. Both reasons are in one line of it:

```ts
const small = 240;                                     // mask is downsampled to ~240 px
const significant = sizes.filter((n) => n / maskTotal >= 0.001).length;   // <0.1% discarded
```

At 1696×2528 those two together make **anything up to roughly 31×31 source pixels invisible**.
That is nothing on a screen and a clearly visible crumb on an 18×24" print. The customer
remembered seeing debris; the gate reported every one of those frames as passing.

`npm run art:audit:cutout` (`lib/cutout_audit.py`) closes it. It labels islands at **full
resolution** and reports every one.

**Kit and garbage are told apart by SHAPE, not by size.** The first version used an area
threshold and called a golf ball garbage because it was 0.4 % of the body. Measured across the
whole roster, the separation is clean and it is roundness:

| island | fill of its own bbox | verdict |
|---|---|---|
| golf ball | 0.79 | equipment |
| soccer / pickleball / tennis balls | 0.65–0.9 | equipment |
| debris beside a shoe | 0.47 | garbage |
| pompom strand | 0.52 | garbage |
| sliver by an ear | 0.29 | garbage |
| speck over hair | 0.36 | garbage |

So: an island near the subject is **equipment if it is compact (fill ≥ 0.65) or genuinely
large (≥ 0.5 % of the body)**; anything else is garbage. Dust under 25 px is counted and not
reported — one pixel is 0.08 mm at 300 dpi.

**Holes are not defects and must never gate.** Fifty-nine of ninety-two cutouts "failed" a
hole check before it was demoted, because the enclosed gap between an arm and a torso, or
between the legs of a toe-touch jump, is a real hole in a real silhouette. A gate that fails
two thirds of a clean roster is a gate nobody reads twice. Counted, reported, never failed on.

**`--fix` writes `<pose>.clean.png`; the approved `<pose>.cutout.png` is never edited.**
`lib/fit.py` prefers the clean twin when one exists, so a stray can never reach Figma while
the approved art stays exactly as it was signed off.

**Erase an island by IDENTITY, never by a sampled pixel.** The first `--fix` took the label
from the centre of the stray's bounding box, and for a thin diagonal sliver that centre is
background — the fallback then grabbed the first non-zero pixel in the window, which belonged
to the body. **The softball back cutout lost its entire head**, and nothing in the numbers
said so: the report cheerfully said `removed: 1`. A before/after crop caught it. Match each
island on its exact area and bounding box, and look at the result.

---

## 46. Nothing is finished until a validator has looked at every element

Four visible defects shipped in one swap pass, and not one of them showed up in any count:
a ghost numeral at full strength covering an entire card back, a club name running into the
label beside it, a name lockup wrapping into three stacked fragments (MA / RC / US), and a
back photo still wearing the previous athlete's number. Every script reported success.

`art-pipeline/figma/validate-layout.js` is the pass that has to run before an edit is called
done. It finds text colliding with text, and text escaping its artboard, and it fixes what it
safely can. Four things had to be right before it was worth trusting:

**Measure the ink, not the box.** A text node's bounding box includes line height. Comparing
boxes reported the card back's name and meta line as a 54% overlap while the glyphs never
touch — sixteen false alarms on one page. `absoluteRenderBounds` is the rendered ink.

**Subtract the effects.** `absoluteRenderBounds` includes them, and Prism Rush type carries a
neon drop shadow that inflated a 90 pt line to 131 px of "ink". MARCUS and ELLISON were
reported as colliding when only their glow met. Deflate by each node's effect reach first.

**Require the overlap in BOTH directions.** Area alone still flagged nine clean Prism Rush
artboards, because Orbitron at 100% line height sets one line's ink a few pixels into the next
one's. A real collision is significant horizontally AND vertically: text sitting ON text, or a
name running INTO its neighbour.

**Never leave it worse than you found it.** The first fixer shrank a text one point at a time
"until the overlap clears". Inside an auto-layout the neighbour moves too, so the ratio never
clears — it drove nine Prism Rush headlines from 48 pt to 7.7 pt and then reported them as
"unresolved". A fixer needs a floor (85% of the original) and it MUST restore the original
size when it fails, then report. The nine were recovered only because the master file still
had the right numbers under the same node ids.

**The name never shortens; the type does.** Customer rule. The field that yields is the
variable-bound one, never the fixed label beside it.

Result on the basketball file after these four corrections: **0 escapes, 0 collisions across
all six pages**, and four "fixes" from the un-hardened version reverted as false positives.


---

## 47. One box for three poses is not a composite

The normaliser in §45's neighbour (`lib/fit.py`) originally put every pose in the same box:
subject 90% of canvas height, standing on 97%. Defensible as a number, wrong as a picture. The
poster and card front are a THREE-FIGURE composite — one hero, two supporting figures muted to
~0.45 — and sizing all three the same put one supporting figure directly behind the hero,
where the customer could not see it at all.

The correction is to stop inventing a box and measure the one the layouts were drawn around.
`exports/shared-cutouts/GDE-cutout-{hero,pose2,pose3}.png` is the reference athlete's art, the
files the slots were positioned against:

| slot | subject height | stands on | centred at |
|---|---|---|---|
| `hero` | 78.5% of canvas | 89% | 50% |
| `action2` | **62.9%** | 67% | 47% |
| `action3` | 70.1% | 74% | 47% |
| `back` | 90% | 97% | 50% |

Every slot uses scaleMode FIT and fits by height, so "share of canvas height" is exactly "share
of slot height" — hit these fractions and any athlete composes the way the design does. The
supporting figures are 63–70% where the hero is 78.5%; that ratio IS the depth in the picture.

Note the reference canvases are not even the same shape as ours (3076×5244 for the supporting
poses, against our 1696×2528). That does not matter, and it is why the rule is expressed as a
fraction of height rather than as pixels.

`back` is excluded because it is not part of the composite: it fills the card back with
scaleMode FILL, which crops instead of fitting.

---

## 48. A team colour is not automatically a readable colour

`team/primary` drives every accent, and for a navy club it is #12356B — measured against the
card's own background it scores **1.55–1.63:1**. The readable minimum is 4.5 for normal text
and 3.0 even for large text. The labels were not "a bit dim"; they were below the floor for
any size, and on the darkest finishes they simply were not there.

The fix is NOT to lighten `team/primary` — that colour still owns plates, fields and large
areas where dark is correct. It is a second, derived variable:

**`team/primary-ink` — same hue, same saturation, lightness raised until contrast ≥ 4.85**
against luminance 0.0069 (the measured card ground, with headroom because the plates under
the stat chips are lighter than the darkest corner). Bound to TEXT and to thin RULES only.

Derived, never hand-picked, so every athlete inherits it:

| club colour | contrast before | ink | after |
|---|---|---|---|
| #12356B basketball | 1.54 | #4582e0 | 4.86 |
| #12284B ice hockey | 1.33 | #4179d1 | 4.54 |
| #23262B lacrosse | 1.29 | #707a89 | 4.50 |
| #1d4ed8 reference athlete | 2.75 | #587de9 | 4.86 |

Three clubs already pass and are left alone: gymnastics 7.74, track & field 8.03, tennis 6.27.

**Rules and bars count as text for this purpose.** A 3 px divider in a colour the eye cannot
separate from the background is not a divider. The cut-off used is thickness: an element whose
smaller side is ≤ 14 px takes the ink; anything larger keeps `team/primary`, because there the
colour is the field rather than the line. Measured result on the card back: 1.6 → 4.86–5.15.

**Measure against the REAL background, not against the frame's fill.** These cards sit on a
photograph. The method that works: screenshot the artboard, crop a band around each label's ink
bounds, drop the pixels close to the text colour, and take the median of what is left.


---

## 49. A composite arrangement belongs to the ATHLETE, not to the template

The customer re-composed the basketball poster and card by hand: the narrow shooting pose moved
to the left and grew, the wide crouching pose moved to the right, the hero grew and rose. It is
a clear improvement and it was captured as fractions and propagated — including, wrongly, into
the master.

**It broke the master immediately.** The master's athlete has different poses: her `action3`
is not the narrow one, so the same slot geometry sent her shooting pose to the RIGHT and pushed
the other supporting figure ON TOP of the hero. The customer spotted it in one look.

The rule this teaches, and the measurement that proves it is not a one-off: **`action3` is the
narrower of the two supporting poses in only 7 of 17 sports.**

| narrower = action3 | narrower = action2 |
|---|---|
| basketball, football, softball, soccer, lacrosse, cheerleading, swimming | baseball, ice-hockey, volleyball, wrestling, gymnastics, track-field, tennis, golf, pickleball, skateboarding |

So a hand-tuned arrangement may be copied to the other FINISHES of the same athlete — those are
clones of one layout holding the same three images — and must NOT be copied to a different
athlete. Between athletes the only thing that travels is the PRINCIPLE: the narrower pose takes
the tall side, the wider pose takes the wide side, the hero is the largest and its face sits
near the optical centre. Which named pose that is has to be read off `_fit-report.json` per
athlete, every time.

The master's composition was restored from the values measured out of it before the change.
Per-artboard offsets of ±10-20 px that some clones carried are now uniform; nothing else moved.

## 50. The mask is the PLATE, not a silhouette you draw and then argue with

> **Read §51 with this one.** Everything below about OCCLUSION still holds — the plate is what
> tells you where a finger is. Everything below that treats the plate as the card's SHAPE was
> superseded on 2026-09-01: it shipped rounded corners on a square-cut card.

The card-in-hand shot works because the photograph is generated holding a **matte black blank
plate**: black pixels are the card's visible area, anything non-black inside its outline is in
front of it. The mask arrives free — thumb silhouette, gaps between fingers, everything.

`lib/card_in_hand.py` had drifted away from that. It drew its own die-cut rectangle, force-painted
the four corners the die needed and the plate lacked, healed ink, then `inpaint`ed whatever plate
survived past its own edge. Every one of those exists to patch a disagreement between a rectangle
the code invented and the plate the photograph actually contains. Ten rounds of fixing produced
ten new artefacts — a dotted edge, a black L past a corner, a smeared thumb — and the customer
caught each one. Putting the plate back in charge deleted all four mechanisms at once.

**What the quad is for, and what it is not for.** The quad decides the PERSPECTIVE — where to warp
the artwork. The plate decides where to PAINT. Get that split wrong and you are back to arguing.

**Fit the four EDGES, not a box.**
- `minAreaRect` is a rotated rectangle; the plate in these photographs is a genuine perspective
  quad whose top edge is shorter than its bottom. A rectangle leaves slack on one side and falls
  short on the other, and the shortfall prints as a black L past the corner.
- `approxPolyDP` on the convex hull is worse: a finger eats a corner, the hull cuts straight across
  the bite, and the polygon puts that corner 100 px inside the card.
- What works: fit each edge from its own MIDDLE with the outliers dropped (fingers grip the ends),
  intersect the lines for corners, then push each edge outward until the quad holds every plate
  pixel. Too large is invisible — the mask clips it back. Too small is a black crumb.

**One threshold cannot find a lit plate.** A corner turned away from the light sits ~20 levels
brighter than the middle. Take the level from the middle of the located area and grow outward
through everything within reach of it, falling back to the strict core if the growth escapes into
the room.

**Gaps: small is card, large is hand.** Fill a gap component if it is under 0.6 % of the card (a
rounded corner, a glint) OR if it does not touch the card's border and is under 8 % — a hand always
reaches in from an EDGE. Plus thin-and-bright, which is type the model printed on a plate it was
told to leave blank.

**An audit may not ask the question its own mask was built from.** "Is any plate left over?" read
against the mask answers no by construction — it answered no while a black L stood past the
corner. "Is anything dark near the card?" cries wolf at every drop shadow. The third question
works: **how far does the card's edge stand off the nearest plate pixel**, measured only where the
plate exists (a finger is not a fit error). Clean is 2-4 px; the broken rectangle fit read 15.

**Measure size against the FACE.** Finger width was derived from the occluded region's distance
transform, so a clean grip that occludes almost nothing reported a 2.5 in card as ten fingers
wide. A face is always in the frame and is ~4.7 in: `card_w / face_w` lands at 0.5-0.8, and past
1.05 the card is as wide as a whole face — the "monster card" the customer kept catching.

**Never describe the finished card inside the prompt for the blank one.** The line "the athlete's
name is printed across the lower third" was written as the REASON the thumb stays low. The model
read it as an instruction and printed **ANNE** across the plate, with a dashed keyline for company.

**A framing instruction loses to a comparison.** `--hold reach` asks the card to fill a third of
the frame; the model grew the CARD instead of moving the camera, four takes running at 0.87-1.17
of a face. `SMALL` compares the card to something else in the picture, and that holds.

### §50a. The dash on the fingertip: four causes, one shape

The customer zoomed to 100 % and found short black bars lying on the fingers, sawtooth edges and
hooks hanging off corners. Every one of them was card ink painted where the photograph had none —
and each came from a different rule reaching past the plate. Written down because each looked, on
its own, like the one remaining bug:

1. **The small-gap fill.** The rectangle is grown to CONTAIN the plate, so a hairline of finger runs
   inside it along every edge. Small enough to pass an area test, it was painted — with the card's
   own black border. A gap that touches the card's border is not card, however small; only a
   genuine rounded CORNER is, and a corner nick is small AND roughly square, not 21x3.
2. **The soft mask edge.** `dilate(paint) + feather` put three pixels of card over the fingertip.
   The card's edge against a finger is an OCCLUSION and must be crisp: alpha is hard-zeroed on the
   hand, and only the outer edge, against the background, keeps its feather.
3. **The ink rule, tested per pixel.** An opening wider than a letter stroke also clears the
   ten-pixel RIM of every large gap, and skin is bright — so the rim of the hand itself scored as
   ink. Per component instead? Then a letter touching the thumb is one thick blob and the model's
   printed name stays on the artwork. Both are needed: per pixel, plus NEUTRALITY (printed type
   measures saturation ~2, skin ~80) and a deep `ink_zone`, because ink is printed in the middle of
   a card, never at its edge. That last clause is what stopped a bright wedge of background at the soccer
   card's bottom from printing as a sawtooth.
4. **One hairline joins every gap into one component.** With the strip along the edge included, a
   grey block of print in the middle of the baseball plate was connected to the thumb, counted as
   "reaches in from an edge", and stayed unpainted as a grey bar. Gaps are judged inside `inner`
   (the card minus its border ring) so that strip cannot bridge anything.

And the lesson under all four: **before erasing anything, check whether the photograph has it.**
Two rounds went into removing "scraps of plate" from the fingers — with a morphological close, with
inpaint, with normalised convolution — and the source photograph was clean the whole time. The
compositor was drawing them. `bleed` in the audit is now exactly that question, asked in pixels:
dark in the composite, bright in the photograph, not plate, not deep inside the card.

## 51. The card is the RECTANGLE; the hand is what you subtract

§50 said the mask is the plate. That was right about occlusion and wrong about SHAPE, and the
difference cost a second session. The plate is a generated object: the model rounds its corners
however firmly the prompt says square, its edge fades over three pixels and wanders by five, and
it prints a name on a card it was told to leave blank. Take the plate as the card's silhouette and
the product inherits every one of those — a square-cut card rendered with rounded corners, and the
keyline that every finish prints a few pixels in from the edge clipped wherever the plate fell
short.

**Ask where the HAND is; everything else inside the rectangle is card.**

```
gap  = rect & ~plate                       # in front of the card, or the plate falling short
core = OPEN(gap, 17)                       # no finger is thinner than this; nothing else is thick
hand = dilate(core, 21) & gap              # give back the rim the opening took; bounded, so a
paint = rect & ~hand                       #   letter touching a thumb is not swallowed with it
```

That one line replaced five heuristics — small-gap fill, corner nick, ink threshold, ink
saturation, ink zone — every one of which was an area or a distance test, and every one of which
was wrong somewhere. Corners come out square because the corner is inside the rectangle and no
hand is there. The keyline is whole for the same reason.

**Three geometry details it depends on, all learned the hard way:**

- **Fit each edge to its OUTER envelope, not to a symmetric robust line.** Every error has one
  sign: a finger can only eat INTO the plate, never extend it. A fit that trims outliers on both
  sides splits the difference with the fingers — a degree of tilt on the soccer card's bottom edge,
  which hugs the plate at one end and stands fifteen pixels clear at the other.
- **Place the edge at the 92nd percentile of the plate's extent, not at its maximum.** Pushed to
  the outermost pixel, the edge stands 8-10 px clear of the plate everywhere else, and that band is
  wide enough for the hand mask's own growth to bite notches out of it. The notches print as a row
  of little dark tabs hanging under the card. Two pixels of the plate's soft edge falling outside
  the card is invisible; a ten-pixel band is not.
- **Rasterise the outline at sub-pixel accuracy.** A polygon filled to whole pixels staircases
  along any sloping edge — one step every 40 px on a shallow slope — and the feather turns each
  step into a tab. Supersample and average.

And the feather is one-sided: soft against the background, hard against the hand. A card's edge
against a finger is an occlusion, not a join.

