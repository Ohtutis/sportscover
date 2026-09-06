import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../../../components/BrandMark";
import { BRAND, SUPPORT_EMAIL } from "../../../lib/site";

export const metadata: Metadata = { title: "Likeness check — biometric data policy", alternates: { canonical: "/privacy/biometric" } };

export default function BiometricPage() {
  return (
    <main className="legal-page">
      <header><BrandMark /><Link className="outline-button" href="/privacy">Privacy Policy</Link></header>
      <article>
        <span className="eyebrow">BIOMETRIC DATA POLICY · UPDATED SEPTEMBER 6, 2026</span>
        <h1>The likeness check.</h1>
        <p className="legal-intro">To make sure the artwork looks like your athlete, {BRAND} measures facial geometry from the photos you send and compares it against every shot before the proof. This page is our written policy for that data.</p>

        <h2>What is created</h2>
        <p>A numeric facial-geometry measurement (a "face embedding") derived from the photos you provide, and the same measurement derived from the generated artwork. The two are compared to confirm the artwork depicts the same person.</p>

        <h2>Why</h2>
        <p>Only to check likeness for your order. It is the difference between claiming the artwork looks like your athlete and measuring it.</p>

        <h2>Consent</h2>
        <p>We create this measurement only with the written consent of the athlete, or of the parent or legal guardian of a minor athlete, given when the order is placed. Without that consent we do not run the check and cannot complete the order.</p>

        <h2>What we never do</h2>
        <p>We never sell, lease, trade, share or otherwise profit from this data; never use it to identify anyone outside your order; never use it to train AI models; and never disclose it to anyone except as required by law.</p>

        <h2>Retention and destruction</h2>
        <p>The measurements are destroyed when the order closes — at the latest 30 days after delivery — or within 30 days of your written request, whichever comes first. Destruction is recorded in our order log (the fact and the date only, never the measurement).</p>

        <h2>Access and security</h2>
        <p>The measurements exist only on studio equipment during production and are never uploaded to a public service. Access is limited to the person producing the order.</p>

        <h2>Questions and requests</h2>
        <p>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your order number. This policy is published to satisfy state biometric-privacy laws (including Illinois BIPA, Texas CUBI and Washington's biometric identifier law) and Article 9 of the GDPR.</p>
      </article>
    </main>
  );
}
