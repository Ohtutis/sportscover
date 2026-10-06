// GET /api/version — which commit is live (SEO master plan §6 "expose the live version so automation can
// confirm what is deployed"). Vercel sets VERCEL_GIT_COMMIT_SHA at build time; locally it is "dev".
// .github/workflows/indexnow.yml polls this until the SHA it just pushed is the one serving, and only
// then pings IndexNow from the live sitemap. Under /api, so robots and X-Robots-Tag already keep it out
// of every index. No request data is read, nothing is logged.
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    { sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev", ref: process.env.VERCEL_GIT_COMMIT_REF ?? "", env: process.env.VERCEL_ENV ?? "local" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
