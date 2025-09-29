import fs from 'fs';

interface Section { title: string; content: string[] }
interface Extraction { sections: Section[] }

// Heuristic mapping functions
function findRoles(sections: Section[]): string[] {
  const roles: Set<string> = new Set();
  const roleRegex = /(role|user type|persona)[:\-]?\s*(.+)/i;
  for (const s of sections) {
    if (/role/i.test(s.title)) {
      for (const line of s.content) {
        const m = line.match(/^[*-]\s*([A-Za-z ]{3,40})/);
        if (m) roles.add(m[1].trim().toLowerCase());
      }
    }
    for (const line of s.content) {
      const m2 = line.match(roleRegex);
      if (m2) roles.add(m2[2].trim().toLowerCase());
    }
  }
  return Array.from(roles);
}

function guessPermissions(sections: Section[]): string[] {
  const perms = new Set<string>();
  const verbs = ['create','update','delete','view','list','assign','approve','reject','export','import'];
  for (const s of sections) {
    for (const line of s.content) {
      for (const v of verbs) {
        if (new RegExp(`\\b${v}\\b`, 'i').test(line) && line.length < 160) {
          const words = line.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(/\s+/).slice(0,6).filter(Boolean);
          const obj = words.filter(w => !verbs.includes(w))[0];
          if (obj) perms.add(`${obj}.${v}`.replace(/\s+/g,'-'));
        }
      }
    }
  }
  return Array.from(perms).slice(0,200);
}

function generateMarkdown(roles: string[], permissions: string[]) {
  return `# Parsed BRD (Heuristic Draft)\n\n## Roles\n${roles.map(r=>`- ${r}`).join('\n')}\n\n## Sample Permissions (Guessed)\n${permissions.map(p=>`- ${p}`).join('\n')}\n`;}

async function main() {
  const path = process.argv[2] || 'brd-extracted.json';
  if (!fs.existsSync(path)) {
    console.error('Extraction JSON not found:', path);
    process.exit(1);
  }
  const extraction: Extraction = JSON.parse(fs.readFileSync(path,'utf8'));
  const roles = findRoles(extraction.sections);
  const perms = guessPermissions(extraction.sections);
  fs.writeFileSync('requirements-parsed.md', generateMarkdown(roles, perms));
  console.log('Wrote requirements-parsed.md');
}

main().catch(e => { console.error(e); process.exit(1); });
