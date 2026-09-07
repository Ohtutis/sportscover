import { formatEt, nextAvailableStart } from "../lib/capacity";

/**
 * The chip-derived dates with the cap off (CONTRACTS §3 / §9.2 #2). Built for the three family
 * pages; in F1 it is NOT mounted anywhere (GAPS #13) — one delivery claim per page, and that claim
 * is the chips. `now` is passed in so the render is deterministic.
 */
export function CapacityNote({ now, tone = "stock", className = "" }: { now: Date; tone?: "stock" | "arena"; className?: string }) {
  const { start, filesBy, printsShipBy } = nextAvailableStart(now);
  return (
    <p className={`font-body text-small ${tone === "arena" ? "text-arena-muted" : "text-muted-text"} ${className}`.trim()}>
      Next available start: {formatEt(start, "medium")} · files by {formatEt(filesBy, "medium")} · prints ship by {formatEt(printsShipBy, "medium")}
    </p>
  );
}
