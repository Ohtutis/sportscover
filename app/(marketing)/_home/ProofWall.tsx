// 10 · Proof wall — honest social proof (DESIGN §5.1-10, COPY §2.1-10). No reviews block, no
// placeholder and no reserved space while `publishedReviews()` is empty.
//
// Owner review 2026-09-07: eight card fronts at 94 px in an 8 px grid was texture, not evidence — at
// that size you cannot tell one edition from another, which is the only thing the block is for. Four
// fronts at roughly 250 px say it instead. The three columns also ended at three different heights
// (400 / 508 / 292 px, the last leaving ~490 px of empty band), and the section carried three separate
// fictional credits. Now: two columns of evidence that end together, one credit for the group under
// the pair, and "We are new" as a full-width line under both — it is an admission about the studio,
// not a third exhibit.
import { CardFace } from "../../../components/CardFace";
import { ProofRejectedPair } from "../../../components/ProofRejectedPair";
import { SectionHeading } from "../../../components/SectionHeading";
import { assetOrNull, type ImageSpec } from "../../../lib/assets";
import { CANON } from "../../../lib/copy/canon";
import { ArrowLink, BlockTitle, HomeSection, sectionId, sectionIndex } from "./Section";

export const PROOF_WALL_H2 = "WHAT TO JUDGE US ON, DAY ONE.";
export const GALLERY_TITLE = "Example editions";
export const PAIR_TITLE = "One rejected take, one approved";
export const NEW_TITLE = "We are new";

/** The four sports the gallery shows, in COPY order — four you can read beat eight you cannot. */
export const GALLERY_SPORTS = ["basketball", "football", "softball", "cheerleading"] as const;

export function ProofWall() {
  const gallery = GALLERY_SPORTS.map((slug) => ({ slug, face: assetOrNull(`sport.${slug}.front`) })).filter(
    (g): g is { slug: (typeof GALLERY_SPORTS)[number]; face: ImageSpec } => g.face !== null,
  );
  const fail = assetOrNull("home.rejected.fail");
  const pass = assetOrNull("home.rejected.pass");
  return (
    <HomeSection n={10} container="gallery">
      <SectionHeading as="h2" id={sectionId(10)} index={sectionIndex(10)} title={PROOF_WALL_H2} />
      <div className="mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="lg:col-span-5">
          <BlockTitle>{GALLERY_TITLE}</BlockTitle>
          <ul className="mt-5 grid grid-cols-2 gap-5">
            {gallery.map(({ slug, face }) => (
              <li key={slug}>
                <CardFace {...face} labelled sizes="(min-width: 1024px) 260px, 44vw" />
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[62ch] font-body text-[0.75rem] font-medium leading-[1.4] tracking-[0.01em] text-muted-text">{CANON.galleryCaption}</p>
          <ArrowLink href="/trading-cards#sports" className="mt-5">
            All seventeen sports
          </ArrowLink>
        </div>
        {/* The pair carries an argument about two jerseys, so it gets the wider column of the two, and
            it is the one exhibit on this page that must be readable at a glance. It carries the
            group's C13 (`ProofRejectedPair`), so nothing else in the section repeats it. */}
        <div className="mt-12 lg:col-span-7 lg:mt-0">
          <BlockTitle>{PAIR_TITLE}</BlockTitle>
          {fail && pass ? (
            <ProofRejectedPair fail={fail} pass={pass} className="mt-5" />
          ) : (
            <p className="mt-5 max-w-[62ch] font-body text-body text-pretty">
              Every frame is checked against the reference plate before it reaches a finish. A frame that does not match is remade, not shipped.
            </p>
          )}
          <ArrowLink href="/how-it-works#gates" className="mt-5">
            See all six gates
          </ArrowLink>
        </div>
      </div>
      <div className="mt-12 border-t border-hairline pt-8 lg:mt-16 lg:flex lg:items-baseline lg:gap-10">
        <BlockTitle className="lg:w-[16ch] lg:shrink-0">{NEW_TITLE}</BlockTitle>
        <div className="mt-4 lg:mt-0">
          <p className="max-w-[62ch] font-body text-body text-pretty">{CANON.weAreNewShort}</p>
          <ArrowLink href="/guarantee" className="mt-4">
            Read the promise
          </ArrowLink>
        </div>
      </div>
    </HomeSection>
  );
}
