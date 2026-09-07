// COPY §2.16.3, on the F1 legal shell (GAPS #14). Anchors: id="refunds" (§6), id="registry" (§9).
// Delivery clocks are CANON C10 — counted from the ORDER date in US Eastern business days, printing
// starts at proof approval, a proof left waiting moves the ship date by the same amount (D5).
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { SectionHeading } from "../../../components/SectionHeading";
import { block } from "../../../lib/blocks";
import { CANON } from "../../../lib/copy/canon";
import { pageMeta } from "../../../lib/seo/meta";
import { IMPRINT, SUPPORT_EMAIL, imprintComplete } from "../../../lib/site";

export const metadata: Metadata = pageMeta("/terms");

/** The one version string for every legal page in this release (content/legal/CHANGELOG.md). */
const LEGAL_VERSION = "Version 2026-09-F1 · effective September 7, 2026 · previous versions on request.";

const MAILTO = `mailto:${SUPPORT_EMAIL}`;
const linkClass = "underline underline-offset-4 decoration-1";

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={id ? "scroll-mt-20" : undefined}>
      <SectionHeading as="h2" title={title} />
      <div className="mt-6 max-w-[62ch] space-y-4 font-body text-body text-pretty">{children}</div>
    </section>
  );
}

const REFUND_LADDER: string[] = [
  "Until you approve the reference plate you may cancel for any reason with a full refund.",
  "If the photo check is not passed and you have no stronger photos, the order is refunded in full within 1 business day.",
  "If after one revision you are still not happy with the proof, we refund every cent.",
  "After proof approval printing starts and the order cannot be cancelled. If anything about a printed item is wrong when it arrives, we reprint it free or refund you in full and you keep the cards. That remedy covers defects — damage, mis-cutting, wrong color — not a change of mind, and we may decline repeated claims on one order or ask for a photo of the defect.",
  "Digital files are not refundable after delivery except under the promise above.",
  "Colors on screen and in print differ slightly; that is not a defect.",
  "Refunds for orders placed here go to the original payment method within 5 business days of the decision. Refunds for Etsy orders are processed on Etsy.",
  "Because every edition is personalized, the EU right of withdrawal for goods made to the consumer's specifications does not apply once production has started; for digital content you agree at checkout that delivery may begin immediately and that you waive the withdrawal right once the files are delivered.",
];

export default function TermsPage() {
  return (
    <div className="container-site py-12 md:py-16 lg:py-20">
      <div className="max-w-[42rem]">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: "Terms of Service", href: "/terms" },
          ]}
        />
        <SectionHeading
          as="h1"
          className="mt-8"
          title="TERMS OF SERVICE."
          subhead="These terms cover custom editions made by Game Day Edition — ordered on this site or on our Etsy shop. For Etsy orders, Etsy's purchase terms and Etsy's refund process also apply; the terms below describe the work itself."
        />
        <p className="mt-6 font-label text-label font-semibold uppercase tracking-[0.12em] tabular-nums text-muted-text">
          {LEGAL_VERSION}
        </p>

        <div className="mt-12 space-y-12 lg:space-y-16">
          <Section title="1. Who we are.">
            {imprintComplete() ? (
              <p>
                {IMPRINT.legalName} · Company code {IMPRINT.companyCode}
                {IMPRINT.vat ? `, VAT ${IMPRINT.vat}` : ""} · {IMPRINT.address} · Responsible person: {IMPRINT.responsiblePerson} ·{" "}
                <a className={linkClass} href={MAILTO}>
                  {SUPPORT_EMAIL}
                </a>
              </p>
            ) : (
              <p>
                Game Day Edition is an independent custom design studio operated from Lithuania. Contact:{" "}
                <a className={linkClass} href={MAILTO}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            )}
            <p>{block("independent-studio")}</p>
          </Section>

          <Section title="2. What you are buying.">
            <p>
              A personalized edition — artwork composed from the photos and details you supply, delivered as digital files and, for printed
              packages, as printed items made to order for you. Prices are shown in US dollars and include everything except sales tax, which
              is calculated at checkout. A struck-through price is our own regular price, shown only while a dated sale runs.
            </p>
          </Section>

          <Section title="3. Your photos and your athlete's likeness (licence).">
            <p>
              You confirm that you are the athlete, or the parent or legal guardian of the athlete; that you own the photos or have the right
              to share them; and that you grant us a licence to create artwork from the photos and the athlete's likeness for this order —
              including the right of publicity in a minor's likeness, which as guardian you grant on their behalf. This licence covers the
              order only. Any use of the finished work in our marketing needs a separate, written, revocable permission. You confirm that any
              team crest you supply is your school's or club's own and that you may use it.
            </p>
            <p>{block("logo-sentence")}</p>
          </Section>

          <Section title="4. How it is made.">
            <p>{block("how-its-made")}</p>
            <p>
              Photos are checked before any art is made; if they cannot carry the likeness we tell you and refund every cent. We create a
              facial-geometry measurement from your photos to check likeness, with your explicit consent, under the biometric policy at{" "}
              <Link className={linkClass} href="/privacy/biometric">
                /privacy/biometric
              </Link>
              . Recognizable likeness is a priority, but results depend on the quality, angle and lighting of the photos you send.
            </p>
            <p>{CANON.aiActLine}</p>
          </Section>

          <Section title="5. Approvals.">
            <p>
              Two approvals are yours: the reference plate (by email) and the proof (on your order page, or by Etsy message for Etsy orders).{" "}
              {CANON.proofChecklist} One revision is included. Printing starts only after your proof approval.
            </p>
          </Section>

          <Section id="refunds" title="6. Cancellation and refunds.">
            <ul className="space-y-4">
              {REFUND_LADDER.map((line) => (
                <li key={line.slice(0, 40)}>{line}</li>
              ))}
            </ul>
          </Section>

          <Section title="7. Delivery and committed dates.">
            <p>{CANON.deliveryClocks}</p>
            <p>
              Printed items ship within the US only; digital and physical orders are US only for now. The dates shown at checkout are counted
              in US Eastern business days from the order date and are recorded on the order. If we cannot meet a recorded date we tell you in
              writing with a new date; if the new date misses the occasion date you gave us, you may cancel for a full refund. Printed items
              may arrive in separate packages. Where a printing partner is used, it receives only the finished artwork and the shipping
              address.
            </p>
          </Section>

          <Section title="8. Reminders and pauses.">
            <p>
              When an order needs something from you (photos, an approval), we send up to three reminders over 14 days, then pause the order.
              A paused order can be resumed within 12 months; after that it is closed and any unfinished balance is refunded under section 6.
            </p>
          </Section>

          <Section id="registry" title="9. The registered card page.">
            <p>
              Every card carries a registered card ID and a QR code that opens its page on this site. Customer pages are unlisted unless you
              ask otherwise in writing.
            </p>
            <p>
              <strong>
                We keep every registered page online for at least five years from the order date. If the service ever winds down, we will keep
                the registry resolving for the rest of that period or tell you how to keep a copy of your page; the domain is locked and set to
                renew automatically.
              </strong>
            </p>
            <p>
              "Registered" describes our own edition registry — one edition per athlete, per finish, per season; it is not a copyright
              registration, and physical cards are not individually numbered.
            </p>
          </Section>

          <Section title="10. Use of the artwork.">
            <p>
              Finished deliverables are licensed to you for personal, non-commercial use — print them, share them, frame them, give them away.
              Reselling the artwork or the printed items, or using them to sell goods or services, needs our written agreement. Studio source
              files, references and methods remain ours. Artwork created with AI tools may not be eligible for copyright protection in some
              countries; nothing in these terms claims otherwise.
            </p>
          </Section>

          <Section title="11. Your responsibilities.">
            <p>
              Give accurate details for the card — we print what you approve. Send photos you have the right to share. Do not upload photos of
              anyone other than the athlete you are ordering for as the subject.
            </p>
          </Section>

          <Section title="12. Liability and law.">
            <p>
              To the extent the law allows, our liability is limited to the amount you paid for the order. Nothing in these terms limits rights
              that cannot legally be excluded, including consumer rights under the law of your country of residence. These terms are governed
              by the laws of the Republic of Lithuania; disputes go to the courts of Lithuania, without prejudice to a consumer's right to
              bring a claim where they live. EU consumers may also use the European Commission's online dispute resolution platform.
            </p>
          </Section>

          <Section title="13. Changes.">
            <p>We date every version and keep the previous ones; the version in force when you ordered applies to that order.</p>
          </Section>

          <Section title="14. Independent studio.">
            <p>{block("independent-studio")}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
