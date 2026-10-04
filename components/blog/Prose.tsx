import Link from "next/link";
import type { ReactNode } from "react";
import { isPageHref } from "../ButtonLink";

/**
 * The blog's type recipe (DESIGN §3), as a handful of primitives a post body is written in — no
 * markdown library, so every rule lives in a class list here and nowhere else.
 *
 * - `Prose` holds the 62ch measure; every primitive inside sets its own top margin, so a post is a
 *   plain sequence of blocks with one rhythm (24 px between paragraphs, 56 px before a section).
 * - `H2` opens a section the way the site does (DESIGN §2.5): a hairline rule, then Anton uppercase
 *   ending with a full stop (COPY §0.1 — a dev warning fires otherwise, as in SectionHeading).
 * - `Lead` is the one medium-weight opener a post is allowed (DESIGN §3 "Body").
 * - `InlineLink` is ink and ALWAYS underlined: in running text a link the colour of the sentence needs
 *   a mark other than colour (WCAG 1.4.1); hover thickens the line, nothing else moves (DESIGN §4.19).
 */

export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div data-blog-prose="" className={`max-w-[62ch] ${className}`.trim()}>
      {children}
    </div>
  );
}

export function H2({ id, children }: { id?: string; children: string }) {
  if (process.env.NODE_ENV !== "production" && !children.endsWith(".")) {
    console.warn(`blog H2: "${children}" should end with a full stop (COPY §0.1).`);
  }
  // The rule spans the column (DESIGN §2.5: a section opens on a full-width hairline); the heading keeps its 20ch measure.
  return (
    <div className="mt-14 border-t border-hairline pt-6 first:mt-0">
      <h2 id={id} className="max-w-[20ch] font-display text-h2 uppercase text-balance text-ink">
        {children}
      </h2>
    </div>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 font-body text-body text-pretty text-ink first:mt-0">{children}</p>;
}

/** The opener: one paragraph, medium weight, a step up from body — never a second one in a post. */
export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 font-body text-[1.125rem] font-medium leading-[1.5] text-pretty text-ink first:mt-0 md:text-[1.25rem]">
      {children}
    </p>
  );
}

/**
 * A ruled list (the PhotoChecklist rhythm, DESIGN §5.6): numbered rows carry the index in Anton, plain
 * rows a small ink square.
 */
export function List({ items, ordered = false }: { items: ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className="mt-6 list-none border-t border-hairline">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-3 border-b border-hairline py-3 font-body text-body text-pretty text-ink">
          {ordered ? (
            <span aria-hidden="true" className="font-display text-[1.25rem] leading-[1.3] tabular-nums text-ink">
              {i + 1}
            </span>
          ) : (
            <span aria-hidden="true" className="mt-[0.6em] block size-1.5 bg-ink" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </Tag>
  );
}

/** A ruled panel for the one sentence a section turns on — a canon line, a rule, a promise. */
export function Callout({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="mt-8 rounded-ui border border-hairline p-6">
      {label ? <p className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">{label}</p> : null}
      <div className={`${label ? "mt-2 " : ""}font-body text-body font-medium text-pretty text-ink`}>{children}</div>
    </div>
  );
}

const LINK_CLASS =
  "text-ink underline decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:decoration-2";

/** Page routes get <Link>; mailto, route handlers and anchors stay plain <a> (the ButtonLink rule). */
export function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  if (isPageHref(href)) {
    return (
      <Link href={href} className={LINK_CLASS}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={LINK_CLASS}>
      {children}
    </a>
  );
}
