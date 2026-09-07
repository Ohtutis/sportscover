/**
 * One sentence = one checkbox (CONTRACTS §3). F1 has no forms — built for the F2 checkout and the
 * marketing-use consent. A visible label bound with htmlFor; no aria-describedby chains.
 */
export interface ConsentRowProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  defaultChecked?: boolean;
  className?: string;
}

export function ConsentRow({ id, name, label, required, defaultChecked, className = "" }: ConsentRowProps) {
  return (
    <div className={`flex min-h-6 items-start gap-3 ${className}`.trim()}>
      <input
        id={id}
        name={name}
        type="checkbox"
        required={required}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-5 shrink-0 rounded-[4px] border border-ink/40 accent-accent"
      />
      <label htmlFor={id} className="font-body text-small text-ink">
        {label}
      </label>
    </div>
  );
}
