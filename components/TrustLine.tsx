import { CheckIcon } from "./icons";
import { trustLineSegments } from "../lib/catalog/trust";

/**
 * C14 under every CTA pair and every upload control — always the last element of a CTA block
 * (DESIGN §4.3). The fourth segment appears only when lib/catalog/trust.ts says it may.
 *
 * 2026-09-07, owner review: it was one middot-separated line, and at most widths the separators fell
 * at the end of a wrapped line, so the claims read as one long sentence with punctuation adrift. It is
 * a **row of check-mark items** now (the pattern of the hero he pointed at): each claim is its own
 * item, and a claim can only ever wrap inside itself. The sentences are unchanged and still come from
 * `trustLineSegments()`; the tick is decorative (1.5 px stroke, `aria-hidden`) — the text carries the
 * meaning, as everywhere else on the site.
 */
export function TrustLine({ tone = "stock", className = "" }: { tone?: "stock" | "arena"; className?: string }) {
  const segments = trustLineSegments();
  return (
    <ul
      className={`flex max-w-[74ch] flex-wrap gap-x-6 gap-y-2 font-body text-small ${
        tone === "arena" ? "text-arena-muted" : "text-muted-text"
      } ${className}`.trim()}
    >
      {segments.map((segment) => (
        <li key={segment} className="inline-flex items-start gap-2">
          <CheckIcon size={16} className={`mt-0.5 shrink-0 ${tone === "arena" ? "text-silver" : "text-ink"}`} />
          <span>{segment}</span>
        </li>
      ))}
    </ul>
  );
}
