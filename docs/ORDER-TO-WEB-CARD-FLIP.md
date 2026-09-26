# Order → web: putting a customer's card flip on `/c/<cardId>`

For the order-build agent. Written 2026-09-26 after order #4180204338 shipped with a QR that
opened a 404 for three days. Read all of it once; the checklist at the end is what you run.

## What the web page is

`https://www.gamedayedition.com/c/<cardId>` is the "digital twin" every QR on the card back, the
foil-pack wrapper and the certificate points at (the QR encodes the apex URL
`https://gamedayedition.com/c/<cardId>`, which 308-redirects to `www`). The site is **static**:
the page exists only if the card is in `lib/registry/cards.ts` **in the deployed `main` branch**,
and it shows art only if `public/cards/<cardId>/front.webp` and `back.webp` are committed there
too. Nothing under `orders/**` ever reaches the server — it is gitignored on purpose (customer
photos never enter the repo).

So "the card is made" and "the card is on the web" are two different states. The second one needs
the four files below, a commit, a merged PR and ~90 s of Vercel deploy.

## The four things the page needs

| # | File | Made by | Notes |
|---|---|---|---|
| 1 | record in `lib/registry/cards.ts` | `npm run card:new` (or by hand above `// card:new inserts above`) | `visibility: "unlisted"`, `channel: "etsy"` for a real customer; `ageBand: "minor"` for a youth athlete — `"adult"` silently drops the `#number` on the page |
| 2 | `public/cards/qr/<cardId>.png` | `npm run qr:gen` | the registry QR that gets stamped over the printed one on the back |
| 3 | entry in `lib/registry/art-sources.ts` | `card:new --front --back` (or by hand above `// card:new sources insert above`) | `sourceKind: "order"`, paths under `orders/<orderId>/…` |
| 4 | `public/cards/<cardId>/{front,back}.webp` + `manifest.json` | `npm run cards:assets -- --id <cardId> --allow-orders` | built from #3; the only thing from the order that is committed |

Optional: `public/cards/<cardId>/flip.mp4` — see "Flip video" below. Without it the page uses the
CSS flip (front/back), which is fine.

## What the source files must be

- **Front and back PNGs**, square-cut at all four corners. Accepted sizes: the print file
  **816×1110 with bleed** (the converter trims it to 744×1038), or a **1500×2100** 2× export, or a
  750×1050 1× export (never upscaled; the page then serves 750×1050). Prefer the print files — they
  are what the customer is holding.
- **The back must carry the printed QR** (the converter locates it with jsqr, pastes the registry
  QR over exactly that symbol, re-decodes and asserts it equals the card's URL). A back without a
  QR fails the build.
- Never a pre-square-corner export, never anything from `card-flip/assets/{ca,fs,he,pr,ss}`,
  `print-sources/output/`, `exports/`, `marketing/cards/` or `public/images/` — those prefixes are
  refused by the converter, and 107 known-bad files are refused by hash.

## Flip video (optional, the only way to get motion on the page)

The converter accepts `--mp4 <file>` (or `mp4:` in the sources entry) and checks it:

- first frame on a **dark ground** — every channel ≤ 48; render with the arena ground
  `FLIP_BG=8,12,18,255` (`card-flip/render.sh`). The social/listing flips on a light or slate
  ground are rejected. Avery's `digital/…-CardFlip-1080x1350.mp4` is the light one — not usable.
- rendered from the **square-cut** faces (corner audit on the first frame);
- output becomes 720 px wide H.264, ≤ 1 MB, faststart; the poster is the front face.

If you do not have a dark render, skip it — do not force one through.

## The command sequence (real customer)

```bash
# 0. Hygiene — this repo lives in iCloud; evicted files hang every step.
find .git node_modules -type f -flags +dataless | wc -l      # must be 0; if not:
find .git node_modules -type f -flags +dataless -print0 | xargs -0 -P 24 -n 40 cat >/dev/null
git status                                                    # must show "On branch main" with commits — never "No commits yet"
git checkout main && git pull --ff-only origin main

# 1. Registry record + sources (one command; --dry first)
npm run card:new -- --sport football --style "Fire & Smoke" --season 2026 \
  --first Avery --last "O'Neal" --team "Grove City Dawgs" --position "Wide Receiver" --number 80 \
  --highlight "September Player of the Week" --visibility unlisted --channel etsy \
  --front orders/<orderId>/print/<id>-CARD-FRONT-816x1110.png \
  --back  orders/<orderId>/print/<id>-CARD-BACK-816x1110.png --allow-orders
# (no --adult for a youth athlete; numberless sports and adults get an edition number instead of --number)

# 2. QR + faces
npm run qr:gen
npm run cards:assets -- --id <cardId> --allow-orders
#   expect: "OK <cardId> front 744×1042 … qr re-stamped … flip none" and "failures 0"

# 3. Gate + ship (commit ONLY these paths — never orders/**)
npx vitest run tests/registry-card.test.ts tests/registry.test.ts
git checkout -b order/<orderId>
git add lib/registry/cards.ts lib/registry/art-sources.ts public/cards/qr/<cardId>.png public/cards/<cardId>
git commit -m "Registry: <First Last> (#<orderId>) on /c/<cardId>"
git push -u origin order/<orderId>
gh pr create --fill --base main && gh pr checks --watch && gh pr merge --merge
git checkout main && git pull --ff-only origin main

# 4. Prove it — THIS is what "done" means, before anything goes to print
curl -sL -o /dev/null -w "%{http_code}\n" https://www.gamedayedition.com/c/<cardId>          # 200 (the -L matters: apex 308s to www)
curl -sL -o /dev/null -w "%{http_code}\n" https://www.gamedayedition.com/cards/<cardId>/front.webp   # 200
curl -sL https://www.gamedayedition.com/c/<cardId> | grep -c "ARTWORK PENDING"                # 0
```

Allow ~90 s after the merge for the deploy before the curls go green.

## Standing rules

1. **Decoding the QR proves the id is right; a 200 proves the page exists. Both, every time,
   before the final export goes to the buyer or to print.** A 404 under "SCAN TO OPEN THE
   DIGITAL TWIN" reads as a fake card.
2. Never commit `orders/**`, never copy anything from an order into `public/images/`. The
   converter is the only bridge and it redacts the source path in the manifest.
3. Only what is printed on the card goes into the record (name, number, position, team, season,
   highlight, stats). Real customers are `unlisted` (page opens from the QR/ID only, `noindex`).
4. If the checkout is "unborn" or has `*.lock` files under `.git/refs`, stop and report — do not
   `git init`, do not `push --force`. The fix is documented in memory ("GDE iCloud evikcija").
5. A listing demo card that has a printed QR but no face export yet still goes live — add it to
   `ART_PENDING` in `lib/registry/art.ts` with a ticket, and a `pending:` sources entry; the page
   shows the pending block instead of a 404 (F1-ART-08 is the open batch of 18).

## Worked example that is live

Order #4180204338 → `GDE-FS-FTB-2026-80`, PRs #9 and #10 (2026-09-23/24): record + QR + sources
in #9, faces in #10. `public/cards/GDE-FS-FTB-2026-80/manifest.json` shows what a passing build
looks like (corner audit pass, QR located at 88 px and re-stamped, sources withheld).
