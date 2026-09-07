# F1 — integrator decisions on the 36 critic gaps (2026-09-07)

These decisions OVERRIDE `COPY.md`, `CONTRACTS.md`, `ASSETS-*.md` and the `design/DIRECTION-*.md` briefs wherever
they conflict. `DESIGN.md` (synthesis of Direction A + grafts) governs layout and component recipes; read it after
`CONTRACTS.md`. Builders: when a document says one thing and this file says another, this file wins.

## Wave plan (overrides CONTRACTS §0.1)
- **Wave 0 runs as TWO parallel builders** with disjoint files:
  - `wave0-shell`: `app/globals.css` (§1.1 verbatim), `lib/fonts/site.ts`, `lib/fonts/finishes.ts`, `lib/og.ts`,
    `app/layout.tsx`, route-group moves (`app/(marketing)/**`, `app/(registry)/**` + their `layout.tsx`),
    `components/brand/{Shield,Wordmark}.tsx`, `components/BrandMark.tsx`, `components/icons.tsx`,
    `components/{SiteHeader,MobileMenu,SiteFooter,Breadcrumbs,SectionHeading,NotFoundBody}.tsx`, `app/error.tsx`,
    `app/not-found.tsx`, `public/favicon.svg`, `public/icon.svg`, `app/manifest.ts`, `lib/nav.ts`, `lib/cta.ts`,
    `lib/site.ts` additions, `next.config.ts` (`distDir` only), `eslint.config.mjs`, `.gitignore`, `package.json`
    scripts, the deletions in CONTRACTS §5.1 (D row), `tests/design-system.test.ts` (shell half), `docs/f1/INTEGRATION-NOTES.md`.
  - `wave0-libs`: every other §3 component (`Pill DeliveryChips TrustLine TierCard FamilyCard EditionPanel StatChip
    Plate BracketFrame CapacityNote FourFears GateRow FounderNote ConsentRow CardFlip CopyIdButton ShareRow FaqList
    CtaPair EtsyButton OrderByCalculator LookupForm ProofRejectedPair CardFace Mat QrRing Ledger StatusChip BeforeAfter
    TrueNumbers ToScaleSheet PhotoChecklist`), `components/FictionalLabel.tsx` restyle, `lib/seo/{jsonld,titles,meta}.ts`,
    `lib/capacity.ts`, `lib/catalog/{seasons,shipping,trust,faq,photo-checklist}.ts`, `lib/copy/canon.ts`,
    `lib/color.ts`, `lib/alt.ts`, `lib/reviews.ts`, the additions to `lib/catalog/{prices,tiers,sports,styles,delivery}.ts`
    and the type/helper additions to `lib/registry/cards.ts`, `tests/{prices,forbidden-strings,registry}.test.ts`
    updates and `tests/components.test.ts`.
- **`lib/assets.ts` is owned by `seo-assets`** (not design-system): it creates the file FIRST (every §5.9 key with
  `status: "locate"`), then converts and flips statuses to `verified` itself. **`lib/registry/art.ts` and
  `lib/registry/art-sources.ts` are owned by `card-assets`** (the registry-card builder's asset half, which runs in
  parallel with Wave 0); it creates `art.ts` FIRST with the `ART_PENDING` list so Wave 0 typechecks.
- Wave 1 = `home` · `families` · `senior-night` · `trust-pages` · `registry-card` (page half) · `legal` · `seo-config`
  (sitemap/robots/next.config/intents/tests — the config half of CONTRACTS §5.8).

## Decisions (numbered as in the critic list)
1. **Hero "after" composites are CODE, not images.** Home and `/complete-set` heroes lay out `CardFace` front + back +
   the poster with the DESIGN §4.16 device. Keys `home.hero.after.front|back|poster` and `set.hero.front|back|poster`
   come from square sources: `etsy/listing-images/01-basketball-card/src/BK-SN-card-FRONT.png`, `…BACK.png` (QR-patched,
   see 4) and `etsy/listing-images/04-complete-set/src/marcus-sn-poster.png`. No certificate, no pack, ever.
2. **Rejected pair = DESIGN checklist #14**: ice-hockey `art-pipeline/out/athletes/ice-hockey/_versions/action2-1.png`
   (rejected) vs `action2.png` (approved), reason = the kit change (`art-pipeline/README.md` ~line 656). `seo-assets`
   locates, thumbnails, converts (`home.rejected.fail|pass`); captions describe those frames. If the frames cannot be
   found, the keys stay `locate` and the section renders text only — never the staged football pair.
3. **`marketing/cards/*-front.png` are ROUNDED-corner exports.** Sport tiles use listing `src/` square-cut fronts where
   they exist; the remaining sports use the marketing front with a `crop: "inset-5"` (5 % inset, recorded in
   `lib/assets.ts`, corner audit skipped for `crop` assets) at ≤ 240 px display size. Ticket **F1-ART-03** (owner /
   Figma): square-cut fronts for all 17 sports. Never `scale-[…]`/CSS masks in components.
4. **QR-patched derivatives (DESIGN §6.4).** Every back that is shown with a QR ring or in a flip is re-encoded with the
   correct `public/cards/qr/<id>.png` pasted over the printed QR (located with `jsqr`, installed) and a decode test
   asserts the ID. Demo stays `GDE-SN-BKB-2026-12` (Marcus).
5. **Posters DO include the certificate** (the live Etsy poster listings promise "every shipped package includes a
   printed Certificate of Authenticity"; the site never contradicts Etsy). `tierNotes` for `GDE-ANY-POST-P1824|P2436`
   gain "Free printed Certificate of Authenticity"; delete the COPY §2.3(1) "no certificate with a poster" line.
   Owner checklist: confirm the poster partner actually ships it.
6. **Asset pipeline canon = CONTRACTS §4.10–4.12** (`scripts/card-assets.ts`, `scripts/site-assets.ts`,
   `scripts/denylist.json` sha256). MP4s re-encoded to 720p ≤ 1 MB, `preload="none"`; **no GIFs**.
7. **Senior Night hero is composed in code** from `etsy/listing-images/03-senior-night/src/` layers (`sr-poster.png` or
   `bsb-sr-poster.png`, `sr-card-front|back.png` or `bsb-sr-front|back.png`, `bsb-sr-badge.png`); pills in HTML; alt
   "basketball · Senior Night". Never the whole `01-hero.png` slide (baked "NUMBERED"). Provenance rule for
   `seo-assets`: no whole listing slide with baked pills/prices/headlines on any page.
8. **`ART_PENDING` = seven IDs** (integrator added `GDE-HE-FTB-2026-54` and `GDE-SS-CHR-2026-01` under ticket **F1-ART-05** — square-cut BACK exports missing): `GDE-CA-SFB-2026-03`, `GDE-SN-SFB-2026-03`, `GDE-FS-WRS-2026-01`, `GDE-HE-WRS-2026-01`
   (ticket F1-ART-01), `GDE-SN-BKB-2026-23` (F1-ART-02). Pending block copy on `/c`: "This edition's card art is being
   prepared. The registry record below is complete — the card face appears here as soon as the export lands."
9. **Real customers' own unlisted pages MAY show their card** from `public/cards/<id>/` generated with
   `--allow-orders` (sources `card-flip/assets/order03-sn/`, `orders/**`); never referenced anywhere else, never under
   `public/images/**`. Owner confirms both customers before Wave 2 signs off.
10. **`FILE_COUNTS = { set: 27, snset: 28 }`** in `lib/catalog/tiers.ts`; rendered through the constant, never typed.
    The complete-set "everything counted" section is a `Ledger` (text), not a slide.
11. Registry copy: numberless sports and adults get "an edition number such as 01" — no "E07". `makeCardId` comment
    and `card:new` follow the printed convention (-01, -02 …).
12. **No sealed pack imagery anywhere in F1** (D18); pack tier stays `enabled: false`.
13. **`CapacityNote` is built but never mounted in F1** (D5). One delivery claim per page = the chips.
14. Legal pages use the new shell: `SectionHeading as="h1"` + a version line in `font-label`. No eyebrows anywhere (D12).
15. Finish names on marketing pages: Space Grotesk 700 uppercase text (no SVG labels in F1, no finish fonts outside `/c`).
16. `lib/catalog/sports.ts` gains `hasPosterArt` (baseball, basketball, cheerleading, football, soccer, softball,
    volleyball, wrestling) and `postersSports()`.
17. Senior-night tiles: basketball ← `03-senior-night/src/sr-card-front.png` (fallback `bsb-sr-front.png`); ice hockey =
    navy text tile → `/go/etsy/GDE-ANY-SNSET`; the H2 stays as COPY has it (nine sports).
18. `ctaFor("card-page", card)`: `styleCode === "SR"` → `GDE-<CODE>-SNSET`; sport has `cardListingId` → `GDE-<CODE>-CARD`;
    else `GDE-ANY-SET`. Test over every `demo-etsy` record.
19. FourFears card 2 and `/about` are `imprintComplete()`-gated: without imprint → "An independent studio in Lithuania,
    printed by professional labs in the US. Contact and studio details are on the About page." No "legal entity",
    no "Registered in Lithuania" until the imprint env vars exist.
20. Wallpaper FAQ: Etsy deliverable wording only — no safe-zone promise for any finish in F1.
21. `scripts/card-new.ts` (`npm run card:new -- --sport --style --season --first --last --team --position [--number]
    [--stats] [--visibility] [--channel] [--front --back --mp4]`) → `makeCardId`, append record, `qr:gen`,
    `cards:assets --id`. Owned by `card-assets`.
22. **`docs/f1/DESIGN.md` governs layout.** Direction findings the manifests disprove are void (e.g. `bsb-sr-cert.png`
    is count-neutral — but see 32).
23. `chipSegment("digital"|"prints"|"pack")` in `lib/catalog/delivery.ts`; `TierCard` chips only from it.
24. `PageMeta.absolute?: boolean`; `/` title = "Game Day Edition — Custom Sports Trading Cards & Posters" (absolute),
    `/about` = "About the Studio" (templated). Test: ≤ 60 chars after templating.
25. F1 exception recorded: primary `CtaPair` may target `/go/etsy/<sku>` while `SITE_SELLS_DIRECT === false`
    (`lib/site.ts`); test asserts the flip when it is `true`.
26. `Intent = { keyword, path, phase }` (CONTRACTS); `seo-config` maps COPY §4; `NEVER_TARGET` gains "youth" and the
    sport×finish rule.
27. Lookup: `POST /registry/lookup` → 303 to `/c/<id>`; miss → 303 back to the referrer path with `?miss=1` (home →
    `/?miss=1#registry`, registry → `/registry?miss=1`); `LookupForm` reads `miss` from `searchParams` and shows the
    COPY miss string inline.
28. Every price / JSON-LD test passes a fixed `now`. Owner checklist: bump `SALE_EXPIRES_AT` before 2026-09-24.
29. Senior Night prices stay Etsy-only in F1 (no snset tiers); `seniorNightPlan().bestTier` is a plain label; the
    sealed-pack row renders only when `getTier("GDE-ANY-CARD-PACK")?.enabled`.
30. FictionalLabel test counts labelled GROUPS (a figure/row with one label), not images.
31. Drop "reprinted at cost". `DELIVERED_COUNT = 0` in `lib/site.ts` (0 → sentence omitted). Privacy: Stripe /
    Supabase / R2 listed "from the day direct ordering opens on this site".
32. The SR certificate image is NOT shown in F1 (text only; badge/sticker allowed) — it prints "numbered" and
    "AUTHENTICATED". Owner decides the Figma wording later.
33. CSP, IndexNow, covermoment.co redirect, DNS CAA/DMARC → owner checklist (not F1).
34. `photo-guide.webp` is a 2×3 grid (three pass, three fail). `tile-printed.jpg` is NOT used (DESIGN checklist #8).
35. `PhotoChecklist { items; printable? }` component + `lib/catalog/photo-checklist.ts` (Wave 0 libs).
36. `registeredAtOf(c) = c.registeredAt ?? c.createdAt`; `updatedAtOf(c) = c.updatedAt ?? registeredAtOf(c)`; test that
    every record resolves.
