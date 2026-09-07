// The order-by calculator's strings (COPY §2.5 (2)) — in a plain module, not in the client
// component that renders them.
//
// `components/OrderByCalculator.tsx` is a "use client" module. A server component that imports a
// value from a client module does not get the value: it gets a client reference, so
// `CALC_STRINGS.heading` read on the server is `undefined` and `/senior-night` section 02 shipped an
// empty <h2>. Strings that a server component has to read therefore live here, on the server side of
// the boundary, and the island imports them the same way.

export const CALC_COPY = {
  heading: "WHEN IS SENIOR NIGHT?",
  label: "Senior night date",
  help: "US date, Eastern time. We count business days from the day you order.",
  button: "Check what's in time",
  giftButton: "Gift the digital first — print the gift note",
  rows: {
    files: { key: "Digital files", fits: (d: string) => `Files by ${d} — before the night`, miss: "Files land after the night" },
    printedSet: { key: "Printed set", fits: (d: string) => `Order by ${d} for the printed set to ship in time`, miss: "A printed set can no longer ship before the night" },
    sealedPack: { key: "Sealed pack", fits: (d: string) => `Order by ${d}`, miss: "The sealed pack arrives after the night" },
  },
} as const;
