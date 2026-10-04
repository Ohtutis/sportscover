// Shared plumbing for the /api/intake/* route handlers: JSON in and out, never cached, same-origin only,
// bounded bodies, one log line per request (request id + outcome + status — never a key, an address or
// a photo link).

import { NextResponse } from "next/server";

/** A start body is a few KB (file names and sizes, never file contents); 256 KB is a generous ceiling. */
export const MAX_JSON_BYTES = 256 * 1024;

export const NO_STORE = { "Cache-Control": "no-store" } as const;

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): NextResponse {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

/** One line per request. */
export function logOutcome(route: "start" | "complete" | "health", requestId: string | null, outcome: string, status: number): void {
  console.info(`[intake] ${route} ${requestId ?? "-"} ${outcome} ${status}`);
}

/**
 * When the browser sends an Origin, its host must be this site's host (the Host header, the forwarded
 * host behind Vercel's proxy, or the request URL's host). No Origin — curl, a server — passes; the
 * JSON content type below already forces a CORS preflight on any cross-site browser request.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  let urlHost = "";
  try {
    urlHost = new URL(request.url).host;
  } catch {
    urlHost = "";
  }
  return [request.headers.get("host"), request.headers.get("x-forwarded-host"), urlHost]
    .filter((h): h is string => Boolean(h))
    .some((h) => h.split(",")[0].trim().toLowerCase() === originHost);
}

/** The client address as Vercel reports it (first x-forwarded-for hop), else x-real-ip, else "unknown". */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first.slice(0, 64);
  }
  return (request.headers.get("x-real-ip") ?? "").trim().slice(0, 64) || "unknown";
}

export interface BodyRefusal {
  ok: false;
  outcome: string;
  status: number;
  error: string;
  message: string;
}

export type BodyResult = { ok: true; value: unknown } | BodyRefusal;

const refuse = (outcome: string, status: number, error: string, message: string): BodyRefusal => ({ ok: false, outcome, status, error, message });

/** The refusal as `{ error, message }` — the shape every non-400 intake answer uses. */
export const refusalResponse = (r: BodyRefusal): NextResponse => jsonResponse({ error: r.error, message: r.message }, r.status);

/** Same-origin check, JSON content type, size ceiling, then JSON.parse — or why not. */
export async function readJsonBody(request: Request): Promise<BodyResult> {
  if (!isSameOrigin(request)) return refuse("cross_origin", 403, "forbidden", "This form can only be sent from gamedayedition.com.");
  const type = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!type.includes("application/json")) return refuse("bad_content_type", 415, "unsupported_media_type", "Send the form as JSON.");
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) return refuse("too_large", 413, "payload_too_large", "The form is too large to send.");
  let text: string;
  try {
    text = await request.text();
  } catch {
    return refuse("unreadable", 400, "bad_request", "The form could not be read. Please try again.");
  }
  if (new TextEncoder().encode(text).length > MAX_JSON_BYTES) return refuse("too_large", 413, "payload_too_large", "The form is too large to send.");
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return refuse("bad_json", 400, "bad_request", "The form could not be read. Please try again.");
  }
}
