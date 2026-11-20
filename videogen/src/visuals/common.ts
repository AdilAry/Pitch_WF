// Things every visual component shares.
import type React from "react";
import type { ResolvedCue } from "../cues";
import type { Visual } from "../types";

/** Props every visual component receives from SceneView. */
export type VisualProps = {
  sceneId: string;
  /** The scene's "visual" object from scenes.json. Each component casts it to its own type. */
  visual: Visual;
  cues: ResolvedCue[];
};

/** Fade + slide up, driven by a 0..1 visibility value. */
export const appearStyle = (v: number, distance = 40): React.CSSProperties => ({
  opacity: v,
  transform: `translateY(${(1 - v) * distance}px)`,
});
