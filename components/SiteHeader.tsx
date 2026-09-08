import { HEADER_LINKS, MOBILE_EXTRA_LINKS } from "../lib/nav";
import { ctaFor } from "../lib/cta";
import { BrandMark } from "./BrandMark";
import { ButtonLink } from "./ButtonLink";
import { CtaPair, PRIMARY_BUTTON_CLASS } from "./CtaPair";
import { HeaderNav, MobileMenu } from "./MobileMenu";
import { Pill } from "./Pill";
import { TrustLine } from "./TrustLine";

export interface SiteHeaderProps {
  /** `arena` (the /c route group): silver shield, white wordmark, the REGISTERED EDITION pill, no shop CTAs. */
  tone?: "stock" | "arena";
  className?: string;
}

const SkipLink = () => (
  <a
    href="#main"
    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-ui focus:bg-stock focus:px-4 focus:py-3 focus:font-body focus:text-body focus:text-ink"
  >
    Skip to content
  </a>
);

/** Header buttons are `sm` (h-10); the floor keeps every tap target at 44 px (DESIGN §11 item 19). */
const HEADER_BUTTON_CLASS = "min-h-11";

/**
 * Sticky, solid, no blur, no shrink (DESIGN §4.20). Left: BrandMark. Centre (≥ lg): the seven nav
 * links. Right: the header CTA pair from `ctaFor("header")` — "Look up a card" outline and the
 * primary "Order on Etsy →" — then the menu button (< lg). The mobile sheet is the `MobileMenu`
 * island; the CTA pair and the trust line inside it are rendered here on the server and passed in as
 * children, so the island ships no extra JS.
 *
 * Between 1024 px and 1279 px the outline CTA is held back: the seven links need 633 px there and
 * only 662 px exist beside the primary button alone. It returns at 1280 px, where the container is
 * capped at 1200 px and the row measures 681 px of links inside 705 px.
 */
export function SiteHeader({ tone = "stock", className = "" }: SiteHeaderProps) {
  if (tone === "arena") {
    return (
      <header className={`sticky top-0 z-40 border-b border-arena-hairline bg-arena text-white ${className}`.trim()}>
        <SkipLink />
        <div className="container-site flex h-14 items-center justify-between gap-4 md:h-16">
          <BrandMark tone="arena" />
          <Pill tone="outline-silver">REGISTERED EDITION</Pill>
        </div>
      </header>
    );
  }

  const pair = ctaFor("header");
  return (
    <header className={`sticky top-0 z-40 border-b border-hairline bg-stock text-ink ${className}`.trim()}>
      <SkipLink />
      {/* 56 / 64 / 64 per DESIGN §2.6 — the 64 px step is at `md`, not `lg`; it was measuring 57 px at
          768 and 834 (layout audit 2026-09-08). */}
      <div className="container-site flex h-14 items-center justify-between gap-4 md:h-16">
        <BrandMark />
        <HeaderNav links={HEADER_LINKS} className="hidden lg:block" />
        <div className="flex items-center gap-2">
          {pair.secondary ? (
            <div className="hidden xl:block">
              <ButtonLink href={pair.secondary.href} size="sm" className={HEADER_BUTTON_CLASS}>
                {pair.secondary.label}
              </ButtonLink>
            </div>
          ) : null}
          <ButtonLink href={pair.primary.href} variant="bare" size="sm" className={`${PRIMARY_BUTTON_CLASS} ${HEADER_BUTTON_CLASS}`}>
            {pair.primary.label}
          </ButtonLink>
          <MobileMenu links={HEADER_LINKS} extraLinks={MOBILE_EXTRA_LINKS}>
            <CtaPair {...pair} />
            <TrustLine />
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
