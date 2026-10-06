import { Field, INPUT, INPUT_PROSE, border, describe } from "./fields";
import { fieldId, type ContactState } from "./model";
import { UI } from "./strings";

export interface ContactFieldsProps {
  contact: ContactState;
  onChange: (patch: Partial<ContactState>) => void;
  errors: Record<string, string | undefined>;
}

/**
 * The last step — where the proof goes (owner review 2026-10-04, point 12): your name and the email,
 * nothing else. The phone and country fields are gone (the payload still carries them, empty); the
 * need-it-by date is gone from the form altogether (owner, 2026-10-06). Email is a prose field (`normal-case`).
 */
export function ContactFields({ contact, onChange, errors }: ContactFieldsProps) {
  const id = (key: string) => fieldId(`contact.${key}`);
  const err = (key: string) => errors[`contact.${key}`];
  const invalid = (key: string) => (err(key) ? { "data-fp-invalid": "" } : {});
  return (
    <div className="grid gap-x-6 gap-y-7 md:grid-cols-2">
      <Field id={id("name")} label={UI.contact.name} tag="required" error={err("name")}>
        <input
          id={id("name")}
          type="text"
          autoComplete="name"
          maxLength={80}
          required
          value={contact.name}
          onChange={(e) => onChange({ name: e.target.value })}
          {...describe(id("name"), { error: err("name") })}
          {...invalid("name")}
          className={`${INPUT} ${border(Boolean(err("name")))}`}
        />
      </Field>
      <Field id={id("email")} label={UI.contact.email} tag="required" help={UI.contact.emailHint} error={err("email")}>
        <input
          id={id("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={254}
          required
          value={contact.email}
          onChange={(e) => onChange({ email: e.target.value })}
          {...describe(id("email"), { help: true, error: err("email") })}
          {...invalid("email")}
          className={`${INPUT} ${INPUT_PROSE} ${border(Boolean(err("email")))}`}
        />
      </Field>
    </div>
  );
}
