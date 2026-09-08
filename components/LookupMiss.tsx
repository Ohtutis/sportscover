"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LookupStatus } from "./LookupForm";

/**
 * Renders the lookup status line from the `miss` search param on the client, so a page carrying a
 * lookup form still prerenders as static HTML. A server component that awaited `searchParams` would
 * opt the whole route out of static generation (Next 16 without Cache Components), which cost the
 * home page and the three family pages their prerender. Wrap this in <Suspense>.
 *
 * It also repairs the miss itself (smooth audit S9): the route echoes what was typed back as `id`,
 * and this island puts it back in the field and moves focus there, with the caret at the end. The
 * message specifically warns about O versus 0 — asking for all 18 characters again, from a field
 * that has been emptied and is not focused, is the miss doing its damage twice.
 *
 * The status text is rendered one tick after mount, so the live region exists in the DOM BEFORE its
 * text arrives; a region that appears with its text already inside is never announced.
 */
export function LookupMiss({ tone = "stock", inputId = "card-id" }: { tone?: "stock" | "arena"; inputId?: string }) {
  const params = useSearchParams();
  const miss = params.get("miss") ?? undefined;
  const typedId = params.get("id") ?? "";
  const [announce, setAnnounce] = useState(false);

  useEffect(() => {
    if (!miss) return;
    // One frame later, so the empty region is painted first and the text lands as a change inside it.
    const timer = window.setTimeout(() => setAnnounce(true), 0);
    const field = document.getElementById(inputId);
    if (field instanceof HTMLInputElement) {
      if (typedId && !field.value) field.value = typedId;
      field.focus({ preventScroll: true });
      const end = field.value.length;
      field.setSelectionRange?.(end, end);
    }
    return () => window.clearTimeout(timer);
  }, [miss, typedId, inputId]);

  return <LookupStatus miss={announce ? miss : undefined} tone={tone} />;
}
