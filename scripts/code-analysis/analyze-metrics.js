"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
async function analyzeMetrics() {
    // Initialize a new project
    const project = new ts_morph_1.Project({
        tsConfigFilePath: 'tsconfig.json',
    });
    // Add source files
    project.addSourceFilesAtPaths(['apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts']);
    // Get all metrics-related files
    const metricsFiles = project
        .getSourceFiles()
        .filter(file => file.getFilePath().includes('metrics') || file.getFilePath().includes('Metrics'));
    console.log('Found metrics files:', metricsFiles.length);
    // Analyze each metrics file
    for (const file of metricsFiles) {
        console.log('\nAnalyzing:', file.getFilePath());
        // Get all interfaces and types
        const interfaces = file.getInterfaces();
        const types = file.getTypeAliases();
        console.log('Interfaces:', interfaces.length);
        console.log('Types:', types.length);
        // Get all functions
        const functions = file.getFunctions();
        console.log('Functions:', functions.length);
        // Get all classes
        const classes = file.getClasses();
        console.log('Classes:', classes.length);
        // Analyze dependencies
        const imports = file.getImportDeclarations();
        console.log('Imports:', imports.length);
        imports.forEach(imp => {
            console.log('  -', imp.getModuleSpecifierValue());
        });
        // Find potential issues
        const potentialIssues = file.getDescendantsOfKind(ts_morph_1.SyntaxKind.Identifier).filter(node => {
            const text = node.getText();
            return text.includes('any') || text.includes('unknown');
        });
        if (potentialIssues.length > 0) {
            console.log('\nPotential type issues found:');
            potentialIssues.forEach(issue => {
                console.log(`  - ${issue.getText()} at line ${issue.getStartLineNumber()}`);
            });
        }
    }
}
// Run the analysis
analyzeMetrics().catch(console.error);
//# sourceMappingURL=analyze-metrics.js.map