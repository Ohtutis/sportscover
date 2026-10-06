// UI microcopy for /free-proof that lib/intake/copy.ts does not carry: field labels, hints, button names
// and status lines. Everything a parent reads as a SENTENCE about the offer (H1, steps, sections, consents,
// errors, thanks page) stays in lib/intake/copy.ts or lib/intake/types.ts — this file holds only the
// words a form needs around them. Voice: a parent is reading (DESIGN §3). No price, no delivery clock and
// no count is ever written here: those come from the contract helpers.

import { PHOTO_RULES } from "../../lib/intake/types";

const MB = Math.round(PHOTO_RULES.maxBytes / (1024 * 1024));

export const UI = {
  breadcrumb: "Free proof",
  newTab: "(opens in a new tab)",

  products: {
    optionsLegend: (name: string): string => `${name}: choose one`,
  },

  style: {
    classOf: "Class of",
    classOfPlaceholder: "Choose the class year",
    eventDate: "Senior night date",
  },

  athlete: {
    name: "Athlete's name",
    firstName: "First name",
    lastName: "Last name",
    nameHint: "First name fits best up to 12 letters, last name up to 9 — longer is fine, the type scales.",
    number: "Jersey number",
    numberHint: "1–3 digits. Leave it empty if they don't wear one.",
    position: "Position or event",
    positionPlaceholder: "e.g. Point guard",
    team: "Team or club",
    teamPlaceholder: "e.g. Cedar Ridge Bears",
    season: "Season",
    headline: "Headline or quote",
    headlineHint: "A line for the card. Fits best up to 25 characters.",
    headlinePlaceholder: "e.g. This is my court",
    stats: "Stats",
    statsHint: "Up to three — a number and a short label, e.g. 18.4 and PPG.",
    statValue: (n: number): string => `Stat ${n} — number`,
    statLabel: (n: number): string => `Stat ${n} — label`,
    notes: "Notes",
    notesPlaceholder: "A nickname, a moment to feature, a spelling to double-check…",
  },

  photos: {
    types: `JPG, PNG, HEIC or WebP — the original files from the phone, up to ${MB} MB each.`,
    examples: "Two examples",
    count: (n: number): string => `${n} of ${PHOTO_RULES.max} photos`,
    none: `No photos yet — ${PHOTO_RULES.min} is the minimum.`,
    needMore: (n: number): string => `Add ${n} more — ${PHOTO_RULES.min} is the minimum.`,
    enough: "Enough for the proof.",
    full: "That's the maximum.",
    total: (size: string): string => `Total ${size}`,
    remove: (name: string): string => `Remove ${name}`,
    rejected: {
      type: "not a JPG, PNG, HEIC or WebP file",
      size: `over ${MB} MB`,
      duplicate: "already added",
      limit: `only ${PHOTO_RULES.max} photos fit`,
    },
    rejectedLine: (name: string, reason: string): string => `${name} wasn't added — ${reason}.`,
    mustHavesTitle: "The four that matter most",
    avoidTitle: "Leave these out",
    guideLink: "The full photo guide",
    crest: "Crest",
    crestChoose: "Choose the crest file",
    crestRemove: "Remove the crest",
    crestRejected: (name: string): string => `${name} wasn't added — a crest must be a PNG, SVG, JPG, HEIC or WebP under 10 MB.`,
  },

  contact: {
    name: "Your name",
    email: "Email",
    emailHint: "The proof and our questions come to this address.",
  },

  summary: {
    sport: "Sport",
    style: "Style",
    recommend: "We'll recommend one",
    setPriced: "Cards and poster priced as a set",
  },

  submit: {
    invalid: (n: number): string =>
      n === 1 ? "One thing needs a look before we can build the proof — it's highlighted above." : `${n} things need a look before we can build the proof — the first is highlighted above.`,
    network: "We couldn't reach our server. Check the connection and press the button again — nothing you entered was lost.",
    server: "Something went wrong on our side. Press the button again in a moment — nothing you entered was lost.",
    challenge: "The quick security check didn't go through. Reload the page and send again.",
    mailtoSubject: "Free proof request",
    noscript: (email: string): string =>
      `Sending photos from this page needs JavaScript. Email them with the details to ${email} and we'll build the proof the same way.`,
  },

  thanks: {
    home: "Back to the home page",
    guide: "The photo guide",
  },
} as const;

/** Example stats per sport — placeholders only, never data (value, label). */
export const STAT_EXAMPLES: Record<string, readonly (readonly [string, string])[]> = {
  basketball: [["18.4", "PPG"], ["7.2", "RPG"], ["4.1", "APG"]],
  football: [["1,204", "YDS"], ["14", "TD"], ["62", "TKL"]],
  baseball: [[".342", "AVG"], ["9", "HR"], ["41", "RBI"]],
  softball: [[".388", "AVG"], ["7", "HR"], ["35", "RBI"]],
  soccer: [["21", "GOALS"], ["9", "AST"], ["38", "GAMES"]],
  "ice-hockey": [["24", "G"], ["31", "A"], ["55", "PTS"]],
  volleyball: [["312", "KILLS"], ["188", "DIGS"], ["41", "ACES"]],
  lacrosse: [["48", "G"], ["22", "A"], ["70", "GB"]],
  wrestling: [["32-4", "W-L"], ["18", "PINS"], ["152", "LBS"]],
  cheerleading: [["4", "YEARS"], ["2", "TITLES"], ["9", "COMPS"]],
  gymnastics: [["37.9", "AA"], ["9.6", "BEAM"], ["9.5", "VAULT"]],
  "track-field": [["11.24", "100M"], ["23.1", "200M"], ["6.1m", "LJ"]],
  swimming: [["24.1", "50 FR"], ["52.8", "100 FR"], ["1:02", "100 BK"]],
  tennis: [["18-3", "W-L"], ["2", "SEED"], ["4", "TITLES"]],
  golf: [["74.2", "AVG"], ["3", "WINS"], ["68", "LOW"]],
  pickleball: [["4.5", "DUPR"], ["22-6", "W-L"], ["3", "MEDALS"]],
  "other-sport": [["4", "YEARS"], ["2", "WINS"], ["12", "EVENTS"]],
};

export const STAT_EXAMPLES_DEFAULT: readonly (readonly [string, string])[] = [["18.4", "PPG"], ["21", "GOALS"], ["24.1", "TIME"]];
