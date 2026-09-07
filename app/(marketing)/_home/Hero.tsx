// 01 · Hero (DESIGN §5.1-01, COPY §2.1-1). The "after" is composed in code from three faces
// (GAPS #1) — never a flat composite image, never a certificate or a pack.
import Image from "next/image";
import { BeforeAfter } from "../../../components/BeforeAfter";
import { CardFace } from "../../../components/CardFace";
import { CtaPair } from "../../../components/CtaPair";
import { DeliveryChips } from "../../../components/DeliveryChips";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { Mat } from "../../../components/Mat";
import { Pill } from "../../../components/Pill";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { asset } from "../../../lib/assets";
import { formatUsd, getTier, sitePrice, tiers } from "../../../lib/catalog/prices";
import { ctaFor } from "../../../lib/cta";
import { sectionId } from "./Section";

export const HERO_H1 = "THEIR SEASON DESERVES MORE THAN A CAMERA ROLL.";
export const HERO_SUBHEAD = "Custom sports trading cards and posters from your photos. One registered edition per athlete.";

/** {from:digital} — the cheapest enabled tier with no physical goods (COPY §0.2). */
function digitalFrom(now: Date): number {
  const digital = tiers.filter((t) => t.enabled && !t.physical);
  if (!digital.length) throw new Error("Hero: no enabled digital tier for the {from:digital} token");
  return Math.min(...digital.map((t) => sitePrice(t, now)));
}

/**
 * Poster + card front + card back on one stock mat. Presentation scale (the one plate that breaks
 * one-px-per-inch); the poster and the back are `hidden sm:block`, so on a phone the device is the
 * before photo, the arrow and the card front.
 */
function HeroAfter() {
  const front = asset("home.hero.after.front");
  const back = asset("home.hero.after.back");
  const poster = asset("home.hero.after.poster");
  return (
    <div className="w-full">
      <div className="mx-auto w-[7rem] sm:mx-0 sm:w-full">
        <Mat tone="stock">
          <div className="relative w-full sm:aspect-[4/5]">
            <div className="hidden sm:absolute sm:left-0 sm:top-0 sm:block sm:w-[68%]">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none shadow-[var(--shadow-card-stock)]">
                <Image
                  src={poster.src}
                  alt={poster.alt}
                  fill
                  sizes="(max-width: 639px) 1px, (min-width: 1024px) 420px, 60vw"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="hidden sm:absolute sm:left-[51.8%] sm:top-[65.9%] sm:block sm:w-[30%]">
              <CardFace {...back} labelled sizes="(max-width: 639px) 1px, (min-width: 1024px) 160px, 20vw" />
            </div>
            <div className="w-full sm:absolute sm:left-[57.8%] sm:top-[61.1%] sm:w-[34%]">
              <CardFace {...front} labelled sizes="(max-width: 639px) 100px, (min-width: 1024px) 180px, 24vw" />
            </div>
          </div>
        </Mat>
      </div>
      <FictionalLabel className="mt-2" />
    </div>
  );
}

export function Hero({ now }: { now: Date }) {
  const before = asset("home.hero.before");
  const printedSet = getTier("GDE-ANY-SET-PRINT");
  if (!printedSet) throw new Error("Hero: GDE-ANY-SET-PRINT is missing from the ladder");
  return (
    <section aria-labelledby={sectionId(1)} className="pb-12 pt-8 lg:pb-24 lg:pt-16">
      <div className="container-gallery lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
        <div className="lg:col-span-6">
          <SectionHeading
            as="h1"
            id={sectionId(1)}
            title={HERO_H1}
            subhead={HERO_SUBHEAD}
            pills={
              <>
                <Pill tone="accent">FROM YOUR PHOTOS</Pill>
                <Pill tone="outline">REGISTERED EDITION</Pill>
              </>
            }
          />
          <p className="mt-6 font-body text-body font-medium tabular-nums">
            from {formatUsd(digitalFrom(now))} digital · {formatUsd(sitePrice(printedSet, now))} printed set
          </p>
          <DeliveryChips kind="standard" className="mt-4" />
          <CtaPair {...ctaFor("home")} size="lg" className="mt-6" />
          <TrustLine />
        </div>
        <div className="mt-10 lg:col-span-6 lg:mt-0">
          <BeforeAfter before={before} after={<HeroAfter />} beforeSizes="(min-width: 1024px) 168px, 40vw" label="Before and after: a phone photo becomes a registered edition" />
        </div>
      </div>
    </section>
  );
}
