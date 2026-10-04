import Image from "next/image";
import type { ImageSpec } from "../../lib/assets";
import { PRICE_ON_PROOF, type ProductKey } from "../../lib/intake/products";
import { MAX_QUANTITY } from "../../lib/intake/types";
import { FictionalLabel } from "../FictionalLabel";
import { MinusIcon, PlusIcon } from "../icons";
import { CHECK, FieldError, LABEL, RADIO } from "./fields";
import { FIELD_PREFIX, errorId, type ProductState } from "./model";
import { UI } from "./strings";

/** What the server page hands the form for one product: copy + price labels already computed. */
export interface ProductTileData {
  key: ProductKey;
  name: string;
  blurb: string;
  /** productFromLabel() or PRICE_ON_PROOF. */
  fromLabel: string;
  image: ImageSpec | null;
  options: { key: string; label: string; detail: string; priceLabel: string; printed: boolean }[];
}

export interface ProductPickerProps {
  products: ProductTileData[];
  state: Record<ProductKey, ProductState>;
  onToggle: (key: ProductKey, selected: boolean) => void;
  onOption: (key: ProductKey, option: string) => void;
  onQuantity: (key: ProductKey, quantity: number) => void;
  setLine: string;
  error?: string;
}

const productId = (key: string) => `${FIELD_PREFIX}product-${key}`;

/** The product's 1 : 1 picture (lib/assets.ts `product.<key>`), or — while a key is missing — the product named in type on a hairline tile. */
function Thumb({ image, name }: { image: ImageSpec | null; name: string }) {
  return (
    <span className="relative block aspect-square w-20 shrink-0 overflow-hidden rounded-none sm:w-32 lg:w-40">
      {image ? (
        <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 160px, (min-width: 640px) 128px, 80px" className="object-contain" />
      ) : (
        <span aria-hidden="true" className="flex h-full w-full items-center justify-center border border-hairline px-2 text-center font-display text-[1.125rem] uppercase leading-none text-muted sm:text-[1.5rem]">
          {name}
        </span>
      )}
    </span>
  );
}

/**
 * Section 01 (DESIGN §4.21 inputs, §2.6 tap targets): one full-width tile per product — a real checkbox
 * (one, several or all), the name, the blurb and the "from" price. Choosing a tile reveals its options
 * as radio rows with their price labels, and a quantity stepper for the printed ones. Reveals use the
 * `hidden` attribute, so nothing is reserved and nothing above the tile moves.
 */
export function ProductPicker({ products, state, onToggle, onOption, onQuantity, setLine, error }: ProductPickerProps) {
  return (
    <div>
      <FieldError id={errorId("products")} message={error} className="mb-4" />
      <ul className="flex flex-col gap-3">
        {products.map((product) => {
          const chosen = state[product.key];
          const option = product.options.find((o) => o.key === chosen.option) ?? product.options[0];
          // A product with no priced option (the blanket, until its tiers exist) says PRICE_ON_PROOF once,
          // on the tile — not again on every size row.
          const rowPrices = product.options.some((o) => o.priceLabel !== PRICE_ON_PROOF);
          const id = productId(product.key);
          const qtyId = `${id}-quantity`;
          return (
            <li
              key={product.key}
              className={`rounded-ui border bg-stock transition-[border-color,box-shadow] duration-hover ease-out ${
                chosen.selected ? "border-ink shadow-[0_0_0_1px_var(--color-ink)]" : error ? "border-fail" : "border-ink/25 hover:border-ink/60"
              }`}
            >
              <label htmlFor={id} className="flex cursor-pointer items-start gap-3 p-4 sm:gap-4 sm:p-5">
                <input
                  id={id}
                  type="checkbox"
                  checked={chosen.selected}
                  onChange={(e) => onToggle(product.key, e.target.checked)}
                  aria-labelledby={`${id}-name ${id}-from`}
                  aria-describedby={[`${id}-blurb`, error ? errorId("products") : ""].filter(Boolean).join(" ")}
                  aria-invalid={error ? true : undefined}
                  data-fp-invalid={error ? "" : undefined}
                  className={`mt-0.5 ${CHECK}`}
                />
                <span className="min-w-0 flex-1">
                  <span id={`${id}-name`} className="block font-display text-[1.375rem] uppercase leading-none text-ink sm:text-h3">
                    {product.name}
                  </span>
                  <span id={`${id}-blurb`} className="mt-2 block max-w-[46ch] font-body text-small text-muted-text">
                    {product.blurb}
                  </span>
                  <span id={`${id}-from`} className="mt-3 block font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-ink">
                    {product.fromLabel}
                  </span>
                </span>
                <Thumb image={product.image} name={product.name} />
              </label>
              <div hidden={!chosen.selected} className="border-t border-hairline px-4 pb-4 sm:px-5">
                <fieldset className="min-w-0">
                  <legend className="sr-only">{UI.products.optionsLegend(product.name)}</legend>
                  <ul>
                    {product.options.map((o) => {
                      const oid = `${id}-option-${o.key}`;
                      return (
                        <li key={o.key} className="border-b border-hairline last:border-b-0">
                          <label
                            htmlFor={oid}
                            className="grid min-h-11 cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3"
                          >
                            <input
                              id={oid}
                              type="radio"
                              name={`${id}-option`}
                              value={o.key}
                              checked={chosen.option === o.key}
                              onChange={() => onOption(product.key, o.key)}
                              aria-describedby={`${oid}-detail`}
                              className={`self-start mt-0.5 ${RADIO}`}
                            />
                            <span className="font-body text-[1rem] font-bold text-ink">{o.label}</span>
                            <span className="max-w-[12rem] text-right font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-ink">
                              {rowPrices ? o.priceLabel : null}
                            </span>
                            <span id={`${oid}-detail`} className="col-span-2 col-start-2 mt-1 max-w-[56ch] font-body text-small text-muted-text">
                              {o.detail}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
                <div hidden={!option.printed} className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline pt-4">
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
        })}
      </ul>
      {setLine ? <p className="mt-4 max-w-[62ch] font-body text-small font-medium text-ink">{setLine}</p> : null}
      {products.some((p) => p.image?.fictional) ? <FictionalLabel className="mt-4" /> : null}
    </div>
  );
}
