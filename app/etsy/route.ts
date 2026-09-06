// One-link shop redirect for bios and profiles.
import { NextResponse } from "next/server";
import { ETSY_SHOP_URL } from "../../lib/site";

export const dynamic = "force-dynamic";

export function GET() {
  const target = new URL(ETSY_SHOP_URL);
  target.searchParams.set("utm_source", "site");
  target.searchParams.set("utm_medium", "referral");
  target.searchParams.set("utm_campaign", "shop");
  return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": "no-store" } });
}
