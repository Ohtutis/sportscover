# Site F0 — what shipped, what the owner still has to do (2026-09-06)

F0 = emergency truth pass on the live site + the plumbing that carries over to the new site
(`docs/SITE-BUILD-SPEC-2026-09.md` §11). Branch `site/f0`.

## Shipped in code
- Brand defaults are Game Day Edition in code (`lib/site.ts`); no Vercel env needed for the name,
  email, or `www` canonical. `NEXT_PUBLIC_*` still override.
- `lib/catalog/` — prices (Etsy ×1.10 rule, `SALE_EXPIRES_AT`), delivery chips, sports, styles,
  listing map, deliverables. Tests fail the build if any price < Etsy or a `$` literal is typed in JSX.
- Registry: `visibility` / `channel` / `isFictional`; real customers unlisted + noindex; PII minimised;
  Order 03 added; `makeCardId` uniqueness sequence; the 4 softball/wrestling QR PNGs committed.
- `/c/[cardId]` rebuilt: stats[], numberless sports without "#", "Registered · date", silver shield,
  fictional label, channel-aware CTA (Etsy only for demo-etsy), noindex on unlisted, private notice,
  branded 404.
- `/go/etsy/[sku]` + `/etsy` tracked redirects (Share & Save URL, UTM passthrough), sitemap, robots,
  security headers, Organization JSON-LD, verification meta tags (from env), Vercel Web Analytics +
  Speed Insights (cookieless), `/contact`, `/privacy/biometric`, legal pages without TEMPLATE labels,
  shared copy blocks (`content/blocks/`), forbidden-string + printed-ID + price-parity tests, CI.

## Owner checklist (nothing here blocks the deploy; items marked ⚠ block F2)
0. **Delete the Cover Moment-era Vercel env vars (5 min, do first)** — the project still has
   `NEXT_PUBLIC_BRAND_NAME=Cover Moment`, `NEXT_PUBLIC_OWNER_NAME=Cover Moment Studio`,
   `NEXT_PUBLIC_SITE_URL=https://sportscover.vercel.app` and probably `NEXT_PUBLIC_SUPPORT_EMAIL`
   and `RESEND_FROM_EMAIL=Cover Moment <…>`. The code ignores the first four since the
   2026-09-06 hotfix (brand/owner/origin are constants in `lib/site.ts`), but delete them anyway
   and set `RESEND_FROM_EMAIL=Game Day Edition <orders@gamedayedition.com>` so the legacy
   order-request emails never go out under the old name. Vercel → Project → Settings →
   Environment Variables.
1. **Sale renewal** — set `SALE_EXPIRES_AT` in `lib/catalog/prices.ts` when you renew the −30 % Etsy
   sale (currently 2026-09-24). The site auto-drops the struck-through price when it lapses.
2. **Imprint (⚠ before checkout)** — set on Vercel: `NEXT_PUBLIC_IMPRINT_LEGAL_NAME`,
   `NEXT_PUBLIC_IMPRINT_COMPANY_CODE`, `NEXT_PUBLIC_IMPRINT_VAT`, `NEXT_PUBLIC_IMPRINT_ADDRESS`.
   The footer imprint renders only when they are set.
3. **Verification tokens** — GSC (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`), Bing, Pinterest
   `p:domain_verify`, Meta domain verification → env, then verify each console. Submit
   `https://www.gamedayedition.com/sitemap.xml` in GSC and Bing.
4. **Social URLs** for the Organization schema — `NEXT_PUBLIC_INSTAGRAM_URL`, `_TIKTOK_URL`,
   `_YOUTUBE_URL`, `_PINTEREST_URL`, `_FACEBOOK_URL` (decide the canonical handle first).
5. **Founder photo** — download your Etsy profile photo and add it as `public/brand/founder.jpg`
   (square, ≥600 px). Until then the founder block renders without a photo.
6. **Resend sending domain (⚠ before order emails)** — add SPF/DKIM records Resend gives you for
   `mail.gamedayedition.com`, plus `_dmarc TXT "v=DMARC1; p=none; rua=mailto:hello@gamedayedition.com"`.
7. **hello@ mailbox** — Hostinger trial ends 2026-09-23; pick a permanent mailbox.
8. **Etsy edits (15 min, not under the title/tag freeze)** — remove the art-style dropdown on the 8
   Senior Night listings; football SKUs `FBALL` → `FTB`; hide the 30×40 XL variant; About: "rounded
   corners" → "square-cut corners" and "we will tell you before you pay" → "before any art is made";
   add the biometric consent line to the personalization instructions (below); publish the built
   softball + wrestling card/poster listings; Offsite Ads → OUT.
9. **Biometric consent line for Etsy personalization instructions** (paste verbatim):
   > By ordering you consent to Game Day Edition creating a facial-geometry measurement from the
   > photos you send, used only to check that the artwork looks like your athlete, never shared, and
   > destroyed when the order closes. Policy: gamedayedition.com/privacy/biometric
10. **QPMN** — email: is the sealed pack shipped DDP (duties prepaid) to the US, and what is the
    duty per pack? The Sealed Foil Pack tier stays hidden on the site until answered and the pack
    face/certificate art is count-neutral.
11. **UptimeRobot** (free) — monitor `https://www.gamedayedition.com/c/GDE-SN-BKB-2026-23` and `/`.
12. **Hosting** — stay on Vercel Hobby through F1; move to Vercel Pro the week Stripe checkout goes
    live (Hobby terms forbid commercial use). Supabase stays Free (DB only) with a keepalive cron;
    files go to Cloudflare R2 in F2.
13. **Lawyer (⚠ before checkout)** — scope in `docs/SITE-BUILD-SPEC-2026-09.md` §9.5 / master plan §9.5.

## Not in F0 on purpose
The consumer order form was removed (the site sells via Etsy until the F2 checkout exists); team
orders are a mailto until `/teams` ships; the sports grid uses the real card fronts (15 sports) —
pickleball and skateboarding tiles are text-only until their fronts are exported.
