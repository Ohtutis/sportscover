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
