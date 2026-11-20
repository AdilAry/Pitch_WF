// Loads scenes.json into the Remotion bundle.
// Because it is a normal import, Studio reloads automatically when you save scenes.json.
import raw from "../scenes.json";
import type { Scene, ScenesFile } from "./types";

// TypeScript infers a very literal type from the JSON file; we tell it to use our
// hand-written ScenesFile type instead. (check-scenes validates the real content.)
export const data = raw as unknown as ScenesFile;

export const meta = data.meta;
export const scenes: Scene[] = data.scenes;

export const getScene = (id: string): Scene => {
  const scene = scenes.find((s) => s.id === id);
  if (!scene) {
    throw new Error(
      `Scene "${id}" not found in scenes.json. Available ids: ${scenes.map((s) => s.id).join(", ")}`,
    );
  }
  return scene;
};
