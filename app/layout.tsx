import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "./site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: `Custom Youth Sports Posters & Trading Cards | ${siteConfig.brandName}`,
  description: "Turn real game-day photos into a cinematic poster and a real pack of personalized trading cards. Personal photo review before payment.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: `Their Photos. Their Poster. Their Own Trading Cards. | ${siteConfig.brandName}`,
    description: "A premium wall poster, 25 personalized trading cards, and matching digital artwork—built from real game-day photos.",
    type: "website",
    url: "/",
    images: [{ url: "/og.webp", width: 1200, height: 630, alt: "Cover Moment custom youth athlete poster and trading card experience" }],
  },
  twitter: { card: "summary_large_image", title: `Their Photos. Their Poster. Their Own Trading Cards. | ${siteConfig.brandName}`, description: "A real poster and collector card pack made from their game-day photos.", images: ["/og.webp"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
