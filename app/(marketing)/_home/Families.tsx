// 03 · Three product families (DESIGN §5.1-03, COPY §2.1-3). The card and set tiles are composed
// from faces — never a listing slide, never the count-bearing printed-set tile (GAPS #12, #34).
import Image from "next/image";
import { CardFace } from "../../../components/CardFace";
import { FamilyCard } from "../../../components/FamilyCard";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { SectionHeading } from "../../../components/SectionHeading";
import { asset } from "../../../lib/assets";
import { fromPrice } from "../../../lib/catalog/prices";
import { HomeSection, sectionId } from "./Section";

export const FAMILIES_H2 = "CHOOSE THEIR EDITION.";
export const FAMILIES_SUBHEAD = "Three ways to keep the season. Every one starts from the same 4–10 photos and ends with a proof you approve.";
export const CERTIFICATE_ROW_LINE = "Free printed Certificate of Authenticity in every shipped package.";

const CARD_SIZES = "(min-width: 1024px) 220px, (min-width: 768px) 26vw, 52vw";
const SMALL_CARD_SIZES = "(min-width: 1024px) 100px, (min-width: 768px) 12vw, 24vw";
const POSTER_SIZES = "(min-width: 1024px) 260px, (min-width: 768px) 30vw, 60vw";

function CardsMedia() {
  const front = asset("home.hero.after.front");
  const back = asset("home.hero.after.back");
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

function SetMedia() {
  const front = asset("home.hero.after.front");
  const back = asset("home.hero.after.back");
  const poster = asset("home.hero.after.poster");
  return (
    <div className="relative aspect-[4/5] w-full">
      <div className="absolute left-[6%] top-[4%] w-[70%]">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-arena)]">
          <Image src={poster.src} alt={poster.alt} fill sizes={POSTER_SIZES} className="object-contain" />
        </div>
      </div>
      <div className="absolute left-[56%] top-[62%] w-[22%]">
        <CardFace {...back} labelled surface="arena" sizes={SMALL_CARD_SIZES} />
      </div>
      <div className="absolute left-[62%] top-[58%] w-[26%]">
        <CardFace {...front} labelled surface="arena" sizes={SMALL_CARD_SIZES} />
      </div>
    </div>
  );
}

export function Families({ now }: { now: Date }) {
  return (
    <HomeSection n={3} container="gallery">
      <SectionHeading as="h2" id={sectionId(3)} index="03 / 13" title={FAMILIES_H2} subhead={FAMILIES_SUBHEAD} />
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
        <FamilyCard
          family="cards"
          from={fromPrice("cards", now)}
          media={<CardsMedia />}
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
          image={asset("posters.room")}
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
          media={<SetMedia />}
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
      <p className="mt-6 max-w-[62ch] font-body text-body font-medium">{CERTIFICATE_ROW_LINE}</p>
      <FictionalLabel className="mt-4" />
    </HomeSection>
  );
}
