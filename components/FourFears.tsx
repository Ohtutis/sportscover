import Link from "next/link";
import { imprintComplete } from "../lib/site";
import { ArrowRightIcon, icons, type IconName } from "./icons";

/**
 * Four things every parent asks first (COPY §1.3). Long = four cards, whole card a link, Anton
 * questions with the `?` kept; short = the "Still deciding?" strip inside every product CTA block,
 * directly above the TrustLine. Card 2 is imprint-gated (GAPS #19): until the imprint env vars exist
 * it points to the About page and never claims a legal entity in the footer.
 */
export interface Fear {
  key: string;
  icon: IconName;
  q: string;
  a: string;
  link: string;
  href: string;
  /** The "Still deciding?" fragment. */
  short: string;
  shortHref: string;
}

export const PRIVACY_ANSWER_WITH_IMPRINT =
  "An independent studio in Lithuania, printed by professional labs in the US. The legal entity and address are in the footer of every page.";
export const PRIVACY_ANSWER_WITHOUT_IMPRINT =
  "An independent studio in Lithuania, printed by professional labs in the US. Contact and studio details are on the About page.";

export function fears(): Fear[] {
  return [
    {
      key: "likeness",
      icon: "likeness",
      q: "Will it look like my kid?",
      a: "We build a reference of your athlete from your photos before a single shot is made, and check every shot against it. If it doesn't look like them, it doesn't ship.",
      link: "How likeness is checked",
      href: "/how-it-works#likeness",
      short: "Looks like them or it doesn't ship",
      shortHref: "/how-it-works#likeness",
    },
    {
      key: "privacy",
      icon: "privacy",
      q: "Who is asking for my child's photos?",
      a: imprintComplete() ? PRIVACY_ANSWER_WITH_IMPRINT : PRIVACY_ANSWER_WITHOUT_IMPRINT,
      link: "Who we are",
      href: "/about",
      short: "You approve a proof first",
      shortHref: "/guarantee",
    },
    {
      key: "promise",
      icon: "promise",
      q: "What if it's wrong?",
      a: "You approve a proof before anything is finalized. If we cannot reach a result you are happy with, we refund every cent you spent.",
      link: "Read the promise",
      href: "/guarantee",
      short: "Refund every cent if we can't get there",
      shortHref: "/guarantee",
    },
    {
      key: "card",
      icon: "card",
      q: "Is this a real card or a photo print?",
      a: "A square-cut, UV-coated 2.5 × 3.5 in trading card, front and back, with its registered card ID and QR code on the back.",
      link: "See the spec sheet",
      href: "/trading-cards#spec",
      short: "Real square-cut card, registered ID on the back",
      shortHref: "/trading-cards#spec",
    },
  ];
}

export const STILL_DECIDING = "Still deciding?";

export function FourFears({ variant, className = "" }: { variant: "long" | "short"; className?: string }) {
  const items = fears();
  if (variant === "short") {
    return (
      <nav aria-label={STILL_DECIDING} className={`font-body text-small text-muted-text ${className}`.trim()}>
        <p>
          <strong className="font-bold text-ink">{STILL_DECIDING}</strong>{" "}
          {items.map((f, i) => (
            <span key={f.key}>
              {i > 0 ? <span aria-hidden="true"> · </span> : null}
              <Link href={f.shortHref} className="text-ink underline-offset-4 decoration-1 transition-[text-decoration-thickness] duration-hover ease-out hover:underline">
                {f.short}
              </Link>
            </span>
          ))}
        </p>
      </nav>
    );
  }
  return (
    // 2 x 2 through lg, four across only from xl: at 1024 the four cells were 210 px, the body set
    // 17 characters to a line and every question broke into four lines (layout audit 2026-09-08).
    <ul className={`grid auto-rows-fr gap-4 md:grid-cols-2 md:gap-5 lg:gap-6 xl:grid-cols-4 ${className}`.trim()}>
      {items.map((f) => {
        const Icon = icons[f.icon];
        return (
          <li key={f.key}>
            <Link
              href={f.href}
              className="group flex h-full flex-col rounded-ui border border-hairline bg-stock p-5 transition-[border-color] duration-hover ease-out hover:border-ink lg:p-6"
            >
              <div className="flex items-start gap-3">
                <Icon size={24} className="mt-0.5 shrink-0 text-ink" />
                <h3 className="font-display text-[1.25rem] uppercase lg:text-h3">{f.q}</h3>
              </div>
              <p className="mt-3 font-body text-small text-ink lg:text-[0.9375rem]">{f.a}</p>
              <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 font-body text-small font-medium text-ink">
                {f.link}
                <ArrowRightIcon size={16} className="text-accent transition-transform duration-hover ease-out group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
