// Captions for one scene, built from its word timings (or estimates if there's no audio yet).
// Words are grouped into short "pages" of 1–2 lines; the word being spoken is in the accent colour.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { sceneDurationInFrames, sceneWords } from "./timing";
import type { TimingWord } from "./types";

/** Max characters per page (~2 lines at this font size). */
const MAX_PAGE_CHARS = 64;
const FONT_SIZE = 52;

/** Split words into pages: start a new page when it gets too long or after a sentence ends. */
const makePages = (words: TimingWord[]): TimingWord[][] => {
  const pages: TimingWord[][] = [];
  let page: TimingWord[] = [];
  let chars = 0;
  for (const word of words) {
    if (page.length > 0 && chars + 1 + word.text.length > MAX_PAGE_CHARS) {
      pages.push(page);
      page = [];
      chars = 0;
    }
    page.push(word);
    chars += (chars > 0 ? 1 : 0) + word.text.length;
    // A sentence end (". ? !") closes the page, unless the page is still tiny.
    if (/[.?!]$/.test(word.text) && page.length >= 3) {
      pages.push(page);
      page = [];
      chars = 0;
    }
  }
  if (page.length > 0) pages.push(page);
  return pages;
};

export const Captions: React.FC<{ sceneId: string }> = ({ sceneId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps; // seconds since the scene started

  // During the crossfade to the next scene (frames past this scene's own length),
  // only the next scene's caption is shown, so two captions never overlap.
  if (frame >= sceneDurationInFrames(sceneId)) return null;

  const pages = makePages(sceneWords(sceneId));
  // Current page = the last page whose first word has started. Before the first word: nothing.
  const current = [...pages].reverse().find((p) => p[0].start <= t);
  if (!current) return null;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      <div
        style={{
          marginBottom: 48,
          maxWidth: 1500,
          padding: "14px 36px",
          borderRadius: 20,
          backgroundColor: theme.captionBg,
          fontSize: FONT_SIZE,
          fontWeight: 600,
          lineHeight: 1.3,
          textAlign: "center",
        }}
      >
        {current.map((word, i) => {
          // "Current" word: started, and the next word hasn't started yet.
          const next = current[i + 1];
          const active =
            word.start <= t && (next ? t < next.start : t < word.end + 0.3);
          return (
            <span key={i} style={{ color: active ? theme.accent : theme.text }}>
              {word.text}
              {i < current.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
