import type { ReactNode } from "react";

/**
 * A solid text plate over imagery (DESIGN §4.5): `bg-stock` or `bg-arena`, rounded-ui, never a blur,
 * never a translucent fill. `padding="sm"` is the small in-frame plate a FictionalLabel or a pill sits on.
 */
export interface PlateProps {
  tone: "stock" | "arena";
  children: ReactNode;
  padding?: "sm" | "md";
  className?: string;
}

export function Plate({ tone, children, padding = "md", className = "" }: PlateProps) {
  return (
    <div
      className={`${padding === "sm" ? "rounded-[4px] px-2 py-1" : "rounded-ui p-4"} ${tone === "arena" ? "bg-arena text-white" : "bg-stock text-ink"} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
