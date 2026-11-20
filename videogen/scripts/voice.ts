// Generates the voice-over with ElevenLabs: one mp3 + one word-timing file per scene.
//   npm run voice                       -> all scenes that changed since last run
//   npm run voice -- --only s01,s05     -> just these scenes
//   npm run voice -- --force            -> regenerate even if unchanged
//   npm run voice -- --retrim           -> re-measure speech start/end of existing files (no credits)
// Output: public/audio/<id>.mp3 and public/timing/<id>.json
// API details (confirmed from the official docs): docs/eleven_labs.md
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import type { ScenesFile, TimingFile, TimingWord } from "../src/types";
import { findSpeechBounds } from "./speech-bounds";

const root = process.cwd(); // npm scripts always run from the project folder
const OUTPUT_FORMAT = "mp3_44100_128";
const MP3_BITRATE = 128_000; // bits per second, must match OUTPUT_FORMAT
const audioDir = path.join(root, "public", "audio");
const timingDir = path.join(root, "public", "timing");

// Print a message and stop with exit code 1.
const fail = (msg: string): never => {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
};

// ---------- command line flags ----------
const args = process.argv.slice(2);
const force = args.includes("--force");
const retrim = args.includes("--retrim");
const onlyIndex = args.indexOf("--only");
const only =
  onlyIndex >= 0
    ? (args[onlyIndex + 1] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;
if (only !== null && only.length === 0)
  fail("--only needs scene ids, e.g. --only s01,s05");

// ---------- .env ----------
const envPath = path.join(root, ".env");
if (!fs.existsSync(envPath)) {
  fail(
    "no .env file. Copy .env.example to .env and fill in ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID.",
  );
}
config({ path: envPath, quiet: true }); // copies the .env values into process.env
const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
if (!apiKey) fail("ELEVENLABS_API_KEY is empty in .env");
if (!voiceId) fail("ELEVENLABS_VOICE_ID is empty in .env");

// ---------- scenes.json ----------
const data = JSON.parse(
  fs.readFileSync(path.join(root, "scenes.json"), "utf8"),
) as ScenesFile;
const scenes = data.scenes;
if (only) {
  const unknown = only.filter((id) => !scenes.some((s) => s.id === id));
  if (unknown.length) fail(`unknown scene id(s): ${unknown.join(", ")}`);
}

/** Same narration + voice + settings -> same hash -> no need to call the API again. */
// voiceContext is only added when false, so existing scenes keep their old hash.
const hashScene = (narration: string, voiceContext: boolean): string =>
  crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        narration,
        voiceId,
        modelId: data.voice.modelId,
        settings: data.voice.settings,
        ...(voiceContext ? {} : { voiceContext }),
      }),
    )
    .digest("hex")
    .slice(0, 16);

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};
type ApiResponse = {
  audio_base64: string;
  alignment: Alignment | null;
  normalized_alignment: Alignment | null;
};

/** Group character timings into words (split on whitespace). */
const groupIntoWords = (a: Alignment): TimingWord[] => {
  const words: TimingWord[] = [];
  let current: TimingWord | null = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      current = null; // whitespace ends the current word
      return;
    }
    const start = a.character_start_times_seconds[i];
    const end = a.character_end_times_seconds[i];
    if (current === null) {
      current = { text: ch, start, end };
      words.push(current);
    } else {
      current.text += ch;
      current.end = end;
    }
  });
  // Round to milliseconds to keep the JSON readable.
  return words.map((w) => ({
    text: w.text,
    start: +w.start.toFixed(3),
    end: +w.end.toFixed(3),
  }));
};

const generate = async (index: number): Promise<number> => {
  const scene = scenes[index];
  const useContext = scene.voiceContext !== false;
  const hash = hashScene(scene.narration, useContext);
  const audioPath = path.join(audioDir, `${scene.id}.mp3`);
  const timingPath = path.join(timingDir, `${scene.id}.json`);

  // Never replace your own recording (npm run timing:whisper) unless --force is given.
  if (!force && fs.existsSync(timingPath)) {
    const old = JSON.parse(fs.readFileSync(timingPath, "utf8")) as TimingFile;
    if (old.source !== "elevenlabs") {
      console.log(
        `${scene.id}: uses your own recording (${old.source}), skipped; --force replaces it with ElevenLabs`,
      );
      return 0;
    }
  }

  // Cache check: skip if the timing file has the same hash and the mp3 exists.
  if (!force && fs.existsSync(audioPath) && fs.existsSync(timingPath)) {
    const old = JSON.parse(fs.readFileSync(timingPath, "utf8")) as TimingFile;
    if (old.hash === hash) {
      // Older timing files have no speech bounds yet: measure them from the mp3 (free).
      if (retrim || old.audioStart === undefined) {
        const bounds = findSpeechBounds(audioPath);
        const updated = {
          ...old,
          audioStart: bounds.start,
          audioEnd: bounds.end,
        };
        fs.writeFileSync(timingPath, JSON.stringify(updated, null, 2) + "\n");
        console.log(
          `${scene.id}: unchanged, speech ${bounds.start}-${bounds.end} s (${bounds.note})`,
        );
      } else {
        console.log(`${scene.id}: unchanged, skipped`);
      }
      return 0;
    }
  }

  const body: Record<string, unknown> = {
    text: scene.narration,
    model_id: data.voice.modelId,
    voice_settings: data.voice.settings,
  };
  // Neighbouring scenes' text helps the voice keep a natural flow across scenes.
  // A scene can opt out with "voiceContext": false (e.g. when the context causes odd intonation).
  if (useContext && index > 0) body.previous_text = scenes[index - 1].narration;
  if (useContext && index < scenes.length - 1)
    body.next_text = scenes[index + 1].narration;

  process.stdout.write(
    `${scene.id}: generating (${scene.narration.length} chars)... `,
  );
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId!)}/with-timestamps?output_format=${OUTPUT_FORMAT}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": apiKey!, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    const hint =
      res.status === 401
        ? " (API key rejected or missing a permission: check ELEVENLABS_API_KEY in .env and the key's permissions on elevenlabs.io)"
        : res.status === 404
          ? " (voice not found: check ELEVENLABS_VOICE_ID in .env)"
          : "";
    console.log("");
    fail(
      `ElevenLabs returned HTTP ${res.status}${hint}\n${text.slice(0, 1000)}`,
    );
  }
  const json = (await res.json()) as ApiResponse;

  const alignment = json.alignment ?? json.normalized_alignment;
  if (!alignment) fail(`${scene.id}: response has no alignment data`);
  if (!json.alignment)
    console.warn(
      `\n${scene.id}: WARNING using normalized_alignment (words may differ from narration)`,
    );

  const audio = Buffer.from(json.audio_base64, "base64");
  fs.writeFileSync(audioPath, audio);

  const words = groupIntoWords(alignment!);
  const speechEnd = Math.max(0, ...alignment!.character_end_times_seconds);
  // Constant bitrate mp3: length = bits / bitrate. Never shorter than the speech itself.
  const durationSeconds = Math.max((audio.length * 8) / MP3_BITRATE, speechEnd);

  // Where the real speech is (drops trailing silence and cut-off fragments).
  const bounds = findSpeechBounds(audioPath);

  const timing: TimingFile & { speechEndSeconds: number } = {
    id: scene.id,
    source: "elevenlabs",
    hash,
    durationSeconds: +durationSeconds.toFixed(3),
    speechEndSeconds: +speechEnd.toFixed(3),
    audioStart: bounds.start,
    audioEnd: bounds.end,
    words,
  };
  fs.writeFileSync(timingPath, JSON.stringify(timing, null, 2) + "\n");
  console.log(
    `done, speech ${bounds.start}-${bounds.end} s of ${timing.durationSeconds} s, ${words.length} words (${bounds.note})`,
  );
  return scene.narration.length;
};

const main = async () => {
  fs.mkdirSync(audioDir, { recursive: true });
  fs.mkdirSync(timingDir, { recursive: true });
  let chars = 0;
  // One scene at a time (simple, and stays under API concurrency limits).
  for (let i = 0; i < scenes.length; i++) {
    if (only && !only.includes(scenes[i].id)) continue;
    chars += await generate(i);
  }
  console.log(`\nCharacters sent: ${chars} (≈ credits used)`);
};

main().catch((e: unknown) => fail((e as Error).message));
