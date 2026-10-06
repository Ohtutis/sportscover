// Custom baseball cards, the complete guide (SEO brief 2026-10-06, builder W). Every baseball fact is a row:
// the front, the back, the photo traps and the two answers are baseball's row in lib/seo/sport-facts.ts;
// when senior night falls, the walk and the senior back are its row in lib/seo/senior-night-facts.ts.
// Baseball carries a number (lib/catalog/sports.ts), so "their number" is true here. The stat count is
// MAX_STATS, the finishes the styles catalog, the proof path D29's line and C20, the clocks INTAKE_COPY.
// The example card is the roster's public demo edition, and C18 says so beside the link. The ordering
// windows are written in words: the row's own answer names its second window in a phrase the blog's date
// lint refuses, so that answer is not rendered here.
import { Figure, H2, InlineLink, Lead, List, P, PostCta } from "../../components/blog";
import { block } from "../../lib/blocks";
import { SHIPPING_SENTENCE } from "../../lib/catalog/delivery";
import { finishes, styleByCode } from "../../lib/catalog/styles";
import { CANON } from "../../lib/copy/canon";
import { INTAKE_COPY, PROOF_CLOCK } from "../../lib/intake/copy";
import { MAX_STATS, PHOTO_RULES } from "../../lib/intake/types";
import { cardStats, getCard } from "../../lib/registry/cards";
import { seasonWord, seniorNightFactsFor, seniorNightPath } from "../../lib/seo/senior-night-facts";
import { sportFactsFor, sportPagePath } from "../../lib/seo/sport-facts";
import type { BlogPost } from "../../lib/blog";

const SLUG = "baseball";
const FACTS = sportFactsFor(SLUG);
const SENIOR = seniorNightFactsFor(SLUG);

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven"];
const word = (n: number): string => WORDS[n] ?? String(n);
/** Lower-cases a sentence's first letter to follow a colon, but never an initialism ("UV-coated" stays). */
const lower = (s: string): string => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** "a, b and c" or "a, b or c". */
const joinList = (items: readonly string[], last: "and" | "or"): string =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${last} ${items[items.length - 1]}`;

/** One of the row's own answers, without a leading "Yes.". */
const answer = (id: string): string => (FACTS?.questions.find((q) => q.id === id)?.a ?? "").replace(/^Yes\.\s*/, "");

/** The stat chips the row's back line names in brackets. */
const STAT_CHIPS = (FACTS?.backLine.match(/\(([^)]+)\)/)?.[1] ?? "").split(", ").filter(Boolean);

const FINISH_LIST = joinList(
  finishes.map((f) => f.name),
  "and",
);
const SENIOR_STYLE = styleByCode("SR");
const CARD_FINISH = styleByCode("HE")?.name ?? "";

/** The roster's public demo edition for baseball (lib/registry/cards.ts), in the finish the figure shows. */
const DEMO = getCard("GDE-HE-BSB-2026-07");
const DEMO_STATS = DEMO
  ? cardStats(DEMO)
      .map((s) => `${s.label} ${s.value}`)
      .join(" · ")
  : "";

const SPRING = SENIOR ? seasonWord(SENIOR.when.peakMonth) : "spring";

export const post: BlogPost = {
  slug: "custom-baseball-cards-from-your-photos-the-complete-guide",
  title: "Custom Baseball Cards: The Complete Guide",
  h1: "CUSTOM BASEBALL CARDS.",
  description:
    "Custom baseball cards from your player's own photos: what the front and back carry, the cap and helmet photo traps, the stats that fit, and when to order.",
  category: "Baseball and Softball Gifts",
  sport: SLUG,
  primaryPage: sportPagePath(SLUG),
  publishedAt: "2026-10-06",
  readingMinutes: 4,
  image: "sport.baseball.front",
  body: () => (
    <>
      <Lead>
        A custom baseball card is a real trading card built from your player's own photos: their face, their uniform and their
        season, on the front and the back. Below is all of it, from the photos that work to the stats that fit and when to order.
        The card itself is on our <InlineLink href={sportPagePath(SLUG)}>custom baseball card</InlineLink> page, and the{" "}
        <InlineLink href="/photo-guide">photo guide</InlineLink> shows which photos to pull from your phone first.
      </Lead>

      <H2>WHAT'S ON THE FRONT AND THE BACK.</H2>
      <P>
        <strong className="font-medium">The front.</strong> {FACTS?.frontLine}
      </P>
      <P>
        <strong className="font-medium">The back.</strong> {FACTS?.backLine}
      </P>
      <P>
        {answer("q-baseball-number")} The kit is copied exactly as it is, cap and crest included, and nothing on it is invented.{" "}
        {block("logo-sentence")}
      </P>
      <Figure asset="sport.baseball.front" variant="card" caption={`A baseball card front in the ${CARD_FINISH} finish.`} />
      <P>
        The art comes in one of {word(finishes.length)} finishes: {FINISH_LIST}. A senior can have the gold Senior Night edition
        instead, and the same artwork also comes as a poster for the wall.
      </P>
      <Figure asset="wall.baseball" caption="A framed baseball poster on a bedroom wall, above the desk." />

      <H2>PHOTOS: THE CAP AND THE HELMET.</H2>
      <P>
        Baseball photos have two traps of their own, the cap and the batting helmet, and both hide the eyes. Four things to
        look for before you send anything:
      </P>
      <List items={FACTS?.photoTraps ?? []} />
      <P>
        Beyond those, the list is the same as for any sport, and the <InlineLink href="/photo-guide">photo guide</InlineLink>{" "}
        walks through it with examples. {block("photos-that-work-best")}
      </P>

      <H2>STATS THAT FIT ON THE BACK.</H2>
      <P>
        Up to {word(MAX_STATS)} stats fit on the back, as chips, or none at all. The usual baseball chips are{" "}
        {joinList(STAT_CHIPS, "or")}: pick the {word(MAX_STATS)} that sum up the season best.
      </P>
      <P>{answer("q-baseball-position")}</P>
      {DEMO ? (
        <P>
          To see the chips on a finished edition, open{" "}
          <InlineLink href={`/c/${DEMO.cardId}`}>an example baseball card page</InlineLink>: {DEMO_STATS}.{" "}
          {CANON.galleryCaptionShort}
        </P>
      ) : null}

      <H2>FREE PROOF FIRST.</H2>
      <P>{CANON.proofFirstLine}</P>
      <P>
        Send {PHOTO_RULES.min}–{PHOTO_RULES.max} photos and the stats you want printed. The proof arrives by email within{" "}
        {PROOF_CLOCK}, with the watermark across it. {CANON.proofChecklist} One revision is included, and if the proof isn't
        right and we can't fix it, there is nothing to pay at all.
      </P>

      <H2>WHEN BASEBALL PARENTS ORDER.</H2>
      <P>
        Two windows, and neither needs a date. The first is the {SPRING} season, when the card marks the year: a new uniform,
        fresh photos, a season worth keeping. The second is the holiday stretch at the end of the year, when the card is a gift
        built from the season's photos already on your phone. Fall ball counts too, and a fall team photo day makes as good a kit
        reference as a {SPRING} one.
      </P>
      <P>
        Whenever you order, the clocks are the same: {lower(INTAKE_COPY.steps[3].body)} {SHIPPING_SENTENCE}
      </P>

      <H2>THE SENIOR NIGHT EDITION.</H2>
      <P>
        For a senior there is the {SENIOR_STYLE?.name} style: {lower(SENIOR_STYLE?.material ?? "")} Here is how it fits baseball:
      </P>
      <List
        items={[
          <>
            <strong className="font-medium">When.</strong> {SENIOR?.when.line}
          </>,
          <>
            <strong className="font-medium">The night.</strong> {SENIOR?.ritual}
          </>,
          <>
            <strong className="font-medium">The back.</strong> {SENIOR?.backLine}
          </>,
        ]}
      />
      <P>
        {CANON.seniorDateLine} The timeline, worked back from the night, is on the{" "}
        <InlineLink href={seniorNightPath(SLUG)}>baseball senior night</InlineLink> page.
      </P>

      <PostCta context="cards" options={{ sport: SLUG }} />
    </>
  ),
};
