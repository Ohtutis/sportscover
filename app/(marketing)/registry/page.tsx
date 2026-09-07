// /registry — the lookup and what a registered edition is (COPY §2.10, DESIGN §5.8).
// No list of cards, ever: the only way in is an exact ID. The form is a plain POST to
// /registry/lookup, so it works without JavaScript; a miss comes back here as `?miss=1`.
import { Suspense } from "react";
import { LookupMiss } from "../../../components/LookupMiss";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CardFace } from "../../../components/CardFace";
import { EDITION_SENTENCE } from "../../../components/EditionPanel";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Ledger } from "../../../components/Ledger";
import { LookupForm } from "../../../components/LookupForm";
import { QrRing } from "../../../components/QrRing";
import { SectionHeading } from "../../../components/SectionHeading";
import { asset, hasAsset } from "../../../lib/assets";
import { styles } from "../../../lib/catalog/styles";
import { pageMeta } from "../../../lib/seo/meta";
import { SUPPORT_EMAIL } from "../../../lib/site";

export const metadata: Metadata = pageMeta("/registry");

const DEMO_ID = "GDE-SN-BKB-2026-12";
const RECORD = "font-label font-semibold uppercase tracking-[0.06em] tabular-nums";

/** The five parts of a card ID, with the label each part carries (DESIGN §5.8 (2)). */
const ID_PARTS: { value: string; label: string }[] = [
  { value: "GDE", label: "brand" },
  { value: "SN", label: "style" },
  { value: "BKB", label: "sport" },
  { value: "2026", label: "season" },
  { value: "12", label: "number" },
];

const FINISH_LEGEND = styles.map((s) => `${s.code} ${s.name}`).join(" · ");

const ROWS = [
  {
    key: "How to read the ID",
    value: (
      <>
        <span className={RECORD}>GDE-{"<style>"}-{"<sport>"}-{"<season>"}-{"<number>"}</span> — style is the finish code, sport is the
        three-letter sport code, season is the year on the card, and the last part is the jersey number — or, for sports that don&apos;t wear
        numbers and for adult athletes, an edition number such as 01 rather than a shirt number.
      </>
    ),
  },
  {
    key: "One edition per athlete, per finish, per season",
    value: <>{EDITION_SENTENCE} Senior Night editions carry SENIOR EDITION · 1 OF 1.</>,
  },
  {
    key: "What the registry stores",
    value: (
      <>
        Only what is printed on the card — name, team, position, season, stats, highlight and the finish — plus the date it was registered.
        What it never stores: photos, addresses, birthdays, emails, order numbers.
      </>
    ),
  },
  {
    key: "The certificate",
    value: <>A printed Certificate of Authenticity ships with every printed package and shows the same ID.</>,
  },
  {
    key: "How long",
    value: (
      <>
        Registered pages stay online for at least five years from the order, and if the studio ever winds down we keep the registry
        resolving for that period or tell you how to keep a copy —{" "}
        <Link href="/terms#registry" className="underline underline-offset-4 decoration-1">
          the terms say it in full
        </Link>
        .
      </>
    ),
  },
  {
    key: "Visibility",
    value: (
      <>
        Customer pages are unlisted by default: they open only from the QR code or the exact ID and are not indexed by search engines.
        Public pages exist only with the parent or guardian&apos;s written permission. To unlist, make public or delete a page, email{" "}
        {SUPPORT_EMAIL} from the purchase address with the order number.
      </>
    ),
  },
];

export default function RegistryPage() {
  const back = hasAsset("cards.demo.back") ? asset("cards.demo.back") : null;

  return (
    <div className="container-site py-12 md:py-16">
      {/*
        The exhibit is the whole argument of this page — "this is where the ID is" — and it was
        drawn at 200 px in a 736 px column, with its credit wrapping to four lines under a card too
        small to read the ring, the stats or the ID it demonstrates (owner review 2026-09-07). The
        lookup band is a full 12-column row now: the form at its own measure, the card back beside
        it at 340 px. The prose below keeps the narrow measure it had.
      */}
      <section className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
        <div className="lg:col-span-7">
          {/* Every other page shows the trail it already emitted as JSON-LD; this one emitted the
              schema and drew nothing. Breadcrumbs carries both (owner review 2026-09-07). */}
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Registry", href: "/registry" }]} className="mb-6" />
          <SectionHeading
            as="h1"
            title="LOOK UP A CARD."
            subhead="Every card carries its registered card ID on the back and on the certificate. Type it here to open the card's page."
          />
          <div className="mt-8 max-w-[34rem]">
            <LookupForm missSlot={<Suspense fallback={null}><LookupMiss /></Suspense>} />
            <p className="mt-6 font-body text-small text-muted-text">
              Try a demo:{" "}
              <Link href={`/c/${DEMO_ID}`} className={`${RECORD} text-ink underline underline-offset-4 decoration-1`}>
                {DEMO_ID}
              </Link>{" "}
              (fictional athlete).
            </p>
          </div>
        </div>
        {back ? (
          <figure className="mt-10 hidden sm:block lg:col-span-5 lg:mt-0">
            {/* The card floats on the page — no plate, no mat: the shadow under it is the only
                ground it gets, and the ring is drawn over the QR the ID belongs to. */}
            {/* The stock card shadow is `0 1px 0` + a 40 px drop, and under a square-cut card at
                this size the hard 1 px line read as a second, mis-registered rectangle behind it
                (owner review 2026-09-07). CardFace owns that shadow and is another builder's file, so
                the re-aim is a child rule here — one soft shadow, straight down, no hairline. */}
            <div className="relative mx-auto w-[280px] [&>div]:shadow-[0_30px_54px_-30px_rgb(20_25_31/0.45)] lg:w-[340px]">
              <CardFace {...back} labelled sizes="(min-width: 1024px) 340px, 280px" />
              <QrRing />
            </div>
            <figcaption className="mx-auto mt-4 max-w-[34ch] text-center">
              <FictionalLabel />
            </figcaption>
          </figure>
        ) : null}
      </section>

      <section className="mt-16 max-w-[46rem] md:mt-24">
        <SectionHeading as="h2" title="WHAT A REGISTERED EDITION IS." />
        <div className="mt-8 overflow-x-auto">
          <div className="flex min-w-max items-end justify-center gap-1">
            {ID_PARTS.map((part, i) => (
              <div key={part.label} className="flex items-end gap-1">
                {i > 0 ? <span className={`${RECORD} pb-2 text-[1.5rem] text-muted-text md:text-[2rem]`}>-</span> : null}
                <div>
                  <span className={`${RECORD} block text-center text-[1.5rem] leading-none md:text-[2rem]`}>{part.value}</span>
                  <span className="mt-3 block border-t border-ink pt-2 text-center font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
                    {part.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 font-body text-small text-muted-text">{FINISH_LEGEND}</p>
        <Ledger className="mt-8" rows={ROWS} />
      </section>
    </div>
  );
}
