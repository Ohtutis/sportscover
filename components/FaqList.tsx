import { faqPage } from "../lib/seo/jsonld";
import { PlusIcon } from "./icons";
import { JsonLd } from "./JsonLd";

/**
 * A details/summary FAQ list (DESIGN §5.2-7). `jsonLd` emits FAQPage for EXACTLY the items rendered
 * here — at most one jsonLd FaqList per page, never duplicate markup: product pages render their
 * subset with schema, /faq renders the master list with schema, everything else renders without.
 *
 * The `<summary>` is the whole tap target and it is 44 px tall (`min-h-11`, layout audit blocker 9 —
 * it measured 26 px on every touch viewport, across 40 rows on /faq and 6 on each product page). The
 * row keeps its rhythm because the padding moved from the `<details>` (py-5) onto the taller summary.
 *
 * `openFirst` opens the first row of the list — /faq used to hand-copy this markup into its own
 * `OpenAnswer` so the two accordions on the site could drift apart (smooth audit N8). One component,
 * one open-state rule: the plus rotates to a cross, the row keeps its border.
 */
export interface FaqListItem {
  id: string;
  q: string;
  a: string;
}

export interface FaqListProps {
  items: FaqListItem[];
  jsonLd?: boolean;
  id?: string;
  headingLevel?: 2 | 3;
  /** Opens the first item — the page still ships one `<details>` the reader can shut. */
  openFirst?: boolean;
  className?: string;
}

export function FaqList({ items, jsonLd, id, headingLevel = 3, openFirst, className = "" }: FaqListProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div id={id} className={className || undefined}>
      {items.map((item, i) => (
        <details
          key={item.id}
          id={item.id}
          open={openFirst && i === 0}
          className="group border-t border-hairline py-3 last:border-b last:border-hairline"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
            <Heading className="font-body text-[1.125rem] font-bold normal-case tracking-normal text-ink">{item.q}</Heading>
            <PlusIcon size={24} className="shrink-0 text-ink transition-transform duration-hover ease-out group-open:rotate-45" />
          </summary>
          <p className="mt-3 mb-2 max-w-[62ch] font-body text-body text-pretty text-ink">{item.a}</p>
        </details>
      ))}
      {jsonLd ? <JsonLd data={faqPage(items)} /> : null}
    </div>
  );
}
