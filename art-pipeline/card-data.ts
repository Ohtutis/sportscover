// Card content per athlete — the text half of a Figma merge.
//
// `athletes.ts` describes what a person LOOKS like; nothing in it can be printed on a card.
// Position, season stats, the highlight line and the graduation year are card copy, and they
// live here so the art record stays about appearance only.
//
// DRAFTED 2026-08-23 for the 17 sport template files. Every number below is INVENTED — a
// plausible season for that athlete at that age. They are demo props, not claims. Correct
// anything that reads wrong; nothing downstream depends on the values themselves.
//
// FIELD LIMITS (measured on the Figma frames, do not exceed):
//   position   <= 10 chars   card front `meta`, poster is art-only
//   statLabel  <=  6 chars   `stat` chip label
//   statValue  <=  5 chars   `stat` chip value
//   headline   <= 25 chars   `#headline`  (Heritage is the tightest of the six finishes)
//   bio        <= 80 chars   `#bio` -> playerHighlight; wraps to 2 lines, ~41 per line
// `checkCardData()` enforces them; run it before a merge rather than trusting the eye.

import { ATHLETES, athleteBySlug } from "./athletes.js";

export interface Stat {
  /** Chip label, e.g. "PPG", "KILLS", "100M". */
  label: string;
  /** Chip value, e.g. "18.4", "312", "11.94". */
  value: string;
}

export interface CardData {
  /** athletes.ts slug. */
  slug: string;
  /** Position, event or weight class. Shown as `#number · #position`. */
  position: string;
  /** Exactly three; the back card has three chips and they are not optional. */
  stats: [Stat, Stat, Stat];
  /** The line under the headline mark. */
  headline: string;
  /** The one-line profile under it — `#bio`, bound to `playerHighlight`. Wraps to 2 lines. */
  bio: string;
  /** Graduation year. Adults get undefined and the field is hidden. */
  classOf?: string;
  /**
   * TRUE when the sport does not number its athletes. User decision 2026-08-23: where there
   * is no number we do not invent one — the giant ghost NUMBER becomes the ghost SURNAME
   * instead (poster `#number`, card back `#number_ghost`), and the `#number · ` half of the
   * front meta line is hidden along with its separator.
   *
   * The surname MUST fit on ONE line in that slot. `ghostText()` returns what to set; the
   * merge script is responsible for shrinking fontSize until it fits — never for wrapping it.
   */
  numberless?: boolean;
}

/** Season these stats belong to. One place, so a rollover is one edit. */
export const SEASON = "2026";

export const CARD_DATA: CardData[] = [
  { slug: "basketball", bio: "2027 All-Conference First Team · team captain.", position: "GUARD", classOf: "2027",
    headline: "THIS IS MY COURT",
    stats: [{ label: "PPG", value: "18.4" }, { label: "RPG", value: "7.1" }, { label: "APG", value: "4.6" }] },

  { slug: "football", bio: "Three-year starter on the line · 2026 all-district.", position: "OFF. LINE", classOf: "2026",
    headline: "BUILT DIFFERENT",
    stats: [{ label: "PANCK", value: "41" }, { label: "GP", value: "11" }, { label: "GRD", value: "92" }] },

  { slug: "baseball", bio: "Led the Larks in hits · all-region outfield.", position: "OUTFIELD", classOf: "2028",
    headline: "NEXT UP",
    stats: [{ label: "AVG", value: ".341" }, { label: "HR", value: "6" }, { label: "RBI", value: "28" }] },

  { slug: "softball", bio: "School record for strikeouts in a season.", position: "PITCHER", classOf: "2029",
    headline: "THE CIRCLE IS MINE",
    stats: [{ label: "ERA", value: "1.86" }, { label: "K", value: "142" }, { label: "IP", value: "96" }] },

  { slug: "soccer", bio: "Top scorer two seasons running · wears the 10.", position: "MIDFIELD", classOf: "2029",
    headline: "THIS IS MY PITCH",
    stats: [{ label: "GOALS", value: "14" }, { label: "ASST", value: "11" }, { label: "GP", value: "22" }] },

  { slug: "ice-hockey", bio: "Leads the Anvils in points · penalty-kill regular.", position: "CENTER", classOf: "2028",
    headline: "THIS IS MY ICE",
    stats: [{ label: "G", value: "21" }, { label: "A", value: "24" }, { label: "PTS", value: "45" }] },

  { slug: "volleyball", bio: "300+ kills as a junior · all-conference outside.", position: "OUTSIDE", classOf: "2027",
    headline: "ABOVE THE NET",
    stats: [{ label: "KILLS", value: "312" }, { label: "ACES", value: "41" }, { label: "DIGS", value: "188" }] },

  { slug: "lacrosse", bio: "Draw specialist · led the Foxes in ground balls.", position: "MIDFIELD", classOf: "2028",
    headline: "THIS IS MY FIELD",
    stats: [{ label: "GOALS", value: "38" }, { label: "ASST", value: "22" }, { label: "GB", value: "61" }] },

  { slug: "wrestling", bio: "38-3 on the season · regional finalist at 126.", position: "126 LB", classOf: "2027",
    headline: "SIX MINUTES, MINE",
    stats: [{ label: "WINS", value: "38" }, { label: "PINS", value: "21" }, { label: "LOSS", value: "3" }] },

  // --- the six sports that do not number their athletes (surname replaces the ghost number)
  { slug: "cheerleading", bio: "Level 5 flyer · two state titles with the Vanguard.", position: "FLYER", classOf: "2029", numberless: true,
    headline: "FEARLESS AT THE TOP",
    stats: [{ label: "LEVEL", value: "5" }, { label: "TITLE", value: "2" }, { label: "YRS", value: "8" }] },

  { slug: "gymnastics", bio: "Beam is her event · 9.7 season best at thirteen.", position: "ALL-AROUND", classOf: "2031", numberless: true,
    headline: "SMALL FRAME, BIG AIR",
    stats: [{ label: "AA", value: "38.2" }, { label: "BEAM", value: "9.70" }, { label: "VAULT", value: "9.65" }] },

  { slug: "track-field", bio: "School record in the 100 · anchors the relay.", position: "SPRINTS", classOf: "2028",
    headline: "FIRST TO THE LINE",
    stats: [{ label: "100M", value: "11.94" }, { label: "200M", value: "24.31" }, { label: "LJ", value: "5.62" }] },

  { slug: "swimming", bio: "Sprint freestyle · four school records this season.", position: "FREESTYLE", classOf: "2028", numberless: true,
    headline: "THE LANE IS MINE",
    stats: [{ label: "50 FR", value: "23.41" }, { label: "100 FR", value: "51.28" }, { label: "200 FR", value: "1:52" }] },

  { slug: "tennis", bio: "24-4 at first singles · never dropped a home match.", position: "SINGLES", classOf: "2029", numberless: true,
    headline: "POINT BY POINT",
    stats: [{ label: "WINS", value: "24" }, { label: "LOSS", value: "4" }, { label: "RANK", value: "6" }] },

  { slug: "golf", bio: "Sub-75 scoring average · six top-ten finishes.", position: "VARSITY", classOf: "2027", numberless: true,
    headline: "STEADY THROUGH 18",
    stats: [{ label: "AVG", value: "74.2" }, { label: "LOW", value: "68" }, { label: "TOP 10", value: "6" }] },

  { slug: "pickleball-youth", bio: "Junior singles champion · 4.25 rated at sixteen.", position: "SINGLES", classOf: "2028", numberless: true,
    headline: "QUICK HANDS, NO PANIC",
    stats: [{ label: "WINS", value: "31" }, { label: "TITLE", value: "3" }, { label: "RATING", value: "4.25" }] },

  // Ray is the older end of the range, not the coverage tile. Kept so his file can be built
  // the same way if we ever want the adult listing. No classOf — he is not graduating.
  { slug: "pickleball", bio: "Playing since the courts went in · club doubles regular.", position: "DOUBLES", numberless: true,
    headline: "STILL GOT IT",
    stats: [{ label: "WINS", value: "44" }, { label: "YRS", value: "12" }, { label: "RATING", value: "3.75" }] },

  // Skateboarding keeps 12: the number is on the shirt in his approved frames, and the art
  // outranks a tidy assumption about which sports number their athletes.
  { slug: "other-sport", bio: "Street skater · lands it or runs it back, every time.", position: "STREET", classOf: "2028",
    headline: "LAND IT OR RUN IT BACK",
    stats: [{ label: "BEST", value: "86.4" }, { label: "PODIUM", value: "5" }, { label: "COMPS", value: "12" }] },
  /* ---------------------------------------------------------- THE SOCCER AGE LADDER */
  // One club, six ages. Not sport coverage — this set answers "does this fit MY person?",
  // so the copy leans on the age rather than on a scouting line. Same stat shape as soccer.
  { slug: "soccer-age-07", bio: "First season in a real kit · never stops running.", position: "FORWARD", classOf: "2037",
    headline: "FIRST SEASON, ALL IN",
    stats: [{ label: "GOALS", value: "6" }, { label: "ASST", value: "3" }, { label: "GP", value: "12" }] },

  { slug: "soccer-age-10", bio: "Fastest on the pitch · plays both wings.", position: "WINGER", classOf: "2034",
    headline: "FASTEST ON THE PITCH",
    stats: [{ label: "GOALS", value: "11" }, { label: "ASST", value: "7" }, { label: "GP", value: "16" }] },

  { slug: "soccer-age-22", bio: "College striker · nineteen goals in her final year.", position: "STRIKER", classOf: "2026",
    headline: "COLLEGE YEARS, NO REGRETS",
    stats: [{ label: "GOALS", value: "19" }, { label: "ASST", value: "8" }, { label: "GP", value: "21" }] },

  { slug: "soccer-age-32", bio: "Sunday league defender · twenty-four years playing.", position: "DEFENDER",
    headline: "STILL PLAYING SUNDAYS",
    stats: [{ label: "GP", value: "18" }, { label: "CLEAN", value: "7" }, { label: "YRS", value: "24" }] },

  { slug: "soccer-age-50", bio: "Weekend league midfield · still first to the ball.", position: "MIDFIELD",
    headline: "STILL FIRST TO THE BALL",
    stats: [{ label: "GP", value: "15" }, { label: "GOALS", value: "5" }, { label: "YRS", value: "38" }] },
];

export const cardDataBySlug = (slug: string) => CARD_DATA.find((c) => c.slug === slug);

/**
 * What goes in the giant ghost slot: the squad number, or the surname when the sport does
 * not number anyone. Returned uppercase because every ghost slot in the file is uppercase.
 */
export function ghostText(slug: string): string {
  const a = athleteBySlug(slug);
  const c = cardDataBySlug(slug);
  if (!a || !c) throw new Error(`no athlete/card data for "${slug}"`);
  return c.numberless ? a.lastName.toUpperCase() : a.jerseyNumber;
}

// Measured from the Figma file 2026-08-23, minimum across all six finishes.
// Full table and method: docs/ORDER-FIELDS-SPEC.md
const LIMITS = { position: 10, statLabel: 6, statValue: 5, headline: 25, bio: 80 };

/** Mechanical check — a field that overflows is a defect, not a judgement call. */
export function checkCardData(): string[] {
  const errs: string[] = [];
  for (const c of CARD_DATA) {
    const a = athleteBySlug(c.slug);
    if (!a) { errs.push(`${c.slug}: no athlete with this slug`); continue; }
    if (c.position.length > LIMITS.position)
      errs.push(`${c.slug}: position "${c.position}" is ${c.position.length} > ${LIMITS.position}`);
    if (c.headline.length > LIMITS.headline)
      errs.push(`${c.slug}: headline "${c.headline}" is ${c.headline.length} > ${LIMITS.headline}`);
    if (c.bio.length > LIMITS.bio)
      errs.push(`${c.slug}: bio is ${c.bio.length} > ${LIMITS.bio}`);
    if (c.stats.length !== 3) errs.push(`${c.slug}: needs exactly 3 stats, has ${c.stats.length}`);
    for (const s of c.stats) {
      if (s.label.length > LIMITS.statLabel)
        errs.push(`${c.slug}: stat label "${s.label}" is ${s.label.length} > ${LIMITS.statLabel}`);
      if (s.value.length > LIMITS.statValue)
        errs.push(`${c.slug}: stat value "${s.value}" is ${s.value.length} > ${LIMITS.statValue}`);
    }
    // A numbered athlete whose record says "0" is a contradiction: 0 would be printed.
    if (!c.numberless && (a.jerseyNumber === "0" || a.jerseyNumber === ""))
      errs.push(`${c.slug}: jerseyNumber is "${a.jerseyNumber}" but numberless is not set`);
    if (c.numberless && a.jerseyNumber !== "0")
      errs.push(`${c.slug}: numberless but jerseyNumber is "${a.jerseyNumber}"`);
  }
  // Every non-order athlete must have card data, or a template file gets built without copy.
  for (const a of ATHLETES) {
    if (a.order) continue;
    if (!cardDataBySlug(a.slug)) errs.push(`${a.slug}: athlete has no CARD_DATA entry`);
  }
  return errs;
}
