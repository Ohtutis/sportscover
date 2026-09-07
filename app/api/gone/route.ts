// 410 Gone for a removed card page (CONTRACTS §6.2, COPY §2.13).
//
// A page component can only produce 404 and `redirects()` refuses non-3xx codes, so
// `next.config.ts` rewrites each deleted card path here (`rewrites().beforeFiles`) and this handler
// answers with the branded body and the real status code. The document is self-contained — it is
// served under /c/<id>, outside the app shell, so it carries its own type and colours and links
// nowhere but the registry. No name, no art, nothing about who asked for the removal.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Not exported: Next type-checks a route file's exports. The test asserts against the response body.
const GONE_COPY = {
  title: "THIS CARD PAGE HAS BEEN REMOVED.",
  body: "The page was removed at the request of the edition's owner. The card itself is still a registered Game Day Edition.",
  link: "Look up a card",
} as const;

const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Card page removed | Game Day Edition</title>
<style>
  :root { color-scheme: dark }
  body { margin: 0; background: #080C12; color: #FFFFFF; font: 400 1.0625rem/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif }
  main { max-width: 40rem; margin: 0 auto; padding: 4rem 1.25rem }
  h1 { font-size: clamp(2rem, 1.4rem + 2vw, 2.75rem); line-height: 0.98; text-transform: uppercase; letter-spacing: 0.01em; margin: 0 0 1.5rem }
  p { color: #AEB6C2; margin: 0 0 2rem }
  a { display: inline-flex; align-items: center; min-height: 3rem; padding: 0 1.5rem; border: 1.5px solid rgba(255,255,255,0.4); border-radius: 6px; color: #FFFFFF; text-decoration: none; text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.9375rem }
  a:hover { background: rgba(255,255,255,0.1) }
  a:focus-visible { outline: 2px solid #FF6B2B; outline-offset: 2px }
</style>
</head>
<body>
<main>
<h1>${GONE_COPY.title}</h1>
<p>${GONE_COPY.body}</p>
<a href="/registry">${GONE_COPY.link}</a>
</main>
</body>
</html>
`;

export async function GET(): Promise<NextResponse> {
  return new NextResponse(HTML, {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
