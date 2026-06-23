const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const base = 'http://localhost:3000';
  const out = 'docs/test-screenshots';
  const log = [];

  const shot = async (n, label) => { await page.screenshot({ path: `${out}/${n}.png` }); log.push(label); };

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await shot('01-homepage', `[1] Homepage OK - ${await page.title()}`);

  await page.click('text=Voucher Game').catch(()=>{});
  await page.waitForTimeout(1000);
  await shot('02-game-cat', '[2] Voucher Game category selected');

  await page.click('text=Mobile Legends').catch(()=>{});
  await page.waitForTimeout(1000);
  await shot('03-ml-brand', '[3] Mobile Legends brand → denominations');

  await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot('04-login', '[4] Login page');

  await page.goto(`${base}/lacak`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot('05-lacak', '[5] Lacak page');

  await page.goto(`${base}/invoice/INV-20260619-AB12`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await shot('06-invoice', '[6] Invoice page (mock)');

  await browser.close();
  log.forEach(l => console.log(l));
  console.log('DONE');
})().catch(e => { console.error('ERR:', e.message.slice(0,200)); process.exit(1); });
