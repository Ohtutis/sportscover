import { PROOF_PATH, PROOF_PATH_LABEL } from "../lib/copy/canon";

/**
 * The proof-first path, four steps (D29 — owner, 2026-10-04: "make everything much clearer … the parent
 * must grasp the path at a glance"): send photos → free watermarked proof → choose digital or printed
 * and pay the way you prefer → we complete the order. It sits under the hero CTA of the home page, the
 * three family pages, /senior-night, /guarantee and /how-it-works, and it is the same everywhere
 * because the words come from ONE constant (`PROOF_PATH` in lib/copy/canon.ts).
 *
 * A line of record, not a second offer: type, a hairline numeral ring and nothing to press — no accent
 * (the page's one accent is its button), no icon, no motion, server-rendered so it costs no JS and no
 * layout shift. The numerals are decorative; the `<ol>` carries the order for a screen reader, and the
 * visible label is the list's accessible name.
 */
export function ProofPath({ className = "" }: { className?: string }) {
  return (
    <div data-proof-path="" className={`max-w-[40rem] ${className}`.trim()}>
      <p aria-hidden="true" className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
        {PROOF_PATH_LABEL}
      </p>
      <ol aria-label={PROOF_PATH_LABEL} className="mt-3 grid gap-y-3">
        {PROOF_PATH.map((s) => (
          <li key={s.step} className="grid grid-cols-[1.75rem_1fr] items-start gap-x-3">
            <span
              aria-hidden="true"
              className="inline-flex size-7 items-center justify-center rounded-full border border-ink font-display text-[0.875rem] leading-none tabular-nums text-ink"
            >
              {s.step}
            </span>
            <p className="pt-0.5 font-body text-[0.9375rem] leading-snug text-pretty text-ink">
              <span className="font-bold">{s.title}</span>
              <span className="text-muted-text"> — {s.detail}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
