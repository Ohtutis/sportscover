// The athlete roster.
//
// WHY THIS IS DATA AND NOT PROMPT TEXT
// A background only has to look like the finish. An athlete has to be the SAME PERSON
// across four poses, and later across a customer's whole order. Words alone never hold a
// face: two runs of the same sentence give two different people. So identity works the
// same way the finish does in `finishes.ts` — it is carried by an IMAGE (the identity
// plate) and the fields below only reinforce it.
//
// THE SEAM WITH THE PER-ORDER TOOL: for a real customer the identity plate is built FROM
// their photos instead of from these fields. Everything downstream — poses, cutout, QA —
// is identical. That is the whole point of splitting the plate out.
//
// THE ROSTER HAS TWO JOBS, AND THEY ARE SEPARATE ARTEFACTS ON THE SITE
//   1. SPORT COVERAGE — seventeen athletes, one per sport, answering "is my sport here?"
//      Ages sit in the high-school band because that is the core buyer.
//   2. THE AGE LADDER — six athletes in ONE sport, answering "does this fit my person?"
//      Sport and club are held constant so age is the only variable that moves. Mixing
//      ages across seventeen different sports would answer neither question: nobody can
//      tell whether what they are seeing is the age or the sport.
//
// Demographics follow who actually plays each sport in US high schools rather than an even
// split, because this set doubles as the marketing set and has to look like the customer
// base. Adjust freely — these are choices, not findings.

export interface Athlete {
  slug: string;
  /** sports.ts slug. */
  sport: string;
  firstName: string;
  lastName: string;
  jerseyNumber: string;
  /**
   * Numeric age. Separate from `age` prose because the kit and the rubric branch on it —
   * a seven-year-old and a fifty-year-old need opposite corrections applied.
   */
  ageYears: number;
  /**
   * Age in words. The model defaults to a fit adult unless told otherwise, and an
   * eleven-year-old with a twenty-five-year-old's jaw is the fastest way to make the demo
   * set stop matching real customers.
   */
  age: string;
  presents: "male" | "female";
  /** Concrete build. "Athletic" flattens to one body; name the shoulders, the height. */
  build: string;
  skinTone: string;
  hair: string;
  /** Two or three face facts specific enough to survive a re-roll and be checkable. */
  face: string;
  team: string;
  /** crests.ts slug. */
  crest: string;
  primaryColor: string;
  secondaryColor: string;
  /** Human name of the primary colour, so prompts can say it as well as show the hex. */
  colorName: string;
  /**
   * Uniform override. Normally EMPTY: the kit is a property of the sport (`kits.ts`), not
   * of the person, which is exactly how the per-order tool needs it — if the customer's
   * photos show a real uniform we keep theirs, and if they do not we dress them in the
   * sport's basic kit. Set this only when an athlete genuinely wears something the sport
   * default does not cover.
   */
  kit?: string;
  /** Only for the age ladder: the relationship the tile sells. Numbers do not sell. */
  ladderLabel?: string;
  /** Seamless backdrop override, when a light kit would vanish against the default grey. */
  backdrop?: string;
}

export const DEFAULT_BACKDROP =
  "a flat, evenly lit seamless mid-grey (18% grey) studio backdrop, completely plain — " +
  "no gradient, no vignette, no floor line, no shadow cast on it, no set, no props";

const HS = (n: number) =>
  `${n} years old, a high-school athlete — a teenager, not a grown professional`;

/* ---------------------------------------------------------------- 1. SPORT COVERAGE */

export const ATHLETES: Athlete[] = [
  {
    slug: "basketball", sport: "basketball",
    firstName: "Marcus", lastName: "Ellison", jerseyNumber: "12",
    ageYears: 17, age: HS(17), presents: "male",
    build: "6'2\", long-limbed and rangy with very long arms and wide shoulders, lean through the waist, strong calves — tall for his age and still growing into it, NOT heavy",
    skinTone: "deep brown skin with warm undertones, sweat beading along the hairline",
    hair: "black, in short twists, a clean line at the temples",
    face: "a long face with high cheekbones, a broad nose, a small gap between the front teeth, dark brown eyes under heavy lids",
    team: "Cedar Ridge Bears", crest: "cedar-ridge-bears",
    primaryColor: "#12356B", secondaryColor: "#FFFFFF", colorName: "deep blue",
  },
  {
    slug: "football", sport: "football",
    firstName: "Tui", lastName: "Fa'agata", jerseyNumber: "54",
    ageYears: 18, age: HS(18), presents: "male",
    build: "6'1\" and genuinely heavy — thick neck, deep chest, broad back, powerful legs, solid rather than cut. A lineman's body on an eighteen-year-old, NOT lean and NOT ripped",
    skinTone: "warm brown Pacific Islander skin, wind-burnt across the cheekbones",
    hair: "black, thick and wavy, cropped at the sides and flattened on top by the helmet",
    face: "a wide heavy jaw, a broad flat nose, full lips, thick black eyebrows, dark brown eyes",
    team: "Millbrook Bison", crest: "millbrook-bison",
    primaryColor: "#14532D", secondaryColor: "#F2E8CF", colorName: "forest green",
  },
  {
    slug: "baseball", sport: "baseball",
    firstName: "Casey", lastName: "Whitlock", jerseyNumber: "7",
    ageYears: 16, age: HS(16), presents: "male",
    build: "5'9\", compact and thick-set through the forearms and thighs — a short strong build, not a tall one",
    skinTone: "fair skin heavily freckled across the nose and forearms, a hard tan line at the mid-bicep",
    hair: "coppery red, short and thick with a cowlick at the crown, pushed up at the front by the cap",
    face: "a round face, a snub nose, pale green eyes, a chipped upper front tooth",
    team: "Harlow Creek Larks", crest: "harlow-creek-larks",
    primaryColor: "#B5451B", secondaryColor: "#F0E3D2", colorName: "burnt orange",
  },
  {
    slug: "softball", sport: "softball",
    firstName: "Brooke", lastName: "Danner", jerseyNumber: "3",
    ageYears: 15, age: HS(15), presents: "female",
    build: "5'5\", solid and compact with strong shoulders and thighs, a low centre of gravity, NOT slender",
    skinTone: "fair skin, sunburnt across the shoulders and the bridge of the nose",
    hair: "dark blonde, in a thick French braid down the back, flyaway strands at the temples",
    face: "a square jaw, a wide mouth, blue eyes set far apart, a scattering of freckles",
    team: "Bell Hollow Wrens", crest: "bell-hollow-wrens",
    primaryColor: "#7A1F2B", secondaryColor: "#C9CBCC", colorName: "maroon",
  },
  {
    slug: "soccer", sport: "soccer",
    firstName: "Mateo", lastName: "Herrera", jerseyNumber: "10",
    ageYears: 15, age: HS(15), presents: "male",
    build: "5'7\", light and springy with very defined calves and quadriceps, narrow shoulders, still boyish through the chest",
    skinTone: "medium brown Mexican-American skin, even in colour; a scatter of small spots along the jaw and one or two on the forehead — his skin at fifteen, and it is his and not a default applied to every teenager",
    hair: "black, thick, longish on top and pushed back off the forehead, damp",
    face: "a narrow face with a straight nose, thick dark eyebrows, dark brown eyes, the first shadow of a moustache",
    team: "Sunfield Kestrels", crest: "sunfield-kestrels",
    primaryColor: "#1E7B3C", secondaryColor: "#F5F5F5", colorName: "kelly green",
    ladderLabel: "your teenager",
  },
  {
    slug: "ice-hockey", sport: "ice-hockey",
    firstName: "Nolan", lastName: "Reid", jerseyNumber: "17",
    ageYears: 16, age: HS(16), presents: "male",
    // Brought into line with the "before" photographs on 2026-08-21 — the spec reads the body
    // off them, so a record describing a heavier boy than the anchor shows put the two
    // documents in conflict and the poses in the middle of it. One fact, one home.
    build: "5'10\" and athletic for his age: shoulders clearly broader than his hips, a strong neck, powerful thighs and calves built by skating, fit and lean through the middle. NOT soft, NOT skinny, NOT lanky. Still a teenager's frame, not a fully filled-out adult one",
    // WAS "fair skin that flushes red across the cheeks and nose with exertion" — which is
    // true of a real hockey player coming off the ice and wrong for every frame we ship: the
    // pose rubric FAILS a deep red face (`not_overheated`), so the record was arguing with the
    // judge, and the customer's first reaction to the before-photos was the redness.
    skinTone: "fair skin with an even, healthy colour and light freckling across the nose and cheekbones",
    hair: "dark brown, damp and matted flat at the temples from the helmet, curling at the neck",
    face: "a long face with a slightly crooked nose, a faint scar through the right eyebrow, grey-blue eyes set fairly deep, no facial hair beyond a little uneven fuzz on the jaw",
    team: "Northgate Anvils", crest: "northgate-anvils",
    primaryColor: "#12284B", secondaryColor: "#C8102E", colorName: "navy",
    kit:
      "a SOLID navy jersey with no contrast shoulders and no contrast sleeves — the only " +
      "trim is one red band around the waist hem and a red collar edge; navy breezers, navy " +
      "socks, black skates, navy gloves, navy helmet with a clear flat visor",
  },
  {
    slug: "volleyball", sport: "volleyball",
    firstName: "Jaslene", lastName: "Ocampo", jerseyNumber: "5",
    ageYears: 17, age: HS(17), presents: "female",
    build: "5'10\", long through the arms and torso with broad shoulders and lean legs",
    skinTone: "light brown Filipina skin, red pressure marks along the forearms from passing",
    hair: "black, straight and heavy, in a tight high ponytail, strands stuck to the neck",
    face: "a round face with a small flat nose, dark almond eyes, a small mole below the right eye",
    team: "Fox Hollow Anchors", crest: "fox-hollow-anchors",
    primaryColor: "#00695C", secondaryColor: "#FFFFFF", colorName: "deep teal",
  },
  {
    slug: "lacrosse", sport: "lacrosse",
    firstName: "Reese", lastName: "Callahan", jerseyNumber: "22",
    ageYears: 16, age: HS(16), presents: "female",
    build: "5'8\", athletic and even, broad through the upper back and forearms, not bulky",
    skinTone: "fair skin, sunburnt across the nose and the back of the neck",
    hair: "red-brown, thick, in a high ponytail with a wide headband holding it back",
    face: "an angular jaw, freckles dense across the nose and cheeks, grey eyes, a slight overbite",
    team: "Ash Grove Foxes", crest: "ash-grove-foxes",
    primaryColor: "#23262B", secondaryColor: "#E8A33D", colorName: "charcoal",
  },
  {
    slug: "wrestling", sport: "wrestling",
    firstName: "Dawson", lastName: "Pryor", jerseyNumber: "1",
    ageYears: 17, age: HS(17), presents: "male",
    build: "5'6\", extremely compact and dense — thick neck and trapezius, heavy forearms, very low body fat, a cauliflower thickening on the left ear",
    skinTone: "fair skin, mat-burn red across the right shoulder and forehead",
    hair: "ash blond, buzzed to the wood at the sides with a little length left on top",
    face: "a wide flat face, a nose broken and set slightly off-centre, a heavy brow, hazel eyes",
    team: "Foundry Hill Forge", crest: "foundry-hill-forge",
    primaryColor: "#C8102E", secondaryColor: "#1A1A1A", colorName: "red",
  },
  {
    slug: "cheerleading", sport: "cheerleading",
    firstName: "Amara", lastName: "Boyd", jerseyNumber: "0",
    ageYears: 15, age: HS(15), presents: "female",
    build: "5'2\", small and very strong through the shoulders and core, compact legs",
    skinTone: "deep brown skin with a warm glow, a light sheen on the forehead",
    // The competition BOW is NOT in this field, and that is deliberate: everything here is
    // fed to all four "before" snapshots, so a kit item written into the identity record
    // follows her to the sofa and to the seaside. The bow lives in kits.ts with the rest
    // of the uniform. See README §37.
    hair: "black, straightened into a high ponytail",
    face: "a heart-shaped face, a small nose, a wide open smile with braces on the upper teeth, dark brown eyes",
    team: "Vale Prep Vanguard", crest: "vale-prep-vanguard",
    primaryColor: "#8E2C6B", secondaryColor: "#FFFFFF", colorName: "berry",
  },
  {
    slug: "gymnastics", sport: "gymnastics",
    firstName: "Sofia", lastName: "Marchetti", jerseyNumber: "0",
    ageYears: 13, age: "13 years old, a middle-school gymnast — a young teenager who has not finished growing, NOT an adult woman",
    presents: "female",
    build: "4'11\", very small and extremely muscular for her size — defined shoulders and back, no length in the limbs yet, a child's proportions rather than an adult's",
    skinTone: "pale skin that reddens easily, chalk dust across the hands and forearms",
    hair: "chestnut brown, scraped back into a tight bun with no loose strands at the front",
    face: "a small pointed chin, freckles high on the cheeks, hazel eyes, a serious set mouth",
    team: "Willow Bend Swifts", crest: "willow-bend-swifts",
    primaryColor: "#6FA8DC", secondaryColor: "#1B3A5C", colorName: "powder blue",
  },
  {
    slug: "track-field", sport: "track-field",
    firstName: "Imani", lastName: "Whitfield", jerseyNumber: "8",
    ageYears: 16, age: HS(16), presents: "female",
    build: "5'8\", very lean with sharply defined quadriceps and hamstrings, narrow waist, light through the upper body",
    skinTone: "dark brown skin, sweat beading along the collarbones",
    hair: "black, in cornrows gathered into a low bun",
    face: "a long narrow face, a strong straight nose, a small scar under the chin, dark eyes",
    team: "Redstone Flyers", crest: "redstone-flyers",
    primaryColor: "#C8A200", secondaryColor: "#2B2B2B", colorName: "gold",
  },
  {
    slug: "swimming", sport: "swimming",
    firstName: "Nora", lastName: "Lindqvist", jerseyNumber: "0",
    ageYears: 16, age: HS(16), presents: "female",
    build: "5'9\", very broad shoulders and a long back tapering to narrow hips, long arms — a swimmer's V",
    skinTone: "very fair skin, pink across the shoulders, goggle marks pressed around the eyes",
    hair: "platinum blonde, wet and pushed flat under the swim cap, a few strands escaping at the nape",
    face: "a wide face with a strong jaw, pale blue eyes, near-invisible eyebrows, a small cleft in the chin",
    team: "Bayline Marlins", crest: "bayline-marlins",
    primaryColor: "#1F4EA1", secondaryColor: "#FFFFFF", colorName: "royal blue",
  },
  {
    slug: "tennis", sport: "tennis",
    firstName: "Arun", lastName: "Devarajan", jerseyNumber: "0",
    ageYears: 15, age: HS(15), presents: "male",
    build: "5'7\", slight and quick, wiry forearms with the racket arm visibly more developed",
    skinTone: "brown South Asian skin, a sharp tan line at the sleeve and above the sock",
    hair: "dark auburn, thick and curly, grown out over the ears and pushed off the forehead by a white headband",
    face: "a narrow face, long lashes, a small nose, a faint moustache shadow, dark brown eyes",
    team: "Highfield Herons", crest: "highfield-herons",
    primaryColor: "#17A398", secondaryColor: "#0B2E2B", colorName: "turquoise",
  },
  {
    slug: "golf", sport: "golf",
    firstName: "Hana", lastName: "Park", jerseyNumber: "0",
    ageYears: 17, age: HS(17), presents: "female",
    build: "5'7\", even and athletic with strong shoulders and a stable base, not obviously muscular",
    skinTone: "light Korean skin, tanned on the left forearm only, a glove line at the left wrist",
    hair: "black, straight, in a low ponytail threaded through the back of a cap",
    face: "a broad calm face, a small straight nose, dark eyes with a steady level gaze, light sun freckles",
    team: "Pinewick Osprey", crest: "pinewick-osprey",
    primaryColor: "#5D6B2A", secondaryColor: "#EDE6D6", colorName: "olive",
  },
  {
    // Deliberately an adult. US pickleball genuinely skews older, so this is both the
    // honest demographic AND the older end of the age range shown inside the main roster
    // at no extra cost.
    slug: "pickleball", sport: "pickleball",
    firstName: "Ray", lastName: "Solberg", jerseyNumber: "0",
    ageYears: 58, age: "58 years old — a middle-aged recreational player, NOT a young adult and NOT an elite athlete",
    presents: "male",
    build: "5'11\", solidly built with a thickened middle and strong forearms, the posture of someone who has played sport all his life but is no longer twenty-five",
    skinTone: "weathered fair skin, sun damage across the forearms and the back of the neck, deep laugh lines",
    hair: "grey, thinning at the crown, cut short",
    face: "heavy creases at the eyes and mouth, a full grey-white stubble, blue eyes, a nose reddened by sun",
    team: "Copperline Kingfishers", crest: "copperline-kingfishers",
    primaryColor: "#8C5A2B", secondaryColor: "#F2E9DC", colorName: "copper",
  },
  {
    slug: "other-sport", sport: "other-sport",
    firstName: "Sam", lastName: "Okonkwo", jerseyNumber: "12",
    ageYears: 16, age: HS(16), presents: "male",
    build: "5'10\", balanced and unremarkable in the best way — an all-round athletic teenager, neither heavy nor slight",
    skinTone: "medium-dark brown skin, even, a light sheen across the forehead",
    hair: "dark brown locs, shoulder length, tied back off the face",
    face: "an open regular face, a broad nose, warm brown eyes, a small scar through the left eyebrow",
    team: "Slate Creek Sentinels", crest: "slate-creek-sentinels",
    primaryColor: "#5C6672", secondaryColor: "#E4B33C", colorName: "slate",
  },

  /* ------------------------------------------------------------- 2. THE AGE LADDER */
  // One sport, one club, six ages. Mateo (15) above is the fourth rung and is not repeated.
  //
  // Soccer because it is the only sport in the seventeen genuinely played at every one of
  // these ages in the US, from U8 rec through adult co-ed leagues.
  //
  // Gender DOES vary here, unlike sport and club. The ladder's real variable is not age but
  // WHO YOU ARE BUYING FOR — your kid, your daughter, your teenager, your teammate, your
  // partner, your dad — and that audience is not one gender. `ladderLabel` carries the
  // relationship, because a relationship sells and a number does not.
  {
    slug: "soccer-age-07", sport: "soccer",
    firstName: "Finn", lastName: "Halloran", jerseyNumber: "4",
    ageYears: 7,
    age: "7 years old — a small child in second grade. NOT a miniature adult and NOT a teenager",
    presents: "male",
    build:
      "3'9\" and genuinely a small child: the head is LARGE relative to the body, about one " +
      "sixth of his total height, the forehead high and rounded, the torso short, arms and " +
      "legs short and soft with no muscle definition at all, a soft belly, baby fat still in " +
      "the cheeks. Do NOT draw a shrunken adult — the head-to-body ratio is what makes a " +
      "child read as a child",
    skinTone: "fair skin with a light scattering of freckles across the nose and a faint natural colour in the cheeks — not ruddy",
    hair: "strawberry blonde, fine and straight, cut in a soft fringe across the forehead and sticking up at the crown",
    face: "a round face with full cheeks, a small upturned nose, wide hazel eyes, and a gap where an upper front tooth is missing — visible only when the mouth is open",
    team: "Sunfield Kestrels", crest: "sunfield-kestrels",
    primaryColor: "#1E7B3C", secondaryColor: "#F5F5F5", colorName: "kelly green",
    ladderLabel: "your kid",
  },
  {
    slug: "soccer-age-10", sport: "soccer",
    firstName: "Ava", lastName: "Nakamura", jerseyNumber: "9",
    ageYears: 10,
    age: "10 years old — a child, not yet a teenager, no adolescent development at all",
    presents: "female",
    build:
      "4'4\", slight and straight up and down with no adult shape whatsoever — a child's " +
      "flat, narrow frame, thin arms and legs, knees slightly knobbly, the head still large " +
      "relative to the body though less so than at seven",
    skinTone: "light East Asian skin, flushed across the cheeks from running",
    hair: "black, straight, in two braids that have started to come loose",
    face: "a round face with a small flat nose, dark eyes, adult front teeth that look slightly too big for the face, a serious concentrating expression",
    team: "Sunfield Kestrels", crest: "sunfield-kestrels",
    primaryColor: "#1E7B3C", secondaryColor: "#F5F5F5", colorName: "kelly green",
    ladderLabel: "your daughter",
  },
  {
    slug: "soccer-age-22", sport: "soccer",
    firstName: "Sienna", lastName: "Okafor", jerseyNumber: "7",
    ageYears: 22,
    age: "22 years old — a young adult at the peak of her physical development, a college player",
    presents: "female",
    build: "5'8\", fully developed and powerfully built through the legs and glutes, defined shoulders, an adult athlete's body with nothing adolescent left in it — twenty-two is the physical peak and she looks it",
    skinTone: "deep brown skin, sweat across the forehead and collarbones",
    hair: "black, in long box braids gathered into a high bun",
    face: "a strong symmetrical jaw, high cheekbones, a broad nose, dark eyes, a small stud in the left nostril",
    team: "Sunfield Kestrels", crest: "sunfield-kestrels",
    primaryColor: "#1E7B3C", secondaryColor: "#F5F5F5", colorName: "kelly green",
    ladderLabel: "your teammate",
  },
  {
    slug: "soccer-age-32", sport: "soccer",
    firstName: "Danny", lastName: "Voss", jerseyNumber: "6",
    ageYears: 32,
    age: "32 years old — a grown man playing in an adult league after work, fit but no longer a college athlete",
    presents: "male",
    // THE LADDER'S BODY ARC LIVES HERE. Twenty-two is the physical peak; this is the tile where
    // adult life shows, and fifty is softer again. Six ages that all read as one body type
    // would make the ladder pointless. It is also the real test of the BUILD rule in spec.ts:
    // a heavier body has to survive to the poses exactly as described, never quietly slimmed.
    // DESCRIBE THE BODY IN ABSOLUTES, NOT RELATIVE TO AN ATHLETE. "Heavier than an athlete" and
    // "thicker through the middle than an elite player" both came back lean: the model's
    // baseline for a footballer IS lean, so a comparison against it lands somewhere still
    // athletic. Same failure as "the same boots" versus "plain black boots with white soles".
    // State what is actually visible instead.
    // CALIBRATED, not derived. Too weak and he came back lean; the same idea repeated nine
    // times came back overweight. This is the middle: one statement, concrete about what is
    // visible, with the upper bound stated once rather than the lower one restated.
    build: "6'0\" with a noticeably rounded belly that fills out the front of his shirt, a thick waist and no muscle definition anywhere — soft arms, soft chest, no abdominal lines. A dad's body. NOT obese though: the belly does not hang over the waistband and the shirt is not strained",
    skinTone: "fair skin, a farmer's tan at the sleeves, the beginnings of crow's feet",
    hair: "dark brown, receding a little at the temples, cut short and damp with sweat",
    // THE WEIGHT HAS TO BE IN THE FACE TOO. `build` describes a body, but the portrait frame
    // crops to the head — so a man written as heavy came back with a lean, defined face,
    // because nothing in the face description said otherwise. Whatever the body carries, the
    // face has to carry as well, or the two halves of the same person disagree.
    // ONE STATEMENT PER FACT. This field said "full", "heavy", "round", "soft jawline",
    // "second chin" and "thick neck" — six phrasings of one idea — and the build field said the
    // same thing three more times. Repetition in a prompt acts as AMPLIFICATION: a man written
    // as ordinary-but-not-fit came back plainly overweight. Say it once, and give the upper
    // bound as well as the lower one.
    face: "a fuller face with rounded cheeks and a soft jawline — no cheekbones showing. A short dark beard, full and neatly kept. Faint lines across the forehead, brown eyes",
    team: "Sunfield Kestrels", crest: "sunfield-kestrels",
    primaryColor: "#1E7B3C", secondaryColor: "#F5F5F5", colorName: "kelly green",
    ladderLabel: "your partner",
  },
  {
    slug: "soccer-age-50", sport: "soccer",
    firstName: "Teresa", lastName: "Aguilar", jerseyNumber: "11",
    ageYears: 50,
    age: "50 years old — a middle-aged woman playing in a weekend league. Visibly fifty, NOT a thirty-year-old with grey hair",
    presents: "female",
    build: "5'5\", sturdy and capable with strong calves, a softer midsection and upper arms, the posture of an adult who has played sport for decades",
    skinTone: "olive skin with sun damage across the forearms, clear lines at the eyes and mouth, freckled backs of the hands",
    hair: "dark brown going grey at the temples, pulled back into a short practical ponytail",
    face: "deep smile lines from nose to mouth, crow's feet, softened jawline, warm brown eyes, no makeup",
    team: "Sunfield Kestrels", crest: "sunfield-kestrels",
    primaryColor: "#1E7B3C", secondaryColor: "#F5F5F5", colorName: "kelly green",
    ladderLabel: "your mom",
  },
];

export const athleteBySlug = (slug: string) => ATHLETES.find((a) => a.slug === slug);

/** The age ladder, in order, for the site's "who is it for" row. */
export const AGE_LADDER = ["soccer-age-07", "soccer-age-10", "soccer", "soccer-age-22", "soccer-age-32", "soccer-age-50"]
  .map((s) => athleteBySlug(s)!)
  .sort((a, b) => a.ageYears - b.ageYears);
