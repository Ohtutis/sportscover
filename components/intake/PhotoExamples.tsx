import Image from "next/image";
import Link from "next/link";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { FictionalLabel } from "../FictionalLabel";
import { CheckIcon, CrossIcon, ExternalIcon } from "../icons";
import { LABEL } from "./fields";
import { UI } from "./strings";

// The example gallery beside the step-4 drop zone (owner, 2026-10-06: "more and better examples here", and the
// self-check block under it "can definitely be clearer"). It replaces both the ✓ / ✕ pair and the must-have /
// leave-out text with its checkboxes: a SEND THESE row of the four photos that matter (lib/catalog/
// photo-checklist.ts rows 1–4) and a LEAVE THESE OUT row of three, each tile a real photograph with a two-to-
// four-word caption, one FictionalLabel for the whole gallery and one link to the full photo guide.
//
// Every image is a `intake.example.<slug>` key of lib/assets.ts: the ✓ tiles are square crops of the audited
// hero phone photos, the ✕ tiles the card listings' judged slide-12 "bad photo" takes. This file renders inside
// the form island, so it carries copies of each entry's src and alt instead of importing the asset map (51 KB
// minified with every provenance note — DESIGN §8 keeps islands to a few KB); tests/intake-photos.test.ts
// asserts every copy equals its lib/assets.ts entry and that each file is square and at most 60 KB. Edit
// lib/assets.ts first, run `scripts/site-assets.ts --key <key>`, then mirror the change here.

export type PhotoExampleSlug = keyof typeof INTAKE_COPY.photoExamples.captions;

export interface PhotoExampleTile {
  slug: PhotoExampleSlug;
  /** The lib/assets.ts key the src and alt are copied from. */
  key: `intake.example.${PhotoExampleSlug}`;
  /** true = SEND THESE (✓), false = LEAVE THESE OUT (✕). */
  send: boolean;
  src: string;
  alt: string;
}

export const PHOTO_EXAMPLE_TILES: readonly PhotoExampleTile[] = [
  {
    slug: "face",
    key: "intake.example.face",
    send: true,
    src: "/images/intake/photo-example-face-close-up.webp",
    alt: "Example of a photo to send: a close-up of a fictional softball player at home, face sharp and both eyes visible — generated example photo",
  },
  {
    slug: "turned",
    key: "intake.example.turned",
    send: true,
    src: "/images/intake/photo-example-head-turned.webp",
    alt: "Example of a photo to send: a fictional basketball player at practice with his head turned to the side — generated example photo",
  },
  {
    slug: "fullbody",
    key: "intake.example.fullbody",
    send: true,
    src: "/images/intake/photo-example-full-body.webp",
    alt: "Example of a photo to send: a fictional football player seen head to shoes, pushing a blocking sled — generated example photo",
  },
  {
    slug: "kit",
    key: "intake.example.kit",
    send: true,
    src: "/images/intake/photo-example-team-kit.webp",
    alt: "Example of a photo to send: a fictional football player in his team kit, the crest and the number 54 showing — generated example photo",
  },
  {
    slug: "blurred",
    key: "intake.example.blurred",
    send: false,
    src: "/images/intake/photo-example-blurred.webp",
    alt: "Example of a photo to leave out: a badly blurred phone snapshot of a football player whose face cannot be made out — generated example image, fictional athlete",
  },
  {
    slug: "covered",
    key: "intake.example.covered",
    send: false,
    src: "/images/intake/photo-example-face-covered.webp",
    alt: "Example of a photo to leave out: a fictional athlete seen from behind, hood up and a hand over the head, no face visible — generated example image",
  },
  {
    slug: "group",
    key: "intake.example.group",
    send: false,
    src: "/images/intake/photo-example-group.webp",
    alt: "Example of a photo to leave out: a posed team photo of fictional baseball players, every face the same size — generated example image",
  },
];

/**
 * Tile width: a quarter of the gallery — 27rem beside the zone from xl (≈ 99 px), at most 36rem stacked under it
 * (≈ 135 px), the full phone width below sm (≈ 82 px at 390).
 */
const TILE_SIZES = "(min-width: 1280px) 100px, (min-width: 640px) 136px, 25vw";

function Tile({ tile }: { tile: PhotoExampleTile }) {
  const Mark = tile.send ? CheckIcon : CrossIcon;
  return (
    <figure className="min-w-0" data-fp-example={tile.send ? "send" : "leave"}>
      <div className="relative aspect-square overflow-hidden rounded-[4px] border border-hairline bg-hairline">
        <Image src={tile.src} alt={tile.alt} fill sizes={TILE_SIZES} className="object-cover" />
        <span
          aria-hidden="true"
          className={`absolute left-1.5 top-1.5 grid size-5 place-items-center rounded-full border-[1.5px] border-white text-white ${tile.send ? "bg-ink" : "bg-muted"}`}
        >
          <Mark size={12} strokeWidth={2.75} />
        </span>
      </div>
      <figcaption className="mt-1.5 font-body text-[0.75rem] font-medium leading-[1.25] text-ink text-pretty sm:text-[0.8125rem]">
        {INTAKE_COPY.photoExamples.captions[tile.slug]}
      </figcaption>
    </figure>
  );
}

function Row({ id, label, tiles, className = "" }: { id: string; label: string; tiles: readonly PhotoExampleTile[]; className?: string }) {
  return (
    <div className={className}>
      <p id={id} className={LABEL}>
        {label}
      </p>
      {/* Always four columns, so the ✕ row's three tiles are the ✓ row's size and line up under it. */}
      <ul aria-labelledby={id} className="mt-2 grid grid-cols-4 gap-2 xl:gap-3">
        {tiles.map((tile) => (
          <li key={tile.key} className="min-w-0">
            <Tile tile={tile} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** SEND THESE ✓ ×4, LEAVE THESE OUT ✕ ×3, the fictional label, the guide link. */
export function PhotoExampleGallery({ className = "" }: { className?: string }) {
  const copy = INTAKE_COPY.photoExamples;
  return (
    <section aria-label={copy.title} data-fp-examples="" className={className}>
      <Row id="fp-examples-send" label={copy.sendLabel} tiles={PHOTO_EXAMPLE_TILES.filter((t) => t.send)} />
      <Row id="fp-examples-leave" label={copy.leaveLabel} tiles={PHOTO_EXAMPLE_TILES.filter((t) => !t.send)} className="mt-5" />
      <FictionalLabel className="mt-4" />
      <Link
        href="/photo-guide"
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-body text-small text-ink underline decoration-1 underline-offset-4 hover:decoration-2"
      >
        {UI.photos.guideLink}
        <ExternalIcon size={14} />
        <span className="sr-only">{UI.newTab}</span>
      </Link>
    </section>
  );
}
