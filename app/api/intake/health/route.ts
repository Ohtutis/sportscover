// GET /api/intake/health — is the free-proof intake switched on? Booleans and the bucket NAME only,
// never a value: { storage, email, turnstile, bucket }. Never cached, so a fresh deploy with new
// environment variables reads true at once.
//
// Only the HTTP method is exported: Next type-checks a route file's exports.
import type { NextResponse } from "next/server";
import { intakeHealth } from "../../../../lib/intake/server/env";
import { jsonResponse, logOutcome } from "../../../../lib/intake/server/http";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const health = intakeHealth();
  logOutcome("health", null, health.storage ? "on" : "off", 200);
  return jsonResponse(health);
}
