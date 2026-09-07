// Occasions and their date windows (CONTRACTS §4.5). Senior Night and the end-of-season team gift
// are always on; Christmas appears Oct 20 → Jan 5. F1 hrefs point where the page exists today.

import { toEtDate, type IsoDate } from "../capacity";
import { SUPPORT_EMAIL } from "../site";

export type OccasionId = "senior-night" | "christmas" | "end-of-season";

export interface Occasion {
  id: OccasionId;
  name: string;
  /** The occasion's own page once it exists (F2+). */
  href: string;
  /** Where F1 sends the visitor while that page does not exist. */
  hrefF1: string;
  chips: "standard" | "seniorNight";
  window?: { start: { m: number; d: number }; end: { m: number; d: number } };
}

export const TEAM_ORDER_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=Team%20order`;

export const occasions: Occasion[] = [
  { id: "senior-night", name: "Senior Night", href: "/senior-night", hrefF1: "/senior-night", chips: "seniorNight" },
  {
    id: "christmas",
    name: "Christmas",
    href: "/christmas-gift",
    hrefF1: "/complete-set",
    chips: "standard",
    window: { start: { m: 10, d: 20 }, end: { m: 1, d: 5 } },
  },
  { id: "end-of-season", name: "End of season", href: "/teams", hrefF1: TEAM_ORDER_MAILTO, chips: "standard" },
];

const monthDay = (d: IsoDate): number => Number(d.slice(5, 7)) * 100 + Number(d.slice(8, 10));

/** Whether `d` falls inside the occasion's window; a window that crosses New Year wraps. */
export function inWindow(o: Occasion, d: IsoDate): boolean {
  if (!o.window) return true;
  const md = monthDay(d);
  const start = o.window.start.m * 100 + o.window.start.d;
  const end = o.window.end.m * 100 + o.window.end.d;
  return start <= end ? md >= start && md <= end : md >= start || md <= end;
}

export const occasionById = (id: OccasionId): Occasion | undefined => occasions.find((o) => o.id === id);

export function isChristmasWindow(now: Date): boolean {
  const christmas = occasionById("christmas");
  return Boolean(christmas && inWindow(christmas, toEtDate(now)));
}

/** In render order: senior-night, christmas (only inside its window), end-of-season. */
export function activeOccasions(now: Date): Occasion[] {
  const today = toEtDate(now);
  return occasions.filter((o) => inWindow(o, today));
}

/** The href a page links today: the occasion's own page once the site sells direct, else the F1 target. */
export function occasionHref(o: Occasion, sellsDirect = false): string {
  return sellsDirect ? o.href : o.hrefF1;
}
