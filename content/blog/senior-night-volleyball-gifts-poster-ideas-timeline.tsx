// Senior night volleyball (master plan §7.5 calendar #5: gifts, poster ideas and a timeline). The senior
// edition is /senior-night's description (COPY §2.5, FAQ 40/41); poster sizes are FAQ 05; the banner and
// blanket are PRODUCTS; the timeline is CHIPS.seniorNight (no sealed pack — D18), PROOF_CLOCK and the
// calculator's gift-note fallback (CALC_COPY). Volleyball carries a number (lib/catalog/sports.ts).
import { Callout, Figure, H2, InlineLink, Lead, List, P, PostCta } from "../../components/blog";
import { CHIPS } from "../../lib/catalog/delivery";
import { MAX_STATS } from "../../lib/intake/types";
import { productByKey } from "../../lib/intake/products";
import { PROOF_CLOCK } from "../../lib/intake/copy";
import type { BlogPost } from "../../lib/blog";
import { SUPPORT_EMAIL } from "../../lib/site";

/** The senior night chip without the sealed pack (D18): "FILES 1 WEEK BEFORE · PRINTED SETS 2 WEEKS". */
const SN_CLOCK_LINE = CHIPS.seniorNight
  .split(" · ")
  .filter((segment) => !/PACK/.test(segment))
  .join(" · ");

const STAT_COUNT = ["none", "one", "two", "three", "four", "five"][MAX_STATS] ?? String(MAX_STATS);

export const post: BlogPost = {
  slug: "senior-night-volleyball-gifts-poster-ideas-timeline",
  title: "Senior Night Volleyball: Gifts & Timeline",
  h1: "SENIOR NIGHT VOLLEYBALL GIFTS.",
  description:
    "Senior night volleyball gifts from your senior's own photos — the gold senior card, a poster, a banner — and a timeline that works back from the night.",
  category: "Senior Night Ideas",
  sport: "volleyball",
  occasion: "senior-night",
  primaryPage: "/senior-night",
  publishedAt: "2026-10-04",
  readingMinutes: 3,
  image: "sn.sport.volleyball.front",
  body: () => (
    <>
      <Lead>
        Senior night comes once: the last home match, the name read out in the gym, a few minutes on the court with the people
        who drove to every practice. Here is how to mark it with something built from your volleyball senior's own photos —
        the gifts, some poster ideas, and a timeline that works back from the night. The whole senior edition is on the{" "}
        <InlineLink href="/senior-night">senior night page</InlineLink>, and{" "}
        <InlineLink href="/how-it-works">how it's made</InlineLink> shows the checks every piece goes through.
      </Lead>

      <H2>THE CARD THAT CARRIES THE SEASON.</H2>
      <P>
        The card is the gift that keeps the record. In the gold Senior Night finish the front carries their name and their number,
        on the kit copied from your photos. The back carries what four years added up to: career highs, position, team, the
        class year, the four-year line — FR · SO · JR · SR — their senior quote and the athlete signature line.
      </P>
      <P>
        Up to {STAT_COUNT} stats fit on the back, or none at all — the season is theirs to sum up. Beside the registered card ID
        sits SENIOR EDITION · 1 OF 1, because there is exactly one. Every printed senior set includes every digital file: the
        files arrive first, and the printed set ships after you approve the proof.
      </P>
      <Figure asset="sn.sport.volleyball.front" variant="card" caption="A volleyball senior card in the gold Senior Night finish." />

      <H2>PHOTOS FROM A DARK GYM.</H2>
      <P>
        Volleyball season lives in the gym, and gym light is hard on a phone. Motion blur and dark gyms hide the face, and one crisp,
        close, well-lit photo does more than four soft ones — so alongside the match photos, send a close-up taken somewhere
        bright, with both eyes visible.
      </P>
      <P>
        Fast rallies tempt you to send a burst; four shots from one burst count as one photo. Pick different moments instead,
        plus one with the head turned about 45° each way, one full-body, and one in the team kit, because the kit on the card is
        copied from it.
      </P>

      <H2>POSTER IDEAS.</H2>
      <P>
        The poster is the art; the stats stay on the card. That leaves the whole frame to your senior, composed in one of six
        finishes — from a floodlit stadium at night to high-contrast chrome — or in the Senior Night gold to match the card.
      </P>
      <List
        items={[
          "For the night itself: framed, and held up at the ceremony.",
          "For their room: 18 × 24 sits above a desk or dresser; 24 × 36 holds a wall on its own.",
          "For later: every poster order includes both sizes as files, so a printed 18 × 24 can be printed again larger.",
          "For their phone: the digital files include phone and desktop wallpapers.",
        ]}
      />
      <Figure asset="wall.volleyball" caption="A framed volleyball poster on a living-room wall." />

      <H2>A BANNER FOR THE GYM.</H2>
      <P>
        {productByKey("banner")?.blurb} It comes as printed vinyl at 1 × 2, 2 × 4 or 3 × 6 ft, or as the print-ready file at full
        size if you would rather print it near home. Printed banners ship separately, in 1–2 weeks. And blankets are on the way:{" "}
        {productByKey("blanket")?.blurb.toLowerCase()} Three sizes, each priced on the free-proof form.
      </P>

      <H2>A TIMELINE, WORKED BACK.</H2>
      <List
        ordered
        items={[
          <>
            <strong className="font-medium">As soon as you know the date.</strong> Send 4–10 photos and ask for a free proof; it
            arrives within {PROOF_CLOCK}. Tell us the date in your reply to the confirmation email and we schedule the proof against it.
          </>,
          <>
            <strong className="font-medium">At least two weeks before the night.</strong> Approve the proof and order the printed
            set, so it ships in time.
          </>,
          <>
            <strong className="font-medium">At least a week before.</strong> The last mark for the digital files.
          </>,
          <>
            <strong className="font-medium">Closer than that.</strong> Gift the digital first and print the gift note — the
            printed set follows after the night.
          </>,
        ]}
      />
      <P>
        Those marks are our senior night clocks — {SN_CLOCK_LINE.toLowerCase()}. The calculator on the{" "}
        <InlineLink href="/senior-night">senior night page</InlineLink> does the date math for you, in business days, US Eastern
        time.
      </P>
      <Callout label="The whole team?">
        Email us the sport, roster size and event date at <InlineLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</InlineLink>.
        Every family orders their own athlete under one team setup, and each card is built and proofed individually.
      </Callout>

      <PostCta context="senior-night" options={{ sport: "volleyball" }} />
    </>
  ),
};
