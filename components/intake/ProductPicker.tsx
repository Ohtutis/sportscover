import { useState } from "react";
import { BUNDLE_STEPS, bundleTotal, formatPercent, formatUsd } from "../../lib/catalog/prices";
import { INTAKE_COPY } from "../../lib/intake/copy";
import type { ProductKey } from "../../lib/intake/products";
import type { FreeProofSportArt } from "../../lib/intake/sport-art";
import type { StyleChoice } from "../../lib/intake/types";
import { Badge } from "./Badge";
import { CHECK, FieldError, RADIO } from "./fields";
import { FIELD_PREFIX, bundleNudge, bundleStepIndex, categoryOf, errorId, orderTotal, productImage, type ArtNoteData, type ProductCategory, type ProductState } from "./model";
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
  /** v8: the card / poster / set choice sets the card and poster flags together. */
  onCategory: (category: ProductCategory) => void;
  /** The chosen sport's art (null before a sport, or for a sport with no example): each tile's picture. */
  art?: FreeProofSportArt | null;
  /** The chosen look — the cards tile shows the card in it when the sport has that finish. */
  style?: StyleChoice | "";
  /** The line under the tiles: C13 over art, "pick a sport", or built to order. */
  note?: ArtNoteData;
  error?: string;
}

const productId = (key: string) => `${FIELD_PREFIX}product-${key}`;
const KEY = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";
const SHAPE: Record<ProductKey, Exclude<NeutralShape, "photo">> = { cards: "card", poster: "poster", banner: "banner", blanket: "blanket" };

const MEDIA_SIZES = "(min-width: 1280px) 200px, 128px";

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

const NAME = "block font-display text-[1.375rem] uppercase leading-none text-ink @md:text-h3";
const BLURB = "mt-2 block max-w-[60ch] font-body text-small text-muted-text";
const FROM = "mt-3 block font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-ink";

/**
 * The product step (owner review 2026-10-04, points 4–5; 2026-10-06): four cards — trading cards, the
 * poster, the banner, the blanket — in a 2 × 2 grid from md (one column on a phone), never an empty slot.
 * Each card is a real checkbox (one, several or all); a chosen card gets the ink edge, the card shadow and
 * the SELECTED chip, and opens its options. No quantity anywhere (v4): one muted line under the grid says
 * where "more than one" is settled. Under the cards (pricing v1, 2026-10-07) the bundle ladder — "2
 * products −15% · 3 products −20% · all 4 −25%" — with the rung the choice has reached on the accent, and
 * one live line: what the next product (the first not chosen, at the option its card holds) would save on
 * top. Every figure is prices.ts BUNDLE_STEPS / bundleTotal through the model, from the prices the server
 * page handed over; the comparison is always "bought separately", never a former price.
 */
export function ProductPicker({ products, state, onToggle, onOption, onCategory, art = null, style = "", note, error }: ProductPickerProps) {
  const describedError = error ? errorId("products") : "";
  const m = INTAKE_COPY.make;
  const category = categoryOf(state);
  const byKey = Object.fromEntries(products.map((p) => [p.key, p])) as Partial<Record<ProductKey, ProductTileData>>;
  const [formatsOpen, setFormatsOpen] = useState(false);
  const cheapest = (key: ProductKey): number | null => {
    const prices = byKey[key]?.options.map((o) => o.price) ?? [];
    return prices.length ? Math.min(...prices) : null;
  };
  // The set's "from": the cheapest card and poster together, through the same bundle rule as every total.
  const cardFrom = cheapest("cards");
  const posterFrom = cheapest("poster");
  const fromOf: Record<ProductCategory, string> = {
    card: byKey.cards?.fromLabel ?? "",
    poster: byKey.poster?.fromLabel ?? "",
    set:
      cardFrom !== null && posterFrom !== null
        ? `from ${formatUsd(bundleTotal([{ product: "cards", price: cardFrom }, { product: "poster", price: posterFrom }]).total)}`
        : "",
  };
  const cardArt = productImage(art, "cards", style);
  const posterArt = productImage(art, "poster", style);

  /** The category's picture: the card face, the poster, or both (the poster behind, the card in front). */
  const categoryMedia = (key: ProductCategory) => {
    if (key === "set") {
      return (
        <span data-product-media={cardArt || posterArt ? "art" : "neutral"} className="absolute inset-[6%] flex items-end justify-center gap-[4%]">
          <span className="relative block aspect-[3/4] h-full overflow-hidden">
            {posterArt ? <ArtImage image={posterArt} sizes={MEDIA_SIZES} /> : <NeutralArt shape="poster" className="h-full" />}
          </span>
          <span className="relative block aspect-[5/7] h-[82%] overflow-hidden shadow-[var(--shadow-card-stock)]">
            {cardArt ? <ArtImage image={cardArt} sizes={MEDIA_SIZES} /> : <NeutralArt shape="card" className="h-full" />}
          </span>
        </span>
      );
    }
    const image = key === "card" ? cardArt : posterArt;
    return (
      <span data-product-media={image ? "art" : "neutral"} className="absolute inset-[7%] flex items-center justify-center">
        {image ? <ArtImage image={image} sizes={MEDIA_SIZES} /> : <NeutralArt shape={key === "card" ? "card" : "poster"} className="h-full" />}
      </span>
    );
  };

  const categoryCard = (c: (typeof m.categories)[number]) => {
    const on = category === c.key;
    const id = `${FIELD_PREFIX}category-${c.key}`;
    return (
      <li key={c.key} data-category-card={c.key} className={card(on, Boolean(error))}>
        <label htmlFor={id} className="flex h-full cursor-pointer flex-col p-3 @xs:p-4">
          <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-hairline/60">
            {categoryMedia(c.key)}
            {on ? <Badge className="absolute right-2 top-2 z-10">{INTAKE_COPY.selectedBadge}</Badge> : null}
            {"badge" in c && c.badge && !on ? (
              <span className="absolute right-2 top-2 z-10 inline-flex h-6 items-center whitespace-nowrap rounded-pill bg-ink px-2.5 font-display text-[0.75rem] uppercase leading-none tracking-[0.06em] text-white">
                {c.badge}
              </span>
            ) : null}
          </span>
          <span className="mt-4 flex items-start gap-3">
            <input
              id={id}
              type="radio"
              name={`${FIELD_PREFIX}category`}
              value={c.key}
              checked={on}
              onChange={() => onCategory(c.key)}
              aria-labelledby={`${id}-name ${id}-from`}
              aria-describedby={[`${id}-blurb`, describedError].filter(Boolean).join(" ")}
              data-fp-invalid={error && c.key === "card" ? "" : undefined}
              className={`mt-0.5 ${RADIO}`}
            />
            <span id={`${id}-name`} className={NAME}>
              {c.name}
            </span>
          </span>
          <span id={`${id}-blurb`} className={BLURB}>
            {c.line}
          </span>
          <span id={`${id}-from`} className={FROM}>
            {fromOf[c.key]}
          </span>
        </label>
      </li>
    );
  };

  /** "More to make": the banner and the blanket as compact checkbox tiles, untouched by the category. */
  const moreTile = (product: ProductTileData) => {
    const chosen = state[product.key];
    const id = productId(product.key);
    const image = productImage(art, product.key, style);
    return (
      <li key={product.key} data-product-card="" className={card(chosen.selected, false)}>
        <label htmlFor={id} className="flex cursor-pointer items-center gap-4 p-3">
          <span className="relative block size-16 shrink-0 overflow-hidden rounded-[8px] bg-hairline/60">
            <span data-product-media={image ? "art" : "neutral"} className="absolute inset-[7%] flex items-center justify-center">
              {image ? <ArtImage image={image} sizes="64px" /> : <NeutralArt shape={SHAPE[product.key]} className={SHAPE[product.key] === "banner" ? "w-full" : "h-full"} />}
            </span>
          </span>
          <input
            id={id}
            type="checkbox"
            checked={chosen.selected}
            onChange={(e) => onToggle(product.key, e.target.checked)}
            aria-labelledby={`${id}-name ${id}-from`}
            aria-describedby={`${id}-blurb`}
            className={CHECK}
          />
          <span className="min-w-0 flex-1">
            <span id={`${id}-name`} className="block font-display text-[1.125rem] uppercase leading-none text-ink">
              {product.name}
            </span>
            <span id={`${id}-blurb`} className="mt-1 block font-body text-small text-muted-text">
              {product.blurb}
            </span>
          </span>
          <span id={`${id}-from`} className="shrink-0 font-label text-[0.875rem] font-semibold uppercase tracking-[0.04em] tabular-nums text-ink">
            {product.fromLabel}
          </span>
        </label>
      </li>
    );
  };

  /** The option rows of one chosen product (v8: behind "choose formats and sizes now"; the defaults carry otherwise). */
  const formats = (product: ProductTileData) => {
    const chosen = state[product.key];
    const id = productId(product.key);
    return (
      <fieldset key={product.key} data-product-options="" className="min-w-0 rounded-[20px] border border-hairline bg-white p-4">
        <legend className="px-1 font-display text-[1.125rem] uppercase leading-none text-ink">{UI.products.optionsLegend(product.name)}</legend>
        <ul className="mt-2">
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
        {/* Every option's description is in the page (each radio names its own); only the chosen one shows. */}
        <div data-product-detail="" className="mt-3">
          {product.options.map((o) => (
            <p key={o.key} id={`${id}-option-${o.key}-detail`} hidden={chosen.option !== o.key} className="max-w-[60ch] font-body text-small text-muted-text">
              {o.detail}
            </p>
          ))}
        </div>
      </fieldset>
    );
  };

  const selectedProducts = products.filter((p) => state[p.key].selected);
  return (
    <div>
      <FieldError id={errorId("products")} message={error} className="mb-6" />
      <fieldset className="min-w-0">
        <legend className="sr-only">{m.product}</legend>
        <ul className="grid items-stretch gap-y-4 md:grid-cols-3 md:gap-x-4">{m.categories.map(categoryCard)}</ul>
      </fieldset>
      <div data-more-products="" className="mt-6">
        <p className={KEY}>{m.more}</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">{products.filter((p) => p.key === "banner" || p.key === "blanket").map(moreTile)}</ul>
      </div>
      <div data-formats="" className="mt-6">
        <button
          type="button"
          aria-expanded={formatsOpen}
          aria-controls={`${FIELD_PREFIX}formats`}
          onClick={() => setFormatsOpen((o) => !o)}
          className="inline-flex min-h-11 items-center gap-2 font-body text-[0.9375rem] font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
        >
          <span aria-hidden="true" className={`inline-block transition-transform duration-hover ${formatsOpen ? "rotate-90" : ""}`}>
            ›
          </span>
          {m.formats}
        </button>
        <p className="mt-1 max-w-[60ch] font-body text-small text-muted-text">{m.formatsLine}</p>
        <div id={`${FIELD_PREFIX}formats`} hidden={!formatsOpen} className="mt-4 grid gap-4 md:grid-cols-2">
          {selectedProducts.length ? selectedProducts.map(formats) : <p className="font-body text-small text-muted-text">{INTAKE_COPY.summary.empty}</p>}
        </div>
      </div>
      <BundleLadder products={products} state={state} />
      <p data-more-than-one="" className="mt-2 max-w-[60ch] font-body text-small text-muted-text">
        {INTAKE_COPY.moreThanOne}
      </p>
      {/* Last in the step: the slot is as tall as its longest line, so any spare height falls into the step's own air. */}
      {note ? <ArtNote state={note.state} sport={note.sport} example={note.example} className="mt-6" /> : null}
    </div>
  );
}

/**
 * The bundle ladder (pricing v1, 2026-10-07): three rungs on one line, the reached rung on the accent (ink on
 * orange, 6.3 : 1 — never orange text), and one live line under it: before a choice what the ladder is; with
 * one to three products the next product and what it saves on top; with all four, the top rung. The figures
 * come from the model's bundle helpers over the prices the page handed over — nothing typed.
 */
function BundleLadder({ products, state }: { products: ProductTileData[]; state: Record<ProductKey, ProductState> }) {
  const b = INTAKE_COPY.bundle;
  const total = orderTotal(products, state);
  const reached = bundleStepIndex(total?.productCount ?? 0);
  const nudge = bundleNudge(products, state);
  const line = !total
    ? b.lead
    : nudge
      ? (nudge.first ? b.nudgeFirst : b.nudgeMore)(b.addName[nudge.add], formatUsd(nudge.saving))
      : b.top(formatPercent(total.discountRate));
  return (
    <div data-bundle-ladder="" className="mt-6 rounded-[20px] border border-hairline bg-white p-4 sm:p-5">
      <p className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">{b.title}</p>
      <ol className="mt-3 flex flex-wrap gap-2">
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
              {b.step(step.count, i === BUNDLE_STEPS.length - 1, formatPercent(step.percent / 100))}
            </li>
          );
        })}
      </ol>
      <p data-bundle-nudge="" aria-live="polite" className="mt-3 max-w-[60ch] font-body text-small font-medium text-pretty text-ink">
        {line}
      </p>
    </div>
  );
}
