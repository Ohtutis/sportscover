import { Fragment, type ReactNode } from "react";
import { CtaPair } from "../../../../components/CtaPair";
import { DeliveryChips } from "../../../../components/DeliveryChips";
import { Pill, type PillTone } from "../../../../components/Pill";
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

export interface Claim {
  text: string;
  /** `accent` is the page's ONE primary claim (DESIGN §4.1) — first entry only. */
  tone?: PillTone;
}

/**
 * The hero's claims, as TYPE (owner review, 2026-09-07 — the same change the home hero took).
 *
 * They used to be chip-shaped `Pill`s: a filled accent lozenge beside outlined lozenges, sitting a
 * few pixels above a filled accent button beside an outlined button. That is the button pattern
 * printed twice, and buyers tried to click the claims. `variant="label"` leaves the control
 * vocabulary altogether — Barlow, uppercase, tracked, no fill and no border — and the accent claim
 * keeps its accent as a 3 px tick rather than as a target. D12's order (title → subhead → pills) is
 * unchanged; the claims sit exactly where COPY puts them.
 */
export function ClaimLabels({ claims }: { claims: Claim[] }): ReactNode {
  return (
    <>
      {claims.map((claim, i) => (
        <Fragment key={claim.text}>
          {i > 0 ? (
            <span aria-hidden="true" className="font-label text-label font-semibold leading-none text-muted-text">
              ·
            </span>
          ) : null}
          <Pill variant="label" tone={claim.tone ?? "outline"}>
            {claim.text}
          </Pill>
        </Fragment>
      ))}
    </>
  );
}

/**
 * The hero's object column (DESIGN §2.2 two-up, §2.3 plate padding). The grid row is `items-stretch`
 * and this plate fills its track, so the four edges of the art line up with the four edges of the
 * copy at every width instead of floating in the middle of it; the object inside keeps its own fixed
 * ratio and centres, and the plate absorbs whatever height the copy adds. Measured 0.00 px top and
 * bottom against the text column at 1024 / 1280 / 1440 / 1728.
 */
export function HeroPlate({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col justify-center rounded-ui bg-hairline p-4 md:p-6 lg:h-full lg:p-8 ${className}`.trim()}>
      {children}
    </div>
  );
}
