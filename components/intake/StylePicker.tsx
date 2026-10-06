import type { StyleCode } from "../../lib/catalog/styles";
import { INTAKE_COPY } from "../../lib/intake/copy";
import type { FreeProofSportArt } from "../../lib/intake/sport-art";
import { STYLE_RECOMMEND, type StyleChoice } from "../../lib/intake/types";
import { Badge } from "./Badge";
import { FieldError, RADIO } from "./fields";
import { FIELD_PREFIX, cardImage, errorId, type ArtState } from "./model";
import { ArtImage, ArtNote, NeutralArt } from "./visuals";

/** One look as the server page hands it over. Its picture is the chosen sport's card in that finish. */
export interface StyleTileData {
  code: StyleCode;
  name: string;
  material: string;
}

export interface StylePickerProps {
  styles: StyleTileData[];
  value: StyleChoice | "";
  onChange: (value: StyleChoice) => void;
  labelledBy: string;
  /** The chosen sport's art — each tile shows its card front in that finish, or the grey card framed in the finish. */
  art?: FreeProofSportArt | null;
  /** The line under the tiles: C13 over art, "pick a sport", or built to order. */
  note?: { state: ArtState; sport: string | null };
  error?: string;
}

const TILE_SIZES = "(min-width: 1280px) 220px, (min-width: 1024px) 160px, (min-width: 768px) 31vw, 46vw";

/** The tile's 5 : 7 face: the sport's card in this finish, square-cut and contained — or the grey card wearing the finish as its frame. */
function Face({ art, code }: { art: FreeProofSportArt | null; code: string }) {
  const image = cardImage(art, code);
  return (
    <span data-style-face={image ? "art" : "neutral"} className="relative block aspect-[5/7] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
      {image ? <ArtImage image={image} sizes={TILE_SIZES} /> : <NeutralArt shape="card" finish={code} className="h-full w-full" />}
    </span>
  );
}

const styleId = (code: string) => `${FIELD_PREFIX}style-${code}`;

/** A chosen tile: a 2 px ink ring held off the tile by the page ground (it reads on the light faces and on the dark tile alike). */
const CHOSEN = "ring-2 ring-ink ring-offset-2 ring-offset-stock shadow-[var(--shadow-card-stock)]";

/**
 * The look step (owner review 2026-10-04, points 6–7): eight tiles, four per row from lg (three on a tablet), two on a phone — the
 * chosen sport's card in the six finishes and the Senior Night edition (5 : 7, square, uncropped; one C13
 * line for the group) — v4: before a sport is chosen, or for a finish the sport has no example of, the
 * grey card framed in the finish's material — each with only its name and its material line under it,
 * and an eighth "You choose for me" tile in the arena dark, the same size. Real radios: arrow keys move
 * through the group, and the radio's name is the finish name alone (the card's long alt stays on the
 * image). A chosen tile gets the ink ring and the SELECTED badge; the Senior Night fields now live in
 * step 3, beside the athlete they describe.
 */
export function StylePicker({ styles, value, onChange, labelledBy, art = null, note, error }: StylePickerProps) {
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
                  <Face art={art} code={tile.code} />
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
      {note ? <ArtNote state={note.state} sport={note.sport} className="mt-6" /> : null}
    </div>
  );
}
