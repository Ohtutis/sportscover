"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DUE_TODAY_LABEL } from "../../lib/catalog/prices";
import { INTAKE_COPY, INTAKE_PATH, INTAKE_THANKS_PATH } from "../../lib/intake/copy";
import type { ProductKey } from "../../lib/intake/products";
import type { FreeProofArtMap } from "../../lib/intake/sport-art";
import { REQUEST_ID, parseProofRequest, type ConsentKey, type SourceInfo, type StyleChoice } from "../../lib/intake/types";
import { uploadToSignedUrl, type StorageEndpoint, type UploadTarget } from "../../lib/intake/upload";
import { SUPPORT_EMAIL } from "../../lib/site";
import { trackCustomize } from "../../lib/track";
import { PRIMARY_BUTTON_CLASS } from "../CtaPair";
import { readEntry } from "../EntryAttribution";
import { EtsyButton } from "../EtsyButton";
import { AthleteFields } from "./AthleteFields";
import { ConsentFields } from "./ConsentFields";
import { ContactFields } from "./ContactFields";
import { LEAD_STORE_PREFIX } from "./LeadPing";
import {
  applyPrefill,
  artState,
  buildPayload,
  canPreview,
  captureSource,
  choiceStore,
  chooseSport,
  fileKey,
  fileMeta,
  hasOptionalDetailError,
  initialState,
  isCrestFile,
  screenPhotos,
  sportArt,
  sportName,
  statErrorsByRow,
  type AthleteState,
  type ContactState,
  type FormState,
  type Prefill,
} from "./model";
import { PhotoUploader, type PhotoExamples, type PhotoItem } from "./PhotoUploader";
import { PrefillFromUrl } from "./PrefillFromUrl";
import { ProductPicker, type ProductTileData } from "./ProductPicker";
import { SportPicker, type SportChoiceData } from "./SportPicker";
import { StylePicker, type StyleTileData } from "./StylePicker";
import { SummaryRail } from "./SummaryRail";
import { TurnstileWidget } from "./TurnstileWidget";
import { UI } from "./strings";

export interface IntakeFormProps {
  /** Step 1's choices: every catalog sport in roster order, the ones with their own pages marked `featured`. */
  sports: SportChoiceData[];
  /**
   * The per-sport example art (lib/intake/sport-art.ts `freeProofArtMap()`, resolved on the server — this
   * island never imports the asset map). The form picks the chosen sport's entry; a sport without one shows
   * the grey set.
   */
  art: FreeProofArtMap;
  /** The four products with every option's price label and site price (the bundle ladder and "Your order" price from these). */
  products: ProductTileData[];
  styles: StyleTileData[];
  /** C5 — content/blocks/photos-that-work-best.md, read on the server. */
  photosSubhead: string;
  /** The two example photographs beside the drop zone. */
  examples: PhotoExamples;
  /** Today in ET (YYYY-MM-DD): the earliest date the two date fields offer. */
  todayIso: string;
  /** NEXT_PUBLIC_TURNSTILE_SITE_KEY — the bot check mounts only when it is set. */
  turnstileSiteKey?: string;
  className?: string;
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

const EMPTY_SOURCE: SourceInfo = { landingPath: INTAKE_PATH, referrer: "", utm: {} };
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(UI.submit.mailtoSubject)}`;
const STEP_TITLE_ID = { 1: "fp-s-sport", 2: "fp-s-products", 3: "fp-s-style", 4: "fp-s-athlete", 5: "fp-s-photos", 6: "fp-s-contact" } as const;

const SUBMIT_CLASS = `inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-ui px-10 py-3 text-center font-display text-[1.125rem] uppercase leading-tight tracking-[0.04em] transition-[color,background-color,border-color,filter] duration-hover ease-out disabled:cursor-progress sm:w-auto ${PRIMARY_BUTTON_CLASS}`;
const KEY = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";

/**
 * One numbered stage (owner review 2026-10-04, points 3, 19, 20): the hairline rule with "STEP n OF 6" in
 * Barlow on it, the H2 in the home page's recipe (Anton, `text-h2`, uppercase, full stop) and ONE
 * supporting sentence; 40 px above and below on a phone, 56 px from md, so consecutive steps sit 80 / 112
 * px apart (they were 56 / 80). The heading takes focus when the hero CTA lands here.
 */
function Step({ n, title, support, children }: { n: keyof typeof STEP_TITLE_ID; title: string; support?: string; children: ReactNode }) {
  const titleId = STEP_TITLE_ID[n];
  return (
    <section id={`step-${n}`} aria-labelledby={titleId} className="scroll-mt-20 py-10 md:py-14 lg:scroll-mt-24">
      <div className="border-t border-hairline pt-3">
        <p className={KEY}>{INTAKE_COPY.stepLabel(n)}</p>
      </div>
      <h2 id={titleId} tabIndex={-1} data-step-focus="" className="mt-6 max-w-[20ch] font-display text-h2 uppercase text-balance">
        {title}
      </h2>
      {support ? <p className="mt-4 max-w-[60ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub">{support}</p> : null}
      <div className="mt-8 lg:mt-10">{children}</div>
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
 * The free-proof request (DESIGN §4.21, owner decision 2026-10-04; v2 configurator after the owner's
 * design review the same day): one page, one long form, one submit — no wizard, no account, no payment.
 * Six numbered steps (v4, 2026-10-06: sport → product → look → athlete → photos → send — the sport first,
 * and every picture on the page follows it), then the permissions panel and the
 * conversion card that holds the submit, both unnumbered; a sticky "Your order" panel at lg and a compact
 * read-back above the conversion card below it. The same validator as the server (parseProofRequest) runs
 * first; then POST /api/intake/start → each photo straight to storage through its signed URL, one at a
 * time → POST /api/intake/complete → the thanks page with the reference. Every failure keeps what was
 * entered, and a failed upload resumes where it stopped.
 */
export function IntakeForm({
  sports,
  art,
  products,
  styles,
  photosSubhead,
  examples,
  todayIso,
  turnstileSiteKey,
  className = "",
}: IntakeFormProps) {
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
  const [detailsOpen, setDetailsOpen] = useState(false);

  const source = useRef<SourceInfo>(EMPTY_SOURCE);
  const session = useRef<Session | null>(null);
  const objectUrls = useRef<Set<string>>(new Set());
  const nextId = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  const busy = phase !== "idle";

  // Where the parent came from (landing path, referrer, utm_* / fbclid) — read once, sent with the request.
  useEffect(() => {
    source.current = captureSource(window.location.pathname, window.location.search, document.referrer, readEntry());
  }, []);

  // The pictures above the form (the hero proof, the how-it-works band) follow the sport and the look
  // chosen here; they read them from the shared store, which is cleared when the form leaves the page.
  const { sportSlug, sportOther } = form.athlete;
  const chosenStyle = form.style;
  useEffect(() => {
    choiceStore.set({ sport: sportSlug, sportOther, style: chosenStyle });
  }, [sportSlug, sportOther, chosenStyle]);
  useEffect(() => () => choiceStore.set({ sport: "", sportOther: "", style: "" }), []);

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
    // The first invalid control in page order — the fields mark themselves with data-fp-invalid, the consent boxes with aria-invalid.
    const target = formRef.current?.querySelector<HTMLElement>('[data-fp-invalid], [aria-invalid="true"]');
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

  const onSport = (slug: string) => {
    setForm((f) => chooseSport(f, slug));
    touched();
  };
  const onSportOther = (sportOther: string) => {
    setForm((f) => ({ ...f, athlete: { ...f.athlete, sportOther } }));
    touched();
  };
  const onToggle = (key: ProductKey, selected: boolean) => {
    setForm((f) => ({ ...f, products: { ...f.products, [key]: { ...f.products[key], selected } } }));
    touched();
    if (selected) trackCustomize({ content_category: "product", content_ids: [key] });
  };
  const onOption = (key: ProductKey, option: string) => {
    setForm((f) => ({ ...f, products: { ...f.products, [key]: { ...f.products[key], option, selected: true } } }));
    touched();
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
      if (hasOptionalDetailError(parsed.errors)) setDetailsOpen(true);
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
        if (hasOptionalDetailError(errs)) setDetailsOpen(true);
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
    phase === "uploading" && progress ? INTAKE_COPY.submitting(progress.n, progress.total) : phase === "idle" ? INTAKE_COPY.ctaCard.button : INTAKE_COPY.finishing;

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

  // One sport on the whole page: its art (or the grey set), and the line every group of pictures carries.
  const entry = sportArt(art, sportSlug);
  const sportLabel = sportName(sportSlug, sportOther);
  const note = { state: artState(art, sportSlug), sport: sportLabel };
  const withArt = useMemo(() => new Set(Object.keys(art).filter((slug) => sportArt(art, slug))), [art]);
  const summary = { products, state: form.products, styles, style: form.style, art: entry, sport: sportLabel };
  const steps = INTAKE_COPY.steps6;

  return (
    <div className={`lg:grid lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start lg:gap-x-10 ${className}`.trim()}>
      <Suspense fallback={null}>
        <PrefillFromUrl onPrefill={onPrefill} />
      </Suspense>
      <form ref={formRef} noValidate onSubmit={onSubmit} className="min-w-0">
        <fieldset disabled={busy} className="min-w-0">
          <Step n={1} title={steps.sport.title} support={steps.sport.support}>
            <SportPicker
              sports={sports}
              value={sportSlug}
              other={sportOther}
              onChange={onSport}
              onOther={onSportOther}
              withArt={withArt}
              labelledBy={STEP_TITLE_ID[1]}
              errors={errors}
            />
          </Step>

          <Step n={2} title={steps.product.title} support={steps.product.support}>
            <ProductPicker
              products={products}
              state={form.products}
              onToggle={onToggle}
              onOption={onOption}
              art={entry}
              style={form.style}
              note={note}
              error={errors.products}
            />
          </Step>

          <Step n={3} title={steps.style.title} support={steps.style.support}>
            <StylePicker styles={styles} value={form.style} onChange={onStyle} labelledBy={STEP_TITLE_ID[3]} art={entry} note={note} error={errors.style} />
          </Step>

          <Step n={4} title={steps.athlete.title} support={steps.athlete.support}>
            <AthleteFields
              athlete={form.athlete}
              onChange={onAthlete}
              onStat={onStat}
              seniorNight={form.style === "SR"}
              todayIso={todayIso}
              detailsOpen={detailsOpen}
              onDetailsOpen={setDetailsOpen}
              errors={errors}
              statErrors={statErrors}
            />
          </Step>

          <Step n={5} title={steps.photos.title} support={photosSubhead}>
            <PhotoUploader
              photos={photos}
              crest={crest}
              examples={examples}
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
          </Step>

          <Step n={6} title={steps.contact.title} support={steps.contact.support}>
            <ContactFields contact={form.contact} onChange={onContact} errors={errors} />
          </Step>

          <div className="pt-2 md:pt-4">
            <ConsentFields crest={Boolean(crest)} onChange={onConsent} errors={errors} titleId="fp-s-consent" />
          </div>

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

        <SummaryRail {...summary} variant="bar" className="mt-12 md:mt-14 lg:hidden" />

        {/* The conversion card (owner review 2026-10-04, point 14): the form's one submit lives here. */}
        <section
          aria-labelledby="fp-cta-title"
          className="mt-12 rounded-[20px] border border-hairline bg-white p-6 shadow-[var(--shadow-card-stock)] sm:p-8 md:mt-14 lg:p-10"
        >
          <h2 id="fp-cta-title" className="max-w-[20ch] font-display text-h2 uppercase text-balance">
            {INTAKE_COPY.ctaCard.title}
          </h2>
          <p className="mt-6 flex items-baseline gap-3">
            <span className={KEY}>{INTAKE_COPY.ctaCard.todayLabel}</span>
            <span className="font-display text-price tabular-nums text-ink">{DUE_TODAY_LABEL}</span>
          </p>
          <p className="mt-2 max-w-[60ch] font-body text-body font-medium text-pretty text-ink">{INTAKE_COPY.ctaCard.line}</p>
          {turnstileSiteKey ? (
            <div className="mt-6">
              <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} resetSignal={turnstileReset} />
            </div>
          ) : null}
          <button id="fp-submit" type="submit" disabled={busy} aria-describedby="fp-submit-note" className={`mt-6 ${SUBMIT_CLASS}`}>
            {buttonLabel}
          </button>
          <p id="fp-submit-note" className="mt-3 font-body text-small text-muted-text">
            {INTAKE_COPY.ctaCard.note}
          </p>
          <p role="status" className="sr-only">
            {busy ? buttonLabel : ""}
          </p>
          <div role="alert" className={failureText ? "mt-5 max-w-[62ch] rounded-ui border border-fail p-4 font-body text-small font-medium text-ink" : undefined}>
            {failureText ? (
              <p className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-[0.4em] size-2 shrink-0 rounded-full bg-fail" />
                <span>{failureText}</span>
              </p>
            ) : null}
          </div>
          <noscript>
            <p className="mt-4 max-w-[62ch] font-body text-small text-ink">{UI.submit.noscript(SUPPORT_EMAIL)}</p>
          </noscript>
        </section>

        {/* The Etsy alternative (owner review 2026-10-06): one muted line and the house outline button, never orange, never a price. */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <p className="font-body text-small text-muted-text">{INTAKE_COPY.etsyAltShort}</p>
          <EtsyButton sku="GDE-ANY-SET" />
        </div>
      </form>

      <div className="hidden lg:sticky lg:top-24 lg:mt-14 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <SummaryRail {...summary} variant="rail" />
      </div>
    </div>
  );
}
