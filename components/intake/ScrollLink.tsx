"use client";

import type { MouseEvent, ReactNode } from "react";

/**
 * An in-page anchor that glides to its target (and jumps when the reader asked for reduced motion),
 * then hands keyboard focus to the target's `[data-step-focus]` heading so the next Tab lands inside the
 * step. Without JavaScript it is the plain `#step-1` link it renders — the browser jumps, and the
 * target's `scroll-margin-top` keeps it clear of the sticky header either way.
 */
export function ScrollLink({ href, className, children }: { href: `#${string}`; className?: string; children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.history.replaceState(window.history.state, "", href);
    (target.querySelector<HTMLElement>("[data-step-focus]") ?? target).focus({ preventScroll: true });
  };
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
