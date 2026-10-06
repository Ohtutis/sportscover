/**
 * One sentence = one checkbox (CONTRACTS §3). Built for the F2 checkout and the marketing-use consent;
 * /free-proof is its first form. A visible label bound with htmlFor.
 *
 * The label is the tap target: `-my-3 py-3` grows it to 44 px for a one-line sentence (DESIGN §2.6)
 * without moving the row — the Breadcrumbs trick. Rows that stack need a gap of at least 24 px so the
 * grown targets never overlap. `describedBy` / `invalid` (2026-10-04) let a form name the error sentence
 * it prints under the row and mark the box invalid after a send attempt.
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
}

export function ConsentRow({ id, name, label, required, defaultChecked, describedBy, invalid, className = "" }: ConsentRowProps) {
  return (
    <div className={`flex min-h-6 items-start gap-3 ${className}`.trim()}>
      <input
        id={id}
        name={name}
        type="checkbox"
        required={required}
        defaultChecked={defaultChecked}
        aria-describedby={describedBy || undefined}
        aria-invalid={invalid ? true : undefined}
        className="mt-0.5 size-5 shrink-0 rounded-[4px] border border-ink/40 accent-accent"
      />
      <label htmlFor={id} className="-my-3 py-3 font-body text-small text-ink">
        {label}
      </label>
    </div>
  );
}
