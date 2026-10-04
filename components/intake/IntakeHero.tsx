import { Fragment } from "react";
import { INTAKE_COPY, INTAKE_PATH } from "../../lib/intake/copy";
import { Breadcrumbs } from "../Breadcrumbs";
import { Pill } from "../Pill";
import { ProofPath } from "./ProofPath";
import { UI } from "./strings";

export const HERO_TITLE_ID = "free-proof-title";

/**
 * The stock hero of /free-proof (DESIGN §2.5, D12): H1 → subhead → the three claims as TYPE (`Pill
 * variant="label"`, the first one the page's single accent claim) → the four steps, which are the only
 * "how it works" a parent reads before the form. No CTA here: the form starts directly under it.
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
      <p className="mt-4 max-w-[52ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub">{INTAKE_COPY.subhead}</p>
      {/* One claim per line on a phone: wrapped inline, the middots fell at line ends and the three
          claims read as one sentence with punctuation adrift (the TrustLine lesson, 2026-09-07). */}
      <ul className="mt-stack flex flex-col items-start gap-y-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
        {INTAKE_COPY.claims.map((claim, i) => (
          <Fragment key={claim}>
            {i > 0 ? (
              <li aria-hidden="true" className="hidden font-label text-label font-semibold leading-none text-muted-text sm:block">
                ·
              </li>
            ) : null}
            <Pill as="li" variant="label" tone={i === 0 ? "accent" : "outline"}>
              {claim}
            </Pill>
          </Fragment>
        ))}
      </ul>
      <ProofPath current={1} className="mt-10 md:mt-12" />
    </section>
  );
}
