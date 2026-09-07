import type { Metadata, Viewport } from "next";
import "./globals.css";
import { JsonLd } from "../components/JsonLd";
import { siteFontClass } from "../lib/fonts/site";
import { organization, website } from "../lib/seo/jsonld";
import { PAGES } from "../lib/seo/titles";
import { BRAND, SITE_URL, VERIFICATION } from "../lib/site";

const other: Record<string, string> = {};
if (VERIFICATION.bing) other["msvalidate.01"] = VERIFICATION.bing;
if (VERIFICATION.pinterest) other["p:domain_verify"] = VERIFICATION.pinterest;
if (VERIFICATION.facebook) other["facebook-domain-verification"] = VERIFICATION.facebook;

const home = PAGES["/"];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Pages pass the head phrase only; the template appends the brand (CONTRACTS §6.1). The home page
  // sets its own absolute title (GAPS #24), which is also the default here.
  title: { default: home.title, template: `%s | ${BRAND}` },
  description: home.description,
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }], shortcut: "/favicon.svg" },
  verification: { google: VERIFICATION.google || undefined, other: Object.keys(other).length ? other : undefined },
  openGraph: {
    siteName: BRAND,
    type: "website",
    locale: "en_US",
    // Fallback only — every marketing route gets a generated image from app/(marketing)/opengraph-image.tsx.
    images: [{ url: "/og.webp", width: 1200, height: 630, alt: `${BRAND} — custom sports trading cards and posters from your photos` }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#F4F3EF", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={siteFontClass}>
      <body>
        {children}
        <JsonLd data={organization()} />
        <JsonLd data={website()} />
      </body>
    </html>
  );
}
