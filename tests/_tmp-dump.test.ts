import { describe, it } from "vitest";
import fs from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import PostersPage from "../app/(marketing)/posters/page";
import TradingCardsPage from "../app/(marketing)/trading-cards/page";
import CompleteSetPage from "../app/(marketing)/complete-set/page";
const OUT = "/private/tmp/claude-501/-Users-a-Documents-sportscover/2c3e6f8f-4fee-441d-a94e-11a352990faa/scratchpad";
describe("dump", () => {
  it("writes the three family pages", async () => {
    const sp = Promise.resolve({});
    for (const [name, Page] of [["posters", PostersPage], ["trading-cards", TradingCardsPage], ["complete-set", CompleteSetPage]] as const) {
      const el = (await Page({ searchParams: sp })) as ReactElement;
      fs.writeFileSync(`${OUT}/after_${name}.html`, renderToStaticMarkup(el));
    }
  });
});
