#!/usr/bin/env tsx
/**
 * The photographs an Etsy SPORT listing needs that no other file can supply.
 *
 * Everything else on the 20 slides already exists: the cards and poster come out of that
 * sport's Figma hero file, the athlete's four poses / kit plates / identity plates / intake
 * photos are on disk under `out/athletes/<slug>/`. What is left is the handful of scene
 * photographs that are specific to the SPORT rather than to the athlete — the hero backdrop,
 * the card held in a hand, and the "do not send us this" examples.
 *
 * Written 2026-08-27 while building the FOOTBALL pair, generalised so the remaining fifteen
 * sports are a `--sport <slug>` away.
 *
 *   npm run art:etsy:sport -- --sport football            # generate the missing shots
 *   npm run art:etsy:sport -- --sport football --only hero-bg
 *   npm run art:etsy:sport -- --sport football --judge    # grade what is already on disk
 *
 * RULES this file obeys, all of them learned the expensive way (README §29, §40):
 *  - ONE attempt per shot. A re-roll re-dices everything; if a shot is wrong, change the
 *    prompt, do not spin.
 *  - No text is ever generated. Every word on a slide is set in Figma.
 *  - Real league marks are refused by name, and a wordless-mark ban is its own sentence.
 *  - Every generated frame is graded by the judge before it is used (memory: audit-all-generated).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { generateImage, generateJson, loadEnv, imageModel, type RefImage } from "./lib/gemini.js";
import { SPORTS } from "./sports.js";
import { athleteBySlug } from "./athletes.js";

loadEnv();

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const flag = (name: string) => process.argv.includes(`--${name}`);

const slug = arg("sport") ?? "football";
const only = arg("only");
/** The finish this listing leads with — the card held in the hand must be that one. */
const finish = (arg("finish") ?? "FS").toUpperCase();
const athlete = athleteBySlug(slug);
if (!athlete) throw new Error(`no athlete record for "${slug}"`);
const sport = SPORTS.find((s) => s.slug === athlete.sport);
if (!sport) throw new Error(`no sport record for "${athlete.sport}"`);

const OUT = `art-pipeline/out/etsy-shots/${slug}`;
mkdirSync(OUT, { recursive: true });

const png = (p: string): RefImage => ({ data: readFileSync(p), mime: "image/png" });
const A = `art-pipeline/out/athletes/${slug}`;

/** Bans that must appear in EVERY prompt. A wordless mark needs its own sentence. */
const NO_MARKS =
  `No real league or governing-body mark of any kind: no NFL shield, no FIFA, NCAA, MLB, NBA, NHL or ` +
  `Olympic mark. No brand device either — no swoosh, no three stripes, no jumpman, no trefoil, no ` +
  `wordless logo of any real company anywhere on the clothing, the ball, the walls or the equipment. ` +
  `No text overlay, no caption, no watermark. No readable words on signage, boards, banners or ` +
  `clothing — the playing surface's own painted markings are fine and expected.`;

const PHONE = `Shot on a phone by a parent, not by a photographer: available light, no studio lighting, no flash, slight imperfection.`;

/**
 * A prompt that names a wall scene AND a person doing something is two subjects, and the model is
 * free to resolve that as two pictures. Cheerleading's `p-three-frames` came back as a stacked
 * DIPTYCH — the dresser in the top half, Amara writing in the bottom half, a hard seam between
 * them — while football and basketball returned one room. Asking for "a photograph" is not enough:
 * the single frame has to be its own sentence, and the judge has to be able to fail it.
 */
/**
 * How the blank plate is held. Arm-extended-square-on puts the card nearest the lens at its
 * widest angle, so any error in the fitted quad shows as a trapezoid — the football take read as
 * a distorted card. `--hold chest` brings it back to chest height at a gentler angle, where the
 * card subtends less of the frame and perspective is mild. Same plate, same compositor; only the
 * geometry the fit has to solve gets easier.
 */
/**
 * The one physical fact that stops a "monster card". `reach` asks the card to fill a third of the
 * frame, and the model obliged by growing the card instead of moving it closer — four volleyball
 * takes running, at 0.87 to 1.17 of a face wide. Framing is a matter of degree and loses to a
 * comparison; a comparison against something also in the picture does not.
 */
const SMALL =
  `THE CARD IS SMALLER THAN THEIR FACE: a trading card is 6.5 cm across and a face is 15 cm, so ` +
  `the card is clearly NARROWER than the person's own face is wide — about half of it — and not ` +
  `much longer than their palm. `;

const HOLDS: Record<string, string> = {
  reach:
    `They hold it OUT TOWARD THE CAMERA, well in front of their chest and closer to the lens ` +
    `than their face, arm extended — so the card is LARGE in the picture and fills roughly a ` +
    `third of its height, while still being the small object it is in their hand. The camera is ` +
    `focused on the card. ` +
    SMALL,
  chest:
    `They hold it at CHEST HEIGHT, close in to the body, elbow bent and tucked — not reaching ` +
    `toward the camera. The card sits almost flat to the sensor with only a gentle tilt, no more ` +
    `than about ten degrees, so its four edges stay very nearly parallel to the edges of the ` +
    `photograph and it does not read as a wedge. It fills roughly a quarter of the picture's ` +
    `height. The camera is level with the card and focused on it, the face slightly behind and ` +
    `softer. ` +
    // Every overlap of thumb and card edge is a place the composite has to reconstruct, and it is
    // where all three bad takes broke. So take the thumb OFF the face entirely: the card is
    // pinched by its two side edges, front face completely unobstructed.
    `ONE HAND ONLY holds the card — the other arm is down and out of the picture; two hands on ` +
    `the card produced tangled, mis-jointed fingers every time. ` +
    `THE CARD'S FRONT FACE IS COMPLETELY UNOBSTRUCTED: that one hand grips it by the two SIDE ` +
    `EDGES, thumb on the near edge and two fingertips on the far edge, the way you hold a ` +
    `photograph you do not want to touch. NO finger and NO thumb lies on the front of the card, ` +
    `none crosses the bottom edge, and all four corners are clearly visible against the ` +
    `background. The hand is ordinary and unretouched: five separated, correctly jointed fingers. ` +
    `The hand grips the card at its MIDDLE HEIGHT, level with the centre of the card, so the ` +
    `whole LOWER THIRD of the card is clear of the hand: that strip carries the athlete's name ` +
    `once the artwork is added, and a finger resting there hides it. ` +
    SMALL,
};
const HOLD = HOLDS[(arg("hold") ?? "reach").toLowerCase()] ?? HOLDS.reach;

const ONE_FRAME =
  `ONE single continuous photograph: one camera, one moment, one room, everything in the same ` +
  `space and the same light. NOT a diptych, NOT a split screen, NOT a collage, NOT a before-and-` +
  `after, NOT two or more panels stacked or side by side. There is no dividing line, no seam, no ` +
  `border and no gutter anywhere in the picture.`;
const ONE_FRAME_CHECK =
  `The picture is ONE single continuous photograph of one scene, not split or divided into two or ` +
  `more panels, halves or tiles, and there is no dividing line or seam across it.`;

interface Job {
  name: string;
  ar: string;
  prompt: string;
  refs: RefImage[];
  /** What the judge must confirm. One sentence per check, all must be true. */
  checks: string[];
}

/**
 * Slide 03 is the card REVEAL, and it is the same beat in every listing — which is exactly why
 * it must not be the same PHOTOGRAPH in every listing. The first two takes both came back as a
 * grey T-shirt against a blurred pitch, because the identity plate is shot in a grey T-shirt and
 * the model copies what it is shown. Customer's note, 2026-08-27: "not always the same shirt as
 * the identity plate — their own casual clothes, and the scene can be different."
 *
 * So the outfit and the setting are DIRECTED here, one per sport, picked by a stable hash of the
 * slug so a re-run of the same sport gives the same scene and two sports never collide.
 *
 * EVERY OUTFIT HERE IS LIGHT OR MID-TONE, and that is not a style choice. The blank plate is
 * PURE BLACK so that the compositor's mask is exact (lib/card_in_hand.py), which only works
 * while the card is the darkest thing in the frame. The first football take put a navy hoodie
 * in front of a car's dark interior, the card merged with both, and no plate could be found at
 * any threshold. Never dress an athlete in black, navy or charcoal for this shot.
 */
const REVEALS: { outfit: string; place: string; beat: string }[] = [
  { outfit: "a light heather-grey zip-up hoodie over a white t-shirt, hood down",
    place: "sitting on a low wall in the car park after a game, the floodlights of the ground behind them out of focus",
    beat: "grinning, holding the card up toward the camera the way you show someone something you just got" },
  { outfit: "a cream long-sleeved henley and a light beanie pushed back off the forehead",
    place: "at the kitchen table at home in the evening, warm lamp light, an opened envelope and its packaging just visible on the table",
    beat: "lifting the card into the light to look at it, eyes on the card, half a smile" },
  { outfit: "a cream-and-tan varsity-style jacket over a plain white tee",
    place: "on the bleachers at dusk with the empty ground behind them",
    beat: "holding the card out toward the camera at arm's length, laughing" },
  { outfit: "a soft oatmeal crew sweatshirt",
    place: "in the doorway of their bedroom at home, evening light from a window behind",
    beat: "holding the card up beside their face and smiling straight down the lens" },
  { outfit: "a light-wash denim jacket over a plain white t-shirt",
    place: "leaning against a wall just outside the sports hall, late afternoon sun across the wall",
    beat: "holding the card up in front of them, shoulders relaxed, a proper smile" },
  { outfit: "a pale sand puffer jacket zipped halfway",
    place: "outside the doors of the venue at night, the light from inside spilling onto them",
    beat: "holding the card up so the light catches it, looking pleased with themselves" },
];
/**
 * The POSTER listing's "in the room" slide. Same problem as the reveal: three framed posters in
 * a row is one idea, not the idea, and seventeen listings showing the same wall is seventeen
 * listings that look like stock. Customer's note, 2026-08-27: "make it more varied so there is
 * some uniqueness — different ways of using that poster."
 *
 * Every entry still generates the poster's own opening EMPTY and FLAT BLACK, because the real
 * poster is warped in afterwards by figma/etsy-poster-in-room.py. That part is not negotiable.
 */
/**
 * What the athlete is DOING in the room shot. The first two rooms both had them lacing a shoe,
 * because that was the one action the prompt named — and a gallery of seventeen listings all
 * tying a shoe is a gallery that looks generated. Customer's note, 2026-08-27.
 *
 * Every one of these is an ordinary weekday thing, done while the poster happens to be there.
 * That is the point of the slide: the poster lives in the room, it is not being presented.
 */
const ACTIONS: string[] = [
  "sitting cross-legged reading a paperback, holding their place with a thumb",
  "at a desk writing in an exercise book, pen in hand, head down",
  "sitting with a laptop open on their knees, scrolling, half-smiling at the screen",
  "kneeling by an open sports bag, packing it for tomorrow",
  "standing at the window drinking from a water bottle, looking out",
  "sitting on the edge of the bed texting on a phone held in both hands",
];
const action = ACTIONS[Math.abs([...slug].reduce((a, c) => (a * 53 + c.charCodeAt(0)) | 0, 2)) % ACTIONS.length];

const ROOMS: { name: string; scene: string }[] = [
  { name: "three-in-a-row",
    scene: "THREE framed posters hung in a row at the same height, all PORTRAIT, all in slim black " +
           "frames of the same size, the MIDDLE ONE the empty black rectangle. The left and right " +
           "frames hold posters with NO PEOPLE and no readable words, and THE TWO OF THEM ARE " +
           "CLEARLY DIFFERENT PICTURES, not the same image twice: the LEFT one is a wide view of " +
           "the empty venue from high up, the RIGHT one is a close, tightly-cropped detail of the " +
           "playing surface and its markings" },
  { name: "over-the-desk",
    scene: "ONE framed poster in a slim black frame hung on the wall directly above a tidy study " +
           "desk with a lit desk lamp, a laptop closed, and a mug. The poster's opening is the " +
           "empty black rectangle" },
  { name: "leaning-on-the-dresser",
    scene: "ONE framed poster in a slim black frame LEANING against the wall on top of a chest of " +
           "drawers, not yet hung, tilted slightly back, with a few small objects beside it. The " +
           "poster's opening is the empty black rectangle" },
  { name: "hallway-gallery",
    scene: "ONE framed poster in a slim black frame on a hallway wall, hung among four or five " +
           "much smaller framed FAMILY photographs whose contents are soft and unreadable. The " +
           "big poster's opening is the empty black rectangle and it is at least twice their size" },
  { name: "above-the-bed",
    scene: "ONE framed poster in a slim black frame centred on the wall above the head of a made " +
           "bed with a plain duvet and two pillows. The poster's opening is the empty black rectangle" },
  { name: "beside-the-shelf",
    scene: "ONE framed poster in a slim black frame on the wall beside a shelf holding a few " +
           "trophies and medals, the trophies plain and carrying no readable words. The poster's " +
           "opening is the empty black rectangle" },
];
const room = ROOMS[Math.abs([...slug].reduce((a, c) => (a * 13 + c.charCodeAt(0)) | 0, 11)) % ROOMS.length];

const reveal = REVEALS[Math.abs([...slug].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)) % REVEALS.length];

const cardFront = `etsy/listing-images/01-${slug}-card/src/FB-${finish}-card-FRONT.png`;

const JOBS: Job[] = [
  {
    // POSTER listing slide 01. The frame is generated EMPTY and flat black; the real poster is
    // warped in afterwards by figma/etsy-poster-in-room.py. Never ask the model to draw it.
    name: "p-hero-wall",
    ar: "1:1",
    refs: existsSync(`${A}/_identity.png`) ? [png(`${A}/_identity.png`)] : [],
    prompt:
      `A photograph of a bedroom wall painted a soft warm grey-blue, shot STRAIGHT ON: the camera faces ` +
      `the wall square, the wall fills the whole picture, no second wall, no ceiling and no corner of ` +
      `the room is visible, and there is NO perspective — the wall is flat and parallel to the camera. ` +
      `The wall is BARE except for ONE large FRAMED poster in PORTRAIT orientation, slim black frame, ` +
      `hung perfectly square on the LEFT half of the picture, filling about 70 percent of the height. ` +
      `Because the wall is flat to the camera, the frame is an exact upright rectangle with no ` +
      `foreshortening: its left and right edges are vertical and its top and bottom edges horizontal. ` +
      `THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, even, pure BLACK rectangle: no picture, ` +
      `no pattern, no photograph, no text, no glare and no reflection, unobstructed from edge to edge. ` +
      `The frame's opening is exactly 3 units wide by 4 units tall. ` +
      `The teenager from the reference image — same face, same skin tone, same hair, same heavy build — ` +
      `stands at the RIGHT of the picture in ordinary everyday clothes, seen in profile, looking across ` +
      `at the frame. He does not overlap the frame. ` +
      `On the floor below, out of the way, sit the everyday things of his sport: ${sport.gear}. ` +
      `Nothing from any other sport appears anywhere in the room. Warm afternoon light. ` +
      `${ONE_FRAME} ${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      ONE_FRAME_CHECK,
      `The inside of the framed poster is completely empty and flat black, with no picture or text in it.`,
      `The person is the same person as in the reference image: same face, same hair, same build (ignore any pronoun; judge only the picture).`,
      `Any sports equipment in the room belongs to ${sport.name} and to no other sport.`,
      `The person does not overlap or cover the frame.`,
      `The frame is an upright rectangle seen straight on, not tilted or foreshortened.`,
    ],
  },
  {
    // POSTER listing slide 03 — three frames in a row. The SIDE posters must contain NO PEOPLE:
    // asked for invented athletes once, the model returned real NBA players in real team kit.
    name: "p-three-frames",
    ar: "1:1",
    refs: existsSync(`${A}/_identity.png`) ? [png(`${A}/_identity.png`)] : [],
    prompt:
      `A photograph of a teenager's room. On the wall: ${room.scene}. ` +
      `THAT EMPTY OPENING IS A FLAT, EVEN, PURE BLACK RECTANGLE — no picture, no pattern, no ` +
      `text, no glare, no reflection, edge to edge — and it is exactly 3 units wide by 4 units ` +
      `tall, seen straight on with no foreshortening. ` +
      // "no reflection" alone lost to a window placed opposite the frame: the model obeyed the
      // room, not the rule. The glass has to be removed and the window has to be sent elsewhere.
      `THE FRAME HOLDS NO GLASS AT ALL: the black opening is bare matte board, so nothing is ` +
      `mirrored in it. No window, lamp, doorway or light source faces the frame or appears ` +
      `reflected in it, and the black stays the same even tone from corner to corner. ` +
      `The room is tidy and picked up — no laundry, no heaped clothes, nothing on the floor ` +
      `except the sports things named below. ` +
      `Below it the teenager from the reference image — same face, same skin tone, same hair, ` +
      `same build — is in the room in ordinary everyday clothes, not kit, ${action}, not looking ` +
      `at the camera and not interacting with the poster at all. ` +
      `Beside them lie the everyday things of their sport: ${sport.gear}, in ` +
      `${athlete.colorName} and cream, the colours of their club. Nothing from any other sport ` +
      `appears anywhere in the room, and there is NO WRITING anywhere in the picture. ` +
      // "no writing anywhere" was in this prompt already and still came back with a club name in
      // script across a uniform on the floor. A garment is where lettering wants to go, so the
      // ban has to name the garment; a word painted out afterwards smears worse than it reads.
      // Soccer's "framed poster" came back as a flat-screen TELEVISION on a dresser — a big dark
      // rectangle, which is exactly what the compositor hunts for, so our poster would have been
      // pasted onto a television. The frame has to be described as a frame, not merely as dark.
      `IT IS A PICTURE FRAME AND NOT A SCREEN: a slim wooden or painted moulding around a printed ` +
      `poster. It is NOT a television, NOT a monitor, NOT a tablet — no glossy panel, no plastic ` +
      `bezel, no stand, no buttons, no cables, no speaker grille. There is no television anywhere ` +
      `in the room. ` +
      // Baseball's room came back with recognisable film and band posters on the walls and
      // titled books on the shelf. Someone else's artwork in our product photograph is a
      // licensing problem, not a styling one, and "no writing" did not cover a picture.
      `The walls carry NOTHING ELSE: no other poster, print, picture, pennant, flag or piece of ` +
      `wall art of any kind besides the framed poster described above — the rest of the wall is ` +
      `bare paint. Any books are plain and closed with blank spines, and no screen is switched on. ` +
      `The uniform and every piece of kit in the room are COMPLETELY BLANK: no club name, no ` +
      `script word across the chest, no crest, no numbers, no letters of any kind on the fabric — ` +
      `plain colour and plain trim only. ` +
      `${ONE_FRAME} ${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      ONE_FRAME_CHECK,
      `The poster's opening is completely empty and flat black, with no picture or text in it.`,
      `There is no readable word, letter or number anywhere in the picture.`,
      `No garment or piece of sports kit in the room carries any lettering, club name, crest or number.`,
      `Apart from the framed poster being described, the walls carry no other poster, print, picture or wall art, and no recognisable artwork or film, band or book title appears anywhere.`,
      `The dark rectangle is a PICTURE FRAME with a moulding around it — not a television, monitor, tablet or any kind of screen, and no television appears anywhere in the room.`,
      `The person is the same person as in the reference image (ignore any pronoun; judge only the picture).`,
      `Any sports equipment in the room belongs to ${sport.name} and to no other sport.`,
    ],
  },
  {
    name: "p-room-lead",
    ar: "1:1",
    refs: [],
    prompt:
      `A photograph of a teenager's bedroom at night: a bed with a dark blanket, a desk with a lit ` +
      `desk lamp, warm low light and deep shadow. On the wall above the desk hangs ONE framed poster ` +
      `in PORTRAIT orientation, slim black frame, square on to the camera. ` +
      `THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, even, pure BLACK rectangle, no picture, ` +
      `no pattern, no text, no glare, no reflection, edge to edge; the opening is exactly 3 units wide ` +
      `by 4 units tall. ` +
      `On the floor sit the everyday things of one sport only: ${sport.gear}. There is NO ball or ` +
      `equipment from any other sport anywhere in the room. No people. ` +
      `${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The inside of the framed poster is completely empty and flat black, with no picture or text in it.`,
      `Any sports equipment in the room belongs to ${sport.name} and to no other sport.`,
      `There is no person in the picture.`,
    ],
  },
  {
    // Slide 06, panel 2 — the REJECTED take. Generated the way identity drift actually happens:
    // the same pose brief, the same kit, but WITHOUT the identity plate as a reference. The number
    // printed under it is then MEASURED against the plate, never chosen. If it clears 0.36 it is
    // not a rejected take and must not be labelled as one.
    //
    // It must be a NEAR MISS. The first cheerleading reject came back as a different, much
    // younger child and scored -0.002, and a listing that shows that is advertising how badly
    // the pipeline can fail, not how carefully it is checked. Age, build, hair and skin tone are
    // therefore pinned; only the face is allowed to drift. Customer's call, 2026-08-27.
    name: "reject-take",
    ar: "2:3",
    refs: existsSync(`${A}/_kit.png`) ? [png(`${A}/_kit.png`)] : [],
    prompt:
      `A full-length studio photograph of a ${athlete.ageYears}-year-old ${sport.name.toLowerCase()} ` +
      `athlete, shot against a plain mid-grey seamless backdrop with soft even light and a soft ` +
      `shadow at the feet. ` +
      `THIS IS A NEAR MISS, NOT A DIFFERENT PERSON. It must look like a competent photograph of ` +
      `the SAME KIND of athlete: ${athlete.ageYears} years old and no younger, ${athlete.skinTone}, ` +
      `build is ${athlete.build}. The FACE and the HAIRSTYLE are someone else's — a teammate of ` +
      `the same age and the same build, not a stranger from another sport and certainly not a ` +
      `child. Age, body and skin tone are fixed; the face is not. ` +
      `They wear the kit shown in the reference image, applied unchanged: same colours, same ` +
      `number, same shape. Caught mid-stride, ${sport.backPose}. ` +
      `The face is fully visible and sharp, turned toward the camera. ` +
      `Portrait 2:3, the whole body in frame with headroom above and floor below. ${NO_MARKS}`,
    checks: [
      `One athlete stands full-length against a plain grey studio backdrop.`,
      `The face is visible and sharp.`,
      `The kit matches the reference kit in colour and number.`,
      `The athlete looks about ${athlete.ageYears} years old — NOT a young child.`,
      `The build matches the description: ${athlete.build}.`,
    ],
  },
  {
    // Slide 03 base plate. The card is GENERATED BLANK and composited afterwards with
    // lib/card_in_hand.py — see that file for why. Never ask the model to draw the type.
    name: "athlete-holds-blank",
    ar: "1:1",
    refs: existsSync(`${A}/_identity.png`) ? [png(`${A}/_identity.png`)] : [],
    prompt:
      `A photograph of the teenager from the reference image, holding up a COMPLETELY BLANK CARD. ` +
      `It is the SAME PERSON as the reference: ${athlete.skinTone}; hair is ${athlete.hair}; face ` +
      `is ${athlete.face}; build is ${athlete.build}. Do not restyle the hair and do not change ` +
      `the face — a close crop is not permission to invent a different person. ` +
      `TAKE ONLY THE PERSON FROM THE REFERENCE, NOT THE CLOTHES: they are wearing ${reveal.outfit}, ` +
      `not the plain grey t-shirt of the reference photograph. ` +
      `THE SCENE: ${reveal.place}. ${reveal.beat}. ` +
      `They hold the card clear of their body and clear of any dark surface, so that its whole ` +
      `outline falls against a LIGHTER background and the card is unmistakably the darkest ` +
      `thing in the picture. ` +
      `The card is a flat MATTE PURE BLACK rectangle with SHARP SQUARE corners — the corners are true right angles, NOT rounded — black card stock, the ` +
      `deepest black in the whole picture, with no sheen and no reflection — held UPRIGHT IN PORTRAIT ` +
      `ORIENTATION — clearly TALLER THAN IT IS WIDE, about half again as tall as it is wide — and ` +
      `square on to the camera. ` +
      `IT IS A TRADING CARD AND MUST BE TRADING-CARD SIZED: about 6.5 cm wide and 9 cm tall, which ` +
      `is roughly as wide as THREE of their fingers laid side by side, and no taller than the ` +
      `distance from their chin to the top of their forehead. It is SMALL in their hand — a hand ` +
      `can cover it. Do NOT draw a tablet, a clipboard, a sign or a framed picture. ` +
      HOLD +
      `THERE IS ABSOLUTELY NOTHING ON IT: no ` +
      `picture, no pattern, no photograph, no text, no number, no logo, no gloss, no reflection — one ` +
      `even flat BLACK surface, edge to edge, with all four corners and all four straight edges clearly ` +
      `visible against the background. Nothing else in the picture may be as dark as the card. ` +
      `NO NAME AND NO BORDER: there is no name, no lettering and no writing anywhere on this card, ` +
      `and no printed frame, outline, keyline, dashed line, tick or corner mark around its edge. ` +
      `The artwork is added afterwards, so the card in THIS photograph is bare stock. ` +
      // The line that used to stand here explained WHY the thumb stays low by saying the athlete's
      // name "is printed across the lower third". It was written as a reason and read as an
      // instruction: the model printed a name — ANNE, in 40 px letters — across the plate of the
      // volleyball take, and a dashed keyline around it for good measure. Never describe what the
      // finished card carries inside a prompt for the blank one.
      `The card is tucked into the hand rather than floating in front of it, and nothing covers the ` +
      `middle of the card. The hand is ordinary: five fingers, correctly jointed. ` +
      `${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The person in the photograph is the same person as in the reference image: same face, same hair, same build.`,
      `The card is completely blank — one flat matte BLACK surface with nothing printed or drawn on it.`,
      `The card is in portrait orientation: clearly taller than it is wide.`,
      `The card is trading-card sized in their hand — roughly three finger-widths across, not the size of a tablet or a sign.`,
      `Nothing is printed on the card: no name, no lettering, and no border, keyline or dashed frame around its edge.`,
      `The hand has five correctly jointed fingers and looks anatomically normal.`,
      `The athlete is wearing everyday clothes rather than sports kit.`,
    ],
  },
  {
    // Slide 01 background, dusk variant. The Fire & Smoke / Stadium Night finishes are dark and
    // lit from below; a daylight field fights them. Generated as a CHOICE, not a replacement —
    // the strongest of the three is the one that ships.
    name: "hero-bg-dusk",
    ar: "1:1",
    refs: [],
    prompt:
      `A photograph taken from the sideline of ${sport.place} at dusk, the floodlights already on and ` +
      `flaring softly. ${sport.markings}. The only goal furniture visible anywhere is this: ${sport.props} ` +
      `Nothing from any other sport appears — no soccer goal, no netted goal frame of any kind, no hoop. ` +
      `Two or three players in plain, unbranded ${athlete.colorName} kit stand in the MIDDLE DISTANCE, ` +
      `clearly OUT OF FOCUS, no face readable. Deep blue evening sky above, warm light pooling on the ` +
      `grass. The centre and lower-right of the picture stay dark, calm and uncluttered. ` +
      `${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The picture shows ${sport.place} and nothing from a different sport.`,
      `No face in the picture is sharp or identifiable.`,
      `There is no advertising board, banner, sign or brand wordmark with readable text (the playing surface's own painted markings do not count).`,
      `The middle and lower-right of the frame are visually calm, without a busy subject in them.`,
    ],
  },
  {
    // Slide 01 background, night variant — the closest match to the dark finishes.
    name: "hero-bg-night",
    ar: "1:1",
    refs: [],
    prompt:
      `A photograph taken at a night game at ${sport.place}: the floodlights are the only light, the sky ` +
      `is black, and a bank of blurred crowd fills the upper background. ${sport.markings}. ` +
      `The only goal furniture visible anywhere is this: ${sport.props} Nothing from any other sport ` +
      `appears — no soccer goal, no netted goal frame of any kind, no hoop. ` +
      `One player in plain, unbranded ${athlete.colorName} kit walks away from the camera on the far side ` +
      `of the frame, clearly OUT OF FOCUS, face not readable. Light haze in the beams. The centre and ` +
      `lower-right of the picture stay dark, calm and uncluttered. ` +
      `${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The picture shows ${sport.place} at night under floodlights and nothing from a different sport.`,
      `No face in the picture is sharp or identifiable.`,
      `There is no advertising board, banner, sign or brand wordmark with readable text (the playing surface's own painted markings do not count).`,
      `The middle and lower-right of the frame are visually calm, without a busy subject in them.`,
    ],
  },
  {
    // Slide 03 — "the kid on the card". It must be THE SAME PERSON who is printed on the card,
    // in a place that belongs to their sport. Two references: the face, and the product.
    name: "athlete-holds-card",
    ar: "1:1",
    refs: existsSync(`${A}/_identity.png`) && existsSync(cardFront)
      ? [png(`${A}/_identity.png`), png(cardFront)]
      : [],
    prompt:
      `A photograph of the teenager from the FIRST reference image — same face, same skin tone, same hair, ` +
      `same heavy build — holding up the trading card from the SECOND reference image and smiling at the ` +
      `camera. He wears ordinary everyday clothes, NOT kit. He is sitting on a bench just off ` +
      `${sport.place}, the blurred playing surface and equipment behind him in the late afternoon. ` +
      `The card is held up beside his face, face on to the camera, pinched at its bottom edge so no ` +
      `finger crosses the artwork and all four corners are visible. ` +
      `The card must be reproduced EXACTLY as in the second reference — same artwork, same layout, same ` +
      `colours, same text, same proportions. Do not redesign it and do not change one word on it. ` +
      `His hand is ordinary and unretouched: five fingers, correctly jointed. ` +
      `${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The person in the photograph is the same person as in the first reference image: same face, same hair, same build.`,
      `The card he holds matches the second reference card: same artwork, same layout, same colours.`,
      `The whole card front is readable and all four of its corners are visible.`,
      `The hand has five correctly jointed fingers and looks anatomically normal.`,
      `The athlete is wearing everyday clothes rather than sports kit.`,
    ],
  },
  {
    // Slide 01 background. The cards and the athlete cutout sit ON TOP of this in Figma, so
    // the middle of the frame must stay quiet and the interest must live at the edges.
    name: "hero-bg",
    ar: "1:1",
    refs: [],
    prompt:
      `A photograph taken from the sideline of ${sport.place}. ${sport.markings}. ` +
      `The only goal furniture visible anywhere is this: ${sport.props} Nothing from any other sport ` +
      `appears in the picture — no soccer goal, no netted goal frame of any kind, no hoop, no backstop. ` +
      `Two or three players in plain, unbranded ${athlete.colorName} and white kit are somewhere in the ` +
      `MIDDLE DISTANCE and clearly OUT OF FOCUS — no face is readable. The lower half of the frame is ` +
      `mostly open playing surface. Ordinary daylight, late afternoon, long shadows. ` +
      `The centre and lower-right of the picture must stay visually calm and uncluttered. ` +
      `${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The picture shows ${sport.place} and nothing from a different sport.`,
      `No face in the picture is sharp or identifiable.`,
      `There is no advertising board, banner, sign or brand wordmark with readable text (the playing surface's own painted markings do not count).`,
      `There is no real league mark and no brand device on any clothing or equipment.`,
    ],
  },
  {
    // Slide 03. The card must be reproduced exactly — it is a real product shot, not a redesign.
    name: "card-in-hand",
    ar: "1:1",
    refs: existsSync(cardFront) ? [png(cardFront)] : [],
    prompt:
      `A photograph: one teenager's hand holds the trading card shown in the reference image, face on ` +
      `to the camera, so the whole card front is readable and unobstructed. The card is pinched at its ` +
      `BOTTOM EDGE ONLY, between the thumb in front and two fingertips behind, the way someone holds a ` +
      `photograph they do not want to smudge. NO finger crosses the artwork and no finger appears over ` +
      `the top or the sides of the card; all four card corners are visible. The rest of the hand is ` +
      `relaxed and below the card. Held at the edge of ` +
      `${sport.place}, with the blurred playing surface behind. ` +
      `The card must be reproduced EXACTLY as in the reference — same artwork, same layout, same ` +
      `colours, same text, same proportions. Do not redesign it, do not add or remove anything on it. ` +
      `The hand is ordinary and unretouched: five fingers, correctly jointed, in a pose a real hand can hold. ` +
      `Shallow depth of field: the card sharp, the background soft. ${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The card in the photograph matches the reference card: same artwork, same layout, same colours.`,
      `The whole card front is visible and not covered by fingers.`,
      `The hand has five separated fingers and looks anatomically normal.`,
      `There is no text overlay or watermark added on top of the photograph.`,
    ],
  },
  {
    name: "bad-blurred",
    ar: "1:1",
    refs: [],
    prompt:
      `A RUINED amateur phone snapshot. THE ENTIRE PICTURE IS OUT OF FOCUS AND SMEARED — every part of ` +
      `it, foreground and background alike, is a soft blur with long horizontal motion streaks, as if the ` +
      `phone was swung while the shutter was open. Nothing in the frame is sharp. Somewhere in the smear a ` +
      `teenage ${sport.name.toLowerCase()} player in plain ${athlete.colorName} kit can just be made out as ` +
      `a shape; the face is an unreadable blur with no features at all. Taken at ${sport.place}. ` +
      `This is a genuinely failed photograph, not a stylised motion-blur effect and not a sports photo ` +
      `with a blurred background. Square 1:1. ${NO_MARKS}`,
    checks: [
      `The photograph is badly blurred and the face cannot be made out.`,
      `It looks like a real ruined phone photo rather than an artistic effect.`,
      `There is no brand wordmark or advertising text on clothing or equipment.`,
    ],
  },
  {
    name: "bad-too-far",
    ar: "1:1",
    refs: [],
    prompt:
      `A BAD amateur phone snapshot taken from far too far away: ${sport.place}, seen from high in the ` +
      `stands, with one small distant figure in kit somewhere in the middle of the frame — far too small ` +
      `for a face to be recognised. Flat, ordinary daylight. ${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The player in the frame is far too small for a face to be recognised.`,
      `The setting matches ${sport.place}.`,
      `There is no brand wordmark or advertising text on clothing or equipment.`,
    ],
  },
  {
    name: "bad-group",
    ar: "1:1",
    refs: [],
    prompt:
      `A BAD amateur phone snapshot for our purposes: a whole ${sport.name.toLowerCase()} team of about ` +
      `fifteen teenagers lined up in two rows for a posed squad photograph at ${sport.place}, all in ` +
      `plain ${athlete.colorName} shirts. Framed from the WAIST UP, so no shoes, no gloves and no ball ` +
      `appear anywhere in the picture. Every head is BARE — no helmets, no caps, no headgear of any ` +
      `kind is worn or held. The shirts are completely plain: no maker's name, no wordmark, no letters ` +
      `and no logo device. Nobody stands out; it is impossible to tell which one is yours. ` +
      `${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The photograph shows a whole team posed together, not one athlete.`,
      `The kit carries no brand device and no league mark.`,
      `There is no brand wordmark or advertising text on clothing or equipment.`,
    ],
  },
  {
    name: "bad-face-covered",
    ar: "1:1",
    refs: [],
    prompt:
      `A BAD amateur phone snapshot: a teenage ${sport.name.toLowerCase()} player photographed in a corridor ` +
      `or doorway with the face COMPLETELY HIDDEN — standing with their back to the camera, a plain dark ` +
      `hood pulled up over the head, and one forearm raised across where the face would be. Not one ` +
      `facial feature is visible from any angle. There is no helmet and no equipment in the picture at ` +
      `all. The clothing is completely plain: no wordmark, no letters, no logo device. ` +
      `${PHONE} Square 1:1. ${NO_MARKS}`,
    checks: [
      `The athlete's face is completely hidden; no facial feature is visible.`,
      `The photograph looks like an ordinary phone snapshot.`,
      `There is no brand wordmark or advertising text on clothing or equipment.`,
    ],
  },
];

const SCHEMA = {
  type: "object",
  properties: {
    verdicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          check: { type: "string" },
          pass: { type: "boolean" },
          why: { type: "string" },
        },
        required: ["check", "pass", "why"],
      },
    },
  },
  required: ["verdicts"],
} as const;

async function judge(job: Job, file: string) {
  const res = await generateJson<{ verdicts: { check: string; pass: boolean; why: string }[] }>({
    prompt:
      `You are grading ONE photograph against a list of requirements. Answer each requirement ` +
      `strictly on what the picture actually shows. Requirements:\n` +
      job.checks.map((c, i) => `${i + 1}. ${c}`).join("\n"),
    images: [png(file)],
    schema: SCHEMA as unknown as Record<string, unknown>,
    tag: `etsy-${slug}-${job.name}-judge`,
  });
  const failed = res.verdicts.filter((v) => !v.pass);
  writeFileSync(file.replace(/\.png$/, ".judge.json"), JSON.stringify(res, null, 2));
  return failed;
}

// `--only a,b,c` — building three sports at once, "one job per invocation" meant 36 process
// starts and 36 chances to mistype a slug. `--skip` is the same list, inverted.
const onlySet = only ? new Set(only.split(",").map((s) => s.trim())) : null;
const skipSet = new Set((arg("skip") ?? "").split(",").map((s) => s.trim()).filter(Boolean));
const targets = JOBS.filter((j) => (!onlySet || onlySet.has(j.name)) && !skipSet.has(j.name));

for (const job of targets) {
  const file = `${OUT}/${job.name}.png`;

  if (!flag("judge")) {
    if (existsSync(file)) {
      console.log(`= ${job.name} — already on disk, skipping (delete it to regenerate)`);
    } else {
      console.log(`> ${job.name} …`);
      // The endpoint sometimes answers a picture request with PROSE — "I have transformed your
      // request into a photograph of…" and finishReason=STOP, no image. It is transient, but an
      // uncaught throw killed a twelve-job run at job two and left the sport half-built. One
      // retry, then carry on to the next job: a missing shot is a gap to fill, not a dead run.
      let wrote = false;
      for (let attempt = 1; attempt <= 2 && !wrote; attempt++) {
        try {
          const r = await generateImage({
            prompt: job.prompt,
            refs: job.refs,
            aspectRatio: job.ar,
            imageSize: "2K",
            tag: `etsy-${slug}-${job.name}`,
          });
          writeFileSync(file, r.image);
          writeFileSync(`${OUT}/${job.name}.json`, JSON.stringify({ model: imageModel(), prompt: job.prompt }, null, 2));
          console.log(`  wrote ${file}`);
          wrote = true;
        } catch (e) {
          const msg = (e as Error).message.split("\n")[0].slice(0, 140);
          console.log(`  ! attempt ${attempt} failed: ${msg}`);
        }
      }
      if (!wrote) { console.log(`  SKIPPED ${job.name} — rerun this one sport/job later`); continue; }
    }
  }

  if (!existsSync(file)) continue;
  const failed = await judge(job, file);
  if (failed.length === 0) console.log(`  judge: PASS`);
  else {
    console.log(`  judge: ${failed.length} FAILED`);
    for (const f of failed) console.log(`    x ${f.check}\n      ${f.why}`);
  }
}
