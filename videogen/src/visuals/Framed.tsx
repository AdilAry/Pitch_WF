// Shared by "clip" and "image": a device frame (phone / browser / none) around some
// content, plus the "zoom" cues ({scale, x, y}) applied to the content inside.
import { AbsoluteFill, Easing, interpolate } from "remotion";
import type { ResolvedCue } from "../cues";
import { meta } from "../scenes";
import { theme } from "../theme";
import type { FrameKind } from "../types";

type Zoom = { scale: number; x: number; y: number };
const NO_ZOOM: Zoom = { scale: 1, x: 0.5, y: 0.5 };
const ZOOM_SECONDS = 0.6;

/**
 * Current zoom at `frame`: each zoom cue moves smoothly (0.6 s) from the previous
 * zoom to its own target. x/y = point to zoom into, as fractions of the content (0–1).
 */
export const zoomAt = (
  cues: ResolvedCue[],
  frame: number,
  fps: number,
): Zoom => {
  let current = NO_ZOOM;
  for (const cue of cues) {
    if (cue.action !== "zoom" || typeof cue.target !== "object") continue;
    if (frame < cue.frame) break; // cues are sorted by frame
    const target = { ...NO_ZOOM, ...cue.target };
    const p = interpolate(
      frame,
      [cue.frame, cue.frame + ZOOM_SECONDS * fps],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      },
    );
    current = {
      scale: current.scale + (target.scale - current.scale) * p,
      x: current.x + (target.x - current.x) * p,
      y: current.y + (target.y - current.y) * p,
    };
  }
  return current;
};

/** Content scaled around the zoom point; anything zoomed past the edges is clipped. */
const Zoomed: React.FC<{ zoom: Zoom; children: React.ReactNode }> = ({
  zoom,
  children,
}) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill
      style={{
        transform: `scale(${zoom.scale})`,
        transformOrigin: `${zoom.x * 100}% ${zoom.y * 100}%`,
      }}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

// Sizes of the frames inside the visual area (1920 x 860 when captions are on).
// The phone's width follows the content's shape (e.g. an iPhone 12 Pro recording is
// 390 x 844 = 0.46 wide:tall), so nothing is cut off; 0.58 when unknown.
const PHONE = { height: 780, bezel: 18, defaultAspect: 0.58 };
const BROWSER = { width: 1360, height: 765, bar: 56 };
const NONE_PADDING = 40;
/** The usual red/yellow/green window buttons of the "browser" frame (not theme colours). */
const WINDOW_DOTS = ["#FF5F57", "#FEBC2E", "#28C840"];

export type ScreenSize = { width: number; height: number };

/** Pixel size of the area inside each frame where the content is drawn. */
const screenSize = (kind: FrameKind, aspect?: number): ScreenSize => {
  if (kind === "phone") {
    const height = PHONE.height - 2 * PHONE.bezel;
    const a = Math.min(Math.max(aspect ?? PHONE.defaultAspect, 0.4), 0.8);
    return { width: Math.round(height * a), height };
  }
  if (kind === "browser")
    return { width: BROWSER.width, height: BROWSER.height - BROWSER.bar };
  const visualHeight = meta.height - (meta.captions ? theme.captionSpace : 0);
  return {
    width: meta.width - 2 * NONE_PADDING,
    height: visualHeight - 2 * NONE_PADDING,
  };
};

export const Framed: React.FC<{
  kind: FrameKind;
  zoom: Zoom;
  /** Width / height of the (cropped) content; the phone frame takes this shape. */
  contentAspect?: number;
  /** Draws the content; gets the screen size so it can fit itself exactly. */
  children: (screen: ScreenSize) => React.ReactNode;
}> = ({ kind, zoom, contentAspect, children }) => {
  const screen = screenSize(kind, contentAspect);
  const content = <Zoomed zoom={zoom}>{children(screen)}</Zoomed>;

  if (kind === "phone") {
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: screen.width + 2 * PHONE.bezel,
            height: PHONE.height,
            padding: PHONE.bezel,
            boxSizing: "border-box", // width/height include the bezel
            borderRadius: 64,
            backgroundColor: theme.deviceBezel,
            boxShadow: `0 0 0 3px ${theme.panelBorder}, 0 30px 80px rgba(0,0,0,0.45)`,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: 48,
              overflow: "hidden",
              backgroundColor: theme.deviceScreen,
            }}
          >
            {content}
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  if (kind === "browser") {
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: BROWSER.width,
            height: BROWSER.height,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: theme.deviceScreen,
            boxShadow: `0 0 0 3px ${theme.panelBorder}, 0 30px 80px rgba(0,0,0,0.45)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Simple window bar: three dots + empty address field */}
          <div
            style={{
              height: BROWSER.bar,
              flexShrink: 0,
              backgroundColor: theme.browserBar,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 22px",
            }}
          >
            {WINDOW_DOTS.map((c) => (
              <div
                key={c}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: c,
                }}
              />
            ))}
            <div
              style={{
                marginLeft: 24,
                flex: 1,
                height: 30,
                borderRadius: 15,
                backgroundColor: theme.deviceScreen, // address field
              }}
            />
          </div>
          <div style={{ position: "relative", flex: 1 }}>{content}</div>
        </div>
      </AbsoluteFill>
    );
  }

  // "none": just the content with rounded corners.
  return (
    <AbsoluteFill style={{ padding: NONE_PADDING }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: theme.radius,
          overflow: "hidden",
        }}
      >
        {content}
      </div>
    </AbsoluteFill>
  );
};
