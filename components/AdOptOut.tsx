"use client";

// The /privacy switch for ad measurement (2026-10-06): one button that stores AD_OPT_OUT_KEY in this
// browser, after which components/MetaPixel.tsx never loads the Meta pixel here. It is the "do not share"
// choice in a form that needs no account; a browser sending Global Privacy Control is opted out already.
// The state lives in localStorage, read through useSyncExternalStore so another tab's change shows too.
import { useSyncExternalStore } from "react";
import { AD_OPT_OUT_KEY, optedOut } from "./MetaPixel";

const CHANGE = "gde-ad-opt-out";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

export function AdOptOut() {
  // null on the server and during hydration: the button waits until the browser's own answer is known.
  const off = useSyncExternalStore<boolean | null>(subscribe, () => optedOut(), () => null);
  const toggle = () => {
    try {
      if (off) window.localStorage.removeItem(AD_OPT_OUT_KEY);
      else window.localStorage.setItem(AD_OPT_OUT_KEY, "1");
    } catch {
      // Storage blocked: optedOut() already reads that as "off".
    }
    window.dispatchEvent(new Event(CHANGE));
  };
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={toggle}
        disabled={off === null}
        className="inline-flex min-h-11 items-center rounded-ui border border-ink px-4 font-body text-small font-medium text-ink"
      >
        {off ? "Turn ad measurement back on" : "Turn off ad measurement in this browser"}
      </button>
      <span aria-live="polite" className="font-body text-small text-muted-text">
        {off === null ? "" : off ? "Off in this browser: the Meta pixel will not load here." : "On: the Meta pixel may load on the free-proof page."}
      </span>
    </p>
  );
}
