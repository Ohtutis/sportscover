// Tracked outbound redirect: /go/etsy/<sku> → the live Etsy listing (shop-subdomain "Share & Save"
// form) with UTM passthrough. The click is logged to the server log before the 302.
import { NextRequest, NextResponse } from "next/server";
import { listingIdForSku, listingUrl } from "../../../../lib/catalog/listings";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest, context: { params: Promise<{ sku: string }> }) {
  return context.params.then(({ sku }) => {
    const listingId = listingIdForSku(sku);
    const target = new URL(listingUrl(listingId));
    const incoming = request.nextUrl.searchParams;
    const hasUtm = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].some((k) => incoming.has(k));
    if (hasUtm) {
      incoming.forEach((v, k) => { if (k.startsWith("utm_")) target.searchParams.set(k, v); });
    } else {
      const ref = request.headers.get("referer");
      let slug = "site";
      // Only the first path segment is reported: a card ID from /c/<id> is the sole token protecting an
      // unlisted page and must never be written into an Etsy URL.
      try {
        if (ref) {
          const [first] = new URL(ref).pathname.split("/").filter(Boolean);
          slug = !first ? "home" : first === "c" ? "card-page" : first.toLowerCase().replace(/[^a-z0-9-]/g, "");
        }
      } catch { /* ignore */ }
      target.searchParams.set("utm_source", "site");
      target.searchParams.set("utm_medium", "referral");
      target.searchParams.set("utm_campaign", slug);
    }
    console.log(JSON.stringify({ type: "etsy_click", sku: sku.toUpperCase(), listingId, utm: Object.fromEntries(target.searchParams), at: new Date().toISOString() }));
    return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": "no-store" } });
  });
}
