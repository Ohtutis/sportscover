import type { ReactNode } from "react";

/**
 * The mat a product sits on (DESIGN §4.5): 8 % inset, `bg-hairline` for light objects or `bg-arena`
 * for dark art, inside a ruled plate (`rounded-ui border border-hairline overflow-hidden`). The plate
 * may be rounded; the card on it never is. `aspect` (e.g. "aspect-[4/5]") sizes the mat itself.
 *
 * **Only for art that is genuinely light on light, or for a media well inside a bordered tile.** A mat
 * under dark art is a grey box the block spends a quarter of its area on: the audit of 2026-09-07 found
 * 25 of them on `/trading-cards` alone, fill ratios 30–74 %. Everywhere the object was already dark —
 * the finish row, the 17-sport grid, the cheer pair, the flip, the senior-night tiles and all four
 * heroes — the mat is gone and the product floats on the page's own stock with `--shadow-card-stock`.
 * What is left is `FamilyCard`'s 4 : 5 media well — a bounded tile on the home page whose composed
 * faces are laid out against it, not a ground painted behind a product.
 */
export interface MatProps {
  tone?: "stock" | "arena";
  children: ReactNode;
  /** Wrap in the ruled plate (default). Off when the parent is already a plate. */
  plate?: boolean;
  /** Tailwind aspect class for the mat box. */
  aspect?: string;
  /** Classes on the outer element (the plate, or the mat when `plate` is false). */
  className?: string;
  /** Classes on the mat when the plate is on. */
  matClassName?: string;
}

export function Mat({ tone = "stock", children, plate = true, aspect = "", className = "", matClassName = "" }: MatProps) {
  const matClasses = `flex items-center justify-center p-[8%] ${tone === "arena" ? "bg-arena" : "bg-hairline"} ${aspect}`;
  if (!plate) return <div className={`${matClasses} ${className}`.trim()}>{children}</div>;
  return (
    <div className={`overflow-hidden rounded-ui border border-hairline ${className}`.trim()}>
      <div className={`${matClasses} ${matClassName}`.trim()}>{children}</div>
    </div>
  );
}
