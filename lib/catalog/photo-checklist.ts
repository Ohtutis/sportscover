// The nine things the photo check looks for (COPY §2.8), rendered by <PhotoChecklist> on
// /photo-guide and by the F2 upload page. Rows map 1:1 to art-pipeline/intake.ts reasons; the
// mapping is data for the F2 intake UI and is never rendered on /photo-guide.
//
// Row 9 ends with C6 from content/blocks (fs) — import this module from server code only.

import { block } from "../blocks";

export interface PhotoChecklistItem {
  id: string;
  /** 1–9, printed in Anton at the head of the row. */
  n: number;
  /** Space Grotesk 700. */
  title: string;
  /** Body, one or two sentences. */
  body: string;
  /** The intake.ts reason strings this row answers (not rendered on /photo-guide). */
  intake?: string[];
}

export const photoChecklist: PhotoChecklistItem[] = [
  {
    id: "face",
    n: 1,
    title: "Face large and sharp.",
    body: "The face should be at least a hand's width of the frame and crisp. Move closer, and send the original file — a screenshot throws the detail away.",
    intake: ["the face is only N px across and not sharp enough", "the athlete is too far away in the frame"],
  },
  {
    id: "angles",
    n: 2,
    title: "One turned about 45° each way.",
    body: "One with the head turned to the left, one to the right. Without them the side view has to be guessed.",
    intake: ["every photo faces the camera square on", "no photo turned to the LEFT/RIGHT"],
  },
  {
    id: "full-body",
    n: 3,
    title: "One full-body.",
    body: "Head to shoes, standing or moving — it sets the build and the proportions.",
  },
  {
    id: "kit",
    n: 4,
    title: "One in the team kit.",
    body: "A game photo or team photo day. The kit on the card is copied from it, crest and all.",
  },
  {
    id: "eyes",
    n: 5,
    title: "Both eyes visible.",
    body: "No sunglasses, no visor shadow, no helmet cage across the eyes.",
    intake: ["the eyes are hidden — sunglasses, a visor or a shadow across them"],
  },
  {
    id: "closest",
    n: 6,
    title: "Your athlete is the closest person to the camera.",
    body: "Teammates and parents behind are fine. A team photo where six faces are the same size is not — nothing in it says which one is yours.",
    intake: ["N people in this photo and no clear subject"],
  },
  {
    id: "moments",
    n: 7,
    title: "Different moments, not the same second.",
    body: "Four frames from one burst count as one photo.",
    intake: ["every photo is nearly the same shot"],
  },
  {
    id: "light",
    n: 8,
    title: "Well lit, not blurred.",
    body: "Motion blur and dark gyms hide the face. One crisp, close, well-lit photo does more than four soft ones.",
    intake: ["the face is unclear — likely blurred or badly lit", "every usable photo is SOFT"],
  },
  {
    id: "crest",
    n: 9,
    title: "The crest as its own file.",
    body: `A PNG or SVG of the school or club crest, if you have one — otherwise a straight-on photo of it. ${block("logo-sentence")}`,
  },
];

/** "What we never ask for" (COPY §2.8). */
export const NEVER_ASKED_FOR = "No date of birth, no home address, no school name.";

/** The closing line of /photo-guide. */
export const PHOTO_GUIDE_CLOSING = "If your photos can't carry the likeness, we tell you before any art is made and refund every cent.";
