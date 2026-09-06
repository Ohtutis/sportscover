import type { Metadata } from "next";
import SiteClient, { type SiteData } from "./site-client";
import { faqItems } from "./site-config";
import { block } from "../lib/blocks";
import { CHIPS, SHIPPING_SENTENCE } from "../lib/catalog/delivery";
import { FAMILY_LABELS, formatUsd, fromPrice, priceDisplay, tiersFor, type Family } from "../lib/catalog/prices";
import { sports } from "../lib/catalog/sports";
import { styles } from "../lib/catalog/styles";
import { deliverables, tierNotes } from "../lib/catalog/tiers";
import { BRAND, IMPRINT, SUPPORT_EMAIL, imprintComplete } from "../lib/site";

export const metadata: Metadata = {
  title: `Custom Sports Trading Cards & Posters From Your Photos | ${BRAND}`,
  description: "One athlete, one registered edition. Custom trading cards and posters built from the photos you already have — proof before print, printed and shipped free in the US.",
  alternates: { canonical: "/" },
};

// ISR: the sale comparison (`isSaleActive`) must not be frozen at build time — the struck-through
// base price has to disappear on its own once SALE_EXPIRES_AT passes (16 CFR 233).
export const revalidate = 3600;

/** The 15 sports with an exported card front; the other two render as text tiles. */
const CARD_FRONTS = new Set(["baseball", "basketball", "cheerleading", "football", "golf", "gymnastics", "ice-hockey", "lacrosse", "soccer", "softball", "swimming", "tennis", "track-field", "volleyball", "wrestling"]);

export default function Home() {
  const now = new Date();
  const families = (["cards", "posters", "set"] as Family[]).map((family) => ({
    key: family,
    label: FAMILY_LABELS[family],
    from: formatUsd(fromPrice(family, now)),
    deliverables: deliverables[family],
    etsySku: family === "cards" ? "GDE-ANY-CARD-DIG" : family === "posters" ? "GDE-ANY-POST-DIG" : "GDE-ANY-SET-DIG",
    tiers: tiersFor(family).map((t) => {
      const p = priceDisplay(t, now);
      return { sku: t.sku, name: t.name, current: formatUsd(p.current), compareAt: p.compareAt ? formatUsd(p.compareAt) : undefined, notes: tierNotes[t.sku] ?? [], featured: t.featured, physical: t.physical };
    }),
  }));
  const data: SiteData = {
    brand: BRAND,
    supportEmail: SUPPORT_EMAIL,
    year: now.getFullYear(),
    chips: CHIPS.standard,
    shippingSentence: SHIPPING_SENTENCE,
    families,
    sports: sports.map((s) => ({ slug: s.slug, code: s.code, name: s.name, numbered: s.numbered, image: CARD_FRONTS.has(s.slug) ? `/images/cards/${s.slug}.webp` : undefined })),
    styles: styles.map((s) => ({ code: s.code, name: s.name, material: s.material, image: `/images/finishes/${s.code}.webp`, isOccasion: s.isOccasion })),
    faq: faqItems.map(([q, a]) => [q, a] as [string, string]),
    blocks: { promise: block("our-promise"), howItsMade: block("how-its-made"), photoPrivacy: block("photo-privacy"), independent: block("independent-studio"), photos: block("photos-that-work-best"), logo: block("logo-sentence") },
    imprint: imprintComplete() ? IMPRINT : null,
  };
  return <SiteClient data={data} />;
}
