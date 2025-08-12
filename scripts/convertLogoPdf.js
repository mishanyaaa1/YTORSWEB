/*
  Конвертирует первый лист PDF-логотипа в PNG: src/img/лого вектор 2.pdf -> public/logo.png
  Запускается как prebuild-скрипт.
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convert() {
  const inputPath = path.join(process.cwd(), 'src', 'img', 'лого вектор 2.pdf');
  const outputPath = path.join(process.cwd(), 'public', 'logo.png');

  if (!fs.existsSync(inputPath)) {
    console.error(`Файл не найден: ${inputPath}`);
    process.exit(1);
  }

  const data = new Uint8Array(fs.readFileSync(inputPath));

  // В node-среде работаем без воркера
  const doc = await pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false, disableFontFace: true }).promise;
  const page = await doc.getPage(1);
  const scale = 3; // повышенное качество для маленького размера отображения
  const viewport = page.getViewport({ scale });

  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext('2d');

  const canvasFactory = {
    create: (w, h) => {
      const c = createCanvas(Math.ceil(w), Math.ceil(h));
      return { canvas: c, context: c.getContext('2d') };
    },
    reset: (canvasAndContext, w, h) => {
      canvasAndContext.canvas.width = Math.ceil(w);
      canvasAndContext.canvas.height = Math.ceil(h);
    },
    destroy: (canvasAndContext) => {
      canvasAndContext.canvas = null;
      canvasAndContext.context = null;
    }
  };

  const renderContext = {
    canvasContext: ctx,
    viewport,
    canvasFactory,
    intent: 'print'
  };

  await page.render(renderContext).promise;

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Готово: ${outputPath}`);
}

convert().catch((err) => {
  console.error('Ошибка конвертации PDF → PNG:', err);
  process.exit(1);
});


