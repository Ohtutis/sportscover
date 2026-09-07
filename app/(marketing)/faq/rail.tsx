"use client";

import { useEffect, useState } from "react";

/**
 * The /faq group rail. It used to be ten identical grey links with no current state, so a reader who
 * had scrolled to "Privacy" could not tell which of the ten they were in (owner review 2026-09-07).
 * The rail marks the group whose section is highest on screen: `aria-current="true"` for assistive
 * tech and, visually, ink type with a 3 px accent tick — the same tick the hero claims use, never a
 * filled pill.
 *
 * The rail is decoration over anchors that already work: with no JavaScript every link still jumps to
 * its group, and nothing but the marker depends on this island.
 */
export interface FaqRailGroup {
  id: string;
  title: string;
}

export function FaqRail({ groups, className = "" }: { groups: FaqRailGroup[]; className?: string }) {
  const [current, setCurrent] = useState<string>("");

  useEffect(() => {
    const sections = groups.map((g) => document.getElementById(g.id)?.closest("section")).filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const pick = () => {
      // The group whose section starts above the reading line and ends below it; the last one wins
      // at the bottom of the page, where no section can reach the line any more.
      const line = 140;
      let id = "";
      for (const section of sections) {
        const box = section.getBoundingClientRect();
        if (box.top <= line && box.bottom > line) id = section.querySelector("h2")?.id ?? id;
      }
      if (!id) {
        const first = sections[0].getBoundingClientRect();
        if (first.top > line) id = sections[0].querySelector("h2")?.id ?? "";
        else id = sections[sections.length - 1].querySelector("h2")?.id ?? "";
      }
      setCurrent(id);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [groups]);

  return (
    <ul className={className || undefined}>
      {groups.map((group) => {
        const active = group.id === current;
        return (
          <li key={group.id}>
            <a
              href={`#${group.id}`}
              aria-current={active ? "true" : undefined}
              className={`flex min-h-11 items-center gap-3 border-l-[3px] pl-3 font-body text-small underline-offset-4 decoration-1 transition-colors duration-hover ease-out hover:text-ink hover:underline ${
                active ? "border-accent font-medium text-ink" : "border-transparent text-muted-text"
              }`}
            >
              {group.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
