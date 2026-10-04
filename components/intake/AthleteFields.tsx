import { isNumberless, sportBySlug } from "../../lib/catalog/sports";
import { INTAKE_SPORTS, MAX_STATS, SEASON_YEARS } from "../../lib/intake/types";
import { FieldError, Field, HELP, INPUT, INPUT_PROSE, LABEL, SELECT, TEXTAREA, border, describe } from "./fields";
import { errorId, fieldId, type AthleteState } from "./model";
import { STAT_EXAMPLES, STAT_EXAMPLES_DEFAULT, UI } from "./strings";

export interface AthleteFieldsProps {
  athlete: AthleteState;
  onChange: (patch: Partial<AthleteState>) => void;
  onStat: (row: number, patch: Partial<{ value: string; label: string }>) => void;
  errors: Record<string, string | undefined>;
  statErrors: Record<number, string>;
}

/** The swatch a native colour input shows while the parent has not picked one. */
const UNSET_SWATCH = "#f4f3ef";

/**
 * Section 03 — only what goes on the card. Names carry the design limits as hints (12 / 9 letters,
 * docs/ORDER-FIELDS-SPEC.md) and are never cut: the server accepts 40. The number field disappears for
 * the sports that never wear one (`isNumberless`); team colours are optional — a native colour input
 * has no empty state, so a colour counts only once the parent has picked it, and "Clear" undoes that.
 */
export function AthleteFields({ athlete, onChange, onStat, errors, statErrors }: AthleteFieldsProps) {
  const sport = sportBySlug(athlete.sportSlug);
  const numberless = sport ? isNumberless(sport) : false;
  const examples = (sport && STAT_EXAMPLES[sport.slug]) || STAT_EXAMPLES_DEFAULT;
  const id = (key: string) => fieldId(`athlete.${key}`);
  const err = (key: string) => errors[`athlete.${key}`];
  const invalid = (key: string) => (err(key) ? { "data-fp-invalid": "" } : {});

  return (
    <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
      <Field id={id("firstName")} label={UI.athlete.firstName} help={UI.athlete.firstNameHint} error={err("firstName")}>
        <input
          id={id("firstName")}
          type="text"
          autoComplete="off"
          maxLength={40}
          value={athlete.firstName}
          onChange={(e) => onChange({ firstName: e.target.value })}
          {...describe(id("firstName"), { help: true, error: err("firstName") })}
          {...invalid("firstName")}
          className={`${INPUT} ${border(Boolean(err("firstName")))}`}
        />
      </Field>
      <Field id={id("lastName")} label={UI.athlete.lastName} help={UI.athlete.lastNameHint} error={err("lastName")}>
        <input
          id={id("lastName")}
          type="text"
          autoComplete="off"
          maxLength={40}
          value={athlete.lastName}
          onChange={(e) => onChange({ lastName: e.target.value })}
          {...describe(id("lastName"), { help: true, error: err("lastName") })}
          {...invalid("lastName")}
          className={`${INPUT} ${border(Boolean(err("lastName")))}`}
        />
      </Field>

      <Field id={id("sportSlug")} label={UI.athlete.sport} error={err("sportSlug")}>
        <select
          id={id("sportSlug")}
          value={athlete.sportSlug}
          onChange={(e) => onChange({ sportSlug: e.target.value })}
          {...describe(id("sportSlug"), { error: err("sportSlug") })}
          {...invalid("sportSlug")}
          className={`${SELECT} ${border(Boolean(err("sportSlug")))}`}
        >
          <option value="">{UI.athlete.sportPlaceholder}</option>
          {INTAKE_SPORTS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field id={id("jerseyNumber")} label={UI.athlete.number} help={UI.athlete.numberHint} hidden={numberless}>
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
          className={`${INPUT} ${border(false)} sm:max-w-[10rem]`}
        />
      </Field>

      <Field id={id("position")} label={UI.athlete.position}>
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
      <Field id={id("team")} label={UI.athlete.team}>
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

      <Field id={id("season")} label={UI.athlete.season} error={err("season")}>
        <select
          id={id("season")}
          value={athlete.season}
          onChange={(e) => onChange({ season: e.target.value })}
          {...describe(id("season"), { error: err("season") })}
          {...invalid("season")}
          className={`${SELECT} ${border(Boolean(err("season")))} sm:max-w-[12rem]`}
        >
          {SEASON_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="min-w-0" aria-describedby={`${id("colors")}-help`}>
        <legend className={LABEL}>{UI.athlete.colors}</legend>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
          {(["primary", "secondary"] as const).map((which) => {
            const cid = id(`colors.${which}`);
            const value = athlete.colors[which];
            return (
              <div key={which} className="flex items-center gap-3">
                <input
                  id={cid}
                  type="color"
                  value={value || UNSET_SWATCH}
                  onChange={(e) => onChange({ colors: { ...athlete.colors, [which]: e.target.value } })}
                  {...describe(cid, { error: err(`colors.${which}`) })}
                  {...invalid(`colors.${which}`)}
                  className={`h-12 w-14 shrink-0 cursor-pointer rounded-ui border bg-stock p-1 ${border(Boolean(err(`colors.${which}`)))}`}
                />
                <label htmlFor={cid} className="font-body text-small text-ink">
                  <span className="block font-medium">{which === "primary" ? UI.athlete.primary : UI.athlete.secondary}</span>
                  <span className="block font-label text-[0.8125rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-muted-text">
                    {value || UI.athlete.colorUnset}
                  </span>
                </label>
              </div>
            );
          })}
          <button
            type="button"
            hidden={!athlete.colors.primary && !athlete.colors.secondary}
            onClick={() => onChange({ colors: { primary: "", secondary: "" } })}
            className="min-h-11 font-body text-small text-ink underline decoration-1 underline-offset-4"
          >
            {UI.athlete.colorsClear}
          </button>
        </div>
        <p id={`${id("colors")}-help`} className={HELP}>
          {UI.athlete.colorsHint}
        </p>
        <FieldError id={errorId("athlete.colors.primary")} message={err("colors.primary")} />
        <FieldError id={errorId("athlete.colors.secondary")} message={err("colors.secondary")} />
      </fieldset>

      <Field id={id("headline")} label={UI.athlete.headline} help={UI.athlete.headlineHint} className="sm:col-span-2">
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

      <fieldset className="min-w-0 sm:col-span-2" aria-describedby={`${id("stats")}-help`}>
        <legend className={LABEL}>{UI.athlete.stats}</legend>
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

      <Field id={id("notes")} label={UI.athlete.notes} className="sm:col-span-2">
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
  );
}
