// Types describing scenes.json. Shared by the Remotion code (src/) and the
// Node scripts (scripts/), so keep this file free of React/Remotion imports.

export type Meta = {
  title: string;
  fps: number;
  width: number;
  height: number;
  captions: boolean;
  /** Silence added after each scene's narration, in seconds. */
  padSeconds: number;
  /** Length goals for `npm run check`, in seconds. Defaults: 90 and 120. */
  targetSeconds?: number;
  maxSeconds?: number;
  /** Optional background music file (relative to public/). No music if unset. */
  music?: string;
};

export type VoiceConfig = {
  modelId: string;
  settings: Record<string, number | boolean>;
};

/** Colours (any CSS colour). All optional: missing ones use the defaults in src/theme.ts. */
export type ThemeConfig = {
  bg?: string; // background
  accent?: string; // highlights, numbers, current caption word
  text?: string;
  warn?: string; // problems, badges, highlighted dots
  panel?: string; // card / box fill on top of bg
  panelBorder?: string;
  captionBg?: string; // box behind the captions
  deviceBezel?: string; // phone frame body
  deviceScreen?: string; // behind clips/images until they load (normally hidden)
  browserBar?: string; // window bar of the "browser" frame
};

/** Every visual type the engine knows. check-scenes warns about anything else. */
export const VISUAL_TYPES = [
  "title",
  "cards",
  "counters",
  "clip",
  "image",
  "dotmap",
  "pipeline",
  "bigStat",
  "chart",
  "twoColumns",
] as const;
export type VisualType = (typeof VISUAL_TYPES)[number];

/** Generic visual: a `type` plus whatever props that type needs. */
export type Visual = { type: string } & Record<string, unknown>;

export type TitleVisual = {
  type: "title";
  title: string;
  subtitle?: string;
  footer?: string;
};

export type CardsVisual = {
  type: "cards";
  items: { title: string; text?: string }[];
};

export type CounterItem = { value: number; label: string; suffix?: string };

export type CountersVisual = {
  type: "counters";
  items: CounterItem[];
};

export type FrameKind = "phone" | "browser" | "none";

/** Fractions (0–1) of the source cut off on each side, e.g. to hide a browser's tab bar. */
export type Crop = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
};

export type ClipVisual = {
  type: "clip";
  src: string; // relative to public/, e.g. "clips/c1_home.mp4"
  frame?: FrameKind;
  trimStart?: number; // seconds skipped at the start of the recording
  trimEnd?: number; // seconds into the recording where it stops
  speed?: number; // 1 = normal, 1.25 = 25 % faster
  crop?: Crop;
};

export type ImageVisual = {
  type: "image";
  src: string;
  frame?: FrameKind;
  crop?: Crop;
};

export type DotmapVisual = {
  type: "dotmap";
  count: number;
  columns: number;
  highlights?: { id: string; label: string }[];
  counters?: CounterItem[];
};

export type PipelineVisual = {
  type: "pipeline";
  steps: { title: string; text?: string }[];
  badge?: string;
};

export type BigStatVisual = {
  type: "bigStat";
  value: number | string;
  label: string;
  insight?: string;
};

export type ChartVisual = {
  type: "chart";
  kind: "line" | "bar";
  points: number[];
  label?: string;
  /** Text on the highlighted band (cue target "band"), e.g. "season". Default: no text. */
  bandLabel?: string;
};

export type TwoColumnsVisual = {
  type: "twoColumns";
  left: { heading: string; items: string[]; marker?: string };
  right: { heading: string; items: string[]; marker?: string };
  footer?: string;
};

export const CUE_ACTIONS = [
  "show",
  "hide",
  "highlight",
  "zoom",
  "fadeOut",
] as const;
export type CueAction = (typeof CUE_ACTIONS)[number];

/** What a cue points at: an item index, a named element, or zoom settings. */
export type CueTarget =
  | number
  | string
  | { scale: number; x: number; y: number };

export type Cue = {
  atWord?: string;
  /** 1 = first match of atWord (default), 2 = second, ... */
  occurrence?: number;
  /** 0–1 of the scene length. Used when there is no atWord (or it isn't found). */
  atFraction?: number;
  offsetSeconds?: number;
  action: string;
  target?: CueTarget;
};

export type Scene = {
  id: string;
  narration: string;
  estSeconds: number;
  /** Pause after this scene, in seconds. Overrides meta.padSeconds (e.g. longer after the intro). */
  padSeconds?: number;
  /** false = generate this scene's voice without the neighbouring scenes' text as context. */
  voiceContext?: boolean;
  visual: Visual;
  cues?: Cue[];
};

export type ScenesFile = {
  meta: Meta;
  voice: VoiceConfig;
  theme?: ThemeConfig;
  scenes: Scene[];
};

/** public/timing/<id>.json, written by `npm run voice` (later also by Whisper, M6). */
export type TimingWord = { text: string; start: number; end: number };

export type TimingFile = {
  id: string;
  source: string;
  /** Hash of narration + voice + settings; voice.ts skips the scene if unchanged. */
  hash: string;
  /** Length of the audio file in seconds. */
  durationSeconds: number;
  /** Seconds into the file where the speech starts / ends; silence and noise outside
   *  are not played. Optional (missing = whole file). Word times stay in file time. */
  audioStart?: number;
  audioEnd?: number;
  /** Audio file relative to public/, e.g. "audio/s01.wav" (own recording). Default: audio/<id>.mp3. */
  audioFile?: string;
  words: TimingWord[];
};
