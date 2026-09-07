// Owned by seo-config from Wave 1 on (CONTRACTS §5.8). Three route tables live here:
//
//   redirects()  — 308 for every path that used to exist (or that a printed or linked URL still points
//                  at) and now lives elsewhere.
//   headers()    — the security headers on everything, plus `X-Robots-Tag: noindex, nofollow` on the
//                  surfaces that must never be indexed. The registry is code, so the unlisted/private
//                  card paths are known at build time and each gets its OWN exact-path rule: a static
//                  page cannot vary its headers by data at request time, and F1 introduces no proxy
//                  (CONTRACTS §6.2 / §9.2 #6). A visibility change therefore needs a redeploy — which
//                  is already true of the static registry.
//   rewrites()   — `beforeFiles`, one entry per DELETED card, pointing at `/api/gone` so the response
//                  is a real 410. `redirects()` refuses non-3xx status codes and a page component can
//                  only produce 404, so the rewrite is the only way to serve 410 from a static route.
//
// The card paths come from `lib/registry/cards.ts` — Next's config loader transpiles this file, so a
// relative TS import works. If that import ever breaks the build, the fallback is
// `scripts/write-robots-rules.ts` emitting `lib/registry/robots-rules.json` for the config to read.

import type { NextConfig } from "next";
import { deletedCardPaths, privateCardPaths, unlistedCardPaths } from "./lib/registry/cards";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // `payment` is deliberately not denied: Stripe Checkout / Apple Pay (F2) use the Payment Request API.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const noIndexHeaders = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

/** Surfaces that are never indexed, whatever links to them. */
const NOINDEX_SOURCES = [
  "/order/:path*",
  "/t/:path*",
  "/lp/:path*",
  "/api/:path*",
  "/go/:path*",
  "/etsy",
  "/registry/lookup",
];

const nextConfig: NextConfig = {
  // Parallel builders write to their own dist dir (NEXT_DIST_DIR=.next-<name>) so builds never collide.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  reactStrictMode: true,

  async redirects() {
    return [
      // The finish pages (F3) never own the occasion — Senior Night is a page of its own.
      { source: "/styles/senior-night", destination: "/senior-night", permanent: true },
      // `other-sport` is the registry slug for skateboarding; the readable URL wins in public.
      { source: "/sports/other-sport", destination: "/sports/skateboarding", permanent: true },
      // There is no separate verification surface: the card's own page is the verification (spec §6).
      { source: "/verify", destination: "/registry", permanent: true },
      // Pre-rename paths: the old single-page site's order form. Exact matches only, so the F2
      // `/order/new` route is untouched.
      { source: "/order", destination: "/trading-cards", permanent: true },
      { source: "/order-form", destination: "/trading-cards", permanent: true },
    ];
  },

  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      ...NOINDEX_SOURCES.map((source) => ({ source, headers: noIndexHeaders })),
      // One exact-path rule per unlisted / private card (CONTRACTS §6.2).
      ...[...unlistedCardPaths(), ...privateCardPaths()].map((source) => ({
        source,
        headers: noIndexHeaders,
      })),
    ];
  },

  async rewrites() {
    return {
      // Empty while no card has been deleted; the mechanism ships with the test.
      beforeFiles: deletedCardPaths().map((source) => ({ source, destination: "/api/gone" })),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
