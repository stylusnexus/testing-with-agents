#!/usr/bin/env node

/**
 * Visual verification script for Stylus Nexus guide sites.
 *
 * Takes full-page and per-section screenshots of both guide sites
 * for manual UX review or AI-powered analysis.
 *
 * Usage:
 *   node scripts/verify-visual.mjs                    # Both sites
 *   node scripts/verify-visual.mjs --site testing     # Testing guide only
 *   node scripts/verify-visual.mjs --site shipping    # Shipping guide only
 *   node scripts/verify-visual.mjs --local            # Use localhost:8080
 *
 * Output: screenshots/ directory with timestamped images
 *
 * Prerequisites: npx playwright install chromium
 */

import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const SITES = {
  testing: {
    name: 'testing-with-agents',
    url: 'https://stylusnexus.github.io/testing-with-agents/',
    sections: [
      'why', 'pyramid', 'ai-mocks', 'auth-mocking',
      'visual-verification', 'verify-loop', 'ux-review',
      'experiment-as-test', 'ci-integration', 'full-harness',
      'failures', 'getting-started',
    ],
  },
  shipping: {
    name: 'shipping-with-agents',
    url: 'https://stylusnexus.github.io/shipping-with-agents/',
    sections: [
      'why', 'claude-md', 'agents', 'memory', 'hooks',
      'skills', 'orchestration', 'experiments', 'full-stack',
      'results', 'failures', 'getting-started',
    ],
  },
};

// Parse args
const args = process.argv.slice(2);
const siteFilter = args.includes('--site') ? args[args.indexOf('--site') + 1] : null;
const useLocal = args.includes('--local');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = join(process.cwd(), 'screenshots', timestamp);

if (!existsSync(join(process.cwd(), 'screenshots'))) {
  mkdirSync(join(process.cwd(), 'screenshots'));
}
mkdirSync(outDir, { recursive: true });

async function screenshotSite(browser, siteKey) {
  const site = SITES[siteKey];
  const baseUrl = useLocal ? 'http://localhost:8080' : site.url;
  const siteDir = join(outDir, site.name);
  mkdirSync(siteDir, { recursive: true });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log(`\n📸 ${site.name}`);
  console.log(`   URL: ${baseUrl}`);

  // Full page screenshot
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: join(siteDir, '00-full-page.png'),
    fullPage: true,
  });
  console.log('   ✓ Full page');

  // Per-section screenshots
  for (let i = 0; i < site.sections.length; i++) {
    const section = site.sections[i];
    await page.goto(`${baseUrl}#${section}`, { waitUntil: 'networkidle' });
    // Small wait for scroll position to settle
    await page.waitForTimeout(300);
    await page.screenshot({
      path: join(siteDir, `${String(i + 1).padStart(2, '0')}-${section}.png`),
    });
    console.log(`   ✓ Section: ${section}`);
  }

  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: join(siteDir, 'mobile-full.png'),
    fullPage: true,
  });
  console.log('   ✓ Mobile (375px)');

  await page.close();
}

async function main() {
  console.log('Visual Verification — Stylus Nexus Guide Sites');
  console.log(`Output: ${outDir}`);

  const browser = await chromium.launch();

  const sitesToCheck = siteFilter ? [siteFilter] : Object.keys(SITES);
  for (const siteKey of sitesToCheck) {
    if (!SITES[siteKey]) {
      console.error(`Unknown site: ${siteKey}. Use 'testing' or 'shipping'.`);
      process.exit(1);
    }
    await screenshotSite(browser, siteKey);
  }

  await browser.close();

  console.log(`\n✅ Screenshots saved to ${outDir}`);
  console.log('   Review manually or run /ux-review on the screenshots/ directory.');
}

main().catch((err) => {
  console.error('Visual verification failed:', err);
  process.exit(1);
});
