import type { ReactNode } from "react";
import { FictionalLabel } from "./FictionalLabel";

/**
 * The labelled exhibit (DESIGN §4.6): four accent corner brackets (2 px, 28 px legs) and a file-tab
 * label on the top rule — the audit mark of the listing videos in the catalogue's register. Brackets
 * wrap PROCESS artefacts only (verdict, kit plate, reference plate, shots, verification, proof, the
 * promise paragraph) — never a product for sale. Corners never move. Radius 0 only.
 */
export interface BracketFrameProps {
  children: ReactNode;
  /** File-tab label on the top rule, e.g. "KIT PLATE · FRONT". */
  label?: string;
  tone?: "stock" | "arena";
  /** Caption under the artefact (figcaption). */
  caption?: ReactNode;
  /** The artefact shows a fictional athlete → C13 in the figcaption. */
  fictional?: boolean;
  /**
   * Fill the height of the grid cell it stands in and let the artefact take what the caption does not.
   * Three frames in one row ended 659 / 366 / 358 px tall — accent corners at three heights and a
   * 293 px ragged bottom (owner review 2026-09-07). With `fill` on every frame of a stretched row the
   * corners agree and each exhibit is drawn as large as the row allows.
   */
  fill?: boolean;
  className?: string;
}

const CORNER = "pointer-events-none absolute size-7 border-accent";

export function BracketFrame({ children, label, tone = "stock", caption, fictional, fill, className = "" }: BracketFrameProps) {
  const arena = tone === "arena";
  const hasCaption = Boolean(caption) || Boolean(fictional);
  const Tag = label || hasCaption ? "figure" : "div";
  return (
    <Tag className={`group relative rounded-none p-3 sm:p-4 ${fill ? "flex h-full flex-col" : ""} ${className}`.trim()}>
      <span aria-hidden="true" className={`${CORNER} left-0 top-0 border-l-2 border-t-2`} />
      <span aria-hidden="true" className={`${CORNER} right-0 top-0 border-r-2 border-t-2`} />
      <span aria-hidden="true" className={`${CORNER} bottom-0 left-0 border-b-2 border-l-2`} />
      <span aria-hidden="true" className={`${CORNER} bottom-0 right-0 border-b-2 border-r-2`} />
      {label ? (
        <span
          className={`absolute -top-2.5 left-6 px-2 font-label text-label font-semibold uppercase tracking-[0.12em] ${arena ? "bg-arena text-white" : "bg-stock text-ink"}`}
        >
          {label}
        </span>
      ) : null}
      {fill ? <div className="min-h-0 flex-1">{children}</div> : children}
      {hasCaption ? (
        // max-w-[62ch]: a plate caption ran the full 770 px of a tablet column at 12 px — 100 characters
        // to a line, against the 62 ch measure DESIGN §2.1 puts on every paragraph.
        <figcaption className={`mt-3 max-w-[62ch] font-body text-[0.75rem] font-medium ${arena ? "text-arena-muted" : "text-muted-text"}`}>
          {caption ? <span className="block">{caption}</span> : null}
          {fictional ? <FictionalLabel tone={tone} className={caption ? "mt-2" : ""} /> : null}
        </figcaption>
      ) : null}
    </Tag>
  );
}
