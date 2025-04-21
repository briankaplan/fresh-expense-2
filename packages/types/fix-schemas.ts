import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMAS_DIR = path.join(__dirname, 'src', 'schemas');

function processFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let modified = false;

    const newLines = lines.map(line => {
        // Only process lines inside class definitions
        if (line.includes('class')) {
            return line;
        }

        // Skip lines that already have access modifiers or are not property declarations
        if (line.match(/^\s*(public|private|protected|readonly|constructor|@|\/\/|\/\*|\*|import|export)/)) {
            return line;
        }

        // Match class properties that need public modifier
        const propertyMatch = line.match(/^\s*([a-zA-Z_$][a-zA-Z0-9_$]*!?\??\s*:)/);
        if (propertyMatch) {
            modified = true;
            return line.replace(propertyMatch[0], `  public ${propertyMatch[1]}`);
        }
        return line;
    });

    if (modified) {
        fs.writeFileSync(filePath, newLines.join('\n'));
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.schema.ts')) {
            processFile(fullPath);
        }
    }
}

processDirectory(SCHEMAS_DIR); 