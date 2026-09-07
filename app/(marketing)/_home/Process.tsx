// 08 · How it's made — in plain words (DESIGN §5.1-08, COPY §2.1-8). The photo-check artefact is an
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
        items-stretch + `fill`: the three exhibits are one row of evidence, so their accent corners
        have to agree. Left to itself the verdict ledger ran 659 px while the two photographs ran 366
        and 358 — a 293 px ragged bottom (owner review 2026-09-07). Now every frame takes the row's
        height and each photograph is DRAWN at that height (object-contain, so nothing is cropped);
        the ledger stacks its key above its value, because at 138 px of value column it was setting
        22 characters to a line.
      */}
      <div className="mt-10 grid items-stretch gap-8 md:grid-cols-3">
        <BracketFrame label="PHOTO CHECK · VERDICT" caption="Photo check — the verdict, as the parent reads it" fill>
          <Ledger
            stacked
            className="h-full"
            rows={VERDICT_ROWS.map((row) => ({
              key: <StatusChip status={row.status} />,
              value: <span className="text-[0.8125rem]">{row.text}</span>,
              id: `verdict-${row.status}-${row.text.slice(0, 12)}`,
            }))}
          />
        </BracketFrame>
        <BracketFrame label="REFERENCE PLATE · THREE VIEWS" caption="Reference plate — approved and locked before a single pose" fictional fill>
          <div className="relative h-full min-h-[220px] w-full">
            <Image src={plate.src} alt={plate.alt} fill sizes={THUMB_SIZES} className="object-contain" />
          </div>
        </BracketFrame>
        <BracketFrame label="PROOF — NOT FINAL" caption="Watermarked proof — what you approve" fictional fill>
          <div className="relative h-full min-h-[220px] w-full">
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
