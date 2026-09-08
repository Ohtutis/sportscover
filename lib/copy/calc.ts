// The order-by calculator's strings (COPY §2.5 (2)) — in a plain module, not in the client
// component that renders them.
//
// `components/OrderByCalculator.tsx` is a "use client" module. A server component that imports a
// value from a client module does not get the value: it gets a client reference, so
// `CALC_STRINGS.heading` read on the server is `undefined` and `/senior-night` section 02 shipped an
// empty <h2>. Strings that a server component has to read therefore live here, on the server side of
// the boundary, and the island imports them the same way.

import { LEAD_TIMES } from "../catalog/delivery";

const [digitalMin, digitalMax] = LEAD_TIMES.digitalBusinessDays;

export const CALC_COPY = {
  heading: "WHEN IS SENIOR NIGHT?",
  label: "Senior night date",
  help: "US date, Eastern time. We count business days from the day you order.",
  button: "Check what's in time",
  giftButton: "Gift the digital first — print the gift note",
  rows: {
    // The files row is the one row that does not move with the date: a night three days out and one
    // 120 days out both answered "Files by <date> — before the night", which read as if the files had
    // been timed to the night (smooth audit, 2026-09-08). It now says what the date actually is.
    files: {
      key: "Digital files",
      fits: (d: string) => `Files arrive ${d} — ${digitalMin}–${digitalMax} business days after you order, whichever night it is.`,
      miss: "Files land after the night",
    },
    printedSet: { key: "Printed set", fits: (d: string) => `Order by ${d} for the printed set to ship in time`, miss: "A printed set can no longer ship before the night" },
    sealedPack: { key: "Sealed pack", fits: (d: string) => `Order by ${d}`, miss: "The sealed pack arrives after the night" },
  },
} as const;

export type CalcRowKey = keyof typeof CALC_COPY.rows;

/**
 * The ONE sentence a screen reader hears when the result appears.
 *
 * `<output>` is a live region, so the whole result was announced in one breath: a three-row ledger
 * with its PASS/FAIL chips, the fallback paragraph and the CTA — 413 characters measured (smooth
 * audit, 2026-09-08). The ledger is the same information, in a form you read rather than hear.
 */
export const planSummary = (night: string, rows: readonly { key: CalcRowKey; fits: boolean }[]): string =>
  `For ${night}: ${rows.map((row) => `${CALC_COPY.rows[row.key].key.toLowerCase()} ${row.fits ? "in time" : "not in time"}`).join(", ")}.`;
