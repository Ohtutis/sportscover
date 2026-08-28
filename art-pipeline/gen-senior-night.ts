#!/usr/bin/env tsx
/**
 * One-off: candidate canonical backgrounds for a NEW finish — SENIOR NIGHT (code SR).
 *
 *   npx tsx art-pipeline/gen-senior-night.ts
 *
 * Two deliberately different takes on the same brief, basketball first. No image
 * reference exists yet — the winner of this pair BECOMES the reference and the
 * finish then enters finishes.ts like the other six.
 *
 * The brief: an American high-school SENIOR NIGHT — the last home game, the
 * ceremony, the send-off. Distinct from Stadium Night (cold steel-blue game
 * night) and Heritage (vintage timber): this is celebratory, champagne-gold,
 * modern, emotional.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateImage, loadEnv, MODEL } from "./lib/gemini.js";

loadEnv();

const OUT = "art-pipeline/out/backgrounds/senior-night";
mkdirSync(OUT, { recursive: true });

const HARD = [
  ``,
  `Hard requirements:`,
  `- Vertical poster format, 2:3.`,
  `- COMPLETELY EMPTY STAGE. No people on the court, no athletes, no figures, no`,
  `  silhouettes of people anywhere in the playing area.`,
  `- The centre and lower-centre of the frame must stay clear and uncluttered — an athlete`,
  `  cutout will be composited there later.`,
  `- No words, no lettering, no numbers, no logos, no watermarks, no sponsor or brand`,
  `  marks anywhere — the hanging banners and every decoration are BLANK fabric.`,
  `- The ONLY sport markings on the ground are basketball's.`,
  `- The hoop stands at the far end of the court with its backboard centred on the painted`,
  `  key, the key and free-throw circle running back towards it, and the centre circle`,
  `  lying mid-court in front of it. The rim is 3 m up, the backboard only 1.8 m wide —`,
  `  true real-world scale, a small object in the mid-distance, never an oversized prop.`,
  `- Life scale, shot from standing height: only a fragment of the court fits in frame`,
  `  and it runs out past the edges. Never a miniature of the whole court.`,
  `- No chrome sculpture, no neon lines, no fire, no vintage sepia grain, no daylight.`,
  `- Photorealistic render, sharp, print quality.`,
].join("\n");

const variants: Record<string, string> = {
  // A — "LEGACY": banners in the rafters, one ceremony spotlight, gold confetti.
  "basketball-A-legacy": [
    `A premium sports-poster background: SENIOR NIGHT at an American high-school`,
    `basketball arena — the ceremony before the final home game.`,
    ``,
    `The house lights are DOWN. The whole arena sits in deep charcoal-black darkness,`,
    `and one single warm-white ceremony spotlight throws a bright pool of light onto`,
    `centre court. The polished hardwood floor is glossy and mirror-like, carrying the`,
    `painted key, three-point arc, centre circle and sideline geometry, its varnish`,
    `throwing long soft golden reflections of the light.`,
    ``,
    `High in the dark steel rafters hang rows of BLANK jersey-shaped fabric banners —`,
    `retired-number style championship banners with nothing written on them — their`,
    `edges just catching the light. Fine champagne-gold confetti drifts down through`,
    `the spotlight beam, sparkling where it crosses the light.`,
    ``,
    `In the far darkness, a packed out-of-focus crowd holds up hundreds of tiny`,
    `phone flashlights, glittering like a field of stars behind the hoop.`,
    ``,
    `Palette: deep charcoal black, champagne gold and warm ivory-white light. The mood`,
    `is a send-off — proud, emotional, celebratory, premium. Cinematic contrast:`,
    `near-black shadows against warm golden light, never murky, never washed out.`,
    HARD,
  ].join("\n"),

  // B — "CEREMONY": the decorated gym — balloon arch, spotlight lane, warmer.
  "basketball-B-ceremony": [
    `A premium sports-poster background: SENIOR NIGHT at an American high-school`,
    `basketball gym, decorated for the senior ceremony after the final home game.`,
    ``,
    `A lane of warm spotlight light runs up the middle of the polished hardwood court`,
    `towards the far basket — the senior walk. The floor carries the painted key,`,
    `three-point arc, centre circle and sideline geometry, glossy varnish reflecting`,
    `the lights in long warm streaks.`,
    ``,
    `Behind the far baseline stands a grand balloon arch in metallic gold, white and`,
    `black balloons, framing the hoop from behind at real-world distance. Loose gold`,
    `and white balloons cluster along the dark sidelines, and champagne-gold confetti`,
    `hangs in the air, catching the beams. Above, two crossed follow-spot beams cut`,
    `through a whisper of haze.`,
    ``,
    `The stands rise into warm darkness, a soft out-of-focus crowd glowing under`,
    `strings of tiny warm fairy lights draped along the balcony rails.`,
    ``,
    `Palette: rich near-black warm brown-charcoal, metallic gold, ivory and soft warm`,
    `white. The mood is graduation night meets championship night — festive, warm,`,
    `emotional, premium, modern. Never cold blue, never vintage sepia.`,
    HARD,
  ].join("\n"),
};

// ---------------------------------------------------------------------------
// Round 2 — five more poster takes on the same champagne-gold identity.
// ---------------------------------------------------------------------------
Object.assign(variants, {
  // C — A refined: ONE banner row, deeper blacks, more negative space.
  "basketball-C-legacy-deep": [
    `A premium sports-poster background: SENIOR NIGHT at an American high-school`,
    `basketball arena — the ceremony before the final home game.`,
    ``,
    `The house lights are DOWN. The arena sits in deep, clean near-black darkness with`,
    `generous empty negative space, and ONE single warm ivory-white ceremony spotlight`,
    `cuts down from high above, throwing a bright pool onto the glossy hardwood at`,
    `centre court. The varnished floor carries the painted key, three-point arc,`,
    `centre circle and sideline geometry, and mirrors the beam in one long golden`,
    `streak.`,
    ``,
    `High in the rafters, ONE single row of BLANK jersey-shaped retired-number fabric`,
    `banners hangs in half-shadow, edges kissed by the light — subtle, not busy.`,
    `A restrained drift of fine champagne-gold confetti falls only inside the beam.`,
    `Far behind the hoop, a sparse scatter of tiny phone flashlights glimmers in the`,
    `black — dimmer and farther than the spotlight, never competing with it.`,
    ``,
    `Palette: deep black, champagne gold, warm ivory. Minimal, cinematic, premium —`,
    `MORE darkness and MORE quiet than a game night. The single beam is the hero.`,
    HARD,
  ].join("\n"),

  // D — THE senior-night moment: a blank jersey banner being raised to the rafters.
  "basketball-D-jersey-raise": [
    `A premium sports-poster background: SENIOR NIGHT at an American high-school`,
    `basketball arena — the moment a jersey banner is raised to the rafters.`,
    ``,
    `The arena is dark. In the UPPER THIRD of the frame, one single BLANK white`,
    `jersey-shaped fabric banner hangs from thin steel cables, caught mid-air on its`,
    `way up to the rafters, lit by a dedicated warm follow-spot so it glows against`,
    `the blackness. It is OFF-CENTRE, high, and small enough to leave the middle of`,
    `the frame completely free.`,
    ``,
    `Below, the glossy hardwood court with the painted key, three-point arc, centre`,
    `circle and sideline geometry reflects a soft warm light pool. The hoop stands at`,
    `the far end, backboard centred on the key. A dark out-of-focus crowd holds up`,
    `phone flashlights, and fine champagne-gold confetti drifts through the air.`,
    ``,
    `Palette: deep charcoal black, champagne gold, warm ivory-white. Reverent and`,
    `triumphant — a legacy being hung in the rafters forever.`,
    HARD,
  ].join("\n"),

  // E — no banners: crossed follow-spots and a gold confetti storm.
  "basketball-E-confetti-storm": [
    `A premium sports-poster background: SENIOR NIGHT at an American high-school`,
    `basketball arena — the final buzzer celebration of the last home game.`,
    ``,
    `Two warm-white follow-spot beams cross high above centre court, cutting through`,
    `a light haze. A STORM of champagne-gold and ivory confetti fills the upper air,`,
    `every piece sparkling where it crosses the beams, thinning out lower down so the`,
    `court itself stays clean and readable.`,
    ``,
    `The glossy hardwood carries the painted key, three-point arc, centre circle and`,
    `sideline geometry, reflecting the beams in long warm streaks. The hoop stands at`,
    `the far end, backboard centred on the key. Behind it the packed stands are a`,
    `deep dark mass glittering with hundreds of tiny phone flashlights.`,
    ``,
    `Palette: near-black, champagne gold, warm ivory. Euphoric but premium — a`,
    `celebration shot, never chaotic, never bright orange.`,
    HARD,
  ].join("\n"),

  // F — Americana: the real high-school gym with the flag on the wall.
  "basketball-F-flag-gym": [
    `A premium sports-poster background: SENIOR NIGHT in a REAL American high-school`,
    `gymnasium — authentic, warm, deeply American.`,
    ``,
    `A classic school gym at night: retracted wooden bleachers rising into darkness on`,
    `the far side, a big UNITED STATES FLAG hanging high on the dark far wall in`,
    `half-shadow, its stripes just catching the warm light. Strings of tiny warm`,
    `fairy lights are draped along the balcony rail for the ceremony, and fine`,
    `champagne-gold confetti drifts in the air.`,
    ``,
    `One warm ceremony spotlight pools on the glossy hardwood court, which carries`,
    `the painted key, three-point arc, centre circle and sideline geometry in classic`,
    `school-gym paint. The hoop stands at the far end, backboard centred on the key.`,
    ``,
    `Palette: deep warm black, honey hardwood, champagne gold, muted flag red and`,
    `navy in shadow. Nostalgic but modern and cinematic — Friday night in a small`,
    `American town. No sepia grain, no vintage filter.`,
    HARD,
  ].join("\n"),

  // G — the roses: senior-night flowers at the edge of the light.
  "basketball-G-roses": [
    `A premium sports-poster background: SENIOR NIGHT at an American high-school`,
    `basketball arena — after the ceremony, the flowers still on the floor.`,
    ``,
    `A dark, quiet arena. One warm ivory ceremony spotlight pools on the glossy`,
    `hardwood at centre court. Along the LEFT sideline edge of the frame, a few`,
    `long-stem red roses wrapped in kraft paper lie on the reflective floor at the`,
    `rim of the light — an elegant, small detail, never crossing into the centre.`,
    ``,
    `The floor carries the painted key, three-point arc, centre circle and sideline`,
    `geometry, mirroring the light. The hoop stands at the far end, backboard centred`,
    `on the key. High above, blank fabric banners hang in near-darkness, and a soft`,
    `drift of champagne-gold confetti falls through the beam. Distant phone`,
    `flashlights glitter in the black stands.`,
    ``,
    `Palette: deep black, champagne gold, warm ivory, one restrained note of deep`,
    `rose red. Emotional, cinematic, premium.`,
    HARD,
  ].join("\n"),
});

// ---------------------------------------------------------------------------
// Card frame concepts — a UNIQUE Senior Night border, Topps-limited-edition
// energy. Concept art for the Figma rebuild, so: blank plaques, no lettering,
// empty dark centre where the athlete photo will sit. Card aspect ~3:4.
// ---------------------------------------------------------------------------
const CARD_HARD = [
  ``,
  `Hard requirements:`,
  `- Vertical trading-card format, 3:4, the ENTIRE design is the ornamental border`,
  `  frame itself.`,
  `- The centre of the card is a large EMPTY panel of near-black matte darkness —`,
  `  the athlete photo drops in there later. Nothing overlaps it.`,
  `- Absolutely NO words, letters, numbers, logos or monograms anywhere. Every`,
  `  plaque, ribbon and stamp area is BLANK, ready for typography.`,
  `- The border keeps a clean straight rectangular OUTER edge — print-safe, no`,
  `  die-cut silhouette, ornament lives inside the rectangle.`,
  `- Physically plausible premium print finishes: embossed metallic foil, spot`,
  `  gloss, letterpress depth. Photorealistic macro render, sharp, print quality.`,
].join("\n");

const cardFrames: Record<string, string> = {
  // 1 — laurel + plaque: the classic "commemorative" limited card.
  "card-frame-laurel": [
    `A premium trading-card FRAME design: SENIOR NIGHT commemorative edition.`,
    ``,
    `An embossed champagne-gold foil frame on a near-black matte card. Crisp double`,
    `bevelled gold border lines run around the card. At the bottom, two small`,
    `engraved gold laurel branches sweep inward from the corners toward a blank`,
    `rectangular gold plaque for the name. At the top, a slim blank ribbon banner.`,
    `In the bottom-right corner, a small round embossed foil seal — blank — like a`,
    `limited-edition serial stamp. Subtle gold guilloché filigree in the corners.`,
    ``,
    `Elegant, ceremonial, understated — a commemorative award turned trading card.`,
    CARD_HARD,
  ].join("\n"),

  // 2 — marquee bulbs: "night" made literal, instantly unique on a shelf.
  "card-frame-marquee": [
    `A premium trading-card FRAME design: SENIOR NIGHT marquee edition.`,
    ``,
    `A deep near-black card whose border is a slim theatre-marquee frame: a single`,
    `row of tiny warm-white glowing round bulbs embedded in a brushed champagne-gold`,
    `metal rail running around the card edge, their light softly blooming onto the`,
    `black centre panel. The corners of the rail are gently stepped like an art-deco`,
    `marquee. At the bottom, the rail widens into a blank gold nameplate lit by the`,
    `bulbs above it.`,
    ``,
    `Warm, glowing, celebratory — the big night, the name in lights.`,
    CARD_HARD,
  ].join("\n"),

  // 3 — rafter banner: the card IS the retired-jersey banner.
  "card-frame-banner": [
    `A premium trading-card FRAME design: SENIOR NIGHT rafter-banner edition.`,
    ``,
    `A near-black card designed to read as a championship banner hanging in arena`,
    `rafters: across the top edge runs a champagne-gold hanging rod with small`,
    `embossed grommet rings, from which the inner panel appears to hang as heavy`,
    `stitched fabric with a fine visible weave and a gold stitched border. The`,
    `bottom edge finishes in a subtle wide V swallowtail pennant shape STITCHED into`,
    `the flat card — the card's outer edge itself stays a straight rectangle. A`,
    `blank gold-stitched plaque area sits at the bottom of the banner.`,
    ``,
    `Reverent and iconic — a jersey retired to the rafters, as a card.`,
    CARD_HARD,
  ].join("\n"),

  // 4 — diploma: senior year IS graduation — engraved certificate border + seal.
  "card-frame-diploma": [
    `A premium trading-card FRAME design: SENIOR NIGHT graduate edition.`,
    ``,
    `A near-black card framed like a fine engraved diploma or banknote: an intricate`,
    `champagne-gold guilloché border of fine engraved line-work running around the`,
    `card, with ornate engraved corner rosettes. In the bottom-right corner sits an`,
    `embossed gold foil seal — blank, with two short pleated gold ribbon tails —`,
    `like a certification seal on a diploma. Along the bottom edge, a blank engraved`,
    `panel for the name.`,
    ``,
    `The class-of graduation certificate meets a premium trading card — official,`,
    `earned, once-in-a-lifetime.`,
    CARD_HARD,
  ].join("\n"),
};

console.log(`model ${MODEL}`);
const jobs: Array<[string, string, string]> = [
  ...Object.entries(variants).map(([n, p]) => [n, p, "2:3"] as [string, string, string]),
  ...Object.entries(cardFrames).map(([n, p]) => [n, p, "3:4"] as [string, string, string]),
];
for (const [name, prompt, aspect] of jobs) {
  const out = join(OUT, `${name}.png`);
  if (existsSync(out)) {
    console.log(`skip ${name} (exists)`);
    continue;
  }
  try {
    const r = await generateImage({ prompt, aspectRatio: aspect, imageSize: "2K", tag: `senior-night/${name}` });
    writeFileSync(out, r.image);
    writeFileSync(out.replace(/\.png$/, ".json"), JSON.stringify({ model: MODEL, generatedAt: new Date().toISOString(), prompt }, null, 2));
    console.log(`ok   ${out} (${(r.image.length / 1024) | 0} KB)`);
  } catch (e) {
    console.log(`FAIL ${name}: ${(e as Error).message}`);
  }
}
