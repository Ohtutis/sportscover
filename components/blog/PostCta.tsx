import { CtaPair } from "../CtaPair";
import { TrustLine } from "../TrustLine";
import { ctaFor, type CtaContext, type CtaOptions } from "../../lib/cta";
import { INTAKE_COPY } from "../../lib/intake/copy";

/** The contexts a post can hand on: never the header's pair, never a card page's. */
export type PostCtaContext = Exclude<CtaContext, "header" | "card-page">;

export interface PostCtaProps {
  /** Which page's pair this post closes with (the prefill follows it — D29). Default: the home pair. */
  context?: PostCtaContext;
  options?: CtaOptions;
}

/**
 * The one CTA a post carries, at its end (master plan §7.5): the free-proof heading and line from
 * INTAKE_COPY, the pair from `ctaFor()` — so the post switches mode with the rest of the site in one
 * flag — and the TrustLine as the last element of the block (DESIGN §4.3). `data-post-cta` lets the
 * tests count it.
 */
export function PostCta({ context = "home", options }: PostCtaProps) {
  const cta = ctaFor(context, options);
  return (
    <section data-post-cta="" aria-labelledby="post-cta-heading" className="mt-16 border-t border-hairline pt-6">
      <h2 id="post-cta-heading" className="max-w-[20ch] font-display text-h2 uppercase text-balance text-ink">
        {INTAKE_COPY.h1}
      </h2>
      <p className="mt-4 max-w-[44ch] font-body text-[1.125rem] font-bold text-pretty text-ink md:text-sub">{INTAKE_COPY.noPayment}</p>
      <CtaPair primary={cta.primary} secondary={cta.secondary} size="lg" className="mt-8" />
      <TrustLine className="mt-4" />
    </section>
  );
}
