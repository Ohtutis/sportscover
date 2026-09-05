// The four poses every athlete needs, and why it is exactly four.
//
// The number is not a guess — it is dictated by the layouts that already exist in Figma:
//
//   hero    -> `#photo_main`  / `GDE_*_Cutout_Hero_PNG`   poster + card front, full opacity
//   action2 -> `#photo_2`     / `GDE_*_Cutout_Pose2_PNG`  supporting, muted ~0.45 opacity
//   action3 -> `#photo_3`     / `GDE_*_Cutout_Pose3_PNG`  supporting, muted ~0.45 opacity
//   back    -> the card BACK from-behind shot (`#back_photo`)
//
// The three front poses are the brand's "athlete edit" trio, so they must differ by CAMERA,
// not just by limb position: three photographs of the same stance from the same height read
// as one photo pasted three times. Hence `camera` is its own field and every sport's three
// front poses must use three different ones.
//
// The back pose is generated as a CUTOUT here, not composited into a set like the older
// `backShotPrompt` in prompts.ts does. A cutout drops onto all six finishes; a baked-in
// set has to be re-generated per finish and re-approved six times.
//
// NOTE ON THIS FILE'S HISTORY: it was destroyed once (2026-08-21) not by a bad edit but by
// a bad WRITE — `open(path, "w")` truncates the file the moment it opens, and the write's
// argument then raised, leaving zero bytes. It was rebuilt from the conversation and the
// prompt sidecars (every generated PNG's .json carries the full prompt it was built from,
// which is what made the rebuild exact). If you script edits to this file: compute the new
// content COMPLETELY, then open for writing — never evaluate anything inside the write call.

import type { Sport } from "./sports.js";

export interface Pose {
  id: "hero" | "action2" | "action3" | "back";
  /** Where this lands in the layouts — kept here so nobody "simplifies" the set to three. */
  role: string;
  /** What the body does. */
  action: string;
  /** Camera angle, height and lens. Must differ across the three front poses. */
  camera: string;
  /**
   * WHICH WAY THE ATHLETE FACES, and where they sit in the composite.
   *
   * The three front cutouts are assembled into ONE poster: the hero in the centre at full
   * opacity, the two supporting poses flanking it at ~0.45. If both supports face the same
   * way, or face outwards, the composition falls apart — they have to lean INTO the hero.
   * The camera field settles the angle; it never settled the direction, so the model chose,
   * and it chose differently each time.
   *
   * HOW TO WRITE IT (§30 of the README, learned twice): state the GEOMETRY — which edge of
   * the frame the athlete is working towards, and which shoulder is therefore nearest the
   * lens — plus the side of the composite the frame lands on. Naming limbs alone is not
   * enough (football's two supports both named the RIGHT shoulder as leading and faced the
   * same way), and never write a support's facing as a comparison with its sibling: the
   * model cannot see the other prompt.
   */
  facing: string;
  /** Where the equipment is, stated so it is neither cropped nor waved out of frame. */
  equipment: string;
  /** The checkable part — what the frame must contain for this pose to be usable. */
  mustShow: string;
}

export const POSES: Record<string, Pose[]> = {
  "ice-hockey": [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      // ENERGY COMES FROM MECHANICS. Motion blur, ice spray and snow are all banned here —
      // the frame is cut out, so it must be sharp and the matte must survive its edges. What
      // is left is a body caught at a moment it could not hold: the back skate still pushing,
      // the weight thrown forward past the front one, the torso turned against the arms.
      action:
        "driving straight at the camera in a hard forward skate — caught at the instant the " +
        "BACK skate is still pushing, its blade angled and the leg extended behind, while the " +
        "front knee is driven up and the front skate is just landing. The weight is thrown " +
        "FORWARD past that front skate, chest low and leading, shoulders turned against the " +
        "arms so one is closer to the camera than the other, the stick carried low in both " +
        "hands across the body. Chin down, eyes up into the lens under the brow, jaw set. " +
        "This is a skater ACCELERATING at you, not a skater posing for a photograph",
      camera:
        "eye level, straight-on three-quarter turn of the body, 85 mm lens at f/2.8, " +
        "full body from a couple of metres back",
      equipment:
        "the stick is held across the body with the blade down near the front skate, " +
        "entirely inside the frame, not pointing at the camera; the helmet has a clear " +
        "flat visor rather than a full cage, so the face is not hidden behind a grille",
      facing: "facing the camera; this one sits in the CENTRE of the composite",
      mustShow:
        "the whole athlete from the top of the helmet to below the skate blades, face " +
        "clearly visible and sharp, both hands on the stick, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      action:
        "at the top of a slapshot wind-up seen from the side, stick raised high behind the " +
        "shoulder, back leg loaded, torso coiled away from the camera",
      camera:
        "side profile, camera slightly below chest height, 50 mm lens, full body",
      // §30: which edge he is working towards, and which shoulder is therefore nearest the
      // lens. "In profile facing RIGHT" is a direction word, and a wind-up description turns
      // the body on its own — so the word loses and the two supports end up facing the same
      // way, both leaning out of the composite.
      facing:
        "SHOOTING TOWARDS THE RIGHT EDGE OF THE FRAME: the camera sees his RIGHT side, so the " +
        "right shoulder and the right skate are the ones nearest the lens, and his head and " +
        "eyes follow the shot out to the right. The LEFT hand is at the top of the shaft and " +
        "the RIGHT hand lower down it, the stick raised high behind the RIGHT shoulder, the " +
        "weight loaded onto the BACK skate. This frame is placed on the LEFT of the " +
        "composite, so every line in it leans INTO the centre",
      // NEVER tell the model to soften the pose to fit the frame. The first version of this
      // read "shorten the wind-up rather than crop the stick", which contradicts "at the top
      // of a slapshot wind-up" three lines above; the model resolved the contradiction by
      // dropping the wind-up and drawing a plain skating stride. Frame wider instead.
      equipment:
        "the stick is raised high behind the shoulder and the whole of it, blade included, " +
        "is inside the frame — pull the camera back to fit it, never lower the stick",
      mustShow:
        "a clean readable silhouette: raised stick, loaded back leg, both skates on the " +
        "ground, no limb leaving the frame",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      action:
        "a hard hockey stop mid-pivot, both skates turned sideways and edged over, body " +
        "leaning back against the stop, stick held low and out for balance, head turned " +
        "back over the leading shoulder",
      // The mirror of action2, written as its own absolute rather than as a comparison with
      // it — the model cannot see the other prompt, so "the mirror of action2" is not an
      // instruction, and the limb names decide the facing on their own.
      facing:
        "STOPPING AGAINST MOTION THAT WAS CARRYING HIM TOWARDS THE LEFT EDGE OF THE FRAME: " +
        "the camera sees his LEFT side, so the left shoulder and the left skate are the ones " +
        "nearest the lens. Both skates are turned across that line and edged hard over, the " +
        "body leaning BACK against the stop, the head turned back over the LEFT shoulder and " +
        "the stick held low and out to the left for balance. This frame is placed on the " +
        "RIGHT of the composite, so every line in it leans INTO the centre",
      camera: "low camera, close to ice level, tilted up at the athlete, 35 mm lens, full body",
      equipment:
        "the stick is held low and diagonal for balance, blade inside the frame — pull the " +
        "camera back to fit it, never straighten the body to make it fit",
      mustShow:
        "both skates edged over and visible, the lean of the body reading clearly, the " +
        "head turned in profile",
    },
    {
      id: "back",
      // A WIND-UP FROM BEHIND FIGHTS THE ONLY JOB THIS FRAME HAS. The card back exists to show
      // the number across the shoulders, and a raised stick puts an arm, a shoulder and a glove
      // across it — the roll that came back had both arms up beside the number and read as an
      // awkward half-movement rather than a player. Calm and square beats dynamic here.
      role: "card BACK from-behind shot",
      action:
        "seen strictly from behind, standing set and still: feet apart and level, weight even, " +
        "the stick held in both hands low across the front of the body at hip height so neither " +
        "arm crosses the back of the jersey, shoulders square to the camera",
      camera: "eye level, directly behind the athlete, 85 mm lens, full body",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "the stick is held low and across the body, both ends inside the frame; the puck rests " +
        "on the ground beside one skate",
      mustShow:
        "the back of the jersey with the number large and legible across the shoulders, " +
        "the back of the helmet, no part of the face — not in profile, not over a shoulder",
    },
  ],

  // Soccer serves the AGE LADDER as well as the sport-coverage roster, so these four are
  // deliberately age-neutral: every one of them reads the same on a seven-year-old and on a
  // fifty-year-old. That is not a stylistic choice — the ladder holds the sport constant so
  // that age is the only variable, and it would fail just as badly if the POSES moved too.
  // No slide tackles, no bicycle kicks, nothing that only a teenager can do.
  // NUMBER 54 IS A LINEMAN, and the poses have to know that. sports.ts carries a generic
  // `backPose` of "cocked back mid-throw, football in the raised hand" — a quarterback. In
  // American football the 50-79 numbers are linemen, and this athlete's own record describes
  // a lineman's body ("thick neck, deep chest... NOT lean"). A throwing pose on that body is
  // the same class of error as putting a footballer in the basketball frame: it is not the
  // rendering that is wrong, it is the research.
  //
  // THE HELMET IS THE OTHER PROBLEM. It covers the face, and this is a personalised card —
  // the whole product is that a parent recognises their own child. So the hero carries the
  // helmet rather than wearing it, which is also exactly how real football portraits are
  // shot. The two supports are muted to ~0.45 in the layout, so a helmeted silhouette there
  // costs nothing and reads instantly as the sport.
  football: [
    // THE ENERGY HAS TO COME FROM THE BODY, because the frame is not allowed to blur.
    // This pose read "walking off the field", and the model drew exactly that: a man standing
    // between two steps, arms hanging, helmet dangling — technically mid-stride and completely
    // static. Every route to energy that a photographer would use is banned here for good
    // reasons: no motion blur (the cutout has to be sharp), no flying turf (the matte has to
    // survive), no crowd, no floor. What is left is MECHANICS — a body caught at a moment it
    // could not hold. So the pose names the moment: back heel driving off the ground, front
    // knee up, torso rotated against the arms, weight thrown forward past the front foot. A
    // figure leaning further forward than balance allows reads as moving even when every pixel
    // of it is sharp.
    //
    // And it is a LINEMAN's energy, not a sprinter's: mass moving forward, low and square. The
    // athlete's own training photograph is him driving into a blocking sled, which is the shape
    // this frame is after.
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "coming straight at the camera and closing on it — caught at the instant the back leg " +
        "is driving, that heel well off the ground and the toe still pushing, the front knee " +
        "lifted and the front foot just landing. The whole body is thrown FORWARD past the " +
        "front foot, chest low and leading, shoulders rolled forward and turned against the " +
        "swing of the arms so one shoulder is closer to the camera than the other. The free " +
        "arm is swung up across the chest with the hand in a loose fist; the other arm is " +
        "swung back behind the hip carrying the HELMET by the facemask. Chin dropped, eyes " +
        "up into the lens under the brow, jaw set, breathing hard. This is a big man ACCELERATING " +
        "at you and about to break into a run — not a man standing between two steps",
      camera:
        "just below eye level, straight-on with the body turned slightly, tilted a few degrees " +
        "up so he stands over the camera, 85 mm lens at f/2.8, full body from a couple of " +
        "metres back",
      facing:
        "facing the camera and coming at it. This one sits in the CENTRE of the composite, so " +
        "it is square to the viewer and leans neither left nor right — the lean is FORWARD, " +
        "towards the lens",
      equipment:
        "the helmet is CARRIED, not worn — gripped by the facemask in the trailing hand and " +
        "swung back behind the hip with the arm, fully inside the frame. No ball needed in " +
        "this frame",
      mustShow:
        "the whole athlete from the top of the head to below the cleats, THE FACE UNCOVERED, " +
        "clearly visible and sharp, the back heel clearly off the ground and the front knee " +
        "lifted, the forward lean of the torso obvious, the helmet in the trailing hand, " +
        "nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      action:
        "set in a three-point stance seen from the side, HELMET ON: down on the RIGHT hand " +
        "with the knuckles on the ground, back flat and level, hips loaded, head up looking " +
        "across the line",
      camera: "side profile, camera at hip height, 50 mm lens, full body",
      // WHICH WAY, STATED AS GEOMETRY. This said "down on the right hand, right shoulder
      // leading" and nothing about where the body points — and action3 said "right shoulder
      // leading" too, so the two supports named the SAME lead shoulder and duly came back
      // facing the same way, both leaning out of the composite instead of into it. Naming the
      // limbs is necessary and was never sufficient: a limb fixes the anatomy, not the compass.
      // What cannot be misread is the pair of facts that imply each other — which edge of the
      // frame he is driving towards, and which shoulder is therefore nearest the lens.
      facing:
        "DRIVING TOWARDS THE RIGHT EDGE OF THE FRAME: the camera sees his RIGHT side, so the " +
        "right shoulder is the one nearest the lens, and his head, his eyes and the line of " +
        "his back all point right. DOWN ON THE RIGHT HAND — the near hand — with the LEFT " +
        "foot dropped back. This frame is placed on the LEFT of the composite, so every line " +
        "in it leans INTO the centre",
      equipment: "helmet worn. No ball needed in this frame",
      mustShow:
        "a clean readable silhouette: the down hand on the ground, the flat back, both feet " +
        "and the staggered stance visible, the helmet complete with its facemask, nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // A DIFFERENT KIND OF ACTION, not a second angle. action2 is coiled and still; this one
      // is the moment it releases — upright, driving forward, arms out. Loaded and firing are
      // the two things a lineman actually does, and between them they carry the card.
      action:
        "driving forward out of the stance to block, HELMET ON: body rising and leaning into " +
        "the contact, both arms punched out in front at chest height, hands open",
      camera: "low camera close to ground level, tilted up at the athlete, 35 mm lens, full body",
      // The mirror of action2, and written as its own absolute rather than as a comparison
      // with it: "the opposite lean to action2" is a sentence about another prompt the model
      // cannot see, and it obeyed the limb names instead — which named the same lead shoulder.
      // `art:orient` can mirror a frame afterwards, but a flip reverses the number printed on
      // the chest, so on this sport it is a last resort and not the plan.
      facing:
        "DRIVING OUT TOWARDS THE LEFT EDGE OF THE FRAME: the camera sees his LEFT side, so " +
        "the left shoulder is the one nearest the lens, and his head, his eyes and both " +
        "punched-out arms all go left. The LEFT foot is forward and planted, the RIGHT foot " +
        "is pushing off behind. This frame is placed on the RIGHT of the composite, so every " +
        "line in it leans INTO the centre",
      equipment: "helmet worn. No ball needed in this frame",
      mustShow:
        "both arms extended out in front and fully inside the frame, the forward lean clear, " +
        "both feet visible with one driving off the ground, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      action:
        "seen strictly from behind, HELMET ON, standing set with the feet apart and both " +
        "arms held slightly away from the body so nothing crosses the number",
      camera: "eye level, directly behind the athlete, 85 mm lens, full body",
      facing: "seen from directly behind. Used alone on the card back",
      equipment: "helmet worn, its back and the rear of the facemask visible. No ball needed in this frame",
      mustShow:
        "the back of the jersey with the number large and legible across the shoulder pads, " +
        "the back of the helmet, no part of the face — not in profile, not over a shoulder, " +
        "and no arm crossing the number",
    },
  ],
  basketball: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "driving straight at the camera mid-dribble, the ball just leaving the fingertips on " +
        "its way down, head up and eyes into the lens, the free arm across the body",
      camera:
        "eye level, straight-on with the body turned slightly, 85 mm lens at f/2.8, full " +
        "body from a couple of metres back",
      facing:
        "facing the camera. This one sits in the CENTRE of the composite, so it is square to " +
        "the viewer and leans neither way",
      equipment:
        "the ball is below the waist between hand and floor, fully inside the frame and not " +
        "cropped by the bottom edge",
      mustShow:
        "the whole athlete from the top of the head to below the shoes, face clearly visible " +
        "and sharp, the ball in frame, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      action:
        "exploding past on the first step of a drive, seen from the side: the LEFT foot " +
        "planted hard and driving, body low and leaning forward over it, the RIGHT hand " +
        "pushing the ball out low and ahead, the left forearm up to hold off a defender",
      camera: "side profile, camera slightly below chest height, 50 mm lens, full body",
      facing:
        "PLANTED ON THE LEFT FOOT and dribbling with the RIGHT hand, so the body is in clear " +
        "profile with the right shoulder leading. Naming the foot and the hand is what fixes " +
        "the orientation — a direction word alone does not",
      equipment:
        "the ball is low, near the floor beside the right foot, entirely inside the frame — " +
        "pull the camera back to fit it, never raise the dribble to make it fit",
      mustShow:
        "a clean readable silhouette: both feet visible, knees bent, the shielding arm clear " +
        "of the torso, the ball low and in frame, no limb leaving the frame",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // A DIFFERENT KIND OF ACTION, not a second angle on the same one. action2 is low and
      // grounded and going forward, so this one goes UP and stops: both feet gone, the body
      // stacked vertical, the ball released overhead. Drive and shot are the two things this
      // sport actually looks like, and between them they carry the whole card.
      action:
        "rising into a jump shot: both feet off the floor, body stacked upright, the RIGHT " +
        "hand under and behind the ball at the top of the release and the LEFT hand as the " +
        "guide hand on the side of it, eyes tracking the ball away",
      camera: "low camera close to ground level, tilted up at the athlete, 35 mm lens, full body",
      facing:
        "THE OPPOSITE LEAN TO action2, and it comes from the shooting form rather than from a " +
        "direction word: a right-handed shooter releases with the LEFT shoulder slightly " +
        "forward and the head turning away over that shoulder, so this frame leans left while " +
        "action2 — right shoulder leading into the drive — leans right",
      equipment:
        "the ball is overhead at the point of release, fully inside the frame and never " +
        "cropped by the top edge — pull the camera back rather than lowering the arms",
      mustShow:
        "both feet clearly off the floor, both arms up in the release with the guide hand " +
        "still on the ball, the ball overhead and in frame, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      action:
        "seen strictly from behind, rising for a jump shot with both feet off the floor, the " +
        "ball above and just in front of the head, both arms extended up into the release",
      camera: "eye level, directly behind the athlete, 85 mm lens, full body",
      facing: "seen from directly behind, shooting away from the camera. Used alone on the card back",
      equipment: "the ball stays entirely inside the frame, above the head and not cropped by the top edge",
      mustShow:
        "the back of the jersey with the number large and legible across the shoulders, both " +
        "raised arms fully inside the frame, no part of the face — not in profile, not over a " +
        "shoulder",
    },
  ],
  soccer: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "running straight at the camera with the ball a stride ahead of the leading foot, " +
        "head up and eyes into the lens, arms working naturally with the run",
      camera:
        "eye level, straight-on with the body turned slightly, 85 mm lens at f/2.8, full " +
        "body from a couple of metres back",
      facing:
        "facing the camera. This one sits in the CENTRE of the composite, so it is square to " +
        "the viewer and leans neither way",
      equipment:
        "the ball is on the ground just ahead of the leading foot, fully inside the frame " +
        "and not cropped by the bottom edge",
      mustShow:
        "the whole athlete from the top of the head to below the boots, face clearly visible " +
        "and sharp, the ball on the ground, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      action:
        "striking the ball, seen from the side: plant foot planted flat, kicking leg swung " +
        "through and the striking foot just past the ball, arms out for balance, torso over " +
        "the ball",
      camera: "side profile, camera slightly below chest height, 50 mm lens, full body",
      facing:
        "PLANTED ON THE LEFT FOOT, striking with the RIGHT foot, so the body is in clear " +
        "profile with the right shoulder leading and the head following the ball out to that " +
        "side. Naming the legs is what fixes the orientation — a direction word alone does not",
      equipment:
        "the ball is just leaving the striking foot and is entirely inside the frame — pull " +
        "the camera back to fit it, never shorten the swing",
      mustShow:
        "a clean readable silhouette: plant foot down, kicking leg extended, both arms clear " +
        "of the body, the ball in frame, no limb leaving the frame",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // A DIFFERENT KIND OF ACTION, not just a different angle. action2 is a ball struck along
      // the ground, so a second ground-level touch here makes the two supports read as one idea
      // twice. A ball dropping out of the air changes the whole body line — weight on one leg,
      // the other lifted, eyes up — and it is readable at seven and at fifty alike.
      action:
        "taking a ball dropping out of the air: weight on the standing leg, the other knee " +
        "lifted with the thigh turned up to cushion the ball just above it, eyes UP on the " +
        "ball, both arms out for balance",
      camera: "low camera close to ground level, tilted up at the athlete, 35 mm lens, full body",
      facing:
        "THE MIRROR OF action2: standing on the RIGHT foot with the LEFT knee lifted to take " +
        "the ball, left shoulder leading, head tilted up and to that side. Because action2 " +
        "plants on the left and strikes with the right, this one plants on the right and lifts " +
        "the left — anatomy makes the two frames face opposite ways without either being told " +
        "a direction",
      equipment:
        "the ball is IN THE AIR, dropping, just above the raised thigh and not yet touching it — " +
        "fully inside the frame, never cropped by the top edge",
      mustShow:
        "the standing foot flat on the ground and the raised knee clearly lifted, the ball in " +
        "the air above the thigh, the head tilted up watching it, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      action:
        "seen strictly from behind, running away from the camera after scoring with both arms " +
        "raised wide, feet off the ground mid-stride",
      camera: "eye level, directly behind the athlete, 85 mm lens, full body",
      facing: "seen from directly behind, running away from the camera. Used alone on the card back",
      equipment: "no ball needed in this frame",
      mustShow:
        "the back of the shirt with the number large and legible across the shoulders, both " +
        "raised arms fully inside the frame, no part of the face — not in profile, not over a " +
        "shoulder",
    },
  ],
  // BASEBALL — written before generating a single frame, per the runbook rewrite of
  // 2026-08-21. The two iconic actions are the SWING (rotational, at the plate) and the
  // CATCH (the glove is the sport's other icon, chosen by the customer over the pitch) —
  // one coiled-and-released sideways, one stretched long and low, so the two supports are
  // different kinds of movement, not two angles on one. The hero wears the CAP, never the
  // batting helmet: the face carries the product, and a cap hides nothing. Facing is stated
  // as §30 geometry — frame edge + near shoulder — never as a comparison with the sibling
  // frame.
  baseball: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "striding straight at the camera on his way to the plate — caught at the instant the " +
        "back heel is off the ground and still pushing, the front knee lifted and the front " +
        "foot just landing, the whole body thrown forward past the front foot. The bat is " +
        "carried in one hand down at his side, swinging with the stride; the other arm is " +
        "mid-swing across the body. Chin level, eyes into the lens, jaw set. A ballplayer " +
        "walking at you with intent, not standing for a portrait",
      camera:
        "just below eye level, straight-on with the body turned slightly, tilted a few " +
        "degrees up, 85 mm lens at f/2.8, full body from a couple of metres back",
      facing:
        "facing the camera and coming at it. This one sits in the CENTRE of the composite, " +
        "so it is square to the viewer and leans neither left nor right — the lean is " +
        "FORWARD, towards the lens",
      equipment:
        "the CAP is worn, the face fully visible under it; the bat hangs from one hand at " +
        "his side, knob up, barrel down, entirely inside the frame. No batting helmet, no " +
        "glove, no ball in this frame",
      mustShow:
        "the whole athlete from the crown of the cap to below the cleats, THE FACE UNCOVERED " +
        "and sharp, the bat in one hand, the back heel clearly off the ground, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      // AT CONTACT, not follow-through. The first roll asked for "just after contact" and a
      // follow-through naturally wraps the bat over the far shoulder and turns the head BACK
      // along the ball's path — the whole frame came back facing the wrong way while obeying
      // every word. At the instant of contact the anatomy has no such choice: the bat, the
      // eyes and the stride all point at the pitcher, so naming where the pitcher is fixes
      // everything at once.
      action:
        "a RIGHT-HANDED batter at the exact instant of CONTACT: the bat horizontal and " +
        "extended out towards the unseen pitcher, ball just met, both arms extended, hips " +
        "and shoulders rotated into the ball, the LEFT (stride) foot planted towards the " +
        "pitcher and the back foot pivoted up onto its toe, eyes locked on the point of " +
        "contact",
      camera: "side profile, camera at chest height, 50 mm lens, full body",
      facing:
        "THE UNSEEN PITCHER IS BEYOND THE RIGHT EDGE OF THE FRAME, so everything points " +
        "right: the extended bat, the eyes, the stride foot. The camera sees his RIGHT side " +
        "and the chest turns towards the lens as the hips rotate through. This frame is " +
        "placed on the LEFT of the composite, so every line in it leans INTO the centre",
      equipment:
        "BATTING HELMET worn for this frame; the bat is fully inside the frame — pull the " +
        "camera back to fit it, never shorten the swing. The ball is IN frame at the point " +
        "of contact, on the barrel of the bat",
      mustShow:
        "a clean readable silhouette: the rotated hips, the extended bat with the ball at " +
        "it, the pivoted back foot, both feet visible, the helmet complete, nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // THE CATCH, at the customer's request (2026-08-21) — the glove is the sport's other
      // icon and the swing frame already owns the bat. A lunging catch also breaks the
      // "arms driving forward" shape a pitch would share with the swing.
      action:
        "a fielder lunging to take a catch: deep athletic lunge, the leading leg bent low " +
        "and the trailing leg extended, the GLOVE arm stretched long out in front with the " +
        "glove open and the ball JUST arriving into its pocket, the bare hand trailing " +
        "behind for balance, eyes locked on the glove",
      camera: "low camera close to ground level, tilted up at the athlete, 35 mm lens, full body",
      // §28 struck again on the first roll: this said "glove on his RIGHT hand", and a
      // right-handed player wears the glove on the LEFT — so the model followed the anatomy,
      // put the glove on the left hand, and the whole reach went out to the right, the same
      // side as action2. When a direction word and the body disagree, the body always wins;
      // the spec has to be anatomically possible before it can be obeyed.
      facing:
        "LUNGING OUT TOWARDS THE LEFT EDGE OF THE FRAME: the GLOVE is on his LEFT hand, " +
        "stretched long towards that edge, so the camera sees his RIGHT side with the right " +
        "shoulder nearest the lens, the leading bent leg is his LEFT and his eyes track out " +
        "left along the arm into the glove. This frame is placed on the RIGHT of the " +
        "composite, so every line in it leans INTO the centre",
      equipment:
        "CAP worn for this frame; a plain tan-brown leather fielding glove on the " +
        "outstretched hand, the ball just entering its pocket — glove and ball both fully " +
        "inside the frame. No bat and no batting helmet",
      mustShow:
        "the deep lunge with both feet on the ground, the glove arm at full stretch with " +
        "the ball at the glove, the head turned along the arm, nothing cropped",
    },
    {
      id: "back",
      // The hockey lesson applied in advance: a wind-up from behind puts arms across the
      // number, and the number is this frame's whole job. Calm and square, nothing crossing
      // the shoulders.
      role: "card BACK from-behind shot",
      action:
        "seen strictly from behind, standing set and still: feet apart and level, weight " +
        "even, the bat held in ONE hand down at his side with the barrel resting on the " +
        "ground, the other arm hanging relaxed, so nothing crosses the back of the jersey",
      camera: "eye level, directly behind the athlete, 85 mm lens, full body",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "CAP worn, its back seam visible; the bat hangs at his side, entirely inside the " +
        "frame. No glove, no ball",
      mustShow:
        "the back of the jersey with the number large and legible across the shoulders, the " +
        "back of the cap, no part of the face — not in profile, not over a shoulder — and no " +
        "arm or bat crossing the number",
    },
  ],
  // SOFTBALL — written 2026-08-21, before generating a frame, same discipline as baseball.
  // Fastpitch owns ONE shape no other sport has: the WINDMILL pitch, so it takes a support
  // frame. The other support is the swing at contact — rotational against the windmill's
  // reach, and the two drive towards opposite edges per §30. The hero wears the VISOR from
  // the kit (never a helmet — the face carries the product); the swing frame wears the
  // batting helmet with its softball facemask left OFF so the face stays readable at 45%.
  softball: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "striding straight at the camera — caught at the instant the back heel is off the " +
        "ground and still pushing, the front knee lifted and the front foot just landing, " +
        "the whole body thrown forward past the front foot. The fielding glove is carried " +
        "in one hand down at her side, swinging with the stride; the free arm is mid-swing " +
        "across the body. Chin level, eyes into the lens, jaw set. A ballplayer walking at " +
        "you with intent, not standing for a portrait",
      camera:
        "just below eye level, straight-on with the body turned slightly, tilted a few " +
        "degrees up, 85 mm lens at f/2.8, full body from a couple of metres back",
      facing:
        "facing the camera and coming at it. This one sits in the CENTRE of the composite, " +
        "so it is square to the viewer and leans neither left nor right — the lean is " +
        "FORWARD, towards the lens",
      equipment:
        "the VISOR is worn, the face fully visible under it; the fielding glove hangs from " +
        "one hand at her side, entirely inside the frame. No bat, no helmet, no ball in " +
        "this frame",
      mustShow:
        "the whole athlete from the crown of the head to below the cleats, THE FACE " +
        "UNCOVERED and sharp, the glove in one hand, the back heel clearly off the ground, " +
        "nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      // The windmill at its most readable instant: arm at the TOP of the circle, where the
      // silhouette is unmistakable even at 45% opacity. The release (at the hip) reads as
      // nothing from a distance.
      action:
        "a fastpitch WINDMILL pitch at the top of the circle: the pitching arm swung " +
        "straight up overhead with the ball in hand at its highest point, the glove arm " +
        "reaching long out in front, the stride leg driving out low towards the plate, the " +
        "back foot still on the ground behind, the body arched into the motion",
      camera: "side profile, camera at hip height, 50 mm lens, full body",
      facing:
        "DRIVING OUT TOWARDS THE RIGHT EDGE OF THE FRAME: the unseen batter is beyond that " +
        "edge, so the glove arm, the stride leg and her eyes all point right, and the " +
        "camera sees her RIGHT side with the right hip nearest the lens. The pitching arm " +
        "is straight up overhead. This frame is placed on the LEFT of the composite, so " +
        "every line in it leans INTO the centre",
      equipment:
        "VISOR worn; the ball is in the raised pitching hand at the top of the circle, " +
        "fully inside the frame — pull the camera back to fit the raised arm, never lower " +
        "it. The fielding glove is on the outstretched glove hand. No bat",
      mustShow:
        "the pitching arm fully vertical with the ball in hand, the long stride, the glove " +
        "arm reaching forward, both feet visible, nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // The swing at CONTACT, same reasoning as baseball's: at contact the anatomy has no
      // choice about direction — bat, eyes and stride all point at the pitcher, so naming
      // where the pitcher is fixes the facing.
      action:
        "a RIGHT-HANDED batter at the exact instant of CONTACT: the bat horizontal and " +
        "extended out towards the unseen pitcher, ball just met on the barrel, both arms " +
        "extended, hips and shoulders rotated into the ball, the LEFT (stride) foot planted " +
        "towards the pitcher and the back foot pivoted up onto its toe, eyes locked on the " +
        "point of contact",
      camera: "low camera close to ground level, tilted up at the athlete, 35 mm lens, full body",
      facing:
        "THE UNSEEN PITCHER IS BEYOND THE LEFT EDGE OF THE FRAME, so everything points " +
        "left: the extended bat, the eyes, the stride foot. The camera sees her LEFT side " +
        "and the chest turns towards the lens as the hips rotate through. This frame is " +
        "placed on the RIGHT of the composite, so every line in it leans INTO the centre",
      equipment:
        "BATTING HELMET worn for this frame, no facemask on it so the face stays readable; " +
        "the bat fully inside the frame — pull the camera back, never shorten the swing. " +
        "The ball is IN frame at the point of contact, on the barrel of the bat. No glove",
      mustShow:
        "a clean readable silhouette: the rotated hips, the extended bat with the ball at " +
        "it, the pivoted back foot, both feet visible, the helmet complete, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      action:
        "seen strictly from behind, standing set and still: feet apart and level, weight " +
        "even, the glove held in ONE hand down at her side and the other arm hanging " +
        "relaxed, so nothing crosses the back of the jersey and the braid lies naturally " +
        "down between the shoulders without hiding the number",
      camera: "eye level, directly behind the athlete, 85 mm lens, full body",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "VISOR worn, its back and strap visible; the glove hangs at her side, entirely " +
        "inside the frame. No bat, no ball",
      mustShow:
        "the back of the jersey with the number large and legible across the shoulders, " +
        "no part of the face — not in profile, not over a shoulder — and no arm, glove or " +
        "braid covering the number",
    },
  ],
  // VOLLEYBALL — written 2026-08-21 before generating a frame. The sport's two shapes are
  // the SPIKE (airborne, the whole body drawn like a bow) and the DIG (folded low over the
  // platform) — one in the air and one on the floor, so the supports cannot read as one
  // idea twice. No headwear anywhere, so the face carries every frame. The ball is named in
  // every frame it appears in, per the set constants.
  volleyball: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "striding straight at the camera — caught at the instant the back heel is off the " +
        "ground and still pushing, the front knee lifted and the front foot just landing, " +
        "the whole body thrown forward past the front foot. The ball is carried tucked " +
        "under one arm against the hip; the free arm is mid-swing across the body. Chin " +
        "level, eyes into the lens, jaw set. A player walking at you with intent, not " +
        "standing for a portrait",
      camera:
        "just below eye level, straight-on with the body turned slightly, tilted a few " +
        "degrees up, 85 mm lens at f/2.8, full body from a couple of metres back",
      facing:
        "facing the camera and coming at it. This one sits in the CENTRE of the composite, " +
        "so it is square to the viewer and leans neither left nor right — the lean is " +
        "FORWARD, towards the lens",
      equipment:
        "the ball is tucked under one arm against the hip, fully inside the frame. Knee " +
        "pads on both knees",
      mustShow:
        "the whole athlete from the top of the head to below the shoes, THE FACE UNCOVERED " +
        "and sharp, the ball under one arm, the back heel clearly off the ground, nothing " +
        "cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      // The bow-and-arrow instant BEFORE contact, not the slap itself: the drawn-back arm
      // and arched back are the silhouette that reads as volleyball at 45% opacity; at
      // contact the arm is a straight line and the shape collapses.
      action:
        "a RIGHT-HANDED spiker at the top of her jump, the instant before contact: both " +
        "feet well off the floor, back arched, the RIGHT arm drawn back cocked behind the " +
        "head with the elbow high, the LEFT arm reaching up towards the ball hanging in " +
        "the air just in front of and above her, eyes locked on it",
      camera: "side profile, camera at chest height, 50 mm lens, full body",
      facing:
        "THE NET IS BEYOND THE RIGHT EDGE OF THE FRAME: her jump carries her towards it, " +
        "the reaching left arm and her eyes point right at the ball, and the camera sees " +
        "her RIGHT side with the right shoulder nearest the lens. This frame is placed on " +
        "the LEFT of the composite, so every line in it leans INTO the centre",
      equipment:
        "the ball hangs IN THE AIR just in front of and above her reaching hand, fully " +
        "inside the frame and never cropped by the top edge — pull the camera back rather " +
        "than lowering the toss. Knee pads on both knees",
      mustShow:
        "both feet clearly off the floor, the cocked right arm and the reaching left arm, " +
        "the arched back, the ball in the air and in frame, nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // The floor shape against action2's air shape: folded low, platform out. The ball
      // arrives INTO the frame so the body has a reason to be shaped like this.
      action:
        "a low defensive DIG: deep lunge with the hips dropped low, both arms joined " +
        "straight out in front into a flat platform, hands clasped, the ball just about to " +
        "meet the forearms, chin tucked and eyes on the ball",
      camera: "low camera close to floor level, tilted up at the athlete, 35 mm lens, full body",
      facing:
        "DIGGING OUT TOWARDS THE LEFT EDGE OF THE FRAME: the platform, the lunge and her " +
        "eyes all point left, the leading bent leg is her LEFT, and the camera sees her " +
        "RIGHT side with the right shoulder nearest the lens. This frame is placed on the " +
        "RIGHT of the composite, so every line in it leans INTO the centre",
      equipment:
        "the ball is IN THE AIR just above the platform, not yet touching the forearms, " +
        "fully inside the frame. Knee pads on both knees",
      mustShow:
        "the deep lunge with both feet on the floor, the joined straight arms of the " +
        "platform, the ball in the air above them, the face visible in profile, nothing " +
        "cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      action:
        "seen strictly from behind, standing set and still: feet apart and level, weight " +
        "even, the ball held under ONE arm against the hip and the other arm hanging " +
        "relaxed, so nothing crosses the back of the jersey and the ponytail lies naturally " +
        "without hiding the number",
      camera: "eye level, directly behind the athlete, 85 mm lens, full body",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "the ball is under one arm at the hip, fully inside the frame. Knee pads on both " +
        "knees",
      mustShow:
        "the back of the jersey with the number large and legible across the shoulders, no " +
        "part of the face — not in profile, not over a shoulder — and no arm, ball or " +
        "ponytail covering the number",
    },
  ],
  // LACROSSE — written 2026-08-21 before generating a frame, and written for the WOMEN'S
  // game because this athlete plays it: goggles, no helmet, no pads, a kilt (see BASE_WOMENS
  // in kits.ts for why that distinction is a research fact and not a styling one). The face
  // is visible through goggles, so unlike football and hockey the hero can be fully kitted.
  //
  // The two supports are opposite BODY SHAPES, not two angles: the shot is tall, rotational
  // and overhead; the ground-ball scoop is folded low with the stick almost on the turf.
  lacrosse: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "striding straight at the camera — caught at the instant the back heel is off the " +
        "ground and still pushing, the front knee lifted and the front foot just landing, " +
        "the whole body thrown forward past the front foot. The CROSSE is carried in both " +
        "hands across the body at waist height, head up on the right side with the ball in " +
        "its pocket. Chin level, eyes into the lens, jaw set. A player walking at you with " +
        "intent, not standing for a portrait",
      camera:
        "just below eye level, straight-on with the body turned slightly, tilted a few " +
        "degrees up, 85 mm lens at f/2.8, full body from a couple of metres back",
      facing:
        "facing the camera and coming at it. This one sits in the CENTRE of the composite, " +
        "so it is square to the viewer and leans neither left nor right — the lean is " +
        "FORWARD, towards the lens",
      equipment:
        "GOGGLES worn — the face is fully readable through them, they are an open wire or " +
        "clear frame and NOT a cage helmet. The crosse is held across the body in both " +
        "hands, its whole length including the head inside the frame",
      mustShow:
        "the whole athlete from the top of the head to below the cleats, THE FACE clearly " +
        "visible through the goggles and sharp, both hands on the crosse with its head and " +
        "the ball in frame, the back heel clearly off the ground, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      // The shot at the top of its arc: the crosse high and cocked behind the head is the
      // shape that reads as lacrosse from across a room. The release itself flattens into a
      // straight line and loses the sport.
      action:
        "a RIGHT-HANDED overhand shot at the top of the wind-up, the instant before the " +
        "ball goes: the crosse cocked HIGH behind the head with the head of the stick " +
        "above and behind the right shoulder, both hands up on the shaft — right hand high, " +
        "left hand lower — the torso coiled and rotating open, the front foot planted hard " +
        "and the back foot pivoting up onto its toe, eyes fixed downfield",
      camera: "side profile, camera at chest height, 50 mm lens, full body",
      // SIDES SWAPPED WITH action3 (2026-08-21) rather than fought. Two rolls of a
      // right-handed overhand shot came back working to the LEFT — a right-hander shot in
      // side profile turns that way and the anatomy beats the direction word, exactly as
      // §28 predicts. The composite only requires the two supports to MIRROR each other and
      // lean inward; which one sits left is free. So the shot takes the right-hand slot and
      // the scoop takes the left, and both frames now agree with the body instead of
      // arguing with it.
      facing:
        "THE GOAL IS BEYOND THE LEFT EDGE OF THE FRAME: the shot, her eyes and the planted " +
        "front foot all point left, and the camera sees her LEFT side with the left hip " +
        "nearest the lens as the torso opens. This frame is placed on the RIGHT of the " +
        "composite, so every line in it leans INTO the centre",
      equipment:
        "GOGGLES worn. The crosse is raised high behind the head and ALL of it — shaft and " +
        "head, with the ball still in the pocket — is inside the frame; pull the camera " +
        "back to fit it, never lower the stick",
      mustShow:
        "a clean readable silhouette: the crosse high and cocked behind the head, both " +
        "hands on the shaft, the coiled torso, both feet visible with the back foot " +
        "pivoting, nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // The floor shape against the shot's tall one: bent right over, stick nearly flat.
      action:
        "scooping a GROUND BALL: bent right over at the hips with the knees deeply bent and " +
        "the chest low over the front thigh, the CROSSE reached out low in front with its " +
        "head almost flat on the ground and the ball just entering the pocket, the top hand " +
        "high on the shaft and the bottom hand at its end, eyes locked on the ball",
      camera: "low camera close to ground level, tilted up at the athlete, 35 mm lens, full body",
      facing:
        "SCOOPING OUT TOWARDS THE RIGHT EDGE OF THE FRAME: the head of the crosse, her eyes " +
        "and the leading bent knee all go right, and the camera sees her LEFT side with the " +
        "left shoulder nearest the lens as she folds over the stick. This frame is placed " +
        "on the LEFT of the composite, so every line in it leans INTO the centre",
      equipment:
        "GOGGLES worn. The crosse is low and nearly horizontal with its head at ground " +
        "level and the ball at the pocket — the whole stick inside the frame, and the head " +
        "never cropped by the bottom or left edge",
      mustShow:
        "the deep fold at the hips with both feet on the ground, the crosse low and almost " +
        "flat with the ball at its head, the face visible in profile through the goggles, " +
        "nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      action:
        "seen strictly from behind, standing set and still: feet apart and level, weight " +
        "even, the CROSSE held in ONE hand down at her side with the head up, the other arm " +
        "hanging relaxed, so nothing crosses the back of the jersey and the ponytail lies " +
        "naturally without hiding the number",
      camera: "eye level, directly behind the athlete, 85 mm lens, full body",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "GOGGLES worn, their strap visible across the back of the head; the crosse hangs at " +
        "her side, entirely inside the frame",
      mustShow:
        "the back of the jersey with the number large and legible across the shoulders, no " +
        "part of the face — not in profile, not over a shoulder — and no arm, crosse or " +
        "ponytail covering the number",
    },
  ],
  // WRESTLING — written 2026-08-22 before generating a frame, and it is the hardest set so
  // far for one reason: wrestling is a TWO-PERSON sport and these are solo cutouts. Every
  // pose therefore has to be one that reads as wrestling with nobody to wrestle: a shot at
  // an unseen opponent's legs and a sprawl against an unseen shot both do; a tie-up or a
  // pin does not, because without the second body they read as a man hugging air.
  //
  // The two supports are the sport's two fundamental positions and they are opposite
  // SHAPES: the shot is a forward diagonal with everything extended, the sprawl is a flat
  // wide horizontal with the hips driven down. At 45% opacity that difference is the whole
  // reason to have two frames.
  //
  // HEADGEAR IS WORN IN EVERY FRAME AND HIDES NOTHING — ear guards cover the ears and leave
  // the whole face open, so unlike football and hockey there is no reason to take it off for
  // the hero.
  wrestling: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      // A wrestler's readiness is not a stride — it is a coiled stance. The energy comes
      // from load rather than travel: knees bent, weight forward on the balls of the feet,
      // hands up and open, as though the whistle has just gone.
      action:
        "set square in a wrestling stance and coming forward at the camera: knees bent deep, " +
        "weight forward over the balls of the feet with the back heel just off the mat, " +
        "chest low over the thighs, both arms up and out in front with the hands open and " +
        "ready to tie up, elbows in tight to the ribs. Chin tucked, eyes up into the lens " +
        "from under the brow, jaw set, breathing through the nose. He is about to move on " +
        "you — not standing to be photographed",
      camera:
        "just below eye level, straight-on with the body turned very slightly, tilted a few " +
        "degrees up, 85 mm lens at f/2.8, full body from a couple of metres back",
      facing:
        "facing the camera and coming at it. This one sits in the CENTRE of the composite, " +
        "so it is square to the viewer and leans neither left nor right — the lean is " +
        "FORWARD, towards the lens",
      equipment:
        "HEADGEAR worn — ear guards over both ears with the chin strap fastened, the whole " +
        "face open and readable. No ball and no implement of any kind: this sport has none, " +
        "and nothing may be invented into his hands",
      mustShow:
        "the whole athlete from the top of the headgear to below the shoes, THE FACE " +
        "UNCOVERED and sharp, both hands up and open in front, both feet on the mat with " +
        "the knees clearly bent, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      action:
        "shooting a double-leg takedown at an unseen opponent, caught at full extension: the " +
        "LEAD knee dropped to the mat with the shin flat, the trailing leg driving hard and " +
        "extended behind, the whole body stretched into one long forward diagonal, both arms " +
        "reaching out and low as if closing around a pair of legs at knee height, head up and " +
        "eyes forward",
      camera: "side profile, camera at hip height, 50 mm lens, full body",
      facing:
        "SHOOTING TOWARDS THE RIGHT EDGE OF THE FRAME: the reaching arms, the driving leg and " +
        "his eyes all point right, and the camera sees his RIGHT side with the right shoulder " +
        "nearest the lens. This frame is placed on the LEFT of the composite, so every line in " +
        "it leans INTO the centre",
      equipment:
        "HEADGEAR worn. NOTHING is in his hands and NO opponent, no dummy and no second body " +
        "appears anywhere in the frame — he is alone, and the reach itself carries the story",
      mustShow:
        "a clean readable silhouette: the dropped lead knee on the mat, the long extended " +
        "trailing leg, both arms reaching low and forward, the head up, nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // The defence against exactly what action2 is doing, and the opposite shape: where the
      // shot is a rising diagonal, the sprawl collapses into a wide flat horizontal.
      action:
        "sprawling to defend a shot: the hips driven DOWN hard towards the mat and the legs " +
        "kicked back and spread wide behind him, the chest up and the back arched, both arms " +
        "down and forward with the palms flat on the mat taking his weight, head up and eyes " +
        "forward. The whole body is low, wide and flat",
      // The sprawl is the one frame that lies DOWN, so it is also the one frame the model
      // will float in the middle of a tall empty picture unless the fill is stated: the first
      // take put the whole body in the bottom third with half the frame bare grey above him.
      camera:
        "low camera down at mat level, tilted up slightly at the athlete, 35 mm lens. The " +
        "sprawled body FILLS THE FRAME corner to corner — his planted hands reach the left " +
        "edge and his trailing feet the right, and there is no wide band of empty floor or " +
        "empty wall above him",
      facing:
        "SPRAWLING OUT TOWARDS THE LEFT EDGE OF THE FRAME: his head, his eyes and both " +
        "planted hands go left while the kicked-back legs trail right, and the camera sees " +
        "his LEFT side with the left shoulder nearest the lens. This frame is placed on the " +
        "RIGHT of the composite, so every line in it leans INTO the centre",
      // The pad is on the FAR leg in this one frame, and saying only "right knee" loses it:
      // the near leg is the one the model dresses, so the first take padded the left knee —
      // the same leg that carries the number — and the set disagreed with itself.
      equipment:
        "HEADGEAR worn. Nothing in his hands, and NO opponent or second body anywhere in the " +
        "frame. The legs are kicked back SPREAD WIDE so BOTH knees are seen: the black knee " +
        "pad is on his RIGHT knee, which here is the FAR leg, the upper of the two in the " +
        "picture. His LEFT leg — the near one, the one carrying the white number 1 on the " +
        "thigh — has a BARE knee with no pad on it",
      mustShow:
        "the hips low and the legs kicked back wide, both palms flat on the mat, the chest " +
        "up and the back arched, the face visible and forward, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      action:
        "seen strictly from behind, standing set and still: feet apart and level, weight " +
        "even, both arms hanging relaxed at his sides so nothing crosses the back of the " +
        "singlet, shoulders square to the camera",
      camera: "eye level, directly behind the athlete, 85 mm lens, full body",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "HEADGEAR worn, its rear strap and the back of both ear guards visible. Nothing in " +
        "his hands",
      // NO NUMBER ON THE BACK, and this is the one sport where that is correct. A wrestling
      // singlet carries its number on the THIGH — the athlete's own photograph shows the 1
      // there and a plain back — so a card-back frame demanding a number across the
      // shoulders would force the model to invent one. The card layout already sets the
      // number in type; the photograph does not have to carry it. Every other sport's back
      // frame still requires the printed number, because every other sport's kit has one.
      mustShow:
        "the back of the singlet, plain and unmarked exactly as the athlete's own kit is — " +
        "NO number, NO name and NO lettering invented onto it — the back of the headgear " +
        "with its rear strap, and no part of the face: not in profile, not over a shoulder",
    },
  ],

  // CHEERLEADING. Written 2026-08-22 after looking at what a competition routine actually
  // contains, per README §0.5. Two things drove every choice here:
  //
  // 1. SHE IS HOLDING POM-POMS IN ALL THREE FRONT FRAMES, so no frame may ask for a skill
  //    that needs empty hands. A tumbling pass — the obvious "action" for this sport — is
  //    thrown with the poms set down at the edge of the mat, so a tumbling frame would
  //    contradict the set constant that puts the same poms in every shot. Every pose below
  //    is one a cheerleader performs WITH poms in her fists.
  // 2. THE THREE SHAPES MUST DIFFER AT SILHOUETTE SIZE — one airborne and symmetric, one low
  //    and wide, one tall and arched — because at 45% opacity behind a card, shape is all
  //    that survives.
  cheerleading: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity",
      // The toe touch is the one cheer shape a stranger recognises instantly, and it is
      // symmetric — which is exactly what the CENTRE of the composite needs.
      action:
        "at the very top of a TOE TOUCH jump, both feet clear of the mat: legs straight and " +
        "split wide to either side at hip height or above, toes pointed, arms out in a hard " +
        "T with a fist and a pom at each end, back straight, chin up, eyes into the lens and " +
        "a real competition smile. Caught at the peak, weightless — not on the way up and " +
        "not landing",
      camera:
        "just below eye level so the jump reads as height, straight on, tilted a few degrees " +
        "up, 85 mm lens at f/2.8, full body with clear air under both feet",
      facing:
        "square to the camera and symmetric — she sits in the CENTRE of the composite, so " +
        "she leans neither left nor right; the energy goes UP and OUT towards the lens",
      equipment:
        "a POM-POM in each hand, gripped at the handle, one at each end of the T. Both poms " +
        "fully inside the frame. The berry BOW is worn at the crown of the ponytail",
      mustShow:
        "both feet off the ground with air beneath them, both legs straight and split wide, " +
        "both poms inside the frame, the face sharp and lit, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity",
      // The low, wide counterweight to the hero's airborne symmetry.
      action:
        "driving out of a deep side LUNGE on the count: the front knee bent deep over the " +
        "foot with that thigh close to parallel with the mat, the back leg straight and long " +
        "with the foot planted flat, the torso upright and square, and both arms snapped " +
        "into a sharp diagonal — one fist punched high and across, the other driven low " +
        "behind the hip. Every line hard and stopped dead, the way a cheer motion hits",
      camera:
        "camera low, at hip height, tilted up slightly, 50 mm lens, full body — the low angle " +
        "makes the lunge read as power rather than as crouching",
      facing:
        "WORKING TOWARDS THE RIGHT EDGE OF THE FRAME: the lunging front leg, the punched " +
        "high fist and her eyes all go right, the trailing straight leg reaches back to the " +
        "left, and the camera sees her RIGHT side with the right shoulder nearest the lens. " +
        "This frame is placed on the LEFT of the composite, so every line in it leans INTO " +
        "the centre",
      equipment:
        "a POM-POM in each hand — one in the high punched fist, one in the low trailing " +
        "fist, both fully inside the frame and neither cropped by an edge. The berry BOW is " +
        "worn at the crown of the ponytail",
      mustShow:
        "the front knee bent deep and the back leg straight, both feet flat on the mat, both " +
        "poms inside the frame, the arms in one clean unbroken diagonal, the face turned to " +
        "the camera side and readable, nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // Tall and arched: the third silhouette, and the only one that stands up straight.
      action:
        "hitting a HIGH V at the end of a count and holding it: up on the balls of both feet " +
        "with the heels lifted, legs straight and feet together, both arms driven straight " +
        "up and out into a wide V well above the head, shoulders down, chest lifted and the " +
        "upper back arched slightly, chin raised, mouth open mid-cheer. Stretched to her " +
        "full height and stopped",
      camera:
        "camera at chest height, tilted up so she fills the frame top to bottom, 50 mm lens, " +
        "full body with the raised poms fully inside the frame — pull the camera back to fit " +
        "the arms, never lower the arms to fit the frame",
      facing:
        "WORKING TOWARDS THE LEFT EDGE OF THE FRAME: her body is turned a quarter to the " +
        "left, her chin and eyes go left, and the camera sees her LEFT side with the left " +
        "shoulder nearest the lens. This frame is placed on the RIGHT of the composite, so " +
        "every line in it leans INTO the centre",
      equipment:
        "a POM-POM in each raised hand at the top of the V, both fully inside the frame and " +
        "neither touching nor crossing the top edge. The berry BOW is worn at the crown of " +
        "the ponytail",
      mustShow:
        "both arms straight in a wide V with both poms inside the frame, both heels lifted " +
        "off the mat, the body stretched tall, the face lit and readable, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      // NO NUMBER ACROSS THE SHOULDERS, and this is the second sport where that is right.
      // This uniform carries its number on the SKIRT HIP — her own photograph shows a plain
      // shell back — so a card-back frame demanding a number would force the model to invent
      // one, which the kit plate already tried to do once.
      //
      // AND THAT IS WHY THIS ONE MOVES. Every other sport's back frame is deliberately calm
      // and square, because a raised arm puts a shoulder across the number those kits carry
      // between the shoulder blades (see the ice-hockey note above — the wind-up roll read as
      // an awkward half-movement). Here there is nothing behind her shoulders to protect, so
      // the stillness bought nothing and cost the frame its emotion: a cheerleader
      // photographed from behind standing to attention is the one thing she never is. The
      // frame is a CELEBRATION, and what it shows instead of a number is the BOW.
      action:
        "seen strictly from behind at the moment the routine lands and the crowd goes up: both " +
        "arms thrown straight up and out into a wide high V above her head with a pom in each " +
        "hand, up on the balls of both feet with the heels lifted, the upper back arched and " +
        "the head tipped back to look up between her own hands, mid-cheer. Caught at the top " +
        "of the celebration, not walking into it and not coming out of it",
      camera:
        "eye level, directly behind her, 85 mm lens, full body — far enough back that both " +
        "raised poms are well inside the frame with air above them, close enough that the bow " +
        "and the ponytail read clearly",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "a POM-POM in each raised hand at the top of the V, both fully inside the frame and " +
        "neither touching the top edge. The berry BOW at the crown of the ponytail is fully " +
        "visible from behind, its two loops and both tails clear — with the arms up and away " +
        "from the head, nothing crosses it",
      mustShow:
        "both arms raised in a wide V with both poms inside the frame, both heels lifted, the " +
        "back arched, the bow and the ponytail clear and unobstructed, the back of the shell " +
        "plain and unmarked exactly as her own kit is — NO number, NO name and NO lettering " +
        "invented onto it — and no part of the face: not in profile, not over a shoulder",
    },
  ],

  // GYMNASTICS. Written 2026-08-22. Women's artistic gymnastics, thirteen years old, and three
  // facts about the sport decide every frame below:
  //
  // 1. NO APPARATUS IS IN THE PICTURE. These frames are cut out and dropped onto a card, so a
  //    beam or a set of bars would be cut in half by the matte. The sport has to read from the
  //    BODY alone — which it does, better than almost any other: a split in mid-air, a stuck
  //    landing and a salute are recognised by people who have never watched a meet.
  // 2. SHE IS BAREFOOT AND CHALKED. Both are stated in every frame, because a model handed
  //    "athlete" invents a shoe, and chalk is what makes a gymnastics photograph look real.
  // 3. SHE IS THIRTEEN. Every pose here is one a competent age-13 club gymnast performs. No
  //    apparatus dismount she would not do, and nothing that only an adult elite can hold.
  gymnastics: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity",
      // Airborne and symmetric for the CENTRE of the composite, and the one shape that says
      // gymnastics without an apparatus in the frame.
      action:
        "at the very top of a SPLIT LEAP, both bare feet clear of the floor: the legs split " +
        "wide FRONT-TO-BACK to a full straight line, front leg forward and rear leg driven " +
        "back, both knees locked and both toes pointed hard, hips square, back tall, both " +
        "arms stretched straight out to the sides at shoulder height with the fingers " +
        "together, chin up and eyes into the lens. Caught at the peak, weightless",
      camera:
        "just below eye level so the leap reads as height, straight on, tilted a few degrees " +
        "up, 85 mm lens at f/2.8, full body with clear air under both feet and the whole " +
        "split inside the frame — pull the camera back to fit the legs, never shorten the split",
      facing:
        "square to the camera and travelling neither left nor right — she sits in the CENTRE " +
        "of the composite; the line of the split runs across the frame and the energy goes UP",
      equipment:
        "NOTHING in her hands and NO apparatus anywhere in the frame — no beam, no bars, no " +
        "vault. Both feet BARE. Chalk white across both palms and dusting her forearms",
      mustShow:
        "both bare feet off the floor with air beneath them, the split open to a straight " +
        "line with both toes pointed, both arms straight, the face sharp and lit, nothing " +
        "cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity",
      // The moment every routine is judged on, and the counterweight to the hero: grounded,
      // vertical, still — where the hero is airborne and wide.
      action:
        "STICKING THE LANDING and saluting: both bare feet planted together and absolutely " +
        "still, knees just coming out of the absorb, chest driving up, spine long, both arms " +
        "snapping straight up and outwards into the gymnast's SALUTE with the fingers " +
        "together and the head lifted. A little chalk dust still hanging in the air around " +
        "her. The whole body says the landing did not move a centimetre",
      camera:
        "camera at chest height, tilted up slightly, 50 mm lens, full body — the raised hands " +
        "well inside the frame with air above them",
      facing:
        "WORKING TOWARDS THE RIGHT EDGE OF THE FRAME: her body is turned a quarter to the " +
        "right, her chin and eyes go right, and the camera sees her RIGHT side with the right " +
        "shoulder nearest the lens. This frame is placed on the LEFT of the composite, so " +
        "every line in it leans INTO the centre",
      equipment:
        "NOTHING in her hands and NO apparatus anywhere in the frame. Both feet BARE, planted " +
        "flat and together. Chalk on both palms, on the forearms and hanging in the air",
      mustShow:
        "both bare feet flat on the floor and together, both arms straight up in the salute " +
        "and fully inside the frame, the back long and the chin lifted, the face readable, " +
        "nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // Low, coiled and diagonal: the third silhouette, and the only one still touching the
      // floor with something other than a flat foot.
      action:
        "the instant of the TAKE-OFF into a tumbling pass: sitting down hard into both heels " +
        "with the knees bent deep, the torso leaning BACK over them, both arms swung far back " +
        "behind the hips and rising, palms open, head up and eyes forward down the line she " +
        "is about to throw. Every muscle loaded, nothing yet released",
      camera:
        "camera low, at hip height, tilted up, 35 mm lens, full body — the low angle makes the " +
        "coil read as power",
      facing:
        "WORKING TOWARDS THE LEFT EDGE OF THE FRAME: her eyes, her chest and the line she is " +
        "about to travel all go left, her swung-back arms trail right, and the camera sees her " +
        "LEFT side with the left shoulder nearest the lens. This frame is placed on the RIGHT " +
        "of the composite, so every line in it leans INTO the centre",
      equipment:
        "NOTHING in her hands and NO apparatus anywhere in the frame. Both feet BARE and flat " +
        "on the floor. Chalk on both palms and forearms",
      mustShow:
        "both knees bent deep with both bare feet flat, both arms swung back behind the hips " +
        "and fully inside the frame, the torso leaning back over the heels, the face lit and " +
        "readable, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      // NO NUMBER ACROSS THE SHOULDERS — third sport in a row where that is correct. This
      // leotard carries its number on the LEFT SLEEVE and her photograph shows no back mark,
      // so a card-back frame demanding one would force the model to invent it (the kit plate
      // already tried). And per §38, a blank back frees the frame to MOVE: what it shows
      // instead of a number is the salute at the end of the routine.
      action:
        "seen strictly from behind at the end of the routine, holding the finish: both bare " +
        "feet planted together, up tall through the spine with the upper back arched, both " +
        "arms stretched straight up and out into the gymnast's SALUTE with the fingers " +
        "together, the head tipped back to look up between her own hands",
      camera:
        "eye level, directly behind her, 85 mm lens, full body — far enough back that both " +
        "raised hands are well inside the frame with air above them, close enough that the " +
        "bun and the back of the leotard read clearly",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "NOTHING in her hands and NO apparatus anywhere in the frame. Both feet BARE. Chalk " +
        "dust on the backs of both arms",
      mustShow:
        "the back of the leotard, plain and unmarked exactly as her own kit is — the chevron " +
        "carrying across the upper back and NOTHING below it, NO number, NO name and NO " +
        "lettering invented onto it — both arms straight up in the salute and inside the " +
        "frame, both bare feet together, the bun clear, and no part of the face: not in " +
        "profile, not over a shoulder",
    },
  ],

  // TRACK & FIELD. Written 2026-08-22. A sixteen-year-old SPRINTER, and three facts decide
  // every frame below:
  //
  // 1. NOTHING STANDS IN THE PICTURE. No starting blocks, no hurdle, no baton — these frames
  //    are cut out, and anything resting on the track is sliced in half by the matte. It costs
  //    nothing here: sprinting is the one sport that reads entirely from the body.
  // 2. THE NUMBER IS A PINNED BIB AND IT IS ON THE FRONT. Nothing is printed between the
  //    shoulder blades of a track singlet, so per §38 the back frame is free to move — and the
  //    `back` mustShow forbids inventing a number there, which is the defect that shipped twice.
  // 3. THE FOUR MOMENTS OF A SPRINT are acceleration, flight, the lean and the finish. Three of
  //    them are here, one per frame, so the set reads as one race rather than one stride
  //    photographed three times.
  // TRACK & FIELD. The pose frames do NOT name the colour of the shoes. They said "White
  // sprint SPIKES" while Imani's frozen spec said plain black — the sport default and the
  // photograph disagreeing inside one prompt, which is the two-sources-for-one-fact failure
  // kits.ts opens with. Footwear is owned by the spec (or by FOOTWEAR when there is none);
  // a pose may say the shoes are ON, never what they look like.
  "track-field": [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      // ENERGY FROM MECHANICS, not from blur — the frame has to be sharp enough to matte. The
      // flight phase of a sprint is a body in a shape it cannot hold: both feet off the ground,
      // everything driving forward, and the face square to the lens.
      // THE CAMERA WAS THE DEFECT, NOT THE RENDER. Written first as a sprint driving STRAIGHT
      // at a straight-on 85 mm lens, this frame came back three times as a hop on the spot —
      // and it had to: head-on, the knee drive and the trailing leg both point away from the
      // camera and foreshorten to nothing, so the one shape the brief asks for is the one
      // shape that view cannot show. art:fix could not rescue it either, because there was no
      // defect in the drawing. Same family as README §20 — do not soften the pose to fit the
      // frame, MOVE THE CAMERA. Three-quarters keeps the face on the lens (this frame carries
      // the product) and puts the split legs and split arms across the sensor where they read.
      action:
        "at full sprint speed, caught in the FLIGHT PHASE with both feet clear of the track: " +
        "the front knee driven up hard to hip height with the shin hanging loose beneath it, " +
        "the back leg fully extended behind from hip to pointed toe so the two legs make a " +
        "WIDE OPEN SPLIT with daylight between them, one arm swung up past the chin with the " +
        "elbow at a right angle and the other driven back past the hip, hands loose and open " +
        "rather than clenched, torso tall, shoulders level. Her body runs across the frame " +
        "while her CHIN IS TURNED to the lens and her eyes come straight down it. A sprinter " +
        "at full speed, not a runner jogging for a photograph",
      camera:
        "eye level, 85 mm lens at f/2.8, full body from a few metres back with clear air " +
        "under both spikes, and far enough round that the whole length of both legs and both " +
        "arms is across the frame rather than pointing at the lens",
      facing:
        "running THREE-QUARTERS across the frame towards the camera's left, her body turned " +
        "about forty-five degrees off the lens so the leg split and the arm split are both " +
        "fully visible in profile, with the head turned back square to the camera. She sits " +
        "in the CENTRE of the composite",
      equipment:
        "NOTHING in her hands and NO apparatus anywhere in the frame — no starting blocks, no " +
        "hurdle, no baton, no marker cones. Her own track SPIKES on both feet, exactly the pair " +
        "the kit description gives her — this frame does not choose their colour",
      mustShow:
        "both feet off the track with air beneath them, the front knee up and the back leg " +
        "extended, both arms driving in opposition, the face sharp and lit, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      action:
        "THE LEAN at the line, seen from the side: the chest thrown forward ahead of the hips " +
        "with the shoulders dipped, both arms driven back and out behind her, chin up, mouth " +
        "open with the effort, the front leg reaching and the back leg trailing straight. The " +
        "whole body is committed past its own balance",
      camera:
        "side profile, camera slightly below chest height, 50 mm lens, full body",
      facing:
        "RUNNING TOWARDS THE RIGHT EDGE OF THE FRAME: the camera sees her RIGHT side, so the " +
        "right shoulder and the right hip are the ones nearest the lens, and her chest, her " +
        "chin and the whole lean go out to the right while both arms trail back to the left. " +
        "This frame is placed on the LEFT of the composite, so every line in it leans INTO " +
        "the centre",
      equipment:
        "NOTHING in her hands and NO apparatus anywhere in the frame — no tape, no post, no " +
        "line marker. Her own track SPIKES on both feet, exactly the pair the kit description " +
        "gives her",
      mustShow:
        "the chest clearly ahead of the hips, both arms swept back behind her and fully inside " +
        "the frame, both legs reading as a stride rather than a stance, the head in profile " +
        "and readable, nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // The low diagonal: the third silhouette, and the only frame where the body is not
      // upright. Written without blocks on purpose — the drive phase is still recognisable
      // three strides out, and blocks cannot survive the matte.
      action:
        "THE DRIVE PHASE a few strides out of the start: the whole body angled forward like a " +
        "ramp, roughly forty-five degrees from the track, shins low and almost parallel with " +
        "the ground, the pushing leg fully extended behind from hip to toe, the front knee " +
        "driving through low and flat, both arms punching hard and long, head down in line " +
        "with the spine and the eyes just ahead of her own feet",
      camera: "camera low, close to track level, tilted up at her, 35 mm lens, full body",
      facing:
        "ACCELERATING TOWARDS THE LEFT EDGE OF THE FRAME: the camera sees her LEFT side, so " +
        "the left shoulder and the left spike are nearest the lens, and the forward angle of " +
        "her whole body points out to the left while the extended pushing leg reaches back to " +
        "the right. This frame is placed on the RIGHT of the composite, so every line in it " +
        "leans INTO the centre",
      equipment:
        "NOTHING in her hands and NO apparatus anywhere in the frame — the starting blocks are " +
        "already behind her and OUT of frame. Her own track SPIKES on both feet, exactly the " +
        "pair the kit description gives her, the sole of the trailing shoe visible",
      mustShow:
        "the body held in one straight forward-leaning line from the pushing toe to the head, " +
        "both arms driving in opposition, both feet inside the frame, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      // NO NUMBER BETWEEN THE SHOULDER BLADES — a track bib is pinned to the FRONT of the
      // singlet, so this back is blank and §38 applies: the frame is free to move, and it takes
      // the moment the sport is actually about. Anything printed on the back here is invented.
      action:
        "seen strictly from behind at the instant she crosses the line and knows: both arms " +
        "thrown up and out wide above her head, hands open, the head tipped back, the back " +
        "arched, up on the toes of one spike with the other foot still coming through. Caught " +
        "at the top of the celebration, not walking out of it",
      camera:
        "eye level, directly behind her, 85 mm lens, full body — far enough back that both " +
        "raised hands are well inside the frame with air above them, close enough that the " +
        "cornrows and the low bun read clearly",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "NOTHING in her hands and NO apparatus anywhere in the frame. Her own track SPIKES on " +
        "both feet, exactly the pair the kit description gives her",
      mustShow:
        "the back of the singlet plain and unmarked exactly as her own kit is — NO number, NO " +
        "name and NO lettering invented onto it, because her race number is pinned to the " +
        "FRONT — both arms raised and inside the frame, the cornrows and the bun clear, and no " +
        "part of the face: not in profile, not over a shoulder",
    },
  ],

  // SWIMMING. Written 2026-08-22. Sixteen, female, and the sport fights the format harder than
  // any other on the roster. Four facts:
  //
  // 1. SHE IS NEVER IN THE WATER. A body half submerged has no legs to cut out and the water
  //    line becomes a straight horizontal slice through the matte. Every frame is on the deck.
  // 2. AND NOTHING SHE STANDS ON IS IN FRAME EITHER — no starting block, no lane rope, no
  //    kickboard. Same reason as the gymnastics beam.
  // 3. THE CAP AND GOGGLES HIDE THE WHOLE FACE, and this is a personalised card. So the hero
  //    wears the goggles PUSHED UP on the forehead and the eyes are clear — the same rule the
  //    football helmet taught. The two supports are muted to ~0.45, so goggles down costs
  //    nothing there and reads instantly as the sport.
  // 4. SHE IS WET IN EVERY FRAME, identically — water beading on the shoulders and running off
  //    the arms. Three cutouts sit side by side on one poster and a dry one would read as a
  //    different day.
  // ⚠️ COMPOSITE SIDES FOR THIS SET ARE SWAPPED FROM WHAT THE `facing` LINES BELOW ASK FOR.
  // Both supports render MIRRORED and did so on every roll (2026-08-22): action2's streamline
  // dives towards the LEFT edge though its line asks for the right, and action3's coil aims
  // towards the RIGHT edge though its line asks for the left. That is lucky rather than
  // unlucky — the two are still a complementary pair, so the approved frames lean INTO the
  // centre if action2 is placed on the RIGHT of the composite and action3 on the LEFT.
  // Place them that way. The `facing` text is left alone deliberately: it is prompt input, and
  // rewriting it to match the output would re-roll two approved frames to fix a caption.
  swimming: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      // THE ACTION HAS TO BE AN ACT, NOT A TRANSITION. This first read "caught at the end of a
      // shoulder swing ... stopped between two movements", and twice returned a catalogue
      // stand: arms hanging in one take, hands hidden behind the back and the eyes off the lens
      // in the other (2026-08-22). A swing that has already finished is indistinguishable from
      // standing still, so there is nothing for the model to draw. Seating the goggles is a
      // real, sport-specific act with a beginning and an end, it puts BOTH HANDS up beside the
      // face where the fingers are visible and doing something (the customer's standing hands
      // instruction), and it keeps the eyes in the lens — which is what a hero frame is for.
      action:
        "standing at her full height on the pool deck, both hands raised to her temples SEATING " +
        "THE GOGGLES on her forehead — fingertips on the goggle frame at each side, thumbs "  +
        "against the strap, elbows out wide and level with the shoulders, all five fingers of " +
        "each hand separated and clearly doing the work. Chin level, eyes straight down the " +
        "lens, weight settled on both bare feet with the shoulders squared. Water still beading " +
        "on her shoulders and running off her forearms. A swimmer about to race, looking at you",
      camera:
        "eye level, straight on with the body turned a few degrees, 85 mm lens at f/2.8, " +
        "full body",
      facing:
        "square to the camera; she sits in the CENTRE of the composite, so she leans neither " +
        "left nor right — the swimmer's V of her back and shoulders is what the frame is for",
      equipment:
        "the royal blue silicone SWIM CAP is on with all of her hair under it, and the GOGGLES " +
        "are PUSHED UP onto the forehead above the eyebrows so the whole face is clear and " +
        "readable. BARE FEET — no shoes anywhere in the frame. NOTHING in her hands and no " +
        "block, no lane rope, no kickboard and no water in the frame",
      mustShow:
        "the whole athlete head to bare feet, the face sharp and lit with the goggles clear of " +
        "the eyes, the cap on and the shoulders wet, both hands open and visible, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      // The one shape in swimming that survives being cut out: airborne, symmetrical, an arrow.
      action:
        "AIRBORNE off the start in a full streamline, the instant after the feet leave the " +
        "deck: the body one straight rigid line from fingertips to toes, both arms locked out " +
        "overhead with one hand over the other, the head tucked tight between the biceps, the " +
        "back flat, both legs pressed together and the toes pointed hard. Travelling, not falling",
      camera:
        "side profile, camera slightly below chest height, 50 mm lens, full body — far enough " +
        "back that the pointed fingertips and the pointed toes are both well inside the frame",
      facing:
        "DIVING TOWARDS THE RIGHT EDGE OF THE FRAME: the camera sees her RIGHT side, so the " +
        "right shoulder and the right hip are the ones nearest the lens, her locked hands point " +
        "out to the right and her pointed toes trail back to the left. This frame is placed on " +
        "the LEFT of the composite, so every line in it leans INTO the centre",
      equipment:
        "the royal blue silicone SWIM CAP is on with all of her hair under it and the GOGGLES " +
        "are DOWN over the eyes with the strap flat around the back of the cap. BARE FEET. No " +
        "block, no lane rope, no water and no apparatus of any kind in the frame",
      mustShow:
        "the whole body in one straight unbroken line with both arms locked overhead and both " +
        "toes pointed, the hands stacked one over the other, air all around her, nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // Low and coiled — the opposite of action2 in every way, which is what the third
      // silhouette is for.
      action:
        "COILED ON THE EDGE in the last instant before the start: hips high and pushed back, " +
        "both knees bent, the chest folded down onto the thighs, both arms reaching straight " +
        "down past the shins with the fingers curled forward as if gripping the edge, the head " +
        "down between the arms and the eyes forward under the brow. Everything loaded, nothing " +
        "released",
      camera: "camera low, near deck level, tilted up at her, 35 mm lens, full body",
      facing:
        "AIMED AT THE LEFT EDGE OF THE FRAME: the camera sees her LEFT side, so the left " +
        "shoulder and the left foot are nearest the lens, her head and both reaching hands go " +
        "out to the left and her hips press back to the right. This frame is placed on the " +
        "RIGHT of the composite, so every line in it leans INTO the centre",
      equipment:
        "the royal blue silicone SWIM CAP is on with all of her hair under it and the GOGGLES " +
        "are DOWN over the eyes. BARE FEET, both flat with the toes gripping forward — the deck " +
        "edge itself is NOT in frame. Nothing in her hands, no block and no water",
      mustShow:
        "both knees bent with the hips high, both arms reaching straight down inside the frame, " +
        "both bare feet flat and visible, the back long, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      // NOTHING IS PRINTED ON THE BACK OF A RACING SUIT — §38: the frame moves. What it shows
      // instead of a number is the thing the sport actually builds, which is this back: the
      // shoulders and the taper her own record describes.
      // TWO TAKES OF A HINGED-FORWARD WIND-UP CAME BACK UNUSABLE (2026-08-22): "hinged at the
      // hips, arms swung back and still rising, head down in line with the spine" rendered as a
      // full fold with the head between the knees, and the second take also invented a marlin
      // on the back of the suit and another on the cap. A pose that only exists for an instant
      // gives the model nothing to hold, and it fills the gap with marks. So the frame does the
      // one thing this shot is FOR — showing the back the sport builds — as a shape a body can
      // actually hold: a standing streamline, which is swimming's own silhouette.
      action:
        "seen strictly from behind, standing tall on the deck and stretched up into a full " +
        "STREAMLINE: both arms reaching straight overhead with one hand stacked flat on the " +
        "other, the elbows locked and squeezed in beside the ears, the shoulders pulled down " +
        "and the back spread wide so the taper from the shoulders to the waist is the shape of " +
        "the frame, up on the balls of both bare feet, the head level and facing away. Water " +
        "still beading on the shoulders and running down the back",
      camera:
        "eye level, directly behind her, 85 mm lens, full body — far enough back that both " +
        "swung-back hands are inside the frame, close enough that the cap and the wet shoulders " +
        "read clearly",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "the royal blue silicone SWIM CAP is on with all of her hair under it and the GOGGLES " +
        "are DOWN, the strap flat across the back of the cap. BARE FEET. No block, no lane " +
        "rope, no water, nothing in her hands",
      mustShow:
        "the back of the swimsuit exactly as the kit flat lay shows it: a CLOSED racerback — a " +
        "solid panel of fabric between the shoulder blades with NO keyhole, NO cut-out and NO " +
        "open back — and PLAIN, with NO number, NO name, NO club badge and NO lettering " +
        "invented onto it. The swim cap is plain unmarked blue with no badge on it either. Both " +
        "arms straight overhead and inside the frame with the hands stacked, both bare feet " +
        "visible, and no part of the face: not in profile, not over a shoulder",
    },
  ],

  // TENNIS. Written 2026-08-22. Fifteen, and three decisions the set has to make once so that
  // four frames agree:
  //
  // 1. HE PLAYS RIGHT-HANDED. His record says the racket arm is more developed but not which
  //    one it is, and four frames left to decide independently will not agree. Racket in the
  //    RIGHT hand, wristband on the LEFT, in every frame.
  // 2. THE RACKET IS FULL SIZE AND STRUNG, and it must be entirely inside the frame — pull the
  //    camera back to fit it, NEVER shorten the swing (the ice-hockey stick lesson: a pose
  //    softened to fit the frame comes back as no pose at all).
  // 3. A TENNIS SHIRT CARRIES NO NUMBER, so the back is blank and §38 applies. It takes the
  //    serve, which is the one tennis shape a stranger reads instantly from behind — and which
  //    is therefore NOT used in any of the three front frames.
  // TENNIS. These frames do NOT name the colour of the headband, the wristband or the shoes.
  // They said "white wristband" while Arun's frozen spec says TURQUOISE, read off photo3.png —
  // the sport default and the photograph disagreeing inside one prompt, which is the
  // two-sources-for-one-fact failure kits.ts opens with, and the same one the track spikes hit
  // the same day. A pose may say an item is WORN and where; the spec says what it looks like.
  tennis: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "landing out of the split-step and driving forward at the camera: both knees flexed and " +
        "the weight forward over the balls of both feet, hips low, the racket held out in front " +
        "of the body in BOTH hands — right hand on the grip, left hand at the throat — " +
        "shoulders turned a few degrees against the hips, chin down, eyes up into the lens. " +
        "Caught at the instant they read the ball, about to move",
      camera:
        "eye level, straight on with the body turned a few degrees, 85 mm lens at f/2.8, full body",
      facing:
        "square to the camera and coming forward out of the frame; they sit in the CENTRE of the " +
        "composite, leaning neither left nor right",
      equipment:
        "a plain unbranded strung RACKET held in both hands in front of the chest, its whole " +
        "head and grip inside the frame; the plain yellow BALL held in the LEFT hand against " +
        "the racket throat. His own HEADBAND across the forehead and their own WRISTBAND on the " +
        "LEFT wrist, exactly the colours the kit description gives them, and their own court " +
        "shoes on both feet — this frame does not choose what colour any of them are",
      mustShow:
        "the whole athlete head to shoes, the face sharp and lit with the headband clear of the " +
        "eyebrows, both hands on the racket with the fingers separated and visible, the whole " +
        "racket inside the frame, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      // WRITTEN AS "AT CONTACT ... the ball on the strings" this returned a WALK in both takes
      // (2026-08-22) — a boy strolling with the racket held out near a floating ball, twice,
      // and the second take also redrew the chest badge as a different bird. Contact is an
      // instant, and §42 is the standing finding: an instant gives the model nothing to hold,
      // and what it cannot hold it fills in with invention. The FOLLOW-THROUGH is the same shot
      // one beat later and it is a shape a body genuinely holds — it is also the shape everyone
      // recognises as a forehand from across a room.
      action:
        "THE FOLLOW-THROUGH of a full forehand, one beat after contact and still fully wound " +
        "out: the hips and chest rotated all the way through to face across the court, the " +
        "racket finished HIGH and WRAPPED OVER THE OPPOSITE SHOULDER with the elbow up and the " +
        "head of the racket pointing back down behind them, the hitting arm folded across the " +
        "body, the free arm tucked in at the chest, the front leg braced and straight and the " +
        "back foot pivoted right up onto its toe with the heel turned out. The ball is already " +
        "gone — it hangs in the air out in front of them, well clear of the strings. Eyes still " +
        "tracking out after it. Every joint is at the END of its travel, not the middle",
      camera: "side profile, camera slightly below chest height, 50 mm lens, full body",
      facing:
        "HITTING OUT TOWARDS THE RIGHT EDGE OF THE FRAME: the camera sees their RIGHT side, so the " +
        "right shoulder and the right foot are the ones nearest the lens, the racket and the " +
        "ball go out to the right and their back foot trails to the left. This frame is placed on " +
        "the LEFT of the composite, so every line in it leans INTO the centre",
      equipment:
        "a plain unbranded strung RACKET in the RIGHT hand, the whole head and grip inside the " +
        "frame, and the plain yellow BALL in the air out in front of them and NOT on the strings. His own HEADBAND and their own " +
        "WRISTBAND on the LEFT wrist in the colours the kit description gives them, and their " +
        "own court shoes",
      mustShow:
        "the racket finished high over the opposite shoulder with the whole frame inside the " +
        "picture, the torso clearly rotated through, both feet inside the frame with the back " +
        "one up on its toe, the head in profile and readable, and the chest badge exactly the " +
        "crest artwork — a pennant with the heron's S-neck inside it, never a standing bird and " +
        "never any other mark. Nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // Low and stretched: the third silhouette, and the only frame where they are not upright.
      action:
        "STRETCHED WIDE on a two-handed backhand at full reach: the outside leg lunged out long " +
        "with that knee bent deep and the trailing leg straight behind, the hips dropped almost " +
        "to the height of the knee, both hands low on the grip and the racket reaching out past " +
        "the lunging foot at knee height, the ball at the strings, shoulders low and eyes down " +
        "on the ball. At the very edge of what they can reach",
      camera: "camera low, near court level, tilted up at them, 35 mm lens, full body",
      facing:
        "REACHING OUT TOWARDS THE LEFT EDGE OF THE FRAME: the camera sees their LEFT side, so the " +
        "left shoulder and the lunging left foot are nearest the lens, the racket and both hands " +
        "reach out to the left and the trailing leg stretches back to the right. This frame is " +
        "placed on the RIGHT of the composite, so every line in it leans INTO the centre",
      equipment:
        "a plain unbranded strung RACKET held low in BOTH hands, its whole head and grip inside " +
        "the frame, the plain yellow BALL at the strings. His own HEADBAND and their own WRISTBAND " +
        "on the LEFT wrist in the colours the kit description gives them, and their own court " +
        "shoes on both feet",
      mustShow:
        "the deep lunge with the front knee bent and the back leg straight, both feet inside the " +
        "frame, both hands on the grip with the whole racket inside the frame, the ball visible, " +
        "nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      // A tennis shirt has nothing printed between the shoulder blades, so §38 frees this frame
      // to move — and the serve is the shape that reads from behind better than from anywhere
      // else. It is deliberately absent from the three front poses so the set does not repeat.
      action:
        "seen strictly from behind at the TROPHY POSITION of a serve: the left arm stretched " +
        "straight up after the toss with the ball high above and slightly in front, the racket " +
        "dropped down behind the back with the elbow high, the back arched and the hips pushed " +
        "forward, the weight loaded onto the back foot with the front heel lifted, the head " +
        "tipped back looking up at the ball",
      camera:
        "eye level, directly behind them, 85 mm lens, full body — far enough back that the tossed " +
        "ball and the whole racket are both well inside the frame with air above",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "a plain unbranded strung RACKET in the RIGHT hand dropped behind the back, its whole " +
        "head inside the frame and not crossing the body's outline into the shoulders; the plain " +
        "yellow BALL in the air above the raised left hand, fully inside the frame. White " +
        "HEADBAND, their own WRISTBAND on the LEFT wrist in the colour the kit description gives it, and their own court shoes",
      mustShow:
        "the back of the shirt plain and unmarked exactly as their own kit is — NO number, NO name " +
        "and NO lettering invented onto it — the raised tossing arm and the ball inside the " +
        "frame, the racket behind the back and inside the frame, both feet visible, and no part " +
        "of the face: not in profile, not over a shoulder",
    },
  ],

  // GOLF. Written 2026-08-22. Seventeen, female, and this is the only sport on the roster whose
  // hero frame is NOT its action:
  //
  // 1. GOLF'S HERO CANNOT BE A SWING. Every swing frame either hides the face (head down over
  //    the ball through the whole backswing and impact) or turns it away (following the flight
  //    at the finish), and the hero is the frame that carries the face. So the hero is the
  //    moment BEHIND the ball — the stillest frame in this file, and the sport's own moment
  //    rather than a compromise. The swing lives in the two supports, where a turned head costs
  //    nothing at ~0.45 opacity.
  // 2. SHE PLAYS RIGHT-HANDED. Her record puts the glove line on the LEFT wrist and the tan on
  //    the left forearm only. ONE glove, on the LEFT hand, in every frame.
  // 3. THE CAP BRIM MUST NOT SHADOW THE EYES in the hero — same rule as the football helmet.
  // 4. AFTER IMPACT THERE IS NO BALL. action3 and back come after the strike, so there is
  //    deliberately no ball on the turf in them; the ball is in the hero and in action2.
  golf: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "standing tall behind the ball before the shot, absolutely still and reading the line: " +
        "feet a little apart, the club held UPRIGHT in the right hand with its head resting on " +
        "the turf beside her right foot and the shaft vertical, the gloved left hand hanging " +
        "easy at her side, shoulders level and back long, chin down, eyes lifted straight into " +
        "the lens under the brim of the cap. Stillness held on purpose, not a person waiting " +
        "for a photograph",
      camera:
        "eye level, straight on with the body turned a few degrees, 85 mm lens at f/2.8, full body",
      facing:
        "square to the camera; she sits in the CENTRE of the composite and leans neither left " +
        "nor right",
      equipment:
        "a plain unbranded mid-IRON with a steel shaft, held upright with its head on the ground " +
        "and the whole club inside the frame; the plain white BALL on the turf a step in front " +
        "of her. The olive CAP is worn with the brim tipped up enough that the whole face is lit " +
        "and there is NO hard shadow across the eyes. ONE glove, on the LEFT hand only. White " +
        "golf shoes on both feet",
      mustShow:
        "the whole athlete head to shoes, the face sharp and fully lit under the cap, the single " +
        "left glove clearly visible, the whole club inside the frame, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      action:
        "AT THE TOP OF THE BACKSWING and fully coiled: the shoulders turned about ninety degrees " +
        "with the left shoulder driven under the chin, the hips resisting, the weight loaded " +
        "into the right side, both arms up with the left arm straight and the club wrapped " +
        "round behind the right shoulder roughly parallel with the ground, the head still and " +
        "the eyes down on the ball. Everything wound, nothing released",
      camera: "side profile, camera slightly below chest height, 50 mm lens, full body",
      facing:
        "THE SHOT SHE IS ABOUT TO HIT GOES OUT TO THE RIGHT EDGE OF THE FRAME: her chest is " +
        "turned away from it, back to the LEFT, and the camera sees her front with the LEFT " +
        "shoulder driven under the chin and nearest the lens, the club wrapped behind the RIGHT " +
        "shoulder. This frame is placed on the LEFT of the composite, so every line in it leans " +
        "INTO the centre",
      equipment:
        "the same plain unbranded mid-IRON with a steel shaft, wrapped behind the shoulder with " +
        "its whole head inside the frame — pull the camera back to fit the club, never shorten " +
        "the backswing. The plain white BALL on the turf at her feet. Olive CAP, ONE glove on " +
        "the LEFT hand, white golf shoes",
      mustShow:
        "the full shoulder turn with the club behind the shoulder and entirely inside the frame, " +
        "both feet planted and inside the frame, the ball on the turf, the head down and still, " +
        "nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      action:
        "THE FULL FINISH, held: the weight completely through onto the front foot with the back " +
        "heel lifted and rolled up onto its toe, hips and chest turned to face where the ball " +
        "has gone, the spine tall and slightly arched back, both hands high with the club " +
        "wrapped over the leading shoulder behind the neck, and the eyes tracking the ball out " +
        "into the distance",
      camera: "camera low, near turf level, tilted up at her, 35 mm lens, full body",
      facing:
        "THE BALL HAS GONE OUT TO THE LEFT EDGE OF THE FRAME: her chest, her hips and her eyes " +
        "all follow it left, the club is wrapped over her LEFT shoulder, her weight is fully on " +
        "the LEFT foot with the RIGHT heel lifted and rolled onto the toe, and the camera sees " +
        "her front with the left shoulder nearest the lens. This frame is placed on the RIGHT of " +
        "the composite, so every line in it leans INTO the centre",
      equipment:
        "the same plain unbranded mid-IRON, wrapped over the shoulder with its whole head inside " +
        "the frame. NO ball anywhere in this frame — it has already been struck and is away. " +
        "Olive CAP, ONE glove on the LEFT hand, white golf shoes",
      mustShow:
        "the weight through onto the front foot with the back heel up on its toe, both hands high " +
        "with the whole club inside the frame, the body turned through and tall, the head turned " +
        "to follow the ball, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      // A golf polo carries nothing between the shoulder blades — §38 frees the frame. It takes
      // the most human moment in the game: the second after the strike, watching it go.
      action:
        "seen strictly from behind a moment after the strike, watching the ball fly: up on the " +
        "toes of the back foot with the weight through onto the front one, the club held down " +
        "in the left hand with its head near the turf, the RIGHT hand raised to the brim of the " +
        "cap shading her eyes, the head tipped up and turned slightly to follow the flight, the " +
        "back long and open",
      camera:
        "eye level, directly behind her, 85 mm lens, full body — close enough that the ponytail " +
        "below the cap and the back of the polo read clearly",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "the same plain unbranded mid-IRON held down in the LEFT hand, its whole length inside " +
        "the frame and not crossing the back of the polo. NO ball in the frame — it is away. " +
        "Olive CAP seen from behind with the ponytail below it, ONE glove on the LEFT hand, " +
        "white golf shoes",
      mustShow:
        "the back of the polo plain and unmarked exactly as her own kit is — NO number, NO name " +
        "and NO lettering invented onto it — the raised right hand at the cap brim, the club " +
        "inside the frame, both feet visible with the back heel lifted, and no part of the face: " +
        "not in profile, not over a shoulder",
    },
  ],

  // PICKLEBALL. Written 2026-08-22. A fifty-eight-year-old recreational player, and two facts
  // outrank everything else:
  //
  // 1. IT MUST NEVER READ AS TENNIS. Handed "racket sport" the model draws a strung tennis
  //    racket every time — sports.ts fights the same battle over the court and the net height.
  //    The PADDLE is solid: a flat rigid face with NO strings, NO open throat and NO oval head,
  //    about the size of a large book, on a short handle. The BALL is hard yellow plastic with
  //    round holes cut through it. Both are stated in every frame, in their own lines.
  // 2. HE IS FIFTY-EIGHT AND THIS IS REC PLAY. `fitFor` already loosens the kit; the poses have
  //    to match it or the two halves of the same man disagree. Every frame here is a shot a
  //    good club player hits — feet on the ground, nothing leaping, nothing diving.
  //
  // He plays RIGHT-HANDED, decided here so the four frames agree.
  // PICKLEBALL is the one sport on the roster with TWO athletes in the coverage set — Ray
  // Solberg (58) and Nadia Rahimi (16) — so this set is written with NEUTRAL pronouns. It was
  // drafted for Ray alone and said "he" and "his" throughout, which would have described the
  // wrong person in half the frames the moment a second athlete used it (2026-08-22). Pose sets
  // are keyed by SPORT, never by athlete: anything true of only one of them belongs in that
  // athlete's spec, not here.
  // ⚠️ COMPOSITE SIDES DEPEND ON THE ATHLETE HERE, so check the approved frames before laying
  // one out. Ray Solberg's supports came back as a complementary pair and match the `facing`
  // lines below. Nadia Rahimi's BOTH play towards the LEFT edge (2026-08-22) — a re-roll of her
  // action2 only made the pose weaker without turning it round, and flipping a frame
  // horizontally is not an option because it mirrors the chest crest. For HER set, place
  // action2 on the RIGHT of the composite (its clear leftward drive then leans in) and action3
  // on the LEFT (it is a compact crouch whose trailing arm already reaches right). The `facing`
  // text below is left alone deliberately: it is prompt input, and rewriting it to match one
  // athlete's output would re-roll approved frames to fix a caption.
  // …and for the same reason these frames do NOT name the colour of the shoes. They said "white
  // court shoes with grey accents", which is Ray's pair; Nadia's photographs show plain all-white
  // with no grey at all. One sport, two athletes, one sentence — that is the
  // two-sources-for-one-fact failure kits.ts opens with. The spec owns what the kit looks like.
  pickleball: [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "set at the kitchen line in the ready position: knees soft and the weight forward on the " +
        "balls of both feet, back straight, the PADDLE up in front of the chest held in the " +
        "right hand with the left hand touching its edge, elbows in, chin down and eyes into the " +
        "lens with the beginnings of a competitor's grin at the corner of the mouth. Alert and " +
        "about to move, not standing for a portrait",
      camera:
        "eye level, straight on with the body turned a few degrees, 85 mm lens at f/2.8, full body",
      facing:
        "square to the camera; they sit in the CENTRE of the composite and lean neither left nor " +
        "right",
      equipment:
        "a PICKLEBALL PADDLE — a flat rigid solid-faced paddle with NO strings, no open throat " +
        "and no oval head, roughly the size of a large book on a short handle — held up in the " +
        "right hand, entirely inside the frame. The plain yellow PICKLEBALL, a hard plastic ball " +
        "with round holes cut through it, held in the LEFT hand against the paddle edge. White " +
        "court shoes with grey accents on both feet",
      mustShow:
        "the whole athlete head to shoes, the face sharp and lit, the paddle clearly SOLID-FACED " +
        "and entirely inside the frame, both hands visible with the fingers separated, nothing " +
        "cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      action:
        "AT CONTACT on a forehand drive: a compact stroke with the paddle out in front at waist " +
        "height and the ball on its face, the arm firm rather than long, the chest and hips " +
        "rotated through, the front foot stepped in and planted and the back foot pivoting, the " +
        "left arm swung across for balance, eyes on the ball",
      camera: "side profile, camera slightly below chest height, 50 mm lens, full body",
      facing:
        "HITTING OUT TOWARDS THE RIGHT EDGE OF THE FRAME: the camera sees their RIGHT side, so the " +
        "right shoulder and the right foot are nearest the lens, the paddle and the ball go out " +
        "to the right and the back foot trails to the left. This frame is placed on the LEFT of " +
        "the composite, so every line in it leans INTO the centre",
      equipment:
        "the same flat solid-faced PICKLEBALL PADDLE in the RIGHT hand, no strings anywhere, " +
        "entirely inside the frame; the perforated yellow BALL touching its face. White court " +
        "shoes with grey accents",
      mustShow:
        "the ball on the paddle face with the whole paddle inside the frame and plainly solid, " +
        "both feet inside the frame, the body rotated through, the head in profile and readable, " +
        "nothing cropped",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // Low and wide: the third silhouette, and the shot the sport is actually built on.
      action:
        "DINKING AT THE KITCHEN LINE: sunk into a deep athletic crouch with both knees bent and " +
        "the hips dropped low, chest upright over them, the paddle reached out low and flat in " +
        "front at shin height with a loose open grip and the ball just off its face, the left " +
        "arm out behind for balance, the head down and the eyes on the ball. Soft hands, low " +
        "body — no swing at all",
      camera: "camera low, near court level, tilted up at them, 35 mm lens, full body",
      facing:
        "PLAYING OUT TOWARDS THE LEFT EDGE OF THE FRAME: the camera sees their LEFT side, so the " +
        "left shoulder and the left foot are nearest the lens, the reaching paddle goes out to " +
        "the left and their trailing arm reaches back to the right. This frame is placed on the " +
        "RIGHT of the composite, so every line in it leans INTO the centre",
      equipment:
        "the same flat solid-faced PICKLEBALL PADDLE in the RIGHT hand, held low and entirely " +
        "inside the frame; the perforated yellow BALL just off its face, inside the frame. White " +
        "court shoes with grey accents, both feet flat on the court",
      mustShow:
        "both knees bent deep with both feet flat and inside the frame, the paddle low and " +
        "forward and plainly solid-faced, the ball visible, the back straight rather than " +
        "hunched, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      // A plain athletic t-shirt has nothing on the back, so §38 frees the frame — and the
      // overhead is the one pickleball shot that reads instantly from behind.
      action:
        "seen strictly from behind at the top of an OVERHEAD SMASH: the paddle arm cocked high " +
        "with the paddle dropped behind the head, the left arm raised and pointing up at the " +
        "ball to track it, the back arched, both heels lifted with both feet still on the court, " +
        "the head tipped back. Caught at the top, before the strike — they are not jumping",
      camera:
        "eye level, directly behind them, 85 mm lens, full body — far enough back that the raised " +
        "paddle, the pointing hand and the ball above are all well inside the frame",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "the same flat solid-faced PICKLEBALL PADDLE in the RIGHT hand behind the head, entirely " +
        "inside the frame; the perforated yellow BALL in the air above and slightly in front of " +
        "them, inside the frame. Their own court shoes in the colour the kit description gives them",
      mustShow:
        "the back of the t-shirt plain and unmarked exactly as their own kit is — NO number, NO " +
        "name and NO lettering invented onto it — the raised paddle and the ball both inside the " +
        "frame, both feet on the court with the heels lifted, and no part of the face: not in " +
        "profile, not over a shoulder",
    },
  ],
  // SKATEBOARDING — the `other-sport` slot, written 2026-08-22 when the slot stopped being
  // generic. It was on the derived fallback, which `posesFor` flags provisional and which must
  // never ship. Four facts decide this set:
  //
  // 1. THE BOARD IS IN EVERY FRAME and it is the one object that says "skateboarding" from
  //    across a room. It is also the only implement on the roster that the athlete STANDS ON,
  //    so it is part of the silhouette rather than something held.
  // 2. NOTHING HE RIDES IS IN FRAME. No quarter pipe, no ledge, no rail, no coping — same rule
  //    as the gymnastics beam and the swimming block: a cutout cannot carry the thing it stands
  //    on, and a ramp sliced by the matte reads as a grey slab.
  // 3. THE HELMET IS OPEN-FACE, so the face stays readable in all four frames — the football
  //    helmet's problem does not arise here and the hero does not have to take anything off.
  // 4. NOTHING IS PRINTED ON THE BACK OF A SKATE TEE (§38), so the back frame moves.
  "other-sport": [
    {
      id: "hero",
      role: "poster + card front main cutout, full opacity, face carries the product",
      action:
        "ROLLING STRAIGHT AT THE CAMERA on the board, riding it flat and fast: both feet on the " +
        "deck with the front foot angled forward over the bolts and the back foot across the " +
        "tail, knees bent and springy, hips low, shoulders open and square to the lens, both " +
        "arms carried out low and away from the body for balance with all five fingers of each " +
        "hand separated and relaxed. Chin level, eyes straight down the lens. He is moving, not " +
        "standing on a parked board",
      camera:
        "eye level, straight on, 85 mm lens at f/2.8, full body from a few metres back with the " +
        "whole board and all four wheels inside the frame and clear of the bottom edge",
      facing:
        "riding straight into the lens; he sits in the CENTRE of the composite, leaning neither " +
        "left nor right",
      equipment:
        "the SKATEBOARD is under both feet, the full deck and all four wheels visible. The " +
        "open-face skate HELMET is on and the whole face is clear. Knee pads on both knees. " +
        "NOTHING in his hands, and NO ramp, ledge, rail, coping or obstacle anywhere in the frame",
      mustShow:
        "the whole athlete head to wheels, both feet on the board with the board complete and " +
        "uncropped, the face sharp and lit under the helmet, both hands open with the fingers " +
        "separated, nothing cropped",
    },
    {
      id: "action2",
      role: "supporting cutout, muted to ~0.45 opacity — silhouette matters more than face",
      // The one shape in skating everybody recognises: airborne, board stuck to the feet.
      action:
        "AIRBORNE AT THE TOP OF AN OLLIE, seen from the side: the whole body and the board lifted " +
        "clear of the ground together, the board level and stuck to the soles of both feet, the " +
        "front knee tucked up towards the chest, the back leg extended and trailing, the leading " +
        "arm swung up and forward above shoulder height with the hand open, the other arm back " +
        "and low. The head up and looking ahead along the line of travel",
      camera:
        "side profile, camera slightly below hip height, 50 mm lens, full body — far enough back " +
        "that the raised hand and all four wheels are well inside the frame with clear air " +
        "beneath the board",
      facing:
        "TRAVELLING TOWARDS THE RIGHT EDGE OF THE FRAME: the camera sees his RIGHT side, so the " +
        "right shoulder and the right hip are nearest the lens, the nose of the board points " +
        "right and the trailing leg reaches back to the left. This frame is placed on the LEFT " +
        "of the composite, so every line in it leans INTO the centre",
      equipment:
        "the SKATEBOARD is airborne with both feet on it, all four wheels visible and clear of " +
        "the ground. Helmet on, knee pads on both knees. NOTHING in his hands, and NO ramp, " +
        "ledge, rail, coping or obstacle anywhere in the frame — only air under the board",
      mustShow:
        "clear daylight between the wheels and the ground, both feet in contact with the deck, " +
        "the whole board uncropped, both arms inside the frame, the silhouette reading instantly " +
        "as a skateboarder in the air",
    },
    {
      id: "action3",
      role: "supporting cutout, muted to ~0.45 opacity",
      // Low and carved — the opposite of the ollie, which is what the third silhouette is for.
      action:
        "DEEP IN A CARVE, low and leaning hard: the board rolled up onto its rail so the deck is " +
        "tilted steeply and only the two lower wheels are down, the knees folded deep with the " +
        "hips dropped almost to the level of the front knee, the whole body angled over inside " +
        "the turn, the leading hand reaching down and out towards the ground with the fingers " +
        "spread wide, the trailing arm swung up behind. The head up, eyes looking round through " +
        "the turn ahead of the board",
      camera: "camera low, close to ground level, tilted up at him, 35 mm lens, full body",
      facing:
        "CARVING TOWARDS THE LEFT EDGE OF THE FRAME: the camera sees his LEFT side, so the left " +
        "shoulder and the reaching left hand are nearest the lens, and his lean and the nose of " +
        "the board both go out to the left while the trailing arm reaches back to the right. " +
        "This frame is placed on the RIGHT of the composite, so every line in it leans INTO the " +
        "centre",
      equipment:
        "the SKATEBOARD is under both feet, tilted up on its rail with the whole deck and all " +
        "four wheels visible. Helmet on, knee pads on both knees. NOTHING in his hands, and NO " +
        "ramp, ledge, rail, coping, bowl wall or obstacle anywhere in the frame",
      mustShow:
        "the board clearly tilted on its rail rather than flat, the knees deeply folded and the " +
        "body leaning inside the turn, the reaching hand open with the fingers separated, both " +
        "feet on the deck, nothing cropped",
    },
    {
      id: "back",
      role: "card BACK from-behind shot",
      // A skate tee carries nothing across the shoulders, so §38 applies and the frame moves.
      action:
        "seen strictly from behind, riding away from the camera: both feet on the board, knees " +
        "bent and the weight settled, both arms thrown out WIDE to the sides at shoulder height " +
        "with the hands open and the fingers spread, the shoulders level and the head up and " +
        "facing away down the line he is riding. Rolling away, not standing still",
      camera:
        "eye level, directly behind him, 85 mm lens, full body — far enough back that both " +
        "outstretched hands and the whole board are well inside the frame",
      facing: "seen from directly behind; used alone on the card back",
      equipment:
        "the SKATEBOARD is under both feet with the deck and all four wheels visible from " +
        "behind. Helmet on, knee pads on both knees. NOTHING in his hands, and NO ramp, ledge, " +
        "rail, coping or obstacle anywhere in the frame",
      mustShow:
        "the back of the skate T-shirt PLAIN and unmarked exactly as his own kit is — NO number, " +
        "NO name, NO club badge and NO lettering invented onto it, because a skate tee carries " +
        "nothing across the shoulders — both arms out wide and inside the frame, both feet on " +
        "the board, and no part of the face: not in profile, not over a shoulder",
    },
  ],

};

/**
 * The pose set for a sport. Sports without a hand-written set fall back to a generic one
 * derived from `sports.ts`, flagged provisional: it will produce something, but the three
 * front poses will not be as sport-specific as a hand pass makes them. Do not ship a
 * provisional set — treat the flag as a TODO the CLI prints.
 */
export function posesFor(sport: Sport): { poses: Pose[]; provisional: boolean } {
  const hand = POSES[sport.slug];
  if (hand) return { poses: hand, provisional: false };
  return {
    provisional: true,
    poses: [
      {
        id: "hero",
        role: "poster + card front main cutout",
        action: `standing set in a ready stance for ${sport.name}, holding their equipment, chin down and eyes into the lens`,
        camera: "eye level, three-quarter turn of the body, 85 mm lens at f/2.8, full body",
        facing: "facing the camera; sits in the CENTRE of the composite",
        equipment: `${sport.gear} — all of it inside the frame`,
        mustShow: "the whole athlete head to feet, face sharp, nothing cropped",
      },
      {
        id: "action2",
        role: "supporting cutout, muted",
        action: `mid-action in the defining movement of ${sport.name}, seen from the side`,
        camera: "side profile, camera slightly below chest height, 50 mm lens, full body",
        facing: "in profile facing RIGHT; placed on the LEFT of the composite, leaning inwards",
        equipment: `${sport.gear}, fully inside the frame`,
        mustShow: "a clean readable silhouette, no limb leaving the frame",
      },
      {
        id: "action3",
        role: "supporting cutout, muted",
        action: `a second, different action moment from ${sport.name}, low and dynamic`,
        camera: "low camera tilted up at the athlete, 35 mm lens, full body",
        facing: "in three-quarter profile facing LEFT; placed on the RIGHT of the composite",
        equipment: `${sport.gear}, fully inside the frame`,
        mustShow: "both feet visible, the movement reading clearly",
      },
      {
        id: "back",
        role: "card BACK from-behind shot",
        action: `seen strictly from behind, ${sport.backPose}`,
        camera: "eye level, directly behind the athlete, 85 mm lens, full body",
        facing: "seen from directly behind; used alone on the card back",
        equipment: `${sport.gear}, fully inside the frame`,
        mustShow:
          "the back of the jersey with the number large and legible, no part of the face",
      },
    ],
  };
}
