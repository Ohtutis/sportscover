/**
 * One stat on /c (DESIGN §4.22): the value in the finish's display face, the label in Barlow under it.
 * A page omits the whole row when `stats[]` is empty — never a dash.
 */
export interface StatChipProps {
  value: string;
  label: string;
  tone?: "arena" | "stock";
  className?: string;
}

export function StatChip({ value, label, tone = "arena", className = "" }: StatChipProps) {
  const arena = tone === "arena";
  return (
    <div
      role="group"
      aria-label={`${label} ${value}`}
      className={`min-w-[5.5rem] rounded-ui border px-4 py-3 text-center ${arena ? "border-arena-hairline bg-arena-surface" : "border-hairline bg-stock"} ${className}`.trim()}
    >
      <span className={`block text-[1.75rem] leading-none tabular-nums ${arena ? "font-finish-display text-white" : "font-display text-ink"}`}>{value}</span>
      <span className={`mt-1 block font-label text-label font-semibold uppercase tracking-[0.12em] ${arena ? "text-arena-muted" : "text-muted-text"}`}>{label}</span>
    </div>
  );
}
