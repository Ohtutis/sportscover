/**
 * The page's two badges (owner review 2026-10-04, point 17 — orange is kept for the two CTAs, these
 * badges and the summary ticks): `SELECTED` on a chosen tile and `MOST POPULAR` on the set card. Anton on
 * the accent, ink text (6.3 : 1), a small pill. Absolutely placed by the caller, so a badge appearing on
 * selection never moves anything (CLS 0).
 */
export function Badge({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-pill bg-accent px-2.5 font-display text-[0.75rem] uppercase leading-none tracking-[0.06em] text-ink ${className}`.trim()}
    >
      {children}
    </span>
  );
}
