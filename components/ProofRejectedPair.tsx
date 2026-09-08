import Image from "next/image";
import { BracketFrame } from "./BracketFrame";
import type { ImageSpec } from "./CardFace";
import { FictionalLabel } from "./FictionalLabel";
import { StatusChip } from "./StatusChip";

/**
 * One rejected take, one approved (COPY §2.1-10, DESIGN §5.1-10): two BracketFrames, each a 2 : 3 frame
 * (a verification frame is never cropped), a StatusChip above each and the fixed captions. The pair is
 * the ice-hockey pilot (GAPS #2) — the captions describe THOSE frames.
 *
 * 2026-09-08: the arena mat is gone (handoff #21, DESIGN §4.5 as revised). The two takes are mid-grey
 * rink photographs, not dark art, and a black plate around them on a cream page was a ground painted
 * behind a product. They float on the page's own stock now, each on the card shadow, and everything
 * that was set white on that plate — the chips, the titles, the sentence — is set in ink.
 */
export const REJECTED_TITLE = "REJECTED — the kit changed between shots.";
export const REJECTED_BODY = "Solid navy with a red hem in one shot, red shoulders and sleeves in the next. All three front shots go on the same card, so this one never ships.";
export const APPROVED_TITLE = "APPROVED — same athlete, same kit in every shot.";

/**
 * Rendered 268 CSS px at 390 on a 2× screen, so the browser needs a 537 px candidate; the old `45vw`
 * mobile term asked for 176 and was served `w=384` — 0.72× — on the two frames the page asks a visitor
 * to compare closely (audit 2026-09-08, S18).
 */
const TAKE_SIZES = "(min-width: 1024px) 360px, (min-width: 768px) 45vw, 84vw";

export interface ProofRejectedPairProps {
  fail: ImageSpec;
  pass: ImageSpec;
  className?: string;
}

function Take({ image, status, title, body }: { image: ImageSpec; status: "fail" | "pass"; title: string; body?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <StatusChip status={status} />
      <BracketFrame>
        <div className="relative aspect-[2/3] w-full shadow-[var(--shadow-card-stock)]">
          <Image src={image.src} alt={image.alt} fill sizes={TAKE_SIZES} className="object-contain" />
        </div>
      </BracketFrame>
      <p className="font-display text-[1rem] uppercase text-ink">{title}</p>
      {body ? <p className="max-w-[62ch] font-body text-small text-muted-text">{body}</p> : null}
    </div>
  );
}

export function ProofRejectedPair({ fail, pass, className = "" }: ProofRejectedPairProps) {
  return (
    <figure className={className || undefined}>
      {/* Stacked below md (owner review 2026-09-07): side by side on a 390 px phone the FAIL column was
          138 px wide and its sentence ran nine lines at about 20 characters, while the PASS column —
          which carries no paragraph — sat beside it with ~350 px of empty ground under its frame. */}
      <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-start">
        <Take image={fail} status="fail" title={REJECTED_TITLE} body={REJECTED_BODY} />
        <Take image={pass} status="pass" title={APPROVED_TITLE} />
      </div>
      <figcaption>
        <FictionalLabel className="mt-4" />
      </figcaption>
    </figure>
  );
}
