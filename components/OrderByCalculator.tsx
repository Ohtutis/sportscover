"use client";

import { useId, useState, type FormEvent } from "react";
import { formatEt, seniorNightPlan, type IsoDate, type PlanRow, type SeniorNightPlan } from "../lib/capacity";
import { LEAD_TIMES } from "../lib/catalog/delivery";
import { buttonClass } from "./ButtonLink";
import { PRIMARY_BUTTON_CLASS } from "./CtaPair";
import { Ledger } from "./Ledger";
import { StatusChip } from "./StatusChip";

/**
 * "When is senior night?" (COPY §2.5 (2), DESIGN §5.3-2): a date input → seniorNightPlan(night,
 * todayEt) (pure, lib/capacity.ts) → three result rows in a live region. `todayEt` comes from the
 * server so the island hydrates deterministically. The sealed-pack row renders only while its tier is
 * enabled (GAPS #29). The honest fallback un-hides the printable gift note (`#giftNoteId`) and prints.
 * The result CTA appends `&occasion=<date>` only to an /order link — the F1 Etsy link is unchanged.
 */
export interface OrderByCalculatorProps {
  todayEt: IsoDate;
  cta: { href: string; label: string };
  giftNoteId: string;
  className?: string;
}

import { CALC_COPY } from "../lib/copy/calc";

/** Re-exported so existing importers keep working; the strings themselves live on the server side. */
export const CALC_STRINGS = CALC_COPY;

const [digitalMin, digitalMax] = LEAD_TIMES.digitalBusinessDays;

export const fallbackSentence = (night: IsoDate): string =>
  `Nothing printed can arrive before ${formatEt(night, "medium")}. Order the digital files — they arrive first, in ${digitalMin}–${digitalMax} business days — and hand over a printed gift note on the night. The printed set follows after.`;

function rowText(row: PlanRow): string {
  const strings = CALC_STRINGS.rows[row.key];
  if (!row.fits) return strings.miss;
  return strings.fits(formatEt(row.key === "files" ? row.arrivesBy : row.orderBy, "medium"));
}

export function OrderByCalculator({ todayEt, cta, giftNoteId, className = "" }: OrderByCalculatorProps) {
  const id = useId();
  const [night, setNight] = useState("");
  const [plan, setPlan] = useState<SeniorNightPlan | null>(null);
  // The sealed pack row belongs on the Senior Night calculator: the Ultimate senior-night set sold on
  // Etsy includes the foil pack, and the page's chip promises its lead time. `GDE-ANY-CARD-PACK` is a
  // different product — the standalone pack, which the site does not sell — so it cannot gate this row.

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(night)) return;
    setPlan(seniorNightPlan(night, todayEt));
  }

  function giftFirst() {
    const note = document.getElementById(giftNoteId);
    if (note) note.hidden = false;
    window.print();
  }

  const rows = plan ? plan.rows : [];
  const ctaHref = plan && cta.href.startsWith("/order/") ? `${cta.href}${cta.href.includes("?") ? "&" : "?"}occasion=${encodeURIComponent(plan.night)}` : cta.href;

  return (
    <form onSubmit={onSubmit} className={className || undefined}>
      <label htmlFor={`${id}-date`} className="block font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
        {CALC_STRINGS.label}
      </label>
      <input
        id={`${id}-date`}
        name="night"
        type="date"
        min={todayEt}
        required
        value={night}
        onChange={(e) => setNight(e.target.value)}
        aria-describedby={`${id}-help`}
        className="mt-2 h-14 w-full rounded-ui border border-ink/40 bg-stock px-4 font-label text-[1rem] font-semibold uppercase tracking-[0.08em] text-ink focus:border-ink"
      />
      <p id={`${id}-help`} className="mt-2 font-body text-small text-muted-text">
        {CALC_STRINGS.help}
      </p>
      <button type="submit" className={buttonClass("bare", "md", `${PRIMARY_BUTTON_CLASS} mt-4 w-full sm:w-auto`)}>
        {CALC_STRINGS.button}
      </button>
      <output aria-live="polite" htmlFor={`${id}-date`} className="mt-6 block">
        {plan ? (
          <div>
            <Ledger
              rows={rows.map((row) => ({
                id: row.key,
                key: CALC_STRINGS.rows[row.key].key,
                value: (
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusChip status={row.fits ? "pass" : "fail"} />
                    <span>{rowText(row)}</span>
                  </span>
                ),
              }))}
            />
            {plan.anythingPrintedFits ? (
              <p className="mt-4">
                <a href={ctaHref} className={buttonClass("bare", "md", `${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`)}>
                  {cta.label}
                </a>
              </p>
            ) : (
              <div className="mt-4">
                <p className="max-w-[62ch] font-body text-body font-medium text-pretty text-ink">{fallbackSentence(plan.night)}</p>
                <button type="button" onClick={giftFirst} className={buttonClass("outline", "md", "mt-4 w-full sm:w-auto")}>
                  {CALC_STRINGS.giftButton}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </output>
    </form>
  );
}
