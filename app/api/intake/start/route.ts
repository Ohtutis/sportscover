// POST /api/intake/start — step 1 of a free-proof request: validate, store request.json, hand the browser
// one signed upload URL per file. The browser then PUTs the files straight to storage
// (lib/intake/upload.ts) and closes the request with POST /api/intake/complete.
//
// The order of the checks is deliberate — a bot never learns the configuration cheaply, and a parent is
// never throttled by their own typos:
//   1. same origin, JSON, ≤ 256 KB          403 / 415 / 413 · unreadable JSON → 400 { errors: { form } }
//   2. parseProofRequest (incl. honeypot)    400 { errors }                 — not counted by the rate limit
//   3. rate limit: 10 starts / 10 min / IP   429 { error: "rate_limited" }  — every valid start counts
//   4. configuration                         503 { error: "storage_unconfigured" }
//   5. Turnstile, only when switched on      403 { error: "challenge_failed" }
//   6. request.json (status "uploading") is written FIRST, then the signed upload URLs →
//      200 { requestId, completeToken, storage: { url, anonKey }, uploads: { photos, crest } }
//      Storage failing here → 503 { error: "storage_unavailable" } (the parent's fallback is the same:
//      email the photos).
//
// Only the HTTP method is exported: Next type-checks a route file's exports.
import type { NextResponse } from "next/server";
import { INTAKE_COPY } from "../../../../lib/intake/copy";
import { signingMaterial, storageConfig, turnstileSecret } from "../../../../lib/intake/server/env";
import { clientIp, jsonResponse, logOutcome, readJsonBody, refusalResponse } from "../../../../lib/intake/server/http";
import { takeRateLimit } from "../../../../lib/intake/server/ratelimit";
import { buildRecord } from "../../../../lib/intake/server/record";
import { createUploadTarget, crestPath, openBucket, photoPath, requestJsonPath, writeJson } from "../../../../lib/intake/server/storage";
import { hashIp, signCompleteToken } from "../../../../lib/intake/server/token";
import { verifyTurnstile } from "../../../../lib/intake/server/turnstile";
import { makeRequestId, parseProofRequest } from "../../../../lib/intake/types";
import { SUPPORT_EMAIL } from "../../../../lib/site";

export const dynamic = "force-dynamic";

const CHALLENGE_FAILED = "We couldn't confirm the form was sent by a person. Reload the page and send it again.";
const STORAGE_UNAVAILABLE = `Photo uploads aren't working right now. Email your photos and the details above to ${SUPPORT_EMAIL} and we'll build the proof the same way.`;

function done(requestId: string | null, outcome: string, response: NextResponse): NextResponse {
  logOutcome("start", requestId, outcome, response.status);
  return response;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readJsonBody(request);
  if (!body.ok) {
    return done(null, body.outcome, body.status === 400 ? jsonResponse({ errors: { form: body.message } }, 400) : refusalResponse(body));
  }

  const parsed = parseProofRequest(body.value);
  if (!parsed.ok) return done(null, parsed.errors.website ? "honeypot" : "invalid", jsonResponse({ errors: parsed.errors }, 400));

  const ip = clientIp(request);
  const limit = takeRateLimit(ip);
  if (!limit.ok) {
    return done(
      null,
      "rate_limited",
      jsonResponse({ error: "rate_limited", message: INTAKE_COPY.errors.tooMany }, 429, { "Retry-After": String(limit.retryAfterSeconds) }),
    );
  }

  const cfg = storageConfig();
  const material = signingMaterial();
  if (!cfg || !material) {
    return done(null, "storage_unconfigured", jsonResponse({ error: "storage_unconfigured", message: INTAKE_COPY.errors.storageMissing(SUPPORT_EMAIL) }, 503));
  }

  const secret = turnstileSecret();
  if (secret) {
    const outcome = await verifyTurnstile(parsed.value.turnstileToken, secret, ip === "unknown" ? null : ip);
    if (outcome === "failed") return done(null, "challenge_failed", jsonResponse({ error: "challenge_failed", message: CHALLENGE_FAILED }, 403));
    if (outcome === "unreachable") console.warn("[intake] start turnstile unreachable — allowed");
  }

  const now = new Date();
  const requestId = makeRequestId(now);
  const issued = {
    photos: parsed.value.photos.map((photo, i) => photoPath(requestId, i, photo.name)),
    crest: parsed.value.crest ? crestPath(requestId, parsed.value.crest.name) : null,
  };
  try {
    const bucket = openBucket(cfg);
    const record = buildRecord({
      requestId,
      request: parsed.value,
      issued,
      now,
      ipHash: await hashIp(ip, material, now),
      userAgent: request.headers.get("user-agent") ?? "",
    });
    // First, so a parent whose upload never finishes is still a stored request with contact details.
    await writeJson(bucket, requestJsonPath(requestId), record, false);
    const [photos, crest] = await Promise.all([
      Promise.all(issued.photos.map((path) => createUploadTarget(bucket, path))),
      issued.crest ? createUploadTarget(bucket, issued.crest) : Promise.resolve(null),
    ]);
    const completeToken = await signCompleteToken(requestId, material, now.getTime());
    return done(requestId, "ok", jsonResponse({ requestId, completeToken, storage: { url: cfg.url, anonKey: cfg.anonKey }, uploads: { photos, crest } }));
  } catch (error) {
    console.warn(`[intake] start ${requestId} storage error: ${error instanceof Error ? error.message : "unknown"}`);
    return done(requestId, "storage_unavailable", jsonResponse({ error: "storage_unavailable", message: STORAGE_UNAVAILABLE }, 503));
  }
}
