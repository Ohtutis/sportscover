import Image from "next/image";
import { ALT_FOUNDER } from "../lib/alt";
import { BRAND, founderPhotoExists, OWNER_CITY, OWNER_NAME } from "../lib/site";

/**
 * The founder note (COPY §2.1-11, §2.9-1; DESIGN §4.22): the only italic on the site, first person,
 * signed John Birch. `home` = the two paragraphs, `about` = the one, `signature` = the cite line
 * alone (the /guarantee sign-off). The photo renders only when public/brand/founder.jpg exists —
 * never generated, no reserved slot. The city segment is omitted until the owner supplies it.
 */
export const FOUNDER_PARAGRAPHS = {
  observation:
    "Game Day Edition started with a simple observation: kids who love their sport end up with hundreds of photos on a phone and nothing on their wall.",
  everything:
    "I put everything I know — design and the AI process behind it — into one thing: making a kid look and feel the way they would after a professional photoshoot, on their own card and poster. A gift nobody else has.",
} as const;

export interface FounderNoteProps {
  variant: "home" | "about" | "signature";
  city?: string;
  className?: string;
}

export function FounderNote({ variant, city = OWNER_CITY, className = "" }: FounderNoteProps) {
  const paragraphs = variant === "home" ? [FOUNDER_PARAGRAPHS.observation, FOUNDER_PARAGRAPHS.everything] : variant === "about" ? [FOUNDER_PARAGRAPHS.everything] : [];
  const photo = founderPhotoExists();
  const signature = (
    <span className="flex items-center gap-3">
      {photo ? <Image src="/brand/founder.jpg" alt={ALT_FOUNDER} width={64} height={64} className="size-16 rounded-full object-cover" /> : null}
      <cite className="font-body not-italic text-ink">
        <span className="font-bold">{OWNER_NAME}</span> · {BRAND}
        {city ? ` · ${city}` : ""}
      </cite>
    </span>
  );
  if (variant === "signature") return <p className={`mt-4 ${className}`.trim()}>{signature}</p>;
  return (
    <figure className={`max-w-[52ch] border-t border-hairline pt-6 ${className}`.trim()}>
      <blockquote className="space-y-4">
        {paragraphs.map((p) => (
          <p key={p} className="font-body text-[1.125rem] italic leading-[1.55] text-pretty text-ink">
            {p}
          </p>
        ))}
      </blockquote>
      <figcaption className="mt-5">{signature}</figcaption>
    </figure>
  );
}
