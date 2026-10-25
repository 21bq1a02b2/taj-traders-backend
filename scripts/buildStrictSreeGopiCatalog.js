import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products84 } from './build84UniqueCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Filter ONLY the 24 authentic scraped Cloudinary products from sreegopitraders.com
const authentic24 = products84.filter(p => p.image && p.image.includes('res.cloudinary.com'));

console.log('Authentic products from sreegopitraders.com count:', authentic24.length);

if (authentic24.length !== 24) {
  console.error('Expected exactly 24 authentic products, found:', authentic24.length);
  process.exit(1);
}

// Interleave 3 passes so no product repeats more than 3 times (each appears exactly 3 times)
// Pass 1: Original order (covers Page 1 and Page 2)
const pass1 = authentic24.map((p, i) => ({
  ...p,
  _id: `spt_${p.slug}_p1_${i + 1}`,
}));

// Pass 2: Even indices then odd indices (covers Page 3 and Page 4 with diverse mix)
const pass2Indices = [
  0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, // 12 items for Page 3
  1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23  // 12 items for Page 4
];
const pass2 = pass2Indices.map((origIdx, i) => ({
  ...authentic24[origIdx],
  _id: `spt_${authentic24[origIdx].slug}_p2_${i + 1}`,
}));

// Pass 3: Cross-stride interleaving (covers Page 5 and Page 6 with diverse mix)
const pass3Indices = [
  0, 5, 10, 15, 20, 1, 6, 11, 16, 21, 2, 7,  // 12 items for Page 5
  12, 17, 22, 3, 8, 13, 18, 23, 4, 9, 14, 19 // 12 items for Page 6
];
const pass3 = pass3Indices.map((origIdx, i) => ({
  ...authentic24[origIdx],
  _id: `spt_${authentic24[origIdx].slug}_p3_${i + 1}`,
}));

// Total 72 products (24 * 3 = 72, exactly 6 full pages of 12 items)
const catalog72 = [...pass1, ...pass2, ...pass3];

console.log('Total products in catalog:', catalog72.length);

// Verify repetition count
const nameCounts = {};
catalog72.forEach(p => {
  nameCounts[p.name] = (nameCounts[p.name] || 0) + 1;
});

const counts = Object.values(nameCounts);
const minCount = Math.min(...counts);
const maxCount = Math.max(...counts);
console.log('Min repetition:', minCount, 'Max repetition:', maxCount);
console.log('Products repeating more than 3 times:', counts.filter(c => c > 3).length);

const fileContent = `export const seedProducts = ${JSON.stringify(catalog72, null, 2)};\n`;
const outputPath = path.resolve(__dirname, '../data/seedProducts.js');
fs.writeFileSync(outputPath, fileContent, 'utf-8');

console.log(`Successfully written 72 authentic products to ${outputPath}`);
