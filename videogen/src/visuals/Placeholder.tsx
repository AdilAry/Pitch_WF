// Shown for visual types that aren't built yet (or unknown types), so the whole
// scenes.json still previews. It lists the cues and fades each one in at its frame.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ramp } from "../cues";
import { theme } from "../theme";
import type { VisualProps } from "./common";

export const Placeholder: React.FC<VisualProps> = ({
  sceneId,
  visual,
  cues,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        // AbsoluteFill fills the frame; inset it by the safe margin on all sides.
        inset: theme.margin,
        width: "auto",
        height: "auto",
        border: `6px dashed ${theme.panelBorder}`,
        borderRadius: theme.radius,
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: theme.size.title,
          fontWeight: 800,
          color: theme.warn,
        }}
      >
        {visual.type}
      </div>
      <div style={{ fontSize: theme.size.body, opacity: theme.mutedOpacity }}>
        {sceneId} · visual not built yet (placeholder)
      </div>
      <div
        style={{
          fontSize: theme.size.body,
          marginTop: 24,
          opacity: theme.mutedOpacity,
        }}
      >
        {cues.map((c, i) => (
          <div
            key={i}
            style={{ opacity: 0.25 + 0.75 * ramp(frame, c.frame, fps) }}
          >
            {c.action} →{" "}
            {typeof c.target === "object"
              ? JSON.stringify(c.target)
              : String(c.target ?? "")}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
