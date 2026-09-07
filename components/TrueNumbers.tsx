import Link from "next/link";
import { TRUE_COUNT_LINKS, trueCountRest, type TrueCountLink } from "../lib/catalog/tiers";

/**
 * The score bug (DESIGN §4.17): the figure in Anton over the rest of its TRUE_COUNTS string, each
 * linked to its proof page. Figures come from lib/catalog constants, never typed here. The figure is
 * a substring of the label, so it is LIFTED OUT of the sentence under it (`trueCountRest`) — setting
 * both whole made the footer read "1717 sports" (design review 2026-09-07); the link keeps the full
 * sentence as its accessible name. An entry with no real figure ("Free", "ID") is set as a sentence
 * and gets no numeral. Used by SiteFooter (arena) and /about §6 (stock).
 */
export interface TrueNumbersProps {
  tone?: "arena" | "stock";
  items?: TrueCountLink[];
  className?: string;
}

const COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

export function TrueNumbers({ tone = "arena", items = TRUE_COUNT_LINKS, className = "" }: TrueNumbersProps) {
  const arena = tone === "arena";
  const rule = arena ? "border-white/15 divide-white/15" : "border-hairline divide-hairline";
  return (
    <ul className={`grid grid-cols-2 divide-y border-y md:divide-x md:divide-y-0 ${COLS[items.length] ?? "md:grid-cols-5"} ${rule} ${className}`.trim()}>
      {items.map((item) => (
        <li key={item.href + item.figure}>
          <Link href={item.href} aria-label={item.label} className="block px-4 py-5 underline-offset-4 hover:underline">
            {item.numeral ? (
              <>
                <span className={`block font-display text-[2rem] uppercase leading-none tabular-nums md:text-[2.75rem] ${arena ? "text-white" : "text-ink"}`}>{item.figure}</span>
                <span className={`mt-2 block font-body text-small ${arena ? "text-white/80" : "text-muted-text"}`}>{trueCountRest(item)}</span>
              </>
            ) : (
              <span className={`block font-body text-[1rem] font-medium leading-[1.35] text-balance ${arena ? "text-white" : "text-ink"}`}>{item.label}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
