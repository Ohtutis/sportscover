// Game Day Edition — collectible card registry (source of truth).
//
// Static on purpose: every printed card carries a QR code that resolves to /c/<cardId>, and that
// page must never depend on a database that can sleep. Migrate to Postgres only once real cards
// pass ~50 (docs/SITE-BUILD-SPEC-2026-09.md §5.6). Real customers are UNLISTED by default and
// carry only what is printed on the card — never a city, an email or an order id.

import { sportByCode } from "../catalog/sports";

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
  /** Optional print serial, e.g. "01/18". Rendered only for Senior Night ("1 of 1"). */
  serial?: string;
  createdAt: string;
  /**
   * public   — indexable, in the sitemap, shareable OG with the name (fictional demo cards).
   * unlisted — resolves by exact ID/QR only; noindex; never listed (real customers by default).
   * private  — the QR opens a neutral "registered" notice with no name or art.
   * deleted  — gone (410).
   */
  visibility?: Visibility;
  /**
   * Which channel the card belongs to. `demo-etsy` = a fictional card whose QR is printed on
   * Etsy listing images: it may only ever link back to Etsy (Etsy off-platform rule S19/D26).
   */
  channel?: Channel;
  /** Fictional roster athlete (never presented as a customer). */
  isFictional?: boolean;
  consentPublicAt?: string;
  consentSource?: string;
  /** Registration date as printed in the edition panel; falls back to createdAt (GAPS #36, `registeredAtOf`). */
  registeredAt?: string;
  /** Last change to the record; falls back to the registration date (`updatedAtOf`). Drives the sitemap lastModified. */
  updatedAt?: string;
  /** Adults never get a `#` on /c even in a numbered sport (`showsJerseyNumber`). */
  ageBand?: AgeBand;
  /** team/primary and team/secondary from the record — used only on /c, gated by `teamAccent()` (lib/color.ts). */
  teamColors?: TeamColors;
  /** Generated art paths under public/cards/<id>/ (see lib/registry/art.ts); optional wallpapers land in F2. */
  assets?: CardAssets;
  /** Opaque studio reference for a real order — never an Etsy receipt number, never rendered. */
  orderRef?: string;
}

export type AgeBand = "adult" | "minor";
export interface TeamColors {
  primary?: string;
  secondary?: string;
}
export interface CardAssets {
  front?: string;
  back?: string;
  flipMp4?: string;
  flipGif?: string;
  poster?: string;
  wallpapers?: string[];
}

export type Visibility = "public" | "unlisted" | "private" | "deleted";
export type Channel = "site" | "etsy" | "demo-site" | "demo-etsy";

/** Demo cards default to public; everything else (real people) defaults to unlisted. */
export function visibilityOf(c: CardRecord): Visibility {
  return c.visibility ?? (c.isFictional ? "public" : "unlisted");
}
export function channelOf(c: CardRecord): Channel {
  return c.channel ?? (c.isFictional ? "demo-etsy" : "etsy");
}
export const isIndexable = (c: CardRecord): boolean => visibilityOf(c) === "public";


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
// The two finishes dropped from the lineup on 2026-08-19 are gone from this table on purpose:
// leaving them in invites a card id for a finish we do not sell.
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

/**
 * Build the systematic card ID: GDE-<style>-<sport>-<season>-<number>[-<seq>].
 * The printed IDs never change. New records get a uniqueness sequence when the base id is
 * already taken (a second 2026 Stadium Night basketball #12 becomes …-12-2). Numberless sports
 * and adults carry no shirt number: `jerseyNumber` is then the printed edition number — "01" for
 * the first card of that style, sport and season, "02" for the next (GAPS #11; `scripts/card-new.ts`
 * mints it with `nextEditionNumber`). Nothing on such a card claims it is a jersey number.
 */
export function makeCardId(
  p: { sportCode: string; styleName: string; season: string; jerseyNumber: string },
  existing: ReadonlyArray<{ cardId: string }> = cards,
): string {
  const base = `GDE-${styleCode(p.styleName)}-${p.sportCode}-${p.season}-${p.jerseyNumber}`;
  const taken = new Set(existing.map((c) => c.cardId));
  if (!taken.has(base)) return base;
  let seq = 2;
  while (taken.has(`${base}-${seq}`)) seq += 1;
  return `${base}-${seq}`;
}

/**
 * Origin of every printed QR code. A code constant, not configuration, and kept on the apex on
 * purpose: the QR codes already printed (and the ones `scripts/gen-card-qr.ts` writes) encode
 * https://gamedayedition.com/c/<id>, and the apex 308s to www. It must never follow
 * NEXT_PUBLIC_SITE_URL — a local .env would put localhost inside a card back. The site's own
 * canonical origin is `SITE_URL` in lib/site.ts.
 */
export const QR_ORIGIN = "https://gamedayedition.com";

/** The URL a card's QR code resolves to. `scripts/card-assets.ts` asserts every patched back decodes to exactly this. */
export function cardUrl(cardId: string): string {
  return `${QR_ORIGIN}/c/${cardId}`;
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
    serial: "01/18",
    createdAt: "2026-08-19",
    isFictional: true,
    channel: "demo-etsy",
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
    teamColors: { primary: "#12356B", secondary: "#FFFFFF" },
    season: "2026",
    classOf: "2027",
    ppg: "18.4",
    rpg: "7.1",
    apg: "4.6",
    stats: [
      { label: "PPG", value: "18.4" },
      { label: "APG", value: "4.6" },
      { label: "RPG", value: "7.1" },
    ],
    playerHighlight: "2027 All-Conference First Team \u00b7 team captain.",
    sportCode: "BKB",
    styleName: "Stadium Night",
    createdAt: "2026-08-27",
    isFictional: true,
    channel: "demo-etsy",
  },

  // A real customer's edition (Digital Complete Set, tennis, Signature Spotlight). Only what is
  // printed on the card lives here; stats/headline/class year were N/A on the order and are
  // absent on purpose. Unlisted: the page opens from the QR/ID only and is not indexed.
  {
    cardId: "GDE-SS-TEN-2026-12",
    athleteId: "gde-ss-ten-2026-12",
    firstName: "Rita",
    lastName: "Gataveckaitė",
    jerseyNumber: "12",
    position: "Pro",
    team: "Vilnius",
    teamColors: { primary: "#1B2A4A", secondary: "#FFFFFF" },
    season: "2026",
    stats: [],
    sportCode: "TEN",
    styleName: "Signature Spotlight",
    createdAt: "2026-09-04",
    visibility: "unlisted",
    channel: "etsy",
    // An adult club player: the card carries no "#" on /c (showsJerseyNumber), and tennis is
    // numberless anyway — the 12 in the id is the printed edition number.
    ageBand: "adult",
  },
  // Order 03 (2026-08-26): Stadium Night basketball, adult athlete — class year hidden on purpose.
  // Unlisted; resolves from the QR on the printed card back.
  {
    cardId: "GDE-SN-BKB-2026-51",
    athleteId: "gde-sn-bkb-2026-51",
    firstName: "Žilvinas",
    lastName: "Rubliauskas",
    jerseyNumber: "51",
    position: "Forward",
    team: "Mad Lamb",
    teamColors: { primary: "#6F2C57", secondary: "#E0B02E" },
    season: "2025–26",
    stats: [],
    sportCode: "BKB",
    styleName: "Stadium Night",
    createdAt: "2026-08-26",
    visibility: "unlisted",
    channel: "etsy",
    ageBand: "adult",
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
    teamColors: { primary: "#12356B", secondary: "#FFFFFF" },
    season: "2025\u201326",
    classOf: "2026",
    ppg: "18.4",
    rpg: "7.1",
    apg: "4.6",
    stats: [
      { label: "PPG", value: "18.4" },
      { label: "APG", value: "4.6" },
      { label: "RPG", value: "7.1" },
    ],
    playerHighlight: "Career highs \u00b7 FR 2023 \u2013 SR 2026 \u00b7 \u201cLeave it better than you found it.\u201d",
    sportCode: "BKB",
    styleName: "Senior Night",
    createdAt: "2026-08-27",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // The Senior Night listing's hero card. Its QR is printed on the listing images and on the
    // card back itself, so this id has to resolve before the listing goes live.
    cardId: "GDE-SR-FTB-2026-54",
    athleteId: "tui-faagata",
    firstName: "Tui",
    lastName: "Fa'agata",
    jerseyNumber: "54",
    position: "Off. Line",
    team: "Millbrook Bison",
    teamColors: { primary: "#14532D", secondary: "#F2E8CF" },
    season: "2025\u201326",
    classOf: "2026",
    stats: [
      { label: "PANCK", value: "41" },
      { label: "GP", value: "11" },
      { label: "GRD", value: "92" },
    ],
    playerHighlight: "One last home game \u00b7 FR 2023 \u2013 SR 2026 \u00b7 \u201cLeave it better than you found it.\u201d",
    sportCode: "FTB",
    styleName: "Senior Night",
    serial: "1 of 1",
    createdAt: "2026-08-28",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Senior Night volleyball set (Jaslene #5) \u2014 QR on the card back, certificate and listing images.
    cardId: "GDE-SR-VBL-2026-05",
    athleteId: "jaslene-ocampo",
    firstName: "Jaslene",
    lastName: "Ocampo",
    jerseyNumber: "5",
    position: "Outside",
    team: "Fox Hollow Anchors",
    teamColors: { primary: "#00695C", secondary: "#FFFFFF" },
    season: "2026",
    classOf: "2026",
    stats: [
      { label: "KILLS", value: "312" },
      { label: "ACES", value: "41" },
      { label: "DIGS", value: "188" },
    ],
    playerHighlight: "One last home game \u00b7 FR 2023 \u2013 SR 2026 \u00b7 \u201cLeave it better than you found it.\u201d",
    sportCode: "VBL",
    styleName: "Senior Night",
    createdAt: "2026-09-04",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Senior Night soccer set (Mateo #10) \u2014 QR on card back, certificate, listing.
    cardId: "GDE-SR-SOC-2026-10",
    athleteId: "mateo-herrera",
    firstName: "Mateo",
    lastName: "Herrera",
    jerseyNumber: "10",
    position: "Midfield",
    team: "Sunfield Kestrels",
    teamColors: { primary: "#1E7B3C", secondary: "#F5F5F5" },
    season: "2026",
    classOf: "2026",
    stats: [
      { label: "GOALS", value: "14" },
      { label: "ASST", value: "11" },
      { label: "GP", value: "22" },
    ],
    playerHighlight: "One last home game \u00b7 FR 2023 \u2013 SR 2026 \u00b7 \u201cLeave it better than you found it.\u201d",
    sportCode: "SOC",
    styleName: "Senior Night",
    createdAt: "2026-09-04",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Senior Night baseball set (Casey #7) \u2014 QR on card back, certificate, listing.
    cardId: "GDE-SR-BSB-2026-07",
    athleteId: "casey-whitlock",
    firstName: "Casey",
    lastName: "Whitlock",
    jerseyNumber: "7",
    position: "Outfield",
    team: "Harlow Creek Larks",
    teamColors: { primary: "#B5451B", secondary: "#F0E3D2" },
    season: "2026",
    classOf: "2026",
    stats: [
      { label: "AVG", value: ".341" },
      { label: "HR", value: "6" },
      { label: "RBI", value: "28" },
    ],
    playerHighlight: "One last home game \u00b7 FR 2023 \u2013 SR 2026 \u00b7 \u201cLeave it better than you found it.\u201d",
    sportCode: "BSB",
    styleName: "Senior Night",
    createdAt: "2026-09-04",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Chrome All-Star lead card for the softball listing.
    cardId: "GDE-CA-SFB-2026-03",
    athleteId: "brooke-danner",
    firstName: "Brooke",
    lastName: "Danner",
    jerseyNumber: "3",
    position: "Pitcher",
    team: "Bell Hollow Wrens",
    teamColors: { primary: "#7A1F2B", secondary: "#C9CBCC" },
    season: "2026",
    classOf: "2029",
    stats: [
      { label: "ERA", value: "1.86" },
      { label: "K", value: "142" },
      { label: "IP", value: "96" },
    ],
    playerHighlight: "",
    sportCode: "SFB",
    styleName: "Chrome All-Star",
    createdAt: "2026-09-05",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Stadium Night lead card for the softball listing.
    cardId: "GDE-SN-SFB-2026-03",
    athleteId: "brooke-danner",
    firstName: "Brooke",
    lastName: "Danner",
    jerseyNumber: "3",
    position: "Pitcher",
    team: "Bell Hollow Wrens",
    teamColors: { primary: "#7A1F2B", secondary: "#C9CBCC" },
    season: "2026",
    classOf: "2029",
    stats: [
      { label: "ERA", value: "1.86" },
      { label: "K", value: "142" },
      { label: "IP", value: "96" },
    ],
    playerHighlight: "",
    sportCode: "SFB",
    styleName: "Stadium Night",
    createdAt: "2026-09-05",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Fire & Smoke lead card for the wrestling listing.
    cardId: "GDE-FS-WRS-2026-01",
    athleteId: "dawson-pryor",
    firstName: "Dawson",
    lastName: "Pryor",
    jerseyNumber: "1",
    position: "126 lbs",
    team: "Foundry Hill Forge",
    teamColors: { primary: "#C8102E", secondary: "#1A1A1A" },
    season: "2026",
    classOf: "2027",
    stats: [
      { label: "WINS", value: "38" },
      { label: "PINS", value: "21" },
      { label: "LOSS", value: "3" },
    ],
    playerHighlight: "",
    sportCode: "WRS",
    styleName: "Fire & Smoke",
    createdAt: "2026-09-05",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Heritage lead card for the wrestling listing.
    cardId: "GDE-HE-WRS-2026-01",
    athleteId: "dawson-pryor",
    firstName: "Dawson",
    lastName: "Pryor",
    jerseyNumber: "1",
    position: "126 lbs",
    team: "Foundry Hill Forge",
    teamColors: { primary: "#C8102E", secondary: "#1A1A1A" },
    season: "2026",
    classOf: "2027",
    stats: [
      { label: "WINS", value: "38" },
      { label: "PINS", value: "21" },
      { label: "LOSS", value: "3" },
    ],
    playerHighlight: "",
    sportCode: "WRS",
    styleName: "Heritage",
    createdAt: "2026-09-05",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Senior Night softball set (Brooke #3, pitcher) \u2014 QR on card back, certificate, listing.
    cardId: "GDE-SR-SFB-2026-03",
    athleteId: "brooke-danner",
    firstName: "Brooke",
    lastName: "Danner",
    jerseyNumber: "3",
    position: "Pitcher",
    team: "Bell Hollow Wrens",
    teamColors: { primary: "#7A1F2B", secondary: "#C9CBCC" },
    season: "2026",
    classOf: "2026",
    stats: [
      { label: "ERA", value: "1.42" },
      { label: "K", value: "187" },
      { label: "W", value: "18" },
    ],
    playerHighlight: "One last home game \u00b7 FR 2023 \u2013 SR 2026 \u00b7 \u201cLeave it better than you found it.\u201d",
    sportCode: "SFB",
    styleName: "Senior Night",
    createdAt: "2026-09-05",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Senior Night wrestling set (Dawson #1, 126 lbs) \u2014 QR on card back, certificate, listing.
    cardId: "GDE-SR-WRS-2026-01",
    athleteId: "dawson-pryor",
    firstName: "Dawson",
    lastName: "Pryor",
    jerseyNumber: "1",
    position: "126 lbs",
    team: "Foundry Hill Forge",
    teamColors: { primary: "#C8102E", secondary: "#1A1A1A" },
    season: "2026",
    classOf: "2026",
    stats: [
      { label: "WINS", value: "142" },
      { label: "PINS", value: "61" },
      { label: "TD", value: "388" },
    ],
    playerHighlight: "One last home game \u00b7 FR 2023 \u2013 SR 2026 \u00b7 \u201cLeave it better than you found it.\u201d",
    sportCode: "WRS",
    styleName: "Senior Night",
    createdAt: "2026-09-05",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    // Senior Night cheerleading set (Amara, numberless sport: 01 = edition number) \u2014 QR on card back, certificate, listing.
    cardId: "GDE-SR-CHR-2026-01",
    athleteId: "amara-boyd",
    firstName: "Amara",
    lastName: "Boyd",
    jerseyNumber: "01",
    position: "Flyer",
    team: "Vale Prep Vanguard",
    teamColors: { primary: "#8E2C6B", secondary: "#FFFFFF" },
    season: "2026",
    classOf: "2026",
    stats: [
      { label: "LEVEL", value: "5" },
      { label: "TITLE", value: "2" },
      { label: "YRS", value: "8" },
    ],
    playerHighlight: "One last home game \u00b7 FR 2023 \u2013 SR 2026 \u00b7 \u201cLeave it better than you found it.\u201d",
    sportCode: "CHR",
    styleName: "Senior Night",
    createdAt: "2026-09-04",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    cardId: "GDE-FS-FTB-2026-54",
    athleteId: "tui-faagata",
    firstName: "Tui",
    lastName: "Fa'agata",
    jerseyNumber: "54",
    position: "Off. Line",
    team: "Millbrook Bison",
    teamColors: { primary: "#14532D", secondary: "#F2E8CF" },
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
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    cardId: "GDE-HE-FTB-2026-54",
    athleteId: "tui-faagata",
    firstName: "Tui",
    lastName: "Fa'agata",
    jerseyNumber: "54",
    position: "Off. Line",
    team: "Millbrook Bison",
    teamColors: { primary: "#14532D", secondary: "#F2E8CF" },
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
    isFictional: true,
    channel: "demo-etsy",
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
    teamColors: { primary: "#8E2C6B", secondary: "#FFFFFF" },
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
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    cardId: "GDE-SS-CHR-2026-01",
    athleteId: "amara-boyd",
    firstName: "Amara",
    lastName: "Boyd",
    jerseyNumber: "01",
    position: "Flyer",
    team: "Vale Prep Vanguard",
    teamColors: { primary: "#8E2C6B", secondary: "#FFFFFF" },
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
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    cardId: "GDE-HE-BSB-2026-07",
    athleteId: "casey-whitlock",
    firstName: "Casey",
    lastName: "Whitlock",
    jerseyNumber: "7",
    position: "Outfield",
    team: "Harlow Creek Larks",
    teamColors: { primary: "#B5451B", secondary: "#F0E3D2" },
    season: "2026",
    classOf: "2028",
    stats: [
      { label: "AVG", value: ".341" },
      { label: "HR", value: "6" },
      { label: "RBI", value: "28" },
    ],
    playerHighlight: "Led the Larks in hits \u00b7 all-region outfield.",
    sportCode: "BSB",
    styleName: "Heritage",
    createdAt: "2026-09-01",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    cardId: "GDE-CA-SOC-2026-10",
    athleteId: "mateo-herrera",
    firstName: "Mateo",
    lastName: "Herrera",
    jerseyNumber: "10",
    position: "Midfield",
    team: "Sunfield Kestrels",
    teamColors: { primary: "#1E7B3C", secondary: "#F5F5F5" },
    season: "2026",
    classOf: "2029",
    stats: [
      { label: "GOALS", value: "14" },
      { label: "ASST", value: "11" },
      { label: "GP", value: "22" },
    ],
    playerHighlight: "Top scorer two seasons running \u00b7 wears the 10.",
    sportCode: "SOC",
    styleName: "Chrome All-Star",
    createdAt: "2026-09-01",
    isFictional: true,
    channel: "demo-etsy",
  },
  {
    cardId: "GDE-SS-VBL-2026-05",
    athleteId: "jaslene-ocampo",
    firstName: "Jaslene",
    lastName: "Ocampo",
    jerseyNumber: "5",
    position: "Outside",
    team: "Fox Hollow Anchors",
    teamColors: { primary: "#00695C", secondary: "#FFFFFF" },
    season: "2026",
    classOf: "2027",
    stats: [
      { label: "KILLS", value: "312" },
      { label: "ACES", value: "41" },
      { label: "DIGS", value: "188" },
    ],
    playerHighlight: "300+ kills as a junior \u00b7 all-conference outside.",
    sportCode: "VBL",
    styleName: "Signature Spotlight",
    createdAt: "2026-09-01",
    isFictional: true,
    channel: "demo-etsy",
  },
  // card:new inserts above
];

export function getCard(cardId: string): CardRecord | undefined {
  return cards.find((c) => c.cardId === cardId);
}

export function getAthleteCards(athleteId: string): CardRecord[] {
  return cards.filter((c) => c.athleteId === athleteId);
}

/** Cards that may appear in the sitemap / be indexed. */
export function publicCards(): CardRecord[] {
  return cards.filter((c) => isIndexable(c));
}

/** Every card that renders a page: public, unlisted and private (private = neutral notice only). Deleted records 404. */
export function renderableCards(): CardRecord[] {
  return cards.filter((c) => visibilityOf(c) !== "deleted");
}

/**
 * Whether `jerseyNumber` is a real shirt number that /c may print with a `#`. False for the five
 * sports that never wear one (the number in the id is then the printed edition number) and false for
 * every adult athlete, whatever the sport — an adult club player's card carries no shirt number.
 */
export function showsJerseyNumber(c: CardRecord): boolean {
  if (c.ageBand === "adult") return false;
  return sportByCode(c.sportCode)?.numbered ?? false;
}

/**
 * The three stat chips /c renders, in printed order: the sport-neutral `stats[]` when the record has
 * it, else the legacy basketball trio. Empty values are dropped — a chip is never a dash.
 */
export function cardStats(c: CardRecord): { label: string; value: string }[] {
  const rows =
    c.stats && c.stats.length
      ? c.stats
      : [
          // Printed order — the card prints PPG · APG · RPG, and the registry must not reorder it.
          { label: "PPG", value: c.ppg },
          { label: "APG", value: c.apg },
          { label: "RPG", value: c.rpg },
        ];
  return rows.filter((r): r is { label: string; value: string } => Boolean(r.value && r.value.trim())).slice(0, 3);
}

export interface CardHighlight {
  /** The highlight sentence without the career line and without the quote. */
  line?: string;
  /** The senior quote as printed, without its quotation marks. */
  quote?: string;
}

const QUOTED = /^[“"'‘'](.+)[”"'’']$/;
const CAREER_LINE = /\b(FR|SO|JR|SR)\s+\d{4}\b/;

/**
 * Split `playerHighlight` into the parts /c renders separately. The printed line is one string with
 * middle dots ("One last home game · FR 2023 – SR 2026 · “Leave it better …”"), so the career
 * fragment (rendered as its own row from `classOf`) and the quoted sentence (set in the finish's
 * display italic) are lifted out and never printed twice.
 */
export function parseHighlight(c: CardRecord): CardHighlight {
  const raw = (c.playerHighlight ?? "").trim();
  if (!raw) return {};
  const parts = raw.split("·").map((p) => p.trim()).filter(Boolean);
  const quoted = parts.find((p) => QUOTED.test(p));
  const rest = parts.filter((p) => p !== quoted && !CAREER_LINE.test(p));
  return {
    line: rest.length ? rest.join(" · ") : undefined,
    quote: quoted ? (QUOTED.exec(quoted)?.[1] ?? quoted) : undefined,
  };
}

/**
 * The four-year career line a Senior Night card prints (FR · SO · JR · SR), derived from the class
 * year the record already carries. Undefined when there is no class year to derive it from.
 */
export function seniorYears(classOf: string | undefined): { label: string; year: string }[] | undefined {
  const sr = Number(classOf);
  if (!classOf || !Number.isInteger(sr)) return undefined;
  return ["FR", "SO", "JR", "SR"].map((label, i) => ({ label, year: String(sr - 3 + i) }));
}

const cardPath = (c: CardRecord): string => `/c/${c.cardId}`;
const pathsWhere = (v: Visibility): string[] => cards.filter((c) => visibilityOf(c) === v).map(cardPath);

/** Exact paths that need an explicit `X-Robots-Tag: noindex, nofollow` header rule (CONTRACTS §6.2). */
export const unlistedCardPaths = (): string[] => pathsWhere("unlisted");
export const privateCardPaths = (): string[] => pathsWhere("private");
/** Exact paths `next.config.ts` rewrites to /api/gone (410). Empty today; the mechanism ships anyway. */
export const deletedCardPaths = (): string[] => pathsWhere("deleted");

/** The date the edition panel prints as REGISTERED (GAPS #36): the explicit field, else the record's createdAt. */
export function registeredAtOf(c: Pick<CardRecord, "registeredAt" | "createdAt">): string {
  return c.registeredAt ?? c.createdAt;
}

/** "Last updated" on /c and the sitemap's lastModified: the explicit field, else the registration date. */
export function updatedAtOf(c: Pick<CardRecord, "updatedAt" | "registeredAt" | "createdAt">): string {
  return c.updatedAt ?? registeredAtOf(c);
}
