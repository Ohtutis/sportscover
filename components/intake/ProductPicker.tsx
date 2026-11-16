import { BUNDLE_STEPS, DIGITAL_ADDON, allDigitalTotal, formatPercent, formatUsd, formatUsdShort } from "../../lib/catalog/prices";
import { INTAKE_COPY } from "../../lib/intake/copy";
import type { ProductKey } from "../../lib/intake/products";
import type { FreeProofImage, FreeProofSportArt } from "../../lib/intake/sport-art";
import type { StyleChoice } from "../../lib/intake/types";
import { Badge } from "./Badge";
import { CHECK, FieldError, RADIO } from "./fields";
import { FIELD_PREFIX, bundleNudge, errorId, ladderRungs, orderTotal, productImage, type ArtNoteData, type ProductState } from "./model";
import { UI } from "./strings";
import { ArtImage, ArtNote, NeutralArt, type NeutralShape } from "./visuals";

/** One option as the server page hands it over: copy, the price label, and the number behind it. */
export interface ProductOptionData {
  key: string;
  label: string;
  detail: string;
  /** optionPriceLabel(): the site price. */
  priceLabel: string;
  printed: boolean;
  /** optionPrice(): the site price of the option's tier (prices.ts). */
  price: number;
}

/** What the server page hands the form for one product: copy + price labels already computed. The picture comes from the chosen sport. */
export interface ProductTileData {
  key: ProductKey;
  name: string;
  blurb: string;
  /** productFromLabel(): "from <the cheapest option>". */
  fromLabel: string;
  options: ProductOptionData[];
}

export interface ProductPickerProps {
  products: ProductTileData[];
  state: Record<ProductKey, ProductState>;
  onToggle: (key: ProductKey, selected: boolean) => void;
  onOption: (key: ProductKey, option: string) => void;
  /** The chosen sport's art (null before a sport, or for a sport with no example): each tile's picture. */
  art?: FreeProofSportArt | null;
  /** The chosen look — the cards tile shows the card in it when the sport has that finish. */
  style?: StyleChoice | "";
  /** The line under the tiles: C13 over art, "pick a sport", or built to order. */
  note?: ArtNoteData;
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
 * where "more than one" is settled. Under the cards (pricing v1, 2026-10-07; v2 the same evening) the
 * bundle ladder in two rows — digital files "2 products 24.99 · 3 products 29.99 · all 4 34.99", printed
 * "2 products −15% · 3 products −20% · all 4 −25%" — with the rung the choice has reached on the accent,
 * and one live line: what the next product (the first not chosen, at the option its card holds) costs as
 * digital files or saves printed. Every figure is prices.ts BUNDLE_STEPS / allDigitalTotal / bundleTotal
 * through the model, from the prices the server page handed over; the comparison is always "bought
 * separately", never a former price.
 */
export function ProductPicker({ products, state, onToggle, onOption, art = null, style = "", note, error }: ProductPickerProps) {
  const describedError = error ? errorId("products") : "";

  const productCard = (product: ProductTileData) => {
    const chosen = state[product.key];
    const selected = chosen.selected;
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
            <span id={`${id}-from`} className={`${FROM} ${aside}`.trim()}>
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
                        <span className="whitespace-nowrap font-label text-[0.875rem] font-semibold uppercase tracking-[0.04em] tabular-nums text-ink">{o.priceLabel}</span>
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

  return (
    <div>
      <FieldError id={errorId("products")} message={error} className="mb-6" />
      <ul className="grid items-start gap-y-4 md:grid-cols-2 md:gap-x-4">{products.map(productCard)}</ul>
      <BundleLadder products={products} state={state} />
      <p data-more-than-one="" className="mt-2 max-w-[60ch] font-body text-small text-muted-text">
        {INTAKE_COPY.moreThanOne}
      </p>
      {/* Last in the step: the slot is as tall as its longest line, so any spare height falls into the step's own air. */}
      {note ? <ArtNote state={note.state} sport={note.sport} example={note.example} className="mt-6" /> : null}
    </div>
  );
}

const LADDER_LABEL = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";

/** One row of the ladder: its label and the three rungs, the reached one on the accent (ink on orange, 6.3 : 1 — never orange text). */
function LadderRow({ row, label, reached, rung }: { row: "digital" | "printed"; label: string; reached: number; rung: (count: number, last: boolean) => string }) {
  return (
    <div data-bundle-row={row} className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className={`${LADDER_LABEL} w-[6.5rem] shrink-0`}>{label}</span>
      <ol className="flex flex-wrap gap-2">
        {BUNDLE_STEPS.map((step, i) => {
          const on = i === reached;
          return (
            <li
              key={step.count}
              data-bundle-step={step.count}
              data-reached={on ? "" : undefined}
              aria-current={on ? "step" : undefined}
              className={`inline-flex h-9 items-center whitespace-nowrap rounded-pill border px-3.5 font-label text-[0.9375rem] font-semibold tabular-nums ${
                on ? "border-accent bg-accent text-ink" : "border-ink/15 text-ink"
              }`}
            >
              {rung(step.count, i === BUNDLE_STEPS.length - 1)}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * The bundle ladder (pricing v1, 2026-10-07; v2 the same evening): two rows of three rungs — the digital
 * row carries the TOTAL of that many products as digital files (DIGITAL_PRICE, then DIGITAL_ADDON each:
 * the saving the owner wants pushed, the files cost nothing extra), the printed row the printed ladder's
 * rates. The reached rung on each row is on the accent (an all-digital order lights the digital row by
 * its count; the printed row lights by the number of printed products). One live line under them: before
 * a choice what the ladder is; with one to three products the next product — as digital files, the
 * add-on; printed, what it saves on top; with all four, the top rung. Every figure comes from the model's
 * bundle helpers over the prices the page handed over — nothing typed.
 */
function BundleLadder({ products, state }: { products: ProductTileData[]; state: Record<ProductKey, ProductState> }) {
  const b = INTAKE_COPY.bundle;
  const total = orderTotal(products, state);
  const rungs = ladderRungs(products, state);
  const nudge = bundleNudge(products, state);
  const addon = formatUsdShort(DIGITAL_ADDON);
  const line = !total
    ? b.lead(addon)
    : nudge
      ? nudge.digital
        ? b.nudgeDigital(b.addName[nudge.add], addon)
        : (nudge.first ? b.nudgeFirst : b.nudgeMore)(b.addName[nudge.add], formatUsd(nudge.saving))
      : rungs.digital >= 0
        ? b.topDigital(formatUsd(total.total))
        : b.top(formatPercent(total.discountRate));
  return (
    <div data-bundle-ladder="" className="mt-6 rounded-[20px] border border-hairline bg-white p-4 sm:p-5">
      <p className={LADDER_LABEL}>{b.title}</p>
      <LadderRow row="digital" label={b.rowDigital} reached={rungs.digital} rung={(count, last) => b.stepDigital(count, last, formatUsd(allDigitalTotal(count)))} />
      <LadderRow row="printed" label={b.rowPrinted} reached={rungs.printed} rung={(count, last) => b.step(count, last, formatPercent(BUNDLE_STEPS.find((s) => s.count === count)!.percent / 100))} />
      <p data-bundle-nudge="" aria-live="polite" className="mt-3 max-w-[60ch] font-body text-small font-medium text-pretty text-ink">
        {line}
      </p>
    </div>
  );
}
