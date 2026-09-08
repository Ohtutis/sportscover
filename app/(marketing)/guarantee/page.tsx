// /guarantee — COPY §2.7, DESIGN §5.5 (stock; no imagery at all — the authority is the typesetting). GAPS #31 drops COPY's at-our-expense reprint clause from "Proof approval", and with
// DELIVERED_COUNT = 0 the delivered-count sentence is not rendered at all.

import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CtaPair } from "../../../components/CtaPair";
import { FounderNote } from "../../../components/FounderNote";
import { Ledger } from "../../../components/Ledger";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { block } from "../../../lib/blocks";
import { visibleShippingRows } from "../../../lib/catalog/shipping";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor } from "../../../lib/cta";
import { pageMeta } from "../../../lib/seo/meta";
import { DELIVERED_COUNT } from "../../../lib/site";

export const revalidate = 3600;
export const metadata = pageMeta("/guarantee");

const PATH = "/guarantee";

/* ---------- 1) what the promise means, exactly ---------- */

const LIMITS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Proof approval.",
    body: (
      <>
        {CANON.proofChecklist} Once you approve, the proof is the print. If a name is misspelled on the proof you approved, we
        still fix it on the files free.
      </>
    ),
  },
  {
    title: "Screen versus print.",
    body: (
      <>
        Colors on a phone or monitor are backlit; paper is not. A slight difference between the proof on screen and the print in
        hand is normal and is not a defect. A wrong color — the team red printed orange — is a defect and is reprinted free.
      </>
    ),
  },
  {
    title: "No cancellation once printing starts.",
    body: (
      <>
        Printing starts the moment you approve the proof. Until you approve the reference set you can cancel for any reason with a
        full refund; between that approval and the proof approval the promise above applies.
      </>
    ),
  },
  {
    title: "“Refund and keep the cards.”",
    body: (
      <>
        That is for prints that arrive wrong — damaged, mis-cut, off-color. It is not a way to get free cards, and repeated
        claims on one order are handled under the{" "}
        <Link href="/terms#refunds" className="text-ink underline-offset-4 decoration-1 hover:underline">
          terms
        </Link>
        .
      </>
    ),
  },
];

/* ---------- 4) the refund ladder ---------- */

const LADDER: { stage: string; happens: string }[] = [
  { stage: "Before you approve the reference set", happens: "Cancel any time — full refund" },
  {
    stage: "Photo check not passed and no stronger photos",
    happens: "Automatic full refund, within 1 business day — before any art is made",
  },
  { stage: "After one revision you still don't like the proof", happens: "Refund every cent" },
  {
    stage: "After proof approval",
    happens: "Printing starts; no cancellation — but a print defect means a free reprint, or a refund and you keep the cards",
  },
  { stage: "Digital files after delivery", happens: "Not refundable, except under the promise above" },
  {
    stage: "If we miss a committed date",
    happens: "You get a new date in writing; if the new date misses your senior night or occasion date, a full refund is offered",
  },
  {
    stage: "Reminders and pauses",
    happens: "Up to three reminders over 14 days, then the order pauses; resume any time within 12 months",
  },
  { stage: "Etsy orders", happens: "Etsy's purchase terms and Etsy refunds apply" },
];

/* ---------- 2) the shipping table: 5 columns at md, stacked records below ---------- */

const COLUMNS = ["Package", "Ships from", "Carrier / packaging", "Timing", "Tracking"] as const;
const TH = "px-4 py-3 text-left font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";
const TD = "px-4 py-4 align-top font-body text-[0.9375rem] text-ink";

function ShippingTable() {
  const rows = visibleShippingRows();
  return (
    <>
      {/* stacked records below md */}
      <ul className="md:hidden">
        {rows.map((row) => (
          <li key={row.key} className="border-t border-hairline py-5 last:border-b last:border-hairline">
            <h3 className="font-display text-h3 uppercase text-ink">{row.package}</h3>
            <dl className="mt-3 grid grid-cols-1 gap-y-2">
              {[
                ["Ships from", row.shipsFrom],
                ["Carrier / packaging", row.carrier],
                ["Timing", row.timing],
                ["Tracking", row.tracking],
              ].map(([key, value]) => (
                <div key={key} className="grid grid-cols-[38%_1fr] gap-x-4">
                  <dt className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">{key}</dt>
                  <dd className="font-body text-[0.9375rem] text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      {/* the real table from md up */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Where each package ships from, and when</caption>
          <thead>
            <tr className="border-b border-hairline">
              {COLUMNS.map((c) => (
                <th key={c} scope="col" className={TH}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-hairline last:border-b-0">
                <th scope="row" className={`${TD} font-medium`}>
                  {row.package}
                </th>
                <td className={TD}>{row.shipsFrom}</td>
                <td className={TD}>{row.carrier}</td>
                <td className={TD}>{row.timing}</td>
                <td className={TD}>{row.tracking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- page ---------- */

export default function GuaranteePage() {
  const cta = ctaFor("home");

  return (
    <>
      {/* 1 — the promise and its limits */}
      <section className="pt-6 pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Our promise", href: PATH }]} />
          {/*
            The opener is the home page's rhythm in two stretched columns (owner review 2026-09-07):
            the heading and its subhead on the left, the promise itself — the one exhibit this page
            has — beside them rather than a screen below. No imagery: on this page the authority is
            the typesetting (DESIGN §5.5), so the object column is the promise itself, set larger.
          */}
          <div className="mt-6 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading as="h1" title="OUR PROMISE, IN WRITING." subhead="Because we are new, the risk of trying us is ours." />
            </div>
            <div className="mt-8 lg:col-span-6 lg:mt-0 lg:h-full">
              {/* The promise is prose, and prose never goes in a BracketFrame — the brackets are the
                  audit mark of a process artefact (DESIGN §4.6), and around a paragraph they left
                  ~90 px of empty stock inside the corners (owner review 2026-09-07). What sets the
                  promise apart now is the setting: one accent rule, a larger measure, no box. */}
              <div className="flex h-full items-center border-l-2 border-accent pl-6 lg:pl-8">
                <p className="max-w-[54ch] font-body text-[1.25rem] leading-[1.45] text-pretty text-ink md:text-[1.375rem]">
                  {block("our-promise")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* what that means, exactly */}
      <section aria-labelledby="s-limits" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-limits" title="WHAT THAT MEANS, EXACTLY." />
          {/* The heading sat 110 px above its first item, with a second full-width rule between the
              two (owner review 2026-09-07): the list opens directly under the heading and rules only
              between and below its items. */}
          <div className="mt-6 divide-y divide-hairline border-b border-hairline">
            {LIMITS.map((limit) => (
              <div key={limit.title} className="py-6">
                {/* The H3 recipe, DESIGN §3: 1.5 rem display — these four were 16 px Space Grotesk,
                    the only H3s on the site at that size, and half the size of the shipping table's
                    own H3s on this same page (layout audit). */}
                <h3 className="font-display text-h3 uppercase text-ink">{limit.title}</h3>
                <p className="mt-2 max-w-[62ch] font-body text-body text-pretty text-ink">{limit.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — shipping */}
      <section aria-labelledby="s-shipping" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-shipping" title="WHERE IT SHIPS FROM, AND WHEN." />
          <div className="mt-8 lg:mt-12">
            <ShippingTable />
            {/* The table already says both clocks (the Timing column) and that the packages are
                separate (one row each), so C12 and C10 were the table retyped as prose under it and
                are dropped here (owner review 2026-09-07); both still stand on /how-it-works, in the
                FAQ and in the terms. C11 is the one thing the table does not say — free in the US,
                US only — so it stays. */}
            <p className="mt-6 max-w-[62ch] font-body text-small text-muted-text">{CANON.shipping}</p>
          </div>
        </div>
      </section>

      {/* 3 — where a refund happens */}
      <section aria-labelledby="s-where" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-where" title="WHERE A REFUND HAPPENS." />
          <p className="mt-8 max-w-[62ch] font-body text-body font-medium text-pretty text-ink lg:mt-12">
            Etsy orders are refunded on Etsy. Orders placed here are refunded here, to the card you paid with, within 5 business
            days of the decision.
          </p>
        </div>
      </section>

      {/* 4 — the refund ladder */}
      <section aria-labelledby="s-ladder" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-ladder" title="THE REFUND LADDER." />
          <Ledger
            id="refunds"
            className="mt-8 scroll-mt-20 lg:mt-12"
            rows={LADDER.map((row) => ({ key: row.stage, value: row.happens }))}
          />
        </div>
      </section>

      {/* 5 — we are new */}
      <section aria-labelledby="s-new" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-new" title="WE ARE NEW — WHAT THAT MEANS FOR YOU." />
          <div className="mt-8 border-t border-hairline pt-6 lg:mt-12">
            <p className="max-w-[62ch] font-body text-body text-pretty text-ink">
              Game Day Edition opened in August 2026. We are one designer and three professional labs, and every athlete is
              built one at a time. That is why the guarantee is written the way it is: the risk of trying us is ours, not yours.
              {/* COPY §1.3 / GAPS #31: the delivered-count sentence renders only from five real delivered orders. */}
              {DELIVERED_COUNT >= 5 ? ` So far: ${DELIVERED_COUNT} editions delivered.` : ""}
            </p>
            <FounderNote variant="signature" />
            <p className="mt-6 font-body text-body">
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center gap-1.5 text-ink underline-offset-4 decoration-1 hover:underline"
              >
                About the studio <span aria-hidden="true">&rarr;</span>
              </Link>
            </p>
            <div className="mt-12">
              <CtaPair primary={cta.primary} secondary={cta.secondary} size="lg" />
              <TrustLine />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
