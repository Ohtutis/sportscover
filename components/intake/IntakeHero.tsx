import type { FreeProofArtMap } from "../../lib/intake/sport-art";
import { INTAKE_COPY, INTAKE_PATH } from "../../lib/intake/copy";
import { Breadcrumbs } from "../Breadcrumbs";
import { PRIMARY_BUTTON_CLASS } from "../CtaPair";
import { ScrollLink } from "./ScrollLink";
import { HeroVisual } from "./SportVisuals";
import { UI } from "./strings";

export const HERO_TITLE_ID = "free-proof-title";
/** Where the hero CTA, the closing CTA and the sticky bar glide to: the form's own heading (app/(marketing)/free-proof/_shared/view.tsx). */
export const FORM_HREF = "#create";
/** Kept for the pages that deep-link straight to the first step. */
export const STEP_ONE_HREF = "#step-1";

/** The page's one big orange button (with the conversion card's submit): Anton on the accent, 56 px. */
export const HERO_CTA_CLASS = `inline-flex min-h-14 items-center justify-center rounded-ui px-8 py-3 text-center font-display text-[1.0625rem] uppercase leading-tight tracking-[0.04em] transition-[filter] duration-hover ease-out ${PRIMARY_BUTTON_CLASS}`;

/**
 * The landing hero of /free-proof — v8 (the ads landing brief, 2026-10-07): the page a Facebook ad lands on
 * sells the RESULT first. Two columns from `lg`, 6 / 6 like the home hero. Left: the eyebrow ("Free custom
 * proof" — the mechanism), the H1 ("Turn their photos into their own sports collectible." — the result, three
 * lines at 19ch), ONE sentence (what to send, what comes back), the orange "Create my free proof →" that
 * glides to the form (`FORM_HREF`, a plain anchor without JavaScript), and three quiet trust lines — muted
 * Barlow labels with no tick and no fill, so the page's orange stays on its buttons. Right: the exhibit
 * (`HeroVisual`, components/intake/SportVisuals.tsx — your photos → their edition under one PROOF stamp)
 * with the nine-word line under it. No price here (owner, 2026-09-07: prices sit in the band under the hero)
 * and nothing to choose (owner, 2026-10-07). Below `lg` the visual follows the copy, full width up to 560 px.
 */
export function IntakeHero({ art, example }: { art: FreeProofArtMap; example?: string }) {
  return (
    <section aria-labelledby={HERO_TITLE_ID} className="pt-6 md:pt-10">
      <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: UI.breadcrumb, href: INTAKE_PATH }]} className="mb-6" />
      <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
        <div className="lg:col-span-6">
          <p data-hero-eyebrow="" className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
            {INTAKE_COPY.eyebrow}
          </p>
          <h1 id={HERO_TITLE_ID} className="mt-4 max-w-[19ch] font-display text-display uppercase text-balance">
            {INTAKE_COPY.h1}
          </h1>
          <p className="mt-5 max-w-[46ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub">{INTAKE_COPY.heroLine}</p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-start">
            <ScrollLink href={FORM_HREF} className={`${HERO_CTA_CLASS} w-full sm:w-auto`}>
              {INTAKE_COPY.heroCta}
            </ScrollLink>
          </div>
          {/* One claim per line on a phone: wrapped inline, the middots fell at line ends (the TrustLine lesson, 2026-09-07). */}
          <ul className="mt-6 flex flex-col items-start gap-y-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
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
        </div>
        <div className="mt-12 lg:col-span-6 lg:mt-0">
          <HeroVisual art={art} example={example} />
        </div>
      </div>
    </section>
  );
}
