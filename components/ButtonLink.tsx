import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The button recipe (DESIGN §4.18) shared by CtaPair, EtsyButton and the form buttons. This file knows
 * the outline variants only; the accent primary class is owned by CtaPair (PRIMARY_BUTTON_CLASS) so
 * the accent fill lives where DESIGN §10.4 allows it. Internal page hrefs render a <Link>; route
 * handlers (/go/etsy, /api), hashes, mailto: and external URLs render a plain <a> (nothing to prefetch).
 */
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "outline" | "outline-arena" | "bare";

export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ui font-display uppercase leading-none tracking-[0.04em] transition-[color,background-color,border-color,filter] duration-hover ease-out";

export const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-[0.875rem]",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-[1.0625rem]",
};

export const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  outline: "border-[1.5px] border-ink text-ink hover:bg-ink/5",
  "outline-arena": "border-[1.5px] border-white/40 text-white hover:bg-white/10",
  bare: "",
};

export const buttonClass = (variant: ButtonVariant, size: ButtonSize = "md", extra = ""): string =>
  `${BUTTON_BASE} ${BUTTON_SIZE[size]} ${BUTTON_VARIANT[variant]} ${extra}`.trim();

/** Page routes get <Link>; everything else is a plain anchor. */
export const isPageHref = (href: string): boolean =>
  href.startsWith("/") && !href.startsWith("/go/") && !href.startsWith("/api/") && !href.startsWith("/registry/lookup") && !href.startsWith("//");

export interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  ariaLabel?: string;
}

export function ButtonLink({ href, children, variant = "outline", size = "md", className = "", ariaLabel }: ButtonLinkProps) {
  const cls = buttonClass(variant, size, className);
  if (isPageHref(href)) {
    return (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
