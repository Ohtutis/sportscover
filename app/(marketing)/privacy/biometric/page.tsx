// COPY §2.16.2, on the F1 legal shell (GAPS #14). Published to satisfy the Illinois, Texas and
// Washington biometric-privacy laws and GDPR Article 9; layout per DESIGN §5.9.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Breadcrumbs } from "../../../../components/Breadcrumbs";
import { SectionHeading } from "../../../../components/SectionHeading";
import { pageMeta } from "../../../../lib/seo/meta";
import { SUPPORT_EMAIL } from "../../../../lib/site";

export const metadata: Metadata = pageMeta("/privacy/biometric");

/** The one version string for every legal page in this release (content/legal/CHANGELOG.md). */
const LEGAL_VERSION = "Version 2026-09-F1 · effective September 7, 2026 · previous versions on request.";

const MAILTO = `mailto:${SUPPORT_EMAIL}`;
const linkClass = "underline underline-offset-4 decoration-1";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <SectionHeading as="h2" title={title} />
      <div className="mt-6 max-w-[62ch] space-y-4 font-body text-body text-pretty">{children}</div>
    </section>
  );
}

export default function BiometricPage() {
  return (
    <div className="container-site py-12 md:py-16 lg:py-20">
      <div className="max-w-[42rem]">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: "Privacy Policy", href: "/privacy" },
            { name: "The likeness check", href: "/privacy/biometric" },
          ]}
        />
        <SectionHeading
          as="h1"
          className="mt-8"
          title="THE LIKENESS CHECK."
          subhead="To make sure the artwork looks like your athlete, Game Day Edition measures facial geometry from the photos you send and compares it against every shot before the proof. This page is our written policy for that data, published to satisfy state biometric-privacy laws (including the Illinois Biometric Information Privacy Act, the Texas Capture or Use of Biometric Identifier Act and Washington's biometric identifier law) and Article 9 of the GDPR."
        />
        <p className="mt-6 font-label text-label font-semibold uppercase tracking-[0.12em] tabular-nums text-muted-text">
          {LEGAL_VERSION}
        </p>

        <div className="mt-12 space-y-12 lg:space-y-16">
          <Section title="What is created.">
            <p>
              A numeric facial-geometry measurement (a "face embedding") derived from the photos you provide, and the same measurement
              derived from the generated artwork. The two are compared to confirm the artwork depicts the same person. No photograph is
              altered by this step.
            </p>
          </Section>

          <Section title="When.">
            <p>After the photo check and before any art is made — never at the moment you upload, never before you have consented.</p>
          </Section>

          <Section title="Why, and only why.">
            <p>
              To check likeness for your order. It is the difference between claiming the artwork looks like your athlete and measuring it.
              It is never used to identify anyone, to search for anyone, or to compare against anyone outside your order.
            </p>
          </Section>

          <Section title="Consent.">
            <p>
              We create this measurement only with the written consent of the athlete, or of the parent or legal guardian of a minor athlete,
              given when the order is placed (the checkbox at checkout, or the consent line in the Etsy personalization instructions).
              Without that consent we do not run the check and cannot complete the order. You can withdraw consent by email; we then destroy
              the measurement within 30 days, and any unfinished order is refunded under the refund ladder.
            </p>
          </Section>

          <Section title="What we never do.">
            <p>
              We never sell, lease, trade, share or otherwise profit from this data; never use it to identify anyone outside your order;
              never use it to train AI models; never upload it to a public service; and never disclose it to anyone except as required by law.
            </p>
          </Section>

          <Section title="Retention and destruction.">
            <p>
              The measurement is destroyed when the order closes — at the latest 30 days after delivery — or within 30 days of your written
              request, whichever comes first. Destruction is recorded in our order log as a fact and a date only; the measurement itself is
              never logged, and no score from the comparison is stored or shown to anyone.
            </p>
          </Section>

          <Section title="Access and security.">
            <p>
              The measurement exists only on studio equipment in Lithuania during production and is never uploaded to a cloud service. Access
              is limited to the person producing the order. It is protected with the same care as the photos it comes from.
            </p>
          </Section>

          <Section title="Questions and requests.">
            <p>
              Email{" "}
              <a className={linkClass} href={MAILTO}>
                {SUPPORT_EMAIL}
              </a>{" "}
              with your order number. Illinois, Texas and Washington residents may request a copy of this policy and the date of destruction
              for their order.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
