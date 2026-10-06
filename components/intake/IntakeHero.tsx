import { INTAKE_COPY, INTAKE_PATH } from "../../lib/intake/copy";
import { Breadcrumbs } from "../Breadcrumbs";
import { PRIMARY_BUTTON_CLASS } from "../CtaPair";
import { ScrollLink } from "./ScrollLink";
import { UI } from "./strings";

export const HERO_TITLE_ID = "free-proof-title";
export const STEP_ONE_HREF = "#step-1";

/** The page's one big orange button (with the conversion card's submit): Anton on the accent, 56 px. */
export const HERO_CTA_CLASS = `inline-flex min-h-14 items-center justify-center rounded-ui px-8 py-3 text-center font-display text-[1.0625rem] uppercase leading-tight tracking-[0.04em] transition-[filter] duration-hover ease-out ${PRIMARY_BUTTON_CLASS}`;

/**
 * The landing hero of /free-proof (owner review 2026-10-04, point 1): the H1 stays the largest thing on
 * the page; under it ONE sentence, then the orange "Start my free proof →" that glides to step 1 (a plain
 * `#step-1` anchor without JavaScript), the small no-payment note, and the three claims as quiet type —
 * muted Barlow labels with no tick and no fill, so the page's orange stays on its two buttons.
 *
 * The H1 runs at 20ch rather than the recipe's 16ch: "FREE PROOF FIRST. PAY IF YOU LOVE IT." broke into
 * three lines at 16ch on a 1440 screen; at 20ch it sets as two, one sentence per line.
 */
export function IntakeHero() {
  return (
    <section aria-labelledby={HERO_TITLE_ID} className="pt-6 md:pt-10">
      <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: UI.breadcrumb, href: INTAKE_PATH }]} className="mb-6" />
      <h1 id={HERO_TITLE_ID} className="max-w-[20ch] font-display text-display uppercase text-balance">
        {INTAKE_COPY.h1}
      </h1>
      <p className="mt-5 max-w-[46ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub">{INTAKE_COPY.heroLine}</p>
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-start">
        <ScrollLink href={STEP_ONE_HREF} className={`${HERO_CTA_CLASS} w-full sm:w-auto`}>
          {INTAKE_COPY.heroCta}
        </ScrollLink>
        <p className="font-body text-small text-muted-text max-sm:text-center">{INTAKE_COPY.heroCtaNote}</p>
      </div>
      {/* One claim per line on a phone: wrapped inline, the middots fell at line ends (the TrustLine lesson, 2026-09-07). */}
      <ul className="mt-8 flex flex-col items-start gap-y-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
        {INTAKE_COPY.claims.map((claim, i) => (
          <li key={claim} className="flex items-center gap-3 font-label text-label font-semibold uppercase leading-none tracking-[0.12em] text-muted-text">
            {i > 0 ? (
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
            ) : null}
            <span>{claim}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The four how-it-works cards under the hero (owner review 2026-10-04, point 2): equal width, a big Anton
 * numeral, a two-word title and one line — 4 across from md, 2 × 2 on a phone. The numeral is decorative;
 * the `<ol>` carries the order for a screen reader.
 */
export function HowItWorks({ className = "" }: { className?: string }) {
  return (
    <ol aria-label={UI.howItWorks} className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 ${className}`.trim()}>
      {INTAKE_COPY.stepCards.map((card) => (
        <li key={card.n} className="flex min-w-0 flex-col rounded-[20px] border border-hairline bg-white p-4 sm:p-5 lg:p-6">
          <span aria-hidden="true" className="font-display text-[2.5rem] leading-none tabular-nums text-ink md:text-[3.25rem]">
            {card.n}
          </span>
          <p className="mt-4 font-body text-[1.0625rem] font-bold leading-snug text-ink md:mt-6">{card.title}</p>
          <p className="mt-1 max-w-[60ch] font-body text-small text-muted-text">{card.line}</p>
        </li>
      ))}
    </ol>
  );
}
