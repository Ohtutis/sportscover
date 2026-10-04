// request.json — the one stored record of a free-proof request (no database: the bucket folder IS the
// request). Written by start with status "uploading", rewritten by complete with status "received".

import type { ProofRequest } from "../types";

export interface IssuedPaths {
  /** One object path per photo, in the order the parent chose them (photos[i] ↔ photos[i] of the request). */
  photos: string[];
  crest: string | null;
}

/** The validated request (minus the one-time Turnstile token) plus what the server knows about it. */
export interface StoredRequest extends Omit<ProofRequest, "turnstileToken"> {
  requestId: string;
  status: "uploading" | "received";
  createdAt: string;
  receivedAt?: string;
  /** Keyed daily hash (token.ts `hashIp`) — never the address. */
  ipHash: string;
  /** Truncated to 200 characters. */
  userAgent: string;
  /** The upload paths start signed — complete accepts nothing else. */
  issued: IssuedPaths;
  /** What the browser reported as uploaded (a subset of `issued`). */
  uploaded?: IssuedPaths;
  /** Which emails went out (best effort, written after sending). */
  emails?: { owner: boolean; customer: boolean; at: string };
}

export const USER_AGENT_MAX = 200;

export function buildRecord(args: {
  requestId: string;
  request: ProofRequest;
  issued: IssuedPaths;
  now: Date;
  ipHash: string;
  userAgent: string;
}): StoredRequest {
  const r = args.request;
  // Field by field (not a spread) so the Turnstile token can never be stored, and a field added to
  // ProofRequest fails the type check here until someone decides whether it belongs in the record.
  return {
    requestId: args.requestId,
    status: "uploading",
    createdAt: args.now.toISOString(),
    version: r.version,
    products: r.products,
    style: r.style,
    athlete: r.athlete,
    contact: r.contact,
    consents: r.consents,
    consentTextVersion: r.consentTextVersion,
    photos: r.photos,
    crest: r.crest,
    source: r.source,
    ipHash: args.ipHash,
    userAgent: args.userAgent.slice(0, USER_AGENT_MAX),
    issued: args.issued,
  };
}
