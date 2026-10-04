// The completeToken: proof that a POST /api/intake/complete comes from the browser that started the
// request. HMAC-SHA256 (Web Crypto) over the request id and an expiry, compared in constant time.
//
//   token = "<expiry unix seconds>.<base64url HMAC(key, "complete|<requestId>|<expiry>")>"
//   key   = SHA-256("gde-intake|" + signing material)   (env.ts: SUBMISSION_SIGNING_SECRET or the service key)
//
// Lifetime is two hours, the same as the Supabase signed upload URLs it travels with: a parent on a slow
// connection whose ten originals take longer than a shorter token would otherwise end with every photo
// stored and no request — the token only completes this one request, once, so the longer life costs
// nothing.

export const COMPLETE_TOKEN_TTL_SECONDS = 2 * 60 * 60;

const encoder = new TextEncoder();

async function hmacKey(material: string): Promise<CryptoKey> {
  const raw = await crypto.subtle.digest("SHA-256", encoder.encode(`gde-intake|${material}`));
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function mac(material: string, message: string): Promise<Uint8Array> {
  const key = await hmacKey(material);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Constant-time equality: every byte is compared whatever the first difference. */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signCompleteToken(requestId: string, material: string, nowMs: number = Date.now(), ttlSeconds: number = COMPLETE_TOKEN_TTL_SECONDS): Promise<string> {
  const expiry = Math.floor(nowMs / 1000) + ttlSeconds;
  return `${expiry}.${toBase64Url(await mac(material, `complete|${requestId}|${expiry}`))}`;
}

/** True only for an unexpired token minted for exactly this request id with this key. */
export async function verifyCompleteToken(requestId: string, token: unknown, material: string, nowMs: number = Date.now()): Promise<boolean> {
  if (typeof token !== "string") return false;
  const match = /^(\d{9,12})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return false;
  const expiry = Number(match[1]);
  if (!Number.isSafeInteger(expiry) || expiry * 1000 <= nowMs) return false;
  // Compare the canonical ENCODED signatures: decoding first would accept other spellings of the same
  // MAC (the last base64url character carries two padding bits that a decoder ignores).
  const expected = toBase64Url(await mac(material, `complete|${requestId}|${expiry}`));
  return timingSafeEqual(encoder.encode(expected), encoder.encode(match[2]));
}

/**
 * A keyed, daily-rotating hash of the client IP (hex SHA-256 of ip + UTC day + signing material): enough
 * to see that ten requests came from one connection on one day, never reversible to the address (the
 * key defeats a brute force over the IPv4 space) and never linkable across days.
 */
export async function hashIp(ip: string, material: string, now: Date = new Date()): Promise<string> {
  const day = now.toISOString().slice(0, 10);
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`ip|${day}|${ip}|${material}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
