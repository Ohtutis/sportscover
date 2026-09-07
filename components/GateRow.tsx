import Image from "next/image";
import type { ReactNode } from "react";
import { BracketFrame } from "./BracketFrame";
import { StatusChip, type ChipStatus } from "./StatusChip";

/**
 * The six gates on /how-it-works (DESIGN §4.12, §5.4-2): a sticky index row of plain anchors, then
 * one native `<details>` per gate, each an evidence split — text beside the artefact in a
 * BracketFrame with its file-tab label, artefact side alternating gate by gate, C13 on every gate
 * that shows a person. No JS.
 *
 * Every gate opens by default and stays collapsible. The group used to be an exclusive disclosure
 * set with only the first gate open, and gate 01 is the one text-only gate — so the page whose whole
 * job is to show the process opened with 10 of its 11 artefacts hidden and no photograph on screen.
 */
export interface GateArtefact {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export interface Gate {
  id: string;
  label: string;
  status: ChipStatus | "none";
  body: ReactNode;
  artefact: GateArtefact;
  sideNote?: string;
  /** File-tab label on the bracket frame, e.g. "KIT PLATE · FRONT". */
  tab?: string;
  /** The artefact's name in the summary line, e.g. "the verdict, as the parent reads it". */
  artefactName?: string;
  /** An HTML artefact (the verdict Ledger) instead of the image. */
  artefactNode?: ReactNode;
  /** The artefact shows a fictional athlete (default true). */
  fictional?: boolean;
}

const nn = (n: number): string => String(n).padStart(2, "0");
const RECORD = "font-label text-[0.8125rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-muted-text";

export function GateRow({ gates, className = "" }: { gates: Gate[]; className?: string }) {
  return (
    <div className={className || undefined}>
      <ol aria-label="The six gates" className="sticky top-14 z-30 -mx-5 flex snap-x overflow-x-auto border-y border-hairline bg-stock sm:mx-0 lg:top-16">
        {gates.map((g, i) => (
          <li key={g.id} className="shrink-0">
            <a href={`#${g.id}`} className="flex snap-start flex-col gap-1.5 border-r border-hairline px-5 py-3 last:border-r-0">
              <span className={RECORD}>
                {nn(i + 1)} / {nn(gates.length)}
              </span>
              <span className="font-display text-[1rem] uppercase text-ink">{g.label}</span>
              {g.status !== "none" ? <StatusChip status={g.status} /> : null}
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-8 border-l border-hairline lg:mt-12">
        {gates.map((g, i) => {
          const artefactFirst = i % 2 === 1;
          return (
            <details key={g.id} id={g.id} open className="group scroll-mt-32 border-b border-hairline py-6 pl-5 last:border-b-0 lg:pl-8">
              <summary className="flex cursor-pointer list-none items-baseline gap-4 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-[2.75rem] leading-none tabular-nums text-ink">{nn(i + 1)}</span>
                <span className="min-w-0">
                  <span className="block font-display text-h3 uppercase text-ink">{g.label}</span>
                  {g.artefactName ? <span className="mt-1 block font-body text-small text-muted-text">{g.artefactName}</span> : null}
                </span>
                {g.status !== "none" ? <StatusChip status={g.status} className="ml-auto" /> : null}
              </summary>
              <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-x-8">
                <div className={`lg:col-span-5 ${artefactFirst ? "lg:order-last" : ""}`.trim()}>
                  <div className="max-w-[62ch] font-body text-body text-pretty text-ink">{g.body}</div>
                  {g.sideNote ? (
                    <div className="mt-4 rounded-ui border border-hairline bg-stock p-4">
                      <StatusChip status="note" />
                      <p className="mt-2 font-body text-small text-ink">{g.sideNote}</p>
                    </div>
                  ) : null}
                </div>
                <div className="mt-6 lg:col-span-7 lg:mt-0">
                  <BracketFrame label={g.tab} caption={g.artefact.caption} fictional={g.fictional ?? true}>
                    {g.artefactNode ?? (
                      <Image
                        src={g.artefact.src}
                        alt={g.artefact.alt}
                        width={g.artefact.width}
                        height={g.artefact.height}
                        sizes="(min-width: 1024px) 640px, 100vw"
                        className="h-auto w-full rounded-none"
                      />
                    )}
                  </BracketFrame>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
