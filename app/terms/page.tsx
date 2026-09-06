import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../../components/BrandMark";
import { block } from "../../lib/blocks";
import { BRAND, IMPRINT, SUPPORT_EMAIL, imprintComplete } from "../../lib/site";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header><BrandMark /><Link className="outline-button" href="/">Back to site</Link></header>
      <article>
        <span className="eyebrow">TERMS · UPDATED SEPTEMBER 6, 2026</span>
        <h1>Terms of Service</h1>
        <p className="legal-intro">These terms cover custom editions made by {BRAND}. Orders are placed on our Etsy shop, where Etsy's purchase terms also apply; the terms below describe the work itself.</p>

        <h2>Who we are</h2>
        {imprintComplete() ? (
          <p>{IMPRINT.legalName}, company code {IMPRINT.companyCode}{IMPRINT.vat ? `, VAT ${IMPRINT.vat}` : ""}, {IMPRINT.address}. Responsible person: {IMPRINT.responsiblePerson}. {SUPPORT_EMAIL}.</p>
        ) : (
          <p>{BRAND} is an independent custom design studio operated from Lithuania. Contact: {SUPPORT_EMAIL}.</p>
        )}

        <h2>Your photos and your athlete's likeness</h2>
        <p>You confirm that you are the athlete, or the parent or legal guardian of the athlete, that you own the photos or have permission to use them, and that you grant us permission to create artwork from the photos and the athlete's likeness for your order. You confirm that any team crest you supply is your school's or club's own and that you may use it. {block("logo-sentence")}</p>

        <h2>How it is made</h2>
        <p>{block("how-its-made")} Photos are checked before any art is made; if they cannot carry the likeness we tell you and refund every cent. Recognizable likeness is a priority, but results depend on the quality, angle and lighting of the photos you send.</p>

        <h2>Proof approval</h2>
        <p>You receive a proof before anything is finalized. Approving the proof means you have checked the name, number, spelling and colors. One revision is included. Printing starts only after your approval; once printing has started, the order cannot be cancelled.</p>

        <h2>Our promise, refunds and cancellations</h2>
        <p>{block("our-promise")} Until you approve the proof you may cancel for a full refund. Digital files are not refundable after delivery except under that promise. Refunds for Etsy orders are processed on Etsy. Colors on screen and in print differ slightly; that is not a defect.</p>

        <h2>Delivery</h2>
        <p>Digital files are delivered within 1–2 business days of the order; printed items ship within 5–7 business days of the order and may arrive in separate packages. Both are counted in US Eastern business days from the order date. Printing starts when you approve the proof, so time a proof spends waiting for approval extends the shipping date by the same amount. Printed items ship within the US only. Where a printing partner is used, it receives only the finished artwork and the shipping address.</p>

        <h2>The registered card page</h2>
        <p>Every card carries a registered card ID and a QR code that opens its page on this site. Customer pages are unlisted unless you ask otherwise. We keep registered pages online for at least five years from the order date; if the service ever winds down, the registry will be kept resolving for that period or you will be told how to keep a copy. "Registered" describes our own edition registry; it is not a copyright registration.</p>

        <h2>Use of the artwork</h2>
        <p>Finished deliverables are licensed to you for personal, non-commercial use — print them, share them, frame them. Reselling the artwork, or using it to sell goods or services, needs our written agreement. Studio source files and methods remain ours.</p>

        <h2>Reminders and pauses</h2>
        <p>When an order needs something from you (photos, an approval), we send up to three reminders over 14 days, then pause the order. A paused order can be resumed within 12 months.</p>

        <h2>Liability and law</h2>
        <p>To the extent the law allows, our liability is limited to the amount you paid for the order. Nothing in these terms limits rights that cannot legally be excluded. Because every edition is personalized, the EU right of withdrawal for personalized goods does not apply once production has started. These terms are governed by the laws of the Republic of Lithuania.</p>

        <h2>Independent studio</h2>
        <p>{block("independent-studio")}</p>
      </article>
    </main>
  );
}
