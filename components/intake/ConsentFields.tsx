import type { FormEvent } from "react";
import { FOOTER_COLUMNS } from "../../lib/nav";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { CONSENTS, CONSENT_ORDER, type ConsentKey } from "../../lib/intake/types";
import { ConsentRow } from "../ConsentRow";
import { ExternalIcon } from "../icons";
import { FieldError, Tag } from "./fields";
import { errorId, fieldId } from "./model";
import { UI } from "./strings";

export interface ConsentFieldsProps {
  /** Whether a crest is attached — its consent row exists only then. */
  crest: boolean;
  onChange: (key: ConsentKey, checked: boolean) => void;
  errors: Record<string, string | undefined>;
  /** The id of the panel's heading. */
  titleId: string;
}

/** The three policies, labelled exactly as the footer labels them. */
const POLICY_HREFS = ["/privacy", "/privacy/biometric", "/terms"];
const POLICIES = (FOOTER_COLUMNS.find((c) => c.title === "Legal")?.links ?? []).filter((l) => POLICY_HREFS.includes(l.href));

/**
 * The permissions, after step 5 and unnumbered (owner review 2026-10-04, point 13): a quiet grey panel,
 * small type, no orange — still one sentence, one checkbox (`ConsentRow`), each sentence verbatim from
 * CONSENTS in CONSENT_ORDER, the three required ones never merged. The crest row is in the DOM behind
 * `hidden` until a crest is attached; marketing is optional. ConsentRow stays uncontrolled: the form
 * listens to the change events bubbling out of this fieldset. After a send attempt each unticked
 * required box is `aria-invalid` and names the error sentence under its row. The policies open in a new
 * tab — leaving this page would lose the photos already chosen.
 */
export function ConsentFields({ crest, onChange, errors, titleId }: ConsentFieldsProps) {
  const onBoxChange = (e: FormEvent<HTMLFieldSetElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type !== "checkbox") return;
    const key = CONSENT_ORDER.find((k) => target.id === fieldId(`consents.${k}`));
    if (key) onChange(key, target.checked);
  };

  return (
    <section aria-labelledby={titleId} className="rounded-[20px] bg-ink/5 p-5 sm:p-7 lg:p-8">
      <h2 id={titleId} className="font-display text-h3 uppercase text-ink">
        {INTAKE_COPY.sections.consent.title}
      </h2>
      <p className="mt-2 max-w-[60ch] font-body text-small text-muted-text">{INTAKE_COPY.sections.consent.subhead}</p>
      {/* Rows sit 24 px apart: ConsentRow's label grows 12 px each way to reach 44 px, and the grown targets must not overlap. */}
      <fieldset onChange={onBoxChange} className="mt-6 flex min-w-0 flex-col gap-6 [&_input]:accent-ink">
        <legend className="sr-only">{INTAKE_COPY.sections.consent.title}</legend>
        {CONSENT_ORDER.map((key) => {
          const consent = CONSENTS[key];
          const shown = key !== "crest" || crest;
          const required = consent.required || (key === "crest" && crest);
          const message = errors[`consents.${key}`];
          return (
            <div key={key} hidden={!shown} className="max-w-[62ch]">
              <div className="flex flex-col gap-y-1 sm:flex-row sm:items-start sm:justify-between sm:gap-x-6">
                <ConsentRow
                  id={fieldId(`consents.${key}`)}
                  name={`consent-${key}`}
                  label={consent.text}
                  required={required}
                  invalid={Boolean(message)}
                  describedBy={message ? errorId(`consents.${key}`) : undefined}
                  className="min-w-0 flex-1"
                />
                <Tag kind={required ? "required" : "optional"} className="ml-8 self-start sm:ml-0 sm:mt-0.5" />
              </div>
              <FieldError id={errorId(`consents.${key}`)} message={message} className="ml-8" />
            </div>
          );
        })}
      </fieldset>
      <ul className="mt-6 flex flex-wrap gap-x-6 border-t border-ink/10 pt-3">
        {POLICIES.map((policy) => (
          <li key={policy.href}>
            <a
              href={policy.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 font-body text-small text-ink underline decoration-1 underline-offset-4"
            >
              {policy.label}
              <ExternalIcon size={14} />
              <span className="sr-only">{UI.newTab}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
