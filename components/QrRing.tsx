/**
 * The accent ring over the QR on a card back (DESIGN §4.14) — chrome drawn by the site, never baked
 * into the image. Centre and diameter are the constant MEASURED on the demo back by seo-assets
 * (2026-09-07, `BK-SN-card-BACK.png` → `cards.demo.back`: symbol x 7.2–19.1 %, y 85.9–94.5 %,
 * centre 13.1 % / 90.2 %; DESIGN finding 4's "y 75 %" is not what the file measures). The diameter is
 * 1.6 × the symbol width. Place it inside a `relative` CardFace box; the back it rings must decode to
 * the ID shown beside it (DESIGN §6.4).
 */
export interface QrRingProps {
  /** Centre as a percentage of the card's width / height. */
  center?: { x: number; y: number };
  /** Diameter as a percentage of the card width. */
  diameter?: number;
  className?: string;
}

export const QR_RING_DEFAULT = { center: { x: 13.1, y: 90.2 }, diameter: 19 } as const;

export function QrRing({ center = QR_RING_DEFAULT.center, diameter = QR_RING_DEFAULT.diameter, className = "" }: QrRingProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute aspect-square rounded-full border-2 border-accent ${className}`.trim()}
      style={{ left: `${center.x}%`, top: `${center.y}%`, width: `${diameter}%`, translate: "-50% -50%" }}
    />
  );
}
