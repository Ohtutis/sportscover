import { INTAKE_COPY } from "../../lib/intake/copy";

const KEY = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";

/**
 * The six objections a cold visitor has, answered in one line each (ads brief §10, 2026-10-07): a ruled
 * grid of type — no icon cards, no fills, no shadows. Every line repeats a fact the canon already states.
 */
export function TrustGrid({ className = "" }: { className?: string }) {
  const c = INTAKE_COPY.trust;
  return (
    <section data-trust-grid="" aria-labelledby="trust-title" className={`py-4 md:py-6 ${className}`.trim()}>
      <div className="border-t border-hairline pt-3">
        <p className={KEY}>{c.label}</p>
      </div>
      <h2 id="trust-title" className="mt-6 max-w-[18ch] font-display text-h2 uppercase text-balance">
        {c.title}
      </h2>
      <ul className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
        {c.items.map((item) => (
          <li key={item.title} className="border-t border-ink/15 pt-4">
            <p className="font-display text-[1.125rem] uppercase leading-none tracking-[0.02em] text-ink">{item.title}</p>
            <p className="mt-2 max-w-[36ch] font-body text-small text-muted-text text-pretty">{item.line}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
