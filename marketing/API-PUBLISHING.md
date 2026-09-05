# Publishing without a browser — the API route (feasibility, 2026-09-03)

Owner's goal, said today: "norėčiau be mano įsikišimo, kad atliktum visus marketinginius
darbus." The browser extension can publish **images** everywhere but **video nowhere**
(IG web rejects, TikTok video tab never processes, YouTube Studio fields ignore input, Meta
Business Suite is a native picker). Reels are the format this product is native to, so the
gap matters. The only path that is fully hands-off after a one-time setup is the APIs.

## What each platform needs (one-time, owner) → what Claude can then do (daily, alone)

| Platform | One-time setup (owner, ~20–40 min each) | Then Claude can |
|---|---|---|
| **Instagram Reels + posts** | IG account must be **Business/Creator** and **linked to the Facebook Page** (Page already exists: id 1231779406693811). Create a Meta app (developers.facebook.com), add "Instagram Graph API", generate a **long-lived Page access token** with `instagram_basic, instagram_content_publish, pages_read_engagement`. | `POST /{ig-user-id}/media` (`media_type=REELS`, `video_url=<public URL>`, `caption`) → `POST /{ig-user-id}/media_publish`. Images: same with `image_url`. Videos must be at a **public HTTPS URL** — the site (gamedayedition.com / Vercel) can host `marketing/social/...` under `/social/`. |
| **Facebook Page reels + posts** | Same app + Page token (`pages_manage_posts, pages_read_engagement`). | `POST /{page-id}/video_reels` (3-step: start → upload → finish with `description`), `POST /{page-id}/photos` for images. |
| **YouTube Shorts** | Google Cloud project, enable YouTube Data API v3, OAuth client (desktop), one consent run on the owner's Google account → refresh token. | `videos.insert` with `#shorts` in title/description. Quota: 1 600 units/upload of 10 000/day → ~6 uploads/day. |
| **TikTok** | TikTok for Developers app + Content Posting API. ⚠️ **Unaudited apps can only post as private ("Only me")**; public posting needs an app audit (days–weeks). Photo Mode posting is `/v2/post/publish/content/init/`. | Until audited: nothing public. Keep TikTok on the browser (photos work) / phone (video). |
| **Pinterest** | Business account ✅ (done 2026-09-02). Create an app at developers.pinterest.com, OAuth with `pins:write, boards:read` (standard access = own account only, which is all we need). | `POST /v5/pins` with `board_id`, `title`, `description`, `link`, `media_source: {source_type: image_base64}`. Also fixes today's blocker (the pin form never mounts in a background tab). |
| **Reddit** | Script app at reddit.com/prefs/apps → client id/secret; account is `No_Butterscotch_6430`. | Comments/posts via OAuth (`submit`). ⚠️ Karma 1 — API posting at that age looks like a bot; keep Reddit manual until karma > 20. |

## Hosting the media for IG/FB

Both Meta endpoints fetch from a URL, they do not accept uploads from the caller. Simplest:
commit the four `marketing/social/*/reels/*.mp4` under `public/social/` on the Next.js site
(Vercel serves static files) → `https://gamedayedition.com/social/01-build-instagram.mp4`.
7 MB each, fine. Keep them out of git LFS.

## Order of value

1. **Meta (IG + FB Page)** — one token unlocks two channels and the reels that matter most.
2. **Pinterest** — kills the daily browser blocker for 3 pins/day.
3. **YouTube** — Shorts, low effort once OAuth is done.
4. TikTok — only after the audit; browser (photos) + phone (video) meanwhile.

Nothing here is built yet. Each row above is a 30–80 line script in `marketing/publish/`
once the owner hands over tokens (store them in `.env`, never in the repo).

## The faster route: a scheduler that already holds the API keys (recommended first)

Building four API integrations is a week. A scheduler is a one-time login. Buffer, Metricool,
Later and Publer are **approved TikTok "Direct Post" partners**, so they can post to TikTok
publicly — which our own unaudited app cannot — and they publish IG Reels, FB Reels, YouTube
Shorts and Pinterest video pins through the official APIs, from one form with an ordinary
file input. That form is the kind the browser extension drives without trouble; the platform
composers that failed today (IG web, TikTok Studio video, YouTube Studio, Business Suite) are
exactly the heavy SPAs it cannot.

| Tool | Free tier (verify at signup — plans change) | Fits |
|---|---|---|
| **Metricool** | free plan: 1 brand, IG + FB + TikTok + YouTube + Pinterest + X, ~50 posts/mo | ✅ all five channels in one place — first choice |
| Buffer | free: 3 channels, 10 scheduled posts/channel | 3 of 5 channels |
| Publer | free: 3 accounts | 3 of 5 |
| Later | free: 1 social set | weakest |

**Owner does once (~15 min):** sign up (editiongameday@gmail.com), connect Instagram
(needs the IG account switched to Business/Creator — it is a Business Page link away),
Facebook Page, TikTok (@gamedayedition), YouTube channel, Pinterest business account. Each is
an OAuth "Allow" click. Then hand Claude the login.

**Claude does daily:** upload each reel with its caption, AI/branded-content flags, board /
playlist, and schedule time — from `marketing/upload/<date>/UPLOAD.md`, which is already
written in that shape.

Caveats that are real: (1) IG must be Business/Creator for API publishing; (2) TikTok posts
via partners still get TikTok's "unaudited/third-party" treatment on some accounts — check
the first post's visibility; (3) YouTube via schedulers uploads as normal videos — vertical
+ ≤60 s + `#shorts` makes them Shorts; (4) free-tier post caps — 50/month covers
1 reel/day + pins.
