// Browser helper: send one photo straight to Supabase Storage through the signed upload URL that
// POST /api/intake/start issued for it. Browser-safe — no node imports, no Supabase client in the page.
//
// It is the exact request @supabase/storage-js (2.112) `uploadToSignedUrl(path, token, file)` makes:
//   PUT <SUPABASE_URL>/storage/v1/object/upload/sign/<bucket>/<path>?token=<token>
//   headers  apikey: <anon key> · Authorization: Bearer <anon key> · x-upsert: false
//   body     FormData { cacheControl: "3600", "": <file> }   (no Content-Type: fetch sets the boundary)
// The signed URL from the start response already carries `<bucket>/<path>`; the token is set on it the
// way storage-js sets it, and the URL must belong to the project in `storage.url` — the anon key is never
// sent anywhere else.
//
// One deliberate addition: a "resource already exists" answer resolves instead of throwing. The path is
// unique to this request and was issued only to this browser, so it can only mean an earlier attempt of
// this same upload landed and its response was lost — a retry must not trap the parent in a loop of
// "one photo didn't upload". /api/intake/complete still checks every file exists before the emails.

export interface UploadTarget {
  /** Object path inside the bucket, e.g. proof-requests/2026-10/GDE-R-20261004-7KQ2MX/photos/01-img_0001.jpg */
  path: string;
  token: string;
  signedUrl: string;
}

export interface StorageEndpoint {
  /** The Supabase project URL from the start response. */
  url: string;
  /** The project's PUBLIC anon key from the start response. */
  anonKey: string;
}

/** storage-js DEFAULT_FILE_OPTIONS.cacheControl. */
export const UPLOAD_CACHE_CONTROL = "3600";

const SIGNED_UPLOAD_PATH = "/storage/v1/object/upload/sign/";

/** The PUT URL for a target, or a thrown Error when the target does not point at this project. */
export function signedUploadUrl(target: UploadTarget, storage: StorageEndpoint): string {
  const base = new URL(storage.url);
  const url = new URL(target.signedUrl);
  const prefix = `${base.pathname.replace(/\/+$/, "")}${SIGNED_UPLOAD_PATH}`;
  if (url.origin !== base.origin || !url.pathname.startsWith(prefix)) {
    throw new Error("Upload target does not belong to the storage project.");
  }
  url.searchParams.set("token", target.token);
  return url.toString();
}

/** Storage answers a second upload to the same path with HTTP 400/409 and "Duplicate" / "already exists". */
export function isAlreadyUploaded(status: number, body: string): boolean {
  return status === 409 || /already exists|"Duplicate"|ResourceAlreadyExists/i.test(body);
}

export async function uploadToSignedUrl(
  target: UploadTarget,
  file: File | Blob,
  storage: StorageEndpoint,
  init: { signal?: AbortSignal } = {},
): Promise<void> {
  const body = new FormData();
  body.append("cacheControl", UPLOAD_CACHE_CONTROL);
  body.append("", file);
  const response = await fetch(signedUploadUrl(target, storage), {
    method: "PUT",
    headers: {
      apikey: storage.anonKey,
      Authorization: `Bearer ${storage.anonKey}`,
      "x-upsert": "false",
    },
    body,
    signal: init.signal,
  });
  if (response.ok) return;
  const text = await response.text().catch(() => "");
  if (isAlreadyUploaded(response.status, text)) return;
  throw new Error(`Upload failed (${response.status}): ${text.slice(0, 500)}`);
}
