// Works out the "crop" numbers for a screen recording (or screenshot), so only the
// phone screen / app area is shown in the video.
//
// Step 1:  npm run crop -- clips/c2_map.mp4
//          -> saves out/c2_map-frame.png (a still from 1 s in) and prints the size.
//          Open the PNG in Paint, hover over the top-left and bottom-right corners of the
//          area you want to keep, and note the pixel positions (bottom-left of Paint).
// Step 2:  npm run crop -- clips/c2_map.mp4 712 180 1102 1024
//          (left top right bottom, in pixels) -> prints the "crop" to paste into scenes.json.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fail = (msg: string): never => {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
};

/** Run Remotion's bundled ffmpeg/ffprobe (no extra install; no shell, works on Windows). */
const remotion = (args: string[]): string =>
  execFileSync(
    process.execPath,
    [
      path.join(root, "node_modules", "@remotion", "cli", "remotion-cli.js"),
      ...args,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );

const [src, ...nums] = process.argv.slice(2);
if (!src)
  fail("usage: npm run crop -- clips/my_clip.mp4 [left top right bottom]");
const file = path.join(root, "public", src);
if (!fs.existsSync(file)) fail(`file not found: public/${src}`);

// Pixel size of the video / image.
const probe = remotion([
  "ffprobe",
  "-v",
  "error",
  "-select_streams",
  "v:0",
  "-show_entries",
  "stream=width,height",
  "-of",
  "csv=p=0",
  file,
]).trim();
const [width, height] = probe.split(",").map(Number);
if (!width || !height)
  fail(`could not read the size of public/${src} (got "${probe}")`);

if (nums.length === 0) {
  // Step 1: save a still frame to measure on.
  fs.mkdirSync(path.join(root, "out"), { recursive: true });
  const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(src);
  const still = path.join(root, "out", `${path.parse(src).name}-frame.png`);
  if (isVideo) {
    remotion([
      "ffmpeg",
      "-v",
      "error",
      "-y",
      "-ss",
      "1",
      "-i",
      file,
      "-frames:v",
      "1",
      still,
    ]);
  }
  console.log(`public/${src}: ${width} x ${height} px`);
  console.log(
    isVideo
      ? `Still frame saved: out/${path.basename(still)}`
      : "It's an image: open it directly.",
  );
  console.log(
    "Open it in Paint, hover over the top-left and bottom-right corners of the area to keep,\n" +
      `then run: npm run crop -- ${src} <left> <top> <right> <bottom>`,
  );
  process.exit(0);
}

// Step 2: pixel box -> fractions of each side.
if (nums.length !== 4 || nums.some((n) => !/^\d+$/.test(n))) {
  fail("give four whole pixel numbers: left top right bottom");
}
const [l, t, r, b] = nums.map(Number);
if (!(l < r && t < b && r <= width && b <= height)) {
  fail(`box ${l},${t} -> ${r},${b} doesn't fit inside ${width} x ${height}`);
}
const f = (n: number) => +n.toFixed(4);
const crop = {
  top: f(t / height),
  left: f(l / width),
  right: f((width - r) / width),
  bottom: f((height - b) / height),
};
console.log(
  `Kept area: ${r - l} x ${b - t} px (shape ${((r - l) / (b - t)).toFixed(2)} wide:tall)`,
);
console.log("Paste this into the clip's visual in scenes.json:\n");
console.log(
  `"crop": ${JSON.stringify(crop).replace(/,/g, ", ").replace(/:/g, ": ")}`,
);
