// "pipeline": boxes joined by arrows that light up one by one.
// Cue targets: step index 0, 1, 2... (highlight = light up), "badge" (show).
// Steps start dimmed; without any highlight cues they are all lit.
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { highlight, visibility } from "../cues";
import { theme } from "../theme";
import type { PipelineVisual } from "../types";
import { appearStyle, type VisualProps } from "./common";

export const Pipeline: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as PipelineVisual;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const anyHighlight = cues.some((c) => c.action === "highlight");
  const lit = v.steps.map((_, i) =>
    anyHighlight ? highlight(cues, i, frame, fps) : 1,
  );
  const badge = visibility(cues, "badge", frame, fps);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 70,
        padding: theme.margin,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {v.steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 ? (
              // Arrow lights up together with the step it points to.
              <svg width={100} height={60} viewBox="0 0 120 60">
                <path
                  d="M 10 30 L 95 30 M 80 12 L 104 30 L 80 48"
                  fill="none"
                  stroke={interpolateColors(
                    lit[i],
                    [0, 1],
                    [theme.panelBorder, theme.accent],
                  )}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
            <div
              style={{
                width: 470,
                height: 340, // same size for every box
                boxSizing: "border-box",
                padding: 44,
                borderRadius: theme.radius,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 18,
                backgroundColor: theme.panel,
                border: `5px solid ${interpolateColors(lit[i], [0, 1], [theme.panelBorder, theme.accent])}`,
                opacity: interpolate(lit[i], [0, 1], [0.4, 1]),
                transform: `scale(${1 + 0.05 * lit[i]})`,
              }}
            >
              <div style={{ fontSize: theme.size.heading, fontWeight: 700 }}>
                {step.title}
              </div>
              {step.text ? (
                <div
                  style={{
                    fontSize: theme.size.body,
                    opacity: theme.mutedOpacity,
                  }}
                >
                  {step.text}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {v.badge ? (
        <div
          style={{
            ...appearStyle(badge, 30),
            padding: "18px 40px",
            borderRadius: 999,
            border: `4px solid ${theme.warn}`,
            color: theme.warn,
            fontSize: theme.size.body,
            fontWeight: 700,
          }}
        >
          {v.badge}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
