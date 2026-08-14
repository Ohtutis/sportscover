# Cover Moment

A production-ready youth sports keepsake storefront built from the supplied brief. It leads with the Signature Collector Pack: an approved custom athlete identity, a professionally printed poster, 25 personalized trading cards, and matching digital artwork.

## Local development

Requirements: Node.js 22.13 or newer.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The public marketing experience works without credentials. A complete photo submission requires the Supabase values and `SUBMISSION_SIGNING_SECRET` in `.env.local`.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/202608120001_cover_moment.sql` in the SQL editor.
3. Copy the project URL, anon key, and service-role key into the matching environment variables.
4. Never expose or commit the service-role key.

The migration creates two RLS-protected tables and a private `athlete-submissions` bucket. The browser never receives the service-role key; server routes issue short-lived signed upload URLs.

## Production environment

Add every required value from `.env.example` to Vercel. `NEXT_PUBLIC_SITE_URL` must be the final production origin. Generate a long random value for `SUBMISSION_SIGNING_SECRET`.

Resend is optional while developing. Without it, a submission is still stored and the success screen explicitly warns that automatic email is delayed. Cloudflare Turnstile is optional locally but required in production, where submissions fail closed if its secret is missing. Configure both Turnstile keys before testing the deployed form.

## Customer workflow

1. Customer submits athlete details and 3–5 photos.
2. Owner reviews photo quality and confirms the package.
3. Owner sends a Stripe Payment Link configured to collect shipping for physical orders.
4. Customer receives a watermarked proof and the included revision.
5. Only the approved artwork goes to print.
6. Digital files are emailed; poster and trading cards may ship separately with tracking.

## Initial physical fulfillment

UPrinting is the candidate supplier, subject to current template and sample testing:

- Signature poster: 18×24 inches, semi-gloss photo paper, front only, CMYK, 300 DPI where possible.
- All-Star poster: 24×36 inches, semi-gloss photo paper, front only.
- Cards: 2.5×3.5 inches, 25 count, full-color both sides, 16 pt stock, rounded corners, CMYK, 300 DPI, printer-template bleed.
- Order one poster sample plus gloss and matte card samples before launch.
- Use blind shipping where available; do not promise one combined package.

## Quality checks

```bash
npm run lint
npm run build
```
