import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../../components/BrandMark";
import { block } from "../../lib/blocks";
import { BRAND, SUPPORT_EMAIL } from "../../lib/site";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <header><BrandMark /><Link className="outline-button" href="/">Back to site</Link></header>
      <article>
        <span className="eyebrow">PRIVACY POLICY · UPDATED SEPTEMBER 6, 2026</span>
        <h1>Privacy Policy</h1>
        <p className="legal-intro">What we collect to make your athlete's edition, where it goes, how long we keep it, and what we never do with it. Written for the parent of a minor.</p>

        <h2>The short version</h2>
        <p>We need 4–10 photos of the athlete and the details printed on the card (name, team, position, number where the sport has one, season, optional stats), plus the buyer's contact details. We never ask for a date of birth, a home address for the athlete, or a school address. {block("photo-privacy")}</p>

        <h2>What we collect</h2>
        <p>Buyer name and email; the athlete details you type; the photos you send; your consent records; order and payment references (payments are processed by the marketplace or payment provider, never stored here); the delivery address for printed items; and basic, cookieless site analytics that never contain names, emails or photos.</p>

        <h2>Photos and the likeness check</h2>
        <p>Photos are stored in private storage and used only to create your order. To make sure the artwork looks like your athlete, we create a facial-geometry measurement from your photos and compare it against the artwork. That measurement is used for nothing else, is never shared, and is destroyed when the order closes. The full written policy is at <Link href="/privacy/biometric">/privacy/biometric</Link>.</p>

        <h2>Who processes the data (subprocessors)</h2>
        <p>Hosting and analytics: Vercel. Database and private file storage: Supabase. AI image generation: Google Cloud Vertex AI (photos are sent to generate the artwork). Transactional email: Resend. Marketplace and payments: Etsy and its payment processor for Etsy orders. Printing partners receive only the finished artwork and the shipping address for printed items. Each provider receives only what its role needs.</p>

        <h2>How long we keep things</h2>
        <p>Source photos: deleted 30 days after delivery, or earlier on request. Finished artwork and production files: kept 12 months so reprints stay possible, then deleted. Likeness-check measurements: destroyed when the order closes. The registry record (only what is printed on the card): kept for at least five years so the card's page keeps resolving. Order and accounting records: as long as the law requires.</p>

        <h2>The public card page</h2>
        <p>Every card carries a QR code that opens its page on this site. For real customers that page is <strong>unlisted by default</strong> — it opens only from the QR code or the exact card ID and is not indexed by search engines. It becomes public only if the parent or guardian asks for that. You can unlist, make public or delete the page at any time by emailing <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the purchase address with the order number.</p>

        <h2>Children</h2>
        <p>The service is directed to adults — the parent or legal guardian ordering for their athlete, or adult athletes ordering for themselves. We never collect information from a child. Card pages and order pages carry no forms, accounts or advertising trackers.</p>

        <h2>Marketing use</h2>
        <p>{block("photo-privacy")} Any use of a finished piece in marketing needs its own separate permission, asked for after the order is complete and never tied to a discount.</p>

        <h2>Your rights</h2>
        <p>You can ask to see, correct or delete what we hold about you or your athlete, and you can withdraw a consent. Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with the order number; requests are handled within 30 days. {BRAND} is operated from Lithuania; EU data-protection law (GDPR) applies to how we process data, and data may be processed in the United States by the providers named above under their standard safeguards.</p>

        <h2>Independent studio</h2>
        <p>{block("independent-studio")}</p>

        <h2>Contact</h2>
        <p>Questions and requests: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
      </article>
    </main>
  );
}
