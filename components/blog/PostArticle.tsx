import Link from "next/link";
import { Breadcrumbs } from "../Breadcrumbs";
import { SectionHeading } from "../SectionHeading";
import { Prose } from "./Prose";
import { BLOG_PATH, formatPostDate, postPath, type BlogPost } from "../../lib/blog";
import { OWNER_NAME } from "../../lib/site";

/** The founder's role as /about prints it (D10: the blog's author is the founder). */
const AUTHOR_ROLE = "designer and founder";

/**
 * One post, on stock (DESIGN §2.4): breadcrumbs (which carry the BreadcrumbList), the H1, one record
 * line — board · date · reading time, in the ID/time-line style of DESIGN §3 — the byline, then the body
 * at the 62ch measure. The H1 has no rule above it (the header's hairline is the rule, DESIGN §2.5).
 */
export function PostArticle({ post }: { post: BlogPost }) {
  const path = postPath(post);
  return (
    <article aria-labelledby="post-title" className="pt-6 pb-16 md:pb-24 lg:pb-32">
      <div className="container-site">
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: "Blog", href: BLOG_PATH },
            { name: post.title, href: path },
          ]}
        />
        <header className="mt-6">
          <SectionHeading as="h1" id="post-title" title={post.h1} />
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-label text-[0.9375rem] font-semibold uppercase tracking-[0.06em] tabular-nums text-ink">
            <span>{post.category}</span>
            <span aria-hidden="true" className="text-muted-text">
              ·
            </span>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            {post.updatedAt ? (
              <>
                <span aria-hidden="true" className="text-muted-text">
                  ·
                </span>
                <span>
                  Updated <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
                </span>
              </>
            ) : null}
            <span aria-hidden="true" className="text-muted-text">
              ·
            </span>
            <span>{post.readingMinutes} min read</span>
          </p>
          <p className="mt-2 font-body text-small text-muted-text">
            By{" "}
            <Link href="/about" className="text-ink underline decoration-1 underline-offset-4 hover:decoration-2">
              {OWNER_NAME}
            </Link>
            , {AUTHOR_ROLE}
          </p>
        </header>
        <Prose className="mt-10 lg:mt-12">{post.body()}</Prose>
      </div>
    </article>
  );
}
