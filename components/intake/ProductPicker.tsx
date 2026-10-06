import { formatUsd } from "../../lib/catalog/prices";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { PRICE_ON_PROOF, type ProductKey } from "../../lib/intake/products";
import type { FreeProofImage, FreeProofSportArt } from "../../lib/intake/sport-art";
import type { StyleChoice } from "../../lib/intake/types";
import { Badge } from "./Badge";
import { CHECK, FieldError, RADIO } from "./fields";
import { FIELD_PREFIX, errorId, productImage, setPair, setPairsLabel, type ArtState, type ProductState, type SetCombo } from "./model";
import { UI } from "./strings";
import { ArtImage, ArtNote, NeutralArt, type NeutralShape } from "./visuals";

/** One option as the server page hands it over: copy, the price label, and the number behind it (null = on the proof). */
export interface ProductOptionData {
  key: string;
  label: string;
  detail: string;
  /** optionPriceLabel(): the site price, or PRICE_ON_PROOF. */
  priceLabel: string;
  printed: boolean;
  /** sitePrice() of the option's tier; null when the option has no tier yet. */
  price: number | null;
}

/** What the server page hands the form for one product: copy + price labels already computed. The picture comes from the chosen sport. */
export interface ProductTileData {
  key: ProductKey;
  name: string;
  blurb: string;
  /** productFromLabel() or PRICE_ON_PROOF. */
  fromLabel: string;
  options: ProductOptionData[];
}

/**
 * The set as a RESULT, not a card (owner, 2026-10-06: "a bundle must never duplicate the single
 * products"). Everything the note under the four cards needs, computed on the server from the ladder.
 */
export interface SetTileData {
  /** INTAKE_COPY.setNote.pick(<the smallest saving a set tier gives>) — null when no tier saves anything. */
  pickLine: string | null;
  /** The Complete Set tiers as option pairs with their site prices (the summary counts the same list). */
  combos: SetCombo[];
}

export interface ProductPickerProps {
  products: ProductTileData[];
  setTile: SetTileData;
  state: Record<ProductKey, ProductState>;
  onToggle: (key: ProductKey, selected: boolean) => void;
  onOption: (key: ProductKey, option: string) => void;
  /** The chosen sport's art (null before a sport, or for a sport with no example): each tile's picture. */
  art?: FreeProofSportArt | null;
  /** The chosen look — the cards tile shows the card in it when the sport has that finish. */
  style?: StyleChoice | "";
  /** The line under the tiles: C13 over art, "pick a sport", or built to order. */
  note?: { state: ArtState; sport: string | null };
  error?: string;
}

const productId = (key: string) => `${FIELD_PREFIX}product-${key}`;
const SHAPE: Record<ProductKey, Exclude<NeutralShape, "photo">> = { cards: "card", poster: "poster", banner: "banner", blanket: "blanket" };

/**
 * The picture box: square, 112 px on a phone, 128 px once the card is 320 px wide, 200 px once it is 448 px
 * (the 2 × 2 grid at 1440). The art is contained in it, never cropped (a card is never cropped); before a
 * sport is chosen it is the grey example of the product.
 */
const MEDIA =
  "relative row-span-1 block size-28 shrink-0 cursor-pointer self-start overflow-hidden rounded-[10px] bg-hairline/60 @xs:size-32 @md:row-span-2 @md:size-50";
const MEDIA_SIZES = "(min-width: 1280px) 200px, 128px";

function Media({ image, product, selected }: { image: FreeProofImage | null; product: ProductTileData; selected: boolean }) {
  const shape = SHAPE[product.key];
  return (
    <span data-product-media={image ? "art" : "neutral"} className="absolute inset-[7%] flex items-center justify-center">
      {image ? (
        <ArtImage image={image} sizes={MEDIA_SIZES} />
      ) : (
        <NeutralArt shape={shape} className={shape === "banner" ? "w-full" : "h-full"} />
      )}
      {/* The chip sits ON the picture's corner, so it appearing moves nothing. */}
      {selected ? <Badge className="absolute -right-1 -top-1 z-10">{INTAKE_COPY.selectedBadge}</Badge> : null}
    </span>
  );
}

/**
 * One container, one border. The card is a grid: the picture on the left, the name (with its checkbox),
 * the line and the "from" price beside it; a chosen card opens its options INSIDE the same border as a
 * compact segmented list — one row per option, radio · name · price on one line — and the chosen
 * option's description in small muted type under the card's content, for that option only. On a wide card
 * (the 2 × 2 grid at 1440) the options take the place of the line beside the picture, so a chosen card
 * grows by at most about 1.3× (owner review 2026-10-06: "four tall narrow columns — sausages"); on a
 * narrow one they run full width under the picture. Chosen = the 2 px ink edge (a 1 px border plus a 1 px
 * ring, so nothing inside moves) and the soft card shadow; at rest the hairline.
 */
const card = (selected: boolean, error: boolean): string =>
  `@container relative min-w-0 overflow-hidden rounded-[20px] border bg-stock transition-[border-color,box-shadow] duration-hover ease-out ${
    selected ? "border-ink ring-1 ring-ink shadow-[var(--shadow-card-stock)]" : error ? "border-fail" : "border-ink/15 hover:border-ink/50"
  }`;

const GRID = "grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 p-3 @xs:p-4";
const HEAD = "col-start-2 row-start-1 flex min-w-0 cursor-pointer flex-col";
const NAME = "block font-display text-[1.375rem] uppercase leading-none text-ink @md:text-h3";
const BLURB = "mt-2 block max-w-[60ch] font-body text-small text-muted-text";
const FROM = "mt-3 block font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-ink";
/** The rows: full width under the picture on a narrow card, beside it on a wide one. */
const OPTIONS = "col-span-2 row-start-2 mt-3 min-w-0 border-t border-hairline @md:col-span-1 @md:col-start-2 @md:mt-3";
const DETAIL = "col-span-2 row-start-3 mt-3 min-w-0";

/**
 * The product step (owner review 2026-10-04, points 4–5; 2026-10-06): four cards — trading cards, the
 * poster, the banner, the blanket — in a 2 × 2 grid from md (one column on a phone), never an empty slot.
 * Each card is a real checkbox (one, several or all); a chosen card gets the ink edge, the card shadow and
 * the SELECTED chip, and opens its options. No quantity anywhere (v4): one muted line under the grid says
 * where "more than one" is settled. The set is not a card: ONE line says what ticking cards and a poster
 * together does, from the ladder — "save from …" before, the pair's own saving once it matches a set
 * tier, the matching pairs when it doesn't. Nothing prices banner or blanket bundles, so the line never
 * claims anything for them.
 */
export function ProductPicker({ products, setTile, state, onToggle, onOption, art = null, style = "", note, error }: ProductPickerProps) {
  const describedError = error ? errorId("products") : "";

  const productCard = (product: ProductTileData) => {
    const chosen = state[product.key];
    const selected = chosen.selected;
    // A product with no priced option (the blanket, until its tiers exist) says PRICE_ON_PROOF once, on
    // the card — not again on every size row, and its "from" line stays when it opens.
    const rowPrices = product.options.some((o) => o.priceLabel !== PRICE_ON_PROOF);
    const id = productId(product.key);
    const image = productImage(art, product.key, style);
    // Opened on a wide card, the options take the line's place: the blurb (and the "from" price, which
    // every row now carries) step aside.
    const aside = selected ? "@md:hidden" : "";
    return (
      <li key={product.key} data-product-card="" className={card(selected, Boolean(error))}>
        <div className={GRID}>
          <label htmlFor={id} className={MEDIA}>
            <Media image={image} product={product} selected={selected} />
          </label>
          <label htmlFor={id} className={HEAD}>
            <span className="flex items-start gap-3">
              <input
                id={id}
                type="checkbox"
                checked={selected}
                onChange={(e) => onToggle(product.key, e.target.checked)}
                aria-labelledby={`${id}-name ${id}-from`}
                aria-describedby={[`${id}-blurb`, describedError].filter(Boolean).join(" ")}
                aria-invalid={error ? true : undefined}
                data-fp-invalid={error ? "" : undefined}
                className={`mt-0.5 ${CHECK}`}
              />
              <span id={`${id}-name`} className={NAME}>
                {product.name}
              </span>
            </span>
            <span id={`${id}-blurb`} className={`${BLURB} ${aside}`.trim()}>
              {product.blurb}
            </span>
            <span id={`${id}-from`} className={`${FROM} ${rowPrices ? aside : ""}`.trim()}>
              {product.fromLabel}
            </span>
          </label>
          <div hidden={!selected} data-product-options="" className={OPTIONS}>
            <fieldset className="min-w-0">
              <legend className="sr-only">{UI.products.optionsLegend(product.name)}</legend>
              <ul>
                {product.options.map((o) => {
                  const oid = `${id}-option-${o.key}`;
                  return (
                    <li key={o.key} className="border-b border-hairline last:border-b-0">
                      <label htmlFor={oid} className="grid min-h-11 cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-2.5 py-1.5">
                        <input
                          id={oid}
                          type="radio"
                          name={`${id}-option`}
                          value={o.key}
                          checked={chosen.option === o.key}
                          onChange={() => onOption(product.key, o.key)}
                          aria-describedby={`${oid}-detail`}
                          className={RADIO}
                        />
                        <span className="min-w-0 font-body text-[0.875rem] font-bold leading-tight text-ink">{o.label}</span>
                        {rowPrices ? (
                          <span className="whitespace-nowrap font-label text-[0.875rem] font-semibold uppercase tracking-[0.04em] tabular-nums text-ink">{o.priceLabel}</span>
                        ) : (
                          <span />
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          </div>
          {/* Every option's description is in the page (each radio names its own); only the chosen one shows. */}
          <div hidden={!selected} data-product-detail="" className={DETAIL}>
            {product.options.map((o) => (
              <p key={o.key} id={`${id}-option-${o.key}-detail`} hidden={chosen.option !== o.key} className="max-w-[60ch] font-body text-small text-muted-text">
                {o.detail}
              </p>
            ))}
          </div>
        </div>
      </li>
    );
  };

  // The set line: computed from the ladder, never typed (prices.ts → the page → here).
  const pair = setPair(products, state, setTile.combos);
  const setLine =
    pair.kind === "matched"
      ? pair.saved !== null
        ? `${INTAKE_COPY.setNote.matchedLead} ${INTAKE_COPY.setTile.savingsLine(formatUsd(pair.saved))}.`
        : INTAKE_COPY.setNote.matchedLead
      : pair.kind === "unmatched"
        ? INTAKE_COPY.setNote.unmatched(setPairsLabel(products, setTile.combos))
        : setTile.pickLine;

  return (
    <div>
      <FieldError id={errorId("products")} message={error} className="mb-6" />
      <ul className="grid items-start gap-y-4 md:grid-cols-2 md:gap-x-4">{products.map(productCard)}</ul>
      {setLine ? (
        <p data-set-note="" aria-live="polite" className="mt-5 max-w-[60ch] font-body text-small font-medium text-pretty text-ink">
          {setLine}
        </p>
      ) : null}
      <p data-more-than-one="" className="mt-2 max-w-[60ch] font-body text-small text-muted-text">
        {INTAKE_COPY.moreThanOne}
      </p>
      {/* Last in the step: the slot is as tall as its longest line, so any spare height falls into the step's own air. */}
      {note ? <ArtNote state={note.state} sport={note.sport} className="mt-6" /> : null}
    </div>
  );
}
