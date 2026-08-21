// Which image is THE reference for a finish.
//
// This used to live privately inside gen-backgrounds.ts, and that was a real bug:
// the generator referenced the empty plate while the QA judge in check.ts and the
// re-roll in qa.ts both still referenced `finish.ref` — the original basketball set.
// So the judge was shown a reference WITH a basketball court and asked "does image 2
// match image 1?", which rewarded exactly the failure the plate exists to remove
// (swimming, golf and track all passed QA while showing a basketball key), and every
// automatic re-roll pulled the court straight back in.
//
// One function, one answer, used by every stage.

import { existsSync } from "node:fs";
import type { Finish } from "./finishes.js";

export const platePath = (finish: Finish) => `art-pipeline/out/plates/${finish.slug}.png`;

/** True when this finish has an approved empty plate on disk. */
export const hasPlate = (finish: Finish) => existsSync(platePath(finish));

/**
 * The image every stage must send as the visual reference: the empty set plate when
 * one exists, otherwise the original approved background. Generation, re-roll and
 * grading MUST all call this — see the note above.
 */
export function referenceFor(finish: Finish): string {
  return hasPlate(finish) ? platePath(finish) : finish.ref;
}
