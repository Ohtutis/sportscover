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
    <HomeSection n={4} container="gallery" tone="arena" className="bg-arena py-16 text-white lg:py-32">
      <SectionRule n={4} tone="arena" />
      <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
        <div className="lg:col-span-7">
          <BracketFrame tone="arena" label="PROOF — NOT FINAL" caption={PROOF_CAPTION} fictional>
            <div className="relative aspect-[1400/1092] w-full overflow-hidden shadow-[var(--shadow-card-arena)]">
              <Image src={proof.src} alt={proof.alt} fill sizes="(min-width: 1024px) 640px, 92vw" className="object-contain" />
            </div>
          </BracketFrame>
        </div>
        <div className="mt-10 lg:col-span-5 lg:mt-0">
          <Pill tone="accent">{PROOF_PILL}</Pill>
          <HomeHeading id={sectionId(4)} title={PROOF_H2} tone="arena" className="text-white" />
          <BlockTitle tone="arena" className="mt-8">
            {PROMISE_TITLE}
          </BlockTitle>
          <p className="mt-3 max-w-[62ch] font-body text-body text-pretty text-white/90">{block("our-promise")}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
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
