// The human sign-off lock, shared by every stage that could overwrite artwork.
//
// This lived only inside qa.ts, which meant qa.ts refused to re-roll an approved cell
// while gen-backgrounds.ts happily regenerated it — so a data-model change plus a
// `--sport all` run quietly replaced frames the user had already accepted.

import { existsSync, readFileSync } from "node:fs";

const FILE = "art-pipeline/approved.json";

export function approvedSet(): Set<string> {
  if (!existsSync(FILE)) return new Set();
  try {
    return new Set(JSON.parse(readFileSync(FILE, "utf8")).approved ?? []);
  } catch {
    return new Set();
  }
}

export const isApproved = (finish: string, sport: string) =>
  approvedSet().has(`${finish}/${sport}`);
