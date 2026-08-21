// Reading the frozen production spec.
//
// SPLIT OUT OF resolve-spec.ts because that file is a CLI with top-level `await`, and any
// module importing it for this one function crashed with ERR_REQUIRE_ASYNC_MODULE. A file
// that is both a command and a library is a conflict waiting to happen; this half is pure.

import { readFileSync } from "node:fs";

/** The frozen decisions, as prompt text. Every later stage reads this rather than deciding. */
/** The pinned hair description, when the photographs settled one. */
export function specHair(specPath: string): string | undefined {
  const spec = JSON.parse(readFileSync(specPath, "utf8"));
  const r = spec.resolved?.find((x: { item: string }) => x.item === "hair");
  return (r?.value || r?.partial) || undefined;
}

/** The hair, stated on its own — never inside the kit block. See specText. */
export function hairText(specPath: string): string {
  const h = specHair(specPath);
  if (!h) return "";
  return [
    ``,
    `HAIR — this is identity, not styling, and it does not change between frames:`,
    `${h}`,
    `It is exactly as in the reference sheet. Do not restyle it, do not change the number of`,
    `braids or plaits, do not tie it differently, do not tuck it away, do not add or remove a`,
    `fringe. If the pose would move it, it moves the way that hair moves — it does not become`,
    `different hair.`,
  ].join("\n");
}

/** The build, stated on its own. See the note on hairText — same reasoning, higher stakes. */
export function buildText(specPath: string): string {
  const spec = JSON.parse(readFileSync(specPath, "utf8"));
  const r = spec.resolved?.find((x: { item: string }) => x.item === "build");
  const b = r?.value || r?.partial;
  if (!b) return "";
  return [
    ``,
    `BUILD — this is the person's actual body and it does not change between frames:`,
    `${b}`,
    `Reproduce it exactly. Do NOT slim them down, do NOT make them heavier, do NOT add muscle`,
    `definition they do not have or take away what they do. An athletic photograph is not a`,
    `licence to redraw somebody's body — this is a real person and the picture is for them.`,
  ].join("\n");
}

/**
 * WHERE THE BADGE SITS, as an absolute sentence.
 *
 * It was a per-frame revision note before this, which is the wrong shape for it twice over.
 * A revision reaches ONE frame — so the hero got the corrected position and action2 and
 * action3 kept putting the badge out on the chest side, and the three frames that get
 * composited into one poster disagreed about the shirt. And a badge position is a settled
 * FACT about the garment, which is what `_spec.json` is for; `revise.ts` says so in its own
 * header. Stated here it reaches every pose, the kit plate and the judge from one place.
 *
 * Written as a POSITION, never as a correction of one: "on the centreline, below the collar,
 * above the number" is a constraint the model cannot satisfy wrongly, where "not on the left
 * chest" hands it the wrong answer to think about.
 */
export function specCrestPlacement(specPath: string): string {
  const spec = JSON.parse(readFileSync(specPath, "utf8"));
  return spec.crest?.use ? String(spec.crest.placement ?? "") : "";
}

export const bestPortrait = (specPath: string): string | null =>
  JSON.parse(readFileSync(specPath, "utf8")).bestPortrait ?? null;

export function specText(specPath: string): string {
  const spec = JSON.parse(readFileSync(specPath, "utf8"));
  const lines: string[] = [
    `THE KIT — these are settled decisions, not suggestions. Do not substitute anything.`,
  ];
  // ONE CLEAN STATEMENT PER ITEM. The first version wrote "the sport default below, BUT the
  // photographs settle this much" — which points at a default that is usually not printed at
  // all, and leaves the generator holding two half-instructions instead of one whole one.
  // Where there is a description, it IS the decision; where there is none, the default is
  // printed below and that is the decision. Never both.
  for (const r of spec.resolved) {
    // Hair is resolved alongside the wardrobe because it drifts like one, but it must NOT be
    // stated alongside it: under a heading that says "THE KIT", a model reads hair as clothing
    // context and quietly deprioritises it. A girl with two braids in every photograph and in
    // her identity plate came back with one. `hairText` states it on its own instead.
    if (r.item === "hair" || r.item === "build") continue;
    // ANY WRITTEN DECISION WINS, WHATEVER FIELD IT LANDED IN. This read `r.partial` for a
    // default-sourced item and dropped its `value` — so a deliberate default written into
    // `value` ("plain low white ankle socks, not visible so this is the decision") vanished
    // from the item list AND, worse, dropped the item into the blob below, which then
    // printed the sport default's contradicting version of the same thing. Lacrosse went to
    // the judge claiming white socks in one line and charcoal socks four lines later, and a
    // yellow ball against a white one. The judge failed the plate for a contradiction that
    // was real and mine.
    const value = r.value || r.partial;
    if (value) lines.push(`- ${r.item}: ${value}`);
  }
  // ...and the blob is only for items with NO written decision at all, in either field.
  const fromDefaults = spec.resolved.filter((r: { source: string; partial: string; value?: string }) => r.source === "default" && !r.partial && !r.value);
  if (fromDefaults.length) {
    lines.push(
      `- For ${fromDefaults.map((r: { item: string }) => r.item).join(", ")} the photographs did not`,
      `  answer, so use exactly this and nothing else:`,
      spec.defaults,
    );
  }
  // BRANDING FOLLOWS THE SOURCE. An item taken from the customer's photographs keeps whatever
  // manufacturer's mark it really carries — that is their own clothing, appearing incidentally,
  // exactly as it would in any photograph of them. An item that fell back to the sport default
  // is a generic garment we invented, and putting a brand device on it fabricates an
  // association with a company that has nothing to do with this. Same rule as everywhere else
  // in the pipeline: keep what is evidenced, invent nothing.
  const fromPhotos = spec.resolved.filter((r: { source: string; partial: string }) => r.source === "photos" || r.partial);
  if (fromPhotos.length) {
    lines.push(
      `- Where an item above is described from the athlete's own photographs, any manufacturer's`,
      `  logo it genuinely carries stays on it — that is their real clothing.`,
    );
  }
  const invented = spec.resolved.filter((r: { source: string; partial: string; value?: string }) => r.source === "default" && !r.partial && !r.value);
  if (invented.length) {
    lines.push(
      `- ${invented.map((r: { item: string }) => r.item).join(", ")} came from the sport default, so`,
      `  ${invented.length > 1 ? "these are" : "this is"} PLAIN and UNBRANDED: no swoosh, no three`,
      `  stripes, no cat, no jumpman, no trefoil, no wordmark. Do not add a brand device to a`,
      `  garment nobody supplied.`,
    );
  }
  // The generic placement line must not argue with a specific one. Football's jersey carries
  // its badge centred low on the chest, the shirt description said so, and this line then
  // said "LEFT CHEST" three lines later — two instructions for one thing, which is the drift
  // README section 5 blames for the model picking a different half on each run. When the
  // wardrobe description has already placed the badge, it wins and this line stays quiet.
  const shirt = spec.resolved.find((r: { item: string }) => r.item === "shirt");
  const shirtPlacesCrest = /\b(crest|badge)\b/i.test(String(shirt?.value ?? shirt?.partial ?? ""));
  // An explicit `crest.placement` outranks both branches below: pointing at another paragraph
  // ("wherever the shirt description puts it") is still an instruction to go and interpret
  // something, and interpretation is what moved the badge in the first place. When the spec
  // states the position, state the position.
  const placement = spec.crest.use ? String(spec.crest.placement ?? "") : "";
  lines.push(spec.crest.use
    ? placement
      ? `- The club crest sits ${placement} That position is settled and is the same in every frame.`
      : shirtPlacesCrest
        ? `- The club crest goes exactly where the shirt description above puts it, and nowhere else.`
        : `- The club crest goes small on the LEFT CHEST, about three fingers wide.`
    : `- NO badge and NO logo anywhere. The shirt is plain, and that is intended.`);
  return lines.join("\n");
}
