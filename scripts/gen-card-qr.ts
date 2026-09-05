// Generate a QR code PNG for every card in the registry.
//
//   npm run qr:gen
//
// Each QR encodes the card's public URL (/c/<cardId>) and is written to
// public/cards/qr/<cardId>.png. Re-run whenever the registry changes.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { cards, cardUrl } from "../lib/registry/cards";

const OUT_DIR = path.join(process.cwd(), "public", "cards", "qr");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const card of cards) {
    const url = cardUrl(card.cardId);
    const png = await QRCode.toBuffer(url, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 2,
      width: 600,
      color: { dark: "#0a0e16ff", light: "#ffffffff" }, // dark modules on white (scannable on dark cards)
    });
    const file = path.join(OUT_DIR, `${card.cardId}.png`);
    await writeFile(file, png);
    console.log(`✓ ${card.cardId} -> ${url}`);
  }
  console.log(`\nWrote ${cards.length} QR code(s) to public/cards/qr/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
