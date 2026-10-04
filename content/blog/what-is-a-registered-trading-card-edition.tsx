// The registered edition explained (spec §4.11, COPY §2.9 "A card without a record", FAQ 32–36, C8):
// the ID on the back, the QR, the card's own page, what the registry keeps and never keeps, and the
// five-year pledge. The example page is the roster's demo edition (C18 says so in the text).
import { Callout, Figure, H2, InlineLink, Lead, P, PostCta } from "../../components/blog";
import { CANON } from "../../lib/copy/canon";
import type { BlogPost } from "../../lib/blog";
import { SUPPORT_EMAIL } from "../../lib/site";

/** The roster's demo edition — a fictional athlete; its page is public on purpose (lib/registry/cards.ts). */
const DEMO_CARD_ID = "GDE-SN-BKB-2026-12";

export const post: BlogPost = {
  slug: "what-is-a-registered-trading-card-edition",
  title: "What Is a Registered Trading Card Edition",
  h1: "WHAT A REGISTERED EDITION IS.",
  description:
    "Every card carries a registered card ID and a QR code that opens its own page. What the registry keeps, what it never keeps, and for how long.",
  category: "Trading Card Gift Ideas",
  primaryPage: "/registry",
  publishedAt: "2026-10-04",
  readingMinutes: 3,
  image: "cards.demo.back",
  body: () => (
    <>
      <Lead>
        Turn over one of our cards and you will find a short line of letters and numbers beside a QR code. That line is the
        card's registered ID, and it is what makes the card an edition rather than a photo print. Type any ID into the{" "}
        <InlineLink href="/registry">registry</InlineLink> and the card's page opens; everything that happens before the ID
        is printed is on <InlineLink href="/how-it-works">how it's made</InlineLink>.
      </Lead>

      <H2>A CARD WITHOUT A RECORD IS A PHOTO PRINT.</H2>
      <P>
        A trading card is a claim: this player, this season, this edition. A photo print makes no claim — it is just a nice
        picture. That is why every card we make carries its registered card ID on the back and opens its own page: the edition,
        the finish, the season, the stats and the date it was registered.
      </P>
      <P>
        The rule behind it is simple: one registered edition per athlete, per finish, per season. There is no serial count on the
        printed cards themselves — the record is the registration. "Registered" means our own edition registry, not a
        copyright registration.
      </P>
      <Figure
        asset="cards.demo.back"
        variant="card"
        caption="The back of a card: the season, the stats, and the registered card ID beside the QR code."
      />

      <H2>HOW TO READ THE ID.</H2>
      <P>
        The ID reads GDE-XX-XXX-YYYY-NN: our mark, then the style, the sport, the season and a two-digit number. In {DEMO_CARD_ID}, SN is the Stadium Night finish, BKB is basketball and 2026 is the season.
      </P>
      <P>
        Because the rule is one edition per athlete, per finish, per season, a second finish for the same season is a second
        edition with its own ID. On a Senior Night card the ID sits beside SENIOR EDITION · 1 OF 1.
      </P>
      <P>
        The same ID is printed on the certificate. If a QR code ever opens a page that says no card is registered, check the ID
        on the back of the card or on the certificate — mind O versus 0 and I versus 1.
      </P>

      <H2>WHAT THE QR CODE OPENS.</H2>
      <P>
        Scanning the QR code opens the card's page here. It shows the card turning over, front then back; the stats as
        the card prints them; and the edition record — the ID and the date it was registered — with one line on how the art
        was made: "{CANON.aiActLine}" Once the files are ready, the card front, the back and the flip video can be downloaded
        from the same page.
      </P>
      <P>
        A customer's page is unlisted unless you choose to make it public: it opens only from the card's QR code or
        its exact ID, and search engines are asked not to index it.
      </P>
      <P>
        You can open one right now: <InlineLink href={`/c/${DEMO_CARD_ID}`}>an example card page</InlineLink>.{" "}
        {CANON.galleryCaptionShort}
      </P>

      <H2>WHAT THE REGISTRY KEEPS.</H2>
      <P>
        Only what is printed on the card — the name as it appears, the team, the sport, the season, the finish and the stats you
        chose to print. Never the photos, never a home address, never a birthday. We never ask for a date of birth or a school
        name in the first place.
      </P>
      <P>
        Want the page public, or taken down? Email <InlineLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</InlineLink> from
        the purchase address with the order number and the card ID. Takedowns are done within 48 hours; other changes within 30
        days.
      </P>

      <H2>HOW LONG IT LASTS.</H2>
      <P>
        At least five years from the order. If the studio ever winds down, we keep the registry resolving for that period or tell
        you how to keep a copy. The domain is protected against transfer and renews on its own. The finished artwork is kept
        for 12 months so reprints stay possible; the record itself outlasts it.
      </P>
      <Callout label="Why it matters">
        A kid who scans the card in 2031 should see what their parent saw in 2026.
      </Callout>
      <P>
        Printed cards ship with a free printed Certificate of Authenticity carrying the same ID, and the digital card files
        include the certificate too — so the record travels with the card, on paper and online.
      </P>

      <PostCta context="cards" />
    </>
  ),
};
