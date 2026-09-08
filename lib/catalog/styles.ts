// The seven styles: six art finishes + Senior Night as an occasion-led edition (no finish picker).
// Codes are the ones the card IDs use (lib/registry/cards.ts STYLE_CODES).

export interface Style {
  code: "SN" | "CA" | "FS" | "HE" | "SS" | "PR" | "SR";
  name: string;
  /** URL slug (F3 `/styles/<slug>`; F1 pages link `/trading-cards#finishes` or `/senior-night`). */
  slug: string;
  isOccasion: boolean;
  material: string;
  fontPair: { display: string; supporting: string };
  /** How the finish display face sets the athlete name on /c: the six finishes are uppercase; Playfair (SR) keeps the card's case. */
  displayCase?: "upper" | "title";
}

export type StyleCode = Style["code"];

export const styles: Style[] = [
  { code: "SN", name: "Stadium Night", slug: "stadium-night", isOccasion: false, material: "Soft silver foil, floodlit arena atmosphere.", fontPair: { display: "Anton", supporting: "Barlow" } },
  { code: "CA", name: "Chrome All-Star", slug: "chrome-all-star", isOccasion: false, material: "High-contrast chrome, clean studio light.", fontPair: { display: "Russo One", supporting: "Saira Condensed" } },
  { code: "FS", name: "Fire & Smoke", slug: "fire-and-smoke", isOccasion: false, material: "Ember glow, drifting smoke, high energy.", fontPair: { display: "Passion One", supporting: "Khand" } },
  { code: "HE", name: "Heritage", slug: "heritage", isOccasion: false, material: "Classic card character with a warm, printed feel.", fontPair: { display: "Graduate", supporting: "Archivo Narrow" } },
  { code: "SS", name: "Signature Spotlight", slug: "signature-spotlight", isOccasion: false, material: "Clean spotlight and a signature line.", fontPair: { display: "Space Grotesk", supporting: "Archivo" } },
  { code: "PR", name: "Prism Rush", slug: "prism-rush", isOccasion: false, material: "Prismatic light and split-type energy.", fontPair: { display: "Orbitron", supporting: "Chakra Petch" } },
  { code: "SR", name: "Senior Night", slug: "senior-night", isOccasion: true, material: "Gold senior edition — class year, four-year career line, senior quote.", fontPair: { display: "Playfair Display", supporting: "Oswald" }, displayCase: "title" },
];

export const finishes = styles.filter((s) => !s.isOccasion);
export const styleByCode = (code: string): Style | undefined => styles.find((s) => s.code === code);
export const styleByName = (name: string): Style | undefined => styles.find((s) => s.name === name);
export const styleBySlug = (slug: string): Style | undefined => styles.find((s) => s.slug === slug);
/** Where a marketing page sends "See the {Finish} finish" in F1 (no /styles/<slug> yet). */
export const styleHrefF1 = (s: Style): string => (s.isOccasion ? "/senior-night" : "/trading-cards#finishes");
