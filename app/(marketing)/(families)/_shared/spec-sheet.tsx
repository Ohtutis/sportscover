import { Ledger, type LedgerRow } from "../../../../components/Ledger";
import { LEAD_TIMES } from "../../../../lib/catalog/delivery";
import type { Family } from "../../../../lib/catalog/prices";
import { getTier } from "../../../../lib/catalog/prices";
import { FILE_COUNTS } from "../../../../lib/catalog/tiers";
import { CANON } from "../../../../lib/copy/canon";
import { Section } from "./section";

/**
 * Section 02 — the spec sheet (DESIGN §5.2-2): a table instead of adjectives, rendered as the `Ledger`
 * at `size="lg"`, the page's second hero. Rows are COPY §2.2 (2) / §2.3 (2) / §2.4 (2) verbatim; every
 * number the catalog owns (the pack weeks, the pack line, the file count) comes from the catalog. The
 * sealed-pack row is hidden with its tier (GAPS #12).
 */
const [packWeeksMin, packWeeksMax] = LEAD_TIMES.sealedPackWeeks;

const packEnabled = (): boolean => Boolean(getTier("GDE-ANY-CARD-PACK")?.enabled);

export const SPEC_HEADINGS: Record<Family, { title: string; subhead: string }> = {
  cards: { title: "THE SPEC SHEET.", subhead: "A table instead of adjectives." },
  posters: { title: "THE SPEC SHEET.", subhead: "A table instead of adjectives." },
  set: { title: "EVERYTHING YOU GET.", subhead: `${FILE_COUNTS.set} files and one live page. Counted, not implied.` },
  snset: { title: "EVERYTHING YOU GET.", subhead: `${FILE_COUNTS.snset} files and one live page. Counted, not implied.` },
};

const CARD_ROWS: LedgerRow[] = [
  { key: "Size", value: "2.5 × 3.5 in (63.5 × 89 mm)" },
  { key: "Corners", value: "Square-cut" },
  { key: "Finish", value: "UV-coated" },
  { key: "Stock", value: "Professional photo card stock" },
  { key: "Print", value: "300 dpi from 816 × 1110 px files with bleed" },
  { key: "Front", value: "Four shots of your athlete, name, position, team, season, finish" },
  { key: "Back", value: "Season stats (up to three), highlight line, athlete signature line, registered card ID, QR code" },
  { key: "Loose sets", value: "12 or 24 cards — printed in California, shipped free in the US" },
];

const PACK_ROW: LedgerRow = {
  key: "Sealed pack",
  value: `${CANON.packLine} — printed in Hong Kong, ships separately, ${packWeeksMin}–${packWeeksMax} weeks`,
};

const CARD_TAIL_ROWS: LedgerRow[] = [
  { key: "Digital files", value: "PNG at 300 dpi: front, back, certificate, flip video (MP4 ×2) and GIF" },
  { key: "Registry", value: "One registered edition per athlete, per finish, per season; page kept online at least five years" },
];

const POSTER_ROWS: LedgerRow[] = [
  { key: "Paper", value: "Matte, 189 g/m²" },
  { key: "Sizes", value: "18 × 24 in · 24 × 36 in (30 × 40 in printed-only, when available)" },
  { key: "Source", value: "Composed at 5400 × 7200 px for 18 × 24 at 300 dpi; larger sizes upscaled 4× with faces checked at 4× before print" },
  { key: "Packaging", value: "Rolled, shipped in a tube with the printed certificate (per lab)" },
  { key: "Certificate", value: "Free printed Certificate of Authenticity in every shipped package — the digital files tier has no certificate" },
  { key: "Digital files", value: "Both sizes as PNG at 300 dpi; phone (lock and home), tablet and desktop wallpapers" },
  { key: "Printed in", value: "North Carolina — shipped free in the US" },
];

const SET_ROWS: LedgerRow[] = [
  { key: "01-print", value: "Card front and back (816 × 1110 px, 300 dpi, with bleed) · poster 18 × 24 and 24 × 36 · certificate" },
  { key: "02-social", value: "Nine social posts — square, portrait and story" },
  { key: "03-wallpapers", value: "Seven wallpapers — phone lock and home, tablet, desktop" },
  { key: "04-bonus", value: "Sticker, number badge (numbered sports) or name badge, transparent cutouts" },
  { key: "05-video", value: "Card flip — 1080 × 1350 and 1080 × 1920" },
  { key: "Live page", value: "The card's registered page, from the QR code on the back" },
];

/**
 * The five delivery folders, without the "Live page" row (DESIGN §5.2-3): `/complete-set` §3
 * promises a count, so it shows the count — the same rows the spec sheet renders, beside the
 * timeline that says when each one arrives.
 */
export const setFolderRows = (): LedgerRow[] => SET_ROWS.filter((row) => /^\d{2}-/.test(String(row.key)));

export function specRows(family: Family): LedgerRow[] {
  if (family === "posters") return POSTER_ROWS;
  if (family === "cards") return [...CARD_ROWS, ...(packEnabled() ? [PACK_ROW] : []), ...CARD_TAIL_ROWS];
  return SET_ROWS;
}

/**
 * The band runs heading-above-table, not heading-beside-table (owner review, 2026-09-07). The rail put
 * the section rule in a 252 px track and left the two columns ending 460 px apart — a two-line heading
 * beside a ten-row ledger. One column: the rule spans the container, the table spans the container, and
 * every row is one line instead of a 38 % key column wrapping the value into four.
 */
export function SpecSheetSection({ family }: { family: Family }) {
  const heading = SPEC_HEADINGS[family];
  return (
    <Section index={2} id="spec" title={heading.title} subhead={heading.subhead}>
      <Ledger rows={specRows(family)} size="lg" />
    </Section>
  );
}
