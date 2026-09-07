// The one metadata table every page reads (CONTRACTS §4.3, COPY §3, GAPS #24). tests assert the
// lengths here — ≤ 60 characters for the rendered <title> (head phrase + TITLE_SUFFIX, or the
// absolute string) and ≤ 155 for the description — so no page file ever invents a title.
// F2/F3 rows exist so lib/seo/intents.ts can map every keyword to a table key; only `phase: "F1"`
// rows reach the sitemap. Pattern rows ({Sport}, {Finish}) are measured with the longest name
// substituted (Cheerleading, Signature Spotlight). The banned words of COPY §0.4 never appear here.

export type Phase = "F1" | "F2" | "F3";

export interface PageMeta {
  path: string;
  /** Head phrase; the root template appends TITLE_SUFFIX unless `absolute` is set. */
  title: string;
  description: string;
  phase: Phase;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
  noindex?: boolean;
  /** The title is complete as written — the root template does not append the suffix (GAPS #24). */
  absolute?: boolean;
}

export const TITLE_SUFFIX = " | Game Day Edition";
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

const page = (p: PageMeta): [string, PageMeta] => [p.path, p];

export const PAGES: Record<string, PageMeta> = Object.fromEntries([
  page({
    path: "/",
    title: "Game Day Edition — Custom Sports Trading Cards & Posters",
    absolute: true,
    description:
      "Custom sports trading cards and posters from your photos. One registered edition per athlete; you approve a proof before anything prints. Not a template.",
    phase: "F1",
    priority: 1,
    changeFrequency: "weekly",
  }),
  page({
    path: "/trading-cards",
    title: "Custom Trading Cards From Your Photos",
    description:
      "Custom trading cards composed around your athlete: front and back, square-cut, UV-coated, a registered card ID on the back. Not a template: built for them.",
    phase: "F1",
    priority: 0.9,
    changeFrequency: "weekly",
  }),
  page({
    path: "/posters",
    title: "Custom Sports Posters From Your Photos",
    description:
      "Custom sports posters composed around your athlete, in two print sizes at 300 DPI. Not a template — art for the wall; the stats live on the card.",
    phase: "F1",
    priority: 0.9,
    changeFrequency: "weekly",
  }),
  page({
    path: "/complete-set",
    title: "Sports Poster and Trading Card Set",
    description:
      "The complete edition from your photos: poster, card front and back, certificate, flip video, wallpapers and the card's own page. Counted, not implied.",
    phase: "F1",
    priority: 0.9,
    changeFrequency: "weekly",
  }),
  page({
    path: "/senior-night",
    title: "Senior Night Gift: Poster & Card Set",
    description:
      "A senior night gift built from your athlete's photos: a gold senior edition with class year, career line and senior quote. Files a week before the night.",
    phase: "F1",
    priority: 0.9,
    changeFrequency: "weekly",
  }),
  page({
    path: "/how-it-works",
    title: "How Custom Trading Cards Are Made",
    description:
      "Six gates between your photos and the print — photo check, kit, reference plate, four shots, verification, proof. Made by a person; AI is in the toolbox.",
    phase: "F1",
    priority: 0.7,
    changeFrequency: "monthly",
  }),
  page({
    path: "/guarantee",
    title: "Our Promise: Proof First, Refund in Full",
    description:
      "You approve a proof before anything is finalized; if we can't get there, every cent back. Shipping by package, the refund ladder, what new means for you.",
    phase: "F1",
    priority: 0.6,
    changeFrequency: "monthly",
  }),
  page({
    path: "/photo-guide",
    title: "What Photos to Send for a Custom Card",
    description:
      "The nine things the photo check looks for — face size, angles, kit, eyes, who's closest to the camera. Send 4–10; we tell you before any art is made.",
    phase: "F1",
    priority: 0.6,
    changeFrequency: "monthly",
  }),
  page({
    path: "/about",
    title: "About the Independent Custom Card Studio",
    description:
      "Who is asking for your athlete's photos: a designer in Lithuania, three professional labs in the US, and a registry that keeps each card's page five years.",
    phase: "F1",
    priority: 0.5,
    changeFrequency: "monthly",
  }),
  page({
    path: "/registry",
    title: "Look Up a Registered Card",
    description:
      "Type the registered card ID from the back of any Game Day Edition card or certificate to open its page — the edition, the finish, the season.",
    phase: "F1",
    priority: 0.6,
    changeFrequency: "monthly",
  }),
  page({
    path: "/faq",
    title: "FAQ — Custom Cards, Photos, Delivery",
    description:
      "Every question we are asked, in one place: products, photos, sports without numbers, timing, AI, privacy, refunds, Etsy or here, teams and the registry.",
    phase: "F1",
    priority: 0.5,
    changeFrequency: "monthly",
  }),
  page({
    path: "/contact",
    title: "Contact",
    description: "How to reach Game Day Edition about an order, a card page, a team or your athlete's photos.",
    phase: "F1",
    priority: 0.3,
    changeFrequency: "yearly",
  }),
  page({
    path: "/accessibility",
    title: "Accessibility Statement",
    description:
      "Game Day Edition builds to WCAG 2.2 AA — keyboard, screen readers, reduced motion, real alt text. How to tell us when something is hard to use.",
    phase: "F1",
    priority: 0.2,
    changeFrequency: "yearly",
  }),
  page({
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "What we collect to make your athlete's edition, who processes it, how long we keep it, and what we never do with it. Written for the parent of a minor.",
    phase: "F1",
    priority: 0.2,
    changeFrequency: "yearly",
  }),
  page({
    path: "/privacy/biometric",
    title: "Biometric Data Policy",
    description:
      "Our written policy for the likeness check: what is measured, why, with whose consent, who can access it, and when it is destroyed.",
    phase: "F1",
    priority: 0.2,
    changeFrequency: "yearly",
  }),
  page({
    path: "/terms",
    title: "Terms of Service",
    description:
      "The terms for custom editions: licence, approvals, cancellation and refunds, delivery dates, the registered card page and its five-year pledge.",
    phase: "F1",
    priority: 0.2,
    changeFrequency: "yearly",
  }),
  // --- F2 / F3 routes: table keys for lib/seo/intents.ts; not built, not in the sitemap ---
  page({
    path: "/senior-night/[sport]",
    // COPY §3: "Poster & " is trimmed when the sport name pushes the title past 60.
    title: "{Sport} Senior Night Gift: Card Set",
    description:
      "{Sport} senior night gift from your athlete's photos — a gold senior edition card and poster. Add the date; we schedule the proof against it.",
    phase: "F2",
    priority: 0.8,
    changeFrequency: "weekly",
  }),
  page({
    path: "/christmas-gift",
    title: "Christmas Gift: Custom Poster & Card Set",
    description:
      "A Christmas gift built from your athlete's photos: poster, card front and back and the card's own registered page. Order-by dates for under the tree.",
    phase: "F2",
    priority: 0.7,
    changeFrequency: "weekly",
  }),
  page({
    path: "/teams",
    title: "End-of-Season Team Gifts: One Setup",
    description:
      "One team setup for the end of the season: you set the crest, the colors and the deadline once; every family orders and pays for their own athlete.",
    phase: "F2",
    priority: 0.7,
    changeFrequency: "monthly",
  }),
  page({
    path: "/order/new",
    title: "Start an Order",
    description: "Start a custom edition: choose the package, the sport and the finish, then send 4–10 photos of your athlete.",
    phase: "F2",
    priority: 0.5,
    changeFrequency: "monthly",
    noindex: true,
  }),
  page({
    path: "/sports/[sport]",
    title: "Custom {Sport} Cards & Posters",
    description: "Custom {sport} trading cards and posters from your photos — front and back, registered card ID, proof before print.",
    phase: "F3",
    priority: 0.8,
    changeFrequency: "weekly",
  }),
  page({
    path: "/styles/[finish]",
    title: "The {Finish} Finish",
    description: "The {Finish} finish for custom trading cards and posters — what the material does and what the layout keeps.",
    phase: "F3",
    priority: 0.6,
    changeFrequency: "monthly",
  }),
]);

/** The <title> the browser shows for a table entry. */
export function fullTitle(meta: PageMeta): string {
  return meta.absolute ? meta.title : `${meta.title}${TITLE_SUFFIX}`;
}

/** The longest names a pattern row can carry — the length test measures pattern titles with these. */
export const LONGEST_SUBSTITUTIONS = { "{Sport}": "Cheerleading", "{sport}": "cheerleading", "{Finish}": "Signature Spotlight" } as const;

/** A pattern title / description with the longest real names substituted. */
export function substituteLongest(text: string): string {
  return Object.entries(LONGEST_SUBSTITUTIONS).reduce((s, [token, value]) => s.split(token).join(value), text);
}

export function pageFor(path: string): PageMeta {
  const meta = PAGES[path];
  if (!meta) throw new Error(`titles: "${path}" is not in PAGES — add the row before building the page`);
  return meta;
}

/** Routes that reach the sitemap: built in F1 and indexable. */
export const f1Pages = (): PageMeta[] => Object.values(PAGES).filter((p) => p.phase === "F1" && !p.noindex);

/** Whether a concrete path matches a table key, with `[sport]` / `[finish]` segments allowed. */
export function matchesPagePath(path: string): boolean {
  if (PAGES[path]) return true;
  return Object.keys(PAGES).some((key) => {
    if (!key.includes("[")) return false;
    const re = new RegExp(`^${key.replace(/\[[^\]]+\]/g, "[a-z0-9-]+")}$`);
    return re.test(path);
  });
}

/** The 404 title head phrase (COPY §3). */
export const NOT_FOUND_TITLE = "Not Found";
