// Poster or cards (spec §8 intent split: /posters = wall art, /trading-cards = the card, /complete-set =
// both). Poster = art, the stats live on the card (PRODUCTS, the /posters row); the card spec is FAQ 02
// and C8; the set's contents are FAQ 06 with FILE_COUNTS; "who it is for" is /about's own list; the
// numberless sports are C9. No prices — "priced as a set" is INTAKE_COPY's sentence, not a number.
import { Figure, H2, InlineLink, Lead, List, P, PostCta } from "../../components/blog";
import { FILE_COUNTS } from "../../lib/catalog/tiers";
import { CANON } from "../../lib/copy/canon";
import type { BlogPost } from "../../lib/blog";

export const post: BlogPost = {
  slug: "custom-sports-poster-or-trading-cards-which-to-choose",
  title: "Custom Sports Poster or Trading Cards?",
  h1: "POSTER OR CARDS? HOW TO CHOOSE.",
  description:
    "A poster is art for the wall; the cards carry the stats and the registry. Who each one suits, what each includes, and when the complete set is the answer.",
  category: "Custom Sports Posters",
  primaryPage: "/complete-set",
  publishedAt: "2026-10-04",
  readingMinutes: 3,
  image: "life.set.printed",
  body: () => (
    <>
      <Lead>
        A custom poster and a set of trading cards start from the same photos and the same artwork, so the choice is not about
        quality. It is about where the gift will live: a poster lives on a wall; cards live in a hand, a binder, a backpack. The{" "}
        <InlineLink href="/complete-set">complete set</InlineLink> is both, from one proof — and{" "}
        <InlineLink href="/how-it-works">how it's made</InlineLink> is the same six checks for all three.
      </Lead>

      <H2>THE POSTER IS ART FOR THE WALL.</H2>
      <P>
        A poster is art first, with very little text: the athlete, composed in one of six finishes or the gold Senior Night
        edition, built for one person. The stats and the class year live on the card, not on the wall.
      </P>
      <P>
        It comes in two sizes. 18 × 24 sits above a desk or dresser; 24 × 36 holds a wall on its own. Printed posters are matte,
        189 g/m², shipped free in the US with a printed certificate. The digital files carry both sizes at 300 DPI, plus phone and
        desktop wallpapers, so a printed 18 × 24 can be printed again larger later.
      </P>
      <P>
        A poster suits a bedroom wall, a dorm room, and the grandparents who want something for the wall that is not a school
        portrait. More on <InlineLink href="/posters">custom sports posters</InlineLink>.
      </P>

      <H2>THE CARDS CARRY THE RECORD.</H2>
      <P>
        Cards are what an athlete holds: front and back, square-cut, UV-coated, 2.5 × 3.5 in, printed by a professional photo lab
        in the US. The back carries the season — the team, the position, the stats you choose — and the registered card ID beside
        a QR code that opens the card's own page.
      </P>
      <P>
        Printed cards come 12 or 24 to an order — 24 is enough for the team and the family — with every digital file: the front,
        the back, the certificate, the card flip video and the registry page. The flip video is the card turning over, front to
        back; the registry page is where the QR code on the back leads.
      </P>
      <P>{CANON.numberlessLine}</P>
      <P>
        Cards suit first-year players and last-year players, an athlete who wants something to hand out, and anyone who keeps a
        binder. More on <InlineLink href="/trading-cards">custom trading cards</InlineLink>.
      </P>
      <Figure asset="life.card.hand" caption="A card in the gym, held up by the athlete it was made for." />

      <H2>THE SET IS BOTH.</H2>
      <P>
        The complete set is the poster and the cards together, from one proof: {FILE_COUNTS.set} files and one live page — the
        poster in two sizes, the card front and back, the certificate, nine social posts, seven wallpapers, the bonus die-cuts,
        the flip video, and the card's registered page. Printed sets add the printed cards, poster and certificate, and cards
        and a poster together are priced as a set.
      </P>
      <P>
        The printed pieces come from two partners — the cards from the photo lab in California, the poster from the poster partner
        in North Carolina — so they usually arrive on different days. Both are tracked.
      </P>
      <Figure asset="life.set.printed" caption="A printed set: the poster, the tube it ships in, and a fan of cards." />

      <H2>THE SAME CHOICES EITHER WAY.</H2>
      <P>
        Whichever you choose, the rest of the decisions are the same. There is one style per edition — six finishes, each with
        its own materials and mood, from a floodlit stadium at night to high-contrast chrome, or the gold Senior Night edition —
        so on a set the poster and the card share it. Both start as digital files you can print anywhere, or arrive printed and
        shipped free in the US. And both are for adults who still compete, as much as for a first season.
      </P>

      <H2>A QUICK WAY TO DECIDE.</H2>
      <List
        items={[
          "It is for a wall: the poster.",
          "It is for them to hold, keep and hand out: the cards.",
          "It is for senior night, a birthday or the end of a season: the set — something to hang and something to keep.",
          "Still deciding: ask for both on the free proof. You see them before you pay anything.",
        ]}
      />

      <PostCta context="set" />
    </>
  ),
};
