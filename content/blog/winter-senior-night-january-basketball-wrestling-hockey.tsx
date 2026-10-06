// Winter senior night (SEO brief 2026-10-06, builder W): basketball, wrestling and hockey, the three spokes
// whose night falls right after the holidays. Every sport fact is that sport's row in
// lib/seo/senior-night-facts.ts (when the night falls, the walk, the photo trap, what the back carries,
// the team answer), rendered from the row and never retyped. The clocks are CHIPS.seniorNight without the
// sealed pack (D18) and PROOF_CLOCK; the banner's own clock is its PRODUCTS line. Three sports, so the post
// has no `sport`, never says "their number", and its CTA prefills the Senior Night style without a sport.
import { Callout, Figure, H2, InlineLink, Lead, List, P, PostCta } from "../../components/blog";
import { CHIPS } from "../../lib/catalog/delivery";
import { sportBySlug, type Sport } from "../../lib/catalog/sports";
import { CANON } from "../../lib/copy/canon";
import { INTAKE_COPY, PROOF_CLOCK } from "../../lib/intake/copy";
import { optionOf, productByKey } from "../../lib/intake/products";
import { MAX_STATS } from "../../lib/intake/types";
import { seniorNightFactsFor, seniorNightPath, type SeniorNightFacts } from "../../lib/seo/senior-night-facts";
import type { BlogPost } from "../../lib/blog";
import { SUPPORT_EMAIL } from "../../lib/site";

/** The three winter spokes, in the order their nights usually fall. */
const WINTER_SLUGS = ["basketball", "wrestling", "ice-hockey"] as const;

interface WinterRow {
  sport: Sport;
  facts: SeniorNightFacts;
}

const WINTER: WinterRow[] = WINTER_SLUGS.flatMap((slug) => {
  const sport = sportBySlug(slug);
  const facts = seniorNightFactsFor(slug);
  return sport && facts ? [{ sport, facts }] : [];
});

const WORDS = ["no", "one", "two", "three", "four", "five"];
const word = (n: number): string => WORDS[n] ?? String(n);

/** "Ice Hockey" reads "Ice hockey" in a sentence. */
const sportName = (s: Sport): string => s.name.charAt(0) + s.name.slice(1).toLowerCase();

/** "FILES 1 WEEK BEFORE" → "Files 1 week before": the senior night chip as a sentence, without the sealed pack (D18). */
const SN_CLOCKS = CHIPS.seniorNight
  .split(" · ")
  .filter((segment) => !/PACK/.test(segment))
  .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase());

/** The row's photo note about the thing that hides the face in this sport: gym light, headgear, the helmet. */
const photoTrap = (f: SeniorNightFacts): string | undefined => f.photoNotes.find((note) => /gym light|headgear|helmet/i.test(note));

/** The part of the back that belongs to the sport: everything before the shared senior lines. */
const sportBack = (f: SeniorNightFacts): string => f.backLine.split(", the four-year line")[0];

/** The shared senior lines, read from the first row ("the four-year line … beside the registered card ID."). */
const SHARED_BACK = (() => {
  const line = WINTER[0]?.facts.backLine ?? "";
  const at = line.indexOf("the four-year line");
  const end = line.indexOf("registered card ID.");
  return at >= 0 && end > at ? line.slice(at, end + "registered card ID.".length) : "";
})();

/** A row's sentence after the shared lines, when it has one (wrestling: the plain back of the singlet). */
const backTail = (f: SeniorNightFacts): string => {
  const end = f.backLine.indexOf("registered card ID.");
  return end >= 0 ? f.backLine.slice(end + "registered card ID.".length).trim() : "";
};

/** The rows' own answer to "can the whole senior class order together?", without its "Yes." */
const TEAM_ANSWER = (
  WINTER.flatMap((r) => r.facts.questions).find((q) => /whole senior class/i.test(q.q))?.a ?? ""
).replace(/^Yes\.\s*/, "");

const banner = productByKey("banner");
/** "Ships separately, 1–2 weeks." from the banner's printed option, as a clause: "ships separately, 1–2 weeks". */
const BANNER_CLOCK = ((banner && optionOf(banner, "2x4")?.detail.match(/Ships separately[^.]*/)?.[0]) ?? "").replace(/^S/, "s");

export const post: BlogPost = {
  slug: "winter-senior-night-january-basketball-wrestling-hockey",
  title: "Winter Senior Night Comes in January",
  h1: "WINTER SENIOR NIGHT.",
  description:
    "Basketball, wrestling and hockey senior nights fall right after the holidays. What each night looks like, the photo trap in each sport, and when to order.",
  category: "Senior Night Ideas",
  occasion: "senior-night",
  primaryPage: "/senior-night",
  publishedAt: "2026-10-06",
  readingMinutes: 4,
  image: "sn.sport.basketball.front",
  body: () => (
    <>
      <Lead>
        Most senior night planning happens in the fall, around football, soccer and volleyball. Three sports hold their night in
        winter instead: basketball, wrestling and hockey. All three fall right after the holidays, so the planning has to come
        first. Here is what each night looks like, the photo trap in each sport, and when to order. The whole senior edition is
        on the <InlineLink href="/senior-night">senior night page</InlineLink>, and the{" "}
        <InlineLink href="/photo-guide">photo guide</InlineLink> shows which photos to send first.
      </Lead>

      <H2>THREE NIGHTS AFTER THE HOLIDAYS.</H2>
      <List
        items={WINTER.map(({ sport, facts }) => (
          <>
            <strong className="font-medium">{sportName(sport)}.</strong> {facts.when.line}
          </>
        ))}
      />
      <P>
        Between now and any of those nights sit the holidays: school breaks, travel, tournaments and family visits. None of
        that stops a senior night from arriving on schedule, so everything that can be done early is worth doing early.
      </P>
      <Figure
        asset={["sn.sport.basketball.front", "sn.sport.wrestling.front"]}
        variant="card"
        caption="A basketball and a wrestling senior card in the gold Senior Night finish."
      />

      <H2>WHY THE PRINTED SET COMES FIRST.</H2>
      <P>Senior night has a date, so we plan backwards from it. These are our senior night clocks:</P>
      <Callout label="Senior night clocks">{SN_CLOCKS.join(" · ")}</Callout>
      <P>
        Count back from a night in late January and the printed-set mark lands soon after the break, when school, practice and
        travel all restart at once. So for a winter night, the printed set is best ordered before the break rather than after it.
        The free proof comes first and takes {PROOF_CLOCK}, and one revision is included, so ask for it a few days ahead of
        that mark. {CANON.seniorDateLine}
      </P>
      <P>
        The calculator on the <InlineLink href="/senior-night">senior night page</InlineLink> takes your date and shows what is
        still in time. If a printed set can no longer make it, the digital files still can: gift the digital first, print the
        gift note, and the printed set follows after the night.
      </P>

      <H2>WHAT EACH NIGHT LOOKS LIKE.</H2>
      <List
        items={WINTER.map(({ sport, facts }) => (
          <>
            <strong className="font-medium">{sportName(sport)}.</strong> {facts.ritual} More on{" "}
            <InlineLink href={seniorNightPath(sport.slug)}>{facts.head.phrase}</InlineLink>.
          </>
        ))}
      />
      <P>
        The walk itself is photographed on the night, after the card is made. That photo belongs on a poster later, not on the
        card, so the card is built from the season you already have on your phone.
      </P>

      <H2>THE PHOTO TRAP IN EACH SPORT.</H2>
      <List
        items={WINTER.map(({ sport, facts }) => (
          <>
            <strong className="font-medium">{sportName(sport)}.</strong> {photoTrap(facts)}
          </>
        ))}
      />
      <P>The rest of the list is the same in every sport:</P>
      <List items={INTAKE_COPY.photoMustHaves.slice(1).map((line) => `${line}.`)} />

      <H2>WHAT THE SENIOR EDITION CARRIES.</H2>
      <P>
        Every senior card carries {SHARED_BACK} The rest of the back belongs to the sport, with up to {word(MAX_STATS)} stat chips
        of your choosing:
      </P>
      <List
        items={WINTER.map(({ sport, facts }) => (
          <>
            <strong className="font-medium">{sportName(sport)}.</strong> {sportBack(facts)}. {backTail(facts)}
          </>
        ))}
      />
      <P>
        The same artwork comes as a poster for the wall and a banner for the gym, built from the same photos and shown on the
        same free proof. A printed banner keeps its own clock ({BANNER_CLOCK}), so ask for it with the first proof.
      </P>

      <H2>THE WHOLE SENIOR CLASS.</H2>
      <P>
        Ordering for every senior on the team? {TEAM_ANSWER} Write to{" "}
        <InlineLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</InlineLink>.
      </P>

      <PostCta context="senior-night" />
    </>
  ),
};
