const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  const saveDir = '/home/hanz/projects/Adnanpay.com/public/assets/reference';

  console.log('Loading topupgaming.com...');
  await page.goto('https://topupgaming.com/', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Wait a bit for any lazy-loaded content
  await page.waitForTimeout(3000);

  // 1. Full-page screenshot
  console.log('Capturing full-page screenshot...');
  await page.screenshot({
    path: `${saveDir}/homepage-full.png`,
    fullPage: true
  });
  console.log('Done: homepage-full.png');

  // 2. Navigation/header area
  console.log('Capturing header...');
  // Try to find header/nav elements
  const headerSelectors = ['header', 'nav', '[class*="header"]', '[class*="nav"]', '[class*="topbar"]', '#header', '#nav'];
  let headerFound = false;
  for (const sel of headerSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) {
        await el.screenshot({ path: `${saveDir}/header.png` });
        headerFound = true;
        console.log(`Done: header.png (selector: ${sel})`);
        break;
      }
    } catch (e) {
      // continue to next selector
    }
  }
  if (!headerFound) {
    // Fallback: clip top portion of viewport
    await page.screenshot({
      path: `${saveDir}/header.png`,
      clip: { x: 0, y: 0, width: 1440, height: 150 }
    });
    console.log('Done: header.png (fallback: top 150px)');
  }

  // 3. Product sections (Top Up / Voucher)
  console.log('Capturing product sections...');
  // Try common section selectors
  const productSelectors = [
    '[class*="product"]',
    '[class*="topup"]',
    '[class*="voucher"]',
    '[class*="catalog"]',
    '[class*="category"]',
    'main',
    '[role="main"]',
    '.container',
    '[class*="grid"]'
  ];
  let productFound = false;
  for (const sel of productSelectors) {
    try {
      const elements = page.locator(sel);
      const count = await elements.count();
      if (count > 0) {
        // Capture the first matching product section
        const el = elements.first();
        if (await el.isVisible({ timeout: 2000 })) {
          await el.screenshot({ path: `${saveDir}/products.png` });
          productFound = true;
          console.log(`Done: products.png (selector: ${sel}, count: ${count})`);
          break;
        }
      }
    } catch (e) {
      // continue
    }
  }
  if (!productFound) {
    // Fallback: capture middle of page
    await page.screenshot({
      path: `${saveDir}/products.png`,
      clip: { x: 0, y: 150, width: 1440, height: 800 }
    });
    console.log('Done: products.png (fallback: middle section)');
  }

  // 4. Footer area
  console.log('Capturing footer...');
  const footerSelectors = ['footer', '[class*="footer"]', '#footer', '[class*="bottom"]'];
  let footerFound = false;
  for (const sel of footerSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 })) {
        await el.screenshot({ path: `${saveDir}/footer.png` });
        footerFound = true;
        console.log(`Done: footer.png (selector: ${sel})`);
        break;
      }
    } catch (e) {
      // continue
    }
  }
  if (!footerFound) {
    // Fallback: scroll to bottom and capture
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: `${saveDir}/footer.png`,
      clip: { x: 0, y: 0, width: 1440, height: 300 }
    });
    console.log('Done: footer.png (fallback: scrolled to bottom)');
  }

  // Get page dimensions for reference
  const dims = await page.evaluate(() => ({
    totalHeight: document.body.scrollHeight,
    viewportHeight: window.innerHeight,
    title: document.title
  }));
  console.log(`\nPage info: "${dims.title}" - Total height: ${dims.totalHeight}px`);

  await browser.close();
  console.log('\nAll screenshots saved to:', saveDir);
})();
