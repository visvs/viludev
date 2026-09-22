/**
 * Accessibility and bundle-size audit against the production build.
 *
 * This exists because the guarantees this project claims — WCAG AA in both
 * themes, a JavaScript budget — were being verified by hand. Anything verified
 * by hand is verified once and then quietly stops being true. axe found real
 * regressions three times during development that the unit tests could not:
 * decorative blooms crushing contrast, receded cards dimming their own text,
 * and the light theme's muted tiers falling under the line.
 *
 * Playwright is used as a library rather than as a test runner. A second test
 * framework, with its own config and fixtures, is not warranted for one static
 * page — but the browser it already ships is exactly what this needs.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core/axe.min.js');

const STATIC_DIR = '.vercel/output/static';
const PORT = 4330;

/** Budget for JavaScript in the critical path, in gzipped bytes. */
const JS_BUDGET_BYTES = 30 * 1024;

const ROUTES = [
  { path: '/', label: 'en' },
  { path: '/es/', label: 'es' },
];
const THEMES = ['dark', 'light'];

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

/**
 * Every animation that must actually be running in the shipped build, with the
 * keyframes it has to resolve to.
 *
 * This exists because the motion layer can break in the minifier alone. Lightning
 * CSS merges an `animation-timeline` back into a neighbouring `animation`
 * shorthand, producing a declaration no browser accepts; `animation-name` then
 * computes to `none` and every scroll effect is silently dead in production while
 * `astro dev`, which does not minify, still looks correct. Source review cannot
 * catch that, so it is asserted against the built artefact in a real browser.
 *
 * `scrollDriven` entries must also carry a timeline — a rule that animates on the
 * document timeline instead would run once on load rather than tracking scroll.
 */
const ANIMATIONS = [
  { selector: '.reveal', name: 'reveal-rise', scrollDriven: true },
  { selector: '.parallax', name: 'parallax-drift', scrollDriven: true },
  { selector: '.hero-recede', name: 'hero-recede', scrollDriven: true },
  { selector: '.scroll-progress', name: 'progress-advance', scrollDriven: true },
  { selector: '.stack-card > *', name: 'card-recede', scrollDriven: true },
  { selector: '.avatar-float', name: 'avatar-float', scrollDriven: false },
  { selector: '.marquee-track', name: 'marquee-slide', scrollDriven: false },
];

/**
 * Read back what the browser actually computed for each animated element.
 *
 * A selector matching nothing is a failure too: it means the class was renamed
 * or the element removed, and a guard that quietly checks zero elements is worse
 * than no guard at all.
 */
async function checkMotion(page) {
  const results = await page.evaluate((rules) => {
    return rules.map((rule) => {
      const element = document.querySelector(rule.selector);
      if (element === null) return { ...rule, missing: true };

      const computed = getComputedStyle(element);
      return {
        ...rule,
        missing: false,
        computedName: computed.animationName,
        computedTimeline: computed.animationTimeline,
      };
    });
  }, ANIMATIONS);

  const failures = [];
  for (const result of results) {
    if (result.missing) {
      failures.push(`no element matches ${result.selector}`);
      continue;
    }
    if (result.computedName !== result.name) {
      failures.push(
        `${result.selector} computes animation-name "${result.computedName}", expected ` +
          `"${result.name}" — the declaration was rejected by the browser`,
      );
      continue;
    }
    if (result.scrollDriven && result.computedTimeline === 'auto') {
      failures.push(
        `${result.selector} has no scroll timeline: animation-timeline computes to "auto"`,
      );
    }
  }

  return failures;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
};

function serveStatic(root) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let filePath = join(root, normalize(decodeURIComponent(url.pathname)));

    void (async () => {
      try {
        const info = await stat(filePath).catch(() => null);
        if (info?.isDirectory() ?? false) filePath = join(filePath, 'index.html');
        else if (info === null && extname(filePath) === '') filePath = `${filePath}/index.html`;

        const body = await readFile(filePath);
        res.writeHead(200, {
          'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
        });
        res.end(body);
      } catch {
        res.writeHead(404).end('Not found');
      }
    })();
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

/**
 * Measure the JavaScript a visitor actually downloads before interacting.
 *
 * Counts inline scripts and external `<script src>`, and deliberately ignores
 * both the JSON-LD block (data, not code) and the island chunks, which are
 * fetched only once the contact form scrolls into view.
 */
async function measureCriticalJs(html, root) {
  let bytes = 0;

  for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = match[1];
    if (attrs.includes('application/ld+json')) continue;

    const src = /src="([^"]+)"/.exec(attrs)?.[1];
    if (src === undefined) {
      bytes += gzipSync(Buffer.from(match[2])).length;
      continue;
    }
    if (src.startsWith('http')) {
      throw new Error(`Third-party script in the critical path: ${src}`);
    }
    bytes += gzipSync(await readFile(join(root, src))).length;
  }

  return bytes;
}

async function main() {
  const server = await serveStatic(STATIC_DIR);
  const browser = await chromium.launch();
  const failures = [];

  try {
    for (const route of ROUTES) {
      const html = await readFile(join(STATIC_DIR, route.path, 'index.html'), 'utf8');
      const jsBytes = await measureCriticalJs(html, STATIC_DIR);
      const withinBudget = jsBytes <= JS_BUDGET_BYTES;
      console.log(
        `  ${withinBudget ? 'PASS' : 'FAIL'}  ${route.path} critical JS: ${jsBytes} B gzip ` +
          `(budget ${JS_BUDGET_BYTES})`,
      );
      if (!withinBudget) {
        failures.push(`${route.path}: critical JS ${jsBytes} B exceeds ${JS_BUDGET_BYTES} B`);
      }

      // Motion is theme-independent, so it is checked once per route rather
      // than inside the theme loop.
      const motionPage = await browser.newPage();
      await motionPage.goto(`http://localhost:${PORT}${route.path}`, { waitUntil: 'load' });
      const motionFailures = await checkMotion(motionPage);
      await motionPage.close();

      console.log(
        `  ${motionFailures.length === 0 ? 'PASS' : 'FAIL'}  ${route.path} motion: ` +
          `${String(ANIMATIONS.length - motionFailures.length)}/${String(ANIMATIONS.length)} ` +
          `animations running`,
      );
      failures.push(...motionFailures.map((failure) => `${route.path} motion: ${failure}`));

      for (const theme of THEMES) {
        const page = await browser.newPage();
        // Set the theme before the page's own inline bootstrap runs, so the
        // audit sees a genuine page load rather than a runtime mutation —
        // mutating `data-theme` after paint produced phantom failures by hand.
        await page.addInitScript((value) => {
          try {
            localStorage.setItem('theme', value);
          } catch {
            /* storage blocked; the page defaults to dark */
          }
        }, theme);

        // Injected through the debug protocol rather than as a <script> tag:
        // the page ships a strict CSP with no 'unsafe-inline', so a real script
        // element is correctly refused. That refusal is the policy working.
        await page.addInitScript({ path: AXE_PATH });

        await page.goto(`http://localhost:${PORT}${route.path}`, { waitUntil: 'load' });
        // Scroll the page so lazy sections and the stacked deck are in their
        // real rendered state, then let the island hydrate.
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(1200);

        const result = await page.evaluate(
          async (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
          WCAG_TAGS,
        );

        const violations = result.violations;
        console.log(
          `  ${violations.length === 0 ? 'PASS' : 'FAIL'}  ${route.path} [${theme}] axe: ` +
            `${String(violations.length)} violations, ${String(result.passes.length)} passes`,
        );

        for (const violation of violations) {
          failures.push(
            `${route.path} [${theme}] ${violation.id} (${violation.impact}) ` +
              `on ${String(violation.nodes.length)} node(s): ` +
              violation.nodes
                .slice(0, 3)
                .map((node) => node.target.join(' '))
                .join(', '),
          );
        }

        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (failures.length > 0) {
    console.error('\nAudit failed:\n' + failures.map((f) => `  - ${f}`).join('\n'));
    process.exit(1);
  }
  console.log('\nAudit passed.');
}

await main();
