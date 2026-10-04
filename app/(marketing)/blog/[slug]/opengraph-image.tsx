// The share card of a post (CONTRACTS §5.2 recipe): the lib/og shell on stock — the board and the date
// as a record line, the H1 in Anton, the description under it. Fonts are fetched at build time; with
// no network the shell still renders with next/og's bundled face rather than failing the page.
import { ImageResponse } from "next/og";
import { formatPostDate, postBySlug, posts } from "../../../../lib/blog";
import { loadGoogleFont, OG_COLORS, OG_CONTENT_TYPE, OG_SIZE, OgFrame } from "../../../../lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Game Day Edition blog — guides for sports parents";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };

async function fonts(headline: string, text: string): Promise<OgFont[] | undefined> {
  try {
    const [anton, grotesk] = await Promise.all([loadGoogleFont("Anton", 400, headline), loadGoogleFont("Space Grotesk", 400, text)]);
    return [
      { name: "Anton", data: anton, weight: 400, style: "normal" },
      { name: "Space Grotesk", data: grotesk, weight: 400, style: "normal" },
    ];
  } catch {
    return undefined;
  }
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = postBySlug(slug);
  const headline = post?.h1 ?? "GUIDES FOR SPORTS PARENTS.";
  const record = post ? `${post.category} · ${formatPostDate(post.publishedAt)}`.toUpperCase() : "";
  const description = post?.description ?? "";
  const loaded = await fonts(headline, `${record}${description}`);
  return new ImageResponse(
    (
      <OgFrame tone="stock">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {record ? (
            <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.08em", color: OG_COLORS.stock.muted }}>{record}</div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontFamily: "Anton",
              fontSize: 80,
              lineHeight: 0.95,
              letterSpacing: "0.005em",
              textTransform: "uppercase",
              color: OG_COLORS.stock.ink,
              maxWidth: 980,
            }}
          >
            {headline}
          </div>
          {description ? (
            <div style={{ display: "flex", fontSize: 26, lineHeight: 1.4, color: OG_COLORS.stock.muted, maxWidth: 900 }}>{description}</div>
          ) : null}
        </div>
      </OgFrame>
    ),
    { ...OG_SIZE, ...(loaded ? { fonts: loaded } : {}) },
  );
}
