import Image from "next/image";
import type { ReactNode } from "react";
import type { ImageSpec } from "../../lib/assets";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { PRICE_ON_PROOF, type ProductKey } from "../../lib/intake/products";
import { MAX_QUANTITY } from "../../lib/intake/types";
import { FictionalLabel } from "../FictionalLabel";
import { MinusIcon, PlusIcon } from "../icons";
import { Badge } from "./Badge";
import { CHECK, FieldError, LABEL, RADIO } from "./fields";
import { FIELD_PREFIX, errorId, type ProductState } from "./model";
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

/** The fifth card: cards + poster as a set (INTAKE_COPY.setTile), its "from" price and the computed saving. */
export interface SetTileData {
  name: string;
  blurb: string;
  /** setFromLabel(). */
  fromLabel: string;
  badge: string;
  /** setTile.savingsLine(…) — null when the ladder shows no saving. */
  savingsLine: string | null;
  images: { cards: ImageSpec | null; poster: ImageSpec | null };
}

export interface ProductPickerProps {
  products: ProductTileData[];
  setTile: SetTileData;
  state: Record<ProductKey, ProductState>;
  onToggle: (key: ProductKey, selected: boolean) => void;
  onSet: (selected: boolean) => void;
  onOption: (key: ProductKey, option: string) => void;
  onQuantity: (key: ProductKey, quantity: number) => void;
  error?: string;
}

const productId = (key: string) => `${FIELD_PREFIX}product-${key}`;
export const SET_ID = `${FIELD_PREFIX}product-set`;

/** md+: the picture fills the card top (1 : 1, the tiles are square); below md the card lies on its side. */
const MEDIA =
  "relative row-span-3 block aspect-square w-28 self-start overflow-hidden rounded-[10px] bg-hairline sm:w-36 md:row-span-1 md:w-full md:rounded-b-none md:rounded-t-[19px]";
const MEDIA_SIZES = "(min-width: 1280px) 304px, (min-width: 768px) 31vw, 144px";

/** The product's 1 : 1 picture (lib/assets.ts `product.<key>`), or — while a key is missing — the product named in type. */
function Media({ image, name }: { image: ImageSpec | null; name: string }) {
  return (
    <span className={MEDIA}>
      {image ? (
        <Image src={image.src} alt={image.alt} fill sizes={MEDIA_SIZES} className="object-cover" />
      ) : (
        <span aria-hidden="true" className="flex h-full w-full items-center justify-center border border-hairline px-2 text-center font-display text-[1.125rem] uppercase leading-none text-muted md:text-[1.75rem]">
          {name}
        </span>
      )}
    </span>
  );
}

/** The set's picture: the poster on its wall with the card laid in the corner — the two real tiles, nothing new. */
function SetMedia({ images, name }: { images: SetTileData["images"]; name: string }) {
  if (!images.poster || !images.cards) return <Media image={images.poster ?? images.cards} name={name} />;
  return (
    <span className={MEDIA}>
      <Image src={images.poster.src} alt="" fill sizes={MEDIA_SIZES} className="object-cover" />
      <span className="absolute bottom-[6%] right-[6%] block aspect-square w-[46%] overflow-hidden border-[3px] border-stock shadow-[var(--shadow-card-stock)]">
        <Image src={images.cards.src} alt="" fill sizes="(min-width: 1280px) 140px, (min-width: 768px) 15vw, 66px" className="object-cover" />
      </span>
    </span>
  );
}

/**
 * The grid (md+): every card is a five-row subgrid — picture · name · line · price · options — so the
 * cards in a row share their row heights: equal cards at rest, names, lines and prices on one baseline,
 * and a chosen card's options open in the fifth row directly under it while its neighbours keep their
 * size (only white space beside the open panel, never an empty card). Below md a card lies on its side:
 * the picture left, the words right, the options under it.
 */
const ITEM = "flex min-w-0 flex-col gap-2 md:row-span-5 md:grid md:grid-rows-subgrid md:gap-y-0";

/** The card frame: a hairline at rest; chosen = a 2 px ink edge (border + 1 px ring, so nothing inside moves) and the stock card shadow. */
const frame = (selected: boolean, error: boolean): string =>
  `relative grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] content-start gap-x-4 rounded-[20px] border bg-stock p-3 transition-[border-color,box-shadow] duration-hover ease-out sm:p-4 md:row-span-4 md:grid-cols-1 md:grid-rows-subgrid md:p-0 ${
    selected ? "border-ink ring-1 ring-ink shadow-[var(--shadow-card-stock)]" : error ? "border-fail" : "border-ink/15 hover:border-ink/50"
  }`;

const ROW = "col-start-2 min-w-0 md:col-start-1 md:px-5";
const NAME_ROW = `${ROW} flex items-start gap-3 md:pt-4`;
const NAME = "block font-display text-[1.375rem] uppercase leading-none text-ink md:text-h3";
const BLURB = `${ROW} mt-2 block max-w-[60ch] font-body text-small text-muted-text`;
const PRICE_ROW = `${ROW} mt-3 md:pb-5`;
const FROM = "block font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-ink";
/** The options panel under a chosen card: its own box with the chosen card's ink edge. */
const PANEL = "self-stretch rounded-[16px] border-[1.5px] border-ink bg-stock px-4 md:self-start";

/**
 * Step 1 (owner review 2026-10-04, points 4–5): five cards — trading cards, the poster, the cards + poster
 * set, the banner, the blanket — three to a row from md. Each card is a real checkbox (one, several or
 * all) with its picture on top, the name, one line and the "from" price; a chosen card gets the ink edge,
 * the card shadow and the SELECTED badge, and its options open directly under it as radio rows with
 * their price labels, plus a quantity stepper for a printed option — behind `hidden`, so nothing is
 * reserved and nothing above moves. The set card is a shortcut, not a product: choosing it chooses the
 * cards and the poster (each keeps its own option, digital first), and it reads as chosen exactly when
 * both are; it carries the owner's MOST POPULAR badge and the saving computed from the ladder.
 */
export function ProductPicker({ products, setTile, state, onToggle, onSet, onOption, onQuantity, error }: ProductPickerProps) {
  const setChosen = state.cards.selected && state.poster.selected;
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
      <li key={product.key} className={ITEM}>
        <label htmlFor={id} className={frame(chosen.selected, Boolean(error))}>
          {chosen.selected ? <Badge className="absolute -top-3 right-4 z-10">{INTAKE_COPY.selectedBadge}</Badge> : null}
          <Media image={product.image} name={product.name} />
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
        <div hidden={!chosen.selected} className={PANEL}>
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

  const setCard = (
    <li key="set" className={ITEM}>
      <label htmlFor={SET_ID} className={frame(setChosen, Boolean(error))}>
        <Badge className="absolute -top-3 left-4 z-10">{setTile.badge}</Badge>
        {setChosen ? <Badge className="absolute -top-3 right-4 z-10">{INTAKE_COPY.selectedBadge}</Badge> : null}
        <SetMedia images={setTile.images} name={setTile.name} />
        <span className={NAME_ROW}>
          <input
            id={SET_ID}
            type="checkbox"
            checked={setChosen}
            onChange={(e) => onSet(e.target.checked)}
            aria-labelledby={`${SET_ID}-name ${SET_ID}-from`}
            aria-describedby={[`${SET_ID}-blurb`, setTile.savingsLine ? `${SET_ID}-saving` : "", describedError].filter(Boolean).join(" ")}
            className={`mt-0.5 ${CHECK}`}
          />
          <span id={`${SET_ID}-name`} className={NAME}>
            {setTile.name}
          </span>
        </span>
        <span id={`${SET_ID}-blurb`} className={BLURB}>
          {setTile.blurb}
        </span>
        <span className={PRICE_ROW}>
          <span id={`${SET_ID}-from`} className={FROM}>
            {setTile.fromLabel}
          </span>
          {setTile.savingsLine ? (
            <span id={`${SET_ID}-saving`} className="mt-1.5 block max-w-[60ch] font-body text-small font-medium text-ink">
              {setTile.savingsLine}
            </span>
          ) : null}
        </span>
      </label>
      <div hidden={!setChosen} className={`${PANEL} py-3`}>
        <p className="max-w-[60ch] font-body text-small text-ink">{UI.products.setHint}</p>
      </div>
    </li>
  );

  const cards: ReactNode[] = [];
  for (const product of products) {
    cards.push(productCard(product));
    if (product.key === "poster") cards.push(setCard);
  }

  const fictional = products.some((p) => p.image?.fictional);
  return (
    <div>
      <FieldError id={errorId("products")} message={error} className="mb-6" />
      <ul className="grid gap-y-7 md:grid-cols-3 md:gap-x-4 md:gap-y-8">{cards}</ul>
      {fictional ? <FictionalLabel className="mt-6" /> : null}
    </div>
  );
}
