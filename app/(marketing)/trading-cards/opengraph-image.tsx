import { OG_CONTENT_TYPE, OG_SIZE } from "../../../lib/og";
import { familyOgImage } from "../(families)/_shared/og";

/** The /trading-cards share card (CONTRACTS §5.3): the two faces as measured objects and the ladder's lowest price. */
export const alt = "Game Day Edition — custom trading cards from your photos, front and back";
// The share card prints a price, so it must age out with the pages (SALE_EXPIRES_AT).
export const revalidate = 3600;

export const size = { width: OG_SIZE.width, height: OG_SIZE.height };
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return familyOgImage({
    family: "cards",
    title: "Custom Trading Cards From Your Photos",
    subtitle: "Front and back, with a registered card ID on the back.",
    objects: "cards",
  });
}
