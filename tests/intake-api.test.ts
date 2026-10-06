// The free-proof intake API (app/api/intake/*, lib/intake/server/*, lib/intake/upload.ts,
// scripts/intake-pull.ts). Route handlers are driven directly with Request objects; Supabase is an
// in-memory bucket behind a vi.mock of @supabase/supabase-js; fetch (Resend, Turnstile, the browser
// upload) is a vi.fn. No network, no credentials.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Stored = { body: string | Blob; contentType?: string };

const h = vi.hoisted(() => ({
  store: new Map<string, { body: string | Blob; contentType?: string }>(),
  ops: [] as string[],
  fail: { upload: false },
  buckets: [] as string[],
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    storage: {
      from: (bucket: string) => {
        h.buckets.push(bucket);
        return {
          async upload(path: string, body: string | Blob, opts: { upsert?: boolean; contentType?: string } = {}) {
            h.ops.push(`upload ${path}`);
            if (h.fail.upload) return { data: null, error: Object.assign(new Error("Internal Server Error"), { statusCode: "500" }) };
            if (!opts.upsert && h.store.has(path)) {
              return { data: null, error: Object.assign(new Error("The resource already exists"), { statusCode: "409" }) };
            }
            h.store.set(path, { body, contentType: opts.contentType });
            return { data: { id: "obj", path, fullPath: `${bucket}/${path}` }, error: null };
          },
          async download(path: string) {
            const hit = h.store.get(path);
            if (!hit) return { data: null, error: Object.assign(new Error("Object not found"), { statusCode: "404" }) };
            return { data: new Blob([hit.body]), error: null };
          },
          async createSignedUploadUrl(path: string) {
            h.ops.push(`sign-upload ${path}`);
            const token = `tok-${path.split("/").pop()}`;
            return { data: { path, token, signedUrl: `https://proj.supabase.co/storage/v1/object/upload/sign/${bucket}/${path}?token=${token}` }, error: null };
          },
          async createSignedUrls(paths: string[], expiresIn: number) {
            h.ops.push(`sign-links ${paths.length} ${expiresIn}`);
            return {
              data: paths.map((p) =>
                h.store.has(p)
                  ? { path: p, error: null, signedURL: `/object/sign/${bucket}/${p}?token=s`, signedUrl: `https://proj.supabase.co/storage/v1/object/sign/${bucket}/${p}?token=s` }
                  : { path: p, error: "Either the object does not exist or you do not have access to it", signedURL: null, signedUrl: null },
              ),
              error: null,
            };
          },
          async list(prefix: string) {
            const names = new Set<string>();
            for (const key of h.store.keys()) if (key.startsWith(`${prefix}/`)) names.add(key.slice(prefix.length + 1).split("/")[0]);
            return { data: [...names].sort().map((name) => ({ name, id: null })), error: null };
          },
        };
      },
    },
  }),
}));

import { POST as complete } from "../app/api/intake/complete/route";
import { GET as health } from "../app/api/intake/health/route";
import { POST as start } from "../app/api/intake/start/route";
import { INTAKE_COPY } from "../lib/intake/copy";
import { formatPercent, formatUsd } from "../lib/catalog/prices";
import { PRODUCTS, optionPriceLabel, orderBundle } from "../lib/intake/products";
import { ownerSubject, textToHtml } from "../lib/intake/server/email";
import { resetRateLimit } from "../lib/intake/server/ratelimit";
import type { StoredRequest } from "../lib/intake/server/record";
import { isInsideRequestFolder, requestFolder, requestJsonPath, sanitiseFileName } from "../lib/intake/server/storage";
import { productLines, renderSummary } from "../lib/intake/server/summary";
import { COMPLETE_TOKEN_TTL_SECONDS, hashIp, signCompleteToken, timingSafeEqual, verifyCompleteToken } from "../lib/intake/server/token";
import { CONSENT_TEXT_VERSION, REQUEST_ID, parseProofRequest } from "../lib/intake/types";
import { isAlreadyUploaded, signedUploadUrl, uploadToSignedUrl, type UploadTarget } from "../lib/intake/upload";
import { SUPPORT_EMAIL } from "../lib/site";
import { main as intakePull, parseArgs, parseDotenv } from "../scripts/intake-pull";

// --- fixtures ---------------------------------------------------------------------------------------

const ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "SUBMISSION_SIGNING_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "OWNER_NOTIFICATION_EMAIL",
  "TURNSTILE_SECRET_KEY",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
];
const SECRETS = { anon: "anon-public-key", service: "service-role-secret-value", signing: "signing-secret-value", resend: "re_test_secret_value" };

function configure(extra: Record<string, string> = {}): void {
  vi.stubEnv("SUPABASE_URL", "https://proj.supabase.co/");
  vi.stubEnv("SUPABASE_ANON_KEY", SECRETS.anon);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", SECRETS.service);
  vi.stubEnv("SUBMISSION_SIGNING_SECRET", SECRETS.signing);
  vi.stubEnv("RESEND_API_KEY", SECRETS.resend);
  for (const [k, v] of Object.entries(extra)) vi.stubEnv(k, v);
}

const photos = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `IMG_${i}.jpg`, size: 2_000_000, type: "image/jpeg" }));

const valid = () => ({
  products: [
    { product: "cards", option: "p12", quantity: 1 },
    { product: "blanket", option: "50x60", quantity: 2 },
  ],
  style: "SN",
  athlete: { firstName: "Marcus", lastName: "Ellison", sportSlug: "basketball", jerseyNumber: "12", position: "Guard", team: "Cedar Ridge Bears", season: "2026", stats: [{ value: "18.4", label: "PPG" }] },
  contact: { name: "Dana Ellison", email: "Dana@Example.com", phone: "", country: "United States" },
  consents: { guardian: true, biometric: true, license: true },
  photos: photos(5),
  source: { landingPath: "/free-proof", referrer: "https://l.facebook.com/", utm: { utm_source: "meta", fbclid: "abc" } },
});

const withCrest = () => ({
  ...valid(),
  crest: { name: "Cedar Ridge Crest.SVG", size: 4000, type: "image/svg+xml" },
  consents: { guardian: true, biometric: true, license: true, crest: true },
});

let ipCounter = 0;
const freshIp = () => `198.51.100.${(ipCounter += 1)}`;

function post(path: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost:3112${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": freshIp(), "user-agent": "vitest-browser/1.0", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

interface StartOk {
  requestId: string;
  completeToken: string;
  storage: { url: string; anonKey: string };
  uploads: { photos: UploadTarget[]; crest: UploadTarget | null };
}

const record = (id: string): StoredRequest => JSON.parse(h.store.get(requestJsonPath(id))!.body as string) as StoredRequest;

/** What the browser does between start and complete: PUT each file. */
function browserUploads(targets: UploadTarget[]): void {
  for (const t of targets) h.store.set(t.path, { body: "jpeg-bytes", contentType: "image/jpeg" });
}

async function startOk(body: unknown = valid()): Promise<StartOk> {
  const res = await start(post("/api/intake/start", body));
  expect(res.status).toBe(200);
  return (await res.json()) as StartOk;
}

const resendCalls = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls
    .filter(([url]) => String(url) === "https://api.resend.com/emails")
    .map(([, init]) => ({ init: init as RequestInit, body: JSON.parse(String((init as RequestInit).body)) as Record<string, unknown> }));

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  for (const k of ENV_KEYS) vi.stubEnv(k, "");
  h.store.clear();
  h.ops.length = 0;
  h.buckets.length = 0;
  h.fail.upload = false;
  resetRateLimit();
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "email_1" }), { status: 200, headers: { "content-type": "application/json" } }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "info").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// --- start ------------------------------------------------------------------------------------------

describe("POST /api/intake/start", () => {
  it("400 echoes parseProofRequest's errors, field by field", async () => {
    const bad = { ...valid(), photos: photos(2), consents: { guardian: true } };
    const res = await start(post("/api/intake/start", bad));
    expect(res.status).toBe(400);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const expected = parseProofRequest(bad);
    expect(expected.ok).toBe(false);
    if (!expected.ok) expect(await res.json()).toEqual({ errors: expected.errors });
  });

  it("unreadable JSON is a 400 in the same { errors } shape", async () => {
    const res = await start(post("/api/intake/start", "{not json"));
    expect(res.status).toBe(400);
    expect(((await res.json()) as { errors: Record<string, string> }).errors.form).toBeTruthy();
  });

  it("503 storage_unconfigured when Supabase is not configured — the message carries the email fallback", async () => {
    const res = await start(post("/api/intake/start", valid()));
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error: string; message: string };
    expect(json.error).toBe("storage_unconfigured");
    expect(json.message).toBe(INTAKE_COPY.errors.storageMissing(SUPPORT_EMAIL));
    expect(h.ops).toEqual([]);
  });

  it("order is validation → rate limit → config: invalid posts are never counted, the 11th valid start is a 429", async () => {
    const ip = "203.0.113.50";
    for (let i = 0; i < 12; i += 1) expect((await start(post("/api/intake/start", { nope: true }, { "x-forwarded-for": ip }))).status).toBe(400);
    for (let i = 0; i < 10; i += 1) expect((await start(post("/api/intake/start", valid(), { "x-forwarded-for": ip }))).status).toBe(503);
    const limited = await start(post("/api/intake/start", valid(), { "x-forwarded-for": `${ip}, 10.0.0.1` }));
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await limited.json()).toEqual({ error: "rate_limited", message: INTAKE_COPY.errors.tooMany });
    expect((await start(post("/api/intake/start", valid(), { "x-forwarded-for": "203.0.113.51" }))).status).toBe(503);
  });

  it("403 for a cross-origin browser post, 415 for a non-JSON body, 413 over 256 KB", async () => {
    configure();
    expect((await start(post("/api/intake/start", valid(), { origin: "https://evil.example" }))).status).toBe(403);
    expect((await start(post("/api/intake/start", valid(), { origin: "null" }))).status).toBe(403);
    expect((await start(post("/api/intake/start", valid(), { origin: "http://localhost:3112" }))).status).toBe(200);
    expect((await start(post("/api/intake/start", valid(), { "content-type": "text/plain" }))).status).toBe(415);
    const huge = { ...valid(), athlete: { ...valid().athlete, notes: "x".repeat(300 * 1024) } };
    expect((await start(post("/api/intake/start", huge))).status).toBe(413);
  });

  it("200: request.json is written FIRST, then one signed upload per photo in order, plus the crest", async () => {
    configure();
    const json = await startOk(withCrest());
    expect(json.requestId).toMatch(REQUEST_ID);
    expect(typeof json.completeToken).toBe("string");
    expect(json.storage).toEqual({ url: "https://proj.supabase.co", anonKey: SECRETS.anon });
    const folder = requestFolder(json.requestId);
    expect(folder).toBe(`proof-requests/${json.requestId.slice(6, 10)}-${json.requestId.slice(10, 12)}/${json.requestId}`);
    expect(json.uploads.photos.map((t) => t.path)).toEqual([0, 1, 2, 3, 4].map((i) => `${folder}/photos/0${i + 1}-img_${i}.jpg`));
    for (const t of json.uploads.photos) {
      expect(t.token).toBeTruthy();
      expect(t.signedUrl.startsWith("https://proj.supabase.co/storage/v1/object/upload/sign/athlete-submissions/")).toBe(true);
    }
    expect(json.uploads.crest?.path).toBe(`${folder}/crest/cedar-ridge-crest.svg`);
    expect(h.ops[0]).toBe(`upload ${folder}/request.json`);
    expect(h.ops.slice(1).every((op) => op.startsWith("sign-upload "))).toBe(true);
    expect(h.ops).toHaveLength(1 + 5 + 1);
    expect(h.buckets.every((b) => b === "athlete-submissions")).toBe(true);
  });

  it("the stored request: status uploading, hashed IP, truncated agent, issued paths, no Turnstile token, no secrets", async () => {
    configure();
    const ip = "192.0.2.77";
    const res = await start(post("/api/intake/start", { ...valid(), turnstileToken: "cf-token-123" }, { "x-forwarded-for": ip, "user-agent": "A".repeat(500) }));
    const json = (await res.json()) as StartOk;
    const raw = h.store.get(requestJsonPath(json.requestId))!;
    expect(raw.contentType).toBe("application/json");
    const r = record(json.requestId);
    expect(r.status).toBe("uploading");
    expect(r.requestId).toBe(json.requestId);
    expect(r.consentTextVersion).toBe(CONSENT_TEXT_VERSION);
    expect(r.contact.email).toBe("dana@example.com");
    expect(r.ipHash).toMatch(/^[0-9a-f]{64}$/);
    expect(r.userAgent).toHaveLength(200);
    expect(r.issued.photos).toEqual(json.uploads.photos.map((t) => t.path));
    expect(r.issued.crest).toBeNull();
    expect(new Date(r.createdAt).toString()).not.toBe("Invalid Date");
    const text = raw.body as string;
    expect(text).not.toContain(ip);
    expect(text).not.toContain("cf-token-123");
    expect(text).not.toContain("turnstileToken");
    const responseText = JSON.stringify(json);
    for (const secret of [SECRETS.service, SECRETS.signing, SECRETS.resend]) {
      expect(responseText).not.toContain(secret);
      expect(text).not.toContain(secret);
    }
  });

  it("storage failing after validation is a 503 storage_unavailable, never a 500", async () => {
    configure();
    h.fail.upload = true;
    const res = await start(post("/api/intake/start", valid()));
    expect(res.status).toBe(503);
    expect(((await res.json()) as { error: string }).error).toBe("storage_unavailable");
  });

  it("Turnstile: off unless BOTH keys are set; then no token or a failed check is a 403, Cloudflare down is allowed", async () => {
    configure({ TURNSTILE_SECRET_KEY: "cf-secret" });
    expect((await start(post("/api/intake/start", valid()))).status).toBe(200); // secret without site key: off
    expect(fetchMock).not.toHaveBeenCalled();

    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "cf-site-key");
    const noToken = await start(post("/api/intake/start", valid()));
    expect(noToken.status).toBe(403);
    expect(((await noToken.json()) as { error: string }).error).toBe("challenge_failed");

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), { status: 200 }));
    expect((await start(post("/api/intake/start", { ...valid(), turnstileToken: "bad" }))).status).toBe(403);

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));
    expect((await start(post("/api/intake/start", { ...valid(), turnstileToken: "good" }, { "x-forwarded-for": "192.0.2.1" }))).status).toBe(200);
    const [url, init] = fetchMock.mock.calls.at(-1)!;
    expect(String(url)).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const sent = new URLSearchParams(String((init as RequestInit).body));
    expect(sent.get("secret")).toBe("cf-secret");
    expect(sent.get("response")).toBe("good");
    expect(sent.get("remoteip")).toBe("192.0.2.1");

    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect((await start(post("/api/intake/start", { ...valid(), turnstileToken: "any" }))).status).toBe(200);
  });
});

// --- complete ---------------------------------------------------------------------------------------

describe("POST /api/intake/complete", () => {
  const completeBody = (s: StartOk, overrides: Record<string, unknown> = {}) => ({
    requestId: s.requestId,
    completeToken: s.completeToken,
    uploaded: { photos: s.uploads.photos.map((t) => t.path), crest: s.uploads.crest?.path ?? null },
    ...overrides,
  });

  it("200: request.json becomes received, both emails go out with the summary, the owner's copy carries signed links", async () => {
    configure({ OWNER_NOTIFICATION_EMAIL: "owner@example.com" });
    const s = await startOk(withCrest());
    browserUploads([...s.uploads.photos, s.uploads.crest!]);
    const res = await complete(post("/api/intake/complete", completeBody(s)));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ ok: true, requestId: s.requestId, emailed: true });

    const r = record(s.requestId);
    expect(r.status).toBe("received");
    expect(r.receivedAt).toBeTruthy();
    expect(r.uploaded).toEqual({ photos: s.uploads.photos.map((t) => t.path), crest: s.uploads.crest!.path });
    expect(r.emails).toMatchObject({ owner: true, customer: true });
    expect(h.ops).toContain(`sign-links 7 ${7 * 24 * 60 * 60}`);

    const calls = resendCalls(fetchMock);
    expect(calls).toHaveLength(2);
    for (const c of calls) {
      const headers = c.init.headers as Record<string, string>;
      expect(headers.Authorization).toBe(`Bearer ${SECRETS.resend}`);
      expect(headers["Idempotency-Key"]).toMatch(new RegExp(`^${s.requestId}-(owner|customer)$`));
      expect(c.body.reply_to).toBe(SUPPORT_EMAIL);
      expect(c.body.from).toBe(`Game Day Edition <${SUPPORT_EMAIL}>`);
      expect(String(c.body.html)).toContain("<p");
    }
    const owner = calls.find((c) => (c.body.to as string[])[0] === "owner@example.com")!;
    const customer = calls.find((c) => (c.body.to as string[])[0] === "dana@example.com")!;
    expect(owner.body.subject).toBe(`Free proof request ${s.requestId} — Marcus Ellison (Basketball, Stadium Night)`);
    const cards = PRODUCTS[0].options.find((o) => o.key === "p12")!;
    const ownerText = String(owner.body.text);
    expect(ownerText).toContain(`- Trading cards · 12 printed cards — ${optionPriceLabel(cards)}`);
    const blanket = PRODUCTS.find((p) => p.key === "blanket")!.options.find((o) => o.key === "50x60")!;
    expect(ownerText).toContain(`- Blanket · 50 × 60 in × 2 — ${optionPriceLabel(blanket)} each`);
    // Pricing v1: two different products → the bundle, in three lines, from the same bundleTotal the form uses.
    const bundle = orderBundle(valid().products)!;
    expect(bundle.productCount).toBe(2);
    for (const text of [ownerText, String(customer.body.text)]) {
      expect(text).toContain(`Bought separately: ${formatUsd(bundle.alaCarte)}`);
      expect(text).toContain(`Bundle saving (2 products, ${formatPercent(bundle.discountRate)}): \u2212${formatUsd(bundle.discount)}`);
      expect(text).toContain(`Total after approval: ${formatUsd(bundle.total)}`);
      expect(text).not.toMatch(/\bsale\b|regular price|limited time/i);
    }
    expect(ownerText).toContain(`PERMISSIONS (wording of ${CONSENT_TEXT_VERSION})`);
    expect(ownerText).toContain(`01 IMG_0.jpg · 1.9 MB — https://proj.supabase.co/storage/v1/object/sign/athlete-submissions/${requestFolder(s.requestId)}/photos/01-img_0.jpg`);
    expect(ownerText).toContain("CREST\nCedar Ridge Crest.SVG");
    expect(ownerText).toContain(`REQUEST FILE\nhttps://proj.supabase.co/storage/v1/object/sign/athlete-submissions/${requestJsonPath(s.requestId)}`);
    expect(ownerText).toContain("utm_source: meta");
    expect(ownerText).toContain("All 5 photos arrived.");
    expect(ownerText).toContain(`npx tsx scripts/intake-pull.ts ${s.requestId}`);

    expect(customer.body.subject).toBe(`We have your photos — your free proof is in the queue (${s.requestId})`);
    const customerText = String(customer.body.text);
    expect(customerText).toContain("Hi Dana,");
    expect(customerText).toContain(INTAKE_COPY.thanks.lead);
    expect(customerText).toContain(`${INTAKE_COPY.thanks.referenceLabel}: ${s.requestId}`);
    expect(customerText).toContain("Reply to this email to add photos or details");
    for (const step of INTAKE_COPY.thanks.next) expect(customerText).toContain(step);
    expect(customerText).toContain("Trading cards · 12 printed cards");
    expect(customerText).not.toContain("https://proj.supabase.co");
    expect(customerText).not.toContain("utm_source");
    expect(customerText).not.toContain("REQUEST FILE");
  });

  it("409 on a second complete — with the requestId, and no second round of emails", async () => {
    configure();
    const s = await startOk();
    browserUploads(s.uploads.photos);
    expect((await complete(post("/api/intake/complete", completeBody(s)))).status).toBe(200);
    const again = await complete(post("/api/intake/complete", completeBody(s)));
    expect(again.status).toBe(409);
    expect(((await again.json()) as { requestId: string }).requestId).toBe(s.requestId);
    expect(resendCalls(fetchMock)).toHaveLength(2);
  });

  it("403 for a tampered token, another request's token, an expired token; 400 for a malformed body", async () => {
    configure();
    const s = await startOk();
    const other = await startOk();
    // The last character only differs in padding bits; the middle one changes the MAC itself.
    const flip = (c: string) => (c === "A" ? "B" : "A");
    const mid = s.completeToken.length - 20;
    expect((await complete(post("/api/intake/complete", completeBody(s, { completeToken: `${s.completeToken.slice(0, -1)}${flip(s.completeToken.at(-1)!)}` })))).status).toBe(403);
    expect((await complete(post("/api/intake/complete", completeBody(s, { completeToken: `${s.completeToken.slice(0, mid)}${flip(s.completeToken[mid])}${s.completeToken.slice(mid + 1)}` })))).status).toBe(403);
    expect((await complete(post("/api/intake/complete", completeBody(s, { completeToken: other.completeToken })))).status).toBe(403);
    expect((await complete(post("/api/intake/complete", completeBody(s, { requestId: "GDE-R-20261004-AAAAAA" })))).status).toBe(403);
    expect((await complete(post("/api/intake/complete", { requestId: s.requestId }))).status).toBe(400);
    expect((await complete(post("/api/intake/complete", completeBody(s, { uploaded: { photos: "x" } })))).status).toBe(400);

    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + (COMPLETE_TOKEN_TTL_SECONDS + 5) * 1000);
    expect((await complete(post("/api/intake/complete", completeBody(s)))).status).toBe(403);
    vi.useRealTimers();
    expect(record(s.requestId).status).toBe("uploading");
    expect(resendCalls(fetchMock)).toHaveLength(0);
  });

  it("400 for a path outside the request folder, a traversal, or a file start never issued", async () => {
    configure();
    const s = await startOk();
    const folder = requestFolder(s.requestId);
    const otherFolder = requestFolder("GDE-R-20261004-AAAAAA");
    for (const photosList of [[`${otherFolder}/photos/01-img_0.jpg`], [`${folder}/photos/../request.json`], [`${folder}/photos/99-extra.jpg`], [`/${folder}/photos/01-img_0.jpg`]]) {
      const res = await complete(post("/api/intake/complete", completeBody(s, { uploaded: { photos: photosList, crest: null } })));
      expect(res.status).toBe(400);
      expect(((await res.json()) as { error: string }).error).toBe("bad_path");
    }
    const crestRes = await complete(post("/api/intake/complete", completeBody(s, { uploaded: { photos: [], crest: `${folder}/crest/x.svg` } })));
    expect(crestRes.status).toBe(400);
    expect(record(s.requestId).status).toBe("uploading");
  });

  it("Resend failing never fails the request: 200 { ok: true, emailed: false } and the record is received", async () => {
    configure();
    const s = await startOk();
    browserUploads(s.uploads.photos);
    fetchMock.mockImplementation(async () => new Response(JSON.stringify({ statusCode: 422, message: "invalid from" }), { status: 422 }));
    const res = await complete(post("/api/intake/complete", completeBody(s)));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, requestId: s.requestId, emailed: false });
    expect(record(s.requestId).status).toBe("received");
    expect(record(s.requestId).emails).toMatchObject({ owner: false, customer: false });
  });

  it("without RESEND_API_KEY the request still completes, emailed: false, and nothing is sent", async () => {
    configure({ RESEND_API_KEY: "" });
    const s = await startOk();
    browserUploads(s.uploads.photos);
    const res = await complete(post("/api/intake/complete", completeBody(s)));
    expect(await res.json()).toEqual({ ok: true, requestId: s.requestId, emailed: false });
    expect(resendCalls(fetchMock)).toHaveLength(0);
  });

  it("fewer photos than chosen still completes, and both emails say which did not arrive", async () => {
    configure();
    const s = await startOk();
    browserUploads(s.uploads.photos.slice(0, 3));
    const res = await complete(post("/api/intake/complete", completeBody(s, { uploaded: { photos: s.uploads.photos.slice(0, 3).map((t) => t.path), crest: null } })));
    expect(res.status).toBe(200);
    const calls = resendCalls(fetchMock);
    const ownerText = String(calls.find((c) => (c.body.to as string[])[0] === SUPPORT_EMAIL)!.body.text);
    const customerText = String(calls.find((c) => (c.body.to as string[])[0] === "dana@example.com")!.body.text);
    expect(ownerText).toContain("Only 3 of 5 photos arrived");
    expect(ownerText).toContain("PHOTOS (3 of 5 arrived)");
    expect(ownerText).toContain("05 IMG_4.jpg · 1.9 MB — did not arrive");
    expect(customerText).toContain("3 of your 5 photos arrived");
    expect(customerText).toContain("did not arrive");
  });

  it("a file the browser reported but storage does not have is flagged, not linked", async () => {
    configure();
    const s = await startOk();
    browserUploads(s.uploads.photos.slice(0, 4));
    await complete(post("/api/intake/complete", completeBody(s)));
    const ownerText = String(resendCalls(fetchMock).find((c) => (c.body.to as string[])[0] === SUPPORT_EMAIL)!.body.text);
    expect(ownerText).toContain("05 IMG_4.jpg · 1.9 MB — not found in storage");
  });

  it("503 when storage is not configured", async () => {
    const res = await complete(post("/api/intake/complete", { requestId: "GDE-R-20261004-AAAAAA", completeToken: "1.x", uploaded: { photos: [], crest: null } }));
    expect(res.status).toBe(503);
  });
});

// --- health -----------------------------------------------------------------------------------------

describe("GET /api/intake/health", () => {
  it("booleans and the bucket name only — all off without credentials", async () => {
    const res = await health();
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ storage: false, email: false, turnstile: false, bucket: null });
  });

  it("reports what is switched on, and never a value", async () => {
    configure({ SUPABASE_STORAGE_BUCKET: "proof-uploads", TURNSTILE_SECRET_KEY: "cf-secret", NEXT_PUBLIC_TURNSTILE_SITE_KEY: "cf-site" });
    const res = await health();
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ storage: true, email: true, turnstile: true, bucket: "proof-uploads" });
    for (const secret of [...Object.values(SECRETS), "cf-secret", "cf-site", "proj.supabase.co"]) expect(text).not.toContain(secret);
  });

  it("storage needs all three Supabase values", async () => {
    configure({ SUPABASE_ANON_KEY: "" });
    expect(((await (await health()).json()) as { storage: boolean }).storage).toBe(false);
  });
});

// --- token ------------------------------------------------------------------------------------------

describe("completeToken (lib/intake/server/token.ts)", () => {
  const id = "GDE-R-20261004-7KQ2MX";
  it("round-trips, and fails for another id, another key, a tampered signature, expiry and junk", async () => {
    const now = Date.UTC(2026, 9, 4, 12);
    const token = await signCompleteToken(id, "key-a", now);
    expect(token).toMatch(/^\d+\.[A-Za-z0-9_-]{43}$/);
    expect(await verifyCompleteToken(id, token, "key-a", now + 60_000)).toBe(true);
    expect(await verifyCompleteToken("GDE-R-20261004-7KQ2MY", token, "key-a", now)).toBe(false);
    expect(await verifyCompleteToken(id, token, "key-b", now)).toBe(false);
    expect(await verifyCompleteToken(id, `${Number(token.split(".")[0]) + 1}.${token.split(".")[1]}`, "key-a", now)).toBe(false);
    expect(await verifyCompleteToken(id, token, "key-a", now + COMPLETE_TOKEN_TTL_SECONDS * 1000)).toBe(false);
    for (const junk of ["", "abc", null, 42, `${token}x`]) expect(await verifyCompleteToken(id, junk, "key-a", now)).toBe(false);
  });
  it("compares in constant time and hashes IPs per day", async () => {
    expect(timingSafeEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
    expect(timingSafeEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4]))).toBe(false);
    expect(timingSafeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toBe(false);
    const day1 = await hashIp("192.0.2.7", "k", new Date("2026-10-04T10:00:00Z"));
    expect(await hashIp("192.0.2.7", "k", new Date("2026-10-04T23:00:00Z"))).toBe(day1);
    expect(await hashIp("192.0.2.7", "k", new Date("2026-10-05T10:00:00Z"))).not.toBe(day1);
    expect(await hashIp("192.0.2.7", "other", new Date("2026-10-04T10:00:00Z"))).not.toBe(day1);
  });
});

// --- the browser upload helper ------------------------------------------------------------------------

describe("uploadToSignedUrl (lib/intake/upload.ts)", () => {
  const storage = { url: "https://proj.supabase.co", anonKey: SECRETS.anon };
  const target: UploadTarget = {
    path: "proof-requests/2026-10/GDE-R-20261004-7KQ2MX/photos/01-img_0001.jpg",
    token: "upload-token",
    signedUrl: "https://proj.supabase.co/storage/v1/object/upload/sign/athlete-submissions/proof-requests/2026-10/GDE-R-20261004-7KQ2MX/photos/01-img_0001.jpg?token=upload-token",
  };

  it("makes storage-js's exact request: PUT, apikey + Bearer anon key + x-upsert false, FormData { cacheControl, '': file }", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ Key: "athlete-submissions/x" }), { status: 200 }));
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], "IMG_0001.jpg", { type: "image/jpeg" });
    await uploadToSignedUrl(target, file, storage);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(target.signedUrl);
    const parsed = new URL(url);
    expect(parsed.pathname).toBe(`/storage/v1/object/upload/sign/athlete-submissions/${target.path}`);
    expect(parsed.searchParams.get("token")).toBe("upload-token");
    expect(init.method).toBe("PUT");
    expect(init.headers).toEqual({ apikey: SECRETS.anon, Authorization: `Bearer ${SECRETS.anon}`, "x-upsert": "false" });
    const body = init.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect([...body.keys()]).toEqual(["cacheControl", ""]);
    expect(body.get("cacheControl")).toBe("3600");
    const sent = body.get("") as File;
    expect(sent.name).toBe("IMG_0001.jpg");
    expect(sent.size).toBe(3);
  });

  it("throws with the response text on a non-2xx answer", async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"statusCode":"403","error":"Unauthorized","message":"invalid signature"}', { status: 400 }));
    await expect(uploadToSignedUrl(target, new Blob(["x"]), storage)).rejects.toThrow(/Upload failed \(400\): .*invalid signature/);
  });

  it("a duplicate answer means an earlier attempt landed — resolved, so a retry cannot loop", async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"statusCode":"409","error":"Duplicate","message":"The resource already exists"}', { status: 400 }));
    await expect(uploadToSignedUrl(target, new Blob(["x"]), storage)).resolves.toBeUndefined();
    expect(isAlreadyUploaded(409, "")).toBe(true);
    expect(isAlreadyUploaded(400, '{"message":"invalid signature"}')).toBe(false);
  });

  it("never sends the anon key to a URL outside the project's signed-upload endpoint", async () => {
    for (const signedUrl of ["https://evil.example/storage/v1/object/upload/sign/b/p?token=t", "https://proj.supabase.co/storage/v1/object/b/p?token=t"]) {
      expect(() => signedUploadUrl({ ...target, signedUrl }, storage)).toThrow();
      await expect(uploadToSignedUrl({ ...target, signedUrl }, new Blob(["x"]), storage)).rejects.toThrow();
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// --- storage paths, summary, html -----------------------------------------------------------------------

describe("storage paths and the summary", () => {
  it("sanitises file names to [a-z0-9._-], keeps the extension, caps at 80", () => {
    expect(sanitiseFileName("IMG 0012 (1).HEIC")).toBe("img-0012-1.heic");
    expect(sanitiseFileName("Café Équipe.JPG")).toBe("cafe-equipe.jpg");
    expect(sanitiseFileName("фото.jpg")).toBe("photo.jpg");
    expect(sanitiseFileName("../../etc/passwd")).toBe("etc-passwd");
    expect(sanitiseFileName("crest", "crest")).toBe("crest");
    const long = sanitiseFileName(`${"a".repeat(200)}.webp`);
    expect(long.length).toBeLessThanOrEqual(80);
    expect(long.endsWith(".webp")).toBe(true);
    for (const name of ["IMG 0012 (1).HEIC", "Café Équipe.JPG", "фото.jpg", "../../etc/passwd", "a b c.png"]) expect(sanitiseFileName(name)).toMatch(/^[a-z0-9._-]{1,80}$/);
  });

  it("folders come from the request id; only plain paths inside it pass", () => {
    const id = "GDE-R-20261004-7KQ2MX";
    expect(requestFolder(id)).toBe("proof-requests/2026-10/GDE-R-20261004-7KQ2MX");
    expect(() => requestFolder("../GDE-R-1")).toThrow();
    expect(isInsideRequestFolder(id, `${requestFolder(id)}/photos/01-a.jpg`)).toBe(true);
    for (const bad of [`${requestFolder(id)}/photos/../../x`, `${requestFolder(id)}//x`, `${requestFolder(id)}/`, `${requestFolder(id)}/A.JPG`, "proof-requests/2026-10/GDE-R-20261004-7KQ2MY/photos/01-a.jpg"]) {
      expect(isInsideRequestFolder(id, bad)).toBe(false);
    }
  });

  it("product lines use choiceLabel + optionPriceLabel, then the bundle lines from bundleTotal (pricing v1)", () => {
    const choices: StoredRequest["products"] = [{ product: "cards", option: "p12", quantity: 2 }, { product: "poster", option: "digital", quantity: 1 }, { product: "banner", option: "3x6", quantity: 1 }];
    const lines = productLines({ products: choices });
    expect(lines[0]).toMatch(/^- Trading cards · 12 printed cards × 2 — \$\d+\.99 each$/);
    expect(lines[1]).toMatch(/^- Poster · Digital files — \$\d+\.99$/);
    expect(lines[2]).toMatch(/^- Banner · 3 × 6 ft printed — \$\d+\.99$/);
    const three = orderBundle(choices)!;
    expect(three.discountRate).toBe(0.2);
    expect(lines.slice(3)).toEqual([
      `Bought separately: ${formatUsd(three.alaCarte)}`,
      `Bundle saving (3 products, 20%): \u2212${formatUsd(three.discount)}`,
      `Total after approval: ${formatUsd(three.total)}`,
    ]);
    // One product: its total, no bundle lines.
    expect(productLines({ products: [{ product: "poster", option: "p1824", quantity: 1 }] }).slice(1)).toEqual([
      `Total after approval: ${optionPriceLabel(PRODUCTS[1].options.find((o) => o.key === "p1824")!)}`,
    ]);
    const parsed = parseProofRequest({ ...valid(), products: [{ product: "cards", option: "digital" }, { product: "poster", option: "digital" }], style: "recommend" });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const r: StoredRequest = {
      ...parsed.value,
      requestId: "GDE-R-20261004-7KQ2MX",
      status: "uploading",
      createdAt: "2026-10-04T12:00:00.000Z",
      ipHash: "0".repeat(64),
      userAgent: "ua",
      issued: { photos: parsed.value.photos.map((_, i) => `p/${i}`), crest: null },
    };
    const text = renderSummary(r, { audience: "customer" });
    expect(text).not.toContain("priced as a set");
    expect(text).toContain(`Total after approval: ${formatUsd(orderBundle([{ product: "cards", option: "digital" }, { product: "poster", option: "digital" }])!.total)}`);
    expect(text).toContain(`STYLE\n${INTAKE_COPY.styleRecommendLabel}`);
    expect(text).not.toContain("SOURCE");
    expect(renderSummary(r, { audience: "owner" })).toContain("SOURCE\nLanding page: /free-proof");
    expect(ownerSubject(r)).toBe("Free proof request GDE-R-20261004-7KQ2MX — Marcus Ellison (Basketball, style to recommend)");
  });

  it("the HTML part escapes what the parent typed and links what is a link", () => {
    const html = textToHtml('REFERENCE\nGDE-R-1\n\nNotes: <script>alert("x")</script>\nhttps://example.com/a?b=1&c=2\nReply: dana@example.com');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain('<a href="https://example.com/a?b=1&amp;c=2">');
    expect(html).toContain('<a href="mailto:dana@example.com">');
    expect(html).toContain("<strong>REFERENCE</strong>");
  });
});

// --- the owner CLI ----------------------------------------------------------------------------------------

describe("scripts/intake-pull.ts helpers", () => {
  it("parses .env.local lines without a dependency", () => {
    const env = parseDotenv(['# comment', "", 'SUPABASE_URL="https://proj.supabase.co"', "export SUPABASE_SERVICE_ROLE_KEY=abc # trailing", "EMPTY=", "QUOTED='a # b'", "not a line"].join("\n"));
    expect(env).toEqual({ SUPABASE_URL: "https://proj.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "abc", EMPTY: "", QUOTED: "a # b" });
  });
  it("parses the two modes and refuses anything else", () => {
    expect(parseArgs(["gde-r-20261004-7kq2mx"])).toEqual({ mode: "pull", requestId: "GDE-R-20261004-7KQ2MX", out: "orders/GDE-R-20261004-7KQ2MX" });
    expect(parseArgs(["GDE-R-20261004-7KQ2MX", "--out", "/tmp/x"])).toMatchObject({ mode: "pull", out: "/tmp/x" });
    expect(parseArgs(["--list"], new Date("2026-10-04T12:00:00Z"))).toEqual({ mode: "list", month: "2026-10" });
    expect(parseArgs(["--list", "--month", "2026-09"])).toEqual({ mode: "list", month: "2026-09" });
    expect(parseArgs(["--list", "--month", "Sept"]).mode).toBe("help");
    expect(parseArgs(["not-an-id"])).toMatchObject({ mode: "help" });
    expect(parseArgs(["--out"]).mode).toBe("help");
    expect(parseArgs([])).toEqual({ mode: "help", error: undefined });
  });

  it("pulls a received request into <out>/from-buyer/ and lists the month — against the same bucket", async () => {
    configure();
    const s = await startOk(withCrest());
    browserUploads([...s.uploads.photos.slice(0, 4), s.uploads.crest!]);
    await complete(
      post("/api/intake/complete", {
        requestId: s.requestId,
        completeToken: s.completeToken,
        uploaded: { photos: s.uploads.photos.slice(0, 4).map((t) => t.path), crest: s.uploads.crest!.path },
      }),
    );
    const abandoned = await startOk();
    const out = fs.mkdtempSync(path.join(os.tmpdir(), "intake-pull-"));
    const printed: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => void printed.push(args.join(" ")));
    try {
      expect(await intakePull([s.requestId, "--out", out], path.join(out, "no-such.env"))).toBe(0);
      const dir = path.join(out, "from-buyer");
      expect(JSON.parse(fs.readFileSync(path.join(dir, "request.json"), "utf8")).status).toBe("received");
      expect(fs.readdirSync(path.join(dir, "photos")).sort()).toEqual(["01-img_0.jpg", "02-img_1.jpg", "03-img_2.jpg", "04-img_3.jpg"]);
      expect(fs.readFileSync(path.join(dir, "photos", "01-img_0.jpg"), "utf8")).toBe("jpeg-bytes");
      expect(fs.readdirSync(path.join(dir, "crest"))).toEqual(["cedar-ridge-crest.svg"]);
      const summary = printed.join("\n");
      expect(summary).toContain("PHOTOS (4 of 5 arrived)");
      expect(summary).toContain("05 IMG_4.jpg · 1.9 MB — did not arrive");
      expect(summary).toContain("5 of 5 file(s) saved");

      printed.length = 0;
      expect(await intakePull(["--list", "--month", `${s.requestId.slice(6, 10)}-${s.requestId.slice(10, 12)}`], path.join(out, "no-such.env"))).toBe(0);
      const listing = printed.join("\n");
      expect(listing).toContain(`${s.requestId}  received, 4/5 photos`);
      expect(listing).toContain(`${abandoned.requestId}  upload not completed`);
      expect(listing).toContain("Dana Ellison <dana@example.com>");

      expect(await intakePull(["GDE-R-20261004-AAAAAA"], path.join(out, "no-such.env"))).toBe(1);
    } finally {
      fs.rmSync(out, { recursive: true, force: true });
    }
  });
});

// Keeps the fixture type honest for the mock (a Blob body is stored as-is).
export type { Stored };
