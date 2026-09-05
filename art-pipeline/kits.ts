// The basic uniform of each sport.
//
// WHY THE KIT MOVED OUT OF `athletes.ts`
// On the ice-hockey pilot the uniform changed between poses — solid navy with a red hem in
// one shot, red shoulders and sleeves in the next. Colours had been specified; the garment
// had not, and the model designs a new jersey every run. Fatal, because all three front
// cutouts sit together in ONE poster composite.
//
// But the deeper reason it lives here is the per-order tool. A uniform is a property of the
// SPORT, not of the person:
//   - if the customer's photos show their real team kit, we keep theirs (an athlete-level
//     override, `Athlete.kit`)
//   - if they do not, we dress them in the sport's basic kit in their team colours
// That is exactly the branch `kitFor` implements, and it is why the demo roster leaves
// `kit` empty almost everywhere: the demo should exercise the same path a real order takes.
//
// `{primary}` is replaced with the athlete's colour NAME (not the hex — the hex is stated
// separately in the prompt, and a model dresses a figure better from "kelly green" than
// from "#1E7B3C").

// GARMENTS ONLY. Footwear and equipment are owned by FOOTWEAR and CONSTANTS below, and were
// briefly described in both places — the kit line said "all-white cleats" while the constants
// said "black boots", and the judge duly failed a frame for obeying one of them. Two sources
// for one fact is the failure family README section 5 is about. One fact, one home.
const BASE: Record<string, string> = {
  basketball: "a {primary} sleeveless basketball jersey with contrasting side panels and trim at the neck and armholes, matching {primary} shorts with a stripe down each leg",
  football: "a {primary} football jersey with contrasting numerals and shoulder panels worn over shoulder pads, football pants, and a {primary} helmet with a grey facemask",
  baseball: "a {primary} baseball jersey with contrasting piping and a button placket, grey baseball pants with a {primary} stripe, a {primary} belt, and a {primary} cap",
  softball: "a {primary} softball jersey with contrasting sleeve trim, grey softball pants, a {primary} belt, and a {primary} visor",
  soccer: "a {primary} soccer jersey with contrasting sleeve trim and collar, {primary} shorts, and shin guards under the socks",
  "ice-hockey": "a {primary} hockey jersey with contrasting trim at the waist hem and collar, {primary} breezers, {primary} gloves, and a {primary} helmet",
  volleyball: "a {primary} sleeveless volleyball jersey with contrasting shoulder trim, {primary} spandex shorts, and knee pads on both knees",
  lacrosse: "a {primary} lacrosse jersey with contrasting shoulder yokes worn over pads, {primary} shorts with a side stripe, a {primary} helmet and {primary} gloves",
  wrestling: "a {primary} singlet with a contrasting band across the chest and trim at the leg openings, a knee pad on one knee, and {primary} headgear",
  // The BOW is a uniform item, not a hairstyle — it is worn to compete and taken off after.
  // It sits here so it appears in the match photograph, on the kit plate and in every pose,
  // and nowhere else in her life. README §37.
  cheerleading: "a {primary} sleeveless cheer top with a contrasting V panel across the chest, a matching {primary} skirt, and a large {primary} competition bow worn at the crown of the ponytail",
  gymnastics: "a {primary} long-sleeved gymnastics leotard with a contrasting chevron across the chest and contrasting cuffs, bare legs, bare feet, chalk on the palms",
  // COMPRESSION SHORTS, NOT BRIEFS. Racing briefs are what the senior sport wears, and the
  // first roll of Imani's match frame (2026-08-22) came back PROHIBITED_CONTENT — the model
  // refused a sixteen-year-old described in briefs at the close framing the kit frame asks
  // for. Mid-thigh compression shorts are what US high-school programmes actually race in,
  // so this is the more accurate line for a youth product as well as the generatable one.
  // It is in BASE and not BASE_WOMENS deliberately: it is an AGE call, true of the boys'
  // uniform too, and BASE_WOMENS is only for where the rules of the sport differ.
  "track-field": "a {primary} sleeveless track singlet with a contrasting side panel and matching {primary} mid-thigh compression shorts",
  // MEN'S swimming, because the rules genuinely differ — see BASE_WOMENS below. A men's racing
  // suit is jammers and no top; the women's is a one-piece. This is a §32 rules difference, not
  // a cut, which is why it is in the table rather than in an athlete's record.
  swimming: "{primary} competition JAMMERS — close-fitting racing shorts reaching from the waist to just above the knee, with a contrasting stripe down each side — worn with NO top of any kind, plus a {primary} silicone swim cap and goggles",
  // WAS "{primary} shorts or skirt", which is a MENU, and the model takes the first item on a
  // menu (§10, the football crest placement). Both are legal in tennis; a skirt for an athlete
  // who wears one belongs in `Athlete.kit`, where it is a decision rather than a coin toss.
  // The HEADBAND came out of the tennis athlete's `hair` field — §37: it is worn to play and
  // taken off after, so it may not follow him to the sofa in all four "before" photographs.
  tennis: "a white tennis shirt with {primary} collar and {primary} sleeve trim, {primary} shorts, a white terry HEADBAND across the forehead, and a matching white wristband on the non-racket wrist",
  golf: "a {primary} golf polo with a contrasting collar, tailored golf trousers, a belt, a {primary} cap and a glove on the leading hand",
  pickleball: "a {primary} athletic t-shirt with contrasting shoulder seams and {primary} shorts",
  // SKATEBOARDING (the `other-sport` slot). Skating has no uniform — it has clothes — so the
  // kit is the streetwear a park skater actually wears, put into the club colours. The HELMET
  // and KNEE PADS are a §32 rules call, not decoration: this athlete is sixteen, and public
  // skateparks in the US require a helmet for under-18s. A skate helmet is an open bucket and
  // hides none of the face, so unlike the football helmet it costs the card nothing.
  "other-sport": "a loose-fitting {primary} skate T-shirt with contrasting sleeve trim, worn with knee-length {primary} skate shorts, a matching {primary} OPEN-FACE skate helmet — a low round bucket that covers the skull and ears and leaves the whole face clear, with NO cage, NO visor and NO facemask — and a knee pad on each knee",
};

/**
 * FOOTWEAR AND BALL ARE NAMED, not left to the model. On the seven-year-old the four poses
 * came back with white boots, black boots and grey boots, and two different balls — and the
 * three front cutouts sit side by side in one composite, so a change of boot reads as a
 * mistake the moment the card is printed. Same failure as the jersey: anything not pinned
 * down gets redesigned every run.
 */

/**
 * How the kit SITS on the body at this age. This is not decoration — it is the single
 * detail that makes an age read as that age.
 *
 * A model dresses every figure in a perfectly tailored uniform by default, and a small
 * child in a perfectly fitted kit stops looking like a child and starts looking like a
 * doll. Real seven-year-olds wear a jersey handed down or bought to grow into. At the other
 * end, a fifty-year-old in a factory-fresh kit reads as a model in a catalogue rather than
 * someone who has played in the same league for a decade.
 */
function fitFor(ageYears: number, level?: "pro"): string {
  // THE AGE LADDER SILENTLY ASSUMED RECREATIONAL. Every band from 20 up says "plainly not a
  // professional's", which is right for the roster and wrong the moment a customer writes
  // "Pro" in the position field (Etsy order 4164205493). An adult competitor in a kit cut
  // "a little loose" reads as somebody borrowing the sport. Level is a separate axis from
  // age, so it gets its own branch rather than a fifth age band.
  if (level === "pro") {
    return "A competitor's kit: cut athletic and close to the body, sitting exactly as it should. Immaculate. Nothing about it is sponsored.";
  }
  if (ageYears <= 9) {
    // WRITTEN TOO STRONGLY, and it cost several good frames. "CLEARLY TOO BIG ... essential"
    // made the rubric reject premium-looking shots for not being baggy enough, and it fights
    // the clean, advertising-grade look these poses are for. A child's kit reading slightly
    // large is enough to stop them looking like a doll; a tent is not required.
    return "The kit is a size large on them, the way a child's team kit usually is — sleeves a little long, shorts to around the knee, a touch loose through the body. Clean and well kept. Not baggy or comical, just not tailored.";
  }
  if (ageYears <= 12) {
    return "The kit is slightly too big — bought with room to grow. Sleeves a little long, shorts to the knee, socks not quite pulled all the way up. Clean and well kept.";
  }
  if (ageYears <= 19) {
    return "The kit fits properly and is clean and well kept.";
  }
  if (ageYears < 45) {
    return "An adult recreational league kit — fits, but plainly not a professional's: cut a little loose rather than athletic. Clean.";
  }
  return "A recreational league kit worn for several seasons: clean and well kept, the fit generous rather than athletic. Nothing about it is sponsored.";
}

/**
 * WHERE THE WOMEN'S GAME IS A DIFFERENT GAME, not a different cut.
 *
 * `BASE.lacrosse` describes the MEN'S kit — helmet, shoulder pads, gloves — because that is
 * what "lacrosse kit" returns if you never ask the question. Women's lacrosse forbids body
 * checking and therefore has no helmet and no pads at all: protective GOGGLES, a mouthguard,
 * a kilt or shorts, and a shallower stick pocket. Dressing a sixteen-year-old girl in a
 * men's cage helmet is not a rendering defect — it is the research defect this pipeline
 * keeps rediscovering (README §20, and the lineman's poses before that): the picture obeys
 * the description, and the description was about a different sport.
 *
 * Only sports whose RULES differ belong here. Baseball/softball are already separate sports,
 * and a girl's soccer or basketball kit is the same garment — those must NOT be listed, or
 * the table becomes a place to encode assumptions about how girls dress.
 */
const BASE_WOMENS: Record<string, string> = {
  // SWIMMING is the second entry, and it qualifies on the same test as lacrosse: the RULES
  // differ, not the cut. World Aquatics/NFHS racing suits are sex-specific by regulation — a
  // men's suit may not extend above the navel, a women's may not cover the neck or extend past
  // the shoulder — so "swimming kit" without the question returns jammers for a girl.
  //
  // ⚠️ `Sport.onePiece` in sports.ts describes the WOMEN'S one-piece, because the only swimmer
  // on the roster is female. It is a single string on the sport and does not branch on
  // `presents` the way this table does. The first male swimmer needs it to branch, or his kit
  // plate will lay out a one-piece while his kit line says jammers.
  swimming:
    "a {primary} one-piece competition swimsuit — a racerback racing suit, high-cut at the leg, " +
    "with a contrasting stripe down each side and a plain closed back — worn with a {primary} " +
    "silicone swim cap and goggles",
  lacrosse:
    "a {primary} sleeveless lacrosse jersey with contrasting trim at the collar and armholes, " +
    "a matching {primary} lacrosse KILT (a short pleated skirt) with fitted shorts beneath it, " +
    "and protective GOGGLES over the eyes — the women's game has NO helmet, NO cage, NO " +
    "shoulder pads and NO gloves",
};

/**
 * The uniform for this athlete: their own kit if they have one (the customer's real team
 * strip), otherwise the sport's basic kit in their team colours. Fit is always applied.
 */
export function kitFor(a: { sport: string; kit?: string; colorName: string; secondaryName?: string; ageYears: number; presents?: "male" | "female"; level?: "pro" }): string {
  const womens = a.presents === "female" ? BASE_WOMENS[a.sport] : undefined;
  const base = a.kit ?? womens ?? BASE[a.sport];
  if (!base) throw new Error(`no default kit for sport "${a.sport}" — add one to kits.ts`);
  // "contrasting" NAMED NOTHING, so the model chose. Order 03's plum-and-GOLD kit came back
  // plum and magenta, because the athlete's secondary colour was never mentioned in the line
  // that decides the trim. A relative word does nothing; a named colour works.
  const withSecondary = a.secondaryName
    ? base.replaceAll("contrasting", `${a.secondaryName}`)
    : base;
  return `${withSecondary.replaceAll("{primary}", a.colorName)}. ${fitFor(a.ageYears, a.level)}`;
}

/**
 * DOES THIS SPORT CARRY AN IMPLEMENT AT ALL?
 *
 * The kit plate demands "the ball or implement of <sport>" as a hard requirement and the
 * `all_items_present` check fails a plate without one. Four sports have none — wrestling,
 * gymnastics, track and field, and the generic fallback — and their CONSTANTS entries say so
 * in plain words ("no ball or implement of any kind"). Asking a flat lay for an object the
 * sport does not have is how a wrestling plate ends up with an invented ball in the corner.
 *
 * Derived from the table above rather than duplicated into a second list: a sport whose
 * constant STARTS with "no" has nothing to lay out. One fact, one home.
 */
export const hasImplement = (a: { sport: string }) => !/^no\b/i.test(CONSTANTS[a.sport] ?? "");

/**
 * DOES THIS SPORT WEAR ANYTHING ON THE FEET AT ALL?
 *
 * Same defect as hasImplement, found one sport later. The kit plate demands "both socks, both
 * shoes" as a hard requirement and `all_items_present` fails a plate without them — so
 * gymnastics, whose whole sport is performed BAREFOOT, was graded FAIL for a correct plate:
 * "the socks, shoes and implement explicitly requested by the check are missing". A rubric that
 * fails correct work teaches everyone to ignore it, which is worse than no rubric.
 *
 * Derived from the FOOTWEAR table rather than a second list: a sport whose footwear line starts
 * with "bare" or "no" wears nothing. Swimming is the other one.
 */
export const hasFootwear = (a: { sport: string }) => !/^(bare|no)\b/i.test(FOOTWEAR[a.sport] ?? "");

/**
 * DOES THE BACK OF THIS SHIRT CARRY THE SQUAD NUMBER AT ALL?
 *
 * Third time this exact shape of bug: the kit-back plate and the from-behind pose both
 * ASSERTED the number across the upper back, unconditionally, in a line that sits AFTER the
 * frozen spec in the prompt and therefore beats it. Imani's spec said in as many words that
 * the back of the track singlet stays plain because the race number lives on a bib on the
 * shorts — and the plate came back with a 30 cm black 8 across the shoulders anyway
 * (2026-08-22). That is README §36's invented back number, wearing a third hat.
 *
 * It is not derivable from anything already here, so it is a table. Team-sport shirts are
 * numbered across the back; the individual sports are not, and their number — where they have
 * one at all — lives somewhere else or nowhere: a race bib in track, nothing on a swimsuit, a
 * sleeve in gymnastics, nothing on a tennis shirt or a golf polo.
 *
 * ⚠️ The DEFAULT IS FALSE. A sport missing from this table gets a plain back, which is the
 * safe direction: a missing number is a visible gap someone fixes, an invented one is a mark
 * printed on a garment the athlete does not own.
 */
const BACK_NUMBER = new Set([
  "basketball", "football", "baseball", "softball", "soccer", "ice-hockey", "volleyball",
  "lacrosse",
]);

export const hasBackNumber = (a: { sport: string }) => BACK_NUMBER.has(a.sport);

/** True when this athlete's kit came from the customer rather than the sport default. */
export const hasOwnKit = (a: { kit?: string }) => Boolean(a.kit);

/**
 * The properties a reference photograph CANNOT settle, so they must be stated every time.
 *
 * THE BUG THIS FIXES: the ball and the boots were described inside the kit template, and the
 * kit template is only emitted when there is NO reference photograph. With a real kit photo
 * attached, that text was never sent at all — and since the reference showed no ball, the
 * model invented a different one in every pose. Three poses came back with a plain white
 * ball, a white-and-blue ball and a white-and-green ball, and one of them put white socks on
 * a green kit.
 *
 * So these go out on EVERY pose, reference or not. They are the things three side-by-side
 * cutouts would otherwise disagree about.
 */
const CONSTANTS: Record<string, string> = {
  basketball: "a plain orange basketball with black seams and no visible branding",
  football: "a plain brown leather American football with white laces and no visible branding",
  baseball: "a plain white baseball with red stitching, and a plain wooden bat",
  softball: "a plain yellow softball with white stitching",
  soccer: "a plain WHITE soccer ball with black pentagon panels — no coloured panels, no patterns, no markings, no branding",
  "ice-hockey": "a plain black rubber puck and a plain wooden-toned stick with black tape on the blade",
  volleyball: "a plain white volleyball with pale blue accents and no branding",
  lacrosse: "a plain white lacrosse ball and a plain unbranded crosse",
  wrestling: "no ball or implement of any kind",
  cheerleading: "plain pom-poms in the team colours",
  gymnastics: "no apparatus in frame",
  "track-field": "no implement in frame",
  swimming: "no equipment beyond cap and goggles",
  tennis: "a plain yellow tennis ball and a plain unbranded racket",
  golf: "a plain white golf ball and a plain unbranded club",
  pickleball: "a plain yellow perforated pickleball and a plain unbranded paddle",
  // Skateboarding's implement is the BOARD, and it is in every frame — so this must NOT start
  // with "no", or hasImplement() reads the sport as having none and the flat lay omits it.
  "other-sport": "a plain unbranded SKATEBOARD — a wooden popsicle-shape deck with plain black grip tape across the whole top, the underside plain in the team colour, plain black trucks and plain white wheels. NO graphic, NO logo, NO lettering and no sponsor mark anywhere on the deck, the trucks or the wheels",
};

/**
 * Stated on every pose so the set agrees with itself. `colorName` fixes the socks, which is
 * the other thing the model quietly changes between frames.
 */
export function setConstants(a: { sport: string; colorName: string }): string {
  const ball = CONSTANTS[a.sport] ?? "no implement in frame";
  const shoes = FOOTWEAR[a.sport] ?? "plain white athletic shoes with black soles";
  return [
    `CONSISTENT ACROSS THE WHOLE SET — three of these frames sit side by side on one card, so`,
    `these must be identical in every shot and are not open to interpretation:`,
    `- Socks are ${a.colorName}, matching the kit. Never white, never a different colour.`,
    `- Equipment: ${ball}. The same one in every shot.`,
    `- Footwear: ${shoes}. The same pair in every shot, clean and unmarked.`,
  ].join("\n");
}

/**
 * NAME THE SHOES. The set constants first said only "the same boots in every shot" and the
 * four poses came back in navy, grey-green, black and olive footwear — while the ball, which
 * WAS named concretely in the same block, came back correct. That contrast is the clearest
 * demonstration of the rule this whole pipeline keeps rediscovering (README section 5):
 * a relative instruction does nothing, a named object works.
 *
 * A reference photograph that clearly shows their real boots still wins — the pose prompt
 * says so — but something specific has to be here for every case where it does not.
 */
// NAME THE SOLE, not just the colour. "plain black soccer boots" returned flat black
// fashion sneakers with white soles — obedient to every word and wrong about the object. The
// sole is what makes a sports shoe a sports shoe, so it is the part that has to be described.
const FOOTWEAR: Record<string, string> = {
  basketball: "plain white high-top basketball sneakers with black soles",
  football: "plain black American football cleats with a studded outsole and a high ankle collar. NOT sneakers",
  baseball: "plain black baseball cleats with a studded outsole. NOT sneakers",
  softball: "plain black softball cleats with a studded outsole. NOT sneakers",
  soccer: "plain black SOCCER CLEATS — proper football boots with a studded outsole (moulded conical studs clearly visible), a low profile and a slim toe box. NOT sneakers, NOT trainers, NOT flat-soled shoes",
  "ice-hockey": "plain black ice skates with silver blades",
  volleyball: "plain white court shoes with grey accents",
  lacrosse: "plain black lacrosse cleats with a studded outsole. NOT sneakers",
  wrestling: "plain black wrestling shoes with white soles",
  cheerleading: "plain white cheer sneakers",
  gymnastics: "bare feet",
  "track-field": "plain white sprint spikes with a rigid plate and visible pins in the forefoot. NOT sneakers",
  swimming: "bare feet",
  tennis: "plain white court shoes",
  golf: "plain white golf shoes",
  pickleball: "plain white court shoes with grey accents",
  "other-sport": "plain black SKATE SHOES — flat vulcanised gum-rubber soles with no heel lift at all, a wide rounded toe, a padded tongue and a reinforced suede side panel. NOT running shoes, NOT trainers with a chunky sole, NOT high-tops",
};

/**
 * WHAT IS WORN UNDER THE SHIRT — and why the kit plate cannot say it.
 *
 * The football set failed here in a way none of the earlier fixes could reach. The wardrobe
 * anchor is a FLAT LAY, and a flat lay shows garments; it cannot show what a garment does
 * once a body and a set of pads are inside it. So the poses copied the jersey correctly and
 * put it on an unpadded torso, and the silhouette that says "American football" from across
 * a room — the wide square shelf of the shoulder pads — was simply absent. The athlete's own
 * photograph has it in every frame. The renders had it in none.
 *
 * It is not a detail. In a padded sport the pads ARE the outline, and the outline is what
 * survives being cut out, muted to 45% and printed at card size. A correct jersey on the
 * wrong silhouette reads as the wrong sport.
 *
 * Stated on every pose, padded sports only, and always — the frozen spec replaces
 * `setConstants` in the pose prompt, so anything hidden inside that function stops being
 * sent the moment an athlete has a spec, which is exactly the case this had to fix.
 */
const PADDING: Record<string, string> = {
  football:
    "SHOULDER PADS ARE WORN UNDER THE JERSEY and they decide the silhouette. The shoulders " +
    "are WIDE, SQUARE and RAISED: a straight horizontal shelf running from the point of one " +
    "shoulder to the point of the other, sitting well outside and above where the athlete's " +
    "own shoulders are, with a hard corner at each end rather than a slope. The chest above " +
    "it is deep and slab-flat and the neck looks short between the pads. The sleeves begin " +
    "on the outer edge of that shelf, out over the arm, not on the shoulder itself. The " +
    "jersey is pulled taut across the pads and hangs loose only below the ribs. A jersey " +
    "that follows the athlete's own shoulder line is the wrong sport.",
  "ice-hockey":
    "SHOULDER AND ELBOW PADS ARE WORN UNDER THE JERSEY. The shoulders are wide and square " +
    "rather than sloped, the upper arms are thick all the way to the elbow, and the jersey " +
    "is carried out away from the ribs by the pads underneath rather than following the body.",
  lacrosse:
    "SHOULDER PADS AND ARM PADS ARE WORN UNDER THE JERSEY. The shoulders are square and " +
    "raised, the upper arms thickened, and the jersey stands off the torso rather than " +
    "clinging to it.",
};

/**
 * How the kit sits on the body once the pads are under it. Empty for unpadded sports — and
 * for the women's game where the sport itself has no pads (see BASE_WOMENS above): lacrosse
 * pads are a men's-game object, and a padded silhouette on a girl's kilt is the men's sport
 * wearing the women's uniform.
 */
const unpaddedForWomen = new Set(["lacrosse"]);
export const paddingFor = (a: { sport: string; presents?: "male" | "female" }): string =>
  (a.presents === "female" && unpaddedForWomen.has(a.sport)) ? "" : (PADDING[a.sport] ?? "");

/** True when this sport's shirt is worn over pads — the fit rules change if it is. */
export const isPadded = (a: { sport: string; presents?: "male" | "female" }) => Boolean(paddingFor(a));
