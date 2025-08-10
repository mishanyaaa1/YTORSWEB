import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const includeExts = new Set(['.js', '.jsx', '.css', '.html', '.md', '.svg']);

const replacements = [
  ['#e6a34a', '#e6a34a'],
  ['#c97c1a', '#c97c1a'],
  ['#a56312', '#a56312'],
  ['#e6a34a', '#e6a34a'],
  ['#c97c1a', '#c97c1a'],
  ['#e6a34a', '#e6a34a'],
];

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!includeExts.has(ext)) return false;
  // Skip lockfiles and sqlite
  return !/node_modules|\.sqlite|package-lock\.json|server\/backups/.test(filePath);
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = original;
  for (const [from, to] of replacements) {
    updated = updated.split(from).join(to);
    // also lowercased variants
    updated = updated.split(from.toLowerCase()).join(to);
    updated = updated.split(from.toUpperCase()).join(to);
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
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
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


