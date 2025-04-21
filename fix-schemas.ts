import fs from 'fs';
import path from 'path';

const SCHEMAS_DIR = path.resolve(__dirname, './packages/types/src/schemas');

const metadataMap: Record<string, string[]> = {};

function walk(dir: string): string[] {
    return fs.readdirSync(dir).flatMap((f) => {
        const full = path.join(dir, f);
        return fs.statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
    });
}

function processFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');
    const classNameMatch = content.match(/export class (\w+)/);
    const className = classNameMatch?.[1] ?? 'Unknown';

    const lines = content.split('\n');
    let modified = false;
    const metadataLines: string[] = [];

    const updated = lines.map((line) => {
        // Skip lines with @Prop decorator or imports/exports
        if (/@Prop/.test(line) || /^(import|export)/.test(line.trim())) return line;

        // Add `public` to class properties missing it
        const propMatch = line.trim().match(/^(\s*)(readonly\s+)?(?!public|private|protected)([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (propMatch && !line.includes('constructor') && !line.includes('import') && !line.includes('export')) {
            modified = true;
            return line.replace(/^(\s*)(readonly\s+)?/, '$1public ');
        }

        // Collect metadata inline type if exists
        if (line.includes('public metadata?:') || line.includes('@Prop') && line.includes('metadata')) {
            metadataLines.push(line.trim());
        }

        return line;
    });

    if (metadataLines.length > 0) {
        metadataMap[className] = metadataLines;
    }

    if (modified) {
        fs.writeFileSync(filePath, updated.join('\n'), 'utf8');
        console.log(`✅ Updated: ${path.relative(SCHEMAS_DIR, filePath)}`);
    }
}

function generateMetadataInterfaces() {
    console.log('\n🎯 Suggested Interfaces:\n');
    for (const [schema, lines] of Object.entries(metadataMap)) {
        console.log(`export interface ${schema}Metadata {`);
        for (const line of lines) {
            const match = line.match(/(\w+):\s*(.*);/);
            if (match) {
                const [_, key, type] = match;
                console.log(`  ${key}?: ${type.replace(/;$/, '')}`);
            } else {
                console.log(`  // Unknown metadata shape: ${line}`);
            }
        }
        console.log('}\n');
    }
}

function run() {
    console.log(`🔍 Scanning ${SCHEMAS_DIR}...\n`);
    const files = walk(SCHEMAS_DIR);
    files.forEach(processFile);
    generateMetadataInterfaces();
}

run(); 