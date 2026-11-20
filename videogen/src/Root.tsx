// Registers the compositions shown in Remotion Studio's left sidebar.
//   "Video" - the whole video (this is what `npm run render` renders)
//   "Scene" - one scene only; change "sceneId" in the Props panel on the right
import { Composition, type CalculateMetadataFunction } from "remotion";
import { meta, scenes } from "./scenes";
import { SceneAudio, SceneView } from "./SceneView";
import {
  loadTimings,
  sceneDurationInFrames,
  setTimings,
  totalDurationInFrames,
  type Timings,
} from "./timing";
import { Video } from "./Video";

// `timings` is filled in by calculateMetadata; you never need to edit it by hand.
type VideoProps = { timings: Timings };
type SceneProps = { sceneId: string; timings: Timings };

// calculateMetadata runs once before preview/render: it loads the timing files,
// sets the length, and hands the timings to the component as a prop.
// (Props are the only thing that reaches every render process, so timings travel that way.)
const calculateVideoMetadata: CalculateMetadataFunction<VideoProps> = async ({
  props,
}) => {
  const timings = await loadTimings();
  setTimings(timings);
  return {
    durationInFrames: totalDurationInFrames(scenes.map((s) => s.id)),
    props: { ...props, timings },
  };
};

/** The Scene preview's sceneId, or the first scene if that id isn't in scenes.json. */
const sceneOrFirst = (sceneId: string): string => {
  if (scenes.some((s) => s.id === sceneId)) return sceneId;
  console.warn(
    `Scene "${sceneId}" not in scenes.json; showing "${scenes[0].id}"`,
  );
  return scenes[0].id;
};

const calculateSceneMetadata: CalculateMetadataFunction<SceneProps> = async ({
  props,
}) => {
  const timings = await loadTimings();
  setTimings(timings);
  return {
    durationInFrames: sceneDurationInFrames(sceneOrFirst(props.sceneId)),
    props: { ...props, timings },
  };
};

const VideoComposition: React.FC<VideoProps> = ({ timings }) => {
  setTimings(timings); // must run before the scenes render (parents render first)
  return <Video />;
};

const SceneComposition: React.FC<SceneProps> = ({ sceneId, timings }) => {
  setTimings(timings);
  const id = sceneOrFirst(sceneId);
  return (
    <>
      <SceneAudio sceneId={id} />
      <SceneView sceneId={id} />
    </>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video"
        component={VideoComposition}
        fps={meta.fps}
        width={meta.width}
        height={meta.height}
        durationInFrames={1} // replaced by calculateMetadata
        defaultProps={{ timings: {} }}
        calculateMetadata={calculateVideoMetadata}
      />
      <Composition
        id="Scene"
        component={SceneComposition}
        fps={meta.fps}
        width={meta.width}
        height={meta.height}
        durationInFrames={1} // replaced by calculateMetadata
        defaultProps={{ sceneId: "s01", timings: {} }} // edit sceneId in the Props panel; unknown ids show the first scene
        calculateMetadata={calculateSceneMetadata}
      />
    </>
  );
};
