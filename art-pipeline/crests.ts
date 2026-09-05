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
  /**
   * TRUE when the artwork is the CUSTOMER'S OWN FILE, already on disk at
   * `out/crests/<slug>.png`, and must never be generated. Rule 1 at the top of this file
   * says a real club's mark is theirs; rule "exact or absent" says an approximation of it
   * is worse than nothing. `--stage crest` skips these — without the flag, one routine
   * `--stage all` would quietly overwrite a paying customer's logo with an invented one.
   *
   * The prose fields below are then only a DESCRIPTION of the file, for anything that has
   * to talk about the badge in words. They do not define it; the PNG does.
   */
  supplied?: boolean;
}

export const CRESTS: Crest[] = [
  {
    // ORDER 01 — the first real customer order (2026-08-22). Their own club mark, uploaded
    // with the order and used unchanged. It breaks rule 2 above (it carries the words
    // "Be Šansu"), which is exactly why it may not be redrawn: lettering is the thing image
    // models mangle, so the file is applied as artwork rather than described and re-made.
    // Source: out/athletes/Order 01/creast/be-sansu-129.jpg, 120x120 — see the note in the
    // handoff doc about asking customers for a larger logo.
    slug: "be-sansu", team: "Be Šansuu", supplied: true,
    shape: "a rounded shield with a heavy navy border",
    motif: "a gold hand and a curved blue-and-white sweep, with the club name lettered across the lower half",
    primaryColor: "#14275B", secondaryColor: "#FFFFFF",
  },
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
    // The border is a BAND, not a hairline, and the foot is told to sit inside it. The first
    // roll (2026-08-22) drew the oval as a thin unclosed stroke and let the wing cross it on
    // two sides, which at 90 px on a singlet reads as a blob with a broken ring round it. Rule
    // 3 wants the outline to survive at card size, and an outline the mark walks through does
    // not. Only willow-bend-swifts breaks its edge, and that is written into its own entry.
    shape: "an oval lying on its side, with a solid unbroken border band — one continuous closed ring of even thickness, never a hairline and never interrupted",
    motif: "a winged foot in profile facing right — a single wing rising from the heel, drawn as solid shapes. The whole winged foot sits WHOLLY INSIDE the oval with clear space between it and the border: no part of the wing, the heel or the toe touches, overlaps or crosses the ring",
    primaryColor: "#C8A200", secondaryColor: "#2B2B2B",
  },
  // THE LAST FOUR CLUBS WERE RE-SHAPED BEFORE ANYTHING WAS GENERATED (2026-08-22), under §34.
  // Written as first drafted they broke rule 3 at the top of this file in three ways at once:
  // three of the five sat in shapes the roster already uses heavily (six of the first twelve
  // crests are shields, three are circles, one is a diamond), and two repeated a SUBJECT
  // TREATMENT that is already taken — a bird's head in profile is sunfield-kestrels, and at
  // 90 px on a chest that is the whole mark. Cheap to fix here, expensive to fix after a plate,
  // four poses and a print file have been built on it. redstone-flyers was left alone: a winged
  // foot is the only object of its kind on the roster and the side-lying oval is unique.
  {
    slug: "bayline-marlins", team: "Bayline Marlins",
    // WAS a rounded shield (the sixth) carrying a marlin AND a wave line — two ideas, and rule 3
    // allows one. The arch is a silhouette nobody has; northgate-anvils' keystone is its near
    // neighbour and is the other way up (flat TOP, tapering to a flat base).
    shape: "an arch — a flat base with a semicircular top, with a narrow border",
    motif: "a single marlin leaping, arcing upward with its bill raised to the upper right and its forked tail low to the left, drawn as solid shapes — the only fish on the roster, no wave, no water, nothing else inside the shape",
    primaryColor: "#1F4EA1", secondaryColor: "#FFFFFF",
  },
  {
    slug: "highfield-herons", team: "Highfield Herons",
    // WAS a tall pointed shield — a bird's head in a shield, which is sunfield-kestrels exactly.
    // The pennant is a silhouette nobody has, and the S-NECK is the idea that separates this
    // bird from the other six: it is the only mark on the roster with a neck in it.
    shape: "a swallowtail pennant flying to the right, its fly end notched into two points",
    motif: "a heron's head and long neck curved into a tall S filling the pennant, the beak straight and horizontal, one crest feather trailing back from the crown — the neck is the mark, no body, no legs, no wings",
    primaryColor: "#17A398", secondaryColor: "#0B2E2B",
  },
  {
    slug: "pinewick-osprey", team: "Pinewick Osprey",
    // WAS a circle, which fox-hollow-anchors and willow-bend-swifts already share. A triangle is
    // unused and takes the spread wings better than a circle did. Head-on with the wings up is a
    // pose no other bird here uses: kestrel is a head, lark and swift are side-on in flight,
    // wren is perched.
    // POINT DOWN, not up. Written as "standing on its base" it came back INVERTED anyway
    // (2026-08-22) — and the inverted one is the better mark: the osprey's wings open into a
    // wide V, and a downward triangle is that V. The reason this shape was chosen in the first
    // place still holds either way ("a triangle is unused and takes the spread wings better
    // than a circle did"), so the data follows the drawing rather than the drawing being rolled
    // again to follow the data. It is still the only triangle on the roster.
    shape: "an inverted triangle — two corners at the top and the third point at the bottom — with its three corners clipped and a heavy border",
    motif: "an osprey seen head-on with both wings raised into a wide V and its talons reaching down and forward, symmetrical, filling the triangle",
    primaryColor: "#5D6B2A", secondaryColor: "#EDE6D6",
  },
  {
    slug: "copperline-kingfishers", team: "Copperline Kingfishers",
    // WAS a diamond (harlow-creek-larks has one) carrying a head in profile (sunfield-kestrels
    // has one) — the same club twice over at card size. The upright patch is unused, and the
    // VERTICAL DIVE is the one thing a kingfisher does that nothing else on the roster does.
    // Kept deliberately opposite to bayline-marlins two entries up: that mark arcs UP and to the
    // right and ends in a forked tail, this one points straight DOWN and ends in a dagger beak.
    shape: "an upright rounded rectangle — a patch — with its top two corners clipped and a heavy border",
    motif: "a kingfisher diving head-first STRAIGHT DOWN, wings swept back flat against the body into a dart, the long dagger beak at the bottom point — one vertical shape, no water, no fish, no perch",
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
