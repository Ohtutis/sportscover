"use client";

import { useEffect } from "react";
import { CANON } from "../../lib/copy/canon";
import { isNumberless, sportBySlug } from "../../lib/catalog/sports";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { CLASS_YEARS, MAX_STATS, SEASON_YEARS } from "../../lib/intake/types";
import { FieldError, Field, HELP, INPUT, INPUT_PROSE, LABEL, SELECT, TEXTAREA, Tag, border, describe } from "./fields";
import { athleteStore, errorId, fieldId, type AthleteState } from "./model";
import { STAT_EXAMPLES, STAT_EXAMPLES_DEFAULT, UI } from "./strings";

export interface AthleteFieldsProps {
  athlete: AthleteState;
  onChange: (patch: Partial<AthleteState>) => void;
  onStat: (row: number, patch: Partial<{ value: string; label: string }>) => void;
  /** Senior Night was chosen in the look step: the class year (required) and the night's date join the grid. */
  seniorNight: boolean;
  todayIso: string;
  /** Whether "+ Add optional details" is open (the form opens it when one of its fields has an error). */
  detailsOpen: boolean;
  onDetailsOpen: (open: boolean) => void;
  errors: Record<string, string | undefined>;
  statErrors: Record<number, string>;
}

export const OPTIONAL_DETAILS_ID = "fp-athlete-optional";

/**
 * The athlete step (owner review 2026-10-04, point 8; v4 2026-10-06): a two-column grid of what goes on
 * the card — the name (first and last, side by side) | the jersey number · the team · and, with Senior
 * Night, the class year | the night's date. The sport is NOT asked here: it was chosen once, in step 1, and
 * this step reads it (the number field goes for a sport that never wears one). Everything else waits
 * behind "+ Add optional details", a real disclosure button (`aria-expanded`, the group behind `hidden`,
 * so nothing is reserved): the headline or quote first, then position, season, stats and notes. No team
 * colours (read off the kit photo) and no need-it-by date (owner, 2026-10-06); no school field — the site
 * never asks for one.
 *
 * Names carry the design limits as one hint (12 / 9 letters, docs/ORDER-FIELDS-SPEC.md) and are never
 * cut: the server accepts 40. The number disappears for the sports that never wear one (`isNumberless`).
 */
export function AthleteFields({
  athlete,
  onChange,
  onStat,
  seniorNight,
  todayIso,
  detailsOpen,
  onDetailsOpen,
  errors,
  statErrors,
}: AthleteFieldsProps) {
  const sport = sportBySlug(athlete.sportSlug);
  const numberless = sport ? isNumberless(sport) : false;
  const examples = (sport && STAT_EXAMPLES[sport.slug]) || STAT_EXAMPLES_DEFAULT;
  const id = (key: string) => fieldId(`athlete.${key}`);
  const err = (key: string) => errors[`athlete.${key}`];
  const invalid = (key: string) => (err(key) ? { "data-fp-invalid": "" } : {});
  const nameHelp = `${id("name")}-help`;

  // "Your order" draws the live text preview from what is typed here (owner, 2026-10-06): every change
  // is published to the shared store in model.ts, and cleared when the step leaves the page.
  useEffect(() => {
    athleteStore.set(athlete);
  }, [athlete]);
  useEffect(() => () => athleteStore.set(null), []);

  const nameInput = (key: "firstName" | "lastName", label: string, autoComplete: string) => (
    <div className="min-w-0">
      <label htmlFor={id(key)} className="sr-only">
        {label}
      </label>
      <input
        id={id(key)}
        type="text"
        autoComplete={autoComplete}
        maxLength={40}
        required
        placeholder={label}
        value={athlete[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
        aria-describedby={[nameHelp, err(key) ? errorId(`athlete.${key}`) : ""].filter(Boolean).join(" ")}
        aria-invalid={err(key) ? true : undefined}
        {...invalid(key)}
        className={`${INPUT} ${border(Boolean(err(key)))}`}
      />
    </div>
  );

  return (
    <div>
      <div className="grid gap-x-6 gap-y-7 md:grid-cols-2">
        <fieldset className="min-w-0">
          <legend className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={LABEL}>{UI.athlete.name}</span>
            <Tag kind="required" />
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {nameInput("firstName", UI.athlete.firstName, "off")}
            {nameInput("lastName", UI.athlete.lastName, "off")}
          </div>
          <p id={nameHelp} className={HELP}>
            {UI.athlete.nameHint}
          </p>
          <FieldError id={errorId("athlete.firstName")} message={err("firstName")} />
          <FieldError id={errorId("athlete.lastName")} message={err("lastName")} />
        </fieldset>

        <Field id={id("jerseyNumber")} label={UI.athlete.number} tag="optional" help={UI.athlete.numberHint} hidden={numberless}>
          <input
            id={id("jerseyNumber")}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            maxLength={3}
            value={athlete.jerseyNumber}
            onChange={(e) => onChange({ jerseyNumber: e.target.value.replace(/\D/g, "").slice(0, 3) })}
            {...describe(id("jerseyNumber"), { help: true })}
            className={`${INPUT} ${border(false)} md:max-w-[10rem]`}
          />
        </Field>

        <Field id={id("team")} label={UI.athlete.team} tag="optional">
          <input
            id={id("team")}
            type="text"
            autoComplete="off"
            maxLength={60}
            placeholder={UI.athlete.teamPlaceholder}
            value={athlete.team}
            onChange={(e) => onChange({ team: e.target.value })}
            className={`${INPUT} ${border(false)}`}
          />
        </Field>

        <Field id={id("classOf")} label={UI.style.classOf} tag="required" error={err("classOf")} hidden={!seniorNight}>
          <select
            id={id("classOf")}
            required={seniorNight}
            value={athlete.classOf}
            onChange={(e) => onChange({ classOf: e.target.value })}
            {...describe(id("classOf"), { error: err("classOf") })}
            data-fp-invalid={err("classOf") ? "" : undefined}
            className={`${SELECT} ${border(Boolean(err("classOf")))}`}
          >
            <option value="">{UI.style.classOfPlaceholder}</option>
            {CLASS_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
        <Field id={id("eventDate")} label={UI.style.eventDate} tag="optional" help={CANON.seniorDateLine} error={err("eventDate")} hidden={!seniorNight}>
          <input
            id={id("eventDate")}
            type="date"
            min={todayIso}
            value={athlete.eventDate}
            onChange={(e) => onChange({ eventDate: e.target.value })}
            {...describe(id("eventDate"), { help: true, error: err("eventDate") })}
            data-fp-invalid={err("eventDate") ? "" : undefined}
            className={`${INPUT} ${border(Boolean(err("eventDate")))}`}
          />
        </Field>
      </div>

      <button
        type="button"
        aria-expanded={detailsOpen}
        aria-controls={OPTIONAL_DETAILS_ID}
        onClick={() => onDetailsOpen(!detailsOpen)}
        className="mt-8 inline-flex min-h-11 items-center rounded-ui border-[1.5px] border-ink/25 px-4 py-2 font-body text-[0.9375rem] font-bold text-ink transition-[border-color,background-color] duration-hover ease-out hover:border-ink aria-expanded:border-ink aria-expanded:bg-ink/5"
      >
        {INTAKE_COPY.optionalToggle}
      </button>

      <div id={OPTIONAL_DETAILS_ID} hidden={!detailsOpen} className="mt-8 grid gap-x-6 gap-y-7 border-t border-hairline pt-8 md:grid-cols-2">
        {/* The headline or quote leads the optional details (owner, 2026-10-06): it is the line a parent most often has. */}
        <Field id={id("headline")} label={UI.athlete.headline} tag="optional" help={UI.athlete.headlineHint} className="md:col-span-2">
          <input
            id={id("headline")}
            type="text"
            autoComplete="off"
            maxLength={60}
            placeholder={UI.athlete.headlinePlaceholder}
            value={athlete.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
            {...describe(id("headline"), { help: true })}
            className={`${INPUT} ${INPUT_PROSE} ${border(false)}`}
          />
        </Field>

        <Field id={id("position")} label={UI.athlete.position} tag="optional">
          <input
            id={id("position")}
            type="text"
            autoComplete="off"
            maxLength={40}
            placeholder={UI.athlete.positionPlaceholder}
            value={athlete.position}
            onChange={(e) => onChange({ position: e.target.value })}
            className={`${INPUT} ${border(false)}`}
          />
        </Field>
        <Field id={id("season")} label={UI.athlete.season} tag="optional" error={err("season")}>
          <select
            id={id("season")}
            value={athlete.season}
            onChange={(e) => onChange({ season: e.target.value })}
            {...describe(id("season"), { error: err("season") })}
            {...invalid("season")}
            className={`${SELECT} ${border(Boolean(err("season")))} md:max-w-[12rem]`}
          >
            {SEASON_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>

        <fieldset className="min-w-0 md:col-span-2" aria-describedby={`${id("stats")}-help`}>
          <legend className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={LABEL}>{UI.athlete.stats}</span>
            <Tag kind="optional" />
          </legend>
          <p id={`${id("stats")}-help`} className={HELP}>
            {UI.athlete.statsHint}
          </p>
          <ol className="mt-3 grid gap-4 md:grid-cols-3">
            {Array.from({ length: MAX_STATS }, (_, row) => {
              const vId = id(`stats-${row}-value`);
              const lId = id(`stats-${row}-label`);
              const message = statErrors[row];
              const stat = athlete.stats[row];
              const [exValue, exLabel] = examples[row] ?? STAT_EXAMPLES_DEFAULT[row];
              const errId = `${id(`stats-${row}`)}-error`;
              return (
                <li key={row}>
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
                    <div>
                      <label htmlFor={vId} className="sr-only">
                        {UI.athlete.statValue(row + 1)}
                      </label>
                      <input
                        id={vId}
                        type="text"
                        autoComplete="off"
                        maxLength={12}
                        placeholder={exValue}
                        value={stat.value}
                        onChange={(e) => onStat(row, { value: e.target.value })}
                        aria-describedby={message ? errId : undefined}
                        aria-invalid={message ? true : undefined}
                        data-fp-invalid={message ? "" : undefined}
                        className={`${INPUT} ${border(Boolean(message))}`}
                      />
                    </div>
                    <div>
                      <label htmlFor={lId} className="sr-only">
                        {UI.athlete.statLabel(row + 1)}
                      </label>
                      <input
                        id={lId}
                        type="text"
                        autoComplete="off"
                        maxLength={16}
                        placeholder={exLabel}
                        value={stat.label}
                        onChange={(e) => onStat(row, { label: e.target.value })}
                        aria-describedby={message ? errId : undefined}
                        aria-invalid={message ? true : undefined}
                        className={`${INPUT} ${border(Boolean(message))}`}
                      />
                    </div>
                  </div>
                  <FieldError id={errId} message={message} />
                </li>
              );
            })}
          </ol>
        </fieldset>

        <Field id={id("notes")} label={UI.athlete.notes} tag="optional" className="md:col-span-2">
          <textarea
            id={id("notes")}
            rows={4}
            maxLength={1000}
            placeholder={UI.athlete.notesPlaceholder}
            value={athlete.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            className={`${TEXTAREA} ${border(false)}`}
          />
        </Field>
      </div>
    </div>
  );
}
