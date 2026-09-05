// Thin client for Google's image model.
//
// NOTE ON THE ENDPOINT — IT DEPENDS ON WHICH KIND OF KEY IS IN .env.local.
//
// 2026-08-19 to 2026-08-21 this ran on a Vertex "express" key bound to a service account
// and restricted to the Agent Platform API. That key was BLOCKED on
// generativelanguage.googleapis.com (403 API_KEY_SERVICE_BLOCKED) and worked only on
// Vertex's global publisher path on v1beta1 (v1 has no image models).
//
// 2026-08-21 the account moved to an AI Studio key (aistudio.google.com), and the two
// endpoints are mirror images of each other: an AI Studio key works on
// generativelanguage.googleapis.com and NOT on the Vertex path, so BASE moved with it.
// Probed on the new key the same day: gemini-3-pro-image, gemini-3.1-flash-image,
// gemini-3.1-flash-lite-image and gemini-2.5-flash-image all resolve here.
//
// If a 403 API_KEY_SERVICE_BLOCKED ever appears again, the key kind and BASE have drifted
// apart — that error means "right key, wrong host", never "bad key". A lone 404 is still
// usually throttling rather than a missing model; retry before believing it.

import { readFileSync } from "node:fs";
import { JUDGE_EUR, assertBudget, estimateImageEur, record } from "./budget.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
export const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image";
/**
 * The same value, resolved LAZILY. `MODEL` above is evaluated when this module is first
 * imported, and ESM hoists imports above the `loadEnv()` call in every CLI — so a
 * GEMINI_IMAGE_MODEL set in .env.local (rather than in the shell) never reached `MODEL`.
 * Call this instead from anything that runs after loadEnv(). `MODEL` is kept as-is so the
 * background pipeline's prompt hashes stay stable.
 */
export const imageModel = () => process.env.GEMINI_IMAGE_MODEL ?? MODEL;
/**
 * Vision model used to grade generated art. This is NOT the model that draws — that is
 * MODEL above (gemini-3.1-flash-image, "Nano Banana 2"). This one only looks and reasons.
 *
 * It must be a strong one. On gemini-2.5-flash the judge agreed with the human on 7-8 of
 * 9 labelled frames and jittered run to run: it read the real lane curves on the track
 * frame and never mentioned the basketball key printed across the same floor. Swapping to
 * gemini-2.5-pro took it to 9/9 on the first try, with no rubric change. Grading is a tiny
 * fraction of the cost of generating, so never trade judge quality for price — a false
 * PASS ships a wrong frame to print, and a false FAIL only costs one re-roll.
 *
 * UPGRADED TO gemini-3.1-pro-preview, 2026-08-21, on measured evidence rather than novelty.
 * gemini-2.5-pro was stable enough to catch real defects — it found five "plain and
 * unbranded" spec lines contradicted by visible maker's marks — but it was NOT stable on
 * SPATIAL claims, and that instability cost real time:
 *   - baseball: named opposite thighs for the same wordmark on two consecutive runs
 *   - volleyball: a side-seam piping that appeared, vanished, and reappeared
 *   - lacrosse: called one chest crest "above the number", then "left chest" twice more,
 *     and denied a black outline on numerals that plainly have one
 * Re-run on 3.1-pro the same day, the lacrosse spec came back 8/8 confirmed — the two
 * claims 2.5-pro had contradicted three times between them were both upheld, and it
 * additionally corrected a sock line 2.5-pro had hallucinated into existence.
 *
 * The rule from README §33 still stands (a zoomed crop outranks the judge), but a judge
 * that no longer contradicts itself changes how much the crop is needed.
 *
 * Probed 2026-08-21 on the AI Studio key: gemini-3.1-pro-preview, gemini-2.5-pro and
 * gemini-2.5-flash all resolve. Re-probe before assuming that is still true.
 */
export const JUDGE_MODEL = process.env.GEMINI_JUDGE_MODEL ?? "gemini-3.1-pro-preview";

function apiKey(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new Error("GEMINI_API_KEY missing — put it in .env.local");
  return k;
}

/** Load .env.local without adding a dotenv dependency. */
export function loadEnv(file = ".env.local") {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

export interface RefImage {
  data: Buffer;
  mime: string;
}

export interface GenResult {
  image: Buffer;
  mime: string;
  tokens: number;
  /** Any text the model emitted alongside — usually a refusal reason when image is missing. */
  text: string;
}

/**
 * One image request. `refs` are prepended as visual references, then the prompt.
 * Retries on 429/5xx with exponential backoff.
 */
export async function generateImage(opts: {
  prompt: string;
  refs?: RefImage[];
  aspectRatio?: string;
  /**
   * "1K" | "2K" | "4K" on the Pro image model. Faces are the one place native resolution
   * matters more than the upscaler: a face rendered at 1K and then upscaled 4x comes back
   * smooth and plastic, which is the exact defect this layer exists to avoid. Silently
   * ignored (one retry without it) if the model rejects the field.
   */
  imageSize?: string;
  model?: string;
  retries?: number;
  /** What this image is, for the spend ledger. */
  tag?: string;
}): Promise<GenResult> {
  const parts: unknown[] = (opts.refs ?? []).map((r) => ({
    inlineData: { mimeType: r.mime, data: r.data.toString("base64") },
  }));
  parts.push({ text: opts.prompt });

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      ...(opts.aspectRatio || opts.imageSize
        ? {
            imageConfig: {
              ...(opts.aspectRatio ? { aspectRatio: opts.aspectRatio } : {}),
              ...(opts.imageSize ? { imageSize: opts.imageSize } : {}),
            },
          }
        : {}),
    },
  };

  const model = opts.model ?? imageModel();
  // BEFORE the loop, so a budget stop is decided once and cannot be retried around.
  // See lib/budget.ts for why this lives here and not in the CLIs.
  assertBudget(estimateImageEur(model, opts.imageSize ?? "2K"), opts.tag ?? model);
  const maxTries = opts.retries ?? 7;
  let lastErr = "";
  let sentImageSize = Boolean(opts.imageSize);
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    // fetch THROWS on transport failures (ETIMEDOUT, ECONNRESET, socket hang up) rather
    // than returning a status, so these bypassed the retry loop below and crashed the whole
    // run — one flaky socket lost a 16-image sweep. Treat them like a 5xx.
    let res: Response;
    try {
      res = await fetch(`${BASE}/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey() },
        body: JSON.stringify(body),
      });
    } catch (e) {
      lastErr = `network: ${(e as Error).message}`;
      await new Promise((r) => setTimeout(r, Math.min(60_000, 4000 * 2 ** (attempt - 1))));
      continue;
    }

    if (res.status === 429 || res.status >= 500) {
      lastErr = `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`;
      // express-key quota refills on the order of a minute, so cap the wait high
      await new Promise((r) => setTimeout(r, Math.min(60_000, 4000 * 2 ** (attempt - 1))));
      continue;
    }
    if (!res.ok) {
      const detail = await res.text();
      // Older image models 400 on imageConfig.imageSize. Drop it and try once more rather
      // than failing the whole run over an optional quality flag.
      if (res.status === 400 && sentImageSize && /imageSize/i.test(detail)) {
        sentImageSize = false;
        (body.generationConfig as any).imageConfig = opts.aspectRatio
          ? { aspectRatio: opts.aspectRatio }
          : undefined;
        continue;
      }
      throw new Error(`HTTP ${res.status}: ${detail.slice(0, 400)}`);
    }

    const json = (await res.json()) as any;
    const outParts = json?.candidates?.[0]?.content?.parts ?? [];
    const img = outParts.find((p: any) => p.inlineData);
    const text = outParts.filter((p: any) => p.text).map((p: any) => p.text).join(" ").trim();
    if (!img) {
      // No pixels: usually a safety block or a finishReason other than STOP.
      throw new Error(
        `no image returned (finishReason=${json?.candidates?.[0]?.finishReason}) ${text.slice(0, 200)}`,
      );
    }
    const u = json?.usageMetadata ?? {};
    const tokens = u.totalTokenCount ?? 0;
    record({
      kind: "image",
      model,
      size: opts.imageSize ?? "2K",
      // Input and output bill at wildly different rates (2 vs 120 USD per 1M on Pro), so
      // the two halves are kept apart. With both, the ledger line is the real price rather
      // than an estimate of it.
      inTokens: u.promptTokenCount,
      outTokens: u.candidatesTokenCount,
      tokens,
      tag: opts.tag ?? model,
    });
    return {
      image: Buffer.from(img.inlineData.data, "base64"),
      mime: img.inlineData.mimeType ?? "image/png",
      tokens,
      text,
    };
  }
  throw new Error(`gave up after ${maxTries} tries — ${lastErr}`);
}

/** Ask the judge model a question about images and get strict JSON back. */
export async function generateJson<T>(opts: {
  prompt: string;
  images: RefImage[];
  schema: Record<string, unknown>;
  retries?: number;
  /** What is being graded, for the spend ledger. */
  tag?: string;
}): Promise<T> {
  const parts: unknown[] = opts.images.map((r) => ({
    inlineData: { mimeType: r.mime, data: r.data.toString("base64") },
  }));
  parts.push({ text: opts.prompt });

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: opts.schema,
      temperature: 0,
    },
  };

  assertBudget(JUDGE_EUR, opts.tag ?? "judge");
  const maxTries = opts.retries ?? 4;
  let lastErr = "";
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    // See the note in generateImage — a thrown fetch must retry, not crash the sweep.
    let res: Response;
    try {
      res = await fetch(`${BASE}/${JUDGE_MODEL}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey() },
        body: JSON.stringify(body),
      });
    } catch (e) {
      lastErr = `network: ${(e as Error).message}`;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 1)));
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      lastErr = `HTTP ${res.status}`;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 1)));
      continue;
    }
    if (!res.ok) throw new Error(`judge HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const json = (await res.json()) as any;
    const text = (json?.candidates?.[0]?.content?.parts ?? [])
      .filter((p: any) => p.text).map((p: any) => p.text).join("");
    if (!text) throw new Error("judge returned no text");
    const u = json?.usageMetadata ?? {};
    record({
      kind: "judge",
      model: JUDGE_MODEL,
      inTokens: u.promptTokenCount,
      outTokens: u.candidatesTokenCount,
      tokens: u.totalTokenCount ?? 0,
      tag: opts.tag ?? "judge",
    });
    return JSON.parse(text) as T;
  }
  throw new Error(`judge gave up after ${maxTries} tries — ${lastErr}`);
}
