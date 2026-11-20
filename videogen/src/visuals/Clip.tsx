// "clip": a screen recording in a frame. Muted. Props: src, frame (phone|browser|none),
// trimStart / trimEnd (seconds of the recording), speed, crop (fractions of each side,
// e.g. to cut off a browser's tab bar), plus "zoom" cues.
// If the recording ends before the scene does, its last frame stays on screen.
import { Video } from "@remotion/media";
import { staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ClipVisual } from "../types";
import type { VisualProps } from "./common";
import { coverCropStyle, croppedAspect, useMediaSize } from "./Cropped";
import { Framed, zoomAt } from "./Framed";

export const Clip: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as ClipVisual;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = staticFile(v.src);
  const size = useMediaSize(src, "video");

  // trimBefore / durationInFrames are counted in frames of the recording (at our fps).
  const trimBefore = Math.round((v.trimStart ?? 0) * fps);
  const sourceFrames =
    v.trimEnd !== undefined
      ? Math.round((v.trimEnd - (v.trimStart ?? 0)) * fps)
      : undefined;

  return (
    <Framed
      kind={v.frame ?? "none"}
      zoom={zoomAt(cues, frame, fps)}
      contentAspect={size ? croppedAspect(size, v.crop) : undefined}
    >
      {(screen) =>
        size ? (
          <Video
            src={src}
            muted
            trimBefore={trimBefore}
            durationInFrames={sourceFrames}
            playbackRate={v.speed ?? 1}
            objectFit="fill" // the element already has the video's exact aspect ratio
            style={coverCropStyle(size, screen, v.crop)}
          />
        ) : null
      }
    </Framed>
  );
};
