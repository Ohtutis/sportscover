# Custom Youth Athlete Identity Website — Complete Codex Build Brief

> This document is a complete product, design, copy, image-generation, and technical specification for building the first version of a US-focused custom youth sports artwork website.
>
> Build this as a real, production-ready, single-page lead-generation website. Do not build a Shopify store, customer account system, live AI generator, or automated checkout in the MVP.

---

## 1. Project summary

Build a premium one-page website where parents, relatives, coaches, and athletes can submit real sports photos and request a custom-designed Youth Athlete Identity Pack.

The customer should be able to:

1. Understand the product within five seconds.
2. See cinematic examples across multiple sports and visual styles.
3. Choose a sport, style, and package preference.
4. Enter athlete personalization details.
5. Upload 3–5 photos.
6. Submit the request without paying.
7. Receive an automatic confirmation email.
8. Later receive a personal approval email and a secure Stripe Payment Link from the owner.

The owner manually checks the uploaded photos before accepting the order. This prevents customers from paying when their source photos are unusable and keeps the first version simple.

### Business model

This is an AI-assisted custom design service, not a self-service AI app and not a template marketplace.

The customer sees a fully custom product. Internally, production can use standardized sport layouts, prompt libraries, reusable effects, and editable design systems.

Core positioning:

> Real photos. Custom-designed into a professional sports identity.

Do not lead with “AI-generated.” AI is part of the production process, not the main value proposition. The value is likeness, personalization, emotion, professional art direction, and a memorable result.

---

## 2. Recommended MVP approach

### Product approach: concierge commerce

This website should use a concierge commerce flow:

```text
Landing page
→ Style and sport selection
→ Athlete details
→ Photo upload
→ Request submitted
→ Owner reviews photos
→ Owner emails approval and Stripe Payment Link
→ Customer pays
→ Artwork production begins
→ Watermarked proof sent by email
→ One revision
→ Final digital delivery
```

### Why this is the right first version

- No need to build a complex live AI generator.
- No need to guarantee that every uploaded photo is usable before review.
- No monthly Shopify subscription or paid personalization apps.
- No automatic refunds for bad source photos.
- The owner can learn what customers ask for before automating the process.
- Custom quotes and team orders remain possible.
- The same site can later become a full ecommerce flow without redesigning the brand.

### Relationship to the existing ViewEconomy approach

The existing ViewEconomy website uses a lightweight static React/Vite-style frontend deployed through Vercel, with a simple external form endpoint for text-based applications. Reuse the same strengths:

- One focused landing page.
- Fast static frontend.
- GitHub as the source repository.
- Automatic Vercel deployments.
- Clear CTA and a single conversion action.

This athlete website needs a stronger backend than ViewEconomy because visitors upload private photos, potentially including photos of minors. Do not send those files through an ordinary public contact form. Keep the frontend lightweight, but add private Supabase Storage, a submissions database, server-side validation, bot protection, and transactional email.

### Do not build in V1

- Customer accounts.
- A customer dashboard.
- Live AI generation in the browser.
- Automatic previews.
- Shopify.
- A shopping cart.
- Automated fulfillment.
- A large multi-page ecommerce catalog.
- Fake reviews, fake order counters, or fabricated testimonials.

---

## 3. Working brand system

The final brand name is not chosen yet. Keep it configurable from one file.

Use `[BRAND NAME]` in source content or create a single constant such as:

```ts
export const BRAND_NAME = "Cover Moment";
```

“Cover Moment” is only a working name and must be easy to replace globally.

### Primary tagline

> Give Their Game a Cover Moment.

### Supporting positioning

> Turn real game-day photos into a cinematic sports identity built around your athlete, their team, and their season.

### Brand personality

- Premium but not luxury-fashion pretentious.
- Emotional without becoming sentimental.
- Energetic without looking like a generic gaming website.
- Professional enough for parents and teams.
- Cool enough that a teenage athlete wants to share it.
- Clear, confident, and concise.

### Visual direction

- Dark cinematic base.
- Carbon-black backgrounds.
- Ice-white text.
- Electric-blue primary action color.
- Silver and restrained holographic accents.
- Portfolio cards can inherit the team color of the featured athlete.
- Fine sports-card borders, subtle stadium light glows, controlled smoke, grain, and depth.
- Avoid excessive glassmorphism, random gradients, neon overload, and generic AI-tech imagery.

### Suggested design tokens

```css
--color-bg: #07090D;
--color-surface: #0E1219;
--color-surface-2: #151B25;
--color-text: #F5F7FA;
--color-muted: #9AA5B5;
--color-border: rgba(255, 255, 255, 0.12);
--color-primary: #2979FF;
--color-primary-hover: #4B91FF;
--color-success: #57D18A;
--color-error: #FF6B6B;
--color-holographic: linear-gradient(135deg, #64E9FF, #9A7BFF, #FF70C6, #FFE56A);
```

### Typography

Use free, web-safe Google fonts:

- Display: `Barlow Condensed` 700/800 or `Oswald` 600/700.
- Body/UI: `Inter` 400/500/600/700.

Headlines should use short lines, tight tracking, and clear hierarchy. Body copy should remain calm and highly readable.

---

## 4. Target audience

### Primary audience

US parents of youth and high-school athletes, approximately ages 30–55.

They buy for:

- A birthday.
- Senior Night.
- Graduation.
- End of season.
- Team banquet.
- Christmas.
- Father’s Day or Mother’s Day.
- A bedroom or game-room poster.
- A shareable social media moment.
- A keepsake marking a meaningful season.

### Secondary audience

- Coaches ordering for a team.
- Team parents.
- Sports photographers.
- School booster clubs.
- Adult amateur athletes.
- Relatives buying gifts.

### Customer anxiety to solve

- “Will it actually look like my child?”
- “Are my photos good enough?”
- “Will the designer understand the team colors?”
- “Is this just a cheap AI filter?”
- “What happens if I do not like it?”
- “When will I receive it?”
- “How are photos of my child stored and used?”

The page must answer these questions before the final form submission.

---

## 5. Initial sports coverage

Display these as selectable cards in the request form and as a visual grid on the page.

### Launch sports

1. Basketball
2. American Football
3. Baseball
4. Softball
5. Soccer
6. Ice Hockey

### Additional sports

7. Volleyball
8. Lacrosse
9. Wrestling
10. Cheerleading
11. Gymnastics
12. Track & Field
13. Swimming
14. Tennis
15. Golf
16. Pickleball
17. Other Sport

Use “Football” for American football and “Soccer” for association football because the primary market is the United States.

---

## 6. Product styles

The customer chooses one preferred visual style. Show each style with a generated thumbnail and a concise explanation.

### 1. Stadium Night

Copy:

> Bright lights, deep shadows, cinematic smoke, and the feeling of a championship entrance.

### 2. Chrome All-Star

Copy:

> Premium metallic framing, holographic details, and a collectible-card finish.

### 3. Fire & Smoke

Copy:

> High-energy color, dramatic movement, and a bold game-day atmosphere.

### 4. Neon Future

Copy:

> Electric light, futuristic graphics, and a look made to stand out on social media.

### 5. Vintage Trading Card

Copy:

> Classic sports-card character with modern image quality and fully personalized details.

### 6. Senior Night

Copy:

> A polished season tribute built for graduation, Senior Night, and end-of-year celebrations.

### 7. Magazine Cover

Copy:

> A bold editorial composition that makes the athlete feel like the story of the season.

### 8. College Energy

Copy:

> Clean, powerful recruiting-style presentation without making promises about recruitment outcomes.

Do not use real league, professional-team, school, magazine, or sports-brand trademarks in generated examples.

---

## 7. Product packages and pricing copy

Pricing should be visible. The customer does not pay on the website during the first submission.

### Package 1 — The Poster

Price:

> From $49

Copy:

> One cinematic custom poster built from your athlete’s real photos.

Includes:

- One custom poster design.
- High-resolution JPG.
- Print-ready PDF.
- Phone wallpaper crop.
- One revision.
- Personal photo-quality review before payment.

CTA:

> Request The Poster

### Package 2 — Identity Pack

Badge:

> Most Popular

Price:

> From $89

Copy:

> A complete digital identity made for the wall, the phone, and the season recap.

Includes:

- Everything in The Poster.
- Custom trading card front.
- Custom trading card back with stats.
- Instagram post graphic.
- Instagram Story graphic.
- Phone wallpaper.
- One revision.

CTA:

> Request Identity Pack

### Package 3 — All-Star Pack

Price:

> From $139

Copy:

> The complete custom artwork set, finished with a short cinematic athlete video.

Includes:

- Everything in Identity Pack.
- 10–15 second vertical cinematic video.
- Animated name, number, and position.
- Reel-ready MP4.
- One revision to the static artwork.
- One minor text correction to the video.

CTA:

> Request All-Star Pack

### Team orders

Headline:

> Creating for the whole team?

Copy:

> Request a team quote for five or more athletes. We can build one shared visual direction and personalize every player.

CTA:

> Request a Team Quote

### Pricing note

Use this directly below the cards:

> No payment is required today. We review your photos first, confirm the right package by email, and send a secure payment link before design work begins.

Do not promise fixed turnaround for team orders. Individual orders can use “first proof typically delivered within 2 business days after payment.”

---

## 8. Landing page information architecture

Build a single long landing page with the following order.

### Navigation

Desktop links:

- Examples
- Styles
- How It Works
- Pricing
- FAQ

Primary navigation CTA:

> Create My Athlete

Mobile:

- Compact logo/wordmark.
- Menu button.
- Persistent bottom CTA after the visitor scrolls past the hero.

### Section order

1. Announcement bar
2. Header/navigation
3. Hero
4. Trust strip
5. Product-output showcase
6. Before/after transformation
7. Sports gallery
8. Style gallery
9. How it works
10. Why this is different
11. Packages and pricing
12. Photo guidelines
13. Team orders
14. Request form
15. FAQ
16. Final CTA
17. Footer

---

## 9. Complete landing-page copy

All public-facing copy should be in natural US English.

### Announcement bar

> Now accepting a limited number of custom athlete projects each week.

### Header

Logo text:

> [BRAND NAME]

Button:

> Create My Athlete

### Hero eyebrow

> CUSTOM YOUTH SPORTS ARTWORK

### Hero headline

> Give Their Game a Cover Moment.

### Hero supporting copy

> Upload real game-day photos. We turn them into a cinematic sports identity custom-designed around your athlete, their team, and their season.

### Hero primary CTA

> Create My Athlete

### Hero secondary CTA

> See Example Transformations

### Hero microcopy

> No payment today · Photo review within 24 hours · One revision included

### Hero visual label

> Example artwork · Fictional athlete

Never imply that generated fictional examples are real customers.

---

### Trust strip

Use four compact points:

1. Built from real photos
2. Personally reviewed
3. Custom team colors
4. Final files ready to share and print

Do not add star ratings or customer counts until real data exists.

---

### Product-output showcase

Eyebrow:

> ONE ATHLETE. A COMPLETE IDENTITY.

Headline:

> More Than a Poster.

Copy:

> Your athlete’s story can live across a wall print, collectible card, phone wallpaper, social graphic, and cinematic Reel—all designed as one connected visual system.

Output labels:

- Hero Poster
- Trading Card
- Phone Wallpaper
- Social Graphics
- Cinematic Reel

Small note:

> Deliverables depend on the selected package.

---

### Before/after section

Eyebrow:

> THE TRANSFORMATION

Headline:

> Your Photo. Their Moment.

Copy:

> We begin with the athlete’s real face, uniform, and game-day details—then build the lighting, atmosphere, composition, and identity around them.

Left label:

> Your original photo

Right label:

> Custom final artwork

Trust statement:

> This is not a one-click filter. Every accepted project is reviewed and finished by hand with an AI-assisted creative workflow.

---

### Sports section

Eyebrow:

> BUILT FOR THEIR SPORT

Headline:

> Every Sport Has Its Own Energy.

Copy:

> Select the game they love. We adapt the composition, motion, equipment, textures, and atmosphere to feel native to that sport.

Initial visible sport cards:

- Basketball
- Football
- Baseball
- Softball
- Soccer
- Ice Hockey

Expansion control:

> View All Sports

Final small card:

> Don’t see your sport? Choose “Other” in the request form.

---

### Styles section

Eyebrow:

> CHOOSE THE VIBE

Headline:

> Their Photos. Their Team. Their Style.

Copy:

> Start with a visual direction and tell us what they love. We customize the colors, atmosphere, type, number, position, and details around the athlete.

Style cards:

- Stadium Night
- Chrome All-Star
- Fire & Smoke
- Neon Future
- Vintage Trading Card
- Senior Night

Small note:

> Style examples are starting points. The final artwork is personalized for every accepted project.

---

### How it works section

Eyebrow:

> SIMPLE FROM START TO FINISH

Headline:

> From Camera Roll to Cover Moment.

#### Step 1

Title:

> Choose the direction

Copy:

> Select the sport, visual style, and package that best matches the moment.

#### Step 2

Title:

> Upload 3–5 photos

Copy:

> Add clear game-day images and the athlete’s name, number, position, team colors, and optional stats.

#### Step 3

Title:

> We review everything

Copy:

> We personally check the photos and email you within 24 hours with confirmation and a secure payment link.

#### Step 4

Title:

> Approve the artwork

Copy:

> After payment, we create the first proof. One revision is included before final delivery.

Process microcopy:

> Most first proofs are delivered within 2 business days after payment. Complex and team projects may take longer.

---

### Why different section

Eyebrow:

> DESIGNED, NOT FILTERED

Headline:

> It Should Still Look Like Them.

Copy:

> The most important part is not the smoke, lights, or effects. It is preserving the athlete’s identity and the details that make the moment theirs.

Three value cards:

#### Real likeness first

> We work from real athlete photos and preserve recognizable facial details instead of replacing them with a random AI character.

#### Sport-specific direction

> The pose, equipment, texture, and atmosphere are adapted to the actual sport—not dropped into one generic template.

#### Human quality control

> Every order is reviewed before payment and checked again before delivery.

---

### Pricing section

Eyebrow:

> CHOOSE THE MOMENT

Headline:

> Start With the Product You Want.

Copy:

> Not sure which package fits? Select “Help Me Choose” and we will recommend one after reviewing your photos.

Use package copy from Section 7.

---

### Photo guidelines section

Eyebrow:

> BETTER PHOTOS, BETTER ARTWORK

Headline:

> What Should You Upload?

Intro:

> You do not need professional photography. Clear phone photos can work well when the athlete is visible and not heavily blurred.

Good photo checklist:

- Face is clearly visible.
- Athlete is reasonably well lit.
- Full body or upper body is not cropped too tightly.
- Uniform and number are visible in at least one image.
- Action photos show a natural sports pose.
- Original-resolution files are used when possible.

Avoid:

- Screenshots from social media.
- Extremely dark photos.
- Heavy motion blur.
- Face covered in every image.
- Tiny athlete far away in the frame.
- Photos downloaded from a compressed messaging app when originals are available.

Reassurance copy:

> Not sure? Upload your best options. We review them before you pay.

---

### Team-order section

Headline:

> One Team. One Visual Identity. Every Player.

Copy:

> Create a consistent set for Senior Night, a team banquet, season gifts, social media, or the locker room. Team pricing is available for five or more athletes.

CTA:

> Request a Team Quote

Microcopy:

> Select “Team Order” in the form and tell us the approximate number of athletes.

---

### Main request-form section

Eyebrow:

> START YOUR PROJECT

Headline:

> Tell Us About Your Athlete.

Copy:

> Submit the details and 3–5 photos. There is no payment today. We will personally review the request and email you with the next step.

Trust chips:

- Secure photo upload
- No payment today
- Personal review
- No public use without permission

Primary form button:

> Submit My Athlete

Submitting state:

> Uploading Photos…

Finalizing state:

> Sending Request…

Success headline:

> We’ve Got the Photos.

Success message:

> Your request has been received. We will review the photos and email you within 24 hours with confirmation, any questions, and a secure payment link if the project is accepted.

Success reference label:

> Request ID: {SUBMISSION_ID}

Success secondary message:

> Please check your spam or promotions folder if you do not see the confirmation email within a few minutes.

Success CTA:

> View More Examples

---

### FAQ section

#### Is this an instant AI generator?

> No. Every accepted project is personally reviewed and custom-finished. AI may assist parts of the creative process, but the final composition, likeness, text, colors, and details receive human quality control.

#### Do I pay when I submit the form?

> No. We review your photos first. If the project is a good fit, we email confirmation and a secure Stripe payment link.

#### How many photos should I upload?

> Upload 3–5 of the clearest photos available. A mix of close-up, upper-body, and action images gives us the most flexibility.

#### What if my photos are not good enough?

> We will tell you before payment and ask whether you have stronger alternatives. You will not be charged for a project we cannot confidently create.

#### Will the final artwork look like the athlete?

> Preserving recognizable likeness is a priority. We use real photos as the foundation and avoid turning the athlete into a generic character. Final results still depend on the quality and angle of the uploaded images.

#### Can you use our team colors?

> Yes. Add the team colors in the request form. You may also upload a uniform photo for reference.

#### Can you include a team logo?

> We can review customer-provided team assets when the customer has permission to use them. We do not provide or recreate protected professional-team, league, school, or brand logos without authorization.

#### How long does it take?

> Photo review usually takes up to 24 hours. After payment, the first proof is typically delivered within 2 business days. Team and complex projects may require more time.

#### Are revisions included?

> One revision is included. It can cover reasonable adjustments to text, color, crop, or composition. A completely new concept or replacement photo set may require an additional fee.

#### What files will I receive?

> Deliverables depend on the selected package and may include high-resolution JPG, PNG, print-ready PDF, and MP4 files.

#### Do you offer printed products?

> The initial service focuses on digital files. Selected printed poster and trading-card options may be offered after the digital artwork is approved.

#### Will my athlete’s photos be posted publicly?

> Not unless you give separate permission. Submission consent allows us to create the private order; portfolio and marketing permission must be requested separately.

#### Can I order for an entire team?

> Yes. Select Team Order and enter the estimated number of athletes. We will reply with timing and a custom quote.

---

### Final CTA section

Eyebrow:

> THEIR SEASON DESERVES MORE THAN A CAMERA-ROLL MEMORY

Headline:

> Make the Moment Feel as Big as It Was.

Copy:

> Upload the photos today. We will review them before you pay and help choose the strongest direction for your athlete.

CTA:

> Create My Athlete

Microcopy:

> No payment today · Personal reply within 24 hours

---

### Footer

Footer statement:

> Custom sports identities created from the moments athletes and families already care about.

Links:

- Examples
- How It Works
- Pricing
- Photo Guidelines
- Privacy
- Terms
- Contact
- Instagram

Disclaimer:

> [BRAND NAME] is an independent custom design studio and is not affiliated with any professional sports league, team, school, equipment brand, or trading-card company.

Copyright:

> © {CURRENT_YEAR} [BRAND NAME]. All rights reserved.

---

## 10. Request form UX and fields

The form should be a five-step wizard embedded in the landing page, not an external form and not a tiny modal.

Show progress:

> Step 1 of 5

Preserve entered text while moving between steps. Do not store photo files in localStorage.

### Step 1 — Choose the project

Fields:

- `order_type`
  - Individual Athlete
  - Team Order
- `sport`
  - All sports listed in Section 5
- `package_interest`
  - The Poster — from $49
  - Identity Pack — from $89
  - All-Star Pack — from $139
  - Help Me Choose
- `style`
  - All styles listed in Section 6
  - Surprise Me

Step CTA:

> Continue to Athlete Details

### Step 2 — Athlete details

Required fields:

- Athlete first name
- Athlete last name or last initial
- Jersey number
- Position/event
- Team name
- Primary team color
- Secondary team color

Optional fields:

- Graduation year
- Season/year
- Short headline or phrase
- Stats: multiline input, maximum 300 characters
- Approximate number of athletes when `order_type = Team Order`

Do not collect date of birth, school address, home address, or other unnecessary information about a minor.

Step CTA:

> Continue to Photos

### Step 3 — Photo upload

Requirements:

- Minimum 3 files.
- Maximum 5 files.
- Accept JPG, JPEG, PNG, WebP, HEIC, and HEIF.
- Maximum original file size: 20 MB each.
- Convert HEIC/HEIF client-side when possible.
- Resize very large images to a maximum long edge of approximately 3000 px.
- Re-encode to high-quality JPEG or WebP to remove EXIF metadata, including embedded geolocation.
- Do not upscale small images.
- Show thumbnails.
- Allow remove and replace.
- Allow ordering photos with drag-and-drop or simple arrow controls.
- Mark one photo as “Best face photo.”
- Mark one photo as “Best action photo.”
- Show upload progress per image.
- Do not upload until the user continues or submits, unless using temporary signed upload URLs.

Upload guidance above the control:

> Add 3–5 clear photos. A close-up plus one or two action images usually creates the strongest result.

File control CTA:

> Add Athlete Photos

Privacy microcopy:

> Photos remain private and are not used in our portfolio or advertising without separate permission.

Step CTA:

> Continue to Contact Details

### Step 4 — Contact and notes

Required:

- Parent/customer full name
- Email address
- Country
- State, when country is United States

Optional:

- Phone number
- Instagram handle
- Deadline or event date
- Additional notes

Question:

> What matters most about this design?

Placeholder:

> Example: This is for Senior Night. He loves the black-and-gold uniform, and we would like the final poster to feel dramatic but clean.

Step CTA:

> Review Request

### Step 5 — Review and consent

Display a summary with edit links for every section.

Required checkbox 1:

> I confirm that I am the athlete, the athlete’s parent or legal guardian, or that I have permission from the athlete’s parent or legal guardian to submit these photos and request this artwork.

Required checkbox 2:

> I confirm that I own these photos or have permission to use them for this custom order.

Required checkbox 3:

> I agree to the Privacy Policy and Terms and understand that submitting this request does not require payment or guarantee that the project will be accepted.

Optional checkbox, unchecked by default:

> After the project is complete, you may contact me separately to request permission to feature the final artwork. I understand that nothing will be published without additional approval.

Do not combine order consent with marketing email consent.

Final CTA:

> Submit My Athlete

Error message:

> We could not submit the request. Your details have not been lost. Please try again, or email us at {SUPPORT_EMAIL} if the problem continues.

---

## 11. Form validation

Validation must be accessible and specific.

Examples:

- `Please select a sport.`
- `Please choose at least one preferred style.`
- `Please upload at least 3 photos.`
- `You can upload no more than 5 photos.`
- `This file is larger than 20 MB.`
- `This file format is not supported.`
- `Please enter a valid email address.`
- `Please confirm that you have permission to submit these photos.`

Rules:

- Validate each step before proceeding.
- Preserve all valid inputs when displaying an error.
- Move focus to the first invalid field.
- Use inline errors and a short error summary.
- Disable repeated submissions while the request is being processed.
- Use an idempotency key to prevent duplicate database rows.

---

## 12. Submission status model

Use these values in the database:

```text
draft
uploading
submitted
reviewing
needs_better_photos
accepted
payment_sent
paid
in_production
proof_sent
revision_requested
approved
completed
declined
cancelled
```

The website only creates `submitted`. The owner can update status manually in the database during V1.

---

## 13. Database schema

Create a `submissions` table with fields similar to:

```sql
id uuid primary key
created_at timestamptz
updated_at timestamptz
status text
idempotency_key text unique
order_type text
sport text
package_interest text
style text
athlete_first_name text
athlete_last_name text
jersey_number text
position_event text
team_name text
primary_color text
secondary_color text
graduation_year text
season_year text
headline text
stats text
team_size integer
customer_name text
customer_email text
country text
state text
phone text
instagram text
deadline_date date
notes text
guardian_consent boolean
photo_rights_consent boolean
terms_consent boolean
portfolio_contact_opt_in boolean
photo_count integer
source text
utm_source text
utm_medium text
utm_campaign text
utm_content text
landing_path text
```

Create a `submission_files` table:

```sql
id uuid primary key
submission_id uuid references submissions(id) on delete cascade
created_at timestamptz
storage_path text
original_filename text
mime_type text
size_bytes integer
width integer
height integer
sort_order integer
photo_role text
```

`photo_role` values:

- face
- action
- uniform
- additional

Do not store public photo URLs in the database.

---

## 14. Photo storage and privacy

Use a private storage bucket named `athlete-submissions`.

Storage path:

```text
submissions/{submission_id}/{random_file_id}.webp
```

Rules:

- Bucket must not be public.
- Browser must never receive a service-role key.
- Generate short-lived signed upload URLs server-side.
- Generate time-limited owner download URLs only in the server-side owner notification.
- Do not include photos as email attachments.
- Strip EXIF metadata through client-side re-encoding where possible.
- Do not expose original filenames in public URLs.
- Add rate limiting and bot protection.
- Delete abandoned uploads that never reach `submitted`.

Suggested retention policy:

- Declined or unpaid submissions: delete photos after 30 days.
- Completed paid projects: retain source files for up to 12 months for corrections, then delete unless a longer period is agreed.
- Final customer deliverables may be retained longer, but this must be explained in the Privacy Policy.

Add a manual cleanup procedure to the README. Automated cleanup can be Phase 2.

---

## 15. Email workflow and exact copy

Use transactional email, not a marketing automation platform.

### Email 1 — Automatic customer confirmation

Subject:

> We received your athlete photos — Request {SUBMISSION_ID}

Preheader:

> We will personally review the photos before you pay.

Body:

> Hi {CUSTOMER_FIRST_NAME},
>
> We received your request for {ATHLETE_NAME}.
>
> Next, we will review the uploaded photos, sport details, and preferred style. You can expect a personal reply within 24 hours.
>
> If the photos are suitable, we will confirm the package and send a secure payment link. No design work begins and no payment is required until then.
>
> **Request summary**
>
> Request ID: {SUBMISSION_ID}  
> Sport: {SPORT}  
> Preferred style: {STYLE}  
> Package interest: {PACKAGE}
>
> If you notice an important mistake, reply directly to this email and include the Request ID.
>
> Thanks,  
> {OWNER_NAME}  
> [BRAND NAME]

Footer privacy line:

> Your uploaded photos remain private and will not be published without separate permission.

### Email 2 — Owner notification

Subject:

> New athlete request: {ATHLETE_NAME} · {SPORT} · {PACKAGE}

Body must include:

- Request ID.
- Customer name and email.
- Athlete details.
- Sport and style.
- Team colors.
- Notes and deadline.
- Package interest.
- UTM attribution.
- Photo count.
- Time-limited private download links.
- Direct `mailto:` response link using the customer email.

Do not include photo files as attachments.

### Email 3 — Manual acceptance and payment link

Subject:

> Your athlete project is approved — next step

Body:

> Hi {CUSTOMER_FIRST_NAME},
>
> I reviewed the photos for {ATHLETE_NAME}, and we have enough strong material to create the project.
>
> **Recommended package:** {PACKAGE_NAME}  
> **Price:** {PRICE}  
> **Expected first proof:** within {TURNAROUND} after payment
>
> Use the secure link below when you are ready to begin:
>
> **Pay securely: {STRIPE_PAYMENT_LINK}**
>
> The package includes one revision. Once payment is complete, I will begin with the selected {STYLE_NAME} direction and the {PRIMARY_COLOR} / {SECONDARY_COLOR} team colors.
>
> If you would like to change the package before paying, reply to this email.
>
> Thanks,  
> {OWNER_NAME}

Append `client_reference_id={SUBMISSION_ID}` to the Stripe Payment Link when practical. Do not place sensitive personal information inside the URL.

### Email 4 — Request for better photos

Subject:

> One quick photo update before we begin

Body:

> Hi {CUSTOMER_FIRST_NAME},
>
> I reviewed the photos for {ATHLETE_NAME}. The idea is a good fit, but the current images may not preserve the athlete’s face clearly enough for the quality we want.
>
> If possible, please reply with:
>
> - One clearer face or upper-body photo.
> - One original-resolution action photo.
> - A photo where the uniform number is visible.
>
> You have not been charged. Once the new photos arrive, I will review them and confirm whether we can proceed.
>
> Thanks,  
> {OWNER_NAME}

### Email 5 — Decline

Subject:

> Update on your athlete artwork request

Body:

> Hi {CUSTOMER_FIRST_NAME},
>
> Thank you for sending the request for {ATHLETE_NAME}. After reviewing the material, I do not think I can produce a result that meets the quality shown in the examples.
>
> You have not been charged. The uploaded source photos will be removed according to the retention period described in our Privacy Policy.
>
> Thank you for understanding,  
> {OWNER_NAME}

---

## 16. Payment-link approach

Use Stripe Payment Links manually in V1.

Create reusable Stripe products for:

- The Poster — $49
- Identity Pack — $89
- All-Star Pack — $139
- Custom Team Deposit — variable or owner-created link
- Additional Revision — optional
- Physical Print Add-on — future

The owner sends the correct link manually after reviewing the request.

Recommended manual process:

1. Review photos.
2. Confirm package and any complexity surcharge.
3. Update status to `accepted`.
4. Copy the package Payment Link.
5. Append a non-sensitive `client_reference_id` using the submission ID.
6. Email the customer.
7. Update status to `payment_sent`.
8. Stripe sends the payment receipt.
9. Owner updates status to `paid` in V1.

Automated Stripe webhooks can be Phase 2.

---

## 17. AI image-generation requirements

The finished page must use original generated visuals. Do not leave grey placeholders, generic Unsplash sports photos, or empty gradient blocks.

All featured athletes must be fictional unless real customer permission is later provided.

Every generated example must:

- Avoid real team names, logos, uniforms, schools, leagues, sponsors, or equipment-brand marks.
- Use fictional names and generic uniforms.
- Label marketing examples as `Example artwork · Fictional athlete` where relevant.
- Show age-appropriate sports presentation.
- Avoid sexualized styling.
- Avoid impossible equipment, duplicated balls, broken hands, and mismatched jersey numbers.
- Keep the fictional athlete’s face and uniform consistent within each multi-output set.

### Required website assets

Generate and save optimized WebP/AVIF versions for the website.

#### Asset 1 — Hero identity-pack mockup

Aspect ratio:

> Landscape 16:10

Prompt:

> Premium photorealistic product mockup for a custom youth sports identity brand. A fictional 16-year-old basketball athlete in a generic navy and electric-blue number 23 uniform appears consistently across a framed cinematic poster, five holographic trading cards, a phone wallpaper, a vertical social post, a tablet screen, and a premium matte presentation box. Dark studio table, dramatic arena lights in the distance, restrained smoke, realistic card foil reflections, editorial product photography, premium but believable. No real team, league, sponsor, or brand logos. Exact fictional name: “MASON CARTER”. Exact position: “POINT GUARD”. Exact jersey number: “23”. Avoid extra copy, distorted hands, duplicate objects, or unreadable text.

Use in:

- Hero.
- Product-output showcase.

#### Asset 2 — Before/after pair

Create two images of the same fictional athlete.

Before prompt:

> Natural parent-shot youth basketball photo of fictional athlete Mason Carter, age 16, generic navy number 23 uniform, standing courtside after a game, ordinary gym lighting, realistic smartphone photography, unedited, clear face and upper body, no logos, no watermark.

After prompt:

> Transform the exact same fictional athlete and uniform into a premium cinematic Stadium Night sports poster. Preserve face, hair, skin tone, jersey number 23, and body proportions. Add arena lights, controlled blue smoke, layered action cutouts, bold professional sports-card framing, exact text “MASON CARTER”, “23”, “POINT GUARD”. No real logos, no watermark, no unrelated text.

Use in:

- Interactive before/after slider.

#### Assets 3–8 — Core sport poster examples

Create one vertical 4:5 flat poster for each:

1. Basketball — navy/electric blue — Mason Carter #23, Point Guard.
2. Football — burgundy/gold — Jaxon Reed #11, Quarterback.
3. Baseball — forest green/cream — Ethan Brooks #7, Shortstop.
4. Softball — black/violet — Ava Martinez #18, Pitcher.
5. Soccer — white/emerald — Leo Williams #10, Midfielder.
6. Ice Hockey — black/ice cyan — Noah Bennett #19, Center.

Shared prompt suffix:

> One complete flat vertical poster, large recognizable hero portrait plus two smaller sport-correct action cutouts, professional condensed type, exact name/number/position, subtle holographic edge accents, cinematic stadium or arena environment, generic uniform, no frame mockup, no devices, no real team or league logos, no watermark, no extra text.

Use in:

- Sports grid.
- Portfolio examples.
- Social sharing previews.

#### Assets 9–14 — Style thumbnails

Create square or 4:5 crops using one consistent fictional athlete and uniform:

1. Stadium Night
2. Chrome All-Star
3. Fire & Smoke
4. Neon Future
5. Vintage Trading Card
6. Senior Night

Each thumbnail should communicate the style mainly through lighting, texture, typography treatment, and framing. Keep the face and jersey number consistent.

#### Asset 15 — Photo-guideline comparison

Create a clean six-panel educational visual with fictional athletes:

- Good: clear face.
- Good: visible uniform.
- Good: action pose.
- Avoid: heavy blur.
- Avoid: extremely dark.
- Avoid: athlete too far away.

Do not rely on AI-generated small text inside this image. Add labels in HTML/CSS over the image panels so all copy remains accurate and accessible.

#### Asset 16 — Team-order scene

Prompt:

> Premium cinematic mockup showing a coordinated set of six personalized youth athlete posters arranged for a Senior Night team presentation. Fictional athletes, mixed gender, generic black-and-gold uniforms, consistent visual identity with different names and numbers, gym or banquet setting, realistic printed poster texture, no real school, league, sponsor, or brand logos, no watermark.

### Image implementation rules

- Text-critical names and package copy should remain HTML whenever possible.
- Generated image text is acceptable only inside portfolio artwork examples and must be manually checked.
- Use `srcset`, responsive sizes, lazy loading below the fold, and explicit width/height.
- Hero image should load eagerly with appropriate priority.
- Provide useful alt text.
- Keep original high-resolution assets outside the public build when not needed.

---

## 18. Interaction and motion direction

Motion should make the website feel premium, not distract from trust.

Use:

- Subtle hero image parallax on desktop only.
- Small card lift and border glow on hover.
- Animated form progress.
- Before/after drag slider with keyboard-accessible controls.
- Scroll reveal limited to opacity and 12–20 px translation.
- Respect `prefers-reduced-motion`.
- Avoid large cursor effects, long intro animations, continuous floating, and heavy 3D rendering.

Mobile performance takes priority over decorative motion.

---

## 19. Recommended technical stack

Use a stack that can operate at or near $0/month during validation.

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Optional lightweight animation: Motion
- Optional HEIC conversion: a client-side HEIC conversion library loaded only when required

### Source control and deployment

Use the same familiar workflow already used for ViewEconomy:

- Keep the complete source code in a private or public GitHub repository.
- Connect the GitHub repository to Vercel.
- Automatically deploy the production site from `main`.
- Create preview deployments for pull requests and non-production branches.
- Use Vercel Functions under `/api` for secure server-side endpoints when Vercel is the production host.

The site itself should remain portable and must not depend on proprietary Vercel-only UI features.

Important plan note:

- Current Vercel Hobby documentation restricts the free Hobby plan to non-commercial personal use.
- For a live site actively collecting commercial orders, use a Vercel plan that permits commercial use.
- If the goal is a genuinely $0/month commercial MVP, connect the same GitHub repository to Cloudflare Pages instead and deploy equivalent API routes as Pages Functions/Workers.
- GitHub remains the source of truth in either case, so moving between Vercel and Cloudflare should not require rebuilding the frontend.

### Data and private uploads

- Supabase Postgres.
- Supabase private Storage bucket.
- Row Level Security enabled.
- Server-side service role only inside protected server functions.

### Transactional email

- Resend.
- Verify a sending subdomain such as `mail.example.com` or `updates.example.com`.
- Set reply-to to the owner’s real support address.

### Bot protection

- Cloudflare Turnstile.
- Validate the Turnstile token server-side.
- Add IP/email rate limiting without permanently storing raw IP addresses longer than necessary.

### Payment

- Stripe Payment Links sent manually after review.

### Analytics

Start with one:

- Cloudflare Web Analytics, or
- Google Analytics 4.

Prepare optional environment-controlled hooks for:

- Meta Pixel.
- TikTok Pixel.

Events:

```text
view_content
hero_cta_click
view_examples
select_sport
select_style
start_form
complete_form_step
upload_photo
submit_request
submit_success
submit_error
team_quote_select
```

Do not send athlete names, customer emails, filenames, or other personal information to analytics platforms.

---

## 20. Secure API flow

Implement server functions similar to the following. When hosted on Vercel, use Vercel Functions or framework route handlers. When hosted on Cloudflare, adapt the same validation and service modules to Pages Functions/Workers.

### `POST /api/submissions/start`

Responsibilities:

1. Validate Turnstile.
2. Validate basic non-file fields.
3. Check rate limit and idempotency key.
4. Create submission UUID with temporary `uploading` status.
5. Return short-lived signed upload URLs for 3–5 expected files.

### Direct signed photo uploads

The browser uploads compressed files directly to private storage using the signed URLs.

Do not proxy full image bytes through the server function unless necessary.

### `POST /api/submissions/complete`

Responsibilities:

1. Revalidate the submission token.
2. Confirm 3–5 files exist.
3. Validate file metadata and storage paths.
4. Insert file records.
5. Update status to `submitted`.
6. Send customer confirmation email.
7. Send owner notification email.
8. Return the public-safe request ID.

If the email provider fails after data is safely stored:

- Do not create a duplicate submission.
- Return success with a message that confirmation email may be delayed.
- Log the email failure for manual follow-up.

### Security requirements

- All client input validated server-side.
- Never expose Supabase service role or Resend API key to the browser.
- Use strict allowed MIME types and file signatures where practical.
- Sanitize filenames and text.
- Escape all email content.
- Add CSRF-resistant architecture and same-origin checks where relevant.
- Set secure HTTP headers.
- Set a Content Security Policy compatible with required services.
- Avoid logging personal form payloads or signed photo URLs.

---

## 21. Environment variables

Provide `.env.example` with placeholders only:

```bash
PUBLIC_SITE_URL=
PUBLIC_BRAND_NAME=
PUBLIC_SUPPORT_EMAIL=
PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=athlete-submissions
RESEND_API_KEY=
RESEND_FROM_EMAIL=
OWNER_NOTIFICATION_EMAIL=
PUBLIC_GA_ID=
PUBLIC_META_PIXEL_ID=
PUBLIC_TIKTOK_PIXEL_ID=
```

Adapt prefixes to the chosen runtime. Never commit real credentials.

---

## 22. Suggested project structure

```text
/
├── public/
│   ├── images/
│   │   ├── hero/
│   │   ├── sports/
│   │   ├── styles/
│   │   ├── before-after/
│   │   └── guidelines/
│   ├── favicon.svg
│   ├── og-image.jpg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── sections/
│   │   ├── form/
│   │   └── ui/
│   ├── config/
│   │   ├── brand.ts
│   │   ├── packages.ts
│   │   ├── sports.ts
│   │   └── styles.ts
│   ├── content/
│   │   └── site-copy.ts
│   ├── lib/
│   │   ├── analytics.ts
│   │   ├── image-processing.ts
│   │   ├── validation.ts
│   │   └── api-client.ts
│   ├── pages-or-app/
│   ├── styles/
│   └── main.tsx
├── functions-or-worker/
│   ├── submissions-start.ts
│   ├── submissions-complete.ts
│   ├── emails/
│   └── security/
├── supabase/
│   ├── migrations/
│   └── policies/
├── .env.example
├── README.md
└── package.json
```

The exact folder convention may be adapted to the framework, but content, configuration, server secrets, and UI must remain cleanly separated.

---

## 23. Responsive design requirements

### Mobile

- Design mobile-first.
- Hero headline visible without awkward single-word lines.
- One primary CTA above the fold.
- Portfolio cards use horizontal scroll or one-column stack.
- Form inputs minimum 44 px touch target.
- File uploader must work from camera roll.
- Sticky bottom `Create My Athlete` CTA after hero.
- Avoid autoplay video with sound.
- Compress hero imagery aggressively.

### Tablet

- Two-column portfolio and pricing layouts where space permits.
- Form remains readable without wide empty margins.

### Desktop

- Maximum content width around 1200–1320 px.
- Hero can use an asymmetric 45/55 split.
- Use larger cinematic art without hiding key copy.
- Keep line length controlled.

Test at minimum:

- 360 px
- 390 px
- 768 px
- 1024 px
- 1440 px

---

## 24. Accessibility requirements

- WCAG AA contrast.
- Semantic headings in logical order.
- Real buttons and links, not clickable divs.
- Keyboard-accessible navigation, form wizard, cards, and before/after slider.
- Visible focus states.
- Labels for every form control.
- Error summary announced to screen readers.
- Upload progress announced with `aria-live`.
- Color choices must have text names; do not rely on color alone.
- Modal or mobile menu must trap focus correctly when open.
- Respect reduced-motion preference.
- All decorative images use empty alt text; meaningful examples use concise descriptive alt text.

---

## 25. SEO and metadata

### Title

> Custom Youth Sports Posters & Athlete Identity Packs | [BRAND NAME]

### Meta description

> Turn real game-day photos into a custom youth sports poster, trading card, social graphic, or cinematic athlete video. Submit photos for review before you pay.

### Suggested page H1

> Give Their Game a Cover Moment.

### Target phrases

- custom youth sports poster
- personalized athlete poster
- custom sports trading card
- senior night poster
- personalized sports gift
- custom baseball poster
- custom basketball poster
- custom football poster
- youth athlete photo edit

Use phrases naturally. Do not keyword-stuff headings.

### Social metadata

- Open Graph title.
- Open Graph description.
- Custom 1200×630 OG image.
- Twitter/X large image card.

### Structured data

Use appropriate JSON-LD for:

- `Organization` or `ProfessionalService`.
- `Product`/`Offer` only when displayed pricing and terms accurately match.
- `FAQPage` only if the FAQs are visibly present on the page and the schema remains compliant with current search-engine guidance.

Do not add aggregate ratings before real reviews exist.

---

## 26. Legal and platform boundaries

Create basic `/privacy` and `/terms` routes even though the marketing experience is one main landing page.

### Privacy topics

- What customer and athlete information is collected.
- Purpose of processing.
- Photo storage and access.
- Retention periods.
- Email communication.
- Third-party processors.
- Customer deletion/contact request.
- Separate consent for portfolio use.
- International data handling where applicable.

### Terms topics

- Customer confirms rights to submitted photos.
- Customer confirms guardian/athlete permission.
- One revision definition.
- No promise of recruiting or sporting outcomes.
- Turnaround is an estimate.
- Custom work refund/cancellation terms.
- Intellectual-property limitations for logos and protected brands.
- Final personal-use license.
- Separate commercial/team usage terms if required.

These templates should be reviewed by a qualified lawyer before relying on them as final legal documents.

### Etsy boundary

This standalone website is for direct traffic from Meta, Instagram, TikTok, Google, organic content, and referrals.

Do not use Etsy messages or Etsy listings to move an Etsy-originated buyer off Etsy for payment if that would violate Etsy’s current fee-avoidance or transaction policies. Etsy-originated orders should be paid and managed on Etsy. The standalone site should develop its own independent lead source.

---

## 27. Analytics and conversion strategy

Primary conversion:

> Successful athlete request submission

Secondary conversions:

- Started form.
- Uploaded first photo.
- Completed athlete details.
- Selected a package.
- Selected Team Order.
- Clicked email/contact.

Recommended dashboard metrics:

- Landing sessions.
- Hero CTA click rate.
- Form start rate.
- Step completion rate.
- Photo-upload completion rate.
- Final submission conversion rate.
- Accepted request rate.
- Payment-link send rate.
- Payment completion rate.
- Average order value.
- Production time per order.
- Revision rate.
- Conversion by sport.
- Conversion by style.
- Conversion by source/UTM.

Do not optimize only for cheap leads. Track accepted and paid orders back to source.

---

## 28. Launch content plan

The website should launch with at least:

- One hero identity-pack mockup.
- One before/after transformation.
- Six sport examples.
- Six style examples.
- One photo-guideline visual.
- One team-order visual.
- Three pricing packages.
- Complete FAQ.
- Working form and email flow.

No blank sections and no “coming soon” cards in the primary conversion path.

### First organic video concepts

1. “Your kid’s game photo → their own cover moment.”
2. Screen recording of plain photo becoming a sports poster.
3. “What $49 gets you” deliverables reveal.
4. Six sports in six seconds.
5. Parent-photo quality tips.
6. Poster → card → wallpaper → video reveal.
7. Team Senior Night transformation.
8. “Not an AI filter” face-likeness comparison.

Every video CTA:

> Upload your athlete photos at {DOMAIN}.

---

## 29. Implementation phases

### Phase 1 — Validation MVP

- Single landing page.
- Generated example art.
- Five-step request form.
- Private photo upload.
- Database submission.
- Customer confirmation email.
- Owner notification email.
- Manual review.
- Manual Stripe Payment Link.
- Basic analytics.
- Privacy and Terms pages.

### Phase 2 — Operations

- Lightweight protected owner dashboard.
- Status management.
- Resend saved email templates.
- Stripe webhook updates `paid` automatically.
- Expiring customer proof links.
- Automated source-photo cleanup.
- Real testimonials and customer gallery with permission.

### Phase 3 — Scale

- Paid checkout directly after automated photo-quality checks.
- Customer proof and approval portal.
- Print fulfillment.
- Team-order bulk import.
- Automated project folder creation.
- Production queue.
- Controlled AI-assisted variations.
- Upsells and repeat-season reminders.

Do not begin Phase 2 or 3 until Phase 1 receives real accepted and paid orders.

---

## 30. README requirements

The completed codebase must include a practical README covering:

1. Local installation.
2. Environment variables.
3. Supabase project setup.
4. SQL migrations and RLS policies.
5. Private storage bucket setup.
6. Resend domain verification.
7. Cloudflare Turnstile setup.
8. GitHub repository setup and branch workflow.
9. Vercel deployment, preview deployments, and environment variables.
10. Optional $0 commercial deployment from the same GitHub repository to Cloudflare Pages/Workers.
11. Custom domain connection.
12. How to change brand name, support email, prices, sports, and styles.
13. How to replace generated example images.
14. How to create and send Stripe Payment Links.
15. How to find and download a submitted project securely.
16. How to delete a submission and all associated photos.
17. How to test the complete form without sending live emails.

---

## 31. Acceptance criteria

The MVP is complete only when all of the following are true.

### Visual

- Looks premium on mobile and desktop.
- Uses original generated athlete artwork, not generic placeholders.
- All examples are clearly fictional until real customer permission exists.
- No broken text, logos, or obvious AI anatomy errors in featured images.
- Strong hero message and CTA are immediately visible.

### Form

- User can complete the five-step form.
- User can upload 3–5 supported images.
- Invalid files produce clear errors.
- Upload progress is visible.
- Duplicate submission is prevented.
- Successful submission returns a request ID.
- Refreshing after success does not resubmit.

### Data and email

- Submission row exists in the database.
- Files exist in a private bucket.
- No public source-photo URLs exist.
- Customer receives confirmation.
- Owner receives all project details and secure temporary photo access.
- Email failures do not erase a safely stored submission.

### Security

- No secret keys appear in the browser bundle.
- Turnstile is verified server-side.
- Server validates all inputs.
- Private photos cannot be guessed or publicly listed.
- Analytics contain no personal athlete/customer data.
- Consent records are stored with the submission.

### Quality

- Lighthouse performance target of 90+ on a representative mobile run where practical.
- No horizontal scroll at target breakpoints.
- Keyboard flow works.
- Reduced motion works.
- Form state remains intact when moving backward.
- All critical copy can be edited from content/config files.

---

## 32. Final Codex instruction

Build the complete Phase 1 product described in this document.

Priorities, in order:

1. Trust and clarity.
2. Mobile conversion.
3. Secure photo handling.
4. Strong original visuals.
5. Reliable submission and email flow.
6. Easy content editing.
7. Performance and accessibility.

Do not replace finished sections with placeholders. Generate the required fictional athlete artwork, inspect it for text/anatomy/logo problems, optimize it for the web, and use it in the finished page.

If external credentials are not available during the build:

- Implement the real integration interfaces.
- Provide `.env.example`.
- Provide a safe development mock mode.
- Never hardcode secrets or pretend that a production submission succeeded.
- Clearly document the exact setup steps required to activate production.

The final result should feel like a focused premium product brand, not a generic agency page, dropshipping template, or AI-demo website.
