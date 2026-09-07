import { CANON } from "../lib/copy/canon";

/**
 * C13 — every fictional athlete carries this label in the frame or directly under it; it also covers
 * the generated "before" photo. Not disableable. `inFrame` sits on a small stock plate bottom-left of
 * the media; the default is the under-frame caption line (DESIGN §4.22). CardFace, BracketFrame and
 * BeforeAfter render it from their `fictional` prop.
 *
 * `compact` is the in-frame variant for a small frame (the 168 px "before" box): the plate shows the
 * first word of the sentence and the sentence itself is read out to assistive tech, so the label can
 * never cover the photograph it labels. The full sentence in five wrapped lines hid ~30 % of the
 * 168 × 224 before photo at 390 px.
 */
export interface FictionalLabelProps {
  tone?: "stock" | "arena";
  inFrame?: boolean;
  /** In-frame on a small frame: one visible word, the whole sentence to assistive tech. */
  compact?: boolean;
  className?: string;
}

/** "Example" — the first word of C13; derived so the short label can never drift from the sentence. */
export const FICTIONAL_LABEL_SHORT = CANON.fictionalLabel.split(" ")[0];

export function FictionalLabel({ tone = "stock", inFrame = false, compact = false, className = "" }: FictionalLabelProps) {
  const text = "font-label text-label font-semibold uppercase tracking-[0.12em]";
  if (inFrame) {
    return (
      <span className={`absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] rounded-[4px] bg-stock px-2 py-1 text-ink ${text} ${className}`.trim()}>
        {compact ? (
          <>
            <span aria-hidden="true">{FICTIONAL_LABEL_SHORT}</span>
            <span className="sr-only">{CANON.fictionalLabel}</span>
          </>
        ) : (
          CANON.fictionalLabel
        )}
      </span>
    );
  }
  return (
    <span className={`block border-t pt-2 ${text} ${tone === "arena" ? "border-arena-hairline text-arena-muted" : "border-hairline text-muted-text"} ${className}`.trim()}>
      {CANON.fictionalLabel}
    </span>
  );
}
