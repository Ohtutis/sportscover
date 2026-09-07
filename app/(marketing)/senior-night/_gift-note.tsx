import { Shield } from "../../../components/brand/Shield";

/**
 * The printable gift note (COPY §2.5 (2), DESIGN §5.3-2). It carries the `hidden` ATTRIBUTE, which
 * Tailwind's preflight hides with `!important` — so it neither shows nor prints until
 * `OrderByCalculator` sets `hidden = false` on the honest-fallback path and calls `window.print()`.
 * After that the `hidden print:block` classes keep it off screen and put it on paper alone (the rest
 * of the page is `print:hidden`).
 *
 * `{First}` is a ruled blank rather than a value: the calculator island owns the fallback button and
 * has no name field to hand over, and a handwritten first name is what a gift note wants anyway
 * (deviation recorded in docs/f1/INTEGRATION-NOTES.md).
 */
export const GIFT_NOTE_STRINGS = {
  heading: "THIS IS YOUR SENIOR EDITION.",
  bodyAfterName:
    ", your Senior Night card and poster are being made from your own photos — one registered edition, yours alone. The printed set arrives after the night. One last home game — and it's on the wall for good.",
  nameLabel: "Your athlete's first name",
  signOff: "From",
  small: "Game Day Edition · gamedayedition.com/senior-night",
} as const;

const RULE = "inline-block min-w-[9rem] border-b border-ink align-baseline";

export function GiftNote({ id }: { id: string }) {
  return (
    <div id={id} hidden className="hidden print:block">
      <div className="mx-auto max-w-[148mm] border-t border-gold bg-white px-10 py-12 text-ink">
        <Shield size={40} className="text-navy" />
        <h2 className="mt-8 font-display text-h3 uppercase text-balance">{GIFT_NOTE_STRINGS.heading}</h2>
        <p className="mt-6 max-w-[62ch] font-body text-body text-pretty">
          <span aria-hidden="true" className={RULE} />
          <span className="sr-only">{GIFT_NOTE_STRINGS.nameLabel}</span>
          {GIFT_NOTE_STRINGS.bodyAfterName}
        </p>
        <p className="mt-12 font-body text-body">
          {GIFT_NOTE_STRINGS.signOff} <span aria-hidden="true" className={RULE} />
        </p>
        <p className="mt-10 border-t border-hairline pt-3 font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
          {GIFT_NOTE_STRINGS.small}
        </p>
      </div>
    </div>
  );
}
