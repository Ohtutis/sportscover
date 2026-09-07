// 03 · Three product families (DESIGN §5.1-03, COPY §2.1-3). The card and set tiles are composed
// from faces — never a listing slide, never the count-bearing printed-set tile (GAPS #12, #34).
//
// Owner review 2026-09-07: each tile leads with a real-life photograph where one exists — the printed
// card on a desk, a framed poster in a room, the printed set on a table — because a flat render shows
// what the thing is and a photograph shows what it is like to own. The composed faces stay as the
// fallback for every key the site map has not verified yet, and the three fallbacks now carry three
// different athletes (cheerleading · basketball · football) so the row shows the range even with no
// photograph at all. Prices and truths are unchanged: the image carries the feeling, not the claim.
import Image from "next/image";
import { CardFace } from "../../../components/CardFace";
import { FamilyCard } from "../../../components/FamilyCard";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { SectionHeading } from "../../../components/SectionHeading";
import { asset, hasAsset, type ImageSpec } from "../../../lib/assets";
import { fromPrice } from "../../../lib/catalog/prices";
import { HomeSection, sectionId, sectionIndex } from "./Section";

export const FAMILIES_H2 = "CHOOSE THEIR EDITION.";
export const FAMILIES_SUBHEAD = "Three ways to keep the season. Every one starts from the same 4–10 photos and ends with a proof you approve.";
export const CERTIFICATE_ROW_LINE = "Free printed Certificate of Authenticity in every shipped package.";

const CARD_SIZES = "(min-width: 1024px) 220px, (min-width: 768px) 26vw, 52vw";
const SMALL_CARD_SIZES = "(min-width: 1024px) 100px, (min-width: 768px) 12vw, 24vw";
const POSTER_SIZES = "(min-width: 1024px) 260px, (min-width: 768px) 30vw, 60vw";

/**
 * The first verified key of the list, or null. `hasAsset()` answers false for a key the map does not
 * carry yet as well as for one that is still `locate`, so a tile that has no photograph falls back to
 * its composed faces rather than to an empty box (CONTRACTS §5.8).
 */
function firstPhoto(keys: readonly string[]): ImageSpec | null {
  for (const key of keys) if (hasAsset(key)) return asset(key);
  return null;
}

/** A card on a desk, in a stand, or in a binder — whichever has landed. */
const CARD_LIFE = ["life.card.desk", "life.card.case", "life.card.binder", "life.card.hand"] as const;
/**
 * A framed poster in a room, WIDEST WALL FIRST (owner review 2026-09-07). The three tiles were three
 * different product scales: the card fills more than half of its photograph, while the single framed
 * poster of `life.poster.room.baseball` is about a tenth of its frame — a room with a poster in it,
 * not a poster. The three-poster wall reads as the product at roughly the card's scale, so it leads;
 * the single-frame rooms stay behind it as fallbacks.
 */
const POSTER_LIFE = ["life.poster.room.wide", "life.poster.room", "life.poster.room.baseball"] as const;
/** The printed set on a real surface — poster and cards in one frame. */
const SET_LIFE = ["life.set.printed", "life.set.deluxe"] as const;

/** Fallback for the card tile: the cheerleading pair — one athlete, front and back, no number. */
function CardsMedia() {
  const front = asset("cards.cheer.front");
  const back = asset("cards.cheer.back");
  return (
    <div className="relative aspect-[4/5] w-full">
      <div className="absolute left-[34%] top-[20.1%] w-[62%]">
        <CardFace {...back} labelled surface="arena" sizes={CARD_SIZES} />
      </div>
      <div className="absolute left-[4%] top-[10.5%] w-[62%]">
        <CardFace {...front} labelled surface="arena" sizes={CARD_SIZES} />
      </div>
    </div>
  );
}

/**
 * Fallback for the set tile: the football athlete's poster and card front, both Fire & Smoke. A tile
 * is one athlete in one finish — the poster and the face beside it are the same order.
 */
function SetMedia() {
  const poster = asset("posters.finish.FS");
  const front = asset("sport.football.front");
  return (
    <div className="relative aspect-[4/5] w-full">
      <div className="absolute left-[6%] top-[4%] w-[70%]">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-arena)]">
          <Image src={poster.src} alt={poster.alt} fill sizes={POSTER_SIZES} className="object-contain" />
        </div>
      </div>
      <div className="absolute left-[58%] top-[58%] w-[30%]">
        <CardFace {...front} labelled surface="arena" sizes={SMALL_CARD_SIZES} />
      </div>
    </div>
  );
}

export function Families({ now }: { now: Date }) {
  const cardsPhoto = firstPhoto(CARD_LIFE);
  const posterPhoto = firstPhoto(POSTER_LIFE) ?? asset("posters.room");
  const setPhoto = firstPhoto(SET_LIFE);
  return (
    <HomeSection n={3} container="gallery">
      <SectionHeading as="h2" id={sectionId(3)} index={sectionIndex(3)} title={FAMILIES_H2} subhead={FAMILIES_SUBHEAD} />
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <FamilyCard
          family="cards"
          from={fromPrice("cards", now)}
          {...(cardsPhoto ? { image: cardsPhoto } : { media: <CardsMedia /> })}
          fictional={false}
          truths={[
            "Front and back, composed from four shots of your athlete",
            "Registered card ID and QR code on the back — the card's own page",
            "Certificate of Authenticity and flip video included",
          ]}
          href="/trading-cards"
          cta="See trading cards"
        />
        <FamilyCard
          family="posters"
          from={fromPrice("posters", now)}
          image={posterPhoto}
          fictional={false}
          truths={[
            "Two print sizes in every order — 18 × 24 and 24 × 36 in, 300 DPI",
            "Phone and desktop wallpapers",
            "Printed matte poster, shipped free in the US",
          ]}
          href="/posters"
          cta="See posters"
        />
        <FamilyCard
          family="set"
          from={fromPrice("set", now)}
          {...(setPhoto ? { image: setPhoto } : { media: <SetMedia /> })}
          fictional={false}
          truths={[
            "Poster plus card front and back, certificate and flip video",
            "Wallpapers and the card's own registered page",
            "Every digital file included with printed sets",
          ]}
          href="/complete-set"
          cta="See the complete set"
        />
      </div>
      <p className="mt-8 max-w-[62ch] font-body text-body font-medium">{CERTIFICATE_ROW_LINE}</p>
      <FictionalLabel className="mt-3" />
    </HomeSection>
  );
}
