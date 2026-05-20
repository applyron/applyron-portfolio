const fs = require("node:fs/promises");
const path = require("node:path");

const TARGETS = [
  ".next",
  "out",
  "output",
  ".playwright-cli",
  "coverage",
  ".eslintcache",
];

const FULL_TARGETS = [
  "node_modules",
  "build",
  ".vercel",
  ".turbo",
  ".cache",
  "next-env.d.ts",
];

const FULL_TOP_LEVEL_PATTERNS = [
  /\.tsbuildinfo$/,
  /^npm-debug\.log/,
  /^yarn-debug\.log/,
  /^yarn-error\.log/,
  /^pnpm-debug\.log/,
  /^lerna-debug\.log/,
];

const RETRYABLE_ERRORS = new Set(["EBUSY", "ENOTEMPTY", "EPERM"]);
const RETRY_DELAYS_MS = [150, 300, 600, 1200, 2000];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildFailureMessage(target, error, ciMode) {
  const absoluteTarget = path.resolve(process.cwd(), target);
  const baseMessage = `Failed to remove ${target} (${absoluteTarget}).`;

  if (!ciMode && RETRYABLE_ERRORS.has(error.code)) {
    return [
      baseMessage,
      "A running Next.js dev/build process, terminal, or file explorer may still be holding the directory open.",
      "Close the process that uses this path and run `npm run clean` again.",
      `Last error: ${error.code}${error.message ? ` - ${error.message}` : ""}`,
    ].join(" ");
  }

  return [
    baseMessage,
    `Error: ${error.code ?? "UNKNOWN"}${error.message ? ` - ${error.message}` : ""}`,
  ].join(" ");
}

async function listTopLevelPatternTargets() {
  const entries = await fs.readdir(process.cwd(), { withFileTypes: true });

  return entries
    .map((entry) => entry.name)
    .filter((name) =>
      FULL_TOP_LEVEL_PATTERNS.some((pattern) => pattern.test(name)),
    );
}

async function listTargets(fullMode) {
  if (!fullMode) {
    return TARGETS;
  }

  const patternTargets = await listTopLevelPatternTargets();

  return [...new Set([...TARGETS, ...FULL_TARGETS, ...patternTargets])];
}

async function removeTarget(target, ciMode) {
  const maxAttempts = ciMode ? 1 : RETRY_DELAYS_MS.length + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await fs.rm(target, { recursive: true, force: true });
      return;
    } catch (error) {
      if (
        ciMode ||
        !RETRYABLE_ERRORS.has(error.code) ||
        attempt === maxAttempts
      ) {
        throw new Error(buildFailureMessage(target, error, ciMode));
      }

      await sleep(RETRY_DELAYS_MS[attempt - 1]);
    }
  }
}

async function main() {
  const ciMode = process.argv.includes("--ci");
  const fullMode = process.argv.includes("--full");
  const targets = await listTargets(fullMode);

  for (const target of targets) {
    await removeTarget(target, ciMode);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
