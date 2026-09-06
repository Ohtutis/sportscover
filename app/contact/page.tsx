import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../../components/BrandMark";
import { SUPPORT_EMAIL } from "../../lib/site";

export const metadata: Metadata = { title: "Contact", description: "How to reach Game Day Edition about an order, a card page, or a team.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <main className="legal-page">
      <header><BrandMark /><Link className="outline-button" href="/">Back to site</Link></header>
      <article>
        <span className="eyebrow">CONTACT</span>
        <h1>Talk to a person.</h1>
        <p className="legal-intro">Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Include your order number if you have one.</p>
        <h2>Etsy orders</h2><p>Questions about an order placed on Etsy are fastest through Etsy Messages — that is also where Etsy orders are refunded.</p>
        <h2>Card pages</h2><p>To unlist, make public or delete a card page, email from the address used for the purchase and include the order number and the card ID. Requests are handled within 30 days; takedowns within 48 hours.</p>
        <h2>Teams and clubs</h2><p>Email the sport, roster size and event date. One setup for the team; every family orders their own athlete, and each card is built and proofed individually.</p>
        <h2>Photos</h2><p>To have your athlete's photos deleted, email with the order number. Photos are deleted 30 days after delivery in any case; reference data used for the likeness check is destroyed when the order closes.</p>
      </article>
    </main>
  );
}
