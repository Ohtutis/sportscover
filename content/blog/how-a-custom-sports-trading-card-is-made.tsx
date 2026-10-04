// The six checks of /how-it-works (COPY §2.6 gates) in plain words, then the free watermarked proof,
// the one revision and the approval (C20, INTAKE_COPY). The effort line and the rejected-take line are
// the page's own; the AI line is C15. Nothing here is a new claim.
import { Callout, Figure, H2, InlineLink, Lead, P, PostCta } from "../../components/blog";
import { CANON } from "../../lib/copy/canon";
import { PROOF_CLOCK } from "../../lib/intake/copy";
import type { BlogPost } from "../../lib/blog";

export const post: BlogPost = {
  slug: "how-a-custom-sports-trading-card-is-made",
  title: "How a Custom Sports Trading Card Is Made",
  h1: "HOW A CUSTOM CARD IS MADE.",
  description:
    "Six checks stand between your photos and the print: photo check, uniform, reference set, four shots, verification, and a free watermarked proof.",
  category: "Trading Card Gift Ideas",
  primaryPage: "/how-it-works",
  publishedAt: "2026-10-04",
  readingMinutes: 3,
  image: "how.gate.plate",
  body: () => (
    <>
      <Lead>
        A custom trading card starts as a handful of phone photos and ends as a proof you approve. Six checks stand between the
        two — the same six on <InlineLink href="/how-it-works">how it's made</InlineLink>. Each one makes something you
        can look at, and each one can say no. Here they are in plain words, starting with the photos the{" "}
        <InlineLink href="/photo-guide">photo guide</InlineLink> asks for.
      </Lead>
      <P>
        Do we use AI? Yes, as a tool. AI imaging tools are part of the process, and every composition, likeness, spelling, color
        and detail is reviewed and finished by a person before you see the proof.
      </P>

      <H2>BEFORE A SINGLE POSE.</H2>
      <P>
        <strong className="font-medium">1. The photo check.</strong> We look at every photo you sent and tell you, in plain words,
        which ones can carry the likeness and what would fix the rest. The reasons are things you can act on — a photo with four
        people and no clear subject, eyes hidden behind a visor, every photo facing the camera square on.
      </P>
      <P>
        <strong className="font-medium">2. The uniform.</strong> The kit belongs to the sport, not to the person: shirt, shorts,
        socks, footwear and your crest, copied from your photos exactly as they are. Nothing on the kit is invented. A uniform we
        rebuilt once came back with a league shield where the club crest had been; it never left the studio, and that is what
        this check is for.
      </P>
      <P>
        <strong className="font-medium">3. The reference set.</strong> From your photos we build one reference of your athlete —
        front and both sides — and settle it before a single pose is made. That reference is the anchor: every later shot is
        measured against it.
      </P>
      <Figure
        asset="how.gate.plate"
        variant="artefact"
        caption="A reference set: front and both sides, built from the athlete's photos before any pose is made."
      />

      <H2>THE SHOTS, AND THE CHECK ON THEM.</H2>
      <P>
        <strong className="font-medium">4. Four shots.</strong> From the approved reference come four shots — a hero, two action
        shots and a back or celebration shot. Hands are asked for, not fixed afterwards: every pose asks for five separated
        fingers doing something real. When a shot is right except for one detail, that one detail is changed and nothing else
        moves.
      </P>
      <P>
        <strong className="font-medium">5. Verification.</strong> Every shot goes next to the reference in one picture. Every
        crest, number and mark on the shot must have a twin on the reference, and the face must measure as the same person. No
        scores are shown to anyone: a shot passes or it doesn't, and one that doesn't never reaches the finish. The
        measurement exists only to check likeness for your order, is never shared, and is destroyed when the order closes.
      </P>
      <Figure
        asset="how.gate.verification"
        variant="artefact"
        caption="A shot beside its reference: every crest, number and mark on the shot needs a twin."
      />

      <H2>THE FINISH AND THE PROOF.</H2>
      <P>
        <strong className="font-medium">6. The finish.</strong> Everything is then built around the shots — the type, the
        material, your team colors — in one of six finishes, each with its own materials and mood, from a floodlit stadium at night to
        high-contrast chrome, or the gold Senior Night edition.
      </P>
      <P>
        Then a watermarked proof comes to you by email, within {PROOF_CLOCK}, and it is free: you see it before you pay
        anything, and you pay only after you approve. {CANON.proofChecklist} One revision is included.
      </P>
      <P>
        Approve, and the files are released; for printed pieces, printing starts that moment. Printed cards are square-cut,
        UV-coated, 2.5 × 3.5 in, made by a professional photo lab in the US, and every shipped package carries a free printed
        Certificate of Authenticity. {CANON.registeredIdLine} Scanning its QR code opens the card's own page — the
        edition, the stats and the season — and the ID can be typed into the <InlineLink href="/registry">registry</InlineLink>{" "}
        any time.
      </P>

      <H2>WHY SO MANY CHECKS.</H2>
      <P>
        About fifty images are made for one athlete. Four ship. The rest are the ones we throw away — the uniform that changed
        between shots, the shot that drifted away from the reference — and they are the reason{" "}
        <InlineLink href="/guarantee">our promise</InlineLink> can say what it says.
      </P>
      <Callout label="The rule we keep">
        A rejection is never fixed by lowering the bar. We fix what went in, or we ask you for a better photo.
      </Callout>

      <PostCta />
    </>
  ),
};
