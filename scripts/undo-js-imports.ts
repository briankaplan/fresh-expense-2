import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';

async function undoJsImports() {
    const files = await glob(['apps/backend/**/*.ts'], {
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        absolute: true,
    });

    const importRegex = /(?<=from\s+['"])(\.{1,2}\/[^'"]+)\.js(?=['"])/g;

    files.forEach((file) => {
        let content = fs.readFileSync(file, 'utf8');
        const matches = [...content.matchAll(importRegex)];

        let changed = false;
        for (const match of matches) {
            const importPath = match[0];
            const newPath = importPath.replace(/\.js$/, '');
            content = content.replace(importPath, newPath);
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`🔧 Fixed imports in: ${path.relative(process.cwd(), file)}`);
        }
    });
}

undoJsImports().catch(console.error); 