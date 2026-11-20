// "title": title card with optional subtitle and footer.
// Cue targets: "title", "subtitle", "footer".
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { visibility } from "../cues";
import { theme } from "../theme";
import type { TitleVisual } from "../types";
import { appearStyle, type VisualProps } from "./common";

export const Title: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as TitleVisual;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const title = visibility(cues, "title", frame, fps);
  const subtitle = visibility(cues, "subtitle", frame, fps);
  const footer = visibility(cues, "footer", frame, fps);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          ...appearStyle(title),
          fontSize: theme.size.title,
          fontWeight: 800,
        }}
      >
        {v.title}
      </div>
      {/* Accent bar under the title; grows from the centre together with the title. */}
      <div
        style={{
          width: 160 * title,
          height: 10,
          borderRadius: 5,
          backgroundColor: theme.accent,
          margin: "36px 0",
        }}
      />
      {v.subtitle ? (
        <div
          style={{
            ...appearStyle(subtitle),
            fontSize: theme.size.heading,
            fontWeight: 600,
          }}
        >
          {v.subtitle}
        </div>
      ) : null}
      {v.footer ? (
        <div
          style={{
            ...appearStyle(footer, 20),
            position: "absolute",
            bottom: theme.margin,
            left: theme.margin,
            right: theme.margin,
            fontSize: theme.size.body,
            opacity: footer * theme.mutedOpacity,
          }}
        >
          {v.footer}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
