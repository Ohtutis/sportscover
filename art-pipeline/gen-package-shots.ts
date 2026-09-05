#!/usr/bin/env tsx
/**
 * The four "what you actually get" photographs for slide 02 (CHOOSE YOUR PACKAGE).
 *
 *   npx tsx art-pipeline/gen-package-shots.ts [--only pkg-12]
 *
 * WHY THESE ARE GENERATED WITH BLANK BLACK PLATES. Same reason as the card-in-hand shot
 * (README §50-51): a model asked to draw our card draws the picture well and the TYPE badly.
 * So every surface the buyer is meant to read — the top card of a stack, the front panel of the
 * sealed pack, a phone screen — is generated as a flat MATTE BLACK rectangle and the real export
 * is warped into it afterwards. The plate is what tells the compositor where the object is.
 *
 * And it is why we do NOT use the supplier's own product photograph of the foil pack: it is
 * their photograph, not ours, and a listing image has to be ours outright.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { generateImage, loadEnv, type RefImage, imageModel } from "./lib/gemini.js";
loadEnv();

const OUT = "art-pipeline/out/etsy-shots/packages";
mkdirSync(OUT, { recursive: true });
const arg = (n: string) => {
  const i = process.argv.indexOf(`--${n}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const only = arg("only");

/** Every one of these shots lives or dies on the plate being the darkest thing in frame. */
const PLATE =
  `Every card is a flat MATTE PURE BLACK rectangle — blank black card stock, the deepest black in ` +
  `the whole picture, no sheen, no reflection, NOTHING printed on it: no picture, no pattern, no ` +
  `text, no number, no logo, no border, no keyline. ` +
  // The model rounds card corners however firmly the prompt says square — it has done it on the
  // blank plate, on the pack panel and here. Naming the CUT rather than the shape is what finally
  // lands it: a guillotined sheet has no radius to imagine.
  `THE CORNERS ARE CUT SQUARE: every corner is a sharp 90-degree right angle, like paper cut with ` +
  `a guillotine — absolutely NOT rounded, NOT a credit-card radius, no curve of any kind at any ` +
  `corner of any card. Nothing else in the photograph may be as dark as the cards. `;
const SHOT =
  `Shot on a phone from directly above, natural window light, no studio lighting, no flash, no ` +
  `text overlay, no watermark, no logo anywhere. Square 1:1.`;

// LAZY on purpose. The JOBS array is built when the module loads, so an eager readFileSync here
// makes the whole file fail to parse the moment ONE referenced image is missing — including the
// image the job you are about to run is supposed to write. Same fix as gen-etsy-shots.ts.
const png = (p: string): RefImage =>
  ({ get data() { return readFileSync(p); }, mime: "image/png" } as RefImage);

/**
 * APPLYING OUR DESIGN BY REFERENCE, not by warping it in.
 *
 * The perspective warp gets the geometry exactly right and still reads as a sticker: it cannot
 * bend the print around a pillow pouch or pick up the foil's own sheen. Handing the model the
 * mockup as one reference and the finished artwork as another — "put the design from image 2 onto
 * the object in image 1, change nothing else" — produced a pack that looks photographed, with our
 * type intact, because the type arrives as PIXELS and is never described in words.
 *
 * The rule from README §50 still holds: never ASK a model to draw our type. Showing it is fine.
 */
const APPLY =
  `Take image 1 exactly as it is — same camera, same crop, same scale, same hand, same lighting, ` +
  `same background, same shadows — and change ONE thing: print the artwork from image 2 onto the ` +
  `product. The artwork must be reproduced EXACTLY as in image 2: same layout, same wording, same ` +
  `letters, same colours, nothing added, nothing removed, nothing redrawn or re-spelled. It wraps ` +
  `onto the surface and follows its curves, creases and highlights so it looks printed on, not ` +
  `pasted. No text anywhere except what image 2 already contains. No watermark, no logo of any ` +
  `other kind. Square 1:1.`;

const JOBS: { name: string; prompt: string; ar: string; refs?: RefImage[] }[] = [
  {
    // The empty surface every tile is composited onto, so four tiles read as one sitting.
    name: "pkg-table", ar: "1:1",
    prompt:
      `A photograph of an EMPTY pale oak table top, nothing on it at all, seen from directly ` +
      `above, filling the whole frame. Soft natural window light from the left, gentle shadow ` +
      `gradient toward the lower right, fine visible wood grain. No objects, no text, no ` +
      `watermark. Square 1:1.`,
  },
  {
    // 2026-09-03 · the poster listing's "what arrives" tile. Printful ships posters ROLLED in a
    // mailing tube; the certificate rides in the same tube. Both the poster and the certificate
    // are generated as BLANK sheets (matte black / plain white) and the real art is warped on
    // afterwards — the card-in-hand rule: never ask the model to draw our type.
    name: "pkg-tube", ar: "1:1",
    prompt:
      `A photograph on a pale oak table top, seen from above at a slight angle, soft natural ` +
      `window light from the left. A plain brown KRAFT CARDBOARD MAILING TUBE with white plastic ` +
      `end caps lies diagonally across the table, one cap off beside it. A large sheet of thick ` +
      `MATTE PAPER is drawn halfway out of the tube and lies partly unrolled on the table, its ` +
      `visible face a completely EMPTY FLAT MATTE PURE BLACK RECTANGLE with sharp square corners, ` +
      `the near end still curling from the roll. Next to it, flat on the table, a single plain ` +
      `WHITE A4 SHEET, completely blank. Nothing printed on anything, no text, no logo, no ` +
      `watermark, no label on the tube. Real photograph, shallow depth of field, fine wood grain. ` +
      `Square 1:1.`,
  },
  {
    name: "pkg-digital", ar: "1:1",
    prompt:
      `A photograph of an OPEN laptop standing on a pale oak desk, seen straight on from the ` +
      `front and very slightly above, the whole laptop inside the frame with room around it. ` +
      `The screen shows a document reader: a pale grey application window filling the screen, ` +
      `and inside it TWO flat MATTE PURE BLACK PORTRAIT RECTANGLES side by side, the same size, ` +
      `a clear grey gap between them and grey margin all around, each clearly taller than wide. ` +
      // Flat on the desk the screen is foreshortened into a wide strip, and a card warped into
      // it comes out as a banner. Propped upright it faces the camera and stays card-shaped.
      `A smartphone STANDS UPRIGHT on the desk beside the laptop, propped in a small stand and ` +
      `facing the camera square on, fully inside the frame, showing ONE flat MATTE PURE BLACK ` +
      `PORTRAIT RECTANGLE filling its screen. ` +
      `Every black rectangle is completely empty — no icons, no text, no status bar — and they ` +
      `are the darkest things in the picture. ` + SHOT,
  },
  {
    // Poster listing's digital tile: ONE page in the reader (a poster is one file, not a spread),
    // on a desktop monitor rather than the card listing's laptop, so the two listings do not share a scene.
    name: "pkg-digital-poster", ar: "1:1",
    prompt:
      `A photograph of a large 27-inch desktop computer monitor on a slim stand, no logos, standing ` +
      `on a pale oak desk against a plain white wall, seen straight on from the front and very ` +
      `slightly above, the whole monitor inside the frame with room around it. The screen shows a ` +
      `document reader: a pale grey application window filling the screen, and inside it ONE flat ` +
      `MATTE PURE BLACK PORTRAIT RECTANGLE centred, clearly taller than wide (three units wide to ` +
      `four tall), with an even grey margin all around it. ` +
      `A smartphone STANDS UPRIGHT on the desk to the right of the monitor, propped in a small ` +
      `stand and facing the camera square on, fully inside the frame, showing ONE flat MATTE PURE ` +
      `BLACK PORTRAIT RECTANGLE filling its screen. A small potted plant on the left, a closed ` +
      `notebook and a pencil on the desk, soft daylight from a window at the left. ` +
      `Every black rectangle is completely empty — no icons, no text, no status bar — and they ` +
      `are the darkest things in the picture. ` + SHOT,
  },
  {
    // Poster listing size tiles (owner, 2026-09-03): the size must read at a glance from the FURNITURE,
    // not from a person — S above a desk, M above a bed, L above a sofa. Flat black rectangle = warp target.
    name: "room-18x24", ar: "1:1",
    prompt:
      `A photograph of a minimalist room seen straight on at eye level, plain light wall, soft daylight from ` +
      `one side, no people, no text, no logos, no framed pictures other than the one described. ` +
      `A small oak writing desk, 30 inches tall and 40 inches wide, with a closed laptop and a small plant, ` +
      `against a plain white wall. Hung on the wall above the desk, centred, ONE flat MATTE PURE BLACK ` +
      `PORTRAIT RECTANGLE — an unframed 18 by 24 inch poster, flush to the wall, three units wide to four ` +
      `tall, its centre about 58 inches above the floor, clearly narrower than the desk. The whole desk ` +
      `and the poster are inside the frame with wall around them. The black rectangle is completely empty ` +
      `and the darkest thing in the picture. Square 1:1.`,
  },
  {
    name: "room-24x36", ar: "1:1",
    prompt:
      `A photograph of a minimalist room seen straight on at eye level, plain light wall, soft daylight from ` +
      `one side, no people, no text, no logos, no framed pictures other than the one described. ` +
      `A queen bed with a low oak headboard 60 inches wide, white linen and two pillows, against a plain ` +
      `warm-white wall, a small nightstand with a lamp on one side. Hung on the wall above the headboard, ` +
      `centred, ONE flat MATTE PURE BLACK PORTRAIT RECTANGLE — an unframed 24 by 36 inch poster, flush to ` +
      `the wall, two units wide to three tall, its bottom edge a hand above the headboard, about half as ` +
      `wide as the bed. The whole bed and the poster are inside the frame. The black rectangle is ` +
      `completely empty and the darkest thing in the picture. Square 1:1.`,
  },
  {
    name: "room-30x40", ar: "1:1",
    prompt:
      `A photograph of a minimalist room seen straight on at eye level, plain light wall, soft daylight from ` +
      `one side, no people, no text, no logos, no framed pictures other than the one described. ` +
      `A three-seat linen sofa 84 inches wide against a plain grey-white wall, a floor lamp beside it, a ` +
      `small side table. Hung on the wall above the sofa, centred, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE — an unframed 30 by 40 inch poster, flush to the wall, three units wide to four tall, its ` +
      `bottom edge a hand above the sofa back, a little wider than a third of the sofa. The whole sofa and ` +
      `the poster are inside the frame. The black rectangle is completely empty and the darkest thing in ` +
      `the picture. Square 1:1.`,
  },
  {
    // EV "THE PRINT, ROLLED": the packaging itself — no artwork, so nothing to warp and nothing to bend.
    name: "pkg-tube-rolled", ar: "1:1",
    prompt:
      `A photograph of a plain kraft cardboard mailing tube lying diagonally on a pale oak table, seen ` +
      `from above at a slight angle. One white plastic end cap is off and rests beside the tube. A poster ` +
      `is rolled tight and half slid out of the open end: thick white matte paper, plain white on its ` +
      `outer face, no artwork visible, the roll's spiral edge visible at the end. Nothing else on the ` +
      `table. Soft window light, no studio lighting, no text, no logo, no label on the tube. Square 1:1.`,
  },
  {
    // Six interiors, one per finish — the style-pair slides show the print in a room that suits it.
    // Each carries the same black placeholder; hang_poster.py wipes it and places the art by measurement.
    name: "int-SN", ar: "1:1",
    prompt:
      `A teenager's bedroom corner at dusk: deep navy wall, a low oak bed with white linen at the ` +
      `left edge, a black metal floor lamp throwing warm light up the wall, a pair of trainers by the bed. ` +
      `Photographed straight on at eye level from across the room, no people, no text, no logos, ` +
      `no other framed pictures. Hung flat on the wall, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE, three units wide to four tall, unframed, its centre about 58 inches above the ` +
      `floor. The black rectangle is completely empty and the darkest thing in the picture. ` +
      `Natural light, photographic, no illustration. Square 1:1.`,
  },
  {
    name: "int-CA", ar: "1:1",
    prompt:
      `A modern living room: smooth pale grey plaster wall, a long low charcoal sofa, a slim chrome ` +
      `side table with a glass of water, a tall monstera plant, bright even daylight. ` +
      `Photographed straight on at eye level from across the room, no people, no text, no logos, ` +
      `no other framed pictures. Hung flat on the wall, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE, three units wide to four tall, unframed, its centre about 58 inches above the ` +
      `floor. The black rectangle is completely empty and the darkest thing in the picture. ` +
      `Natural light, photographic, no illustration. Square 1:1.`,
  },
  {
    name: "int-FS", ar: "1:1",
    prompt:
      `A converted garage home gym: dark red brick wall, a black weight bench with two dumbbells on ` +
      `the rubber floor, a coiled skipping rope on a hook, low warm light from one window. ` +
      `Photographed straight on at eye level from across the room, no people, no text, no logos, ` +
      `no other framed pictures. Hung flat on the wall, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE, three units wide to four tall, unframed, its centre about 58 inches above the ` +
      `floor. The black rectangle is completely empty and the darkest thing in the picture. ` +
      `Natural light, photographic, no illustration. Square 1:1.`,
  },
  {
    name: "int-HE", ar: "1:1",
    prompt:
      `A study with warm character: forest green painted wall with white wainscot panelling below, ` +
      `a walnut desk with a brass lamp and a stack of books, a leather chair, late afternoon light. ` +
      `Photographed straight on at eye level from across the room, no people, no text, no logos, ` +
      `no other framed pictures. Hung flat on the wall, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE, three units wide to four tall, unframed, its centre about 58 inches above the ` +
      `floor. The black rectangle is completely empty and the darkest thing in the picture. ` +
      `Natural light, photographic, no illustration. Square 1:1.`,
  },
  {
    name: "int-SS", ar: "1:1",
    prompt:
      `A calm reading nook: warm off-white wall, pale oak open shelving at the right with books and ` +
      `a small trophy, a linen armchair, a jute rug, soft window light from the left. ` +
      `Photographed straight on at eye level from across the room, no people, no text, no logos, ` +
      `no other framed pictures. Hung flat on the wall, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE, three units wide to four tall, unframed, its centre about 58 inches above the ` +
      `floor. The black rectangle is completely empty and the darkest thing in the picture. ` +
      `Natural light, photographic, no illustration. Square 1:1.`,
  },
  {
    name: "int-PR", ar: "1:1",
    prompt:
      `A game room at night: dark charcoal wall, a black desk with a keyboard and a monitor switched ` +
      `off, a cool blue LED strip glowing along the skirting board, a beanbag on the dark floor. ` +
      `Photographed straight on at eye level from across the room, no people, no text, no logos, ` +
      `no other framed pictures. Hung flat on the wall, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE, three units wide to four tall, unframed, its centre about 58 inches above the ` +
      `floor. The black rectangle is completely empty and the darkest thing in the picture. ` +
      `Natural light, photographic, no illustration. Square 1:1.`,
  },
  {
    // A ruler frame for the listing's scale sheet only — NOT part of the athlete's approved set.
    // Cheerleading's from-behind frame is a celebration (no back number, so the sport's own moment
    // is right for the card), but arms overhead do not fit above the poster baseline at true scale,
    // and a cropped arm reads as a defect. So: the same athlete, standing still, arms down.
    name: "ruler-cheer", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/cheerleading/_identity-back.png"),
           png("art-pipeline/out/athletes/cheerleading/_kit.png")],
    prompt:
      `A studio photograph of the SAME person as image 1, seen strictly FROM BEHIND, standing still ` +
      `and upright with both arms relaxed straight down at her sides, feet together, weight even. ` +
      `She wears exactly the uniform in image 2 — same colours, same trim, same skirt, same bow, ` +
      `nothing added and nothing invented. Her whole body is inside the frame from the top of the ` +
      `bow to below the shoes, centred, with clear space above and below. Plain light grey seamless ` +
      `studio backdrop, even soft light, a soft contact shadow at her feet. No text, no logos other ` +
      `than what image 2 already shows. Square 1:1.`,
  },
  {
    // Slide 05 "their season, their wall": the athlete at home with their own poster behind them.
    // A room with nobody in it says nothing; the person is what makes it a photograph of a life.
    name: "life-basketball", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — this is a ` +
      `candid photograph of them at home, NOT a studio portrait and NOT a poster. They wear ordinary ` +
      `everyday clothes, not a sports uniform. ` +
      `A bedroom: the athlete sits on the edge of the bed lacing a trainer, elbows on knees, looking down at the shoe. A hoodie on the chair, a rug, a glass of water on the nightstand. ` +
      `On the wall behind them, hung flat and fully visible, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE the size of a real poster — about a third of the wall's width, no wider than the ` +
      `person's shoulders are broad twice over — three units wide to four tall, unframed, nothing printed on it — it is completely ` +
      `empty and the darkest thing in the picture, and no part of it is hidden by the person or the ` +
      `furniture. ` +
      `Warm natural light from a window, shot on a phone at eye level, shallow depth of field on the ` +
      `person, the wall behind in focus. No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // Slide 05 "their season, their wall": the athlete at home with their own poster behind them.
    // A room with nobody in it says nothing; the person is what makes it a photograph of a life.
    name: "life-football", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/football/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — this is a ` +
      `candid photograph of them at home, NOT a studio portrait and NOT a poster. They wear ordinary ` +
      `everyday clothes, not a sports uniform. ` +
      `A kitchen: the athlete stands at the counter eating cereal from a bowl, one hand on the worktop. A backpack slumped by the stool, morning light. ` +
      `On the wall behind them, hung flat and fully visible, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE the size of a real poster — about a third of the wall's width, no wider than the ` +
      `person's shoulders are broad twice over — three units wide to four tall, unframed, nothing printed on it — it is completely ` +
      `empty and the darkest thing in the picture, and no part of it is hidden by the person or the ` +
      `furniture. ` +
      `Warm natural light from a window, shot on a phone at eye level, shallow depth of field on the ` +
      `person, the wall behind in focus. No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // Slide 05 "their season, their wall": the athlete at home with their own poster behind them.
    // A room with nobody in it says nothing; the person is what makes it a photograph of a life.
    name: "life-cheerleading", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/cheerleading/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — this is a ` +
      `candid photograph of them at home, NOT a studio portrait and NOT a poster. They wear ordinary ` +
      `everyday clothes, not a sports uniform. ` +
      `A bedroom: the athlete sits cross-legged on the floor with her back against the bed, a laptop open on her lap, smiling at the screen. Fairy lights along the shelf. ` +
      `On the wall behind them, hung flat and fully visible, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE the size of a real poster — about a third of the wall's width, no wider than the ` +
      `person's shoulders are broad twice over — three units wide to four tall, unframed, nothing printed on it — it is completely ` +
      `empty and the darkest thing in the picture, and no part of it is hidden by the person or the ` +
      `furniture. ` +
      `Warm natural light from a window, shot on a phone at eye level, shallow depth of field on the ` +
      `person, the wall behind in focus. No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // Slide 05 "their season, their wall": the athlete at home with their own poster behind them.
    // A room with nobody in it says nothing; the person is what makes it a photograph of a life.
    name: "life-soccer", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/soccer/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — this is a ` +
      `candid photograph of them at home, NOT a studio portrait and NOT a poster. They wear ordinary ` +
      `everyday clothes, not a sports uniform. ` +
      `A hallway at home: the athlete stands pulling a kit bag strap over one shoulder, half-turned, about to leave. Shoes by the door, coats on hooks. ` +
      `On the wall behind them, hung flat and fully visible, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE the size of a real poster — about a third of the wall's width, no wider than the ` +
      `person's shoulders are broad twice over — three units wide to four tall, unframed, nothing printed on it — it is completely ` +
      `empty and the darkest thing in the picture, and no part of it is hidden by the person or the ` +
      `furniture. ` +
      `Warm natural light from a window, shot on a phone at eye level, shallow depth of field on the ` +
      `person, the wall behind in focus. No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // Slide 05 "their season, their wall": the athlete at home with their own poster behind them.
    // A room with nobody in it says nothing; the person is what makes it a photograph of a life.
    name: "life-volleyball", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/volleyball/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — this is a ` +
      `candid photograph of them at home, NOT a studio portrait and NOT a poster. They wear ordinary ` +
      `everyday clothes, not a sports uniform. ` +
      `A bedroom desk against a plain painted wall: the athlete sits sideways doing homework, pen in hand, notebooks and a water bottle on the desk, a chair back at the edge of frame. ` +
      `On the wall behind them, hung flat and fully visible, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE the size of a real poster — about a third of the wall's width, no wider than the ` +
      `person's shoulders are broad twice over — three units wide to four tall, unframed, nothing printed on it — it is completely ` +
      `empty and the darkest thing in the picture, and no part of it is hidden by the person or the ` +
      `furniture. ` +
      `Warm natural light from a window, shot on a phone at eye level, shallow depth of field on the ` +
      `person, the wall behind in focus. No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // Slide 05 "their season, their wall": the athlete at home with their own poster behind them.
    // A room with nobody in it says nothing; the person is what makes it a photograph of a life.
    name: "life-baseball", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/baseball/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — this is a ` +
      `candid photograph of them at home, NOT a studio portrait and NOT a poster. They wear ordinary ` +
      `everyday clothes, not a sports uniform. ` +
      `A living room: the athlete sits sideways on the sofa working oil into a baseball glove with a cloth, absorbed in it. A cushion, a mug on the side table. ` +
      `On the wall behind them, hung flat and fully visible, ONE flat MATTE PURE BLACK PORTRAIT ` +
      `RECTANGLE the size of a real poster — about a third of the wall's width, no wider than the ` +
      `person's shoulders are broad twice over — three units wide to four tall, unframed, nothing printed on it — it is completely ` +
      `empty and the darkest thing in the picture, and no part of it is hidden by the person or the ` +
      `furniture. ` +
      `Warm natural light from a window, shot on a phone at eye level, shallow depth of field on the ` +
      `person, the wall behind in focus. No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // Slide 05, second take: the first one hung the print at head height and the two collided.
    name: "life2-cheerleading", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/cheerleading/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — a candid ` +
      `photograph of them at home, not a studio portrait. Ordinary everyday clothes, no sports kit. ` +
      `A bedroom: she sits on the floor at the lower left with her back against the bed, knees up, reading a paperback. The bed and a rug fill the lower half. ` +
      `COMPOSITION, and this matters more than anything else: the person sits or stands LOW and to ` +
      `ONE SIDE of the frame, head no higher than the middle of the picture. The poster hangs high on ` +
      `the OPPOSITE side, on a clear stretch of wall, with a wide gap of empty wall between the ` +
      `poster and the person — they must NOT touch or overlap anywhere, not even at the corner. ` +
      `Hung flat on that wall, ONE FRAMED PICTURE the size of a real poster — about 24 by 32 inches, ` +
      `roughly a third of the wall width. The frame is a slim matt black wooden moulding about two ` +
      `centimetres wide with a narrow white mat inside it, and it hangs level with a faint shadow ` +
      `under its lower edge. Inside the mat is ONE flat MATTE PURE BLACK PORTRAIT RECTANGLE, three ` +
      `units wide to four tall, completely empty, nothing printed on it, no part of it hidden. ` +
      `Warm natural light from a window on the same side as the person, shot on a phone at eye level. ` +
      `No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // Slide 05, second take: the first one hung the print at head height and the two collided.
    name: "life2-soccer", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/soccer/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — a candid ` +
      `photograph of them at home, not a studio portrait. Ordinary everyday clothes, no sports kit. ` +
      `A living room: he sits at the lower right on the arm of a sofa, forearms on his knees, looking down at a phone. A cushion and a low table nearby. ` +
      `COMPOSITION, and this matters more than anything else: the person sits or stands LOW and to ` +
      `ONE SIDE of the frame, head no higher than the middle of the picture. The poster hangs high on ` +
      `the OPPOSITE side, on a clear stretch of wall, with a wide gap of empty wall between the ` +
      `poster and the person — they must NOT touch or overlap anywhere, not even at the corner. ` +
      `Hung flat on that wall, ONE FRAMED PICTURE the size of a real poster — about 24 by 32 inches, ` +
      `roughly a third of the wall width. The frame is a slim matt black wooden moulding about two ` +
      `centimetres wide with a narrow white mat inside it, and it hangs level with a faint shadow ` +
      `under its lower edge. Inside the mat is ONE flat MATTE PURE BLACK PORTRAIT RECTANGLE, three ` +
      `units wide to four tall, completely empty, nothing printed on it, no part of it hidden. ` +
      `Warm natural light from a window on the same side as the person, shot on a phone at eye level. ` +
      `No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // Slide 05, second take: the first one hung the print at head height and the two collided.
    name: "life2-volleyball", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/volleyball/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — a candid ` +
      `photograph of them at home, not a studio portrait. Ordinary everyday clothes, no sports kit. ` +
      `A kitchen: she sits at the lower left at a table, both hands around a mug, looking out of frame. A fruit bowl and a jug on the table. ` +
      `COMPOSITION, and this matters more than anything else: the person sits or stands LOW and to ` +
      `ONE SIDE of the frame, head no higher than the middle of the picture. The poster hangs high on ` +
      `the OPPOSITE side, on a clear stretch of wall, with a wide gap of empty wall between the ` +
      `poster and the person — they must NOT touch or overlap anywhere, not even at the corner. ` +
      `Hung flat on that wall, ONE FRAMED PICTURE the size of a real poster — about 24 by 32 inches, ` +
      `roughly a third of the wall width. The frame is a slim matt black wooden moulding about two ` +
      `centimetres wide with a narrow white mat inside it, and it hangs level with a faint shadow ` +
      `under its lower edge. Inside the mat is ONE flat MATTE PURE BLACK PORTRAIT RECTANGLE, three ` +
      `units wide to four tall, completely empty, nothing printed on it, no part of it hidden. ` +
      `Warm natural light from a window on the same side as the person, shot on a phone at eye level. ` +
      `No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // Slide 05, second take: the first one hung the print at head height and the two collided.
    name: "life2-baseball", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/baseball/_identity.png")],
    prompt:
      `Take image 1 as the person: the SAME teenager, same face, same hair, same skin — a candid ` +
      `photograph of them at home, not a studio portrait. Ordinary everyday clothes, no sports kit. ` +
      `A bedroom: he sits at the lower right on the edge of the bed, working oil into a baseball glove with a cloth, head down. ` +
      `COMPOSITION, and this matters more than anything else: the person sits or stands LOW and to ` +
      `ONE SIDE of the frame, head no higher than the middle of the picture. The poster hangs high on ` +
      `the OPPOSITE side, on a clear stretch of wall, with a wide gap of empty wall between the ` +
      `poster and the person — they must NOT touch or overlap anywhere, not even at the corner. ` +
      `Hung flat on that wall, ONE FRAMED PICTURE the size of a real poster — about 24 by 32 inches, ` +
      `roughly a third of the wall width. The frame is a slim matt black wooden moulding about two ` +
      `centimetres wide with a narrow white mat inside it, and it hangs level with a faint shadow ` +
      `under its lower edge. Inside the mat is ONE flat MATTE PURE BLACK PORTRAIT RECTANGLE, three ` +
      `units wide to four tall, completely empty, nothing printed on it, no part of it hidden. ` +
      `Warm natural light from a window on the same side as the person, shot on a phone at eye level. ` +
      `No text, no logos, no other pictures on the wall. Square 1:1.`,
  },
  {
    // The print is PRINTED IN by the model, not pasted: a warped rectangle stays razor sharp on a
    // photograph with shallow depth of field, and that is exactly what reads as fake. Handing the
    // artwork over as pixels keeps our type intact while the room's light, softness and perspective
    // land on it. Same rule as the pack (see APPLY above).
    name: "lifeart-cheerleading", ar: "1:1",
    refs: [png("art-pipeline/out/etsy-shots/packages/life2-cheerleading.png"),
           png("etsy/listing-images/02-cheerleading-poster/src/CH-SS-poster.png")],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same room, same person, same pose, ` +
      `same furniture, same light — and change ONE thing: the empty black rectangle on the wall is ` +
      `now a printed poster showing the artwork from image 2. Reproduce that artwork EXACTLY: same ` +
      `layout, same wording, same letters, same colours, nothing redrawn, nothing re-spelled, ` +
      `nothing cropped — the whole design fills the poster. It is matte paper on a wall: the room's ` +
      `own light falls across it, it carries the same softness the wall has at that distance, and it ` +
      `sits flat with a faint shadow along its lower edge. Do not move it, do not resize it, do not ` +
      `let it touch the person. No text anywhere except what image 2 already contains. Square 1:1.`,
  },
  {
    // The print is PRINTED IN by the model, not pasted: a warped rectangle stays razor sharp on a
    // photograph with shallow depth of field, and that is exactly what reads as fake. Handing the
    // artwork over as pixels keeps our type intact while the room's light, softness and perspective
    // land on it. Same rule as the pack (see APPLY above).
    name: "lifeart-soccer", ar: "1:1",
    refs: [png("art-pipeline/out/etsy-shots/packages/life2-soccer.png"),
           png("etsy/listing-images/02-soccer-poster/src/SC-FS-poster.png")],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same room, same person, same pose, ` +
      `same furniture, same light — and change ONE thing: the empty black rectangle on the wall is ` +
      `now a printed poster showing the artwork from image 2. Reproduce that artwork EXACTLY: same ` +
      `layout, same wording, same letters, same colours, nothing redrawn, nothing re-spelled, ` +
      `nothing cropped — the whole design fills the poster. It is matte paper on a wall: the room's ` +
      `own light falls across it, it carries the same softness the wall has at that distance, and it ` +
      `sits flat with a faint shadow along its lower edge. Do not move it, do not resize it, do not ` +
      `let it touch the person. No text anywhere except what image 2 already contains. Square 1:1.`,
  },
  {
    // The print is PRINTED IN by the model, not pasted: a warped rectangle stays razor sharp on a
    // photograph with shallow depth of field, and that is exactly what reads as fake. Handing the
    // artwork over as pixels keeps our type intact while the room's light, softness and perspective
    // land on it. Same rule as the pack (see APPLY above).
    name: "lifeart-volleyball", ar: "1:1",
    refs: [png("art-pipeline/out/etsy-shots/packages/life2-volleyball.png"),
           png("etsy/listing-images/02-volleyball-poster/src/VB-PR-poster.png")],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same room, same person, same pose, ` +
      `same furniture, same light — and change ONE thing: the empty black rectangle on the wall is ` +
      `now a printed poster showing the artwork from image 2. Reproduce that artwork EXACTLY: same ` +
      `layout, same wording, same letters, same colours, nothing redrawn, nothing re-spelled, ` +
      `nothing cropped — the whole design fills the poster. It is matte paper on a wall: the room's ` +
      `own light falls across it, it carries the same softness the wall has at that distance, and it ` +
      `sits flat with a faint shadow along its lower edge. Do not move it, do not resize it, do not ` +
      `let it touch the person. No text anywhere except what image 2 already contains. Square 1:1.`,
  },
  {
    // The print is PRINTED IN by the model, not pasted: a warped rectangle stays razor sharp on a
    // photograph with shallow depth of field, and that is exactly what reads as fake. Handing the
    // artwork over as pixels keeps our type intact while the room's light, softness and perspective
    // land on it. Same rule as the pack (see APPLY above).
    name: "lifeart-baseball", ar: "1:1",
    refs: [png("art-pipeline/out/etsy-shots/packages/life2-baseball.png"),
           png("etsy/listing-images/02-baseball-poster/src/BB-CA-poster.png")],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same room, same person, same pose, ` +
      `same furniture, same light — and change ONE thing: the empty black rectangle on the wall is ` +
      `now a printed poster showing the artwork from image 2. Reproduce that artwork EXACTLY: same ` +
      `layout, same wording, same letters, same colours, nothing redrawn, nothing re-spelled, ` +
      `nothing cropped — the whole design fills the poster. It is matte paper on a wall: the room's ` +
      `own light falls across it, it carries the same softness the wall has at that distance, and it ` +
      `sits flat with a faint shadow along its lower edge. Do not move it, do not resize it, do not ` +
      `let it touch the person. No text anywhere except what image 2 already contains. Square 1:1.`,
  },
  {
    // Slide 05, fourth take. The earlier ones made the room the subject and the print an afterthought:
    // tiny frame, acres of empty wall, the person marooned in a corner. Here the FRAMED PRINT is the
    // subject and the athlete is the second read — closer camera, frame large and square to the lens.
    name: "hero05-cheerleading", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/cheerleading/_identity.png")],
    prompt:
      `An interiors photograph in her bedroom of a family home. THE SUBJECT IS A LARGE FRAMED PICTURE ON ` +
      `THE WALL: it sits in the upper two thirds of the picture, fills about half the frame width, and ` +
      `the camera is square on to that wall so the frame reads as a clean rectangle, not a skewed one. ` +
      `The frame is a slim matt black wooden moulding about three centimetres wide, NO MAT and no white ` +
      `border of any kind; it hangs level, casting a soft shadow beneath. The print inside runs EDGE TO ` +
      `EDGE and fills the whole opening, touching the inside of the moulding on all four sides. That ` +
      `print is ONE flat MATTE PURE BLACK PORTRAIT RECTANGLE — clearly TALLER THAN IT IS WIDE, three ` +
      `units across to four units high, like a sheet of A3 paper standing upright, never square and ` +
      `never landscape — perfectly rectangular, completely empty — no printing, no reflection, no ` +
      `glare, no object in front of it, nothing covering any part of it. It is the darkest thing in ` +
      `the picture. ` +
      `SECOND, smaller and softer: the SAME teenager as image 1 — same face, same hair, same skin — ` +
      `she is curled in an armchair at the far right of the frame, feet up, reading, half turned away, in ordinary everyday clothes, no sports kit, clearly below and to one side of the ` +
      `frame, never touching or overlapping it, slightly out of the sharpest focus. ` +
      `Furniture and a little life fill the lower edge — a bed corner, a lamp, a mug, a plant — so the ` +
      `wall is not empty. Warm natural light from one side, shot on a full-frame camera at eye level, ` +
      `f/2.8. No text, no logos, and NO other picture, poster or frame anywhere on any wall. Square 1:1.`,
  },
  {
    // Slide 05, fourth take. The earlier ones made the room the subject and the print an afterthought:
    // tiny frame, acres of empty wall, the person marooned in a corner. Here the FRAMED PRINT is the
    // subject and the athlete is the second read — closer camera, frame large and square to the lens.
    name: "hero05-soccer", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/soccer/_identity.png")],
    prompt:
      `An interiors photograph in the living room of a family home. THE SUBJECT IS A LARGE FRAMED PICTURE ON ` +
      `THE WALL: it sits in the upper two thirds of the picture, fills about half the frame width, and ` +
      `the camera is square on to that wall so the frame reads as a clean rectangle, not a skewed one. ` +
      `The frame is a slim matt black wooden moulding about three centimetres wide, NO MAT and no white ` +
      `border of any kind; it hangs level, casting a soft shadow beneath. The print inside runs EDGE TO ` +
      `EDGE and fills the whole opening, touching the inside of the moulding on all four sides. That ` +
      `print is ONE flat MATTE PURE BLACK PORTRAIT RECTANGLE — clearly TALLER THAN IT IS WIDE, three ` +
      `units across to four units high, like a sheet of A3 paper standing upright, never square and ` +
      `never landscape — perfectly rectangular, completely empty — no printing, no reflection, no ` +
      `glare, no object in front of it, nothing covering any part of it. It is the darkest thing in ` +
      `the picture. ` +
      `SECOND, smaller and softer: the SAME teenager as image 1 — same face, same hair, same skin — ` +
      `he is on a sofa at the far right of the frame, leaning forward over his phone, head down, in ordinary everyday clothes, no sports kit, clearly below and to one side of the ` +
      `frame, never touching or overlapping it, slightly out of the sharpest focus. ` +
      `Furniture and a little life fill the lower edge — a bed corner, a lamp, a mug, a plant — so the ` +
      `wall is not empty. Warm natural light from one side, shot on a full-frame camera at eye level, ` +
      `f/2.8. No text, no logos, and NO other picture, poster or frame anywhere on any wall. Square 1:1.`,
  },
  {
    // Slide 05, fourth take. The earlier ones made the room the subject and the print an afterthought:
    // tiny frame, acres of empty wall, the person marooned in a corner. Here the FRAMED PRINT is the
    // subject and the athlete is the second read — closer camera, frame large and square to the lens.
    name: "hero05-volleyball", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/volleyball/_identity.png")],
    prompt:
      `An interiors photograph in the kitchen of a family home. THE SUBJECT IS A LARGE FRAMED PICTURE ON ` +
      `THE WALL: it sits in the upper two thirds of the picture, fills about half the frame width, and ` +
      `the camera is square on to that wall so the frame reads as a clean rectangle, not a skewed one. ` +
      `The frame is a slim matt black wooden moulding about three centimetres wide, NO MAT and no white ` +
      `border of any kind; it hangs level, casting a soft shadow beneath. The print inside runs EDGE TO ` +
      `EDGE and fills the whole opening, touching the inside of the moulding on all four sides. That ` +
      `print is ONE flat MATTE PURE BLACK PORTRAIT RECTANGLE — clearly TALLER THAN IT IS WIDE, three ` +
      `units across to four units high, like a sheet of A3 paper standing upright, never square and ` +
      `never landscape — perfectly rectangular, completely empty — no printing, no reflection, no ` +
      `glare, no object in front of it, nothing covering any part of it. It is the darkest thing in ` +
      `the picture. ` +
      `SECOND, smaller and softer: the SAME teenager as image 1 — same face, same hair, same skin — ` +
      `she is at the far left of the frame at the table, both hands round a mug, looking away from camera, in ordinary everyday clothes, no sports kit, clearly below and to one side of the ` +
      `frame, never touching or overlapping it, slightly out of the sharpest focus. ` +
      `Furniture and a little life fill the lower edge — a bed corner, a lamp, a mug, a plant — so the ` +
      `wall is not empty. Warm natural light from one side, shot on a full-frame camera at eye level, ` +
      `f/2.8. No text, no logos, and NO other picture, poster or frame anywhere on any wall. Square 1:1.`,
  },
  {
    // Slide 05, fourth take. The earlier ones made the room the subject and the print an afterthought:
    // tiny frame, acres of empty wall, the person marooned in a corner. Here the FRAMED PRINT is the
    // subject and the athlete is the second read — closer camera, frame large and square to the lens.
    name: "hero05-baseball", ar: "1:1",
    refs: [png("art-pipeline/out/athletes/baseball/_identity.png")],
    prompt:
      `An interiors photograph in his bedroom of a family home. THE SUBJECT IS A LARGE FRAMED PICTURE ON ` +
      `THE WALL: it sits in the upper two thirds of the picture, fills about half the frame width, and ` +
      `the camera is square on to that wall so the frame reads as a clean rectangle, not a skewed one. ` +
      `The frame is a slim matt black wooden moulding about three centimetres wide, NO MAT and no white ` +
      `border of any kind; it hangs level, casting a soft shadow beneath. The print inside runs EDGE TO ` +
      `EDGE and fills the whole opening, touching the inside of the moulding on all four sides. That ` +
      `print is ONE flat MATTE PURE BLACK PORTRAIT RECTANGLE — clearly TALLER THAN IT IS WIDE, three ` +
      `units across to four units high, like a sheet of A3 paper standing upright, never square and ` +
      `never landscape — perfectly rectangular, completely empty — no printing, no reflection, no ` +
      `glare, no object in front of it, nothing covering any part of it. It is the darkest thing in ` +
      `the picture. ` +
      `SECOND, smaller and softer: the SAME teenager as image 1 — same face, same hair, same skin — ` +
      `he sits on the bed at the far right of the frame, head down, working oil into a baseball glove, in ordinary everyday clothes, no sports kit, clearly below and to one side of the ` +
      `frame, never touching or overlapping it, slightly out of the sharpest focus. ` +
      `Furniture and a little life fill the lower edge — a bed corner, a lamp, a mug, a plant — so the ` +
      `wall is not empty. Warm natural light from one side, shot on a full-frame camera at eye level, ` +
      `f/2.8. No text, no logos, and NO other picture, poster or frame anywhere on any wall. Square 1:1.`,
  },
  {
    // Complete Set hero backdrop: sport-NEUTRAL (the set is any sport), real venue, dark, quiet enough for
    // white type and cut-out athletes — the old blue bokeh read as stock art, not as our photography.
    name: "hero-bg-set", ar: "1:1",
    prompt:
      `A photograph looking out of a dark stadium players' tunnel at night toward the field: the tunnel ` +
      `walls in deep shadow either side, the far opening glowing with cool floodlight and a thin haze, ` +
      `the ground a dark wet concrete with faint reflections. No field markings, no goalposts, no hoop, ` +
      `no net, no logos, no text, no people — the sport must be unreadable. Very dark overall, cinematic, ` +
      `shallow depth of field, the light concentrated in the upper third. Square 1:1.`,
  },
  {
    name: "pkg-12", ar: "1:1",
    prompt:
      // "A pile" read as an unknown quantity. Fanned cards can be counted at a glance, which is
      // the whole job of this tile.
      `A photograph looking STRAIGHT DOWN, perfectly perpendicular, at TWELVE trading cards ` +
      `FANNED OUT across a pale oak table in one wide sweeping arc, like a dealt hand laid down ` +
      `flat. Each card overlaps the next by about half so all twelve are visible and countable, ` +
      `and the card at the near end of the fan lies COMPLETELY UNCOVERED, its whole face visible ` +
      `as a true rectangle with no perspective. The cards are face up. ` + PLATE + SHOT,
  },
  {
    name: "pkg-24", ar: "1:1",
    prompt:
      `A photograph looking STRAIGHT DOWN, perfectly perpendicular, at TWENTY-FOUR trading cards ` +
      `spread generously across a pale oak table so that they clearly look like MANY cards — two ` +
      `long overlapping rows, each card overlapping its neighbour, filling most of the frame. ` +
      `TWO cards lie COMPLETELY UNCOVERED and flat, one near the left and one near the right, ` +
      `each showing its whole face as a true rectangle with no perspective. ` + PLATE + SHOT,
  },
  {
    name: "pkg-pack", ar: "1:1",
    prompt:
      // The collector tier has to look like the most expensive thing on the row.
      `A premium product photograph of a SEALED FOIL TRADING-CARD PACK lying flat on a pale oak ` +
      `table, seen from directly above, filling much of the frame. The pack is a foil wrapper ` +
      `7 cm wide and 12.6 cm tall — nearly twice as tall as it is wide — crimped and sealed along ` +
      `the top and bottom edges only, lying flat and square on to the camera, with a soft realistic ` +
      `pillow bulge where the cards inside fill it and fine natural creases catching the light. ` +
      `Its whole FRONT PANEL is one flat MATTE PURE BLACK rectangle with NOTHING printed on it — ` +
      `no picture, no text, no logo, no pattern — and that black panel is the darkest thing in the ` +
      `picture. THREE trading cards lie fanned beside the pack. Beautiful soft directional light ` +
      `with a gentle specular sheen along the foil and a soft shadow under the pack; it should look ` +
      `expensive and collectible. ` + PLATE + SHOT,
  },
  {
    name: "pkg-pack-real", ar: "1:1",
    refs: [png("art-pipeline/out/etsy-shots/packages/supplier/qpmn-hand-pack.png"),
           png("art-pipeline/out/etsy-shots/packages/pack-front-panel.png")],
    prompt: APPLY,
  },
  {
    name: "pkg-digital-real", ar: "1:1",
    refs: [png("art-pipeline/out/etsy-shots/packages/pkg-digital.png"),
           png("etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png"),
           png("etsy/listing-images/01-basketball-card/src/BK-SN-card-BACK.png")],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same desk, same laptop, same phone, ` +
      `same light — and change ONE thing: fill the black rectangles with artwork. The LEFT black ` +
      `page on the laptop screen shows IMAGE 2. The RIGHT black page on the laptop screen shows ` +
      `IMAGE 3. The phone screen shows IMAGE 2. Reproduce all artwork EXACTLY as given: same ` +
      `layout, same wording, same letters, same colours, nothing redrawn, nothing re-spelled. Keep ` +
      `the screen reflections and the room's light on the glass. No text anywhere except what ` +
      `images 2 and 3 already contain. Square 1:1.`,
  },
  {
    name: "pkg-12-real", ar: "1:1",
    refs: [png("art-pipeline/out/etsy-shots/packages/pkg-12.png"),
           png("etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png"),
           png("etsy/listing-images/01-basketball-card/src/BK-SN-card-BACK.png")],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same fan of cards in the same ` +
      `positions, same table, same light, same shadows — and change ONE thing: PRINT the artwork ` +
      `onto the cards. The card at the near end of the fan, the one that is completely uncovered, ` +
      `carries the artwork from IMAGE 2. Every other card in the fan carries the artwork from ` +
      `IMAGE 3. Reproduce both EXACTLY as given: same layout, same wording, same letters, same ` +
      `colours, nothing redrawn, nothing re-spelled, nothing added or removed. Do not move, add ` +
      `or remove any card. No text anywhere except what images 2 and 3 already contain. Square 1:1.`,
  },
  {
    name: "pkg-24-real", ar: "1:1",
    refs: [png("art-pipeline/out/etsy-shots/packages/pkg-24.png"),
           png("etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png"),
           png("etsy/listing-images/01-basketball-card/src/BK-SN-card-BACK.png")],
    prompt:
      `Take image 1 exactly as it is — same camera, same crop, same two rows of cards in the same ` +
      `positions, same table, same light, same shadows — and change ONE thing: PRINT the artwork ` +
      `onto the cards. The two cards that lie completely uncovered carry the artwork from IMAGE 2 ` +
      `and IMAGE 3 respectively. Every other card carries the artwork from IMAGE 3. Reproduce both ` +
      `EXACTLY as given: same layout, same wording, same letters, same colours, nothing redrawn, ` +
      `nothing re-spelled, nothing added or removed. Do not move, add or remove any card. No text ` +
      `anywhere except what images 2 and 3 already contain. Square 1:1.`,
  },
];

for (const job of JOBS) {
  if (only && job.name !== only) continue;
  const out = `${OUT}/${job.name}.png`;
  if (existsSync(out)) { console.log(`= ${job.name} — on disk, skipping`); continue; }
  console.log(`> ${job.name} …`);
  const r = await generateImage({ prompt: job.prompt, refs: job.refs, aspectRatio: job.ar,
                                 tag: `pkg:${job.name}` });
  writeFileSync(out, r.image);
  writeFileSync(out.replace(".png", ".json"), JSON.stringify(
    { prompt: job.prompt, model: imageModel(), at: new Date().toISOString() }, null, 2));
  console.log(`  wrote ${out}`);
}
