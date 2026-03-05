import { chromium } from '@playwright/test';
import fs from 'fs';

const DIR = 'docs/screenshosts';

async function shot(page, name) {
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/${name}.png` });
  console.log(`  ✓ ${name}`);
}

async function run() {
  fs.mkdirSync(DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('Loading http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // wait for entrance animations

  // 0 — Title
  await shot(page, '0_title');

  // 1 — Context (scroll/Enter from title)
  await page.keyboard.press('Enter');
  await shot(page, '1_context');

  // 2-5 — Narrative chapters (Enter the Forest button, then Next x3)
  await page.click('text=Enter the Forest');
  await shot(page, '2_narrative_niger');

  await page.click('text=Next');
  await shot(page, '3_narrative_india');

  await page.click('text=Next');
  await shot(page, '4_narrative_vietnam');

  await page.click('text=Next');
  await shot(page, '5_narrative_singapore');

  // 6 — Explore (click Start Exploring on last chapter)
  await page.click('text=Start Exploring');
  await page.waitForTimeout(1800);
  await shot(page, '6_explore');

  // 7 — Country modal (click the first clickable tree)
  const clicked = await page.evaluate(() => {
    // Trees render as <g> elements with cursor:pointer inside the SVG
    const candidates = [...document.querySelectorAll('svg g')].filter(el => {
      const style = el.getAttribute('style') || '';
      return style.includes('cursor: pointer') || style.includes('cursor:pointer');
    });
    if (candidates.length === 0) return false;
    // pick one from the middle so it's likely visible
    const target = candidates[Math.floor(candidates.length / 2)];
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  });

  if (!clicked) {
    console.log('  ! No clickable tree found — trying first rect/circle in SVG');
    await page.evaluate(() => {
      const el = document.querySelector('svg rect, svg circle');
      if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
  }

  await page.waitForTimeout(1200);
  await shot(page, '7_modal');

  await browser.close();
  console.log('\nDone — screenshots in', DIR);
}

run().catch(err => { console.error(err); process.exit(1); });
