import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../../components/BrandMark";
import { LookupForm } from "./lookup-form";

export const metadata: Metadata = {
  title: "Look up a card",
  description: "Type the registered card ID from the back of any Game Day Edition card or certificate to open its page.",
  alternates: { canonical: "/registry" },
};

export default function RegistryPage() {
  return (
    <main className="legal-page">
      <header><BrandMark /><Link className="outline-button" href="/">Back to site</Link></header>
      <article>
        <span className="eyebrow">REGISTRY</span>
        <h1>Look up a card.</h1>
        <p className="legal-intro">Every card carries its registered card ID on the back and on the certificate. Type it here to open the card's page.</p>
        <LookupForm />
        <h2>What a registered edition is</h2>
        <p>One registered edition per athlete, per finish, per season. The ID reads GDE-<em>style</em>-<em>sport</em>-<em>season</em>-<em>number</em> — for sports that don't wear numbers the last part is an edition counter, not a shirt number. Physical cards are not individually numbered; the sealed pack is 18 cards — 4 holographic chase, 14 standard.</p>
        <p>The registry stores only what is printed on the card — name, team, position, season, stats and the finish. Never photos, addresses or birthdays. Customer pages are unlisted by default: they open from the QR code or the exact ID and are not indexed by search engines. Registered pages stay up for at least five years.</p>
        <p>Try a demo: <Link href="/c/GDE-SN-BKB-2026-12">GDE-SN-BKB-2026-12</Link> (fictional athlete).</p>
      </article>
    </main>
  );
}
