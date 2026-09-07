// robots.txt. The disallow list is only for surfaces that are useless or harmful in an index:
// the API, the outbound Etsy redirects (`/etsy`, `/go/*`), the future order flow (`/order/*`), the
// team and campaign landing surfaces (`/t/*`, `/lp/*`) and the lookup POST endpoint.
//
// Unlisted and private card pages are NOT listed here on purpose: robots.txt is public, so naming
// them would publish exactly the list we keep out of the sitemap. They carry `noindex, nofollow` in
// the page metadata and an explicit `X-Robots-Tag` header per path (next.config.ts, CONTRACTS §6.2).

import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/go/", "/etsy", "/order/", "/t/", "/lp/", "/registry/lookup"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
