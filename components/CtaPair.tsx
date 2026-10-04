import type { CtaLink, CtaPairProps } from "../lib/cta";
import { ButtonLink, buttonClass, type ButtonSize } from "./ButtonLink";
import { EtsyButton } from "./EtsyButton";

export type { CtaLink, CtaPairProps };

/**
 * The accent primary (DESIGN §4.18). The ONE place the primary button class is written; form
 * buttons import it so `bg-accent` never spreads. Ink text on accent (6.2:1) — never white.
 */
export const PRIMARY_BUTTON_CLASS = "bg-accent text-ink hover:brightness-[0.94] active:brightness-90";

export const primaryButtonClass = (size: ButtonSize = "md", extra = ""): string => buttonClass("bare", size, `${PRIMARY_BUTTON_CLASS} ${extra}`);

const skuFromHref = (href: string): string | undefined => /^\/go\/etsy\/([A-Za-z0-9-]+)/.exec(href)?.[1];

/**
 * Primary + optional secondary (CONTRACTS §3): pages get their pair from `ctaFor()` so a mode switch
 * (Etsy-primary → free proof first → direct checkout) is one flag. Primary first, full width on
 * mobile, ≥ 48 px tall; a TrustLine goes under it. `stack` keeps the two in one full-width column at
 * every width — a tier card is ~176 px wide at 768 and cannot hold two buttons side by side.
 */
export function CtaPair({ primary, secondary, size = "md", tone = "stock", stack = false, className = "" }: CtaPairProps & { size?: ButtonSize }) {
  const width = stack ? "w-full" : "w-full sm:w-auto";
  const render = (link: CtaLink, fallback: "primary" | "outline") => {
    const kind = link.kind ?? fallback;
    if (kind === "etsy") {
      const sku = skuFromHref(link.href);
      if (sku) return <EtsyButton sku={sku} label={link.label} tone={tone} size={size} className={width} />;
    }
    if (kind === "primary") {
      return (
        <ButtonLink href={link.href} variant="bare" size={size} className={`${PRIMARY_BUTTON_CLASS} ${width}`}>
          {link.label}
        </ButtonLink>
      );
    }
    return (
      <ButtonLink href={link.href} variant={tone === "arena" ? "outline-arena" : "outline"} size={size} className={width}>
        {link.label}
      </ButtonLink>
    );
  };
  return (
    <div className={`flex flex-col gap-3 ${stack ? "" : "sm:flex-row"} ${className}`.replace(/\s+/g, " ").trim()}>
      {render(primary, "primary")}
      {secondary ? render(secondary, "outline") : null}
    </div>
  );
}
