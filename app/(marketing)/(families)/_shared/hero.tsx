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
 * The hero's object column (DESIGN §2.2 two-up).
 *
 * **There is no plate any more** (owner review, 2026-09-07). It was a `bg-hairline` box whose only job
 * was to make the art's four edges meet the copy's, and it bought that alignment with a grey ground:
 * on `/trading-cards` the box measured 616 × 697 with the art in the middle band only — 188 px of dead
 * grey above it and 223 below, 59 % of the object column empty. The product now floats on the page's
 * own stock at a slight angle with the card shadow, and the column alignment comes from the row
 * (`lg:items-stretch`) plus `lg:h-full` + `justify-center` here, which is what actually did the work.
 * Left and right edges are still flush with the copy column because the grid track decides them.
 */
export function HeroPlate({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col justify-center lg:h-full ${className}`.trim()}>{children}</div>;
}
