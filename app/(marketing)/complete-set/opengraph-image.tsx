import { FILE_COUNTS } from "../../../lib/catalog/tiers";
import { OG_CONTENT_TYPE, OG_SIZE } from "../../../lib/og";
import { familyOgImage } from "../(families)/_shared/og";

/** The /complete-set share card: the poster and both card faces, and the counted file total. */
export const alt = "Game Day Edition — the complete edition: poster, trading card front and back";
// Revalidated hourly like the pages it shares, so a ladder change reaches the share card without a deploy.
export const revalidate = 3600;

export const size = { width: OG_SIZE.width, height: OG_SIZE.height };
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return familyOgImage({
    family: "set",
    title: "Sports Poster and Trading Card Set",
    subtitle: `${FILE_COUNTS.set} files and one live page. Counted, not implied.`,
    objects: "set",
  });
}
