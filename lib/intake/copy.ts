// Copy for /free-proof and /free-proof/thanks — one place, so the page, the thank-you page, the emails
// and the tests read the same sentences. Voice: a parent is reading (DESIGN, COPY §0). The delivery
// clocks are the site's one wording (C10 / CHIPS.standard), counted from payment now that the proof
// comes first. "Secure payment link" is the whole phrase — never a provider name in copy.

import { LEAD_TIMES } from "../catalog/delivery";
import { PHOTO_RULES } from "./types";

const [digitalMin, digitalMax] = LEAD_TIMES.digitalBusinessDays;
const [printMin, printMax] = LEAD_TIMES.printShipBusinessDays;

export const INTAKE_PATH = "/free-proof";
export const INTAKE_THANKS_PATH = "/free-proof/thanks";

export const PROOF_CLOCK = `${digitalMin}–${digitalMax} business days`;

export const INTAKE_COPY = {
  /** ≤ 60 characters with the " | Game Day Edition" suffix added by the metadata layer. */
  title: "Free Proof First — Pay If You Love It",
  description: `Send ${PHOTO_RULES.min}–${PHOTO_RULES.max} photos and see a watermarked proof of your athlete's cards, poster, banner or blanket, free within ${PROOF_CLOCK}. Pay only if you love it.`,

  h1: "FREE PROOF FIRST. PAY IF YOU LOVE IT.",
  subhead: `Choose what you'd like made and send ${PHOTO_RULES.min}–${PHOTO_RULES.max} photos. We build a watermarked proof of your athlete's edition — free, within ${PROOF_CLOCK}. Approve it and pay by secure payment link or on our Etsy shop; the watermark comes off and the files and prints follow.`,

  /** v2 hero (owner review 2026-10-04): the H1, ONE short sentence, the orange CTA that scrolls to step 1, a quiet note. */
  heroLine: `Send ${PHOTO_RULES.min}–${PHOTO_RULES.max} photos, see a free watermarked proof, pay only if you love it.`,
  heroCta: "Start my free proof →",
  heroCtaNote: "No payment required",

  /** v2: the four how-it-works cards — big numeral, two-word title, one line. "Nothing due today" is the zero-due fact in words; the figure itself comes from prices.ts DUE_TODAY_LABEL. */
  stepCards: [
    { n: "01", title: "Choose it", line: "Product and style" },
    { n: "02", title: "Upload it", line: `${PHOTO_RULES.min}–${PHOTO_RULES.max} phone photos` },
    { n: "03", title: "We design it", line: "Your free watermarked proof" },
    { n: "04", title: "Love it? Pay", line: "Nothing due today" },
  ],

  /** v2: five numbered steps on the page; permissions and the conversion card come after step 5. */
  stepLabel: (n: number): string => `STEP ${n} OF 5`,
  steps5: {
    product: { title: "WHAT TO MAKE.", support: "Pick one or more. Every printed option includes the digital files." },
    style: { title: "PICK YOUR LOOK.", support: "Six finishes and the Senior Night edition. Not sure? Let us choose." },
    athlete: { title: "ABOUT THE ATHLETE.", support: "Only what goes on the card. Long names are fine — the type scales, it never shortens." },
    photos: { title: "UPLOAD YOUR PHOTOS." },
    contact: { title: "ALMOST DONE.", support: "Where should we send your free proof?" },
  },
  requiredTag: "Required",
  optionalTag: "Optional",
  optionalToggle: "+ Add optional details",

  /** v2 product cards. */
  selectedBadge: "SELECTED",
  setTile: {
    name: "Cards + poster set",
    blurb: "The card and the poster together, priced as a set.",
    /** Owner's call (2026-10-04): the badge wording is his; the savings line beside it stays computed from the ladder. */
    badge: "MOST POPULAR",
    savingsLine: (saved: string): string => `Save ${saved} against ordering them separately`,
  },

  /** v2 style tiles: the "let us choose" tile is a premium dark tile, not an empty question. */
  chooseForMeTitle: "YOU CHOOSE FOR ME",
  chooseForMeLine: "We pick the finish that suits the photos and the sport. You see it on the proof.",

  /** v2 upload zone — two to three times the height of a field. */
  dropTitle: `DROP ${PHOTO_RULES.min}–${PHOTO_RULES.max} PHOTOS HERE`,
  dropOr: "or browse files",
  dropHint: "JPG, PNG, HEIC · phone photos are fine",
  exampleGood: "Clear face, good light",
  exampleBad: "Blurry, tiny, heavily filtered",

  /** v2 conversion card at the end of the form. */
  ctaCard: {
    title: "YOUR FIRST PROOF IS FREE.",
    todayLabel: "Today",
    line: "You only pay after approving your proof.",
    button: "Get my free proof →",
    note: "No card required",
  },

  /** v2 sticky summary. */
  summary: {
    title: "YOUR ORDER",
    today: "Today",
    afterApproval: "After approval",
    onProof: "Confirmed with your proof",
    checks: ["Free watermarked proof", "No payment now", "Made for your athlete"],
    empty: "Pick a product to start.",
  },

  /** Typographic claims (Pill variant="label"), never buttons. */
  claims: ["NOTHING TO PAY NOW", `PROOF IN ${PROOF_CLOCK.toUpperCase()}`, "PAY ONLY AFTER YOU APPROVE"],

  steps: [
    { n: 1, title: "Send photos", body: `${PHOTO_RULES.min}–${PHOTO_RULES.max} photos from your phone, and what you'd like made.` },
    { n: 2, title: "Your free watermarked proof", body: `We build a watermarked proof of the real card, poster, banner or blanket — free, within ${PROOF_CLOCK}.` },
    { n: 3, title: "Choose digital or printed — pay your way", body: "Love it? Pick digital or printed and pay by secure payment link or on our Etsy shop. Not happy? Nothing to pay." },
    {
      n: 4,
      title: "We finish it — watermark off",
      body: `Digital files within ${digitalMin}–${digitalMax} business days of payment; printed items ship within ${printMin}–${printMax}.`,
    },
  ],

  sections: {
    products: {
      title: "WHAT TO MAKE.",
      subhead: "Pick one or all. Every printed option includes the digital files. Cards and a poster together are priced as a set.",
    },
    style: {
      title: "PICK A STYLE.",
      subhead: "Six finishes and the Senior Night edition. Not sure? Let us recommend one — you'll see it on the proof.",
    },
    athlete: {
      title: "ABOUT THE ATHLETE.",
      subhead: "Only what goes on the card. Long names are fine — the type scales down, it never shortens.",
    },
    photos: {
      title: "THE PHOTOS.",
      // The subhead is C5 (content/blocks/photos-that-work-best.md) — the page passes it in via block().
    },
    contact: {
      title: "WHERE TO SEND THE PROOF.",
      subhead: "We email the proof. A phone number only helps if we have a quick question about a photo.",
    },
    consent: {
      title: "PERMISSIONS.",
      subhead: "One sentence, one checkbox. The full policies are linked underneath.",
    },
  },

  /** The four photographs that matter most — shown beside the upload, ticked by the parent. */
  photoMustHaves: [
    "One close-up: face sharp, both eyes visible",
    "One with the head turned left, one turned right",
    "One full-body — head to shoes",
    "One in the team kit — game day or team photo day",
  ],
  photoAvoid: [
    "Screenshots and social-media downloads — send the original file",
    "Sunglasses, visor shadows, helmet cages across the eyes",
    "Group photos where your athlete isn't the closest to the camera",
    "Four shots from the same burst — they count as one",
  ],
  crestHelp: "A PNG or SVG of the school or club crest if you have one — otherwise a straight-on photo of it.",

  styleRecommendLabel: "Not sure — recommend one for me",
  styleRecommendDetail: "We pick the finish that suits the photos and the sport. You see it on the proof.",

  noPayment: "No payment now, no card details. You see the proof first.",
  summaryTitle: "Your request",
  submit: "Send my photos — get the free proof",
  submitting: (n: number, total: number): string => `Uploading photo ${n} of ${total}…`,
  finishing: "Sending your request…",
  etsyAlt: "Prefer Etsy? Every listing works the same way: you approve a proof before anything is finalized.",

  thanks: {
    title: "Photos Received",
    h1: "PHOTOS RECEIVED.",
    lead: `Your proof is in the queue. We check the photos first and email the watermarked proof within ${PROOF_CLOCK}.`,
    referenceLabel: "Reference",
    next: [
      "We check the photos within one business day and email you if one more angle would help.",
      `The watermarked proof arrives by email within ${PROOF_CLOCK}.`,
      "Approve it and pay by secure payment link or on our Etsy shop. Want a change? One revision is included.",
      `The watermark comes off: digital files within ${digitalMin}–${digitalMax} business days of payment, printed items ship within ${printMin}–${printMax}.`,
    ],
    reply: "To add photos or details, reply to the confirmation email — it carries your reference.",
    nothingToPay: "Nothing to pay now. If the proof isn't right and we can't fix it, there's nothing to pay at all.",
  },

  errors: {
    storageMissing: (email: string): string =>
      `Photo uploads aren't switched on yet. Email your photos and the details above to ${email} and we'll build the proof the same way.`,
    uploadFailed: "One photo didn't upload. Check the connection and try again — nothing else was lost.",
    tooMany: "Too many requests from this connection. Try again in a few minutes.",
  },
} as const;
