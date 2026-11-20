// "dotmap": a grid of dots (one per item), optional counters above it, and
// highlighted dots with a label card.
// Cue targets: counter index 0, 1, 2... (show), "grid" (show), highlight id (highlight).
import {
  AbsoluteFill,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { highlight, visibility } from "../cues";
import { theme } from "../theme";
import type { DotmapVisual } from "../types";
import { appearStyle, type VisualProps } from "./common";
import { Counter } from "./Counters";

const DOT = 34;
const GAP = 20;

/**
 * Which dot a highlight lights up. The data has no positions, so each id gets a
 * fixed, spread-out dot (same id -> same dot every render).
 */
const dotIndexFor = (id: string, count: number, taken: Set<number>): number => {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 100003;
  let i = h % count;
  while (taken.has(i)) i = (i + 1) % count;
  taken.add(i);
  return i;
};

export const Dotmap: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as DotmapVisual;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const highlights = v.highlights ?? [];
  const taken = new Set<number>();
  const lit = highlights.map((h) => ({
    ...h,
    dot: dotIndexFor(h.id, v.count, taken),
    amount: highlight(cues, h.id, frame, fps),
  }));

  // The grid appears on its "grid" show cue, or at the start if there is none.
  const grid = visibility(cues, "grid", frame, fps);

  return (
    <AbsoluteFill
      style={{ padding: "40px 120px", gap: 50, alignItems: "center" }}
    >
      {v.counters?.length ? (
        <div style={{ display: "flex", gap: 120, justifyContent: "center" }}>
          {v.counters.map((item, i) => (
            <Counter key={i} item={item} index={i} cues={cues} />
          ))}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 80, alignItems: "center" }}>
        {/* the grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${v.columns}, ${DOT}px)`,
            gap: GAP,
            opacity: grid,
          }}
        >
          {Array.from({ length: v.count }, (_, i) => {
            const h = lit.find((l) => l.dot === i);
            const amount = h?.amount ?? 0;
            return (
              <div
                key={i}
                style={{
                  width: DOT,
                  height: DOT,
                  borderRadius: DOT / 2,
                  backgroundColor: interpolateColors(
                    amount,
                    [0, 1],
                    [theme.accent, theme.warn],
                  ),
                  transform: `scale(${1 + 0.5 * amount})`,
                  boxShadow:
                    amount > 0 ? `0 0 ${30 * amount}px ${theme.warn}` : "none",
                }}
              />
            );
          })}
        </div>

        {/* label cards for highlighted dots */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            width: 820,
          }}
        >
          {lit.map((h) => (
            <div
              key={h.id}
              style={{
                ...appearStyle(h.amount, 30),
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "22px 30px",
                borderRadius: theme.radius,
                backgroundColor: theme.panel,
                border: `3px solid ${theme.warn}`,
                fontSize: theme.size.body,
                lineHeight: 1.2,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: DOT,
                  height: DOT,
                  borderRadius: DOT / 2,
                  backgroundColor: theme.warn,
                }}
              />
              {h.label}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
