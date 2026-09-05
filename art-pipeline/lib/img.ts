import sharp from "sharp";

/**
 * HOW BIG A REFERENCE IS WHEN IT LEAVES THIS MACHINE — and 1024 was never a decision.
 *
 * It sat here as an unexplained default while everything else in the pipeline was argued
 * out in writing. Measured on the Order 01 identity plate, 2026-08-22:
 *
 *   on disk            2400x1792   face 449 px
 *   sent at 1024       1024x765    face 191 px
 *   sent at 2048       2048x1529   face 382 px
 *
 * So the generator is handed a 191 px face and asked to reproduce one specific person —
 * while `intake.ts` REJECTS a customer's own photograph whose face is under 180 px, on the
 * grounds that it is too small to work from. The pipeline was applying a standard to the
 * customer that it did not apply to itself.
 *
 * Input tokens are the cheap half of the bill (2 USD per 1M against 120 for output), so
 * quadrupling the pixels costs cents per generation.
 *
 * MEASURED, same plate, same prompt, same model, only this number moved:
 *
 *   refs at 1024   hero scored 0.734 against the customer's four photographs
 *   refs at 2048   hero scored 0.765
 *
 * +0.031 of likeness for about a cent — the largest single improvement of that day, and it
 * had been sitting behind an unexamined default the whole time. 2048 is now the default;
 * GDE_REF_PX still overrides it, because one controlled comparison is evidence, not proof.
 */
export const REF_PX = Number(process.env.GDE_REF_PX ?? 2048);

export async function refFor(path: string, width = REF_PX) {
  // `.rotate()` WITH NO ARGUMENT APPLIES THE EXIF ORIENTATION, and leaving it out was a silent
  // defect on the whole per-order path (found 2026-08-22, Order 02).
  //
  // A phone photograph taken in portrait is stored as landscape pixels plus an orientation
  // tag. OpenCV honours that tag, so `lib/face.py` — and therefore intake, the identity gate
  // and every similarity number — saw the photograph upright and passed it. sharp does NOT
  // honour it unless asked, so the SAME file went to the generator lying on its side. Three
  // of Order 02's four photographs carry orientation=6.
  //
  // Nothing failed. Intake reported a clean set, the plate came back a plausible person, and
  // the anchor had simply been built from photographs on their side. This is the failure mode
  // README section 6 is about: two libraries disagreeing quietly about the same file.
  const data = await sharp(path).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer();
  return { data, mime: "image/jpeg" as const };
}

/**
 * A reference CROPPED TO THE HEAD, so the pixels that get sent are the ones that matter.
 *
 * `refFor` shrinks the whole frame to REF_PX, which spends most of that budget on the room.
 * Measured on Order 02's cleared photographs — the customer's own gallery, no studio involved:
 *
 *   IMG_8684   real face 935 px   sent as 335 px   cropped it would be 683 px
 *   IMG_2454   real face 892 px   sent as 320 px   cropped it would be 683 px
 *
 * Roughly half the detail the customer actually provided was being thrown away before the
 * request left the machine. That matters most for exactly the orders that cannot be fixed by
 * asking for better photographs — a gift buyer choosing from a gallery cannot stand the
 * subject by a window, so the only place left to find detail is in the pixels they already
 * sent.
 *
 * Three face widths of context keeps the head, the hair and the shoulders — the plate needs
 * the hairline and the jaw, not a passport crop.
 */
export async function faceRefFor(path: string, bbox: number[], width = REF_PX, context = 3) {
  const img = sharp(path).rotate();
  const meta = await img.metadata();
  // Post-rotation dimensions: EXIF may swap them, and bbox came from an EXIF-aware reader.
  const W = meta.autoOrient?.width ?? meta.width ?? 0;
  const H = meta.autoOrient?.height ?? meta.height ?? 0;
  const [x0, y0, x1, y1] = bbox;
  const fw = x1 - x0, fh = y1 - y0;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const half = Math.max(fw, fh) * context / 2;
  const left = Math.max(0, Math.round(cx - half));
  const top = Math.max(0, Math.round(cy - half));
  const right = Math.min(W, Math.round(cx + half));
  const bottom = Math.min(H, Math.round(cy + half));
  if (right - left < 32 || bottom - top < 32) return refFor(path, width);
  const data = await img
    .extract({ left, top, width: right - left, height: bottom - top })
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
  return { data, mime: "image/jpeg" as const };
}

/**
 * A body reference WITH THE HEAD CUT OFF, from the chin down.
 *
 * Attaching a full-length photograph fixed the body panel — it carried across a real tattoo on
 * the forearm, which no metric here can see and which cannot arrive by chance — and it cost
 * about 0.08 of face similarity every time, across six rolls. The mechanism is not mysterious:
 * the photograph contains a second, smaller, softer face of the same person, and it competes
 * with the anchors for what she looks like.
 *
 * So it is removed. What remains is exactly what this reference is for — shoulders, arms,
 * torso, legs, stance, and any marks on the skin — with nothing left in the frame for the model
 * to read as a face. Cut a little below the chin so the neck and its width survive.
 */
export async function bodyRefFor(path: string, bbox: number[], width = REF_PX) {
  const img = sharp(path).rotate();
  const meta = await img.metadata();
  const W = meta.autoOrient?.width ?? meta.width ?? 0;
  const H = meta.autoOrient?.height ?? meta.height ?? 0;
  const chin = Math.round(bbox[3] + (bbox[3] - bbox[1]) * 0.12);
  const top = Math.min(Math.max(chin, 0), H - 32);
  if (H - top < 64) return refFor(path, width);
  const data = await img
    .extract({ left: 0, top, width: W, height: H - top })
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
  return { data, mime: "image/jpeg" as const };
}

/** Grid of thumbnails for the human QA pass. */
export async function contactSheet(
  items: { path: string; label: string }[],
  out: string,
  cols = 4,
  cell = 320,
) {
  if (!items.length) return;
  const rows = Math.ceil(items.length / cols);
  const pad = 28;
  const tiles = await Promise.all(
    items.map(async (it, i) => ({
      input: await sharp(it.path).resize(cell, cell, { fit: "contain", background: "#111" }).png().toBuffer(),
      left: (i % cols) * cell,
      top: Math.floor(i / cols) * (cell + pad) + pad,
    })),
  );
  const labels = items.map((it, i) => ({
    input: Buffer.from(
      `<svg width="${cell}" height="${pad}"><text x="6" y="19" font-family="monospace" font-size="14" fill="#fff">${it.label}</text></svg>`,
    ),
    left: (i % cols) * cell,
    top: Math.floor(i / cols) * (cell + pad),
  }));
  await sharp({
    create: { width: cols * cell, height: rows * (cell + pad), channels: 3, background: "#111" },
  })
    .composite([...tiles, ...labels])
    .png()
    .toFile(out);
}
