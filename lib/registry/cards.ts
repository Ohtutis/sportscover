// Game Day Edition — collectible card registry (source of truth).
//
// File-based for now; migrate to the DB (db/schema.ts) once volume grows.
// Every printed card carries a QR code that resolves to /c/<cardId>, which
// renders from this registry. Card display page is still TODO (see README).

export interface CardRecord {
  /** Systematic ID, e.g. "GDE-SN-BKB-2026-23". Auto-built via makeCardId(). */
  cardId: string;
  /** Athlete/owner slug — groups all of a person's cards, e.g. "nia-brooks". */
  athleteId: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string;
  position: string;
  team: string;
  season: string;
  classOf?: string;
  ppg?: string;
  apg?: string;
  rpg?: string;
  /** Personalized highlight line shown under "OWN THE MOMENT". */
  playerHighlight?: string;
  /** Sport code used in the card ID, e.g. "BKB". */
  sportCode: string;
  /** Finish/style, e.g. "Stadium Night". */
  styleName: string;
  /** Optional print serial, e.g. "01/25". */
  serial?: string;
  createdAt: string;
}

/** Finish name -> short code used in the card ID. */
export const STYLE_CODES: Record<string, string> = {
  "Stadium Night": "SN",
  "Chrome All-Star": "CA",
  "Fire & Smoke": "FS",
  "Neon Future": "NF",
  "Vintage Card": "VC",
};

export function styleCode(styleName: string): string {
  return (
    STYLE_CODES[styleName] ??
    styleName
      .split(/\s+/)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
  );
}

/** Build the systematic card ID: GDE-<style>-<sport>-<season>-<number>. */
export function makeCardId(p: {
  sportCode: string;
  styleName: string;
  season: string;
  jerseyNumber: string;
}): string {
  return `GDE-${styleCode(p.styleName)}-${p.sportCode}-${p.season}-${p.jerseyNumber}`;
}

/** Production origin for printed QR codes. Override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gamedayedition.com"
).replace(/\/$/, "");

export function cardUrl(cardId: string): string {
  return `${SITE_URL}/c/${cardId}`;
}

// --- Registry ---------------------------------------------------------------

export const cards: CardRecord[] = [
  {
    cardId: "GDE-SN-BKB-2026-23",
    athleteId: "nia-brooks",
    firstName: "Nia",
    lastName: "Brooks",
    jerseyNumber: "23",
    position: "Point Guard",
    team: "Northside Wolves",
    season: "2026",
    classOf: "2028",
    ppg: "18.4",
    apg: "6.2",
    rpg: "5.3",
    playerHighlight: "2026 All-Conference First Team · Team Captain.",
    sportCode: "BKB",
    styleName: "Stadium Night",
    serial: "01/25",
    createdAt: "2026-08-19",
  },
];

export function getCard(cardId: string): CardRecord | undefined {
  return cards.find((c) => c.cardId === cardId);
}

export function getAthleteCards(athleteId: string): CardRecord[] {
  return cards.filter((c) => c.athleteId === athleteId);
}
