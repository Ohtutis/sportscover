// The seven styles: six art finishes + Senior Night as an occasion-led edition (no finish picker).
// Codes are the ones the card IDs use (lib/registry/cards.ts STYLE_CODES).

export interface Style {
  code: "SN" | "CA" | "FS" | "HE" | "SS" | "PR" | "SR";
  name: string;
  isOccasion: boolean;
  material: string;
  fontPair: { display: string; supporting: string };
}

export const styles: Style[] = [
  { code: "SN", name: "Stadium Night", isOccasion: false, material: "Soft silver foil, floodlit arena atmosphere.", fontPair: { display: "Anton", supporting: "Barlow" } },
  { code: "CA", name: "Chrome All-Star", isOccasion: false, material: "High-contrast chrome, clean studio light.", fontPair: { display: "Russo One", supporting: "Saira Condensed" } },
  { code: "FS", name: "Fire & Smoke", isOccasion: false, material: "Ember glow, drifting smoke, high energy.", fontPair: { display: "Passion One", supporting: "Khand" } },
  { code: "HE", name: "Heritage", isOccasion: false, material: "Classic card character with a warm plate.", fontPair: { display: "Graduate", supporting: "Archivo Narrow" } },
  { code: "SS", name: "Signature Spotlight", isOccasion: false, material: "Clean spotlight and a signature line.", fontPair: { display: "Space Grotesk", supporting: "Archivo" } },
  { code: "PR", name: "Prism Rush", isOccasion: false, material: "Prismatic light and split-type energy.", fontPair: { display: "Orbitron", supporting: "Chakra Petch" } },
  { code: "SR", name: "Senior Night", isOccasion: true, material: "Gold senior edition — class year, four-year career line, senior quote.", fontPair: { display: "Playfair Display", supporting: "Oswald" } },
];

export const finishes = styles.filter((s) => !s.isOccasion);
export const styleByCode = (code: string): Style | undefined => styles.find((s) => s.code === code);
export const styleByName = (name: string): Style | undefined => styles.find((s) => s.name === name);
