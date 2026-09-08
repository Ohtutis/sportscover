// The master FAQ (COPY §2.11) and the per-page subsets (CONTRACTS §4.8). Every answer is pasted from
// COPY with its tokens resolved at module scope; canon sentences come from lib/copy/canon.ts and
// content/blocks (block() reads the file system — server only; never import from a client component).
//
// `faqAll()` is the /faq page (the numbered master list); the product, Senior Night and how-it-works
// pages render `faqSubset(page)`. A few product-page questions exist only in a subset
// (`subsetOnly`) — they are not on /faq, which stays the 35-item list COPY numbers.

import { block } from "../blocks";
import { CANON } from "../copy/canon";
import { SITE_SELLS_DIRECT, SUPPORT_EMAIL } from "../site";
import { CHIPS, LEAD_TIMES } from "./delivery";
import { getTier } from "./prices";
import { deliverables, FILE_COUNTS } from "./tiers";

export type FaqGroup = "products" | "photos" | "numberless" | "timing" | "process" | "privacy" | "refunds" | "etsy" | "teams" | "registry";

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  group: FaqGroup;
  /** Rendered only while the site does not sell direct. */
  f1Only?: boolean;
  /** Rendered only while the sealed-pack tier is enabled (D18). */
  requiresPack?: boolean;
  /** Lives in a page subset only, not on /faq. */
  subsetOnly?: boolean;
}

export const FAQ_GROUP_TITLES: Record<FaqGroup, string> = {
  products: "Products",
  photos: "Photos",
  numberless: "Sports without numbers",
  timing: "Timing and delivery",
  process: "How it's made",
  privacy: "Privacy",
  refunds: "Refunds and the promise",
  etsy: "Etsy and this site",
  teams: "Teams",
  registry: "Registry and card pages",
};

const C1 = block("our-promise");
const C2 = block("how-its-made");
const C3 = block("photo-privacy");
const C5 = block("photos-that-work-best");
const C6 = block("logo-sentence");
const C6_FIRST = C6.slice(0, C6.indexOf(". ") + 1);
const C1_SHIPPED = C1.slice(C1.indexOf("On shipped packages"));
const [packMin, packMax] = LEAD_TIMES.sealedPackWeeks;
const email = SUPPORT_EMAIL;

const ETSY_OR_HERE_F1 = "Orders are placed on our Etsy shop. Every card is built and proofed the same way, and your files and your card's page are delivered here.";
const ETSY_OR_HERE_F2 =
  "Both are the same edition, built and proofed the same way, delivered on the same order page. Etsy orders are placed and refunded on Etsy; orders placed here are handled here.";

export const faq: FaqItem[] = [
  // Products
  {
    id: "faq-01",
    group: "products",
    q: "Is this a template with my photo dropped in?",
    a: "No. Every piece is composed around your athlete — their photos, kit, colors and sport. AI imaging tools are part of the creative process, and every composition, likeness, spelling, color and detail is reviewed and finished by a person before you see the proof.",
  },
  {
    id: "faq-02",
    group: "products",
    q: "Are the printed cards real trading cards?",
    a: "Yes. Square-cut, UV-coated, 2.5 × 3.5 in cards printed by a professional photo lab in the US, with a free printed Certificate of Authenticity in every shipped package.",
  },
  {
    id: "faq-03",
    group: "products",
    q: "Are the corners rounded?",
    a: "No. The cards are square-cut, the way a card comes out of a pack, UV-coated, 2.5 × 3.5 in, printed by a professional photo lab in the US.",
  },
  {
    id: "faq-04",
    group: "products",
    requiresPack: true,
    q: "What's in the sealed pack?",
    a: `${CANON.packLine} — sealed at our pack partner in Hong Kong and shipped separately, ${packMin}–${packMax} weeks.`,
  },
  {
    id: "faq-05",
    group: "products",
    q: "Which poster size should I choose?",
    a: "18 × 24 sits above a desk or dresser; 24 × 36 holds a wall on its own. Every order includes both sizes as files, so a printed 18 × 24 can be printed again larger later.",
  },
  {
    id: "faq-06",
    group: "products",
    q: "What's in the complete set?",
    a: `${FILE_COUNTS.set} files and one live page: the poster in two sizes, the card front and back, the certificate, nine social posts, seven wallpapers, the bonus die-cuts, the flip video, and the card's registered page. Printed sets add the printed cards, poster and certificate.`,
  },
  {
    id: "faq-07",
    group: "products",
    q: "Can I print the files myself?",
    a: "Yes. The files are PNG at 300 dpi in both sizes, sized for any print shop. Print at 100 %, no scaling.",
  },
  // Photos
  { id: "faq-08", group: "photos", q: "How many photos should I send?", a: C5 },
  {
    id: "faq-09",
    group: "photos",
    q: "What if my photos can't carry the likeness?",
    a: "We tell you before any art is made and ask for stronger photos. If there are none, you get every cent back.",
  },
  {
    id: "faq-10",
    group: "photos",
    q: "Will it look like my athlete?",
    a: "Recognizable likeness is the point. We build a reference of your athlete from your photos first and check every shot against it. If it does not look like them, it does not ship.",
  },
  {
    id: "faq-11",
    group: "photos",
    q: "Can you use our team crest?",
    a: `Yes — your school or club's own crest, exactly as you send it. ${C6_FIRST}`,
  },
  // Sports without numbers
  { id: "faq-12", group: "numberless", q: "My athlete's sport has no jersey number.", a: CANON.numberlessLine },
  {
    id: "faq-13",
    group: "numberless",
    q: "My senior is a cheerleader — no number?",
    a: "Right. Cheerleading cards carry the name and club crest; the back shows level, title and years instead of a number.",
  },
  // Timing and delivery
  { id: "faq-14", group: "timing", q: "How long does it take?", a: `${CANON.deliveryClocks} ${CANON.seniorDateLine}` },
  { id: "faq-15", group: "timing", q: "Where do you ship?", a: CANON.shipping },
  {
    id: "faq-16",
    group: "timing",
    q: "Do the printed pieces arrive together?",
    a: `${CANON.stagedDelivery} The cards come from the photo lab in California and the poster from the poster partner in North Carolina, so they usually arrive on different days. Both are tracked.`,
  },
  {
    id: "faq-17",
    group: "timing",
    q: "Ordering for senior night — when do I have to order?",
    a: `${CHIPS.seniorNight}. Add the date at the order and we schedule the proof against it. If nothing printed can make it, order the digital files and gift the note above.`,
  },
  // How it's made
  {
    id: "faq-18",
    group: "process",
    q: "Do I approve it before it prints?",
    a: "Yes. You receive a proof and approve it before anything is finalized or printed. One revision is included.",
  },
  { id: "faq-19", group: "process", q: "Do you use AI?", a: `Yes, as a tool. ${C2} The whole process, check by check, is on the how-it-works page.` },
  {
    id: "faq-20",
    group: "process",
    q: "What happens to the reference you build of my athlete?",
    a: "It exists only to check likeness for your order, is never shared, and is destroyed when the order closes. The written policy is at /privacy/biometric.",
  },
  // Privacy
  { id: "faq-21", group: "privacy", q: "Will my athlete's photos be posted anywhere?", a: `No. ${C3}` },
  {
    id: "faq-22",
    group: "privacy",
    q: "What do you never ask for?",
    a: "A date of birth, the athlete's home address, a school name. We ask for 4–10 photos and the details printed on the card, and nothing else.",
  },
  {
    id: "faq-23",
    group: "privacy",
    q: "How long do you keep the photos?",
    a: "Deleted 30 days after delivery, or earlier if you ask. The finished artwork is kept 12 months so reprints stay possible. The likeness-check measurement is destroyed when the order closes. The registry record — only what is printed on the card — stays for at least five years.",
  },
  // Refunds and the promise
  { id: "faq-24", group: "refunds", q: "What if I'm not happy?", a: `${C1} The full ladder is on the guarantee page.` },
  {
    id: "faq-25",
    group: "refunds",
    q: "Can I cancel?",
    a: "Until you approve the reference set, any time, with a full refund. After proof approval printing starts and the order cannot be cancelled — but a print defect is reprinted free or refunded in full.",
  },
  {
    id: "faq-26",
    group: "refunds",
    q: "Where is a refund paid?",
    a: "Etsy orders on Etsy; orders placed here, here, within 5 business days of the decision.",
  },
  // Etsy and this site
  { id: "faq-27", group: "etsy", q: "Should I order here or on Etsy?", a: SITE_SELLS_DIRECT ? ETSY_OR_HERE_F2 : ETSY_OR_HERE_F1 },
  {
    id: "faq-28",
    group: "etsy",
    f1Only: true,
    q: "Where do I order?",
    a: "Orders are placed on our Etsy shop. Every card, poster and set is built and proofed the same way, and your files and your card's page are delivered here.",
  },
  {
    id: "faq-29",
    group: "etsy",
    q: "I ordered on Etsy — where are my files?",
    a: "On your order page, linked in your Etsy message after purchase. The full set is larger than Etsy's attachment limit; the card front and flip video are attached on Etsy as well.",
  },
  // Teams
  {
    id: "faq-30",
    group: "teams",
    q: "Can I order for a whole team?",
    a: "Yes. Email us the sport, roster size and event date — every family orders their own athlete under one team setup, and each card is built and proofed individually.",
  },
  { id: "faq-31", group: "teams", q: "What does the coach see?", a: "Names and order status. Never photos, never files." },
  // Registry and card pages
  {
    id: "faq-32",
    group: "registry",
    q: "What is the registered card ID on the back?",
    a: "Every card carries its own registered card ID and a QR code. Scanning it opens the card's page here — the edition, the stats and the season. Customer pages are unlisted unless you choose to make them public.",
  },
  {
    id: "faq-33",
    group: "registry",
    q: "Can I make the page public, or take it down?",
    a: `Yes. Email ${email} from the purchase address with the order number and the card ID. Takedowns are done within 48 hours; other changes within 30 days.`,
  },
  {
    id: "faq-34",
    group: "registry",
    q: "How long will the page stay up?",
    a: "At least five years from the order; if the studio ever winds down we keep the registry resolving for that period or tell you how to keep a copy.",
  },
  {
    id: "faq-35",
    group: "registry",
    q: 'The QR code opened a "not found" page.',
    a: `Check the ID on the back of the card or on the certificate — it reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1. Still nothing? Email ${email} with a photo of the card back.`,
  },
  // --- subset-only questions (product, Senior Night and how-it-works pages; not on /faq) ---
  {
    id: "faq-36",
    group: "registry",
    subsetOnly: true,
    q: 'What does "registered" mean?',
    a: 'Every card carries its own registered card ID and a QR code. Scanning it opens the card\'s page here — the edition, the stats and the season. "Registered" is our own edition registry, not a copyright registration; customer pages are unlisted unless you choose to make them public.',
  },
  {
    id: "faq-37",
    group: "products",
    subsetOnly: true,
    // GAPS #20: the Etsy deliverable wording only — no safe-zone promise for any finish in F1.
    q: "Are the wallpapers safe for the lock screen?",
    a: `Every poster order includes ${deliverables.posters[1].toLowerCase()} — the files named in the listing's what-you-get list.`,
  },
  {
    id: "faq-38",
    group: "refunds",
    subsetOnly: true,
    q: "What if the print arrives damaged?",
    a: `${C1_SHIPPED} Photograph the damage and email us with the order number; we reprint free or refund in full.`,
  },
  {
    id: "faq-39",
    group: "products",
    subsetOnly: true,
    q: "Is the digital set the same art as the printed set?",
    a: `Yes. Every printed set includes every digital file; the digital set is the same ${FILE_COUNTS.set} files without the printing.`,
  },
  {
    id: "faq-40",
    group: "registry",
    subsetOnly: true,
    q: "What goes on the back of a senior card?",
    a: "Career highs, position, team, senior season, class of, the four-year line FR · SO · JR · SR, a senior quote and the athlete signature line — plus the registered card ID and QR code.",
  },
  {
    id: "faq-41",
    group: "timing",
    subsetOnly: true,
    q: "Digital and printed?",
    a: "Every printed senior set includes every digital file. Files arrive first; the printed set ships after you approve the proof.",
  },
  {
    id: "faq-42",
    group: "privacy",
    subsetOnly: true,
    q: "Do you show my athlete on this page?",
    a: `Never without written permission. Every example here is a fictional athlete from our own roster — the label "${CANON.fictionalLabel}" marks each one.`,
  },
];

export const FAQ_SUBSETS: Record<"trading-cards" | "posters" | "complete-set" | "senior-night" | "how-it-works", string[]> = {
  "trading-cards": ["faq-08", "faq-12", "faq-03", "faq-36", "faq-27", "faq-24"],
  posters: ["faq-08", "faq-05", "faq-07", "faq-37", "faq-27", "faq-38"],
  "complete-set": ["faq-08", "faq-16", "faq-39", "faq-36", "faq-27", "faq-24"],
  "senior-night": ["faq-40", "faq-13", "faq-17", "faq-41"],
  "how-it-works": ["faq-01", "faq-10", "faq-18", "faq-20", "faq-14", "faq-42"],
};

const packEnabled = (): boolean => Boolean(getTier("GDE-ANY-CARD-PACK")?.enabled);

const renderable = (item: FaqItem): boolean => (!item.requiresPack || packEnabled()) && (!item.f1Only || !SITE_SELLS_DIRECT);

/** The /faq list: the numbered master items, minus the pack question while the pack is off and the F1-only one once the site sells direct. */
export function faqAll(): FaqItem[] {
  return faq.filter((item) => !item.subsetOnly && renderable(item));
}

/** A page's visible subset, in render order. */
export function faqSubset(key: keyof typeof FAQ_SUBSETS): FaqItem[] {
  return FAQ_SUBSETS[key]
    .map((id) => faq.find((item) => item.id === id))
    .filter((item): item is FaqItem => Boolean(item) && renderable(item as FaqItem));
}

export const faqById = (id: string): FaqItem | undefined => faq.find((item) => item.id === id);

/** The groups in /faq order, each with its visible items. */
export function faqGroups(): { group: FaqGroup; title: string; items: FaqItem[] }[] {
  const all = faqAll();
  return (Object.keys(FAQ_GROUP_TITLES) as FaqGroup[])
    .map((group) => ({ group, title: FAQ_GROUP_TITLES[group], items: all.filter((i) => i.group === group) }))
    .filter((g) => g.items.length > 0);
}
