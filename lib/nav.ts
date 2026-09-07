// Navigation tables — COPY §1.1 (header, mobile menu) and §1.2 (footer columns). Labels and hrefs are
// pasted from the copy pack; the only computed entry is "Teams & clubs" (mailto in F1, /teams in F2).
import { SITE_SELLS_DIRECT, SUPPORT_EMAIL } from "./site";

export interface NavLink {
  label: string;
  href: string;
}

/** Desktop header nav, left → right. */
export const HEADER_LINKS: NavLink[] = [
  { label: "Trading Cards", href: "/trading-cards" },
  { label: "Posters", href: "/posters" },
  { label: "Complete Set", href: "/complete-set" },
  { label: "Senior Night", href: "/senior-night" },
  { label: "How it's made", href: "/how-it-works" },
  { label: "Guarantee", href: "/guarantee" },
  { label: "About", href: "/about" },
];

/** The five links the mobile sheet adds under the main nav. */
export const MOBILE_EXTRA_LINKS: NavLink[] = [
  { label: "Photo guide", href: "/photo-guide" },
  { label: "Registry", href: "/registry" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Etsy shop", href: "/etsy" },
];

/** F1: teams are handled by email; F2 gets the /teams page (COPY §1.2). */
export const TEAMS_HREF = SITE_SELLS_DIRECT ? "/teams" : `mailto:${SUPPORT_EMAIL}?subject=Team%20order`;

export type FooterColumnTitle = "Shop" | "Trust" | "Legal";

export const FOOTER_COLUMNS: { title: FooterColumnTitle; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Trading Cards", href: "/trading-cards" },
      { label: "Posters", href: "/posters" },
      { label: "Complete Set", href: "/complete-set" },
      { label: "Senior Night", href: "/senior-night" },
      { label: "Teams & clubs", href: TEAMS_HREF },
      { label: "Etsy shop", href: "/etsy" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Our promise", href: "/guarantee" },
      { label: "How it's made", href: "/how-it-works" },
      { label: "Photo guide", href: "/photo-guide" },
      { label: "Look up a card", href: "/registry" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Biometric policy", href: "/privacy/biometric" },
      { label: "Terms", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];
