import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const includeExts = new Set(['.js', '.jsx', '.css', '.html', '.md', '.svg']);

// HEX replacements (greens -> soft oranges)
const textReplacements = [
  ['#e6a34a', '#e6a34a'],
  ['#c97c1a', '#c97c1a'],
  ['#a56312', '#a56312'],
  ['#e6a34a', '#e6a34a'],
  ['#c97c1a', '#c97c1a'],
  ['#e6a34a', '#e6a34a'],
];

// Regex replacements (RGBA greens glow -> orange glow)
const regexReplacements = [
  // rgba(0, 255, 136, A) -> rgba(230, 163, 74, A)
  [new RegExp('rgba\\(\\s*0\\s*,\\s*255\\s*,\\s*136\\s*,\\s*([0-9.]+)\\s*\\)', 'gi'), 'rgba(230, 163, 74, $1)'],
];

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!includeExts.has(ext)) return false;
  // Skip lockfiles and sqlite
  return !/node_modules|\.sqlite|package-lock\.json|server\/backups|^dist\//.test(filePath.replace(/\\/g, '/'));
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = original;

  // Simple text replacements
  for (const [from, to] of textReplacements) {
    updated = updated.split(from).join(to);
    updated = updated.split(from.toLowerCase()).join(to);
    updated = updated.split(from.toUpperCase()).join(to);
  }

  // Regex replacements
  for (const [pattern, replacement] of regexReplacements) {
    updated = updated.replace(pattern, replacement);
  }

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }
  return false;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
      walk(full);
    } else if (shouldProcess(full)) {
      try {
        const changed = processFile(full);
        if (changed) console.log('Updated', path.relative(projectRoot, full));
      } catch (e) {
        console.warn('Skip (error):', full, e.message);
      }
    }
  }
}

walk(projectRoot);
console.log('Done color replacement.');


