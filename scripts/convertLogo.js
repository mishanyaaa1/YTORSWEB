// FREEFORM SCRIPT: convert PNG logo to WebP using sharp
import sharp from 'sharp';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPng = resolve(__dirname, '../src/img/лого вектор 2-min.png');
const outputWebp = resolve(__dirname, '../src/img/лого вектор 2-min.webp');

async function main() {
  if (!existsSync(inputPng)) {
    console.error('Input PNG not found:', inputPng);
    process.exit(1);
  }
  await sharp(inputPng)
    .webp({ quality: 85, effort: 6 })
    .toFile(outputWebp);
  console.log('Converted to:', outputWebp);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


