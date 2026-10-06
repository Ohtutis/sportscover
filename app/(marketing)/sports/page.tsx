// /sports — the hub (SEO plan 2026-10-06 §4, spec §4.5). It owns the by-sport question
// (lib/seo/intents.ts: "custom sports cards by sport") and nothing a sport page owns: every sport in
// roster order with its card front and the one line hubLine() computes from the catalog, a link to the
// sport's own page where one exists and to the free-proof form with the sport chosen where none does,
// then how the card decides what the back of the kit shows — the three groups backLine() sorts the
// roster into. No number on this page is typed: the count is `sports.length`.

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CardFace } from "../../../components/CardFace";
import { CtaPair } from "../../../components/CtaPair";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrustLine } from "../../../components/TrustLine";
import { Shield } from "../../../components/brand/Shield";
import { assetOrNull } from "../../../lib/assets";
import { backLine, sports, type BackLine, type Sport } from "../../../lib/catalog/sports";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor, freeProofHref } from "../../../lib/cta";
import { pageMeta } from "../../../lib/seo/meta";
import { hubLine, hubTiles } from "../../../lib/seo/sport-facts";
import { NO_EXAMPLE_YET, SPORT_GRID_COLUMNS } from "../(families)/_shared/numberless-block";

/**
 * The titles-table row through pageMeta(), minus its `openGraph.images`: Next applies ./opengraph-image.tsx
 * only when the segment's openGraph has no `images` key at all (next/dist/lib/metadata/resolve-metadata.js,
 * `hasOwnProperty('images')`), and pageMeta() always names /og.webp.
 */
function withoutOgImages(meta: Metadata): Metadata {
  if (!meta.openGraph) return meta;
  const openGraph = { ...meta.openGraph } as Record<string, unknown>;
  delete openGraph.images;
  return { ...meta, openGraph: openGraph as Metadata["openGraph"] };
}

export const metadata: Metadata = withoutOgImages(pageMeta("/sports"));

/** The head phrase the hub owns, in the searcher's word order (lib/seo/intents.ts). ./opengraph-image.tsx sets the same line. */
const H1 = "CUSTOM SPORTS CARDS BY SPORT.";

/** The caption under a sport that has no page of its own: its tile opens the free-proof form instead. */
const BUILT_TO_ORDER = "Built to order";

/** NO_EXAMPLE_YET's second half ("no example card yet."), so the empty tile and the families' grid say the same thing. */
const NO_EXAMPLE_LINE = (() => {
  const tail = NO_EXAMPLE_YET.split(" — ")[1] ?? NO_EXAMPLE_YET;
  return `${tail.charAt(0).toUpperCase()}${tail.slice(1)}`;
})();

/** The families' grid steps (SPORT_GRID_COLUMNS): three columns on a phone, five from md, six from xl. */
const TILE_SIZES = "(min-width: 1280px) 200px, (min-width: 768px) 20vw, 32vw";

/** The three things the back of the kit can show, in the order the hub explains them. */
const BACK_ORDER: readonly BackLine[] = ["their number", "plain back", "their name, their club crest"];

const capitalize = (s: string): string => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

/** "Wrestling, Track & Field and Skateboarding" — the catalog's names, no serial comma (as C9 writes them). */
function joinNames(list: Sport[]): string {
  const names = list.map((s) => s.name);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : (names[0] ?? "");
}

/** A card box with no export behind it yet (pickleball, skateboarding): 5 : 7, radius 0, navy, the silver shield. */
function EmptyTile() {
  return (
    <div className="flex aspect-[5/7] flex-col items-center justify-center gap-3 rounded-none border border-white/15 bg-navy p-[10%] text-center shadow-[var(--shadow-card-stock)]">
      <Shield tone="arena" size={32} />
      <span className="font-body text-small text-white/75">{NO_EXAMPLE_LINE}</span>
    </div>
  );
}

function SportTile({ sport, href, hasPage }: { sport: Sport; href: string; hasPage: boolean }) {
  const face = assetOrNull(`sport.${sport.slug}.front`);
  const target = hasPage ? href : freeProofHref({ products: ["cards", "poster"], sport: sport.slug });
  return (
    <li data-sport-tile={sport.slug}>
      <Link href={target} className="group block outline-offset-4">
        {face ? <CardFace {...face} labelled sizes={TILE_SIZES} /> : <EmptyTile />}
        <span className="mt-3 block font-body text-small font-bold uppercase tracking-[0.04em] text-ink underline-offset-4 group-hover:underline">
          {sport.name}
        </span>
        <span className="mt-1 block font-body text-small text-pretty text-muted-text">{hubLine(sport)}</span>
        {hasPage ? null : (
          <span className="mt-2 block font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text">{BUILT_TO_ORDER}</span>
        )}
      </Link>
    </li>
  );
}

export default function SportsHubPage() {
  const tiles = hubTiles();
  const cta = ctaFor("home");
  const groups = BACK_ORDER.map((line) => ({ line, members: sports.filter((s) => backLine(s) === line) })).filter((g) => g.members.length > 0);

  return (
    <>
      {/* 01 · The roster: the head phrase, the canon truth line, every sport as its card. */}
      <section aria-labelledby="sports-hub" className="pt-8 pb-14 md:pb-20 lg:pb-24">
        <div className="container-gallery">
          <Breadcrumbs
            trail={[
              { name: "Home", href: "/" },
              { name: "Sports", href: "/sports" },
            ]}
          />
          <SectionHeading as="h1" id="sports-hub" title={H1} className="mt-8" />
          <p data-shared="" className="mt-6 max-w-[62ch] font-body text-[1.125rem] font-medium text-pretty text-ink md:text-sub">
            {CANON.numberlessLine}
          </p>
          <div data-exhibit="" className="mt-12 lg:mt-16">
            <ul className={`grid ${SPORT_GRID_COLUMNS} gap-x-4 gap-y-10`}>
              {tiles.map((tile) => (
                <SportTile key={tile.sport.slug} {...tile} />
              ))}
            </ul>
            <FictionalLabel className="mt-8" />
          </div>
        </div>
      </section>

      {/* 02 · How the card decides what the back of the kit shows — backLine() and hubLine(), never typed per sport. */}
      <section aria-labelledby="sports-how" className="py-14 md:py-20 lg:py-24">
        <div className="container-site">
          <SectionHeading as="h2" id="sports-how" index="02 / 02" title="HOW THE CARD DECIDES." />
          <ol className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3 lg:mt-12">
            {groups.map((group, i) => (
              <li key={group.line} className="border-t border-hairline pt-4">
                <span aria-hidden="true" className="font-display text-h3 leading-none tabular-nums text-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-h3 uppercase">{capitalize(group.line)}</h3>
                <p className="mt-3 max-w-[40ch] font-body text-body text-pretty text-ink">{hubLine(group.members[0])}</p>
                <p className="mt-2 max-w-[40ch] font-body text-small text-pretty text-muted-text">{joinNames(group.members)}.</p>
              </li>
            ))}
          </ol>
          <div data-shared="" className="mt-14 border-t border-hairline pt-8">
            <CtaPair {...cta} size="lg" />
            <TrustLine className="mt-5" />
          </div>
        </div>
      </section>
    </>
  );
}
