/**
 * Regenerates `generated/tokens.css` from the TypeScript tokens.
 * The output is committed so the web app (and editor tooling) work without a build
 * step; a unit test fails if it ever drifts from the source.
 *
 *   pnpm --filter @levelup/tokens generate
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createTokenStylesheet } from "../src/css";

const outFile = resolve(dirname(fileURLToPath(import.meta.url)), "../generated/tokens.css");

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, createTokenStylesheet(), "utf8");

console.warn(`@levelup/tokens → ${outFile}`);
