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
  /**
   * The three stat chips on the card back, as they are printed. Sport-neutral, unlike the
   * ppg/apg/rpg fields below: a cheerleader has LEVEL / TITLE / YRS and a lineman has
   * PANCK / GP / GRD. Those three fields are kept only for the older basketball record.
   */
  stats?: { label: string; value: string }[];
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
  "Heritage": "HE",
  "Signature Spotlight": "SS",
  "Prism Rush": "PR",
  // Senior Night — the seventh, occasion-led style (2026-08-27). Lives on its own page in the
  // sport files; the Etsy Senior Night listing prints this code.
  "Senior Night": "SR",
};
// Neon Future and Vintage Card were dropped from the lineup on 2026-08-19 and are gone from
// this table on purpose: leaving them in invites a card id for a finish we do not sell.
// "Heritage" needs an explicit entry — the initials fallback would give it "H", not "HE".

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
  // The three cards printed on the Etsy listing images. The QR codes on those images are REAL
  // and a shopper can scan them from the search grid, so every id shown there resolves here.
  {
    cardId: "GDE-SN-BKB-2026-12",
    athleteId: "marcus-ellison",
    firstName: "Marcus",
    lastName: "Ellison",
    jerseyNumber: "12",
    position: "Guard",
    team: "Cedar Ridge Bears",
    season: "2026",
    classOf: "2027",
    ppg: "18.4",
    rpg: "7.1",
    apg: "4.6",
    stats: [
      { label: "PPG", value: "18.4" },
      { label: "RPG", value: "7.1" },
      { label: "APG", value: "4.6" },
    ],
    playerHighlight: "2027 All-Conference First Team \u00b7 team captain.",
    sportCode: "BKB",
    styleName: "Stadium Night",
    createdAt: "2026-08-27",
  },
  {
    // The Senior Night listing's demo card \u2014 the QR on its listing images resolves here.
    cardId: "GDE-SR-BKB-2026-12",
    athleteId: "marcus-ellison",
    firstName: "Marcus",
    lastName: "Ellison",
    jerseyNumber: "12",
    position: "Guard",
    team: "Cedar Ridge Bears",
    season: "2025\u201326",
    classOf: "2026",
    ppg: "18.4",
    rpg: "7.1",
    apg: "4.6",
    stats: [
      { label: "PPG", value: "18.4" },
      { label: "RPG", value: "7.1" },
      { label: "APG", value: "4.6" },
    ],
    playerHighlight: "Career highs \u00b7 FR 2023 \u2013 SR 2026 \u00b7 \u201cLeave it better than you found it.\u201d",
    sportCode: "BKB",
    styleName: "Senior Night",
    createdAt: "2026-08-27",
  },
  {
    cardId: "GDE-FS-FTB-2026-54",
    athleteId: "tui-faagata",
    firstName: "Tui",
    lastName: "Fa'agata",
    jerseyNumber: "54",
    position: "Off. Line",
    team: "Millbrook Bison",
    season: "2026",
    classOf: "2026",
    stats: [
      { label: "PANCK", value: "41" },
      { label: "GP", value: "11" },
      { label: "GRD", value: "92" },
    ],
    playerHighlight: "Three-year starter on the line \u00b7 2026 all-district.",
    sportCode: "FTB",
    styleName: "Fire & Smoke",
    createdAt: "2026-08-27",
  },
  {
    cardId: "GDE-HE-FTB-2026-54",
    athleteId: "tui-faagata",
    firstName: "Tui",
    lastName: "Fa'agata",
    jerseyNumber: "54",
    position: "Off. Line",
    team: "Millbrook Bison",
    season: "2026",
    classOf: "2026",
    stats: [
      { label: "PANCK", value: "41" },
      { label: "GP", value: "11" },
      { label: "GRD", value: "92" },
    ],
    playerHighlight: "Three-year starter on the line \u00b7 2026 all-district.",
    sportCode: "FTB",
    styleName: "Heritage",
    createdAt: "2026-08-27",
  },
  {
    // Cheerleading does not number its athletes, so there is no jersey number to put in the id.
    // The card is numbered as the FIRST of its edition instead — "01" is an edition number here,
    // not a shirt number, and nothing on the card claims otherwise.
    cardId: "GDE-PR-CHR-2026-01",
    athleteId: "amara-boyd",
    firstName: "Amara",
    lastName: "Boyd",
    jerseyNumber: "01",
    position: "Flyer",
    team: "Vale Prep Vanguard",
    season: "2026",
    classOf: "2029",
    stats: [
      { label: "LEVEL", value: "5" },
      { label: "TITLE", value: "2" },
      { label: "YRS", value: "8" },
    ],
    playerHighlight: "Level 5 flyer \u00b7 two state titles with the Vanguard.",
    sportCode: "CHR",
    styleName: "Prism Rush",
    createdAt: "2026-08-27",
  },
  {
    cardId: "GDE-SS-CHR-2026-01",
    athleteId: "amara-boyd",
    firstName: "Amara",
    lastName: "Boyd",
    jerseyNumber: "01",
    position: "Flyer",
    team: "Vale Prep Vanguard",
    season: "2026",
    classOf: "2029",
    stats: [
      { label: "LEVEL", value: "5" },
      { label: "TITLE", value: "2" },
      { label: "YRS", value: "8" },
    ],
    playerHighlight: "Level 5 flyer \u00b7 two state titles with the Vanguard.",
    sportCode: "CHR",
    styleName: "Signature Spotlight",
    createdAt: "2026-08-27",
  },
];

export function getCard(cardId: string): CardRecord | undefined {
  return cards.find((c) => c.cardId === cardId);
}

export function getAthleteCards(athleteId: string): CardRecord[] {
  return cards.filter((c) => c.athleteId === athleteId);
}
