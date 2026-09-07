"use client";

// The one client island on /photo-guide: "Print this checklist" (COPY §2.8, DESIGN §5.6). It is a
// <button>, not a link — nothing to prefetch and nothing to navigate to — and it is hidden on the
// printed page itself. Button recipe from components/ButtonLink so the outline style is not retyped.
import { buttonClass } from "../../../components/ButtonLink";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("outline", "md", "print:hidden")}>
      {label}
    </button>
  );
}
