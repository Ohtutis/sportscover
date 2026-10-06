import { useEffect, useRef, useState, type DragEvent } from "react";
import type { ImageSpec } from "../../lib/assets";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { CREST_RULES, PHOTO_RULES } from "../../lib/intake/types";
import { buttonClass } from "../ButtonLink";
import { CameraIcon, CheckIcon, CloseIcon, CrossIcon, InfoIcon } from "../icons";
import { TrustLine } from "../TrustLine";
import { FieldError, HELP, LABEL, Tag } from "./fields";
import { FIELD_PREFIX, errorId, formatBytes } from "./model";
import { createPhotoQueue, judgePhotos, summarizeChecks, type PhotoCheck, type PhotoReading } from "./photoCheck";
import { PhotoExampleGallery } from "./PhotoExamples";
import { UI } from "./strings";

export interface PhotoItem {
  id: string;
  file: File;
  /** An object URL for the preview; null when the browser can't decode the format (HEIC). */
  url: string | null;
}

/**
 * The page's two example photographs (lib/assets.ts `intake.example.good|bad`). Since 2026-10-06 the step shows
 * the seven-tile gallery in PhotoExamples.tsx instead; the prop stays so the page and the form keep their
 * contract, and is no longer rendered.
 */
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

/**
 * The free photo check (photoCheck.ts): every photo in the list is read once, one at a time in idle slices, on
 * this device. Readings are kept per photo id; the verdicts are recomputed from the current list on every
 * render, so removing the first of two identical shots clears the second one's "same shot".
 */
function usePhotoReadings(photos: PhotoItem[]): Record<string, PhotoReading> {
  const [readings, setReadings] = useState<Record<string, PhotoReading>>({});
  const queue = useRef<ReturnType<typeof createPhotoQueue> | null>(null);
  const queued = useRef(new Set<string>());

  useEffect(() => {
    const q = createPhotoQueue((id, reading) => setReadings((r) => ({ ...r, [id]: reading })));
    queue.current = q;
    queued.current = new Set();
    return () => {
      q.dispose();
      queue.current = null;
    };
  }, []);

  useEffect(() => {
    const q = queue.current;
    if (!q) return;
    const ids = new Set(photos.map((p) => p.id));
    for (const p of photos) {
      if (queued.current.has(p.id)) continue;
      queued.current.add(p.id);
      q.add(p.id, p.file);
    }
    for (const id of queued.current) {
      if (ids.has(id)) continue;
      q.cancel(id);
      queued.current.delete(id);
    }
  }, [photos]);

  return readings;
}

/**
 * The line under a thumbnail: ✓ in ink for "Looks sharp", a muted ! for advice, a muted i where the owner checks
 * it instead, "Checking…" until the reading is in. Two lines are reserved from the moment the thumbnail
 * appears, so a result never moves the grid. A second reason is read to assistive tech.
 */
function CheckLine({ check }: { check: PhotoCheck | null }) {
  const words = INTAKE_COPY.photoCheck;
  // The mark sits inline, so the second line of text runs the thumbnail's full width.
  const base = "mt-1.5 min-h-[2.5em] font-body text-[0.75rem] font-medium leading-[1.25]";
  const inline = "mr-1 inline-block align-[-0.2em]";
  if (!check) {
    return (
      <p data-fp-check="pending" className={`${base} text-muted-text`}>
        {words.checking}
      </p>
    );
  }
  const [first, second] = check.reasons;
  const mark =
    check.verdict === "good" ? (
      <CheckIcon size={14} strokeWidth={2.25} className={`${inline} text-ink`} />
    ) : check.verdict === "check" ? (
      // A drawn "!" in a muted disc — an SVG like the other marks, so it sits on the text line without growing it.
      <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true" focusable="false" className={`${inline} text-muted`}>
        <circle cx="12" cy="12" r="11" fill="currentColor" />
        <path d="M12 6.5v7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="12" cy="17.6" r="1.5" fill="#fff" />
      </svg>
    ) : (
      <InfoIcon size={14} className={`${inline} text-muted-text`} />
    );
  return (
    <p data-fp-check={check.verdict} className={`${base} ${check.verdict === "unchecked" ? "text-muted-text" : "text-ink"}`}>
      {mark}
      {words.reasons[first]}
      {second ? <span className="sr-only">. {words.reasons[second]}</span> : null}
    </p>
  );
}

/**
 * Step 4 (owner reviews 2026-10-04, points 10–11, and 2026-10-06): one big drop zone — the zone IS the button
 * (drag and drop, or tap anywhere / press it), with the title centred, "or browse files" set as a text link and
 * the accepted types under it; the hidden file input is opened by it, so the visible control is the one that
 * takes focus. Beside it from xl (under it below), the example gallery: four photos to send, three to leave
 * out. The counter turns to "enough" at four; thumbnails come from object URLs and fall back to the file name
 * where the browser can't show the format, and each carries the free on-device photo check — advice only, it
 * never blocks the submit and never reaches the request. Then the crest slot; attaching a crest reveals its
 * consent row.
 */
export function PhotoUploader({ photos, crest, onAdd, onRemove, onPreviewFailed, onCrest, notes, crestNote, error, crestError, disabled }: PhotoUploaderProps) {
  const input = useRef<HTMLInputElement>(null);
  const crestInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const readings = usePhotoReadings(photos);

  const n = photos.length;
  const total = photos.reduce((sum, p) => sum + p.file.size, 0);
  const enough = n >= PHOTO_RULES.min;
  const status = n === 0 ? UI.photos.none : n < PHOTO_RULES.min ? UI.photos.needMore(PHOTO_RULES.min - n) : n >= PHOTO_RULES.max ? UI.photos.full : UI.photos.enough;
  const chooseId = `${FIELD_PREFIX}photos-choose`;
  const countId = `${FIELD_PREFIX}photos-count`;
  const typesId = `${FIELD_PREFIX}photos-types`;
  const crestId = `${FIELD_PREFIX}crest-choose`;

  const checks = judgePhotos(photos.map((p) => ({ id: p.id, file: p.file, reading: readings[p.id] ?? null })));
  const summary = summarizeChecks(checks);
  const summaryText =
    summary.kind === "done"
      ? INTAKE_COPY.photoCheck.summary(summary.good, summary.checked, summary.flagged, summary.unchecked)
      : summary.kind === "checking"
        ? INTAKE_COPY.photoCheck.summaryChecking
        : "";

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
        One grid, three blocks: the zone, its feedback (count, check summary, notes, thumbnails) and the example
        gallery. Below xl they stack in that order, so what was just added shows right under the zone; from xl
        the gallery stands beside the zone in a 27rem column (four tiles of ≈ 99 px) and the feedback runs under
        the zone. The gallery is shorter than the zone, so the zone keeps its own height.
      */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_27rem] xl:gap-x-8 xl:gap-y-5">
        <div className="min-w-0 xl:col-start-1 xl:row-start-1">
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

        <div className="min-w-0 xl:col-start-1 xl:row-start-2">
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
          {n ? (
            // The check's one-line summary; its row exists as soon as a photo does, so the result never shifts the page.
            <p role="status" data-fp-check-summary={summary.kind} className="mt-2 min-h-6 font-body text-small font-medium leading-6 text-ink">
              {summaryText}
            </p>
          ) : null}
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
            <ul className="mt-5 grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-3">
              {photos.map((photo, i) => (
                <li key={photo.id} className="min-w-0">
                  <figure>
                    <div className="relative aspect-square overflow-hidden rounded-[4px] bg-hairline">
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
                    </div>
                    <figcaption>
                      <CheckLine check={checks[i]} />
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <PhotoExampleGallery className="min-w-0 max-w-[36rem] xl:col-start-2 xl:row-start-1 xl:max-w-none xl:self-start" />
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
