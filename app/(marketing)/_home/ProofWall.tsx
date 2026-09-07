// 10 · Proof wall — honest social proof (DESIGN §5.1-10, COPY §2.1-10). No reviews block, no
// placeholder and no reserved space while `publishedReviews()` is empty.
import { CardFace } from "../../../components/CardFace";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { ProofRejectedPair } from "../../../components/ProofRejectedPair";
import { SectionHeading } from "../../../components/SectionHeading";
import { assetOrNull, type ImageSpec } from "../../../lib/assets";
import { CANON } from "../../../lib/copy/canon";
import { ArrowLink, BlockTitle, HomeSection, sectionId } from "./Section";

export const PROOF_WALL_H2 = "WHAT TO JUDGE US ON, DAY ONE.";
export const GALLERY_TITLE = "Example editions";
export const PAIR_TITLE = "One rejected take, one approved";
export const NEW_TITLE = "We are new";

/** The eight sports the gallery shows, in COPY order. */
export const GALLERY_SPORTS = ["basketball", "football", "baseball", "softball", "soccer", "volleyball", "cheerleading", "wrestling"] as const;

export function ProofWall() {
  const gallery = GALLERY_SPORTS.map((slug) => ({ slug, face: assetOrNull(`sport.${slug}.front`) })).filter(
    (g): g is { slug: (typeof GALLERY_SPORTS)[number]; face: ImageSpec } => g.face !== null,
  );
  const fail = assetOrNull("home.rejected.fail");
  const pass = assetOrNull("home.rejected.pass");
  return (
    <HomeSection n={10} container="gallery">
      <SectionHeading as="h2" id={sectionId(10)} index="10 / 13" title={PROOF_WALL_H2} />
      <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <BlockTitle>{GALLERY_TITLE}</BlockTitle>
          <ul className="mt-4 grid grid-cols-4 gap-3 lg:gap-2">
            {gallery.map(({ slug, face }) => (
              <li key={slug}>
                <CardFace {...face} labelled surface="arena" sizes="(min-width: 1024px) 100px, 22vw" />
              </li>
            ))}
          </ul>
          <p className="mt-3 max-w-[62ch] font-body text-[0.75rem] font-medium leading-[1.4] tracking-[0.01em] text-muted-text">{CANON.galleryCaption}</p>
          <FictionalLabel className="mt-2" />
          <ArrowLink href="/trading-cards#sports" className="mt-4">
            All seventeen sports
          </ArrowLink>
        </div>
        {/* The pair carries an argument about two jerseys, so it gets the widest column of the three:
            at 5 of 12 each frame is ~190 px instead of the ~130 px that made the kits indistinguishable,
            and the FAIL sentence falls to three lines against the PASS title (review 2026-09-07). */}
        <div className="mt-10 lg:col-span-5 lg:mt-0">
          <BlockTitle>{PAIR_TITLE}</BlockTitle>
          {fail && pass ? (
            <ProofRejectedPair fail={fail} pass={pass} className="mt-4" />
          ) : (
            <p className="mt-4 max-w-[62ch] font-body text-body text-pretty">
              Every frame is checked against the reference plate before it reaches a finish. A frame that does not match is remade, not shipped.
            </p>
          )}
          <ArrowLink href="/how-it-works#gates" className="mt-4">
            See all six gates
          </ArrowLink>
        </div>
        <div className="mt-10 lg:col-span-3 lg:mt-0">
          <BlockTitle>{NEW_TITLE}</BlockTitle>
          <p className="mt-4 max-w-[62ch] font-body text-body text-pretty">{CANON.weAreNewShort}</p>
          <ArrowLink href="/guarantee" className="mt-4">
            Read the promise
          </ArrowLink>
        </div>
      </div>
    </HomeSection>
  );
}
