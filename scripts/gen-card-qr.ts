// Generate a QR code PNG for every card in the registry.
//
//   npm run qr:gen            (or: npx tsx scripts/gen-card-qr.ts)
//
// Each QR encodes the card's URL (QR_ORIGIN + /c/<cardId>) and is written to
// public/cards/qr/<cardId>.png. Re-run whenever the registry changes. `scripts/card-assets.ts`
// imports renderQrPng() so a missing code is regenerated with exactly these settings before it is
// patched onto a card back.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import QRCode, { type QRCodeToBufferOptions } from "qrcode";
import { cards, cardUrl } from "../lib/registry/cards";

export const QR_DIR = path.join(process.cwd(), "public", "cards", "qr");

/** 600 px, error correction M, a two-module quiet zone, dark modules on white (scannable on dark cards). */
export const QR_OPTIONS: QRCodeToBufferOptions = {
  type: "png",
  errorCorrectionLevel: "M",
  margin: 2,
  width: 600,
  color: { dark: "#0a0e16ff", light: "#ffffffff" },
};

export const QR_MARGIN_MODULES = 2;

export function renderQrPng(cardId: string): Promise<Buffer> {
  return QRCode.toBuffer(cardUrl(cardId), QR_OPTIONS);
}

export async function writeCardQr(cardId: string): Promise<string> {
  await mkdir(QR_DIR, { recursive: true });
  const file = path.join(QR_DIR, `${cardId}.png`);
  await writeFile(file, await renderQrPng(cardId));
  return file;
}

async function main() {
  for (const card of cards) {
    await writeCardQr(card.cardId);
    console.log(`✓ ${card.cardId} -> ${cardUrl(card.cardId)}`);
  }
  console.log(`\nWrote ${cards.length} QR code(s) to public/cards/qr/`);
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
