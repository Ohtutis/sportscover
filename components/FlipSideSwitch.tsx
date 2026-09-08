/**
 * The Front / Back segmented control CardFlip renders under the card when the visitor asks for
 * reduced motion (CONTRACTS §3.1): a two-state switch, no animation. Lives in its own file because
 * CardFlip.tsx may contain no radius other than the card's zero (§1.3) and these are UI buttons.
 *
 * It only ever had an ARENA look — `border-white/40 text-white` — and CardFlip renders it on the stock
 * product pages too, where the unselected button measured 1.06 : 1 against the cream (audit 2026-09-08,
 * B4). Since reduced motion REPLACES the flip with this control, the accessible path was the broken
 * one. `tone` picks the pair, and the stock pair also carries `arena:` overrides so a page that forgets
 * to pass the prop still reads correctly on the dark surface.
 */
export type FlipSide = "front" | "back";

export interface FlipSideSwitchProps {
  side: FlipSide;
  onChange: (side: FlipSide) => void;
  /** The band the switch sits on. Defaults to stock, which self-corrects inside `[data-surface=arena]`. */
  tone?: "stock" | "arena";
  className?: string;
}

const SELECTED = {
  stock: "border-ink bg-ink text-stock arena:border-white arena:bg-white arena:text-ink",
  arena: "border-white bg-white text-ink",
} as const;
const UNSELECTED = {
  stock: "border-ink/40 text-ink hover:bg-ink/5 arena:border-white/40 arena:text-white arena:hover:bg-white/10",
  arena: "border-white/40 text-white hover:bg-white/10",
} as const;

export function FlipSideSwitch({ side, onChange, tone = "stock", className = "" }: FlipSideSwitchProps) {
  return (
    <div role="group" aria-label="Card side" className={`flex justify-center gap-2 ${className}`.trim()}>
      {(["front", "back"] as FlipSide[]).map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={side === s}
          onClick={() => onChange(s)}
          className={`inline-flex h-11 min-w-24 items-center justify-center rounded-ui border-[1.5px] px-4 font-display text-[0.875rem] uppercase leading-none tracking-[0.04em] transition-[color,background-color,border-color] duration-hover ease-out ${
            side === s ? SELECTED[tone] : UNSELECTED[tone]
          }`}
        >
          {s === "front" ? "Front" : "Back"}
        </button>
      ))}
    </div>
  );
}
