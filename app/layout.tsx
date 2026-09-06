import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { JsonLd } from "../components/JsonLd";
import { BRAND, ETSY_SHOP_URL, OWNER_NAME, SITE_URL, SOCIAL_URLS, SUPPORT_EMAIL, TAGLINE, VERIFICATION } from "../lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const oswald = Oswald({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-oswald", display: "swap" });

const other: Record<string, string> = {};
if (VERIFICATION.bing) other["msvalidate.01"] = VERIFICATION.bing;
if (VERIFICATION.pinterest) other["p:domain_verify"] = VERIFICATION.pinterest;
if (VERIFICATION.facebook) other["facebook-domain-verification"] = VERIFICATION.facebook;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `Custom Sports Trading Cards & Posters From Your Photos | ${BRAND}`, template: `%s | ${BRAND}` },
  description: "One athlete, one registered edition. Custom trading cards and posters built from the photos you already have — proof before print, printed in the US.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  verification: { google: VERIFICATION.google || undefined, other: Object.keys(other).length ? other : undefined },
  openGraph: {
    title: `${TAGLINE} | ${BRAND}`,
    description: "A custom poster, printed trading cards and a registered edition — built from the photos you already have. Proof before print.",
    type: "website",
    url: "/",
    siteName: BRAND,
    images: [{ url: "/og.webp", width: 1200, height: 630, alt: `${BRAND} — custom sports posters and trading cards from your photo` }],
  },
  twitter: { card: "summary_large_image", title: `${TAGLINE} | ${BRAND}`, description: "Custom trading cards and posters built from your athlete's photos. Proof before print.", images: ["/og.webp"] },
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/shield.png`,
  email: SUPPORT_EMAIL,
  founder: { "@type": "Person", name: OWNER_NAME },
  sameAs: [ETSY_SHOP_URL, ...SOCIAL_URLS],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body>
        {children}
        <JsonLd data={organization} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
