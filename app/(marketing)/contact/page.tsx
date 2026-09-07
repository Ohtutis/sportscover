// /contact — COPY §2.12, DESIGN §5.9 (centred read column, mailto only, no form). The response-window
// sentence is omitted: the owner has not committed to one (CONTRACTS §5.5 note). The "Lost your order
// link?" row carries its F1 wording; the F2 order-recovery route does not exist, so nothing links to it.

import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CtaPair } from "../../../components/CtaPair";
import { Ledger } from "../../../components/Ledger";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { pageMeta } from "../../../lib/seo/meta";
import { IMPRINT, imprintComplete, SUPPORT_EMAIL } from "../../../lib/site";

export const revalidate = 3600;
export const metadata = pageMeta("/contact");

const MAILTO = `mailto:${SUPPORT_EMAIL}`;

const TOPICS: { key: string; value: string }[] = [
  {
    key: "Etsy orders",
    value: "Questions about an order placed on Etsy are fastest through Etsy Messages — that is also where Etsy orders are refunded.",
  },
  { key: "Lost your order link?", value: "Email us from the purchase address with your order number." },
  {
    key: "Card pages",
    value: "To unlist, make public or delete a card page, email from the address used for the purchase and include the order number and the card ID. Takedowns within 48 hours; other requests within 30 days.",
  },
  { key: "Report a card page", value: "Seen a page that shouldn't be public? Email the card ID; we act within 48 hours." },
  {
    key: "Teams and clubs",
    value: "Email the sport, roster size and event date. One setup for the team; every family orders their own athlete, and each card is built and proofed individually.",
  },
  {
    key: "Photos",
    value: "To have your athlete's photos deleted, email with the order number; you receive a Request ID and confirmation within 30 days. Photos are deleted 30 days after delivery in any case; the likeness-check measurement is destroyed when the order closes.",
  },
  { key: "Press and partnerships", value: "Same address. We don't do affiliate programs or paid placements." },
];

const IMPRINT_FALLBACK = `Game Day Edition is an independent custom design studio operated from Lithuania. ${SUPPORT_EMAIL}`;

function imprintLine(): string {
  const vat = IMPRINT.vat ? `, VAT ${IMPRINT.vat}` : "";
  return `${IMPRINT.legalName} · Company code ${IMPRINT.companyCode}${vat} · ${IMPRINT.address} · Responsible person: ${IMPRINT.responsiblePerson} · ${SUPPORT_EMAIL}`;
}

export default function ContactPage() {
  return (
    <section className="pt-6 pb-16 md:pb-24 lg:pb-32">
      <div className="container-site">
        <div className="mx-auto max-w-[44rem]">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Contact", href: "/contact" }]} />
          <SectionHeading as="h1" className="mt-6" title="TALK TO A PERSON." />
          <p className="mt-4 max-w-[44ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub">
            Email{" "}
            <a href={MAILTO} className="underline underline-offset-4 decoration-1">
              {SUPPORT_EMAIL}
            </a>
            . Include your order number if you have one.
          </p>

          <div className="mt-8 lg:mt-12">
            <CtaPair primary={{ label: `Email ${SUPPORT_EMAIL}`, href: MAILTO }} size="lg" />
            <TrustLine />
          </div>

          <Ledger className="mt-12" rows={TOPICS.map((t) => ({ key: t.key, value: t.value }))} />

          <p className="mt-8 max-w-[62ch] font-body text-small text-muted-text">
            {imprintComplete() ? imprintLine() : IMPRINT_FALLBACK}
          </p>
        </div>
      </div>
    </section>
  );
}
