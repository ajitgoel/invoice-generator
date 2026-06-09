// Headless test runner for Google AdSense integration tests.
// Loads the actual index.html (not test/index.html) and verifies
// the AdSense script tag, ad container, and related DOM structure.

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const indexUrl = 'file://' + path.join(projectRoot, 'index.html');

const browser = await chromium.launch();
const page = await browser.newPage();

let exitCode = 0;

page.on('pageerror', (err) => {
  console.error('PAGE ERROR:', err.message);
  exitCode = 1;
});

await page.goto(indexUrl);

// Wait for the page to fully load (DOMContentLoaded fires the init in app.js)
await page.waitForLoadState('load');

// Inject the test assertions and run them
const testResults = await page.evaluate(() => {
  // The function runAdsenseTests is defined in adsense.test.js which
  // we need to have available. We'll evaluate it inline here.
  // This avoids needing to load adsense.test.js as a separate <script> in index.html.
  return null; // placeholder — we'll pass the fn directly
});

// Read the test file and evaluate its function, then call it
const testFile = fs.readFileSync(
  path.join(__dirname, 'adsense.test.js'),
  'utf-8'
);

// Evaluate the test file content to make runAdsenseTests available
await page.evaluate(testFile);

// Now call the function and get results
const outcome = await page.evaluate(() => {
  return runAdsenseTests();
});

// Print results
for (const line of outcome.results) {
  console.log(line);
}
console.log('');
console.log(
  outcome.pass +
    ' passed, ' +
    outcome.fail +
    ' failed, ' +
    outcome.total +
    ' total'
);

if (outcome.fail > 0) {
  exitCode = 1;
}

await browser.close();
process.exit(exitCode);
