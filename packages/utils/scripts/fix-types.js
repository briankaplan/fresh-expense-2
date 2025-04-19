"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const project = new ts_morph_1.Project({
    tsConfigFilePath: 'tsconfig.json',
});
// Get all source files
const sourceFiles = project.getSourceFiles();
// Function to fix MetricsAggregation interface
function fixMetricsAggregationInterface(sourceFile) {
    const interfaceNode = sourceFile.getInterface('MetricsAggregation');
    if (interfaceNode) {
        // Add missing properties
        interfaceNode.addProperty({
            name: 'total',
            type: 'number',
        });
        interfaceNode.addProperty({
            name: 'average',
            type: 'number',
        });
        interfaceNode.addProperty({
            name: 'count',
            type: 'number',
        });
    }
}
// Function to fix JSX children prop
function fixJSXChildren(sourceFile) {
    const jsxElements = sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.JsxElement);
    jsxElements.forEach(jsxElement => {
        const children = jsxElement.getChildren();
        if (children.length > 1) {
            // Wrap multiple children in a fragment
            const fragment = project.createSourceFile('temp.tsx', '<></>').getFirstChildByKind(ts_morph_1.SyntaxKind.JsxFragment);
            if (fragment) {
                jsxElement.replaceWithText(fragment.getText().replace('<>', '').replace('</>', ''));
            }
        }
    });
}
// Process each source file
sourceFiles.forEach(sourceFile => {
    fixMetricsAggregationInterface(sourceFile);
    fixJSXChildren(sourceFile);
});
// Save changes
project.saveSync();
//# sourceMappingURL=fix-types.js.map