import { INTAKE_COPY } from "../../lib/intake/copy";
import { FORM_HREF, HERO_CTA_CLASS } from "./IntakeHero";
import { ScrollLink } from "./ScrollLink";

/**
 * The closing (ads brief §13, 2026-10-07): the one line that sums the offer, in the display face on the dark
 * surface, one sentence, and the same orange CTA gliding back up to the form — never a second form.
 */
export function FinalCta({ className = "" }: { className?: string }) {
  const c = INTAKE_COPY.finalCta;
  return (
    <section data-final-cta="" aria-labelledby="final-cta-title" className={`py-16 md:py-20 lg:py-24 ${className}`.trim()}>
      <div data-surface="arena" className="rounded-[20px] bg-arena px-6 py-10 text-white sm:px-10 md:py-14 lg:px-16 lg:py-16">
        <h2 id="final-cta-title" className="max-w-[16ch] font-display text-display uppercase text-balance">
          {c.title}
        </h2>
        <p className="mt-5 max-w-[46ch] font-body text-[1.125rem] font-bold text-pretty text-arena-muted md:text-sub">{c.line}</p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-start">
          <ScrollLink href={FORM_HREF} className={`${HERO_CTA_CLASS} w-full sm:w-auto`}>
            {INTAKE_COPY.heroCta}
          </ScrollLink>
          <p className="font-label text-label font-semibold uppercase tracking-[0.12em] text-arena-muted max-sm:text-center">{c.note}</p>
        </div>
      </div>
    </section>
  );
}
