/**
 * Builds a standalone, sideloadable release APK of LevelUp — no Play Store, Expo Go or
 * dev server needed. The JavaScript bundle (Hermes bytecode) is embedded in the APK.
 *
 *   pnpm --filter @levelup/mobile build:apk          # 64-bit ARM phones (default)
 *   pnpm --filter @levelup/mobile build:apk --all    # every ABI (incl. 32-bit and emulators)
 *
 * Toolchain: uses JAVA_HOME / ANDROID_HOME if set, otherwise the portable toolchain from
 * scripts/setup-android-toolchain.ps1 (%LOCALAPPDATA%\LevelUp\android-toolchain).
 *
 * Signing: release builds are signed with the project's debug keystore, which is fine for
 * manual testing (and lets new builds install over old ones). Use a real upload key for
 * store releases.
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { delimiter, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const allAbis = process.argv.includes("--all");
const abis = allAbis ? "armeabi-v7a,arm64-v8a,x86,x86_64" : "arm64-v8a";

const toolchain =
  process.env.LEVELUP_ANDROID_TOOLCHAIN ??
  join(
    process.env.LOCALAPPDATA ?? join(homedir(), ".local", "share"),
    "LevelUp",
    "android-toolchain",
  );
const pick = (envValue, fallback) => envValue || (existsSync(fallback) ? fallback : undefined);
const javaHome = pick(process.env.JAVA_HOME, join(toolchain, "jdk-17"));
const androidHome = pick(
  process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT,
  join(toolchain, "sdk"),
);

if (!javaHome || !androidHome) {
  console.error(
    "Android toolchain not found. Set JAVA_HOME and ANDROID_HOME, or run:\n" +
      "  powershell -ExecutionPolicy Bypass -File apps/mobile/scripts/setup-android-toolchain.ps1",
  );
  process.exit(1);
}

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  PATH: [join(javaHome, "bin"), join(androidHome, "platform-tools"), process.env.PATH].join(
    delimiter,
  ),
  NODE_ENV: "production",
  // Test builds can preview the clearly labelled sample data. Override with "false".
  EXPO_PUBLIC_ENABLE_DEMO_DATA: process.env.EXPO_PUBLIC_ENABLE_DEMO_DATA ?? "true",
};

function run(command, args, cwd, extraEnv = {}) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  // .bat files (gradlew.bat) must run through the shell on Windows; pass them as one
  // command line (our arguments contain no spaces or shell metacharacters).
  const viaShell = process.platform === "win32" && /\.bat"?$/.test(command);
  const options = { cwd, env: { ...env, ...extraEnv }, stdio: "inherit", shell: viaShell };
  const result = viaShell
    ? spawnSync([command, ...args].join(" "), options)
    : spawnSync(command, args, options);
  if (result.status !== 0) {
    console.error(`\nFailed: ${command} (exit ${result.status ?? result.signal})`);
    process.exit(result.status ?? 1);
  }
}

// 1. Generate (or refresh) the native Android project from app.json. It is git-ignored:
//    app.json and config plugins are the source of truth (Continuous Native Generation).
run(
  process.execPath,
  [
    // Resolved like Node would, so it works with nested or hoisted node_modules.
    join(
      dirname(createRequire(join(appDir, "package.json")).resolve("expo/package.json")),
      "bin",
      "cli",
    ),
    "prebuild",
    "--platform",
    "android",
    "--no-install",
  ],
  appDir,
  { CI: "1" },
);

// 2. Point Gradle at the SDK.
const androidDir = join(appDir, "android");
writeFileSync(join(androidDir, "local.properties"), `sdk.dir=${androidHome.replace(/\\/g, "/")}\n`);

// 3. Compile the release APK. Workers are capped to keep memory use reasonable.
// Full path: hardened Windows setups (NoDefaultCurrentDirectoryInExePath) don't run
// programs from the current folder by bare name.
const gradlew =
  process.platform === "win32"
    ? `"${join(androidDir, "gradlew.bat")}"`
    : join(androidDir, "gradlew");
run(
  gradlew,
  ["assembleRelease", `-PreactNativeArchitectures=${abis}`, "--max-workers=4"],
  androidDir,
);

// 4. Copy it somewhere obvious with a descriptive name.
const { version } = JSON.parse(readFileSync(join(appDir, "app.json"), "utf8")).expo;
const built = join(androidDir, "app", "build", "outputs", "apk", "release", "app-release.apk");
const outDir = join(appDir, "dist");
mkdirSync(outDir, { recursive: true });
const output = join(outDir, `LevelUp-${version}-${allAbis ? "universal" : "arm64"}.apk`);
copyFileSync(built, output);

const sizeMb = (statSync(output).size / 1024 / 1024).toFixed(1);
console.log(`\nAPK ready (${sizeMb} MB): ${relative(process.cwd(), output) || output}`);
console.log("Copy it to an Android phone and tap it to install (allow 'Install unknown apps').");
