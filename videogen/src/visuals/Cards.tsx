// "cards": 2–4 cards side by side. Cue targets: card index 0, 1, 2, 3
// ("show" makes a card appear, "highlight" gives it an accent border).
import {
  AbsoluteFill,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { highlight, visibility } from "../cues";
import { theme } from "../theme";
import type { CardsVisual } from "../types";
import { appearStyle, type VisualProps } from "./common";

export const Cards: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as CardsVisual;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: theme.margin,
      }}
    >
      {/* All cards in the row get the height of the tallest one. */}
      <div style={{ display: "flex", gap: 48 }}>
      {v.items.map((item, i) => {
        const shown = visibility(cues, i, frame, fps);
        const lit = highlight(cues, i, frame, fps);
        return (
          <div
            key={i}
            style={{
              ...appearStyle(shown, 60),
              flex: 1,
              minHeight: 360,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 24,
              padding: 56,
              borderRadius: theme.radius,
              backgroundColor: theme.panel,
              // Border colour fades from the normal panel border to the accent colour.
              border: `4px solid ${interpolateColors(lit, [0, 1], [theme.panelBorder, theme.accent])}`,
              borderTop: `12px solid ${theme.accent}`,
            }}
          >
            <div
              style={{
                fontSize: theme.size.heading,
                fontWeight: 700,
                lineHeight: 1.15,
              }}
            >
              {item.title}
            </div>
            {item.text ? (
              <div
                style={{
                  fontSize: theme.size.body,
                  opacity: theme.mutedOpacity,
                }}
              >
                {item.text}
              </div>
            ) : null}
          </div>
        );
      })}
      </div>
    </AbsoluteFill>
  );
};
