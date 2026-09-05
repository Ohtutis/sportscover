// Mechanical audit for an Etsy listing page. Paste as the `code` of use_figma.
//
//   Run it BEFORE showing a listing to anyone. The customer should never be the
//   thing that catches a stale export or a leftover athlete — that is what this is for.
//   Written 2026-08-28 after four rounds of exactly that.
//
// Set PAGE_ID to the listing page. Reports, per slide: forbidden words, a counter that
// disagrees with the slide's position, text running off the artboard, and empty image slots.
const PAGE_ID = "2:3";

const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const ascii = (s) => s.replace(/[^\x20-\x7E]/g, "?").slice(0, 40);

// Anything here means the page is telling the buyer something that is not true of it.
const BAD = [
  [/marcus|ellison|cedar ridge|bears\b/i, "wrong athlete"],
  [/\bBKB\b/i, "wrong card id"],
  [/prism rush|stadium night|fire & smoke|signature spotlight|chrome all-?star/i, "other finish"],
  [/\bLEAR FACE\b|PROCEES|CUSTOMISED|STLYE/i, "known typo"],
  [/six (art )?finishes|six classic/i, "promises six styles"],
  [/0\.\d{3}|similarity|MEASURED, NOT CLAIMED/i, "AI benchmark language"],
  [/FAST DELIVERY/i, "conflicting delivery claim"],
];

// A node inside a clipping parent is not "off the artboard" — it is cropped on purpose.
const clippedAncestor = (n, root) => {
  let p = n.parent;
  while (p && p.id !== root.id) { if (p.clipsContent) return true; p = p.parent; }
  return false;
};

// Slides may sit directly on the page or inside a section — looking only at page.children
// silently reports "0 slides, 0 issues", which reads exactly like a clean run.
const slides = page
  .findAll((c) => c.type === "FRAME" && Math.abs(c.width - 2000) < 2 && Math.abs(c.height - 2000) < 2 &&
    (c.parent.type === "PAGE" || c.parent.type === "SECTION"))
  .sort((a, b) => a.x - b.x);

const issues = [];
slides.forEach((s, i) => {
  const idx = i + 1;
  let seen = null;
  for (const n of s.findAll(() => true)) {
    if (n.type === "TEXT") {
      for (const [re, why] of BAD) if (re.test(n.characters)) issues.push([idx, why, ascii(n.characters)]);
      const m = n.characters.match(/^\s*(\d{1,2})\s*\/\s*20\s*$/);
      if (m) seen = parseInt(m[1], 10);
      if (n.visible && !clippedAncestor(n, s) && !s.clipsContent) {
        const b = n.absoluteBoundingBox, sb = s.absoluteBoundingBox;
        if (b && sb && (b.x < sb.x - 2 || b.x + b.width > sb.x + sb.width + 2))
          issues.push([idx, "text runs off the edge", ascii(n.characters)]);
      }
    }
    if (n.visible && "fills" in n && Array.isArray(n.fills) && n.fills.length === 0 &&
        /^(#photo|#background|#card_bg|col_|sr_|set_|series_)/.test(n.name))
      issues.push([idx, "image slot empty", ascii(n.name)]);
  }

  // Two visible texts whose INK overlaps is the defect a reader sees first, and a
  // bounds-against-the-artboard check never finds it. It shows up whenever a headline is
  // rewritten longer than the one it replaced and the supporting line stays where it was.
  const texts = s.children.filter((c) => c.type === "TEXT" && c.visible &&
    c.characters.trim().length > 1 && c.absoluteRenderBounds);
  for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) {
    const A = texts[a].absoluteRenderBounds, B = texts[b].absoluteRenderBounds;
    const ox = Math.min(A.x + A.width, B.x + B.width) - Math.max(A.x, B.x);
    const oy = Math.min(A.y + A.height, B.y + B.height) - Math.max(A.y, B.y);
    if (ox > 8 && oy > 8) issues.push([idx, "text overlaps text", ascii(texts[a].characters)]);
  }
  if (seen === null) issues.push([idx, "no counter", s.name.slice(0, 22)]);
  else if (seen !== idx) issues.push([idx, "counter says " + seen, s.name.slice(0, 22)]);
});

return { slides: slides.length, issues: issues.length, list: issues.slice(0, 24) };
