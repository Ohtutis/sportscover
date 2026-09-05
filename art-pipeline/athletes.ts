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
   * Human name of the SECONDARY colour, and it is what the word "contrasting" becomes in the
   * kit line. Optional: leave it unset and the sport's default keeps saying "contrasting",
   * which is what the demo roster has always done. Set it whenever the real kit has a definite
   * second colour — Order 03's plum shirt is trimmed in GOLD, and without this the plate chose
   * magenta and nobody had said otherwise.
   */
  secondaryName?: string;
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
  /**
   * A REAL CUSTOMER ORDER, not part of the demo roster. Excluded from `--athlete all`, so a
   * roster-wide sweep cannot spend money regenerating somebody's paid work — or quietly
   * re-roll a frame they already approved.
   */
  order?: boolean;
  /**
   * HOW THE HAIR IS WORN TO PLAY, when it differs from how they wear it otherwise.
   *
   * It cannot live in `hair`: that is the person, and the identity plates are built from it —
   * put a competition ponytail there and the plate stops being a photograph of her and starts
   * being a photograph of her mid-match. It cannot live in `kit` either, tempting as it looks
   * beside the headband: when a kit PLATE exists the pose prompt uses the plate as the whole
   * wardrobe and never emits the kit string at all, so the ponytail silently vanished from
   * exactly the frames that needed it. Its own field, read only by the poses.
   */
  hairPlay?: string;
  /** Competitive level, when the customer states one. Only "pro" changes anything today: it
   *  overrides the recreational cut every adult age band in kits.ts otherwise assumes. */
  level?: "pro";
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
    // The SWIM CAP is not in this field, and cannot be: §37 — every "before" snapshot takes
    // `a.hair` verbatim, so a cap written here would be worn on the sofa and at the seaside.
    // It also has to come off for the identity plate, which needs hair to anchor on. The cap
    // lives in kits.ts; what is true of her hair when she is asleep is what belongs here.
    hair: "platinum blonde, fine and straight, cut just below the shoulders, the ends lightened and a little dry from chlorine",
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
    // The HEADBAND moved to kits.ts — §37: it is worn to play and taken off after. Left here
    // it would be across his forehead in all four "before" photographs, including at home.
    hair: "dark auburn, thick and curly, grown out over the ears and falling forward onto the forehead",
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
    // The CAP is kit and is already in kits.ts — §37. "Threaded through the back of a cap" is
    // how the ponytail sits ON COURSE, not how she wears her hair; written here it puts a golf
    // cap on her in every snapshot of her life.
    hair: "black, straight and heavy, in a low ponytail at the nape",
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
    // WRITTEN WITH AN EXPLICIT FLOOR AND CEILING, because the first roll ignored it. "Solidly
    // built with a thickened middle" came back as a LEAN fifty-eight-year-old runner in all four
    // snapshots (2026-08-22) — the model's default athlete is lean and a description alone does
    // not move it. This athlete exists to put a non-elite, middle-aged body in the roster, so
    // losing the body loses the point of him. The bound at the other end matters just as much:
    // the correction overshoots into a caricature if nothing stops it.
    build: "5'11\", and NOT a lean or athletic build — this is the body of a fifty-eight-year-old club player, not a runner's. He is SOLIDLY BUILT and carries real weight: a thickened middle with a soft belly that fills the front of his shirt and hangs slightly over the waistband, a heavy chest, a broad thick back, and strong forearms. His shoulders are wide but rounded rather than cut, and there is no visible muscle definition anywhere. Do NOT slim him, do NOT flatten his stomach and do NOT give him a defined torso. He is heavy-set, NOT obese: he still moves easily and stands upright, with the posture of someone who has played sport all his life and is no longer twenty-five",
    skinTone: "weathered fair skin, sun damage across the forearms and the back of the neck, deep laugh lines",
    hair: "grey, thinning at the crown, cut short",
    face: "heavy creases at the eyes and mouth, a full grey-white stubble, blue eyes, a nose reddened by sun",
    team: "Copperline Kingfishers", crest: "copperline-kingfishers",
    primaryColor: "#8C5A2B", secondaryColor: "#F2E9DC", colorName: "copper",
  },
  {
    // THE SECOND PICKLEBALL ATHLETE, and the only sport on the roster with two (2026-08-22).
    // Ray Solberg above is deliberately fifty-eight, and on his own that was the right call for
    // ONE reason and the wrong call for another: US pickleball genuinely skews older, but every
    // other athlete in the coverage set is 13–18, so the pickleball tile was the single tile
    // that did not look like the rest of the shop. The customer put it plainly — sixteen young
    // athletes and one older man does not sit together.
    //
    // The older demographic was never actually lost by fixing this: THE AGE LADDER already
    // answers "does this fit my person?" with rungs at 22, 32 and 50. Ray was answering a
    // question that was already answered, in the row whose only job is "is my sport here?".
    //
    // So Nadia is the pickleball athlete the coverage row shows, and Ray is kept rather than
    // deleted — his eight frames are approved and he is a real asset for the older end. She
    // shares his CLUB on purpose: same crest, same colours, so the two read as one programme
    // rather than two, exactly the way the six ladder athletes share theirs.
    slug: "pickleball-youth", sport: "pickleball",
    firstName: "Nadia", lastName: "Rahimi", jerseyNumber: "0",
    ageYears: 16, age: HS(16), presents: "female",
    build: "5'6\", compact and quick rather than tall — short-limbed, low to the ground, with strong thighs and calves and light, fast hands. Solid through the middle rather than slender, with no visible muscle definition in the arms",
    skinTone: "warm olive skin that tans easily, a little sun on the nose and the tops of the cheeks",
    // No headband and no wristband in this field — both are kit and live in kits.ts (§37). What
    // is true of her hair on a Tuesday at school is what belongs here.
    hair: "very dark brown, thick and slightly wavy, pulled back into a high ponytail that swings clear of the shoulders",
    face: "thick dark eyebrows that nearly meet, a strong straight nose, wide-set dark brown eyes, a small mole high on the right cheek",
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

  /* ------------------------------------------------------------------- 3. REAL ORDERS */

  {
    // ORDER 01, 2026-08-22 — the first order built from a customer's own photographs rather
    // than from words. Everything below the identity fields is DESCRIPTION, not decision:
    // the plate is built from `before/`, and README section 39 gives the photographs the
    // final word wherever the two disagree.
    //
    // TWO THINGS THE ORDER FORM DID NOT SAY and that are read off the photographs instead:
    // his age (the form has a graduation year of 2018, which cannot be a school year for a
    // man in his forties — it is being used as a season), and the fact that no photograph
    // shows a basketball kit at all. The second is the normal case, not a defect: he gets
    // the sport's default strip from kits.ts with his club's badge on it.
    slug: "Order 01", sport: "basketball", order: true,
    firstName: "Tautvydas", lastName: "Beržinis", jerseyNumber: "8",
    ageYears: 42,
    age: "in his early forties — a grown man playing recreational league basketball. Visibly forty-something, NOT a college player",
    presents: "male",
    build: "solid and broad through the shoulders and chest, strong forearms, a full frame rather than a lean one — an adult build carrying real weight, NOT slimmed down and NOT cut",
    skinTone: "fair skin with a warm flush across the cheeks and nose, lines at the eyes",
    hair: "dark brown going noticeably grey at the temples and through the sides, worn swept up and back off the forehead with short tapered sides",
    face: "a short greying beard heaviest at the chin, straight dark eyebrows, blue-grey eyes, a broad nose, a squared jaw softened with age",
    team: "Be Šansuu", crest: "be-sansu",
    primaryColor: "#14275B", secondaryColor: "#FFFFFF", colorName: "dark navy blue",
  },

  {
    // ORDER 02, 2026-08-22 — tennis, black and white, NO CLUB LOGO (the shirt ships plain).
    //
    // FOUR PHOTOGRAPHS, TWO OF THEM ANCHOR GRADE. Intake rejected the set 2-of-4: one photo
    // has her at 162 px across an airport concourse, another puts a second face beside her.
    // The plate is therefore built from two close portraits and has NO photograph of her
    // standing, so `build` below is doing real work rather than reinforcing — it is read off
    // the one full-length frame intake refused as a face anchor. If frame 3 of the plate comes
    // back the wrong shape, that is the reason, and the fix is another photograph.
    //
    // NAME IS A PLACEHOLDER until the order form arrives; nothing on the plates prints it.
    slug: "Order 02", sport: "tennis", order: true,
    firstName: "Order", lastName: "02", jerseyNumber: "",
    ageYears: 30,
    age: "around thirty — an adult woman, not a junior and not middle-aged",
    presents: "female",
    build: "slim and long-limbed, narrow through the shoulders and waist, average height — a light frame rather than a muscular one, and NOT to be broadened or slimmed further",
    // "fair" was the wrong word and it pulled both plates toward ashen. Her photographs show a
    // definite warm tan, not fair skin with a hint of one.
    skinTone: "warm, sun-tanned skin with a golden undertone — noticeably tanned rather than fair, with small dark moles scattered on the cheeks and neck and a natural flush across the cheekbones",
    hair: "long straight blonde hair, worn loose and parted slightly off-centre, falling well past the shoulders",
    face: "a soft oval face with high cheekbones, straight dark eyebrows several shades darker than her hair, grey-blue eyes, a small straight nose",
    team: "", crest: "",
    primaryColor: "#111111", secondaryColor: "#FFFFFF", colorName: "black",
  },

  {
    // ORDER 03, 2026-08-23 — basketball, Mad Lamb #51. Everything below is read off the
    // photographs; no order form arrived with it.
    //
    // FOUR PHOTOGRAPHS, TWO ANCHOR GRADE, and intake still says REJECTED at 2 of 3. One of the
    // two was recovered by the second pass — an award ceremony where the organiser's face is
    // the same size as his, which the old ambiguity test refused outright. The other two are
    // match action at 102 and 116 px; both are kept as full-length references instead, and one
    // of them is the SHARPEST photograph in the set (430) by a wide margin.
    //
    // THE CLUB BADGE IS VISIBLE ON HIS SHORTS in the action frame and we do not have the file.
    // crest stays empty on purpose: an approximation of a real club's mark is worse than none
    // (crests.ts, rule 1). Ask the customer to upload it.
    //
    // HIS REAL KIT IS IN THE PHOTOGRAPHS — purple with gold "Mad Lamb" script and the 51 — so
    // the kit plate has something to reproduce rather than a sport default to fall back on.
    // The script lettering is the risk: image models mangle letterforms, and this is a real
    // club's wordmark, so it is exact or it is absent.
    slug: "order 03", sport: "basketball", order: true,
    firstName: "Order", lastName: "03", jerseyNumber: "51",
    ageYears: 32,
    age: "early thirties — a grown man playing competitive amateur league basketball",
    presents: "male",
    build: "tall and long-limbed with broad shoulders and a deep chest, strong thighs, lean through the waist — a real basketball frame, neither slight nor heavy",
    skinTone: "fair skin, flushed across the cheeks and forehead from playing, damp at the hairline",
    hair: "dark brown, short at the sides and longer on top, swept back off the forehead and pushed around by sweat",
    face: "a short dark beard following the jaw with a fuller moustache, straight brows, brown eyes set fairly deep, a straight nose",
    team: "Mad Lamb", crest: "",
    primaryColor: "#6F2C57", secondaryColor: "#E0B02E", colorName: "deep plum purple",
    secondaryName: "gold",
  },

  {
    // ORDER 4164205493 (Etsy), 2026-09-04 — tennis, Rita Gataveckaite, #12, "Vilnius".
    // FIVE PHOTOGRAPHS, four usable: intake kept rita1/rita2/rita3/rita4 as anchors and
    // `ritafull` as the FULL-LENGTH reference only (52 px face). No photograph turns to her
    // RIGHT, so the plate's right-hand panel is the weak one — README section 39 still applies:
    // where these words and the photographs disagree, the WORDS change.
    //
    // THREE THINGS THE ORDER FORM LEFT AT "N/A" and that are therefore DECISIONS, not readings:
    //  1. The DECISION is white kit with deep navy trim. She gave no club colours, and tennis
    //     whites with one accent is the sport's own default rather than an invented identity.
    //  2. The DECISION is a tennis DRESS, not the shorts in kits.ts. `BASE.tennis` is written
    //     for a youth boys' strip and its own comment says a skirt "belongs in Athlete.kit,
    //     where it is a decision rather than a coin toss". She is an adult competitor.
    //  3. The DECISION is no crest. "Vilnius" is a city, no club mark was uploaded, and
    //     crests.ts rule 1 forbids approximating a real one.
    //
    // THE NUMBER IS CARD-ONLY. The customer supplied #12, but a tennis shirt carries no
    // number (kits.ts hasBackNumber, README section 41) — so 12 prints on the CARD and appears
    // nowhere on the garment. Putting it on the dress would be an invented mark.
    slug: "order-4164205493", sport: "tennis", order: true, level: "pro",
    firstName: "Rita", lastName: "Gataveckaitė", jerseyNumber: "12",
    ageYears: 25,
    age: "in her mid-twenties — an adult woman competing, not a junior",
    presents: "female",
    build: "slim and long-limbed with narrow shoulders and a narrow waist, a light athletic frame rather than a muscular one — NOT to be broadened and NOT to be slimmed further",
    skinTone: "fair skin with a light natural warmth, a faint flush across the cheekbones, a few small dark moles on the neck and collarbone",
    // COLOUR IS AN ABSOLUTE, NOT A RANGE. Two plates drifted to a lighter, sun-bleached brown
    // because "dark brown" sat next to nothing that forbade the alternative — prompt law:
    // absolutes, not comparisons. Her photographs are unambiguous.
    hair: "long DARK BROWN hair — a deep cool brown, NOT blonde, NOT sun-bleached and with NO lighter ends — straight to softly waved, parted slightly off-centre and falling well past the shoulders",
    face: "an oval face with high cheekbones and a defined jawline, straight well-groomed dark eyebrows, blue-grey eyes, long lashes, a small straight nose and full lips",
    // THE PONYTAIL IS KIT, NOT IDENTITY (README section 37, and the same call as the tennis
    // HEADBAND that already lives in kits.ts). It is worn to play and taken out after, so it
    // may not follow her into the identity plate — but it MUST be pinned somewhere, or every
    // frame re-rolls it: the first two plates came back a low bun, loose hair and loose hair
    // again, in three panels of two images. Stated here it reaches the kit plate and all four
    // poses through the same string.
    kit: "a white tennis DRESS with a {primary} collar and {primary} trim at the armholes, a pleated skirt to mid-thigh with fitted white shorts beneath it, and a matching white wristband on the non-racket wrist",
    hairPlay: "ON COURT her hair is drawn back into a HIGH PONYTAIL: pulled tight off the face and neck, no loose hair falling over the face, and the SAME ponytail in every frame.",
    team: "Vilnius", crest: "",
    primaryColor: "#1B2A4A", secondaryColor: "#FFFFFF", colorName: "deep navy",
  },
];

export const athleteBySlug = (slug: string) => ATHLETES.find((a) => a.slug === slug);

/** The age ladder, in order, for the site's "who is it for" row. */
export const AGE_LADDER = ["soccer-age-07", "soccer-age-10", "soccer", "soccer-age-22", "soccer-age-32", "soccer-age-50"]
  .map((s) => athleteBySlug(s)!)
  .sort((a, b) => a.ageYears - b.ageYears);
