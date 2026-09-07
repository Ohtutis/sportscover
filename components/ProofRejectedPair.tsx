import Image from "next/image";
import { BracketFrame } from "./BracketFrame";
import type { ImageSpec } from "./CardFace";
import { FictionalLabel } from "./FictionalLabel";
import { Mat } from "./Mat";
import { StatusChip } from "./StatusChip";

/**
 * One rejected take, one approved (COPY §2.1-10, DESIGN §5.1-10): two BracketFrames on one arena
 * mat, each a 2 : 3 frame (a verification artefact is never cropped), a StatusChip above each and the
 * fixed captions. The pair is the ice-hockey pilot (GAPS #2) — the captions describe THOSE frames.
 */
export const REJECTED_TITLE = "REJECTED — the kit changed between shots.";
export const REJECTED_BODY = "Solid navy with a red hem in one frame, red shoulders and sleeves in the next. All three front shots sit in one composite, so this one never ships.";
export const APPROVED_TITLE = "APPROVED — same athlete, same kit in every shot.";

export interface ProofRejectedPairProps {
  fail: ImageSpec;
  pass: ImageSpec;
  className?: string;
}

function Take({ image, status, title, body }: { image: ImageSpec; status: "fail" | "pass"; title: string; body?: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <StatusChip status={status} tone="arena" />
      <BracketFrame tone="arena">
        <div className="relative aspect-[2/3] w-full">
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 360px, 45vw" className="object-contain" />
        </div>
      </BracketFrame>
      <p className="font-display text-[1rem] uppercase text-white">{title}</p>
      {body ? <p className="font-body text-small text-arena-muted">{body}</p> : null}
    </div>
  );
}

export function ProofRejectedPair({ fail, pass, className = "" }: ProofRejectedPairProps) {
  return (
    <figure className={className || undefined}>
      {/* Stacked below md (owner review 2026-09-07): side by side on a 390 px phone the FAIL column was
          138 px wide and its sentence ran nine lines at about 20 characters, while the PASS column —
          which carries no paragraph — sat beside it with ~350 px of empty ground under its frame. */}
      <Mat tone="arena" matClassName="flex-col items-stretch gap-6 p-4 md:flex-row md:items-start sm:p-6">
        <Take image={fail} status="fail" title={REJECTED_TITLE} body={REJECTED_BODY} />
        <Take image={pass} status="pass" title={APPROVED_TITLE} />
      </Mat>
      <figcaption>
        <FictionalLabel className="mt-2" />
      </figcaption>
    </figure>
  );
}
