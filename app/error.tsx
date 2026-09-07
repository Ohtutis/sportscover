"use client";

import { useEffect } from "react";
import { Shield } from "../components/brand/Shield";
import { primaryButtonClass } from "../components/CtaPair";
import { SUPPORT_EMAIL } from "../lib/site";

/** Branded error boundary (COPY §2.13). Renders inside the root layout; nothing decorative. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="container-site max-w-[40rem] py-16 md:py-24">
      <Shield size={48} className="text-navy" />
      <h1 className="mt-8 max-w-[16ch] font-display text-display uppercase text-balance">SOMETHING WENT WRONG ON OUR SIDE.</h1>
      <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-muted-text">
        Nothing was lost. Try again, or email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-ink underline decoration-1 underline-offset-4">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className={primaryButtonClass("md", "mt-8")}
      >
        Try again
      </button>
    </main>
  );
}
