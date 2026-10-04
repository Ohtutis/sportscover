import { defineConfig } from "vitest/config";

export default defineConfig({
  // `node_modules` is a symlink (to `deps.nosync/node_modules`, which iCloud never syncs or evicts) on the owner's
  // Mac. Without this, Vite resolves next/image through the real path, stops treating it as a
  // dependency, and every render test fails with "Element type is invalid". No effect on CI.
  resolve: { preserveSymlinks: true },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
