import type { ReactNode } from "react";

/**
 * PASS / FAIL / NOTE as an outline chip (DESIGN §4.10): ink text, a 1.5 px status border and a 6 px
 * dot — colour is never the only carrier, the text says it. Never filled, never an icon.
 */
export type ChipStatus = "pass" | "fail" | "note";

const LABEL: Record<ChipStatus, string> = { pass: "PASS", fail: "FAIL", note: "NOTE" };
const STYLE: Record<ChipStatus, { border: string; dot: string }> = {
  pass: { border: "border-pass", dot: "bg-pass" },
  fail: { border: "border-fail", dot: "bg-fail" },
  note: { border: "border-muted", dot: "bg-muted" },
};

export interface StatusChipProps {
  status: ChipStatus;
  tone?: "stock" | "arena";
  /** Visible text; defaults to PASS / FAIL / NOTE. */
  children?: ReactNode;
  className?: string;
}

export function StatusChip({ status, tone = "stock", children, className = "" }: StatusChipProps) {
  const s = STYLE[status];
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-pill border-[1.5px] px-2 font-label text-[0.6875rem] font-semibold uppercase tracking-[0.12em] ${s.border} ${tone === "arena" ? "text-white" : "text-ink"} ${className}`.trim()}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${s.dot}`} />
      {children ?? LABEL[status]}
    </span>
  );
}
