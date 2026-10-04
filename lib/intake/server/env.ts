// Free-proof intake configuration, read from the environment at REQUEST time — never at import — so a
// missing variable degrades one request honestly (health says false, start answers 503, an email that
// cannot be sent is logged) instead of failing the build, and so tests can stub it per case.
//
// Nothing here is logged. The only values that ever leave the server are the Supabase project URL and
// its PUBLIC anon key (the start response hands both to the browser for the signed-upload headers —
// the anon key is public by design) and the bucket name in the health answer.

import { BRAND, SUPPORT_EMAIL } from "../../site";

export const DEFAULT_BUCKET = "athlete-submissions";
/** "Game Day Edition <hello@gamedayedition.com>" — the sender when RESEND_FROM_EMAIL is unset. */
export const DEFAULT_FROM = `${BRAND} <${SUPPORT_EMAIL}>`;

const read = (name: string): string => (process.env[name] ?? "").trim();

/** https for a real project; plain http only for a local Supabase (`supabase start`). */
const SUPABASE_URL_SHAPE = /^(https:\/\/[^\s/]+|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)(\/[^\s]*)?$/i;

export interface StorageConfig {
  /** https://<project>.supabase.co, no trailing slash. */
  url: string;
  /** The PUBLIC key — the browser sends it with each signed upload. */
  anonKey: string;
  /** Server only: writes request.json, issues signed upload URLs, signs the owner's links. */
  serviceKey: string;
  bucket: string;
}

/** All three Supabase values or nothing: the flow needs the service key AND the anon key. */
export function storageConfig(): StorageConfig | null {
  const url = read("SUPABASE_URL").replace(/\/+$/, "");
  const anonKey = read("SUPABASE_ANON_KEY");
  const serviceKey = read("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey || !SUPABASE_URL_SHAPE.test(url)) return null;
  return { url, anonKey, serviceKey, bucket: read("SUPABASE_STORAGE_BUCKET") || DEFAULT_BUCKET };
}

export interface EmailConfig {
  apiKey: string;
  from: string;
  /** Where a new request is announced. */
  ownerTo: string;
  /** Every email answers to the support inbox. */
  replyTo: string;
}

export function emailConfig(): EmailConfig | null {
  const apiKey = read("RESEND_API_KEY");
  if (!apiKey) return null;
  return {
    apiKey,
    from: read("RESEND_FROM_EMAIL") || DEFAULT_FROM,
    ownerTo: read("OWNER_NOTIFICATION_EMAIL") || SUPPORT_EMAIL,
    replyTo: SUPPORT_EMAIL,
  };
}

/**
 * The Turnstile secret, but only when the PUBLIC site key is set as well: a secret without the widget on
 * the page means no browser can ever produce a token, and every parent would be refused.
 */
export function turnstileSecret(): string | null {
  const secret = read("TURNSTILE_SECRET_KEY");
  return secret && read("NEXT_PUBLIC_TURNSTILE_SITE_KEY") ? secret : null;
}

/**
 * Key material for the completeToken and the IP hash: SUBMISSION_SIGNING_SECRET, else the service key
 * (token.ts hashes either into the HMAC key, so the service key itself is never the key).
 */
export function signingMaterial(): string | null {
  const explicit = read("SUBMISSION_SIGNING_SECRET");
  if (explicit) return `secret:${explicit}`;
  const service = read("SUPABASE_SERVICE_ROLE_KEY");
  return service ? `service-key:${service}` : null;
}

export interface IntakeHealth {
  storage: boolean;
  email: boolean;
  turnstile: boolean;
  /** The bucket name when storage is configured — a name, never a credential. */
  bucket: string | null;
}

export function intakeHealth(): IntakeHealth {
  const storage = storageConfig();
  return {
    storage: Boolean(storage && signingMaterial()),
    email: Boolean(emailConfig()),
    turnstile: Boolean(turnstileSecret()),
    bucket: storage?.bucket ?? null,
  };
}
