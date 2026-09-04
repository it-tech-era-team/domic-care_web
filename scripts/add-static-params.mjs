import fs from 'fs';
import path from 'path';

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.isFile() && (entry.name === 'route.ts' || entry.name === 'route.js')) {
      if (fullPath.includes('[id]')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('generateStaticParams')) {
          content = "export function generateStaticParams() { return []; }\n" + content;
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Added generateStaticParams to ${fullPath}`);
        }
      }
    }
  }
}

const apiDir = path.join(process.cwd(), 'app', 'api');
if (fs.existsSync(apiDir)) {
  processDir(apiDir);
  console.log('All dynamic [id] API routes updated!');
}
