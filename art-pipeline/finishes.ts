// Finish descriptors for the art pipeline.
//
// A finish is the MATERIAL + LIGHTING of the set. It never changes per sport.
// `ref` is the canonical background already approved in Figma — it is sent to the
// model as an image reference so a new sport inherits the exact same set.
// See docs/GAME-DAY-EDITION.md for where each ref came from.

export interface Finish {
  /** Folder / CLI slug. */
  slug: string;
  /** Human name, matches the `Style` variable collection mode. */
  name: string;
  /** Two-letter code used in card IDs. */
  code: string;
  /** Canonical approved background, repo-relative. Sent as the visual reference. */
  ref: string;
  /** What the model must PRESERVE from the reference. */
  material: string;
  /** Finish-specific things that must NOT appear. */
  forbid: string;
  /**
   * true  = a real location, so the sport's actual material (ice, turf, hardwood) belongs.
   * false = a studio set, so the floor stays the set's own and only the LINE GEOMETRY is
   *         etched into it. Naming the real material at all makes the model drift back to
   *         white ice / green grass, so the prompt has to negate it explicitly.
   */
  keepsRealSurface: boolean;
  /** The set's own floor, named so the prompt can insist it survives. */
  floor: string;
  /**
   * true when the approved reference already contains a distant out-of-focus crowd.
   * The QA rubric must allow it, or it rejects the finish for looking like itself.
   */
  crowdInSet: boolean;
  /**
   * Optional finish-level instruction on HOW the sport's real surface should be rendered.
   * Heritage is why this exists: it is a vintage finish, so a modern blue acrylic tennis
   * court or a red polyurethane track breaks it even though each IS that sport's real
   * present-day material. `sport.material` is shared by all six finishes, so the era
   * belongs to the finish, not the sport.
   */
  materialNote?: string;
  /**
   * Optional override for HOW the etched floor lines look on a studio finish. The default
   * wording ("faint luminous inlay, like lighting recessed under glass") was written for
   * Chrome All-Star's mirror floor and is wrong for Prism Rush, whose signature is bright
   * glowing neon.
   */
  lineNote?: string;
  /**
   * true when this finish's reference is a real venue (an arena bowl) rather than an
   * abstract studio set. Only venue-based finishes get reshaped for outdoor sports —
   * Chrome All-Star is a chrome studio with no venue to open up, and telling it to remove
   * its roof and show sky would destroy the finish.
   */
  venueBased?: boolean;
}

export const FINISHES: Finish[] = [
  {
    slug: "stadium-night",
    name: "Stadium Night",
    code: "SN",
    ref: "print-sources/figma-ready/background_v2.png",
    material:
      "a dark night-arena interior: heavy atmospheric haze drifting through the air, " +
      "banks of cold white stadium floodlights high in the blackness, a deep out-of-focus " +
      "crowd in the far background, and a glossy floor throwing long soft reflections. " +
      "Cinematic, moody, desaturated steel-blue and charcoal palette with soft silver highlights",
    forbid: "chrome sculpture, hard studio reflectors, bright saturated colour",
    keepsRealSurface: true,
    floor: "the arena floor",
    venueBased: true,
    crowdInSet: true,
  },
  {
    slug: "chrome-allstar",
    name: "Chrome All-Star",
    code: "CA",
    ref: "print-sources/chrome-allstar/background-new.png",
    material:
      "a high-contrast studio set built from giant polished chrome hexagon frames stacked in " +
      "perspective, mirror-finish metal edges catching sharp specular glints, a dark mirror " +
      "floor, cool steel-blue and gunmetal palette. Clean, hard, product-shot lighting",
    forbid:
      "arena crowd, stadium floodlight spill, atmospheric haze or fog above 50%, bokeh light orbs, warm colour",
    keepsRealSurface: false,
    floor: "the dark steel-blue mirror studio floor",
    crowdInSet: false,
  },
  {
    slug: "fire-smoke",
    name: "Fire & Smoke",
    code: "FS",
    ref: "print-sources/Fire-and-smoke/fire-smoke-background.png",
    // The fire is a premium trading-card EFFECT, not a burning building. Once the venue
    // opened outdoors the model set the stands alight and it read as a wildfire or a
    // disaster — "big scary fire" instead of "cool fire-and-smoke card".
    material:
      "a near-black venue with a bold, cinematic fire-and-smoke EFFECT: strong sculpted " +
      "tongues of ember-orange flame sweeping along the far edges and the sides of the " +
      "frame, glowing smoke lit from within, showers of bright sparks streaming up through " +
      "the dark, and a hot ember rim-light blazing along every edge it touches. Deep " +
      "near-black shadows against vivid, saturated ember-orange and antique gold — high " +
      "contrast and punchy. The fire is the HERO of this finish and must read boldly and " +
      "instantly, even at thumbnail size. It is a powerful lighting effect wrapped around " +
      "the scene — dramatic, premium and controlled, never a fire consuming the building",
    forbid:
      "burning buildings, burning stands, burning seats or any structure actually on fire; " +
      "a wildfire, forest fire or disaster scene; walls of flame filling the frame; bright " +
      "orange washing over the whole image; a bright or high-key exposure; chrome hexagons; " +
      "cold blue light; daylight",
    materialNote:
      "The playing surface keeps deep black shadows but CATCHES the fire strongly: bright " +
      "hot ember highlights running along the markings and across the ground nearest the " +
      "flame, so the surface glows and has punch rather than sinking into flat darkness. " +
      "The lines themselves pick up the ember light and read clearly. It keeps its texture " +
      "but never its daylight colour — no bright green grass, no blue or green court, no " +
      "daylight paint. Near-black and warm, but never dim, muddy or washed-out",
    keepsRealSurface: false,
    // NOT a "scorched studio floor" — the reference is an arena, and telling the model to
    // swap in a studio floor fought the set it was being handed.
    floor: "the dark reflective arena floor, lit amber by the flames",
    // The reference does contain darkened stands with a crowd behind the fire. README §6:
    // without this the rubric rejects the finish for looking like itself.
    venueBased: true,
    crowdInSet: true,
  },
  {
    slug: "heritage",
    name: "Heritage",
    code: "HE",
    ref: "print-sources/Heritage/Heritage-background.png",
    material:
      "a warm classic arena interior: a high domed timber roof with exposed trusses, tiered " +
      "banks of wooden seating curving all the way round, a packed crowd softly out of focus " +
      "in the stands, warm amber house lights glowing around the bowl, and honey-toned light " +
      "pouring down onto the floor. Antique gold and amber, aged cream and deep brown, soft " +
      "classic-photograph grain, nostalgic and golden",
    forbid: "chrome, neon, cold blue light, modern LED fixtures",
    keepsRealSurface: true,
    floor: "the warm honey-toned hardwood venue floor",
    materialNote:
      "Render every playing surface in its OLD-SCHOOL, mid-century form: varnished wooden " +
      "floorboards for indoor court sports, real natural grass for field sports — turf laid " +
      "inside this venue, never a wooden floor for a field sport — a PAVED court for tennis " +
      "and pickleball, old painted asphalt or rolled clay, never wooden boards and never " +
      "grass for those two — a cinder or clay " +
      "running track, canvas-covered mats, and lines PAINTED directly onto the surface. " +
      "Never modern synthetic colour — no blue acrylic hard court, no red polyurethane " +
      "track, no bright green artificial turf, no glossy taraflex, no colour-blocked zones. " +
      "It should look like a photograph from decades ago, worn and warm, not a new-build venue",
    // The reference is a PACKED arena. With this false the rubric fails Heritage for
    // containing the very crowd that defines it — README §6.
    venueBased: true,
    crowdInSet: true,
  },
  {
    slug: "signature-spotlight",
    name: "Signature Spotlight",
    code: "SS",
    ref: "print-sources/Signature-spotlight/signature-spotlight-background.png",
    // The stored description used to be "one spotlight pool on a dark seamless backdrop",
    // which is not this reference at all — the approved art is a bright, calm, EMPTY modern
    // arena. The finish is carried by the reference, so the words have to match it.
    material:
      "a bright, calm, modern indoor arena, completely empty: pale grey tiered seating " +
      "rising on every side with not a single spectator in it, a clean white ceiling of " +
      "exposed trusses carrying long linear LED strip lights, a soft blue trim band running " +
      "around the bowl, and a light honey-maple sports floor. Even, diffuse, daylight-neutral " +
      "light with no haze and no dramatic shadow. Minimal, architectural, serene, understated",
    forbid:
      "crowds or spectators of any kind, smoke, haze, fire, chrome hexagons, dramatic or " +
      "coloured stage lighting, dark moody grading, busy detail",
    keepsRealSurface: true,
    floor: "the light honey-maple sports floor",
    venueBased: true,
    crowdInSet: false,
    // The deliberate opposite of Heritage's vintage rule — this finish is the brand-new,
    // immaculate version of every surface. Same layouts, different material: the rule the
    // whole product is built on.
    materialNote:
      "Render every playing surface in its CLEAN, MODERN, brand-new form: crisp bright " +
      "colour, freshly painted lines, immaculate and unworn, calm and evenly lit. Nothing " +
      "aged, scuffed, cracked or grimy, and no dramatic lighting on it",
  },
  {
    slug: "prism-rush",
    name: "Prism Rush",
    code: "PR",
    ref: "print-sources/prism-rush/prism-rush-background.png",
    // Was described as "glass panels" and it FORBADE crowds — but the approved reference is
    // a packed neon arena. Both had to be corrected against the actual art.
    material:
      "a neon-lit arena at full tilt: banks of cyan, magenta and violet spotlight beams " +
      "cutting down through the air from an overhead lighting truss, a packed crowd glowing " +
      "in the tiered stands under the colour wash, LED ribbon boards running around the bowl, " +
      "and a dark wooden arena floor drenched in violet and cyan light. High-energy, " +
      "saturated, electric",
    forbid:
      "warm ember or orange tones, fire, smoke or haze, vintage grain, daylight, chrome hexagons",
    keepsRealSurface: false,
    floor: "the dark wooden arena floor drenched in violet and cyan light",
    venueBased: true,
    crowdInSet: true,
    lineNote:
      "The markings are BRIGHT GLOWING NEON: vivid cyan and white light blazing along every " +
      "line, casting their own glow onto the surrounding floor — never faint, never dim",
    // Tennis came back as a real blue-and-green hard court under neon, which reads as a
    // stock photo with a filter rather than as this finish.
    materialNote:
      "The playing surface stays DARK and deeply saturated by the finish's own light — it " +
      "keeps its texture but NOT its real-world colour. No bright blue court, no bright " +
      "green surround or grass, no daylight paint colours: the ground is near-black violet " +
      "and cyan, and the only bright things on it are the neon lines themselves",
  },
];

export const finishBySlug = (s: string) => FINISHES.find((f) => f.slug === s);
