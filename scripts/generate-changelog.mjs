#!/usr/bin/env node
/**
 * Pre-build: snapshot `git log` into src/generated/changelog.json so the
 * /changelog page works on Vercel where git history is unavailable at
 * runtime. Runs as part of `prebuild` (npm lifecycle).
 */

import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "src/generated/changelog.json");

mkdirSync(dirname(OUT), { recursive: true });

let entries = [];
try {
  // Vercel checks out a shallow clone by default. We don't try to deepen
  // it here — just take whatever we can see. If history is shallow, the
  // changelog will only show the most recent commits, which is fine.
  const raw = execSync('git log --pretty=format:"%h|%ad|%s" --date=short -n 500', {
    encoding: "utf8",
    cwd: ROOT,
    stdio: ["pipe", "pipe", "pipe"],
  });
  entries = raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...rest] = line.split("|");
      return { hash, date, subject: rest.join("|") };
    });
} catch (err) {
  console.warn("[changelog] git log failed:", err.message);
}

writeFileSync(
  OUT,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: entries.length,
      entries,
    },
    null,
    2,
  ),
);

console.log(`[changelog] wrote ${entries.length} entries -> ${OUT}`);
