import Image from "next/image";
import type { ImageSpec } from "../../lib/assets";
import { DUE_TODAY_LABEL, formatUsd } from "../../lib/catalog/prices";
import { INTAKE_COPY } from "../../lib/intake/copy";
import type { ProductKey } from "../../lib/intake/products";
import { STYLE_RECOMMEND, type StyleChoice } from "../../lib/intake/types";
import { FictionalLabel } from "../FictionalLabel";
import { CheckIcon } from "../icons";
import { orderTotal, type ProductState, type SetCombo } from "./model";
import type { ProductTileData } from "./ProductPicker";
import type { StyleTileData } from "./StylePicker";
import { UI } from "./strings";

export interface SummaryProps {
  products: ProductTileData[];
  state: Record<ProductKey, ProductState>;
  styles: StyleTileData[];
  style: StyleChoice | "";
  setCombos: readonly SetCombo[];
}

interface Line {
  key: string;
  product: string;
  option: string;
  quantity: number;
}

function lines({ products, state }: Pick<SummaryProps, "products" | "state">): Line[] {
  return products
    .filter((p) => state[p.key]?.selected)
    .map((p) => {
      const o = p.options.find((x) => x.key === state[p.key].option) ?? p.options[0];
      return { key: p.key, product: p.name, option: o.label, quantity: o.printed ? state[p.key].quantity : 1 };
    });
}

function chosenStyle({ styles, style }: Pick<SummaryProps, "styles" | "style">): { name: string; image: ImageSpec | null } | null {
  if (!style) return null;
  if (style === STYLE_RECOMMEND) return { name: UI.summary.recommend, image: null };
  const s = styles.find((x) => x.code === style);
  return s ? { name: s.name, image: s.image } : null;
}

const KEY = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";
/** The panel (owner review 2026-10-04, point 16): a hairline, the stock card shadow, 20 px corners, white on the stock page. */
const PANEL = "rounded-[20px] border border-hairline bg-white shadow-[var(--shadow-card-stock)]";

/** The mini preview: the chosen finish's card front, else the first chosen product's tile; C13 sits in the frame. */
function Preview({ image, card }: { image: ImageSpec; card: boolean }) {
  return (
    <div className={`relative w-28 shrink-0 overflow-hidden ${card ? "aspect-[5/7] shadow-[var(--shadow-card-stock)]" : "aspect-square rounded-[10px]"}`}>
      <Image src={image.src} alt={image.alt} fill sizes="112px" className={card ? "object-contain" : "object-cover"} />
      {image.fictional ? <FictionalLabel inFrame compact className="bottom-1.5! left-1.5!" /> : null}
    </div>
  );
}

function ChoiceList({ items, style }: { items: Line[]; style: { name: string } | null }) {
  return (
    <ul className="flex min-w-0 flex-col gap-2.5 font-body text-small">
      {items.map((l) => (
        <li key={l.key} className="min-w-0">
          <span className="block font-bold text-ink">{l.product}</span>
          <span className="block text-muted-text">
            {l.option}
            {l.quantity > 1 ? <span className="tabular-nums"> × {l.quantity}</span> : null}
          </span>
        </li>
      ))}
      {style ? (
        <li className="min-w-0">
          <span className="block font-bold text-ink">{UI.summary.style}</span>
          <span className="block text-muted-text">{style.name}</span>
        </li>
      ) : null}
    </ul>
  );
}

/**
 * "Your order" (owner review 2026-10-04, points 15–16) — what the parent has chosen, read back in plain
 * words: product · option lines and the style, a rule, "Today" with the zero-due figure (prices.ts
 * DUE_TODAY_LABEL, the one dollar literal the site may show), "After approval" with the sum of the chosen
 * priced options (sitePrice × quantity, the set price when cards + poster are a set tier) — or "confirmed
 * with your proof" when any choice has no price yet — and the three promises with their ticks. A mini
 * preview shows the chosen finish (or the first chosen product). `rail` is the sticky right column at lg;
 * `bar` is the compact block above the conversion card below lg — in the flow, never an overlay.
 */
export function SummaryRail(props: SummaryProps & { variant: "rail" | "bar"; className?: string }) {
  const { variant, className = "", products, state, setCombos } = props;
  const items = lines(props);
  const style = chosenStyle(props);
  const total = orderTotal(products, state, setCombos);
  const firstProduct = products.find((p) => state[p.key]?.selected && p.image);
  const preview: { image: ImageSpec; card: boolean } | null = style?.image
    ? { image: style.image, card: true }
    : firstProduct?.image
      ? { image: firstProduct.image, card: false }
      : null;
  const s = INTAKE_COPY.summary;
  const titleId = variant === "rail" ? "fp-summary-title" : "fp-summary-bar-title";

  const after =
    total.kind === "empty" ? null : (
      <div className="flex items-baseline justify-between gap-4">
        <dt className={KEY}>{s.afterApproval}</dt>
        <dd className={total.kind === "priced" ? "font-label text-[1.125rem] font-semibold tabular-nums text-ink" : "max-w-[14rem] text-right font-body text-small text-ink"}>
          {total.kind === "priced" ? formatUsd(total.total) : s.onProof}
        </dd>
      </div>
    );

  if (variant === "bar") {
    return (
      <section aria-labelledby={titleId} className={`${PANEL} p-5 ${className}`.trim()}>
        <h2 id={titleId} className="font-display text-h3 uppercase text-ink">
          {s.title}
        </h2>
        <div className="mt-4">{items.length || style ? <ChoiceList items={items} style={style} /> : <p className="font-body text-small text-muted-text">{s.empty}</p>}</div>
        {after ? <dl className="mt-4 border-t border-hairline pt-3">{after}</dl> : null}
        {total.kind === "priced" && total.set ? <p className="mt-1 font-body text-small text-muted-text">{UI.summary.setPriced}</p> : null}
      </section>
    );
  }

  return (
    <aside aria-labelledby={titleId} className={`${PANEL} ${className}`.trim()}>
      <div className="p-6">
        <h2 id={titleId} className="font-display text-h3 uppercase text-ink">
          {s.title}
        </h2>
        {preview ? (
          <div className="mt-5">
            <Preview image={preview.image} card={preview.card} />
          </div>
        ) : null}
        <div className="mt-5">{items.length || style ? <ChoiceList items={items} style={style} /> : <p className="font-body text-small text-muted-text">{s.empty}</p>}</div>
        <dl className="mt-5 flex flex-col gap-2 border-t border-hairline pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <dt className={KEY}>{s.today}</dt>
            <dd className="font-display text-price tabular-nums text-ink">{DUE_TODAY_LABEL}</dd>
          </div>
          {after}
        </dl>
        {total.kind === "priced" && total.set ? <p className="mt-1 font-body text-small text-muted-text">{UI.summary.setPriced}</p> : null}
        <ul className="mt-5 flex flex-col gap-2.5 border-t border-hairline pt-4 font-body text-small text-ink">
          {s.checks.map((check) => (
            <li key={check} className="flex items-center gap-2.5">
              <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center rounded-full bg-accent text-ink">
                <CheckIcon size={13} strokeWidth={2.5} />
              </span>
              <span>{check}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
