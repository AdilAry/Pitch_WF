// Scene durations and word -> frame lookup.
//
// Real timings come from public/timing/<id>.json (written by `npm run voice`).
// loadTimings() reads them in calculateMetadata (Root.tsx); they are passed to the
// compositions as a prop and stored here with setTimings(), so every helper below
// can look them up by scene id.
//
// Scenes WITHOUT a timing file fall back to estimates from scenes.json:
//   - scene length = estSeconds
//   - a word's start = (its character position / narration length) * estSeconds
// so everything still previews before any audio exists.
import { staticFile } from "remotion";
import { getScene, meta, scenes } from "./scenes";
import type { TimingFile, TimingWord } from "./types";
import { findWordIndex, splitNarration } from "./words";

export type SceneTiming = {
  /** Length of the speech that is played (trimmed), in seconds. */
  durationSeconds: number;
  /** Word times in seconds from the scene start. */
  words: TimingWord[];
  /** How many frames to skip at the start of the mp3 (leading silence/noise). */
  audioStartFrame: number;
  /** Audio file relative to public/ (ElevenLabs mp3 or your own recording's wav). */
  audioFile: string;
  /** public/audio/<id>.mp3 exists (it's gitignored, so a fresh clone may lack it). */
  hasAudio: boolean;
};
/** Scene id -> real timing. Scenes without a timing file are simply missing. */
export type Timings = Record<string, SceneTiming>;

let store: Timings = {};

/** Make loaded timings available to all helpers in this file. */
export const setTimings = (timings: Timings) => {
  store = timings;
};

/** Real timing of a scene, or undefined if it has none (estimates are used then). */
export const getTiming = (sceneId: string): SceneTiming | undefined =>
  store[sceneId];

/**
 * Fetch every scene's timing file (and check its mp3 exists). Runs in the browser
 * (Studio or the renderer), so it uses fetch + staticFile instead of fs.
 */
export const loadTimings = async (): Promise<Timings> => {
  const result: Timings = {};
  for (const scene of scenes) {
    // cache: "no-store" so a re-run of `npm run voice` shows up after a Studio reload.
    const res = await fetch(staticFile(`timing/${scene.id}.json`), {
      cache: "no-store",
    });
    if (!res.ok) continue; // no timing file -> estimates
    let file: TimingFile;
    try {
      file = (await res.json()) as TimingFile;
    } catch {
      console.warn(
        `[${scene.id}] timing file is not valid JSON, using estimates`,
      );
      continue;
    }
    const audioFile = file.audioFile ?? `audio/${scene.id}.mp3`;
    const audio = await fetch(staticFile(audioFile), {
      method: "HEAD",
      cache: "no-store",
    });
    if (!audio.ok) {
      console.warn(
        `[${scene.id}] has timings but no audio file; run npm run voice`,
      );
    }
    // Play only the real speech: [audioStart, audioEnd] of the file (set by npm run voice).
    // audioStart is rounded to a whole frame because the audio is trimmed in frames.
    const startFrame = Math.round((file.audioStart ?? 0) * meta.fps);
    const audioStart = startFrame / meta.fps;
    const audioEnd = file.audioEnd ?? file.durationSeconds;
    const durationSeconds = Math.max(0.1, audioEnd - audioStart);
    result[scene.id] = {
      durationSeconds,
      // Word times are stored in file time; shift them to scene time.
      words: file.words.map((w) => ({
        text: w.text,
        start: Math.min(Math.max(w.start - audioStart, 0), durationSeconds),
        end: Math.min(Math.max(w.end - audioStart, 0), durationSeconds),
      })),
      hasAudio: audio.ok,
      audioStartFrame: startFrame,
      audioFile,
    };
  }
  return result;
};

/** Spoken length of a scene in seconds (without padding). */
export const speechSeconds = (sceneId: string): number =>
  getTiming(sceneId)?.durationSeconds ?? getScene(sceneId).estSeconds;

/** Pause after a scene: its own padSeconds, else meta.padSeconds. */
export const padSecondsOf = (sceneId: string): number =>
  getScene(sceneId).padSeconds ?? meta.padSeconds;

/** Full scene length in frames: speech + pause. */
export const sceneDurationInFrames = (sceneId: string): number =>
  Math.max(
    1,
    Math.ceil((speechSeconds(sceneId) + padSecondsOf(sceneId)) * meta.fps),
  );

/** Total video length in frames. */
export const totalDurationInFrames = (sceneIds: string[]): number =>
  sceneIds.reduce((sum, id) => sum + sceneDurationInFrames(id), 0);

/** Words of a scene with start/end in seconds: real timings, or estimated ones. */
export const sceneWords = (sceneId: string): TimingWord[] => {
  const timing = getTiming(sceneId);
  if (timing) return timing.words;

  const scene = getScene(sceneId);
  const words = splitNarration(scene.narration);
  const at = (charIndex: number) =>
    (charIndex / scene.narration.length) * scene.estSeconds;
  return words.map((w, i) => ({
    text: w.text,
    start: at(w.charIndex),
    end: i + 1 < words.length ? at(words[i + 1].charIndex) : scene.estSeconds,
  }));
};

/**
 * Frame (relative to the scene start) at which `word` starts being spoken,
 * or null if the word isn't in the narration.
 * Matching is case-insensitive and ignores punctuation; `occurrence` picks the n-th match.
 */
export const frameOfWord = (
  sceneId: string,
  word: string,
  occurrence = 1,
): number | null => {
  const words = sceneWords(sceneId);
  const i = findWordIndex(words, word, occurrence);
  if (i < 0) return null;
  return Math.round(words[i].start * meta.fps);
};
