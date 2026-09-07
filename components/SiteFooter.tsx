import Link from "next/link";
import { block } from "../lib/blocks";
import { FOOTER_COLUMNS } from "../lib/nav";
import { IMPRINT, OWNER_NAME, SOCIAL_LINKS, SUPPORT_EMAIL, imprintComplete } from "../lib/site";
import { BrandMark } from "./BrandMark";
import { TrueNumbers } from "./TrueNumbers";

/** Every href the Shop / Trust / Legal columns already carry. */
const COLUMN_HREFS = new Set(FOOTER_COLUMNS.flatMap((c) => c.links.map((l) => l.href)));

/** Where a social platform actually points in the footer (Etsy goes through the /etsy redirect). */
const socialHref = (platform: string, url: string): string => (platform === "Etsy" ? "/etsy" : url);

/**
 * Every footer link measured 35 px tall — under the 44 px tap target the checklist requires (owner
 * review 2026-09-07). The padding grows the target, not the type.
 */
const LINK =
  "inline-flex min-h-11 items-center py-2 font-body text-[0.9375rem] text-white/85 underline-offset-4 decoration-1 transition-[color] duration-hover ease-out hover:text-white hover:underline";

/** The imprint block (COPY §1.2) — rendered only when `imprintComplete()`; otherwise the fallback line. */
function Imprint() {
  const email = (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="underline decoration-1 underline-offset-4">
      {SUPPORT_EMAIL}
    </a>
  );
  if (!imprintComplete()) {
    return (
      <p className="mt-10 font-body text-small text-white/70">
        Game Day Edition is an independent custom design studio operated from Lithuania. {email}
      </p>
    );
  }
  return (
    <p className="mt-10 font-body text-small text-white/70">
      {IMPRINT.legalName} · Company code {IMPRINT.companyCode}
      {IMPRINT.vat ? `, VAT ${IMPRINT.vat}` : ""} · {IMPRINT.address} · Responsible person: {OWNER_NAME} · {email}
    </p>
  );
}

/**
 * Every page, `/c` included (DESIGN §4.20): navy band, silver shield + white wordmark, the score bug
 * (`TrueNumbers`, §4.17), the Shop / Trust / Legal columns, C4, the social row, the imprint or its
 * fallback, the bottom line. No ghost shield, no grain, no newsletter field, no badge row.
 */
export function SiteFooter({ className = "" }: { className?: string }) {
  const year = new Date().getFullYear();
  /** The social entries that are a destination of their own — the rest are already in the columns. */
  const socialRow = SOCIAL_LINKS.filter((s) => !COLUMN_HREFS.has(socialHref(s.platform, s.url)));
  return (
    <footer className={`bg-navy text-white ${className}`.trim()}>
      <div className="container-site py-16 lg:py-24">
        <BrandMark tone="arena" size="md" />

        {/* Score bug (DESIGN §4.17) — one implementation, so the figure is never set twice (review 2026-09-07). */}
        <TrueNumbers tone="arena" className="mt-8" />

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="font-label text-label font-semibold uppercase tracking-[0.12em] text-white/60">{col.title}</h2>
              <ul className="mt-3 flex flex-col">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith("/") ? (
                      <Link href={l.href} className={LINK}>
                        {l.label}
                      </Link>
                    ) : (
                      <a href={l.href} className={LINK}>
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 font-body text-small text-white/70">{block("independent-studio")}</p>

        {/*
          The studio elsewhere. An entry the Shop column already carries is not a second destination —
          today that is the lone "Etsy" line sitting between C4 and the imprint, under a column that
          already says "Etsy shop"; it read as a placeholder (review 2026-09-07). Such an entry is
          `hidden` (out of the layout and out of the accessibility tree), and the row itself is hidden
          while every entry is; it appears by itself the day a profile the columns do not carry
          (Instagram, TikTok, …) is set in the environment. The markup stays so the row needs no second
          implementation when that day comes.
        */}
        {SOCIAL_LINKS.length ? (
          <ul aria-label="Game Day Edition elsewhere" hidden={!socialRow.length} className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
            {SOCIAL_LINKS.map((s) =>
              s.platform === "Etsy" ? (
                <li key={s.platform} hidden={COLUMN_HREFS.has("/etsy")}>
                  <Link href="/etsy" aria-label={`Game Day Edition on ${s.platform}`} className={LINK}>
                    {s.platform}
                  </Link>
                </li>
              ) : (
                <li key={s.platform} hidden={COLUMN_HREFS.has(s.url)}>
                  <a href={s.url} rel="me noopener" aria-label={`Game Day Edition on ${s.platform}`} className={LINK}>
                    {s.platform}
                  </a>
                </li>
              ),
            )}
          </ul>
        ) : null}

        <Imprint />

        <p className="mt-4 font-body text-[0.75rem] font-medium leading-[1.4] tracking-[0.01em] text-white/60">
          © {year} Game Day Edition · Designed in Lithuania · Printed by professional labs in the US
        </p>
      </div>
    </footer>
  );
}
