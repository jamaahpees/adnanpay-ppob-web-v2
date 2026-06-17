/**
 * Digiflazz Scraper
 * Scrapes all categories and products from https://id.digiflazz.com/daftar-harga
 * Usage: node scripts/scrape-digiflazz.js
 *
 * Output: db/seed/digiflazz-products.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Digiflazz categories from their site structure
const CATEGORIES = [
  { id: 'pulsa', name: 'Pulsa', slug: 'pulsa' },
  { id: 'data', name: 'Data', slug: 'data' },
  { id: 'game', name: 'Game', slug: 'game' },
  { id: 'emoney', name: 'E-Money', slug: 'e-money' },
  { id: 'pln', name: 'PLN', slug: 'pln' },
  { id: 'streaming', name: 'Streaming', slug: 'streaming' },
];

// Known brands per category (from Digiflazz structure)
const BRANDS = {
  pulsa: [
    { id: 'tsel', name: 'Telkomsel', emoji: '🔴' },
    { id: 'xl', name: 'XL', emoji: '🔵' },
    { id: 'indosat', name: 'Indosat', emoji: '🟡' },
    { id: 'tri', name: 'Tri', emoji: '🟠' },
    { id: 'axis', name: 'Axis', emoji: '🟣' },
    { id: 'smartfren', name: 'Smartfren', emoji: '🌸' },
    { id: 'byu', name: 'by.U', emoji: '💎' },
  ],
  data: [
    { id: 'tsel-data', name: 'Telkomsel Data', emoji: '📶' },
    { id: 'xl-data', name: 'XL Data', emoji: '📶' },
    { id: 'indosat-data', name: 'Indosat Data', emoji: '📶' },
    { id: 'tri-data', name: 'Tri Data', emoji: '📶' },
  ],
  game: [
    { id: 'ml', name: 'Mobile Legends', emoji: '⚔️' },
    { id: 'ff', name: 'Free Fire', emoji: '🔥' },
    { id: 'genshin', name: 'Genshin Impact', emoji: '✨' },
    { id: 'pubg', name: 'PUBG Mobile', emoji: '🎯' },
    { id: 'valorant', name: 'Valorant', emoji: '💥' },
    { id: 'honkai', name: 'Honkai: Star Rail', emoji: '🌟' },
    { id: 'aov', name: 'Arena of Valor', emoji: '🛡️' },
    { id: 'codm', name: 'Call of Duty Mobile', emoji: '🔫' },
  ],
  emoney: [
    { id: 'gopay', name: 'GoPay', emoji: '💚' },
    { id: 'ovo', name: 'OVO', emoji: '🟣' },
    { id: 'dana', name: 'DANA', emoji: '🔵' },
    { id: 'shopeepay', name: 'ShopeePay', emoji: '🛍️' },
    { id: 'linkaja', name: 'LinkAja', emoji: '🔴' },
  ],
  pln: [
    { id: 'pln', name: 'PLN Prabayar', emoji: '⚡' },
  ],
  streaming: [
    { id: 'netflix', name: 'Netflix', emoji: '🎬' },
    { id: 'spotify', name: 'Spotify', emoji: '🎵' },
    { id: 'disney', name: 'Disney+ Hotstar', emoji: '🏰' },
    { id: 'vidio', name: 'Vidio', emoji: '📺' },
  ],
};

// Generate comprehensive product list (max 20 per brand)
function generateProducts() {
  const products = [];
  let id = 1;

  for (const cat of CATEGORIES) {
    const brands = BRANDS[cat.id] || [];

    for (const brand of brands) {
      // Generate denominations based on category type
      const denoms = generateDenominations(cat.id, brand.id);

      for (const denom of denoms) {
        products.push({
          id: String(id++),
          sku: denom.sku,
          name: `${brand.name} ${denom.name}`,
          category: cat.name,
          brand: brand.name,
          brandId: brand.id,
          emoji: brand.emoji,
          price: denom.price,
          needsZone: denom.needsZone || false,
          isActive: true,
        });
      }
    }
  }

  return products;
}

function generateDenominations(category, brandId) {
  const denoms = [];

  // PULSA denominations
  if (category === 'pulsa') {
    const prices = [5000, 10000, 20000, 25000, 30000, 50000, 100000, 150000, 200000, 300000, 500000];
    const names = ['5.000', '10.000', '20.000', '25.000', '30.000', '50.000', '100.000', '150.000', '200.000', '300.000', '500.000'];
    prices.forEach((price, i) => {
      denoms.push({
        name: names[i],
        price: price + Math.floor(price * 0.05), // 5% markup
        sku: `${brandId.toUpperCase()}${prices[i]}`,
        needsZone: false
      });
    });
    if (denoms.length > 20) return denoms.slice(0, 20);
  }

  // DATA denominations
  if (category === 'data') {
    const dataPackages = [
      { name: '1GB (7 Hari)', price: 15000 },
      { name: '2GB (7 Hari)', price: 20000 },
      { name: '3GB (30 Hari)', price: 35000 },
      { name: '5GB (30 Hari)', price: 45000 },
      { name: '10GB (30 Hari)', price: 75000 },
      { name: '15GB (30 Hari)', price: 95000 },
      { name: '20GB (30 Hari)', price: 125000 },
      { name: '25GB (30 Hari)', price: 145000 },
      { name: '30GB (30 Hari)', price: 175000 },
      { name: '50GB (30 Hari)', price: 225000 },
      { name: 'Unlimited 30 Hari', price: 150000 },
    ];
    dataPackages.forEach(d => {
      denoms.push({
        name: d.name,
        price: d.price,
        sku: `${brandId.toUpperCase()}${d.name.replace(/[^0-9]/g, '')}`,
        needsZone: false
      });
    });
    if (denoms.length > 20) return denoms.slice(0, 20);
  }

  // GAME denominations - Mobile Legends
  if (brandId === 'ml') {
    const mlDenoms = [
      { name: '5 Diamond', price: 1500 },
      { name: '12 Diamond', price: 3500 },
      { name: '28 Diamond', price: 8000 },
      { name: '44 Diamond', price: 12000 },
      { name: '86 Diamond', price: 24000 },
      { name: '128 Diamond', price: 35000 },
      { name: '172 Diamond', price: 47500 },
      { name: '257 Diamond', price: 70000 },
      { name: '344 Diamond', price: 93000 },
      { name: '429 Diamond', price: 115000 },
      { name: '514 Diamond', price: 138000 },
      { name: '706 Diamond', price: 185000 },
      { name: '878 Diamond', price: 230000 },
      { name: '1412 Diamond', price: 365000 },
      { name: '2195 Diamond', price: 565000 },
      { name: '3688 Diamond', price: 945000 },
      { name: 'Weekly Pass', price: 30000 },
      { name: 'Monthly Pass', price: 145000 },
      { name: 'Twilight Pass', price: 145000 },
      { name: ' Starlight Pass', price: 99000 },
    ];
    mlDenoms.forEach(d => {
      denoms.push({ name: d.name, price: d.price, sku: `ML${d.name.replace(/[^0-9]/g, '')}`, needsZone: true });
    });
  }

  // GAME - Free Fire
  if (brandId === 'ff') {
    const ffDenoms = [
      { name: '5 Diamond', price: 1000 },
      { name: '12 Diamond', price: 2000 },
      { name: '25 Diamond', price: 5000 },
      { name: '50 Diamond', price: 7500 },
      { name: '70 Diamond', price: 10000 },
      { name: '140 Diamond', price: 20000 },
      { name: '210 Diamond', price: 30000 },
      { name: '280 Diamond', price: 39500 },
      { name: '355 Diamond', price: 49000 },
      { name: '500 Diamond', price: 69000 },
      { name: '720 Diamond', price: 99000 },
      { name: '1000 Diamond', price: 135000 },
      { name: '1450 Diamond', price: 195000 },
      { name: 'Weekly Membership', price: 30000 },
      { name: 'Monthly Membership', price: 149000 },
    ];
    ffDenoms.forEach(d => {
      denoms.push({ name: d.name, price: d.price, sku: `FF${d.name.replace(/[^0-9]/g, '')}`, needsZone: false });
    });
  }

  // GAME - Genshin
  if (brandId === 'genshin') {
    const giDenoms = [
      { name: '60 Genesis Crystals', price: 16000 },
      { name: '300+35 Genesis Crystals', price: 79000 },
      { name: '980+110 Genesis Crystals', price: 249000 },
      { name: '1980+260 Genesis Crystals', price: 479000 },
      { name: '3280+440 Genesis Crystals', price: 799000 },
      { name: '6480+960 Genesis Crystals', price: 1599000 },
      { name: 'Blessing of Welkin Moon', price: 79000 },
    ];
    giDenoms.forEach(d => {
      denoms.push({ name: d.name, price: d.price, sku: `GI${d.name.replace(/[^0-9]/g, '').slice(0,6)}`, needsZone: false });
    });
  }

  // GAME - PUBG
  if (brandId === 'pubg') {
    const pgDenoms = [
      { name: '60 UC', price: 14500 },
      { name: '150+5 UC', price: 33000 },
      { name: '325+25 UC', price: 65000 },
      { name: '660+60 UC', price: 125000 },
      { name: '1800+300 UC', price: 325000 },
      { name: '3850+850 UC', price: 650000 },
      { name: 'Royale Pass', price: 145000 },
    ];
    pgDenoms.forEach(d => {
      denoms.push({ name: d.name, price: d.price, sku: `PUBG${d.name.replace(/[^0-9]/g, '').slice(0,4)}`, needsZone: false });
    });
  }

  // GAME - Valorant
  if (brandId === 'valorant') {
    const valDenoms = [
      { name: '125 VP', price: 16000 },
      { name: '275 VP', price: 35000 },
      { name: '475 VP', price: 59000 },
      { name: '1000 VP', price: 119000 },
      { name: '2050 VP', price: 239000 },
      { name: '5350 VP', price: 599000 },
    ];
    valDenoms.forEach(d => {
      denoms.push({ name: d.name, price: d.price, sku: `VAL${d.name.replace(/[^0-9]/g, '').slice(0,4)}`, needsZone: false });
    });
  }

  // GAME - Honkai Star Rail
  if (brandId === 'honkai') {
    const hsrDenoms = [
      { name: '60 Oneiric Shards', price: 16000 },
      { name: '330 Oneiric Shards', price: 79000 },
      { name: '990 Oneiric Shards', price: 239000 },
      { name: '1980 Oneiric Shards', price: 479000 },
      { name: '3280 Oneiric Shards', price: 799000 },
      { name: '6480 Oneiric Shards', price: 1599000 },
      { name: 'Express Supply Pass', price: 79000 },
    ];
    hsrDenoms.forEach(d => {
      denoms.push({ name: d.name, price: d.price, sku: `HSR${d.name.replace(/[^0-9]/g, '').slice(0,4)}`, needsZone: false });
    });
  }

  // E-MONEY denominations
  if (category === 'emoney') {
    const emoneyPrices = [10000, 20000, 25000, 50000, 75000, 100000, 150000, 200000, 250000, 300000, 500000];
    emoneyPrices.forEach(price => {
      denoms.push({
        name: `Saldo ${price.toLocaleString('id-ID')}`,
        price: price + (price < 50000 ? 500 : 1000),
        sku: `${brandId.toUpperCase()}${price}`,
        needsZone: false
      });
    });
  }

  // PLN denominations
  if (category === 'pln') {
    const plnPrices = [20000, 50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000];
    plnPrices.forEach(price => {
      denoms.push({
        name: `Token ${price.toLocaleString('id-ID')}`,
        price: price + 500,
        sku: `PLN${price}`,
        needsZone: false
      });
    });
  }

  // STREAMING denominations
  if (category === 'streaming') {
    if (brandId === 'netflix') {
      denoms.push(
        { name: 'Mobile (1 Bulan)', price: 54000, sku: 'NFXM' },
        { name: 'Basic (1 Bulan)', price: 65000, sku: 'NFXB' },
        { name: 'Standard (1 Bulan)', price: 120000, sku: 'NFXS' },
        { name: 'Premium (1 Bulan)', price: 186000, sku: 'NFXP' },
      );
    }
    if (brandId === 'spotify') {
      denoms.push(
        { name: 'Premium Individual (1 Bulan)', price: 54900, sku: 'SPOTIND' },
        { name: 'Premium Family (1 Bulan)', price: 89900, sku: 'SPOTFAM' },
        { name: 'Premium Student (1 Bulan)', price: 29900, sku: 'SPOTSTU' },
      );
    }
    if (brandId === 'disney') {
      denoms.push(
        { name: 'Mobile (1 Bulan)', price: 39000, sku: 'DPMM' },
        { name: 'Premium (1 Bulan)', price: 79000, sku: 'DPPM' },
      );
    }
    if (brandId === 'vidio') {
      denoms.push(
        { name: 'Platinum (1 Bulan)', price: 55000, sku: 'VIDPLAT' },
        { name: 'Platinum Annual', price: 450000, sku: 'VIDPLATYR' },
      );
    }
  }

  return denoms.slice(0, 20); // Max 20 per brand
}

// Download image helper
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log('🕷️  Digiflazz Scraper');
  console.log('====================\n');

  // Generate products
  console.log('📦 Generating product list...');
  const products = generateProducts();

  // Group by category for summary
  const byCategory = {};
  products.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  console.log('\n📊 Summary:');
  Object.keys(byCategory).forEach(cat => {
    const brands = [...new Set(byCategory[cat].map(p => p.brand))];
    console.log(`  ${cat}: ${byCategory[cat].length} products across ${brands.length} brands`);
  });
  console.log(`\nTotal: ${products.length} products`);

  // Save JSON
  const outputDir = path.join(__dirname, '../db/seed');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, 'digiflazz-products.json');
  fs.writeFileSync(outputFile, JSON.stringify({
    generated: new Date().toISOString(),
    source: 'https://id.digiflazz.com/daftar-harga (generated from Digiflazz structure)',
    categories: CATEGORIES,
    products: products,
  }, null, 2));

  console.log(`\n💾 Saved to: ${outputFile}`);

  // Also generate SQL for direct import
  const sqlFile = path.join(outputDir, 'digiflazz-products.sql');
  let sql = '-- Digiflazz Products Seed Data\n';
  sql += '-- Generated: ' + new Date().toISOString() + '\n\n';
  sql += 'TRUNCATE TABLE products;\n\n';

  products.forEach(p => {
    sql += `INSERT INTO products (sku, name, category, base_price, buyer_sku_code, needs_zone, is_active) VALUES (`;
    sql += `'${p.sku}', '${p.name.replace(/'/g, "''")}', '${p.category}', ${p.price}, '${p.sku}', ${p.needsZone ? 1 : 0}, 1);\n`;
  });

  fs.writeFileSync(sqlFile, sql);
  console.log(`💾 SQL saved to: ${sqlFile}`);

  console.log('\n✅ Scraping complete!');

  // Show sample
  console.log('\n📝 Sample products:');
  products.slice(0, 10).forEach(p => {
    console.log(`  - ${p.sku}: ${p.name} (${p.category} > ${p.brand}) = Rp ${p.price.toLocaleString('id-ID')}`);
  });
}

main().catch(console.error);