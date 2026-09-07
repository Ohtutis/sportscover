// Section scaffolding private to the home page (DESIGN §2.5 — rule + index, then title → subhead →
// pills). `SectionHeading` from components/ draws the rule itself and always on stock; the two
// variants here cover the sections DESIGN gives no rule (02) or an arena rule (04).
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "../../../components/icons";

/**
 * The sections that carry a visible index, in page order (the hero opens on the H1 with no rule, and
 * the footer is the layout's, not the page's). The counter used to read "02 / 13 … 12 / 13": it began
 * at 02, ended at 12 and promised a 13 nobody ever sees — a counter that does not count, on a page
 * whose whole pitch is that everything here is counted (design review 2026-09-07). The `n` values
 * below stay the anchor numbers (`#s-08` is linked from the hero and must not move); what changed is
 * the number PRINTED on the rule, which is now this list's own 01 … 11.
 */
export const HOME_INDEXED_SECTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** How many indices the page actually prints — the denominator on every rule. */
export const HOME_SECTION_COUNT = HOME_INDEXED_SECTIONS.length;

/** Where a section's anchor number sits in the printed spine (1 … HOME_SECTION_COUNT). */
export const spinePosition = (n: number): number => HOME_INDEXED_SECTIONS.indexOf(n as (typeof HOME_INDEXED_SECTIONS)[number]) + 1;

export const sectionIndex = (n: number): string => {
  const at = spinePosition(n);
  if (at < 1) throw new Error(`sectionIndex: section ${n} carries no printed index`);
  return `${String(at).padStart(2, "0")} / ${HOME_SECTION_COUNT}`;
};

export const sectionId = (n: number): string => `s-${String(n).padStart(2, "0")}`;

export interface HomeSectionProps {
  /** 1 … 12 — drives the id and the index string. */
  n: number;
  container?: "site" | "gallery";
  tone?: "stock" | "arena";
  /** The element the section is named by; defaults to the section's own heading id. */
  labelledBy?: string;
  /** An extra anchor id on the section element (e.g. `#registry` for the lookup miss redirect). */
  id?: string;
  children: ReactNode;
  className?: string;
}

/**
 * `<section>` + its container. The rhythm was inverted (owner review 2026-09-07): 256 px of air
 * BETWEEN sections while the blocks inside sat 8–24 px apart, so every band read as a pile with a
 * canyon under it. The band gap comes down to 96 px and the space is spent inside the blocks.
 */
export function HomeSection({ n, container = "site", tone = "stock", labelledBy, id, children, className = "py-12 md:py-20 lg:py-24" }: HomeSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy ?? sectionId(n)}
      data-surface={tone === "arena" ? "arena" : undefined}
      className={`${tone === "arena" ? "bg-arena text-white" : ""} ${className}`.trim()}
    >
      <div className={container === "gallery" ? "container-gallery" : "container-site"}>{children}</div>
    </section>
  );
}

/** The opener rule with the section index and an optional right-hand slot (DESIGN §2.5). */
export function SectionRule({ n, tone = "stock", rail, rule = true }: { n: number; tone?: "stock" | "arena"; rail?: ReactNode; rule?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 pt-3 ${rule ? (tone === "arena" ? "border-t border-arena-hairline" : "border-t border-hairline") : ""}`.trim()}
    >
      <span
        aria-hidden="true"
        className={`font-body text-[0.8125rem] font-medium tabular-nums tracking-[0.14em] ${tone === "arena" ? "text-arena-muted" : "text-muted-text"}`}
      >
        {sectionIndex(n)}
      </span>
      {rail}
    </div>
  );
}

export interface HomeHeadingProps {
  id: string;
  title: string;
  subhead?: string;
  pills?: ReactNode;
  align?: "left" | "center";
  tone?: "stock" | "arena";
  className?: string;
}

/** An H2 without a rule of its own — the rule is `SectionRule`. Order is fixed: title → subhead → pills (D12). */
export function HomeHeading({ id, title, subhead, pills, align = "left", tone = "stock", className = "" }: HomeHeadingProps) {
  const center = align === "center";
  return (
    <div className={`${center ? "text-center" : ""} ${className}`.trim()}>
      <h2 id={id} className={`mt-6 max-w-[20ch] font-display text-h2 uppercase text-balance ${center ? "mx-auto" : ""}`.trim()}>
        {title}
      </h2>
      {subhead ? (
        <p
          className={`mt-4 max-w-[44ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub ${tone === "arena" ? "text-white" : ""} ${center ? "mx-auto" : ""}`.trim()}
        >
          {subhead}
        </p>
      ) : null}
      {pills ? <div className={`mt-stack flex flex-wrap gap-2 ${center ? "justify-center" : ""}`.trim()}>{pills}</div> : null}
    </div>
  );
}

/**
 * A body link with the 16 px accent arrow that moves 2 px on hover (DESIGN §4.8, §5.1-09). The hit
 * area is 44 px tall (checklist minimum — the audit measured 20–24 px); the padding is cancelled by
 * an equal negative margin, so the link still SITS where it did and only the target grew.
 */
export function ArrowLink({ href, children, tone = "stock", className = "" }: { href: string; children: ReactNode; tone?: "stock" | "arena"; className?: string }) {
  const cls = `group -my-2.5 inline-flex min-h-11 items-center gap-2 py-2.5 font-body text-small font-medium decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:underline ${
    tone === "arena" ? "text-white" : "text-ink"
  } ${className}`.trim();
  const inner = (
    <>
      {children}
      <ArrowRightIcon size={16} className="text-accent transition-transform duration-hover ease-out group-hover:translate-x-0.5" />
    </>
  );
  if (href.startsWith("/") && !href.startsWith("/go/")) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}

/** The block title inside a section (DESIGN §3: H3 is Anton, uppercase, no full stop). */
export function BlockTitle({ children, tone = "stock", className = "" }: { children: ReactNode; tone?: "stock" | "arena"; className?: string }) {
  return <h3 className={`font-display text-h3 uppercase ${tone === "arena" ? "text-white" : "text-ink"} ${className}`.trim()}>{children}</h3>;
}
