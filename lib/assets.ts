// The site image map — the ONLY door for marketing imagery (DESIGN §6.1, CONTRACTS §4.9 / §5.9, GAPS #1 #3 #7).
//
// Every entry names a repo-relative source (most live in git-ignored roots and exist only on the owner's
// Mac), the public path `scripts/site-assets.ts` writes under `public/images/`, the intrinsic size of that
// output, its alt text (COPY §0.5 patterns) and a provenance status:
//   "verified" — the source was thumbnailed and checked (not Nia Brooks, no pack face, no count-bearing
//                certificate, no whole listing slide, square corners for `kind: "card"`, no number for the
//                numberless sports), converted, and the output audited (`npm run site:assets -- --check`).
//   "locate"   — nothing may be rendered for this key yet: pages render their text fallback (CONTRACTS §5.8).
// Components never import from `etsy/`, `marketing/` or `art-pipeline/` — only `asset(key)`.
//
// Conversion rules (scripts/site-assets.ts): sharp, never upscaled, WebP q82 (q88 for card faces), AVIF q55
// beside the LCP keys, sha256 denylist gate (scripts/denylist.json), the DESIGN §6.2 corner audit on every
// `card` asset without a `crop`, and the DESIGN §6.4 QR patch + decode assert on every back with a `cardId`.
// Several keys share one output on purpose (the same file is converted once and referenced under every key).

export type AssetStatus = "verified" | "locate";
export type AssetKind = "card" | "poster" | "photo" | "artefact" | "plate" | "room" | "sheet";
export type AssetCrop = "inset-5";

export interface SiteAsset {
  key: string;
  /** Public path under `/images/...` (the WebP). */
  out: string;
  /** Intrinsic pixel size of `out`. */
  width: number;
  height: number;
  alt: string;
  status: AssetStatus;
  kind: AssetKind;
  /** Repo-relative source file; absent for keys that have no image by design. */
  source?: string;
  /** Percent inset applied before resize (GAPS #3 — corner audit skipped, display ≤ 240 px). */
  crop?: AssetCrop;
  /** The image depicts a fictional roster athlete → the page mounts <FictionalLabel /> (CONTRACTS §0.2-6). */
  fictional?: boolean;
  /** Card backs only: the printed QR is replaced by public/cards/qr/<cardId>.png and decode-asserted (DESIGN §6.4). */
  cardId?: string;
  /** Largest-contentful-paint candidates also get an AVIF sibling (`out` with .avif). */
  lcp?: boolean;
  /** Why the key is still `locate`, or a provenance remark. */
  note?: string;
}

export interface ImageSpec {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** AVIF sibling path for LCP keys (same size); undefined otherwise. */
  avif?: string;
  fictional: boolean;
}

/* ---------- sources (repo-relative) ---------- */
const BK = "etsy/listing-images/01-basketball-card/src";
const FBC = "etsy/listing-images/01-football-card/src";
const FBP = "etsy/listing-images/02-football-poster/src";
const SNS = "etsy/listing-images/03-senior-night/src";
const APPROVED_BKB = "art-pipeline/out/approved/basketball";
const MARKETING = "marketing/cards";
const SHOTS = "art-pipeline/out/etsy-shots";
const SHOTS_SN = `${SHOTS}/senior-night`;

/* ---------- shared outputs ---------- */
const OUT_DEMO_FRONT = "/images/cards/basketball-trading-card-front-stadium-night.webp";
const OUT_DEMO_BACK = "/images/cards/basketball-trading-card-back-registered-stadium-night.webp";
const OUT_DEMO_POSTER = "/images/posters/basketball-poster-stadium-night.webp";
const OUT_PROOF = "/images/how-it-works/watermarked-proof-baseball-senior-night.webp";
const OUT_PLATE = "/images/how-it-works/reference-plate-three-views-basketball.webp";
const OUT_SR_FRONT = "/images/senior-night/basketball-trading-card-front-senior-night.webp";
const OUT_SR_BADGE = "/images/senior-night/senior-night-badge.webp";
const OUT_SFB_SR_FRONT = "/images/senior-night/softball-trading-card-front-senior-night.webp";
const OUT_WRS_SR_FRONT = "/images/senior-night/wrestling-trading-card-front-senior-night.webp";
const OUT_CHR_PR_FRONT = "/images/sports/cheerleading-trading-card-front-prism-rush.webp";
const OUT_BEFORE_BKB = "/images/home/phone-photo-basketball-player-before.webp";
const OUT_BEFORE_FTB = "/images/home/phone-photo-football-player-before.webp";
const OUT_FTB_FS_FRONT = "/images/sports/football-trading-card-front-fire-and-smoke.webp";
const OUT_FTB_FS_POSTER = "/images/posters/football-poster-fire-and-smoke.webp";
const OUT_ROOM_SN = "/images/posters/poster-in-room-stadium-night.webp";
const BKP_ROOM_SN = "etsy/listing-images/02-basketball-poster/room-SN.png";

/* ---------- alt helpers (COPY §0.5) ---------- */
const altFront = (sport: string, finish: string) =>
  `Custom ${sport} trading card front — ${finish} finish — example artwork, fictional athlete`;
const altBack = (sport: string, finish: string) =>
  `Custom ${sport} trading card back with season stats, registered card ID and QR code — ${finish} finish — example artwork, fictional athlete`;
const altPoster = (sport: string, finish: string) =>
  `Custom ${sport} poster, 18 × 24 in — ${finish} finish — example artwork, fictional athlete`;

const CARD = { width: 750, height: 1050 } as const; // 750 × 1050 sources, never upscaled
const TILE_CROP = { width: 480, height: 672 } as const; // GAPS #3 inset tiles, ≤ 240 px display
const POSTER = { width: 1200, height: 1600 } as const; // 1296 × 1728 sources (3 : 4)
const SHOT = { width: 600, height: 894 } as const; // 1696 × 2528 pose frames
const TAKE = { width: 900, height: 1342 } as const; // the rejected / approved pair
const PLATE = { width: 1600, height: 1195 } as const; // 2400 × 1792 identity plates

type Entry = Omit<SiteAsset, "key">;

const entries: Record<string, Entry> = {
  /* ---------- / hero (GAPS #1: the after composite is CODE — three faces from square sources) ---------- */
  "home.hero.before": {
    out: OUT_BEFORE_BKB,
    source: "art-pipeline/out/athletes/basketball/before/photo2.png",
    width: 960, height: 1286, kind: "photo", fictional: true, status: "verified",
    alt: "Phone photo of a fictional basketball player — the starting point; photo generated",
    note: "Same athlete as the GAPS #1 after composite (Marcus, basketball) — in the gym, in the jersey the card shows. DESIGN §10.3 named the football sideline photo; that file is `home.hero.before.football`.",
  },
  "home.hero.before.football": {
    out: OUT_BEFORE_FTB,
    source: "etsy/listing-images/01-football-card/src/s02-before-b.png",
    width: 960, height: 1211, kind: "photo", fictional: true, status: "verified",
    alt: "Phone photo of a fictional football player on the sideline — the starting point; photo generated",
    note: "DESIGN §10.3 source (Tui, sled push at dusk). Use only with a football after-composite.",
  },
  "home.hero.after.front": {
    out: OUT_DEMO_FRONT, source: `${BK}/BK-SN-card-FRONT.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", lcp: true, alt: altFront("basketball", "Stadium Night"),
  },
  "home.hero.after.back": {
    out: OUT_DEMO_BACK, source: `${BK}/BK-SN-card-BACK.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", cardId: "GDE-SN-BKB-2026-12", alt: altBack("basketball", "Stadium Night"),
  },
  "home.hero.after.poster": {
    out: OUT_DEMO_POSTER, source: "etsy/listing-images/04-complete-set/src/marcus-sn-poster.png", ...POSTER,
    kind: "poster", fictional: true, status: "verified", lcp: true, alt: altPoster("basketball", "Stadium Night"),
  },
  "home.hero.after": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Replaced by home.hero.after.front | .back | .poster (GAPS #1) — never a flat composite image.",
  },

  /* ---------- the demo pair every page may show (DESIGN §6.3) ---------- */
  "cards.demo.front": {
    out: OUT_DEMO_FRONT, source: `${BK}/BK-SN-card-FRONT.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", lcp: true, alt: altFront("basketball", "Stadium Night"),
  },
  "cards.demo.back": {
    out: OUT_DEMO_BACK, source: `${BK}/BK-SN-card-BACK.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", cardId: "GDE-SN-BKB-2026-12", alt: altBack("basketball", "Stadium Night"),
  },
  "home.qr-ring": {
    out: OUT_DEMO_BACK, source: `${BK}/BK-SN-card-BACK.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", cardId: "GDE-SN-BKB-2026-12",
    alt: "Back of a custom basketball trading card with the QR code ringed — Stadium Night finish — example artwork, fictional athlete",
    note: "The ring is drawn in CSS (QrRing) over the QR-patched back; the constant is measured from this file.",
  },

  /* ---------- proof and process (DESIGN §6.7) ---------- */
  "home.proof": {
    out: OUT_PROOF, source: `${SNS}/bsb-sr-proof.png`, width: 1400, height: 1092, kind: "artefact",
    fictional: true, status: "verified",
    alt: "Watermarked proof of a custom baseball card — Senior Night finish — example, fictional athlete",
  },
  "home.process.intake": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "Photo-check verdict as the parent reads it — example order",
    note: "No image by design: the verdict card is an HTML Ledger typeset from COPY (DESIGN §5.1-08); never a frame from _intake.json.",
  },
  "home.process.plate": {
    out: OUT_PLATE, source: `${APPROVED_BKB}/_identity.png`, ...PLATE, kind: "plate", fictional: true, status: "verified",
    alt: "Reference plate: three views of a fictional athlete built from their photos",
  },
  "home.process.proof": {
    out: OUT_PROOF, source: `${SNS}/bsb-sr-proof.png`, width: 1400, height: 1092, kind: "artefact",
    fictional: true, status: "verified",
    alt: "Watermarked proof of a custom baseball card — Senior Night finish — example, fictional athlete",
  },
  "home.rejected.fail": {
    out: "/images/how-it-works/rejected-take-ice-hockey.webp",
    source: "art-pipeline/out/athletes/ice-hockey/_versions/action2-1.png", ...TAKE, kind: "artefact",
    fictional: true, status: "verified",
    alt: "Rejected take from the ice-hockey pilot — the jersey changed between shots: solid navy with a red hem — fictional athlete",
  },
  "home.rejected.pass": {
    out: "/images/how-it-works/approved-take-ice-hockey.webp",
    source: "art-pipeline/out/athletes/ice-hockey/action2.png", ...TAKE, kind: "artefact",
    fictional: true, status: "verified",
    alt: "Approved take from the ice-hockey pilot — the same athlete in the kit-plate jersey, red shoulders and sleeves — fictional athlete",
  },

  /* ---------- six finishes, one athlete (Marcus) + the Senior Night tile ---------- */
  "finish.SN.front": {
    out: OUT_DEMO_FRONT, source: `${BK}/BK-SN-card-FRONT.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    alt: altFront("basketball", "Stadium Night"),
  },
  "finish.CA.front": {
    out: "/images/finishes/basketball-trading-card-front-chrome-all-star.webp", source: `${BK}/BK-CA-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("basketball", "Chrome All-Star"),
  },
  "finish.FS.front": {
    out: "/images/finishes/basketball-trading-card-front-fire-and-smoke.webp", source: `${BK}/BK-FS-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("basketball", "Fire & Smoke"),
  },
  "finish.HE.front": {
    out: "/images/finishes/basketball-trading-card-front-heritage.webp", source: `${BK}/BK-HE-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("basketball", "Heritage"),
  },
  "finish.SS.front": {
    out: "/images/finishes/basketball-trading-card-front-signature-spotlight.webp", source: `${BK}/BK-SS-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("basketball", "Signature Spotlight"),
  },
  "finish.PR.front": {
    out: "/images/finishes/basketball-trading-card-front-prism-rush.webp", source: `${BK}/BK-PR-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("basketball", "Prism Rush"),
  },
  "finish.SR.tile": {
    out: OUT_SR_FRONT, source: `${SNS}/sr-card-front.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    alt: altFront("basketball", "Senior Night"),
  },

  /* ---------- seventeen sports (GAPS #3: square listing fronts first, inset tiles for the rest) ---------- */
  "sport.basketball.front": {
    out: OUT_DEMO_FRONT, source: `${BK}/BK-SN-card-FRONT.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    alt: altFront("basketball", "Stadium Night"),
  },
  "sport.football.front": {
    out: OUT_FTB_FS_FRONT,
    source: `${FBC}/FB-FS-front.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", alt: altFront("football", "Fire & Smoke"),
  },
  "sport.baseball.front": {
    out: "/images/sports/baseball-trading-card-front-heritage.webp",
    source: "etsy/listing-images/01-baseball-card/src/BB-HE-front.png", ...CARD, kind: "card", fictional: true,
    status: "verified", alt: altFront("baseball", "Heritage"),
  },
  "sport.softball.front": {
    out: OUT_SFB_SR_FRONT, source: `${SNS}/sfb-sr-front.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    alt: altFront("softball", "Senior Night"),
  },
  "sport.soccer.front": {
    out: "/images/sports/soccer-trading-card-front-chrome-all-star.webp",
    source: "etsy/listing-images/01-soccer-card/src/SC-CA-front.png", ...CARD, kind: "card", fictional: true,
    status: "verified", alt: altFront("soccer", "Chrome All-Star"),
  },
  "sport.ice-hockey.front": {
    out: "/images/sports/ice-hockey-trading-card-front-stadium-night.webp", source: `${MARKETING}/ice-hockey-front.png`,
    ...TILE_CROP, kind: "card", crop: "inset-5", fictional: true, status: "verified", alt: altFront("ice hockey", "Stadium Night"),
  },
  "sport.volleyball.front": {
    out: "/images/sports/volleyball-trading-card-front-signature-spotlight.webp",
    source: "etsy/listing-images/01-volleyball-card/src/VB-SS-front.png", ...CARD, kind: "card", fictional: true,
    status: "verified", alt: altFront("volleyball", "Signature Spotlight"),
  },
  "sport.lacrosse.front": {
    out: "/images/sports/lacrosse-trading-card-front-stadium-night.webp", source: `${MARKETING}/lacrosse-front.png`,
    ...TILE_CROP, kind: "card", crop: "inset-5", fictional: true, status: "verified", alt: altFront("lacrosse", "Stadium Night"),
  },
  "sport.wrestling.front": {
    out: OUT_WRS_SR_FRONT, source: `${SNS}/wrs-sr-front.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    alt: altFront("wrestling", "Senior Night"),
  },
  "sport.cheerleading.front": {
    out: OUT_CHR_PR_FRONT, source: "etsy/listing-images/01-cheerleading-card/src/CH-PR-front.png", ...CARD,
    kind: "card", fictional: true, status: "verified", alt: altFront("cheerleading", "Prism Rush"),
  },
  "sport.gymnastics.front": {
    out: "/images/sports/gymnastics-trading-card-front-stadium-night.webp", source: `${MARKETING}/gymnastics-front.png`,
    ...TILE_CROP, kind: "card", crop: "inset-5", fictional: true, status: "verified", alt: altFront("gymnastics", "Stadium Night"),
  },
  "sport.track-field.front": {
    out: "/images/sports/track-and-field-trading-card-front-stadium-night.webp", source: `${MARKETING}/track-field-front.png`,
    ...TILE_CROP, kind: "card", crop: "inset-5", fictional: true, status: "verified", alt: altFront("track & field", "Stadium Night"),
  },
  "sport.swimming.front": {
    out: "/images/sports/swimming-trading-card-front-stadium-night.webp", source: `${MARKETING}/swimming-front.png`,
    ...TILE_CROP, kind: "card", crop: "inset-5", fictional: true, status: "verified", alt: altFront("swimming", "Stadium Night"),
  },
  "sport.tennis.front": {
    out: "/images/sports/tennis-trading-card-front-stadium-night.webp", source: `${MARKETING}/tennis-front.png`,
    ...TILE_CROP, kind: "card", crop: "inset-5", fictional: true, status: "verified", alt: altFront("tennis", "Stadium Night"),
  },
  "sport.golf.front": {
    out: "/images/sports/golf-trading-card-front-stadium-night.webp", source: `${MARKETING}/golf-front.png`,
    ...TILE_CROP, kind: "card", crop: "inset-5", fictional: true, status: "verified", alt: altFront("golf", "Stadium Night"),
  },
  "sport.pickleball.front": {
    out: "", width: 0, height: 0, kind: "card", status: "locate", alt: altFront("pickleball", "Stadium Night"),
    note: "No card export exists for pickleball (RENDERS §1) — text tile until the sport file is exported and audited.",
  },
  "sport.other-sport.front": {
    out: "", width: 0, height: 0, kind: "card", status: "locate", alt: altFront("skateboarding", "Stadium Night"),
    note: "No card export exists for skateboarding (slug other-sport, RENDERS §1) — text tile until exported and audited.",
  },

  /* ---------- /trading-cards ---------- */
  "cards.front-back": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Removed (DESIGN §10.3): 02-front-back-registered.png is a whole listing slide and is denylisted; the pair is two CardFaces (cards.demo.front | .back).",
  },
  "cards.four-shots": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Removed (DESIGN §10.3): the four callouts are HTML discs over cards.demo.front.",
  },
  "cards.six-finishes": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Removed (DESIGN §10.3): the row is the finish.<CODE>.front tiles.",
  },
  "cards.cheer.front": {
    out: OUT_CHR_PR_FRONT, source: "etsy/listing-images/01-cheerleading-card/src/CH-PR-front.png", ...CARD,
    kind: "card", fictional: true, status: "verified", alt: altFront("cheerleading", "Prism Rush"),
  },
  "cards.cheer.back": {
    out: "/images/cards/cheerleading-trading-card-back-registered-prism-rush.webp",
    source: "etsy/listing-images/01-cheerleading-card/src/CH-PR-card-BACK.png", ...CARD, kind: "card",
    fictional: true, status: "verified", cardId: "GDE-PR-CHR-2026-01",
    alt: "Custom cheerleading trading card back with the athlete's name and club crest, registered card ID and QR code — Prism Rush finish — example artwork, fictional athlete",
  },

  /* ---------- /posters ---------- */
  "posters.room": {
    out: OUT_ROOM_SN, source: BKP_ROOM_SN,
    width: 1600, height: 1600, kind: "room", fictional: true, status: "verified", lcp: true,
    alt: "Custom basketball poster hung on a bedroom wall — Stadium Night finish — example artwork, fictional athlete",
  },
  "posters.scale": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Removed (DESIGN §10.3 / finding 9): the to-scale sheet is pure SVG (ToScaleSheet).",
  },
  "posters.pairs.sn-ca": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Listing pair slides are never shown whole (DESIGN §6.6); use posters.finish.<CODE> faces in 3 : 4 boxes.",
  },
  "posters.pairs.fs-he": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Listing pair slides are never shown whole (DESIGN §6.6); use posters.finish.<CODE> faces in 3 : 4 boxes.",
  },
  "posters.pairs.ss-pr": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Listing pair slides are never shown whole (DESIGN §6.6); use posters.finish.<CODE> faces in 3 : 4 boxes.",
  },
  "posters.finish.SN": {
    out: "/images/posters/football-poster-stadium-night.webp", source: "etsy/listing-images/02-football-poster/src/FB-SN-poster.png",
    ...POSTER, kind: "poster", fictional: true, status: "verified", alt: altPoster("football", "Stadium Night"),
  },
  "posters.finish.CA": {
    out: "/images/posters/football-poster-chrome-all-star.webp", source: "etsy/listing-images/02-football-poster/src/FB-CA-poster.png",
    ...POSTER, kind: "poster", fictional: true, status: "verified", alt: altPoster("football", "Chrome All-Star"),
  },
  "posters.finish.FS": {
    out: OUT_FTB_FS_POSTER, source: `${FBP}/FB-FS-poster.png`,
    ...POSTER, kind: "poster", fictional: true, status: "verified", alt: altPoster("football", "Fire & Smoke"),
  },
  "posters.finish.HE": {
    out: "/images/posters/football-poster-heritage.webp", source: "etsy/listing-images/02-football-poster/src/FB-HE-poster.png",
    ...POSTER, kind: "poster", fictional: true, status: "verified", alt: altPoster("football", "Heritage"),
  },
  "posters.finish.SS": {
    out: "/images/posters/football-poster-signature-spotlight.webp", source: "etsy/listing-images/02-football-poster/src/FB-SS-poster.png",
    ...POSTER, kind: "poster", fictional: true, status: "verified", alt: altPoster("football", "Signature Spotlight"),
  },
  "posters.finish.PR": {
    out: "/images/posters/football-poster-prism-rush.webp", source: "etsy/listing-images/02-football-poster/src/FB-PR-poster.png",
    ...POSTER, kind: "poster", fictional: true, status: "verified", alt: altPoster("football", "Prism Rush"),
  },

  /* ---------- /complete-set (GAPS #1, #10, #34) ---------- */
  "set.hero": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Replaced by set.hero.front | .back | .poster (GAPS #1) — the cluster is composed in code.",
  },
  "set.hero.front": {
    out: OUT_DEMO_FRONT, source: `${BK}/BK-SN-card-FRONT.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", lcp: true, alt: altFront("basketball", "Stadium Night"),
  },
  "set.hero.back": {
    out: OUT_DEMO_BACK, source: `${BK}/BK-SN-card-BACK.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", cardId: "GDE-SN-BKB-2026-12", alt: altBack("basketball", "Stadium Night"),
  },
  "set.hero.poster": {
    out: OUT_DEMO_POSTER, source: "etsy/listing-images/04-complete-set/src/marcus-sn-poster.png", ...POSTER,
    kind: "poster", fictional: true, status: "verified", lcp: true, alt: altPoster("basketball", "Stadium Night"),
  },
  "set.counted": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Removed (GAPS #10): the everything-counted section is a Ledger, never the 19-everything-counted slide.",
  },
  "set.tile.printed": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Not used (GAPS #34): 04-complete-set/v3/tile-printed.jpg carries a count-bearing pack face and is denylisted.",
  },

  /* ---------- /senior-night (GAPS #7, #17, #32) ---------- */
  "sn.hero": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Never the 03-senior-night/01-hero.png slide (baked pill text; denylisted). Composed from sn.hero.poster | .front | .back | .badge (GAPS #7).",
  },
  "sn.hero.poster": {
    out: "/images/senior-night/basketball-poster-senior-night.webp", source: `${SNS}/sr-poster.png`, ...POSTER,
    kind: "poster", fictional: true, status: "verified", lcp: true, alt: altPoster("basketball", "Senior Night"),
  },
  "sn.hero.front": {
    out: OUT_SR_FRONT, source: `${SNS}/sr-card-front.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    alt: altFront("basketball", "Senior Night"),
  },
  "sn.hero.back": {
    out: "/images/senior-night/basketball-trading-card-back-senior-night.webp", source: `${SNS}/sr-card-back.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", cardId: "GDE-SR-BKB-2026-12",
    alt: "Custom basketball trading card back with the class year, career line, registered card ID and QR code — Senior Night finish — example artwork, fictional athlete",
  },
  "sn.hero.badge": {
    out: OUT_SR_BADGE, source: `${SNS}/bsb-sr-badge.png`, width: 800, height: 800, kind: "artefact",
    fictional: true, status: "verified", alt: "Senior Night edition badge — example artwork, fictional athlete",
    note: "The only badge export is the baseball athlete's (a large 7 and CLASS OF 2026). Beside the basketball cluster (a 12) it contradicts the card — pair it with sn.hero.baseball.* or leave it out.",
  },
  "sn.hero.baseball.poster": {
    out: "/images/senior-night/baseball-poster-senior-night.webp", source: `${SNS}/bsb-sr-poster.png`, ...POSTER,
    kind: "poster", fictional: true, status: "verified", lcp: true, alt: altPoster("baseball", "Senior Night"),
    note: "GAPS #7 second choice: a cluster whose badge, poster, front (sn.sport.baseball.front) and back (sn.back) are one athlete.",
  },
  "sn.back": {
    out: "/images/senior-night/baseball-trading-card-back-class-year-senior-night.webp", source: `${SNS}/bsb-sr-back.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", cardId: "GDE-SR-BSB-2026-07",
    alt: "Custom baseball trading card back with the class year, career line, registered card ID and QR code — Senior Night finish — example artwork, fictional athlete",
  },
  "sn.cert": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate",
    alt: "Printed Certificate of Authenticity for a Game Day Edition card — example, fictional athlete",
    note: "Not shown in F1 (GAPS #32): the SR certificate prints wording the owner has not signed off; the section is text only.",
  },
  "sn.badge": {
    out: OUT_SR_BADGE, source: `${SNS}/bsb-sr-badge.png`, width: 800, height: 800, kind: "artefact",
    fictional: true, status: "verified", alt: "Senior Night edition badge — example artwork, fictional athlete",
  },
  "sn.sticker": {
    out: "/images/senior-night/senior-night-sticker.webp", source: `${SNS}/bsb-sr-sticker.png`, width: 1300, height: 640,
    kind: "artefact", fictional: true, status: "verified", alt: "Senior Night edition sticker — example artwork, fictional athlete",
  },
  "sn.sport.basketball.front": {
    out: OUT_SR_FRONT, source: `${SNS}/sr-card-front.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    alt: altFront("basketball", "Senior Night"),
  },
  "sn.sport.football.front": {
    out: "/images/senior-night/football-trading-card-front-senior-night.webp", source: `${SNS}/ftb-sr-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("football", "Senior Night"),
  },
  "sn.sport.volleyball.front": {
    out: "/images/senior-night/volleyball-trading-card-front-senior-night.webp", source: `${SNS}/vbl-sr-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("volleyball", "Senior Night"),
  },
  "sn.sport.cheerleading.front": {
    out: "/images/senior-night/cheerleading-trading-card-front-senior-night.webp", source: `${SNS}/chr-sr-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("cheerleading", "Senior Night"),
  },
  "sn.sport.soccer.front": {
    out: "/images/senior-night/soccer-trading-card-front-senior-night.webp", source: `${SNS}/soc-sr-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("soccer", "Senior Night"),
  },
  "sn.sport.baseball.front": {
    out: "/images/senior-night/baseball-trading-card-front-senior-night.webp", source: `${SNS}/bsb-sr-front.png`,
    ...CARD, kind: "card", fictional: true, status: "verified", alt: altFront("baseball", "Senior Night"),
  },
  "sn.sport.softball.front": {
    out: OUT_SFB_SR_FRONT, source: `${SNS}/sfb-sr-front.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    alt: altFront("softball", "Senior Night"),
  },
  "sn.sport.wrestling.front": {
    out: OUT_WRS_SR_FRONT, source: `${SNS}/wrs-sr-front.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    alt: altFront("wrestling", "Senior Night"),
  },
  "sn.sport.ice-hockey.front": {
    out: "", width: 0, height: 0, kind: "card", status: "locate", alt: altFront("ice hockey", "Senior Night"),
    note: "No Senior Night ice-hockey front exists (DESIGN finding 11) — navy text tile → /go/etsy/GDE-ANY-SNSET (GAPS #17).",
  },

  /* ---------- /how-it-works gates (DESIGN §5.4) ---------- */
  "how.gate.photo-check": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "Photo-check verdict as the parent reads it — example order",
    note: "No image by design: gate 1 is the HTML verdict card (Ledger with StatusChips).",
  },
  "how.gate.kit": {
    out: "/images/how-it-works/kit-plate-front-basketball.webp", source: `${APPROVED_BKB}/_kit.png`, width: 1200, height: 1200,
    kind: "plate", fictional: true, status: "verified",
    alt: "Kit plate, front: the fictional athlete's jersey, shorts and crest copied from their photos",
  },
  "how.gate.kit-back": {
    out: "/images/how-it-works/kit-plate-back-basketball.webp", source: `${APPROVED_BKB}/_kit-back.png`, width: 1200, height: 1200,
    kind: "plate", fictional: true, status: "verified",
    alt: "Kit plate, back: the fictional athlete's jersey from behind, number and crest as photographed",
  },
  "how.gate.plate": {
    out: OUT_PLATE, source: `${APPROVED_BKB}/_identity.png`, ...PLATE, kind: "plate", fictional: true, status: "verified",
    alt: "Reference plate: three views of a fictional athlete built from their photos",
  },
  "how.gate.plate-back": {
    out: "/images/how-it-works/reference-plate-back-basketball.webp", source: `${APPROVED_BKB}/_identity-back.png`, ...PLATE,
    kind: "plate", fictional: true, status: "verified",
    alt: "Reference plate, from behind: the fictional athlete's back view built from their photos",
  },
  "how.gate.shots": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", alt: "",
    note: "Replaced by how.gate.shots.1–4 (DESIGN §10.3) — four frames in a grid, never a contact sheet.",
  },
  "how.gate.shots.1": {
    out: "/images/how-it-works/shot-1-hero-basketball.webp", source: `${APPROVED_BKB}/hero.png`, ...SHOT, kind: "artefact",
    fictional: true, status: "verified", alt: "Shot 1 of 4: the hero frame of a fictional basketball player, built from the reference plate",
  },
  "how.gate.shots.2": {
    out: "/images/how-it-works/shot-2-action-basketball.webp", source: `${APPROVED_BKB}/action2.png`, ...SHOT, kind: "artefact",
    fictional: true, status: "verified", alt: "Shot 2 of 4: an action frame of the same fictional basketball player",
  },
  "how.gate.shots.3": {
    out: "/images/how-it-works/shot-3-action-basketball.webp", source: `${APPROVED_BKB}/action3.png`, ...SHOT, kind: "artefact",
    fictional: true, status: "verified", alt: "Shot 3 of 4: a second action frame of the same fictional basketball player",
  },
  "how.gate.shots.4": {
    out: "/images/how-it-works/shot-4-back-basketball.webp", source: `${APPROVED_BKB}/back.png`, ...SHOT, kind: "artefact",
    fictional: true, status: "verified", alt: "Shot 4 of 4: the same fictional basketball player from behind — the frame the card back is built from",
  },
  "how.gate.verification": {
    out: "/images/how-it-works/frame-beside-plate-wrestling.webp", source: "art-pipeline/out/athletes/wrestling/_diff/hero-vs-_kit.png",
    width: 1600, height: 948, kind: "sheet", fictional: true, status: "verified",
    alt: "Frame beside its reference plate — verification sheet, fictional athlete",
  },
  "how.gate.finish": {
    out: OUT_PROOF, source: `${SNS}/bsb-sr-proof.png`, width: 1400, height: 1092, kind: "artefact", fictional: true, status: "verified",
    alt: "Watermarked proof of a custom baseball card — Senior Night finish — example, fictional athlete",
  },

  /* ---------- /photo-guide, /about ---------- */
  "photo-guide.panels": {
    out: "/images/photo-guide/photo-check-examples.webp", source: "public/images/photo-guide.webp", width: 1536, height: 1024,
    kind: "sheet", fictional: true, status: "verified",
    alt: "Six example photos in a grid — three that carry the likeness and three that do not; photos generated, fictional athletes",
    note: "2 × 3 grid: top row pass, bottom row fail (GAPS #34).",
  },
  "about.founder": {
    out: "/images/about/john-birch-founder.webp", source: "public/brand/founder.jpg", width: 0, height: 0, kind: "photo",
    fictional: false, status: "locate", alt: "John Birch, designer and founder of Game Day Edition",
    note: "public/brand/founder.jpg is absent (DESIGN finding 10) — founder blocks render text-first with no reserved slot.",
  },

  /* ---------- home hero: three story scenes, three sports, one athlete per scene ----------
   * Owner brief 2026-09-07: the hero told one athlete's story (Marcus, basketball) on every page.
   * Each scene is FOUR files that belong to the SAME roster athlete — the parent's phone photo, the
   * card front, the card back and the poster — so a scene never mixes two people. `hero.story.<n>.athlete`
   * carries no image: its `alt` is the caption line (sport, finish, fictional roster athlete) and its
   * `note` names the athlete for the builder. Read it as SITE_ASSETS["hero.story.1.athlete"].alt —
   * `asset()` throws on it by design. Long edge ≤ 1200 px on every scene file; scene 1 carries AVIF.
   * There is NO adult scene: the only adult roster athletes (pickleball, the soccer age ladder) have no
   * card or poster export on disk, and the only adult card art that exists belongs to real orders, which
   * may never be written under public/. See docs/f1/INTEGRATION-NOTES.md "assets-hero-lifestyle".
   */
  "hero.story.1.athlete": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", fictional: true,
    alt: "Basketball — Stadium Night finish — a fictional roster athlete",
    note: "Caption metadata, no image. Scene 1 = Marcus Ellison, 17, guard, number 12, Cedar Ridge Bears. Card ID GDE-SN-BKB-2026-12.",
  },
  "hero.story.1.before": {
    out: OUT_BEFORE_BKB, source: "art-pipeline/out/athletes/basketball/before/photo2.png",
    width: 960, height: 1286, kind: "photo", fictional: true, status: "verified", lcp: true,
    alt: "The phone photo a parent sent: a fictional basketball player in the gym, in the jersey the card shows; photo generated",
    note: "Same file as home.hero.before — one download for both.",
  },
  "hero.story.1.card.front": {
    out: OUT_DEMO_FRONT, source: `${BK}/BK-SN-card-FRONT.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", lcp: true, alt: altFront("basketball", "Stadium Night"),
  },
  "hero.story.1.card.back": {
    out: OUT_DEMO_BACK, source: `${BK}/BK-SN-card-BACK.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", lcp: true, cardId: "GDE-SN-BKB-2026-12", alt: altBack("basketball", "Stadium Night"),
  },
  "hero.story.1.poster": {
    out: OUT_DEMO_POSTER, source: "etsy/listing-images/04-complete-set/src/marcus-sn-poster.png", ...POSTER,
    kind: "poster", fictional: true, status: "verified", lcp: true, alt: altPoster("basketball", "Stadium Night"),
  },

  "hero.story.2.athlete": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", fictional: true,
    alt: "Softball — Senior Night finish — a fictional roster athlete",
    note: "Caption metadata, no image. Scene 2 = Brooke Danner, 15, pitcher, number 3, Bell Hollow Wrens. Card ID GDE-SR-SFB-2026-03. She is the girl in the cast.",
  },
  "hero.story.2.before": {
    out: "/images/home/phone-photo-softball-player-before.webp",
    source: "art-pipeline/out/athletes/softball/before/photo2.png",
    width: 896, height: 1200, kind: "photo", fictional: true, status: "verified",
    alt: "The phone photo a parent sent: a fictional softball player at the field after a game, in the maroon uniform the card shows; photo generated",
  },
  "hero.story.2.card.front": {
    out: OUT_SFB_SR_FRONT, source: `${SNS}/sfb-sr-front.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", alt: altFront("softball", "Senior Night"),
  },
  "hero.story.2.card.back": {
    out: "/images/senior-night/softball-trading-card-back-registered-senior-night.webp",
    source: `${SNS}/sfb-sr-back.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    cardId: "GDE-SR-SFB-2026-03",
    alt: "Custom softball trading card back with career highs, the class year, registered card ID and QR code — Senior Night finish — example artwork, fictional athlete",
  },
  "hero.story.2.poster": {
    out: "/images/senior-night/softball-poster-senior-night.webp", source: `${SNS}/sfb-sr-poster.png`,
    width: 900, height: 1200, kind: "poster", fictional: true, status: "verified",
    alt: altPoster("softball", "Senior Night"),
  },

  "hero.story.3.athlete": {
    out: "", width: 0, height: 0, kind: "sheet", status: "locate", fictional: true,
    alt: "Football — Fire & Smoke finish — a fictional roster athlete",
    note: "Caption metadata, no image. Scene 3 = Tui Fa'agata, 18, offensive line, number 54, Millbrook Bison. Card ID GDE-FS-FTB-2026-54. Same athlete as the life.* photography.",
  },
  "hero.story.3.before": {
    out: OUT_BEFORE_FTB, source: `${FBC}/s02-before-b.png`,
    width: 960, height: 1211, kind: "photo", fictional: true, status: "verified",
    alt: "The phone photo a parent sent: a fictional football player pushing a sled at dusk; photo generated",
    note: "Same file as home.hero.before.football — one download for both.",
  },
  "hero.story.3.card.front": {
    out: OUT_FTB_FS_FRONT, source: `${FBC}/FB-FS-front.png`, ...CARD, kind: "card", fictional: true,
    status: "verified", alt: altFront("football", "Fire & Smoke"),
    note: "FB-FS-front.png and FB-FS-card-FRONT.png are byte-identical; the former is the name sport.football.front already uses.",
  },
  "hero.story.3.card.back": {
    out: "/images/cards/football-trading-card-back-registered-fire-and-smoke.webp",
    source: `${FBC}/FB-FS-card-BACK.png`, ...CARD, kind: "card", fictional: true, status: "verified",
    cardId: "GDE-FS-FTB-2026-54",
    alt: altBack("football", "Fire & Smoke"),
  },
  "hero.story.3.poster": {
    out: OUT_FTB_FS_POSTER, source: `${FBP}/FB-FS-poster.png`, ...POSTER, kind: "poster", fictional: true,
    status: "verified", alt: altPoster("football", "Fire & Smoke"),
    note: "Same file as posters.finish.FS — one download for both.",
  },

  /* ---------- lifestyle photography (owner brief 2026-09-07: the product in a life, not a flat render) ----------
   * Every source below was thumbnailed and looked at on 2026-09-07 before conversion. All show roster
   * athletes' art; none shows a pack face, a certificate, a card count, a person outside the roster, a blank
   * plate or baked marketing type. Long edge ≤ 1400 px. `kind` is never "card" here — these are photographs of
   * cards, so the 5 : 7 box and the corner audit do not apply to them (the CARD FACES they contain were audited
   * as their own keys). Rejected sources are listed in docs/f1/INTEGRATION-NOTES.md "assets-hero-lifestyle".
   */
  "life.card.desk": {
    out: "/images/life/football-trading-card-on-a-desk-senior-night.webp",
    source: `${SHOTS_SN}/card-on-desk-composited.png`, width: 1400, height: 1400, kind: "photo",
    fictional: true, status: "verified",
    alt: "A custom football trading card lying on a wooden desk beside a pen and a coin, for scale — Senior Night finish — example artwork, fictional athlete; photo generated",
  },
  "life.card.case": {
    out: "/images/life/football-trading-card-in-a-stand-senior-night.webp",
    source: `${SHOTS_SN}/card-in-case-composited.png`, width: 1400, height: 1400, kind: "photo",
    fictional: true, status: "verified",
    alt: "A custom football trading card standing in a clear display stand on a shelf beside a trophy — Senior Night finish — example artwork, fictional athlete; photo generated",
  },
  "life.card.binder": {
    out: "/images/life/football-trading-cards-in-a-binder-senior-night.webp",
    source: `${SHOTS_SN}/card-in-binder-composited.png`, width: 1400, height: 1400, kind: "photo",
    fictional: true, status: "verified",
    alt: "Three custom football trading cards in the sleeves of a collector's binder — Senior Night finish — example artwork, fictional athlete; photo generated",
  },
  "life.phone": {
    out: "/images/life/football-poster-art-on-a-phone-senior-night.webp",
    source: `${SHOTS_SN}/phone-in-hand-composited.png`, width: 1400, height: 1400, kind: "photo",
    fictional: true, status: "verified",
    alt: "Someone looking at their custom football artwork on a phone in a bedroom — Senior Night finish — example artwork, fictional athlete; photo generated",
  },
  "life.gift.moment": {
    out: "/images/life/family-with-a-framed-football-poster-senior-night.webp",
    source: `${SHOTS_SN}/gift-composited.png`, width: 1400, height: 1400, kind: "photo",
    fictional: true, status: "verified",
    alt: "A family on the court holding a framed custom football poster at a senior night ceremony — Senior Night finish — example artwork, fictional athlete; photo generated",
  },
  "life.card.hand": {
    out: "/images/life/basketball-trading-card-held-on-the-court.webp",
    source: "etsy/listing-images/01-basketball-card/02-card-in-hand.png", width: 1024, height: 1024,
    kind: "photo", fictional: true, status: "verified",
    alt: "A player holding up their custom basketball trading card in the gym — Stadium Night finish — example artwork, fictional athlete; photo generated",
  },
  "life.set.printed": {
    out: "/images/life/printed-set-basketball-poster-and-cards.webp",
    source: `${SHOTS}/complete-set/set-printed-real.png`, width: 1024, height: 1024, kind: "photo",
    fictional: true, status: "verified",
    alt: "A printed set laid out on a table: the custom basketball poster, the shipping tube and a fan of trading cards — Stadium Night finish — example artwork, fictional athlete; photo generated",
  },
  "life.set.deluxe": {
    out: "/images/life/deluxe-set-basketball-poster-and-cards.webp",
    source: `${SHOTS}/complete-set/set-deluxe-real.png`, width: 1024, height: 1024, kind: "photo",
    fictional: true, status: "verified",
    alt: "A larger printed set laid out on a table: the custom basketball poster, the shipping tube and rows of trading cards — Stadium Night finish — example artwork, fictional athlete; photo generated",
  },
  "life.poster.room": {
    out: OUT_ROOM_SN, source: BKP_ROOM_SN, width: 1600, height: 1600, kind: "room", fictional: true,
    status: "verified", lcp: true,
    alt: "A framed custom basketball poster on a bedroom wall above a desk — Stadium Night finish — example artwork, fictional athlete; photo generated",
    note: "Same file as posters.room (1600 px, 129 KB) — reused rather than re-encoded at 1400 so the page reuses one download.",
  },
  "life.poster.room.wide": {
    out: "/images/life/three-framed-basketball-posters-in-a-room.webp",
    source: "etsy/listing-images/02-basketball-poster/03-room.png", width: 1400, height: 1400, kind: "room",
    fictional: true, status: "verified",
    alt: "Three framed custom basketball posters on a wall while the athlete ties his shoes below them — example artwork, fictional athlete; photo generated",
  },
  "life.poster.room.baseball": {
    out: "/images/life/framed-baseball-poster-in-a-bedroom.webp",
    source: `${SHOTS}/packages/lifeart-baseball.png`, width: 1024, height: 1024, kind: "room",
    fictional: true, status: "verified",
    alt: "A framed custom baseball poster on a bedroom wall while the athlete sits below it with his glove — example artwork, fictional athlete; photo generated",
    note: "A different sport and a different athlete from life.poster.room on purpose (owner brief 2026-09-07).",
  },
  "life.team.order": {
    out: "/images/life/team-order-softball-posters-and-cards.webp",
    source: `${SHOTS}/senior-night-softball/team-order-staged-composited.png`, width: 1400, height: 1400,
    kind: "photo", fictional: true, status: "verified",
    alt: "A team order staged on a table: six custom softball posters, six shipping tubes, six stacks of trading cards and the box they ship in — Senior Night finish — example artwork, fictional athlete; photo generated",
  },
  "life.team.order.baseball": {
    out: "/images/life/team-order-baseball-posters-and-cards.webp",
    source: `${SHOTS}/senior-night-baseball/team-order-staged-composited.png`, width: 1400, height: 1400,
    kind: "photo", fictional: true, status: "verified",
    alt: "A team order staged on a table: six custom baseball posters, six shipping tubes, six stacks of trading cards and the box they ship in — Senior Night finish — example artwork, fictional athlete; photo generated",
  },
};

export const SITE_ASSETS: Record<string, SiteAsset> = Object.fromEntries(
  Object.entries(entries).map(([key, e]) => [key, { key, ...e }]),
);

export const SITE_ASSET_KEYS: readonly string[] = Object.keys(SITE_ASSETS);

/** True when the key exists and its file has been produced and audited. */
export function hasAsset(key: string): boolean {
  const a = SITE_ASSETS[key];
  return Boolean(a && a.status === "verified" && a.out);
}

function toSpec(a: SiteAsset): ImageSpec {
  return {
    src: a.out,
    alt: a.alt,
    width: a.width,
    height: a.height,
    avif: a.lcp ? a.out.replace(/\.webp$/, ".avif") : undefined,
    fictional: Boolean(a.fictional),
  };
}

/**
 * The image spec for `<Image src alt width height>`. Throws on an unknown key, and on a key that is still
 * `locate` — a page that may show nothing for a key branches on `hasAsset()` / `assetOrNull()` first.
 */
export function asset(key: string): ImageSpec {
  const a = SITE_ASSETS[key];
  if (!a) throw new Error(`SITE_ASSETS: unknown key "${key}"`);
  if (a.status !== "verified" || !a.out) {
    throw new Error(`SITE_ASSETS: "${key}" is not verified yet${a.note ? ` — ${a.note}` : ""}; render the text fallback (hasAsset/assetOrNull).`);
  }
  return toSpec(a);
}

/** Same as `asset()` for verified keys; `null` for a known `locate` key. Still throws on an unknown key. */
export function assetOrNull(key: string): ImageSpec | null {
  const a = SITE_ASSETS[key];
  if (!a) throw new Error(`SITE_ASSETS: unknown key "${key}"`);
  return a.status === "verified" && a.out ? toSpec(a) : null;
}

/** Every distinct output path (several keys may share one file). */
export function assetOutputs(): string[] {
  return Array.from(new Set(Object.values(SITE_ASSETS).map((a) => a.out).filter(Boolean)));
}
