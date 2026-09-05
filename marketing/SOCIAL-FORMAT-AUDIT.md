# Social audit — what to make, at what size, and why

Written 2026-09-02, before the first batch was rendered. Two questions: **what does this niche
actually reward**, and **what file does each platform want**. Competitor evidence is from
TikTok search itself (view counts as shown in the app), not from SEO blog posts about it.

---

## 1. The competitors are two different worlds, and only one of them is ours

Searching the obvious keyword is misleading, so both were checked.

### `custom sports card` — a hobby, not our market
| Account | Post | Views |
|---|---|---|
| Customkcgi | LeBron 1/1 jumbo patch card | 3.1K |
| ZeusCards | "Part one of making a custom Bruno Fernandes 1/1" | 2.7K |
| kevs_kards | "old baseball glove into a baseball card" | 1.2K |
| Tanner Jones | "Imagine your kiddo on a card" (Father's Day) | 965 |

These are **card artists making one-of-one physical cards of professional players** for
collectors — patches, autographs, #cardtok, #thehobby. They are not competing for a swim mom.
The one post in that list aimed at a parent ("imagine your kiddo on a card") is also the
outlier in subject matter, which is itself a signal.

**What trends there: the BUILD.** Every strong post is a process video — "here is the process
for how I made…", "part one of making…". The craft is the content.

### `senior night poster` / `custom youth sports poster` — our market, and almost nobody is selling in it
| Account | Post | Views |
|---|---|---|
| B & C | senior night, football | 10.4K |
| Glenys | "I'm so excited to surprise him!!!" | 5.0K |
| ilovemymelody333 | "Our last time ever playing together 🥹" | 4.3K |
| mitzy | "Making senior night posters for my brother 🏈🥹" | 641 |
| itsLidiaF | DIY fatheads for her son's team | — |

Almost every one is a **mother, sister or girlfriend making posterboard by hand** — glitter,
cut-out photos, hours of work. The captions are pure feeling: *"making this was so bittersweet"*,
*"my gorgeous girl is all grown up now"*. Commercial accounts in this space are thin and mostly
ads (Spark Art Prints, Postrly "link in bio", one boosted portrait-painting account).

**Two conclusions, and they set the whole content plan:**

1. **Nobody owns the intersection.** The hobbyists have the craft but aim at collectors and pro
   players. The parents have the emotion but no craft. We are the only ones who can put a
   card-artist-grade BUILD around **an ordinary kid**. That intersection is the brand.
2. **A polished advert loses to a phone video.** The winning posts are unpolished and personal.
   Our instinct — a beautiful branded frame — is the thing that reads as "ad" and gets scrolled.
   So the product art stays gorgeous, but the *framing* is a build or a reveal, not a billboard.

### What we must NOT do
- **Never mock the DIY poster.** The buyer is the person who made it, and she was proud of it.
  The line is "you don't have to be crafty", never "stop wasting your Saturday".
- **Never fake a hand-held process.** We have no footage of hands and scissors. Our build is a
  real one and it is digital: photo → cutout → finish → print. Show that, honestly.
- **Never promise a jersey number for a numberless sport.** Already enforced in `engine.py`
  (`numbered`), and it applies to every caption here too.

---

## 2. Sizes — what each platform actually wants

| Platform | Feed post | Carousel | Short video | Notes |
|---|---|---|---|---|
| **Instagram** | 1080×1350 (4:5) | 1080×1350, up to 20 slides | 1080×1920 | The profile **grid** now crops to 3:4 (1080×1440) — a 4:5 post loses its top and bottom edges in the grid, so nothing important goes in the outer 8% |
| **Facebook** | 1080×1350 (4:5) | same | 1080×1920, ≤90 s | Feed favours the same 4:5 as Instagram |
| **TikTok** | 1080×1920 (9:16) | 1080×1920, 4–35 photos | 1080×1920 | Photo Mode is ranked like video — swipe-through, not watch time. Slideshows beat video for before/after |
| **YouTube** | ⚠️ Community posts need **500 subscribers** | — | Shorts 1080×1920 | We have 0 subs, so the six stills are rendered at 1080×1080 and **held**, not posted |

**File specs.** PNG for anything with type (all of ours), JPEG only for pure photography.
Under 20 MB per image everywhere; TikTok wants ~100 KB–1 MB per slide for load speed. Video:
H.264, yuv420p, 24 fps, ≤10 MB at this length. **No audio** — every platform replaces it with
the creator's chosen sound, and a silent file is safer than a licensed one.

### Safe zones for vertical video
The UI eats the frame, and it eats a different amount per platform. Type must clear:

| | top | bottom | right |
|---|---|---|---|
| TikTok | 130 px | 400 px (caption + username + nav) | 180 px (button rail) |
| Instagram Reels | 120 px | 320 px | 150 px |
| YouTube Shorts | 110 px | 290 px | 150 px |
| Facebook Reels | 120 px | 340 px | 150 px |

This is why the four reels are **not one file copied four times**. The art bleeds; the type
moves. Same rule as the profile banners.

---

## 3. Tempo — a 12–15 s build

Most Shorts that perform sit at 15–35 s, but the hook has to land in **2–3 seconds** and the
payoff by 5. At 12–15 s there is room for exactly four beats:

| Beat | Seconds | What is on screen |
|---|---|---|
| **Hook** | 0.0–2.5 | The ordinary phone photo, full bleed, with the promise in four words |
| **Work** | 2.5–6.5 | The build — cutout, then the finish landing on it |
| **Reveal** | 6.5–11.5 | The finished card/poster as an object, held still. Longest beat: it is the thing being sold |
| **Ask** | 11.5–14.0 | Where to get it. Two lines, no more |

Rules that come out of this:
- **First frame is the hook.** Not a logo, not a title card — the parent's own photo, because
  that is the frame a scrolling parent recognises as *hers*.
- **The reveal gets the most seconds.** Cutting it short to fit more copy is the standard
  mistake; the product is the payoff.
- **Captions burned in.** Most viewing is silent, and burned-in type also survives a re-post.
- **A hard cut beats a transition.** The white flash between "before" and "after" is the only
  effect used — it reads as a shutter, and it is what makes the change legible in one frame.

---

## 4. What gets made

Six post concepts and four reels, each rendered at every platform's own size:

**Posts** — 1 `transform` (photos in → product out) · 2 `beforeafter` (phone photo → card front
and back) · 3 `six-styles` **carousel** (one athlete, six finishes) · 4 `how-it-works`
**carousel** (four steps) · 5 `product` (the poster as an object) · 6 `range` (fifteen sports,
one grid — the "do you do *my* sport" answer).

**Reels** — 1 `build` (the honest digital process) · 2 `styles` (six finishes, fast) ·
3 `senior-night` (the emotional one, aimed straight at the DIY crowd) · 4 `how` (four steps).

Rendered by `npm run mkt:social`. Output and captions: `marketing/social/<platform>/`.
