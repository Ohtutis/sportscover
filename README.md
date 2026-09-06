# Game Day Edition — website

Custom sports posters and collectible trading cards built from the photos you already have —
one registered edition per athlete. This repo holds the marketing site (Next.js 16), the card
registry (`lib/registry/cards.ts` → `/c/<cardId>`), the price catalog (`lib/catalog/`) and the
print/art pipeline. **Read `CLAUDE.md` first**, then `docs/SITE-BUILD-SPEC-2026-09.md` for the
website direction and `docs/SITE-F0-HANDOFF.md` for what shipped in F0 and the owner checklist.

## Local development

```bash
cp .env.example .env.local   # code defaults are already Game Day Edition; env only overrides
npm install
npm run dev
```

## Quality checks

```bash
npm run check   # lint + typecheck + vitest (price parity, forbidden strings, printed IDs resolve)
npm run build
```

The site currently sells through the Etsy shop (every "Order on Etsy" link goes through
`/go/etsy/<sku>`); direct checkout arrives with F2 of the build spec.
