"use client";

import { usePathname } from "next/navigation";
import { Shield } from "./brand/Shield";
import { ButtonLink } from "./ButtonLink";
import { PRIMARY_BUTTON_CLASS } from "./CtaPair";
import { LookupForm } from "./LookupForm";

/**
 * Body of the branded 404 (COPY §2.13). Pathname-aware: an unknown `/c/<id>` gets the card variant on
 * the arena surface with an inline lookup (a plain POST to /registry/lookup — works without JS);
 * everything else gets the generic page. Nothing decorative (DESIGN §5.9).
 *
 * 2026-09-08 audit (S11, N10): the two 404s were different pages. This one hand-rolled the lookup form
 * — same markup, no help line under the field — while `/c/[cardId]/not-found.tsx` used `LookupForm`;
 * and the generic variant offered two OUTLINE buttons with no primary, one of them labelled "HOME", a
 * CTA label used nowhere else on the site. Both now render the same component with the same copy, and
 * the pair is primary-first like every other `CtaPair`.
 */
/**
 * The card variant's copy (COPY §2.13). It lives HERE, not in the route's own `not-found.tsx`, because
 * this component is the one that renders it in both places — the route re-exports it.
 */
export const CARD_NOT_FOUND = {
  title: "NO CARD REGISTERED UNDER THIS ID.",
  body: "Check the back of the card — the ID reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1.",
  link: "What is a registered edition?",
} as const;

export const NOT_FOUND = {
  title: "THAT PAGE DOES NOT EXIST.",
  body: "Scanned a card? Check the ID on the back of the card or on the certificate — it reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1.",
  primary: "Look up a card",
  secondary: "Back to the home page",
} as const;

export function NotFoundBody({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "";
  const isCardPage = pathname.startsWith("/c/");

  if (isCardPage) {
    return (
      <div data-surface="arena" className={className || undefined}>
        <div className="container-site max-w-[40rem] py-16 md:py-24">
          <Shield tone="arena" size={48} />
          <h1 className="mt-8 max-w-[16ch] font-display text-display uppercase text-balance">{CARD_NOT_FOUND.title}</h1>
          <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-arena-muted">{CARD_NOT_FOUND.body}</p>
          <LookupForm className="mt-8" tone="arena" id="nf-card-id" />
          <div className="mt-8">
            <ButtonLink href="/registry" variant="outline-arena">
              {CARD_NOT_FOUND.link}
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container-site max-w-[40rem] py-16 md:py-24 ${className}`.trim()}>
      <Shield size={48} className="text-navy" />
      <h1 className="mt-8 max-w-[16ch] font-display text-display uppercase text-balance">{NOT_FOUND.title}</h1>
      <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-muted-text">{NOT_FOUND.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/registry" variant="bare" className={PRIMARY_BUTTON_CLASS}>
          {NOT_FOUND.primary}
        </ButtonLink>
        <ButtonLink href="/">{NOT_FOUND.secondary}</ButtonLink>
      </div>
    </div>
  );
}
