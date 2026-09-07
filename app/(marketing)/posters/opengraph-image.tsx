import { OG_CONTENT_TYPE, OG_SIZE } from "../../../lib/og";
import { familyOgImage } from "../(families)/_shared/og";

/** The /posters share card: the two print sizes at their true proportion, and the ladder's lowest price. */
export const alt = "Game Day Edition — custom sports posters from your photos, in two print sizes";
// The share card prints a price, so it must age out with the pages (SALE_EXPIRES_AT).
export const revalidate = 3600;

export const size = { width: OG_SIZE.width, height: OG_SIZE.height };
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return familyOgImage({
    family: "posters",
    title: "Custom Sports Posters From Your Photos",
    subtitle: "The poster is art for the wall; the stats live on the card.",
    objects: "poster",
  });
}
