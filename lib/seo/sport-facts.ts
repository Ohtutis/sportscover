// The fact table behind /sports and /sports/[sport] (SEO plan 2026-10-06, docs/SEO-PLAN-GDE-2026-10.md
// §4; master plan rule 1: "no fact table, no page"). One row per sport that has its own live listing;
// the template renders nothing it cannot read from here, lib/catalog/sports.ts or the canon, so two
// sport pages can never share a sentence by accident — the duplication gate (tests/seo-families.test.ts)
// reads these rows and fails when two sports say the same thing.
//
// Numbers: every `searches` figure is Etsy Marketplace Insights, 30-day window, measured on the date in
// `measured` (etsy/SEO/MASTER-KEYWORD-PLAN-2026-09-07.md). They are Etsy demand, not Google demand — the
// site's proxy until Search Console has rows (master plan §7.1). Never print one on the page.
//
// Words: the head phrase keeps the searcher's word order ("custom basketball cards" is plural because
// the singular has 73 searches to the plural's 162). "Their number" appears only for a sport whose kit
// carries one (COPY §0.1); wrestling's singlet has none, so its row never says it. No price, no date,
// no provider, no age word.
//
// `updatedAt` is the page's lastmod and moves only when a fact in its row changes — never on a restyle
// (master plan §6 "dates are earned").

import { isNumberless, sportBySlug, sports, type Sport } from "../catalog/sports";

export interface SportQuestion {
  /** Stable anchor on the page (`#q-<slug>-…`) so an answer can be deep-linked and cited. */
  id: string;
  q: string;
  a: string;
}

export interface SportFacts {
  slug: string;
  /** The measured head phrase in the searcher's word order, and the figure behind it. */
  head: { phrase: string; searches: number; measured: string; note?: string };
  /** <title> head phrase — ≤ 60 characters with " | Game Day Edition". */
  titleHead: string;
  /** The H1: uppercase, ends with a full stop, two lines at the display size. */
  h1: string;
  /** ≤ 155 characters. */
  description: string;
  /** The verdict line under the H1 — one sentence, true today, ≤ 120 characters. */
  verdict: string;
  /** What the FRONT of this sport's card carries, in this sport's words. */
  frontLine: string;
  /** What the BACK carries for this sport (the computed backLine() from the catalog is added beside it). */
  backLine: string;
  /** The two to four photo traps of this sport — each one sentence, each specific to the sport. */
  photoTraps: string[];
  /** When the season runs and when senior night usually falls (US high school; "typical", never a promise). */
  season: { plays: string; seniorNight: string };
  /** Existing lib/assets.ts keys — the template renders only the ones that exist. */
  art: { card: string; wall?: string; seniorCard?: string };
  /** The sport's own questions, answered from the canon. At most four. */
  questions: SportQuestion[];
  /** Blog slugs (lib/blog.ts) about this sport — rendered only while they exist. */
  posts: string[];
  /** YYYY-MM-DD — the last real change to the facts above. */
  updatedAt: string;
}

const MEASURED = "2026-09-07";

export const SPORT_FACTS: SportFacts[] = [
  {
    slug: "basketball",
    head: { phrase: "custom basketball cards", searches: 162, measured: MEASURED, note: "plural; the singular has 73" },
    titleHead: "Custom Basketball Cards From Your Photos",
    h1: "CUSTOM BASKETBALL CARDS.",
    description:
      "Custom basketball cards from your athlete's photos: their number, their jersey, their season on the back. Free watermarked proof first, pay if you love it.",
    verdict: "Their jersey, their number and their season on one card. You see a free proof before anything is made final.",
    frontLine: "Their name and number across the chest, the jersey copied from your photos, the hardwood behind them in the finish you pick.",
    backLine: "Points, assists and rebounds per game as stat chips, the position, the team and the season, and the registered card ID beside the QR code.",
    photoTraps: [
      "Gym light is the enemy: one close-up taken somewhere bright, both eyes visible, does more than four dim action shots.",
      "A drive to the basket blurs at phone shutter speeds, so send the free-throw line or the bench photo as well as the layup.",
      "Reversible jerseys show two kits; tell us which one is the home kit and the card wears that one.",
      "Goggles and headbands count as kit only if they are worn every game.",
    ],
    season: { plays: "November to March", seniorNight: "late January or February, before the last home game" },
    art: { card: "sport.basketball.front", wall: "wall.basketball", seniorCard: "sn.sport.basketball.front" },
    questions: [
      {
        id: "q-basketball-number",
        q: "Does the card show their jersey number?",
        a: "It does, front and back: basketball jerseys carry the number on the chest and the back, so the card shows it on the chest on the front and on the back of the kit where the back frame shows it.",
      },
      {
        id: "q-basketball-stats",
        q: "Which stats go on the back of a basketball card?",
        a: "Up to three, your choice: points, assists, rebounds, steals or blocks per game are the usual three. A season with no stats is fine; the back carries the team, the position and the season either way.",
      },
      {
        id: "q-basketball-season",
        q: "When should a basketball parent order?",
        a: "Any time in the season. Senior night for basketball usually falls in late January or February; tell us the date after you send the photos and the proof is scheduled against it. The digital files arrive first, the printed card after you approve the proof.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
  {
    slug: "football",
    head: { phrase: "custom football card", searches: 508, measured: MEASURED },
    titleHead: "Custom Football Card From Your Photos",
    h1: "CUSTOM FOOTBALL CARD.",
    description:
      "A custom football card from your player's photos: number, helmet and pads, their season on the back. Free watermarked proof first; pay only if you love it.",
    verdict: "Their number, their pads and their season on one card. A free watermarked proof before anything is made final.",
    frontLine: "Their name and number, the jersey and pads copied from your photos, the field lights behind them in the finish you pick.",
    backLine: "Position, team, season and up to three stat chips (yards, touchdowns, tackles), the registered card ID and the QR code to the card's own page.",
    photoTraps: [
      "A helmet cage across the eyes is the photo we reject most: send one close-up with the helmet off, taken in daylight.",
      "Eye black and a mouthguard are fine on the action shot, not on the close-up.",
      "Full pads change the shape of the shoulders, so one photo in the full kit is what the card is built from; a photo in a practice shirt is not.",
      "Friday-night field shots from the stands put the face at twenty pixels; the phone photo from the sideline after the game is the one that works.",
    ],
    season: { plays: "August to November", seniorNight: "October, the last home game of the regular season" },
    art: { card: "sport.football.front", wall: "wall.football", seniorCard: "sn.sport.football.front" },
    questions: [
      {
        id: "q-football-helmet",
        q: "Can the card show the helmet?",
        a: "Yes, on the action frame. The close-up that fixes the likeness is taken with the helmet off, so send both: one bare-headed photo in good light and one in the full kit.",
      },
      {
        id: "q-football-number",
        q: "Does the card show their jersey number?",
        a: "On both sides. Football jerseys carry the number on the chest and the back, and the card copies both from your photos.",
      },
      {
        id: "q-football-senior-night",
        q: "Is there a football senior night edition?",
        a: "Yes, the Senior Night finish: class year, the four-year line and their senior quote on the back. The football senior night page has the timeline worked back from the night.",
      },
    ],
    posts: ["senior-night-football-gift-ideas-poster-cards-banner-blanket"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "baseball",
    head: { phrase: "custom baseball card", searches: 996, measured: MEASURED, note: "the biggest card head in the catalog; peaks in May and again in November" },
    titleHead: "Custom Baseball Card From Your Photos",
    h1: "CUSTOM BASEBALL CARD.",
    description:
      "A custom baseball card from your player's photos: their number, cap and jersey, the season's line on the back. Free watermarked proof first.",
    verdict: "Their cap, their number and their season's line on a card that looks like the ones they collect, proofed before anything prints.",
    frontLine: "Their name and number, the jersey and cap copied from your photos, the diamond behind them in the finish you pick.",
    backLine: "Position, team, season and up to three stat chips (batting average, ERA, RBIs, home runs), the registered card ID and the QR code.",
    photoTraps: [
      "A cap at noon puts a shadow across the eyes; send one photo with the cap pushed back or taken in open shade.",
      "A batting helmet hides the face the same way a cap does: the helmet goes on the action frame, not the close-up.",
      "Sunglasses off for the close-up, even if they are worn in every game.",
      "The team photo day picture is the best kit reference: full uniform, flat light, nothing cropped.",
    ],
    season: { plays: "March to June, with fall ball in September and October", seniorNight: "April or May, before the last home game" },
    art: { card: "sport.baseball.front", wall: "wall.baseball", seniorCard: "sn.sport.baseball.front" },
    questions: [
      {
        id: "q-baseball-position",
        q: "Can the card show a pitcher and a hitter?",
        a: "The front shows one moment; the back can carry a pitching line and a hitting line as separate stat chips. Tell us on the form which side of the game the front should show.",
      },
      {
        id: "q-baseball-number",
        q: "Does the card show their jersey number?",
        a: "The card shows what the jersey shows: baseball jerseys carry the number on the back and usually on the chest, and both are copied from your photos.",
      },
      {
        id: "q-baseball-when",
        q: "When do baseball parents usually order?",
        a: "Two windows: the spring season, when the card marks the year, and the weeks before the holidays, when it is a gift. Senior night for baseball usually falls in April or May; let us know the date once the request is in and the proof is timed to it.",
      },
    ],
    posts: ["custom-baseball-cards-from-your-photos-the-complete-guide"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "softball",
    head: { phrase: "custom softball", searches: 426, measured: MEASURED, note: "no card head exists for softball; the listing leads with the gift door" },
    titleHead: "Custom Softball Gift: Card & Poster",
    h1: "CUSTOM SOFTBALL GIFT.",
    description:
      "A custom softball gift from your player's photos: a trading card with their number and a poster for the wall, proofed free before anything is printed.",
    verdict: "A card and a poster built from their photos: their number, their visor, their season. Free watermarked proof first.",
    frontLine: "Their name and number, the jersey and visor copied from your photos, the infield behind them in the finish you pick.",
    backLine: "Position, team, season and up to three stat chips (batting average, ERA, strikeouts), the registered card ID and the QR code.",
    photoTraps: [
      "A visor casts the same eye shadow a cap does; one close-up in open shade, visor off, fixes it.",
      "A pitcher's or corner infielder's face mask hides the face: the mask goes on the action frame, never the close-up.",
      "The bow is part of the kit, so send one photo with it exactly as they wear it in games.",
      "The dugout photo after the game, phone at arm's length, beats the far shot from behind the backstop.",
    ],
    season: { plays: "March to May, with fall ball in September and October", seniorNight: "April or early May, before the last home game" },
    art: { card: "sport.softball.front", seniorCard: "sn.sport.softball.front" },
    questions: [
      {
        id: "q-softball-bow",
        q: "Will the card show their bow?",
        a: "Yes, if they wear it in games. The bow and the visor are copied from your photos as part of the kit, the same way the jersey is.",
      },
      {
        id: "q-softball-number",
        q: "Does the card show their jersey number?",
        a: "Softball jerseys carry the number on the back, and the card shows it there, where the back frame shows the kit.",
      },
      {
        id: "q-softball-senior-night",
        q: "Is there a softball senior night edition?",
        a: "Yes, the Senior Night finish, with the class year and the four-year line on the back. Softball senior night usually falls in April; the softball senior night page works the timeline back from the date.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
  {
    slug: "soccer",
    head: { phrase: "soccer gifts", searches: 3300, measured: MEASURED, note: "no card head exists for soccer (custom soccer cards 175, Very low); soccer senior night gifts 317 VH belongs to the senior-night spoke" },
    titleHead: "Custom Soccer Gift: Card & Poster",
    h1: "CUSTOM SOCCER GIFT.",
    description:
      "A custom soccer gift from your player's photos: a trading card with their number and crest, and a poster for the wall, proofed free before printing.",
    verdict: "Their kit, their number and their crest on a card and a poster built from your photos, and you see the proof before you pay.",
    frontLine: "Their name and number, the kit and crest copied from your photos, the pitch under the lights in the finish you pick.",
    backLine: "Position, team, season and up to three stat chips (goals, assists, clean sheets), the registered card ID and the QR code.",
    photoTraps: [
      "Soccer photos are taken from far away: the face needs to fill at least a fifth of the frame, so send the sideline phone photo, not the one from the far touchline.",
      "A keeper wears a different kit and gloves; say which position the front should show.",
      "The crest on the chest is copied as it is, so one flat, straight-on photo of the shirt saves a revision.",
      "Pull the hair back off the face for the close-up the way it is worn on the field.",
    ],
    season: { plays: "August to November for most high schools, spring for many clubs", seniorNight: "October, the last home game" },
    art: { card: "sport.soccer.front", wall: "wall.soccer", seniorCard: "sn.sport.soccer.front" },
    questions: [
      {
        id: "q-soccer-crest",
        q: "Will the card show our club crest?",
        a: "Yes, copied exactly from your photos or from the crest file you attach. We never redraw a crest from memory and never add a league mark.",
      },
      {
        id: "q-soccer-number",
        q: "Does the card show their number?",
        a: "A soccer kit carries the number on the back, so that is where the card shows it, in the back frame.",
      },
      {
        id: "q-soccer-senior-night",
        q: "Is there a soccer senior night edition?",
        a: "The Senior Night finish is the senior edition for soccer too. The night usually falls in October for high school teams; the soccer senior night page works the timeline back from the date.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
  {
    slug: "ice-hockey",
    head: { phrase: "custom hockey", searches: 318, measured: "2026-09-14", note: "custom hockey card has 84, under the floor; the gift door leads" },
    titleHead: "Custom Hockey Gift: Card & Poster",
    h1: "CUSTOM HOCKEY GIFT.",
    description:
      "A custom hockey gift from your player's photos: a trading card with their number and a poster for the wall, proofed free before anything is printed.",
    verdict: "Their sweater, their number and their season on a card and a poster built from your photos; nothing is paid until you approve the proof.",
    frontLine: "Their name and number, the sweater copied from your photos, the rink boards and glass behind them in the finish you pick.",
    backLine: "Position, team, season and up to three stat chips (goals, assists, save percentage), the registered card ID and the QR code.",
    photoTraps: [
      "A helmet and cage hide the face completely: send one close-up with the helmet off, in the locker room or at home.",
      "The sweater hangs loose over the pads, so one full-body photo in the full kit is what the card's kit is built from.",
      "Rink light is cold and even; it is fine for the action shot, but take the close-up somewhere warmer.",
      "A goalie's mask and pads are a different kit; say which position the front should show.",
    ],
    season: { plays: "October to March", seniorNight: "January or February, before the last home game" },
    art: { card: "sport.ice-hockey.front" },
    questions: [
      {
        id: "q-hockey-helmet",
        q: "Can the card show the helmet?",
        a: "Yes, on the action frame. The likeness is fixed from a bare-headed close-up, so send both: one photo with the helmet off in good light, and one in the full kit.",
      },
      {
        id: "q-hockey-number",
        q: "Does the card show their number?",
        a: "Hockey sweaters carry the number on the back and the sleeves, and the card copies exactly what your photos show there.",
      },
      {
        id: "q-hockey-senior-night",
        q: "Is there a hockey senior night edition?",
        a: "Yes, the Senior Night finish, ordered through the all-sports senior night listing or the free-proof form. Hockey senior night usually falls in January or February.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
  {
    slug: "volleyball",
    head: { phrase: "volleyball gifts", searches: 5900, measured: MEASURED, note: "no card head exists for volleyball; the gift door leads and peaks in November" },
    titleHead: "Custom Volleyball Gift: Card & Poster",
    h1: "CUSTOM VOLLEYBALL GIFT.",
    description:
      "A custom volleyball gift from your player's photos: a trading card with their number and a poster for the wall, proofed free before anything is printed.",
    verdict: "Their jersey, their number and their season on a card and a poster built from your photos, with a free proof before any payment.",
    frontLine: "Their name and number, the jersey copied from your photos, the net and the gym lights behind them in the finish you pick.",
    backLine: "Position, team, season and up to three stat chips (kills, digs, aces), the registered card ID and the QR code.",
    photoTraps: [
      "Gym light and fast rallies blur the face: one crisp close-up taken somewhere bright does more than a burst from the stands.",
      "A libero wears a different color jersey; say which jersey the card should wear.",
      "Knee pads are part of the kit on a full-body photo, so send one in the full game kit.",
      "Four shots from one burst count as one photo; pick different moments instead.",
    ],
    season: { plays: "August to November", seniorNight: "October, the last home match" },
    art: { card: "sport.volleyball.front", wall: "wall.volleyball", seniorCard: "sn.sport.volleyball.front" },
    questions: [
      {
        id: "q-volleyball-libero",
        q: "Our player is a libero. Which jersey goes on the card?",
        a: "The one you choose. A libero's jersey is a different color from the team's, so tell us on the form which jersey the front should wear; the back frame follows the same jersey.",
      },
      {
        id: "q-volleyball-number",
        q: "Does the card show their number?",
        a: "Front and back: volleyball jerseys carry the number on both, and the card copies both from your photos.",
      },
      {
        id: "q-volleyball-senior-night",
        q: "Is there a volleyball senior night edition?",
        a: "There is: the gold Senior Night finish. Volleyball senior night usually falls in October; the volleyball senior night page has gifts, poster ideas and the timeline worked back from the night.",
      },
    ],
    posts: ["senior-night-volleyball-gifts-poster-ideas-timeline"],
    updatedAt: "2026-10-06",
  },
  {
    slug: "wrestling",
    head: { phrase: "wrestling gifts", searches: 527, measured: MEASURED, note: "no card head exists for wrestling; the gift door leads and senior night peaks in January" },
    titleHead: "Custom Wrestling Gift: Card & Poster",
    h1: "CUSTOM WRESTLING GIFT.",
    description:
      "A custom wrestling gift from your wrestler's photos: a card with their name, crest and weight class, and a poster, proofed free before anything is printed.",
    verdict: "Their singlet, their crest and their weight class on a card and a poster built from your photos: a free proof, then your call.",
    frontLine: "Their name and club crest, the singlet copied from your photos, the mat and the lights behind them in the finish you pick.",
    backLine: "Weight class, record and pins as stat chips, the team and the season, the registered card ID and the QR code. The singlet carries no number, so the back of the kit stays plain.",
    photoTraps: [
      "Headgear off for the close-up; it goes on the action frame.",
      "A mid-pin photo is two bodies tangled together, and the card shows one athlete: send a stance, a hand raise or the walk to the center of the mat.",
      "The singlet is the whole kit, so one full-body photo in it, standing, is what the card is built from.",
      "Mat light is fine; a cutoff shirt over the singlet at practice is not the kit.",
    ],
    season: { plays: "November to February", seniorNight: "January or early February, before the last home dual" },
    art: { card: "sport.wrestling.front", seniorCard: "sn.sport.wrestling.front" },
    questions: [
      {
        id: "q-wrestling-number",
        q: "Wrestlers have no jersey number. What goes on the card?",
        a: "Their name and club crest on the front, and the back of the kit stays plain, because the singlet carries nothing there. The weight class, the record and the pins go on the card's back as stat chips.",
      },
      {
        id: "q-wrestling-record",
        q: "Can the card show their record?",
        a: "Yes, as stat chips on the back: the weight class, the season record and the pin count are the usual three. A season with no record on it is fine too.",
      },
      {
        id: "q-wrestling-senior-night",
        q: "Is there a wrestling senior night edition?",
        a: "Wrestling gets the Senior Night finish like every sport. The night usually falls in January; the wrestling senior night page works the timeline back from the date.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
  {
    slug: "cheerleading",
    head: { phrase: "cheer gifts", searches: 4300, measured: MEASURED, note: "no card head exists for cheer; the gift door leads" },
    titleHead: "Custom Cheer Gift: Card & Poster",
    h1: "CUSTOM CHEER GIFT.",
    description:
      "A custom cheer gift from your cheerleader's photos: a card with their name, bow and crest, and a poster for the wall, proofed free before printing.",
    verdict: "Their uniform, their bow and their name on a card and a poster built from your photos. No number, because cheer has none, and a free proof first.",
    frontLine: "Their name and crest, the uniform and bow copied from your photos, the sideline or the mat behind them in the finish you pick.",
    backLine: "Squad, position (flyer, base, back spot), level, years on the team and up to three stat chips, the registered card ID and the QR code. No number anywhere, because the uniform has none.",
    photoTraps: [
      "A stunt photo puts the flyer small and far away; the ground-level close-up after the routine is the one that fixes the likeness.",
      "The bow is part of the kit, so send one photo with it exactly as it is worn on game day.",
      "Competition makeup and glitter are fine; sunglasses and a hood are not, for the close-up.",
      "Sideline and competition uniforms differ; say which one the card should wear.",
    ],
    season: { plays: "August to February: sideline in the fall, competition in the winter", seniorNight: "October or November, usually the football team's senior night" },
    art: { card: "sport.cheerleading.front", wall: "wall.cheerleading", seniorCard: "sn.sport.cheerleading.front" },
    questions: [
      {
        id: "q-cheer-number",
        q: "Cheerleaders have no jersey number. What goes on the card?",
        a: "Their name and the squad crest on the front, and their name and crest again where a jersey would show a number. The back carries the squad, their position, their level and their years on the team.",
      },
      {
        id: "q-cheer-uniform",
        q: "Sideline or competition uniform?",
        a: "Your choice. Tell us on the form which uniform the front should wear; the bow and the shoes follow from the photos of that uniform.",
      },
      {
        id: "q-cheer-senior-night",
        q: "Is there a cheer senior night edition?",
        a: "Yes, the Senior Night finish, with the class year and the four-year line on the back and no number anywhere. Cheer senior night usually shares the football team's night in October or November.",
      },
    ],
    posts: [],
    updatedAt: "2026-10-06",
  },
];

/** The facts for a sport, or undefined when the sport has no page of its own. */
export const sportFactsFor = (slug: string): SportFacts | undefined => SPORT_FACTS.find((f) => f.slug === slug);

/** The sports that get a /sports/[sport] page: a facts row AND a live listing (lib/catalog/sports.ts). */
export function sportPageSports(): Sport[] {
  return SPORT_FACTS.map((f) => sportBySlug(f.slug)).filter((s): s is Sport => Boolean(s && s.live));
}

export const sportPagePath = (slug: string): string => `/sports/${slug}`;

/** One sitemap row per sport page, lastmod from the row's own `updatedAt` (never the build date). */
export function sportPages(): { path: string; lastModified: string }[] {
  return sportPageSports().map((s) => ({ path: sportPagePath(s.slug), lastModified: sportFactsFor(s.slug)!.updatedAt }));
}

/** The one line the /sports hub prints under every sport, including the ones without a page. */
export function hubLine(s: Sport): string {
  if (isNumberless(s)) return "No jersey number: the card carries their name and club crest.";
  if (!s.hasBackNumber) return "Their name and club crest on the front; the back of the kit stays plain.";
  return "Their number on the front and on the back of the kit.";
}

/** Every sport in roster order with whether it has its own page — the hub's 17 tiles. */
export function hubTiles(): { sport: Sport; href: string; hasPage: boolean }[] {
  const withPage = new Set(sportPageSports().map((s) => s.slug));
  return sports.map((sport) => ({ sport, href: withPage.has(sport.slug) ? sportPagePath(sport.slug) : "", hasPage: withPage.has(sport.slug) }));
}
