"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type AnimationEvent, type ReactNode, type TransitionEvent } from "react";
import { CardFace, type ImageSpec } from "./CardFace";
import { FlipSideSwitch } from "./FlipSideSwitch";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const reducedMotionSnapshot = () => window.matchMedia(REDUCED_MOTION).matches;
const reducedMotionServerSnapshot = () => false;

/**
 * The signature motion (CONTRACTS §3.1, DESIGN §4.13) — a port of card-flip/web/flip.html:
 * perspective 1200 px, a 5 : 7 card with preserve-3d faces, radius 0, the 5.0 s keyframes and
 * cubic-bezier(0.4, 0, 0.2, 1) from the @theme tokens. The signature curve runs exactly once per
 * scene — on scroll-in (≥ 50 % visible, once) where `autoplay` is allowed, or on the first tap where
 * it is not (heroes, /c) — and every later tap is a 900 ms transition on the same curve.
 *
 * Server render: the front face is visible with no animation class, so the poster frame IS the front
 * image (LCP-safe, CLS 0). Reduced motion: no autoplay; the button becomes a two-state switch and a
 * Front / Back segmented control appears under the card. No JS: the <noscript> MP4 with poster =
 * front. No dependencies; the only client island on /c besides CopyIdButton and ShareRow.
 */
export interface CardFlipProps {
  front: ImageSpec;
  back: ImageSpec;
  /** 720 px H.264 fallback, `preload="none"`; also the page's VideoObject / download source. */
  mp4?: string;
  maxWidth?: number;
  /** Run the signature curve once when the card scrolls into view (below the fold only). */
  autoplay?: boolean;
  /** The front is the page's LCP image. */
  priority?: boolean;
  labels?: { flip: string; flipBack: string; click?: string; clickBack?: string };
  /** aria-label of the noscript video, e.g. "Card flip video, Marcus Ellison, Stadium Night finish". */
  videoLabel?: string;
  /** A static back rendered beside the flip at ≥ md (product §3) so the QR and ID are seen without interaction. */
  staticBackBeside?: ReactNode;
  /**
   * The band the card sits on. Everything used to be hard-wired to arena — on the stock product pages
   * the caption measured 1.84 : 1 (#AEB6C2 on #F4F3EF at 12 px) and it is the ONLY thing telling anyone
   * the card is interactive (audit 2026-09-08, B3). Defaults to stock, and the stock classes carry
   * `arena:` overrides, so a page inside `[data-surface="arena"]` that never passes the prop still gets
   * the arena caption, the arena shadow and the arena switch.
   */
  tone?: "stock" | "arena";
  sizes?: string;
  className?: string;
}

type Side = "front" | "back";
type Signature = "none" | "flip" | "flip-back";

/**
 * "Tap" is the caption on a desktop mouse too (audit 2026-09-08, N8). Both wordings ship and CSS picks
 * one by pointer type, so the touch string stays exactly what it was.
 */
export const FLIP_LABELS = { flip: "Tap to flip", flipBack: "Tap to flip back", click: "Click to flip", clickBack: "Click to flip back" } as const;
/**
 * The aria-label names the ACTION, so it changes with the side and carries no `aria-pressed` — the two
 * together made a screen reader say "Tap to flip — show the front, toggle button, pressed" (S14).
 */
export const FLIP_ARIA = { toBack: "Show the back of the card", toFront: "Show the front of the card" } as const;
export const FLIP_ANNOUNCE = { back: "Showing the back", front: "Showing the front" } as const;

const escapeAttr = (s: string): string => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * The caption is the flip's only affordance, so it is held to body-text contrast on both bands, and it
 * lights up on hover — the largest interactive object on four pages answered the pointer with nothing
 * at all (N2). `group-hover` comes from the button.
 */
const CAPTION = {
  stock: "text-muted-text transition-colors duration-hover ease-out group-hover:text-ink arena:text-arena-muted arena:group-hover:text-white",
  arena: "text-arena-muted transition-colors duration-hover ease-out group-hover:text-white",
} as const;

/** A stock-toned face still needs the arena shadow and the inset hairline when the band around it is dark. */
const faceAdapt =
  "arena:shadow-[var(--shadow-card-arena)] arena:after:pointer-events-none arena:after:absolute arena:after:inset-0 arena:after:ring-1 arena:after:ring-inset arena:after:ring-white/10";

export function CardFlip({
  front,
  back,
  mp4,
  maxWidth = 360,
  autoplay = true,
  priority,
  labels = FLIP_LABELS,
  videoLabel,
  staticBackBeside,
  tone = "stock",
  sizes = "(min-width: 768px) 360px, 80vw",
  className = "",
}: CardFlipProps) {
  const [side, setSide] = useState<Side>("front");
  const [playing, setPlaying] = useState(false);
  const [signature, setSignature] = useState<Signature>("none");
  const [played, setPlayed] = useState(false);
  const [announce, setAnnounce] = useState("");
  const reduced = useSyncExternalStore(subscribeReducedMotion, reducedMotionSnapshot, reducedMotionServerSnapshot);
  const cardRef = useRef<HTMLDivElement>(null);

  const startSignature = useCallback((kind: Exclude<Signature, "none">) => {
    setPlaying(true);
    setSignature(kind);
  }, []);

  useEffect(() => {
    if (!autoplay || reduced || played || playing) return;
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          startSignature("flip");
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoplay, reduced, played, playing, startSignature]);

  function finish(next: Side) {
    setSide(next);
    setSignature("none");
    setPlaying(false);
    setPlayed(true);
    setAnnounce(FLIP_ANNOUNCE[next]);
  }

  function onAnimationEnd(e: AnimationEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || signature === "none") return;
    finish(signature === "flip" ? "back" : "front");
  }

  function onTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform" || signature !== "none") return;
    setPlaying(false);
    setAnnounce(FLIP_ANNOUNCE[side]);
  }

  function show(next: Side) {
    if (playing || next === side) return;
    if (reduced) {
      setSide(next);
      setAnnounce(FLIP_ANNOUNCE[next]);
      return;
    }
    if (!played) {
      startSignature(next === "back" ? "flip" : "flip-back");
      return;
    }
    setPlaying(true);
    setSide(next);
  }

  const toggle = () => show(side === "front" ? "back" : "front");

  const motion =
    signature === "flip"
      ? "animate-card-flip"
      : signature === "flip-back"
        ? "animate-card-flip-back"
        : `${side === "back" ? "rotate-y-180" : "rotate-y-0"} ${reduced ? "transition-none" : played ? "transition-transform duration-[900ms] ease-flip" : ""}`;

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className={staticBackBeside ? "flex flex-col items-center gap-6 md:flex-row md:items-start" : ""}>
        <div className="w-full" style={{ maxWidth }}>
          <button
            type="button"
            onClick={toggle}
            aria-label={side === "front" ? FLIP_ARIA.toBack : FLIP_ARIA.toFront}
            className="group block w-full rounded-none text-left perspective-[1200px]"
          >
            <div
              ref={cardRef}
              onAnimationEnd={onAnimationEnd}
              onTransitionEnd={onTransitionEnd}
              className={`relative aspect-[5/7] w-full transform-3d rounded-none ${motion}`.trim()}
            >
              <div className="absolute inset-0 backface-hidden rounded-none">
                <CardFace {...front} fill surface={tone} className={faceAdapt} sizes={sizes} priority={priority} />
              </div>
              <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-none">
                <CardFace
                  {...back}
                  fill
                  surface={tone}
                  className={faceAdapt}
                  sizes={sizes}
                  loading={priority ? "eager" : "lazy"}
                  fetchPriority={priority ? "low" : undefined}
                />
              </div>
            </div>
            <span aria-hidden="true" className={`mt-3 block text-center font-label text-label font-semibold uppercase tracking-[0.12em] ${CAPTION[tone]}`}>
              <span className="[@media(pointer:fine)]:hidden">{side === "front" ? labels.flip : labels.flipBack}</span>
              <span className="hidden [@media(pointer:fine)]:inline">{side === "front" ? (labels.click ?? labels.flip) : (labels.clickBack ?? labels.flipBack)}</span>
            </span>
          </button>
          {reduced ? <FlipSideSwitch side={side} onChange={show} tone={tone} className="mt-3" /> : null}
          <span role="status" aria-live="polite" className="sr-only">
            {announce}
          </span>
          {mp4 ? (
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<video muted playsinline controls preload="none" poster="${escapeAttr(front.src)}"${videoLabel ? ` aria-label="${escapeAttr(videoLabel)}"` : ""}><source src="${escapeAttr(mp4)}" type="video/mp4" /></video>`,
              }}
            />
          ) : null}
        </div>
        {staticBackBeside ? <div className="hidden w-[55%] md:block">{staticBackBeside}</div> : null}
      </div>
    </div>
  );
}
