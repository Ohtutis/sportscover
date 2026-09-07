import { CtaPair } from "../../../../components/CtaPair";
import { FaqList } from "../../../../components/FaqList";
import { FourFears } from "../../../../components/FourFears";
import { TrustLine } from "../../../../components/TrustLine";
import { block } from "../../../../lib/blocks";
import { faqSubset } from "../../../../lib/catalog/faq";
import type { CtaPairProps } from "../../../../lib/cta";
import { sectionIndex } from "./section";

/**
 * Section 07 — the four canon blocks, the six-question FAQ subset with its FAQPage markup (exactly the
 * items rendered, one per page — CONTRACTS §3), and the closing CTA block: pair → "Still deciding?"
 * strip → TrustLine, which is always the last element of a CTA block (DESIGN §4.3). The delivery chips
 * are claimed once per page, in the hero, so they are not repeated here.
 */
export const CANON_BLOCKS = [
  { id: "our-promise", title: "Our promise" },
  { id: "how-its-made", title: "How it's made" },
  { id: "photo-privacy", title: "Photo privacy" },
  { id: "independent-studio", title: "Independent studio" },
] as const;

/** The FAQ subset keys lib/catalog/faq.ts accepts. */
export type FaqSubsetKey = Parameters<typeof faqSubset>[0];

export interface ClosingSectionProps {
  faq: FaqSubsetKey;
  cta: CtaPairProps;
}

export function ClosingSection({ faq, cta }: ClosingSectionProps) {
  const items = faqSubset(faq);
  return (
    <section aria-label="Questions and ordering" className="py-16 md:py-24 lg:py-32">
      <div className="container-site">
        <div className="flex items-center justify-between gap-4 border-t border-hairline pt-3">
          <span aria-hidden="true" className="font-body text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] text-muted-text">
            {sectionIndex(7)}
          </span>
        </div>
        <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:mt-12">
          {CANON_BLOCKS.map((b) => (
            <div key={b.id}>
              <h3 className="font-display text-h3 uppercase">{b.title}</h3>
              <p className="mt-3 max-w-[62ch] font-body text-body text-pretty text-ink">{block(b.id)}</p>
            </div>
          ))}
        </div>
        <FaqList items={items} jsonLd id="faq" className="mt-16" />
        <div className="mt-12 border-t border-hairline pt-8">
          <CtaPair {...cta} size="lg" />
          <FourFears variant="short" className="mt-6" />
          <TrustLine />
        </div>
      </div>
    </section>
  );
}
