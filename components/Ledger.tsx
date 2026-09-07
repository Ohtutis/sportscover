import type { ReactNode } from "react";

/**
 * The spec sheet as a design object (DESIGN §4.11): a definition list with Barlow keys and Space
 * Grotesk values, no zebra, no icons, no bold values. `size="lg"` is the product page's second hero.
 * Used by spec sheets, the refund ladder, the verdict card, the photo-privacy plate, contact topics, the imprint.
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
  id?: string;
  className?: string;
}

export function Ledger({ rows, size = "md", tone = "stock", id, className = "" }: LedgerProps) {
  const arena = tone === "arena";
  return (
    <dl id={id} className={`rounded-ui border ${arena ? "border-arena-hairline bg-arena-surface" : "border-hairline bg-stock"} ${className}`.trim()}>
      {rows.map((row, i) => (
        <div
          key={row.id ?? i}
          id={row.id}
          className={`grid grid-cols-1 gap-x-6 gap-y-1 border-b px-4 last:border-b-0 sm:grid-cols-[38%_1fr] sm:px-6 ${arena ? "border-arena-hairline" : "border-hairline"} ${size === "lg" ? "py-4" : "py-3"}`}
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
