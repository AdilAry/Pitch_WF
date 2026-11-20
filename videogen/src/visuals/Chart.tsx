// "chart": a line (or bar) chart that draws itself.
// Cue targets: "line" (show = start drawing), "band" (highlight = shaded band over the
// rising part, with text "bandLabel"; "seasonBand" also works), "questionMark" (show:
// big "?" at the newest point), "phoneIcon" (show: a call icon).
// The band, "?" and phone icon are extras: they only appear when a cue targets them.
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { highlight, visibility, type ResolvedCue } from "../cues";
import { theme } from "../theme";
import type { ChartVisual } from "../types";
import { appearStyle, type VisualProps } from "./common";

// Chart area inside the SVG (SVG units = px, the SVG is 1500 x 640).
const W = 1500;
const H = 640;
const PAD = { left: 120, right: 40, top: 30, bottom: 40 };
const DRAW_SECONDS = 1.5; // how long the line takes to draw

/** Frame of the first "show" cue for a target, or 0 if there is none. */
const showFrame = (cues: ResolvedCue[], target: string) =>
  cues.find((c) => c.action === "show" && String(c.target) === target)?.frame ??
  0;

export const Chart: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as ChartVisual;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pts = v.points;
  // Y axis: round outwards to tens, with a little room.
  const yMin = Math.floor((Math.min(...pts) - 5) / 10) * 10;
  const yMax = Math.ceil((Math.max(...pts) + 5) / 10) * 10;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (pts.length === 1 ? 0 : (i / (pts.length - 1)) * plotW);
  const y = (val: number) =>
    PAD.top + (1 - (val - yMin) / (yMax - yMin)) * plotH;

  // Drawing progress 0..1, starting at the "line" cue.
  const start = showFrame(cues, "line");
  const draw = interpolate(frame, [start, start + DRAW_SECONDS * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  /** Is this optional extra used by any cue? */
  const used = (...targets: string[]) =>
    cues.some((c) => targets.includes(String(c.target)));
  const band =
    highlight(cues, "band", frame, fps) ||
    highlight(cues, "seasonBand", frame, fps);
  const question = used("questionMark")
    ? visibility(cues, "questionMark", frame, fps)
    : 0;
  const phone = used("phoneIcon")
    ? visibility(cues, "phoneIcon", frame, fps)
    : 0;

  // The band covers the part where the values climb: from the last point
  // before the steepest rise to the end.
  let riseFrom = 0;
  pts.forEach((p, i) => {
    if (i > 0 && p - pts[i - 1] > 3 && riseFrom === 0) riseFrom = i - 1;
  });

  const yTicks = [];
  for (let t = yMin; t <= yMax; t += 10) yTicks.push(t);

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p)}`)
    .join(" ");
  const last = pts.length - 1;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {v.label ? (
        <div
          style={{
            fontSize: theme.size.body,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          {v.label}
        </div>
      ) : null}
      <div style={{ position: "relative", width: W, height: H }}>
        <svg width={W} height={H}>
          {/* season band (behind everything) */}
          <rect
            x={x(riseFrom)}
            y={PAD.top}
            width={x(last) - x(riseFrom)}
            height={plotH}
            fill={theme.warn}
            opacity={0.18 * band}
          />
          {/* grid + y labels */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={theme.panelBorder}
                strokeWidth={2}
              />
              <text
                x={PAD.left - 24}
                y={y(t) + 14}
                fill={theme.text}
                opacity={theme.mutedOpacity}
                fontSize={40}
                textAnchor="end"
                fontFamily={theme.fontFamily}
              >
                {t}
              </text>
            </g>
          ))}
          {v.kind === "bar" ? (
            pts.map((p, i) => {
              const barW = (plotW / pts.length) * 0.6;
              // Bars grow one after another as `draw` goes 0 -> 1.
              const grow = Math.min(Math.max(draw * pts.length - i, 0), 1);
              const h = (y(yMin) - y(p)) * grow;
              return (
                <rect
                  key={i}
                  x={PAD.left + (i + 0.2) * (plotW / pts.length)}
                  y={y(yMin) - h}
                  width={barW}
                  height={h}
                  rx={8}
                  fill={theme.accent}
                />
              );
            })
          ) : (
            // pathLength=1 lets us draw a fraction of the line with strokeDashoffset.
            <path
              d={linePath}
              pathLength={1}
              fill="none"
              stroke={theme.accent}
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={1}
              strokeDashoffset={1 - draw}
            />
          )}
          {/* dot at the newest point once the line reaches it */}
          {v.kind !== "bar" && draw >= 1 ? (
            <circle cx={x(last)} cy={y(pts[last])} r={16} fill={theme.accent} />
          ) : null}
        </svg>

        {/* label on the band, e.g. "season" */}
        <div
          style={{
            position: "absolute",
            left: x(riseFrom),
            width: x(last) - x(riseFrom),
            bottom: PAD.bottom + 16,
            textAlign: "center",
            fontSize: theme.size.body,
            fontWeight: 600,
            color: theme.warn,
            opacity: band,
          }}
        >
          {v.bandLabel ?? ""}
        </div>

        {/* big question mark next to the newest point */}
        <div
          style={{
            ...appearStyle(question, 30),
            position: "absolute",
            left: x(last) - 150,
            top: y(pts[last]) - 120,
            fontSize: 160,
            fontWeight: 800,
            color: theme.warn,
            lineHeight: 1,
          }}
        >
          ?
        </div>

        {/* phone (call) icon */}
        <div
          style={{
            ...appearStyle(phone, 30),
            position: "absolute",
            left: PAD.left + 40,
            top: PAD.top + 20,
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: theme.warn,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <svg width={80} height={80} viewBox="0 0 24 24">
            {/* phone handset (Material icon "call" path) */}
            <path
              fill={theme.bg}
              d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"
            />
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
