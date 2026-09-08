// /faq — COPY §2.11, DESIGN §5.9. The master list, grouped, with ONE FAQPage for exactly the items
// rendered. The page is grouped, so the schema cannot ride on a single list component without either
// duplicating questions or covering only one group: it is emitted once here, from faqAll(), and every
// group list renders plain. faqAll() IS the set of items the groups render (faqGroups filters it).

import { FaqList } from "../../../components/FaqList";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CtaPair } from "../../../components/CtaPair";
import { JsonLd } from "../../../components/JsonLd";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { faqAll, faqGroups } from "../../../lib/catalog/faq";
import { FaqRail } from "./rail";
import { ctaFor } from "../../../lib/cta";
import { faqPage } from "../../../lib/seo/jsonld";
import { pageMeta } from "../../../lib/seo/meta";

export const revalidate = 3600;
export const metadata = pageMeta("/faq");

/**
 * The group titles are set as H2s, and every H1/H2 on the site ends with a full stop (checklist
 * §11-2) — these ten were the only ones that did not (smooth audit S16). The stop is added here, in
 * the typesetting: `lib/catalog/faq.ts` holds the group NAME, which is also the rail's label and the
 * jump list's, where a sentence stop would be wrong.
 */
const titleWithStop = (title: string): string => (/[.?!]$/.test(title) ? title : `${title}.`);

export default function FaqPage() {
  const groups = faqGroups();
  const cta = ctaFor("home");

  return (
    <>
      {/* The one FAQPage on this page, for exactly the items the groups below render. */}
      <JsonLd data={faqPage(faqAll())} />

      <section className="pt-6 pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "FAQ", href: "/faq" }]} />
          <SectionHeading
            as="h1"
            className="mt-6"
            title="QUESTIONS, ANSWERED."
            subhead="Everything we are asked, in one place — products, photos, timing, privacy, refunds."
          />

          {/* Below lg the sticky rail is hidden, so a page of 34 accordions had no index at all
              (smooth audit S16). This is the same ten anchors as one wrapped row of 44 px chips —
              plain links, so it needs no JavaScript and lands on the same headings. */}
          <nav aria-label="Jump to a group" className="mt-8 lg:hidden">
            <ul className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <li key={group.group}>
                  <a
                    href={`#faq-${group.group}`}
                    className="inline-flex min-h-11 items-center rounded-ui border border-hairline px-3 font-body text-small text-ink transition-colors duration-hover ease-out hover:bg-ink/5"
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:gap-x-8">
            <nav aria-label="FAQ groups" className="hidden lg:sticky lg:top-20 lg:col-span-3 lg:block lg:self-start">
              <FaqRail groups={groups.map((group) => ({ id: `faq-${group.group}`, title: group.title }))} />
            </nav>

            <div className="lg:col-span-9">
              {groups.map((group) => (
                <section key={group.group} aria-labelledby={`faq-${group.group}`} className="mt-12 first:mt-0 scroll-mt-20">
                  <h2 id={`faq-${group.group}`} className="font-display text-h3 uppercase text-ink">
                    {titleWithStop(group.title)}
                  </h2>
                  {/* The first answer in each group is open: a page of 34 shut rows answers nothing
                      above the fold and gives the reader no sample of the voice. The rest stay shut. */}
                  <div className="mt-4">
                    <FaqList items={group.items} openFirst />
                  </div>
                </section>
              ))}

              <div className="mt-16">
                <CtaPair primary={cta.primary} secondary={cta.secondary} size="lg" />
                <TrustLine />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
