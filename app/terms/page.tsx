import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "../site-config";

export const metadata: Metadata = { title: `Terms | ${siteConfig.brandName}` };

export default function TermsPage() {
  return <main className="legal-page"><header><Link className="brand" href="/"><span className="brand-mark">CM</span><span>{siteConfig.brandName}</span></Link><Link className="outline-button" href="/">Back to site</Link></header><article><span className="eyebrow">TERMS TEMPLATE · LAST UPDATED AUGUST 12, 2026</span><h1>Terms of Service</h1><p className="legal-intro">These terms apply to custom artwork requests submitted to {siteConfig.brandName}. Submitting a request does not require payment and does not guarantee acceptance.</p>
    <h2>Photo and guardian rights</h2><p>You confirm that you own submitted photos or have permission to use them, and that you are the athlete, the athlete’s parent or legal guardian, or have permission from the athlete’s parent or legal guardian. You remain responsible for securing permission to use any team asset you provide.</p>
    <h2>Review and acceptance</h2><p>We review source photos before accepting a project. We may request better photos or decline work when we cannot confidently meet the displayed quality. No payment is due for a declined request.</p>
    <h2>Pricing, payment, and shipping details</h2><p>Displayed prices are starting prices. The final package, scope, price, and estimated delivery timing are confirmed by email before a secure payment link is sent. For physical packages, the payment provider also collects the required shipping address. Artwork production begins after payment clears, but physical printing does not begin until the customer approves the final artwork.</p>
    <h2>Creative process and likeness</h2><p>Artwork is custom-finished from real photos through a designer-led, AI-assisted workflow. Recognizable likeness is a priority, but results depend on the quality, angle, lighting, and resolution of source photos. We do not promise recruiting, scholarship, sporting, or commercial outcomes.</p>
    <h2>Revisions</h2><p>Individual packages include one reasonable revision to text, color, crop, or composition. A new concept, replacement source-photo set, or major direction change may require an additional fee. Video packages include one minor text correction unless otherwise agreed.</p>
    <h2>Timing and physical delivery</h2><p>Photo review usually takes up to 24 hours and a first proof is typically delivered within two business days after payment. These are estimates, not guarantees. Team, complex, and rush projects may require different timing. Print-carrier delivery dates are estimates, and priority production does not guarantee a carrier delivery date. Posters and trading cards may be produced separately and arrive in different packages.</p>
    <h2>Cancellations and refunds</h2><p>Because the work is personalized, cancellation and refund eligibility depends on how much production has been completed. Any project-specific policy will be confirmed before payment. Nothing in these terms limits rights that cannot legally be excluded.</p>
    <h2>Intellectual property</h2><p>Final paid deliverables include a personal-use license for the customer. Studio source files, production methods, and unused concepts remain with {siteConfig.brandName}. Commercial, organizational, resale, or team-wide usage may require separate written terms. We do not grant rights to third-party logos or protected marks.</p>
    <h2>Portfolio use</h2><p>Order consent is not portfolio consent. Athlete photos or final artwork will not be published without a separate permission request and approval.</p>
    <h2>Liability and contact</h2><p>To the extent permitted by law, liability is limited to the amount paid for the relevant project. Questions may be sent to <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.</p>
    <aside>This is a practical launch template, not legal advice. It should be reviewed by a qualified lawyer before the service accepts live customer submissions.</aside>
  </article></main>;
}
