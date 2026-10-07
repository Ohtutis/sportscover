// Navigation tables — COPY §1.1 (header, mobile menu) and §1.2 (footer columns). Labels and hrefs are
// pasted from the copy pack. 2026-10-04 additions: "Free proof" opens the footer's Shop column (D29 — the
// site's conversion is the free-proof request) and "Blog" joins the Trust column and the mobile sheet.
// 2026-10-06 (SEO plan): /teams, /banners, /sports and /christmas-gift exist, so "Teams & clubs" is a
// page again, "Banners" and "By sport" join the Shop column and the mobile sheet, and the seasonal
// "Christmas gifts" link sits in the Shop column all year (the page's copy switches with the calendar).
import { INTAKE_PATH } from "./intake/copy";

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

/**
 * On /free-proof (the ads landing, brief §14, 2026-10-07) the header keeps the parent in the funnel: three
 * anchors on the page instead of the shop links. The CTA pair and the footer are unchanged.
 */
export const FUNNEL_LINKS: NavLink[] = [
  { label: "How it works", href: "/free-proof#how-it-works" },
  { label: "Examples", href: "/free-proof#examples" },
  { label: "FAQ", href: "/free-proof#faq" },
];

/** Whether a pathname is the free-proof funnel (the form, its per-sport twins, the thanks page). */
export const isFunnelPath = (pathname: string): boolean => pathname === "/free-proof" || pathname.startsWith("/free-proof/");

/** The links the mobile sheet adds under the main nav (the sheet's own CTA pair carries the free proof). */
export const MOBILE_EXTRA_LINKS: NavLink[] = [
  { label: "Banners", href: "/banners" },
  { label: "By sport", href: "/sports" },
  { label: "Photo guide", href: "/photo-guide" },
  { label: "Registry", href: "/registry" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Etsy shop", href: "/etsy" },
];

/** /teams is built (2026-10-06): the page explains today's email-first team setup and carries the mailto itself. */
export const TEAMS_HREF = "/teams";

export type FooterColumnTitle = "Shop" | "Trust" | "Legal";

export const FOOTER_COLUMNS: { title: FooterColumnTitle; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Free proof", href: INTAKE_PATH },
      { label: "Trading Cards", href: "/trading-cards" },
      { label: "Posters", href: "/posters" },
      { label: "Complete Set", href: "/complete-set" },
      { label: "Senior Night", href: "/senior-night" },
      { label: "Banners", href: "/banners" },
      { label: "By sport", href: "/sports" },
      { label: "Christmas gifts", href: "/christmas-gift" },
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
      { label: "Blog", href: "/blog" },
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
