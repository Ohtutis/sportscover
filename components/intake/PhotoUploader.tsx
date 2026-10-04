import { useId, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { INTAKE_COPY } from "../../lib/intake/copy";
import { CREST_RULES, PHOTO_RULES } from "../../lib/intake/types";
import { buttonClass } from "../ButtonLink";
import { CameraIcon, CheckIcon, CloseIcon, CrossIcon, ExternalIcon } from "../icons";
import { TrustLine } from "../TrustLine";
import { CHECK, FieldError, HELP, LABEL } from "./fields";
import { FIELD_PREFIX, errorId, formatBytes } from "./model";
import { UI } from "./strings";

export interface PhotoItem {
  id: string;
  file: File;
  /** An object URL for the preview; null when the browser can't decode the format (HEIC). */
  url: string | null;
}

export interface PhotoUploaderProps {
  photos: PhotoItem[];
  crest: PhotoItem | null;
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
 * Section 04: the photos (DESIGN §4.21, C14 under the upload control). One drop zone + a real button
 * (the file input itself stays hidden and is opened by the button, so the visible control is the one that
 * takes focus). The counter turns to "enough" at four; thumbnails come from object URLs and fall back to
 * the file name where the browser can't show the format. Beside it, the four must-haves as a self-check
 * the parent ticks (never sent, never required) and the avoid list in small type. The crest is its own
 * single slot; attaching one reveals its consent row in section 06.
 */
export function PhotoUploader({ photos, crest, onAdd, onRemove, onPreviewFailed, onCrest, notes, crestNote, error, crestError, disabled }: PhotoUploaderProps) {
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

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) onAdd(files);
  };

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="min-w-0">
        <div
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
          className={`rounded-ui border-2 border-dashed p-5 transition-[border-color,background-color] duration-hover ease-out sm:p-6 ${
            dragging ? "border-ink bg-ink/5" : error ? "border-fail" : "border-ink/30"
          }`}
        >
          <CameraIcon size={28} className="text-ink" />
          <p className="mt-3 hidden font-body text-[1.0625rem] font-bold text-ink md:block">{UI.photos.drop}</p>
          <p id={typesId} className="mt-1 max-w-[46ch] font-body text-small text-muted-text">
            {UI.photos.types}
          </p>
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
            disabled={disabled}
            onClick={() => input.current?.click()}
            aria-describedby={[typesId, countId, error ? errorId("photos") : ""].filter(Boolean).join(" ")}
            data-fp-invalid={error ? "" : undefined}
            className={buttonClass("outline", "md", "mt-4 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60")}
          >
            {UI.photos.choose}
          </button>
        </div>

        <p id={countId} role="status" className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-small text-ink">
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
          <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
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

        <div className="mt-10 border-t border-hairline pt-6">
          <p className={LABEL} id={`${crestId}-label`}>
            {UI.photos.crest}
          </p>
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
              className={buttonClass("outline", "sm", "mt-3 min-h-11 disabled:cursor-not-allowed disabled:opacity-60")}
            >
              {UI.photos.crestChoose}
            </button>
          )}
          {crestNote ? <p className="mt-2 font-body text-small text-ink">{crestNote}</p> : null}
          <FieldError id={errorId("crest")} message={crestError} />
        </div>

        <TrustLine className="mt-8" />
      </div>

      <aside aria-labelledby={`${uid}-must`} className="md:border-l md:border-hairline md:pl-6">
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
        <p className="mt-6 font-body text-small font-bold text-ink">{UI.photos.avoidTitle}</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {INTAKE_COPY.photoAvoid.map((item) => (
            <li key={item} className="flex items-start gap-2 font-body text-[0.8125rem] leading-[1.45] text-muted-text">
              <CrossIcon size={14} className="mt-[0.2em] shrink-0 text-muted-text" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/photo-guide"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-body text-small text-ink underline decoration-1 underline-offset-4"
        >
          {UI.photos.guideLink}
          <ExternalIcon size={14} />
          <span className="sr-only">{UI.newTab}</span>
        </Link>
      </aside>
    </div>
  );
}
