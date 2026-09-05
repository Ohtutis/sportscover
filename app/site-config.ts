export const siteConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "Cover Moment",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@covermoment.co",
  ownerName: process.env.NEXT_PUBLIC_OWNER_NAME || "The Cover Moment team",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const sports = [
  "Basketball",
  "Football",
  "Baseball",
  "Softball",
  "Soccer",
  "Ice Hockey",
  "Volleyball",
  "Lacrosse",
  "Wrestling",
  "Cheerleading",
  "Gymnastics",
  "Track & Field",
  "Swimming",
  "Tennis",
  "Golf",
  "Pickleball",
  "Other Sport",
] as const;

export const styleOptions = [
  "Stadium Night",
  "Chrome All-Star",
  "Fire & Smoke",
  "Neon Future",
  "Vintage Trading Card",
] as const;

export const packages = [
  {
    id: "digital",
    name: "Digital Edition",
    price: "$119",
    summary: "A complete custom athlete identity delivered digitally and ready to share or print.",
    features: [
      "Custom cinematic poster design",
      "Digital trading card front + back",
      "High-resolution JPG + print-ready PDF",
      "Social graphics + phone wallpaper",
      "One revision",
      "Photo-quality review before payment",
    ],
    badge: null,
    cta: "Request Digital Edition",
  },
  {
    id: "signature",
    name: "Signature Collector Pack",
    price: "$199",
    badge: "Most Popular",
    summary: "The complete athlete experience—made for the wall, the collection, the phone, and the season.",
    features: [
      "18×24-inch premium semi-gloss poster",
      "18 double-sided 2.5×3.5-inch trading cards",
      "Premium 16 pt cardstock + square-cut corners",
      "Complete matching digital artwork set",
      "One revision",
      "Contiguous US standard shipping",
    ],
    cta: "Request Signature Pack",
  },
  {
    id: "all-star",
    name: "All-Star Cinematic Pack",
    price: "$299",
    badge: "Complete Experience",
    summary: "The complete physical and digital collection, finished with a cinematic athlete reveal.",
    features: [
      "Everything in the Signature Collector Pack",
      "Larger 24×36-inch premium poster",
      "18 double-sided trading cards",
      "10–15 second vertical cinematic reveal",
      "Reel-ready 1080×1920 MP4",
      "One minor video text correction",
      "Contiguous US standard shipping",
    ],
    cta: "Request All-Star Pack",
  },
] as const;

export const addOns = [
  ["Additional 18×24 poster", "+$39", "Same approved design and shipping address."],
  ["Additional 24×36 poster", "+$59", "Same approved design and shipping address."],
  ["Extra pack of 18 cards", "+$39", "Same athlete and approved card design."],
  ["Second design direction", "+$69", "A second concept from the same athlete photos."],
  ["Cinematic Reveal upgrade", "+$99", "Add the 10–15 second vertical reveal to Digital or Signature."],
  ["Priority production", "+$39", "Offered only when studio capacity allows."],
] as const;

export const faqItems = [
  ["Is this an instant AI generator?", "No. Every accepted project is personally reviewed and custom-finished. AI may assist parts of the creative process, but the final composition, likeness, text, colors, and details receive human quality control."],
  ["Do I pay when I submit the form?", "No. We review your photos first. If the project is a good fit, we email confirmation and a secure Stripe payment link."],
  ["How many photos should I upload?", "Upload 3–5 of the clearest photos available. A mix of close-up, upper-body, and action images gives us the most flexibility."],
  ["What if my photos are not good enough?", "We will tell you before payment and ask whether you have stronger alternatives. You will not be charged for a project we cannot confidently create."],
  ["Will the final artwork look like the athlete?", "Preserving recognizable likeness is a priority. We use real photos as the foundation and avoid turning the athlete into a generic character. Final results still depend on the quality and angle of the uploaded images."],
  ["Can you use our team colors?", "Yes. Add the team colors in the request form. You may also upload a uniform photo for reference."],
  ["Can you include a team logo?", "We can review customer-provided team assets when the customer has permission to use them. We do not provide or recreate protected professional-team, league, school, or brand logos without authorization."],
  ["How long does it take?", "Photo review usually takes up to 24 hours. After payment, the first proof is typically delivered within 2 business days. Team and complex projects may require more time."],
  ["Are revisions included?", "One revision is included for reasonable adjustments to text, color, crop, or composition. A completely new concept or replacement photo set may require an additional fee."],
  ["Do I receive a real printed poster?", "Yes. The Signature Collector Pack includes one physical 18×24-inch poster. The All-Star Cinematic Pack includes a larger 24×36-inch poster. Your poster is printed only after you approve the final artwork."],
  ["Are the trading cards real physical cards?", "Yes. Physical packages include 18 double-sided personalized trading cards printed at standard 2.5×3.5-inch collector-card size with premium 16 pt cardstock and square-cut corners."],
  ["Why are there 18 trading cards?", "A pack gives the athlete enough cards to keep, collect, and share with family, teammates, and coaches. Additional packs can be ordered using the same approved design."],
  ["Will everything arrive in one package?", "The poster and trading cards may be produced separately and can arrive in different packages. Tracking details are provided when available."],
  ["What is the Cinematic Athlete Reveal?", "It is a 10–15 second vertical athlete introduction created from the submitted photos and final artwork, with animated lighting, typography, team colors, trading-card motion, and a final poster reveal. It is not a game highlight video."],
  ["When will the physical products be printed?", "Printing begins only after you approve the final artwork. This prevents an unapproved or incorrect design from being printed."],
  ["Is shipping included?", "Standard shipping within the contiguous United States is included in the Signature Collector and All-Star Cinematic packages. Other locations may require an additional quote."],
  ["What files will I receive?", "Every package includes matching digital artwork. Deliverables may include high-resolution JPG, PNG, print-ready PDF, social graphics, phone wallpaper, and an MP4 cinematic reveal where included."],
  ["Will my athlete’s photos be posted publicly?", "Not unless you give separate permission. Submission consent allows us to create the private order; portfolio and marketing permission must be requested separately."],
  ["Can I order for an entire team?", "Yes. Select Team Order and enter the estimated number of athletes. We will reply with timing and a custom quote."],
] as const;
