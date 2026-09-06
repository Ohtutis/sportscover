import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import next from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "dist/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Site lint only — the art/marketing/etsy tooling is excluded from tsconfig as well and
    // traversing art-pipeline/out (thousands of files) makes `eslint .` take minutes.
    "art-pipeline/**",
    "marketing/**",
    "etsy/**",
    "card-flip/**",
    "print-sources/**",
    "exports/**",
    "orders/**",
    "work/**",
    "examples/**",
    "public/**",
    "Exportai Etsy/**",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  next.configs["core-web-vitals"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "jsx-a11y/img-redundant-alt": "off",
      // Long-form prose (terms, privacy, FAQ) uses plain apostrophes; React escapes them anyway.
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
