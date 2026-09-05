# Profiles — every handle, and what is actually set on it

The single answer to "where are we and what is our name there". Written 2026-09-02, when
Instagram, TikTok, the Facebook Page and YouTube were all set up in one pass.

**The brand mark is one file everywhere:** `exports/brand/GDE-etsy-shop-icon-1000x1000.png`
(navy ground, silver shield). Never a different avatar per platform — the tab icon is how
someone recognises us in a list.

**The headers come from Figma, not from code.** The Etsy shop banner
(`extra - cover`, node `299:582`, file `JcQvsgIRiOQtuZcP3Q8dc9`, page `_ASSETS`) is the master.
Each platform gets its own frame built from a *clone* of it, sized for that platform's safe box:

| Frame | Node | Size | Exported to |
|---|---|---|---|
| GDE - Facebook cover | `742:289` | 1640x856 | `marketing/profile/GDE-facebook-cover-1640x856.png` |
| GDE - YouTube banner | `738:289` | 2560x1440 | `marketing/profile/GDE-youtube-banner-2560x1440.png` |

The recipe, so the next one takes ten minutes: clone the cover into a frame of the target size,
`rescale()` it to the platform's **all-device safe width**, centre it, delete the clone's own
`#background` (a full-frame copy of the same image at ~0.6 opacity sits behind it instead),
set `clipsContent = false` so the athletes spill past the safe box, and stretch `scrim_left`
to the **whole frame** — a scrim that stops short of the frame edge is what draws the
pasted-rectangle seam, and that seam is the only thing that made the first two attempts look
cheap. Art bleeds, type stays inside the safe box.

---

## The four profiles

| Platform | Handle | URL | Display name |
|---|---|---|---|
| Etsy | GameDayEdition | gamedayedition.etsy.com | Game Day Edition |
| Instagram | @gamedayedition | instagram.com/gamedayedition | Custom Sports Cards & Posters |
| TikTok | @gamedayedition | tiktok.com/@gamedayedition | Game Day Edition |
| Facebook Page | id 61594076368136 | facebook.com/profile.php?id=61594076368136 | Game Day Edition |
| YouTube | @GameDayEdition | youtube.com/@GameDayEdition | GameDayEdition ⚠️ |
| Reddit | u/No_Butterscotch_6430 | reddit.com/user/No_Butterscotch_6430 | (personal-looking, on purpose) |
| Pinterest | business account | — | Game Day Edition |

### Instagram — done
Avatar, bio and name set. Name is deliberately the keyword phrase, not the brand, because the
username directly above it already reads `gamedayedition` — the name field is the only part
Instagram search indexes for words a buyer would actually type.

Bio (139/150):
> Your athlete's own trading card + poster, from your real photos.
> 17 sports · 6 art styles · free shipping worldwide
> gamedayedition.etsy.com

⚠️ **The clickable link is missing and cannot be added from a desktop.** Instagram's web editor
says so outright: *"Editing your links is only available on mobile."* The address is in the bio
as plain text so the profile works today. **On the phone: Edit profile → Links → add
`https://gamedayedition.etsy.com`**, then the last bio line can be dropped.

### TikTok — done
Avatar, name and bio set. Bio is 79/80 characters, which is the whole budget:
> Trading cards + posters of YOUR athlete, from your photos.
> Etsy: gamedayedition

TikTok gives no bio link below 1,000 followers, so the address is text. Display-name changes
are limited to **once per 7 days** — it was set on 2026-09-02, so the next change is 09-09.

### Facebook Page — created 2026-09-02
Name, avatar, cover, bio, categories (Shopping & retail · Product/service · Sports) and the
website all set; the Page is live and the account is switched into it.

Two things were deliberately **not** done:
- **No phone, no email, no address.** The only business address is `hello@gamedayedition.com`,
  whose Hostinger plan expires 2026-09-23 — publishing an address that may stop receiving mail
  is worse than publishing none. Revisit after the plan is renewed.
- **Friends were not invited.** That sends notifications to real people from the owner's
  15-year-old personal account. His call, not an automated one.

✅ **Action button set 2026-09-03: Learn more →** `https://gamedayedition.etsy.com/?utm_source=facebook&utm_medium=social&utm_campaign=page_button`. ("Buy now" needs a Meta shop, so Learn more is the URL button.) Path: switch into the Page → `…` under the cover → Action button → Learn more → link → Save. Verified by reopening after reload: the dialog reads "Edit action button" with the link and a green tick.

### YouTube — banner, avatar, description and links done; name blocked
Handle `@GameDayEdition` already existed. Set today: the 2560x1440 banner, the shield avatar,
the channel description, and four links (Shop on Etsy, Instagram, TikTok, Facebook).

⚠️ **The channel name is still `GameDayEdition`, not `Game Day Edition`.** YouTube refused it:
*"You entered too many names that can't be used. Try again in 24 hours."* The name and the
description do **not** save in the same Publish as each other — each has to be typed, blurred
with Tab, and published on its own, and finding that out cost the day's name-change allowance.
**After 2026-09-03: set the name alone, blur, Publish, then reload and confirm it stuck.**

---

## The trap that cost the most time

**A YouTube Studio Publish can save some fields and silently drop others.** Links and images
saved; name and description came back empty after a reload, with no error shown. The page also
keeps a "Leave site?" guard even when Publish looks disabled, so a successful-looking save
proves nothing.

**Always reload the page and re-read the field before believing it saved.** That rule is not
specific to YouTube — it is the same lesson as the Facebook group post that reported success
while actually sitting in "pending admin approval".

---

## Still missing

- **Reels / Shorts / TikTok posting.** Four clips are rendered (`marketing/video/`) and three
  of the four accounts now exist. Nothing has been posted.
- **Instagram: first post, and the bio link from the phone.**
- **Pinterest** is the only channel with a documented daily routine; the other four need one
  once they have content. See `marketing/DAILY-ROUTINE.md`.
