/**
 * The Front / Back segmented control CardFlip renders under the card when the visitor asks for
 * reduced motion (CONTRACTS §3.1): a two-state switch, no animation. Lives in its own file because
 * CardFlip.tsx may contain no radius other than the card's zero (§1.3) and these are UI buttons.
 */
export type FlipSide = "front" | "back";

export interface FlipSideSwitchProps {
  side: FlipSide;
  onChange: (side: FlipSide) => void;
  className?: string;
}

export function FlipSideSwitch({ side, onChange, className = "" }: FlipSideSwitchProps) {
  return (
    <div role="group" aria-label="Card side" className={`flex justify-center gap-2 ${className}`.trim()}>
      {(["front", "back"] as FlipSide[]).map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={side === s}
          onClick={() => onChange(s)}
          className={`inline-flex h-10 min-w-24 items-center justify-center rounded-ui border-[1.5px] px-4 font-display text-[0.875rem] uppercase leading-none tracking-[0.04em] transition-[color,background-color,border-color] duration-hover ease-out ${
            side === s ? "border-white bg-white text-ink" : "border-white/40 text-white"
          }`}
        >
          {s === "front" ? "Front" : "Back"}
        </button>
      ))}
    </div>
  );
}
