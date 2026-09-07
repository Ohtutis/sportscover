// /about — COPY §2.9, DESIGN §5.7 (stock). Person JSON-LD only: Organization is already emitted once
// in the root layout and is never emitted twice (CONTRACTS §5.5).
//
// GAPS #19: the imprint is gated on imprintComplete(). Until the env vars exist section 5 does not
// render at all — neither its heading nor its closing line — and the COPY §1.2 fallback sentence
// closes the studio-and-partners section instead. The founder photo renders only when the file exists
// (founderPhotoExists(), `about.founder` is still `locate`) — never a generated portrait, never a
// reserved empty slot.

import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CtaPair } from "../../../components/CtaPair";
import { FounderNote } from "../../../components/FounderNote";
import { JsonLd } from "../../../components/JsonLd";
import { Ledger } from "../../../components/Ledger";
import { SectionHeading } from "../../../components/SectionHeading";
import { TrueNumbers } from "../../../components/TrueNumbers";
import { TrustLine } from "../../../components/TrustLine";
import { block } from "../../../lib/blocks";
import { LABS_SENTENCE, visiblePartners } from "../../../lib/catalog/shipping";
import { FILE_COUNTS, type TrueCountLink } from "../../../lib/catalog/tiers";
import { ctaFor } from "../../../lib/cta";
import { person } from "../../../lib/seo/jsonld";
import { pageMeta } from "../../../lib/seo/meta";
import { IMPRINT, imprintComplete, OWNER_CITY, OWNER_NAME, SUPPORT_EMAIL } from "../../../lib/site";

export const revalidate = 3600;
export const metadata = pageMeta("/about");

const PATH = "/about";

/** The story spine (COPY §2.9 (1), owner's 2026-09-06 version). Bold leads render in `font-medium`. */
const STORY: { lead?: string; text: string }[] = [
  {
    text: "Game Day Edition started with a simple observation: kids who love their sport end up with hundreds of photos on a phone and nothing on their wall.",
  },
  {
    text: "So that is what we make. You send the photos you already have — a few clear shots of your athlete. We design a poster and a set of collectible trading cards around them: their name, their number where the sport has one, their team colors, their season. Then we print them properly, square-cut on real card stock, the way a card is supposed to feel in a kid's hand.",
  },
  {
    lead: "What makes it different.",
    text: "This is not a template with a photo dropped in. Every piece is composed for the athlete in it — the crop, the light, the type, the color. Six finishes, each with its own materials and mood, from a floodlit stadium at night to high-contrast chrome. Seventeen sports, from basketball and football to gymnastics, wrestling and pickleball.",
  },
  {
    lead: "How it is made.",
    text: "Each piece is designed here, not pulled off a shelf. We use AI imaging tools as part of the creative process, and every composition, likeness, spelling, color and detail is reviewed and finished by a person before it reaches you. If it does not look like your athlete, it does not ship. Nothing goes to print until you have seen it. You get a proof first. If something is wrong — the number, the spelling, the crop — it gets fixed before anything is printed.",
  },
  {
    lead: "About your photos.",
    text: "We ask for 4 to 10 photos and nothing else. No date of birth, no home address, no school name. Your athlete's photos are used for your order and for nothing else. They are never posted, shared, or used to promote this studio unless you give permission separately, after the work is done. And if the photos you have are not strong enough to do the job well, we will tell you before any art is made.",
  },
  {
    lead: "Who it is for.",
    text: "Senior nights. End-of-season gifts. Grandparents who want something for the wall that is not a school portrait. First-year players and last-year players. Adults who still compete.",
  },
];

const REGISTRY_ESSAY =
  "A trading card is a claim: this player, this season, this edition. A photo print makes no claim; it is just a nice picture. That is why every card we make carries its registered card ID on the back and opens its own page here — the edition, the finish, the season, the stats, the date it was registered. One registered edition per athlete, per finish, per season. Physical cards are not individually numbered; the record is the registration, not a serial. We keep every registered page online for at least five years from the order, and if the studio ever winds down we keep the registry resolving for that period or tell you how to keep a copy. The domain is locked and renews on its own. A kid who scans the card in 2031 should see what their parent saw in 2026.";

const PROOF_ESSAY =
  "Every edition goes through the same six gates: a photo check that says which photos can carry the likeness; a kit plate copied from your photos; a reference plate of your athlete — three views — that you approve before a single pose is made; four shots built from that plate; a verification sheet where every crest, number and mark on a frame must have a twin on the plate and the face must measure as the same person; and a watermarked proof you approve before anything prints. About fifty frames are generated for one athlete. Four ship. The rest are the rejected takes — the kit that changed between shots, the frame that drifted from the plate — and they are the reason the promise can say what it says.";

/**
 * COPY §2.9 (6). The page used to set five figures of its own (17 · 7 · 27 · 2026 · 2.5 × 3.5) directly
 * above the footer's five different ones — two score bugs on one screen, saying different things
 * (review 2026-09-07). The three the footer already proves (17 · 7 · 2.5 × 3.5) are dropped here: the
 * site has ONE set of true numbers and it is the catalog's, in the footer of this very page. What is
 * left is what only this page carried, and it says nothing the strip below it repeats.
 */
const ABOUT_NUMBERS: TrueCountLink[] = [
  {
    figure: String(FILE_COUNTS.set),
    label: `${FILE_COUNTS.set} files and one live page in every complete set`,
    href: "/complete-set#spec",
    numeral: true,
  },
  { figure: "2026", label: "Registry live since August 2026", href: "/registry" },
];

const IMPRINT_FALLBACK = `Game Day Edition is an independent custom design studio operated from Lithuania. ${SUPPORT_EMAIL}`;

function Essay({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div>
      <SectionHeading as="h2" id={id} title={title} />
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function AboutPage() {
  const complete = imprintComplete();
  const cta = ctaFor("home");
  const partners = visiblePartners();

  const founderRows = [
    { key: "Name", value: OWNER_NAME },
    { key: "Role", value: "Designer and founder" },
    ...(OWNER_CITY ? [{ key: "City", value: OWNER_CITY }] : []),
    {
      key: "Contact",
      value: (
        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline-offset-4 decoration-1 hover:underline">
          {SUPPORT_EMAIL}
        </a>
      ),
    },
  ];

  return (
    <>
      <JsonLd data={person()} />

      {/* 1 — who is asking */}
      <section className="pt-6 pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "About", href: PATH }]} />
          {/*
            The opener answers the question the H1 asks, beside it (owner review 2026-09-07). It used
            to be a three-row ledger in a narrow rail against nine hundred pixels of story: the rail
            ended before the second paragraph and left a column of empty stock under it, while the
            right half of the heading row sat empty. Two stretched columns, then the story at its own
            measure underneath.
          */}
          <div className="mt-6 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading
                as="h1"
                title="WHO IS ASKING FOR YOUR ATHLETE'S PHOTOS."
                subhead="A designer in Lithuania, three professional labs in the US, and a registry that outlives the season."
              />
            </div>
            <div className="mt-8 lg:col-span-6 lg:mt-0">
              <div className="flex h-full flex-col justify-center">
                <Ledger rows={founderRows} />
              </div>
            </div>
          </div>
          <div className="mt-8 lg:mt-12">
            {STORY.map((para) => (
              <p key={para.text.slice(0, 40)} className="mt-4 max-w-[62ch] font-body text-body text-pretty text-ink first:mt-0">
                {para.lead ? <span className="font-medium">{para.lead} </span> : null}
                {para.text}
              </p>
            ))}
            <FounderNote variant="about" className="mt-8" />
          </div>
        </div>
      </section>

      {/* 2 — two essays */}
      <section aria-label="Why the registry, and why you see it first" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site grid gap-x-12 gap-y-16 lg:grid-cols-2">
          <Essay id="s-record" title="A CARD WITHOUT A RECORD IS A PHOTO PRINT.">
            <p className="max-w-[62ch] font-body text-body text-pretty text-ink">{REGISTRY_ESSAY}</p>
          </Essay>
          <Essay id="s-first" title="WHY YOU SEE IT FIRST.">
            <p className="max-w-[62ch] font-body text-body text-pretty text-ink">{PROOF_ESSAY}</p>
            <p className="mt-4 font-body text-body">
              <Link href="/how-it-works" className="text-ink underline-offset-4 decoration-1 hover:underline">
                How it&rsquo;s made
              </Link>
            </p>
          </Essay>
        </div>
      </section>

      {/* 3 — independence and marks */}
      <section aria-labelledby="s-independent" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-independent" title="INDEPENDENT, AND WHAT THAT MEANS FOR YOUR CREST." />
          <div className="mt-8 lg:mt-12">
            <p className="max-w-[62ch] font-body text-body text-pretty text-ink">{block("independent-studio")}</p>
            <p className="mt-4 max-w-[62ch] font-body text-body text-pretty text-ink">{block("logo-sentence")}</p>
            <p className="mt-4 max-w-[62ch] font-body text-body font-medium text-pretty text-ink">
              Your school or club&rsquo;s own crest is yours to use and ours to copy exactly; a league mark is neither.
            </p>
          </div>
        </div>
      </section>

      {/* 4 — studio and partners (+ the imprint fallback while GAPS #19 holds) */}
      <section aria-labelledby="s-studio" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-studio" title="DESIGNED IN LITHUANIA. PRINTED IN THE US." />
          <div className="mt-8 lg:mt-12">
            <p className="max-w-[62ch] font-body text-body font-medium text-pretty text-ink">
              Every edition is designed at the studio in Lithuania and printed by professional labs in the United States:
            </p>
            <Ledger className="mt-6" rows={partners.map((p) => ({ id: `partner-${p.key}`, key: p.name, value: p.makes }))} />
            <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-ink">{LABS_SENTENCE}</p>
            {complete ? null : (
              <p className="mt-6 max-w-[62ch] font-body text-small text-muted-text">{IMPRINT_FALLBACK}</p>
            )}
          </div>
        </div>
      </section>

      {/* 5 — the legal entity (only once the imprint is complete — GAPS #19) */}
      {complete ? (
        <section aria-labelledby="s-imprint" className="pb-16 md:pb-24 lg:pb-32">
          <div className="container-site">
            <SectionHeading as="h2" id="s-imprint" title="THE LEGAL ENTITY." />
            <Ledger
              className="mt-8 lg:mt-12"
              rows={[
                { key: "Legal name", value: IMPRINT.legalName },
                { key: "Company code", value: IMPRINT.companyCode },
                ...(IMPRINT.vat ? [{ key: "VAT", value: IMPRINT.vat }] : []),
                { key: "Address", value: IMPRINT.address },
                { key: "Responsible person", value: IMPRINT.responsiblePerson },
                {
                  key: "Contact",
                  value: (
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="underline-offset-4 decoration-1 hover:underline">
                      {SUPPORT_EMAIL}
                    </a>
                  ),
                },
              ]}
            />
            <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-ink">
              Registered in Lithuania. Contact: {SUPPORT_EMAIL}.
            </p>
          </div>
        </section>
      ) : null}

      {/* 6 — the numbers that are true today */}
      <section aria-labelledby="s-numbers" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-numbers" title="THE NUMBERS THAT ARE TRUE TODAY." />
          <TrueNumbers tone="stock" items={ABOUT_NUMBERS} className="mt-8 lg:mt-12" />
          <div className="mt-12">
            <CtaPair primary={cta.primary} secondary={cta.secondary} size="lg" />
            <TrustLine />
          </div>
        </div>
      </section>
    </>
  );
}
