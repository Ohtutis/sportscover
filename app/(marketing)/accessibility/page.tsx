// COPY §2.14 — the WCAG 2.2 AA statement, on the F1 legal shell (GAPS #14). Layout: DESIGN §5.9.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { SectionHeading } from "../../../components/SectionHeading";
import { pageMeta } from "../../../lib/seo/meta";
import { SUPPORT_EMAIL } from "../../../lib/site";

export const metadata: Metadata = pageMeta("/accessibility");

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

export default function AccessibilityPage() {
  return (
    <div className="container-site py-12 md:py-16 lg:py-20">
      <div className="max-w-[42rem]">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: "Accessibility", href: "/accessibility" },
          ]}
        />
        <SectionHeading
          as="h1"
          className="mt-8"
          title="ACCESSIBILITY."
          subhead="We want every parent, grandparent and athlete to be able to use this site — including with a screen reader, a keyboard, or reduced motion."
        />
        <p className="mt-6 font-label text-label font-semibold uppercase tracking-[0.12em] tabular-nums text-muted-text">
          {LEGAL_VERSION}
        </p>

        <div className="mt-12 space-y-12 lg:space-y-16">
          <Section title="Our standard.">
            <p>We build gamedayedition.com to the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>
          </Section>

          <Section title="What that means here.">
            <p>
              Every image has a real text description; text keeps at least a 4.5:1 contrast on light pages and 4.85:1 on the dark card pages;
              every control works with a keyboard and shows a visible focus ring; the card flip has a keyboard and screen-reader button and
              becomes a plain front/back switch when your device asks for reduced motion; muted videos carry their text in the page; tap
              targets are at least 24 px; nothing flashes.
            </p>
          </Section>

          <Section title="Known limits.">
            <p>
              Card artwork is an image of a printed card; its text (name, stats, ID) is repeated in the edition panel on the same page.
              Third-party pages we link to — Etsy, the payment provider — follow their own standards.
            </p>
          </Section>

          <Section title="Tell us.">
            <p>
              If something on this site is hard to use, email{" "}
              <a className={linkClass} href={MAILTO}>
                {SUPPORT_EMAIL}
              </a>{" "}
              with the page address and what happened. We answer within 5 business days and fix what we can in the next release.
            </p>
          </Section>

          <Section title="Status.">
            <p>Statement first published September 7, 2026; reviewed with each release.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
