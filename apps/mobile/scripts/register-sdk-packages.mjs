/**
 * Registers manually extracted Android SDK packages the way `sdkmanager` does after an
 * install, so Gradle (AGP) recognises them instead of trying to download them again:
 *
 * - writes `<package>/package.xml` from Google's repository manifest, and
 * - records acceptance of the licences those packages use in `<sdk>/licenses/`
 *   (a SHA-1 of the licence text, one file per licence — the standard mechanism).
 *
 * Running this ACCEPTS the Android SDK License Agreement for the listed packages.
 *
 *   node register-sdk-packages.mjs <sdk-root> <manifest.xml> <package> [<package>...]
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [sdkRoot, manifestPath, ...packages] = process.argv.slice(2);
if (!sdkRoot || !manifestPath || packages.length === 0) {
  console.error("Usage: node register-sdk-packages.mjs <sdk-root> <manifest.xml> <package>...");
  process.exit(1);
}

const manifest = readFileSync(manifestPath, "utf8");

// Reuse the manifest's namespace prefixes (sdk:, generic:, xsi:, …) for type-details.
const rootTag = /<sdk:sdk-repository\b[^>]*>/.exec(manifest)?.[0] ?? "";
const namespaces = [...rootTag.matchAll(/\sxmlns:([\w-]+)="([^"]+)"/g)]
  .filter(([, prefix]) => prefix !== "common")
  .map(([, prefix, uri]) => `xmlns:${prefix}="${uri}"`)
  .join(" ");
const commonNs =
  /xmlns:common="([^"]+)"/.exec(rootTag)?.[1] ??
  "http://schemas.android.com/repository/android/common/02";

function decodeXml(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function licenseBlock(id) {
  const match = new RegExp(`<license id="${id}" type="text">([\\s\\S]*?)</license>`).exec(manifest);
  if (!match) throw new Error(`Licence ${id} not found in manifest`);
  return { xml: match[0], text: decodeXml(match[1]) };
}

const acceptedLicenses = new Set();

for (const path of packages) {
  const start = manifest.indexOf(`<remotePackage path="${path}"`);
  if (start < 0) throw new Error(`Package ${path} not found in manifest`);
  const block = manifest.slice(start, manifest.indexOf("</remotePackage>", start));
  const inner = block
    .slice(block.indexOf(">") + 1)
    .replace(/<archives>[\s\S]*?<\/archives>/, "")
    .replace(/<channelRef[^>]*\/>/, "")
    .trim();
  const licenseId = /<uses-license ref="([^"]+)"/.exec(inner)?.[1];

  const packageDir = join(sdkRoot, ...path.split(";"));
  if (!existsSync(packageDir)) throw new Error(`Package directory missing: ${packageDir}`);

  const xml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<ns2:repository xmlns:ns2="${commonNs}" ${namespaces}>` +
    (licenseId ? licenseBlock(licenseId).xml : "") +
    `<localPackage path="${path}" obsolete="false">${inner}</localPackage>` +
    `</ns2:repository>\n`;
  writeFileSync(join(packageDir, "package.xml"), xml, "utf8");
  if (licenseId) acceptedLicenses.add(licenseId);
  console.log(`registered ${path}`);
}

// Licence acceptance: sdklib compares SHA-1(licence text, trimmed) with these files. The
// published hashes of earlier revisions of the same licences are recorded too, as
// `sdkmanager --licenses` leaves them on machines that accepted over time.
const knownHashes = {
  "android-sdk-license": [
    "24333f8a63b6825ea9c5514f83c2829b004d1fee",
    "d56f5187479451eabf01fb78af6dfcb131a6481e",
    "8933bad161af4178b1185d1a37fbf41ea5269c55",
  ],
  "android-sdk-preview-license": ["84831b9409646a918e30573bab4c9c91346d8abd"],
};
const licensesDir = join(sdkRoot, "licenses");
mkdirSync(licensesDir, { recursive: true });
for (const id of acceptedLicenses) {
  const hash = createHash("sha1").update(licenseBlock(id).text.trim(), "utf8").digest("hex");
  const file = join(licensesDir, id);
  const existing = existsSync(file) ? readFileSync(file, "utf8").split(/\s+/).filter(Boolean) : [];
  const hashes = [...new Set([...existing, hash, ...(knownHashes[id] ?? [])])];
  writeFileSync(file, hashes.join("\n") + "\n", "utf8");
  console.log(`accepted licence ${id} (${hash})`);
}
