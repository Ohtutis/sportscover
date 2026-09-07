import type { ReactNode } from "react";

/**
 * Pill (DESIGN §4.1): Anton, uppercase, no period. `accent` is the ONE primary claim on a page;
 * `outline` the secondary; `outline-silver` for arena; `gold` only inside Senior Night media and the
 * /c SR header. Never two accent pills in one section.
 *
 * `variant` (2026-09-07, owner review): the default `chip` is the lozenge above. `label` is the same
 * claim as TYPE — no fill, no border, no radius, no fixed height — for the one place a claim sits
 * directly above real buttons (the home hero). A filled accent lozenge next to an outlined one, eight
 * pixels above a filled accent button next to an outlined button, is the button pattern twice: buyers
 * tried to click the claims. The accent survives as a 3 px tick, so the page still makes its one
 * accent claim without offering a second thing to press.
 */
export type PillTone = "accent" | "outline" | "outline-silver" | "gold";
export type PillVariant = "chip" | "label";

const TONES: Record<PillTone, string> = {
  accent: "bg-accent text-ink",
  outline: "border border-ink text-ink",
  "outline-silver": "border border-white/40 text-white",
  gold: "border border-gold text-gold",
};

/** Label variant: colour only — the tick carries the accent, the text never does (accent is 2.6:1). */
const LABEL_TONES: Record<PillTone, string> = {
  accent: "text-ink",
  outline: "text-muted-text",
  "outline-silver": "text-arena-muted",
  gold: "text-gold",
};

export interface PillProps {
  tone?: PillTone;
  variant?: PillVariant;
  as?: "span" | "li";
  children: ReactNode;
  className?: string;
}

export function Pill({ tone = "outline", variant = "chip", as: Tag = "span", children, className = "" }: PillProps) {
  if (variant === "label") {
    return (
      <Tag
        className={`inline-flex items-center gap-2 font-label text-label font-semibold uppercase leading-none tracking-[0.12em] ${LABEL_TONES[tone]} ${className}`.trim()}
      >
        {tone === "accent" ? <span aria-hidden="true" className="inline-block h-3 w-[3px] shrink-0 bg-accent" /> : null}
        {children}
      </Tag>
    );
  }
  return (
    <Tag
      className={`inline-flex h-8 items-center whitespace-nowrap rounded-pill px-3 font-display text-pill uppercase leading-none tracking-[0.06em] ${TONES[tone]} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
