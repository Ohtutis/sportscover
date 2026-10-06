"use client";

import { useState } from "react";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { SPORT_OTHER, SPORT_OTHER_MAX } from "../../lib/intake/types";
import { CheckIcon, ChevronDownIcon } from "../icons";
import { Field, FieldError, INPUT, INPUT_PROSE, border, describe } from "./fields";
import { FIELD_PREFIX, errorId, fieldId } from "./model";
import { noExampleLine } from "./visuals";

/** One sport as the server page hands it over: the catalog slug and name, and whether it is one of the nine with their own pages. */
export interface SportChoiceData {
  slug: string;
  name: string;
  /** One of the sports with their own /sports page — shown first; the rest wait behind "More sports". */
  featured: boolean;
}

export interface SportPickerProps {
  sports: SportChoiceData[];
  /** The chosen slug, SPORT_OTHER, or "". */
  value: string;
  /** The typed activity for "Other sport or activity". */
  other: string;
  onChange: (slug: string) => void;
  onOther: (text: string) => void;
  /** Slugs that have example art — a chosen sport outside it gets the built-to-order note. */
  withArt: ReadonlySet<string>;
  labelledBy: string;
  errors: Record<string, string | undefined>;
}

export const sportId = (slug: string): string => `${FIELD_PREFIX}sport-${slug}`;
export const MORE_SPORTS_ID = "fp-sport-more";

const GRID = "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3";
/** A chip: the whole tile is the radio's label, 56 px tall; chosen = ink fill, white type, a tick. The radio itself is visually hidden but focusable — the chip draws its focus ring. */
const chip = (chosen: boolean, invalid: boolean): string =>
  `relative flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-ui border-[1.5px] px-3 py-2 text-center font-display text-[1.0625rem] uppercase leading-tight tracking-[0.02em] transition-[background-color,border-color,color] duration-hover ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-accent ${
    chosen ? "border-ink bg-ink text-white" : invalid ? "border-fail bg-white text-ink hover:border-ink" : "border-ink/25 bg-white text-ink hover:border-ink"
  }`;

/**
 * Step 1 — THEIR SPORT (owner review 2026-10-06, evening: "mixing sports is not cool … a sport picker at
 * the top, and the whole page re-renders for that sport"). Real radios dressed as large chips: the nine
 * sports with their own pages first, in roster order; the other eight behind "More sports" (a disclosure
 * that opens by itself when the chosen sport is one of them); and "Other sport or activity" last, with a
 * short required field for what it is. The sport is asked ONCE: the athlete step reads it from here.
 *
 * Anything without an example can still be made, and it is said at the choice: a sport with no example
 * art gets one plain line under the chips, "Other" carries the same promise beside its field. Never a
 * word that the sport is unavailable.
 */
export function SportPicker({ sports, value, other, onChange, onOther, withArt, labelledBy, errors }: SportPickerProps) {
  const featured = sports.filter((s) => s.featured);
  const more = sports.filter((s) => !s.featured);
  const chosenInMore = more.some((s) => s.slug === value);
  const [moreOpen, setMoreOpen] = useState(false);
  // A prefilled (or later chosen) sport behind "More sports" opens the group, so the choice is never hidden.
  // Adjusted while rendering (React's pattern for state derived from a prop), once per newly chosen sport,
  // so the parent can still close the group afterwards.
  const [openedFor, setOpenedFor] = useState("");
  if (chosenInMore && openedFor !== value) {
    setOpenedFor(value);
    setMoreOpen(true);
  }
  const open = moreOpen || (chosenInMore && openedFor !== value);

  const error = errors["athlete.sportSlug"];
  const otherError = errors["athlete.sportOther"];
  const isOther = value === SPORT_OTHER;
  const otherId = fieldId("athlete.sportOther");
  const chosen = sports.find((s) => s.slug === value);
  const note = chosen && !withArt.has(chosen.slug) ? noExampleLine(chosen.name) : "";

  const radio = (slug: string, name: string, first: boolean) => {
    const id = sportId(slug);
    const checked = value === slug;
    return (
      <label htmlFor={id} className={chip(checked, Boolean(error))}>
        <input
          id={id}
          type="radio"
          name={`${FIELD_PREFIX}sport`}
          value={slug}
          checked={checked}
          onChange={() => onChange(slug)}
          aria-describedby={error ? errorId("athlete.sportSlug") : undefined}
          data-fp-invalid={error && first ? "" : undefined}
          className="sr-only"
        />
        {checked ? <CheckIcon size={18} strokeWidth={2.25} className="shrink-0" /> : null}
        <span>{name}</span>
      </label>
    );
  };

  return (
    <div>
      <FieldError id={errorId("athlete.sportSlug")} message={error} className="mb-5" />
      <fieldset aria-labelledby={labelledBy} className="min-w-0">
        <ul className={GRID}>
          {featured.map((s, i) => (
            <li key={s.slug} className="min-w-0">
              {radio(s.slug, s.name, i === 0)}
            </li>
          ))}
        </ul>
        <ul id={MORE_SPORTS_ID} hidden={!open} className={`mt-2 sm:mt-3 ${GRID}`}>
          {more.map((s) => (
            <li key={s.slug} className="min-w-0">
              {radio(s.slug, s.name, false)}
            </li>
          ))}
        </ul>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={MORE_SPORTS_ID}
          onClick={() => setMoreOpen(!open)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-ui px-1 font-body text-[0.9375rem] font-bold text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          {INTAKE_COPY.sportStep.more}
          <ChevronDownIcon size={18} className={`transition-transform duration-hover ${open ? "rotate-180" : ""}`} />
        </button>
        <div className="mt-3">{radio(SPORT_OTHER, INTAKE_COPY.sportStep.other, false)}</div>
        <div hidden={!isOther} data-sport-other="" className="mt-5 max-w-[28rem]">
          <Field id={otherId} label={INTAKE_COPY.sportStep.otherField} tag="required" help={INTAKE_COPY.sportStep.otherPromise} error={otherError}>
            <input
              id={otherId}
              type="text"
              autoComplete="off"
              maxLength={SPORT_OTHER_MAX}
              required={isOther}
              placeholder={INTAKE_COPY.sportStep.otherPlaceholder}
              value={other}
              onChange={(e) => onOther(e.target.value)}
              {...describe(otherId, { help: true, error: otherError })}
              data-fp-invalid={otherError ? "" : undefined}
              className={`${INPUT} ${INPUT_PROSE} ${border(Boolean(otherError))}`}
            />
          </Field>
        </div>
      </fieldset>
      <div aria-live="polite">
        {note ? (
          <p data-sport-note="" className="mt-5 max-w-[60ch] font-body text-small font-medium text-pretty text-ink">
            {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
