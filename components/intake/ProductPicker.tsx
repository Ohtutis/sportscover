import Image from "next/image";
import type { ImageSpec } from "../../lib/assets";
import { formatUsd } from "../../lib/catalog/prices";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { PRICE_ON_PROOF, type ProductKey } from "../../lib/intake/products";
import { MAX_QUANTITY } from "../../lib/intake/types";
import { FictionalLabel } from "../FictionalLabel";
import { MinusIcon, PlusIcon } from "../icons";
import { Badge } from "./Badge";
import { CHECK, FieldError, LABEL, RADIO } from "./fields";
import { FIELD_PREFIX, errorId, setPair, setPairsLabel, type ProductState, type SetCombo } from "./model";
import { UI } from "./strings";

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

/** What the server page hands the form for one product: copy + price labels already computed. */
export interface ProductTileData {
  key: ProductKey;
  name: string;
  blurb: string;
  /** productFromLabel() or PRICE_ON_PROOF. */
  fromLabel: string;
  image: ImageSpec | null;
  options: ProductOptionData[];
}

/**
 * The set as a RESULT, not a card (owner, 2026-10-06: "a bundle must never duplicate the single
 * products"). Everything the note under the four cards needs, computed on the server from the ladder.
 * The name is kept so the form that passes it through needs no change.
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
  /** Unused since the set card went (2026-10-06): the set is chosen by ticking cards and a poster. Kept so callers need no change. */
  onSet?: (selected: boolean) => void;
  onOption: (key: ProductKey, option: string) => void;
  onQuantity: (key: ProductKey, quantity: number) => void;
  error?: string;
}

const productId = (key: string) => `${FIELD_PREFIX}product-${key}`;

/**
 * The picture is the hero of the card (owner, 2026-10-06). The `product.*` tiles are 800 × 800, so the
 * box is 1 : 1 and nothing is cropped out. From md it fills the card's top edge to edge; below md the
 * card lies on its side with the picture at 144 px (176 px from sm) — it was 112 / 144.
 */
const MEDIA =
  "relative row-span-3 block aspect-square w-36 shrink-0 self-start overflow-hidden rounded-[10px] bg-hairline sm:w-44 md:row-span-1 md:w-full md:rounded-none";
const MEDIA_SIZES = "(min-width: 1280px) 230px, (min-width: 768px) 46vw, 176px";

/** The product's 1 : 1 picture (lib/assets.ts `product.<key>`), or — while a key is missing — the product named in type. */
function Media({ image, name, selected }: { image: ImageSpec | null; name: string; selected: boolean }) {
  return (
    <span className={MEDIA}>
      {image ? (
        <Image src={image.src} alt={image.alt} fill sizes={MEDIA_SIZES} className="object-cover" />
      ) : (
        <span aria-hidden="true" className="flex h-full w-full items-center justify-center border border-hairline px-2 text-center font-display text-[1.125rem] uppercase leading-none text-muted md:text-[1.75rem]">
          {name}
        </span>
      )}
      {/* The chip sits ON the picture's corner, so it appearing moves nothing. */}
      {selected ? <Badge className="absolute right-2.5 top-2.5 z-10">{INTAKE_COPY.selectedBadge}</Badge> : null}
    </span>
  );
}

/**
 * One container, one border (owner, 2026-10-06: the options used to open as a separate box under the
 * card, with an empty band under the chosen card and a short neighbour beside it). The card is the frame;
 * its top half is the `<label>` that toggles the checkbox — picture, name, line, "from" price — and the
 * chosen card opens a hairline divider and its options INSIDE the same border: the radio rows with their
 * prices and, for a printed option, the quantity stepper. Chosen = the 2 px ink edge (a 1 px border plus
 * a 1 px ring, so nothing inside moves) and the soft card shadow; at rest the hairline.
 */
const card = (selected: boolean, error: boolean): string =>
  `relative min-w-0 overflow-hidden rounded-[20px] border bg-stock transition-[border-color,box-shadow] duration-hover ease-out ${
    selected ? "border-ink ring-1 ring-ink shadow-[var(--shadow-card-stock)]" : error ? "border-fail" : "border-ink/15 hover:border-ink/50"
  }`;

/** Below md the label is a two-column row (picture | words); from md one column, the picture on top. */
const HEAD = "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] content-start gap-x-4 p-3 sm:p-4 md:grid-cols-1 md:p-0";
const ROW = "col-start-2 min-w-0 md:col-start-1 md:px-5";
const NAME_ROW = `${ROW} flex items-start gap-3 md:pt-4`;
const NAME = "block font-display text-[1.375rem] uppercase leading-none text-ink md:text-h3";
/** Two lines reserved in the two-up rows, four in the four-up row: cards at rest end level without a subgrid. */
const BLURB = `${ROW} mt-2 block max-w-[60ch] font-body text-small text-muted-text md:min-h-[2.9em] xl:min-h-[5.8em]`;
const PRICE_ROW = `${ROW} mt-3 md:pb-5`;
/** Two lines reserved from md: "Price confirmed with your free proof" (the blanket) wraps where "from …" does not. */
const FROM = "block font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-ink md:min-h-[3.1em]";
/** The options, inside the card: a hairline divider and the same side padding as the words above. */
const OPTIONS = "mx-3 border-t border-hairline sm:mx-4 md:mx-5";

/**
 * Step 1 (owner review 2026-10-04, points 4–5; 2026-10-06): four cards — trading cards, the poster, the
 * banner, the blanket — two to a row from md and four from xl, never an empty slot. Each card is a real
 * checkbox (one, several or all); a chosen card gets the ink edge, the card shadow and the SELECTED chip,
 * and grows to show its options (`items-start`: the neighbours keep their own height and nothing beside
 * it moves — only the chosen card and what is below it). The set is not a card: under the row ONE line
 * says what ticking cards and a poster together does, from the ladder — "save from …" before, the pair's
 * own saving once it matches a set tier, the matching pairs when it doesn't. Nothing prices banner or
 * blanket bundles, so the line never claims anything for them.
 */
export function ProductPicker({ products, setTile, state, onToggle, onOption, onQuantity, error }: ProductPickerProps) {
  const describedError = error ? errorId("products") : "";

  const productCard = (product: ProductTileData) => {
    const chosen = state[product.key];
    const option = product.options.find((o) => o.key === chosen.option) ?? product.options[0];
    // A product with no priced option (the blanket, until its tiers exist) says PRICE_ON_PROOF once, on
    // the card — not again on every size row.
    const rowPrices = product.options.some((o) => o.priceLabel !== PRICE_ON_PROOF);
    const id = productId(product.key);
    const qtyId = `${id}-quantity`;
    return (
      <li key={product.key} data-product-card="" className={card(chosen.selected, Boolean(error))}>
        <label htmlFor={id} className={HEAD}>
          <Media image={product.image} name={product.name} selected={chosen.selected} />
          <span className={NAME_ROW}>
            <input
              id={id}
              type="checkbox"
              checked={chosen.selected}
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
          <span id={`${id}-blurb`} className={BLURB}>
            {product.blurb}
          </span>
          <span className={PRICE_ROW}>
            <span id={`${id}-from`} className={FROM}>
              {product.fromLabel}
            </span>
          </span>
        </label>
        <div hidden={!chosen.selected} data-product-options="" className={OPTIONS}>
          <fieldset className="min-w-0">
            <legend className="sr-only">{UI.products.optionsLegend(product.name)}</legend>
            <ul>
              {product.options.map((o) => {
                const oid = `${id}-option-${o.key}`;
                return (
                  <li key={o.key} className="border-b border-hairline last:border-b-0">
                    <label htmlFor={oid} className="grid min-h-11 cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 py-3">
                      <input
                        id={oid}
                        type="radio"
                        name={`${id}-option`}
                        value={o.key}
                        checked={chosen.option === o.key}
                        onChange={() => onOption(product.key, o.key)}
                        aria-describedby={`${oid}-detail`}
                        className={`mt-0.5 ${RADIO}`}
                      />
                      <span className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <span className="font-body text-[1rem] font-bold text-ink">{o.label}</span>
                        {rowPrices ? (
                          <span className="font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-ink">{o.priceLabel}</span>
                        ) : null}
                      </span>
                      <span id={`${oid}-detail`} className="col-start-2 mt-1 max-w-[60ch] font-body text-small text-muted-text">
                        {o.detail}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
          <div hidden={!option.printed} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-hairline py-3">
            <span id={`${qtyId}-label`} className={LABEL}>
              {UI.products.quantity}
            </span>
            <div role="group" aria-labelledby={`${qtyId}-label`} className="inline-flex items-center rounded-ui border border-ink/40">
              <button
                type="button"
                aria-label={UI.products.fewer}
                disabled={chosen.quantity <= 1}
                onClick={() => onQuantity(product.key, chosen.quantity - 1)}
                className="grid size-11 place-items-center rounded-ui text-ink transition-[background-color] duration-hover ease-out hover:bg-ink/5 disabled:cursor-not-allowed disabled:text-muted"
              >
                <MinusIcon size={18} />
              </button>
              <output id={qtyId} aria-live="polite" className="w-10 text-center font-label text-[1.0625rem] font-semibold tabular-nums text-ink">
                {chosen.quantity}
              </output>
              <button
                type="button"
                aria-label={UI.products.more}
                disabled={chosen.quantity >= MAX_QUANTITY}
                onClick={() => onQuantity(product.key, chosen.quantity + 1)}
                className="grid size-11 place-items-center rounded-ui text-ink transition-[background-color] duration-hover ease-out hover:bg-ink/5 disabled:cursor-not-allowed disabled:text-muted"
              >
                <PlusIcon size={18} />
              </button>
            </div>
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

  const fictional = products.some((p) => p.image?.fictional);
  return (
    <div>
      <FieldError id={errorId("products")} message={error} className="mb-6" />
      <ul className="grid items-start gap-y-5 md:grid-cols-2 md:gap-x-4 md:gap-y-6 xl:grid-cols-4">{products.map(productCard)}</ul>
      {fictional ? <FictionalLabel className="mt-6" /> : null}
      {setLine ? (
        <p data-set-note="" aria-live="polite" className="mt-5 max-w-[60ch] font-body text-small font-medium text-pretty text-ink">
          {setLine}
        </p>
      ) : null}
    </div>
  );
}
