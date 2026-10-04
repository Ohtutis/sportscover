"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { parsePrefill, type Prefill } from "./model";

/**
 * Reads `?product=…&option=…&sport=…&style=…&classOf=…` (an ad's deep link) ONCE and hands it to the
 * form. It lives in its own <Suspense> boundary so the page around it prerenders as static HTML — a server
 * page that read `searchParams` would opt the whole route out of static generation. Renders nothing.
 */
export function PrefillFromUrl({ onPrefill }: { onPrefill: (prefill: Prefill) => void }) {
  const params = useSearchParams();
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !params) return;
    done.current = true;
    const prefill = parsePrefill((key) => params.get(key));
    const any = prefill.products.length || Object.keys(prefill.options).length || prefill.sport || prefill.style || prefill.classOf;
    if (any) onPrefill(prefill);
  }, [params, onPrefill]);
  return null;
}
