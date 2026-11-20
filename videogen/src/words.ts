// Word helpers shared by cue matching, check-scenes and (later) the voice script.
// Pure TypeScript, no Remotion imports.

/**
 * Normalise a word for matching: lower-case, drop everything that is not a
 * letter or digit. "app's" -> "apps", "fifty-one," -> "fiftyone", "OK?" -> "ok".
 * (\p{L} = any letter, \p{N} = any digit, in any language; the "u" flag enables this.)
 */
export const normalizeWord = (word: string): string =>
  word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export type NarrationWord = {
  /** Word as written, including punctuation, e.g. "app." */
  text: string;
  /** normalizeWord(text) */
  norm: string;
  /** Character position of the word inside the narration string. */
  charIndex: number;
};

/** Split narration into words on whitespace, remembering where each word starts. */
export const splitNarration = (narration: string): NarrationWord[] => {
  const words: NarrationWord[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(narration)) !== null) {
    const norm = normalizeWord(m[0]);
    if (norm) {
      words.push({ text: m[0], norm, charIndex: m.index });
    }
  }
  return words;
};

/**
 * Index of the n-th (1-based) word equal to `word` after normalising, or -1.
 * Works on any list of objects with a `text` field (narration words or timing words).
 */
export const findWordIndex = (
  words: { text: string }[],
  word: string,
  occurrence = 1,
): number => {
  const target = normalizeWord(word);
  let seen = 0;
  for (let i = 0; i < words.length; i++) {
    if (normalizeWord(words[i].text) === target) {
      seen++;
      if (seen === occurrence) return i;
    }
  }
  return -1;
};
