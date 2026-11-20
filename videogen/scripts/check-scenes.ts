// Validates scenes.json before you spend time/credits on voice or rendering.
//   npm run check                 -> checks ./scenes.json
//   npm run check -- other.json   -> checks another file
//   npm run check -- --cues       -> also lists when every cue fires (to check sync)
// Exit code 1 if there are errors (warnings alone are OK).
import fs from "node:fs";
import path from "node:path";
import {
  CUE_ACTIONS,
  VISUAL_TYPES,
  type ScenesFile,
  type TimingFile,
} from "../src/types";
import { findWordIndex, normalizeWord, splitNarration } from "../src/words";

const root = process.cwd(); // npm scripts always run from the project folder
const args = process.argv.slice(2);
const listCues = args.includes("--cues");
const file = path.resolve(
  root,
  args.find((a) => !a.startsWith("--")) ?? "scenes.json",
);
const cueLines: string[] = []; // filled when --cues is given

const errors: string[] = [];
const warnings: string[] = [];
const error = (where: string, msg: string) => errors.push(`${where}: ${msg}`);
const warn = (where: string, msg: string) => warnings.push(`${where}: ${msg}`);

let data: ScenesFile;
try {
  data = JSON.parse(fs.readFileSync(file, "utf8")) as ScenesFile;
} catch (e) {
  console.error(`ERROR: cannot read ${file}\n  ${(e as Error).message}`);
  process.exit(1);
}

// --- meta ---
const meta = data.meta;
if (!meta) {
  error("meta", "missing");
} else {
  for (const key of ["fps", "width", "height", "padSeconds"] as const) {
    if (typeof meta[key] !== "number")
      error("meta", `"${key}" must be a number`);
  }
  if (meta.music && !fs.existsSync(path.join(root, "public", meta.music))) {
    error("meta", `music file not found: public/${meta.music}`);
  }
}

// --- scenes ---
if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
  error("scenes", "must be a non-empty list");
  data.scenes = [];
}

// --- theme: colours that are hard to read, or defaults made for a dark background ---
const luminance = (hex: string): number | null => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null; // rgba(...) etc.: not checked
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string): number | null => {
  const [la, lb] = [luminance(a), luminance(b)];
  if (la === null || lb === null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
const theme = data.theme ?? {};
const bg = theme.bg ?? "#0F2A3D"; // same defaults as src/theme.ts
for (const [name, colour, minimum] of [
  ["text", theme.text ?? "#FFFFFF", 4.5],
  ["accent", theme.accent ?? "#1B998B", 3],
] as const) {
  const ratio = contrast(colour, bg);
  if (ratio !== null && ratio < minimum) {
    warn(
      "theme",
      `"${name}" on "bg" has contrast ${ratio.toFixed(1)}:1 (aim for at least ${minimum}:1)`,
    );
  }
}
if ((luminance(bg) ?? 0) > 0.5) {
  const missing = (["panel", "panelBorder", "captionBg"] as const).filter(
    (k) => theme[k] === undefined,
  );
  if (missing.length > 0) {
    warn(
      "theme",
      `light background: also set ${missing.join(", ")}; their defaults are made for dark backgrounds`,
    );
  }
}

const MIN_SCENE_SECONDS = 5;
const SHORT_OPENER_WORDS = 5;
const seenIds = new Set<string>();
let totalSeconds = 0;
let voicedSeconds = 0; // real audio length of scenes that have timings
let videoSeconds = 0; // whole video: voice where it exists, else estimates, plus pauses

data.scenes.forEach((scene, index) => {
  const where = scene.id ? `[${scene.id}]` : `[scene #${index + 1}]`;

  // id: used as a file name (public/audio/<id>.mp3), so keep it simple.
  if (typeof scene.id !== "string" || !/^[A-Za-z0-9_-]+$/.test(scene.id)) {
    error(
      where,
      `"id" must be letters, digits, - or _ (got ${JSON.stringify(scene.id)})`,
    );
  } else if (seenIds.has(scene.id)) {
    error(where, "duplicate id");
  } else {
    seenIds.add(scene.id);
  }

  if (typeof scene.narration !== "string" || !scene.narration.trim()) {
    error(where, '"narration" is missing or empty');
    return;
  }
  if (/\d/.test(scene.narration)) {
    warn(
      where,
      "narration contains digits; write numbers as words so the voice and timings match",
    );
  }
  if (typeof scene.estSeconds !== "number" || scene.estSeconds <= 0) {
    error(where, '"estSeconds" must be a positive number');
  } else {
    totalSeconds += scene.estSeconds;
  }

  if (
    scene.padSeconds !== undefined &&
    (typeof scene.padSeconds !== "number" || scene.padSeconds < 0)
  ) {
    error(where, '"padSeconds" must be a number >= 0');
  }

  // visual
  const visual = scene.visual;
  if (!visual || typeof visual.type !== "string") {
    error(where, '"visual.type" is missing');
  } else {
    if (!(VISUAL_TYPES as readonly string[]).includes(visual.type)) {
      error(
        where,
        `unknown visual type "${visual.type}" (known: ${VISUAL_TYPES.join(", ")})`,
      );
    }
    // Media files referenced by clip/image visuals must exist in public/.
    if (
      (visual.type === "clip" || visual.type === "image") &&
      typeof visual.src === "string"
    ) {
      if (!fs.existsSync(path.join(root, "public", visual.src))) {
        error(where, `${visual.type} file not found: public/${visual.src}`);
      }
    } else if (visual.type === "clip" || visual.type === "image") {
      error(where, `${visual.type} visual needs a "src"`);
    }
    // crop: fractions 0–1 of each side, and something must be left over.
    const crop = visual.crop as Record<string, number> | undefined;
    if (crop !== undefined) {
      const side = (k: string) => crop[k] ?? 0;
      const bad = ["left", "right", "top", "bottom"].some(
        (k) => typeof side(k) !== "number" || side(k) < 0 || side(k) >= 1,
      );
      if (
        bad ||
        side("left") + side("right") >= 1 ||
        side("top") + side("bottom") >= 1
      ) {
        error(
          where,
          '"crop" values must be fractions 0–1 of each side, e.g. { "top": 0.1, "left": 0.35, "right": 0.35 }',
        );
      }
    }
  }

  // cues
  const words = splitNarration(scene.narration);
  (scene.cues ?? []).forEach((cue, ci) => {
    const cw = `${where} cue #${ci + 1}`;
    if (!(CUE_ACTIONS as readonly string[]).includes(cue.action)) {
      warn(
        cw,
        `unknown action "${cue.action}" (will be ignored; known: ${CUE_ACTIONS.join(", ")})`,
      );
    }
    if (cue.atWord === undefined && cue.atFraction === undefined) {
      error(cw, 'needs "atWord" or "atFraction"');
    }
    if (cue.atWord !== undefined) {
      const occurrence = cue.occurrence ?? 1;
      if (findWordIndex(words, cue.atWord, occurrence) < 0) {
        const count = words.filter(
          (w) => w.norm === normalizeWord(cue.atWord!),
        ).length;
        error(
          cw,
          count === 0
            ? `word "${cue.atWord}" is not in the narration`
            : `word "${cue.atWord}" occurs ${count}x, but occurrence ${occurrence} was requested`,
        );
      }
    }
    if (
      cue.atFraction !== undefined &&
      (cue.atFraction < 0 || cue.atFraction > 1)
    ) {
      error(cw, `"atFraction" must be between 0 and 1 (got ${cue.atFraction})`);
    }
    if (
      cue.action === "zoom" &&
      (typeof cue.target !== "object" || cue.target === null)
    ) {
      error(
        cw,
        'zoom needs a target like { "scale": 1.2, "x": 0.5, "y": 0.5 }',
      );
    }
  });

  // timing + audio from `npm run voice`
  if (!seenIds.has(scene.id)) return;
  const timingPath = path.join(root, "public", "timing", `${scene.id}.json`);
  let timing: TimingFile | null = null;
  if (!fs.existsSync(timingPath)) {
    warn(
      where,
      "no voice yet (run npm run voice or npm run timing:whisper); its length is estimated",
    );
  } else {
    timing = JSON.parse(fs.readFileSync(timingPath, "utf8")) as TimingFile;
    const audioFile = timing.audioFile ?? `audio/${scene.id}.mp3`;
    const redo =
      timing.source === "whisper"
        ? "record it again and run npm run timing:whisper"
        : "run npm run voice";
    const spoken = timing.words.map((w) => normalizeWord(w.text)).join(" ");
    const written = words.map((w) => w.norm).join(" ");
    if (spoken !== written) {
      warn(where, `narration changed since the voice was made; ${redo}`);
      timing = null; // its word times can't be trusted for the cue list
    } else {
      // Only the speech part [audioStart, audioEnd] is played; use scene time like src/timing.ts.
      const start = timing.audioStart ?? 0;
      const end = timing.audioEnd ?? timing.durationSeconds;
      timing = {
        ...timing,
        durationSeconds: end - start,
        words: timing.words.map((w) => ({
          ...w,
          start: Math.max(0, w.start - start),
        })),
      };
      voicedSeconds += timing.durationSeconds;
    }
    if (!fs.existsSync(path.join(root, "public", audioFile))) {
      warn(
        where,
        `audio file missing: public/${audioFile} (run npm run voice or npm run timing:whisper)`,
      );
    }
  }

  // Scene length, with the real voice once there is one.
  const sceneSeconds =
    (timing ? timing.durationSeconds : scene.estSeconds) +
    (scene.padSeconds ?? meta?.padSeconds ?? 0);
  videoSeconds += sceneSeconds;
  if (sceneSeconds < MIN_SCENE_SECONDS) {
    warn(
      where,
      `only ${sceneSeconds.toFixed(1)} s long (under ${MIN_SCENE_SECONDS} s feels cut off); merge it with a neighbour or lengthen it`,
    );
  }

  // Empty screen: every element waits for a cue, and the first cue comes too late.
  const needed =
    visual?.type === "cards" || visual?.type === "counters"
      ? ((visual.items as unknown[] | undefined) ?? []).map((_, i) => i)
      : visual?.type === "twoColumns"
        ? ["left", "right"]
        : [];
  const shows = (scene.cues ?? []).filter((c) => c.action === "show");
  if (
    needed.length > 0 &&
    needed.every((n) => shows.some((c) => c.target === n)) &&
    shows.every((c) => c.atWord !== undefined)
  ) {
    const ends = words.flatMap((w, i) => (/[.?!]$/.test(w.text) ? [i] : []));
    // A short opener ("The list is honest.") may come first, then the next sentence counts.
    const limit =
      (ends[0] ?? words.length) < SHORT_OPENER_WORDS
        ? (ends[1] ?? words.length)
        : (ends[0] ?? words.length);
    const first = Math.min(
      ...shows
        .filter((c) => needed.includes(c.target as never))
        .map((c) => findWordIndex(words, c.atWord!, c.occurrence ?? 1)),
    );
    if (first > limit) {
      warn(
        where,
        `screen stays empty until the word "${words[first].text}"; show something during the first sentence`,
      );
    }
  }

  // --cues: when does each cue fire? (same rules as src/cues.ts)
  if (listCues) {
    const timed = timing ? timing.words : null;
    for (const cue of scene.cues ?? []) {
      let seconds: number | null = null;
      let why = "";
      if (cue.atWord !== undefined) {
        const list = timed ?? [];
        const i = findWordIndex(list, cue.atWord, cue.occurrence ?? 1);
        if (i >= 0) {
          seconds = list[i].start;
          why = `word "${list[i].text}"`;
        }
      }
      if (seconds === null && cue.atFraction !== undefined) {
        seconds = cue.atFraction * sceneSeconds;
        why = `${cue.atFraction * 100}% of scene`;
      }
      if (seconds === null) {
        why = timed ? "word not found" : "no timing (estimated in Studio)";
      } else {
        seconds += cue.offsetSeconds ?? 0;
      }
      const target =
        typeof cue.target === "object"
          ? JSON.stringify(cue.target)
          : String(cue.target ?? "");
      const time =
        seconds === null
          ? "    -   "
          : `${seconds.toFixed(2).padStart(6)} s  frame ${String(Math.round(seconds * (meta?.fps ?? 30))).padStart(4)}`;
      cueLines.push(`${scene.id}  ${time}  ${cue.action} ${target}  <- ${why}`);
    }
  }
});

// --- length of the whole video ---
const targetSeconds = meta?.targetSeconds ?? 90;
const maxSeconds = meta?.maxSeconds ?? 120;
if (videoSeconds > maxSeconds) {
  warn(
    "length",
    `the video runs ${videoSeconds.toFixed(0)} s, over the ${maxSeconds} s maximum`,
  );
}

// --- report ---
if (listCues) {
  console.log("Cue times (seconds/frames from the start of each scene):");
  for (const line of cueLines) console.log(`  ${line}`);
  console.log("");
}
for (const w of warnings) console.log(`WARN   ${w}`);
for (const e of errors) console.log(`ERROR  ${e}`);
console.log(
  `\n${path.basename(file)}: ${data.scenes.length} scenes, ~${Math.round(totalSeconds)} s estimated` +
    (voicedSeconds > 0 ? `, ${voicedSeconds.toFixed(1)} s of voice` : "") +
    `, about ${videoSeconds.toFixed(0)} s with pauses (target ${targetSeconds} s, maximum ${maxSeconds} s). ` +
    `${errors.length} error(s), ${warnings.length} warning(s).`,
);
process.exit(errors.length > 0 ? 1 : 0);
