"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const path = __importStar(require("path"));
// Types that should be imported from @fresh-expense/types
const CENTRALIZED_TYPES = [
    'User',
    'AuthResponse',
    'UserSettings',
    'ApiError',
    'Transaction',
    'TransactionAmount',
    'TransactionMerchant',
    'TransactionLocation',
    'TransactionMetrics',
    'Receipt',
    'ReceiptLocation',
    'ReceiptOCRData',
    'ReceiptMetadata',
    'Merchant',
    'Category',
    'ExpenseCategory',
    'ExpenseCategoryType',
    'CategoryDisplay',
    'ApiResponse',
    'PaginatedResponse',
    'SortOptions',
    'FilterOptions',
    'ProcessedData',
    'ExtractedReceiptData',
    'VerificationResult',
];
async function updateImports() {
    try {
        console.log('Initializing project...');
        const project = new ts_morph_1.Project({
            tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
        });
        // Add source files
        console.log('Adding source files...');
        const patterns = [
            'apps/backend/src/**/*.ts',
            'apps/frontend/src/**/*.ts',
            'apps/frontend/src/**/*.tsx',
            'packages/utils/src/**/*.ts',
        ];
        project.addSourceFilesAtPaths(patterns);
        const files = project.getSourceFiles();
        console.log(`Found ${files.length} source files`);
        let updatedFiles = 0;
        let updatedImports = 0;
        for (const file of files) {
            const imports = file.getImportDeclarations();
            let fileUpdated = false;
            const typesToMove = [];
            for (const imp of imports) {
                const namedImports = imp.getNamedImports();
                const typesToRemove = namedImports.filter(ni => CENTRALIZED_TYPES.includes(ni.getName()));
                if (typesToRemove.length > 0) {
                    // Store the names before removing
                    typesToRemove.forEach(t => typesToMove.push(t.getName()));
                    // Remove these types from current import
                    typesToRemove.forEach(t => t.remove());
                    // If no named imports left, remove the entire import
                    if (imp.getNamedImports().length === 0) {
                        imp.remove();
                    }
                    fileUpdated = true;
                }
            }
            if (typesToMove.length > 0) {
                // Add import from @fresh-expense/types
                const typesImport = file.getImportDeclaration(i => i.getModuleSpecifierValue() === '@fresh-expense/types');
                if (!typesImport) {
                    file.addImportDeclaration({
                        moduleSpecifier: '@fresh-expense/types',
                        namedImports: typesToMove,
                    });
                }
                else {
                    typesImport.addNamedImports(typesToMove);
                }
                updatedImports += typesToMove.length;
            }
            if (fileUpdated) {
                file.saveSync();
                updatedFiles++;
            }
        }
        console.log('\nUpdate complete:');
        console.log(`- Updated ${updatedFiles} files`);
        console.log(`- Moved ${updatedImports} type imports to @fresh-expense/types`);
    }
    catch (error) {
        console.error('Error updating imports:', error);
        if (error instanceof Error) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}
// Run the update
updateImports().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=update-imports.js.map