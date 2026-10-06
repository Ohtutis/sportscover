import type { ReactNode } from "react";

/**
 * One sentence = one checkbox (CONTRACTS §3). Built for the F2 checkout and the marketing-use consent;
 * /free-proof is its first form. A visible label bound with htmlFor.
 *
 * The label is the tap target: `-my-3 py-3` grows it to 44 px for a one-line sentence (DESIGN §2.6)
 * without moving the row — the Breadcrumbs trick. Rows that stack need a gap of at least 24 px so the
 * grown targets never overlap. `describedBy` / `invalid` (2026-10-04) let a form name the error sentence
 * it prints under the row and mark the box invalid after a send attempt.
 *
 * `title` (owner review 2026-10-06: permissions must not read like a contract) puts a short line in plain
 * words above the sentence, and `note` one plain line between them. The SENTENCE stays the `<label>`, so
 * the box's accessible name is exactly the consent sentence — never the title. The label's `::after` is
 * stretched over the whole row (the row is `relative`, the box sits above it), so a tap on the title,
 * the note or the sentence ticks the box: the row is the target, well past 44 px. `tone="quiet"` sets the
 * title in medium weight, for an optional row under required ones. Without `title` the row renders as
 * it always has.
 */
export interface ConsentRowProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  defaultChecked?: boolean;
  /** Id(s) of the element(s) that describe the box — e.g. the error sentence under the row. */
  describedBy?: string;
  /** Marks the box `aria-invalid` (after a send attempt with the box unticked). */
  invalid?: boolean;
  className?: string;
  /** A short plain-language line above the sentence; the sentence stays the label. */
  title?: ReactNode;
  /** One plain line between the title and the sentence (only with `title`). */
  note?: ReactNode;
  /** `quiet`: the title in medium weight instead of bold (only with `title`). */
  tone?: "default" | "quiet";
}

export function ConsentRow({
  id,
  name,
  label,
  required,
  defaultChecked,
  describedBy,
  invalid,
  className = "",
  title,
  note,
  tone = "default",
}: ConsentRowProps) {
  const box = (position: string) => (
    <input
      id={id}
      name={name}
      type="checkbox"
      required={required}
      defaultChecked={defaultChecked}
      aria-describedby={describedBy || undefined}
      aria-invalid={invalid ? true : undefined}
      className={`${position} size-5 shrink-0 rounded-[4px] border border-ink/40 accent-accent`}
    />
  );

  if (!title) {
    return (
      <div className={`flex min-h-6 items-start gap-3 ${className}`.trim()}>
        {box("mt-0.5")}
        <label htmlFor={id} className="-my-3 py-3 font-body text-small text-ink">
          {label}
        </label>
      </div>
    );
  }

  // The box's top sits 3 px down so it centres on the title's first line (17 px × 1.55 = 26 px line box).
  return (
    <div className={`relative flex items-start gap-3 ${className}`.trim()}>
      {box("relative z-[1] mt-[3px]")}
      <div className="min-w-0 flex-1">
        <p className={`font-body text-body text-ink ${tone === "quiet" ? "font-medium" : "font-bold"}`}>{title}</p>
        {note ? <p className="mt-1 font-body text-small text-ink">{note}</p> : null}
        <label htmlFor={id} className="mt-1 block cursor-pointer font-body text-small text-muted-text after:absolute after:inset-0 after:content-['']">
          {label}
        </label>
      </div>
    </div>
  );
}
