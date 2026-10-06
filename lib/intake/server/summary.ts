// One plain-text rendering of a stored free-proof request, used by both emails and by intake-pull.
//
// The customer sees what they asked for and what they agreed to. The owner additionally sees a link per
// file (7-day signed URLs in the email, local paths in intake-pull), the request.json link, and where the
// visit came from. Prices come only from products.ts (`optionPriceLabel`, `orderBundle` → prices.ts
// bundleTotal, the same function the form's "Your order" uses) — never typed here.

import { sportBySlug } from "../../catalog/sports";
import { styleByCode } from "../../catalog/styles";
import { INTAKE_COPY } from "../copy";
import { formatPercent, formatUsd } from "../../catalog/prices";
import { choiceLabel, optionOf, optionPriceLabel, orderBundle, productByKey } from "../products";
import { CONSENTS, CONSENT_ORDER, SPORT_OTHER, STYLE_RECOMMEND, type FileMeta } from "../types";
import type { StoredRequest } from "./record";

export type Audience = "owner" | "customer";

export interface SummaryOptions {
  audience: Audience;
  /** Object path → link (signed URL or local file); null = the object was not found. Owner only. */
  links?: Map<string, string | null>;
  /** request.json's own link. Owner only. */
  requestJsonLink?: string | null;
}

export const athleteName = (r: Pick<StoredRequest, "athlete">): string => `${r.athlete.firstName} ${r.athlete.lastName}`.trim();
/**
 * The sport as a person reads it: the catalog name, or — for "Other sport or activity" — what the parent
 * typed, "Other: rowing". `other-sport` is the catalog's Skateboarding and stays "Skateboarding".
 */
export const sportLabel = (slug: string, other?: string): string =>
  slug === SPORT_OTHER ? `Other: ${(other ?? "").trim() || "not named"}` : (sportBySlug(slug)?.name ?? slug);
export const styleLabel = (style: StoredRequest["style"]): string =>
  style === STYLE_RECOMMEND ? INTAKE_COPY.styleRecommendLabel : `${styleByCode(style)?.name ?? style} (${style})`;
/** The short style name for a subject line: "Stadium Night", or "style to recommend". */
export const styleShort = (style: StoredRequest["style"]): string => (style === STYLE_RECOMMEND ? "style to recommend" : (styleByCode(style)?.name ?? style));

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * "- Trading cards · 12 printed cards — <price>", one line per chosen product ("× 2 — <price> each" on a
 * stored request that carries a quantity), then — with two or more different products — the bundle in three
 * lines: the same items bought separately, the bundle saving and the total (pricing v1, 2026-10-07). One
 * product prints its total only.
 */
export function productLines(record: Pick<StoredRequest, "products">): string[] {
  const items = record.products.map((choice) => {
    const product = productByKey(choice.product);
    const option = product ? optionOf(product, choice.option) : undefined;
    const quantity = choice.quantity > 1 ? ` × ${choice.quantity}` : "";
    if (!option) return `- ${choiceLabel(choice.product, choice.option)}${quantity}`;
    return `- ${choiceLabel(choice.product, choice.option)}${quantity} — ${optionPriceLabel(option)}${choice.quantity > 1 ? " each" : ""}`;
  });
  const bundle = orderBundle(record.products);
  if (!bundle) return items;
  const totals =
    bundle.discountRate > 0
      ? [
          `Bought separately: ${formatUsd(bundle.alaCarte)}`,
          `Bundle saving (${bundle.productCount} products, ${formatPercent(bundle.discountRate)}): \u2212${formatUsd(bundle.discount)}`,
          `Total after approval: ${formatUsd(bundle.total)}`,
        ]
      : [`Total after approval: ${formatUsd(bundle.total)}`];
  return [...items, ...totals];
}

const line = (label: string, value: string | undefined): string | null => (value && value.trim() ? `${label}: ${value.trim()}` : null);
const block = (title: string, lines: (string | null)[]): string => [title, ...lines.filter((l): l is string => Boolean(l))].join("\n");

export interface PhotoState {
  sent: number;
  arrived: number;
}

/** How many photos were chosen and how many the browser reported as uploaded (all of them before complete). */
export function photoState(record: Pick<StoredRequest, "photos" | "uploaded">): PhotoState {
  return { sent: record.photos.length, arrived: record.uploaded ? record.uploaded.photos.length : record.photos.length };
}

function fileLine(index: number | null, meta: FileMeta, path: string, record: StoredRequest, opts: SummaryOptions): string {
  const n = index === null ? "" : `${String(index + 1).padStart(2, "0")} `;
  const head = `${n}${meta.name} · ${formatBytes(meta.size)}`;
  const uploaded = !record.uploaded || record.uploaded.photos.includes(path) || record.uploaded.crest === path;
  if (!uploaded) return `${head} — did not arrive`;
  if (opts.audience !== "owner" || !opts.links) return head;
  const link = opts.links.get(path);
  return link ? `${head} — ${link}` : `${head} — not found in storage`;
}

export function renderSummary(record: StoredRequest, opts: SummaryOptions): string {
  const owner = opts.audience === "owner";
  const a = record.athlete;
  const c = record.contact;
  const state = photoState(record);

  const sections: string[] = [
    block("REFERENCE", [record.requestId]),
    block("WHAT TO MAKE", [
      ...productLines(record),
      "Prices are today's site prices; your proof email confirms the total.",
    ]),
    block("STYLE", [styleLabel(record.style)]),
    block("ATHLETE", [
      line("Name", athleteName(record)),
      line("Sport", sportLabel(a.sportSlug, a.sportOther)),
      line("Number", a.jerseyNumber),
      line("Position", a.position),
      line("Team", a.team),
      line("Season", a.season),
      line("Class of", a.classOf),
      line("Senior night", a.eventDate),
      line("Team colors", [a.colors.primary, a.colors.secondary].filter(Boolean).join(" / ")),
      line("Headline", a.headline),
      line("Stats", a.stats.map((s) => `${s.value} ${s.label}`).join(" · ")),
      line("Notes", a.notes),
    ]),
    block("CONTACT", [line("Name", c.name), line("Email", c.email), line("Phone", c.phone), line("Country", c.country), line("Needed by", c.neededBy)]),
    block(
      `PERMISSIONS (wording of ${record.consentTextVersion})`,
      // The form no longer asks for marketing (owner, 2026-10-06) and asks for the crest only with a crest:
      // print the three required boxes, the crest box when a crest came, and marketing only if an old request gave it.
      CONSENT_ORDER.filter((key) => (key === "crest" ? Boolean(record.crest) : key === "marketing" ? record.consents.marketing : true)).map(
        (key) => `[${record.consents[key] ? "x" : " "}] ${CONSENTS[key].text}`,
      ),
    ),
    block(
      state.arrived === state.sent ? `PHOTOS (${state.sent})` : `PHOTOS (${state.arrived} of ${state.sent} arrived)`,
      record.photos.map((meta, i) => fileLine(i, meta, record.issued.photos[i] ?? "", record, opts)),
    ),
  ];
  if (record.crest && record.issued.crest) sections.push(block("CREST", [fileLine(null, record.crest, record.issued.crest, record, opts)]));
  if (owner) {
    if (opts.requestJsonLink) sections.push(block("REQUEST FILE", [opts.requestJsonLink]));
    const s = record.source;
    sections.push(
      block("SOURCE", [
        line("Landing page", s.landingPath),
        line("Referrer", s.referrer),
        ...Object.entries(s.utm).map(([k, v]) => line(k, v)),
        line("Browser", record.userAgent),
        line("Started", record.createdAt),
        line("Received", record.receivedAt),
      ]),
    );
  }
  return sections.join("\n\n");
}
