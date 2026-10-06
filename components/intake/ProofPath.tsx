import { CheckIcon } from "../icons";

/**
 * The stateful step row of /free-proof/thanks: 1 photos received → 2 the watermarked proof → 3 approve
 * and pay your way → 4 watermark off, delivered — with the reader's step marked.
 *
 * The four-step PATH itself (the how-it-works cards and the list) is ONE shared component,
 * `components/ProofPath.tsx` (owner review 2026-10-06); the duplicate `ProofPath` that lived here is
 * gone. What stays is this row, because only the thanks page needs a "you are here" state.
 *
 * The steps are ruled like the rest of the catalogue: a 2 px rule per step, ink up to the step the reader
 * is on and hairline after it, Anton numerals (ink for done/current, `muted` — Anton at ≥ 24 px — for the
 * steps still ahead). Mobile reads it as a vertical timeline (rule on the left), md+ as a row (rule on
 * top). `aria-current="step"` names the reader's step for assistive tech; a done step shows a tick.
 */
export interface PathItem {
  n: number;
  title?: string;
  body?: string;
}

export interface StepRowProps {
  items: readonly PathItem[];
  /** The reader's step; earlier steps render as done. */
  current?: number;
  /** `full` = numeral, title and body; `compact` = numeral and title in a vertical list (the rail). */
  variant?: "full" | "compact";
  label?: string;
  className?: string;
}

export function StepRow({ items, current, variant = "full", label, className = "" }: StepRowProps) {
  const state = (n: number): "done" | "current" | "ahead" | "none" =>
    current === undefined ? "none" : n < current ? "done" : n === current ? "current" : "ahead";

  if (variant === "compact") {
    return (
      <ol aria-label={label} className={`flex flex-col ${className}`.trim()}>
        {items.map((item) => {
          const s = state(item.n);
          const lit = s !== "ahead";
          return (
            <li
              key={item.n}
              aria-current={s === "current" ? "step" : undefined}
              className={`flex items-baseline gap-3 border-l-2 py-1.5 pl-3 ${lit ? "border-ink" : "border-hairline"}`}
            >
              <span aria-hidden="true" className={`w-4 shrink-0 font-display text-[1.125rem] leading-none tabular-nums ${lit ? "text-ink" : "text-muted"}`}>
                {s === "done" ? <CheckIcon size={16} className="text-ink" /> : item.n}
              </span>
              <span className={`font-body text-small ${s === "current" ? "font-bold text-ink" : "font-medium text-ink"}`}>
                <span className="sr-only">{item.n}. </span>
                {item.title ?? item.body}
              </span>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol aria-label={label} className={`flex flex-col gap-5 md:grid md:grid-cols-4 md:gap-6 lg:gap-8 ${className}`.trim()}>
      {items.map((item) => {
        const s = state(item.n);
        const lit = s === "done" || s === "current" || s === "none";
        return (
          <li
            key={item.n}
            aria-current={s === "current" ? "step" : undefined}
            className={`grid grid-cols-[2.5rem_1fr] gap-x-4 border-l-2 pl-4 md:block md:border-l-0 md:border-t-2 md:pl-0 md:pt-4 ${
              lit ? "border-ink" : "border-hairline"
            }`}
          >
            <span aria-hidden="true" className={`font-display text-[2.25rem] leading-none tabular-nums md:text-[2.75rem] ${lit ? "text-ink" : "text-muted"}`}>
              {s === "done" ? <CheckIcon size={32} className="mt-1 text-ink" /> : item.n}
            </span>
            <div className="md:mt-3">
              <span className="sr-only">{item.n}. </span>
              {item.title ? <p className="font-body text-[1.0625rem] font-bold leading-snug text-ink">{item.title}</p> : null}
              {item.body ? (
                <p className={`max-w-[40ch] font-body text-pretty ${item.title ? "mt-1 text-small text-muted-text" : "text-body text-ink"}`}>{item.body}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
