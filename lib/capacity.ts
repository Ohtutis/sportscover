// Committed dates, pure and deterministic (CONTRACTS §4.4). Every date is a calendar date in US
// Eastern ("YYYY-MM-DD"); arithmetic runs on UTC-midnight timestamps so DST never shifts a day.
// D5: there is no weekly cap. Nothing here reads a roster, a clock or the file system — pages pass
// `now`, the Senior Night island is handed `todayEt` by the server, and tests pass fixed dates.

import { LEAD_TIMES } from "./catalog/delivery";

/** "YYYY-MM-DD", a calendar date in US Eastern. */
export type IsoDate = string;
export const ET = "America/New_York";

/** D5: off. `capacity:set` (F2) flips it; nothing in F1 reads a roster. */
export const WEEKLY_CAP: number | null = null;
/** Assumption until a shipment is tracked (CONTRACTS §9.2 #11): USPS ground inside the US. */
export const US_TRANSIT_BUSINESS_DAYS = 5;

/**
 * Days the labs do not print (2026–2027): New Year's Day, Memorial Day, Independence Day
 * (observed), Labor Day, Thanksgiving and the Friday after, Dec 24–25. An assumption named as a
 * constant so the owner can change one line.
 */
export const LAB_HOLIDAYS: IsoDate[] = [
  "2026-01-01", // New Year's Day (Thu)
  "2026-05-25", // Memorial Day
  "2026-07-03", // Independence Day observed (Jul 4 is a Saturday)
  "2026-09-07", // Labor Day
  "2026-11-26", // Thanksgiving
  "2026-11-27", // the Friday after
  "2026-12-24",
  "2026-12-25",
  "2027-01-01", // New Year's Day (Fri)
  "2027-05-31", // Memorial Day
  "2027-07-05", // Independence Day observed (Jul 4 is a Sunday)
  "2027-09-06", // Labor Day
  "2027-11-25", // Thanksgiving
  "2027-11-26", // the Friday after
  "2027-12-24", // Dec 25, 2027 is a Saturday — already a non-business day
];

/** Calendar days before the night, from CHIPS.seniorNight ("1 WEEK" · "2 WEEKS" · "3–4 WKS"). */
export const SR_LEAD = { filesDaysBefore: 7, printedSetDaysBefore: 14, sealedPackDaysBefore: [21, 28] as const } as const;

// --- date arithmetic --------------------------------------------------------

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

function toUtcMs(d: IsoDate): number {
  const m = ISO.exec(d);
  if (!m) throw new Error(`capacity: "${d}" is not a YYYY-MM-DD date`);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function fromUtcMs(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(d: IsoDate): number {
  return new Date(toUtcMs(d)).getUTCDay();
}

/** The calendar date in US Eastern for a timestamp. */
export function toEtDate(now: Date): IsoDate {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: ET, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function isBusinessDay(d: IsoDate): boolean {
  const w = weekdayOf(d);
  return w !== 0 && w !== 6 && !LAB_HOLIDAYS.includes(d);
}

export function addCalendarDays(d: IsoDate, n: number): IsoDate {
  return fromUtcMs(toUtcMs(d) + n * DAY_MS);
}

/** `d` itself when it is a business day, else the next one. */
export function nextBusinessDay(d: IsoDate): IsoDate {
  let x = d;
  while (!isBusinessDay(x)) x = addCalendarDays(x, 1);
  return x;
}

/** `d` itself when it is a business day, else the previous one. */
export function prevBusinessDay(d: IsoDate): IsoDate {
  let x = d;
  while (!isBusinessDay(x)) x = addCalendarDays(x, -1);
  return x;
}

/** Day 0 = nextBusinessDay(d); then n further business days (n ≥ 0). */
export function addBusinessDays(d: IsoDate, n: number): IsoDate {
  if (n < 0) throw new Error("addBusinessDays: n must be ≥ 0 (use subtractBusinessDays)");
  let x = nextBusinessDay(d);
  for (let i = 0; i < n; i += 1) x = nextBusinessDay(addCalendarDays(x, 1));
  return x;
}

/** Day 0 = prevBusinessDay(d); then n business days back (n ≥ 0). */
export function subtractBusinessDays(d: IsoDate, n: number): IsoDate {
  if (n < 0) throw new Error("subtractBusinessDays: n must be ≥ 0 (use addBusinessDays)");
  let x = prevBusinessDay(d);
  for (let i = 0; i < n; i += 1) x = prevBusinessDay(addCalendarDays(x, -1));
  return x;
}

/** Business days in (from, to]; 0 when to ≤ from. */
export function businessDaysBetween(from: IsoDate, to: IsoDate): number {
  if (to <= from) return 0;
  let count = 0;
  let x = addCalendarDays(from, 1);
  while (x <= to) {
    if (isBusinessDay(x)) count += 1;
    x = addCalendarDays(x, 1);
  }
  return count;
}

// --- committed dates --------------------------------------------------------

export type CommitKind = "digital" | "prints" | "pack";

/**
 * The window a package is committed to when ordered at `orderedAt` (LEAD_TIMES): digital files
 * +1/+2 business days · printed items ship +5/+7 business days · sealed pack +3/+4 calendar weeks.
 */
export function committedDates(kind: CommitKind, orderedAt: Date): { earliest: IsoDate; latest: IsoDate } {
  const day = toEtDate(orderedAt);
  if (kind === "digital") {
    const [a, b] = LEAD_TIMES.digitalBusinessDays;
    return { earliest: addBusinessDays(day, a), latest: addBusinessDays(day, b) };
  }
  if (kind === "prints") {
    const [a, b] = LEAD_TIMES.printShipBusinessDays;
    return { earliest: addBusinessDays(day, a), latest: addBusinessDays(day, b) };
  }
  const [a, b] = LEAD_TIMES.sealedPackWeeks;
  return { earliest: addCalendarDays(day, a * 7), latest: addCalendarDays(day, b * 7) };
}

/** The latest order date d with addBusinessDays(d, lead) ≤ target. */
export function orderByFor(target: IsoDate, leadBusinessDays: number): IsoDate {
  let d = target;
  // addBusinessDays is monotonic in d, so walking back one calendar day at a time terminates.
  let guard = leadBusinessDays * 3 + 60;
  while (addBusinessDays(d, leadBusinessDays) > target && guard > 0) {
    d = addCalendarDays(d, -1);
    guard -= 1;
  }
  return d;
}

/** target − leadDays, calendar days. */
export function orderByForCalendar(target: IsoDate, leadDays: number): IsoDate {
  return addCalendarDays(target, -leadDays);
}

export interface PlanRow {
  key: "files" | "printedSet" | "sealedPack";
  fits: boolean;
  orderBy: IsoDate;
  arrivesBy: IsoDate;
}

export interface SeniorNightPlan {
  night: IsoDate;
  today: IsoDate;
  rows: PlanRow[];
  anythingPrintedFits: boolean;
  /** A plain label in F1 (GAPS #29): Senior Night prices stay Etsy-only, so no snset tier is read. */
  bestTier: "GDE-ANY-SNSET-PRINT" | "GDE-ANY-SNSET-DIG";
}

/**
 * What can still arrive before a senior night when ordered today. `fits = orderBy >= today` for
 * every row. The printed set and the sealed pack use the chip's calendar lead (SR_LEAD: 2 weeks,
 * 3–4 weeks → the safe end); the files row uses the real digital clock (LEAD_TIMES, business days),
 * which is always inside the chip's "1 week" — so a night three days out still gets its files,
 * and a night tomorrow does not. `arrivesBy` is the date each row lands when ordered today.
 */
export function seniorNightPlan(night: IsoDate, todayEt: IsoDate): SeniorNightPlan {
  const digitalLead = LEAD_TIMES.digitalBusinessDays[1];
  const filesOrderBy = orderByFor(addCalendarDays(night, -1), digitalLead);
  const files: PlanRow = {
    key: "files",
    orderBy: filesOrderBy,
    arrivesBy: addBusinessDays(todayEt, digitalLead),
    fits: filesOrderBy >= todayEt,
  };
  const printedOrderBy = orderByForCalendar(night, SR_LEAD.printedSetDaysBefore);
  const printedSet: PlanRow = {
    key: "printedSet",
    orderBy: printedOrderBy,
    arrivesBy: addCalendarDays(todayEt, SR_LEAD.printedSetDaysBefore),
    fits: printedOrderBy >= todayEt,
  };
  const packLead = SR_LEAD.sealedPackDaysBefore[1];
  const packOrderBy = orderByForCalendar(night, packLead);
  const sealedPack: PlanRow = {
    key: "sealedPack",
    orderBy: packOrderBy,
    arrivesBy: addCalendarDays(todayEt, packLead),
    fits: packOrderBy >= todayEt,
  };
  const anythingPrintedFits = printedSet.fits || sealedPack.fits;
  return {
    night,
    today: todayEt,
    rows: [files, printedSet, sealedPack],
    anythingPrintedFits,
    bestTier: printedSet.fits ? "GDE-ANY-SNSET-PRINT" : "GDE-ANY-SNSET-DIG",
  };
}

/**
 * Order-by dates for Dec 24 of the current window's year (after Dec 24 the window rolls to next
 * year): printed = 7 business days to ship + US transit; digital = 2 business days.
 */
export function christmasDates(now: Date): { year: number; printedBy: IsoDate; digitalBy: IsoDate } {
  const today = toEtDate(now);
  const thisYear = Number(today.slice(0, 4));
  const year = today <= `${thisYear}-12-24` ? thisYear : thisYear + 1;
  const dec24 = `${year}-12-24`;
  return {
    year,
    printedBy: orderByFor(dec24, LEAD_TIMES.printShipBusinessDays[1] + US_TRANSIT_BUSINESS_DAYS),
    digitalBy: orderByFor(dec24, LEAD_TIMES.digitalBusinessDays[1]),
  };
}

/** WEEKLY_CAP null → start = the next business day; files +2, prints ship +7 business days from it. */
export function nextAvailableStart(now: Date): { start: IsoDate; filesBy: IsoDate; printsShipBy: IsoDate } {
  const start = nextBusinessDay(toEtDate(now));
  return {
    start,
    filesBy: addBusinessDays(start, LEAD_TIMES.digitalBusinessDays[1]),
    printsShipBy: addBusinessDays(start, LEAD_TIMES.printShipBusinessDays[1]),
  };
}

export type EtDateStyle = "weekday-short" | "medium" | "long";

/** "Mon Sep 14" | "Sep 14, 2026" | "September 14, 2026" — from a calendar date, never from a clock. */
export function formatEt(d: IsoDate, style: EtDateStyle): string {
  const date = new Date(toUtcMs(d));
  if (style === "weekday-short") {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    return `${get("weekday")} ${get("month")} ${get("day")}`;
  }
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: style === "long" ? "long" : "short", day: "numeric", year: "numeric" }).format(date);
}
