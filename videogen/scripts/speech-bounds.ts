// Finds where the speech really starts and ends inside an mp3.
//
// Why: ElevenLabs files carry up to ~1 s of silence at the end (long gaps between
// scenes), and because we send the next scene's text for a smoother flow, a file can
// end with a 20–80 ms fragment of the NEXT scene's first sound, cut off mid-way
// (an audible "s" click). We keep only the real speech.
//
// How: decode the mp3 with the ffmpeg that ships with Remotion, measure loudness in
// 10 ms windows, group loud windows into "sound segments", and drop a very short
// segment at either edge of the file (a fragment, not a word).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const RATE = 16000; // decode at 16 kHz mono: plenty for loudness measuring
const WINDOW = 160; // samples = 10 ms
const LOUD = 300; // peak sample value counted as "sound" (about -40 dB)...
const LOUD_RELATIVE = 0.1; // ...or 10 % of the file's loudest peak, if that is lower (quiet mic recordings)
const MERGE_GAP = 0.1; // s: quieter gaps shorter than this stay inside one segment
const FRAGMENT = 0.12; // s: an edge segment shorter than this is a fragment, dropped
const LEAD_MARGIN = 0.05; // s kept before the first sound (soft consonants)
const TAIL_MARGIN = 0.12; // s kept after the last sound (word endings fade out)

/** Run Remotion's bundled ffmpeg to turn the mp3 into 16-bit mono PCM samples. */
const decode = (mp3Path: string): Int16Array => {
  const cli = path.join(
    process.cwd(),
    "node_modules",
    "@remotion",
    "cli",
    "remotion-cli.js",
  );
  const wav = path.join(os.tmpdir(), `speech-bounds-${process.pid}.wav`);
  // process.execPath = node itself, so no shell is needed (works the same on Windows).
  execFileSync(
    process.execPath,
    [
      cli,
      "ffmpeg",
      "-v",
      "error",
      "-y",
      "-i",
      mp3Path,
      "-ac",
      "1",
      "-ar",
      String(RATE),
      "-c:a",
      "pcm_s16le",
      wav,
    ],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  const buf = fs.readFileSync(wav);
  fs.rmSync(wav, { force: true });
  // A WAV file is a list of chunks; the samples are in the "data" chunk.
  let offset = 12;
  while (
    offset + 8 <= buf.length &&
    buf.toString("ascii", offset, offset + 4) !== "data"
  ) {
    offset += 8 + buf.readUInt32LE(offset + 4);
  }
  const data = buf.subarray(offset + 8);
  const samples = new Int16Array(Math.floor(data.length / 2));
  for (let i = 0; i < samples.length; i++) samples[i] = data.readInt16LE(i * 2);
  return samples;
};

export type SpeechBounds = {
  /** Seconds into the file where playback should start. */
  start: number;
  /** Seconds into the file where playback should stop. */
  end: number;
  /** What was cut, for the log. */
  note: string;
};

export const findSpeechBounds = (mp3Path: string): SpeechBounds => {
  const samples = decode(mp3Path);
  let filePeak = 0;
  for (let i = 0; i < samples.length; i++)
    filePeak = Math.max(filePeak, Math.abs(samples[i]));
  const threshold = Math.min(LOUD, filePeak * LOUD_RELATIVE);
  const fileSeconds = samples.length / RATE;

  // 1. Loud or quiet, per 10 ms window.
  const loud: boolean[] = [];
  for (let s = 0; s + WINDOW <= samples.length; s += WINDOW) {
    let peak = 0;
    for (let i = s; i < s + WINDOW; i++)
      peak = Math.max(peak, Math.abs(samples[i]));
    loud.push(peak > threshold);
  }
  const win = WINDOW / RATE; // window length in seconds

  // 2. Group loud windows into segments [start, end) in seconds.
  const segments: { start: number; end: number }[] = [];
  loud.forEach((isLoud, i) => {
    if (!isLoud) return;
    const t = i * win;
    const last = segments[segments.length - 1];
    if (last && t - last.end < MERGE_GAP) last.end = t + win;
    else segments.push({ start: t, end: t + win });
  });
  if (segments.length === 0)
    return { start: 0, end: fileSeconds, note: "no sound found" };

  // 3. Drop fragments at the edges (only if real speech remains).
  const notes: string[] = [];
  let tailLimit = fileSeconds;
  let headLimit = 0;
  if (segments.length > 1 && segments[0].end - segments[0].start < FRAGMENT) {
    const f = segments.shift()!;
    headLimit = f.end;
    notes.push(
      `dropped ${Math.round((f.end - f.start) * 1000)} ms fragment at start`,
    );
  }
  const lastSeg = segments[segments.length - 1];
  if (segments.length > 1 && lastSeg.end - lastSeg.start < FRAGMENT) {
    segments.pop();
    tailLimit = lastSeg.start;
    notes.push(
      `dropped ${Math.round((lastSeg.end - lastSeg.start) * 1000)} ms fragment at end`,
    );
  }

  // 4. Keep the speech plus small margins, never reaching into a dropped fragment.
  const start = Math.max(headLimit, segments[0].start - LEAD_MARGIN, 0);
  const end = Math.min(
    tailLimit - 0.01,
    segments[segments.length - 1].end + TAIL_MARGIN,
    fileSeconds,
  );
  const cut = fileSeconds - end + start;
  notes.push(`${cut.toFixed(2)} s of silence/noise trimmed`);
  return {
    start: +start.toFixed(3),
    end: +end.toFixed(3),
    note: notes.join(", "),
  };
};
