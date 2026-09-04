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
      let modified = false;
      if (content.includes("export const dynamic = 'force-static';\n")) {
        content = content.replace("export const dynamic = 'force-static';\n", "");
        modified = true;
      }
      if (content.includes("export function generateStaticParams() { return []; }\n")) {
        content = content.replace("export function generateStaticParams() { return []; }\n", "");
        modified = true;
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Reverted ${fullPath}`);
      }
    }
  }
}

const apiDir = path.join(process.cwd(), 'app', 'api');
if (fs.existsSync(apiDir)) {
  processDir(apiDir);
  console.log('All API routes restored to dynamic node execution mode!');
}
