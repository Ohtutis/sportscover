import { ButtonLink, type ButtonSize } from "./ButtonLink";

/**
 * "Also on Etsy →" — outline only, never orange, never with a price (DESIGN §4.18). Every Etsy href
 * goes through /go/etsy/<sku>; no marketplace URL is ever written in a component.
 */
export const ETSY_BUTTON_LABEL = "Also on Etsy →";

export interface EtsyButtonProps {
  sku: string;
  label?: string;
  tone?: "stock" | "arena";
  size?: ButtonSize;
  className?: string;
}

export function EtsyButton({ sku, label = ETSY_BUTTON_LABEL, tone = "stock", size = "md", className = "" }: EtsyButtonProps) {
  return (
    <ButtonLink href={`/go/etsy/${sku}`} variant={tone === "arena" ? "outline-arena" : "outline"} size={size} className={className}>
      {label}
    </ButtonLink>
  );
}
