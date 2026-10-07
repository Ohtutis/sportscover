import { formatUsd, fromPrice } from "../../lib/catalog/prices";
import { INTAKE_COPY } from "../../lib/intake/copy";

/**
 * The three-beat strip under the hero (ads landing brief §3, 2026-10-07): upload → we create it → see it
 * first, one short sentence each, an arrow between them from `sm`. The price anchor the brief wanted under
 * the hero CTA lives in the third beat instead (owner, 2026-09-07: the price sits in the band under the
 * hero, never in it) — the cheapest digital edition, read from the ladder, never typed. Server-rendered.
 */
export function ProofStrip({ className = "" }: { className?: string }) {
  const from = formatUsd(fromPrice("cards"));
  return (
    <section data-proof-strip="" aria-label="How the free proof works, in three steps" className={`border-y border-hairline py-6 md:py-7 ${className}`.trim()}>
      <ol className="grid gap-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-start sm:gap-x-5">
        {INTAKE_COPY.strip.map((step, i) => {
          const line = typeof step.line === "function" ? step.line(from) : step.line;
          return (
            <li key={step.title} className="contents">
              {i > 0 ? (
                <span aria-hidden="true" className="hidden self-center font-display text-[1.5rem] leading-none text-ink/40 sm:block">
                  →
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="font-display text-[1.125rem] uppercase leading-none tracking-[0.02em] text-ink">
                  <span className="mr-2 text-muted-text">{i + 1}</span>
                  {step.title}
                </p>
                <p className="mt-2 max-w-[34ch] font-body text-small text-muted-text text-pretty">{line}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
