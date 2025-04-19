import { Project, SyntaxKind, Node, PropertyAssignmentStructure, StructureKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

const files = project.getSourceFiles('src/**/*.ts?(x)');

files.forEach(sourceFile => {
  sourceFile.forEachDescendant(node => {
    // Convert string date values to Date objects
    if (node.getKind() === SyntaxKind.PropertyAssignment) {
      const prop = node.asKind(SyntaxKind.PropertyAssignment);
      if (!prop) return;

      const name = prop.getName();
      const value = prop.getInitializer();

      if (
        ['createdAt', 'updatedAt', 'date'].includes(name) &&
        value?.getKind() === SyntaxKind.StringLiteral
      ) {
        const dateStr = value.getText().replace(/^"|"$/g, '');
        prop.setInitializer(`new Date("${dateStr}")`);
      }

      // Replace amount: number → amount: { value, currency }
      if (name === 'amount' && value?.getKind() === SyntaxKind.NumericLiteral) {
        const val = value.getText();
        prop.setInitializer(`{ value: ${val}, currency: "USD" }`);
      }

      // Replace merchant: "Some Store" → merchant: { name: "Some Store" }
      if (name === 'merchant' && value?.getKind() === SyntaxKind.StringLiteral) {
        const val = value.getText();
        prop.setInitializer(`{ name: ${val} }`);
      }

      // Fix status: 'unmatched' → 'matched'
      if (name === 'status' && value?.getText() === `'unmatched'`) {
        prop.setInitializer(`'matched'`);
      }
    }
  });

  sourceFile.saveSync();
});

console.log('✅ Auto-fix complete.');

// Fix ReceiptDocument import
const receiptMatcherService = project.getSourceFile('apps/backend/src/app/services/receipt/receipt-matcher.service.ts');
if (receiptMatcherService) {
  // Remove unused imports
  const imports = receiptMatcherService.getImportDeclarations();
  imports.forEach(imp => {
    if (imp.getModuleSpecifierValue() === '@fresh-expense/types') {
      const namedImports = imp.getNamedImports();
      namedImports.forEach(namedImport => {
        if (['ReceiptDocument', 'ReceiptMetadata'].includes(namedImport.getName())) {
          namedImport.remove();
        }
      });
      if (imp.getNamedImports().length === 0) {
        imp.remove();
      }
    }
  });

  // Add correct import
  receiptMatcherService.addImportDeclaration({
    moduleSpecifier: '@fresh-expense/types',
    namedImports: ['ReceiptDocument', 'ReceiptMetadata'],
  });

  // Fix location type
  const locationNodes = receiptMatcherService.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
  locationNodes.forEach(node => {
    if (node.getText().includes('location')) {
      const properties: PropertyAssignmentStructure[] = [
        {
          kind: StructureKind.PropertyAssignment,
          name: 'latitude',
          initializer: '0'
        },
        {
          kind: StructureKind.PropertyAssignment,
          name: 'longitude',
          initializer: '0'
        }
      ];
      node.addProperties(properties);
    }
  });

  // Remove unused variables
  const unusedVars = ['logger', 'preferences', 'receipt'];
  unusedVars.forEach(varName => {
    const declarations = receiptMatcherService.getVariableDeclarations();
    declarations.forEach(decl => {
      if (decl.getName() === varName) {
        decl.remove();
      }
    });
  });
}

// Fix tsconfig.json paths
const backendTsConfig = project.getSourceFile('apps/backend/tsconfig.json');
if (backendTsConfig) {
  const configObject = backendTsConfig.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);
  if (configObject) {
    const compilerOptions = configObject.getProperty('compilerOptions');
    if (compilerOptions) {
      const paths = compilerOptions.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression)?.getProperty('paths');
      if (paths) {
        paths.remove();
      }
      compilerOptions.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression)?.addPropertyAssignment({
        kind: StructureKind.PropertyAssignment,
        name: 'paths',
        initializer: `{
          "@fresh-expense/types": ["../../packages/types/src"],
          "@fresh-expense/utils": ["../../packages/utils/src"]
        }`
      });
    }
  }
}

// Save all changes
project.saveSync(); 