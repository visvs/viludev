/**
 * Render the Open Graph card to `public/og-image.png`.
 *
 * Rendered in a real browser rather than composed with an image library so the
 * card uses the site's actual typeface and OKLCH palette. Doing it with SVG and
 * sharp would fall back to whatever font the machine happens to have, which is
 * how OG images end up looking nothing like the site they represent.
 *
 * The font is inlined as a data URI, so this depends on nothing being served.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';

const FONT_DIR = '.vercel/output/static/_astro/fonts';
const OUTPUT = 'public/og-image.png';
const WIDTH = 1200;
const HEIGHT = 630;

/** The build emits hashed filenames, so pick the Poppins face by weight order. */
async function loadFonts() {
  const files = await readdir(FONT_DIR);
  const woff2 = files.filter((f) => f.endsWith('.woff2'));
  const sized = await Promise.all(
    woff2.map(async (f) => ({
      file: f,
      size: (await readFile(join(FONT_DIR, f))).length,
    })),
  );
  // JetBrains Mono is a variable font and far larger than any single Poppins
  // weight, which makes it identifiable without parsing the CSS.
  sized.sort((a, b) => a.size - b.size);
  const poppins = sized.slice(0, 3).map((f) => f.file);
  const mono = sized[sized.length - 1].file;

  const asDataUri = async (name) =>
    `data:font/woff2;base64,${(await readFile(join(FONT_DIR, name))).toString('base64')}`;

  return {
    body: await asDataUri(poppins[0]),
    bold: await asDataUri(poppins[poppins.length - 1]),
    mono: await asDataUri(mono),
  };
}

const html = (fonts) => `
<style>
  @font-face { font-family: 'Poppins'; src: url('${fonts.body}') format('woff2'); font-weight: 400; }
  @font-face { font-family: 'Poppins'; src: url('${fonts.bold}') format('woff2'); font-weight: 700; }
  @font-face { font-family: 'Mono'; src: url('${fonts.mono}') format('woff2'); }

  :root {
    --surface: oklch(0.16954 0.02201 267.278);
    --text: oklch(0.975 0.004 267.3);
    --muted: oklch(0.82 0.012 267.3);
    --violet: oklch(0.60563 0.21892 292.717);
    --cyan: oklch(0.71484 0.12574 215.221);
    --emerald: oklch(0.69587 0.14907 162.48);
    --border: oklch(0.3 0.022 267.3);
  }

  * { margin: 0; box-sizing: border-box; }

  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    background: var(--surface);
    font-family: 'Poppins', sans-serif;
    color: var(--text);
    position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: center;
    padding: 80px;
  }

  .grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle at center, var(--border) 1px, transparent 1px);
    background-size: 32px 32px;
    -webkit-mask-image: radial-gradient(ellipse at 30% 0%, black, transparent 70%);
  }
  .bloom { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.22; }
  .b1 { background: var(--violet); width: 560px; height: 560px; top: -180px; left: -140px; }
  .b2 { background: var(--cyan);   width: 460px; height: 460px; bottom: -200px; right: -80px; }
  .b3 { background: var(--emerald); width: 360px; height: 360px; bottom: -140px; left: 40%; }

  .content { position: relative; }
  .eyebrow {
    font-family: 'Mono', monospace; font-size: 22px; letter-spacing: 0.22em;
    text-transform: uppercase; color: var(--cyan);
    display: flex; align-items: center; gap: 18px;
  }
  .eyebrow::before { content: ''; width: 56px; height: 2px; background: var(--cyan); }
  h1 { font-size: 96px; font-weight: 700; letter-spacing: -0.035em; line-height: 0.98; margin-top: 28px; }
  .statement {
    font-size: 38px; font-weight: 700; margin-top: 28px; letter-spacing: -0.015em;
    background: linear-gradient(90deg, oklch(0.72 0.193 292.7), var(--cyan), var(--emerald));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .footer {
    position: absolute; left: 80px; right: 80px; bottom: 56px;
    display: flex; justify-content: space-between; align-items: center;
    font-family: 'Mono', monospace; font-size: 22px; color: var(--muted);
    border-top: 1px solid var(--border); padding-top: 26px;
  }
</style>

<div class="grid"></div>
<div class="bloom b1"></div><div class="bloom b2"></div><div class="bloom b3"></div>

<div class="content">
  <p class="eyebrow">Frontend Developer</p>
  <h1>Violeta Vera<br />Salazar</h1>
  <p class="statement">Interfaces that stay fast under real conditions.</p>
</div>

<div class="footer">
  <span>viludev</span>
  <span>React &middot; TypeScript &middot; Astro</span>
</div>
`;

const fonts = await loadFonts();
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});
await page.setContent(html(fonts), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const buffer = await page.screenshot({ type: 'png' });
await browser.close();
await writeFile(OUTPUT, buffer);
console.log(`Wrote ${OUTPUT} (${WIDTH}x${HEIGHT}, ${buffer.length} B)`);
