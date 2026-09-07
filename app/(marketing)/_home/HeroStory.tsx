"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

/**
 * Section 01's narration (owner review, 2026-09-07). Three scenes, one box: a parent's phone photo
 * drops in, the poster and the card assemble out of it, the card turns, and the next athlete — a
 * different sport, one of them an adult — does the same. In four seconds a visitor sees that this
 * works for any athlete, any sport, any age.
 *
 * The island is deliberately thin. Every frame is server-rendered markup handed in as `scenes`; this
 * component only sets two attributes — `data-phase` on the root and `data-state` on each scene — and
 * `app/globals.css` does the rest. So there is no per-frame JavaScript, no animation library, and the
 * server render (`data-phase="still"`) is a complete, legible hero: scene one, assembled, front up.
 *
 * Motion rules (DESIGN §7): the only move is the signature flip, run once per scene on the same
 * keyframes and the same `--ease-flip` curve, shortened to `--duration-flip-story` because a 4.3 s
 * scene cannot hold a 5 s move. `prefers-reduced-motion` keeps the phase at "still" for ever: nothing
 * animates and nothing advances, but every scene stays reachable through the dots.
 */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const reducedMotionSnapshot = () => window.matchMedia(REDUCED_MOTION).matches;
const reducedMotionServerSnapshot = () => false;

/** The beats of one scene, in order, with how long each holds. 4.3 s a scene, ~13 s the loop. */
export const STORY_BEATS = [
  { phase: "photo", ms: 800 },
  { phase: "build", ms: 1200 },
  { phase: "flip", ms: 1600 },
  { phase: "hold", ms: 700 },
] as const;

export const STORY_SCENE_MS = STORY_BEATS.reduce((n, b) => n + b.ms, 0);

/** How long the assembled first scene holds before the loop starts. */
export const STORY_OPENING_MS = 900;

/** Control labels. Functional chrome, not marketing copy — nothing here makes a claim. */
export const STORY_LABELS = {
  pause: "Pause the example",
  play: "Play the example",
  list: "Choose an example",
  show: (label: string) => `Show the ${label} example`,
} as const;

export interface HeroStoryProps {
  /** One server-rendered stage per scene (all stacked in the same box — the box never resizes). */
  scenes: ReactNode[];
  /** One caption per scene, same order; rendered in a fixed-height row so a long name shifts nothing. */
  captions: ReactNode[];
  /** Short name per scene for the dot controls, e.g. "basketball". */
  labels: string[];
  /** The one accessible name for the whole narration — frames are never announced one by one. */
  summary: string;
  className?: string;
}

export function HeroStory({ scenes, captions, labels, summary, className = "" }: HeroStoryProps) {
  const count = scenes.length;
  // -1 is the server render and the first paint: scene one, assembled, front face up. The loop begins
  // one beat later, so the first thing a visitor sees is the finished edition, not an empty stage.
  const [step, setStep] = useState(-1);
  const [paused, setPaused] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, reducedMotionSnapshot, reducedMotionServerSnapshot);

  const started = step >= 0;
  const beat = started ? step % STORY_BEATS.length : 0;
  const scene = started ? Math.floor(step / STORY_BEATS.length) % count : 0;
  const still = reduced || !started || count < 2;
  const phase = still ? "still" : STORY_BEATS[beat].phase;
  const running = !reduced && count > 1 && !paused;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), started ? STORY_BEATS[beat].ms : STORY_OPENING_MS);
    return () => window.clearTimeout(id);
  }, [running, started, beat, step]);

  // A dot is also the replay: it restarts its scene on beat one, whether or not it is the current one.
  const go = useCallback((i: number) => setStep(i * STORY_BEATS.length), []);

  return (
    <div data-story="" data-phase={phase} className={`flex flex-col justify-center ${className}`.trim()}>
      <div role="img" aria-label={summary} className="relative mx-auto aspect-[4/3] w-[86%] sm:aspect-[7/5] sm:w-full">
        {scenes.map((node, i) => (
          <div key={labels[i] ?? i} data-story-scene="" data-state={i === scene ? "active" : "idle"} className="absolute inset-0">
            {node}
          </div>
        ))}
      </div>
      <div className="relative mt-3 h-[2.8em] overflow-hidden">
        {captions.map((node, i) => (
          <p
            key={labels[i] ?? i}
            aria-hidden={i === scene ? undefined : "true"}
            className={`absolute inset-0 font-body text-[0.75rem] font-medium leading-[1.4] tracking-[0.01em] text-muted-text transition-opacity duration-300 ${
              i === scene ? "opacity-100" : "opacity-0"
            }`}
          >
            {node}
          </p>
        ))}
      </div>
      {count > 1 ? (
        <div className="mt-1 flex items-center">
          {reduced ? (
            <span aria-hidden="true" className="block h-11 w-11" />
          ) : (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? STORY_LABELS.play : STORY_LABELS.pause}
              className="inline-flex h-11 w-11 items-center justify-center rounded-ui text-ink transition-[background-color] duration-hover ease-out hover:bg-ink/5"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="h-3.5 w-3.5 fill-current">
                {paused ? <path d="M3 1.5 13.5 8 3 14.5z" /> : <path d="M3 2h3.2v12H3zM9.8 2H13v12H9.8z" />}
              </svg>
            </button>
          )}
          <ul aria-label={STORY_LABELS.list} className="flex items-center">
            {labels.map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === scene ? "true" : undefined}
                  aria-label={STORY_LABELS.show(label)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-ui"
                >
                  <span
                    aria-hidden="true"
                    className={`block h-2 w-2 rounded-full transition-colors duration-hover ease-out ${i === scene ? "bg-ink" : "bg-ink/25"}`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
