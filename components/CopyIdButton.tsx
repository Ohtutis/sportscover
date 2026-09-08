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
export const COPY_FAILED_TOAST = "Copy failed — select the ID";

export function CopyIdButton({ value, label = "Copy ID", tone = "arena", className = "" }: CopyIdButtonProps) {
  const [toast, setToast] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const wrapper = useRef<HTMLSpanElement>(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  /**
   * A refused clipboard used to do nothing at all (smooth audit S13): the button was pressed and no
   * toast, no error and no state change followed. It now says so in the same status line and
   * selects the printed ID beside it, so the reader can copy it by hand.
   */
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setToast(COPY_TOAST);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setToast(""), 1500);
    } catch {
      setToast(COPY_FAILED_TOAST);
      window.clearTimeout(timer.current);
      selectValue();
    }
  }

  /** Selects the ID text that sits beside this button, so ⌘C works without a clipboard permission. */
  function selectValue() {
    const host = wrapper.current?.parentElement;
    const node = host && [...host.querySelectorAll("*")].find((el) => el.textContent?.trim() === value);
    if (!node || typeof window.getSelection !== "function") return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  const colour = tone === "arena" ? "text-arena-muted hover:text-white" : "text-muted-text hover:text-ink";
  return (
    <span ref={wrapper} className={`inline-flex items-center gap-2 ${className}`.trim()}>
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
        {toast}
      </span>
    </span>
  );
}
