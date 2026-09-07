"use client";

import { useEffect, useRef, useState } from "react";
import { CopyIcon } from "./icons";

/**
 * Copies the card ID (CONTRACTS §3): navigator.clipboard.writeText, a "Copied" toast for 1.5 s in a
 * polite live region. ≥ 24 px tap target. Lives in the EditionPanel, which is always dark.
 */
export interface CopyIdButtonProps {
  value: string;
  label?: string;
  tone?: "arena" | "stock";
  className?: string;
}

export const COPY_TOAST = "Copied";

export function CopyIdButton({ value, label = "Copy ID", tone = "arena", className = "" }: CopyIdButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access refused — the ID is visible text beside the button; nothing else to do.
    }
  }

  const colour = tone === "arena" ? "text-arena-muted hover:text-white" : "text-muted-text hover:text-ink";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy ID — the card's registered edition ID"
        className={`inline-flex min-h-6 min-w-6 items-center gap-1.5 rounded-[4px] px-1.5 font-label text-label font-semibold uppercase tracking-[0.12em] transition-[color] duration-hover ease-out ${colour}`}
      >
        <CopyIcon size={16} />
        {label}
      </button>
      <span role="status" aria-live="polite" className={`font-label text-label font-semibold uppercase tracking-[0.12em] ${tone === "arena" ? "text-arena-muted" : "text-muted-text"}`}>
        {copied ? COPY_TOAST : ""}
      </span>
    </span>
  );
}
