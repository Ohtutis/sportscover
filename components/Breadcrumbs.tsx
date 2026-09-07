import Link from "next/link";
import { breadcrumbList } from "../lib/seo/jsonld";
import { JsonLd } from "./JsonLd";

export interface Crumb {
  name: string;
  href: string;
}

/** Visible breadcrumb trail + BreadcrumbList JSON-LD (spec §8: everywhere except `/`). */
export function Breadcrumbs({ trail, className = "" }: { trail: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className || undefined}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-small text-muted-text">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-x-2">
              {i > 0 ? (
                <span aria-hidden="true" className="select-none">
                  /
                </span>
              ) : null}
              {last ? (
                <span aria-current="page" className="py-1.5 text-ink">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.href} className="py-1.5 underline-offset-4 decoration-1 transition-[text-decoration-thickness] duration-hover ease-out hover:underline">
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbList(trail)} />
    </nav>
  );
}
