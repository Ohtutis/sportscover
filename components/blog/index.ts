// The primitives a post body is written in (content/blog/<slug>.tsx). The article shell
// (PostArticle) is imported by the route directly and is deliberately NOT re-exported here: it reads
// lib/blog.ts, which imports every post, and a post importing it back would close a module cycle.
export { Callout, H2, InlineLink, Lead, List, P, Prose } from "./Prose";
export { Figure, type FigureProps, type FigureVariant } from "./Figure";
export { PostCta, type PostCtaContext, type PostCtaProps } from "./PostCta";
