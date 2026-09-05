// Figma layout auditor + fixer + validator.
//
// Paste as the `code` of a `use_figma` call, one page per call (set PAGE below).
// Written 2026-08-23 after a swap pass shipped four visible defects that no number caught:
// a ghost numeral at full strength covering the whole card back, a club name running into
// the label beside it, a name lockup wrapping into three stacked fragments, and a back
// photo still showing the previous athlete's squad number.
//
// THE THREE RULES THIS FILE EXISTS TO ENFORCE
//
// 1. MEASURE THE INK, NOT THE BOX. A text node's box includes line height, so the card
//    back's name and meta line "overlapped" by 54% while the glyphs never touched. Sixteen
//    false alarms on one page. `absoluteRenderBounds` is the rendered ink; use it.
//
// 2. NEVER MAKE IT WORSE THAN YOU FOUND IT. The first version shrank a text one point at a
//    time "until the overlap clears". Inside an auto-layout the neighbour moves with it, so
//    the ratio never clears — it drove nine Prism Rush headlines from 48 pt down to 7.7 pt
//    and reported them as "unresolved". A fixer needs a floor (MIN_SCALE) and it must PUT
//    BACK the original size when it fails, then report. Reporting a defect is a result;
//    silently mangling the artboard is not.
//
// 3. THE NAME IS NEVER SHORTENED. Customer decision: when a club or athlete name does not
//    fit, the TYPE gives way, one point at a time, never the name. So the field that yields
//    is the variable-bound one, never the fixed label beside it.
//
// Ghost/echo/shadow layers are excluded as overlap partners on purpose: sitting behind the
// text at low opacity is their whole job.

const PAGE = 'Stadium Night';      // <- set per call; one setCurrentPageAsync per invocation
const FIX = true;                  // false = report only
const MIN_SCALE = 0.85;            // never shrink below this share of the original size
const OVERLAP = 0.04;              // share of the smaller ink area that counts as a collision
const MIN_SIDE = 0.25;             // ...and it must be substantial in BOTH directions

const page = figma.root.children.find(p => p.name === PAGE);
await figma.setCurrentPageAsync(page);

const GHOSTY = /ghost|_echo_|_block_shadow|watermark|wm_/i;
// absoluteRenderBounds is the rendered ink — INCLUDING effects. Prism Rush type carries a
// neon drop shadow, which inflated a 90pt line to 131px of "ink" and made MARCUS and ELLISON
// look like they collided when it is only their glow that meets. Deflate by the effect reach
// so the comparison is glyph against glyph.
const reach = (n) => {
  let r = 0;
  for (const e of (n.effects || [])) {
    if (e.visible === false) continue;
    const off = e.offset ? Math.max(Math.abs(e.offset.x), Math.abs(e.offset.y)) : 0;
    r = Math.max(r, (e.radius || 0) + off + (e.spread || 0));
  }
  return r;
};
const ink = (n) => {
  const b = n.absoluteRenderBounds || n.absoluteBoundingBox;
  if (!b) return b;
  const p = reach(n);
  if (!p) return b;
  const w = Math.max(1, b.width - 2 * p), h = Math.max(1, b.height - 2 * p);
  return { x: b.x + p, y: b.y + p, width: w, height: h };
};
const isBound = (t) => !!(t.boundVariables && t.boundVariables.characters);
const solid = (t) => {
  const f = Array.isArray(t.fills) && t.fills[0] ? t.fills[0] : null;
  const fo = f ? (f.opacity === undefined ? 1 : f.opacity) : 0;
  return t.visible !== false && t.opacity > 0.5 && fo >= 0.5 && !GHOSTY.test(t.name);
};

const boards = [];
for (const sec of page.children) if (sec.type === 'SECTION') for (const b of sec.children) boards.push(b);

const fixed = [], reported = [], escapes = [];

for (const b of boards) {
  const bb = b.absoluteBoundingBox;
  const texts = b.query('TEXT').toArray().filter(solid);

  for (const t of texts) {
    const r = ink(t); if (!r || !bb) continue;
    const over = Math.max(bb.x - r.x, bb.y - r.y,
                          (r.x + r.width) - (bb.x + bb.width), (r.y + r.height) - (bb.y + bb.height));
    if (over > 2) escapes.push({ board: b.name, name: t.name, id: t.id, by: Math.round(over) });
  }

  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const A = texts[i], B = texts[j];
    const measure = () => {
      const a = ink(A), c = ink(B); if (!a || !c) return 0;
      const ox = Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x);
      const oy = Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y);
      if (ox <= 1 || oy <= 1) return 0;
      // A tight lockup is not a collision. Orbitron at 100% line height puts the name's ink
      // a few pixels into the meta line's box below it — area alone called that a 20% overlap
      // on nine Prism Rush artboards that are, when you look at them, perfectly clean. A real
      // collision is significant in BOTH directions: text sitting ON text, or a club name
      // running INTO the label beside it.
      if (ox / Math.min(a.width, c.width) < MIN_SIDE) return 0;
      if (oy / Math.min(a.height, c.height) < MIN_SIDE) return 0;
      return (ox * oy) / Math.min(a.width * a.height, c.width * c.height);
    };
    const start = measure();
    if (start <= OVERLAP) continue;

    const victim = isBound(A) && !isBound(B) ? A
                 : isBound(B) && !isBound(A) ? B
                 : ((A.characters || '').length >= (B.characters || '').length ? A : B);
    const other = victim === A ? B : A;

    if (!FIX || typeof victim.fontSize !== 'number') {
      reported.push({ board: b.name, a: A.name, b: B.name, pct: Math.round(start * 100), fixed: false });
      continue;
    }
    for (const s of victim.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(s.fontName);
    const fs0 = victim.fontSize, floor = fs0 * MIN_SCALE;
    let fs = fs0, guard = 0;
    while (measure() > OVERLAP && fs - 1 >= floor && guard++ < 40) { fs -= 1; victim.fontSize = fs; }
    if (measure() > OVERLAP) {
      victim.fontSize = fs0;                       // rule 2: put it back, then say so
      reported.push({ board: b.name, a: A.name, b: B.name, pct: Math.round(start * 100),
                      fixed: false, note: `cannot clear above ${Math.round(floor)}pt — needs a human` });
    } else {
      fixed.push({ board: b.name, node: victim.name, id: victim.id,
                   from: Math.round(fs0 * 10) / 10, to: fs, against: other.name });
    }
  }
}
return { page: PAGE, boards: boards.length, escapes, fixed, reported };
