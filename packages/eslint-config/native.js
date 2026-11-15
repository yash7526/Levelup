// @ts-check
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import { createBaseConfig } from "./base.js";

/**
 * Config for React Native / Expo apps: the LevelUp base plus React Hooks rules.
 *
 * @param {{ tsconfigRootDir: string }} options
 */
export function createNativeConfig({ tsconfigRootDir }) {
  return defineConfig(
    { ignores: ["**/.expo/**", "**/android/**", "**/ios/**", "**/web-build/**"] },
    createBaseConfig({ tsconfigRootDir }),
    reactHooks.configs.flat["recommended-latest"] ?? reactHooks.configs.flat.recommended,
    {
      // Metro, Babel and Expo config plugins load these as CommonJS in Node.
      files: ["*.config.js", "*.config.cjs", "plugins/**/*.js"],
      languageOptions: { sourceType: "commonjs", globals: globals.node },
      rules: { "@typescript-eslint/no-require-imports": "off" },
    },
    {
      files: ["*.config.mjs"],
      languageOptions: { globals: globals.node },
    },
    {
      // Local tooling (APK builds, toolchain setup) — Node programs, not Turbo tasks.
      files: ["scripts/**/*.{js,mjs}"],
      languageOptions: { globals: globals.node },
      rules: { "turbo/no-undeclared-env-vars": "off", "no-console": "off" },
    },
  );
}
