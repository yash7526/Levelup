// @ts-check
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import turbo from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

export const ignores = [
  "**/node_modules/**",
  "**/dist/**",
  "**/.next/**",
  "**/.turbo/**",
  "**/coverage/**",
  "**/next-env.d.ts",
];

/**
 * Base config for every LevelUp workspace: JS + type-aware TypeScript rules,
 * Turborepo env-var checks and Prettier compatibility (formatting is Prettier's job).
 *
 * @param {{ tsconfigRootDir: string }} options
 */
export function createBaseConfig({ tsconfigRootDir }) {
  return defineConfig(
    { ignores },
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      plugins: { turbo },
      rules: {
        "turbo/no-undeclared-env-vars": "error",
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { prefer: "type-imports", fixStyle: "inline-type-imports" },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
        ],
        "@typescript-eslint/no-misused-promises": [
          "error",
          { checksVoidReturn: { attributes: false } },
        ],
        eqeqeq: ["error", "smart"],
        "no-console": ["warn", { allow: ["warn", "error"] }],
      },
    },
    {
      // Plain JS config files are not part of a TS project.
      files: ["**/*.{js,mjs,cjs}"],
      extends: [tseslint.configs.disableTypeChecked],
    },
    prettier,
  );
}
