import type { ImageSpec } from "../../lib/assets";
import type { StyleCode } from "../../lib/catalog/styles";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { STYLE_RECOMMEND, type StyleChoice } from "../../lib/intake/types";
import { CardFace } from "../CardFace";
import { FictionalLabel } from "../FictionalLabel";
import { Badge } from "./Badge";
import { FieldError, RADIO } from "./fields";
import { FIELD_PREFIX, errorId } from "./model";

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
  labelledBy: string;
  error?: string;
}

const styleId = (code: string) => `${FIELD_PREFIX}style-${code}`;

/** A chosen tile: a 2 px ink ring held off the tile by the page ground (it reads on the light faces and on the dark tile alike). */
const CHOSEN = "ring-2 ring-ink ring-offset-2 ring-offset-stock shadow-[var(--shadow-card-stock)]";

/**
 * Step 2 (owner review 2026-10-04, points 6–7): eight tiles, four per row from lg (three on a tablet), two on a phone — the
 * same fictional athlete in the six finishes and the Senior Night edition (CardFace: 5 : 7, square,
 * uncropped; one C13 label for the group), each with only its name and its material line under it,
 * and an eighth "You choose for me" tile in the arena dark, the same size. Real radios: arrow keys move
 * through the group, and the radio's name is the finish name alone (the card's long alt stays on the
 * image). A chosen tile gets the ink ring and the SELECTED badge; the Senior Night fields now live in
 * step 3, beside the athlete they describe.
 */
export function StylePicker({ styles, value, onChange, labelledBy, error }: StylePickerProps) {
  const recommendId = styleId(STYLE_RECOMMEND);
  const recommendChecked = value === STYLE_RECOMMEND;
  const idle = error ? "ring-1 ring-fail" : "hover:ring-1 hover:ring-ink/25";
  return (
    <div>
      <FieldError id={errorId("style")} message={error} className="mb-4" />
      <div role="radiogroup" aria-labelledby={labelledBy} aria-describedby={error ? errorId("style") : undefined}>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-4 md:gap-y-8 lg:grid-cols-4">
          {styles.map((tile, i) => {
            const id = styleId(tile.code);
            const checked = value === tile.code;
            return (
              <li key={tile.code} className="min-w-0">
                <label
                  htmlFor={id}
                  className={`relative flex h-full cursor-pointer flex-col rounded-ui p-2 transition-[box-shadow] duration-hover ease-out ${checked ? CHOSEN : idle}`}
                >
                  {checked ? <Badge className="absolute -top-3 right-3 z-10">{INTAKE_COPY.selectedBadge}</Badge> : null}
                  <CardFace {...tile.image} labelled sizes="(min-width: 1280px) 220px, (min-width: 1024px) 160px, (min-width: 768px) 31vw, 46vw" />
                  <span className="mt-3 flex items-start gap-2">
                    <input
                      id={id}
                      type="radio"
                      name={`${FIELD_PREFIX}style`}
                      value={tile.code}
                      checked={checked}
                      onChange={() => onChange(tile.code)}
                      aria-labelledby={`${id}-name`}
                      aria-describedby={`${id}-detail`}
                      data-fp-invalid={error && i === 0 ? "" : undefined}
                      className={`mt-px ${RADIO}`}
                    />
                    <span id={`${id}-name`} className="min-w-0 font-body text-[0.9375rem] font-bold leading-tight text-ink">
                      {tile.name}
                    </span>
                  </span>
                  <span id={`${id}-detail`} className="mt-1.5 pl-7 font-body text-small text-muted-text">
                    {tile.material}
                  </span>
                </label>
              </li>
            );
          })}
          <li className="min-w-0">
            <label
              htmlFor={recommendId}
              className={`relative flex h-full cursor-pointer flex-col rounded-ui p-2 transition-[box-shadow] duration-hover ease-out ${recommendChecked ? CHOSEN : idle}`}
            >
              {recommendChecked ? <Badge className="absolute -top-3 right-3 z-10">{INTAKE_COPY.selectedBadge}</Badge> : null}
              {/* The dark tile fills the same box a card face and its two lines fill beside it — square-cut, like the faces. */}
              <span data-surface="arena" className="flex flex-1 flex-col bg-arena p-4 text-white shadow-[var(--shadow-card-stock)] sm:p-5">
                <input
                  id={recommendId}
                  type="radio"
                  name={`${FIELD_PREFIX}style`}
                  value={STYLE_RECOMMEND}
                  checked={recommendChecked}
                  onChange={() => onChange(STYLE_RECOMMEND)}
                  aria-labelledby={`${recommendId}-name`}
                  aria-describedby={`${recommendId}-detail`}
                  className="size-5 shrink-0 accent-white"
                />
                <span className="mt-auto pt-6">
                  <span id={`${recommendId}-name`} className="block max-w-[8ch] font-display text-[1.75rem] uppercase leading-[0.95] text-white sm:text-[2.25rem]">
                    {INTAKE_COPY.chooseForMeTitle}
                  </span>
                  <span id={`${recommendId}-detail`} className="mt-3 block font-body text-small text-arena-muted">
                    {INTAKE_COPY.chooseForMeLine}
                  </span>
                </span>
              </span>
            </label>
          </li>
        </ul>
      </div>
      <FictionalLabel className="mt-6" />
    </div>
  );
}
