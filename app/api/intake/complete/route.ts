// POST /api/intake/complete — step 3 of a free-proof request: the browser has PUT its files to the signed
// URLs from /api/intake/start; this closes the request and sends the two emails.
//
//   1. same origin, JSON, ≤ 256 KB                         403 / 415 / 413 / 400
//   2. { requestId, completeToken, uploaded: { photos: string[], crest: string | null } }    400 bad_request
//   3. configuration                                        503 storage_unconfigured
//   4. completeToken (HMAC over the id + expiry)             403 forbidden
//   5. request.json exists and is still "uploading"          404 not_found · 409 already_received
//      (the 409 carries the requestId: the request is already in, so the page can show its thanks)
//   6. every path is one start issued for THIS request      400 bad_path
//   7. request.json rewritten — status "received", receivedAt, uploaded (storage failure → 503, retryable)
//   8. 7-day signed links, the owner notification and the parent's confirmation (failures logged only)
//   → 200 { ok: true, requestId, emailed }   — `emailed` is false when either email did not go out.
//
// Fewer photos than chosen still completes: the parent's details are the lead, and both emails say which
// photos did not arrive.
//
// Only the HTTP method is exported: Next type-checks a route file's exports.
import type { NextResponse } from "next/server";
import { sendRequestEmails } from "../../../../lib/intake/server/email";
import { emailConfig, signingMaterial, storageConfig } from "../../../../lib/intake/server/env";
import { jsonResponse, logOutcome, readJsonBody, refusalResponse } from "../../../../lib/intake/server/http";
import type { StoredRequest } from "../../../../lib/intake/server/record";
import { isInsideRequestFolder, openBucket, readJson, requestJsonPath, signedLinks, writeJson } from "../../../../lib/intake/server/storage";
import { verifyCompleteToken } from "../../../../lib/intake/server/token";
import { PHOTO_RULES, REQUEST_ID } from "../../../../lib/intake/types";
import { SUPPORT_EMAIL } from "../../../../lib/site";

export const dynamic = "force-dynamic";

const STORAGE_UNAVAILABLE = `Your photos are uploaded, but we couldn't close the request just now. Try again in a minute, or email ${SUPPORT_EMAIL} and mention your photos.`;

interface CompleteBody {
  requestId: string;
  completeToken: string;
  photos: string[];
  crest: string | null;
}

function parseCompleteBody(raw: unknown): CompleteBody | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const requestId = typeof o.requestId === "string" ? o.requestId : "";
  const completeToken = typeof o.completeToken === "string" ? o.completeToken : "";
  const uploaded = o.uploaded && typeof o.uploaded === "object" && !Array.isArray(o.uploaded) ? (o.uploaded as Record<string, unknown>) : null;
  if (!REQUEST_ID.test(requestId) || !completeToken || completeToken.length > 200 || !uploaded) return null;
  const photos = uploaded.photos;
  if (!Array.isArray(photos) || photos.length > PHOTO_RULES.max || !photos.every((p): p is string => typeof p === "string")) return null;
  const crest = uploaded.crest ?? null;
  if (crest !== null && typeof crest !== "string") return null;
  return { requestId, completeToken, photos, crest };
}

function done(requestId: string | null, outcome: string, response: NextResponse): NextResponse {
  logOutcome("complete", requestId, outcome, response.status);
  return response;
}

export async function POST(request: Request): Promise<NextResponse> {
  const raw = await readJsonBody(request);
  if (!raw.ok) return done(null, raw.outcome, refusalResponse(raw));
  const body = parseCompleteBody(raw.value);
  if (!body) return done(null, "bad_request", jsonResponse({ error: "bad_request", message: "The upload summary could not be read." }, 400));
  const id = body.requestId;

  const cfg = storageConfig();
  const material = signingMaterial();
  if (!cfg || !material) return done(id, "storage_unconfigured", jsonResponse({ error: "storage_unconfigured", message: STORAGE_UNAVAILABLE }, 503));

  if (!(await verifyCompleteToken(id, body.completeToken, material))) {
    return done(id, "bad_token", jsonResponse({ error: "forbidden", message: "This upload session has expired. Send the form again." }, 403));
  }

  const bucket = openBucket(cfg);
  const jsonPath = requestJsonPath(id);
  let record: StoredRequest | null;
  try {
    record = await readJson<StoredRequest>(bucket, jsonPath);
  } catch (error) {
    console.warn(`[intake] complete ${id} storage error: ${error instanceof Error ? error.message : "unknown"}`);
    return done(id, "storage_unavailable", jsonResponse({ error: "storage_unavailable", message: STORAGE_UNAVAILABLE }, 503));
  }
  if (!record) return done(id, "not_found", jsonResponse({ error: "not_found", message: "We couldn't find this request." }, 404));
  if (record.status !== "uploading") {
    return done(id, "already_received", jsonResponse({ error: "already_received", message: "This request is already in.", requestId: id }, 409));
  }

  const issuedPhotos = new Set(record.issued.photos);
  const pathsOk =
    body.photos.every((p) => isInsideRequestFolder(id, p) && issuedPhotos.has(p)) &&
    (body.crest === null || (isInsideRequestFolder(id, body.crest) && body.crest === record.issued.crest));
  if (!pathsOk) return done(id, "bad_path", jsonResponse({ error: "bad_path", message: "The upload summary names a file this request did not send." }, 400));

  const uploaded = { photos: record.issued.photos.filter((p) => body.photos.includes(p)), crest: body.crest };
  const received: StoredRequest = { ...record, status: "received", receivedAt: new Date().toISOString(), uploaded };
  try {
    await writeJson(bucket, jsonPath, received, true);
  } catch (error) {
    console.warn(`[intake] complete ${id} storage error: ${error instanceof Error ? error.message : "unknown"}`);
    return done(id, "storage_unavailable", jsonResponse({ error: "storage_unavailable", message: STORAGE_UNAVAILABLE }, 503));
  }

  const links = await signedLinks(bucket, [...uploaded.photos, ...(uploaded.crest ? [uploaded.crest] : []), jsonPath]);
  const emails = await sendRequestEmails(emailConfig(), received, { files: links, requestJson: links.get(jsonPath) ?? null });
  try {
    await writeJson(bucket, jsonPath, { ...received, emails: { ...emails, at: new Date().toISOString() } }, true);
  } catch {
    // Best effort: the record is already "received"; this only remembers which emails went out.
  }
  const emailed = emails.owner && emails.customer;
  return done(id, emailed ? "ok" : "ok_email_failed", jsonResponse({ ok: true, requestId: id, emailed }));
}
