import Link from "next/link";
import { BrandMark } from "../components/BrandMark";

export default function NotFound() {
  return (
    <main className="legal-page">
      <header><BrandMark /><Link className="outline-button" href="/">Back to site</Link></header>
      <article>
        <span className="eyebrow">NOT FOUND</span>
        <h1>That page does not exist.</h1>
        <p className="legal-intro">Scanned a card? Check the ID on the back of the card or on the certificate — it reads GDE-XX-XXX-YYYY-NN. Mind O versus 0 and I versus 1.</p>
        <p><Link href="/registry">Look up a card</Link> · <Link href="/">Home</Link></p>
      </article>
    </main>
  );
}
