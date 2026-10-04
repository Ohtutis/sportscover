import { useEffect, type FormEvent } from "react";
import { FOOTER_COLUMNS } from "../../lib/nav";
import { CONSENTS, CONSENT_ORDER, type ConsentKey } from "../../lib/intake/types";
import { ConsentRow } from "../ConsentRow";
import { ExternalIcon } from "../icons";
import { TrustLine } from "../TrustLine";
import { FieldError } from "./fields";
import { errorId, fieldId } from "./model";
import { UI } from "./strings";

export interface ConsentFieldsProps {
  /** Whether a crest is attached — its consent row exists only then. */
  crest: boolean;
  onChange: (key: ConsentKey, checked: boolean) => void;
  errors: Record<string, string | undefined>;
}

/** The three policies, labelled exactly as the footer labels them. */
const POLICY_HREFS = ["/privacy", "/privacy/biometric", "/terms"];
const POLICIES = (FOOTER_COLUMNS.find((c) => c.title === "Legal")?.links ?? []).filter((l) => POLICY_HREFS.includes(l.href));

/**
 * Section 06 — one sentence, one checkbox (`ConsentRow`), each sentence verbatim from CONSENTS in
 * CONSENT_ORDER. The crest row is in the DOM only behind `hidden` until a crest is attached; marketing is
 * optional. ConsentRow is the house component and stays uncontrolled: the form listens to the change
 * events bubbling out of this fieldset, and after a send attempt this component writes `aria-invalid` +
 * `aria-describedby` onto the checkbox so the error sentence under the row is announced with it.
 * The policies open in a new tab — leaving this page would lose the photos already chosen.
 */
export function ConsentFields({ crest, onChange, errors }: ConsentFieldsProps) {
  useEffect(() => {
    for (const key of CONSENT_ORDER) {
      const box = document.getElementById(fieldId(`consents.${key}`));
      if (!box) continue;
      const message = errors[`consents.${key}`];
      if (message) {
        box.setAttribute("aria-invalid", "true");
        box.setAttribute("aria-describedby", errorId(`consents.${key}`));
        box.setAttribute("data-fp-invalid", "");
      } else {
        box.removeAttribute("aria-invalid");
        box.removeAttribute("aria-describedby");
        box.removeAttribute("data-fp-invalid");
      }
    }
  }, [errors, crest]);

  const onBoxChange = (e: FormEvent<HTMLFieldSetElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type !== "checkbox") return;
    const key = CONSENT_ORDER.find((k) => target.id === fieldId(`consents.${k}`));
    if (key) onChange(key, target.checked);
  };

  return (
    <div>
      {/*
        ConsentRow's label is only as tall as its sentence (20 px for one line). The house component is
        another owner's file, so the 44 px target is a child rule here — the Breadcrumbs trick: py-3 grows
        the clickable label, -my-3 gives the space back so the rows do not move. The 24 px gap keeps the
        grown targets from overlapping.
      */}
      <fieldset onChange={onBoxChange} className="flex min-w-0 flex-col gap-6">
        {CONSENT_ORDER.map((key) => {
          const consent = CONSENTS[key];
          const shown = key !== "crest" || crest;
          const required = consent.required || (key === "crest" && crest);
          return (
            <div key={key} hidden={!shown} className="max-w-[68ch] [&_label]:-my-3 [&_label]:py-3">
              <ConsentRow id={fieldId(`consents.${key}`)} name={`consent-${key}`} label={consent.text} required={required} />
              <FieldError id={errorId(`consents.${key}`)} message={errors[`consents.${key}`]} className="ml-8" />
            </div>
          );
        })}
      </fieldset>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1">
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
      <TrustLine className="mt-6" />
    </div>
  );
}
