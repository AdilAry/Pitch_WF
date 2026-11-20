// Registry: visual "type" in scenes.json -> React component.
// To add a visual type: create the component, then add it here (and to VISUAL_TYPES in types.ts).
import { BigStat } from "./BigStat";
import { Cards } from "./Cards";
import { Chart } from "./Chart";
import { Clip } from "./Clip";
import type { VisualProps } from "./common";
import { Counters } from "./Counters";
import { Dotmap } from "./Dotmap";
import { ImageVisual } from "./ImageVisual";
import { Pipeline } from "./Pipeline";
import { Placeholder } from "./Placeholder";
import { Title } from "./Title";
import { TwoColumns } from "./TwoColumns";

const registry: Record<string, React.FC<VisualProps>> = {
  title: Title,
  cards: Cards,
  counters: Counters,
  clip: Clip,
  image: ImageVisual,
  dotmap: Dotmap,
  pipeline: Pipeline,
  bigStat: BigStat,
  chart: Chart,
  twoColumns: TwoColumns,
};

/** Component for a visual type; unknown types get the labelled placeholder. */
export const getVisualComponent = (type: string): React.FC<VisualProps> =>
  registry[type] ?? Placeholder;
