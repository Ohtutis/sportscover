// COPY §2.16.1, on the F1 legal shell (GAPS #14: SectionHeading as="h1" + a version line in
// font-label, no eyebrow). Layout: DESIGN §5.9 — read column max-w-[42rem], H2 per section,
// the subprocessor and retention tables as Ledgers, anchors with scroll-margin.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { Ledger } from "../../../components/Ledger";
import { SectionHeading } from "../../../components/SectionHeading";
import { block } from "../../../lib/blocks";
import { pageMeta } from "../../../lib/seo/meta";
import { IMPRINT, SUPPORT_EMAIL, imprintComplete } from "../../../lib/site";

export const metadata: Metadata = pageMeta("/privacy");

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

/** A "To make the edition:" style lead-in. Italic is reserved for the founder note (DESIGN §3). */
function Lead({ children }: { children: ReactNode }) {
  return <span className="font-medium">{children}</span>;
}

const SUBPROCESSORS: { provider: string; role: string; where: string }[] = [
  { provider: "Vercel", role: "Hosting, cookieless analytics", where: "US / EU edge" },
  {
    provider: "Supabase",
    role: "Order and team records (database) — from the day direct ordering opens on this site",
    where: "US",
  },
  {
    provider: "Cloudflare R2",
    role: "Private file storage — photos, artwork, deliverables — from the day direct ordering opens on this site",
    where: "US",
  },
  {
    provider: "Google Cloud Vertex AI",
    role: "AI image generation from the photos you send, under Google Cloud's data-processing terms",
    where: "US",
  },
  { provider: "Stripe", role: "Payment, tax and refunds — from the day direct ordering opens on this site", where: "US / EU" },
  { provider: "Resend", role: "Transactional email", where: "US" },
  { provider: "Etsy and Etsy Payments", role: "Marketplace, payment and messages for Etsy orders", where: "US" },
  {
    provider: "Printing partners",
    role: "Receive only the finished artwork and the shipping address for printed items",
    where: "US · Hong Kong (pack)",
  },
];

const RETENTION: { data: string; kept: string }[] = [
  { data: "Source photos", kept: "Deleted 30 days after delivery, or earlier on request" },
  { data: "Finished artwork and production files", kept: "12 months, so reprints stay possible; then deleted" },
  { data: "Likeness-check measurement", kept: "Destroyed when the order closes — at the latest 30 days after delivery" },
  { data: "Registry record (only what is printed on the card)", kept: "At least five years, so the card's page keeps resolving" },
  {
    data: "Order, payment and accounting records",
    kept: "As long as Lithuanian accounting and tax law requires (currently 10 years)",
  },
  { data: "Consent records", kept: "For the life of the registry record" },
  { data: "Deletion requests", kept: "Carried out within 30 days; you receive a Request ID and a confirmation" },
];

export default function PrivacyPage() {
  return (
    <div className="container-site py-12 md:py-16 lg:py-20">
      <div className="max-w-[42rem]">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: "Privacy Policy", href: "/privacy" },
          ]}
        />
        <SectionHeading
          as="h1"
          className="mt-8"
          title="PRIVACY POLICY."
          subhead="What we collect to make your athlete's edition, where it goes, how long we keep it, and what we never do with it. Written for the parent of a minor."
        />
        <p className="mt-6 font-label text-label font-semibold uppercase tracking-[0.12em] tabular-nums text-muted-text">
          {LEGAL_VERSION}
        </p>

        <div className="mt-12 space-y-12 lg:space-y-16">
          <Section title="The short version.">
            <p>
              We need 4–10 photos of the athlete and the details printed on the card — name, team, position, number where the sport has
              one, season, optional stats and a highlight line — plus the buyer's contact details and, for printed packages, a US shipping
              address. We never ask for a date of birth, a home address for the athlete, or a school.
            </p>
            <p>{block("photo-privacy")}</p>
          </Section>

          <Section title="What we collect and why.">
            <ul className="space-y-4">
              <li>
                <Lead>To make the edition:</Lead> the photos you send, the athlete details you type, your team colors and crest, the
                reference and artwork we create from them, and your approvals — the reference set and the proof — with their time and text version.
              </li>
              <li>
                <Lead>To run the order:</Lead> buyer name and email, order number, payment references (payments are processed by Stripe
                for orders placed here, or by Etsy for Etsy orders — card numbers never reach us), the shipping address for printed items,
                our messages with you, and shipment tracking.
              </li>
              <li>
                <Lead>To keep the registry:</Lead> only what is printed on the card, the finish, the season, the card ID and the
                registration date.
              </li>
              <li>
                <Lead>To keep the site working:</Lead> cookieless, aggregated analytics (page, country, device class) that never contain
                names, emails, photos or card IDs. No advertising pixels. No cookies for tracking.
              </li>
              <li>
                <Lead>Legal basis (GDPR):</Lead> performance of the contract with you (making and delivering the edition); your explicit
                consent for the likeness check (Article 9) and for any public page or marketing use; our legitimate interest in keeping the
                site secure and accounting records the law requires.
              </li>
            </ul>
          </Section>

          <Section title="Photos and the likeness check.">
            <p>
              Photos are stored in private storage and used only to create your order. To check that the artwork looks like your athlete, we
              create a facial-geometry measurement from your photos and compare it against the artwork. That measurement is created only
              with your explicit consent, is used for nothing else, is never shared, and is destroyed when the order closes. The full written
              policy is at{" "}
              <Link className={linkClass} href="/privacy/biometric">
                /privacy/biometric
              </Link>
              .
            </p>
          </Section>

          <Section id="subprocessors" title="Who processes the data (subprocessors).">
            <Ledger
              rows={SUBPROCESSORS.map((p) => ({
                key: p.provider,
                value: (
                  <>
                    {p.role}
                    <span className="mt-1 block font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">
                      {p.where}
                    </span>
                  </>
                ),
              }))}
            />
            <p>
              Each provider receives only what its role needs. We do not sell personal data and we do not share it with advertisers.
            </p>
          </Section>

          <Section title="How long we keep things (retention).">
            <Ledger rows={RETENTION.map((r) => ({ key: r.data, value: r.kept }))} />
          </Section>

          <Section title="The card page.">
            <p>
              Every card carries a QR code that opens its page on this site. For customers that page is <strong>unlisted by default</strong>{" "}
              — it opens only from the QR code or the exact card ID, is not indexed by search engines, and its social preview carries no
              name. It becomes public only if the parent or guardian asks for that in writing. You can unlist, make public or delete the page
              at any time by emailing{" "}
              <a className={linkClass} href={MAILTO}>
                {SUPPORT_EMAIL}
              </a>{" "}
              from the purchase address with the order number; takedowns are done within 48 hours.
            </p>
          </Section>

          <Section title="Children (COPPA and GDPR).">
            <p>
              The service is directed to adults — the parent or legal guardian ordering for their athlete, or an adult athlete ordering for
              themselves. We never knowingly collect information from a child, and we do not offer accounts to minors. Card pages and order
              pages carry no forms, sign-ups or advertising trackers, so a child who scans a card gives us nothing. If you believe a child has
              sent us information directly, email{" "}
              <a className={linkClass} href={MAILTO}>
                {SUPPORT_EMAIL}
              </a>{" "}
              and we delete it.
            </p>
          </Section>

          <Section title="Marketing use.">
            <p>{block("photo-privacy")}</p>
            <p>
              Any use of a finished piece in marketing needs its own separate permission, asked for after the order is complete, never tied
              to a discount, and revocable at any time.
            </p>
          </Section>

          <Section title="Your rights.">
            <p>
              You can ask to see, correct, export or delete what we hold about you or your athlete, object to processing, and withdraw a
              consent (withdrawal does not undo work already done with it). Email{" "}
              <a className={linkClass} href={MAILTO}>
                {SUPPORT_EMAIL}
              </a>{" "}
              with the order number; requests are answered within 30 days. You can also complain to the Lithuanian State Data Protection
              Inspectorate (vdai.lrv.lt) or your local authority. Game Day Edition is operated from Lithuania; EU data-protection law (GDPR)
              applies to how we process data. The providers above process data in the United States under their standard contractual clauses
              and, where applicable, the EU–US Data Privacy Framework.
            </p>
          </Section>

          <Section title="Security.">
            <p>
              Photos and files live in private storage behind signed, expiring links; order pages open only from a secret link sent to the
              purchase email; the likeness-check measurement exists only on studio equipment during production.
            </p>
          </Section>

          <Section title="Changes.">
            <p>We date every version and keep the previous ones; your consent receipts name the version you accepted.</p>
          </Section>

          <Section title="Independent studio.">
            <p>{block("independent-studio")}</p>
          </Section>

          <Section title="Contact.">
            <p>
              Questions and requests:{" "}
              <a className={linkClass} href={MAILTO}>
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            {imprintComplete() ? (
              <p>
                {IMPRINT.legalName} · Company code {IMPRINT.companyCode}
                {IMPRINT.vat ? `, VAT ${IMPRINT.vat}` : ""} · {IMPRINT.address} · Responsible person: {IMPRINT.responsiblePerson} ·{" "}
                {SUPPORT_EMAIL}
              </p>
            ) : (
              <p>Game Day Edition is an independent custom design studio operated from Lithuania. {SUPPORT_EMAIL}</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
