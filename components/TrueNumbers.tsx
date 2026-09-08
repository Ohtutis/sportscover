import Link from "next/link";
import { TRUE_COUNT_LINKS, trueCountRest, type TrueCountLink } from "../lib/catalog/tiers";

/**
 * The score bug (DESIGN §4.17): the figure in Anton over the rest of its TRUE_COUNTS string, each
 * linked to its proof page. Figures come from lib/catalog constants, never typed here. The figure is
 * a substring of the label, so it is LIFTED OUT of the sentence under it (`trueCountRest`) — setting
 * both whole made the footer read "1717 sports" (design review 2026-09-07); the link keeps the full
 * sentence as its accessible name. Used by SiteFooter (arena) and /about §6 (stock).
 *
 * Owner review 2026-09-07, three defects in one strip: only three of the five cells carried a numeral
 * (the other two were plain sentences, 49 px off their neighbours' baseline), the second cell's
 * numeral wore the link's hover underline, and the third cell's "number" is a 188 px dimension string
 * set at the same 44 px as a two-character figure. Now: the figure row is a FIXED-HEIGHT baseline for
 * every cell, so the sentences under them start at one height whatever the figure is; a long figure
 * (a dimension) is set smaller so it fits that row; and the underline belongs to the sentence, never
 * to the figure. A cell without `numeral` still sets its whole label as a sentence.
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

/** One baseline for every cell: a figure of two characters and a dimension string sit on the same line. */
const FIGURE_ROW = "flex h-8 items-end md:h-11";
const figureSize = (figure: string): string => (figure.length > 4 ? "text-[1.375rem] md:text-[1.75rem]" : "text-[2rem] md:text-[2.75rem]");

export function TrueNumbers({ tone = "arena", items = TRUE_COUNT_LINKS, className = "" }: TrueNumbersProps) {
  const arena = tone === "arena";
  const rule = arena ? "border-white/15 divide-white/15" : "border-hairline divide-hairline";
  return (
    <ul className={`grid grid-cols-2 divide-y border-y md:divide-x md:divide-y-0 ${COLS[items.length] ?? "md:grid-cols-5"} ${rule} ${className}`.trim()}>
      {items.map((item) => (
        <li key={item.href + item.figure}>
          <Link href={item.href} aria-label={item.label} className="group block px-4 py-5">
            {item.numeral ? (
              <>
                <span aria-hidden="true" className={FIGURE_ROW}>
                  {/* nowrap: at 768 the five cells are 140.8 px and "2.5 × 3.5 IN" broke between the
                      number and its unit — a dimension is one word (layout audit 2026-09-08). */}
                  <span
                    className={`whitespace-nowrap font-display uppercase leading-none tabular-nums ${figureSize(item.figure)} ${arena ? "text-white" : "text-ink"}`}
                  >
                    {item.figure}
                  </span>
                </span>
                <span
                  className={`mt-3 block font-body text-small underline-offset-4 decoration-1 group-hover:underline ${arena ? "text-white/80" : "text-muted-text"}`}
                >
                  {trueCountRest(item)}
                </span>
              </>
            ) : (
              <span
                className={`block font-body text-[1rem] font-medium leading-[1.35] text-balance underline-offset-4 decoration-1 group-hover:underline ${arena ? "text-white" : "text-ink"}`}
              >
                {item.label}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
