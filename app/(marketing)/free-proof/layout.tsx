import type { ReactNode } from "react";
import { MetaPixel } from "../../../components/MetaPixel";

// The ONE place the Meta pixel is mounted (D29 / D19): /free-proof and /free-proof/thanks, nothing
// else. It renders nothing and loads nothing until NEXT_PUBLIC_META_PIXEL_ID is set at build time.
export default function FreeProofLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <MetaPixel />
      {children}
    </>
  );
}
