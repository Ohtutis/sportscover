import { CHIPS, chipSegment, type ChipKind } from "../lib/catalog/delivery";

/**
 * The delivery claim (DESIGN §4.2) — one per page. `CHIPS[kind]` split on ` · ` for wrapping only;
 * a TierCard passes `segment` (GAPS #23) and gets the one matching chip. Barlow, no icon, no colour:
 * a line of record, not a badge. Repeating the identical string beside the closing CTA is one claim.
 */
export interface DeliveryChipsProps {
  kind: keyof typeof CHIPS;
  tone?: "stock" | "arena";
  /** Render only this segment of the standard chip (TierCard). */
  segment?: ChipKind;
  /** Explicit chip strings (already cut from the catalog); wins over `kind` / `segment`. */
  items?: string[];
  className?: string;
}

export const chipClass = (tone: "stock" | "arena" = "stock"): string =>
  `inline-flex h-8 items-center whitespace-nowrap rounded-pill border px-3 font-label text-label font-semibold uppercase tracking-[0.12em] ${
    tone === "arena" ? "border-white/20 bg-arena-surface text-white" : "border-hairline bg-stock text-ink"
  }`;

export function DeliveryChips({ kind, tone = "stock", segment, items, className = "" }: DeliveryChipsProps) {
  const chips = items ?? (segment ? [chipSegment(segment)] : CHIPS[kind].split(" · "));
  return (
    <ul aria-label="Delivery times" className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {chips.map((chip) => (
        <li key={chip} className={chipClass(tone)}>
          {chip}
        </li>
      ))}
    </ul>
  );
}
