#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node extract-brd.js <path-to-brd.docx>');
    process.exit(1);
  }
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.error('File not found:', abs);
    process.exit(1);
  }
  const { value } = await mammoth.extractRawText({ path: abs });
  // Basic heuristic segmentation
  const lines = value.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const sections = {};
  let current = 'UNCLASSIFIED';
  for (const line of lines) {
    if (/^(\d+\.?)+\s+/.test(line) || /^[A-Z][A-Z ]{3,}$/.test(line)) {
      current = line.replace(/[^A-Za-z0-9 ._-]/g,'').slice(0,120);
      if (!sections[current]) sections[current] = [];
    } else {
      if (!sections[current]) sections[current] = [];
      sections[current].push(line);
    }
  }
  const output = { generatedAt: new Date().toISOString(), file: abs, sections: Object.entries(sections).map(([title, content]) => ({ title, content })) };
  fs.writeFileSync('brd-extracted.json', JSON.stringify(output, null, 2));
  fs.writeFileSync('brd-extracted.txt', value);
  console.log('Extraction complete: brd-extracted.json, brd-extracted.txt');
}

main().catch(e => { console.error(e); process.exit(1); });
