import sharp from "sharp";

/** Downscale a reference so the request stays small; the model only needs the look. */
export async function refFor(path: string, width = 1024) {
  const data = await sharp(path).resize({ width, withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer();
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
