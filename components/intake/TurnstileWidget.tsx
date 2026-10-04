"use client";

import { useEffect, useRef } from "react";

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

const SCRIPT_ID = "cf-turnstile-api";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const api = (): TurnstileApi | undefined => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

/**
 * The bot check, mounted ONLY when the page was given a site key (NEXT_PUBLIC_TURNSTILE_SITE_KEY). The
 * script is loaded on demand, the widget renders into a box that reserves its 65 px so the submit button
 * never jumps, and every token change is reported up. `resetSignal` asks for a fresh token after a failed
 * send (a token is single-use). Without a key nothing loads and the server does not ask for a token.
 */
export function TurnstileWidget({ siteKey, onToken, resetSignal }: { siteKey: string; onToken: (token: string) => void; resetSignal: number }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const report = useRef(onToken);

  useEffect(() => {
    report.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    const mount = (tries: number) => {
      if (cancelled) return;
      const turnstile = api();
      if (!turnstile || !box.current) {
        if (tries < 150) timer = window.setTimeout(() => mount(tries + 1), 100);
        return;
      }
      widget.current = turnstile.render(box.current, {
        sitekey: siteKey,
        action: "free-proof",
        theme: "light",
        size: "flexible",
        callback: (token: string) => report.current(token),
        "expired-callback": () => report.current(""),
        "error-callback": () => report.current(""),
      });
    };
    mount(0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      const turnstile = api();
      if (widget.current && turnstile) turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    const turnstile = api();
    if (resetSignal && widget.current && turnstile) {
      report.current("");
      turnstile.reset(widget.current);
    }
  }, [resetSignal]);

  return <div ref={box} data-turnstile="" className="min-h-[65px] w-full max-w-[30rem]" />;
}
