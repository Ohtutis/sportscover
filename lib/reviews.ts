// Published reviews (CONTRACTS §4.9). content/reviews/*.json, one review per file, and
// only the ones with `consentToPublish: true` are ever returned. The directory does not exist
// today, so this returns [] and no page renders a reviews block — no stars, no "coming soon",
// no placeholder (spec §8). Server only (fs).

import fs from "node:fs";
import path from "node:path";

export interface Review {
  displayName: string;
  sport: string;
  tier: string;
  text: string;
  source: "site" | "etsy";
  /** ISO date the customer consented to publication. */
  consentAt: string;
  consentToPublish: boolean;
  isFriendsAndFamily?: boolean;
  /** ISO date of the order or review. */
  date: string;
}

export const REVIEWS_DIR = path.join(process.cwd(), "content", "reviews");

function isReview(x: unknown): x is Review {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.displayName === "string" &&
    typeof r.sport === "string" &&
    typeof r.tier === "string" &&
    typeof r.text === "string" &&
    (r.source === "site" || r.source === "etsy") &&
    typeof r.consentAt === "string" &&
    typeof r.consentToPublish === "boolean" &&
    typeof r.date === "string"
  );
}

/** Reviews with consent to publish, newest first; [] when the directory is absent or empty. */
export function publishedReviews(): Review[] {
  if (!fs.existsSync(REVIEWS_DIR)) return [];
  const out: Review[] = [];
  for (const name of fs.readdirSync(REVIEWS_DIR)) {
    if (!name.endsWith(".json")) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(fs.readFileSync(path.join(REVIEWS_DIR, name), "utf8"));
    } catch {
      continue;
    }
    if (isReview(parsed) && parsed.consentToPublish) out.push(parsed);
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
