import { buttonClass } from "../../../../components/ButtonLink";
import { isNumberless, type Sport } from "../../../../lib/catalog/sports";

/**
 * The sport picker above the tier row (DESIGN §5.2 row B, COPY §2.2 (1)): a native `<select>` inside a
 * plain GET form, server-rendered and prefilled from `?sport=`. No JavaScript: submitting reloads the
 * page with the sport in the query, and every CTA on the page is then built from that sport's SKU. The
 * five numberless sports show the COPY note under the field — never a jersey number, anywhere.
 */
export const SPORT_PICKER_LABEL = "Their sport";
export const SPORT_PICKER_SUBMIT = "Show prices";
export const SPORT_QUERY_KEY = "sport";

/** COPY §2.2 (1): the line under the picker for a sport that never wears a number. */
export const numberlessPickerNote = (sport: Sport): string =>
  `No jersey number in ${sport.name.toLowerCase()} — the card carries their name and club crest instead.`;

const LABEL = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";

/**
 * The sport a page is built for: `?sport=<slug>` when it names one this family can build, the family's
 * default otherwise. An unknown or unsupported slug never 404s and never leaks into a SKU — the page
 * simply shows the default sport.
 */
export function pickSport(raw: string | string[] | undefined, options: Sport[], fallbackSlug: string): Sport {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const found = value ? options.find((sport) => sport.slug === value.toLowerCase()) : undefined;
  return found ?? options.find((sport) => sport.slug === fallbackSlug) ?? options[0];
}

export interface SportPickerProps {
  /** The page this form submits back to, e.g. "/trading-cards". */
  action: string;
  /** The sports this family can build today, in roster order. */
  options: Sport[];
  selected: Sport;
  className?: string;
}

export function SportPicker({ action, options, selected, className = "" }: SportPickerProps) {
  return (
    <div className={className || undefined}>
      <form method="get" action={action} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="sport" className={LABEL}>
            {SPORT_PICKER_LABEL}
          </label>
          <select
            id="sport"
            name={SPORT_QUERY_KEY}
            defaultValue={selected.slug}
            className="h-12 w-full min-w-[14rem] rounded-ui border border-ink/40 bg-stock px-4 font-body font-medium text-ink transition-[border-color] duration-hover ease-out focus:border-ink"
          >
            {options.map((sport) => (
              <option key={sport.slug} value={sport.slug}>
                {sport.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={buttonClass("outline", "md")}>
          {SPORT_PICKER_SUBMIT}
        </button>
      </form>
      {isNumberless(selected) ? <p className="mt-3 max-w-[62ch] font-body text-small text-muted-text">{numberlessPickerNote(selected)}</p> : null}
    </div>
  );
}
