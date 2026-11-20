// Slide deck builder (pitches, talks, project reviews).
// Usage:  node build.js [deck.json]
// Reads the slide content from a JSON file and writes a 16:9 .pptx.
// Missing screenshots become labelled placeholder boxes, so the build never fails on an image.

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const deckFile = path.resolve(process.argv[2] || "deck.json");
const baseDir = path.dirname(deckFile);
const deck = JSON.parse(fs.readFileSync(deckFile, "utf8"));
const meta = deck.meta || {};

// ---------- Colours (override any of them in deck.json → "colors") ----------
const C = Object.assign({
  navy: "0F2A3D", teal: "1B998B", ice: "EAF4F4", white: "FFFFFF", ink: "1C2B36",
  muted: "5B6B76", amber: "E9A23B", green: "2E9E5B", red: "D64545", line: "C9D8DC",
}, deck.colors || {});
const FONT = meta.font || "Arial";
const TONE = { teal: C.teal, amber: C.amber, green: C.green, red: C.red, navy: C.navy };

// ---------- Helpers ----------
const warnings = [];

async function iconData(name, color) {
  const Comp = fa[name] || fa.FaCircle;
  if (!fa[name]) warnings.push(`Unknown icon "${name}" (using FaCircle). Names: https://react-icons.github.io/react-icons/icons/fa/`);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  pres.title = meta.title || "Presentation";
  pres.author = meta.author || "";
  pres.theme = { headFontFace: FONT, bodyFontFace: FONT };

  pres.defineSlideMaster({
    title: "DARK_TITLE", background: { color: C.navy },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.55, w: 8.8, h: 1.2, fontSize: 54, bold: true, color: C.white, fontFace: FONT, align: "left", valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 2.85, w: 8.8, h: 0.9, fontSize: 20, color: C.ice, fontFace: FONT, align: "left", valign: "top", margin: 0 }, text: "" } },
    ],
  });
  for (const [name, bg, fg, num] of [["LIGHT", C.white, C.navy, C.muted], ["DARK", C.navy, C.white, C.line]]) {
    pres.defineSlideMaster({
      title: name, background: { color: bg },
      objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9, h: 0.75, fontSize: 30, bold: true, color: fg, fontFace: FONT, align: "left", valign: "middle", margin: 0 }, text: "" } }],
      slideNumber: { x: 9.2, y: 5.2, w: 0.4, h: 0.3, fontSize: 10, color: num },
    });
  }

  const txt = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, valign: "top", fontFace: FONT, fit: "shrink" }, o));
  const card = (s, x, y, w, h, fill) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: fill || C.ice }, line: { type: "none" },
    shadow: { type: "outer", color: C.navy, opacity: 0.12, blur: 6, offset: 2, angle: 90 },
  });
  async function iconCircle(s, name, x, y, d, fill) {
    if (!name) return;
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" } });
    const p = d * 0.25;
    s.addImage({ data: await iconData(name, C.white), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
  }
  // Screenshot fitted inside a box (keeps aspect ratio); placeholder box if the file is missing.
  async function shot(s, file, x, y, w, h, frame, label) {
    const full = file ? path.resolve(baseDir, file) : null;
    if (!full || !fs.existsSync(full)) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: C.ice }, line: { color: C.muted, dashType: "dash", width: 1 } });
      txt(s, "Screenshot here\n" + (label || file || ""), { x, y, w, h, fontSize: 12, color: C.muted, align: "center", valign: "middle" });
      if (file) warnings.push(`Image not found: ${file} (placeholder used)`);
      return;
    }
    const m = await sharp(full).metadata();
    const r = Math.min(w / m.width, h / m.height);
    const iw = m.width * r, ih = m.height * r, ix = x + (w - iw) / 2, iy = y + (h - ih) / 2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ix - 0.06, y: iy - 0.06, w: iw + 0.12, h: ih + 0.12, rectRadius: 0.08, fill: { color: frame || C.line }, line: { type: "none" },
      shadow: { type: "outer", color: C.navy, opacity: 0.18, blur: 8, offset: 3, angle: 90 } });
    s.addImage({ path: full, x: ix, y: iy, w: iw, h: ih, altText: label || file });
  }
  const bullets = (items, color) => items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, color } }));

  // ---------- Slide types ----------
  const T = {
    async title(s, d) {
      await iconCircle(s, d.icon, 0.6, 0.6, 0.8, C.teal);
      s.addText(d.title || "", { placeholder: "title" });
      s.addText(d.subtitle || "", { placeholder: "body" });
      if (d.footer) txt(s, d.footer, { x: 0.6, y: 4.75, w: d.image ? 5.9 : 8.8, h: 0.5, fontSize: 12, color: C.line });
      if (d.image !== undefined) await shot(s, d.image, 6.85, 0.45, 2.62, 4.75, C.teal, "App screenshot");
    },

    async cards(s, d) {               // 2–4 cards side by side (e.g. Problem)
      const n = Math.max(1, Math.min(4, (d.cards || []).length)), gap = 0.2, w = (9 - gap * (n - 1)) / n;
      for (const [i, c] of (d.cards || []).slice(0, 4).entries()) {
        const x = 0.5 + i * (w + gap);
        card(s, x, 1.35, w, 3.55);
        await iconCircle(s, c.icon, x + 0.3, 1.6, 0.7, TONE[c.tone] || C.teal);
        txt(s, c.title || "", { x: x + 0.3, y: 2.5, w: w - 0.6, h: 0.75, fontSize: 17, bold: true, color: C.navy });
        txt(s, c.text || "", { x: x + 0.3, y: 3.3, w: w - 0.6, h: 1.5, fontSize: 13, color: C.ink });
      }
      if (d.footnote) txt(s, d.footnote, { x: 0.5, y: 5.05, w: 8, h: 0.3, fontSize: 10, italic: true, color: C.muted });
    },

    async list(s, d) {                // 2–4 rows with icon, title, text (e.g. Who it's for)
      const items = (d.items || []).slice(0, 4), step = items.length > 3 ? 0.95 : 1.25;
      for (const [i, it] of items.entries()) {
        const y = 1.3 + i * step;
        await iconCircle(s, it.icon, 0.6, y, 0.8, TONE[it.tone] || C.teal);
        txt(s, it.title || "", { x: 1.65, y: y + 0.02, w: 7.6, h: 0.4, fontSize: 18, bold: true, color: C.navy });
        txt(s, it.text || "", { x: 1.65, y: y + 0.42, w: 7.6, h: 0.5, fontSize: 14, color: C.ink });
      }
    },

    async statement(s, d) {           // one big sentence + up to 3 chips + optional screenshot (dark)
      const w = d.image !== undefined ? 5.5 : 9;
      txt(s, d.sentence || "", { x: 0.5, y: 1.25, w, h: 1.6, fontSize: 22, color: C.white });
      (d.chips || []).slice(0, 3).forEach((q, i) => {
        const y = 3.05 + i * 0.68;
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y, w: Math.min(w, 5.3), h: 0.55, rectRadius: 0.1, fill: { color: C.teal }, line: { type: "none" } });
        txt(s, q, { x: 0.75, y, w: Math.min(w, 5.3) - 0.4, h: 0.55, fontSize: 18, bold: true, color: C.white, valign: "middle" });
      });
      if (d.image !== undefined) await shot(s, d.image, 6.4, 1.3, 3.1, 3.6, C.teal, "App screenshot");
    },

    async demo(s, d) {                // screenshot + stats card + timeline of demo moments
      if (d.caption) txt(s, d.caption, { x: 0.5, y: 5.22, w: 8.5, h: 0.25, fontSize: 9, italic: true, color: C.muted }); // ends at 9.0, clear of the slide number at 9.2
      if (d.imageLarge) {             // a roughly square screenshot gets most of the height, stats go in a row
        await shot(s, d.image, 0.5, 1.2, 3.85, 3.85, C.line, "Demo screenshot");
        txt(s, [
          { text: d.heading || "", options: { fontSize: 16, bold: true, color: C.navy, breakLine: true } },
          { text: d.subheading || "", options: { fontSize: 12, color: C.muted } },
        ], { x: 4.65, y: 1.15, w: 4.85, h: 0.6 });
        (d.stats || []).slice(0, 3).forEach((st, i) => {
          const x = 4.65 + i * 1.65;
          txt(s, String(st.value ?? ""), { x, y: 1.8, w: 1.55, h: 0.45, fontSize: 22, bold: true, color: C.teal, valign: "middle" });
          txt(s, st.label, { x, y: 2.25, w: 1.55, h: 0.25, fontSize: 11, color: C.ink });
        });
        (d.moments || []).slice(0, 3).forEach((m, i) => {
          const y = 2.7 + i * 0.8;
          s.addShape(pres.shapes.OVAL, { x: 4.65, y: y + 0.08, w: 0.3, h: 0.3, fill: { color: TONE[m.tone] || C.teal }, line: { type: "none" } });
          txt(s, [
            { text: m.title || "", options: { bold: true, color: C.navy, fontSize: 14, breakLine: true } },
            { text: m.text || "", options: { color: C.ink, fontSize: 12 } },
          ], { x: 5.05, y, w: 4.45, h: 0.75 });
        });
        return;
      }
      await shot(s, d.image, 0.5, 1.25, 2.0, 3.95, C.line, "Demo screenshot");
      card(s, 2.75, 1.3, 3.0, 3.6);
      txt(s, [
        { text: d.heading || "", options: { fontSize: 16, bold: true, color: C.navy, breakLine: true } },
        { text: d.subheading || "", options: { fontSize: 13, color: C.muted } },
      ], { x: 2.95, y: 1.5, w: 2.65, h: 0.7 });
      (d.stats || []).slice(0, 3).forEach((st, i) => {
        const y = 2.35 + i * 0.8;
        txt(s, String(st.value ?? ""), { x: 2.95, y, w: 1.45, h: 0.6, fontSize: 28, bold: true, color: C.teal, valign: "middle" });
        txt(s, st.label, { x: 4.4, y, w: 1.25, h: 0.6, fontSize: 12, color: C.ink, valign: "middle" });
      });
      txt(s, d.momentsHeading || "Demo moments", { x: 6.05, y: 1.3, w: 3.45, h: 0.4, fontSize: 16, bold: true, color: C.navy });
      (d.moments || []).slice(0, 4).forEach((m, i) => {
        const y = 1.8 + i * 0.8;
        s.addShape(pres.shapes.OVAL, { x: 6.05, y: y + 0.08, w: 0.3, h: 0.3, fill: { color: TONE[m.tone] || C.teal }, line: { type: "none" } });
        txt(s, [
          { text: m.title || "", options: { bold: true, color: C.navy, fontSize: 14, breakLine: true } },
          { text: m.text || "", options: { color: C.ink, fontSize: 12 } },
        ], { x: 6.45, y, w: 3.05, h: 0.75 });
      });
    },

    async pipeline(s, d) {            // 3–4 steps with arrows + optional callout
      const steps = (d.steps || []).slice(0, 4), n = Math.max(1, steps.length), gap = 0.35, w = (9 - gap * (n - 1)) / n;
      steps.forEach((st, i) => {
        const x = 0.5 + i * (w + gap), hi = i === d.highlight;
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.5, w, h: 2.1, rectRadius: 0.12, fill: { color: hi ? C.teal : C.ice }, line: { type: "none" } });
        txt(s, String(i + 1), { x: x + 0.2, y: 1.65, w: w - 0.4, h: 0.5, fontSize: 24, bold: true, color: hi ? C.white : C.teal });
        txt(s, st.title || "", { x: x + 0.2, y: 2.2, w: w - 0.4, h: 0.6, fontSize: 15, bold: true, color: hi ? C.white : C.navy });
        txt(s, st.text || "", { x: x + 0.2, y: 2.8, w: w - 0.4, h: 0.75, fontSize: 12, color: hi ? C.white : C.ink });
        if (i < n - 1) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + w + 0.05, y: 2.4, w: 0.25, h: 0.3, fill: { color: C.line }, line: { type: "none" } });
      });
      if (d.callout) {
        card(s, 0.5, 3.95, 9.0, 1.0);
        txt(s, [
          { text: (d.callout.bold || "") + " ", options: { bold: true, color: C.navy } },
          { text: d.callout.text || "", options: { color: C.ink } },
        ], { x: 0.8, y: 4.1, w: 8.4, h: 0.75, fontSize: 14, valign: "middle" });
      }
    },

    async results(s, d) {             // table + big number card
      const t = d.table || { header: [], rows: [] };
      const hdr = { bold: true, color: C.white, fill: { color: C.navy }, fontSize: 12 };
      const rows = [(t.header || []).map(h => ({ text: String(h), options: hdr })), ...(t.rows || []).map(r => r.map(String))];
      if (!rows[0].length && (t.rows || []).length) warnings.push(`Slide "${d.title || ""}": results.table has rows but no header (table skipped)`);
      if (rows[0].length) s.addTable(rows, { x: 0.5, y: 1.3, w: 5.9, colW: t.colW, fontSize: 12, color: C.ink, fontFace: FONT,
        border: { type: "solid", pt: 0.5, color: C.line }, rowH: 0.42, valign: "middle", autoPage: false });
      if (d.bigStat) {
        card(s, 6.75, 1.3, 2.75, 3.6, C.navy);
        txt(s, String(d.bigStat.value ?? ""), { x: 6.95, y: 1.5, w: 2.35, h: 0.9, fontSize: 54, bold: true, color: C.white });
        txt(s, d.bigStat.label || "", { x: 6.95, y: 2.4, w: 2.35, h: 0.6, fontSize: 13, color: C.ice });
        txt(s, d.bigStat.insight || "", { x: 6.95, y: 3.2, w: 2.35, h: 1.5, fontSize: 13, bold: true, color: C.amber });
      }
    },

    async business(s, d) {            // 3 stacked cards (middle highlighted) + screenshot + takeaway
      for (const [i, c] of (d.cards || []).slice(0, 3).entries()) {
        const y = 1.25 + i * 1.08, hi = i === (d.highlight ?? 1);
        card(s, 0.5, y, 5.6, 0.95, hi ? C.teal : C.ice);
        await iconCircle(s, c.icon, 0.7, y + 0.15, 0.65, hi ? C.navy : C.teal);
        txt(s, c.title || "", { x: 1.55, y: y + 0.1, w: 4.4, h: 0.3, fontSize: 15, bold: true, color: hi ? C.white : C.navy });
        txt(s, c.text || "", { x: 1.55, y: y + 0.42, w: 4.4, h: 0.48, fontSize: 12, color: hi ? C.white : C.ink });
      }
      if (d.image !== undefined) await shot(s, d.image, 6.4, 1.3, 3.1, 3.6, C.line, "Screenshot");
      if (d.takeaway) txt(s, d.takeaway, { x: 0.5, y: 4.55, w: 5.6, h: 0.6, fontSize: 15, bold: true, color: C.navy });
    },

    async pilot(s, d) {               // pilot facts card + hypotheses with measurements
      card(s, 0.5, 1.3, 3.2, 2.15, C.navy);
      await iconCircle(s, d.icon || "FaFlask", 0.75, 1.45, 0.5, C.teal);
      txt(s, d.pilotTitle || "Pilot", { x: 1.4, y: 1.48, w: 2.0, h: 0.45, fontSize: 18, bold: true, color: C.white });
      txt(s, bullets(d.pilot || [], C.white), { x: 0.75, y: 2.1, w: 2.8, h: 1.25, fontSize: 13, paraSpaceAfter: 4 });
      if (d.image !== undefined) await shot(s, d.image, 0.56, 3.65, 3.08, 1.45, C.line, "Screenshot");
      txt(s, d.heading || "What the pilot must prove", { x: 4.0, y: 1.3, w: 5.5, h: 0.4, fontSize: 16, bold: true, color: C.navy });
      for (const [i, h] of (d.hypotheses || []).slice(0, 4).entries()) {
        const y = 1.85 + i * 0.77;
        await iconCircle(s, "FaCheck", 4.0, y + 0.05, 0.4, C.green);
        txt(s, [
          { text: h.title || "", options: { bold: true, color: C.navy, fontSize: 14, breakLine: true } },
          { text: "Measure: " + (h.measure || ""), options: { color: C.muted, fontSize: 12 } },
        ], { x: 4.6, y, w: 4.9, h: 0.7 });
      }
    },

    async twoColumns(s, d) {          // e.g. Honest limits | Next steps
      const L = d.left || {}, R = d.right || {};
      card(s, 0.5, 1.3, 4.35, 3.6);
      txt(s, L.heading || "", { x: 0.8, y: 1.5, w: 3.8, h: 0.4, fontSize: 17, bold: true, color: C.navy });
      txt(s, bullets(L.items || [], C.ink), { x: 0.8, y: 2.0, w: 3.85, h: 2.7, fontSize: 14, paraSpaceAfter: 8 });
      card(s, 5.15, 1.3, 4.35, 3.6, C.teal);
      txt(s, R.heading || "", { x: 5.45, y: 1.5, w: 3.8, h: 0.4, fontSize: 17, bold: true, color: C.white });
      txt(s, bullets(R.items || [], C.white), { x: 5.45, y: 2.0, w: 3.85, h: 2.7, fontSize: 14, paraSpaceAfter: 8 });
    },
  };
  T.close = T.title;

  const MASTER = { title: "DARK_TITLE", close: "DARK_TITLE", statement: "DARK" };

  for (const [i, d] of (deck.slides || []).entries()) {
    const fn = T[d.type];
    if (!fn) { warnings.push(`Slide ${i + 1}: unknown type "${d.type}" (skipped)`); continue; }
    const s = pres.addSlide({ masterName: MASTER[d.type] || (d.dark ? "DARK" : "LIGHT") });
    if (!["title", "close"].includes(d.type)) s.addText(d.title || "", { placeholder: "title" });
    await fn(s, d);
    if (d.notes) s.addNotes(d.notes);
  }

  const out = path.resolve(baseDir, meta.output || "deck.pptx");
  await pres.writeFile({ fileName: out });
  warnings.forEach(w => console.warn("WARN:", w));
  console.log("Wrote", out);
})().catch(e => { console.error(e); process.exit(1); });
