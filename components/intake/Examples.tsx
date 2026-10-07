import type { FreeProofArtMap, FreeProofImage } from "../../lib/intake/sport-art";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { Arrow } from "../BeforeAfter";
import { FictionalLabel } from "../FictionalLabel";
import { ArtImage, PhotoPrint } from "./visuals";

/** The three sports shown before → after (ads brief §9): the showcase, a girl's sport, the biggest sport. */
export const EXAMPLE_SPORTS = ["football", "volleyball", "basketball"] as const;

const KEY = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";
const PHOTO_SIZES = "(min-width: 1024px) 180px, (min-width: 640px) 28vw, 44vw";
const ART_SIZES = "(min-width: 1024px) 220px, (min-width: 640px) 30vw, 48vw";

/** Two of the athlete's phone photos, the everyday one behind, the one in kit on top. */
function TwoPhotos({ photos }: { photos: readonly FreeProofImage[] }) {
  const [everyday, , kit] = photos;
  return (
    <div className="relative aspect-[4/3] w-full">
      <PhotoPrint image={everyday} sizes={PHOTO_SIZES} className="absolute left-0 top-0 w-[58%] -rotate-3" decorative={false} />
      <PhotoPrint image={kit} sizes={PHOTO_SIZES} className="absolute bottom-0 right-0 w-[58%] rotate-2" />
    </div>
  );
}

/** The finished edition: the poster and the card front side by side, nothing on them. */
function Edition({ poster, card }: { poster: FreeProofImage; card: FreeProofImage }) {
  return (
    <div className="flex items-end justify-center gap-[5%]">
      <span className="relative block aspect-[3/4] w-[52%] overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
        <ArtImage image={poster} sizes={ART_SIZES} />
      </span>
      <span className="relative block aspect-[5/7] w-[40%] overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
        <ArtImage image={card} sizes={ART_SIZES} />
      </span>
    </div>
  );
}

/**
 * "From camera roll to collectible" (ads brief §9, 2026-10-07): three athletes, their phone photos over an
 * arrow into their finished poster and card. Almost no words — the pictures are the argument for a parent who
 * arrived from an ad. Every athlete is a fictional roster athlete (C13 once under the row). Server-rendered
 * from the same art map the form uses; a sport missing a piece is left out rather than faked.
 */
export function Examples({ art, className = "" }: { art: FreeProofArtMap; className?: string }) {
  const rows = EXAMPLE_SPORTS.map((slug) => ({ slug, entry: art[slug] })).filter(
    (r) => r.entry && r.entry.photos && r.entry.photos.length >= 3 && r.entry.poster && r.entry.cards.SN,
  );
  if (!rows.length) return null;
  const c = INTAKE_COPY.examples;
  return (
    <section id="examples" aria-labelledby="examples-title" className={`scroll-mt-20 py-16 md:py-20 lg:py-24 lg:scroll-mt-24 ${className}`.trim()}>
      <div className="border-t border-hairline pt-3">
        <p className={KEY}>{c.label}</p>
      </div>
      <h2 id="examples-title" className="mt-6 max-w-[16ch] font-display text-h2 uppercase text-balance">
        {c.title}
      </h2>
      <p className="mt-4 max-w-[52ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub">{c.line}</p>
      <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-3 lg:mt-12">
        {rows.map(({ slug, entry }) => (
          <li key={slug} data-example-sport={slug} className="min-w-0">
            <p className={KEY}>{c.before}</p>
            <div className="mt-3">
              <TwoPhotos photos={entry!.photos!} />
            </div>
            <div className="my-4 flex justify-center">
              <Arrow direction="down" size="h-10 w-6 rotate-90" />
            </div>
            <p className={KEY}>{c.after}</p>
            <div className="mt-3">
              <Edition poster={entry!.poster!} card={entry!.cards.SN!} />
            </div>
          </li>
        ))}
      </ul>
      <FictionalLabel className="mt-8" />
    </section>
  );
}
