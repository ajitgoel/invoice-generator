// Headless test runner for the invoice-generator browser test suite.
// Launches Chromium, loads test/index.html, waits for results, and exits
// with code 0 (all pass) or 1 (any failure or error).

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const testUrl = 'file://' + path.join(projectRoot, 'test', 'index.html');

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('pageerror', (err) => {
  console.error('PAGE ERROR:', err.message);
  process.exitCode = 1;
});

await page.goto(testUrl);

// Wait for the test runner to finish (it writes a <strong> with totals)
await page.waitForFunction(() => {
  const el = document.querySelector('#results strong');
  return el && el.textContent.includes('total');
});

const results = await page.textContent('#results');
console.log(results);

// Parse the summary line
const summaryMatch = results.match(/(\d+)\s+passed,\s+(\d+)\s+failed/);
if (summaryMatch) {
  const fails = parseInt(summaryMatch[2], 10);
  if (fails > 0) {
    process.exitCode = 1;
  }
} else {
  console.error('Could not parse test results');
  process.exitCode = 1;
}

await browser.close();
