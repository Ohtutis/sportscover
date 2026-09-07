// /faq — COPY §2.11, DESIGN §5.9. The master list, grouped, with ONE FAQPage for exactly the items
// rendered. The page is grouped, so the schema cannot ride on a single list component without either
// duplicating questions or covering only one group: it is emitted once here, from faqAll(), and every
// group list renders plain. faqAll() IS the set of items the groups render (faqGroups filters it).

import { FaqList, type FaqListItem } from "../../../components/FaqList";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CtaPair } from "../../../components/CtaPair";
import { JsonLd } from "../../../components/JsonLd";
import { PlusIcon } from "../../../components/icons";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { faqAll, faqGroups } from "../../../lib/catalog/faq";
import { ctaFor } from "../../../lib/cta";
import { faqPage } from "../../../lib/seo/jsonld";
import { pageMeta } from "../../../lib/seo/meta";

export const revalidate = 3600;
export const metadata = pageMeta("/faq");

/**
 * One FAQ row, open on load — the same markup `FaqList` renders for a row, with `open` set. It is
 * still a `<details>`, so the reader can shut it, and the schema is unaffected (this page emits one
 * FAQPage over `faqAll()`, above).
 */
function OpenAnswer({ item, alone }: { item: FaqListItem; alone?: boolean }) {
  return (
    <details open id={item.id} className={`group border-t border-hairline py-5 ${alone ? "border-b" : ""}`.trim()}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 [&::-webkit-details-marker]:hidden">
        <h3 className="font-body text-[1.125rem] font-bold normal-case tracking-normal text-ink">{item.q}</h3>
        <PlusIcon size={24} className="mt-0.5 shrink-0 text-ink transition-transform duration-hover ease-out group-open:rotate-45" />
      </summary>
      <p className="mt-3 max-w-[62ch] font-body text-body text-pretty text-ink">{item.a}</p>
    </details>
  );
}

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

          <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:gap-x-8">
            <nav aria-label="FAQ groups" className="hidden lg:sticky lg:top-20 lg:col-span-3 lg:block lg:self-start">
              <ul className="space-y-1">
                {groups.map((group) => (
                  <li key={group.group}>
                    <a
                      href={`#faq-${group.group}`}
                      className="block py-1.5 font-body text-small text-muted-text underline-offset-4 decoration-1 hover:text-ink hover:underline"
                    >
                      {group.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-9">
              {groups.map((group) => {
                const [first, ...rest] = group.items;
                return (
                  <section key={group.group} aria-labelledby={`faq-${group.group}`} className="mt-12 first:mt-0 scroll-mt-20">
                    <h2 id={`faq-${group.group}`} className="font-display text-h3 uppercase text-ink">
                      {group.title}
                    </h2>
                    {/* The first answer in each group is open: a page of 34 shut rows answers nothing
                        above the fold and gives the reader no sample of the voice. The rest stay shut.
                        FaqList has no "open the first" prop yet — see INTEGRATION-NOTES. */}
                    <div className="mt-4">
                      {first ? <OpenAnswer item={first} alone={rest.length === 0} /> : null}
                      {rest.length ? <FaqList items={rest} /> : null}
                    </div>
                  </section>
                );
              })}

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
