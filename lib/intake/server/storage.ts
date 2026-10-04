// Storage for free-proof requests: one PRIVATE Supabase bucket, no database. A request is a folder —
//
//   proof-requests/<yyyy-mm>/<requestId>/request.json        the validated request + status
//   proof-requests/<yyyy-mm>/<requestId>/photos/<nn>-<name>  4–10 originals, uploaded by the browser
//   proof-requests/<yyyy-mm>/<requestId>/crest/<name>        the optional crest
//
// The month comes from the request id itself (GDE-R-<yyyymmdd>-…), so every later step — complete,
// the owner's intake-pull — finds the folder from the reference alone. Server only: the service key
// bypasses the bucket's policies, so this module is never imported by a client component.

import { createClient } from "@supabase/supabase-js";
import { REQUEST_ID } from "../types";
import type { UploadTarget } from "../upload";
import type { StorageConfig } from "./env";

export const REQUESTS_PREFIX = "proof-requests";
/** The owner's links to the photos and request.json stay valid for a week. */
export const SIGNED_LINK_SECONDS = 7 * 24 * 60 * 60;
const MAX_NAME = 80;

export type Bucket = ReturnType<ReturnType<typeof createClient>["storage"]["from"]>;

export class StorageFailure extends Error {
  constructor(operation: string, detail: string) {
    super(`storage ${operation} failed: ${detail}`);
    this.name = "StorageFailure";
  }
}

/** "proof-requests/2026-10/GDE-R-20261004-7KQ2MX". Throws on anything that is not a request id. */
export function requestFolder(requestId: string): string {
  if (!REQUEST_ID.test(requestId)) throw new Error("Not a request id.");
  return `${REQUESTS_PREFIX}/${requestId.slice(6, 10)}-${requestId.slice(10, 12)}/${requestId}`;
}

export const requestJsonPath = (requestId: string): string => `${requestFolder(requestId)}/request.json`;

/**
 * "IMG 0012 (1).HEIC" → "img-0012-1.heic": lower case, only [a-z0-9._-], the extension kept, at most
 * 80 characters. A name with nothing usable left becomes the fallback ("photo.jpg").
 */
export function sanitiseFileName(name: string, fallback = "photo"): string {
  const clean = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-{2,}/g, "-");
  const trimmed = name.trim();
  const dot = trimmed.lastIndexOf(".");
  const rawExt = dot > 0 ? trimmed.slice(dot + 1) : "";
  const ext = /^[a-z0-9]{1,5}$/i.test(rawExt) ? `.${rawExt.toLowerCase()}` : "";
  const base = clean(ext ? trimmed.slice(0, dot) : trimmed).replace(/^[-._]+|[-._]+$/g, "") || fallback;
  return `${base.slice(0, MAX_NAME - ext.length).replace(/[-._]+$/g, "") || fallback}${ext}`;
}

/** photos/01-…, photos/02-… — the index keeps two files called IMG_0001.jpg apart and keeps the order. */
export const photoPath = (requestId: string, index: number, name: string): string =>
  `${requestFolder(requestId)}/photos/${String(index + 1).padStart(2, "0")}-${sanitiseFileName(name)}`;

export const crestPath = (requestId: string, name: string): string => `${requestFolder(requestId)}/crest/${sanitiseFileName(name, "crest")}`;

/** A plain object path strictly inside the request's folder: no "..", no "//", no leading slash, safe characters only. */
export function isInsideRequestFolder(requestId: string, path: string): boolean {
  if (typeof path !== "string" || !REQUEST_ID.test(requestId)) return false;
  const prefix = `${requestFolder(requestId)}/`;
  if (!path.startsWith(prefix) || path.length > 300) return false;
  const rest = path.slice(prefix.length);
  return /^[a-z0-9._/-]+$/.test(rest) && !rest.split("/").some((part) => part === "" || part === "." || part === "..");
}

export function openBucket(cfg: Pick<StorageConfig, "url" | "serviceKey" | "bucket">): Bucket {
  const client = createClient(cfg.url, cfg.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client.storage.from(cfg.bucket);
}

const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));

function isNotFound(error: unknown): boolean {
  const e = (error ?? {}) as { status?: number; statusCode?: string; code?: string; message?: string };
  return e.status === 404 || e.statusCode === "404" || e.code === "NoSuchKey" || /not.?found/i.test(e.message ?? "");
}

/** Writes a JSON object. `upsert: false` refuses to overwrite — the first write of a request must be new. */
export async function writeJson(bucket: Bucket, path: string, value: unknown, upsert: boolean): Promise<void> {
  const { error } = await bucket.upload(path, JSON.stringify(value, null, 2), {
    contentType: "application/json",
    cacheControl: "0",
    upsert,
  });
  if (error) throw new StorageFailure("write", errorText(error));
}

/** Reads a JSON object; null when it does not exist. */
export async function readJson<T>(bucket: Bucket, path: string): Promise<T | null> {
  const { data, error } = await bucket.download(path);
  if (error) {
    if (isNotFound(error)) return null;
    throw new StorageFailure("read", errorText(error));
  }
  return JSON.parse(await data.text()) as T;
}

/** Downloads one object as bytes; null when it does not exist (intake-pull). */
export async function readBytes(bucket: Bucket, path: string): Promise<Uint8Array | null> {
  const { data, error } = await bucket.download(path);
  if (error) {
    if (isNotFound(error)) return null;
    throw new StorageFailure("read", errorText(error));
  }
  return new Uint8Array(await data.arrayBuffer());
}

/** A one-file signed upload URL (Supabase keeps it valid for 2 hours; no upsert — each path is written once). */
export async function createUploadTarget(bucket: Bucket, path: string): Promise<UploadTarget> {
  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error || !data) throw new StorageFailure("sign-upload", errorText(error));
  return { path: data.path, token: data.token, signedUrl: data.signedUrl };
}

/**
 * Signed download links, path → URL. A path whose object does not exist maps to null — the owner email
 * says so rather than linking nowhere. A failed call maps every path to null and never throws.
 */
export async function signedLinks(bucket: Bucket, paths: string[], seconds: number = SIGNED_LINK_SECONDS): Promise<Map<string, string | null>> {
  const links = new Map<string, string | null>(paths.map((p) => [p, null]));
  if (!paths.length) return links;
  try {
    const { data, error } = await bucket.createSignedUrls(paths, seconds);
    if (error || !data) return links;
    for (const item of data) if (item.path && links.has(item.path)) links.set(item.path, item.error ? null : (item.signedUrl ?? null));
  } catch {
    // Links are a convenience in the owner email; the request is already stored.
  }
  return links;
}

/** The request ids stored under one month folder ("2026-10"), oldest first (intake-pull --list). */
export async function listRequestIds(bucket: Bucket, month: string): Promise<string[]> {
  const { data, error } = await bucket.list(`${REQUESTS_PREFIX}/${month}`, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error) throw new StorageFailure("list", errorText(error));
  return (data ?? []).map((entry) => entry.name).filter((name) => REQUEST_ID.test(name));
}
