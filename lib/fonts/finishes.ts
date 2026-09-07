// The seven finish pairs (one per style code). Imported ONLY by app/(registry)/c/[cardId]/** — the
// page wraps its content in <div data-surface="arena" className={finishFontClass(code)}> and uses the
// `font-finish-display` / `font-finish-supporting` utilities, which resolve --ff-display / --ff-supporting.
//
// next/font forbids conditional or computed loader calls, so all seven pairs are declared at module
// scope. Its SWC transform also rejects spreads and identifiers in the options ("Font loaders don't
// accept spreads", "Font loader values must be explicitly written literals"), so every call below is
// written out in full rather than spreading a shared object.
//
// preload: false on EVERY finish font: next/font then emits only the @font-face CSS (~5 KB for all
// 14 faces) and the browser downloads just the two files the rendered finish actually uses. With
// preload: true all 14 files would be <link rel=preload>ed on every /c page (~500 KB+).
//
// Every declaration sets the SAME two CSS variables (--ff-display, --ff-supporting): only one pair's
// className is applied per page, so the wrapper element resolves the finish's family. Anton / Barlow /
// Space Grotesk are declared a second time here under the finish variable names — the underlying
// woff2 is content-hashed by next/font, so the browser fetches the same URL it already has.
import {
  Anton,
  Archivo,
  Archivo_Narrow,
  Barlow,
  Chakra_Petch,
  Graduate,
  Khand,
  Orbitron,
  Oswald,
  Passion_One,
  Playfair_Display,
  Russo_One,
  Saira_Condensed,
  Space_Grotesk,
} from "next/font/google";
import type { Style } from "../catalog/styles";

/** Same shape as `StyleCode` in lib/catalog/styles.ts (derived here so this file does not depend on that export landing). */
type StyleCode = Style["code"];

const snDisplay = Anton({ weight: "400", subsets: ["latin"], display: "swap", preload: false, variable: "--ff-display" });
const snSupporting = Barlow({ weight: ["500", "600"], subsets: ["latin"], display: "swap", preload: false, variable: "--ff-supporting" });
const caDisplay = Russo_One({ weight: "400", subsets: ["latin"], display: "swap", preload: false, variable: "--ff-display" });
const caSupporting = Saira_Condensed({ weight: ["500", "600", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--ff-supporting" });
const fsDisplay = Passion_One({ weight: ["400", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--ff-display" });
const fsSupporting = Khand({ weight: ["500", "600"], subsets: ["latin"], display: "swap", preload: false, variable: "--ff-supporting" });
const heDisplay = Graduate({ weight: "400", subsets: ["latin"], display: "swap", preload: false, variable: "--ff-display" });
const heSupporting = Archivo_Narrow({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-supporting" }); // variable
const ssDisplay = Space_Grotesk({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-display" }); // variable
const ssSupporting = Archivo({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-supporting" }); // variable
const prDisplay = Orbitron({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-display" }); // variable
const prSupporting = Chakra_Petch({ weight: ["500", "700"], subsets: ["latin"], display: "swap", preload: false, variable: "--ff-supporting" });
const srDisplay = Playfair_Display({ style: ["normal", "italic"], subsets: ["latin"], display: "swap", preload: false, variable: "--ff-display" }); // variable; italic for the senior quote
const srSupporting = Oswald({ subsets: ["latin"], display: "swap", preload: false, variable: "--ff-supporting" }); // variable; Oswald has NO italic

export interface FinishFonts {
  className: string;
  display: string;
  supporting: string;
}

export const FINISH_FONTS: Record<StyleCode, FinishFonts> = {
  SN: { className: `${snDisplay.variable} ${snSupporting.variable}`, display: "Anton", supporting: "Barlow" },
  CA: { className: `${caDisplay.variable} ${caSupporting.variable}`, display: "Russo One", supporting: "Saira Condensed" },
  FS: { className: `${fsDisplay.variable} ${fsSupporting.variable}`, display: "Passion One", supporting: "Khand" },
  HE: { className: `${heDisplay.variable} ${heSupporting.variable}`, display: "Graduate", supporting: "Archivo Narrow" },
  SS: { className: `${ssDisplay.variable} ${ssSupporting.variable}`, display: "Space Grotesk", supporting: "Archivo" },
  PR: { className: `${prDisplay.variable} ${prSupporting.variable}`, display: "Orbitron", supporting: "Chakra Petch" },
  SR: { className: `${srDisplay.variable} ${srSupporting.variable}`, display: "Playfair Display", supporting: "Oswald" },
};

export const finishFontClass = (code: StyleCode): string => FINISH_FONTS[code].className;
