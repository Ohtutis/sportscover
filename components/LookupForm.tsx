import { LOOKUP_STRINGS } from "../lib/copy/canon";
import { buttonClass } from "./ButtonLink";
import { PRIMARY_BUTTON_CLASS } from "./CtaPair";
import { StatusChip } from "./StatusChip";

/**
 * The registry lookup (DESIGN §4.21, GAPS #27): a plain POST to /registry/lookup that works without
 * JS. The route answers 303 to /c/<id>, or 303 back with `?miss=1`; the page passes that value as
 * `miss` and the COPY miss string renders inline in a status line with a FAIL chip ("private" and
 * "rate" render the note strings). `inline` is the compact home-page variant.
 */
export const LOOKUP_LABEL = "Card ID";
export const LOOKUP_PLACEHOLDER = "GDE-SN-BKB-2026-12";
export const LOOKUP_PATTERN = "[A-Za-z0-9-]{8,24}";
export const LOOKUP_HELP_INLINE = "Printed on the back of every card and on the certificate";
export const LOOKUP_HELP_FULL = "Printed on the back of every card and on the certificate. Mind O versus 0 and I versus 1.";
export const LOOKUP_BUTTON = "Find this edition";

export interface LookupFormProps {
  inline?: boolean;
  /** The `miss` search param: truthy → the miss string; "private" / "rate" → the note strings. */
  miss?: string | boolean;
  /** Renders in place of the server-read `miss` line — used to keep a page static (LookupMiss). */
  missSlot?: React.ReactNode;
  id?: string;
  tone?: "stock" | "arena";
  className?: string;
}

/**
 * The status line for a lookup result. Split out of the form so a client island can render it from
 * the search param while the page around it stays static (see components/LookupMiss.tsx).
 */
export function LookupStatus({ miss, tone = "stock" }: { miss?: string | boolean; tone?: "stock" | "arena" }) {
  const arena = tone === "arena";
  const status = !miss
    ? null
    : miss === "private"
      ? { chip: "note" as const, text: LOOKUP_STRINGS.private }
      : miss === "rate"
        ? { chip: "note" as const, text: LOOKUP_STRINGS.rateLimited }
        : { chip: "fail" as const, text: LOOKUP_STRINGS.miss };
  if (!status) return null;
  return (
    <p role="status" className={`mt-3 flex flex-wrap items-center gap-2 font-body text-small ${arena ? "text-white" : "text-ink"}`}>
      <StatusChip status={status.chip} tone={tone} />
      <span>{status.text}</span>
    </p>
  );
}

export function LookupForm({ inline, miss, missSlot, id = "card-id", tone = "stock", className = "" }: LookupFormProps) {
  const arena = tone === "arena";
  const input = `w-full rounded-ui border px-4 font-label font-semibold uppercase tracking-[0.08em] placeholder:font-body placeholder:normal-case ${
    arena ? "border-white/40 bg-arena text-white placeholder:text-arena-muted focus:border-white" : "border-ink/40 bg-stock text-ink placeholder:text-muted-text focus:border-ink"
  } ${inline ? "h-14 text-[1rem]" : "h-16 text-[1.125rem]"}`;
  return (
    <form method="post" action="/registry/lookup" className={className || undefined}>
      <div className={inline ? "sm:flex sm:items-end sm:gap-3" : ""}>
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className={`block font-label text-label font-semibold uppercase tracking-[0.12em] ${arena ? "text-arena-muted" : "text-muted-text"}`}>
            {LOOKUP_LABEL}
          </label>
          <input
            id={id}
            name="id"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            required
            pattern={LOOKUP_PATTERN}
            placeholder={LOOKUP_PLACEHOLDER}
            aria-describedby={`${id}-help`}
            className={`mt-2 ${input}`}
          />
        </div>
        <button type="submit" className={buttonClass("bare", "md", `${PRIMARY_BUTTON_CLASS} mt-3 w-full sm:w-auto ${inline ? "sm:mt-0 sm:h-14" : ""}`)}>
          {LOOKUP_BUTTON}
        </button>
      </div>
      <p id={`${id}-help`} className={`mt-2 font-body text-small ${arena ? "text-arena-muted" : "text-muted-text"}`}>
        {inline ? LOOKUP_HELP_INLINE : LOOKUP_HELP_FULL}
      </p>
      {missSlot ?? <LookupStatus miss={miss} tone={tone} />}
    </form>
  );
}
