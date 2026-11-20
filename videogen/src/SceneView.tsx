// Renders one scene: background, its visual, captions and the scene-level fadeOut.
// Used by both the "Video" and the "Scene" compositions.
//
// The voice-over is a separate component (SceneAudio) that the compositions place
// themselves: in "Video" it runs in its own layer, so scene changes can't restart it.
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "./Captions";
import { resolveCues, sceneOpacity } from "./cues";
import { getScene, meta } from "./scenes";
import { theme } from "./theme";
import { getTiming, sceneDurationInFrames } from "./timing";
import { getVisualComponent } from "./visuals";

/** A scene's voice-over. Place it so that frame 0 = scene start. */
export const SceneAudio: React.FC<{ sceneId: string }> = ({ sceneId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timing = getTiming(sceneId);
  // Voice-over: only the trimmed speech part of the mp3, with a 3-frame fade out at
  // the end (that part is silence, so it can never click).
  // No fade in: volume is set per frame, so a fade in mutes the whole first frame
  // (33 ms) and swallowed the first sound of scenes whose speech starts at once.
  const speechFrames = timing ? Math.ceil(timing.durationSeconds * fps) : 0;
  const voiceVolume = interpolate(
    frame,
    [speechFrames - 3, speechFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  if (!timing?.hasAudio) return null;
  return (
    <Audio
      src={staticFile(timing.audioFile)}
      trimBefore={timing.audioStartFrame} // skip leading silence (frames)
      durationInFrames={speechFrames} // stop before trailing silence/noise
      volume={voiceVolume}
    />
  );
};

export const SceneView: React.FC<{ sceneId: string }> = ({ sceneId }) => {
  const frame = useCurrentFrame(); // inside a <Series.Sequence>, frame 0 = scene start
  const { fps } = useVideoConfig();
  // Note: useVideoConfig().durationInFrames is the whole composition, so ask timing.ts
  // for this scene's own length.
  const durationInFrames = sceneDurationInFrames(sceneId);
  const scene = getScene(sceneId);
  const cues = resolveCues(scene, durationInFrames, fps);
  const Visual = getVisualComponent(scene.visual.type);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        fontFamily: theme.fontFamily,
      }}
    >
      <AbsoluteFill style={{ opacity: sceneOpacity(cues, frame, fps) }}>
        {/* With captions on, the visual gets the frame minus a strip at the bottom,
            so captions never cover footers or other content. */}
        <AbsoluteFill
          style={{
            height: "auto",
            bottom: meta.captions ? theme.captionSpace : 0,
          }}
        >
          <Visual sceneId={scene.id} visual={scene.visual} cues={cues} />
        </AbsoluteFill>
        {meta.captions ? <Captions sceneId={scene.id} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
