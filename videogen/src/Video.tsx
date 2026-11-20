// The full video: every scene from scenes.json, one after another, with a short
// crossfade between scenes.
//
// A transition makes two scenes overlap. To keep the voice timing (and the pauses
// tuned with padSeconds) exactly the same, every scene except the last is made
// TRANSITION frames longer: the old scene keeps showing while the new one fades in,
// and each new scene still starts at the same moment as without transitions.
//
// The crossfade is a plain opacity on a <Sequence>, not Remotion's TransitionSeries:
// TransitionSeries adds and removes a wrapper at the start and end of each crossfade,
// which remounts the scene. A remounted clip disappears until its video has loaded
// again, seen as flashes in Studio. premountFor loads each scene before it starts.
//
// All voice-over lives in its own layer of plain <Sequence>s, one per scene,
// starting at the same frames as the scenes.
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { SceneAudio, SceneView } from "./SceneView";
import { meta, scenes } from "./scenes";
import { theme } from "./theme";
import { sceneDurationInFrames } from "./timing";

/** Crossfade length: 0.4 s. */
export const TRANSITION_FRAMES = Math.round(0.4 * meta.fps);
/** How long before its start a scene is mounted, so its clip has loaded: 2 s. */
const PREMOUNT_FRAMES = 2 * meta.fps;

/** Fades its scene in over the previous one (frame 0 = scene start). */
const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const opacity = interpolate(
    useCurrentFrame(),
    [0, TRANSITION_FRAMES],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

export const Video: React.FC = () => {
  // Scene start frames: each scene starts where the previous one would end without
  // the transition overlap.
  const startFrames = scenes.map((_, i) =>
    scenes
      .slice(0, i)
      .reduce((sum, s) => sum + sceneDurationInFrames(s.id), 0),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      {scenes.map((scene, i) => (
        <Sequence
          key={`${scene.id}-voice`}
          name={`${scene.id} voice`}
          from={startFrames[i]}
          durationInFrames={sceneDurationInFrames(scene.id)}
          layout="none"
        >
          <SceneAudio sceneId={scene.id} />
        </Sequence>
      ))}
      {scenes.map((scene, i) => {
        const isLast = i === scenes.length - 1;
        const view = <SceneView sceneId={scene.id} />;
        return (
          <Sequence
            key={scene.id}
            name={scene.id} // label shown in the Studio timeline
            from={startFrames[i]}
            durationInFrames={
              sceneDurationInFrames(scene.id) +
              (isLast ? 0 : TRANSITION_FRAMES)
            }
            premountFor={PREMOUNT_FRAMES}
          >
            {i === 0 ? view : <FadeIn>{view}</FadeIn>}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
