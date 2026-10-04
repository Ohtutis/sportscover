import { Field, INPUT, INPUT_PROSE, SELECT, border, describe } from "./fields";
import { fieldId, type ContactState } from "./model";
import { COUNTRIES, UI } from "./strings";
import { SHIPPING_SENTENCE } from "../../lib/catalog/delivery";

export interface ContactFieldsProps {
  contact: ContactState;
  onChange: (patch: Partial<ContactState>) => void;
  errors: Record<string, string | undefined>;
  todayIso: string;
}

/** Section 05 — where the proof goes. Email and phone are prose fields (`normal-case`). */
export function ContactFields({ contact, onChange, errors, todayIso }: ContactFieldsProps) {
  const id = (key: string) => fieldId(`contact.${key}`);
  const err = (key: string) => errors[`contact.${key}`];
  const invalid = (key: string) => (err(key) ? { "data-fp-invalid": "" } : {});
  return (
    <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
      <Field id={id("name")} label={UI.contact.name} error={err("name")}>
        <input
          id={id("name")}
          type="text"
          autoComplete="name"
          maxLength={80}
          value={contact.name}
          onChange={(e) => onChange({ name: e.target.value })}
          {...describe(id("name"), { error: err("name") })}
          {...invalid("name")}
          className={`${INPUT} ${border(Boolean(err("name")))}`}
        />
      </Field>
      <Field id={id("email")} label={UI.contact.email} help={UI.contact.emailHint} error={err("email")}>
        <input
          id={id("email")}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={254}
          value={contact.email}
          onChange={(e) => onChange({ email: e.target.value })}
          {...describe(id("email"), { help: true, error: err("email") })}
          {...invalid("email")}
          className={`${INPUT} ${INPUT_PROSE} ${border(Boolean(err("email")))}`}
        />
      </Field>
      <Field id={id("phone")} label={UI.contact.phone}>
        <input
          id={id("phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={40}
          value={contact.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          className={`${INPUT} ${INPUT_PROSE} ${border(false)}`}
        />
      </Field>
      <Field id={id("country")} label={UI.contact.country} help={SHIPPING_SENTENCE}>
        <select
          id={id("country")}
          autoComplete="country-name"
          value={contact.country}
          onChange={(e) => onChange({ country: e.target.value })}
          {...describe(id("country"), { help: true })}
          className={`${SELECT} ${border(false)}`}
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field id={id("neededBy")} label={UI.contact.neededBy} help={UI.contact.neededByHint} error={err("neededBy")}>
        <input
          id={id("neededBy")}
          type="date"
          min={todayIso}
          value={contact.neededBy}
          onChange={(e) => onChange({ neededBy: e.target.value })}
          {...describe(id("neededBy"), { help: true, error: err("neededBy") })}
          {...invalid("neededBy")}
          className={`${INPUT} ${border(Boolean(err("neededBy")))} sm:max-w-[16rem]`}
        />
      </Field>
    </div>
  );
}
