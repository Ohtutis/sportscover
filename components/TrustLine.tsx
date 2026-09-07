import { trustLineSegments } from "../lib/catalog/trust";

/**
 * C14 under every CTA pair and every upload control — always the last element of a CTA block
 * (DESIGN §4.3). The fourth segment appears only when lib/catalog/trust.ts says it may. The middot
 * travels with the segment BEFORE it, so a wrapped line can never open with a separator.
 */
export function TrustLine({ tone = "stock", className = "" }: { tone?: "stock" | "arena"; className?: string }) {
  const segments = trustLineSegments();
  return (
    <p className={`mt-3 flex max-w-[62ch] flex-wrap gap-x-3 gap-y-1 font-body text-small ${tone === "arena" ? "text-arena-muted" : "text-muted-text"} ${className}`.trim()}>
      {segments.map((segment, i) => (
        <span key={segment} className="inline-flex gap-x-3">
          <span>{segment}</span>
          {i < segments.length - 1 ? <span aria-hidden="true">·</span> : null}
        </span>
      ))}
    </p>
  );
}
