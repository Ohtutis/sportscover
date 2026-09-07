import { CtaPair } from "../../../../components/CtaPair";
import { DeliveryChips } from "../../../../components/DeliveryChips";
import { TrustLine } from "../../../../components/TrustLine";
import type { CtaPairProps } from "../../../../lib/cta";

/**
 * The bottom half of every family hero (DESIGN §5.2-1): the one delivery claim of the page, the
 * shipping / staged-delivery sentences from the canon, the CTA pair and the TrustLine that closes
 * every CTA block. The chips appear once per page — here — so the closing block never repeats them.
 */
export interface HeroCtaBlockProps {
  cta: CtaPairProps;
  /** C11, and on the complete set C12 — passed in from `lib/copy/canon.ts`, never retyped. */
  notes: string[];
  className?: string;
}

export function HeroCtaBlock({ cta, notes, className = "" }: HeroCtaBlockProps) {
  return (
    <div className={className || undefined}>
      <DeliveryChips kind="standard" />
      {notes.map((note) => (
        <p key={note} className="mt-3 max-w-[62ch] font-body text-small text-muted-text">
          {note}
        </p>
      ))}
      <div className="mt-8">
        <CtaPair {...cta} size="lg" />
        <TrustLine />
      </div>
    </div>
  );
}
