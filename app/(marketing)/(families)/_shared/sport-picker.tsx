import { buttonClass } from "../../../../components/ButtonLink";
import { hasOwnListing, isNumberless, sportsWithOwnListing, type Sport } from "../../../../lib/catalog/sports";
import { SportPickerAutoSubmit } from "./sport-picker-auto";

/**
 * The sport picker above the tier row (DESIGN §5.2 row B, COPY §2.2 (1)).
 *
 * What it does and does not do. Every sport costs the same, so this control has never changed a
 * price — its only job is to send the buyer to the right Etsy listing. It used to be labelled
 * "Show prices", offer all seventeen sports, and quietly route eleven of them to the all-sports
 * Complete Set listing: from the trading-card page that is a different product, and nothing on
 * screen changed when you picked, so the control looked broken.
 *
 * So: the list is split. Sports with their own listing are offered first and route there. The rest
 * are grouped under a heading that says what will happen, and the line under the field names the
 * destination before the buyer clicks.
 *
 * Changing the field used to submit the form, which reloaded the document and threw the reader back
 * to the top of the page — measured scroll 837 → 0 for a change that rewrites one paragraph and one
 * href (smooth audit, 2026-09-08). The island now replaces the URL through the router with
 * `scroll: false`, so the server re-renders the two things that differ and the page stays where the
 * reader left it. The no-JavaScript path is the same GET form it always was; its submit button lives
 * inside a `<noscript>` so it is never on screen for anyone who does not need it — it used to be
 * server-rendered visible and hidden only after hydration, which popped it out of the row on a slow
 * connection.
 */
export const SPORT_PICKER_LABEL = "Their sport";
export const SPORT_PICKER_SUBMIT = "Show this sport";
export const SPORT_QUERY_KEY = "sport";
/** The picker's own anchor: where the no-JavaScript submit lands, instead of the top of the page. */
export const SPORT_PICKER_ID = "sport-picker";
export const OWN_LISTING_GROUP = "Has its own listing";
export const ANY_LISTING_GROUP = "Ordered through the Complete Set listing";

/** COPY §2.2 (1): the line under the picker for a sport that never wears a number. */
export const numberlessPickerNote = (sport: Sport): string =>
  `No jersey number in ${sport.name.toLowerCase()} — the card carries their name and club crest instead.`;

/** Where the order button will go, said plainly before the buyer clicks it. */
export function destinationNote(sport: Sport, family: "cards" | "posters"): string {
  const noun = family === "cards" ? "trading card" : "poster";
  return hasOwnListing(sport, family)
    ? `The order button opens the ${sport.name.toLowerCase()} ${noun} listing on Etsy.`
    : `${sport.name} is built to order like every other sport, but it has no ${noun} listing of its own yet. The order button opens our Complete Set listing, which is sold for any sport — tell us ${sport.name.toLowerCase()} with your photos.`;
}

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
  /** Which family's listings decide the grouping and the destination line. */
  family: "cards" | "posters";
  selected: Sport;
  className?: string;
}

export function SportPicker({ action, options, family, selected, className = "" }: SportPickerProps) {
  const own = sportsWithOwnListing(family).filter((s) => options.some((o) => o.slug === s.slug));
  const rest = options.filter((s) => !own.some((o) => o.slug === s.slug));
  return (
    <div id={SPORT_PICKER_ID} className={`scroll-mt-24 ${className}`.trim()}>
      <form method="get" action={`${action}#${SPORT_PICKER_ID}`} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="sport" className={LABEL}>
            {SPORT_PICKER_LABEL}
          </label>
          <SportPickerAutoSubmit action={action}>
            <select
              id="sport"
              name={SPORT_QUERY_KEY}
              defaultValue={selected.slug}
              className="h-12 w-full min-w-[14rem] rounded-ui border border-ink/40 bg-stock px-4 font-body font-medium text-ink transition-[border-color] duration-hover ease-out focus:border-ink"
            >
              <optgroup label={OWN_LISTING_GROUP}>
                {own.map((sport) => (
                  <option key={sport.slug} value={sport.slug}>
                    {sport.name}
                  </option>
                ))}
              </optgroup>
              {rest.length ? (
                <optgroup label={ANY_LISTING_GROUP}>
                  {rest.map((sport) => (
                    <option key={sport.slug} value={sport.slug}>
                      {sport.name}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </SportPickerAutoSubmit>
        </div>
        {/*
          The no-JavaScript path, and only that. `dangerouslySetInnerHTML` because React must not
          reconcile children inside a `<noscript>`: with scripting on, the browser never parses that
          markup into elements, so hydrating real children there is a mismatch waiting to happen. The
          string is built here from the same button recipe and the same constant — no input reaches it.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<button type="submit" class="${buttonClass("outline", "md")}">${SPORT_PICKER_SUBMIT}</button>`,
          }}
        />
      </form>
      <p className="mt-3 max-w-[62ch] font-body text-small text-muted-text">{destinationNote(selected, family)}</p>
      {isNumberless(selected) ? <p className="mt-2 max-w-[62ch] font-body text-small text-muted-text">{numberlessPickerNote(selected)}</p> : null}
    </div>
  );
}
