"use client";

import { usePathname } from "next/navigation";
import { Shield } from "./brand/Shield";
import { ButtonLink } from "./ButtonLink";
import { primaryButtonClass } from "./CtaPair";

/**
 * Body of the branded 404 (COPY §2.13). Pathname-aware: an unknown `/c/<id>` gets the card variant on
 * the arena surface with an inline lookup (a plain POST to /registry/lookup — works without JS);
 * everything else gets the generic page. Nothing decorative (DESIGN §5.9).
 */
export function NotFoundBody({ className = "" }: { className?: string }) {
  const pathname = usePathname() ?? "";
  const isCardPage = pathname.startsWith("/c/");

  if (isCardPage) {
    return (
      <div data-surface="arena" className={`min-h-svh ${className}`.trim()}>
        <div className="container-site max-w-[40rem] py-16 md:py-24">
          <Shield tone="arena" size={48} />
          <h1 className="mt-8 max-w-[16ch] font-display text-display uppercase text-balance">NO CARD REGISTERED UNDER THIS ID.</h1>
          <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-arena-muted">
            Check the back of the card — the ID reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1.
          </p>
          <form method="post" action="/registry/lookup" className="mt-8">
            <label htmlFor="nf-card-id" className="block font-label text-label font-semibold uppercase tracking-[0.12em] text-arena-muted">
              Card ID
            </label>
            <input
              id="nf-card-id"
              name="id"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              required
              pattern="[A-Za-z0-9-]{8,24}"
              placeholder="GDE-SN-BKB-2026-12"
              className="mt-2 h-14 w-full rounded-ui border border-white/40 bg-arena px-4 font-label text-[1rem] font-semibold uppercase tracking-[0.08em] text-white placeholder:font-body placeholder:normal-case placeholder:text-arena-muted focus:border-white"
            />
            <button type="submit" className={primaryButtonClass("md", "mt-3 w-full sm:w-auto")}>
              Find this edition
            </button>
          </form>
          <div className="mt-8">
            <ButtonLink href="/registry" variant="outline-arena">
              What is a registered edition?
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container-site max-w-[40rem] py-16 md:py-24 ${className}`.trim()}>
      <Shield size={48} className="text-navy" />
      <h1 className="mt-8 max-w-[16ch] font-display text-display uppercase text-balance">THAT PAGE DOES NOT EXIST.</h1>
      <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-muted-text">
        Scanned a card? Check the ID on the back of the card or on the certificate — it reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I
        versus 1.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/registry">Look up a card</ButtonLink>
        <ButtonLink href="/">Home</ButtonLink>
      </div>
    </div>
  );
}
