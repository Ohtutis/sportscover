import Image from "next/image";
import type { ReactNode } from "react";
import { BracketFrame } from "./BracketFrame";
import { StatusChip, type ChipStatus } from "./StatusChip";

/**
 * The six checks on /how-it-works (DESIGN §4.12, §5.4-2): an index row of plain anchors, then one
 * native `<details>` per gate, each an evidence split — text beside the artefact in a BracketFrame
 * with its file-tab label, artefact side alternating gate by gate, C13 on every gate that shows a
 * person. No JS.
 *
 * Every gate opens by default and stays collapsible. The group used to be an exclusive disclosure
 * set with only the first gate open, and gate 01 is the one text-only gate — so the page whose whole
 * job is to show the process opened with 10 of its 11 artefacts hidden and no photograph on screen.
 *
 * Owner review 2026-09-07, two defects, both fixed here:
 *  1. The index row was `sticky top-14` under a 57/65 px header — 172 px of a 900 px screen occluded
 *     for the length of a 10,000 px page, a paragraph cut in half behind it at any scroll position,
 *     six status chips permanently on screen and a 1 px overlap from the wrong offset. It scrolls
 *     with the page now, and carries numbers and names only: the PASS/NOTE verdicts belong to the
 *     gate they are about, where each summary already prints one.
 *  2. The artefact column ran hundreds of pixels past the text beside it. The artefact is capped at
 *     `lg:max-w-[25rem]` and the row is centred, so the two columns end within ~100 px of each
 *     other; a gate whose artefact is HTML rather than an image asks for `wide` and keeps the track.
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
  /** The artefact is HTML that needs the whole track (the verdict Ledger) — no width cap. */
  wide?: boolean;
}

const nn = (n: number): string => String(n).padStart(2, "0");
const RECORD = "font-label text-[0.8125rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-muted-text";

export function GateRow({ gates, className = "" }: { gates: Gate[]; className?: string }) {
  return (
    <div className={className || undefined}>
      <ol aria-label="The six checks" className="-mx-5 flex snap-x overflow-x-auto border-y border-hairline bg-stock sm:mx-0">
        {gates.map((g, i) => (
          <li key={g.id} className="shrink-0">
            <a
              href={`#${g.id}`}
              className="flex min-h-11 snap-start items-center gap-2 border-r border-hairline px-4 py-3 last:border-r-0 hover:bg-ink/5 xl:px-5"
            >
              {/*
                The "01 / 06" prefixes cost 63 px a cell and the row is six cells: at 768 and 834 it
                measured scrollWidth 964 against clientWidth 704 / 770, so gate 05 read "VERIF" cut at
                the frame edge and gate 06 was off-screen with no affordance (layout audit, 2026-09-08).
                The index is a nicety; the name is the link. It comes back at `xl`, the first step where the
                row measurably fits with them (at 1024 it was 950 against a 928 px track).
              */}
              <span className={`hidden xl:inline ${RECORD}`}>
                {nn(i + 1)} / {nn(gates.length)}
              </span>
              <span className="font-display text-[1rem] uppercase text-ink">{g.label}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-8 border-l border-hairline lg:mt-12">
        {gates.map((g, i) => {
          const artefactFirst = i % 2 === 1;
          return (
            <details key={g.id} id={g.id} open className="group scroll-mt-20 border-b border-hairline py-8 pl-5 last:border-b-0 lg:py-10 lg:pl-8">
              <summary className="flex cursor-pointer list-none items-baseline gap-4 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-[2.75rem] leading-none tabular-nums text-ink">{nn(i + 1)}</span>
                <span className="min-w-0">
                  <span className="block font-display text-h3 uppercase text-ink">{g.label}</span>
                  {g.artefactName ? <span className="mt-1 block font-body text-small text-muted-text">{g.artefactName}</span> : null}
                </span>
                {g.status !== "none" ? <StatusChip status={g.status} className="ml-auto" /> : null}
              </summary>
              <div className="mt-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
                <div className={`${g.wide ? "lg:col-span-5" : "lg:col-span-6"} ${artefactFirst ? "lg:order-last" : ""}`.trim()}>
                  <div className="max-w-[62ch] font-body text-body text-pretty text-ink">{g.body}</div>
                  {g.sideNote ? (
                    <div className="mt-4 rounded-ui border border-hairline bg-stock p-4">
                      <StatusChip status="note" />
                      <p className="mt-2 font-body text-small text-ink">{g.sideNote}</p>
                    </div>
                  ) : null}
                </div>
                {/*
                  Capped under `lg` too (layout audit, 2026-09-08). The artefact column was full page
                  width below the split, so on an iPad the two kit plates drew 379 px square each and
                  the four shots 186 x 279 each — every exhibit larger than it is on a desktop — and the
                  gates section ran 5,053 px at 834, the longest band on the site. `wide` gates keep the
                  track: their artefact is a table, and a table wants the width it is given.
                */}
                <div
                  className={`mt-6 lg:mt-0 ${
                    g.wide
                      ? "lg:col-span-7"
                      : `mx-auto w-full max-w-[26rem] lg:col-span-6 lg:mx-0 lg:max-w-[25rem] ${artefactFirst ? "lg:justify-self-start" : "lg:justify-self-end"}`
                  }`}
                >
                  <BracketFrame label={g.tab} caption={g.artefact.caption} fictional={g.fictional ?? true}>
                    {g.artefactNode ?? (
                      <Image
                        src={g.artefact.src}
                        alt={g.artefact.alt}
                        width={g.artefact.width}
                        height={g.artefact.height}
                        sizes="(min-width: 1024px) 400px, min(100vw, 416px)"
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
