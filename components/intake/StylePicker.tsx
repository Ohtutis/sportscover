import { CANON } from "../../lib/copy/canon";
import type { ImageSpec } from "../../lib/assets";
import type { StyleCode } from "../../lib/catalog/styles";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { CLASS_YEARS, STYLE_RECOMMEND, type StyleChoice } from "../../lib/intake/types";
import { CardFace } from "../CardFace";
import { FictionalLabel } from "../FictionalLabel";
import { FieldError, Field, INPUT, RADIO, SELECT, border, describe } from "./fields";
import { FIELD_PREFIX, errorId, fieldId } from "./model";
import { UI } from "./strings";

export interface StyleTileData {
  code: StyleCode;
  name: string;
  material: string;
  image: ImageSpec;
}

export interface StylePickerProps {
  styles: StyleTileData[];
  value: StyleChoice | "";
  onChange: (value: StyleChoice) => void;
  classOf: string;
  eventDate: string;
  onClassOf: (v: string) => void;
  onEventDate: (v: string) => void;
  todayIso: string;
  labelledBy: string;
  errors: { style?: string; classOf?: string; eventDate?: string };
}

const styleId = (code: string) => `${FIELD_PREFIX}style-${code}`;

/**
 * Section 02: seven finish tiles — the same fictional athlete in every finish, through CardFace (5 : 7,
 * square, uncropped), one C13 label for the group — and an eighth "recommend one for me" tile. Real
 * radios: arrow keys move through the group, the tile's visible border follows the checked radio, and
 * the radio's name is the finish name alone (the card's long alt text stays on the image).
 * Choosing Senior Night reveals the class year (required for SR) and the night's date.
 */
export function StylePicker({ styles, value, onChange, classOf, eventDate, onClassOf, onEventDate, todayIso, labelledBy, errors }: StylePickerProps) {
  const tiles: { code: StyleChoice; name: string; detail: string; image: ImageSpec | null }[] = [
    ...styles.map((s) => ({ code: s.code as StyleChoice, name: s.name, detail: s.material, image: s.image })),
    { code: STYLE_RECOMMEND, name: INTAKE_COPY.styleRecommendLabel, detail: INTAKE_COPY.styleRecommendDetail, image: null },
  ];
  const selected = tiles.find((t) => t.code === value);
  const classId = fieldId("athlete.classOf");
  const dateId = fieldId("athlete.eventDate");
  return (
    <div>
      <FieldError id={errorId("style")} message={errors.style} className="mb-4" />
      <div role="radiogroup" aria-labelledby={labelledBy} aria-describedby={errors.style ? errorId("style") : undefined}>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
          {tiles.map((tile, i) => {
            const id = styleId(tile.code);
            const checked = value === tile.code;
            return (
              <li key={tile.code} className="min-w-0">
                <label
                  htmlFor={id}
                  className={`flex h-full cursor-pointer flex-col rounded-ui border p-1.5 transition-[border-color,box-shadow] duration-hover ease-out sm:p-2.5 ${
                    checked ? "border-ink shadow-[0_0_0_1px_var(--color-ink)]" : errors.style ? "border-fail" : "border-transparent hover:border-ink/30"
                  }`}
                >
                  {tile.image ? (
                    <CardFace {...tile.image} labelled sizes="(min-width: 1024px) 150px, (min-width: 640px) 22vw, 30vw" />
                  ) : (
                    <span aria-hidden="true" className="flex aspect-[5/7] w-full items-center justify-center rounded-none border border-dashed border-ink/40">
                      <span className="font-display text-[2.5rem] leading-none text-muted sm:text-[3.5rem]">{UI.style.recommendGlyph}</span>
                    </span>
                  )}
                  <span className="mt-2.5 flex items-start gap-2">
                    <input
                      id={id}
                      type="radio"
                      name={`${FIELD_PREFIX}style`}
                      value={tile.code}
                      checked={checked}
                      onChange={() => onChange(tile.code)}
                      aria-labelledby={`${id}-name`}
                      aria-describedby={`${id}-detail`}
                      data-fp-invalid={errors.style && i === 0 ? "" : undefined}
                      className={`mt-px ${RADIO}`}
                    />
                    <span id={`${id}-name`} className="min-w-0 font-body text-[0.8125rem] font-bold leading-tight text-ink sm:text-[0.9375rem]">
                      {tile.name}
                    </span>
                  </span>
                  <span id={`${id}-detail`} className="mt-1.5 hidden font-body text-small text-muted-text sm:block">
                    {tile.detail}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
      {/* Below 640 px the tiles are too narrow for the material line: the chosen one is spelled out here. */}
      <p className="mt-3 font-body text-small text-ink sm:hidden" hidden={!selected}>
        {selected ? (
          <>
            <span className="font-bold">{selected.name}</span> — {selected.detail}
          </>
        ) : null}
      </p>
      <FictionalLabel className="mt-4" />

      <div hidden={value !== "SR"} className="mt-8 grid gap-6 sm:grid-cols-2">
        <Field id={classId} label={UI.style.classOf} error={errors.classOf}>
          <select
            id={classId}
            value={classOf}
            onChange={(e) => onClassOf(e.target.value)}
            {...describe(classId, { error: errors.classOf })}
            data-fp-invalid={errors.classOf ? "" : undefined}
            className={`${SELECT} ${border(Boolean(errors.classOf))}`}
          >
            <option value="">{UI.style.classOfPlaceholder}</option>
            {CLASS_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
        <Field id={dateId} label={UI.style.eventDate} help={CANON.seniorDateLine} error={errors.eventDate}>
          <input
            id={dateId}
            type="date"
            min={todayIso}
            value={eventDate}
            onChange={(e) => onEventDate(e.target.value)}
            {...describe(dateId, { help: true, error: errors.eventDate })}
            data-fp-invalid={errors.eventDate ? "" : undefined}
            className={`${INPUT} ${border(Boolean(errors.eventDate))}`}
          />
        </Field>
      </div>
    </div>
  );
}
