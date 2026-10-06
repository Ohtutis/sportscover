import { Fragment, type FormEvent } from "react";
import { FOOTER_COLUMNS } from "../../lib/nav";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { CONSENTS, CONSENT_ORDER, type ConsentKey } from "../../lib/intake/types";
import { ConsentRow } from "../ConsentRow";
import { ExternalIcon } from "../icons";
import { FieldError } from "./fields";
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
 * The confirmations a request needs (the crest's only once a crest is attached), in CONSENT_ORDER. v4
 * (owner, 2026-10-06): the optional marketing row is gone from the form — the payload never carries it,
 * and the parser still reads it as false, so the stored shape is unchanged.
 */
type ConfirmationKey = Exclude<ConsentKey, "marketing">;
const CONFIRMATIONS = CONSENT_ORDER.filter((k): k is ConfirmationKey => CONSENTS[k].required || k === "crest");
const NOTES: Partial<Record<ConsentKey, string>> = INTAKE_COPY.consentNotes;
/** "A. B." → ["A.", "B."]: each sentence of the plain line starts its own line (no lookbehind — older Safari cannot parse one). */
const sentences = (line: string): string[] => (line.match(/[^.!?]+(?:[.!?]+|$)/g) ?? [line]).map((s) => s.trim()).filter(Boolean);

/**
 * The permissions, after step 5 and unnumbered — v3 (owner review 2026-10-06): the grey "PERMISSIONS."
 * panel with REQUIRED tags read like a contract, "as if we were doing something not legit". Now three
 * quick confirmations on a white card: a heading one size under the step titles (it is not a step), one
 * plain line, "All three are needed" once instead of a tag per row, and per row a plain-language title
 * (`consentTitles`) over the consent sentence. The sentences are unchanged: verbatim from CONSENTS, in
 * CONSENT_ORDER, one checkbox each (`ConsentRow`), the sentence the box's label. The crest row is in the
 * DOM behind `hidden` until a crest is attached, and then the counts say four. No optional row (v4: the
 * marketing permission is not asked on this form). ConsentRow stays uncontrolled: the form listens to the change
 * events bubbling out of this fieldset. After a send attempt each unticked required box is
 * `aria-invalid` and names the error sentence under its row. The policies open in a new tab — leaving
 * this page would lose the photos already chosen.
 */
export function ConsentFields({ crest, onChange, errors, titleId }: ConsentFieldsProps) {
  const onBoxChange = (e: FormEvent<HTMLFieldSetElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type !== "checkbox") return;
    const key = CONSENT_ORDER.find((k) => target.id === fieldId(`consents.${k}`));
    if (key) onChange(key, target.checked);
  };
  const panel = crest ? INTAKE_COPY.consentPanel.withCrest : INTAKE_COPY.consentPanel;

  const row = (key: ConfirmationKey) => {
    const consent = CONSENTS[key];
    const shown = key !== "crest" || crest;
    const required = consent.required || (key === "crest" && crest);
    const message = errors[`consents.${key}`];
    return (
      <div key={key} hidden={!shown} className="max-w-[62ch]">
        <ConsentRow
          id={fieldId(`consents.${key}`)}
          name={`consent-${key}`}
          label={consent.text}
          required={required}
          invalid={Boolean(message)}
          describedBy={message ? errorId(`consents.${key}`) : undefined}
          title={INTAKE_COPY.consentTitles[key]}
          note={NOTES[key]}
          tone={required ? "default" : "quiet"}
        />
        <FieldError id={errorId(`consents.${key}`)} message={message} className="ml-8" />
      </div>
    );
  };

  return (
    <section aria-labelledby={titleId} className="rounded-ui border border-hairline bg-white p-5 sm:p-7 lg:p-8">
      <h2 id={titleId} className="font-display text-h3 uppercase text-balance text-ink">
        {panel.title}
      </h2>
      {/* One line per sentence: wrapped at the house measure, the line left "…posted / or shared." dangling at 1440. */}
      <p className="mt-3 max-w-[60ch] font-body text-body text-pretty text-ink">
        {sentences(panel.line).map((sentence, i) => (
          <Fragment key={sentence}>
            {i > 0 ? " " : null}
            <span className="block">{sentence}</span>
          </Fragment>
        ))}
      </p>
      <fieldset onChange={onBoxChange} className="mt-6 min-w-0 [&_input]:accent-ink">
        <legend className="sr-only">{panel.title}</legend>
        <p className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">{panel.needed}</p>
        {/* 24 px between rows: each row is its own tap target (ConsentRow stretches the label over it). */}
        <div className="mt-5 flex flex-col gap-6">{CONFIRMATIONS.map(row)}</div>
      </fieldset>
      {/* No separator glyphs: at 390 px the row wraps, and a leading "·" dangled before "Terms". */}
      <ul className="mt-6 flex flex-wrap gap-x-6 border-t border-hairline pt-2">
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
