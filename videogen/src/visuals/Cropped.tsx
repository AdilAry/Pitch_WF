// Shows part of a video or image ("crop", fractions of each side) so that the kept
// part fills a box of known size, like CSS object-fit: cover.
// Remotion's own cropLeft/... props only hide pixels without enlarging the rest,
// so we do it ourselves: we need the source's real pixel size for that.
import { useEffect, useState } from "react";
import { useDelayRender } from "remotion";
import type { Crop } from "../types";

type Size = { width: number; height: number };

/**
 * Pixel size of a video or image. Rendering waits (delayRender) until it is known,
 * so no frame is ever drawn with a wrong layout.
 */
export const useMediaSize = (
  src: string,
  kind: "video" | "image",
): Size | null => {
  const [size, setSize] = useState<Size | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender(`Reading size of ${src}`));

  useEffect(() => {
    if (kind === "video") {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        setSize({ width: el.videoWidth, height: el.videoHeight });
        continueRender(handle);
      };
      el.onerror = () => cancelRender(new Error(`Cannot load video ${src}`));
      el.src = src;
    } else {
      const img = new Image();
      img.onload = () => {
        setSize({ width: img.naturalWidth, height: img.naturalHeight });
        continueRender(handle);
      };
      img.onerror = () => cancelRender(new Error(`Cannot load image ${src}`));
      img.src = src;
    }
  }, [src, kind, handle, continueRender, cancelRender]);

  return size;
};

/**
 * Position a source of size `source` inside a `box`, so that the cropped region
 * covers the box (centered). Returns the style for the full-size media element.
 */
export const coverCropStyle = (
  source: Size,
  box: Size,
  crop: Crop = {},
): React.CSSProperties => {
  const l = crop.left ?? 0;
  const r = crop.right ?? 0;
  const t = crop.top ?? 0;
  const b = crop.bottom ?? 0;
  const regionW = source.width * (1 - l - r);
  const regionH = source.height * (1 - t - b);
  const scale = Math.max(box.width / regionW, box.height / regionH); // "cover"
  return {
    position: "absolute",
    width: source.width * scale,
    height: source.height * scale,
    left: -l * source.width * scale + (box.width - regionW * scale) / 2,
    top: -t * source.height * scale + (box.height - regionH * scale) / 2,
  };
};

/** Width / height of the part that stays after cropping. */
export const croppedAspect = (source: Size, crop: Crop = {}): number =>
  (source.width * (1 - (crop.left ?? 0) - (crop.right ?? 0))) /
  (source.height * (1 - (crop.top ?? 0) - (crop.bottom ?? 0)));
