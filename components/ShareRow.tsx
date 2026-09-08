"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { buttonClass } from "./ButtonLink";
import { LinkIcon, ShareIcon } from "./icons";

// navigator.share never changes during a session: no subscription, client snapshot, server = false.
const noSubscribe = () => () => {};
const shareSnapshot = () => typeof navigator !== "undefined" && typeof navigator.share === "function";
const serverSnapshot = () => false;

/**
 * "Copy link" (toast "Link copied") + "Share" (navigator.share when the browser has it; hidden
 * otherwise — decided after mount so the server and client markup match). Buttons are 44 px tall
 * (`min-h-11` over the `sm` recipe) — the touch floor, DESIGN §2.6.
 *
 * A refused clipboard used to be silent: the button was pressed and nothing at all happened
 * (smooth audit S13). Now the same status line says so and the link is put on screen, selected, so
 * the reader can copy it by hand.
 */
export interface ShareRowProps {
  url: string;
  text: string;
  tone?: "arena" | "stock";
  className?: string;
}

export const LINK_COPIED_TOAST = "Link copied";
export const LINK_COPY_FAILED = "Copy failed — select and copy the link";

export function ShareRow({ url, text, tone = "arena", className = "" }: ShareRowProps) {
  const canShare = useSyncExternalStore(noSubscribe, shareSnapshot, serverSnapshot);
  const [toast, setToast] = useState("");
  const [failed, setFailed] = useState(false);
  const fallbackRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function announce(message: string) {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(""), 1500);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setFailed(false);
      announce(LINK_COPIED_TOAST);
    } catch {
      // Clipboard refused: say so, and put the link on screen selected so it can be copied by hand.
      setFailed(true);
      setToast(LINK_COPY_FAILED);
      window.clearTimeout(timer.current);
      window.setTimeout(() => fallbackRef.current?.select(), 0);
    }
  }

  async function share() {
    try {
      await navigator.share({ url, text });
    } catch {
      // The user dismissed the sheet; nothing to announce.
    }
  }

  const variant = tone === "arena" ? "outline-arena" : "outline";
  const cls = buttonClass(variant, "sm", "min-h-11");
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <button type="button" onClick={copyLink} className={cls}>
        <LinkIcon size={16} />
        Copy link
      </button>
      {canShare ? (
        <button type="button" onClick={share} className={cls}>
          <ShareIcon size={16} />
          Share
        </button>
      ) : null}
      <span role="status" aria-live="polite" className={`font-label text-label font-semibold uppercase tracking-[0.12em] ${tone === "arena" ? "text-arena-muted" : "text-muted-text"}`}>
        {toast}
      </span>
      {failed ? (
        <input
          ref={fallbackRef}
          readOnly
          value={url}
          aria-label="Card page link — select and copy"
          onFocus={(e) => e.currentTarget.select()}
          className={`mt-2 h-11 w-full min-w-0 rounded-ui border px-3 font-body text-small ${
            tone === "arena" ? "border-white/40 bg-arena text-white" : "border-ink/40 bg-stock text-ink"
          }`}
        />
      ) : null}
    </div>
  );
}
