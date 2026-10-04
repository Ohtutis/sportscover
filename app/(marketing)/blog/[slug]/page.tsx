// /blog/[slug] — one post (master plan §7.5, spec §4.12). Static: every slug is known at build time
// (`dynamicParams = false` → anything else is a 404). Metadata comes from the post's own row in
// lib/blog.ts; the share image from ./opengraph-image.tsx. JSON-LD: BlogPosting here, BreadcrumbList
// from <Breadcrumbs> inside PostArticle — Organization stays the root layout's, emitted once.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "../../../../components/JsonLd";
import { PostArticle } from "../../../../components/blog/PostArticle";
import { assetOrNull } from "../../../../lib/assets";
import { postBySlug, postMetadata, postPath, posts } from "../../../../lib/blog";
import { blogPosting } from "../../../../lib/seo/jsonld";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  return post ? postMetadata(post) : {};
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();
  const image = post.image ? assetOrNull(post.image) : null;
  return (
    <>
      <JsonLd
        data={blogPosting({
          title: post.title,
          description: post.description,
          path: postPath(post),
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
          section: post.category,
          ...(image ? { image: image.src } : {}),
        })}
      />
      <PostArticle post={post} />
    </>
  );
}
