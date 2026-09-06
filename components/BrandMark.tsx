import Image from "next/image";
import Link from "next/link";
import { BRAND } from "../lib/site";

/** The GDE mark is always a FILE (silver shield + wordmark), never text set in a font. */
export function BrandMark({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link className="brand" href={href} aria-label={`${BRAND} home`}>
      <Image className="brand-shield" src="/brand/shield.png" alt="" width={36} height={36} priority />
      <Image className="brand-wordmark" src={light ? "/brand/wordmark-white.png" : "/brand/wordmark-navy.png"} alt={BRAND} width={168} height={60} priority />
    </Link>
  );
}
