import type { ReactNode } from "react";

/**
 * Pill (DESIGN §4.1): Anton, uppercase, no period. `accent` is the ONE primary claim on a page;
 * `outline` the secondary; `outline-silver` for arena; `gold` only inside Senior Night media and the
 * /c SR header. Never two accent pills in one section.
 */
export type PillTone = "accent" | "outline" | "outline-silver" | "gold";

const TONES: Record<PillTone, string> = {
  accent: "bg-accent text-ink",
  outline: "border border-ink text-ink",
  "outline-silver": "border border-white/40 text-white",
  gold: "border border-gold text-gold",
};

export interface PillProps {
  tone?: PillTone;
  as?: "span" | "li";
  children: ReactNode;
  className?: string;
}

export function Pill({ tone = "outline", as: Tag = "span", children, className = "" }: PillProps) {
  return (
    <Tag
      className={`inline-flex h-8 items-center whitespace-nowrap rounded-pill px-3 font-display text-pill uppercase leading-none tracking-[0.06em] ${TONES[tone]} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
