import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';

async function fixImports() {
    const files = await glob(['apps/backend/**/*.{js,ts}'], {
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        absolute: true,
    });

    const importRegex = /(?<=from\s+['"])(\.{1,2}\/[^'"]+)(?=['"])/g;

    files.forEach((file) => {
        let content = fs.readFileSync(file, 'utf8');
        const matches = [...content.matchAll(importRegex)];

        let changed = false;
        for (const match of matches) {
            const importPath = match[0];
            if (!importPath.endsWith('.js') && !importPath.endsWith('.ts')) {
                content = content.replace(importPath, `${importPath}.js`);
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`🔧 Fixed imports in: ${path.relative(process.cwd(), file)}`);
        }
    });
}

fixImports().catch(console.error); 