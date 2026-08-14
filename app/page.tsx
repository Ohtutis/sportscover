import type { Metadata } from "next";
import SiteClient from "./site-client";
import { siteConfig } from "./site-config";

export const metadata: Metadata = {
  title: `Custom Youth Sports Posters & Trading Cards | ${siteConfig.brandName}`,
  description: "Turn their best game-day photos into a cinematic poster and a real pack of personalized trading cards. Submit photos for review before you pay.",
};

export default function Home() {
  return <SiteClient turnstileSiteKey={process.env.PUBLIC_TURNSTILE_SITE_KEY || ""} />;
}
