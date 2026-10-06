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
  /** v6 (owner, 2026-10-07: "the hero is too weak … it has to sell what they get"): the product is named, then the promise. */
  heroLine: `A poster, trading cards, banner or blanket designed only for them from ${PHOTO_RULES.min}–${PHOTO_RULES.max} phone photos, with a free watermarked proof before you pay anything.`,
  heroCta: "Start my free proof →",
  heroCtaNote: "No payment required",
  /**
   * v3 (owner review 2026-10-06: the hero's right half was empty): the file-tab label on the proof beside the copy.
   * v6 (2026-10-07): the exhibit reads "your photos → their edition", and a strip of sports under it switches every
   * picture on the page (the owner: "we pick a sport and everything changes").
   */
  heroVisual: {
    // Short enough for one line on a 375 px phone (the sheet itself carries the PROOF watermark).
    frameLabel: "THEIR EDITION · FREE PROOF",
    photosLabel: "Your photos →",
    switchLabel: "See it in their sport",
    allSports: (n: number): string => `All ${n} sports ↓`,
  },

  /**
   * v4 (owner review 2026-10-06, evening: "mixing sports is not cool"): every athlete picture on the page
   * shows the sport chosen in step 1, and the watermark on every example proof is drawn in CSS.
   * v5 (owner review 2026-10-07: "too many faceless grey cards"): before a choice the page shows ONE example
   * sport's real art and that athlete's phone photos, and this line says so; the grey print survives only
   * where no photo exists.
   */
  art: {
    photoLabel: "Your photo",
    watermark: "PROOF",
    /** Before a sport is chosen: the example sport's art, and one line saying how to see their sport. */
    pick: (example: string): string => `Example shown: ${example}. Pick their sport and every picture switches to it.`,
    /** A sport with no example art yet (or "Other"): the example shows, built to order, never "unavailable". */
    noExample: (sport: string, example: string): string =>
      `No ${sport} example yet, so the pictures show ${example}. We build yours from your photos, and you see the proof before you pay.`,
    noExampleOther: (example: string): string =>
      `No example for this one yet, so the pictures show ${example}. We build yours from your photos, and you see the proof before you pay.`,
    /** The stamp line along the foot of the composed proof sheet (card 04). */
    proofStamp: "PROOF · NOT FINAL · FOR APPROVAL ONLY",
  },

  /**
   * v2: the four how-it-works cards — big numeral, short title, one line. v6 (owner, 2026-10-07: "visually four is
   * better, but we explain too little about how we are different"): 01 is the sport AND style choice (several sports
   * in several finishes — the one picture on the page that mixes sports, on purpose), 02 the phone photos, 03 what makes
   * the work ours — the athlete rebuilt from the photos and checked — and 04 the proof and the pay-only-if-you-love-it
   * promise. "Nothing due today" is the zero-due fact in words; the figure itself comes from prices.ts DUE_TODAY_LABEL.
   * Honest wording only: built and checked, never "a perfect copy" (the likeness is measured, not promised).
   */
  stepCards: [
    { n: "01", title: "Choose it", line: "Sport, product and style" },
    { n: "02", title: "Upload it", line: `${PHOTO_RULES.min}–${PHOTO_RULES.max} phone photos` },
    { n: "03", title: "We build them", line: "Not a template: their face, build and kit from your photos, checked before we design" },
    { n: "04", title: "See the proof", line: `Free and watermarked, in ${PROOF_CLOCK}` },
    // The fifth runs the full width of the row (owner, 2026-10-07: "the four main ones, and pay as an extra across
    // the whole width, so it is clear they risk nothing — they order only if they like the result").
    { n: "05", title: "Pay only if you love it", line: "Nothing to pay now. See the proof first and order only if you like the result.", wide: true },
  ],
  /** The wide card's figure: the zero-due fact, labelled. The figure itself is prices.ts DUE_TODAY_LABEL. */
  dueToday: "due today",

  /** v4 (2026-10-06): six numbered steps, the sport first; permissions and the conversion card come after step 6. */
  stepLabel: (n: number): string => `STEP ${n} OF 6`,
  steps6: {
    sport: { title: "THEIR SPORT.", support: "Pick it once. Every example on this page follows it." },
    product: { title: "WHAT TO MAKE.", support: "Pick one or more. Every printed option includes the digital files." },
    style: { title: "PICK YOUR LOOK.", support: "Six finishes and the Senior Night edition. Not sure? Let us choose." },
    athlete: { title: "ABOUT THE ATHLETE.", support: "Only what goes on the card. Long names are fine — the type scales, it never shortens." },
    photos: { title: "UPLOAD YOUR PHOTOS." },
    contact: { title: "ALMOST DONE.", support: "Where should we send your free proof?" },
  },
  requiredTag: "Required",
  optionalTag: "Optional",
  optionalToggle: "+ Add optional details",

  /** Step 1 (v4): the nine sports with their own pages, the rest behind "More sports", and a free-text "Other". */
  sportStep: {
    more: "More sports",
    other: "Other sport or activity",
    otherField: "Which sport or activity?",
    otherPlaceholder: "e.g. dance, rowing, martial arts",
    otherPromise: "Tell us the sport or activity. We design it from your photos.",
  },

  /** v2 product cards. */
  selectedBadge: "SELECTED",
  /** v4 (owner, 2026-10-06: "why does one product get a quantity and the others not?"): no quantity in the form. */
  moreThanOne: "Need more than one? Say so when you see the proof.",
  /**
   * Pricing v1 (owner, 2026-10-07: "if they add more than one … the price goes down — show someone a big
   * discount"): the bundle ladder under the product cards. Every figure is prices.ts BUNDLE_STEPS /
   * bundleTotal, computed from the current choice; the comparison is always the same items bought
   * separately — never a former price, a sale, a date or "limited time".
   */
  bundle: {
    title: "BUNDLE AND SAVE",
    /** One rung: "2 products −15%" … "all 4 −25%" (the last rung names every product). */
    step: (count: number, last: boolean, percent: string): string => `${last ? `all ${count}` : `${count} products`} \u2212${percent}`,
    /** Before a choice: what the ladder is. */
    lead: "Two or more products in one order: the whole order saves.",
    /** The next rung, from the current choice: the first product not yet chosen, at the option its card holds. */
    nudgeFirst: (add: string, saving: string): string => `Add ${add}: save ${saving} on the order.`,
    nudgeMore: (add: string, saving: string): string => `Add ${add}: save another ${saving}.`,
    top: (percent: string): string => `All four chosen: the whole order saves ${percent}.`,
    addName: { cards: "trading cards", poster: "a poster", banner: "a banner", blanket: "a blanket" },
  },
  /** v3 (owner, 2026-10-06): the caption under the live text preview in "Your order". */
  previewCaption: "Text preview — your proof is composed from your photos; the layout follows the finish.",

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
    /** Pricing v1: with two or more products, the same items bought separately (struck) and the bundle saving. */
    separately: "Bought separately",
    bundleSaving: "Bundle saving",
    savingValue: (saving: string, percent: string): string => `\u2212${saving} (${percent})`,
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

  /**
   * v3 permissions (owner review 2026-10-06: the grey "PERMISSIONS." panel read "as if we were doing
   * something not legit"): three quick confirmations on a white card. Each row is a plain-language title
   * over the verbatim consent sentence (CONSENTS in types.ts) — the sentence stays the checkbox's label,
   * the title only says what it means. An attached crest adds a fourth required box, and the counts
   * follow it, so the panel never says "three" over four boxes.
   */
  consentPanel: {
    title: "THREE QUICK CONFIRMATIONS.",
    line: "The same three every family gives us before we start. Nothing is posted or shared.",
    needed: "All three are needed to build the proof.",
    withCrest: {
      title: "FOUR QUICK CONFIRMATIONS.",
      line: "The same three every family gives us, plus one for the crest. Nothing is posted or shared.",
      needed: "All four are needed to build the proof.",
    },
  },
  /** One per consent, in a parent's words; the sentence under it is the binding text. */
  consentTitles: {
    guardian: "You can share these photos",
    biometric: "We may measure the face to check the likeness",
    license: "We may make the artwork from these photos",
    crest: "You can use this crest",
  },
  /** One plain line between a row's title and its sentence — only the biometric row has one. */
  consentNotes: {
    biometric:
      "Privacy law asks us to spell this one out: it is only how we check the artwork looks like your athlete, and it is deleted when your request closes.",
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

  /**
   * The example gallery beside the step-4 drop zone (owner, 2026-10-06: "more and better examples", and the
   * self-check block "can definitely be clearer"). It replaces the ✓ / ✕ pair AND the must-have / leave-out
   * text with its checkboxes: four ✓ tiles carry photoMustHaves 1–4 in at most four words, three ✕ tiles carry
   * the leave-out reasons, one label per row. Tile order and images: components/intake/PhotoExamples.tsx.
   */
  photoExamples: {
    title: "Example photos",
    sendLabel: "SEND THESE",
    leaveLabel: "LEAVE THESE OUT",
    captions: {
      face: "Face sharp, both eyes",
      turned: "Head turned left or right",
      fullbody: "Full body",
      kit: "In the team kit",
      blurred: "Blurry",
      covered: "Face covered",
      group: "Group photo",
    },
  },

  /**
   * The free photo check under the thumbnails (owner, 2026-10-06: "but not if it starts using AI credits"):
   * measured on the parent's own device by components/intake/photoCheck.ts — advice, never a gate, never a
   * score. A chip shows the first reason; the second is read to assistive tech. Every reason fits two lines
   * under a 101 px thumbnail (a 360 px phone), so the reserved row never grows.
   */
  photoCheck: {
    reasons: {
      sharp: "Looks sharp",
      blurry: "Looks blurry — try another",
      small: "Small — send the original",
      tiny: "Tiny — send the original",
      dark: "Dark — try a brighter one",
      bright: "Too bright — try another",
      screenshot: "Looks like a screenshot",
      duplicate: "Same shot as another photo",
      heic: "HEIC — we'll check it",
      unreadable: "We'll check this one",
    },
    checking: "Checking…",
    summaryChecking: "Checking the photos on this device…",
    /**
     * One line under the counter: "3 of 4 look good — one is worth replacing." Counts only, never a score; the
     * photos this device could not read (HEIC) are left to their own chips.
     */
    summary: (good: number, checked: number, flagged: number, unchecked: number): string => {
      const word = (n: number): string => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][n] ?? String(n);
      if (checked === 0) return unchecked === 1 ? "We check this one on our side." : "We check these on our side.";
      if (flagged === 0) {
        const all = checked === 1 ? "It looks good." : checked === 2 ? "Both look good." : `All ${checked} look good.`;
        if (!unchecked) return all;
        return checked === 1 ? "The one we could check looks good." : checked === 2 ? "Both we could check look good." : `All ${checked} we could check look good.`;
      }
      return `${good} of ${checked} look good — ${flagged === 1 ? "one is" : `${word(flagged)} are`} worth replacing.`;
    },
  },

  styleRecommendLabel: "Not sure — recommend one for me",
  styleRecommendDetail: "We pick the finish that suits the photos and the sport. You see it on the proof.",

  noPayment: "No payment now, no card details. You see the proof first.",
  summaryTitle: "Your request",
  submit: "Send my photos — get the free proof",
  submitting: (n: number, total: number): string => `Uploading photo ${n} of ${total}…`,
  finishing: "Sending your request…",
  etsyAlt: "Prefer Etsy? Every listing works the same way: you approve a proof before anything is finalized.",
  /** v3 (owner review 2026-10-06: the outline box read weak): one muted line beside the house EtsyButton. */
  etsyAltShort: "Prefer Etsy? Same proof, same process.",

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
