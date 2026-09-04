import fs from 'fs';
import path from 'path';

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && (entry.name === 'route.ts' || entry.name === 'route.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes("export const dynamic = 'force-static'") && !content.includes('export const dynamic = "force-static"')) {
        content = "export const dynamic = 'force-static';\n" + content;
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const apiDir = path.join(process.cwd(), 'app', 'api');
if (fs.existsSync(apiDir)) {
  processDir(apiDir);
  console.log('All API routes updated for static export!');
} else {
  console.log('No app/api directory found.');
}
