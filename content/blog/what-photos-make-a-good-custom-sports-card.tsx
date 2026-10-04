// The nine photo-check items (lib/catalog/photo-checklist.ts, COPY §2.8) as one readable guide, what we
// do with the photos (/how-it-works gates 1–3) and what happens when they can't carry the likeness
// (INTAKE_COPY: nothing is paid before the proof). Every fact is the catalog's; nothing is new here.
import { Callout, Figure, H2, InlineLink, Lead, List, P, PostCta } from "../../components/blog";
import { block } from "../../lib/blocks";
import { NEVER_ASKED_FOR } from "../../lib/catalog/photo-checklist";
import { INTAKE_COPY } from "../../lib/intake/copy";
import type { BlogPost } from "../../lib/blog";

export const post: BlogPost = {
  slug: "what-photos-make-a-good-custom-sports-card",
  title: "What Photos Make a Good Custom Card",
  h1: "WHAT PHOTOS MAKE A GOOD CARD.",
  description:
    "The nine things we look for in your photos — face, angles, full body, team kit, eyes, light — and what happens when a photo can't carry the likeness.",
  category: "Trading Card Gift Ideas",
  primaryPage: "/photo-guide",
  publishedAt: "2026-10-04",
  readingMinutes: 4,
  image: "hero.story.1.before.1",
  body: () => (
    <>
      <Lead>
        A good custom card starts in your camera roll, not in a studio. Every one of the nine things below is something you can do
        with the phone you already have — they are the same nine on our <InlineLink href="/photo-guide">photo guide</InlineLink>,
        with the reason behind each one. Once you have picked your photos, <InlineLink href="/how-it-works">how it's made</InlineLink>{" "}
        shows what happens to them, check by check.
      </Lead>
      <P>{block("photos-that-work-best")}</P>

      <H2>THE FACE COMES FIRST.</H2>
      <P>
        Likeness lives in the face, so three of the nine are about it. The face should be at least a hand's width of the
        photo and crisp: move closer, and send the original file — a screenshot throws the detail away. Both eyes need to be
        visible: no sunglasses, no visor shadow, no helmet cage across the eyes.
      </P>
      <P>
        Light matters more than you might think. Motion blur and dark gyms hide the face, and one crisp, close, well-lit photo
        does more than four soft ones. If you only have a minute, pick the sharpest close-up you own.
      </P>

      <H2>THEN THE ANGLES.</H2>
      <P>
        A face seen only from the front leaves the side view to guesswork. So we ask for one photo with the head turned about
        45° to the left and one turned to the right. Add one full-body photo — head to shoes, standing or moving — because it
        sets the build and the proportions.
      </P>
      <P>
        Spread them out in time, too. Four shots from one burst count as one photo; different moments, on different days, tell
        us far more than many copies of the same second.
      </P>
      <Figure
        asset={["hero.story.1.before.1", "hero.story.1.before.2", "hero.story.1.before.3", "hero.story.1.before.4"]}
        caption="Four photos from one parent's phone."
      />

      <H2>THE KIT AND THE CREST.</H2>
      <P>
        Send one photo in the team kit — a game photo or team photo day. The kit on the card is copied from it, crest and all:
        shirt, shorts, socks and footwear, exactly as they are. Nothing on the kit is invented; a mark your photos don't
        show is a mark that doesn't exist.
      </P>
      <P>
        If you have the school or club crest as its own file, send it as a PNG or SVG; otherwise a straight-on photo of it
        works. {block("logo-sentence")}
      </P>

      <H2>ONE ATHLETE, CLOSEST TO THE CAMERA.</H2>
      <P>
        Teammates and parents in the background are fine. A team photo where six faces are the same size is not — nothing in it
        says which one is yours. In every photo you send, your athlete should be the person closest to the camera.
      </P>
      <P>The short version, if you are choosing photos right now:</P>
      <List items={[...INTAKE_COPY.photoMustHaves.map((line) => `${line}.`), "The crest as its own file, if you have one."]} />

      <H2>WHAT WE DO WITH THEM.</H2>
      <P>
        Before any art is made, we look at every photo you sent and tell you in plain words which ones can carry the likeness and
        what would fix the rest — "photo 3 has four people in it and no clear subject; send one where your athlete is the
        closest person to the camera", never "validation failed".
      </P>
      <P>
        From the photos that pass we copy the uniform, build a reference set of your athlete — front and both sides — and
        measure every later shot against it. If a shot doesn't look like them, it doesn't ship.
      </P>
      <Callout label="What we never ask for">
        {NEVER_ASKED_FOR} {block("photo-privacy")}
      </Callout>

      <H2>IF THE PHOTOS CAN'T CARRY IT.</H2>
      <P>
        Sometimes the photos simply aren't enough — every one is soft, or the face is too small. Then we tell you before
        any art is made and ask for one more angle rather than guess. We check the photos within one business day, so you hear
        early.
      </P>
      <P>
        You haven't paid anything at that point: the proof comes first. If the proof isn't right and we can't
        fix it, there's nothing to pay at all.
      </P>

      <PostCta />
    </>
  ),
};
