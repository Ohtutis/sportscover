// 08 · How it's made — in plain words (DESIGN §5.1-08, COPY §2.1-8). The photo-check exhibit is an
// HTML verdict card typeset from COPY §2.6 gate 1 — never a frame from `_intake.json`.
import Image from "next/image";
import { BracketFrame } from "../../../components/BracketFrame";
import { ButtonLink } from "../../../components/ButtonLink";
import { Ledger } from "../../../components/Ledger";
import { SectionHeading } from "../../../components/SectionHeading";
import { StatusChip } from "../../../components/StatusChip";
import { asset } from "../../../lib/assets";
import { block } from "../../../lib/blocks";
import { HomeSection, sectionId, sectionIndex } from "./Section";

export const PROCESS_H2 = "MADE BY A PERSON. AI IS IN THE TOOLBOX.";
export const PROCESS_LEAD =
  "We check your photos, build a reference of your athlete, make four shots, check every one against it, and you approve the proof before anything prints.";

/** The four rows the parent reads on the photo check (COPY §2.6 gate 1). */
export const VERDICT_ROWS: { status: "fail" | "note" | "pass"; text: string }[] = [
  { status: "fail", text: "Photo 3 — 4 people in this photo and no clear subject — send one where the athlete is the closest person to the camera." },
  { status: "fail", text: "Photo 5 — the eyes are hidden — sunglasses, a visor or a shadow across them; send one where both eyes are visible." },
  { status: "note", text: "Every photo faces the camera square on — send two more, the head turned about 45° to one side in one and to the other side in the other." },
  { status: "pass", text: "Photos 1, 2, 4, 6 — usable. Anchor: photo 2." },
];

const THUMB_SIZES = "(min-width: 1024px) 360px, (min-width: 768px) 30vw, 92vw";

export function Process() {
  const plate = asset("home.process.plate");
  const proof = asset("home.process.proof");
  return (
    <HomeSection n={8}>
      <SectionHeading as="h2" id={sectionId(8)} index={sectionIndex(8)} title={PROCESS_H2} />
      <p className="mt-8 max-w-[62ch] font-body text-[1.125rem] font-medium text-pretty">{PROCESS_LEAD}</p>
      <p className="mt-4 max-w-[62ch] font-body text-body text-pretty">{block("how-its-made")}</p>
      {/*
        The 2026-09-07 pass made all three frames take the row's height (a stretched row + `fill`) to cure
        a 293 px ragged bottom. It cured the bottom and broke the exhibits: a landscape photograph in an
        `object-contain` box as tall as the verdict ledger was DRAWN 181 × 135 inside a 181 × 713 box at
        768 px — 578 px of dead ground, 81 % of the frame, reading as a failed image load (layout audit
        2026-09-08, blocker 1). Now each photograph owns a 4 : 3 frame of its own and the row hangs from
        its top edge (`items-start`), so the ledger is simply as tall as its four sentences need.
        Between 768 and 1023 a third of the row is ~230 px, where the four verdict sentences stack to
        ~800 px beside two 300 px photographs — so on that band the ledger takes the whole first row and
        the two photographs share the second; three-up only from `lg`.
      */}
      <div className="mt-10 grid items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
        <BracketFrame label="PHOTO CHECK · VERDICT" caption="Photo check — the verdict, as the parent reads it" className="md:col-span-2 lg:col-span-1">
          <Ledger
            stacked
            rows={VERDICT_ROWS.map((row) => ({
              key: <StatusChip status={row.status} />,
              value: <span className="text-[0.8125rem]">{row.text}</span>,
              id: `verdict-${row.status}-${row.text.slice(0, 12)}`,
            }))}
          />
        </BracketFrame>
        <BracketFrame label="YOUR ATHLETE · THREE VIEWS" caption="Three views of your athlete, approved before any artwork is made" fictional>
          <div className="relative aspect-[4/3] w-full">
            <Image src={plate.src} alt={plate.alt} fill sizes={THUMB_SIZES} className="object-contain" />
          </div>
        </BracketFrame>
        <BracketFrame label="PROOF — NOT FINAL" caption="Watermarked proof — what you approve" fictional>
          <div className="relative aspect-[4/3] w-full">
            <Image src={proof.src} alt={proof.alt} fill sizes={THUMB_SIZES} className="object-contain" />
          </div>
        </BracketFrame>
      </div>
      <div className="mt-10">
        <ButtonLink href="/how-it-works">See the full process</ButtonLink>
      </div>
    </HomeSection>
  );
}
