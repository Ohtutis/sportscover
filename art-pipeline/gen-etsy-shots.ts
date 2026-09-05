#!/usr/bin/env tsx
/**
 * One-off: generate the listing photographs the Etsy card listing is missing.
 * ONE attempt per shot. Text is never generated — it is set by hand in Figma.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { generateImage, loadEnv, imageModel } from "./lib/gemini.js";
loadEnv();

const OUT = "art-pipeline/out/etsy-shots";
// The file is read when the JOB RUNS, not when this array is built. Two reasons: a job can
// reference an image an earlier job in this same array produces, and a dead path left by an
// old scratchpad no longer stops every other job from running.
const lazy = (p: string, mime: string) => ({ mime, get data() { return readFileSync(p); } });
const ref = (p: string) => lazy(p, "image/png");
const refJ = (p: string) => lazy(p, "image/jpeg");

const CARD = "print-sources/output/stadium-night/GDE-SN-card-FRONT-816x1110-300dpi.png";
const SP = "/private/tmp/claude-501/-Users-a-Documents-sportscover/771d86f6-bf96-4290-a64e-ddd862d45e17/scratchpad/cards";

const HAND = (surface: string) =>
  `A photograph taken on a phone: one adult hand holding the trading card shown in the reference image, ` +
  `face on to the camera so the whole card front is readable. ${surface} Natural daylight, no studio lighting, ` +
  `no flash. Shallow depth of field, the card sharp and the background softly out of focus. ` +
  `The card must be reproduced EXACTLY as in the reference — same artwork, same layout, same colours, ` +
  `same text. Do not redesign it, do not add or remove anything on the card. ` +
  `The hand is ordinary and unretouched. Square 1:1 crop. No text overlay of any kind, no watermark, no logo.`;

// `refs` may be a thunk: a job whose reference is produced by an EARLIER job in this same
// array cannot read the file when the array is built, only when the job runs.
const JOBS: {name:string; prompt:string; refs:any[]|(()=>any[]); ar:string}[] = [
  { name:"01-hand-basketball", ar:"1:1",
    refs:[ref(CARD)],
    prompt:HAND("Held over a kitchen counter with a blurred home interior behind.") },
  { name:"02-hand-baseball", ar:"1:1",
    refs:[refJ(`${SP}/card-baseball.jpg`)],
    prompt:HAND("Held outdoors at the edge of a baseball field, blurred green and dirt behind.") },
  { name:"02-hand-soccer", ar:"1:1",
    refs:[refJ(`${SP}/card-soccer.jpg`)],
    prompt:HAND("Held outdoors beside a soccer pitch, blurred grass and a goal behind.") },
  { name:"02-hand-hockey", ar:"1:1",
    refs:[refJ(`${SP}/card-ice-hockey.jpg`)],
    prompt:HAND("Held in a cold arena lobby, blurred rink boards behind.") },
  { name:"11-bad-photos", ar:"1:1",
    refs:[],
    prompt:`A 2x2 contact sheet of four BAD amateur phone snapshots of the same teenage athlete, ` +
      `thin white gutters between the four panels. Top-left: badly out of focus and motion blurred. ` +
      `Top-right: far too dark, underexposed, the face barely visible. Bottom-left: ruined by a heavy ` +
      `orange social-media filter. Bottom-right: the head cropped off at the top of the frame. ` +
      `These must look like genuinely poor phone photos taken by a parent, not stylised. ` +
      `No text, no labels, no icons, no watermark. Square 1:1.` },
  { name:"13-generic-shield", ar:"1:1",
    refs:[],
    prompt:`A single INVENTED generic sports-league emblem on a plain dark charcoal background: ` +
      `a simple shield outline with an abstract star and two crossed lines inside, flat vector look, ` +
      `muted silver-grey, no colour. It must be entirely fictional and must NOT resemble the NFL, FIFA, ` +
      `NCAA, MLB, NBA, NHL, the Olympic rings or any real sports organisation. ` +
      `No letters, no words, no numbers of any kind. Centred, square 1:1.` },
  { name:"16-phone-blank", ar:"1:1",
    refs:[],
    prompt:`A photograph: one hand holding a modern smartphone upright, the screen switched off and ` +
      `completely black and empty, next to a framed certificate lying on a wooden desk. ` +
      `Natural window light. The phone screen must be pure black with nothing on it. ` +
      `No text anywhere, no watermark, no logo. Square 1:1.` },
  { name:"01b-athlete-holds-own-card", ar:"1:1",
    refs:[refJ(`/private/tmp/claude-501/-Users-a-Documents-sportscover/771d86f6-bf96-4290-a64e-ddd862d45e17/scratchpad/bbcards/bb-stadium-night.jpg`), ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph: the teenage basketball player from the SECOND reference image is holding up the trading card ` +
      `from the FIRST reference image, showing it to the camera, grinning — genuinely pleased, a real smile, not posed. ` +
      `He is the same person as in the second reference: same face, same skin tone, same short twists, same build. ` +
      `He wears ordinary everyday clothes, not the uniform. Shot on a phone in a school corridor or at home, ` +
      `natural light, no flash, shallow depth of field. The card he holds must match the first reference EXACTLY — ` +
      `same artwork, same layout, same colours. Do not redesign the card and do not add text to it. ` +
      `Square 1:1. No text overlay, no watermark, no logo.` },
  { name:"20-hand-blank-card", ar:"1:1", refs:[],
    prompt:`A photograph taken on a phone: one adult hand holding a BLANK trading card upright, face on to the camera. ` +
      `The card face is completely EMPTY — a plain flat dark charcoal rectangle with sharp square corners, ` +
      `absolutely no printing, no artwork, no text, no logo, no border pattern of any kind. ` +
      `CRITICAL: the fingers grip only the OUTER EDGE of the card — no finger, thumb or fingertip may appear ` +
      `in front of the card face. The whole blank face must be unobstructed and fully visible. ` +
      `Held over a kitchen counter, blurred home interior behind, natural daylight, no flash, shallow depth of field. ` +
      `Square 1:1. No text overlay, no watermark.` },
  { name:"21-athlete-blank-card", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph: the teenage basketball player from the reference image holds up a BLANK trading card ` +
      `to the camera, grinning — a real, pleased smile. He is the same person as the reference: same face, ` +
      `same skin tone, same short twists, same build. He wears ordinary everyday clothes, not a uniform. ` +
      `The card face is completely EMPTY — a plain flat dark charcoal rectangle with sharp square corners, ` +
      `no printing, no artwork, no text of any kind. CRITICAL: his fingers grip only the OUTER EDGE — ` +
      `no finger in front of the card face; the whole blank face is unobstructed. ` +
      `Shot on a phone in a school corridor, natural light, shallow depth of field. Square 1:1. No text overlay.` },
  { name:"22-bad-photos", ar:"1:1", refs:[],
    prompt:`A 2x2 grid of four TERRIBLE amateur phone snapshots of the same teenage boy, thin white gutters between panels. ` +
      `Each panel must be OBVIOUSLY unusable: ` +
      `TOP-LEFT: severe motion blur, the face smeared and completely unrecognisable. ` +
      `TOP-RIGHT: drastically underexposed, almost black, the face lost in shadow. ` +
      `BOTTOM-LEFT: wrecked by a heavy orange-and-purple social filter with a face-warping effect. ` +
      `BOTTOM-RIGHT: the top of the head cut off by the frame edge and the boy tiny and far away. ` +
      `These must look genuinely BAD — the kind of photo a parent would apologise for sending. ` +
      `Not stylish, not moody, not artistic. No text, no labels, no icons, no watermark. Square 1:1.` },
  { name:"23-gift-moment", ar:"1:1", refs:[],
    prompt:`A warm candid photograph: a mother hands a BLANK trading card to her delighted teenage son at a kitchen table, ` +
      `he is reaching for it and laughing. The card face is completely EMPTY — a plain flat dark charcoal rectangle ` +
      `with SHARP SQUARE corners — the corners are true right angles, NOT rounded, no printing, no artwork, no text. Fingers grip only the card's outer edge; ` +
      `the blank face stays unobstructed and clearly visible to camera. ` +
      `Natural window light, shot on a phone, shallow depth of field, real home, slightly untidy. ` +
      `Square 1:1. No text overlay, no watermark.` },
  // --- 2026-08-25: slide 01 rebuilt. The kitchen read as stock, and the hand belonged to a
  // middle-aged adult, not to the athlete this listing is about. Blank card + real card
  // composited after (a generated card face is always invented — README §29).
  { name:"01a-hand-court", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph taken on a phone: ONE hand of the teenage basketball player from the reference image ` +
      `holds a BLANK trading card upright, face on to the camera. Same person as the reference: same skin tone, ` +
      `same age, same slim athletic build. His forearm and the short sleeve of a blue basketball jersey are visible. ` +
      `The card face is completely EMPTY — a plain flat dark charcoal rectangle with sharp square corners, ` +
      `no printing, no artwork, no text, no logo, no border pattern. ` +
      `CRITICAL: the fingers grip only the OUTER EDGE of the card — no finger, thumb or fingertip in front of the ` +
      `card face. The whole blank face is unobstructed. ` +
      `He stands on an indoor basketball court; the hoop, the painted lines and the empty bleachers are far behind ` +
      `and thrown well out of focus. Warm gym light from above, no flash, shallow depth of field, the card sharp. ` +
      `Square 1:1. No text overlay, no watermark, no logo.` },

  { name:"01b-hand-bleachers", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph taken on a phone from a low angle: the teenage basketball player from the reference image ` +
      `sits on wooden gym bleachers and holds a BLANK trading card in one hand, resting it on his knee, ` +
      `angled up to the camera so the whole face is visible. Same person as the reference: same skin tone, ` +
      `same age, same build. He wears a blue basketball jersey and shorts; a basketball rests beside him. ` +
      `The card face is completely EMPTY — a plain flat dark charcoal rectangle with sharp square corners, ` +
      `no printing, no artwork, no text of any kind. ` +
      `CRITICAL: the fingers grip only the OUTER EDGE — no finger in front of the card face. ` +
      `Late afternoon light through high gym windows, no flash, shallow depth of field, the card sharp. ` +
      `Square 1:1. No text overlay, no watermark, no logo.` },

  { name:"01c-hand-locker", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph taken on a phone: both hands of the teenage basketball player from the reference image ` +
      `hold a BLANK trading card up towards the camera, the way someone shows off something they are proud of. ` +
      `Same person as the reference: same skin tone, same age, same build. He wears a blue basketball jersey; ` +
      `a locker room with a kit bag and a bench is behind him, thrown out of focus. ` +
      `The card face is completely EMPTY — a plain flat dark charcoal rectangle with sharp square corners, ` +
      `no printing, no artwork, no text of any kind. ` +
      `CRITICAL: the fingertips touch only the OUTER EDGE of the card — nothing in front of the card face. ` +
      `Overhead strip lighting, no flash, shallow depth of field, the card sharp. ` +
      `Square 1:1. No text overlay, no watermark, no logo.` },
  // --- 2026-08-25: slide 12 needs the four SHOT TYPES the buyer must send, shown as
  // ordinary phone photos (not the studio plate — that is slide 04's job).
  // --- 2026-09-02: the four GOOD examples are deliberately NOT the listing's athlete.
  // Slides 12 and 13 sat side by side showing the same "before" photos, which read as a
  // mistake; and the two three-quarter shots both turned the SAME way because the prompt
  // said "the OTHER way" — a comparison, which the model cannot check. Direction is now
  // stated as an absolute the model can see: which EDGE OF THE FRAME the nose points at.
  // 12a carries the identity for the other three, so it is generated first, without a ref.
  { name:"12a-send-front", ar:"1:1", refs:[],
    prompt:`An ordinary phone photograph taken by a parent indoors: a white teenage boy athlete about ` +
      `sixteen years old, short mid-brown hair, head and shoulders. He is FACING THE CAMERA STRAIGHT ON ` +
      `with both eyes to the lens, relaxed neutral expression, mouth closed. He wears a plain grey ` +
      `t-shirt, not a uniform. Even daylight from a window, no flash, sharp focus on the face, plain ` +
      `uncluttered pale wall behind. No maker logos and no brand devices of any kind on the clothing. ` +
      `Square 1:1. No text, no watermark, no border.` },
  { name:"12b-send-left", ar:"1:1",
    refs:() => [ref("art-pipeline/out/etsy-shots/12a-send-front.png")],
    prompt:`An ordinary phone photograph of the SAME boy as the reference image — same face, same hair, ` +
      `same grey t-shirt, same room. Head and shoulders, three-quarter view: his head is turned so that ` +
      `HIS NOSE POINTS AT THE LEFT EDGE OF THE PHOTOGRAPH and his far ear is hidden. Eyes look off to ` +
      `the left, not at the lens. Even daylight, no flash, sharp focus on the face, plain wall behind. ` +
      `Square 1:1. No text, no watermark, no border.` },
  { name:"12c-send-right", ar:"1:1",
    refs:() => [ref("art-pipeline/out/etsy-shots/12a-send-front.png")],
    prompt:`An ordinary phone photograph of the SAME boy as the reference image — same face, same hair, ` +
      `same grey t-shirt, same room. Head and shoulders, three-quarter view: his head is turned so that ` +
      `HIS NOSE POINTS AT THE RIGHT EDGE OF THE PHOTOGRAPH and his far ear is hidden. Eyes look off to ` +
      `the right, not at the lens. Even daylight, no flash, sharp focus on the face, plain wall behind. ` +
      `Square 1:1. No text, no watermark, no border.` },
  { name:"12d-send-full", ar:"1:1",
    refs:() => [ref("art-pipeline/out/etsy-shots/12a-send-front.png")],
    prompt:`An ordinary phone photograph of the SAME boy as the reference image — same face, same hair — ` +
      `standing FULL LENGTH from the top of his head to his shoes, arms relaxed at his sides, facing the ` +
      `camera. The whole body is inside the frame with clear room above his head and below his feet. ` +
      `HE IS WEARING HIS TEAM KIT so the uniform is fully visible: a plain solid-coloured short-sleeved ` +
      `team jersey, matching shorts, team socks and trainers. No ball and no sports equipment. ` +
      `THE ONLY MARKING ANYWHERE ON THE WHOLE OUTFIT IS THE PRINTED SQUAD NUMBER ON THE CHEST. ` +
      `The jersey, the shorts, the socks and the shoes are otherwise completely plain fabric: no logo, ` +
      `no emblem, no tick, no stripe, no wordmark, no small white shape of any kind on any of them. ` +
      `Even daylight indoors, no flash, plain uncluttered wall behind. ` +
      `Square 1:1. No text, no watermark, no border.` },
  // --- 2026-08-25: slide 12 becomes a good/bad guide for the face+body reading models.
  // GOOD comes from the athlete's real before/ photos; only the BAD four are generated.
  { name:"12x-bad-blurred", ar:"1:1", refs:[],
    prompt:`An unusable amateur phone snapshot of a teenage athlete in a gym: severe motion blur across the ` +
      `whole frame, the face smeared and completely unrecognisable, camera shake obvious. ` +
      `It must look genuinely bad, not artistic or stylish. Square 1:1. No text, no border, no watermark.` },
  { name:"12x-bad-distant", ar:"1:1", refs:[],
    prompt:`An unusable amateur phone snapshot taken from the far end of a sports hall: a single teenage athlete ` +
      `is tiny and far away in the middle of a huge empty court, the face far too small to make out any features. ` +
      `Ordinary phone quality, flat light. Square 1:1. No text, no border, no watermark.` },
  { name:"12x-bad-group", ar:"1:1", refs:[],
    prompt:`An unusable amateur phone snapshot of a large team group photo: fifteen teenagers in kit standing in ` +
      `rows, all faces small and similar, impossible to tell which one is the subject. ` +
      `Ordinary phone quality, flat gym lighting. Square 1:1. No text, no border, no watermark.` },
  { name:"12x-bad-covered", ar:"1:1", refs:[],
    prompt:`An unusable amateur phone snapshot of a teenage athlete whose FACE IS HIDDEN: a hooded sweatshirt pulled ` +
      `low, sunglasses and a raised arm together cover the eyes, nose and mouth. Nothing of the face is readable. ` +
      `Ordinary phone quality. Square 1:1. No text, no border, no watermark.` },
  { name:"20-skate", ar:"1:1", refs:[],
    prompt:`A studio-lit full-length photograph of a teenage skateboarder standing and facing the camera, ` +
      `holding a skateboard upright beside him with one hand, wearing an ordinary t-shirt, shorts and skate shoes. ` +
      `Dark moody skatepark behind, thrown out of focus, with bright overhead floodlights and a little haze — ` +
      `matching a dramatic sports-portrait look. The skateboard is clearly visible. ` +
      `Square 1:1. No text, no logo, no watermark, no border.` },
  // --- 2026-08-25: the POSTER listing. Same rule as the card shots: never let the model
  // draw our artwork. Every surface that will carry a GDE file is generated EMPTY and flat
  // black, then the real file is warped in (art-pipeline/figma/etsy-s03-card-inpaint.py).
  { name:"p01-frame-blank", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph in a teenage boy's bedroom: a large FRAMED POSTER hangs on the wall in ` +
      `portrait orientation, roughly 18x24 inches, in a slim black frame with a thin white mount. ` +
      `THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, even, pure black rectangle with no ` +
      `picture, no pattern, no texture, no reflection and no glare. The frame is face on to the ` +
      `camera and the whole opening is visible and unobstructed. ` +
      `The teenage basketball player from the reference image stands beside it, turned slightly ` +
      `towards the frame, hands relaxed, wearing ordinary everyday clothes, not a uniform. He is ` +
      `the same person as the reference: same face, same skin tone, same short twists, same build. ` +
      `Warm natural window light, shot on a phone, shallow depth of field. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p03-room-blank", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of a teenage boy's bedroom: the teenage basketball player from the reference ` +
      `image sits on the edge of his bed, relaxed, looking up at the wall. He is the same person as ` +
      `the reference: same face, same skin tone, same short twists, same build, in ordinary everyday ` +
      `clothes. On the wall behind him hangs a large FRAMED POSTER in portrait orientation, slim black ` +
      `frame. THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, even, pure black rectangle, no ` +
      `picture, no pattern, no glare, no reflection. The frame is clearly visible, unobstructed, and ` +
      `close to face on. Ordinary teenage room: shelves, a desk, a basketball on the floor. ` +
      `Warm evening lamp light plus daylight from a window, shot on a phone. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p16-phone-blank", ar:"1:1", refs:[],
    prompt:`A photograph: a teenager's hand holds a modern smartphone upright, face on to the camera, ` +
      `the whole screen visible and unobstructed. THE SCREEN IS COMPLETELY EMPTY — pure flat black, ` +
      `switched off, no icons, no interface, no reflection, no glare. Behind, a blurred bedroom with ` +
      `warm light. Shot on a phone, shallow depth of field. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p16-monitor-blank", ar:"1:1", refs:[],
    prompt:`A photograph of a tidy desk: a widescreen computer monitor stands face on to the camera, ` +
      `the whole screen visible and unobstructed. THE SCREEN IS COMPLETELY EMPTY — pure flat black, ` +
      `no wallpaper, no icons, no interface, no reflection, no glare. A keyboard and a mug on the desk, ` +
      `a blurred bedroom wall behind. Daylight from a window on the left. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p-room-SN", ar:"1:1", refs:[],
    prompt:`A photograph of a teenage boy's bedroom in the evening: a pale warm-grey wall lit by a desk lamp from the right, a made bed and a basketball on the floor. On the wall hangs ONE large FRAMED POSTER in portrait ` +
      `orientation, roughly 18x24 inches, in a slim black frame with a WIDE WHITE MOUNT inside it. THE PICTURE AREA INSIDE THE MOUNT IS ` +
      `COMPLETELY EMPTY — a flat, even, pure black rectangle with no picture, no pattern, no ` +
      `texture, no reflection and no glare. The frame is close to face on to the camera, the ` +
      `whole opening visible and unobstructed, and it fills a good part of the frame. ` +
      `Interior photograph, shot on a phone, natural depth of field. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p-room-CA", ar:"1:1", refs:[],
    prompt:`A photograph of a bright modern living room: white wall, pale oak floor, a low grey sofa to one side, cool daylight from a large window. On the wall hangs ONE large FRAMED POSTER in portrait ` +
      `orientation, roughly 18x24 inches, in a slim black frame with a WIDE WHITE MOUNT inside it. THE PICTURE AREA INSIDE THE MOUNT IS ` +
      `COMPLETELY EMPTY — a flat, even, pure black rectangle with no picture, no pattern, no ` +
      `texture, no reflection and no glare. The frame is close to face on to the camera, the ` +
      `whole opening visible and unobstructed, and it fills a good part of the frame. ` +
      `Interior photograph, shot on a phone, natural depth of field. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p-room-FS", ar:"1:1", refs:[],
    prompt:`A photograph of a converted garage gym: exposed red brick wall, rubber floor, a rack of dumbbells to one side, warm hanging bulb light. On the wall hangs ONE large FRAMED POSTER in portrait ` +
      `orientation, roughly 18x24 inches, in a slim black frame with a WIDE WHITE MOUNT inside it. THE PICTURE AREA INSIDE THE MOUNT IS ` +
      `COMPLETELY EMPTY — a flat, even, pure black rectangle with no picture, no pattern, no ` +
      `texture, no reflection and no glare. The frame is close to face on to the camera, the ` +
      `whole opening visible and unobstructed, and it fills a good part of the frame. ` +
      `Interior photograph, shot on a phone, natural depth of field. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p-room-HE", ar:"1:1", refs:[],
    prompt:`A photograph of a classic study: a light sage-green wall, a leather armchair and a bookshelf to one side, warm lamplight. On the wall hangs ONE large FRAMED POSTER in portrait ` +
      `orientation, roughly 18x24 inches, in a slim black frame with a WIDE WHITE MOUNT inside it. THE PICTURE AREA INSIDE THE MOUNT IS ` +
      `COMPLETELY EMPTY — a flat, even, pure black rectangle with no picture, no pattern, no ` +
      `texture, no reflection and no glare. The frame is close to face on to the camera, the ` +
      `whole opening visible and unobstructed, and it fills a good part of the frame. ` +
      `Interior photograph, shot on a phone, natural depth of field. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p-room-SS", ar:"1:1", refs:[],
    prompt:`A photograph of a minimal white hallway: plain white wall, pale concrete floor, a single plant in a pot, soft even daylight. On the wall hangs ONE large FRAMED POSTER in portrait ` +
      `orientation, roughly 18x24 inches, in a slim black frame with a WIDE WHITE MOUNT inside it. THE PICTURE AREA INSIDE THE MOUNT IS ` +
      `COMPLETELY EMPTY — a flat, even, pure black rectangle with no picture, no pattern, no ` +
      `texture, no reflection and no glare. The frame is close to face on to the camera, the ` +
      `whole opening visible and unobstructed, and it fills a good part of the frame. ` +
      `Interior photograph, shot on a phone, natural depth of field. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p-room-PR", ar:"1:1", refs:[],
    prompt:`A photograph of a teenager's room with LED strip lighting: a pale grey wall washed with cyan and magenta light, a gaming desk with a keyboard low in the foreground. The desk is CLEAR — nothing leans against it, nothing rectangular stands on it, no screen, no monitor, no board. There is exactly ONE rectangle in the whole photograph and it is the framed poster on the wall, centred and directly facing the camera. On the wall hangs ONE large FRAMED POSTER in portrait ` +
      `orientation, roughly 18x24 inches, in a slim black frame with a WIDE WHITE MOUNT inside it. THE PICTURE AREA INSIDE THE MOUNT IS ` +
      `COMPLETELY EMPTY — a flat, even, pure black rectangle with no picture, no pattern, no ` +
      `texture, no reflection and no glare. The frame is close to face on to the camera, the ` +
      `whole opening visible and unobstructed, and it fills a good part of the frame. ` +
      `Interior photograph, shot on a phone, natural depth of field. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p01-hero-v2", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph in a teenage boy's bedroom: a large FRAMED POSTER hangs on the wall in ` +
      `portrait orientation, roughly 18x24 inches, in a slim black frame. The frame is ` +
      `SQUARE ON TO THE CAMERA, centred, the whole opening visible and unobstructed, filling ` +
      `most of the height of the picture. THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, ` +
      `even, pure black rectangle, no picture, no pattern, no glare, no reflection. ` +
      `The teenage basketball player from the reference image stands just BEHIND and to one side ` +
      `of the frame, looking at the camera, arms relaxed, in ordinary everyday clothes. He must not ` +
      `overlap the frame opening. He is the same person as the reference: same face, same skin tone, ` +
      `same short twists, same build. Warm window light, shallow depth of field, shot on a phone. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p01-hero-v3", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph in a teenage boy's bedroom: the teenage basketball player from the reference ` +
      `image stands facing the camera and HOLDS UP A LARGE FRAMED POSTER with both hands, in ` +
      `portrait orientation, slim black frame, held in front of his chest and turned SQUARE ON to ` +
      `the camera. His face, shoulders and hands are visible around it and he is grinning — a real, ` +
      `pleased smile. THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, even, pure black ` +
      `rectangle, no picture, no pattern, no glare, no reflection, and nothing overlaps the opening. ` +
      `He is the same person as the reference: same face, same skin tone, same short twists, same ` +
      `build, in ordinary everyday clothes. Warm bedroom light, a bed and shelves softly out of focus ` +
      `behind. Shot on a phone. Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p01-hero-v4", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph in a teenage boy's bedroom with a pale wall: a large FRAMED POSTER hangs on ` +
      `the wall, portrait orientation, slim black frame, SQUARE ON to the camera and filling most of ` +
      `the height of the picture. THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, even, pure ` +
      `black rectangle, no picture, no pattern, no glare, no reflection. ` +
      `The teenage basketball player from the reference image stands beside it, arms folded, LOOKING ` +
      `STRAIGHT AT THE CAMERA with a quiet proud half-smile. He must not overlap the frame opening. ` +
      `He is the same person as the reference: same face, same skin tone, same short twists, same ` +
      `build, in ordinary everyday clothes. A bed, a basketball and shelves softly out of focus. ` +
      `Warm evening light. Shot on a phone. Square 1:1. No text anywhere, no watermark, no logo.` },
  // The pitch of this frame is comparison: his poster hangs among the pros and holds its own.
  // The other posters must therefore be INVENTED — no real player, no league mark, no readable
  // wordmark — or the listing carries someone else's likeness. See README rule on league marks.
  { name:"p03-room-v2", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of a teenage boy's bedroom with a pale wall covered in basketball posters. ` +
      `The teenage player from the reference image sits on the edge of his bed looking up at the wall. ` +
      `He is the same person as the reference: same face, same skin tone, same short twists, same ` +
      `build, in ordinary everyday clothes. ` +
      `On the wall hang SIX OR SEVEN other basketball posters of ANONYMOUS, INVENTED athletes — faces ` +
      `turned away, in shadow or motion-blurred, plain unbranded kit in assorted colours. They must not ` +
      `resemble any real, famous or identifiable player, must carry NO team badge, NO league mark and ` +
      `NO readable words or numbers. They are arranged around the wall and fill it, some in thin frames, ` +
      `some taped flat. ` +
      `Among them, at the centre of the wall and clearly the LARGEST, hangs ONE big FRAMED poster in ` +
      `portrait orientation, slim black frame, close to face on to the camera. THE INSIDE OF THAT ONE ` +
      `FRAME IS COMPLETELY EMPTY — a flat, even, pure black rectangle, no picture, no pattern, no glare, ` +
      `no reflection, unobstructed. ` +
      `A basketball on the floor, shelves to one side. Warm evening light. Shot on a phone. ` +
      `Square 1:1. No text overlay, no watermark, no logo.` },
  // The other posters carry NO PEOPLE. Asking for "invented anonymous athletes" produced real
  // NBA players in real Knicks and Lakers kit — a likeness and a league mark in our own listing,
  // against our own rule. Arenas and hoops read as a poster wall and cannot infringe anyone.
  { name:"p03-wall-v3", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of a teenage boy's bedroom, pale wall. The teenage player from the reference ` +
      `image sits on the edge of his bed, seen from the side, looking up at the wall. Same person as ` +
      `the reference: same face, same skin tone, same short twists, same build, everyday clothes. ` +
      `Filling the wall are SIX small basketball posters that contain NO PEOPLE AT ALL — only empty ` +
      `arenas, a hoop and net, floodlights, a wooden court, a crowd far away and out of focus. ` +
      `No athletes, no faces, no bodies, no team badge, no league mark, no readable words or numbers. ` +
      `They are small, taped flat, arranged around the edges of the wall. ` +
      `At the CENTRE of the wall hangs ONE big FRAMED poster in portrait orientation, slim black frame, ` +
      `close to face on. It is at least TWICE the size of every other poster on the wall and is ` +
      `unmistakably themain piece. THE INSIDE OF THAT FRAME IS COMPLETELY EMPTY — a flat, even, pure ` +
      `black rectangle, no picture, no pattern, no glare, no reflection, unobstructed. ` +
      `A basketball on the floor. Warm evening light. Shot on a phone. ` +
      `Square 1:1. No text overlay, no watermark, no logo.` },
  { name:"p-room-PR2", ar:"1:1", refs:[],
    prompt:`A photograph of a dark gaming room at night: black desk with a mechanical keyboard glowing, ` +
      `a chair, RGB strip lighting running along the ceiling and behind the desk throwing hard cyan and ` +
      `magenta light across a pale grey wall. Cinematic, moody, high contrast, the light doing the work. ` +
      `On the wall hangs ONE large FRAMED POSTER in portrait orientation, roughly 18x24 inches, in a slim ` +
      `black frame with a WIDE WHITE MOUNT inside it, centred and directly facing the camera, large in ` +
      `the picture. THE PICTURE AREA INSIDE THE MOUNT IS COMPLETELY EMPTY — a flat, even, pure black ` +
      `rectangle, no picture, no pattern, no glare, no reflection. The desk is clear: no monitor, no ` +
      `screen, no second rectangle anywhere. ` +
      `Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p01-hero-v5", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of a teenage boy's bedroom wall, shot STRAIGHT ON. At the centre, dominating ` +
      `the picture, hangs ONE big FRAMED poster in portrait orientation, slim black frame, square on to ` +
      `the camera, filling most of the height. THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, ` +
      `even, pure black rectangle, no picture, no pattern, no glare, no reflection, unobstructed. ` +
      `Around it, much SMALLER, are four or five basketball posters that contain NO PEOPLE AT ALL — ` +
      `only an empty arena, a hoop and net, floodlights, a wooden court. No athletes, no faces, no ` +
      `team badge, no league mark, no readable words. The centre frame is at least twice their size. ` +
      `The teenage player from the reference image stands at the right edge of the picture, mostly ` +
      `behind the wall of posters, looking up at the big frame — seen from behind and slightly to the ` +
      `side, so his face is barely visible. Same person as the reference: same skin tone, same short ` +
      `twists, same build, everyday clothes. Warm evening light. Shot on a phone. ` +
      `Square 1:1. No text overlay, no watermark, no logo.` },
  { name:"p01-hero-v6", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of a bedroom wall painted a soft warm blue-grey. The wall is BARE except for ` +
      `ONE large FRAMED poster in portrait orientation, slim black frame, hung square on to the camera, ` +
      `centred, and filling about 70 percent of the height of the picture. Nothing else hangs anywhere ` +
      `on the wall — no other posters, no pictures, no shelves. ` +
      `THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, even, pure black rectangle, no picture, ` +
      `no pattern, no glare, no reflection, unobstructed. ` +
      `The teenage player from the reference image stands well back at the right edge of the picture, ` +
      `at a distance from the wall, seen from behind and slightly to the side, looking at the frame the ` +
      `way someone looks at a painting in a gallery. His face is barely visible. Same person as the ` +
      `reference: same skin tone, same short twists, same build, everyday clothes. ` +
      `Calm warm daylight. Shot on a phone. Square 1:1. No text anywhere, no watermark, no logo.` },
  // The customer asked for two real magazine posters of famous players beside his. Real posters
  // are someone else's artwork and real players are living people's likenesses, so this uses the
  // LOOK of a pro sports poster with athletes who cannot be identified — same comparison, no claim
  // on anyone. Faces away or in shadow, plain unbranded kit, no marks, no type.
  { name:"p03-room-v4", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of an American teenage basketball player's bedroom, pale wall, simple and tidy. ` +
      `The player from the reference image is doing something ordinary in the room — sitting on the floor ` +
      `lacing his basketball shoes, a ball beside him, not looking at the camera. Same person as the ` +
      `reference: same face, same skin tone, same short twists, same build, everyday clothes. ` +
      `On the wall behind hang exactly THREE posters in a row, all in slim black frames, evenly spaced. ` +
      `The LEFT and RIGHT ones are dramatic professional-looking basketball posters, each showing ONE ` +
      `athlete in a plain unbranded kit — one in red, one in white — lit hard against a dark arena, shot ` +
      `from BEHIND or in near silhouette so no face is visible or identifiable. They must not resemble any ` +
      `real or famous player and must carry NO team badge, NO league mark and NO words or numbers. ` +
      `The MIDDLE frame is the same size as the other two and is COMPLETELY EMPTY inside — a flat, even, ` +
      `pure black rectangle, no picture, no pattern, no glare, no reflection, unobstructed, face on. ` +
      `Warm evening light. Shot on a phone. Square 1:1. No text overlay, no watermark, no logo.` },
  { name:"p01-hero-v7", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of a bedroom wall painted a soft warm blue-grey, shot straight on. The wall is ` +
      `BARE except for ONE large FRAMED poster in portrait orientation, slim black frame, hung square on ` +
      `to the camera and placed left of centre. THE FRAME IS HUGE IN THE PICTURE: its top is near the top ` +
      `edge and its bottom is near the bottom edge, filling about 75 percent of the height of the whole ` +
      `photograph. Nothing else hangs anywhere on the wall. ` +
      `THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, even, pure black rectangle, no picture, no ` +
      `pattern, no glare, no reflection, unobstructed. ` +
      `The teenage player from the reference image stands far back at the right edge, SMALL in the frame ` +
      `and clearly at a distance from the wall, seen from behind and slightly to the side, looking up at ` +
      `the poster the way someone looks at a painting in a gallery. He wears a t-shirt, joggers and ` +
      `basketball SNEAKERS — he is not barefoot and not in shorts. Same person as the reference: same ` +
      `skin tone, same short twists, same build. ` +
      `Calm warm daylight. Shot on a phone. Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p01-hero-v8", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of a bedroom wall painted a soft warm blue-grey, shot straight on. The wall is ` +
      `BARE except for ONE large FRAMED poster in portrait orientation, slim black frame, hung square on ` +
      `to the camera and placed left of centre, its top near the top edge and its bottom near the bottom ` +
      `edge, filling about 70 percent of the height. Nothing else hangs on the wall. ` +
      `THE INSIDE OF THE FRAME IS COMPLETELY EMPTY — a flat, even, pure black rectangle, no picture, no ` +
      `pattern, no glare, no reflection, unobstructed. ` +
      `The teenage player from the reference image stands at the RIGHT, in CLEAR PROFILE facing the ` +
      `poster, close enough that his head reaches the upper third of the frame and HIS FACE IS PLAINLY ` +
      `VISIBLE from the side — chin slightly lifted, absorbed, the way someone studies a painting. ` +
      `He wears a warm sand-coloured t-shirt and dark joggers. Same person as the reference: same face, ` +
      `same skin tone, same short twists, same build. He must not overlap the frame. ` +
      `Calm warm daylight. Shot on a phone. Square 1:1. No text anywhere, no watermark, no logo.` },
  { name:"p03-room-v5", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of an American teenage basketball player's bedroom, pale wall, simple and tidy. ` +
      `The player from the reference image is doing something ordinary in the room — sitting on the floor ` +
      `lacing his basketball shoes, a ball beside him, not looking at the camera. Same person as the ` +
      `reference: same face, same skin tone, same short twists, same build, everyday clothes. ` +
      `On the wall behind hang exactly THREE posters in a row, all in slim black frames, evenly spaced, ` +
      `all the same size. ` +
      `The LEFT and RIGHT ones are dramatic IN-GAME ACTION posters, each showing ONE athlete in the middle ` +
      `of a play under hard arena floodlights: the left one caught mid-dunk from below and behind, the ` +
      `right one driving hard along the baseline with the head turned away and motion blur across the ` +
      `body. Plain unbranded kit, one red, one white. NO face is visible or identifiable in either, and ` +
      `they carry NO team badge, NO league mark and NO words or numbers. They must not resemble any real ` +
      `or famous player. ` +
      `The MIDDLE frame is COMPLETELY EMPTY inside — a flat, even, pure black rectangle, no picture, no ` +
      `pattern, no glare, no reflection, unobstructed, face on. ` +
      `Warm evening light. Shot on a phone. Square 1:1. No text overlay, no watermark, no logo.` },
  { name:"p03-room-v6", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/basketball/_identity.png")],
    prompt:`A photograph of an American teenage basketball player's bedroom, pale wall, tidy. The player ` +
      `from the reference image sits on the floor lacing his basketball shoes, a PLAIN UNBRANDED ball ` +
      `beside him with no maker name or writing on it, not looking at the camera. Same person as the ` +
      `reference: same face, same skin tone, same short twists, same build, everyday clothes. ` +
      `Behind him hang THREE framed posters in a row, same size, evenly spaced, slim black frames. ` +
      `LEFT FRAME: a printed IN-GAME ACTION photograph — an athlete mid-dunk, seen from behind and below ` +
      `against arena floodlights, plain red unbranded kit, the head turned away so NO face is visible. ` +
      `RIGHT FRAME: a printed IN-GAME ACTION photograph — an athlete driving along the baseline in plain ` +
      `white unbranded kit, motion blur across the body, the head turned away so NO face is visible. ` +
      `Neither may resemble a real or famous player and neither carries a badge, a league mark, a maker ` +
      `name, words or numbers. ` +
      `MIDDLE FRAME: this one and ONLY this one is EMPTY — a flat, even, pure black rectangle inside the ` +
      `frame, no picture, no pattern, no glare, no reflection, unobstructed, face on. The left and right ` +
      `frames are definitely NOT empty; they are full of the action photographs described above. ` +
      `Warm evening light. Shot on a phone. Square 1:1. No text overlay, no watermark, no logo.` },
  // A black phone screen cannot be separated from a black phone body — the detector kept
  // choosing the poster on the wall behind instead. A WHITE screen is unambiguous.
  { name:"p16-phone-white", ar:"1:1", refs:[],
    prompt:`A photograph: a teenager's hand holds a modern smartphone upright, face on to the camera, ` +
      `the whole screen visible and unobstructed and filling a good part of the picture. THE SCREEN IS ` +
      `COMPLETELY BLANK PURE WHITE — an even, flat white rectangle, no icons, no interface, no text, no ` +
      `reflection, no glare, no gradient. Behind, a blurred bedroom with warm light and NOTHING ` +
      `rectangular on the walls — no posters, no picture frames, no television. ` +
      `Shot on a phone, shallow depth of field. Square 1:1. No text anywhere, no watermark, no logo.` },

  // --- 2026-08-25: listing 04 (COMPLETE SET) hero background. The hero must say
  // "any athlete, any sport" in one photograph, so it carries BOTH our football player and
  // our cheerleader. Generated CLEAN — no poster, no card, no phone, no screen: every GDE
  // surface is composited on top in Figma afterwards (the rule at the top of this file).
  // The left of the frame is deliberately dark and empty; that is where the headline goes.
  { name:"h04a-hero-two-athletes", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/cheerleading/_identity.png")],
    prompt:`A dramatic evening sports photograph on an American high-school football field, shot on a long lens. ` +
      `TWO athletes, both from the reference images. ` +
      `FOREGROUND, standing on the RIGHT SIDE of the frame, turned three-quarters to camera: the eighteen-year-old ` +
      `Pacific Islander football player from the FIRST reference image — same face, same wide heavy jaw, same broad ` +
      `flat nose, same warm brown skin, same black wavy hair cropped at the sides. He is genuinely heavy and solid, ` +
      `a lineman's build, NOT lean. He wears a FOREST GREEN American football jersey with the number 54 in cream on ` +
      `the chest, matching forest green football pants, and he holds his forest green helmet down at his side in one ` +
      `hand. His hand shows five separate, clearly defined fingers gripping the facemask. ` +
      `BEHIND HIM and to his LEFT, caught in mid-air at the top of a jump with both arms raised in a high V, ` +
      `noticeably smaller and further away and slightly out of focus: the fifteen-year-old cheerleader from the ` +
      `SECOND reference image — same face, same deep brown skin, same black hair in a high ponytail. She wears a ` +
      `BERRY PURPLE sleeveless cheer top with a contrasting white V panel across the chest, a matching berry skirt, ` +
      `a large berry bow at the crown of her ponytail, plain white cheer sneakers, and she holds a berry-and-white ` +
      `pom-pom in each hand. She is genuinely airborne, feet clear of the ground. ` +
      `THE LEFT THIRD OF THE FRAME IS EMPTY: no person, no object, no clutter — just the dark, softly blurred field ` +
      `and stadium lights falling away into shadow, so that side of the picture stays clean and quiet. ` +
      `Late golden-hour light raking from the right, stadium floodlights flaring behind, a little haze in the air, ` +
      `deep shadows. Cinematic, photographic, real — like a press photograph, not a poster and not an illustration. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo and NO brand mark of any kind on either kit, ` +
      `on the helmet, on the shoes or anywhere in the frame. Nothing resembling the NFL, NCAA or any real league. ` +
      `Square 1:1. No text of any kind, no lettering, no watermark, no border.` },

  { name:"h04b-hero-two-athletes-tight", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/cheerleading/_identity.png")],
    prompt:`A dramatic evening sports photograph on an American high-school football field, shot closer and tighter ` +
      `than a full-length shot: the football player framed from the knees up. ` +
      `ON THE RIGHT SIDE of the frame, facing the camera almost straight on, chin slightly down, a hard confident ` +
      `look: the eighteen-year-old Pacific Islander football player from the FIRST reference image — same face, ` +
      `same wide heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair. Heavy, solid, a ` +
      `lineman's build, NOT lean. He wears a FOREST GREEN American football jersey with the number 54 in cream on ` +
      `the chest and forest green shoulder pads under it. He carries his forest green helmet in one hand, low, ` +
      `five separate clearly defined fingers around the facemask. ` +
      `BEHIND HIS LEFT SHOULDER, higher in the frame, small and thrown out of focus, caught at the very top of a ` +
      `jump with both arms in a high V and both feet clear of the ground: the fifteen-year-old cheerleader from the ` +
      `SECOND reference image — same face, same deep brown skin, same black high ponytail. BERRY PURPLE sleeveless ` +
      `cheer top with a white V panel, matching berry skirt, large berry bow at the crown, a pom-pom in each hand. ` +
      `THE LEFT SIDE AND THE TOP-LEFT CORNER OF THE FRAME ARE DARK AND EMPTY — no subject, no clutter, just falling ` +
      `shadow and blurred floodlight glow, keeping that area clean. ` +
      `Backlit by stadium floodlights, warm rim light on both athletes, haze, deep contrast. Photographic and real, ` +
      `like a press photograph. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere on the kit, helmet or ` +
      `shoes. Nothing resembling any real league. Square 1:1. No text, no lettering, no watermark, no border.` },

  { name:"h04c-hero-two-athletes-wide", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/cheerleading/_identity.png")],
    prompt:`A wide, atmospheric evening photograph on an American high-school football field at dusk, the two athletes ` +
      `small in a big frame, lots of air around them. ` +
      `RIGHT OF CENTRE, standing full length, turned three-quarters to camera: the eighteen-year-old Pacific Islander ` +
      `football player from the FIRST reference image — same face, same heavy jaw, same broad nose, same warm brown ` +
      `skin, same black wavy hair. Heavy and solid, a lineman's build, NOT lean. FOREST GREEN football jersey with ` +
      `the number 54 in cream, forest green pants, his forest green helmet held at his side, five separate fingers ` +
      `clearly visible on the facemask. ` +
      `BEHIND AND LEFT OF HIM, mid-air at the peak of a jump, arms in a high V, both feet off the ground, smaller ` +
      `and softly out of focus: the fifteen-year-old cheerleader from the SECOND reference image — same face, same ` +
      `deep brown skin, same black high ponytail. BERRY PURPLE sleeveless cheer top with a white V panel, matching ` +
      `berry skirt, large berry bow at the crown of the ponytail, a pom-pom in each hand. ` +
      `THE WHOLE LEFT HALF OF THE FRAME IS OPEN AND UNCLUTTERED — empty turf running away into shadow, blurred ` +
      `floodlights, nothing and nobody in it. ` +
      `Cool blue dusk sky above, warm floodlights below, long shadows, mist catching the light. Cinematic and real, ` +
      `a photograph rather than an illustration. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark of any kind. Nothing resembling ` +
      `any real league. Square 1:1. No text, no lettering, no watermark, no border.` },

  // --- 2026-08-25: hero round 2. h04b was the right look (floodlit, moody, dark left) but the
  // athletes sat too centrally — the complete-set stack (poster, card, phone, laptop) needs the
  // left half of the frame. These push both athletes into the right third and ask for a real
  // cheer jump rather than a hover.
  { name:"h04d-hero-right-third", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/cheerleading/_identity.png")],
    prompt:`A dramatic night sports photograph on an American high-school football field, lit by stadium floodlights, ` +
      `shot on a long lens with heavy atmosphere and haze. ` +
      `COMPOSITION IS CRITICAL: both athletes stand in the RIGHT THIRD of the square frame. ` +
      `THE ENTIRE LEFT HALF OF THE PICTURE IS EMPTY, DARK AND UNCLUTTERED — nothing but shadowed turf and blurred ` +
      `floodlight glow falling away into near-black. No person, no object, no line, no clutter on the left half. ` +
      `ON THE RIGHT, framed from the thighs up, facing the camera almost straight on with a hard confident look: ` +
      `the eighteen-year-old Pacific Islander football player from the FIRST reference image — same face, same wide ` +
      `heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair cropped at the sides. Heavy and ` +
      `solid, a lineman's build, NOT lean. FOREST GREEN American football jersey, the number 54 in cream on the ` +
      `chest, forest green shoulder pads beneath. He holds his forest green helmet low at his side, five separate ` +
      `clearly defined fingers around the facemask. ` +
      `BEHIND HIS LEFT SHOULDER and higher, thrown softly out of focus but clearly readable as a cheerleader ` +
      `mid-jump: the fifteen-year-old from the SECOND reference image — same face, same deep brown skin, same black ` +
      `hair in a high ponytail with a LARGE BERRY BOW at the crown. She is at the very top of a powerful cheer jump, ` +
      `knees bent and legs split apart in a real athletic toe-touch, both feet well clear of the ground, both arms ` +
      `punched up in a high V with a berry-and-white pom-pom in each hand. BERRY PURPLE sleeveless cheer top with a ` +
      `contrasting white V panel across the chest and a matching berry skirt. ` +
      `Warm rim light from the floodlights behind them, deep shadow in front, mist in the beams. Photographic and ` +
      `real, like a press photograph — not a poster, not an illustration. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere on either kit, on the ` +
      `helmet or on the shoes. Nothing resembling the NFL, NCAA or any real league. ` +
      `Square 1:1. No text of any kind, no lettering, no numbers other than the 54 on the jersey, no watermark.` },

  { name:"h04e-hero-right-third-closer", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/cheerleading/_identity.png")],
    prompt:`A dramatic night sports photograph under stadium floodlights on an American high-school football field, ` +
      `heavy haze, deep contrast, shot on a long lens. ` +
      `COMPOSITION IS CRITICAL: the two athletes are pushed hard to the RIGHT of the square frame and the LEFT 55 ` +
      `PERCENT OF THE PICTURE IS COMPLETELY EMPTY — dark shadowed grass and soft blurred light, no person, no ` +
      `object, no clutter of any kind. That empty dark area must be large and clean. ` +
      `RIGHT SIDE, standing full height and turned three-quarters to camera, chin up, calm and confident: the ` +
      `eighteen-year-old Pacific Islander football player from the FIRST reference image — same face, same heavy ` +
      `jaw, same broad flat nose, same warm brown skin, same black wavy hair. Genuinely heavy and solid, a ` +
      `lineman's build, NOT lean. FOREST GREEN football jersey with the number 54 in cream, forest green pants, ` +
      `forest green helmet carried at his side with five separate clearly defined fingers on the facemask. ` +
      `IMMEDIATELY BEHIND HIM AND SLIGHTLY LEFT, closer to him than to the camera and only gently out of focus so ` +
      `her face and kit read clearly: the fifteen-year-old cheerleader from the SECOND reference image — same face, ` +
      `same deep brown skin, same black high ponytail with a LARGE BERRY BOW at the crown. She is caught at the peak ` +
      `of a real cheer jump — legs split wide and knees bent in a toe-touch, feet high off the ground, both arms up ` +
      `in a sharp high V, a berry-and-white pom-pom in each hand, mouth open in a genuine shout. BERRY PURPLE ` +
      `sleeveless cheer top with a white V panel across the chest and a matching berry skirt. ` +
      `Strong warm backlight from the floodlights, rim light on both, cool shadow in front. Real photography. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere. Nothing resembling ` +
      `any real league. Square 1:1. No text, no lettering, no watermark, no border.` },

  { name:"h04f-hero-lowangle", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/cheerleading/_identity.png")],
    prompt:`A powerful low-angle night photograph on an American high-school football field, camera close to the turf ` +
      `looking slightly up, stadium floodlights blazing behind and haze in the beams. ` +
      `COMPOSITION IS CRITICAL: both figures occupy the RIGHT THIRD of the square frame; the LEFT HALF IS DARK, ` +
      `OPEN AND ENTIRELY EMPTY — shadowed turf and diffused glow only, nothing and nobody in it. ` +
      `RIGHT SIDE, standing, seen from just below eye level so he reads tall and imposing: the eighteen-year-old ` +
      `Pacific Islander football player from the FIRST reference image — same face, same wide heavy jaw, same broad ` +
      `flat nose, same warm brown skin, same black wavy hair. Heavy, thick-necked, a lineman's build, NOT lean. ` +
      `FOREST GREEN football jersey with the number 54 in cream, forest green pants, his forest green helmet held ` +
      `low in one hand, five separate clearly defined fingers around the facemask. ` +
      `BEHIND HIM, higher in the frame and lit from behind so she reads as a bright silhouette with her face still ` +
      `visible: the fifteen-year-old cheerleader from the SECOND reference image — same face, same deep brown skin, ` +
      `same black high ponytail with a LARGE BERRY BOW at the crown. She is at the top of a real cheer jump, legs ` +
      `split and knees bent in a toe-touch, feet clear of the ground, arms in a high V, a berry-and-white pom-pom ` +
      `in each hand. BERRY PURPLE sleeveless cheer top with a white V panel and a matching berry skirt. ` +
      `Lens flare from the floodlights, mist, deep blacks. Cinematic sports photography, real, not illustrated. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere in the frame. ` +
      `Nothing resembling any real league. Square 1:1. No text, no lettering, no watermark, no border.` },

  // --- 2026-08-25: hero round 3. Customer asked for wider demographics — a fair-skinned
  // athlete and soccer on the left. The roster has NO fair-skinned teenage soccer player;
  // the fair soccer athletes are Finn Halloran (7) and Danny Voss (32). Finn is used because
  // he adds an age range (7 / 15 / 18) as well as skin tone. The athletes sit in the upper
  // band and the BOTTOM THIRD is kept dark and empty for the product stack.
  { name:"h04g-hero-three-athletes", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/cheerleading/_identity.png"), ref("art-pipeline/out/athletes/soccer-age-07/_identity.png")],
    prompt:`A dramatic night sports photograph under stadium floodlights, heavy haze in the beams, shot on a long lens. ` +
      `THREE athletes of different ages and different sports stand together on the field, arranged across the ` +
      `UPPER TWO THIRDS of the square frame. ` +
      `RIGHT SIDE, framed from the thighs up, facing camera, calm and confident: the eighteen-year-old Pacific ` +
      `Islander football player from the FIRST reference image — same face, same wide heavy jaw, same broad flat ` +
      `nose, same warm brown skin, same black wavy hair. Heavy and solid, a lineman's build, NOT lean. FOREST GREEN ` +
      `football jersey with the number 54 in cream, forest green shoulder pads, his forest green helmet held low in ` +
      `one hand with five separate clearly defined fingers on the facemask. ` +
      `CENTRE, BEHIND THEM and higher, caught at the top of a real cheer jump with legs split and knees bent in a ` +
      `toe-touch, feet well clear of the ground, both arms in a sharp high V: the fifteen-year-old cheerleader from ` +
      `the SECOND reference image — same face, same deep brown skin, same black high ponytail with a LARGE BERRY ` +
      `BOW at the crown. BERRY PURPLE sleeveless cheer top with a white V panel, matching berry skirt, a ` +
      `berry-and-white pom-pom in each hand. Softly out of focus. ` +
      `LEFT SIDE, standing and much smaller because he is genuinely a small child: the SEVEN-YEAR-OLD boy from the ` +
      `THIRD reference image — same round face with full cheeks, same small upturned nose, same wide hazel eyes, ` +
      `same fair freckled skin, same strawberry blonde fringe. His head is LARGE relative to his body, about one ` +
      `sixth of his height — a real second-grader, NOT a shrunken adult. He wears a KELLY GREEN soccer jersey with ` +
      `contrasting white sleeve trim, kelly green shorts, socks over shin guards and black soccer cleats, and he ` +
      `rests one foot on a plain WHITE soccer ball with black pentagon panels. He grins up, delighted. ` +
      `THE BOTTOM THIRD OF THE FRAME IS DARK, OPEN AND COMPLETELY EMPTY — shadowed turf falling into near-black, ` +
      `no person, no object, no clutter, so that band of the picture stays clean and quiet. ` +
      `Warm floodlight rim light behind all three, cool shadow in front, mist in the air. Photographic and real, ` +
      `like a press photograph — not a poster and not an illustration. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere on any kit, helmet, ` +
      `ball or shoe. Nothing resembling the NFL, NCAA, FIFA or any real league or brand. ` +
      `Square 1:1. No text of any kind, no lettering, no numbers other than the 54 on the football jersey, no watermark.` },

  { name:"h04h-hero-three-athletes-band", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/cheerleading/_identity.png"), ref("art-pipeline/out/athletes/soccer-age-07/_identity.png")],
    prompt:`A wide night photograph on an American high-school sports field under floodlights, atmospheric haze, ` +
      `three athletes of different ages and sports standing in a loose line, all of them in the UPPER HALF of the ` +
      `square frame and seen full length, small enough that there is a lot of air and dark ground below them. ` +
      `RIGHT: the eighteen-year-old Pacific Islander football player from the FIRST reference image — same face, ` +
      `same heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair, heavy solid lineman's ` +
      `build, NOT lean. FOREST GREEN jersey with the number 54 in cream, forest green pants, helmet at his side, ` +
      `five separate clearly defined fingers on the facemask. ` +
      `CENTRE and slightly behind, airborne at the peak of a cheer jump, legs split in a toe-touch and arms in a ` +
      `high V: the fifteen-year-old cheerleader from the SECOND reference image — same face, same deep brown skin, ` +
      `same black high ponytail with a LARGE BERRY BOW. BERRY PURPLE sleeveless top with a white V panel, matching ` +
      `berry skirt, a pom-pom in each hand. ` +
      `LEFT: the SEVEN-YEAR-OLD boy from the THIRD reference image, obviously a small child beside the others — ` +
      `same round full-cheeked face, same small upturned nose, same wide hazel eyes, same fair freckled skin, same ` +
      `strawberry blonde fringe, head large relative to his body. KELLY GREEN soccer jersey with white sleeve trim, ` +
      `kelly green shorts, shin guards under the socks, black soccer cleats, a plain WHITE soccer ball with black ` +
      `pentagon panels under his foot. ` +
      `THE ENTIRE BOTTOM THIRD IS EMPTY DARK GROUND — nothing in it at all, no figures, no objects, no markings ` +
      `catching the light. Keep it clean and simple. ` +
      `Floodlights flaring behind, warm rim light, cool shadows, mist. Real sports photography, cinematic. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere. Nothing resembling ` +
      `any real league. Square 1:1. No text, no lettering, no watermark, no border.` },

  // --- 2026-08-25: hero round 4. h04g was the winning look (floodlit haze, dark empty bottom
  // third, honest age range). Customer asked to add the baseball athlete, so the line becomes
  // four: soccer 7, baseball 16, cheer 15, football 18 — four sports, four builds, four ages.
  { name:"h04i-hero-four-athletes", ar:"1:1",
    refs:[
      ref("art-pipeline/out/athletes/football/_identity.png"),
      ref("art-pipeline/out/athletes/cheerleading/_identity.png"),
      ref("art-pipeline/out/athletes/soccer-age-07/_identity.png"),
      ref("art-pipeline/out/athletes/baseball/_identity.png"),
    ],
    prompt:`A dramatic sports portrait under stadium floodlights with thick haze in the beams, deep black background, ` +
      `shot on a long lens. FOUR athletes of different ages and different sports stand in a line across the UPPER ` +
      `TWO THIRDS of the square frame. ` +
      `FAR RIGHT, framed from the thighs up, facing camera, calm and confident: the eighteen-year-old Pacific ` +
      `Islander football player from the FIRST reference image — same face, same wide heavy jaw, same broad flat ` +
      `nose, same warm brown skin, same black wavy hair. Heavy and solid, a lineman's build, NOT lean. FOREST GREEN ` +
      `football jersey with the number 54 in cream, forest green pants, his forest green helmet held low in one hand ` +
      `with five separate clearly defined fingers on the facemask. ` +
      `CENTRE, BEHIND the others and higher, airborne at the peak of a real cheer jump with legs split and knees ` +
      `bent in a toe-touch, feet well clear of the ground, both arms in a sharp high V: the fifteen-year-old ` +
      `cheerleader from the SECOND reference image — same face, same deep brown skin, same black high ponytail with ` +
      `a LARGE BERRY BOW at the crown. BERRY PURPLE sleeveless cheer top with a white V panel, matching berry skirt, ` +
      `a berry-and-white pom-pom in each hand. ` +
      `LEFT OF CENTRE, standing square to camera, a bat resting on his shoulder: the SIXTEEN-YEAR-OLD baseball ` +
      `player from the FOURTH reference image — same round face, same snub nose, same pale green eyes, same fair ` +
      `heavily freckled skin, same coppery red short thick hair with a cowlick. Compact and thick-set through the ` +
      `forearms, a short strong build, NOT tall. BURNT ORANGE baseball jersey with cream piping and a button ` +
      `placket, GREY baseball pants with a burnt orange stripe, a burnt orange belt and a burnt orange cap, black ` +
      `baseball cleats, and a plain wooden bat held in five separate clearly defined fingers. ` +
      `FAR LEFT, standing and much smaller because he is genuinely a small child: the SEVEN-YEAR-OLD boy from the ` +
      `THIRD reference image — same round full-cheeked face, same small upturned nose, same wide hazel eyes, same ` +
      `fair freckled skin, same strawberry blonde fringe. His head is LARGE relative to his body, about one sixth ` +
      `of his height — a real second-grader, NOT a shrunken adult. KELLY GREEN soccer jersey with white sleeve ` +
      `trim, kelly green shorts, socks over shin guards, black soccer cleats, one foot resting on a plain WHITE ` +
      `soccer ball with black pentagon panels. He grins, delighted. ` +
      `THE BOTTOM THIRD OF THE FRAME IS DARK, OPEN AND COMPLETELY EMPTY — shadowed turf falling into near-black, ` +
      `no person, no object, no clutter, so that band stays clean and quiet. ` +
      `Warm floodlight rim light behind all four, cool shadow in front, mist. Photographic and real, like a press ` +
      `photograph — not a poster, not an illustration. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere on any kit, helmet, ` +
      `cap, bat, ball or shoe. Nothing resembling the NFL, NCAA, MLB, FIFA or any real league or brand. ` +
      `Square 1:1. No text of any kind, no lettering, no numbers other than the 54 on the football jersey, no watermark.` },

  { name:"h04j-hero-four-athletes-wide", ar:"1:1",
    refs:[
      ref("art-pipeline/out/athletes/football/_identity.png"),
      ref("art-pipeline/out/athletes/cheerleading/_identity.png"),
      ref("art-pipeline/out/athletes/soccer-age-07/_identity.png"),
      ref("art-pipeline/out/athletes/baseball/_identity.png"),
    ],
    prompt:`A dramatic full-length sports portrait under stadium floodlights, thick atmospheric haze, deep black ` +
      `background, everything lit from behind. FOUR athletes of four different sports and four different ages stand ` +
      `in a loose line, all seen FULL LENGTH from head to shoes, occupying the UPPER TWO THIRDS of the square frame. ` +
      `FAR RIGHT: the eighteen-year-old Pacific Islander football player from the FIRST reference image — same face, ` +
      `same heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair, heavy solid lineman's ` +
      `build, NOT lean. FOREST GREEN jersey with the number 54 in cream, forest green pants, helmet in one hand, ` +
      `five separate clearly defined fingers on the facemask. ` +
      `CENTRE and behind, airborne at the top of a cheer jump, legs split in a toe-touch, arms in a high V: the ` +
      `fifteen-year-old cheerleader from the SECOND reference image — same face, same deep brown skin, same black ` +
      `high ponytail with a LARGE BERRY BOW. BERRY PURPLE sleeveless top with a white V panel, berry skirt, a ` +
      `pom-pom in each hand. ` +
      `LEFT OF CENTRE: the SIXTEEN-YEAR-OLD baseball player from the FOURTH reference image — same round face, same ` +
      `snub nose, same fair heavily freckled skin, same coppery red hair with a cowlick, compact and thick-set, NOT ` +
      `tall. BURNT ORANGE jersey with cream piping, GREY pants with a burnt orange stripe, burnt orange belt and ` +
      `cap, black cleats, a plain wooden bat held down at his side in five separate clearly defined fingers. ` +
      `FAR LEFT, clearly the smallest by a long way: the SEVEN-YEAR-OLD boy from the THIRD reference image — same ` +
      `round full-cheeked face, same wide hazel eyes, same fair freckled skin, same strawberry blonde fringe, head ` +
      `large relative to his body, a real second-grader. KELLY GREEN soccer jersey with white sleeve trim, kelly ` +
      `green shorts, shin guards under the socks, black soccer cleats, a plain WHITE soccer ball with black ` +
      `pentagon panels at his feet. ` +
      `THE WHOLE BOTTOM THIRD IS EMPTY DARK GROUND — nothing in it at all. Keep it clean. ` +
      `Floodlights flaring behind, warm rim light, mist, deep blacks. Real sports photography, cinematic. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere. Nothing resembling ` +
      `any real league. Square 1:1. No text, no lettering, no watermark, no border.` },

  // --- 2026-08-25: hero round 5. The floodlit-on-black look (h04j) reads too dark once the
  // Figma scrims go on top, and all four athletes were posing straight down the lens. These
  // are BRIGHT and every athlete is mid-action with their eyes off camera. Bottom third still
  // kept clear for the product stack.
  { name:"h04k-hero-bright-action", ar:"1:1",
    refs:[
      ref("art-pipeline/out/athletes/football/_identity.png"),
      ref("art-pipeline/out/athletes/cheerleading/_identity.png"),
      ref("art-pipeline/out/athletes/soccer-age-07/_identity.png"),
      ref("art-pipeline/out/athletes/baseball/_identity.png"),
    ],
    prompt:`A BRIGHT, sunlit action photograph on an American high-school sports field in warm late-afternoon ` +
      `daylight. Open, airy, high-key light — bright sky, sunlit green grass, soft OPEN shadows, nothing crushed ` +
      `to black. This is a bright daytime picture, NOT a dark night shot. ` +
      `FOUR athletes, each MID-ACTION and each looking AWAY from the camera at what they are doing. NOBODY looks ` +
      `into the lens and NOBODY is standing still posing. ` +
      `FAR RIGHT: the eighteen-year-old Pacific Islander football player from the FIRST reference image — same ` +
      `face, same wide heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair. Heavy, solid, ` +
      `a lineman's build, NOT lean. FOREST GREEN jersey with the number 54 in cream, forest green pants. He is ` +
      `striding forward mid-step, helmet gripped in one hand with five separate clearly defined fingers, head ` +
      `turned to his left looking down the field, jaw set. ` +
      `CENTRE, AIRBORNE and higher than everyone: the fifteen-year-old cheerleader from the SECOND reference ` +
      `image — same face, same deep brown skin, same black high ponytail with a LARGE BERRY BOW at the crown. She ` +
      `is at the very top of a toe-touch jump, legs split wide and knees bent, feet well clear of the ground, both ` +
      `arms punched up in a high V, mouth open mid-cheer, eyes up and ahead — not at the camera. BERRY PURPLE ` +
      `sleeveless cheer top with a white V panel, matching berry skirt, a berry-and-white pom-pom in each hand. ` +
      `LEFT OF CENTRE: the SIXTEEN-YEAR-OLD baseball player from the FOURTH reference image — same round face, ` +
      `same snub nose, same fair heavily freckled skin, same coppery red hair with a cowlick. Compact and ` +
      `thick-set, NOT tall. BURNT ORANGE jersey with cream piping, GREY pants with a burnt orange stripe, burnt ` +
      `orange belt and cap. He is at the follow-through of a bat swing, torso rotated, both hands on a plain ` +
      `wooden bat with five separate clearly defined fingers, eyes tracking the ball away out of frame. ` +
      `FAR LEFT, clearly a small child: the SEVEN-YEAR-OLD boy from the THIRD reference image — same round ` +
      `full-cheeked face, same wide hazel eyes, same fair freckled skin, same strawberry blonde fringe, head large ` +
      `relative to his body. KELLY GREEN soccer jersey with white sleeve trim, kelly green shorts, shin guards, ` +
      `black soccer cleats. He is running and dribbling a plain WHITE soccer ball with black pentagon panels, ` +
      `looking down at the ball at his feet, arms out for balance. ` +
      `THE BOTTOM THIRD OF THE FRAME IS OPEN SUNLIT GRASS — no person, no object, no clutter, clean and simple. ` +
      `Bright natural daylight, shallow depth of field, real sports photography. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere. Nothing resembling ` +
      `the NFL, NCAA, MLB, FIFA or any real league. ` +
      `Square 1:1. No text, no lettering, no numbers other than the 54 on the football jersey, no watermark.` },

  { name:"h04l-hero-bright-goldenhour", ar:"1:1",
    refs:[
      ref("art-pipeline/out/athletes/football/_identity.png"),
      ref("art-pipeline/out/athletes/cheerleading/_identity.png"),
      ref("art-pipeline/out/athletes/soccer-age-07/_identity.png"),
      ref("art-pipeline/out/athletes/baseball/_identity.png"),
    ],
    prompt:`A BRIGHT golden-hour action photograph on a high-school sports field, warm low sun flooding the frame, ` +
      `hazy golden light, bright and open — soft lifted shadows, NOT a dark or moody picture. ` +
      `FOUR athletes spread across the frame, ALL OF THEM IN MOTION and ALL of them looking away from the camera ` +
      `at what they are doing. No posing, no eye contact with the lens. ` +
      `RIGHT: the eighteen-year-old Pacific Islander football player from the FIRST reference image — same face, ` +
      `same heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair, heavy solid lineman's ` +
      `build, NOT lean. FOREST GREEN jersey with the number 54 in cream, forest green pants. He is jogging off the ` +
      `field mid-stride, helmet swinging in one hand (five separate clearly defined fingers), head turned away to ` +
      `the right, sweat catching the light. ` +
      `CENTRE and highest, AIRBORNE: the fifteen-year-old cheerleader from the SECOND reference image — same face, ` +
      `same deep brown skin, same black high ponytail with a LARGE BERRY BOW. At the peak of a toe-touch jump, ` +
      `legs split and knees bent, feet high off the ground, arms in a sharp high V, mouth open shouting, looking ` +
      `up and away from camera. BERRY PURPLE sleeveless top with a white V panel, berry skirt, a pom-pom in each hand. ` +
      `LEFT OF CENTRE: the SIXTEEN-YEAR-OLD baseball player from the FOURTH reference image — same round face, same ` +
      `snub nose, same fair freckled skin, same coppery red hair with a cowlick, compact and thick-set. BURNT ` +
      `ORANGE jersey with cream piping, GREY pants with a burnt orange stripe, burnt orange cap. He has just ` +
      `released a throw — arm extended forward, weight on the front foot, watching the ball away out of frame. ` +
      `FAR LEFT and much smaller, a real small child: the SEVEN-YEAR-OLD from the THIRD reference image — same ` +
      `round full-cheeked face, same wide hazel eyes, same fair freckled skin, same strawberry blonde fringe, head ` +
      `large relative to his body. KELLY GREEN soccer jersey, kelly green shorts, shin guards, black cleats. He is ` +
      `mid-kick, striking a plain WHITE soccer ball with black pentagon panels, eyes down on the ball. ` +
      `THE BOTTOM THIRD IS OPEN SUNLIT TURF — completely empty, no figures, no objects. ` +
      `Warm backlight, lens haze, bright exposure, real sports photography, shallow depth of field. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark. Nothing resembling any real ` +
      `league. Square 1:1. No text, no lettering, no watermark, no border.` },

  { name:"h04m-hero-bright-daylight-stadium", ar:"1:1",
    refs:[
      ref("art-pipeline/out/athletes/football/_identity.png"),
      ref("art-pipeline/out/athletes/cheerleading/_identity.png"),
      ref("art-pipeline/out/athletes/soccer-age-07/_identity.png"),
      ref("art-pipeline/out/athletes/baseball/_identity.png"),
    ],
    prompt:`A BRIGHT daytime action photograph in an open high-school stadium under a clear blue sky, strong clean ` +
      `daylight, vivid green turf, bright and cheerful — an OPEN, well-exposed picture with soft shadows, ` +
      `definitely NOT dark and NOT night-time. ` +
      `FOUR athletes of four different sports and ages, EVERY ONE OF THEM CAUGHT MID-MOVEMENT and EVERY ONE ` +
      `looking away from the camera, absorbed in what they are doing. Nobody poses, nobody faces the lens. ` +
      `RIGHT SIDE: the eighteen-year-old Pacific Islander football player from the FIRST reference image — same ` +
      `face, same wide heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair, heavy solid ` +
      `lineman's build, NOT lean. FOREST GREEN jersey with the number 54 in cream, forest green pants. He is ` +
      `walking forward pulling his helmet off, both hands up on the helmet with five separate clearly defined ` +
      `fingers, face turned down and to the side. ` +
      `CENTRE, AIRBORNE above the others: the fifteen-year-old cheerleader from the SECOND reference image — same ` +
      `face, same deep brown skin, same black high ponytail with a LARGE BERRY BOW. Peak of a toe-touch jump, legs ` +
      `split, knees bent, feet clear of the ground, arms in a high V, head tilted up mid-cheer, eyes off camera. ` +
      `BERRY PURPLE sleeveless top with a white V panel, berry skirt, a pom-pom in each hand. ` +
      `LEFT OF CENTRE: the SIXTEEN-YEAR-OLD baseball player from the FOURTH reference image — same round face, ` +
      `same snub nose, same fair heavily freckled skin, same coppery red hair with a cowlick, compact and ` +
      `thick-set. BURNT ORANGE jersey with cream piping, GREY pants with a burnt orange stripe, burnt orange cap. ` +
      `He is crouched and set in a fielding stance, glove down, eyes fixed on the ground ball coming from off frame. ` +
      `FAR LEFT, clearly the smallest: the SEVEN-YEAR-OLD from the THIRD reference image — same round ` +
      `full-cheeked face, same wide hazel eyes, same fair freckled skin, same strawberry blonde fringe, head large ` +
      `relative to his body. KELLY GREEN soccer jersey, kelly green shorts, shin guards, black cleats. He is ` +
      `sprinting after a plain WHITE soccer ball with black pentagon panels, both arms pumping, looking ahead at ` +
      `the ball, laughing. ` +
      `THE BOTTOM THIRD OF THE FRAME IS CLEAN OPEN TURF with nothing on it. ` +
      `Bright even daylight, crisp and colourful, real sports photography. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere. Nothing resembling ` +
      `any real league. Square 1:1. No text, no lettering, no watermark, no border.` },

  // --- 2026-08-25: hero round 6, and the one that matters. The bright daylight rolls (h04k/l/m)
  // did not belong beside our card and poster art, which is all Stadium Night: a dark floodlit
  // stadium, heavy haze, hard rim light and a brightly-lit figure popping off a near-black
  // background. So the poster itself is passed as the LAST reference for colour and lighting,
  // and the composition keeps h04c (football standing right, cheerleader airborne centre) with
  // the baseball player and the soccer child added on the LEFT.
  // The athletes are lit BRIGHT; the darkness lives in the background, not on them — that is
  // what stops the Figma scrims from crushing the frame the way they did in hero v1.
  { name:"h04n-hero-stadiumnight-four", ar:"1:1",
    refs:[
      ref("art-pipeline/out/athletes/football/_identity.png"),
      ref("art-pipeline/out/athletes/cheerleading/_identity.png"),
      ref("art-pipeline/out/athletes/soccer-age-07/_identity.png"),
      ref("art-pipeline/out/athletes/baseball/_identity.png"),
      ref("etsy/listing-images/04-complete-set/src/football-poster.png"),
    ],
    prompt:`Match the LIGHTING, ATMOSPHERE and COLOUR GRADE of the FIFTH reference image exactly: a floodlit stadium ` +
      `at night, deep blue-teal darkness, thick drifting smoke and haze through the whole mid-ground, stadium ` +
      `floodlights flaring across the top of the frame, a crowd lost in shadow behind, and hard bright rim light ` +
      `separating every figure from that dark background. Cinematic, moody, premium sports photography. ` +
      `THE ATHLETES THEMSELVES ARE LIT BRIGHTLY and read clearly — the darkness is in the BACKGROUND, not on their ` +
      `faces or kit. Faces well exposed, colours rich and saturated. ` +
      `FOUR athletes stand across the UPPER TWO THIRDS of the square frame on the turf. ` +
      `FAR RIGHT, standing full length turned three-quarters to camera, helmet held down at his side in one hand ` +
      `with five separate clearly defined fingers, head turned slightly away down the field: the eighteen-year-old ` +
      `Pacific Islander football player from the FIRST reference image — same face, same wide heavy jaw, same broad ` +
      `flat nose, same warm brown skin, same black wavy hair. Heavy, solid, a lineman's build, NOT lean. FOREST ` +
      `GREEN jersey with the number 54 in cream, forest green pants. ` +
      `CENTRE and highest, AIRBORNE: the fifteen-year-old cheerleader from the SECOND reference image — same face, ` +
      `same deep brown skin, same black high ponytail with a LARGE BERRY BOW at the crown. At the peak of a real ` +
      `toe-touch jump, legs split wide and knees bent, feet well clear of the ground, both arms punched up in a ` +
      `high V, head turned up and to the side mid-cheer, NOT looking at the camera. BERRY PURPLE sleeveless cheer ` +
      `top with a white V panel, matching berry skirt, a berry-and-white pom-pom in each hand. ` +
      `LEFT OF CENTRE: the SIXTEEN-YEAR-OLD baseball player from the FOURTH reference image — same round face, same ` +
      `snub nose, same fair heavily freckled skin, same coppery red hair with a cowlick. Compact and thick-set, NOT ` +
      `tall. BURNT ORANGE jersey with cream piping, GREY pants with a burnt orange stripe, burnt orange belt and ` +
      `cap. He is at the follow-through of a bat swing, torso rotated, both hands on a plain wooden bat with five ` +
      `separate clearly defined fingers, eyes tracking the ball away out of frame. ` +
      `FAR LEFT, clearly a small child beside the others: the SEVEN-YEAR-OLD boy from the THIRD reference image — ` +
      `same round full-cheeked face, same small upturned nose, same wide hazel eyes, same fair freckled skin, same ` +
      `strawberry blonde fringe. Head LARGE relative to his body, about one sixth of his height, a real ` +
      `second-grader and NOT a shrunken adult. KELLY GREEN soccer jersey with white sleeve trim, kelly green ` +
      `shorts, socks over shin guards, black soccer cleats. He is mid-stride running with a plain WHITE soccer ball ` +
      `with black pentagon panels at his feet, looking down at the ball. ` +
      `THE BOTTOM THIRD OF THE FRAME IS DARK, HAZY, OPEN TURF — no person, no object, no clutter, clean and quiet. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere. Nothing resembling ` +
      `the NFL, NCAA, MLB, FIFA or any real league. ` +
      `Square 1:1. No text, no lettering, no numbers other than the 54 on the football jersey, no watermark.` },

  { name:"h04o-hero-stadiumnight-standing", ar:"1:1",
    refs:[
      ref("art-pipeline/out/athletes/football/_identity.png"),
      ref("art-pipeline/out/athletes/cheerleading/_identity.png"),
      ref("art-pipeline/out/athletes/soccer-age-07/_identity.png"),
      ref("art-pipeline/out/athletes/baseball/_identity.png"),
      ref("etsy/listing-images/04-complete-set/src/football-poster.png"),
    ],
    prompt:`Match the LIGHTING, ATMOSPHERE and COLOUR GRADE of the FIFTH reference image exactly: a floodlit stadium ` +
      `at night, deep blue-teal darkness, heavy smoke and haze drifting through the mid-ground, floodlights flaring ` +
      `along the top of the frame, dark stands behind, hard bright rim light edging every figure. Cinematic, ` +
      `premium sports photography. THE FOUR ATHLETES ARE LIT BRIGHT AND CLEAN — faces well exposed, kit colours ` +
      `rich; the darkness belongs to the background only. ` +
      `A confident team line-up across the UPPER TWO THIRDS of the square frame, each athlete owning their stance. ` +
      `FAR RIGHT: the eighteen-year-old Pacific Islander football player from the FIRST reference image — same ` +
      `face, same heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair, heavy solid ` +
      `lineman's build, NOT lean. FOREST GREEN jersey with the number 54 in cream, forest green pants, helmet held ` +
      `low at his side (five separate clearly defined fingers on the facemask), chin lifted, looking off to the ` +
      `right, not at the lens. ` +
      `CENTRE, AIRBORNE and higher than everyone: the fifteen-year-old cheerleader from the SECOND reference ` +
      `image — same face, same deep brown skin, same black high ponytail with a LARGE BERRY BOW. At the top of a ` +
      `toe-touch jump, legs split, knees bent, feet clear of the ground, arms in a sharp high V, face turned up and ` +
      `away mid-shout. BERRY PURPLE sleeveless top with a white V panel, berry skirt, a berry-and-white pom-pom in ` +
      `each hand. ` +
      `LEFT OF CENTRE: the SIXTEEN-YEAR-OLD baseball player from the FOURTH reference image — same round face, ` +
      `same snub nose, same fair heavily freckled skin, same coppery red hair, compact and thick-set, NOT tall. ` +
      `BURNT ORANGE jersey with cream piping, GREY pants with a burnt orange stripe, burnt orange belt and cap. He ` +
      `rests a plain wooden bat across one shoulder with five separate clearly defined fingers, head turned to ` +
      `watch something off frame to his left. ` +
      `FAR LEFT, much smaller, unmistakably a small child: the SEVEN-YEAR-OLD from the THIRD reference image — ` +
      `same round full-cheeked face, same wide hazel eyes, same fair freckled skin, same strawberry blonde fringe, ` +
      `head large relative to his body. KELLY GREEN soccer jersey with white sleeve trim, kelly green shorts, shin ` +
      `guards, black soccer cleats. He stands with one foot up on a plain WHITE soccer ball with black pentagon ` +
      `panels, grinning up at the older athletes beside him — looking at them, not at the camera. ` +
      `THE BOTTOM THIRD IS DARK HAZY TURF, completely empty and uncluttered. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere. Nothing resembling ` +
      `any real league. Square 1:1. No text, no lettering, no watermark, no border.` },

  // --- 2026-08-25: hero round 7. Customer picked the h04c dusk grade — glowing floodlights
  // against a deep blue twilight sky, warm amber pools over cool shadow, low mist. ("looks a
  // bit like GTA 6".) h04c itself is passed as the LAST reference so the grade is copied rather
  // than re-described, and the two athletes he already likes keep their positions while the
  // baseball player and the soccer child fill the left.
  { name:"h04p-hero-dusk-glow-four", ar:"1:1",
    refs:[
      ref("art-pipeline/out/athletes/football/_identity.png"),
      ref("art-pipeline/out/athletes/cheerleading/_identity.png"),
      ref("art-pipeline/out/athletes/soccer-age-07/_identity.png"),
      ref("art-pipeline/out/athletes/baseball/_identity.png"),
      ref("art-pipeline/out/etsy-shots/h04c-hero-two-athletes-wide.png"),
    ],
    prompt:`COPY THE LOOK OF THE FIFTH REFERENCE IMAGE EXACTLY — the same deep blue twilight sky, the same stadium ` +
      `floodlights glowing hot with a soft bloom around each lamp, the same warm amber light pooling across cool ` +
      `blue-shadowed grass, the same low mist drifting over the turf, the same hyper-real cinematic colour grade ` +
      `with rich teal shadows against warm highlights, the same soft haze and gentle lens bloom. High dynamic ` +
      `range, glossy, cinematic, beautiful — the lights are the hero of the lighting and they must stand out. ` +
      `Keep the athletes crisply lit and clearly readable against it. ` +
      `FOUR athletes stand on the field across the UPPER TWO THIRDS of the square frame. ` +
      `FAR RIGHT, standing full length turned three-quarters to camera, helmet held low at his side in one hand ` +
      `with five separate clearly defined fingers, head turned away down the field: the eighteen-year-old Pacific ` +
      `Islander football player from the FIRST reference image — same face, same wide heavy jaw, same broad flat ` +
      `nose, same warm brown skin, same black wavy hair. Heavy and solid, a lineman's build, NOT lean. FOREST ` +
      `GREEN jersey with the number 54 in cream, forest green pants. ` +
      `CENTRE-RIGHT and higher, AIRBORNE: the fifteen-year-old cheerleader from the SECOND reference image — same ` +
      `face, same deep brown skin, same black high ponytail with a LARGE BERRY BOW at the crown. At the peak of a ` +
      `toe-touch jump, legs split and knees bent, feet well clear of the ground, both arms punched up in a high V, ` +
      `head turned up and to the side mid-cheer and NOT looking at the camera. BERRY PURPLE sleeveless cheer top ` +
      `with a white V panel, matching berry skirt, a berry-and-white pom-pom in each hand. ` +
      `CENTRE-LEFT: the SIXTEEN-YEAR-OLD baseball player from the FOURTH reference image — same round face, same ` +
      `snub nose, same fair heavily freckled skin, same coppery red hair with a cowlick. Compact and thick-set, ` +
      `NOT tall. BURNT ORANGE jersey with cream piping, GREY pants with a burnt orange stripe, burnt orange belt ` +
      `and cap. A plain wooden bat rests across one shoulder, five separate clearly defined fingers around it, and ` +
      `he looks off to his left, away from the lens. ` +
      `FAR LEFT, clearly a small child beside the others: the SEVEN-YEAR-OLD boy from the THIRD reference image — ` +
      `same round full-cheeked face, same small upturned nose, same wide hazel eyes, same fair freckled skin, same ` +
      `strawberry blonde fringe. Head LARGE relative to his body, a real second-grader and NOT a shrunken adult. ` +
      `KELLY GREEN soccer jersey with white sleeve trim, kelly green shorts, socks over shin guards, black soccer ` +
      `cleats, one foot resting on a plain WHITE soccer ball with black pentagon panels. He looks up at the older ` +
      `athletes beside him, grinning. ` +
      `THE BOTTOM THIRD OF THE FRAME IS OPEN MISTY TURF catching the warm floodlight — no person, no object, no ` +
      `clutter, clean and quiet. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere. Nothing resembling ` +
      `the NFL, NCAA, MLB, FIFA or any real league. ` +
      `Square 1:1. No text, no lettering, no numbers other than the 54 on the football jersey, no watermark.` },

  { name:"h04q-hero-dusk-glow-action", ar:"1:1",
    refs:[
      ref("art-pipeline/out/athletes/football/_identity.png"),
      ref("art-pipeline/out/athletes/cheerleading/_identity.png"),
      ref("art-pipeline/out/athletes/soccer-age-07/_identity.png"),
      ref("art-pipeline/out/athletes/baseball/_identity.png"),
      ref("art-pipeline/out/etsy-shots/h04c-hero-two-athletes-wide.png"),
    ],
    prompt:`COPY THE LOOK OF THE FIFTH REFERENCE IMAGE EXACTLY — deep blue twilight sky, stadium floodlights blazing ` +
      `with a hot glowing bloom around every lamp, warm amber light spilling across cool blue-shadowed turf, low ` +
      `mist drifting and catching the beams, a hyper-real cinematic grade of teal shadows against warm highlights, ` +
      `soft atmospheric haze and gentle lens bloom. Glossy, high dynamic range, cinematic — the glowing lights are ` +
      `the point and must stand out. The athletes stay crisp and clearly lit against it. ` +
      `FOUR athletes, each MID-ACTION and each looking away from the camera at what they are doing — nobody poses ` +
      `and nobody meets the lens. They sit across the UPPER TWO THIRDS of the square frame. ` +
      `FAR RIGHT: the eighteen-year-old Pacific Islander football player from the FIRST reference image — same ` +
      `face, same heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair, heavy solid ` +
      `lineman's build, NOT lean. FOREST GREEN jersey with the number 54 in cream, forest green pants. He is ` +
      `striding forward mid-step, helmet swinging in one hand with five separate clearly defined fingers, head ` +
      `turned to his left down the field. ` +
      `CENTRE-RIGHT, AIRBORNE and highest: the fifteen-year-old cheerleader from the SECOND reference image — same ` +
      `face, same deep brown skin, same black high ponytail with a LARGE BERRY BOW. At the top of a toe-touch ` +
      `jump, legs split wide and knees bent, feet clear of the ground, arms in a sharp high V, face turned up and ` +
      `away mid-shout. BERRY PURPLE sleeveless top with a white V panel, berry skirt, a berry-and-white pom-pom in ` +
      `each hand. ` +
      `CENTRE-LEFT: the SIXTEEN-YEAR-OLD baseball player from the FOURTH reference image — same round face, same ` +
      `snub nose, same fair heavily freckled skin, same coppery red hair with a cowlick, compact and thick-set, ` +
      `NOT tall. BURNT ORANGE jersey with cream piping, GREY pants with a burnt orange stripe, burnt orange cap. ` +
      `He is at the follow-through of a bat swing, torso rotated, both hands on a plain wooden bat with five ` +
      `separate clearly defined fingers, eyes tracking the ball away out of frame. ` +
      `FAR LEFT, much smaller and unmistakably a small child: the SEVEN-YEAR-OLD from the THIRD reference image — ` +
      `same round full-cheeked face, same wide hazel eyes, same fair freckled skin, same strawberry blonde fringe, ` +
      `head large relative to his body. KELLY GREEN soccer jersey with white sleeve trim, kelly green shorts, shin ` +
      `guards, black soccer cleats. He is mid-stride running with a plain WHITE soccer ball with black pentagon ` +
      `panels at his feet, looking down at the ball. ` +
      `THE BOTTOM THIRD IS OPEN MISTY TURF glowing under the floodlights, completely empty of people and objects. ` +
      `NO club crest, NO school badge, NO sponsor mark, NO maker logo, NO brand mark anywhere. Nothing resembling ` +
      `any real league. Square 1:1. No text, no lettering, no watermark, no border.` },

  // --- 2026-08-25: complete-set slide "THE CARD IN HAND. THE POSTER ON THE WALL."
  // Two friends comparing their cards in one of their bedrooms, so a single frame carries the
  // card (in a hand), the poster (on the wall) and the wallpaper (on a screen). Tui owns the
  // room because we hold his poster AND his desktop wallpaper; Casey is the visiting friend.
  // EVERY GDE surface is generated BLANK — two card faces, the wall frame and the laptop
  // screen — and the real files are warped in afterwards. The model never draws our artwork.
  { name:"s03b-friends-trade-a", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/baseball/_identity.png")],
    prompt:`A warm, candid photograph in a teenage boy's bedroom, late afternoon daylight through a window, ` +
      `shot on a phone, shallow depth of field. TWO teenage friends sit side by side on the edge of the bed, ` +
      `turned slightly towards each other, both laughing genuinely — a real shared moment, not a pose. ` +
      `LEFT: the eighteen-year-old Pacific Islander boy from the FIRST reference image — same face, same wide ` +
      `heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair. Heavy and solid. He wears an ` +
      `ordinary t-shirt, NOT a uniform. ` +
      `RIGHT: the sixteen-year-old boy from the SECOND reference image — same round face, same snub nose, same ` +
      `fair heavily freckled skin, same coppery red hair with a cowlick. Compact and thick-set. Ordinary hoodie, ` +
      `NOT a uniform. ` +
      `EACH BOY HOLDS ONE TRADING CARD UP TOWARDS THE CAMERA at chest height, side by side, both card faces ` +
      `square on to the lens and fully visible. BOTH CARD FACES ARE COMPLETELY BLANK — flat, even, dark charcoal ` +
      `rectangles with sharp square corners, absolutely no printing, no artwork, no text, no logo, no pattern. ` +
      `CRITICAL: fingers grip ONLY the outer edge of each card — no finger, thumb or fingertip in front of either ` +
      `card face, and five separate clearly defined fingers on every visible hand. ` +
      `ON THE WALL BEHIND THEM hangs ONE large framed poster in a slim black frame, portrait orientation, ` +
      `unobstructed and square on to the camera. THE INSIDE OF THAT FRAME IS COMPLETELY EMPTY — a flat, even, ` +
      `pure black rectangle, no picture, no pattern, no glare, no reflection. ` +
      `ON A DESK to one side stands an open laptop turned towards the camera. ITS SCREEN IS COMPLETELY BLANK ` +
      `PURE WHITE — an even flat white rectangle, no icons, no interface, no text, no glare. ` +
      `A real, slightly untidy teenage room. Square 1:1. No text anywhere in the picture, no watermark, no logo.` },

  { name:"s03b-friends-trade-b", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/baseball/_identity.png")],
    prompt:`A candid photograph in a teenage boy's bedroom, bright natural window light, shot on a phone. ` +
      `TWO teenage friends stand close together facing the camera, shoulder to shoulder, both grinning widely at ` +
      `each other's cards — genuine delight. ` +
      `LEFT: the eighteen-year-old Pacific Islander boy from the FIRST reference image — same face, same heavy ` +
      `jaw, same broad flat nose, same warm brown skin, same black wavy hair, heavy solid build. Ordinary t-shirt. ` +
      `RIGHT: the sixteen-year-old boy from the SECOND reference image — same round face, same snub nose, same ` +
      `fair heavily freckled skin, same coppery red hair with a cowlick, compact build. Ordinary t-shirt. ` +
      `EACH HOLDS ONE TRADING CARD UP BESIDE HIS OWN FACE, both cards square on to the camera and fully visible. ` +
      `BOTH CARD FACES ARE COMPLETELY BLANK — flat even dark charcoal rectangles with sharp square corners, no ` +
      `printing, no artwork, no text, no logo of any kind. Fingers grip ONLY the outer edge; nothing covers either ` +
      `card face; five separate clearly defined fingers on every hand. ` +
      `BEHIND THEM on the wall hangs ONE large portrait framed poster in a slim black frame, square on to the ` +
      `camera and unobstructed. ITS INTERIOR IS COMPLETELY EMPTY — a flat even pure black rectangle with no ` +
      `picture, no pattern, no glare. ` +
      `BESIDE THEM on a desk sits an open laptop angled to the camera with a COMPLETELY BLANK PURE WHITE SCREEN — ` +
      `flat white, no icons, no interface, no text, no reflection. ` +
      `Warm lived-in teenage bedroom. Square 1:1. No text anywhere, no watermark, no logo.` },

  { name:"s03b-friends-trade-c", ar:"1:1",
    refs:[ref("art-pipeline/out/athletes/football/_identity.png"), ref("art-pipeline/out/athletes/baseball/_identity.png")],
    prompt:`A candid over-the-desk photograph in a teenage bedroom, soft daylight, shot on a phone. ` +
      `TWO teenage friends lean over a desk together, heads close, both laughing at the cards in their hands. ` +
      `ON THE LEFT: the eighteen-year-old Pacific Islander boy from the FIRST reference image — same face, same ` +
      `wide heavy jaw, same broad flat nose, same warm brown skin, same black wavy hair, heavy solid build, ` +
      `ordinary t-shirt. ON THE RIGHT: the sixteen-year-old boy from the SECOND reference image — same round face, ` +
      `same snub nose, same fair heavily freckled skin, same coppery red hair, compact build, ordinary t-shirt. ` +
      `EACH HOLDS ONE TRADING CARD FACING THE CAMERA, the two cards held side by side above the desk, both faces ` +
      `fully visible and unobstructed. BOTH CARD FACES ARE COMPLETELY BLANK — flat even dark charcoal rectangles ` +
      `with SHARP SQUARE corners — the corners are true right angles, NOT rounded, no printing, no artwork, no text, no logo. Fingers touch ONLY the outer edges, five ` +
      `separate clearly defined fingers on each visible hand. ` +
      `ON THE WALL above the desk hangs ONE large portrait poster in a slim black frame, square to the camera. ` +
      `ITS INTERIOR IS A COMPLETELY EMPTY FLAT PURE BLACK RECTANGLE — no picture, no pattern, no glare. ` +
      `ON THE DESK an open laptop faces the camera with a COMPLETELY BLANK PURE WHITE SCREEN — even flat white, ` +
      `no icons, no interface, no text. ` +
      `Real untidy teenage room, warm and lived in. Square 1:1. No text anywhere, no watermark, no logo.` },
];

const only = process.argv.slice(2).filter(a=>!a.startsWith("--"));
let total = 0;
for (const j of JOBS) {
  if (only.length && !only.includes(j.name)) continue;
  const out = `${OUT}/${j.name}.png`;
  if (existsSync(out)) { console.log(`skip     ${j.name} (exists)`); continue; }
  process.stdout.write(`gen      ${j.name} ... `);
  try {
    const refs = typeof j.refs === "function" ? j.refs() : j.refs;
    const r = await generateImage({ prompt: j.prompt, refs, aspectRatio: j.ar, retries: 1 });
    writeFileSync(out, r.image);
    writeFileSync(out.replace(/\.png$/,".json"), JSON.stringify({ model: imageModel(), tokens: r.tokens, prompt: j.prompt, at: new Date().toISOString() }, null, 2));
    total += r.tokens;
    console.log(`ok (${r.tokens} tokens)`);
  } catch (e:any) {
    console.log(`FAILED: ${e.message?.slice(0,140)}`);
  }
}
console.log(`\ntotal tokens this run: ${total}`);
