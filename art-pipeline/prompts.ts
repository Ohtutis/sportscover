import type { Finish } from "./finishes.js";
import type { Sport } from "./sports.js";
import type { Athlete } from "./athletes.js";
import type { Crest } from "./crests.js";
import type { Pose } from "./poses.js";
import { hasBackNumber, hasImplement, isPadded, kitFor, paddingFor, setConstants } from "./kits.js";

/**
 * Background prompt.
 *
 * The whole automation rests on this: the finish is carried by the REFERENCE
 * IMAGE, not by words, so a new sport inherits the exact approved set. The text
 * only says what to swap. Keep the swap list short — the longer the instruction,
 * the more the model drifts off the reference.
 */
export function backgroundPrompt(finish: Finish, sport: Sport): string {
  // Golf is grass and a hole; swimming is water. Etching "markings" into a mirror floor is
  // meaningless for them, so they keep their real material even on a studio set.
  const realSurface = finish.keepsRealSurface || sport.needsRealSurface === true;

  // When the venue itself is being replaced, finish.material still describes the reference's
  // architecture ("a high domed timber roof", "tiered seating all the way round") and would
  // contradict the VENUE block below. Narrow it to the look, which is what a finish IS.
  const venueChanges = Boolean(finish.venueBased) && sport.venue !== "indoor";

  // A studio finish pins the ground to `finish.floor` — an INDOOR arena floor. Combined
  // with an outdoor VENUE that produced an open-air stadium with a parquet floor: Prism
  // Rush soccer had night sky, floodlights and visible wood grain under the neon lines.
  // Outdoors the ground has to become the sport's real surface, but graded into the finish
  // and carrying the finish's own line treatment.
  const outdoorStudio = venueChanges && !realSurface;

  const surface = outdoorStudio
    ? [
        // Naming sport.material here reintroduced the contradiction it took three passes to
        // remove elsewhere: "becomes blue hard court with a green surround" directly above
        // "no bright blue or green court". When the finish dictates the material, it
        // REPLACES the sport's own description rather than arguing with it.
        ...(finish.materialNote
          ? [
              `1. The ground becomes the surface ${sport.name} is played on — ${sport.material} —`,
              `   carrying ${sport.markings}.`,
            ]
          : [`1. The ground becomes ${sport.material}, carrying ${sport.markings}.`]),
        `   There is NO indoor arena floor here — no parquet, no wooden boards, no polished`,
        `   studio surface. It is the real outdoor playing surface of a ${sport.name} venue.`,
        `   Grade it deep and dark into this finish so it takes the finish's own colour and`,
        `   light, never a bright daylight photograph pasted in.`,
        // materialNote was wired into the realSurface branch only, so a studio finish going
        // outdoors never received it: Fire & Smoke tennis kept a bright blue hard court with
        // a green surround under an ember-lit night sky.
        ...(finish.materialNote ? [`   ${finish.materialNote}.`] : []),
        `   Take only the surface's TEXTURE and form from the real sport — its real-world`,
        `   paint colours do not survive into this finish.`,
        ...(finish.lineNote ? [`   ${finish.lineNote}.`] : []),
        `   Life scale, shot from standing height: only a fragment fits in frame and it runs`,
        `   out past the edges. Never a miniature of the whole field.`,
      ]
    : realSurface
    ? [
        // When the finish dictates an era, it REPLACES sport.material rather than sitting
        // next to it. Emitting both produced "the ground becomes blue hard court ... never
        // a blue acrylic hard court" in one prompt — the exact contradiction README §5
        // blames for the model picking a different half on every run.
        ...(finish.materialNote
          ? [
              `1. The ground becomes the surface ${sport.name} is played on — ${sport.material} —`,
              `   carrying ${sport.markings}.`,
              `   ${finish.materialNote}.`,
            ]
          : [`1. The ground becomes ${sport.material}, carrying ${sport.markings}.`]),
        ...(finish.keepsRealSurface
          ? []
          : [
              `   Grade it into this set: darkened and colour-matched to the finish so it`,
              `   belongs in the room, not a bright daylight photograph pasted in.`,
            ]),
        `   Life scale, shot from standing height: only a fragment fits in frame and it runs`,
        `   out past the edges. Never a miniature of the whole field.`,
      ]
    : [
        `1. The floor STAYS ${finish.floor} — same material, same reflections as the reference.`,
        ...(finish.lineNote
          ? [`   Draw ${sport.markings} into it.`, `   ${finish.lineNote}.`]
          : [
              `   Etch ${sport.markings} into it as faint luminous inlay lines, like lighting`,
              `   recessed under glass.`,
            ]),
        `   Do NOT lay a real playing surface on top of it: no ${sport.material}, none of its`,
        `   colour anywhere in the frame. The floor stays exactly as dark as the reference.`,
        `   Life scale: the etched lines run out past the frame edges, never a miniature of`,
        `   the whole field.`,
      ];

  const placement =
    sport.propPlacement === "centre"
      ? [
          `   PLACEMENT: this equipment is used in the MIDDLE of play, so put it in the middle`,
          `   of the playing area — centred, set back from camera. Do not push it to the side`,
          `   or against the back wall. It sits low enough that a standing athlete composited`,
          `   in front of it still reads clearly.`,
        ]
      : [
          `   PLACEMENT: this belongs at the EDGE of the field, so set it off to one side.`,
          `   Keep the centre of the frame open.`,
        ];

  return [
    `Use the attached image as the exact art direction reference. Recreate that same set:`,
    `${finish.material}.`,
    ...(venueChanges
      ? [
          `Take from that description ONLY its palette, light quality, atmosphere and mood.`,
          `Do NOT keep its architecture — the building itself is replaced, see VENUE below.`,
        ]
      : []),
    ``,
    `Change ONLY these things:`,
    ...surface,
    ...(sport.props
      ? [`2. Add ${sport.props}.`, ...placement]
      : [
          `2. Add NO sport equipment whatsoever — no goal, no net, no posts, no hoop, no`,
          `   bench, no seating, no apparatus of any kind. This sport is deliberately`,
          `   generic, so any recognisable equipment would turn it into a specific sport.`,
          `   The few ground lines alone carry it, and the playing area stays completely bare.`,
          // A ceremony finish invites the model to dress the floor: Senior Night cheerleading
          // came back with a judges' podium, a set of steps and two rows of folding chairs
          // standing exactly where the athlete gets composited. "No seating" did not stop it —
          // the furniture has to be named the way brand marks had to be (README section 40).
          `   Name by name: NO judges' table or judging stand, NO podium, NO awards steps or`,
          `   staging block, NO rows of folding chairs, NO scaffolding, NO furniture of any`,
          `   kind standing on or beside the floor. The floor is EMPTY.`,
        ]),
    ...(sport.props ? [
      `   SCALE: render it at true real-world size — ${sport.propScale}. It sits in the`,
      `   mid-distance, so it must occupy only a small part of the frame and read as a real`,
      `   object in a real space, never an oversized prop filling the shot.`,
      `   It stands ON the ground: the base touches the floor and you can see where it meets`,
      `   the surface. Never floating, never cropped by the frame edge.`,
      `   Put it in an OPEN GAP of the set so the whole silhouette is visible and instantly`,
      `   reads as ${sport.name} — never tucked behind or occluded by the foreground`,
      `   structures, and never cropped in half by the frame edge.`,
    ] : []),
    ``,
    `LAYOUT — the markings, the equipment and the camera must line up like this:`,
    `${sport.layout}.`,
    `The equipment is REAL sports equipment in its real materials — painted steel, padded`,
    `vinyl, rope netting, wood. It is lit by this set and reflects it, but it is never`,
    `sculpted out of the set's own chrome or glass, and never an abstract art object.`,
    `This is geometry, not decoration: equipment that does not sit on the line it belongs`,
    `to, or faces the wrong way relative to the court under it, is wrong even if it looks`,
    `good on its own.`,
    ``,
    ...(finish.venueBased && sport.venue !== "indoor"
      ? [
          ``,
          `VENUE — this is the part that must change most:`,
          sport.venue === "open"
            ? `${sport.name} is not an arena sport at all. There is NO arena, NO stands, NO`
              + ` roof and no seating anywhere in this image.`
            : `${sport.name} is played OUTDOORS, so this is an OPEN-AIR STADIUM, not the`
              + ` enclosed indoor arena of the reference. The roof and indoor ceiling are`
              + ` gone — open sky overhead.`,
          ...(sport.venueNote ? [`Build it as ${sport.venueNote}.`] : []),
          `Keep this finish's exact palette, lighting character, atmosphere and mood — the`,
          `finish is the LOOK, not the building. Only the architecture changes.`,
          ``,
        ]
      : []),
    ...(venueChanges
      ? [
          `Everything else follows the reference: same surface materials, same lighting`,
          `direction and quality, same colour grade, same camera height. The architecture is`,
          `the one thing that differs.`,
        ]
      : [
          `Everything else must match the reference: same materials, same lighting direction,`,
          `same camera height and perspective, same colour grade, same composition.`,
        ]),
    ``,
    ...(sport.cameraNote ? [``, `CAMERA: ${sport.cameraNote}.`] : []),
    ``,
    `Hard requirements:`,
    `- Vertical poster format, 2:3.`,
    `- COMPLETELY EMPTY STAGE. No people, no athletes, no figures, no silhouettes of people.`,
    `- The centre and lower-centre of the frame must stay clear and uncluttered — an athlete`,
    `  cutout will be composited there later.`,
    `- No words, no lettering, no logos, no watermarks, no sponsor or brand marks anywhere.`,
    `  Numbers PAINTED INTO the playing surface itself are correct and welcome where the`,
    `  real sport has them — football yard numbers, lane numbers on a track or pool deck.`,
    `  Nothing else may carry a number.`,
    `- The ONLY sport markings anywhere on the ground are ${sport.name}'s.`,
    ...(sport.slug === "basketball"
      ? []
      : [
          `  NEVER draw a basketball key, free-throw lane, three-point arc or centre circle —`,
          `  this is not basketball, and mixing in its lines is the single most common way`,
          `  this image goes wrong.`,
        ]),
    `- No ${finish.forbid}.`,
    `- Photorealistic render, sharp, print quality.`,
  ].join("\n");
}

/**
 * Card-back prompt — the from-behind athlete shot (personalised per order:
 * user picked variant B, so jersey number and team colours are baked in).
 * `refs` for this one are [finish background, athlete photo].
 */
export function backShotPrompt(
  finish: Finish,
  sport: Sport,
  a: { jerseyNumber: string; primaryColor: string; secondaryColor: string },
): string {
  return [
    `Image 1 is the set and art direction. Image 2 is the athlete's face and build reference.`,
    ``,
    `Render that same athlete photographed FROM BEHIND, ${sport.backPose}, standing in the set`,
    `from image 1. Wearing ${sport.gear}.`,
    ``,
    `Uniform: primary colour ${a.primaryColor}, secondary ${a.secondaryColor}.`,
    `The number ${a.jerseyNumber} is printed large and clearly legible across the upper back.`,
    ``,
    `Hard requirements:`,
    `- Vertical 2:3. Full body, athlete centred, feet visible.`,
    `- Shot strictly from behind — the face must NOT be visible.`,
    `- Keep the set's lighting, materials and colour grade identical to image 1.`,
    `- Same body type, skin tone and hair as image 2.`,
    `- No text other than the jersey number. No logos, no watermarks.`,
    `- Photorealistic, sharp, print quality.`,
  ].join("\n");
}

/* ------------------------------------------------------------------------- *
 * ATHLETES
 *
 * Same idea as the backgrounds, transposed. There the finish is the reference
 * image and the sport is the swap; here the PERSON is the reference image and
 * the pose is the swap. Nothing below tries to describe a face in words — the
 * identity plate does that, and the words only reinforce it.
 * ------------------------------------------------------------------------- */

/**
 * "Real people, not plastic" is the whole brief for this layer, and it is not an
 * adjective — "photorealistic" alone reliably returns a wax figure. What works is
 * naming the physical evidence of a real photograph of a real person of THAT AGE.
 *
 * The age branch is not decoration. A model renders one default adult face and then
 * scales it, so a seven-year-old comes back as a small adult and a fifty-year-old as a
 * thirty-year-old with grey hair. The evidence of age has to be named the same way the
 * evidence of realism does.
 */
export function realismFor(ageYears: number): string {
  const base = [
    `This must look like an actual photograph of an actual person, taken by a person with a`,
    `camera. Skin has visible texture and slightly uneven tone, with a light natural warmth`,
    `where they have been working — and NEVER a deep red, blotchy or overheated-looking face:`,
    `no scarlet cheeks, no burning nose, no sunburnt flush. The resting colour of their skin`,
    `is the colour of their skin. Hair is made of separate strands with flyaways, not a moulded mass. Eyebrows are`,
    `uneven. The face is asymmetric, the way every real face is. Fabric creases and bunches at`,
    `the joints where the body moves.`,
  ];
  if (ageYears <= 12) {
    base.push(
      `A CHILD, and every proportion says so: the head is large relative to the body, the`,
      `forehead high and rounded, the neck short and thin, limbs short with no adult muscle`,
      `definition, hands and feet small. Skin is smooth but NOT plastic — fine downy hair on`,
      `the cheek, faint uneven colour across the face, hair that will not lie flat. Milk teeth or`,
      `adult teeth still slightly too large for the face.`,
      `The child is clean, healthy and well cared for. NO scrapes, NO scabs, NO grazes, NO`,
      `bruises, NO plasters, NO dirt or mud on the skin or clothes. Realism here comes from`,
      `skin texture and hair, never from injuries.`,
    );
  } else if (ageYears <= 19) {
    // "SOME ACNE ALONG THE JAW OR FOREHEAD" WAS A MISTAKE, and it ran on every teenager the
    // pipeline has ever drawn. The customer looked at the ice-hockey before-photos and asked
    // why the boy is so red and so spotty — and he was, because this line asked for it and
    // his record asked for a flushed face on top. It is the same line the child branch
    // already draws correctly two paragraphs up: realism comes from skin TEXTURE, never from
    // damage. A parent sends the nicest photo they have; nobody's nicest photo is a breakout,
    // and the card is for the kid.
    base.push(
      `A TEENAGER, not an adult: the jaw and neck are not fully filled out, and the skin shows`,
      `it — fine texture and slightly uneven tone, at most one or two faint blemishes near the`,
      `hairline, and uneven patchy stubble at most on a boy. NOT a breakout: no cluster of`,
      `spots, nothing raised, nothing angry or red across the cheeks, nose or chin.`,
    );
  } else if (ageYears < 45) {
    base.push(
      `A FULLY GROWN ADULT: settled bone structure, visible pores, faint lines that deepen when`,
      `the face moves, real stubble or real skin texture rather than a smoothed surface.`,
    );
  } else {
    base.push(
      `MIDDLE-AGED and visibly so, not a thirty-year-old with grey hair: softened jawline,`,
      `deeper lines at the eyes and from nose to mouth, sun damage and age spots on the`,
      `forearms and the backs of the hands, thinner or greying hair, slacker skin at the neck,`,
      `visible veins on the hands.`,
    );
  }
  return base.join("\n");
}

/**
 * Negations that name the thing. Per §5 of the README, abstract negations ("not fake", "no
 * CGI feel") do nothing; the model only responds to the artefact named.
 */
/**
 * REAL-WORLD MARKS, REFUSED BY NAME — and the NFL shield is why this exists.
 *
 * A kit plate came back with a perfect green jersey carrying the NFL's shield where the club's
 * own crest belongs. Every prompt in this file already forbade "brand logos", and every one of
 * them listed manufacturers' devices by name — swoosh, three stripes, cat, jumpman, trefoil —
 * because the pipeline learned long ago that a brand device carries no letters and so slips
 * past "no text". A LEAGUE mark is the same class of object and was on none of those lists, so
 * a model reaching for "authentic American football gear" reached for the most authentic mark
 * there is.
 *
 * It is the worst mark that can appear, worse than a swoosh: it is a governing body's
 * registered emblem, it fabricates an affiliation that does not exist, and it would go to
 * print on a child's card sold as their own. §14's rule — never approximate a real club's
 * mark — has always meant this too; it just never said so out loud.
 *
 * The permission this does NOT touch: a manufacturer's logo genuinely visible in the
 * customer's own photographs stays on their own clothing. That is their kit appearing as it
 * really is. Nothing here is ever added to a garment nobody supplied.
 */
export const NO_MIRRORED_TEXT = [
  `Any lettering that legitimately appears — a maker's wordmark on a glove, a skate or a`,
  `helmet — reads FORWARDS and the right way up, exactly as it does on the real item. Never`,
  `mirrored, never reversed, never upside down, never scrambled, even on a limb turned away`,
  `from the camera. Reversed lettering is a generation artefact, not a photograph.`,
].join("\n");

export const NO_REAL_WORLD_MARKS = [
  `NO REAL-WORLD LEAGUE OR CLUB MARKS, ANYWHERE, EVER. No NFL shield, no NBA, no MLB, no NHL,`,
  `no FIFA, no UEFA, no Premier League, no NCAA, no Olympic rings, no national federation`,
  `badge, no professional club's crest — not on a jersey, a helmet, a sleeve, a collar, a`,
  `label, a ball or a boot, not even small and not even partly hidden. The only badge that`,
  `may appear anywhere is the club crest supplied with this request. These emblems carry no`,
  `letters, so "no text" does not cover them and they have to be refused by name.`,
].join("\n");

export const NOT_PLASTIC = [
  `- No airbrushed, retouched or beauty-filtered skin. No skin smoothing of any kind.`,
  `- No waxy or plastic sheen on the face, no glowing translucent skin, no mannequin look.`,
  `- No 3D render, no CGI, no video-game character, no digital sculpt, no illustration.`,
  `- No perfectly symmetric face, no flawless white teeth, no poreless skin.`,
  `- No stock-photo or catalogue look. This is a photograph of one specific person, not a model.`,
].join("\n");

/**
 * One fixed lighting rig for every pose of every athlete — the athlete-layer equivalent of
 * "a finish is the set". Four poses lit four different ways cannot be composited into one
 * poster however good each is alone.
 *
 * REWRITTEN after the ice-hockey pilot. The first version asked for a large soft key, a
 * hard rim and a fill: that is a beauty/commercial setup, and it is precisely what made the
 * result read as a polished catalogue portrait rather than a photograph of somebody's kid.
 * The direction still has to stay constant — that is a compositing requirement — but the
 * CHARACTER does not. Consistency is not the same thing as polish.
 */
export const LIGHTING_RIG = [
  `Lighting, identical in every shot: ONE dominant directional source from camera-left and`,
  `above, hard enough to cast shadows with edges — like daylight through the high windows of`,
  `a sports hall. The shadow side of the face is left mostly UNFILLED, so there is real`,
  `contrast across it. One weak bounce from the right, nothing else.`,
  `Slightly cool and slightly uneven, not perfectly neutral.`,
  `This is NOT a beauty or commercial lighting setup: no big soft wraparound key, no glamour`,
  `rim light tracing the whole silhouette, no even fill flattening the face, no colour gels,`,
  `no atmosphere, no haze, no lens flare.`,
].join("\n");

export const PLATE_BACKDROP =
  "Flat, evenly lit seamless mid-grey backdrop behind all three panels — plain, no gradient, " +
  "no vignette, no floor line, no shadow cast onto it, no set, no props.";

const POSE_BACKDROP =
  "Flat, evenly lit seamless mid-grey (18% grey) studio backdrop, completely plain — no " +
  "gradient, no vignette, no floor line, no shadow on it, no set.";

/**
 * THE LINE BETWEEN "REAL" AND "WORN", crossed three times now in three different layers:
 * the room, then the child, then the kit. Each time, chasing realism slid into shabbiness.
 *
 * The correct line, from the user: **the athlete may look like they have just been playing;
 * the equipment is presented clean.** That is exactly what sportswear advertising does —
 * sweat and flush on the person, an immaculate kit. These frames become a printed card and a
 * poster somebody pays for and hangs on a wall. They are premium shots, not documentary ones.
 *
 * POSES ONLY. The "before" snapshots keep their ordinary wear — that is their whole purpose.
 */
const POSE_CONDITION = [
  `CONDITION — this is a premium shot and everything worn or held is CLEAN:`,
  `- The kit is clean and in good condition: no mud, no grass stains, no dirt patches, no`,
  `  sweat marks on the fabric, no tears, no fading, no visible wear.`,
  `- Footwear is clean: no caked mud, no scuffing, no dirt on the soles or laces.`,
  `- Any ball or equipment is clean: no dirt, no scuffs, no staining.`,
  `- The ATHLETE may look like they have been playing — a LIGHT natural warmth in the face,`,
  `  damp hair, a little real sweat at the temples and neck. That belongs to the person, never`,
  `  to the kit. Do NOT make the face deep red or blotchy: a hot, over-red face is the single`,
  `  most common way these frames stop looking premium.`,
  `- FOOTWEAR AND EQUIPMENT ARE THE SAME OBJECTS IN EVERY POSE: identical boots or shoes in`,
  `  the same colour and condition, and the same ball or implement. Three of these frames are`,
  `  composited side by side on one card, so a change of boot between them reads as an error.`,
].join("\n");

/**
 * WHAT TO CALL THE PERSON — and why every stage that describes a body has to say it.
 *
 * `Athlete.presents` reached the identity plate and nothing before it. The snapshots are
 * generated FIRST and the plate is built FROM them, so the one stage that could not afford
 * to guess was the one stage never told: Imani Whitfield — sixteen, "very lean", "light
 * through the upper body", cornrows in a low bun — came back as a teenage boy in all four
 * "before" photographs (2026-08-22). Nothing in her record is untrue of a boy; a build and a
 * hairstyle are not a sex, and a model asked for a lean sprinter with cornrows draws the
 * commoner one. Same failure family as the kit and the face: what must not drift has to be
 * STATED, not inferred from adjacent facts.
 */
export function personNoun(a: { ageYears: number; presents: "male" | "female" }): string {
  return a.ageYears <= 12 ? (a.presents === "male" ? "boy" : "girl")
    : a.ageYears <= 19 ? (a.presents === "male" ? "teenage boy" : "teenage girl")
    : a.presents === "male" ? "man" : "woman";
}

/**
 * The identity plate — generated ONCE per athlete, approved once, then used as the visual
 * reference by every pose. Exactly the role `gen-plate.ts` plays for backgrounds, and for
 * the same reason: without a fixed anchor every generation re-rolls the thing that must not
 * change. Poses reference the PLATE, never each other — chaining compounds drift.
 *
 * PER-ORDER SEAM: for a real customer this stage is replaced by `identityFromPhotosPrompt`
 * below. Every later stage stays exactly as it is.
 */
export function identityPlatePrompt(a: Athlete): string {
  const noun = personNoun(a);
  return [
    `Three photographs of the SAME ${noun}, side by side, from one real shoot against the same`,
    `plain backdrop.`,
    ``,
    `Frame 1: head and shoulders, straight to camera, neutral expression, looking into the lens.`,
    `Frame 2: the same head and shoulders turned three-quarters to the left.`,
    `Frame 3: the same person full body, standing straight and relaxed, arms at their sides,`,
    `feet slightly apart, facing camera.`,
    ``,
    `The person:`,
    `- ${a.age}.`,
    `- ${a.build}.`,
    `- ${a.skinTone}.`,
    `- Hair: ${a.hair}.`,
    `- Face: ${a.face}.`,
    ``,
    `Wearing a clean plain unbranded grey t-shirt and grey shorts in all three frames, and`,
    `BAREFOOT. No shoes, no socks, no sports equipment, no helmet, no hat, no glasses —`,
    `nothing may cover the face or the hairline.`,
    `Clothing carries no team colours and no kit of any kind: this frame is about the person,`,
    `and a garment here would compete with the uniform the poses are told to use. Bare feet`,
    `also keep footwear out of it entirely, and keep the frame clean enough to share.`,
    ``,
    realismFor(a.ageYears),
    ``,
    LIGHTING_RIG,
    ``,
    `Hard requirements:`,
    `- ${PLATE_BACKDROP}`,
    `- The three frames are edge to edge, touching, with no white gutter, no border, no frame,`,
    `  no text, no labels, no numbers, no watermark.`,
    `- It is unmistakably the SAME person in every frame — same face, same hair, same build.`,
    // "SAME HAIR" IS NOT ENOUGH, and it cost three re-rolls on order 4164205493. A model reads
    // it as the same colour and texture, which leaves the STYLE free — so the sheet came back
    // with a low bun in frames 1 and 2 and loose hair down the back in frame 3. A reference
    // sheet that disagrees with itself is not an anchor: the poses that inherit it then
    // disagree with each other too, and the defect only becomes visible on the finished card.
    `- The hair is worn ONE way in every frame: the same parting, the same gathering, the`,
    `  same fall. If it is tied back in one frame it is tied back in ALL of them, the same knot`,
    `  in the same place, with the same loose strands. Changing the hairstyle between frames`,
    `  makes this sheet useless as a reference.`,
    `- The build in frame 3 must match the description above exactly. Do not default to a`,
    `  generic slim body — that is this stage's most common failure.`,
    `- Sharp focus on the face in every frame. No motion blur, no depth-of-field blur on the face.`,
    NOT_PLASTIC,
  ].join("\n");
}

/**
 * The from-behind identity plate.
 *
 * WHY IT EXISTS: the `back` pose is the one the numeric gate cannot check at all — no face,
 * so `identity-gate.ts` correctly reports "n/a" and the card back is the single frame in the
 * order with no identity evidence behind it. Without this the model invents the nape
 * hairline, the ear shape from behind, the head shape and the shoulder line, and on a card
 * a parent will hang on a wall, those are the things that say "that is my kid" from across
 * the room.
 *
 * WHY IT IS A SEPARATE IMAGE rather than a fourth panel on the main plate: at 2K a four-panel
 * sheet gives each panel about 600 px instead of 800, and the face is the resolution-critical
 * part of the whole pipeline. One more image costs a few cents; a softer face costs the
 * likeness.
 *
 * It references the main plate, so it is the same child by construction. It improves the
 * RENDER of the back pose; it does not make that pose measurable — nothing can.
 */
/**
 * THE BODY PANEL, GENERATED ONCE THE FACE IS SETTLED.
 *
 * The three-panel plate used to be ONE generation doing two unrelated jobs at once: fix a
 * face, and fix a frame. They do not succeed together. Measured on Etsy order 4164205493,
 * where the two face panels scored 0.710 and 0.732 against the customer's photographs while
 * the full-length panel in the same sheet scored 0.570 — its face is barely thirty pixels
 * across, so it carries almost no identity and drags the sheet's average below what the
 * likeness actually is.
 *
 * So the face is decided first and APPROVED, and only then is the body drawn — with the
 * approved face attached as an image. Same law as everywhere else in this pipeline: what
 * must not drift is carried by a picture, not by a sentence.
 *
 * Image 1 is the approved face plate. Image 2, when present, is the customer's own
 * full-length photograph — the only evidence of their real proportions.
 */
export function identityBodyPrompt(opts: {
  ageYears: number;
  presents: "male" | "female";
  hair?: string;
  build?: string;
  hasBodyPhoto: boolean;
}): string {
  const noun =
    opts.ageYears <= 12 ? (opts.presents === "male" ? "boy" : "girl")
    : opts.ageYears <= 19 ? (opts.presents === "male" ? "teenage boy" : "teenage girl")
    : opts.presents === "male" ? "man" : "woman";
  return [
    `Image 1 is an approved reference sheet of one specific ${noun}'s FACE.`,
    ...(opts.hasBodyPhoto
      ? [`Image 2 is a photograph of THAT SAME PERSON standing, full length. Their face is small`,
         `in it and that does not matter — it is not there for the face.`]
      : []),
    ``,
    `Produce ONE photograph of that person, FULL BODY: standing straight and relaxed, arms at`,
    `their sides, feet slightly apart, facing camera, against the same plain backdrop as image 1.`,
    ``,
    `THE FACE COMES FROM IMAGE 1 AND NOTHING ELSE. It has already been approved, so it is not`,
    `being decided again here: same features, same proportions, same hairline, same expression`,
    `at rest, same hair worn the same way. This frame is small in the face and that is exactly`,
    `why it must be copied rather than re-drawn.`,
    ...(opts.hasBodyPhoto
      ? [``,
         `THE BODY COMES FROM IMAGE 2: the height, the width of the shoulders, the length of the`,
         `legs, how the weight sits, the real proportions of this person standing up. Take those`,
         `exactly. Do NOT slim them, do NOT lengthen them, and do NOT build a body that is not in`,
         `that photograph.`,
         // The two things a snapshot adds that a barefoot studio frame must not inherit. Heels
         // are the bigger of them: they lengthen the leg and lift the whole figure, and copying
         // "the height" from a photograph taken in them builds a taller person than the customer.
         `Read the proportions THROUGH what they happen to be wearing in it. If they are in`,
         `heeled or thick-soled shoes there, that height is the SHOE and not the person — this`,
         `frame is barefoot and stands correspondingly shorter. If the clothing is loose, the`,
         `body beneath it is narrower than the garment, not as wide as the garment.`]
      : []),
    ...(opts.build ? [``, `THE BUILD, neither slimmed nor thickened: ${opts.build}`] : []),
    ...(opts.hair ? [``, `THE HAIR: ${opts.hair}`] : []),
    ``,
    `Wearing a clean plain unbranded grey t-shirt and grey shorts, and BAREFOOT. No shoes, no`,
    `socks, no equipment, no hat, no glasses. The clothing carries no team colours and no kit.`,
    ``,
    realismFor(opts.ageYears),
    ``,
    LIGHTING_RIG,
    ``,
    `Hard requirements:`,
    `- ${PLATE_BACKDROP}`,
    `- ONE frame only. No side-by-side panels, no gutter, no border, no text, no watermark.`,
    `- The whole body is in frame: the top of the head and both feet, nothing cropped.`,
    `- The lighting, the backdrop and the grey clothing match image 1, so the two read as one`,
    `  shoot rather than two.`,
    NOT_PLASTIC,
  ].join("\n");
}

export function identityBackPrompt(a: { ageYears: number; presents: "male" | "female"; hair: string; build: string }): string {
  return [
    `Image 1 is a reference sheet of one specific person, seen from the front.`,
    ``,
    // ONE FRAME, NOT TWO. The two-panel version asked a single generation for a nape close-up
    // and a full-length shot, and the panels disagreed with each other — a bun in one and loose
    // hair in the other, on the same sheet. This frame exists for exactly one job: to be the
    // reference for the from-behind pose. A single full-length frame does that job, and there
    // is nothing left for two panels to fall out over.
    `Photograph THAT SAME PERSON from BEHIND — ONE frame against the same plain backdrop:`,
    `full body from directly behind, standing straight and relaxed, arms at their sides, feet`,
    `slightly apart, the whole body in frame from the top of the head to both feet.`,
    ``,
    `Carry over exactly from image 1: hair colour, hair texture, HOW IT IS WORN — loose or`,
    `tied, and if tied then the same knot in the same place with the same loose strands — how`,
    `it is cut and how it falls, the hairline at the nape, ear shape and how the ears sit,`,
    `head shape, neck, the slope of the shoulders, skin tone, build and age.`,
    `- ${a.build}.`,
    `- Hair: ${a.hair}.`,
    ``,
    `Wearing the same clean plain unbranded grey t-shirt and grey shorts, and BAREFOOT.`,
    ``,
    realismFor(a.ageYears),
    ``,
    LIGHTING_RIG,
    ``,
    `Hard requirements:`,
    `- ${PLATE_BACKDROP}`,
    `- STRICTLY from behind. No part of the face is visible — not in profile, not over a`,
    `  shoulder, no turn of the head, no reflection.`,
    `- ONE frame only. No side-by-side panels, no gutter, no border, no text, no watermark.`,
    `- Sharp focus on the hair and the hairline at the nape.`,
    // Same defect as the front sheet, one image later: frame 1 came back a bun and frame 2
    // loose hair, from a prompt that only ever said "carry over the hair".
    `- The hair is worn identically to image 1 — one hairstyle across the whole set.`,
    NOT_PLASTIC,
  ].join("\n");
}

/**
 * The "before" photographs — ordinary phone snapshots of the athlete.
 *
 * WHY THESE ARE GENERATED AT ALL, AND WHY THEY MUST LOOK BAD
 * The before/after row is the strongest thing the site can show, because it is the only
 * section that proves the INPUT was ordinary. The visitor's real objection is never "is
 * this beautiful" — it is "will this work with the photos actually on my phone". If the
 * "before" images look competent, the section quietly says "send us a photo shoot", and it
 * argues against the product instead of for it.
 *
 * They also serve a second, harder purpose: they are the input to
 * `identityFromPhotosPrompt`, which means producing this marketing asset exercises the
 * REAL per-order pipeline rather than a mock-up of it. One build, two payoffs.
 *
 * The one thing that must NOT be ordinary is the face: it still has to clear `intake.ts`
 * (a face at least 180 px across, detection score above 0.6), or the plate has nothing to
 * work from — which is exactly the constraint a real customer is under.
 */
/**
 * THE FOUR PHOTOS A PARENT ACTUALLY SENDS.
 *
 * Set by the user, and the set matters: home, a game in the team kit, a training session,
 * and something from ordinary life. Between them they carry everything the pipeline needs —
 * a clean look at the face, the real uniform if there is one, the body in motion, and the
 * person as they are away from sport.
 *
 * AND THEY ARE NICE PHOTOGRAPHS. An earlier version chased "real" by making them bad — harsh
 * flash, shabby rooms, a battered child — and that was wrong twice over. A parent does not
 * send their worst photos; they scroll the camera roll and pick the ones where their kid
 * looks lovely. Those are still phone photos: available light, unposed, a bit off-centre,
 * not styled. The honesty of the before/after comes from the picture being ORDINARY, not
 * from it being poor.
 */
/**
 * THE POOL OF "BEFORE" SCENARIOS.
 *
 * Four roles have to be filled for the pipeline to work:
 *   portrait — a clean close look at the face; this is what `bestPortrait` points at
 *   kit      — a match day, so the spec can read their real team strip
 *   action   — the body moving, at training or in play
 *   casual   — them away from sport, as a person
 *
 * But the four athletes built so far all drew the SAME four scenes, so their before/after
 * rows looked templated the moment they were placed side by side. So each role has several
 * options and every athlete draws a different one, chosen deterministically from their slug —
 * stable across re-runs (the pipeline has no randomness by design), different between people.
 */
const SNAPSHOT_POOL: Record<string, { what: string; how: string; where: string; who: string; wear: string }[]> = {
  portrait: [
    {
      what: "a warm snapshot at home",
      how: "shot on a phone in soft daylight from a window, natural colour, nothing harsh",
      where: "a comfortable, tidy family home — a plain wall, a kitchen or living room edge, a plant or a picture frame at the side of the frame",
      who: "looking straight at whoever is holding the phone, relaxed and unposed",
      wear: "everyday",
    },
    {
      what: "a close snapshot taken at the kitchen table",
      how: "shot on a phone from across the table, overhead kitchen light, slightly warm colour cast",
      where: "a clean kitchen — a mug, a bowl of fruit, a window behind",
      who: "sitting at the table with a mug in front of them, turning towards the phone",
      wear: "everyday",
    },
    {
      what: "a snapshot on the front step",
      how: "shot on a phone in bright open shade, clean natural colour",
      where: "the doorway of an ordinary house, a bit of hedge or a door frame at the edge",
      who: "half turned back towards the camera as if they had just been called",
      wear: "everyday",
    },
    {
      what: "a snapshot on the sofa at home",
      how: "shot on a phone from a nearby chair, warm lamp light mixed with daylight, slightly grainy",
      where: "an ordinary tidy living room — a cushion, the arm of the sofa, a shelf behind",
      who: "sitting back on the sofa with a phone in one hand, glancing up at the camera",
      wear: "everyday",
    },
    {
      what: "a snapshot taken on the way out of the house",
      how: "shot on a phone in the hallway, mixed indoor light, the frame a little crooked",
      where: "a hallway with coats on hooks and a front door behind",
      who: "standing with a sports bag over one shoulder, caught on the way out",
      wear: "everyday",
    },
    // THE POOL WAS TOO SMALL AND IT SHOWED. Five portrait scenarios across a roster of
    // twenty-two athletes means the same kitchen table, the same mug and the same bowl of
    // fruit turn up again and again — the customer's words: "always the first photo sits at
    // that wooden table with the fruit". A demo whose "before" sets repeat their props reads
    // as one family photographed twenty times, which is the opposite of what these frames are
    // for. The picks are a deterministic hash of role+slug, so variety cannot come from
    // randomness; it has to come from the pool being big enough.
    {
      what: "a snapshot in their own bedroom",
      how: "shot on a phone in the evening, a bedside lamp and the ceiling light mixed, slightly grainy",
      where: "an ordinary teenager's room — a made bed, a desk, a couple of medals or posters on the wall behind",
      who: "sitting on the edge of the bed, half turned towards the phone",
      wear: "everyday",
    },
    {
      what: "a snapshot in the back garden",
      how: "shot on a phone in late afternoon sun, slightly backlit, a lens flare at one corner",
      where: "an ordinary tidy back garden — grass, a fence, a garden chair at the edge of frame",
      who: "standing on the grass, squinting a little into the light",
      wear: "everyday",
    },
    {
      what: "a snapshot in the passenger seat on the way home",
      how: "shot on a phone from the driver's seat at a standstill, flat daylight through the windscreen",
      where: "the front seat of an ordinary clean car, a seatbelt across the shoulder, a road and trees outside",
      who: "turning their head towards the phone with a sports bag on their lap",
      wear: "everyday",
    },
    {
      what: "a snapshot outside a cafe",
      how: "shot on a phone in bright open shade, natural colour, the frame a little off-centre",
      where: "a small cafe table on a pavement — a glass and a plate on the table, a street quietly out of focus behind",
      who: "sitting back in the chair, mid-conversation with whoever is holding the phone",
      wear: "everyday",
    },
    {
      what: "a snapshot at the kitchen counter",
      how: "shot on a phone from a couple of steps away, overhead light, a little motion in the hands",
      where: "an ordinary clean kitchen — a kettle and a chopping board on the counter, a cupboard door open behind",
      who: "standing at the counter eating a bowl of cereal, glancing over at the camera",
      wear: "everyday",
    },
  ],
  kit: [
    // EVERY KIT SCENARIO IS NOW CLOSE RANGE, because this frame has two jobs and distance
    // breaks both. It is the photograph the kit plate copies a collar and a trim from, and it
    // is an identity input — and "from the sideline", "from a few rows back" and "walking off
    // at the end" all returned a face around 1.2% of the frame, which `intake.ts` correctly
    // read as an outlier and rejected the batch for, twice. A framing instruction added
    // alongside those words lost to them; the scenario itself had to change.
    {
      what: "a game-day photo taken at a match",
      how: "shot on a phone from a few steps away in daylight, a touch soft, framed from the waist up",
      where: "a well-kept {place} on a match day — a clean edge or fence line, other families and teammates out of focus behind",
      who: "stopped in front of whoever is holding the phone between plays, close enough to fill the frame",
      wear: "kit",
    },
    {
      what: "a photo taken just before the game starts",
      how: "shot on a phone from arm's length, flat morning light, the horizon slightly crooked",
      where: "the side of the {place} before a game — a kit bag on the floor, teammates blurred behind",
      who: "standing close to the camera, hands on hips, looking off across the {place}",
      wear: "kit",
    },
    {
      what: "a photo taken right after a match",
      how: "shot on a phone from a couple of steps away in late-afternoon sun, framed from the knees up, a little backlit",
      where: "the edge of the {place} after the final whistle, a water bottle and a bag beside them",
      who: "walking straight towards the camera at the end with a bag over one shoulder",
      wear: "kit",
    },
    {
      what: "a photo taken from the bench during a break in play",
      how: "shot on a phone from the row directly behind them, indoor or overcast light, the frame tight",
      where: "the side of the {place} where the team sits, a water bottle and a towel beside them",
      who: "sitting on the bench with a bottle in one hand, listening to the coach off frame",
      wear: "kit",
    },
    {
      what: "a photo taken after a tournament",
      how: "shot on a phone from close up, head and shoulders, end-of-day light, the background busy and out of focus",
      where: "the {place} at the end of a tournament day, families and kit bags blurred behind",
      who: "standing with a medal round their neck, one hand holding it slightly away from their chest",
      wear: "kit",
    },
  ],
  action: [
    {
      what: "a photo from a training session",
      how: "shot on a phone in ordinary daylight, caught mid-movement so there is a little motion in the hands or hair",
      where: "{place} set up for training, this sport\u2019s own practice equipment somewhere in frame, everything in good order",
      who: "working through the drill, caught mid-movement, entirely unaware of the camera",
      wear: "training",
    },
    {
      what: "a photo taken during a warm-up",
      how: "shot on a phone from low down, slightly wide, the subject a little off-centre",
      where: "a marked practice area at {place}, this sport\u2019s own equipment at the far end",
      who: "moving through a warm-up, eyes down, arms working",
      wear: "training",
    },
    {
      what: "a photo taken while practising alone",
      // "from a distance" put the face at 117 px and intake rejected the frame. No scenario
      // may push the subject far enough away to fail the gate the photos have to clear.
      how: "shot on a phone from the side, close enough that the face reads clearly, quiet end-of-day light, nobody else nearby",
      where: "an empty {place} with nobody else on it, this sport\u2019s own equipment set out",
      who: "repeating the same movement on their own, absorbed in it",
      wear: "training",
    },
    {
      what: "a photo taken during a skills drill",
      how: "shot on a phone at an awkward angle from the side, ordinary daylight, slightly soft",
      where: "{place} with this sport\u2019s own practice equipment laid out for a drill",
      who: "working through the drill with the equipment, body low and balanced",
      wear: "training",
    },
    {
      what: "a photo taken at the end of a session",
      how: "shot on a phone from a few metres away, flat late light, framing loose",
      where: "the side of {place} after training, bags and bottles on the floor",
      who: "stretching with one hand on a knee, session finished",
      wear: "training",
    },
  ],
  casual: [
    {
      what: "a relaxed everyday photo away from sport",
      how: "shot on a phone in nice natural light, casual framing with the subject a little off-centre",
      where: "outdoors on an ordinary day out — a park path, a garden, a bench, somewhere pleasant and unremarkable",
      who: "walking along and turning towards the lens",
      wear: "everyday",
    },
    {
      what: "a snapshot in the back of the car",
      how: "shot on a phone from the front seat, daylight through the window, one side of the face brighter",
      where: "the back seat of a tidy car, a seatbelt across the shoulder, trees passing outside",
      who: "looking out of the window and then back at the camera",
      wear: "everyday",
    },
    {
      what: "a snapshot at the table after a family meal",
      how: "shot on a phone from across the table, warm indoor light, the frame slightly tilted",
      where: "an ordinary dining table with plates cleared, other people only as blurred shapes at the edges",
      who: "leaning back in the chair, turning towards whoever spoke",
      wear: "everyday",
    },
    {
      what: "a snapshot on a day away from home",
      how: "shot on a phone in bright outdoor light, squinting slightly, the horizon not level",
      where: "somewhere pleasant on a day out — a seafront, a viewpoint, a wide open space behind",
      who: "standing in the sun with the wind moving their hair",
      wear: "everyday",
    },
    {
      what: "a snapshot with the family dog",
      how: "shot on a phone from standing height looking down slightly, soft daylight",
      where: "a garden or a park, grass underfoot, nothing styled",
      who: "crouched down with a dog beside them, one hand resting on its back",
      wear: "everyday",
    },
  ],
};

/**
 * THE EXPRESSION IS ASSIGNED BY FRAME, NOT BY SCENARIO — and that is the whole fix.
 *
 * README section 26 already said expressions must be assigned, and the prompt already asked
 * for variety: "vary it across the set... what must not happen is all four frames coming back
 * mid-speech with the mouth open". It kept happening anyway — three of Marcus Ellison's four
 * came back open-mouthed. The reason is structural: `pickScenarios` chooses the four roles
 * INDEPENDENTLY, each carrying its own expression, so nothing in the system ever counts how
 * many mouths are open. "Vary it" was a request, and a request loses.
 *
 * So expression leaves the scenario text entirely and is indexed by frame instead. Exactly
 * one frame in every set laughs, and it is always the last one. The model cannot return four
 * of the same face because it never sees the set — it only ever sees this frame's line.
 */
const FRAME_EXPRESSION = [
  "calm and closed-mouthed — lips together, a small easy smile, no teeth showing",
  "focused and closed-mouthed — jaw set, breathing through the nose, not speaking, teeth not showing",
  "concentrating hard — brow down, mouth closed or barely parted, nothing theatrical about it",
  "a real open laugh — teeth showing, eyes creased, genuinely caught mid-laugh. This is the ONE frame in the set that laughs",
];

const ROLES = ["portrait", "kit", "action", "casual"] as const;

/**
 * Stable per athlete, so re-running produces the same set. No randomness anywhere.
 *
 * Hash the slug AND the role together. Hashing the slug alone put `soccer-age-07` and
 * `soccer-age-10` on identical sets — they differ by one character, so a simple rolling hash
 * lands them on neighbouring values, and adding a small per-role offset moves both of them
 * the same way. Mixing the role in first decorrelates the four picks from each other.
 */
/**
 * What this frame's scenario dresses them in. The caller needs it BEFORE the prompt exists,
 * because the match frame is the one that gets the club badge attached as a reference — see
 * snapshotPrompt's crestIndex and the note there on why the badge belongs this early.
 */
export function snapshotWear(slug: string, index: number): string {
  return pickScenarios(slug)[index % ROLES.length].wear;
}

function pickScenarios(slug: string) {
  const hash = (str: string) => {
    let h = 2166136261;
    for (const ch of str) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  };
  return ROLES.map((role) => {
    const options = SNAPSHOT_POOL[role];
    return options[hash(`${role}:${slug}`) % options.length];
  });
}

/**
 * THE LINE THIS SITS ON, and it is easy to cross by accident — twice already.
 *
 * The "before" must look like a real phone photo. The first attempt got there by making the
 * ROOM shabby (a torn armchair, marked walls) and the second by making the CHILD battered
 * (scabbed knees, grazes, mud). Both read as a hard life rather than an ordinary one, and
 * both are quietly insulting to the customer whose photo this stands in for.
 *
 * The rule: **the imperfection belongs to the PHOTOGRAPH, not to the person or their life.**
 * Available light, a slightly crooked frame, an off-centre subject, a touch of softness —
 * all correct, all of them say "somebody's mum took this on her phone". Broken furniture,
 * injuries, dirt and squalor say something else, and none of it is what is being proved.
 */
const SNAPSHOT_DIGNITY = [
  `The setting is an ordinary, decent, well-kept place and everything in frame is clean and`,
  `in good repair.`,
  `- NO torn, ripped, stained or broken furniture, no exposed stuffing, no peeling paint, no`,
  `  marks or stains on the walls, no clutter piled up, no rubbish.`,
  `- The person is clean, healthy and well cared for, their clothes intact and in good`,
  `  condition.`,
  `- NO injuries: no scrapes, scabs, grazes, bruises, plasters or bandages. No mud or dirt on`,
  `  skin or clothing. A child who has been playing looks flushed and slightly untidy — not`,
  `  battered.`,
  `This is a photograph a parent would be pleased with and would choose to send. It is casual,`,
  `not poor.`,
].join("\n");

/**
 * THE BADGE BELONGS IN THE "BEFORE" PHOTOS, NOT ONLY ON THE KIT PLATE.
 *
 * The crest used to arrive three stages later, at the kit plate. So the match snapshot was
 * generated with no badge to copy and the model invented one — "EAGLES", "WILDCATS", a club
 * this athlete does not play for. Then `resolve-spec` read the strip OUT of that photograph
 * and the kit plate stamped OUR crest onto it, and the two never matched.
 *
 * The soccer age ladder hid this: one club across all six athletes and a nearly plain green
 * shirt. Seventeen clubs with seventeen different strips would show it on every one.
 *
 * So the match frame receives the crest as a reference image, the same way every other
 * must-not-drift thing in this pipeline is carried. For a REAL order none of this applies —
 * the customer's photographs already show their own badge, and `spec.crest.fromPhotos` is
 * that path.
 */
export function snapshotPrompt(a: Athlete, sport: Sport, index: number, anchored: boolean, bodyAnchored = false, crestIndex: number | null = null): string {
  const sc = pickScenarios(a.slug)[index % ROLES.length];
  // The scenarios are written sport-neutral and take their venue word from the sport. See
  // Sport.place: they used to be written in soccer nouns, and the basketball athlete's
  // training frame came back as a boy playing football on a grass pitch.
  const at = (t: string) => t.replaceAll("{place}", sport.place);
  return [
    // The first snapshot is generated from words; every one after it references that first
    // frame. WHY: generating four snapshots independently produced four different children —
    // ArcFace cosine 0.14 to 0.34 between them, well under the same-person line, and
    // `intake.ts` caught it immediately. That is the same "words cannot hold a face" lesson
    // the identity plate exists for, arriving one layer earlier than expected. A real
    // customer's photos are one person by definition; for the demo that has to be built.
    //
    // Unlike poses, snapshots SHOULD drift in everything except identity — different day,
    // different light, different clothes — so chaining here is correct rather than harmful.
    ...(anchored
      ? bodyAnchored
        ? [
            `Image 1 shows this person's FACE. Image 2 shows their BODY at full length.`,
            `Photograph THAT SAME PERSON again on a different day: the same face, bone structure,`,
            `hair and skin from image 1, and the SAME BODY as image 2 — the same weight, the same`,
            `shape through the chest, stomach and waist, the same proportions. Neither slimmer nor`,
            `heavier than image 2 shows. Everything else about the picture changes.`,
            ``,
          ]
        : [
            `Image 1 is a photograph of a specific person. Photograph THAT SAME PERSON again on a`,
            `different day: the same face, the same bone structure, the same hair colour, cut and`,
            `texture, the same skin, the same age, the same body. Everything else changes.`,
            ``,
          ]
      : []),
    `An ordinary, unremarkable phone photograph — the kind a parent has hundreds of. NOT a`,
    `portrait, NOT a professional photograph, NOT a stock image.`,
    ``,
    `${sc.what}. ${sc.how}.`,
    `Background: ${at(sc.where)}.`,
    `The person is ${at(sc.who)}.`,
    // THE MATCH FRAME HAS TWO JOBS AND A DISTANT ONE DOES NEITHER. It is the photograph the
    // kit plate copies the uniform from, and it is also an identity input — and several of
    // the kit scenarios frame from the sideline or "a few rows back", which on ice hockey
    // returned a 197 px face at 1.3% of the frame. `intake.ts` correctly called it an
    // outlier (0.50 against the set's 0.69) and rejected the batch. The gate was right; the
    // input was wrong. A parent's own album always has a close one, so the demo must produce
    // one too — and a garment photographed from thirty metres cannot settle a collar either.
    // ...and the same floor, looser, on every other frame: photo3 came back at 2% of the
    // frame and `intake.ts` flagged it as a different person (0.31 against the set's 0.47).
    // A face too small to embed is a face too small to anchor an identity plate with.
    `FRAMING: the athlete is the subject of this photograph, near enough that their head is at`,
    `least an eighth of the frame height and their face is readable. Not a distant figure in a`,
    `wide scene.`,
    ...(sc.wear === "kit"
      ? [
          `AND TIGHTER STILL for this frame: the athlete is CLOSE — framed from the knees`,
          `up or tighter, filling most of the frame height, with their head at least a sixth of`,
          `it and the face clearly readable. The uniform must be legible down to the collar, the`,
          `trim and any badge on it. Not a distant sideline shot, not a wide view of the`,
          `${sport.place}, and nobody else larger than a blurred shape behind them.`,
        ]
      : []),
    `EXPRESSION for this frame, and it is not open to interpretation:`,
    `${FRAME_EXPRESSION[index % FRAME_EXPRESSION.length]}.`,
    ``,
    anchored ? `The same person as image 1:` : `The person:`,
    // THE SEX IS STATED, not left to be read off the build and the hair. See personNoun.
    // First on the list because it is the fact everything else on it is qualified by, and it
    // is repeated as a hard requirement below because a single line in a descriptive block
    // loses to four lines about a lean torso.
    `- A ${personNoun(a)}.`,
    `- ${a.age}.`,
    `- ${a.build}.`,
    `- ${a.skinTone}.`,
    `- Hair: ${a.hair}.`,
    `- Face: ${a.face}.`,
    sc.wear === "kit"
      ? `Wearing their team kit: ${kitFor(a)}`
      : sc.wear === "training"
        // NAME THE COLOUR. "in the team colours" is a relative instruction, and README section 5
        // is the standing finding that a relative instruction does nothing: Imani's training
        // frame came back in ROYAL BLUE AND WHITE against a gold club (2026-08-22). The kit
        // branch above works because kitFor() substitutes the colour NAME into every garment.
        ? `Wearing ${sport.name} training gear in ${a.colorName} — a plain ${a.colorName} training top and ${a.colorName} shorts, not the match jersey. ${a.colorName.toUpperCase()} is the club colour and the only colour on the clothing apart from plain white or black trim. Nothing branded.`
        : `Wearing ordinary everyday clothes — a t-shirt, hoodie or jumper. Nothing branded.`,
    ...(crestIndex && sc.wear === "kit"
      ? [
          `The badge on the chest is the artwork in image ${crestIndex}, applied UNCHANGED —`,
          `same outline, same figure inside it, same colours. It is the club's real badge and`,
          `the only mark on the shirt.`,
          `But this is a PHOTOGRAPH, not a product shot: at this distance the badge is only a`,
          `few centimetres across, slightly soft, and it moves with the fabric. Do not enlarge`,
          `it, do not centre it, do not redraw it and do not add a second mark beside it.`,
          `The shirt carries the squad number ${a.jerseyNumber} and no other number. Nothing in`,
          `the pipeline told this frame the number before, so it invented one, and the athlete`,
          `then wore a different number in their photographs than on their own card.`,
        ]
      : []),
    ``,
    realismFor(a.ageYears),
    ``,
    `Their kit and boots show ordinary use here — this is a real day, not a product shot.`,
    ``,
    `Snapshot character — this is what makes it read as real:`,
    `- Available light only, and it happens to be flattering. Natural colour, no studio`,
    `  lighting, no flash unless the scenario asks for it.`,
    `- Casual framing: the subject a little off-centre, the horizon not quite level,`,
    `  headroom a bit generous — nobody composed this carefully.`,
    `- An everyday background rather than a styled backdrop — but see the rule below.`,
    `- Ordinary phone-camera rendering: some noise, some compression, imperfect focus,`,
    `  a touch of motion in the hands or hair.`,
    ``,
    SNAPSHOT_DIGNITY,
    ``,
    `Hard requirements:`,
    ...(sc.wear === "everyday"
      ? []
      : [
          `- THE SPORT IS ${sport.name.toUpperCase()}. The venue, the surface, the markings, the`,
          `  equipment on the floor and anything anyone else in the frame is holding all belong`,
          `  to ${sport.name} and to no other sport. No ball, goal, net, post, stick or apparatus`,
          `  from a different sport appears anywhere, however far back or out of focus.`,
          `  What they are wearing and holding is ${sport.gear}.`,
          `- NO WORDS ON THE CLOTHING. The jersey carries no club name, no school name, no`,
          `  sponsor and no lettering of any kind — a squad number is fine, letters are not.`,
          `  Invented team names keep appearing on these shirts ("WILDCATS", "EAGLES") and they`,
          `  name a club this athlete does not play for.`,
          // A SWOOSH IS NOT A WORD, and the wordless rule above let one through onto Imani's
          // match singlet (2026-08-22). check-athlete.ts has had `no_league_mark` since the
          // football set; the snapshots are generated before any judge sees them and had no
          // equivalent, so the frame that the kit plate copies the uniform FROM was the one
          // frame free to invent a manufacturer.
          `- NO BRAND, MAKER OR LEAGUE MARK ANYWHERE. No swoosh, no stripes device, no maker's`,
          `  logo on the singlet, the shorts, the bag or the shoes, and no NFL, NBA, FIFA, NCAA,`,
          `  Olympic or federation emblem. The club badge is the only mark on the clothing, and`,
          `  everything else — kit, footwear, bag — is plain and unbranded.`,
        ]),
    `- THE ATHLETE IS A ${personNoun(a).toUpperCase()}, in this frame and in every other one.`,
    `  This is not inferred from the build or the hair — it is given. A lean sprinter with`,
    `  cornrows is not thereby a boy, and a set that changes sex between frames is unusable.`,
    `- EXPRESSION: exactly the one named above and nothing else. Do NOT default to mid-speech`,
    `  with the mouth open, which is what "candid" produces when nobody says otherwise.`,
    `  The one thing that must NOT vary between frames is the person.`,
    `- The FACE must still be clearly visible, unobstructed and large enough to recognise —`,
    `  at least a third of the frame height for a head-and-shoulders shot. Soft is fine,`,
    `  hidden is not.`,
    `- ONE SINGLE PHOTOGRAPH, one frame, one moment. NOT a collage, NOT a diptych, NOT two`,
    `  pictures side by side, NOT a grid, NOT a before-and-after pair, no panels, no dividing`,
    `  lines, no borders between images. A phone photo is one exposure — anything showing the`,
    `  same person twice in one file is unusable, because the intake reads two faces from it`,
    `  and the identity plate is built from whichever it happens to find first.`,
    `- Only ONE person in focus and identifiable. Anyone else is out of focus and incidental.`,
    `- No text overlay, no timestamp, no watermark, no phone UI, no filter, no border.`,
    `- Vertical 3:4, the way a phone is held.`,
    NOT_PLASTIC,
  ].join("\n");
}

/**
 * The identity plate built FROM a customer's photographs — the per-order path.
 *
 * The job here is NORMALISATION, not invention. The customer's photos are the truth; this
 * stage removes the phone flash, the cluttered room and the odd angles and leaves one
 * consistent anchor that every pose can reference. Anything it invents is a defect, and
 * `identity-gate.ts` measures exactly that: the plate is checked back against the photos it
 * came from before a single pose is generated.
 */
export function identityFromPhotosPrompt(opts: {
  photoCount: number;
  ageYears: number;
  presents: "male" | "female";
  /** The resolved hair description, when the spec has pinned one. See resolve-spec.ts. */
  hair?: string;
  /** The resolved build. Same reasoning as hair, and a harder requirement — see spec.ts. */
  build?: string;
  /** Optional, from the order form — used only to resolve ambiguity, never to override. */
  notes?: string;
  /** 1-based index of the attached photograph that shows the whole body, when there is one. */
  bodyIndex?: number;
  /**
   * 1-based index of the photograph the CUSTOMER considers the best likeness of them.
   *
   * Without this every cleared photograph carried equal weight and the plate returned an
   * AVERAGE of them — which is why a set shot across four different years, lights and
   * distances produced a face the owner recognised only partly. `bodyIndex` had said for
   * months that one attachment can be singled out for one job; the face never had the
   * equivalent, and the face is the product.
   */
  portraitIndex?: number;
  /** 1-based index of the photograph the customer named as the three-quarter view. */
  sideIndex?: number;
  /**
   * "face" produces the two close portraits only. The full-length panel is then its own
   * generation (identityBodyPrompt), made once this face is approved — see that function for
   * the measurement that split them.
   */
  part?: "face" | "all";
}): string {
  const noun =
    opts.ageYears <= 12 ? (opts.presents === "male" ? "boy" : "girl")
    : opts.ageYears <= 19 ? (opts.presents === "male" ? "teenage boy" : "teenage girl")
    : opts.presents === "male" ? "man" : "woman";
  return [
    `The ${opts.photoCount} attached images are photographs of ONE real ${noun}, taken at`,
    `different times, in different light, from different angles.`,
    ``,
    ...(opts.part === "face"
      ? [`Produce TWO photographs of THAT SAME PERSON, side by side, from one shoot against a`,
         `plain backdrop:`,
         `Frame 1: head and shoulders, straight to camera, looking into the lens.`,
         `Frame 2: the same head and shoulders turned three-quarters to the left.`,
         ``,
         `Both frames are CLOSE: the head fills most of the frame. This sheet has one job, which`,
         `is the face — there is no full-length frame here and nothing else competing for the`,
         `resolution.`]
      : [`Produce three photographs of THAT SAME PERSON, side by side, from one shoot against a`,
         `plain backdrop:`,
         `Frame 1: head and shoulders, straight to camera, looking into the lens.`,
         `Frame 2: the same head and shoulders turned three-quarters to the left.`,
         `Frame 3: the same person full body, standing straight and relaxed, arms at their sides.`]),
    ...(opts.sideIndex
      ? [``,
         `IMAGE ${opts.sideIndex} IS THE THREE-QUARTER VIEW the customer named, and frame 2 comes`,
         `from it: that angle, that side of the face, the ear and jaw as they read from there.`]
      : []),
    ...(opts.bodyIndex
      ? [``,
         `IMAGE ${opts.bodyIndex} IS THE ONE THAT SHOWS THEM STANDING, and frame 3 comes from it.`,
         `Their face is small in it and that does not matter — it is not there for the face. It is`,
         `there for the FRAME: the height, the width of the shoulders, how the weight sits, the`,
         `length of the legs, the real proportions of this person standing up. Take those from it`,
         `exactly and take the face from the closer photographs. Do NOT slim them, do NOT lengthen`,
         `them, and do NOT build a body that is not in that photograph.`]
      : []),
    ...(opts.portraitIndex
      ? [``,
         `IMAGE ${opts.portraitIndex} IS THE BEST LIKENESS OF THEM — the photograph the family`,
         `picked out as the one that looks most like this person. Frames 1 and 2 must match THAT`,
         `face: its proportions, the set and spacing of the eyes, the line of the nose, the shape`,
         `of the mouth and what the face does at rest. The other photographs are there to confirm`,
         `the same person from other angles and in other light — where they disagree with it, this`,
         `one wins. Do NOT average the faces together: an average of four photographs is a fourth`,
         `person, and it is the failure this instruction exists to prevent.`]
      : []),
    ``,
    `THIS IS A NORMALISATION, NOT A NEW PERSON. Everything that identifies them comes from the`,
    `attached photographs and must be carried over exactly:`,
    `- the shape of the face, the jaw, the nose, the brow, the set and spacing of the eyes`,
    // EXPRESSION IS IDENTITY, AND IT USED TO BE DECREED AWAY. This line said "neutral
    // expression", so every plate anchored a face at rest with nothing in it — and then every
    // pose that inherited the plate came back with a hard game face, because that is the
    // nearest thing to neutral an athlete photograph has.
    //
    // Asking the POSE for warmth was tried on 2026-08-22 and cost 0.2 of cosine similarity
    // (0.732 -> 0.512): a smile moves the mouth and eye corners away from a neutral anchor,
    // so warmth and likeness fought each other. The anchor is where it belongs. If the
    // customer's photographs show a man whose face is warm at rest, the plate should carry
    // THAT face, and then a warm hero is on-model rather than a departure from it.
    //
    // Note what is NOT asked for: a smile. Warmth is not prescribed here any more than the
    // shape of a nose is. The photographs decide, the same way they decide everything else on
    // this list (README section 39).
    `- THE EXPRESSION THEIR FACE HOLDS AT REST, read from the photographs: how the eyes sit,`,
    `  whether they are creased or open, where the corners of the mouth rest, what the face`,
    `  does when it is not doing anything. If their photographs show warmth in the eyes, this`,
    `  face has it. If they show a flat, serious face, this face is flat and serious. Do NOT`,
    `  neutralise it into a blank passport photograph, and do NOT add a smile they do not have.`,
    `  Lips stay together in every frame — no teeth, no laugh — whatever the mood.`,
    ...(opts.hair
      ? [`- THE HAIR, exactly as follows, and this is the detail a parent recognises first:`,
         `  ${opts.hair}`,
         `  Do not restyle it, do not add texture or a cowlick it does not have, do not change`,
         `  the fringe, the length or the parting.`]
      : [`- the hairline, hair colour, hair texture and how it falls`]),
    // SKIN TONE IS IDENTITY AND THE NEXT PARAGRAPH WAS QUIETLY UNDOING IT. "Remove the colour
    // casts" is right about a yellow room light and wrong about a suntan, and the model cannot
    // tell those apart — so both plates for Order 02 came back ashen from photographs of a
    // woman with a clear warm tan. The customer's word for it was "labai išblyškęs".
    `- SKIN TONE AND ITS WARMTH, exactly as the photographs show it, plus any freckles, moles,`,
    `  scars or marks. A tan is not a colour cast: if their skin is warm and sun-touched in the`,
    `  photographs it is warm and sun-touched here. Do NOT neutralise it toward grey, do NOT`,
    `  make them paler than they are, and do NOT even out the tone the sun gave them.`,
    ...(opts.build
      ? [`- THE BODY, exactly as follows, neither slimmed nor thickened:`, `  ${opts.build}`]
      : [`- their real age and their real build, including height and weight as they actually are`]),
    ``,
    `What you REMOVE is only the circumstance of the snapshots: the phone flash, the room`,
    `behind them, the odd crops and angles, and motion blur. A colour cast from the ROOM — the`,
    `yellow of a lamp, the green of a screen — goes. The colour of their SKIN stays exactly as`,
    `it is: that is the person, not the circumstance.`,
    ``,
    `Do NOT idealise. Do not slim them, do not straighten teeth, do not clear skin, do not`,
    `make them older or younger, do not make the face more symmetrical, do not change the`,
    `hair. If the photographs disagree with each other, follow the one where the face is`,
    `largest and sharpest.`,
    ...(opts.notes ? [``, `From the order form (use only to resolve ambiguity): ${opts.notes}.`] : []),
    ``,
    `Wearing a clean plain unbranded grey t-shirt and grey shorts in all three frames, and`,
    `BAREFOOT. No shoes, no socks, no hat, no glasses, nothing covering the face or hairline,`,
    `and no team kit — the uniform is carried separately, not by this frame.`,
    ``,
    realismFor(opts.ageYears),
    ``,
    LIGHTING_RIG,
    ``,
    `Hard requirements:`,
    `- ${PLATE_BACKDROP}`,
    `- The three frames are edge to edge, no gutter, no border, no text, no watermark.`,
    `- Unmistakably the same individual as the attached photographs — not a lookalike.`,
    `- Sharp focus on the face in every frame.`,
    NOT_PLASTIC,
  ].join("\n");
}

/**
 * THE KIT PLATE — the wardrobe's equivalent of the identity plate.
 *
 * WHY THIS EXISTS, after six rounds of trying to fix it with words: the model will not hold
 * small accessory consistency across independent generations. Four poses came back in navy,
 * grey-green, black and olive boots; naming the boots concretely helped the ball but not the
 * footwear. Each pose is a separate roll of the dice, and a large salient area like a jersey
 * survives it while a small peripheral one like a boot does not.
 *
 * The architecture already knew the answer and it was applied everywhere except here:
 * **anything that must not drift is carried by an IMAGE.** The face has the identity plate,
 * the badge has the crest file, the strip has the customer's photo — and the boots had a
 * sentence. So they drifted.
 *
 * A FLAT LAY rather than a worn shot, deliberately: a photograph of someone wearing the kit
 * invites the model to copy the pose and the body too, and those must come from the identity
 * plate. Laid out flat, the image can only say one thing — this is the wardrobe.
 *
 * Generated FROM the customer's kit photograph when there is one, so it inherits their real
 * strip; from `kits.ts` when there is not. Approve it once, then every pose references it.
 */
export function kitPlatePrompt(a: Athlete, sport: Sport, opts: { photoCount: number; hasCrest: boolean; spec?: string; kitPhotoIndex?: number; crestPlacement?: string; detailNames?: string[] }): string {
  const n = opts.photoCount;
  const first = opts.hasCrest ? 2 : 1;
  return [
    opts.hasCrest
      ? `Image 1 is the club crest.${n ? ` Images 2 to ${1 + n} are photographs of this athlete.` : ""}`
      : n ? `Images 1 to ${n} are photographs of this athlete.` : `No reference photographs are attached.`,
    // The crops come last, and the count has to be right or the numbering the prompt hands the
    // model stops matching the attachments.
    ...((opts.detailNames ?? []).length
      ? [`Images ${(opts.hasCrest ? 1 : 0) + n + 1} to ${(opts.hasCrest ? 1 : 0) + n + opts.detailNames!.length} are CLOSE CROPS of small details of this same kit.`]
      : []),
    ``,
    `A clean product photograph of a complete ${sport.name} kit, laid out FLAT and neatly`,
    `arranged on a plain light grey surface, photographed from directly above.`,
    ``,
    `EXACTLY ONE of each of these, in the frame, fully visible and not overlapping. A missing`,
    `item makes the plate unusable because the poses read the wardrobe from it — and a DUPLICATE`,
    `is just as bad, because two shirts leave the poses to choose which one is the kit:`,
    ...(sport.onePiece
      ? [`- ${sport.onePiece}`]
      : [`- the shirt, laid flat and face up`, `- the shorts below it`]),
    `- BOTH socks, laid out straight`,
    // "BOTH shoes" was read as "both PAIRS" and came back with four boots — one pair from
    // above and a second pair on its side. Count first, then describe: the number is the
    // instruction and the two views are only the detail.
    `- EXACTLY TWO SHOES IN THE WHOLE FRAME, never two pairs: ONE shoe seen from directly`,
    `  above, and the OTHER shoe of that same pair turned onto its side so its full profile`,
    `  and its outsole are visible. Two shoes, two views, so nothing about the footwear has`,
    `  to be guessed at when the poses are drawn from this plate.`,
    // A sport with no implement must not be asked for one — see hasImplement in kits.ts.
    ...(hasImplement(a) ? [`- the ball or implement of ${sport.name}`] : []),
    ...(sport.plateItems ? [`- ${sport.plateItems}`] : []),
    ``,
    // The decisions are ALREADY MADE and frozen in _spec.json (see resolve-spec.ts). Nothing
    // here is chosen at generation time — that was the bug: a model deciding inside an image
    // decides again, differently, on the next run, and the "consistent" set becomes a mix.
    // The photographs stay attached only as visual support for the items the spec took from
    // them; they are not a menu to re-choose from.
    ...(opts.spec
      ? [
          opts.spec,
          ``,
          // THE PHOTOGRAPH OUTRANKS THE PROSE, and it took a day of re-rolls to accept it.
          // This paragraph used to say the photographs were attached "only so you can SEE the
          // items the list above names" — which put a written description in charge of how a
          // garment looks. Fifteen plate re-rolls went into sentences like "a short vertical
          // white binding along the slit in the outside seam", and a hand-written description
          // of one football helmet still got its shell and its facemask the wrong way round.
          // A picture of the garment cannot be misread that way.
          //
          // The split that works: the LIST decides WHICH items exist, whether they are branded,
          // and anything the camera could not see. The PHOTOGRAPH decides what they look like.
          ...(opts.kitPhotoIndex
            ? [
                `IMAGE ${opts.kitPhotoIndex} SHOWS THIS ATHLETE WEARING THE REAL KIT. You are`,
                `photographing THOSE EXACT GARMENTS laid out flat and clean — not designing new`,
                `ones in the same colours, and not drawing what the words below describe.`,
                ``,
                // COPY, ELEMENT BY ELEMENT. The earlier version said the photograph "outranks"
                // the prose, which is true and too abstract to act on: the model still drew a
                // laced navy collar where the photograph has a red one, one sleeve band where
                // it has two, and white shoulder numbers where they are red. The words were
                // also slightly wrong, which is the deeper point — a garment written down is a
                // garment described twice, and the description will not match. Naming the
                // elements one by one turns "copy it" into a checklist the model can execute.
                `WORK THROUGH THE GARMENT ELEMENT BY ELEMENT AND COPY EACH ONE EXACTLY AS THAT`,
                `PHOTOGRAPH SHOWS IT:`,
                `- the COLLAR: its shape, its colour, and whether it is laced or plain`,
                `- the SLEEVES: their length, and every band or stripe on them — HOW MANY there`,
                `  are, how wide each one is, and how far up the arm they sit`,
                `- the HEM and any waist band: its colour and its depth`,
                `- the BODY of the shirt: its colour, and any panel or piping, or none at all`,
                `- the CREST: its size, its shape, its colours and exactly where it sits`,
                `- the NUMBER: its colour, its outline, its shape, and every place it appears`,
                `- the shorts or pants, the socks and the footwear, the same way`,
                ``,
                `Where the written list and that photograph disagree about how something LOOKS,`,
                `the PHOTOGRAPH IS RIGHT and the words are to be ignored. The list only decides`,
                `which items belong in the kit, which are branded, and what the photograph does`,
                `not show at all.`,
              ]
            : n ? [`The photographs are attached only so you can SEE the items the list above`,
                   `names. Do not take anything from them that the list does not name.`] : []),
        ]
      : [`There are no photographs to work from, so use these throughout:`, kitFor(a), setConstants(a)]),
    ``,
    opts.hasCrest
      ? `THE BADGE: take the artwork in image 1 and place it on the shirt UNCHANGED.`
        + ` Treat it as a finished graphic being applied to the garment, not as a subject to`
        + ` redraw or reinterpret: identical outline, identical figure inside, identical colours`
        + ` in identical places, identical proportions. Nothing added, nothing simplified,`
        + ` nothing restyled, and absolutely NO text — no club name, no letters, no word of any`
        + ` kind, not even small.`
        // THE PLATE IS THE ANCHOR EVERY POSE COPIES, so a placement invented here propagates
        // to all four frames — and this line hardcoded the left chest while football's own spec
        // and the athlete's own photograph put the badge centred above the number. Two sources
        // for one fact, and the plate and the poses each obeyed a different one.
        + (opts.crestPlacement
          ? ` POSITION: the badge sits ${opts.crestPlacement} Place it exactly there on the shirt`
            + ` as it lies facing you.`
          : ` POSITION: on the wearer's LEFT chest, which is the RIGHT side of the shirt as it lies`
            + ` facing you — level with the armpit, roughly a third of the way in from that edge.`)
        + ` SIZE: about one twelfth of the shirt's width. It is the ONLY graphic in the entire set.`
      : `NO BADGE AND NO LOGO ANYWHERE. The shirt is plain. Do not invent a crest, a monogram or`
        + ` any mark to fill the space — an unbranded shirt is correct and intended. A guessed`
        + ` badge is worse than none, because a club's mark is not ours to approximate.`,
    ``,
    `Hard requirements:`,
    // TROUSER LENGTH IS EVIDENCE, AND A FOLDED LEG DESTROYS IT. Baseball's and softball's
    // plates both laid the grey pants with the legs folded under, so they READ as knee-length
    // — and every pose then dressed the athlete in knickers with the socks out, five separate
    // pixel edits later. The customer found the root cause, not me: the poses copy garment
    // length from this image, so the image has to state it the way a flat lay states a colour.
    `- FULL-LENGTH GARMENTS ARE SHOWN AT FULL LENGTH: if the kit includes long trousers or`,
    `  pants, lay them out with BOTH legs extended completely straight, hems plainly visible`,
    `  at their full distance from the waistband — never folded under, never rolled, never`,
    `  cropped by another item, never arranged so they could be mistaken for knee-length.`,
    `  The poses copy the garment's LENGTH from this image, exactly like its colour.`,
    `- Everything is BRAND NEW and immaculate: no dirt, no scuffs, no creases beyond the fold`,
    `  of laying flat, no wear, no sweat marks. Copy what they wear, never its condition.`,
    `- Flat lay from directly overhead. No mannequin, no person, no body, no hanger, no rail.`,
    `- Plain light grey surface, evenly lit, soft shadows only. No props, no background objects.`,
    opts.spec
      ? `- BRANDING follows the list above, item by item: an item described from the athlete's own`
        + ` photographs keeps the manufacturer's mark it really carries, and an item that came from`
        + ` the sport default is plain and unbranded. Never ADD a swoosh, three stripes, a cat, a`
        + ` jumpman, a trefoil or a wordmark to something the list did not say has one — these`
        + ` marks carry no letters, so "no text" does not cover them and they have to be refused`
        + ` by name.`
      : `- NOTHING IS BRANDED. No manufacturer's mark on any item — no swoosh, no three stripes,`
        + ` no cat, no jumpman, no trefoil, no wordmark, no model name. Nothing here came from a`
        + ` photograph, so every item is a plain, generic version of itself.`,
    // WORDS: THE PHOTOGRAPHS DECIDE, WHEN THERE ARE ANY.
    //
    // "no club name, no lettering" was written for the demo roster, where nothing is
    // photographed and every letterform would therefore be invented — and invented letters
    // come back as "NORTHCATE IRONHAWNS". That reasoning does not survive a real order.
    //
    // Order 03 arrived with four photographs of a man in a plum-and-gold shirt with MAD LAMB
    // in gold script across the chest and 51 under it. The plate came back plain purple with
    // magenta trim: no gold, no wordmark, no number. The photographs were attached and the
    // prompt talked over them. That is exactly backwards from README section 39 — the
    // photograph wins — and it is the rule this whole pipeline is built on: what must be
    // exact is carried by an IMAGE, never by words.
    //
    // So the ban now applies only where there is nothing to copy. With the athlete's own kit
    // photographs attached, whatever they show is reproduced; what is still forbidden is text
    // that appears in NO photograph.
    ...(opts.photoCount
      ? [`- LETTERING AND NUMBERS COME FROM THE PHOTOGRAPHS, and from nowhere else. Whatever the`,
         `  attached photographs show on this kit — the club name, the squad number, the way they`,
         `  are lettered and where they sit — is reproduced here as it appears there: same words,`,
         `  same style, same colour, same position, same size relative to the garment. Do not`,
         `  tidy it, do not restyle it, do not translate it and do not leave it off. Text that`,
         `  appears in NO photograph is still forbidden: invent no sponsor, no slogan, no second`,
         `  number, no care label, no woven neck label, no watermark.`,
         // BIG LETTERING COPIES, SMALL LETTERING MANGLES — measured on Order 03. The chest
         // wordmark came back as "MadLamb", spelled correctly, because it is large and clearly
         // legible in the photographs. The manufacturer's mark on the shorts, a few millimetres
         // of it, came back as "XOND" where the real garment says RIND. A garbled brand name is
         // worse than no brand name: it is nonsense printed on something a customer pays for.
         ...((opts.detailNames ?? []).length
           ? [`- THE LAST ${opts.detailNames!.length} IMAGES ARE CLOSE CROPS of details that are too small to read`,
              `  in the wide photographs: ${opts.detailNames!.join(", ")}. Each is the real thing,`,
              `  photographed close. Reproduce what they show EXACTLY — the maker's wordmark letter`,
              `  for letter, the shoe as that shoe, the ball as that ball, the stripe in that order`,
              `  of colours. These crops are the authority for those details; the wide photographs`,
              `  are the authority for everything else.`,
              // The first run with crops attached produced TWO basketballs: the model read the
              // close crop of the ball as another object to lay out. A crop is a detail OF an
              // item already in the list, never an extra item.
              `  THESE CROPS ADD NOTHING TO THE LAYOUT. They are close views of items already`,
              `  listed above, so the frame still contains exactly one of each thing and not one`,
              `  extra ball, shoe or garment because a crop showed one.`]
           : [`- THE MANUFACTURER'S MARK IS THE ONE THING NOT COPIED. Whatever small maker's logo or`,
              `  brand name the photographs show is LEFT OFF entirely — at this scale those marks`,
              `  are a few pixels in the photographs and come back misspelled ("RIND" returned as`,
              `  "XOND" on Order 03), and a garbled brand is worse than a plain garment. Attach a`,
              `  close crop in before/kit-details/ and this rule gives way to it.`])]
      : [`- No words anywhere: no club name, no player name, no sponsor, no lettering, no woven`,
         `  neck label, no care label, no watermark. The squad number appears ONLY if the kit`,
         `  description above calls for it, and no other number is invented.`]),
    NO_REAL_WORLD_MARKS,
    `- Sharp throughout, photographic, print quality. Square image.`,
  ].join("\n");
}

/**
 * THE KIT PLATE'S BACK HALF — and it exists for the same reason `_identity-back` does.
 *
 * The wardrobe plate is a flat lay of the FRONT, so the from-behind pose had nothing to copy
 * and invented the back of the shirt fresh every time. Three sets in one day were damaged by
 * exactly that: soccer-age-22's back lost its white shoulder panels and cuffs, soccer-age-32's
 * grew a crest above the number, and soccer-age-50's grew two of them inside the numerals.
 * Each was re-rolled by hand; none of them should have needed to be.
 *
 * Kept as a SECOND plate rather than two shirts on one, because the front plate already warns
 * that a duplicate item is as bad as a missing one — two shirts in one frame leave the poses
 * to choose which is the kit. The same reasoning that gave the face two plates gives the
 * wardrobe two.
 *
 * Socks, shoes and the ball are deliberately absent: they have no distinct back worth a plate,
 * and every extra item in a flat lay is another chance to drop or duplicate one.
 */
export function kitPlateBackPrompt(a: Athlete, sport: Sport, opts: { spec?: string }): string {
  return [
    `Image 1 is a flat lay of a ${sport.name} kit, photographed from the front.`,
    ``,
    `Photograph THAT SAME KIT from the BACK — the same garments, turned over:`,
    `- the shirt, laid flat and face DOWN, so its back is what you see`,
    `- the shorts below it, also turned so their back is what you see`,
    `EXACTLY ONE of each. No socks, no shoes, no ball, nothing else in the frame.`,
    ``,
    `Everything carries over from image 1 unchanged: the same colours, the same fabric, the`,
    `same cut, the same collar, and above all the SAME PANELS AND`,
    `TRIM — a stripe, a panel or a piping that exists on the front continues around to the`,
    `back exactly as the garment's construction would carry it. Nothing is added that image 1`,
    `does not have, and nothing that image 1 has quietly disappears.`,
    ``,
    // It came back as a sleeveless vest against a short-sleeved front. "Same sleeve length"
    // buried in a list was not enough; the garment TYPE has to be stated on its own line.
    `SLEEVES: this is the same garment as image 1, so it has exactly the same sleeves. If the`,
    `shirt in image 1 has short sleeves, this one has short sleeves and is NOT a sleeveless`,
    `vest or a tank top. If image 1 is sleeveless, this one is sleeveless. Look at image 1 and`,
    `copy what is there.`,
    ``,
    ...(opts.spec ? [opts.spec, ``] : []),
    // The first version banned a badge on the back outright, generalising from three soccer
    // frames where one appeared uninvited. Basketball backs really do carry a small badge above
    // the number, and the athlete's own photograph showed one — so the ban was contradicting the
    // evidence. What must be forbidden is INVENTION, not the badge.
    // BRANCHED ON THE SPORT, because this line sits AFTER the frozen spec and therefore beats
    // it. Imani's spec said the track singlet's back stays plain — the number is on a bib on
    // the shorts — and this sentence put a black 8 across the shoulders regardless. See
    // hasBackNumber in kits.ts.
    hasBackNumber(a)
      ? `THE BACK OF THE SHIRT carries the squad number ${a.jerseyNumber}, plus whatever else the`
        + ` kit description above explicitly gives it — and nothing more. Add no mark the`
        + ` description does not name.`
      : `THE BACK OF THE SHIRT CARRIES NO NUMBER. This sport does not number the back of the`
        + ` shirt, so the back is plain: no number, no name, no badge and no lettering across`
        + ` the shoulders or anywhere else on it, unless the kit description above explicitly`
        + ` gives it one. Add no mark the description does not name.`,
    `NEVER any lettering: no club name, no player name, no sponsor, no word of any kind.`,
    `Nothing sits inside, on top of or overlapping the numerals — a badge, if the description`,
    `calls for one, is small, clear of the number, and the right way round.`,
    ``,
    `Hard requirements:`,
    `- Everything is BRAND NEW and immaculate: no dirt, no scuffs, no wear, no sweat marks.`,
    `- Flat lay from directly overhead. No mannequin, no person, no body, no hanger, no rail.`,
    `- The same plain light grey surface and the same even lighting as image 1.`,
    `- No text of any kind beyond the number, no labels, no neck tag, no watermark.`,
    `- Sharp throughout, photographic, print quality. Square image.`,
  ].join("\n");
}

/**
 * One pose. `refs` are [identity plate, crest] — the two things the model cannot be
 * trusted to invent are a face and a logo.
 *
 * ESCAPE HATCH, if QA shows the crest mangled or the face drifting when both refs are
 * present: drop the crest ref, render a BLANK chest panel, and apply the crest in a second
 * pass with the pose as the only reference. Costs one extra image per pose; do it only if
 * the single pass measurably fails.
 */
/**
 * @param kitRef true when the KIT PLATE is attached as image 3 — a clean flat lay of the
 *   whole wardrobe. See kitPlatePrompt for why the wardrobe needs an image and not a sentence.
 *
 * WHY THE KIT GETS ITS OWN REFERENCE IMAGE
 * The uniform broke on the ice-hockey pilot for exactly the reason a face breaks: it was
 * described in words, and the model designs a new garment every run. The architecture's one
 * idea is that anything which must not drift is carried by an IMAGE — so the face comes from
 * the plate, the crest from the crest file, and now the kit from the customer's own game-day
 * photograph when they have one.
 *
 * This is also the branch the product promises: if their photos show their real strip we keep
 * it, and if they do not we dress them in the sport's basic kit from `kits.ts`. Note that the
 * identity plate deliberately stays in neutral grey — putting the kit on the plate too would
 * give the model two wardrobe sources to reconcile, which is the original bug wearing a
 * different hat.
 */
export function posePrompt(a: Athlete, sport: Sport, pose: Pose, crest: Crest | undefined, kitRef = false, spec?: string, portraitRef = false, hair?: string, build?: string, kitBackRef = false, crestPlacement = "", splitPlates = false, faceCrops = false): string {
  const backdrop = a.backdrop ?? POSE_BACKDROP;
  // The from-behind frame shows a number only if the shirt HAS one — see hasBackNumber.
  const showsNumber = pose.id === "back" && hasBackNumber(a);
  const nFace = splitPlates && faceCrops ? 2 : 1;
  const bodyImg = splitPlates ? nFace + 1 : 0;
  const crestImg = crest ? (splitPlates ? bodyImg + 1 : 2) : 0;
  const kitImg = kitRef ? (crest ? crestImg + 1 : (splitPlates ? bodyImg + 1 : 2)) : 0;
  return [
    // THE IMAGE NUMBERS MOVE WHEN THERE IS NO BADGE. An order without a club logo is normal
    // (crests.ts: a guessed badge is worse than none), but this line used to name a crest that
    // was not attached — so image 3 in the text was image 2 in the request and the wardrobe
    // reference was described as a crest.
    // EVERY IMAGE NUMBER IS COMPUTED, never typed. The attachments are [face(s), body?, crest?,
    // kit?] and any of the optional ones may be absent, so a literal "image 3" is right in one
    // configuration and points at the wrong picture in the next — the wardrobe paragraph
    // below said "image 3" for an order with no badge, where the flat lay was image 2.
    (() => {
      const parts: string[] = [];
      if (splitPlates) {
        parts.push(faceCrops
          ? `Images 1 and 2 are two close portraits of ONE specific person's face — straight on and three-quarter.`
          : `Image 1 is a FACE sheet of one specific person — two close portraits.`);
        parts.push(`Image ${bodyImg} is the SAME person photographed FULL LENGTH.`);
      } else {
        parts.push(`Image 1 is a reference sheet of one specific person.`);
      }
      if (crest) parts.push(`Image ${crestImg} is a club crest.`);
      if (kitRef) parts.push(`Image ${kitImg} is a flat lay of the exact kit they wear — shirt, shorts, socks, footwear and ball.`);
      return parts.join(" ");
    })(),
    ``,
    `Photograph THAT EXACT PERSON — same face, same bone structure, same hair, same build,`,
    `same age — playing ${sport.name}.`,
    // ONE IMAGE CANNOT DO TWO JOBS, and asking it to was the defect underneath a whole run of
    // them. A single sheet holding two close portraits and one full-length frame lets the model
    // read the likeness off a thirty-pixel face; naming the panels inside one image helped and
    // did not settle it. Separate images settle it: the face has its own attachment, the body
    // has its own, and each sentence points at one of them.
    ...(splitPlates
      ? [`THE FACE COMES FROM ${faceCrops ? "IMAGES 1 AND 2" : "IMAGE 1"} AND NOTHING ELSE — the features, the eye spacing, the nose,`,
         `the mouth, the hairline and the expression the face holds at rest. Image ${bodyImg}'s face is`,
         `small and carries no likeness: do NOT read the face from it.`,
         `THE BODY COMES FROM IMAGE ${bodyImg} AND NOTHING ELSE — the height, the width of the shoulders,`,
         `the length of the limbs and the build. Do not slim it and do not lengthen it.`,
         // PROPORTIONS, NOT POSTURE. Image 2 is a standing reference frame, and "how the weight
         // sits" was enough to make the model copy the STANCE with it: the hero came back stood
         // upright and at rest while the brief below asked for a player landing out of a
         // split-step. The body plate answers what this person is SHAPED like; the pose brief is
         // the only thing that says what they are DOING.
         `Image ${bodyImg} shows them standing still. That is a MEASUREMENT, not a pose: take the`,
         `proportions from it and NOTHING about the stance. This photograph is the action`,
         `described below, and the body in it is bent, turned and loaded exactly as that action`,
         `requires.`]
      : [`THE FACE COMES FROM THE CLOSE PORTRAIT PANELS of that sheet — the head-and-shoulders frame`,
         `and the three-quarter frame. The full-length panel is there for the BODY only: its face is`,
         `tiny and carries no likeness. Do not read the face from it.`]),
    ...(hair ? [hair] : []),
    ...(build ? [build] : []),
    ``,
    ...(portraitRef
      ? [
          `THE LAST IMAGE is the photograph this athlete's family considers the best likeness of`,
          `them. The face here must match THAT: not only the features, but the expression and the`,
          `warmth of it — how the eyes sit, how the mouth rests, what the face does at ease. The`,
          `identity sheet fixes the bone structure; this fixes who they look like. This is the`,
          `frame the family will hold up and compare, so it is the one that has to survive that.`,
          ``,
        ]
      : []),
    `POSE: ${pose.action}.`,
    `CAMERA: ${pose.camera}.`,
    `FACING: ${pose.facing}.`,
    `EQUIPMENT: ${pose.equipment}.`,
    ``,
    // EXPRESSION IS DELIBERATELY NOT ASKED FOR HERE. TRIED AND REVERTED, 2026-08-22.
    //
    // The heroes come back with a hard game face, and on Order 01 — a customer who is
    // laughing in three of his four photographs — that looked wrong enough to fix. So the
    // prompt was given a warm, closed-lipped expression, in the usual absolute form. It
    // worked: the face smiled exactly as described.
    //
    // It also cost the likeness, and the number and the eye agreed for once. Against the
    // customer's own four photographs the same hero scored:
    //
    //   game face (as generated here)   0.732
    //   re-rolled asking for warmth     0.614
    //   art:fix, expression only        0.512
    //
    // The customer's verdict on the two warm takes was "the face is badly off in both". A
    // smile moves the mouth, the cheeks and the eye corners — most of what makes a face
    // recognisable — and the identity plate anchors a RESTING face, so every millimetre the
    // mouth travels is a millimetre away from the anchor. This is not a prompt that needs
    // better wording; warmth and likeness are being traded against each other, and likeness
    // is the product.
    //
    // If this is revisited: the place to fix it is the ANCHOR, not the pose. An identity
    // plate built to include a warm closed-lipped panel would let a pose be warm and on-model
    // at the same time. Asking the pose alone will keep costing ~0.2 of cosine.
    kitRef
      ? `UNIFORM AND EQUIPMENT — every item comes from image ${kitImg}, exactly as shown there. The`
        + ` shirt, the shorts, the socks, the boots and the ball are THOSE items: same colours,`
        + ` same design, same shape, same condition — clean and unmarked. This includes the CUT,`
        + ` and the SLEEVE LENGTH above all: if the shirt in image ${kitImg} has long sleeves, this athlete`
        + ` wears long sleeves, and if they are pushed up to the elbows they are pushed up here`
        + ` too. Long sleeves in one frame and short in another is the same athlete in two`
        + ` different shirts. Also match the collar and any piping exactly. Do not substitute a`
        + ` different boot, do not change the sock colour, do not swap the ball. Image ${kitImg} is the`
        + ` complete wardrobe for this athlete and there is nothing left to decide.`
      : `UNIFORM — identical in every pose, this is not a place to improvise: ${kitFor(a)}`,
    `Primary colour ${a.primaryColor}, secondary ${a.secondaryColor}.`,
    // THE PADS ARE NOT IN THE WARDROBE IMAGE and cannot be. The kit plate is a flat lay, so it
    // carries colour, cut and trim and says nothing about what the garment does over a set of
    // shoulder pads — and the line above tells the model image 3 is the complete wardrobe with
    // "nothing left to decide". Football's four frames duly came back on an unpadded torso: the
    // jersey right, the sport unrecognisable. Anything an image cannot carry has to be a
    // sentence, which is the same rule as everywhere else read from the other end.
    ...(isPadded(a) ? [``, `SILHOUETTE — ${paddingFor(a)}`] : []),
    // Buried inside the wardrobe paragraph these two lost every time: a short-sleeved plate
    // came back sleeveless, and an ornate shield with micro-lettering appeared where the
    // club's own badge was attached. Promoting them to their own lines fixed exactly this
    // failure on the kit plates, so they get the same treatment here.
    ...(kitRef
      ? [
          ``,
          `SLEEVES: copy the garment in the kit image. If it has short sleeves this athlete`,
          `wears short sleeves and it is NOT a sleeveless vest; if it is sleeveless, so is this.`,
          `GRAPHICS: the badge is the ONLY mark on the shirt besides the number. No`,
          `manufacturer's logo, no second badge, no lettering of any kind anywhere on the kit.`,
        ]
      : []),
    ...(kitBackRef
      ? [
          `THE BACK OF THE KIT is the LAST image attached: the same shirt and shorts photographed`,
          `from behind. This frame shows the athlete from behind, so that plate — not your own`,
          `judgement — decides the number, the panels and the trim on the back of the garment.`,
        ]
      : []),
    ``,
    // The frozen spec when there is one, the sport constants when there is not. Either way
    // the wardrobe is stated, never inferred.
    spec ?? setConstants(a),
    // SAME WORDING THAT FIXED THE KIT PLATE. "Copy the artwork" reads to the model as "draw
    // something like this"; "take it and apply it unchanged" reads as "stamp this file on".
    // The second one produced a crest indistinguishable from the source; the first produced a
    // pale green ghost of it. The difference is entirely in how the task is framed.
    ...(crest ? [] : [`THE KIT CARRIES NO BADGE AND NO CLUB MARK. The chest is plain. Do not invent a`,
                     `crest, a monogram, a shield or any emblem to fill it — this athlete's order has no`,
                     `logo, and an invented one is a mark on a garment they do not own.`]),
    ...(!crest ? [] : [
    `THE BADGE: take the artwork in image ${crestImg} and apply it to the shirt UNCHANGED — a finished`,
    `graphic being printed onto a garment, not a subject to redraw. Identical outline, identical`,
    `figure, identical colours in identical places, identical proportions, and its white stays`,
    `WHITE and fully opaque against the shirt — never tinted, faded or blended into the fabric`,
    `colour. It creases and shades with the cloth, but the artwork itself does not change.`,
    `SIZE: about a hand's width at this scale. It is the ONLY badge on the kit.`,
    ]),
    // This block used to open with "POSITION: on the wearer's LEFT chest" and then, in the
    // kitRef branch, "do NOT move it to the centre". Football's jersey carries its badge
    // centred high — its own photograph shows it there and its plate was built that way — so
    // the prompt was actively instructing the model to move the crest OFF the place the
    // wardrobe anchor put it, and the hero and the block frame both obeyed. A plate exists so
    // that placement is not decided again here.
    // AN ABSOLUTE BEATS A POINTER. Both branches below say "where the kit description puts
    // it" — which is a pointer to a paragraph, and a pointer has to be resolved by the same
    // judgement that got this wrong. `_spec.json` can now state the position outright, and
    // when it does, that sentence is printed here instead of a reference to one.
    crestPlacement
      ? `PLACEMENT: the badge sits ${crestPlacement} Exactly there, at that scale, in every`
        + ` frame. It is a settled decision, not a convention to be corrected: do not move it,`
        + ` do not enlarge it, do not let it dominate the shirt.`
      : kitRef
      // The previous wording tried to say "wherever the plate has it" by listing the options:
        // "left chest, centred, wherever that is". Naming the wrong option even to dismiss it
        // hands the model a menu, and it took the first item — football's centred badge moved
        // to the chest side in two frames. Absolutes, never comparisons, and never say the
        // thing you do not want.
      ? `PLACEMENT: the badge goes exactly where the kit description above puts it and exactly`
        + ` where image ${kitImg} shows it — the same spot on the shirt, at the same scale. That position`
        + ` is a settled decision and not a convention to be corrected. Do not move it, do not`
        + ` enlarge it, do not let it dominate the shirt.`
      : `PLACEMENT: small on the LEFT chest, about three fingers wide — a real team badge, not a`
        + ` printed graphic across the front.`,
    // "No numbers anywhere in this shot" contradicted every kit whose jersey carries a front
    // number, football's and basketball's included.
    showsNumber
      ? `The number ${a.jerseyNumber} is printed large across the upper back, legible, in the secondary colour.`
      : pose.id === "back"
        // The from-behind frame of a sport that does NOT number the back. Said explicitly,
        // because silence here is what the model fills with an invented number — and the
        // reference plate it is copying is the one place that number would look plausible.
        // "no club" was not enough and the CHEST CREST went on appearing between the shoulder
        // blades on five athletes in a row — track-field, swimming, golf, skateboarding and
        // pickleball-youth — every time against a `_kit-back` plate that shows a plain back.
        // The badge has to be refused BY NAME, in its own clause, exactly the way the wordless
        // brand mark did. README §41.
        ? `THIS SHIRT CARRIES NO NUMBER ON THE BACK. Copy the back of the kit exactly as the`
          + ` flat lay shows it: whatever number the kit has, if any, is in the place the flat`
          + ` lay puts it and nowhere else. Nothing is printed across the shoulders — no number,`
          + ` no name, no club, no lettering of any kind.`
          + ` AND THE CLUB CREST IS NOT ON THE BACK EITHER. The badge in image ${crestImg} belongs on the`
          + ` FRONT of this shirt and only there. Do NOT print it, repeat it, shrink it or place`
          + ` any version of it between the shoulder blades, on the upper back, at the nape or`
          + ` anywhere else on the back. If the flat lay shows the back blank, the back is blank.`
        : kitRef
          ? `Any number on the front of the shirt is the one in image ${kitImg}, in the same place and the`
            + ` same colours. No other number, and no lettering of any kind.`
          : `No numbers or lettering anywhere on the kit in this shot.`,
    ``,
    realismFor(a.ageYears),
    ``,
    POSE_CONDITION,
    ``,
    LIGHTING_RIG,
    ``,
    `Hard requirements — this image will be cut out and composited, so:`,
    `- ${backdrop}`,
    `- The athlete is ALONE and stands on nothing: no ground, no floor, no field, no court,`,
    `  no arena, no crowd, no other people, no spray, no particles, no smoke.`,
    `- FRAMING: leave a clear empty band of backdrop around the athlete on ALL FOUR sides,`,
    `  roughly a hand's width at this scale. Nothing may touch or cross a frame edge — not`,
    `  the top of the head, not a foot, and above all not the far end of any equipment, which`,
    `  is the thing that gets clipped. If the pose does not fit, PULL THE CAMERA BACK. Never`,
    `  change the pose to make it fit and never let anything run off the edge.`,
    `- ${pose.mustShow}.`,
    // HANDS ARE THE FIRST THING A PARENT SEES GO WRONG, and they went wrong three times in one
    // athlete: two raised-salute frames came back with the fingers fused into a mitten and a
    // third had the fingertips melting together. The customer's standing instruction, given
    // 2026-08-22 while waving those three frames away as "not wrong enough to re-roll":
    // *the hand movements and the fingers must be as natural as possible everywhere, from the
    // first roll, because that matters.* So it is asked for on every pose rather than repaired
    // on the ones that fail — a repair costs an image, this costs nothing.
    `- HANDS: both hands are drawn anatomically, in full, and they read as hands. FIVE fingers`,
    `  on each, separated from one another with visible gaps and daylight between them where`,
    `  they are apart — never fused into a mitten, never melting into each other, never a`,
    `  smooth paddle of skin, and never more or fewer than five. Each hand does something a`,
    `  real athlete's hand does in this movement: gripping, open and flat, reaching, or hanging`,
    `  loose — and both hands agree with the effort in the rest of the body. Where the hands`,
    `  are near each other they may TOUCH, but each one stays a separate readable hand with its`,
    `  own outline. Wrists bend the way wrists bend.`,
    `- Vertical 2:3, the athlete filling most of the height.`,
    // A FLAT LAY SHOWS THE GARMENT, NEVER HOW IT HANGS. The kit plate settles colour, cut and
    // trim, and the model then paints it onto the body skin-tight because nothing told it
    // otherwise. Fit has to be described separately from design, every time.
    // TWO DIFFERENT GARMENTS, so two different rules. "The shirt drapes from the shoulders"
    // is right for a soccer shirt and wrong for a jersey stretched over pads, and stated
    // unconditionally it argued with the SILHOUETTE block above — one instruction saying the
    // shoulders are a square shelf and another saying the cloth falls from them.
    isPadded(a)
      ? `- FIT: over the pads the jersey is TAUT across the shoulders and the chest, holding`
        + ` their square line with no drape and no folds there; below the ribs it hangs loose`
        + ` and away from the stomach. The pants and socks sit as the flat lay shows them.`
      : `- FIT: the kit HANGS on them. The shirt drapes from the shoulders with room through the`
        + ` chest and body and does not cling to the stomach or the ribs; the sleeves are loose`
        + ` on the arms; the shorts hang rather than grip. Loose the way a real team kit is, NOT`
        + ` tight and NOT sagging or oversized — the fit shown on the flat lay, worn.`,
    kitRef
      ? `- BRANDING: whatever image 3 shows is right. If an item there carries a manufacturer's`
        + ` mark, keep it exactly; if it is plain, it stays plain. Never add a swoosh, three`
        + ` stripes, a cat, a jumpman or a trefoil that image 3 does not have.`
      : `- NOTHING IS BRANDED: no swoosh, no three stripes, no cat, no jumpman, no trefoil, no`
        + ` wordmark, no model name anywhere. A brand device carries no letters, so it has to be`
        + ` refused by name.`,
    `- Sharp throughout. No motion blur, no shallow-focus blur. Keep any contact shadow tight`,
    `  under the feet — no long cast shadow across the backdrop, no floor-to-wall seam.`,
    `- No text, no lettering, no sponsor marks, no brand logos, no watermark${showsNumber ? ` — the jersey number and the chest crest are the only exceptions` : ` — the chest crest is the only exception`}.`,
    // A SWOOSH IS NOT TEXT, and the line above — which bans "text, lettering, sponsor marks,
    // brand logos" — kept letting one through anyway: onto a tennis headband twice, onto a
    // swim cap, onto track spikes. The wordless-mark ban has to be its own sentence naming the
    // devices, exactly as it had to be in snapshotPrompt. Same fix, one layer further down.
    `- NO BRAND, MAKER OR LEAGUE MARK ANYWHERE IN THE FRAME. No swoosh, no stripes device, no`,
    `  maker's logo and no moulded logo on the shirt, the shorts, a headband, a wristband, a cap,`,
    `  a helmet, the socks, the shoes, their soles, or any ball, racket, stick, board or bag —`,
    `  and no NFL, NBA, MLB, NHL, FIFA, UEFA, NCAA, Olympic or federation emblem. Every garment`,
    `  and every piece of equipment is plain and unbranded. The club crest is the only mark.`,
    NO_REAL_WORLD_MARKS,
    NO_MIRRORED_TEXT,
    NOT_PLASTIC,
  ].join("\n");
}

/**
 * The club crest. Flat artwork, not a photograph — it has to survive being printed on a
 * jersey, placed in the `#team_logo` square in the layouts, and read at thumbnail size.
 * Wordless by rule: see the note at the top of `crests.ts`.
 */
export function crestPrompt(c: Crest): string {
  return [
    `A flat vector-style sports club crest, drawn as clean solid shapes.`,
    ``,
    `Outline: ${c.shape}.`,
    `Inside it: ${c.motif}.`,
    `Colours: ${c.primaryColor} and ${c.secondaryColor} only, plus white.`,
    ``,
    `Hard requirements:`,
    `- Absolutely NO text, no letters, no words, no numbers, no monogram, no banner or ribbon`,
    `  for a name. The mark alone.`,
    `- Flat solid colour with hard edges. No gradients, no gloss, no bevel, no drop shadow,`,
    `  no 3D, no photographic texture, no mockup on a garment.`,
    `- Centred on a plain pure white background, with even margin around it.`,
    `- Bold and simple enough to still read as itself at 40 px wide.`,
    `- Square image.`,
  ].join("\n");
}
