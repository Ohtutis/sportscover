"use client";

import { useEffect, useState } from "react";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { HERO_CTA_CLASS } from "./IntakeHero";
import { ScrollLink } from "./ScrollLink";

/**
 * The sticky bar on a phone (ads brief §15, 2026-10-07): "Create free proof →" fixed to the bottom edge below
 * `lg`, gliding to the form. It leaves the moment the form (`#free-proof-form`) enters the viewport — so it
 * never sits over an input or the submit — and comes back once the reader has scrolled past the form into
 * the sections below. Nothing is rendered until the observer has looked once, so the static HTML carries no
 * bar and the first paint never shifts. Reduced motion: the bar still appears, it just does not slide.
 */
export function StickyCta() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const form = document.getElementById("free-proof-form");
    if (!form || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting), { rootMargin: "0px 0px -25% 0px" });
    io.observe(form);
    return () => io.disconnect();
  }, []);
  return (
    <div
      data-sticky-cta=""
      aria-hidden={shown ? undefined : true}
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-transform duration-200 ease-out motion-reduce:transition-none lg:hidden ${
        shown ? "translate-y-0" : "translate-y-[150%]"
      }`}
    >
      <div className="pointer-events-auto mx-auto max-w-[560px] rounded-ui bg-ink p-2 shadow-[var(--shadow-card-stock)]">
        <ScrollLink href="#create" className={`${HERO_CTA_CLASS} w-full`}>
          {INTAKE_COPY.stickyCta}
        </ScrollLink>
      </div>
    </div>
  );
}
