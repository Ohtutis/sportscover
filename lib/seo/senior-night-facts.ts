// The fact table behind /senior-night/[sport] (SEO plan 2026-10-06, docs/SEO-PLAN-GDE-2026-10.md §4;
// spec §4.3: "the same spine with the sport's SR art, the measured word order in the H1, the sport's
// FAQ"). One row per sport the hub names (COPY §2.5 (4): nine sports, never dance, track, band or
// lacrosse). The template reads this row, lib/catalog/sports.ts, lib/capacity.ts and the canon, and
// nothing else — so two spokes can never share a sentence by accident (tests/seo-families.test.ts).
//
// Head phrases keep the measured WORD ORDER (etsy/SEO/MASTER-KEYWORD-PLAN-2026-09-07.md §C, §SN
// banners): "senior night volleyball" and "football senior night" are different searches, and each
// spoke owns the bigger one. The figures are Etsy Marketplace Insights, 30-day windows, dated in
// `measured` — Etsy demand standing in for Google demand until Search Console has rows. Never printed.
//
// "When the night falls" is typical US high-school timing and is written as such; the only dates a
// spoke prints are the ones lib/capacity.ts computes from the date the parent types.
//
// `updatedAt` is the page's lastmod: it moves only when a fact in its row changes (master plan §6).

import { sportBySlug, type Sport } from "../catalog/sports";

export interface SeniorNightQuestion {
  id: string;
  q: string;
  a: string;
}

export interface SeniorNightFacts {
  slug: string;
  /** The measured head phrase in the searcher's word order. */
  head: { phrase: string; searches: number; measured: string; note?: string };
  /** <title> head phrase — ≤ 60 with " | Game Day Edition". */
  titleHead: string;
  /** The H1: the head phrase, uppercase, with a full stop. */
  h1: string;
  /** ≤ 155 characters. */
  description: string;
  /** One sentence under the H1, true today. */
  verdict: string;
  /** When the night usually falls — typical, never a promise — and the month it peaks in (1–12) for the copy's season word. */
  when: { line: string; peakMonth: number };
  /** The walk: what happens on the night, in this sport's words (one sentence). */
  ritual: string;
  /** What the senior edition's BACK carries for this sport (the shared SR facts come from the canon). */
  backLine: string;
  /** Photo notes for a senior: what to send now, what comes after the night. Two to three sentences. */
  photoNotes: string[];
  /** lib/assets.ts keys — rendered only when they exist (ice hockey has no SR front yet, GAPS #17). */
  art: { card?: string; wall?: string };
  /** The sport's own senior-night questions, answered from the canon. Two to three. */
  questions: SeniorNightQuestion[];
  /** Blog slugs about this sport's senior night — rendered only while they exist. */
  posts: string[];
  /** YYYY-MM-DD — the last real change to the facts above. */
  updatedAt: string;
}

const MEASURED = "2026-09-07";
const SN_BANNER_MEASURED = "2026-10-02";

export const SENIOR_NIGHT_FACTS: SeniorNightFacts[] = [
  {
    slug: "football",
    head: { phrase: "football senior night", searches: 1030, measured: SN_BANNER_MEASURED, note: "senior night football 1,562 is the banner listing's order; the set owns this one" },
    titleHead: "Football Senior Night Gift: Card Set",
    h1: "FOOTBALL SENIOR NIGHT.",
    description:
      "Football senior night gift from your player's photos: the gold senior edition card and poster with class year, four-year line and quote. Proof first.",
    verdict: "The last home game, kept: a gold senior edition built from their own photos, proofed free before anything prints.",
    when: { line: "The last home game of the regular season, usually in late October, before kickoff.", peakMonth: 10 },
    ritual: "Each senior walks to midfield with their parents while the announcer reads the name, the position and the plans after graduation.",
    backLine: "Position and number, career highs as stat chips, the four-year line FR · SO · JR · SR, the senior quote and the athlete signature line, with SENIOR EDITION · 1 OF 1 beside the registered card ID.",
    photoNotes: [
      "Send this season's photos now: one bare-headed close-up in daylight, one in the full kit with the helmet on, one full-body, one with the head turned each way.",
      "The midfield walk photo is taken on the night, after the card is made; it belongs on the poster you print later, not on the card.",
      "Four years of team photos help the four-year line only as reference; the card wears this season's kit.",
    ],
    art: { card: "sn.sport.football.front", wall: "wall.football" },
    questions: [
      {
        id: "q-sn-football-when",
        q: "When is football senior night?",
        a: "At the last home game of the regular season, usually in late October. Tell us your date and the proof is scheduled against it; the senior night page has the order-by calculator for the printed set.",
      },
      {
        id: "q-sn-football-banner",
        q: "Is there a football senior night banner?",
        a: "Yes, built from the same photos: printed vinyl at 1 × 2, 2 × 4 or 3 × 6 ft, or the full-size file to print near home. It ships separately from the card and poster.",
      },
      {
        id: "q-sn-football-late",
        q: "Senior night is next week. What can still be done?",
        a: "The digital files, within 1–2 business days of your order, then the printed set after the night. Gift the digital first and print the gift note from the senior night page.",
      },
    ],
    posts: ["senior-night-football-gift-ideas-poster-cards-banner-blanket"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "volleyball",
    head: { phrase: "senior night volleyball", searches: 932, measured: MEASURED, note: "volleyball senior night gifts 874 and volleyball senior night 1,200 sit beside it; October is 20x the rest of the year" },
    titleHead: "Senior Night Volleyball Gift: Card Set",
    h1: "SENIOR NIGHT VOLLEYBALL.",
    description:
      "Senior night volleyball gift from your player's photos: the gold senior edition card and poster with class year, four-year line and quote. Proof first.",
    verdict: "The last home match, kept: a gold senior edition built from their own photos, proofed free before anything prints.",
    when: { line: "The last home match of the regular season, usually in October, before the first serve.", peakMonth: 10 },
    ritual: "Each senior is introduced at the net with their parents, flowers in hand, while the gym reads the name and the number off the banner.",
    backLine: "Position and number, career highs as stat chips (kills, digs, aces), the four-year line FR · SO · JR · SR, the senior quote and the athlete signature line, with SENIOR EDITION · 1 OF 1 beside the registered card ID.",
    photoNotes: [
      "Gym light hides the face: send one crisp close-up taken somewhere bright, plus the match photos.",
      "A libero's jersey is a different color; say which jersey the senior edition wears.",
      "The ceremony photo at the net is taken on the night; it goes on the poster later, not on the card.",
    ],
    art: { card: "sn.sport.volleyball.front", wall: "wall.volleyball" },
    questions: [
      {
        id: "q-sn-volleyball-when",
        q: "When is volleyball senior night?",
        a: "At the last home match of the regular season, usually in October. Mention your date when you reply to our confirmation email; the senior night page has the order-by calculator that says which pieces still make it.",
      },
      {
        id: "q-sn-volleyball-ideas",
        q: "What do volleyball parents give on senior night?",
        a: "The usual table has flowers, a balloon and a poster. The senior edition is the piece that outlasts the night: the card with the four-year line, the poster for the wall, and a banner for the gym if you want one.",
      },
      {
        id: "q-sn-volleyball-team",
        q: "Can the whole senior class order together?",
        a: "Yes. Email the sport, the number of seniors and the date; every family sends their own photos and approves their own proof, and the cards are built one at a time.",
      },
    ],
    posts: ["senior-night-volleyball-gifts-poster-ideas-timeline"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "soccer",
    head: { phrase: "soccer senior night", searches: 698, measured: SN_BANNER_MEASURED, note: "soccer senior night gifts 317 Very high is the converting form" },
    titleHead: "Soccer Senior Night Gift: Card Set",
    h1: "SOCCER SENIOR NIGHT.",
    description:
      "Soccer senior night gift from your player's photos: the gold senior edition card and poster with class year, four-year line and senior quote. Proof first.",
    verdict: "The last home game on the pitch, kept in gold: a senior edition from their own photos, with the proof before the payment.",
    when: { line: "The last home game of the regular season, usually in October for high school teams.", peakMonth: 10 },
    ritual: "Each senior is walked across the pitch to the center circle by their parents while the name and the number are read out.",
    backLine: "Position and number, career highs as stat chips (goals, assists, clean sheets), the four-year line FR · SO · JR · SR, the senior quote and the athlete signature line, with SENIOR EDITION · 1 OF 1 beside the registered card ID.",
    photoNotes: [
      "Soccer photos are shot from far away: send the sideline phone photo where the face fills a fifth of the frame.",
      "One flat photo of the shirt gets the crest right the first time.",
      "The center-circle walk is photographed on the night; it belongs on the poster later.",
    ],
    art: { card: "sn.sport.soccer.front", wall: "wall.soccer" },
    questions: [
      {
        id: "q-sn-soccer-when",
        q: "When is soccer senior night?",
        a: "At the last home game of the regular season, usually in October for high school teams, and in spring for clubs that play a spring season. Tell us the date in your reply to the confirmation email and we work the proof back from it.",
      },
      {
        id: "q-sn-soccer-crest",
        q: "Will the senior card show our club crest?",
        a: "Yes, copied exactly from your photos or the crest file you attach, and never a league mark. The gold senior finish keeps the crest where the kit carries it.",
      },
      {
        id: "q-sn-soccer-keeper",
        q: "Our senior is the keeper. Does that change the card?",
        a: "Only the kit: a keeper's jersey and gloves are copied from your photos like any other kit. Tell us on the form that the front should show the keeper's kit.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
  {
    slug: "cheerleading",
    head: { phrase: "cheer senior night", searches: 424, measured: SN_BANNER_MEASURED, note: "senior night cheer 445 is the banner's order; the set owns this one" },
    titleHead: "Cheer Senior Night Gift: Card Set",
    h1: "CHEER SENIOR NIGHT.",
    description:
      "Cheer senior night gift from your cheerleader's photos: the gold senior edition card and poster with class year and four-year line. No number. Proof first.",
    verdict: "The last home game, kept: a gold senior edition built from their own photos, no number anywhere, proofed free before anything prints.",
    when: { line: "Usually the football team's senior night in October or November; some squads hold their own at the last home basketball game.", peakMonth: 10 },
    ritual: "Each senior cheerleader is walked onto the track or the court with their parents while the squad forms a tunnel and the name is read.",
    backLine: "Squad, position, level and years on the team, career highlights as stat chips, the four-year line FR · SO · JR · SR, the senior quote and the athlete signature line, with SENIOR EDITION · 1 OF 1 beside the registered card ID. No number anywhere, because the uniform has none.",
    photoNotes: [
      "Send one ground-level close-up; a stunt photo puts the flyer small and far away.",
      "The bow and the uniform are the kit: one photo exactly as worn on game day.",
      "Say which uniform the senior edition wears if the squad has a sideline and a competition one.",
    ],
    art: { card: "sn.sport.cheerleading.front", wall: "wall.cheerleading" },
    questions: [
      {
        id: "q-sn-cheer-number",
        q: "Cheer has no number. What goes on the senior card?",
        a: "Their name and the squad crest on the front, and the back carries the squad, the position, the level and the years on the team beside the four-year line and the senior quote.",
      },
      {
        id: "q-sn-cheer-when",
        q: "When is cheer senior night?",
        a: "Usually on the football team's senior night, in October or November, and sometimes at the last home basketball game instead. Send us the date with your reply to the confirmation email and the proof is scheduled against it.",
      },
      {
        id: "q-sn-cheer-uniform",
        q: "Sideline or competition uniform on the card?",
        a: "Your choice. Tell us on the form which uniform the front should wear, and the bow and shoes follow from the photos of that uniform.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
  {
    slug: "basketball",
    head: { phrase: "senior night basketball", searches: 110, measured: "2026-09-22", note: "senior night basketball gifts 227 beside it; a November-to-February engine, accepted seasonally" },
    titleHead: "Senior Night Basketball Gift: Card Set",
    h1: "SENIOR NIGHT BASKETBALL.",
    description:
      "Senior night basketball gift from your player's photos: the gold senior edition card and poster with class year, four-year line and quote. Proof first.",
    verdict: "The last home game at center court, kept: a gold senior edition from their own photos, and nothing paid until the proof is approved.",
    when: { line: "The last home game of the regular season, usually in late January or February.", peakMonth: 1 },
    ritual: "Each senior is called to center court with their parents before tip-off while the name, the number and the plans after graduation are read.",
    backLine: "Position and number, career highs as stat chips (points, assists, rebounds), the four-year line FR · SO · JR · SR, the senior quote and the athlete signature line, with SENIOR EDITION · 1 OF 1 beside the registered card ID.",
    photoNotes: [
      "Order before the holidays if the night is in January: the photos you have now are the ones the card is built from.",
      "Gym light hides the face: one crisp close-up taken somewhere bright, plus the game photos.",
      "The center-court walk is photographed on the night; it belongs on the poster later.",
    ],
    art: { card: "sn.sport.basketball.front", wall: "wall.basketball" },
    questions: [
      {
        id: "q-sn-basketball-when",
        q: "When is basketball senior night?",
        a: "At the last home game of the regular season, usually in late January or February. Winter senior nights fall right after the holidays, so the printed set is best ordered before them.",
      },
      {
        id: "q-sn-basketball-stats",
        q: "Which stats go on a basketball senior card?",
        a: "Up to three career highs as chips: points, assists and rebounds per game are the usual three. The four-year line and the senior quote are on every senior card whatever the stats.",
      },
      {
        id: "q-sn-basketball-team",
        q: "Can the whole senior class order together?",
        a: "A whole class can. One email with the sport, the roster size and the date sets it up; each family then sends its own photos and signs off its own proof, and every card is built separately.",
      },
    ],
    posts: ["winter-senior-night-january-basketball-wrestling-hockey"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "wrestling",
    head: { phrase: "wrestling senior night", searches: 618, measured: "2026-08-28", note: "a January engine (NICHE-REPORT-2026-08); 35 in the October window" },
    titleHead: "Wrestling Senior Night Gift: Card Set",
    h1: "WRESTLING SENIOR NIGHT.",
    description:
      "Wrestling senior night gift from your wrestler's photos: the gold senior edition card and poster with class year, weight class and record. Proof first.",
    verdict: "The last home dual, kept: a gold senior edition built from their own photos, proofed free before anything prints.",
    when: { line: "The last home dual of the season, usually in January or early February.", peakMonth: 1 },
    ritual: "Each senior walks to the center of the mat with their parents while the name, the weight class and the career record are read.",
    backLine: "Weight class, record and pins as stat chips, the four-year line FR · SO · JR · SR, the senior quote and the athlete signature line, with SENIOR EDITION · 1 OF 1 beside the registered card ID. The singlet carries no number, so the back of the kit stays plain.",
    photoNotes: [
      "Headgear off for the close-up; a stance or a hand raise for the action shot, never a mid-pin photo of two bodies.",
      "The singlet is the whole kit: one standing full-body photo in it.",
      "The walk to the center of the mat is photographed on the night; it belongs on the poster later.",
    ],
    art: { card: "sn.sport.wrestling.front" },
    questions: [
      {
        id: "q-sn-wrestling-number",
        q: "Wrestlers have no number. What goes on the senior card?",
        a: "Their name and club crest on the front, and the back of the kit stays plain. The weight class, the record and the pins go on the card's back as stat chips, beside the four-year line and the senior quote.",
      },
      {
        id: "q-sn-wrestling-when",
        q: "When is wrestling senior night?",
        a: "At the last home dual of the season, usually in January or early February. It comes right after the holidays, so the printed set is best ordered before them.",
      },
      {
        id: "q-sn-wrestling-record",
        q: "Can the card show a career record?",
        a: "Yes, as stat chips on the back: the weight class, the career record and the pin count. Up to three chips fit.",
      },
    ],
    posts: ["winter-senior-night-january-basketball-wrestling-hockey"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "softball",
    head: { phrase: "softball senior night", searches: 256, measured: SN_BANNER_MEASURED, note: "1,757 in the April window (MASTER-KEYWORD-PLAN §D)" },
    titleHead: "Softball Senior Night Gift: Card Set",
    h1: "SOFTBALL SENIOR NIGHT.",
    description:
      "Softball senior night gift from your player's photos: the gold senior edition card and poster with class year, four-year line and quote. Proof first.",
    verdict: "The last home game at the plate, kept in gold: a senior edition from their own photos, free to proof and yours to approve.",
    when: { line: "The last home game of the regular season, usually in April or early May.", peakMonth: 4 },
    ritual: "Each senior walks to home plate with their parents while the name, the number and the position are read, then takes the field one last time.",
    backLine: "Position and number, career highs as stat chips (batting average, ERA, strikeouts), the four-year line FR · SO · JR · SR, the senior quote and the athlete signature line, with SENIOR EDITION · 1 OF 1 beside the registered card ID.",
    photoNotes: [
      "Visor off for the close-up, in open shade; the face mask goes on the action frame only.",
      "The bow is part of the kit: one photo exactly as worn in games.",
      "The home-plate walk is photographed on the night; it belongs on the poster later.",
    ],
    art: { card: "sn.sport.softball.front" },
    questions: [
      {
        id: "q-sn-softball-when",
        q: "When is softball senior night?",
        a: "At the last home game of the regular season, usually in April or early May. Tell us the date once your request is in; the proof is timed to land ahead of it.",
      },
      {
        id: "q-sn-softball-stats",
        q: "Which stats go on a softball senior card?",
        a: "Up to three career highs as chips: batting average, ERA and strikeouts are the usual three for a pitcher, batting average, home runs and RBIs for a hitter.",
      },
      {
        id: "q-sn-softball-bow",
        q: "Will the senior card show the bow?",
        a: "Yes, if it is worn in games. The bow and the visor are copied from your photos as part of the kit, the same way the jersey is.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
  {
    slug: "baseball",
    head: { phrase: "baseball senior night", searches: 72, measured: SN_BANNER_MEASURED, note: "off-season figure; the April–May window is where the demand sits" },
    titleHead: "Baseball Senior Night Gift: Card Set",
    h1: "BASEBALL SENIOR NIGHT.",
    description:
      "Baseball senior night gift from your player's photos: the gold senior edition card and poster with class year, four-year line and quote. Proof first.",
    verdict: "The last home game of four seasons, kept: a gold senior edition built from their own photos; you approve the proof first.",
    when: { line: "The last home game of the regular season, usually in April or May.", peakMonth: 5 },
    ritual: "Each senior walks to home plate with their parents while the name, the number and the position are read, then takes the field one last time.",
    backLine: "Position and number, career highs as stat chips (batting average, ERA, home runs), the four-year line FR · SO · JR · SR, the senior quote and the athlete signature line, with SENIOR EDITION · 1 OF 1 beside the registered card ID.",
    photoNotes: [
      "Cap pushed back or open shade for the close-up; the batting helmet goes on the action frame only.",
      "Team photo day is the best kit reference: full uniform, flat light.",
      "The home-plate walk is photographed on the night; it belongs on the poster later.",
    ],
    art: { card: "sn.sport.baseball.front", wall: "wall.baseball" },
    questions: [
      {
        id: "q-sn-baseball-when",
        q: "When is baseball senior night?",
        a: "At the last home game of the regular season, usually in April or May. Let us know the date after you send the request and the proof is planned around it.",
      },
      {
        id: "q-sn-baseball-pitcher",
        q: "Pitcher and hitter on one senior card?",
        a: "The front shows one moment; the back can carry a pitching line and a hitting line as separate stat chips. Say on the form which side of the game the front should show.",
      },
      {
        id: "q-sn-baseball-team",
        q: "Can the whole senior class order together?",
        a: "Whole classes order together often. Send the sport, how many seniors and the date by email; the families upload their own photos, approve their own proofs, and the cards are built one by one.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
  {
    slug: "ice-hockey",
    head: { phrase: "hockey senior night", searches: 341, measured: "2026-08-28", note: "a January engine (NICHE-REPORT-2026-08); 8 in the September window" },
    titleHead: "Hockey Senior Night Gift: Card Set",
    h1: "HOCKEY SENIOR NIGHT.",
    description:
      "Hockey senior night gift from your player's photos: the gold senior edition card and poster with class year, four-year line and senior quote. Proof first.",
    verdict: "The last home game on the ice, kept in gold: a senior edition from their own photos, proofed free before a cent is paid.",
    when: { line: "The last home game of the regular season, usually in January or February.", peakMonth: 1 },
    ritual: "Each senior skates to center ice with their parents while the name, the number and the position are read over the rink.",
    backLine: "Position and number, career highs as stat chips (goals, assists, save percentage), the four-year line FR · SO · JR · SR, the senior quote and the athlete signature line, with SENIOR EDITION · 1 OF 1 beside the registered card ID.",
    photoNotes: [
      "The helmet and cage hide the face: one close-up with the helmet off, in the locker room or at home.",
      "One full-body photo in the full kit, sweater over the pads, is what the card's kit is built from.",
      "The center-ice walk is photographed on the night; it belongs on the poster later.",
    ],
    art: {},
    questions: [
      {
        id: "q-sn-hockey-when",
        q: "When is hockey senior night?",
        a: "At the last home game of the regular season, usually in January or February. It comes right after the holidays, so the printed set is best ordered before them.",
      },
      {
        id: "q-sn-hockey-helmet",
        q: "Can the senior card show the helmet?",
        a: "Yes, on the action frame. The likeness is fixed from a bare-headed close-up, so send both: one photo with the helmet off and one in the full kit.",
      },
      {
        id: "q-sn-hockey-listing",
        q: "Is there a hockey senior night listing on Etsy?",
        a: "Hockey orders go through the all-sports senior night listing, or through the free-proof form here with the sport and the Senior Night finish already chosen. The edition is the same either way.",
      },
    ],
    posts: ["winter-senior-night-january-basketball-wrestling-hockey"],
    updatedAt: "2026-10-06",
  },
];

export const seniorNightFactsFor = (slug: string): SeniorNightFacts | undefined => SENIOR_NIGHT_FACTS.find((f) => f.slug === slug);

/** The nine sports with a spoke, in the hub's order (COPY §2.5 (4)). */
export const SENIOR_NIGHT_SPORT_ORDER = ["football", "volleyball", "cheerleading", "soccer", "basketball", "wrestling", "softball", "baseball", "ice-hockey"] as const;

export function seniorNightSports(): Sport[] {
  return SENIOR_NIGHT_SPORT_ORDER.map((slug) => sportBySlug(slug)).filter((s): s is Sport => Boolean(s && seniorNightFactsFor(s.slug)));
}

export const seniorNightPath = (slug: string): string => `/senior-night/${slug}`;

/** One sitemap row per spoke, lastmod from the row's own `updatedAt`. */
export function seniorNightPages(): { path: string; lastModified: string }[] {
  return seniorNightSports().map((s) => ({ path: seniorNightPath(s.slug), lastModified: seniorNightFactsFor(s.slug)!.updatedAt }));
}

/** "fall", "winter" or "spring" from the peak month — the one season word a spoke prints. */
export function seasonWord(peakMonth: number): "fall" | "winter" | "spring" {
  if (peakMonth >= 8 && peakMonth <= 11) return "fall";
  if (peakMonth === 12 || peakMonth <= 2) return "winter";
  return "spring";
}
