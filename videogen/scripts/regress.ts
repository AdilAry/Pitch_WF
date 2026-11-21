// Regression check after changing the engine: renders examples/sense-coach with the
// current src/ in a temporary folder, and compares it with the example's reference video.
// Your scenes.json, audio and clips are not touched.
//   npm run regress
// Exit code 1 if the videos differ. Needs the example's media, which is committed with the kit.
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const example = path.join(root, "examples", "sense-coach");
const reference = path.join(example, "out", "video.mp4");
const work = path.join(root, "out", "regress"); // out/ is not in git
const rendered = path.join(work, "out", "video.mp4");

const fail = (msg: string): never => {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
};
const hash = (file: string): string =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

for (const needed of [reference, path.join(example, "public", "audio")]) {
  if (!fs.existsSync(needed))
    fail(`${path.relative(root, needed)} is missing (it is committed with the kit; restore it with git checkout)`);
}

fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });
fs.cpSync(path.join(root, "src"), path.join(work, "src"), { recursive: true });
fs.copyFileSync(
  path.join(example, "scenes.json"),
  path.join(work, "scenes.json"),
);
fs.cpSync(path.join(example, "public"), path.join(work, "public"), {
  recursive: true,
});

console.log("Rendering the example, about 2 minutes...");
const log = path.join(root, "out", "regress.log");
const logFile = fs.openSync(log, "w");
try {
  execFileSync(
    process.execPath,
    [
      path.join(root, "node_modules", "@remotion", "cli", "remotion-cli.js"),
      "render",
      "out/regress/src/index.ts",
      "Video",
      "out/regress/out/video.mp4",
      "--public-dir=out/regress/public",
      "--concurrency=2",
    ],
    // Runs from the project folder, so the browser Remotion already downloaded is reused.
    { cwd: root, stdio: ["ignore", logFile, logFile] },
  );
} catch {
  fail(`the render failed; see ${path.relative(root, log)}`);
} finally {
  fs.closeSync(logFile);
}

const same = hash(rendered) === hash(reference);
fs.rmSync(work, { recursive: true, force: true });
if (!same) {
  fail(
    "the render differs from the reference. If the change was meant to alter the look, check the video and replace the reference.",
  );
}
console.log("PASS: identical to the reference video.");
