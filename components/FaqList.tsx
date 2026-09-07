import { faqPage } from "../lib/seo/jsonld";
import { PlusIcon } from "./icons";
import { JsonLd } from "./JsonLd";

/**
 * A details/summary FAQ list (DESIGN §5.2-7). `jsonLd` emits FAQPage for EXACTLY the items rendered
 * here — at most one jsonLd FaqList per page, never duplicate markup: product pages render their
 * subset with schema, /faq renders the master list with schema, everything else renders without.
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
  className?: string;
}

export function FaqList({ items, jsonLd, id, headingLevel = 3, className = "" }: FaqListProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div id={id} className={className || undefined}>
      {items.map((item) => (
        <details key={item.id} id={item.id} className="group border-t border-hairline py-5 last:border-b last:border-hairline">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 [&::-webkit-details-marker]:hidden">
            <Heading className="font-body text-[1.125rem] font-bold normal-case tracking-normal text-ink">{item.q}</Heading>
            <PlusIcon size={24} className="mt-0.5 shrink-0 text-ink transition-transform duration-hover ease-out group-open:rotate-45" />
          </summary>
          <p className="mt-3 max-w-[62ch] font-body text-body text-pretty text-ink">{item.a}</p>
        </details>
      ))}
      {jsonLd ? <JsonLd data={faqPage(items)} /> : null}
    </div>
  );
}
