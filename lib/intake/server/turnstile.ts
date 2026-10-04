// Cloudflare Turnstile, server side. Runs only when env.ts `turnstileSecret()` returns a secret (the
// secret AND the public site key are set); otherwise the start route skips it entirely.
//
// "failed" — Cloudflare answered and said no (or the browser sent no token): the start is refused.
// "unreachable" — Cloudflare did not answer: the start is ALLOWED and the event logged. A lost parent
// costs more than a bot that slipped through during an outage, and the rate limit still applies.

export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileOutcome = "passed" | "failed" | "unreachable";

export async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<TurnstileOutcome> {
  if (!token) return "failed";
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const response = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return "unreachable";
    const data = (await response.json()) as { success?: unknown };
    return data.success === true ? "passed" : "failed";
  } catch {
    return "unreachable";
  }
}
