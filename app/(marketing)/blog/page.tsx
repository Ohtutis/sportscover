// /blog — the post list (spec §4.12). Stock, one column at the page measure: the board each post
// belongs to, its headline, the line under it, the date and the reading time. No category filter.
//
// Metadata: the lib/seo/titles.ts row when it exists (that table is where titles live); until it lands
// the page carries the same strings itself from lib/blog.ts, so the route never throws at import.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { SectionHeading } from "../../../components/SectionHeading";
import { BLOG_INDEX, BLOG_PATH, formatPostDate, postPath, posts } from "../../../lib/blog";
import { pageMeta } from "../../../lib/seo/meta";
import { PAGES } from "../../../lib/seo/titles";
import { BRAND } from "../../../lib/site";

export const metadata: Metadata = PAGES[BLOG_PATH]
  ? pageMeta(BLOG_PATH)
  : {
      title: BLOG_INDEX.title,
      description: BLOG_INDEX.description,
      alternates: { canonical: BLOG_PATH },
      openGraph: { url: BLOG_PATH, title: `${BLOG_INDEX.title} | ${BRAND}`, description: BLOG_INDEX.description, type: "website" },
    };

export default function BlogIndexPage() {
  return (
    <section className="pt-6 pb-16 md:pb-24 lg:pb-32">
      <div className="container-site">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: "Blog", href: BLOG_PATH },
          ]}
        />
        <div className="mt-6">
          <SectionHeading as="h1" title={BLOG_INDEX.h1} subhead={BLOG_INDEX.standfirst} />
        </div>
        <ol className="mt-10 max-w-[62ch] list-none border-t border-hairline lg:mt-12">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-hairline py-8">
              <article aria-labelledby={`post-${post.slug}`}>
                <p className="font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">{post.category}</p>
                <h2 id={`post-${post.slug}`} className="mt-3 max-w-[24ch] font-display text-h3 uppercase text-balance text-ink">
                  <Link href={postPath(post)} className="decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-hover ease-out hover:underline">
                    {post.h1}
                  </Link>
                </h2>
                <p className="mt-3 font-body text-body text-pretty text-ink">{post.description}</p>
                <p className="mt-3 flex flex-wrap gap-x-3 font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-muted-text">
                  <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} min read</span>
                </p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
