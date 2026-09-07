import { Anton, Barlow, Space_Grotesk } from "next/font/google";

// Anton has one weight. Space Grotesk is a variable font (300–700 in one file) — omit `weight`.
// Barlow SemiBold only (form labels, table heads, ID/time lines) plus 500 for chips; it never sets
// above-the-fold text, so it is not preloaded (DESIGN §10.1).
export const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-anton" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-space-grotesk" });
export const barlow = Barlow({ weight: ["500", "600"], subsets: ["latin"], display: "swap", preload: false, variable: "--font-barlow" });

/** Put on <html>. Every marketing route gets exactly these three families and nothing else. */
export const siteFontClass = `${anton.variable} ${spaceGrotesk.variable} ${barlow.variable}`;
