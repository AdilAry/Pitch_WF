// Colours, font and sizes. Colours can be overridden from scenes.json "theme".
import { cancelRender, continueRender, delayRender } from "remotion";
import interUrl from "./fonts/inter-latin.woff2";
import { data } from "./scenes";
import type { ThemeConfig } from "./types";

// Inter (latin), shipped in src/fonts so previews and renders work offline. One variable
// font file covers every weight. Remotion waits for the font before rendering frames.
const fontFamily = "Inter";
const fontHandle = delayRender("Loading the font");
Promise.all(
  ["400", "600", "700", "800"].map((weight) =>
    new FontFace(fontFamily, `url(${interUrl})`, { weight }).load(),
  ),
)
  .then((faces) => {
    faces.forEach((face) => document.fonts.add(face));
    continueRender(fontHandle);
  })
  .catch((err) => cancelRender(err));

// Default colours. Every one can be overridden in scenes.json "theme".
const defaults: Required<ThemeConfig> = {
  bg: "#0F2A3D",
  accent: "#1B998B",
  text: "#FFFFFF",
  warn: "#F2A541",
  panel: "rgba(255, 255, 255, 0.07)",
  panelBorder: "rgba(255, 255, 255, 0.15)",
  captionBg: "rgba(0, 0, 0, 0.45)",
  deviceBezel: "#0A0F14",
  deviceScreen: "#FFFFFF",
  browserBar: "#E8ECEF",
};

export const theme = {
  ...defaults,
  ...data.theme,
  fontFamily,
  /** Secondary text: same colour, slightly transparent. */
  mutedOpacity: 0.75,
  size: {
    title: 120, // titles >= 96 px
    heading: 64,
    body: 48, // body text >= 48 px
    counter: 160,
  },
  /** Safe margin from the frame edges, in px. */
  margin: 120,
  /** Height kept free at the bottom for captions (when meta.captions is true), in px. */
  captionSpace: 220,
  radius: 28,
};
