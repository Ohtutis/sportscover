import type { MetadataRoute } from "next";
import { publicCards } from "../lib/registry/cards";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/registry`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy/biometric`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
  const cards: MetadataRoute.Sitemap = publicCards().map((c) => ({
    url: `${SITE_URL}/c/${c.cardId}`,
    lastModified: new Date(c.createdAt),
    changeFrequency: "yearly",
    priority: 0.5,
  }));
  return [...pages, ...cards];
}
