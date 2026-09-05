/**
 * WHICH PHOTOGRAPH DOES WHICH JOB — declared by the customer's own file names.
 *
 * WHY THIS EXISTS
 * Until now every cleared photograph was handed to every stage as an equal, and the pipeline
 * guessed the rest: intake picked the "body reference" by sharpness, the plate averaged four
 * faces into one, and nothing ever said which frame was the three-quarter view. The guesses
 * were reasonable and still wrong often enough to cost re-rolls — a 151 px street photo and a
 * 417 px portrait carry very different amounts of face, and only a human knows which one
 * actually looks like the person.
 *
 * So the roles are NAMED, in the one place a non-technical person can name them: the file name.
 * Rename the file, the pipeline obeys. Nothing else changes, and a folder with no named roles
 * behaves exactly as it did before.
 *
 *   Hero portrait.jpg     the face, straight to camera — the likeness everything is judged on
 *   Hero portrait 2.png   a second front portrait, when there is one
 *   Hero side.png         the face turned three-quarters — frame 2 of the face plate
 *   body.png              the whole person standing: proportions only, the face may be tiny
 *   kit.png               their real playing kit, when they sent one
 *
 * Matching is case-insensitive and ignores spaces, underscores and hyphens, so "Hero Side",
 * "hero-side" and "HERO_SIDE" are the same thing. A trailing number is a duplicate of the
 * same role, not a different one.
 */
export type PhotoRole = "portrait" | "side" | "body" | "kit";

const norm = (p: string) =>
  (p.split("/").pop() ?? "").replace(/\.[a-z0-9]+$/i, "").replace(/[\s_-]+/g, " ").trim().toLowerCase();

/** The role this file name declares, or null when it declares none. */
export function roleOf(path: string): PhotoRole | null {
  const n = norm(path);
  // ORDER MATTERS: "hero portrait" and "hero side" both start with "hero", and a bare "side"
  // or "body" is just as clear, so each pattern is anchored on the word that decides.
  if (/^(hero )?portrait( \d+)?$/.test(n) || /^hero portrait/.test(n)) return "portrait";
  if (/^(hero )?side( \d+)?$/.test(n) || /^hero side/.test(n)) return "side";
  if (/^(hero )?body( \d+)?$/.test(n) || /^hero body/.test(n)) return "body";
  if (/^(hero )?kit( \d+)?$/.test(n) || /^hero kit/.test(n)) return "kit";
  return null;
}

/** Every declared role in a photo set, in the order the files were given. */
export function rolesIn(paths: string[]): Map<PhotoRole, string[]> {
  const out = new Map<PhotoRole, string[]>();
  for (const p of paths) {
    const r = roleOf(p);
    if (!r) continue;
    out.set(r, [...(out.get(r) ?? []), p]);
  }
  return out;
}

/** The first file declaring this role, or undefined. */
export const roleFile = (paths: string[], role: PhotoRole): string | undefined =>
  rolesIn(paths).get(role)?.[0];
