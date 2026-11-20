// Turns the cues of a scene into frame numbers, plus helpers that visuals use to
// ask "how visible / highlighted is element X at this frame?" (0 = not at all, 1 = fully).
import { Easing, interpolate } from "remotion";
import { frameOfWord } from "./timing";
import {
  CUE_ACTIONS,
  type CueAction,
  type CueTarget,
  type Scene,
} from "./types";

export type ResolvedCue = {
  frame: number;
  action: CueAction;
  target?: CueTarget;
};

/** Animation length for appear/disappear/highlight: 0.5 s (calm motion). */
const ANIM_SECONDS = 0.5;

// Each warning is printed only once, not on every frame.
const warned = new Set<string>();
const warnOnce = (msg: string) => {
  if (!warned.has(msg)) {
    warned.add(msg);
    console.warn(msg);
  }
};

/** Resolve every cue of a scene to a frame. Bad cues are skipped with a warning, never a crash. */
export const resolveCues = (
  scene: Scene,
  durationInFrames: number,
  fps: number,
): ResolvedCue[] => {
  const result: ResolvedCue[] = [];
  for (const cue of scene.cues ?? []) {
    if (!(CUE_ACTIONS as readonly string[]).includes(cue.action)) {
      warnOnce(`[${scene.id}] unknown cue action "${cue.action}", ignored`);
      continue;
    }
    let frame: number | null = null;
    if (cue.atWord !== undefined) {
      frame = frameOfWord(scene.id, cue.atWord, cue.occurrence ?? 1);
      if (frame === null) {
        warnOnce(
          `[${scene.id}] cue word "${cue.atWord}" not found in narration`,
        );
      }
    }
    if (frame === null && cue.atFraction !== undefined) {
      frame = Math.round(cue.atFraction * durationInFrames);
    }
    if (frame === null) continue;
    frame += Math.round((cue.offsetSeconds ?? 0) * fps);
    frame = Math.min(Math.max(frame, 0), durationInFrames - 1);
    result.push({ frame, action: cue.action as CueAction, target: cue.target });
  }
  return result.sort((a, b) => a.frame - b.frame);
};

/** 0 and "0" count as the same target. */
const sameTarget = (a: CueTarget | undefined, b: CueTarget) =>
  String(a) === String(b);

/** Smooth 0 -> 1 ramp that starts at `start` and lasts ANIM_SECONDS. */
export const ramp = (frame: number, start: number, fps: number): number =>
  interpolate(frame, [start, start + ANIM_SECONDS * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

/**
 * Visibility (0..1) of a target at `frame`.
 * - If a "show" cue targets it, it appears at that cue.
 * - Otherwise it appears at the start of the scene.
 * - A "hide" cue makes it disappear again.
 */
export const visibility = (
  cues: ResolvedCue[],
  target: CueTarget,
  frame: number,
  fps: number,
): number => {
  const show = cues.find(
    (c) => c.action === "show" && sameTarget(c.target, target),
  );
  const hide = cues.find(
    (c) => c.action === "hide" && sameTarget(c.target, target),
  );
  const shown = ramp(frame, show ? show.frame : 0, fps);
  const hidden = hide ? ramp(frame, hide.frame, fps) : 0;
  return shown * (1 - hidden);
};

/** Highlight amount (0..1) of a target: rises at its first "highlight" cue, then stays. */
export const highlight = (
  cues: ResolvedCue[],
  target: CueTarget,
  frame: number,
  fps: number,
): number => {
  const cue = cues.find(
    (c) => c.action === "highlight" && sameTarget(c.target, target),
  );
  return cue ? ramp(frame, cue.frame, fps) : 0;
};

/** Whole-scene opacity: 1, fading to 0 after a "fadeOut" cue. */
export const sceneOpacity = (
  cues: ResolvedCue[],
  frame: number,
  fps: number,
): number => {
  const cue = cues.find((c) => c.action === "fadeOut");
  return cue ? 1 - ramp(frame, cue.frame, fps) : 1;
};
