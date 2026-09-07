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
 * otherwise — decided after mount so the server and client markup match). Buttons ≥ 24 px.
 */
export interface ShareRowProps {
  url: string;
  text: string;
  tone?: "arena" | "stock";
  className?: string;
}

export const LINK_COPIED_TOAST = "Link copied";

export function ShareRow({ url, text, tone = "arena", className = "" }: ShareRowProps) {
  const canShare = useSyncExternalStore(noSubscribe, shareSnapshot, serverSnapshot);
  const [toast, setToast] = useState("");
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
      announce(LINK_COPIED_TOAST);
    } catch {
      // Clipboard refused — the address bar still has the link.
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
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <button type="button" onClick={copyLink} className={buttonClass(variant, "sm")}>
        <LinkIcon size={16} />
        Copy link
      </button>
      {canShare ? (
        <button type="button" onClick={share} className={buttonClass(variant, "sm")}>
          <ShareIcon size={16} />
          Share
        </button>
      ) : null}
      <span role="status" aria-live="polite" className={`font-label text-label font-semibold uppercase tracking-[0.12em] ${tone === "arena" ? "text-arena-muted" : "text-muted-text"}`}>
        {toast}
      </span>
    </div>
  );
}
