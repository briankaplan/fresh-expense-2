const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const workspaces = [
    'apps/backend',
    'apps/frontend',
    'packages/types',
    'packages/utils',
    'packages/ui',
    'packages/hooks',
    'packages/api-client'
];

function lintWorkspace(workspace) {
    console.log(`\n🔍 Linting ${workspace}...`);
    try {
        const workspacePath = path.resolve(process.cwd(), workspace);
        if (!fs.existsSync(workspacePath)) {
            console.log(`⚠️  Skipping ${workspace} - directory not found`);
            return;
        }

        const command = `NODE_OPTIONS='--max-old-space-size=4096' eslint ${workspacePath} --fix`;
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ Successfully linted ${workspace}`);
    } catch (error) {
        console.error(`❌ Error linting ${workspace}:`, error.message);
        process.exit(1);
    }
}

console.log('🚀 Starting workspace linting...');
workspaces.forEach(lintWorkspace);
console.log('\n✨ All workspaces linted!'); 