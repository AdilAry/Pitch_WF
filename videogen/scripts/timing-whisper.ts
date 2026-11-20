// Use your OWN voice (or any other audio) instead of ElevenLabs.
//
// 1. Record each scene's narration, word for word, and save it as recordings/<id>.<ext>
//    e.g. recordings/s01.m4a (Windows Sound Recorder), .wav, .mp3 all work.
// 2. npm run timing:whisper                    -> every scene that has a recording
//    npm run timing:whisper -- --only s01,s05  -> just these
//    npm run timing:whisper -- --force         -> redo even if the recording didn't change
//    npm run timing:whisper -- --model small.en -> a bigger (slower, more exact) model
//
// For each recording it writes public/audio/<id>.wav (what the video plays) and
// public/timing/<id>.json (same format as npm run voice), so the rest of the engine
// works unchanged. Whisper (speech-to-text, runs locally via Remotion's
// @remotion/install-whisper-cpp) finds when each word is spoken; the words are then
// lined up with the narration text, so cues match even if Whisper mishears a word.
// First run downloads whisper.cpp + the model into ./whisper.cpp (one time, ~150 MB).
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
  type WhisperModel,
} from "@remotion/install-whisper-cpp";
import type { ScenesFile, TimingFile, TimingWord } from "../src/types";
import { normalizeWord, splitNarration } from "../src/words";
import { findSpeechBounds } from "./speech-bounds";

const root = process.cwd();
const WHISPER_DIR = path.join(root, "whisper.cpp");
const WHISPER_VERSION = "1.5.5"; // Remotion's recommended version; newest with a Windows binary
const recordingsDir = path.join(root, "recordings");
const audioDir = path.join(root, "public", "audio");
const timingDir = path.join(root, "public", "timing");

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

// ---------- flags ----------
const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] ?? "") : null;
};
const force = args.includes("--force");
const only =
  flag("--only")
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? null;
const model = (flag("--model") ?? "base.en") as WhisperModel;

// ---------- scenes + recordings ----------
const data = JSON.parse(
  fs.readFileSync(path.join(root, "scenes.json"), "utf8"),
) as ScenesFile;
if (only) {
  const unknown = only.filter((id) => !data.scenes.some((s) => s.id === id));
  if (unknown.length) fail(`unknown scene id(s): ${unknown.join(", ")}`);
}
if (!fs.existsSync(recordingsDir)) {
  fail(
    "no recordings/ folder. Create it and save each scene as recordings/<id>.m4a (or .wav/.mp3).",
  );
}
/** recordings/<id>.<any audio extension>, or null. */
const findRecording = (id: string): string | null => {
  const file = fs
    .readdirSync(recordingsDir)
    .find(
      (f) =>
        path.parse(f).name === id &&
        /\.(m4a|wav|mp3|aac|ogg|flac|webm|mp4)$/i.test(f),
    );
  return file ? path.join(recordingsDir, file) : null;
};

// ---------- turning Whisper output into narration words with times ----------

/**
 * Whisper gives tokens (pieces of words); a token starting with a space begins a new word.
 * Word start = the token's t_dtw time (`timestampMs`): tested against ElevenLabs' exact
 * times it had the smallest worst-case error (≈0.3 s; plain offsets reached 0.56 s).
 * t_dtw marks a point slightly inside the first sound, so it is consistently late:
 * measured +0.12/+0.13 s on two test recordings -> START_CORRECTION moves it back.
 * `offsetSeconds` = where the transcribed piece starts in the full recording.
 */
const START_CORRECTION = -0.12;
const tokensToWords = (
  captions: {
    text: string;
    startMs: number;
    endMs: number;
    timestampMs: number | null;
  }[],
  offsetSeconds: number,
) => {
  const words: TimingWord[] = [];
  for (const c of captions) {
    const text = c.text;
    if (!text.trim() || /^\s*\[.*\]\s*$/.test(text)) continue; // skip empty and [markers]
    const last = words[words.length - 1];
    const end = c.endMs / 1000 + offsetSeconds;
    if (last && !/^\s/.test(text)) {
      last.text += text; // continuation of the same word ("fif" + "ty")
      last.end = Math.max(last.end, end);
    } else {
      const start = Math.max(
        offsetSeconds,
        (c.timestampMs ?? c.startMs) / 1000 + offsetSeconds + START_CORRECTION,
      );
      words.push({ text: text.trim(), start, end: Math.max(start, end) });
    }
  }
  return words;
};

/**
 * Line up the narration words with what Whisper heard (like a diff), so every
 * narration word gets a time. Equal words match; a different word in the same
 * place (e.g. "51" for "fifty-one") still lends its time; narration words with
 * no partner get a time interpolated from their neighbours.
 */
const alignToNarration = (narration: string, heard: TimingWord[]) => {
  const want = splitNarration(narration);
  const a = want.map((w) => w.norm);
  const b = heard.map((w) => normalizeWord(w.text));
  const n = a.length;
  const m = b.length;
  // score[i][j] = best score aligning a[i..] with b[j..]
  const score = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = n; i >= 0; i--) {
    for (let j = m; j >= 0; j--) {
      if (i === n) score[i][j] = -(m - j);
      else if (j === m) score[i][j] = -(n - i);
      else {
        score[i][j] = Math.max(
          score[i + 1][j + 1] + (a[i] === b[j] ? 2 : -1), // pair them
          score[i + 1][j] - 1, // narration word not heard
          score[i][j + 1] - 1, // extra word heard
        );
      }
    }
  }
  // Walk the best path.
  const times: (TimingWord | null)[] = new Array(n).fill(null);
  let exact = 0;
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    const pair = score[i + 1][j + 1] + (a[i] === b[j] ? 2 : -1);
    if (score[i][j] === pair) {
      times[i] = heard[j];
      if (a[i] === b[j]) exact++;
      i++;
      j++;
    } else if (score[i][j] === score[i + 1][j] - 1) i++;
    else j++;
  }
  // Fill gaps by interpolating between the nearest timed neighbours.
  const result: TimingWord[] = want.map((w, k) => {
    const t = times[k];
    if (t) return { text: w.text, start: t.start, end: t.end };
    let p = k - 1;
    while (p >= 0 && !times[p]) p--;
    let q = k + 1;
    while (q < n && !times[q]) q++;
    const from = p >= 0 ? times[p]!.end : 0;
    const to = q < n ? times[q]!.start : (heard[heard.length - 1]?.end ?? from);
    const steps = q - p; // gap words share the space evenly
    const start = from + ((to - from) * (k - p - 0.5)) / steps;
    return { text: w.text, start, end: start + (to - from) / steps / 2 };
  });
  const paired = times.filter((t) => t !== null).length;
  return { words: result, exact, paired, total: n };
};

// ---------- volume ----------

const TARGET_PEAK = 0.9; // loudest sample after boosting: 90 % of full scale (-1 dB); speech then sits close to ElevenLabs level
const MAX_GAIN = 40; // never boost more than 40x (+32 dB), so pure noise isn't blown up

/**
 * Make a quiet 16-bit mono WAV louder (in place): scale every sample so the loudest
 * one reaches TARGET_PEAK. Already-loud files are left alone. Returns the boost in dB.
 */
const normalizeVolume = (wavPath: string): number => {
  const buf = fs.readFileSync(wavPath);
  let offset = 12; // WAV = chunks; the samples are in the "data" chunk
  while (buf.toString("ascii", offset, offset + 4) !== "data") {
    offset += 8 + buf.readUInt32LE(offset + 4);
  }
  const start = offset + 8;
  const count = Math.floor((buf.length - start) / 2);
  let peak = 1;
  for (let i = 0; i < count; i++) {
    peak = Math.max(peak, Math.abs(buf.readInt16LE(start + i * 2)));
  }
  const gain = Math.min((TARGET_PEAK * 32767) / peak, MAX_GAIN);
  if (gain <= 1.05) return 0; // loud enough already
  for (let i = 0; i < count; i++) {
    const v = Math.round(buf.readInt16LE(start + i * 2) * gain);
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, v)), start + i * 2);
  }
  fs.writeFileSync(wavPath, buf);
  return 20 * Math.log10(gain);
};

// ---------- main ----------
const main = async () => {
  fs.mkdirSync(audioDir, { recursive: true });
  fs.mkdirSync(timingDir, { recursive: true });

  const todo = data.scenes.filter(
    (s) => (!only || only.includes(s.id)) && findRecording(s.id) !== null,
  );
  if (todo.length === 0)
    fail(
      "no recordings found for these scenes (expected recordings/<id>.m4a etc.)",
    );

  let whisperReady = false;
  for (const scene of todo) {
    const recording = findRecording(scene.id)!;
    const timingPath = path.join(timingDir, `${scene.id}.json`);
    const wavName = `${scene.id}.wav`;
    const wavPath = path.join(audioDir, wavName);
    const hash = crypto
      .createHash("sha256")
      .update(fs.readFileSync(recording))
      .update(scene.narration)
      .digest("hex")
      .slice(0, 16);

    if (!force && fs.existsSync(timingPath) && fs.existsSync(wavPath)) {
      const old = JSON.parse(fs.readFileSync(timingPath, "utf8")) as TimingFile;
      if (old.source === "whisper" && old.hash === hash) {
        console.log(`${scene.id}: unchanged, skipped`);
        continue;
      }
    }

    if (!whisperReady) {
      // A folder without the program (empty, or an interrupted install) would make the
      // installer skip the install, and the run would crash later. Start it again.
      const program = process.platform === "win32" ? "main.exe" : "main"; // for WHISPER_VERSION
      if (
        fs.existsSync(WHISPER_DIR) &&
        !fs.existsSync(path.join(WHISPER_DIR, program))
      ) {
        fs.rmSync(WHISPER_DIR, { recursive: true, force: true });
      }
      // One-time downloads (skipped when already there).
      await installWhisperCpp({
        to: WHISPER_DIR,
        version: WHISPER_VERSION,
        printOutput: false,
      });
      await downloadWhisperModel({
        model,
        folder: WHISPER_DIR,
        printOutput: true,
      });
      whisperReady = true;
    }

    process.stdout.write(`${scene.id}: ${path.basename(recording)} -> `);
    // The audio the video plays: mono 48 kHz wav. Whisper needs 16 kHz, 16-bit wav.
    remotion([
      "ffmpeg",
      "-v",
      "error",
      "-y",
      "-i",
      recording,
      "-ac",
      "1",
      "-ar",
      "48000",
      "-c:a",
      "pcm_s16le",
      wavPath,
    ]);
    // Where the speech is (skips silence/room noise at the start and end).
    const bounds = findSpeechBounds(wavPath);
    // Quiet recording? Raise the volume so it matches the rest of the video
    // and Whisper hears it clearly.
    const gainDb = normalizeVolume(wavPath);

    // Whisper only gets the speech part: with silence before the first word it
    // places words up to a second too early (found in testing).
    const wav16 = path.join(os.tmpdir(), `whisper-${process.pid}.wav`);
    remotion([
      "ffmpeg",
      "-v",
      "error",
      "-y",
      "-ss",
      String(bounds.start),
      "-to",
      String(bounds.end),
      "-i",
      wavPath,
      "-ac",
      "1",
      "-ar",
      "16000",
      "-c:a",
      "pcm_s16le",
      wav16,
    ]);

    const whisperCppOutput = await transcribe({
      inputPath: wav16,
      whisperPath: WHISPER_DIR,
      whisperCppVersion: WHISPER_VERSION,
      model,
      tokenLevelTimestamps: true, // more exact word times
      printOutput: false,
    });
    fs.rmSync(wav16, { force: true });
    const heard = tokensToWords(
      toCaptions({ whisperCppOutput }).captions,
      bounds.start,
    );
    const { words, exact, paired, total } = alignToNarration(
      scene.narration,
      heard,
    );

    const durationSeconds = Number(
      remotion([
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "csv=p=0",
        wavPath,
      ]).trim(),
    );
    const timing: TimingFile & { audioFile: string; wordsMatched: string } = {
      id: scene.id,
      source: "whisper",
      hash,
      durationSeconds: +durationSeconds.toFixed(3),
      audioFile: `audio/${wavName}`,
      audioStart: bounds.start,
      audioEnd: bounds.end,
      wordsMatched: `${paired}/${total} placed, ${exact} recognised exactly`,
      words: words.map((w) => ({
        text: w.text,
        start: +w.start.toFixed(3),
        end: +w.end.toFixed(3),
      })),
    };
    fs.writeFileSync(timingPath, JSON.stringify(timing, null, 2) + "\n");
    console.log(
      `${gainDb > 0 ? `volume +${gainDb.toFixed(0)} dB, ` : ""}speech ${bounds.start}-${bounds.end} s, ` +
        `${paired}/${total} words placed (${exact} recognised exactly)`,
    );
    // Accents make Whisper misspell words (a misspelled name or a similar-sounding word); that's fine as long as
    // every narration word found a partner and the word count is about right.
    // A wrong or badly misread take fails one of these.
    const countOff = Math.abs(heard.length - total) / total;
    if (paired / total < 0.7 || countOff > 0.4) {
      console.log(
        `   WARNING: Whisper heard: "${heard.map((w) => w.text).join(" ")}"
` +
          "   That doesn't look like this scene's narration. Did you record the right text? Cue timing may be off.",
      );
    }
  }
};

main().catch((e: unknown) => fail((e as Error).message));
