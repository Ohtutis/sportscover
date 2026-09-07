import Link from "next/link";
import { BRAND } from "../lib/site";
import { Shield } from "./brand/Shield";
import { Wordmark } from "./brand/Wordmark";

/**
 * The GDE mark: shield + wordmark, always the FILES (inline SVG built from public/brand/*.svg), never
 * text set in a font. `tone="stock"` = navy shield + navy wordmark; `tone="arena"` = silver-gradient
 * shield + white wordmark. `size="sm"` is the header (shield 28 px, wordmark 22 px), `size="md"` the
 * footer (shield 48 px, wordmark 20 px).
 */
export interface BrandMarkProps {
  href?: string;
  tone?: "stock" | "arena";
  size?: "sm" | "md";
  className?: string;
}

const SIZES = {
  sm: { shield: 28, wordmark: 22 },
  md: { shield: 48, wordmark: 20 },
} as const;

export function BrandMark({ href = "/", tone = "stock", size = "sm", className = "" }: BrandMarkProps) {
  const s = SIZES[size];
  return (
    <Link
      href={href}
      aria-label={`${BRAND} — home`}
      className={`inline-flex items-center gap-2.5 py-1 ${tone === "arena" ? "text-white" : "text-navy"} ${className}`.trim()}
    >
      <Shield tone={tone} size={s.shield} className={tone === "arena" ? "shrink-0" : "shrink-0 text-navy"} />
      <Wordmark height={s.wordmark} className="shrink-0" />
    </Link>
  );
}
