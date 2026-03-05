import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended", ...tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-undef": "warn",
      "prefer-const": "error",
      "no-console": "warn",
    },
  },
  {
    ignores: [
      "node_modules",
      "dist",
      "eslint.config.mjs",
      "commitlint.config.mjs",
    ],
  },
]);
