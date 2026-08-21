// Club crests — one per sport, seventeen in all.
//
// THREE RULES, ALL LOAD-BEARING
//
// 1. THE DEMO CRESTS ARE OURS. Invented clubs drawn in-house, never a real team's mark.
//    Real school and club logos are third-party trademarks; putting one on a product we
//    sell — or scraping one off the web by team name and printing it — is a legal problem,
//    not a technical one. For a real order the customer UPLOADS their own logo and affirms
//    they may use it; an automatic name->logo lookup may only ever SUGGEST a candidate for
//    a human to confirm.
//
// 2. THE CRESTS ARE WORDLESS. Image models mangle letterforms — a crest carrying the club
//    name comes back as "NORTHCATE IRONHAWNS" and the whole pose has to be re-rolled. Club
//    names live in the Figma layout as type, where they are correct by construction. This
//    one decision removes the single most reliable failure in the pipeline.
//
// 3. ONE IDEA PER CREST, AND EVERY SILHOUETTE DIFFERENT. These are read at roughly 90 px
//    on a chest. Detail disappears; outline shape and one bold figure are all that survive.
//    The shapes are deliberately spread across shield / circle / diamond / hexagon /
//    octagon so that two crests never read as the same badge in a grid.

export interface Crest {
  slug: string;
  team: string;
  /** The outline the mark sits in. */
  shape: string;
  /** The one mark inside it. */
  motif: string;
  primaryColor: string;
  secondaryColor: string;
}

export const CRESTS: Crest[] = [
  {
    slug: "cedar-ridge-bears", team: "Cedar Ridge Bears",
    // Basketball is the core sport, so this mark carries the cleanest colourway on the
    // roster: one deep blue and white, nothing else. The shape is a pentagon because every
    // other silhouette was taken — and because the old Comets circle duplicated
    // pinewick-osprey's, which rule 3 at the top of this file forbids.
    shape: "a pentagon standing on a flat base, with a heavy border",
    // The bison at millbrook-bison is the nearest neighbour in the grid, so the two are kept
    // apart on the things that survive at 90 px: this one has small round ears and no horns,
    // no shoulders below it, and a completely different colourway.
    motif: "a bear head seen head-on in heavy blocky planes, small round ears set wide apart on top, a broad square muzzle — no horns, no shoulders, nothing else inside the shape",
    primaryColor: "#12356B", secondaryColor: "#FFFFFF",
  },
  {
    slug: "millbrook-bison", team: "Millbrook Bison",
    shape: "a rounded shield with a thick border",
    motif: "a bison head seen head-on in heavy blocky shapes, horns curving out to both sides, hunched shoulders below it",
    primaryColor: "#14532D", secondaryColor: "#F2E8CF",
  },
  {
    slug: "harlow-creek-larks", team: "Harlow Creek Larks",
    shape: "a diamond standing on one point, with a narrow border",
    motif: "a lark in flight seen from the side, wings swept back into two hard angular planes",
    primaryColor: "#B5451B", secondaryColor: "#F0E3D2",
  },
  {
    slug: "bell-hollow-wrens", team: "Bell Hollow Wrens",
    shape: "a square with rounded corners and a double border",
    motif: "a wren perched in profile facing right, tail cocked sharply upward, drawn as three or four solid shapes",
    primaryColor: "#7A1F2B", secondaryColor: "#C9CBCC",
  },
  {
    slug: "sunfield-kestrels", team: "Sunfield Kestrels",
    shape: "a pointed shield with a flat top",
    // The first version added "one hard diagonal stripe running down from the eye" and the
    // model drew it as a bar across the whole shield — which, next to a hooked beak, reads as
    // a PICKAXE. The audit called it that, correctly, and three re-rolls could not fix a mark
    // that was genuinely ambiguous. Rule 3 at the top of this file exists for exactly this:
    // ONE idea per crest. The stripe was a second one and it ate the first.
    motif: "a kestrel head in profile facing right, filling the shield — hooked beak, one round eye, a few angular feather planes on the crown. NO bars, NO stripes, NO diagonal lines across the shield, nothing but the head",
    primaryColor: "#1E7B3C", secondaryColor: "#F5F5F5",
  },
  {
    // WAS "Northgate Ironhawks" — a hawk head in profile inside a pointed shield, which is
    // the SAME IDEA as sunfield-kestrels two entries up: raptor head, profile, shield, and
    // only the colour told them apart. At card size they read as one club. The kestrels are
    // approved across the whole soccer ladder, so the hockey club is the one that moved.
    // A crest set needs variety in the SILHOUETTE first — shape before subject — because
    // that is what survives being printed 12 mm wide on a card back.
    slug: "northgate-anvils", team: "Northgate Anvils",
    shape: "a keystone — a flat-topped arch, widest at the top and tapering to a flat base, with a heavy border",
    motif: "a single anvil seen from the side, drawn as heavy solid blocks: flat top, square horn on the left, stepped waist and a wide foot",
    primaryColor: "#12284B", secondaryColor: "#C8102E",
  },
  {
    slug: "fox-hollow-anchors", team: "Fox Hollow Anchors",
    shape: "a circle with a thin double ring",
    motif: "a single upright anchor, stock and flukes symmetrical, filling the circle",
    primaryColor: "#00695C", secondaryColor: "#FFFFFF",
  },
  {
    slug: "ash-grove-foxes", team: "Ash Grove Foxes",
    shape: "a hexagon standing on one point",
    motif: "a fox head seen head-on built from sharp triangles, ears up and wide, a narrow muzzle",
    primaryColor: "#23262B", secondaryColor: "#E8A33D",
  },
  {
    // WAS an anvil with crossed hammers — and northgate-anvils is ALSO an anvil, so the two
    // clubs read as one at card size, exactly like the two raptor heads did before the
    // hockey club moved (see the note on northgate-anvils). Same rule, second application:
    // check a new crest against every existing SUBJECT, not just against the shapes. The
    // octagon was already unique, so only the motif changed — and two hammers became one,
    // because a crest carries one idea.
    slug: "foundry-hill-forge", team: "Foundry Hill Forge",
    shape: "an octagon with a heavy border",
    motif: "a single blacksmith's hammer standing upright on its head, handle rising to the top of the octagon, drawn as heavy solid blocks — one object, no animal, no anvil",
    primaryColor: "#C8102E", secondaryColor: "#1A1A1A",
  },
  {
    slug: "vale-prep-vanguard", team: "Vale Prep Vanguard",
    shape: "a shield with a flat top and a deep V bottom",
    // COUNT WAS FOUGHT FOR AND LOST, 2026-08-22. Three rolls asked for THREE chevrons in
    // three different wordings ("exactly three", "three, never four", "count them"), and
    // all three came back one solid chevron above THREE outlined ones — the model's prior
    // for a chevron insignia is the four-part sergeant stack and it does not bend. README
    // §33: when a claim comes back the same way three times, stop arguing and record what
    // it IS, so every future roll reproduces the same mark instead of drifting.
    motif: "one SOLID chevron pointing up with THREE outlined chevrons stacked below it, four parts in all, evenly spaced and centred in the shield. Abstract, no animal, no letters",
    primaryColor: "#8E2C6B", secondaryColor: "#FFFFFF",
  },
  {
    slug: "willow-bend-swifts", team: "Willow Bend Swifts",
    shape: "a circle with no border, the mark breaking the edge",
    motif: "a swift in flight reduced to ONE swept crescent shape with a forked tail, nothing else",
    primaryColor: "#6FA8DC", secondaryColor: "#1B3A5C",
  },
  {
    slug: "redstone-flyers", team: "Redstone Flyers",
    shape: "an oval lying on its side, with a narrow border",
    motif: "a winged foot in profile facing right — a single wing rising from the heel, drawn as solid shapes",
    primaryColor: "#C8A200", secondaryColor: "#2B2B2B",
  },
  {
    slug: "bayline-marlins", team: "Bayline Marlins",
    shape: "a rounded shield, wider than it is tall",
    motif: "a marlin arcing over a single straight wave line, bill raised to the upper right, tail crossing below the line",
    primaryColor: "#1F4EA1", secondaryColor: "#FFFFFF",
  },
  {
    slug: "highfield-herons", team: "Highfield Herons",
    shape: "a tall narrow shield with a pointed bottom",
    motif: "a heron head and long neck curved into an S, beak straight and horizontal, one crest feather back from the head",
    primaryColor: "#17A398", secondaryColor: "#0B2E2B",
  },
  {
    slug: "pinewick-osprey", team: "Pinewick Osprey",
    shape: "a circle with a heavy outer ring",
    motif: "an osprey seen head-on with wings raised and talons reaching down and forward",
    primaryColor: "#5D6B2A", secondaryColor: "#EDE6D6",
  },
  {
    slug: "copperline-kingfishers", team: "Copperline Kingfishers",
    shape: "a diamond standing on one point, with a heavy border",
    motif: "a kingfisher head in profile facing left, a long straight dagger beak, three spiked crest feathers on the crown",
    primaryColor: "#8C5A2B", secondaryColor: "#F2E9DC",
  },
  {
    slug: "slate-creek-sentinels", team: "Slate Creek Sentinels",
    shape: "a shield with a flat top and a rounded bottom",
    motif: "a single square watchtower in silhouette with a crenellated top and one narrow window slit — an object mark, no animal",
    primaryColor: "#5C6672", secondaryColor: "#E4B33C",
  },
];

export const crestBySlug = (slug: string) => CRESTS.find((c) => c.slug === slug);
