/**
 * Segmented parallel downloader for large toolchain archives. Many CDNs throttle each
 * connection, so fetching byte ranges concurrently is several times faster on slow links.
 *
 *   node fast-download.mjs <url> <output-file> [connections=8] [sha1:<hex>|sha256:<hex>]
 *
 * - Requests uncompressed bytes (`Accept-Encoding: identity`). Some CDNs (e.g. Google's)
 *   otherwise gzip responses and report the compressed length, which silently truncates
 *   ranged downloads.
 * - Resumable: segments are kept on disk, and an existing shorter file is treated as a
 *   valid prefix, so only the missing bytes are fetched.
 * - Verifies the checksum when one is given; a mismatching file is deleted, never kept.
 */
import { createHash } from "node:crypto";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { open } from "node:fs/promises";
import { dirname } from "node:path";

const [url, output, connectionsArg = "8", checksum] = process.argv.slice(2);
if (!url || !output) {
  console.error("Usage: node fast-download.mjs <url> <output-file> [connections] [sha1:<hex>]");
  process.exit(1);
}

const IDENTITY = { "Accept-Encoding": "identity" };
const connections = Math.max(1, Number(connectionsArg));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
mkdirSync(dirname(output), { recursive: true });

async function withRetry(label, task, attempts = 8) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= attempts) throw error;
      console.warn(`  retrying ${label} (${error.cause?.code ?? error.message})`);
      await sleep(2000 * attempt);
    }
  }
}

async function verify(file) {
  if (!checksum) return true;
  const [algorithm, expected] = checksum.split(":");
  const hash = createHash(algorithm);
  await new Promise((resolve, reject) =>
    createReadStream(file)
      .on("data", (d) => hash.update(d))
      .on("end", resolve)
      .on("error", reject),
  );
  return hash.digest("hex") === expected.toLowerCase();
}

// Resolve redirects and the real (uncompressed) size.
const head = await withRetry("HEAD", async () => {
  const response = await fetch(url, { method: "HEAD", redirect: "follow", headers: IDENTITY });
  if (!response.ok) throw new Error(`HEAD ${url} -> ${response.status}`);
  return response;
});
const finalUrl = head.url;
const total = Number(head.headers.get("content-length"));
const ranged = head.headers.get("accept-ranges") === "bytes" && total > 0;

// Reuse what's already on disk: a complete file, or a valid prefix of it.
let prefix = 0;
if (existsSync(output)) {
  const size = statSync(output).size;
  if (size === total && (await verify(output))) {
    console.log(`cached: ${output}`);
    process.exit(0);
  }
  if (ranged && size < total) {
    prefix = size;
    renameSync(output, `${output}.partial`);
    console.log(`  resuming ${output} from ${(prefix / 1048576).toFixed(1)} MB`);
  } else {
    rmSync(output);
  }
} else if (existsSync(`${output}.partial`) && ranged) {
  prefix = statSync(`${output}.partial`).size;
}

const partsDir = `${output}.parts-${prefix}`;
mkdirSync(partsDir, { recursive: true });
const progress = { done: prefix };

/** Fetches [start, end] (inclusive) into `file`, resuming from bytes already written. */
function fetchSegment([start, end], file) {
  return withRetry(`bytes ${start}-${end}`, async () => {
    const existing = existsSync(file) ? statSync(file).size : 0;
    if (existing === end - start + 1) return;
    const response = await fetch(finalUrl, {
      headers: { ...IDENTITY, Range: `bytes=${start + existing}-${end}` },
    });
    if (response.status !== 206) throw new Error(`expected 206, got ${response.status}`);
    const stream = createWriteStream(file, { flags: existing ? "a" : "w" });
    try {
      for await (const chunk of response.body) {
        if (!stream.write(chunk)) await new Promise((resolve) => stream.once("drain", resolve));
        progress.done += chunk.length;
      }
    } finally {
      // Always flush and close before any retry re-reads the file size.
      await new Promise((resolve) => stream.end(resolve));
    }
    if (statSync(file).size !== end - start + 1) throw new Error("segment incomplete");
  });
}

const started = Date.now();
const timer = setInterval(() => {
  const seconds = Math.max(1, (Date.now() - started) / 1000);
  const percent = ((progress.done / total) * 100).toFixed(1);
  const rate = ((progress.done - prefix) / 1024 / seconds).toFixed(0);
  console.log(
    `  ${percent}%  ${(progress.done / 1048576).toFixed(0)}/${(total / 1048576).toFixed(0)} MB  ~${rate} KB/s`,
  );
}, 15_000);

try {
  const target = `${output}.partial`;
  if (!ranged) {
    // Server doesn't support ranges: one plain stream.
    const response = await fetch(finalUrl, { headers: IDENTITY });
    if (!response.ok) throw new Error(`GET ${finalUrl} -> ${response.status}`);
    const stream = createWriteStream(target);
    for await (const chunk of response.body) stream.write(chunk);
    await new Promise((resolve) => stream.end(resolve));
  } else {
    const remaining = total - prefix;
    const size = Math.ceil(remaining / connections);
    const segments = [];
    for (let start = prefix; start < total; start += size) {
      segments.push([start, Math.min(total - 1, start + size - 1)]);
    }
    await Promise.all(segments.map((range, index) => fetchSegment(range, `${partsDir}/${index}`)));

    // Append the segments after the prefix.
    const handle = await open(target, prefix > 0 ? "r+" : "w");
    let offset = prefix;
    for (let index = 0; index < segments.length; index++) {
      const data = readFileSync(`${partsDir}/${index}`);
      await handle.write(data, 0, data.length, offset);
      offset += data.length;
    }
    await handle.truncate(offset);
    await handle.close();
  }

  if (statSync(target).size !== total) {
    throw new Error(`Size mismatch: got ${statSync(target).size}, expected ${total}`);
  }
  if (!(await verify(target))) {
    rmSync(target);
    throw new Error(
      `Checksum mismatch for ${url}; the file was deleted. Re-run to download again.`,
    );
  }
  renameSync(target, output);
  rmSync(partsDir, { recursive: true, force: true });
  console.log(
    `done: ${output} (${(total / 1048576).toFixed(0)} MB${checksum ? ", checksum OK" : ""})`,
  );
} finally {
  clearInterval(timer);
}
