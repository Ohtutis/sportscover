"use client";

// First-touch attribution (SEO plan 2026-10-06, master plan §8 "wire attribution before you need the
// numbers"): the first page of the session, where the visitor came from and any campaign tags, kept in
// sessionStorage so the free-proof form can report the ENTRY page rather than its own path — on a form
// reached by a link, `location.pathname` is always "/free-proof", which is the "every row said
// /#early-access" trap. Nothing here is a cookie, nothing leaves the browser until the parent sends the
// form, and nothing identifies a person: a path, a referrer host and the utm_* values.

import { useEffect } from "react";

export const ENTRY_KEY = "gde_entry";
export const ENTRY_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

export interface EntryRecord {
  /** The first path of the session, with its query stripped. */
  path: string;
  /** document.referrer at that first page, trimmed to 300 characters. */
  referrer: string;
  utm: Record<string, string>;
  /** ISO timestamp of that first page view. */
  at: string;
}

/** The record stored for this session, or null (storage blocked, nothing stored yet, or unparsable). */
export function readEntry(): EntryRecord | null {
  try {
    const raw = window.sessionStorage.getItem(ENTRY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EntryRecord>;
    if (typeof parsed.path !== "string" || !parsed.path.startsWith("/")) return null;
    return { path: parsed.path, referrer: typeof parsed.referrer === "string" ? parsed.referrer : "", utm: parsed.utm && typeof parsed.utm === "object" ? parsed.utm : {}, at: typeof parsed.at === "string" ? parsed.at : "" };
  } catch {
    return null;
  }
}

/** Build the record for the current page — exported so the test can run it without a window. */
export function entryRecordFrom(pathname: string, search: string, referrer: string, now: Date): EntryRecord {
  const params = new URLSearchParams(search);
  const utm: Record<string, string> = {};
  for (const key of ENTRY_KEYS) {
    const v = params.get(key);
    if (v) utm[key] = v.slice(0, 200);
  }
  return { path: pathname.slice(0, 300) || "/", referrer: referrer.slice(0, 300), utm, at: now.toISOString() };
}

/**
 * Mounted once in the marketing layout. Writes the record on the first page view of the session and
 * never overwrites it — later pages keep the entry page. Campaign tags on a LATER page (an ad landing
 * mid-session) are merged in without moving the path, so a tagged visit is never counted as untagged.
 */
export function EntryAttribution() {
  useEffect(() => {
    try {
      const existing = readEntry();
      const current = entryRecordFrom(window.location.pathname, window.location.search, document.referrer, new Date());
      if (!existing) {
        window.sessionStorage.setItem(ENTRY_KEY, JSON.stringify(current));
      } else if (Object.keys(current.utm).length && !Object.keys(existing.utm).length) {
        window.sessionStorage.setItem(ENTRY_KEY, JSON.stringify({ ...existing, utm: current.utm }));
      }
    } catch {
      // Storage blocked (private mode, cleared data): attribution is a nice-to-have, never a failure.
    }
  }, []);
  return null;
}
