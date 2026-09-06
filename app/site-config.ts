// Site identity (see lib/site.ts) plus the copy lists the marketing page renders.
import { BRAND, OWNER_NAME, SITE_URL, SUPPORT_EMAIL } from "../lib/site";
import { sports as catalogSports } from "../lib/catalog/sports";
import { styles } from "../lib/catalog/styles";

export const siteConfig = {
  brandName: BRAND,
  supportEmail: SUPPORT_EMAIL,
  ownerName: OWNER_NAME,
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  siteUrl: SITE_URL,
};

export const sports = catalogSports.map((s) => s.name);
export const styleOptions = styles.map((s) => s.name);

export const faqItems: ReadonlyArray<readonly [string, string]> = [
  ["Is this a template with my photo dropped in?", "No. Every piece is composed around your athlete — their photos, uniform, colors and sport. AI imaging tools are part of the creative process, and every composition, likeness, spelling, color and detail is reviewed and finished by a person before you see the proof."],
  ["How many photos should I send?", "Send 4–10 photos with a clear view of the athlete's face and body. Different angles are better than many similar photos. Game photos, portraits and uniform photos all help."],
  ["What if my photos can't carry the likeness?", "We tell you before any art is made and ask for stronger photos. If there are none, you get every cent back."],
  ["Will it look like my athlete?", "Recognizable likeness is the point. We build a reference of your athlete from your photos first and check every shot against it. If it does not look like them, it does not ship."],
  ["Do I approve it before it prints?", "Yes. You receive a proof and approve it before anything is finalized or printed. One revision is included."],
  ["What is the registered card ID on the back?", "Every card carries its own registered card ID and a QR code. Scanning it opens the card's page here — the edition, the stats and the season. Customer pages are unlisted unless you choose to make them public."],
  ["Are the printed cards real trading cards?", "Yes. Square-cut, UV-coated, 2.5 × 3.5 in cards printed by a professional photo lab in the US, with a free printed Certificate of Authenticity in every shipped package."],
  ["Can you use our team crest?", "Yes — your school or club's own crest, exactly as you send it. We never reproduce league or governing-body marks (NFL, FIFA, NCAA, Olympic)."],
  ["My athlete's sport has no jersey number.", "Cheerleading, gymnastics, swimming, tennis and golf don't wear numbers, so the card carries the athlete's name and club crest instead."],
  ["How long does it take?", "Digital files within 1–2 business days of your order; printed items ship within 5–7 business days of your order. Both clocks start on the day you order — printing begins the moment you approve the proof, so a proof left waiting moves the ship date by the same amount. Ordering for a senior night date? Add the date — we schedule proofs against real deadlines."],
  ["Where do you ship?", "Printed items are printed and shipped free within the US. Physical and digital orders are US only for now."],
  ["Will my athlete's photos be posted anywhere?", "No. Your athlete's photos are used only to complete your order. They are not posted, shared or used to promote Game Day Edition without separate permission."],
  ["Can I order for a whole team?", "Yes. Email us with the sport, roster size and event date — every family orders their own athlete under one team setup, and each card is built and proofed individually."],
  ["Where do I order?", "Orders are placed on our Etsy shop today. Direct ordering on this site is coming — same products, same proof-before-print process."],
];
