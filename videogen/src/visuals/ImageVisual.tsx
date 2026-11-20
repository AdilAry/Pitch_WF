// "image": a screenshot in a frame (phone|browser|none), with optional crop and "zoom" cues.
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ImageVisual as ImageVisualProps } from "../types";
import type { VisualProps } from "./common";
import { coverCropStyle, croppedAspect, useMediaSize } from "./Cropped";
import { Framed, zoomAt } from "./Framed";

export const ImageVisual: React.FC<VisualProps> = ({ visual, cues }) => {
  const v = visual as unknown as ImageVisualProps;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const src = staticFile(v.src);
  const size = useMediaSize(src, "image");
  return (
    <Framed
      kind={v.frame ?? "none"}
      zoom={zoomAt(cues, frame, fps)}
      contentAspect={size ? croppedAspect(size, v.crop) : undefined}
    >
      {(screen) =>
        size ? (
          <Img src={src} style={coverCropStyle(size, screen, v.crop)} />
        ) : null
      }
    </Framed>
  );
};
