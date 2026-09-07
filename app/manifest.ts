import type { MetadataRoute } from "next";
import { BRAND } from "../lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND,
    short_name: "GDE",
    description: "Custom sports trading cards and posters built from the photos you already have — one athlete, one registered edition.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F3EF",
    theme_color: "#F4F3EF",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
