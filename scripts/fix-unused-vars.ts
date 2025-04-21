import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';
import { ESLint } from 'eslint';

const projectRoot = path.resolve('./apps/backend');
const fileGlobs = [`${projectRoot}/**/*.{ts,js}`];

async function main() {
    const eslint = new ESLint({ fix: false });
    const files = await glob(fileGlobs, { ignore: ['**/node_modules/**'] });

    for (const filePath of files) {
        const code = fs.readFileSync(filePath, 'utf-8');
        const results = await eslint.lintText(code, { filePath });

        let fixedCode = code;
        let changed = false;

        for (const result of results) {
            for (const message of result.messages) {
                if (
                    message.ruleId === '@typescript-eslint/no-unused-vars' &&
                    message.message.includes('is defined but never used')
                ) {
                    const match = /'([^']+)' is defined but never used/.exec(message.message);
                    if (!match) continue;

                    const varName = match[1];
                    const unusedRegex = new RegExp(`\\b(${varName})\\b`, 'g');

                    // Only replace parameter or destructured var definitions
                    const replaced = fixedCode.replace(unusedRegex, (m, p1, offset, str) => {
                        const before = str.slice(offset - 20, offset);
                        if (
                            /\(\s*$/.test(before) ||  // function param start
                            /,\s*$/.test(before) ||   // comma in param list
                            /{[^}]*$/.test(before)    // object destructure
                        ) {
                            changed = true;
                            return `_${p1}`;
                        }
                        return p1; // leave used vars alone
                    });
                    fixedCode = replaced;
                }
            }
        }

        if (changed && fixedCode !== code) {
            fs.writeFileSync(filePath, fixedCode, 'utf-8');
            console.log(`🔧 Fixed unused vars in: ${path.relative(process.cwd(), filePath)}`);
        }
    }

    console.log('✅ Done fixing unused variables.');
}

main().catch((err) => {
    console.error('Error fixing unused vars:', err);
    process.exit(1);
}); 