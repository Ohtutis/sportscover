// 04 · Proof before print — the one arena band on the home page (DESIGN §5.1-04, COPY §2.1-4).
import Image from "next/image";
import { BracketFrame } from "../../../components/BracketFrame";
import { ButtonLink } from "../../../components/ButtonLink";
import { Pill } from "../../../components/Pill";
import { asset } from "../../../lib/assets";
import { block } from "../../../lib/blocks";
import { ArrowLink, BlockTitle, HomeHeading, HomeSection, SectionRule, sectionId } from "./Section";

export const PROOF_H2 = "NOTHING PRINTS UNTIL YOU SAY SO.";
export const PROOF_PILL = "YOU SEE IT FIRST";
export const PROOF_CAPTION = "A watermarked proof, exactly as you receive it — Senior Night edition, baseball.";
export const PROMISE_TITLE = "OUR PROMISE";

export function ProofBand() {
  const proof = asset("home.proof");
  return (
    <HomeSection n={4} container="gallery" tone="arena" className="bg-arena py-12 text-white md:py-20 lg:py-24">
      {/* The pill sits ON the rule, like the pill of every other section: in the right-hand column it
          stood above the H2 and pushed the two columns out of alignment (review 2026-09-07). */}
      <SectionRule n={4} tone="arena" rail={<Pill tone="accent">{PROOF_PILL}</Pill>} />
      <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-10">
        {/* 6 / 6, not 7 / 5: at seven columns the proof stood 631 px against the argument's 371, and a
            centred row that far apart insets the short column 130 px top and bottom. */}
        <div className="lg:col-span-6">
          <BracketFrame tone="arena" label="PROOF — NOT FINAL" caption={PROOF_CAPTION} fictional>
            <div className="relative aspect-[1400/1092] w-full overflow-hidden shadow-[var(--shadow-card-arena)]">
              <Image src={proof.src} alt={proof.alt} fill sizes="(min-width: 1024px) 600px, 92vw" className="object-contain" />
            </div>
          </BracketFrame>
        </div>
        <div className="mt-10 lg:col-span-6 lg:mt-0">
          <HomeHeading id={sectionId(4)} title={PROOF_H2} tone="arena" className="-mt-6 text-white" />
          <BlockTitle tone="arena" className="mt-8">
            {PROMISE_TITLE}
          </BlockTitle>
          <p className="mt-4 max-w-[62ch] font-body text-body text-pretty text-white/90">{block("our-promise")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/guarantee" variant="outline-arena">
              Read the full promise
            </ButtonLink>
            <ArrowLink href="/how-it-works" tone="arena">
              See how it's made
            </ArrowLink>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
