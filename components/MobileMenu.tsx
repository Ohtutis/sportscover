"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { NavLink } from "../lib/nav";
import { CloseIcon, MenuIcon } from "./icons";

const isCurrent = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Desktop nav with `aria-current` on the section being read (a client island only because the
 * pathname is unknown to a server-rendered layout). ≈ 0.3 KB.
 *
 * The seven labels never wrap: each is `whitespace-nowrap`, and the row is tuned to the two widths
 * the header actually has — 12 px gaps between 1024 px and 1279 px (where SiteHeader shows the
 * primary CTA alone) and 20 px from 1280 px up (where the container is capped at 1200 px and the
 * outline CTA joins it). Wrapping put the `aria-current` underline under the second word only.
 */
export function HeaderNav({ links, className = "" }: { links: NavLink[]; className?: string }) {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label="Main" className={className || undefined}>
      <ul className="flex items-center gap-3 xl:gap-5">
        {links.map((l) => {
          const current = isCurrent(pathname, l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex items-center whitespace-nowrap py-1.5 font-body text-[0.9375rem] font-medium transition-[color] duration-hover ease-out ${
                  current ? "text-ink underline decoration-1 underline-offset-[10px]" : "text-ink/80 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export interface MobileMenuProps {
  links: NavLink[];
  /** The five extra links under the main nav (COPY §1.1). */
  extraLinks?: NavLink[];
  /** The CTA block under the links — a server-rendered `<CtaPair>` + `<TrustLine>` passed in by SiteHeader. */
  children?: ReactNode;
  className?: string;
}

/**
 * The header's menu button + full-height stock sheet (DESIGN §4.20): nav in Anton 1.75 rem with
 * hairline rules, the extra links in body, then the CTA block (children). Disclosure semantics
 * (`aria-expanded`, `aria-controls`), focus moves to the first link on open, Tab is trapped, Esc
 * closes, focus returns to the button, the sheet closes on navigation. No dependencies beyond icons.
 */
export function MobileMenu({ links, extraLinks = [], children, className = "" }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (pathname !== seenPathname) {
    // Adjusting state during render (React docs pattern) — closes the sheet after a navigation.
    setSeenPathname(pathname);
    setOpen(false);
  }
  const reactId = useId();
  const panelId = `mobile-menu-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      button?.focus();
    };
  }, [open]);

  return (
    <div className={`lg:hidden ${className}`.trim()}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-11 items-center justify-center rounded-ui text-ink transition-[background-color] duration-hover ease-out hover:bg-ink/5"
      >
        {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      <div id={panelId} ref={panelRef} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open} className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-stock text-ink">
        <div className="container-site flex h-14 shrink-0 items-center justify-between border-b border-hairline">
          <span className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex size-11 items-center justify-center rounded-ui transition-[background-color] duration-hover ease-out hover:bg-ink/5"
          >
            <CloseIcon size={22} />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        {/* flex-1 + mt-auto on the CTA block: the sheet is full-height, and at 834 it left ~45 % of the
            viewport empty under the trust line (layout audit 2026-09-08). The CTA pair and the trust line
            now sit at the foot of the sheet, where a thumb is. */}
        <nav aria-label="Menu" className="container-site flex flex-1 flex-col pb-10">
          <ul className="border-b border-hairline">
            {links.map((l, i) => (
              <li key={l.href} className="border-t border-hairline">
                <Link
                  ref={i === 0 ? firstLinkRef : undefined}
                  href={l.href}
                  aria-current={isCurrent(pathname, l.href) ? "page" : undefined}
                  className="block py-4 font-display text-[1.75rem] uppercase leading-none"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          {extraLinks.length ? (
            <ul className="mt-4 flex flex-col">
              {extraLinks.map((l) => (
                <li key={l.href}>
                  {/* min-h-11: these five measured 38 px tall next to 60 px primary rows, on the one
                      surface that is touch-only (audit 2026-09-08, S12). prefetch off — the header nav
                      above already prefetches every route these repeat (S3). */}
                  <Link
                    href={l.href}
                    prefetch={false}
                    aria-current={isCurrent(pathname, l.href) ? "page" : undefined}
                    className="inline-flex min-h-11 items-center py-2 font-body text-body"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {children ? <div className="mt-auto flex flex-col gap-3 pt-10">{children}</div> : null}
        </nav>
      </div>
    </div>
  );
}
