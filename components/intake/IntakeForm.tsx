"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { INTAKE_COPY, INTAKE_PATH, INTAKE_THANKS_PATH } from "../../lib/intake/copy";
import type { ProductKey } from "../../lib/intake/products";
import { REQUEST_ID, parseProofRequest, type ConsentKey, type SourceInfo, type StyleChoice } from "../../lib/intake/types";
import { uploadToSignedUrl, type StorageEndpoint, type UploadTarget } from "../../lib/intake/upload";
import { SUPPORT_EMAIL } from "../../lib/site";
import { trackCustomize } from "../../lib/track";
import { PRIMARY_BUTTON_CLASS } from "../CtaPair";
import { ArrowRightIcon } from "../icons";
import { SectionHeading } from "../SectionHeading";
import { AthleteFields } from "./AthleteFields";
import { ConsentFields } from "./ConsentFields";
import { ContactFields } from "./ContactFields";
import { LEAD_STORE_PREFIX } from "./LeadPing";
import {
  applyPrefill,
  buildPayload,
  canPreview,
  captureSource,
  clampQuantity,
  fileKey,
  fileMeta,
  initialState,
  isCrestFile,
  screenPhotos,
  statErrorsByRow,
  type AthleteState,
  type ContactState,
  type FormState,
  type Prefill,
} from "./model";
import { PhotoUploader, type PhotoItem } from "./PhotoUploader";
import { PrefillFromUrl } from "./PrefillFromUrl";
import { ProductPicker, type ProductTileData } from "./ProductPicker";
import { StylePicker, type StyleTileData } from "./StylePicker";
import { SummaryRail } from "./SummaryRail";
import { TurnstileWidget } from "./TurnstileWidget";
import { UI } from "./strings";

export interface IntakeFormProps {
  products: ProductTileData[];
  styles: StyleTileData[];
  /** The products subhead without its set sentence. */
  productsLead: string;
  /** The set sentence with the set's "from" price (setFromLabel). */
  setLine: string;
  /** C5 — content/blocks/photos-that-work-best.md, read on the server. */
  photosSubhead: string;
  /** Today in ET (YYYY-MM-DD): the earliest date the two date fields offer. */
  todayIso: string;
  /** NEXT_PUBLIC_TURNSTILE_SITE_KEY — the bot check mounts only when it is set. */
  turnstileSiteKey?: string;
}

interface StartResponse {
  requestId: string;
  completeToken: string;
  storage: StorageEndpoint;
  uploads: { photos: UploadTarget[]; crest: UploadTarget | null };
}

/** One started request: kept until it completes, so a failed upload resumes instead of starting over. */
interface Session {
  key: string;
  start: StartResponse;
  photos: (string | null)[];
  crest: string | null;
}

type Phase = "idle" | "starting" | "uploading" | "finishing" | "done";
type Failure = "invalid" | "bot" | "challenge" | "network" | "server" | "rate" | "storage" | "upload";

const SECTION_COUNT = 6;
const sectionIndex = (n: number) => `${String(n).padStart(2, "0")} / ${String(SECTION_COUNT).padStart(2, "0")}`;
const sectionTitleId = (key: string) => `fp-s-${key}`;
const EMPTY_SOURCE: SourceInfo = { landingPath: INTAKE_PATH, referrer: "", utm: {} };
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(UI.submit.mailtoSubject)}`;

const SUBMIT_CLASS = `inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-ui px-8 py-3 text-center font-display text-[1.0625rem] uppercase leading-tight tracking-[0.04em] transition-[color,background-color,border-color,filter] duration-hover ease-out disabled:cursor-progress sm:w-auto ${PRIMARY_BUTTON_CLASS}`;

function FormSection({ id, n, title, subhead, children }: { id: string; n: number; title: string; subhead?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="pt-14 first:pt-0 md:pt-20">
      <SectionHeading as="h2" id={id} index={sectionIndex(n)} title={title} subhead={subhead} />
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** The storage-missing sentence with its address turned into a prefilled mailto. */
function MailtoSentence({ text }: { text: string }) {
  const at = text.indexOf(SUPPORT_EMAIL);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <a href={MAILTO} className="font-bold underline decoration-1 underline-offset-4">
        {SUPPORT_EMAIL}
      </a>
      {text.slice(at + SUPPORT_EMAIL.length)}
    </>
  );
}

const sessionKey = (payload: unknown, photos: PhotoItem[], crest: PhotoItem | null): string =>
  JSON.stringify([payload, photos.map((p) => fileKey(p.file)), crest ? fileKey(crest.file) : null]);

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isStartResponse(v: unknown, photoCount: number, wantsCrest: boolean): v is StartResponse {
  const o = v as StartResponse | null;
  return Boolean(
    o &&
      typeof o.requestId === "string" &&
      REQUEST_ID.test(o.requestId) &&
      typeof o.completeToken === "string" &&
      o.storage &&
      typeof o.storage.url === "string" &&
      typeof o.storage.anonKey === "string" &&
      Array.isArray(o.uploads?.photos) &&
      o.uploads.photos.length === photoCount &&
      (!wantsCrest || o.uploads.crest),
  );
}

/**
 * The free-proof request (DESIGN §4.21, owner decision 2026-10-04): one page, one long form, one submit —
 * no wizard, no account, no payment. Six numbered sections, a sticky "Your request" rail at lg and a
 * compact read-back above the button below it. The same validator as the server (parseProofRequest) runs
 * first; then POST /api/intake/start → each photo straight to storage through its signed URL, one at a
 * time → POST /api/intake/complete → the thanks page with the reference. Every failure keeps what was
 * entered, and a failed upload resumes where it stopped.
 */
export function IntakeForm({ products, styles, productsLead, setLine, photosSubhead, todayIso, turnstileSiteKey }: IntakeFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [crest, setCrest] = useState<PhotoItem | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [crestNote, setCrestNote] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState<{ n: number; total: number } | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);

  const source = useRef<SourceInfo>(EMPTY_SOURCE);
  const session = useRef<Session | null>(null);
  const objectUrls = useRef<Set<string>>(new Set());
  const nextId = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  const busy = phase !== "idle";

  // Where the parent came from (landing path, referrer, utm_* / fbclid) — read once, sent with the request.
  useEffect(() => {
    source.current = captureSource(window.location.pathname, window.location.search, document.referrer);
  }, []);

  // Previews are object URLs; give the memory back when the page goes.
  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  // Leaving mid-upload loses the upload: ask first.
  useEffect(() => {
    if (phase !== "starting" && phase !== "uploading" && phase !== "finishing") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [phase]);

  // After a send attempt with errors: bring the first one into view and put focus on it.
  useEffect(() => {
    if (!focusRequest) return;
    const target = formRef.current?.querySelector<HTMLElement>("[data-fp-invalid]");
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
  }, [focusRequest]);

  const files = useMemo(() => ({ photos: photos.map((p) => fileMeta(p.file)), crest: crest ? fileMeta(crest.file) : null }), [photos, crest]);
  const built = useMemo(() => buildPayload(form, files, EMPTY_SOURCE), [form, files]);
  const clientErrors = useMemo(() => {
    if (!attempted) return {};
    const result = parseProofRequest(built.payload);
    return result.ok ? {} : result.errors;
  }, [attempted, built]);
  const errors: Record<string, string> = useMemo(() => ({ ...clientErrors, ...serverErrors }), [clientErrors, serverErrors]);
  const statErrors = useMemo(() => statErrorsByRow(errors, built.statRows), [errors, built.statRows]);
  const errorCount = Object.keys(errors).length;

  const touched = useCallback(() => {
    setServerErrors((prev) => (Object.keys(prev).length ? {} : prev));
  }, []);

  const onPrefill = useCallback((prefill: Prefill) => setForm((f) => applyPrefill(f, prefill)), []);

  // --- section handlers -----------------------------------------------------------------------------

  const onToggle = (key: ProductKey, selected: boolean) => {
    setForm((f) => ({ ...f, products: { ...f.products, [key]: { ...f.products[key], selected } } }));
    touched();
    if (selected) trackCustomize({ content_category: "product", content_ids: [key] });
  };
  const onOption = (key: ProductKey, option: string) => {
    setForm((f) => ({ ...f, products: { ...f.products, [key]: { ...f.products[key], option, selected: true } } }));
    touched();
  };
  const onQuantity = (key: ProductKey, quantity: number) => {
    setForm((f) => ({ ...f, products: { ...f.products, [key]: { ...f.products[key], quantity: clampQuantity(quantity) } } }));
  };
  const onStyle = (style: StyleChoice) => {
    setForm((f) => ({ ...f, style }));
    touched();
    trackCustomize({ content_category: "style", content_ids: [style] });
  };
  const onAthlete = (patch: Partial<AthleteState>) => {
    setForm((f) => ({ ...f, athlete: { ...f.athlete, ...patch } }));
    touched();
  };
  const onStat = (row: number, patch: Partial<{ value: string; label: string }>) => {
    setForm((f) => ({ ...f, athlete: { ...f.athlete, stats: f.athlete.stats.map((s, i) => (i === row ? { ...s, ...patch } : s)) } }));
    touched();
  };
  const onContact = (patch: Partial<ContactState>) => {
    setForm((f) => ({ ...f, contact: { ...f.contact, ...patch } }));
    touched();
  };
  const onConsent = (key: ConsentKey, checked: boolean) => {
    setForm((f) => ({ ...f, consents: { ...f.consents, [key]: checked } }));
    touched();
  };

  const makeItem = (file: File): PhotoItem => {
    nextId.current += 1;
    const url = canPreview(file) ? URL.createObjectURL(file) : null;
    if (url) objectUrls.current.add(url);
    return { id: `p${nextId.current}`, file, url };
  };
  const dropUrl = (url: string | null) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    objectUrls.current.delete(url);
  };

  const onAddPhotos = (incoming: File[]) => {
    const { accepted, rejected } = screenPhotos(
      photos.map((p) => p.file),
      incoming,
    );
    setPhotos((prev) => [...prev, ...accepted.map(makeItem)]);
    setNotes(rejected.map((r) => UI.photos.rejectedLine(r.name, UI.photos.rejected[r.reason])));
    touched();
  };
  const onRemovePhoto = (id: string) => {
    const gone = photos.find((p) => p.id === id);
    dropUrl(gone?.url ?? null);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setNotes([]);
    touched();
  };
  const onPreviewFailed = (id: string) => {
    if (crest?.id === id) {
      dropUrl(crest.url);
      setCrest({ ...crest, url: null });
      return;
    }
    const broken = photos.find((p) => p.id === id);
    dropUrl(broken?.url ?? null);
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, url: null } : p)));
  };
  const onCrest = (file: File | null) => {
    dropUrl(crest?.url ?? null);
    if (file && !isCrestFile(file)) {
      setCrest(null);
      setCrestNote(UI.photos.crestRejected(file.name));
      return;
    }
    setCrestNote("");
    setCrest(file ? makeItem(file) : null);
    touched();
  };

  // --- submit ---------------------------------------------------------------------------------------

  const fail = (kind: Failure) => {
    setFailure(kind);
    setPhase("idle");
    setProgress(null);
    if (turnstileSiteKey) setTurnstileReset((n) => n + 1);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setServerErrors({});
    const { payload } = buildPayload(form, files, source.current, turnstileToken);
    const parsed = parseProofRequest(payload);
    setAttempted(true);
    if (!parsed.ok) {
      setFailure(parsed.errors.website ? "bot" : "invalid");
      setFocusRequest((n) => n + 1);
      return;
    }
    setFailure(null);

    // Start (or resume) the request.
    const key = sessionKey({ ...payload, turnstileToken: "" }, photos, crest);
    let current = session.current && session.current.key === key ? session.current : null;
    if (!current) {
      setPhase("starting");
      let res: Response;
      try {
        res = await postJson("/api/intake/start", payload);
      } catch {
        fail("network");
        return;
      }
      const body = await readJson(res);
      if (res.status === 400) {
        const errs = body && typeof body.errors === "object" && body.errors ? (body.errors as Record<string, string>) : {};
        setServerErrors(errs);
        fail(errs.website ? "bot" : "invalid");
        setFocusRequest((n) => n + 1);
        return;
      }
      if (res.status === 429) return fail("rate");
      // storage_unconfigured or storage_unavailable — either way the photos go by email for now.
      if (res.status === 503) return fail("storage");
      // challenge_failed: the bot check did not pass (or its token expired).
      if (res.status === 403) return fail("challenge");
      if (!res.ok || !isStartResponse(body, photos.length, Boolean(crest))) return fail("server");
      current = { key, start: body, photos: photos.map(() => null), crest: null };
      session.current = current;
    }

    // Upload: one file at a time, so the button can say which one; finished files are never re-sent.
    setPhase("uploading");
    try {
      for (let i = 0; i < photos.length; i += 1) {
        if (current.photos[i]) continue;
        setProgress({ n: i + 1, total: photos.length });
        const target = current.start.uploads.photos[i];
        await uploadToSignedUrl(target, photos[i].file, current.start.storage);
        current.photos[i] = target.path;
      }
      setPhase("finishing");
      setProgress(null);
      const crestTarget = current.start.uploads.crest;
      if (crest && crestTarget && !current.crest) {
        await uploadToSignedUrl(crestTarget, crest.file, current.start.storage);
        current.crest = crestTarget.path;
      }
    } catch {
      return fail("upload");
    }

    // Complete: the server checks the files, writes the request and sends the two emails.
    let done: Response;
    try {
      done = await postJson("/api/intake/complete", {
        requestId: current.start.requestId,
        completeToken: current.start.completeToken,
        uploaded: { photos: current.photos.filter((p): p is string => Boolean(p)), crest: current.crest },
      });
    } catch {
      return fail("network");
    }
    if (!done.ok && done.status !== 409) {
      if (done.status === 403) session.current = null;
      return fail("server");
    }

    const requestId = current.start.requestId;
    session.current = null;
    setPhase("done");
    try {
      const chosen = parsed.value.products.map((p) => p.product);
      window.sessionStorage.setItem(`${LEAD_STORE_PREFIX}${requestId}`, JSON.stringify({ content_ids: chosen, num_items: chosen.length }));
    } catch {
      // Storage blocked: the thanks page still counts the lead, without the product keys.
    }
    router.push(`${INTAKE_THANKS_PATH}?ref=${encodeURIComponent(requestId)}`);
  }

  const buttonLabel =
    phase === "uploading" && progress ? INTAKE_COPY.submitting(progress.n, progress.total) : phase === "idle" ? INTAKE_COPY.submit : INTAKE_COPY.finishing;

  const failureText: ReactNode =
    failure === "invalid" && errorCount ? (
      UI.submit.invalid(errorCount)
    ) : failure === "bot" ? (
      errors.website ?? UI.submit.server
    ) : failure === "challenge" ? (
      UI.submit.challenge
    ) : failure === "network" ? (
      UI.submit.network
    ) : failure === "server" ? (
      UI.submit.server
    ) : failure === "rate" ? (
      INTAKE_COPY.errors.tooMany
    ) : failure === "storage" ? (
      <MailtoSentence text={INTAKE_COPY.errors.storageMissing(SUPPORT_EMAIL)} />
    ) : failure === "upload" ? (
      INTAKE_COPY.errors.uploadFailed
    ) : null;

  const summary = { products, state: form.products, styles, style: form.style, athlete: form.athlete, photoCount: photos.length, setLine };

  return (
    <div className="mt-14 md:mt-20 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
      <Suspense fallback={null}>
        <PrefillFromUrl onPrefill={onPrefill} />
      </Suspense>
      <form ref={formRef} noValidate onSubmit={onSubmit} className="min-w-0 lg:col-span-8">
        <fieldset disabled={busy} className="min-w-0">
          <FormSection id={sectionTitleId("products")} n={1} title={INTAKE_COPY.sections.products.title} subhead={productsLead}>
            <ProductPicker products={products} state={form.products} onToggle={onToggle} onOption={onOption} onQuantity={onQuantity} setLine={setLine} error={errors.products} />
          </FormSection>

          <FormSection id={sectionTitleId("style")} n={2} title={INTAKE_COPY.sections.style.title} subhead={INTAKE_COPY.sections.style.subhead}>
            <StylePicker
              styles={styles}
              value={form.style}
              onChange={onStyle}
              classOf={form.athlete.classOf}
              eventDate={form.athlete.eventDate}
              onClassOf={(classOf) => onAthlete({ classOf })}
              onEventDate={(eventDate) => onAthlete({ eventDate })}
              todayIso={todayIso}
              labelledBy={sectionTitleId("style")}
              errors={{ style: errors.style, classOf: errors["athlete.classOf"], eventDate: errors["athlete.eventDate"] }}
            />
          </FormSection>

          <FormSection id={sectionTitleId("athlete")} n={3} title={INTAKE_COPY.sections.athlete.title} subhead={INTAKE_COPY.sections.athlete.subhead}>
            <AthleteFields athlete={form.athlete} onChange={onAthlete} onStat={onStat} errors={errors} statErrors={statErrors} />
          </FormSection>

          <FormSection id={sectionTitleId("photos")} n={4} title={INTAKE_COPY.sections.photos.title} subhead={photosSubhead}>
            <PhotoUploader
              photos={photos}
              crest={crest}
              onAdd={onAddPhotos}
              onRemove={onRemovePhoto}
              onPreviewFailed={onPreviewFailed}
              onCrest={onCrest}
              notes={notes}
              crestNote={crestNote}
              error={errors.photos}
              crestError={errors.crest}
              disabled={busy}
            />
          </FormSection>

          <FormSection id={sectionTitleId("contact")} n={5} title={INTAKE_COPY.sections.contact.title} subhead={INTAKE_COPY.sections.contact.subhead}>
            <ContactFields contact={form.contact} onChange={onContact} errors={errors} todayIso={todayIso} />
          </FormSection>

          <FormSection id={sectionTitleId("consent")} n={6} title={INTAKE_COPY.sections.consent.title} subhead={INTAKE_COPY.sections.consent.subhead}>
            <ConsentFields crest={Boolean(crest)} onChange={onConsent} errors={errors} />
          </FormSection>

          {/* Honeypot: visually hidden (never display:none — some bots skip those), out of the tab order, unannounced. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor="fp-website">Website</label>
            <input
              id="fp-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            />
          </div>
        </fieldset>

        <div className="mt-14 border-t border-hairline pt-8 md:mt-20">
          <SummaryRail {...summary} variant="bar" className="mb-6 lg:hidden" />
          {turnstileSiteKey ? (
            <div className="mb-5">
              <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} resetSignal={turnstileReset} />
            </div>
          ) : null}
          <button id="fp-submit" type="submit" disabled={busy} aria-describedby="fp-submit-note" className={SUBMIT_CLASS}>
            {buttonLabel}
          </button>
          <p role="status" className="sr-only">
            {busy ? buttonLabel : ""}
          </p>
          <div role="alert" className={failureText ? "mt-4 max-w-[62ch] rounded-ui border border-fail p-4 font-body text-small font-medium text-ink" : undefined}>
            {failureText ? (
              <p className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-[0.4em] size-2 shrink-0 rounded-full bg-fail" />
                <span>{failureText}</span>
              </p>
            ) : null}
          </div>
          <p id="fp-submit-note" className="mt-4 max-w-[62ch] font-body text-small font-medium text-ink">
            {INTAKE_COPY.noPayment}
          </p>
          <noscript>
            <p className="mt-4 max-w-[62ch] font-body text-small text-ink">{UI.submit.noscript(SUPPORT_EMAIL)}</p>
          </noscript>
          <a
            href="/etsy"
            className="mt-8 flex min-h-11 max-w-[40rem] items-start gap-3 rounded-ui border border-ink/25 px-4 py-3 font-body text-small text-ink transition-[border-color] duration-hover ease-out hover:border-ink"
          >
            <span className="flex-1">{INTAKE_COPY.etsyAlt}</span>
            <ArrowRightIcon size={18} className="mt-0.5 shrink-0" />
          </a>
        </div>
      </form>

      <div className="hidden lg:col-span-4 lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <SummaryRail {...summary} variant="rail" />
      </div>
    </div>
  );
}
