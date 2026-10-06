"use client";

import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { DUE_TODAY_LABEL, formatPercent, formatUsd, type BundleTotal } from "../../lib/catalog/prices";
import { INTAKE_COPY } from "../../lib/intake/copy";
import type { ProductKey } from "../../lib/intake/products";
import type { FreeProofImage, FreeProofSportArt } from "../../lib/intake/sport-art";
import { STYLE_RECOMMEND, type StyleChoice } from "../../lib/intake/types";
import { FictionalLabel } from "../FictionalLabel";
import { CheckIcon } from "../icons";
import { athleteStore, cardImage, orderTotal, previewAlign, previewFinish, previewText, type AthleteState, type ProductState } from "./model";
import type { ProductTileData } from "./ProductPicker";
import type { StyleTileData } from "./StylePicker";
import { UI } from "./strings";
import { ArtImage, NeutralArt } from "./visuals";

export interface SummaryProps {
  products: ProductTileData[];
  state: Record<ProductKey, ProductState>;
  styles: StyleTileData[];
  style: StyleChoice | "";
  /** The chosen sport's art: the preview is its card in the chosen finish, or the grey card in that finish's frame. */
  art?: FreeProofSportArt | null;
  /** The chosen sport as a person reads it ("Volleyball", "Other: rowing"), or null before a choice. */
  sport?: string | null;
  /**
   * What the parent typed in step 3. Optional: without it the panel reads the form's athlete from the
   * shared store in model.ts, which step 3 writes on every change (so the form need not re-plumb it).
   */
  athlete?: AthleteState | null;
}

interface Line {
  key: string;
  product: string;
  option: string;
}

function lines({ products, state }: Pick<SummaryProps, "products" | "state">): Line[] {
  return products
    .filter((p) => state[p.key]?.selected)
    .map((p) => {
      const o = p.options.find((x) => x.key === state[p.key].option) ?? p.options[0];
      return { key: p.key, product: p.name, option: o.label };
    });
}

function chosenStyle({ styles, style }: Pick<SummaryProps, "styles" | "style">): { name: string } | null {
  if (!style) return null;
  if (style === STYLE_RECOMMEND) return { name: UI.summary.recommend };
  const s = styles.find((x) => x.code === style);
  return s ? { name: s.name } : null;
}

const KEY = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";
/** The panel (owner review 2026-10-04, point 16): a hairline, the stock card shadow, 20 px corners, white on the stock page. */
const PANEL = "rounded-[20px] border border-hairline bg-white shadow-[var(--shadow-card-stock)]";

/** Anton's average uppercase advance is ~0.5 em: a name of `n` letters fits 86 % of the card at 172 / n cqw — capped at the card's own size. */
const fit = (text: string, cap: number): CSSProperties => ({ fontSize: `${Math.min(cap, 172 / Math.max(text.length, 1)).toFixed(2)}cqw` });

export interface CardTextPreviewProps {
  /** The chosen sport's card front in the chosen finish (the art map), or null — the grey card in that finish's frame. */
  image: FreeProofImage | null;
  athlete: AthleteState | null;
  style: StyleChoice | "";
  sizes: string;
  className?: string;
}

/**
 * The live mockup (owner, 2026-10-06 — it overrides the spec's old "no live typographic render" line for
 * this form): the chosen finish's example front with what the parent has typed set over its lower part,
 * on a dark gradient that leaves the athletes above it visible and goes solid by 73 % of the card height,
 * where every finish prints its own name block — the example's name never shows through. LAST NAME
 * large in Anton, the first name above it smaller, `#number` for the sports that wear one, `position ·
 * team` in Barlow, and the class year for Senior Night. Centred for Chrome All-Star and Heritage, flush
 * left for the rest — how each finish sets its name block. The site's own faces: the per-finish pairs
 * load only on /c. Nothing typed → nothing drawn: no placeholder name ever, the front stays the example
 * with its C13. Every size is a share of the card (`cqw`), so the rail and the phone bar draw the same
 * card at two sizes; long names shrink, they never get cut.
 */
export function CardTextPreview({ image, athlete, style, sizes, className = "" }: CardTextPreviewProps) {
  const text = athlete ? previewText(athlete, style) : null;
  const finish = previewFinish(style);
  const align = previewAlign(finish);
  const meta = text ? [text.number, text.meta].filter(Boolean).join(" · ") : "";
  return (
    <div data-card-preview="" className={`@container relative aspect-[5/7] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)] ${className}`.trim()}>
      {image ? <ArtImage image={image} sizes={sizes} /> : <NeutralArt shape="card" finish={style ? finish : undefined} className="absolute! inset-0 h-full w-full" />}
      {text ? (
        <div
          data-preview-text=""
          data-align={align}
          className={`absolute inset-x-0 bottom-0 top-[40%] flex flex-col justify-end bg-linear-to-b from-transparent via-arena/75 via-28% to-arena to-55% px-[8%] pb-[9%] text-white ${
            align === "center" ? "items-center text-center" : "items-start text-left"
          }`}
        >
          {text.first ? (
            <p className="max-w-full font-display uppercase leading-none tracking-[0.01em]" style={fit(text.first, 6.5)}>
              {text.first}
            </p>
          ) : null}
          {text.last ? (
            <p className="mt-[1.5cqw] max-w-full font-display uppercase leading-[0.92]" style={fit(text.last, 13)}>
              {text.last}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-[3cqw] max-w-full font-label text-[5.5cqw] font-semibold uppercase leading-[1.15] tracking-[0.08em] text-white/90">{meta}</p>
          ) : null}
          {text.classLine ? (
            <p className="mt-[2cqw] font-label text-[5cqw] font-semibold uppercase leading-none tracking-[0.12em] text-gold">{text.classLine}</p>
          ) : null}
        </div>
      ) : null}
      {/* C13 stays on the card image — top-right, clear of the name block. Every art-map picture is a fictional athlete. */}
      {image ? <FictionalLabel inFrame compact className="top-2! right-2! bottom-auto! left-auto!" /> : null}
    </div>
  );
}

function ChoiceList({ items, style, sport }: { items: Line[]; style: { name: string } | null; sport: string | null }) {
  return (
    <ul className="flex min-w-0 flex-col gap-2.5 font-body text-small">
      {sport ? (
        <li className="min-w-0">
          <span className="block font-bold text-ink">{UI.summary.sport}</span>
          <span className="block text-muted-text">{sport}</span>
        </li>
      ) : null}
      {items.map((l) => (
        <li key={l.key} className="min-w-0">
          <span className="block font-bold text-ink">{l.product}</span>
          <span className="block text-muted-text">{l.option}</span>
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
 * The figures under "Today" (pricing v1, 2026-10-07), all from prices.ts `bundleTotal` through the model:
 * one product → "After approval" and its price; two or more → "Bought separately" struck through, "Bundle
 * saving −$X (15%)" with the figure on the accent (ink on orange — never orange text), then "After approval"
 * and the bundle total. The comparison is the same items bought separately, never a former price.
 */
function Figures({ total }: { total: BundleTotal }) {
  const s = INTAKE_COPY.summary;
  const bundled = total.discountRate > 0;
  return (
    <>
      {bundled ? (
        <>
          <div data-summary-separately="" className="flex items-baseline justify-between gap-4">
            <dt className={KEY}>{s.separately}</dt>
            <dd className="font-label text-[1rem] font-semibold tabular-nums text-muted-text">
              <s>{formatUsd(total.alaCarte)}</s>
            </dd>
          </div>
          {/* gap-3 and a 14 px chip: the label and the largest saving the ladder can give share one line in the 280 px rail. */}
          <div data-summary-saving="" className="flex items-baseline justify-between gap-3">
            <dt className={`${KEY} whitespace-nowrap`}>{s.bundleSaving}</dt>
            <dd>
              <span className="inline-flex h-6 items-center whitespace-nowrap rounded-pill bg-accent px-2 font-label text-[0.875rem] font-semibold tabular-nums text-ink">
                {s.savingValue(formatUsd(total.discount), formatPercent(total.discountRate))}
              </span>
            </dd>
          </div>
        </>
      ) : null}
      <div data-summary-total="" className="flex items-baseline justify-between gap-4">
        <dt className={KEY}>{s.afterApproval}</dt>
        <dd className="font-label text-[1.125rem] font-semibold tabular-nums text-ink">{formatUsd(total.total)}</dd>
      </div>
    </>
  );
}

/**
 * "Your order" (owner review 2026-10-04, points 15–16; 2026-10-06) — what the parent has chosen, read back
 * in plain words: the live text preview on the chosen sport's card in the chosen finish (Stadium Night
 * until one is chosen; the grey card before a sport — v4, never another sport's athlete), its caption, the
 * sport, product · option lines and the style, a rule, "Today" with the zero-due figure (prices.ts
 * DUE_TODAY_LABEL, the one dollar literal the site may show), the bundle figures (Figures: bought
 * separately struck, the bundle saving, "After approval" — one of each chosen option, priced by
 * prices.ts bundleTotal) and the three promises with their ticks. `rail` is the sticky right column at lg; `bar` is the compact block above the conversion
 * card below lg — in the flow, never an overlay — with the same mockup at 120 px beside the choices.
 */
export function SummaryRail(props: SummaryProps & { variant: "rail" | "bar"; className?: string }) {
  const { variant, className = "", products, state, style: styleChoice, art = null, sport = null } = props;
  const shared = useSyncExternalStore(athleteStore.subscribe, athleteStore.get, athleteStore.getServer);
  const athlete = props.athlete === undefined ? shared : props.athlete;
  const items = lines(props);
  const style = chosenStyle(props);
  const total = orderTotal(products, state);
  const front = cardImage(art, previewFinish(styleChoice));
  const s = INTAKE_COPY.summary;
  const titleId = variant === "rail" ? "fp-summary-title" : "fp-summary-bar-title";

  const after = total ? <Figures total={total} /> : null;
  const caption = <p className="mt-3 max-w-[60ch] font-body text-small text-muted-text">{INTAKE_COPY.previewCaption}</p>;

  if (variant === "bar") {
    return (
      <section aria-labelledby={titleId} className={`${PANEL} p-5 ${className}`.trim()}>
        <h2 id={titleId} className="font-display text-h3 uppercase text-ink">
          {s.title}
        </h2>
        {/* The same mockup as the rail at 120 px — at 320 px wide the choices still get 104 px beside it. */}
        <div className="mt-4 flex items-start gap-4">
          <div className="w-[7.5rem] shrink-0">
            <CardTextPreview image={front} athlete={athlete} style={styleChoice} sizes="120px" />
          </div>
          <div className="min-w-0 flex-1">
            {items.length || style || sport ? <ChoiceList items={items} style={style} sport={sport} /> : <p className="font-body text-small text-muted-text">{s.empty}</p>}
          </div>
        </div>
        {caption}
        {after ? <dl className="mt-4 flex flex-col gap-2 border-t border-hairline pt-3">{after}</dl> : null}
      </section>
    );
  }

  return (
    <aside aria-labelledby={titleId} className={`${PANEL} ${className}`.trim()}>
      <div className="p-6">
        <h2 id={titleId} className="font-display text-h3 uppercase text-ink">
          {s.title}
        </h2>
        <div className="mt-5">
          {/* 192 px: the name reads at 25 px; any wider and the sticky rail outgrows a 900 px screen sooner. */}
          <div className="mx-auto w-full max-w-[12rem]">
            <CardTextPreview image={front} athlete={athlete} style={styleChoice} sizes="192px" />
          </div>
          {caption}
        </div>
        <div className="mt-5">{items.length || style || sport ? <ChoiceList items={items} style={style} sport={sport} /> : <p className="font-body text-small text-muted-text">{s.empty}</p>}</div>
        <dl className="mt-5 flex flex-col gap-2 border-t border-hairline pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <dt className={KEY}>{s.today}</dt>
            <dd className="font-display text-price tabular-nums text-ink">{DUE_TODAY_LABEL}</dd>
          </div>
          {after}
        </dl>
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
