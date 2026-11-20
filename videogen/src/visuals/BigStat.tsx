// "bigStat": one huge number + label + optional insight line.
// Numbers count up from 0 when shown. Cue targets: "value", "label", "insight" (show).
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { visibility } from "../cues";
import { theme } from "../theme";
import type { BigStatVisual } from "../types";
import { appearStyle, type VisualProps } from "./common";

export const BigStat: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as BigStatVisual;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const value = visibility(cues, "value", frame, fps);
  const label = visibility(cues, "label", frame, fps);
  const insight = visibility(cues, "insight", frame, fps);

  const start =
    cues.find((c) => c.action === "show" && c.target === "value")?.frame ?? 0;
  const shownValue =
    typeof v.value === "number"
      ? Math.round(
          interpolate(frame, [start, start + fps], [0, v.value], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
        )
      : v.value; // text values (e.g. "0 rpm") are shown as they are

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          ...appearStyle(value),
          fontSize: 260,
          fontWeight: 800,
          color: theme.accent,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {shownValue}
      </div>
      <div
        style={{
          ...appearStyle(label),
          fontSize: theme.size.heading,
          fontWeight: 700,
        }}
      >
        {v.label}
      </div>
      {v.insight ? (
        <div
          style={{
            ...appearStyle(insight),
            marginTop: 30,
            maxWidth: 1300,
            fontSize: theme.size.body,
            opacity: insight * theme.mutedOpacity,
          }}
        >
          {v.insight}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
