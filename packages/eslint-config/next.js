// @ts-check
import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

import { createBaseConfig } from "./base.js";

/**
 * Config for Next.js apps: the LevelUp base plus Next.js, React, React Hooks
 * and jsx-a11y rules from `eslint-config-next`.
 *
 * @param {{ tsconfigRootDir: string }} options
 */
export function createNextConfig({ tsconfigRootDir }) {
  return defineConfig(nextCoreWebVitals, createBaseConfig({ tsconfigRootDir }), {
    rules: {
      "react/self-closing-comp": "error",
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
    },
  });
}
