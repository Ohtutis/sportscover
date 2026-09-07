// /photo-guide — COPY §2.8, DESIGN §5.6 (stock; print stylesheet). The nine rows come from
// lib/catalog/photo-checklist.ts (GAPS #35) and the panel sheet is the 2 × 3 grid of GAPS #34:
// top row pass, bottom row fail — the captions follow the image's order and are never re-ordered
// to fit the copy. Printing: `print:` utilities only (this builder owns no CSS).

import Image from "next/image";
import Link from "next/link";
import { BracketFrame } from "../../../components/BracketFrame";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { CtaPair } from "../../../components/CtaPair";
import { JsonLd } from "../../../components/JsonLd";
import { Ledger } from "../../../components/Ledger";
import { PhotoChecklist } from "../../../components/PhotoChecklist";
import { Pill } from "../../../components/Pill";
import { SectionHeading } from "../../../components/SectionHeading";
import { StatusChip } from "../../../components/StatusChip";
import { TrustLine } from "../../../components/TrustLine";
import { assetOrNull } from "../../../lib/assets";
import { block } from "../../../lib/blocks";
import { NEVER_ASKED_FOR, PHOTO_GUIDE_CLOSING, photoChecklist } from "../../../lib/catalog/photo-checklist";
import { ctaFor } from "../../../lib/cta";
import { article } from "../../../lib/seo/jsonld";
import { pageMeta } from "../../../lib/seo/meta";
import { pageFor } from "../../../lib/seo/titles";
import { PrintButton } from "./print-button";

export const revalidate = 3600;
export const metadata = pageMeta("/photo-guide", { type: "article" });

const PATH = "/photo-guide";
const PUBLISHED = "2026-09-07";

/** The six panel captions, in the image's own order (GAPS #34: three pass on top, three fail below). */
const PANEL_CAPTIONS: { status: "pass" | "fail"; text: string }[] = [
  { status: "pass", text: "Clear face, close, both eyes" },
  { status: "pass", text: "Full body in the team kit" },
  { status: "pass", text: "Action, athlete closest to the camera" },
  { status: "fail", text: "Motion blur" },
  { status: "fail", text: "Too dark" },
  { status: "fail", text: "Too far away" },
];

export default function PhotoGuidePage() {
  const meta = pageFor(PATH);
  const panels = assetOrNull("photo-guide.panels");
  const cta = ctaFor("home");

  return (
    <>
      <JsonLd
        data={article({
          title: meta.title,
          description: meta.description,
          path: PATH,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          ...(panels ? { image: panels.src } : {}),
        })}
      />

      {/* hero */}
      <section className="pt-6 pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <div className="print:hidden">
            <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: "Photo guide", href: PATH }]} />
          </div>
          <SectionHeading
            as="h1"
            className="mt-6"
            title="THE PHOTOS THAT WORK."
            subhead="Send 4–10. These nine things are what the photo check looks for — and every one of them is something you can do with the phone you already have."
            // Claims, not buttons (owner review 2026-09-07): the two claims are type with a 3 px
            // accent tick, so nothing above the CTA looks pressable that isn't.
            pills={
              <>
                <Pill variant="label" tone="accent">
                  4–10 PHOTOS
                </Pill>
                <span aria-hidden="true" className="font-label text-label font-semibold leading-none text-muted-text">
                  ·
                </span>
                <Pill variant="label" tone="outline">
                  ORIGINALS, NOT SCREENSHOTS
                </Pill>
              </>
            }
          />
          <p className="mt-8 max-w-[62ch] font-body text-body font-medium text-pretty text-ink lg:mt-12">
            {block("photos-that-work-best")}
          </p>
        </div>
      </section>

      {/* the nine rows */}
      <section aria-label="The nine things the photo check looks for" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <PhotoChecklist items={photoChecklist} printable />
          <Ledger className="mt-10" rows={[{ key: "What we never ask for", value: NEVER_ASKED_FOR }]} />
        </div>
      </section>

      {/* good, and not yet */}
      <section aria-labelledby="s-panels" className="pb-16 md:pb-24 lg:pb-32 print:hidden">
        <div className="container-gallery">
          <SectionHeading as="h2" id="s-panels" title="GOOD, AND NOT YET." />
          {panels ? (
            <figure className="mt-8 lg:mt-12">
              <BracketFrame label="PHOTO CHECK · EXAMPLES" fictional>
                {/*
                  The sheet is one image of six panels. Panel 5 is a photo that is too dark, and undrawn it
                  read as an image that had failed to load (review 2026-09-07) — so the six cells are ruled
                  and numbered over the image, and each caption carries its panel's number. The overlay is
                  decoration: it draws no text of its own and is hidden from the accessibility tree.
                */}
                <div className="relative">
                  <Image
                    src={panels.src}
                    alt={panels.alt}
                    width={panels.width}
                    height={panels.height}
                    sizes="(min-width: 1024px) 1100px, 100vw"
                    className="aspect-[3/2] h-auto w-full rounded-none object-contain"
                  />
                  <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 grid-rows-2">
                    {PANEL_CAPTIONS.map((panel, i) => (
                      <span key={panel.text} className="relative border border-white/25">
                        <span className="absolute left-0 top-0 bg-stock px-1.5 py-0.5 font-body text-[0.6875rem] font-medium tabular-nums text-ink">
                          {i + 1}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </BracketFrame>
              <ul className="mt-4 grid grid-cols-3 gap-2">
                {PANEL_CAPTIONS.map((panel, i) => (
                  <li key={panel.text} className="flex flex-col gap-2">
                    <StatusChip status={panel.status} className="self-start" />
                    <span className="font-body text-[0.75rem] font-medium leading-[1.4] text-muted-text">
                      <span className="tabular-nums text-ink">{i + 1}</span> · {panel.text}
                    </span>
                  </li>
                ))}
              </ul>
            </figure>
          ) : (
            <ul className="mt-8 grid gap-2 md:grid-cols-3 lg:mt-12">
              {PANEL_CAPTIONS.map((panel) => (
                <li key={panel.text} className="flex flex-col gap-2 border-t border-hairline py-4">
                  <StatusChip status={panel.status} className="self-start" />
                  <span className="font-body text-small text-muted-text">{panel.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* closing */}
      <section aria-label="What happens if the photos are not strong enough" className="pb-16 md:pb-24 lg:pb-32">
        <div className="container-site">
          <p className="max-w-[62ch] font-body text-body font-medium text-pretty text-ink">{PHOTO_GUIDE_CLOSING}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center print:hidden">
            <PrintButton label="Print this checklist" />
            <Link
              href="/how-it-works"
              className="font-body text-body text-ink underline-offset-4 decoration-1 hover:underline sm:ml-2"
            >
              See how photos become a card
            </Link>
          </div>
          <div className="mt-12 print:hidden">
            <CtaPair primary={cta.primary} secondary={cta.secondary} size="lg" />
            <TrustLine />
          </div>
        </div>
      </section>
    </>
  );
}
