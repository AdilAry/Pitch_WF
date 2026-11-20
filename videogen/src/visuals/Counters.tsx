// "counters": animated numbers that count up when shown. Cue targets: item index 0, 1, 2...
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { visibility } from "../cues";
import { theme } from "../theme";
import type { CounterItem, CountersVisual } from "../types";
import { appearStyle, type VisualProps } from "./common";

/** One counter. Exported so other visuals (dotmap, M4) can reuse it. */
export const Counter: React.FC<{
  item: CounterItem;
  index: number;
  cues: VisualProps["cues"];
}> = ({ item, index, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = visibility(cues, index, frame, fps);
  // Count up over ~1 s once the counter starts appearing.
  const showFrame =
    cues.find((c) => c.action === "show" && String(c.target) === String(index))
      ?.frame ?? 0;
  const count = interpolate(
    frame,
    [showFrame, showFrame + fps],
    [0, item.value],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  return (
    <div style={{ ...appearStyle(shown), textAlign: "center", minWidth: 320 }}>
      <div
        style={{
          fontSize: theme.size.counter,
          fontWeight: 800,
          color: theme.accent,
          // Tabular digits keep the number from wobbling while it counts.
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.1,
        }}
      >
        {Math.round(count)}
        {item.suffix ?? ""}
      </div>
      <div style={{ fontSize: theme.size.body, opacity: theme.mutedOpacity }}>
        {item.label}
      </div>
    </div>
  );
};

export const Counters: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as CountersVisual;
  return (
    <AbsoluteFill
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 120,
      }}
    >
      {v.items.map((item, i) => (
        <Counter key={i} item={item} index={i} cues={cues} />
      ))}
    </AbsoluteFill>
  );
};
