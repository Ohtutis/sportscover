import { useId, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ImageSpec } from "../../lib/assets";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { CREST_RULES, PHOTO_RULES } from "../../lib/intake/types";
import { buttonClass } from "../ButtonLink";
import { FictionalLabel } from "../FictionalLabel";
import { CameraIcon, CheckIcon, CloseIcon, CrossIcon, ExternalIcon } from "../icons";
import { TrustLine } from "../TrustLine";
import { CHECK, FieldError, HELP, LABEL, Tag } from "./fields";
import { FIELD_PREFIX, errorId, formatBytes } from "./model";
import { UI } from "./strings";

export interface PhotoItem {
  id: string;
  file: File;
  /** An object URL for the preview; null when the browser can't decode the format (HEIC). */
  url: string | null;
}

/** The two example photographs beside the drop zone (lib/assets.ts `intake.example.good|bad`); null renders a typographic card. */
export interface PhotoExamples {
  good: ImageSpec | null;
  bad: ImageSpec | null;
}

export interface PhotoUploaderProps {
  photos: PhotoItem[];
  crest: PhotoItem | null;
  examples: PhotoExamples;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onPreviewFailed: (id: string) => void;
  onCrest: (file: File | null) => void;
  /** Lines naming the files that were not added, and why. */
  notes: string[];
  crestNote?: string;
  error?: string;
  crestError?: string;
  disabled?: boolean;
}

const PHOTO_ACCEPT = [...PHOTO_RULES.types, ...PHOTO_RULES.extensions].join(",");
const CREST_ACCEPT = [...CREST_RULES.types, ...CREST_RULES.extensions].join(",");

/** One example: the photograph itself, a pass / fail mark in its corner, and the caption that says why. */
function Example({ image, good, caption }: { image: ImageSpec | null; good: boolean; caption: string }) {
  const Mark = good ? CheckIcon : CrossIcon;
  const mark = (
    <span aria-hidden="true" className={`grid size-7 shrink-0 place-items-center rounded-full text-ink ${good ? "bg-pass" : "bg-fail"}`}>
      <Mark size={16} strokeWidth={2.25} />
    </span>
  );
  return (
    <figure className="min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-[12px] bg-hairline">
        {image ? (
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 224px, 46vw" className="object-cover" />
        ) : (
          // No audited example on file: a typographic card, never a stand-in picture.
          <span className="flex h-full w-full items-center justify-center p-4 text-center font-display text-[1.25rem] uppercase leading-tight text-muted">{caption}</span>
        )}
        <span className="absolute left-2 top-2">{mark}</span>
      </div>
      <figcaption className="mt-2 font-body text-small font-medium text-ink">{caption}</figcaption>
    </figure>
  );
}

/**
 * Step 4 (owner review 2026-10-04, points 10–11): one big drop zone — the zone IS the button (drag and
 * drop, or tap anywhere / press it), with the title centred, "or browse files" set as a text link and the
 * accepted types under it; the hidden file input is opened by it, so the visible control is the one that
 * takes focus. Beside it, two real example photographs — a clear one and a ruined one — instead of icons.
 * The counter turns to "enough" at four; thumbnails come from object URLs and fall back to the file name
 * where the browser can't show the format. Under it the four must-haves as a self-check the parent ticks
 * (never sent, never required), the avoid list, and the crest slot; attaching a crest reveals its consent row.
 */
export function PhotoUploader({ photos, crest, examples, onAdd, onRemove, onPreviewFailed, onCrest, notes, crestNote, error, crestError, disabled }: PhotoUploaderProps) {
  const uid = useId();
  const input = useRef<HTMLInputElement>(null);
  const crestInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [ticked, setTicked] = useState<boolean[]>(() => INTAKE_COPY.photoMustHaves.map(() => false));

  const n = photos.length;
  const total = photos.reduce((sum, p) => sum + p.file.size, 0);
  const enough = n >= PHOTO_RULES.min;
  const status = n === 0 ? UI.photos.none : n < PHOTO_RULES.min ? UI.photos.needMore(PHOTO_RULES.min - n) : n >= PHOTO_RULES.max ? UI.photos.full : UI.photos.enough;
  const chooseId = `${FIELD_PREFIX}photos-choose`;
  const countId = `${FIELD_PREFIX}photos-count`;
  const typesId = `${FIELD_PREFIX}photos-types`;
  const crestId = `${FIELD_PREFIX}crest-choose`;
  const fictional = Boolean(examples.good?.fictional || examples.bad?.fictional);

  const onDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) onAdd(files);
  };

  return (
    <div>
      {/*
        One grid, three blocks: the zone, its feedback (count, notes, thumbnails) and the two examples. On a
        phone they stack in that order, so what was just added shows right under the zone; from md the
        examples stand beside the zone and the feedback runs under it.
      */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_13rem] md:gap-x-8 md:gap-y-5 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0 md:col-start-1 md:row-start-1">
          <input
            ref={input}
            type="file"
            multiple
            accept={PHOTO_ACCEPT}
            hidden
            tabIndex={-1}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length) onAdd(files);
            }}
          />
          <button
            id={chooseId}
            type="button"
            data-fp-dropzone=""
            disabled={disabled}
            onClick={() => input.current?.click()}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!dragging) setDragging(true);
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
              setDragging(false);
            }}
            onDrop={onDrop}
            aria-describedby={[typesId, countId, error ? errorId("photos") : ""].filter(Boolean).join(" ")}
            data-fp-invalid={error ? "" : undefined}
            className={`group flex h-full min-h-[23rem] w-full flex-col items-center justify-center rounded-[20px] border-2 border-dashed px-6 py-10 text-center transition-[border-color,background-color] duration-hover ease-out disabled:cursor-not-allowed disabled:opacity-60 md:min-h-[29rem] ${
              dragging ? "border-ink bg-ink/5" : error ? "border-fail bg-white/50" : "border-ink/30 bg-white/50 hover:border-ink/60 hover:bg-white"
            }`}
          >
            <span aria-hidden="true" className="grid size-16 place-items-center rounded-full border border-ink/15 bg-stock text-ink">
              <CameraIcon size={30} />
            </span>
            <span className="mt-6 block max-w-[16ch] font-display text-[1.75rem] uppercase leading-[0.95] text-ink text-balance md:text-[2.25rem]">{INTAKE_COPY.dropTitle}</span>
            <span className="mt-4 block font-body text-[1.0625rem] font-bold text-ink underline decoration-1 underline-offset-4 group-hover:decoration-2">{INTAKE_COPY.dropOr}</span>
            <span className="mt-3 block max-w-[34ch] font-body text-small text-muted-text">{INTAKE_COPY.dropHint}</span>
          </button>
        </div>

        <div className="min-w-0 md:col-start-1 md:row-start-2">
          <p id={countId} role="status" className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-small text-ink">
            <span
              className={`inline-flex h-7 items-center gap-1.5 rounded-pill border-[1.5px] px-2.5 font-label text-[0.8125rem] font-semibold uppercase tracking-[0.08em] tabular-nums ${
                enough ? "border-pass" : "border-muted"
              }`}
            >
              {enough ? <CheckIcon size={14} className="text-ink" /> : <span aria-hidden="true" className="size-1.5 rounded-full bg-muted" />}
              {UI.photos.count(n)}
            </span>
            <span className="font-medium">{status}</span>
            {n ? <span className="text-muted-text">{UI.photos.total(formatBytes(total))}</span> : null}
          </p>
          <p id={typesId} className={HELP}>
            {UI.photos.types}
          </p>
          <FieldError id={errorId("photos")} message={error} />
          {notes.length ? (
            <ul className="mt-3 flex flex-col gap-1 font-body text-small text-ink">
              {notes.map((note) => (
                <li key={note} className="flex items-start gap-2">
                  <CrossIcon size={16} className="mt-0.5 shrink-0 text-ink" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {n ? (
            <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photos.map((photo) => (
                <li key={photo.id} className="relative aspect-square overflow-hidden rounded-[4px] bg-hairline">
                  {photo.url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a local blob: preview of the parent's own file; there is nothing to optimise
                    <img src={photo.url} alt={photo.file.name} onError={() => onPreviewFailed(photo.id)} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-end p-2">
                      <span className="line-clamp-3 break-all font-body text-[0.75rem] leading-tight text-ink">{photo.file.name}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemove(photo.id)}
                    aria-label={UI.photos.remove(photo.file.name)}
                    className="absolute right-0 top-0 grid size-11 place-items-center disabled:cursor-not-allowed"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-ink/80 text-stock">
                      <CloseIcon size={16} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="min-w-0 md:col-start-2 md:row-start-1">
          <p className="sr-only">{UI.photos.examples}</p>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-5">
            <li>
              <Example image={examples.good} good caption={INTAKE_COPY.exampleGood} />
            </li>
            <li>
              <Example image={examples.bad} good={false} caption={INTAKE_COPY.exampleBad} />
            </li>
          </ul>
          {fictional ? <FictionalLabel className="mt-4" /> : null}
        </div>
      </div>

      <div className="mt-10 grid gap-8 border-t border-hairline pt-8 md:grid-cols-2 md:gap-10">
        <fieldset className="min-w-0">
          <legend id={`${uid}-must`} className="font-body text-[1.0625rem] font-bold text-ink">
            {UI.photos.mustHavesTitle}
          </legend>
          <ul className="mt-3 flex flex-col">
            {INTAKE_COPY.photoMustHaves.map((item, i) => {
              const cid = `${uid}-must-${i}`;
              return (
                <li key={item} className="border-b border-hairline last:border-b-0">
                  <label htmlFor={cid} className="flex min-h-11 cursor-pointer items-start gap-3 py-2.5">
                    <input
                      id={cid}
                      type="checkbox"
                      checked={ticked[i]}
                      onChange={(e) => setTicked((t) => t.map((v, j) => (j === i ? e.target.checked : v)))}
                      className={`mt-0.5 ${CHECK}`}
                    />
                    <span className="font-body text-small text-ink">{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <div className="min-w-0">
          <p className="font-body text-[1.0625rem] font-bold text-ink">{UI.photos.avoidTitle}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {INTAKE_COPY.photoAvoid.map((item) => (
              <li key={item} className="flex items-start gap-2 font-body text-small text-muted-text">
                <CrossIcon size={14} className="mt-[0.25em] shrink-0 text-muted-text" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/photo-guide"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-body text-small text-ink underline decoration-1 underline-offset-4"
          >
            {UI.photos.guideLink}
            <ExternalIcon size={14} />
            <span className="sr-only">{UI.newTab}</span>
          </Link>
        </div>
      </div>

      <div className="mt-10 border-t border-hairline pt-8">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={LABEL} id={`${crestId}-label`}>
            {UI.photos.crest}
          </span>
          <Tag kind="optional" />
        </span>
        <p id={`${crestId}-help`} className={HELP}>
          {INTAKE_COPY.crestHelp}
        </p>
        <input
          ref={crestInput}
          type="file"
          accept={CREST_ACCEPT}
          hidden
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            e.target.value = "";
            if (file) onCrest(file);
          }}
        />
        {crest ? (
          <div className="mt-3 flex items-center gap-3">
            <span className="relative block size-14 shrink-0 overflow-hidden rounded-[4px] border border-hairline bg-stock">
              {crest.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- a local blob: preview of the parent's own file
                <img src={crest.url} alt={crest.file.name} onError={() => onPreviewFailed(crest.id)} className="h-full w-full object-contain p-1" />
              ) : null}
            </span>
            <span className="min-w-0 flex-1 font-body text-small text-ink">
              <span className="block truncate font-medium">{crest.file.name}</span>
              <span className="text-muted-text">{formatBytes(crest.file.size)}</span>
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onCrest(null)}
              className="min-h-11 shrink-0 font-body text-small text-ink underline decoration-1 underline-offset-4 disabled:cursor-not-allowed"
            >
              {UI.photos.crestRemove}
            </button>
          </div>
        ) : (
          <button
            id={crestId}
            type="button"
            disabled={disabled}
            onClick={() => crestInput.current?.click()}
            aria-describedby={[`${crestId}-label`, `${crestId}-help`, crestError ? errorId("crest") : ""].filter(Boolean).join(" ")}
            data-fp-invalid={crestError ? "" : undefined}
            className={buttonClass("outline", "md", "mt-3 disabled:cursor-not-allowed disabled:opacity-60")}
          >
            {UI.photos.crestChoose}
          </button>
        )}
        {crestNote ? <p className="mt-2 font-body text-small text-ink">{crestNote}</p> : null}
        <FieldError id={errorId("crest")} message={crestError} />
      </div>

      <TrustLine className="mt-8" />
    </div>
  );
}
