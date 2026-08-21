// Sport descriptors for the art pipeline.
//
// A sport only ever changes the SURFACE the set stands on plus a few background
// props. It never changes the finish material. Slugs match the sport->slug map in
// app/site-client.tsx and the sports list in app/site-config.ts.

export interface Sport {
  slug: string;
  /** Label as shown on the site. */
  name: string;
  /** Code used in card IDs (GDE-<style>-<SPORT>-<season>-<number>). */
  code: string;
  /**
   * Line geometry ONLY — no material, no colour words. Studio finishes etch this
   * into their own floor, so anything material-ish here fights surfaceTreatment.
   */
  markings: string;
  /** The real-world surface material. Only arena finishes ever use it. */
  material: string;
  /** Background props/architecture that read as this sport, kept far back and dim. */
  props: string;
  /**
   * Real-world size of the prop. Without this the model inflates it to fill the
   * frame — a soccer goal came out three storeys tall. Give it a human yardstick.
   */
  propScale: string;
  /**
   * Where the prop belongs. "centre" for equipment used in the middle of play — a net,
   * a beam, starting blocks. "offset" for things at the edge of the field — a backstop,
   * uprights, seating. One global "off to one side, far back" rule put volleyball and
   * tennis nets against the back wall, which is wrong.
   */
  propPlacement: "centre" | "offset";
  /**
   * Some sports have no line geometry to etch — golf is grass and a hole, swimming is
   * water. For these the real material is used even on a studio set (graded to fit),
   * because "etch the markings into the floor" is meaningless.
   */
  needsRealSurface?: boolean;
  /** Sport-specific camera direction, when the default three-quarter view fails it. */
  cameraNote?: string;
  /**
   * What KIND of venue this sport is actually played in. Every finish reference is an
   * indoor arena bowl, so without this every sport inherited one — and an outdoor sport
   * dropped inside a roofed arena reads as illogical: a baseball diamond, a golf hole and
   * a running track are not arena sports and a ballpark is not shaped like a basketball
   * bowl. "indoor" keeps the reference's own venue; "stadium" opens the roof to sky;
   * "open" removes the bowl entirely.
   */
  venue: "indoor" | "stadium" | "open";
  /** Extra architecture that makes this sport's venue read correctly. */
  venueNote?: string;
  /**
   * How the markings, the equipment and the camera must RELATE to each other. Scale and
   * placement checks alone passed frames that were geometrically nonsense: a baseball
   * backstop on the far side of the diamond, a tennis net that did not sit on any line of
   * the court under it, a lacrosse goal parked on the centre circle with no crease. One
   * sentence, naming what stands on what, facing which way, seen from where.
   */
  layout: string;
  /** Canonical from-behind action for the card-back shot. */
  backPose: string;
  /** Gear worn in the from-behind shot. */
  gear: string;
  /**
   * Where this sport is actually played and trained, as a parent would name it when
   * describing their own photo. The "before" snapshot scenarios were written in soccer
   * nouns — pitch, touchline, kick-off, a goal at the far end — and for basketball that
   * produced a boy playing FOOTBALL in the training frame. A scenario may not carry a
   * venue word of its own; it takes this one.
   */
  place: string;
  /**
   * Kit items beyond the basic five the flat lay always asks for (shirt, shorts, socks,
   * shoes, ball). Football wears a helmet and shoulder pads; without naming them the plate
   * simply leaves them out, and then the poses invent a helmet on every roll.
   */
  plateItems?: string;
  /**
   * ONE GARMENT, NOT TWO. A singlet, a leotard and a competition swimsuit are single
   * garments; the plate's default item list asks for "the shirt" and "the shorts below it",
   * and a flat lay told to produce both will invent a two-piece kit that does not exist.
   * Set this to the sentence describing the single garment; leave it unset for normal kits.
   */
  onePiece?: string;
}

export const SPORTS: Sport[] = [
  { slug: "basketball", name: "Basketball", code: "BKB",
    place: "an indoor basketball court",
    markings: "the painted key, three-point arc, centre circle and sideline geometry of a basketball court",
    material: "polished hardwood",
    props: "a basketball hoop and backboard",
    propScale: "the rim is 3 m up, the backboard only 1.8 m wide — about one person tall",
    propPlacement: "centre",
    venue: "indoor",
    layout:
      "the hoop stands at the far end of the court with its backboard centred on the painted key, the key and free-throw circle running back towards it, and the centre circle lying mid-court in front of it",
    backPose: "rising for a jump shot, ball above the head, both arms extended",
    gear: "basketball jersey and shorts, high-top sneakers, basketball" },
  { slug: "football", name: "Football", code: "FTB",
    place: "an American football field",
    plateItems: "the HELMET, seen from the side with its facemask, and the SHOULDER PADS — the pads are their own separate item, laid flat on the surface in the empty space ABOVE the shirt in the picture, complete with both arched shoulder caps, never tucked inside or underneath the shirt",
    markings: "white yard lines with their painted yard numbers, two rows of hash marks and the end-zone boundary geometry of an American football field",
    material: "mown green turf",
    props: "American football goal-post uprights — one post rising from the ground into a horizontal crossbar, with two tall vertical posts rising from the ends of that crossbar, forming an open tuning-fork shape in bright yellow-gold. There is NO net, NO mesh and NO goal frame anywhere on or under it: football goalposts are completely open and nothing is strung between them",
    propScale: "the uprights are slim, the crossbar 3 m up — roughly two people tall",
    propPlacement: "centre",
    venue: "stadium",
    venueNote:
      "a large open-air football stadium: steep tiered stands running down both sidelines, tall floodlight masts at the corners, the field sunk in the middle of the bowl",
    layout:
      "the uprights stand ON the end line at the FAR end of the field, centred across the field width, crossbar horizontal and square to the camera, small with distance; the yard lines run across the field, perpendicular to the sidelines, and the hash marks sit in two rows between them",
    backPose: "cocked back mid-throw, football in the raised hand",
    gear: "American football helmet, shoulder pads, jersey, cleats" },
  { slug: "baseball", name: "Baseball", code: "BSB",
    place: "a baseball diamond",
    plateItems: "the CAP face up, and the BAT laid diagonally in the empty space beside the kit — both their own separate items, never on top of another garment",
    markings: "the five-sided home plate, a narrow rectangular batter's box on each side of it, the catcher's box behind, and two chalk foul lines leaving the plate at a right angle and running away in opposite directions. The home plate and BOTH batter's boxes sit on the bare DIRT of the home-plate circle, and the grass only begins BEYOND them further from camera — never the plate and boxes painted onto grass with dirt behind them, which is the wrong way round. The dirt is shaped like a real infield: a circle of bare dirt around home plate, a separate small dirt circle for the pitcher's mound out in the grass, and a curving dirt base-path arc between them — never one large dirt disc. The two chalk foul lines leave home plate at a RIGHT ANGLE to each other and run straight out past the left and right frame edges. Exactly ONE home plate and ONE pitcher's mound appear in the frame.",
    material: "cut dirt meeting manicured grass",
    props: "the backstop behind home plate — a TALL net hung on upright poles that CURVES round behind the plate, with a low padded wall along its base. It is a high wrapping barrier, never a flat rectangular panel and never a small free-standing screen parked out in the field It stands WELL BACK from home plate — roughly 18 m behind it, about the same distance again as from the plate to the pitcher's mound — so there is clear open ground between the plate and the netting, and the plate with its two batter's boxes reads fully, never tucked under or overlapped by the backstop.",
    propScale: "the backstop stands 3-4 m high — about twice the height of a person, clearly taller than it is wide at the plate end",
    propPlacement: "centre",
    venue: "stadium",
    venueNote:
      "a real BALLPARK, not a symmetrical bowl: the stands wrap only around the infield behind home plate and down the two foul lines, and beyond the diamond the outfield opens out to a distant outfield wall under open sky",
    layout:
      "the shot is taken from the PITCHER'S side and reads front-to-back in this order: the pitcher's mound with its white rubber sits closest to camera at the bottom of the frame; beyond it the batting area — home plate flanked by its two batter's boxes and the catcher's box — sits in the mid-distance; and directly behind that stands the backstop, square to camera. The two foul lines leave the plate at a right angle and run out past the left and right frame edges",
    cameraNote:
      "stand on the pitcher's mound looking straight in at home plate: the mound and its rubber are the nearest thing in frame, the batting markings are the middle of the picture, and the backstop closes the background behind them",
    backPose: "mid-swing follow-through, bat wrapped around the shoulders",
    gear: "baseball uniform, batting helmet, bat, cleats" },
  { slug: "softball", name: "Softball", code: "SFB",
    place: "a softball diamond",
    plateItems: "the VISOR face up, the BAT laid diagonally in the empty space beside the kit, and the fielding GLOVE laid open face up — each its own separate item, never on top of another garment",
    markings: "the five-sided home plate, a narrow rectangular batter's box on each side of it, the catcher's box behind, and two chalk foul lines leaving the plate at a right angle and running away in opposite directions — and no circles of any kind The home plate and BOTH batter's boxes sit on the bare DIRT of the home-plate circle, and the grass only begins BEYOND them further from camera — never the plate and boxes painted onto grass with dirt behind them, which is the wrong way round. The dirt is shaped like a real infield: a circle of bare dirt around home plate, a separate pitching circle out in the grass, and a curving dirt base-path arc between them — never one large dirt disc. The two chalk foul lines leave home plate at a RIGHT ANGLE to each other and run straight out past the left and right frame edges. Exactly ONE home plate appears in the frame.",
    material: "cut dirt meeting manicured grass",
    props: "the backstop behind home plate — a TALL net hung on upright poles that CURVES round behind the plate, with a low padded wall along its base — and a low outfield fence far beyond. Never a flat rectangular panel and never a small free-standing screen out in the field It stands WELL BACK from home plate — roughly 18 m behind it, about the same distance again as from the plate to the pitcher's mound — so there is clear open ground between the plate and the netting, and the plate with its two batter's boxes reads fully, never tucked under or overlapped by the backstop.",
    propScale: "the backstop stands 3-4 m high — about twice the height of a person",
    propPlacement: "centre",
    venue: "stadium",
    venueNote:
      "a softball park: modest tiered stands wrapping behind home plate and down the foul lines, a chain-link outfield fence beyond the infield, open sky above",
    layout:
      "the shot is taken from the PITCHER'S side and reads front-to-back in this order: the pitching circle and its rubber sit closest to camera at the bottom of the frame; beyond it the batting area — home plate flanked by its two batter's boxes and the catcher's box — sits in the mid-distance; and directly behind that stands the backstop, square to camera. The foul lines leave the plate at a right angle and run out past the left and right frame edges",
    cameraNote:
      "stand in the pitching circle looking straight in at home plate: the circle and its rubber are the nearest thing in frame, the batting markings are the middle of the picture, and the backstop closes the background behind them",
    backPose: "mid windmill pitch, throwing arm at the top of the circle",
    gear: "softball uniform, visor, glove, cleats" },
  { slug: "soccer", name: "Soccer", code: "SOC",
    place: "a soccer pitch",
    markings: "the penalty box, goal area, centre circle and touchline geometry of a soccer pitch",
    material: "striped mown grass",
    props: "a soccer goal with its net",
    propScale: "a goal is only 2.44 m tall and 7.32 m wide — barely taller than one person, so at this distance it is SMALL in frame",
    propPlacement: "centre",
    venue: "stadium",
    venueNote:
      "a large open-air football stadium: continuous tiered stands ringing the pitch, floodlight masts at the corners, open sky above the pitch",
    layout:
      "the goal stands ON the goal line, centred inside the six-yard box, with the penalty box and its arc drawn around it on the near side and the touchlines running out past the frame edges",
    backPose: "striking the ball mid-stride, plant foot down, kicking leg swung through",
    gear: "soccer kit, shin guards, soccer cleats, soccer ball" },
  { slug: "ice-hockey", name: "Ice Hockey", code: "ICH",
    place: "an ice rink",
    markings: "faceoff circles with hash marks, the centre line, blue lines and goal-crease geometry of a hockey rink",
    material: "a sheet of polished white ICE with fine skate scoring across it — real frozen ice, never wooden boards, never parquet and never a painted floor",
    props: "a hockey goal with its net, dasher boards and rink glass running behind it",
    propScale: "a hockey goal is only 1.22 m tall — waist-to-chest height on an adult, so it is small in frame",
    propPlacement: "centre",
    // Ice is the sport. Without this a studio finish keeps its own wooden arena floor and
    // paints hockey lines onto parquet.
    needsRealSurface: true,
    venue: "indoor",
    layout:
      "the goal stands ON the goal line inside its crease, mouth facing the camera, with the dasher boards and glass curving behind it, and the faceoff circles and blue line lying on the ice in front of it",
    backPose: "winding up for a slapshot, stick raised behind the shoulder",
    gear: "hockey helmet, gloves, padded jersey, hockey stick, skates" },
  { slug: "volleyball", name: "Volleyball", code: "VBL",
    place: "an indoor volleyball court",
    plateItems: "BOTH KNEE PADS laid side by side below the shorts — their own separate items, never on a leg and never under another garment",
    markings: "the attack lines, centre line and boundary geometry of a volleyball court",
    material: "indoor taraflex sports flooring",
    props: "the volleyball net on its posts, spanning the court",
    propScale: "the net sits about 2.3 m up — just above head height",
    propPlacement: "centre",
    venue: "indoor",
    layout:
      "the net spans the FULL width of the court on the centre line, its two posts standing just outside the sidelines, the net square to the camera, with the attack lines drawn parallel to it on both sides",
    backPose: "at the top of a spike jump, hitting arm cocked, ball above",
    gear: "volleyball jersey and spandex, knee pads, court shoes, volleyball" },
  { slug: "lacrosse", name: "Lacrosse", code: "LAX",
    place: "a lacrosse field",
    plateItems: "the CROSSE (lacrosse stick) laid diagonally in the empty space beside the kit with its head and net clearly visible, and the head protection this athlete's kit calls for — GOGGLES for the women's game, a full helmet for the men's — each its own separate item, never on top of another garment",
    markings: "the round goal crease — a SMALL ring hugging the goal, barely three times the goal's own width, never a large circle spanning the field — with the end line running behind it, the sidelines running out past the frame edges, and a straight restraining line running right across the field in front of the crease. There is no centre circle anywhere and no box around the goal",
    material: "mown green turf",
    props: "a lacrosse goal — white netting on a plain pale-grey metal frame, never an orange or coloured frame",
    propScale: "a lacrosse goal is only 1.8 m tall and 1.8 m wide — a single person could stand in its mouth. Set well back it is SMALL in frame, the same size a soccer or hockey goal reads at that distance; it must never fill or dominate the centre of the shot",
    propPlacement: "centre",
    venue: "stadium",
    venueNote:
      "an open-air field stadium: tiered stands down both sidelines, floodlights above, open sky over the turf",
    layout:
      "unlike soccer or hockey the lacrosse goal does NOT stand on the end line — it sits well INSIDE the field, centred in the attack area with playable ground behind it, standing in the middle of its round crease. It FACES THE CAMERA: the open mouth and the front crossbar are turned towards the viewer and the net tapers AWAY from camera behind it — never the reverse, never the back of the net towards the viewer. Small with distance; the end line runs behind it and the restraining line crosses the field in front of it, with open ground between the camera and the crease",
    backPose: "mid shooting motion, crosse cocked behind the head",
    gear: "lacrosse helmet, gloves, jersey, crosse stick, cleats" },
  { slug: "wrestling", name: "Wrestling", code: "WRS",
    place: "a wrestling room with mats down",
    onePiece: "the SINGLET — one single garment, a sleeveless one-piece that covers the torso and the thighs together, laid flat and face up. There is NO separate shirt and NO separate shorts",
    plateItems: "the HEADGEAR (ear guards with its chin strap) and the KNEE PAD — each its own separate item, never on top of another garment",
    markings: "the real geometry of a wrestling mat: one large 9-metre out-of-bounds CIRCLE marked on a square mat, a contrasting one-metre-wide passivity band running just inside that circle, a small one-metre starting circle at the very centre, and two short straight starting lines inside that centre circle. Concentric circles only — absolutely no basketball key, no free-throw circle, no three-point arc, no rectangular painted lane",
    material: "a matte rolled wrestling mat",
    props: "empty gym bleachers",
    propScale: "bleachers are low, a few rows only",
    propPlacement: "offset",
    venue: "indoor",
    layout:
      "the wrestling mat is a SQUARE MAT LYING ON THE VENUE FLOOR — it does not cover the whole floor. Its edges are visible and there is plenty of bare venue floor around it on every side. The centre circle sits in the middle of the frame with the out-of-bounds ring around it. The bleachers stand BEYOND the mat's far edge, further back from camera, with their feet on the bare floor behind the mat — there is clear empty floor between the back edge of the mat and the front legs of the bleachers, and nothing rests on the mat itself",
    backPose: "in a low athletic stance, arms out, ready to shoot",
    gear: "wrestling singlet, headgear, wrestling shoes" },
  { slug: "cheerleading", name: "Cheerleading", code: "CHR",
    place: "a cheer gym with tumbling mats",
    markings: "a large square competition mat made of parallel taped panel strips running away from the camera, with a bold taped border framing the whole square — no circles and no arcs. The exact number of strips does not matter",
    material: "a matte performance mat",
    props: "empty arena seating",
    propScale: "seating is low, a few rows only",
    propPlacement: "offset",
    venue: "indoor",
    layout:
      "the competition mat is a SQUARE MAT LYING ON THE VENUE FLOOR — it does not cover the whole floor. Its taped border and its edges are clearly visible, with bare venue floor all around it. The panel strips run away from camera. The seating stands BEYOND the mat's far edge, further back from camera, feet on the bare floor behind the mat — clear empty floor separates the mat's back border from the front legs of the seating, and nothing rests on the mat itself",
    backPose: "arms in a sharp high V, mid-routine, on the toes",
    gear: "cheer uniform, bow, cheer sneakers, pom-poms" },
  { slug: "gymnastics", name: "Gymnastics", code: "GYM",
    place: "a gymnastics gym",
    markings: "a twelve-metre square floor-exercise area outlined by a bold boundary line, with a second warning line inset just inside it and the sprung-panel seams forming a faint grid — no circles and no arcs",
    material: "a sprung floor dusted with chalk",
    props: "a balance beam with uneven bars beyond it — well-maintained competition apparatus in good condition: the beam padded and covered in clean suede, the bars smooth and polished on straight steel frames with taut tensioning cables. Never rusted, splintered, warped or antique-looking",
    propScale: "a beam stands 1.25 m off the floor — knee-to-waist height",
    propPlacement: "centre",
    venue: "indoor",
    layout:
      "the beam stands inside the taped floor square, running left-to-right across the frame rather than pointing at the camera, with the uneven bars set behind and beside it, all legs on the floor",
    onePiece: "the LEOTARD — one single garment, a long-sleeved one-piece that covers the torso and fastens between the legs, laid flat and face up, with high-cut leg openings. There is NO separate shirt, NO separate shorts and NO tights",
    backPose: "arms raised in a finished salute pose, back arched",
    gear: "gymnastics leotard, chalked hands, bare feet" },
  { slug: "track-field", name: "Track & Field", code: "TRK",
    place: "a running track",
    markings: "curving lane lines and start-line geometry of a running track",
    material: "red synthetic track surfacing",
    props: "starting blocks set in the lanes on the start line, with a single track hurdle standing across a lane further down the same straight — a slim L-shaped frame carrying one solid horizontal top bar, with NO net, NO mesh and NO fabric panel of any kind; it must never look like a goal",
    propScale: "a hurdle is under 1 m, blocks are ankle height",
    propPlacement: "centre",
    venue: "stadium",
    venueNote:
      "a full open-air athletics stadium: the oval track ringing a green infield, tiered stands rising all the way round, floodlight masts, open sky above — never an enclosed indoor track",
    cameraNote:
      "stand in a lane on the home straight, level with the start line, looking straight down the track: the lanes must read as parallel straight lines running away from the viewer, never a curve sweeping across the frame. Tilt up enough that OPEN SKY is clearly visible above the far stands — this is an open-air athletics stadium, so there must be no roof, no ceiling and no overhead lighting truss anywhere in the frame",
    layout:
      "the camera looks straight down the HOME STRAIGHT: the lane lines run away from the viewer dead straight and parallel, never bending across the frame, with the white start line crossing them at a right angle. The starting blocks sit ON that start line inside the lanes, facing away from camera down the track. A single hurdle stands squarely ACROSS one of those same lanes further down the straight, its feet ON the track surface and never out on the grass. The bend and the green infield are visible only beyond, so the running direction is unmistakable",
    backPose: "exploding out of the blocks, mid drive phase",
    gear: "track singlet and briefs, spikes" },
  { slug: "swimming", name: "Swimming", code: "SWM",
    place: "an indoor swimming pool",
    markings: "black lane lines on the pool bottom, each ending in the standard cross T near the wall, seen through the water, with floating lane ropes above them",
    material: "a competition swimming pool full of still water",
    props: "the starting blocks at the far end of the pool",
    propScale: "starting blocks are half a metre above the water",
    propPlacement: "centre",
    needsRealSurface: true,
    cameraNote: "the pool runs lengthwise away from camera, seen from one end at water level; the starting blocks stand at the FAR end",
    venue: "indoor",
    layout:
      "the pool runs lengthwise away from the camera, the lane ropes and the black lane lines under the water running straight away in parallel, and the starting blocks standing in a row on the deck at the FAR end, facing back towards the camera",
    backPose: "on the blocks in a dive crouch, arms swept back",
    gear: "competition swimsuit, swim cap, goggles" },
  { slug: "tennis", name: "Tennis", code: "TEN",
    place: "a tennis court",
    markings: "the service boxes, centre mark and baseline geometry of a tennis court",
    material: "blue hard court with a green surround",
    props: "the tennis net spanning the court, with a tall umpire chair standing off the court entirely on the surround",
    propScale: "the net is under 1 m at the centre; the umpire chair about 2.5 m",
    propPlacement: "centre",
    venue: "stadium",
    venueNote:
      "an open-air tennis show court: tiered stands rising close on both sides of the court, open sky overhead, floodlight masts at the corners",
    layout:
      "the net spans the FULL width of the court on the centre line, posts just outside the doubles sidelines, square to the camera, with the service boxes and centre mark drawn on the near half; the umpire chair stands entirely OFF the court on the surround beyond the sideline, level with one net post and outside the outermost line — its legs must never touch the court surface or stand between the lines",
    backPose: "mid serve, racket dropped behind the back, ball tossed above",
    gear: "tennis kit, wristband, tennis racket, court shoes" },
  { slug: "golf", name: "Golf", code: "GLF",
    place: "a golf practice range",
    markings: "the curved mown edge of a putting green, its cup, and mow-stripe banding",
    material: "a manicured putting green of short grass, fairway and a bunker edge beyond it",
    props: "the flagstick standing in the green",
    propScale: "the flagstick is about 2 m — one person tall",
    propPlacement: "centre",
    needsRealSurface: true,
    cameraNote:
      "the putting green fills the whole lower half of the frame and runs right up to the " +
      "camera, so the grass is the surface the viewer stands on — never a distant lawn seen " +
      "through the set, and never a landscape framed in an opening at the back",
    venue: "open",
    venueNote:
      "a real golf course in open countryside: NO stadium, NO stands, NO roof and no built structure at all — rolling fairway, trees or dunes along the horizon, and wide open sky",
    layout:
      "the putting green fills the foreground with its cup, the flagstick standing IN the cup, and the mow-stripe banding curving with the green's edge; the fairway and a bunker edge lie beyond it",
    backPose: "at the top of the backswing, club wrapped behind the shoulders",
    gear: "golf polo, cap, glove, golf club" },
  { slug: "pickleball", name: "Pickleball", code: "PKB",
    place: "a pickleball court",
    markings: "the geometry of a pickleball court: a small rectangle with the non-volley kitchen zone marked as a band on both sides of the net, two service boxes behind it split by a centre line, and the baseline closing the end — a compact court only about a quarter the size of a tennis court",
    material: "a painted hard court — smooth concrete or asphalt paving with its colour coating, never wooden boards and never grass",
    props: "the pickleball net spanning the court — a LOW net, clearly lower than a tennis net",
    propScale: "the net is only 0.86 m at the centre — knee-to-hip height on an adult, noticeably lower and shorter than a tennis net, and the whole court is about a quarter the size of a tennis court. This must never read as tennis",
    propPlacement: "centre",
    // Pickleball is played on a PAVED court. Without this it inherits the finish's own
    // indoor floor and lands on wooden parquet, which is never a pickleball surface.
    needsRealSurface: true,
    venue: "indoor",
    layout:
      "the net spans the FULL width of the court on the centre line, posts just outside the sidelines, square to the camera, with the kitchen zone drawn immediately on both sides of it",
    backPose: "mid overhead smash, paddle raised behind the head",
    gear: "athletic kit, pickleball paddle, court shoes" },
  { slug: "other-sport", name: "Other Sport", code: "OTH",
    place: "a sports hall",
    markings: "a plain rectangular court outline with a single halfway line across it and nothing else — no painted key, no three-point arc, no centre circle, no hexagons",
    material: "a polished neutral sports floor",
    props: "",
    propScale: "",
    propPlacement: "offset",
    venue: "indoor",
    layout:
      "the court outline runs out past the frame edges and the playing area is completely bare — no equipment of any kind stands on it or beside it",
    backPose: "standing tall, arms at the sides, heroic stance",
    gear: "generic athletic jersey and shorts, training shoes" },
];

export const sportBySlug = (s: string) => SPORTS.find((x) => x.slug === s);
