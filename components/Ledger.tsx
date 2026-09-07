import type { ReactNode } from "react";

/**
 * The spec sheet as a design object (DESIGN §4.11): a definition list with Barlow keys and Space
 * Grotesk values, no zebra, no icons, no bold values. `size="lg"` is the product page's second hero.
 * Used by spec sheets, the refund ladder, the verdict card, the photo-privacy plate, contact topics, the imprint.
 *
 * **Key and value stack when the ledger is narrow** (owner review, 2026-09-07). The two columns used to
 * be a flat `sm:grid-cols-[38%_1fr]`, sized against the viewport rather than against the box the ledger
 * is standing in: at `/trading-cards` §02 that gave 293 px of key column to the word "Size" while the
 * value wrapped inside 453 px, and in a narrow page column it left the value about 22 characters wide.
 * The row is now a container query on the ledger itself — stacked below 32 rem of *its own* width, side
 * by side above it, with the key column capped at 12 rem so a one-word key never buys a third of the
 * table. `stacked` forces the stacked form at any width.
 */
export interface LedgerRow {
  key: ReactNode;
  value: ReactNode;
  id?: string;
}

export interface LedgerProps {
  rows: LedgerRow[];
  size?: "md" | "lg";
  tone?: "stock" | "arena";
  /** Always put the key above the value, whatever the container width. */
  stacked?: boolean;
  id?: string;
  className?: string;
}

export function Ledger({ rows, size = "md", tone = "stock", stacked = false, id, className = "" }: LedgerProps) {
  const arena = tone === "arena";
  const columns = stacked ? "grid-cols-1" : "grid-cols-1 @lg:grid-cols-[minmax(0,12rem)_1fr]";
  return (
    <dl
      id={id}
      className={`@container rounded-ui border ${arena ? "border-arena-hairline bg-arena-surface" : "border-hairline bg-stock"} ${className}`.trim()}
    >
      {rows.map((row, i) => (
        <div
          key={row.id ?? i}
          id={row.id}
          className={`grid ${columns} gap-x-8 gap-y-1 border-b px-4 last:border-b-0 sm:px-6 ${arena ? "border-arena-hairline" : "border-hairline"} ${size === "lg" ? "py-4" : "py-3"}`}
        >
          <dt className={`pt-1 font-label text-label font-semibold uppercase tracking-[0.12em] ${arena ? "text-arena-muted" : "text-muted-text"}`}>{row.key}</dt>
          <dd className={`font-body font-medium leading-[1.5] tabular-nums ${arena ? "text-white" : "text-ink"} ${size === "lg" ? "text-[1rem]" : "text-[0.9375rem]"}`}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
