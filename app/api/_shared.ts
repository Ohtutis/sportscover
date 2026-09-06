import { SITE_URL } from "../../lib/site";
import { createClient } from "@supabase/supabase-js";

export const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "athlete-submissions";

export function adminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("The secure submission service is not configured yet.");
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function text(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  if (origin === new URL(SITE_URL).origin) return true;
  const host = request.headers.get("host");
  return Boolean(host && new URL(origin).host === host);
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value: string) {
  const secret = process.env.SUBMISSION_SIGNING_SECRET;
  if (!secret) throw new Error("The submission signing secret is not configured.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

export async function createSubmissionToken(submissionId: string) {
  const expires = Date.now() + 30 * 60 * 1000;
  return `${expires}.${await sign(`${submissionId}.${expires}`)}`;
}

export async function verifySubmissionToken(submissionId: string, token: string) {
  const [expiresString, signature] = token.split(".");
  const expires = Number(expiresString);
  if (!signature || !Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = await sign(`${submissionId}.${expires}`);
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  return mismatch === 0;
}

export async function verifyTurnstile(token: string, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!token) return false;
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) body.set("remoteip", forwarded);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function rateLimited(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const digest = bytesToHex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip)));
  const now = Date.now();
  const current = attempts.get(digest);
  if (!current || current.resetAt < now) {
    attempts.set(digest, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

export function jsonError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "The request could not be processed.";
  return Response.json({ error: message }, { status });
}
