// /how-it-works — COPY §2.6, DESIGN §5.4 (7 sections, stock). Article JSON-LD + the visible 6-item
// FAQ's own FAQPage (CONTRACTS §5.5: two schema blocks are allowed here, never two FAQPages).
// Every artefact comes from lib/assets.ts; gate 1 is HTML by design (GAPS: how.gate.photo-check is
// `locate` on purpose — the verdict is a Ledger, never a screenshot of _intake.json).

import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CtaPair } from "../../../components/CtaPair";
import { DeliveryChips } from "../../../components/DeliveryChips";
import { FaqList } from "../../../components/FaqList";
import { FictionalLabel } from "../../../components/FictionalLabel";
import { GateRow, type Gate } from "../../../components/GateRow";
import { JsonLd } from "../../../components/JsonLd";
import { Ledger } from "../../../components/Ledger";
import { Mat } from "../../../components/Mat";
import { Pill } from "../../../components/Pill";
import { ProofRejectedPair } from "../../../components/ProofRejectedPair";
import { SectionHeading } from "../../../components/SectionHeading";
import { StatusChip } from "../../../components/StatusChip";
import { TrustLine } from "../../../components/TrustLine";
import { asset, assetOrNull, hasAsset, type ImageSpec } from "../../../lib/assets";
import { block } from "../../../lib/blocks";
import { LABS_SENTENCE, visiblePartners } from "../../../lib/catalog/shipping";
import { faqSubset } from "../../../lib/catalog/faq";
import { CANON } from "../../../lib/copy/canon";
import { ctaFor } from "../../../lib/cta";
import { pageMeta } from "../../../lib/seo/meta";
import { article } from "../../../lib/seo/jsonld";
import { pageFor } from "../../../lib/seo/titles";

export const revalidate = 3600;
export const metadata = pageMeta("/how-it-works", { type: "article" });

const PATH = "/how-it-works";
const PUBLISHED = "2026-09-07";
const SECTIONS = 7;
const idx = (n: number) => `0${n} / 0${SECTIONS}`;

/* ---------- gate 1: the verdict, as the parent reads it (HTML, never a screenshot) ---------- */

const VERDICT: { status: "fail" | "note" | "pass"; text: string }[] = [
  {
    status: "fail",
    text: "Photo 3 — 4 people in this photo and no clear subject — send one where the athlete is the closest person to the camera.",
  },
  {
    status: "fail",
    text: "Photo 5 — the eyes are hidden — sunglasses, a visor or a shadow across them; send one where both eyes are visible.",
  },
  {
    status: "note",
    text: "Every photo faces the camera square on — send two more, the head turned about 45° to one side in one and to the other side in the other.",
  },
  { status: "pass", text: "Photos 1, 2, 4, 6 — usable. Anchor: photo 2." },
];

function VerdictCard() {
  return (
    <Ledger
      rows={VERDICT.map((row, i) => ({
        id: `verdict-${i + 1}`,
        key: <StatusChip status={row.status} />,
        value: row.text,
      }))}
    />
  );
}

/* ---------- the hero object ----------
 * DESIGN §5.4-1 gave this page no hero media ("the gates are the media"), and the page opened on a
 * bare heading over two paragraphs. The owner's 2026-09-07 review asks every page to open the way the
 * home page does — and where a real photograph exists, to show it. The one that belongs here is what
 * the six gates are FOR: the finished card in the athlete's own hand. It is a photograph, not a
 * process artefact, so it sits on a mat and not in a BracketFrame; the artefacts keep the brackets.
 * Nothing is preloaded and the box is reserved, so the mobile LCP is still the headline.
 */
const HERO_KEYS = ["moment.card.hallway", "moment.card.bleachers", "life.card.hand"] as const;

/** The first key the manifest has produced, or null. `hasAsset` is safe on a key it has never heard of. */
function firstAsset(keys: readonly string[]): ImageSpec | null {
  for (const key of keys) if (hasAsset(key)) return asset(key);
  return null;
}

function HeroMedia() {
  const shot = firstAsset(HERO_KEYS);
  if (!shot) return null;
  return (
    <figure className="flex w-full flex-col justify-center lg:h-full">
      <Mat tone="arena" className="w-full">
        {/* The photograph keeps its own ratio: a fixed box would crop the showcase frames. */}
        <Image
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          sizes="(min-width: 1024px) 620px, 92vw"
          className="h-auto w-full rounded-none shadow-[var(--shadow-card-arena)]"
        />
      </Mat>
      <figcaption className="mt-3">
        <FictionalLabel />
      </figcaption>
    </figure>
  );
}

/* ---------- gate artefacts that are more than one image ---------- */

const kitFront = asset("how.gate.kit");
const kitBack = asset("how.gate.kit-back");
const plate = asset("how.gate.plate");
const plateBack = assetOrNull("how.gate.plate-back");
const shots = [asset("how.gate.shots.1"), asset("how.gate.shots.2"), asset("how.gate.shots.3"), asset("how.gate.shots.4")];
const verification = asset("how.gate.verification");
const proof = asset("how.gate.finish");
const rejectedFail = assetOrNull("home.rejected.fail");
const rejectedPass = assetOrNull("home.rejected.pass");

function KitPlates() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[kitFront, kitBack].map((spec) => (
        <Image
          key={spec.src}
          src={spec.src}
          alt={spec.alt}
          width={spec.width}
          height={spec.height}
          sizes="(min-width: 1024px) 240px, 45vw"
          className="aspect-square h-auto w-full rounded-none object-contain"
        />
      ))}
    </div>
  );
}

/**
 * Front and back plate in ONE row. The exhibit used to run the front plate full width and hang the
 * back one underneath at half width — three views in row 1, two in row 2, an exhibit taller than the
 * paragraph explaining it (owner review 2026-09-07). Both plates share a ratio, so a flex row with
 * equal basis gives them the same height and the same scale.
 */
function ReferencePlate() {
  return (
    <div className="flex items-start gap-3">
      {[plate, plateBack].filter((spec): spec is ImageSpec => Boolean(spec)).map((spec) => (
        <Image
          key={spec.src}
          src={spec.src}
          alt={spec.alt}
          width={spec.width}
          height={spec.height}
          sizes="(min-width: 1024px) 240px, 45vw"
          className="h-auto min-w-0 flex-1 rounded-none"
        />
      ))}
    </div>
  );
}

function FourShots() {
  return (
    <ol className="grid grid-cols-4 gap-2">
      {shots.map((spec, i) => (
        <li key={spec.src}>
          <Image
            src={spec.src}
            alt={spec.alt}
            width={spec.width}
            height={spec.height}
            sizes="(min-width: 1024px) 120px, 24vw"
            className="aspect-[2/3] h-auto w-full rounded-none object-contain"
          />
          <span className="mt-2 block font-label text-label font-semibold uppercase tracking-[0.12em] tabular-nums text-muted-text">
            {i + 1} / 4
          </span>
        </li>
      ))}
    </ol>
  );
}

const gates: Gate[] = [
  {
    id: "gate-photo-check",
    label: "PHOTO CHECK",
    status: "note",
    artefactName: "the verdict, as the parent reads it",
    tab: "PHOTO CHECK · VERDICT",
    fictional: false,
    wide: true,
    body: (
      <>
        <p>
          Before a cent is spent we look at every photo you sent and tell you, in plain words, which ones can carry the likeness
          and what would fix the rest. The reasons are things you can act on — never &ldquo;validation failed&rdquo;.
        </p>
        <p className="mt-4 font-medium">
          If your photos can&rsquo;t carry the likeness and you have no stronger ones, you get every cent back — before any art
          is made.
        </p>
        <p className="mt-4">
          <Link
            href="/photo-guide"
            className="inline-flex min-h-11 items-center gap-1.5 font-body text-small text-ink underline-offset-4 decoration-1 hover:underline"
          >
            What to send <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </>
    ),
    artefactNode: <VerdictCard />,
    artefact: {
      src: "",
      alt: "Photo-check verdict as the parent reads it — example order",
      caption: "Photo-check verdict as the parent reads it — example order",
      width: 0,
      height: 0,
    },
  },
  {
    id: "gate-kit",
    label: "KIT BUILD",
    status: "pass",
    artefactName: "the kit plate",
    tab: "KIT PLATE · FRONT / BACK",
    body: (
      <>
        <p>
          The kit is a property of the sport, not the person: shirt, shorts, socks, footwear and your crest, copied from your
          photos exactly as they are. Nothing on the kit is invented — a mark the photos don&rsquo;t show is a mark that
          doesn&rsquo;t exist.
        </p>
        <p className="mt-4">{block("logo-sentence")}</p>
      </>
    ),
    sideNote:
      "A re-rolled plate once came back with a league shield where the club crest had been. It never left the studio — that is what this gate is for.",
    artefactNode: <KitPlates />,
    artefact: {
      src: kitFront.src,
      alt: kitFront.alt,
      caption: "Kit plate: the athlete's real kit, front and back, built once and reused for every shot",
      width: kitFront.width,
      height: kitFront.height,
    },
  },
  {
    id: "likeness",
    label: "REFERENCE PLATE",
    status: "pass",
    artefactName: "three views of your athlete",
    tab: "REFERENCE PLATE · THREE VIEWS",
    body: (
      <p>
        From your photos we build one reference of your athlete — front and both sides — and lock it before a single pose is
        made. You see it first and answer by email: &ldquo;that&rsquo;s them&rdquo;, or what&rsquo;s off — jaw, hair, build.
        The plate is the anchor; every later shot is measured against it.
      </p>
    ),
    artefactNode: <ReferencePlate />,
    artefact: {
      src: plate.src,
      alt: plate.alt,
      caption: "Reference plate: three views of a fictional athlete built from their photos",
      width: plate.width,
      height: plate.height,
    },
  },
  {
    id: "gate-shots",
    label: "THE SHOTS",
    status: "pass",
    artefactName: "four frames",
    tab: "THE SHOTS · 1–4",
    body: (
      <p>
        Four shots from the locked plate — a hero, two action frames and a back or celebration frame. Hands are asked for, not
        repaired: five separated fingers doing something real is in the brief for every pose. When a frame is right except for
        one detail, that one detail is changed and nothing else moves.
      </p>
    ),
    artefactNode: <FourShots />,
    artefact: {
      src: shots[0].src,
      alt: shots[0].alt,
      caption: "Four shots of one fictional athlete — hero, two action frames, back",
      width: shots[0].width,
      height: shots[0].height,
    },
  },
  {
    id: "gate-verification",
    label: "VERIFICATION",
    status: "pass",
    artefactName: "the frame beside its plate",
    tab: "FRAME BESIDE ITS PLATE",
    body: (
      <p>
        Every frame goes next to the plate in one picture. Every crest, number and mark on the frame must have a twin on the
        plate, and the face must measure as the same person. No scores are shown to anyone — a frame passes or it doesn&rsquo;t,
        and a frame that doesn&rsquo;t never reaches the finish.
      </p>
    ),
    artefact: {
      src: verification.src,
      alt: verification.alt,
      caption: "Verification sheet: a frame beside its reference plate — every mark must have a twin",
      width: verification.width,
      height: verification.height,
    },
  },
  {
    id: "gate-finish",
    label: "FINISH",
    status: "pass",
    artefactName: "the watermarked proof",
    tab: "PROOF — NOT FINAL",
    body: (
      <p>
        The finish is built around the shots — the type, the material, your team colors — and a watermarked proof comes to you.{" "}
        {CANON.proofChecklist} One revision is included. Approve, and the files are released; for printed packages, printing
        starts that moment.
      </p>
    ),
    artefact: {
      src: proof.src,
      alt: proof.alt,
      caption: "Watermarked proof of a custom card — what you approve",
      width: proof.width,
      height: proof.height,
    },
  },
];

/* ---------- section 5: the ten states ---------- */

const TIMELINE: { name: string; note?: string; approval?: string }[] = [
  { name: "PAID" },
  { name: "PHOTOS RECEIVED" },
  { name: "PHOTO CHECK", note: "passed · needs more photos · declined and refunded" },
  { name: "REFERENCE PLATE", approval: "your approval, by email" },
  { name: "THE SHOTS" },
  { name: "PROOF", approval: "your approval, on your order page" },
  { name: "FILES READY" },
  { name: "PRINTING", note: "per package" },
  { name: "SHIPPED", note: "per package, tracked" },
  { name: "DELIVERED" },
];

function Timeline() {
  return (
    <ol className="border-l border-hairline lg:flex lg:border-l-0 lg:border-t lg:border-hairline">
      {TIMELINE.map((state) => (
        <li key={state.name} className="relative min-w-0 flex-1 py-4 pl-6 lg:py-6 lg:pl-0 lg:pr-4 lg:pt-6">
          <span
            aria-hidden="true"
            className={`absolute left-0 top-6 size-2.5 -translate-x-1/2 rounded-full lg:left-0 lg:top-0 lg:-translate-y-1/2 lg:translate-x-0 ${
              state.approval ? "size-3 bg-stock ring-[3px] ring-accent" : "bg-ink"
            }`}
          />
          <span className="block font-display text-[0.875rem] uppercase leading-tight text-ink">{state.name}</span>
          {state.approval ? (
            <span className="mt-1 block font-body text-[0.75rem] font-medium italic leading-[1.4] text-muted-text">
              {state.approval}
            </span>
          ) : null}
          {state.note ? (
            <span className="mt-1 block font-body text-[0.75rem] font-medium leading-[1.4] text-muted-text">{state.note}</span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/* ---------- page ---------- */

export default function HowItWorksPage() {
  const meta = pageFor(PATH);
  const cta = ctaFor("home");
  const faq = faqSubset("how-it-works");

  return (
    <>
      <JsonLd
        data={article({
          title: meta.title,
          description: meta.description,
          path: PATH,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          image: proof.src,
        })}
      />

      {/* 01 — hero */}
      <section className="pt-6 pb-16 md:pb-24 lg:pb-32">
        {/* The page container, not the gallery one (DESIGN §5.4-1): every section below is
            `container-site`, and a wider hero would jog the left edge on the first scroll. */}
        <div className="container-site">
          <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "How it's made", href: PATH }]} />
          {/*
            The opener follows the home page's rhythm (owner review 2026-09-07): H1 → subhead → label
            claims → lead. COPY §2.6 (1) writes no subhead, so the subhead is COPY's own second hero
            paragraph, moved up whole; C2 stays the lead sentence under it. The two columns are one
            stretched row, so the object ends where the copy ends.
          */}
          <div className="mt-6 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-8">
            <div className="lg:col-span-6">
              <SectionHeading
                as="h1"
                title="MADE BY A PERSON. AI IS IN THE TOOLBOX."
                subhead="Six gates stand between your photos and the print. Each one produces something you can look at, and each one can say no. Here is every gate, with the real artefact it makes."
                // Claims, not buttons: type with a 3 px accent tick, never a pair of lozenges.
                pills={
                  <>
                    <Pill variant="label" tone="accent">
                      SIX GATES
                    </Pill>
                    <span aria-hidden="true" className="font-label text-label font-semibold leading-none text-muted-text">
                      ·
                    </span>
                    <Pill variant="label" tone="outline">
                      YOU SEE IT FIRST
                    </Pill>
                  </>
                }
              />
              <p className="mt-8 max-w-[62ch] font-body text-body font-medium text-pretty text-ink">{block("how-its-made")}</p>
            </div>
            <div className="mt-10 lg:col-span-6 lg:mt-0">
              <HeroMedia />
            </div>
          </div>
        </div>
      </section>

      {/* 02 — the six gates */}
      <section id="gates" aria-labelledby="s-gates" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-gates" index={idx(2)} title="SIX GATES, ONE ARTEFACT EACH." />
        </div>
        <div className="container-site mt-8 lg:mt-12">
          <GateRow gates={gates} />
        </div>
      </section>

      {/* 03 — the rejected take.
          This section used to run the gallery container and give a QA failure the largest imagery on
          the site — two 563 × 800 frames, wider than any product photograph anywhere (owner review
          2026-09-07). It is a footnote to the gates, so it reads as one: the sentence on the left,
          the pair beside it at a third of the width it had. */}
      <section aria-labelledby="s-rejected" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
          <div className="lg:col-span-5">
            <SectionHeading
              as="h2"
              id="s-rejected"
              index={idx(3)}
              title="ONE THAT DIDN'T SHIP."
              subhead="A real rejection from our own roster, not a staged one."
            />
            <p className="mt-8 max-w-[62ch] font-body text-body font-medium text-pretty text-ink">
              A rejection is never fixed by loosening the gate. The input is fixed, or you are asked for a better photo.
            </p>
          </div>
          <div className="mt-8 lg:col-span-7 lg:mt-0 lg:max-w-[32rem] lg:justify-self-end">
            {rejectedFail && rejectedPass ? <ProofRejectedPair fail={rejectedFail} pass={rejectedPass} /> : null}
          </div>
        </div>
      </section>

      {/* 04 — the effort sentence */}
      <section aria-label="How many frames are made" className="mb-16 md:mb-24 lg:mb-32">
        <div className="container-site">
          <p className="max-w-[26ch] border-y border-hairline py-12 font-display text-h2 uppercase text-balance text-ink">
            ABOUT FIFTY FRAMES ARE GENERATED FOR ONE ATHLETE. FOUR SHIP.
          </p>
        </div>
      </section>

      {/* 05 — what you approve, and when */}
      <section aria-labelledby="s-approve" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-approve" index={idx(5)} title="WHAT YOU APPROVE, AND WHEN." />
          <div className="mt-8 lg:mt-12">
            <Timeline />
            <p className="mt-8 max-w-[62ch] font-body text-body text-pretty text-ink">
              {CANON.proofChecklist} One revision is included; a second small text fix is usually free — ask.
            </p>
            <p className="mt-4 max-w-[62ch] font-body text-body text-pretty text-ink">{CANON.deliveryClocks}</p>
            <p className="mt-4 max-w-[62ch] font-body text-body text-pretty text-ink">
              When an order needs something from you, we send up to three reminders over 14 days, then pause it. A paused order
              can be resumed any time within 12 months.
            </p>
          </div>
        </div>
      </section>

      {/* 06 — who prints it */}
      <section aria-labelledby="s-partners" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-partners" index={idx(6)} title="WHO PRINTS IT." />
          <div className="mt-8 lg:mt-12">
            <Ledger rows={visiblePartners().map((p) => ({ id: `partner-${p.key}`, key: p.name, value: p.makes }))} />
            <p className="mt-6 max-w-[62ch] font-body text-body text-pretty text-ink">{LABS_SENTENCE}</p>
            <p className="mt-4 max-w-[62ch] font-body text-body text-pretty text-ink">{block("independent-studio")}</p>
          </div>
        </div>
      </section>

      {/* 07 — FAQ + CTA */}
      <section aria-labelledby="s-faq" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <SectionHeading as="h2" id="s-faq" index={idx(SECTIONS)} title="QUESTIONS, ANSWERED." />
          <div className="mt-8 lg:mt-12">
            <FaqList items={faq} jsonLd id="faq" />
            <div className="mt-12">
              <CtaPair primary={cta.primary} secondary={cta.secondary} size="lg" />
              <DeliveryChips kind="standard" className="mt-4" />
              <TrustLine />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
