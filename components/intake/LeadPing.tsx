"use client";

import { useEffect } from "react";
import { trackLead } from "../../lib/track";

/** sessionStorage key prefix: the form leaves `{ content_ids, num_items }` here for the thanks page. */
export const LEAD_STORE_PREFIX = "gde-fp-lead:";

/**
 * The thanks page's one measurement: a `Lead`, once per request reference, and only when this tab just
 * sent that request — the form leaves a note in sessionStorage before it navigates here, so a reload, a
 * shared link or a bookmarked thanks page never counts (where storage is blocked the lead is counted
 * once for the page view). The pixel may still be loading when this mounts, so it waits up to five
 * seconds for `fbq`; without the pixel `trackLead` is a no-op. The payload carries the product keys
 * only — never a name, an email or a photo URL.
 */
export function LeadPing({ requestId }: { requestId: string | null }) {
  useEffect(() => {
    if (!requestId) return;
    const firedKey = `${LEAD_STORE_PREFIX}${requestId}:sent`;
    let payload: { content_category: string; content_ids?: string[]; num_items?: number } = { content_category: "free_proof" };
    try {
      if (window.sessionStorage.getItem(firedKey)) return;
      const raw = window.sessionStorage.getItem(`${LEAD_STORE_PREFIX}${requestId}`);
      // No note from the form in this tab: the page was opened from a shared or bookmarked link, not
      // reached by sending a request — that is not a lead.
      if (raw === null) return;
      const saved = JSON.parse(raw) as { content_ids?: unknown; num_items?: unknown };
      const ids = Array.isArray(saved.content_ids) ? saved.content_ids.filter((x): x is string => typeof x === "string").slice(0, 4) : [];
      payload = {
        ...payload,
        ...(ids.length ? { content_ids: ids } : {}),
        ...(typeof saved.num_items === "number" ? { num_items: saved.num_items } : {}),
      };
    } catch {
      // Storage blocked (private mode): still count the lead once for this page view.
    }
    let tries = 0;
    let timer: number | undefined;
    const send = () => {
      const ready = typeof (window as unknown as { fbq?: unknown }).fbq === "function";
      if (!ready && tries < 20) {
        tries += 1;
        timer = window.setTimeout(send, 250);
        return;
      }
      trackLead(payload);
      try {
        window.sessionStorage.setItem(firedKey, "1");
      } catch {
        // nothing to do
      }
    };
    send();
    return () => window.clearTimeout(timer);
  }, [requestId]);
  return null;
}
