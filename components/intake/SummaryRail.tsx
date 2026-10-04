import { sportBySlug, isNumberless } from "../../lib/catalog/sports";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { PRICE_ON_PROOF, type ProductKey } from "../../lib/intake/products";
import { STYLE_RECOMMEND, type StyleChoice } from "../../lib/intake/types";
import { ProofPath } from "./ProofPath";
import type { AthleteState, ProductState } from "./model";
import type { ProductTileData } from "./ProductPicker";
import type { StyleTileData } from "./StylePicker";
import { UI } from "./strings";

export interface SummaryProps {
  products: ProductTileData[];
  state: Record<ProductKey, ProductState>;
  styles: StyleTileData[];
  style: StyleChoice | "";
  athlete: AthleteState;
  photoCount: number;
  setLine: string;
}

interface Line {
  key: string;
  product: string;
  option: string;
  quantity: number;
  price: string;
}

function lines({ products, state }: Pick<SummaryProps, "products" | "state">): Line[] {
  return products
    .filter((p) => state[p.key].selected)
    .map((p) => {
      const o = p.options.find((x) => x.key === state[p.key].option) ?? p.options[0];
      return { key: p.key, product: p.name, option: o.label, quantity: o.printed ? state[p.key].quantity : 1, price: o.priceLabel };
    });
}

function styleName({ styles, style }: Pick<SummaryProps, "styles" | "style">): string | null {
  if (!style) return null;
  if (style === STYLE_RECOMMEND) return UI.summary.recommend;
  return styles.find((s) => s.code === style)?.name ?? null;
}

function athleteLine(athlete: AthleteState): string | null {
  const name = [athlete.firstName.trim(), athlete.lastName.trim()].filter(Boolean).join(" ");
  const sport = sportBySlug(athlete.sportSlug);
  const number = sport && !isNumberless(sport) && athlete.jerseyNumber ? `#${athlete.jerseyNumber}` : "";
  const parts = [name, sport?.name ?? "", number].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

const KEY = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";

/**
 * "Your request" — what the parent has chosen so far, read back in plain words, with the option's own
 * price label (never a computed total: cards and a poster together are priced as a set, and the proof
 * confirms the rest). `rail` is the sticky right column at lg; `bar` is the compact block that sits
 * above the submit button below lg — in the flow, never a fixed overlay over the inputs.
 */
export function SummaryRail(props: SummaryProps & { variant: "rail" | "bar"; className?: string }) {
  const { variant, className = "", photoCount, setLine } = props;
  const items = lines(props);
  const style = styleName(props);
  const athlete = athleteLine(props.athlete);
  const both = items.some((l) => l.key === "cards") && items.some((l) => l.key === "poster");
  const photos = UI.photos.count(photoCount);

  if (variant === "bar") {
    return (
      <div className={`rounded-ui border border-hairline bg-stock p-4 ${className}`.trim()}>
        <p className="font-body text-[1rem] font-bold text-ink">{INTAKE_COPY.summaryTitle}</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-body text-small">
          <dt className={`${KEY} pt-0.5`}>{UI.summary.products}</dt>
          <dd className="text-ink">
            {items.length ? items.map((l) => `${l.product} · ${l.option}${l.quantity > 1 ? ` × ${l.quantity}` : ""}`).join(", ") : <span className="text-muted-text">{UI.summary.nothing}</span>}
          </dd>
          <dt className={`${KEY} pt-0.5`}>{UI.summary.style}</dt>
          <dd className="text-ink">{style ?? <span className="text-muted-text">{UI.summary.nothing}</span>}</dd>
          <dt className={`${KEY} pt-0.5`}>{UI.summary.photos}</dt>
          <dd className="tabular-nums text-ink">{photos}</dd>
        </dl>
        <div className="mt-4 border-t border-hairline pt-4">
          <p className={KEY}>{UI.summary.next}</p>
          <ProofPath variant="compact" current={1} className="mt-2" />
        </div>
      </div>
    );
  }

  return (
    <aside aria-labelledby="fp-summary-title" className={`rounded-ui border border-hairline bg-stock ${className}`.trim()}>
      <div className="p-5">
        <h2 id="fp-summary-title" className="font-display text-h3 uppercase text-ink">
          {INTAKE_COPY.summaryTitle}
        </h2>
        <dl className="mt-4 flex flex-col gap-4 font-body text-small">
          <div>
            <dt className={KEY}>{UI.summary.products}</dt>
            <dd className="mt-1.5">
              {items.length ? (
                <ul className="flex flex-col gap-2">
                  {items.map((l) => {
                    const priced = l.price !== PRICE_ON_PROOF;
                    return (
                      <li key={l.key}>
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="min-w-0 text-ink">
                            <span className="font-bold">{l.product}</span> · {l.option}
                            {l.quantity > 1 ? <span className="tabular-nums"> × {l.quantity}</span> : null}
                          </span>
                          {priced ? (
                            <span className="shrink-0 text-right font-label text-[0.8125rem] font-semibold uppercase tracking-[0.04em] tabular-nums text-ink">
                              {l.price}
                              {l.quantity > 1 ? <span className="block normal-case text-muted-text">{UI.summary.each}</span> : null}
                            </span>
                          ) : null}
                        </span>
                        {/* The on-proof wording is a sentence, not a figure: it reads under the line, never squeezed into the price column. */}
                        {priced ? null : <span className="mt-0.5 block text-muted-text">{l.price}</span>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="text-muted-text">{UI.summary.nothing}</span>
              )}
              {both && setLine ? <p className="mt-2 text-muted-text">{setLine}</p> : null}
            </dd>
          </div>
          <div>
            <dt className={KEY}>{UI.summary.style}</dt>
            <dd className="mt-1 text-ink">{style ?? <span className="text-muted-text">{UI.summary.nothing}</span>}</dd>
          </div>
          <div>
            <dt className={KEY}>{UI.summary.athlete}</dt>
            <dd className="mt-1 text-ink">{athlete ?? <span className="text-muted-text">{UI.summary.notYet}</span>}</dd>
          </div>
          <div>
            <dt className={KEY}>{UI.summary.photos}</dt>
            <dd className="mt-1 tabular-nums text-ink">{photos}</dd>
          </div>
        </dl>
      </div>
      <div className="border-t border-hairline p-5">
        <p className={KEY}>{UI.summary.next}</p>
        <ProofPath variant="compact" current={1} className="mt-3" />
        <p className="mt-4 font-body text-small font-medium text-ink">{INTAKE_COPY.noPayment}</p>
      </div>
    </aside>
  );
}
