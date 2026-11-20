// "twoColumns": two lists side by side (e.g. free vs paid) and an optional footer.
// Cue targets: "left", "right", "footer" (show). List items follow their column one by one.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ramp, visibility, type ResolvedCue } from "../cues";
import { theme } from "../theme";
import type { TwoColumnsVisual } from "../types";
import { appearStyle, type VisualProps } from "./common";

const ITEM_DELAY = 0.15; // seconds between list items appearing

const Column: React.FC<{
  side: "left" | "right";
  data: TwoColumnsVisual["left"];
  cues: ResolvedCue[];
  accent: boolean;
}> = ({ side, data, cues, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = visibility(cues, side, frame, fps);
  const start =
    cues.find((c) => c.action === "show" && c.target === side)?.frame ?? 0;
  return (
    <div
      style={{
        ...appearStyle(shown, 50),
        flex: 1,
        padding: 56,
        borderRadius: theme.radius,
        backgroundColor: theme.panel,
        border: `4px solid ${accent ? theme.accent : theme.panelBorder}`,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div
        style={{
          fontSize: theme.size.heading,
          fontWeight: 800,
          color: accent ? theme.accent : theme.text,
          marginBottom: 8,
        }}
      >
        {data.heading}
      </div>
      {data.items.map((item, i) => (
        <div
          key={i}
          style={{
            ...appearStyle(
              ramp(frame, start + (i + 1) * ITEM_DELAY * fps, fps),
              20,
            ),
            fontSize: theme.size.body,
            display: "flex",
            gap: 20,
            alignItems: "center",
          }}
        >
          <span style={{ color: theme.accent, fontWeight: 800 }}>
            {data.marker ?? "✓"}
          </span>
          {item}
        </div>
      ))}
    </div>
  );
};

export const TwoColumns: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as TwoColumnsVisual;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const footer = visibility(cues, "footer", frame, fps);
  return (
    <AbsoluteFill
      style={{ padding: "60px 160px", gap: 50, justifyContent: "center" }}
    >
      <div style={{ display: "flex", gap: 60 }}>
        <Column side="left" data={v.left} cues={cues} accent={false} />
        <Column side="right" data={v.right} cues={cues} accent />
      </div>
      {v.footer ? (
        <div
          style={{
            ...appearStyle(footer, 20),
            textAlign: "center",
            fontSize: theme.size.heading,
            fontWeight: 700,
            color: theme.warn,
            whiteSpace: "pre-line", // "\n" in the footer starts a new line
            margin: "0 -100px", // long footers may be wider than the columns
          }}
        >
          {v.footer}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
