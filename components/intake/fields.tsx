import type { ReactNode } from "react";

/**
 * The form's field vocabulary (DESIGN §4.21): a Barlow label above, the control, the help line in
 * `small`, and — only after a send attempt — the error sentence from parseProofRequest. Every control
 * names its help and its error in `aria-describedby`; the error carries a fail dot AND words, so colour
 * is never the only signal (DESIGN §8).
 */

/** §4.21 verbatim; `normal-case` swaps in for email, phone, notes and headline (the parent types prose there). */
export const INPUT =
  "h-14 w-full rounded-ui border bg-stock px-4 font-label text-[1rem] font-semibold uppercase tracking-[0.08em] text-ink transition-[border-color] duration-hover ease-out placeholder:font-body placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-text focus:border-ink";
export const INPUT_PROSE = "normal-case tracking-[0.02em]";
export const TEXTAREA =
  "min-h-32 w-full rounded-ui border bg-stock px-4 py-3 font-body text-[1rem] text-ink transition-[border-color] duration-hover ease-out placeholder:text-muted-text focus:border-ink";
/** The native select of the sport picker (DESIGN §5.2 row B), at the input's 56 px so a row lines up. */
export const SELECT =
  "h-14 w-full rounded-ui border bg-stock px-4 font-body text-[1rem] font-medium text-ink transition-[border-color] duration-hover ease-out focus:border-ink";
export const LABEL = "block font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";
export const HELP = "mt-2 max-w-[62ch] font-body text-small text-muted-text";
/** Native checkbox / radio, the ConsentRow recipe: 20 px, the accent tick. */
export const CHECK = "size-5 shrink-0 rounded-[4px] border border-ink/40 accent-accent";
export const RADIO = "size-5 shrink-0 accent-accent";

export const border = (invalid: boolean): string => (invalid ? "border-fail" : "border-ink/40");

/** `aria-describedby` / `aria-invalid` for a control with an optional help line and error. */
export function describe(id: string, opts: { help?: boolean; error?: string }): { "aria-describedby"?: string; "aria-invalid"?: true } {
  const ids = [opts.help ? `${id}-help` : "", opts.error ? `${id}-error` : ""].filter(Boolean);
  return {
    ...(ids.length ? { "aria-describedby": ids.join(" ") } : {}),
    ...(opts.error ? { "aria-invalid": true as const } : {}),
  };
}

export function FieldError({ id, message, className = "" }: { id: string; message?: string; className?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={`mt-2 flex max-w-[62ch] items-start gap-2 font-body text-small font-medium text-ink ${className}`.trim()}>
      <span aria-hidden="true" className="mt-[0.4em] size-2 shrink-0 rounded-full bg-fail" />
      <span>{message}</span>
    </p>
  );
}

export interface FieldProps {
  id: string;
  label: ReactNode;
  help?: ReactNode;
  error?: string;
  className?: string;
  /** The control, already carrying `id={id}` and `describe(id, …)`. */
  children: ReactNode;
  hidden?: boolean;
}

export function Field({ id, label, help, error, className = "", children, hidden }: FieldProps) {
  return (
    <div className={className || undefined} hidden={hidden}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {help ? (
        <p id={`${id}-help`} className={HELP}>
          {help}
        </p>
      ) : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
