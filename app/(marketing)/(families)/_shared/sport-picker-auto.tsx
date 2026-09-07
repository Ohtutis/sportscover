"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Makes the sport field submit as soon as it changes, and hides the submit button that exists for
 * people without JavaScript. Wrapping the field rather than owning it keeps the `<select>` and its
 * options server-rendered, so the form still works with the island switched off.
 */
export function SportPickerAutoSubmit({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = ref.current?.querySelector("select");
    const form = field?.form;
    if (!field || !form) return;
    const submit = form.querySelector<HTMLElement>("[data-sport-submit]");
    if (submit) submit.hidden = true;
    const onChange = () => form.requestSubmit();
    field.addEventListener("change", onChange);
    return () => {
      field.removeEventListener("change", onChange);
      if (submit) submit.hidden = false;
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
