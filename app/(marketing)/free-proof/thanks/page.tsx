// /free-proof/thanks — where a sent request lands (`?ref=<request id>`). Never indexed. The reference is
// printed only when it has the shape of a real one (REQUEST_ID) — anything else in the URL is ignored, so
// the page can't be made to display arbitrary text. The `next` list is the path from here on, in the same
// ruled, numbered form as the steps on /free-proof. One Lead is counted per reference (LeadPing).

import type { Metadata } from "next";
import { ButtonLink } from "../../../../components/ButtonLink";
import { LeadPing } from "../../../../components/intake/LeadPing";
import { validRequestRef } from "../../../../components/intake/model";
import { StepRow } from "../../../../components/intake/ProofPath";
import { UI } from "../../../../components/intake/strings";
import { INTAKE_COPY, INTAKE_THANKS_PATH } from "../../../../lib/intake/copy";
import { pageMeta } from "../../../../lib/seo/meta";

/** The titles-table row (noindex there too) — robots stated here as well, so the page can never be indexed by accident. */
export const metadata: Metadata = { ...pageMeta(INTAKE_THANKS_PATH), robots: { index: false, follow: false } };

export default async function FreeProofThanksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const ref = validRequestRef((await searchParams).ref);
  const t = INTAKE_COPY.thanks;
  return (
    <div className="container-site py-12 md:py-16">
      <section aria-labelledby="thanks-title">
        <h1 id="thanks-title" className="max-w-[16ch] font-display text-display uppercase text-balance">
          {t.h1}
        </h1>
        <p className="mt-4 max-w-[52ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub">{t.lead}</p>
        {ref ? (
          <p className="mt-stack flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">{t.referenceLabel}</span>
            <span className="font-label text-[1.25rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-ink">{ref}</span>
          </p>
        ) : null}
      </section>

      <StepRow items={t.next.map((body, i) => ({ n: i + 1, body }))} current={1} className="mt-12 md:mt-16" />

      <div className="mt-12 flex max-w-[62ch] flex-col gap-3">
        <p className="font-body text-body text-pretty text-ink">{t.reply}</p>
        <p className="font-body text-body font-medium text-pretty text-ink">{t.nothingToPay}</p>
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" variant="outline" className="w-full sm:w-auto">
          {UI.thanks.home}
        </ButtonLink>
        <ButtonLink href="/photo-guide" variant="outline" className="w-full sm:w-auto">
          {UI.thanks.guide}
        </ButtonLink>
      </div>
      <LeadPing requestId={ref} />
    </div>
  );
}
