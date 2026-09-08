// Alt-text patterns (COPY §0.5). Every image on the site gets its alt from here or from a COPY
// literal — never improvised. The five numberless sports never get a number, in alt text or
// anywhere else: `assertNumberless` throws outside production so the defect is caught in a test,
// not by a parent.

import { isNumberless, type Sport } from "./catalog/sports";
import type { Style } from "./catalog/styles";

export const FICTIONAL_SUFFIX = " — example artwork, fictional athlete";
const EXAMPLE_SUFFIX = " — example, fictional athlete";

/** "Ice Hockey" → "ice hockey"; "Track & Field" → "track & field". */
export const sportWord = (sport: Pick<Sport, "name">): string => sport.name.toLowerCase();

/** Throws (outside production) when alt text for a numberless sport carries a jersey number. */
export function assertNumberless(sport: Pick<Sport, "code" | "name">, text: string): string {
  if (isNumberless(sport) && /(?:#|\bno\.?\s?|\bnumber\s)\d/i.test(text) && process.env.NODE_ENV !== "production") {
    throw new Error(`alt: "${text}" gives ${sport.name} a jersey number — that sport never carries one`);
  }
  return text;
}

/** Optional trailing detail (e.g. a team name) goes through the numberless guard like everything else. */
const withDetail = (sport: Pick<Sport, "code" | "name">, text: string, detail?: string): string =>
  assertNumberless(sport, detail ? `${text} — ${detail}` : text);

export function altCardFront(sport: Sport, finish: Style, fictional = true, detail?: string): string {
  return withDetail(sport, `Custom ${sportWord(sport)} trading card front — ${finish.name} finish${fictional ? FICTIONAL_SUFFIX : ""}`, detail);
}

export function altCardBack(sport: Sport, finish: Style, fictional = true, detail?: string): string {
  return withDetail(
    sport,
    `Custom ${sportWord(sport)} trading card back with season stats, registered card ID and QR code — ${finish.name} finish${fictional ? FICTIONAL_SUFFIX : ""}`,
    detail,
  );
}

export function altPoster(sport: Sport, finish: Style, fictional = true, detail?: string): string {
  return withDetail(sport, `Custom ${sportWord(sport)} poster, 18 × 24 in — ${finish.name} finish${fictional ? FICTIONAL_SUFFIX : ""}`, detail);
}

export function altRoom(sport: Sport, finish: Style, fictional = true, detail?: string): string {
  return withDetail(sport, `Custom ${sportWord(sport)} poster hung on a bedroom wall — ${finish.name} finish${fictional ? FICTIONAL_SUFFIX : ""}`, detail);
}

/** Generated "before" photo — always fictional, always says so. */
export function altBefore(sport: Sport, detail?: string): string {
  return withDetail(sport, `Phone photo of a fictional ${sportWord(sport)} player${detail ? ` ${detail}` : ""} — the starting point; photo generated`);
}

export function altProof(sport: Sport, finish: Style): string {
  return assertNumberless(sport, `Watermarked proof of a custom ${sportWord(sport)} card — ${finish.name} finish${EXAMPLE_SUFFIX}`);
}

/** Count-neutral certificate art only. */
export function altCertificate(): string {
  return `Printed Certificate of Authenticity for a Game Day Edition card${EXAMPLE_SUFFIX}`;
}

/** Process artefacts (COPY §0.5). */
export const ALT_PROCESS = {
  verdict: "Photo-check verdict as the parent reads it — example order",
  plate: "Three views of a fictional athlete, built from their photos",
  verification: "A shot beside the approved reference — verification sheet, fictional athlete",
} as const;

export const ALT_FOUNDER = "John Birch, designer and founder of Game Day Edition";
export const ALT_SHIELD = "Game Day Edition shield";
export const ALT_WORDMARK = "Game Day Edition wordmark";

/** /c flip faces (COPY §2.15 (2)). */
export function altRegisteredFront(sport: Sport, finish: Style, fictional: boolean): string {
  return assertNumberless(sport, `Registered card front — ${sportWord(sport)} — ${finish.name} finish${fictional ? FICTIONAL_SUFFIX : ""}`);
}
export const ALT_REGISTERED_BACK = "Registered card back — season stats, registered card ID and QR code";

/** The Senior Night back (COPY §2.5 (3)). */
export const ALT_SENIOR_BACK =
  "Back of a Senior Night trading card: career highs, class year, four-year career line and senior quote — example artwork, fictional athlete";

/** The to-scale sheet (DESIGN §4.15). */
export const ALT_TO_SCALE = "To-scale sheet: 18 × 24 and 24 × 36 in posters beside a 5 ft 9 in figure";

/** The /c flip video (COPY §2.15 (2)). */
export const videoLabel = (firstName: string, lastName: string, finish: Style): string =>
  `Card flip video, ${firstName} ${lastName}, ${finish.name} finish`;
