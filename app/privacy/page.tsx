import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "../site-config";

export const metadata: Metadata = { title: `Privacy Policy | ${siteConfig.brandName}` };

export default function PrivacyPage() {
  return <main className="legal-page"><header><Link className="brand" href="/"><span className="brand-mark">CM</span><span>{siteConfig.brandName}</span></Link><Link className="outline-button" href="/">Back to site</Link></header><article><span className="eyebrow">POLICY TEMPLATE · LAST UPDATED AUGUST 12, 2026</span><h1>Privacy Policy</h1><p className="legal-intro">This policy explains how {siteConfig.brandName} handles customer details and private athlete photos submitted for custom artwork requests.</p>
    <h2>Information we collect</h2><p>We collect the customer contact details, athlete personalization details, order preferences, consent records, and 3–5 photos that you provide. We deliberately do not request an athlete’s date of birth, home address, or school address.</p>
    <h2>How we use information</h2><p>We use this information only to review the request, assess photo quality, communicate about the project, create accepted artwork, deliver files, prevent abuse, and meet legal or accounting obligations. We do not sell personal information.</p>
    <h2>Private athlete photos</h2><p>Source photos are stored in a private storage bucket. They are not publicly listed and are accessed only through protected studio tools or time-limited links. Photos are not used in a portfolio, social post, advertisement, model-training dataset, or other public material without separate, explicit permission after the project.</p>
    <h2>Retention</h2><p>Declined or unpaid submissions are normally deleted within 30 days. Source photos for completed paid projects may be retained for up to 12 months for corrections, then deleted unless a longer period is agreed. Final deliverables may be retained longer to support replacement downloads.</p>
    <h2>Service providers</h2><p>We may use hosting, database, private storage, transactional email, bot-protection, analytics, payment, printing, and shipping providers to operate the service. These providers receive only the information needed for their role. Payment and delivery details are handled by the payment provider and are not stored by this initial request form.</p>
    <h2>Analytics</h2><p>Analytics events may record page and form-step activity, but they must not include athlete names, customer emails, filenames, or submitted photos.</p>
    <h2>Your choices</h2><p>You may ask to access, correct, or delete a submission by emailing <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> and including the Request ID. Some information may be retained where required by law.</p>
    <h2>Children and guardian permission</h2><p>The service is directed to adults purchasing or requesting artwork. A submitter must be the athlete, a parent or legal guardian, or have permission from the athlete’s parent or legal guardian.</p>
    <h2>International processing and security</h2><p>Information may be processed where our service providers operate. We use reasonable administrative and technical safeguards, including private storage and limited-access credentials, but no online system can guarantee absolute security.</p>
    <h2>Contact</h2><p>Questions or deletion requests can be sent to <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.</p>
    <aside>This is a practical launch template, not legal advice. It should be reviewed by a qualified lawyer before the service accepts live customer submissions.</aside>
  </article></main>;
}
