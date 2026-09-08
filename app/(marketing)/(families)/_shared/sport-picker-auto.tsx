"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type ReactNode } from "react";

/**
 * Makes the sport field take effect as soon as it changes, without navigating away from the reader.
 *
 * It used to call `form.requestSubmit()`, which is a GET navigation: the whole document reloaded and
 * the scroll position went to 0 — measured 837 → 0 on `/trading-cards` — for a change that rewrites
 * one paragraph and every order link (smooth audit, 2026-09-08). `router.replace(url, { scroll: false })`
 * asks the server for the same page with the new `?sport=`, swaps in what differs and leaves the
 * viewport alone. `replace`, not `push`, because seventeen sports must not become seventeen entries
 * between the reader and the back button.
 *
 * Wrapping the field rather than owning it keeps the `<select>` and its options server-rendered, so
 * the form still works with the island switched off; the submit button for that case is inside a
 * `<noscript>` in the parent and never renders here.
 */
export function SportPickerAutoSubmit({ action, children }: { action: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const field = ref.current?.querySelector("select");
    if (!field) return;
    const onChange = () => {
      const value = field.value;
      startTransition(() => {
        router.replace(value ? `${action}?sport=${encodeURIComponent(value)}` : action, { scroll: false });
      });
    };
    field.addEventListener("change", onChange);
    return () => field.removeEventListener("change", onChange);
  }, [action, router]);

  return (
    <div ref={ref} aria-busy={pending || undefined}>
      {children}
    </div>
  );
}
