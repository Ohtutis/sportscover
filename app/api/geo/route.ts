// GET /api/geo — the visitor's country as Vercel's edge sees it (`x-vercel-ip-country`), nothing else.
// The Meta pixel (components/MetaPixel.tsx) asks this before it loads: the shop sells in the US, and a
// visitor in the EU, the EEA, the UK or Switzerland — where an advertising cookie needs consent first —
// gets no pixel at all instead of a consent banner on the ad landing page (2026-10-06). The address
// itself is never read, stored or returned; under /api, so it is never indexed.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const country = (request.headers.get("x-vercel-ip-country") ?? "").toUpperCase().slice(0, 2);
  return NextResponse.json({ country: /^[A-Z]{2}$/.test(country) ? country : "" }, { headers: { "Cache-Control": "private, no-store" } });
}
